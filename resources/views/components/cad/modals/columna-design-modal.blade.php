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
            <h3 class="text-sm font-semibold text-white">
                Diseño de Columnas de Concreto Armado
                <span class="text-[11px] font-normal text-blue-300"
                      x-text="code === 'ACI318' ? '(ACI 318)' : '(E.060)'"></span>
            </h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200 overflow-auto">
            {{-- Selector de codigo: cambia los factores de reduccion φ Y su ley de
                 transicion (ver PHI_BY_CODE / _phi_factor_e060 en
                 python-backend/design/column_interaction.py). Re-corre el motor. --}}
            <div class="mb-3 flex items-center gap-3 rounded-md bg-gray-900/60 border border-gray-700 px-3 py-2">
                <span class="text-[11px] text-gray-400 shrink-0">Código de diseño:</span>
                <div class="flex gap-1">
                    <button @click="cambiarCodigo('E060')" :disabled="recalculando"
                            :class="code === 'E060' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
                            class="px-3 py-1 rounded text-[11px] font-semibold disabled:opacity-50">
                        E.060 (Perú)
                    </button>
                    <button @click="cambiarCodigo('ACI318')" :disabled="recalculando"
                            :class="code === 'ACI318' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
                            class="px-3 py-1 rounded text-[11px] font-semibold disabled:opacity-50">
                        ACI 318
                    </button>
                </div>
                <span class="text-[10px] text-gray-500"
                      x-text="code === 'ACI318'
                        ? 'φ compresión 0.65 (estribos) · cortante 0.75 · transición por deformación del acero'
                        : 'φ compresión 0.70 (estribos) · cortante 0.85 · transición por carga axial (Art. 10.3.2)'"></span>
                <span x-show="recalculando" class="text-[10px] text-amber-400 ml-auto shrink-0">Recalculando…</span>
            </div>

            <p class="text-[11px] text-gray-400 mb-3">
                Verificación biaxial calculada por el método de fibra exactamente en el ángulo real de cada punto de
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
                        <div class="px-4 py-3 bg-gray-800">
                            <div class="text-amber-400 text-xs mb-2">
                                No soportada: <span x-text="col.unsupportedReason"></span>
                            </div>
                            <template x-if="col.sectionName && col.b > 0 && col.h > 0">
                                <button @click="defineRebar(col)"
                                        class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs">
                                    Definir armado de la sección "<span x-text="col.sectionName"></span>"...
                                </button>
                            </template>
                        </div>
                    </template>

                    <template x-if="!col.unsupported">
                        <div class="bg-gray-800 divide-y divide-gray-700">
                            {{-- Geometría + armado --}}
                            <div class="px-4 py-2 grid grid-cols-3 gap-2 text-xs">
                                <div><span class="text-gray-400">b × h:</span> <b x-text="col.geometryDisplay.b + ' × ' + col.geometryDisplay.h + ' cm'"></b></div>
                                <div><span class="text-gray-400">f'c / fy:</span> <b x-text="col.geometryDisplay.fc + ' / ' + col.geometryDisplay.fy + ' kg/cm²'"></b></div>
                                <div><span class="text-gray-400">Recub.:</span> <b x-text="col.geometryDisplay.cover + ' cm'"></b></div>
                                <div><span class="text-gray-400">Patrón:</span> <b x-text="'R-' + col.geometryDisplay.pattern.n2 + '-' + col.geometryDisplay.pattern.n3"></b>
                                    <span class="text-[10px] text-gray-500">(n2=<span x-text="col.geometryDisplay.pattern.n2"></span> cara 2, n3=<span x-text="col.geometryDisplay.pattern.n3"></span> cara 3 — mismo orden que ETABS)</span></div>
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
                                                                x-text="(opt.comboId === col.check[station]?.comboId ? '★ ' : '') + opt.comboName + ' (' + fmt(opt.ratio, 3) + ')'">
                                                        </option>
                                                    </template>
                                                </select>
                                            </td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.P / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.M2 / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.M3 / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.thetaDeg, 1) + '°'"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.phiMnCap / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right font-semibold" x-text="fmt(selectedCheck(col, station)?.ratio, 3)"></td>
                                            <td class="px-2 py-1 text-center font-bold"
                                                :class="selectedCheck(col, station)?.status === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                x-text="selectedCheck(col, station)?.status || '—'"></td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                            <div class="px-2 pb-1 text-[10px] text-gray-500">★ = combo gobernante (mayor ratio, el que se usa para el estado OK/NG del encabezado).</div>

                            {{-- Esbeltez / magnificacion de momentos (E.060 10.12) — solo del
                                 combo gobernante de cada estacion; el detalle por combo viaja
                                 igual en check.slenderness. --}}
                            <template x-for="station in ['base','top']" :key="'sl-'+station">
                                <div class="px-4 py-2" x-show="slenderInfo(col, station)">
                                    <div class="text-xs font-semibold text-gray-300 mb-1">
                                        Esbeltez — <span x-text="station === 'base' ? 'base' : 'tope'"></span>
                                        <span class="font-normal text-gray-500">(E.060 Art. 10.12, pórtico arriostrado)</span>
                                    </div>
                                    <table class="w-full text-[11px] border border-gray-700">
                                        <thead class="bg-gray-700 text-white">
                                            <tr>
                                                <th class="px-2 py-1 text-left">Eje</th>
                                                <th class="px-2 py-1 text-right">k·Lu/r</th>
                                                <th class="px-2 py-1 text-right">Límite</th>
                                                <th class="px-2 py-1 text-center">¿Esbelta?</th>
                                                <th class="px-2 py-1 text-right">Cm</th>
                                                <th class="px-2 py-1 text-right">Pc (tonf)</th>
                                                <th class="px-2 py-1 text-right">δns</th>
                                                <th class="px-2 py-1 text-right">M análisis</th>
                                                <th class="px-2 py-1 text-right">M diseño</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <template x-for="eje in ['M2','M3']" :key="'sl-'+station+eje">
                                                <tr class="border-t border-gray-700" x-show="slenderInfo(col, station)?.[eje]">
                                                    <td class="px-2 py-1" x-text="eje"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(slenderInfo(col, station)?.[eje]?.slendernessRatio, 1)"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(slenderInfo(col, station)?.[eje]?.slendernessLimit, 1)"></td>
                                                    <td class="px-2 py-1 text-center"
                                                        :class="slenderInfo(col, station)?.[eje]?.isSlender ? 'text-amber-400 font-semibold' : 'text-gray-500'"
                                                        x-text="slenderInfo(col, station)?.[eje]?.isSlender ? 'Sí' : 'No'"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(slenderInfo(col, station)?.[eje]?.cm, 3)"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmtTon(slenderInfo(col, station)?.[eje]?.pc)"></td>
                                                    <td class="px-2 py-1 text-right"
                                                        :class="slenderInfo(col, station)?.[eje]?.unstable ? 'text-red-400 font-bold' : ''"
                                                        x-text="slenderInfo(col, station)?.[eje]?.unstable ? 'INESTABLE' : fmt(slenderInfo(col, station)?.[eje]?.deltaNs, 3)"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmtTonM(slenderInfo(col, station)?.[eje]?.m2)"></td>
                                                    <td class="px-2 py-1 text-right font-semibold" x-text="fmtTonM(slenderInfo(col, station)?.[eje]?.mc)"></td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                    <div class="px-2 pt-1 text-[10px] text-gray-500"
                                         x-show="slenderInfo(col, station)?.M3?.unstable || slenderInfo(col, station)?.M2?.unstable">
                                        ⚠️ Pu ≥ 0.75·Pc: la columna es inestable por pandeo — no hay magnificador finito. Aumenta la sección o reduce la altura libre.
                                    </div>
                                </div>
                            </template>

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
            // Codigo de diseno activo — lo resuelve el mixin (rcDesignCode);
            // este modal solo lo refleja y lo cambia via rcSetDesignCode().
            code: 'E060',
            recalculando: false,

            init() {
                window.addEventListener('open-columna-design-modal', (e) => {
                    this.columns = e.detail?.columns || [];
                    if (e.detail?.code) this.code = e.detail.code;
                    this.recalculando = false;
                    this.open = true;
                });

                // Al guardar un armado manual (ver column-rebar-designer-modal.blade.php),
                // re-corre el diseño para las columnas ya seleccionadas, para que esta
                // tabla se refresque sola sin que el usuario tenga que recordar hacerlo.
                window.addEventListener('column-rebar-design-saved', () => {
                    if (this.open) window.cadSystem?.openRcColumnDesignDialog?.();
                });
            },

            /**
             * Cambia el codigo de diseno (E.060 / ACI 318) y re-corre el
             * calculo — los factores phi viven en el motor Python, asi que
             * hay que volver a pedirle la superficie y los ratios.
             */
            async cambiarCodigo(nuevo) {
                if (nuevo === this.code || this.recalculando) return;
                this.recalculando = true;
                try {
                    await window.cadSystem?.rcSetDesignCode?.(nuevo);
                } finally {
                    this.recalculando = false;
                }
            },

            /** Abre el diseñador de armado a mano para la SECCIÓN de esta columna (aplica a toda columna que la use). */
            defineRebar(col) {
                window.cadSystem?.openColumnRebarDesigner?.(col.sectionName, { b: col.b, h: col.h, label: col.sectionName });
            },

            close() {
                this.open = false;
            },

            fmt(value, decimals = 2) {
                const n = Number(value);
                return Number.isFinite(n) ? n.toFixed(decimals) : '-';
            },

            /** N -> tonf (el motor trabaja en SI). */
            fmtTon(value) {
                const n = Number(value);
                return Number.isFinite(n) ? (n / 9806.65).toFixed(1) : '-';
            },

            /** N*m -> tonf*m. */
            fmtTonM(value) {
                const n = Number(value);
                return Number.isFinite(n) ? (n / 9806.65).toFixed(2) : '-';
            },

            /**
             * Detalle de esbeltez ({M2, M3}) del combo SELECCIONADO en esa
             * estacion — null si el motor no la calculo (columna sin Ec/Lu,
             * o esbeltez desactivada), y ahi la tabla no se muestra.
             */
            slenderInfo(col, station) {
                return this.selectedCheck(col, station)?.slenderness || null;
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
