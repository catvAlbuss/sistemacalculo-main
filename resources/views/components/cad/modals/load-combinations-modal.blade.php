{{-- resources/views/components/cad/modals/load-combinations-modal.blade.php --}}
<div x-data="loadCombinationsModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    {{-- Modal Principal - Lista de Combinaciones --}}
    <div x-show="view === 'list'" x-cloak class="bg-gray-800 rounded-lg shadow-2xl w-[550px] border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Definir Combinaciones de Carga</h3>
            <button @click="close()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4">
            <div class="mb-2 text-xs text-gray-400">Combinaciones</div>
            <div class="border border-gray-700 rounded-md bg-gray-900 max-h-64 overflow-y-auto">
                <table class="w-full text-sm">
                    <tbody>
                        <template x-for="(combo, idx) in combinations" :key="combo.name">
                            <tr
                                @click="selectCombination(idx)"
                                class="border-t border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                                :class="{'bg-blue-900': selectedCombinationIndex === idx}">
                                <td class="px-4 py-2 text-gray-300 font-mono" x-text="combo.name"></td>
                            </tr>
                        </template>
                        <tr x-show="combinations.length === 0">
                            <td class="px-4 py-8 text-center text-gray-500">No hay combinaciones de carga definidas</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="mt-3 text-xs text-gray-400">Haga clic para:</div>
            <div class="mt-2 space-y-1">
                <button @click="openCombinationForm(true)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Nueva Combinación...
                </button>
                <button @click="if(selectedCombinationIndex !== null) openCombinationForm(false)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': selectedCombinationIndex === null}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modificar/Mostrar Combinación...
                </button>
                <button @click="if(selectedCombinationIndex !== null) confirmDelete()" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': selectedCombinationIndex === null}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar Combinación
                </button>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="close()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveAllCombinations()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    {{-- Modal de Datos de Combinación de Carga --}}
    <div x-show="view === 'combinationForm'" x-cloak class="bg-gray-800 rounded-lg shadow-2xl w-[700px] max-h-[90vh] overflow-hidden border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Datos de Combinación de Carga</h3>
            <button @click="backToList()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[75vh]">
            {{-- Nombre de la Combinación --}}
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-1">Nombre de la Combinación de Carga</label>
                <input x-model="combinationForm.name" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" placeholder="COMB1">
            </div>

            {{-- Tipo de Combinación --}}
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-1">Tipo de Combinación de Carga</label>
                <select x-model="combinationForm.combinationType" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    <option value="ADD">ADD - Adición</option>
                    <option value="ENVE">ENVE - Envolvente</option>
                    <option value="ABS">ABS - Valor Absoluto</option>
                    <option value="SRSS">SRSS - Raíz Cuadrada de la Suma de Cuadrados</option>
                </select>
            </div>

            {{-- Tabla de Casos de Carga --}}
            <div class="border border-gray-700 rounded-md p-3 mb-4 bg-gray-900">
                <label class="block text-xs font-semibold text-blue-400 mb-2">Casos de Carga</label>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm mb-2">
                        <thead class="bg-gray-800">
                            <tr>
                                <th class="px-3 py-2 text-left text-gray-300">Nombre del Caso</th>
                                <th class="px-3 py-2 text-left text-gray-300">Factor de Escala</th>
                                <th class="px-3 py-2 w-8"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template x-for="(loadItem, idx) in combinationForm.loadCases" :key="idx">
                                <tr
                                    @click="selectLoadCaseRow(idx)"
                                    class="border-t border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                                    :class="{'bg-blue-900': selectedLoadCaseRow === idx}">
                                    <td class="px-3 py-1"><span x-text="loadItem.name" class="text-gray-300"></span></td>
                                    <td class="px-3 py-1"><span x-text="loadItem.scale" class="text-gray-300"></span></td>
                                    <td class="px-3 py-1">
                                        <button @click.stop="deleteLoadCaseRow(idx)" class="text-red-400 hover:text-red-300">✕</button>
                                    </td>
                                </tr>
                            </template>
                            <tr x-show="combinationForm.loadCases.length === 0">
                                <td colspan="3" class="px-3 py-4 text-center text-gray-500">No hay casos de carga definidos</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="flex gap-2 mt-2">
                    <div class="flex-1">
                        <select x-model="combinationForm.caseName" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            <option value="DEAD Static Load">DEAD Static Load</option>
                            <option value="LIVE Static Load">LIVE Static Load</option>
                            <option value="MODE">MODE</option>
                            <option value="WIND Static Load">WIND Static Load</option>
                            <option value="SNOW Static Load">SNOW Static Load</option>
                            <option value="EARTHQUAKE Static Load">EARTHQUAKE Static Load</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <input type="number" step="any" x-model="combinationForm.scaleFactor" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm" placeholder="Factor de Escala">
                    </div>
                    <button @click="addLoadCase()" class="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-white text-sm">Agregar</button>
                    <button @click="modifyLoadCase()" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm" :class="{'opacity-50 cursor-not-allowed': selectedLoadCaseRow === null}">Modificar</button>
                    <button @click="deleteLoadCase()" class="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white text-sm" :class="{'opacity-50 cursor-not-allowed': selectedLoadCaseRow === null}">Eliminar</button>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="backToList()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveCombination()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    {{-- Modal de confirmación --}}
    <div x-show="showConfirmModal" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showConfirmModal = false">
        <div class="bg-gray-800 rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
                <h3 class="text-lg font-semibold text-white">Confirmar Eliminación</h3>
            </div>
            <div class="p-4">
                <p class="text-gray-300" x-text="'¿Está seguro de eliminar la combinación ' + combinationToDelete + '?'"></p>
                <p class="text-xs text-red-400 mt-2">Esta acción no se puede deshacer.</p>
            </div>
            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
                <button @click="showConfirmModal = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
                <button @click="performDelete" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded">Eliminar</button>
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

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
    </style>
</div>

<script>
    function loadCombinationsModal() {
        return {
            open: false,
            view: 'list',
            combinations: [],
            selectedCombinationIndex: null,
            editingCombinationIndex: null,
            isNewCombination: true,

            selectedLoadCaseRow: null,

            showConfirmModal: false,
            combinationToDelete: null,

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            combinationForm: {
                name: 'COMB1',
                combinationType: 'ADD',
                caseName: 'DEAD Static Load',
                scaleFactor: 1,
                loadCases: [{
                    name: 'DEAD Static Load',
                    scale: 1
                }]
            },

            defaultCombinations: [{
                    name: "COMB1",
                    combinationType: "ADD",
                    loadCases: [{
                        name: "DEAD Static Load",
                        scale: 1
                    }]
                },
                {
                    name: "COMB2",
                    combinationType: "ADD",
                    loadCases: [{
                        name: "DEAD Static Load",
                        scale: 1
                    }, {
                        name: "LIVE Static Load",
                        scale: 1
                    }]
                },
                {
                    name: "COMB3",
                    combinationType: "ENVE",
                    loadCases: [{
                        name: "DEAD Static Load",
                        scale: 1.4
                    }, {
                        name: "LIVE Static Load",
                        scale: 1.7
                    }]
                }
            ],

            init() {
                this.loadCombinations();
                window.addEventListener('open-load-combinations-modal', () => {
                    this.openModal();
                });
            },

            loadCombinations() {
                if (window.cadSystem && window.cadSystem.loadCombinations && window.cadSystem.loadCombinations.items && window.cadSystem.loadCombinations.items.length > 0) {
                    this.combinations = window.cadSystem.loadCombinations.items;
                } else {
                    this.combinations = JSON.parse(JSON.stringify(this.defaultCombinations));
                    if (window.cadSystem) {
                        if (!window.cadSystem.loadCombinations) window.cadSystem.loadCombinations = {};
                        window.cadSystem.loadCombinations.items = this.combinations;
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
                this.loadCombinations();
                this.open = true;
                this.view = 'list';
                this.selectedCombinationIndex = null;
            },

            close() {
                this.open = false;
                this.view = 'list';
                this.selectedCombinationIndex = null;
                this.showConfirmModal = false;
            },

            selectCombination(idx) {
                this.selectedCombinationIndex = idx;
            },

            selectLoadCaseRow(idx) {
                this.selectedLoadCaseRow = idx;
            },

            openCombinationForm(isNew) {
                this.isNewCombination = isNew;
                this.selectedLoadCaseRow = null;

                if (!isNew && this.selectedCombinationIndex !== null) {
                    var combo = this.combinations[this.selectedCombinationIndex];
                    this.combinationForm = {
                        name: combo.name,
                        combinationType: combo.combinationType || 'ADD',
                        caseName: 'DEAD Static Load',
                        scaleFactor: 1,
                        loadCases: combo.loadCases ? JSON.parse(JSON.stringify(combo.loadCases)) : [{
                            name: 'DEAD Static Load',
                            scale: 1
                        }]
                    };
                    this.editingCombinationIndex = this.selectedCombinationIndex;
                } else {
                    this.combinationForm = {
                        name: 'COMB' + (this.combinations.length + 1),
                        combinationType: 'ADD',
                        caseName: 'DEAD Static Load',
                        scaleFactor: 1,
                        loadCases: [{
                            name: 'DEAD Static Load',
                            scale: 1
                        }]
                    };
                    this.editingCombinationIndex = null;
                }
                this.view = 'combinationForm';
            },

            backToList() {
                this.view = 'list';
                this.selectedLoadCaseRow = null;
            },

            addLoadCase() {
                if (this.combinationForm.caseName && this.combinationForm.scaleFactor !== undefined) {
                    var exists = false;
                    for (var i = 0; i < this.combinationForm.loadCases.length; i++) {
                        if (this.combinationForm.loadCases[i].name === this.combinationForm.caseName) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) {
                        this.combinationForm.loadCases.push({
                            name: this.combinationForm.caseName,
                            scale: this.combinationForm.scaleFactor
                        });
                        this.showToastMessage('Caso de carga agregado', 'success');
                    } else {
                        this.showToastMessage('El caso de carga ya existe', 'warning');
                    }
                }
            },

            modifyLoadCase() {
                if (this.selectedLoadCaseRow !== null && this.selectedLoadCaseRow < this.combinationForm.loadCases.length) {
                    var oldName = this.combinationForm.loadCases[this.selectedLoadCaseRow].name;
                    this.combinationForm.loadCases[this.selectedLoadCaseRow] = {
                        name: this.combinationForm.caseName,
                        scale: this.combinationForm.scaleFactor
                    };
                    this.showToastMessage('Caso de carga modificado de "' + oldName + '" a "' + this.combinationForm.caseName + '"', 'success');
                    this.selectedLoadCaseRow = null;
                } else {
                    this.showToastMessage('Seleccione un caso de carga de la tabla para modificar', 'warning');
                }
            },

            deleteLoadCase() {
                if (this.selectedLoadCaseRow !== null && this.selectedLoadCaseRow < this.combinationForm.loadCases.length) {
                    var deletedName = this.combinationForm.loadCases[this.selectedLoadCaseRow].name;
                    this.combinationForm.loadCases.splice(this.selectedLoadCaseRow, 1);
                    this.selectedLoadCaseRow = null;
                    this.showToastMessage('Caso de carga "' + deletedName + '" eliminado', 'success');
                } else {
                    this.showToastMessage('Seleccione un caso de carga de la tabla para eliminar', 'warning');
                }
            },

            deleteLoadCaseRow(idx) {
                var deletedName = this.combinationForm.loadCases[idx].name;
                this.combinationForm.loadCases.splice(idx, 1);
                if (this.selectedLoadCaseRow === idx) {
                    this.selectedLoadCaseRow = null;
                } else if (this.selectedLoadCaseRow > idx) {
                    this.selectedLoadCaseRow--;
                }
                this.showToastMessage('Caso de carga "' + deletedName + '" eliminado', 'success');
            },

            saveCombination() {
                if (!this.combinationForm.name) {
                    this.showToastMessage('El nombre de la combinación es requerido', 'error');
                    return;
                }

                if (this.combinationForm.loadCases.length === 0) {
                    this.showToastMessage('Debe agregar al menos un caso de carga', 'error');
                    return;
                }

                var combinationToSave = {
                    name: this.combinationForm.name,
                    combinationType: this.combinationForm.combinationType,
                    loadCases: JSON.parse(JSON.stringify(this.combinationForm.loadCases))
                };

                if (!this.isNewCombination && this.editingCombinationIndex !== null) {
                    this.combinations[this.editingCombinationIndex] = combinationToSave;
                    this.showToastMessage('Combinación "' + combinationToSave.name + '" modificada', 'success');
                } else {
                    var exists = false;
                    for (var i = 0; i < this.combinations.length; i++) {
                        if (this.combinations[i].name === combinationToSave.name) {
                            exists = true;
                            break;
                        }
                    }
                    if (exists) {
                        this.showToastMessage('La combinación "' + combinationToSave.name + '" ya existe', 'error');
                        return;
                    }
                    this.combinations.push(combinationToSave);
                    this.showToastMessage('Combinación "' + combinationToSave.name + '" agregada', 'success');
                }

                if (window.cadSystem) {
                    if (!window.cadSystem.loadCombinations) window.cadSystem.loadCombinations = {};
                    window.cadSystem.loadCombinations.items = this.combinations;
                }

                this.selectedCombinationIndex = null;
                this.view = 'list';
            },

            saveAllCombinations() {
                if (window.cadSystem) {
                    if (!window.cadSystem.loadCombinations) window.cadSystem.loadCombinations = {};
                    window.cadSystem.loadCombinations.items = this.combinations;
                }
                this.close();
                this.showToastMessage('Combinaciones guardadas', 'success');
            },

            confirmDelete: function() {
                if (this.selectedCombinationIndex === null) {
                    this.showToastMessage('Por favor seleccione una combinación para eliminar', 'warning');
                    return;
                }
                this.combinationToDelete = this.combinations[this.selectedCombinationIndex].name;
                this.showConfirmModal = true;
            },

            performDelete: function() {
                var deletedName = this.combinationToDelete;
                this.combinations.splice(this.selectedCombinationIndex, 1);
                this.selectedCombinationIndex = null;
                this.showConfirmModal = false;

                if (window.cadSystem) {
                    if (!window.cadSystem.loadCombinations) window.cadSystem.loadCombinations = {};
                    window.cadSystem.loadCombinations.items = this.combinations;
                }

                this.showToastMessage('Combinación "' + deletedName + '" eliminada', 'success');
            }
        }
    }
</script>