import { useEffect, useRef, useState } from "react";

import { useAnunciar } from "../accesibilidad/Anunciador";
import { ErrorApi } from "../api/recetasApi";
import {
  MAX_NOMBRE,
  MAX_UNIDAD,
  UNIDADES_SUGERIDAS,
  aCuerpoApi,
  erroresDesdeApi,
  validarReceta,
} from "../utilidades/validacionReceta";
import { CampoTexto } from "./CampoTexto";
import { MensajeError } from "./Estados";
import { ResumenErrores } from "./ResumenErrores";

let contadorClaves = 0;
const nuevaClave = () => `ing-${++contadorClaves}`;

const ingredienteVacio = () => ({ clave: nuevaClave(), nombre: "", cantidad: "", unidad: "" });

function valoresIniciales(receta) {
  if (!receta) return { nombre: "", porciones: "", ingredientes: [ingredienteVacio()] };
  return {
    nombre: receta.nombre,
    porciones: String(receta.porciones),
    ingredientes: receta.ingredientes.map((i) => ({
      clave: nuevaClave(),
      nombre: i.nombre,
      cantidad: String(i.cantidad),
      unidad: i.unidad,
    })),
  };
}

/**
 * Formulario para crear o editar una receta.
 *
 * @param {{receta?: object, textoGuardar: string, hrefCancelar: string,
 *          alGuardar: (cuerpo: object) => Promise<void>}} props
 */
export function FormularioReceta({ receta, textoGuardar, hrefCancelar, alGuardar }) {
  const anunciar = useAnunciar();
  const [valores, setValores] = useState(() => valoresIniciales(receta));
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  // Errores que devolvió el backend; se descartan en cuanto el usuario edita.
  const [erroresApi, setErroresApi] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);

  const resumen = useRef(null);
  const enfocarResumen = useRef(false);
  const campoPorEnfocar = useRef(null);

  // Los errores se muestran a partir del primer intento de envío y se
  // recalculan en cada cambio, así desaparecen a medida que se corrigen.
  const errores = erroresApi ?? (intentoEnviar ? validarReceta(valores) : {});

  const actualizar = (cambio) => {
    setValores(cambio);
    setErroresApi(null);
  };

  const cambiarCampo = (campo) => (valor) => actualizar((v) => ({ ...v, [campo]: valor }));

  const cambiarIngrediente = (clave, campo) => (valor) =>
    actualizar((v) => ({
      ...v,
      ingredientes: v.ingredientes.map((i) => (i.clave === clave ? { ...i, [campo]: valor } : i)),
    }));

  const agregarIngrediente = () => {
    const nuevo = ingredienteVacio();
    campoPorEnfocar.current = `${nuevo.clave}-nombre`;
    actualizar((v) => ({ ...v, ingredientes: [...v.ingredientes, nuevo] }));
    anunciar(`Ingrediente ${valores.ingredientes.length + 1} agregado.`);
  };

  const quitarIngrediente = (indice) => {
    const lista = valores.ingredientes;
    const quitado = lista[indice];
    // El foco pasa al siguiente ingrediente, o al anterior si era el último.
    const vecino = lista[indice + 1] ?? lista[indice - 1];
    campoPorEnfocar.current = vecino ? `${vecino.clave}-nombre` : "boton-agregar-ingrediente";
    actualizar((v) => ({ ...v, ingredientes: v.ingredientes.filter((i) => i.clave !== quitado.clave) }));
    anunciar(`Ingrediente ${quitado.nombre.trim() || indice + 1} quitado.`);
  };

  useEffect(() => {
    if (campoPorEnfocar.current) {
      document.getElementById(campoPorEnfocar.current)?.focus();
      campoPorEnfocar.current = null;
    }
    if (enfocarResumen.current) {
      enfocarResumen.current = false;
      resumen.current?.focus();
    }
  });

  const enviar = async (evento) => {
    evento.preventDefault();
    if (guardando) return;

    setIntentoEnviar(true);
    setErrorGeneral(null);
    setErroresApi(null);
    if (Object.keys(validarReceta(valores)).length > 0) {
      enfocarResumen.current = true;
      return;
    }

    setGuardando(true);
    try {
      await alGuardar(aCuerpoApi(valores));
    } catch (error) {
      setGuardando(false);
      if (error instanceof ErrorApi && error.estado === 400 && error.detalles.length > 0) {
        setErroresApi(erroresDesdeApi(error.detalles));
        enfocarResumen.current = true;
      } else {
        setErrorGeneral(error);
      }
    }
  };

  // Id del elemento que recibe el foco al elegir un error en el resumen.
  const idDeCampo = (campo) => {
    const coincidencia = campo.match(/^ingredientes\[(\d+)\]\.(\w+)$/);
    if (coincidencia) {
      const ingrediente = valores.ingredientes[Number(coincidencia[1])];
      return ingrediente ? `${ingrediente.clave}-${coincidencia[2]}` : "boton-agregar-ingrediente";
    }
    if (campo === "ingredientes") return "boton-agregar-ingrediente";
    return `campo-${campo}`;
  };

  // Mismo orden en que aparecen los campos en pantalla.
  const ordenCampos = [
    "nombre",
    "porciones",
    "ingredientes",
    ...valores.ingredientes.flatMap((_, i) =>
      ["nombre", "cantidad", "unidad"].map((c) => `ingredientes[${i}].${c}`),
    ),
  ];
  const listaErrores = [
    ...ordenCampos.filter((c) => errores[c]),
    ...Object.keys(errores).filter((c) => !ordenCampos.includes(c)),
  ].map((campo) => ({ campo, mensaje: errores[campo], idCampo: idDeCampo(campo) }));

  return (
    <form noValidate onSubmit={enviar} aria-describedby="nota-obligatorios">
      <ResumenErrores ref={resumen} errores={listaErrores} />
      {errorGeneral && <MensajeError titulo="No se pudo guardar la receta." error={errorGeneral} />}

      <p id="nota-obligatorios" className="text-body-secondary">
        Todos los campos son obligatorios.
      </p>

      <fieldset className="grupo-formulario">
        <legend className="h5">Datos generales</legend>
        <div className="row g-3">
          <CampoTexto
            id="campo-nombre"
            className="col-md-8"
            etiqueta="Nombre de la receta"
            valor={valores.nombre}
            alCambiar={cambiarCampo("nombre")}
            error={errores.nombre}
            maxLength={MAX_NOMBRE}
            autoComplete="off"
          />
          <CampoTexto
            id="campo-porciones"
            className="col-md-4"
            etiqueta="Porciones que rinde"
            valor={valores.porciones}
            alCambiar={cambiarCampo("porciones")}
            error={errores.porciones}
            ayuda="Número entero, por ejemplo 8."
            inputMode="numeric"
            autoComplete="off"
          />
        </div>
      </fieldset>

      <fieldset className="grupo-formulario">
        <legend className="h5">Ingredientes</legend>
        <p id="ayuda-ingredientes" className="form-text mt-0">
          Indique cada ingrediente con su cantidad y unidad de medida (g, taza, cucharada…). Puede
          usar decimales con coma o punto, por ejemplo 1,5.
        </p>
        {errores.ingredientes && (
          <p className="texto-error">
            <span className="visually-hidden">Error: </span>
            {errores.ingredientes}
          </p>
        )}

        <ol className="list-unstyled lista-ingredientes-form">
          {valores.ingredientes.map((ingrediente, indice) => {
            const campo = `ingredientes[${indice}]`;
            const numero = indice + 1;
            return (
              <li key={ingrediente.clave}>
                <fieldset className="ingrediente-form">
                  <legend className="h6">Ingrediente {numero}</legend>
                  <div className="row g-2 align-items-start">
                    <CampoTexto
                      id={`${ingrediente.clave}-nombre`}
                      className="col-md-5"
                      etiqueta="Nombre"
                      valor={ingrediente.nombre}
                      alCambiar={cambiarIngrediente(ingrediente.clave, "nombre")}
                      error={errores[`${campo}.nombre`]}
                      maxLength={MAX_NOMBRE}
                      autoComplete="off"
                    />
                    <CampoTexto
                      id={`${ingrediente.clave}-cantidad`}
                      className="col-6 col-md-2"
                      etiqueta="Cantidad"
                      valor={ingrediente.cantidad}
                      alCambiar={cambiarIngrediente(ingrediente.clave, "cantidad")}
                      error={errores[`${campo}.cantidad`]}
                      inputMode="decimal"
                      autoComplete="off"
                    />
                    <CampoTexto
                      id={`${ingrediente.clave}-unidad`}
                      className="col-6 col-md-3"
                      etiqueta="Unidad"
                      valor={ingrediente.unidad}
                      alCambiar={cambiarIngrediente(ingrediente.clave, "unidad")}
                      error={errores[`${campo}.unidad`]}
                      list="unidades-sugeridas"
                      maxLength={MAX_UNIDAD}
                      autoComplete="off"
                    />
                    {valores.ingredientes.length > 1 && (
                      <div className="col-md-2 d-flex align-items-end boton-quitar">
                        <button
                          type="button"
                          className="btn btn-outline-danger w-100"
                          onClick={() => quitarIngrediente(indice)}
                          aria-label={`Quitar ingrediente ${numero}${ingrediente.nombre.trim() ? `, ${ingrediente.nombre.trim()}` : ""}`}
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                </fieldset>
              </li>
            );
          })}
        </ol>

        <datalist id="unidades-sugeridas">
          {UNIDADES_SUGERIDAS.map((unidad) => (
            <option key={unidad} value={unidad} />
          ))}
        </datalist>

        <button
          id="boton-agregar-ingrediente"
          type="button"
          className="btn btn-outline-primary"
          onClick={agregarIngrediente}
        >
          <span aria-hidden="true">+ </span>Agregar ingrediente
        </button>
      </fieldset>

      <div className="d-flex flex-wrap gap-2 mt-4">
        <button type="submit" className="btn btn-primary" aria-disabled={guardando || undefined}>
          {guardando ? "Guardando…" : textoGuardar}
        </button>
        <a href={hrefCancelar} className="btn btn-outline-secondary">
          Cancelar
        </a>
      </div>
    </form>
  );
}
