{{-- resources/views/components/cad/modals/zapata-results-modal.blade.php
     Resultados de "Calcular zapatas" (botón en side-panel.blade.php).
     Solo lectura: cadSystem.calculateZapatas() dispara
     'open-zapata-results-modal' con { loadCombinations, polygonProperties,
     df, gammaE, columnsCount } (ver resources/js/cad/mixins/analysis/
     foundation.js).

     Rinde UN gráfico a la vez (pestaña por combinación) — igual que
     /software/predim2 (ResultadosModal.vue) — en vez de los 11 al mismo
     tiempo (patrón de /software/cimentacion-v2, que se pone lento con
     tantos puntos Plotly simultáneos). Cambiar de pestaña llama
     cadSystem.renderZapataPlot() sobre el MISMO contenedor: Plotly.react()
     actualiza en vez de recrear, así que es barato. --}}
<div x-data="zapataResultsModal()"
     x-show="open" x-cloak @keydown.esc.window="close()"
     style="position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5)">

    <div class="bg-gray-800 rounded-lg shadow-xl border border-gray-700" style="width:min(1180px, 96vw); max-height:90vh; display:flex; flex-direction:column">
        <div class="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-900 rounded-t-lg">
            <h3 class="text-sm font-semibold text-white">Resultados de Zapatas</h3>
            <button @click="close()" class="text-gray-400 hover:text-white text-lg leading-none">&times;</button>
        </div>

        <div class="p-4 text-sm text-gray-200 overflow-auto">
            <p class="text-[11px] text-amber-400 mb-3">
                La carga sísmica usada es un envelope (sin signo) del análisis modal-espectral.
                Verifica el resultado con criterio de ingeniería antes de usarlo en producción.
            </p>

            {{-- Resumen --}}
            <div class="grid grid-cols-4 gap-2 mb-4">
                <div class="bg-gray-900 border border-gray-700 rounded p-2">
                    <span class="block text-[10px] text-gray-400">Df</span>
                    <strong x-text="summary.df"></strong>
                </div>
                <div class="bg-gray-900 border border-gray-700 rounded p-2">
                    <span class="block text-[10px] text-gray-400">γe</span>
                    <strong x-text="summary.gammaE"></strong>
                </div>
                <div class="bg-gray-900 border border-gray-700 rounded p-2">
                    <span class="block text-[10px] text-gray-400">Columnas</span>
                    <strong x-text="summary.columnsCount"></strong>
                </div>
                <div class="bg-gray-900 border border-gray-700 rounded p-2">
                    <span class="block text-[10px] text-gray-400">Polígonos</span>
                    <strong x-text="polygonProperties.length"></strong>
                </div>
            </div>

            {{-- Propiedades geométricas por zapata (no cambian según el combo) --}}
            <template x-for="polygon in polygonProperties" :key="polygon.name">
                <fieldset class="border border-gray-600 rounded px-2 pb-2 pt-1 mb-3">
                    <legend class="px-1 text-xs text-gray-400" x-text="polygon.name"></legend>

                    {{-- σmin<0 en algún combo: el suelo no puede transmitir
                         tracción, así que el área de apoyo real es menor
                         que el polígono dibujado — el método lineal P/A±M/I
                         ya no es válido. Se avisa ANTES de los bloques de
                         diseño porque afecta la validez de todos ellos, no
                         solo de la presión. --}}
                    <template x-if="polygon.hasNegativePressure">
                        <p class="text-xs text-red-400 font-semibold mb-2 px-2 py-1 bg-red-950/40 border border-red-800 rounded">
                            ⚠️ σmin &lt; 0 en al menos una combinación: el suelo no puede "jalar" la zapata (solo transmite compresión). El área de apoyo real es menor que el polígono dibujado — reposiciona o agranda la zapata; los cálculos de acero/cortante de abajo son un envolvente conservador, no reemplazan corregir la geometría.
                        </p>
                    </template>

                    <div class="mb-2">
                        <p class="text-[11px] font-semibold text-gray-300 mb-1">Dimensiones</p>
                        <template x-if="polygon.dimensions">
                            <p class="text-xs">
                                B = <strong x-text="formatNumber(polygon.dimensions.B)"></strong> m
                                &times;
                                L = <strong x-text="formatNumber(polygon.dimensions.L)"></strong> m
                            </p>
                        </template>
                        <template x-if="!polygon.dimensions">
                            <p class="text-xs text-gray-300">
                                Lados:
                                <template x-for="(edge, index) in polygon.edges" :key="index">
                                    <span class="mr-2" x-text="formatNumber(edge) + ' m'"></span>
                                </template>
                            </p>
                        </template>
                    </div>

                    {{-- AGREGADO (ver conversación): oculto por defecto para la
                         presentación al cliente -- es geometría de verificación
                         interna (área/perímetro/inercias/centroide + tabla de
                         puntos), no aporta a una decisión de diseño y el cliente
                         ya ve la forma dibujada en el CAD. Mismo criterio que
                         mostrarBloques4y5: el cálculo sigue corriendo, solo se
                         esconde la vista. --}}
                    <div class="grid gap-3" x-show="mostrarGeometria" style="grid-template-columns: minmax(0,1fr) minmax(0,1fr)">
                        <div>
                            <p class="text-[11px] font-semibold text-gray-300 mb-1">
                                Propiedades geométricas del polígono
                                <span x-show="polygon.hasHoles" class="text-emerald-400">(neto, con cortes restados)</span>
                            </p>
                            <p class="text-[10px] text-gray-500 mb-1">Solo geometría de la forma dibujada — no son cargas ni momentos de la estructura.</p>
                            {{-- AGREGADO (ver conversación, "quisiera que también
                                 puedas mostrar la fórmula" 2026-09-14, ampliado
                                 2026-09-15 "cómo sabré que aplicaste Green +
                                 Steiner"): método de diferencia de áreas (Teorema
                                 de Green) -- exterior menos cada corte, calculado
                                 directo sobre los vértices reales (ver
                                 calcularPropiedadesNetas, foundationContract.js),
                                 sin malla ni aproximación -- + Teorema de Steiner
                                 (eje paralelo) para trasladar Ix/Iy/Ixy del origen
                                 del dibujo al centroide propio de la zapata. Antes
                                 solo se mostraba con cortes; Steiner se aplica
                                 SIEMPRE (con o sin cortes, el origen del dibujo
                                 rara vez coincide con el centroide), así que ahora
                                 la línea se muestra siempre, con las dos variantes
                                 de fórmula según haya cortes o no. --}}
                            <template x-if="polygon.hasHoles">
                                <p class="text-[10px] text-sky-400 mb-1 font-mono">
                                    A = A₁ − ΣA₂ᵢ &nbsp;·&nbsp; I = (I₁ − ΣI₂ᵢ) trasladado al centroide &nbsp;(Teorema de Green: A₁/I₁ = polígono exterior, A₂ᵢ/I₂ᵢ = cada corte &nbsp;+&nbsp; Teorema de Steiner: I = I_centroide + A·d²)
                                </p>
                            </template>
                            <template x-if="!polygon.hasHoles">
                                <p class="text-[10px] text-sky-400 mb-1 font-mono">
                                    A, Mx, My &nbsp;(Teorema de Green) &nbsp;·&nbsp; Ix, Iy, Ixy &nbsp;=&nbsp; Green + Teorema de Steiner (trasladado al centroide: I = I_centroide + A·d²)
                                </p>
                            </template>
                            <table class="w-full text-xs">
                                <tbody>
                                    <template x-for="row in [
                                        { key: 'A', label: 'Área (A) (m²)' },
                                        { key: 'P', label: 'Perímetro (P) (m)' },
                                        { key: 'IX', label: 'Momento de inercia Ix (IX) — centroidal' },
                                        { key: 'IY', label: 'Momento de inercia Iy (IY) — centroidal' },
                                        { key: 'XC', label: 'Centroide X (XC)' },
                                        { key: 'YC', label: 'Centroide Y (YC)' },
                                        { key: 'MX', label: 'Momento estático Mx (MX)' },
                                        { key: 'MY', label: 'Momento estático My (MY)' },
                                        { key: 'IXY', label: 'Producto de inercia Ixy (IXY) — centroidal' },
                                    ]" :key="row.key">
                                        <tr class="border-t border-gray-700">
                                            <td class="py-1 pr-2 text-gray-400" x-text="row.label"></td>
                                            <td class="py-1" x-text="formatNumber(polygon.properties?.[row.key])"></td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <p class="text-[11px] font-semibold text-gray-300 mb-1">Puntos</p>
                            <table class="w-full text-xs">
                                <thead>
                                    <tr class="text-gray-400 text-left">
                                        <th class="py-1 pr-2">X</th>
                                        <th class="py-1 pr-2">Y</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="(point, index) in polygon.points" :key="index">
                                        <tr class="border-t border-gray-700">
                                            <td class="py-1 pr-2" x-text="formatNumber(point.x)"></td>
                                            <td class="py-1 pr-2" x-text="formatNumber(point.y)"></td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {{-- AGREGADO (ver conversación, "que se muestre en resultados
                         de zapatas para mostrarle al cliente que ya se hizo"
                         2026-09-14): comparación lado a lado -- valor SI no se
                         hubiera restado el corte (polygon.propertiesSinRestar,
                         foundationContract.js) contra el valor real que reporta
                         el sistema (polygon.properties, ya neto). Evidencia
                         directa, dentro del propio modal, de que el método de
                         diferencia de áreas (Teorema de Green) está aplicado. --}}
                    <template x-if="mostrarGeometria && polygon.hasHoles">
                        <div class="mt-2 pt-2 border-t border-gray-800">
                            <p class="text-[11px] font-semibold text-gray-300 mb-1">Efecto de restar los cortes</p>
                            <p class="text-[10px] text-gray-500 mb-2">Mismo polígono, dos formas de calcular — confirma que el sistema sí descuenta cada corte antes de reportar la propiedad.</p>
                            <table class="w-full text-xs">
                                <thead>
                                    <tr class="text-gray-400 text-left">
                                        <th class="py-1 pr-2"></th>
                                        <th class="py-1 pr-2 text-amber-400">Sin restar el corte</th>
                                        <th class="py-1 pr-2 text-emerald-400">Diferencia de áreas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="row in [
                                        { key: 'A', label: 'Área (A)' },
                                        { key: 'IX', label: 'Inercia Ix' },
                                        { key: 'IY', label: 'Inercia Iy' },
                                        { key: 'XC', label: 'Centroide Xc' },
                                        { key: 'YC', label: 'Centroide Yc' },
                                        { key: 'MX', label: 'Momento estático Mx' },
                                        { key: 'MY', label: 'Momento estático My' },
                                        { key: 'IXY', label: 'Producto de inercia Ixy' },
                                    ]" :key="row.key">
                                        <tr class="border-t border-gray-700">
                                            <td class="py-1 pr-2 text-gray-400" x-text="row.label"></td>
                                            <td class="py-1 pr-2 text-amber-300" x-text="formatNumber(polygon.propertiesSinRestar?.[row.key])"></td>
                                            <td class="py-1 pr-2 text-emerald-300 font-semibold" x-text="formatNumber(polygon.properties?.[row.key])"></td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                    </template>

                    {{-- AGREGADO (ver conversación, "propiedades geométricas de
                         los cortes" 2026-09-14): una tarjeta por cada figura de
                         corte (polygon.holesProperties, ver foundationContract.js)
                         -- sus propias A/P/Ix/Iy/Xc/Yc SIN restar nada (un corte
                         no tiene sub-cortes en el caso real), más su tabla de
                         puntos, mismo formato que el contorno exterior arriba. --}}
                    <template x-if="mostrarGeometria && polygon.hasHoles">
                        <div class="mt-2">
                            <template x-for="(hole, holeIndex) in polygon.holesProperties" :key="holeIndex">
                                <div class="grid gap-3 mt-2 pt-2 border-t border-gray-800" style="grid-template-columns: minmax(0,1fr) minmax(0,1fr)">
                                    <div>
                                        <p class="text-[11px] font-semibold text-gray-300 mb-1" x-text="'Corte ' + (holeIndex + 1) + ' — propiedades geométricas'"></p>
                                        <table class="w-full text-xs">
                                            <tbody>
                                                <template x-for="row in [
                                                    { key: 'A', label: 'Área (A) (m²)' },
                                                    { key: 'P', label: 'Perímetro (P) (m)' },
                                                    { key: 'IX', label: 'Momento de inercia Ix (IX) — centroidal' },
                                                    { key: 'IY', label: 'Momento de inercia Iy (IY) — centroidal' },
                                                    { key: 'XC', label: 'Centroide X (XC)' },
                                                    { key: 'YC', label: 'Centroide Y (YC)' },
                                                    { key: 'MX', label: 'Momento estático Mx (MX)' },
                                                    { key: 'MY', label: 'Momento estático My (MY)' },
                                                    { key: 'IXY', label: 'Producto de inercia Ixy (IXY) — centroidal' },
                                                ]" :key="row.key">
                                                    <tr class="border-t border-gray-700">
                                                        <td class="py-1 pr-2 text-gray-400" x-text="row.label"></td>
                                                        <td class="py-1" x-text="formatNumber(hole.properties?.[row.key])"></td>
                                                    </tr>
                                                </template>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div>
                                        <p class="text-[11px] font-semibold text-gray-300 mb-1" x-text="'Corte ' + (holeIndex + 1) + ' — puntos'"></p>
                                        <table class="w-full text-xs">
                                            <thead>
                                                <tr class="text-gray-400 text-left">
                                                    <th class="py-1 pr-2">X</th>
                                                    <th class="py-1 pr-2">Y</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <template x-for="(point, pIndex) in hole.points" :key="pIndex">
                                                    <tr class="border-t border-gray-700">
                                                        <td class="py-1 pr-2" x-text="formatNumber(point.x)"></td>
                                                        <td class="py-1 pr-2" x-text="formatNumber(point.y)"></td>
                                                    </tr>
                                                </template>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </template>

                    {{-- Bloque 2b: capacidad portante -- ¿el suelo aguanta
                         σmax? Antes el sistema calculaba σmax pero nunca lo
                         comparaba contra la presión admisible del estudio de
                         suelos (ver conversación). Es un dato POR ZAPATA
                         (no global como Df/γe): distintas zapatas de un
                         mismo edificio pueden caer en zonas de distinta
                         capacidad portante. Compara contra la ENVOLVENTE
                         (peor de las 11 combinaciones, mismo criterio que
                         ya usa Cortante), no solo la combinación 1. --}}
                    <div class="mt-2 pt-2 border-t border-gray-700" x-show="mostrarCapacidadPortante">
                        <p class="text-[11px] font-semibold text-gray-300 mb-1">Capacidad portante del suelo</p>
                        <div class="flex items-center gap-2 text-xs flex-wrap">
                            <label class="text-gray-400">σ admisible (Tn/m²):</label>
                            <input type="number" step="0.1" min="0"
                                   x-model.number="polygon.sigmaAdmisible"
                                   @change="setSigmaAdmisible(polygon)"
                                   class="w-20 px-1.5 py-0.5 bg-gray-900 border border-gray-600 rounded text-gray-200">
                            <span class="text-gray-400">
                                σmax envolvente: <strong x-text="formatNumber(polygon.sigmaMaxEnvelope)"></strong> Tn/m²
                            </span>
                        </div>
                        <template x-if="polygon.bearingCheck">
                            <p class="mt-1 text-xs font-semibold"
                               :class="polygon.bearingCheck.ok ? 'text-emerald-400' : 'text-red-400'"
                               x-text="(polygon.bearingCheck.ok ? '✓ OK' : '⚠️ EXCEDE LA CAPACIDAD DEL SUELO') + ' (σmax/σadm = ' + formatNumber(polygon.bearingCheck.ratio) + ')'">
                            </p>
                        </template>
                        <template x-if="!polygon.bearingCheck">
                            <p class="mt-1 text-[11px] text-gray-500">Ingresa la presión admisible del estudio de suelos para verificar si esta zapata la aguanta.</p>
                        </template>
                    </div>

                    {{-- Bloque 2c: K de balasto (K30) y capacidad portante
                         AASHTO LRFD (Vesic) — ver conversación, Categoría D
                         puntos 1-2. Datos GLOBALES (K30/φ'/c'/Dw, editables
                         en el ribbon "Cimentación"), a diferencia de σ
                         admisible que es por zapata -- si quedan vacíos,
                         `polygon.soilChecks` sale sin `kBalasto`/
                         `bearingCapacity` y acá se muestra un aviso en vez
                         de un resultado inventado. --}}
                    <template x-if="polygon.soilChecks && mostrarCapacidadPortante">
                        <div class="mt-2 pt-2 border-t border-gray-700">
                            <p class="text-[11px] font-semibold text-gray-300 mb-1">
                                K de balasto y capacidad portante (AASHTO LRFD, Vesic)
                            </p>

                            <template x-if="polygon.soilChecks.kBalasto">
                                <p class="text-xs text-gray-300">
                                    K<sub>30→real</sub> (<span x-text="polygon.soilChecks.kBalasto.soilType"></span>):
                                    <strong x-text="formatNumber(polygon.soilChecks.kBalasto.kRectangular)"></strong> Tn/m³
                                    <span class="text-gray-500">
                                        (BC=<span x-text="formatNumber(polygon.soilChecks.kBalasto.BC)"></span> m,
                                        k<sub>cuadrado</sub>=<span x-text="formatNumber(polygon.soilChecks.kBalasto.kCuadrado)"></span> Tn/m³)
                                    </span>
                                </p>
                            </template>
                            <template x-if="!polygon.soilChecks.kBalasto">
                                <p class="text-[11px] text-gray-500">Ingresa K30 en la barra "Cimentación" para calcular el coeficiente de balasto.</p>
                            </template>

                            <template x-if="polygon.soilChecks.bearingCapacity">
                                <div class="mt-1 text-xs text-gray-300">
                                    <p>
                                        Combo <span x-text="polygon.soilChecks.bearingCapacity.comboId"></span>:
                                        e<sub>x</sub>=<span x-text="formatNumber(polygon.soilChecks.bearingCapacity.ex)"></span> m,
                                        e<sub>y</sub>=<span x-text="formatNumber(polygon.soilChecks.bearingCapacity.ey)"></span> m
                                        &middot;
                                        L'×B' = <span x-text="formatNumber(polygon.soilChecks.bearingCapacity.Lp)"></span>×<span x-text="formatNumber(polygon.soilChecks.bearingCapacity.Bp)"></span> m
                                    </p>
                                    <p>
                                        q<sub>eff</sub> = <strong x-text="formatNumber(polygon.soilChecks.bearingCapacity.qEff)"></strong> Tn/m²
                                        &middot;
                                        q<sub>u</sub> (φb·qn) = <strong x-text="formatNumber(polygon.soilChecks.bearingCapacity.qu)"></strong> Tn/m²
                                    </p>
                                    <p class="mt-1 font-semibold"
                                       :class="polygon.soilChecks.bearingCapacity.ok ? 'text-emerald-400' : 'text-red-400'"
                                       x-text="(polygon.soilChecks.bearingCapacity.ok ? '✓ OK' : '⚠️ EXCEDE LA CAPACIDAD PORTANTE') + ' (qeff/qu = ' + formatNumber(polygon.soilChecks.bearingCapacity.ratio) + ')'">
                                    </p>
                                    <p class="mt-1 text-[10px] text-amber-400/80">
                                        Aproximación de Vesic (Bowles/Braja Das) — no verificada línea por línea contra AASHTO LRFD 2020 (el documento de referencia del cliente no desglosa sus factores Nq/Nc/Nγ/Cwq/Cwγ). Usar con esta salvedad.
                                    </p>
                                </div>
                            </template>
                            <template x-if="!polygon.soilChecks.bearingCapacity">
                                <p class="text-[11px] text-gray-500">Ingresa φ' (ángulo de fricción) en la barra "Cimentación" para calcular la capacidad portante AASHTO LRFD.</p>
                            </template>
                        </div>
                    </template>

                    {{-- Bloque 4: espesor/recubrimiento/materiales, de la
                         sección de losa asignada a esta zapata (Assign >
                         Losa/Muro > Sección de Losa) — necesarios para el
                         acero y cortante que siguen (Bloques 5-6).
                         Oculto por ahora (ver mostrarBloques4y5) — el
                         cálculo sigue corriendo, solo se esconde la vista. --}}
                    <div class="mt-2 pt-2 border-t border-gray-700" x-show="mostrarBloques4y5">
                        <p class="text-[11px] font-semibold text-gray-300 mb-1">Datos de diseño (Bloque 4)</p>
                        <template x-if="polygon.designInputs">
                            <p class="text-xs text-gray-300">
                                Espesor = <strong x-text="formatNumber(polygon.designInputs.thicknessM * 100)"></strong> cm
                                &middot;
                                Recub. = <strong x-text="formatNumber(polygon.designInputs.recubrimientoM * 100)"></strong> cm
                                &middot;
                                f'c = <strong x-text="polygon.designInputs.fpc ?? '—'"></strong>
                                &middot;
                                fy = <strong x-text="polygon.designInputs.fy ?? '—'"></strong>
                            </p>
                        </template>
                        <template x-if="!polygon.designInputs">
                            <p class="text-[11px] text-amber-400">
                                Sin sección asignada — usa Assign ▸ Losa/Muro ▸ Sección de Losa para definir espesor y material de esta zapata.
                            </p>
                        </template>
                    </div>

                    {{-- Bloque 3b: momento de referencia (elementos finitos
                         reales, ShellDKGQ/OpenSeesPy).
                         EN AISLADAS: complementa el Mu del método rígido
                         (tabla de momentos más abajo) con un valor más
                         cercano a ETABS -- NO reemplaza Bloque 3 ni
                         alimenta Bloque 5/6, es solo comparación.
                         EN COMBINADAS (ACTUALIZADO 2026-08-30): para las
                         caras cubiertas por Strip Based (franja de
                         columna), el Mx mostrado aquí SÍ es el valor de
                         diseño oficial -- ya no es "solo comparación" en
                         ese caso (cliente confirmó tolerar 10% vs. ETABS,
                         ya cumplido en el caso real F10: 3-11%). Ver el
                         texto condicional más abajo (mxStripPorCara) que
                         distingue ambos casos.
                         AGREGADO: destacado visualmente (borde verde +
                         insignia "validado") -- es el valor más cercano a
                         ETABS real, confirmado contra el modelo del
                         cliente.
                         CORREGIDO (ver conversación, "badge validado vs.
                         ETABS"): antes el borde y la insignia eran SIEMPRE
                         verdes/"Validado", sin importar la figura -- para L
                         (extensión experimental, NUNCA comparada de forma
                         concluyente contra un caso real) eso contradecía el
                         propio texto de advertencia de más abajo. Ahora el
                         color y el texto de la insignia dependen de
                         `validadoEtabs` (lo manda el backend por figura,
                         ver run_zapata_shell_*_design en app.py) -- verde
                         "Validado" para rectangular/trapezoidal/polígono,
                         ámbar "Experimental" para L. --}}
                    <template x-if="polygon.shellMomentReference && mostrarShellMomentReference">
                        <div class="mt-2 p-2 border rounded"
                             :class="polygon.shellMomentReference.validadoEtabs ? 'border-emerald-700 bg-emerald-950/30' : 'border-amber-700 bg-amber-950/30'">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="text-[11px] font-semibold"
                                   :class="polygon.shellMomentReference.validadoEtabs ? 'text-emerald-300' : 'text-amber-300'">Momento y cortante de referencia — elementos finitos (Bloque 3b/6b)</p>
                                <span x-show="polygon.shellMomentReference.validadoEtabs" class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-800 text-emerald-100">✓ Validado vs. ETABS</span>
                                <span x-show="!polygon.shellMomentReference.validadoEtabs" class="text-[9px] px-1.5 py-0.5 rounded bg-amber-800 text-amber-100">⚠ Experimental — sin validar vs. ETABS real</span>
                            </div>
                            <template x-if="polygon.shellMomentReference.ok">
                                <div class="text-xs text-gray-200 space-y-0.5">
                                    <p>
                                        Mx = <strong x-text="formatNumber(polygon.shellMomentReference.momentoDiseno?.Mx_diseno)"></strong> Tn&middot;m/m
                                        &middot;
                                        My = <strong x-text="formatNumber(polygon.shellMomentReference.momentoDiseno?.My_diseno)"></strong> Tn&middot;m/m
                                    </p>
                                    {{-- AGREGADO (ver conversación): Mxy/torsión -- validado hoy
                                         contra ETABS real (caso F8, centrado): nuestro FEM da ≈0
                                         exacto y ETABS da -0.0088/-0.0090 en las dos caras, ambos
                                         despreciables frente a Mx/My de esa zona (~0.1-0.3%) --
                                         confirma la simetría esperada. Es una validación "caso
                                         trivial" (cero contra cero por columna centrada), no
                                         equivalente en rigor a la de Mx/My (que comparó valores
                                         grandes, ~3-7% de diferencia) -- para zapatas descentradas,
                                         donde Mxy deja de ser trivial, sigue sin validar. --}}
                                    <template x-if="polygon.shellMomentReference.momentoDiseno?.Mxy_diseno !== undefined">
                                        <p class="text-gray-400">
                                            Mxy (torsión) = <strong class="text-gray-300" x-text="formatNumber(polygon.shellMomentReference.momentoDiseno?.Mxy_diseno)"></strong> Tn&middot;m/m
                                            <span class="text-[9px] text-gray-500">— validado vs. ETABS en zapata centrada (≈0 en ambos, por simetría); sin validar en zapatas descentradas</span>
                                        </p>
                                    </template>
                                    <p class="text-[10px] text-amber-400" x-text="polygon.shellMomentReference.advertencia"></p>
                                    {{-- CORREGIDO (ver conversación 2026-08-30): este bloque se
                                         reutiliza para aisladas Y combinadas. En aisladas sigue
                                         siendo solo comparación (el Bloque 3 rígido manda ahí). En
                                         combinadas, desde que se consolidó Strip Based como método
                                         oficial (cliente confirmó tolerar 10% vs. ETABS, ya cumplido
                                         en el caso real F10), el Mx mostrado arriba SÍ es el valor de
                                         diseño para las caras que cubre -- el texto fijo anterior
                                         ("no de diseño") ya no era cierto ahí y contradecía la
                                         advertencia de arriba, que sí lo dice. Se distingue con
                                         mxStripPorCara (solo existe/tiene datos en combinadas con
                                         franja aplicada). --}}
                                    <template x-if="!polygon.shellMomentReference.mxStripPorCara?.length">
                                        <p class="text-[10px] text-gray-400">Evaluado en la cara de columna (no en el punto de apoyo, que es una singularidad matemática) — valor de comparación, no de diseño (ver Bloque 3 para el momento oficial de diseño).</p>
                                    </template>
                                    <template x-if="polygon.shellMomentReference.mxStripPorCara?.length">
                                        <p class="text-[10px] text-gray-400">Mx de las caras marcadas arriba viene de la franja de columna (Strip Based) — ese SÍ es el valor de diseño oficial, no solo comparación.</p>
                                    </template>

                                    {{-- AGREGADO (ver conversación): V13/V23 -- lo que el cliente
                                         pide como "V11/V22" (ETABS no tiene esos índices para
                                         cortante, ver conversación). Sale del MISMO solve que
                                         Mx/My/Mxy de arriba (ver zapataShellDesign.js /
                                         calcular_zapata_shell_completo()), evaluado en la
                                         SECCIÓN CRÍTICA (a distancia d de la cara, no en la
                                         cara misma). Validado hoy contra ETABS real (caso F8
                                         4x2m centrado): 2.47% y 4.59% de diferencia. --}}
                                    <template x-if="polygon.shellShearReference?.ok">
                                        <p class="pt-1 mt-1 border-t border-emerald-800/50">
                                            V13 = <strong x-text="formatNumber(polygon.shellShearReference.cortanteDiseno?.V13_diseno)"></strong> Tn/m
                                            &middot;
                                            V23 = <strong x-text="formatNumber(polygon.shellShearReference.cortanteDiseno?.V23_diseno)"></strong> Tn/m
                                            <span class="text-[9px] text-gray-500">— sección crítica, a distancia d de la cara</span>
                                        </p>
                                    </template>
                                    <template x-if="polygon.shellShearReference && !polygon.shellShearReference.ok">
                                        <p class="text-[10px] text-gray-500 pt-1 mt-1 border-t border-emerald-800/50" x-text="'Cortante FEM no disponible: ' + polygon.shellShearReference.error"></p>
                                    </template>
                                </div>
                            </template>
                            <template x-if="!polygon.shellMomentReference.ok">
                                <p class="text-[11px] text-gray-500" x-text="'No se pudo calcular: ' + polygon.shellMomentReference.error"></p>
                            </template>
                        </div>
                    </template>

                    {{-- AGREGADO (ver conversación): momento del método rígido
                         (Bloque 3, Mu=σ·L²/2 — la fórmula clásica del voladizo
                         E.060/ACI), mostrado justo debajo del Bloque 3b para
                         que el cliente vea los dos números lado a lado. A
                         diferencia del Bloque 3b, este NO pasó por el mismo
                         proceso de validación rigurosa contra ETABS hoy — se
                         etiqueta como tal, sin insignia de "validado". --}}
                    <template x-if="polygon.rigidMoment">
                        <div class="mt-2 p-2 border border-gray-600 bg-gray-900/60 rounded">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="text-[11px] font-semibold text-gray-300">Momento — método rígido (Bloque 3)</p>
                                <span class="text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">Sin validar hoy vs. ETABS</span>
                            </div>
                            <div class="text-xs text-gray-200 space-y-0.5">
                                <p>
                                    Mu-X = <strong x-text="formatNumber(polygon.rigidMoment.muXEnvelope)"></strong> Tn&middot;m/m
                                    &middot;
                                    Mu-Y = <strong x-text="formatNumber(polygon.rigidMoment.muYEnvelope)"></strong> Tn&middot;m/m
                                </p>
                                <p class="text-[10px] text-gray-400">Mu=σ·L²/2 (voladizo, envolvente de las 11 combinaciones) — fórmula simple de E.060/ACI, no elementos finitos.</p>
                            </div>
                        </div>
                    </template>

                    {{-- Bloque 5: acero por flexión — envuelve el Mu (Bloque
                         3, peor combinación) con f'c/fy/espesor/recubrimiento
                         (Bloque 4) para dar As requerido (cm²/m) + Ø y
                         espaciamiento sugerido (ver engine/footingSteel.js).
                         Aislada → As-X/As-Y (ambos acero inferior, el
                         voladizo siempre tracciona el fondo). Combinada →
                         As+ (inferior, cerca de columnas) / As- (superior,
                         en el vano) — mismo criterio de signos que la tabla
                         de momentos de abajo.
                         Oculto por ahora (ver mostrarBloques4y5). --}}
                    <div class="mt-2 pt-2 border-t border-gray-700" x-show="mostrarBloques4y5">
                        <p class="text-[11px] font-semibold text-gray-300 mb-1">Acero por flexión (Bloque 5)</p>

                        <template x-if="!polygon.designInputs">
                            <p class="text-[11px] text-gray-500">Depende del Bloque 4 — asigna una sección primero.</p>
                        </template>

                        <template x-if="polygon.designInputs && polygon.steelDesign?.needsReview">
                            <p class="text-[11px] text-amber-400">Zapata ramificada — requiere revisión adicional, no se calcula acero automáticamente.</p>
                        </template>

                        <template x-if="polygon.designInputs && polygon.steelDesign?.type === 'isolated'">
                            <div class="text-xs text-gray-300 space-y-0.5">
                                <p x-text="steelLine('As-X (inferior)', polygon.steelDesign.x)"></p>
                                <p x-text="steelLine('As-Y (inferior)', polygon.steelDesign.y)"></p>
                            </div>
                        </template>

                        <template x-if="polygon.designInputs && polygon.steelDesign?.type === 'combined' && !polygon.steelDesign?.needsReview">
                            <div class="text-xs text-gray-300 space-y-0.5">
                                <p x-text="steelLine('As+ (inferior)', polygon.steelDesign.positivo)"></p>
                                <p x-text="steelLine('As- (superior)', polygon.steelDesign.negativo)"></p>
                            </div>
                        </template>

                        {{-- Losa de cimentación (columnas en cuadrícula 2D,
                             FASE 1) -- envolvente por eje (mismo criterio de
                             As-X/As-Y que aisladas, sin el reparto
                             positivo/negativo por tramo de la combinada
                             recta, que no aplica todavía aquí). --}}
                        <template x-if="polygon.designInputs && polygon.steelDesign?.type === 'poligono' && !polygon.steelDesign?.needsReview">
                            <div class="text-xs text-gray-300 space-y-0.5">
                                <p x-text="steelLine('As-X (envolvente)', polygon.steelDesign.x)"></p>
                                <p x-text="steelLine('As-Y (envolvente)', polygon.steelDesign.y)"></p>
                            </div>
                        </template>
                    </div>

                    {{-- Bloque 6: cortante — punzonamiento por columna (Vu=
                         Pu-qu×Ácrit vs φVc, aisladas y combinadas) + cortante
                         por flexión: a distancia d de la cara en aisladas,
                         envolvente del cortante máximo de la viga en
                         combinadas (footingMoments.js ya integra V(x) junto
                         al momento — ver engine/footingShear.js). Ramificadas
                         (L/T) siguen sin calcularse (needsReview), no por el
                         cortante sino por el mismo límite de footingMoments.js. --}}
                    <div class="mt-2 pt-2 border-t border-gray-700" x-show="mostrarBloque6">
                        <p class="text-[11px] font-semibold text-gray-300 mb-1">Verificación de cortante (Bloque 6)</p>

                        <template x-if="!polygon.designInputs">
                            <p class="text-[11px] text-gray-500">Depende del Bloque 4 — asigna una sección primero.</p>
                        </template>

                        <template x-if="polygon.designInputs && polygon.shearDesign?.needsReview">
                            <p class="text-[11px] text-amber-400">Zapata ramificada — requiere revisión adicional, no se calcula cortante automáticamente.</p>
                        </template>

                        <template x-if="polygon.designInputs && polygon.shearDesign?.type === 'isolated'">
                            <div class="text-xs text-gray-300 space-y-0.5">
                                <p x-text="shearLine('Punzonamiento', polygon.shearDesign.punching)"></p>
                                <p x-text="shearLine(polygon.shearDesign.oneWayXFem ? 'Cortante-X (MEF)' : 'Cortante-X (rígido)', polygon.shearDesign.oneWayXFem || polygon.shearDesign.oneWayX)"></p>
                                <p x-text="shearLine(polygon.shearDesign.oneWayYFem ? 'Cortante-Y (MEF)' : 'Cortante-Y (rígido)', polygon.shearDesign.oneWayYFem || polygon.shearDesign.oneWayY)"></p>
                                <template x-if="polygon.shearDesign.oneWayXFem || polygon.shearDesign.oneWayYFem">
                                    <p class="text-[10px] text-emerald-400">MEF = elementos finitos, sección crítica a distancia d de la cara — validado ~2-5% vs ETABS real (zapata centrada). Reemplaza al método rígido cuando está disponible.</p>
                                </template>
                            </div>
                        </template>

                        <template x-if="polygon.designInputs && polygon.shearDesign?.type === 'combined' && !polygon.shearDesign?.needsReview">
                            <div class="text-xs text-gray-300 space-y-0.5">
                                <template x-for="col in polygon.shearDesign.punchingByColumn" :key="col.column">
                                    <p x-text="shearLine('Punzonamiento col. ' + col.column, col.result)"></p>
                                </template>
                                <p x-text="shearLine('Cortante por flexión (viga)', polygon.shearDesign.oneWay)"></p>
                                {{-- AGREGADO (ver conversación, investigación de cortante F10/F12
                                     contra ETABS real): a diferencia del momento (que ya tiene su
                                     aviso de vano corto/región D), el cortante de combinadas no
                                     tenía ninguna advertencia -- se investigó a fondo (8 puntos
                                     reales comparados, intento de FEM que salió inestable) y se
                                     encontró que difiere 9-44% sin corrección confiable disponible
                                     -- mismo criterio que Mx: no se oculta (sigue siendo el mejor
                                     dato, y el método SÍ es el que manda la norma), pero se avisa
                                     para que el ingeniero lo revise con su propio criterio. --}}
                                {{-- AGREGADO (ver conversación, "mejorar cortante zapata
                                     combinada"): color distinto según si ESTE resultado usó la
                                     presión de contacto real (/zapatas2) o cayó al fallback
                                     uniforme -- mismo texto x-text de siempre, solo cambia el
                                     tono para que salte a la vista sin tener que leerlo entero. --}}
                                <p
                                    class="text-[10px]"
                                    :class="polygon.shearDesign.usedRealPressure ? 'text-sky-400' : 'text-amber-400'"
                                    x-text="polygon.shearDesign.advertencia"
                                ></p>
                            </div>
                        </template>

                        {{-- Losa de cimentación (columnas en cuadrícula 2D,
                             FASE 2) -- punzonamiento por columna (siempre) +
                             cortante unidireccional solo en los volados
                             reales (columnas sin vecino alineado). --}}
                        <template x-if="polygon.designInputs && polygon.shearDesign?.type === 'poligono' && !polygon.shearDesign?.needsReview">
                            <div class="text-xs text-gray-300 space-y-0.5">
                                <template x-for="col in polygon.shearDesign.punchingByColumn" :key="col.column">
                                    <p x-text="shearLine('Punzonamiento col. ' + col.column, col.result)"></p>
                                </template>
                                <template x-for="ow in polygon.shearDesign.oneWayByColumn" :key="ow.column + '-' + ow.direccion">
                                    <p x-text="shearLine(ow.etiqueta + ' col. ' + ow.column, ow.result)"></p>
                                </template>
                                <p class="text-[10px] text-amber-400" x-text="polygon.shearDesign.advertencia"></p>
                            </div>
                        </template>
                    </div>
                </fieldset>
            </template>

            {{-- Mapa de presiones: pestaña por combinación, 1 gráfico activo --}}
            <p class="text-[11px] font-semibold text-gray-300 mb-1">Mapa de presiones por combinación</p>

            <div class="flex flex-wrap gap-1 mb-2">
                <template x-for="(combo, index) in loadCombinations" :key="index">
                    <button @click="selectCombo(index)"
                        class="px-2 py-1 rounded text-xs border"
                        :class="selectedComboIndex === index ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-700'">
                        Comb <span x-text="index + 1"></span>
                    </button>
                </template>
            </div>

            <div id="zapata-plot" style="height:420px; background:#0f172a; border:1px solid #334155; border-radius:8px"></div>

            <div class="mt-3 overflow-auto" style="max-height:180px">
                <table class="w-full text-xs">
                    <thead>
                        <tr class="text-gray-400 text-left">
                            <th class="py-1 pr-2">Polígono</th>
                            <th class="py-1 pr-2">σmin (Tn/m²)</th>
                            <th class="py-1 pr-2">σmax (Tn/m²)</th>
                            <th class="py-1 pr-2">XC</th>
                            <th class="py-1 pr-2">YC</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="row in summaryRows" :key="row.polygon">
                            <tr class="border-t border-gray-700">
                                <td class="py-1 pr-2" x-text="row.polygon"></td>
                                <td class="py-1 pr-2" x-text="formatNumber(row.min)"></td>
                                <td class="py-1 pr-2" x-text="formatNumber(row.max)"></td>
                                <td class="py-1 pr-2" x-text="formatNumber(row.XC)"></td>
                                <td class="py-1 pr-2" x-text="formatNumber(row.YC)"></td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="flex justify-center gap-2 px-4 py-3 border-t border-gray-700">
            <button @click="close()" class="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm">Close</button>
        </div>
    </div>
</div>

<script>
    function zapataResultsModal() {
        return {
            open: false,
            loadCombinations: [],
            polygonProperties: [],
            summary: { df: null, gammaE: null, columnsCount: 0 },
            selectedComboIndex: 0,
            summaryRows: [],
            // AGREGADO (ver conversación): Bloques 4 y 5 (datos de diseño,
            // acero por flexión) ocultos por ahora para la presentación al
            // cliente -- el cálculo sigue corriendo igual por dentro
            // (Bloque 6 y el propio Bloque 5 lo siguen usando), solo se
            // oculta la vista. Cambiar a `true` (o agregar un toggle en el
            // futuro) para volver a mostrarlos.
            mostrarBloques4y5: false,
            // REVERTIDO (ver conversación, "no veo las propiedades de la
            // zapata" 2026-09-14): estaba oculto por defecto ("Propiedades
            // geométricas del polígono" -- Área/Perímetro/Ix/Iy/Centroide +
            // tabla de puntos) para la presentación al cliente. Vuelve a
            // true para poder verificar a simple vista que A/Ix/Iy/Xc/Yc
            // ahora descuentan las figuras de corte (ver
            // buildZapataPolygonProperties, foundationContract.js). El
            // cálculo siempre siguió corriendo igual, solo cambia si se ve.
            mostrarGeometria: true,
            // AGREGADO (ver conversación, "oculta el bloque 6" 2026-09-14):
            // mismo criterio que mostrarBloques4y5/mostrarGeometria -- el
            // cálculo de punzonamiento/cortante unidireccional (Bloque 6)
            // sigue corriendo igual por dentro (el propio Bloque 5 no
            // depende de él), solo se esconde la vista.
            mostrarBloque6: false,
            // AGREGADO (ver conversación, "está de más: capacidad portante
            // del suelo / K de balasto, no los estoy usando" 2026-09-14):
            // mismo criterio -- oculta ambos bloques (Bloque 2b: σ
            // admisible vs σmax; Bloque 2c: K30/AASHTO LRFD Vesic), sin
            // dejar de calcularlos (setSigmaAdmisible/polygon.soilChecks
            // siguen funcionando si algún día se vuelve a mostrar).
            mostrarCapacidadPortante: false,
            // AGREGADO (ver conversación, "oculta momento y cortante de
            // referencia - elementos finitos" 2026-09-14): mismo criterio
            // -- oculta el Bloque 3b/6b (Mx/My/Mxy/V13/V23/VMax de
            // elementos finitos con su advertencia larga), sin dejar de
            // calcularlo (polygon.shellMomentReference sigue poblándose).
            mostrarShellMomentReference: false,
            formatNumber(value) {
                // AGREGADO (ver conversación, región D en combinadas): Number(null)
                // es 0 (finito) -- sin este chequeo, un valor suprimido a propósito
                // (region D, sin dato confiable) se mostraba como "0.00", que parece
                // un momento real de diseño en vez de "no hay dato".
                if (value === null || value === undefined) return '-';
                const number = Number(value);
                return Number.isFinite(number) ? number.toFixed(2) : '-';
            },
            // Bloque 2b — persiste σ admisible en la zapata real (para que
            // quede guardada con el modelo) y recalcula el badge OK/EXCEDE
            // al toque, sin tener que volver a correr "Calcular Zapatas"
            // (σmaxEnvelope ya está calculado, no depende de este valor).
            setSigmaAdmisible(polygon) {
                window.cadSystem?.setZapataSigmaAdmisible?.(polygon.id, polygon.sigmaAdmisible);
                polygon.bearingCheck = polygon.sigmaAdmisible
                    ? { ok: polygon.sigmaMaxEnvelope <= polygon.sigmaAdmisible, ratio: polygon.sigmaMaxEnvelope / polygon.sigmaAdmisible }
                    : null;
            },
            // Bloque 5 — línea de texto para un resultado de footingSteel.js
            // ({as, asMin, governedBy, overReinforced, rebar}). `steel` es
            // null si falta el Bloque 4 (ver buildSteelResult en foundation.js).
            steelLine(label, steel) {
                if (!steel) return `${label}: —`;
                if (steel.overReinforced) return `${label}: sección insuficiente — aumentar espesor`;
                if (steel.as == null) return `${label}: —`;

                const govTxt = steel.governedBy === 'min' ? ' (cuantía mínima)' : '';
                let rebarTxt = '';
                if (steel.rebar) {
                    rebarTxt = ` → Ø${steel.rebar.label} @ ${steel.rebar.spacingCm}cm`;
                    if (steel.rebar.tooTight) rebarTxt += ' ⚠️ espaciamiento muy apretado — considera 2 capas, otra barra, o mayor espesor';
                }
                return `${label}: As=${steel.as.toFixed(2)} cm²/m${govTxt}${rebarTxt}`;
            },
            // Bloque 6 — línea de texto para un resultado de footingShear.js
            // ({vuTon, phiVcTon, ratio, ok}). `shear` es null si faltan datos
            // (columna/espesor inválidos) — ver computePunchingShear/computeOneWayShear.
            shearLine(label, shear) {
                if (!shear) return `${label}: —`;
                const estado = shear.ok ? 'OK' : 'NO CUMPLE';
                return `${label}: Vu=${shear.vuTon.toFixed(2)} Tn / φVc=${shear.phiVcTon.toFixed(2)} Tn (${estado})`;
            },
            init() {
                window.addEventListener('open-zapata-results-modal', async (e) => {
                    this.loadCombinations = e.detail?.loadCombinations || [];
                    this.polygonProperties = e.detail?.polygonProperties || [];
                    this.summary = {
                        df: e.detail?.df ?? null,
                        gammaE: e.detail?.gammaE ?? null,
                        columnsCount: e.detail?.columnsCount ?? 0,
                    };
                    this.selectedComboIndex = 0;
                    this.open = true;

                    await this.$nextTick();
                    this.renderActive();
                });
            },
            selectCombo(index) {
                this.selectedComboIndex = index;
                this.renderActive();
            },
            renderActive() {
                window.cadSystem?.renderZapataPlot?.('zapata-plot', this.selectedComboIndex);
                this.summaryRows = window.cadSystem?.getZapataSummaryRows?.(this.selectedComboIndex) || [];
            },
            close() {
                window.cadSystem?.purgeZapataPlots?.(['zapata-plot']);
                this.open = false;
            },
        };
    }
</script>
