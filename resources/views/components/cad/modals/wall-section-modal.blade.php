{{-- resources/views/components/cad/modals/wall-section-modal.blade.php
     Assign ▸ Shell ▸ Wall Section, estilo ETABS.
     Mismo patrón que slab-section-modal.blade.php: el mixin arma alcances/secciones y
     dispara 'open-wall-section-modal'; aplica vía applyWallSectionFromModal(scope, name). --}}
<div x-data="wallSectionModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:400px; max-width:95vw">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Asignar Sección de Muro (Shell)</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <label class="block text-xs text-gray-400 mb-1">Aplicar a</label>
            <select x-model="scope" class="w-full px-2 py-1.5 mb-3 bg-gray-900 border border-gray-600 rounded text-gray-200">
                <template x-for="s in scopes" :key="s.value">
                    <option :value="s.value" x-text="s.label"></option>
                </template>
            </select>

            <fieldset class="border border-gray-600 rounded px-2 pb-2 pt-1">
                <legend class="px-1 text-xs text-gray-400">Sección de Muro</legend>
                <div class="max-h-44 overflow-auto">
                    <template x-for="s in sections" :key="s.name">
                        <label class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700"
                               :class="name === s.name ? 'bg-blue-900/50' : ''">
                            <input type="radio" name="ws-option" :value="s.name" x-model="name" class="accent-blue-500">
                            <span x-text="s.label"></span>
                        </label>
                    </template>
                    <label class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700"
                           :class="name === '__none__' ? 'bg-blue-900/50' : ''">
                        <input type="radio" name="ws-option" value="__none__" x-model="name" class="accent-blue-500">
                        <span>None (sin sección)</span>
                    </label>
                </div>
            </fieldset>

            <div class="mt-2 text-[11px] text-gray-400">
                El espesor de la sección define el peso propio Y la rigidez lateral del muro
                (se malla con elementos shell). Sin sección asignada, el muro no entra al
                análisis sísmico.
            </div>
        </div>

        <div class="flex justify-between items-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="modify()" class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs">Modify/Show Definitions...</button>
            <div class="flex gap-2">
                <button @click="okAndClose()" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
                <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Close</button>
                <button @click="apply()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Apply</button>
            </div>
        </div>
    </div>
</div>

<script>
    function wallSectionModal() {
        return {
            open: false, scopes: [], sections: [], scope: 'all', name: '__none__',
            init() {
                window.addEventListener('open-wall-section-modal', (e) => {
                    this.scopes = e.detail?.scopes || [];
                    this.sections = e.detail?.sections || [];
                    this.scope = this.scopes[0]?.value || 'all';
                    this.name = this.sections[0]?.name || '__none__';
                    this.open = true;
                });
            },
            close() { this.open = false; },
            modify() { window.dispatchEvent(new CustomEvent('open-wall-sections-modal')); this.close(); },
            apply() { window.cadSystem?.applyWallSectionFromModal?.(this.scope, this.name); },
            okAndClose() { this.apply(); this.close(); },
        };
    }
</script>
