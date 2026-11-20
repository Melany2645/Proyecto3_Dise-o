# Proyecto3_Dise-o: Recetario de repostería

Proyecto 3 de Diseño de Software. Melany Jirón y Jeremy Montero.

Enlace de repositorio: https://github.com/Melany2645/Proyecto3_Dise-o.git 

Aplicación para registrar recetas de repostería, buscarlas por nombre o ingrediente, consultar las vistas recientemente y ajustar las cantidades según las porciones.

| Parte | Tecnología | Carpeta | Puerto |
|---|---|---|---|
| Backend (API REST) | Node.js + Express 5, guarda los datos en archivos JSON | [`backend/`](backend/) | 3000 |
| Frontend | React 19 + Bootstrap 5.3, accesible (WCAG 2.2 AA) | [`frontend/recetas/`](frontend/recetas/) | 3001 |

## Ejecución

```bash
# Terminal 1: backend
cd backend
npm install
npm start

# Terminal 2: frontend
cd frontend/recetas
npm install
npm start
```

Abrir http://localhost:3001.

## API

Base: `/api/recetas`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/?pagina=&nombre=&ingrediente=` | Lista paginada (5 por página) con filtros |
| `GET` | `/recientes` | Últimas 3 recetas consultadas |
| `GET` | `/:id` | Detalle (la registra como consultada) |
| `POST` | `/` | Crea una receta |
| `PUT` | `/:id` | Actualiza una receta |
| `DELETE` | `/:id` | Elimina una receta |

Cuerpo de una receta:

```json
{
  "nombre": "Queque de vainilla",
  "porciones": 8,
  "ingredientes": [{ "nombre": "Harina", "cantidad": 250, "unidad": "g" }]
}
```

Los errores se devuelven como `{ "error": { "mensaje": "...", "detalles": [{ "campo": "...", "mensaje": "..." }] } }`.

## Patrones de diseño aplicados

- **Backend:**
  - Repository (`JsonRecetasCambios`, `JsonConsultasCambios`).
  - Factory y GRASP Creator (`RecetaFactory`).
  - Strategy y Composite para los filtros de búsqueda.
  - GRASP Experto: la `Receta` sabe buscarse y modificarse.
  - Capa de servicio (`RecetaService`) e inyección de dependencias en `app.js`.
- **Frontend:**
  - Componentes reutilizables.
  - Hook personalizado para las peticiones (`useSolicitud`).
  - Cliente de la API centralizado.
  - Proveedor de contexto para los anuncios accesibles.

Más detalles del frontend, incluido cómo se cumplen los criterios de accesibilidad, en [`frontend/recetas/README.md`](frontend/recetas/README.md).
