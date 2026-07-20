{{-- resources/views/components/cad/modals/shell-diaphragms-modal.blade.php
     Assign ▸ Shell ▸ Diaphragms, estilo ETABS "Shell Assignment - Diaphragm".
     Migración Swal→Blade (fase JS parte b): el mixin arma alcances/diafragmas y
     dispara 'open-shell-diaphragms-modal'; aplica vía
     applyShellDiaphragmsFromModal(scope, id). --}}
<div x-data="shellDiaphragmsModal()"
     x-show="open"
     x-cloak
     @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:380px; max-width:95vw">

        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Shell Assignment - Diaphragm</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <div class="mb-3">
                <label class="block text-xs text-gray-400 mb-1">Aplicar a</label>
                <select x-model="scope" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                    <template x-for="s in scopes" :key="s.value">
                        <option :value="s.value" x-text="s.label"></option>
                    </template>
                </select>
            </div>

            <fieldset class="border border-gray-600 rounded px-2 pb-2 pt-1">
                <legend class="px-1 text-xs text-gray-400">Diaphragm</legend>
                <div class="max-h-44 overflow-auto">
                    <template x-for="d in diaphragms" :key="d.id">
                        <label class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700"
                               :class="selectedId === d.id ? 'bg-blue-900/50' : ''">
                            <input type="radio" name="sd-option" :value="d.id" x-model="selectedId" class="accent-blue-500">
                            <span x-text="d.label"></span>
                        </label>
                    </template>
                    <label class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700"
                           :class="selectedId === '__NONE__' ? 'bg-blue-900/50' : ''">
                        <input type="radio" name="sd-option" value="__NONE__" x-model="selectedId" class="accent-blue-500">
                        <span>None (quitar diafragma)</span>
                    </label>
                </div>
            </fieldset>

            <div class="mt-2 text-[11px] text-gray-400">
                Los nudos que toca la losa heredan el diafragma ("From Area", como ETABS).
                Una asignación directa en el nudo tiene precedencia. La araña en planta
                muestra las líneas punteadas al centro de masa.
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
    function shellDiaphragmsModal() {
        return {
            open: false,
            scopes: [],
            diaphragms: [],
            scope: 'all',
            selectedId: '__NONE__',

            init() {
                window.addEventListener('open-shell-diaphragms-modal', (e) => {
                    this.scopes = e.detail?.scopes || [];
                    this.diaphragms = e.detail?.diaphragms || [];
                    this.scope = this.scopes[0]?.value || 'all';
                    this.selectedId = e.detail?.currentId || this.diaphragms[0]?.id || '__NONE__';
                    this.open = true;
                });
            },

            close() { this.open = false; },

            apply() {
                window.cadSystem?.applyShellDiaphragmsFromModal?.(this.scope, this.selectedId);
            },

            okAndClose() {
                this.apply();
                this.close();
            },
        };
    }
</script>
