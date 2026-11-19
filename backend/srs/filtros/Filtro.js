export class Filtro {
  /** @param {import('../models/Receta.js').Receta} _receta */
  cumple(_receta) {
    throw new Error("Método no implementado: cumple");
  }
}

// Aquí se aplica polimorfismo por la herencia de un método abstracto hacía sus clases hijas
