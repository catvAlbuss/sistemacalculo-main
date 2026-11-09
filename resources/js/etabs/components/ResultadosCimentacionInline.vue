<template>
    <section v-if="results" class="ci-results etabs-theme" data-analysis-sheet>
        <div class="ci-kpis">
            <div class="ci-kpi">
                <span>σ máxima</span>
                <strong>{{ formatValue(extremes.max?.value) }}<small> tn/m²</small></strong>
                <em v-if="extremes.max">{{ extremes.max.name }} · C{{ extremes.max.combo + 1 }}</em>
            </div>
            <div class="ci-kpi" :class="{ 'is-warn': extremes.min && extremes.min.value < 0 }">
                <span>σ mínima</span>
                <strong>{{ formatValue(extremes.min?.value) }}<small> tn/m²</small></strong>
                <em v-if="extremes.min">{{ extremes.min.value < 0 ? "Tracción: zapata parcialmente despegada" : `${extremes.min.name} · C${extremes.min.combo + 1}` }}</em>
            </div>
            <div class="ci-kpi">
                <span>Zapatas · columnas</span>
                <strong>{{ results.normalizedPolygons?.length ?? 0 }} · {{ results.columns?.length ?? 0 }}</strong>
                <em>{{ results.loadCombinations?.length ?? 0 }} combinaciones</em>
            </div>
            <div class="ci-kpi">
                <span>D<sub>f</sub> · γ<sub>e</sub></span>
                <strong>{{ formatValue(results.df, 2) }}<small> m</small> · {{ formatValue(results.gammaE, 2) }}<small> tn/m³</small></strong>
                <em>Parámetros del cálculo</em>
            </div>
        </div>

        <section class="ci-block">
            <h3 class="ci-subtitle">Resumen por zapata</h3>
            <div class="fz-table-wrap ci-summary-table">
                <table class="fz-table">
                    <thead>
                        <tr>
                            <th class="fz-left">Zapata</th>
                            <th class="fz-left">Columnas</th>
                            <th>X<sub>c</sub> (m)</th>
                            <th>Y<sub>c</sub> (m)</th>
                            <th>σ mín (tn/m²)</th>
                            <th>σ máx (tn/m²)</th>
                            <th>Comb. crítica</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in footingRows" :key="row.key">
                            <td class="fz-left"><strong>{{ row.name }}</strong></td>
                            <td class="fz-left ci-cols">{{ row.columns || "—" }}</td>
                            <td>{{ formatValue(row.XC) }}</td>
                            <td>{{ formatValue(row.YC) }}</td>
                            <td :class="{ 'ci-neg': row.min < 0 }">{{ formatValue(row.min) }}</td>
                            <td><strong>{{ formatValue(row.max) }}</strong></td>
                            <td><button type="button" class="ci-link" @click="selectedCombo = row.maxCombo">C{{ row.maxCombo + 1 }}</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="ci-block">
            <div class="ci-plot-head">
                <h3 class="ci-subtitle">Mapa de presiones</h3>
                <label class="ci-combo-select">
                    <span>Combinación</span>
                    <select v-model.number="selectedCombo" class="fz-input" aria-label="Combinación a graficar">
                        <option v-for="(combo, index) in results.loadCombinations" :key="combo.id ?? index" :value="index">C{{ index + 1 }}</option>
                    </select>
                </label>
            </div>
            <div class="ci-combo-chips" role="tablist" aria-label="Combinaciones">
                <button v-for="(combo, index) in results.loadCombinations" :key="combo.id ?? index" type="button" role="tab"
                    class="ci-chip" :aria-selected="selectedCombo === index" @click="selectedCombo = index">C{{ index + 1 }}</button>
            </div>
            <dl v-if="activeCombo" class="ci-expr">
                <div><dt>P</dt><dd>{{ activeCombo.column1 }}</dd></div>
                <div><dt>Mx</dt><dd>{{ activeCombo.column2 }}</dd></div>
                <div><dt>My</dt><dd>{{ activeCombo.column3 }}</dd></div>
            </dl>

            <div class="ci-plot-layout">
                <div ref="plotRef" class="ci-plot"></div>
                <div class="fz-table-wrap ci-minmax">
                    <table class="fz-table">
                        <thead>
                            <tr>
                                <th class="fz-left">Zapata</th>
                                <th>σ mín</th>
                                <th>σ máx</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in results.summary?.[selectedCombo]?.polygonRows ?? []" :key="row.polygon">
                                <td class="fz-left">{{ row.polygon }}</td>
                                <td :class="{ 'ci-neg': row.min < 0 }">{{ formatValue(row.min) }}</td>
                                <td>{{ formatValue(row.max) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </section>

    <section v-else class="ci-results ci-empty etabs-theme">
        <p>Aún no hay resultados. Completa los datos, agrega las zapatas y presiona Calcular zapatas.</p>
    </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import "../../../css/etabs-workspace.css";
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

const plotRef = ref(null);
const selectedCombo = ref(0);

const formatValue = (value, digits = 3) => {
    return formatZapatas2Value(value, digits);
};

const activeCombo = computed(() => props.results?.loadCombinations?.[selectedCombo.value] ?? null);

const extremeOf = (values = [], pick) => {
    let best = null;
    values.forEach((value, combo) => {
        const number = Number(value);
        if (Number.isFinite(number) && (best === null || pick(number, best.value))) best = { value: number, combo };
    });
    return best;
};

const footingRows = computed(() => {
    const summary = props.results?.polygonColumnSummary ?? [];
    return (props.results?.normalizedPolygons ?? []).map((polygon, index) => {
        const max = extremeOf(polygon.max, (a, b) => a > b);
        const min = extremeOf(polygon.min, (a, b) => a < b);
        return {
            key: polygon.key,
            name: polygon.name,
            columns: summary[index]?.columns?.join(", ") ?? "",
            XC: polygon.XC,
            YC: polygon.YC,
            max: max?.value ?? null,
            maxCombo: max?.combo ?? 0,
            min: min?.value ?? null,
            minCombo: min?.combo ?? 0,
        };
    });
});

const extremes = computed(() => {
    let max = null, min = null;
    for (const row of footingRows.value) {
        if (row.max !== null && (!max || row.max > max.value)) max = { value: row.max, combo: row.maxCombo, name: row.name };
        if (row.min !== null && (!min || row.min < min.value)) min = { value: row.min, combo: row.minCombo, name: row.name };
    }
    return { max, min };
});

let disposed = false;
const renderPlot = async () => {
    await nextTick();
    const element = plotRef.value;
    if (disposed || !element || !props.results) return;
    try {
        await renderZapatas2Plot(element, props.results, selectedCombo.value);
    } catch (error) {
        console.error(`No se pudo renderizar el mapa de C${selectedCombo.value + 1}:`, error);
    }
};

watch(
    () => props.results,
    (results) => {
        const count = results?.loadCombinations?.length ?? 0;
        if (selectedCombo.value >= count) selectedCombo.value = 0;
        renderPlot();
    },
    { immediate: true, flush: "post" }
);
watch(selectedCombo, renderPlot);

onBeforeUnmount(() => {
    disposed = true;
    purgeZapatas2Plot(plotRef.value);
});
</script>

<style scoped>
.ci-results { display:grid;gap:22px;width:100%;background:var(--pr-panel);color:var(--pr-text); }
.ci-kpis { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px; }
.ci-kpi { display:grid;gap:3px;padding:12px 14px;border:1px solid var(--pr-line);border-radius:10px;background:var(--pr-soft); }
.ci-kpi span { font-size:11.5px;color:var(--pr-muted); }
.ci-kpi strong { font-size:20px;font-weight:700;font-variant-numeric:tabular-nums; }
.ci-kpi small { font-size:12px;font-weight:500;color:var(--pr-muted); }
.ci-kpi em { font-style:normal;font-size:11.5px;color:var(--pr-muted); }
.ci-kpi.is-warn { border-color:rgba(251,191,36,.5); }
.ci-kpi.is-warn em { color:var(--fz-warn); }
.ci-block { display:grid;gap:10px;min-width:0; }
.ci-subtitle { margin:0;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--pr-muted); }
.ci-summary-table { max-height:300px; }
.ci-cols { max-width:220px;overflow:hidden;text-overflow:ellipsis;color:var(--pr-muted); }
.ci-neg { color:var(--fz-warn); }
.ci-link { padding:2px 8px;border:1px solid var(--pr-line);border-radius:6px;background:transparent;color:var(--pr-blue);font-weight:600;font-size:12px;font-family:inherit;cursor:pointer; }
.ci-link:hover { border-color:var(--pr-blue); }

.ci-plot-head { display:flex;align-items:center;justify-content:space-between;gap:12px; }
.ci-combo-select { display:none;align-items:center;gap:8px;font-size:12px;color:var(--pr-muted); }
.ci-combo-select .fz-input { width:auto; }
.ci-combo-chips { display:flex;flex-wrap:wrap;gap:5px; }
.ci-chip { min-width:42px;padding:5px 9px;border:1px solid var(--pr-line);border-radius:7px;background:transparent;color:var(--pr-muted);font-weight:600;font-size:12px;font-family:inherit;cursor:pointer; }
.ci-chip:hover { color:var(--pr-text);border-color:var(--pr-blue); }
.ci-chip[aria-selected=true] { border-color:transparent;background:var(--fz-accent);color:#fff; }
.ci-expr { display:flex;flex-wrap:wrap;gap:6px 18px;margin:0;padding:8px 12px;border-radius:8px;background:var(--pr-soft);font-size:12px; }
.ci-expr div { display:flex;gap:6px; }
.ci-expr dt { font-weight:700;color:var(--pr-muted); }
.ci-expr dd { margin:0;font-family:ui-monospace,SFMono-Regular,Consolas,monospace; }
.ci-plot-layout { display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:12px;align-items:start; }
.ci-plot { width:100%;height:clamp(340px,52vh,560px);border:1px solid var(--pr-line);border-radius:10px;overflow:hidden;background:var(--pr-panel); }
.ci-minmax { max-height:clamp(340px,52vh,560px); }
.ci-empty p { margin:0;color:var(--pr-muted); }

@media (max-width: 900px) {
    .ci-kpis { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .ci-plot-layout { grid-template-columns:1fr; }
    .ci-combo-chips { display:none; }
    .ci-combo-select { display:flex; }
    .ci-plot { height:340px; }
}
</style>
