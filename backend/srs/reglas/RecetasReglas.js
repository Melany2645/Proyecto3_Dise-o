import { ErrorNoEncontrado, ErrorValidacion } from "../errores/errores.js";

const porNombre = (a, b) =>
  a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });

export class RecetaService {
  #recetas;
  #consultas;
  #factory;
  #validador;
  #constructorFiltros;
  #paginador;
  #cantidadRecientes;

  constructor({
    recetaRepository,
    consultaRepository,
    factory,
    validador,
    constructorFiltros,
    paginador,
    cantidadRecientes,
  }) {
    this.#recetas = recetaRepository;
    this.#consultas = consultaRepository;
    this.#factory = factory;
    this.#validador = validador;
    this.#constructorFiltros = constructorFiltros;
    this.#paginador = paginador;
    this.#cantidadRecientes = cantidadRecientes;
  }

  async crear(dto) {
    const datos = this.#validador.validar(dto);
    const receta = this.#factory.crear(datos);
    await this.#recetas.guardar(receta);
    return receta;
  }

  /**
   * Lista paginada de todas las recetas
   * @param {{pagina?: number, nombre?: string, ingrediente?: string}} consulta
   */
  async listar({ pagina = 1, ...criterios } = {}) {
    if (!Number.isInteger(pagina) || pagina < 1) {
      throw new ErrorValidacion([
        {
          campo: "pagina",
          mensaje: "La página debe ser un número entero de 1 o más.",
        },
      ]);
    }

    const filtro = this.#constructorFiltros.construir(criterios);
    const todas = await this.#recetas.buscarTodas();
    const filtradas = todas
      .filter((receta) => filtro.cumple(receta))
      .sort(porNombre);

    return this.#paginador.paginar(filtradas, pagina);
  }

  /** Devuelve la receta completa y la anota como "consultada" */
  async obtener(id) {
    const receta = await this.#buscarOFallar(id);
    await this.#consultas.registrar(id);
    return receta;
  }

  /** Las últimas recetas consultadas, la más reciente primero */
  async recientes() {
    const ids = await this.#consultas.ultimas(this.#cantidadRecientes);
    const todas = await this.#recetas.buscarTodas();
    const porId = new Map(todas.map((receta) => [receta.id, receta]));
    return ids.map((id) => porId.get(id)).filter(Boolean);
  }

  async actualizar(id, dto) {
    const receta = await this.#buscarOFallar(id);
    const datos = this.#validador.validar(dto);
    receta.modificar(datos);
    await this.#recetas.guardar(receta);
    return receta;
  }

  async eliminar(id) {
    const eliminada = await this.#recetas.eliminar(id);
    if (!eliminada) throw new ErrorNoEncontrado("Receta");
    await this.#consultas.olvidar(id);
  }

  async #buscarOFallar(id) {
    const receta = await this.#recetas.buscarPorId(id);
    if (!receta) throw new ErrorNoEncontrado("Receta");
    return receta;
  }
}
