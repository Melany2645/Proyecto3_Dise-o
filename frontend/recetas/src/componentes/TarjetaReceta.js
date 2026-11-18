import { rutas } from "../navegacion/rutas";
import { pluralizar } from "../utilidades/formato";

const MAX_INGREDIENTES_VISIBLES = 4;

/**
 * Resumen de una receta dentro de la lista. El nombre es el único enlace
 * (un solo punto de tabulación por tarjeta) y es un encabezado de nivel 3,
 * así se puede saltar de receta en receta con el lector de pantalla.
 */
export function TarjetaReceta({ receta }) {
  const nombres = receta.ingredientes.map((i) => i.nombre);
  const visibles = nombres.slice(0, MAX_INGREDIENTES_VISIBLES);
  const restantes = nombres.length - visibles.length;

  return (
    <article className="card h-100 tarjeta-receta">
      <div className="card-body">
        <h3 className="h5 card-title">
          <a href={rutas.detalle(receta.id)} className="stretched-link">
            {receta.nombre}
          </a>
        </h3>
        <p className="card-text mb-1">
          Rinde {pluralizar(receta.porciones, "porción", "porciones")} ·{" "}
          {pluralizar(receta.ingredientes.length, "ingrediente")}
        </p>
        <p className="card-text text-body-secondary small mb-0">
          {visibles.join(", ")}
          {restantes > 0 && ` y ${restantes} más`}
        </p>
      </div>
    </article>
  );
}
