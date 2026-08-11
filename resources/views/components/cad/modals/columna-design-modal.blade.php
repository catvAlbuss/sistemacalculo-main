{{-- resources/views/components/cad/modals/columna-design-modal.blade.php
     Resultados de "Diseñar Columna(s) Seleccionada(s)". Solo columnas
     rectangulares con armado real parseado del .e2k (PATTERN "R-n2-n3") —
     ver plan de columnas. cadSystem.openRcColumnDesignDialog() dispara
     'open-columna-design-modal' con { columns: [...] } (ver
     resources/js/cad/mixins/analysis/rcColumnDesign.js). --}}
<div x-data="columnaDesignModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:min(1100px, 96vw); max-height:92vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Diseño de Columnas de Concreto Armado (ACI-318)</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200 overflow-auto">
            <p class="text-[11px] text-gray-400 mb-3">
                Verificación biaxial calculada por el método de fibra (ACI-318) exactamente en el ángulo real de cada punto de
                demanda (sin interpolación entre curvas). Solo columnas rectangulares con armado real parseado del .e2k. Verifica
                siempre con criterio de ingeniería.
            </p>

            <template x-for="col in columns" :key="col.frameId">
                <div class="mb-6 rounded-lg border border-gray-700 overflow-hidden">
                    <div class="bg-gray-900 px-4 py-2 text-white font-bold flex items-center justify-between">
                        <span x-text="col.label"></span>
                        <span x-show="!col.unsupported"
                              :class="overallStatus(col) === 'OK' ? 'text-green-400' : 'text-red-400'"
                              x-text="overallStatus(col)"></span>
                    </div>

                    <template x-if="col.unsupported">
                        <div class="px-4 py-3 text-amber-400 text-xs bg-gray-800">
                            No soportada: <span x-text="col.unsupportedReason"></span>
                        </div>
                    </template>

                    <template x-if="!col.unsupported">
                        <div class="bg-gray-800 divide-y divide-gray-700">
                            {{-- Geometría + armado --}}
                            <div class="px-4 py-2 grid grid-cols-3 gap-2 text-xs">
                                <div><span class="text-gray-400">b × h:</span> <b x-text="col.geometryDisplay.b + ' × ' + col.geometryDisplay.h + ' cm'"></b></div>
                                <div><span class="text-gray-400">f'c / fy:</span> <b x-text="col.geometryDisplay.fc + ' / ' + col.geometryDisplay.fy + ' kg/cm²'"></b></div>
                                <div><span class="text-gray-400">Recub.:</span> <b x-text="col.geometryDisplay.cover + ' cm'"></b></div>
                                <div><span class="text-gray-400">Patrón:</span> <b x-text="'R-' + col.geometryDisplay.pattern.n3 + '-' + col.geometryDisplay.pattern.n2"></b></div>
                                <div><span class="text-gray-400">Varillas:</span> <b x-text="col.surface.bars.length + ' Ø' + fmt(col.geometryDisplay.longBarDiameter * 1000, 1) + 'mm'"></b></div>
                                <div><span class="text-gray-400">β1:</span> <b x-text="fmt(col.surface.beta1, 2)"></b></div>
                            </div>

                            {{-- Demanda + verificación, base y tope. El combo es seleccionable — por
                                 defecto el gobernante (mayor ratio), pero se puede elegir cualquier
                                 otro combo real para comparar puntualmente contra ETABS. --}}
                            <table class="min-w-full text-xs">
                                <thead class="bg-gray-700 text-white">
                                    <tr>
                                        <th class="px-2 py-1 text-left">Estación</th>
                                        <th class="px-2 py-1 text-left">Combo</th>
                                        <th class="px-2 py-1 text-right">Pu (tonf)</th>
                                        <th class="px-2 py-1 text-right">M2u (tonf-m)</th>
                                        <th class="px-2 py-1 text-right">M3u (tonf-m)</th>
                                        <th class="px-2 py-1 text-right">θ demanda</th>
                                        <th class="px-2 py-1 text-right">ФMn cap. (tonf-m)</th>
                                        <th class="px-2 py-1 text-right">Ratio</th>
                                        <th class="px-2 py-1 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="station in ['base','top']" :key="station">
                                        <tr class="border-t border-gray-700">
                                            <td class="px-2 py-1" x-text="station === 'base' ? 'Base' : 'Tope'"></td>
                                            <td class="px-1 py-1">
                                                <select class="bg-gray-900 border border-gray-600 rounded text-[11px] text-gray-200 px-1 py-0.5 max-w-[220px]"
                                                        x-model="col.selectedComboId[station]">
                                                    <template x-for="opt in col.checksAll[station]" :key="opt.comboId">
                                                        <option :value="opt.comboId"
                                                                x-text="(opt.comboId === col.check[station]?.comboId ? '★ ' : '') + opt.comboName + ' (' + fmt(opt.ratio, 2) + ')'">
                                                        </option>
                                                    </template>
                                                </select>
                                            </td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.P / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.M2 / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.M3 / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.thetaDeg, 1) + '°'"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.phiMnCap / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.ratio, 2)"></td>
                                            <td class="px-2 py-1 text-center font-bold"
                                                :class="selectedCheck(col, station)?.status === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                x-text="selectedCheck(col, station)?.status || '—'"></td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                            <div class="px-2 pb-1 text-[10px] text-gray-500">★ = combo gobernante (mayor ratio, el que se usa para el estado OK/NG del encabezado).</div>

                            {{-- Corte por capacidad + confinamiento --}}
                            <div class="px-4 py-2">
                                <div class="text-xs font-semibold text-gray-300 mb-1">
                                    Corte por capacidad + confinamiento (ACI 318 §18.7.6 / §18.7.5)
                                </div>

                                <template x-if="col.shearInput?.unsupported">
                                    <div class="text-amber-400 text-xs" x-text="col.shearInput.unsupportedReason"></div>
                                </template>

                                <template x-if="col.shearInput && !col.shearInput.unsupported && !col.shear">
                                    <div class="text-gray-400 text-xs">Calculando...</div>
                                </template>

                                <template x-if="col.shear?.unsupported">
                                    <div class="text-amber-400 text-xs" x-text="col.shear.unsupportedReason"></div>
                                </template>

                                <template x-if="col.shear && !col.shear.unsupported">
                                    <div>
                                        <table class="min-w-full text-xs mb-2">
                                            <thead class="bg-gray-700 text-white">
                                                <tr>
                                                    <th class="px-2 py-1 text-left">Dirección</th>
                                                    <th class="px-2 py-1 text-right">Mpr (tonf-m)</th>
                                                    <th class="px-2 py-1 text-right">Ve capacidad (tonf)</th>
                                                    <th class="px-2 py-1 text-right">Ve análisis (tonf)</th>
                                                    <th class="px-2 py-1 text-right">Ve (tonf)</th>
                                                    <th class="px-2 py-1 text-right">ΦVc (tonf)</th>
                                                    <th class="px-2 py-1 text-right">ΦVs provisto (tonf)</th>
                                                    <th class="px-2 py-1 text-right">Ratio</th>
                                                    <th class="px-2 py-1 text-center">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <template x-for="dir in [{key:'shearV2', label:'V2 (↔ M3)'}, {key:'shearV3', label:'V3 (↔ M2)'}]" :key="dir.key">
                                                    <tr class="border-t border-gray-700">
                                                        <td class="px-2 py-1" x-text="dir.label"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear[dir.key].mpr / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear[dir.key].veCapacity / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear[dir.key].veAnalysis / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear[dir.key].ve / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right"
                                                            x-text="col.shear[dir.key].vcZero ? '0 (Φ𝑉𝑐=0)' : fmt(col.shear[dir.key].vc * 0.75 / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear[dir.key].vsProvided * 0.75 / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear[dir.key].ratio, 2)"></td>
                                                        <td class="px-2 py-1 text-center font-bold"
                                                            :class="col.shear[dir.key].status === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                            x-text="col.shear[dir.key].status"></td>
                                                    </tr>
                                                </template>
                                            </tbody>
                                        </table>

                                        <table class="min-w-full text-xs">
                                            <thead class="bg-gray-700 text-white">
                                                <tr>
                                                    <th class="px-2 py-1 text-left">Confinamiento (zona Lo, ambos extremos)</th>
                                                    <th class="px-2 py-1 text-right">Requerido</th>
                                                    <th class="px-2 py-1 text-right">Provisto</th>
                                                    <th class="px-2 py-1 text-center">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr class="border-t border-gray-700">
                                                    <td class="px-2 py-1">Espaciamiento máx. (cm)</td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.soMax * 100, 1)"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.spacingProvided * 100, 1)"></td>
                                                    <td class="px-2 py-1 text-center font-bold"
                                                        :class="col.shear.confinement.spacingStatus === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                        x-text="col.shear.confinement.spacingStatus"></td>
                                                </tr>
                                                <tr class="border-t border-gray-700">
                                                    <td class="px-2 py-1">Ash/s dir. 2 (cm²/cm)</td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.ashOverSReq2 * 100, 3)"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.ashOverSProv2 * 100, 3)"></td>
                                                    <td class="px-2 py-1 text-center font-bold"
                                                        :class="col.shear.confinement.ashStatus2 === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                        x-text="col.shear.confinement.ashStatus2"></td>
                                                </tr>
                                                <tr class="border-t border-gray-700">
                                                    <td class="px-2 py-1">Ash/s dir. 3 (cm²/cm)</td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.ashOverSReq3 * 100, 3)"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.ashOverSProv3 * 100, 3)"></td>
                                                    <td class="px-2 py-1 text-center font-bold"
                                                        :class="col.shear.confinement.ashStatus3 === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                        x-text="col.shear.confinement.ashStatus3"></td>
                                                </tr>
                                                <tr class="border-t border-gray-700">
                                                    <td class="px-2 py-1 text-gray-400" colspan="4">
                                                        Longitud de confinamiento Lo: <b x-text="fmt(col.shear.confinement.lo * 100, 0) + ' cm desde cada nudo'"></b>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Cerrar</button>
        </div>
    </div>
</div>

<script>
    function columnaDesignModal() {
        return {
            open: false,
            columns: [],

            init() {
                window.addEventListener('open-columna-design-modal', (e) => {
                    this.columns = e.detail?.columns || [];
                    this.open = true;
                });
            },

            close() {
                this.open = false;
            },

            fmt(value, decimals = 2) {
                const n = Number(value);
                return Number.isFinite(n) ? n.toFixed(decimals) : '-';
            },

            overallStatus(col) {
                if (col.unsupported) return '';
                const base = col.check?.base?.status;
                const top = col.check?.top?.status;
                return base === 'OK' && top === 'OK' ? 'OK' : 'NG';
            },

            /** El check del combo actualmente seleccionado en el <select> de esa estación (por defecto, el gobernante). */
            selectedCheck(col, station) {
                const id = col.selectedComboId?.[station];
                return (col.checksAll?.[station] || []).find((c) => c.comboId === id) || col.check?.[station];
            },
        };
    }
</script>
