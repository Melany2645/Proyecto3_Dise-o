import { forwardRef } from "react";

import { pluralizar } from "../utilidades/formato";

/**
 * Resumen de errores al enviar un formulario
 * Recibe el foco al aparecer, así el lector de pantalla lee cuántos errores
 * hay; cada error es un enlace que lleva el foco al campo correspondiente
 * (WCAG 3.3.1 Identificación de errores, 3.3.3 Sugerencia ante errores).
 *
 * @param {{errores: {campo: string, mensaje: string, idCampo: string}[]}} props
 */
export const ResumenErrores = forwardRef(function ResumenErrores(
  { errores },
  referencia,
) {
  if (errores.length === 0) return null;

  const irAlCampo = (evento, idCampo) => {
    // El hash de la URL se usa para navegar; se mueve el foco sin cambiarlo.
    evento.preventDefault();
    const campo = document.getElementById(idCampo);
    campo?.focus();
    campo?.scrollIntoView?.({ block: "center" });
  };

  return (
    <div
      ref={referencia}
      tabIndex={-1}
      className="resumen-errores"
      aria-labelledby="resumen-errores-titulo"
      role="group"
    >
      <h2 id="resumen-errores-titulo" className="h5">
        No se pudo guardar: {pluralizar(errores.length, "error", "errores")} en
        el formulario
      </h2>
      <ul className="mb-0">
        {errores.map(({ campo, mensaje, idCampo }) => (
          <li key={campo}>
            <a
              href={`#${idCampo}`}
              onClick={(evento) => irAlCampo(evento, idCampo)}
            >
              {mensaje}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
