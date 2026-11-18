import path from "node:path";
import cors from "cors";
import express from "express";

import { config } from "./confi.js";
import { Controlador } from "./controlador/controlador.js";
import { RecetaFactory } from "./crearReceta/CrearReceta.js";
import { ConstructorDeFiltros } from "./filtros/CrearFiltro.js";
import {
  manejadorErrores,
  rutaNoEncontrada,
} from "./middleware/manejardorErrores.js";
import { JsonConsultasCambios } from "./consultas/JsonConsulrtasCambio.js";
import { JsonRecetasCambios } from "./consultas/JsonRecetasCambios.js";
import { crearRutasReceta } from "./rutas/Rutas.js";
import { RecetaService } from "./reglas/RecetasReglas.js";
import { JsonFileStore } from "./manejadorJson/ManejadorJson.js";
import { Paginador } from "./utilidades/Paginador.js";
import { RecetaValidator } from "./valicaciones/RecetaValidacion.js";

export function crearApp(opciones = {}) {
  const cfg = { ...config, ...opciones };

  const factory = new RecetaFactory();

  const recetaRepository = new JsonRecetasCambios({
    almacen: new JsonFileStore(
      path.join(cfg.directorioDatos, "recetas.json"),
      [],
    ),
    factory,
  });
  const consultaRepository = new JsonConsultasCambios({
    almacen: new JsonFileStore(
      path.join(cfg.directorioDatos, "consultas.json"),
      [],
    ),
    maximo: cfg.historialMaximo,
  });

  const servicio = new RecetaService({
    recetaRepository,
    consultaRepository,
    factory,
    validador: new RecetaValidator(),
    constructorFiltros: new ConstructorDeFiltros(),
    paginador: new Paginador(cfg.recetasPorPagina),
    cantidadRecientes: cfg.cantidadRecientes,
  });

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use("/api/recetas", crearRutasReceta(new Controlador(servicio)));
  app.use(rutaNoEncontrada);
  app.use(manejadorErrores);

  return app;
}
