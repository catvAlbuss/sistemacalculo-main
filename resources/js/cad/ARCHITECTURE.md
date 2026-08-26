# Arquitectura — Sistema de Cálculo Estructural (CAD tipo ETABS)

Mapa de "qué vive dónde" para orientarse rápido, hacer mantenimiento y **encontrar
la falla sin dar vueltas**. Si vas a agregar o arreglar algo, empieza por la
tabla [Encuentra la falla rápido](#encuentra-la-falla-rápido).

> Actualizar este archivo cuando muevas carpetas o cambies el flujo. El registro
> diario de cambios está en `D:\Registros Cambios Proyectos\etabbs.md`.

---

## 1. Panorama del stack

| Capa | Tecnología | Rol |
|------|-----------|-----|
| **Vistas / UI** | Laravel **Blade** + **Alpine.js** + Tailwind | Menús, modales, paneles, toolbar. El DOM. |
| **Lienzo 2D** | Canvas 2D | Dibujo de nodos/barras/losas en planta y elevación. |
| **Visor 3D** | **Babylon.js** | Modelo 3D, animación sísmica, deformada. |
| **Orquestador** | Componente **Alpine** (`cadSys`) | Une todo; su comportamiento se compone de *mixins*. |
| **Backend web** | **Laravel** (PHP) | Rutas, auth, guardado de modelos (BD), proxy al motor. |
| **Motor sísmico** | **Python + OpenSeesPy** (Flask) | Análisis modal-espectral real (E.030). |

Regla mental: **Blade = lo que se ve**, **mixins = lo que hace**, **engine/lib =
lógica pura reutilizable**, **Python = el cálculo estructural**.

---

## 2. Frontend — `resources/js/cad/`

```
cad/
├── cad_sys.js          ← ORQUESTADOR. Componente Alpine: estado reactivo + spread de mixins.
│                         Lo ÚNICO en la raíz. Aquí NO va lógica de features.
├── model/              ← Dominio (clases de datos): shapes (Node/Beam/Area), sections, styles,
│                         parametricModels. "Qué ES el modelo".
├── canvas2d/           ← Motor del lienzo 2D: renderer, grid, grid_editor, states
│                         (máquina de estados de dibujo/interacción).
├── 3d/                 ← Motor 3D (Babylon): viewer3d, camera, axes, grid3d, modeling3d + objects/.
├── diagrams/           ← Diagramas de fuerzas de frames (P/V/M) — render especializado.
├── lib/                ← Utilidades puras: utils (geometría/eventos), units (window.cadUnits).
├── engine/             ← LÓGICA/contratos reutilizables (NO features): contratos sísmicos,
│                         payload builders, adaptadores de backend, response-spectrum defs, mocks.
└── mixins/             ← FEATURES = métodos del componente (this.*). Se agrupan por dominio:
    ├── core/           ← options, events, actions (despachador de menús), core-ui
    ├── select/         ← selection, viewport (select-by-property), view-filter
    ├── edit/           ← edit-geometry, edit-clipboard, edit-delete, undo-redo,
    │                     model-factory, model-queries, draw-slab-3d
    ├── grids/          ← reference-grid, story-grid, story-editor, elevation-drawing
    ├── dialogs/        ← assign-dialogs, display-dialogs (los diálogos de asignación)
    ├── analysis/       ← analysis, animation, report, design + seismic/ (sub-partido:
    │                     core, spectrum, payload, results, animation, _constants)
    └── io/             ← autosave + file-io/ (sub-partido: model-file, e2k-import,
                          e2k-export, print, json-io, legacy-analysis)
```

### El patrón de mixins (importante)

`cad_sys.js` hace `export default { ...coreMixin, ...editMixin, ...seismicMixin, ... }`.
Cada mixin es un **objeto plano de métodos** que usan `this.*`; Alpine liga `this`
al componente en runtime. Consecuencias prácticas:

- **Un método nuevo va en el mixin de su dominio**, no en `cad_sys.js`.
- Los mixins **no se importan entre sí**; se llaman por `this.otroMetodo()`.
- No puede haber **dos métodos con el mismo nombre** en distintos mixins (el último
  del spread gana en silencio). Si algo "no hace lo que dice su código", sospecha
  de una colisión de nombres.

### Archivos grandes ya partidos en sub-mixins (barril + spread)

- `mixins/analysis/seismic.js` → barril; el código real está en `seismic/*.js`.
- `mixins/io/file-io.js` → barril; el código real está en `file-io/*.js`.

Para tocarlos: **edita el sub-archivo del dominio, no el barril.**

### Dos carpetas "analysis" — no confundir

- `mixins/analysis/` = **features** sísmicos/diseño (métodos del componente, usan `this`).
- `cad/engine/` = **librería** (funciones puras, reciben datos por parámetro). Antes se
  llamaba `cad/analysis/`; se renombró a `engine/` para matar esa ambigüedad.

---

## 3. Vistas — `resources/views/components/cad/`

> El punto de montaje es `components/cad-sys.blade.php` (un nivel arriba de `cad/`):
> monta el layout y registra TODOS los modales (`<x-cad.modals.*/>`).

```
cad/
├── layout/              ← toolbar, side-panel (con la barra de herramientas rápidas),
│                          cad-area (canvas 2D + visor 3D), footer.
├── menu/                ← 11 menús (file, edit, view, define, draw, select, assign,
│                          analyze, display, design, options). menu-bar.blade.php los @include.
├── modals/              ← ~35 modales Blade+Alpine (asignaciones, definiciones, resultados…).
├── ui/                  ← átomos reutilizables: ribbon-button, menu-dropdown-item,
│                          panel, input-properties, select-properties…
└── svg/                 ← iconos (soportes, fuerzas, reacciones…).
```

### Patrón de modal (migración Swal→Blade, en curso)

Los diálogos se están moviendo de SweetAlert (HTML embebido en JS) a modales Blade:

1. HTML en `modals/<nombre>-modal.blade.php` (componente Alpine con listener `open-<nombre>-modal`).
2. El mixin queda con 2 métodos delgados: `openXxxDialog()` (valida selección +
   `window.dispatchEvent(CustomEvent)`) y `applyXxxFromModal(datos)` (`saveUndoState` + aplicar).
3. Registrar el modal en `cad-sys.blade.php`.

---

## 4. Backend

### Web (Laravel)
- `app/Http/Controllers/PythonEngineController.php` — proxy al motor Flask (`/api/backend/analyze`).
- `app/Http/Controllers/CadModelController.php` — guardado de modelos en BD (autosave + "Mis modelos").
- Rutas en `routes/web.php` (grupo `software`, auth): `/software/etabs/model/{autosave,latest}`,
  `/software/etabs/models[/{id}]`.

### Motor sísmico (Python) — `python-backend/seismic/`
- `pipeline.py` — orquesta el análisis (entra payload, sale paquete de resultados).
- `inputs.py` — construye el modelo OpenSees (nodos, elementos, diafragmas).
- `solver.py` — modal, RSA/CQC, derivas, torsión accidental, centers of mass.
- `report.py` — tablas estilo ETABS.
- `utils.py` — helpers.

---

## 5. Flujo de una acción típica

**Dibujar** → botón/menú (Blade) → `cadSystem.activateDrawMenuAction(...)` (mixin `core/actions`)
→ cambia a un *state* (`canvas2d/states`) → clics crean `Node/Beam/Area` (`model/shapes`)
→ `redraw()` (2D, `canvas2d/renderer`) + `sync3D()` (3D, `3d/viewer3d`).

**Asignar** → menú/toolbar → `activateAssignMenuAction(...)` → `mixins/dialogs/assign-dialogs`
→ abre modal Blade → `applyXxxFromModal()` guarda en el objeto + `markAnalysisResultsOutdated()`.

**Analizar sísmico** → `mixins/analysis/seismic/core.js` arma el payload
(`seismic/payload.js`, con `engine/` para contratos) → POST `/api/backend/analyze`
→ Laravel `PythonEngineController` → Flask `seismic/pipeline.py` (OpenSees) → JSON de vuelta
→ `seismic/results.js` construye las tablas ETABS → se muestran / animan (`seismic/animation.js`).

---

## 6. Encuentra la falla rápido

| Síntoma | Empieza por |
|---------|-------------|
| Un menú/submenú se ve o abre mal | `views/components/cad/menu/<menú>.blade.php` |
| Un modal de asignación falla | `modals/<x>-modal.blade.php` + `mixins/dialogs/assign-dialogs.js` (`applyXxxFromModal`) |
| Algo se dibuja mal en 2D | `canvas2d/renderer.js` (visual) o `canvas2d/states.js` (interacción) |
| Algo se ve mal en 3D | `3d/viewer3d.js` o `3d/objects/*.js` |
| Dibujar en 3D (barra o losa) no toma el clic | `3d/viewer3d.js` (`onPointerObservable`, `activeDrawTool`) + `mixins/select/view-filter.js` (barras) o `mixins/edit/draw-slab-3d.js` (losas) |
| Cálculo sísmico raro (periodos/derivas/masa) | `python-backend/seismic/solver.py` + `pipeline.py`; payload en `mixins/analysis/seismic/payload.js` |
| Tabla de resultados ETABS incorrecta | `mixins/analysis/seismic/results.js` |
| Import/export `.e2k` roto | `mixins/io/file-io/e2k-import.js` o `e2k-export.js` |
| Guardar/abrir modelo (JSON) | `mixins/io/file-io/json-io.js` |
| Conversión de unidades equivocada | `cad/lib/units.js` (`window.cadUnits`) |
| Propiedades de sección (A/Iz/Iy/J) | `model/sections.js`, `model/shapes.js` |
| Undo/redo o portapapeles | `mixins/edit/undo-redo.js`, `mixins/edit/edit-clipboard.js` |
| Selección (2D o 3D) no la reconoce Edit/Assign | `mixins/edit/model-queries.js` (`getEditSelectedObjects`, `respectActiveView`) |
| Grillas/pisos/elevaciones | `mixins/grids/*` + `canvas2d/grid.js` |
| Crear/editar pisos y sus alturas (una sola pantalla) | `mixins/grids/story-editor.js` + `modals/story-data-modal.blade.php` |
| Autoguardado / "Mis modelos" | `mixins/io/autosave.js` + `CadModelController.php` |

---

## 7. Convenciones para agregar un feature (escalabilidad)

Un feature nuevo suele vivir en **tres lugares espejo**:

1. **Comportamiento** → `mixins/<dominio>/` (método que usa `this.*`).
2. **Vista** → `views/components/cad/` (`menu/` para el ítem, `modals/` para el diálogo).
3. **Lógica compartida / contratos** → `engine/` o `lib/` (funciones puras, sin `this`).

Si mantienes ese espejo, desde cualquier síntoma sabes las 2-3 puertas que tocar.

---

## 8. Comandos y notas de desarrollo

- **Tras editar JS**: `Ctrl+Shift+R` en el navegador (dev server con hot-reload). **No** correr
  `npm run build`.
- **Tras editar Blade**: `php artisan view:clear` (y `view:cache` sirve para *validar* que todo
  el árbol Blade compila sin errores).
- **Validar el bundle JS** sin romper nada: `npx esbuild resources/js/cad/cad_sys.js --bundle
  --outfile=NUL --loader:.js=js` (falla ante cualquier import roto o sintaxis inválida).
- **Tras editar Python**: reiniciar Flask.
- **Sin tests JS aún** (solo PHPUnit del backend Laravel). Pendiente: Vitest sobre la lógica pura
  (units, parser `.e2k`, espectro) — la red de seguridad para regresiones numéricas.



esto me aparece en la terminal de python cuando analice el modelo:
DUMP: payload sismico guardado en C:\laragon\www\sistemacalculo-main\python-backend\_debug_payloads\last_seismic_payload.json
WARNING: CTestNormDispIncr::test() - failed to converge 
after: 10 iterations  current Norm: 2.85512e+15 (max: 1e-06, Norm deltaR: 3.2715e+06)
NewtonRaphson::solveCurrentStep() -the ConvergenceTest object failed in test()
StaticAnalysis::analyze() - the Algorithm failed at step: 0 with domain at load factor 1
OpenSees > analyze failed, returned: -3 error flag
WARNING: CTestNormDispIncr::test() - failed to converge 
after: 10 iterations  current Norm: 2.47445e+14 (max: 1e-06, Norm deltaR: 1.22623e+06)
NewtonRaphson::solveCurrentStep() -the ConvergenceTest object failed in test()
StaticAnalysis::analyze() - the Algorithm failed at step: 0 with domain at load factor 1
OpenSees > analyze failed, returned: -3 error flag
WARNING: CTestNormDispIncr::test() - failed to converge 
after: 10 iterations  current Norm: 1.15824e+15 (max: 1e-06, Norm deltaR: 1.4006e+06)
NewtonRaphson::solveCurrentStep() -the ConvergenceTest object failed in test()
StaticAnalysis::analyze() - the Algorithm failed at step: 0 with domain at load factor 1
OpenSees > analyze failed, returned: -3 error flag
WARNING analysis Transient - no Algorithm yet specified, 
 NewtonRaphson default will be used
WARNING analysis Transient - no Integrator specified, 
 TransientIntegrator default will be used
Using DomainModalProperties - Developed by: Massimo Petracca, Guido Camata, ASDEA Software Technology
🔁 Torsión accidental ADITIVA aplicada (ecc=0.05).
WARNING analysis Transient - no Algorithm yet specified, 
 NewtonRaphson default will be used
WARNING analysis Transient - no Integrator specified, 
 TransientIntegrator default will be used
   ecc Story1: ΔX +2.5% (0.000139→0.000143) | ΔY +14.7% (0.000033→0.000038)
   ecc Story3: ΔX +0.0% (0.023745→0.023750) | ΔY +0.0% (0.022927→0.022935)
🎬 Modal shapes reales para animación: {'modes': 15, 'nodes': 150}
DUMP: resultado sismico (resumen) guardado en C:\laragon\www\sistemacalculo-main\python-backend\_debug_payloads\last_seismic_result.json
DUMP RESULT: Combinado SRSS -> FX=12.9896 tonf  FY=3.7227 tonf  MX=14.0054 tonf-m  MY=44.5997 tonf-m  MZ=71.9516 tonf-m
127.0.0.1 - - [03/Aug/2026 12:23:49] "POST /api/seismic/analyze HTTP/1.1" 200 -
DUMP: payload sismico guardado en C:\laragon\www\sistemacalculo-main\python-backend\_debug_payloads\last_seismic_payload.json
WARNING: CTestNormDispIncr::test() - failed to converge 
after: 10 iterations  current Norm: 2.85512e+15 (max: 1e-06, Norm deltaR: 3.2715e+06)
NewtonRaphson::solveCurrentStep() -the ConvergenceTest object failed in test()
StaticAnalysis::analyze() - the Algorithm failed at step: 0 with domain at load factor 1
OpenSees > analyze failed, returned: -3 error flag
WARNING: CTestNormDispIncr::test() - failed to converge 
after: 10 iterations  current Norm: 2.47445e+14 (max: 1e-06, Norm deltaR: 1.22623e+06)
NewtonRaphson::solveCurrentStep() -the ConvergenceTest object failed in test()
StaticAnalysis::analyze() - the Algorithm failed at step: 0 with domain at load factor 1
OpenSees > analyze failed, returned: -3 error flag
WARNING: CTestNormDispIncr::test() - failed to converge 
after: 10 iterations  current Norm: 1.15824e+15 (max: 1e-06, Norm deltaR: 1.4006e+06)
NewtonRaphson::solveCurrentStep() -the ConvergenceTest object failed in test()
StaticAnalysis::analyze() - the Algorithm failed at step: 0 with domain at load factor 1
OpenSees > analyze failed, returned: -3 error flag
WARNING analysis Transient - no Algorithm yet specified, 
 NewtonRaphson default will be used
WARNING analysis Transient - no Integrator specified, 
 TransientIntegrator default will be used
🔁 Torsión accidental ADITIVA aplicada (ecc=0.05).
WARNING analysis Transient - no Algorithm yet specified, 
 NewtonRaphson default will be used
WARNING analysis Transient - no Integrator specified, 
 TransientIntegrator default will be used
   ecc Story1: ΔX +11.6% (0.000044→0.000049) | ΔY +8.2% (0.000086→0.000093)
   ecc Story3: ΔX +0.1% (0.011638→0.011645) | ΔY +0.0% (0.027393→0.027406)
🎬 Modal shapes reales para animación: {'modes': 15, 'nodes': 150}
DUMP: resultado sismico (resumen) guardado en C:\laragon\www\sistemacalculo-main\python-backend\_debug_payloads\last_seismic_result.json
DUMP RESULT: Combinado SRSS -> FX=3.9572 tonf  FY=12.1952 tonf  MX=43.1663 tonf-m  MY=14.4025 tonf-m  MZ=107.4965 tonf-m
127.0.0.1 - - [03/Aug/2026 12:24:10] "POST /api/seismic/analyze HTTP/1.1" 200 -