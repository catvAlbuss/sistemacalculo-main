<x-app-layout>
    @pushOnce('styles')
        <link href="https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
            integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
            crossorigin="anonymous" referrerpolicy="no-referrer" />
    @endpushOnce

    <style>
        .konva-content {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: white;
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        .cuaderno {
            position: relative;
            background-color: white;
            z-index: 0;
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        .cuaderno::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
            pointer-events: none;
            background-image:
                linear-gradient(to right, #e0e7ef 1px, transparent 1px),
                linear-gradient(to bottom, #e0e7ef 1px, transparent 1px);
            background-size: 20px 20px;
            opacity: 0.6;
        }

        .cuaderno>* {
            position: relative;
            z-index: 2;
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        [x-cloak] {
            display: none !important;
        }
    </style>

    <div id="app" x-data="mainSystem" x-init="init()" x-cloak>
        <!-- Header -->
        <header class="bg-blue-600 text-white p-4">
            <h1 class="text-2xl font-bold">
                <i class="fas fa-building mr-2"></i>
                Sistema de Muros de Contención
            </h1>
        </header>

        <!-- Navigation Tabs -->
        <div
            class="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg shadow-lg overflow-hidden bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky ">
            <div class="overflow-x-auto scrollbar-hide">
                <nav class="flex whitespace-nowrap min-w-full">

                    <template x-for="tab in tabs" :key="tab.id">
                        <button @click="changeTab(tab.id)" :disabled="getTabStatus(tab.id) === 'locked'"
                            class="flex items-center px-3 py-3 border-b-2 font-medium text-xs transition-all duration-200"
                            :class="{
                                'border-cyan-500 bg-cyan-50/50 text-cyan-700 font-semibold': activeTab === tab.id,
                                'border-gray-950 text-gray-950 hover:bg-green-50/50': getTabStatus(tab
                                    .id) === 'completed' && activeTab !== tab.id,
                                'border-transparent text-gray-600 hover:text-cyan-600 hover:bg-cyan-50/50': getTabStatus(
                                    tab.id) === 'available' && activeTab !== tab.id,
                                'border-transparent text-gray-950 cursor-not-allowed': getTabStatus(tab
                                    .id) === 'locked'
                            }">
                            <i :class="`fa-solid ${tab.icon} text-base`"></i>
                            <span x-text="tab.name" class="hidden sm:inline"></span>

                            <span x-text="tab.name.split(' ')[0]" class="sm:hidden"></span>

                            <i x-show="getTabStatus(tab.id) === 'locked'" class="fas fa-lock ml-2 text-gray-400"></i>
                            <i x-show="getTabStatus(tab.id) === 'completed' && activeTab !== tab.id"
                                class="fas fa-check-circle ml-2 text-gray-950"></i>

                        </button>
                    </template>

                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <main class="p-2">
            <!-- Predimensionamiento -->
            <div x-show="activeTab === 'predimensionamiento'" x-data="predimensionamiento" x-init="init()">
                <div x-data="predimensionamiento" class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold mb-2">
                        <i class="fas fa-ruler-combined mr-2"></i>
                        Predimensionamiento del Muro
                    </h2>
                    <div class="cuaderno p-4 max-w-full mx-auto font-mono">
                        <div class="flex justify-between items-center mb-2">
                            <h2 class="text-2xl font-bold text-gray-800">Datos de Entrada</h2>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
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

                                        <div x-show="resultados && Object.keys(resultados).length > 0"
                                            class="flex items-center text-green-600">
                                            <i class="fas fa-check-circle mr-2"></i>
                                            <span>Cálculos completados</span>
                                        </div>

                                    </div>

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
                                class="md:col-span-2 p-8  bg-slate-50 bg-opacity-0 border border-slate-300 rounded shadow-inner flex flex-col items-center ">
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
                                                    x-text="formatValue(value, resultadosConfig[key] ? resultadosConfig[key].decimals : 2) + ' ' + (resultadosConfig[key] ? resultadosConfig[key].unit : 'm')">
                                                </p>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                                <div class="p-8 justify-center">
                                    <h3 class="text-lg font-semibold text-gray-950 mb-3 flex items-center"><i
                                            class='fas fa-chart-bar mr-2 text-blue-400'></i>Predimensionamiento</h3>
                                    <div id="predimsMC"></div>
                                </div>
                                <div class="">
                                    <h3 class="text-lg font-semibold text-gray-950 mb-3 flex items-center"><i
                                            class='fas fa-chart-bar mr-2 text-blue-400'></i>Referencia de
                                        Predimensionamiento</h3>
                                    <img rel="preload" as="image" class="w-96 h-120"
                                        src="{{ Vite::asset('resources/img/predim-preview.png') }}" alt="Imagen"
                                        loading="lazy" />
                                </div>
                            </section>
                        </div>
                    </div>

                    <!-- Errores -->
                    <div x-show="tieneErrores" class="mb-4">
                        <div class="bg-red-50 border-l-4 border-red-400 p-4">
                            <div class="flex">
                                <i class="fas fa-exclamation-triangle text-red-400 mr-2"></i>
                                <div>
                                    <h4 class="text-red-800 font-medium">Errores en el formulario:</h4>
                                    <ul class="mt-2 text-sm text-red-700">
                                        <template x-for="error in errors">
                                            <li x-text="error"></li>
                                        </template>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Dimensionamiento-->
            <div x-show="activeTab === 'dimensionamiento'">
                <div x-data="dimensionamiento()" class="cuaderno p-4 max-w-full mx-auto font-mono">
                    <!-- MODO Y HEADER -->
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-2xl font-bold text-gray-800">📐 Dimensionamiento del Muro</h2>
                    </div>

                    <!-- ENTRADAS Y SALIDAS -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <!-- DATOS: VERIFICACIONES -->
                        <section
                            class="p-4 bg-slate-50 bg-opacity-0 border border-slate-300 rounded shadow-inner col-span-1">
                            <div class="flex items-center justify-between cursor-pointer select-none mb-2"
                                @click="showgraficoverificacion = !showgraficoverificacion">
                                <h3 class="text-lg font-semibold text-gray-950 flex items-center"><i
                                        class='fas fa-flask mr-2 text-gray-950'></i>Criterios de Diseño</h3>
                                <span class="text-xs text-gray-500"
                                    x-text="showgraficoverificacion ? 'Ocultar' : 'Mostrar'"></span>
                            </div>
                            <div class="space-y-4" x-show="showgraficoverificacion">
                                <!-- Grupo de cada campo -->
                                <div class="grid grid-cols-3 gap-2 text-xs px-6 items-center mb-2">
                                    <label class="text-gray-700 col-span-2">Usar la presión activa del terreno
                                        sumando</label>
                                    <select
                                        class="text-xs px-2 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        x-model="datosdim.C94">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="solopantalla">Solo pantalla</option>
                                        <option value="Pantallazapata">Pantalla + zapata</option>
                                        <option value="pantallazapatatalud">Pantalla + zapata + talud</option>
                                        <option value="Pantallazapatataludkey">Pantalla + zapata + talud + key</option>
                                        <option value="Pantallazapatakey">Pantalla + zapata + key</option>
                                    </select>
                                </div>

                                <div class="grid grid-cols-3 gap-2 text-xs px-6 items-center mb-2">
                                    <label class="text-gray-700 col-span-2">¿Considerar la presión vertical activa del
                                        terreno?</label>
                                    <select
                                        class="text-xs px-2 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        x-model="datosdim.C95">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="si">SI</option>
                                        <option value="no">NO</option>
                                    </select>
                                </div>

                                <div class="grid grid-cols-3 gap-2 text-xs px-6 items-center mb-2">
                                    <label class="text-gray-700 col-span-2">¿Considerar la presión pasiva del
                                        terreno?</label>
                                    <select
                                        class="text-xs px-2 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        x-model="datosdim.C93">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="desde">DESDE 0.00</option>
                                        <option value="DESDECIMEN">DESDE LA CIMEN</option>
                                        <option value="DESDEELKEY">DESDE ELKEY</option>
                                        <option value="CORTADOENLACIM">CORTADO EN LA CIM</option>
                                        <option value="CORTADOENELKEY">CORTADO EN EL KEY</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>

                                <div class="grid grid-cols-3 gap-2 text-xs px-6 items-center mb-2">
                                    <label class="text-gray-700 col-span-2">¿Considerar la cohesión del suelo?</label>
                                    <select
                                        class="text-xs px-2 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        x-model="datosdim.C96">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="si">SI</option>
                                        <option value="no">NO</option>
                                    </select>
                                </div>

                                <div class="grid grid-cols-3 gap-2 text-xs px-6 items-center mb-2">
                                    <label class="text-gray-700 col-span-2">De usar dentellón este se ubicará
                                        en</label>
                                    <select
                                        class="text-xs px-2 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        x-model="datosdim.C92">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="5.25">Extremo interior</option>
                                        <option value="2.18">En el centro</option>
                                        <option value="0.45">Extremo exterior</option>
                                    </select>
                                </div>

                                <!-- Inputs nuevos -->
                                <div class="bg-transparent">
                                    <table class="w-full table-fixed text-sm">
                                        <thead class="bg-transparent text-sm font-semibold">
                                            <tr>
                                                <th rowspan="2" class="px-6 py-3 text-center"></th>
                                                <th rowspan="2" class="px-6 py-3 text-center">Estático</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">Sísmico</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-transparent divide-y divide-gray-100 text-sm text-gray-800">
                                            <tr class="hover:bg-gray-50 transition-all duration-200">
                                                <td class="px-6 py-3 text-center">FSVe</td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSVe">
                                                </td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSVd">
                                                </td>
                                            </tr>

                                            <tr class="hover:bg-gray-50 transition-all duration-200">
                                                <td class="px-6 py-3 text-center">FSDe</td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSDe">
                                                </td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSDd">
                                                </td>
                                            </tr>

                                            <tr class="hover:bg-gray-50 transition-all duration-200">
                                                <td class="px-6 py-3 text-center">FSQadme</td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSQadme">
                                                </td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSQadmd">
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </div>

                            <div class="flex gap-4 mt-4">
                                <button
                                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                    id="calcularval" x-on:click="calcularTodo()"
                                    :disabled="isCalculating || !predimData"
                                    :class="{ 'opacity-50 cursor-not-allowed': isCalculating || !predimData }">
                                    <span x-show="!isCalculating">Calcular</span>
                                    <span x-show="isCalculating">Calculando...</span>
                                </button>

                                <div x-show="resultados && Object.keys(resultados).length > 0"
                                    class="flex items-center text-green-600">
                                    <i class="fas fa-check-circle mr-2"></i>
                                    <span>Dimensionamiento completado</span>
                                </div>
                            </div>
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
                        </section>

                        <!-- PREDIMENSIONAMIENTO: GRAFICO AMPLIADO -->
                        <section id="grafico-dimensionamiento"
                            class="row-span-2 md:col-span-2 p-8 bg-slate-50 bg-opacity-0 border border-slate-300 rounded shadow-inner flex flex-col items-center justify-center">
                            <div class="image-container"
                                style="position: relative; width: 100%; max-width: 800px; margin: 0 auto;">
                                <style>
                                    .measurement-container {
                                        display: inline-flex;
                                        align-items: center;
                                        gap: 4px;
                                    }

                                    .measurement-input {
                                        border: 1px solid #ccc;
                                        padding: 4px 8px;
                                        font-size: 12px;
                                        width: 80px;
                                        border-radius: 4px;
                                        transition: all 0.3s ease;
                                        background: rgb(255, 238, 0);
                                        color: rgba(27, 27, 27, 0.8);
                                        text-align: right;
                                    }

                                    .measurement-input:focus {
                                        background: rgba(255, 238, 0, 0.712);
                                        box-shadow: 0 0 5px rgba(255, 251, 251, 0.3);
                                        transform: scale(1.05);
                                    }

                                    .measurement-input-result {
                                        /* border: 1px solid #9ca3af; */
                                        padding: 4px 8px;
                                        font-size: 12px;
                                        width: 80px;
                                        border-radius: 4px;
                                        /* background: #e5e7eb; */
                                        color: rgba(27, 27, 27, 0.8);
                                        text-align: right;
                                        font-weight: 600;
                                    }

                                    .measurement-unit {
                                        text-align: left;
                                        font-size: 12px;
                                        color: rgba(27, 27, 27, 0.8);
                                        font-weight: 500;
                                    }

                                    .image-container {
                                        margin-bottom: 20px;
                                        position: relative;
                                    }

                                    /* Dark mode */
                                    .dark .measurement-input {
                                        color: white;
                                    }

                                    .dark .measurement-input-result {
                                        color: white;
                                    }

                                    .dark .measurement-unit {
                                        color: #e5e7eb;
                                        font-weight: 500;
                                    }

                                    .pos-c74 {
                                        position: absolute;
                                        top: 10%;
                                        left: 48%;
                                    }

                                    .pos-e74 {
                                        position: absolute;
                                        top: 12%;
                                        left: 85%;
                                    }

                                    .pos-e79 {
                                        position: absolute;
                                        top: 40%;
                                        left: 85%;
                                    }

                                    .pos-a82 {
                                        position: absolute;
                                        top: 49%;
                                        left: 25%;
                                    }

                                    .pos-a83 {
                                        position: absolute;
                                        top: 53%;
                                        left: 25%;
                                    }

                                    .pos-a88 {
                                        position: absolute;
                                        top: 81%;
                                        left: 20%;
                                    }

                                    .pos-a89 {
                                        position: absolute;
                                        top: 86%;
                                        left: 20%;
                                    }

                                    .pos-d88 {
                                        position: absolute;
                                        top: 81%;
                                        left: 66%;
                                    }

                                    .pos-b88 {
                                        position: absolute;
                                        top: 81%;
                                        left: 42%;
                                    }

                                    .pos-b90 {
                                        position: absolute;
                                        top: 92%;
                                        left: 42%;
                                    }

                                    .pos-d89 {
                                        position: absolute;
                                        top: 86%;
                                        left: 66%;
                                    }

                                    .pos-f86 {
                                        position: absolute;
                                        top: 70%;
                                        left: 94%;
                                    }

                                    .pos-e86 {
                                        position: absolute;
                                        text-align: right;
                                        top: 70%;
                                        left: 80%;
                                    }

                                    .pos-f91 {
                                        position: absolute;
                                        top: 11%;
                                        left: 8%;
                                    }

                                    .pos-g93 {
                                        position: absolute;
                                        top: 20%;
                                        left: 25%;
                                    }

                                    .pos-g94 {
                                        position: absolute;
                                        top: 25%;
                                        left: 25%;
                                    }

                                    .pos-f95 {
                                        position: absolute;
                                        top: 33%;
                                        left: 10%;
                                    }

                                    /* Responsive adjustments */
                                    @media (max-width: 600px) {

                                        .measurement-input,
                                        .measurement-input-result {
                                            width: 60px;
                                            font-size: 10px;
                                        }

                                        .measurement-unit {
                                            font-size: 10px;
                                        }
                                    }
                                </style>

                                <img rel="preload" as="image" class="w-full h-190"
                                    src="{{ Vite::asset('resources/img/verificacion.png') }}" alt="Imagen"
                                    loading="lazy" />

                                <!-- Inputs and results -->
                                <div class="measurement-container pos-c74">
                                    <input type="number" x-model.number="datosdim.C74" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-e74">
                                    <input type="number" x-model.number="datosdim.E74" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-e79">
                                    <input type="number" x-model.number="datosdim.E79" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-a82">
                                    <input type="number" x-model.number="datosdim.A82" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-a83">
                                    <input type="number" x-model.number="datosdim.A83" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-a88">
                                    <input type="number" x-model.number="datosdim.A88" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-a89">
                                    <input type="number" x-model.number="datosdim.A89" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-d88">
                                    <input type="number" x-model.number="datosdim.D88" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-b88">
                                    <input type="number" x-model.number="datosdim.B88" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-b90">
                                    <input type="number" x-model.number="datosdim.B90" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-d89">
                                    <input type="number" x-model.number="datosdim.D89" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-f86">
                                    <input type="number" x-model.number="datosdim.F86" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-e86">
                                    <input type="text" x-model.number="datosdim.E86" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-f91">
                                    <input type="number" x-model.number="datosdim.F91" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-g93">
                                    <input type="number" x-model.number="datosdim.G93" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-g94">
                                    <input type="number" x-model.number="datosdim.G94" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-f95">
                                    <input type="number" x-model.number="datosdim.F95" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>
                            </div>
                        </section>

                        <!-- RESULTADOS -->
                        <section
                            class="p-4 bg-slate-100 bg-opacity-0 border border-slate-300 rounded shadow-inner mt-2">
                            <h3 class="text-lg font-semibold text-gray-950 mb-3 flex items-center"><i
                                    class='fas fa-check-circle mr-2 text-green-600'></i>Resultados</h3>
                            <!-- Tabla de Impulsión -->
                            <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                <table class="w-full table-fixed text-sm" id="tabla-dimensionamiento-resultado">
                                    <thead
                                        class="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold">
                                        <tr>
                                            <th rowspan="2" class="px-6 py-3 text-center"> </th>
                                            <th rowspan="2" class="px-6 py-3 text-center">SIN SISMO</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">CON SISMO</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">MAXIMO</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">FS</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-100 text-sm text-gray-800">
                                        <template x-for="(accesorio, idx) in verfsismo.accesorios"
                                            :key="idx">
                                            <tr class="hover:bg-gray-50 transition-all duration-200">
                                                <td class="px-6 py-3 text-center" x-text="accesorio.tipo"></td>
                                                <td class="px-6 py-3 text-center" x-text="accesorio.cantidad"></td>
                                                <td class="px-6 py-3 text-center" x-text="accesorio.leq"></td>
                                                <td class="px-6 py-3 text-center" x-text="accesorio.max"></td>
                                                <td class="px-6 py-3 text-center">
                                                    <span
                                                        x-bind:class="accesorio.fs ? 'fs-icon fs-icon-true' : 'fs-icon fs-icon-false'"
                                                        x-bind:aria-label="accesorio.fs ? 'Pass' : 'Fail'"
                                                        x-text="accesorio.fs ? '✅' : '❌'"></span>
                                                </td>
                                            </tr>
                                        </template>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

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
                                📐 CARGAS
                            </h3>
                            <span class="text-xs text-gray-950"
                                x-text="showCargasEmpuje ? 'Ocultar' : 'Mostrar'"></span>
                        </div>
                        <!-- LAYOUT PRINCIPAL -->
                        <div x-show="showCargasEmpuje" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <!-- RESULTADOS DE CÁLCULO -->
                            <section class="space-y-4">
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
                                <div class="p-4 bg-green-50 bg-transparent border border-green-300 rounded shadow-sm">
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
                                            <div class="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-green-50">
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
                                    class="p-4 bg-orange-50 bg-transparent border border-orange-300 rounded shadow-sm">
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
                                            <div class="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-orange-50">
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
                                    class="p-4 bg-purple-50 bg-transparent border border-purple-300 rounded shadow-sm">
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
                                            <div class="grid grid-cols-3 gap-2 text-sm py-1 hover:bg-purple-50">
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
                                    class="p-4 bg-purple-50 bg-transparent border border-purple-300 rounded shadow-sm">
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
                                <div class="bg-white p-4 rounded border min-h-96 flex items-center justify-center">
                                    <div class="image-container"
                                        style="position: relative; width: 100%; max-width: 800px; margin: 0 auto;">

                                        <img rel="preload" as="image" class="w-full h-600"
                                            src="{{ Vite::asset('resources/img/cargas.png') }}" alt="Imagen"
                                            loading="lazy" />

                                        <!-- Inputs posicionados absolutamente sobre la imagen -->
                                        <input type="number" :value="getValue('B110')" disabled step="0.001"
                                            class="measurement-input-result"
                                            style="width: 60px; position: absolute; top: 82%; left:8%;">

                                        <input type="number" :value="getValue('B138')" disabled step="0.001"
                                            class="measurement-input-result"
                                            style="width:60px; position: absolute; top: 77%; left: 42%;">

                                        <input type="number" :value="getValue('B125')" disabled step="0.001"
                                            class="measurement-input-result"
                                            style="width:60px; position: absolute; top: 77%; left: 53%;">

                                        <input type="number" :value="getValue('C163')" disabled step="0.001"
                                            class="measurement-input-result"
                                            style="width:60px; position: absolute; top: 77%; left: 78%;">
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

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
                                    style="width: 600px; height: 400px; min-height: 400px;"></div>
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
                                🏗️ PANTALLA
                            </button>
                            <button @click="cambiarElemento('punta')"
                                :class="activeElement === 'punta' ? 'bg-orange-500 text-white' :
                                    'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                                class="px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                🔧 PUNTA
                            </button>
                            <button @click="cambiarElemento('talon')"
                                :class="activeElement === 'talon' ? 'bg-blue-500 text-white' :
                                    'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                                class="px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                ⚖️ TALÓN
                            </button>
                            <button @click="cambiarElemento('key')"
                                :class="activeElement === 'key' ? 'bg-green-500 text-white' :
                                    'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                                class="px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                🔑 KEY
                            </button>
                            <button @click="cambiarElemento('todos')"
                                :class="activeElement === 'todos' ? 'bg-purple-600 text-white' :
                                    'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                                class="px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                                📊 VER TODO
                            </button>
                        </div>
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
                                🏗️ PANTALLA
                            </h3>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <!-- Parámetros PANTALLA -->
                                <div class="rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm">📊 Parámetros de Entrada</h4>
                                    <div class="space-y-2">

                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q1 (Tn/m):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(pantalla.resultados.B277)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q2 (Tn/m):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(pantalla.resultados.B278)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">L (Tn/m):</label>
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
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm">📋 Resultados</h4>

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
                                🔧 PUNTA
                            </h3>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <!-- Parámetros PUNTA -->
                                <div class="bg-white rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm">📊 Parámetros de Entrada</h4>
                                    <div class="space-y-2">
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">Peso Propio::</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(punta.resultados.H277)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q1 (Tn/m):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(punta.resultados.H278)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q2 (Tn/m):</label>
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
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm">📋 Resultados</h4>

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
                                ⚖️ TALÓN
                            </h3>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <!-- Parámetros TALON -->
                                <div class="bg-white rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm">📊 Parámetros de Entrada</h4>
                                    <div class="space-y-2">
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">Peso Propio:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.N277)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">P. Terreno:</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.N278)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q1 (Tn/m):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(talon.resultados.N279)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q2 (Tn/m):</label>
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
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm">📋 Resultados</h4>

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
                                🔑 KEY
                            </h3>

                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <!-- Parámetros KEY -->
                                <div class="bg-white rounded-lg p-3 shadow">
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm">📊 Parámetros de Entrada</h4>
                                    <div class="space-y-2">
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q1 (Tn/m):</label>
                                            <span class="w-20 px-2 py-1 bg-gray-100 rounded text-right text-xs"
                                                x-text="formatearNumero(key.resultados.U277)"></span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <label class="text-xs font-medium text-gray-600">q2 (Tn/m):</label>
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
                                    <h4 class="font-semibold text-gray-700 mb-3 text-sm">📋 Resultados</h4>

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

                </div>
            </div>

            <!-- Diseño Estructural -->
            <div x-show="activeTab === 'concretoArmado'">
                <div x-data="concretoArmado" id="concretoArmado-content"></div>
            </div>

            <!-- Dibujo -->
            <div x-show="activeTab === 'dibujo'">
                <div x-data="dibujo" class="cuaderno p-2 w-full mx-auto font-mono">
                    <button @click="exportardwg"
                        class="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                        <i class="fas fa-download mr-2"></i>
                        descargar plano calculado
                    </button>
                    <div class="mt-6">
                        <h2 class="text-lg font-semibold mb-2 text-gray-700">📁 Planos descargados</h2>
                        <template x-if="planos.length === 0">
                            <p class="text-gray-500 italic">No hay planos disponibles.</p>
                        </template>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <template x-for="plano in planos" :key="plano.name">
                                <div class="bg-white border rounded-lg shadow-sm p-4 flex flex-col justify-between">
                                    <div>
                                        <p class="font-semibold text-sm text-gray-700 truncate" x-text="plano.name">
                                        </p>
                                        <p class="text-xs text-gray-400"
                                            x-text="new Date(plano.timestamp).toLocaleString()"></p>
                                    </div>
                                    <div class="flex gap-2 mt-3">
                                        <button @click="abrirPlano(plano.name)"
                                            class="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">
                                            Abrir
                                        </button>
                                        <button @click="eliminarPlano(plano.name)"
                                            class="flex-1 text-sm bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Metrados -->
            <div x-show="activeTab === 'metrado'">
                <div x-data="metrado" class="cuaderno max-w-full mx-auto">
                    <!-- HEADER -->
                    <div class="flex justify-between items-center mb-6 p-4">
                        <h2 class="text-3xl font-bold text-gray-800 flex items-center">
                            <i class="fas fa-calculator mr-3 text-blue-500"></i>
                            Metrados
                        </h2>
                        <div class="flex items-center space-x-4">
                            <button @click="exportData"
                                class="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                                <i class="fas fa-download mr-2"></i>
                                descargar metrados
                            </button>
                            <button @click="guardarData"
                                class="px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                                <i class="fas fa-download mr-2"></i>
                                guardar metrados
                            </button>
                        </div>
                    </div>

                    <!-- ERROR MESSAGES -->
                    <div x-show="hasErrors" class="mb-4">
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div class="flex">
                                <i class="fas fa-exclamation-triangle text-red-400 mr-3 mt-0.5"></i>
                                <div>
                                    <h3 class="text-sm font-medium text-red-800">Se encontraron errores:</h3>
                                    <ul class="mt-2 text-sm text-red-700 list-disc list-inside">
                                        <template x-for="error in errors" :key="error.id">
                                            <li x-text="error.message"></li>
                                        </template>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TABLA PRINCIPAL -->
                    <section class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        <div class="w-full text-sm">
                            <div id="metrados-table" class="w-full"></div>
                        </div>
                    </section>
                </div>
            </div>

            <!-- Memoria de calculo -->
            <div x-show="activeTab === 'memoriacalculo'">
                <div x-data="memoriacalculo" class="cuaderno max-w-full mx-auto">
                    <div class="glass-card rounded-2xl p-6 mb-1">
                        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div class="flex items-center space-x-4">
                                <div class="bg-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                                    <i class="fa-solid fa-calculator"></i>
                                </div>
                                <div>
                                    <h2 class="text-sm font-bold gradient-text">Memoria de Cálculo</h2>
                                    <p class="text-gray-600 text-xs mt-1">Configuración y documentación del proyecto
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ESTADO DEL DOCUMENTO -->
                    <div class="glass-card rounded-2xl p-6 mb-1">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div class="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg mr-3">
                                    <i class="fas fa-chart-line text-white"></i>
                                </div>
                                <div>
                                    <h3 class="text-sm font-semibold text-gray-800">Estado del Documento</h3>
                                    <p class="text-xs text-gray-600">Progreso de configuración</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-bold text-emerald-600" x-text="completionPercentage + '%'">
                                    0%</div>
                                <div class="text-xs text-gray-500">Completado</div>
                            </div>
                        </div>

                        <div class="mt-2">
                            <div class="bg-gray-200 rounded-full h-2">
                                <div class="bg-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
                                    :style="`width: ${completionPercentage}%`"></div>
                            </div>
                        </div>

                        <div class="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="text-center">
                                <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2"
                                    :class="datosdim.C94 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
                                    <i class="fas fa-project-diagram text-xs"></i>
                                </div>
                                <p class="text-xs text-gray-600">Proyecto</p>
                            </div>
                            <div class="text-center">
                                <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2"
                                    :class="hasImages ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
                                    <i class="fas fa-images text-xs"></i>
                                </div>
                                <p class="text-xs text-gray-600">Imágenes</p>
                            </div>
                            <div class="text-center">
                                <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2"
                                    :class="hasCalculations ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
                                    <i class="fas fa-calculator text-xs"></i>
                                </div>
                                <p class="text-xs text-gray-600">Cálculos</p>
                            </div>
                            <div class="text-center">
                                <div class="w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2"
                                    :class="isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'">
                                    <i class="fas fa-check text-xs"></i>
                                </div>
                                <p class="text-xs text-gray-600">Completo</p>
                            </div>
                        </div>
                    </div>

                    <!-- DATOS DEL PROYECTO -->
                    <div class="glass-card rounded-2xl p-6 mb-1">
                        <div class="flex items-center mb-6">
                            <div class="bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-lg mr-3">
                                <i class="fas fa-project-diagram text-white"></i>
                            </div>
                            <h3 class="text-sm font-semibold text-gray-800">Información del Proyecto</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Nombre del Proyecto</label>
                                <input x-model="datosdim.proyecto"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Ingrese el nombre del proyecto">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Código del Proyecto</label>
                                <input x-model="datosdim.codigo"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Ej: PROJ-2024-001">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Fecha</label>
                                <input type="date" x-model="datosdim.fecha"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Entidad / Cliente</label>
                                <input x-model="datosdim.cliente"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nombre del cliente">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Ubicación</label>
                                <input x-model="datosdim.ubicacion"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Ubicación del proyecto">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Ingeniero Responsable</label>
                                <input x-model="datosdim.ingeniero"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Nombre del ingeniero">
                            </div>
                        </div>
                    </div>

                    <div class="section-divider"></div>

                    <!-- IMÁGENES PARA EL ENCABEZADO -->
                    <div class="glass-card rounded-2xl p-6 mb-1">
                        <div class="flex items-center mb-6">
                            <div class="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg mr-3">
                                <i class="fas fa-images text-white"></i>
                            </div>
                            <h3 class="text-sm font-semibold text-gray-800">Imágenes para el Documento</h3>
                            <div class="ml-auto text-sm text-gray-500">
                                <i class="fas fa-info-circle mr-1"></i>
                                Formatos: PNG, JPG (Max: 5MB)
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <!-- Logo 1 logo entidad -->
                            <div class="upload-container">
                                <label class="block text-xs font-medium text-gray-700 mb-3">
                                    <i class="fas fa-building mr-2 text-blue-500"></i>
                                    Logo Institucional
                                </label>
                                <div class="upload-zone rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer relative overflow-hidden"
                                    @click="$refs.logoFile.click()">
                                    <div class="text-center">
                                        <div
                                            class="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                            <i class="fas fa-cloud-upload-alt text-blue-500 text-xl"></i>
                                        </div>
                                        <p class="text-xs text-gray-600 font-medium">Subir Logo 1</p>
                                        <p class="text-xs text-gray-400 mt-1">Arrastra o haz clic</p>
                                    </div>
                                    <input type="file" id="logoFile" x-ref="logoFile"
                                        accept="image/png, image/jpeg" class="hidden"
                                        @change="previewImage($event.target, 'logoPreview', 'logoFile')">

                                    <div id="logoFile-loading"
                                        class="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center hidden">
                                        <div class="flex flex-col items-center">
                                            <div
                                                class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2">
                                            </div>
                                            <p class="text-sm text-gray-600">Procesando...</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="logoPreview" class="mt-4"></div>
                            </div>

                            <!-- Logo 2 escudo nacional -->
                            <div class="upload-container">
                                <label class="block text-xs font-medium text-gray-700 mb-3">
                                    <i class="fas fa-shield-alt mr-2 text-green-500"></i>
                                    Escudo Nacional
                                </label>
                                <div class="upload-zone rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-green-400 cursor-pointer relative overflow-hidden"
                                    @click="$refs.escudoFile.click()">
                                    <div class="text-center">
                                        <div
                                            class="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                            <i class="fas fa-cloud-upload-alt text-green-500 text-xl"></i>
                                        </div>
                                        <p class="text-xs text-gray-600 font-medium">Subir Logo 2</p>
                                        <p class="text-xs text-gray-400 mt-1">Arrastra o haz clic</p>
                                    </div>
                                    <input type="file" id="escudoFile" x-ref="escudoFile"
                                        accept="image/png, image/jpeg" class="hidden"
                                        @change="previewImage($event.target, 'escudoPreview', 'escudoFile')">

                                    <div id="escudoFile-loading"
                                        class="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center hidden">
                                        <div class="flex flex-col items-center">
                                            <div
                                                class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-2">
                                            </div>
                                            <p class="text-sm text-gray-600">Procesando...</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="escudoPreview" class="mt-4"></div>
                            </div>

                            <!-- Logo portada -->
                            <div class="upload-container">
                                <label class="block text-xs font-medium text-gray-700 mb-3">
                                    <i class="fas fa-star mr-2 text-yellow-500"></i>
                                    Logo portada
                                </label>
                                <div class="upload-zone rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-yellow-400 cursor-pointer relative overflow-hidden"
                                    @click="$refs.logoPrinFile.click()">
                                    <div class="text-center">
                                        <div
                                            class="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                                            <i class="fas fa-cloud-upload-alt text-yellow-500 text-xl"></i>
                                        </div>
                                        <p class="text-xs text-gray-600 font-medium">Logo Principal</p>
                                        <p class="text-xs text-gray-400 mt-1">Arrastra o haz clic</p>
                                    </div>
                                    <input type="file" id="logoPrinFile" x-ref="logoPrinFile"
                                        accept="image/png, image/jpeg" class="hidden"
                                        @change="previewImage($event.target, 'logoPrinPreview', 'logoPrinFile')">

                                    <div id="logoPrinFile-loading"
                                        class="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center hidden">
                                        <div class="flex flex-col items-center">
                                            <div
                                                class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mb-2">
                                            </div>
                                            <p class="text-sm text-gray-600">Procesando...</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="logoPrinPreview" class="mt-4"></div>
                            </div>

                            <!-- logo Planos  -->
                            <div class="upload-container">
                                <label class="block text-xs font-medium text-gray-700 mb-3">
                                    <i class="fas fa-star mr-2 text-yellow-500"></i>
                                    Planos
                                </label>
                                <div class="upload-zone rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-yellow-400 cursor-pointer relative overflow-hidden"
                                    @click="$refs.logoPlanFile.click()">
                                    <div class="text-center">
                                        <div
                                            class="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                                            <i class="fas fa-cloud-upload-alt text-yellow-500 text-xl"></i>
                                        </div>
                                        <p class="text-xs text-gray-600 font-medium">Planos</p>
                                        <p class="text-xs text-gray-400 mt-1">Arrastra o haz clic</p>
                                    </div>
                                    <input type="file" id="logoPlanFile" x-ref="logoPlanFile"
                                        accept="image/png, image/jpeg" class="hidden"
                                        @change="previewImage($event.target, 'logoPlanPreview', 'logoPlanFile')">

                                    <div id="logoPlanFile-loading"
                                        class="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center hidden">
                                        <div class="flex flex-col items-center">
                                            <div
                                                class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mb-2">
                                            </div>
                                            <p class="text-sm text-gray-600">Procesando...</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="logoPlanPreview" class="mt-4"></div>
                            </div>

                            <!-- Firma -->
                            <div class="upload-container">
                                <label class="block text-xs font-medium text-gray-700 mb-3">
                                    <i class="fas fa-signature mr-2 text-purple-500"></i>
                                    Firma Digital
                                </label>
                                <div class="upload-zone rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-purple-400 cursor-pointer relative overflow-hidden"
                                    @click="$refs.firmaFile.click()">
                                    <div class="text-center">
                                        <div
                                            class="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                                            <i class="fas fa-cloud-upload-alt text-purple-500 text-xl"></i>
                                        </div>
                                        <p class="text-xs text-gray-600 font-medium">Subir Firma</p>
                                        <p class="text-xs text-gray-400 mt-1">Arrastra o haz clic</p>
                                    </div>
                                    <input type="file" id="firmaFile" x-ref="firmaFile"
                                        accept="image/png, image/jpeg" class="hidden"
                                        @change="previewImage($event.target, 'firmaPreview', 'firmaFile')">

                                    <div id="firmaFile-loading"
                                        class="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center hidden">
                                        <div class="flex flex-col items-center">
                                            <div
                                                class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-2">
                                            </div>
                                            <p class="text-sm text-gray-600">Procesando...</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="firmaPreview" class="mt-4"></div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center space-x-3 -mt-5">
                        <button @click="exportData"
                            class="inline-flex items-center px-5 py-2.5 bg-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-700 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <i class="fas fa-download mr-2"></i>
                            Exportar WORD
                        </button>
                    </div>

                    <!-- ERROR MESSAGES MEJORADO -->
                    <div x-show="hasErrors" x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 transform scale-95"
                        x-transition:enter-end="opacity-100 transform scale-100" class="mb-6">
                        <div
                            class="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
                            <div class="flex items-start">
                                <div class="bg-red-100 p-2 rounded-lg mr-4">
                                    <i class="fas fa-exclamation-triangle text-red-500"></i>
                                </div>
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold text-red-800 mb-2">Errores Encontrados</h3>
                                    <div class="space-y-2">
                                        <template x-for="error in errors" :key="error.id">
                                            <div
                                                class="flex items-center p-3 bg-white rounded-lg border border-red-100">
                                                <i class="fas fa-times-circle text-red-400 mr-3"></i>
                                                <span class="text-red-700 text-sm" x-text="error.message"></span>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>

        <!-- Footer -->
        <footer class="bg-gray-800 text-white p-4">
            <div class="flex justify-between items-center">
                <div>
                    <p>&copy; 2024 Sistema de Muros de Contención</p>
                </div>
                <div class="flex gap-4">
                    <button @click="resetSystem()" class="text-red-400 hover:text-red-300">
                        <i class="fas fa-trash mr-1"></i>
                        Resetear Sistema
                    </button>
                </div>
            </div>
        </footer>
    </div>

    <script>
        // Función mejorada para capturar contenido Alpine.js
        async function captureElementContent(elementId, options = {}) {
            console.log(`🎯 Iniciando captura de: ${elementId}`);

            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Elemento ${elementId} no encontrado`);
            }

            try {
                // 1. Preparar el elemento para captura
                await prepareElementForCapture(element);

                // 2. Si es un componente Alpine.js, expandir todo
                await expandAlpineComponent(element);

                // 3. Esperar renderizado completo
                await waitForCompleteRender();

                // 4. Capturar con html2canvas
                const canvas = await html2canvas(element, {
                    backgroundColor: '#ffffff',
                    width: options.width || 700,
                    height: options.height || 900,
                    scale: 1.2,
                    useCORS: true,
                    allowTaint: true,
                    logging: true, // Activar para debug
                    removeContainer: false,
                    imageTimeout: 10000,
                    onclone: (clonedDoc, clonedElement) => {
                        console.log('📋 Preparando elemento clonado...');

                        // Asegurar estilos en el clon
                        const originalElement = document.getElementById(elementId);
                        if (originalElement) {
                            clonedElement.style.cssText = originalElement.style.cssText;
                            clonedElement.style.display = 'block';
                            clonedElement.style.visibility = 'visible';
                            clonedElement.style.opacity = '1';
                            clonedElement.style.position = 'static';
                            clonedElement.style.transform = 'none';
                        }
                    }
                });

                console.log(`✅ Captura exitosa: ${canvas.width}x${canvas.height}`);
                return canvas;

            } catch (error) {
                console.error(`❌ Error capturando ${elementId}:`, error);
                throw error;
            }
        }

        // Función para preparar elemento
        async function prepareElementForCapture(element) {
            console.log('🔧 Preparando elemento...');

            // Hacer visible
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            element.style.position = 'static';
            element.style.transform = 'none';

            // Asegurar que el contenedor padre sea visible
            let parent = element.parentElement;
            while (parent && parent !== document.body) {
                parent.style.display = parent.style.display === 'none' ? 'block' : parent.style.display;
                parent.style.visibility = 'visible';
                parent.style.opacity = '1';
                parent = parent.parentElement;
            }
        }

        // Función para expandir componentes Alpine.js
        async function expandAlpineComponent(element) {
            console.log('📂 Expandiendo componentes Alpine.js...');

            try {
                // Obtener datos de Alpine.js
                const alpineData = Alpine.$data(element);

                if (alpineData) {
                    console.log('📋 Datos Alpine encontrados:', Object.keys(alpineData));

                    // Expandir todas las secciones colapsables
                    const expandableProps = [
                        'showDatos', 'showCorte', 'showFlexion', 'showDistribucion', 'showErrores'
                    ];

                    expandableProps.forEach(prop => {
                        if (alpineData.hasOwnProperty(prop)) {
                            console.log(`📂 Expandiendo: ${prop}`);
                            alpineData[prop] = true;
                        }
                    });

                    // Si hay método refresh, ejecutarlo
                    if (typeof alpineData.refresh === 'function') {
                        alpineData.refresh();
                    }

                    // Forzar actualización de Alpine.js
                    Alpine.nextTick(() => {
                        console.log('🔄 Alpine.js actualizado');
                    });
                }

                // También buscar elementos con x-show="false" y cambiarlos
                const hiddenElements = element.querySelectorAll('[x-show]');
                hiddenElements.forEach(el => {
                    const xShowValue = el.getAttribute('x-show');
                    if (xShowValue && !el.style.display.includes('block')) {
                        console.log(`👁️ Forzando visibilidad de elemento con x-show="${xShowValue}"`);
                        el.style.display = 'block !important';
                        el.style.visibility = 'visible !important';
                    }
                });

            } catch (error) {
                console.warn('⚠️ Error expandiendo Alpine.js:', error);
            }
        }

        // Función para esperar renderizado completo
        async function waitForCompleteRender() {
            console.log('⏳ Esperando renderizado completo...');

            return new Promise(resolve => {
                // Esperar múltiples frames para asegurar renderizado
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            console.log('✅ Renderizado completo');
                            resolve();
                        }, 1000); // Tiempo adicional para componentes complejos
                    });
                });
            });
        }

        // Función mejorada para calcular altura real del contenido
        async function captureElementContentDynamic(elementId, options = {}) {
            console.log(`🎯 Iniciando captura dinámica de: ${elementId}`);

            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Elemento ${elementId} no encontrado`);
            }

            try {
                // 1. Preparar elemento
                await prepareElementForCapture(element);
                await expandAlpineComponent(element);
                await waitForCompleteRender();

                // 2. Calcular altura real del contenido
                const realDimensions = calculateRealDimensions(element);
                console.log(`📏 Dimensiones reales: ${realDimensions.width}x${realDimensions.height}`);

                // 3. Capturar con dimensiones reales
                const canvas = await html2canvas(element, {
                    backgroundColor: '#ffffff',
                    width: realDimensions.width,
                    height: realDimensions.height,
                    scale: 1.0, // Reducir escala para contenido largo
                    useCORS: true,
                    allowTaint: true,
                    logging: true,
                    removeContainer: false,
                    imageTimeout: 15000, // Más tiempo para contenido largo
                    onclone: (clonedDoc, clonedElement) => {
                        // Asegurar que el clon tenga las dimensiones correctas
                        clonedElement.style.width = realDimensions.width + 'px';
                        clonedElement.style.height = 'auto';
                        clonedElement.style.minHeight = realDimensions.height + 'px';
                        clonedElement.style.display = 'block';
                        clonedElement.style.visibility = 'visible';
                        clonedElement.style.opacity = '1';
                        clonedElement.style.overflow = 'visible';
                    }
                });

                console.log(`✅ Captura exitosa: ${canvas.width}x${canvas.height}`);
                return canvas;

            } catch (error) {
                console.error(`❌ Error capturando ${elementId}:`, error);
                throw error;
            }
        }

        // Función para calcular dimensiones reales
        function calculateRealDimensions(element) {
            // Temporalmente hacer el elemento completamente visible
            const originalStyles = {
                height: element.style.height,
                maxHeight: element.style.maxHeight,
                overflow: element.style.overflow,
                position: element.style.position
            };

            element.style.height = 'auto';
            element.style.maxHeight = 'none';
            element.style.overflow = 'visible';
            element.style.position = 'static';

            // Obtener dimensiones reales
            const rect = element.getBoundingClientRect();
            const scrollHeight = element.scrollHeight;
            const scrollWidth = element.scrollWidth;

            // Usar la mayor altura entre las calculadas
            const realHeight = Math.max(rect.height, scrollHeight, element.offsetHeight);
            const realWidth = Math.max(rect.width, scrollWidth, element.offsetWidth, 700);

            // Restaurar estilos originales
            Object.keys(originalStyles).forEach(key => {
                element.style[key] = originalStyles[key];
            });

            return {
                width: Math.ceil(realWidth),
                height: Math.ceil(realHeight)
            };
        }

        // Función para capturar elemento por secciones
        async function captureElementBySections(elementId, options = {}) {
            console.log(`🎯 Capturando por secciones: ${elementId}`);

            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Elemento ${elementId} no encontrado`);
            }

            try {
                await prepareElementForCapture(element);
                await expandAlpineComponent(element);
                await waitForCompleteRender();

                // Identificar secciones principales
                const sections = identifyMainSections(element);
                console.log(`📋 Encontradas ${sections.length} secciones`);

                const sectionCanvases = [];

                // Capturar cada sección individualmente
                for (let i = 0; i < sections.length; i++) {
                    const section = sections[i];
                    console.log(`📸 Capturando sección ${i + 1}/${sections.length}`);

                    const canvas = await html2canvas(section, {
                        backgroundColor: '#ffffff',
                        scale: 1.2,
                        useCORS: true,
                        allowTaint: true,
                        logging: false,
                        onclone: (clonedDoc, clonedElement) => {
                            clonedElement.style.display = 'block';
                            clonedElement.style.visibility = 'visible';
                            clonedElement.style.opacity = '1';
                        }
                    });

                    sectionCanvases.push(canvas);
                }

                // Combinar todas las secciones en un solo canvas
                const combinedCanvas = combineCanvases(sectionCanvases);
                console.log(`✅ Canvas combinado: ${combinedCanvas.width}x${combinedCanvas.height}`);

                return combinedCanvas;

            } catch (error) {
                console.error(`❌ Error capturando por secciones:`, error);
                throw error;
            }
        }

        // Función para identificar secciones principales
        function identifyMainSections(element) {
            const sections = [];

            // Buscar secciones por clases comunes o estructura
            const sectionSelectors = [
                '.bg-gray-600', // Header sections
                '.border-b', // Bordered sections
                '[x-show]', // Alpine.js conditional sections
                '.grid', // Grid containers
                '.space-y-4' // Spaced sections
            ];

            sectionSelectors.forEach(selector => {
                const found = element.querySelectorAll(selector);
                found.forEach(section => {
                    if (!sections.includes(section) && section.offsetHeight > 50) {
                        sections.push(section);
                    }
                });
            });

            // Si no encontramos secciones específicas, dividir por altura
            if (sections.length === 0) {
                const children = Array.from(element.children);
                children.forEach(child => {
                    if (child.offsetHeight > 50) {
                        sections.push(child);
                    }
                });
            }

            return sections.length > 0 ? sections : [element];
        }

        // Función para combinar canvas
        function combineCanvases(canvases) {
            if (canvases.length === 0) return null;
            if (canvases.length === 1) return canvases[0];

            // Calcular dimensiones totales
            const maxWidth = Math.max(...canvases.map(c => c.width));
            const totalHeight = canvases.reduce((sum, c) => sum + c.height, 0);

            // Crear canvas combinado
            const combinedCanvas = document.createElement('canvas');
            combinedCanvas.width = maxWidth;
            combinedCanvas.height = totalHeight;

            const ctx = combinedCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, maxWidth, totalHeight);

            // Dibujar cada canvas
            let currentY = 0;
            canvases.forEach(canvas => {
                ctx.drawImage(canvas, 0, currentY);
                currentY += canvas.height;
            });

            return combinedCanvas;
        }

        async function captureWithoutBreakingTabs(elementId, options = {}) {
            const element = document.getElementById(elementId);
            if (!element) throw new Error(`Elemento ${elementId} no encontrado`);

            const alpineData = Alpine.$data(element);
            const originalState = {};

            // Guardar estado original
            if (alpineData) {
                ['showDatos', 'showCorte', 'showFlexion', 'showDistribucion', 'showErrores']
                .forEach(prop => {
                    if (prop in alpineData) {
                        originalState[prop] = alpineData[prop];
                        alpineData[prop] = true; // expandir
                    }
                });
            }

            await waitForCompleteRender();
            const canvas = await html2canvas(element, {
                /* opciones */
            });

            // Restaurar estado original
            if (alpineData) {
                Object.keys(originalState).forEach(prop => {
                    alpineData[prop] = originalState[prop];
                });
            }

            return canvas;
        }

        // Hacer funciones disponibles globalmente
        window.captureElementContent = captureElementContent;
        window.prepareElementForCapture = prepareElementForCapture;
        window.expandAlpineComponent = expandAlpineComponent;
        window.captureElementContentDynamic = captureElementContentDynamic;
        window.captureElementBySections = captureElementBySections;
    </script>

    @pushOnce('scripts') 
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/konva@9/konva.min.js"></script>
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/exceljs/dist/exceljs.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
        <script src="https://html2canvas.hertzen.com/dist/html2canvas.js"></script>
        <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    @endpushOnce

</x-app-layout>
