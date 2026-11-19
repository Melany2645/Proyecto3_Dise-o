export class Paginador {
  #tamanoPagina;

  // Aquí se aplica una de las directrices  de GRASP, que sería Fabricaión Pura, Y comó?
  // Ya que paginador es una clase auxiliar que no afecta el concepto o dominio de recetas,
  // paginador lo que hace es ordenar un listado de recetas, aplicando una de las buenas practicas de diseño de software aprendida en el curso,
  // que es si hay una lista muy grande de datos y para que este mismo se vea ordenado, es mejor mostrar una paginación de una lista,
  // así la sección o pantalla tenga una mejor imagen visual.
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
