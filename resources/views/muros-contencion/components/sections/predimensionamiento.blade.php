<!-- Predimensionamiento -->
            <div x-show="activeTab === 'predimensionamiento'" id="predimensionamiento-content" x-data="predimensionamiento" @input="inputsChanged = true" @change="inputsChanged = true">
                <div class="wall-stage">
                    <div class="cuaderno wall-predimension-layout">
                        <div class="wall-predimension-grid">

                            <section
                                class="p-4 bg-slate-50 bg-opacity-0 border border-slate-300 rounded shadow-inner col-span-1">
                                <!-- Propiedades del Concreto -->
                                <div class="flex items-center justify-between cursor-pointer select-none mb-2"
                                    @click="showMateriales = !showMateriales">
                                    <h3 class="text-lg font-semibold text-gray-950 flex items-center">
                                        <i class='fas fa-flask mr-2 gray-950'></i>Propiedades de los materiales
                                    </h3>
                                    <span class="text-xs text-gray-500"
                                        x-text="showMateriales ? 'Ocultar' : 'Mostrar'"></span>
                                </div>
                                <div class="space-y-4" x-show="showMateriales" x-transition:enter.duration.300ms
                                    x-transition:leave.duration.200ms>
                                    <h4 class="text-sm font-semibold text-gray-700 mt-4 mb-2 px-6">Concreto</h4>

                                    <!-- Peso Específico Concreto -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Peso Específico Concreto</span>
                                        <span class="w-1/6 text-gray-500">γc</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 2.4" x-model.number="datosinput.B6">
                                        <span class="w-1/6 text-gray-500">Tn/m³</span>
                                    </div>

                                    <!-- Resistencia a compresion del Concreto -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Resistencia a compresion del Concreto</span>
                                        <span class="w-1/6 text-gray-500">f'c</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 210" x-model.number="datosinput.B7">
                                        <span class="w-1/6 text-gray-500">kg/cm²</span>
                                    </div>

                                    <!-- Esfuerzo de fluencia del Acero -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Esfuerzo de fluencia del Acero</span>
                                        <span class="w-1/6 text-gray-500">fy</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 4200" x-model.number="datosinput.B8">
                                        <span class="w-1/6 text-gray-500">kg/cm²</span>
                                    </div>

                                    <h4 class="text-sm font-semibold text-gray-700 mt-4 mb-2 px-6">Suelos</h4>

                                    <!-- Capacidad Portante del suelo -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Capacidad Portante del suelo</span>
                                        <span class="w-1/6 text-gray-500">σADM</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 20.0" x-model.number="datosinput.B10">
                                        <span class="w-1/6 text-gray-500">Tn/m²</span>
                                    </div>

                                    <!-- Peso Específico Suelo -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Peso Específico Suelo</span>
                                        <span class="w-1/6 text-gray-500">γs</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 1.83" x-model.number="datosinput.B11">
                                        <span class="w-1/6 text-gray-500">Tn/m³</span>
                                    </div>

                                    <!-- Ángulo de Fricción -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Ángulo de Fricción</span>
                                        <span class="w-1/6 text-gray-500">φ</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 26.90" x-model.number="datosinput.B12">
                                        <span class="w-1/6 text-gray-500">°</span>
                                    </div>

                                    <!-- Cohesión -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Cohesión</span>
                                        <span class="w-1/6 text-gray-500">c</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 0.05" x-model.number="datosinput.B13">
                                        <span class="w-1/6 text-gray-500">Tn/m²</span>
                                    </div>

                                    <!-- Coeficiente deflexion del suelo -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Coeficiente deflexion del suelo</span>
                                        <span class="w-1/6 text-gray-500">u</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 0.51" x-model.number="datosinput.B14">
                                        <span class="w-1/6 text-gray-500">-</span>
                                    </div>
                                </div>

                                <!-- Geometría -->
                                <div class="flex items-center justify-between cursor-pointer select-none mt-4 mb-2"
                                    @click="showGeometria = !showGeometria">
                                    <h3 class="text-lg font-semibold text-gray-950 flex items-center">
                                        <i class='fas fa-cube mr-2 gray-950'></i>Geometría
                                    </h3>
                                    <span class="text-xs text-gray-500"
                                        x-text="showGeometria ? 'Ocultar' : 'Mostrar'"></span>
                                </div>
                                <div class="space-y-4" x-show="showGeometria" x-transition:enter.duration.300ms
                                    x-transition:leave.duration.200ms>

                                    <!-- Altura Muro -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Altura Muro</span>
                                        <span class="w-1/6 text-gray-500">H</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 6.40" x-model.number="datosinput.B18">
                                        <span class="w-1/6 text-gray-500">m</span>
                                    </div>

                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Longitud de Muro</span>
                                        <span class="w-1/6 text-gray-500">L</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 9" x-model.number="datosinput.l">
                                        <span class="w-1/6 text-gray-500">m</span>
                                    </div>

                                    <!-- Profundidad Cimentación -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Profundidad Cimentación</span>
                                        <span class="w-1/6 text-gray-500">df</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 1.0" x-model.number="datosinput.B19">
                                        <span class="w-1/6 text-gray-500">m</span>
                                    </div>

                                    <!-- Inclinación Terreno -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Inclinación Terreno</span>
                                        <span class="w-1/6 text-gray-500">β</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 12" x-model.number="datosinput.B20">
                                        <span class="w-1/6 text-gray-500">°</span>
                                    </div>
                                </div>

                                <!-- Cargas -->
                                <div class="flex items-center justify-between cursor-pointer select-none mt-4 mb-2"
                                    @click="showCargas = !showCargas">
                                    <h3 class="text-lg font-semibold text-gray-950 flex items-center">
                                        <i class='fas fa-weight-hanging mr-2 gray-950'></i>Cargas
                                    </h3>
                                    <span class="text-xs text-gray-500"
                                        x-text="showCargas ? 'Ocultar' : 'Mostrar'"></span>
                                </div>
                                <div class="space-y-4" x-show="showCargas" x-transition:enter.duration.300ms
                                    x-transition:leave.duration.200ms>
                                    <!-- Altura de tabiqueue -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-2">
                                        <span class="w-1/4 text-gray-700">Altura de tabiqueue</span>
                                        <span class="w-1/6 text-gray-500">Ht</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 0.4" x-model.number="datosinput.B31">
                                        <span class="w-1/6 text-gray-500">m</span>
                                    </div>

                                    <!-- Sobrecarga -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-2">
                                        <span class="w-1/4 text-gray-700">Sobrecarga</span>
                                        <span class="w-1/6 text-gray-500">q</span>
                                        <input type="number"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 0.4" x-model.number="datosinput.B25">
                                        <span class="w-1/6 text-gray-500">Tn/m²</span>
                                    </div>

                                    <!-- Tipo Presión -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-2">
                                        <span class="w-1/4 text-gray-700">Tipo Presión</span>
                                        <span class="w-1/6 text-gray-500"></span>
                                        <select
                                            class="w-1/4 text-xs px-1 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            x-model="datosinput.B26">
                                            <option value="" disabled>Seleccione...</option>
                                            <option value="rankine">Rankine</option>
                                            <option value="coulomb">Coulomb</option>
                                            <option value="terzagui">Terzagui</option>
                                        </select>
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <h4 class="text-sm font-semibold text-gray-700 mt-4 mb-2 px-6">Presión Sísmica</h4>

                                    <!-- Presión Sísmica -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-2">
                                        <span class="w-1/4 text-gray-700">Presión Sísmica</span>
                                        <span class="w-1/6 text-gray-500"></span>
                                        <select
                                            class="w-1/4 text-xs px-1 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            x-model="datosinput.B27">
                                            <option value="" disabled>Seleccione...</option>
                                            <option value="mononobe">Mononobe-Okabe</option>
                                            <option value="wilsons">Wilson</option>
                                            <option value="basico">Método Básico</option>
                                        </select>
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <!-- Zona Sísmica -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-2">
                                        <span class="w-1/4 text-gray-700">Zona Sísmica</span>
                                        <span class="w-1/6 text-gray-500">Z</span>
                                        <select
                                            class="w-1/4 text-xs px-1 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            x-model.number="datosinput.B29">
                                            <option value="" disabled>Seleccione...</option>
                                            <option value="0.4">Zona 1 (Z=0.4)</option>
                                            <option value="0.3" selected>Zona 2 (Z=0.3)</option>
                                            <option value="0.15">Zona 3 (Z=0.15)</option>
                                        </select>
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <!-- Factor Kv -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-2">
                                        <span class="w-1/4 text-gray-700">Factor Kv</span>
                                        <span class="w-1/6 text-gray-500">Kv</span>
                                        <select
                                            class="w-1/4 text-xs px-1 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            x-model.number="datosinput.B30">
                                            <option value="" disabled>Seleccione...</option>
                                            <option value="0.3">0.3Kh</option>
                                            <option value="0.35">0.35Kh</option>
                                            <option value="0.4">0.4Kh</option>
                                            <option value="0.45">0.45Kh</option>
                                            <option value="0.5">0.5Kh</option>
                                        </select>
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>
                                </div>

                                <!-- Combinación de Cargas -->
                                <div class="flex items-center justify-between cursor-pointer select-none mt-4 mb-2"
                                    @click="showCombinacion = !showCombinacion">
                                    <h3 class="text-lg font-semibold text-gray-950 flex items-center">
                                        <i class='fas fa-layer-group mr-2 gray-950'></i>Combinación de Cargas
                                    </h3>
                                    <span class="text-xs text-gray-500"
                                        x-text="showCombinacion ? 'Ocultar' : 'Mostrar'"></span>
                                </div>
                                <div class="space-y-4" x-show="showCombinacion" x-transition:enter.duration.300ms
                                    x-transition:leave.duration.200ms>
                                    <h4 class="text-sm font-semibold text-gray-700 mt-4 mb-2 px-6">SERVICIO</h4>

                                    <!-- D+L+H -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">D+L+H</span>
                                        <span class="w-1/6 text-gray-500"></span>
                                        <div class="w-1/4 flex items-center">
                                            <label class="inline-flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox"
                                                    class="w-4 h-4 border border-gray-950 rounded text-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                    x-model="datosinput.D35">
                                                <span class="text-xs text-gray-600">Activar</span>
                                            </label>
                                        </div>

                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <!-- D+H+0.70E -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">D+H+0.70E</span>
                                        <span class="w-1/6 text-gray-500"></span>
                                        <div class="w-1/4 flex items-center">
                                            <input type="checkbox"
                                                class="w-4 h-4 border border-gray-950 rounded text-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                x-model="datosinput.D36">
                                            <span class="ml-2 text-xs text-gray-600">Activar</span>
                                        </div>
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <!-- 0.75D+0.75L+0.525E+0.6H -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">0.75D+0.75L+0.525E+0.6H</span>
                                        <span class="w-1/6 text-gray-500"></span>
                                        <div class="w-1/4 flex items-center">
                                            <input type="checkbox"
                                                class="w-4 h-4 border border-gray-950 rounded text-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                x-model="datosinput.D37">
                                            <span class="ml-2 text-xs text-gray-600">Activar</span>
                                        </div>
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <h4 class="text-sm font-semibold text-gray-700 mt-4 mb-2 px-6">Resistencia Última
                                    </h4>

                                    <!-- 1.4D+1.7L -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">1.4D+1.7L</span>
                                        <span class="w-1/6 text-gray-500"></span>
                                        <div class="w-1/4 flex items-center">
                                            <input type="checkbox"
                                                class="w-4 h-4 border border-gray-950 rounded text-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                x-model="datosinput.D39">
                                            <span class="ml-2 text-xs text-gray-600">Activar</span>
                                        </div>
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <!-- 1.25D+1.25H+1.25L+E -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">1.25D+1.25H+1.25L+E</span>
                                        <span class="w-1/6 text-gray-500"></span>
                                        <div class="w-1/4 flex items-center">
                                            <input type="checkbox"
                                                class="w-4 h-4 border border-gray-950 rounded text-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                x-model="datosinput.D40">
                                            <span class="ml-2 text-xs text-gray-600">Activar</span>
                                        </div>
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <!-- 0.9D+0.9H+E -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">0.9D+0.9H+E</span>
                                        <span class="w-1/6 text-gray-500"></span>
                                        <div class="w-1/4 flex items-center">
                                            <input type="checkbox"
                                                class="w-4 h-4 border border-gray-950 rounded text-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                x-model="datosinput.D41">
                                            <span class="ml-2 text-xs text-gray-600">Activar</span>
                                        </div>
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <!-- 1.4D+1.7L+1.7H -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">1.4D+1.7L+1.7H</span>
                                        <span class="w-1/6 text-gray-500"></span>
                                        <div class="w-1/4 flex items-center">
                                            <input type="checkbox"
                                                class="w-4 h-4 border border-gray-950 rounded text-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                x-model="datosinput.D42">
                                            <span class="ml-2 text-xs text-gray-600">Activar</span>
                                        </div>
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <!-- 0.9D+1.7H -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">0.9D+1.7H</span>
                                        <span class="w-1/6 text-gray-500"></span>
                                        <div class="w-1/4 flex items-center">
                                            <input type="checkbox"
                                                class="w-4 h-4 border border-gray-950 rounded text-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                                                x-model="datosinput.D43">
                                            <span class="ml-2 text-xs text-gray-600">Activar</span>
                                        </div>
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>
                                </div>

                                <!-- Valores de Predimensionamiento -->
                                <div class="flex items-center justify-between cursor-pointer select-none mt-4 mb-2"
                                    @click="showValPredim = !showValPredim">
                                    <h3 class="text-base font-semibold text-gray-950 flex items-center">
                                        <i class='fas fa-calculator mr-2 gray-950'></i>Valores de Predimensionamiento
                                    </h3>
                                    <span class="text-xs text-gray-500"
                                        x-text="showValPredim ? 'Ocultar' : 'Mostrar'"></span>
                                </div>
                                <div class="space-y-4" x-show="showValPredim" x-transition:enter.duration.300ms
                                    x-transition:leave.duration.200ms>

                                    <!-- Ancho Corona -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">Ancho Corona</span>
                                        <span class="w-1/6 text-gray-500">ac</span>
                                        <input type="number" min="0.10" max="0.30" step="0.01"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded
                                    focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 0.20" x-model.number="datosinput.D45"
                                            @input="
                                                if ($event.target.value < 0.10) {
                                                    datosinput.D45 = 0.10;
                                                } else if ($event.target.value > 0.30) {
                                                    datosinput.D45 = 0.30;
                                                }">
                                        <span class="w-1/6 text-gray-500">m</span>
                                    </div>

                                    <!-- factor de división para garganta pantalla -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">factor de división para garganta
                                            pantalla</span>
                                        <span class="w-1/6 text-gray-500">K</span>
                                        <input type="number" min="10" max="12" step="0.1"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded
                                    focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 10.5" x-model.number="datosinput.D47"
                                            @input="
                                                if ($event.target.value < 10) {
                                                    datosinput.D47 = 10;
                                                } else if ($event.target.value > 12) {
                                                    datosinput.D47 = 12;
                                                }
                                            ">
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <!-- factor de división para garganta de zapata -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">factor de división para garganta de
                                            zapata</span>
                                        <span class="w-1/6 text-gray-500">K</span>
                                        <input type="number" min="10" max="12" step="0.1"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded
                                    focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 11" x-model.number="datosinput.D49"
                                            @input="
                                                if ($event.target.value < 10) {
                                                    datosinput.D49 = 10;
                                                } else if ($event.target.value > 12) {
                                                    datosinput.D49 = 12;
                                                }
                                            ">
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>


                                    <!-- factor multiplicador para nacho de basa -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">factor multiplicador para nacho de
                                            basa</span>
                                        <span class="w-1/6 text-gray-500">K</span>
                                        <input type="number" min="0.40" max="0.70" step="0.01"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded
                                    focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 0.20" x-model.number="datosinput.D51"
                                            @input="
                                                if ($event.target.value < 0.40) {
                                                    datosinput.D51 = 0.40;
                                                } else if ($event.target.value > 0.70) {
                                                    datosinput.D51 = 0.70;
                                                }">
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>

                                    <!-- altura del key -->
                                    <div class="flex text-xs px-6 items-center space-x-2 mb-1">
                                        <span class="w-1/4 text-gray-700">altura del key</span>
                                        <span class="w-1/6 text-gray-500">K</span>
                                        <input type="number" min="10" max="12" step="0.1"
                                            class="w-1/4 text-xs px-1 py-1 text-right border border-gray-300 rounded
                                    focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 11" x-model.number="datosinput.D53"
                                            @input="
                                                if ($event.target.value < 10) {
                                                    datosinput.D53 = 10;
                                                } else if ($event.target.value > 12) {
                                                    datosinput.D53 = 12;
                                                }
                                            ">
                                        <span class="w-1/6 text-gray-500"></span>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <div class="flex gap-4 mt-4">
                                        <button id="calculate-button"
                                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                            x-on:click="calcular()" :disabled="isCalculating"
                                            :class="{ 'opacity-50 cursor-not-allowed': isCalculating }">
                                            <span x-show="!isCalculating">Calcular</span>
                                            <span x-show="isCalculating">Calculando...</span>
                                        </button>

                                        <div x-show="tieneResultados && !inputsChanged"
                                            class="flex items-center text-green-600">
                                            <i class="fas fa-check-circle mr-2"></i>
                                            <span>Cálculos completados</span>
                                        </div>

                                    </div>

                                    <p x-show="inputsChanged && tieneResultados" class="mt-3 text-sm text-gray-600" role="status">Datos modificados. Recalcula para actualizar los resultados.</p>
                                    <!-- Mostrar errores si los hay -->
                                    <div x-show="errors && errors.length > 0"
                                        class="mt-4 p-3 bg-red-100 border border-red-400 rounded">
                                        <h4 class="font-bold text-red-800">Errores encontrados:</h4>
                                        <ul class="list-disc ml-5 text-red-700">
                                            <template x-for="error in errors">
                                                <li x-text="error"></li>
                                            </template>
                                        </ul>
                                    </div>
                                </div>
                            </section>
                            <!-- grafico y resultados -->
                            <section
                                class="wall-results p-4 border border-slate-300 rounded">
                                <div class="">
                                    <h3 class="text-lg font-semibold text-gray-950 mb-3 flex items-center"><i
                                            class='fas fa-check-circle mr-2 text-green-600'></i>Resultados Geométricos
                                    </h3>
                                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <template x-for="(value, key) in resultados" :key="key">
                                            <div class="bg-white p-3 rounded-lg border border-gray-200">
                                                <label class="block text-xs text-gray-500 uppercase font-semibold"
                                                    x-text="resultadosConfig[key] ? resultadosConfig[key].label : key.replaceAll('_', ' ')"></label>
                                                <p class="text-gray-900 font-semibold text-lg"
                                                    x-text="!tieneResultados ? '—' : formatValue(value, resultadosConfig[key] ? resultadosConfig[key].decimals : 2) + ' ' + (resultadosConfig[key] ? resultadosConfig[key].unit : 'm')">
                                                </p>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                                <div class="wall-geometry-chart">
                                    <h3 class="text-lg font-semibold text-gray-950 mb-3 flex items-center"><i
                                            class='fas fa-chart-bar mr-2 text-blue-400'></i>Predimensionamiento</h3>
                                    <div id="predimsMC"></div>
                                    <p class="text-xs text-gray-500">Sección generada con las dimensiones calculadas.</p>
                                </div>
                                <div class="">
                                    <h3 class="text-lg font-semibold text-gray-950 mb-3 flex items-center"><i
                                            class='fas fa-chart-bar mr-2 text-blue-400'></i>Referencia de
                                        Predimensionamiento</h3>
                                    <img rel="preload" as="image" class="wall-reference-image"
                                        src="{{ Vite::asset('resources/img/predim-preview.png') }}" alt="Imagen"
                                        loading="lazy" />
                                </div>
                            </section>
                        </div>
                    </div>

                </div>
            </div>
