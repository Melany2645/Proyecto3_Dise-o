import { Router } from "express";

export function crearRutasReceta(controlador) {
  const router = Router();

  router.post("/", controlador.crear);
  router.get("/", controlador.listar);
  router.get("/recientes", controlador.recientes);
  router.get("/:id", controlador.obtener);
  router.put("/:id", controlador.actualizar);
  router.delete("/:id", controlador.eliminar);

  return router;
}
