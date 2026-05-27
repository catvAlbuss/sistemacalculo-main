{{-- resources/views/hcalculo/memoria_descriptiva/predimensionamiento.blade.php --}}
<x-calc-layout title="Memoria Descriptiva - Predimensionamiento">
    <div class="py-4" x-data="memoriaDescriptiva">
        <div class="container mx-auto px-4 max-w-7xl">

            {{-- Barra de navegación --}}
            <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
                <a href="{{ route('memoria-descriptiva.portada') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">📄 Portada</a>
                <a href="{{ route('memoria-descriptiva.generalidades') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">📋 1. GENERALIDADES</a>
                <a href="{{ route('memoria-descriptiva.consideraciones') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">⚙️ 2. CONSIDERACIONES</a>
                <a href="{{ route('memoria-descriptiva.predimensionamiento') }}" class="px-4 py-2 rounded-lg bg-green-600 text-white">📐 3. PREDIMENSIONAMIENTO</a>
                <a href="{{ route('memoria-descriptiva.demolicion') }}" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">💥 4. DEMOLICIÓN</a>
            </div>

            {{-- Contenido de PREDIMENSIONAMIENTO --}}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                
                <div class="flex items-center gap-3 mb-6">
                    <div class="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">3. PREDIMENSIONAMIENTO DE ELEMENTOS ESTRUCTURALES</h2>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Dimensiones preliminares de los elementos estructurales por módulo</p>
                    </div>
                </div>

                {{-- Selector de Módulo --}}
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Seleccionar Módulo</label>
                    <div class="flex flex-wrap gap-2">
                        <template x-for="i in 15" :key="i">
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
                        
                        {{-- PREDIMENSIONAMIENTO DE LOS TECHOS --}}
                        <div class="border rounded-lg p-4">
                            <h3 class="text-lg font-bold mb-3 text-cyan-600">PREDIMENSIONAMIENTO DE LOS TECHOS</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Tipo de techo</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].techos.tipo" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Luz mayor (m)</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].techos.luz" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                                <div>
                                    <label class="text-sm font-semibold block mb-1">Espesor propuesto (m)</label>
                                    <input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].techos.espesor" 
                                           class="w-full border rounded-lg p-2 text-sm">
                                </div>
                            </div>
                            
                            {{-- Imagen de losa --}}
                            <div class="mt-4">
                                <label class="text-sm font-semibold block mb-2">Imagen - Pre dimensionamiento de losa aligerada</label>
                                <div class="relative">
                                    <template x-if="$store.memoriaDescriptiva.previews.predimLosaImage[moduloActual]">
                                        <div class="relative inline-block">
                                            <img :src="$store.memoriaDescriptiva.previews.predimLosaImage[moduloActual]" class="max-h-48 object-contain border rounded">
                                            <button @click="$store.memoriaDescriptiva.removePredimLosaImage(moduloActual)" 
                                                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                                        </div>
                                    </template>
                                    <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50" 
                                           x-show="!$store.memoriaDescriptiva.previews.predimLosaImage[moduloActual]">
                                        <svg class="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span class="text-xs text-gray-500">Subir imagen</span>
                                        <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handlePredimLosaImageChange(moduloActual, $event)" class="hidden">
                                    </label>
                                </div>
                            </div>
                        </div>

                        {{-- PREDIMENSIONAMIENTO DE VIGAS --}}
                        <div class="border rounded-lg p-4">
                            <h3 class="text-lg font-bold mb-3 text-cyan-600">PREDIMENSIONAMIENTO DE VIGAS</h3>
                            
                            {{-- Vigas Principales --}}
                            <div class="mb-4">
                                <h4 class="font-bold text-md mb-2">Vigas Principales</h4>
                                <div class="overflow-x-auto">
                                    <table class="w-full border-collapse border border-gray-300 text-sm">
                                        <thead>
                                            <tr class="bg-gray-100">
                                                <th class="border p-2">Eje</th>
                                                <th class="border p-2">b (cm)</th>
                                                <th class="border p-2">h (cm)</th>
                                                <th class="border p-2">Luz (m)</th>
                                                <th class="border p-2">b/h</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td class="border p-2">A</td>
                                                <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeA.b" class="w-20 border rounded p-1"></td>
                                                <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeA.h" class="w-20 border rounded p-1"></td>
                                                <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeA.luz" class="w-20 border rounded p-1"></td>
                                                <td class="border p-2" x-text="($store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeA.b / $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeA.h).toFixed(2)"></td>
                                            </tr>
                                            <tr>
                                                <td class="border p-2">B</td>
                                                <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeB.b" class="w-20 border rounded p-1"></td>
                                                <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeB.h" class="w-20 border rounded p-1"></td>
                                                <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeB.luz" class="w-20 border rounded p-1"></td>
                                                <td class="border p-2" x-text="($store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeB.b / $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeB.h).toFixed(2)"></td>
                                            </tr>
                                            <tr>
                                                <td class="border p-2">C</td>
                                                <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeC.b" class="w-20 border rounded p-1"></td>
                                                <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeC.h" class="w-20 border rounded p-1"></td>
                                                <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeC.luz" class="w-20 border rounded p-1"></td>
                                                <td class="border p-2" x-text="($store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeC.b / $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].vigas.principal.ejeC.h).toFixed(2)"></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {{-- Imagen de vigas --}}
                            <div class="mt-4">
                                <label class="text-sm font-semibold block mb-2">Imagen - Pre dimensionamiento de vigas</label>
                                <div class="relative">
                                    <template x-if="$store.memoriaDescriptiva.previews.predimVigaImage[moduloActual]">
                                        <div class="relative inline-block">
                                            <img :src="$store.memoriaDescriptiva.previews.predimVigaImage[moduloActual]" class="max-h-48 object-contain border rounded">
                                            <button @click="$store.memoriaDescriptiva.removePredimVigaImage(moduloActual)" 
                                                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                                        </div>
                                    </template>
                                    <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50" 
                                           x-show="!$store.memoriaDescriptiva.previews.predimVigaImage[moduloActual]">
                                        <svg class="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span class="text-xs text-gray-500">Subir imagen</span>
                                        <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handlePredimVigaImageChange(moduloActual, $event)" class="hidden">
                                    </label>
                                </div>
                            </div>
                        </div>

                        {{-- PREDIMENSIONAMIENTO DE COLUMNAS --}}
                        <div class="border rounded-lg p-4">
                            <h3 class="text-lg font-bold mb-3 text-cyan-600">PREDIMENSIONAMIENTO DE COLUMNAS</h3>
                            
                            <div class="overflow-x-auto">
                                <table class="w-full border-collapse border border-gray-300 text-sm">
                                    <thead>
                                        <tr class="bg-gray-100">
                                            <th class="border p-2">Columna</th>
                                            <th class="border p-2">b (cm)</th>
                                            <th class="border p-2">h (cm)</th>
                                            <th class="border p-2">Área (cm²)</th>
                                            <th class="border p-2">Observación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="border p-2">C1 (esquina)</td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c1.b" class="w-20 border rounded p-1"></td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c1.h" class="w-20 border rounded p-1"></td>
                                            <td class="border p-2" x-text="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c1.b * $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c1.h"></td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c1.obs" class="w-full border rounded p-1"></td>
                                        </tr>
                                        <tr>
                                            <td class="border p-2">C2 (borde)</td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c2.b" class="w-20 border rounded p-1"></td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c2.h" class="w-20 border rounded p-1"></td>
                                            <td class="border p-2" x-text="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c2.b * $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c2.h"></td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c2.obs" class="w-full border rounded p-1"></td>
                                        </tr>
                                        <tr>
                                            <td class="border p-2">C3 (central)</td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c3.b" class="w-20 border rounded p-1"></td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c3.h" class="w-20 border rounded p-1"></td>
                                            <td class="border p-2" x-text="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c3.b * $store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c3.h"></td>
                                            <td class="border p-2"><input type="text" x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].columnas.c3.obs" class="w-full border rounded p-1"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {{-- Imagen de columnas --}}
                            <div class="mt-4">
                                <label class="text-sm font-semibold block mb-2">Imagen - Detalle de columnas</label>
                                <div class="relative">
                                    <template x-if="$store.memoriaDescriptiva.previews.predimColumnaImage[moduloActual]">
                                        <div class="relative inline-block">
                                            <img :src="$store.memoriaDescriptiva.previews.predimColumnaImage[moduloActual]" class="max-h-48 object-contain border rounded">
                                            <button @click="$store.memoriaDescriptiva.removePredimColumnaImage(moduloActual)" 
                                                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
                                        </div>
                                    </template>
                                    <label class="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50" 
                                           x-show="!$store.memoriaDescriptiva.previews.predimColumnaImage[moduloActual]">
                                        <svg class="w-8 h-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span class="text-xs text-gray-500">Subir imagen</span>
                                        <input type="file" accept="image/*" @change="$store.memoriaDescriptiva.handlePredimColumnaImageChange(moduloActual, $event)" class="hidden">
                                    </label>
                                </div>
                            </div>
                        </div>

                        {{-- Observaciones --}}
                        <div class="border rounded-lg p-4">
                            <h3 class="text-lg font-bold mb-3 text-cyan-600">Observaciones</h3>
                            <textarea x-model="$store.memoriaDescriptiva.sections.predimensionamiento[moduloActual].observaciones" 
                                      rows="4" class="w-full border rounded-lg p-3 text-sm"
                                      placeholder="El espesor de losa aligerada no debe permitir deflexiones fuera de los límites establecidos..."></textarea>
                        </div>

                    </div>
                </template>

                {{-- Mensaje de carga --}}
                <div x-show="!moduloActual" class="text-center py-12 text-gray-500">
                    Cargando datos del módulo...
                </div>

                {{-- Botones de navegación --}}
                <div class="flex justify-between mt-8 pt-4 border-t">
                    <a href="{{ route('memoria-descriptiva.consideraciones') }}" class="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">← Anterior</a>
                    <a href="{{ route('memoria-descriptiva.demolicion') }}" class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Siguiente →</a>
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