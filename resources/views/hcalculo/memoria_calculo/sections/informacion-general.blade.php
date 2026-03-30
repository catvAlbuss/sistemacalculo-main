{{-- sections/informacion-general.blade.php - Sección de Información General --}}
<section id="section-info-general" x-data="createGeneralidadesComponent()"
    class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-3 mb-2">
        <div class="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Información General</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Datos básicos del proyecto</p>
        </div>
    </div>

    {{-- Tipo de Memoria --}}
    <div
        class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
        <label class="text-sm font-bold text-blue-700 dark:text-blue-300 block mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Tipo de Memoria de Cálculo
        </label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <label class="cursor-pointer group">
                <input type="radio" x-model="cover.reportType" value="CASA" class="hidden">
                <div class="p-6 rounded-xl border-2 transition-all duration-300"
                    :class="cover.reportType === 'CASA' ?
                        'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105' :
                        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-400 hover:shadow-md'">
                    <div class="flex items-center gap-2">
                        <div class="p-3 rounded-lg"
                            :class="cover.reportType === 'CASA' ? 'bg-white/20' :
                                'bg-blue-100 dark:bg-blue-900/40'">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                :class="cover.reportType === 'CASA' ? 'text-white' : 'text-blue-600'" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <div class="flex-1">
                            <div class="font-bold text-sm mb-1">Vivienda privada</div>
                            <div class="text-sm opacity-80">Proyecto residencial con 1 imagen</div>
                        </div>
                    </div>
                </div>
            </label>

            <label class="cursor-pointer group">
                <input type="radio" x-model="cover.reportType" value="MODULOS" class="hidden">
                <div class="p-6 rounded-xl border-2 transition-all duration-300"
                    :class="cover.reportType === 'MODULOS' ?
                        'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-105' :
                        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-indigo-400 hover:shadow-md'">
                    <div class="flex items-center gap-2">
                        <div class="p-3 rounded-lg"
                            :class="cover.reportType === 'MODULOS' ? 'bg-white/20' :
                                'bg-indigo-100 dark:bg-indigo-900/40'">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                :class="cover.reportType === 'MODULOS' ? 'text-white' : 'text-indigo-600'"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div class="flex-1">
                            <div class="font-bold text-sm mb-1">Módulos</div>
                            <div class="text-sm opacity-80">Proyecto modular con 2 imágenes</div>
                        </div>
                    </div>
                </div>
            </label>
        </div>
    </div>

    {{-- Formulario Principal --}}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Título
            </label>
            <input type="text" x-model="cover.title" placeholder="Ej: Memoria de Cálculo Estructural"
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Subtítulo
            </label>
            <input type="text" x-model="cover.subtitle" placeholder="Ej: Edificio Multifamiliar"
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
        </div>

        <div class="col-span-2 space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Proyecto
            </label>
            <textarea x-model="cover.project" rows="3" placeholder="Descripción del proyecto..."
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"></textarea>
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fecha
            </label>
            <input type="date" x-model="cover.date"
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
        </div>

        <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Elaborado por
            </label>
            <input type="text" x-model="cover.preparedBy" placeholder="Nombre del profesional"
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
        </div>
    </div>

    {{-- Sección Imágenes Portada --}}
    <div class="py-4 border-t border-gray-200 dark:border-gray-700 mt-6">
        @include('hcalculo.memoria_calculo.partials.cover-images')
    </div>
</section>