import { ErrorApi, recetasApi } from "./recetasApi";

const responder = (estado, cuerpo) =>
  jest.fn(async () => ({
    ok: estado >= 200 && estado < 300,
    status: estado,
    json: async () => {
      if (cuerpo === undefined) throw new SyntaxError("sin JSON");
      return cuerpo;
    },
  }));

test("arma la consulta solo con los filtros que tienen valor", async () => {
  global.fetch = responder(200, { datos: [], paginacion: {} });
  await recetasApi.listar({ pagina: 2, nombre: " queque ", ingrediente: "" });
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/recetas/?pagina=2&nombre=queque",
    expect.objectContaining({ method: "GET" }),
  );
});

test("envía JSON al crear", async () => {
  global.fetch = responder(201, { id: "1" });
  await recetasApi.crear({ nombre: "X" });
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/recetas/",
    expect.objectContaining({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: "X" }),
    }),
  );
});

test("DELETE con 204 devuelve null", async () => {
  global.fetch = responder(204);
  await expect(recetasApi.eliminar("1")).resolves.toBeNull();
});

test("usa el mensaje y los detalles que envía el backend", async () => {
  const detalles = [{ campo: "nombre", mensaje: "El nombre es obligatorio." }];
  global.fetch = responder(400, { error: { mensaje: "Los datos enviados no son válidos.", detalles } });
  await expect(recetasApi.crear({})).rejects.toMatchObject({
    name: "ErrorApi",
    estado: 400,
    message: "Los datos enviados no son válidos.",
    detalles,
  });
});

test.each([
  [404, /no existe o ya fue eliminada/],
  [413, /demasiado grande/],
  [503, /no está disponible/],
  [504, /No se pudo conectar con el servidor/],
  [418, /No se pudo procesar la solicitud/],
])("si el backend no envía mensaje, explica el código %i", async (estado, mensaje) => {
  global.fetch = responder(estado, {});
  await expect(recetasApi.obtener("x")).rejects.toThrow(mensaje);
});

test("un 500 sin JSON (proxy sin backend) se explica como falta de conexión", async () => {
  global.fetch = responder(500);
  await expect(recetasApi.listar()).rejects.toThrow(/backend esté encendido/);
});

test("si fetch falla por red, se lanza un ErrorApi con estado 0", async () => {
  global.fetch = jest.fn(async () => {
    throw new TypeError("Failed to fetch");
  });
  const error = await recetasApi.listar().catch((e) => e);
  expect(error).toBeInstanceOf(ErrorApi);
  expect(error.estado).toBe(0);
});

test("una cancelación (AbortError) no se convierte en error de conexión", async () => {
  const abortado = new DOMException("Abortado", "AbortError");
  global.fetch = jest.fn(async () => {
    throw abortado;
  });
  await expect(recetasApi.listar()).rejects.toBe(abortado);
});
