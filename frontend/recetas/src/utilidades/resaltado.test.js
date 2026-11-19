import { dividirCoincidencia } from "./resaltado";

test("sin búsqueda devuelve el texto completo sin resaltar", () => {
  expect(dividirCoincidencia("Pizza margarita", "")).toEqual([{ texto: "Pizza margarita", coincide: false }]);
});

test("resalta la parte que coincide, sin importar mayúsculas", () => {
  expect(dividirCoincidencia("Pizza margarita", "MARGA")).toEqual([
    { texto: "Pizza ", coincide: false },
    { texto: "marga", coincide: true },
    { texto: "rita", coincide: false },
  ]);
});

test("ignora tildes y conserva el texto original", () => {
  expect(dividirCoincidencia("Pizza jamón y queso", "jamon")).toEqual([
    { texto: "Pizza ", coincide: false },
    { texto: "jamón", coincide: true },
    { texto: " y queso", coincide: false },
  ]);
  expect(dividirCoincidencia("Éclair", "ecl")).toEqual([
    { texto: "Écl", coincide: true },
    { texto: "air", coincide: false },
  ]);
});

test("sin coincidencia devuelve el texto completo", () => {
  expect(dividirCoincidencia("Flan", "pizza")).toEqual([{ texto: "Flan", coincide: false }]);
});
