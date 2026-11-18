import { Filtro } from "./Filtro.js";

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
