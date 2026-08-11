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
            <select x-model="v.scope" @change="onScopeChange()" class="w-full px-2 py-1.5 mb-3 bg-gray-900 border border-gray-600 rounded text-gray-200">
                <template x-for="s in scopes" :key="s.value">
                    <option :value="s.value" x-text="s.label"></option>
                </template>
            </select>

            <div class="grid grid-cols-2 gap-3 mb-1">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Patrón de carga</label>
                    <select x-model="v.loadCase" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <template x-for="c in loadCases" :key="c.name">
                            <option :value="c.name" x-text="c.label"></option>
                        </template>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1" x-text="'Valor (' + unitLabels.areaLoad + ')'"></label>
                    <input type="number" step="any" x-model.number="dispValue" @input="autoFilled = false"
                           class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                </div>
            </div>
            <div class="mb-2 h-3">
                <span x-show="autoFilled" class="text-[10px] text-emerald-400">✓ autocompletado con el σmax de esta zapata (Calcular Zapatas)</span>
            </div>

            <label class="block text-xs text-gray-400 mb-1">Operación</label>
            <select x-model="v.operation" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                <option value="replace">Reemplazar cargas del mismo patrón</option>
                <option value="add">Agregar a las existentes</option>
                <option value="delete">Eliminar cargas del patrón</option>
            </select>

            <div class="mt-2 text-[11px] text-gray-400">
                Se puede asignar a losas y zapatas. La carga se convierte en masa sísmica solo en losas
                (nunca en zapatas). Típico en kgf/m² (referencia fija, sin importar tu unidad activa):
                CM losa≈300, acabados≈100, tabiquería≈150; CV≈200–250.
                <b>Valor negativo</b> = empuja hacia arriba (ej. presión de suelo sobre una zapata).
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
            open: false, scopes: [], loadCases: [], autoFilled: false,
            // v.value SIEMPRE en kgf/m² (convención interna del motor, ver
            // lib/units.js) — es lo que de verdad se guarda en area.areaLoads
            // y lo que lee la masa sísmica. El input de abajo NO se conecta a
            // v.value directo, se conecta a dispValue (ver getter/setter),
            // que lo muestra/lee en la unidad activa del selector del pie de
            // página (tonf/m² o kgf/m² según tengas configurado).
            v: { scope: 'all', loadCase: 'CM', value: 300, operation: 'replace' },
            unitsVersion: 0,
            init() {
                window.addEventListener('open-area-uniform-load-modal', (e) => {
                    this.scopes = e.detail?.scopes || [];
                    this.loadCases = e.detail?.loadCases || [];
                    this.v.scope = this.scopes[0]?.value || 'all';
                    this.v.loadCase = this.loadCases[0]?.name || 'CM';
                    this.v.value = 300;
                    this.v.operation = 'replace';
                    this.autoFilled = false;
                    this.open = true;
                    // Por si el "Aplicar a" inicial ya resuelve a una sola
                    // zapata (ej. tenías exactamente una seleccionada antes
                    // de abrir el diálogo).
                    this.onScopeChange();
                });
                window.addEventListener('cad-units-changed', () => { this.unitsVersion++; });
            },
            get unitLabels() {
                this.unitsVersion;
                return window.cadUnits?.labels?.() || { areaLoad: 'kgf/m²' };
            },
            get dispValue() {
                this.unitsVersion;
                return window.cadUnits ? window.cadUnits.areaLoadKgfM2ToDisp(this.v.value) : Number(this.v.value) || 0;
            },
            set dispValue(val) {
                this.v.value = window.cadUnits ? window.cadUnits.areaLoadDispToKgfM2(val) : Number(val) || 0;
            },
            // Autocompleta "Valor" con el σmax (kgf/m²) de la zapata elegida
            // — SOLO si "Aplicar a" resuelve a una sola zapata (nunca losas,
            // nunca si hay varias: ahí el usuario elige a mano, ver
            // getZapataSigmaMaxKgfM2ForScope en assign-dialogs.js).
            onScopeChange() {
                const kgfm2 = window.cadSystem?.getZapataSigmaMaxKgfM2ForScope?.(this.v.scope);
                if (kgfm2 !== null && kgfm2 !== undefined) {
                    this.v.value = kgfm2;
                    this.autoFilled = true;
                } else {
                    this.autoFilled = false;
                }
            },
            close() { this.open = false; },
            apply() { window.cadSystem?.applyAreaUniformLoadFromModal?.({ ...this.v }); },
            okAndClose() { this.apply(); this.close(); },
        };
    }
</script>
