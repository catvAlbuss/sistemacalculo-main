<template>
  <div class="etabs-cad-app">
    <section ref="drawingSurfaceRef" class="etabs-drawing-surface" aria-label="Visor y plano CAD">
      <MlCadViewer ref="cadViewerRef" locale="en" :background="0x1a1a2e" theme="dark" :local-file="selectedFile" :mode="writeMode" class="etabs-cad-viewer" />
      <FoundationOverlay :class="{ 'is-hidden': !overlayVisible }" :enabled="auxiliaryActive" :viewport-host="drawingSurfaceRef" :tool="foundationTool" :columns="currentColumns"
        :clear-signal="foundationClearSignal" :fit-signal="foundationFitSignal" :load-request="overlayLoadRequest"
        @polygons-change="onFoundationPolygonsChange" @frame-change="planeFrame = $event" />

      <!-- Capa alineada al plano de dibujo (sin cinta ni barra de estado del CAD). -->
      <div class="etabs-plane-layer etabs-theme" :style="planeStyle">
        <!-- Sin espacio en la cinta: botones flotantes en la esquina superior izquierda
             (la derecha la ocupan las barras nativas del visor). -->
        <div v-if="!ribbonSlot && !cimentacionPanelVisible" class="etabs-plane-actions">
          <button type="button" class="etabs-fab etabs-cimentacion-open" aria-expanded="false"
            aria-controls="etabs-foundation-panel" @click="openFoundationPanel">
            <span aria-hidden="true">⬒</span> Cimentación 2.0
          </button>
          <button v-if="results" type="button" class="etabs-fab etabs-results-open" @click="resultsVisible = true">
            <span aria-hidden="true">▦</span> Resultados
          </button>
          <button v-if="!agentVisible" type="button" class="etabs-fab etabs-agent-open" @click="agentVisible = true">
            <span aria-hidden="true">✦</span> Agente Predim
          </button>
        </div>

        <AgentePredimPanel v-if="agentMounted" v-show="agentVisible" @close="agentVisible = false" @foundation="onAgentFoundation" />

        <!-- Plano recuperado: el navegador descartó la pestaña, se volvió de otra página o se perdió la vista gráfica. -->
        <div v-if="copiaRecuperable" class="etabs-recovery" role="alert">
          <span><b>{{ graficoPerdido ? "La vista gráfica se reinició." : "Hay un plano sin cerrar." }}</b> {{ textoCopia }}</span>
          <button type="button" class="fz-btn fz-btn-primary" @click="reabrirCopia">Reabrir plano</button>
          <button type="button" class="fz-btn fz-btn-ghost" @click="descartarCopia">Descartar</button>
        </div>

        <div v-if="auxiliaryActive && cimentacionPanelVisible" class="etabs-tool-hint" role="status">
          <span><b>{{ toolLabels[foundationTool]?.title }}</b> · {{ toolLabels[foundationTool]?.hint }}</span>
          <button type="button" class="fz-btn etabs-native-mode" @click="auxiliaryActive = false">Volver al CAD</button>
        </div>

        <aside v-if="panelMounted" v-show="cimentacionPanelVisible" id="etabs-foundation-panel" class="etabs-cimentacion-dock" :class="{ 'is-minimized': panelMinimized }"
          aria-label="Cimentación 2.0">
          <header class="etabs-cimentacion-header">
            <div class="etabs-cimentacion-title">
              <h2>Cimentación 2.0</h2>
              <p class="etabs-cimentacion-summary">
                <span>Columnas: {{ currentColumns.length }}</span>
                <span>Zapatas: {{ foundationPolygons.length }}</span>
              </p>
            </div>
            <button type="button" class="etabs-icon-btn" :aria-label="panelMinimized ? 'Expandir panel' : 'Minimizar panel'"
              :title="panelMinimized ? 'Expandir' : 'Minimizar'" @click="panelMinimized = !panelMinimized">{{ panelMinimized ? "▢" : "—" }}</button>
            <button type="button" class="etabs-icon-btn etabs-cimentacion-close" aria-label="Cerrar panel" title="Cerrar" @click="closeFoundationPanel">✕</button>
          </header>

          <div v-if="notice" v-show="!panelMinimized" class="etabs-notice" :class="notice.type === 'error' ? 'etabs-error' : 'etabs-info'" role="alert">
            <div>
              <strong>{{ notice.title }}</strong>
              <p>{{ notice.text }}</p>
            </div>
            <button type="button" class="etabs-icon-btn" aria-label="Descartar aviso" @click="dismissNotice">✕</button>
          </div>

          <DatosGeneralesPanel ref="datosPanelRef" v-show="!panelMinimized" :polygons="foundationPolygons" :active-foundation-tool="foundationTool"
            :tool-active="auxiliaryActive" :calculating="loading" :has-results="!!results" @open-results="resultsVisible = true"
            @import-excel="onImportExcel" @joint-reactions="onJointReactions" @columns-change="onColumnsChange"
            @set-foundation-tool="onSetFoundationTool" @clear-foundation-polygons="onClearFoundationPolygons"
            @fit-foundation-view="onFitFoundationView" @calculate-zapatas="onCalculateZapatas"
            @capture-cad-polyline="onCaptureCadPolyline" @load-example="onLoadExample" />
        </aside>
      </div>
    </section>

    <!-- Grupo "Predim" dentro de la cinta del visor, junto a "Utilidades". -->
    <Teleport v-if="ribbonSlot" :to="ribbonSlot.host">
      <PredimRibbonGroup :slot-style="ribbonSlot.style" :cimentacion-open="cimentacionPanelVisible" :agent-open="agentVisible"
        :has-results="!!results" :foundation-pending="!!pendingFoundation" @open-cimentacion="toggleFoundationFromRibbon"
        @open-agent="agentVisible = !agentVisible" @open-results="resultsVisible = true" />
    </Teleport>

    <EtabsModal v-if="results && resultsVisible" title="Resultados de cimentación" size="xl"
      :subtitle="`Presiones en el suelo bajo ${results.normalizedPolygons?.length ?? 0} zapata(s) para ${results.loadCombinations?.length ?? 0} combinaciones de servicio.`"
      @close="resultsVisible = false">
      <ResultadosCimentacionInline :results="results" />
      <template #footer>
        <button type="button" class="fz-btn fz-btn-ghost fz-btn-danger etabs-resultados-close" @click="onClearCimentacionResults">Descartar resultados</button>
        <button type="button" class="fz-btn fz-btn-primary" @click="resultsVisible = false">Cerrar</button>
      </template>
    </EtabsModal>
  </div>
</template>

<script setup>
import {
  captureAllPolygons,
  validateCapturedPolygons,
} from "./composables/usePolygonCapture.js";
import { computed, defineAsyncComponent, nextTick, ref, watch, onBeforeUnmount } from "vue";
import "../../css/etabs-workspace.css";
import { MlCadViewer } from "@mlightcad/cad-viewer";
import { AcApDocManager, AcEdOpenMode } from "@mlightcad/cad-simple-viewer";
import { crearRecuperacion, describirCopia } from "./composables/useDrawingRecovery.js";

import DatosGeneralesPanel from "./components/DatosGeneralesPanel.vue";
import FoundationOverlay from "./components/FoundationOverlay.vue";
import ResultadosCimentacionInline from "./components/ResultadosCimentacionInline.vue";
import EtabsModal from "./components/EtabsModal.vue";
import PredimRibbonGroup from "./components/PredimRibbonGroup.vue";
// El agente (y su acceso a la librería de datos CAD) se carga al abrir su panel.
const AgentePredimPanel = defineAsyncComponent(() => import("./components/AgentePredimPanel.vue"));

import { useZapatas2 } from "./composables/useZapatas2.js";
import { buildExampleFootings, EXAMPLE_FOOTING_SOURCE } from "./composables/exampleFootings.js";

const toolLabels = {
  move: { title: "Mover vista", hint: "Arrastra para desplazar; rueda para acercar." },
  draw: { title: "Dibujar zapata", hint: "Clic en cada vértice; clic en el primero para cerrar; Esc cancela." },
  edit: { title: "Editar vértices", hint: "Arrastra un vértice para moverlo." },
  erase: { title: "Borrar zapata", hint: "Clic sobre el borde de la zapata." },
};

const cadViewerRef = ref(null);
const drawingSurfaceRef = ref(null);
const auxiliaryActive = ref(false);
const planeFrame = ref(null);
let surfaceObserver = null, surfaceFrame = null;
watch(drawingSurfaceRef, element => {
  surfaceObserver?.disconnect();
  if (!element) return;
  let previous = '';
  surfaceObserver = new ResizeObserver(() => {
    const size = `${element.clientWidth}:${element.clientHeight}`;
    if (size === previous) return;
    previous = size;
    if (surfaceFrame !== null) cancelAnimationFrame(surfaceFrame);
    // The CAD SDK listens to the browser resize event to update its camera and renderer.
    surfaceFrame = requestAnimationFrame(() => { surfaceFrame = null; window.dispatchEvent(new Event('resize')); });
  });
  surfaceObserver.observe(element);
}, {flush:'post'});
// La cinta del visor no admite grupos propios: el grupo "Predim" se coloca al
// final del panel cuando hay espacio libre en la pestaña activa.
const RIBBON_GROUP_WIDTH = 230;
const ribbonSlot = ref(null);
let ribbonFrame = null, ribbonWatchers = [], watchedPanel = null, ribbonSentinel = null;
const measureRibbon = () => {
  ribbonFrame = null;
  const host = drawingSurfaceRef.value?.querySelector("section.ml-ribbon");
  const panel = host?.querySelector(":scope > main.ml-ribbon__panel");
  if (!host || !panel || !panel.offsetHeight) { ribbonSlot.value = null; return; }
  if (getComputedStyle(host).position === "static") host.style.position = "relative";
  const box = panel.getBoundingClientRect();
  const lastRight = Math.max(box.left, ...[...panel.querySelectorAll(":scope > .ml-ribbon-group")].map((group) => group.getBoundingClientRect().right));
  ribbonSlot.value = box.right - lastRight < RIBBON_GROUP_WIDTH ? null
    : {host, style: {top: `${panel.offsetTop}px`, height: `${panel.offsetHeight}px`}};
};
const scheduleRibbon = () => { if (ribbonFrame === null) ribbonFrame = requestAnimationFrame(measureRibbon); };
// El visor crea la cinta después de montar y la reemplaza entera al abrir un
// documento: se vigila el panel vigente y se vuelve a enganchar cuando cambia.
const attachRibbon = () => {
  const panel = drawingSurfaceRef.value?.querySelector("section.ml-ribbon > main.ml-ribbon__panel") ?? null;
  if (panel === watchedPanel) return;
  ribbonWatchers.forEach((watcher) => watcher.disconnect());
  ribbonWatchers = [];
  watchedPanel = panel;
  if (panel) {
    const resize = new ResizeObserver(scheduleRibbon);
    resize.observe(panel);
    const tabs = new MutationObserver(scheduleRibbon);   // cambio de pestaña
    tabs.observe(panel, {childList: true});
    ribbonWatchers.push(resize, tabs);
  }
  scheduleRibbon();
};
watch(drawingSurfaceRef, (element) => {
  ribbonSentinel?.disconnect();
  if (!element) return;
  // Comprobación barata en cada cambio del DOM del visor.
  ribbonSentinel = new MutationObserver(() => { if (!watchedPanel?.isConnected) attachRibbon(); });
  ribbonSentinel.observe(element, {childList: true, subtree: true});
  attachRibbon();
}, {flush: "post"});

onBeforeUnmount(() => {
  ribbonWatchers.forEach((watcher) => watcher.disconnect());
  ribbonSentinel?.disconnect();
  if (ribbonFrame !== null) cancelAnimationFrame(ribbonFrame);
  surfaceObserver?.disconnect();
  if (surfaceFrame !== null) cancelAnimationFrame(surfaceFrame);
});
const selectedFile = ref(undefined);
const writeMode = AcEdOpenMode.Write;

// Copia de recuperación del plano (IndexedDB de este navegador): si la pestaña se
// descarta, se vuelve de otra página o se pierde el contexto WebGL, se puede reabrir.
const recuperacion = crearRecuperacion({
  getDocument: () => {
    const doc = AcApDocManager.instance?.curDocument;
    return doc?.database ? {database: doc.database, nombre: doc.docTitle || doc.fileName} : null;
  },
});
const copiaRecuperable = ref(null);
const graficoPerdido = ref(false);
const textoCopia = computed(() => (copiaRecuperable.value ? describirCopia(copiaRecuperable.value) : ""));
const guardarCopia = (opciones) => recuperacion.guardar(opciones);
const reabrirCopia = () => {
  const copia = copiaRecuperable.value;
  if (!copia) return;
  copiaRecuperable.value = null;
  graficoPerdido.value = false;
  selectedFile.value = recuperacion.archivo(copia);
};
const descartarCopia = async () => {
  copiaRecuperable.value = null;
  graficoPerdido.value = false;
  await recuperacion.descartar();
};
recuperacion.leer().then((copia) => { if (copia && !selectedFile.value) copiaRecuperable.value = copia; });
const alOcultar = () => { if (document.visibilityState === "hidden") guardarCopia(); };
const alSalir = () => { guardarCopia(); };
document.addEventListener("visibilitychange", alOcultar);
window.addEventListener("pagehide", alSalir);
const autoguardado = setInterval(() => guardarCopia(), 90000);
// El contexto WebGL se pierde (poca memoria de video, pestaña muy inactiva): el dibujo
// sigue en memoria; se guarda y se ofrece reabrirlo para que se vuelva a dibujar.
const alPerderGrafico = async (event) => {
  event.preventDefault?.();
  await guardarCopia({forzar: true});
  const copia = await recuperacion.leer();
  if (copia) { graficoPerdido.value = true; copiaRecuperable.value = copia; }
};
watch(drawingSurfaceRef, (element, anterior) => {
  anterior?.removeEventListener("webglcontextlost", alPerderGrafico, true);
  element?.addEventListener("webglcontextlost", alPerderGrafico, true);
}, {flush: "post"});
// Al abrir otro archivo, el aviso de un plano anterior ya no aplica.
watch(selectedFile, () => { if (!graficoPerdido.value) copiaRecuperable.value = null; });
onBeforeUnmount(() => {
  guardarCopia();
  clearInterval(autoguardado);
  document.removeEventListener("visibilitychange", alOcultar);
  window.removeEventListener("pagehide", alSalir);
  drawingSurfaceRef.value?.removeEventListener("webglcontextlost", alPerderGrafico, true);
});

// Without a measured plane the layer covers the whole surface.
const planeStyle = computed(() => {
  const frame = planeFrame.value;
  if (!frame || frame.width < 1 || frame.height < 1) return { inset: "0px" };
  return { left: `${frame.left}px`, top: `${frame.top}px`, width: `${frame.width}px`, height: `${frame.height}px` };
});

// Agente Predim: dibuja y lee el documento abierto del visor.
const agentVisible = ref(false);
const agentMounted = ref(false);
watch(agentVisible, (visible) => { if (visible) agentMounted.value = true; });

const cimentacionPanelVisible = ref(false);
// Si las zapatas vienen del plano ya están dibujadas en el CAD; la capa auxiliar
// (con su propia vista) solo se muestra mientras se usa una herramienta suya.
const fromPlan = ref(false);
const overlayVisible = computed(() => cimentacionPanelVisible.value && (!fromPlan.value || auxiliaryActive.value));
// The panel is created on first open and then kept, so its data survives closing it.
const panelMounted = ref(false);
const panelMinimized = ref(false);
const resultsVisible = ref(false);

const currentColumns = ref([]);
// Overlay polygons (drawn or example) and CAD-captured polylines are kept apart
// so a new capture never discards what was drawn on the overlay.
const overlayPolygons = ref([]);
const cadPolygons = ref([]);
const foundationPolygons = computed(() => [...overlayPolygons.value, ...cadPolygons.value].map((polygon, index) => ({
  ...polygon,
  index: index + 1,
  label: polygon.label || `Z${index + 1}`,
})));
const foundationTool = ref("move");

const foundationClearSignal = ref(0);
const foundationFitSignal = ref(0);
const overlayLoadRequest = ref(null);

const notice = ref(null);
const showError = (text, title = "Revisa los datos") => { notice.value = { type: "error", title, text }; };
const showInfo = (text, title) => { notice.value = { type: "info", title, text }; };
const dismissNotice = () => { notice.value = null; };

const {
  loading,
  error,
  results,
  calculateZapatas2,
  clearResults,
} = useZapatas2();

const onClearCimentacionResults = () => {
  resultsVisible.value = false;
  dismissNotice();
  clearResults();
};

const onImportExcel = (file) => {
  dismissNotice();
  clearResults();

  console.log("📊 Excel de reacciones seleccionado:", file?.name);
};

const onJointReactions = () => {
  dismissNotice();
};

const onColumnsChange = (columns) => {
  currentColumns.value = Array.isArray(columns) ? columns : [];

  clearResults();

  if (currentColumns.value.length > 0) {
    foundationFitSignal.value += 1;
  }
};

const onFoundationPolygonsChange = (polygons) => {
  overlayPolygons.value = Array.isArray(polygons) ? polygons : [];
  clearResults();
};

const onLoadExample = (force) => {
  if (!force && foundationPolygons.value.length) return;
  fromPlan.value = false;
  const footings = buildExampleFootings(currentColumns.value);
  if (!footings.length) return;
  cadPolygons.value = [];
  overlayLoadRequest.value = { id: Date.now(), polygons: footings };
  if (force) showInfo(`Se generó una zapata aislada por columna (${footings.length}). Puedes editarlas, borrarlas o reemplazarlas por polilíneas del CAD.`, "Zapatas de ejemplo");
};

// Columnas y zapatas que el agente leyó del plano abierto.
const datosPanelRef = ref(null);
// El agente deja los datos listos sin abrir Cimentación 2.0: se cargan cuando el
// usuario abre el panel (o al instante si ya está abierto).
const pendingFoundation = ref(null);
const onAgentFoundation = (payload) => {
  if (cimentacionPanelVisible.value && datosPanelRef.value) applyFoundation(payload);
  else pendingFoundation.value = payload;
};
const applyFoundation = async ({columnas, zapatas}) => {
  await nextTick();
  datosPanelRef.value?.importColumns(columnas);
  await nextTick();
  cadPolygons.value = [];
  fromPlan.value = true;
  overlayLoadRequest.value = { id: Date.now(), polygons: zapatas };
  showInfo(`${columnas.length} columnas y ${zapatas.length} zapatas predimensionadas desde el plano. Las cargas son de gravedad (sin sismo): revísalas en "Ver / editar tabla" antes de calcular.`, "Importado desde el plano");
};

const onSetFoundationTool = (tool) => {
  foundationTool.value = tool;
  auxiliaryActive.value = true;
};
const closeFoundationPanel = () => {
  cimentacionPanelVisible.value = false;
  auxiliaryActive.value = false;
};
const toggleFoundationFromRibbon = () => {
  if (cimentacionPanelVisible.value && !panelMinimized.value) closeFoundationPanel();
  else openFoundationPanel();
};
const openFoundationPanel = () => {
  panelMounted.value = true;
  cimentacionPanelVisible.value = true;
  panelMinimized.value = false;
  if (pendingFoundation.value) {
    const payload = pendingFoundation.value;
    pendingFoundation.value = null;
    nextTick(() => applyFoundation(payload));
  }
};

const onClearFoundationPolygons = () => {
  foundationClearSignal.value += 1;
  overlayPolygons.value = [];
  cadPolygons.value = [];

  dismissNotice();
  clearResults();
};

const onFitFoundationView = () => {
  foundationFitSignal.value += 1;
};

const onCalculateZapatas = async (payload) => {
  try {
    dismissNotice();

    if (!currentColumns.value.length) {
      throw new Error("Primero carga las columnas en el paso Datos.");
    }

    if (!foundationPolygons.value.length) {
      throw new Error("Agrega al menos una zapata cerrada en el paso Zapatas.");
    }

    const calculationResults = await calculateZapatas2({
      ...payload,
      columns: currentColumns.value,
      polygons: foundationPolygons.value,
    });

    console.log("✅ Resultados de zapatas:", calculationResults);
    resultsVisible.value = true;
  } catch (calculationError) {
    showError(error.value || calculationError?.message || "No se pudo calcular las zapatas.", "No se pudo calcular");

    console.error("❌ No se pudo calcular zapatas:", calculationError);
  }
};

const onCaptureCadPolyline = () => {
  try {
    dismissNotice();
    const all = captureAllPolygons();
    const closed = all.filter((polygon) => polygon.closed && polygon.nodes.length >= 3);

    if (!closed.length) {
      // Keep whatever is already captured; only explain how to close the path.
      showError(all.length
        ? "La polilínea del CAD está abierta. Finaliza el trazado y ciérrala (opción C / Cerrar) antes de capturarla."
        : "No hay polilíneas en el dibujo. Finaliza el trazado de una Polilínea cerrada o usa “Dibujar” en el panel.",
      "No se encontró una zapata cerrada");
      return;
    }

    const validation = validateCapturedPolygons(closed);

    if (!validation.ok) {
      showError(validation.invalidPolygons[0]?.reason || validation.message);
      return;
    }

    clearResults();
    cadPolygons.value = validation.validPolygons.map((polygon, index) => ({ ...polygon, label: `CAD-${index + 1}` }));
    // CAD footings replace the generated example ones.
    if (overlayPolygons.value.some((polygon) => polygon.source === EXAMPLE_FOOTING_SOURCE)) {
      overlayLoadRequest.value = { id: Date.now(), polygons: overlayPolygons.value.filter((polygon) => polygon.source !== EXAMPLE_FOOTING_SOURCE) };
    }

    const skipped = validation.invalidPolygons.length;
    showInfo(`${validation.validPolygons.length} polilínea(s) cerrada(s) capturada(s) como zapata.${skipped ? ` ${skipped} se omitieron por no ser válidas.` : ""}`, "Captura completada");
  } catch (captureError) {
    showError(captureError?.message || "No se pudo capturar la polilínea del CAD.");

    console.error("❌ No se pudo capturar la Polyline CAD:", captureError);
  }
};
</script>

<style scoped>
.etabs-cad-app { position:relative;isolation:isolate;z-index:0;display:flex;flex-direction:column;flex:1;min-width:0;min-height:0;width:100%;overflow:hidden;background:#1a1a2e; }
.etabs-drawing-surface { position:relative;isolation:isolate;contain:layout paint;flex:1;min-width:0;min-height:0;overflow:hidden;background:#1a1a2e; }
.etabs-cad-viewer { position:absolute;inset:0;width:100%;height:100%; }
.etabs-drawing-surface :deep(.ml-cad-viewer-container) { position:absolute;inset:0;z-index:auto;width:100%;height:100%; }

.foundation-overlay.is-hidden { visibility:hidden; }
.etabs-plane-layer { position:absolute;z-index:5;pointer-events:none; }
.etabs-plane-layer > * { pointer-events:auto; }
.etabs-recovery { position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:8;display:flex;flex-wrap:wrap;align-items:center;gap:8px;max-width:calc(100% - 24px);padding:9px 12px;border:1px solid var(--pr-blue);border-radius:9px;background:var(--pr-panel);color:var(--pr-text);font-size:12.5px;box-shadow:0 8px 24px #0005; }
.etabs-plane-actions { position:absolute;top:12px;left:12px;display:flex;gap:8px; }
.etabs-fab { display:inline-flex;align-items:center;gap:7px;min-height:36px;padding:7px 14px;border:1px solid rgba(128,181,255,.35);border-radius:9px;background:rgba(22,35,58,.94);color:var(--pr-text);font-weight:600;font-size:13px;line-height:1;font-family:inherit;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35);backdrop-filter:blur(6px); }
.etabs-fab:hover { border-color:var(--pr-blue); }
.etabs-cimentacion-open { border-color:transparent;background:var(--fz-accent);color:#fff; }
.etabs-cimentacion-open:hover { background:var(--fz-accent-hover); }

.etabs-tool-hint { position:absolute;top:60px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:12px;max-width:calc(100% - 24px);padding:6px 6px 6px 14px;border:1px solid rgba(128,181,255,.35);border-radius:10px;background:rgba(22,35,58,.94);font-size:12.5px;box-shadow:0 6px 18px rgba(0,0,0,.35); }
.etabs-tool-hint b { color:var(--pr-blue); }

.etabs-cimentacion-dock { position:absolute;top:12px;left:12px;bottom:56px;display:flex;flex-direction:column;width:min(400px,calc(100% - 24px));min-height:0;overflow:hidden;border:1px solid var(--pr-line);border-radius:12px;background:var(--pr-panel);box-shadow:0 18px 44px rgba(0,0,0,.45); }
.etabs-cimentacion-dock.is-minimized { bottom:auto;width:min(300px,calc(100% - 24px)); }
.etabs-cimentacion-header { display:flex;align-items:center;gap:6px;padding:10px 10px 10px 14px;border-bottom:1px solid var(--pr-line); }
.etabs-cimentacion-dock.is-minimized .etabs-cimentacion-header { border-bottom:0; }
.etabs-cimentacion-title { flex:1;min-width:0; }
.etabs-cimentacion-title h2 { margin:0;font-size:15px;font-weight:700; }
.etabs-cimentacion-summary { display:flex;gap:10px;margin:2px 0 0;font-size:11.5px;color:var(--pr-muted); }
.etabs-icon-btn { display:grid;place-items:center;flex-shrink:0;width:30px;height:30px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--pr-muted);font-size:13px;cursor:pointer; }
.etabs-icon-btn:hover { border-color:var(--pr-line);color:var(--pr-text);background:var(--pr-soft); }

.etabs-notice { display:flex;align-items:flex-start;gap:8px;margin:10px 12px 0;padding:9px 6px 9px 12px;border:1px solid;border-radius:9px;font-size:12.5px; }
.etabs-notice p { margin:2px 0 0; }
.etabs-error { border-color:rgba(248,113,113,.45);background:rgba(127,29,29,.25);color:#fecaca; }
.etabs-info { border-color:rgba(128,181,255,.35);background:rgba(30,64,120,.25);color:#d6e6ff; }
.etabs-notice > div { flex:1;min-width:0; }

@media(max-width:760px) {
  .etabs-plane-actions { top:8px;left:8px; }
  .etabs-fab { min-height:34px;padding:6px 10px;font-size:12px; }
  .etabs-cimentacion-dock { top:auto;left:8px;right:8px;bottom:8px;width:auto;max-height:calc(100% - 60px); }
  .etabs-cimentacion-dock:not(.is-minimized) { height:calc(100% - 60px); }
  .etabs-cimentacion-dock.is-minimized { width:auto; }
  .etabs-tool-hint { top:52px;font-size:11.5px; }
}
</style>
