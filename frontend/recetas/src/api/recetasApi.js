/**
 * Cliente HTTP del backend de recetas.
 * Centraliza las llamadas a la API y convierte las respuestas de error
 * ({ error: { mensaje, detalles } }) en un ErrorApi que la interfaz puede mostrar.
 */
const URL_BASE = process.env.REACT_APP_API_URL || "/api/recetas";

export class ErrorApi extends Error {
  /**
   * @param {string} mensaje mensaje legible para el usuario
   * @param {number} estado código HTTP (0 si no hubo conexión)
   * @param {{campo: string, mensaje: string}[]} detalles errores por campo
   */
  constructor(mensaje, estado, detalles = []) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
    this.detalles = detalles;
  }
}

async function solicitar(ruta, { metodo = "GET", cuerpo, signal } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${URL_BASE}${ruta}`, {
      method: metodo,
      headers: cuerpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ErrorApi(
      "No se pudo conectar con el servidor. Verifique que el backend esté encendido.",
      0,
    );
  }

  if (respuesta.status === 204) return null;

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    // Respuesta sin cuerpo JSON: se maneja abajo según el estado.
  }

  if (!respuesta.ok) {
    throw new ErrorApi(
      datos?.error?.mensaje ?? `Ocurrió un error inesperado (código ${respuesta.status}).`,
      respuesta.status,
      datos?.error?.detalles ?? [],
    );
  }
  return datos;
}

function armarConsulta(parametros) {
  const consulta = new URLSearchParams();
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
      consulta.set(clave, String(valor).trim());
    }
  });
  const texto = consulta.toString();
  return texto ? `?${texto}` : "";
}

export const recetasApi = {
  /** @returns {Promise<{datos: object[], paginacion: object}>} */
  listar({ pagina, nombre, ingrediente } = {}, signal) {
    return solicitar(`/${armarConsulta({ pagina, nombre, ingrediente })}`, { signal });
  },
  /** @returns {Promise<{datos: object[]}>} */
  recientes(signal) {
    return solicitar("/recientes", { signal });
  },
  obtener(id, signal) {
    return solicitar(`/${encodeURIComponent(id)}`, { signal });
  },
  crear(receta) {
    return solicitar("/", { metodo: "POST", cuerpo: receta });
  },
  actualizar(id, receta) {
    return solicitar(`/${encodeURIComponent(id)}`, { metodo: "PUT", cuerpo: receta });
  },
  eliminar(id) {
    return solicitar(`/${encodeURIComponent(id)}`, { metodo: "DELETE" });
  },
};
