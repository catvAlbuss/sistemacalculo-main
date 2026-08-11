<template>
  <div class="dg-panel">
    <div class="dg-header">
      <h2 class="dg-title">Datos Generales - Cimentaciones</h2>
      <p class="dg-subtitle">
        Integra las zapatas con el cálculo existente de Safecito usando el CAD de ETABS2.
      </p>
    </div>

    <section class="dg-section">
      <div class="dg-section-title">1. Fuente de datos</div>

      <p class="dg-help">
        El modo rápido usa los datos base que trae Safecito por defecto.
        El Excel no es obligatorio, pero siempre deben existir columnas, cargas y polígonos.
      </p>

      <div class="dg-mode-switch">
        <button class="dg-btn dg-btn-dark" :class="{ 'dg-tool-active': dataInputMode === 'quick' }"
          @click="dataInputMode = 'quick'">
          Modo rápido Safecito
        </button>

        <button class="dg-btn dg-btn-dark" :class="{ 'dg-tool-active': dataInputMode === 'excel' }"
          @click="dataInputMode = 'excel'">
          Importar desde ETABS / Excel
        </button>

        <button class="dg-btn dg-btn-dark" :class="{ 'dg-tool-active': dataInputMode === 'manual' }"
          @click="dataInputMode = 'manual'">
          Ingreso manual
        </button>
      </div>
    </section>

    <!-- 1. Parámetros generales -->

    <!-- 2. Excel de reacciones -->
    <section v-if="dataInputMode === 'excel'" class="dg-section">
      <div class="dg-section-title">2. Excel de reacciones</div>

      <div class="dg-excel-row">
        <label class="dg-file-btn">
          Seleccionar Joint Reactions
          <input type="file" accept=".xlsx,.xlsm,.xls" class="dg-hidden" @change="onReactionFileChange" />
        </label>

        <span class="dg-file-name" :title="reactionFileName">
          {{ reactionFileName || "Ningún archivo seleccionado" }}
        </span>

        <button class="dg-btn dg-btn-blue" :disabled="!reactionFile || loading" @click="onImportReactions">
          Importar
        </button>
      </div>

      <details class="dg-details">
        <summary>Configurar columnas de reacciones</summary>

        <div class="dg-config-grid">
          <label>
            Hoja
            <input v-model="reactionImportConfig.sheetName" class="dg-input" />
          </label>

          <label>
            Fila inicio
            <input v-model.number="reactionImportConfig.startRow" type="number" class="dg-input" />
          </label>

          <label>
            Punto
            <input v-model="reactionImportConfig.pointColumn" class="dg-input" />
          </label>

          <label>
            Combo
            <input v-model="reactionImportConfig.comboColumn" class="dg-input" />
          </label>

          <label>
            F2
            <input v-model="reactionImportConfig.f2Column" class="dg-input" />
          </label>

          <label>
            MX
            <input v-model="reactionImportConfig.mxColumn" class="dg-input" />
          </label>

          <label>
            MY
            <input v-model="reactionImportConfig.myColumn" class="dg-input" />
          </label>
        </div>
      </details>

      <p v-if="status" class="dg-msg">{{ status }}</p>
      <p v-if="error" class="dg-msg dg-msg-error">{{ error }}</p>
    </section>

    <!-- 3. Selección de combinaciones -->
    <section v-if="dataInputMode === 'excel' && availableCombos.length" class="dg-section">
      <div class="dg-section-title">3. Seleccionar 3 combinaciones</div>

      <p class="dg-help">
        Selecciona exactamente 3 combinaciones. El orden será:
        <b>1 = PD</b>, <b>2 = PL</b>, <b>3 = SISMO</b>.
      </p>

      <div class="dg-selected-combos">
        <label class="dg-duplicate-policy">
          Regla para combos con Max/Min:
          <select v-model="duplicatePolicy" class="dg-input">
            <option v-for="policy in DUPLICATE_REACTION_POLICIES" :key="policy.id" :value="policy.id">
              {{ policy.label }}
            </option>
          </select>
        </label>
        <span class="dg-tag">PD: {{ comboSelection[0] || "pendiente" }}</span>
        <span class="dg-tag">PL: {{ comboSelection[1] || "pendiente" }}</span>
        <span class="dg-tag">SISMO: {{ comboSelection[2] || "pendiente" }}</span>
      </div>

      <div class="dg-combo-actions">
        <button class="dg-btn dg-btn-green" @click="onAutoSelectRecommendedCombos">
          Autoseleccionar recomendado
        </button>

        <button class="dg-btn dg-btn-dark" @click="clearComboSelection">
          Limpiar selección
        </button>
      </div>

      <input v-model="comboSearch" class="dg-input dg-combo-search"
        placeholder="Buscar combo, por ejemplo: CM, CV, SISAD, SDX..." />

      <div class="dg-filter-tabs">
        <button v-for="filter in comboFilters" :key="filter.id" class="dg-filter-tab"
          :class="{ 'dg-filter-tab-active': activeComboFilter === filter.id }" @click="activeComboFilter = filter.id">
          {{ filter.label }}
          <span>{{ comboFilterCounts[filter.id] || 0 }}</span>
        </button>
      </div>

      <div class="dg-combos-list">
        <label v-for="combo in filteredCombos" :key="combo" class="dg-combo-item"
          :class="{ 'dg-combo-item-active': isComboChecked(combo) }">
          <input type="checkbox" :checked="isComboChecked(combo)"
            :disabled="!isComboChecked(combo) && comboSelection.length >= 3"
            @change="onToggleCombo(combo, $event.target.checked)" />

          <span class="dg-combo-name">{{ combo }}</span>

          <span class="dg-combo-badge" :class="`dg-combo-badge-${getComboCategory(combo)}`">
            {{ getComboCategoryLabel(combo) }}
          </span>
        </label>

        <p v-if="filteredCombos.length === 0" class="dg-msg dg-msg-error">
          No hay combos que coincidan con el filtro actual.
        </p>
      </div>
    </section>

    <!-- 4. Excel de coordenadas -->
    <section v-if="dataInputMode === 'excel' && comboSelection.length === 3" class="dg-section">
      <div class="dg-section-title">4. Excel de coordenadas</div>

      <div class="dg-excel-row">
        <label class="dg-file-btn">
          Seleccionar Point Object Connectivity
          <input type="file" accept=".xlsx,.xlsm,.xls" class="dg-hidden" @change="onCoordinateFileChange" />
        </label>

        <span class="dg-file-name" :title="coordinateFileName">
          {{ coordinateFileName || "Ningún archivo seleccionado" }}
        </span>

        <button class="dg-btn dg-btn-blue" :disabled="!coordinateFile || loading" @click="onImportCoordinates">
          Importar
        </button>
      </div>

      <details class="dg-details">
        <summary>Configurar columnas de coordenadas</summary>

        <div class="dg-config-grid">
          <label>
            Hoja
            <input v-model="coordinateImportConfig.sheetName" class="dg-input" />
          </label>

          <label>
            Fila inicio
            <input v-model.number="coordinateImportConfig.startRow" type="number" class="dg-input" />
          </label>

          <label>
            Punto
            <input v-model="coordinateImportConfig.pointColumn" class="dg-input" />
          </label>

          <label>
            X
            <input v-model="coordinateImportConfig.xColumn" class="dg-input" />
          </label>

          <label>
            Y
            <input v-model="coordinateImportConfig.yColumn" class="dg-input" />
          </label>
        </div>
      </details>
    </section>

    <section v-if="dataInputMode === 'manual'" class="dg-section">
      <div class="dg-section-title">2. Ingreso manual de columnas</div>

      <p class="dg-help">
        Ingresa las coordenadas y cargas base de cada columna. Estos datos reemplazan al Excel.
      </p>

      <div class="dg-combo-actions">
        <button class="dg-btn dg-btn-green" @click="addManualRow">
          Agregar columna
        </button>

        <button class="dg-btn dg-btn-dark" @click="clearManualRows">
          Limpiar manual
        </button>
      </div>
    </section>

    <section v-if="dataInputMode === 'quick'" class="dg-section">
      <div class="dg-section-title">2. Datos rápidos Safecito</div>

      <p class="dg-help">
        Estos son los datos por defecto del módulo original. Puedes editarlos antes de calcular.
      </p>

      <button class="dg-btn dg-btn-blue" @click="quickRows = cloneDefaultSafecitoColumns()">
        Restaurar datos Safecito
      </button>
    </section>

    <!-- 5. Tabla de columnas -->
    <section v-if="activeRows.length" class="dg-section">
      <div class="dg-section-title">5. Columnas importadas</div>

      <p class="dg-msg" :class="{ 'dg-msg-error': !activeValidation.ok, 'dg-msg-ok': activeValidation.ok }">
        {{ activeValidation.message }}
      </p>

      <div class="dg-table-wrap dg-table-wrap-large">
        <table class="dg-table">
          <thead>
            <tr>
              <th>Col.</th>
              <th>X</th>
              <th>Y</th>
              <th>PD F2</th>
              <th>PD MX</th>
              <th>PD MY</th>
              <th>PL F2</th>
              <th>PL MX</th>
              <th>PL MY</th>
              <th>SIS F2</th>
              <th>SIS MX</th>
              <th>SIS MY</th>
              <th v-if="dataInputMode === 'manual'">Acción</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in activeRows" :key="row.id">
              <td>
                <input v-model="row.column" class="dg-cell-input dg-cell-id" />
              </td>
              <td>
                <input v-model.number="row.x" type="number" step="0.001" class="dg-cell-input" />
              </td>
              <td>
                <input v-model.number="row.y" type="number" step="0.001" class="dg-cell-input" />
              </td>
              <td>
                <input v-model.number="row.pd1" type="number" step="0.0001" class="dg-cell-input" />
              </td>
              <td>
                <input v-model.number="row.pd2" type="number" step="0.0001" class="dg-cell-input" />
              </td>
              <td>
                <input v-model.number="row.pd3" type="number" step="0.0001" class="dg-cell-input" />
              </td>
              <td>
                <input v-model.number="row.pl1" type="number" step="0.0001" class="dg-cell-input" />
              </td>
              <td>
                <input v-model.number="row.pl2" type="number" step="0.0001" class="dg-cell-input" />
              </td>
              <td>
                <input v-model.number="row.pl3" type="number" step="0.0001" class="dg-cell-input" />
              </td>
              <td>
                <input v-model.number="row.sismo1" type="number" step="0.0001" class="dg-cell-input" />
              </td>
              <td>
                <input v-model.number="row.sismo2" type="number" step="0.0001" class="dg-cell-input" />
              </td>
              <td>
                <input v-model.number="row.sismo3" type="number" step="0.0001" class="dg-cell-input" />
              </td>
              <td v-if="dataInputMode === 'manual'">
                <button class="dg-btn dg-btn-dark" @click="removeManualRow(row.id)">
                  Quitar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="dg-section">
      <div class="dg-section-title">Herramientas de cimentación</div>

      <p class="dg-help">
        Usa una polilínea cerrada dibujada directamente en el visor CAD como zapata.
        Esta es la opción recomendada cuando trabajas con un DWG importado.
      </p>

      <div class="dg-foundation-tools">
        <button class="dg-btn dg-btn-primary" @click="emit('capture-cad-polyline')">
          📐 Capturar Polyline CAD
        </button>

        <button class="dg-btn dg-btn-green" @click="emit('clear-foundation-polygons')">
          Limpiar zapatas
        </button>
      </div>

      <details class="dg-details dg-foundation-fallback">
        <summary>Herramientas auxiliares del overlay</summary>

        <p class="dg-help">
          Úsalas solo como respaldo cuando no trabajes con una Polyline del visor CAD.
        </p>

        <div class="dg-foundation-tools">
          <button class="dg-btn dg-btn-dark" :class="{ 'dg-tool-active': activeFoundationTool === 'move' }"
            @click="emit('set-foundation-tool', 'move')">
            ✥ Mover
          </button>

          <button class="dg-btn dg-btn-dark" :class="{ 'dg-tool-active': activeFoundationTool === 'draw' }"
            @click="emit('set-foundation-tool', 'draw')">
            ✏️ Dibujar overlay
          </button>

          <button class="dg-btn dg-btn-dark" :class="{ 'dg-tool-active': activeFoundationTool === 'edit' }"
            @click="emit('set-foundation-tool', 'edit')">
            🎯 Editar punto
          </button>

          <button class="dg-btn dg-btn-dark" :class="{ 'dg-tool-active': activeFoundationTool === 'erase' }"
            @click="emit('set-foundation-tool', 'erase')">
            🧹 Borrar overlay
          </button>

          <button class="dg-btn dg-btn-blue" @click="emit('fit-foundation-view')">
            Centrar columnas overlay
          </button>
        </div>
      </details>
    </section>

    <!-- 6. Polígonos de zapatas -->
    <section class="dg-section">
      <div class="dg-section-title">6. Polígonos de zapatas</div>

      <p class="dg-help">
        Los polígonos pueden venir de una Polyline cerrada del visor CAD o del overlay auxiliar.
      </p>

      <p class="dg-msg" :class="{ 'dg-msg-ok': polygonsCount > 0, 'dg-msg-error': polygonsCount === 0 }">
        {{
          polygonsCount > 0
            ? `${polygonsCount} polígono(s) listo(s) para calcular.`
            : "Aún no hay polígonos capturados. Dibuja una Polyline cerrada en el CAD y presiona Capturar Polyline CAD."
        }}
      </p>
    </section>

    <!-- 7. Combinaciones Co -->
    <section class="dg-section">
      <div class="dg-section-title">7. Combinaciones de carga Co</div>

      <p class="dg-help">
        Estas expresiones se enviarán al cálculo original de Safecito.
      </p>

      <div class="dg-table-wrap dg-table-wrap-large">
        <table class="dg-table">
          <thead>
            <tr>
              <th>#</th>
              <th>P</th>
              <th>MX</th>
              <th>MY</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in loadCombinations" :key="row.id">
              <td>{{ row.id }}</td>
              <td>
                <input v-model="row.column1" class="dg-expression-input" />
              </td>
              <td>
                <input v-model="row.column2" class="dg-expression-input" />
              </td>
              <td>
                <input v-model="row.column3" class="dg-expression-input" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 8. Acción final -->
    <section class="dg-section dg-actions">
      <button class="dg-btn dg-btn-primary" :disabled="!canCalculate" @click="onCalculate">
        Calcular zapatas
      </button>

      <p class="dg-help">
        Para calcular se requiere: 3 combos, coordenadas completas, polígonos cerrados y parámetros válidos.
      </p>
    </section>
  </div>
</template>

<script setup>
import { cloneDefaultSafecitoColumns } from "../../safecito/defaultSafecitoData.js";
import { computed, ref, watch } from "vue";
import {
  useReaccionesExcel,
  DUPLICATE_REACTION_POLICIES,
} from "../composables/useReaccionesExcel.js";
import { DEFAULT_LOAD_COMBINATIONS } from "../../safecito/zapatas2Core.js";

const props = defineProps({
  polygonsCount: {
    type: Number,
    default: 0,
  },
  activeFoundationTool: {
    type: String,
    default: "move",
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
]);

const df = ref(2);
const gammaE = ref(1.8);

const dataInputMode = ref("quick"); // quick | excel | manual

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
  { id: "recommended", label: "Recomendados" },
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

const formatCoord = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(3) : "";
};

const isValidNumber = (value) => Number.isFinite(Number(value));

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

const activeRows = computed(() => {
  if (dataInputMode.value === "quick") {
    return quickRows.value;
  }

  if (dataInputMode.value === "manual") {
    return manualRows.value;
  }

  return datosGeneralesRows.value;
});

const hasValidManualRows = computed(() => {
  if (dataInputMode.value !== "manual") return true;

  return manualRows.value.length > 0 && manualRows.value.every((row) => {
    return (
      String(row.column || "").trim() &&
      isValidNumber(row.x) &&
      isValidNumber(row.y) &&
      isValidNumber(row.pd1) &&
      isValidNumber(row.pd2) &&
      isValidNumber(row.pd3) &&
      isValidNumber(row.pl1) &&
      isValidNumber(row.pl2) &&
      isValidNumber(row.pl3) &&
      isValidNumber(row.sismo1) &&
      isValidNumber(row.sismo2) &&
      isValidNumber(row.sismo3)
    );
  });
});

const hasValidQuickRows = computed(() => {
  if (dataInputMode.value !== "quick") return true;

  return quickRows.value.length > 0 && quickRows.value.every((row) => {
    return (
      String(row.column || "").trim() &&
      isValidNumber(row.x) &&
      isValidNumber(row.y) &&
      isValidNumber(row.pd1) &&
      isValidNumber(row.pd2) &&
      isValidNumber(row.pd3) &&
      isValidNumber(row.pl1) &&
      isValidNumber(row.pl2) &&
      isValidNumber(row.pl3) &&
      isValidNumber(row.sismo1) &&
      isValidNumber(row.sismo2) &&
      isValidNumber(row.sismo3)
    );
  });
});

const activeValidation = computed(() => {
  if (dataInputMode.value === "quick") {
    return {
      ok: hasValidQuickRows.value,
      message: hasValidQuickRows.value
        ? `${quickRows.value.length} columna(s) de ejemplo Safecito lista(s) para calcular.`
        : "Revisa los datos rápidos de Safecito.",
    };
  }

  if (dataInputMode.value === "manual") {
    return {
      ok: hasValidManualRows.value,
      message: hasValidManualRows.value
        ? `${manualRows.value.length} columna(s) manual(es) lista(s) para calcular.`
        : "Completa columna, X, Y, PD, PL y SISMO para todas las filas manuales.",
    };
  }

  return validation.value;
});

const canCalculate = computed(() => {
  const hasData =
    dataInputMode.value === "quick"
      ? hasValidQuickRows.value
      : dataInputMode.value === "manual"
        ? hasValidManualRows.value
        : comboSelection.value.length === 3 && readyToCalculate.value;

  return (
    isValidNumber(df.value) &&
    isValidNumber(gammaE.value) &&
    hasData &&
    props.polygonsCount > 0 &&
    loadCombinations.value.length > 0 &&
    !loading.value
  );
});

const onReactionFileChange = (event) => {
  reactionFile.value = event.target.files?.[0] ?? null;
};

const onCoordinateFileChange = (event) => {
  coordinateFile.value = event.target.files?.[0] ?? null;
};

const classifyCombo = (comboName) => {
  const name = String(comboName || "").toUpperCase();

  if (name === "CM" || name.includes("MUERTA") || name.includes("DEAD")) {
    return "Carga muerta / PD";
  }

  if (
    name === "CV" ||
    name === "CVE" ||
    name === "CVT" ||
    name.includes("VIVA") ||
    name.includes("LIVE")
  ) {
    return "Carga viva / PL";
  }

  if (
    name.includes("SX") ||
    name.includes("SY") ||
    name.includes("SDX") ||
    name.includes("SDY") ||
    name.includes("SEX") ||
    name.includes("SEY") ||
    name.includes("SIS") ||
    name.includes("SISMO") ||
    name.includes("QUAKE") ||
    name.includes("EQ")
  ) {
    return "Sismo / SISMO";
  }

  if (
    name.includes("COMB") ||
    name.includes("+") ||
    name.includes("-") ||
    name.includes("ENV") ||
    name.includes("MAX") ||
    name.includes("MIN")
  ) {
    return "Combinación / revisar";
  }

  return "Otro / revisar";
};

const buildComboStats = (rows, combos) => {
  return combos.map((combo) => {
    const comboRows = rows.filter((row) => row.combo === combo);
    const uniquePoints = new Set(comboRows.map((row) => row.column));

    return {
      combo,
      tipoSugerido: classifyCombo(combo),
      filas: comboRows.length,
      puntosUnicos: uniquePoints.size,
      primerPunto: comboRows[0]?.column ?? "-",
      primerF2: comboRows[0]?.f2 ?? "-",
      primerMX: comboRows[0]?.mx ?? "-",
      primerMY: comboRows[0]?.my ?? "-",
    };
  });
};

const onImportReactions = async () => {
  if (!reactionFile.value) return;

  comboSelection.value = [];

  emit("import-excel", reactionFile.value);
  emit("joint-reactions");

  try {
    const result = await importReactionFile(reactionFile.value);
    const comboStats = buildComboStats(result.rows, result.combos);

    console.log("✅ Joint Reactions importado:", {
      archivo: reactionFile.value?.name,
      hoja: result.worksheetName,
      totalFilas: result.totalRows,
      totalCombos: result.combos.length,
    });

    console.log("📋 Lista completa de combos encontrados:");
    console.table(comboStats);

    console.log("📦 Combos en orden original del Excel:", result.combos);

    console.log("🔎 Primeras 10 filas leídas del Excel:");
    console.table(result.rows.slice(0, 10));

    window.jhackCimentacionDebug = {
      reactionFile: reactionFile.value?.name,
      reactionRows: result.rows,
      combos: result.combos,
      comboStats,
    };

    console.log(
      "🧪 Debug disponible en consola: escribe jhackCimentacionDebug para revisar combos y filas."
    );
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

  console.log("✅ Combos recomendados seleccionados:", {
    PD: recommended[0],
    PL: recommended[1],
    SISMO: recommended[2],
  });
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
  if (!canCalculate.value) return;

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

</script>

<style scoped>
.dg-panel {
  width: 640px;
  max-width: 92vw;
  max-height: 75vh;
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.97);
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

.dg-section {
  border-top: 1px solid #334155;
  padding-top: 10px;
  margin-top: 10px;
}

.dg-section:first-of-type {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.dg-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #bfdbfe;
  margin-bottom: 8px;
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
  min-width: 120px;
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
  font-size: 12px;
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

.dg-hidden {
  display: none;
}

.dg-btn {
  cursor: pointer;
  border: none;
  border-radius: 6px;
  color: #fff;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.dg-btn:disabled {
  opacity: 0.45;
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

.dg-btn-primary {
  background: #7c3aed;
  padding: 8px 14px;
}

.dg-btn-primary:hover:not(:disabled) {
  background: #6d28d9;
}

.dg-details {
  margin-top: 8px;
  background: #111827;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 8px;
}

.dg-details summary {
  cursor: pointer;
  color: #93c5fd;
  font-size: 12px;
  font-weight: 600;
}

.dg-config-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(80px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.dg-config-grid label {
  color: #94a3b8;
  font-size: 11px;
}

.dg-msg {
  margin: 7px 0 0;
  font-size: 11px;
  color: #cbd5e1;
}

.dg-msg-error {
  color: #fca5a5;
}

.dg-msg-ok {
  color: #86efac;
}

.dg-help {
  margin: 0 0 8px;
  font-size: 11px;
  color: #94a3b8;
}

.dg-selected-combos {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.dg-tag {
  background: #1e293b;
  border: 1px solid #475569;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  color: #dbeafe;
}

.dg-combos-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  max-height: 190px;
  overflow-y: auto;
  padding-right: 4px;
}

.dg-combo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #e2e8f0;
}

.dg-combo-item-active {
  border-color: #60a5fa;
  background: #172554;
}

.dg-table-wrap {
  margin-top: 8px;
  max-height: 180px;
  overflow: auto;
  border: 1px solid #334155;
  border-radius: 6px;
}

.dg-table-wrap-large {
  max-height: 260px;
}

.dg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.dg-table th,
.dg-table td {
  padding: 4px 6px;
  text-align: right;
  border-bottom: 1px solid #1e293b;
  white-space: nowrap;
}

.dg-table thead th {
  position: sticky;
  top: 0;
  background: #1e293b;
  color: #94a3b8;
  font-weight: 700;
  z-index: 1;
}

.dg-cell-input {
  width: 70px;
  background: #020617;
  border: 1px solid #334155;
  border-radius: 4px;
  color: #e2e8f0;
  padding: 3px 5px;
  font-size: 11px;
  text-align: right;
}

.dg-cell-id {
  width: 56px;
  text-align: center;
}

.dg-expression-input {
  width: 210px;
  background: #020617;
  border: 1px solid #334155;
  border-radius: 4px;
  color: #e2e8f0;
  padding: 3px 5px;
  font-size: 11px;
}

.dg-poly-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
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

.dg-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dg-combo-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.dg-btn-dark {
  background: #334155;
}

.dg-btn-dark:hover:not(:disabled) {
  background: #475569;
}

.dg-combo-search {
  margin-bottom: 8px;
}

.dg-filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.dg-filter-tab {
  cursor: pointer;
  border: 1px solid #334155;
  background: #1e293b;
  color: #dbeafe;
  border-radius: 999px;
  padding: 5px 8px;
  font-size: 11px;
  font-weight: 700;
}

.dg-filter-tab:hover {
  background: #334155;
}

.dg-filter-tab-active {
  background: #2563eb;
  border-color: #60a5fa;
}

.dg-filter-tab span {
  margin-left: 4px;
  opacity: 0.8;
}

.dg-combo-name {
  flex: 1;
}

.dg-combo-badge {
  border-radius: 999px;
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
}

.dg-combo-badge-dead {
  background: #78350f;
  color: #fde68a;
}

.dg-combo-badge-live {
  background: #064e3b;
  color: #a7f3d0;
}

.dg-combo-badge-seismic {
  background: #7f1d1d;
  color: #fecaca;
}

.dg-combo-badge-combinations {
  background: #1e3a8a;
  color: #bfdbfe;
}

.dg-combo-badge-other {
  background: #334155;
  color: #cbd5e1;
}

.dg-duplicate-policy {
  display: grid;
  gap: 4px;
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 11px;
}

.dg-foundation-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dg-tool-active {
  background: #2563eb !important;
  border: 1px solid #93c5fd;
}

.dg-mode-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>