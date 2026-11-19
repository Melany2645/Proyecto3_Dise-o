import { RecetaRepository } from "./RecetasCambios.js";

/**
 * Implementa el acceso a recetas en JSON y convierte registros guardados en objetos Receta.
 */
/**
 * Guarda las recetas en un archivo .json.
 * Traduce entre los objetos Receta y los registros planos del archivo
 * (usa la fábrica para reconstruir las recetas al leer).
 */
export class JsonRecetasCambios extends RecetaRepository {
  #almacen;
  #factory;

  /**
   * @param {{almacen: import('../manejadorJson/ManejadorJson.js').JsonFileStore,
   *          factory: import('../crearReceta/CrearReceta.js').RecetaFactory}} dependencias
   */
  constructor({ almacen, factory }) {
    super();
    this.#almacen = almacen;
    this.#factory = factory;
  }

  async buscarTodas() {
    const registros = await this.#almacen.leer();
    return registros.map((registro) => this.#factory.reconstruir(registro));
  }

  async buscarPorId(id) {
    const registros = await this.#almacen.leer();
    const registro = registros.find((r) => r.id === id);
    return registro ? this.#factory.reconstruir(registro) : null;
  }

  async guardar(receta) {
    const registro = receta.toJSON();
    await this.#almacen.actualizar((registros) => {
      const posicion = registros.findIndex((r) => r.id === registro.id);
      if (posicion >= 0) registros[posicion] = registro;
      else registros.push(registro);
    });
    return receta;
  }

  async eliminar(id) {
    return this.#almacen.actualizar((registros) => {
      const posicion = registros.findIndex((r) => r.id === id);
      if (posicion < 0) return false;
      registros.splice(posicion, 1);
      return true;
    });
  }
}
