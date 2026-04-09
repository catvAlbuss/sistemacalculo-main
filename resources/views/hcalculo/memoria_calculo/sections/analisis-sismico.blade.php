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

        {{-- Section 3.1.	IRREGULARIDADES Artículo 29 E-0.30 --}}
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection31 = !showSection31" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">3.1 ANÁLISIS ESTRUCTURAL</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(22 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showSection31 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection31" x-collapse class="bg-white dark:bg-gray-800/50">
                {{-- Sub-section 3.1.1. Sistema Estructural --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection311 = !showSection311" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.1.1. Sistema Estructural</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection311 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection311" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Imagen posicion 0, 1 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 1</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[0]"
                                        @click="removeArrayImage('analisisEstructuralImages', 0)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[0]">
                                        <img :src="previews.analisisEstructuralImages[0]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[0]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 0"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 0, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 0"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 0)"
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
                            {{-- Imagen posicion 1 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 2</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[1]"
                                        @click="removeArrayImage('analisisEstructuralImages', 1)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[1]">
                                        <img :src="previews.analisisEstructuralImages[1]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[1]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 0"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 1, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 0"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 1)"
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
                        </div>
                    </div>
                </div>
                {{-- Sub-section 3.1.2. Coeficiente Básico de Reducción de Fuerzas Sísmicas, Ro --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection312 = !showSection312" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.1.2. Coeficiente Básico de Reducción de Fuerzas Sísmicas, Ro</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection312 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection312" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Imagen posicion 2 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 1</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[2]"
                                        @click="removeArrayImage('analisisEstructuralImages', 2)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[2]">
                                        <img :src="previews.analisisEstructuralImages[2]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[2]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 2"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 2, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 2"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 2)"
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
                            {{-- Imagen posicion 3 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 2</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[3]"
                                        @click="removeArrayImage('analisisEstructuralImages', 3)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[3]">
                                        <img :src="previews.analisisEstructuralImages[3]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[3]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 3"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 3, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 3"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 3)"
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
                        </div>
                    </div>

                </div>
                {{-- Sub-section 3.1.3. Factores de Irregularidad (La, Lp) --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection313 = !showSection313" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.1.3. Factores de Irregularidad (La, Lp)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection313 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection313" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Imagen posicion 4 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 1</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[4]"
                                        @click="removeArrayImage('analisisEstructuralImages', 4)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[4]">
                                        <img :src="previews.analisisEstructuralImages[4]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[4]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 4"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 4, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 4"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 4)"
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
                            {{-- Imagen posicion 5 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 2</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[5]"
                                        @click="removeArrayImage('analisisEstructuralImages', 5)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[5]">
                                        <img :src="previews.analisisEstructuralImages[5]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[5]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 5"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 5, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 5"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 5)"
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
                        </div>
                    </div>
                </div>
                {{-- Sub-section 3.1.4. Restricciones a la Irregularidad --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection314 = !showSection314" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.1.4. Restricciones a la Irregularidad</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection314 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection314" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Imagen posicion 6 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 1</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[6]"
                                        @click="removeArrayImage('analisisEstructuralImages', 6)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[6]">
                                        <img :src="previews.analisisEstructuralImages[6]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[6]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 6"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 6, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 6"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 6)"
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
                            {{-- Imagen posicion 7 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 2</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[7]"
                                        @click="removeArrayImage('analisisEstructuralImages', 7)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[7]">
                                        <img :src="previews.analisisEstructuralImages[7]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[7]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 7"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 7, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 7"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 7)"
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
                        </div>
                    </div>
                </div>
                {{-- Sub-section 3.1.5. Coeficiente de Reducción de la Fuerza Sísmica (R) --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection315 = !showSection315" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.1.5. Coeficiente de Reducción de la Fuerza Sísmica (R)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection315 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection315" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Imagen posicion 8 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 1</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[8]"
                                        @click="removeArrayImage('analisisEstructuralImages', 8)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[8]">
                                        <img :src="previews.analisisEstructuralImages[8]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[8]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 8"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 8, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 8"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 8)"
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
                            {{-- Imagen posicion 9 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 2</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[9]"
                                        @click="removeArrayImage('analisisEstructuralImages', 9)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[9]">
                                        <img :src="previews.analisisEstructuralImages[9]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[9]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 9"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 9, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 9"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 9)"
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
                        </div>
                    </div>
                </div>
                {{-- Sub-section 3.1.6. Modelos de Análisis --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection316 = !showSection316" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.1.6. Modelos de Análisis</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection316 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection316" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Imagen posicion 10 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 1</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[10]"
                                        @click="removeArrayImage('analisisEstructuralImages', 10)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[10]">
                                        <img :src="previews.analisisEstructuralImages[10]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[10]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 10"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 10, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 10"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 10)"
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
                            {{-- Imagen posicion 11 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 2</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[11]"
                                        @click="removeArrayImage('analisisEstructuralImages', 11)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[11]">
                                        <img :src="previews.analisisEstructuralImages[11]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[11]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 11"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 11, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 11"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 11)"
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
                        </div>
                    </div>
                </div>
                {{-- Sub-section 3.1.7. Estimación del Peso (P) --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection317 = !showSection317" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.1.7. Estimación del Peso (P)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection317 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection317" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Imagen posicion 12 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 1</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[12]"
                                        @click="removeArrayImage('analisisEstructuralImages', 12)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[12]">
                                        <img :src="previews.analisisEstructuralImages[12]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[12]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 12"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 12, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 12"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 12)"
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
                            {{-- Imagen posicion 13 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 2</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[13]"
                                        @click="removeArrayImage('analisisEstructuralImages', 13)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[13]">
                                        <img :src="previews.analisisEstructuralImages[13]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[13]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 13"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 13, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 13"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 13)"
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
                        </div>
                    </div>
                </div>
                {{-- Sub-section 3.1.8. Procedimientos de Análisis Sísmico --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection318 = !showSection318" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.1.8. Procedimientos de Análisis Sísmico</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection318 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection318" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Imagen posicion 14 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 1</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[14]"
                                        @click="removeArrayImage('analisisEstructuralImages', 14)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[14]">
                                        <img :src="previews.analisisEstructuralImages[14]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[14]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 14"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 14, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 14"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 14)"
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
                            {{-- Imagen posicion 15 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 2</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[15]"
                                        @click="removeArrayImage('analisisEstructuralImages', 15)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[15]">
                                        <img :src="previews.analisisEstructuralImages[15]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[15]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 15"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 15, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 15"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 15)"
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
                        </div>
                    </div>
                </div>
                {{-- Sub-section 3.1.9. Determinación de Desplazamientos Laterales --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection319 = !showSection319" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.1.9. Determinación de Desplazamientos Laterales</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection319 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection319" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Imagen posicion 16 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 1</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[16]"
                                        @click="removeArrayImage('analisisEstructuralImages', 16)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[16]">
                                        <img :src="previews.analisisEstructuralImages[16]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[16]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 16"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 16, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 16"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 16)"
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
                            {{-- Imagen posicion 17 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 2</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[17]"
                                        @click="removeArrayImage('analisisEstructuralImages', 17)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[17]">
                                        <img :src="previews.analisisEstructuralImages[17]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[17]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 17"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 17, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 17"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 17)"
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
                        </div>
                    </div>
                </div>
                {{-- Sub-section 3.1.10. Distorsión Admisible --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection3110 = !showSection3110" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.1.10. Distorsión Admisible</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection3110 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection3110" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Imagen posicion 18 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 1</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[18]"
                                        @click="removeArrayImage('analisisEstructuralImages', 18)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[18]">
                                        <img :src="previews.analisisEstructuralImages[18]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[18]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 18"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 18, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 18"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 18)"
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
                            {{-- Imagen posicion 19 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 2</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[19]"
                                        @click="removeArrayImage('analisisEstructuralImages', 19)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[19]">
                                        <img :src="previews.analisisEstructuralImages[19]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[19]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 19"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 19, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 19"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 19)"
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
                        </div>
                    </div>
                </div>
                {{-- Sub-section 3.1.11. Separacion entre edificios --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection3111 = !showSection3111" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.1.11. Separacion entre edificios</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection3111 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection3111" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {{-- Imagen posicion 20 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 1</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[20]"
                                        @click="removeArrayImage('analisisEstructuralImages', 20)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[20]">
                                        <img :src="previews.analisisEstructuralImages[20]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[20]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 20"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 20, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 20"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 20)"
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
                            {{-- Imagen posicion 21 --}}
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen 2</label>
                                    <button type="button"
                                        x-show="previews.analisisEstructuralImages[21]"
                                        @click="removeArrayImage('analisisEstructuralImages', 21)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.analisisEstructuralImages[21]">
                                        <img :src="previews.analisisEstructuralImages[21]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.analisisEstructuralImages[21]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 21"
                                                @change="handleArrayImageChange('analisisEstructuralImages', 21, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 21"
                                                @paste="handlePasteArray($event, 'analisisEstructuralImages', 21)"
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
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Section 3.2.	IRREGULARIDADES Artículo 29 E-0.30 --}}
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection32 = !showSection32" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">3.2. IRREGULARIDADES Artículo 29 E-0.30</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(3 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showSection32 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection32" x-collapse class="bg-white dark:bg-gray-800/50">
                {{-- Sub-section 3.2.1. Irregularidades en altura (IA. "K", "V") --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection321 = !showSection321" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
<<<<<<< HEAD
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Irregularidades en altura (IA)</span>
=======
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Irregularidades en altura (IA. "K", "V")</span>
>>>>>>> 30fe317799008a4bd23eae4e5d8214153e3227b8
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection321 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection321" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <template x-for="(item, idx) in [
                                        { index: 0, nombre: 'Irregularidad de Rigidez - Piso Blando X' },
                                        { index: 1, nombre: 'Irregularidad de Resistencia - Piso Debil X' },
                                        { index: 2, nombre: 'Irregularidad de Rigidez - Piso Blando Y' },
                                        { index: 3, nombre: 'Irregularidad de Resistencia - Piso Debil Y' },
                                        { index: 4, nombre: 'Irregularidad de Rigidez - Piso Blando (Extrema) X' },
                                        { index: 5, nombre: 'Irregularidad de Resistencia - Piso Debil (Extrema) X' },
                                        { index: 6, nombre: 'Irregularidad de Rigidez - Piso Blando (Extrema) Y' },
                                        { index: 7, nombre: 'Irregularidad de Resistencia - Piso Debil (Extrema) Y' },
                                    ]" :key="item.index">
                                <div class="space-y-2">
                                    <div class="flex items-center justify-between">
                                        {{-- Usar el nombre específico del array --}}
                                        <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                            x-text="item.nombre"></label>
                                        <button type="button"
                                            x-show="previews.irregularidadImages[item.index]"
                                            @click="removeArrayImage('irregularidadImages', item.index)"
                                            class="text-red-500 text-xs font-semibold hover:underline">
                                            Eliminar
                                        </button>
                                    </div>
                                    <div class="relative group h-48">
                                        <template x-if="previews.irregularidadImages[item.index]">
                                            <img :src="previews.irregularidadImages[item.index]"
                                                class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                        </template>
                                        <template x-if="!previews.irregularidadImages[item.index]">
                                            <div class="h-full">
                                                <input type="file"
                                                    :id="'file_pred_' + item.index"
                                                    @change="handleArrayImageChange('irregularidadImages', item.index, $event)"
                                                    class="hidden"
                                                    accept="image/*">
                                                <label :for="'file_pred_' + item.index"
                                                    @paste="handlePasteArray($event, 'irregularidadImages', item.index)"
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
                {{-- Sub-section 3.2.2. Irregularidades en altura (MASA O PESO / Según NTE E.030 - 2018) --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection322 = !showSection322" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
<<<<<<< HEAD
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Irregularidades en altura (Masa)</span>
=======
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Irregularidades en altura (MASA O PESO / Según NTE E.030 - 2018)</span>
>>>>>>> 30fe317799008a4bd23eae4e5d8214153e3227b8
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection322 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection322" x-collapse class="p-6 space-y-6">
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                {{-- Usar el nombre específico del array --}}
                                <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Resultado de analisis</label>
                                <button type="button"
                                    x-show="previews.irregularidadImages[8]"
                                    @click="removeArrayImage('irregularidadImages', 8)"
                                    class="text-red-500 text-xs font-semibold hover:underline">
                                    Eliminar
                                </button>
                            </div>
                            <div class="relative group h-48">
                                <template x-if="previews.irregularidadImages[8]">
                                    <img :src="previews.irregularidadImages[8]"
                                        class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                </template>
                                <template x-if="!previews.irregularidadImages[8]">
                                    <div class="h-full">
                                        <input type="file"
                                            :id="'file_pred_' + 8"
                                            @change="handleArrayImageChange('irregularidadImages', 8, $event)"
                                            class="hidden"
                                            accept="image/*">
                                        <label :for="'file_pred_' + 8"
                                            @paste="handlePasteArray($event, 'irregularidadImages', 8)"
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
                    </div>
                </div>
                {{-- Sub-section 3.2.3. Irregularidades en altura (IGV, DSR/ Según NTE E.030 - 2018) --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection323 = !showSection323" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Irregularidades en altura (IGV, DSR/ Según NTE E.030 - 2018)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection323 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection323" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Evaluacion IGV (X/Y)</label>
                                    <button type="button"
                                        x-show="previews.irregularidadImages[9]"
                                        @click="removeArrayImage('irregularidadImages', 9)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.irregularidadImages[9]">
                                        <img :src="previews.irregularidadImages[9]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.irregularidadImages[9]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 9"
                                                @change="handleArrayImageChange('irregularidadImages', 9, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 9"
                                                @paste="handlePasteArray($event, 'irregularidadImages', 9)"
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
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Evaluacion combinado</label>
                                    <button type="button"
                                        x-show="previews.irregularidadImages[10]"
                                        @click="removeArrayImage('irregularidadImages', 10)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.irregularidadImages[10]">
                                        <img :src="previews.irregularidadImages[10]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.irregularidadImages[10]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 10"
                                                @change="handleArrayImageChange('irregularidadImages', 10, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 10"
                                                @paste="handlePasteArray($event, 'irregularidadImages', 10)"
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
                        </div>
                    </div>
                </div>
                {{-- Sub-section 3.2.4. Irregularidades en planta (IGV, DSR/ Según NTE E.030 - 2018) --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection324 = !showSection324" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Irregularidades en planta (IGV, DSR/ Según NTE E.030 - 2018)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection324 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection324" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Irregularidad geometrica vertical</label>
                                    <button type="button"
                                        x-show="previews.irregularidadImages[11]"
                                        @click="removeArrayImage('irregularidadImages', 11)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.irregularidadImages[11]">
                                        <img :src="previews.irregularidadImages[11]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.irregularidadImages[11]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 11"
                                                @change="handleArrayImageChange('irregularidadImages', 11, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 11"
                                                @paste="handlePasteArray($event, 'irregularidadImages', 11)"
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
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Discontinuidad en los sistemas restantes</label>
                                    <button type="button"
                                        x-show="previews.irregularidadImages[12]"
                                        @click="removeArrayImage('irregularidadImages', 12)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.irregularidadImages[12]">
                                        <img :src="previews.irregularidadImages[12]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.irregularidadImages[12]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 12"
                                                @change="handleArrayImageChange('irregularidadImages', 12, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 12"
                                                @paste="handlePasteArray($event, 'irregularidadImages', 12)"
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
                        </div>
                    </div>
                </div>
                {{-- Sub-section 3.2.5. Irregularidades en planta (Sistemas No Paralelos / Según NTE E.030 - 2018) --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection325 = !showSection325" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Irregularidades en planta (Sistemas No Paralelos / Según NTE E.030 - 2018)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection325 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection325" x-collapse class="p-6 space-y-6">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Caso combinado</label>
                                    <button type="button"
                                        x-show="previews.irregularidadImages[13]"
                                        @click="removeArrayImage('irregularidadImages', 13)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.irregularidadImages[13]">
                                        <img :src="previews.irregularidadImages[13]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.irregularidadImages[13]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 13"
                                                @change="handleArrayImageChange('irregularidadImages', 13, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 13"
                                                @paste="handlePasteArray($event, 'irregularidadImages', 13)"
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
                    </div>
                </div>
                {{-- Sub-section 3.2.6. Irregularidades en planta (Irregularidad torsional) --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection326 = !showSection326" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Irregularidad Torsional</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection326 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection326" x-collapse class="p-6 space-y-6">
                        <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Datos de entrada y resultado</label>
                                    <button type="button"
                                        x-show="previews.irregularidadImages[14]"
                                        @click="removeArrayImage('irregularidadImages', 14)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.irregularidadImages[14]">
                                        <img :src="previews.irregularidadImages[14]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.irregularidadImages[14]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 14"
                                                @change="handleArrayImageChange('irregularidadImages', 14, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 14"
                                                @paste="handlePasteArray($event, 'irregularidadImages', 14)"
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
                    </div>
                </div>
                {{-- Sub-section 3.2.7. Irregularidad en planta (TORSIÓN - Según NTE E.030 - 2018) --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection327 = !showSection327" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Irregularidades en planta (TORSIÓN - Según NTE E.030 - 2018)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection327 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection327" x-collapse class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Direccion XX</label>
                                    <button type="button"
                                        x-show="previews.irregularidadImages[15]"
                                        @click="removeArrayImage('irregularidadImages', 15)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.irregularidadImages[15]">
                                        <img :src="previews.irregularidadImages[15]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.irregularidadImages[15]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 15"
                                                @change="handleArrayImageChange('irregularidadImages', 15, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 15"
                                                @paste="handlePasteArray($event, 'irregularidadImages', 15)"
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
                                <div class="flex items-center justify-between">
                                    {{-- Usar el nombre específico del array --}}
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Direccion YY</label>
                                    <button type="button"
                                        x-show="previews.irregularidadImages[16]"
                                        @click="removeArrayImage('irregularidadImages', 16)"
                                        class="text-red-500 text-xs font-semibold hover:underline">
                                        Eliminar
                                    </button>
                                </div>
                                <div class="relative group h-48">
                                    <template x-if="previews.irregularidadImages[16]">
                                        <img :src="previews.irregularidadImages[16]"
                                            class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                    </template>
                                    <template x-if="!previews.irregularidadImages[16]">
                                        <div class="h-full">
                                            <input type="file"
                                                :id="'file_pred_' + 16"
                                                @change="handleArrayImageChange('irregularidadImages', 16, $event)"
                                                class="hidden"
                                                accept="image/*">
                                            <label :for="'file_pred_' + 16"
                                                @paste="handlePasteArray($event, 'irregularidadImages', 16)"
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
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Section 3.3 - ANÁLISIS SÍSMICO ESTÁTICO --}}
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection33 = !showSection33" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">3.3 ANÁLISIS SÍSMICO ESTÁTICO</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(3 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showSection33 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection33" x-collapse class="p-6 space-y-6 bg-white dark:bg-gray-800/50">
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

        {{-- Section 3.4 - ANÁLISIS SÍSMICO DINÁMICO --}}
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button @click="showSection34 = !showSection34" type="button"
                class="w-full px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-900 dark:text-gray-100">3.4 ANÁLISIS SÍSMICO DINÁMICO</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">(12 imágenes)</span>
                </div>
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform"
                    :class="{ 'rotate-180': showSection34 }" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div x-show="showSection34" x-collapse class="bg-white dark:bg-gray-800/50">
                {{-- Sub-section 3.4.1 - CONSIDERACIONES EN ETABS --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection341 = !showSection341" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.4.1 CONSIDERACIONES EN
                            ETABS (2 imágenes)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection341 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection341" x-collapse class="p-6 space-y-6">
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

                {{-- Sub-section 3.4.2 - MODOS DE VIBRACIÓN --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection342 = !showSection342" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.4.2 MODOS DE VIBRACIÓN
                            (3 imágenes)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection342 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection342" x-collapse class="p-6 space-y-6">
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
                    <button @click="showSection343 = !showSection343" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.4.3 FUERZA CORTANTE
                            BASAL DINÁMICA (1 imagen)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection343 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection343" x-collapse class="p-6 space-y-6">
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

                {{-- Sub-section 3.4.4 - DESPLAZAMIENTO PERMISIBLE --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection344 = !showSection344" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.4.4 DESPLAZAMIENTO
                            PERMISIBLE (4 imágenes)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection344 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection344" x-collapse class="p-6 space-y-6">
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

                {{-- Sub-section 3.4.5 - DEFORMADAS --}}
                <div class="border-t border-gray-200 dark:border-gray-700">
                    <button @click="showSection345 = !showSection345" type="button"
                        class="w-full px-6 py-3 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">3.4.5 DEFORMADAS (2
                            imágenes)</span>
                        <svg class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
                            :class="{ 'rotate-180': showSection345 }" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div x-show="showSection345" x-collapse class="p-6 space-y-6">
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