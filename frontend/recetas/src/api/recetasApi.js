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

const MENSAJE_SIN_CONEXION =
  "No se pudo conectar con el servidor. Verifique que el backend esté encendido e intente de nuevo.";

/** Mensajes para cuando el backend no envía uno propio. */
const MENSAJES_POR_ESTADO = {
  400: "La información enviada no es válida. Revise los datos e intente de nuevo.",
  404: "La receta solicitada no existe o ya fue eliminada.",
  408: "El servidor tardó demasiado en responder. Intente de nuevo.",
  413: "La información enviada es demasiado grande. Reduzca el contenido e intente de nuevo.",
  429: "Se hicieron demasiadas solicitudes seguidas. Espere un momento e intente de nuevo.",
  500: "Ocurrió un problema interno en el servidor. Intente de nuevo en unos momentos.",
  502: MENSAJE_SIN_CONEXION,
  503: "El servidor no está disponible en este momento. Intente de nuevo en unos minutos.",
  504: MENSAJE_SIN_CONEXION,
};

/**
 * Elige el mensaje para el usuario: primero el que envía el backend (es el más
 * específico) y si no hay, uno según el código HTTP.
 */
function mensajeDeError(estado, datos) {
  if (datos?.error?.mensaje) return datos.error.mensaje;
  // Sin cuerpo JSON y con 500: es el proxy de desarrollo avisando que el
  // backend no responde, no un error del backend.
  if (estado === 500 && datos === null) return MENSAJE_SIN_CONEXION;
  if (MENSAJES_POR_ESTADO[estado]) return MENSAJES_POR_ESTADO[estado];
  if (estado >= 500) return MENSAJES_POR_ESTADO[500];
  return "No se pudo procesar la solicitud. Revise la información e intente de nuevo.";
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
    throw new ErrorApi(MENSAJE_SIN_CONEXION, 0);
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
      mensajeDeError(respuesta.status, datos),
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
