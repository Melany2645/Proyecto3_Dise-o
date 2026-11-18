import fs from "node:fs/promises";
import path from "node:path";

export class JsonFileStore {
  #ruta;
  #valorInicial;
  #cola = Promise.resolve();

  /**
   * @param {string} ruta ruta del archivo .json
   * @param {*} valorInicial contenido a usar si el archivo aún no existe
   */
  constructor(ruta, valorInicial) {
    this.#ruta = ruta;
    this.#valorInicial = valorInicial;
  }

  leer() {
    return this.#encolar(() => this.#leerArchivo());
  }

  /**
   * Lee los datos, ejecuta mutador (que los modifica en el lugar) y
   * guarda el resultado. Devuelve lo que devuelva el mutador.
   * Si el mutador lanza un error, no se escribe nada.
   */
  actualizar(mutador) {
    return this.#encolar(async () => {
      const datos = await this.#leerArchivo();
      const resultado = await mutador(datos);
      await this.#escribirArchivo(datos);
      return resultado;
    });
  }

  #encolar(tarea) {
    const resultado = this.#cola.then(tarea);
    // La fila sigue funcionando aunque una tarea falle.
    this.#cola = resultado.catch(() => {});
    return resultado;
  }

  async #leerArchivo() {
    let contenido;
    try {
      contenido = await fs.readFile(this.#ruta, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") return structuredClone(this.#valorInicial);
      throw error;
    }
    if (contenido.trim() === "") return structuredClone(this.#valorInicial);
    try {
      return JSON.parse(contenido);
    } catch {
      throw new Error(`El archivo ${this.#ruta} no contiene JSON válido.`);
    }
  }

  async #escribirArchivo(datos) {
    await fs.mkdir(path.dirname(this.#ruta), { recursive: true });
    const temporal = `${this.#ruta}.tmp`;
    await fs.writeFile(temporal, JSON.stringify(datos, null, 2), "utf8");
    await fs.rename(temporal, this.#ruta);
  }
}
