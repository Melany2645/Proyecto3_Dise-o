import { useState } from "react";

import { useAnunciar } from "../accesibilidad/Anunciador";
import { TituloPagina } from "../accesibilidad/TituloPagina";
import { recetasApi } from "../api/recetasApi";
import { AjustePorciones, interpretarPorciones } from "../componentes/AjustePorciones";
import { DialogoConfirmacion } from "../componentes/DialogoConfirmacion";
import { Cargando, MensajeError } from "../componentes/Estados";
import { useSolicitud } from "../hooks/useSolicitud";
import { navegar, rutas } from "../navegacion/rutas";
import { formatearFecha, formatearNumero, pluralizar } from "../utilidades/formato";

export function PaginaDetalle({ id }) {
  const anunciar = useAnunciar();
  const { estado, datos: receta, error, recargar } = useSolicitud(
    (signal) => recetasApi.obtener(id, signal),
    [id],
  );

  const [textoPorciones, setTextoPorciones] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);

  const noEncontrada = estado === "error" && error?.estado === 404;
  const titulo = receta
    ? receta.nombre
    : noEncontrada
      ? "Receta no encontrada"
      : estado === "error"
        ? "Receta no disponible"
        : "Cargando receta…";

  const eliminar = async () => {
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await recetasApi.eliminar(receta.id);
      anunciar(`La receta "${receta.nombre}" se eliminó correctamente.`);
      navegar(rutas.lista());
    } catch (e) {
      setErrorEliminar(e);
      setEliminando(false);
    }
  };

  const cerrarDialogo = () => {
    setDialogoAbierto(false);
    setErrorEliminar(null);
  };

  return (
    <>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href={rutas.lista()}>Recetas</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {receta?.nombre ?? "Detalle"}
          </li>
        </ol>
      </nav>

      <TituloPagina tituloDocumento={titulo}>{titulo}</TituloPagina>

      {estado === "cargando" && !receta && <Cargando texto="Cargando receta…" />}

      {noEncontrada && (
        <div className="estado-vacio">
          <p>La receta que busca no existe o fue eliminada.</p>
          <a href={rutas.lista()} className="btn btn-primary">
            Volver a la lista de recetas
          </a>
        </div>
      )}

      {estado === "error" && !noEncontrada && (
        <MensajeError titulo="No se pudo cargar la receta." error={error} alReintentar={recargar} />
      )}

      {receta && (
        <ContenidoReceta
          receta={receta}
          textoPorciones={textoPorciones ?? String(receta.porciones)}
          alCambiarPorciones={setTextoPorciones}
          alEliminar={() => setDialogoAbierto(true)}
        />
      )}

      {receta && (
        <DialogoConfirmacion
          abierto={dialogoAbierto}
          titulo="¿Eliminar esta receta?"
          mensaje={`Se eliminará "${receta.nombre}" de forma permanente. Esta acción no se puede deshacer.`}
          textoConfirmar="Sí, eliminar"
          textoProcesando="Eliminando…"
          procesando={eliminando}
          error={errorEliminar}
          alConfirmar={eliminar}
          alCancelar={cerrarDialogo}
        />
      )}
    </>
  );
}

function ContenidoReceta({ receta, textoPorciones, alCambiarPorciones, alEliminar }) {
  const porciones = interpretarPorciones(textoPorciones) ?? receta.porciones;
  const factor = porciones / receta.porciones;
  const ajustada = factor !== 1;

  return (
    <>
      <dl className="datos-receta">
        <div>
          <dt>Rinde</dt>
          <dd>{pluralizar(receta.porciones, "porción", "porciones")}</dd>
        </div>
        <div>
          <dt>Ingredientes</dt>
          <dd>{receta.ingredientes.length}</dd>
        </div>
        <div>
          <dt>Creada</dt>
          <dd>
            <time dateTime={receta.creadaEn}>{formatearFecha(receta.creadaEn)}</time>
          </dd>
        </div>
        {receta.actualizadaEn !== receta.creadaEn && (
          <div>
            <dt>Última modificación</dt>
            <dd>
              <time dateTime={receta.actualizadaEn}>{formatearFecha(receta.actualizadaEn)}</time>
            </dd>
          </div>
        )}
      </dl>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <a href={rutas.editar(receta.id)} className="btn btn-primary">
          Editar receta
        </a>
        <button type="button" className="btn btn-outline-danger" onClick={alEliminar}>
          Eliminar receta
        </button>
      </div>

      <section aria-labelledby="titulo-ingredientes" className="mb-4">
        <h2 id="titulo-ingredientes" className="h4">
          Ingredientes
        </h2>

        <AjustePorciones
          texto={textoPorciones}
          alCambiar={alCambiarPorciones}
          original={receta.porciones}
        />

        {/* Resumen corto que se anuncia al cambiar las porciones; la tabla no
            es una región viva para no leer todas las filas en cada cambio. */}
        <p className="resumen-ajuste" aria-live="polite" aria-atomic="true">
          {ajustada
            ? `Cantidades ajustadas para ${pluralizar(porciones, "porción", "porciones")} (×${formatearNumero(factor)} de la receta original).`
            : `Cantidades originales para ${pluralizar(porciones, "porción", "porciones")}.`}
        </p>

        <div className="table-responsive">
          <table className="table tabla-ingredientes align-middle">
            <caption>
              Ingredientes para {pluralizar(porciones, "porción", "porciones")}
            </caption>
            <thead>
              <tr>
                <th scope="col">Ingrediente</th>
                <th scope="col" className="text-end">
                  Cantidad
                </th>
                <th scope="col">Unidad</th>
                {ajustada && (
                  <th scope="col" className="text-end">
                    Cantidad original
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {receta.ingredientes.map((ingrediente, indice) => (
                <tr key={`${ingrediente.nombre}-${indice}`}>
                  <th scope="row" className="fw-normal">
                    {ingrediente.nombre}
                  </th>
                  <td className="text-end fw-semibold">
                    {formatearNumero(ingrediente.cantidad * factor)}
                  </td>
                  <td>{ingrediente.unidad}</td>
                  {ajustada && (
                    <td className="text-end text-body-secondary">
                      {formatearNumero(ingrediente.cantidad)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
