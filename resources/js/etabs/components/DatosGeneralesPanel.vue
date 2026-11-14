<template>
  <div class="dg-panel">
    <nav class="dg-steps" role="tablist" aria-label="Pasos de Cimentación 2.0">
      <button v-for="(step, index) in steps" :key="step.id" type="button" role="tab" class="dg-step"
        :aria-selected="activeStep === step.id" @click="activeStep = step.id">
        <span class="dg-step-dot" :class="{ 'is-done': step.done }">{{ step.done ? "✓" : index + 1 }}</span>
        <span>{{ step.label }}</span>
      </button>
    </nav>

    <div class="dg-body">
      <!-- Paso 1: datos -->
      <section v-show="activeStep === 'datos'" class="dg-pane" role="tabpanel">
        <div class="dg-block">
          <h3 class="dg-h">Fuente de datos</h3>
          <div class="fz-segmented" role="group" aria-label="Fuente de datos">
            <button v-for="mode in dataModes" :key="mode.id" type="button" :aria-pressed="dataInputMode === mode.id"
              @click="setDataInputMode(mode.id)">{{ mode.label }}</button>
          </div>
          <p class="fz-note">{{ currentMode.description }}</p>
        </div>

        <div class="dg-block dg-grid-2">
          <label class="fz-field">
            <span>Profundidad de desplante D<sub>f</sub></span>
            <span class="fz-unit"><input v-model.number="df" type="number" step="0.05" min="0" class="fz-input" /><em>m</em></span>
          </label>
          <label class="fz-field">
            <span>Peso específico γ<sub>e</sub></span>
            <span class="fz-unit"><input v-model.number="gammaE" type="number" step="0.05" min="0" class="fz-input" /><em>tn/m³</em></span>
          </label>
        </div>

        <!-- Importación ETABS / Excel -->
        <template v-if="dataInputMode === 'excel'">
          <div class="dg-block dg-import">
            <div class="dg-import-head">
              <span class="dg-import-num" :class="{ 'is-done': availableCombos.length }">A</span>
              <div>
                <strong>Reacciones en apoyos</strong>
                <p class="fz-note">Tabla <em>Joint Reactions</em> exportada desde ETABS.</p>
              </div>
            </div>
            <div class="dg-file-row">
              <label class="fz-btn dg-file">
                Elegir archivo
                <input type="file" accept=".xlsx,.xlsm,.xls" class="dg-hidden" @change="onReactionFileChange" />
              </label>
              <span class="dg-file-name" :title="reactionFileName">{{ reactionFileName || "Ningún archivo" }}</span>
              <button type="button" class="fz-btn fz-btn-primary" :disabled="!reactionFile || loading" @click="onImportReactions">Importar</button>
            </div>
            <details class="dg-details">
              <summary>Columnas del Excel (avanzado)</summary>
              <div class="dg-config-grid">
                <label class="fz-field"><span>Hoja</span><input v-model="reactionImportConfig.sheetName" class="fz-input" /></label>
                <label class="fz-field"><span>Fila inicial</span><input v-model.number="reactionImportConfig.startRow" type="number" class="fz-input" /></label>
                <label class="fz-field"><span>Punto</span><input v-model="reactionImportConfig.pointColumn" class="fz-input" /></label>
                <label class="fz-field"><span>Combo</span><input v-model="reactionImportConfig.comboColumn" class="fz-input" /></label>
                <label class="fz-field"><span>F2 (P)</span><input v-model="reactionImportConfig.f2Column" class="fz-input" /></label>
                <label class="fz-field"><span>MX</span><input v-model="reactionImportConfig.mxColumn" class="fz-input" /></label>
                <label class="fz-field"><span>MY</span><input v-model="reactionImportConfig.myColumn" class="fz-input" /></label>
              </div>
            </details>
          </div>

          <div v-if="availableCombos.length" class="dg-block dg-import">
            <div class="dg-import-head">
              <span class="dg-import-num" :class="{ 'is-done': comboSelection.length === 3 }">B</span>
              <div>
                <strong>Casos de carga</strong>
                <p class="fz-note">Elige en orden: carga muerta, carga viva y sismo.</p>
              </div>
            </div>
            <div class="dg-slots">
              <div v-for="(slot, index) in comboSlots" :key="slot" class="dg-slot" :class="{ 'is-filled': comboSelection[index] }">
                <span>{{ slot }}</span>
                <strong>{{ comboSelection[index] || "—" }}</strong>
              </div>
            </div>
            <div class="dg-row">
              <button type="button" class="fz-btn" @click="onAutoSelectRecommendedCombos">Sugerir automáticamente</button>
              <button type="button" class="fz-btn fz-btn-ghost" :disabled="!comboSelection.length" @click="clearComboSelection">Limpiar</button>
            </div>
            <input v-model="comboSearch" class="fz-input" placeholder="Buscar: CM, CV, SDX, SISAD…" aria-label="Buscar caso de carga" />
            <div class="dg-chips">
              <button v-for="filter in comboFilters" :key="filter.id" type="button" class="dg-chip"
                :aria-pressed="activeComboFilter === filter.id" @click="activeComboFilter = filter.id">
                {{ filter.label }} <span>{{ comboFilterCounts[filter.id] || 0 }}</span>
              </button>
            </div>
            <div class="dg-combos-list">
              <label v-for="combo in filteredCombos" :key="combo" class="dg-combo-item" :class="{ 'is-active': isComboChecked(combo) }">
                <input type="checkbox" :checked="isComboChecked(combo)"
                  :disabled="!isComboChecked(combo) && comboSelection.length >= 3"
                  @change="onToggleCombo(combo, $event.target.checked)" />
                <span class="dg-combo-name">{{ combo }}</span>
                <span class="dg-combo-badge" :class="`is-${getComboCategory(combo)}`">{{ getComboCategoryLabel(combo) }}</span>
              </label>
              <p v-if="filteredCombos.length === 0" class="fz-note">Ningún caso coincide con el filtro.</p>
            </div>
            <label class="fz-field">
              <span>Si un caso tiene varias filas (Max/Min), usar</span>
              <select v-model="duplicatePolicy" class="fz-input">
                <option v-for="policy in DUPLICATE_REACTION_POLICIES" :key="policy.id" :value="policy.id">{{ policy.label }}</option>
              </select>
            </label>
          </div>

          <div v-if="comboSelection.length === 3" class="dg-block dg-import">
            <div class="dg-import-head">
              <span class="dg-import-num" :class="{ 'is-done': readyToCalculate }">C</span>
              <div>
                <strong>Coordenadas de columnas</strong>
                <p class="fz-note">Tabla <em>Point Object Connectivity</em> de ETABS.</p>
              </div>
            </div>
            <div class="dg-file-row">
              <label class="fz-btn dg-file">
                Elegir archivo
                <input type="file" accept=".xlsx,.xlsm,.xls" class="dg-hidden" @change="onCoordinateFileChange" />
              </label>
              <span class="dg-file-name" :title="coordinateFileName">{{ coordinateFileName || "Ningún archivo" }}</span>
              <button type="button" class="fz-btn fz-btn-primary" :disabled="!coordinateFile || loading" @click="onImportCoordinates">Importar</button>
            </div>
            <details class="dg-details">
              <summary>Columnas del Excel (avanzado)</summary>
              <div class="dg-config-grid">
                <label class="fz-field"><span>Hoja</span><input v-model="coordinateImportConfig.sheetName" class="fz-input" /></label>
                <label class="fz-field"><span>Fila inicial</span><input v-model.number="coordinateImportConfig.startRow" type="number" class="fz-input" /></label>
                <label class="fz-field"><span>Punto</span><input v-model="coordinateImportConfig.pointColumn" class="fz-input" /></label>
                <label class="fz-field"><span>X</span><input v-model="coordinateImportConfig.xColumn" class="fz-input" /></label>
                <label class="fz-field"><span>Y</span><input v-model="coordinateImportConfig.yColumn" class="fz-input" /></label>
              </div>
            </details>
          </div>

          <p v-if="status" class="dg-msg">{{ status }}</p>
          <p v-if="error" class="dg-msg is-error">{{ error }}</p>
        </template>

        <!-- Resumen de columnas (todas las fuentes) -->
        <div class="dg-block fz-card dg-summary">
          <div>
            <strong>{{ activeRows.length }} columna(s)</strong>
            <p class="dg-msg" :class="activeValidation.ok ? 'is-ok' : 'is-error'">{{ activeValidation.message }}</p>
          </div>
          <div class="dg-row">
            <button v-if="dataInputMode === 'quick'" type="button" class="fz-btn fz-btn-ghost" @click="restoreQuickData">Restaurar ejemplo</button>
            <button v-if="dataInputMode === 'manual'" type="button" class="fz-btn" @click="addManualRow(); columnsModalOpen = true">+ Columna</button>
            <button type="button" class="fz-btn" :disabled="!activeRows.length" @click="columnsModalOpen = true">Ver / editar tabla</button>
          </div>
        </div>
      </section>

      <!-- Paso 2: zapatas -->
      <section v-show="activeStep === 'zapatas'" class="dg-pane" role="tabpanel">
        <div class="dg-block">
          <h3 class="dg-h">Zapatas desde el CAD</h3>
          <p class="fz-note">Dibuja cada zapata con <b>Polilínea</b> en el visor, ciérrala (opción <b>C</b>) y captúrala.</p>
          <button type="button" class="fz-btn fz-btn-primary fz-btn-block" @click="emit('capture-cad-polyline')">Capturar polilíneas cerradas</button>
        </div>

        <div class="dg-block dg-fallback">
          <h3 class="dg-h">Dibujo rápido sobre las columnas</h3>
          <div class="dg-tools" role="group" aria-label="Herramientas de dibujo auxiliar">
            <button v-for="tool in foundationTools" :key="tool.id" type="button" class="dg-tool"
              :aria-pressed="toolActive && activeFoundationTool === tool.id" :title="tool.hint"
              @click="emit('set-foundation-tool', tool.id)">
              <span aria-hidden="true">{{ tool.icon }}</span>{{ tool.label }}
            </button>
          </div>
          <div class="dg-row">
            <button type="button" class="fz-btn" @click="emit('fit-foundation-view')">Encuadrar columnas</button>
            <button v-if="dataInputMode === 'quick'" type="button" class="fz-btn" @click="emit('load-example', true)">Zapatas de ejemplo</button>
          </div>
        </div>

        <div class="dg-block">
          <div class="dg-list-head">
            <h3 class="dg-h">Zapatas ({{ footings.length }})</h3>
            <button type="button" class="fz-btn fz-btn-ghost fz-btn-danger" :disabled="!footings.length" @click="emit('clear-foundation-polygons')">Limpiar zapatas</button>
          </div>
          <p v-if="footings.length" class="dg-msg" :class="uncoveredColumns.length ? 'is-warn' : 'is-ok'">
            {{ uncoveredColumns.length
              ? `${uncoveredColumns.length} columna(s) sin zapata: ${uncoveredColumns.slice(0, 8).join(', ')}${uncoveredColumns.length > 8 ? '…' : ''}`
              : 'Todas las columnas quedan dentro de una zapata.' }}
          </p>
          <ul v-if="footings.length" class="dg-footings">
            <li v-for="footing in footings" :key="footing.index" :class="{ 'is-empty': !footing.columns.length }">
              <strong>{{ footing.name }}</strong>
              <span>{{ footing.area.toFixed(2) }} m²</span>
              <span class="dg-footing-cols">{{ footing.columns.length ? `Col. ${footing.columns.join(', ')}` : 'Sin columnas' }}</span>
              <span class="fz-badge">{{ sourceLabel(footing.source) }}</span>
            </li>
          </ul>
          <div v-else class="dg-empty">
            <p>Todavía no hay zapatas.</p>
            <p class="fz-note">Captura polilíneas del CAD o usa “Dibujar” para trazarlas sobre las columnas.</p>
          </div>
        </div>
      </section>

      <!-- Paso 3: combinaciones -->
      <section v-show="activeStep === 'combos'" class="dg-pane" role="tabpanel">
        <div class="dg-block">
          <div class="dg-list-head">
            <h3 class="dg-h">Combinaciones de servicio ({{ loadCombinations.length }})</h3>
            <button type="button" class="fz-btn" @click="combosModalOpen = true">Editar</button>
          </div>
          <p class="fz-note">P, Mx y My de cada combinación se calculan con las cargas de cada columna.</p>
          <ol class="dg-combo-preview">
            <li v-for="(row, index) in loadCombinations" :key="row.id">
              <span class="dg-combo-id">C{{ index + 1 }}</span>
              <code :title="`${row.column1} | ${row.column2} | ${row.column3}`">{{ row.column1 }}</code>
            </li>
          </ol>
        </div>
      </section>
    </div>

    <footer class="dg-footer">
      <p class="dg-msg" :class="canCalculate ? 'is-ok' : 'is-muted'">{{ calculateHint }}</p>
      <button type="button" class="fz-btn fz-btn-primary fz-btn-block fz-btn-lg dg-calculate" :disabled="!canCalculate || calculating" @click="onCalculate">
        <span v-if="calculating" class="dg-spinner" aria-hidden="true"></span>
        {{ calculating ? "Calculando…" : "Calcular zapatas" }}
      </button>
      <button v-if="hasResults" type="button" class="fz-btn fz-btn-block" @click="emit('open-results')">Ver resultados</button>
    </footer>

    <!-- Tabla de columnas -->
    <EtabsModal v-if="columnsModalOpen" title="Columnas y cargas" size="xl"
      :subtitle="`${activeRows.length} columna(s) · ${currentMode.label}. Fuerzas en tn y momentos en tn·m.`" @close="columnsModalOpen = false">
      <div class="fz-table-wrap dg-modal-table">
        <table class="fz-table">
          <thead>
            <tr class="fz-group">
              <th colspan="3">Columna</th>
              <th colspan="3">Carga muerta (PD)</th>
              <th colspan="3">Carga viva (PL)</th>
              <th colspan="3">Sismo (PS)</th>
              <th v-if="dataInputMode === 'manual'"></th>
            </tr>
            <tr>
              <th class="fz-left">ID</th><th>X (m)</th><th>Y (m)</th>
              <th>P</th><th>Mx</th><th>My</th>
              <th>P</th><th>Mx</th><th>My</th>
              <th>P</th><th>Mx</th><th>My</th>
              <th v-if="dataInputMode === 'manual'"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in activeRows" :key="row.id">
              <td class="fz-left"><input v-model="row.column" class="fz-input fz-cell dg-cell-id" aria-label="ID de columna" /></td>
              <td v-for="field in rowFields" :key="field">
                <input v-model.number="row[field]" type="number" :step="field === 'x' || field === 'y' ? 0.01 : 0.0001" class="fz-input fz-cell" :aria-label="`${field} de la columna ${row.column}`" />
              </td>
              <td v-if="dataInputMode === 'manual'">
                <button type="button" class="fz-btn fz-btn-ghost fz-btn-danger" :disabled="manualRows.length <= 1" @click="removeManualRow(row.id)">Quitar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <button v-if="dataInputMode === 'manual'" type="button" class="fz-btn" @click="addManualRow">+ Agregar columna</button>
        <button v-if="dataInputMode === 'manual'" type="button" class="fz-btn fz-btn-ghost fz-btn-danger" @click="clearManualRows">Vaciar tabla</button>
        <button v-if="dataInputMode === 'quick'" type="button" class="fz-btn fz-btn-ghost" @click="restoreQuickData">Restaurar ejemplo</button>
        <button type="button" class="fz-btn fz-btn-primary" @click="columnsModalOpen = false">Listo</button>
      </template>
    </EtabsModal>

    <!-- Combinaciones -->
    <EtabsModal v-if="combosModalOpen" title="Combinaciones de servicio" size="lg"
      subtitle="Variables: Pm, MXm, MYm (muerta) · Pv, MXv, MYv (viva) · PS, MXS, MYS (sismo)." @close="combosModalOpen = false">
      <div class="fz-table-wrap">
        <table class="fz-table">
          <thead>
            <tr><th class="fz-left">#</th><th class="fz-left">P</th><th class="fz-left">Mx</th><th class="fz-left">My</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in loadCombinations" :key="row.id">
              <td class="fz-left">C{{ index + 1 }}</td>
              <td class="fz-left"><input v-model="row.column1" class="fz-input dg-expr" :aria-label="`P de C${index + 1}`" /></td>
              <td class="fz-left"><input v-model="row.column2" class="fz-input dg-expr" :aria-label="`Mx de C${index + 1}`" /></td>
              <td class="fz-left"><input v-model="row.column3" class="fz-input dg-expr" :aria-label="`My de C${index + 1}`" /></td>
              <td><button type="button" class="fz-btn fz-btn-ghost fz-btn-danger" :disabled="loadCombinations.length <= 1" @click="removeCombination(row.id)">Quitar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <template #footer>
        <button type="button" class="fz-btn" @click="addCombination">+ Agregar</button>
        <button type="button" class="fz-btn fz-btn-ghost" @click="restoreCombinations">Restaurar por defecto</button>
        <button type="button" class="fz-btn fz-btn-primary" @click="combosModalOpen = false">Listo</button>
      </template>
    </EtabsModal>
  </div>
</template>

<script setup>
import { cloneDefaultSafecitoColumns } from "../../safecito/defaultSafecitoData.js";
import { computed, onMounted, ref, watch } from "vue";
import {
  useReaccionesExcel,
  DUPLICATE_REACTION_POLICIES,
} from "../composables/useReaccionesExcel.js";
import { DEFAULT_LOAD_COMBINATIONS } from "../../safecito/zapatas2Core.js";
import { describeFootings, EXAMPLE_FOOTING_SOURCE } from "../composables/exampleFootings.js";
import EtabsModal from "./EtabsModal.vue";

const props = defineProps({
  polygons: {
    type: Array,
    default: () => [],
  },
  activeFoundationTool: {
    type: String,
    default: "move",
  },
  // true mientras el overlay auxiliar recibe los clics del plano.
  toolActive: {
    type: Boolean,
    default: false,
  },
  calculating: {
    type: Boolean,
    default: false,
  },
  hasResults: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "import-excel",
  "joint-reactions",
  "calculate-zapatas",
  "columns-change",
  "set-foundation-tool",
  "clear-foundation-polygons",
  "fit-foundation-view",
  "capture-cad-polyline",
  "load-example",
  "open-results",
]);

const dataModes = [
  { id: "quick", label: "Ejemplo Safecito", description: "Proyecto de ejemplo listo para calcular: 14 columnas con cargas y una zapata aislada por columna." },
  { id: "excel", label: "ETABS / Excel", description: "Importa las reacciones y coordenadas exportadas desde ETABS." },
  { id: "manual", label: "Manual", description: "Escribe las coordenadas y cargas de cada columna." },
];
const comboSlots = ["Muerta (PD)", "Viva (PL)", "Sismo (PS)"];
const rowFields = ["x", "y", "pd1", "pd2", "pd3", "pl1", "pl2", "pl3", "sismo1", "sismo2", "sismo3"];
const foundationTools = [
  { id: "move", icon: "✥", label: "Mover", hint: "Arrastra para desplazar la vista; rueda para acercar" },
  { id: "draw", icon: "✎", label: "Dibujar", hint: "Clic en cada vértice; clic en el primero para cerrar; Esc cancela" },
  { id: "edit", icon: "◎", label: "Editar", hint: "Arrastra un vértice para moverlo" },
  { id: "erase", icon: "⌫", label: "Borrar", hint: "Clic sobre el borde de una zapata para eliminarla" },
];

const activeStep = ref("datos");
const columnsModalOpen = ref(false);
const combosModalOpen = ref(false);

const df = ref(2);
const gammaE = ref(1.8);

const dataInputMode = ref("quick"); // quick | excel | manual
const currentMode = computed(() => dataModes.find((mode) => mode.id === dataInputMode.value));

const manualRows = ref([
  {
    id: "manual-1",
    column: "1",
    x: 0,
    y: 0,
    pd1: 0,
    pd2: 0,
    pd3: 0,
    pl1: 0,
    pl2: 0,
    pl3: 0,
    sismo1: 0,
    sismo2: 0,
    sismo3: 0,
  },
]);

const quickRows = ref(cloneDefaultSafecitoColumns());

const reactionFile = ref(null);
const coordinateFile = ref(null);

const reactionFileName = computed(() => reactionFile.value?.name ?? "");
const coordinateFileName = computed(() => coordinateFile.value?.name ?? "");

const comboSelection = ref([]);
const comboSearch = ref("");
const activeComboFilter = ref("recommended");

const comboFilters = [
  { id: "recommended", label: "Sugeridos" },
  { id: "all", label: "Todos" },
  { id: "dead", label: "Muerta" },
  { id: "live", label: "Viva" },
  { id: "seismic", label: "Sismo" },
  { id: "combinations", label: "Combinaciones" },
  { id: "other", label: "Otros" },
];

const loadCombinations = ref(
  DEFAULT_LOAD_COMBINATIONS.map((row) => ({ ...row }))
);

const {
  reactionImportConfig,
  coordinateImportConfig,
  availableCombos,
  selectedCombos,
  datosGeneralesRows,
  duplicatePolicy,
  loading,
  error,
  status,
  validation,
  readyToCalculate,
  importReactionFile,
  importCoordinateFile,
  selectCombos,
  updateDatosGeneralesRows,
} = useReaccionesExcel();

const isValidNumber = (value) => value !== "" && value !== null && Number.isFinite(Number(value));

const setDataInputMode = (mode) => {
  if (dataInputMode.value === mode) return;
  dataInputMode.value = mode;
  if (mode === "quick") emit("load-example", false);
};

// Columnas que llegan desde el plano (Agente Predim): se editan como ingreso manual.
const importColumns = (rows) => {
  if (!Array.isArray(rows) || !rows.length) return;
  manualRows.value = rows.map((row) => ({...row}));
  dataInputMode.value = "manual";
  activeStep.value = "zapatas";
};
defineExpose({importColumns});

const restoreQuickData = () => {
  quickRows.value = cloneDefaultSafecitoColumns();
  emit("load-example", true);
};

const createManualRow = () => {
  const nextIndex = manualRows.value.length + 1;

  return {
    id: `manual-${Date.now()}-${nextIndex}`,
    column: String(nextIndex),
    x: 0,
    y: 0,
    pd1: 0,
    pd2: 0,
    pd3: 0,
    pl1: 0,
    pl2: 0,
    pl3: 0,
    sismo1: 0,
    sismo2: 0,
    sismo3: 0,
  };
};

const addManualRow = () => {
  manualRows.value.push(createManualRow());
};

const removeManualRow = (rowId) => {
  if (manualRows.value.length <= 1) return;
  manualRows.value = manualRows.value.filter((row) => row.id !== rowId);
};

const clearManualRows = () => {
  manualRows.value = [createManualRow()];
};

const addCombination = () => {
  const nextId = Math.max(0, ...loadCombinations.value.map((row) => Number(row.id) || 0)) + 1;
  loadCombinations.value.push({ id: nextId, column1: "Pm + Pv", column2: "MXm + MXv", column3: "MYm + MYv" });
};

const removeCombination = (rowId) => {
  if (loadCombinations.value.length <= 1) return;
  loadCombinations.value = loadCombinations.value.filter((row) => row.id !== rowId);
};

const restoreCombinations = () => {
  loadCombinations.value = DEFAULT_LOAD_COMBINATIONS.map((row) => ({ ...row }));
};

const activeRows = computed(() => {
  if (dataInputMode.value === "quick") {
    return quickRows.value;
  }

  if (dataInputMode.value === "manual") {
    return manualRows.value;
  }

  return datosGeneralesRows.value;
});

const rowsAreComplete = (rows) => rows.length > 0 && rows.every((row) => {
  return String(row.column ?? "").trim() && rowFields.every((field) => isValidNumber(row[field]));
});

const activeValidation = computed(() => {
  if (dataInputMode.value === "quick") {
    const ok = rowsAreComplete(quickRows.value);
    return {
      ok,
      message: ok ? "Datos de ejemplo completos." : "Revisa la tabla: hay valores vacíos o no numéricos.",
    };
  }

  if (dataInputMode.value === "manual") {
    const ok = rowsAreComplete(manualRows.value);
    return {
      ok,
      message: ok ? "Datos completos." : "Completa ID, X, Y y las cargas PD, PL y PS de cada columna.",
    };
  }

  if (!availableCombos.value.length) {
    return { ok: false, message: "Importa primero el Excel de reacciones." };
  }

  return validation.value;
});

const footings = computed(() => describeFootings(props.polygons, activeRows.value));

const uncoveredColumns = computed(() => {
  const covered = new Set(footings.value.flatMap((footing) => footing.columns));
  return activeRows.value.map((row) => String(row.column)).filter((column) => !covered.has(column));
});

const dataReady = computed(() => {
  const hasData = dataInputMode.value === "excel"
    ? comboSelection.value.length === 3 && readyToCalculate.value
    : activeValidation.value.ok;
  return hasData && isValidNumber(df.value) && isValidNumber(gammaE.value);
});
const footingsReady = computed(() => footings.value.length > 0 && footings.value.every((footing) => footing.columns.length > 0));
const combosReady = computed(() => loadCombinations.value.length > 0 && loadCombinations.value.every((row) => {
  return [row.column1, row.column2, row.column3].every((expression) => String(expression ?? "").trim());
}));

const steps = computed(() => [
  { id: "datos", label: "Datos", done: dataReady.value },
  { id: "zapatas", label: "Zapatas", done: footingsReady.value },
  { id: "combos", label: "Combinaciones", done: combosReady.value },
]);

const canCalculate = computed(() => dataReady.value && footingsReady.value && combosReady.value && !loading.value);

const calculateHint = computed(() => {
  if (!dataReady.value) {
    if (!isValidNumber(df.value) || !isValidNumber(gammaE.value)) return "Ingresa Df y γe.";
    return dataInputMode.value === "excel" ? "Completa la importación desde ETABS (pasos A, B y C)." : "Completa la tabla de columnas.";
  }
  if (!footings.value.length) return "Agrega al menos una zapata.";
  if (!footingsReady.value) return "Hay zapatas sin columnas dentro: corrígelas o bórralas.";
  if (!combosReady.value) return "Completa las combinaciones de servicio.";
  return `Listo: ${footings.value.length} zapata(s), ${activeRows.value.length} columna(s) y ${loadCombinations.value.length} combinaciones.`;
});

const sourceLabel = (source) => {
  if (source === EXAMPLE_FOOTING_SOURCE) return "Ejemplo";
  if (source === "plano") return "Plano";
  if (String(source || "").startsWith("cad")) return "CAD";
  return "Dibujo";
};

const onReactionFileChange = (event) => {
  reactionFile.value = event.target.files?.[0] ?? null;
};

const onCoordinateFileChange = (event) => {
  coordinateFile.value = event.target.files?.[0] ?? null;
};

const onImportReactions = async () => {
  if (!reactionFile.value) return;

  comboSelection.value = [];

  emit("import-excel", reactionFile.value);
  emit("joint-reactions");

  try {
    const result = await importReactionFile(reactionFile.value);

    console.log("✅ Joint Reactions importado:", {
      archivo: reactionFile.value?.name,
      hoja: result.worksheetName,
      totalFilas: result.totalRows,
      totalCombos: result.combos.length,
    });

    window.jhackCimentacionDebug = {
      reactionFile: reactionFile.value?.name,
      reactionRows: result.rows,
      combos: result.combos,
    };

    if (getRecommendedCombos().length === 3) onAutoSelectRecommendedCombos();
  } catch (importError) {
    console.error("No se pudo importar Joint Reactions:", importError);
  }
};

const isComboChecked = (combo) => {
  return comboSelection.value.includes(combo);
};

const normalizeComboName = (combo) => {
  return String(combo || "").trim().toUpperCase();
};

const getComboCategory = (combo) => {
  const name = normalizeComboName(combo);

  if (name === "CM" || name.includes("MUERTA") || name.includes("DEAD")) {
    return "dead";
  }

  if (
    name === "CV" ||
    name === "CVE" ||
    name === "CVT" ||
    name.includes("VIVA") ||
    name.includes("LIVE")
  ) {
    return "live";
  }

  if (
    name.includes("SEX") ||
    name.includes("SEY") ||
    name.includes("SDX") ||
    name.includes("SDY") ||
    name.includes("SISAD") ||
    name.includes("SISMO") ||
    name.includes("QUAKE") ||
    name.includes("EQ")
  ) {
    return "seismic";
  }

  if (
    name.includes("+") ||
    name.includes("-") ||
    name.includes("ENVOLVENTE") ||
    name.includes("ENV") ||
    name.includes("COMB") ||
    name.includes("1.25") ||
    name.includes("0.9") ||
    name.includes("1.4")
  ) {
    return "combinations";
  }

  return "other";
};

const getComboCategoryLabel = (combo) => {
  const category = getComboCategory(combo);

  if (category === "dead") return "Muerta";
  if (category === "live") return "Viva";
  if (category === "seismic") return "Sismo";
  if (category === "combinations") return "Combo";
  return "Otro";
};

const isRecommendedCombo = (combo) => {
  const name = normalizeComboName(combo);

  return ["CM", "CV", "CVE", "CVT", "SISAD", "SEX", "SEY", "SDX", "SDY"].includes(name);
};

const getRecommendedCombos = () => {
  const combos = availableCombos.value || [];
  const comboByName = new Map(
    combos.map((combo) => [normalizeComboName(combo), combo])
  );

  const findByPriority = (priorityNames) => {
    for (const name of priorityNames) {
      if (comboByName.has(name)) {
        return comboByName.get(name);
      }
    }

    return null;
  };

  const pd = findByPriority(["CM"]);
  const pl = findByPriority(["CV", "CVE", "CVT"]);
  const sismo = findByPriority(["SISAD", "SDX ESCALADO", "SDY ESCALADO", "SDX", "SDY", "SEX", "SEY"]);

  return [pd, pl, sismo].filter(Boolean);
};

const filteredCombos = computed(() => {
  const search = normalizeComboName(comboSearch.value);

  return availableCombos.value.filter((combo) => {
    const name = normalizeComboName(combo);
    const category = getComboCategory(combo);

    const matchesSearch = !search || name.includes(search);

    let matchesFilter = true;

    if (activeComboFilter.value === "recommended") {
      matchesFilter = isRecommendedCombo(combo);
    } else if (activeComboFilter.value !== "all") {
      matchesFilter = category === activeComboFilter.value;
    }

    return matchesSearch && matchesFilter;
  });
});

const comboFilterCounts = computed(() => {
  const combos = availableCombos.value || [];

  return comboFilters.reduce((acc, filter) => {
    if (filter.id === "all") {
      acc[filter.id] = combos.length;
    } else if (filter.id === "recommended") {
      acc[filter.id] = combos.filter(isRecommendedCombo).length;
    } else {
      acc[filter.id] = combos.filter((combo) => getComboCategory(combo) === filter.id).length;
    }

    return acc;
  }, {});
});

const setComboSelection = (combos) => {
  comboSelection.value = combos.slice(0, 3);
  selectedCombos.value = [...comboSelection.value];

  if (comboSelection.value.length === 3) {
    try {
      selectCombos([...comboSelection.value]);
    } catch (selectionError) {
      console.error("No se pudieron seleccionar combos:", selectionError);
    }
  } else {
    updateDatosGeneralesRows([]);
  }
};

const onAutoSelectRecommendedCombos = () => {
  const recommended = getRecommendedCombos();

  if (recommended.length < 3) {
    console.warn("No se encontraron 3 combos recomendados completos:", recommended);
    return;
  }

  setComboSelection(recommended);
};

const clearComboSelection = () => {
  setComboSelection([]);
};

const onToggleCombo = (combo, checked) => {
  let nextSelection = [...comboSelection.value];

  if (checked) {
    if (nextSelection.length >= 3) return;
    nextSelection.push(combo);
  } else {
    nextSelection = nextSelection.filter((item) => item !== combo);
  }

  setComboSelection(nextSelection);
};

const onImportCoordinates = async () => {
  if (!coordinateFile.value) return;

  try {
    await importCoordinateFile(coordinateFile.value);
  } catch (importError) {
    console.error("No se pudo importar Point Object Connectivity:", importError);
  }
};

const onCalculate = () => {
  if (!canCalculate.value || props.calculating) return;

  emit("calculate-zapatas", {
    df: df.value,
    gammaE: gammaE.value,
    columns: activeRows.value,
    selectedCombos:
      dataInputMode.value === "quick"
        ? ["PD Safecito", "PL Safecito", "SISMO Safecito"]
        : dataInputMode.value === "manual"
          ? ["PD Manual", "PL Manual", "SISMO Manual"]
          : comboSelection.value,
    loadCombinations: loadCombinations.value,
    dataInputMode: dataInputMode.value,
  });
};

watch(
  activeRows,
  (rows) => {
    emit("columns-change", Array.isArray(rows) ? rows : []);
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  if (dataInputMode.value === "quick") emit("load-example", false);
});
</script>

<style scoped>
.dg-panel { display:flex;flex-direction:column;min-height:0;flex:1; }
.dg-steps { display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:8px 12px;border-bottom:1px solid var(--pr-line); }
.dg-step { display:flex;align-items:center;justify-content:center;gap:7px;min-height:34px;padding:4px 6px;border:0;border-radius:7px;background:transparent;color:var(--pr-muted);font-weight:600;font-size:12.5px;line-height:1.2;font-family:inherit;cursor:pointer; }
.dg-step:hover { color:var(--pr-text);background:rgba(128,181,255,.06); }
.dg-step[aria-selected=true] { color:var(--pr-text);background:rgba(128,181,255,.12);box-shadow:inset 0 -2px 0 var(--pr-blue); }
.dg-step-dot { display:grid;place-items:center;width:20px;height:20px;border:1px solid var(--pr-line);border-radius:50%;font-size:11px; }
.dg-step-dot.is-done { border-color:transparent;background:#1f7a4a;color:#fff; }

.dg-body { flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:14px; }
.dg-pane { display:grid;gap:16px; }
.dg-block { display:grid;gap:9px; }
.dg-h { margin:0;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--pr-muted); }
.dg-grid-2 { grid-template-columns:1fr 1fr;gap:10px; }
.dg-row { display:flex;flex-wrap:wrap;gap:6px; }

.dg-import { padding:12px;border:1px solid var(--pr-line);border-radius:10px; }
.dg-import-head { display:flex;gap:10px;align-items:flex-start; }
.dg-import-head p { margin-top:2px; }
.dg-import-num { display:grid;place-items:center;flex-shrink:0;width:24px;height:24px;border-radius:6px;background:var(--pr-soft);color:var(--pr-blue);font-size:12px;font-weight:700; }
.dg-import-num.is-done { background:#1f7a4a;color:#fff; }
.dg-file-row { display:flex;align-items:center;gap:8px; }
.dg-file { flex-shrink:0; }
.dg-file-name { flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--pr-muted); }
.dg-hidden { display:none; }
.dg-details summary { cursor:pointer;font-size:12px;color:var(--pr-blue); }
.dg-config-grid { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px; }

.dg-slots { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px; }
.dg-slot { padding:7px 8px;border:1px dashed var(--pr-line);border-radius:8px;min-width:0; }
.dg-slot span { display:block;font-size:10.5px;color:var(--pr-muted); }
.dg-slot strong { display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px; }
.dg-slot.is-filled { border-style:solid;border-color:#2f5ea8;background:rgba(47,111,222,.1); }
.dg-chips { display:flex;flex-wrap:wrap;gap:5px; }
.dg-chip { padding:4px 9px;border:1px solid var(--pr-line);border-radius:999px;background:transparent;color:var(--pr-muted);font-weight:600;font-size:11.5px;font-family:inherit;cursor:pointer; }
.dg-chip span { opacity:.7; }
.dg-chip[aria-pressed=true] { border-color:var(--pr-blue);color:var(--pr-text);background:rgba(128,181,255,.12); }
.dg-combos-list { display:grid;gap:4px;max-height:200px;overflow:auto;padding-right:2px; }
.dg-combo-item { display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--pr-line);border-radius:7px;cursor:pointer; }
.dg-combo-item.is-active { border-color:#2f5ea8;background:rgba(47,111,222,.12); }
.dg-combo-name { flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis; }
.dg-combo-badge { padding:2px 7px;border-radius:999px;font-size:10px;font-weight:700; }
.dg-combo-badge.is-dead { background:var(--pr-soft);color:var(--fz-warn); }
.dg-combo-badge.is-live { background:var(--pr-soft);color:var(--fz-ok); }
.dg-combo-badge.is-seismic { background:var(--pr-soft);color:var(--fz-danger); }
.dg-combo-badge.is-combinations { background:var(--pr-soft);color:var(--pr-blue); }
.dg-combo-badge.is-other { background:var(--pr-soft);color:var(--pr-text); }

.dg-msg { margin:0;font-size:12px;color:var(--pr-muted); }
.dg-msg.is-ok { color:var(--fz-ok); }
.dg-msg.is-warn { color:var(--fz-warn); }
.dg-msg.is-error { color:var(--fz-danger); }
.dg-summary { display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px; }
.dg-summary p { margin-top:2px; }

.dg-tools { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px; }
.dg-tool { display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 4px;border:1px solid var(--pr-line);border-radius:8px;background:var(--pr-soft);color:var(--pr-text);font-weight:600;font-size:11.5px;font-family:inherit;cursor:pointer; }
.dg-tool span { font-size:16px;line-height:1; }
.dg-tool:hover { border-color:var(--pr-blue); }
.dg-tool[aria-pressed=true] { border-color:var(--pr-blue);background:rgba(47,111,222,.25); }

.dg-list-head { display:flex;align-items:center;justify-content:space-between;gap:8px; }
.dg-footings { display:grid;gap:4px;max-height:260px;overflow:auto;margin:0;padding:0;list-style:none; }
.dg-footings li { display:grid;grid-template-columns:auto auto 1fr auto;align-items:center;gap:10px;padding:7px 9px;border:1px solid var(--pr-line);border-radius:8px;font-size:12px; }
.dg-footings li span { color:var(--pr-muted);font-variant-numeric:tabular-nums; }
.dg-footings li.is-empty { border-color:#7a5a12; }
.dg-footing-cols { overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.dg-empty { padding:16px;border:1px dashed var(--pr-line);border-radius:10px;text-align:center; }
.dg-empty p { margin:0 0 4px; }

.dg-combo-preview { display:grid;gap:3px;margin:0;padding:0;list-style:none; }
.dg-combo-preview li { display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;background:var(--pr-soft); }
.dg-combo-preview code { overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:12px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--pr-text); }
.dg-combo-id { flex-shrink:0;width:28px;font-size:11px;font-weight:700;color:var(--pr-muted); }

.dg-footer { display:grid;gap:8px;padding:12px 14px;border-top:1px solid var(--pr-line);background:var(--pr-soft); }
.dg-msg.is-muted { color:var(--pr-muted); }
.dg-spinner { width:14px;height:14px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:dg-spin .8s linear infinite; }
@keyframes dg-spin { to { transform:rotate(360deg); } }

.dg-modal-table { max-height:60vh; }
.dg-cell-id { width:64px;text-align:center; }
.dg-expr { min-width:220px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px; }
@media(max-width:760px) {
  .dg-grid-2,.dg-config-grid { grid-template-columns:1fr 1fr; }
  .dg-step { font-size:11.5px;gap:5px; }
}
</style>
