# Plan revisado: Agente IA de Dibujo y Metrados (v2)

> **Revisión del documento:** `docs/agentes/plan-agente-dibujo-metrados.md` (v1)
> **Fecha:** 2 de noviembre de 2026
> **Alcance:** Análisis Estructural (`/software/etabs`) y Predim2 (`/software/predim2`), con vista a todo el sistema (hojas de cálculo, cimentación, memorias).
> **Método:** cada afirmación de la v1 se contrastó con el código del repositorio y con fuentes externas. Lo verificado lleva la ruta del archivo. Lo que no se pudo verificar se marca **[verificar]**.

---

## 0. Veredicto corto

La **dirección** de la v1 es correcta y se mantiene:

- El agente **no calcula**. Opera calculadores existentes.
- Las herramientas se **ejecutan en el navegador** y Laravel solo hace de intermediario con la clave guardada en `.env`.
- Cada turno es una **petición HTTP corta**, compatible con Hostinger Business.

Pero el plan **no está listo para arrancar**. Tiene seis problemas de fondo:

1. **Confunde Predim2 con Predim v1.** La Fase 0 modulariza un archivo que no pertenece a Predim2.
2. **Ignora que Predim2 ya tiene un agente IA instalado** (`@mlightcad/cad-agent-plugin`, el botón "CAD Agent" de la captura). Ese agente guarda la API key en el navegador y hoy ya está en producción.
3. **Los ejemplos de código llaman a métodos que no existen** en `cad_sys.js`.
4. **No define un contrato de unidades.** El CAD guarda en MPa, cm, mm y SI mezclados. El esquema de herramientas de la v1 usa m y kg/cm² sin conversión.
5. **Las fórmulas de metrados tienen errores** (aligerado "× 0.57", encofrado de viga, acero sin diseño).
6. **El router de tres motores (Claude/Codex/Ollama) agrega complejidad sin beneficio en producción.** El modelo Codex citado ya fue retirado, y la configuración de Claude devolvería error 400.

La propuesta de esta v2 cambia el orden: **primero contratos (unidades, modelo canónico, herramientas) y un motor de metrados determinista sin IA; después el agente encima.**

---

## 1. Diagnóstico: qué dice la v1 y qué hay realmente en el código

| # | Afirmación v1 | Realidad en el repo | Estado |
|---|---|---|---|
| 1 | Predim2 = `resources/js/predim/` + `shared-runtime.js` | `/software/predim2` → vista `etabs.index` → `resources/views/components/etabs/cad-sys.blade.php` → `resources/js/etabs/main.js` (Vue 3 + `@mlightcad/cad-viewer` + Cimentación 2.0). `shared-runtime.js` lo carga `predim/predim-new.blade.php`, servido por las rutas `/predim_v2` y `/software/predimv2`. **Son módulos distintos con nombres casi iguales.** | ❌ Incorrecto |
| 2 | El agente se construye desde cero | `package.json` ya incluye `@mlightcad/cad-agent-plugin@1.7.6`. `cad-viewer` lo registra solo. Trae 16 herramientas: `get_drawing_context`, `draw_line/circle/arc/ellipse/polyline/rectangle/spline/hatch/point/ray/xline/text`, `create_layer`, `set_current_layer`, `zoom_extents`. Usa Vercel AI SDK, proveedores OpenAI/Anthropic/OpenAI-compatible y **API key en `localStorage` del navegador**. | ❌ Omitido |
| 3 | `cadSystem.addBeam()`, `findOrCreateSection()`, `drawColumn()`, `currentStoryHeight` | No existen. Lo real: `getOrCreateStructuralNode(point)` y `createFrameLineFromPoints(start, end, frameType)` (`mixins/edit/model-factory.js`), `Beam.setStructuralRole()`, `Beam.assignSection()` (`model/shapes.js`), `saveUndoState()`, `redraw()`, `sync3D()`, `stories[]`. | ❌ Incorrecto |
| 4 | Esquema de herramientas en m y kg/cm² | Convención interna (`cad/lib/units.js`): materiales en **MPa**, secciones b/h en **cm**, losas en **mm**, propiedades en **SI**. | ⚠️ Falta un contrato |
| 5 | `calculations.js` concentra las fórmulas de Predim | Solo lo importan `CuadradoTool.js` y `RectangleTool.js`. `shared-runtime.js` **duplica** las fórmulas en línea. | ⚠️ Duplicación |
| 6 | Fórmulas de Predim correctas | **Bug:** `shared-runtime.js:658` usa `0.45 * Math.sqrt(fc, 2)` en lugar de `0.45 * fc`, lo que infla el área de columna rectangular unas 14 veces en el reporte. Además etiqueta en "cm" un valor que está en m. | ❌ Bug |
| 7 | Escala px↔m configurable | `getPixelToCm()` fija 96 DPI y una constante mágica `115`. Si cambia la resolución de render del PDF, cambian los metros. | ⚠️ Frágil |
| 8 | Tests con `vitest` en `agents/tests/` | No hay vitest. Los tests de frontend son `node:test` en `tests/frontend/*.test.mjs`. Los de PHP están en `tests/Feature`. | ❌ No sigue el patrón |
| 9 | Carpeta `agents/` en la raíz con PHP y Vue | La raíz no está en el `input` de Vite ni en el PSR-4 de Composer (`App\` → `app/`). Los controladores PHP fuera de `app/` no se autocargan. | ❌ No integra |
| 10 | "Se integrará como un nuevo mixin" | Correcto para el CAD, con una restricción: **dos métodos con el mismo nombre en mixins distintos se pisan en silencio** (`ARCHITECTURE.md` §2). Todo método del agente debe llevar el prefijo `agent*`. | ✅ Con condición |
| 11 | El motor sísmico es confiable para lo que dibuje el agente | `ARCHITECTURE.md` documenta fallas de convergencia de OpenSees (`Norm 2.85e15`, matriz casi singular). Un agente que dibuja producirá más modelos con nodos sueltos o sin apoyos. | ⚠️ Falta un validador |
| 12 | Predim2 dibuja con Canvas | Predim2 usa la base de datos DWG/DXF de mlightcad (`@mlightcad/data-model`). Tiene `dxfOut`, cotas (`AcDbAlignedDimension`, `AcDbRotatedDimension`…), `AcDbHatch`, `AcDbTable` y bloques. **Ya es un motor de planos en el navegador.** | ✅ Es una oportunidad |
| 13 | Codex `codex-mini-latest` | Según fuentes de terceros, se retiró el 12-feb-2026 **[verificar en la página de deprecaciones de OpenAI]**. | ❌ Desactualizado |
| 14 | Claude `thinking: {type: "enabled", budget_tokens: 8000}` | En `claude-opus-5-5` y `claude-sonnet-5-5`, `budget_tokens` devuelve **400**. Se usa `thinking: {type: "adaptive"}` + `output_config.effort`. Además, `tool_choice` forzado (`any`/`tool`) devuelve 400 en esos modelos: se usa `auto` + `strict: true`. | ❌ Error 400 |
| 15 | Costos: Claude $0.015/$0.075 por 1k | Precios actuales por millón de tokens (entrada/salida): **Opus 5.5 $4/$20 · Sonnet 5.5 $2/$10 · Haiku 5.5 $0.10/$0.50**. | ❌ Desactualizado |
| 16 | Existe otro plan de agente | `docs/agentes/agente-ia-hojas-calculo.md` propone **la misma infraestructura** (`/api/agente/...`, SDK PHP, throttle, tokens) para las hojas de vigas. Los dos planes deben compartir el núcleo. | ⚠️ Unificar |

---

## 2. Motores: qué existe y qué rol tiene cada uno frente al agente

```
                ┌───────────── Navegador ─────────────┐
                │                                      │
 Predim2 ───────┤ mlightcad (AcDb*, DXF/DWG, cotas,    │── herramientas de DIBUJO y PLANOS
 /software/     │ hatch, tablas) + Cimentación 2.0     │
 predim2        │                                      │
                │                                      │
 Análisis ──────┤ cad_sys.js (Alpine + mixins)         │── herramientas de MODELO
 Estructural    │ Node/Beam/Area, stories, secciones   │   (geometría + asignaciones)
 /software/etabs│ Canvas 2D + Babylon 3D               │
                │                                      │
 Metrados ──────┤ (NUEVO) motor JS puro                │── herramientas de CANTIDADES
                └──────────────────┬───────────────────┘
                                   │ /api/backend/... · /zapatas2 · /api/agente/...
                ┌──────────────────┴───────────────────┐
                │ Laravel (Hostinger)                  │
                │  PythonEngineController (OpenSeesPy) │── ANÁLISIS y DISEÑO
                │  OctavePlotController (/zapatas2)    │   (sísmico, columnas, muros,
                │  (NUEVO) AgentController → Claude    │    zapatas)
                └──────────────────────────────────────┘
```

| Motor | Ubicación | Qué le ofrece al agente | Riesgo |
|---|---|---|---|
| mlightcad | `resources/js/etabs/`, `node_modules/@mlightcad/*` | Dibujo DXF real, capas, cotas, tablas, exportación DXF | API de terceros. Se debe fijar la versión (hoy `^1.7.6`). |
| CAD `cadSys` | `resources/js/cad/` | Modelo estructural, pisos, secciones, undo | Unidades mixtas y colisión de nombres entre mixins |
| OpenSeesPy | `python-backend/seismic`, `design/` | Análisis modal-espectral y diseño de columnas y muros | CPU por petición, convergencia, sin timeout en `proc_open` |
| Octave | `/zapatas2` | Cimentación 2.0 | Varios segundos por llamada vía WSL en local |
| Predim v1 | `resources/js/predim/` | Predim sobre PDF | Archivo de 3784 líneas, bug en `sqrt` y escala frágil. **Queda fuera del MVP.** |

---

## 3. Arquitectura propuesta

### 3.1 Principio: una plataforma de agente, varios "hosts"

Como el agente "va a ingresar en todo el sistema", no se construye un agente por módulo. Se construye **un núcleo** y cada módulo se registra como **host** con sus herramientas:

```js
// resources/js/agent/core/host-contract.js (contrato, no implementación)
/**
 * @typedef AgentHost
 * @property {string} id                  - "cad" | "predim2" | "hoja-vigas" | ...
 * @property {() => object} getContext    - resumen compacto del estado (≤ 2-3k tokens)
 * @property {ToolDef[]} tools            - JSON Schema estricto + metadatos
 * @property {(name, input) => Promise<ToolResult>} execute
 */
// ToolDef.meta = { mutates: bool, needsConfirm: bool, units: {...}, version: "1" }
```

- **Laravel no conoce las herramientas por código.** Recibe del host la lista permitida (nombre, versión, esquema) y la valida contra una **allowlist del servidor** por módulo y plan. El navegador nunca decide el prompt de sistema ni el modelo.
- Las hojas de vigas (`agente-ia-hojas-calculo.md`) son otro host del mismo núcleo.

### 3.2 Flujo por turno (compatible con hosting compartido)

```
Navegador                         Laravel                          Claude API
─────────                         ───────                          ──────────
mensaje ─────────────────────────▶ POST /api/agente/turno
                                   carga la conversación (BD)
                                   1 llamada a messages.create ────▶
                                 ◀──────────── tool_use(s) ──────── 
◀── tool_use(s) ───────────────── guarda la respuesta COMPLETA (append-only)
ejecuta en el host
(preview si muta) 
tool_result(s) ─────────────────▶ POST /api/agente/turno
                                   1 llamada ───────────────────────▶
                                 ◀──────────── texto final ───────── 
◀── respuesta ───────────────────
```

Decisiones clave:

- **Una petición HTTP = una llamada al modelo**, nunca el bucle completo. El navegador conduce el bucle. Así ninguna petición PHP espera varios minutos.
- **La conversación se guarda en el servidor** (tabla `agent_conversations` / `agent_messages`), no en el navegador. Hay dos motivos:
  - Los modelos actuales exigen que el historial con bloques de *thinking* se devuelva **sin modificar** (append-only). Si el cliente reenvía el historial, puede alterarlo sin querer.
  - El cliente no puede inyectar turnos falsos.
- **Tiempo por llamada.** Se usa `effort: "low"` o `"medium"` en turnos de herramientas y un `max_tokens` moderado. **Hay que medir** el `max_execution_time` y el tiempo de espera de LiteSpeed en Hostinger **[verificar]**. Si no alcanza, se prueba streaming SSE desde PHP. Es un *spike* de la Fase 2, no una suposición.
- **Todos los `tool_result` de un turno van en un solo mensaje.** Un error se devuelve como `is_error: true`, no se omite.
- **Prompt caching:** la definición de herramientas y el prompt de sistema van primero y fijos. El contexto variable del modelo va al final. El costo real se mide con `usage.cache_read_input_tokens`.

### 3.3 Modelos: un proveedor primero

| Rol | Modelo | Precio por MTok (entrada/salida) | Uso |
|---|---|---|---|
| Por defecto | `claude-opus-5-5` (effort `medium`) | $4 / $20 | Bucle de herramientas, dibujo, metrados |
| Opción económica a evaluar | `claude-sonnet-5-5` | $2 / $10 | Solo si el set de evaluación (§7) muestra igual calidad |
| Tareas cortas | `claude-haiku-5-5` | $0.10 / $0.50 | Clasificar intención, títulos, resúmenes |
| Local (opcional) | Ollama | $0 | **Solo desarrollo / modo offline del propio usuario**, no en el MVP |

Por qué se retira el router de tres motores:

- **"Codex para generar DXF" contradice el principio rector.** El DXF lo generan herramientas deterministas (mlightcad `dxfOut`), no código escrito por un LLM en cada turno.
- **`navigator.onLine` no sirve para enrutar.** El navegador siempre habla con Laravel, y Laravel no ve el Ollama del usuario.
- **Ollama en producción solo podría correr en la PC del usuario** (navegador → `localhost:11434` con `OLLAMA_ORIGINS` configurado). Ese escenario no tiene control de cuota ni de calidad. Si se quiere, se agrega después como "proveedor local" detrás de la misma interfaz. Para tool calling se recomienda un modelo generalista con herramientas, no `qwen2.5-coder` **[verificar con el set de evaluación]**.
- **Tres proveedores triplican** pruebas, prompts, formatos de herramientas y vectores de fuga de clave.

**Costo realista.** Un bucle agéntico reenvía el historial en cada ida y vuelta. Por ejemplo, "dibuja un pórtico 3×4" ≈ 8 llamadas × ~12k tokens de entrada ≈ 100k de entrada + 5k de salida.

- **Opus 5.5 sin caché:** ≈ $0.40 + $0.10 = **~$0.50 por tarea**.
- **Opus 5.5 con caché** de herramientas y prompt de sistema: **~$0.15–0.25**.
- **Sonnet 5.5:** aproximadamente la mitad.

El límite de "50 000 tokens/día" de la v1 no alcanza ni para una tarea. Conviene limitar por **tareas o dólares por plan**, no por tokens.

### 3.4 Qué hacer con `@mlightcad/cad-agent-plugin` (decisión pendiente)

Hoy, en producción, cualquier usuario de Predim2 puede abrir "CAD Agent" y pegar su propia API key. La clave queda en `localStorage`, y el *gateway* por defecto del SDK es `ai-gateway.vercel.sh`. Hay tres opciones:

| Opción | Pros | Contras |
|---|---|---|
| **A. Ocultarlo ya y construir el panel propio** (recomendada) | Control de clave, cuota y herramientas de dominio | Se rehace el chat (se puede reutilizar su código, licencia MIT) |
| B. Mantenerlo como "trae tu propia clave" | Cero trabajo | Sin control. Solo dibuja primitivas y no conoce columnas, ejes ni metrados |
| C. Apuntar su `baseUrl` a un endpoint Laravel compatible con OpenAI | Reutiliza la UI | Laravel tendría que imitar la API de OpenAI con streaming: es frágil en PHP compartido |

Con A se reutilizan **las ideas y la lista de herramientas primitivas** del plugin (`draw_polyline`, `create_layer`, `draw_text`, `draw_hatch`…) como herramientas de bajo nivel del host Predim2. Encima van las de dominio.

### 3.5 Contrato de unidades del agente

El modelo de IA **siempre** ve y escribe:

| Magnitud | Unidad del agente | Conversión |
|---|---|---|
| Longitud / coordenadas | m | El host convierte a cm (secciones), mm (losas) o unidades del DXF |
| Fuerza | tonf | `cad/lib/units.js` |
| f'c, fy, q_adm | kgf/cm² | → MPa interno |
| Ángulos | grados | |

- **Todo `tool_result` incluye `units`.** Si un DXF importado no declara `$INSUNITS` o es ambiguo, la herramienta **no adivina**. Devuelve un error y el agente pide calibrar con dos puntos de distancia conocida.
- **Escala de dibujo** (otra cosa distinta):
  - El modelo se dibuja en m a tamaño real.
  - Texto y cotas se definen en **mm de papel** y se multiplican por la escala (1:50, 1:75, 1:100) mediante estilos de cota y de texto por escala. Es el mismo principio de `docs/api-node-cad-plano.md` §4.

### 3.6 Modelo estructural canónico (la columna vertebral)

Para que Predim2, Análisis Estructural, Cimentación 2.0 y Metrados se hablen, se define **un JSON versionado** (`schemaVersion`) con ejes, pisos, nodos, elementos (rol, sección, material) y resultados opcionales.

- `CadModel` ya guarda modelos. El canónico es una **vista exportable**, no un reemplazo.
- El flujo de valor del sistema completo:

```
Plano arquitectura (DXF/PDF en Predim2)
   → ejes + columnas + placas (agente asistido, el usuario confirma)
   → Modelo canónico
   → Análisis Estructural (OpenSeesPy) → reacciones
   → Cimentación 2.0 (ya importa Joint Reactions)
   → Metrados (concreto, encofrado, acero)
   → Planos DXF en Predim2 (planta, cuadro de columnas, detalles)
```

- Opcional a futuro: exportar a **IFC** con cantidades (`Qto_*BaseQuantities`) para intercambiar con BIM. Herramientas como IfcOpenShell o `qto-takeoff` sirven para validar las cantidades por fuera.

### 3.7 Seguridad específica de agentes

- **Las herramientas que modifican el modelo muestran una vista previa** (fantasma en el canvas + lista de cambios). Aplican solo tras "Aceptar". Todo el lote del agente es **un solo paso de undo**.
- **Inyección de instrucciones:** textos de DXF, nombres de capas y celdas de Excel importadas son **datos, no instrucciones**. Se envuelven así en el `tool_result` y el prompt de sistema lo dice.
- La API key solo vive en `.env`. En los logs va solo id de petición, modelo, tokens y duración, sin datos del proyecto.
- `auth` + `check.subscription` + `throttle` + cuota por plan, igual que el resto de rutas pagas.

---

## 4. Motor de metrados: correcciones técnicas

> El motor de metrados es **JS puro, sin IA**, con su propio botón en la UI. El agente solo lo invoca y lo explica. Así se puede auditar y probar contra un metrado manual.

### 4.1 Referencia normativa

La referencia es la **Norma Técnica de Metrados para Obras de Edificación y Habilitaciones Urbanas, RD 073-2010-VIVIENDA/VMCS-DNC**. Unidades típicas: concreto en m³, encofrado en m² de **área de contacto** y acero en kg. **[verificar las reglas exactas de cada partida contra el texto oficial antes de codificarlas]**.

### 4.2 Correcciones a la tabla de la v1

| Elemento | v1 | Corrección propuesta |
|---|---|---|
| Losa aligerada (concreto) | `e × L × ancho × 0.57` | Por m² de losa, con viguetas de 0.10 m @ 0.40 m y losa superior de 0.05 m: **h=0.17 → 0.0800 m³/m²; h=0.20 → 0.0875; h=0.25 → 0.1000; h=0.30 → 0.1125**. Ladrillo 30×30: **8.33 und/m²**. |
| Vigas (encofrado) | `b·L + 2·h·L` | Fondo `b × L_libre` + laterales `2 × (h − e_losa) × L_libre` en vigas interiores bajo losa. La cara exterior de una viga de borde va completa. |
| Vigas / columnas / losas (concreto) | Longitudes brutas | **Precedencia para no contar dos veces:** columna continua de piso a piso; viga entre caras de columna; losa entre caras de viga. Hay que definir y probar la regla. |
| Columnas (encofrado) | `2(b+h) × H` | Perímetro × altura libre (piso a fondo de viga o losa), descontando las caras en contacto con muros. |
| Zapatas (encofrado) | `perímetro × h` | Depende del proceso: muchas veces se vacía contra el terreno sin encofrar. Debe ser un parámetro. |
| Acero | `Σ(n × L × peso)` | **No se puede obtener de la geometría sola.** Necesita el armado (diseño): longitudes de desarrollo, ganchos y empalmes según E.060. Pesos nominales: 6 mm 0.222 · 8 mm 0.395 · 3/8" 0.560 · 12 mm 0.888 · 1/2" 0.994 · 5/8" 1.552 · 3/4" 2.235 · 1" 3.973 kg/m. Sin diseño, el acero se reporta como **"estimado por cuantía kg/m³"**, claramente rotulado. |
| Desperdicio | — | Va como factor aparte y visible, no mezclado en el metrado. |

### 4.3 Reutilizar lo que ya existe

Hay 15 archivos JS con lógica de "metrado" (por ejemplo `escaleras/calculos.js` → `calculateMetradoCargas`, `cad/mixins/analysis/rcAligeradoDesign.js`).

- **Ojo:** varios son *metrado de cargas* (análisis), no *metrado de cantidades* (presupuesto). Hay que nombrarlos distinto en el código: `metradoCargas*` vs `metradoCantidades*`.

---

## 5. Correcciones a Predim (si entra al alcance)

Predim v1 **no es Predim2** y no es prerrequisito del MVP. Si se quiere en el agente, en una pista aparte:

1. Corregir `shared-runtime.js:658` (`Math.sqrt(fc, 2)` → `fc`) y la etiqueta de unidad. Es un bug real que hoy afecta a usuarios.
2. Hacer que `shared-runtime.js` use `utils/calculations.js` en vez de duplicar fórmulas.
3. Reemplazar `96 DPI × 115` por una calibración de dos puntos (px → m).
4. Revisar los criterios con la fuente que la empresa adopte **[verificar]**:
   - Columnas: hoy solo `P/(0.45 f'c)`. En la práctica peruana se distinguen centrales (≈0.45 f'c) de excéntricas y esquineras (≈0.35 f'c), con P de servicio por m² según uso.
   - Vigas: hoy L/14 y L/18.5. Es común usar L/10–L/12.
   - Placas: la fórmula de la v1 `Z·U·S/(R·0.15·f'c)` es incompleta (falta P y C).

---

## 6. Estructura de carpetas (alineada al repo)

```
app/
├── Http/Controllers/Agent/AgentTurnController.php   ← POST /api/agente/turno
├── Agents/
│   ├── AgentRuntime.php           ← 1 llamada al modelo por turno (SDK PHP de Anthropic)
│   ├── ToolAllowlist.php          ← herramientas permitidas por host y plan
│   ├── ConversationStore.php      ← historial append-only en BD
│   └── UsageMeter.php             ← tokens, $ y tareas por usuario/plan
├── Models/AgentConversation.php, AgentMessage.php, AgentUsage.php
config/agent.php                    ← modelo, effort, límites (no models.json suelto)
resources/js/agent/
├── core/                          ← cliente del turno, contrato AgentHost, validación de esquemas
├── ui/                            ← panel de chat, vista previa de cambios, tabla de metrados
├── hosts/
│   ├── cad/                       ← herramientas sobre cadSys (usa mixins/agent/)
│   └── predim2/                   ← herramientas sobre mlightcad
└── metrados/                      ← motor puro (sin IA): concreto, encofrado, acero
resources/js/cad/mixins/agent/     ← métodos agent* del componente Alpine
resources/views/components/agent/  ← panel Blade (CAD) / montaje Vue (Predim2)
tests/frontend/agent-*.test.mjs    ← node:test, como el resto
tests/frontend/fixtures/agent/     ← modelos de prueba + metrado manual de referencia
tests/Feature/AgentTurnTest.php    ← con cliente de IA simulado (sin llamadas reales)
```

`vite.config.js`: no hace falta un *entry* nuevo si el núcleo se importa desde `cad/` y `etabs/main.js`. Solo se agrega uno si el panel se carga de forma perezosa.

---

## 7. Evaluación (antes de escribir el primer prompt)

Los papers de agentes estructurales (ver §9) coinciden en que **los LLM entienden la mecánica de forma cualitativa, pero no son confiables en lo cuantitativo**. Por eso:

- **Set de evaluación de 30–50 pedidos reales**, cada uno con el **estado esperado del modelo**: nodos, barras, secciones, cantidades. Ejemplos: "pórtico 3 vanos de 5 m, 4 pisos de 3 m, vigas 25×50", "metrado de columnas del piso 2".
- **Métricas:**
  - Éxito exacto del estado.
  - Número de llamadas a herramientas.
  - Costo en $ por tarea.
  - Latencia por turno.
  - Errores de unidades (métrica propia, porque es el fallo más probable).
- **Se corre en cada cambio** de prompt, de herramienta o de modelo. Así se decide con datos entre Opus 5.5 y Sonnet 5.5.
- **Diseño de herramientas:** preferir **herramientas generadoras deterministas** (`generar_portico({vanos, luces, pisos, alturas, secciones})`) en vez de que el modelo emita 60 `dibujar_elemento`. Hay menos llamadas, menos costo y cero errores de coordenadas.

---

## 8. Fases revisadas

| Fase | Duración | Entregable | Criterio de cierre |
|---|---|---|---|
| **F0 — Decisiones y contratos** | 1–2 sem | Decidir el destino del cad-agent-plugin (§3.4). Contrato de unidades (§3.5). Esquema del modelo canónico v1 (§3.6). Contrato `AgentHost`. Set de evaluación v0. **Fix del bug de `sqrt`.** | Documentos aprobados. Bug corregido con test |
| **F1 — Metrados deterministas (sin IA)** | 3–4 sem | Motor JS: concreto + encofrado desde el modelo CAD, con reglas de precedencia. Acero "estimado" rotulado. Botón "Metrados" en Análisis Estructural. Exportación Excel con `exceljs` (ya está instalado). | Coincide con un metrado manual de referencia (±2 %) en 2 edificios de prueba |
| **F2 — Núcleo del agente + lectura** | 3 sem | `AgentTurnController`, almacén de conversación, medidor de uso, *spike* de timeout/streaming en Hostinger. Host `cad` con `leer_modelo`, `resumen_modelo`, `validar_modelo` (nodos sueltos, barras duplicadas, sin apoyos, sin sección) y `calcular_metrados`. | Responde preguntas sobre el modelo y el metrado. Un turno dura menos que el límite medido en Hostinger |
| **F3 — Dibujo en Análisis Estructural** | 4 sem | `crear_grilla_y_pisos`, `generar_portico`, `asignar_seccion`, `modificar_elementos`, `eliminar_elementos`, con vista previa y un solo undo. `validar_modelo` corre antes de `analizar`. | ≥ 90 % de éxito en el set de evaluación de dibujo. Undo revierte el lote completo |
| **F4 — Host Predim2 (planos)** | 4 sem | Primitivas (inspiradas en el plugin) + herramientas de dominio: `crear_capas_estandar`, `dibujar_ejes`, `dibujar_columnas_desde_modelo`, `acotar(escala)`, `cuadro_de_columnas` (`AcDbTable`), `exportar_dxf`. | El DXF abre en AutoCAD y pasa `ezdxf audit`. Texto de 2.5–3 mm en papel a la escala elegida |
| **F5 — Puente entre módulos** | 3 sem | Exportar e importar el modelo canónico: Predim2 ↔ CAD ↔ Cimentación 2.0 ↔ Metrados. Asistencia para ejes y columnas desde un plano DXF de arquitectura, siempre con confirmación del usuario. | Flujo completo del §3.6 en un proyecto de prueba |
| **F6 — Diseño iterativo y detalles** | 3+ sem | Ciclo predim → análisis → diseño (python `design/`) → ajuste. Acero real para metrados. Planos de detalle. | Cada iteración queda registrada y cita la norma que aplicó la herramienta |

**MVP útil = F0 + F1 + F2 (~8 semanas).** Al final de F1 ya hay valor sin IA: metrados automáticos.

---

## 9. Investigación externa: qué reutilizar

### 9.1 Agentes y servidores MCP del dominio

| Recurso | Qué es | Cómo nos sirve |
|---|---|---|
| [mlightcad/cad-viewer](https://github.com/mlightcad/cad-viewer) · `cad-agent-plugin` | El visor que ya usa Predim2, con agente de dibujo (Vercel AI SDK, MIT) | Base de las primitivas de dibujo del host Predim2 y referencia del panel de chat |
| [mdvaleed7/ETABS-mcp](https://glama.ai/mcp/servers/mdvaleed7/ETABS-mcp) | Servidor MCP con 69 herramientas sobre ETABS real (COM, Windows, licencia v19–v22) | (1) Taxonomía de nombres de herramientas probada. (2) **Validar nuestro motor OpenSees contra ETABS** en la PC de desarrollo con licencia |
| [david-mamani/etabs-mcp](https://glama.ai/mcp/servers/david-mamani/etabs-mcp/related-servers) | MCP para ETABS v22+, 60 herramientas | Igual que el anterior. Comparar diseños de herramientas |
| [AutoCAD MCP (motor headless DXF)](https://glama.ai/mcp/servers/sapkotasachin064-beep/Autocad-MCP/tree) | MCP en Python que lee y escribe DXF sin AutoCAD | Referencia para validar DXF en CI |
| [best-cad-mcp](https://pypi.org/project/best-cad-mcp/1.4.8/) | 260+ herramientas sobre DWG con flujo escanear → planear → modificar → validar | **Copiar el patrón "plan → validar → confirmar"** para herramientas que modifican |
| [vigneshpbmenon/autocad-mcp-server](https://github.com/vigneshpbmenon/autocad-mcp-server) · [Easy AutoCAD MCP](https://playbooks.com/mcp/easy-autocad) | MCP básicos sobre pyautocad | Referencia menor |

No se encontró un servidor MCP público para OpenSees. Si se quiere usar el motor desde Claude Code durante el desarrollo, se puede envolver `python-backend/cli_entry.py` como MCP local. Es útil para depurar, no para producción.

### 9.2 Skills para el proceso de construcción (desarrollo)

| Recurso | Uso |
|---|---|
| [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) | Librería de *agent skills* para CAD (incluye una skill de DXF y un plugin de Claude Code). Sirve de referencia de cómo empaquetar conocimiento CAD como skill |
| Skills propias a crear en `.claude/skills/` del repo | `agent-tool-author` (cómo agregar una herramienta: esquema + ejecutor + test + allowlist). `metrados-verifier` (corre el motor contra los fixtures y compara con el metrado manual). `units-audit` (revisa que cada herramienta declare y convierta unidades). Se apoyan en `resources/js/cad/ARCHITECTURE.md` |
| Skill `claude-api` (ya disponible en Claude Code) | Referencia de modelos, precios, tool use, caching y streaming al implementar `AgentRuntime.php` con el SDK PHP |

### 9.3 Literatura (lecciones, no código)

- [Automating Structural Engineering Workflows with LLM Agents (arXiv 2510.11004)](https://arxiv.org/pdf/2510.11004) compara un agente único con colaboración multiagente y propone benchmarks. → Tener set de evaluación desde el inicio.
- [Multi-agente ligero para pórticos 2D (arXiv 2510.05414)](https://arxiv.org/abs/2510.05414) separa análisis, geometría, traducción a OpenSeesPy y validación. → Validador separado (`validar_modelo`).
- [Agente LLM para análisis confiable (arXiv 2507.02938)](https://arxiv.org/pdf/2507.02938): el LLM acierta en lo cualitativo y falla en lo cuantitativo. → Confirma el principio "el agente no calcula".
- [Reducción de alucinaciones en modelado OpenSeesPy (arXiv 2603.07728)](https://arxiv.org/html/2603.07728) · [Pórticos 3D agénticos (arXiv 2606.06525)](https://arxiv.org/pdf/2606.06525) · [AutoBM (arXiv 2602.07083)](https://www.arxiv.org/pdf/2602.07083).
- Reconocimiento de planos: no hay una solución abierta que extraiga columnas y vigas de PDF estructurales con LLM. Hay YOLO sobre planos estructurales ([estudio](https://acikerisim.bartin.edu.tr/entities/publication/1041fa70-0e38-465b-b9e0-e9b2d8c5efae/full)) y vectorización arquitectónica ([arXiv 2608.25608](https://arxiv.org/pdf/2608.25608), [MLSTRUCT-FP](https://repositorio.uchile.cl/handle/2250/196842)). → **Trabajar sobre DXF vectorial, no sobre imagen.** El OCR de planos escaneados sigue en baja prioridad.

### 9.4 Cantidades / BIM

- [qto-takeoff](https://pypi.org/project/qto-takeoff/) / [aec-platform/qto](https://github.com/aec-platform/qto): metrado desde IFC con mapeo a códigos de partidas en TOML y reporte de cobertura. Es buena idea para nuestro formato de plantillas de partidas.
- [Ollama + CORS (`OLLAMA_ORIGINS`)](https://objectgraph.com/blog/ollama-cors/) · [ai-sdk-ollama](https://app.unpkg.com/ai-sdk-ollama@0.6.1/files/README.md): soporte de Ollama si algún día se ofrece el "modo local".

---

## 10. Preguntas abiertas para el equipo

1. **cad-agent-plugin en producción:** ¿se oculta ya (opción A) o se tolera el "trae tu clave" mientras tanto?
2. **¿Predim v1 (`/predimv2`) entra al alcance del agente** o solo se corrige el bug?
3. **¿Quién pone el metrado manual de referencia** (2 edificios) para validar la F1?
4. **Plantilla de partidas:** ¿se exporta en un formato compatible con el software de presupuestos que usan (S10 u otro)?
5. **Cuota:** ¿límite por tareas/mes o en soles por plan de suscripción?
6. **Proveedor:** ¿se confirma Claude como único proveedor para el MVP, dejando Ollama local como opción posterior?
