{{-- resources/views/hcalculo/memoria_descriptiva/portada.blade.php --}}
<x-calc-layout title="Memoria Descriptiva - Portada">
    <div class="py-4" x-data="memoriaDescriptiva" x-init="init()">
        <div class="container mx-auto px-4 max-w-7xl">

            {{-- ══════════════════════════════════════
                 BARRA DE NAVEGACIÓN
            ══════════════════════════════════════ --}}
            <nav class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.portada') }}"
                    class="px-4 py-2 rounded-lg bg-green-600 text-white shadow-md text-sm font-medium">
                    📄 Portada
                </a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.generalidades') }}"
                    class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
                    📋 1. GENERALIDADES
                </a>
                <a href="{{ route('calculadora.asistente.memoria-descriptiva.consideraciones') }}"
                    class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
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
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-white">Portada del Proyecto</h2>
                            <p class="text-green-100 text-sm">Datos generales del proyecto y la institución educativa
                            </p>
                        </div>
                    </div>
                </div>

                <div class="p-6 space-y-8">

                    {{-- ══════════════════════════════════════
                         TÍTULOS Y ENCABEZADOS
                    ══════════════════════════════════════ --}}
                    <section
                        class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div
                            class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                INFORMACIÓN GENERAL
                            </h3>
                        </div>
                        <div class="p-4 space-y-4">
                            <div>
                                <label
                                    class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Título</label>
                                <input type="text" x-model="$store.memoriaDescriptiva.cover.title"
                                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            </div>
                            <div>
                                <label
                                    class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Subtítulo</label>
                                <input type="text" x-model="$store.memoriaDescriptiva.cover.subtitle"
                                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            </div>
                            <div>
                                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Nombre
                                    del Proyecto</label>
                                <textarea x-model="$store.memoriaDescriptiva.cover.project" rows="3"
                                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"></textarea>
                            </div>
                        </div>
                    </section>

                    {{-- ══════════════════════════════════════
     IMAGEN DE PORTADA
══════════════════════════════════════ --}}
                    <section
                        class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div
                            class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                IMAGEN DEL PROYECTO
                            </h3>
                        </div>
                        <div class="p-4">
                            <!-- CAMBIADO: previews.coverImage → cover.coverImage -->
                            <div x-show="$store.memoriaDescriptiva.cover.coverImage" class="relative inline-block">
                                <img :src="$store.memoriaDescriptiva.cover.coverImage"
                                    class="max-h-48 object-contain border border-gray-200 dark:border-gray-600 rounded-lg">
                                <button type="button" @click="$store.memoriaDescriptiva.removeImage('coverImage')"
                                    class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow cursor-pointer">✕</button>
                            </div>
                            <!-- CAMBIADO: previews.coverImage → cover.coverImage -->
                            <label x-show="!$store.memoriaDescriptiva.cover.coverImage"
                                class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition bg-white dark:bg-gray-800">
                                <svg class="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span class="text-xs text-gray-500">Click para subir imagen</span>
                                <span class="text-xs text-gray-400 mt-1">JPG, PNG hasta 10MB</span>
                                <input type="file" accept="image/*"
                                    @change="$store.memoriaDescriptiva.handleImageChange('coverImage', $event)"
                                    class="hidden">
                            </label>
                            <p class="text-xs text-gray-400 mt-2">💡 Imagen que aparecerá en la portada del documento
                            </p>
                        </div>
                    </section>

                    {{-- ══════════════════════════════════════
                         DATOS INSTITUCIONALES
                    ══════════════════════════════════════ --}}
                    <section
                        class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div
                            class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                DATOS INSTITUCIONALES
                            </h3>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">UEI
                                        (Unidad Ejecutora)</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.cover.uei"
                                        class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Código
                                        Unificado</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.cover.unifiedCode"
                                        class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                </div>
                                <div class="md:col-span-2">
                                    <label
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Nombre
                                        de la IE</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.cover.ieName"
                                        class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Código
                                        de Local</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.cover.localCode"
                                        class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Códigos
                                        Modulares</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.cover.modularCodes"
                                        class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                </div>
                            </div>
                        </div>
                    </section>

                    {{-- ══════════════════════════════════════
                         UBICACIÓN GEOGRÁFICA
                    ══════════════════════════════════════ --}}
                    <section
                        class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div
                            class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                UBICACIÓN GEOGRÁFICA
                            </h3>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Región</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.cover.region"
                                        class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Provincia</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.cover.province"
                                        class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Distrito</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.cover.district"
                                        class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Centro
                                        Poblado</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.cover.centerTown"
                                        class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                </div>
                            </div>
                        </div>
                    </section>

                    {{-- ══════════════════════════════════════
                         FECHA Y RESPONSABLE
                    ══════════════════════════════════════ --}}
                    <section
                        class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div
                            class="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                FECHA Y RESPONSABLE
                            </h3>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Fecha</label>
                                    <input type="date" x-model="$store.memoriaDescriptiva.cover.date"
                                        class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                </div>
                                <div>
                                    <label
                                        class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Preparado
                                        por / Autor</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.cover.preparedBy"
                                        class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Nombre del profesional">
                                </div>
                            </div>
                        </div>
                    </section>

                    {{-- ══════════════════════════════════════
                         BOTONES DE NAVEGACIÓN
                    ══════════════════════════════════════ --}}
                    <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button @click="exportWord()" :disabled="isExporting"
                            class="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span x-text="isExporting ? 'Exportando...' : 'Exportar a Word'"></span>
                        </button>
                        <a href="{{ route('calculadora.asistente.memoria-descriptiva.generalidades') }}"
                            class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium shadow-md">
                            Siguiente
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
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
