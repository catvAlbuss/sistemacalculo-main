<template>
    <div class="rm-backdrop" @click.self="emit('close')">
        <div class="rm-modal">
            <header class="rm-header">
                <div>
                    <h2 class="rm-title">Resultados de cimentación</h2>
                    <p class="rm-subtitle">
                        Resultados calculados con el endpoint original de Safecito: /zapatas2.
                    </p>
                </div>

                <button class="rm-close" @click="emit('close')">✕</button>
            </header>

            <div v-if="!results" class="rm-empty">
                No hay resultados para mostrar.
            </div>

            <template v-else>
                <section class="rm-summary-grid">
                    <div class="rm-summary-card">
                        <span class="rm-summary-label">Df</span>
                        <strong>{{ formatValue(results.df, 3) }}</strong>
                    </div>

                    <div class="rm-summary-card">
                        <span class="rm-summary-label">γe</span>
                        <strong>{{ formatValue(results.gammaE, 3) }}</strong>
                    </div>

                    <div class="rm-summary-card">
                        <span class="rm-summary-label">Columnas</span>
                        <strong>{{ results.columns?.length ?? 0 }}</strong>
                    </div>

                    <div class="rm-summary-card">
                        <span class="rm-summary-label">Polígonos</span>
                        <strong>{{ results.normalizedPolygons?.length ?? 0 }}</strong>
                    </div>
                </section>

                <section v-if="results.selectedCombos?.length" class="rm-section">
                    <h3 class="rm-section-title">Combinaciones importadas desde ETABS</h3>

                    <div class="rm-tags">
                        <span class="rm-tag">PD: {{ results.selectedCombos[0] || "-" }}</span>
                        <span class="rm-tag">PL: {{ results.selectedCombos[1] || "-" }}</span>
                        <span class="rm-tag">SISMO: {{ results.selectedCombos[2] || "-" }}</span>
                    </div>
                </section>

                <section class="rm-section">
                    <h3 class="rm-section-title">Combinaciones de carga Co</h3>

                    <div class="rm-tabs">
                        <button v-for="(combo, index) in results.loadCombinations" :key="combo.id ?? index"
                            class="rm-tab" :class="{ 'rm-tab-active': selectedComboIndex === index }"
                            @click="selectedComboIndex = index">
                            Comb {{ index + 1 }}
                        </button>
                    </div>

                    <div class="rm-combo-box">
                        <div>
                            <strong>P:</strong>
                            <span>{{ activeCombo?.column1 }}</span>
                        </div>
                        <div>
                            <strong>MX:</strong>
                            <span>{{ activeCombo?.column2 }}</span>
                        </div>
                        <div>
                            <strong>MY:</strong>
                            <span>{{ activeCombo?.column3 }}</span>
                        </div>
                    </div>
                </section>

                <section class="rm-section">
                    <div class="rm-section-head">
                        <h3 class="rm-section-title">Mapa de presiones</h3>
                        <button class="rm-secondary-btn" @click="renderActivePlot">
                            Actualizar gráfico
                        </button>
                    </div>

                    <div ref="plotRef" class="rm-plot"></div>

                    <p v-if="plotError" class="rm-error">
                        {{ plotError }}
                    </p>
                </section>

                <section class="rm-section">
                    <h3 class="rm-section-title">Resumen σmin / σmax</h3>

                    <div class="rm-table-wrap">
                        <table class="rm-table">
                            <thead>
                                <tr>
                                    <th>Polígono</th>
                                    <th>σmin</th>
                                    <th>σmax</th>
                                    <th>XC</th>
                                    <th>YC</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-for="row in activeSummaryRows" :key="row.polygon">
                                    <td>{{ row.polygon }}</td>
                                    <td>{{ formatValue(row.min, 3) }}</td>
                                    <td>{{ formatValue(row.max, 3) }}</td>
                                    <td>{{ formatValue(row.XC, 3) }}</td>
                                    <td>{{ formatValue(row.YC, 3) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <footer class="rm-footer">
                    <button class="rm-primary-btn" @click="emit('close')">
                        Cerrar
                    </button>
                </footer>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
    renderZapatas2Plot,
    purgeZapatas2Plot,
    resizeZapatas2Plot,
    formatZapatas2Value,
} from "../charts/zapatas2Plot.js";

const props = defineProps({
    results: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(["close"]);

const selectedComboIndex = ref(0);
const plotRef = ref(null);
const plotError = ref("");

const activeCombo = computed(() => {
    return props.results?.loadCombinations?.[selectedComboIndex.value] ?? null;
});

const activeSummary = computed(() => {
    return props.results?.summary?.[selectedComboIndex.value] ?? null;
});

const activeSummaryRows = computed(() => {
    return activeSummary.value?.polygonRows ?? [];
});

const formatValue = (value, digits = 3) => {
    return formatZapatas2Value(value, digits);
};

async function renderActivePlot() {
    if (!props.results || !plotRef.value) return;

    plotError.value = "";

    try {
        await nextTick();
        await renderZapatas2Plot(plotRef.value, props.results, selectedComboIndex.value);
        resizeZapatas2Plot(plotRef.value);
    } catch (error) {
        plotError.value = error?.message || "No se pudo renderizar el gráfico.";
        console.error("Error renderizando gráfico de zapatas:", error);
    }
}

watch(
    () => selectedComboIndex.value,
    () => {
        renderActivePlot();
    }
);

watch(
    () => props.results,
    () => {
        selectedComboIndex.value = 0;
        renderActivePlot();
    },
    { immediate: true }
);

onMounted(() => {
    renderActivePlot();

    window.addEventListener("resize", renderActivePlot);
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", renderActivePlot);
    purgeZapatas2Plot(plotRef.value);
});
</script>

<style scoped>
.rm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(2, 6, 23, 0.72);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
}

.rm-modal {
    width: min(1180px, 96vw);
    max-height: 92vh;
    overflow-y: auto;
    background: #0f172a;
    color: #e2e8f0;
    border: 1px solid #334155;
    border-radius: 14px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.65);
}

.rm-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #111827;
    border-bottom: 1px solid #334155;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.rm-title {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
}

.rm-subtitle {
    margin: 3px 0 0;
    font-size: 12px;
    color: #93c5fd;
}

.rm-close {
    cursor: pointer;
    border: 1px solid #475569;
    background: #1e293b;
    color: #e2e8f0;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 15px;
}

.rm-close:hover {
    background: #334155;
}

.rm-empty {
    padding: 24px;
    color: #cbd5e1;
}

.rm-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(120px, 1fr));
    gap: 10px;
    padding: 14px 16px 0;
}

.rm-summary-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 10px 12px;
}

.rm-summary-label {
    display: block;
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 4px;
}

.rm-summary-card strong {
    font-size: 18px;
}

.rm-section {
    padding: 14px 16px 0;
}

.rm-section:last-of-type {
    padding-bottom: 16px;
}

.rm-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.rm-section-title {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 800;
    color: #bfdbfe;
}

.rm-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.rm-tag {
    background: #1e293b;
    border: 1px solid #475569;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 12px;
    color: #dbeafe;
}

.rm-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
}

.rm-tab {
    cursor: pointer;
    border: 1px solid #334155;
    background: #1e293b;
    color: #e2e8f0;
    border-radius: 8px;
    padding: 6px 9px;
    font-size: 12px;
    font-weight: 700;
}

.rm-tab:hover {
    background: #334155;
}

.rm-tab-active {
    background: #2563eb;
    border-color: #60a5fa;
}

.rm-combo-box {
    display: grid;
    gap: 5px;
    background: #111827;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 9px 11px;
    font-size: 12px;
}

.rm-combo-box strong {
    color: #93c5fd;
    margin-right: 6px;
}

.rm-plot {
    width: 100%;
    height: 520px;
    border: 1px solid #334155;
    border-radius: 10px;
    overflow: hidden;
    background: #0f172a;
}

.rm-error {
    margin: 8px 0 0;
    color: #fca5a5;
    font-size: 12px;
}

.rm-table-wrap {
    max-height: 240px;
    overflow: auto;
    border: 1px solid #334155;
    border-radius: 10px;
}

.rm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

.rm-table th,
.rm-table td {
    padding: 7px 9px;
    text-align: right;
    border-bottom: 1px solid #1e293b;
}

.rm-table th:first-child,
.rm-table td:first-child {
    text-align: left;
}

.rm-table thead th {
    position: sticky;
    top: 0;
    background: #1e293b;
    color: #94a3b8;
    z-index: 1;
}

.rm-footer {
    position: sticky;
    bottom: 0;
    background: #111827;
    border-top: 1px solid #334155;
    padding: 12px 16px;
    display: flex;
    justify-content: flex-end;
}

.rm-primary-btn,
.rm-secondary-btn {
    cursor: pointer;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-weight: 700;
}

.rm-primary-btn {
    background: #2563eb;
    padding: 8px 14px;
}

.rm-primary-btn:hover {
    background: #1d4ed8;
}

.rm-secondary-btn {
    background: #334155;
    padding: 6px 10px;
    font-size: 12px;
}

.rm-secondary-btn:hover {
    background: #475569;
}

@media (max-width: 760px) {
    .rm-summary-grid {
        grid-template-columns: repeat(2, minmax(120px, 1fr));
    }

    .rm-plot {
        height: 420px;
    }
}
</style>