import { aCuerpoApi, erroresDesdeApi, textoANumero, validarReceta } from "./validacionReceta";

const valida = {
  nombre: "Galletas",
  porciones: "12",
  ingredientes: [{ nombre: "Mantequilla", cantidad: "0,5", unidad: "taza" }],
};

describe("textoANumero", () => {
  test("acepta coma o punto decimal", () => {
    expect(textoANumero("1,5")).toBe(1.5);
    expect(textoANumero(" 2.25 ")).toBe(2.25);
  });

  test("devuelve NaN si está vacío o no es número", () => {
    expect(textoANumero("")).toBeNaN();
    expect(textoANumero("abc")).toBeNaN();
  });
});

describe("validarReceta", () => {
  test("una receta correcta no tiene errores", () => {
    expect(validarReceta(valida)).toEqual({});
  });

  test("usa los mismos nombres de campo que el backend", () => {
    const errores = validarReceta({
      nombre: "  ",
      porciones: "1.5",
      ingredientes: [{ nombre: "", cantidad: "0", unidad: "" }],
    });
    expect(Object.keys(errores)).toEqual([
      "nombre",
      "porciones",
      "ingredientes[0].nombre",
      "ingredientes[0].cantidad",
      "ingredientes[0].unidad",
    ]);
  });

  test("exige al menos un ingrediente", () => {
    expect(validarReceta({ ...valida, ingredientes: [] }).ingredientes).toMatch(/al menos un/);
  });

  test("respeta los largos máximos", () => {
    const errores = validarReceta({
      ...valida,
      nombre: "a".repeat(101),
      ingredientes: [{ nombre: "Sal", cantidad: "1", unidad: "u".repeat(31) }],
    });
    expect(errores.nombre).toMatch(/100 caracteres/);
    expect(errores["ingredientes[0].unidad"]).toMatch(/30 caracteres/);
  });
});

test("aCuerpoApi recorta textos y convierte números", () => {
  expect(aCuerpoApi({ ...valida, nombre: " Galletas " })).toEqual({
    nombre: "Galletas",
    porciones: 12,
    ingredientes: [{ nombre: "Mantequilla", cantidad: 0.5, unidad: "taza" }],
  });
});

test("erroresDesdeApi convierte la lista de detalles en un objeto", () => {
  expect(erroresDesdeApi([{ campo: "nombre", mensaje: "Obligatorio" }])).toEqual({
    nombre: "Obligatorio",
  });
});
