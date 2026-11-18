import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/**
 * Región "aria-live" global para avisar a los lectores de pantalla de cambios
 * que no implican mover el foco (resultados de búsqueda, receta guardada, etc.).
 * Se limpia el texto antes de escribirlo para que un mismo mensaje repetido
 * se vuelva a leer.
 */
const ContextoAnuncios = createContext(() => {});

export function ProveedorAnuncios({ children }) {
  const [mensaje, setMensaje] = useState("");
  const temporizador = useRef();

  const anunciar = useCallback((texto) => {
    clearTimeout(temporizador.current);
    setMensaje("");
    temporizador.current = setTimeout(() => setMensaje(texto), 100);
  }, []);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  return (
    <ContextoAnuncios.Provider value={anunciar}>
      {children}
      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {mensaje}
      </div>
    </ContextoAnuncios.Provider>
  );
}

export function useAnunciar() {
  return useContext(ContextoAnuncios);
}
