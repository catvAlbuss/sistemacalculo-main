{{-- resources/views/hcalculo/memoria_descriptiva/generalidades.blade.php --}}
<x-calc-layout title="Memoria Descriptiva - Generalidades">
    <div class="py-4" x-data="memoriaDescriptiva">
        <div class="container mx-auto px-4 max-w-7xl">

            {{-- Barra de navegación --}}
            <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                <a href="{{ route('memoria-descriptiva.portada') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">📄 Portada</a>
                <a href="{{ route('memoria-descriptiva.generalidades') }}" class="px-4 py-2 rounded-lg bg-green-600 text-white">📋 1. GENERALIDADES</a>
                <a href="{{ route('memoria-descriptiva.consideraciones') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">⚙️ 2. CONSIDERACIONES</a>
                <a href="{{ route('memoria-descriptiva.predimensionamiento') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">📐 3. PREDIMENSIONAMIENTO</a>
                <a href="{{ route('memoria-descriptiva.demolicion') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">💥 4. DEMOLICIÓN</a>
            </div>

            {{-- Contenido de GENERALIDADES (copiado de sections/generalidades-md.blade.php) --}}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                
                <div class="flex items-center gap-3 mb-6">
                    <div class="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">1. GENERALIDADES</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Antecedentes, datos del proyecto, objetivos y marco normativo</p>
                    </div>
                </div>

                <div class="space-y-8">

                    {{-- 1.1 ANTECEDENTES --}}
                    <div class="space-y-4">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-l-4 border-green-500 pl-3">1.1. ANTECEDENTES</h3>
                        
                        <div class="space-y-3">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Historia de la Institución / Proyecto</label>
                            <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.antecedentes.history" rows="6"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none resize-none"></textarea>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Demanda Inicial</label>
                                <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.antecedentes.demandInitial" rows="3"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none resize-none"></textarea>
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Demanda Primaria</label>
                                <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.antecedentes.demandPrimary" rows="3"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none resize-none"></textarea>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Vías de Acceso</label>
                            <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.antecedentes.accessRoads" rows="4"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none resize-none"></textarea>
                        </div>
                    </div>

                    {{-- 1.2 DATOS DEL PROYECTO --}}
                    <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-l-4 border-green-500 pl-3">1.2. DATOS DEL PROYECTO</h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Nombre del Proyecto</label>
                                <textarea x-model="$store.memoriaDescriptiva.cover.project" rows="3"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none resize-none"></textarea>
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">UEI (Unidad Ejecutora)</label>
                                <input type="text" x-model="$store.memoriaDescriptiva.cover.uei"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Código Unificado</label>
                                <input type="text" x-model="$store.memoriaDescriptiva.cover.unifiedCode"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Nombre de la IE</label>
                                <input type="text" x-model="$store.memoriaDescriptiva.cover.ieName"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Código de Local</label>
                                <input type="text" x-model="$store.memoriaDescriptiva.cover.localCode"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Código(s) Modular(es)</label>
                                <input type="text" x-model="$store.memoriaDescriptiva.cover.modularCodes"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Región</label>
                                <input type="text" x-model="$store.memoriaDescriptiva.cover.region"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Centro Poblado</label>
                                <input type="text" x-model="$store.memoriaDescriptiva.cover.centerTown"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Fecha</label>
                                <input type="date" x-model="$store.memoriaDescriptiva.cover.date"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none">
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Elaborado por</label>
                                <input type="text" x-model="$store.memoriaDescriptiva.cover.preparedBy"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none">
                            </div>
                        </div>
                    </div>

                    {{-- 1.3 RELACIÓN DE DOCUMENTOS Y PLANOS --}}
                    <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-l-4 border-green-500 pl-3">1.3. RELACIÓN DE DOCUMENTOS Y PLANOS</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Esta información se genera automáticamente en el documento Word basada en los módulos configurados.</p>
                    </div>

                    {{-- 1.4 OBJETIVOS --}}
                    <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-l-4 border-green-500 pl-3">1.4. OBJETIVOS</h3>
                        
                        <div class="space-y-3">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Objetivo General</label>
                            <textarea x-model="$store.memoriaDescriptiva.sections.generalidades.objetivos.general" rows="3"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 transition-all outline-none resize-none"></textarea>
                        </div>

                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Objetivos Específicos</label>
                                <button type="button" @click="addObjetivoEspecifico()"
                                    class="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-all flex items-center gap-1">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Agregar
                                </button>
                            </div>
                            <template x-for="(obj, index) in $store.memoriaDescriptiva.sections.generalidades.objetivos.especificos" :key="index">
                                <div class="flex gap-2 items-start">
                                    <span class="text-green-600 font-bold mt-2">•</span>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.objetivos.especificos[index]"
                                        :placeholder="`Objetivo específico ${index + 1}`"
                                        class="flex-1 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-green-500 transition-all outline-none">
                                    <button type="button" @click="removeObjetivoEspecifico(index)"
                                        class="text-red-500 hover:text-red-700 p-2">
                                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </template>
                        </div>
                    </div>

                    {{-- 1.5 MARCO NORMATIVO --}}
                    <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-l-4 border-green-500 pl-3">1.5. MARCO NORMATIVO</h3>
                        
                        <div class="flex items-center justify-between mb-3">
                            <p class="text-sm text-gray-500 dark:text-gray-400">Normas técnicas aplicadas en el proyecto</p>
                            <button type="button" @click="addMarcoNormativo()"
                                class="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-all flex items-center gap-1">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Agregar Norma
                            </button>
                        </div>
                        <template x-for="(norma, index) in $store.memoriaDescriptiva.sections.generalidades.marcoNormativo" :key="index">
                            <div class="flex gap-2 items-start">
                                <span class="text-green-600 font-bold mt-2">•</span>
                                <input type="text" x-model="$store.memoriaDescriptiva.sections.generalidades.marcoNormativo[index]"
                                    :placeholder="`Norma Técnica ${index + 1}`"
                                    class="flex-1 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-green-500 transition-all outline-none">
                                <button type="button" @click="removeMarcoNormativo(index)"
                                    class="text-red-500 hover:text-red-700 p-2">
                                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </template>
                    </div>

                </div>

                {{-- Botones de navegación --}}
                <div class="flex justify-between mt-8 pt-4 border-t">
                    <a href="{{ route('memoria-descriptiva.portada') }}" class="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">← Anterior</a>
                    <a href="{{ route('memoria-descriptiva.consideraciones') }}" class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Siguiente →</a>
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