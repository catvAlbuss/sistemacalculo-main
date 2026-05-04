{{-- resources/views/components/cad/modals/display-design-info-modal.blade.php --}}
<div x-data="displayDesignInfoModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    <div class="bg-[#1e1e1e] text-gray-200 w-[500px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
        {{-- Título del Modal --}}
        <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700 text-gray-400">
            <span>Mostrar Resultados de Diseño</span>
            <button @click="close()" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-[10px] text-gray-400 hover:text-white">×</button>
        </div>

        <div class="p-4 flex flex-col gap-6">
            {{-- Contenedor Principal --}}
            <div class="border border-gray-700 rounded-md p-6 space-y-4 bg-[#252525]">

                {{-- Opción: Design Output (Deshabilitada) --}}
                <div class="flex items-center gap-4">
                    <label class="flex items-center gap-3 w-32 cursor-not-allowed opacity-40">
                        <input type="radio" name="designView" value="output" x-model="selectedView" disabled class="w-4 h-4 accent-gray-500">
                        <span class="text-sm">Salida de Diseño</span>
                    </label>
                    <div class="relative flex-1">
                        <select disabled class="w-full bg-[#0c0c0c] border border-gray-700 rounded px-2 py-1 text-sm text-gray-600 cursor-not-allowed outline-none appearance-none">
                            <option>Colores y Valores de Ratio P-M</option>
                        </select>
                        <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-700 text-[10px]">▼</div>
                    </div>
                </div>

                {{-- Opción: Design Input (Seleccionada) --}}
                <div class="flex items-center gap-4">
                    <label class="flex items-center gap-3 w-32 cursor-pointer">
                        <input type="radio" name="designView" value="input" x-model="selectedView" class="w-4 h-4 accent-blue-500">
                        <span class="text-sm font-medium">Entrada de Diseño</span>
                    </label>
                    <div class="relative flex-1">
                        <select x-model="selectedInputType" class="w-full bg-[#0c0c0c] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none appearance-none cursor-pointer">
                            <option value="designSections">Secciones de Diseño</option>
                            <option value="designType">Tipo de Diseño</option>
                            <option value="liveLoadRedFactors">Factores de Reducción de Carga Viva</option>
                            <option value="unbracedLengthRatios">Relaciones de Longitud no Arriostrada</option>
                            <option value="effectiveLengthFactors">Factores de Longitud Efectiva</option>
                            <option value="cmFactors">Factores Cm</option>
                            <option value="cbFactor">Factor Cb</option>
                            <option value="b1Factors">Factores B1</option>
                            <option value="b2Factors">Factores B2</option>
                            <option value="yieldStressFy">Esfuerzo de Fluencia Fy</option>
                            <option value="axialCapacities">Capacidades Axiales</option>
                            <option value="bendingCapacities">Capacidades a Flexión</option>
                            <option value="shearCapacities">Capacidades a Corte</option>
                        </select>
                        <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none text-blue-500 text-[10px]">▼</div>
                    </div>
                </div>
            </div>

            {{-- Botones Inferiores --}}
            <div class="flex justify-center gap-4">
                <button @click="applyDesignInfo()" class="px-10 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors shadow-lg font-medium">
                    OK
                </button>
                <button @click="close()" class="px-10 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors">
                    Cancelar
                </button>
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
    function displayDesignInfoModal() {
        return {
            open: false,
            selectedView: 'input', // 'input' o 'output'
            selectedInputType: 'designSections',

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            init() {
                this.loadSettings();
                window.addEventListener('open-display-design-info-modal', () => {
                    this.openModal();
                });
            },

            loadSettings() {
                if (window.cadSystem && window.cadSystem.designDisplaySettings) {
                    this.selectedView = window.cadSystem.designDisplaySettings.selectedView || 'input';
                    this.selectedInputType = window.cadSystem.designDisplaySettings.selectedInputType || 'designSections';
                }
            },

            saveSettings() {
                if (window.cadSystem) {
                    if (!window.cadSystem.designDisplaySettings) {
                        window.cadSystem.designDisplaySettings = {};
                    }
                    window.cadSystem.designDisplaySettings.selectedView = this.selectedView;
                    window.cadSystem.designDisplaySettings.selectedInputType = this.selectedInputType;
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
                this.loadSettings();
                this.open = true;
            },

            close() {
                this.open = false;
            },

            applyDesignInfo() {
                this.saveSettings();

                var typeNames = {
                    'designSections': 'Secciones de Diseño',
                    'designType': 'Tipo de Diseño',
                    'liveLoadRedFactors': 'Factores de Reducción de Carga Viva',
                    'unbracedLengthRatios': 'Relaciones de Longitud no Arriostrada',
                    'effectiveLengthFactors': 'Factores de Longitud Efectiva',
                    'cmFactors': 'Factores Cm',
                    'cbFactor': 'Factor Cb',
                    'b1Factors': 'Factores B1',
                    'b2Factors': 'Factores B2',
                    'yieldStressFy': 'Esfuerzo de Fluencia Fy',
                    'axialCapacities': 'Capacidades Axiales',
                    'bendingCapacities': 'Capacidades a Flexión',
                    'shearCapacities': 'Capacidades a Corte'
                };

                var message = '📊 Mostrando información de diseño: ';
                if (this.selectedView === 'output') {
                    message += 'Salida de Diseño';
                } else {
                    message += typeNames[this.selectedInputType] || this.selectedInputType;
                }

                this.showToastMessage(message, 'success');

                if (window.cadSystem && window.cadSystem.showMessage) {
                    window.cadSystem.showMessage(message);
                }

                this.close();
            }
        }
    }
</script>