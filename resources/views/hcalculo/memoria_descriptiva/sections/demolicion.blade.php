{{-- resources/views/hcalculo/memoria_descriptiva/demolicion.blade.php --}}
<x-calc-layout title="Memoria Descriptiva - Demolición">
    <div class="py-4" x-data="memoriaDescriptiva" x-init="init()">
        <div class="container mx-auto px-4 max-w-7xl">

            {{-- Barra de navegación --}}
            <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.portada') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📄 Portada</a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.generalidades') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📋 1. GENERALIDADES</a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.consideraciones') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">⚙️ 2. CONSIDERACIONES</a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.predimensionamiento') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">📐 3. PREDIMENSIONAMIENTO</a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.demolicion') }}" class="px-4 py-2 rounded-lg bg-red-600 text-white shadow-md">💥 4. DEMOLICIÓN</a>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                
                {{-- Header con gradiente rojo --}}
                <div class="bg-gradient-to-r from-red-600 to-red-800 px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-white">4. ALCANCE DEL ESTUDIO DE DEMOLICIÓN</h2>
                            <p class="text-red-100 text-sm">Elementos existentes a demoler para la ejecución del proyecto</p>
                        </div>
                    </div>
                </div>

                <div class="p-6">
                    
                    {{-- Barra de progreso / resumen --}}
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                            <div class="text-2xl font-bold text-red-600" x-text="$store.memoriaDescriptiva.sections.demolicion.modulosADemoler?.length || 0"></div>
                            <div class="text-xs text-gray-500">Módulos a Demoler</div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                            <div class="text-2xl font-bold text-red-600" x-text="$store.memoriaDescriptiva.sections.demolicion.obrasExterioresADemoler?.length || 0"></div>
                            <div class="text-xs text-gray-500">Obras Exteriores</div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                            <div class="text-2xl font-bold text-red-600" x-text="$store.memoriaDescriptiva.previews.demolicionImages?.filter(i => i).length || 0"></div>
                            <div class="text-xs text-gray-500">Evidencias Fotográficas</div>
                        </div>
                    </div>

                    {{-- Descripción General --}}
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                DESCRIPCIÓN GENERAL
                            </h3>
                        </div>
                        <div class="p-4">
                            <textarea x-model="$store.memoriaDescriptiva.sections.demolicion.alcance" 
                                      rows="6" class="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500"
                                      placeholder="Describir el alcance general de la demolición, edificaciones existentes, áreas a intervenir, etc."></textarea>
                            <p class="text-xs text-gray-400 mt-2">💡 Esta descripción aparecerá al inicio de la sección de demolición en el Word</p>
                        </div>
                    </div>

                    {{-- Módulos a Demoler --}}
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div class="flex justify-between items-center">
                                <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    MÓDULOS A DEMOLER
                                </h3>
                                <button type="button" @click="addModuloADemoler()" 
                                        class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                    Agregar Módulo
                                </button>
                            </div>
                        </div>
                        <div class="p-4">
                            <div x-data="{ items: $store.memoriaDescriptiva.sections.demolicion.modulosADemoler }">
                                <template x-for="(item, idx) in items" :key="idx">
                                    <div class="flex gap-2 mt-2">
                                        <div class="flex-1 flex items-center gap-2">
                                            <span class="text-red-500 font-bold text-sm" x-text="(idx + 1) + '.'"></span>
                                            <input type="text" x-model="items[idx]" class="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500" placeholder="Ej: MÓDULO I (Biblioteca) - DEMOLICIÓN TOTAL">
                                        </div>
                                        <button @click="items.splice(idx,1)" class="text-red-500 hover:text-red-700 px-2 transition">✕</button>
                                    </div>
                                </template>
                                <div x-show="items.length === 0" class="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 text-sm">
                                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    No hay módulos registrados para demolición.
                                    <button @click="items.push('')" class="block mx-auto mt-2 text-red-500 text-xs hover:underline">+ Agregar primer módulo</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Obras Exteriores a Demoler --}}
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div class="flex justify-between items-center">
                                <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    OBRAS EXTERIORES A DEMOLER
                                </h3>
                                <button type="button" @click="addObraExteriorADemoler()" 
                                        class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                    Agregar Obra Exterior
                                </button>
                            </div>
                        </div>
                        <div class="p-4">
                            <div x-data="{ items: $store.memoriaDescriptiva.sections.demolicion.obrasExterioresADemoler }">
                                <template x-for="(item, idx) in items" :key="idx">
                                    <div class="flex gap-2 mt-2">
                                        <div class="flex-1 flex items-center gap-2">
                                            <span class="text-red-500 font-bold text-sm" x-text="(idx + 1) + '.'"></span>
                                            <input type="text" x-model="items[idx]" class="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-red-500" placeholder="Ej: PATIO DE FORMACIÓN - DEMOLICIÓN TOTAL">
                                        </div>
                                        <button @click="items.splice(idx,1)" class="text-red-500 hover:text-red-700 px-2 transition">✕</button>
                                    </div>
                                </template>
                                <div x-show="items.length === 0" class="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 text-sm">
                                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    No hay obras exteriores registradas para demolición.
                                    <button @click="items.push('')" class="block mx-auto mt-2 text-red-500 text-xs hover:underline">+ Agregar primera obra exterior</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Evidencia Fotográfica --}}
                    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                        <div class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div class="flex justify-between items-center">
                                <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    EVIDENCIA FOTOGRÁFICA
                                </h3>
                                <button type="button" @click="addDemolicionImage()" 
                                        class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                                    Agregar Imagen
                                </button>
                            </div>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <template x-for="(img, idx) in $store.memoriaDescriptiva.previews.demolicionImages" :key="idx">
                                    <div class="relative">
                                        <template x-if="img">
                                            <div class="relative group">
                                                <img :src="img" class="h-32 w-full object-cover rounded-lg border shadow-sm">
                                                <button @click="$store.memoriaDescriptiva.removeDemolicionImage(idx)" 
                                                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
                                            </div>
                                        </template>
                                        <template x-if="!img">
                                            <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition group">
                                                <svg class="w-8 h-8 text-gray-400 mb-1 group-hover:text-red-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span class="text-xs text-gray-500">Subir imagen</span>
                                                <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleDemolicionImageChange(idx, $event)" class="hidden">
                                            </label>
                                        </template>
                                    </div>
                                </template>
                            </div>
                            <p class="text-xs text-gray-400 mt-3 text-center">💡 Las imágenes se mostrarán en una galería en el Word</p>
                        </div>
                    </div>

                    {{-- Nota importante --}}
                    <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
                        <div class="flex items-start gap-3">
                            <svg class="h-5 w-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Nota importante</p>
                                <p class="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                    La demolición deberá ejecutarse siguiendo todas las normas de seguridad vigentes, 
                                    con personal calificado y equipos adecuados. Se deberá coordinar con las autoridades 
                                    locales y obtener los permisos correspondientes antes de iniciar cualquier trabajo de demolición.
                                </p>
                            </div>
                        </div>
                    </div>

                    {{-- Botones de navegación --}}
                    <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a href="{{ route('calculadora.asistente.memoria-descriptiva.predimensionamiento') }}" class="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                            Anterior
                        </a>
                        <button @click="exportWord()" :disabled="isExporting" 
                            class="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2 shadow-md">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span x-text="isExporting ? 'Exportando...' : 'Exportar a Word'"></span>
                        </button>
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