import {
  ErrorApp,
  ErrorCuerpoDemasiadoGrande,
  ErrorCuerpoInvalido,
  ErrorInterno,
} from "../errores/errores.js";

/** Errores que lanza Express y su equivalente en la jerarquía de ErrorApp. */
const ERRORES_DE_EXPRESS = {
  "entity.parse.failed": () => new ErrorCuerpoInvalido(),
  "entity.too.large": () => new ErrorCuerpoDemasiadoGrande(),
};

/** Convierte cualquier error en un ErrorApp. */
function traducirError(error) {
  if (error instanceof ErrorApp) return error;
  const crear = ERRORES_DE_EXPRESS[error?.type];
  return crear ? crear() : new ErrorInterno(error);
}

/** Respuesta para rutas que no existen. */
export function rutaNoEncontrada(req, res) {
  res.status(404).json({
    error: { mensaje: `La ruta ${req.method} ${req.originalUrl} no existe.` },
  });
}

// eslint-disable-next-line no-unused-vars
export function manejadorErrores(error, _req, res, _next) {
  const errorApp = traducirError(error);
  if (errorApp instanceof ErrorInterno) console.error(errorApp.causa);
  res.status(errorApp.estado).json(errorApp.aRespuesta());
}
