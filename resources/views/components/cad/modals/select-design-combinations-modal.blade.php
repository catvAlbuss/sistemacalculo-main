{{-- resources/views/components/cad/modals/select-design-combinations-modal.blade.php --}}
<div x-data="selectDesignCombinationsModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    <div class="bg-[#1e1e1e] text-gray-200 w-[550px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
        {{-- Título del Modal --}}
        <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700 text-gray-400">
            <span>Selección de Combinaciones de Carga de Diseño</span>
            <button @click="close()" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-[10px] text-gray-400 hover:text-white">×</button>
        </div>

        {{-- Sistema de Pestañas (Tabs) --}}
        <div class="flex bg-[#252525] border-b border-gray-700">
            <button @click="activeTab = 'strength'; updateByTab()"
                class="px-6 py-2 text-xs font-bold transition-colors"
                :class="activeTab === 'strength' ? 'border-b-2 border-blue-500 bg-[#1e1e1e] text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d]'">
                Resistencia (Strength)
            </button>
            <button @click="activeTab = 'deflection'; updateByTab()"
                class="px-6 py-2 text-xs transition-colors"
                :class="activeTab === 'deflection' ? 'border-b-2 border-blue-500 bg-[#1e1e1e] text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d]'">
                Deflexión
            </button>
        </div>

        <div class="p-6">
            {{-- Contenedor Principal: Choose Combos --}}
            <fieldset class="border border-gray-700 rounded-md p-4">
                <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Elegir Combinaciones</legend>

                <div class="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                    {{-- Columna Izquierda: Lista Total de Combos --}}
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] text-center text-gray-400 uppercase tracking-wider font-bold">Lista de Combos</label>
                        <div class="bg-[#0c0c0c] border border-gray-700 h-44 rounded overflow-y-auto">
                            <template x-for="(combo, idx) in availableCombos" :key="idx">
                                <div @click="selectAvailableCombo(idx)"
                                    class="px-2 py-1 text-sm cursor-pointer hover:bg-gray-800 transition-colors"
                                    :class="{'bg-blue-900': selectedAvailableCombo === idx, 'text-gray-300': true}">
                                    <span x-text="combo"></span>
                                </div>
                            </template>
                            <div x-show="availableCombos.length === 0" class="px-2 py-4 text-center text-gray-500 text-sm">
                                No hay combinaciones disponibles
                            </div>
                        </div>
                    </div>

                    {{-- Columna Central: Botones de Acción --}}
                    <div class="flex flex-col gap-3 pt-4">
                        <button @click="moveToDesign()"
                            class="px-3 py-1.5 text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 rounded shadow-sm transition-all active:scale-95"
                            :class="{'opacity-50 cursor-not-allowed': selectedAvailableCombo === null}" :disabled="selectedAvailableCombo === null">
                            Añadir →
                        </button>
                        <button @click="moveToAvailable()"
                            class="px-3 py-1.5 text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 rounded shadow-sm transition-all active:scale-95"
                            :class="{'opacity-50 cursor-not-allowed': selectedDesignCombo === null}" :disabled="selectedDesignCombo === null">
                            ← Quitar
                        </button>
                        <button @click="showSelectedComboDetail()"
                            class="px-3 py-1.5 text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 rounded shadow-sm transition-all active:scale-95"
                            :class="{'opacity-50 cursor-not-allowed': selectedDesignCombo === null}" :disabled="selectedDesignCombo === null">
                            Mostrar
                        </button>
                    </div>

                    {{-- Columna Derecha: Combinaciones de Diseño --}}
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] text-center text-gray-400 uppercase tracking-wider font-bold">Combos de Diseño</label>
                        <div class="bg-[#0c0c0c] border border-gray-700 h-44 rounded overflow-y-auto">
                            <template x-for="(combo, idx) in designCombos" :key="idx">
                                <div @click="selectDesignCombo(idx)"
                                    class="px-2 py-1 text-sm cursor-pointer hover:bg-gray-800 transition-colors"
                                    :class="{'bg-[#094771]': selectedDesignCombo === idx, 'text-gray-300': true}">
                                    <span x-text="combo"></span>
                                </div>
                            </template>
                            <div x-show="designCombos.length === 0" class="px-2 py-4 text-center text-gray-500 text-sm">
                                No hay combinaciones de diseño
                            </div>
                        </div>
                    </div>
                </div>
            </fieldset>
        </div>
    </div>

    {{-- Modal de Datos de Combinación de Carga --}}
    {{-- Modal de Datos de Combinación de Carga --}}
    <div x-show="showComboDetailModal" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showComboDetailModal = false">
        <div class="bg-[#1e1e1e] text-gray-200 w-[450px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
            <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700 text-gray-400">
                <span>Datos de Combinación de Carga</span>
                <button @click="showComboDetailModal = false" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-[10px]">×</button>
            </div>

            <div class="p-4 flex flex-col gap-4">
                {{-- Nombre de la Combinación --}}
                <div class="border border-gray-700 rounded p-3 flex items-center justify-between bg-[#252525]">
                    <label class="text-sm font-bold">Nombre de Combinación</label>
                    <input type="text" x-model="currentComboDetail.name" class="w-40 bg-[#0c0c0c] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none">
                </div>

                {{-- Tipo de Combinación --}}
                <div class="border border-gray-700 rounded p-3 flex items-center justify-between">
                    <label class="text-sm">Tipo de Combinación</label>
                    <div class="relative w-40">
                        <select x-model="currentComboDetail.type" class="w-full bg-[#0c0c0c] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none appearance-none cursor-pointer">
                            <option value="ADD">Suma (ADD)</option>
                            <option value="ENVE">Envolvente (Envelope)</option>
                            <option value="ABS">Suma Absoluta</option>
                            <option value="SRSS">SRSS</option>
                        </select>
                        <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500 text-[10px]">▼</div>
                    </div>
                </div>

                {{-- Definir Combinación --}}
                <fieldset class="border border-gray-700 rounded p-4">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Definir Combinación</legend>

                    <div class="border border-gray-700 rounded overflow-hidden">
                        <div class="grid grid-cols-2 bg-[#2d2d2d] border-b border-gray-700">
                            <div class="py-1.5 px-2 text-[10px] uppercase font-bold text-center text-gray-400 border-r border-gray-700">
                                Nombre del Caso
                            </div>
                            <div class="py-1.5 px-2 text-[10px] uppercase font-bold text-center text-gray-400">
                                Factor Escala
                            </div>
                        </div>

                        <div class="bg-[#0c0c0c]">
                            <template x-for="(load, idx) in currentComboDetail.loadCases" :key="idx">
                                <div class="grid grid-cols-2 border-b border-gray-800 last:border-b-0">
                                    <div class="py-2 px-2 text-xs border-r border-gray-800" :class="{'bg-[#094771]': idx === 0}">
                                        <span x-text="load.name"></span>
                                    </div>
                                    <div class="py-2 px-2 text-xs text-center" :class="{'bg-[#094771]': idx === 0}">
                                        <span x-text="load.scale"></span>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </fieldset>

                <div class="flex justify-center pt-2">
                    <button @click="saveComboDetail()" class="px-12 py-1 text-sm bg-gray-800 hover:bg-blue-600 text-gray-200 border border-gray-600 rounded transition-all shadow-md active:translate-y-px">
                        OK
                    </button>
                </div>
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
    function selectDesignCombinationsModal() {
        return {
            open: false,
            activeTab: 'strength',

            // Listas de combinaciones
            availableCombos: [],
            designCombos: [],
            strengthAvailable: [],
            strengthDesign: [],
            deflectionAvailable: [],
            deflectionDesign: [],

            // Selecciones
            selectedAvailableCombo: null,
            selectedDesignCombo: null,

            // Modal de detalle
            showComboDetailModal: false,
            currentComboDetail: {
                name: '',
                type: 'ADD',
                loadCases: []
            },

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            // Datos iniciales
            initialStrengthAvailable: ['DSTLD1', 'DSTLD2'],
            initialStrengthDesign: ['DSTLS1', 'DSTLS2'],
            initialDeflectionAvailable: ['DSTLS1', 'DSTLS2'],
            initialDeflectionDesign: ['DSTLD1', 'DSTLD2'],

            // Detalles de combinaciones
            comboDetails: {
                'DSTLD1': {
                    name: 'DSTLD1',
                    type: 'ADD',
                    loadCases: [{
                        name: 'DEAD Static Load',
                        scale: 1
                    }, {
                        name: 'LIVE Static Load',
                        scale: 1
                    }]
                },
                'DSTLD2': {
                    name: 'DSTLD2',
                    type: 'ADD',
                    loadCases: [{
                        name: 'DEAD Static Load',
                        scale: 1.4
                    }, {
                        name: 'LIVE Static Load',
                        scale: 1.7
                    }]
                },
                'DSTLS1': {
                    name: 'DSTLS1',
                    type: 'ADD',
                    loadCases: [{
                        name: 'DEAD Static Load',
                        scale: 1.2
                    }, {
                        name: 'LIVE Static Load',
                        scale: 1.6
                    }]
                },
                'DSTLS2': {
                    name: 'DSTLS2',
                    type: 'ADD',
                    loadCases: [{
                        name: 'DEAD Static Load',
                        scale: 0.9
                    }, {
                        name: 'WIND Static Load',
                        scale: 1.6
                    }]
                }
            },

            init() {
                this.loadCombinations();
                window.addEventListener('open-select-design-combinations-modal', () => {
                    this.openModal();
                });
            },

            loadCombinations() {
                if (window.cadSystem && window.cadSystem.designCombinations) {
                    var dc = window.cadSystem.designCombinations;
                    this.strengthAvailable = dc.strengthAvailable || [...this.initialStrengthAvailable];
                    this.strengthDesign = dc.strengthDesign || [...this.initialStrengthDesign];
                    this.deflectionAvailable = dc.deflectionAvailable || [...this.initialDeflectionAvailable];
                    this.deflectionDesign = dc.deflectionDesign || [...this.initialDeflectionDesign];
                    this.comboDetails = dc.comboDetails || this.comboDetails;
                } else {
                    this.strengthAvailable = [...this.initialStrengthAvailable];
                    this.strengthDesign = [...this.initialStrengthDesign];
                    this.deflectionAvailable = [...this.initialDeflectionAvailable];
                    this.deflectionDesign = [...this.initialDeflectionDesign];
                }
                this.updateByTab();
            },

            updateByTab() {
                if (this.activeTab === 'strength') {
                    this.availableCombos = [...this.strengthAvailable];
                    this.designCombos = [...this.strengthDesign];
                } else {
                    this.availableCombos = [...this.deflectionAvailable];
                    this.designCombos = [...this.deflectionDesign];
                }
                this.selectedAvailableCombo = null;
                this.selectedDesignCombo = null;
            },

            saveToCadSystem() {
                if (window.cadSystem) {
                    if (!window.cadSystem.designCombinations) {
                        window.cadSystem.designCombinations = {};
                    }
                    window.cadSystem.designCombinations.strengthAvailable = [...this.strengthAvailable];
                    window.cadSystem.designCombinations.strengthDesign = [...this.strengthDesign];
                    window.cadSystem.designCombinations.deflectionAvailable = [...this.deflectionAvailable];
                    window.cadSystem.designCombinations.deflectionDesign = [...this.deflectionDesign];
                    window.cadSystem.designCombinations.comboDetails = this.comboDetails;
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
            },

            close() {
                this.open = false;
                this.showComboDetailModal = false;
            },

            selectAvailableCombo(idx) {
                this.selectedAvailableCombo = idx;
                this.selectedDesignCombo = null;
            },

            selectDesignCombo(idx) {
                this.selectedDesignCombo = idx;
                this.selectedAvailableCombo = null;
            },

            moveToDesign() {
                if (this.selectedAvailableCombo !== null && this.selectedAvailableCombo < this.availableCombos.length) {
                    var comboToMove = this.availableCombos[this.selectedAvailableCombo];

                    // Verificar si ya existe en diseño
                    var exists = false;
                    for (var i = 0; i < this.designCombos.length; i++) {
                        if (this.designCombos[i] === comboToMove) {
                            exists = true;
                            break;
                        }
                    }

                    if (!exists) {
                        // Mover de disponible a diseño
                        this.availableCombos.splice(this.selectedAvailableCombo, 1);
                        this.designCombos.push(comboToMove);

                        // Actualizar arrays según la pestaña activa
                        if (this.activeTab === 'strength') {
                            this.strengthAvailable = [...this.availableCombos];
                            this.strengthDesign = [...this.designCombos];
                        } else {
                            this.deflectionAvailable = [...this.availableCombos];
                            this.deflectionDesign = [...this.designCombos];
                        }

                        this.saveToCadSystem();
                        this.showToastMessage('Combinación movida a Diseño: ' + comboToMove, 'success');
                        this.selectedAvailableCombo = null;
                    } else {
                        this.showToastMessage('La combinación ya existe en Diseño', 'warning');
                    }
                }
            },

            moveToAvailable() {
                if (this.selectedDesignCombo !== null && this.selectedDesignCombo < this.designCombos.length) {
                    var comboToMove = this.designCombos[this.selectedDesignCombo];

                    // Verificar si ya existe en disponibles
                    var exists = false;
                    for (var i = 0; i < this.availableCombos.length; i++) {
                        if (this.availableCombos[i] === comboToMove) {
                            exists = true;
                            break;
                        }
                    }

                    if (!exists) {
                        // Mover de diseño a disponible
                        this.designCombos.splice(this.selectedDesignCombo, 1);
                        this.availableCombos.push(comboToMove);

                        // Ordenar alfabéticamente
                        this.availableCombos.sort();
                        this.designCombos.sort();

                        // Actualizar arrays según la pestaña activa
                        if (this.activeTab === 'strength') {
                            this.strengthAvailable = [...this.availableCombos];
                            this.strengthDesign = [...this.designCombos];
                        } else {
                            this.deflectionAvailable = [...this.availableCombos];
                            this.deflectionDesign = [...this.designCombos];
                        }

                        this.saveToCadSystem();
                        this.showToastMessage('Combinación movida a Lista de Combos: ' + comboToMove, 'success');
                        this.selectedDesignCombo = null;
                    } else {
                        this.showToastMessage('La combinación ya existe en Lista de Combos', 'warning');
                    }
                }
            },

            showSelectedComboDetail() {
                if (this.selectedDesignCombo !== null && this.selectedDesignCombo < this.designCombos.length) {
                    var comboName = this.designCombos[this.selectedDesignCombo];
                    this.currentComboDetail = this.comboDetails[comboName] || {
                        name: comboName,
                        type: 'ADD',
                        loadCases: [{
                            name: 'DEAD Static Load',
                            scale: 1
                        }]
                    };
                    console.log('Detalle de combinación:', this.currentComboDetail); // Para depurar
                    this.showComboDetailModal = true;
                }
            },

            saveComboDetail() {
                var oldName = null;
                // Buscar el nombre original si cambió
                for (var key in this.comboDetails) {
                    if (this.comboDetails[key] === this.currentComboDetail && key !== this.currentComboDetail.name) {
                        oldName = key;
                        break;
                    }
                }

                // Actualizar el detalle
                this.comboDetails[this.currentComboDetail.name] = {
                    name: this.currentComboDetail.name,
                    type: this.currentComboDetail.type,
                    loadCases: this.currentComboDetail.loadCases
                };

                // Si el nombre cambió, eliminar la entrada antigua
                if (oldName && oldName !== this.currentComboDetail.name) {
                    delete this.comboDetails[oldName];

                    // Actualizar listas
                    var updateList = function(list) {
                        var idx = list.indexOf(oldName);
                        if (idx !== -1) list[idx] = this.currentComboDetail.name;
                        return list;
                    }.bind(this);

                    this.strengthAvailable = updateList(this.strengthAvailable);
                    this.strengthDesign = updateList(this.strengthDesign);
                    this.deflectionAvailable = updateList(this.deflectionAvailable);
                    this.deflectionDesign = updateList(this.deflectionDesign);
                    this.availableCombos = updateList(this.availableCombos);
                    this.designCombos = updateList(this.designCombos);
                }

                this.saveToCadSystem();
                this.showComboDetailModal = false;
                this.updateByTab();
                this.showToastMessage('Combinación guardada: ' + this.currentComboDetail.name, 'success');
            }
        }
    }
</script>