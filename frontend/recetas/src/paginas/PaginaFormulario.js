import { useAnunciar } from "../accesibilidad/Anunciador";
import { TituloPagina } from "../accesibilidad/TituloPagina";
import { recetasApi } from "../api/recetasApi";
import { Cargando, MensajeError } from "../componentes/Estados";
import { FormularioReceta } from "../componentes/FormularioReceta";
import { useSolicitud } from "../hooks/useSolicitud";
import { navegar, rutas } from "../navegacion/rutas";

/**
 * Página para crear (sin id) o editar (con id) una receta.
 */
export function PaginaFormulario({ id }) {
  const esEdicion = id !== undefined;
  const anunciar = useAnunciar();

  const { estado, datos: receta, error, recargar } = useSolicitud(
    (signal) => (esEdicion ? recetasApi.obtener(id, signal) : Promise.resolve(null)),
    [id],
  );

  const guardar = async (cuerpo) => {
    const guardada = esEdicion
      ? await recetasApi.actualizar(id, cuerpo)
      : await recetasApi.crear(cuerpo);
    anunciar(
      esEdicion
        ? `Los cambios en "${guardada.nombre}" se guardaron correctamente.`
        : `La receta "${guardada.nombre}" se creó correctamente.`,
    );
    navegar(rutas.detalle(guardada.id));
  };

  if (!esEdicion) {
    return (
      <>
        <MigaDePan actual="Nueva receta" />
        <TituloPagina>Nueva receta</TituloPagina>
        <FormularioReceta textoGuardar="Crear receta" hrefCancelar={rutas.lista()} alGuardar={guardar} />
      </>
    );
  }

  const noEncontrada = estado === "error" && error?.estado === 404;

  return (
    <>
      <MigaDePan receta={receta} actual="Editar" />
      <TituloPagina tituloDocumento={receta ? `Editar ${receta.nombre}` : "Editar receta"}>
        Editar receta
      </TituloPagina>

      {estado === "cargando" && !receta && <Cargando texto="Cargando receta…" />}

      {noEncontrada && (
        <div className="estado-vacio">
          <p>La receta que intenta editar no existe o fue eliminada.</p>
          <a href={rutas.lista()} className="btn btn-primary">
            Volver a la lista de recetas
          </a>
        </div>
      )}

      {estado === "error" && !noEncontrada && (
        <MensajeError titulo="No se pudo cargar la receta." error={error} alReintentar={recargar} />
      )}

      {receta && (
        <FormularioReceta
          receta={receta}
          textoGuardar="Guardar cambios"
          hrefCancelar={rutas.detalle(receta.id)}
          alGuardar={guardar}
        />
      )}
    </>
  );
}

function MigaDePan({ receta, actual }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <a href={rutas.lista()}>Recetas</a>
        </li>
        {receta && (
          <li className="breadcrumb-item">
            <a href={rutas.detalle(receta.id)}>{receta.nombre}</a>
          </li>
        )}
        <li className="breadcrumb-item active" aria-current="page">
          {actual}
        </li>
      </ol>
    </nav>
  );
}
