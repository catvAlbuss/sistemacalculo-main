<section id="section-diseno-estructura" x-data="createEstructuraMetalicaComponent()"
    class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">

    {{-- ENCABEZADO --}}
    <div class="flex items-center gap-3 mb-6">
        <div class="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Diseño de estructura metálica (Sección 5)</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Síntesis de estructura metálica</p>
        </div>
    </div>

    <!-- CUERPO -->
    <div class="space-y-4">
        <!-- FIGURA X -->
        <div x-show="showSectionx" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-l-4 border-amber-500 pl-3">NOTA:</h3>
            <div class="w-full bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 text-gray-900 dark:text-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none font-medium">
                <p class="text-sm text-gray-700 dark:text-gray-300">Si en caso no quiere que aparezca nada de la sección 5, no agregar ningún dato, caso contrario se guardará los datos que agregue.</p>
            </div>
            <div class="space-y-4">
                <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-l-4 border-amber-500 pl-3">5.1 Modelo matemático</h3>
                <div class="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800">
                    <p class="text-sm text-gray-700 dark:text-gray-300">Esta sección no se agrega nada.</p>
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Figura x</label>
                    <button type="button" x-show="previews.analisisEstructuralSingleImages[0]"
                        @click="removeArrayImage('analisisEstructuralSingleImages', 0)"
                        class="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1">
                        Eliminar
                    </button>
                </div>
                <div class="relative group h-64">
                    <template x-if="previews.analisisEstructuralSingleImages[0]">
                        <img :src="previews.analisisEstructuralSingleImages[0]"
                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    </template>
                    <template x-if="!previews.analisisEstructuralSingleImages[0]">
                        <label tabindex="0"
                            @paste="handlePaste($event, 'analisisEstructuralSingleImages', 0)"
                            @mouseenter="$el.focus()"
                            class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-amber-500 mb-2"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span class="text-xs font-medium text-gray-600">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                            <input type="file"
                                @change="handleArrayImageChange('analisisEstructuralSingleImages', 0, $event)"
                                class="hidden">
                        </label>
                    </template>
                </div>
            </div>
        </div>
        <!-- FIGURA Y -->
        <!-- DISEÑOS -->
        <!-- NIVEL 1 -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSectiony = !showSectiony" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">Diseños</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(12 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showSectiony }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <!-- NIVEL 2 -->
            <!-- ● DISEÑO DE COLUMNA METALICA -->
            <div x-show="showSectiony" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSectiony1 = !showSectiony1" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Diseño de columna metálica</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSectiony1 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div x-show="showSectiony1" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- IMAGEN 1 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 1
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoColumnaMetalica?.[0]">
                                        <div class="relative group">
                                            <img :src="previews.disenoColumnaMetalica[0]" alt="Diseño Columna Metálica img-1"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoColumnaMetalica', 0)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoColumnaMetalica?.[0]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoColumnaMetalica', 0)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoColumnaMetalica', 0, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>

                            <!-- IMAGEN 2 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 2
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoColumnaMetalica?.[1]">
                                        <div class="relative group">
                                            <img :src="previews.disenoColumnaMetalica[1]" alt="Diseño Columna Metálica img-2"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoColumnaMetalica', 1)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoColumnaMetalica?.[1]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoColumnaMetalica', 1)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoColumnaMetalica', 1, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- DESCRIPCIÓN BREVE (se mantiene igual) -->
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Descripción breve
                            </label>
                            <textarea
                                x-model="$store.memoriaCalculo.sections.estructuraMetalica.descripcion.ColumnaMetalica"
                                rows="3"
                                placeholder="Escribe una breve descripción o conclusión del diseño de columna metálica..."
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl resize-none"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <!-- ●	DISEÑO DE BRIDA SUPERIOR  -->
            <div x-show="showSectiony" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSectiony2 = !showSectiony2" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Diseño de brida superior</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSectiony2 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <!-- NIVEL 3 -->
                    <div x-show="showSectiony2" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- IMAGEN 1 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 1
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoBridaSuperior?.[0]">
                                        <div class="relative group">
                                            <img :src="previews.disenoBridaSuperior[0]" alt="Diseño Columna Metálica img-1"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoBridaSuperior', 0)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoBridaSuperior?.[0]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoBridaSuperior', 0)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoBridaSuperior', 0, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>

                            <!-- IMAGEN 2 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 2
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoBridaSuperior?.[1]">
                                        <div class="relative group">
                                            <img :src="previews.disenoBridaSuperior[1]" alt="Diseño Columna Metálica img-2"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoBridaSuperior', 1)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoBridaSuperior?.[1]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoBridaSuperior', 1)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoBridaSuperior', 1, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <!-- DESCRIPCIÓN BREVE -->
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Descripción breve
                            </label>
                            <textarea
                                x-model="$store.memoriaCalculo.sections.estructuraMetalica.descripcion.BridaSuperior"
                                rows="3"
                                placeholder="Escribe una breve descripción o conclusión del diseño de columna metálica..."
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl resize-none"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <!-- ●	DISEÑO DE BRIDA INFERIOR  -->
            <div x-show="showSectiony" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSectiony3 = !showSectiony3" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Diseño de brida inferior</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSectiony3 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <!-- NIVEL 3 -->
                    <div x-show="showSectiony3" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- IMAGEN 1 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 1
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoBridaInferior?.[0]">
                                        <div class="relative group">
                                            <img :src="previews.disenoBridaInferior[0]" alt="Diseño Columna Metálica img-1"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoBridaInferior', 0)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoBridaInferior?.[0]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoBridaInferior', 0)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoBridaInferior', 0, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>

                            <!-- IMAGEN 2 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 2
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoBridaInferior?.[1]">
                                        <div class="relative group">
                                            <img :src="previews.disenoBridaInferior[1]" alt="Diseño Columna Metálica img-2"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoBridaInferior', 1)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoBridaInferior?.[1]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoBridaInferior', 1)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoBridaInferior', 1, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <!-- DESCRIPCIÓN BREVE -->
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Descripción breve
                            </label>
                            <textarea
                                x-model="$store.memoriaCalculo.sections.estructuraMetalica.descripcion.BridaInferior"
                                rows="3"
                                placeholder="Escribe una breve descripción o conclusión del diseño de columna metálica..."
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl resize-none"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <!-- ●	DISEÑO DE PARANTE -->
            <div x-show="showSectiony" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSectiony4 = !showSectiony4" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Diseño de parante</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSectiony4 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <!-- NIVEL 3 -->
                    <div x-show="showSectiony4" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- IMAGEN 1 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 1
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoParante?.[0]">
                                        <div class="relative group">
                                            <img :src="previews.disenoParante[0]" alt="Diseño Columna Metálica img-1"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoParante', 0)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoParante?.[0]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoParante', 0)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoParante', 0, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>

                            <!-- IMAGEN 2 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 2
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoParante?.[1]">
                                        <div class="relative group">
                                            <img :src="previews.disenoParante[1]" alt="Diseño Columna Metálica img-2"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoParante', 1)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoParante?.[1]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoParante', 1)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoParante', 1, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <!-- DESCRIPCIÓN BREVE -->
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Descripción breve
                            </label>
                            <textarea
                                x-model="$store.memoriaCalculo.sections.estructuraMetalica.descripcion.Parante"
                                rows="3"
                                placeholder="Escribe una breve descripción o conclusión del diseño de columna metálica..."
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl resize-none"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <!-- ●	DISEÑO DE DIAGONAL -->
            <div x-show="showSectiony" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSectiony5 = !showSectiony5" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Diseño de diagonal</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSectiony5 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <!-- NIVEL 3 -->
                    <div x-show="showSectiony5" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- IMAGEN 1 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 1
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoDiagonal?.[0]">
                                        <div class="relative group">
                                            <img :src="previews.disenoDiagonal[0]" alt="Diseño Columna Metálica img-1"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoDiagonal', 0)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoDiagonal?.[0]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoDiagonal', 0)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoDiagonal', 0, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>

                            <!-- IMAGEN 2 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 2
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoDiagonal?.[1]">
                                        <div class="relative group">
                                            <img :src="previews.disenoDiagonal[1]" alt="Diseño Columna Metálica img-2"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoDiagonal', 1)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoDiagonal?.[1]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoDiagonal', 1)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoDiagonal', 1, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <!-- DESCRIPCIÓN BREVE -->
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Descripción breve
                            </label>
                            <textarea
                                x-model="$store.memoriaCalculo.sections.estructuraMetalica.descripcion.Diagonal"
                                rows="3"
                                placeholder="Escribe una breve descripción o conclusión del diseño de columna metálica..."
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl resize-none"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <!-- ●	DISEÑO DE CORREA METÁLICA -->
            <div x-show="showSectiony" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSectiony6 = !showSectiony6" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Diseño de correa metálica</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSectiony6 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <!-- NIVEL 3 -->
                    <div x-show="showSectiony6" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- IMAGEN 1 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 1
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoCorreaMetalica?.[0]">
                                        <div class="relative group">
                                            <img :src="previews.disenoCorreaMetalica[0]" alt="Diseño Columna Metálica img-1"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoCorreaMetalica', 0)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoCorreaMetalica?.[0]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoCorreaMetalica', 0)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoCorreaMetalica', 0, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>

                            <!-- IMAGEN 2 -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    imagen 2
                                </label>
                                <div class="relative">
                                    <template x-if="previews.disenoCorreaMetalica?.[1]">
                                        <div class="relative group">
                                            <img :src="previews.disenoCorreaMetalica[1]" alt="Diseño Columna Metálica img-2"
                                                class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                            <button @click.prevent="removeArrayImage('disenoCorreaMetalica', 1)" type="button"
                                                class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </template>
                                    <template x-if="!previews.disenoCorreaMetalica?.[1]">
                                        <label tabindex="0"
                                            @paste="handlePaste($event, 'disenoCorreaMetalica', 1)"
                                            @mouseenter="$el.focus()"
                                            class="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                                            <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subir imagen o <span class="font-semibold text-purple-600">Ctrl+V</span></span>
                                            <span class="text-xs text-gray-500">PNG, JPG</span>
                                            <input type="file" accept="image/*"
                                                @change="handleArrayImageChange('disenoCorreaMetalica', 1, $event)"
                                                class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>
                        </div>
                        <!-- DESCRIPCIÓN BREVE -->
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Descripción breve
                            </label>
                            <textarea
                                x-model="$store.memoriaCalculo.sections.estructuraMetalica.descripcion.CorreaMetalica"
                                rows="3"
                                placeholder="Escribe una breve descripción o conclusión del diseño de columna metálica..."
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl resize-none"></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</section>