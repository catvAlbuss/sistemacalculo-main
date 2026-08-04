<template>
    <div class="c2-backdrop">
        <div class="c2-modal">
            <header class="c2-header">
                <div>
                    <h1>Cimentación 2.0</h1>
                    <p>
                        Módulo integrado dentro de ETABS2. Usa el cálculo existente de Safecito mediante /zapatas2.
                    </p>
                </div>

                <div class="c2-header-actions">
                    <span class="c2-chip">Columnas: {{ currentColumns.length }}</span>
                    <span class="c2-chip">Polígonos: {{ polygons.length }}</span>

                    <button class="c2-close" @click="emit('close')">
                        ✕ Cerrar
                    </button>
                </div>
            </header>

            <main class="c2-body">
                <aside class="c2-left">
                    <DatosGeneralesPanel :polygons-count="polygons.length" @import-excel="onImportExcel"
                        @joint-reactions="emit('joint-reactions')" @columns-change="onColumnsChange"
                        @calculate-zapatas="onCalculate" />

                    <div v-if="loading || error" class="c2-status">
                        <div v-if="loading" class="c2-loading">
                            <span class="c2-spinner"></span>
                            <span>Calculando zapatas con /zapatas2...</span>
                        </div>

                        <div v-if="error" class="c2-error">
                            <strong>Error de cálculo</strong>
                            <p>{{ error }}</p>
                        </div>
                    </div>
                </aside>

                <section class="c2-right">
                    <section class="c2-card">
                        <div class="c2-card-head">
                            <div>
                                <h2>1.- Análisis estructural</h2>
                                <p>
                                    Dibuja las zapatas en este canvas. No uses Polyline del visor CAD para este cálculo.
                                </p>
                            </div>

                            <div class="c2-help">
                                Cierra el polígono haciendo clic cerca del primer punto.
                            </div>
                        </div>

                        <SafecitoCanvas :columns="currentColumns" @polygons-change="onPolygonsChange" />
                    </section>

                    <ResultadosCimentacionInline :results="results" />
                </section>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

import DatosGeneralesPanel from "./DatosGeneralesPanel.vue";
import SafecitoCanvas from "./SafecitoCanvas.vue";
import ResultadosCimentacionInline from "./ResultadosCimentacionInline.vue";

const props = defineProps({
    results: {
        type: Object,
        default: null,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: "",
    },
});

const emit = defineEmits([
    "close",
    "calculate",
    "import-excel",
    "joint-reactions",
    "clear-results",
]);

const currentColumns = ref([]);
const polygons = ref([]);

const onImportExcel = (file) => {
    emit("clear-results");
    emit("import-excel", file);
};

const onColumnsChange = (columns) => {
    currentColumns.value = Array.isArray(columns) ? columns : [];
    emit("clear-results");
};

const onPolygonsChange = (nextPolygons) => {
    polygons.value = Array.isArray(nextPolygons) ? nextPolygons : [];
    emit("clear-results");
};

const onCalculate = (payload) => {
    emit("calculate", {
        ...payload,
        columns: currentColumns.value,
        polygons: polygons.value,
    });
};
</script>

<style scoped>
.c2-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1200;
    background: rgba(2, 6, 23, 0.82);
    padding: 18px;
}

.c2-modal {
    width: 100%;
    height: 100%;
    background: #111827;
    color: #f8fafc;
    border: 1px solid #334155;
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 90px rgba(0, 0, 0, 0.75);
}

.c2-header {
    background: #1f2937;
    border-bottom: 1px solid #334155;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.c2-header h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
}

.c2-header p {
    margin: 4px 0 0;
    color: #bfdbfe;
    font-size: 13px;
}

.c2-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.c2-chip {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 999px;
    color: #dbeafe;
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
}

.c2-close {
    cursor: pointer;
    border: none;
    background: #dc2626;
    color: #fff;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 800;
}

.c2-close:hover {
    background: #b91c1c;
}

.c2-body {
    min-height: 0;
    flex: 1;
    display: grid;
    grid-template-columns: 430px minmax(0, 1fr);
    overflow: hidden;
}

.c2-left {
    min-height: 0;
    overflow-y: auto;
    border-right: 1px solid #334155;
    background: #0f172a;
    padding: 12px;
}

.c2-right {
    min-height: 0;
    overflow-y: auto;
    background: #1f2937;
}

.c2-card {
    padding: 16px 18px;
}

.c2-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
}

.c2-card-head h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 900;
}

.c2-card-head p {
    margin: 4px 0 0;
    color: #cbd5e1;
    font-size: 13px;
}

.c2-help {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    color: #bfdbfe;
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 700;
    max-width: 260px;
}

.c2-status {
    margin-top: 10px;
    background: #111827;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 10px;
    font-size: 12px;
}

.c2-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #dbeafe;
}

.c2-error {
    color: #fecaca;
}

.c2-error strong {
    color: #fca5a5;
}

.c2-error p {
    margin: 5px 0 0;
}

.c2-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #475569;
    border-top-color: #60a5fa;
    border-radius: 999px;
    animation: c2-spin 0.8s linear infinite;
}

@keyframes c2-spin {
    to {
        transform: rotate(360deg);
    }
}

/* Ajustes al panel dentro del modal */
:deep(.dg-panel) {
    width: 100%;
    max-width: none;
    max-height: none;
    box-shadow: none;
    border-radius: 10px;
}

:deep(.dg-config-grid) {
    grid-template-columns: repeat(2, minmax(80px, 1fr));
}

:deep(.dg-expression-input) {
    width: 160px;
}

:deep(.dg-table-wrap-large) {
    max-height: 220px;
}

:deep(.sc-canvas) {
    height: 560px;
}

:deep(.sc-canvas-box) {
    min-height: 560px;
}

:deep(.sc-side) {
    max-height: 560px;
}

@media (max-width: 1100px) {
    .c2-body {
        grid-template-columns: 1fr;
    }

    .c2-left {
        border-right: none;
        border-bottom: 1px solid #334155;
        max-height: 45vh;
    }

    .c2-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .c2-header-actions {
        flex-wrap: wrap;
    }
}
</style>