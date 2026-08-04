{{-- resources/views/components/cad/modals/design-overwrites-modal.blade.php --}}
<div x-data="designOverwritesModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    <div class="bg-[#1e1e1e] text-gray-200 w-[850px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
        {{-- Título del Modal --}}
        <div class="bg-[#2d2d2d] px-3 py-1.5 text-[11px] flex justify-between items-center border-b border-gray-800 text-gray-400">
            <span>Sobrescrituras de Diseño de Pórticos de Acero para (AISC-LRFD93)</span>
            <button @click="close()" class="hover:text-white text-lg leading-none">×</button>
        </div>

        <div class="p-4 grid grid-cols-[1.5fr,1fr] gap-6">

            {{-- Columna Izquierda: Tabla de Parámetros --}}
            <div class="flex flex-col gap-2">
                <div class="border border-gray-800 rounded overflow-hidden">
                    {{-- Encabezado de Tabla --}}
                    <div class="grid grid-cols-[40px,1fr,120px] bg-[#2d2d2d] border-b border-gray-800 text-[10px] uppercase font-bold text-gray-400 text-center">
                        <div class="py-1.5 border-r border-gray-800">Alt</div>
                        <div class="py-1.5 border-r border-gray-800">Elemento / Propiedad</div>
                        <div class="py-1.5">Valor</div>
                    </div>

                    {{-- Cuerpo de Tabla con Scroll --}}
                    <div class="h-[500px] overflow-y-auto bg-black text-[12px]">
                        <template x-for="(item, idx) in overwriteItems" :key="idx">
                            <div class="grid grid-cols-[40px,1fr,120px] border-b border-gray-900 items-center hover:bg-gray-900" :class="{'bg-[#094771]/20': selectedItem === idx}">
                                <div class="flex justify-center border-r border-gray-800 py-1">
                                    <input type="checkbox" x-model="item.checked" @change="updateOverwrite(idx)" class="accent-blue-500">
                                </div>
                                <div @click="selectItem(idx)" class="px-3 border-r border-gray-800 cursor-pointer" :class="item.checked ? 'text-white font-medium' : 'text-gray-300 italic'">
                                    <span x-text="item.name"></span>
                                </div>
                                <div class="px-2 text-center" :class="item.checked ? 'text-blue-400 font-mono' : 'text-gray-400'">
                                    <span x-text="item.displayValue"></span>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>

            {{-- Columna Derecha: Información y Botones --}}
            <div class="flex flex-col gap-6">
                {{-- Cuadro de Información/Ayuda --}}
                <div class="bg-[#141414] border border-gray-800 rounded-md p-4 h-48 text-[11px] text-gray-400 leading-relaxed italic shadow-inner overflow-y-auto">
                    <span x-html="selectedDescription"></span>
                </div>

                {{-- Botones de Acción --}}
                <div class="flex flex-col gap-3 px-12">
                    <button @click="saveOverwrites()" class="w-full py-2 text-sm font-bold bg-[#2d2d3d] hover:bg-blue-700 text-white border border-gray-600 rounded transition-all shadow-lg active:scale-95">
                        OK
                    </button>
                    <button @click="close()" class="w-full py-2 text-sm font-bold bg-[#1a1a1a] hover:bg-gray-800 text-gray-400 border border-gray-700 rounded transition-all active:scale-95">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>

    {{-- Modal para editar valor --}}
    <div x-show="showValueEditor" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showValueEditor = false">
        <div class="bg-[#1e1e1e] rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700">
                <span class="text-gray-400">Editar Sobrescritura</span>
                <button @click="showValueEditor = false" class="text-gray-400 hover:text-white">×</button>
            </div>
            <div class="p-4">
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-1">Propiedad</label>
                    <div class="text-sm text-white" x-text="editingItem ? editingItem.name : ''"></div>
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-1">Valor Actual</label>
                    <div class="text-sm text-blue-400" x-text="editingItem ? editingItem.value : ''"></div>
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-1">Nuevo Valor</label>
                    <input type="text" x-model="newValue" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
            </div>
            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-[#2d2d2d]">
                <button @click="showValueEditor = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Cancelar</button>
                <button @click="saveValue()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
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
    function designOverwritesModal() {
        return {
            open: false,
            selectedItem: null,
            overwriteItems: [],

            showValueEditor: false,
            editingItem: null,
            editingIndex: null,
            newValue: '',

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            // Descripciones de cada parámetro
            descriptions: {
                'currentDesignSection': 'Sección de diseño actualmente asignada al elemento. Puede sobrescribirse para cambiar la sección utilizada en el diseño.',
                'frameType': 'Tipo de pórtico: Determina el comportamiento estructural. "Moment Frame" (Pórtico Resistente a Momento) o "Braced Frame" (Pórtico Arriostrado).',
                'effectiveLengthKMajor': 'Factor de Longitud Efectiva (K) para el eje mayor. Afecta la capacidad de pandeo del elemento.',
                'effectiveLengthKMinor': 'Factor de Longitud Efectiva (K) para el eje menor. Afecta la capacidad de pandeo del elemento.',
                'momentCoefficientCmMajor': 'Coeficiente de Momento Cm para el eje mayor. Usado en el diseño de vigas-columnas.',
                'momentCoefficientCmMinor': 'Coeficiente de Momento Cm para el eje menor. Usado en el diseño de vigas-columnas.',
                'yieldStressFy': 'Esfuerzo de fluencia del acero (Fy). Valor utilizado para el diseño del elemento.',
                'liveLoadReduction': 'Factor de reducción de carga viva aplicable al elemento.',
                'unbracedLengthLb': 'Longitud no arriostrada (Lb) para pandeo lateral-torsional.',
                'cbFactor': 'Factor Cb para pandeo lateral-torsional. Considera la distribución de momentos.',
                'b1Factor': 'Factor B1 para amplificación de momentos por efectos P-δ.',
                'b2Factor': 'Factor B2 para amplificación de momentos por efectos P-Δ.',
                'axialCapacity': 'Capacidad axial del elemento (Pn/Ωc o φcPn).',
                'bendingCapacity': 'Capacidad a flexión del elemento (Mn/Ωb o φbMn).',
                'shearCapacity': 'Capacidad a corte del elemento (Vn/Ωv o φvVn).'
            },

            // Lista completa de parámetros de sobrescritura
            defaultOverwrites: [{
                    name: 'Sección de Diseño Actual',
                    key: 'currentDesignSection',
                    value: 'W4X13',
                    displayValue: 'W4X13',
                    checked: true,
                    editable: true
                },
                {
                    name: 'Tipo de Pórtico',
                    key: 'frameType',
                    value: 'Moment Frame',
                    displayValue: 'Moment Frame',
                    checked: true,
                    editable: true
                },
                {
                    name: 'Factor de Longitud Efectiva (K Mayor)',
                    key: 'effectiveLengthKMajor',
                    value: '1.0',
                    displayValue: '1.0',
                    checked: true,
                    editable: true
                },
                {
                    name: 'Factor de Longitud Efectiva (K Menor)',
                    key: 'effectiveLengthKMinor',
                    value: '1.0',
                    displayValue: '1.0',
                    checked: false,
                    editable: true
                },
                {
                    name: 'Coeficiente de Momento (Cm Mayor)',
                    key: 'momentCoefficientCmMajor',
                    value: '0.85',
                    displayValue: '0.85',
                    checked: true,
                    editable: true
                },
                {
                    name: 'Coeficiente de Momento (Cm Menor)',
                    key: 'momentCoefficientCmMinor',
                    value: '0.85',
                    displayValue: '0.85',
                    checked: false,
                    editable: true
                },
                {
                    name: 'Esfuerzo de Fluencia, Fy',
                    key: 'yieldStressFy',
                    value: '250',
                    displayValue: '250 MPa',
                    checked: true,
                    editable: true
                },
                {
                    name: 'Factor de Reducción de Carga Viva',
                    key: 'liveLoadReduction',
                    value: '1.0',
                    displayValue: '1.0',
                    checked: false,
                    editable: true
                },
                {
                    name: 'Longitud no Arriostrada (Lb)',
                    key: 'unbracedLengthLb',
                    value: '0',
                    displayValue: '0',
                    checked: false,
                    editable: true
                },
                {
                    name: 'Factor Cb',
                    key: 'cbFactor',
                    value: '1.0',
                    displayValue: '1.0',
                    checked: false,
                    editable: true
                },
                {
                    name: 'Factor B1',
                    key: 'b1Factor',
                    value: '1.0',
                    displayValue: '1.0',
                    checked: false,
                    editable: true
                },
                {
                    name: 'Factor B2',
                    key: 'b2Factor',
                    value: '1.0',
                    displayValue: '1.0',
                    checked: false,
                    editable: true
                },
                {
                    name: 'Capacidad Axial',
                    key: 'axialCapacity',
                    value: '0',
                    displayValue: '0 kN',
                    checked: false,
                    editable: false
                },
                {
                    name: 'Capacidad a Flexión',
                    key: 'bendingCapacity',
                    value: '0',
                    displayValue: '0 kN-m',
                    checked: false,
                    editable: false
                },
                {
                    name: 'Capacidad a Corte',
                    key: 'shearCapacity',
                    value: '0',
                    displayValue: '0 kN',
                    checked: false,
                    editable: false
                }
            ],

            init() {
                this.loadOverwrites();
                window.addEventListener('open-design-overwrites-modal', () => {
                    this.openModal();
                });
            },

            loadOverwrites() {
                if (window.cadSystem && window.cadSystem.designOverwrites && window.cadSystem.designOverwrites.length > 0) {
                    this.overwriteItems = window.cadSystem.designOverwrites;
                } else {
                    this.overwriteItems = JSON.parse(JSON.stringify(this.defaultOverwrites));
                    if (window.cadSystem) {
                        window.cadSystem.designOverwrites = this.overwriteItems;
                    }
                }
            },

            saveOverwritesToCadSystem() {
                if (window.cadSystem) {
                    window.cadSystem.designOverwrites = JSON.parse(JSON.stringify(this.overwriteItems));
                }
            },

            get selectedDescription() {
                if (this.selectedItem !== null && this.overwriteItems[this.selectedItem]) {
                    var key = this.overwriteItems[this.selectedItem].key;
                    return this.descriptions[key] || 'Seleccione un parámetro de la izquierda para ver su descripción detallada y los límites normativos según AISC-LRFD93.';
                }
                return 'Seleccione un parámetro de la izquierda para ver su descripción detallada y los límites normativos según AISC-LRFD93.';
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
                this.loadOverwrites();
                this.selectedItem = null;
                this.open = true;
            },

            close() {
                this.open = false;
                this.showValueEditor = false;
            },

            selectItem(idx) {
                this.selectedItem = idx;
                var item = this.overwriteItems[idx];
                if (item.editable && item.checked) {
                    // Permitir edición con doble click si se desea
                }
            },

            updateOverwrite(idx) {
                // Actualizar el estado cuando se cambia el checkbox
                this.saveOverwritesToCadSystem();
            },

            editValue(idx) {
                var item = this.overwriteItems[idx];
                if (item && item.editable && item.checked) {
                    this.editingItem = item;
                    this.editingIndex = idx;
                    this.newValue = item.value;
                    this.showValueEditor = true;
                } else if (!item) {
                    console.warn('Item no encontrado en el índice:', idx);
                }
            },

            saveValue() {
                if (this.editingIndex !== null && this.overwriteItems[this.editingIndex]) {
                    this.overwriteItems[this.editingIndex].value = this.newValue;
                    this.overwriteItems[this.editingIndex].displayValue = this.newValue;
                    this.saveOverwritesToCadSystem();
                    this.showToastMessage('Sobrescritura actualizada', 'success');
                }
                this.showValueEditor = false;
                this.editingItem = null;
            },

            saveOverwrites() {
                this.saveOverwritesToCadSystem();
                this.showToastMessage('Sobrescrituras de diseño guardadas', 'success');
                this.close();
            }
        }
    }
</script>