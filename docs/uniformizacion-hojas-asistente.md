# Uniformización de las hojas del menú Asistente

Objetivo: que todas las hojas del menú **Asistente** usen la presentación de **Diseño de vigas general**. Debe ser un diseño sobrio, de oficina de ingeniería, sin recursos decorativos. Los motores de cálculo no cambian: se conservan sus fórmulas, sus identificadores y sus endpoints.

Componentes y estilos base: `docs/sheet-components.md`.

## Reglas de diseño

**Estructura de cada hoja**

1. Encabezado `x-engineering-header`: ruta (`Herramientas de ingeniería / <disciplina>`), título y una descripción de una o dos oraciones que diga qué verifica la hoja y con qué norma.
2. Panel **01 · Datos generales**: campos agrupados en `fieldset` por tema (materiales, geometría, cargas, suelo). Cada campo lleva nombre, símbolo y unidad. Debajo, el botón **Calcular diseño**.
3. Bloque de resultados: panel **02 · Resultados del diseño**, con el estado (pendiente, actualizado, desactualizado, error) y los botones de exportación. Debajo, una tarjeta por sección de cálculo con su número y su tabla.

**Tablas de resultados**: columnas *Parámetro · Símbolo · Fórmula · Resultado*. El resultado incluye su unidad, va alineado a la derecha y en el color de acento. Las verificaciones muestran el texto del motor (cumple / no cumple) sin iconos añadidos.

**Texto**

- Español técnico, en tono neutro. Nada de frases de marketing ni de signos de exclamación.
- Mayúsculas solo al inicio: "Método LRFD", "Resistencia a la fractura por tensión".
- Ortografía y tildes correctas: sección, compresión, mínimo, tracción, albañilería.
- Unidades en notación de ingeniería: kg/cm², cm², cm⁴, t·m, kg·m.
- La numeración de secciones la da el componente; no se escribe en el título ("1.- ").

**Qué no hacer**

- Sin degradados, sombras marcadas, emojis, iconos decorativos ni animaciones.
- Sin colores fuera de los tokens `--pr-*`. Los modos claro y oscuro salen de esos tokens.
- Sin clases de Tailwind de color (`bg-blue-500`, `bg-gray-100`, `dark:...`) dentro de las hojas migradas.

## Componentes

- **Hojas nuevas o reescritas:** `x-sheets.workbench`, `x-sheets.panel`, `x-sheets.fieldset`, `x-sheets.field`, `x-sheets.results-header` y `x-sheets.table`.
- **Hojas reactivas con Alpine (madera y acero):** los componentes `x-input-data`, `x-input-calc`, `x-input-select-calc`, `x-output-data`, `x-table-result`, `x-output-calc` y sus variantes `-input` generan el mismo marcado que los componentes `sheets`. Conservan los bindings `x-model`, `x-text` y `x-effect`.
- **Resultados que construye el JS:** `resources/js/sheets/resultCard.js`.
- **Controles adicionales:** `x-sheets.checkbox`, `x-sheets.calculate` (botón Calcular diseño; admite `type="button"` e `id` cuando el motor escucha un clic), `x-sheets.matrix` (contenedor para Tabulator o Handsontable) y `x-sheets.figure` (dibujos y gráficos).
- **Destino de resultados:** `x-sheets.results id="..."` marca el nodo donde escribe el motor. Con `<x-sheets.workbench auto>`, `resources/js/sheets/auto.js` observa ese nodo: habilita las exportaciones cuando aparecen resultados y los marca como desactualizados al editar los datos. No hace falta modificar el motor.
- **Tablas de entrada que arma el motor** (columnas por tramo): `table.sheet-data-table`. Si el motor identifica las filas por su texto (losas aligeradas), ese texto no se cambia.
- **Resultados HTML que devuelve el servidor** (zapatas, losas, cimiento corrido, muros de albañilería, columnas): se envuelven en `.sheet-data-table` dentro de una tarjeta de resultados. El contenido de las vistas `resultado*.blade.php` se ajusta en la fase de cada hoja.

## Inventario

Ruta base: `calculadora/asistente/`. Vista en `resources/views/`.

| # | Hoja | Vista | Motor | Fase |
|---|---|---|---|---|
| 1 | Diseño de vigas | `hcalculo/admdesingvigas` | JS | Hecha (referencia) |
| 2 | Diseño de vigas general | `hcalculo/admvigageneral` | JS | Hecha (referencia) |
| 3 | Madera · Correas | `hcalculo/admdesingcorreas` | JS | 2 |
| 4 | Madera · Flexocompresión | `hcalculo/diseno_en_madera/flexo_compresion` | Alpine | 1 |
| 5 | Madera · Compresión | `hcalculo/diseno_en_madera/compresion` | Alpine | 1 |
| 6 | Madera · Tracción | `hcalculo/diseno_en_madera/traccion` | Alpine | 1 |
| 7 | Madera · Flexotracción | `hcalculo/diseno_en_madera/flexo_traccion` | Alpine | 1 |
| 8 | Acero · Compresión | `hcalculo/diseno_en_acero/compresion` | Alpine | 1 |
| 9 | Acero · Tracción | `hcalculo/diseno_en_acero/traccion` | Alpine | 1 |
| 10 | Losas macizas | `hcalculo/admlosasmacizas` | JS | 2 |
| 11 | Losas aligeradas | `hcalculo/admlosasaligeradas` | Servidor (HTML) | 2 |
| 12 | Cimiento corrido | `hcalculo/admCimientoCorrido` | Servidor (HTML) | 3 |
| 13 | Zapata general | `hcalculo/admdesingZapataGeneral` | Servidor (HTML) | 3 |
| 14 | Zapata combinada | `hcalculo/admZapataCombinada` | Servidor (HTML) | 3 |
| 15 | Zapata conectada | `hcalculo/admZapataConectada` | Servidor (HTML) | 3 |
| 16 | Columnas | `hcalculo/admdesingcolumna` | Servidor (HTML) | 4 |
| 17 | Columnas II | `hcalculo/adm_columnaII` | JS (`columnav2`) | 4 |
| 18 | Columnas de acero | `hcalculo/admdesingcolumnaAcero` | JS | 4 |
| 19 | Placas L | `hcalculo/admdesingPlacasL` | JS | 4 |
| 20 | Escaleras | `hcalculo/admDesingEscaleras` | JS | 5 |
| 21 | Muros de albañilería | `hcalculo/admMurosAlbanieria` | Servidor (HTML) | 5 |
| 22 | Muros de contención | `hcalculo/admMurosContencion` | JS | 5 |
| 23 | Muros de contención V2 | `muros-contencion/index` | JS (módulo) | 5 |
| 24 | Cerco perimétrico | `hcalculo/adm_CercoPerimetrico` | JS + dibujo | 6 |
| 25 | Irregularidades | `hcalculo/admIrregularidades` | JS | 6 |
| 26 | Espectro sísmico | `hcalculo/espectro-sismico` | JS (módulo) | 6 |

Las copias en `resources/views/hcalculo/hcalculo/` no tienen ruta y no se migran.

## Fases

1. **Madera y acero (6 hojas).** Rediseño de los componentes compartidos y paso de las vistas a `x-sheets.workbench`. Valida el sistema en hojas pequeñas y reactivas.
2. **Losas y correas.** Primera hoja con resultados HTML del servidor (losas aligeradas).
3. **Cimentaciones:** cimiento corrido y zapatas general, combinada y conectada. Comparten patrón de formulario y resultado de servidor.
4. **Columnas y placas.**
5. **Escaleras y muros.** Son las hojas más extensas: muros de contención tiene unas 1100 líneas y la V2 unas 3000.
6. **Cerco perimétrico, irregularidades y espectro sísmico.** Incluyen dibujos y gráficos propios; se adapta su contenedor sin rehacer el dibujo.

Criterio de cierre de cada fase:

- Las hojas de la fase usan la estructura descrita.
- Los cálculos dan los mismos resultados que antes con los mismos datos.
- Hay un test de vista que comprueba el workbench y los identificadores que usa el motor.
- `npm run build` pasa sin errores.

## Dos niveles de migración

Todas las hojas del menú usan ya `x-sheets.workbench`: encabezado, superficie, tipografía y tokens comunes. Cada hoja está en uno de estos niveles:

1. **Adaptada (`legacy`):** conserva su marcado propio dentro de `.sheet-legacy`. `resources/css/sheet-legacy.css` lleva sus clases de Tailwind (tarjetas, campos, botones, tablas y colores) a los tokens de la hoja. No cambia identificadores ni motores. Se aplica en un solo paso y deja una presentación uniforme.
2. **Migrada:** el marcado se reescribe con los componentes `sheets` (panel 01 de datos, panel 02 de resultados y tarjetas numeradas), con nombres, símbolos y unidades revisados. Es el estado final.

Las fases 3 a 6 llevan cada hoja del nivel 1 al nivel 2. Al migrar una hoja se quita `legacy` y se mueve su caso de `legacySheets()` a `engineSheets()` en `tests/Feature/AsistenteSheetsTest.php`.

Deuda detectada en las hojas adaptadas:

- `admIrregularidades`: incluye `<!DOCTYPE html>`, `<html>` y `<head>` dentro del cuerpo de la página, además de un bloque `<style>` posterior al componente. Se corrige al migrarla.
- `adm_columnaII`: usa un diseño de pantalla completa con barra lateral (`h-screen`). Se reorganiza en paneles al migrarla.

## Seguimiento

- [x] Referencia: vigas y vigas general.
- [x] Fase 1: madera (4) y acero (2). Migradas.
- [x] Fase 2: losas macizas, losas aligeradas y correas. Migradas.
- [x] Todas las demás hojas sobre el workbench en modo adaptado.
- [x] Fase 3: cimiento corrido y zapatas general, combinada y conectada. Migradas.
- [ ] Fase 4: columnas y columnas de acero migradas; pendientes columnas II y placas L.
- [ ] Fase 5: escaleras y muros de albañilería migradas; pendientes muros de contención y muros de contención V2.
- [ ] Fase 6: cerco perimétrico, irregularidades y espectro sísmico.

Notas de las hojas migradas:

- Las tablas de resultados extensas con celdas de id fijo (columnas de acero, escaleras) están en `resources/views/hcalculo/partials/`, sin clases de Tailwind. La vista principal solo compone los componentes.
- Las secciones desplegables usan `x-sheets.section` (`<details>` nativo) en lugar de botones y scripts de alternancia.
- Las librerías de CDN quedan con versión fija (Handsontable 14.6.1, ECharts 5.5.1, Chart.js 4.4.4, HyperFormula 2.7.1).
- Placas L: el motor abre las secciones `content2`…`content8` quitando la clase `hidden` y usa `.btn-captura-bloque`; su migración debe conservar ese contrato o ajustar `resources/js/placasFormaL/`. La vista actual contiene botones duplicados y restos de un conflicto de merge.

Menú Estudiante:

- Las 11 hojas (`hcalculo/CAV2/*` y `adm_vigas_T`) usan el workbench con la ruta "Estudiante · Concreto armado". Combinación de cargas está migrada; las demás están en modo adaptado.
- Las hojas CAV2 comparten el contrato de `resources/js/calc/calc_layout.js` (`doCalcs`): campos por `id`, contenedor `#resultados` con elementos cuyo `id` es el nombre de la variable y botón `#calcular`. Calculan al cargar, por eso su destino usa `<x-sheets.results id="resultados" ready>`. Al migrarlas basta con conservar esos ids.
- Se corrigieron títulos equivocados: Distribución del acero decía "Diseño de Aligerados" y Vigas continuas decía "Diseño de Escaleras". Ninguna usa fórmulas, así que no cargan MathJax.

Rendimiento y seguridad:

- `polyfill.io` se retiró de todas las vistas: el dominio fue comprometido en 2024 y servía código malicioso. Los navegadores actuales no necesitan ese polyfill.
- MathJax (≈1 MB, procesa toda la página) se carga solo con `<x-sheets.workbench mathjax>`: madera, acero, vigas y vigas general. Las demás hojas no tienen fórmulas y su HTML de resultados se inserta después de la carga, por lo que MathJax no lo procesaba.
- Muros de contención cargaba jQuery dos veces, ECharts dos veces (una `@latest`), paper.js, Konva, imgui-js (runtime WebGL), printThis y MathJax sin usarlos. Ahora carga solo jQuery, ECharts 5.5.1 y D3 7.9.0. El motor ya no cambia el color de fondo del `body`.

Correcciones de motor hechas durante la migración:

- Zapata conectada: el import `paper` no existía en npm (se carga por CDN); ahora usa `window.paper`. Fallaba en desarrollo y en el bundle de producción.
- Cimiento corrido: el controlador leía `yalbañeria` y el campo se llama `yalba`; el valor se mostraba como 0.
- Muros de albañilería: el peralte de la columna interior usaba el mismo `id`/`name` que el factor Ø (`pci`); ahora se envía como `pcin`, que es lo que lee el controlador. Cambia el resultado (antes `pcin` llegaba en 0).
