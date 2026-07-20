{{-- resources/views/components/cad/modals/frame-local-axes-modal.blade.php
     Assign ▸ Frame/Line ▸ Local Axes (Rotation), estilo ETABS "Frame Local Axes".
     Migración Swal→Blade (fase JS parte b): el mixin valida selección y dispara
     'open-frame-local-axes-modal'; aplica vía applyFrameLocalAxesFromModal(angle). --}}
<div x-data="frameLocalAxesModal()"
     x-show="open"
     x-cloak
     @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:360px; max-width:95vw">

        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Frame Local Axes - Rotation</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <p class="text-xs text-gray-400 mb-3">
                Ángulo de rotación del eje local en planta. En columnas rectangulares
                define hacia dónde apunta el peralte (eje fuerte Iz). Positivo = antihorario.
            </p>

            <div class="flex items-center gap-2">
                <label class="min-w-[110px] font-semibold">Angle (deg)</label>
                <input type="number" step="1" x-model.number="angle"
                       class="w-28 px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                <span class="text-gray-400">°</span>
            </div>

            <div class="flex items-center gap-2 mt-3">
                <template x-for="preset in [0, 90, 180, 270]" :key="preset">
                    <button @click="angle = preset"
                            class="px-2 py-1 text-xs rounded border"
                            :class="angle === preset ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'"
                            x-text="preset + '°'"></button>
                </template>
            </div>

            <div class="mt-3 text-[11px] text-gray-400">
                Frames seleccionados: <b x-text="count"></b>. 90° intercambia el eje fuerte entre X e Y.
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
    function frameLocalAxesModal() {
        return {
            open: false,
            count: 0,
            angle: 0,

            init() {
                window.addEventListener('open-frame-local-axes-modal', (e) => {
                    this.angle = Number(e.detail?.current) || 0;
                    this.count = e.detail?.count || 0;
                    this.open = true;
                });
            },

            close() { this.open = false; },

            apply() {
                window.cadSystem?.applyFrameLocalAxesFromModal?.(this.angle);
            },

            okAndClose() {
                this.apply();
                this.close();
            },
        };
    }
</script>
