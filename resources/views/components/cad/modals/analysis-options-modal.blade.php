{{-- resources/views/components/cad/modals/analysis-options-modal.blade.php --}}
<div x-data="analysisOptionsModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.esc.window="close()">

    <div class="bg-[#1e1e1e] text-gray-200 w-[600px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
        {{-- Título del Modal --}}
        <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700">
            <span>Opciones de Análisis</span>
            <button @click="close()" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded text-gray-400 hover:text-white text-xs">×</button>
        </div>

        <div class="p-4 flex flex-col gap-6">
            {{-- Sección: Grados de Libertad Activos --}}
            <fieldset class="border border-gray-700 rounded-md p-4">
                <legend class="text-xs text-gray-400 px-2 ml-2">Grados de Libertad Activos de la Edificación</legend>

                <div class="grid grid-cols-4 gap-3 mb-6">
                    <button @click="selectAnalysisType('full3d')"
                        class="flex flex-col items-center gap-2 p-2 rounded transition-colors"
                        :class="analysisType === 'full3d' ? 'bg-[#094771] border border-blue-400' : 'bg-[#2d2d2d] border border-gray-600 hover:bg-gray-700'">
                        <div class="text-[10px] uppercase font-bold" :class="analysisType === 'full3d' ? 'text-white' : 'text-gray-400'">Full 3D</div>
                        <div class="h-12 w-full bg-gray-300/20 rounded flex items-center justify-center text-2xl">🧊</div>
                    </button>
                    <button @click="selectAnalysisType('xz')"
                        class="flex flex-col items-center gap-2 p-2 rounded transition-colors"
                        :class="analysisType === 'xz' ? 'bg-[#094771] border border-blue-400' : 'bg-[#2d2d2d] border border-gray-600 hover:bg-gray-700'">
                        <div class="text-[10px] uppercase" :class="analysisType === 'xz' ? 'text-white' : 'text-gray-400'">Plano XZ</div>
                        <div class="h-12 w-full bg-gray-300/10 rounded flex items-center justify-center text-2xl">🔳</div>
                    </button>
                    <button @click="selectAnalysisType('yz')"
                        class="flex flex-col items-center gap-2 p-2 rounded transition-colors"
                        :class="analysisType === 'yz' ? 'bg-[#094771] border border-blue-400' : 'bg-[#2d2d2d] border border-gray-600 hover:bg-gray-700'">
                        <div class="text-[10px] uppercase" :class="analysisType === 'yz' ? 'text-white' : 'text-gray-400'">Plano YZ</div>
                        <div class="h-12 w-full bg-gray-300/10 rounded flex items-center justify-center text-2xl">🔳</div>
                    </button>
                    <button @click="selectAnalysisType('noRz')"
                        class="flex flex-col items-center gap-2 p-2 rounded transition-colors"
                        :class="analysisType === 'noRz' ? 'bg-[#094771] border border-blue-400' : 'bg-[#2d2d2d] border border-gray-600 hover:bg-gray-700'">
                        <div class="text-[10px] uppercase" :class="analysisType === 'noRz' ? 'text-white' : 'text-gray-400'">Sin Rotación Z</div>
                        <div class="h-12 w-full bg-gray-300/10 rounded flex items-center justify-center text-2xl">🚫</div>
                    </button>
                </div>

                <div class="grid grid-cols-6 gap-2">
                    <label class="flex items-center gap-2 text-xs cursor-pointer hover:text-white">
                        <input type="checkbox" x-model="dof.ux" class="accent-blue-600 bg-gray-800 border-gray-600 rounded"> UX
                    </label>
                    <label class="flex items-center gap-2 text-xs cursor-pointer hover:text-white">
                        <input type="checkbox" x-model="dof.uy" class="accent-blue-600 bg-gray-800 border-gray-600 rounded"> UY
                    </label>
                    <label class="flex items-center gap-2 text-xs cursor-pointer hover:text-white">
                        <input type="checkbox" x-model="dof.uz" class="accent-blue-600 bg-gray-800 border-gray-600 rounded"> UZ
                    </label>
                    <label class="flex items-center gap-2 text-xs cursor-pointer hover:text-white">
                        <input type="checkbox" x-model="dof.rx" class="accent-blue-600 bg-gray-800 border-gray-600 rounded"> RX
                    </label>
                    <label class="flex items-center gap-2 text-xs cursor-pointer hover:text-white">
                        <input type="checkbox" x-model="dof.ry" class="accent-blue-600 bg-gray-800 border-gray-600 rounded"> RY
                    </label>
                    <label class="flex items-center gap-2 text-xs cursor-pointer hover:text-white">
                        <input type="checkbox" x-model="dof.rz" class="accent-blue-600 bg-gray-800 border-gray-600 rounded"> RZ
                    </label>
                </div>
            </fieldset>

            {{-- Opciones de Análisis Dinámico y P-Delta --}}
            <div class="space-y-3 px-1">
                <div class="flex justify-between items-center">
                    <label class="flex items-center gap-3 text-sm cursor-pointer">
                        <input type="checkbox" x-model="dynamicAnalysis.enabled" class="w-4 h-4 accent-blue-600"> Análisis Dinámico
                    </label>
                    <button @click="openDynamicParamsDialog()"
                        class="px-4 py-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded min-w-[200px] transition-colors"
                        :class="{'opacity-50 cursor-not-allowed': !dynamicAnalysis.enabled}" :disabled="!dynamicAnalysis.enabled">
                        Definir Parámetros Dinámicos...
                    </button>
                </div>

                <div class="flex justify-between items-center">
                    <label class="flex items-center gap-3 text-sm cursor-pointer">
                        <input type="checkbox" x-model="pDelta.enabled" class="w-4 h-4 accent-blue-600"> Incluir P-Delta
                    </label>
                    <button @click="openPDeltaDialog()"
                        class="px-4 py-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded min-w-[200px] transition-colors"
                        :class="{'opacity-50 cursor-not-allowed': !pDelta.enabled}" :disabled="!pDelta.enabled">
                        Definir Parámetros P-Delta...
                    </button>
                </div>

                <div class="flex justify-between items-center">
                    <label class="flex items-center gap-3 text-sm cursor-pointer">
                        <input type="checkbox" x-model="dbAccess.enabled" class="w-4 h-4 accent-blue-600"> Guardar Archivo DB Access
                    </label>
                    <button @click="openDbAccessDialog()"
                        class="px-4 py-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded min-w-[200px] transition-colors"
                        :class="{'opacity-50 cursor-not-allowed': !dbAccess.enabled}" :disabled="!dbAccess.enabled">
                        Nombre del Archivo...
                    </button>
                </div>
            </div>

            {{-- Botones de Acción --}}
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button @click="saveOptions()" class="px-8 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors shadow-lg">
                    OK
                </button>
                <button @click="close()" class="px-8 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors">
                    Cancelar
                </button>
            </div>
        </div>
    </div>

    {{-- Modal para Parámetros de Análisis Dinámico --}}
    <div x-show="showDynamicParamsDialog" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showDynamicParamsDialog = false">
        <div class="bg-[#1e1e1e] text-gray-200 w-[500px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
            <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700 text-gray-400">
                <span>Parámetros de Análisis Dinámico</span>
                <button @click="showDynamicParamsDialog = false" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-[10px]">×</button>
            </div>

            <div class="p-4 flex flex-col gap-4">
                <div class="flex items-center justify-between bg-[#252525] p-2 rounded border border-gray-700">
                    <label class="text-sm font-bold">Número de Modos</label>
                    <input type="number" x-model="dynamicParams.numModes" class="w-20 bg-[#0c0c0c] border border-gray-600 rounded px-2 py-1 text-sm text-right focus:border-blue-500 outline-none">
                </div>

                <fieldset class="border border-gray-700 rounded p-3">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Tipo de Análisis</legend>
                    <div class="flex gap-8">
                        <label class="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" value="eigenvectors" x-model="dynamicParams.analysisType" class="accent-blue-500"> Autovectores (Eigenvectors)
                        </label>
                        <label class="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" value="ritz" x-model="dynamicParams.analysisType" class="accent-blue-500"> Vectores de Ritz
                        </label>
                    </div>
                </fieldset>

                <fieldset x-show="dynamicParams.analysisType === 'eigenvectors'" x-cloak class="border border-gray-700 rounded p-3 space-y-2">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Parámetros de Autovalores</legend>
                    <div class="flex justify-between items-center">
                        <span class="text-xs">Desplazamiento de Frecuencia (Centro)</span>
                        <input type="text" x-model="dynamicParams.freqShift" class="w-24 bg-[#0c0c0c] border border-gray-600 rounded px-2 py-0.5 text-xs text-right">
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs">Frecuencia de Corte (Radio)</span>
                        <input type="text" x-model="dynamicParams.cutoffFrequency" class="w-24 bg-[#0c0c0c] border border-gray-600 rounded px-2 py-0.5 text-xs text-right">
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs">Tolerancia Relativa</span>
                        <input type="text" x-model="dynamicParams.tolerance" class="w-24 bg-[#0c0c0c] border border-gray-600 rounded px-2 py-0.5 text-xs text-right">
                    </div>
                    <label class="flex items-center gap-2 text-[11px] mt-2 text-gray-400 cursor-pointer">
                        <input type="checkbox" x-model="dynamicParams.includeResidualModes" class="accent-blue-500"> Incluir Modos de Masa Residual
                    </label>
                </fieldset>

                <fieldset x-show="dynamicParams.analysisType === 'ritz'" x-cloak class="border border-gray-700 rounded p-3">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Vectores de Ritz Iniciales</legend>
                    <div class="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                        <div class="flex flex-col gap-1">
                            <span class="text-[10px] text-center text-gray-500 uppercase">Lista de Cargas</span>
                            <div class="bg-[#0c0c0c] border border-gray-700 h-32 rounded overflow-y-auto p-1">
                                <template x-for="(load, idx) in availableLoads" :key="idx">
                                    <div @click="selectedAvailableLoad = idx" class="text-xs px-2 py-1 cursor-pointer hover:bg-gray-700 rounded" :class="{'bg-blue-900': selectedAvailableLoad === idx}">
                                        <span x-text="load.name"></span>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <button @click="addToRitzVectors()" class="px-2 py-1 text-[10px] bg-gray-700 hover:bg-blue-600 border border-gray-600 rounded transition-colors">Añadir →</button>
                            <button @click="removeFromRitzVectors()" class="px-2 py-1 text-[10px] bg-gray-700 hover:bg-red-600 border border-gray-600 rounded transition-colors">← Quitar</button>
                        </div>

                        <div class="flex flex-col gap-1">
                            <span class="text-[10px] text-center text-gray-500 uppercase">Vectores de Carga Ritz</span>
                            <div class="bg-[#0c0c0c] border border-gray-700 h-32 rounded overflow-y-auto p-1">
                                <template x-for="(load, idx) in ritzLoads" :key="idx">
                                    <div @click="selectedRitzLoad = idx" class="text-xs px-2 py-1 cursor-pointer hover:bg-gray-700 rounded" :class="{'bg-blue-900': selectedRitzLoad === idx}">
                                        <span x-text="load.name"></span>
                                    </div>
                                </template>
                                <div x-show="ritzLoads.length === 0" class="text-xs text-gray-500 text-center py-4">
                                    No hay vectores de carga Ritz
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>

                <div class="flex justify-center gap-4 pt-2">
                    <button @click="saveDynamicParams()" class="px-8 py-1 text-sm bg-gray-800 hover:bg-blue-600 border border-gray-600 rounded transition-all">OK</button>
                    <button @click="showDynamicParamsDialog = false" class="px-8 py-1 text-sm bg-gray-800 hover:bg-red-900 border border-gray-600 rounded transition-all">Cancelar</button>
                </div>
            </div>
        </div>
    </div>

    {{-- Modal para Parámetros P-Delta --}}
    <div x-show="showPDeltaDialog" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showPDeltaDialog = false">
        <div class="bg-[#1e1e1e] text-gray-200 w-[500px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">
            {{-- Título del Modal --}}
            <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700 text-gray-400">
                <span>Parámetros P-Delta</span>
                <button @click="showPDeltaDialog = false" class="w-4 h-4 hover:bg-red-600 flex items-center justify-center rounded cursor-pointer text-[10px]">×</button>
            </div>

            <div class="p-4 flex flex-col gap-4">
                {{-- Método --}}
                <fieldset class="border border-gray-700 rounded p-3">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Método</legend>
                    <div class="flex flex-col gap-2">
                        <label class="flex items-center gap-2 text-sm cursor-pointer text-gray-400">
                            <input type="radio" value="nonIterative" x-model="pDeltaParams.method" class="accent-blue-500"> No iterativo - Basado en la Masa
                        </label>
                        <label class="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="radio" value="iterative" x-model="pDeltaParams.method" class="accent-blue-500"> Iterativo - Basado en Combinación de Cargas
                        </label>
                    </div>
                </fieldset>

                {{-- Controles de Iteración (visible solo para método iterativo) --}}
                <fieldset x-show="pDeltaParams.method === 'iterative'" x-cloak class="border border-gray-700 rounded p-3 space-y-2">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Controles de Iteración</legend>
                    <div class="flex justify-between items-center">
                        <span class="text-xs">Máximo de Iteraciones</span>
                        <input type="number" x-model="pDeltaParams.maxIterations" class="w-24 bg-[#0c0c0c] border border-gray-600 rounded px-2 py-0.5 text-xs text-right focus:border-blue-500 outline-none">
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs">Tolerancia Relativa - Desplazamientos</span>
                        <input type="text" x-model="pDeltaParams.tolerance" class="w-24 bg-[#0c0c0c] border border-gray-600 rounded px-2 py-0.5 text-xs text-right focus:border-blue-500 outline-none">
                    </div>
                </fieldset>

                {{-- Combinación de Carga P-Delta --}}
                <fieldset class="border border-gray-700 rounded p-3">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Combinación de Carga P-Delta</legend>
                    <div class="grid grid-cols-[1fr,80px] gap-2 items-start">
                        {{-- Tabla / Lista --}}
                        <div class="border border-gray-700 rounded overflow-hidden">
                            <div class="grid grid-cols-2 bg-[#2d2d2d] text-[10px] uppercase font-bold py-1 px-2 border-b border-gray-700 text-gray-400 text-center">
                                <span>Caso de Carga</span>
                                <span>Factor de Escala</span>
                            </div>
                            <div class="h-32 bg-[#0c0c0c] overflow-y-auto">
                                <template x-for="(load, idx) in pDeltaLoads" :key="idx">
                                    <div @click="selectedPDeltaLoad = idx"
                                        class="grid grid-cols-2 text-xs py-1 px-2 border-b border-gray-800 cursor-pointer"
                                        :class="{'bg-[#094771]': selectedPDeltaLoad === idx, 'hover:bg-gray-700': selectedPDeltaLoad !== idx}">
                                        <span x-text="load.name"></span>
                                        <span class="text-right" x-text="load.scale"></span>
                                    </div>
                                </template>
                                <div x-show="pDeltaLoads.length === 0" class="text-xs text-gray-500 text-center py-4">
                                    No hay cargas definidas
                                </div>
                            </div>
                        </div>

                        {{-- Botones Laterales --}}
                        <div class="flex flex-col gap-2">
                            <button @click="addPDeltaLoad()" class="w-full py-1 text-[11px] bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">Añadir</button>
                            <button @click="modifyPDeltaLoad()" class="w-full py-1 text-[11px] bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">Modificar</button>
                            <button @click="deletePDeltaLoad()" class="w-full py-1 text-[11px] bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-red-400">Borrar</button>
                        </div>
                    </div>
                </fieldset>

                {{-- Botones Inferiores --}}
                <div class="flex justify-center gap-4 pt-2">
                    <button @click="savePDeltaParams()" class="px-8 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors shadow-lg">OK</button>
                    <button @click="showPDeltaDialog = false" class="px-8 py-1 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded transition-colors">Cancelar</button>
                </div>
            </div>
        </div>
    </div>

    {{-- Modal para Añadir/Modificar Carga P-Delta --}}
    <div x-show="showPDeltaLoadDialog" x-cloak class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80" @click.away="showPDeltaLoadDialog = false">
        <div class="bg-[#1e1e1e] rounded-lg shadow-2xl w-96 border border-gray-700">
            <div class="bg-[#2d2d2d] px-3 py-1.5 text-xs flex justify-between items-center border-b border-gray-700">
                <span x-text="isNewPDeltaLoad ? 'Añadir Carga P-Delta' : 'Modificar Carga P-Delta'"></span>
                <button @click="showPDeltaLoadDialog = false" class="text-gray-400 hover:text-white">×</button>
            </div>
            <div class="p-4">
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-1">Caso de Carga</label>
                    <select x-model="pDeltaLoadForm.name" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        <option value="DEAD">DEAD</option>
                        <option value="LIVE">LIVE</option>
                        <option value="WIND_X">WIND_X</option>
                        <option value="WIND_Y">WIND_Y</option>
                        <option value="EQ_X">EQ_X</option>
                        <option value="EQ_Y">EQ_Y</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-1">Factor de Escala</label>
                    <input type="number" step="any" x-model="pDeltaLoadForm.scale" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
            </div>
            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-[#2d2d2d]">
                <button @click="showPDeltaLoadDialog = false" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Cancelar</button>
                <button @click="savePDeltaLoad()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
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

        input[type="number"],
        input[type="text"] {
            -moz-appearance: textfield;
        }
    </style>
</div>

<script>
    function analysisOptionsModal() {
        return {
            open: false,

            analysisType: 'full3d',

            dof: {
                ux: true,
                uy: true,
                uz: true,
                rx: true,
                ry: true,
                rz: true
            },

            dynamicAnalysis: {
                enabled: true
            },

            dynamicParams: {
                numModes: 12,
                analysisType: 'eigenvectors',
                freqShift: 0,
                cutoffFrequency: 0,
                tolerance: '1.000E-07',
                includeResidualModes: false,
                ritzLoads: []
            },

            pDelta: {
                enabled: false
            },

            pDeltaParams: {
                iterations: 10,
                tolerance: '1.000E-04',
                includeLargeDisplacements: false
            },

            dbAccess: {
                enabled: false,
                filename: 'analysis_output'
            },

            // Para diálogos de Ritz
            availableLoads: [{
                    name: 'DEAD',
                    type: 'Static'
                },
                {
                    name: 'LIVE',
                    type: 'Static'
                },
                {
                    name: 'WIND_X',
                    type: 'Wind'
                },
                {
                    name: 'WIND_Y',
                    type: 'Wind'
                },
                {
                    name: 'EQ_X',
                    type: 'Seismic'
                },
                {
                    name: 'EQ_Y',
                    type: 'Seismic'
                }
            ],
            ritzLoads: [],
            selectedAvailableLoad: null,
            selectedRitzLoad: null,

            showDynamicParamsDialog: false,
            showPDeltaDialog: false,

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            // Reemplazar las propiedades de pDeltaParams en el objeto retornado:

            pDeltaParams: {
                method: 'iterative', // 'nonIterative' o 'iterative'
                maxIterations: 1,
                tolerance: '1.000E-03'
            },

            // Lista de cargas para P-Delta
            pDeltaLoads: [{
                name: 'DEAD',
                scale: 1
            }],
            selectedPDeltaLoad: null,

            // Diálogo de añadir/modificar carga P-Delta
            showPDeltaLoadDialog: false,
            isNewPDeltaLoad: true,
            pDeltaLoadForm: {
                name: 'DEAD',
                scale: 1
            },

            // En las propiedades del objeto retornado:
            showPDeltaLoadDialog: false,
            isNewPDeltaLoad: true,
            pDeltaLoadForm: {
                name: 'DEAD',
                scale: 1
            },

            init() {
                this.loadOptions();
                window.addEventListener('open-analysis-options-modal', () => {
                    this.openModal();
                });
            },

            loadOptions() {
                if (window.cadSystem && window.cadSystem.analysisOptions) {
                    var opts = window.cadSystem.analysisOptions;
                    this.analysisType = opts.analysisType || 'full3d';
                    this.dof = opts.dof || {
                        ux: true,
                        uy: true,
                        uz: true,
                        rx: true,
                        ry: true,
                        rz: true
                    };
                    this.dynamicAnalysis = opts.dynamicAnalysis || {
                        enabled: true
                    };
                    if (opts.dynamicParams) {
                        this.dynamicParams = opts.dynamicParams;
                        this.ritzLoads = opts.dynamicParams.ritzLoads || [];
                    }
                    this.pDelta = opts.pDelta || {
                        enabled: false
                    };
                    this.pDeltaParams = opts.pDeltaParams || {
                        iterations: 10,
                        tolerance: '1.000E-04',
                        includeLargeDisplacements: false
                    };
                    this.dbAccess = opts.dbAccess || {
                        enabled: false,
                        filename: 'analysis_output'
                    };
                }

                if (window.cadSystem && window.cadSystem.loadCases && window.cadSystem.loadCases.cases) {
                    this.availableLoads = window.cadSystem.loadCases.cases.map(function(c) {
                        return {
                            name: c.name,
                            type: c.type
                        };
                    });
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
                this.loadOptions();
                this.open = true;
            },

            close() {
                this.open = false;
            },

            selectAnalysisType(type) {
                this.analysisType = type;
                switch (type) {
                    case 'full3d':
                        this.dof = {
                            ux: true,
                            uy: true,
                            uz: true,
                            rx: true,
                            ry: true,
                            rz: true
                        };
                        break;
                    case 'xz':
                        this.dof = {
                            ux: true,
                            uy: false,
                            uz: true,
                            rx: false,
                            ry: true,
                            rz: false
                        };
                        break;
                    case 'yz':
                        this.dof = {
                            ux: false,
                            uy: true,
                            uz: true,
                            rx: true,
                            ry: false,
                            rz: false
                        };
                        break;
                    case 'noRz':
                        this.dof = {
                            ux: true,
                            uy: true,
                            uz: true,
                            rx: true,
                            ry: true,
                            rz: false
                        };
                        break;
                }
            },

            openDynamicParamsDialog() {
                if (this.dynamicAnalysis.enabled) {
                    this.ritzLoads = this.dynamicParams.ritzLoads ? [...this.dynamicParams.ritzLoads] : [];
                    this.selectedAvailableLoad = null;
                    this.selectedRitzLoad = null;
                    this.showDynamicParamsDialog = true;
                }
            },

            addToRitzVectors() {
                if (this.selectedAvailableLoad !== null && this.selectedAvailableLoad < this.availableLoads.length) {
                    var loadToAdd = this.availableLoads[this.selectedAvailableLoad];
                    var exists = false;
                    for (var i = 0; i < this.ritzLoads.length; i++) {
                        if (this.ritzLoads[i].name === loadToAdd.name) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) {
                        this.ritzLoads.push({
                            name: loadToAdd.name,
                            type: loadToAdd.type
                        });
                    }
                    this.selectedAvailableLoad = null;
                }
            },

            removeFromRitzVectors() {
                if (this.selectedRitzLoad !== null && this.selectedRitzLoad < this.ritzLoads.length) {
                    this.ritzLoads.splice(this.selectedRitzLoad, 1);
                    this.selectedRitzLoad = null;
                }
            },

            saveDynamicParams() {
                this.dynamicParams.ritzLoads = [...this.ritzLoads];
                if (window.cadSystem) {
                    window.cadSystem.dynamicParams = {
                        numModes: this.dynamicParams.numModes,
                        analysisType: this.dynamicParams.analysisType,
                        freqShift: this.dynamicParams.freqShift,
                        cutoffFrequency: this.dynamicParams.cutoffFrequency,
                        tolerance: this.dynamicParams.tolerance,
                        includeResidualModes: this.dynamicParams.includeResidualModes,
                        ritzLoads: this.dynamicParams.ritzLoads
                    };
                }
                this.showDynamicParamsDialog = false;
                this.showToastMessage('Parámetros dinámicos guardados', 'success');
            },

            openPDeltaDialog() {
                if (this.pDelta.enabled) {
                    this.showPDeltaDialog = true;
                }
            },

            savePDeltaParams() {
                this.showPDeltaDialog = false;
                this.showToastMessage('Parámetros P-Delta guardados', 'success');
            },

            openDbAccessDialog() {
                if (this.dbAccess.enabled) {
                    Swal.fire({
                        title: 'Nombre del Archivo DB Access',
                        input: 'text',
                        inputValue: this.dbAccess.filename,
                        inputPlaceholder: 'nombre_del_archivo',
                        showCancelButton: true,
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancelar',
                        background: '#1e1e1e',
                        color: '#e5e7eb'
                    }).then((result) => {
                        if (result.isConfirmed && result.value) {
                            this.dbAccess.filename = result.value;
                            this.showToastMessage('Nombre de archivo guardado', 'success');
                        }
                    });
                }
            },

            saveOptions() {
                var optionsToSave = {
                    analysisType: this.analysisType,
                    dof: this.dof,
                    dynamicAnalysis: this.dynamicAnalysis,
                    dynamicParams: this.dynamicParams,
                    pDelta: this.pDelta,
                    pDeltaParams: this.pDeltaParams,
                    dbAccess: this.dbAccess
                };

                if (window.cadSystem) {
                    window.cadSystem.analysisOptions = optionsToSave;
                    this.showToastMessage('Opciones de análisis guardadas', 'success');
                }
                this.close();
            },

            // Métodos para P-Delta Loads

            addPDeltaLoad() {
                this.isNewPDeltaLoad = true;
                this.pDeltaLoadForm = {
                    name: 'DEAD',
                    scale: 1
                };
                this.openPDeltaLoadDialog();
            },

            modifyPDeltaLoad() {
                if (this.selectedPDeltaLoad !== null && this.selectedPDeltaLoad < this.pDeltaLoads.length) {
                    this.isNewPDeltaLoad = false;
                    this.pDeltaLoadForm = {
                        ...this.pDeltaLoads[this.selectedPDeltaLoad]
                    };
                    this.openPDeltaLoadDialog();
                } else {
                    this.showToastMessage('Seleccione una carga para modificar', 'warning');
                }
            },

            deletePDeltaLoad() {
                if (this.selectedPDeltaLoad !== null && this.selectedPDeltaLoad < this.pDeltaLoads.length) {
                    this.pDeltaLoads.splice(this.selectedPDeltaLoad, 1);
                    this.selectedPDeltaLoad = null;
                    this.showToastMessage('Carga eliminada', 'success');
                } else {
                    this.showToastMessage('Seleccione una carga para eliminar', 'warning');
                }
            },

            openPDeltaLoadDialog() {
                this.showPDeltaLoadDialog = true;
            },

            savePDeltaLoad() {
                if (!this.pDeltaLoadForm.name) {
                    this.showToastMessage('El nombre de la carga es requerido', 'error');
                    return;
                }

                if (this.isNewPDeltaLoad) {
                    // Verificar si ya existe
                    var exists = false;
                    for (var i = 0; i < this.pDeltaLoads.length; i++) {
                        if (this.pDeltaLoads[i].name === this.pDeltaLoadForm.name) {
                            exists = true;
                            break;
                        }
                    }
                    if (exists) {
                        this.showToastMessage('La carga ya existe', 'error');
                        return;
                    }
                    this.pDeltaLoads.push({
                        ...this.pDeltaLoadForm
                    });
                    this.showToastMessage('Carga agregada', 'success');
                } else if (this.selectedPDeltaLoad !== null) {
                    this.pDeltaLoads[this.selectedPDeltaLoad] = {
                        ...this.pDeltaLoadForm
                    };
                    this.showToastMessage('Carga modificada', 'success');
                }

                this.showPDeltaLoadDialog = false;
            },

            // Actualizar el método savePDeltaParams
            savePDeltaParams() {
                this.pDeltaParams.loads = [...this.pDeltaLoads];
                if (window.cadSystem) {
                    window.cadSystem.pDeltaParams = {
                        method: this.pDeltaParams.method,
                        maxIterations: this.pDeltaParams.maxIterations,
                        tolerance: this.pDeltaParams.tolerance,
                        loads: this.pDeltaParams.loads
                    };
                }
                this.showPDeltaDialog = false;
                this.showToastMessage('Parámetros P-Delta guardados', 'success');
            },

            // Actualizar loadOptions para cargar los parámetros P-Delta
            loadOptions() {
                if (window.cadSystem && window.cadSystem.analysisOptions) {
                    var opts = window.cadSystem.analysisOptions;
                    this.analysisType = opts.analysisType || 'full3d';
                    this.dof = opts.dof || {
                        ux: true,
                        uy: true,
                        uz: true,
                        rx: true,
                        ry: true,
                        rz: true
                    };
                    this.dynamicAnalysis = opts.dynamicAnalysis || {
                        enabled: true
                    };
                    if (opts.dynamicParams) {
                        this.dynamicParams = opts.dynamicParams;
                        this.ritzLoads = opts.dynamicParams.ritzLoads || [];
                    }
                    this.pDelta = opts.pDelta || {
                        enabled: false
                    };
                    if (opts.pDeltaParams) {
                        this.pDeltaParams = opts.pDeltaParams;
                        this.pDeltaLoads = opts.pDeltaParams.loads || [{
                            name: 'DEAD',
                            scale: 1
                        }];
                    }
                    this.dbAccess = opts.dbAccess || {
                        enabled: false,
                        filename: 'analysis_output'
                    };
                }

                if (window.cadSystem && window.cadSystem.loadCases && window.cadSystem.loadCases.cases) {
                    this.availableLoads = window.cadSystem.loadCases.cases.map(function(c) {
                        return {
                            name: c.name,
                            type: c.type
                        };
                    });
                }
            },
        }
    }
</script>