{{-- resources/views/components/cad/modals/divide-areas-modal.blade.php
     "Dividir Áreas" estilo ETABS (Edit > Divide Areas > Divide
     Quadrilaterals into Columns by Rows Areas). Solo cuadriláteros (4
     vértices) por ahora — ver mixins/edit/edit-geometry.js::divideSelectedAreas(). --}}
<div x-data="divideAreasModal()"
     x-show="open"
     x-cloak
     @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:420px; max-width:95vw">

        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Dividir Áreas</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <p class="text-xs text-gray-400 mb-3">
                Divide cuadriláteros en Columns × Rows áreas nuevas, en grilla.
            </p>

            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Number of Columns</label>
                    <input type="number" min="1" step="1" x-model.number="cols"
                           class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Number of Rows</label>
                    <input type="number" min="1" step="1" x-model.number="rows"
                           class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                </div>
            </div>

            <div class="px-3 py-2 rounded text-[12px] bg-gray-900 border border-gray-700 text-gray-400">
                Áreas seleccionadas: <b class="text-gray-200" x-text="areaCount"></b><br>
                Cada área será reemplazada por Columns × Rows áreas nuevas.
            </div>

            <div x-show="error" x-text="error" class="mt-2 text-xs text-red-400"></div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="apply()" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">Divide</button>
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Cancelar</button>
        </div>
    </div>
</div>

<script>
    function divideAreasModal() {
        return {
            open: false, error: '', areaCount: 0,
            cols: 2, rows: 2,

            init() {
                window.addEventListener('open-divide-areas-modal', (e) => {
                    this.areaCount = Number(e.detail?.areaCount ?? 0);
                    this.cols = 2;
                    this.rows = 2;
                    this.error = '';
                    this.open = true;
                });
            },

            close() { this.open = false; },

            apply() {
                const cols = Math.floor(Number(this.cols));
                const rows = Math.floor(Number(this.rows));

                if (!Number.isInteger(cols) || cols < 1 || !Number.isInteger(rows) || rows < 1) {
                    this.error = 'Columns y Rows deben ser enteros mayores o iguales a 1.';
                    return;
                }

                window.cadSystem?.applyDivideAreas?.({ cols, rows });
                this.close();
            },
        };
    }
</script>
