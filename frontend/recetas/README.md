# Recetario: frontend

Interfaz web del recetario de repostería, hecha en React 19 (Create React App) y Bootstrap 5.3. Usa la API REST del backend (`/api/recetas`) para crear, buscar, consultar, editar y eliminar recetas, y para ajustar las porciones de una receta.

## Cómo ejecutarlo

Requiere Node.js 18 o superior.

```bash
# 1. Backend (puerto 3000), en otra terminal
cd backend
npm install
npm start

# 2. Frontend (puerto 3001)
cd frontend/recetas
npm install
npm start
```

Abrir http://localhost:3001. En desarrollo, las peticiones a `/api` pasan al backend mediante el `proxy` de `package.json`. El puerto 3001 se define en `.env`.

| Script | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm test` | Pruebas en modo interactivo (se repiten al guardar cambios) |
| `npm run test:ci` | Corre todas las pruebas una vez |
| `npm run build` | Compilación de producción en `build/` |

## Funcionalidades

- **Lista de recetas** ordenada por nombre y paginada de 5 en 5.
- **Búsqueda** por nombre o por ingrediente. No distingue mayúsculas ni tildes. Los filtros quedan en la URL, así que el botón *Atrás* los conserva.
- **Recetas consultadas recientemente**: las últimas 3.
- **Detalle de la receta**, con la tabla de ingredientes, la fecha de creación y la de última modificación.
- **Ajuste de porciones**: recalcula las cantidades de cada ingrediente en el navegador, según las porciones elegidas.
- **Crear y editar** recetas con un formulario validado. Los ingredientes se pueden agregar y quitar, y las unidades de medida tienen sugerencias.
- **Eliminar**, con un diálogo de confirmación.
- Mensajes de error comprensibles para cada situación: sin conexión, 404, validación y error del servidor.

## Estructura

```
src/
├── accesibilidad/   Anuncios aria-live y título de página con manejo del foco
├── api/             Cliente HTTP del backend y traducción de errores
├── componentes/     Layout, formularios, diálogo, paginación, tarjetas, estados
├── hooks/           useSolicitud: peticiones con cancelación (AbortController)
├── navegacion/      Rutas basadas en el hash de la URL (#/recetas/:id …)
├── paginas/         Lista, Detalle, Formulario (crear/editar), No encontrada
├── pruebas/         Backend simulado en memoria para las pruebas
└── utilidades/      Formato de números/fechas y validación de recetas
```

Las decisiones de diseño más importantes:

- **Navegación por hash, sin dependencias.** Las rutas son `#/`, `#/recetas/nueva`, `#/recetas/:id` y `#/recetas/:id/editar`. Se usan enlaces reales (`<a href>`), el historial del navegador funciona y no hace falta configurar el servidor.
- **La validación usa las mismas reglas que el backend.** [`validacionReceta.js`](src/utilidades/validacionReceta.js) usa los mismos nombres de campo que `RecetaValidator` (`ingredientes[0].cantidad`, …). Por eso los errores del navegador y los que devuelve la API se muestran igual, cada uno en su campo.
- **El backend no cambia.** El ajuste de porciones se calcula en el navegador.

## Accesibilidad

El objetivo es cumplir **WCAG 2.2 nivel AA** y seguir los patrones de la guía **WAI-ARIA Authoring Practices (APG)**. Siempre que se puede se usa HTML semántico nativo, y ARIA solo donde el HTML no alcanza.

| Criterio | Cómo se cumple |
|---|---|
| 1.1.1 Contenido no textual | Los símbolos decorativos (« » + −) llevan `aria-hidden`; los botones de ícono tienen un nombre accesible. |
| 1.3.1 Información y relaciones | Regiones (`header`, `nav`, `main`, `footer`), encabezados en orden (h1 → h2 → h3), `fieldset`/`legend` en el formulario, tabla con `caption`, `scope="col"` y `scope="row"`, listas `ul`/`ol` y datos en `dl`. |
| 1.4.1 Uso del color | La página actual, los errores y los estados se indican también con texto, subrayado o grosor, no solo con color. |
| 1.4.3 / 1.4.11 Contraste | Paleta: Strawberry Red `#B52C4B`, Jam Red `#761D35`, Soft Berry `#8C5264`, Cream Pink `#F4DEE3`, Cheesecake Cream `#FFF4E3` y Camel `#816245`. Strawberry Red sobre Cheesecake Cream: 5.6:1; Jam Red para errores: 9.7:1; Camel para bordes sobre Cheesecake Cream: 5.1:1. |
| 2.1.1 Teclado | Todo es operable con teclado, sin `tabindex` positivos ni elementos `div` que se puedan hacer clic. |
| 2.3.3 Animaciones | Se respeta `prefers-reduced-motion`. |
| 2.4.1 Saltar bloques | Enlace "Saltar al contenido principal", visible al recibir el foco. |
| 2.4.2 Título de página | `document.title` cambia en cada página (por ejemplo "Queque · Recetario"). |
| 2.4.3 Orden del foco | Al cambiar de página, el foco va al `<h1>`. Al cambiar de página de resultados, va al título de resultados. Al agregar o quitar un ingrediente, va a un campo vecino. Al cerrar el diálogo, vuelve al botón que lo abrió. |
| 2.4.4 Propósito de los enlaces | Los enlaces tienen texto descriptivo, por ejemplo "Quitar ingrediente 2, Harina" o "Página siguiente, 2". |
| 2.4.7 / 2.4.11 Foco visible | Contorno de 3px con buen contraste en todos los controles. |
| 3.1.1 Idioma | `<html lang="es">`. |
| 3.3.1 / 3.3.3 Errores | Resumen de errores que recibe el foco, con un enlace a cada campo. `aria-invalid` y un mensaje asociado con `aria-describedby`, con el prefijo "Error:". |
| 3.3.2 Etiquetas | Cada campo tiene un `<label>` visible, más ayudas asociadas con `aria-describedby`. Los obligatorios llevan `aria-required`. |
| 4.1.2 Nombre, función, valor | `aria-current="page"` en la navegación, paginación y ruta de navegación; `aria-disabled` en los botones inactivos (no pierden el foco); `aria-busy` mientras carga. |
| 4.1.3 Mensajes de estado | Región `role="status"` / `aria-live="polite"` para resultados de búsqueda, recetas guardadas o eliminadas y cambios de porciones. `role="alert"` para los errores. |

Patrones de la guía APG que se usan:

- **Diálogo modal / alert dialog:** `<dialog>` nativo con `showModal()` (el resto de la página queda inerte), el foco inicial en "Cancelar", cierre con Escape y devolución del foco.
- **Landmarks** con nombre propio cuando hay más de uno del mismo tipo: "Principal", "Paginación de recetas", "Ruta de navegación".
- **Breadcrumb**: `nav` + `ol` + `aria-current="page"`.
- **Búsqueda**: `form role="search"` con nombre accesible.

### Cómo se verifica

- Pruebas automáticas con **Testing Library**, que buscan los elementos por rol y nombre accesible, como lo hace un lector de pantalla.
- **axe-core** (`jest-axe`) revisa la lista, el detalle y el formulario, tanto vacío como con errores, y la prueba falla si encuentra violaciones de WCAG o ARIA.
- Pruebas específicas de manejo del foco, anuncios `aria-live` y nombres y descripciones accesibles.
- Revisión manual recomendada: recorrer todo con teclado (Tab, Shift+Tab, Enter, Escape) y con un lector de pantalla (NVDA en Windows o VoiceOver en macOS).

> jsdom no calcula estilos, así que axe no puede revisar el contraste en las pruebas automáticas. El contraste se verificó con los valores de la paleta indicados arriba.

## Pruebas

```bash
npm run test:ci
```

| Archivo | Qué cubre |
|---|---|
| `src/utilidades/validacionReceta.test.js` | Reglas de validación y conversión al formato de la API |
| `src/api/recetasApi.test.js` | Armado de peticiones y mensajes de error según el código HTTP |
| `src/navegacion/rutas.test.js` | Interpretación y generación de rutas |
| `src/App.test.js` | Integración: lista, búsqueda, paginación, detalle, porciones, diálogo, formulario, foco, anuncios y axe |
