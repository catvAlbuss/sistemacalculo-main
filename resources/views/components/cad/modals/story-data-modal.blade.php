{{-- resources/views/components/cad/modals/story-data-modal.blade.php
     Editor ÚNICO de pisos ("Edit Story Data" de ETABS).
     Unifica lo que antes eran dos opciones distintas que hacían lo mismo:
       Editar ▸ Editar Datos de Piso   +   Dibujar ▸ Generar Pisos desde la Grilla
     Se abre con el evento "open-story-data-modal" y aplica sobre
     cadSystem.applyStoryTableFromModal({ rows }) — sin rehacer la grilla:
     los ejes X/Y son globales y aparecen solos en cada piso nuevo. --}}
<div x-data="storyDataModal()"
     x-show="open"
     x-cloak
     @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:620px; max-width:95vw">

        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Pisos y Alturas (Story Data)</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <p class="text-xs text-gray-400 mb-3">
                Edita la altura o el nombre de cada piso, o agrega pisos nuevos.
                La grilla de ejes X/Y es global: <b>no se vuelve a crear</b>, aparece sola en cada piso.
                Lo que ya está dibujado se mueve con su piso.
            </p>

            <div x-show="!hasAxes"
                 class="mb-3 px-3 py-2 rounded text-[11px] bg-amber-900/40 text-amber-300 border border-amber-700">
                Todavía no hay ejes de grid dibujados. Los pisos se crean igual, pero no vas a ver grilla
                hasta que traces al menos un eje (Dibujar ▸ Dibujar Eje X / Y).
            </div>

            {{-- Altura típica + agregar piso --}}
            <div class="flex flex-wrap items-end gap-2 mb-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Altura típica (m)</label>
                    <input type="number" min="0.01" step="0.05" x-model.number="typicalHeight"
                           class="w-28 px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                </div>
                <button @click="applyTypicalToAll()"
                        class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">
                    Aplicar a todos
                </button>
                <button @click="addStoryOnTop()"
                        class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs">
                    + Agregar piso arriba
                </button>
                <span class="text-[11px] text-gray-500 ml-auto"
                      x-text="'Altura total: ' + totalHeight.toFixed(2) + ' m'"></span>
            </div>

            {{-- Tabla: se muestra de arriba hacia abajo, como ETABS --}}
            <div class="border border-gray-700 rounded max-h-72 overflow-auto">
                <div class="grid gap-2 px-2 py-1.5 bg-gray-900 text-white font-semibold text-[11px] sticky top-0"
                     style="grid-template-columns: 1fr 90px 90px 70px;">
                    <span>Nombre</span><span>Altura (m)</span><span>Elevación</span><span class="text-center">Acción</span>
                </div>

                <template x-for="row in displayRows" :key="row.index">
                    <div class="grid gap-2 px-2 py-1.5 border-t border-gray-700 text-[12px] items-center"
                         style="grid-template-columns: 1fr 90px 90px 70px;">
                        <input type="text" x-model="rows[row.index].name"
                               :disabled="row.index === 0"
                               class="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200 disabled:opacity-60">

                        <input x-show="row.index > 0" type="number" min="0.01" step="0.05"
                               x-model.number="rows[row.index].height"
                               class="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-gray-200">
                        <span x-show="row.index === 0" class="text-gray-500">—</span>

                        <span class="text-gray-300" x-text="row.elevation.toFixed(2)"></span>

                        <div class="flex justify-center gap-1">
                            <button @click="insertAbove(row.index)" title="Insertar un piso encima"
                                    class="px-1.5 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-[11px]">+</button>
                            <button x-show="row.index > 0" @click="removeRow(row.index)"
                                    title="Eliminar este piso (y lo dibujado en él)"
                                    class="px-1.5 py-0.5 bg-red-800 hover:bg-red-700 rounded text-[11px]">🗑</button>
                        </div>
                    </div>
                </template>
            </div>

            <div x-show="removedNames.length"
                 class="mt-2 px-3 py-2 rounded text-[11px] bg-red-900/40 text-red-300 border border-red-800">
                Se eliminarán estos pisos y <b>todo lo dibujado en ellos</b>:
                <span x-text="removedNames.join(', ')"></span>. Se puede deshacer con Ctrl+Z.
            </div>

            <div x-show="error" x-text="error" class="mt-2 text-xs text-red-400"></div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="apply()" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm">Aplicar</button>
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Cancelar</button>
        </div>
    </div>
</div>

<script>
    function storyDataModal() {
        return {
            open: false,
            error: '',
            hasAxes: true,
            typicalHeight: 3,
            rows: [],          // base→arriba: { key, name, height }
            originalRows: [],  // para saber qué pisos se borraron

            init() {
                window.addEventListener('open-story-data-modal', (e) => {
                    const incoming = Array.isArray(e.detail?.rows) ? e.detail.rows : [];
                    this.rows = incoming.map((r, i) => ({
                        key: r.key ?? null,
                        name: String(r.name ?? (i === 0 ? 'Base' : 'Piso ' + i)),
                        height: i === 0 ? 0 : Number(r.height ?? 3),
                    }));
                    if (!this.rows.length) {
                        this.rows = [{ key: 0, name: 'Base', height: 0 }];
                    }
                    this.originalRows = this.rows.map((r) => ({ key: r.key, name: r.name }));
                    this.typicalHeight = Number(e.detail?.typicalHeight ?? 3);
                    this.hasAxes = e.detail?.hasAxes !== false;
                    this.error = '';
                    this.open = true;
                });
            },

            // Elevaciones acumuladas; se muestra de arriba hacia abajo.
            get displayRows() {
                let elevation = 0;
                const list = this.rows.map((r, index) => {
                    if (index > 0) elevation += Number(r.height) || 0;
                    return { index, elevation };
                });
                return list.slice().reverse();
            },

            get totalHeight() {
                return this.rows.reduce((acc, r, i) => acc + (i > 0 ? (Number(r.height) || 0) : 0), 0);
            },

            // Pisos que existían y ya no están en la tabla.
            get removedNames() {
                const keys = new Set(this.rows.map((r) => r.key).filter((k) => k !== null && k !== undefined));
                return this.originalRows
                    .filter((r) => r.key !== null && r.key !== undefined && !keys.has(r.key))
                    .map((r) => r.name);
            },

            applyTypicalToAll() {
                const h = Number(this.typicalHeight);
                if (!Number.isFinite(h) || h <= 0) {
                    this.error = 'La altura típica debe ser mayor que cero.';
                    return;
                }
                this.rows.forEach((r, i) => { if (i > 0) r.height = h; });
                this.error = '';
            },

            addStoryOnTop() {
                this.insertAbove(this.rows.length - 1);
            },

            // Inserta un piso nuevo justo encima del índice dado; los de
            // arriba conservan su altura (y por lo tanto suben en bloque).
            insertAbove(index) {
                const h = Number(this.typicalHeight) > 0 ? Number(this.typicalHeight) : 3;
                this.rows.splice(index + 1, 0, { key: null, name: '', height: h });
                this.renumberNewRows();
            },

            removeRow(index) {
                if (index === 0) return;
                this.rows.splice(index, 1);
                this.renumberNewRows();
            },

            // Renumera los nombres por defecto ("Piso 3") para que no queden
            // huecos al insertar o borrar. Un nombre propio del usuario
            // (p. ej. "Azotea") no se toca.
            renumberNewRows() {
                this.rows.forEach((r, i) => {
                    if (i === 0) { r.name = r.name || 'Base'; return; }
                    if (!r.name || /^Piso\s+\d+$/.test(r.name)) r.name = 'Piso ' + i;
                });
            },

            close() { this.open = false; },

            apply() {
                for (let i = 1; i < this.rows.length; i++) {
                    const h = Number(this.rows[i].height);
                    if (!Number.isFinite(h) || h <= 0) {
                        this.error = 'La altura de "' + this.rows[i].name + '" debe ser mayor que cero.';
                        return;
                    }
                }

                const payload = {
                    rows: this.rows.map((r, i) => ({
                        key: r.key ?? null,
                        name: r.name || (i === 0 ? 'Base' : 'Piso ' + i),
                        height: i === 0 ? 0 : Number(r.height),
                    })),
                };

                window.cadSystem?.applyStoryTableFromModal?.(payload);
                this.close();
            },
        };
    }
</script>
