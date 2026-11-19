import { useId } from "react";

import { rutas } from "../navegacion/rutas";
import { formatearFecha, pluralizar } from "../utilidades/formato";
import { dividirCoincidencia } from "../utilidades/resaltado";

const MAX_INGREDIENTES_VISIBLES = 4;

function TextoResaltado({ texto, busqueda }) {
  return dividirCoincidencia(texto, busqueda).map((parte, indice) =>
    parte.coincide ? <mark key={indice}>{parte.texto}</mark> : <span key={indice}>{parte.texto}</span>,
  );
}

export function TarjetaReceta({ receta, busquedaNombre = "", busquedaIngrediente = "" }) {
  const id = useId();
  const nombres = receta.ingredientes.map((i) => i.nombre);
  const visibles = nombres.slice(0, MAX_INGREDIENTES_VISIBLES);
  const restantes = nombres.length - visibles.length;

  return (
    <article className="card h-100 tarjeta-receta">
      <div className="card-body">
        <h3 className="h5 card-title">
          <a
            href={rutas.detalle(receta.id)}
            className="stretched-link"
            aria-label={receta.nombre}
            aria-describedby={`${id}-resumen ${id}-fecha`}
          >
            <TextoResaltado texto={receta.nombre} busqueda={busquedaNombre} />
          </a>
        </h3>
        <p id={`${id}-resumen`} className="card-text mb-1">
          Rinde {pluralizar(receta.porciones, "porción", "porciones")} ·{" "}
          {pluralizar(receta.ingredientes.length, "ingrediente")}
        </p>
        <p className="card-text text-body-secondary small mb-1">
          {visibles.map((nombre, indice) => (
            <span key={`${nombre}-${indice}`}>
              {indice > 0 && ", "}
              <TextoResaltado texto={nombre} busqueda={busquedaIngrediente} />
            </span>
          ))}
          {restantes > 0 && ` y ${restantes} más`}
        </p>
        <p id={`${id}-fecha`} className="card-text text-body-secondary small mb-0">
          Creada el <time dateTime={receta.creadaEn}>{formatearFecha(receta.creadaEn)}</time>
        </p>
      </div>
    </article>
  );
}
