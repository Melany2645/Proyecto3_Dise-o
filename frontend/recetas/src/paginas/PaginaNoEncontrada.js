import { TituloPagina } from "../accesibilidad/TituloPagina";
import { rutas } from "../navegacion/rutas";

export function PaginaNoEncontrada() {
  return (
    <>
      <TituloPagina>Página no encontrada</TituloPagina>
      <p>La dirección que intenta abrir no existe.</p>
      <a href={rutas.lista()} className="btn btn-primary">
        Volver a la lista de recetas
      </a>
    </>
  );
}
