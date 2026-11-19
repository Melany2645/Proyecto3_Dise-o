import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { axe } from "jest-axe";

import App from "./App";
import { crearReceta, instalarApiFalsa } from "./pruebas/apiFalsa";

async function iniciarEn(hash) {
  window.location.hash = hash;
  const resultado = render(<App />);
  await esperarTareas();
  return resultado;
}

const esperarTareas = () => act(() => new Promise((resolver) => setTimeout(resolver, 0)));

function navegarA(hash) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}

const regionDeAnuncios = () => document.querySelector('[role="status"][aria-live="polite"]');

describe("Estructura general", () => {
  test("tiene landmarks, enlace de salto y navegación principal", async () => {
    instalarApiFalsa();
    await iniciarEn("#/");

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Principal" });
    expect(within(nav).getByRole("link", { name: "Recetas" })).toHaveAttribute("aria-current", "page");

    fireEvent.click(screen.getByRole("link", { name: "Saltar al contenido principal" }));
    expect(screen.getByRole("main")).toHaveFocus();
    expect(window.location.hash).toBe("#/");
    await screen.findByText(/Todavía no hay recetas/);
  });

  test("al navegar, el foco pasa al <h1> de la nueva página y cambia el título", async () => {
    instalarApiFalsa({ recetas: [crearReceta({ id: "q1", nombre: "Queque" })] });
    await iniciarEn("#/");
    await screen.findByRole("link", { name: "Queque" });

    navegarA("#/recetas/q1");
    const titulo = await screen.findByRole("heading", { level: 1, name: "Queque" });
    expect(titulo).toHaveFocus();
    expect(document.title).toBe("Queque · Recetario");
  });

  test("una ruta desconocida muestra la página no encontrada", async () => {
    instalarApiFalsa();
    await iniciarEn("#/no/existe");
    expect(screen.getByRole("heading", { level: 1, name: "Página no encontrada" })).toBeInTheDocument();
  });
});

describe("Lista de recetas", () => {
  const siete = ["Alfajores", "Brownies", "Cheesecake", "Donas", "Éclair", "Flan", "Galletas"].map(
    (nombre, i) =>
      crearReceta({
        id: `r${i}`,
        nombre,
        ingredientes: [{ nombre: i === 2 ? "Queso crema" : "Harina", cantidad: 1, unidad: "taza" }],
      }),
  );

  test("muestra las recetas paginadas sin violaciones de accesibilidad", async () => {
    instalarApiFalsa({ recetas: siete });
    const { container } = await iniciarEn("#/");

    expect(await screen.findByRole("link", { name: "Alfajores" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    const paginacion = screen.getByRole("navigation", { name: "Paginación de recetas" });
    expect(within(paginacion).getByRole("link", { name: "Página 1" })).toHaveAttribute("aria-current", "page");
    expect(within(paginacion).queryByRole("link", { name: /anterior/i })).toBeNull();
    expect(document.title).toBe("Recetas · Recetario");

    expect(await axe(container)).toHaveNoViolations();
  });

  test("cambiar de página anuncia el resultado y enfoca el título de resultados", async () => {
    instalarApiFalsa({ recetas: siete });
    await iniciarEn("#/");
    const paginacion = await screen.findByRole("navigation", { name: "Paginación de recetas" });

    fireEvent.click(within(paginacion).getByRole("link", { name: "Página siguiente, 2" }));
    navegarA("#/?pagina=2");

    expect(await screen.findByRole("link", { name: "Galletas" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("heading", { name: "Todas las recetas" })).toHaveFocus());
    await waitFor(() =>
      expect(regionDeAnuncios()).toHaveTextContent("7 recetas encontradas. Página 2 de 2."),
    );
  });

  test("busca por ingrediente ignorando mayúsculas y tildes", async () => {
    const api = instalarApiFalsa({ recetas: siete });
    await iniciarEn("#/");
    await screen.findByRole("link", { name: "Alfajores" });

    const busqueda = screen.getByRole("search", { name: "Buscar recetas" });
    fireEvent.change(within(busqueda).getByLabelText("Ingrediente"), { target: { value: "QUESO" } });
    fireEvent.click(within(busqueda).getByRole("button", { name: "Buscar" }));

    await waitFor(() => expect(window.location.hash).toBe("#/?ingrediente=QUESO"));
    expect(await screen.findByRole("heading", { name: "Resultados de la búsqueda" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Cheesecake" })).toBeInTheDocument();
    expect(api.llamadas.at(-1).consulta).toContain("ingrediente=QUESO");
    await waitFor(() => expect(regionDeAnuncios()).toHaveTextContent("1 receta encontrada."));
  });

  test("muestra las recetas consultadas recientemente", async () => {
    const api = instalarApiFalsa({ recetas: siete });
    api.consultadas = ["r6", "r0"];
    await iniciarEn("#/");
    const recientes = await screen.findByRole("region", { name: "Consultadas recientemente" });
    const enlaces = await within(recientes).findAllByRole("link");
    expect(enlaces.map((e) => e.textContent)).toEqual(["Galletas", "Alfajores"]);
  });

  test("sin conexión muestra un error claro que se puede reintentar", async () => {
    let caido = true;
    instalarApiFalsa({ forzar: () => (caido ? "sin-conexion" : undefined) });
    await iniciarEn("#/");

    const alertas = await screen.findAllByRole("alert");
    const principal = alertas.find((a) => a.textContent.includes("No se pudieron cargar las recetas."));
    expect(principal).toHaveTextContent(/backend esté encendido/);

    caido = false;
    fireEvent.click(within(principal).getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByText(/Todavía no hay recetas/)).toBeInTheDocument();
  });
});

describe("Búsqueda en tiempo real", () => {
  const pizzas = [
    crearReceta({ id: "p1", nombre: "Pizza margarita", creadaEn: "2026-11-01T15:00:00.000Z" }),
    crearReceta({
      id: "p2",
      nombre: "Pizza jamón y queso",
      creadaEn: "2026-11-02T15:00:00.000Z",
      ingredientes: [{ nombre: "Jamón", cantidad: 100, unidad: "g" }],
    }),
    crearReceta({ id: "p3", nombre: "Pizza", creadaEn: "2026-11-03T15:00:00.000Z" }),
    crearReceta({ id: "p4", nombre: "Pizza", creadaEn: "2026-11-10T15:00:00.000Z" }),
    crearReceta({ id: "f1", nombre: "Flan" }),
  ];

  const consultasDeNombre = (api) =>
    api.llamadas.filter((l) => l.metodo === "GET" && l.consulta.includes("nombre="));

  test("muestra las fichas que contienen el texto mientras se escribe, sin presionar Buscar", async () => {
    instalarApiFalsa({ recetas: pizzas });
    const { container } = await iniciarEn("#/");
    await screen.findByRole("link", { name: "Flan" });

    const campo = screen.getByLabelText("Nombre de la receta");
    campo.focus();
    fireEvent.change(campo, { target: { value: "piz" } });

    await waitFor(() => expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4));
    expect(window.location.hash).toBe("#/?nombre=piz");
    expect(screen.getByRole("link", { name: "Pizza margarita" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pizza jamón y queso" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Flan" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Resultados de la búsqueda" })).toBeInTheDocument();
    expect(campo).toHaveFocus();
    expect(container.querySelectorAll(".tarjeta-receta mark")).toHaveLength(4);
    await waitFor(() => expect(regionDeAnuncios()).toHaveTextContent("4 recetas encontradas."));
    expect(await axe(container)).toHaveNoViolations();
  });

  test("las recetas con el mismo nombre aparecen en fichas separadas y distinguibles", async () => {
    instalarApiFalsa({ recetas: pizzas });
    await iniciarEn("#/?nombre=pizza");

    await waitFor(() => expect(screen.getAllByRole("link", { name: "Pizza" })).toHaveLength(2));
    const [primera, segunda] = screen.getAllByRole("link", { name: "Pizza" });
    expect(primera.getAttribute("href")).not.toBe(segunda.getAttribute("href"));
    expect(primera).toHaveAccessibleDescription(/Creada el 3 de noviembre de 2026/);
    expect(segunda).toHaveAccessibleDescription(/Creada el 10 de noviembre de 2026/);
  });

  test("escribir varias letras seguidas hace una sola petición", async () => {
    const api = instalarApiFalsa({ recetas: pizzas });
    await iniciarEn("#/");
    await screen.findByRole("link", { name: "Flan" });

    const campo = screen.getByLabelText("Nombre de la receta");
    ["p", "pi", "piz", "pizz", "pizza"].forEach((valor) => fireEvent.change(campo, { target: { value: valor } }));

    await waitFor(() => expect(window.location.hash).toBe("#/?nombre=pizza"));
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4));
    expect(consultasDeNombre(api).map((l) => l.consulta)).toEqual(["?pagina=1&nombre=pizza"]);
  });

  test("no borra el espacio que se está escribiendo y permite seguir la búsqueda", async () => {
    instalarApiFalsa({ recetas: pizzas });
    await iniciarEn("#/");
    await screen.findByRole("link", { name: "Flan" });

    const campo = screen.getByLabelText("Nombre de la receta");
    fireEvent.change(campo, { target: { value: "pizza " } });
    await waitFor(() => expect(window.location.hash).toBe("#/?nombre=pizza"));
    expect(campo).toHaveValue("pizza ");

    fireEvent.change(campo, { target: { value: "pizza ja" } });
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Pizza jamón y queso" })).toBeInTheDocument();
  });

  test("Limpiar vuelve a mostrar todas las recetas", async () => {
    instalarApiFalsa({ recetas: pizzas });
    await iniciarEn("#/?nombre=flan");
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1));

    fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));
    expect(window.location.hash).toBe("#/");
    expect(screen.getByLabelText("Nombre de la receta")).toHaveValue("");
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5));
    expect(screen.getByRole("heading", { name: "Todas las recetas" })).toBeInTheDocument();
  });
});

describe("Detalle de receta", () => {
  const queque = crearReceta({ id: "q1", nombre: "Queque", porciones: 4 });

  test("muestra los ingredientes en una tabla accesible y sin violaciones", async () => {
    instalarApiFalsa({ recetas: [queque] });
    const { container } = await iniciarEn("#/recetas/q1");

    const tabla = await screen.findByRole("table", { name: "Ingredientes para 4 porciones" });
    const fila = within(tabla).getByRole("row", { name: /Harina/ });
    expect(within(fila).getByRole("rowheader")).toHaveTextContent("Harina");
    expect(within(fila).getByRole("cell", { name: "250" })).toBeInTheDocument();
    const migas = screen.getByRole("navigation", { name: "Ruta de navegación" });
    expect(within(migas).getByText("Queque")).toHaveAttribute("aria-current", "page");

    expect(await axe(container)).toHaveNoViolations();
  });

  test("ajusta las cantidades según las porciones y valida el valor", async () => {
    instalarApiFalsa({ recetas: [queque] });
    await iniciarEn("#/recetas/q1");
    const campo = await screen.findByLabelText("Porciones a preparar");

    fireEvent.click(screen.getByRole("button", { name: "Aumentar una porción" }));
    fireEvent.click(screen.getByRole("button", { name: "Aumentar una porción" }));
    expect(campo).toHaveValue(6);
    const tabla = screen.getByRole("table", { name: "Ingredientes para 6 porciones" });
    expect(within(tabla).getByRole("cell", { name: "375" })).toBeInTheDocument();
    expect(within(tabla).getByRole("cell", { name: "2,25" })).toBeInTheDocument();
    expect(screen.getByText(/ajustadas para 6 porciones \(×1,5/)).toHaveAttribute("aria-live", "polite");

    fireEvent.change(campo, { target: { value: "0" } });
    expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(campo).toHaveAccessibleDescription(/número entero entre 1 y 1000/);

    fireEvent.click(screen.getByRole("button", { name: "Volver a 4" }));
    expect(campo).toHaveValue(4);
    expect(campo).not.toHaveAttribute("aria-invalid");
  });

  test("el diálogo de eliminar enfoca Cancelar, se cierra con Escape y devuelve el foco", async () => {
    instalarApiFalsa({ recetas: [queque] });
    await iniciarEn("#/recetas/q1");
    const botonEliminar = await screen.findByRole("button", { name: "Eliminar receta" });

    botonEliminar.focus();
    fireEvent.click(botonEliminar);
    const dialogo = screen.getByRole("alertdialog", { name: "¿Eliminar esta receta?" });
    expect(dialogo).toHaveAccessibleDescription(/no se puede deshacer/);
    expect(within(dialogo).getByRole("button", { name: "Cancelar" })).toHaveFocus();

    fireEvent(dialogo, new Event("cancel", { cancelable: true }));
    expect(dialogo).not.toHaveAttribute("open");
    expect(botonEliminar).toHaveFocus();
  });

  test("al confirmar, elimina, anuncia y vuelve a la lista", async () => {
    const api = instalarApiFalsa({ recetas: [queque] });
    await iniciarEn("#/recetas/q1");
    fireEvent.click(await screen.findByRole("button", { name: "Eliminar receta" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, eliminar" }));

    await waitFor(() => expect(window.location.hash).toBe("#/"));
    expect(api.recetas).toHaveLength(0);
    await waitFor(() => expect(regionDeAnuncios()).toHaveTextContent('La receta "Queque" se eliminó'));
    expect(await screen.findByText(/Todavía no hay recetas/)).toBeInTheDocument();
  });

  test("si falla la eliminación, el error se muestra dentro del diálogo", async () => {
    instalarApiFalsa({
      recetas: [queque],
      forzar: (metodo) => (metodo === "DELETE" ? { estado: 500, cuerpo: {} } : undefined),
    });
    await iniciarEn("#/recetas/q1");
    fireEvent.click(await screen.findByRole("button", { name: "Eliminar receta" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, eliminar" }));

    const dialogo = screen.getByRole("alertdialog");
    expect(await within(dialogo).findByRole("alert")).toHaveTextContent(/problema interno/);
  });

  test("una receta inexistente muestra un mensaje y un enlace de regreso", async () => {
    instalarApiFalsa();
    await iniciarEn("#/recetas/no-existe");
    expect(await screen.findByRole("heading", { level: 1, name: "Receta no encontrada" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver a la lista de recetas" })).toBeInTheDocument();
  });
});

describe("Formulario de receta", () => {
  test("el formulario vacío no tiene violaciones de accesibilidad", async () => {
    instalarApiFalsa();
    const { container } = await iniciarEn("#/recetas/nueva");
    expect(screen.getByRole("heading", { level: 1, name: "Nueva receta" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Datos generales" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre de la receta")).toHaveAttribute("aria-required", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  test("al enviar vacío, enfoca un resumen de errores enlazado a cada campo", async () => {
    instalarApiFalsa();
    const { container } = await iniciarEn("#/recetas/nueva");

    fireEvent.click(screen.getByRole("button", { name: "Crear receta" }));
    const resumen = screen.getByRole("group", { name: /5 errores en el formulario/ });
    expect(resumen).toHaveFocus();

    fireEvent.click(within(resumen).getByRole("link", { name: /nombre de la receta es obligatorio/ }));
    const nombre = screen.getByLabelText("Nombre de la receta");
    expect(nombre).toHaveFocus();
    expect(nombre).toHaveAttribute("aria-invalid", "true");
    expect(nombre).toHaveAccessibleDescription("Error: El nombre de la receta es obligatorio.");

    fireEvent.change(nombre, { target: { value: "Galletas" } });
    expect(screen.getByRole("group", { name: /4 errores/ })).toBeInTheDocument();
    expect(nombre).not.toHaveAttribute("aria-invalid");

    expect(await axe(container)).toHaveNoViolations();
  });

  test("agrega y quita ingredientes moviendo el foco, y crea la receta", async () => {
    const api = instalarApiFalsa();
    await iniciarEn("#/recetas/nueva");

    fireEvent.change(screen.getByLabelText("Nombre de la receta"), { target: { value: "Galletas" } });
    fireEvent.change(screen.getByLabelText("Porciones que rinde"), { target: { value: "12" } });
    const primero = screen.getByRole("group", { name: "Ingrediente 1" });
    fireEvent.change(within(primero).getByLabelText("Nombre"), { target: { value: "Mantequilla" } });
    fireEvent.change(within(primero).getByLabelText("Cantidad"), { target: { value: "0,5" } });
    fireEvent.change(within(primero).getByLabelText("Unidad"), { target: { value: "taza" } });

    fireEvent.click(screen.getByRole("button", { name: "Agregar ingrediente" }));
    const segundo = screen.getByRole("group", { name: "Ingrediente 2" });
    expect(within(segundo).getByLabelText("Nombre")).toHaveFocus();

    fireEvent.click(within(segundo).getByRole("button", { name: "Quitar ingrediente 2" }));
    expect(screen.queryByRole("group", { name: "Ingrediente 2" })).toBeNull();
    expect(within(primero).getByLabelText("Nombre")).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Crear receta" }));
    await waitFor(() => expect(window.location.hash).toBe("#/recetas/nueva-1"));
    expect(api.llamadas.find((l) => l.metodo === "POST").cuerpo).toEqual({
      nombre: "Galletas",
      porciones: 12,
      ingredientes: [{ nombre: "Mantequilla", cantidad: 0.5, unidad: "taza" }],
    });
    expect(await screen.findByRole("heading", { level: 1, name: "Galletas" })).toHaveFocus();
  });

  test("los errores de validación del backend se muestran en su campo", async () => {
    instalarApiFalsa({
      recetas: [crearReceta({ id: "q1", nombre: "Queque" })],
      forzar: (metodo) =>
        metodo === "PUT"
          ? {
              estado: 400,
              cuerpo: {
                error: {
                  mensaje: "Los datos enviados no son válidos.",
                  detalles: [{ campo: "ingredientes[1].unidad", mensaje: "Unidad no reconocida." }],
                },
              },
            }
          : undefined,
    });
    await iniciarEn("#/recetas/q1/editar");

    expect(await screen.findByLabelText("Nombre de la receta")).toHaveValue("Queque");
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    const resumen = await screen.findByRole("group", { name: /1 error en el formulario/ });
    await waitFor(() => expect(resumen).toHaveFocus());
    const segundo = screen.getByRole("group", { name: "Ingrediente 2" });
    expect(within(segundo).getByLabelText("Unidad")).toHaveAccessibleDescription(
      "Error: Unidad no reconocida.",
    );
  });

  test("editar guarda los cambios y vuelve al detalle", async () => {
    const api = instalarApiFalsa({ recetas: [crearReceta({ id: "q1", nombre: "Queque" })] });
    await iniciarEn("#/recetas/q1/editar");

    const nombre = await screen.findByLabelText("Nombre de la receta");
    fireEvent.change(nombre, { target: { value: "Queque de naranja" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(window.location.hash).toBe("#/recetas/q1"));
    expect(api.recetas[0].nombre).toBe("Queque de naranja");
    await waitFor(() =>
      expect(regionDeAnuncios()).toHaveTextContent('Los cambios en "Queque de naranja" se guardaron'),
    );
    expect(await screen.findByRole("heading", { level: 1, name: "Queque de naranja" })).toBeInTheDocument();
  });
});
