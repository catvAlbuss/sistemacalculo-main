{{-- sections/analisis-cargas.blade.php - Sección de Análisis de Cargas --}}
<section id="section-analisis-cargas" x-data="createAnalisisCargasComponent()"
    class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-3 mb-6">
        <div
            class="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Análisis de Cargas (Sección 2)</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Modelos y metrados estructurales</p>
        </div>
    </div>

    <div class="space-y-12">
        {{-- 2.1 Modelo Estructural --}}
        <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-l-4 border-amber-500 pl-3">2.1 MODELO
                ESTRUCTURAL</h3>
            <div class="grid grid-cols-1 gap-4">
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        {{-- Usar el nombre específico del array --}}
                        <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Figura 14 - Vista 3D Modelo
                            Matemático</label>
                        <button type="button"
                            x-show="previews.modeloMatematico3DImages[0]"
                            @click="removeArrayImage('modeloMatematico3DImages', 0)"
                            class="text-red-500 text-xs font-semibold hover:underline">
                            Eliminar
                        </button>
                    </div>
                    <div class="relative group h-48">
                        <template x-if="previews.modeloMatematico3DImages[0]">
                            <img :src="previews.modeloMatematico3DImages[0]"
                                class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                        </template>
                        <template x-if="!previews.modeloMatematico3DImages[0]">
                            <div class="h-full">
                                <input type="file"
                                    :id="'file_pred_' + 0"
                                    @change="handleArrayImageChange('modeloMatematico3DImages', 0, $event)"
                                    class="hidden"
                                    accept="image/*">
                                <label :for="'file_pred_' + 0"
                                    @paste="handlePaste($event, 'modeloMatematico3DImages', 0)"
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
                <!-- <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Figura 14 - Vista 3D Modelo
                            Matemático</label>
                        <button type="button" x-show="previews.modeloMatematico3DImages[0]"
                            @click="removeArrayImage('modeloMatematico3DImages', 0)"
                            class="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1">
                            Eliminar
                        </button>
                    </div>
                    <div class="relative group h-64">
                        <template x-if="previews.modeloMatematico3DImages[0]">
                            <img :src="previews.modeloMatematico3DImages[0]"
                                class="h-full w-full object-contain rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        </template>
                        <template x-if="!previews.modeloMatematico3DImages[0]">
                            <label
                                class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-amber-500 mb-2"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span class="text-xs font-medium text-gray-600">Subir Figura 14</span>
                                <input type="file"
                                    @change="handleArrayImageChange('modeloMatematico3DImages', 0, $event)"
                                    class="hidden">
                            </label>
                        </template>
                    </div>
                </div> -->
            </div>
        </div>

        {{-- 2.2 Espectros --}}
        <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-l-4 border-amber-500 pl-3">2.2
                ESPECTROS DE PSEUDO-ACELERACIONES</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <template x-for="i in 2" :key="i">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            {{-- Usar el nombre específico del array --}}
                            <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                x-text="'Figura ' + (14+i)"></label>
                            <button type="button"
                                x-show="previews.espectroPseudoaceleracionesImages[i-1]"
                                @click="removeArrayImage('espectroPseudoaceleracionesImages', i-1)"
                                class="text-red-500 text-xs font-semibold hover:underline">
                                Eliminar
                            </button>
                        </div>
                        <div class="relative group h-48">
                            <template x-if="previews.espectroPseudoaceleracionesImages[i-1]">
                                <img :src="previews.espectroPseudoaceleracionesImages[i-1]"
                                    class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                            </template>
                            <template x-if="!previews.espectroPseudoaceleracionesImages[i-1]">
                                <div class="h-full">
                                    <input type="file"
                                        :id="'file_pred_' + i-1"
                                        @change="handleArrayImageChange('espectroPseudoaceleracionesImages', i-1, $event)"
                                        class="hidden"
                                        accept="image/*">
                                    <label :for="'file_pred_' + i-1"
                                        @paste="handlePaste($event, 'espectroPseudoaceleracionesImages', i-1)"
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
                    <!-- <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                x-text="'Figura ' + (14 + i)"></label>
                            <button type="button" x-show="previews.espectroPseudoaceleracionesImages[i-1]"
                                @click="removeArrayImage('espectroPseudoaceleracionesImages', i-1)"
                                class="text-red-500 text-xs font-semibold hover:underline">Eliminar</button>
                        </div>
                        <div class="relative group h-48">
                            <template x-if="previews.espectroPseudoaceleracionesImages[i-1]">
                                <img :src="previews.espectroPseudoaceleracionesImages[i - 1]"
                                    class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                            </template>
                            <template x-if="!previews.espectroPseudoaceleracionesImages[i-1]">
                                <label
                                    class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-amber-50">
                                    <span class="text-xs text-gray-500">Subir espectro</span>
                                    <input type="file"
                                        @change="handleArrayImageChange('espectroPseudoaceleracionesImages', i-1, $event)"
                                        class="hidden">
                                </label>
                            </template>
                        </div>
                    </div> -->
                </template>
            </div>
        </div>

        {{-- 2.4 Metrado de Cargas --}}
        <div class="space-y-6">
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200 border-l-4 border-amber-500 pl-3">2.4 METRADO
                DE CARGAS</h3>
            <div
                class="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800 space-y-6">
                <h4 class="font-bold text-amber-800 dark:text-amber-400">Datos de Carga y Geometría</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500">K5: Carga Muerta (kgf/m2)</label>
                        <input type="number" x-model="$store.memoriaCalculo.sections.analisisCargas.casoscarga.K5"
                            class="w-full rounded-lg border-2 border-gray-200 p-2 text-sm focus:border-amber-500 outline-none">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500">K10: Carga Viva (kgf/m2)</label>
                        <input type="number" x-model="$store.memoriaCalculo.sections.analisisCargas.casoscarga.K10"
                            class="w-full rounded-lg border-2 border-gray-200 p-2 text-sm focus:border-amber-500 outline-none">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500">K11: S/C Const. (kgf/m2)</label>
                        <input type="number" x-model="$store.memoriaCalculo.sections.analisisCargas.casoscarga.K11"
                            class="w-full rounded-lg border-2 border-gray-200 p-2 text-sm focus:border-amber-500 outline-none">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500">Viento (km/h)</label>
                        <input type="number"
                            x-model="$store.memoriaCalculo.sections.analisisCargas.casoscarga.cargaviento"
                            class="w-full rounded-lg border-2 border-amber-200 p-2 text-sm focus:border-amber-500 outline-none bg-amber-50/50">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500">K17: Altura (m)</label>
                        <input type="number" step="0.01"
                            x-model="$store.memoriaCalculo.sections.analisisCargas.casoscarga.K17"
                            class="w-full rounded-lg border-2 border-gray-200 p-2 text-sm focus:border-amber-500 outline-none">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500">K21: C Barlovento</label>
                        <input type="number" step="0.01"
                            x-model="$store.memoriaCalculo.sections.analisisCargas.casoscarga.K21"
                            class="w-full rounded-lg border-2 border-gray-200 p-2 text-sm focus:border-amber-500 outline-none">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-gray-500">K32: C Sotavento</label>
                        <input type="number" step="0.01"
                            x-model="$store.memoriaCalculo.sections.analisisCargas.casoscarga.K32"
                            class="w-full rounded-lg border-2 border-gray-200 p-2 text-sm focus:border-amber-500 outline-none">
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <h4 class="font-bold text-gray-700">Imágenes de Metrado (Fig 18 - 21)</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <template x-for="i in 4" :key="i">
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
<<<<<<< HEAD
                                <label class="text-xs font-bold" x-text="'Figura ' + (17 + i)"></label>
                                <!-- BOTON ELIMINAR (JHACK) -->
=======
                                {{-- Usar el nombre específico del array --}}
                                <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                    x-text="'Figura ' + (17+i)"></label>
                                <button type="button"
                                    x-show="previews.metradoCargasImages[i-1]"
                                    @click="removeArrayImage('metradoCargasImages', i-1)"
                                    class="text-red-500 text-xs font-semibold hover:underline">
                                    Eliminar
                                </button>
                            </div>
                            <div class="relative group h-48">
                                <template x-if="previews.metradoCargasImages[i-1]">
                                    <img :src="previews.metradoCargasImages[i-1]"
                                        class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                </template>
                                <template x-if="!previews.metradoCargasImages[i-1]">
                                    <div class="h-full">
                                        <input type="file"
                                            :id="'file_pred_' + i-1"
                                            @change="handleArrayImageChange('metradoCargasImages', i-1, $event)"
                                            class="hidden"
                                            accept="image/*">
                                        <label :for="'file_pred_' + i-1"
                                            @paste="handlePaste($event, 'metradoCargasImages', i-1)"
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
                        <!-- <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="text-xs font-bold" x-text="'Figura ' + (17 + i)"></label>
>>>>>>> 214c24bba7f9f12cdbf217e63261464dbacb13ec
                                <button type="button" x-show="previews.metradoCargasImages[i-1]"
                                    @click="removeArrayImage('metradoCargasImages', [i-1])"
                                    class="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1">
                                    Eliminar
                                </button>
                            </div>

                            <div class="relative group h-32">
                                <template x-if="previews.metradoCargasImages[i-1]">
                                    <img :src="previews.metradoCargasImages[i - 1]"
                                        class="h-full w-full object-contain rounded-lg border border-gray-200">
                                </template>
                                <template x-if="!previews.metradoCargasImages[i-1]">
                                    <label
                                        class="flex items-center justify-center h-full w-full rounded-lg border-2 border-dashed border-gray-300 cursor-pointer">
                                        <input type="file"
                                            @change="handleArrayImageChange('metradoCargasImages', i-1, $event)"
                                            class="hidden">
                                        <span class="text-[10px] text-gray-400">Subir</span>
                                    </label>
                                </template>
                            </div>
                        </div> -->
                    </template>
                </div>
            </div>

            <div class="space-y-4">
                <h4 class="font-bold text-gray-700">Imágenes Cargas Aproximadas (Fig 22 - 25)</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <template x-for="i in 4" :key="i">
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
<<<<<<< HEAD
                                <label class="text-xs font-bold" x-text="'Figura ' + (21 + i)"></label>

                                <!-- BOTON ELIMINAR (JHACK) -->
=======
                                {{-- Usar el nombre específico del array --}}
                                <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                    x-text="'Figura ' + (21+i)"></label>
                                <button type="button"
                                    x-show="previews.cargasAproximadasImages[i-1]"
                                    @click="removeArrayImage('cargasAproximadasImages', i-1)"
                                    class="text-red-500 text-xs font-semibold hover:underline">
                                    Eliminar
                                </button>
                            </div>
                            <div class="relative group h-48">
                                <template x-if="previews.cargasAproximadasImages[i-1]">
                                    <img :src="previews.cargasAproximadasImages[i-1]"
                                        class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                                </template>
                                <template x-if="!previews.cargasAproximadasImages[i-1]">
                                    <div class="h-full">
                                        <input type="file"
                                            :id="'file_pred_' + i-1"
                                            @change="handleArrayImageChange('cargasAproximadasImages', i-1, $event)"
                                            class="hidden"
                                            accept="image/*">
                                        <label :for="'file_pred_' + i-1"
                                            @paste="handlePaste($event, 'cargasAproximadasImages', i-1)"
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
                        <!-- <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="text-xs font-bold" x-text="'Figura ' + (21 + i)"></label>
>>>>>>> 214c24bba7f9f12cdbf217e63261464dbacb13ec
                                <button type="button" x-show="previews.cargasAproximadasImages[i-1]"
                                    @click="removeArrayImage('cargasAproximadasImages', [i-1])"
                                    class="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1">
                                    Eliminar
                                </button>
                            </div>

                            <div class="relative group h-32">
                                <template x-if="previews.cargasAproximadasImages[i-1]">
                                    <img :src="previews.cargasAproximadasImages[i - 1]"
                                        class="h-full w-full object-contain rounded-lg border border-gray-200">
                                </template>
                                <template x-if="!previews.cargasAproximadasImages[i-1]">
                                    <label
                                        class="flex items-center justify-center h-full w-full rounded-lg border-2 border-dashed border-gray-300 cursor-pointer">
                                        <input type="file"
                                            @change="handleArrayImageChange('cargasAproximadasImages', i-1, $event)"
                                            class="hidden">
                                        <span class="text-[10px] text-gray-400">Subir</span>
                                    </label>
                                </template>
                            </div>
                        </div> -->
                    </template>
                </div>
            </div>
        </div>
    </div>
</section>
</section>