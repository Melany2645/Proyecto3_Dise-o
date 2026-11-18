import { Ingrediente } from "./Ingredientes.js";
import { normalizar } from "../utilidades/texto.js";

/**
 * Una receta de repostería. Los dos componentes importantes de una receta, las porciones y los ingredintes
 *  porciones: cuántas porciones rinde la receta con las cantidades indicadas
 *  ingredientes: cada uno con su cantidad y unidad de medida.
 */
export class Receta {
  constructor({
    id,
    nombre,
    porciones,
    ingredientes,
    creadaEn,
    actualizadaEn,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.porciones = porciones;
    this.ingredientes = ingredientes.map((i) =>
      i instanceof Ingrediente ? i : new Ingrediente(i),
    );
    this.creadaEn = creadaEn;
    this.actualizadaEn = actualizadaEn;
  }

  /**
   * La receta es quien conoce sus datos,
   * por eso ella misma sabe modificarse y responder a las búsquedas.
   */
  modificar({ nombre, porciones, ingredientes }, ahora = new Date()) {
    this.nombre = nombre;
    this.porciones = porciones;
    this.ingredientes = ingredientes.map((i) => new Ingrediente(i));
    this.actualizadaEn = ahora.toISOString();
  }

  coincideConNombre(texto) {
    return normalizar(this.nombre).includes(normalizar(texto));
  }

  tieneIngrediente(texto) {
    return this.ingredientes.some((ingrediente) =>
      ingrediente.contieneTexto(texto),
    );
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      porciones: this.porciones,
      ingredientes: this.ingredientes.map((i) => i.toJSON()),
      creadaEn: this.creadaEn,
      actualizadaEn: this.actualizadaEn,
    };
  }
}
