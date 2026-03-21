{{-- sections/parametros-sismicos.blade.php --}}
<section id="section-parametros" x-data="createGeneralidadesComponent()"
    class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-3 mb-6">
        <div class="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Parámetros Sísmicos</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Configuración estructural del proyecto</p>
        </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Factor Suelo</label>
            <select x-model="cover.soilFactor"
                class="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 px-4 py-3 pr-10 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 outline-none">
                <option value="S0">S0</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
            </select>
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Periodos</label>
            <select x-model="cover.soilPeriod"
                class="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 px-4 py-3 pr-10 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 outline-none">
                <option value="Tp">Tp</option>
                <option value="Tl">Tl</option>
            </select>
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
            <select x-model="cover.buildingCategory" @change="updateBuildingCategory()"
                class="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 px-4 py-3 pr-10 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 outline-none">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
            </select>
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Factor U</label>
            <input type="text" x-model="cover.importanceFactorU" readonly
                class="w-full bg-gray-100 dark:bg-gray-700/60 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 p-3 rounded-xl outline-none cursor-not-allowed">
        </div>

        <div class="col-span-2 md:col-span-3 lg:col-span-5 space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Sistema Estructural
            </label>
            <input type="text" x-model="cover.structuralSystemDescription"
                placeholder="Ej: Dual, Muros de Concreto Armado"
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none">
        </div>
    </div>
</section>
