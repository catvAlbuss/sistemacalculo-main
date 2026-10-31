<!-- Cargas-->
            <div x-show="activeTab === 'cargas'">
                <div x-data="cargas" class="cuaderno p-4 max-w-full mx-auto font-mono">
                    <!-- ERRORES -->
                    <div x-show="hasErrors" class="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <h4 class="font-semibold text-red-800 mb-2">Errores encontrados:</h4>
                        <ul class="text-sm text-red-700">
                            <template x-for="error in errors" :key="error.id">
                                <li x-text="error.message"></li>
                            </template>
                        </ul>
                    </div>
                    <div class="p-4 bg-slate-50 bg-transparent rounded shadow-sm">
                        <div class="flex items-center justify-between cursor-pointer mb-3"
                            @click="showCargasEmpuje = !showCargasEmpuje">
                            <h3 class="text-lg font-semibold text-gray-950 flex items-center">
                                <i class="fas fa-ruler-combined mr-2"></i>CARGAS
                            </h3>
                            <span class="text-xs text-gray-950"
                                x-text="showCargasEmpuje ? 'Ocultar' : 'Mostrar'"></span>
                        </div>
                        <!-- LAYOUT PRINCIPAL -->
                        <div x-show="showCargasEmpuje" class="wall-loads-layout">
                            <!-- RESULTADOS DE CÁLCULO -->
                            <section class="wall-loads-params">
                                <!-- PARÁMETROS BASE -->
                                <div class="p-4 bg-slate-50 bg-transparent border border-slate-300 rounded shadow-sm">
                                    <div class="flex items-center justify-between cursor-pointer mb-3"
                                        @click="showParametros = !showParametros">
                                        <h3 class="text-lg font-semibold text-gray-950 flex items-center">
                                            <i class='fas fa-calculator mr-2 text-gray-950'></i>
                                            Parámetros Base
                                        </h3>
                                        <span class="text-xs text-gray-500"
                                            x-text="showParametros ? 'Ocultar' : 'Mostrar'"></span>
                                    </div>
                                    <div x-show="showParametros" class="space-y-2">
                                        <div
                                            class="grid grid-cols-3 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
                                            <span>Parámetro</span>
                                            <span>Símbolo</span>
                                            <span>Valor</span>
                                        </div>
                                        <template x-for="param in parametrosBase" :key="param.key">
                                            <div class="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-gray-50">
                                                <span class="text-gray-700" x-text="param.label"></span>
                                                <span class="text-gray-500 font-mono" x-text="param.symbol"></span>
                                                <span class="font-medium"
                                                    x-text="getParameterValue(param.key, param.unit)"></span>
                                            </div>
                                        </template>
                                    </div>
                                </div>

                                <!-- EMPUJE PASIVO DEL SUELO -->
                                <div class="p-4 bg-slate-50 bg-transparent border border-slate-300 rounded shadow-sm">
                                    <div class="flex items-center justify-between cursor-pointer mb-3"
                                        @click="showEmpujePasivo = !showEmpujePasivo">
                                        <h3 class="text-lg font-semibold text-gray-950 flex items-center">
                                            <i class='fas fa-arrow-left mr-2 text-gray-950'></i>
                                            Empuje Pasivo del Suelo
                                        </h3>
                                        <span class="text-xs text-gray-500"
                                            x-text="showEmpujePasivo ? 'Ocultar' : 'Mostrar'"></span>
                                    </div>
                                    <div x-show="showEmpujePasivo" class="space-y-2">
                                        <div
                                            class="grid grid-cols-3 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
                                            <span>Parámetro</span>
                                            <span>Símbolo</span>
                                            <span>Valor</span>
                                        </div>
                                        <template x-for="param in empujePasivoParams" :key="param.key">
                                            <div class="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-gray-50">
                                                <span class="text-gray-700" x-text="param.label"></span>
                                                <span class="text-gray-500 font-mono" x-text="param.symbol"></span>
                                                <span class="font-medium"
                                                    x-text="getParameterValue(param.key, param.unit)"></span>
                                            </div>
                                        </template>
                                    </div>
                                </div>

                                <!-- EMPUJE ACTIVO DEL SUELO -->
                                <div
                                    class="p-4 bg-slate-50 bg-transparent border border-slate-300 rounded shadow-sm">
                                    <div class="flex items-center justify-between cursor-pointer mb-3"
                                        @click="showEmpujeActivo = !showEmpujeActivo">
                                        <h3 class="text-lg font-semibold text-gray-950 flex items-center">
                                            <i class='fas fa-arrow-right mr-2 text-gray-950'></i>
                                            Empuje Activo del Suelo
                                        </h3>
                                        <span class="text-xs text-gray-500"
                                            x-text="showEmpujeActivo ? 'Ocultar' : 'Mostrar'"></span>
                                    </div>
                                    <div x-show="showEmpujeActivo" class="space-y-2">
                                        <div
                                            class="grid grid-cols-3 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
                                            <span>Parámetro</span>
                                            <span>Símbolo</span>
                                            <span>Valor</span>
                                        </div>
                                        <template x-for="param in empujeActivoParams" :key="param.key">
                                            <div class="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-gray-50">
                                                <span class="text-gray-700" x-text="param.label"></span>
                                                <span class="text-gray-500 font-mono" x-text="param.symbol"></span>
                                                <span class="font-medium"
                                                    x-text="getParameterValue(param.key, param.unit)"></span>
                                            </div>
                                        </template>
                                    </div>
                                </div>

                                <!-- EMPUJE DE SOBRECARGA -->
                                <div
                                    class="p-4 bg-slate-50 bg-transparent border border-slate-300 rounded shadow-sm">
                                    <div class="flex items-center justify-between cursor-pointer mb-3"
                                        @click="showEmpujeSobrecarga = !showEmpujeSobrecarga">
                                        <h3 class="text-lg font-semibold text-gray-950 flex items-center">
                                            <i class='fas fa-weight-hanging mr-2 text-gray-950'></i>
                                            Empuje de Sobrecarga
                                        </h3>
                                        <span class="text-xs text-gray-500"
                                            x-text="showEmpujeSobrecarga ? 'Ocultar' : 'Mostrar'"></span>
                                    </div>
                                    <div x-show="showEmpujeSobrecarga" class="space-y-2">
                                        <div
                                            class="grid grid-cols-3 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
                                            <span>Parámetro</span>
                                            <span>Símbolo</span>
                                            <span>Valor</span>
                                        </div>
                                        <template x-for="param in empujeSobrecargaParams" :key="param.key">
                                            <div class="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-gray-50">
                                                <span class="text-gray-700" x-text="param.label"></span>
                                                <span class="text-gray-500 font-mono" x-text="param.symbol"></span>
                                                <span class="font-medium"
                                                    x-text="getParameterValue(param.key, param.unit)"></span>
                                            </div>
                                        </template>
                                    </div>
                                </div>

                                <!-- CARGAS SISMICOS -->
                                <div
                                    class="p-4 bg-slate-50 bg-transparent border border-slate-300 rounded shadow-sm">
                                    <div class="flex items-center justify-between cursor-pointer mb-3"
                                        @click="showCargaSismico = !showCargaSismico">
                                        <h3 class="text-lg font-semibold text-gray-950 flex items-center">
                                            <i class='fas fa-weight-hanging mr-2 text-gray-950'></i>
                                            CARGAS SISMICA
                                        </h3>
                                        <span class="text-xs text-gray-500"
                                            x-text="showCargaSismico ? 'Ocultar' : 'Mostrar'"></span>
                                    </div>
                                    <div x-show="showCargaSismico" class="space-y-2">
                                        <div
                                            class="grid grid-cols-3 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
                                            <span>Parámetro</span>
                                            <span>Símbolo</span>
                                            <span>Valor</span>
                                        </div>
                                        <template x-for="param in cargaSismicos" :key="param.key">
                                            <div class="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-gray-50">
                                                <span class="text-gray-700" x-text="param.label"></span>
                                                <span class="text-gray-500 font-mono" x-text="param.symbol"></span>
                                                <span class="font-medium"
                                                    x-text="getParameterValue(param.key, param.unit)"></span>
                                            </div>
                                        </template>

                                        <section class="space-y-4">
                                            <table class="w-full text-xs border-collapse border border-gray-300">
                                                <thead class="bg-gray-100">
                                                    <tr>
                                                        <th class="border border-gray-300 p-2 text-left">Símbolo</th>
                                                        <th class="border border-gray-300 p-2 text-right">°</th>
                                                        <th class="border border-gray-300 p-2 text-right">RAD</th>
                                                        <th class="border border-gray-300 p-2 text-left">Descripción
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <template x-for="item in cargasisicatable" :key="item.label">
                                                        <tr class="hover:bg-gray-50">
                                                            <td class="border p-2 font-mono text-center"
                                                                x-text="item.label"></td>
                                                            <td class="border p-2 text-right"
                                                                x-text="formatValue(getValue(item.gradosKey))"></td>
                                                            <td class="border p-2 text-right"
                                                                x-text="formatValue(getValue(item.radianesKey))"></td>
                                                            <td class="border p-2 text-gray-700 italic"
                                                                x-text="item.description || '-'"></td>
                                                        </tr>
                                                    </template>
                                                </tbody>
                                            </table>
                                        </section>
                                    </div>
                                </div>
                            </section>

                            <!-- VISUALIZACIÓN GRÁFICA -->
                            <section
                                class="p-6 bg-slate-50 col-span-2 bg-transparent border border-slate-300 rounded shadow-sm">
                                <h3 class="text-lg font-semibold text-gray-950 mb-4 flex items-center">
                                    <i class='fas fa-chart-bar mr-2 text-gray-950'></i>
                                    Diagrama de Empujes
                                </h3>
                                <div id="diagrama-empujes" class="wall-drawing" x-html="diagramaEmpujes"></div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
