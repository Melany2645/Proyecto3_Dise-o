/**
 * Jerarquía de errores de la aplicación (Polimorfismo).
 * Cada error sabe su código HTTP y cómo convertirse en respuesta, así el
 * manejador de errores no necesita preguntar de qué tipo es cada uno.
 */
export class ErrorApp extends Error {
  constructor(mensaje, estado = 500, detalles = undefined) {
    super(mensaje);
    this.name = this.constructor.name;
    this.estado = estado;
    this.detalles = detalles;
  }

  /** Cuerpo JSON que se envía al cliente. */
  aRespuesta() {
    return {
      error: {
        mensaje: this.message,
        ...(this.detalles && { detalles: this.detalles }),
      },
    };
  }
}

export class ErrorValidacion extends ErrorApp {
  /** @param {{campo: string, mensaje: string}[]} detalles */
  constructor(detalles) {
    super("Los datos enviados no son válidos.", 400, detalles);
  }
}

export class ErrorNoEncontrado extends ErrorApp {
  constructor(recurso = "Recurso") {
    super(`${recurso} no encontrado.`, 404);
  }
}
