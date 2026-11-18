import { useEffect, useState } from "react";

/**
 * Navegación basada en el hash de la URL (#/ruta), sin dependencias extra.
 * Permite usar enlaces reales (<a href>), el botón "Atrás" del navegador
 * y compartir/recargar la URL de una receta.
 *
 * Rutas:
 *   #/                      lista de recetas (acepta ?nombre=&ingrediente=&pagina=)
 *   #/recetas/nueva         formulario para crear
 *   #/recetas/:id           detalle de una receta
 *   #/recetas/:id/editar    formulario para editar
 */
export const rutas = {
  lista: (consulta = {}) => {
    const parametros = new URLSearchParams();
    Object.entries(consulta).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
        parametros.set(clave, String(valor).trim());
      }
    });
    const texto = parametros.toString();
    return `#/${texto ? `?${texto}` : ""}`;
  },
  nueva: () => "#/recetas/nueva",
  detalle: (id) => `#/recetas/${encodeURIComponent(id)}`,
  editar: (id) => `#/recetas/${encodeURIComponent(id)}/editar`,
};

export function interpretarHash(hash) {
  const sinNumeral = hash.replace(/^#/, "") || "/";
  const [camino, textoConsulta = ""] = sinNumeral.split("?");
  const consulta = Object.fromEntries(new URLSearchParams(textoConsulta));
  const partes = camino.split("/").filter(Boolean).map(decodeURIComponent);

  if (partes.length === 0) return { nombre: "lista", consulta };
  if (partes[0] === "recetas") {
    if (partes.length === 2 && partes[1] === "nueva") return { nombre: "crear", consulta };
    if (partes.length === 2) return { nombre: "detalle", id: partes[1], consulta };
    if (partes.length === 3 && partes[2] === "editar") {
      return { nombre: "editar", id: partes[1], consulta };
    }
  }
  return { nombre: "noEncontrada", consulta };
}

/** Clave única de una ruta: si cambia, se considera una navegación nueva. */
export function claveDeRuta(ruta) {
  return `${ruta.nombre}:${ruta.id ?? ""}`;
}

export function navegar(hash) {
  window.location.hash = hash;
}

export function useRuta() {
  const [ruta, setRuta] = useState(() => interpretarHash(window.location.hash));

  useEffect(() => {
    const alCambiar = () => setRuta(interpretarHash(window.location.hash));
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
  }, []);

  return ruta;
}
