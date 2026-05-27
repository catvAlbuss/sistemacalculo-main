{{-- resources/views/hcalculo/memoria_descriptiva/demolicion.blade.php --}}
<x-calc-layout title="Memoria Descriptiva - Demolición">
    <div class="py-4" x-data="memoriaDescriptiva">
        <div class="container mx-auto px-4 max-w-7xl">

            {{-- Barra de navegación --}}
            <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                <a href="{{ route('memoria-descriptiva.portada') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">📄 Portada</a>
                <a href="{{ route('memoria-descriptiva.generalidades') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">📋 1. GENERALIDADES</a>
                <a href="{{ route('memoria-descriptiva.consideraciones') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">⚙️ 2. CONSIDERACIONES</a>
                <a href="{{ route('memoria-descriptiva.predimensionamiento') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">📐 3. PREDIMENSIONAMIENTO</a>
                <a href="{{ route('memoria-descriptiva.demolicion') }}" class="px-4 py-2 rounded-lg bg-green-600 text-white">💥 4. DEMOLICIÓN</a>
            </div>

            {{-- Contenido de DEMOLICIÓN --}}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                
                <div class="flex items-center gap-3 mb-6">
                    <div class="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">4. ALCANCE DEL ESTUDIO DE DEMOLICIÓN</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Elementos existentes a demoler para la ejecución del proyecto</p>
                    </div>
                </div>

                {{-- Descripción General --}}
                <div class="mb-6">
                    <label class="font-semibold text-sm block mb-2">Descripción General</label>
                    <textarea x-model="$store.memoriaDescriptiva.sections.demolicion.alcance" rows="5" 
                              class="w-full border rounded-lg p-3 text-sm"
                              placeholder="Describir el alcance general de la demolición, edificaciones existentes, áreas a intervenir, etc."></textarea>
                </div>

                {{-- Módulos a Demoler --}}
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-bold text-lg">Módulos a Demoler</h3>
                        <button type="button" @click="addModuloADemoler()" 
                                class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg">+ Agregar Módulo</button>
                    </div>
                    <div x-data="{ items: $store.memoriaDescriptiva.sections.demolicion.modulosADemoler }">
                        <template x-for="(item, idx) in items" :key="idx">
                            <div class="flex gap-2 mt-2">
                                <input type="text" x-model="items[idx]" class="flex-1 border rounded p-2 text-sm" placeholder="Módulo a demoler...">
                                <button @click="items.splice(idx,1)" class="text-red-500 px-2">✕</button>
                            </div>
                        </template>
                        <div x-show="items.length === 0" class="text-center py-4 bg-gray-100 rounded-lg text-gray-500 text-sm">
                            No hay módulos registrados para demolición.
                        </div>
                    </div>
                </div>

                {{-- Obras Exteriores a Demoler --}}
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-bold text-lg">Obras Exteriores a Demoler</h3>
                        <button type="button" @click="addObraExteriorADemoler()" 
                                class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg">+ Agregar Obra Exterior</button>
                    </div>
                    <div x-data="{ items: $store.memoriaDescriptiva.sections.demolicion.obrasExterioresADemoler }">
                        <template x-for="(item, idx) in items" :key="idx">
                            <div class="flex gap-2 mt-2">
                                <input type="text" x-model="items[idx]" class="flex-1 border rounded p-2 text-sm" placeholder="Obra exterior a demoler...">
                                <button @click="items.splice(idx,1)" class="text-red-500 px-2">✕</button>
                            </div>
                        </template>
                        <div x-show="items.length === 0" class="text-center py-4 bg-gray-100 rounded-lg text-gray-500 text-sm">
                            No hay obras exteriores registradas para demolición.
                        </div>
                    </div>
                </div>

                {{-- Evidencia Fotográfica --}}
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-bold text-lg">Evidencia Fotográfica</h3>
                        <button type="button" @click="addDemolicionImage()" 
                                class="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg">+ Agregar Imagen</button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <template x-for="(img, idx) in $store.memoriaDescriptiva.previews.demolicionImages" :key="idx">
                            <div class="relative">
                                <template x-if="img">
                                    <div class="relative">
                                        <img :src="img" class="h-40 w-full object-cover border rounded-lg">
                                        <button @click="$store.memoriaDescriptiva.removeDemolicionImage(idx)" 
                                                class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                                    </div>
                                </template>
                                <template x-if="!img">
                                    <label class="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                        <svg class="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span class="text-xs text-gray-500">Subir imagen</span>
                                        <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handleDemolicionImageChange(idx, $event)" class="hidden">
                                    </label>
                                </template>
                            </div>
                        </template>
                    </div>
                </div>

                {{-- Nota importante --}}
                <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
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
                <div class="flex justify-between mt-8 pt-4 border-t">
                    <a href="{{ route('memoria-descriptiva.predimensionamiento') }}" class="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">← Anterior</a>
                    <div></div>
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