{{-- Etiquetas de PIER, como en ETABS.

     Dos modales en un archivo porque son las dos caras de lo mismo y comparten
     la lista:
       · Define ▸ Pier Labels        → crear / renombrar / borrar
       · Assign ▸ Shell ▸ Pier Label → ponérselas a los muros

     QUÉ HACE LA ETIQUETA: no fusiona geometría. Agrupa los shells del mallado
     para integrarlos en un solo P/V/M por piso — la tabla Pier Forces. Por eso
     una placa en L, dibujada como dos paños, se diseña como UNA sección: no se
     unieron, comparten etiqueta. --}}

<div x-data="pierLabelsModal()"
     @open-pier-labels-modal.window="abrirDefinir()"
     @open-assign-pier-label-modal.window="abrirAsignar($event.detail)">

{{-- ── Define ▸ Pier Labels ──────────────────────────────────────────────--}}
<div x-show="definirAbierto" x-cloak
     style="position:fixed; inset:0; z-index:10005; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.6)">
    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700"
         style="width:min(620px, 94vw); max-height:88vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Etiquetas de Pier</h3>
            <button @click="definirAbierto = false" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="px-4 py-3 flex gap-2">
            <input x-model="nuevo" @keydown.enter="crear()" placeholder="Nombre (P1, PL-A…)"
                   class="flex-1 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white">
            <button @click="crear()" :disabled="!nuevo.trim()"
                    class="px-3 py-1 text-sm rounded bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40">
                Agregar
            </button>
        </div>

        <div class="overflow-auto px-4 pb-2" style="max-height:52vh">
            <table class="w-full text-xs">
                <thead class="bg-gray-900 text-gray-400">
                    <tr>
                        <th class="px-2 py-1 text-left">Etiqueta</th>
                        <th class="px-2 py-1 text-right">Muros</th>
                        <th class="px-2 py-1 text-left">Pisos</th>
                        <th class="px-2 py-1"></th>
                    </tr>
                </thead>
                <tbody>
                    <template x-for="u in uso()" :key="u.nombre">
                        <tr class="border-t border-gray-700/60 text-gray-200">
                            <td class="px-2 py-1 font-mono" x-text="u.nombre"></td>
                            <td class="px-2 py-1 text-right font-mono"
                                :class="u.muros ? 'text-gray-200' : 'text-gray-500'"
                                x-text="u.muros"></td>
                            <td class="px-2 py-1 text-gray-400 font-mono"
                                x-text="u.pisos.length ? u.pisos.join(', ') : '—'"></td>
                            <td class="px-2 py-1 text-right whitespace-nowrap">
                                <button @click="renombrar(u.nombre)"
                                        class="px-1.5 py-0.5 text-[10px] rounded bg-gray-700 hover:bg-gray-600">Renombrar</button>
                                <button @click="borrar(u.nombre)"
                                        class="px-1.5 py-0.5 text-[10px] rounded bg-red-900 hover:bg-red-800">Eliminar</button>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
            <div x-show="!uso().length" class="text-center text-gray-500 text-xs py-6">
                No hay etiquetas. Creá una arriba, o importá un <span class="font-mono">.e2k</span> que las traiga.
            </div>
        </div>

        <div class="px-4 py-2 border-t border-gray-700 bg-gray-900 rounded-b-lg flex items-center gap-3">
            <span class="text-[10px] text-gray-500 flex-1">
                Solo los muros CON etiqueta entran a la tabla de Pier Forces.
                <span x-show="sinEtiqueta()" class="text-amber-400">
                    Quedan <span x-text="sinEtiqueta()"></span> muro(s) sin etiqueta.
                </span>
            </span>
            <button @click="definirAbierto = false" class="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-500 text-white">
                Cerrar
            </button>
        </div>
    </div>
</div>

{{-- ── Assign ▸ Shell ▸ Pier Label ───────────────────────────────────────--}}
<div x-show="asignarAbierto" x-cloak
     style="position:fixed; inset:0; z-index:10005; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.6)">
    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:min(520px, 94vw)">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Asignar Etiqueta de Pier</h3>
            <button @click="asignarAbierto = false" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="px-4 py-3 space-y-3 text-sm">
            <label class="block">
                <span class="text-xs text-gray-400">Aplicar a</span>
                <select x-model="scope" class="w-full mt-1 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white">
                    <template x-for="s in scopes" :key="s.value">
                        <option :value="s.value" x-text="s.label"></option>
                    </template>
                </select>
            </label>

            <label class="block">
                <span class="text-xs text-gray-400">Etiqueta</span>
                {{-- `:selected` y no `:value`: en un <select> con x-for, el
                     `:value` del select no engancha con opciones generadas. --}}
                <select x-model="etiqueta" class="w-full mt-1 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white">
                    <option value="__none__">None (quitar)</option>
                    <template x-for="l in labels" :key="l">
                        <option :value="l" x-text="l"></option>
                    </template>
                    <option value="__new__">Nueva…</option>
                </select>
            </label>

            <label class="block" x-show="etiqueta === '__new__'">
                <span class="text-xs text-gray-400">Nombre de la etiqueta nueva</span>
                <input x-model="nombreNuevo" placeholder="P1"
                       class="w-full mt-1 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white">
            </label>

            <p class="text-[10px] text-gray-500 leading-relaxed">
                Los muros que compartan etiqueta se integran como UNA sección por piso.
                Es lo que hace que una placa en L, dibujada como dos paños, se diseñe junta.
            </p>
        </div>

        <div class="flex justify-end gap-2 px-4 py-2 border-t border-gray-700 bg-gray-900 rounded-b-lg">
            <button @click="asignarAbierto = false" class="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white">
                Cancelar
            </button>
            <button @click="aplicar()" class="px-3 py-1.5 text-sm rounded bg-emerald-600 hover:bg-emerald-500 text-white">
                Aplicar
            </button>
        </div>
    </div>
</div>

</div>

<script>
function pierLabelsModal() {
    return {
        definirAbierto: false,
        asignarAbierto: false,
        nuevo: '',
        scopes: [],
        labels: [],
        scope: 'selected',
        etiqueta: '__none__',
        nombreNuevo: '',

        uso()         { return window.cadSystem?.getPierLabelUsage?.() || []; },
        sinEtiqueta() { return (window.cadSystem?.getWallsWithoutPier?.() || []).length; },

        abrirDefinir() { this.nuevo = ''; this.definirAbierto = true; },
        crear() {
            if (window.cadSystem?.agregarPierLabel?.(this.nuevo)) this.nuevo = '';
        },
        renombrar(viejo) {
            const nuevo = window.prompt(`Nuevo nombre para "${viejo}":`, viejo);
            if (nuevo) window.cadSystem?.renombrarPierLabel?.(viejo, nuevo);
        },
        borrar(nombre) {
            const u = this.uso().find((x) => x.nombre === nombre);
            const aviso = u && u.muros
                ? `"${nombre}" está en ${u.muros} muro(s). Se les va a quitar. ¿Seguir?`
                : `¿Eliminar "${nombre}"?`;
            if (window.confirm(aviso)) window.cadSystem?.eliminarPierLabel?.(nombre);
        },

        abrirAsignar(detail) {
            this.scopes = detail?.scopes || [];
            this.labels = detail?.labels || [];
            this.scope = this.scopes[0]?.value || 'selected';
            this.etiqueta = this.labels[0] || '__none__';
            this.nombreNuevo = '';
            this.asignarAbierto = true;
        },
        aplicar() {
            const valor = this.etiqueta === '__new__' ? `__new__:${this.nombreNuevo}` : this.etiqueta;
            const n = window.cadSystem?.applyPierLabelFromModal?.(this.scope, valor) || 0;
            if (n) this.asignarAbierto = false;
        },
    };
}
</script>
