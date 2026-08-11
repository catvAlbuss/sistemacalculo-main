{{-- resources/views/components/cad/modals/slab-sections-modal.blade.php --}}
{{-- Réplica de ETABS: lista de Slab Properties (paso 1) + editor Slab Property Data (paso 2). --}}
<div x-data="slabSectionsModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    {{-- ══════════ PASO 1: LISTA (Slab Properties) ══════════ --}}
    <div x-show="view === 'list'" class="bg-gray-800 rounded-lg shadow-2xl w-[520px] border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Propiedades de Losa (Slab Sections)</h3>
            <button @click="close()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4">
            <div class="grid grid-cols-[1fr_auto] gap-3">
                <div class="border border-gray-700 rounded">
                    <div class="px-2 py-1 text-xs text-gray-400 border-b border-gray-700">Propiedad de Losa</div>
                    <div class="max-h-56 overflow-y-auto">
                        <template x-for="s in sections" :key="s.name">
                            <div @click="selectedName = s.name" @dblclick="modify()"
                                class="px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-700 flex items-center justify-between"
                                :class="{'bg-blue-900 text-white': selectedName === s.name, 'text-gray-300': selectedName !== s.name}">
                                <span x-text="s.name"></span>
                                <span class="text-[10px] text-gray-500" x-text="thicknessLabelFor(s.thickness)"></span>
                            </div>
                        </template>
                        <div x-show="sections.length === 0" class="px-3 py-4 text-center text-gray-500 text-sm">Sin propiedades</div>
                    </div>
                </div>

                <div class="flex flex-col gap-2 w-48">
                    <button @click="addNew()" class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded text-left">Agregar Nueva...</button>
                    <button @click="addCopy()" class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded text-left"
                        :class="{'opacity-50 cursor-not-allowed': !selectedName}">Agregar Copia...</button>
                    <button @click="modify()" class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded text-left"
                        :class="{'opacity-50 cursor-not-allowed': !selectedName}">Modificar / Mostrar...</button>
                    <button @click="del()" class="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm rounded text-left"
                        :class="{'opacity-50 cursor-not-allowed': !selectedName}">Eliminar</button>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="close()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveAll()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    {{-- ══════════ PASO 2: EDITOR (Slab Property Data) ══════════ --}}
    <div x-show="view === 'editor'" class="bg-gray-800 rounded-lg shadow-2xl w-[560px] max-h-[92vh] overflow-hidden border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Datos de Propiedad de Losa (Slab Property Data)</h3>
            <button @click="backToList()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[78vh] space-y-4">
            {{-- General --}}
            <div class="border border-gray-700 rounded p-3">
                <label class="block text-xs font-semibold text-blue-400 mb-2">Datos Generales</label>
                <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2">
                        <span class="text-gray-300 w-40">Nombre de Propiedad</span>
                        <input type="text" x-model="editing.name" class="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white">
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-gray-300 w-40">Material de Losa</span>
                        <select x-model="editing.material" class="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white">
                            <template x-for="m in availableMaterials" :key="m">
                                <option :value="m" x-text="m"></option>
                            </template>
                        </select>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-gray-300 w-40">Tipo de Modelado</span>
                        <select x-model="editing.modelingType" class="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white">
                            <option value="Membrane">Membrane</option>
                            <option value="Shell-Thin">Shell-Thin</option>
                            <option value="Shell-Thick">Shell-Thick</option>
                        </select>
                    </div>
                    {{-- Equivalente del ONEWAYLOADDIST de ETABS: decide si la losa entrega
                         su carga a DOS vigas (una vía) o a las cuatro del contorno. --}}
                    <div class="flex items-start gap-2">
                        <span class="text-gray-300 w-40 pt-1">Reparto de Carga</span>
                        <div class="flex-1">
                            <label class="flex items-center gap-2 text-white">
                                <input type="checkbox" x-model="editing.oneWayLoadDist"
                                    class="bg-gray-700 border-gray-600 rounded">
                                <span>Una vía (aligerado / nervado)</span>
                            </label>
                            <p class="text-xs text-gray-400 mt-1">
                                Entrega la carga solo a las dos vigas perpendiculares al sentido
                                de armado. Sin marcar, reparte a las cuatro del contorno.
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-gray-300 w-40">Color</span>
                        <input type="color" x-model="editing.color" class="w-12 h-7 bg-gray-700 border border-gray-600 rounded">
                    </div>
                </div>
            </div>

            {{-- Property Data --}}
            <div class="border border-gray-700 rounded p-3">
                <label class="block text-xs font-semibold text-blue-400 mb-2">Datos de Propiedad</label>
                <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2">
                        <span class="text-gray-300 w-40">Tipo</span>
                        <select x-model="editing.type" class="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white">
                            <option value="Slab">Slab</option>
                            <option value="Drop">Drop</option>
                            <option value="Mat">Mat</option>
                        </select>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-gray-300 w-40" x-text="'Espesor (' + unitLabels.length + ')'"></span>
                        <input type="number" step="any" min="0" x-model.number="dispThickness"
                            class="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white">
                    </div>
                </div>
                <div class="mt-3 pt-2 border-t border-gray-700 text-xs text-emerald-300">
                    Peso propio ≈ <b x-text="selfWeightDisp"></b> <span x-text="unitLabels.areaLoad"></span>
                    (espesor × densidad del material). Se agrega como carga muerta automática al analizar.
                </div>
            </div>

            <div class="text-[11px] text-gray-500 leading-snug">
                El espesor define el <b>peso propio de la losa</b> (kgf/m² = espesor × densidad). Para losa aligerada usa el
                <b>espesor equivalente</b> (p. ej. aligerado 0.20 ≈ 125 mm → ~300 kgf/m²). Acabados, tabiquería y CV se asignan aparte como cargas de área.
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="backToList()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveEditor()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    {{-- Toast --}}
    <div x-show="showToast" x-cloak class="fixed bottom-5 right-5 z-[300]" x-transition.duration.300ms>
        <div class="px-4 py-3 rounded-lg shadow-lg text-white text-sm" :class="toastType === 'error' ? 'bg-red-600' : (toastType === 'warning' ? 'bg-yellow-600' : 'bg-green-600')">
            <span x-text="toastMessage"></span>
        </div>
    </div>

    <style>[x-cloak] { display: none !important; }</style>
</div>

<script>
    function slabSectionsModal() {
        return {
            open: false,
            view: 'list',
            sections: [],
            selectedName: null,

            // Nunca null (Alpine evalúa el editor aunque esté oculto).
            editing: {
                name: '', material: 'CONC', modelingType: 'Membrane',
                type: 'Slab', thickness: 200, color: '#888888', oneWayLoadDist: false,
            },
            editingOriginalName: null,
            isNew: false,

            showToast: false, toastMessage: '', toastType: 'success', toastTimeout: null,

            get availableMaterials() {
                const mats = window.cadSystem?.materialProperties?.materials || [];
                const names = mats.map((m) => m.name).filter(Boolean);
                return names.length ? [...new Set(names)] : ['CONC'];
            },

            // Peso propio kgf/m² = espesor(m) × densidad(kg/m³) del material.
            get selfWeightKgM2() {
                const t = (Number(this.editing.thickness) || 0) / 1000; // mm → m
                const rho = this._densityFor(this.editing.material);     // kg/m³
                return t * rho;
            },

            // =====================================================
            // UNIDADES DE VISUALIZACIÓN (window.cadUnits, selector del footer)
            // El espesor se ALMACENA siempre en mm (convención interna);
            // el input muestra/lee en la unidad de longitud elegida (m o cm).
            // =====================================================
            unitsVersion: 0,

            get unitLabels() {
                this.unitsVersion;
                return window.cadUnits?.labels?.() || { length: 'mm', areaLoad: 'kgf/m²' };
            },

            get dispThickness() { this.unitsVersion; return window.cadUnits ? window.cadUnits.lenMmToDisp(this.editing.thickness) : Number(this.editing.thickness) || 0; },
            set dispThickness(v) { this.editing.thickness = window.cadUnits ? window.cadUnits.lenDispToMm(v) : Number(v) || 0; },

            // Peso propio convertido a la unidad de carga por área activa.
            get selfWeightDisp() {
                this.unitsVersion;
                const u = window.cadUnits;
                const val = u ? u.areaLoadKgfM2ToDisp(this.selfWeightKgM2) : this.selfWeightKgM2;
                return Number(val).toLocaleString('en-US', { maximumFractionDigits: 4 });
            },

            // Etiqueta de espesor para la lista (convertida a la unidad activa).
            thicknessLabelFor(mm) {
                this.unitsVersion;
                const u = window.cadUnits;
                if (!u) return (Number(mm) || 0) + ' mm';
                return u.lenMmToDisp(mm) + ' ' + u.labels().length;
            },

            _densityFor(matName) {
                const mats = window.cadSystem?.materialProperties?.materials || [];
                const m = mats.find((x) => x.name === matName);
                // massPerUnitVolume suele venir en ton/mm³ (ETABS N-mm): ×1e12 → kg/m³.
                const mpv = Number(m?.massPerUnitVolume);
                if (mpv > 0 && mpv < 1e-3) return mpv * 1e12;
                return 2400; // concreto por defecto
            },

            init() {
                this.loadSections();
                window.addEventListener('open-slab-sections-modal', () => this.openModal());

                // Refrescar inputs/etiquetas al cambiar unidades en el footer.
                window.addEventListener('cad-units-changed', () => {
                    this.unitsVersion++;
                });
            },

            loadSections() {
                const cs = window.cadSystem || {};
                let list = Array.isArray(cs.slabSections) ? cs.slabSections : null;
                if (!list || !list.length) {
                    list = [
                        { name: 'Aligerado e=0.20', material: 'CONC', modelingType: 'Membrane', type: 'Slab', thickness: 125, color: '#9ca3af', oneWayLoadDist: true },
                        { name: 'Losa Maciza e=0.20', material: 'CONC', modelingType: 'Membrane', type: 'Slab', thickness: 200, color: '#6b7280', oneWayLoadDist: false },
                    ];
                }
                this.sections = JSON.parse(JSON.stringify(list));
                this.selectedName = this.sections[0]?.name || null;
            },

            showToastMessage(msg, type) {
                if (this.toastTimeout) clearTimeout(this.toastTimeout);
                this.toastMessage = msg; this.toastType = type || 'success'; this.showToast = true;
                this.toastTimeout = setTimeout(() => { this.showToast = false; }, 3000);
            },

            openModal() { this.loadSections(); this.view = 'list'; this.open = true; },
            close() { this.open = false; this.view = 'list'; },
            backToList() { this.view = 'list'; },

            getSelected() { return this.sections.find((s) => s.name === this.selectedName) || null; },

            defaultEditing(name) {
                return { name: name || '', material: this.availableMaterials[0] || 'CONC', modelingType: 'Membrane', type: 'Slab', thickness: 200, color: '#888888', oneWayLoadDist: false };
            },

            addNew() {
                let name = 'Losa' + (this.sections.length + 1);
                while (this.sections.some((s) => s.name === name)) name += '_';
                this.editing = this.defaultEditing(name);
                this.editingOriginalName = null; this.isNew = true; this.view = 'editor';
            },

            addCopy() {
                const sel = this.getSelected();
                if (!sel) { this.showToastMessage('Selecciona una propiedad', 'warning'); return; }
                const e = JSON.parse(JSON.stringify(sel));
                let name = sel.name + ' - Copia';
                while (this.sections.some((s) => s.name === name)) name += ' (2)';
                e.name = name;
                this.editing = e; this.editingOriginalName = null; this.isNew = true; this.view = 'editor';
            },

            modify() {
                const sel = this.getSelected();
                if (!sel) { this.showToastMessage('Selecciona una propiedad', 'warning'); return; }
                this.editing = JSON.parse(JSON.stringify(sel));
                this.editingOriginalName = sel.name; this.isNew = false; this.view = 'editor';
            },

            del() {
                const sel = this.getSelected();
                if (!sel) return;
                this.sections = this.sections.filter((s) => s.name !== sel.name);
                this.selectedName = this.sections[0]?.name || null;
                this.showToastMessage('Propiedad "' + sel.name + '" eliminada', 'success');
            },

            saveEditor() {
                const name = (this.editing.name || '').trim();
                if (!name) { this.showToastMessage('El nombre es obligatorio', 'error'); return; }
                if (this.sections.some((s) => s.name === name && s.name !== this.editingOriginalName)) {
                    this.showToastMessage('Ya existe una propiedad con ese nombre', 'error'); return;
                }
                const stored = {
                    name,
                    material: this.editing.material,
                    modelingType: this.editing.modelingType,
                    type: this.editing.type,
                    thickness: Number(this.editing.thickness) || 0,   // mm
                    color: this.editing.color,
                    selfWeightKgM2: this.selfWeightKgM2,                // kgf/m² (peso propio)
                    // Equivalente del ONEWAYLOADDIST de ETABS: decide si la
                    // losa entrega su carga a DOS vigas (una vía: aligerado,
                    // nervado) o a las cuatro del contorno. Sin este dato la
                    // losa no dibuja flecha de sentido de armado y reparte a
                    // todo el contorno.
                    oneWayLoadDist: !!this.editing.oneWayLoadDist,
                };
                if (this.isNew) this.sections.push(stored);
                else {
                    const i = this.sections.findIndex((s) => s.name === this.editingOriginalName);
                    if (i >= 0) this.sections[i] = stored; else this.sections.push(stored);
                }
                this.selectedName = name;
                this.showToastMessage('Propiedad "' + name + '" guardada', 'success');
                this.view = 'list';
            },

            saveAll() {
                if (window.cadSystem) {
                    // Recalcular el peso propio (kgf/m²) de CADA sección antes de guardar,
                    // para que las secciones por defecto o sin editar por el editor también
                    // lo lleven. Sin esto, slab.slabSelfWeightKgM2 queda 0 y el peso de la
                    // losa nunca entra a CM (masa sísmica quedaba corta).
                    const sections = this.sections.map((s) => ({
                        ...s,
                        selfWeightKgM2: (Number(s.thickness) || 0) / 1000 * this._densityFor(s.material),
                    }));
                    window.cadSystem.slabSections = JSON.parse(JSON.stringify(sections));
                    this.showToastMessage('✅ Propiedades de losa guardadas (' + this.sections.length + ')', 'success');
                    window.cadSystem.showMessage?.('Propiedades de losa guardadas: ' + this.sections.length + '.');
                }
                this.close();
            },
        };
    }
</script>
