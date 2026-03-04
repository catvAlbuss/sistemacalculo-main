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
                </div>
            </template>
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
