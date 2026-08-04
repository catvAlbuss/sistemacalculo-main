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
                factorSuelo: 'S1',
                tp: '1.00',
                tl: '1.60',
                categoria: 'A',
                factorU: '1.50',
                coeficienteR: '6',
                coeficienteR_X: '6',
                coeficienteR_Y: '6',
                sistemaEstructural: 'Muros de Concreto Armado',
                sistemaX: 'placas',
                sistemaY: 'placas'
            };
            const defaultAnalisisX = {
                factorZ: '0.25',
                factorU: '1.50',
                factorS: '1.40',
                tp: '1.00',
                tl: '1.60',
                c: '2.50',
                t: '6.00',
                r: '6',
                cr: '0.2188'
            };
            const defaultAnalisisY = {
                ...defaultAnalisisX,
                cr: '0.359'
            };
            const defaultCombinaciones = {
                comb1: true, comb2: true, comb3: true, comb4: true, comb5: true,
                comb6: true, comb7: true, comb8: true, comb9: true
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
                            ...defaultSismico
                        },
                        sobrecargas: sobrecargasPorModulo[i] || defaultSobrecargas,
                        recubrimientos: defaultRecubrimientos,
                        materiales: defaultMateriales,
                        analisisX: { ...defaultAnalisisX },
                        analisisY: { ...defaultAnalisisY },
                        combinaciones: {
                            ...defaultCombinaciones
                        }
                    };
                } else {
                    const modulo = store.sections.consideraciones[i];
                    modulo.geotecnia = {
                        ...defaultGeotecnia,
                        capacidadPortante: capacidadesPortantes[i] || defaultGeotecnia.capacidadPortante,
                        profundidad: profundidadesEspeciales[i] || defaultGeotecnia.profundidad,
                        ...(modulo.geotecnia || {})
                    };
                    modulo.sismico = {
                        ...defaultSismico,
                        ...(modulo.sismico || {})
                    };
                    modulo.analisisX = {
                        ...defaultAnalisisX,
                        ...(!Array.isArray(modulo.analisisX) ? (modulo.analisisX || {}) : {})
                    };
                    modulo.analisisY = {
                        ...defaultAnalisisY,
                        ...(!Array.isArray(modulo.analisisY) ? (modulo.analisisY || {}) : {})
                    };
                    modulo.combinaciones = {
                        ...defaultCombinaciones,
                        ...(modulo.combinaciones || {})
                    };
                    modulo.sobrecargas = modulo.sobrecargas || sobrecargasPorModulo[i] || defaultSobrecargas;
                    modulo.recubrimientos = modulo.recubrimientos || defaultRecubrimientos;
                    modulo.materiales = modulo.materiales || defaultMateriales;
                }
            }
            
            // Guardar cambios
            store.save();
        },
        
        updateFactorU() {
            const factorByCategory = {
                'A': '1.50',
                'B': '1.30',
                'C': '1.00',
                'D': 'Ver Nota 2'
            };
            const categoria = $store.memoriaDescriptiva.sections.consideraciones[this.moduloActual]?.sismico?.categoria;
            if (categoria && factorByCategory[categoria]) {
                if (!$store.memoriaDescriptiva.sections.consideraciones[this.moduloActual].sismico) {
                    $store.memoriaDescriptiva.sections.consideraciones[this.moduloActual].sismico = {};
                }
                $store.memoriaDescriptiva.sections.consideraciones[this.moduloActual].sismico.factorU = factorByCategory[categoria];
                $store.memoriaDescriptiva.save();
            }
        }
    }" x-init="init()">
        <div class="container mx-auto px-4 max-w-7xl">

            {{-- ══════════════════════════════════════
                 BARRA DE NAVEGACIÓN
            ══════════════════════════════════════ --}}
            <nav class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.portada') }}"
                   class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
                    📄 Portada
                </a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.generalidades') }}"
                   class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
                    📋 1. GENERALIDADES
                </a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.consideraciones') }}"
                   class="px-4 py-2 rounded-lg bg-green-600 text-white shadow-md text-sm font-medium">
                    ⚙️ 2. CONSIDERACIONES
                </a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.predimensionamiento') }}"
                   class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
                    📐 3. PREDIMENSIONAMIENTO
                </a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.demolicion') }}"
                   class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
                    💥 4. DEMOLICIÓN
                </a>
            </nav>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">

                {{-- HEADER --}}
                <div class="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-white">2. CONSIDERACIONES GENERALES DE DISEÑO</h2>
                            <p class="text-green-100 text-sm">Condiciones geotécnicas, parámetros sísmicos y método de diseño por módulo</p>
                        </div>
                    </div>
                </div>

                <div class="p-6 space-y-8">

                    {{-- ══════════════════════════════════════
                         SELECTOR DE MÓDULO
                    ══════════════════════════════════════ --}}
                    <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                                </svg>
                                SELECCIONAR MÓDULO
                            </h3>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
                                <template x-for="i in 16" :key="i">
                                    <button @click="moduloActual = i" 
                                        :class="moduloActual === i ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                                        class="px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200">
                                        <span class="block text-center">M-<span x-text="String(i).padStart(2, '0')"></span></span>
                                    </button>
                                </template>
                            </div>
                            <div class="text-center mt-4">
                                <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-sm">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    Módulo actual: <strong x-text="'M-' + String(moduloActual).padStart(2, '0')"></strong>
                                </span>
                            </div>
                        </div>
                    </section>

                    {{-- Formularios del módulo seleccionado --}}
                    <template x-if="$store.memoriaDescriptiva?.sections?.consideraciones?.[moduloActual]">
                        <div>

                            {{-- ══════════════════════════════════════
                                 1. CONDICIONES GEOTÉCNICAS
                            ══════════════════════════════════════ --}}
                            <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                        </svg>
                                        🏗️ CONDICIONES GEOTÉCNICAS
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Perfil del suelo</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.perfilSuelo" 
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Capacidad Portante (kg/cm²)</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.capacidadPortante" 
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Profundidad de cimentación (m)</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.profundidad" 
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Agresividad de sulfatos</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.agresividadSulfatos" 
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Profundidad del N.F.</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.profNF" 
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {{-- ══════════════════════════════════════
                                 2. PARÁMETROS SÍSMICOS
                            ══════════════════════════════════════ --}}
                            <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        📊 PARÁMETROS SÍSMICOS
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Factor Suelo</label>
                                            <select x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.factorSuelo" 
                                                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                                <option value="S1">S1</option>
                                                <option value="S2">S2</option>
                                                <option value="S3">S3</option>
                                                <option value="S4">S4</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Tp (s)</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.tp" 
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Tl (s)</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.tl" 
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Categoría</label>
                                            <select x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.categoria" 
                                                    @change="updateFactorU()" 
                                                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Factor U</label>
                                            <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.factorU" 
                                                   class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed" 
                                                   readonly>
                                            <p class="text-xs text-gray-400 mt-1">Se actualiza automáticamente según categoría</p>
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Sistema Estructural</label>
                                            <select x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.sistemaEstructural" 
                                                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                                <option value="Muros de Concreto Armado">Muros de Concreto Armado</option>
                                                <option value="Pórticos de Concreto Armado">Pórticos de Concreto Armado</option>
                                                <option value="Dual (Pórticos + Muros)">Dual (Pórticos + Muros)</option>
                                                <option value="Muros de Albañilería Confinada">Muros de Albañilería Confinada</option>
                                                <option value="Aporticado de Acero">Aporticado de Acero</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {{-- ══════════════════════════════════════
                                 3. ANÁLISIS SÍSMICO - DIRECCIONES X e Y
                            ══════════════════════════════════════ --}}
                            <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        📊 ANÁLISIS SÍSMICO - DIRECCIONES X e Y
                                    </h3>
                                </div>
                                <div class="p-4">
                                    
                                    {{-- Tabla de Zonas --}}
                                    <div class="text-center mb-3">
                                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Tabla N° 1 - FACTORES DE ZONA "Z"</span>
                                    </div>
                                    <div class="flex justify-center mb-6">
                                        <table class="border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                                            <thead>
                                                <tr class="bg-gray-100 dark:bg-gray-700">
                                                    <th class="border border-gray-300 dark:border-gray-600 px-4 py-1 text-gray-700 dark:text-gray-300">ZONA</th>
                                                    <th class="border border-gray-300 dark:border-gray-600 px-4 py-1 text-gray-700 dark:text-gray-300">Z</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr class="text-center"><td class="border border-gray-300 dark:border-gray-600 px-4 py-1">4</td><td class="border border-gray-300 dark:border-gray-600 px-4 py-1">0,45</td></tr>
                                                <tr class="text-center"><td class="border border-gray-300 dark:border-gray-600 px-4 py-1">3</td><td class="border border-gray-300 dark:border-gray-600 px-4 py-1">0,35</td></tr>
                                                <tr class="text-center"><td class="border border-gray-300 dark:border-gray-600 px-4 py-1">2</td><td class="border border-gray-300 dark:border-gray-600 px-4 py-1">0,25</td></tr>
                                                <tr class="text-center"><td class="border border-gray-300 dark:border-gray-600 px-4 py-1">1</td><td class="border border-gray-300 dark:border-gray-600 px-4 py-1">0,10</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {{-- Dirección X e Y --}}
                                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        
                                        {{-- Dirección X --}}
                                        <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800/50">
                                            <h4 class="font-bold text-blue-600 dark:text-blue-400 text-center mb-3">DIRECCIÓN X</h4>
                                            <div class="grid grid-cols-2 gap-2">
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">Factor Z</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisX.factorZ" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">Factor U</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisX.factorU" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">Factor S</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisX.factorS" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">Tp (s)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisX.tp" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">Tl (s)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisX.tl" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">C</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisX.c" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">T (s)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisX.t" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">R</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisX.r" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div class="col-span-2"><label class="text-xs text-gray-500 dark:text-gray-400">C/R</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisX.cr" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                            </div>
                                        </div>
                                        
                                        {{-- Dirección Y --}}
                                        <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800/50">
                                            <h4 class="font-bold text-purple-600 dark:text-purple-400 text-center mb-3">DIRECCIÓN Y</h4>
                                            <div class="grid grid-cols-2 gap-2">
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">Factor Z</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisY.factorZ" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">Factor U</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisY.factorU" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">Factor S</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisY.factorS" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">Tp (s)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisY.tp" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">Tl (s)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisY.tl" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">C</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisY.c" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">T (s)</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisY.t" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div><label class="text-xs text-gray-500 dark:text-gray-400">R</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisY.r" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                                <div class="col-span-2"><label class="text-xs text-gray-500 dark:text-gray-400">C/R</label><input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].analisisY.cr" class="w-full border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"></div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                    
                                </div>
                            </section>

                            {{-- ══════════════════════════════════════
                                 4. SOBRECARGAS EMPLEADAS
                            ══════════════════════════════════════ --}}
                            <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.657 0 3 .895 3 2s-1.343 2-3 2m0-8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"/>
                                        </svg>
                                        ⚖️ SOBRECARGAS EMPLEADAS
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sobrecargas" 
                                              rows="5" 
                                              class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm font-mono bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"></textarea>
                                </div>
                            </section>

                            {{-- ══════════════════════════════════════
                                 5. MÉTODO DE DISEÑO
                            ══════════════════════════════════════ --}}
                            <section class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        🔧 MÉTODO DE DISEÑO
                                    </h3>
                                </div>
                                <div class="p-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Recubrimientos</label>
                                            <textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].recubrimientos" 
                                                      rows="6" 
                                                      class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm font-mono bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"></textarea>
                                        </div>
                                        <div>
                                            <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Materiales</label>
                                            <textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].materiales" 
                                                      rows="6" 
                                                      class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm font-mono bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </template>

                    {{-- Mensaje de carga --}}
                    <div x-show="!$store.memoriaDescriptiva?.sections?.consideraciones?.[moduloActual]" 
                         class="text-center py-16 text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                        <p class="text-sm">Cargando datos del módulo <span x-text="'M-' + String(moduloActual).padStart(2, '0')"></span>...</p>
                    </div>

                    {{-- ══════════════════════════════════════
                         BOTONES DE NAVEGACIÓN
                    ══════════════════════════════════════ --}}
                    <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a href="{{ route('calculadora.asistente.memoria-descriptiva.generalidades') }}"
                           class="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2 text-sm font-medium">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                            Anterior
                        </a>

                        <div class="flex gap-3">
                            <button @click="moduloActual = moduloActual > 1 ? moduloActual - 1 : 16" 
                                    class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                </svg>
                                Módulo anterior
                            </button>
                            <button @click="moduloActual = moduloActual < 16 ? moduloActual + 1 : 1" 
                                    class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium flex items-center gap-1">
                                Módulo siguiente
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </div>

                        <a href="{{ route('calculadora.asistente.memoria-descriptiva.predimensionamiento') }}"
                           class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium">
                            Siguiente
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </a>
                    </div>

                </div>{{-- /p-6 --}}
            </div>{{-- /card --}}
        </div>{{-- /container --}}
    </div>{{-- /x-data --}}

    @pushOnce('initscripts')
        <script src="https://unpkg.com/docx@7.8.2/build/index.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
        @vite('resources/js/documentos/memoria_descriptiva/index-refactored-md.js')
    @endPushOnce
</x-calc-layout>
