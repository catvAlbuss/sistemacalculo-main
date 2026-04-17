{{-- resources/views/components/cad/modals/new-model.blade.php --}}
<div x-data="newModelModal()"
    x-show="open"
    x-cloak
    @keydown.escape.window="closeModal()"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    style="display: none;">

    <div class="bg-gray-800 rounded-lg shadow-xl w-[500px] max-w-full border border-gray-700">
        <!-- Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 class="text-lg font-semibold text-white">Definición de Modelo</h2>
            <button @click="closeModal()" class="text-gray-400 hover:text-white">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div class="p-5 space-y-5">
            <!-- SECCIÓN: GRID DIMENSIONS -->
            <div class="border border-gray-700 rounded-lg overflow-hidden">
                <div class="bg-gray-700 px-3 py-2">
                    <h3 class="text-sm font-semibold text-white">Grid Dimensions (Plan)</h3>
                </div>
                <div class="p-3 space-y-3">
                    <div class="bg-gray-900/50 rounded p-2">
                        <div class="text-xs text-blue-400 font-semibold mb-2">Uniform Grid Spacing</div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Number Lines in X Direction</label>
                                <input type="number" x-model="gridXCount" min="1" max="10"
                                    class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Number Lines in Y Direction</label>
                                <input type="number" x-model="gridYCount" min="1" max="10"
                                    class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Spacing in X Direction (m)</label>
                                <input type="number" step="0.1" x-model="gridXSpacing"
                                    class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Spacing in Y Direction (m)</label>
                                <input type="number" step="0.1" x-model="gridYSpacing"
                                    class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                            </div>
                        </div>
                    </div>

                    <!-- Grid Labels Preview -->
                    <div class="bg-gray-900/30 rounded p-2">
                        <div class="text-xs text-gray-400 mb-1">Grid Labels Preview</div>
                        <div class="flex gap-2 text-xs">
                            <div class="flex items-center gap-1">
                                <span class="text-gray-500">X:</span>
                                <span class="text-blue-400" x-text="getXLabels().join(', ')"></span>
                            </div>
                            <div class="flex items-center gap-1">
                                <span class="text-gray-500">Y:</span>
                                <span class="text-green-400" x-text="getYLabels().join(', ')"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN: STORY DIMENSIONS -->
            <div class="border border-gray-700 rounded-lg overflow-hidden">
                <div class="bg-gray-700 px-3 py-2">
                    <h3 class="text-sm font-semibold text-white">Story Dimensions</h3>
                </div>
                <div class="p-3 space-y-3">
                    <div class="bg-gray-900/50 rounded p-2">
                        <div class="text-xs text-blue-400 font-semibold mb-2">Simple Story Data</div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Number of Stories</label>
                                <input type="number" x-model="storyCount" min="1" max="50"
                                    class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-400 mb-1">Typical Story Height (m)</label>
                                <input type="number" step="0.1" x-model="storyHeight"
                                    class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN: ADD STRUCTURAL OBJECTS -->
            <div class="border border-gray-700 rounded-lg overflow-hidden">
                <div class="bg-gray-700 px-3 py-2">
                    <h3 class="text-sm font-semibold text-white">Add Structural Objects</h3>
                </div>
                <div class="p-3">
                    <div class="flex flex-wrap gap-2">
                        <button @click="selectedTemplate = 'grid-only'"
                            :class="selectedTemplate === 'grid-only' ? 'bg-blue-600' : 'bg-gray-700'"
                            class="px-3 py-1 rounded text-xs hover:bg-gray-600 transition">
                            Grid Only
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 p-4 border-t border-gray-700">
            <button @click="closeModal()"
                class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition">
                Cancel
            </button>
            <button @click="createModel()"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition">
                OK
            </button>
        </div>
    </div>
</div>

<script>
    function newModelModal() {

        return {
            init() {
                window.addEventListener('open-new-model-modal', () => {
                    this.openModal();
                });
            },
            open: false,
            gridXCount: 3,
            gridYCount: 3,
            gridXSpacing: 3.0,
            gridYSpacing: 3.0,
            storyCount: 3,
            storyHeight: 3.0,
            selectedTemplate: 'grid-only',

            getXLabels() {
                const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
                return letters.slice(0, this.gridXCount);
            },

            getYLabels() {
                return Array.from({
                    length: this.gridYCount
                }, (_, i) => i + 1);
            },

            openModal() {
                this.gridXCount = 3;
                this.gridYCount = 3;
                this.gridXSpacing = 3.0;
                this.gridYSpacing = 3.0;
                this.storyCount = 3;
                this.storyHeight = 3.0;
                this.selectedTemplate = 'grid-only';
                this.open = true;
            },

            closeModal() {
                this.open = false;
            },

            createModel() {
                if (window.cadSystem && window.cadSystem.createModelFromDialog) {
                    window.cadSystem.createModelFromDialog({
                        gridXCount: this.gridXCount,
                        gridYCount: this.gridYCount,
                        gridXSpacing: this.gridXSpacing,
                        gridYSpacing: this.gridYSpacing,
                        storyCount: this.storyCount,
                        storyHeight: this.storyHeight,
                        selectedTemplate: this.selectedTemplate
                    });
                }
                this.open = false;
            }
        };
    }
</script>