import { claveDeRuta, interpretarHash, rutas } from "./rutas";

test.each([
  ["", { nombre: "lista", consulta: {} }],
  ["#/", { nombre: "lista", consulta: {} }],
  ["#/?nombre=queque&pagina=2", { nombre: "lista", consulta: { nombre: "queque", pagina: "2" } }],
  ["#/recetas/nueva", { nombre: "crear", consulta: {} }],
  ["#/recetas/abc", { nombre: "detalle", id: "abc", consulta: {} }],
  ["#/recetas/abc/editar", { nombre: "editar", id: "abc", consulta: {} }],
  ["#/otra/cosa", { nombre: "noEncontrada", consulta: {} }],
])("interpreta %s", (hash, esperado) => {
  expect(interpretarHash(hash)).toEqual(esperado);
});

test("los generadores de rutas y el intérprete son coherentes", () => {
  expect(interpretarHash(rutas.detalle("a b"))).toMatchObject({ nombre: "detalle", id: "a b" });
  expect(rutas.lista({ nombre: " pan ", ingrediente: "", pagina: undefined })).toBe("#/?nombre=pan");
  expect(rutas.lista()).toBe("#/");
});

test("la clave de ruta ignora la consulta (buscar no remonta la página)", () => {
  expect(claveDeRuta(interpretarHash("#/?nombre=a"))).toBe(claveDeRuta(interpretarHash("#/")));
  expect(claveDeRuta(interpretarHash("#/recetas/1"))).not.toBe(
    claveDeRuta(interpretarHash("#/recetas/2")),
  );
});
