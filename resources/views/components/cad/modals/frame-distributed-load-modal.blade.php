{{-- resources/views/components/cad/modals/frame-distributed-load-modal.blade.php
     Assign ▸ Frame/Line Loads ▸ Distributed, estilo ETABS.
     Migración Swal→Blade (fase JS parte b): el mixin arma casos + etiqueta de
     unidad y dispara 'open-frame-distributed-load-modal'; aplica vía
     applyFrameDistributedLoadFromModal(v) que hace la conversión a N/m. --}}
<div x-data="frameDistributedLoadModal()"
     x-show="open"
     x-cloak
     @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:600px; max-width:95vw; max-height:92vh; overflow:auto">

        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Frame Load Assignment - Distributed</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <div class="flex items-center gap-3 mb-4">
                <label class="min-w-[140px] font-semibold text-xs">Load Pattern Name</label>
                <select x-model="v.loadCase" class="flex-1 px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                    <template x-for="c in loadCases" :key="c.name">
                        <option :value="c.name" x-text="c.name"></option>
                    </template>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-3">
                <fieldset class="border border-gray-600 rounded px-3 pb-2 pt-1">
                    <legend class="px-1 text-xs text-blue-300">Load Type and Direction</legend>
                    <div class="flex gap-5 mb-2">
                        <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" value="force" x-model="v.loadType" class="accent-blue-500"> Forces</label>
                        <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" value="moment" x-model="v.loadType" class="accent-blue-500"> Moments</label>
                    </div>
                    <label class="block text-xs mb-1">Direction of Load Application</label>
                    <select x-model="v.direction" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <option value="Gravity">Gravity</option>
                        <option>X</option><option>Y</option><option>Z</option>
                    </select>
                </fieldset>

                <fieldset class="border border-gray-600 rounded px-3 pb-2 pt-1">
                    <legend class="px-1 text-xs text-blue-300">Options</legend>
                    <label class="flex items-center gap-1.5 mb-2 cursor-pointer"><input type="radio" value="add" x-model="v.operation" class="accent-blue-500"> Add to Existing</label>
                    <label class="flex items-center gap-1.5 mb-2 cursor-pointer"><input type="radio" value="replace" x-model="v.operation" class="accent-blue-500"> Replace Existing</label>
                    <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" value="delete" x-model="v.operation" class="accent-blue-500"> Delete Existing</label>
                </fieldset>
            </div>

            <fieldset class="border border-gray-600 rounded px-3 pb-2 pt-1 mb-3">
                <legend class="px-1 text-xs text-blue-300">Trapezoidal Loads</legend>
                <table class="w-full text-center text-xs">
                    <thead><tr class="text-gray-400"><th class="w-16"></th><th>1.</th><th>2.</th><th>3.</th><th>4.</th><th class="w-14"></th></tr></thead>
                    <tbody>
                        <tr>
                            <td class="text-left py-1">Distance</td>
                            <template x-for="(d, i) in v.dist" :key="'d'+i">
                                <td><input type="number" step="0.01" x-model.number="v.dist[i]" class="w-16 px-1 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200"></td>
                            </template>
                            <td></td>
                        </tr>
                        <tr>
                            <td class="text-left py-1">Load</td>
                            <template x-for="(l, i) in v.load" :key="'l'+i">
                                <td><input type="number" step="0.001" x-model.number="v.load[i]" @input="onTrapInput()" class="w-16 px-1 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200"></td>
                            </template>
                            <td class="text-gray-400" x-text="distLabel"></td>
                        </tr>
                    </tbody>
                </table>
                <div class="flex gap-5 mt-2">
                    <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" value="relative" x-model="v.distanceType" class="accent-blue-500"> Relative from End-I</label>
                    <label class="flex items-center gap-1.5 cursor-pointer"><input type="radio" value="absolute" x-model="v.distanceType" class="accent-blue-500"> Absolute from End-I</label>
                </div>
            </fieldset>

            <fieldset class="border border-gray-600 rounded px-3 pb-2 pt-1">
                <legend class="px-1 text-xs text-blue-300">Uniform Load</legend>
                <div class="flex items-center gap-2.5">
                    <label class="min-w-[56px]">Load</label>
                    <input type="number" step="0.001" x-model.number="v.uniform" @input="onUniformInput()"
                           class="w-32 px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                    <span class="text-gray-400" x-text="distLabel"></span>
                </div>
            </fieldset>

            <div class="mt-3 text-[11px] text-gray-400">
                Frames seleccionados: <b x-text="count"></b>. Para <b>Gravity</b> ingresa el valor positivo (actúa hacia abajo).
                <b>Uniform Load</b> tiene prioridad sobre la tabla trapezoidal.
            </div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="okAndClose()" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Close</button>
            <button @click="apply()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Apply</button>
        </div>
    </div>
</div>

<script>
    function frameDistributedLoadModal() {
        return {
            open: false,
            count: 0,
            loadCases: [],
            distLabel: 'tonf/m',
            v: {
                loadCase: 'CM', loadType: 'force', direction: 'Gravity', operation: 'replace',
                distanceType: 'relative', dist: [0, 0.25, 0.75, 1], load: [0, 0, 0, 0], uniform: 0,
            },

            init() {
                window.addEventListener('open-frame-distributed-load-modal', (e) => {
                    this.loadCases = e.detail?.loadCases || [];
                    this.count = e.detail?.count || 0;
                    this.distLabel = e.detail?.distLabel || 'tonf/m';
                    this.v.loadCase = e.detail?.current || this.loadCases[0]?.name || 'CM';
                    this.v.dist = [0, 0.25, 0.75, 1];
                    this.v.load = [0, 0, 0, 0];
                    this.v.uniform = 0;
                    this.v.operation = 'replace';
                    this.open = true;
                });
            },

            // Uniform y trapezoidal son mutuamente excluyentes, como ETABS.
            onUniformInput() {
                if (Number(this.v.uniform) !== 0) this.v.load = [0, 0, 0, 0];
            },
            onTrapInput() {
                if (this.v.load.some((x) => Number(x) !== 0)) this.v.uniform = 0;
            },

            close() { this.open = false; },
            apply() { window.cadSystem?.applyFrameDistributedLoadFromModal?.(JSON.parse(JSON.stringify(this.v))); },
            okAndClose() { this.apply(); this.close(); },
        };
    }
</script>
