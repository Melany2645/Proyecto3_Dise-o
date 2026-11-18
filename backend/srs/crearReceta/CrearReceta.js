import { randomUUID } from "node:crypto";
import { Receta } from "../models/Receta.js";

/**
 * Aquí implementamos patrón Factory y GRASP Creator: este es el único lugar que sabe cómo se
 * construye una Receta:
 *  crear(): receta nueva.
 *  reconstruir(): receta que ya existía y se lee desde el .json.
 */
export class RecetaFactory {
  crear({ nombre, porciones, ingredientes }, ahora = new Date()) {
    const fecha = ahora.toISOString();
    return new Receta({
      id: randomUUID(),
      nombre,
      porciones,
      ingredientes,
      creadaEn: fecha,
      actualizadaEn: fecha,
    });
  }

  reconstruir(registro) {
    return new Receta(registro);
  }
}
