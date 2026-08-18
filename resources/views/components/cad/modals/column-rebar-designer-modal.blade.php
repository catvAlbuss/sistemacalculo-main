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
            <details class="mb-3 rounded border border-gray-700 bg-gray-900/60">
                <summary class="cursor-pointer px-3 py-1.5 text-[11px] text-blue-300 hover:text-blue-200">
                    ¿Cómo se corresponde con ETABS? (Frame Section Property Reinforcement Data)
                </summary>
                <div class="px-3 pb-2 pt-1 text-[10px] text-gray-400 leading-relaxed">
                    <table class="w-full">
                        <thead class="text-gray-500">
                            <tr><th class="text-left py-0.5">Aquí</th><th class="text-left">En ETABS</th></tr>
                        </thead>
                        <tbody>
                            <tr><td class="py-0.5">b</td><td>Width (t2) — dimensión sobre el eje 3</td></tr>
                            <tr><td class="py-0.5">h</td><td>Depth (t3) — dimensión sobre el eje 2</td></tr>
                            <tr><td class="py-0.5">Recubrimiento</td><td>Clear Cover for Confinement Bars</td></tr>
                            <tr><td class="py-0.5">n3</td><td>Number of Longitudinal Bars Along 3-dir Face</td></tr>
                            <tr><td class="py-0.5">n2</td><td>Number of Longitudinal Bars Along 2-dir Face</td></tr>
                            <tr><td class="py-0.5">Varilla long.</td><td>Longitudinal Bar Size and Area</td></tr>
                            <tr><td class="py-0.5">Varilla estribo</td><td>Confinement Bar Size and Area</td></tr>
                            <tr><td class="py-0.5">Espac.</td><td>Longitudinal Spacing of Confinement Bars (Along 1-Axis)</td></tr>
                            <tr><td class="py-0.5">Ramas dir. 2</td><td>Number of Confinement Bars in 2-dir</td></tr>
                            <tr><td class="py-0.5">Ramas dir. 3</td><td>Number of Confinement Bars in 3-dir</td></tr>
                        </tbody>
                    </table>
                    <p class="mt-2 text-amber-400/90">
                        Ojo con b/h: ETABS los nombra al revés que nosotros. Su <b>Depth</b> es nuestro <b>h</b>
                        y su <b>Width</b> es nuestro <b>b</b>. Si los valores te aparecen cruzados, la sección está
                        girada 90° respecto del modelo de ETABS y los resultados no van a coincidir.
                    </p>
                </div>
            </details>

            <div class="grid grid-cols-2 gap-4">
                {{-- Formulario --}}
                <div class="space-y-2">
                    <div class="grid grid-cols-2 gap-2">
                        <label class="text-xs text-gray-400">b (cm)
                            <span class="block text-[9px] text-gray-600 leading-tight">ETABS: Width (t2)</span>
                            <input type="number" step="0.1" x-model.number="draft.b" disabled
                                   class="w-full mt-0.5 bg-gray-900 border border-gray-700 rounded text-xs text-gray-400 px-2 py-1">
                        </label>
                        <label class="text-xs text-gray-400">h (cm)
                            <span class="block text-[9px] text-gray-600 leading-tight">ETABS: Depth (t3)</span>
                            <input type="number" step="0.1" x-model.number="draft.h" disabled
                                   class="w-full mt-0.5 bg-gray-900 border border-gray-700 rounded text-xs text-gray-400 px-2 py-1">
                        </label>
                    </div>

                    <label class="block text-xs text-gray-400">Recubrimiento libre hasta el estribo (cm)
                        <span class="block text-[9px] text-gray-600 leading-tight">ETABS: Clear Cover for Confinement Bars (allá va en mm)</span>
                        <input type="number" step="0.1" min="0.5" x-model.number="draft.cover"
                               class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                    </label>

                    <div class="grid grid-cols-2 gap-2">
                        <label class="text-xs text-gray-400">Varillas cara 3 (n3)
                            <span class="block text-[9px] text-gray-600 leading-tight">ETABS: Bars Along 3-dir Face</span>
                            <input type="number" min="2" step="1" x-model.number="draft.n3"
                                   class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                        </label>
                        <label class="text-xs text-gray-400">Varillas cara 2 (n2)
                            <span class="block text-[9px] text-gray-600 leading-tight">ETABS: Bars Along 2-dir Face</span>
                            <input type="number" min="2" step="1" x-model.number="draft.n2"
                                   class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                        </label>
                    </div>
                    <div class="text-[10px] text-gray-500">
                        Patrón R-<span x-text="draft.n3"></span>-<span x-text="draft.n2"></span> —
                        total <span class="text-gray-300 font-semibold" x-text="points.length"></span> varillas
                        <span class="text-gray-600">(2·n3 + 2·(n2−2): las esquinas no se cuentan dos veces)</span>
                        <span class="block mt-0.5">Acero total As = <span class="text-gray-300" x-text="areaTotalCm2()"></span> cm²
                            &nbsp;·&nbsp; cuantía ρ = <span :class="cuantiaFueraDeRango() ? 'text-amber-400 font-semibold' : 'text-gray-300'"
                                x-text="cuantiaPct()"></span>%
                            <span x-show="cuantiaFueraDeRango()" class="text-amber-400">(E.060 pide 1% ≤ ρ ≤ 6%)</span>
                        </span>
                    </div>

                    <label class="block text-xs text-gray-400">Varilla longitudinal
                        <select x-model="draft.longBarName" class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                            <template x-for="b in barSizes" :key="b.name">
                                <option :value="b.name" x-text="b.name + ' (Ø' + b.diameterMm.toFixed(1) + 'mm, ' + b.areaMm2.toFixed(0) + 'mm²)'"></option>
                            </template>
                        </select>
                    </label>
                    <div class="text-[10px] text-gray-500">Usa el material de acero ya asignado a cada columna (no se elige aquí).</div>

                    <div class="border-t border-gray-700 pt-2 mt-2">
                        <div class="text-xs font-semibold text-gray-300 mb-1">Estribo (confinamiento)</div>
                        <label class="block text-xs text-gray-400">Varilla de estribo
                            <select x-model="draft.confineBarName" class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                <template x-for="b in barSizes" :key="b.name">
                                    <option :value="b.name" x-text="b.name + ' (Ø' + b.diameterMm.toFixed(1) + 'mm, ' + b.areaMm2.toFixed(0) + 'mm²)'"></option>
                                </template>
                            </select>
                        </label>

                        <label class="block text-xs text-gray-400 mt-2">Material del estribo
                            <select x-model="draft.confineBarMaterialName" class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                                <option value="">— usar el mismo que la varilla longitudinal —</option>
                                <template x-for="m in materials" :key="m.name">
                                    <option :value="m.name" x-text="m.name + ' (fy=' + fyDisplay(m) + ' kg/cm²)'"></option>
                                </template>
                            </select>
                        </label>

                        <div class="grid grid-cols-3 gap-2 mt-2">
                            <label class="text-xs text-gray-400">Espac. (cm)
                                <span class="block text-[9px] text-gray-600 leading-tight">Spacing (1-Axis)</span>
                                <input type="number" step="0.5" min="1" x-model.number="draft.confineSpacing"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                            </label>
                            <label class="text-xs text-gray-400">Ramas dir. 2
                                <span class="block text-[9px] text-gray-600 leading-tight">Conf. Bars in 2-dir</span>
                                <input type="number" step="1" min="2" x-model.number="draft.numConfineBars2"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                            </label>
                            <label class="text-xs text-gray-400">Ramas dir. 3
                                <span class="block text-[9px] text-gray-600 leading-tight">Conf. Bars in 3-dir</span>
                                <input type="number" step="1" min="2" x-model.number="draft.numConfineBars3"
                                       class="w-full mt-0.5 bg-gray-900 border border-gray-600 rounded text-xs text-white px-2 py-1">
                            </label>
                        </div>
                    </div>

                    <template x-if="!valid">
                        <div class="text-amber-400 text-[11px] mt-2">
                            El recubrimiento/diámetro no deja espacio para el patrón indicado — ajusta las medidas.
                        </div>
                    </template>
                </div>

                {{-- Vista previa: rectángulo + puntos de varilla, igual al que muestra ETABS al aceptar Section Designer.
                     Se genera como STRING de SVG (x-html) en vez de <template x-for> dentro de <svg>: el contenido de
                     <template> vive en namespace HTML aunque el tag esté dentro de un <svg>, así que los <circle>/<rect>
                     clonados desde ahí no salen como elementos SVG reales — eso disparaba los errores de consola
                     "attribute x: Expected length, NaN" y el ReferenceError "p is not defined" (efecto de Alpine
                     quedando huérfano al no poder enlazar el scope de x-for correctamente). --}}
                <div class="flex items-center justify-center bg-gray-900 rounded border border-gray-700 p-2" style="min-height:220px" x-html="svgMarkup()"></div>
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
            draft: { b: 30, h: 30, cover: 4, n2: 3, n3: 3, longBarName: '', confineBarName: '', confineSpacing: 15, numConfineBars2: 2, numConfineBars3: 2, confineBarMaterialName: '' },
            barSizes: [],
            materials: [],

            init() {
                window.addEventListener('open-column-rebar-designer-modal', (e) => {
                    this.sectionName = e.detail?.sectionName ?? null;
                    this.label = e.detail?.label || this.sectionName || 'sección';
                    this.draft = { ...(e.detail?.draft || {}) };
                    this.barSizes = e.detail?.barSizes || [];
                    this.materials = e.detail?.materials || [];
                    this.open = true;
                });
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

            /** Area de UNA varilla longitudinal (cm2), del catalogo. */
            areaVarillaCm2() {
                const bar = (this.barSizes || []).find((b) => b.name === this.draft.longBarName);
                return bar ? bar.areaMm2 / 100 : 0; // mm2 -> cm2
            },

            /** As total = n varillas x area de varilla (cm2). */
            areaTotalCm2() {
                return (this.points.length * this.areaVarillaCm2()).toFixed(2);
            },

            /** Cuantia rho = As/Ag en %. */
            cuantiaPct() {
                const ag = (Number(this.draft.b) || 0) * (Number(this.draft.h) || 0);
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

                return `<svg viewBox="${-w / 2} ${-hh / 2} ${w} ${hh}" style="width:100%; max-height:320px" preserveAspectRatio="xMidYMid meet">
                    <rect x="${-b / 2}" y="${-h / 2}" width="${b}" height="${h}" fill="none" stroke="#9ca3af" stroke-width="0.6"></rect>
                    <rect x="${-b / 2 + cover}" y="${-h / 2 + cover}" width="${innerW}" height="${innerH}" fill="none" stroke="#4b5563" stroke-width="0.3" stroke-dasharray="1.2 1"></rect>
                    ${circles}
                </svg>`;
            },

            save() {
                const ok = window.cadSystem?.saveColumnRebarDesign?.(this.sectionName, this.draft);
                if (ok) this.close();
            },
        };
    }
</script>
