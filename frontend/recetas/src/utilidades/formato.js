/** "1 porción", "8 porciones" */
export function pluralizar(cantidad, singular, plural = `${singular}s`) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

/** Número con hasta 2 decimales, en formato local (1,5 · 250 · 0,33). */
export function formatearNumero(numero) {
  return new Intl.NumberFormat("es-CR", { maximumFractionDigits: 2 }).format(numero);
}

/** Fecha y hora legibles, por ejemplo "18 de noviembre de 2026, 06:03". */
export function formatearFecha(iso) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return new Intl.DateTimeFormat("es-CR", { dateStyle: "long", timeStyle: "short" }).format(fecha);
}
