
<div x-data="analysisOptionsModal()"
    x-init="init()"
    x-show="open"
    x-cloak
    style="display: none;"
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
    @keydown.escape.window="close()">

    
    <div class="bg-[#1e1e1e] text-gray-200 w-[680px] max-w-[95vw] rounded-lg border border-gray-700 shadow-2xl overflow-hidden font-sans">

        
        <div class="bg-[#2d2d2d] px-3 py-2 text-xs flex justify-between items-center border-b border-gray-700">
            <div class="flex items-center gap-2">
                <span>⚙️</span>
                <span class="text-gray-300 font-semibold">Set Analysis Options</span>
            </div>

            <button @click="close()"
                class="w-5 h-5 hover:bg-red-600 flex items-center justify-center rounded text-gray-400 hover:text-white text-xs">
                ×
            </button>
        </div>

        
        <div class="p-4 space-y-4 max-h-[72vh] overflow-y-auto">

            
            <fieldset class="border border-gray-700 rounded-md p-4">
                <legend class="text-xs text-gray-400 px-2 ml-2">
                    Active Degrees of Freedom
                </legend>

                <div class="grid grid-cols-4 gap-3 mb-4">
                    <button type="button"
                        @click="selectAnalysisType('full3d')"
                        class="flex flex-col items-center gap-2 p-2 rounded transition-colors border"
                        :class="analysisType === 'full3d' ? 'bg-[#094771] border-blue-400' : 'bg-[#2d2d2d] border-gray-600 hover:bg-gray-700'">
                        <div class="text-[10px] uppercase font-bold"
                            :class="analysisType === 'full3d' ? 'text-white' : 'text-gray-400'">
                            Full 3D
                        </div>
                        <div class="h-12 w-full bg-gray-300/20 rounded flex items-center justify-center text-2xl">
                            🧊
                        </div>
                    </button>

                    <button type="button"
                        @click="selectAnalysisType('xz')"
                        class="flex flex-col items-center gap-2 p-2 rounded transition-colors border"
                        :class="analysisType === 'xz' ? 'bg-[#094771] border-blue-400' : 'bg-[#2d2d2d] border-gray-600 hover:bg-gray-700'">
                        <div class="text-[10px] uppercase font-bold"
                            :class="analysisType === 'xz' ? 'text-white' : 'text-gray-400'">
                            XZ Plane
                        </div>
                        <div class="h-12 w-full bg-gray-300/20 rounded flex items-center justify-center text-2xl">
                            📐
                        </div>
                    </button>

                    <button type="button"
                        @click="selectAnalysisType('yz')"
                        class="flex flex-col items-center gap-2 p-2 rounded transition-colors border"
                        :class="analysisType === 'yz' ? 'bg-[#094771] border-blue-400' : 'bg-[#2d2d2d] border-gray-600 hover:bg-gray-700'">
                        <div class="text-[10px] uppercase font-bold"
                            :class="analysisType === 'yz' ? 'text-white' : 'text-gray-400'">
                            YZ Plane
                        </div>
                        <div class="h-12 w-full bg-gray-300/20 rounded flex items-center justify-center text-2xl">
                            📏
                        </div>
                    </button>

                    <button type="button"
                        @click="selectAnalysisType('xy')"
                        class="flex flex-col items-center gap-2 p-2 rounded transition-colors border"
                        :class="analysisType === 'xy' ? 'bg-[#094771] border-blue-400' : 'bg-[#2d2d2d] border-gray-600 hover:bg-gray-700'">
                        <div class="text-[10px] uppercase font-bold"
                            :class="analysisType === 'xy' ? 'text-white' : 'text-gray-400'">
                            XY Plane
                        </div>
                        <div class="h-12 w-full bg-gray-300/20 rounded flex items-center justify-center text-2xl">
                            🗺️
                        </div>
                    </button>
                </div>

                <div class="grid grid-cols-6 gap-2 text-xs">
                    <label class="flex items-center justify-center gap-1 bg-gray-800 border border-gray-700 rounded px-2 py-2">
                        <input type="checkbox" x-model="dof.ux" class="accent-blue-500">
                        UX
                    </label>

                    <label class="flex items-center justify-center gap-1 bg-gray-800 border border-gray-700 rounded px-2 py-2">
                        <input type="checkbox" x-model="dof.uy" class="accent-blue-500">
                        UY
                    </label>

                    <label class="flex items-center justify-center gap-1 bg-gray-800 border border-gray-700 rounded px-2 py-2">
                        <input type="checkbox" x-model="dof.uz" class="accent-blue-500">
                        UZ
                    </label>

                    <label class="flex items-center justify-center gap-1 bg-gray-800 border border-gray-700 rounded px-2 py-2">
                        <input type="checkbox" x-model="dof.rx" class="accent-blue-500">
                        RX
                    </label>

                    <label class="flex items-center justify-center gap-1 bg-gray-800 border border-gray-700 rounded px-2 py-2">
                        <input type="checkbox" x-model="dof.ry" class="accent-blue-500">
                        RY
                    </label>

                    <label class="flex items-center justify-center gap-1 bg-gray-800 border border-gray-700 rounded px-2 py-2">
                        <input type="checkbox" x-model="dof.rz" class="accent-blue-500">
                        RZ
                    </label>
                </div>
            </fieldset>

            
            <fieldset class="border border-gray-700 rounded-md p-4">
                <legend class="text-xs text-gray-400 px-2 ml-2">
                    Solver Options
                </legend>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Solver Type</label>
                        <select x-model="solverType"
                            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                            <option value="linear_static">Linear Static</option>
                            <option value="modal">Modal</option>
                            <option value="linear_static_modal">Linear Static + Modal</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Analysis Status</label>
                        <div class="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-yellow-400">
                            <span x-text="analysisStatusLabel()"></span>
                        </div>
                    </div>
                </div>

                <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <label class="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded px-3 py-2">
                        <input type="checkbox" x-model="runStaticAnalysis" class="accent-blue-500">
                        Run Static Analysis
                    </label>

                    <label class="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded px-3 py-2">
                        <input type="checkbox" x-model="considerSelfWeight" class="accent-blue-500">
                        Include Self Weight
                    </label>
                </div>
            </fieldset>

            
            <fieldset class="border border-gray-700 rounded-md p-4">
                <legend class="text-xs text-gray-400 px-2 ml-2">
                    Dynamic Analysis
                </legend>

                <div class="flex items-center justify-between gap-4">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" x-model="dynamicAnalysis.enabled" class="accent-blue-500">
                        Dynamic Analysis Enabled
                    </label>

                    <button type="button"
                        @click="openDynamicParamsDialog()"
                        :disabled="!dynamicAnalysis.enabled"
                        class="px-3 py-1.5 text-xs rounded border transition"
                        :class="dynamicAnalysis.enabled ? 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'">
                        Set Dynamic Parameters...
                    </button>
                </div>

                <div class="mt-3 text-xs text-gray-500">
                    Modes:
                    <span class="text-gray-300" x-text="dynamicParams.numModes"></span>
                    |
                    Type:
                    <span class="text-gray-300" x-text="dynamicParams.analysisType"></span>
                    |
                    Ritz Loads:
                    <span class="text-gray-300" x-text="dynamicParams.ritzLoads.length"></span>
                </div>
            </fieldset>

            
            <fieldset class="border border-gray-700 rounded-md p-4">
                <legend class="text-xs text-gray-400 px-2 ml-2">
                    P-Delta Analysis
                </legend>

                <div class="flex items-center justify-between gap-4">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" x-model="pDelta.enabled" class="accent-blue-500">
                        P-Delta Analysis Enabled
                    </label>

                    <button type="button"
                        @click="openPDeltaDialog()"
                        :disabled="!pDelta.enabled"
                        class="px-3 py-1.5 text-xs rounded border transition"
                        :class="pDelta.enabled ? 'bg-blue-600 hover:bg-blue-500 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'">
                        Set P-Delta Parameters...
                    </button>
                </div>

                <div class="mt-3 text-xs text-gray-500">
                    Method:
                    <span class="text-gray-300" x-text="pDeltaParams.method"></span>
                    |
                    Max Iterations:
                    <span class="text-gray-300" x-text="pDeltaParams.maxIterations"></span>
                    |
                    Loads:
                    <span class="text-gray-300" x-text="pDeltaLoads.length"></span>
                </div>
            </fieldset>

            
            <fieldset class="border border-gray-700 rounded-md p-4">
                <legend class="text-xs text-gray-400 px-2 ml-2">
                    Analysis Output
                </legend>

                <label class="flex items-center gap-2 text-sm mb-3">
                    <input type="checkbox" x-model="dbAccess.enabled" class="accent-blue-500">
                    Save Analysis Output Database
                </label>

                <div>
                    <label class="block text-xs text-gray-400 mb-1">Output Filename</label>
                    <input type="text"
                        x-model="dbAccess.filename"
                        :disabled="!dbAccess.enabled"
                        class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white disabled:text-gray-500 disabled:bg-gray-900"
                        placeholder="analysis_output">
                </div>
            </fieldset>

        </div>

        
        <div class="flex justify-between items-center gap-2 px-4 py-3 border-t border-gray-700 bg-[#2d2d2d]">
            <div class="text-[11px] text-gray-500">
                These options prepare the model for Check Model and Run Analysis.
            </div>

            <div class="flex gap-2">
                <button @click="close()"
                    class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                    Cancel
                </button>

                <button @click="saveOptions()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">
                    OK
                </button>
            </div>
        </div>
    </div>

    
    <div x-show="showDynamicParamsDialog"
        x-cloak
        style="display: none;"
        class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80">

        <div class="bg-[#1e1e1e] text-gray-200 w-[720px] max-w-[95vw] rounded-lg border border-gray-700 shadow-2xl overflow-hidden">
            <div class="bg-[#2d2d2d] px-3 py-2 text-xs flex justify-between items-center border-b border-gray-700">
                <div class="flex items-center gap-2">
                    <span>📊</span>
                    <span class="text-gray-300 font-semibold">Dynamic Analysis Parameters</span>
                </div>

                <button @click="showDynamicParamsDialog = false"
                    class="w-5 h-5 hover:bg-red-600 flex items-center justify-center rounded text-gray-400 hover:text-white text-xs">
                    ×
                </button>
            </div>

            <div class="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Number of Modes</label>
                        <input type="number" min="1" step="1" x-model.number="dynamicParams.numModes"
                            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                    </div>

                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Modal Analysis Type</label>
                        <select x-model="dynamicParams.analysisType"
                            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                            <option value="eigenvectors">Eigenvectors</option>
                            <option value="ritz">Ritz Vectors</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Frequency Shift</label>
                        <input type="number" step="0.001" x-model.number="dynamicParams.freqShift"
                            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                    </div>

                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Cutoff Frequency</label>
                        <input type="number" step="0.001" x-model.number="dynamicParams.cutoffFrequency"
                            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                    </div>

                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Tolerance</label>
                        <input type="text" x-model="dynamicParams.tolerance"
                            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                    </div>

                    <div class="flex items-end">
                        <label class="flex items-center gap-2 text-sm bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full">
                            <input type="checkbox" x-model="dynamicParams.includeResidualModes" class="accent-blue-500">
                            Include Residual Modes
                        </label>
                    </div>
                </div>

                
                <div x-show="dynamicParams.analysisType === 'ritz'" class="border border-gray-700 rounded p-3">
                    <div class="text-xs text-gray-400 mb-3">
                        Ritz Starting Load Vectors
                    </div>

                    <div class="grid grid-cols-[1fr_90px_1fr] gap-3 items-start">
                        <div>
                            <div class="text-[11px] text-gray-500 mb-1">Available Loads</div>
                            <div class="border border-gray-700 rounded max-h-48 overflow-y-auto bg-gray-900">
                                <template x-for="(load, index) in availableLoads" :key="load.name + '_' + index">
                                    <button type="button"
                                        @click="selectedAvailableLoad = index"
                                        class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-700 border-b border-gray-800"
                                        :class="selectedAvailableLoad === index ? 'bg-blue-700 text-white' : 'text-gray-300'">
                                        <span x-text="getLoadLabel(load)"></span>
                                    </button>
                                </template>

                                <div x-show="availableLoads.length === 0" class="px-3 py-3 text-xs text-gray-500">
                                    No load cases available.
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2 pt-7">
                            <button type="button"
                                @click="addToRitzVectors()"
                                class="px-2 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs">
                                Add →
                            </button>

                            <button type="button"
                                @click="removeFromRitzVectors()"
                                class="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                                ← Remove
                            </button>
                        </div>

                        <div>
                            <div class="text-[11px] text-gray-500 mb-1">Ritz Loads</div>
                            <div class="border border-gray-700 rounded max-h-48 overflow-y-auto bg-gray-900">
                                <template x-for="(load, index) in ritzLoads" :key="load.name + '_' + index">
                                    <button type="button"
                                        @click="selectedRitzLoad = index"
                                        class="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-700 border-b border-gray-800"
                                        :class="selectedRitzLoad === index ? 'bg-blue-700 text-white' : 'text-gray-300'">
                                        <span x-text="getLoadLabel(load)"></span>
                                    </button>
                                </template>

                                <div x-show="ritzLoads.length === 0" class="px-3 py-3 text-xs text-gray-500">
                                    No Ritz loads selected.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-[#2d2d2d]">
                <button @click="showDynamicParamsDialog = false"
                    class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                    Cancel
                </button>

                <button @click="saveDynamicParams()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">
                    OK
                </button>
            </div>
        </div>
    </div>

    
    <div x-show="showPDeltaDialog"
        x-cloak
        style="display: none;"
        class="fixed inset-0 z-[300] flex items-center justify-center bg-black/80">

        <div class="bg-[#1e1e1e] text-gray-200 w-[650px] max-w-[95vw] rounded-lg border border-gray-700 shadow-2xl overflow-hidden">
            <div class="bg-[#2d2d2d] px-3 py-2 text-xs flex justify-between items-center border-b border-gray-700">
                <div class="flex items-center gap-2">
                    <span>🧮</span>
                    <span class="text-gray-300 font-semibold">P-Delta Parameters</span>
                </div>

                <button @click="showPDeltaDialog = false"
                    class="w-5 h-5 hover:bg-red-600 flex items-center justify-center rounded text-gray-400 hover:text-white text-xs">
                    ×
                </button>
            </div>

            <div class="p-4 space-y-4">
                <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Method</label>
                        <select x-model="pDeltaParams.method"
                            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                            <option value="iterative">Iterative Based on Loads</option>
                            <option value="nonIterative">Non-Iterative</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Max Iterations</label>
                        <input type="number" min="1" step="1" x-model.number="pDeltaParams.maxIterations"
                            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                    </div>

                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Tolerance</label>
                        <input type="text" x-model="pDeltaParams.tolerance"
                            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                    </div>
                </div>

                <div class="border border-gray-700 rounded overflow-hidden">
                    <div class="bg-gray-800 px-3 py-2 flex justify-between items-center">
                        <div class="text-xs text-gray-300 font-semibold">P-Delta Load Cases</div>

                        <div class="flex gap-2">
                            <button type="button" @click="openPDeltaLoadDialog(true)"
                                class="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs">
                                Add
                            </button>

                            <button type="button" @click="openPDeltaLoadDialog(false)"
                                class="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                                Modify
                            </button>

                            <button type="button" @click="removePDeltaLoad()"
                                class="px-2 py-1 bg-red-700 hover:bg-red-600 rounded text-xs">
                                Delete
                            </button>
                        </div>
                    </div>

                    <div class="max-h-52 overflow-y-auto">
                        <table class="w-full text-xs">
                            <thead class="bg-gray-900 text-gray-400">
                                <tr>
                                    <th class="text-left px-3 py-2 border-b border-gray-700">Load Case</th>
                                    <th class="text-left px-3 py-2 border-b border-gray-700">Scale Factor</th>
                                </tr>
                            </thead>

                            <tbody>
                                <template x-for="(load, index) in pDeltaLoads" :key="load.name + '_' + index">
                                    <tr @click="selectedPDeltaLoad = index"
                                        class="cursor-pointer hover:bg-gray-700"
                                        :class="selectedPDeltaLoad === index ? 'bg-blue-800/70' : 'bg-[#1e1e1e]'">
                                        <td class="px-3 py-2 border-b border-gray-800" x-text="load.name"></td>
                                        <td class="px-3 py-2 border-b border-gray-800" x-text="load.scale"></td>
                                    </tr>
                                </template>

                                <tr x-show="pDeltaLoads.length === 0">
                                    <td colspan="2" class="px-3 py-4 text-gray-500 text-center">
                                        No P-Delta loads defined.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-[#2d2d2d]">
                <button @click="showPDeltaDialog = false"
                    class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                    Cancel
                </button>

                <button @click="savePDeltaParams()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">
                    OK
                </button>
            </div>
        </div>
    </div>

    
    <div x-show="showPDeltaLoadDialog"
        x-cloak
        style="display: none;"
        class="fixed inset-0 z-[400] flex items-center justify-center bg-black/80">

        <div class="bg-[#1e1e1e] text-gray-200 w-[420px] rounded-lg border border-gray-700 shadow-2xl overflow-hidden">
            <div class="bg-[#2d2d2d] px-3 py-2 text-xs flex justify-between items-center border-b border-gray-700">
                <span x-text="isNewPDeltaLoad ? 'Add P-Delta Load' : 'Modify P-Delta Load'"></span>

                <button @click="showPDeltaLoadDialog = false"
                    class="w-5 h-5 hover:bg-red-600 flex items-center justify-center rounded text-gray-400 hover:text-white text-xs">
                    ×
                </button>
            </div>

            <div class="p-4 space-y-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Load Case</label>
                    <select x-model="pDeltaLoadForm.name"
                        class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                        <template x-for="load in availableLoads" :key="load.name">
                            <option :value="load.name" x-text="getLoadLabel(load)"></option>
                        </template>
                    </select>
                </div>

                <div>
                    <label class="block text-xs text-gray-400 mb-1">Scale Factor</label>
                    <input type="number" step="0.001" x-model.number="pDeltaLoadForm.scale"
                        class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white">
                </div>
            </div>

            <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-[#2d2d2d]">
                <button @click="showPDeltaLoadDialog = false"
                    class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                    Cancel
                </button>

                <button @click="savePDeltaLoad()"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">
                    OK
                </button>
            </div>
        </div>
    </div>

    
    <div x-show="showToast"
        x-cloak
        style="display: none;"
        class="fixed bottom-5 right-5 z-[500]"
        x-transition.duration.300ms>

        <div class="px-4 py-3 rounded-lg shadow-lg text-white text-sm"
            :class="toastType === 'error' ? 'bg-red-600' : (toastType === 'warning' ? 'bg-yellow-600' : 'bg-green-600')">
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
            solverType: 'linear_static',
            runStaticAnalysis: true,
            considerSelfWeight: true,
            analysisStatus: 'not_run',

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
                method: 'iterative',
                maxIterations: 1,
                tolerance: '1.000E-03',
                loads: [{
                    name: 'DEAD',
                    scale: 1
                }]
            },

            pDeltaLoads: [{
                name: 'DEAD',
                scale: 1
            }],

            dbAccess: {
                enabled: false,
                filename: 'analysis_output'
            },

            availableLoads: [{
                    name: 'DEAD',
                    type: 'Static'
                },
                {
                    name: 'LIVE',
                    type: 'Static'
                }
            ],

            ritzLoads: [],
            selectedAvailableLoad: null,
            selectedRitzLoad: null,

            showDynamicParamsDialog: false,
            showPDeltaDialog: false,
            showPDeltaLoadDialog: false,

            selectedPDeltaLoad: null,
            isNewPDeltaLoad: true,

            pDeltaLoadForm: {
                name: 'DEAD',
                scale: 1
            },

            showToast: false,
            toastMessage: '',
            toastType: 'success',
            toastTimeout: null,

            init() {
                this.loadOptions();

                window.addEventListener('open-analysis-options-modal', () => {
                    this.openModal();
                });
            },

            clone(data) {
                return JSON.parse(JSON.stringify(data ?? null));
            },

            getDefaultDof() {
                return {
                    ux: true,
                    uy: true,
                    uz: true,
                    rx: true,
                    ry: true,
                    rz: true
                };
            },

            getDefaultAnalysisOptions() {
                return {
                    enabled: true,
                    analysisType: 'full3d',
                    solverType: 'linear_static',
                    runStaticAnalysis: true,
                    considerSelfWeight: true,
                    analysisStatus: 'not_run',
                    dof: this.getDefaultDof(),
                    dynamicAnalysis: {
                        enabled: true
                    },
                    dynamicParams: this.clone(this.dynamicParams),
                    pDelta: {
                        enabled: false
                    },
                    pDeltaParams: this.clone(this.pDeltaParams),
                    dbAccess: {
                        enabled: false,
                        filename: 'analysis_output'
                    }
                };
            },

            normalizeLoad(load, index = 0) {
                const name =
                    load?.name ||
                    load?.id ||
                    load?.caseName ||
                    load?.load ||
                    `LOAD_${index + 1}`;

                const type =
                    load?.type ||
                    load?.loadType ||
                    load?.category ||
                    'Static';

                return {
                    name: String(name),
                    type: String(type)
                };
            },

            loadAvailableLoadsFromCad() {
                const cad = window.cadSystem;
                let loads = [];

                if (Array.isArray(cad?.loadCases?.cases) && cad.loadCases.cases.length > 0) {
                    loads = cad.loadCases.cases;
                } else if (Array.isArray(cad?.staticLoadCases?.items) && cad.staticLoadCases.items.length > 0) {
                    loads = cad.staticLoadCases.items;
                } else if (Array.isArray(cad?.availableLoads) && cad.availableLoads.length > 0) {
                    loads = cad.availableLoads;
                }

                if (!loads.length) {
                    loads = [{
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
                    ];
                }

                this.availableLoads = loads.map((load, index) => this.normalizeLoad(load, index));
            },

            loadOptions() {
                this.loadAvailableLoadsFromCad();

                const cad = window.cadSystem;
                const defaults = this.getDefaultAnalysisOptions();
                const opts = cad?.analysisOptions || {};

                this.analysisType = opts.analysisType || defaults.analysisType;
                this.solverType = opts.solverType || defaults.solverType;
                this.runStaticAnalysis = opts.runStaticAnalysis ?? defaults.runStaticAnalysis;
                this.considerSelfWeight = opts.considerSelfWeight ?? defaults.considerSelfWeight;
                this.analysisStatus = opts.analysisStatus || defaults.analysisStatus;

                this.dof = {
                    ...defaults.dof,
                    ...(opts.dof || {})
                };

                this.dynamicAnalysis = {
                    ...defaults.dynamicAnalysis,
                    ...(opts.dynamicAnalysis || {})
                };

                const cadDynamicParams = cad?.dynamicParams || {};
                this.dynamicParams = {
                    ...defaults.dynamicParams,
                    ...cadDynamicParams,
                    ...(opts.dynamicParams || {})
                };

                this.dynamicParams.ritzLoads = Array.isArray(this.dynamicParams.ritzLoads) ?
                    this.clone(this.dynamicParams.ritzLoads) : [];

                this.ritzLoads = this.clone(this.dynamicParams.ritzLoads);

                this.pDelta = {
                    ...defaults.pDelta,
                    ...(opts.pDelta || {})
                };

                const cadPDeltaParams = cad?.pDeltaParams || {};
                this.pDeltaParams = {
                    ...defaults.pDeltaParams,
                    ...cadPDeltaParams,
                    ...(opts.pDeltaParams || {})
                };

                this.pDeltaLoads = Array.isArray(this.pDeltaParams.loads) && this.pDeltaParams.loads.length > 0 ?
                    this.clone(this.pDeltaParams.loads) : [{
                        name: this.availableLoads[0]?.name || 'DEAD',
                        scale: 1
                    }];

                this.pDeltaParams.loads = this.clone(this.pDeltaLoads);

                this.dbAccess = {
                    ...defaults.dbAccess,
                    ...(opts.dbAccess || {})
                };

                if (!this.pDeltaLoadForm.name) {
                    this.pDeltaLoadForm.name = this.availableLoads[0]?.name || 'DEAD';
                }
            },

            openModal() {
                this.loadOptions();
                this.open = true;
            },

            close() {
                this.open = false;
                this.showDynamicParamsDialog = false;
                this.showPDeltaDialog = false;
                this.showPDeltaLoadDialog = false;
            },

            analysisStatusLabel() {
                if (this.analysisStatus === 'completed') return 'Completed';
                if (this.analysisStatus === 'running') return 'Running';
                if (this.analysisStatus === 'failed') return 'Failed';
                return 'Not Run';
            },

            selectAnalysisType(type) {
                this.analysisType = type;

                if (type === 'full3d') {
                    this.dof = {
                        ux: true,
                        uy: true,
                        uz: true,
                        rx: true,
                        ry: true,
                        rz: true
                    };
                }

                if (type === 'xz') {
                    this.dof = {
                        ux: true,
                        uy: false,
                        uz: true,
                        rx: false,
                        ry: true,
                        rz: false
                    };
                }

                if (type === 'yz') {
                    this.dof = {
                        ux: false,
                        uy: true,
                        uz: true,
                        rx: true,
                        ry: false,
                        rz: false
                    };
                }

                if (type === 'xy') {
                    this.dof = {
                        ux: true,
                        uy: true,
                        uz: false,
                        rx: false,
                        ry: false,
                        rz: true
                    };
                }
            },

            getLoadLabel(load) {
                return `${load.name} (${load.type || 'Static'})`;
            },

            openDynamicParamsDialog() {
                if (!this.dynamicAnalysis.enabled) {
                    this.showToastMessage('Dynamic Analysis está desactivado.', 'warning');
                    return;
                }

                this.ritzLoads = this.clone(this.dynamicParams.ritzLoads || []);
                this.selectedAvailableLoad = null;
                this.selectedRitzLoad = null;
                this.showDynamicParamsDialog = true;
            },

            addToRitzVectors() {
                if (this.selectedAvailableLoad === null) {
                    this.showToastMessage('Seleccione una carga disponible.', 'warning');
                    return;
                }

                const loadToAdd = this.availableLoads[this.selectedAvailableLoad];

                const exists = this.ritzLoads.some((load) => {
                    return String(load.name) === String(loadToAdd.name);
                });

                if (exists) {
                    this.showToastMessage('La carga ya está en Ritz Loads.', 'warning');
                    return;
                }

                this.ritzLoads.push(this.clone(loadToAdd));
                this.selectedAvailableLoad = null;
            },

            removeFromRitzVectors() {
                if (this.selectedRitzLoad === null) {
                    this.showToastMessage('Seleccione una carga Ritz.', 'warning');
                    return;
                }

                this.ritzLoads.splice(this.selectedRitzLoad, 1);
                this.selectedRitzLoad = null;
            },

            saveDynamicParams() {
                if (!Number.isFinite(Number(this.dynamicParams.numModes)) || Number(this.dynamicParams.numModes) < 1) {
                    this.showToastMessage('Number of Modes debe ser mayor o igual a 1.', 'error');
                    return;
                }

                this.dynamicParams.numModes = Number(this.dynamicParams.numModes);
                this.dynamicParams.freqShift = Number(this.dynamicParams.freqShift || 0);
                this.dynamicParams.cutoffFrequency = Number(this.dynamicParams.cutoffFrequency || 0);
                this.dynamicParams.ritzLoads = this.clone(this.ritzLoads || []);

                if (window.cadSystem) {
                    window.cadSystem.dynamicParams = this.clone(this.dynamicParams);
                }

                this.showDynamicParamsDialog = false;
                this.showToastMessage('Dynamic parameters guardados.', 'success');
            },

            openPDeltaDialog() {
                if (!this.pDelta.enabled) {
                    this.showToastMessage('P-Delta está desactivado.', 'warning');
                    return;
                }

                this.pDeltaLoads = Array.isArray(this.pDeltaParams.loads) && this.pDeltaParams.loads.length > 0 ?
                    this.clone(this.pDeltaParams.loads) : [{
                        name: this.availableLoads[0]?.name || 'DEAD',
                        scale: 1
                    }];

                this.selectedPDeltaLoad = null;
                this.showPDeltaDialog = true;
            },

            openPDeltaLoadDialog(isNew = true) {
                this.isNewPDeltaLoad = isNew;

                if (!isNew) {
                    if (this.selectedPDeltaLoad === null) {
                        this.showToastMessage('Seleccione una carga P-Delta.', 'warning');
                        return;
                    }

                    this.pDeltaLoadForm = this.clone(this.pDeltaLoads[this.selectedPDeltaLoad]);
                } else {
                    this.pDeltaLoadForm = {
                        name: this.availableLoads[0]?.name || 'DEAD',
                        scale: 1
                    };
                }

                this.showPDeltaLoadDialog = true;
            },

            savePDeltaLoad() {
                if (!this.pDeltaLoadForm.name) {
                    this.showToastMessage('Seleccione un Load Case.', 'error');
                    return;
                }

                const scale = Number(this.pDeltaLoadForm.scale);

                if (!Number.isFinite(scale)) {
                    this.showToastMessage('Scale Factor debe ser numérico.', 'error');
                    return;
                }

                const newLoad = {
                    name: this.pDeltaLoadForm.name,
                    scale
                };

                if (this.isNewPDeltaLoad) {
                    const exists = this.pDeltaLoads.some((load) => {
                        return String(load.name) === String(newLoad.name);
                    });

                    if (exists) {
                        this.showToastMessage('La carga P-Delta ya existe.', 'warning');
                        return;
                    }

                    this.pDeltaLoads.push(newLoad);
                } else if (this.selectedPDeltaLoad !== null) {
                    this.pDeltaLoads[this.selectedPDeltaLoad] = newLoad;
                }

                this.showPDeltaLoadDialog = false;
                this.showToastMessage('Carga P-Delta guardada.', 'success');
            },

            removePDeltaLoad() {
                if (this.selectedPDeltaLoad === null) {
                    this.showToastMessage('Seleccione una carga P-Delta.', 'warning');
                    return;
                }

                this.pDeltaLoads.splice(this.selectedPDeltaLoad, 1);
                this.selectedPDeltaLoad = null;
                this.showToastMessage('Carga P-Delta eliminada.', 'success');
            },

            savePDeltaParams() {
                if (!Number.isFinite(Number(this.pDeltaParams.maxIterations)) || Number(this.pDeltaParams.maxIterations) < 1) {
                    this.showToastMessage('Max Iterations debe ser mayor o igual a 1.', 'error');
                    return;
                }

                this.pDeltaParams.maxIterations = Number(this.pDeltaParams.maxIterations);
                this.pDeltaParams.loads = this.clone(this.pDeltaLoads || []);

                if (window.cadSystem) {
                    window.cadSystem.pDeltaParams = this.clone(this.pDeltaParams);
                }

                this.showPDeltaDialog = false;
                this.showToastMessage('P-Delta parameters guardados.', 'success');
            },

            validateOptions() {
                const hasAnyDof =
                    this.dof.ux ||
                    this.dof.uy ||
                    this.dof.uz ||
                    this.dof.rx ||
                    this.dof.ry ||
                    this.dof.rz;

                if (!hasAnyDof) {
                    this.showToastMessage('Debe activar al menos un grado de libertad.', 'error');
                    return false;
                }

                if (this.dynamicAnalysis.enabled && Number(this.dynamicParams.numModes) < 1) {
                    this.showToastMessage('Number of Modes debe ser mayor o igual a 1.', 'error');
                    return false;
                }

                if (this.pDelta.enabled && this.pDeltaLoads.length === 0) {
                    this.showToastMessage('Debe definir al menos una carga P-Delta.', 'error');
                    return false;
                }

                return true;
            },

            saveOptions() {
                if (!this.validateOptions()) return;

                this.dynamicParams.ritzLoads = this.clone(this.ritzLoads || []);
                this.pDeltaParams.loads = this.clone(this.pDeltaLoads || []);

                const finalOptions = {
                    enabled: true,
                    analysisType: this.analysisType,
                    solverType: this.solverType,
                    runStaticAnalysis: this.runStaticAnalysis,
                    considerSelfWeight: this.considerSelfWeight,
                    analysisStatus: 'not_run',

                    dof: this.clone(this.dof),

                    dynamicAnalysis: this.clone(this.dynamicAnalysis),
                    dynamicParams: this.clone(this.dynamicParams),

                    pDelta: this.clone(this.pDelta),
                    pDeltaParams: this.clone(this.pDeltaParams),

                    dbAccess: this.clone(this.dbAccess),

                    updatedAt: new Date().toISOString()
                };

                if (window.cadSystem) {
                    window.cadSystem.analysisOptions = this.clone(finalOptions);
                    window.cadSystem.dynamicParams = this.clone(this.dynamicParams);
                    window.cadSystem.pDeltaParams = this.clone(this.pDeltaParams);

                    if (window.cadSystem.results) {
                        window.cadSystem.results.analysisStatus = 'not_run';
                    }

                    window.cadSystem.redraw?.();

                    window.cadSystem.showMessage?.(
                        'Analyze: Analysis Options guardadas. El análisis queda pendiente de ejecutar.'
                    );
                }

                console.log('✅ Analyze > Set Analysis Options:', finalOptions);

                this.showToastMessage('Analysis Options guardadas.', 'success');

                setTimeout(() => {
                    this.close();
                }, 350);
            },

            showToastMessage(message, type = 'success') {
                if (this.toastTimeout) {
                    clearTimeout(this.toastTimeout);
                }

                this.toastMessage = message;
                this.toastType = type;
                this.showToast = true;

                this.toastTimeout = setTimeout(() => {
                    this.showToast = false;
                }, 2500);
            }
        };
    }
</script><?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views/components/cad/modals/analysis-options-modal.blade.php ENDPATH**/ ?>