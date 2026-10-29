# Componentes de hojas de cálculo

Vigas y Vigas general comparten la presentación basada en Arco Techo. Los motores conservan sus fórmulas y los identificadores que utilizan.

- `resources/views/components/sheets/workbench.blade.php`: navegación, encabezado, ancho y distribución adaptable.
- `sheets/panel`, `sheets/fieldset`, `sheets/field`: paneles, grupos y campos numéricos o selects. `field` recibe `id`, `label`, `value`, `symbol`, `unit`, `min`, `step` y, para selects, `options`.
- `sheets/results-header`, `sheets/table`: estado, botones de exportación y tablas accesibles.
- `resources/css/beam-sheet.css`: estilos compartidos, tema automático del sistema, tablas y matriz Tabulator. Sus reglas están limitadas a estas hojas.
- `resources/js/sheets/state.js`: `createSheetState(root)`, con `validate`, `ready`, `markStale`, `setBusy`, `isCurrent` y `error`. Las entradas se identifican con `data-sheet-inputs`; los botones, con `data-sheet-export`. Los cambios en una matriz deben llamar también a `markStale`.
- `resources/js/sheets/export.js`: copia los valores actuales del formulario y descarga la imagen. Mantiene el endpoint `/capturar-viga-fragmento`.
- `resources/js/sheets/resultCard.js`: panel y región desplazable para resultados creados por JavaScript.

Para incorporar otra hoja, componer los mismos componentes y conectar su motor con `ready()` únicamente al terminar el cálculo. El estado controla si los resultados están actualizados; la selección de acero dentro de los resultados sigue actualizándose sin invalidarlos.

## Captura de imágenes

La captura utiliza Node.js 22 o posterior y un navegador Chrome, Chromium o Edge instalado. No requiere Puppeteer ni paquetes nuevos. Configuración en `config/capture.php` y variables `CAPTURE_NODE_BINARY`, `CAPTURE_BROWSER_BINARY` y `CAPTURE_DISABLE_SANDBOX`. El sandbox permanece activado por defecto. En Linux indicar la ruta del navegador si no se encuentra en las ubicaciones habituales.

`scripts/capture-browser.mjs` crea un perfil temporal privado, desactiva los scripts del HTML recibido y limita los recursos con `scripts/capture-resource-policy.mjs`. Lee los estilos publicados desde `public` para evitar el bloqueo del servidor PHP de un solo trabajador. Solo permite las rutas públicas previstas y rechaza rutas que salgan de ese directorio. En Windows el controlador conserva las variables del sistema necesarias para iniciar el navegador desde PHP web.

Los PNG se generan en `storage/app/private/captures` y se eliminan al enviar la descarga. Los fallos se registran en el servidor; la respuesta pública no incluye los diagnósticos internos.

## Verificación

`php artisan test --compact tests/Feature/BeamSheetTest.php` usa SQLite temporal, sin migrar la base del negocio. Comprueba las vistas, autenticación, validación, respuesta de error y un PNG real.

`node --test tests/frontend/beam-steel.test.mjs tests/frontend/arco-techo.test.mjs tests/frontend/capture-security.test.mjs tests/frontend/sheet-capture.test.mjs` comprueba los aceros y la captura con estilos locales, scripts desactivados y bloqueo de servicios internos. La prueba real de captura necesita el navegador instalado; se omite si no existe.
