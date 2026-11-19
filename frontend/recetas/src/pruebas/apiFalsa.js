/**
 * Backend simulado en memoria para las pruebas. Reemplaza `fetch` y responde
 * igual que la API real (/api/recetas): filtros, paginación de 5, recientes,
 * 404 y validación mínima. Permite forzar respuestas para probar errores.
 */
const TAMANO_PAGINA = 5;

const normalizar = (texto) =>
  String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export function crearReceta(datos = {}) {
  const id = datos.id ?? `id-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    nombre: "Queque de vainilla",
    porciones: 4,
    ingredientes: [
      { nombre: "Harina", cantidad: 250, unidad: "g" },
      { nombre: "Azúcar", cantidad: 1.5, unidad: "taza" },
    ],
    creadaEn: "2026-11-18T12:00:00.000Z",
    actualizadaEn: "2026-11-18T12:00:00.000Z",
    ...datos,
  };
}

const respuesta = (estado, cuerpo) => ({
  ok: estado >= 200 && estado < 300,
  status: estado,
  json: async () => {
    if (cuerpo === undefined) throw new SyntaxError("Sin cuerpo JSON");
    return cuerpo;
  },
});

/**
 * @param {{recetas?: object[],
 *          forzar?: (metodo: string, ruta: string, cuerpo?: object) => object | undefined}} opciones
 *   `forzar` puede devolver {estado, cuerpo} o "sin-conexion" para simular fallos.
 */
export function instalarApiFalsa({ recetas = [], forzar } = {}) {
  const estado = { recetas: recetas.map((r) => ({ ...r })), consultadas: [], llamadas: [] };

  global.fetch = jest.fn(async (url, opciones = {}) => {
    const metodo = opciones.method ?? "GET";
    const cuerpo = opciones.body ? JSON.parse(opciones.body) : undefined;
    const direccion = new URL(url, "http://localhost");
    const ruta = direccion.pathname.replace(/^\/api\/recetas\/?/, "");
    estado.llamadas.push({ metodo, ruta, consulta: direccion.search, cuerpo });

    const forzada = forzar?.(metodo, ruta, cuerpo);
    if (forzada === "sin-conexion") throw new TypeError("Failed to fetch");
    if (forzada) return respuesta(forzada.estado, forzada.cuerpo);

    const noEncontrada = respuesta(404, { error: { mensaje: "Receta no encontrado." } });

    if (metodo === "GET" && ruta === "") {
      const p = direccion.searchParams;
      const pagina = Number(p.get("pagina") ?? 1);
      const nombre = p.get("nombre");
      const ingrediente = p.get("ingrediente");
      const filtradas = estado.recetas
        .filter((r) => !nombre || normalizar(r.nombre).includes(normalizar(nombre)))
        .filter(
          (r) =>
            !ingrediente ||
            r.ingredientes.some((i) => normalizar(i.nombre).includes(normalizar(ingrediente))),
        )
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      const inicio = (pagina - 1) * TAMANO_PAGINA;
      return respuesta(200, {
        datos: filtradas.slice(inicio, inicio + TAMANO_PAGINA),
        paginacion: {
          paginaActual: pagina,
          tamanoPagina: TAMANO_PAGINA,
          totalElementos: filtradas.length,
          totalPaginas: Math.ceil(filtradas.length / TAMANO_PAGINA),
        },
      });
    }

    if (metodo === "GET" && ruta === "recientes") {
      const datos = estado.consultadas
        .slice(0, 3)
        .map((id) => estado.recetas.find((r) => r.id === id))
        .filter(Boolean);
      return respuesta(200, { datos });
    }

    if (metodo === "POST" && ruta === "") {
      const nueva = crearReceta({ ...cuerpo, id: `nueva-${estado.recetas.length + 1}` });
      estado.recetas.push(nueva);
      return respuesta(201, nueva);
    }

    const id = decodeURIComponent(ruta);
    const posicion = estado.recetas.findIndex((r) => r.id === id);
    if (posicion < 0) return noEncontrada;

    if (metodo === "GET") {
      estado.consultadas = [id, ...estado.consultadas.filter((c) => c !== id)];
      return respuesta(200, estado.recetas[posicion]);
    }
    if (metodo === "PUT") {
      estado.recetas[posicion] = { ...estado.recetas[posicion], ...cuerpo };
      return respuesta(200, estado.recetas[posicion]);
    }
    if (metodo === "DELETE") {
      estado.recetas.splice(posicion, 1);
      return respuesta(204);
    }
    return respuesta(404, undefined);
  });

  return estado;
}
