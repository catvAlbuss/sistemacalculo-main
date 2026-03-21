{{-- sections/analisis-sismico.blade.php - Sección de Análisis Sísmico --}}
<section id="section-analisis-sismico" x-data="createAnalisisSismicoComponent()"
    class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-3 mb-6">
        <div class="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Análisis Sísmico (Sección 3)</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Parámetros sísmicos y análisis estático/dinámico</p>
        </div>
    </div>

    <div class="space-y-4">
        {{-- Section 3.2 - ANÁLISIS SÍSMICO ESTÁTICO --}}
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection32 = !showSection32" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">3.2 ANÁLISIS SÍSMICO ESTÁTICO</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(3 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showSection32 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection32" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
                {{-- Figura 26: Patrón de cargas sísmicas en "X" --}}
                <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Figura 26: Patrón de cargas sísmicas en "X"
                    </label>
                    <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura26')"
                        x-ref="input_figura26"
                        class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                    <div x-show="figura26" class="mt-3 relative group">
                        <img :src="figura26" alt="Preview Figura 26"
                            class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                        <button @click.prevent="removeImage('figura26')" type="button"
                            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {{-- Figura 27: Patrón de cargas sísmicas en "Y" --}}
                <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Figura 27: Patrón de cargas sísmicas en "Y"
                    </label>
                    <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura27')"
                        x-ref="input_figura27"
                        class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                    <div x-show="figura27" class="mt-3 relative group">
                        <img :src="figura27" alt="Preview Figura 27"
                            class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                        <button @click.prevent="removeImage('figura27')" type="button"
                            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {{-- Figura 28: Peso sísmico --}}
                <div class="space-y-2">
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                        Figura 28: Peso sísmico
                    </label>
                    <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura28')"
                        x-ref="input_figura28"
                        class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                    <div x-show="figura28" class="mt-3 relative group">
                        <img :src="figura28" alt="Preview Figura 28"
                            class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                        <button @click.prevent="removeImage('figura28')" type="button"
                            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {{-- Section 3.3 - ANÁLISIS SÍSMICO DINÁMICO --}}
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection33 = !showSection33" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">3.3 ANÁLISIS SÍSMICO DINÁMICO</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(12 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showSection33 }" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection33" x-collapse class="bg-white dark:bg-gray-800/50">
                {{-- Sub-section 3.3.1 - CONSIDERACIONES EN ETABS --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection331 = !showSection331" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.3.1 CONSIDERACIONES EN
                            ETABS (2 imágenes)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection331 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection331" x-collapse class="p-6 space-y-6">
                        {{-- Figura 29 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 29: Datos del caso de carga en "X"
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura29')"
                                x-ref="input_figura29"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura29" class="mt-3 relative group">
                                <img :src="figura29" alt="Preview Figura 29"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura29')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {{-- Figura 30 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 30: Datos del caso de carga en "Y"
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura30')"
                                x-ref="input_figura30"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura30" class="mt-3 relative group">
                                <img :src="figura30" alt="Preview Figura 30"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura30')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Sub-section 3.3.2 - MODOS DE VIBRACIÓN --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection332 = !showSection332" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.3.2 MODOS DE VIBRACIÓN
                            (3 imágenes)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection332 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection332" x-collapse class="p-6 space-y-6">
                        {{-- Figura 31 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 31: Datos de modos a su períodos
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura31')"
                                x-ref="input_figura31"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura31" class="mt-3 relative group">
                                <img :src="figura31" alt="Preview Figura 31"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura31')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {{-- Figura 32 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 32: Modo de vibración 2-desplazamiento en "Y"
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura32')"
                                x-ref="input_figura32"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura32" class="mt-3 relative group">
                                <img :src="figura32" alt="Preview Figura 32"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura32')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {{-- Figura 33 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 33: Modo de vibración 1-desplazamiento en "X"
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura33')"
                                x-ref="input_figura33"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura33" class="mt-3 relative group">
                                <img :src="figura33" alt="Preview Figura 33"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura33')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Sub-section 3.3.3 - FUERZA CORTANTE BASAL DINÁMICA --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection333 = !showSection333" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.3.3 FUERZA CORTANTE
                            BASAL DINÁMICA (1 imagen)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection333 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection333" x-collapse class="p-6 space-y-6">
                        {{-- Figura 34 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 34: Fuerza cortante en la base obtenida
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura34')"
                                x-ref="input_figura34"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura34" class="mt-3 relative group">
                                <img :src="figura34" alt="Preview Figura 34"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura34')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Sub-section 3.3.4 - DESPLAZAMIENTO PERMISIBLE --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection334 = !showSection334" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.3.4 DESPLAZAMIENTO
                            PERMISIBLE (4 imágenes)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection334 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection334" x-collapse class="p-6 space-y-6">
                        {{-- Figura 35 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 35: Sismo Dinámico en dirección "X" Escalado
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura35')"
                                x-ref="input_figura35"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura35" class="mt-3 relative group">
                                <img :src="figura35" alt="Preview Figura 35"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura35')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {{-- Figura 36 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 36: Sismo Dinámico en dirección "Y" Escalado
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura36')"
                                x-ref="input_figura36"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura36" class="mt-3 relative group">
                                <img :src="figura36" alt="Preview Figura 36"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura36')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {{-- Figura 37 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 37: Sismo Dinámico en dirección "X"
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura37')"
                                x-ref="input_figura37"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura37" class="mt-3 relative group">
                                <img :src="figura37" alt="Preview Figura 37"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura37')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {{-- Figura 38 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 38: Sismo Dinámico en dirección "Y"
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura38')"
                                x-ref="input_figura38"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura38" class="mt-3 relative group">
                                <img :src="figura38" alt="Preview Figura 38"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura38')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {{-- Sub-section 3.3.5 - DEFORMADAS --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection335 = !showSection335" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.3.5 DEFORMADAS (2
                            imágenes)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection335 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection335" x-collapse class="p-6 space-y-6">
                        {{-- Figura 39 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 39: Deformada en "X" debido a carga sísmica (mm)
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura39')"
                                x-ref="input_figura39"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura39" class="mt-3 relative group">
                                <img :src="figura39" alt="Preview Figura 39"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura39')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {{-- Figura 40 --}}
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Figura 40: Deformada en "Y" debido a carga sísmica (mm)
                            </label>
                            <input type="file" accept="image/*" @change="handleImageUpload($event, 'figura40')"
                                x-ref="input_figura40"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100">
                            <div x-show="figura40" class="mt-3 relative group">
                                <img :src="figura40" alt="Preview Figura 40"
                                    class="w-full h-auto max-h-96 object-contain rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <button @click.prevent="removeImage('figura40')" type="button"
                                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
