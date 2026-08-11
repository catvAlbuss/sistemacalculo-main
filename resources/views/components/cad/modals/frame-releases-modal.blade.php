{{-- resources/views/components/cad/modals/frame-releases-modal.blade.php
     Assign ▸ Frame/Line ▸ Releases / Partial Fixity, estilo ETABS.
     Migración Swal→Blade: el mixin dispara 'open-frame-releases-modal';
     aplica vía applyFrameReleasesFromModal(v). --}}
<div x-data="frameReleasesModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:440px; max-width:95vw">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Frame Releases / Partial Fixity</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <table class="w-full text-xs">
                <thead>
                    <tr class="text-gray-400 border-b border-gray-700">
                        <th class="text-left py-1">Grado de libertad</th>
                        <th class="w-20">Extremo I</th>
                        <th class="w-20">Extremo J</th>
                    </tr>
                </thead>
                <tbody>
                    <template x-for="dof in dofs" :key="dof.key">
                        <tr class="border-b border-gray-700/60">
                            <td class="py-1.5" x-text="dof.label"></td>
                            <td class="text-center"><input type="checkbox" x-model="i[dof.key]" class="accent-blue-500"></td>
                            <td class="text-center"><input type="checkbox" x-model="j[dof.key]" class="accent-blue-500"></td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <label class="flex items-center gap-2 mt-3 cursor-pointer">
                <input type="checkbox" x-model="partialFixity" class="accent-blue-500">
                Activar Partial Fixity / resortes rotacionales iniciales
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
    function frameReleasesModal() {
        return {
            open: false, count: 0, partialFixity: false,
            dofs: [
                { key: 'axial', label: 'Axial / P' },
                { key: 'shear2', label: 'Shear 2 / V2' },
                { key: 'shear3', label: 'Shear 3 / V3' },
                { key: 'torsion', label: 'Torsion / T' },
                { key: 'moment22', label: 'Moment 22 / M2' },
                { key: 'moment33', label: 'Moment 33 / M3' },
            ],
            i: {}, j: {},
            init() {
                window.addEventListener('open-frame-releases-modal', (e) => {
                    const cur = e.detail?.current || {};
                    this.dofs.forEach((d) => {
                        this.i[d.key] = !!(cur.iEnd && cur.iEnd[d.key]);
                        this.j[d.key] = !!(cur.jEnd && cur.jEnd[d.key]);
                    });
                    this.partialFixity = !!(cur.partialFixity && cur.partialFixity.enabled);
                    this.count = e.detail?.count || 0;
                    this.open = true;
                });
            },
            close() { this.open = false; },
            apply() {
                window.cadSystem?.applyFrameReleasesFromModal?.({
                    iEnd: { ...this.i }, jEnd: { ...this.j }, partialFixity: this.partialFixity,
                });
            },
            okAndClose() { this.apply(); this.close(); },
        };
    }
</script>
