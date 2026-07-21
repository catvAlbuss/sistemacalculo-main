{{-- resources/views/components/cad/modals/import-plan-modal.blade.php
     Importar Plano (DXF) — fondo + snap en la vista de planta Base.
     El archivo se lee 100% en el navegador (FileReader), igual que el
     import .e2k: no hay subida al servidor. El texto crudo + el factor de
     unidad elegido se mandan al mixin (plan-import.js), que hace el parseo
     real con engine/dxfImport.js y guarda el resultado. --}}
<div x-data="importPlanModal()"
     x-show="open"
     x-cloak
     @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:420px; max-width:95vw">

        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Importar Plano (DXF / DWG)</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200">
            <p class="text-xs text-gray-400 mb-3">
                Se usa como fondo + puntos de snap en la vista <b>Planta - Base</b>. Dibuja tus
                líneas de referencia enganchando a los vértices del plano, y luego vigas/columnas/
                losas encima. Formatos <b>DXF</b> (texto) y <b>DWG</b> (se convierte con LibreDWG en
                el navegador; la primera vez tarda unos segundos).
            </p>

            <div class="mb-3">
                <label class="block text-xs text-gray-400 mb-1">Archivo .dxf / .dwg</label>
                <input type="file" accept=".dxf,.dwg" @change="onFile($event)"
                       class="w-full text-xs text-gray-300 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:text-xs hover:file:bg-blue-500">
                <div x-show="fileName" class="mt-1 text-[11px] text-green-400" x-text="'Cargado: ' + fileName"></div>
                <div x-show="loading" class="mt-1 text-[11px] text-amber-400">Leyendo archivo…</div>
            </div>

            <div class="mb-3">
                <label class="block text-xs text-gray-400 mb-1">Unidades del archivo</label>
                <select x-model.number="unitToMeters" class="w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                    <option value="0.001">Milímetros (mm) — típico AutoCAD</option>
                    <option value="0.01">Centímetros (cm)</option>
                    <option value="1">Metros (m)</option>
                </select>
                <div class="mt-1 text-[11px] text-gray-500">
                    El DXF no siempre declara sus unidades de forma fiable — confírmalas aquí.
                    Si el plano se ve gigante o minúsculo al importar, prueba otra opción.
                </div>
            </div>

            <div class="mb-1">
                <label class="block text-xs text-gray-400 mb-1">Opacidad del fondo</label>
                <input type="range" min="0.1" max="1" step="0.05" x-model.number="opacity" class="w-full accent-blue-500">
            </div>

            <div x-show="current" class="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                <span class="text-[11px] text-gray-400">
                    Plano actual: <b x-text="current?.fileName"></b>
                </span>
                <button @click="removeCurrent()" class="px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-[11px]">Quitar</button>
            </div>

            <div x-show="error" x-text="error" class="mt-2 text-xs text-red-400"></div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="importAndClose()" :disabled="!ready || loading" class="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded text-sm">Importar</button>
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Cerrar</button>
        </div>
    </div>
</div>

<script>
    function importPlanModal() {
        return {
            open: false, current: null, error: '', loading: false, ready: false,
            fileName: '', kind: 'dxf', text: null, buffer: null,
            unitToMeters: 0.001, opacity: 0.5,

            init() {
                window.addEventListener('open-import-plan-modal', (e) => {
                    this.current = e.detail?.current || null;
                    this.reset();
                    this.open = true;
                });
            },

            reset() {
                this.fileName = ''; this.kind = 'dxf'; this.text = null; this.buffer = null;
                this.error = ''; this.loading = false; this.ready = false;
                this.unitToMeters = 0.001; this.opacity = 0.5;
            },

            close() { this.open = false; },

            onFile(event) {
                const file = event.target.files?.[0];
                if (!file) return;
                const isDxf = /\.dxf$/i.test(file.name);
                const isDwg = /\.dwg$/i.test(file.name);
                if (!isDxf && !isDwg) {
                    this.error = 'Selecciona un archivo .dxf o .dwg';
                    return;
                }
                this.error = ''; this.loading = true; this.ready = false;
                this.kind = isDwg ? 'dwg' : 'dxf';
                this.text = null; this.buffer = null;
                const reader = new FileReader();
                reader.onload = () => {
                    if (isDwg) { this.buffer = reader.result; }
                    else { this.text = reader.result; }
                    this.fileName = file.name;
                    this.loading = false;
                    this.ready = true;
                };
                reader.onerror = () => { this.error = 'No se pudo leer el archivo.'; this.loading = false; };
                // DXF es texto; DWG es binario (ArrayBuffer para LibreDWG).
                if (isDwg) { reader.readAsArrayBuffer(file); }
                else { reader.readAsText(file); }
            },

            importAndClose() {
                if (!this.ready) { this.error = 'Elige un archivo primero.'; return; }
                window.cadSystem?.applyImportedPlanFromModal?.({
                    kind: this.kind, text: this.text, buffer: this.buffer,
                    unitToMeters: this.unitToMeters,
                    fileName: this.fileName, opacity: this.opacity,
                });
                this.close();
            },

            removeCurrent() {
                window.cadSystem?.clearImportedPlan?.();
                this.current = null;
            },
        };
    }
</script>
