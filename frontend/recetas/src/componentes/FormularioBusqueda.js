import { useEffect, useState } from "react";

/**
 * Búsqueda por nombre y/o ingrediente.
 * - role="search" crea la región de búsqueda para lectores de pantalla.
 * - Cada campo tiene <label> visible asociado y una ayuda con aria-describedby.
 * - Los valores se sincronizan con la URL, así "Atrás" restaura la búsqueda.
 *
 * @param {{nombre: string, ingrediente: string,
 *          alBuscar: (criterios: {nombre: string, ingrediente: string}) => void}} props
 */
export function FormularioBusqueda({ nombre, ingrediente, alBuscar }) {
  const [valores, setValores] = useState({ nombre, ingrediente });

  useEffect(() => {
    setValores({ nombre, ingrediente });
  }, [nombre, ingrediente]);

  const cambiar = (evento) =>
    setValores((previos) => ({ ...previos, [evento.target.name]: evento.target.value }));

  const enviar = (evento) => {
    evento.preventDefault();
    alBuscar({ nombre: valores.nombre.trim(), ingrediente: valores.ingrediente.trim() });
  };

  const limpiar = () => {
    setValores({ nombre: "", ingrediente: "" });
    alBuscar({ nombre: "", ingrediente: "" });
  };

  const hayFiltros = nombre !== "" || ingrediente !== "";

  return (
    <form role="search" aria-labelledby="titulo-busqueda" onSubmit={enviar} className="tarjeta-busqueda mb-4">
      <h2 id="titulo-busqueda" className="h5 mb-1">
        Buscar recetas
      </h2>
      <p id="ayuda-busqueda" className="text-body-secondary small mb-3">
        Puede buscar por nombre, por ingrediente o por ambos. No importan mayúsculas ni tildes.
      </p>

      <div className="row g-3 align-items-end">
        <div className="col-md-5">
          <label htmlFor="buscar-nombre" className="form-label">
            Nombre de la receta
          </label>
          <input
            id="buscar-nombre"
            name="nombre"
            type="search"
            className="form-control"
            value={valores.nombre}
            onChange={cambiar}
            aria-describedby="ayuda-busqueda"
            autoComplete="off"
          />
        </div>
        <div className="col-md-5">
          <label htmlFor="buscar-ingrediente" className="form-label">
            Ingrediente
          </label>
          <input
            id="buscar-ingrediente"
            name="ingrediente"
            type="search"
            className="form-control"
            value={valores.ingrediente}
            onChange={cambiar}
            aria-describedby="ayuda-busqueda"
            autoComplete="off"
          />
        </div>
        <div className="col-md-2 d-flex gap-2 flex-md-column">
          <button type="submit" className="btn btn-primary">
            Buscar
          </button>
          {hayFiltros && (
            <button type="button" className="btn btn-outline-secondary" onClick={limpiar}>
              Limpiar
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
