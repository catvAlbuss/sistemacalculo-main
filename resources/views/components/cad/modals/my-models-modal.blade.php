{{-- resources/views/components/cad/modals/my-models-modal.blade.php
     Fase 2 — "Mis modelos" (nube): listar / abrir / guardar como / renombrar / borrar.
     Los datos viven en la tabla cad_models (por usuario). El modelo actual se
     autoguarda solo; aquí se gestionan los modelos guardados. --}}
<div x-data="myModelsModal()"
     x-show="open"
     x-cloak
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700"
         style="width:720px; max-width:95vw; max-height:88vh; overflow:auto">

        {{-- Cabecera --}}
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 class="text-lg font-semibold text-white">☁️ Mis modelos (nube)</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <div class="p-4">
            {{-- Estado --}}
            <div x-show="loading" class="text-gray-400 text-sm py-6 text-center">Cargando…</div>
            <div x-show="error" x-text="error" class="text-red-400 text-sm py-2"></div>

            {{-- Lista --}}
            <div x-show="!loading">
                <table class="w-full text-sm">
                    <thead class="bg-gray-700">
                        <tr>
                            <th class="px-3 py-2 text-left text-gray-300">Nombre</th>
                            <th class="px-3 py-2 text-left text-gray-300">Nodos</th>
                            <th class="px-3 py-2 text-left text-gray-300">Último guardado</th>
                            <th class="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="m in models" :key="m.id">
                            <tr class="border-t border-gray-700"
                                :class="m.id === currentId ? 'bg-blue-900/40' : ''">
                                <td class="px-3 py-2 text-gray-200">
                                    <span x-text="m.name"></span>
                                    <span x-show="m.id === currentId" class="ml-2 text-[10px] text-blue-300">(actual)</span>
                                </td>
                                <td class="px-3 py-2 text-gray-400" x-text="m.node_count"></td>
                                <td class="px-3 py-2 text-gray-400" x-text="fmt(m.last_saved_at || m.updated_at)"></td>
                                <td class="px-3 py-2 text-right whitespace-nowrap">
                                    <button @click="openModel(m)" class="text-blue-400 hover:text-blue-300 mr-2" title="Abrir">📂</button>
                                    <button @click="rename(m)" class="text-yellow-400 hover:text-yellow-300 mr-2" title="Renombrar">✏️</button>
                                    <button @click="remove(m)" class="text-red-400 hover:text-red-300" title="Borrar">🗑️</button>
                                </td>
                            </tr>
                        </template>
                        <tr x-show="!models.length">
                            <td colspan="4" class="px-3 py-6 text-center text-gray-500">
                                Aún no tienes modelos guardados en la nube.
                            </td>
                        </tr>
                    </tbody>
                </table>

                {{-- Guardar como --}}
                <div class="mt-4 flex items-center gap-2 border-t border-gray-700 pt-3">
                    <input type="text" x-model="newName" placeholder="Nombre del modelo…"
                           class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    <button @click="saveAs()" :disabled="busy"
                            class="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded text-sm">
                        💾 Guardar modelo actual como…
                    </button>
                </div>
                <div class="mt-2 text-[11px] text-gray-400">
                    El modelo actual se <b>autoguarda solo</b> en la nube (cada ~12 s con internet) y en tu
                    navegador (offline). Aquí puedes tener <b>varios modelos</b> y cambiar entre ellos.
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="close()" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded">Cerrar</button>
        </div>
    </div>
</div>

<script>
    function myModelsModal() {
        return {
            open: false,
            loading: false,
            busy: false,
            error: '',
            models: [],
            newName: '',

            get currentId() { return window.cadSystem?._serverModelId ?? null; },

            init() {
                window.addEventListener('open-my-models-modal', () => this.openModal());
            },

            async openModal() {
                this.open = true;
                this.error = '';
                this.newName = window.cadSystem?.currentFileName || 'modelo';
                await this.reload();
            },

            close() { this.open = false; },

            fmt(v) {
                if (!v) return '—';
                try { return new Date(v).toLocaleString(); } catch (e) { return v; }
            },

            async reload() {
                this.loading = true;
                this.error = '';
                try {
                    this.models = await window.cadSystem.listCloudModels();
                } catch (e) {
                    this.error = 'No se pudo cargar la lista: ' + e.message;
                } finally {
                    this.loading = false;
                }
            },

            async openModel(m) {
                if (!confirm(`¿Abrir "${m.name}"? Se reemplazará el modelo que tienes en pantalla.`)) return;
                this.busy = true;
                try {
                    await window.cadSystem.openCloudModel(m.id);
                    this.close();
                } catch (e) {
                    this.error = 'No se pudo abrir: ' + e.message;
                } finally {
                    this.busy = false;
                }
            },

            async rename(m) {
                const name = prompt('Nuevo nombre:', m.name);
                if (!name || name === m.name) return;
                try {
                    await window.cadSystem.renameCloudModel(m.id, name);
                    await this.reload();
                } catch (e) {
                    this.error = 'No se pudo renombrar: ' + e.message;
                }
            },

            async remove(m) {
                if (!confirm(`¿Borrar "${m.name}" de la nube? Esta acción no se puede deshacer.`)) return;
                try {
                    await window.cadSystem.deleteCloudModel(m.id);
                    await this.reload();
                } catch (e) {
                    this.error = 'No se pudo borrar: ' + e.message;
                }
            },

            async saveAs() {
                const name = (this.newName || '').trim();
                if (!name) { this.error = 'Escribe un nombre.'; return; }
                this.busy = true;
                this.error = '';
                try {
                    await window.cadSystem.saveAsCloudModel(name);
                    await this.reload();
                } catch (e) {
                    this.error = 'No se pudo guardar: ' + e.message;
                } finally {
                    this.busy = false;
                }
            },
        };
    }
</script>
