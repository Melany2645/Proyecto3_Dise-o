import { crearApp } from "./app.js";
import { config } from "./config.js";

crearApp().listen(config.puerto, () => {
  console.log(`Recetario escuchando en http://localhost:${config.puerto}`);
  console.log(`Datos guardados en: ${config.directorioDatos}`);
});
