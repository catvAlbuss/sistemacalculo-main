<!-- Verificaciones-->
            <div x-show="activeTab === 'verificaciones'">
                <div x-data="verificaciones" class="cuaderno p-4 max-w-full mx-auto font-mono">
                    <!-- ENTRADAS Y SALIDAS -->
                    <div class="grid grid-cols-1 md:grid-cols-1 gap-2">
                        <!-- DATOS: VERIFICACIONES -->
                        <div class="mt-2 p-2 bg-gray-50 border border-gray-300 rounded shadow-sm">
                            <div class="flex items-center justify-between cursor-pointer mb-3"
                                @click="showCombinacioncero = !showCombinacioncero">
                                <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                                    <i class='fas fa-table mr-2 text-gray-500'></i>
                                    VERIFICACIONES
                                </h3>
                                <span class="text-xs text-gray-500"
                                    x-text="showCombinacioncero ? 'Ocultar' : 'Mostrar'"></span>
                            </div>

                            <div x-show="showCombinacioncero" class="overflow-x-auto">
                                <table class="w-full text-sm border-collapse border border-gray-300">
                                    <thead class="bg-gray-100">
                                        <tr>
                                            <th class="border border-gray-300 p-2 text-left">COMPONENTE</th>
                                            <th class="border border-gray-300 p-2 text-left">AREA(m²)</th>
                                            <th class="border border-gray-300 p-2 text-left">Fy PESO(Tn)</th>
                                            <th class="border border-gray-300 p-2 text-left">Fx(Tn)</th>
                                            <th class="border border-gray-300 p-2 text-left">Brazo (y)m</th>
                                            <th class="border border-gray-300 p-2 text-left">Brazo (x)m</th>
                                            <th class="border border-gray-300 p-2 text-left">MOMENTO(Tn-m)</th>
                                            <th class="border border-gray-300 p-2 text-left">P Friccion</th>
                                            <th class="border border-gray-300 p-2 text-left">DESCRIPCION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <template x-for="tablecargas in combinacionestable"
                                            :key="tablecargas.key || tablecargas.label">
                                            <tr class="hover:bg-gray-50">
                                                <td class="border border-gray-300 p-2" x-text="tablecargas.label">
                                                </td>
                                                <td class="border border-gray-300 p-2 text-right"
                                                    x-text="formatValue(getValue(tablecargas.areaKey))"></td>
                                                <td class="border border-gray-300 p-2 text-right"
                                                    x-text="formatValue(getValue(tablecargas.pesoKey))"></td>
                                                <td class="border border-gray-300 p-2 text-right"
                                                    x-text="formatValue(getValue(tablecargas.fxKey))"></td>
                                                <td class="border border-gray-300 p-2 text-right"
                                                    x-text="formatValue(getValue(tablecargas.brazoYKey))"></td>
                                                <td class="border border-gray-300 p-2 text-right"
                                                    x-text="formatValue(getValue(tablecargas.brazoXKey))"></td>
                                                <td class="border border-gray-300 p-2 text-right"
                                                    x-text="formatValue(getValue(tablecargas.momentoKey))"></td>
                                                <td class="border border-gray-300 p-2 text-right"
                                                    x-text="formatValue(getValue(tablecargas.friccionKey))"></td>
                                                <td class="border border-gray-300 p-2 text-left"
                                                    x-text="tablecargas.description"></td>
                                            </tr>
                                        </template>
                                    </tbody>
                                </table>

                                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <!-- N-->
                                    <div class="flex flex-row">
                                        <span>N = </span>
                                        <span x-text="datosCalculados.C186">2.07 m</span>
                                    </div>

                                    <!-- Mr -->
                                    <div class="flex flex-row">
                                        <span>Mr = </span>
                                        <span x-text="datosCalculados.G186">2.07 m</span>
                                    </div>

                                    <!-- AREA DE CONCRETO -->
                                    <div class="flex flex-row">
                                        <span>AREA DE CONCRETO = </span>
                                        <span x-text="datosCalculados.C187 + ' m²'">2.07 m</span>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div class="">
                                    <div class="flex items-center justify-between cursor-pointer mb-3"
                                        @click="showCombinacioncargas = !showCombinacioncargas">
                                        <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                                            <i class='fas fa-table mr-2 text-gray-500'></i>
                                            COMBINACION DE CARGAS
                                        </h3>
                                        <span class="text-xs text-gray-500"
                                            x-text="showCombinacioncargas ? 'Ocultar' : 'Mostrar'"></span>
                                    </div>

                                    <div x-show="showCombinacioncargas" class="overflow-x-auto">
                                        <div id="table-combinacion-cargas"
                                            class="border border-slate-200 rounded-lg overflow-hidden"></div>
                                    </div>
                                </div>
                                <div class="">
                                    <div class="flex items-center justify-between cursor-pointer mb-3"
                                        @click="showEstabilidadVolteo = !showEstabilidadVolteo">
                                        <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                                            <i class='fas fa-table mr-2 text-gray-500'></i>
                                            VERIFICACION DE ESTABILIDAD A VOLTEO DEL MURO
                                        </h3>
                                        <span class="text-xs text-gray-500"
                                            x-text="showEstabilidadVolteo ? 'Ocultar' : 'Mostrar'"></span>
                                    </div>

                                    <div x-show="showEstabilidadVolteo" class="overflow-x-auto">
                                        <div id="table-Estabilidad-Volteo"
                                            class="border border-slate-200 rounded-lg overflow-hidden"></div>
                                    </div>
                                </div>
                                <div class="">
                                    <div class="flex items-center justify-between cursor-pointer mb-3"
                                        @click="showEstabilidadDeslizamiento = !showEstabilidadDeslizamiento">
                                        <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                                            <i class='fas fa-table mr-2 text-gray-500'></i>
                                            VERIFICACION DE ESTABILIDAD A DESLIZAMIENTO DEL MURO
                                        </h3>
                                        <span class="text-xs text-gray-500"
                                            x-text="showEstabilidadDeslizamiento ? 'Ocultar' : 'Mostrar'"></span>
                                    </div>

                                    <div x-show="showEstabilidadDeslizamiento" class="overflow-x-auto">
                                        <div id="table-Estabilidad-Deslizamiento"
                                            class="border border-slate-200 rounded-lg overflow-hidden">
                                        </div>
                                    </div>
                                </div>
                                <div class="">
                                    <div class="flex items-center justify-between cursor-pointer mb-3"
                                        @click="showpresionesAdmisibles = !showpresionesAdmisibles">
                                        <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                                            <i class='fas fa-table mr-2 text-gray-500'></i>
                                            VERIFICACION DE PRESIONES ADMISIBLES
                                        </h3>
                                        <span class="text-xs text-gray-500"
                                            x-text="showpresionesAdmisibles ? 'Ocultar' : 'Mostrar'"></span>
                                    </div>

                                    <div x-show="showpresionesAdmisibles" class="overflow-x-auto">
                                        <div id="table-Presiones-Admisibles"
                                            class="border border-slate-200 rounded-lg overflow-hidden">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center justify-between cursor-pointer mb-4"
                                @click="showGrafico = !showGrafico">
                                <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                                    <i class='fas fa-table mr-2 text-gray-500'></i>
                                    GRAFICO
                                </h3>
                                <span class="text-xs text-gray-500"
                                    x-text="showGrafico ? 'Ocultar' : 'Mostrar'"></span>
                            </div>

                            <div x-show="showGrafico" class="overflow-x-auto">
                                <div id="grafico-verificaciones"
                                    class="w-full bg-gray-50 border border-gray-200 rounded"
                                    style="height: 420px; min-height: 420px;"></div>
                            </div>
                        </div>

                        <!-- Mostrar errores si existen -->
                        <div x-show="hasErrors" class="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                            <h4 class="text-red-800 font-semibold mb-2">Errores encontrados:</h4>
                            <template x-for="error in errors" :key="error.id">
                                <div class="text-red-700 text-sm" x-text="error.message"></div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
