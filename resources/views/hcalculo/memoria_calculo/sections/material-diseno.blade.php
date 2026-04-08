{{-- sections/material-diseno.blade.php --}}
<section id="section-material-diseno" x-data="createGeneralidadesComponent()"
    class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-3 mb-6">
        <div class="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Material de Diseno (Seccion 1.5)</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Propiedades de los materiales</p>
        </div>
    </div>

    <div class="space-y-6">
        {{-- Material Properties Grid --}}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            {{-- Acero Estructural --}}
            <div
                class="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 space-y-3">
                <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200">Acero estructural (ASTM A36)</h3>
                <div class="space-y-2">
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fy (kg/cm2)</label>
                    <input x-model="structuralDetails.materialDesign.aceroEstructural.fy" type="text"
                        class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                </div>
                <div class="space-y-2">
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">E (kg/cm2)</label>
                    <input x-model="structuralDetails.materialDesign.aceroEstructural.e" type="text"
                        class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                </div>
                <div class="space-y-2">
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fc (kg/cm2)</label>
                    <input x-model="structuralDetails.materialDesign.aceroEstructural.fc" type="text"
                        class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                </div>
            </div>

            {{-- Acero Corrugado --}}
            <div
                class="rounded-2xl border-2border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 space-y-3">
                <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200">Acero corrugado (ASTM A605)</h3>
                <div class="space-y-2">
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fy (kg/cm2)</label>
                    <input x-model="structuralDetails.materialDesign.aceroCorrugado.fy" type="text"
                        class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                </div>
                <div class="space-y-2">
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">E (kg/cm2)</label>
                    <input x-model="structuralDetails.materialDesign.aceroCorrugado.e" type="text"
                        class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                </div>
                <div class="space-y-2">
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fc (kg/cm2)</label>
                    <input x-model="structuralDetails.materialDesign.aceroCorrugado.fc" type="text"
                        class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                </div>
            </div>

            {{-- Concreto --}}
            <div
                class="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 space-y-3">
                <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200">Concreto</h3>
                <div class="space-y-2">
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fy (kg/cm2)</label>
                    <input x-model="structuralDetails.materialDesign.concreto.fy" type="text"
                        class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                </div>
                <div class="space-y-2">
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">E (kg/cm2)</label>
                    <input x-model="structuralDetails.materialDesign.concreto.e" type="text"
                        class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                </div>
                <div class="space-y-2">
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fc (kg/cm2)</label>
                    <input x-model="structuralDetails.materialDesign.concreto.fc" type="text"
                        class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                </div>
            </div>
        </div>

        {{-- Image Uploads (3 Material Images) --}}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <template x-for="i in 3" :key="i">
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        {{-- Usar el nombre específico del array --}}
                        <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                            x-text="'Figura ' + (10+i)"></label>
                        <button type="button"
                            x-show="previews.materialImages[i-1]"
                            @click="removeArrayImage('materialImages', i-1)"
                            class="text-red-500 text-xs font-semibold hover:underline">
                            Eliminar
                        </button>
                    </div>
                    <div class="relative group h-48">
                        <template x-if="previews.materialImages[i-1]">
                            <img :src="previews.materialImages[i-1]"
                                class="h-full w-full object-contain rounded-xl border-2 border-gray-200 bg-white">
                        </template>
                        <template x-if="!previews.materialImages[i-1]">
                            <div class="h-full">
                                <input type="file"
                                    :id="'file_pred_' + i-1"
                                    @change="handleArrayImageChange('materialImages', i-1, $event)"
                                    class="hidden"
                                    accept="image/*">
                                <label :for="'file_pred_' + i-1"
                                    @paste="handlePaste($event, 'materialImages', i-1)"
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
                            x-text="'Figura ' + (10 + i)"></label>
                        <button type="button" x-show="previews.materialImages && previews.materialImages[i-1]"
                            @click="removeArrayImage('materialImages', i-1)"
                            class="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                        </button>
                    </div>
                    <div class="relative group">
                        <template x-if="previews.materialImages && previews.materialImages[i-1]">
                            <div
                                class="h-48 w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center bg-white dark:bg-gray-800">
                                <img :src="previews.materialImages[i - 1]"
                                    class="max-h-full max-w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105">
                            </div>
                        </template>
                        <template x-if="!previews.materialImages || !previews.materialImages[i-1]">
                            <label
                                class="flex flex-col items-center justify-center h-48 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
                                <div
                                    class="p-3 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 mb-2 group-hover:scale-110 transition-transform">
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
                                    @change="handleArrayImageChange('materialImages', i-1, $event)" class="hidden">
                            </label>
                        </template>
                    </div>
                </div> -->
            </template>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div class="space-y-3 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Combinaciones de Carga (Norma E.060)
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Selecciona las combinaciones que deseas incluir en el documento:</p>

                <div>
                    {{-- Combinación 1 --}}
                    <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                        <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb1"
                            class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">1,4 CM + 1,7 CV</span>
                    </label>

                    {{-- Combinación 2: 1,25 (CM + CV ± CVi) --}}
                    <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                        <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb2"
                            class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                            1,25 (CM + CV <span class="text-red-500 font-bold">±</span> CV<span class="text-xs align-sub">i</span>)
                        </span>
                    </label>

                    {{-- Combinación 3: 0,9 CM ± 1,25 CVi --}}
                    <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                        <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb3"
                            class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                            0,9 CM <span class="text-red-500 font-bold">±</span> 1,25 CV<span class="text-xs align-sub">i</span>
                        </span>
                    </label>

                    {{-- Combinación 4: 1,25(CM + CV) ± CS --}}
                    <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                        <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb4"
                            class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                            1,25(CM + CV) <span class="text-red-500 font-bold">±</span> CS
                        </span>
                    </label>

                    {{-- Combinación 5: 0,9 CM ± CS --}}
                    <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                        <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb5"
                            class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                            0,9 CM <span class="text-red-500 font-bold">±</span> CS
                        </span>
                    </label>

                    {{-- Combinación 6: 1,4 CM + 1,7 CV + 1,7 CE --}}
                    <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                        <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb6"
                            class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">1,4 CM + 1,7 CV + 1,7 CE</span>
                    </label>

                    {{-- Combinación 7: 0,9 CM + 1,7 CE --}}
                    <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                        <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb7"
                            class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">0,9 CM + 1,7 CE</span>
                    </label>

                    {{-- Combinación 8: 1,4 CM + 1,7 CV + 1,4 CL --}}
                    <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                        <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb8"
                            class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">1,4 CM + 1,7 CV + 1,4 CL</span>
                    </label>

                    {{-- Combinación 9: 1,05 CM + 1,25 CV + 1,05 CT --}}
                    <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                        <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb9"
                            class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">1,05 CM + 1,25 CV + 1,05 CT</span>
                    </label>
                </div>
            </div>
            <div class="space-y-3 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Cargas, Factores de carga y Combinaciones de carga
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Selecciona las combinaciones que deseas incluir en el documento:</p>
                {{-- Combinación 5: 0,9 CM ± CS --}}
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb10"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        1,4 D
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb11"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        1,2D + 1,6L + 0,5(L<span class="text-xs align-sub">r</span> ó S ó R)
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb12"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        1,2D + 1,6(L<span class="text-xs align-sub">r</span> ó S ó R) + (0,5L<span class="text-xs align-sub">r</span> ó 0,8W)
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb13"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        1,2D + 1,3W + 0,5L + 0,5(L<span class="text-xs align-sub">r</span> ó S ó R)
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb14"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        1,2D <span class="text-red-500 font-bold">±</span> 1,0E + 0,5L + 0,2S
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb15"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        0,9D <span class="text-red-500 font-bold">±</span> (1,3W ó 1,0E)
                    </span>
                </label>
            </div>
            <div class="space-y-3 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/30">
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Combinaciones de Carga para diseños por esfuerzo admisibles
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Selecciona las combinaciones que deseas incluir en el documento:</p>

                <!-- COMBINACIONES DE CARGAS PARA DISEÑOS POR ADMISIBLES -->
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb16"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        D
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb17"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        D + L
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb18"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        D + (W ó 0,70E)
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb19"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        D + T
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb20"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        &#945;[D + L +(W ó 0,70E)]
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb21"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        &#945;[D + L + T]
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb22"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        &#945;[D + (W ó 0,70E) + T]
                    </span>
                </label>
                <label class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer group">
                    <input type="checkbox" x-model="structuralDetails.combinacionesCarga.comb23"
                        class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-mono">
                        &#945;[D + L + (W ó 0,70E) + T]
                    </span>
                </label>
            </div>
        </div>
        {{-- Indicador de selección --}}
        <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div class="text-xl text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span x-text="'Combinaciones seleccionadas: ' + Object.values(structuralDetails.combinacionesCarga).filter(v => v === true).length + ' de 23'"></span>
            </div>

            {{-- Botón para seleccionar/deseleccionar todas --}}
            <div class="flex gap-2">
                <button type="button"
                    @click="Object.keys(structuralDetails.combinacionesCarga).forEach(key => structuralDetails.combinacionesCarga[key] = true)"
                    class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition">
                    Seleccionar todas
                </button>
                <span class="text-gray-300 dark:text-gray-600">|</span>
                <button type="button"
                    @click="Object.keys(structuralDetails.combinacionesCarga).forEach(key => structuralDetails.combinacionesCarga[key] = false)"
                    class="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition">
                    Deseleccionar todas
                </button>
            </div>
        </div>

        {{-- General Description --}}
        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Descripcion General</label>
            <textarea x-model="structuralDetails.generalDescription" rows="5"
                placeholder="Para realizar el diseno de los elementos..."
                class="w-full bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 text-gray-900 dark:text-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none font-medium"></textarea>
        </div>
    </div>
</section>