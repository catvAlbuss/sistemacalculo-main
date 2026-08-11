{{-- resources/views/components/cad/modals/frame-section-modal.blade.php
     Assign ▸ Frame/Line ▸ Frame Section, estilo ETABS.
     Migración Swal→Blade: el mixin arma la lista y dispara
     'open-frame-section-modal'; aplica vía applyFrameSectionFromModal(id). --}}
<div x-data="frameSectionModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:400px; max-width:95vw">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Assign Frame Section</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <fieldset class="border border-gray-600 rounded px-2 pb-2 pt-1">
                <legend class="px-1 text-xs text-gray-400">Frame Section</legend>
                <div class="max-h-64 overflow-auto">
                    <template x-for="s in sections" :key="s.id">
                        <label class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700"
                               :class="selectedId === s.id ? 'bg-blue-900/50' : ''">
                            <input type="radio" name="fs-option" :value="s.id" x-model="selectedId" class="accent-blue-500">
                            <span x-text="s.label"></span>
                        </label>
                    </template>
                </div>
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
    function frameSectionModal() {
        return {
            open: false, count: 0, sections: [], selectedId: null,
            init() {
                window.addEventListener('open-frame-section-modal', (e) => {
                    this.sections = e.detail?.sections || [];
                    this.count = e.detail?.count || 0;
                    this.selectedId = e.detail?.current || this.sections[0]?.id || null;
                    this.open = true;
                });
            },
            close() { this.open = false; },
            apply() { if (this.selectedId) window.cadSystem?.applyFrameSectionFromModal?.(this.selectedId); },
            okAndClose() { this.apply(); this.close(); },
        };
    }
</script>
