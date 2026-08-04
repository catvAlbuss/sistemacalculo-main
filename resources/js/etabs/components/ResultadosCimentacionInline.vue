<template>
    <section v-if="results" class="ci-results">
        <h2 class="ci-title">Resultados</h2>

        <section class="ci-block">
            <h3 class="ci-subtitle">1.- Análisis Estructural</h3>

            <div class="ci-summary">
                <div>
                    <span>Df</span>
                    <strong>{{ formatValue(results.df) }}</strong>
                </div>

                <div>
                    <span>γe</span>
                    <strong>{{ formatValue(results.gammaE) }}</strong>
                </div>

                <div>
                    <span>Columnas</span>
                    <strong>{{ results.columns?.length ?? 0 }}</strong>
                </div>

                <div>
                    <span>Polígonos</span>
                    <strong>{{ results.normalizedPolygons?.length ?? 0 }}</strong>
                </div>
            </div>
        </section>

        <section class="ci-block">
            <div class="ci-tables">
                <div class="ci-table-card">
                    <h3>Propiedades</h3>

                    <table>
                        <tbody>
                            <tr>
                                <th>Df</th>
                                <td>{{ formatValue(results.df) }}</td>
                            </tr>
                            <tr>
                                <th>γe</th>
                                <td>{{ formatValue(results.gammaE) }}</td>
                            </tr>
                            <tr>
                                <th>Columnas</th>
                                <td>{{ results.columns?.length ?? 0 }}</td>
                            </tr>
                            <tr>
                                <th>Combinaciones</th>
                                <td>{{ results.loadCombinations?.length ?? 0 }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-for="polygon in results.normalizedPolygons" :key="polygon.key" class="ci-table-card">
                    <h3>{{ polygon.name }}</h3>

                    <table>
                        <tbody>
                            <tr>
                                <th>XC</th>
                                <td>{{ formatValue(polygon.XC) }}</td>
                            </tr>
                            <tr>
                                <th>YC</th>
                                <td>{{ formatValue(polygon.YC) }}</td>
                            </tr>
                            <tr>
                                <th>σmin global</th>
                                <td>{{ formatValue(globalMin(polygon.min)) }}</td>
                            </tr>
                            <tr>
                                <th>σmax global</th>
                                <td>{{ formatValue(globalMax(polygon.max)) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <section v-if="results?.polygonColumnSummary?.length" class="result-section">
            <h4>Columnas dentro de cada zapata</h4>

            <div v-for="item in results.polygonColumnSummary" :key="item.polygonIndex" class="result-card">
                <div class="result-card-title">
                    {{ item.polygonName }}
                </div>

                <p>
                    <b>Nodos del polígono:</b> {{ item.nodes }}
                </p>

                <p>
                    <b>Columnas dentro:</b> {{ item.columnsInside }}
                </p>

                <p>
                    <b>Columnas:</b> {{ item.columns.join(", ") }}
                </p>
            </div>
        </section>

        <section v-if="getPolygonResultEntries().length" class="result-section">
            <h4>Presiones mínimas y máximas</h4>

            <div v-for="polygon in getPolygonResultEntries()" :key="polygon.key" class="result-card">
                <div class="result-card-title">
                    {{ polygon.name }}
                </div>

                <p>
                    <b>Centroide:</b>
                    X = {{ formatNumber(polygon.centroidX, 3) }},
                    Y = {{ formatNumber(polygon.centroidY, 3) }}
                </p>

                <table class="result-table">
                    <thead>
                        <tr>
                            <th>Comb.</th>
                            <th>σ min</th>
                            <th>σ max</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="(_, comboIndex) in polygon.max" :key="comboIndex">
                            <td>{{ comboIndex + 1 }}</td>
                            <td>{{ formatNumber(polygon.min[comboIndex], 4) }}</td>
                            <td>{{ formatNumber(polygon.max[comboIndex], 4) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="ci-block">
            <h3 class="ci-subtitle">2.- Gráficos de presión</h3>

            <div v-for="(combo, index) in results.loadCombinations" :key="combo.id ?? index" class="ci-plot-card">
                <div class="ci-plot-head">
                    <strong>Comb {{ index + 1 }}</strong>
                    <span>[{{ combo.column1 }}, {{ combo.column2 }}, {{ combo.column3 }}]</span>
                </div>

                <div :ref="(el) => setPlotRef(el, index)" class="ci-plot"></div>

                <div class="ci-minmax">
                    <table>
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
                            <tr v-for="row in results.summary?.[index]?.polygonRows ?? []" :key="row.polygon">
                                <td>{{ row.polygon }}</td>
                                <td>{{ formatValue(row.min) }}</td>
                                <td>{{ formatValue(row.max) }}</td>
                                <td>{{ formatValue(row.XC) }}</td>
                                <td>{{ formatValue(row.YC) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </section>

    <section v-else class="ci-results ci-empty">
        <h2 class="ci-title">Resultados</h2>

        <p>Aún no hay resultados. Completa los datos, captura polígonos y presiona Calcular zapatas.</p>
    </section>

</template>

<script setup>
import { nextTick, onBeforeUnmount, watch } from "vue";
import {
    renderZapatas2Plot,
    purgeZapatas2Plot,
    formatZapatas2Value,
} from "../charts/zapatas2Plot.js";

const props = defineProps({
    results: {
        type: Object,
        default: null,
    },
});

const plotRefs = new Map();

const formatValue = (value, digits = 3) => {
    return formatZapatas2Value(value, digits);
};

const globalMin = (values = []) => {
    const numbers = values.map(Number).filter(Number.isFinite);
    return numbers.length ? Math.min(...numbers) : null;
};

const globalMax = (values = []) => {
    const numbers = values.map(Number).filter(Number.isFinite);
    return numbers.length ? Math.max(...numbers) : null;
};

const setPlotRef = (element, index) => {
    if (element) {
        plotRefs.set(index, element);
    }
};

const renderAllPlots = async () => {
    if (!props.results) return;

    await nextTick();

    for (let index = 0; index < props.results.loadCombinations.length; index++) {
        const element = plotRefs.get(index);

        if (!element) continue;

        try {
            await renderZapatas2Plot(element, props.results, index);
        } catch (error) {
            console.error(`No se pudo renderizar gráfico ${index + 1}:`, error);
        }
    }
};

const getPolygonResultEntries = () => {
    const resultados = props.results?.resultados || {};

    return Object.entries(resultados).map(([polygonKey, polygonResult], index) => {
        return {
            key: polygonKey,
            name: `Polígono ${index + 1}`,
            result: polygonResult,
            centroidX: polygonResult?.XC?.[0] ?? null,
            centroidY: polygonResult?.YC?.[0] ?? null,
            min: Array.isArray(polygonResult?.min) ? polygonResult.min : [],
            max: Array.isArray(polygonResult?.max) ? polygonResult.max : [],
        };
    });
};

const formatNumber = (value, digits = 4) => {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(digits) : "-";
};

watch(
    () => props.results,
    () => {
        renderAllPlots();
    },
    { immediate: true }
);

onBeforeUnmount(() => {
    plotRefs.forEach((element) => purgeZapatas2Plot(element));
    plotRefs.clear();
});

</script>

<style scoped>
.ci-results {
    width: 100%;
    background: #1f2937;
    color: #f8fafc;
    padding: 18px 22px;
    border-top: 1px solid #334155;
}

.ci-title {
    margin: 0 0 22px;
    font-size: 22px;
    font-weight: 800;
}

.ci-subtitle {
    margin: 0 0 12px;
    font-size: 18px;
    font-weight: 800;
}

.ci-block {
    margin-top: 18px;
}

.ci-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(120px, 1fr));
    gap: 12px;
}

.ci-summary div {
    background: #111827;
    border: 1px solid #374151;
    border-radius: 8px;
    padding: 12px;
}

.ci-summary span {
    display: block;
    color: #93c5fd;
    font-size: 12px;
    margin-bottom: 4px;
}

.ci-summary strong {
    font-size: 20px;
}

.ci-tables {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    flex-wrap: wrap;
}

.ci-table-card {
    background: #111827;
    min-width: 230px;
}

.ci-table-card h3 {
    margin: 0;
    background: #0f172a;
    padding: 10px 14px;
    font-size: 16px;
}

.ci-table-card table,
.ci-minmax table {
    width: 100%;
    border-collapse: collapse;
}

.ci-table-card th,
.ci-table-card td,
.ci-minmax th,
.ci-minmax td {
    padding: 8px 12px;
    border-bottom: 1px solid #334155;
    text-align: right;
}

.ci-table-card th,
.ci-minmax th {
    color: #bfdbfe;
    text-align: left;
}

.ci-plot-card {
    background: #475569;
    margin-top: 18px;
    padding: 12px;
    border-radius: 4px;
}

.ci-plot-head {
    background: #111827;
    padding: 8px 12px;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    font-size: 13px;
}

.ci-plot-head span {
    color: #cbd5e1;
}

.ci-plot {
    margin-top: 10px;
    width: 100%;
    height: 420px;
    background: #fff;
}

.ci-minmax {
    margin-top: 10px;
    background: #111827;
    max-height: 240px;
    overflow: auto;
}

.ci-empty {
    min-height: 160px;
}

.ci-empty p {
    color: #cbd5e1;
}

@media (max-width: 760px) {
    .ci-summary {
        grid-template-columns: repeat(2, minmax(120px, 1fr));
    }

    .ci-plot {
        height: 340px;
    }
}

.result-section {
    margin-top: 12px;
    border: 1px solid #334155;
    border-radius: 12px;
    background: #0f172a;
    padding: 12px;
}

.result-section h4 {
    margin: 0 0 10px;
    color: #e5e7eb;
    font-size: 14px;
}

.result-card {
    border: 1px solid #1e293b;
    border-radius: 10px;
    background: #111827;
    padding: 10px;
    margin-bottom: 10px;
}

.result-card-title {
    font-weight: 800;
    color: #93c5fd;
    margin-bottom: 6px;
}

.result-card p {
    margin: 4px 0;
    color: #cbd5e1;
    font-size: 12px;
}

.result-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    font-size: 12px;
}

.result-table th,
.result-table td {
    border: 1px solid #334155;
    padding: 6px;
    text-align: right;
}

.result-table th:first-child,
.result-table td:first-child {
    text-align: center;
}

.result-table th {
    background: #1e293b;
    color: #e5e7eb;
}

.result-table td {
    color: #cbd5e1;
}
</style>