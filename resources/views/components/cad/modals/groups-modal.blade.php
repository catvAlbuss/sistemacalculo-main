{{-- resources/views/components/cad/modals/groups-modal.blade.php --}}
<div x-data="groupsModal()" 
     x-init="init()" 
     x-show="open" 
     x-cloak
     class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
     @keydown.esc.window="close()">
    
    <div class="bg-[#1e1e1e] text-gray-200 w-[550px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
        {{-- Título de la Ventana --}}
        <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700">
            <span>Asignar Grupo</span>
            <div class="flex gap-2">
                <button @click="close()" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded text-gray-400 hover:text-white text-xs">×</button>
            </div>
        </div>

        <div class="p-4">
            <div class="grid grid-cols-2 gap-4">
                {{-- Columna Izquierda: Lista de Grupos --}}
                <div class="flex flex-col gap-1">
                    <label class="text-xs text-gray-400 mb-1">Grupos</label>
                    <div class="bg-[#0c0c0c] border border-gray-700 rounded h-48 overflow-y-auto">
                        <template x-for="(group, idx) in groups" :key="group.name">
                            <div 
                                @click="selectGroup(idx)"
                                class="px-2 py-1 text-sm hover:bg-gray-800 cursor-pointer"
                                :class="{'bg-[#094771] text-white': selectedGroupIndex === idx, 'text-gray-300': selectedGroupIndex !== idx}">
                                <span x-text="group.name"></span>
                            </div>
                        </template>
                        <div x-show="groups.length === 0" class="px-2 py-4 text-center text-gray-500 text-sm">
                            No hay grupos definidos
                        </div>
                    </div>
                </div>

                {{-- Columna Derecha: Acciones --}}
                <div class="flex flex-col gap-2">
                    <label class="text-xs text-gray-400 mb-1">Haga clic para:</label>
                    
                    <button @click="openAddGroupDialog()" class="w-full text-left px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded transition-colors">
                        Añadir Nuevo Grupo
                    </button>
                    
                    <button @click="openModifyGroupDialog()" class="w-full text-left px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded transition-colors" :class="{'opacity-50 cursor-not-allowed': selectedGroupIndex === null}" :disabled="selectedGroupIndex === null">
                        Cambiar Nombre de Grupo
                    </button>
                    
                    <button @click="openChangeColorDialog()" class="w-full text-left px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded transition-colors" :class="{'opacity-50 cursor-not-allowed': selectedGroupIndex === null}" :disabled="selectedGroupIndex === null">
                        Cambiar Color de Grupo...
                    </button>
                    
                    <button @click="confirmDeleteGroup()" class="w-full text-left px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded transition-colors" :class="{'opacity-50 cursor-not-allowed': selectedGroupIndex === null}" :disabled="selectedGroupIndex === null">
                        Borrar Grupo
                    </button>
                </div>
            </div>

            {{-- Botones Inferiores de Acción --}}
            <div class="flex justify-end gap-3 mt-6">
                <button @click="close()" class="px-6 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded shadow-sm transition-colors">
                    OK
                </button>
                <button @click="close()" class="px-6 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors">
                    Cancelar
                </button>
            </div>
        </div>
    </div>

    {{-- Modal para Agregar/Modificar Grupo --}}
    <div x-show="showGroupNameDialog" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showGroupNameDialog = false">
        <div class="bg-[#1e1e1e] rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700">
                <span x-text="isNewGroup ? 'Añadir Nuevo Grupo' : 'Cambiar Nombre de Grupo'"></span>
                <button @click="showGroupNameDialog = false" class="text-gray-400 hover:text-white">×</button>
            </div>
            <div class="p-4">
                <label class="block text-xs font-semibold text-gray-400 mb-2">Nombre del Grupo</label>
                <input type="text" x-model="groupNameInput" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" placeholder="Ej: COLUMNAS_1ER_NIVEL">
            </div>
            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-[#2d2d2d]">
                <button @click="showGroupNameDialog = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Cancelar</button>
                <button @click="saveGroupName()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
            </div>
        </div>
    </div>

    {{-- Modal para Cambiar Color --}}
    <div x-show="showColorDialog" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showColorDialog = false">
        <div class="bg-[#1e1e1e] rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700">
                <span>Cambiar Color de Grupo</span>
                <button @click="showColorDialog = false" class="text-gray-400 hover:text-white">×</button>
            </div>
            <div class="p-4">
                <label class="block text-xs font-semibold text-gray-400 mb-2">Seleccione un Color</label>
                <div class="grid grid-cols-8 gap-2 mb-4">
                    <button @click="selectColor('#FF6B6B')" class="w-8 h-8 rounded" style="background-color: #FF6B6B;"></button>
                    <button @click="selectColor('#4ECDC4')" class="w-8 h-8 rounded" style="background-color: #4ECDC4;"></button>
                    <button @click="selectColor('#45B7D1')" class="w-8 h-8 rounded" style="background-color: #45B7D1;"></button>
                    <button @click="selectColor('#96CEB4')" class="w-8 h-8 rounded" style="background-color: #96CEB4;"></button>
                    <button @click="selectColor('#FFEAA7')" class="w-8 h-8 rounded" style="background-color: #FFEAA7;"></button>
                    <button @click="selectColor('#DDA0DD')" class="w-8 h-8 rounded" style="background-color: #DDA0DD;"></button>
                    <button @click="selectColor('#98D8C8')" class="w-8 h-8 rounded" style="background-color: #98D8C8;"></button>
                    <button @click="selectColor('#F7B787')" class="w-8 h-8 rounded" style="background-color: #F7B787;"></button>
                    <button @click="selectColor('#B5EAD7')" class="w-8 h-8 rounded" style="background-color: #B5EAD7;"></button>
                    <button @click="selectColor('#C7CEEA')" class="w-8 h-8 rounded" style="background-color: #C7CEEA;"></button>
                    <button @click="selectColor('#FFB7B2')" class="w-8 h-8 rounded" style="background-color: #FFB7B2;"></button>
                    <button @click="selectColor('#B5EAD7')" class="w-8 h-8 rounded" style="background-color: #B5EAD7;"></button>
                    <button @click="selectColor('#FFDAC1')" class="w-8 h-8 rounded" style="background-color: #FFDAC1;"></button>
                    <button @click="selectColor('#E2F0CB')" class="w-8 h-8 rounded" style="background-color: #E2F0CB;"></button>
                    <button @click="selectColor('#FFB7B2')" class="w-8 h-8 rounded" style="background-color: #FFB7B2;"></button>
                    <button @click="selectColor('#C5E0D4')" class="w-8 h-8 rounded" style="background-color: #C5E0D4;"></button>
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-xs text-gray-400">Color personalizado:</label>
                    <input type="color" x-model="customColor" class="w-10 h-8 rounded border border-gray-600">
                    <button @click="selectColor(customColor)" class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">Aplicar</button>
                </div>
            </div>
            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-[#2d2d2d]">
                <button @click="showColorDialog = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Cancelar</button>
                <button @click="saveGroupColor()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
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
        [x-cloak] { display: none !important; }
    </style>
</div>

<script>
function groupsModal() {
    return {
        open: false,
        groups: [],
        selectedGroupIndex: null,
        
        // Diálogos
        showGroupNameDialog: false,
        showColorDialog: false,
        isNewGroup: true,
        groupNameInput: '',
        selectedColor: '#4ECDC4',
        customColor: '#4ECDC4',
        
        showToast: false,
        toastMessage: '',
        toastType: 'success',
        toastTimeout: null,

        defaultGroups: [
            { name: "ALL", color: "#888888" },
            { name: "COLUMNAS_1ER_NIVEL", color: "#FF6B6B" },
            { name: "VIGAS_SISMICAS", color: "#4ECDC4" }
        ],

        init() {
            this.loadGroups();
            window.addEventListener('open-groups-modal', () => {
                this.openModal();
            });
        },

        loadGroups() {
            if (window.cadSystem && window.cadSystem.groups && window.cadSystem.groups.items && window.cadSystem.groups.items.length > 0) {
                this.groups = window.cadSystem.groups.items;
            } else {
                this.groups = JSON.parse(JSON.stringify(this.defaultGroups));
                if (window.cadSystem) {
                    if (!window.cadSystem.groups) window.cadSystem.groups = {};
                    window.cadSystem.groups.items = this.groups;
                }
            }
        },

        showToastMessage(message, type) {
            if (this.toastTimeout) clearTimeout(this.toastTimeout);
            this.toastMessage = message;
            this.toastType = type || 'success';
            this.showToast = true;
            setTimeout(() => { this.showToast = false; }, 2500);
        },

        openModal() {
            this.loadGroups();
            this.open = true;
            this.selectedGroupIndex = null;
        },

        close() {
            this.open = false;
            this.selectedGroupIndex = null;
            this.showGroupNameDialog = false;
            this.showColorDialog = false;
        },

        selectGroup(idx) {
            this.selectedGroupIndex = idx;
        },

        openAddGroupDialog() {
            this.isNewGroup = true;
            this.groupNameInput = '';
            this.showGroupNameDialog = true;
        },

        openModifyGroupDialog() {
            if (this.selectedGroupIndex === null) {
                this.showToastMessage('Por favor seleccione un grupo para modificar', 'warning');
                return;
            }
            this.isNewGroup = false;
            this.groupNameInput = this.groups[this.selectedGroupIndex].name;
            this.showGroupNameDialog = true;
        },

        saveGroupName() {
            if (!this.groupNameInput.trim()) {
                this.showToastMessage('El nombre del grupo es requerido', 'error');
                return;
            }

            if (this.isNewGroup) {
                // Verificar si ya existe
                var exists = false;
                for (var i = 0; i < this.groups.length; i++) {
                    if (this.groups[i].name === this.groupNameInput) {
                        exists = true;
                        break;
                    }
                }
                if (exists) {
                    this.showToastMessage('El grupo "' + this.groupNameInput + '" ya existe', 'error');
                    return;
                }
                this.groups.push({
                    name: this.groupNameInput,
                    color: '#888888'
                });
                this.showToastMessage('Grupo "' + this.groupNameInput + '" agregado', 'success');
            } else {
                // Verificar duplicado excepto el mismo
                for (var j = 0; j < this.groups.length; j++) {
                    if (j !== this.selectedGroupIndex && this.groups[j].name === this.groupNameInput) {
                        this.showToastMessage('El grupo "' + this.groupNameInput + '" ya existe', 'error');
                        return;
                    }
                }
                this.groups[this.selectedGroupIndex].name = this.groupNameInput;
                this.showToastMessage('Grupo renombrado a "' + this.groupNameInput + '"', 'success');
            }

            this.showGroupNameDialog = false;
            this.saveToCadSystem();
        },

        openChangeColorDialog() {
            if (this.selectedGroupIndex === null) {
                this.showToastMessage('Por favor seleccione un grupo para cambiar color', 'warning');
                return;
            }
            this.selectedColor = this.groups[this.selectedGroupIndex].color || '#888888';
            this.customColor = this.selectedColor;
            this.showColorDialog = true;
        },

        selectColor(color) {
            this.selectedColor = color;
        },

        saveGroupColor() {
            if (this.selectedGroupIndex !== null) {
                this.groups[this.selectedGroupIndex].color = this.selectedColor;
                this.showToastMessage('Color del grupo actualizado', 'success');
                this.showColorDialog = false;
                this.saveToCadSystem();
            }
        },

        confirmDeleteGroup() {
            if (this.selectedGroupIndex === null) {
                this.showToastMessage('Por favor seleccione un grupo para eliminar', 'warning');
                return;
            }
            
            var groupName = this.groups[this.selectedGroupIndex].name;
            
            if (confirm('¿Está seguro de eliminar el grupo "' + groupName + '"?')) {
                this.groups.splice(this.selectedGroupIndex, 1);
                this.selectedGroupIndex = null;
                this.showToastMessage('Grupo "' + groupName + '" eliminado', 'success');
                this.saveToCadSystem();
            }
        },

        saveToCadSystem() {
            if (window.cadSystem) {
                if (!window.cadSystem.groups) window.cadSystem.groups = {};
                window.cadSystem.groups.items = this.groups;
                if (window.cadSystem.sync3D) window.cadSystem.sync3D();
            }
        }
    }
}
</script>