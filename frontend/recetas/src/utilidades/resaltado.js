const normalizarLetra = (letra) =>
  letra.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function dividirCoincidencia(texto, busqueda) {
  const buscado = [...(busqueda ?? "").trim()].map(normalizarLetra).join("");
  if (buscado === "") return [{ texto, coincide: false }];

  const letras = [...texto];
  const posiciones = [];
  let normalizado = "";
  letras.forEach((letra, indice) => {
    const forma = normalizarLetra(letra);
    for (let i = 0; i < forma.length; i++) posiciones.push(indice);
    normalizado += forma;
  });

  const inicioNormalizado = normalizado.indexOf(buscado);
  if (inicioNormalizado < 0) return [{ texto, coincide: false }];

  const inicio = posiciones[inicioNormalizado];
  const fin = posiciones[inicioNormalizado + buscado.length - 1] + 1;
  return [
    { texto: letras.slice(0, inicio).join(""), coincide: false },
    { texto: letras.slice(inicio, fin).join(""), coincide: true },
    { texto: letras.slice(fin).join(""), coincide: false },
  ].filter((parte) => parte.texto !== "");
}
