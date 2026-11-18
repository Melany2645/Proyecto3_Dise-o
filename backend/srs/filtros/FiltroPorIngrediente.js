import { Filtro } from "./Filtro.js";

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
