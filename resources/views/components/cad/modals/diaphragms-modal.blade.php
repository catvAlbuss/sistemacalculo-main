{{-- resources/views/components/cad/modals/diaphragms-modal.blade.php --}}
<div x-data="diaphragmsModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    {{-- Modal Principal - Lista de Diafragmas --}}
    <div x-show="view === 'list'" x-cloak class="bg-gray-800 rounded-lg shadow-2xl w-[450px] border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Definir Diafragmas</h3>
            <button @click="close()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4">
            <div class="mb-2 text-xs text-gray-400">Diafragmas</div>
            <div class="border border-gray-700 rounded-md bg-gray-900 max-h-64 overflow-y-auto">
                <table class="w-full text-sm">
                    <tbody>
                        <template x-for="diaphragm in diaphragms" :key="diaphragm.name">
                            <tr
                                @click="selectDiaphragm(diaphragm.name)"
                                class="border-t border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                                :class="{'bg-blue-900': selectedDiaphragmName === diaphragm.name}">
                                <td class="px-4 py-2 text-gray-300 font-mono" x-text="diaphragm.name"></td>
                                </td>
                        </template>
                        <tr x-show="diaphragms.length === 0">
                            <td class="px-4 py-8 text-center text-gray-500">No hay diafragmas definidos</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="mt-3 text-xs text-gray-400">Haga clic para:</div>
            <div class="mt-2 space-y-1">
                <button @click="openDiaphragmForm(true)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar Nuevo Diafragma
                </button>
                <button @click="if(selectedDiaphragmName) openDiaphragmForm(false)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedDiaphragmName}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modificar/Mostrar Diafragma
                </button>
                <button @click="if(selectedDiaphragmName) confirmDelete()" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedDiaphragmName}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar Diafragma
                </button>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="close()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="close()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    {{-- Modal de Datos de Diafragma (Agregar/Editar) --}}
    <div x-show="view === 'form'" x-cloak class="bg-gray-800 rounded-lg shadow-2xl w-[400px] border border-gray-700">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white">Datos del Diafragma</h3>
            <button @click="backToList()" class="float-right text-gray-400 hover:text-white">✕</button>
        </div>

        <div class="p-4">
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-1">Diafragma</label>
                <input x-model="diaphragmForm.name" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" placeholder="D1">
            </div>

            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-400 mb-2">Rigidez</label>
                <div class="space-y-2">
                    <label class="flex items-center gap-2">
                        <input type="radio" value="Rigid" x-model="diaphragmForm.rigidity">
                        <span class="text-sm">Rígido</span>
                    </label>
                    <label class="flex items-center gap-2">
                        <input type="radio" value="Semi Rigid" x-model="diaphragmForm.rigidity">
                        <span class="text-sm">Semirrígido</span>
                    </label>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="backToList()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">Cancelar</button>
            <button @click="saveDiaphragm()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">OK</button>
        </div>
    </div>

    {{-- Modal de confirmación --}}
    <div x-show="showConfirmModal" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showConfirmModal = false">
        <div class="bg-gray-800 rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
                <h3 class="text-lg font-semibold text-white">Confirmar Eliminación</h3>
            </div>
            <div class="p-4">
                <p class="text-gray-300" x-text="'¿Está seguro de eliminar el diafragma ' + diaphragmToDelete + '?'"></p>
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
    function diaphragmsModal() {
        return {
            open: false,
            view: 'list', // list, form
            diaphragms: [],
            selectedDiaphragmName: null,
            editingDiaphragm: null,

            showConfirmModal: false,
            diaphragmToDelete: null,

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            diaphragmForm: {
                name: 'D1',
                rigidity: 'Rigid'
            },

            defaultDiaphragms: [{
                    name: "D1",
                    rigidity: "Rigid",
                    description: "Diafragma rígido D1"
                },
                {
                    name: "NONE",
                    rigidity: "Semi Rigid",
                    description: "Sin diafragma"
                }
            ],

            init() {
                this.loadDiaphragms();
                window.addEventListener('open-diaphragms-modal', () => {
                    this.openModal();
                });
            },

            loadDiaphragms() {
                if (window.cadSystem && window.cadSystem.diaphragms && window.cadSystem.diaphragms.items && window.cadSystem.diaphragms.items.length > 0) {
                    this.diaphragms = window.cadSystem.diaphragms.items;
                } else {
                    this.diaphragms = JSON.parse(JSON.stringify(this.defaultDiaphragms));
                    if (window.cadSystem) {
                        if (!window.cadSystem.diaphragms) window.cadSystem.diaphragms = {};
                        window.cadSystem.diaphragms.items = this.diaphragms;
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
                this.loadDiaphragms();
                this.open = true;
                this.view = 'list';
                this.selectedDiaphragmName = null;
            },

            close() {
                this.open = false;
                this.view = 'list';
                this.selectedDiaphragmName = null;
                this.showConfirmModal = false;
            },

            selectDiaphragm(name) {
                this.selectedDiaphragmName = name;
            },

            openDiaphragmForm(isNew) {
                if (!isNew && !this.selectedDiaphragmName) {
                    this.showToastMessage('Por favor seleccione un diafragma primero', 'warning');
                    return;
                }

                if (!isNew && this.selectedDiaphragmName) {
                    var diaphragm = null;
                    for (var i = 0; i < this.diaphragms.length; i++) {
                        if (this.diaphragms[i].name === this.selectedDiaphragmName) {
                            diaphragm = this.diaphragms[i];
                            break;
                        }
                    }
                    if (diaphragm) {
                        this.editingDiaphragm = JSON.parse(JSON.stringify(diaphragm));
                        this.diaphragmForm.name = diaphragm.name;
                        this.diaphragmForm.rigidity = diaphragm.rigidity || 'Rigid';
                    }
                } else {
                    this.editingDiaphragm = null;
                    this.diaphragmForm = {
                        name: 'D1',
                        rigidity: 'Rigid'
                    };
                }
                this.view = 'form';
            },

            backToList() {
                this.view = 'list';
            },

            saveDiaphragm() {
                if (!this.diaphragmForm.name) {
                    this.showToastMessage('El nombre del diafragma es requerido', 'error');
                    return;
                }

                var diaphragmToSave = {
                    name: this.diaphragmForm.name,
                    rigidity: this.diaphragmForm.rigidity,
                    description: 'Diafragma ' + this.diaphragmForm.rigidity
                };

                if (this.editingDiaphragm) {
                    for (var j = 0; j < this.diaphragms.length; j++) {
                        if (this.diaphragms[j].name === this.editingDiaphragm.name) {
                            this.diaphragms[j] = diaphragmToSave;
                            break;
                        }
                    }
                    this.showToastMessage('Diafragma "' + diaphragmToSave.name + '" modificado', 'success');
                } else {
                    var exists = false;
                    for (var i = 0; i < this.diaphragms.length; i++) {
                        if (this.diaphragms[i].name === diaphragmToSave.name) {
                            exists = true;
                            break;
                        }
                    }
                    if (exists) {
                        this.showToastMessage('El diafragma "' + diaphragmToSave.name + '" ya existe', 'error');
                        return;
                    }
                    this.diaphragms.push(diaphragmToSave);
                    this.showToastMessage('Diafragma "' + diaphragmToSave.name + '" agregado', 'success');
                }

                if (window.cadSystem) {
                    if (!window.cadSystem.diaphragms) window.cadSystem.diaphragms = {};
                    window.cadSystem.diaphragms.items = this.diaphragms;
                }

                this.view = 'list';
                this.selectedDiaphragmName = diaphragmToSave.name;
                this.editingDiaphragm = null;
            },

            confirmDelete: function() {
                if (!this.selectedDiaphragmName) {
                    this.showToastMessage('Por favor seleccione un diafragma para eliminar', 'warning');
                    return;
                }
                this.diaphragmToDelete = this.selectedDiaphragmName;
                this.showConfirmModal = true;
            },

            performDelete: function() {
                var deletedName = this.diaphragmToDelete;
                var newDiaphragms = [];
                for (var i = 0; i < this.diaphragms.length; i++) {
                    if (this.diaphragms[i].name !== deletedName) {
                        newDiaphragms.push(this.diaphragms[i]);
                    }
                }
                this.diaphragms = newDiaphragms;
                this.selectedDiaphragmName = null;
                this.showConfirmModal = false;

                if (window.cadSystem) {
                    if (!window.cadSystem.diaphragms) window.cadSystem.diaphragms = {};
                    window.cadSystem.diaphragms.items = this.diaphragms;
                }

                this.showToastMessage('Diafragma "' + deletedName + '" eliminado', 'success');
            }
        }
    }
</script>