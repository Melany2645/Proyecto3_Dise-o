/**
 * Validación del formulario de recetas en el navegador.
 * Usa las mismas reglas y los mismos nombres de campo que el backend
 * (RecetaValidator): "nombre", "porciones", "ingredientes",
 * "ingredientes[i].nombre", "ingredientes[i].cantidad", "ingredientes[i].unidad".
 * Así los errores locales y los que devuelve la API se muestran igual.
 */
export const MAX_NOMBRE = 100;
export const MAX_UNIDAD = 30;

/** Unidades sugeridas en el formulario (el backend acepta cualquier texto). */
export const UNIDADES_SUGERIDAS = [
  "g",
  "kg",
  "mg",
  "ml",
  "l",
  "taza",
  "cucharada",
  "cucharadita",
  "unidad",
  "pizca",
  "onza",
  "libra",
];

/** Acepta "1,5" o "1.5". Devuelve NaN si el texto no es un número. */
export function textoANumero(texto) {
  const limpio = String(texto ?? "").trim().replace(",", ".");
  if (limpio === "") return NaN;
  return Number(limpio);
}

function validarTexto(valor, campo, etiqueta, maximo, errores) {
  const texto = String(valor ?? "").trim();
  if (texto === "") errores[campo] = `${etiqueta} es obligatorio.`;
  else if (texto.length > maximo) errores[campo] = `${etiqueta} no puede superar ${maximo} caracteres.`;
}

/**
 * @param {{nombre: string, porciones: string,
 *          ingredientes: {nombre: string, cantidad: string, unidad: string}[]}} valores
 * @returns {Record<string, string>} errores por campo (vacío si todo es válido)
 */
export function validarReceta(valores) {
  const errores = {};

  validarTexto(valores.nombre, "nombre", "El nombre de la receta", MAX_NOMBRE, errores);

  const porciones = textoANumero(valores.porciones);
  if (!Number.isInteger(porciones) || porciones < 1) {
    errores.porciones = "Las porciones deben ser un número entero de 1 o más.";
  }

  if (valores.ingredientes.length === 0) {
    errores.ingredientes = "La receta debe tener al menos un ingrediente.";
  }

  valores.ingredientes.forEach((ingrediente, i) => {
    const campo = `ingredientes[${i}]`;
    validarTexto(ingrediente.nombre, `${campo}.nombre`, "El nombre del ingrediente", MAX_NOMBRE, errores);
    const cantidad = textoANumero(ingrediente.cantidad);
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      errores[`${campo}.cantidad`] = "La cantidad debe ser un número mayor que 0.";
    }
    validarTexto(ingrediente.unidad, `${campo}.unidad`, "La unidad de medida", MAX_UNIDAD, errores);
  });

  return errores;
}

/** Convierte los valores del formulario al cuerpo que espera la API. */
export function aCuerpoApi(valores) {
  return {
    nombre: valores.nombre.trim(),
    porciones: textoANumero(valores.porciones),
    ingredientes: valores.ingredientes.map((i) => ({
      nombre: i.nombre.trim(),
      cantidad: textoANumero(i.cantidad),
      unidad: i.unidad.trim(),
    })),
  };
}

/** Convierte la lista de detalles de la API en un objeto { campo: mensaje }. */
export function erroresDesdeApi(detalles = []) {
  return Object.fromEntries(detalles.map(({ campo, mensaje }) => [campo, mensaje]));
}
