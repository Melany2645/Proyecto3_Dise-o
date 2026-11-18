import { normalizar } from "../utils/texto.js";

/**
 * Un ingrediente de una receta: qué es, cuánto se usa y en qué medida.
 */
export class Ingrediente {
  constructor({ nombre, cantidad, unidad }) {
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.unidad = unidad;
    Object.freeze(this);
  }

  contieneTexto(texto) {
    return normalizar(this.nombre).includes(normalizar(texto));
  }

  toJSON() {
    return {
      nombre: this.nombre,
      cantidad: this.cantidad,
      unidad: this.unidad,
    };
  }
}
