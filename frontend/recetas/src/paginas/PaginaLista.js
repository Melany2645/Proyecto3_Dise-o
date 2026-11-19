import { useEffect, useRef } from "react";

import { useAnunciar } from "../accesibilidad/Anunciador";
import { TituloPagina } from "../accesibilidad/TituloPagina";
import { recetasApi } from "../api/recetasApi";
import { Cargando, MensajeError } from "../componentes/Estados";
import { FormularioBusqueda } from "../componentes/FormularioBusqueda";
import { Paginacion } from "../componentes/Paginacion";
import { RecetasRecientes } from "../componentes/RecetasRecientes";
import { TarjetaReceta } from "../componentes/TarjetaReceta";
import { useSolicitud } from "../hooks/useSolicitud";
import { hashActual, reemplazar, rutas } from "../navegacion/rutas";
import { pluralizar } from "../utilidades/formato";

function leerPagina(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 1 ? numero : 1;
}

export function PaginaLista({ consulta }) {
  const nombre = consulta.nombre ?? "";
  const ingrediente = consulta.ingrediente ?? "";
  const pagina = leerPagina(consulta.pagina);
  const hayFiltros = nombre !== "" || ingrediente !== "";

  const anunciar = useAnunciar();
  const tituloResultados = useRef(null);
  const enfocarResultados = useRef(false);
  const esPrimeraCarga = useRef(true);

  const { estado, datos, error, recargar } = useSolicitud(
    (signal) => recetasApi.listar({ pagina, nombre, ingrediente }, signal),
    [pagina, nombre, ingrediente],
  );

  const recetas = datos?.datos ?? [];
  const paginacion = datos?.paginacion;

  useEffect(() => {
    if (estado !== "listo" || !paginacion) return;
    if (esPrimeraCarga.current) {
      esPrimeraCarga.current = false;
      return;
    }
    const total = pluralizar(paginacion.totalElementos, "receta encontrada", "recetas encontradas");
    anunciar(
      paginacion.totalPaginas > 1
        ? `${total}. Página ${paginacion.paginaActual} de ${paginacion.totalPaginas}.`
        : `${total}.`,
    );
    if (enfocarResultados.current) {
      enfocarResultados.current = false;
      tituloResultados.current?.focus();
    }
  }, [estado, paginacion, anunciar]);

  const buscar = (criterios, { inmediata }) => {
    esPrimeraCarga.current = false;
    const destino = rutas.lista(criterios);
    if (hashActual() !== destino) reemplazar(destino);
    else if (inmediata) recargar();
  };

  const hrefDePagina = (numero) =>
    rutas.lista({ nombre, ingrediente, pagina: numero > 1 ? numero : undefined });

  const resumen = paginacion
    ? `${pluralizar(paginacion.totalElementos, "receta", "recetas")}` +
      (paginacion.totalPaginas > 1
        ? ` · página ${paginacion.paginaActual} de ${paginacion.totalPaginas}`
        : "")
    : "";

  return (
    <>
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
        <TituloPagina>Recetas</TituloPagina>
        <a href={rutas.nueva()} className="btn btn-primary">
          Nueva receta
        </a>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <FormularioBusqueda nombre={nombre} ingrediente={ingrediente} alBuscar={buscar} />

          <section
            id="resultados-recetas"
            aria-labelledby="titulo-resultados"
            aria-busy={estado === "cargando"}
          >
            <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-3">
              <h2 id="titulo-resultados" ref={tituloResultados} tabIndex={-1} className="h4 mb-0">
                {hayFiltros ? "Resultados de la búsqueda" : "Todas las recetas"}
              </h2>
              {resumen && <p className="mb-0 text-body-secondary">{resumen}</p>}
            </div>

            {estado === "cargando" && !datos && <Cargando texto="Cargando recetas…" />}
            {estado === "error" && (
              <MensajeError
                titulo="No se pudieron cargar las recetas."
                error={error}
                alReintentar={recargar}
              />
            )}

            {datos && recetas.length === 0 && (
              <div className="estado-vacio">
                {hayFiltros ? (
                  <>
                    <p>No hay recetas que coincidan con la búsqueda.</p>
                    <a href={rutas.lista()}>Ver todas las recetas</a>
                  </>
                ) : paginacion?.totalElementos > 0 ? (
                  <>
                    <p>Esta página no existe.</p>
                    <a href={rutas.lista()}>Ir a la primera página</a>
                  </>
                ) : (
                  <>
                    <p>Todavía no hay recetas guardadas.</p>
                    <a href={rutas.nueva()} className="btn btn-primary">
                      Crear la primera receta
                    </a>
                  </>
                )}
              </div>
            )}

            {recetas.length > 0 && (
              <ul className="row row-cols-1 row-cols-md-2 g-3 list-unstyled">
                {recetas.map((receta) => (
                  <li key={receta.id} className="col">
                    <TarjetaReceta
                      receta={receta}
                      busquedaNombre={nombre}
                      busquedaIngrediente={ingrediente}
                    />
                  </li>
                ))}
              </ul>
            )}

            {paginacion && (
              <Paginacion
                paginaActual={paginacion.paginaActual}
                totalPaginas={paginacion.totalPaginas}
                hrefDePagina={hrefDePagina}
                alCambiar={() => {
                  enfocarResultados.current = true;
                }}
              />
            )}
          </section>
        </div>

        <div className="col-lg-4">
          <RecetasRecientes />
        </div>
      </div>
    </>
  );
}
