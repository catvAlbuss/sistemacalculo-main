<!-- Analisis Estructurales -->
            <div x-show="activeTab === 'analisisEstructuras'">
                <div x-data="analisisestructural()" class="cuaderno p-4 max-w-full mx-auto font-mono">
                    <!-- Navegación de Elementos -->
                    <div class="mb-2 p-1">
                        <div class="flex flex-wrap gap-2 justify-center">
                            <button @click="cambiarElemento('pantalla')"
                                :class="activeElement === 'pantalla' ? 'bg-yellow-500 text-white' :
                                    'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                                class="px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                <i class="fas fa-grip-lines-vertical mr-2"></i>PANTALLA
                            </button>
                            <button @click="cambiarElemento('punta')"
                                :class="activeElement === 'punta' ? 'bg-orange-500 text-white' :
                                    'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                                class="px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                <i class="fas fa-arrow-left-long mr-2"></i>PUNTA
                            </button>
                            <button @click="cambiarElemento('talon')"
                                :class="activeElement === 'talon' ? 'bg-blue-500 text-white' :
                                    'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                                class="px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                <i class="fas fa-arrow-right-long mr-2"></i>TALÓN
                            </button>
                            <button @click="cambiarElemento('key')"
                                :class="activeElement === 'key' ? 'bg-green-500 text-white' :
                                    'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                                class="px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                <i class="fas fa-arrow-down-long mr-2"></i>DENTELLÓN
                            </button>
                            <button @click="cambiarElemento('todos')"
                                :class="activeElement === 'todos' ? 'bg-purple-600 text-white' :
                                    'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                                class="px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                <i class="fas fa-table-cells-large mr-2"></i>VER TODO
                            </button>
                        </div>
                    </div>

                    <!-- Criterios del análisis -->
                    <div class="wall-analysis-criteria">
                        <label>Diseño con
                            <select x-model="criterios.mode" @change="calcularAnalisis()">
                                <template x-for="caso in casosDiseno" :key="caso">
                                    <option :value="caso" :selected="caso === criterios.mode" x-text="caso"></option>
                                </template>
                            </select>
                        </label>
                        <label>Corte pantalla X₂ (m)
                            <input type="number" step="0.05" min="0" x-model.number="criterios.stemShearAt" @change="calcularAnalisis()">
                        </label>
                        <label>Recorte pantalla X₃ (m)
                            <input type="number" step="0.1" min="0" x-model.number="criterios.stemCutoff" @change="calcularAnalisis()">
                        </label>
                        <label>Recorte talón X₃ (m)
                            <input type="number" step="0.1" min="0" x-model.number="criterios.heelCutoff" @change="calcularAnalisis()">
                        </label>
                        <label>Pedestal X₄ (m)
                            <input type="number" step="0.05" min="0" x-model.number="criterios.pedestal" @change="calcularAnalisis()">
                        </label>
                    </div>

                    <!-- Contenedor Principal de Elementos -->
                    <div class="space-y-2 mb-2">

                        <!-- PANTALLA -->
                        <div x-show="activeElement === 'pantalla' || activeElement === 'todos'"
                            x-transition:enter="transition ease-out duration-300"
                            x-transition:enter-start="opacity-0 transform scale-95"
                            x-transition:enter-end="opacity-100 transform scale-100"
                            class="border-2 rounded-xl p-4 shadow-lg">

                            <h3 class="text-lg font-bold text-center mb-4 py-2 rounded-lg">
                                <i class="fas fa-grip-lines-vertical mr-2"></i>PANTALLA
                            </h3>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <!-- Parámetros PANTALLA -->
                                <div class="rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm"><i class="fas fa-sliders mr-2"></i>Parámetros de Entrada</h4>
                                    <div class="space-y-2">

                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q1 (Tn/m²):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(pantalla.resultados.B277)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q2 (Tn/m²):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(pantalla.resultados.B278)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">L (m):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(pantalla.resultados.B279)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">X₁:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(pantalla.resultados.B280)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">X₂:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(pantalla.resultados.B281)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">X₃:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(pantalla.resultados.B282)"></span>
                                        </div>

                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">w:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(pantalla.resultados.E280)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">a:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(pantalla.resultados.E281)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">b:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(pantalla.resultados.E282)"></span>
                                        </div>

                                    </div>
                                </div>

                                <!-- Resultados PANTALLA -->
                                <div class="rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm"><i class="fas fa-square-poll-horizontal mr-2"></i>Resultados</h4>

                                    <!-- Tabla de Fuerzas -->
                                    <div class="rounded-lg p-2 mb-3">
                                        <div class="grid grid-cols-5 gap-1 text-xs font-semibold text-gray-600 mb-1">
                                            <div></div>
                                            <div class="text-center">1</div>
                                            <div class="text-center">2</div>
                                            <div class="text-center">TOTAL</div>
                                            <div class="text-center">SISMO</div>
                                        </div>
                                        <div class="space-y-1 text-xs">
                                            <div class="grid grid-cols-5 gap-1">
                                                <div class="font-medium">V(X₂)</div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(pantalla.resultados.B286)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(pantalla.resultados.C286)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(pantalla.resultados.D286)"></div>
                                                <div class="text-center font-bold text-red-600"
                                                    x-text="formatearNumero(pantalla.resultados.E286)"></div>
                                            </div>
                                            <div class="grid grid-cols-5 gap-1">
                                                <div class="font-medium">M(X₁)</div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(pantalla.resultados.B287)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(pantalla.resultados.C287)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(pantalla.resultados.D287)"></div>
                                                <div class="text-center font-bold text-blue-600"
                                                    x-text="formatearNumero(pantalla.resultados.E287)"></div>
                                            </div>
                                            <div class="grid grid-cols-5 gap-1">
                                                <div class="font-medium">M(X₃)</div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(pantalla.resultados.B288)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(pantalla.resultados.C288)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(pantalla.resultados.D288)"></div>
                                                <div class="text-center font-bold text-blue-600"
                                                    x-text="formatearNumero(pantalla.resultados.E288)"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Momentos y Cortantes Últimos -->
                                    <div class="bg-red-50 rounded-lg p-2 border-l-4 border-red-500">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="font-semibold text-red-700 text-sm">Mᵤ =</span>
                                            <span class="font-bold text-red-700 text-sm"
                                                x-text="formatearNumero(pantalla.resultados.B290) + ' Tn·m'"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <span class="font-semibold text-red-700 text-sm">Vᵤ =</span>
                                            <span class="font-bold text-red-700 text-sm"
                                                x-text="formatearNumero(pantalla.resultados.B291) + ' Tn'"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PUNTA -->
                        <div x-show="activeElement === 'punta' || activeElement === 'todos'"
                            x-transition:enter="transition ease-out duration-300"
                            x-transition:enter-start="opacity-0 transform scale-95"
                            x-transition:enter-end="opacity-100 transform scale-100"
                            class="border-2 rounded-xl p-4 shadow-lg">

                            <h3 class="text-lg font-bold text-center mb-4 py-2 rounded-lg">
                                <i class="fas fa-arrow-left-long mr-2"></i>PUNTA
                            </h3>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <!-- Parámetros PUNTA -->
                                <div class="bg-white rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm"><i class="fas fa-sliders mr-2"></i>Parámetros de Entrada</h4>
                                    <div class="space-y-2">
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">Peso Propio::</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(punta.resultados.H277)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q1 (Tn/m²):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(punta.resultados.H278)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q2 (Tn/m²):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(punta.resultados.H279)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">L (m):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(punta.resultados.H280)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">X₁ (m):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(punta.resultados.H281)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">X₂ (m):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(punta.resultados.H282)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">w:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(punta.resultados.K280)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">a:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(punta.resultados.K281)"></span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Resultados PUNTA -->
                                <div class="bg-white rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm"><i class="fas fa-square-poll-horizontal mr-2"></i>Resultados</h4>

                                    <div class="bg-gray-50 rounded-lg p-2 mb-3">
                                        <div class="grid grid-cols-5 gap-1 text-xs font-semibold text-gray-600 mb-1">
                                            <div></div>
                                            <div class="text-center">1</div>
                                            <div class="text-center">2</div>
                                            <div class="text-center">TOTAL</div>
                                            <div class="text-center">p.p</div>
                                        </div>

                                        <div class="space-y-1 text-xs">
                                            <div class="grid grid-cols-5 gap-1">
                                                <div class="font-medium">V(X₂)</div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(punta.resultados.H287)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(punta.resultados.I287)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(punta.resultados.J287)"></div>
                                                <div class="text-center font-bold text-red-600"
                                                    x-text="formatearNumero(punta.resultados.K287)">
                                                </div>
                                            </div>
                                            <div class="grid grid-cols-5 gap-1">
                                                <div class="font-medium">M(X₁)</div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(punta.resultados.H288)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(punta.resultados.I288)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(punta.resultados.J288)"></div>
                                                <div class="text-center font-bold text-blue-600"
                                                    x-text="formatearNumero(punta.resultados.K288)"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-orange-50 rounded-lg p-2 border-l-4 border-orange-500">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="font-semibold text-orange-700 text-sm">Mᵤ =</span>
                                            <span class="font-bold text-orange-700 text-sm"
                                                x-text="formatearNumero(punta.resultados.H290) + ' Tn·m'"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <span class="font-semibold text-orange-700 text-sm">Vᵤ =</span>
                                            <span class="font-bold text-orange-700 text-sm"
                                                x-text="formatearNumero(punta.resultados.H291) + ' Tn'"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- TALON -->
                        <div x-show="activeElement === 'talon' || activeElement === 'todos'"
                            x-transition:enter="transition ease-out duration-300"
                            x-transition:enter-start="opacity-0 transform scale-95"
                            x-transition:enter-end="opacity-100 transform scale-100"
                            class="border-2 rounded-xl p-4 shadow-lg">

                            <h3 class="text-lg font-bold text-center mb-4 py-2 rounded-lg">
                                <i class="fas fa-arrow-right-long mr-2"></i>TALÓN
                            </h3>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <!-- Parámetros TALON -->
                                <div class="bg-white rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm"><i class="fas fa-sliders mr-2"></i>Parámetros de Entrada</h4>
                                    <div class="space-y-2">
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">Peso Propio (Tn/m²):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.N277)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">P. Terreno (Tn/m²):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.N278)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q1 (Tn/m²):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.N279)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q2 (Tn/m²):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.N280)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">L (m):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.N281)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">X₁:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.N282)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">X₂:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.N283)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">X₃:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.N284)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">X₄:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.Q284)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">w:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.Q280)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">a:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.Q281)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">b:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.Q282)"></span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Resultados TALON -->
                                <div class="bg-white rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm"><i class="fas fa-square-poll-horizontal mr-2"></i>Resultados</h4>

                                    <div class="bg-gray-50 rounded-lg p-2 mb-3">
                                        <div class="grid grid-cols-6 gap-1 text-xs font-semibold text-gray-600 mb-1">
                                            <div></div>
                                            <div class="text-center">1</div>
                                            <div class="text-center">2</div>
                                            <div class="text-center">TOTAL</div>
                                            <div class="text-center">P.P</div>
                                            <div class="text-center">P.T</div>
                                        </div>

                                        <div class="space-y-1 text-xs">
                                            <div class="grid grid-cols-6 gap-1">
                                                <div class="font-medium">VX₄</div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.N286)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.O286)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.P286)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.Q286)"></div>
                                                <div class="text-center font-bold text-red-600"
                                                    x-text="formatearNumero(talon.resultados.R286)">
                                                </div>
                                            </div>
                                            <div class="grid grid-cols-6 gap-1">
                                                <div class="font-medium">V(X₂)</div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.N287)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.O287)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.P287)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.Q287)"></div>
                                                <div class="text-center font-bold text-red-600"
                                                    x-text="formatearNumero(talon.resultados.R287)">
                                                </div>
                                            </div>
                                            <div class="grid grid-cols-6 gap-1">
                                                <div class="font-medium">M(X₁)</div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.N288)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.O288)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.P288)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.Q288)"></div>
                                                <div class="text-center font-bold text-blue-600"
                                                    x-text="formatearNumero(talon.resultados.R288)"></div>
                                            </div>
                                            <div class="grid grid-cols-6 gap-1">
                                                <div class="font-medium">M(X₃)</div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.N289)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.O289)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.P289)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(talon.resultados.Q289)"></div>
                                                <div class="text-center font-bold text-blue-600"
                                                    x-text="formatearNumero(talon.resultados.R289)"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-blue-50 rounded-lg p-2 border-l-4 border-blue-500">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="font-semibold text-blue-700 text-sm">Mᵤ =</span>
                                            <span class="font-bold text-blue-700 text-sm"
                                                x-text="formatearNumero(talon.resultados.N290) + ' Tn·m'"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <span class="font-semibold text-blue-700 text-sm">Vᵤ =</span>
                                            <span class="font-bold text-blue-700 text-sm"
                                                x-text="formatearNumero(talon.resultados.N291) + ' Tn'"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- KEY -->
                        <div x-show="activeElement === 'key' || activeElement === 'todos'"
                            x-transition:enter="transition ease-out duration-300"
                            x-transition:enter-start="opacity-0 transform scale-95"
                            x-transition:enter-end="opacity-100 transform scale-100"
                            class="border-2 rounded-xl p-4 shadow-lg">

                            <h3 class="text-lg font-bold text-center mb-4 py-2 rounded-lg">
                                <i class="fas fa-arrow-down-long mr-2"></i>DENTELLÓN
                            </h3>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <!-- Parámetros KEY -->
                                <div class="bg-white rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm"><i class="fas fa-sliders mr-2"></i>Parámetros de Entrada</h4>
                                    <div class="space-y-2">
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q1 (Tn/m²):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(key.resultados.U277)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q2 (Tn/m²):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(key.resultados.U278)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">L (m):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(key.resultados.U279)"></span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Resultados KEY -->
                                <div class="bg-white rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm"><i class="fas fa-square-poll-horizontal mr-2"></i>Resultados</h4>

                                    <div class="bg-gray-50 rounded-lg p-2 mb-3">
                                        <div class="grid grid-cols-4 gap-1 text-xs font-semibold text-gray-600 mb-1">
                                            <div></div>
                                            <div class="text-center">1</div>
                                            <div class="text-center">2</div>
                                            <div class="text-center">TOTAL</div>
                                        </div>

                                        <div class="space-y-1 text-xs">
                                            <div class="grid grid-cols-4 gap-1">
                                                <div class="font-medium">V</div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(key.resultados.U284)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(key.resultados.V284)"></div>
                                                <div class="text-center font-bold text-red-600"
                                                    x-text="formatearNumero(key.resultados.W284)">
                                                </div>
                                            </div>

                                            <div class="grid grid-cols-4 gap-1">
                                                <div class="font-medium">M</div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(key.resultados.U285)"></div>
                                                <div class="text-center"
                                                    x-text="formatearNumero(key.resultados.V285)"></div>
                                                <div class="text-center font-bold text-blue-600"
                                                    x-text="formatearNumero(key.resultados.W285)">
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="bg-green-50 rounded-lg p-2 border-l-4 border-green-500">
                                        <div class="text-xs font-semibold text-green-700 mb-2">Techo:</div>
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="font-medium text-green-700 text-xs">Mᵤ =</span>
                                            <span class="font-bold text-green-700 text-xs"
                                                x-text="formatearNumero(key.resultados.U287) + ' Tn·m'"></span>
                                        </div>
                                        <div class="flex justify-between items-center mb-2">
                                            <span class="font-medium text-green-700 text-xs">Vᵤ =</span>
                                            <span class="font-bold text-green-700 text-xs"
                                                x-text="formatearNumero(key.resultados.U288) + ' Tn'"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recorte y pedestal -->
                    <template x-if="recortes">
                        <div class="wall-cutoff-grid">
                            <section>
                                <h4>Recorte pantalla</h4>
                                <dl>
                                    <dt>Mu en X₃</dt><dd x-text="formatearNumero(recortes.pantalla.Mu) + ' Tn·m'"></dd>
                                    <dt>Mu máx / 2</dt><dd x-text="formatearNumero(recortes.pantalla.limit) + ' Tn·m'"></dd>
                                    <dt>Espesor t</dt><dd x-text="formatearNumero(recortes.pantalla.t) + ' cm'"></dd>
                                    <dt>As a usar</dt><dd x-text="formatearNumero(recortes.pantalla.AsUsar) + ' cm²'"></dd>
                                    <dt>Disposición</dt><dd x-text="recortes.pantalla.barra ? recortes.pantalla.barra.label + ' @ ' + recortes.pantalla.barra.spacing + ' cm' : '-'"></dd>
                                </dl>
                                <p :class="recortes.pantalla.ok ? 'text-green-600' : 'text-red-600'" x-text="recortes.pantalla.ok ? 'Se puede recortar' : 'Aumenta X₃'"></p>
                            </section>
                            <section>
                                <h4>Recorte talón</h4>
                                <dl>
                                    <dt>Mu en X₃</dt><dd x-text="formatearNumero(recortes.talon.Mu) + ' Tn·m'"></dd>
                                    <dt>Mu máx / 2</dt><dd x-text="formatearNumero(recortes.talon.limit) + ' Tn·m'"></dd>
                                    <dt>Espesor t</dt><dd x-text="formatearNumero(recortes.talon.t) + ' cm'"></dd>
                                    <dt>As a usar</dt><dd x-text="formatearNumero(recortes.talon.AsUsar) + ' cm²'"></dd>
                                    <dt>Disposición</dt><dd x-text="recortes.talon.barra ? recortes.talon.barra.label + ' @ ' + recortes.talon.barra.spacing + ' cm' : '-'"></dd>
                                </dl>
                                <p :class="recortes.talon.ok ? 'text-green-600' : 'text-red-600'" x-text="recortes.talon.ok ? 'Se puede recortar' : 'Aumenta X₃'"></p>
                            </section>
                            <section>
                                <h4>Pedestal del talón</h4>
                                <dl>
                                    <dt>Longitud X₄</dt><dd x-text="formatearNumero(recortes.pedestal.L) + ' m'"></dd>
                                    <dt>Vu en X₄</dt><dd x-text="formatearNumero(recortes.pedestal.Vu) + ' Tn'"></dd>
                                    <dt>ΦVc</dt><dd x-text="formatearNumero(recortes.pedestal.phiVc) + ' Tn'"></dd>
                                    <dt>Altura h'</dt><dd x-text="formatearNumero(recortes.pedestal.h) + ' cm'"></dd>
                                </dl>
                                <p :class="recortes.pedestal.ok ? 'text-green-600' : 'text-red-600'" x-text="recortes.pedestal.ok ? 'Corte correcto' : 'Aumenta la longitud'"></p>
                            </section>
                        </div>
                    </template>

                    <!-- Diagramas -->
                    <div id="diagrama-esfuerzos" class="wall-drawing mb-3" x-html="diagramaEsfuerzos"></div>
                    <div id="diagrama-refuerzo" class="wall-drawing" x-html="diagramaRefuerzo"></div>
                </div>
            </div>
