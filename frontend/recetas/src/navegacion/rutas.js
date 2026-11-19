import { useEffect, useState } from "react";

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

export function claveDeRuta(ruta) {
  return `${ruta.nombre}:${ruta.id ?? ""}`;
}

export function navegar(hash) {
  window.location.hash = hash;
}

export function reemplazar(hash) {
  window.history.replaceState(null, "", hash);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function hashActual() {
  return window.location.hash || "#/";
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
