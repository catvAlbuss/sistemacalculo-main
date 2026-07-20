{{-- resources/views/components/cad/modals/frame-point-load-modal.blade.php
     Assign ▸ Frame/Line Loads ▸ Point, estilo ETABS.
     Migración Swal→Blade (fase JS parte b): el mixin arma casos y dispara
     'open-frame-point-load-modal'; aplica vía applyFramePointLoadFromModal(v). --}}
<div x-data="framePointLoadModal()"
     x-show="open"
     x-cloak
     @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:520px; max-width:95vw">

        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Frame / Line Loads - Point</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <div class="grid grid-cols-3 gap-3 mb-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Load Case</label>
                    <select x-model="v.loadCase" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <template x-for="c in loadCases" :key="c.name">
                            <option :value="c.name" x-text="c.label"></option>
                        </template>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Coordinate System</label>
                    <select x-model="v.coordinateSystem" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <option value="Global">Global</option>
                        <option value="Local">Local</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Operation</label>
                    <select x-model="v.operation" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <option value="replace">Replace</option>
                        <option value="add">Add</option>
                        <option value="delete">Delete</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3 mb-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Load Type</label>
                    <select x-model="v.loadType" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <option value="force">Force</option>
                        <option value="moment">Moment</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Direction</label>
                    <select x-model="v.direction" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <option>FX</option><option>FY</option><option value="FZ">FZ</option>
                        <option>MX</option><option>MY</option><option>MZ</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Value</label>
                    <input type="number" step="any" x-model.number="v.value"
                           class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                </div>
            </div>

            <fieldset class="border border-gray-600 rounded px-3 pb-2 pt-1">
                <legend class="px-1 text-xs text-gray-400">Load Location</legend>
                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Distance Type</label>
                        <select x-model="v.distanceType" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                            <option value="relative">Relative</option>
                            <option value="absolute">Absolute (I-End)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Relative (0..1)</label>
                        <input type="number" step="0.01" min="0" max="1" x-model.number="v.relativeDistance"
                               :disabled="v.distanceType !== 'relative'"
                               class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200 disabled:opacity-40">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Absolute (m)</label>
                        <input type="number" step="0.001" min="0" x-model.number="v.absoluteDistance"
                               :disabled="v.distanceType !== 'absolute'"
                               class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200 disabled:opacity-40">
                    </div>
                </div>
                <p class="text-[11px] text-gray-500 mt-2">Relative: 0 = extremo I, 1 = extremo J.</p>
            </fieldset>

            <div class="mt-2 text-[11px] text-gray-400 text-right" x-text="count + ' frame(s) seleccionado(s)'"></div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="okAndClose()" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Close</button>
            <button @click="apply()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Apply</button>
        </div>
    </div>
</div>

<script>
    function framePointLoadModal() {
        return {
            open: false,
            count: 0,
            loadCases: [],
            v: { loadCase: 'CM', coordinateSystem: 'Global', operation: 'replace', loadType: 'force', direction: 'FZ', value: -10, distanceType: 'relative', relativeDistance: 0.5, absoluteDistance: 0 },

            init() {
                window.addEventListener('open-frame-point-load-modal', (e) => {
                    this.loadCases = e.detail?.loadCases || [];
                    this.count = e.detail?.count || 0;
                    this.v.loadCase = e.detail?.current || this.loadCases[0]?.name || 'CM';
                    this.open = true;
                });
            },

            close() { this.open = false; },
            apply() { window.cadSystem?.applyFramePointLoadFromModal?.({ ...this.v }); },
            okAndClose() { this.apply(); this.close(); },
        };
    }
</script>
