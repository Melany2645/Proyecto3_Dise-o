import { ConsultaRepository } from "./ConsulrasCambios.js";

/**
 * una lista de ids con la receta más reciente primero, sin repetidos.
 * Se guardan más de las que se muestran (historialMaximo) para que, si se
 * elimina una receta, la lista de "recientes" se pueda seguir completando.
 */
export class JsonConsultasCambios extends ConsultaRepository {
  #almacen;
  #maximo;

  constructor({ almacen, maximo }) {
    super();
    this.#almacen = almacen;
    this.#maximo = maximo;
  }

  async registrar(id) {
    await this.#almacen.actualizar((ids) => {
      const posicion = ids.indexOf(id);
      if (posicion >= 0) ids.splice(posicion, 1);
      ids.unshift(id);
      if (ids.length > this.#maximo) ids.length = this.#maximo;
    });
  }

  async ultimas(cantidad) {
    const ids = await this.#almacen.leer();
    return ids.slice(0, cantidad);
  }

  async olvidar(id) {
    await this.#almacen.actualizar((ids) => {
      const posicion = ids.indexOf(id);
      if (posicion >= 0) ids.splice(posicion, 1);
    });
  }
}
