/**
 * Mensajes de estado reutilizables (cargando / error / vacío).
 */

/** Indicador de carga: el texto oculto es lo que lee el lector de pantalla. */
export function Cargando({ texto = "Cargando…" }) {
  return (
    <div role="status" className="d-flex align-items-center gap-2 my-3">
      <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
      <span>{texto}</span>
    </div>
  );
}

/**
 * Error con opción de reintentar. role="alert" hace que se anuncie de
 * inmediato, aunque el foco esté en otro lugar.
 */
export function MensajeError({ error, alReintentar, titulo = "No se pudo completar la operación." }) {
  return (
    <div role="alert" className="alert alert-danger my-3">
      <p className="fw-bold mb-1">{titulo}</p>
      <p className="mb-2">{error?.message}</p>
      {alReintentar && (
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={alReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}
