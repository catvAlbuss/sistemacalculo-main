{{-- resources/views/components/cad/modals/generate-stories-modal.blade.php
     "Generar Pisos desde la Grilla" — paso final del flujo:
     importar plano → trazar ejes X/Y a mano (Dibujar Eje X/Y) → generar pisos.
     La grilla de ejes (xGrids/yGrids) es global, no por piso: en cuanto se
     definen más niveles acá, la MISMA grilla trazada en la Base aparece en
     todos ellos automáticamente (ver mixins/grids/reference-grid.js). --}}
<div x-data="generateStoriesModal()"
     x-show="open"
     x-cloak
     @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:460px; max-width:95vw">

        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Generar Pisos desde la Grilla</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <p class="text-xs text-gray-400 mb-3">
                Los ejes X/Y que dibujaste en la planta <b>Base</b> son globales: al definir más
                pisos acá, la misma grilla aparece en todos ellos automáticamente.
            </p>

            <div x-show="!hasAxes" class="mb-3 px-3 py-2 rounded text-[11px] bg-amber-900/40 text-amber-300 border border-amber-700">
                Todavía no dibujaste ningún eje de grid en la Base (Dibujar Eje X / Dibujar Eje Y).
                Los pisos se van a crear igual, pero no vas a ver grilla hasta que traces al menos un eje.
            </div>

            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Cantidad de pisos</label>
                    <input type="number" min="0" step="1" x-model.number="storyCount"
                           class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Altura típica (m)</label>
                    <input type="number" min="0.01" step="0.01" x-model.number="storyHeight"
                           class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                </div>
            </div>

            <div class="border border-gray-700 rounded max-h-52 overflow-auto">
                <div class="grid grid-cols-3 gap-2 px-2 py-1.5 bg-gray-900 text-white font-semibold text-[11px]">
                    <span>ID</span><span>Nombre</span><span>Elevación</span>
                </div>
                <template x-for="row in previewRows" :key="row.id">
                    <div class="grid grid-cols-3 gap-2 px-2 py-1.5 border-t border-gray-700 text-[12px]">
                        <span x-text="row.id"></span>
                        <span x-text="row.name"></span>
                        <span x-text="row.elevation.toFixed(2) + ' m'"></span>
                    </div>
                </template>
            </div>

            <div x-show="error" x-text="error" class="mt-2 text-xs text-red-400"></div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="apply()" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">Generar</button>
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Cancelar</button>
        </div>
    </div>
</div>

<script>
    function generateStoriesModal() {
        return {
            open: false, error: '', hasAxes: true,
            storyCount: 1, storyHeight: 3,

            get previewRows() {
                const count = Math.max(0, Math.floor(Number(this.storyCount) || 0));
                const height = Math.max(0, Number(this.storyHeight) || 0);
                const rows = [{ id: 0, name: 'Base', elevation: 0 }];
                for (let i = 1; i <= count; i++) {
                    rows.push({ id: i, name: `Piso ${i}`, elevation: i * height });
                }
                return rows;
            },

            init() {
                window.addEventListener('open-generate-stories-modal', (e) => {
                    this.storyCount = Number(e.detail?.storyCount ?? 1);
                    this.storyHeight = Number(e.detail?.storyHeight ?? 3);
                    this.hasAxes = e.detail?.hasAxes !== false;
                    this.error = '';
                    this.open = true;
                });
            },

            close() { this.open = false; },

            apply() {
                const storyCount = Math.floor(Number(this.storyCount));
                const storyHeight = Number(this.storyHeight);

                if (!Number.isFinite(storyCount) || storyCount < 0) {
                    this.error = 'La cantidad de pisos no es válida.';
                    return;
                }
                if (!Number.isFinite(storyHeight) || storyHeight <= 0) {
                    this.error = 'La altura de piso debe ser mayor que cero.';
                    return;
                }

                window.cadSystem?.applyGenerateStoriesFromModal?.({ storyCount, storyHeight });
                this.close();
            },
        };
    }
</script>
