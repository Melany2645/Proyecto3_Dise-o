/**
 * Agrupa filtros y acepta una receta solo si esta cumple todos sus criterios.
 */

import { Filtro } from "./Filtro.js";

export class FiltroCompuesto extends Filtro {
  #filtros;

  /** @param {Filtro[]} filtros */
  constructor(filtros) {
    super();
    this.#filtros = filtros;
  }

  cumple(receta) {
    return this.#filtros.every((filtro) => filtro.cumple(receta));
  }
}
