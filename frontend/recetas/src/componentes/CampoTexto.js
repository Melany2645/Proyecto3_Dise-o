/**
 * Campo de formulario con etiqueta, ayuda y error accesibles:
 *  - <label> visible asociado con htmlFor.
 *  - aria-required en lugar de `required` (se usa noValidate en el formulario
 *    para mostrar mensajes propios en español, no las burbujas del navegador).
 *  - Con error: aria-invalid + mensaje unido por aria-describedby. El mensaje
 *    lleva el prefijo "Error:" (oculto visualmente) para no depender del color.
 */
export function CampoTexto({
  id,
  etiqueta,
  valor,
  alCambiar,
  error,
  ayuda,
  className = "",
  ...resto
}) {
  const idAyuda = ayuda ? `${id}-ayuda` : null;
  const idError = error ? `${id}-error` : null;
  const descripcion = [idError, idAyuda].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">
        {etiqueta}
      </label>
      <input
        id={id}
        className={`form-control${error ? " is-invalid" : ""}`}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={descripcion}
        {...resto}
      />
      {error && (
        <p id={idError} className="texto-error small mt-1 mb-0">
          <span className="visually-hidden">Error: </span>
          {error}
        </p>
      )}
      {ayuda && (
        <p id={idAyuda} className="form-text mb-0">
          {ayuda}
        </p>
      )}
    </div>
  );
}
