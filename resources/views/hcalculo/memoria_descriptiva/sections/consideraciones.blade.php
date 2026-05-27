{{-- resources/views/hcalculo/memoria_descriptiva/consideraciones.blade.php --}}
<x-calc-layout title="Memoria Descriptiva - Consideraciones de Diseño">
    <div class="py-4" x-data="memoriaDescriptiva">
        <div class="container mx-auto px-4 max-w-7xl">

            {{-- Barra de navegación --}}
            <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                <a href="{{ route('memoria-descriptiva.portada') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">📄 Portada</a>
                <a href="{{ route('memoria-descriptiva.generalidades') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">📋 1. GENERALIDADES</a>
                <a href="{{ route('memoria-descriptiva.consideraciones') }}" class="px-4 py-2 rounded-lg bg-green-600 text-white">⚙️ 2. CONSIDERACIONES</a>
                <a href="{{ route('memoria-descriptiva.predimensionamiento') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">📐 3. PREDIMENSIONAMIENTO</a>
                <a href="{{ route('memoria-descriptiva.demolicion') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">💥 4. DEMOLICIÓN</a>
            </div>

            {{-- Contenido de CONSIDERACIONES DE DISEÑO --}}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                
                <div class="flex items-center gap-3 mb-6">
                    <div class="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">2. CONSIDERACIONES GENERALES DE DISEÑO</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Condiciones geotécnicas, parámetros sísmicos y método de diseño por módulo</p>
                    </div>
                </div>

                {{-- Selector de Módulo --}}
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Seleccionar Módulo</label>
                    <div class="flex flex-wrap gap-2">
                        <template x-for="i in 16" :key="i">
                            <button @click="moduloActual = i" 
                                :class="moduloActual === i ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                                class="px-3 py-1 rounded-lg text-sm transition-all">
                                MÓDULO <span x-text="String(i).padStart(2, '0')"></span>
                            </button>
                        </template>
                    </div>
                </div>

                {{-- Datos del Módulo Actual --}}
                <template x-if="moduloActual">
                    <div class="space-y-6">
                        
                        {{-- CONDICIONES GEOTÉCNICAS --}}
                        <div class="border rounded-lg p-4">
                            <h3 class="text-lg font-bold mb-3 text-amber-600">CONDICIONES GEOTÉCNICAS</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Perfil del suelo</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.perfilSuelo" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Capacidad Portante (kg/cm²)</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.capacidadPortante" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Profundidad de cimentación (m)</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.profundidad" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Agresividad de sulfatos</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.agresividadSulfatos" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Prof. N.F.</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].geotecnia.profNF" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                            </div>
                        </div>

                        {{-- PARÁMETROS SÍSMICOS --}}
                        <div class="border rounded-lg p-4">
                            <h3 class="text-lg font-bold mb-3 text-amber-600">PARÁMETROS SÍSMICOS</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Zona sísmica</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.zona" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Factor Z</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.factorZ" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Perfil de suelo</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.perfilSuelo" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Factor S</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.factorS" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Tp (s)</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.tp" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Tl (s)</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.tl" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Categoría</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.categoria" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Factor U</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.factorU" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Coeficiente R</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sismico.coeficienteR" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                            </div>
                        </div>

                        {{-- SOBRECARGAS --}}
                        <div class="border rounded-lg p-4">
                            <h3 class="text-lg font-bold mb-3 text-amber-600">SOBRECARGAS EMPLEADAS</h3>
                            <textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].sobrecargas" 
                                      rows="6" class="w-full border rounded-lg p-3 text-sm"
                                      placeholder="Ej:&#10;- Sobrecarga en Aulas: 250 kg/m2&#10;- Sobrecarga en corredores: 400 kg/m2&#10;- Sobrecarga en techos: 50 kg/m2"></textarea>
                        </div>

                        {{-- MÉTODO DE DISEÑO - CONCRETO ARMADO --}}
                        <div class="border rounded-lg p-4">
                            <h3 class="text-lg font-bold mb-3 text-amber-600">MÉTODO DE DISEÑO - CONCRETO ARMADO</h3>
                            
                            <div class="mb-4">
                                <label class="text-sm font-semibold block mb-1">Recubrimientos</label>
                                <textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].recubrimientos" 
                                          rows="4" class="w-full border rounded-lg p-3 text-sm"
                                          placeholder="Ej:&#10;- Vigas y columnas: 40 mm&#10;- Losas: 20 mm&#10;- Zapatas: 70 mm"></textarea>
                            </div>

                            <div class="mb-4">
                                <label class="text-sm font-semibold block mb-1">Materiales</label>
                                <textarea x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].materiales" 
                                          rows="4" class="w-full border rounded-lg p-3 text-sm"
                                          placeholder="Ej:&#10;- Concreto: f'c = 210 kg/cm2&#10;- Acero: fy = 4200 kg/cm2"></textarea>
                            </div>

                            <div>
                                <label class="text-sm font-semibold block mb-2">Combinaciones de Carga</label>
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    <label class="flex items-center gap-2"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb1"> 1.4D + 1.7L</label>
                                    <label class="flex items-center gap-2"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb2"> 1.25(D+L)+SX</label>
                                    <label class="flex items-center gap-2"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb3"> 1.25(D+L)-SX</label>
                                    <label class="flex items-center gap-2"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb4"> 1.25(D+L)+SY</label>
                                    <label class="flex items-center gap-2"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb5"> 1.25(D+L)-SY</label>
                                    <label class="flex items-center gap-2"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb6"> 0.9D+SX</label>
                                    <label class="flex items-center gap-2"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb7"> 0.9D-SX</label>
                                    <label class="flex items-center gap-2"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb8"> 0.9D+SY</label>
                                    <label class="flex items-center gap-2"><input type="checkbox" x-model="$store.memoriaDescriptiva.sections.consideraciones[moduloActual].combinaciones.comb9"> 0.9D-SY</label>
                                </div>
                            </div>
                        </div>

                    </div>
                </template>

                {{-- Mensaje de carga --}}
                <div x-show="!moduloActual" class="text-center py-12 text-gray-500">
                    Cargando datos del módulo...
                </div>

                {{-- Botones de navegación --}}
                <div class="flex justify-between mt-8 pt-4 border-t">
                    <a href="{{ route('memoria-descriptiva.generalidades') }}" class="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">← Anterior</a>
                    <a href="{{ route('memoria-descriptiva.predimensionamiento') }}" class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Siguiente →</a>
                    <button @click="exportWord()" :disabled="isExporting" 
                        class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto">📄 Exportar a Word</button>
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