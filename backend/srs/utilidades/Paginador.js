export class Paginador {
  #tamanoPagina;

  constructor(tamanoPagina) {
    this.#tamanoPagina = tamanoPagina;
  }

  /**
   * @param {Array} elementos lista completa
   * @param {number} pagina número de página, empezando en 1
   */
  paginar(elementos, pagina) {
    const totalElementos = elementos.length;
    const totalPaginas = Math.ceil(totalElementos / this.#tamanoPagina);
    const inicio = (pagina - 1) * this.#tamanoPagina;

    return {
      datos: elementos.slice(inicio, inicio + this.#tamanoPagina),
      paginacion: {
        paginaActual: pagina,
        tamanoPagina: this.#tamanoPagina,
        totalElementos,
        totalPaginas,
      },
    };
  }
}
