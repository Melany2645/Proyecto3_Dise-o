import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Configuración central de la aplicación.
 * Aquí se define las páginas
 */
export const config = Object.freeze({
  puerto: Number(process.env.PORT) || 3000,
  directorioDatos: process.env.DATA_DIR || path.join(raiz, "data"),
  recetasPorPagina: 5,
  cantidadRecientes: 3,
  historialMaximo: 10,
});
