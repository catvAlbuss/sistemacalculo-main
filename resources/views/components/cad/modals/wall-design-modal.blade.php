{{-- resources/views/components/cad/modals/wall-design-modal.blade.php
     Section Designer de placas: dibuja la sección con su armado real, deja
     EDITAR las propiedades de cada objeto (forma o varillas) y muestra la
     superficie de interacción en el formato de la tabla "Curve Data" de ETABS.

     cadSystem.openWallSectionDesigner(nombre?) dispara 'open-wall-design-modal'
     y deja el estado en cadSystem.wallDesignState (ver
     resources/js/cad/mixins/analysis/wallSectionDesigner.js). Se edita sobre un
     BORRADOR: el modelo no se toca hasta que se apriete Restaurar/OK.

     OJO con dos cosas que ya nos mordieron:
     - El dibujo entra como STRING vía x-html. <template x-for> adentro de <svg>
       NO funciona (namespace HTML), da atributos NaN.
     - st() NUNCA devuelve null: Alpine evalúa las expresiones de los hijos
       aunque el contenedor esté oculto por x-show, y un null rompe la página. --}}
{{-- Esc NO cierra: adentro de un editor eso es tirar el trabajo por accidente.
     Deselecciona, o sale del modo "colocar varilla". Se cierra con la X. --}}
<div x-data="wallDesignModal()"
     x-show="open" x-cloak @keydown.escape.window="escape($event)"
     @keydown.window="teclas($event)"
     style="position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700"
         style="width:min(1400px, 97vw); max-height:93vh; display:flex; flex-direction:column">

        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">
                Section Designer — Placas
                <span class="text-gray-400 font-normal" x-text="st().seleccionada"></span>
                <span x-show="st().editado" class="ml-2 text-[11px] text-amber-400">· editado</span>
            </h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200 overflow-auto">

            {{-- Controles --}}
            <div class="flex flex-wrap items-end gap-3 mb-3">
                <label class="flex flex-col gap-1">
                    <span class="text-[11px] text-gray-400 uppercase tracking-wide">Sección</span>
                    <select x-model="seccion" @change="cambiarSeccion()"
                            class="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm min-w-[170px]">
                        <template x-for="s in st().secciones" :key="s.name">
                            <option :value="s.name" x-text="s.name + (s.diseñable ? '' : '  (sin armado)')"></option>
                        </template>
                    </select>
                </label>

                <label class="flex flex-col gap-1">
                    <span class="text-[11px] text-gray-400 uppercase tracking-wide">Código</span>
                    <select x-model="code" @change="cambiarCodigo()"
                            class="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm">
                        <option value="ACI318">ACI 318-14</option>
                        <option value="E060">NTE E.060</option>
                    </select>
                </label>

                <label class="flex flex-col gap-1">
                    <span class="text-[11px] text-gray-400 uppercase tracking-wide">Modo</span>
                    <select x-model="modo" @change="st().modo = modo"
                            class="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm">
                        <option value="con_phi">Include Phi</option>
                        <option value="sin_phi">Exclude Phi</option>
                    </select>
                </label>

                <label class="flex flex-col gap-1">
                    <span class="text-[11px] text-gray-400 uppercase tracking-wide">Curva</span>
                    <select x-model.number="curva" @change="st().curva = curva"
                            class="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm">
                        <template x-for="i in 24" :key="i">
                            <option :value="i - 1" x-text="'#' + i + '  ·  ' + ((i - 1) * 15) + '°'"></option>
                        </template>
                    </select>
                </label>

                <button x-show="st().editado" @click="restaurar()"
                        class="px-3 py-1.5 text-xs rounded bg-amber-700 hover:bg-amber-600 text-white">
                    Restaurar original
                </button>

                <span class="text-[11px] text-gray-400 ml-auto" x-show="st().cargando">Calculando…</span>
            </div>

            <div x-show="st().error"
                 class="mb-3 px-3 py-2 rounded bg-amber-900/40 border border-amber-700 text-amber-200 text-xs"
                 x-text="st().error"></div>

            <div class="grid gap-4" style="grid-template-columns: 70% 30%">

                {{-- Dibujo --}}
                <div>
                    {{-- Barra del lienzo: modo, snap y encuadre --}}
                    <div class="flex items-center gap-1 mb-1">
                        <button @click="setModo('seleccionar')"
                                class="px-2 py-0.5 text-[10px] rounded"
                                :class="st().modoCanvas === 'seleccionar' ? 'bg-sky-700 text-white' : 'bg-gray-700 text-gray-300'">
                            Seleccionar
                        </button>
                        <button @click="setModo('colocar')"
                                class="px-2 py-0.5 text-[10px] rounded"
                                :class="st().modoCanvas === 'colocar' ? 'bg-sky-700 text-white' : 'bg-gray-700 text-gray-300'">
                            Colocar varilla
                        </button>
                        <button @click="setModo('polilinea')"
                                class="px-2 py-0.5 text-[10px] rounded"
                                :class="st().modoCanvas === 'polilinea' ? 'bg-sky-700 text-white' : 'bg-gray-700 text-gray-300'"
                                title="Clic por vértice, doble clic para cerrar">
                            Polilínea
                        </button>
                        <button @click="alternarSnap()"
                                class="px-2 py-0.5 text-[10px] rounded"
                                :class="st().snap ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-700 text-gray-300'"
                                title="Ajustar a vértices y a la grilla">
                            Snap
                        </button>
                        <button @click="encuadrar()"
                                class="px-2 py-0.5 text-[10px] rounded bg-gray-700 text-gray-300 ml-auto">
                            Encuadrar
                        </button>
                    </div>

                    <div class="bg-gray-900 border border-gray-700 rounded relative" style="height:52vh">
                        <canvas x-ref="lienzo" style="width:100%; height:100%; display:block"></canvas>
                        {{-- Lectura viva de la coordenada, como la barra de estado de ETABS --}}
                        <div class="absolute bottom-1 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800/80"
                             :class="st().coords?.snap ? 'text-emerald-300' : 'text-gray-400'"
                             x-text="st().coords
                                ? ('X ' + st().coords.X.toFixed(4) + '   Y ' + st().coords.Y.toFixed(4)
                                   + (st().coords.snap ? '   · ' + st().coords.snap : ''))
                                : ''"></div>
                    </div>
                    <div class="mt-1 text-[10px] text-gray-500">
                        Rueda: zoom · Botón derecho: mover la vista · Arrastrar en vacío: seleccionar por ventana
                        · Ctrl/Shift: sumar a la selección · Supr: borrar · Ctrl+Z / Ctrl+Y
                    </div>
                    <template x-if="resumen()">
                        <div class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-gray-300">
                            <div>Área bruta</div><div class="text-right font-mono" x-text="resumen().Ag.toFixed(4) + ' m²'"></div>
                            <div>Acero total</div><div class="text-right font-mono" x-text="resumen().As.toFixed(2) + ' cm²'"></div>
                            <div>Cuantía</div><div class="text-right font-mono" x-text="resumen().cuantia.toFixed(2) + ' %'"></div>
                            <div>Varillas</div><div class="text-right font-mono" x-text="resumen().varillas"></div>
                            <div>Espejo deducido</div><div class="text-right font-mono" x-text="resumen().espejo"></div>
                            <template x-if="resumen().I22 !== undefined">
                                <div class="col-span-2 border-t border-gray-700 mt-1 pt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                                    <div>I22</div><div class="text-right font-mono" x-text="resumen().I22.toFixed(6)"></div>
                                    <div>I33</div><div class="text-right font-mono" x-text="resumen().I33.toFixed(6)"></div>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>

                {{-- Objetos y propiedades --}}
                <div class="flex flex-col gap-3">
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-[11px] text-gray-400 uppercase tracking-wide">
                                Objetos
                                <span x-show="st().seleccion.length > 1" class="text-sky-400 normal-case"
                                      x-text="'· ' + st().seleccion.length + ' seleccionados'"></span>
                            </span>
                            <div class="flex gap-1">
                                <button @click="deshacer()" :disabled="!puedeDeshacer()"
                                        class="px-1.5 py-0.5 text-[10px] rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40"
                                        title="Deshacer (Ctrl+Z)">↶</button>
                                <button @click="rehacer()" :disabled="!puedeRehacer()"
                                        class="px-1.5 py-0.5 text-[10px] rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40"
                                        title="Rehacer (Ctrl+Y)">↷</button>
                                <button @click="duplicar()" :disabled="!sel()"
                                        class="px-1.5 py-0.5 text-[10px] rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40"
                                        title="Duplicar el objeto seleccionado">Duplicar</button>
                                <button @click="eliminar()" :disabled="!st().seleccion.length"
                                        class="px-1.5 py-0.5 text-[10px] rounded bg-red-900 hover:bg-red-800 disabled:opacity-40"
                                        title="Eliminar lo seleccionado (Supr)">Eliminar</button>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-1 mb-1">
                            <template x-for="t in tipos()" :key="t.tipo">
                                <button @click="agregar(t.tipo)"
                                        class="px-1.5 py-0.5 text-[10px] rounded bg-sky-900 hover:bg-sky-800 text-sky-100"
                                        x-text="'+ ' + t.etiqueta"></button>
                            </template>
                        </div>
                        <div class="border border-gray-700 rounded overflow-auto" style="max-height:24vh">
                            <template x-for="o in objetos()" :key="o.i">
                                <button @click="seleccionar(o.i)"
                                        class="w-full text-left px-2 py-1 text-[11px] border-b border-gray-800 hover:bg-gray-700"
                                        :class="seleccionada(o.i) ? 'bg-sky-900/60' : ''">
                                    <span class="font-mono" :class="o.esArmado ? 'text-red-300' : 'text-gray-300'"
                                          x-text="o.etiqueta"></span>
                                    <span class="text-gray-500" x-text="' · ' + o.detalle"></span>
                                </button>
                            </template>
                        </div>
                    </div>

                    <div x-show="sel()" class="border border-sky-800 rounded p-2 bg-gray-900">
                        <div class="text-[11px] text-sky-300 font-semibold mb-2"
                             x-text="sel() ? ('Propiedades · ' + sel().tipo) : ''"></div>

                        <template x-if="sel() && sel().esArmado && barSizes().length">
                            <label class="flex items-center justify-between gap-2 mb-1.5">
                                <span class="text-[11px] text-gray-400">Bar Size</span>
                                {{-- :selected en la OPCION, no :value en el select:
                                     Alpine renderiza las opciones despues, asi que
                                     el :value del select se pierde y mostraba
                                     siempre la primera del catalogo (#2 cuando la
                                     varilla era #5). --}}
                                <select @change="cambiarBarra('barSize', $event.target.value)"
                                        class="bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs font-mono w-24">
                                    <template x-for="b in barSizes()" :key="b">
                                        <option :value="b" :selected="b === sel().barSize" x-text="b"></option>
                                    </template>
                                </select>
                            </label>
                        </template>

                        <template x-if="sel() && sel().tipo === 'LINE REBAR'">
                            <label class="flex items-center justify-between gap-2 mb-1.5">
                                <span class="text-[11px] text-gray-400">Has End Bars</span>
                                <select @change="cambiarBarra('endBar', $event.target.value)"
                                        class="bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs font-mono w-24">
                                    <option value="NO" :selected="sel().endBar === 'NO'">No</option>
                                    <option value="YES" :selected="sel().endBar === 'YES'">Yes</option>
                                </select>
                            </label>
                        </template>

                        <template x-for="c in campos()" :key="c.clave">
                            <label class="flex items-center justify-between gap-2 mb-1.5">
                                <span class="text-[11px] text-gray-400" x-text="c.etiqueta"></span>
                                <template x-if="c.tipo === 'b'">
                                    <input type="checkbox" :checked="c.valor"
                                           @change="cambiarCasilla(c.clave, $event.target.checked)"
                                           class="accent-sky-500 w-4 h-4">
                                </template>
                                <template x-if="c.tipo !== 'b'">
                                    <input type="number" step="0.001" :value="c.valor"
                                           @change="cambiarCampo(c.clave, $event.target.value)"
                                           class="bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs font-mono w-24 text-right">
                                </template>
                            </label>
                        </template>

                        {{-- Derivados, de solo lectura: la cantidad de varillas
                             sale del espaciamiento MAXIMO, no al reves. Verlos
                             evita pensar que el editor invento una varilla al
                             alargar una linea. --}}
                        <template x-if="sel() && sel().esArmado">
                            <div class="mt-2 pt-2 border-t border-gray-700 grid grid-cols-2 gap-y-1 text-[11px]">
                                <span class="text-gray-500">Number of Bars</span>
                                <span class="text-right font-mono text-gray-300" x-text="sel().numBars"></span>
                                <template x-if="sel().actualSpacing">
                                    <span class="text-gray-500">Actual Bar Spacing</span>
                                </template>
                                <template x-if="sel().actualSpacing">
                                    <span class="text-right font-mono text-gray-300"
                                          x-text="sel().actualSpacing.toFixed(5)"></span>
                                </template>
                            </div>
                        </template>

                        <div x-show="!campos().length && sel() && sel().tipo === 'POLYGON'"
                             class="text-[10px] text-gray-500">
                            Los vértices de un polígono todavía no se editan acá.
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-2 border-t border-gray-700 bg-gray-900 rounded-b-lg">
            <span class="mr-auto text-[11px]" :class="st().pendiente ? 'text-amber-400' : 'text-gray-500'"
                  x-text="st().cargando ? 'Calculando…'
                          : st().pendiente ? 'Hay cambios sin calcular'
                          : (filas().length ? 'Resultados al día' : '')"></span>
            <button @click="calcular()" :disabled="st().cargando"
                    class="px-3 py-1.5 text-sm rounded text-white disabled:opacity-40"
                    :class="st().pendiente ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gray-700 hover:bg-gray-600'">
                Calcular
            </button>
            <button @click="guardar()" :disabled="!puedeGuardar()"
                    class="px-3 py-1.5 text-sm rounded bg-sky-700 hover:bg-sky-600 text-white disabled:opacity-40"
                    :title="st().pendiente ? 'Calculá antes de guardar: las propiedades de sección salen del cálculo' : 'Guardar sobre la misma sección'">
                Guardar
            </button>
            <button @click="guardarComo()" :disabled="!puedeGuardar()"
                    class="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-40">
                Guardar como…
            </button>
            <button @click="demandasAbierto = true; pintarGraficos()"
                    class="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white">
                Demandas (D/C)
                <span x-show="gobernante() !== null" class="ml-1 font-mono"
                      :class="gobernante() > 1 ? 'text-red-300' : 'text-emerald-300'"
                      x-text="gobernante() !== null ? gobernante().toFixed(3) : ''"></span>
            </button>
            <button @click="tablaAbierta = true" :disabled="!filas().length"
                    class="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-40">
                Ver tabla (Curve Data)
            </button>
            <button @click="close()" class="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-500 text-white">
                Cerrar
            </button>
        </div>
    </div>

{{-- ── Curve Data, en su propio modal ──────────────────────────────────────
     Se saca del editor a propósito: la tabla solo se mira cuando se quiere
     comparar contra ETABS, y ocupando un tercio de la pantalla le robaba lugar
     al lienzo, que es donde se trabaja. --}}
<div x-show="tablaAbierta" x-cloak
     style="position:fixed; inset:0; z-index:10010; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.6)">
    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700"
         style="width:min(760px, 94vw); max-height:88vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">
                Curve Data — <span class="text-gray-400 font-normal" x-text="st().seleccionada"></span>
                <span class="text-gray-500 text-xs" x-text="'  ·  curva #' + (curva + 1) + '  ·  ' + (curva * 15) + '°'"></span>
            </h3>
            <button @click="tablaAbierta = false" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>
        <div class="p-4 overflow-auto">
                <div>
                    <div class="text-[11px] text-gray-400 mb-1">
                        Curve Data — mismos ejes y signos que ETABS (compresión positiva).
                    </div>
                    <div class="overflow-auto border border-gray-700 rounded" style="max-height:64vh">
                        <table class="w-full text-xs font-mono">
                            <thead class="bg-gray-900 text-gray-400 sticky top-0">
                                <tr>
                                    <th class="px-2 py-1 text-left">Point</th>
                                    <th class="px-2 py-1 text-right">P tonf</th>
                                    <th class="px-2 py-1 text-right">M2 tonf-m</th>
                                    <th class="px-2 py-1 text-right">M3 tonf-m</th>
                                    <th class="px-2 py-1 text-right">φ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template x-for="f in filas()" :key="f.punto">
                                    <tr class="border-t border-gray-800">
                                        <td class="px-2 py-1" x-text="f.punto"></td>
                                        <td class="px-2 py-1 text-right" x-text="f.P.toFixed(4)"></td>
                                        <td class="px-2 py-1 text-right" x-text="f.M2.toFixed(4)"></td>
                                        <td class="px-2 py-1 text-right" x-text="f.M3.toFixed(4)"></td>
                                        <td class="px-2 py-1 text-right text-gray-500" x-text="f.phi.toFixed(3)"></td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
        </div>
        <div class="flex justify-end gap-2 px-4 py-2 border-t border-gray-700 bg-gray-900 rounded-b-lg">
            <button @click="copiarTabla()" class="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white">
                Copiar tabla
            </button>
            <button @click="tablaAbierta = false" class="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-500 text-white">
                Cerrar
            </button>
        </div>
    </div>
</div>

{{-- ── Demandas y D/C ──────────────────────────────────────────────────────
     Se pegan las filas tal como salen de ETABS o del Excel del estudio (una por
     combo). El D/C sale de cortar el rayo (0,0,0)→(Pu,M2u,M3u) contra la
     superficie de interacción: la misma definición del manual de CSI. --}}
<div x-show="demandasAbierto" x-cloak
     style="position:fixed; inset:0; z-index:10010; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.6)">
    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700"
         style="width:min(1180px, 96vw); max-height:92vh; display:flex; flex-direction:column; overflow-x:hidden">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">
                Demandas y ratio D/C — <span class="text-gray-400 font-normal" x-text="st().seleccionada"></span>
            </h3>
            <button @click="demandasAbierto = false" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        {{-- El diagrama va PRIMERO: es lo que el ingeniero mira para decidir.
             La tabla queda debajo, con el detalle. Se quitó el cuadro de pegar
             a mano: las demandas salen de la tabla de Pier Forces, que las trae
             con el signo y las unidades ya resueltos. --}}
        {{-- UN SOLO SCROLL. Todo el cuerpo va en este contenedor; ni los
             diagramas quedan fijos ni la tabla tiene el suyo propio. Dos barras
             de scroll anidadas obligan a adivinar cuál mueve qué. --}}
        <div style="flex:1; min-height:0; overflow-y:auto; overflow-x:hidden">

        <div class="px-4 pt-3">
            <button @click="abrirPier()" :disabled="!hayPier()"
                    class="px-3 py-1.5 rounded text-xs font-semibold"
                    :class="hayPier() ? 'bg-sky-600 hover:bg-sky-500 text-white'
                                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'">
                Mostrar tabla de Pier Forces
            </button>
            <span class="text-[10px] text-gray-500 ml-2" x-show="!hayPier()">
                Aparece cuando el modelo tiene muros con <strong>pier</strong> asignado y ya
                corriste el análisis sísmico.
            </span>
            <span class="text-[10px] text-gray-500 ml-2" x-show="hayPier()"
                  x-text="filas().length ? '' : 'Elegí las combinaciones y apretá Calcular.'"></span>
        </div>

        <div class="px-4 pt-3 grid gap-3"
             style="grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)">
            <div x-ref="graficoXX" style="height:340px; min-width:0"></div>
            <div x-ref="graficoYY" style="height:340px; min-width:0"></div>
        </div>

        <div class="p-4">
            <div style="min-width:0">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[11px] text-gray-400">Resultado</span>
                    <span class="text-[11px] font-mono"
                          :class="gobernante() === null ? 'text-gray-500' : gobernante() > 1 ? 'text-red-400' : 'text-emerald-400'"
                          x-text="gobernante() === null ? 'sin calcular' : 'gobernante D/C = ' + gobernante().toFixed(3)"></span>
                </div>
                <div class="border border-gray-700 rounded" style="max-width:100%">
                    <table class="w-full text-xs font-mono" style="table-layout:fixed">
                        <thead class="bg-gray-900 text-gray-400 sticky top-0 z-10">
                            <tr>
                                <th class="px-2 py-1 text-left">Combo</th>
                                <th class="px-2 py-1 text-right" title="Positivo = compresión">P</th>
                                <th class="px-2 py-1 text-right">M2</th>
                                <th class="px-2 py-1 text-right">M3</th>
                                <th class="px-2 py-1 text-right">D/C</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template x-for="(d, i) in demandas()" :key="i">
                                <tr class="border-t border-gray-800"
                                    :class="d.ratio !== null && d.ratio === gobernante() ? 'bg-sky-900/40' : ''">
                                    <td class="px-2 py-1" x-text="d.nombre"></td>
                                    <td class="px-2 py-1 text-right" x-text="d.P.toFixed(2)"></td>
                                    <td class="px-2 py-1 text-right" x-text="d.M2.toFixed(2)"></td>
                                    <td class="px-2 py-1 text-right" x-text="d.M3.toFixed(2)"></td>
                                    <td class="px-2 py-1 text-right font-semibold"
                                        :class="d.ratio === null ? 'text-gray-600' : d.ratio > 1 ? 'text-red-400' : 'text-emerald-400'"
                                        x-text="d.ratio === null ? '—' : d.ratio.toFixed(3)"></td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
                <div x-show="!demandas().length" class="mt-2 text-[11px] text-gray-500">
                    Todavía no hay demandas cargadas.
                </div>
            </div>
        </div>

        </div>{{-- fin del único scroll --}}

        <div class="flex justify-end gap-2 px-4 py-2 border-t border-gray-700 bg-gray-900 rounded-b-lg">
            <span class="mr-auto text-[10px] text-gray-500 self-center">
                Los diagramas miran un momento por vez; el D/C es biaxial. Un punto puede verse
                cómodo en las dos vistas y estar afuera en el biaxial.
            </span>
            <button @click="calcular()" :disabled="st().cargando"
                    class="px-3 py-1.5 text-sm rounded bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40">
                Calcular
            </button>
            <button @click="demandasAbierto = false" class="px-3 py-1.5 text-sm rounded bg-blue-600 hover:bg-blue-500 text-white">
                Cerrar
            </button>
        </div>
    </div>
</div>

{{-- ── Tabla de Pier Forces ────────────────────────────────────────────────
     La calcula el motor a partir del mallado del muro: los shells se agrupan
     por la etiqueta de PIER y se integran en un P/V/M por piso. Es la misma
     tabla que el ingeniero saca de ETABS, pero sin salir de la app.

     El filtro arranca en Bottom + solo combinaciones porque es lo que se usa
     para diseñar: el pie del muro, y contra los combos — un caso espectral
     suelto no tiene gravedad ni factores. --}}
<div x-show="st().pierAbierto" x-cloak
     style="position:fixed; inset:0; z-index:10020; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.65)">
    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700"
         style="width:min(1080px, 96vw); max-height:90vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Pier Forces</h3>
            <button @click="cerrarPier()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="flex flex-wrap items-center gap-3 px-4 py-2 border-b border-gray-700 text-xs">
            <label class="flex items-center gap-1 text-gray-400">
                Pier
                <select @change="elegirPier($event.target.value)"
                        class="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white">
                    <template x-for="p in pierPiers()" :key="p">
                        <option :value="p" :selected="pierFiltro().pier === p" x-text="p"></option>
                    </template>
                </select>
            </label>
            <label class="flex items-center gap-1 text-gray-400">
                Piso
                <select x-model="st().pierFiltro.story"
                        class="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white">
                    {{-- Centinela explícito: un `null` en un <option> llega como la
                         cadena "null", y "" es un piso VÁLIDO (modelo dibujado a
                         mano, sin nombres de piso). --}}
                    <option value="__todos__">Todos</option>
                    <template x-for="e in pierPisos()" :key="e">
                        <option :value="e" x-text="e || '(sin piso)'"></option>
                    </template>
                </select>
            </label>
            <label class="flex items-center gap-1 text-gray-400">
                Ubicación
                <select x-model="st().pierFiltro.location"
                        class="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white">
                    <option value="">Las dos</option>
                    <option value="Bottom">Bottom</option>
                    <option value="Top">Top</option>
                </select>
            </label>
            <label class="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input type="checkbox" x-model="st().pierFiltro.soloCombos" class="accent-sky-500 w-4 h-4">
                <span>Solo combinaciones</span>
            </label>
            <span class="ml-auto text-gray-500" x-text="pierFilas().length + ' filas'"></span>
        </div>

        <div class="overflow-auto flex-1 px-4 py-2">
            <table class="w-full text-xs font-mono">
                <thead class="bg-gray-900 text-gray-400 sticky top-0">
                    <tr>
                        <th class="px-2 py-1 text-left">Piso</th>
                        <th class="px-2 py-1 text-left">Caso</th>
                        {{-- ETABS abre cada combo ± en Max y Min, y las repite
                             para +SDX y −SDX aunque den lo mismo. Se muestran
                             igual: la tabla tiene que poder cruzarse fila por
                             fila con la suya. --}}
                        <th class="px-2 py-1 text-left">Paso</th>
                        <th class="px-2 py-1 text-left">Ubic.</th>
                        <th class="px-2 py-1 text-right" title="Tracción positiva, como ETABS">P</th>
                        <th class="px-2 py-1 text-right">V2</th>
                        <th class="px-2 py-1 text-right">V3</th>
                        <th class="px-2 py-1 text-right">T</th>
                        <th class="px-2 py-1 text-right">M2</th>
                        <th class="px-2 py-1 text-right">M3</th>
                    </tr>
                </thead>
                <tbody>
                    <template x-for="(f, i) in pierFilas()" :key="i">
                        <tr class="border-t border-gray-700/60 text-gray-200">
                            <td class="px-2 py-0.5 text-left text-gray-400" x-text="f.story || '—'"></td>
                            <td class="px-2 py-0.5 text-left" x-text="f.case"></td>
                            <td class="px-2 py-0.5 text-left text-gray-400" x-text="f.stepType || '—'"></td>
                            <td class="px-2 py-0.5 text-left text-gray-400" x-text="f.location"></td>
                            <td class="px-2 py-0.5 text-right" x-text="f.P.toFixed(4)"></td>
                            <td class="px-2 py-0.5 text-right" x-text="f.V2.toFixed(4)"></td>
                            <td class="px-2 py-0.5 text-right" x-text="f.V3.toFixed(4)"></td>
                            <td class="px-2 py-0.5 text-right" x-text="f.T.toFixed(4)"></td>
                            <td class="px-2 py-0.5 text-right" x-text="f.M2.toFixed(4)"></td>
                            <td class="px-2 py-0.5 text-right" x-text="f.M3.toFixed(4)"></td>
                        </tr>
                    </template>
                </tbody>
            </table>
            <div x-show="!pierFilas().length" class="text-center text-gray-500 text-xs py-6">
                No hay filas con ese filtro.
            </div>
        </div>

        <div class="flex justify-end gap-2 px-4 py-2 border-t border-gray-700 bg-gray-900 rounded-b-lg">
            <span class="mr-auto text-[10px] text-gray-500 self-center">
                En tonf y tonf·m. P con tracción positiva, igual que ETABS — al pasarlas a
                demandas se invierte, porque la superficie usa compresión positiva.
            </span>
            <button @click="cerrarPier()" class="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white">
                Cerrar
            </button>
            <button @click="usarPier()" :disabled="!pierFilas().length"
                    class="px-3 py-1.5 text-sm rounded bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40">
                Usar como demandas
            </button>
        </div>
    </div>
</div>

</div>


<script>
function wallDesignModal() {
    return {
        open: false,
        tablaAbierta: false,
        demandasAbierto: false,
        seccion: '',
        code: 'ACI318',
        modo: 'con_phi',
        curva: 0,
        init() {
            window.addEventListener('open-wall-design-modal', () => {
                const s = window.cadSystem?.wallDesignState;
                if (!s) return;
                this.seccion = s.seleccionada;
                this.code = s.code;
                this.modo = s.modo;
                this.curva = s.curva;
                this.open = true;
                // El <canvas> recien existe cuando el modal se muestra.
                this.$nextTick(() => window.cadSystem?.montarCanvasDePlaca?.(this.$refs.lienzo));
            });
        },
        /** El estado vive en el mixin; el modal solo lo lee. NUNCA null. */
        st() {
            return window.cadSystem?.wallDesignState || {
                // `seleccion` es un ARRAY (selección múltiple); en el estado vacío
                // estaba en null y las plantillas le piden `.length`, así que
                // reventaba en cada carga de página aunque el modal no se abriera.
                secciones: [], seleccionada: '', shapes: [], seleccion: [],
                modo: 'con_phi', curva: 0, code: 'ACI318',
                cargando: false, error: null, resultado: null, svg: '', editado: false,
                // Alpine evalúa las expresiones de los hijos aunque el x-show
                // esté en false, así que el estado vacío tiene que traer TODO
                // lo que tocan las plantillas — si no, revienta la página
                // entera antes de que el modal se abra una sola vez.
                demandasTexto: '', compresionNegativa: true,
                pierAbierto: false,
                pierFiltro: { pier: null, story: '__todos__', location: 'Bottom', soloCombos: true },
            };
        },
        resumen()   { return window.cadSystem?.getWallSectionSummary?.() || null; },
        filas()     { return window.cadSystem?.getWallCurveRows?.() || []; },
        objetos()   { return window.cadSystem?.getWallShapeList?.() || []; },
        campos()    { return window.cadSystem?.getWallShapeFields?.() || []; },
        sel()       { return window.cadSystem?.getWallSelectedShape?.() || null; },
        barSizes()  { return window.cadSystem?.getWallBarSizes?.() || []; },

        tipos()     { return window.cadSystem?.getWallShapeTypes?.() || []; },
        agregar(t)  { window.cadSystem?.agregarShapeDePlaca?.(t); },
        duplicar()  { window.cadSystem?.duplicarShapeDePlaca?.(); },
        eliminar()  { window.cadSystem?.eliminarShapeDePlaca?.(); },
        seleccionar(i) { window.cadSystem?.seleccionarShapeDePlaca?.(i); },
        cambiarSeccion() {
            const s = this.st();
            s.seleccionada = this.seccion;
            window.cadSystem?.cargarShapesDePlaca?.();
            window.cadSystem?.refrescarCanvasDePlaca?.(true);
            window.cadSystem?.calcularSuperficieDePlaca?.();   // sección nueva: vale la pena
        },
        cambiarCodigo() {
            this.st().code = this.code;
            window.cadSystem?.calcularSuperficieDePlaca?.();
        },
        cambiarCampo(clave, valor) { window.cadSystem?.setWallShapeField?.(clave, valor); },
        cambiarCasilla(clave, valor) { window.cadSystem?.setWallShapeBool?.(clave, valor); },
        /** El cálculo NO es automático: se pide con el botón. Editar una sección
         *  son muchos toques seguidos y recalcular en cada uno molesta más de lo
         *  que ayuda. */
        async calcular() {
            await window.cadSystem?.calcularSuperficieDePlaca?.();
            this.pintarGraficos();
        },
        demandas()   { return window.cadSystem?.getWallDemandRows?.() || []; },
        gobernante() { return window.cadSystem?.getWallGoverningRatio?.() ?? null; },

        // ── Tabla de Pier Forces (la calcula el motor) ────────────────────
        hayPier()      { return !!window.cadSystem?.hayPierForces?.(); },
        pierPiers()    { return window.cadSystem?.getPierForcesPiers?.() || []; },
        pierPisos()    { return window.cadSystem?.getPierForcesPisos?.() || []; },
        pierFilas()    { return window.cadSystem?.getPierForcesFiltradas?.() || []; },
        pierFiltro()   { return this.st().pierFiltro || {}; },
        abrirPier()    { window.cadSystem?.abrirPierForces?.(); },
        cerrarPier()   { window.cadSystem?.cerrarPierForces?.(); },
        elegirPier(p)  { window.cadSystem?.elegirPierForcesPier?.(p); },
        usarPier() {
            const n = window.cadSystem?.usarPierForcesComoDemandas?.() || 0;
            // Los D/C nuevos hay que pedirlos con Calcular; el diagrama sí se
            // repinta ya, para que se vean los puntos apenas se eligen.
            if (n) this.pintarGraficos();
            return n;
        },
        // Plotly mide el div para dimensionarse: sobre algo oculto o recién
        // insertado sale de 0x0. Por eso siempre en $nextTick.
        pintarGraficos() {
            this.$nextTick(() => {
                window.cadSystem?.renderWallInteractionChart?.(this.$refs.graficoXX, "XX");
                window.cadSystem?.renderWallInteractionChart?.(this.$refs.graficoYY, "YY");
            });
        },
        puedeGuardar() { return !!window.cadSystem?.puedeGuardarPlaca?.(); },
        guardar() { window.cadSystem?.guardarSeccionDePlaca?.(); },
        guardarComo() {
            const n = prompt("Nombre de la sección nueva:", this.seccion + " (copia)");
            if (!n) return;
            if (window.cadSystem?.guardarSeccionDePlacaComo?.(n)) this.seccion = n.trim();
        },
        cambiarBarra(clave, valor) { window.cadSystem?.setWallShapeBar?.(clave, valor); },
        restaurar() { window.cadSystem?.resetWallShapes?.(); },
        copiarTabla() {
            const filas = this.filas();
            if (!filas.length) return;
            const txt = ['Point\tP tonf\tM2 tonf-m\tM3 tonf-m']
                .concat(filas.map(f => `${f.punto}\t${f.P.toFixed(4)}\t${f.M2.toFixed(4)}\t${f.M3.toFixed(4)}`))
                .join('\n');
            navigator.clipboard?.writeText(txt);
            window.cadSystem?.showMessage?.('Tabla copiada al portapapeles', 'success');
        },
        /** Esc: primero sale del modo colocar, si no deselecciona. Nunca cierra. */
        escape(ev) {
            if (!this.open) return;
            ev.stopPropagation();
            if (this.tablaAbierta) { this.tablaAbierta = false; return; }
            if (this.demandasAbierto) { this.demandasAbierto = false; return; }
            if (this.st().modoCanvas === 'polilinea') { this.setModo('seleccionar'); return; }
            if (this.st().modoCanvas === 'colocar') { this.setModo('seleccionar'); return; }
            this.seleccionar(null);
        },
        seleccionada(i) { return !!window.cadSystem?.estaSeleccionadaEnPlaca?.(i); },
        puedeDeshacer() { return !!window.cadSystem?.puedeDeshacerPlaca?.(); },
        puedeRehacer()  { return !!window.cadSystem?.puedeRehacerPlaca?.(); },
        deshacer()      { window.cadSystem?.deshacerPlaca?.(); },
        rehacer()       { window.cadSystem?.rehacerPlaca?.(); },
        /** Supr borra, Ctrl+Z deshace, Ctrl+Y (o Ctrl+Shift+Z) rehace.
         *  Se ignora si el foco está en un input: ahí Supr es borrar texto. */
        teclas(ev) {
            if (!this.open || this.tablaAbierta) return;
            const et = (ev.target?.tagName || "").toUpperCase();
            if (et === "INPUT" || et === "SELECT" || et === "TEXTAREA") return;
            if (ev.key === "Delete" || ev.key === "Del") { ev.preventDefault(); this.eliminar(); return; }
            if (!(ev.ctrlKey || ev.metaKey)) return;
            const k = ev.key.toLowerCase();
            if (k === "z" && !ev.shiftKey) { ev.preventDefault(); this.deshacer(); }
            else if (k === "y" || (k === "z" && ev.shiftKey)) { ev.preventDefault(); this.rehacer(); }
        },
        setModo(x)     { window.cadSystem?.setModoCanvasDePlaca?.(x); },
        alternarSnap() { window.cadSystem?.alternarSnapDePlaca?.(); },
        encuadrar()    { window.cadSystem?.encuadrarCanvasDePlaca?.(); },
        close() {
            this.open = false;
            window.cadSystem?.desmontarCanvasDePlaca?.();
        },
    };
}
</script>
