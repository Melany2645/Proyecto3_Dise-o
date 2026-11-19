import { useEffect, useRef } from "react";

/**
 * Diálogo modal de confirmación construido sobre <dialog> nativo:
 *  - showModal() deja inerte el resto de la página (el foco no puede salir
 *    del diálogo) y el navegador le da role="dialog" + aria-modal.
 *  - Escape cancela; también un clic fuera del recuadro.
 *  - Al abrir, el foco va al botón "Cancelar" (la opción segura en una acción
 *    destructiva); al cerrar, vuelve al elemento que lo abrió.
 *  - Título y mensaje se asocian con aria-labelledby / aria-describedby.
 *
 * Aquí se aplica el patrón WAI-ARIA APG
 */
export function DialogoConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoProcesando = "Procesando…",
  procesando = false,
  error = null,
  alConfirmar,
  alCancelar,
}) {
  const dialogo = useRef(null);
  const botonCancelar = useRef(null);
  const enfocadoAntes = useRef(null);

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;

    if (abierto && !elemento.open) {
      enfocadoAntes.current = document.activeElement;
      if (typeof elemento.showModal === "function") elemento.showModal();
      else elemento.setAttribute("open", ""); // navegadores/entornos sin soporte
      botonCancelar.current?.focus();
    } else if (!abierto && elemento.open) {
      if (typeof elemento.close === "function") elemento.close();
      else elemento.removeAttribute("open");
      enfocadoAntes.current?.focus?.();
    }
  }, [abierto]);

  const cancelar = () => {
    if (!procesando) alCancelar();
  };

  // Evento "cancel" = tecla Escape. Se maneja desde React para que el estado
  // `abierto` siga siendo la única fuente de verdad.
  const alPresionarEscape = (evento) => {
    evento.preventDefault();
    cancelar();
  };

  // Un clic sobre el propio <dialog> (no sobre su contenido) es un clic en el fondo.
  const alHacerClic = (evento) => {
    if (evento.target === dialogo.current) cancelar();
  };

  const confirmar = () => {
    if (!procesando) alConfirmar();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <dialog
      ref={dialogo}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialogo-titulo"
      aria-describedby="dialogo-mensaje"
      className="dialogo"
      onCancel={alPresionarEscape}
      onClick={alHacerClic}
    >
      <div className="dialogo-contenido">
        <h2 id="dialogo-titulo" className="h5">
          {titulo}
        </h2>
        <p id="dialogo-mensaje">{mensaje}</p>

        {error && (
          <div role="alert" className="alert alert-danger py-2">
            {error.message}
          </div>
        )}

        <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
          <button
            ref={botonCancelar}
            type="button"
            className="btn btn-outline-secondary"
            onClick={cancelar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={confirmar}
            aria-disabled={procesando || undefined}
          >
            {procesando ? textoProcesando : textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
