import { useRef } from "react";

import { ProveedorAnuncios } from "./accesibilidad/Anunciador";
import { ContextoNavegacion } from "./accesibilidad/TituloPagina";
import { Layout } from "./componentes/Layout";
import { claveDeRuta, useRuta } from "./navegacion/rutas";
import { PaginaDetalle } from "./paginas/PaginaDetalle";
import { PaginaFormulario } from "./paginas/PaginaFormulario";
import { PaginaLista } from "./paginas/PaginaLista";
import { PaginaNoEncontrada } from "./paginas/PaginaNoEncontrada";

function Pagina({ ruta }) {
  switch (ruta.nombre) {
    case "lista":
      return <PaginaLista consulta={ruta.consulta} />;
    case "detalle":
      return <PaginaDetalle id={ruta.id} />;
    case "crear":
      return <PaginaFormulario />;
    case "editar":
      return <PaginaFormulario id={ruta.id} />;
    default:
      return <PaginaNoEncontrada />;
  }
}

function App() {
  const ruta = useRuta();
  const clave = claveDeRuta(ruta);

  // Detecta navegaciones (cambio de ruta) para mover el foco al nuevo <h1>.
  const claveAnterior = useRef(clave);
  const debeEnfocar = useRef(false);
  if (claveAnterior.current !== clave) {
    claveAnterior.current = clave;
    debeEnfocar.current = true;
  }

  return (
    <ProveedorAnuncios>
      <ContextoNavegacion.Provider value={debeEnfocar}>
        <Layout ruta={ruta}>
          {/* key: cada ruta monta su página desde cero (estado limpio). */}
          <Pagina key={clave} ruta={ruta} />
        </Layout>
      </ContextoNavegacion.Provider>
    </ProveedorAnuncios>
  );
}

export default App;
