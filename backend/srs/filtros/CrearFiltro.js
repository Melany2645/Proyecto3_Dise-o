/**
 * Convierte los criterios de búsqueda recibidos en filtros concretos y compuestos.
 */

import { FiltroCompuesto } from "./FiltroCompuesto.js";
import { FiltroPorIngrediente } from "./FiltroPorIngrediente.js";
import { FiltroPorNombre } from "./FiltroPorNombre.js";

const CATALOGO_POR_DEFECTO = Object.freeze({
  nombre: FiltroPorNombre,
  ingrediente: FiltroPorIngrediente,
});

export class ConstructorDeFiltros {
  #catalogo;

  constructor(catalogo = CATALOGO_POR_DEFECTO) {
    this.#catalogo = catalogo;
  }

  /** @param {Record<string, unknown>} criterios @returns {FiltroCompuesto} */
  construir(criterios = {}) {
    const filtros = Object.entries(criterios)
      .filter(
        ([criterio, valor]) =>
          criterio in this.#catalogo &&
          typeof valor === "string" &&
          valor.trim() !== "",
      )
      .map(([criterio, valor]) => new this.#catalogo[criterio](valor.trim()));

    return new FiltroCompuesto(filtros);
  }
}
