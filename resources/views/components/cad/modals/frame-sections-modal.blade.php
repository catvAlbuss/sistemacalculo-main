{{-- resources/views/components/cad/modals/frame-sections-modal.blade.php --}}
<div x-data="frameSectionsModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="if(view === 'list') close()">

    <div class="bg-gray-800 rounded-lg shadow-2xl w-[850px] max-h-[90vh] overflow-hidden border border-gray-700">
        {{-- Cabecera --}}
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-900">
            <h3 class="text-lg font-semibold text-white" x-text="view === 'list' ? 'Definir Secciones de Pórtico' : (isNew ? 'Agregar Nueva Sección' : 'Modificar Sección')"></h3>
            <button @click="close()" class="text-gray-400 hover:text-white transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {{-- Contenido --}}
        <div class="overflow-y-auto max-h-[70vh] p-4">
            {{-- VISTA LISTA DE SECCIONES --}}
            <div x-show="view === 'list'" x-cloak>
                <div class="mb-4">
                    <input type="text"
                        x-model="searchText"
                        placeholder="Escriba la propiedad a buscar..."
                        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>

                <div class="border border-gray-700 rounded-md bg-gray-900 max-h-96 overflow-y-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-800 sticky top-0">
                            <tr>
                                <th class="px-4 py-2 text-left text-gray-400">Propiedad</th>
                                <th class="px-4 py-2 text-left text-gray-400">Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template x-for="section in filteredSections" :key="section.name">
                                <tr
                                    @click="selectSection(section.name)"
                                    class="border-t border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
                                    :class="{'bg-blue-900': selectedSectionName === section.name}">
                                    <td class="px-4 py-2 text-gray-300 font-mono" x-text="section.name"></td>
                                    <td class="px-4 py-2 text-gray-400 text-sm" x-text="section.description"></td>
                                </tr>
                            </template>
                            <tr x-show="filteredSections.length === 0">
                                <td colspan="2" class="px-4 py-8 text-center text-gray-500">
                                    No hay secciones definidas. Haga clic en "Agregar Nueva Sección"
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="mt-4 text-xs text-gray-400">Haga clic para:</div>
                <div class="mt-2 space-y-1">
                    <button @click="openImportDialog()" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Importar Perfil W...
                    </button>
                    <button @click="openForm(true)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Nueva Sección...
                    </button>
                    <button @click="if(selectedSectionName) openForm(false)" class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedSectionName}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modificar/Mostrar Sección...
                    </button>
                    <button @click="if(selectedSectionName) confirmDelete()" class="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded transition-colors flex items-center gap-2" :class="{'opacity-50 cursor-not-allowed': !selectedSectionName}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar Sección
                    </button>
                </div>
            </div>

            {{-- VISTA FORMULARIO DE SECCIÓN --}}
            <div x-show="view === 'form'" x-cloak>
                <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
                    <button @click="backToList()" class="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver
                    </button>
                    <span class="text-sm font-semibold text-gray-300" x-text="isNew ? 'Nueva Sección' : 'Editar Sección: ' + (editingSection?.name || '')"></span>
                    <div class="w-8"></div>
                </div>

                {{-- Nombre de la Sección --}}
                <div class="mb-4">
                    <label class="block text-xs font-semibold text-gray-400">Nombre de la Sección</label>
                    <input x-model="form.name" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>

                {{-- Tipo de Sección --}}
                <div class="mb-4">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Tipo de Sección</label>
                    <div class="flex gap-4 flex-wrap">
                        <label class="flex items-center gap-2">
                            <input type="radio" value="wf" x-model="form.sectionType">
                            <span class="text-sm">Perfil W (Ala Ancha)</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="channel" x-model="form.sectionType">
                            <span class="text-sm">Canal (C)</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="angle" x-model="form.sectionType">
                            <span class="text-sm">Angular (L)</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="tube" x-model="form.sectionType">
                            <span class="text-sm">Tubo (HSS)</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="auto" x-model="form.sectionType">
                            <span class="text-sm">Selección Automática</span>
                        </label>
                    </div>
                </div>

                {{-- Formulario para Auto Selection (estilo ETABS) --}}
                <div x-show="form.sectionType === 'auto'">
                    <div class="border-t border-gray-700 pt-3 mb-4">
                        <label class="block text-xs font-semibold text-blue-400 mb-2">Nombre de Sección Auto</label>
                        <input x-model="form.autoSectionName" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm" placeholder="A-CompBm">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        {{-- Lista de Secciones Disponibles --}}
                        <div class="border border-gray-700 rounded-md p-2">
                            <label class="block text-xs font-semibold text-gray-400 mb-2">Seleccionar Secciones:</label>
                            <div class="border border-gray-700 rounded bg-gray-900 h-64 overflow-y-auto">
                                <div class="p-2">
                                    <template x-for="sec in availableSections" :key="sec">
                                        <div
                                            @click="toggleAvailableSection(sec)"
                                            class="px-2 py-1 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer rounded"
                                            :class="{'bg-blue-900': selectedAvailableSections.includes(sec)}">
                                            <span x-text="sec"></span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>

                        {{-- Botones de transferencia --}}
                        <div class="flex flex-col justify-center items-center gap-4">
                            <button @click="addToAutoSelection()" class="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm">
                                Agregar →
                            </button>
                            <button @click="removeFromAutoSelection()" class="px-3 py-2 bg-red-600 hover:bg-red-500 rounded text-white text-sm">
                                ← Remover
                            </button>
                        </div>

                        {{-- Lista de Secciones Automáticas --}}
                        <div class="border border-gray-700 rounded-md p-2">
                            <label class="block text-xs font-semibold text-gray-400 mb-2">Selecciones Automáticas:</label>
                            <div class="border border-gray-700 rounded bg-gray-900 h-64 overflow-y-auto">
                                <div class="p-2">
                                    <template x-for="sec in autoSelections" :key="sec">
                                        <div
                                            @click="toggleAutoSelection(sec)"
                                            class="px-2 py-1 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer rounded"
                                            :class="{'bg-blue-900': selectedAutoSelections.includes(sec)}">
                                            <span x-text="sec"></span>
                                        </div>
                                    </template>
                                    <div x-show="autoSelections.length === 0" class="text-center text-gray-500 py-4">
                                        No hay secciones seleccionadas
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-400">Sección Inicial</label>
                            <input x-model="form.startingSection" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-400">Sección Mediana</label>
                            <select x-model="form.medianSection" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                                <option value="">Ninguna</option>
                                <template x-for="sec in autoSelections" :key="sec">
                                    <option :value="sec" x-text="sec"></option>
                                </template>
                            </select>
                        </div>
                    </div>

                    <div class="mt-4">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" x-model="form.overwrite">
                            <span class="text-sm">Sobrescribir secciones existentes</span>
                        </label>
                    </div>
                </div>

                {{-- Formulario para Perfil W (Ala Ancha) --}}
                <div x-show="form.sectionType === 'wf'">
                    <div class="border-t border-gray-700 pt-3 mb-4">
                        <label class="block text-xs font-semibold text-blue-400 mb-2">Dimensiones del Perfil W</label>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-400">Altura (d)</label>
                                <input type="number" step="0.01" x-model="form.wfDepth" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Ancho de Ala (bf)</label>
                                <input type="number" step="0.01" x-model="form.wfFlangeWidth" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Espesor de Ala (tf)</label>
                                <input type="number" step="0.01" x-model="form.wfFlangeThick" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Espesor de Alma (tw)</label>
                                <input type="number" step="0.01" x-model="form.wfWebThick" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Peso (kg/m)</label>
                                <input type="number" step="0.1" x-model="form.wfWeight" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400">Área (cm²)</label>
                                <input type="number" step="0.01" x-model="form.wfArea" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Color --}}
                <div class="mt-4">
                    <label class="block text-xs font-semibold text-gray-400">Color de Visualización</label>
                    <div class="flex items-center gap-2">
                        <input type="color" x-model="form.color" class="w-10 h-8 rounded border border-gray-600">
                        <span class="text-xs text-gray-400">Color</span>
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

    {{-- Modal de confirmación --}}
    <div x-show="showConfirmModal" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showConfirmModal = false">
        <div class="bg-gray-800 rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
                <h3 class="text-lg font-semibold text-white">Confirmar Eliminación</h3>
            </div>
            <div class="p-4">
                <p class="text-gray-300" x-text="'¿Está seguro de eliminar la sección ' + sectionToDelete + '?'"></p>
                <p class="text-xs text-red-400 mt-2">Esta acción no se puede deshacer.</p>
            </div>
            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-900">
                <button @click="showConfirmModal = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Cancelar</button>
                <button @click="performDelete" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm">Eliminar</button>
            </div>
        </div>
    </div>

    {{-- Modal de importación --}}
    <div x-show="showImportModal" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showImportModal = false">
        <div class="bg-gray-800 rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="px-4 py-3 border-b border-gray-700 bg-gray-900">
                <h3 class="text-lg font-semibold text-white">Importar Perfil W</h3>
            </div>
            <div class="p-4 max-h-96 overflow-y-auto">
                <p class="text-gray-300 text-sm mb-3">Seleccione el perfil a importar:</p>
                <div class="space-y-2">
                    <template x-for="wf in wideFlangeList" :key="wf.name">
                        <button @click="importWideFlange(wf)" class="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
                            <span x-text="wf.name"></span>
                            <span class="text-xs text-gray-400 ml-2" x-text="wf.weight + ' kg/m'"></span>
                        </button>
                    </template>
                </div>
            </div>
            <div class="flex justify-end px-4 py-3 border-t border-gray-700 bg-gray-900">
                <button @click="showImportModal = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Cancelar</button>
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
    function frameSectionsModal() {
        return {
            open: false,
            view: 'list',
            isNew: true,
            searchText: '',

            sections: [],
            selectedSectionName: null,
            editingSection: null,

            showConfirmModal: false,
            sectionToDelete: null,
            showImportModal: false,

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            // Auto selection
            availableSections: [
                'HSS4X.237', 'HSS4X.250', 'HSS5X.250', 'HSS5X.258', 'HSS5X.312',
                'HSS5X.375', 'HSS5X.500', 'HSS6X.250', 'HSS6X.280', 'HSS6X.312',
                'W10X12', 'W10X15', 'W10X17', 'W10X19', 'W12X14',
                'W12X16', 'W12X19', 'W12X22', 'W12X26', 'W14X22'
            ],
            autoSelections: [],
            selectedAvailableSections: [],
            selectedAutoSelections: [],

            wideFlangeList: [{
                    name: 'W10X12',
                    weight: 12,
                    depth: 9.87,
                    flangeWidth: 3.96,
                    flangeThick: 0.19,
                    webThick: 0.19,
                    area: 3.54
                },
                {
                    name: 'W10X15',
                    weight: 15,
                    depth: 9.99,
                    flangeWidth: 4.00,
                    flangeThick: 0.23,
                    webThick: 0.23,
                    area: 4.41
                },
                {
                    name: 'W10X17',
                    weight: 17,
                    depth: 10.11,
                    flangeWidth: 4.01,
                    flangeThick: 0.27,
                    webThick: 0.24,
                    area: 5.01
                },
                {
                    name: 'W10X19',
                    weight: 19,
                    depth: 10.24,
                    flangeWidth: 4.02,
                    flangeThick: 0.31,
                    webThick: 0.25,
                    area: 5.62
                },
                {
                    name: 'W12X14',
                    weight: 14,
                    depth: 11.91,
                    flangeWidth: 3.97,
                    flangeThick: 0.20,
                    webThick: 0.20,
                    area: 4.16
                },
                {
                    name: 'W12X16',
                    weight: 16,
                    depth: 11.99,
                    flangeWidth: 3.99,
                    flangeThick: 0.22,
                    webThick: 0.22,
                    area: 4.71
                },
                {
                    name: 'W12X19',
                    weight: 19,
                    depth: 12.16,
                    flangeWidth: 4.01,
                    flangeThick: 0.26,
                    webThick: 0.24,
                    area: 5.57
                },
                {
                    name: 'W12X22',
                    weight: 22,
                    depth: 12.31,
                    flangeWidth: 4.03,
                    flangeThick: 0.30,
                    webThick: 0.26,
                    area: 6.48
                },
                {
                    name: 'W12X26',
                    weight: 26,
                    depth: 12.50,
                    flangeWidth: 4.05,
                    flangeThick: 0.35,
                    webThick: 0.23,
                    area: 7.68
                },
                {
                    name: 'W14X22',
                    weight: 22,
                    depth: 13.74,
                    flangeWidth: 5.00,
                    flangeThick: 0.34,
                    webThick: 0.24,
                    area: 6.49
                }
            ],

            form: {
                name: 'W10X12',
                sectionType: 'wf',
                autoSectionName: 'A-CompBm',
                startingSection: '',
                medianSection: '',
                overwrite: false,
                wfDepth: 9.87,
                wfFlangeWidth: 3.96,
                wfFlangeThick: 0.19,
                wfWebThick: 0.19,
                wfWeight: 12,
                wfArea: 3.54,
                color: '#88ffaa'
            },

            defaultSections: [{
                    name: "W10X12",
                    type: "wf",
                    weight: 12,
                    depth: 9.87,
                    flangeWidth: 3.96,
                    flangeThick: 0.19,
                    webThick: 0.19,
                    area: 3.54,
                    description: "Perfil W10X12 - 12 kg/m",
                    color: "#88ffaa"
                },
                {
                    name: "W10X15",
                    type: "wf",
                    weight: 15,
                    depth: 9.99,
                    flangeWidth: 4.00,
                    flangeThick: 0.23,
                    webThick: 0.23,
                    area: 4.41,
                    description: "Perfil W10X15 - 15 kg/m",
                    color: "#88ffaa"
                },
                {
                    name: "W10X17",
                    type: "wf",
                    weight: 17,
                    depth: 10.11,
                    flangeWidth: 4.01,
                    flangeThick: 0.27,
                    webThick: 0.24,
                    area: 5.01,
                    description: "Perfil W10X17 - 17 kg/m",
                    color: "#88ffaa"
                },
                {
                    name: "W12X14",
                    type: "wf",
                    weight: 14,
                    depth: 11.91,
                    flangeWidth: 3.97,
                    flangeThick: 0.20,
                    webThick: 0.20,
                    area: 4.16,
                    description: "Perfil W12X14 - 14 kg/m",
                    color: "#88ffaa"
                },
                {
                    name: "W12X16",
                    type: "wf",
                    weight: 16,
                    depth: 11.99,
                    flangeWidth: 3.99,
                    flangeThick: 0.22,
                    webThick: 0.22,
                    area: 4.71,
                    description: "Perfil W12X16 - 16 kg/m",
                    color: "#88ffaa"
                },
                {
                    name: "A-CompBm",
                    type: "auto",
                    autoSectionName: "A-CompBm",
                    autoSelections: ["W10X12", "W10X15", "W12X14"],
                    description: "Selección automática - Vigas de Compuesto",
                    color: "#ffaa88"
                },
                {
                    name: "A-GravBm",
                    type: "auto",
                    autoSectionName: "A-GravBm",
                    autoSelections: ["W12X16", "W12X19", "W14X22"],
                    description: "Selección automática - Vigas de Gravedad",
                    color: "#ffaa88"
                }
            ],

            init() {
                this.loadSections();
                window.addEventListener('open-frame-sections-modal', () => {
                    this.openModal();
                });
            },

            loadSections() {
                if (window.cadSystem && window.cadSystem.frameSections && window.cadSystem.frameSections.sections && window.cadSystem.frameSections.sections.length > 0) {
                    this.sections = window.cadSystem.frameSections.sections;
                } else {
                    this.sections = JSON.parse(JSON.stringify(this.defaultSections));
                    if (window.cadSystem) {
                        if (!window.cadSystem.frameSections) window.cadSystem.frameSections = {};
                        window.cadSystem.frameSections.sections = this.sections;
                    }
                }
            },

            get filteredSections() {
                let filtered = this.sections;
                if (this.searchText) {
                    let search = this.searchText.toLowerCase();
                    filtered = filtered.filter(function(s) {
                        return (s.name && s.name.toLowerCase().indexOf(search) !== -1) ||
                            (s.description && s.description.toLowerCase().indexOf(search) !== -1);
                    });
                }
                return filtered;
            },

            showToastMessage: function(message, type) {
                if (this.toastTimeout) clearTimeout(this.toastTimeout);
                this.toastMessage = message;
                this.toastType = type || 'success';
                this.showToast = true;
                var self = this;
                this.toastTimeout = setTimeout(function() {
                    self.showToast = false;
                }, 2500);
            },

            openModal: function() {
                this.loadSections();
                this.open = true;
                this.view = 'list';
                this.selectedSectionName = null;
                this.searchText = '';
            },

            close: function() {
                this.open = false;
                this.view = 'list';
                this.selectedSectionName = null;
                this.showConfirmModal = false;
                this.showImportModal = false;
            },

            handleCancel: function() {
                if (this.view === 'list') {
                    this.close();
                } else {
                    this.backToList();
                }
            },

            selectSection: function(name) {
                this.selectedSectionName = name;
            },

            // openForm: function(isNew) {
            //     // Si no es nuevo y no hay selección, no hacer nada
            //     if (!isNew && !this.selectedSectionName) {
            //         this.showToastMessage('Por favor seleccione una sección primero', 'warning');
            //         return;
            //     }

            //     this.isNew = isNew;
            //     this.view = 'form';

            //     if (!isNew && this.selectedSectionName) {
            //         var section = null;
            //         for (var i = 0; i < this.sections.length; i++) {
            //             if (this.sections[i].name === this.selectedSectionName) {
            //                 section = this.sections[i];
            //                 break;
            //             }
            //         }
            //         if (section) {
            //             this.editingSection = JSON.parse(JSON.stringify(section));
            //             this.form = this.sectionToForm(section);
            //             if (section.type === 'auto' && section.autoSelections) {
            //                 this.autoSelections = JSON.parse(JSON.stringify(section.autoSelections));
            //             } else {
            //                 this.autoSelections = [];
            //             }
            //         } else {
            //             this.showToastMessage('Error: No se encontró la sección seleccionada', 'error');
            //             this.backToList();
            //             return;
            //         }
            //     } else {
            //         this.editingSection = null;
            //         this.resetForm();
            //         this.autoSelections = [];
            //         this.selectedAvailableSections = [];
            //         this.selectedAutoSelections = [];
            //     }
            // },

            openForm: function(isNew) {
                // Si no es nuevo y no hay selección, no hacer nada
                if (!isNew && !this.selectedSectionName) {
                    this.showToastMessage('Por favor seleccione una sección primero', 'warning');
                    return;
                }

                this.isNew = isNew;
                this.view = 'form';

                if (!isNew && this.selectedSectionName) {
                    var section = null;
                    for (var i = 0; i < this.sections.length; i++) {
                        if (this.sections[i].name === this.selectedSectionName) {
                            section = this.sections[i];
                            break;
                        }
                    }
                    if (section) {
                        this.editingSection = JSON.parse(JSON.stringify(section));
                        this.form = this.sectionToForm(section);
                        if (section.type === 'auto' && section.autoSelections) {
                            this.autoSelections = JSON.parse(JSON.stringify(section.autoSelections));
                        } else {
                            this.autoSelections = [];
                        }
                    } else {
                        this.showToastMessage('Error: No se encontró la sección seleccionada', 'error');
                        this.backToList();
                        return;
                    }
                } else {
                    this.editingSection = null;
                    this.resetForm();
                    this.autoSelections = [];
                    this.selectedAvailableSections = [];
                    this.selectedAutoSelections = [];
                }
            },

            sectionToForm: function(section) {
                return {
                    name: section.name,
                    sectionType: section.type || 'wf',
                    autoSectionName: section.autoSectionName || 'A-CompBm',
                    startingSection: section.startingSection || '',
                    medianSection: section.medianSection || '',
                    overwrite: section.overwrite || false,
                    wfDepth: section.depth || 9.87,
                    wfFlangeWidth: section.flangeWidth || 3.96,
                    wfFlangeThick: section.flangeThick || 0.19,
                    wfWebThick: section.webThick || 0.19,
                    wfWeight: section.weight || 12,
                    wfArea: section.area || 3.54,
                    color: section.color || '#88ffaa'
                };
            },

            backToList: function() {
                this.view = 'list';
                this.resetForm();
                this.autoSelections = [];
                this.selectedAvailableSections = [];
                this.selectedAutoSelections = [];
            },

            resetForm: function() {
                this.form = {
                    name: 'W10X12',
                    sectionType: 'wf',
                    autoSectionName: 'A-CompBm',
                    startingSection: '',
                    medianSection: '',
                    overwrite: false,
                    wfDepth: 9.87,
                    wfFlangeWidth: 3.96,
                    wfFlangeThick: 0.19,
                    wfWebThick: 0.19,
                    wfWeight: 12,
                    wfArea: 3.54,
                    color: '#88ffaa'
                };
            },

            toggleAvailableSection: function(sec) {
                var index = this.selectedAvailableSections.indexOf(sec);
                if (index === -1) {
                    this.selectedAvailableSections.push(sec);
                } else {
                    this.selectedAvailableSections.splice(index, 1);
                }
            },

            toggleAutoSelection: function(sec) {
                var index = this.selectedAutoSelections.indexOf(sec);
                if (index === -1) {
                    this.selectedAutoSelections.push(sec);
                } else {
                    this.selectedAutoSelections.splice(index, 1);
                }
            },

            addToAutoSelection: function() {
                for (var i = 0; i < this.selectedAvailableSections.length; i++) {
                    var sec = this.selectedAvailableSections[i];
                    if (this.autoSelections.indexOf(sec) === -1) {
                        this.autoSelections.push(sec);
                    }
                }
                this.selectedAvailableSections = [];
            },

            removeFromAutoSelection: function() {
                var newAutoSelections = [];
                for (var i = 0; i < this.autoSelections.length; i++) {
                    if (this.selectedAutoSelections.indexOf(this.autoSelections[i]) === -1) {
                        newAutoSelections.push(this.autoSelections[i]);
                    }
                }
                this.autoSelections = newAutoSelections;
                this.selectedAutoSelections = [];
            },

            save: function() {
                if (!this.form.name) {
                    this.showToastMessage('El nombre de la sección es requerido', 'error');
                    return;
                }

                var sectionToSave = {
                    name: this.form.name,
                    type: this.form.sectionType,
                    color: this.form.color,
                    description: ''
                };

                if (this.form.sectionType === 'auto') {
                    sectionToSave.autoSectionName = this.form.autoSectionName;
                    sectionToSave.autoSelections = JSON.parse(JSON.stringify(this.autoSelections));
                    sectionToSave.startingSection = this.form.startingSection;
                    sectionToSave.medianSection = this.form.medianSection;
                    sectionToSave.overwrite = this.form.overwrite;
                    sectionToSave.description = 'Selección automática - ' + this.autoSelections.length + ' secciones';
                } else if (this.form.sectionType === 'wf') {
                    sectionToSave.depth = this.form.wfDepth;
                    sectionToSave.flangeWidth = this.form.wfFlangeWidth;
                    sectionToSave.flangeThick = this.form.wfFlangeThick;
                    sectionToSave.webThick = this.form.wfWebThick;
                    sectionToSave.weight = this.form.wfWeight;
                    sectionToSave.area = this.form.wfArea;
                    sectionToSave.description = 'Perfil W - ' + this.form.wfWeight + ' kg/m';
                } else {
                    sectionToSave.description = 'Sección tipo ' + this.form.sectionType;
                }

                if (this.isNew) {
                    // Verificar si ya existe
                    var exists = false;
                    for (var i = 0; i < this.sections.length; i++) {
                        if (this.sections[i].name === sectionToSave.name) {
                            exists = true;
                            break;
                        }
                    }
                    if (exists) {
                        this.showToastMessage('La sección "' + sectionToSave.name + '" ya existe', 'error');
                        return;
                    }
                    this.sections.push(sectionToSave);
                    this.showToastMessage('Sección "' + sectionToSave.name + '" agregada', 'success');
                } else {
                    // Verificar que editingSection existe
                    if (!this.editingSection || !this.editingSection.name) {
                        this.showToastMessage('Error: No hay sección seleccionada para modificar', 'error');
                        this.backToList();
                        return;
                    }
                    var found = false;
                    for (var j = 0; j < this.sections.length; j++) {
                        if (this.sections[j].name === this.editingSection.name) {
                            this.sections[j] = sectionToSave;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        this.showToastMessage('Error: No se encontró la sección original', 'error');
                        this.backToList();
                        return;
                    }
                    this.showToastMessage('Sección "' + sectionToSave.name + '" modificada', 'success');
                }

                if (window.cadSystem) {
                    if (!window.cadSystem.frameSections) window.cadSystem.frameSections = {};
                    window.cadSystem.frameSections.sections = this.sections;
                    if (window.cadSystem.sync3D) window.cadSystem.sync3D();
                }

                this.view = 'list';
                this.selectedSectionName = sectionToSave.name;
                this.editingSection = null;
            },

            confirmDelete: function() {
                if (!this.selectedSectionName) {
                    this.showToastMessage('Por favor seleccione una sección para eliminar', 'warning');
                    return;
                }
                this.sectionToDelete = this.selectedSectionName;
                this.showConfirmModal = true;
            },

            performDelete: function() {
                var deletedName = this.sectionToDelete;
                var newSections = [];
                for (var i = 0; i < this.sections.length; i++) {
                    if (this.sections[i].name !== deletedName) {
                        newSections.push(this.sections[i]);
                    }
                }
                this.sections = newSections;
                this.selectedSectionName = null;
                this.showConfirmModal = false;

                if (window.cadSystem) {
                    if (!window.cadSystem.frameSections) window.cadSystem.frameSections = {};
                    window.cadSystem.frameSections.sections = this.sections;
                    if (window.cadSystem.sync3D) window.cadSystem.sync3D();
                }

                this.showToastMessage('Sección "' + deletedName + '" eliminada', 'success');
            },

            openImportDialog: function() {
                this.showImportModal = true;
            },

            importWideFlange: function(wf) {
                // Crear la nueva sección automáticamente
                var newSection = {
                    name: wf.name,
                    type: 'wf',
                    depth: wf.depth,
                    flangeWidth: wf.flangeWidth,
                    flangeThick: wf.flangeThick,
                    webThick: wf.webThick,
                    weight: wf.weight,
                    area: wf.area,
                    color: '#88ffaa',
                    description: 'Perfil W - ' + wf.weight + ' kg/m'
                };

                // Verificar si ya existe
                var exists = false;
                for (var i = 0; i < this.sections.length; i++) {
                    if (this.sections[i].name === newSection.name) {
                        exists = true;
                        break;
                    }
                }

                if (exists) {
                    this.showToastMessage('El perfil ' + wf.name + ' ya existe en la lista', 'warning');
                } else {
                    this.sections.push(newSection);
                    this.showToastMessage('Perfil ' + wf.name + ' importado correctamente', 'success');

                    // Actualizar cadSystem
                    if (window.cadSystem) {
                        if (!window.cadSystem.frameSections) window.cadSystem.frameSections = {};
                        window.cadSystem.frameSections.sections = this.sections;
                        if (window.cadSystem.sync3D) window.cadSystem.sync3D();
                    }
                }

                // Cerrar el modal de importación
                this.showImportModal = false;

                // Opcional: seleccionar automáticamente el nuevo perfil
                this.selectedSectionName = newSection.name;
            },
        }
    }
</script>