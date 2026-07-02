<template>
  <div class="etabs-cad-app">
    <MlCadViewer ref="cadViewerRef" locale="default" :background="0x1a1a2e" theme="dark" :local-file="selectedFile"
      :mode="writeMode" class="etabs-cad-viewer" />

    <FoundationOverlay :enabled="cimentacionPanelVisible" :tool="foundationTool" :columns="currentColumns"
      :clear-signal="foundationClearSignal" :fit-signal="foundationFitSignal"
      @polygons-change="onFoundationPolygonsChange" />

    <button class="etabs-cimentacion-open" @click="cimentacionPanelVisible = !cimentacionPanelVisible">
      📘 Cimentación 2.0
    </button>

    <aside v-if="cimentacionPanelVisible" class="etabs-cimentacion-dock">
      <header class="etabs-cimentacion-header">
        <div>
          <h2>Cimentación 2.0</h2>
          <p>Dibuja zapatas directamente sobre el visor principal de ETABS2.</p>
        </div>

        <button class="etabs-cimentacion-close" @click="cimentacionPanelVisible = false">
          ✕
        </button>
      </header>

      <div class="etabs-cimentacion-summary">
        <span>Columnas: {{ currentColumns.length }}</span>
        <span>Polígonos: {{ foundationPolygons.length }}</span>
        <span>Herramienta: {{ foundationTool }}</span>
      </div>

      <DatosGeneralesPanel :polygons-count="foundationPolygons.length" :active-foundation-tool="foundationTool"
        @import-excel="onImportExcel" @joint-reactions="onJointReactions" @columns-change="onColumnsChange"
        @set-foundation-tool="onSetFoundationTool" @clear-foundation-polygons="onClearFoundationPolygons"
        @fit-foundation-view="onFitFoundationView" @calculate-zapatas="onCalculateZapatas"
        @capture-cad-polyline="onCaptureCadPolyline" />

      <div v-if="loading || error || localError" class="etabs-cimentacion-status">
        <div v-if="loading" class="etabs-loading">
          Calculando zapatas con /zapatas2...
        </div>

        <div v-if="error || localError" class="etabs-error">
          <strong>Error de cálculo</strong>
          <p>{{ error || localError }}</p>
        </div>
      </div>
    </aside>

    <section v-if="results" class="etabs-resultados-dock">
      <header class="etabs-resultados-header">
        <div>
          <h2>Resultados de cimentación</h2>
          <p>Presiones generadas por /zapatas2.</p>
        </div>

        <button class="etabs-resultados-close" @click="onClearCimentacionResults">
          Limpiar
        </button>
      </header>

      <ResultadosCimentacionInline :results="results" />
    </section>
  </div>
</template>

<script setup>
import {
  captureLastClosedPolygon,
  validateCapturedPolygons,
} from "./composables/usePolygonCapture.js";
import { ref } from "vue";
import { MlCadViewer } from "@mlightcad/cad-viewer";
import { AcEdOpenMode } from "@mlightcad/cad-simple-viewer";

import DatosGeneralesPanel from "./components/DatosGeneralesPanel.vue";
import FoundationOverlay from "./components/FoundationOverlay.vue";
import ResultadosCimentacionInline from "./components/ResultadosCimentacionInline.vue";

import { useZapatas2 } from "./composables/useZapatas2.js";

const cadViewerRef = ref(null);
const selectedFile = ref(undefined);
const writeMode = AcEdOpenMode.Write;

const cimentacionPanelVisible = ref(false);

const currentColumns = ref([]);
const foundationPolygons = ref([]);
const foundationTool = ref("move");

const foundationClearSignal = ref(0);
const foundationFitSignal = ref(0);

const localError = ref("");

const {
  loading,
  error,
  results,
  calculateZapatas2,
  clearResults,
} = useZapatas2();

const onClearCimentacionResults = () => {
  localError.value = "";
  clearResults();
};

const onImportExcel = (file) => {
  localError.value = "";
  clearResults();

  console.log("📊 Excel de reacciones seleccionado:", file?.name);
};

const onJointReactions = () => {
  localError.value = "";
  console.log("📊 Importando Joint Reactions en Cimentación 2.0.");
};

const onColumnsChange = (columns) => {
  currentColumns.value = Array.isArray(columns) ? columns : [];

  localError.value = "";
  clearResults();

  if (currentColumns.value.length > 0) {
    foundationFitSignal.value += 1;
  }
};

const onFoundationPolygonsChange = (polygons) => {
  foundationPolygons.value = Array.isArray(polygons) ? polygons : [];

  localError.value = "";
  clearResults();
};

const onSetFoundationTool = (tool) => {
  foundationTool.value = tool;
};

const onClearFoundationPolygons = () => {
  foundationClearSignal.value += 1;
  foundationPolygons.value = [];

  localError.value = "";
  clearResults();
};

const onFitFoundationView = () => {
  foundationFitSignal.value += 1;
};

const onCalculateZapatas = async (payload) => {
  try {
    localError.value = "";

    if (!currentColumns.value.length) {
      throw new Error("Primero importa las columnas desde Point Object Connectivity.");
    }

    if (!foundationPolygons.value.length) {
      throw new Error("Dibuja al menos un polígono cerrado sobre el visor ETABS2.");
    }

    const calculationResults = await calculateZapatas2({
      ...payload,
      columns: currentColumns.value,
      polygons: foundationPolygons.value,
    });

    console.log("✅ Resultados de zapatas:", calculationResults);
  } catch (calculationError) {
    localError.value =
      calculationError?.message || "No se pudo calcular zapatas.";

    console.error("❌ No se pudo calcular zapatas:", calculationError);
  }
};

const onCaptureCadPolyline = () => {
  try {
    localError.value = "";
    clearResults();

    const polygon = captureLastClosedPolygon();

    if (!polygon) {
      throw new Error(
        "No se encontró una Polyline CAD cerrada. Dibuja una zapata con Home > Polyline, ciérrala y vuelve a capturar."
      );
    }

    const validation = validateCapturedPolygons([polygon]);

    if (!validation.ok) {
      throw new Error(validation.message);
    }

    foundationPolygons.value = validation.validPolygons;

    console.log("✅ Polyline CAD capturada como zapata:", {
      polygon: validation.validPolygons[0],
      total: validation.validPolygons.length,
    });
  } catch (captureError) {
    localError.value =
      captureError?.message || "No se pudo capturar la Polyline CAD.";

    console.error("❌ No se pudo capturar la Polyline CAD:", captureError);
  }
};
</script>

<style scoped>
.etabs-cad-app {
  position: relative;
  height: calc(100vh - 4rem);
  width: 100%;
  overflow: hidden;
  background: #1a1a2e;
}

.etabs-cad-viewer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.etabs-cimentacion-open {
  position: absolute;
  top: 140px;
  right: 14px;
  z-index: 100;
  cursor: pointer;
  border: 1px solid #60a5fa;
  border-radius: 10px;
  background: #2563eb;
  color: #fff;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
}

.etabs-cimentacion-open:hover {
  background: #1d4ed8;
}

.etabs-cimentacion-dock {
  position: absolute;
  top: 12px;
  left: 12px;
  bottom: 12px;
  z-index: 95;
  width: 460px;
  max-width: calc(100vw - 32px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 12px;
  color: #e2e8f0;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.etabs-cimentacion-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.etabs-cimentacion-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 900;
}

.etabs-cimentacion-header p {
  margin: 3px 0 0;
  color: #93c5fd;
  font-size: 12px;
}

.etabs-cimentacion-close {
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background: #dc2626;
  color: #fff;
  padding: 6px 9px;
  font-weight: 800;
}

.etabs-cimentacion-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.etabs-cimentacion-summary span {
  background: #020617;
  border: 1px solid #334155;
  border-radius: 999px;
  padding: 5px 8px;
  font-size: 11px;
  font-weight: 800;
  color: #bfdbfe;
}

.etabs-cimentacion-status {
  background: #111827;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 10px;
  font-size: 12px;
}

.etabs-loading {
  color: #bfdbfe;
}

.etabs-error {
  color: #fecaca;
}

.etabs-error strong {
  color: #fca5a5;
}

.etabs-error p {
  margin: 5px 0 0;
}

.etabs-resultados-dock {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 96;
  width: min(760px, calc(100vw - 500px));
  max-height: 56vh;
  overflow: auto;
  background: rgba(15, 23, 42, 0.97);
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 12px;
  color: #e2e8f0;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.6);
}

.etabs-resultados-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.etabs-resultados-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
}

.etabs-resultados-header p {
  margin: 3px 0 0;
  font-size: 12px;
  color: #93c5fd;
}

.etabs-resultados-close {
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background: #334155;
  color: #fff;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 800;
}

:deep(.dg-panel) {
  width: 100%;
  max-width: none;
  max-height: none;
  flex: 1;
  box-shadow: none;
  border-radius: 10px;
}

:deep(.dg-config-grid) {
  grid-template-columns: repeat(2, minmax(80px, 1fr));
}

:deep(.dg-expression-input) {
  width: 150px;
}

:deep(.dg-table-wrap-large) {
  max-height: 220px;
}

@media (max-width: 1100px) {
  .etabs-cimentacion-dock {
    width: calc(100vw - 24px);
    right: 12px;
    bottom: auto;
    max-height: 65vh;
  }

  .etabs-resultados-dock {
    left: 12px;
    right: 12px;
    width: auto;
    max-height: 42vh;
  }
}
</style>