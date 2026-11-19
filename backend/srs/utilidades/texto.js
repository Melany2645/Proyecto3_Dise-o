// Se encarga de normalizar texto, todo texto ingresado por5 el usuario, quita espacios, cambia todo a minuscula y quita las tildes
// Así no afecta a la hora de diferentes personas busques recetas con ditintas escrituras.

export function normalizar(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
