import { useId } from "react";

export const MAX_PORCIONES = 1000;

/** Devuelve el número de porciones si el texto es válido, o null. */
export function interpretarPorciones(texto) {
  const numero = Number(texto);
  return Number.isInteger(numero) && numero >= 1 && numero <= MAX_PORCIONES ? numero : null;
}

/**
 * Control para elegir cuántas porciones se quieren preparar.
 * - Campo numérico con <label> visible y botones −/+ con nombre accesible.
 * - Si el valor no es válido se marca con aria-invalid y se explica el
 *   problema con un mensaje asociado por aria-describedby (WCAG 3.3.1).
 *
 * @param {{texto: string, alCambiar: (texto: string) => void, original: number}} props
 */
export function AjustePorciones({ texto, alCambiar, original }) {
  const id = useId();
  const idCampo = `${id}-porciones`;
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;

  const valor = interpretarPorciones(texto);
  const invalido = valor === null;
  const base = valor ?? original;

  return (
    <div className="ajuste-porciones">
      <label htmlFor={idCampo} className="form-label fw-semibold">
        Porciones a preparar
      </label>
      <div className="d-flex flex-wrap align-items-center gap-2">
        <div className="input-group" style={{ maxWidth: "13rem" }}>
          <button
            type="button"
            className="btn btn-outline-primary"
            aria-label="Disminuir una porción"
            aria-controls={idCampo}
            onClick={() => base > 1 && alCambiar(String(base - 1))}
            aria-disabled={base <= 1 || undefined}
          >
            <span aria-hidden="true">−</span>
          </button>
          <input
            id={idCampo}
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_PORCIONES}
            step={1}
            className={`form-control text-center${invalido ? " is-invalid" : ""}`}
            value={texto}
            onChange={(evento) => alCambiar(evento.target.value)}
            aria-invalid={invalido || undefined}
            aria-describedby={invalido ? `${idError} ${idAyuda}` : idAyuda}
          />
          <button
            type="button"
            className="btn btn-outline-primary"
            aria-label="Aumentar una porción"
            aria-controls={idCampo}
            onClick={() => base < MAX_PORCIONES && alCambiar(String(base + 1))}
            aria-disabled={base >= MAX_PORCIONES || undefined}
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
        {valor !== original && (
          <button type="button" className="btn btn-link" onClick={() => alCambiar(String(original))}>
            Volver a {original}
          </button>
        )}
      </div>

      {invalido && (
        <p id={idError} className="texto-error mt-2 mb-0">
          Escriba un número entero entre 1 y {MAX_PORCIONES}.
        </p>
      )}
      <p id={idAyuda} className="form-text mb-0">
        La receta original rinde {original}. Las cantidades se recalculan automáticamente.
      </p>
    </div>
  );
}
