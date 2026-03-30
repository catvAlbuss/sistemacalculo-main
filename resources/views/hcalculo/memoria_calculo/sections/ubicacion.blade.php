{{-- sections/ubicacion.blade.php - Sección de Ubicación --}}
<section id="section-ubicacion" x-data="createGeneralidadesComponent()"
    class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-3 mb-6">
        <div
            class="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Ubicacion</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Datos geográficos del proyecto</p>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {{-- Departamento --}}
        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Departamento
            </label>
            <div class="relative">
                <select x-model="cover.ubigeo.department"
                    @change="cover.ubigeo.province = ''; cover.ubigeo.district = ''; updateLocation()"
                    class="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 px-4 py-3 pr-10 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 outline-none">
                    <option value="">Seleccione Departamento</option>
                    <template x-for="dept in departments" :key="dept">
                        <option :value="dept" x-text="dept"></option>
                    </template>
                </select>
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor"
                        stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>

        {{-- Provincia --}}
        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Provincia
            </label>
            <div class="relative">
                <select x-model="cover.ubigeo.province" @change="cover.ubigeo.district = ''; updateLocation()"
                    :disabled="!cover.ubigeo.department"
                    class="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 px-4 py-3 pr-10 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">Seleccione Provincia</option>
                    <template x-for="prov in provinces" :key="prov">
                        <option :value="prov" x-text="prov"></option>
                    </template>
                </select>
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor"
                        stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>

        {{-- Distrito --}}
        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Distrito
            </label>
            <div class="relative">
                <select x-model="cover.ubigeo.district" @change="updateLocation()" :disabled="!cover.ubigeo.province"
                    class="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 px-4 py-3 pr-10 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">Seleccione Distrito</option>
                    <template x-for="dist in districts" :key="dist">
                        <option :value="dist" x-text="dist"></option>
                    </template>
                </select>
                <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor"
                        stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
</section>