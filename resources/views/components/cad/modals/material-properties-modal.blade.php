{{-- resources/views/components/cad/modals/material-properties-modal.blade.php --}}
<div x-data="materialPropertiesModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="if(view === 'list') close()">

    <div class="bg-gray-800 rounded-lg shadow-2xl w-[750px] max-h-[90vh] overflow-hidden border border-gray-700">
        {{-- Cabecera --}}
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white" x-text="view === 'list' ? 'Definir Materiales' : (isNew ? 'Agregar Nuevo Material' : 'Modificar Material')"></h3>
            <button @click="close()" class="text-gray-400 hover:text-white transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {{-- Contenido --}}
        <div class="overflow-y-auto max-h-[70vh] p-4">
            {{-- VISTA LISTA DE MATERIALES --}}
            <div x-show="view === 'list'" x-cloak>
                <div class="mb-2 text-xs text-gray-400">Materiales</div>
                <div class="border border-gray-700 rounded-md bg-gray-900 max-h-64 overflow-y-auto">
                    <template x-for="material in materials" :key="material.name">
                        <div
                            @click="selectMaterial(material.name)"
                            class="flex items-center justify-between px-3 py-2 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                            :class="{'bg-blue-900 border-l-4 border-blue-500': selectedMaterialName === material.name}">
                            <div class="flex items-center gap-3">
                                <div class="w-3 h-3 rounded-full" :style="{backgroundColor: material.color || '#888888'}"></div>
                                <span class="text-sm text-gray-300 font-medium" x-text="material.name"></span>
                                <span class="text-xs text-gray-500" x-text="material.descripcion || ''"></span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-500" x-text="material.type === 'Isotropic' ? 'Isótropo' : 'Ortótropo'"></span>
                            </div>
                        </div>
                    </template>
                    <div x-show="materials.length === 0" class="px-3 py-4 text-center text-gray-500 text-sm">
                        No hay materiales definidos. Haga clic en "Agregar Nuevo Material"
                    </div>
                </div>

                <div class="mt-3 text-xs text-gray-400">Haga clic para:</div>
                <div class="mt-2 space-y-1">
                    <button @click="openForm(true)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Nuevo Material...
                    </button>
                    <button @click="openForm(false)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedMaterialName}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modificar/Mostrar Material...
                    </button>
                    <button @click="confirmDelete()" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedMaterialName}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar Material
                    </button>
                </div>
            </div>

            {{-- VISTA FORMULARIO DE MATERIAL --}}
            <div x-show="view === 'form'" x-cloak>
                <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
                    <button @click="backToList()" class="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </button>
                    <span class="text-sm font-semibold text-gray-300" x-text="isNew ? 'Nuevo Material' : 'Editar Material: ' + (editingMaterial?.name || '')"></span>
                    <div class="w-8"></div>
                </div>

                <!-- Nombre del Material -->
                <div class="mb-4">
                    <label class="block text-xs font-semibold text-gray-400">Nombre del Material</label>
                    <input x-model="form.name" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>

                <!-- Tipo de Material -->
                <div class="mb-4">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Tipo de Material</label>
                    <div class="space-y-1">
                        <label class="flex items-center gap-2">
                            <input type="radio" value="Isotropic" x-model="form.type">
                            <span class="text-sm">Isótropo</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="Orthotropic" x-model="form.type">
                            <span class="text-sm">Ortótropo</span>
                        </label>
                    </div>
                </div>

                <!-- Analysis Property Data -->
                <div class="border-t border-gray-700 pt-3 mb-4">
                    <label class="block text-xs font-semibold text-blue-400 mb-2">Datos de Propiedad de Análisis</label>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs text-gray-400">Masa por unidad de Volumen</label>
                            <input type="number" step="any" x-model="form.massPerUnitVolume" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400">Peso por unidad de Volumen</label>
                            <input type="number" step="any" x-model="form.weightPerUnitVolume" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400">Módulo de Elasticidad</label>
                            <input type="number" step="any" x-model="form.modulusElasticity" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400">Relación de Poisson</label>
                            <input type="number" step="any" x-model="form.poissonRatio" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400">Coef. de Expansión Térmica</label>
                            <input type="number" step="any" x-model="form.thermalExpansion" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400">Módulo de Corte</label>
                            <input type="number" step="any" x-model="form.shearModulus" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                    </div>
                </div>

                <!-- Color -->
                <div class="mb-4">
                    <label class="block text-xs font-semibold text-gray-400">Color de Visualización</label>
                    <div class="flex items-center gap-2">
                        <input type="color" x-model="form.color" class="w-10 h-8 rounded border border-gray-600">
                        <span class="text-xs text-gray-400">Color</span>
                    </div>
                </div>

                <!-- Tipo de Diseño -->
                <div class="mb-4">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Tipo de Diseño</label>
                    <select x-model="form.designType" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        <option value="Concrete">Concreto</option>
                        <option value="Steel">Acero</option>
                        <option value="No Design">Sin Diseño</option>
                    </select>
                </div>

                <!-- Design Property Data -->
                <div class="border-t border-gray-700 pt-3">
                    <label class="block text-xs font-semibold text-blue-400 mb-2">Datos de Propiedad de Diseño [ACI 318-05/IBC 2003]</label>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs text-gray-400">Resistencia del Concreto, f'c</label>
                            <input type="number" step="any" x-model="form.fpc" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400">Esfuerzo Fluencia Acero, fy</label>
                            <input type="number" step="any" x-model="form.fy" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400">Esfuerzo Fluencia Acero Corte, fys</label>
                            <input type="number" step="any" x-model="form.fys" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                    </div>
                    <div class="mt-3 space-y-1">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" x-model="form.lightweight">
                            <span class="text-sm">Concreto Ligero</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="checkbox" x-model="form.shearReduce">
                            <span class="text-sm">Factor de Reducción de Corte</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        {{-- Pie --}}
        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
            <button @click="handleCancel()" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition text-sm">
                Cancelar
            </button>
            <button @click="save()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition text-sm">
                OK
            </button>
        </div>
    </div>

    {{-- Modal de confirmación personalizado (sin SWAL) --}}
    <div x-show="showConfirmModal" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showConfirmModal = false">
        <div class="bg-gray-800 rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
                <h3 class="text-lg font-semibold text-white">Confirmar Eliminación</h3>
            </div>
            <div class="p-4">
                <p class="text-gray-300" x-text="'¿Está seguro de eliminar el material ' + materialToDelete + '?'"></p> 
                <p class="text-xs text-red-400 mt-2">Esta acción no se puede deshacer.</p>
            </div>
            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
                <button @click="showConfirmModal = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition text-sm">
                    Cancelar
                </button>
                <button @click="performDelete" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition text-sm">
                    Eliminar
                </button>
            </div>
        </div>
    </div>

    {{-- Toast de notificación personalizado --}}
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
    function materialPropertiesModal() {
        return {
            open: false,
            view: 'list',
            isNew: true,
            materials: [],
            selectedMaterialName: null,
            editingMaterial: null,

            // Para confirmación
            showConfirmModal: false,
            materialToDelete: null,

            // Para toast
            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            form: {
                name: 'MAT1',
                type: 'Isotropic',
                massPerUnitVolume: 2.246e-7,
                weightPerUnitVolume: 8.680e-5,
                modulusElasticity: 3600,
                poissonRatio: 0.2,
                thermalExpansion: 5.5e-6,
                shearModulus: 1500,
                designType: 'Concrete',
                fpc: 4.0,
                fy: 60.0,
                fys: 60.0,
                lightweight: false,
                shearReduce: false,
                color: '#888888',
                descripcion: ''
            },

            defaultMaterials: [{
                    name: "CONC",
                    type: "Isotropic",
                    fc: 4.0,
                    fy: 60.0,
                    E: 3600,
                    weight: 8.68e-5,
                    poisson: 0.2,
                    color: "#888888",
                    descripcion: "Concreto",
                    massPerUnitVolume: 2.246e-7,
                    weightPerUnitVolume: 8.680e-5,
                    modulusElasticity: 3600,
                    poissonRatio: 0.2,
                    thermalExpansion: 5.5e-6,
                    shearModulus: 1500,
                    designType: "Concrete",
                    fpc: 4.0,
                    fy: 60.0,
                    fys: 60.0,
                    lightweight: false,
                    shearReduce: false
                },
                {
                    name: "OTHER",
                    type: "Isotropic",
                    fc: 0,
                    fy: 0,
                    E: 2000,
                    weight: 7.85e-5,
                    poisson: 0.3,
                    color: "#888888",
                    descripcion: "Otro Material",
                    massPerUnitVolume: 2.246e-7,
                    weightPerUnitVolume: 8.680e-5,
                    modulusElasticity: 2000,
                    poissonRatio: 0.3,
                    thermalExpansion: 5.5e-6,
                    shearModulus: 800,
                    designType: "No Design",
                    fpc: 0,
                    fy: 0,
                    fys: 0,
                    lightweight: false,
                    shearReduce: false
                },
                {
                    name: "STEEL",
                    type: "Isotropic",
                    fc: 0,
                    fy: 250,
                    E: 210000,
                    weight: 7.85e-5,
                    poisson: 0.3,
                    color: "#ff8888",
                    descripcion: "Acero",
                    massPerUnitVolume: 7.85e-9,
                    weightPerUnitVolume: 7.85e-5,
                    modulusElasticity: 210000,
                    poissonRatio: 0.3,
                    thermalExpansion: 1.2e-5,
                    shearModulus: 81000,
                    designType: "Steel",
                    fpc: 0,
                    fy: 250,
                    fys: 250,
                    lightweight: false,
                    shearReduce: false
                }
            ],

            init() {
                if (window.cadSystem && window.cadSystem.materialProperties?.materials?.length > 0) {
                    this.materials = window.cadSystem.materialProperties.materials;
                } else {
                    this.materials = [...this.defaultMaterials];
                    if (window.cadSystem) {
                        window.cadSystem.materialProperties.materials = this.materials;
                    }
                }

                window.addEventListener('open-material-properties-modal', () => {
                    this.openModal();
                });
            },

            showToastMessage(message, type = 'success') {
                if (this.toastTimeout) clearTimeout(this.toastTimeout);
                this.toastMessage = message;
                this.toastType = type;
                this.showToast = true;
                this.toastTimeout = setTimeout(() => {
                    this.showToast = false;
                }, 2500);
            },

            openModal() {
                if (window.cadSystem && window.cadSystem.materialProperties?.materials) {
                    this.materials = window.cadSystem.materialProperties.materials;
                }
                this.open = true;
                this.view = 'list';
                this.selectedMaterialName = null;
            },

            close() {
                this.open = false;
                this.view = 'list';
                this.selectedMaterialName = null;
                this.showConfirmModal = false;
            },

            handleCancel() {
                if (this.view === 'list') {
                    this.close();
                } else {
                    this.backToList();
                }
            },

            selectMaterial(name) {
                this.selectedMaterialName = name;
            },

            openForm(isNew) {
                this.isNew = isNew;
                this.view = 'form';

                if (!isNew && this.selectedMaterialName) {
                    const material = this.materials.find(m => m.name === this.selectedMaterialName);
                    if (material) {
                        this.editingMaterial = {
                            ...material
                        };
                        this.form = {
                            ...material
                        };
                    }
                } else {
                    this.editingMaterial = null;
                    this.resetForm();
                }
            },

            backToList() {
                this.view = 'list';
                this.resetForm();
            },

            resetForm() {
                this.form = {
                    name: 'MAT1',
                    type: 'Isotropic',
                    massPerUnitVolume: 2.246e-7,
                    weightPerUnitVolume: 8.680e-5,
                    modulusElasticity: 3600,
                    poissonRatio: 0.2,
                    thermalExpansion: 5.5e-6,
                    shearModulus: 1500,
                    designType: 'Concrete',
                    fpc: 4.0,
                    fy: 60.0,
                    fys: 60.0,
                    lightweight: false,
                    shearReduce: false,
                    color: '#888888',
                    descripcion: ''
                };
            },

            save() {
                if (!this.form.name) {
                    this.showToastMessage('El nombre del material es requerido', 'error');
                    return;
                }

                let descripcion = '';
                if (this.form.designType === 'Concrete') descripcion = 'Concreto';
                else if (this.form.designType === 'Steel') descripcion = 'Acero';
                else descripcion = 'Otro';

                const materialToSave = {
                    ...this.form,
                    descripcion: descripcion
                };

                if (this.isNew) {
                    if (this.materials.some(m => m.name === materialToSave.name)) {
                        this.showToastMessage(`El material "${materialToSave.name}" ya existe`, 'error');
                        return;
                    }
                    this.materials.push(materialToSave);
                    this.showToastMessage(`Material "${materialToSave.name}" agregado`, 'success');
                } else {
                    const index = this.materials.findIndex(m => m.name === this.editingMaterial?.name);
                    if (index !== -1) {
                        this.materials[index] = materialToSave;
                        this.showToastMessage(`Material "${materialToSave.name}" modificado`, 'success');
                    }
                }

                if (window.cadSystem) {
                    window.cadSystem.materialProperties.materials = this.materials;
                    window.cadSystem.sync3D();
                }

                this.view = 'list';
                this.selectedMaterialName = materialToSave.name;
            },

            confirmDelete() {
                if (!this.selectedMaterialName) {
                    this.showToastMessage('Por favor seleccione un material para eliminar', 'warning');
                    return;
                }
                this.materialToDelete = this.selectedMaterialName;
                this.showConfirmModal = true;
            },

            performDelete() {
                const deletedName = this.materialToDelete;
                this.materials = this.materials.filter(m => m.name !== deletedName);
                this.selectedMaterialName = null;
                this.showConfirmModal = false;

                if (window.cadSystem) {
                    window.cadSystem.materialProperties.materials = this.materials;
                    window.cadSystem.sync3D();
                }

                this.showToastMessage(`Material "${deletedName}" eliminado`, 'success');
            }
        }
    }
</script>