{{-- resources/views/components/cad/modals/beam-rebar-designer-modal.blade.php
     Definición del ARMADO LONGITUDINAL DE VIGA por NOMBRE DE SECCIÓN, para
     alimentar el tope por resistencia de vigas del corte de columnas
     (ACI 318 §18.7.6.1.1 in fine — ver design/column_shear.py).

     Por qué existe: ETABS DISEÑA las vigas (no ofrece "Reinforcement to be
     Checked" para ellas, solo para columnas), así que un .e2k normal exporta
     ATI/ABI/ATJ/ABJ = 0 y no hay armado de viga que importar. Este modal es la
     vía para cargarlo — la fuente natural es la tabla de ETABS
     "Concrete Beam Design Summary" (columnas AsTop / AsBot, en mm²).

     cadSystem.openBeamRebarDesigner(sectionName, hint) dispara
     'open-beam-rebar-designer-modal'; al guardar llama a
     cadSystem.saveBeamRebarDesign(...), que dispara 'beam-rebar-design-saved'.
     Ver resources/js/cad/mixins/analysis/beamRebarDesigner.js. --}}
<div x-data="beamRebarDesignerModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:min(760px, 96vw); max-height:92vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Definir armado de viga — <span x-text="label"></span></h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200 overflow-auto">
            <p class="text-[11px] text-gray-400 mb-2">
                Acero longitudinal de la sección "<span x-text="sectionName"></span>"
                (<span x-text="b"></span>×<span x-text="h"></span> cm, f'c=<span x-text="fc"></span>,
                fy=<span x-text="fy"></span> kg/cm²). Aplica a toda viga que use esta propiedad.
            </p>

            <details class="mb-3 rounded border border-gray-700 bg-gray-900/60">
                <summary class="cursor-pointer px-3 py-1.5 text-[11px] text-blue-300 hover:text-blue-200">
                    ¿De dónde saco estos valores? / ¿Para qué sirven?
                </summary>
                <div class="px-3 pb-2 pt-1 text-[10px] text-gray-400 leading-relaxed space-y-1.5">
                    <p>
                        <b class="text-gray-300">De dónde:</b> en ETABS, <em>Display &gt; Show Tables &gt; Design &gt;
                        Concrete Frame Design &gt; Concrete Beam Design Summary</em>. Las columnas
                        <b>AsTop</b> y <b>AsBot</b> traen el acero que ETABS diseñó, en mm². Se toma el mayor
                        de las estaciones cercanas a cada extremo (I = inicio, J = final de la viga).
                    </p>
                    <p>
                        <b class="text-gray-300">Para qué:</b> el corte de diseño Ve de las columnas
                        (ACI 318 §18.7.6.1.1) no necesita exceder el que puede transmitir el nudo según el
                        Mpr de las <b>vigas</b> que llegan a él. Una columna suele ser bastante más fuerte que
                        sus vigas, así que sin este dato el Ve sale del orden de 2-3× el que reporta ETABS y
                        pide mucho más estribo del necesario.
                    </p>
                    <p class="text-amber-400/90">
                        No afecta al diseño a flexión de la viga (ese se calcula solo, en Diseñar &gt; Diseñar
                        Viga). Este dato solo alimenta el tope del corte de columnas.
                    </p>
                </div>
            </details>

            <div class="grid grid-cols-2 gap-4">
                {{-- Formulario --}}
                <div class="space-y-2">
                    <label class="block text-xs text-gray-400">Recubrimiento al centroide del acero (cm)
                        <span class="block text-[9px] text-gray-600 leading-tight">ETABS: Cover to Longitudinal Rebar Center (COVERTOP)</span>
                        <input type="number" step="0.5" min="1" x-model.number="draft.cover"
                               class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                    </label>
                    <div class="text-[10px] text-gray-500">d = h − recubrimiento = <span class="text-gray-300" x-text="dCm()"></span> cm</div>

                    <div class="flex items-center gap-2 pt-1">
                        <input type="checkbox" id="beamRebarSameEnds" x-model="sameEnds" @change="if(sameEnds) syncEnds()"
                               class="rounded bg-gray-900 border-gray-600">
                        <label for="beamRebarSameEnds" class="text-[11px] text-gray-400 cursor-pointer">
                            Mismo armado en ambos extremos
                        </label>
                    </div>

                    <div class="border-t border-gray-700 pt-2">
                        <div class="text-xs font-semibold text-gray-300 mb-1">Extremo I (inicio)</div>
                        <div class="grid grid-cols-2 gap-2">
                            <label class="text-xs text-gray-400">As superior (cm²)
                                <input type="number" step="0.01" min="0" x-model.number="draft.asTopI" @input="if(sameEnds) syncEnds()"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                <span class="block text-[9px] text-gray-600" x-text="mm2(draft.asTopI)"></span>
                            </label>
                            <label class="text-xs text-gray-400">As inferior (cm²)
                                <input type="number" step="0.01" min="0" x-model.number="draft.asBotI" @input="if(sameEnds) syncEnds()"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                <span class="block text-[9px] text-gray-600" x-text="mm2(draft.asBotI)"></span>
                            </label>
                        </div>
                    </div>

                    <div :class="sameEnds ? 'opacity-40 pointer-events-none' : ''">
                        <div class="text-xs font-semibold text-gray-300 mb-1 mt-2">Extremo J (final)</div>
                        <div class="grid grid-cols-2 gap-2">
                            <label class="text-xs text-gray-400">As superior (cm²)
                                <input type="number" step="0.01" min="0" x-model.number="draft.asTopJ"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                <span class="block text-[9px] text-gray-600" x-text="mm2(draft.asTopJ)"></span>
                            </label>
                            <label class="text-xs text-gray-400">As inferior (cm²)
                                <input type="number" step="0.01" min="0" x-model.number="draft.asBotJ"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                <span class="block text-[9px] text-gray-600" x-text="mm2(draft.asBotJ)"></span>
                            </label>
                        </div>
                    </div>

                    <button @click="usarAsMin()"
                            class="mt-2 w-full px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs">
                        Usar acero mínimo (<span x-text="asMinCm2().toFixed(2)"></span> cm² — <span x-text="code"></span>)
                    </button>
                    <div class="text-[10px] text-gray-500 leading-tight">
                        Es el caso más común: si en la tabla de ETABS ves <b>AsTop = AsMinTop</b> y
                        <b>AsBot = AsMinBot</b>, la viga quedó al mínimo y este botón carga exactamente eso.
                        <span class="block mt-0.5">
                            E.060 = <span class="text-gray-300" x-text="asMinPorCodigo('E060').toFixed(2)"></span> cm²
                            &nbsp;·&nbsp;
                            ACI 318 = <span class="text-gray-300" x-text="asMinPorCodigo('ACI318').toFixed(2)"></span> cm²
                            <span class="text-gray-600">— difieren porque ACI agrega el término 14/fy·bw·d, que suele gobernar.
                            Si comparas contra ETABS, usa el mismo código que tenga el modelo allá.</span>
                        </span>
                    </div>

                    <template x-if="cuantiaFueraDeRango()">
                        <div class="text-amber-400 text-[11px] mt-1">
                            Cuantía ρ = <span x-text="cuantiaMaxPct()"></span>% — fuera del rango usual de vigas
                            (0.3% a 2.5%). Revisa las unidades: los valores van en cm², no en mm².
                        </div>
                    </template>
                </div>

                {{-- Vista previa: elevación de la viga + Mpr resultante por extremo --}}
                <div class="space-y-2">
                    <div class="flex items-center justify-center bg-gray-900 rounded border border-gray-700 p-2"
                         style="min-height:150px" x-html="svgMarkup()"></div>

                    <div class="rounded border border-gray-700 bg-gray-900/60 p-2">
                        <div class="text-[11px] font-semibold text-gray-300 mb-1">Momento probable Mpr resultante</div>
                        <table class="w-full text-[10px] text-gray-400">
                            <thead class="text-gray-500">
                                <tr><th class="text-left py-0.5">Extremo</th><th class="text-right">As gobernante</th><th class="text-right">Mpr</th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="py-0.5">I</td>
                                    <td class="text-right text-gray-300" x-text="asGobI().toFixed(2) + ' cm²'"></td>
                                    <td class="text-right text-gray-300" x-text="mprTonM('I') + ' t·m'"></td>
                                </tr>
                                <tr>
                                    <td class="py-0.5">J</td>
                                    <td class="text-right text-gray-300" x-text="asGobJ().toFixed(2) + ' cm²'"></td>
                                    <td class="text-right text-gray-300" x-text="mprTonM('J') + ' t·m'"></td>
                                </tr>
                            </tbody>
                        </table>
                        <p class="text-[9px] text-gray-600 mt-1.5 leading-tight">
                            Mpr usa fy probable = 1.25·fy y φ=1 (ACI 318 §18.7.6.1.1 / E.060 21.4.5.1).
                            Se toma el MAYOR entre acero superior e inferior porque el sismo invierte el signo
                            del momento.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Cancelar</button>
            <button @click="save()" :disabled="!valid()"
                    class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded text-sm">
                Guardar armado
            </button>
        </div>
    </div>
</div>

<script>
    function beamRebarDesignerModal() {
        return {
            open: false,
            sectionName: null,
            label: '',
            b: 30,
            h: 60,
            fc: 210,
            fy: 4200,
            code: 'E060',
            sameEnds: true,
            // Nunca vacío: el nodo existe en el DOM desde que Alpine arranca y
            // svgMarkup()/mprTonM() se evalúan antes del primer open (mismo
            // motivo documentado en column-rebar-designer-modal.blade.php).
            draft: { cover: 6, asTopI: 0, asBotI: 0, asTopJ: 0, asBotJ: 0 },

            init() {
                window.addEventListener('open-beam-rebar-designer-modal', (e) => {
                    const d = e.detail || {};
                    this.sectionName = d.sectionName ?? null;
                    this.label = d.label || this.sectionName || 'sección';
                    this.b = Number(d.b) || 30;
                    this.h = Number(d.h) || 60;
                    this.fc = Number(d.fc) || 210;
                    this.fy = Number(d.fy) || 4200;
                    this.code = d.code || 'E060';
                    this.draft = { ...(d.draft || {}) };
                    this.sameEnds =
                        this.draft.asTopI === this.draft.asTopJ && this.draft.asBotI === this.draft.asBotJ;
                    this.open = true;
                });
            },

            close() { this.open = false; },

            syncEnds() {
                this.draft.asTopJ = this.draft.asTopI;
                this.draft.asBotJ = this.draft.asBotI;
            },

            /** Equivalencia en mm² — así se lee la tabla de ETABS sin convertir a mano. */
            mm2(cm2) {
                const v = Number(cm2) || 0;
                return v > 0 ? '= ' + Math.round(v * 100) + ' mm²' : '';
            },

            dCm() {
                return ((Number(this.h) || 0) - (Number(this.draft.cover) || 0)).toFixed(1);
            },

            asMinPorCodigo(code) {
                return window.cadSystem?.beamRebarAsMinCm2?.({
                    b: this.b, h: this.h, cover: this.draft.cover, fc: this.fc, fy: this.fy, code,
                }) || 0;
            },

            asMinCm2() { return this.asMinPorCodigo(this.code); },

            usarAsMin() {
                const v = Math.round(this.asMinCm2() * 100) / 100;
                this.draft.asTopI = v;
                this.draft.asBotI = v;
                this.draft.asTopJ = v;
                this.draft.asBotJ = v;
            },

            asGobI() { return Math.max(Number(this.draft.asTopI) || 0, Number(this.draft.asBotI) || 0); },
            asGobJ() { return Math.max(Number(this.draft.asTopJ) || 0, Number(this.draft.asBotJ) || 0); },

            /** Mpr en t·m para el extremo pedido — misma fórmula que usa el motor. */
            mprTonM(extremo) {
                const as = extremo === 'I' ? this.asGobI() : this.asGobJ();
                const nm = window.cadSystem?._beamMprNm?.({
                    asM2: as * 1e-4,
                    bCm: this.b,
                    hCm: this.h,
                    coverCm: this.draft.cover,
                    fc: this.fc,
                    fy: this.fy,
                }) || 0;
                return (nm / 9806.65).toFixed(2); // N·m -> tonf·m
            },

            cuantiaMaxPct() {
                const ag = (Number(this.b) || 0) * ((Number(this.h) || 0) - (Number(this.draft.cover) || 0));
                if (!(ag > 0)) return '0.00';
                return ((Math.max(this.asGobI(), this.asGobJ()) / ag) * 100).toFixed(2);
            },

            cuantiaFueraDeRango() {
                const rho = parseFloat(this.cuantiaMaxPct());
                return Number.isFinite(rho) && rho > 0 && (rho < 0.3 || rho > 2.5);
            },

            valid() {
                const areas = [this.draft.asTopI, this.draft.asBotI, this.draft.asTopJ, this.draft.asBotJ];
                return areas.some((v) => Number(v) > 0) && Number(this.draft.cover) > 0;
            },

            /** Elevación esquemática: capas de acero arriba/abajo en cada extremo, grosor proporcional al As. */
            svgMarkup() {
                const h = Number(this.h) || 0;
                const cover = Number(this.draft.cover) || 0;
                if (!(h > 0)) return '';

                const L = h * 4; // largo ficticio, solo para que la elevación se lea
                const asMax = Math.max(this.asGobI(), this.asGobJ(), 0.01);
                // Grosor de la barra dibujada, acotado para que un As chico siga viéndose.
                const gr = (as) => Math.max((Number(as) || 0) / asMax, 0) * (h * 0.05) + (Number(as) > 0 ? h * 0.012 : 0);

                const yTop = -h / 2 + cover;
                const yBot = h / 2 - cover;
                const mitad = L / 2;

                const capa = (x, w, y, as, color) => {
                    const t = gr(as);
                    if (!(t > 0)) return '';
                    return `<rect x="${x.toFixed(2)}" y="${(y - t / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${t.toFixed(2)}" fill="${color}" rx="${(t / 2).toFixed(2)}"></rect>`;
                };

                const pad = h * 0.25;
                const vbW = L + pad * 2;
                const vbH = h + pad * 2;

                return `<svg viewBox="${-L / 2 - pad} ${-h / 2 - pad} ${vbW} ${vbH}" style="width:100%; max-height:150px" preserveAspectRatio="xMidYMid meet">
                    <rect x="${-L / 2}" y="${-h / 2}" width="${L}" height="${h}" fill="none" stroke="#9ca3af" stroke-width="${(h * 0.008).toFixed(2)}"></rect>
                    ${capa(-L / 2, mitad, yTop, this.draft.asTopI, '#60a5fa')}
                    ${capa(-L / 2, mitad, yBot, this.draft.asBotI, '#34d399')}
                    ${capa(0, mitad, yTop, this.draft.asTopJ, '#60a5fa')}
                    ${capa(0, mitad, yBot, this.draft.asBotJ, '#34d399')}
                    <line x1="0" y1="${-h / 2}" x2="0" y2="${h / 2}" stroke="#4b5563" stroke-width="${(h * 0.005).toFixed(2)}" stroke-dasharray="${h * 0.03} ${h * 0.02}"></line>
                    <text x="${-L / 4}" y="${h / 2 + pad * 0.7}" fill="#6b7280" font-size="${(h * 0.11).toFixed(1)}" text-anchor="middle">I</text>
                    <text x="${L / 4}" y="${h / 2 + pad * 0.7}" fill="#6b7280" font-size="${(h * 0.11).toFixed(1)}" text-anchor="middle">J</text>
                </svg>`;
            },

            save() {
                if (this.sameEnds) this.syncEnds();
                const ok = window.cadSystem?.saveBeamRebarDesign?.(this.sectionName, this.draft);
                if (ok) this.close();
            },
        };
    }
</script>
