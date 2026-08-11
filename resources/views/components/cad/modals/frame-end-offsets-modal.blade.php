{{-- resources/views/components/cad/modals/frame-end-offsets-modal.blade.php
     Assign ▸ Frame/Line ▸ End (Length) Offsets, estilo ETABS.
     Migración Swal→Blade: el mixin dispara 'open-frame-end-offsets-modal';
     aplica vía applyFrameEndOffsetsFromModal(v). --}}
<div x-data="frameEndOffsetsModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:460px; max-width:95vw">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">End (Length) Offsets</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <label class="flex items-center gap-2 mb-3 cursor-pointer">
                <input type="checkbox" x-model="v.autoOffset" class="accent-blue-500">
                Automatic from Connectivity
            </label>

            <table class="w-full text-xs">
                <thead>
                    <tr class="text-gray-400 border-b border-gray-700">
                        <th class="text-left py-1">Extremo</th>
                        <th>Offset Length (m)</th>
                        <th>Rigid Zone Factor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-gray-700/60">
                        <td class="py-1.5">I-End</td>
                        <td class="px-1"><input type="number" step="0.001" x-model.number="v.iLen" class="w-full px-1.5 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200"></td>
                        <td class="px-1"><input type="number" step="0.01" min="0" max="1" x-model.number="v.iRigid" class="w-full px-1.5 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200"></td>
                    </tr>
                    <tr>
                        <td class="py-1.5">J-End</td>
                        <td class="px-1"><input type="number" step="0.001" x-model.number="v.jLen" class="w-full px-1.5 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200"></td>
                        <td class="px-1"><input type="number" step="0.01" min="0" max="1" x-model.number="v.jRigid" class="w-full px-1.5 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200"></td>
                    </tr>
                </tbody>
            </table>

            <label class="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" x-model="v.useRigidZoneFactor" class="accent-blue-500">
                Use Rigid Zone Factor
            </label>

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
    function frameEndOffsetsModal() {
        return {
            open: false, count: 0,
            v: { autoOffset: false, iLen: 0, iRigid: 0, jLen: 0, jRigid: 0, useRigidZoneFactor: false },
            init() {
                window.addEventListener('open-frame-end-offsets-modal', (e) => {
                    const c = e.detail?.current || {};
                    this.v = {
                        autoOffset: !!c.autoOffset,
                        iLen: Number(c.iEnd?.offsetLength) || 0,
                        iRigid: Number(c.iEnd?.rigidZoneFactor) || 0,
                        jLen: Number(c.jEnd?.offsetLength) || 0,
                        jRigid: Number(c.jEnd?.rigidZoneFactor) || 0,
                        useRigidZoneFactor: !!c.useRigidZoneFactor,
                    };
                    this.count = e.detail?.count || 0;
                    this.open = true;
                });
            },
            close() { this.open = false; },
            apply() { window.cadSystem?.applyFrameEndOffsetsFromModal?.({ ...this.v }); },
            okAndClose() { this.apply(); this.close(); },
        };
    }
</script>
