{{-- sections/tabla-resumen.blade.php --}}
<section id="section-tabla-resumen" x-data="createGeneralidadesComponent()"
    class="scroll-mt-2 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-3 mb-6">
        <div
            class="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Tabla Resumen (Sección 1.4)</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Detalles estructurales del proyecto</p>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                # de Pisos
            </label>
            <input type="number" x-model.number="floors" @input="updateFloors()" min="1" max="20" validate
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none">
        </div>

        <div class="col-span-full space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Uso (Detalle por pisos)</label>
            <textarea x-model="structuralDetails.usage" rows="4"
                placeholder="Ej: 1° PISO: Local comercial&#10;2° PISO: Consultorio médico..."
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none font-mono text-sm"></textarea>
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Sistema Estructural en
                X</label>
            <input type="text" x-model="structuralDetails.structuralSystemX" placeholder="Ej: Pórticos"
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Sistema Estructural en
                Y</label>
            <input type="text" x-model="structuralDetails.structuralSystemY" placeholder="Ej: Placas"
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Elementos Verticales</label>
            <input type="text" x-model="structuralDetails.verticalElements" placeholder="Ej: Columnas C1"
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Elementos Horizontales</label>
            <input type="text" x-model="structuralDetails.horizontalElements" placeholder="Ej: Vigas V1, V2"
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
        </div>

        <div class="col-span-full space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tipo de Techo</label>
            <input type="text" x-model="structuralDetails.roofType" placeholder="Ej: Losa aligerada"
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
        </div>
    </div>

    {{-- Sección de Imágenes por Piso --}}
    <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3 mb-6">
            <div
                class="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Imágenes por Piso</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Plantas arquitectónicas de cada nivel</p>
            </div>
        </div>

        <template x-if="floors === 0 || !floors">
            <div
                class="text-center py-12 px-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-dashed border-yellow-300 dark:border-yellow-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-yellow-600" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Primero define el número de
                    pisos</p>
                <p class="text-xs text-yellow-600 dark:text-yellow-400">Establece el número de pisos arriba para subir
                    las imágenes</p>
            </div>
        </template>

        <template x-if="floors > 0">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <template x-for="(floorImg, index) in previews.floorImages" :key="index">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-bold text-gray-700 dark:text-gray-300">
                                <span x-text="`Piso ${index + 1}`"></span>
                            </label>
                            <button type="button" x-show="previews.floorImages[index]"
                                @click="removeFloorImage(index)"
                                class="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                            </button>
                        </div>
                        <div class="relative group">
                            <template x-if="previews.floorImages[index]">
                                <div
                                    class="relative h-48 w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                                    <img :src="previews.floorImages[index]"
                                        class="max-h-full max-w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105">
                                </div>
                            </template>
                            <template x-if="!previews.floorImages[index]">
                                <label
                                    class="flex flex-col items-center justify-center h-48 w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
                                    <div
                                        class="p-3 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 mb-2 group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Click para
                                        subir</span>
                                    <span class="text-xs text-gray-500">PNG, JPG</span>
                                    <input type="file" accept="image/*"
                                        @change="handleFloorImageChange(index, $event)" class="hidden">
                                </label>
                            </template>
                        </div>
                    </div>
                </template>
            </div>
        </template>
    </div>
</section>