{{-- resources/views/components/cad/modals/columna-design-modal.blade.php
     Resultados de "Diseñar Columna(s) Seleccionada(s)". Solo columnas
     rectangulares (PATTERN "R-n2-n3") o circulares (PATTERN "C-n") con armado real del .e2k —
     ver plan de columnas. cadSystem.openRcColumnDesignDialog() dispara
     'open-columna-design-modal' con { columns: [...] } (ver
     resources/js/cad/mixins/analysis/rcColumnDesign.js). --}}
{{-- Aviso de progreso. Va FUERA del modal porque el cálculo corre ANTES de
     que el modal se abra: si estuviera adentro no se vería nunca. --}}
<div x-data="{ corriendo: false, listas: 0, total: 0 }"
     @column-design-progress.window="corriendo = $event.detail.corriendo; listas = $event.detail.listas; total = $event.detail.total"
     x-show="corriendo" x-cloak
     style="position:fixed; inset:0; z-index:10050; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.55)">
    <div class="bg-gray-800 border border-gray-700 rounded-lg px-6 py-5 text-center shadow-xl" style="min-width:280px">
        <svg class="animate-spin mx-auto mb-3 h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <div class="text-sm text-white font-semibold">Diseñando columnas…</div>
        <div class="text-xs text-gray-400 mt-1">
            <span x-text="listas"></span> de <span x-text="total"></span>
        </div>
        <div class="mt-2 h-1.5 w-full rounded bg-gray-700 overflow-hidden">
            <div class="h-full bg-blue-500 transition-all duration-200"
                 :style="'width:' + (total ? Math.round(100 * listas / total) : 0) + '%'"></div>
        </div>
        <div class="text-[10px] text-gray-500 mt-2 leading-tight">
            Se calcula la superficie P-M-M y cada combo por separado.
        </div>
    </div>
</div>

<div x-data="columnaDesignModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:min(1100px, 96vw); max-height:92vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">
                Diseño de Columnas de Concreto Armado
                <span class="text-[11px] font-normal text-blue-300"
                      x-text="code === 'ACI318' ? '(ACI 318)' : '(E.060)'"></span>
            </h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200 overflow-auto">
            {{-- Selector de codigo: cambia los factores de reduccion φ Y su ley de
                 transicion (ver PHI_BY_CODE / _phi_factor_e060 en
                 python-backend/design/column_interaction.py). Re-corre el motor. --}}
            <div class="mb-3 flex items-center gap-3 rounded-md bg-gray-900/60 border border-gray-700 px-3 py-2">
                <span class="text-[11px] text-gray-400 shrink-0">Código de diseño:</span>
                <div class="flex gap-1">
                    <button @click="cambiarCodigo('E060')" :disabled="recalculando"
                            :class="code === 'E060' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
                            class="px-3 py-1 rounded text-[11px] font-semibold disabled:opacity-50">
                        E.060 (Perú)
                    </button>
                    <button @click="cambiarCodigo('ACI318')" :disabled="recalculando"
                            :class="code === 'ACI318' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
                            class="px-3 py-1 rounded text-[11px] font-semibold disabled:opacity-50">
                        ACI 318
                    </button>
                </div>
                <span class="text-[10px] text-gray-500"
                      x-text="code === 'ACI318'
                        ? 'φ compresión 0.65 (estribos) · cortante 0.75 · transición por deformación del acero'
                        : 'φ compresión 0.70 (estribos) · cortante 0.85 · transición por carga axial (Art. 10.3.2)'"></span>
                <span x-show="recalculando" class="text-[10px] text-amber-400 ml-auto shrink-0">Recalculando…</span>
                {{-- Los resultados se conservan entre aperturas (cache por columnas +
                     codigo + LLRF). Si cambiaste el modelo, este boton fuerza el
                     recalculo. --}}
                <button @click="recalcular()" :disabled="recalculando"
                        class="ml-auto px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-[11px] disabled:opacity-50"
                        title="Vuelve a correr el analisis y el diseno desde cero">
                    ↻ Recalcular
                </button>
            </div>

            {{-- Reducción de sobrecarga. En ETABS es una asignación EXPLÍCITA por
                 barra (Assign ▸ Frame ▸ Live Load Reduction Factor) que NO viaja en
                 el .e2k, así que no hay forma de saber desde el archivo si el
                 proyectista la activó. Apagarla es lo que permite comparar contra un
                 modelo de ETABS que reporta P sin reducir. --}}
            <div class="mb-3 flex items-center gap-3 rounded-md bg-gray-900/60 border border-gray-700 px-3 py-2">
                <label class="flex items-center gap-2 text-[11px] text-gray-300 shrink-0 cursor-pointer">
                    <input type="checkbox" x-model="llrfOn" @change="cambiarLlrf($event.target.checked)"
                           :disabled="recalculando" class="accent-blue-600">
                    Reducir sobrecarga (LLRF)
                </label>
                <span class="text-[10px] text-gray-500"
                      x-text="llrfOn
                        ? 'ASCE 7-16 §4.7.2 / E.020 Art. 10 — reduce el Pu de los combos con carga viva.'
                        : 'Sin reducir: Pu con la sobrecarga íntegra. Es lo que hay que usar para comparar contra un ETABS que no la tenga asignada.'"></span>
            </div>

            <p class="text-[11px] text-gray-400 mb-3">
                Verificación biaxial calculada por el método de fibra exactamente en el ángulo real de cada punto de
                demanda (sin interpolación entre curvas). Columnas rectangulares (estribos) y circulares (espiral) con armado real del .e2k. Verifica
                siempre con criterio de ingeniería.
            </p>

            <template x-for="col in columns" :key="col.frameId">
                <div class="mb-6 rounded-lg border border-gray-700 overflow-hidden">
                    <div class="bg-gray-900 px-4 py-2 text-white font-bold flex items-center justify-between">
                        <span x-text="col.label"></span>
                        <span x-show="!col.unsupported"
                              :class="overallStatus(col) === 'OK' ? 'text-green-400' : 'text-red-400'"
                              x-text="overallStatus(col)"></span>
                    </div>

                    <template x-if="col.unsupported">
                        <div class="px-4 py-3 bg-gray-800">
                            <div class="text-amber-400 text-xs mb-2">
                                No soportada: <span x-text="col.unsupportedReason"></span>
                            </div>
                            <template x-if="col.sectionName && col.b > 0 && col.h > 0">
                                <button @click="defineRebar(col)"
                                        class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs">
                                    Definir armado de la sección "<span x-text="col.sectionName"></span>"...
                                </button>
                            </template>
                        </div>
                    </template>

                    <template x-if="!col.unsupported">
                        <div class="bg-gray-800 divide-y divide-gray-700">
                            {{-- Geometría + armado --}}
                            <div class="px-4 py-2 grid grid-cols-3 gap-2 text-xs">
                                <div>
                                    <span class="text-gray-400" x-text="col.geometryDisplay.shape === 'circular' ? 'Diámetro:' : 'b × h:'"></span>
                                    <b x-text="col.geometryDisplay.shape === 'circular'
                                        ? ('Ø ' + col.geometryDisplay.diameter + ' cm')
                                        : (col.geometryDisplay.b + ' × ' + col.geometryDisplay.h + ' cm')"></b>
                                </div>
                                <div><span class="text-gray-400">f'c / fy:</span> <b x-text="col.geometryDisplay.fc + ' / ' + col.geometryDisplay.fy + ' kg/cm²'"></b></div>
                                <div><span class="text-gray-400">Recub.:</span> <b x-text="col.geometryDisplay.cover + ' cm'"></b></div>
                                {{-- El patrón se rotula según la FORMA: una circular mostraba
                                     "R-undefined-undefined" porque este texto estaba cableado al
                                     caso rectangular. --}}
                                <div x-show="col.geometryDisplay.shape === 'circular'">
                                    <span class="text-gray-400">Patrón:</span>
                                    <b x-text="'C-' + col.geometryDisplay.pattern.n"></b>
                                    <span class="text-[10px] text-gray-500">(<span x-text="col.geometryDisplay.pattern.n"></span> varillas en anillo · <span x-text="col.geometryDisplay.transReinf"></span>)</span>
                                </div>
                                <div x-show="col.geometryDisplay.shape !== 'circular'">
                                    <span class="text-gray-400">Patrón:</span>
                                    <b x-text="'R-' + col.geometryDisplay.pattern.n2 + '-' + col.geometryDisplay.pattern.n3"></b>
                                    <span class="text-[10px] text-gray-500">(n2=<span x-text="col.geometryDisplay.pattern.n2"></span> cara 2, n3=<span x-text="col.geometryDisplay.pattern.n3"></span> cara 3 — mismo orden que ETABS)</span>
                                </div>
                                <div><span class="text-gray-400">Varillas:</span> <b x-text="col.surface.bars.length + ' Ø' + fmt(col.geometryDisplay.longBarDiameter * 1000, 1) + 'mm'"></b></div>
                                <div><span class="text-gray-400">β1:</span> <b x-text="fmt(col.surface.beta1, 2)"></b></div>
                            </div>

                            {{-- Reducción de sobrecarga (el "LLRF" de ETABS). Se muestra con TODAS
                                 sus entradas porque es un dato que el revisor tiene que poder
                                 rastrear, no un factor que aparece de la nada. --}}
                            <template x-if="col.liveLoadReduction">
                                <div class="px-4 py-1.5 text-[11px]"
                                     :class="col.liveLoadReduction.aplica ? 'text-amber-300/90' : 'text-gray-500'">
                                    <b>Reducción de sobrecarga:</b>
                                    <template x-if="col.liveLoadReduction.aplica">
                                        <span>
                                            LLRF = <b x-text="fmt(col.liveLoadReduction.factor, 4)"></b>
                                            — área tributaria <span x-text="fmt(col.liveLoadReduction.areaTributaria, 2)"></span> m²
                                            en <span x-text="col.liveLoadReduction.pisos"></span> piso(s),
                                            Ai = K<sub>LL</sub>·A<sub>T</sub> = <span x-text="col.liveLoadReduction.kll"></span>·<span x-text="fmt(col.liveLoadReduction.areaTributaria, 2)"></span>
                                            = <span x-text="fmt(col.liveLoadReduction.ai, 1)"></span> m²
                                            <span class="text-gray-500">(<span x-text="col.liveLoadReduction.referencia"></span>)</span>
                                        </span>
                                    </template>
                                    {{-- Tres estados, no dos: aplicada, no-aplica-por-umbral, y
                                         APAGADA desde el panel. Sin este último la línea salía
                                         "Ai = - m² < m² de umbral ()" con todo vacío, porque no hay
                                         área ni norma que mostrar cuando ni se llegó a calcular. --}}
                                    <template x-if="col.liveLoadReduction.desactivada">
                                        <span>desactivada en el panel — Pu con la sobrecarga íntegra.</span>
                                    </template>
                                    {{-- ETABS distingue "Live" de "Reducible Live" y solo reduce el
                                         segundo, aunque muestre el factor en los dos. Si el .e2k trae
                                         "Live" a secas, no reducir es exactamente lo que hace ETABS. --}}
                                    <template x-if="col.liveLoadReduction.noReducible">
                                        <span>no aplica — el patrón de carga viva del modelo es <b>"Live"</b>,
                                            no <b>"Reducible Live"</b>. ETABS calcula el factor pero tampoco lo aplica.</span>
                                    </template>
                                    <template x-if="!col.liveLoadReduction.aplica && !col.liveLoadReduction.desactivada && !col.liveLoadReduction.noReducible">
                                        <span>
                                            no aplica — Ai = <span x-text="fmt(col.liveLoadReduction.ai, 1)"></span> m²
                                            &lt; <span x-text="col.liveLoadReduction.umbral"></span> m² de umbral
                                            (<span x-text="col.liveLoadReduction.referencia"></span>)
                                        </span>
                                    </template>
                                </div>
                            </template>

                            {{-- Demanda + verificación, base y tope. El combo es seleccionable — por
                                 defecto el gobernante (mayor ratio), pero se puede elegir cualquier
                                 otro combo real para comparar puntualmente contra ETABS. --}}
                            <table class="min-w-full text-xs">
                                <thead class="bg-gray-700 text-white">
                                    <tr>
                                        <th class="px-2 py-1 text-left">Estación</th>
                                        <th class="px-2 py-1 text-left">Combo</th>
                                        <th class="px-2 py-1 text-right">Pu (tonf)</th>
                                        <th class="px-2 py-1 text-right">M2u (tonf-m)</th>
                                        <th class="px-2 py-1 text-right">M3u (tonf-m)</th>
                                        <th class="px-2 py-1 text-right">θ demanda</th>
                                        <th class="px-2 py-1 text-right">ФMn cap. (tonf-m)</th>
                                        <th class="px-2 py-1 text-right">Ratio</th>
                                        <th class="px-2 py-1 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="station in ['base','top']" :key="station">
                                        <tr class="border-t border-gray-700">
                                            <td class="px-2 py-1" x-text="station === 'base' ? 'Base' : 'Tope'"></td>
                                            <td class="px-1 py-1">
                                                {{-- SIN x-model a propósito.
                                                     Con `x-model` sobre un <select> cuyas <option> las
                                                     genera un x-for, Alpine fija el value del DOM ANTES
                                                     de que existan las opciones, y el navegador cae a la
                                                     primera: el combo mostrado no era el gobernante
                                                     aunque los números de la fila sí lo fueran.
                                                     `:selected` se evalúa cuando la opción se renderiza,
                                                     así que sale bien desde el primer pintado, y el
                                                     @change escribe el modelo a mano.
                                                     (Un intento previo de arreglarlo con x-init rompió
                                                     Alpine.start() entero — no repetir ese camino.) --}}
                                                <select class="bg-gray-900 border border-gray-600 rounded text-[11px] text-gray-200 px-1 py-0.5 max-w-[220px]"
                                                        @change="col.selectedComboId[station] = $event.target.value; drawInteraction(col)">
                                                    <template x-for="opt in col.checksAll[station]" :key="opt.comboId">
                                                        <option :value="opt.comboId"
                                                                :selected="opt.comboId === col.selectedComboId[station]"
                                                                x-text="(opt.comboId === col.check[station]?.comboId ? '★ ' : '') + opt.comboName + ' (' + fmt(opt.ratio, 3) + ')'">
                                                        </option>
                                                    </template>
                                                </select>
                                            </td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.P / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.M2 / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.M3 / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.thetaDeg, 1) + '°'"></td>
                                            <td class="px-2 py-1 text-right" x-text="fmt(selectedCheck(col, station)?.phiMnCap / 9806.65, 2)"></td>
                                            <td class="px-2 py-1 text-right font-semibold" x-text="fmt(selectedCheck(col, station)?.ratio, 3)"></td>
                                            <td class="px-2 py-1 text-center font-bold"
                                                :class="selectedCheck(col, station)?.status === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                x-text="selectedCheck(col, station)?.status || '—'"></td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                            <div class="px-2 pb-1 text-[10px] text-gray-500">★ = combo gobernante (mayor ratio, el que se usa para el estado OK/NG del encabezado).</div>

                            {{-- Diagrama de interacción P-M2-M3 — el equivalente al botón
                                 "Interaction" de ETABS. Los datos ya vienen calculados en
                                 col.surface.curves; el trazado vive en
                                 resources/js/cad/mixins/analysis/columnInteractionChart.js.

                                 Los contenedores de los gráficos van con x-show y NO dentro de
                                 un x-if: Plotly guarda estado en el nodo, así que si el div se
                                 destruye y se recrea en cada toggle quedan instancias huérfanas. --}}
                            <div class="px-4 py-2">
                                <div class="flex items-center gap-3 flex-wrap">
                                    <button @click="toggleInteraction(col)"
                                            class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs">
                                        <span x-text="ciOpen[col.frameId] ? 'Ocultar' : 'Ver'"></span> diagrama de interacción
                                    </button>
                                    <template x-if="ciOpen[col.frameId]">
                                        <div class="flex items-center gap-3 text-[11px] text-gray-400">
                                            <label class="flex items-center gap-1">
                                                Estación:
                                                <select x-model="ciStation[col.frameId]" @change="resetInteractionAngle(col)"
                                                        class="bg-gray-900 border border-gray-600 rounded text-[11px] text-white px-2 py-0.5">
                                                    <option value="base">Base</option>
                                                    <option value="top">Tope</option>
                                                </select>
                                            </label>
                                            <label class="flex items-center gap-1 cursor-pointer">
                                                <input type="checkbox" x-model="ciPhi[col.frameId]" @change="drawInteraction(col)"
                                                       class="rounded bg-gray-900 border-gray-600">
                                                Incluir Φ
                                                <span class="text-gray-600">(ETABS: Include Phi)</span>
                                            </label>
                                        </div>
                                    </template>
                                </div>

                                <div x-show="ciOpen[col.frameId]" class="mt-2">
                                    {{-- Recorrido del ángulo de corte. ETABS salta de curva en curva con
                                         flechas (24 curvas fijas); acá se interpola continuo, así que el
                                         control es un deslizador. Mueve el corte del 3D y la curva del 2D
                                         a la vez. --}}
                                    <div class="flex items-center gap-2 flex-wrap text-[11px] text-gray-400 mb-2">
                                        <span>Ángulo del corte θ:</span>
                                        <input type="range" min="0" max="360" step="0.5"
                                               x-model.number="ciAngle[col.frameId]" @input="drawInteraction(col)"
                                               class="w-40 accent-purple-500">
                                        <input type="number" min="0" max="360" step="0.5"
                                               x-model.number="ciAngle[col.frameId]" @input="drawInteraction(col)"
                                               class="w-16 bg-gray-900 border border-gray-600 rounded text-white px-1 py-0.5 text-[11px]">
                                        <span>°</span>
                                        <button @click="resetInteractionAngle(col)"
                                                class="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-[10px]">
                                            Volver al de la demanda (<span x-text="fmt(demandAngle(col), 1)"></span>°)
                                        </button>
                                        <span x-show="!enAnguloDeDemanda(col)" class="text-amber-400/90 text-[10px]">
                                            — el corte no está en el ángulo de la demanda; el rombo es referencia
                                        </span>
                                    </div>

                                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-2">
                                        <div class="lg:col-span-2 rounded border border-gray-700 bg-gray-900"
                                             :id="'ci-plot-' + col.frameId" style="height:380px"></div>
                                        <div class="rounded border border-gray-700 bg-gray-900"
                                             :id="'ci-2d-' + col.frameId" style="height:380px"></div>
                                    </div>

                                    {{-- Planos P-M33 y P-M22, el formato de la plantilla Excel del
                                         cliente. A diferencia del corte libre de arriba, acá el ángulo
                                         es FIJO (M33 = plano de θ 0/180, M22 = θ 90/270), el momento va
                                         CON SIGNO para que cierre el lazo de ±M, y se ven las DOS
                                         curvas juntas — nominal y reducida — en vez de alternarlas con
                                         el checkbox. Mismos datos que la tabla Curve Data. --}}
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-3">
                                        <div class="rounded border border-gray-700 bg-gray-900"
                                             :id="'ci-pm33-' + col.frameId" style="height:340px"></div>
                                        <div class="rounded border border-gray-700 bg-gray-900"
                                             :id="'ci-pm22-' + col.frameId" style="height:340px"></div>
                                    </div>
                                    <div class="text-[10px] text-gray-500 mt-1">
                                        Cortes en los planos principales, con el momento con signo (lazo cerrado ±M)
                                        y las dos curvas superpuestas: <b class="text-lime-400">Nominal</b> (sin Φ, el
                                        "Exclude Phi" de ETABS) y <b class="text-blue-400">Reducida</b> (con Φ).
                                        Los círculos grises son <b>todas</b> las combinaciones de la estación; el
                                        cuadrado es el <b>gobernante</b>. Pasá el mouse por cualquiera para ver su combo y su ratio.
                                        <span class="block mt-0.5">Cada punto se proyecta sobre el eje de ESTE plano, así que una
                                        demanda biaxial se ve más cerca del origen de lo que realmente está — el ratio de la tabla
                                        es el biaxial real. Por eso el gobernante puede no ser el punto que se ve más afuera acá.</span>
                                    </div>

                                    <div class="text-[10px] text-gray-500 mt-1">
                                        Superficie ΦMn de las <span x-text="col.surface.curves?.length || 0"></span> curvas del motor,
                                        truncada arriba por el tope Pn,max = 0.80·Po (ACI 318 Tabla 22.4.2.1) — esa es la meseta plana.
                                        A la derecha, el mismo corte visto de perfil (el "Current Interaction Curve" de ETABS),
                                        con M = momento resultante √(M2²+M3²). La línea punteada desde el origen es el rayo de la demanda.
                                        Compresión positiva, igual que ETABS.
                                    </div>

                                    {{-- Tabla de fuerzas por combinación, el formato con el que
                                         trabaja la hoja del cliente: M33/Pu para el plano P-M33 y
                                         M22/Pu para el P-M22. Es la MISMA lista que dibuja la nube
                                         de los gráficos de arriba, así que no pueden discrepar. --}}
                                    <details class="mt-3 rounded border border-gray-700 bg-gray-900/60">
                                        <summary class="cursor-pointer select-none px-3 py-1.5 text-[11px] text-blue-300 hover:bg-gray-700/40">
                                            Fuerzas por combinación (<span x-text="combosDeDiseno(col, ciStation[col.frameId] || 'base').length"></span>)
                                        </summary>
                                        <div class="px-3 pb-2 overflow-x-auto">
                                            <table class="min-w-full text-[11px] tabular-nums">
                                                <thead class="text-gray-400">
                                                    <tr class="border-b border-gray-700">
                                                        <th class="px-2 py-1 text-left font-semibold">Combo</th>
                                                        <th class="px-2 py-1 text-right font-semibold">M33</th>
                                                        <th class="px-2 py-1 text-right font-semibold">Pu</th>
                                                        <th class="px-2 py-1 text-right font-semibold border-l border-gray-700">M22</th>
                                                        <th class="px-2 py-1 text-right font-semibold">Pu</th>
                                                        <th class="px-2 py-1 text-right font-semibold border-l border-gray-700">Ratio</th>
                                                    </tr>
                                                    <tr class="text-[9px] text-gray-600">
                                                        <th></th>
                                                        <th class="px-2 text-right">tonf·m</th>
                                                        <th class="px-2 text-right">tonf</th>
                                                        <th class="px-2 text-right border-l border-gray-700">tonf·m</th>
                                                        <th class="px-2 text-right">tonf</th>
                                                        <th class="border-l border-gray-700"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <template x-for="(c, i) in combosDeDiseno(col, ciStation[col.frameId] || 'base')" :key="i">
                                                        <tr class="border-t border-gray-800"
                                                            :class="esGobernante(col, c) ? 'bg-amber-500/10 text-amber-200 font-semibold' : 'text-gray-300'">
                                                            <td class="px-2 py-0.5 text-left whitespace-nowrap">
                                                                <span x-text="c.comboName || c.comboId"></span>
                                                                <span x-show="esGobernante(col, c)" class="text-amber-400">★</span>
                                                            </td>
                                                            <td class="px-2 py-0.5 text-right" x-text="fmt(c.M3 / 9806.65, 2)"></td>
                                                            <td class="px-2 py-0.5 text-right" x-text="fmt(c.P / 9806.65, 2)"></td>
                                                            <td class="px-2 py-0.5 text-right border-l border-gray-800" x-text="fmt(c.M2 / 9806.65, 2)"></td>
                                                            <td class="px-2 py-0.5 text-right" x-text="fmt(c.P / 9806.65, 2)"></td>
                                                            <td class="px-2 py-0.5 text-right border-l border-gray-800" x-text="fmt(c.ratio, 4)"></td>
                                                        </tr>
                                                    </template>
                                                </tbody>
                                            </table>
                                            <div class="text-[10px] text-gray-500 mt-1">
                                                La columna Pu se repite a propósito: es la misma para los dos planos, y así cada
                                                par (M33, Pu) y (M22, Pu) se lee tal cual se grafica. ★ = combo gobernante.
                                            </div>
                                        </div>
                                    </details>

                                    {{-- Las 24 curvas completas, en el layout ANCHO de ETABS: una fila
                                         por punto y tres columnas por curva. Es el mismo formato que
                                         exporta ETABS y que pega la plantilla en INPUT DI, así que se
                                         compara columna contra columna sin reordenar. --}}
                                    <details class="mt-3 rounded border border-gray-700 bg-gray-900/60">
                                        <summary class="cursor-pointer select-none px-3 py-1.5 text-[11px] text-blue-300 hover:bg-gray-700/40">
                                            Las 24 curvas del diagrama (formato ETABS)
                                        </summary>
                                        <div class="px-3 pb-2">
                                            <div class="flex items-center gap-3 py-1.5 text-[11px] text-gray-400 flex-wrap">
                                                <label class="flex items-center gap-1 cursor-pointer">
                                                    <input type="checkbox" x-model="curvas24Phi" class="accent-blue-600">
                                                    Con Φ (reducida)
                                                </label>
                                                <span class="text-gray-600" x-text="curvas24Phi ? '= INPUT DI REDUCIDO' : '= INPUT DI NOMINAL'"></span>
                                                <button @click="copiarCurvas(col)"
                                                        class="ml-auto px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px]">
                                                    <span x-text="curvasCopiadas ? '¡Copiado!' : 'Copiar CSV'"></span>
                                                </button>
                                            </div>
                                            <div class="overflow-auto max-h-[420px] border border-gray-700 rounded">
                                                <table class="text-[10px] tabular-nums whitespace-nowrap">
                                                    {{-- UN solo x-for por fila, sobre la lista PLANA.
                                                         Con `<template x-for>` anidado dentro de un <tr>
                                                         la columna rotulada "Curve #1" mostraba los
                                                         valores de la #2. Encabezado y cuerpo salen de
                                                         la misma enumeracion (`flatHeaders` / `values`),
                                                         asi que no pueden desalinearse. --}}
                                                    <thead class="bg-gray-700 text-white sticky top-0">
                                                        <tr>
                                                            <th class="px-2 py-1 sticky left-0 bg-gray-700 z-10">Point</th>
                                                            <template x-for="h in curvas24(col).flatHeaders" :key="h.curva + h.campo">
                                                                <th class="px-2 py-1 text-center"
                                                                    :class="h.primera ? 'border-l border-gray-600' : ''">
                                                                    <span x-show="h.primera">Curve #<span x-text="h.curva"></span></span>
                                                                    <span class="block text-[9px] font-normal text-gray-300"
                                                                          x-text="h.primera ? h.angulo + ' deg' : ''"></span>
                                                                </th>
                                                            </template>
                                                        </tr>
                                                        <tr class="text-[9px] text-gray-300 bg-gray-800">
                                                            <th class="px-2 py-0.5 sticky left-0 bg-gray-800 z-10"></th>
                                                            <template x-for="h in curvas24(col).flatHeaders" :key="h.curva + h.campo">
                                                                <th class="px-2 py-0.5 text-right font-normal"
                                                                    :class="h.primera ? 'border-l border-gray-700' : ''"
                                                                    x-text="h.campo + '  ' + h.unidad"></th>
                                                            </template>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <template x-for="r in curvas24(col).rows" :key="r.point">
                                                            <tr class="border-t border-gray-800 text-gray-300">
                                                                <td class="px-2 py-0.5 sticky left-0 bg-gray-900 font-semibold" x-text="r.point"></td>
                                                                <template x-for="(v, i) in r.values" :key="i">
                                                                    <td class="px-2 py-0.5 text-right"
                                                                        :class="i % 3 === 0 ? 'border-l border-gray-800' : ''"
                                                                        x-text="v === null ? '' : fmt(v, 4)"></td>
                                                                </template>
                                                            </tr>
                                                        </template>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div class="text-[10px] text-gray-500 mt-1">
                                                Mismos datos que dibujan los gráficos de arriba. Compresión positiva, igual que ETABS.
                                                <span class="block mt-0.5 text-amber-400/80">Ojo al comparar: ETABS reporta <b>11</b> puntos por curva
                                                y nosotros <b>23</b> (malla más fina), así que las filas <b>no</b> alinean 1 a 1.
                                                Hay que cruzar por el valor de P, no por el número de punto.</span>
                                            </div>
                                        </div>
                                    </details>

                                    {{-- Tabla "Curve Data" — los numeros detras del corte dibujado,
                                         mismo formato que la del dialogo de ETABS. Sirve para cruzar
                                         punto por punto contra su tabla. --}}
                                    <details class="mt-2 rounded border border-gray-700 bg-gray-900/60">
                                        <summary class="cursor-pointer px-3 py-1.5 text-[11px] text-blue-300 hover:text-blue-200">
                                            Curve Data — puntos de la curva (<span x-text="curveRows(col).length"></span>)
                                        </summary>
                                        <div class="px-3 pb-2 pt-1">
                                            <div class="flex items-center gap-2 mb-1">
                                                <button @click="copiarCurva(col)"
                                                        class="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-[10px]">
                                                    Copiar como TSV
                                                </button>
                                                <span class="text-[10px] text-gray-500" x-text="copiadoMsg[col.frameId] || 'Se pega directo en Excel, al lado de la tabla de ETABS'"></span>
                                            </div>
                                            <div style="max-height:220px; overflow:auto">
                                                <table class="w-full text-[10px]">
                                                    <thead class="text-gray-500 sticky top-0 bg-gray-900">
                                                        <tr>
                                                            <th class="text-left py-0.5">Punto</th>
                                                            <th class="text-right">P (tonf)</th>
                                                            <th class="text-right">M2 (tonf·m)</th>
                                                            <th class="text-right">M3 (tonf·m)</th>
                                                            <th class="text-right">|M|</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="text-gray-300">
                                                        <template x-for="r in curveRows(col)" :key="r.n">
                                                            <tr class="border-t border-gray-800">
                                                                <td class="py-0.5" x-text="r.n"></td>
                                                                <td class="text-right" x-text="fmt(r.P, 4)"></td>
                                                                <td class="text-right" x-text="fmt(r.M2, 4)"></td>
                                                                <td class="text-right" x-text="fmt(r.M3, 4)"></td>
                                                                <td class="text-right text-gray-500" x-text="fmt(r.M, 4)"></td>
                                                            </tr>
                                                        </template>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <p class="text-[9px] text-gray-600 mt-1.5 leading-tight">
                                                Va de compresión pura hacia tracción, como ETABS. Las filas consecutivas
                                                idénticas se colapsan. Los dos extremos son exactos: el primero es
                                                φ·0.80·Po (tope axial) y el último φ·fy·As (tracción pura), los mismos
                                                valores que reporta ETABS. En medio, la resolución la da el barrido:
                                                la esquina de la meseta queda algo redondeada.
                                            </p>
                                        </div>
                                    </details>
                                </div>
                            </div>
                            </div>

                            {{-- Esbeltez / magnificacion de momentos (E.060 10.12) — solo del
                                 combo gobernante de cada estacion; el detalle por combo viaja
                                 igual en check.slenderness. --}}
                            <template x-for="station in ['base','top']" :key="'sl-'+station">
                                <div class="px-4 py-2" x-show="slenderInfo(col, station)">
                                    <div class="text-xs font-semibold text-gray-300 mb-1">
                                        Esbeltez — <span x-text="station === 'base' ? 'base' : 'tope'"></span>
                                        <span class="font-normal text-gray-500">(E.060 Art. 10.12, pórtico arriostrado)</span>
                                    </div>
                                    <table class="w-full text-[11px] border border-gray-700">
                                        <thead class="bg-gray-700 text-white">
                                            <tr>
                                                <th class="px-2 py-1 text-left">Eje</th>
                                                <th class="px-2 py-1 text-right">k·Lu/r</th>
                                                <th class="px-2 py-1 text-right">Límite</th>
                                                <th class="px-2 py-1 text-center">¿Esbelta?</th>
                                                <th class="px-2 py-1 text-right">Cm</th>
                                                <th class="px-2 py-1 text-right">Pc (tonf)</th>
                                                <th class="px-2 py-1 text-right">δns</th>
                                                <th class="px-2 py-1 text-right">M análisis</th>
                                                <th class="px-2 py-1 text-right">M diseño</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <template x-for="eje in ['M2','M3']" :key="'sl-'+station+eje">
                                                <tr class="border-t border-gray-700" x-show="slenderInfo(col, station)?.[eje]">
                                                    <td class="px-2 py-1" x-text="eje"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(slenderInfo(col, station)?.[eje]?.slendernessRatio, 1)"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(slenderInfo(col, station)?.[eje]?.slendernessLimit, 1)"></td>
                                                    <td class="px-2 py-1 text-center"
                                                        :class="slenderInfo(col, station)?.[eje]?.isSlender ? 'text-amber-400 font-semibold' : 'text-gray-500'"
                                                        x-text="slenderInfo(col, station)?.[eje]?.isSlender ? 'Sí' : 'No'"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(slenderInfo(col, station)?.[eje]?.cm, 3)"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmtTon(slenderInfo(col, station)?.[eje]?.pc)"></td>
                                                    <td class="px-2 py-1 text-right"
                                                        :class="slenderInfo(col, station)?.[eje]?.unstable ? 'text-red-400 font-bold' : ''"
                                                        x-text="slenderInfo(col, station)?.[eje]?.unstable ? 'INESTABLE' : fmt(slenderInfo(col, station)?.[eje]?.deltaNs, 3)"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmtTonM(slenderInfo(col, station)?.[eje]?.m2)"></td>
                                                    <td class="px-2 py-1 text-right font-semibold" x-text="fmtTonM(slenderInfo(col, station)?.[eje]?.mc)"></td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                    <div class="px-2 pt-1 text-[10px] text-gray-500"
                                         x-show="slenderInfo(col, station)?.M3?.unstable || slenderInfo(col, station)?.M2?.unstable">
                                        ⚠️ Pu ≥ 0.75·Pc: la columna es inestable por pandeo — no hay magnificador finito. Aumenta la sección o reduce la altura libre.
                                    </div>
                                </div>
                            </template>

                            {{-- Corte por capacidad + confinamiento --}}
                            <div class="px-4 py-2">
                                <div class="text-xs font-semibold text-gray-300 mb-1">
                                    Corte por capacidad + confinamiento (ACI 318 §18.7.6 / §18.7.5)
                                </div>

                                <template x-if="col.shearInput?.unsupported">
                                    <div class="text-amber-400 text-xs" x-text="col.shearInput.unsupportedReason"></div>
                                </template>

                                <template x-if="col.shearInput && !col.shearInput.unsupported && !col.shear">
                                    <div class="text-gray-400 text-xs">Calculando...</div>
                                </template>

                                <template x-if="col.shear?.unsupported">
                                    <div class="text-amber-400 text-xs" x-text="col.shear.unsupportedReason"></div>
                                </template>

                                <template x-if="col.shear && !col.shear.unsupported">
                                    <div>
                                        <table class="min-w-full text-xs mb-2">
                                            <thead class="bg-gray-700 text-white">
                                                <tr>
                                                    <th class="px-2 py-1 text-left">Dirección</th>
                                                    <th class="px-2 py-1 text-right">Mpr (tonf-m)</th>
                                                    <th class="px-2 py-1 text-right">Ve columna (tonf)</th>
                                                    <th class="px-2 py-1 text-right">Ve vigas (tonf)</th>
                                                    <th class="px-2 py-1 text-right">Ve capacidad (tonf)</th>
                                                    <th class="px-2 py-1 text-right">Ve análisis (tonf)</th>
                                                    <th class="px-2 py-1 text-right">Ve (tonf)</th>
                                                    <th class="px-2 py-1 text-right">ΦVc (tonf)</th>
                                                    <th class="px-2 py-1 text-right">ΦVs provisto (tonf)</th>
                                                    <th class="px-2 py-1 text-right">Ratio</th>
                                                    <th class="px-2 py-1 text-center">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <template x-for="dir in [{key:'shearV2', label:'V2 (↔ M3)'}, {key:'shearV3', label:'V3 (↔ M2)'}]" :key="dir.key">
                                                    <tr class="border-t border-gray-700">
                                                        <td class="px-2 py-1" x-text="dir.label"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear[dir.key].mpr / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right text-gray-400" x-text="fmt(col.shear[dir.key].veColumn / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right"
                                                            :class="col.shear[dir.key].beamCapApplied ? 'text-green-400 font-semibold' : 'text-gray-500'"
                                                            x-text="col.shear[dir.key].veBeams == null ? '—' : fmt(col.shear[dir.key].veBeams / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right font-semibold" x-text="fmt(col.shear[dir.key].veCapacity / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear[dir.key].veAnalysis / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear[dir.key].ve / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right"
                                                            x-text="col.shear[dir.key].vcZero ? '0 (Φ𝑉𝑐=0)' : fmt(col.shear[dir.key].vc * 0.75 / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear[dir.key].vsProvided * 0.75 / 9806.65, 2)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear[dir.key].ratio, 2)"></td>
                                                        <td class="px-2 py-1 text-center font-bold"
                                                            :class="col.shear[dir.key].status === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                            x-text="col.shear[dir.key].status"></td>
                                                    </tr>
                                                </template>
                                            </tbody>
                                        </table>

                                        {{-- El tope por vigas (ACI 318 18.7.6.1.1 in fine) necesita el
                                             armado real de las vigas del nudo. Si ETABS las dejo en
                                             "Reinforcement to be Designed", el .e2k trae ATI/ABI/ATJ/ABJ
                                             en 0: Ve queda gobernado por el Mpr de la COLUMNA, del lado
                                             seguro pero exigiendo mas estribo del necesario. --}}
                                        <div class="px-2 pt-1 pb-1 text-[10px] text-amber-400"
                                             x-show="col.shear?.v2 && col.shear.v2.veBeams == null">
                                            Ve <b>sin tope por vigas</b>: las vigas del nudo no traen armado real
                                            (ETABS las dejo en auto-diseno). El resultado es CONSERVADOR. Para
                                            afinarlo, define el armado de las vigas en ETABS
                                            ("Reinforcement to be Checked") y reimporta el modelo.
                                        </div>

                                        <table class="min-w-full text-xs">
                                            <thead class="bg-gray-700 text-white">
                                                <tr>
                                                    <th class="px-2 py-1 text-left">Confinamiento (zona Lo, ambos extremos) —
                                                        <span class="font-normal opacity-75" x-text="col.shear.confinement.tipo === &quot;espiral&quot; ? &quot;espiral&quot; : &quot;estribos&quot;"></span></th>
                                                    <th class="px-2 py-1 text-right">Requerido</th>
                                                    <th class="px-2 py-1 text-right">Provisto</th>
                                                    <th class="px-2 py-1 text-center">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr class="border-t border-gray-700">
                                                    <td class="px-2 py-1">Espaciamiento máx. (cm)</td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.soMax * 100, 1)"></td>
                                                    <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.spacingProvided * 100, 1)"></td>
                                                    <td class="px-2 py-1 text-center font-bold"
                                                        :class="col.shear.confinement.spacingStatus === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                        x-text="col.shear.confinement.spacingStatus"></td>
                                                </tr>
                                                {{-- ESPIRAL: la cuantía es VOLUMÉTRICA (ρs, ACI 318
                                                     §25.7.3.3), no un área por rama. Con las filas de
                                                     Ash/s una columna zunchada mostraba las dos
                                                     direcciones vacías. --}}
                                                <template x-if="col.shear.confinement.tipo === 'espiral'">
                                                    <tr class="border-t border-gray-700">
                                                        <td class="px-2 py-1">ρ<sub>s</sub> volumétrica</td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.rhoSRequired, 5)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.rhoSProvided, 5)"></td>
                                                        <td class="px-2 py-1 text-center font-bold"
                                                            :class="col.shear.confinement.rhoStatus === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                            x-text="col.shear.confinement.rhoStatus"></td>
                                                    </tr>
                                                </template>
                                                <template x-if="col.shear.confinement.tipo !== 'espiral'">
                                                    <tr class="border-t border-gray-700">
                                                        <td class="px-2 py-1">Ash/s dir. 2 (cm²/cm)</td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.ashOverSReq2 * 100, 3)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.ashOverSProv2 * 100, 3)"></td>
                                                        <td class="px-2 py-1 text-center font-bold"
                                                            :class="col.shear.confinement.ashStatus2 === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                            x-text="col.shear.confinement.ashStatus2"></td>
                                                    </tr>
                                                </template>
                                                <template x-if="col.shear.confinement.tipo !== 'espiral'">
                                                    <tr class="border-t border-gray-700">
                                                        <td class="px-2 py-1">Ash/s dir. 3 (cm²/cm)</td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.ashOverSReq3 * 100, 3)"></td>
                                                        <td class="px-2 py-1 text-right" x-text="fmt(col.shear.confinement.ashOverSProv3 * 100, 3)"></td>
                                                        <td class="px-2 py-1 text-center font-bold"
                                                            :class="col.shear.confinement.ashStatus3 === 'OK' ? 'text-green-400' : 'text-red-400'"
                                                            x-text="col.shear.confinement.ashStatus3"></td>
                                                    </tr>
                                                </template>
                                                <template x-if="col.shear.confinement.tipo === 'espiral'">
                                                    <tr class="border-t border-gray-700">
                                                        <td class="px-2 py-1 text-gray-400" colspan="4">
                                                            Núcleo confinado D<sub>c</sub> = <b x-text="fmt(col.shear.confinement.coreDiameter * 100, 1) + ' cm'"></b>
                                                            (al borde exterior de la espiral, ACI 318 §25.7.3) ·
                                                            gobierna <b x-text="col.shear.confinement.gobierna"></b>
                                                        </td>
                                                    </tr>
                                                </template>
                                                <tr class="border-t border-gray-700">
                                                    <td class="px-2 py-1 text-gray-400" colspan="4">
                                                        Longitud de confinamiento Lo: <b x-text="fmt(col.shear.confinement.lo * 100, 0) + ' cm desde cada nudo'"></b>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Cerrar</button>
        </div>
    </div>
</div>

<script>
    function columnaDesignModal() {
        return {
            open: false,
            columns: [],
            // Estado del diagrama de interacción, por columna (clave: frameId).
            // Alpine 3 usa Proxy, así que agregar claves nuevas sobre la marcha
            // sigue siendo reactivo.
            ciOpen: {},
            ciStation: {},
            ciPhi: {},
            ciAngle: {},
            copiadoMsg: {},
            // Codigo de diseno activo — lo resuelve el mixin (rcDesignCode);
            // este modal solo lo refleja y lo cambia via rcSetDesignCode().
            code: 'E060',
            // Espejo de cadSystem.rcLlrfEnabled; el mixin es el dueño del valor.
            llrfOn: true,
            curvas24Phi: true,
            curvasCopiadas: false,
            recalculando: false,

            init() {
                window.addEventListener('open-columna-design-modal', (e) => {
                    this.columns = e.detail?.columns || [];
                    if (e.detail?.code) this.code = e.detail.code;
                    if (e.detail?.llrfEnabled !== undefined) this.llrfOn = !!e.detail.llrfEnabled;
                    this.recalculando = false;
                    this.open = true;

                    // REDIBUJAR los diagramas abiertos. Plotly no se entera de que
                    // `columns` cambio: sin esto el grafico se queda con el render
                    // de la corrida ANTERIOR y muestra un punto de demanda y un
                    // ratio que ya no coinciden con la tabla de arriba (visto:
                    // tabla 0.173 contra leyenda 0.142).
                    //
                    // El angulo vuelve al de la demanda nueva: una corrida nueva es
                    // un resultado nuevo, y el angulo que el usuario hubiera fijado
                    // a mano ya no tiene por que seguir siendo relevante.
                    this.$nextTick(() => {
                        this.columns.forEach((col) => {
                            if (!this.ciOpen[col.frameId]) return;
                            this.ciAngle[col.frameId] = this.demandAngle(col);
                            this.drawInteraction(col);
                        });
                    });
                });

                // Al guardar un armado manual (ver column-rebar-designer-modal.blade.php),
                // re-corre el diseño para las columnas ya seleccionadas, para que esta
                // tabla se refresque sola sin que el usuario tenga que recordar hacerlo.
                window.addEventListener('column-rebar-design-saved', () => {
                    // INVALIDAR primero: los resultados quedan cacheados por firma
                    // (columnas + codigo + LLRF), y el armado NO entra en esa firma,
                    // asi que sin esto se reabriria con los numeros viejos.
                    window.cadSystem?.rcInvalidateDesignCache?.();
                    if (this.open) window.cadSystem?.openRcColumnDesignDialog?.();
                });

                // Idem para el armado de VIGA: cambia el tope por resistencia de vigas
                // (ACI 318 18.7.6.1.1), asi que el Ve de capacidad y el chequeo de
                // estribos de esta misma tabla cambian.
                window.addEventListener('beam-rebar-design-saved', () => {
                    // INVALIDAR primero: los resultados quedan cacheados por firma
                    // (columnas + codigo + LLRF), y el armado NO entra en esa firma,
                    // asi que sin esto se reabriria con los numeros viejos.
                    window.cadSystem?.rcInvalidateDesignCache?.();
                    if (this.open) window.cadSystem?.openRcColumnDesignDialog?.();
                });
            },

            /**
             * Cambia el codigo de diseno (E.060 / ACI 318) y re-corre el
             * calculo — los factores phi viven en el motor Python, asi que
             * hay que volver a pedirle la superficie y los ratios.
             */
            async cambiarCodigo(nuevo) {
                if (nuevo === this.code || this.recalculando) return;
                this.recalculando = true;
                try {
                    await window.cadSystem?.rcSetDesignCode?.(nuevo);
                } finally {
                    this.recalculando = false;
                }
            },

            /**
             * Prende/apaga la reduccion de sobrecarga y re-corre. Cambia el Pu de
             * cada combo, asi que hay que rehacer la demanda, no solo repintar.
             */
            /** Fuerza el recalculo, descartando los resultados cacheados. */
            async recalcular() {
                if (this.recalculando) return;
                this.recalculando = true;
                try {
                    window.cadSystem?.rcInvalidateDesignCache?.();
                    await window.cadSystem?.openRcColumnDesignDialog?.();
                } finally {
                    this.recalculando = false;
                }
            },

            async cambiarLlrf(on) {
                if (this.recalculando) return;
                this.recalculando = true;
                try {
                    await window.cadSystem?.rcSetLlrfEnabled?.(!!on);
                } finally {
                    this.recalculando = false;
                }
            },

            /** Abre el diseñador de armado a mano para la SECCIÓN de esta columna (aplica a toda columna que la use). */
            defineRebar(col) {
                window.cadSystem?.openColumnRebarDesigner?.(col.sectionName, { b: col.b, h: col.h, label: col.sectionName });
            },

            close() {
                this.open = false;
            },

            fmt(value, decimals = 2) {
                const n = Number(value);
                return Number.isFinite(n) ? n.toFixed(decimals) : '-';
            },

            /** N -> tonf (el motor trabaja en SI). */
            fmtTon(value) {
                const n = Number(value);
                return Number.isFinite(n) ? (n / 9806.65).toFixed(1) : '-';
            },

            /** N*m -> tonf*m. */
            fmtTonM(value) {
                const n = Number(value);
                return Number.isFinite(n) ? (n / 9806.65).toFixed(2) : '-';
            },

            /**
             * Detalle de esbeltez ({M2, M3}) del combo SELECCIONADO en esa
             * estacion — null si el motor no la calculo (columna sin Ec/Lu,
             * o esbeltez desactivada), y ahi la tabla no se muestra.
             */
            slenderInfo(col, station) {
                return this.selectedCheck(col, station)?.slenderness || null;
            },

            /** Abre/cierra el diagrama de una columna. */
            toggleInteraction(col) {
                const id = col.frameId;
                if (this.ciOpen[id]) {
                    window.cadSystem?.destroyColumnInteractionSurface?.('ci-plot-' + id);
                    window.cadSystem?.destroyColumnInteractionSurface?.('ci-2d-' + id);
                    this.ciOpen[id] = false;
                    return;
                }
                // Defaults la primera vez: la estación que gobierna, y con Φ.
                if (!this.ciStation[id]) {
                    const rb = col.check?.base?.ratio ?? 0;
                    const rt = col.check?.top?.ratio ?? 0;
                    this.ciStation[id] = rb >= rt ? 'base' : 'top';
                }
                if (this.ciPhi[id] === undefined) this.ciPhi[id] = true;
                if (this.ciAngle[id] === undefined) this.ciAngle[id] = this.demandAngle(col);

                this.ciOpen[id] = true;
                // Plotly MIDE el div para dimensionar la escena: hay que esperar a
                // que x-show lo haya hecho visible o sale de 0x0.
                this.$nextTick(() => this.drawInteraction(col));
            },

            /** Ángulo θ de la demanda de la estación activa (grados). */
            demandAngle(col) {
                const station = this.ciStation[col.frameId] || 'base';
                return Number(this.selectedCheck(col, station)?.thetaDeg) || 0;
            },

            enAnguloDeDemanda(col) {
                const a = Number(this.ciAngle[col.frameId]);
                return !Number.isFinite(a) || Math.abs(a - this.demandAngle(col)) < 0.05;
            },

            /** Devuelve el corte al ángulo de la demanda y redibuja. */
            resetInteractionAngle(col) {
                this.ciAngle[col.frameId] = this.demandAngle(col);
                this.drawInteraction(col);
            },

            /** Filas de la tabla Curve Data del corte actual. */
            curveRows(col) {
                const id = col.frameId;
                if (!this.ciOpen[id]) return [];
                const ang = Number(this.ciAngle[id]);
                return window.cadSystem?.columnInteractionCurveRows?.(
                    col.surface?.curves || [],
                    Number.isFinite(ang) ? ang : this.demandAngle(col),
                    this.ciPhi[id] !== false,
                ) || [];
            },

            async copiarCurva(col) {
                const id = col.frameId;
                const rows = this.curveRows(col);
                if (!rows.length) return;
                const ang = Number(this.ciAngle[id]);
                const tsv = window.cadSystem?.columnInteractionCurveTsv?.(
                    rows, Number.isFinite(ang) ? ang : this.demandAngle(col)) || '';
                try {
                    await navigator.clipboard.writeText(tsv);
                    this.copiadoMsg[id] = '✅ Copiado';
                } catch (e) {
                    this.copiadoMsg[id] = 'No se pudo copiar — el navegador bloqueó el portapapeles';
                }
                setTimeout(() => { this.copiadoMsg[id] = ''; }, 2500);
            },

            /**
             * Las COMBINACIONES DE DISEÑO de una estación — sin los casos
             * sísmicos sueltos.
             *
             * Un espectro por sí solo (`kind: "case"`) no lleva gravedad ni
             * factores de carga, así que no es una combinación y ETABS nunca lo
             * reporta. `_rcMaxRatio` ya lo excluye al elegir el gobernante desde
             * que en `MODELO video.e2k` el SDX crudo ganaba en las 12 columnas;
             * el gráfico los seguía dibujando y por eso aparecían 11 puntos
             * donde el proyecto tiene 9 combos.
             *
             * El fallback cubre un modelo SIN combinaciones: mejor mostrar algo.
             */
            /** Las 24 curvas en formato ETABS (delega en el mixin, no recalcula nada). */
            curvas24(col) {
                return window.cadSystem?.columnCurvesTable?.(col.surface?.curves || [], this.curvas24Phi)
                    || { angles: [], rows: [] };
            },

            async copiarCurvas(col) {
                const csv = window.cadSystem?.columnCurvesCsv?.(col.surface?.curves || [], this.curvas24Phi) || '';
                try {
                    await navigator.clipboard.writeText(csv);
                    this.curvasCopiadas = true;
                    setTimeout(() => { this.curvasCopiadas = false; }, 1800);
                } catch (err) {
                    console.warn('No se pudo copiar al portapapeles:', err);
                }
            },

            /** ¿Es esta fila el combo gobernante de la estación? */
            esGobernante(col, c) {
                const st = this.ciStation[col.frameId] || 'base';
                const gob = col.check?.[st];
                return !!gob && String(gob.comboId ?? '') === String(c.comboId ?? '');
            },

            combosDeDiseno(col, station) {
                const todas = col.checksAll?.[station] || [];
                const combos = todas.filter((c) => c.kind !== 'case');
                return combos.length ? combos : todas;
            },

            /** Redibuja las DOS vistas con la estación/combo/Φ/ángulo actuales. */
            drawInteraction(col) {
                const id = col.frameId;
                if (!this.ciOpen[id]) return;
                const station = this.ciStation[id] || 'base';
                const check = this.selectedCheck(col, station);
                const curves = col.surface?.curves || [];
                const opts = { usePhi: this.ciPhi[id] !== false, cutAngleDeg: this.ciAngle[id] };

                window.cadSystem?.renderColumnInteractionSurface?.('ci-plot-' + id, curves, check, opts);
                window.cadSystem?.renderColumnInteraction2D?.('ci-2d-' + id, curves, check, opts);
                // Los planos principales NO dependen del ángulo del corte ni del
                // checkbox de Φ: dibujan siempre las dos curvas en θ fijo.
                // TODAS las combinaciones de la estacion, para que el grafico muestre
                // la nube completa y no solo el punto que gana.
                // `station` ya esta resuelto arriba: reusarlo evita que la nube y el
                // punto gobernante puedan quedar de estaciones distintas.
                const todas = this.combosDeDiseno(col, station);
                window.cadSystem?.renderColumnInteractionPlane?.('ci-pm33-' + id, curves, check, { plane: 'M33', allDemands: todas });
                window.cadSystem?.renderColumnInteractionPlane?.('ci-pm22-' + id, curves, check, { plane: 'M22', allDemands: todas });
            },

            overallStatus(col) {
                if (col.unsupported) return '';
                const base = col.check?.base?.status;
                const top = col.check?.top?.status;
                return base === 'OK' && top === 'OK' ? 'OK' : 'NG';
            },

            /** El check del combo actualmente seleccionado en el <select> de esa estación (por defecto, el gobernante). */
            selectedCheck(col, station) {
                const id = col.selectedComboId?.[station];
                return (col.checksAll?.[station] || []).find((c) => c.comboId === id) || col.check?.[station];
            },
        };
    }
</script>
