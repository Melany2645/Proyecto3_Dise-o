import { Filtro } from "./Filtro.js";

/**
 * Implementa el filtro que busca recetas por coincidencia en el nombre de un ingrediente.
 */
export class FiltroPorIngrediente extends Filtro {
  #texto;

  constructor(texto) {
    super();
    this.#texto = texto;
  }

  cumple(receta) {
    return receta.tieneIngrediente(this.#texto);
  }
}
