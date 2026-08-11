{{-- resources/views/components/cad/modals/zapata-results-modal.blade.php
     Resultados de "Calcular zapatas" (botón en side-panel.blade.php).
     Solo lectura: cadSystem.calculateZapatas() dispara
     'open-zapata-results-modal' con { loadCombinations, polygonProperties,
     df, gammaE, columnsCount } (ver resources/js/cad/mixins/analysis/
     foundation.js).

     Rinde UN gráfico a la vez (pestaña por combinación) — igual que
     /software/predim2 (ResultadosModal.vue) — en vez de los 11 al mismo
     tiempo (patrón de /software/cimentacion-v2, que se pone lento con
     tantos puntos Plotly simultáneos). Cambiar de pestaña llama
     cadSystem.renderZapataPlot() sobre el MISMO contenedor: Plotly.react()
     actualiza en vez de recrear, así que es barato. --}}
<div x-data="zapataResultsModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:min(1180px, 96vw); max-height:90vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Resultados de Zapatas</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200 overflow-auto">
            <p class="text-[11px] text-amber-400 mb-3">
                La carga sísmica usada es un envelope (sin signo) del análisis modal-espectral.
                Verifica el resultado con criterio de ingeniería antes de usarlo en producción.
            </p>

            {{-- Resumen --}}
            <div class="grid grid-cols-4 gap-2 mb-4">
                <div class="bg-gray-900 border border-gray-700 rounded p-2">
                    <span class="block text-[10px] text-gray-400">Df</span>
                    <strong x-text="summary.df"></strong>
                </div>
                <div class="bg-gray-900 border border-gray-700 rounded p-2">
                    <span class="block text-[10px] text-gray-400">γe</span>
                    <strong x-text="summary.gammaE"></strong>
                </div>
                <div class="bg-gray-900 border border-gray-700 rounded p-2">
                    <span class="block text-[10px] text-gray-400">Columnas</span>
                    <strong x-text="summary.columnsCount"></strong>
                </div>
                <div class="bg-gray-900 border border-gray-700 rounded p-2">
                    <span class="block text-[10px] text-gray-400">Polígonos</span>
                    <strong x-text="polygonProperties.length"></strong>
                </div>
            </div>

            {{-- Propiedades geométricas por zapata (no cambian según el combo) --}}
            <template x-for="polygon in polygonProperties" :key="polygon.name">
                <fieldset class="border border-gray-600 rounded px-2 pb-2 pt-1 mb-3">
                    <legend class="px-1 text-xs text-gray-400" x-text="polygon.name"></legend>

                    <div class="mb-2">
                        <p class="text-[11px] font-semibold text-gray-300 mb-1">Dimensiones</p>
                        <template x-if="polygon.dimensions">
                            <p class="text-xs">
                                B = <strong x-text="formatNumber(polygon.dimensions.B)"></strong> m
                                &times;
                                L = <strong x-text="formatNumber(polygon.dimensions.L)"></strong> m
                            </p>
                        </template>
                        <template x-if="!polygon.dimensions">
                            <p class="text-xs text-gray-300">
                                Lados:
                                <template x-for="(edge, index) in polygon.edges" :key="index">
                                    <span class="mr-2" x-text="formatNumber(edge) + ' m'"></span>
                                </template>
                            </p>
                        </template>
                    </div>

                    <div class="grid gap-3" style="grid-template-columns: minmax(0,1fr) minmax(0,1fr)">
                        <div>
                            <p class="text-[11px] font-semibold text-gray-300 mb-1">Propiedades</p>
                            <table class="w-full text-xs">
                                <tbody>
                                    <template x-for="key in ['P','A','IX','IY','XC','YC','MX','MY','IXY']" :key="key">
                                        <tr class="border-t border-gray-700">
                                            <td class="py-1 pr-2 text-gray-400" x-text="key"></td>
                                            <td class="py-1" x-text="formatNumber(polygon.properties?.[key])"></td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <p class="text-[11px] font-semibold text-gray-300 mb-1">Puntos</p>
                            <table class="w-full text-xs">
                                <thead>
                                    <tr class="text-gray-400 text-left">
                                        <th class="py-1 pr-2">X</th>
                                        <th class="py-1 pr-2">Y</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="(point, index) in polygon.points" :key="index">
                                        <tr class="border-t border-gray-700">
                                            <td class="py-1 pr-2" x-text="formatNumber(point.x)"></td>
                                            <td class="py-1 pr-2" x-text="formatNumber(point.y)"></td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </fieldset>
            </template>

            {{-- Mapa de presiones: pestaña por combinación, 1 gráfico activo --}}
            <p class="text-[11px] font-semibold text-gray-300 mb-1">Mapa de presiones por combinación</p>

            <div class="flex flex-wrap gap-1 mb-2">
                <template x-for="(combo, index) in loadCombinations" :key="index">
                    <button @click="selectCombo(index)"
                        class="px-2 py-1 rounded text-xs border"
                        :class="selectedComboIndex === index ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-700'">
                        Comb <span x-text="index + 1"></span>
                    </button>
                </template>
            </div>

            <div id="zapata-plot" style="height:420px; background:#0f172a; border:1px solid #334155; border-radius:8px"></div>

            <div class="mt-3 overflow-auto" style="max-height:180px">
                <table class="w-full text-xs">
                    <thead>
                        <tr class="text-gray-400 text-left">
                            <th class="py-1 pr-2">Polígono</th>
                            <th class="py-1 pr-2">σmin</th>
                            <th class="py-1 pr-2">σmax</th>
                            <th class="py-1 pr-2">XC</th>
                            <th class="py-1 pr-2">YC</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="row in summaryRows" :key="row.polygon">
                            <tr class="border-t border-gray-700">
                                <td class="py-1 pr-2" x-text="row.polygon"></td>
                                <td class="py-1 pr-2" x-text="formatNumber(row.min)"></td>
                                <td class="py-1 pr-2" x-text="formatNumber(row.max)"></td>
                                <td class="py-1 pr-2" x-text="formatNumber(row.XC)"></td>
                                <td class="py-1 pr-2" x-text="formatNumber(row.YC)"></td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Close</button>
        </div>
    </div>
</div>

<script>
    function zapataResultsModal() {
        return {
            open: false,
            loadCombinations: [],
            polygonProperties: [],
            summary: { df: null, gammaE: null, columnsCount: 0 },
            selectedComboIndex: 0,
            summaryRows: [],
            formatNumber(value) {
                const number = Number(value);
                return Number.isFinite(number) ? number.toFixed(2) : '-';
            },
            init() {
                window.addEventListener('open-zapata-results-modal', async (e) => {
                    this.loadCombinations = e.detail?.loadCombinations || [];
                    this.polygonProperties = e.detail?.polygonProperties || [];
                    this.summary = {
                        df: e.detail?.df ?? null,
                        gammaE: e.detail?.gammaE ?? null,
                        columnsCount: e.detail?.columnsCount ?? 0,
                    };
                    this.selectedComboIndex = 0;
                    this.open = true;

                    await this.$nextTick();
                    this.renderActive();
                });
            },
            selectCombo(index) {
                this.selectedComboIndex = index;
                this.renderActive();
            },
            renderActive() {
                window.cadSystem?.renderZapataPlot?.('zapata-plot', this.selectedComboIndex);
                this.summaryRows = window.cadSystem?.getZapataSummaryRows?.(this.selectedComboIndex) || [];
            },
            close() {
                window.cadSystem?.purgeZapataPlots?.(['zapata-plot']);
                this.open = false;
            },
        };
    }
</script>
