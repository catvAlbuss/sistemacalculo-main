

<div x-data="massSourceModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    
    <div x-show="view === 'list'" class="bg-gray-800 rounded-lg shadow-2xl w-[520px] border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Fuentes de Masa (Mass Source)</h3>
            <button @click="close()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4">
            <div class="grid grid-cols-[1fr_auto] gap-3">
                
                <div class="border border-gray-700 rounded">
                    <div class="px-2 py-1 text-xs text-gray-400 border-b border-gray-700">Fuentes de Masa</div>
                    <div class="max-h-56 overflow-y-auto">
                        <template x-for="src in sources" :key="src.name">
                            <div @click="selectedName = src.name"
                                @dblclick="modifySource()"
                                class="px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-700 flex items-center justify-between"
                                :class="{'bg-blue-900 text-white': selectedName === src.name, 'text-gray-300': selectedName !== src.name}">
                                <span x-text="src.name"></span>
                                <span x-show="src.name === defaultName" class="text-[10px] text-green-400">(default)</span>
                            </div>
                        </template>
                        <div x-show="sources.length === 0" class="px-3 py-4 text-center text-gray-500 text-sm">Sin fuentes</div>
                    </div>
                </div>

                
                <div class="flex flex-col gap-2 w-44">
                    <button @click="addNewSource()" class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded text-left">Agregar Nueva...</button>
                    <button @click="addCopySource()" class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded text-left"
                        :class="{'opacity-50 cursor-not-allowed': !selectedName}">Agregar Copia...</button>
                    <button @click="modifySource()" class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded text-left"
                        :class="{'opacity-50 cursor-not-allowed': !selectedName}">Modificar / Mostrar...</button>
                    <button @click="deleteSource()" class="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm rounded text-left"
                        :class="{'opacity-50 cursor-not-allowed': !selectedName || sources.length <= 1}">Eliminar</button>
                </div>
            </div>

            
            <div class="mt-4 pt-3 border-t border-gray-700">
                <label class="block text-xs font-semibold text-blue-400 mb-1">Fuente de Masa por Defecto</label>
                <select x-model="defaultName" class="w-full px-2 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    <template x-for="src in sources" :key="src.name">
                        <option :value="src.name" x-text="src.name"></option>
                    </template>
                </select>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="close()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveAll()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    
    <div x-show="view === 'editor'" class="bg-gray-800 rounded-lg shadow-2xl w-[760px] max-h-[92vh] overflow-hidden border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Datos de Fuente de Masa (Mass Source Data)</h3>
            <button @click="backToList()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[78vh]">
            <div class="mb-4 flex items-center gap-3">
                <label class="text-sm text-gray-300 w-44">Nombre de Fuente de Masa</label>
                <input type="text" x-model="editing.name"
                    class="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
            </div>

            <div class="grid grid-cols-2 gap-4">
                
                <div class="border border-gray-700 rounded p-3">
                    <label class="block text-xs font-semibold text-blue-400 mb-2">Fuente de Masa</label>
                    <div class="space-y-2">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" x-model="editing.elementSelfMass">
                            <span class="text-sm text-gray-300">Masa Propia de Elementos</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" x-model="editing.additionalMass">
                            <span class="text-sm text-gray-300">Masa Adicional Especificada</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" x-model="editing.specifiedLoadPatterns">
                            <span class="text-sm text-gray-300">Patrones de Carga Especificados</span>
                        </label>
                    </div>

                    <div class="mt-3 pt-3 border-t border-gray-700">
                        <label class="flex items-start gap-2">
                            <input type="checkbox" x-model="editing.adjustMassCentroid" class="mt-0.5">
                            <span class="text-sm text-gray-300 leading-tight">Ajustar masa lateral del diafragma para mover el centroide</span>
                        </label>
                        <div class="mt-2 space-y-2" :class="{'opacity-40 pointer-events-none': !editing.adjustMassCentroid}">
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-400 flex-1">Razón del ancho en X</span>
                                <input type="number" step="0.01" x-model.number="editing.adjustRatioX"
                                    class="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-400 flex-1">Razón del ancho en Y</span>
                                <input type="number" step="0.01" x-model.number="editing.adjustRatioY"
                                    class="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                        </div>
                    </div>
                </div>

                
                <div class="space-y-4">
                    <div class="border border-gray-700 rounded p-3"
                        :class="{'opacity-40 pointer-events-none': !editing.specifiedLoadPatterns}">
                        <label class="block text-xs font-semibold text-blue-400 mb-2">Multiplicadores de Masa para Patrones de Carga</label>
                        <table class="w-full text-sm mb-2">
                            <thead class="bg-gray-800">
                                <tr>
                                    <th class="px-2 py-1 text-left text-gray-300">Patrón</th>
                                    <th class="px-2 py-1 text-left text-gray-300">Multiplicador</th>
                                    <th class="px-2 py-1 w-6"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <template x-for="(loadItem, idx) in editing.loadMultipliers" :key="idx">
                                    <tr @click="selectLoadMultiplierRow(idx)"
                                        class="border-t border-gray-700 cursor-pointer hover:bg-gray-800"
                                        :class="{'bg-blue-900': selectedLoadMultiplierRow === idx}">
                                        <td class="px-2 py-1 text-gray-300" x-text="loadItem.load"></td>
                                        <td class="px-2 py-1 text-gray-300" x-text="loadItem.multiplier"></td>
                                        <td class="px-2 py-1">
                                            <button @click.stop="deleteLoadMultiplierRow(idx)" class="text-red-400 hover:text-red-300">✕</button>
                                        </td>
                                    </tr>
                                </template>
                                <tr x-show="editing.loadMultipliers.length === 0">
                                    <td colspan="3" class="px-2 py-3 text-center text-gray-500">Sin patrones</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="flex gap-1 items-center">
                            <select x-model="selectedLoad"
                                class="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                <template x-for="lp in availableLoadPatterns" :key="lp">
                                    <option :value="lp" x-text="lp"></option>
                                </template>
                            </select>
                            <input type="number" step="0.05" x-model.number="selectedMultiplier"
                                class="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" placeholder="Mult.">
                        </div>
                        <div class="flex gap-1 mt-2">
                            <button @click="addLoadMultiplier()" class="flex-1 px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-white text-xs">Agregar</button>
                            <button @click="modifyLoadMultiplier()" class="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-xs">Modificar</button>
                            <button @click="deleteLoadMultiplier()" class="flex-1 px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-white text-xs">Eliminar</button>
                        </div>
                    </div>

                    <div class="border border-gray-700 rounded p-3">
                        <label class="block text-xs font-semibold text-blue-400 mb-2">Opciones de Masa</label>
                        <div class="space-y-2">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" x-model="editing.includeLateralMass">
                                <span class="text-sm text-gray-300">Incluir Masa Lateral</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" x-model="editing.includeVerticalMass">
                                <span class="text-sm text-gray-300">Incluir Masa Vertical</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" x-model="editing.lumpLateralMassAtStoryLevels">
                                <span class="text-sm text-gray-300">Concentrar Masa Lateral en Niveles de Piso</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-[11px] text-gray-500 mt-3 leading-snug">
                <b>Masa Propia de Elementos</b>: peso propio de columnas/vigas (A·L·densidad, lo calcula el motor).
                <b>Patrones de Carga</b>: convierte las cargas de área de las losas en masa (asignadas en Assign → Area/Shell Loads).
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="backToList()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveEditor()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    
    <div x-show="showToast" x-cloak class="fixed bottom-5 right-5 z-[300]" x-transition.duration.300ms>
        <div class="px-4 py-3 rounded-lg shadow-lg text-white text-sm" :class="toastType === 'error' ? 'bg-red-600' : (toastType === 'warning' ? 'bg-yellow-600' : 'bg-green-600')">
            <span x-text="toastMessage"></span>
        </div>
    </div>

    <style>
        [x-cloak] { display: none !important; }
        input[type="number"] { -moz-appearance: textfield; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    </style>
</div>

<script>
    function massSourceModal() {
        return {
            open: false,
            view: 'list',            // 'list' | 'editor'

            sources: [],             // lista de fuentes (formato almacenado)
            defaultName: 'Peso sísmico',
            selectedName: null,

            // Nunca null: Alpine evalúa los bindings del editor aunque esté oculto.
            editing: {
                name: '',
                elementSelfMass: true,
                additionalMass: true,
                specifiedLoadPatterns: false,
                adjustMassCentroid: false,
                adjustRatioX: '',
                adjustRatioY: '',
                loadMultipliers: [{ load: 'CM', multiplier: 1 }],
                includeLateralMass: true,
                includeVerticalMass: false,
                lumpLateralMassAtStoryLevels: true,
            },
            editingOriginalName: null,
            isNewSource: false,

            // editor: fila/entrada de multiplicadores
            selectedLoadMultiplierRow: null,
            selectedLoad: 'CM',
            selectedMultiplier: 1,

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            get availableLoadPatterns() {
                const cs = window.cadSystem || {};
                const cases =
                    cs.loadCases || cs.definitions?.loadCases || cs.definitions?.staticLoadCases || [];
                const names = Array.isArray(cases) ? cases.map((c) => c.name || c.id).filter(Boolean) : [];
                return names.length ? [...new Set(names)] : ['CM', 'CV', 'CVE', 'CVT'];
            },

            init() {
                this.loadMassSources();
                window.addEventListener('open-mass-source-modal', () => this.openModal());
            },

            // ── Carga / normalización ────────────────────────────────────────
            defaultEditable(name) {
                return {
                    name: name || 'Peso sísmico',
                    elementSelfMass: true,
                    additionalMass: true,
                    specifiedLoadPatterns: false,
                    adjustMassCentroid: false,
                    adjustRatioX: '',
                    adjustRatioY: '',
                    loadMultipliers: [{ load: 'CM', multiplier: 1 }],
                    includeLateralMass: true,
                    includeVerticalMass: false,
                    lumpLateralMassAtStoryLevels: true,
                };
            },

            // stored (con campos del motor) → editable (solo campos del editor)
            toEditable(s) {
                if (!s) return this.defaultEditable();
                const def = s.massDefinition; // formato antiguo
                return {
                    name: s.name || 'Peso sísmico',
                    elementSelfMass: s.elementSelfMass ?? (def ? def !== 'loads' : s.includeSelfWeight !== false),
                    additionalMass: s.additionalMass ?? true,
                    specifiedLoadPatterns: s.specifiedLoadPatterns ?? (def ? def !== 'self' : false),
                    adjustMassCentroid: s.adjustMassCentroid ?? false,
                    adjustRatioX: s.adjustRatioX ?? '',
                    adjustRatioY: s.adjustRatioY ?? '',
                    loadMultipliers: Array.isArray(s.loadMultipliers) && s.loadMultipliers.length
                        ? JSON.parse(JSON.stringify(s.loadMultipliers))
                        : [{ load: 'CM', multiplier: 1 }],
                    includeLateralMass: s.includeLateralMass ?? (s.includeLateralMassOnly ?? true),
                    includeVerticalMass: s.includeVerticalMass ?? false,
                    lumpLateralMassAtStoryLevels: s.lumpLateralMassAtStoryLevels ?? true,
                };
            },

            // editable → stored (agrega los campos que consume el motor)
            toStored(e) {
                const loadMultipliers = JSON.parse(JSON.stringify(e.loadMultipliers || []));
                return {
                    name: e.name || 'Peso sísmico',
                    enabled: true,
                    elementSelfMass: e.elementSelfMass,
                    additionalMass: e.additionalMass,
                    specifiedLoadPatterns: e.specifiedLoadPatterns,
                    adjustMassCentroid: e.adjustMassCentroid,
                    adjustRatioX: e.adjustRatioX,
                    adjustRatioY: e.adjustRatioY,
                    loadMultipliers,
                    includeLateralMass: e.includeLateralMass,
                    includeVerticalMass: e.includeVerticalMass,
                    lumpLateralMassAtStoryLevels: e.lumpLateralMassAtStoryLevels,
                    // ── compat con el motor (seismic_analysis.py) ──
                    includeSelfWeight: e.elementSelfMass,
                    selfWeightMultiplier: 1.0,
                    includeLateralMassOnly: !e.includeVerticalMass,
                    loadPatterns: e.specifiedLoadPatterns
                        ? loadMultipliers.map((lm) => ({ name: lm.load, type: 'Other', factor: Number(lm.multiplier) || 0 }))
                        : [],
                    massDefinition: e.elementSelfMass && e.specifiedLoadPatterns ? 'both' : (e.specifiedLoadPatterns ? 'loads' : 'self'),
                };
            },

            loadMassSources() {
                const cs = window.cadSystem || {};
                let stored = Array.isArray(cs.massSources) && cs.massSources.length ? cs.massSources : null;
                if (!stored) {
                    const single = cs.massSource;
                    stored = [this.toStored(this.toEditable(single || this.defaultEditable('Peso sísmico')))];
                }
                this.sources = stored.map((s) => this.toStored(this.toEditable(s)));
                this.defaultName = cs.defaultMassSourceName || cs.massSource?.name || this.sources[0]?.name;
                if (!this.sources.some((s) => s.name === this.defaultName)) {
                    this.defaultName = this.sources[0]?.name || 'Peso sísmico';
                }
                this.selectedName = this.defaultName;
            },

            showToastMessage(message, type) {
                if (this.toastTimeout) clearTimeout(this.toastTimeout);
                this.toastMessage = message;
                this.toastType = type || 'success';
                this.showToast = true;
                this.toastTimeout = setTimeout(() => { this.showToast = false; }, 3000);
            },

            openModal() {
                this.loadMassSources();
                this.view = 'list';
                this.open = true;
            },

            close() {
                this.open = false;
                this.view = 'list';
            },

            // ── Acciones de la LISTA ─────────────────────────────────────────
            getSelected() {
                return this.sources.find((s) => s.name === this.selectedName) || null;
            },

            addNewSource() {
                let name = 'MassSource' + (this.sources.length + 1);
                while (this.sources.some((s) => s.name === name)) name += '_';
                this.editing = this.defaultEditable(name);
                this.editingOriginalName = null;
                this.isNewSource = true;
                this.selectedLoadMultiplierRow = null;
                this.view = 'editor';
            },

            addCopySource() {
                const sel = this.getSelected();
                if (!sel) { this.showToastMessage('Selecciona una fuente para copiar', 'warning'); return; }
                const e = this.toEditable(sel);
                let name = sel.name + ' - Copia';
                while (this.sources.some((s) => s.name === name)) name += ' (2)';
                e.name = name;
                this.editing = e;
                this.editingOriginalName = null;
                this.isNewSource = true;
                this.selectedLoadMultiplierRow = null;
                this.view = 'editor';
            },

            modifySource() {
                const sel = this.getSelected();
                if (!sel) { this.showToastMessage('Selecciona una fuente', 'warning'); return; }
                this.editing = this.toEditable(sel);
                this.editingOriginalName = sel.name;
                this.isNewSource = false;
                this.selectedLoadMultiplierRow = null;
                this.view = 'editor';
            },

            deleteSource() {
                const sel = this.getSelected();
                if (!sel) return;
                if (this.sources.length <= 1) { this.showToastMessage('Debe quedar al menos una fuente', 'warning'); return; }
                this.sources = this.sources.filter((s) => s.name !== sel.name);
                if (this.defaultName === sel.name) this.defaultName = this.sources[0].name;
                this.selectedName = this.sources[0].name;
                this.showToastMessage('Fuente "' + sel.name + '" eliminada', 'success');
            },

            // ── Editor: guardar / volver ─────────────────────────────────────
            backToList() {
                this.view = 'list';
            },

            saveEditor() {
                const name = (this.editing.name || '').trim() || 'Peso sísmico';
                // Nombre único (salvo que sea el mismo que editaba)
                const clash = this.sources.some((s) => s.name === name && s.name !== this.editingOriginalName);
                if (clash) { this.showToastMessage('Ya existe una fuente con ese nombre', 'error'); return; }
                this.editing.name = name;
                const stored = this.toStored(this.editing);

                if (this.isNewSource) {
                    this.sources.push(stored);
                } else {
                    const i = this.sources.findIndex((s) => s.name === this.editingOriginalName);
                    if (i >= 0) this.sources[i] = stored; else this.sources.push(stored);
                    if (this.defaultName === this.editingOriginalName) this.defaultName = name;
                }
                this.selectedName = name;
                this.showToastMessage('Fuente "' + name + '" guardada', 'success');
                this.view = 'list';
            },

            // ── Editor: multiplicadores ──────────────────────────────────────
            selectLoadMultiplierRow(idx) {
                this.selectedLoadMultiplierRow = idx;
                const row = this.editing.loadMultipliers[idx];
                if (row) { this.selectedLoad = row.load; this.selectedMultiplier = row.multiplier; }
            },

            addLoadMultiplier() {
                const load = this.selectedLoad;
                if (!load) return;
                if (this.editing.loadMultipliers.some((m) => m.load === load)) {
                    this.showToastMessage('Esa carga ya tiene un multiplicador', 'warning'); return;
                }
                this.editing.loadMultipliers.push({ load, multiplier: Number(this.selectedMultiplier) || 0 });
                this.showToastMessage('Multiplicador agregado', 'success');
            },

            modifyLoadMultiplier() {
                const i = this.selectedLoadMultiplierRow;
                if (i === null || i >= this.editing.loadMultipliers.length) {
                    this.showToastMessage('Seleccione una fila', 'warning'); return;
                }
                this.editing.loadMultipliers[i] = { load: this.selectedLoad, multiplier: Number(this.selectedMultiplier) || 0 };
                this.showToastMessage('Multiplicador modificado', 'success');
            },

            deleteLoadMultiplier() {
                const i = this.selectedLoadMultiplierRow;
                if (i === null || i >= this.editing.loadMultipliers.length) {
                    this.showToastMessage('Seleccione una fila', 'warning'); return;
                }
                this.editing.loadMultipliers.splice(i, 1);
                this.selectedLoadMultiplierRow = null;
            },

            deleteLoadMultiplierRow(idx) {
                this.editing.loadMultipliers.splice(idx, 1);
                if (this.selectedLoadMultiplierRow === idx) this.selectedLoadMultiplierRow = null;
                else if (this.selectedLoadMultiplierRow > idx) this.selectedLoadMultiplierRow--;
            },

            // ── Guardar TODO (OK de la lista) ────────────────────────────────
            saveAll() {
                if (!window.cadSystem) { this.close(); return; }
                window.cadSystem.massSources = JSON.parse(JSON.stringify(this.sources));
                window.cadSystem.defaultMassSourceName = this.defaultName;
                const def = this.sources.find((s) => s.name === this.defaultName) || this.sources[0];
                window.cadSystem.massSource = JSON.parse(JSON.stringify(def)); // activa = la default
                this.showToastMessage('✅ Fuente de masa por defecto: ' + (def?.name || '—'), 'success');
                window.cadSystem.showMessage?.('Fuente de masa por defecto: "' + (def?.name || '') + '".');
                window.cadSystem.markAnalysisResultsOutdated?.('Se modificó la Fuente de Masa.');
                this.close();
            },
        };
    }
</script>
<?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/cad/modals/mass-source-modal.blade.php ENDPATH**/ ?>