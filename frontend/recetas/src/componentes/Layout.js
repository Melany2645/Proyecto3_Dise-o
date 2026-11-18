import { rutas } from "../navegacion/rutas";

/**
 * Estructura común de todas las páginas, con regiones (landmarks) nativas:
 * banner (header), navegación, contenido principal (main) e información (footer).
 */
export function Layout({ ruta, children }) {
  const saltarAlContenido = (evento) => {
    // El hash se usa para navegar, así que se mueve el foco sin cambiar la URL.
    evento.preventDefault();
    document.getElementById("contenido")?.focus();
  };

  const actual = (nombre) => (ruta.nombre === nombre ? "page" : undefined);

  return (
    <>
      <a href="#contenido" className="enlace-saltar" onClick={saltarAlContenido}>
        Saltar al contenido principal
      </a>

      <header className="encabezado-sitio">
        <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2 py-3">
          <a href={rutas.lista()} className="marca">
            <span aria-hidden="true"></span>Recetario
          </a>
          <nav aria-label="Principal">
            <ul className="nav gap-1">
              <li className="nav-item">
                <a href={rutas.lista()} className="nav-link" aria-current={actual("lista")}>
                  Recetas
                </a>
              </li>
              <li className="nav-item">
                <a href={rutas.nueva()} className="nav-link" aria-current={actual("crear")}>
                  Nueva receta
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="contenido" tabIndex={-1} className="container py-4">
        {children}
      </main>

      <footer className="pie-sitio">
        <div className="container py-3">
          <p className="mb-0">Recetario de repostería</p>
        </div>
      </footer>
    </>
  );
}
