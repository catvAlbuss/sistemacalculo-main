{{-- sections/diseno-elementos.blade.php - Sección de Diseño de Elementos --}}
<section id="section-diseno-elementos" x-data="createDisenoElementosComponent()"
    class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-3 mb-6">
        <div class="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Diseño de Elementos Estructurales</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Losas, vigas, columnas y otros elementos</p>
        </div>
    </div>

    <div class="space-y-4">
        <div class="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <p class="text-sm text-gray-700 dark:text-gray-300">Esta sección incluye el diseño de todos los elementos
                estructurales.</p>
        </div>
        <!-- SECCION 4.1 PREDIMENSIONAMIENTO DE ELEMENTOS ESTRUCTURALES -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection41 = !showSection41" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.1 PREDIMENSIONAMIENTO DE ELEMENTOS ESTRUCTURALES</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(16 secciones, 2 imágenes c/u)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection41" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">

                <!-- Controles globales -->
                <div class="flex items-center justify-between gap-4 p-4 bg-gray-100 dark:bg-gray-700/30 rounded-xl">
                    <div class="flex items-center gap-4">
                        <button type="button"
                            @click="toggleAllSecciones(true)"
                            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-all flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Seleccionar todas
                        </button>
                        <button type="button"
                            @click="toggleAllSecciones(false)"
                            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-all flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Deseleccionar todas
                        </button>
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        Secciones seleccionadas:
                        <span x-text="$store.memoriaCalculo.sections.disenoElementos.predimSecciones?.seleccionadas?.filter(s => s).length || 0"></span>
                        / 16
                    </div>
                </div>

                <!-- Grid de 16 secciones fijas -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <template x-for="seccionIndex in 16" :key="seccionIndex - 1">
                        <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/30"
                            :class="{
                         'border-green-500 dark:border-green-500 bg-green-50/50 dark:bg-green-900/20': $store.memoriaCalculo.sections.disenoElementos.predimSecciones?.seleccionadas?.[seccionIndex - 1],
                         'opacity-60': !$store.memoriaCalculo.sections.disenoElementos.predimSecciones?.seleccionadas?.[seccionIndex - 1]
                     }">

                            <!-- Cabecera de la sección con checkbox y título editable -->
                            <div class="flex items-center gap-3 mb-4">
                                <input type="checkbox"
                                    :checked="$store.memoriaCalculo.sections.disenoElementos.predimSecciones?.seleccionadas?.[seccionIndex - 1] ?? true"
                                    @change="handleSeccionSeleccion(seccionIndex - 1, $event)"
                                    class="w-5 h-5 text-green-600 rounded focus:ring-green-500">

                                <div class="flex-1">
                                    <input type="text"
                                        :value="getSeccionTitulo(seccionIndex - 1)"
                                        @input="handleTituloChange(seccionIndex - 1, $event)"
                                        class="w-full text-lg font-semibold text-gray-800 dark:text-gray-200 bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:outline-none px-2 py-1"
                                        placeholder="Título de la sección">
                                </div>
                            </div>

                            <div class="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>2 imágenes por sección (FIGURA y TABLA)</span>
                            </div>

                            <!-- Grid de 2 imágenes fijas -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Imagen 1: FIGURA / ESQUEMA -->
                                <div class="space-y-2" :data-image-slot="`predimImages-${seccionIndex - 1}-0`">
                                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        FIGURA / ESQUEMA
                                    </label>

                                    <!-- Preview de imagen -->
                                    <template x-if="$store.memoriaCalculo.previews.predimImages[seccionIndex - 1]?.[0]">
                                        <div class="relative group">
                                            <div class="relative h-40 w-full rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                <img :src="$store.memoriaCalculo.previews.predimImages[seccionIndex - 1][0]"
                                                    class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105">
                                            </div>
                                            <button type="button"
                                                @click="removePredimImage(seccionIndex - 1, 0)"
                                                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>

                                    <!-- Input file cuando no hay imagen -->
                                    <template x-if="!$store.memoriaCalculo.previews.predimImages[seccionIndex - 1]?.[0]">
                                        <label
                                            tabindex="0"
                                            class="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
                                            @paste="handlePasteElementoConfig($event, 'predim', seccionIndex - 1, 0)"
                                            @mouseenter="$el.focus()">
                                            <div class="p-2 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 mb-1 group-hover:scale-110 transition-transform">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o Ctrl+V</span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleElementoImageInput('predim', seccionIndex - 1, 0, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>

                                <!-- Imagen 2: TABLA / DETALLE -->
                                <div class="space-y-2" :data-image-slot="`predimImages-${seccionIndex - 1}-1`">
                                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        TABLA / DETALLE
                                    </label>

                                    <!-- Preview de imagen -->
                                    <template x-if="$store.memoriaCalculo.previews.predimImages[seccionIndex - 1]?.[1]">
                                        <div class="relative group">
                                            <div class="relative h-40 w-full rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                <img :src="$store.memoriaCalculo.previews.predimImages[seccionIndex - 1][1]"
                                                    class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105">
                                            </div>
                                            <button type="button"
                                                @click="removePredimImage(seccionIndex - 1, 1)"
                                                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>

                                    <!-- Input file cuando no hay imagen -->
                                    <template x-if="!$store.memoriaCalculo.previews.predimImages[seccionIndex - 1]?.[1]">
                                        <label
                                            tabindex="0"
                                            class="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
                                            @paste="handlePasteElementoConfig($event, 'predim', seccionIndex - 1, 1)"
                                            @mouseenter="$el.focus()">
                                            <div class="p-2 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 mb-1 group-hover:scale-110 transition-transform">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o Ctrl+V</span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleElementoImageInput('predim', seccionIndex - 1, 1, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <!-- SECCION 4.2.DISEÑO DE LOSA ALIGERADA -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection42 = !showSection42" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.2.DISEÑO DE LOSA ALIGERADA</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(4 imágenes por sección)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showSection42 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection42" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        {{-- Usar el nombre específico del array --}}
                        <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen de diseño por flexion</label>
                        <button type="button"
                            x-show="previews.disenoLosaAligeradaImages[0]"
                            @click="removeArrayImage('disenoLosaAligeradaImages', 0)"
                            class="text-red-500 text-xs font-semibold hover:underline">
                            Eliminar
                        </button>
                    </div>
                    <div class="relative group h-48">
                        <template x-if="previews.disenoLosaAligeradaImages[0]">
                            <img :src="previews.disenoLosaAligeradaImages[0]"
                                class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                        </template>
                        <template x-if="!previews.disenoLosaAligeradaImages[0]">
                            <div class="h-full">
                                <input type="file"
                                    :id="'file_pred_' + 0"
                                    @change="handleArrayImageChange('disenoLosaAligeradaImages', 0, $event)"
                                    class="hidden"
                                    accept="image/*">
                                <label :for="'file_pred_' + 0"
                                    @paste="handlePaste($event, 'disenoLosaAligeradaImages', 0)"
                                    @mouseenter="$el.focus()"
                                    class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                    tabindex="0">
                                    <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span class="text-xs text-gray-500 text-center">
                                        Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                    </span>
                                </label>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="w-full bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 text-gray-900 dark:text-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none font-medium">
                    <p class="text-sm text-gray-700 dark:text-gray-300">AVISO IMPORTANTE: Si en caso no detalla el nombre de las secciones no se tomara en cuenta las imagenes que se agregue.</p>
                </div>

                <!-- Inputs de número de secciones y texto -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            # de Secciones
                        </label>
                        <!-- Cambio importante: usar :value y @input en lugar de x-model -->
                        <input
                            type="number"
                            :value="losa"
                            @input="updateLosas($event.target.value)"
                            min="1"
                            max="20"
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Detalla el nombre de las secciones</label>
                        <textarea x-model="$store.memoriaCalculo.sections.disenoElementos.lista" rows="4"
                            placeholder="Diseño de losa aligerada 1&#10;Diseño de losa aligerada 2..."
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none font-mono text-sm"></textarea>
                    </div>
                </div>

                <!-- Área de imágenes -->
                <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Imágenes por Sección</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Cada sección tiene 4 imágenes</p>
                        </div>
                    </div>

                    <!-- Mensaje cuando no hay secciones -->
                    <template x-if="losa === 0 || !losa">
                        <div class="text-center py-12 px-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-dashed border-yellow-300 dark:border-yellow-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Primero define el número de secciones</p>
                            <p class="text-xs text-yellow-600 dark:text-yellow-400">Establece el número de secciones arriba para subir las imágenes</p>
                        </div>
                    </template>

                    <!-- Iterar por cada losa/sección -->
                    <template x-if="losa > 0">
                        <div class="space-y-8">
                            <template x-for="(seccion, seccionIndex) in Array.from({ length: losa })" :key="seccionIndex">
                                <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/30">
                                    <!-- Título de la sección -->
                                    <div class="flex items-center justify-between mb-4">
                                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200"
                                            x-text="'Sección ' + (seccionIndex + 1) + ': ' + (($store.memoriaCalculo.sections.disenoElementos.lista?.split('\n')[seccionIndex]?.trim() || 'Losa aligerada ' + (seccionIndex + 1)))">
                                        </h4>
                                        <span class="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 px-2 py-1 rounded-full">
                                            4 imágenes
                                        </span>
                                    </div>

                                    <!-- Grid de 4 imágenes -->
                                    <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
                                        <template x-for="imgIndex in 4" :key="imgIndex">
                                            <div class="space-y-2">
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Imagen <span x-text="imgIndex"></span>
                                                </label>

                                                <!-- Preview de imagen -->
                                                <template x-if="$store.memoriaCalculo.previews.losaImages[seccionIndex]?.[imgIndex-1]">
                                                    <div class="relative group">
                                                        <div class="relative h-40 w-full rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                            <img :src="$store.memoriaCalculo.previews.losaImages[seccionIndex][imgIndex-1]"
                                                                class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105">
                                                        </div>
                                                        <button type="button"
                                                            @click="removeLosaImage(seccionIndex, imgIndex-1)"
                                                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </template>

                                                <!-- Input file cuando no hay imagen -->
                                                <template x-if="!$store.memoriaCalculo.previews.losaImages[seccionIndex]?.[imgIndex-1]">
                                                    <label
                                                        tabindex="0"
                                                        class="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
                                                        @paste="handlePasteElementoConfig($event, 'losaAligerada', seccionIndex, imgIndex-1)"
                                                        @mouseenter="$el.focus()">
                                                        <div class="p-2 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 mb-1 group-hover:scale-110 transition-transform">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o Ctrl+V</span>
                                                        <span class="text-xs text-gray-500">PNG, JPG</span>
                                                        <!-- Cambio importante: usar handleElementoImageInput en lugar de handleLosaImageChange -->
                                                        <input type="file" accept="image/*"
                                                            @change="handleElementoImageInput('losaAligerada', seccionIndex, imgIndex-1, $event)"
                                                            class="hidden">
                                                    </label>
                                                </template>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <!-- SECCION 4.3. DISEÑO DE LOSA MACIZA -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection43 = !showSection43" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.3.DISEÑO DE LOSA MACIZA</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(6 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection43" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">

                <div class="space-y-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {{-- Definir los nombres específicos en un array --}}
                        <template x-for="(item, idx) in [
                            { index: 0, nombre: 'figura 52-M22(0.08TN-M)' },
                            { index: 1, nombre: 'figura 53-M33(0.056TN-M)' },
                            { index: 2, nombre: 'figura 54-V23 (0.52TN-M)' },
                            { index: 3, nombre: 'figura 55-V13 (0.22TN-M)' },
                            { index: 4, nombre: 'Requisitos de diseño 1' },
                            { index: 5, nombre: 'Requisitos de diseño 2' },
                        ]" :key="item.index">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                        x-text="item.nombre"></label>
                                    <button type="button"
                                        x-show="previews.disenoLosaMacizaImages[item.index]"
                                        @click="removeArrayImage('disenoLosaMacizaImages', item.index)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.disenoLosaMacizaImages[item.index]">
                                        <img :src="previews.disenoLosaMacizaImages[item.index]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.disenoLosaMacizaImages[item.index]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + item.index"
                                                @change="handleArrayImageChange('disenoLosaMacizaImages', item.index, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + item.index"
                                                @paste="handlePaste($event, 'disenoLosaMacizaImages', item.index)"
                                                @mouseenter="$el.focus()"
                                                class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                                tabindex="0">
                                                <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span class="text-xs text-gray-500 text-center">
                                                    Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                                </span>
                                            </label>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <!-- SECCION 4.4. DISEÑO DE LOSA NERVADA -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection44 = !showSection44" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.4. DISEÑO DE LOSA NERVADA</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(18 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection44" x-collapse class="bg-white dark:bg-gray-800/50">
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection441 = !showSection441" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Diseño de losa nervada 1 e=0.25
                            (9 imágenes)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection441 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection441" x-collapse class="p-6 space-y-6">

                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                {{-- Usar el nombre específico del array --}}
                                <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Ubicación de la losa para diseñar</label>
                                <button type="button"
                                    x-show="previews.disenoLosaNervada1Images[0]"
                                    @click="removeArrayImage('disenoLosaNervada1Images', 0)"
                                    class="text-red-500 text-xs font-semibold hover:underline">
                                    Eliminar
                                </button>
                            </div>
                            <div class="relative group h-48">
                                <template x-if="previews.disenoLosaNervada1Images[0]">
                                    <img :src="previews.disenoLosaNervada1Images[0]"
                                        class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                </template>
                                <template x-if="!previews.disenoLosaNervada1Images[0]">
                                    <div class="h-full">
                                        <input type="file"
                                            :id="'file_pred_' + 0"
                                            @change="handleArrayImageChange('disenoLosaNervada1Images', 0, $event)"
                                            class="hidden"
                                            accept="image/*">
                                        <label :for="'file_pred_' + 0"
                                            @paste="handlePaste($event, 'disenoLosaNervada1Images', 0)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                            tabindex="0">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs text-gray-500 text-center">
                                                Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                            </span>
                                        </label>
                                    </div>
                                </template>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                {{-- Definir los nombres específicos en un array --}}
                                <template x-for="(item, idx) in [
                            { index: 1, nombre: 'Direccion Vertical 1' },
                            { index: 2, nombre: 'Direccion Vertical 2' },
                            { index: 3, nombre: 'Direccion Vertical 3' },
                            { index: 4, nombre: 'Direccion Vertical 4' },
                            { index: 5, nombre: 'Direccion Horizontal 1' },
                            { index: 6, nombre: 'Direccion Horizontal 2' },
                            { index: 7, nombre: 'Direccion Horizontal 3' },
                            { index: 8, nombre: 'Direccion Horizontal 4' },
                        ]" :key="item.index">
                                    <div class="space-y-2">
                                        <div class="flex items-center justify-between">
                                            {{-- Usar el nombre específico del array --}}
                                            <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                                x-text="item.nombre"></label>
                                            <button type="button"
                                                x-show="previews.disenoLosaNervada1Images[item.index]"
                                                @click="removeArrayImage('disenoLosaNervada1Images', item.index)"
                                                class="text-red-500 text-xs font-semibold hover:underline">
                                                Eliminar
                                            </button>
                                        </div>
                                        <div class="relative group h-48">
                                            <template x-if="previews.disenoLosaNervada1Images[item.index]">
                                                <img :src="previews.disenoLosaNervada1Images[item.index]"
                                                    class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                            </template>
                                            <template x-if="!previews.disenoLosaNervada1Images[item.index]">
                                                <div class="h-full">
                                                    <input type="file"
                                                        :id="'file_pred_' + item.index"
                                                        @change="handleArrayImageChange('disenoLosaNervada1Images', item.index, $event)"
                                                        class="hidden"
                                                        accept="image/*">
                                                    <label :for="'file_pred_' + item.index"
                                                        @paste="handlePaste($event, 'disenoLosaNervada1Images', item.index)"
                                                        @mouseenter="$el.focus()"
                                                        class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                                        tabindex="0">
                                                        <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span class="text-xs text-gray-500 text-center">
                                                            Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                                        </span>
                                                    </label>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection442 = !showSection442" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Diseño de losa nervada 2 e=0.25
                            (9 imágenes)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection442 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection442" x-collapse class="p-6 space-y-6">
                        <div class="space-y-2">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Ubicación de la losa para diseñar</label>
                                    <button type="button"
                                        x-show="previews.disenoLosaNervada2Images[0]"
                                        @click="removeArrayImage('disenoLosaNervada2Images', 0)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.disenoLosaNervada2Images[0]">
                                        <img :src="previews.disenoLosaNervada2Images[0]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.disenoLosaNervada2Images[0]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 0"
                                                @change="handleArrayImageChange('disenoLosaNervada2Images', 0, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 0"
                                                @paste="handlePaste($event, 'disenoLosaNervada2Images', 0)"
                                                @mouseenter="$el.focus()"
                                                class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                                tabindex="0">
                                                <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span class="text-xs text-gray-500 text-center">
                                                    Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                                </span>
                                            </label>
                                        </div>
                                    </template>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    {{-- Definir los nombres específicos en un array --}}
                                    <template x-for="(item, idx) in [
                            { index: 1, nombre: 'Direccion Vertical 1' },
                            { index: 2, nombre: 'Direccion Vertical 2' },
                            { index: 3, nombre: 'Direccion Vertical 3' },
                            { index: 4, nombre: 'Direccion Vertical 4' },
                            { index: 5, nombre: 'Direccion Horizontal 1' },
                            { index: 6, nombre: 'Direccion Horizontal 2' },
                            { index: 7, nombre: 'Direccion Horizontal 3' },
                            { index: 8, nombre: 'Direccion Horizontal 4' },
                        ]" :key="item.index">
                                        <div class="space-y-2">
                                            <div class="flex items-center justify-between">
                                                {{-- Usar el nombre específico del array --}}
                                                <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                                    x-text="item.nombre"></label>
                                                <button type="button"
                                                    x-show="previews.disenoLosaNervada2Images[item.index]"
                                                    @click="removeArrayImage('disenoLosaNervada2Images', item.index)"
                                                    class="text-red-500 text-xs font-semibold hover:underline">
                                                    Eliminar
                                                </button>
                                            </div>
                                            <div class="relative group h-48">
                                                <template x-if="previews.disenoLosaNervada2Images[item.index]">
                                                    <img :src="previews.disenoLosaNervada2Images[item.index]"
                                                        class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                                </template>
                                                <template x-if="!previews.disenoLosaNervada2Images[item.index]">
                                                    <div class="h-full">
                                                        <input type="file"
                                                            :id="'file_pred_' + item.index"
                                                            @change="handleArrayImageChange('disenoLosaNervada2Images', item.index, $event)"
                                                            class="hidden"
                                                            accept="image/*">
                                                        <label :for="'file_pred_' + item.index"
                                                            @paste="handlePaste($event, 'disenoLosaNervada2Images', item.index)"
                                                            @mouseenter="$el.focus()"
                                                            class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                                            tabindex="0">
                                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span class="text-xs text-gray-500 text-center">
                                                                Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                </template>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- SECCION 4.5.DISEÑO DE VIGAS -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection45 = !showSection45" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.5.DISEÑO DE VIGAS</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(4 imágenes por sección)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showSection45 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection45" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        {{-- Usar el nombre específico del array --}}
                        <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen de diseño por flexion</label>
                        <button type="button"
                            x-show="previews.disenoVigaImages[0]"
                            @click="removeArrayImage('disenoVigaImages', 0)"
                            class="text-red-500 text-xs font-semibold hover:underline">
                            Eliminar
                        </button>
                    </div>
                    <div class="relative group h-48">
                        <template x-if="previews.disenoVigaImages[0]">
                            <img :src="previews.disenoVigaImages[0]"
                                class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                        </template>
                        <template x-if="!previews.disenoVigaImages[0]">
                            <div class="h-full">
                                <input type="file"
                                    :id="'file_pred_' + 0"
                                    @change="handleArrayImageChange('disenoVigaImages', 0, $event)"
                                    class="hidden"
                                    accept="image/*">
                                <label :for="'file_pred_' + 0"
                                    @paste="handlePaste($event, 'disenoVigaImages', 0)"
                                    @mouseenter="$el.focus()"
                                    class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                    tabindex="0">
                                    <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span class="text-xs text-gray-500 text-center">
                                        Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                    </span>
                                </label>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="w-full bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 text-gray-900 dark:text-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none font-medium">
                    <p class="text-sm text-gray-700 dark:text-gray-300">AVISO IMPORTANTE: Si en caso no detalla el nombre de las secciones no se tomara en cuenta las imagenes que se agregue.</p>
                </div>

                <!-- Inputs de número de secciones y texto -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            # de Secciones
                        </label>
                        <input
                            type="number"
                            :value="viga"
                            @input="updateVigas($event.target.value)"
                            min="1"
                            max="20"
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Detalla el nombre de las vigas</label>
                        <textarea x-model="$store.memoriaCalculo.sections.disenoElementos.nameVigas" rows="4"
                            placeholder="Viga 1 - Eje A-B&#10;Viga 2 - Eje B-C&#10;Viga 3 - Eje C-D"
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none font-mono text-sm"></textarea>
                    </div>
                </div>

                <!-- Área de imágenes -->
                <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Imágenes por Viga</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Cada viga tiene 4 imágenes</p>
                        </div>
                    </div>

                    <!-- Mensaje cuando no hay secciones -->
                    <template x-if="viga === 0 || !viga">
                        <div class="text-center py-12 px-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-dashed border-yellow-300 dark:border-yellow-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Primero define el número de vigas</p>
                            <p class="text-xs text-yellow-600 dark:text-yellow-400">Establece el número de vigas arriba para subir las imágenes</p>
                        </div>
                    </template>

                    <!-- Iterar por cada viga/sección -->
                    <template x-if="viga > 0">
                        <div class="space-y-8">
                            <template x-for="(seccion, seccionIndex) in Array.from({ length: viga })" :key="seccionIndex">
                                <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/30">
                                    <!-- Título de la sección -->
                                    <div class="flex items-center justify-between mb-4">
                                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200"
                                            x-text="'Viga ' + (seccionIndex + 1) + ': ' + (($store.memoriaCalculo.sections.disenoElementos.nameVigas?.split('\n')[seccionIndex]?.trim() || 'Viga ' + (seccionIndex + 1)))">
                                        </h4>
                                        <span class="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 px-2 py-1 rounded-full">
                                            4 imágenes
                                        </span>
                                    </div>

                                    <!-- Grid de 4 imágenes -->
                                    <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
                                        <template x-for="imgIndex in 4" :key="imgIndex">
                                            <div class="space-y-2">
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Imagen <span x-text="imgIndex"></span>
                                                </label>

                                                <!-- Preview de imagen - Usando vigaImages -->
                                                <template x-if="$store.memoriaCalculo.previews.vigaImages[seccionIndex]?.[imgIndex-1]">
                                                    <div class="relative group">
                                                        <div class="relative h-40 w-full rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                            <img :src="$store.memoriaCalculo.previews.vigaImages[seccionIndex][imgIndex-1]"
                                                                class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105">
                                                        </div>
                                                        <button type="button"
                                                            @click="removeVigaImage(seccionIndex, imgIndex-1)"
                                                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </template>

                                                <!-- Input file cuando no hay imagen -->
                                                <template x-if="!$store.memoriaCalculo.previews.vigaImages[seccionIndex]?.[imgIndex-1]">
                                                    <label tabindex="0"
                                                        class="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                        @paste="handlePasteElementoConfig($event, 'viga', seccionIndex, imgIndex-1)"
                                                        @mouseenter="$el.focus()">

                                                        <div class="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 mb-1 group-hover:scale-110 transition-transform">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o Ctrl+V</span>
                                                        <span class="text-xs text-gray-500">PNG, JPG</span>

                                                        <input type="file" accept="image/*"
                                                            @change="handleElementoImageInput('viga', seccionIndex, imgIndex-1, $event)"
                                                            class="hidden">
                                                    </label>
                                                </template>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <!-- SECCION 4.6. DISEÑO DE COLUMNA -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection46 = !showSection46" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.6. DISEÑO DE COLUMNA </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(18 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection46" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <!-- Inputs de número de secciones y texto -->
                <div class="w-full bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 text-gray-900 dark:text-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none font-medium">
                    <p class="text-sm text-gray-700 dark:text-gray-300">AVISO IMPORTANTE: Si en caso no detalla el nombre de las secciones no se tomara en cuenta las imagenes que se agregue.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            # de Secciones
                        </label>
                        <input
                            type="number"
                            :value="columna"
                            @input="updateColumnas($event.target.value)"
                            min="1"
                            max="20"
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Detalla el nombre de las vigas</label>
                        <textarea x-model="$store.memoriaCalculo.sections.disenoElementos.nameColumna" rows="4"
                            placeholder="Diseño de columna (25x45)&#10;Diseño de columna (25x25)&#10;..."
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none font-mono text-sm"></textarea>
                    </div>
                </div>

                <!-- Área de imágenes -->
                <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Imágenes por Columna</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Cada Columna tiene 3 imágenes</p>
                        </div>
                    </div>

                    <!-- Mensaje cuando no hay secciones -->
                    <template x-if="columna === 0 || !columna">
                        <div class="text-center py-12 px-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-dashed border-yellow-300 dark:border-yellow-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Primero define el número de vigas</p>
                            <p class="text-xs text-yellow-600 dark:text-yellow-400">Establece el número de columnas arriba para subir las imágenes</p>
                        </div>
                    </template>

                    <!-- Iterar por cada viga/sección -->
                    <template x-if="columna > 0">
                        <div class="space-y-8">
                            <template x-for="(seccion, seccionIndex) in Array.from({ length: columna })" :key="seccionIndex">
                                <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/30">
                                    <!-- Título de la sección -->
                                    <div class="flex items-center justify-between mb-4">
                                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200"
                                            x-text="'columna ' + (seccionIndex + 1) + ': ' + (($store.memoriaCalculo.sections.disenoElementos.nameColumna?.split('\n')[seccionIndex]?.trim() || 'columna ' + (seccionIndex + 1)))">
                                        </h4>
                                        <span class="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 px-2 py-1 rounded-full">
                                            3 imágenes
                                        </span>
                                    </div>

                                    <!-- Grid de 4 imágenes -->
                                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                        <template x-for="imgIndex in 3" :key="imgIndex">
                                            <div class="space-y-2">
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Imagen <span x-text="imgIndex"></span>
                                                </label>

                                                <!-- Preview de imagen - Usando columnaImages -->
                                                <template x-if="$store.memoriaCalculo.previews.columnaImages[seccionIndex]?.[imgIndex-1]">
                                                    <div class="relative group">
                                                        <div class="relative h-40 w-full rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                            <img :src="$store.memoriaCalculo.previews.columnaImages[seccionIndex][imgIndex-1]"
                                                                class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105">
                                                        </div>
                                                        <button type="button"
                                                            @click="removeColumnaImage(seccionIndex, imgIndex-1)"
                                                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </template>

                                                <!-- Input file cuando no hay imagen -->
                                                <template x-if="!$store.memoriaCalculo.previews.columnaImages[seccionIndex]?.[imgIndex-1]">
                                                    <label tabindex="0"
                                                        class="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                        @paste="handlePasteElementoConfig($event, 'columna', seccionIndex, imgIndex-1)"
                                                        @mouseenter="$el.focus()">

                                                        <div class="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 mb-1 group-hover:scale-110 transition-transform">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o Ctrl+V</span>
                                                        <span class="text-xs text-gray-500">PNG, JPG</span>

                                                        <input type="file" accept="image/*"
                                                            @change="handleElementoImageInput('columna', seccionIndex, imgIndex-1, $event)"
                                                            class="hidden">
                                                    </label>
                                                </template>
                                            </div>
                                        </template>
                                    </div>
                                    <!-- Descripcion para cada seccion -->
                                    <div class="space-y-2">
                                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Detalla la descripcion de la seccion</label>
                                        <textarea x-model="$store.memoriaCalculo.sections.disenoElementos.descriptionColumna[seccionIndex]"
                                            placeholder="Las cargas últimas amplificadas están por debajo de este valor por lo que no sería necesario las verificaciones por flexo compresión (diseño de elementos especiales de borde)..."
                                            class="w-full h-32 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none font-mono text-sm"></textarea>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <!-- Formula -->
                                        <div class="space-y-2">
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Ingresa formula para la seccion 1
                                            </label>

                                            <!-- Preview de imagen - Usando columnaImages -->
                                            <template x-if="$store.memoriaCalculo.previews.columnaImages[seccionIndex]?.[3]">
                                                <div class="relative group">
                                                    <div class="relative h-40 w-full rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                        <img :src="$store.memoriaCalculo.previews.columnaImages[seccionIndex][3]"
                                                            class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105">
                                                    </div>
                                                    <button type="button"
                                                        @click="removeColumnaImage(seccionIndex, 3)"
                                                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </template>

                                            <!-- Input file cuando no hay imagen -->
                                            <template x-if="!$store.memoriaCalculo.previews.columnaImages[seccionIndex]?.[3]">
                                                <label tabindex="0"
                                                    class="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    @paste="handlePasteElementoConfig($event, 'columna', seccionIndex, 3)"
                                                    @mouseenter="$el.focus()">

                                                    <div class="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 mb-1 group-hover:scale-110 transition-transform">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o Ctrl+V</span>
                                                    <span class="text-xs text-gray-500">PNG, JPG</span>

                                                    <input type="file" accept="image/*"
                                                        @change="handleElementoImageInput('columna', seccionIndex, 3, $event)"
                                                        class="hidden">
                                                </label>
                                            </template>
                                        </div>

                                        <div class="space-y-2">
                                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Diseño por flexo compresion
                                            </label>

                                            <!-- Preview de imagen - Usando columnaImages -->
                                            <template x-if="$store.memoriaCalculo.previews.columnaImages[seccionIndex]?.[4]">
                                                <div class="relative group">
                                                    <div class="relative h-40 w-full rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                        <img :src="$store.memoriaCalculo.previews.columnaImages[seccionIndex][4]"
                                                            class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105">
                                                    </div>
                                                    <button type="button"
                                                        @click="removeColumnaImage(seccionIndex, 4)"
                                                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </template>

                                            <!-- Input file cuando no hay imagen -->
                                            <template x-if="!$store.memoriaCalculo.previews.columnaImages[seccionIndex]?.[4]">
                                                <label tabindex="0"
                                                    class="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    @paste="handlePasteElementoConfig($event, 'columna', seccionIndex, 4)"
                                                    @mouseenter="$el.focus()">

                                                    <div class="p-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 mb-1 group-hover:scale-110 transition-transform">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o Ctrl+V</span>
                                                    <span class="text-xs text-gray-500">PNG, JPG</span>

                                                    <input type="file" accept="image/*"
                                                        @change="handleElementoImageInput('columna', seccionIndex, 4, $event)"
                                                        class="hidden">
                                                </label>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <!-- SECCION 4.7. DISEÑO DE PLACA -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection47 = !showSection47" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.7. DISEÑO DE PLACA </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection47" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="w-full bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 text-gray-900 dark:text-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none font-medium">
                    <p class="text-sm text-gray-700 dark:text-gray-300">AVISO IMPORTANTE: Si en caso no detalla el nombre de las secciones no se tomara en cuenta las imagenes que se agregue.</p>
                </div>
                <!-- Inputs de número de secciones y texto -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            # de Placas
                        </label>
                        <input
                            type="number"
                            :value="placa"
                            @input="updatePlacas($event.target.value)"
                            min="1"
                            max="20"
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Detalla el nombre de las placas</label>
                        <textarea x-model="$store.memoriaCalculo.sections.disenoElementos.namePlaca" rows="4"
                            placeholder="DISEÑO DE LA ZAPATA AISLADA 1&#10;DISEÑO DE LA ZAPATA AISLADA 2&#10;DISEÑO DE LA ZAPATA COMBINADA&#10;..."
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none font-mono text-sm"></textarea>
                    </div>
                </div>

                <!-- Área de imágenes -->
                <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Imágenes por Placa</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Cada Placa tiene 4 imágenes</p>
                        </div>
                    </div>

                    <!-- Mensaje cuando no hay placas -->
                    <template x-if="placa === 0 || !placa">
                        <div class="text-center py-12 px-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-dashed border-yellow-300 dark:border-yellow-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Primero define el número de Placas</p>
                            <p class="text-xs text-yellow-600 dark:text-yellow-400">Establece el número de Placas arriba para subir las imágenes</p>
                        </div>
                    </template>



                    <!-- Iterar por cada Placa/sección -->
                    <template x-if="placa > 0">
                        <div class="space-y-8">
                            <template x-for="(seccion, seccionIndex) in Array.from({ length: placa })" :key="seccionIndex">
                                <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/30">
                                    <!-- Título de la sección -->
                                    <div class="flex items-center justify-between mb-4">
                                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200"
                                            x-text="'Placa ' + (seccionIndex + 1) + ': ' + (($store.memoriaCalculo.sections.disenoElementos.namePlaca?.split('\n')[seccionIndex]?.trim() || 'DISEÑO DE PLACA ' + (seccionIndex + 1)))">
                                        </h4>
                                        <span class="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 px-2 py-1 rounded-full">
                                            4 imágenes
                                        </span>
                                    </div>

                                    <!-- Grid de 4 imágenes -->
                                    <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
                                        <template x-for="(item, idx) in [
                                                { index: 0, nombre: 'Ubicación de placa a diseñar' },
                                                { index: 1, nombre: 'imagen de Diseño de placa 1' },
                                                { index: 2, nombre: 'imagen de Diseño de placa 2' },
                                                { index: 3, nombre: 'imagen de Diseño de placa 3' },
                                                { index: 4, nombre: 'imagen de Diseño de placa 4' },
                                                { index: 5, nombre: 'imagen de Diseño de placa 5' },
                                                { index: 6, nombre: 'imagen de Diseño de placa 6' },
                                                { index: 7, nombre: 'imagen de Diseño de placa 7' },
                                                
                                            ]" :key="item.index">
                                            <div class="space-y-2">
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    <span x-text="item.nombre"></span>
                                                </label>

                                                <!-- Preview de imagen - Usando placaImages -->
                                                <template x-if="$store.memoriaCalculo.previews.placaImages[seccionIndex]?.[item.index]">
                                                    <div class="relative group">
                                                        <div class="relative h-40 w-full rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                            <img :src="$store.memoriaCalculo.previews.placaImages[seccionIndex][item.index]"
                                                                class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105">
                                                        </div>
                                                        <button type="button"
                                                            @click="removePlacaImage(seccionIndex, item.index)"
                                                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </template>

                                                <!-- Input file cuando no hay imagen -->
                                                <template x-if="!$store.memoriaCalculo.previews.placaImages[seccionIndex]?.[item.index]">
                                                    <label tabindex="0"
                                                        class="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group focus:ring-2 focus:ring-red-500 focus:border-yellow-500 outline-none"
                                                        @paste="handlePasteElementoConfig($event, 'placa', seccionIndex, item.index)"
                                                        @mouseenter="$el.focus()">

                                                        <div class="p-2 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 mb-1 group-hover:scale-110 transition-transform">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o Ctrl+V</span>
                                                        <span class="text-xs text-gray-500">PNG, JPG</span>

                                                        <input type="file" accept="image/*"
                                                            @change="handleElementoImageInput('placa', seccionIndex, item.index, $event)"
                                                            class="hidden">
                                                    </label>
                                                </template>
                                            </div>
                                        </template>
                                    </div>

                                    <!-- Grid de 3 imágenes -->
                                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                        <template x-for="(item, idx) in [
                                                { index: 8, nombre: 'Diseño de corte' },
                                                { index: 9, nombre: 'VERIFICACIÓN DE DIAGRAMA DE ITERACIÓN 1' },
                                                { index: 10, nombre: 'VERIFICACIÓN DE DIAGRAMA DE ITERACIÓN 2' },
                                                { index: 11, nombre: 'VERIFICACIÓN DE DIAGRAMA DE ITERACIÓN 3' },
                                                { index: 12, nombre: 'VERIFICACIÓN DE DIAGRAMA DE ITERACIÓN 4' },
                                                { index: 13, nombre: 'VERIFICACIÓN DE DIAGRAMA DE ITERACIÓN 5' },
                                                
                                            ]" :key="item.index">
                                            <div class="space-y-2">
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    <span x-text="item.nombre"></span>
                                                </label>

                                                <!-- Preview de imagen - Usando placaImages -->
                                                <template x-if="$store.memoriaCalculo.previews.placaImages[seccionIndex]?.[item.index]">
                                                    <div class="relative group">
                                                        <div class="relative h-40 w-full rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                            <img :src="$store.memoriaCalculo.previews.placaImages[seccionIndex][item.index]"
                                                                class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105">
                                                        </div>
                                                        <button type="button"
                                                            @click="removePlacaImage(seccionIndex, item.index)"
                                                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </template>

                                                <!-- Input file cuando no hay imagen -->
                                                <template x-if="!$store.memoriaCalculo.previews.placaImages[seccionIndex]?.[item.index]">
                                                    <label tabindex="0"
                                                        class="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group focus:ring-2 focus:ring-red-500 focus:border-yellow-500 outline-none"
                                                        @paste="handlePasteElementoConfig($event, 'placa', seccionIndex, item.index)"
                                                        @mouseenter="$el.focus()">

                                                        <div class="p-2 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 mb-1 group-hover:scale-110 transition-transform">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o Ctrl+V</span>
                                                        <span class="text-xs text-gray-500">PNG, JPG</span>

                                                        <input type="file" accept="image/*"
                                                            @change="handleElementoImageInput('placa', seccionIndex, item.index, $event)"
                                                            class="hidden">
                                                    </label>
                                                </template>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <!-- SECCION 4.8. DISEÑO DE MURO DE CONCRETO -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection48 = !showSection48" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.8.DISEÑO DE MURO DE CONCRETO</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(6 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection48" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="space-y-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {{-- Definir los nombres específicos en un array --}}
                        <template x-for="(item, idx) in [
                            { index: 0, nombre: 'M22(0.70TN-M)' },
                            { index: 1, nombre: 'M33(0.71TN-M)' },
                            { index: 2, nombre: 'V23(0.78TN-M)' },
                            { index: 3, nombre: 'V13(0.025TN-M)' },
                            { index: 4, nombre: 'Requisitos de diseño 1' },
                            { index: 5, nombre: 'Requisitos de diseño 2' },
                        ]" :key="item.index">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                        x-text="item.nombre"></label>
                                    <button type="button"
                                        x-show="previews.disenoMuroConcretoImages[item.index]"
                                        @click="removeArrayImage('disenoMuroConcretoImages', item.index)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.disenoMuroConcretoImages[item.index]">
                                        <img :src="previews.disenoMuroConcretoImages[item.index]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.disenoMuroConcretoImages[item.index]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + item.index"
                                                @change="handleArrayImageChange('disenoMuroConcretoImages', item.index, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + item.index"
                                                @paste="handlePaste($event, 'disenoMuroConcretoImages', item.index)"
                                                @mouseenter="$el.focus()"
                                                class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                                tabindex="0">
                                                <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span class="text-xs text-gray-500 text-center">
                                                    Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                                </span>
                                            </label>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <!-- SECCION 4.9. DISEÑO DE ESCALERA -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection49 = !showSection49" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.9. DISEÑO DE ESCALERA</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(5 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection49" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">

                <div class="space-y-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {{-- Definir los nombres específicos en un array --}}
                        <template x-for="(item, idx) in [
                            { index: 0, nombre: 'M22 (1.23TN-M)' },
                            { index: 1, nombre: 'M33 (0.12TN-M)' },
                            { index: 2, nombre: 'V23 (1.47TN-M)' },
                            { index: 3, nombre: 'V13 (1.66TN-M)' },
                            { index: 4, nombre: 'Requisitos de diseño ' },
                        ]" :key="item.index">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                        x-text="item.nombre"></label>
                                    <button type="button"
                                        x-show="previews.disenoEscaleraImages[item.index]"
                                        @click="removeArrayImage('disenoEscaleraImages', item.index)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.disenoEscaleraImages[item.index]">
                                        <img :src="previews.disenoEscaleraImages[item.index]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.disenoEscaleraImages[item.index]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + item.index"
                                                @change="handleArrayImageChange('disenoEscaleraImages', item.index, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + item.index"
                                                @paste="handlePaste($event, 'disenoEscaleraImages', item.index)"
                                                @mouseenter="$el.focus()"
                                                class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                                tabindex="0">
                                                <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span class="text-xs text-gray-500 text-center">
                                                    Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                                </span>
                                            </label>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <!-- SECCION 4.10. DISEÑO DE CISTERNA -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection410 = !showSection410" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.10. DISEÑO DE CISTERNA</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(6 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection410" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">

                <div class="space-y-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {{-- Definir los nombres específicos en un array --}}
                        <template x-for="(item, idx) in [
                            { index: 0, nombre: 'M22 (08.75TN-M)' },
                            { index: 1, nombre: 'M33(1.289TN-M2)' },
                            { index: 2, nombre: 'V23 (0.0892TN)' },
                            { index: 3, nombre: 'V13 (1.205TN)' },
                            { index: 4, nombre: 'Requisitos de diseño 1' },
                            { index: 5, nombre: 'Requisitos de diseño 2' },
                        ]" :key="item.index">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                        x-text="item.nombre"></label>
                                    <button type="button"
                                        x-show="previews.disenoCisternaImages[item.index]"
                                        @click="removeArrayImage('disenoCisternaImages', item.index)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.disenoCisternaImages[item.index]">
                                        <img :src="previews.disenoCisternaImages[item.index]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.disenoCisternaImages[item.index]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + item.index"
                                                @change="handleArrayImageChange('disenoCisternaImages', item.index, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + item.index"
                                                @paste="handlePaste($event, 'disenoCisternaImages', item.index)"
                                                @mouseenter="$el.focus()"
                                                class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                                tabindex="0">
                                                <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span class="text-xs text-gray-500 text-center">
                                                    Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                                </span>
                                            </label>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <!-- SECCION 4.11 DISEÑO DE CIMIENTO CORRIDO -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection411 = !showSection411" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.11. DISEÑO DE CIMIENTO CORRIDO</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(6 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection411" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="space-y-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {{-- Definir los nombres específicos en un array --}}
                        <template x-for="(item, idx) in [
                            { index: 0, nombre: 'Datos Para el diseño' },
                            { index: 1, nombre: 'Evaluacion del muro de albañileria' },
                            { index: 2, nombre: 'Diseño de elementos de arriostramiento' },
                            { index: 3, nombre: 'Diseño de la viga de arriostre' },
                            { index: 4, nombre: 'Diseño de cimientos corridos 1' },
                            { index: 5, nombre: 'Diseño de cimientos corridos 2' },
                        ]" :key="item.index">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                        x-text="item.nombre"></label>
                                    <button type="button"
                                        x-show="previews.disenoSimientoCorridoImages[item.index]"
                                        @click="removeArrayImage('disenoSimientoCorridoImages', item.index)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.disenoSimientoCorridoImages[item.index]">
                                        <img :src="previews.disenoSimientoCorridoImages[item.index]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.disenoSimientoCorridoImages[item.index]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + item.index"
                                                @change="handleArrayImageChange('disenoSimientoCorridoImages', item.index, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + item.index"
                                                @paste="handlePaste($event, 'disenoSimientoCorridoImages', item.index)"
                                                @mouseenter="$el.focus()"
                                                class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                                tabindex="0">
                                                <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span class="text-xs text-gray-500 text-center">
                                                    Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                                </span>
                                            </label>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <!-- SECCION 4.12. DISEÑO DE CIMENTACION -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection412 = !showSection412" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.12. DISEÑO DE CIMENTACION</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(18 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection412" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <!-- Inputs de número de secciones y texto -->
                <div class="w-full bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 text-gray-900 dark:text-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none font-medium">
                    <p class="text-sm text-gray-700 dark:text-gray-300">AVISO IMPORTANTE: Si en caso no detalla el nombre de las secciones no se tomara en cuenta las imagenes que se agregue.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            # de Secciones
                        </label>
                        <input
                            type="number"
                            :value="cimentacion"
                            @input="updateCimentaciones($event.target.value)"
                            min="1"
                            max="20"
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Detalla el nombre de las cimentaciones</label>
                        <textarea x-model="$store.memoriaCalculo.sections.disenoElementos.nameCimentacion" rows="4"
                            placeholder="DISEÑO DE LA ZAPATA AISLADA 1&#10;DISEÑO DE LA ZAPATA AISLADA 2&#10;DISEÑO DE LA ZAPATA COMBINADA&#10;..."
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none font-mono text-sm"></textarea>
                    </div>
                </div>

                <!-- Área de imágenes -->
                <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">Imágenes por Cimentación</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Cada cimentación tiene 4 imágenes</p>
                        </div>
                    </div>

                    <!-- Mensaje cuando no hay secciones -->
                    <template x-if="cimentacion === 0 || !cimentacion">
                        <div class="text-center py-12 px-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-dashed border-yellow-300 dark:border-yellow-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p class="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Primero define el número de cimentaciones</p>
                            <p class="text-xs text-yellow-600 dark:text-yellow-400">Establece el número de cimentaciones arriba para subir las imágenes</p>
                        </div>
                    </template>



                    <!-- Iterar por cada cimentación/sección -->
                    <template x-if="cimentacion > 0">
                        <div class="space-y-8">
                            <template x-for="(seccion, seccionIndex) in Array.from({ length: cimentacion })" :key="seccionIndex">
                                <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/30">
                                    <!-- Título de la sección -->
                                    <div class="flex items-center justify-between mb-4">
                                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200"
                                            x-text="'Cimentación ' + (seccionIndex + 1) + ': ' + (($store.memoriaCalculo.sections.disenoElementos.nameCimentacion?.split('\n')[seccionIndex]?.trim() || 'Zapata ' + (seccionIndex + 1)))">
                                        </h4>
                                        <span class="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 px-2 py-1 rounded-full">
                                            4 imágenes
                                        </span>
                                    </div>

                                    <!-- Grid de 4 imágenes -->
                                    <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
                                        <!-- (item, idx) in [
                            { index: 0, nombre: 'CARGA MUERTA' },
                            { index: 1, nombre: 'CARGA VIVA' },
                            { index: 2, nombre: 'SISMO DINÁMICO EN DIRECCIÓN X' },
                            { index: 3, nombre: 'SISMO DINÁMICO EN DIRECCIÓN Y' },
                            
                        ] -->

                                        <template x-for="(item, idx) in [
                            { index: 0, nombre: 'CARGA MUERTA' },
                            { index: 1, nombre: 'CARGA VIVA' },
                            { index: 2, nombre: 'SISMO DINÁMICO EN DIRECCIÓN X' },
                            { index: 3, nombre: 'SISMO DINÁMICO EN DIRECCIÓN Y' },
                            { index: 4, nombre: 'RESULTADO 1' },
                            { index: 5, nombre: 'RESULTADO 2' },
                            { index: 6, nombre: 'RESULTADO 3' },
                            { index: 7, nombre: 'RESULTADO 4' },
                            
                        ]" :key="item.index">
                                            <div class="space-y-2">
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    <span x-text="item.nombre"></span>
                                                </label>

                                                <!-- Preview de imagen - Usando cimentacionImages -->
                                                <template x-if="$store.memoriaCalculo.previews.cimentacionImages[seccionIndex]?.[item.index]">
                                                    <div class="relative group">
                                                        <div class="relative h-40 w-full rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                                            <img :src="$store.memoriaCalculo.previews.cimentacionImages[seccionIndex][item.index]"
                                                                class="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105">
                                                        </div>
                                                        <button type="button"
                                                            @click="removeCimentacionImage(seccionIndex, item.index)"
                                                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all opacity-0 group-hover:opacity-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </template>

                                                <!-- Input file cuando no hay imagen -->
                                                <template x-if="!$store.memoriaCalculo.previews.cimentacionImages[seccionIndex]?.[item.index]">
                                                    <label tabindex="0"
                                                        class="flex flex-col items-center justify-center h-40 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                                        @paste="handlePasteElementoConfig($event, 'cimentacion', seccionIndex, item.index)"
                                                        @mouseenter="$el.focus()">

                                                        <div class="p-2 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 mb-1 group-hover:scale-110 transition-transform">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o Ctrl+V</span>
                                                        <span class="text-xs text-gray-500">PNG, JPG</span>

                                                        <input type="file" accept="image/*"
                                                            @change="handleElementoImageInput('cimentacion', seccionIndex, item.index, $event)"
                                                            class="hidden">
                                                    </label>
                                                </template>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <!-- SECCION 4.13. DISEÑO DE ALBAÑILERIA -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection413 = !showSection413" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">4.13.DISEÑO DE ALBAÑILERIA</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(2 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection413" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="space-y-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {{-- Definir los nombres específicos en un array --}}
                        <template x-for="(item, idx) in [
                            { index: 0, nombre: 'FIGURA 1' },
                            { index: 1, nombre: 'FIGURA 2' },
                        ]" :key="item.index">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                        x-text="item.nombre"></label>
                                    <button type="button"
                                        x-show="previews.disenoAlbanileria[item.index]"
                                        @click="removeArrayImage('disenoAlbanileria', item.index)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.disenoAlbanileria[item.index]">
                                        <img :src="previews.disenoAlbanileria[item.index]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.disenoAlbanileria[item.index]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + item.index"
                                                @change="handleArrayImageChange('disenoAlbanileria', item.index, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + item.index"
                                                @paste="handlePaste($event, 'disenoAlbanileria', item.index)"
                                                @mouseenter="$el.focus()"
                                                class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50 transition-all"
                                                tabindex="0">
                                                <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span class="text-xs text-gray-500 text-center">
                                                    Haz clic o <span class="font-semibold text-purple-600">Ctrl+V</span>
                                                </span>
                                            </label>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Detalla la descripcion del diseño de Albañieria</label>
                    <textarea x-model="$store.memoriaCalculo.sections.disenoElementos.descriptionAlbanieria"
                        placeholder="Las cargas últimas amplificadas están por debajo de este valor por lo que no sería necesario las verificaciones por flexo compresión (diseño de elementos especiales de borde)..."
                        class="w-full h-32 bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none font-mono text-sm"></textarea>
                </div>
            </div>
        </div>
        {{-- Placeholder for structural element design --}}
        <div class="space-y-3">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Descripción de Diseño</label>
            <textarea rows="5" placeholder="Detalles del diseño estructural..."
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none resize-none"></textarea>
        </div>
    </div>
</section>