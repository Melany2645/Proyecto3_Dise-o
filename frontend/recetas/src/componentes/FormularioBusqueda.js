import { useEffect, useRef, useState } from "react";

export const ESPERA_BUSQUEDA_MS = 300;

export function FormularioBusqueda({ nombre, ingrediente, alBuscar }) {
  const [valores, setValores] = useState({ nombre, ingrediente });
  const alBuscarRef = useRef(alBuscar);
  alBuscarRef.current = alBuscar;

  useEffect(() => {
    setValores((previos) =>
      previos.nombre.trim() === nombre && previos.ingrediente.trim() === ingrediente
        ? previos
        : { nombre, ingrediente },
    );
  }, [nombre, ingrediente]);

  useEffect(() => {
    const criterios = { nombre: valores.nombre.trim(), ingrediente: valores.ingrediente.trim() };
    if (criterios.nombre === nombre && criterios.ingrediente === ingrediente) return undefined;
    const temporizador = setTimeout(
      () => alBuscarRef.current(criterios, { inmediata: false }),
      ESPERA_BUSQUEDA_MS,
    );
    return () => clearTimeout(temporizador);
  }, [valores, nombre, ingrediente]);

  const cambiar = (evento) =>
    setValores((previos) => ({ ...previos, [evento.target.name]: evento.target.value }));

  const enviar = (evento) => {
    evento.preventDefault();
    alBuscar(
      { nombre: valores.nombre.trim(), ingrediente: valores.ingrediente.trim() },
      { inmediata: true },
    );
  };

  const limpiar = () => {
    setValores({ nombre: "", ingrediente: "" });
    alBuscar({ nombre: "", ingrediente: "" }, { inmediata: true });
  };

  const hayFiltros =
    nombre !== "" || ingrediente !== "" || valores.nombre !== "" || valores.ingrediente !== "";

  return (
    <form role="search" aria-labelledby="titulo-busqueda" onSubmit={enviar} className="tarjeta-busqueda mb-4">
      <h2 id="titulo-busqueda" className="h5 mb-1">
        Buscar recetas
      </h2>
      <p id="ayuda-busqueda" className="text-body-secondary small mb-3">
        Los resultados se actualizan mientras escribe. Puede escribir solo una parte, por ejemplo
        «pizza», y no importan mayúsculas ni tildes.
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
            aria-controls="resultados-recetas"
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
            aria-controls="resultados-recetas"
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
