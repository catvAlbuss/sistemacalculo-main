{{-- resources/views/hcalculo/memoria_descriptiva/consideraciones.blade.php --}}
<x-calc-layout title="Memoria Descriptiva - Consideraciones de Diseño">
    <div class="py-4" x-data="{
        moduloActual: 1,
        init() {
            // Inicializar datos de consideraciones si no existen
            const store = $store.memoriaDescriptiva;
            if (!store.sections.consideraciones) {
                store.sections.consideraciones = {};
            }
            
            // Datos por defecto para cada módulo (1-16)
            const defaultGeotecnia = {
                perfilSuelo: 'TIPO III -- SUELOS BLANDOS',
                capacidadPortante: '0.50',
                profundidad: '1.40',
                agresividadSulfatos: 'Ataque no perjudicial',
                profNF: 'A 1.40m y 1.50m'
            };
            
            const defaultSismico = {
                zona: '2',
                factorZ: '0.25',
                perfilSuelo: 'S3',
                factorS: '1.40',
                tp: '1.00',
                tl: '1.60',
                categoria: 'A',
                factorU: '1.50',
                coeficienteR: '6'
            };
            
            const defaultSobrecargas = '- Sobrecarga en Aulas: 250 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2';
            const defaultRecubrimientos = '- Vigas y columnas: 40 mm\n- Losas: 20 mm\n- Zapatas: 70 mm';
            const defaultMateriales = '- Concreto: f\'c = 210 kg/cm2\n- Acero: fy = 4200 kg/cm2';
            
            // Valores específicos por módulo
            const capacidadesPortantes = {
                2: '0.60', 3: '0.60', 4: '0.60', 5: '0.63', 6: '0.62', 
                8: '0.60', 14: '0.60', 15: '0.66', 12: '1.50'
            };
            
            const profundidadesEspeciales = { 12: '5.20' };
            
            const coeficientesR = {
                4: '3', 5: '3', 7: '3', 12: '3', 14: '3',
                9: '7', 10: '7', 11: '8', 16: '8'
            };
            
            const sobrecargasPorModulo = {
                2: '- Sobrecarga en AIP: 300 kg/m2\n- Sobrecarga en Depósito AIP: 500 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2',
                3: '- Sobrecarga en Taller creativo: 350 kg/m2\n- Sobrecarga en Depósito: 500 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2',
                4: '- Sobrecarga en escaleras: 400 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2',
                5: '- Sobrecarga en Aulas: 250 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2',
                6: '- Sobrecarga en Aulas: 250 kg/m2\n- Sobrecarga en escaleras: 400 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 100 kg/m2',
                7: '- Sobrecarga de techos: 50 kg/m2',
                8: '- Sobrecarga en Sala: 250 kg/m2\n- Sobrecarga en Estar y Bienestar: 250 kg/m2\n- Sobrecarga en Depósito y archivo: 500 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2',
                9: '- Sobrecarga de techos: 50 kg/m2',
                10: '- Sobrecarga de techos: 50 kg/m2',
                11: '- Sobrecarga en techo: 30 kg/m2',
                12: '- Sobrecarga en entrepiso: 100 kg/m2\n- Sobrecarga de techos: 50 kg/m2',
                13: '- Sobrecarga en rampa: 400 kg/m2',
                14: '- Sobrecarga de techos: 50 kg/m2',
                15: '- Sobrecarga en SS.HH.: 250 kg/m2\n- Sobrecarga en corredores: 400 kg/m2\n- Sobrecarga en techos: 50 kg/m2',
                16: '- Sobrecarga en techo: 30 kg/m2'
            };
            
            // Crear módulos faltantes (1-16)
            for (let i = 1; i <= 16; i++) {
                if (!store.sections.consideraciones[i]) {
                    store.sections.consideraciones[i] = {
                        geotecnia: {
                            ...defaultGeotecnia,
                            capacidadPortante: capacidadesPortantes[i] || defaultGeotecnia.capacidadPortante,
                            profundidad: profundidadesEspeciales[i] || defaultGeotecnia.profundidad
                        },
                        sismico: {
                            ...defaultSismico,
                            coeficienteR: coeficientesR[i] || defaultSismico.coeficienteR
                        },
                        sobrecargas: sobrecargasPorModulo[i] || defaultSobrecargas,
                        recubrimientos: defaultRecubrimientos,
                        materiales: defaultMateriales,
                        combinaciones: {
                            comb1: true, comb2: true, comb3: true, comb4: true, comb5: true,
                            comb6: true, comb7: true, comb8: true, comb9: true
                        }
                    };
                }
            }
            
            // Guardar cambios
            store.save();
        }
    }" x-init="init()">
        <div class="container mx-auto px-4 max-w-7xl">

            {{-- Barra de navegación --}}
            <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.portada')}}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📄 Portada</a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.generalidades') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📋 1. GENERALIDADES</a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.consideraciones') }}" class="px-4 py-2 rounded-lg bg-green-600 text-white shadow-md">⚙️ 2. CONSIDERACIONES</a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.predimensionamiento') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📐 3. PREDIMENSIONAMIENTO</a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.demolicion') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">💥 4. DEMOLICIÓN</a>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                
                {{-- Header --}}
                <div class="bg-gradient-to-r from-amber-600 to-amber-800 px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-white">2. CONSIDERACIONES GENERALES DE DISEÑO</h2>
                            <p class="text-amber-100 text-sm">Condiciones geotécnicas, parámetros sísmicos y método de diseño por módulo</p>
                        </div>
                    </div>
                </div>

                <div class="p-6">
                    
                    {{-- Selector de Módulo --}}
                    <div class="mb-8">
                        <div class="flex items-center justify-between mb-3">
                            <label class="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                SELECCIONAR MÓDULO
                            </label>
                            <span class="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">16 módulos</span>
                        </div>
                        <div class="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
                            <template x-for="i in 16" :key="i">
                                <button @click="moduloActual = i" 
                                    :class="moduloActual === i ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                                    class="px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200">
                                    <span class="block text-center">M-<span x-text="String(i).padStart(2, '0')"></span></span>
                                </button>
                            </template>
                        </div>
                    </div>

                    {{-- Indicador visual del módulo seleccionado --}}
                    <div class="text-center mb-6">
                        <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Módulo actual: <strong x-text="'M-' + String(moduloActual).padStart(2, '0')"></strong>
                        </span>
                    </div>

                    {{-- Formularios del módulo seleccionado --}}
                    <template x-if="$store.memoriaDescriptiva?.sections?.consideraciones?.[moduloActual]">
                        <div>
                            {{-- CONDICIONES GEOTÉCNICAS --}}
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b">
                                    <h3 class="font-bold text-gray-700">🏗️ CONDICIONES GEOTÉCNICAS</h3>
                                </div>
                                <div class="p-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div><label class="text-xs font-semibold text-gray-500">Perfil del suelo</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.perfilSuelo" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Capacidad Portante (kg/cm²)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.capacidadPortante" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Profundidad de cimentación (m)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.profundidad" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Agresividad de sulfatos</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.agresividadSulfatos" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Profundidad del N.F.</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.profNF" class="w-full border rounded-lg p-2 text-sm"></div>
                                    </div>
                                </div>
                            </div>

                            {{-- PARÁMETROS SÍSMICOS --}}
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b">
                                    <h3 class="font-bold text-gray-700">📊 PARÁMETROS SÍSMICOS (Norma E.030)</h3>
                                </div>
                                <div class="p-4">
                                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        <div><label class="text-xs font-semibold text-gray-500">Zona sísmica</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.zona" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Factor Z</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.factorZ" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Perfil de suelo</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.perfilSuelo" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Factor S</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.factorS" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Tp (s)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.tp" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Tl (s)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.tl" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Categoría</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.categoria" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Factor U</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.factorU" class="w-full border rounded-lg p-2 text-sm"></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Coeficiente R₀</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.coeficienteR" class="w-full border rounded-lg p-2 text-sm"></div>
                                    </div>
                                </div>
                            </div>

                            {{-- SOBRECARGAS --}}
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b">
                                    <h3 class="font-bold text-gray-700">⚖️ SOBRECARGAS EMPLEADAS</h3>
                                </div>
                                <div class="p-4">
                                    <textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sobrecargas" rows="5" class="w-full border rounded-lg p-3 text-sm font-mono"></textarea>
                                </div>
                            </div>

                            {{-- MÉTODO DE DISEÑO --}}
                            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b">
                                    <h3 class="font-bold text-gray-700">🔧 MÉTODO DE DISEÑO</h3>
                                </div>
                                <div class="p-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div><label class="text-xs font-semibold text-gray-500">Recubrimientos</label><textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].recubrimientos" rows="6" class="w-full border rounded-lg p-3 text-sm font-mono"></textarea></div>
                                        <div><label class="text-xs font-semibold text-gray-500">Materiales</label><textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].materiales" rows="6" class="w-full border rounded-lg p-3 text-sm font-mono"></textarea></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    {{-- Mensaje de carga --}}
                    <div x-show="!$store.memoriaDescriptiva?.sections?.consideraciones?.[moduloActual]" class="text-center py-16 text-gray-400">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <p>Cargando datos del módulo <span x-text="'M-' + String(moduloActual).padStart(2, '0')"></span>...</p>
                    </div>

                    {{-- Botones --}}
                    <div class="flex justify-between items-center mt-8 pt-6 border-t">
                        <a href="{{ route('calculadora.asistente.memoria-descriptiva.generalidades') }}" class="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">← Anterior</a>
                        <div class="flex gap-3">
                            <button @click="moduloActual = moduloActual > 1 ? moduloActual - 1 : 16" class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">◀ Módulo anterior</button>
                            <button @click="moduloActual = moduloActual < 16 ? moduloActual + 1 : 1" class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Módulo siguiente ▶</button>
                        </div>
                        <a href="{{ route('calculadora.asistente.memoria-descriptiva.predimensionamiento') }}" class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Siguiente →</a>
                    </div>

                </div>
            </div>
        </div>
    </div>

    @pushOnce('initscripts')
        <script src="https://unpkg.com/docx@7.8.2/build/index.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
        @vite('resources/js/documentos/memoria_descriptiva/index-refactored-md.js')
    @endPushOnce
</x-calc-layout>