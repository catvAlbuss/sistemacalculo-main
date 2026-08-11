{{-- resources/views/components/cad/modals/joint-force-modal.blade.php
     Assign ▸ Joint ▸ Loads ▸ Force, estilo ETABS "Joint Load Assignment - Force".
     Migración Swal→Blade (fase JS parte b): el mixin arma patrones y dispara
     'open-joint-force-modal'; aplica vía applyJointForceFromModal(values). --}}
<div x-data="jointForceModal()"
     x-show="open"
     x-cloak
     @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:520px; max-width:95vw">

        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Joint Load Assignment - Force</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <div class="mb-3">
                <label class="block text-xs text-gray-400 mb-1">Load Pattern Name</label>
                <select x-model="v.loadPattern" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                    <template x-for="p in patterns" :key="p.name">
                        <option :value="p.name" x-text="p.label"></option>
                    </template>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <fieldset class="border border-gray-600 rounded px-3 pb-2 pt-1">
                    <legend class="px-1 text-xs text-gray-400">Loads</legend>
                    <template x-for="f in fields" :key="f.key">
                        <div class="grid items-center gap-2 mb-1.5" style="grid-template-columns:1fr 70px 42px">
                            <label class="text-xs text-gray-300" x-text="f.label"></label>
                            <input type="number" step="any" x-model.number="v[f.key]" :disabled="v.operation === 'delete'"
                                   class="px-1.5 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200 disabled:opacity-40">
                            <span class="text-[11px] text-gray-500" x-text="f.unit"></span>
                        </div>
                    </template>
                </fieldset>

                <fieldset class="border border-gray-600 rounded px-3 pb-2 pt-1">
                    <legend class="px-1 text-xs text-gray-400">Options</legend>
                    <label class="flex items-center gap-2 mb-2 cursor-pointer">
                        <input type="radio" value="add" x-model="v.operation" class="accent-blue-500"> Add to Existing
                    </label>
                    <label class="flex items-center gap-2 mb-2 cursor-pointer">
                        <input type="radio" value="replace" x-model="v.operation" class="accent-blue-500"> Replace Existing
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" value="delete" x-model="v.operation" class="accent-blue-500"> Delete Existing
                    </label>

                    <div class="mt-3 pt-2 border-t border-gray-700 text-[11px] text-gray-400">Punching Shear (m)</div>
                    <div class="grid items-center gap-2 mt-1" style="grid-template-columns:1fr 70px">
                        <label class="text-xs text-gray-300">X Dim</label>
                        <input type="number" step="any" x-model.number="v.punchingX" :disabled="v.operation === 'delete'"
                               class="px-1.5 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200 disabled:opacity-40">
                    </div>
                    <div class="grid items-center gap-2 mt-1" style="grid-template-columns:1fr 70px">
                        <label class="text-xs text-gray-300">Y Dim</label>
                        <input type="number" step="any" x-model.number="v.punchingY" :disabled="v.operation === 'delete'"
                               class="px-1.5 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200 disabled:opacity-40">
                    </div>
                </fieldset>
            </div>

            <div class="mt-2 text-[11px] text-gray-400 text-right" x-text="count + ' nodo(s) seleccionado(s)'"></div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="okAndClose()" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Close</button>
            <button @click="apply()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Apply</button>
        </div>
    </div>
</div>

<script>
    function jointForceModal() {
        return {
            open: false,
            count: 0,
            patterns: [],
            fields: [
                { key: 'fx', label: 'Force Global X', unit: 'tonf' },
                { key: 'fy', label: 'Force Global Y', unit: 'tonf' },
                { key: 'fz', label: 'Force Global Z', unit: 'tonf' },
                { key: 'mxx', label: 'Moment XX', unit: 'tonf-m' },
                { key: 'myy', label: 'Moment YY', unit: 'tonf-m' },
                { key: 'mzz', label: 'Moment ZZ', unit: 'tonf-m' },
            ],
            v: { loadPattern: 'CM', fx: 0, fy: 0, fz: 0, mxx: 0, myy: 0, mzz: 0, operation: 'replace', punchingX: 0, punchingY: 0 },

            init() {
                window.addEventListener('open-joint-force-modal', (e) => {
                    this.patterns = e.detail?.patterns || [];
                    this.count = e.detail?.count || 0;
                    this.v.loadPattern = e.detail?.current || this.patterns[0]?.name || 'CM';
                    ['fx', 'fy', 'fz', 'mxx', 'myy', 'mzz', 'punchingX', 'punchingY'].forEach((k) => { this.v[k] = 0; });
                    this.v.operation = 'replace';
                    this.open = true;
                });
            },

            close() { this.open = false; },
            apply() { window.cadSystem?.applyJointForceFromModal?.({ ...this.v }); },
            okAndClose() { this.apply(); this.close(); },
        };
    }
</script>
