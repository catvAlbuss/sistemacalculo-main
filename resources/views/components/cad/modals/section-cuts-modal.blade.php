{{-- resources/views/components/cad/modals/section-cuts-modal.blade.php --}}
<div x-data="sectionCutsModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    {{-- Modal Principal - Lista de Section Cuts --}}
    <div x-show="view === 'list'" x-cloak class="bg-gray-800 rounded-lg shadow-2xl w-[450px] border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Cortes de Sección</h3>
            <button @click="close()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4">
            <div class="mb-2 text-xs text-gray-400">Cortes de Sección</div>
            <div class="border border-gray-700 rounded-md bg-gray-900 max-h-64 overflow-y-auto">
                <table class="w-full text-sm">
                    <tbody>
                        <template x-for="sectionCut in sectionCuts" :key="sectionCut.name">
                            <tr
                                @click="selectSectionCut(sectionCut.name)"
                                class="border-t border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                                :class="{'bg-blue-900': selectedSectionCutName === sectionCut.name}">
                                <td class="px-4 py-2 text-gray-300 font-mono" x-text="sectionCut.name"></td>
                                <td>
                        </template>
                        <tr x-show="sectionCuts.length === 0">
                            <td class="px-4 py-8 text-center text-gray-500">No hay cortes de sección definidos</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="mt-3 text-xs text-gray-400">Haga clic para:</div>
            <div class="mt-2 space-y-1">
                <button @click="openSectionCutForm(true)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Corte de Sección...
                </button>
                <button @click="if(selectedSectionCutName) openSectionCutForm(false)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedSectionCutName}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modificar/Mostrar Corte de Sección...
                </button>
                <button @click="if(selectedSectionCutName) confirmDelete()" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedSectionCutName}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar Corte de Sección
                </button>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="close()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="close()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    {{-- Modal de Datos de Section Cut (Agregar/Editar) --}}
    <div x-show="view === 'form'" x-cloak class="bg-gray-800 rounded-lg shadow-2xl w-[500px] border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Datos del Corte de Sección</h3>
            <button @click="backToList()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4">
            {{-- Nombre del Section Cut --}}
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-1">Nombre del Corte de Sección</label>
                <input x-model="sectionCutForm.name" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" placeholder="SCUT1">
            </div>

            {{-- Grupo --}}
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-1">Grupo</label>
                <select x-model="sectionCutForm.group" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    <option value="ALL">ALL</option>
                    <option value="NONE">NONE</option>
                    <option value="GROUP1">GROUP1</option>
                    <option value="GROUP2">GROUP2</option>
                </select>
            </div>

            {{-- Summation about this Location --}}
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-2">Sumatoria sobre esta Ubicación</label>
                <div class="space-y-2">
                    <label class="flex items-center gap-2">
                        <input type="radio" value="Default" x-model="sectionCutForm.summationType">
                        <span class="text-sm">Por Defecto</span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" value="User Defined" x-model="sectionCutForm.summationType">
                        <span class="text-sm">Definido por el Usuario</span>
                    </label>
                </div>

                {{-- Coordenadas (solo si User Defined) --}}
                <div x-show="sectionCutForm.summationType === 'User Defined'" class="mt-3 ml-6">
                    <div class="grid grid-cols-3 gap-3">
                        <div>
                            <label class="block text-xs text-gray-400">X</label>
                            <input type="number" step="any" x-model="sectionCutForm.userX" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400">Y</label>
                            <input type="number" step="any" x-model="sectionCutForm.userY" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400">Z</label>
                            <input type="number" step="any" x-model="sectionCutForm.userZ" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                    </div>
                </div>
            </div>

            {{-- Local 1-Axis Orientation --}}
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-2">Orientación del Eje Local 1</label>
                <div class="flex items-center gap-3">
                    <span class="text-sm text-gray-400">Ángulo</span>
                    <input type="number" step="any" x-model="sectionCutForm.angle" class="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    <span class="text-sm text-gray-400">grados</span>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="backToList()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveSectionCut()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    {{-- Modal de confirmación --}}
    <div x-show="showConfirmModal" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showConfirmModal = false">
        <div class="bg-gray-800 rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
                <h3 class="text-lg font-semibold text-white">Confirmar Eliminación</h3>
            </div>
            <div class="p-4">
                <p class="text-gray-300" x-text="'¿Está seguro de eliminar el corte de sección ' + sectionCutToDelete + '?'"></p>
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
    </style>
</div>

<script>
    function sectionCutsModal() {
        return {
            open: false,
            view: 'list', // list, form
            sectionCuts: [],
            selectedSectionCutName: null,
            editingSectionCut: null,

            showConfirmModal: false,
            sectionCutToDelete: null,

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            sectionCutForm: {
                name: 'SCUT1',
                group: 'ALL',
                summationType: 'Default',
                userX: 0,
                userY: 0,
                userZ: 0,
                angle: 0
            },

            defaultSectionCuts: [{
                name: "SCUT1",
                group: "ALL",
                summationType: "Default",
                userX: 0,
                userY: 0,
                userZ: 0,
                angle: 0,
                description: "Corte de sección SCUT1"
            }],

            init() {
                this.loadSectionCuts();
                window.addEventListener('open-section-cuts-modal', () => {
                    this.openModal();
                });
            },

            loadSectionCuts() {
                if (window.cadSystem && window.cadSystem.sectionCuts && window.cadSystem.sectionCuts.items && window.cadSystem.sectionCuts.items.length > 0) {
                    this.sectionCuts = window.cadSystem.sectionCuts.items;
                } else {
                    this.sectionCuts = JSON.parse(JSON.stringify(this.defaultSectionCuts));
                    if (window.cadSystem) {
                        if (!window.cadSystem.sectionCuts) window.cadSystem.sectionCuts = {};
                        window.cadSystem.sectionCuts.items = this.sectionCuts;
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
                this.loadSectionCuts();
                this.open = true;
                this.view = 'list';
                this.selectedSectionCutName = null;
            },

            close() {
                this.open = false;
                this.view = 'list';
                this.selectedSectionCutName = null;
                this.showConfirmModal = false;
            },

            selectSectionCut(name) {
                this.selectedSectionCutName = name;
            },

            openSectionCutForm(isNew) {
                if (!isNew && !this.selectedSectionCutName) {
                    this.showToastMessage('Por favor seleccione un corte de sección primero', 'warning');
                    return;
                }

                if (!isNew && this.selectedSectionCutName) {
                    var sectionCut = null;
                    for (var i = 0; i < this.sectionCuts.length; i++) {
                        if (this.sectionCuts[i].name === this.selectedSectionCutName) {
                            sectionCut = this.sectionCuts[i];
                            break;
                        }
                    }
                    if (sectionCut) {
                        this.editingSectionCut = JSON.parse(JSON.stringify(sectionCut));
                        this.sectionCutForm.name = sectionCut.name;
                        this.sectionCutForm.group = sectionCut.group || 'ALL';
                        this.sectionCutForm.summationType = sectionCut.summationType || 'Default';
                        this.sectionCutForm.userX = sectionCut.userX || 0;
                        this.sectionCutForm.userY = sectionCut.userY || 0;
                        this.sectionCutForm.userZ = sectionCut.userZ || 0;
                        this.sectionCutForm.angle = sectionCut.angle || 0;
                    }
                } else {
                    this.editingSectionCut = null;
                    this.sectionCutForm = {
                        name: 'SCUT1',
                        group: 'ALL',
                        summationType: 'Default',
                        userX: 0,
                        userY: 0,
                        userZ: 0,
                        angle: 0
                    };
                }
                this.view = 'form';
            },

            backToList() {
                this.view = 'list';
            },

            saveSectionCut() {
                if (!this.sectionCutForm.name) {
                    this.showToastMessage('El nombre del corte de sección es requerido', 'error');
                    return;
                }

                var sectionCutToSave = {
                    name: this.sectionCutForm.name,
                    group: this.sectionCutForm.group,
                    summationType: this.sectionCutForm.summationType,
                    userX: this.sectionCutForm.userX,
                    userY: this.sectionCutForm.userY,
                    userZ: this.sectionCutForm.userZ,
                    angle: this.sectionCutForm.angle,
                    description: 'Corte de sección ' + this.sectionCutForm.name
                };

                if (this.editingSectionCut) {
                    for (var j = 0; j < this.sectionCuts.length; j++) {
                        if (this.sectionCuts[j].name === this.editingSectionCut.name) {
                            this.sectionCuts[j] = sectionCutToSave;
                            break;
                        }
                    }
                    this.showToastMessage('Corte de sección "' + sectionCutToSave.name + '" modificado', 'success');
                } else {
                    var exists = false;
                    for (var i = 0; i < this.sectionCuts.length; i++) {
                        if (this.sectionCuts[i].name === sectionCutToSave.name) {
                            exists = true;
                            break;
                        }
                    }
                    if (exists) {
                        this.showToastMessage('El corte de sección "' + sectionCutToSave.name + '" ya existe', 'error');
                        return;
                    }
                    this.sectionCuts.push(sectionCutToSave);
                    this.showToastMessage('Corte de sección "' + sectionCutToSave.name + '" agregado', 'success');
                }

                if (window.cadSystem) {
                    if (!window.cadSystem.sectionCuts) window.cadSystem.sectionCuts = {};
                    window.cadSystem.sectionCuts.items = this.sectionCuts;
                }

                this.view = 'list';
                this.selectedSectionCutName = sectionCutToSave.name;
                this.editingSectionCut = null;
            },

            confirmDelete: function() {
                if (!this.selectedSectionCutName) {
                    this.showToastMessage('Por favor seleccione un corte de sección para eliminar', 'warning');
                    return;
                }
                this.sectionCutToDelete = this.selectedSectionCutName;
                this.showConfirmModal = true;
            },

            performDelete: function() {
                var deletedName = this.sectionCutToDelete;
                var newSectionCuts = [];
                for (var i = 0; i < this.sectionCuts.length; i++) {
                    if (this.sectionCuts[i].name !== deletedName) {
                        newSectionCuts.push(this.sectionCuts[i]);
                    }
                }
                this.sectionCuts = newSectionCuts;
                this.selectedSectionCutName = null;
                this.showConfirmModal = false;

                if (window.cadSystem) {
                    if (!window.cadSystem.sectionCuts) window.cadSystem.sectionCuts = {};
                    window.cadSystem.sectionCuts.items = this.sectionCuts;
                }

                this.showToastMessage('Corte de sección "' + deletedName + '" eliminado', 'success');
            }
        }
    }
</script>