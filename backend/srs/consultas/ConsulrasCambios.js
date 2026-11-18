export class ConsultaRepository {
  /** Registra que se consultó la receta `id` (queda como la más reciente). */
  async registrar(_id) {
    throw new Error("Método no implementado: registrar");
  }

  /** @returns {Promise<string[]>} ids de las últimas recetas consultadas, la más reciente primero */
  async ultimas(_cantidad) {
    throw new Error("Método no implementado: ultimas");
  }

  /** Quita una receta del historial (por ejemplo, porque se eliminó). */
  async olvidar(_id) {
    throw new Error("Método no implementado: olvidar");
  }
}
