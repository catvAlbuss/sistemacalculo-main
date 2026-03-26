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
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {{-- Figura 26: Patrón de cargas sísmicas en "X" --}}
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                            Figura 26: Patrón de cargas sísmicas en "X"
                        </label>

                        {{-- Contenedor con soporte para pegar --}}
                        <div @paste="handlePaste($event, 'figura26')"
                            @click="$refs.input_figura26.click()"
                            @mouseenter="$el.focus()"
                            tabindex="0"
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura26 === document.activeElement }">

                            {{-- Input oculto --}}
                            <input type="file"
                                accept="image/*"
                                @change="handleImageUpload($event, 'figura26')"
                                x-ref="input_figura26"
                                class="hidden">

                            {{-- Contenido según estado --}}
                            <template x-if="!figura26">
                                <div class="flex flex-col items-center justify-center gap-2 py-4">
                                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p class="text-gray-600 dark:text-gray-400 text-center">
                                        Haz clic para seleccionar un archivo<br>
                                        o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                    </p>
                                </div>
                            </template>

                            <template x-if="figura26">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                    </div>
                                    <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                </div>
                            </template>
                        </div>


                        <!-- Preview de imagen con condicional -->
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

                        {{-- Contenedor con soporte para pegar --}}
                        <div @paste="handlePaste($event, 'figura27')"
                            @click="$refs.input_figura27.click()"
                            @mouseenter="$el.focus()"
                            tabindex="0"
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura27 === document.activeElement }">

                            {{-- Input oculto --}}
                            <input type="file"
                                accept="image/*"
                                @change="handleImageUpload($event, 'figura27')"
                                x-ref="input_figura27"
                                class="hidden">

                            {{-- Contenido según estado --}}
                            <template x-if="!figura27">
                                <div class="flex flex-col items-center justify-center gap-2 py-4">
                                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p class="text-gray-600 dark:text-gray-400 text-center">
                                        Haz clic para seleccionar un archivo<br>
                                        o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                    </p>
                                </div>
                            </template>

                            <template x-if="figura27">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                    </div>
                                    <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                </div>
                            </template>
                        </div>


                        <!-- Preview de imagen con condicional -->
                        <div x-show="figura27" class="mt-3 relative group">
                            <img :src="figura27" alt="Preview Figura 26"
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

                        {{-- Contenedor con soporte para pegar --}}
                        <div @paste="handlePaste($event, 'figura28')"
                            @click="$refs.input_figura28.click()"
                            @mouseenter="$el.focus()"
                            tabindex="0"
                            class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura28 === document.activeElement }">

                            {{-- Input oculto --}}
                            <input type="file"
                                accept="image/*"
                                @change="handleImageUpload($event, 'figura28')"
                                x-ref="input_figura28"
                                class="hidden">

                            {{-- Contenido según estado --}}
                            <template x-if="!figura28">
                                <div class="flex flex-col items-center justify-center gap-2 py-4">
                                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p class="text-gray-600 dark:text-gray-400 text-center">
                                        Haz clic para seleccionar un archivo<br>
                                        o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                    </p>
                                </div>
                            </template>

                            <template x-if="figura28">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                    </div>
                                    <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                </div>
                            </template>
                        </div>


                        <!-- Preview de imagen con condicional -->
                        <div x-show="figura28" class="mt-3 relative group">
                            <img :src="figura28" alt="Preview Figura 26"
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
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Figura 29 --}}

                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Figura 29: Datos del caso de carga en "X"
                                </label>

                                {{-- Contenedor con soporte para pegar --}}
                                <div @paste="handlePaste($event, 'figura29')"
                                    @click="$refs.input_figura29.click()"
                                    @mouseenter="$el.focus()"
                                    tabindex="0"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura29 === document.activeElement }">

                                    {{-- Input oculto --}}
                                    <input type="file"
                                        accept="image/*"
                                        @change="handleImageUpload($event, 'figura29')"
                                        x-ref="input_figura29"
                                        class="hidden">

                                    {{-- Contenido según estado --}}
                                    <template x-if="!figura29">
                                        <div class="flex flex-col items-center justify-center gap-2 py-4">
                                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-gray-600 dark:text-gray-400 text-center">
                                                Haz clic para seleccionar un archivo<br>
                                                o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                            </p>
                                        </div>
                                    </template>

                                    <template x-if="figura29">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                            </div>
                                            <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                        </div>
                                    </template>
                                </div>


                                <!-- Preview de imagen con condicional -->
                                <div x-show="figura29" class="mt-3 relative group">
                                    <img :src="figura29" alt="Preview Figura 26"
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

                                {{-- Contenedor con soporte para pegar --}}
                                <div @paste="handlePaste($event, 'figura30')"
                                    @click="$refs.input_figura30.click()"
                                    @mouseenter="$el.focus()"
                                    tabindex="0"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura30 === document.activeElement }">

                                    {{-- Input oculto --}}
                                    <input type="file"
                                        accept="image/*"
                                        @change="handleImageUpload($event, 'figura30')"
                                        x-ref="input_figura30"
                                        class="hidden">

                                    {{-- Contenido según estado --}}
                                    <template x-if="!figura30">
                                        <div class="flex flex-col items-center justify-center gap-2 py-4">
                                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-gray-600 dark:text-gray-400 text-center">
                                                Haz clic para seleccionar un archivo<br>
                                                o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                            </p>
                                        </div>
                                    </template>

                                    <template x-if="figura30">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                            </div>
                                            <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                        </div>
                                    </template>
                                </div>


                                <!-- Preview de imagen con condicional -->
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
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {{-- Figura 31 --}}
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    figura 31-Datos de modos a su periodos
                                </label>

                                {{-- Contenedor con soporte para pegar --}}
                                <div @paste="handlePaste($event, 'figura31')"
                                    @click="$refs.input_figura31.click()"
                                    @mouseenter="$el.focus()"
                                    tabindex="0"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura31 === document.activeElement }">

                                    {{-- Input oculto --}}
                                    <input type="file"
                                        accept="image/*"
                                        @change="handleImageUpload($event, 'figura31')"
                                        x-ref="input_figura31"
                                        class="hidden">

                                    {{-- Contenido según estado --}}
                                    <template x-if="!figura31">
                                        <div class="flex flex-col items-center justify-center gap-2 py-4">
                                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-gray-600 dark:text-gray-400 text-center">
                                                Haz clic para seleccionar un archivo<br>
                                                o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                            </p>
                                        </div>
                                    </template>

                                    <template x-if="figura31">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                            </div>
                                            <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                        </div>
                                    </template>
                                </div>


                                <!-- Preview de imagen con condicional -->
                                <div x-show="figura31" class="mt-3 relative group">
                                    <img :src="figura31" alt="Preview Figura 30"
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
                                    figura 32-Modo de vibración 1,desplazamiento en “X”
                                </label>

                                {{-- Contenedor con soporte para pegar --}}
                                <div @paste="handlePaste($event, 'figura32')"
                                    @click="$refs.input_figura32.click()"
                                    @mouseenter="$el.focus()"
                                    tabindex="0"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura32 === document.activeElement }">

                                    {{-- Input oculto --}}
                                    <input type="file"
                                        accept="image/*"
                                        @change="handleImageUpload($event, 'figura32')"
                                        x-ref="input_figura32"
                                        class="hidden">

                                    {{-- Contenido según estado --}}
                                    <template x-if="!figura32">
                                        <div class="flex flex-col items-center justify-center gap-2 py-4">
                                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-gray-600 dark:text-gray-400 text-center">
                                                Haz clic para seleccionar un archivo<br>
                                                o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                            </p>
                                        </div>
                                    </template>

                                    <template x-if="figura32">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                            </div>
                                            <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                        </div>
                                    </template>
                                </div>


                                <!-- Preview de imagen con condicional -->
                                <div x-show="figura32" class="mt-3 relative group">
                                    <img :src="figura32" alt="Preview Figura 30"
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
                                    figura 33-Modo de vibración 2,desplazamiento en “Y”
                                </label>

                                {{-- Contenedor con soporte para pegar --}}
                                <div @paste="handlePaste($event, 'figura33')"
                                    @click="$refs.input_figura33.click()"
                                    @mouseenter="$el.focus()"
                                    tabindex="0"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura33 === document.activeElement }">

                                    {{-- Input oculto --}}
                                    <input type="file"
                                        accept="image/*"
                                        @change="handleImageUpload($event, 'figura33')"
                                        x-ref="input_figura33"
                                        class="hidden">

                                    {{-- Contenido según estado --}}
                                    <template x-if="!figura33">
                                        <div class="flex flex-col items-center justify-center gap-2 py-4">
                                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-gray-600 dark:text-gray-400 text-center">
                                                Haz clic para seleccionar un archivo<br>
                                                o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                            </p>
                                        </div>
                                    </template>

                                    <template x-if="figura33">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                            </div>
                                            <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                        </div>
                                    </template>
                                </div>


                                <!-- Preview de imagen con condicional -->
                                <div x-show="figura33" class="mt-3 relative group">
                                    <img :src="figura33" alt="Preview Figura 30"
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
                                figura 34-fuerza cortante basal dinámica
                            </label>

                            {{-- Contenedor con soporte para pegar --}}
                            <div @paste="handlePaste($event, 'figura34')"
                                @click="$refs.input_figura34.click()"
                                @mouseenter="$el.focus()"
                                tabindex="0"
                                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura34 === document.activeElement }">

                                {{-- Input oculto --}}
                                <input type="file"
                                    accept="image/*"
                                    @change="handleImageUpload($event, 'figura34')"
                                    x-ref="input_figura34"
                                    class="hidden">

                                {{-- Contenido según estado --}}
                                <template x-if="!figura34">
                                    <div class="flex flex-col items-center justify-center gap-2 py-4">
                                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p class="text-gray-600 dark:text-gray-400 text-center">
                                            Haz clic para seleccionar un archivo<br>
                                            o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                        </p>
                                    </div>
                                </template>

                                <template x-if="figura34">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                        </div>
                                        <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                    </div>
                                </template>
                            </div>


                            <!-- Preview de imagen con condicional -->
                            <div x-show="figura34" class="mt-3 relative group">
                                <img :src="figura34" alt="Preview Figura 30"
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
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {{-- Figura 35 --}}
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    figura 35-Sismo Dinámico en dirección “X” Escalado
                                </label>

                                {{-- Contenedor con soporte para pegar --}}
                                <div @paste="handlePaste($event, 'figura35')"
                                    @click="$refs.input_figura35.click()"
                                    @mouseenter="$el.focus()"
                                    tabindex="0"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura35 === document.activeElement }">

                                    {{-- Input oculto --}}
                                    <input type="file"
                                        accept="image/*"
                                        @change="handleImageUpload($event, 'figura35')"
                                        x-ref="input_figura35"
                                        class="hidden">

                                    {{-- Contenido según estado --}}
                                    <template x-if="!figura35">
                                        <div class="flex flex-col items-center justify-center gap-2 py-4">
                                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-gray-600 dark:text-gray-400 text-center">
                                                Haz clic para seleccionar un archivo<br>
                                                o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                            </p>
                                        </div>
                                    </template>

                                    <template x-if="figura35">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                            </div>
                                            <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                        </div>
                                    </template>
                                </div>


                                <!-- Preview de imagen con condicional -->
                                <div x-show="figura35" class="mt-3 relative group">
                                    <img :src="figura35" alt="Preview Figura 30"
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
                                    figura 36-Sismo Dinámico en dirección “Y” Escalado
                                </label>

                                {{-- Contenedor con soporte para pegar --}}
                                <div @paste="handlePaste($event, 'figura36')"
                                    @click="$refs.input_figura36.click()"
                                    @mouseenter="$el.focus()"
                                    tabindex="0"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura36 === document.activeElement }">

                                    {{-- Input oculto --}}
                                    <input type="file"
                                        accept="image/*"
                                        @change="handleImageUpload($event, 'figura36')"
                                        x-ref="input_figura36"
                                        class="hidden">

                                    {{-- Contenido según estado --}}
                                    <template x-if="!figura36">
                                        <div class="flex flex-col items-center justify-center gap-2 py-4">
                                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-gray-600 dark:text-gray-400 text-center">
                                                Haz clic para seleccionar un archivo<br>
                                                o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                            </p>
                                        </div>
                                    </template>

                                    <template x-if="figura36">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                            </div>
                                            <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                        </div>
                                    </template>
                                </div>


                                <!-- Preview de imagen con condicional -->
                                <div x-show="figura36" class="mt-3 relative group">
                                    <img :src="figura36" alt="Preview Figura 30"
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
                                    figura 37-Sismo Dinámico en dirección “X”
                                </label>

                                {{-- Contenedor con soporte para pegar --}}
                                <div @paste="handlePaste($event, 'figura37')"
                                    @click="$refs.input_figura37.click()"
                                    @mouseenter="$el.focus()"
                                    tabindex="0"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura37 === document.activeElement }">

                                    {{-- Input oculto --}}
                                    <input type="file"
                                        accept="image/*"
                                        @change="handleImageUpload($event, 'figura37')"
                                        x-ref="input_figura37"
                                        class="hidden">

                                    {{-- Contenido según estado --}}
                                    <template x-if="!figura37">
                                        <div class="flex flex-col items-center justify-center gap-2 py-4">
                                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-gray-600 dark:text-gray-400 text-center">
                                                Haz clic para seleccionar un archivo<br>
                                                o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                            </p>
                                        </div>
                                    </template>

                                    <template x-if="figura37">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                            </div>
                                            <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                        </div>
                                    </template>
                                </div>


                                <!-- Preview de imagen con condicional -->
                                <div x-show="figura37" class="mt-3 relative group">
                                    <img :src="figura37" alt="Preview Figura 30"
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
                                    figura 38-Sismo Dinámico en dirección “Y”
                                </label>

                                {{-- Contenedor con soporte para pegar --}}
                                <div @paste="handlePaste($event, 'figura38')"
                                    @click="$refs.input_figura38.click()"
                                    @mouseenter="$el.focus()"
                                    tabindex="0"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura38 === document.activeElement }">

                                    {{-- Input oculto --}}
                                    <input type="file"
                                        accept="image/*"
                                        @change="handleImageUpload($event, 'figura38')"
                                        x-ref="input_figura38"
                                        class="hidden">

                                    {{-- Contenido según estado --}}
                                    <template x-if="!figura38">
                                        <div class="flex flex-col items-center justify-center gap-2 py-4">
                                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-gray-600 dark:text-gray-400 text-center">
                                                Haz clic para seleccionar un archivo<br>
                                                o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                            </p>
                                        </div>
                                    </template>

                                    <template x-if="figura38">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                            </div>
                                            <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                        </div>
                                    </template>
                                </div>
                                <!-- Preview de imagen con condicional -->
                                <div x-show="figura38" class="mt-3 relative group">
                                    <img :src="figura38" alt="Preview Figura 30"
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
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Figura 39 --}}
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    figura 39-Deformada en “X” debido a carga sísmica (mm)
                                </label>

                                {{-- Contenedor con soporte para pegar --}}
                                <div @paste="handlePaste($event, 'figura39')"
                                    @click="$refs.input_figura39.click()"
                                    @mouseenter="$el.focus()"
                                    tabindex="0"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura39 === document.activeElement }">

                                    {{-- Input oculto --}}
                                    <input type="file"
                                        accept="image/*"
                                        @change="handleImageUpload($event, 'figura39')"
                                        x-ref="input_figura39"
                                        class="hidden">

                                    {{-- Contenido según estado --}}
                                    <template x-if="!figura39">
                                        <div class="flex flex-col items-center justify-center gap-2 py-4">
                                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-gray-600 dark:text-gray-400 text-center">
                                                Haz clic para seleccionar un archivo<br>
                                                o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                            </p>
                                        </div>
                                    </template>

                                    <template x-if="figura39">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                            </div>
                                            <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                        </div>
                                    </template>
                                </div>
                                <!-- Preview de imagen con condicional -->
                                <div x-show="figura39" class="mt-3 relative group">
                                    <img :src="figura39" alt="Preview Figura 30"
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
                                    figura 40-Deformada en “Y” debido a carga sísmica (mm)
                                </label>

                                {{-- Contenedor con soporte para pegar --}}
                                <div @paste="handlePaste($event, 'figura40')"
                                    @click="$refs.input_figura40.click()"
                                    @mouseenter="$el.focus()"
                                    tabindex="0"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    :class="{ 'border-red-500 ring-2 ring-red-500': $refs.input_figura40 === document.activeElement }">

                                    {{-- Input oculto --}}
                                    <input type="file"
                                        accept="image/*"
                                        @change="handleImageUpload($event, 'figura40')"
                                        x-ref="input_figura40"
                                        class="hidden">

                                    {{-- Contenido según estado --}}
                                    <template x-if="!figura40">
                                        <div class="flex flex-col items-center justify-center gap-2 py-4">
                                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="text-gray-600 dark:text-gray-400 text-center">
                                                Haz clic para seleccionar un archivo<br>
                                                o <span class="font-semibold">Ctrl+V</span> para pegar una imagen
                                            </p>
                                        </div>
                                    </template>

                                    <template x-if="figura40">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span class="text-green-600 dark:text-green-400">Imagen cargada correctamente</span>
                                            </div>
                                            <span class="text-xs text-gray-500">Ctrl+V para reemplazar</span>
                                        </div>
                                    </template>
                                </div>
                                <!-- Preview de imagen con condicional -->
                                <div x-show="figura40" class="mt-3 relative group">
                                    <img :src="figura40" alt="Preview Figura 30"
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
    </div>
</section>