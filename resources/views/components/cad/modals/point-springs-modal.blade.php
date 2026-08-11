{{-- resources/views/components/cad/modals/point-springs-modal.blade.php
     Assign ▸ Joint ▸ Point Springs, estilo ETABS.
     Migración Swal→Blade: el mixin dispara 'open-point-springs-modal';
     aplica vía applyPointSpringsFromModal(v) / removePointSpringsFromSelected(). --}}
<div x-data="pointSpringsModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:460px; max-width:95vw">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Assign Point Springs</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Preset</label>
                    <select x-model="preset" @change="applyPreset()" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <option value="custom">Custom</option>
                        <option value="vertical">Vertical Spring</option>
                        <option value="horizontal">Horizontal Springs</option>
                        <option value="soil">Soil Springs XYZ</option>
                        <option value="rotational">Rotational Springs</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Coordinate System</label>
                    <select x-model="coordinateSystem" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <option value="Global">Global</option>
                        <option value="Local">Local</option>
                    </select>
                </div>
            </div>

            <table class="w-full text-xs">
                <thead>
                    <tr class="text-gray-400 border-b border-gray-700">
                        <th class="text-left py-1">DOF</th><th>Stiffness</th><th class="w-24">Unidad</th>
                    </tr>
                </thead>
                <tbody>
                    <template x-for="d in dofs" :key="d.key">
                        <tr class="border-b border-gray-700/60">
                            <td class="py-1" x-text="d.label"></td>
                            <td class="px-1"><input type="number" step="0.001" x-model.number="k[d.key]" @input="preset = 'custom'"
                                   class="w-full px-1.5 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200"></td>
                            <td class="text-gray-500" x-text="d.unit"></td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <div class="mt-2 text-[11px] text-gray-400 text-right" x-text="count + ' nodo(s) seleccionado(s)'"></div>
        </div>

        <div class="flex justify-between items-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="remove()" class="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded text-xs">Remover</button>
            <div class="flex gap-2">
                <button @click="okAndClose()" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
                <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Close</button>
                <button @click="apply()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Apply</button>
            </div>
        </div>
    </div>
</div>

<script>
    function pointSpringsModal() {
        return {
            open: false, count: 0, preset: 'custom', coordinateSystem: 'Global',
            dofs: [
                { key: 'ux', label: 'U1 / UX', unit: 'kN/m' },
                { key: 'uy', label: 'U2 / UY', unit: 'kN/m' },
                { key: 'uz', label: 'U3 / UZ', unit: 'kN/m' },
                { key: 'rx', label: 'R1 / RX', unit: 'kN·m/rad' },
                { key: 'ry', label: 'R2 / RY', unit: 'kN·m/rad' },
                { key: 'rz', label: 'R3 / RZ', unit: 'kN·m/rad' },
            ],
            k: { ux: 0, uy: 0, uz: 0, rx: 0, ry: 0, rz: 0 },
            init() {
                window.addEventListener('open-point-springs-modal', (e) => {
                    const c = e.detail?.current || {};
                    const s = c.stiffness || {};
                    this.k = { ux: +s.ux || 0, uy: +s.uy || 0, uz: +s.uz || 0, rx: +s.rx || 0, ry: +s.ry || 0, rz: +s.rz || 0 };
                    this.coordinateSystem = c.coordinateSystem || 'Global';
                    this.preset = 'custom';
                    this.count = e.detail?.count || 0;
                    this.open = true;
                });
            },
            applyPreset() {
                if (this.preset === 'custom') return;
                const p = window.cadSystem?.getPointSpringPreset?.(this.preset);
                if (p?.stiffness) this.k = { ...p.stiffness };
            },
            close() { this.open = false; },
            apply() {
                window.cadSystem?.applyPointSpringsFromModal?.({
                    preset: this.preset, coordinateSystem: this.coordinateSystem, stiffness: { ...this.k },
                });
            },
            remove() { window.cadSystem?.removePointSpringsFromSelected?.(); this.close(); },
            okAndClose() { this.apply(); this.close(); },
        };
    }
</script>
