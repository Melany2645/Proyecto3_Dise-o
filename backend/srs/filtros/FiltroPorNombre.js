import { Filtro } from "./Filtro.js";

/**
 * Implementa el filtro que busca recetas cuyo nombre contiene el texto indicado.
 */
export class FiltroPorNombre extends Filtro {
  #texto;

  constructor(texto) {
    super();
    this.#texto = texto;
  }

  cumple(receta) {
    return receta.coincideConNombre(this.#texto);
  }
}
