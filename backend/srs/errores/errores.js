export class ErrorApp extends Error {
  constructor(mensaje, estado = 500, detalles = undefined) {
    super(mensaje);
    this.name = this.constructor.name;
    this.estado = estado;
    this.detalles = detalles;
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
