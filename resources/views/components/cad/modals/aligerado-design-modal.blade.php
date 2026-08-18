{{-- resources/views/components/cad/modals/aligerado-design-modal.blade.php
     Resultados de "Diseñar Losa Aligerada" (menú Diseñar). Geometría (Lti) y
     cargas (CM/CV) tomadas directo del modelo — solo B (ancho de vigueta) y
     T (altura total del aligerado) se piden a mano (ver el porqué en
     rcAligeradoDesign.js). cadSystem.openRcAligeradoDesignDialog() dispara
     'open-aligerado-design-modal' con { input } (tramos ya resueltos, sin
     diseñar todavía). El botón "Diseñar" llama a
     cadSystem.rcAligeradoDesignRun({fc,fy,b,t,anchoTributario,frm,frv}), que
     llama al mismo motor Octave (aligerados.m, endpoint /aligerados) que ya
     usa resources/js/adm_aligerados_grafico.js, y dispara
     'rc-aligerado-design-updated' con { results } cuando termina. --}}
<div x-data="aligeradoDesignModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:min(1300px, 96vw); max-height:92vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Diseño de Losa Aligerada (Viguetas)</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200 overflow-auto">
            <p class="text-[11px] text-amber-400 mb-3">
                Tramos (Lti), CM y CV tomados directo de la(s) losa(s) seleccionada(s) y sus cargas asignadas.
                Verifica el resultado con criterio de ingeniería antes de usarlo en producción.
            </p>

            {{-- ================= DATOS DETECTADOS (solo lectura) ================= --}}
            <div class="mb-4 overflow-x-auto rounded-lg border border-gray-700">
                <table class="min-w-full border-collapse text-xs">
                    <thead class="bg-gray-700 text-white">
                        <tr>
                            <th class="px-3 py-2 text-center border border-gray-600">Tramo</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Lti (m)</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Cm (tonf/m²)</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Cv (tonf/m²)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700 bg-gray-800">
                        <template x-for="(t, i) in (input?.tramos || [])" :key="i">
                            <tr>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="i + 1"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="fmt(t.lti)"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="fmt(t.wdi)"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="fmt(t.wvi)"></td>
                            </tr>
                        </template>
                        <tr x-show="!(input?.tramos || []).length">
                            <td colspan="4" class="px-3 py-4 text-center text-gray-500">Sin tramos detectados.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {{-- ================= PARÁMETROS (B/T a mano, resto editable con default) ================= --}}
            <div class="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">f'c (kg/cm²)</label>
                    <input type="number" step="any" x-model.number="form.fc" class="w-full rounded-md bg-gray-700 text-white text-xs px-2 py-1.5">
                </div>
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">fy (kg/cm²)</label>
                    <input type="number" step="any" x-model.number="form.fy" class="w-full rounded-md bg-gray-700 text-white text-xs px-2 py-1.5">
                </div>
                <div>
                    <label class="block text-[11px] text-amber-400 mb-1">B — ancho de vigueta (m)</label>
                    <input type="number" step="any" x-model.number="form.b" class="w-full rounded-md bg-gray-700 text-white text-xs px-2 py-1.5 border border-amber-500/50">
                </div>
                <div>
                    <label class="block text-[11px] text-amber-400 mb-1">T — altura total (m)</label>
                    <input type="number" step="any" x-model.number="form.t" class="w-full rounded-md bg-gray-700 text-white text-xs px-2 py-1.5 border border-amber-500/50">
                </div>
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">Ancho tributario (m)</label>
                    <input type="number" step="any" x-model.number="form.anchoTributario" class="w-full rounded-md bg-gray-700 text-white text-xs px-2 py-1.5">
                </div>
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">Factor rm (CM)</label>
                    <input type="number" step="any" x-model.number="form.frm" class="w-full rounded-md bg-gray-700 text-white text-xs px-2 py-1.5">
                </div>
                <div>
                    <label class="block text-[11px] text-gray-400 mb-1">Factor rv (CV)</label>
                    <input type="number" step="any" x-model.number="form.frv" class="w-full rounded-md bg-gray-700 text-white text-xs px-2 py-1.5">
                </div>
                <div class="flex items-end">
                    <button @click="diseñar()" :disabled="loading"
                            class="w-full rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold py-2">
                        <span x-show="!loading">DISEÑAR</span>
                        <span x-show="loading">Calculando...</span>
                    </button>
                </div>
            </div>

            <p x-show="errorMsg" class="text-[11px] text-red-400 mb-3" x-text="errorMsg"></p>

            {{-- Los siguientes contenedores los llena rcAligeradoRenderDiagrams()
                 (rcAligeradoDesign.js) escribiendo directo a su innerHTML/Plotly —
                 por eso NO van detrás de <template x-if>: deben existir en el DOM
                 desde que el modal abre, aunque queden vacíos hasta diseñar. --}}

            {{-- ================= 1. GEOMETRÍA ================= --}}
            <div class="mb-4 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                <div class="bg-gray-900 px-4 py-2 text-white font-bold">1.- Geometría</div>
                <div class="bg-gray-700/40 px-2 py-2 overflow-x-auto" id="aligerado-viguetas"></div>
            </div>

            {{-- ================= 2. CARGAS MUERTAS ================= --}}
            <div class="mb-4 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                <div class="bg-gray-900 px-4 py-2 text-white font-bold">2.- Cargas Muertas</div>
                <div class="bg-gray-700/40 px-2 py-2 overflow-x-auto" id="aligerado-cargaMuerta"></div>
            </div>

            {{-- ================= 3. CARGAS VIVAS ================= --}}
            <div class="mb-4 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                <div class="bg-gray-900 px-4 py-2 text-white font-bold">3.- Cargas Vivas</div>
                <div class="bg-gray-700/40 px-2 py-2 overflow-x-auto" id="aligerado-cargaViva"></div>
            </div>

            {{-- ================= 4. ANÁLISIS ESTRUCTURAL ================= --}}
            <div class="mb-4 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                <div class="bg-gray-900 px-4 py-2 text-white font-bold">4.- Análisis Estructural</div>
                <div class="bg-gray-700/40 p-2" style="min-height: 320px" id="aligerado-fuerzasCortantes"></div>
                <div class="bg-gray-700/40 p-2" style="min-height: 320px" id="aligerado-momentosFlectores"></div>
            </div>

            {{-- ================= 5. DISEÑO A FLEXIÓN ================= --}}
            <div class="mb-6 overflow-x-auto rounded-lg border border-gray-700 shadow-lg" x-show="results?.T1?.length">
                <div class="bg-gray-900 px-4 py-2 text-white font-bold">5.- Diseño a Flexión</div>
                <table class="min-w-full border-collapse text-xs">
                    <thead class="bg-gray-700 text-white">
                        <tr>
                            <th class="px-3 py-2 text-center border border-gray-600">Tramo</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Estación</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Mu (Tn-m)</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Asd (cm²)</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Asmin (cm²)</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Diámetro</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700 bg-gray-800">
                        <template x-for="(row, i) in (results?.T1 || [])" :key="'t1-'+i">
                            <tr>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="Math.floor(i/3)+1"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="['START','MIDDLE','END'][i%3]"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="fmt(row.Mu)"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="fmt(row.Asd)"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="fmt(row.Asmin)"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="row.diametro"></td>
                            </tr>
                        </template>
                    </tbody>
                </table>
                <div class="bg-gray-700/40 px-2 py-2 overflow-x-auto" id="aligerado-asd"></div>
            </div>

            {{-- ================= 6. DISEÑO A CORTANTE ================= --}}
            <div class="mb-2 overflow-x-auto rounded-lg border border-gray-700 shadow-lg" x-show="results?.T2?.length">
                <div class="bg-gray-900 px-4 py-2 text-white font-bold">6.- Diseño a Cortante</div>
                <table class="min-w-full border-collapse text-xs">
                    <thead class="bg-gray-700 text-white">
                        <tr>
                            <th class="px-3 py-2 text-center border border-gray-600">Tramo</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Estación</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Vu (Tn)</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Vc (Tn)</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Ratio Vu/Vc (%)</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Long. ensanche (m)</th>
                            <th class="px-3 py-2 text-center border border-gray-600">Ancho ensanche (cm)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700 bg-gray-800">
                        <template x-for="(row, i) in (results?.T2 || [])" :key="'t2-'+i">
                            <tr>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="Math.floor(i/2)+1"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="['START','END'][i%2]"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="fmt(row.Vu)"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="fmt(row.Vc)"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700"
                                    :class="row.Ratio &gt;= 100 ? 'text-red-400 font-bold' : 'text-green-400'"
                                    x-text="fmt(row.Ratio)"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="fmt(row.x)"></td>
                                <td class="px-3 py-2 text-center border-r border-gray-700" x-text="fmt(row.b)"></td>
                            </tr>
                        </template>
                    </tbody>
                </table>
                <div class="bg-gray-700/40 px-2 py-2 overflow-x-auto" id="aligerado-vu"></div>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900 rounded-b-lg">
            <button @click="close()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">Cerrar</button>
        </div>
    </div>
</div>

<script>
    function aligeradoDesignModal() {
        return {
            open: false,
            input: null,
            results: null,
            loading: false,
            errorMsg: '',
            form: { fc: 210, fy: 4200, b: 0.10, t: 0.20, anchoTributario: 0.40, frm: 1.4, frv: 1.7 },

            init() {
                window.addEventListener('open-aligerado-design-modal', (e) => {
                    this.input = e.detail?.input || null;
                    this.results = null;
                    this.errorMsg = '';
                    if (this.input?.parametros) {
                        this.form.fc = this.input.parametros.fc || this.form.fc;
                        this.form.fy = this.input.parametros.fy || this.form.fy;
                    }
                    // Limpia diagramas de un diseño anterior (incluidos los divs de
                    // Plotly: Plotly vive importado dentro de rcAligeradoDesign.js, no
                    // en window, pero vaciar el innerHTML ya borra el SVG anterior —
                    // la siguiente corrida los repuebla con Plotly.newPlot igual).
                    [
                        'aligerado-viguetas', 'aligerado-cargaMuerta', 'aligerado-cargaViva',
                        'aligerado-asd', 'aligerado-vu',
                        'aligerado-fuerzasCortantes', 'aligerado-momentosFlectores',
                    ].forEach((id) => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
                    this.open = true;
                });
                window.addEventListener('rc-aligerado-design-updated', (e) => {
                    if (!this.open) return;
                    this.results = e.detail?.results || this.results;
                });
            },

            close() {
                this.open = false;
            },

            fmt(v) {
                const n = parseFloat(v);
                return isNaN(n) ? '-' : n.toFixed(2);
            },

            async diseñar() {
                this.errorMsg = '';
                this.loading = true;
                try {
                    await window.cadSystem?.rcAligeradoDesignRun?.({ ...this.form });
                } catch (err) {
                    this.errorMsg = String(err?.message || err);
                } finally {
                    this.loading = false;
                }
            },
        };
    }
</script>
