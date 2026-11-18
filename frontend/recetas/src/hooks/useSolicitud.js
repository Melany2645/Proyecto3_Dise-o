import { useCallback, useEffect, useState } from "react";

/**
 * Ejecuta una petición a la API cada vez que cambian las dependencias.
 * Cancela la petición anterior (AbortController) para que una respuesta
 * vieja nunca pise a una nueva, y conserva los datos previos mientras carga
 * para evitar parpadeos.
 *
 * @param {(signal: AbortSignal) => Promise<any>} solicitud
 * @param {any[]} dependencias
 */
export function useSolicitud(solicitud, dependencias) {
  const [resultado, setResultado] = useState({ estado: "cargando", datos: null, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    setResultado((previo) => ({ ...previo, estado: "cargando", error: null }));

    solicitud(control.signal).then(
      (datos) => setResultado({ estado: "listo", datos, error: null }),
      (error) => {
        if (error.name !== "AbortError") {
          setResultado({ estado: "error", datos: null, error });
        }
      },
    );

    return () => control.abort();
    // La función `solicitud` se recrea en cada render; las dependencias reales
    // las indica quien usa el hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { ...resultado, recargar };
}
