import { ErrorValidacion } from "../errores/errores.js";

const MAX_NOMBRE = 100;
const MAX_UNIDAD = 30;

const esTextoNoVacio = (valor) =>
  typeof valor === "string" && valor.trim() !== "";

/**
 * Valida y normaliza los datos de una receta que llegan desde fuera
 * Reúne todos los errores en una sola respuesta, para que el frontend pueda
 * marcar varios campos a la vez en lugar de ir error por error.
 *
 */
export class RecetaValidator {
  validar(dto) {
    const errores = [];

    const nombre = this.#validarTexto(
      dto?.nombre,
      "nombre",
      "El nombre",
      MAX_NOMBRE,
      errores,
    );

    let porciones = dto?.porciones;
    if (!Number.isInteger(porciones) || porciones < 1) {
      errores.push({
        campo: "porciones",
        mensaje: "Las porciones deben ser un número entero de 1 o más.",
      });
    }

    const ingredientes = [];
    if (!Array.isArray(dto?.ingredientes) || dto.ingredientes.length === 0) {
      errores.push({
        campo: "ingredientes",
        mensaje: "La receta debe tener al menos un ingrediente.",
      });
    } else {
      dto.ingredientes.forEach((ing, i) => {
        const campo = `ingredientes[${i}]`;
        if (typeof ing !== "object" || ing === null || Array.isArray(ing)) {
          errores.push({
            campo,
            mensaje:
              "El ingrediente debe ser un objeto { nombre, cantidad, unidad }.",
          });
          return;
        }
        const nombreIng = this.#validarTexto(
          ing.nombre,
          `${campo}.nombre`,
          "El nombre del ingrediente",
          MAX_NOMBRE,
          errores,
        );
        const unidad = this.#validarTexto(
          ing.unidad,
          `${campo}.unidad`,
          "La unidad de medida",
          MAX_UNIDAD,
          errores,
        );
        if (
          typeof ing.cantidad !== "number" ||
          !Number.isFinite(ing.cantidad) ||
          ing.cantidad <= 0
        ) {
          errores.push({
            campo: `${campo}.cantidad`,
            mensaje: "La cantidad debe ser un número mayor que 0.",
          });
        }
        ingredientes.push({
          nombre: nombreIng,
          cantidad: ing.cantidad,
          unidad,
        });
      });
    }

    if (errores.length > 0) throw new ErrorValidacion(errores);

    return { nombre, porciones, ingredientes };
  }

  #validarTexto(valor, campo, etiqueta, max, errores) {
    if (!esTextoNoVacio(valor)) {
      errores.push({ campo, mensaje: `${etiqueta} es obligatorio.` });
      return undefined;
    }
    const texto = valor.trim();
    if (texto.length > max) {
      errores.push({
        campo,
        mensaje: `${etiqueta} no puede superar ${max} caracteres.`,
      });
    }
    return texto;
  }
}
