{{-- resources/views/components/cad/modals/group-names-modal.blade.php
     Assign ▸ Group Names, estilo ETABS.
     Migración Swal→Blade: el mixin dispara 'open-group-names-modal';
     crea grupos vía cadSystem.createGroupForAssign y aplica vía
     applyGroupNamesFromModal(v). --}}
<div x-data="groupNamesModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:460px; max-width:95vw">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Assign Group Names</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Operación</label>
                    <select x-model="operation" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <option value="add">Add to Groups</option>
                        <option value="replace">Replace Groups</option>
                        <option value="remove">Remove from Groups</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Nuevo grupo</label>
                    <div class="flex gap-1">
                        <input type="text" x-model="newName" @keydown.enter.prevent="createGroup()" placeholder="Ej: Vigas_Piso_1"
                               class="flex-1 min-w-0 px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <button @click="createGroup()" class="px-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs">＋</button>
                    </div>
                </div>
            </div>

            <fieldset class="border border-gray-600 rounded px-2 pb-2 pt-1">
                <legend class="px-1 text-xs text-gray-400">Grupos</legend>
                <div class="max-h-52 overflow-auto">
                    <template x-for="g in groups" :key="g.id">
                        <label class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-700">
                            <input type="checkbox" :value="String(g.id)" x-model="checked" class="accent-blue-500">
                            <span x-text="g.name"></span>
                        </label>
                    </template>
                    <div x-show="!groups.length" class="px-2 py-4 text-center text-gray-500 text-xs">
                        No hay grupos. Crea uno arriba.
                    </div>
                </div>
            </fieldset>

            <div x-show="error" x-text="error" class="mt-2 text-xs text-red-400"></div>
            <div class="mt-2 text-[11px] text-gray-400 text-right" x-text="count + ' objeto(s) seleccionado(s)'"></div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="okAndClose()" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">OK</button>
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Close</button>
            <button @click="apply()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Apply</button>
        </div>
    </div>
</div>

<script>
    function groupNamesModal() {
        return {
            open: false, count: 0, operation: 'add', newName: '', error: '',
            groups: [], checked: [],
            init() {
                window.addEventListener('open-group-names-modal', (e) => {
                    this.groups = e.detail?.groups || [];
                    this.count = e.detail?.count || 0;
                    this.operation = 'add';
                    this.newName = '';
                    this.checked = [];
                    this.error = '';
                    this.open = true;
                });
            },
            close() { this.open = false; },
            createGroup() {
                const name = (this.newName || '').trim();
                if (!name) { this.error = 'Escribe un nombre de grupo.'; return; }
                const g = window.cadSystem?.createGroupForAssign?.(name);
                this.groups = window.cadSystem?.getAvailableGroupsForAssign?.() || this.groups;
                if (g && !this.checked.includes(String(g.id))) this.checked.push(String(g.id));
                this.newName = '';
                this.error = '';
            },
            apply() {
                if (!this.checked.length) { this.error = 'Selecciona al menos un grupo.'; return; }
                this.error = '';
                window.cadSystem?.applyGroupNamesFromModal?.({ operation: this.operation, groupIds: [...this.checked] });
            },
            okAndClose() {
                if (!this.checked.length) { this.error = 'Selecciona al menos un grupo.'; return; }
                this.apply(); this.close();
            },
        };
    }
</script>
