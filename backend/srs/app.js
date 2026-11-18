import path from "node:path";
import cors from "cors";
import express from "express";

import { config } from "./config.js";
import { RecetaController } from "./controllers/RecetaController.js";
import { RecetaFactory } from "./factories/RecetaFactory.js";
import { ConstructorDeFiltros } from "./filtros/ConstructorDeFiltros.js";
import {
  manejadorErrores,
  rutaNoEncontrada,
} from "./middleware/manejadorErrores.js";
import { JsonConsultaRepository } from "./repositories/JsonConsultaRepository.js";
import { JsonRecetaRepository } from "./repositories/JsonRecetaRepository.js";
import { crearRutasReceta } from "./routes/recetaRoutes.js";
import { RecetaService } from "./services/RecetaService.js";
import { JsonFileStore } from "./storage/JsonFileStore.js";
import { Paginador } from "./utils/Paginador.js";
import { RecetaValidator } from "./validators/RecetaValidator.js";

export function crearApp(opciones = {}) {
  const cfg = { ...config, ...opciones };

  const factory = new RecetaFactory();

  const recetaRepository = new JsonRecetaRepository({
    almacen: new JsonFileStore(
      path.join(cfg.directorioDatos, "recetas.json"),
      [],
    ),
    factory,
  });
  const consultaRepository = new JsonConsultaRepository({
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
  app.use("/api/recetas", crearRutasReceta(new RecetaController(servicio)));
  app.use(rutaNoEncontrada);
  app.use(manejadorErrores);

  return app;
}
