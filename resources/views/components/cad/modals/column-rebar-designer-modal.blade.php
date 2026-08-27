{{-- resources/views/components/cad/modals/column-rebar-designer-modal.blade.php
     Diseñador de armado de columna A MANO — versión simplificada del
     "Section Designer" de ETABS (Propiedad nueva > Special > Section
     Designer > dibujar rectángulo > clic derecho > Reinforcing Shape/Rebar
     Data), pedida explícitamente más intuitiva: un solo formulario con
     vista previa en vivo, en vez de ese flujo de varios pasos.

     Se define por NOMBRE DE SECCIÓN (property), no por columna individual —
     aplica a toda columna que use esa sección, igual que en ETABS.

     cadSystem.openColumnRebarDesigner(sectionName, hint) dispara
     'open-column-rebar-designer-modal' con { sectionName, draft, barSizes, label }
     (ver resources/js/cad/mixins/analysis/columnRebarDesigner.js). Al
     guardar, llama a cadSystem.saveColumnRebarDesign(sectionName, draft), que
     dispara 'column-rebar-design-saved' para que el modal de resultados de
     columnas se refresque solo. Accesible desde Definir > Secciones de Barra
     (frame-sections-modal.blade.php) y como atajo desde Diseñar > Diseñar
     Columna(s) cuando una sale "no soportada" (columna-design-modal.blade.php). --}}
<div x-data="columnRebarDesignerModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:min(720px, 96vw); max-height:92vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Definir armado — <span x-text="label"></span></h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200 overflow-auto">
            <p class="text-[11px] text-gray-400 mb-2">
                Esta sección no trae armado real en el archivo importado (ETABS la dejó en
                <em>Reinforcement to be Designed</em>). Define aquí un armado fijo — se guarda para la sección
                "<span x-text="sectionName"></span>" y aplica a toda columna que la use.
            </p>

            {{-- Mapa de equivalencias con el diálogo de ETABS. Sin esto no se
                 podía cruzar campo por campo contra "Frame Section Property
                 Reinforcement Data" (cada input lleva además su nombre exacto). --}}
            {{-- Mismo orden y mismos nombres de campo que el dialogo de ETABS
                 "Frame Section Property Reinforcement Data", para poder ir
                 comparando celda por celda sin traducir mentalmente. --}}

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-3">

                    {{-- 1. Rebar Material --}}
                    <fieldset class="border border-gray-700 rounded px-3 pb-2 pt-1">
                        <legend class="px-1 text-[11px] font-semibold text-blue-300">Material del refuerzo
                            <span class="font-normal text-gray-600">/ Rebar Material</span></legend>
                        <label class="block text-xs text-gray-400">Varillas longitudinales
                            <span class="block text-[9px] text-gray-600">Longitudinal Bars</span>
                            <input type="text" disabled :value="materialLongitudinal()"
                                   class="w-full mt-0.5 bg-gray-900 border border-gray-700 rounded text-xs text-gray-400 px-2 py-1">
                        </label>
                        <label class="block text-xs text-gray-400 mt-1.5">Varillas de confinamiento
                            <span class="block text-[9px] text-gray-600">Confinement Bars</span>
                            <select x-model="draft.confineBarMaterialName"
                                    class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                <option value="">— el mismo que el longitudinal —</option>
                                <template x-for="m in materials" :key="m.name">
                                    <option :value="m.name" x-text="m.name + ' (fy=' + fyDisplay(m) + ' kg/cm²)'"></option>
                                </template>
                            </select>
                        </label>
                    </fieldset>

                    {{-- 2. Configuracion (fija: lo que soporta el motor hoy) --}}
                    <fieldset class="border border-gray-700 rounded px-3 pb-2 pt-1">
                        <legend class="px-1 text-[11px] font-semibold text-blue-300">Configuración
                            <span class="font-normal text-gray-600">/ Design Type · Configuration</span></legend>
                        <div class="text-[10px] text-gray-400 leading-relaxed">
                            <div>● Diseño <b>P-M2-M3 (Columna)</b></div>
                            <div>● Refuerzo <b>Rectangular</b></div>
                            <div>● Confinamiento con <b>Estribos</b> (Ties)</div>
                            <div>● <b>Reinforcement to be Checked</b> — se verifica el armado que definas acá</div>
                        </div>
                    </fieldset>

                    {{-- 3. Longitudinal Bars - Rectangular Configuration --}}
                    <fieldset class="border border-gray-700 rounded px-3 pb-2 pt-1">
                        <legend class="px-1 text-[11px] font-semibold text-blue-300">Varillas longitudinales
                            <span class="font-normal text-gray-600">/ Longitudinal Bars</span></legend>

                        <label class="block text-xs text-gray-400">Recubrimiento libre hasta el estribo (cm)
                            <span class="block text-[9px] text-gray-600">Clear Cover for Confinement Bars</span>
                            <input type="number" step="0.1" min="0.5" x-model.number="draft.cover"
                                   class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                        </label>

                        {{-- CIRCULAR: un anillo de n varillas (PATTERN "C-n"), no una
                             grilla. El campo de espiral vs estribos NO es cosmético:
                             decide el tope axial (0.85 vs 0.80·Po) y el φ de compresión
                             (0.75 vs 0.65) — ACI 318 §22.4.2.1. --}}
                        <div x-show="esCircular" class="grid grid-cols-2 gap-2 mt-1.5">
                            <label class="text-xs text-gray-400">Número de varillas
                                <span class="block text-[9px] text-gray-600">Number of Longitudinal Bars</span>
                                <input type="number" min="3" step="1" x-model.number="draft.numBars"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                            </label>
                            <label class="text-xs text-gray-400">Confinamiento
                                <span class="block text-[9px] text-gray-600">Confinement Bars</span>
                                <select x-model.boolean="draft.spiral"
                                        class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                    <option :value="true">Espiral (0.85·Po · φ 0.75)</option>
                                    <option :value="false">Estribos circulares (0.80·Po · φ 0.65)</option>
                                </select>
                            </label>
                        </div>

                        <div x-show="!esCircular" class="grid grid-cols-2 gap-2 mt-1.5">
                            <label class="text-xs text-gray-400">Varillas en la cara dir. 3
                                <span class="block text-[9px] text-gray-600">Bars Along 3-dir Face</span>
                                <input type="number" min="2" step="1" x-model.number="draft.n3"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                            </label>
                            <label class="text-xs text-gray-400">Varillas en la cara dir. 2
                                <span class="block text-[9px] text-gray-600">Bars Along 2-dir Face</span>
                                <input type="number" min="2" step="1" x-model.number="draft.n2"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                            </label>
                        </div>

                        {{-- Catalogo + AREA editable, igual que ETABS (su combo muestra
                             "User" cuando el area no sale de una varilla del catalogo).
                             El AREA es el dato que manda: define la capacidad. El catalogo
                             de este modelo es IMPERIAL y las varillas reales son METRICAS
                             (Ø20 = 314 mm²), asi que forzar el catalogo dejaba el acero
                             9.5% bajo. --}}
                        <div class="mt-1.5">
                            <div class="text-xs text-gray-400">Varilla longitudinal
                                <span class="block text-[9px] text-gray-600">Longitudinal Bar Size and Area</span>
                            </div>
                            <div class="flex gap-2 mt-0.5">
                                <select :value="nombreCatalogo('long')" @change="elegirDelCatalogo('long', $event.target.value)"
                                        class="flex-1 min-w-0 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                    <option value="">Usuario (User)</option>
                                    <template x-for="b in barSizes" :key="b.name">
                                        <option :value="b.name" x-text="b.name + '  Ø' + b.diameterMm.toFixed(1) + ' mm'"></option>
                                    </template>
                                </select>
                                <div class="flex items-center gap-1 shrink-0">
                                    <input type="number" step="1" min="1" x-model.number="draft.longBarAreaMm2"
                                           class="w-20 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                    <span class="text-[10px] text-gray-500">mm²</span>
                                </div>
                            </div>
                            <div class="text-[9px] text-gray-600 mt-0.5">
                                Ø equivalente <span x-text="diaEquivalente('long')"></span> mm — el área es la que manda
                            </div>
                        </div>

                        <div class="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                            <template x-if="esCircular">
                                <span>Patrón <b class="text-gray-300">C-<span x-text="draft.numBars"></span></b>
                                    — <span class="text-gray-300 font-semibold" x-text="points.length"></span> varillas en anillo
                                    <span class="text-gray-600">(· <span x-text="draft.spiral ? 'espiral' : 'estribos circulares'"></span>)</span></span>
                            </template>
                            <template x-if="!esCircular">
                                <span>Patrón <b class="text-gray-300">R-<span x-text="draft.n3"></span>-<span x-text="draft.n2"></span></b>
                                    — <span class="text-gray-300 font-semibold" x-text="points.length"></span> varillas
                                    <span class="text-gray-600">(2·n3 + 2·(n2−2): las esquinas no se cuentan dos veces)</span></span>
                            </template>
                            <span class="block">As total = <b class="text-gray-300" x-text="areaTotalCm2()"></b> cm²
                                · ρ = <b :class="cuantiaFueraDeRango() ? 'text-amber-400' : 'text-gray-300'" x-text="cuantiaPct()"></b>%
                                <span x-show="cuantiaFueraDeRango()" class="text-amber-400">(E.060 pide 1% ≤ ρ ≤ 6%)</span>
                            </span>
                        </div>
                    </fieldset>

                    {{-- 4. Confinement Bars --}}
                    <fieldset class="border border-gray-700 rounded px-3 pb-2 pt-1">
                        <legend class="px-1 text-[11px] font-semibold text-blue-300">Varillas de confinamiento
                            <span class="font-normal text-gray-600">/ Confinement Bars</span></legend>

                        <div class="text-xs text-gray-400">Varilla de estribo
                            <span class="block text-[9px] text-gray-600">Confinement Bar Size and Area</span>
                        </div>
                        <div class="flex gap-2 mt-0.5">
                            <select :value="nombreCatalogo('confine')" @change="elegirDelCatalogo('confine', $event.target.value)"
                                    class="flex-1 min-w-0 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                <option value="">Usuario (User)</option>
                                <template x-for="b in barSizes" :key="b.name">
                                    <option :value="b.name" x-text="b.name + '  Ø' + b.diameterMm.toFixed(1) + ' mm'"></option>
                                </template>
                            </select>
                            <div class="flex items-center gap-1 shrink-0">
                                <input type="number" step="1" min="1" x-model.number="draft.confineBarAreaMm2"
                                       class="w-20 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                <span class="text-[10px] text-gray-500">mm²</span>
                            </div>
                        </div>
                        <div class="text-[9px] text-gray-600 mt-0.5">
                            Ø equivalente <span x-text="diaEquivalente('confine')"></span> mm
                        </div>

                        <div class="grid grid-cols-3 gap-2 mt-1.5">
                            <label class="text-xs text-gray-400">Espaciamiento (cm)
                                <span class="block text-[9px] text-gray-600">Spacing (1-Axis)</span>
                                <input type="number" step="0.5" min="1" x-model.number="draft.confineSpacing"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                            </label>
                            <label class="text-xs text-gray-400">Ramas dir. 2
                                <span class="block text-[9px] text-gray-600">Bars in 2-dir</span>
                                <input type="number" step="1" min="2" x-model.number="draft.numConfineBars2"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                            </label>
                            <label class="text-xs text-gray-400">Ramas dir. 3
                                <span class="block text-[9px] text-gray-600">Bars in 3-dir</span>
                                <input type="number" step="1" min="2" x-model.number="draft.numConfineBars3"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                            </label>
                        </div>
                    </fieldset>

                    <template x-if="!valid">
                        <div class="text-amber-400 text-[11px]">
                            El recubrimiento/diámetro no deja espacio para el patrón indicado — ajusta las medidas.
                        </div>
                    </template>
                </div>

                {{-- Vista previa. Se genera como STRING de SVG (x-html) y no con <template x-for>
                     dentro de <svg>: el contenido de <template> vive en namespace HTML aunque el
                     tag este dentro de un <svg>, asi que los <circle> clonados no salen como
                     elementos SVG reales — eso disparaba "attribute x: Expected length, NaN". --}}
                <div>
                    <div class="flex items-center justify-center bg-gray-900 rounded border border-gray-700 p-2" style="min-height:260px" x-html="svgMarkup()"></div>
                    <div class="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                        <b class="text-gray-400">Los ejes locales</b>: la dirección <b class="text-emerald-400">2</b> va
                        sobre el peralte <b>h</b> (ETABS: Depth/t3) y la <b class="text-sky-400">3</b> sobre el ancho
                        <b>b</b> (Width/t2). "Varillas en la cara dir. 3" son las que se ven alineadas a lo
                        <b>ancho</b>.
                        <span class="block mt-1 text-amber-400/90">Si b y h te aparecen cruzados respecto de
                        ETABS, la sección está girada 90° y los resultados no van a coincidir.</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Cancelar</button>
            <button @click="save()" :disabled="!valid"
                    class="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded text-sm">
                Guardar armado
            </button>
        </div>
    </div>
</div>

<script>
    function columnRebarDesignerModal() {
        return {
            open: false,
            sectionName: null,
            label: '',
            // Nunca {} — el elemento existe en el DOM (aunque oculto por x-show)
            // desde que Alpine arranca la página, así que si el draft estuviera
            // vacío svgMarkup() ya se evaluaría una vez con NaN antes de abrir el
            // modal por primera vez.
            draft: { b: 30, h: 30, cover: 4, n2: 3, n3: 3, shape: 'rect', numBars: 8, spiral: true, diameter: 0, longBarName: '', confineBarName: '', longBarAreaMm2: 0, confineBarAreaMm2: 0, confineSpacing: 15, numConfineBars2: 2, numConfineBars3: 2, confineBarMaterialName: '' },
            barSizes: [],
            materials: [],
            longBarMaterialName: '',

            init() {
                window.addEventListener('open-column-rebar-designer-modal', (e) => {
                    this.sectionName = e.detail?.sectionName ?? null;
                    this.label = e.detail?.label || this.sectionName || 'sección';
                    this.draft = { ...(e.detail?.draft || {}) };
                    this.barSizes = e.detail?.barSizes || [];
                    this.materials = e.detail?.materials || [];
                    this.longBarMaterialName = e.detail?.longBarMaterialName || '';
                    this.open = true;
                });
            },

            /**
             * Material del acero longitudinal. NO se elige acá: sale del material
             * asignado a la columna (LONGBARMATERIAL de la sección), igual que en
             * ETABS, donde ese campo lo define la propiedad de sección.
             */
            materialLongitudinal() {
                return this.longBarMaterialName || '(el del material de la columna)';
            },

            /** fy en kg/cm² para mostrar — mismo criterio que _rcResolveMaterialFyByName en rcSectionMaterial.js (el catálogo guarda fy en MPa salvo que ya luzca como kg/cm²). */
            fyDisplay(mat) {
                const raw = Number(mat?.fy);
                if (!(raw > 0)) return '?';
                return Math.round(raw > 1000 ? raw : raw * 10.19716);
            },

            close() {
                this.open = false;
            },

            get points() {
                return window.cadSystem?.columnRebarPreviewPoints?.(this.draft) || [];
            },

            get valid() {
                return this.points.length > 0;
            },

            /**
             * Nombre de catalogo que corresponde al area actual, o '' (= "User")
             * si no hay ninguna varilla del catalogo con esa area. Mismo
             * comportamiento que el combo de ETABS.
             */
            nombreCatalogo(cual) {
                const area = cual === 'confine' ? this.draft.confineBarAreaMm2 : this.draft.longBarAreaMm2;
                const b = (this.barSizes || []).find((x) => Math.abs(x.areaMm2 - Number(area)) < 0.5);
                return b ? b.name : '';
            },

            /** Elegir del catalogo solo RELLENA el area; el area sigue siendo el dato. */
            elegirDelCatalogo(cual, nombre) {
                const b = (this.barSizes || []).find((x) => x.name === nombre);
                if (!b) return;   // "Usuario": se deja el area tal cual
                if (cual === 'confine') { this.draft.confineBarName = b.name; this.draft.confineBarAreaMm2 = b.areaMm2; }
                else { this.draft.longBarName = b.name; this.draft.longBarAreaMm2 = b.areaMm2; }
            },

            /** Diametro que corresponde al area: d = sqrt(4A/pi). */
            diaEquivalente(cual) {
                const a = Number(cual === 'confine' ? this.draft.confineBarAreaMm2 : this.draft.longBarAreaMm2);
                return a > 0 ? Math.sqrt((4 * a) / Math.PI).toFixed(1) : '-';
            },

            /** Area de UNA varilla longitudinal (cm2) — del draft, no del catalogo. */
            areaVarillaCm2() {
                return (window.cadSystem?.columnRebarBarArea?.(this.draft, 'long') || 0) / 100; // mm2 -> cm2
            },

            /** As total = n varillas x area de varilla (cm2). */
            areaTotalCm2() {
                return (this.points.length * this.areaVarillaCm2()).toFixed(2);
            },

            /** La FORMA la manda la seccion, no el usuario (la siembra el mixin). */
            get esCircular() {
                return String(this.draft?.shape || 'rect').toLowerCase().startsWith('circ');
            },

            /** Diametro en cm de una circular (el mixin lo siembra desde la seccion). */
            get diamCm() {
                return Number(this.draft?.diameter ?? this.draft?.h) || 0;
            },

            /** Cuantia rho = As/Ag en %. */
            cuantiaPct() {
                const ag = this.esCircular
                    ? Math.PI * this.diamCm * this.diamCm / 4
                    : (Number(this.draft.b) || 0) * (Number(this.draft.h) || 0);
                if (!(ag > 0)) return '0.00';
                return ((this.points.length * this.areaVarillaCm2()) / ag * 100).toFixed(2);
            },

            /**
             * E.060 Art. 21.6.3.1 (y 10.9.1): la cuantia de una columna va
             * entre 1% y 6%. Fuera de ese rango se avisa — no se bloquea,
             * porque el usuario puede estar tanteando un armado.
             */
            cuantiaFueraDeRango() {
                const rho = parseFloat(this.cuantiaPct());
                return Number.isFinite(rho) && rho > 0 && (rho < 1 || rho > 6);
            },

            /** Construye el SVG como STRING (ver comentario junto al contenedor) — nada de bindings Alpine dentro del SVG. */
            svgMarkup() {
                if (this.esCircular) return this.svgMarkupCircular();
                const b = Number(this.draft.b) || 0;
                const h = Number(this.draft.h) || 0;
                const cover = Number(this.draft.cover) || 0;
                if (!(b > 0) || !(h > 0)) return '';

                const pad = Math.max(b, h) * 0.15 || 5;
                const w = b + pad * 2;
                const hh = h + pad * 2;
                const innerW = Math.max(b - 2 * cover, 0);
                const innerH = Math.max(h - 2 * cover, 0);
                const r = Math.max(Math.max(b, h) * 0.018, 0.3);

                const circles = this.points
                    .map((p) => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${r.toFixed(2)}" fill="#60a5fa"></circle>`)
                    .join('');

                // Ejes locales dibujados encima: sin esto el 2 y el 3 son pura
                // memoria y es donde mas se confunde la gente al cargar el armado.
                const f = Math.max(b, h) * 0.075;   // tamaño de texto
                const ax = b / 2 + pad * 0.55;      // eje 3 (horizontal, sobre b)
                const ay = h / 2 + pad * 0.55;      // eje 2 (vertical, sobre h)

                return `<svg viewBox="${-w / 2} ${-hh / 2} ${w} ${hh}" style="width:100%; max-height:320px" preserveAspectRatio="xMidYMid meet">
                    <rect x="${-b / 2}" y="${-h / 2}" width="${b}" height="${h}" fill="none" stroke="#9ca3af" stroke-width="0.6"></rect>
                    <rect x="${-b / 2 + cover}" y="${-h / 2 + cover}" width="${innerW}" height="${innerH}" fill="none" stroke="#4b5563" stroke-width="0.3" stroke-dasharray="1.2 1"></rect>
                    ${circles}
                    <line x1="${-ax}" y1="${ay}" x2="${ax}" y2="${ay}" stroke="#38bdf8" stroke-width="0.4"></line>
                    <text x="0" y="${ay + f * 1.15}" fill="#38bdf8" font-size="${f}" text-anchor="middle">3 — ancho b = ${b} cm</text>
                    <line x1="${-ax}" y1="${-ay}" x2="${-ax}" y2="${ay}" stroke="#34d399" stroke-width="0.4"></line>
                    <text x="${-ax - f * 0.5}" y="0" fill="#34d399" font-size="${f}" text-anchor="middle"
                          transform="rotate(-90 ${-ax - f * 0.5} 0)">2 — peralte h = ${h} cm</text>
                </svg>`;
            },

            /** Vista previa de la seccion CIRCULAR: disco, nucleo y anillo de varillas. */
            svgMarkupCircular() {
                const D = this.diamCm;
                const cover = Number(this.draft.cover) || 0;
                if (!(D > 0)) return '';

                const R = D / 2;
                const pad = D * 0.15 || 5;
                const w = D + pad * 2;
                const rNucleo = Math.max(R - cover, 0);
                const r = Math.max(D * 0.018, 0.3);

                const circles = this.points
                    .map((p) => `<circle cx="${p.x.toFixed(2)}" cy="${(-p.y).toFixed(2)}" r="${r.toFixed(2)}" fill="#60a5fa"></circle>`)
                    .join('');

                const f = D * 0.075;
                const ax = R + pad * 0.55;

                return `<svg viewBox="${-w / 2} ${-w / 2} ${w} ${w}" style="width:100%; max-height:320px" preserveAspectRatio="xMidYMid meet">
                    <circle cx="0" cy="0" r="${R}" fill="none" stroke="#9ca3af" stroke-width="0.6"></circle>
                    <circle cx="0" cy="0" r="${rNucleo}" fill="none" stroke="#4b5563" stroke-width="0.3" stroke-dasharray="1.2 1"></circle>
                    ${circles}
                    <line x1="${-ax}" y1="${ax}" x2="${ax}" y2="${ax}" stroke="#38bdf8" stroke-width="0.4"></line>
                    <text x="0" y="${ax + f * 1.15}" fill="#38bdf8" font-size="${f}" text-anchor="middle">D = ${D} cm</text>
                </svg>`;
            },

            save() {
                const ok = window.cadSystem?.saveColumnRebarDesign?.(this.sectionName, this.draft);
                if (ok) this.close();
            },
        };
    }
</script>
