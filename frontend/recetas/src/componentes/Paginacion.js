/**
 * Navegación entre páginas de resultados.
 * - Es un <nav> con nombre propio para distinguirlo de la navegación principal.
 * - La página actual lleva aria-current="page" y además se ve resaltada.
 * - Los botones deshabilitados no son enlaces (no reciben foco ni se activan).
 *
 * @param {{paginaActual: number, totalPaginas: number,
 *          hrefDePagina: (pagina: number) => string,
 *          alCambiar?: () => void}} props
 */
export function Paginacion({ paginaActual, totalPaginas, hrefDePagina, alCambiar }) {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <nav aria-label="Paginación de recetas" className="mt-4">
      <ul className="pagination flex-wrap">
        <BotonExtremo
          href={hrefDePagina(paginaActual - 1)}
          deshabilitado={paginaActual <= 1}
          etiqueta={`Página anterior, ${paginaActual - 1}`}
          alCambiar={alCambiar}
        >
          <span aria-hidden="true">«</span> Anterior
        </BotonExtremo>

        {paginas.map((pagina) => {
          const esActual = pagina === paginaActual;
          return (
            <li key={pagina} className={`page-item${esActual ? " active" : ""}`}>
              <a
                className="page-link"
                href={hrefDePagina(pagina)}
                aria-current={esActual ? "page" : undefined}
                aria-label={`Página ${pagina}`}
                onClick={alCambiar}
              >
                {pagina}
              </a>
            </li>
          );
        })}

        <BotonExtremo
          href={hrefDePagina(paginaActual + 1)}
          deshabilitado={paginaActual >= totalPaginas}
          etiqueta={`Página siguiente, ${paginaActual + 1}`}
          alCambiar={alCambiar}
        >
          Siguiente <span aria-hidden="true">»</span>
        </BotonExtremo>
      </ul>
    </nav>
  );
}

function BotonExtremo({ href, deshabilitado, etiqueta, alCambiar, children }) {
  return (
    <li className={`page-item${deshabilitado ? " disabled" : ""}`}>
      {deshabilitado ? (
        <span className="page-link" aria-disabled="true">
          {children}
        </span>
      ) : (
        <a className="page-link" href={href} aria-label={etiqueta} onClick={alCambiar}>
          {children}
        </a>
      )}
    </li>
  );
}
