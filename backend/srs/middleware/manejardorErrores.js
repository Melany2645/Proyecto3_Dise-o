import { ErrorApp } from "../errores/errores.js";

/** Respuesta para rutas que no existen. */
export function rutaNoEncontrada(req, res) {
  res.status(404).json({
    error: { mensaje: `La ruta ${req.method} ${req.originalUrl} no existe.` },
  });
}

// eslint-disable-next-line no-unused-vars
export function manejadorErrores(error, _req, res, _next) {
  if (error instanceof ErrorApp) {
    return res.status(error.estado).json({
      error: {
        mensaje: error.message,
        ...(error.detalles && { detalles: error.detalles }),
      },
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { mensaje: "El cuerpo de la petición no es un JSON válido." },
    });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: { mensaje: "El cuerpo de la petición es demasiado grande." },
    });
  }

  console.error(error);
  res.status(500).json({ error: { mensaje: "Error interno del servidor." } });
}
