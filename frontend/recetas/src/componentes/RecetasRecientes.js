import { recetasApi } from "../api/recetasApi";
import { useSolicitud } from "../hooks/useSolicitud";
import { rutas } from "../navegacion/rutas";
import { pluralizar } from "../utilidades/formato";
import { Cargando, MensajeError } from "./Estados";

/** Últimas recetas consultadas (las devuelve el backend, la más reciente primero). */
export function RecetasRecientes() {
  const { estado, datos, error, recargar } = useSolicitud((signal) => recetasApi.recientes(signal), []);

  const recetas = datos?.datos ?? [];

  return (
    <section aria-labelledby="titulo-recientes" className="tarjeta-recientes">
      <h2 id="titulo-recientes" className="h5">
        Consultadas recientemente
      </h2>

      {estado === "cargando" && !datos && <Cargando texto="Cargando recetas recientes…" />}
      {estado === "error" && (
        <MensajeError
          titulo="No se pudieron cargar las recetas recientes."
          error={error}
          alReintentar={recargar}
        />
      )}

      {datos &&
        (recetas.length === 0 ? (
          <p className="mb-0">Todavía no ha consultado ninguna receta.</p>
        ) : (
          <ol className="list-unstyled mb-0 lista-recientes">
            {recetas.map((receta) => (
              <li key={receta.id}>
                <a href={rutas.detalle(receta.id)}>{receta.nombre}</a>
                <span className="d-block small text-body-secondary">
                  {pluralizar(receta.porciones, "porción", "porciones")}
                </span>
              </li>
            ))}
          </ol>
        ))}
    </section>
  );
}
