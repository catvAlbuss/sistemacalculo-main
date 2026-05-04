{{-- resources/views/components/cad/modals/static-load-cases-modal.blade.php --}}
<div x-data="staticLoadCasesModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    {{-- Modal Principal - Lista de Casos de Carga Estáticos --}}
    <div x-show="view === 'list'" x-cloak class="bg-gray-800 rounded-lg shadow-2xl w-[650px] border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Definir Nombres de Casos de Carga Estáticos</h3>
            <button @click="close()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4">
            <div class="border border-gray-700 rounded-md bg-gray-900 max-h-80 overflow-y-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-800 sticky top-0">
                        <tr>
                            <th class="px-4 py-2 text-left text-gray-300">Carga</th>
                            <th class="px-4 py-2 text-left text-gray-300">Tipo</th>
                            <th class="px-4 py-2 text-left text-gray-300">Multiplicador de Peso Propio</th>
                            <th class="px-4 py-2 text-left text-gray-300">Carga Lateral Automática</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="(loadCase, idx) in loadCases" :key="loadCase.name">
                            <tr
                                @click="selectLoadCase(idx)"
                                class="border-t border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                                :class="{'bg-blue-900': selectedLoadCaseIndex === idx}">
                                <td class="px-4 py-2 text-gray-300 font-mono" x-text="loadCase.name"></td>
                                <td class="px-4 py-2 text-gray-400" x-text="loadCase.type"></td>
                                <td class="px-4 py-2 text-gray-400" x-text="loadCase.selfWeightMultiplier"></td>
                                <td class="px-4 py-2 text-gray-400" x-text="loadCase.autoLateralLoad"></td>
                            </tr>
                        </template>
                        <tr x-show="loadCases.length === 0">
                            <td colspan="4" class="px-4 py-8 text-center text-gray-500">No hay casos de carga definidos</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="mt-3 text-xs text-gray-400">Haga clic para:</div>
            <div class="mt-2 space-y-1">
                <button @click="openLoadCaseForm(true)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Nueva Carga
                </button>
                <button @click="if(selectedLoadCaseIndex !== null) openLoadCaseForm(false)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': selectedLoadCaseIndex === null}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modificar Carga
                </button>
                <button @click="openLateralLoadDialog()" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': selectedLoadCaseIndex === null}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h2m12-6h2M5 12v6m12-6v6M9 6h6m-4 6h4m-8 0h2" />
                    </svg>
                    Modificar Carga Lateral...
                </button>
                <button @click="if(selectedLoadCaseIndex !== null) confirmDeleteLoadCase()" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': selectedLoadCaseIndex === null}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar Carga
                </button>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="close()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveAllLoadCases()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    {{-- Modal para Agregar/Modificar Carga --}}
    <div x-show="view === 'loadCaseForm'" x-cloak class="bg-gray-800 rounded-lg shadow-2xl w-[500px] border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white" x-text="isNewLoadCase ? 'Agregar Nueva Carga' : 'Modificar Carga'"></h3>
            <button @click="backToList()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4">
            {{-- Nombre de la Carga --}}
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-1">Carga</label>
                <input x-model="loadCaseForm.name" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" placeholder="DEAD">
            </div>

            {{-- Tipo de Carga --}}
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-1">Tipo</label>
                <select x-model="loadCaseForm.type" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    <option value="DEAD">DEAD - Carga Muerta</option>
                    <option value="LIVE">LIVE - Carga Viva</option>
                    <option value="WIND">WIND - Viento</option>
                    <option value="SNOW">SNOW - Nieve</option>
                    <option value="EARTHQUAKE">EARTHQUAKE - Sismo</option>
                    <option value="ROOF LIVE">ROOF LIVE - Carga Viva de Techo</option>
                </select>
            </div>

            {{-- Multiplicador de Peso Propio --}}
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-1">Multiplicador de Peso Propio</label>
                <input type="number" step="0.1" x-model="loadCaseForm.selfWeightMultiplier" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
            </div>

            {{-- Carga Lateral Automática --}}
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-1">Carga Lateral Automática</label>
                <select x-model="loadCaseForm.autoLateralLoad" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    <option value="0">0 - Ninguna</option>
                    <option value="1">1 - UBC 97</option>
                    <option value="2">2 - ASCE 7-05</option>
                    <option value="3">3 - ASCE 7-10</option>
                    <option value="4">4 - IBC 2006</option>
                    <option value="5">5 - IBC 2009</option>
                    <option value="6">6 - NBCC 2005</option>
                    <option value="7">7 - NSR-10</option>
                </select>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="backToList()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveLoadCase()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    {{-- Modal para Carga Lateral Automática (UBC 97) --}}
    <div x-show="showLateralLoadDialog" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showLateralLoadDialog = false">
        <div class="bg-gray-800 rounded-lg shadow-2xl w-[500px] border border-gray-700">
            <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
                <h3 class="text-lg font-semibold text-white">Parámetros de Carga Lateral Automática</h3>
                <button @click="showLateralLoadDialog = false" class="float-right text-gray-400 hover:text-white">✕</button>
            </div>
            <div class="p-4">
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-1">Código Sísmico</label>
                    <select x-model="lateralLoadParams.code" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        <option value="UBC97">UBC 97</option>
                        <option value="ASCE7">ASCE 7</option>
                        <option value="IBC">IBC</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-1">Coeficiente Sísmico (Cs)</label>
                    <input type="number" step="0.01" x-model="lateralLoadParams.coefficient" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-1">Zona Sísmica</label>
                    <select x-model="lateralLoadParams.zone" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        <option value="1">Zona 1</option>
                        <option value="2">Zona 2</option>
                        <option value="2A">Zona 2A</option>
                        <option value="2B">Zona 2B</option>
                        <option value="3">Zona 3</option>
                        <option value="4">Zona 4</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-1">Factor de Importancia (I)</label>
                    <input type="number" step="0.1" x-model="lateralLoadParams.importance" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-1">Factor de Modificación de Respuesta (R)</label>
                    <input type="number" step="0.5" x-model="lateralLoadParams.responseMod" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-1">Tipo de Suelo</label>
                    <select x-model="lateralLoadParams.soilType" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        <option value="S1">S1 - Roca</option>
                        <option value="S2">S2 - Suelo Denso</option>
                        <option value="S3">S3 - Suelo Blando</option>
                        <option value="S4">S4 - Suelo Muy Blando</option>
                    </select>
                </div>
            </div>
            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
                <button @click="showLateralLoadDialog = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
                <button @click="saveLateralLoadParams()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
            </div>
        </div>
    </div>

    {{-- Toast --}}
    <div x-show="showToast" x-cloak class="fixed bottom-5 right-5 z-[300]" x-transition.duration.300ms>
        <div class="px-4 py-3 rounded-lg shadow-lg text-white text-sm" :class="toastType === 'error' ? 'bg-red-600' : (toastType === 'warning' ? 'bg-yellow-600' : 'bg-green-600')">
            <span x-text="toastMessage"></span>
        </div>
    </div>

    <style>
        [x-cloak] {
            display: none !important;
        }

        input[type="number"] {
            -moz-appearance: textfield;
        }
    </style>
</div>

<script>
    function staticLoadCasesModal() {
        return {
            open: false,
            view: 'list', // list, loadCaseForm
            loadCases: [],
            selectedLoadCaseIndex: null,
            editingLoadCaseIndex: null,
            isNewLoadCase: true,

            showLateralLoadDialog: false,

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            loadCaseForm: {
                name: 'DEAD',
                type: 'DEAD',
                selfWeightMultiplier: 1,
                autoLateralLoad: '0'
            },

            lateralLoadParams: {
                code: 'UBC97',
                coefficient: 0.1,
                zone: '3',
                importance: 1,
                responseMod: 3.5,
                soilType: 'S2'
            },

            defaultLoadCases: [{
                    name: "DEAD",
                    type: "DEAD",
                    selfWeightMultiplier: 1,
                    autoLateralLoad: "0"
                },
                {
                    name: "LIVE",
                    type: "LIVE",
                    selfWeightMultiplier: 0,
                    autoLateralLoad: "1"
                }
            ],

            init() {
                this.loadLoadCases();
                window.addEventListener('open-static-load-cases-modal', () => {
                    this.openModal();
                });
            },

            loadLoadCases() {
                if (window.cadSystem && window.cadSystem.staticLoadCases && window.cadSystem.staticLoadCases.items && window.cadSystem.staticLoadCases.items.length > 0) {
                    this.loadCases = window.cadSystem.staticLoadCases.items;
                } else {
                    this.loadCases = JSON.parse(JSON.stringify(this.defaultLoadCases));
                    if (window.cadSystem) {
                        if (!window.cadSystem.staticLoadCases) window.cadSystem.staticLoadCases = {};
                        window.cadSystem.staticLoadCases.items = this.loadCases;
                    }
                }
            },

            showToastMessage(message, type) {
                if (this.toastTimeout) clearTimeout(this.toastTimeout);
                this.toastMessage = message;
                this.toastType = type || 'success';
                this.showToast = true;
                setTimeout(() => {
                    this.showToast = false;
                }, 2500);
            },

            openModal() {
                this.loadLoadCases();
                this.open = true;
                this.view = 'list';
                this.selectedLoadCaseIndex = null;
            },

            close() {
                this.open = false;
                this.view = 'list';
                this.selectedLoadCaseIndex = null;
                this.showLateralLoadDialog = false;
            },

            selectLoadCase(idx) {
                this.selectedLoadCaseIndex = idx;
            },

            openLoadCaseForm(isNew) {
                this.isNewLoadCase = isNew;

                if (!isNew && this.selectedLoadCaseIndex !== null) {
                    var loadCase = this.loadCases[this.selectedLoadCaseIndex];
                    this.loadCaseForm = {
                        name: loadCase.name,
                        type: loadCase.type,
                        selfWeightMultiplier: loadCase.selfWeightMultiplier,
                        autoLateralLoad: loadCase.autoLateralLoad
                    };
                    this.editingLoadCaseIndex = this.selectedLoadCaseIndex;
                } else {
                    this.loadCaseForm = {
                        name: 'NEW',
                        type: 'LIVE',
                        selfWeightMultiplier: 0,
                        autoLateralLoad: '0'
                    };
                    this.editingLoadCaseIndex = null;
                }
                this.view = 'loadCaseForm';
            },

            openLateralLoadDialog() {
                if (this.selectedLoadCaseIndex === null) {
                    this.showToastMessage('Por favor seleccione una carga primero', 'warning');
                    return;
                }
                this.showLateralLoadDialog = true;
            },

            saveLateralLoadParams() {
                if (this.selectedLoadCaseIndex !== null) {
                    this.loadCases[this.selectedLoadCaseIndex].autoLateralLoad = '1';
                    this.showToastMessage('Parámetros de carga lateral guardados', 'success');
                }
                this.showLateralLoadDialog = false;
            },

            backToList() {
                this.view = 'list';
            },

            saveLoadCase() {
                if (!this.loadCaseForm.name) {
                    this.showToastMessage('El nombre de la carga es requerido', 'error');
                    return;
                }

                var loadCaseToSave = {
                    name: this.loadCaseForm.name,
                    type: this.loadCaseForm.type,
                    selfWeightMultiplier: this.loadCaseForm.selfWeightMultiplier,
                    autoLateralLoad: this.loadCaseForm.autoLateralLoad
                };

                if (!this.isNewLoadCase && this.editingLoadCaseIndex !== null) {
                    this.loadCases[this.editingLoadCaseIndex] = loadCaseToSave;
                    this.showToastMessage('Carga "' + loadCaseToSave.name + '" modificada', 'success');
                } else {
                    var exists = false;
                    for (var i = 0; i < this.loadCases.length; i++) {
                        if (this.loadCases[i].name === loadCaseToSave.name) {
                            exists = true;
                            break;
                        }
                    }
                    if (exists) {
                        this.showToastMessage('La carga "' + loadCaseToSave.name + '" ya existe', 'error');
                        return;
                    }
                    this.loadCases.push(loadCaseToSave);
                    this.showToastMessage('Carga "' + loadCaseToSave.name + '" agregada', 'success');
                }

                this.selectedLoadCaseIndex = null;
                this.view = 'list';
            },

            saveAllLoadCases() {
                if (window.cadSystem) {
                    if (!window.cadSystem.staticLoadCases) window.cadSystem.staticLoadCases = {};
                    window.cadSystem.staticLoadCases.items = this.loadCases;
                }
                this.close();
                this.showToastMessage('Casos de carga guardados', 'success');
            },

            confirmDeleteLoadCase: function() {
                if (this.selectedLoadCaseIndex === null) {
                    this.showToastMessage('Por favor seleccione una carga para eliminar', 'warning');
                    return;
                }

                var loadCaseName = this.loadCases[this.selectedLoadCaseIndex].name;

                if (confirm('¿Está seguro de eliminar la carga "' + loadCaseName + '"?')) {
                    this.loadCases.splice(this.selectedLoadCaseIndex, 1);
                    this.selectedLoadCaseIndex = null;
                    this.showToastMessage('Carga "' + loadCaseName + '" eliminada', 'success');
                }
            }
        }
    }
</script>