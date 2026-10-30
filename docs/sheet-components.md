# Componentes de hojas de cálculo

Todas las hojas del menú Asistente comparten la presentación basada en Arco Techo. Los motores conservan sus fórmulas y los identificadores que utilizan.

## Componentes Blade (`resources/views/components/sheets/`)

| Componente | Uso | Propiedades |
|---|---|---|
| `workbench` | Página de la hoja: encabezado, superficie, CSS y scripts. | `sheet`, `title`, `description`, `eyebrow`, `entry` (módulo JS), `auto`, `legacy`, `mathjax` |
| `panel` | Panel numerado (01 datos, 02 resultados). | `title`, `description`, `number`, `heading-id`; slot `actions` |
| `fieldset` | Grupo de campos con título y nota. | `title`, `note` |
| `field` | Único control de datos: número o select. | `id`, `label`, `symbol`, `unit`, `value`, `min`, `step`, `options`, `bind`, `name` |
| `label` | Etiqueta con nombre y símbolo (la usa `field`). | `for`, `text`, `symbol` |
| `checkbox` | Casilla con etiqueta y nota. | `id`, `label`, `checked`, `note` |
| `calculate` | Botón Calcular diseño y nota. | `label`, `note`, `type` (`submit` o `button`); atributos como `id` pasan al botón |
| `matrix` | Contenedor de una grilla Tabulator o Handsontable. | `id`, `title`, `note` |
| `results-header` | Estado del cálculo y botones de exportación. | `status-id`, `description`, `exports` (`id => etiqueta`), `sections` |
| `results` | Nodo donde el motor escribe los resultados. | `id`, `empty` |
| `table` | Tabla de resultados accesible con desplazamiento. | `label`, `columns` |
| `figure` | Tarjeta para un dibujo o gráfico. | `title`, `number` |

`field` acepta opciones en dos formas: `['A' => 'Texto']` o `[['value' => 'A', 'name' => 'Texto', 'selected' => true]]`. Con `bind` el campo usa `x-model` (hojas Alpine); sin `bind`, usa `name` y `value` para formularios. Sin `min`, no limita el valor.

Hojas Alpine (madera y acero): `x-input-data`, `x-input-calc`, `x-input-select-calc`, `x-output-data`, `x-table-result`, `x-output-calc` y sus variantes `-input` son adaptadores sobre los componentes `sheets` y conservan los bindings. El componente Alpine se pasa como atributo, `<x-sheets.workbench x-data="diseño_madera">`, y su script se registra en `initscripts` (sin `entry`). `x-table-result` toma la numeración del título ("2.1.- Método LRFD").

## Estilos (`resources/css/`)

- `calc-sheet.css`: entrada única que carga el workbench. Reúne `arco-techo.css`, `beam-sheet.css` y `sheet-legacy.css`, y añade las reglas de los componentes nuevos y de los resultados HTML del servidor (`.sheet-results`, `.sheet-data-table`).
- `beam-sheet.css`: presentación de vigas, tablas y matriz Tabulator. Limitado a `.beam-sheet.arco-sheet`.
- `sheet-legacy.css`: adaptador de las hojas con `legacy`. Solo actúa dentro de `.sheet-legacy`.

## Módulos JS (`resources/js/sheets/`)

- `state.js`: `createSheetState(root)`, con `validate`, `ready`, `markStale`, `setBusy`, `isCurrent` y `error`. Las entradas se identifican con `data-sheet-inputs`; los botones, con `data-sheet-export`. Los cambios en una matriz deben llamar también a `markStale`.
- `auto.js`: con `<x-sheets.workbench auto>`, crea el estado y observa `[data-sheet-results]`. Habilita las exportaciones cuando el motor escribe resultados, sin modificar el motor.
- `export.js`: copia los valores actuales del formulario y descarga la imagen. Mantiene el endpoint `/capturar-viga-fragmento`.
- `resultCard.js`: panel y región desplazable para resultados creados por JavaScript.
- `resources/js/utils/engineError.js`: mensaje legible de una respuesta fallida del motor (Octave), sin volcar HTML.

Plan y estado de la migración de las demás hojas: `docs/uniformizacion-hojas-asistente.md`.

Para incorporar otra hoja, componer los mismos componentes y conectar su motor con `ready()` únicamente al terminar el cálculo. El estado controla si los resultados están actualizados; la selección de acero dentro de los resultados sigue actualizándose sin invalidarlos.

## Captura de imágenes

La captura utiliza Node.js 22 o posterior y un navegador Chrome, Chromium o Edge instalado. No requiere Puppeteer ni paquetes nuevos. Configuración en `config/capture.php` y variables `CAPTURE_NODE_BINARY`, `CAPTURE_BROWSER_BINARY` y `CAPTURE_DISABLE_SANDBOX`. El sandbox permanece activado por defecto. En Linux indicar la ruta del navegador si no se encuentra en las ubicaciones habituales.

`scripts/capture-browser.mjs` crea un perfil temporal privado, desactiva los scripts del HTML recibido y limita los recursos con `scripts/capture-resource-policy.mjs`. Lee los estilos publicados desde `public` para evitar el bloqueo del servidor PHP de un solo trabajador. Solo permite las rutas públicas previstas y rechaza rutas que salgan de ese directorio. En Windows el controlador conserva las variables del sistema necesarias para iniciar el navegador desde PHP web.

Los PNG se generan en `storage/app/private/captures` y se eliminan al enviar la descarga. Los fallos se registran en el servidor; la respuesta pública no incluye los diagnósticos internos.

## Verificación

`php artisan test --compact tests/Feature/BeamSheetTest.php` usa SQLite temporal, sin migrar la base del negocio. Comprueba las vistas, autenticación, validación, respuesta de error y un PNG real.

`node --test tests/frontend/beam-steel.test.mjs tests/frontend/arco-techo.test.mjs tests/frontend/capture-security.test.mjs tests/frontend/sheet-capture.test.mjs` comprueba los aceros y la captura con estilos locales, scripts desactivados y bloqueo de servicios internos. La prueba real de captura necesita el navegador instalado; se omite si no existe.
