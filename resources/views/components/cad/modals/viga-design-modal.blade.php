{{-- resources/views/components/cad/modals/viga-design-modal.blade.php
     Resultados de "Diseñar Viga Seleccionada" (menú Diseñar → Diseño de
     Concreto Armado). Solo lectura salvo el acero real de Flexión.
     cadSystem.openRcBeamDesignDialog() dispara 'open-viga-design-modal' con
     { input, results, rebarState, rebarOptions } (ver
     resources/js/cad/mixins/analysis/rcBeamDesign.js). Elegir acero real
     dispara 'rc-beam-design-updated' con { results, rebarState } — este
     modal solo actualiza su copia local, no recalcula nada (todo el cálculo
     vive en el mixin, que reusa tal cual resources/js/vigas/calculators/*.js). --}}
<div x-data="vigaDesignModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:min(1400px, 96vw); max-height:92vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Diseño de Viga de Concreto Armado (ACI-318 / E.060)</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200 overflow-auto">
            <p class="text-[11px] text-amber-400 mb-3">
                Geometría y fuerzas (CM/CV/ENV) tomadas directamente del modelo y del último análisis de fuerzas de barra.
                Verifica el resultado con criterio de ingeniería antes de usarlo en producción.
            </p>

            {{-- ================= 0. DATOS DE ENTRADA (misma forma que vigas-general) =================
                 Se muestra ANTES de calcular — mismos campos que pide
                 resources/js/vigas (LUZ/BASE/ALTURA/CAPAS + CM/CV/ENV max/ENV
                 min × M3/V3/T por tramo/estación) para poder comparar/pegar
                 en esa calculadora sin tener que sacarlos de la consola. --}}
            <div class="mb-6 overflow-x-auto rounded-lg border border-gray-700 shadow-lg">
                <div class="bg-gray-900 px-4 py-2 text-white font-bold flex items-center justify-between">
                    <span>0.- Datos de entrada</span>
                    <button @click="diseñar()" :disabled="loading || !input"
                            class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-xs font-bold">
                        <span x-show="!loading">DISEÑAR</span>
                        <span x-show="loading">Calculando...</span>
                    </button>
                </div>
                <table class="min-w-full border-collapse text-xs">
                    <thead class="bg-gray-700 text-white">
                        <tr>
                            <th rowspan="2" class="px-3 py-2 text-left border border-gray-600">Descripción</th>
                            <template x-for="tramo in inputTramoRange()" :key="'ith'+tramo">
                                <th colspan="3" class="px-3 py-2 text-center border border-gray-600 bg-gray-600" x-text="'TRAMO ' + tramo"></th>
                            </template>
                        </tr>
                        <tr>
                            <template x-for="tramo in inputTramoRange()" :key="'its'+tramo">
                                <template x-for="sub in ['Inicio','Medio','Final']" :key="'its'+tramo+sub">
                                    <th class="px-2 py-1 text-center text-[10px] uppercase border border-gray-600" x-text="sub"></th>
                                </template>
                            </template>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700 bg-gray-800">
                        <template x-for="row in ['luz','base','altura']" :key="'geo'+row">
                            <tr>
                                <td class="px-3 py-2 border-r border-gray-700 font-bold uppercase" x-text="row"></td>
                                <template x-for="tramo in inputTramoRange()" :key="'geov'+row+tramo">
                                    <td colspan="3" class="px-2 py-2 text-center border-r border-gray-700" x-text="inputSingleValue(row, tramo)"></td>
                                </template>
                            </tr>
                        </template>
                    </tbody>

                    {{-- Un <tbody> por mainGroup (negativo/positivo) — tiene que ser
                         hermano del <tbody> de arriba, no anidado dentro, para que el
                         HTML quede válido (un <template x-for> solo puede envolver UN
                         elemento raíz, por eso cada iteración produce su propio <tbody>
                         con las filas de CAPAS + CM/CV/ENV max/ENV min adentro). --}}
                    <template x-for="mainGroup in ['negativo','positivo']" :key="'mg'+mainGroup">
                        <tbody class="divide-y divide-gray-700 bg-gray-800">
                            <tr :class="mainGroup === 'positivo' ? 'bg-green-900/40' : 'bg-red-900/40'">
                                <td class="px-3 py-2 font-bold uppercase" x-text="mainGroup"
                                    :colspan="1 + inputTramoRange().length * 3"></td>
                            </tr>
                            <tr>
                                <td class="px-3 py-2 border-r border-gray-700 font-bold">CAPAS</td>
                                <template x-for="tramo in inputTramoRange()" :key="'cap'+mainGroup+tramo">
                                    <td colspan="3" class="px-2 py-2 text-center border-r border-gray-700" x-text="inputCapas(mainGroup, tramo)"></td>
                                </template>
                            </tr>
                            <template x-for="g in inputForceGroups(mainGroup)" :key="mainGroup+g.grupo">
                                <template x-for="concepto in g.conceptos" :key="mainGroup+g.grupo+concepto">
                                    <tr class="bg-sky-950/40">
                                        <td class="px-3 py-2 border-r border-gray-700" x-text="g.grupo + ' — ' + concepto"></td>
                                        <template x-for="tramo in inputTramoRange()" :key="mainGroup+g.grupo+concepto+tramo">
                                            <template x-for="station in ['a','b','c']" :key="mainGroup+g.grupo+concepto+tramo+station">
                                                <td class="px-2 py-2 text-center border-r border-gray-700"
                                                    x-text="inputForceValue(mainGroup, g.grupo, concepto, tramo, station)"></td>
                                            </template>
                                        </template>
                                    </tr>
                                </template>
                            </template>
                        </tbody>
                    </template>
                </table>
            </div>

            {{-- ================= 1. REQUISITOS DE DISEÑO ================= --}}
            <template x-if="results.requirements">
                <div x-html="renderGenericTable(results.requirements)"></div>
            </template>

            {{-- ================= 2. FLEXIÓN (interactivo) ================= --}}
            <template x-for="sectionType in ['negativo', 'positivo']" :key="sectionType">
                <div class="mb-8 overflow-x-auto rounded-lg border border-gray-700 shadow-lg" x-show="results.flexion?.[sectionType]">
                    <div class="bg-gray-900 px-4 py-2 text-white font-bold" x-text="results.flexion?.[sectionType]?.title"></div>

                    <table class="min-w-full border-collapse text-xs">
                        <thead class="bg-gray-700 text-white">
                            <tr>
                                <th rowspan="2" class="px-3 py-2 text-left border border-gray-600">Descripción</th>
                                <th rowspan="2" class="px-3 py-2 text-center border border-gray-600">Símb.</th>
                                <template x-for="(group, gi) in (results.flexion?.columnGroups || [])" :key="gi">
                                    <th :colspan="group.columns.length" class="px-3 py-2 text-center border border-gray-600 bg-gray-600" x-text="group.title"></th>
                                </template>
                            </tr>
                            <tr>
                                <template x-for="(group, gi) in (results.flexion?.columnGroups || [])" :key="'sub'+gi">
                                    <template x-for="(col, ci) in group.columns" :key="gi+'-'+ci">
                                        <th class="px-2 py-1 text-center text-[10px] uppercase border border-gray-600" x-text="col"></th>
                                    </template>
                                </template>
                            </tr>
                        </thead>

                        <tbody class="divide-y divide-gray-700 bg-gray-800">
                            <template x-if="sectionType === 'positivo'">
                                <tr>
                                    <td class="px-3 py-2 border-r border-gray-700">𝑀𝑢(-)=1/3𝑀𝑢(+)</td>
                                    <td class="px-3 py-2 text-center border-r border-gray-700">𝑀𝑢_min</td>
                                    <template x-for="(v, vi) in (results.flexion?.positivo?.data?.Mu_derived || [])" :key="'md'+vi">
                                        <td class="px-2 py-2 text-center border-r border-gray-700" x-text="fmt(v)"></td>
                                    </template>
                                </tr>
                            </template>
                            <template x-if="sectionType === 'positivo'">
                                <tr>
                                    <td class="px-3 py-2 border-r border-gray-700">𝑀𝑢 (-) usar</td>
                                    <td class="px-3 py-2 text-center border-r border-gray-700">𝑀𝑢_usar</td>
                                    <template x-for="(v, vi) in (results.flexion?.positivo?.data?.Mu_final || [])" :key="'mf'+vi">
                                        <td class="px-2 py-2 text-center border-r border-gray-700" x-text="fmt(v)"></td>
                                    </template>
                                </tr>
                            </template>

                            <template x-for="row in flexionRows(sectionType)" :key="row.key">
                                <tr>
                                    <td class="px-3 py-2 border-r border-gray-700" x-text="row.name"></td>
                                    <td class="px-3 py-2 text-center border-r border-gray-700" x-text="row.symbol"></td>
                                    <template x-for="(v, vi) in row.values" :key="row.key+'-'+vi">
                                        <td class="px-2 py-2 text-center border-r border-gray-700" x-text="fmt(v)"></td>
                                    </template>
                                </tr>
                            </template>

                            {{-- Acero real (interactivo) --}}
                            <tr class="bg-slate-900/50">
                                <td class="px-3 py-2 border-r border-gray-700">Acero Real</td>
                                <td class="px-3 py-2 text-center border-r border-gray-700"></td>
                                <template x-for="idx in cellCount()" :key="'sel'+sectionType+idx">
                                    <td class="px-1 py-1 border-r border-gray-700">
                                        <select class="w-full text-[11px] p-1 rounded border border-gray-600 bg-gray-700 text-white"
                                            :value="rebarState[sectionType]?.asReal?.[idx-1] ?? 0"
                                            @change="onRebarChange(sectionType, idx-1, $event.target.value)">
                                            <template x-for="opt in rebarOptions" :key="opt.value">
                                                <option :value="opt.value" x-text="opt.text"></option>
                                            </template>
                                        </select>
                                    </td>
                                </template>
                            </tr>

                            <tr class="bg-gray-900/60">
                                <td class="px-3 py-2 font-bold border-r border-gray-700">Acero Real</td>
                                <td class="px-3 py-2 text-center border-r border-gray-700">As</td>
                                <template x-for="idx in cellCount()" :key="'asr'+sectionType+idx">
                                    <td class="px-2 py-2 text-center border-r border-gray-700" x-text="fmt(rebarState[sectionType]?.asReal?.[idx-1]) + ' cm²'"></td>
                                </template>
                            </tr>
                            <tr class="bg-gray-900/60">
                                <td class="px-3 py-2 font-bold border-r border-gray-700">Momento resistente</td>
                                <td class="px-3 py-2 text-center border-r border-gray-700">ФMn</td>
                                <template x-for="idx in cellCount()" :key="'phi'+sectionType+idx">
                                    <td class="px-2 py-2 text-center border-r border-gray-700" x-text="fmt(rebarState[sectionType]?.phiMn?.[idx-1]) + ' tonf-m'"></td>
                                </template>
                            </tr>
                            <tr class="bg-gray-900/60">
                                <td class="px-3 py-2 font-bold border-r border-gray-700">Verificación</td>
                                <td class="px-3 py-2 text-center border-r border-gray-700">Verif.</td>
                                <template x-for="idx in cellCount()" :key="'ver'+sectionType+idx">
                                    <td class="px-2 py-2 text-center font-bold border-r border-gray-700"
                                        :class="verifClass(sectionType, idx-1)"
                                        x-text="verifText(sectionType, idx-1)"></td>
                                </template>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>

            {{-- ================= 3-5. CORTANTE / CAPACIDAD / DEFLEXIÓN ================= --}}
            <template x-if="results.shear">
                <div x-html="renderGenericTable(results.shear)"></div>
            </template>
            <template x-if="results.capacidad">
                <div x-html="renderGenericTable(results.capacidad)"></div>
            </template>
            <template x-if="results.deflection">
                <div x-html="renderGenericTable(results.deflection)"></div>
            </template>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Cerrar</button>
        </div>
    </div>
</div>

<script>
    function vigaDesignModal() {
        return {
            open: false,
            loading: false,
            input: null,
            results: {},
            rebarState: { negativo: { asReal: [], phiMn: [] }, positivo: { asReal: [], phiMn: [] } },
            rebarOptions: [],
            groupsConfig: {},

            init() {
                window.addEventListener('open-viga-design-modal', (e) => {
                    this.input = e.detail?.input || null;
                    this.results = e.detail?.results || {};
                    this.rebarState = e.detail?.rebarState || this.rebarState;
                    this.rebarOptions = e.detail?.rebarOptions || [];
                    this.groupsConfig = e.detail?.groupsConfig || {};
                    this.loading = false;
                    this.open = true;
                });

                window.addEventListener('rc-beam-design-updated', (e) => {
                    if (!this.open) return;
                    this.results = e.detail?.results || this.results;
                    this.rebarState = e.detail?.rebarState || this.rebarState;
                    this.loading = false;
                });
            },

            close() {
                this.open = false;
            },

            diseñar() {
                this.loading = true;
                window.cadSystem?.rcBeamDesignRun?.();
            },

            fmt(value) {
                const n = Number(value);
                return Number.isFinite(n) ? n.toFixed(2) : (value ?? '-');
            },

            // ---- Tabla "0.- Datos de entrada" (misma forma que vigas-general) ----

            inputTramoRange() {
                const n = Number(this.input?.parametros?.numTramos || 0);
                return Array.from({ length: n }, (_, i) => i + 1);
            },

            inputSingleValue(kind, tramo) {
                const v = this.input?.datos?.[kind]?.[`tramo${tramo}`];
                return (v === undefined || v === null || v === '') ? '-' : this.fmt(v);
            },

            inputCapas(mainGroup, tramo) {
                const v = this.input?.datos?.capas?.[mainGroup]?.[`tramo${tramo}`];
                return (v === undefined || v === null || v === '') ? '-' : v;
            },

            inputForceGroups(mainGroup) {
                return this.groupsConfig?.[mainGroup] || [];
            },

            inputForceValue(mainGroup, grupo, concepto, tramo, station) {
                const v = this.input?.datos?.fuerzas?.[mainGroup]?.[grupo]?.[concepto]?.[`tramo${tramo}`]?.[station];
                return this.fmt(v);
            },

            cellCount() {
                const n = Number(this.input?.parametros?.numTramos || 0) * 3;
                return Array.from({ length: n }, (_, i) => i + 1);
            },

            flexionRows(sectionType) {
                const data = this.results.flexion?.[sectionType]?.data;
                if (!data) return [];

                const defs = [
                    ['Peralte efectivo', 'd', 'd', 'cm'],
                    ['Altura del bloque comprimido', 'a', 'a', 'cm'],
                    ['Refuerzo calculado', 'As', 'As', 'cm²'],
                    ['Refuerzo mínimo', 'As_min', 'As_min', 'cm²'],
                    ['Área de acero balanceado', 'ρb', 'As_bal', 'cm²'],
                    ['Refuerzo máximo (75%Asb)', 'As_max', 'As_max', 'cm²'],
                    ['Acero a usar', 'As_usar', 'As_usar', 'cm²'],
                ];

                return defs.map(([name, symbol, key]) => ({
                    key: sectionType + key,
                    name,
                    symbol,
                    values: data[key] || [],
                }));
            },

            onRebarChange(sectionType, flatIdx, value) {
                const tramoIdx = Math.floor(flatIdx / 3) + 1;
                const posIdx = flatIdx % 3;
                window.cadSystem?.rcBeamDesignSetRebar?.(sectionType, tramoIdx, posIdx, value);
            },

            verifText(sectionType, flatIdx) {
                const meta = this.results.flexion?.[sectionType]?.data?.meta?.[flatIdx];
                const asReal = Number(this.rebarState[sectionType]?.asReal?.[flatIdx] || 0);
                if (!meta) return '-';
                return (asReal < meta.As_max && asReal >= meta.As_usar) ? 'CUMPLE' : 'NO CUMPLE';
            },

            verifClass(sectionType, flatIdx) {
                return this.verifText(sectionType, flatIdx) === 'CUMPLE'
                    ? 'bg-green-900/40 text-green-400'
                    : 'bg-red-900/40 text-red-400';
            },

            renderGenericTable(table) {
                if (!table) return '';

                const headerGroups = (table.columnGroups || []).map((g) =>
                    `<th colspan="${g.columns.length}" class="px-3 py-2 text-center border border-gray-600 bg-gray-600">${g.title}</th>`
                ).join('');

                const headerCols = (table.columnGroups || []).flatMap((g) => g.columns).map((c) =>
                    `<th class="px-2 py-1 text-center text-[10px] uppercase border border-gray-600">${c}</th>`
                ).join('');

                const rows = (table.rows || []).map((row) => {
                    const cells = (row.values || []).map((v) => {
                        const colSpan = v?.colSpan ? ` colspan="${v.colSpan}"` : '';
                        // El valor YA viene redondeado con la precisión correcta por el
                        // calculador (StructuralUtils.round(val, decimals) — 2, 4 o 5
                        // decimales según la fila, ej. εcu/εy). Forzar toFixed(2) acá
                        // truncaba εcu=0.003/εy≈0.00204 a "0.00" — se muestra tal cual.
                        const val = v?.value ?? '-';
                        const unit = v?.unit ? `<div class="text-[10px] text-gray-400">${v.unit}</div>` : '';
                        return `<td${colSpan} class="px-2 py-2 text-center border-r border-gray-700">${val}${unit}</td>`;
                    }).join('');

                    return `<tr><td class="px-3 py-2 border-r border-gray-700">${row.name || ''}</td><td class="px-3 py-2 text-center border-r border-gray-700">${row.symbol || ''}</td>${cells}</tr>`;
                }).join('');

                return `
                    <div class="mb-8 overflow-x-auto rounded-lg border border-gray-700 shadow-lg">
                        <div class="bg-gray-900 px-4 py-2 text-white font-bold">${table.title || ''}</div>
                        <table class="min-w-full border-collapse text-xs">
                            <thead class="bg-gray-700 text-white">
                                <tr>
                                    <th rowspan="2" class="px-3 py-2 text-left border border-gray-600">Descripción</th>
                                    <th rowspan="2" class="px-3 py-2 text-center border border-gray-600">Símb.</th>
                                    ${headerGroups}
                                </tr>
                                <tr>${headerCols}</tr>
                            </thead>
                            <tbody class="divide-y divide-gray-700 bg-gray-800">${rows}</tbody>
                        </table>
                    </div>
                `;
            },
        };
    }
</script>
