{{-- resources/views/components/cad/modals/area-uniform-load-modal.blade.php
     Assign ▸ Shell/Area Loads ▸ Uniform, estilo ETABS.
     Migración Swal→Blade: el mixin arma alcances/patrones y dispara
     'open-area-uniform-load-modal'; aplica vía applyAreaUniformLoadFromModal(v). --}}
<div x-data="areaUniformLoadModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:480px; max-width:95vw">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Carga de Área — Uniforme (Shell)</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <label class="block text-xs text-gray-400 mb-1">Aplicar a</label>
            <select x-model="v.scope" class="w-full px-2 py-1.5 mb-3 bg-gray-900 border border-gray-600 rounded text-gray-200">
                <template x-for="s in scopes" :key="s.value">
                    <option :value="s.value" x-text="s.label"></option>
                </template>
            </select>

            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Patrón de carga</label>
                    <select x-model="v.loadCase" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <template x-for="c in loadCases" :key="c.name">
                            <option :value="c.name" x-text="c.label"></option>
                        </template>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Valor (kgf/m²)</label>
                    <input type="number" step="10" min="0" x-model.number="v.value"
                           class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                </div>
            </div>

            <label class="block text-xs text-gray-400 mb-1">Operación</label>
            <select x-model="v.operation" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                <option value="replace">Reemplazar cargas del mismo patrón</option>
                <option value="add">Agregar a las existentes</option>
                <option value="delete">Eliminar cargas del patrón</option>
            </select>

            <div class="mt-2 text-[11px] text-gray-400">
                La carga se convierte en masa vía la Fuente de Masa. Típico: CM losa≈300, acabados≈100,
                tabiquería≈150; CV≈200–250.
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
    function areaUniformLoadModal() {
        return {
            open: false, scopes: [], loadCases: [],
            v: { scope: 'all', loadCase: 'CM', value: 300, operation: 'replace' },
            init() {
                window.addEventListener('open-area-uniform-load-modal', (e) => {
                    this.scopes = e.detail?.scopes || [];
                    this.loadCases = e.detail?.loadCases || [];
                    this.v.scope = this.scopes[0]?.value || 'all';
                    this.v.loadCase = this.loadCases[0]?.name || 'CM';
                    this.v.value = 300;
                    this.v.operation = 'replace';
                    this.open = true;
                });
            },
            close() { this.open = false; },
            apply() { window.cadSystem?.applyAreaUniformLoadFromModal?.({ ...this.v }); },
            okAndClose() { this.apply(); this.close(); },
        };
    }
</script>
