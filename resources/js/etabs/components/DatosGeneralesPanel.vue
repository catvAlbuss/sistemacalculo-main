<template>
  <div class="dg-panel">
    <!-- Encabezado -->
    <div class="dg-header">
      <h2 class="dg-title">Datos Generales</h2>
      <p class="dg-subtitle">
        Define los parametros, importa reacciones y captura las coordenadas del polígono.
      </p>
    </div>

    <!-- Fila de datos -->
    <div class="dg-row">
      <!-- Df -->
      <div class="dg-card">
        <label class="dg-label" for="dg-df">Df</label>
        <input id="dg-df" v-model.number="df" type="number" step="0.1" class="dg-input" />
      </div>

      <!-- Peso Específico -->
      <div class="dg-card">
        <label class="dg-label" for="dg-gamma">Peso Especifico (γ<sub>e</sub>)</label>
        <input id="dg-gamma" v-model.number="gammaE" type="number" step="0.1" class="dg-input" />
      </div>

      <!-- Excel de reacciones -->
      <div class="dg-card dg-card-wide">
        <div class="dg-card-head">
          <span class="dg-label">1. Excel de reacciones</span>
          <button class="dg-btn dg-btn-blue" @click="onJointReactions">Joint Reactions</button>
        </div>
        <div class="dg-excel-row">
          <label class="dg-file-btn">
            Seleccionar archivo
            <input type="file" accept=".xlsx,.xls,.csv" class="dg-hidden" @change="onExcelChange" />
          </label>
          <span class="dg-file-name" :title="excelFileName">{{ excelFileName || "Ningún archivo seleccionado" }}</span>
          <button class="dg-btn dg-btn-blue" :disabled="!excelFile" @click="onImportExcel">Importar</button>
        </div>
      </div>
    </div>

    <!-- Polígonos -->
    <div class="dg-poly">
      <div class="dg-poly-head">
        <span class="dg-label">Coordenadas de los polígonos</span>
        <button class="dg-btn dg-btn-green" @click="onCapture">📐 Capturar polígonos</button>
      </div>

      <p v-if="captureMessage" class="dg-msg">{{ captureMessage }}</p>

      <div v-for="poly in polygons" :key="poly.index" class="dg-poly-item">
        <div class="dg-poly-item-head">
          Polígono {{ poly.index }}
          <span class="dg-poly-meta">
            {{ poly.nodes.length }} nodos · {{ poly.closed ? "cerrado" : "abierto" }}
          </span>
        </div>
        <div class="dg-table-wrap">
          <table class="dg-table">
            <thead>
              <tr>
                <th>#</th>
                <th>X</th>
                <th>Y</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="node in poly.nodes" :key="node.id">
                <td>{{ node.id }}</td>
                <td>{{ formatCoord(node.x) }}</td>
                <td>{{ formatCoord(node.y) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { captureAllPolygons } from "../composables/usePolygonCapture.js";

const emit = defineEmits(["capture", "import-excel", "joint-reactions"]);

const df = ref(2);
const gammaE = ref(1.8);

const excelFile = ref(null);
const excelFileName = computed(() => excelFile.value?.name ?? "");

const polygons = ref([]);
const captureMessage = ref("");

const formatCoord = (value) => Number(value).toFixed(3);

const onExcelChange = (event) => {
  excelFile.value = event.target.files?.[0] ?? null;
};

const onJointReactions = () => {
  emit("joint-reactions");
};

const onImportExcel = () => {
  if (!excelFile.value) return;
  emit("import-excel", excelFile.value);
};

const onCapture = () => {
  const captured = captureAllPolygons();

  if (captured.length === 0) {
    polygons.value = [];
    captureMessage.value = "No se encontró ningún polígono. Dibuja uno con la herramienta Polyline.";
    return;
  }

  polygons.value = captured;
  const totalNodes = captured.reduce((sum, p) => sum + p.nodes.length, 0);
  captureMessage.value = `${captured.length} polígono(s) · ${totalNodes} nodos en total`;

  emit("capture", { polygons: captured, df: df.value, gammaE: gammaE.value });
};
</script>

<style scoped>
.dg-panel {
  /* La posición la define el contenedor (dock) en App.vue */
  width: 560px;
  max-width: 90vw;
  max-height: 75vh;
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.96);
  color: #e2e8f0;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  font-size: 13px;
}

.dg-header {
  margin-bottom: 10px;
}

.dg-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

.dg-subtitle {
  margin: 2px 0 0;
  font-size: 11px;
  color: #60a5fa;
}

.dg-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.dg-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 8px 10px;
  flex: 1;
  min-width: 110px;
}

.dg-card-wide {
  flex: 2;
  min-width: 240px;
}

.dg-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.dg-label {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.dg-input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #475569;
  border-radius: 6px;
  color: #e2e8f0;
  padding: 6px 8px;
  font-size: 13px;
}

.dg-excel-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dg-file-btn {
  cursor: pointer;
  background: #334155;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  white-space: nowrap;
}

.dg-file-btn:hover {
  background: #475569;
}

.dg-file-name {
  flex: 1;
  font-size: 11px;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dg-btn {
  cursor: pointer;
  border: none;
  border-radius: 6px;
  color: #fff;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.dg-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dg-btn-blue {
  background: #2563eb;
}

.dg-btn-blue:hover:not(:disabled) {
  background: #1d4ed8;
}

.dg-btn-green {
  background: #16a34a;
}

.dg-btn-green:hover:not(:disabled) {
  background: #15803d;
}

.dg-poly {
  margin-top: 10px;
  border-top: 1px solid #334155;
  padding-top: 10px;
}

.dg-poly-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.dg-msg {
  margin: 6px 0 0;
  font-size: 11px;
  color: #cbd5e1;
}

.dg-poly-item {
  margin-top: 8px;
}

.dg-poly-item-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 4px;
}

.dg-poly-meta {
  font-size: 11px;
  font-weight: 400;
  color: #94a3b8;
}

.dg-table-wrap {
  margin-top: 8px;
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid #334155;
  border-radius: 6px;
}

.dg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.dg-table th,
.dg-table td {
  padding: 4px 8px;
  text-align: right;
  border-bottom: 1px solid #1e293b;
}

.dg-table th:first-child,
.dg-table td:first-child {
  text-align: center;
  width: 36px;
}

.dg-table thead th {
  position: sticky;
  top: 0;
  background: #1e293b;
  color: #94a3b8;
  font-weight: 600;
}

.dg-hidden {
  display: none;
}
</style>
