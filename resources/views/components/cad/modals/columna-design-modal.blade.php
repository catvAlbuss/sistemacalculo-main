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
                                                        x-model="col.selectedComboId[station]"
                                                        @change="drawInteraction(col)">
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

                            {{-- Diagrama de interacción P-M2-M3 — el equivalente al botón
                                 "Interaction" de ETABS. Los datos ya vienen calculados en
                                 col.surface.curves; el trazado vive en
                                 resources/js/cad/mixins/analysis/columnInteractionChart.js.

                                 Los contenedores de los gráficos van con x-show y NO dentro de
                                 un x-if: Plotly guarda estado en el nodo, así que si el div se
                                 destruye y se recrea en cada toggle quedan instancias huérfanas. --}}
                            <div class="px-4 py-2">
                                <div class="flex items-center gap-3 flex-wrap">
                                    <button @click="toggleInteraction(col)"
                                            class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs">
                                        <span x-text="ciOpen[col.frameId] ? 'Ocultar' : 'Ver'"></span> diagrama de interacción
                                    </button>
                                    <template x-if="ciOpen[col.frameId]">
                                        <div class="flex items-center gap-3 text-[11px] text-gray-400">
                                            <label class="flex items-center gap-1">
                                                Estación:
                                                <select x-model="ciStation[col.frameId]" @change="resetInteractionAngle(col)"
                                                        class="bg-gray-900 border border-gray-600 rounded text-[11px] text-white px-2 py-0.5">
                                                    <option value="base">Base</option>
                                                    <option value="top">Tope</option>
                                                </select>
                                            </label>
                                            <label class="flex items-center gap-1 cursor-pointer">
                                                <input type="checkbox" x-model="ciPhi[col.frameId]" @change="drawInteraction(col)"
                                                       class="rounded bg-gray-900 border-gray-600">
                                                Incluir Φ
                                                <span class="text-gray-600">(ETABS: Include Phi)</span>
                                            </label>
                                        </div>
                                    </template>
                                </div>

                                <div x-show="ciOpen[col.frameId]" class="mt-2">
                                    {{-- Recorrido del ángulo de corte. ETABS salta de curva en curva con
                                         flechas (24 curvas fijas); acá se interpola continuo, así que el
                                         control es un deslizador. Mueve el corte del 3D y la curva del 2D
                                         a la vez. --}}
                                    <div class="flex items-center gap-2 flex-wrap text-[11px] text-gray-400 mb-2">
                                        <span>Ángulo del corte θ:</span>
                                        <input type="range" min="0" max="360" step="0.5"
                                               x-model.number="ciAngle[col.frameId]" @input="drawInteraction(col)"
                                               class="w-40 accent-purple-500">
                                        <input type="number" min="0" max="360" step="0.5"
                                               x-model.number="ciAngle[col.frameId]" @input="drawInteraction(col)"
                                               class="w-16 bg-gray-900 border border-gray-600 rounded text-white px-1 py-0.5 text-[11px]">
                                        <span>°</span>
                                        <button @click="resetInteractionAngle(col)"
                                                class="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-[10px]">
                                            Volver al de la demanda (<span x-text="fmt(demandAngle(col), 1)"></span>°)
                                        </button>
                                        <span x-show="!enAnguloDeDemanda(col)" class="text-amber-400/90 text-[10px]">
                                            — el corte no está en el ángulo de la demanda; el rombo es referencia
                                        </span>
                                    </div>

                                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                                        <div class="lg:col-span-2 rounded border border-gray-700 bg-gray-900"
                                             :id="'ci-plot-' + col.frameId" style="height:380px"></div>
                                        <div class="rounded border border-gray-700 bg-gray-900"
                                             :id="'ci-2d-' + col.frameId" style="height:380px"></div>
                                    </div>

                                    <div class="text-[10px] text-gray-500 mt-1">
                                        Superficie ΦMn de las <span x-text="col.surface.curves?.length || 0"></span> curvas del motor,
                                        truncada arriba por el tope Pn,max = 0.80·Po (ACI 318 Tabla 22.4.2.1) — esa es la meseta plana.
                                        A la derecha, el mismo corte visto de perfil (el "Current Interaction Curve" de ETABS),
                                        con M = momento resultante √(M2²+M3²). La línea punteada desde el origen es el rayo de la demanda.
                                        Compresión positiva, igual que ETABS.
                                    </div>

                                    {{-- Tabla "Curve Data" — los numeros detras del corte dibujado,
                                         mismo formato que la del dialogo de ETABS. Sirve para cruzar
                                         punto por punto contra su tabla. --}}
                                    <details class="mt-2 rounded border border-gray-700 bg-gray-900/60">
                                        <summary class="cursor-pointer px-3 py-1.5 text-[11px] text-blue-300 hover:text-blue-200">
                                            Curve Data — puntos de la curva (<span x-text="curveRows(col).length"></span>)
                                        </summary>
                                        <div class="px-3 pb-2 pt-1">
                                            <div class="flex items-center gap-2 mb-1">
                                                <button @click="copiarCurva(col)"
                                                        class="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-[10px]">
                                                    Copiar como TSV
                                                </button>
                                                <span class="text-[10px] text-gray-500" x-text="copiadoMsg[col.frameId] || 'Se pega directo en Excel, al lado de la tabla de ETABS'"></span>
                                            </div>
                                            <div style="max-height:220px; overflow:auto">
                                                <table class="w-full text-[10px]">
                                                    <thead class="text-gray-500 sticky top-0 bg-gray-900">
                                                        <tr>
                                                            <th class="text-left py-0.5">Punto</th>
                                                            <th class="text-right">P (tonf)</th>
                                                            <th class="text-right">M2 (tonf·m)</th>
                                                            <th class="text-right">M3 (tonf·m)</th>
                                                            <th class="text-right">|M|</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="text-gray-300">
                                                        <template x-for="r in curveRows(col)" :key="r.n">
                                                            <tr class="border-t border-gray-800">
                                                                <td class="py-0.5" x-text="r.n"></td>
                                                                <td class="text-right" x-text="fmt(r.P, 4)"></td>
                                                                <td class="text-right" x-text="fmt(r.M2, 4)"></td>
                                                                <td class="text-right" x-text="fmt(r.M3, 4)"></td>
                                                                <td class="text-right text-gray-500" x-text="fmt(r.M, 4)"></td>
                                                            </tr>
                                                        </template>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p class="text-[9px] text-gray-600 mt-1.5 leading-tight">
                                                Va de compresión pura hacia tracción, como ETABS. Las filas consecutivas
                                                idénticas se colapsan. Los dos extremos son exactos: el primero es
                                                φ·0.80·Po (tope axial) y el último φ·fy·As (tracción pura), los mismos
                                                valores que reporta ETABS. En medio, la resolución la da el barrido:
                                                la esquina de la meseta queda algo redondeada.
                                            </p>
                                        </div>
                                    </details>
                                </div>
                            </div>
                            </div>

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
                                                    <th class="px-2 py-1 text-right">Ve columna (tonf)</th>
                                                    <th class="px-2 py-1 text-right">Ve vigas (tonf)</th>
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
                                                        <td class="px-2 py-1 text-right text-gray-400" x-text="fmt(col.shear[dir.key].veColumn / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right"
                                                            :class="col.shear[dir.key].beamCapApplied ? 'text-green-400 font-semibold' : 'text-gray-500'"
                                                            x-text="col.shear[dir.key].veBeams == null ? '—' : fmt(col.shear[dir.key].veBeams / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right font-semibold" x-text="fmt(col.shear[dir.key].veCapacity / 9806.65, 2)"></td>
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

                                        {{-- El tope por vigas (ACI 318 18.7.6.1.1 in fine) necesita el
                                             armado real de las vigas del nudo. Si ETABS las dejo en
                                             "Reinforcement to be Designed", el .e2k trae ATI/ABI/ATJ/ABJ
                                             en 0: Ve queda gobernado por el Mpr de la COLUMNA, del lado
                                             seguro pero exigiendo mas estribo del necesario. --}}
                                        <div class="px-2 pt-1 pb-1 text-[10px] text-amber-400"
                                             x-show="col.shear?.v2 && col.shear.v2.veBeams == null">
                                            Ve <b>sin tope por vigas</b>: las vigas del nudo no traen armado real
                                            (ETABS las dejo en auto-diseno). El resultado es CONSERVADOR. Para
                                            afinarlo, define el armado de las vigas en ETABS
                                            ("Reinforcement to be Checked") y reimporta el modelo.
                                        </div>

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
            // Estado del diagrama de interacción, por columna (clave: frameId).
            // Alpine 3 usa Proxy, así que agregar claves nuevas sobre la marcha
            // sigue siendo reactivo.
            ciOpen: {},
            ciStation: {},
            ciPhi: {},
            ciAngle: {},
            copiadoMsg: {},
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

                // Idem para el armado de VIGA: cambia el tope por resistencia de vigas
                // (ACI 318 18.7.6.1.1), asi que el Ve de capacidad y el chequeo de
                // estribos de esta misma tabla cambian.
                window.addEventListener('beam-rebar-design-saved', () => {
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

            /** Abre/cierra el diagrama de una columna. */
            toggleInteraction(col) {
                const id = col.frameId;
                if (this.ciOpen[id]) {
                    window.cadSystem?.destroyColumnInteractionSurface?.('ci-plot-' + id);
                    window.cadSystem?.destroyColumnInteractionSurface?.('ci-2d-' + id);
                    this.ciOpen[id] = false;
                    return;
                }
                // Defaults la primera vez: la estación que gobierna, y con Φ.
                if (!this.ciStation[id]) {
                    const rb = col.check?.base?.ratio ?? 0;
                    const rt = col.check?.top?.ratio ?? 0;
                    this.ciStation[id] = rb >= rt ? 'base' : 'top';
                }
                if (this.ciPhi[id] === undefined) this.ciPhi[id] = true;
                if (this.ciAngle[id] === undefined) this.ciAngle[id] = this.demandAngle(col);

                this.ciOpen[id] = true;
                // Plotly MIDE el div para dimensionar la escena: hay que esperar a
                // que x-show lo haya hecho visible o sale de 0x0.
                this.$nextTick(() => this.drawInteraction(col));
            },

            /** Ángulo θ de la demanda de la estación activa (grados). */
            demandAngle(col) {
                const station = this.ciStation[col.frameId] || 'base';
                return Number(this.selectedCheck(col, station)?.thetaDeg) || 0;
            },

            enAnguloDeDemanda(col) {
                const a = Number(this.ciAngle[col.frameId]);
                return !Number.isFinite(a) || Math.abs(a - this.demandAngle(col)) < 0.05;
            },

            /** Devuelve el corte al ángulo de la demanda y redibuja. */
            resetInteractionAngle(col) {
                this.ciAngle[col.frameId] = this.demandAngle(col);
                this.drawInteraction(col);
            },

            /** Filas de la tabla Curve Data del corte actual. */
            curveRows(col) {
                const id = col.frameId;
                if (!this.ciOpen[id]) return [];
                const ang = Number(this.ciAngle[id]);
                return window.cadSystem?.columnInteractionCurveRows?.(
                    col.surface?.curves || [],
                    Number.isFinite(ang) ? ang : this.demandAngle(col),
                    this.ciPhi[id] !== false,
                ) || [];
            },

            async copiarCurva(col) {
                const id = col.frameId;
                const rows = this.curveRows(col);
                if (!rows.length) return;
                const ang = Number(this.ciAngle[id]);
                const tsv = window.cadSystem?.columnInteractionCurveTsv?.(
                    rows, Number.isFinite(ang) ? ang : this.demandAngle(col)) || '';
                try {
                    await navigator.clipboard.writeText(tsv);
                    this.copiadoMsg[id] = '✅ Copiado';
                } catch (e) {
                    this.copiadoMsg[id] = 'No se pudo copiar — el navegador bloqueó el portapapeles';
                }
                setTimeout(() => { this.copiadoMsg[id] = ''; }, 2500);
            },

            /** Redibuja las DOS vistas con la estación/combo/Φ/ángulo actuales. */
            drawInteraction(col) {
                const id = col.frameId;
                if (!this.ciOpen[id]) return;
                const station = this.ciStation[id] || 'base';
                const check = this.selectedCheck(col, station);
                const curves = col.surface?.curves || [];
                const opts = { usePhi: this.ciPhi[id] !== false, cutAngleDeg: this.ciAngle[id] };

                window.cadSystem?.renderColumnInteractionSurface?.('ci-plot-' + id, curves, check, opts);
                window.cadSystem?.renderColumnInteraction2D?.('ci-2d-' + id, curves, check, opts);
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
