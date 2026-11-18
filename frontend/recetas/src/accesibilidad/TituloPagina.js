import { createContext, useContext, useEffect, useRef } from "react";

const NOMBRE_SITIO = "Recetario";

/**
 * Indica si la página se mostró por una navegación (no por la carga inicial).
 * App lo pone en true al cambiar de ruta; el título lo consume al montarse.
 */
export const ContextoNavegacion = createContext({ current: false });

/**
 * Encabezado <h1> de cada página. Además:
 *  - actualiza document.title (WCAG 2.4.2, título de página);
 *  - al llegar por navegación, recibe el foco para que el lector de pantalla
 *    anuncie la página nueva y el teclado continúe desde ahí (WCAG 2.4.3).
 */
export function TituloPagina({ children, tituloDocumento }) {
  const referencia = useRef(null);
  const debeEnfocar = useContext(ContextoNavegacion);
  const texto = tituloDocumento ?? (typeof children === "string" ? children : "");

  useEffect(() => {
    document.title = texto ? `${texto} · ${NOMBRE_SITIO}` : NOMBRE_SITIO;
  }, [texto]);

  useEffect(() => {
    if (debeEnfocar.current) {
      debeEnfocar.current = false;
      referencia.current?.focus();
    }
  }, [debeEnfocar]);

  return (
    <h1 ref={referencia} tabIndex={-1} className="titulo-pagina">
      {children}
    </h1>
  );
}
