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
    │                     model-factory, model-queries
    ├── grids/          ← reference-grid, story-grid, elevation-drawing
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
| Cálculo sísmico raro (periodos/derivas/masa) | `python-backend/seismic/solver.py` + `pipeline.py`; payload en `mixins/analysis/seismic/payload.js` |
| Tabla de resultados ETABS incorrecta | `mixins/analysis/seismic/results.js` |
| Import/export `.e2k` roto | `mixins/io/file-io/e2k-import.js` o `e2k-export.js` |
| Guardar/abrir modelo (JSON) | `mixins/io/file-io/json-io.js` |
| Conversión de unidades equivocada | `cad/lib/units.js` (`window.cadUnits`) |
| Propiedades de sección (A/Iz/Iy/J) | `model/sections.js`, `model/shapes.js` |
| Undo/redo o portapapeles | `mixins/edit/undo-redo.js`, `mixins/edit/edit-clipboard.js` |
| Selección (2D o 3D) no la reconoce Edit/Assign | `mixins/edit/model-queries.js` (`getEditSelectedObjects`, `respectActiveView`) |
| Grillas/pisos/elevaciones | `mixins/grids/*` + `canvas2d/grid.js` |
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
