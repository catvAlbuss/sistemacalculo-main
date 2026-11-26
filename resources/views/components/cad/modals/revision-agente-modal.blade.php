{{-- resources/views/components/cad/modals/revision-agente-modal.blade.php
     "Revisión del agente (E.030)": verificaciones del modelo y del análisis sísmico con su valor,
     límite, artículo y la acción cuando algo no cumple. El cálculo vive en
     resources/js/cad/engine/revisionE030.js; los datos los reúne mixins/analysis/revisionAgente.js
     (cadSystem.openRevisionAgente / calcularRevisionAgente). --}}
<div x-data="revisionAgenteModal()" x-show="open" x-cloak @keydown.esc.window="open = false"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.55)">
    <div class="bg-gray-800 text-gray-200 rounded-lg shadow-xl border border-gray-700" role="dialog" aria-modal="true" aria-labelledby="revision-agente-titulo"
         style="width:min(1000px, 96vw); max-height:92vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 id="revision-agente-titulo" class="text-sm font-semibold text-white">🤖 Revisión del agente — E.030-2018</h3>
            <button @click="open = false" class="text-gray-400 hover:text-white text-lg leading-none" aria-label="Cerrar">&times;</button>
        </div>

        <div class="p-4 overflow-auto text-sm">
            {{-- Parámetros de la revisión: se recalcula al cambiarlos --}}
            <div class="flex flex-wrap items-end gap-4 mb-3 text-xs">
                <label class="flex flex-col gap-1">R (Tabla 7)
                    <input type="number" step="0.5" min="1" max="8" x-model.number="opciones.R" @change="recalcular()"
                           class="w-20 p-1 rounded border border-gray-600 bg-gray-700 text-white">
                </label>
                <label class="flex flex-col gap-1">Regularidad
                    <select x-model="opciones.regularidad" @change="recalcular()" class="p-1 rounded border border-gray-600 bg-gray-700 text-white">
                        <option value="auto">Automática (según la revisión)</option>
                        <option value="regular">Regular (0.75·R, 80 %)</option>
                        <option value="irregular">Irregular (0.85·R, 90 %)</option>
                    </select>
                </label>
                <span class="text-gray-400" x-show="datos.irregularidad" x-text="'Ia = ' + (datos.irregularidad?.Ia ?? 1) + ' · Ip = ' + (datos.irregularidad?.Ip ?? 1)"></span>
                <label class="flex flex-col gap-1">Sistema (límite de deriva)
                    <select x-model="opciones.material" @change="recalcular()" class="p-1 rounded border border-gray-600 bg-gray-700 text-white">
                        <option value="concreto">Concreto armado (0.007)</option>
                        <option value="albanileria">Albañilería (0.005)</option>
                        <option value="ductilidad_limitada">Muros de ductilidad limitada (0.005)</option>
                        <option value="acero">Acero (0.010)</option>
                        <option value="madera">Madera (0.010)</option>
                    </select>
                </label>
                <span class="text-gray-400" x-show="datos.casos" x-text="'Casos: X = ' + (datos.casos?.X || '—') + ' · Y = ' + (datos.casos?.Y || '—')"></span>
            </div>

            <div class="rounded border px-3 py-2 mb-3"
                 :class="datos.resumen?.noCumple ? 'border-red-700 bg-red-900/30 text-red-200' : 'border-green-700 bg-green-900/30 text-green-200'">
                <div class="font-semibold" x-text="datos.resumen?.texto"></div>
                <ul class="list-disc ml-5 mt-1 text-xs" x-show="datos.resumen?.acciones?.length">
                    <template x-for="a in (datos.resumen?.acciones || [])" :key="a"><li x-text="a"></li></template>
                </ul>
                <div class="text-xs mt-1 text-amber-300" x-show="!datos.hayResultados">Aún no hay resultados sísmicos: corre Analizar ▸ Análisis Sísmico Espectral para revisar masa, derivas y cortante.</div>
            </div>

            <table class="w-full text-xs border-collapse">
                <thead class="bg-gray-700 text-white">
                    <tr>
                        <th class="px-2 py-1.5 text-left border border-gray-600">Grupo</th>
                        <th class="px-2 py-1.5 text-left border border-gray-600">Verificación</th>
                        <th class="px-2 py-1.5 text-left border border-gray-600">Valor</th>
                        <th class="px-2 py-1.5 text-left border border-gray-600">Límite</th>
                        <th class="px-2 py-1.5 text-left border border-gray-600">Estado</th>
                        <th class="px-2 py-1.5 text-left border border-gray-600">Detalle / acción</th>
                    </tr>
                </thead>
                <tbody>
                    <template x-for="(v, i) in (datos.verificaciones || [])" :key="i">
                        <tr class="border-b border-gray-700 align-top">
                            <td class="px-2 py-1.5 text-gray-400" x-text="v.grupo"></td>
                            <td class="px-2 py-1.5">
                                <span x-text="v.titulo"></span>
                                <div class="text-[10px] text-gray-500" x-show="v.norma" x-text="v.norma"></div>
                            </td>
                            <td class="px-2 py-1.5 font-mono" x-text="v.valor ?? '—'"></td>
                            <td class="px-2 py-1.5 font-mono" x-text="v.limite ?? ''"></td>
                            <td class="px-2 py-1.5 font-semibold" :class="claseEstado(v.estado)" x-text="textoEstado(v.estado)"></td>
                            <td class="px-2 py-1.5">
                                <span x-text="v.detalle"></span>
                                <div class="text-amber-300 mt-0.5" x-show="v.accion" x-text="'→ ' + v.accion"></div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <div class="mt-3 text-[11px] text-gray-400" x-show="datos.supuestos?.length">
                <span class="font-semibold">Supuestos de esta revisión:</span>
                <span x-text="(datos.supuestos || []).join(' ')"></span>
            </div>
            <div class="mt-3 rounded border border-sky-800 bg-sky-950/40 px-3 py-2 text-xs" x-show="explicacion || explicando || errorIA">
                <div class="font-semibold text-sky-300 mb-1">Explicación del agente (IA, sobre estos mismos números)</div>
                <div x-show="explicando" class="text-gray-400">Pensando…</div>
                <div x-show="errorIA" class="text-red-300" x-text="errorIA"></div>
                <div class="whitespace-pre-line text-gray-200" x-show="explicacion" x-text="explicacion"></div>
            </div>
            <p class="mt-2 text-[11px] text-gray-500">Revisión automática con los números del análisis y del diseño: no reemplaza la verificación del ingeniero responsable.</p>
        </div>

        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="disenarColumnas()" class="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs">Diseñar todas las columnas</button>
            <button @click="explicar()" :disabled="explicando" class="px-3 py-1.5 bg-sky-700 hover:bg-sky-600 disabled:opacity-50 text-white rounded text-xs">Explicar con IA</button>
            <button @click="recalcular()" class="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs">Volver a revisar</button>
            <button @click="open = false" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs">Cerrar</button>
        </div>
    </div>
</div>

<script>
    function revisionAgenteModal() {
        return {
            open: false,
            datos: {},
            opciones: {R: 8, regularidad: 'auto', material: 'concreto'},
            explicacion: '',
            explicando: false,
            errorIA: '',
            init() {
                window.addEventListener('open-revision-agente-modal', (e) => {
                    this.datos = e.detail || {};
                    const p = this.datos.parametros || {};
                    this.opciones = {R: p.R ?? 8, regularidad: p.regularidad || 'auto', material: p.material || 'concreto'};
                    this.explicacion = ''; this.errorIA = '';
                    this.open = true;
                });
            },
            recalcular() {
                const nuevos = window.cadSystem?.calcularRevisionAgente?.(this.opciones);
                if (nuevos) { this.datos = nuevos; window.cadSystem.revisionAgente = nuevos; this.explicacion = ''; }
            },
            async disenarColumnas() {
                this.open = false;
                await window.cadSystem?.disenarTodasLasColumnas?.();
            },
            async explicar() {
                this.explicando = true; this.errorIA = ''; this.explicacion = '';
                try { this.explicacion = await window.cadSystem.explicarRevisionAgente(); }
                catch (e) { this.errorIA = e.message || 'No se pudo consultar a la IA.'; }
                finally { this.explicando = false; }
            },
            textoEstado(e) {
                return {cumple: 'Cumple', no_cumple: 'No cumple', observacion: 'Observación', sin_datos: 'Sin datos', info: 'Dato'}[e] || e;
            },
            claseEstado(e) {
                return {cumple: 'text-green-400', no_cumple: 'text-red-400', observacion: 'text-amber-300', sin_datos: 'text-gray-400', info: 'text-sky-300'}[e] || '';
            },
        };
    }
</script>
