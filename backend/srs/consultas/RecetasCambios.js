export class RecetaRepository {
  /** @returns {Promise<import('../models/Receta.js').Receta[]>} */
  async buscarTodas() {
    throw new Error("Método no implementado: buscarTodas");
  }

  /** @returns {Promise<import('../models/Receta.js').Receta | null>} */
  async buscarPorId(_id) {
    throw new Error("Método no implementado: buscarPorId");
  }

  /** Inserta la receta si es nueva o la reemplaza si ya existe. */
  async guardar(_receta) {
    throw new Error("Método no implementado: guardar");
  }

  /** @returns {Promise<boolean>} true si existía y se eliminó */
  async eliminar(_id) {
    throw new Error("Método no implementado: eliminar");
  }
}
