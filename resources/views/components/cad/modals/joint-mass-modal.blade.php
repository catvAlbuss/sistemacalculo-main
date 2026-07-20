{{-- resources/views/components/cad/modals/joint-mass-modal.blade.php
     Assign ▸ Joint ▸ Masses, estilo ETABS.
     Migración Swal→Blade: el mixin dispara 'open-joint-mass-modal';
     aplica vía applyJointMassFromModal(v). --}}
<div x-data="jointMassModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:400px; max-width:95vw">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Assign Joint Mass</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <fieldset class="border border-gray-600 rounded px-3 pb-2 pt-1 mb-3">
                <legend class="px-1 text-xs text-gray-400">Traslación (kg)</legend>
                <label class="flex items-center gap-2 mb-2 text-xs cursor-pointer">
                    <input type="checkbox" x-model="sameXY" @change="if (sameXY) v.uy = v.ux" class="accent-blue-500"> Igual en X e Y
                </label>
                <div class="grid grid-cols-[80px_1fr] gap-2 items-center mb-2">
                    <label>U1 (X):</label>
                    <input type="number" min="0" step="any" x-model.number="v.ux" @input="if (sameXY) v.uy = v.ux"
                           class="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200">
                </div>
                <div class="grid grid-cols-[80px_1fr] gap-2 items-center mb-2">
                    <label>U2 (Y):</label>
                    <input type="number" min="0" step="any" x-model.number="v.uy" :disabled="sameXY"
                           class="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200 disabled:opacity-50">
                </div>
                <div class="grid grid-cols-[80px_1fr] gap-2 items-center">
                    <label>U3 (Z):</label>
                    <input type="number" min="0" step="any" x-model.number="v.uz"
                           class="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200">
                </div>
            </fieldset>

            <fieldset class="border border-gray-600 rounded px-3 pb-2 pt-1">
                <legend class="px-1 text-xs text-gray-400">Rotacional (kg·m²)</legend>
                <template x-for="r in [['rx','R1 (XX)'],['ry','R2 (YY)'],['rz','R3 (ZZ)']]" :key="r[0]">
                    <div class="grid grid-cols-[80px_1fr] gap-2 items-center mb-2 last:mb-0">
                        <label x-text="r[1] + ':'"></label>
                        <input type="number" min="0" step="any" x-model.number="v[r[0]]"
                               class="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200">
                    </div>
                </template>
            </fieldset>

            <div x-show="error" x-text="error" class="mt-2 text-xs text-red-400"></div>
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
    function jointMassModal() {
        return {
            open: false, count: 0, sameXY: false, error: '',
            v: { ux: 0, uy: 0, uz: 0, rx: 0, ry: 0, rz: 0 },
            init() {
                window.addEventListener('open-joint-mass-modal', (e) => {
                    const c = e.detail?.current || {};
                    this.v = {
                        ux: Number(c.ux) || 0, uy: Number(c.uy) || 0, uz: Number(c.uz) || 0,
                        rx: Number(c.rx) || 0, ry: Number(c.ry) || 0, rz: Number(c.rz) || 0,
                    };
                    this.sameXY = this.v.ux === this.v.uy;
                    this.count = e.detail?.count || 0;
                    this.error = '';
                    this.open = true;
                });
            },
            close() { this.open = false; },
            apply() {
                if (this.v.ux < 0 || this.v.uy < 0 || this.v.uz < 0) { this.error = 'Las masas no pueden ser negativas'; return; }
                this.error = '';
                window.cadSystem?.applyJointMassFromModal?.({ ...this.v });
            },
            okAndClose() {
                if (this.v.ux < 0 || this.v.uy < 0 || this.v.uz < 0) { this.error = 'Las masas no pueden ser negativas'; return; }
                this.apply(); this.close();
            },
        };
    }
</script>
