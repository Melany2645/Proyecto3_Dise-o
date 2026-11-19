/**
 * Construye recetas nuevas o reconstruye sus objetos a partir de registros guardados.
 */

import { randomUUID } from "node:crypto";
import { Receta } from "../models/Receta.js";

/**
 * Aquí se aplica la directris creador porque este es el único lugar que sabe cómo se
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
