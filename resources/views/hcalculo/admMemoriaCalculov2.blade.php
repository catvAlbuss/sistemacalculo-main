<x-calc-layout title="">
    <style>
        html {
            scroll-behavior: smooth;
        }

        .section-active {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .section-active .icon-container {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
    </style>

    <div class="py-2" x-data="memoriaCalculo">
        <div class="container mx-auto px-2 max-w-full">
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tracking-tight">Memoria de
                        CÃ¡lculo</h1>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">GeneraciÃ³n de reportes estructurales profesionales
                    </p>
                </div>

            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <!-- Sidebar / Navigation -->
                <div class="lg:col-span-3 space-y-4">
                    <nav class="sticky top-6 flex flex-col gap-2" x-data="{ activeSection: 'section-info-general' }">
                        <a href="#section-info-general" @click="activeSection = 'section-info-general'"
                            :class="activeSection === 'section-info-general' ? 'section-active' : ''"
                            class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
                            <span class="icon-container p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            <span>Información General</span>
                        </a>

                        <a href="#section-ubicacion" @click="activeSection = 'section-ubicacion'"
                            :class="activeSection === 'section-ubicacion' ? 'section-active' : ''"
                            class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
                            <span
                                class="icon-container p-1.5 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </span>
                            <span>Ubicación</span>
                        </a>

                        <a href="#section-parametros" @click="activeSection = 'section-parametros'"
                            :class="activeSection === 'section-parametros' ? 'section-active' : ''"
                            class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
                            <span
                                class="icon-container p-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </span>
                            <span>Parámetros Sí­smicos</span>
                        </a>

                        <a href="#section-tabla-resumen" @click="activeSection = 'section-tabla-resumen'"
                            :class="activeSection === 'section-tabla-resumen' ? 'section-active' : ''"
                            class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
                            <span
                                class="icon-container p-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </span>
                            <span>Tabla Resumen (1.4)</span>
                        </a>

                        <a href="#section-material-diseno" @click="activeSection = 'section-material-diseno'"
                            :class="activeSection === 'section-material-diseno' ? 'section-active' : ''"
                            class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
                            <span class="icon-container p-1.5 bg-teal-100 dark:bg-teal-900/40 text-teal-600 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </span>
                            <span>Material de Diseño (1.5)</span>
                        </a>

                        <a href="#section-analisis-carga-estructural"
                            @click="activeSection = 'section-analisis-carga-estructural'"
                            :class="activeSection === 'section-analisis-carga-estructural' ? 'section-active' : ''"
                            class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-normal text-gray-700 dark:text-gray-300 flex items-center gap-3">
                            <span class="icon-container p-1.5 bg-teal-100 dark:bg-teal-900/40 text-teal-600 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </span>
                            <span>Análisis de Cargas Estructurales (2)</span>
                        </a>

                        <div class="flex items-center gap-3">
                            <button type="button" @click="exportWord()" :disabled="isExporting"
                                class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-60">
                                <template x-if="!isExporting">
                                    <span class="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Descargar Word
                                    </span>
                                </template>
                                <template x-if="isExporting">
                                    <span class="flex items-center gap-2">
                                        <svg class="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10"
                                                stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                            </path>
                                        </svg>
                                        Generando...
                                    </span>
                                </template>
                            </button>
                        </div>

                        <div
                            class="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20">
                            <h3 class="font-bold text-lg mb-2">Resumen</h3>
                            <div class="space-y-3 text-sm opacity-90">
                                <div class="flex justify-between">
                                    <span>Secciones:</span>
                                    <span class="font-bold" x-text="document.sections.length"></span>
                                </div>
                                <div class="flex justify-between">
                                    <span>Pisos:</span>
                                    <span class="font-bold" x-text="floors"></span>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>

                <!-- Main Content Area -->
                <div class="lg:col-span-9 space-y-4">
                    <!-- Section: InformaciÃ³n General -->
                    <section id="section-info-general"
                        class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-3 mb-2">
                            <div
                                class="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Información General
                                </h2>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Datos básicos del proyecto</p>
                            </div>
                        </div>

                        <!-- Tipo de Memoria -->
                        <div
                            class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                            <label class="text-sm font-bold text-blue-700 dark:text-blue-300 block mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline mr-2" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
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
                                                    :class="cover.reportType === 'CASA' ? 'text-white' : 'text-blue-600'"
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            </div>
                                            <div class="flex-1">
                                                <div class="font-bold text-sm mb-1">Casa</div>
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
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <div class="flex-1">
                                                <div class="font-bold text-sm mb-1">MÃ³dulos</div>
                                                <div class="text-sm opacity-80">Proyecto modular con 2 imÃ¡genes</div>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Formulario Principal -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    Título
                                </label>
                                <input type="text" x-model="cover.title"
                                    placeholder="Ej: Memoria de CÃ¡lculo Estructural"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    Subtítulo
                                </label>
                                <input type="text" x-model="cover.subtitle"
                                    placeholder="Ej: Edificio Multifamiliar"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                            </div>

                            <div class="col-span-2 space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Proyecto
                                </label>
                                <textarea x-model="cover.project" rows="3" placeholder="DescripciÃ³n del proyecto..."
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"></textarea>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Elaborado por
                                </label>
                                <input type="text" x-model="cover.preparedBy" placeholder="Nombre del profesional"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none">
                            </div>
                        </div>

                        <!--Seccion imagen portada-->
                        <div class="py-4 border-t border-gray-200 dark:border-gray-700">
                            <!-- Section: ImÃ¡genes Portada -->
                            <div
                                class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                <div class="flex items-center gap-3 mb-6">
                                    <div
                                        class="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Imágenes de
                                            Portada
                                        </h2>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Fotografías principales del
                                            proyecto</p>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8"
                                    :class="cover.reportType === 'MODULOS' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'">
                                    <!-- Image 1 -->
                                    <div class="space-y-3">
                                        <div class="flex items-center justify-between">
                                            <label class="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                <span
                                                    x-text="cover.reportType === 'MODULOS' ? 'Imagen de MÃ³dulo 1' : 'Imagen Principal'"></span>
                                            </label>
                                            <button type="button" x-show="previews.coverImage"
                                                @click="removeImage('coverImage')"
                                                class="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Eliminar
                                            </button>
                                        </div>
                                        <div class="relative group">
                                            <template x-if="previews.coverImage">
                                                <div
                                                    class="relative h-64 w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                                                    <img :src="previews.coverImage"
                                                        class="max-h-full max-w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105">
                                                </div>
                                            </template>
                                            <template x-if="!previews.coverImage">
                                                <label
                                                    class="flex flex-col items-center justify-center h-64 w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
                                                    <div
                                                        class="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8"
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <span
                                                        class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Click
                                                        para subir imagen</span>
                                                    <span class="text-xs text-gray-500">PNG, JPG hasta 10MB</span>
                                                    <input type="file" accept="image/*"
                                                        @change="handleImageChange('coverImage', $event)"
                                                        class="hidden">
                                                </label>
                                            </template>
                                        </div>
                                    </div>

                                    <!-- Image 2 (Solo para MODULOS) -->
                                    <div class="space-y-3" x-show="cover.reportType === 'MODULOS'" x-transition>
                                        <div class="flex items-center justify-between">
                                            <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Imagen de
                                                Módulo
                                                2</label>
                                            <button type="button" x-show="previews.coverImage2"
                                                @click="removeImage('coverImage2')"
                                                class="text-red-500 text-xs font-semibold hover:underline flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Eliminar
                                            </button>
                                        </div>
                                        <div class="relative group">
                                            <template x-if="previews.coverImage2">
                                                <div
                                                    class="relative h-64 w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                                                    <img :src="previews.coverImage2"
                                                        class="max-h-full max-w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105">
                                                </div>
                                            </template>
                                            <template x-if="!previews.coverImage2">
                                                <label
                                                    class="flex flex-col items-center justify-center h-64 w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
                                                    <div
                                                        class="p-4 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8"
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <span
                                                        class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Click
                                                        para subir imagen</span>
                                                    <span class="text-xs text-gray-500">PNG, JPG hasta 10MB</span>
                                                    <input type="file" accept="image/*"
                                                        @change="handleImageChange('coverImage2', $event)"
                                                        class="hidden">
                                                </label>
                                            </template>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Section: UbicaciÃ³n -->
                    <section id="section-ubicacion"
                        class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Ubicacion</h2>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Datos geogrÃ¡ficos del proyecto</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <!-- Departamento -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none"
                                            stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <!-- Provincia -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    Provincia
                                </label>
                                <div class="relative">
                                    <select x-model="cover.ubigeo.province"
                                        @change="cover.ubigeo.district = ''; updateLocation()"
                                        :disabled="!cover.ubigeo.department"
                                        class="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 px-4 py-3 pr-10 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                                        <option value="">Seleccione Provincia</option>
                                        <template x-for="prov in provinces" :key="prov">
                                            <option :value="prov" x-text="prov"></option>
                                        </template>
                                    </select>
                                    <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none"
                                            stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <!-- Distrito -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Distrito
                                </label>
                                <div class="relative">
                                    <select x-model="cover.ubigeo.district" @change="updateLocation()"
                                        :disabled="!cover.ubigeo.province"
                                        class="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 px-4 py-3 pr-10 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed">
                                        <option value="">Seleccione Distrito</option>
                                        <template x-for="dist in districts" :key="dist">
                                            <option :value="dist" x-text="dist"></option>
                                        </template>
                                    </select>
                                    <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none"
                                            stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Section: ParÃ¡metros SÃ­smicos -->
                    <section id="section-parametros"
                        class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">ParÃ¡metros SÃ­smicos
                                </h2>
                                <p class="text-sm text-gray-500 dark:text-gray-400">ConfiguraciÃ³n estructural del
                                    proyecto</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Factor Suelo
                                </label>
                                <select x-model="cover.soilFactor"
                                    class="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 px-4 py-3 pr-10 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 outline-none">
                                    <option value="S0">S0</option>
                                    <option value="S1">S1</option>
                                    <option value="S2">S2</option>
                                    <option value="S3">S3</option>
                                </select>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Periodos
                                </label>
                                <select x-model="cover.soilPeriod"
                                    class="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 px-4 py-3 pr-10 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 outline-none">
                                    <option value="Tp">Tp</option>
                                    <option value="Tl">Tl</option>
                                </select>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    CategorÃ­a
                                </label>
                                <select x-model="cover.buildingCategory" @change="updateBuildingCategory()"
                                    class="w-full appearance-none bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 px-4 py-3 pr-10 rounded-xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 outline-none">
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Factor U
                                </label>
                                <input type="text" x-model="cover.importanceFactorU" readonly
                                    class="w-full bg-gray-100 dark:bg-gray-700/60 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 p-3 rounded-xl outline-none cursor-not-allowed">
                            </div>

                            <div class="col-span-2 md:col-span-3 lg:col-span-5 space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                    <!-- Section: Tabla Resumen -->
                    <section id="section-tabla-resumen"
                        class="scroll-mt-2 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Tabla Resumen (SecciÃ³n
                                    1.4)</h2>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Detalles estructurales del proyecto
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    # de Pisos
                                </label>
                                <input type="number" x-model.number="floors" @input="updateFloors()" min="1"
                                    max="20"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none">
                            </div>

                            <div class="col-span-full space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Uso (Detalle por pisos)
                                </label>
                                <textarea x-model="structuralDetails.usage" rows="4"
                                    placeholder="Ej: 1Â° PISO: Local comercial&#10;2Â° PISO: Consultorio mÃ©dico..."
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none font-mono text-sm"></textarea>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Sistema Estructural en X
                                </label>
                                <input type="text" x-model="structuralDetails.structuralSystemX"
                                    placeholder="Ej: PÃ³rticos"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Sistema Estructural en Y
                                </label>
                                <input type="text" x-model="structuralDetails.structuralSystemY"
                                    placeholder="Ej: Muros de corte"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Elementos Verticales
                                </label>
                                <input type="text" x-model="structuralDetails.verticalElements"
                                    placeholder="Ej: Columnas, Muros"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Elementos Horizontales
                                </label>
                                <input type="text" x-model="structuralDetails.horizontalElements"
                                    placeholder="Ej: Vigas, Losas"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
                            </div>

                            <div class="col-span-full space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Techo
                                </label>
                                <input type="text" x-model="structuralDetails.roof"
                                    placeholder="Ej: Losa aligerada"
                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
                            </div>
                        </div>

                        <!-- Section: ImÃ¡genes por Niveles -->
                        <div class="py-4 border-t border-gray-200 dark:border-gray-700">
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <template x-for="(floor, index) in Array.from({length: parseInt(floors)})"
                                    :key="index">
                                    <div
                                        class="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/40 rounded-2xl border-2 border-gray-200 dark:border-gray-700 space-y-3 hover:shadow-lg transition-shadow">
                                        <div class="flex items-center justify-between">
                                            <label
                                                class="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <span
                                                    class="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center text-xs font-bold"
                                                    x-text="index + 1"></span>
                                                <span x-text="'Nivel ' + (index + 1)"></span>
                                            </label>
                                            <button type="button" x-show="previews.floorImages[index]"
                                                @click="removeFloorImage(index)"
                                                class="text-red-500 text-xs font-semibold hover:underline">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div class="relative group h-48">
                                            <template x-if="previews.floorImages[index]">
                                                <div
                                                    class="h-full w-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center">
                                                    <img :src="previews.floorImages[index]"
                                                        class="max-h-full max-w-full object-contain p-2 group-hover:scale-105 transition-transform">
                                                </div>
                                            </template>
                                            <template x-if="!previews.floorImages[index]">
                                                <label
                                                    class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all">
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                        class="h-10 w-10 text-gray-400 mb-2" fill="none"
                                                        viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    <span class="text-xs font-medium text-gray-500">Subir
                                                        Plano</span>
                                                    <input type="file" accept="image/*"
                                                        @change="handleFloorImageChange(index, $event)"
                                                        class="hidden">
                                                </label>
                                            </template>
                                        </div>
                                        <p class="text-xs text-gray-500 text-center italic leading-tight"
                                            x-text="'Esquema general en planta ' + (index + 1) + 'Â° nivel'"></p>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </section>

                    <!-- Section: Material de Diseno -->
                    <section id="section-material-diseno"
                        class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Material de Diseno
                                    (Seccion 1.5)</h2>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Propiedades de los materiales</p>
                            </div>
                        </div>

                        <div class="space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div
                                    class="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 space-y-3">
                                    <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200">Acero estructural
                                        (ASTM A36)</h3>
                                    <div class="space-y-2">
                                        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fy
                                            (kg/cm2)</label>
                                        <input x-model="structuralDetails.materialDesign.aceroEstructural.fy"
                                            type="text"
                                            class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">E
                                            (kg/cm2)</label>
                                        <input x-model="structuralDetails.materialDesign.aceroEstructural.e"
                                            type="text"
                                            class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fc
                                            (kg/cm2)</label>
                                        <input x-model="structuralDetails.materialDesign.aceroEstructural.fc"
                                            type="text"
                                            class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                                    </div>
                                </div>

                                <div
                                    class="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 space-y-3">
                                    <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200">Acero corrugado
                                        (ASTM A605)</h3>
                                    <div class="space-y-2">
                                        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fy
                                            (kg/cm2)</label>
                                        <input x-model="structuralDetails.materialDesign.aceroCorrugado.fy"
                                            type="text"
                                            class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">E
                                            (kg/cm2)</label>
                                        <input x-model="structuralDetails.materialDesign.aceroCorrugado.e"
                                            type="text"
                                            class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fc
                                            (kg/cm2)</label>
                                        <input x-model="structuralDetails.materialDesign.aceroCorrugado.fc"
                                            type="text"
                                            class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                                    </div>
                                </div>

                                <div
                                    class="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30 space-y-3">
                                    <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200">Concreto</h3>
                                    <div class="space-y-2">
                                        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fy
                                            (kg/cm2)</label>
                                        <input x-model="structuralDetails.materialDesign.concreto.fy" type="text"
                                            class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">E
                                            (kg/cm2)</label>
                                        <input x-model="structuralDetails.materialDesign.concreto.e" type="text"
                                            class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Fc
                                            (kg/cm2)</label>
                                        <input x-model="structuralDetails.materialDesign.concreto.fc" type="text"
                                            class="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="space-y-3">
                                    <div class="flex items-center justify-between">
                                        <label class="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Figura 11 - Propiedad de refuerzo fy=4200 kg/cm2
                                        </label>
                                        <button type="button" x-show="previews.materialImage1"
                                            @click="removeImage('materialImage1')"
                                            class="text-red-500 text-xs font-semibold hover:underline">x</button>
                                    </div>
                                    <div class="relative group">
                                        <template x-if="previews.materialImage1">
                                            <div
                                                class="relative h-56 w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                                                <img :src="previews.materialImage1"
                                                    class="max-h-full max-w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105">
                                            </div>
                                        </template>
                                        <template x-if="!previews.materialImage1">
                                            <label
                                                class="flex flex-col items-center justify-center h-56 w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
                                                <span class="text-sm font-medium text-gray-500">Subir Figura 11</span>
                                                <input type="file" accept="image/*"
                                                    @change="handleImageChange('materialImage1', $event)"
                                                    class="hidden">
                                            </label>
                                        </template>
                                    </div>
                                </div>

                                <div class="space-y-3">
                                    <div class="flex items-center justify-between">
                                        <label class="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            Figura 12 - Propiedad del concreto f'c=210kg/cm2
                                        </label>
                                        <button type="button" x-show="previews.materialImage2"
                                            @click="removeImage('materialImage2')"
                                            class="text-red-500 text-xs font-semibold hover:underline">x</button>
                                    </div>
                                    <div class="relative group">
                                        <template x-if="previews.materialImage2">
                                            <div
                                                class="relative h-56 w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                                                <img :src="previews.materialImage2"
                                                    class="max-h-full max-w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105">
                                            </div>
                                        </template>
                                        <template x-if="!previews.materialImage2">
                                            <label
                                                class="flex flex-col items-center justify-center h-56 w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
                                                <span class="text-sm font-medium text-gray-500">Subir Figura 12</span>
                                                <input type="file" accept="image/*"
                                                    @change="handleImageChange('materialImage2', $event)"
                                                    class="hidden">
                                            </label>
                                        </template>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                    Descripcion General (entre Figura 12 y Figura 13)
                                </label>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    Puedes usar texto y vinetas como en el ejemplo de combinaciones.
                                </p>
                                <textarea x-model="structuralDetails.generalDescription" rows="7"
                                    placeholder="Para realizar el diseno de los elementos..."
                                    class="w-full bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 text-gray-900 dark:text-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none font-medium"></textarea>
                            </div>

                            <div class="space-y-3">
                                <div class="flex items-center justify-between">
                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Figura 13 - Propiedades del acero
                                    </label>
                                    <button type="button" x-show="previews.materialImage3"
                                        @click="removeImage('materialImage3')"
                                        class="text-red-500 text-xs font-semibold hover:underline">x</button>
                                </div>
                                <div class="relative group">
                                    <template x-if="previews.materialImage3">
                                        <div
                                            class="relative h-64 w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                                            <img :src="previews.materialImage3"
                                                class="max-h-full max-w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105">
                                        </div>
                                    </template>
                                    <template x-if="!previews.materialImage3">
                                        <label
                                            class="flex flex-col items-center justify-center h-64 w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group">
                                            <span class="text-sm font-medium text-gray-500">Subir Figura 13</span>
                                            <input type="file" accept="image/*"
                                                @change="handleImageChange('materialImage3', $event)" class="hidden">
                                        </label>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Section: Analisis de carga Estructural-->
                    <section id="section-analisis-carga-estructural"
                        class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-3 mb-6">
                            <div
                                class="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">2. ANALISIS DE CARGAS
                                    ESTRUCTURAL (Seccion 2)</h2>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Carga de imagenes y datos para la
                                    estructura Word</p>
                            </div>
                        </div>
                        <div class="flex flex-row gap-4">
                            <div class="space-y-8">
                                <div class="space-y-4">
                                    <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">2.1 Modelo
                                        estructural
                                    </h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Cargar 1 imagen para la figura
                                        14 - Modelo matemático en 3D.</p>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <template x-for="index in [0]" :key="'modelo-' + index">
                                            <div class="space-y-2">
                                                <div class="flex items-center justify-between">
                                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                                        x-text="'Figura 14 - Modelo matemático en 3D'"></label>
                                                    <button type="button"
                                                        x-show="previews.modeloMatematico3DImages[index]"
                                                        @click="removeArrayImage('modeloMatematico3DImages', index)"
                                                        class="text-red-500 text-xs font-semibold hover:underline">x</button>
                                                </div>
                                                <div class="relative group h-44">
                                                    <template x-if="previews.modeloMatematico3DImages[index]">
                                                        <div
                                                            class="h-full w-full rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                                                            <img :src="previews.modeloMatematico3DImages[index]"
                                                                class="max-h-full max-w-full object-contain p-2">
                                                        </div>
                                                    </template>
                                                    <template x-if="!previews.modeloMatematico3DImages[index]">
                                                        <label
                                                            class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                                                            <span class="text-sm font-medium text-gray-500 mb-1">Subir
                                                                imagen</span>
                                                            <input type="file" accept="image/*"
                                                                @change="handleArrayImageChange('modeloMatematico3DImages', index, $event)"
                                                                class="hidden">
                                                        </label>
                                                    </template>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>

                                <div class="space-y-4">
                                    <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">2.2 Casos de carga
                                    </h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Cargar 2 imágenes para las
                                        figuras 15 y 16 de espectros de pseudoaceleraciones en direcciones X e Y.</p>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <template x-for="index in [0,1]" :key="'modelo-' + index">
                                            <div class="space-y-2">
                                                <div class="flex items-center justify-between">
                                                    <label class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                                        x-text="['Figura 15 - Espectro de Pseudoaceleraciones en dirección X', 'Figura 16 - Espectro de Pseudoaceleraciones en dirección Y'][index]"></label>
                                                    <button type="button"
                                                        x-show="previews.espectroPseudoaceleracionesImages[index]"
                                                        @click="removeArrayImage('espectroPseudoaceleracionesImages', index)"
                                                        class="text-red-500 text-xs font-semibold hover:underline">x</button>
                                                </div>
                                                <div class="relative group h-44">
                                                    <template x-if="previews.espectroPseudoaceleracionesImages[index]">
                                                        <div
                                                            class="h-full w-full rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                                                            <img :src="previews.espectroPseudoaceleracionesImages[index]"
                                                                class="max-h-full max-w-full object-contain p-2">
                                                        </div>
                                                    </template>
                                                    <template
                                                        x-if="!previews.espectroPseudoaceleracionesImages[index]">
                                                        <label
                                                            class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                                                            <span class="text-sm font-medium text-gray-500 mb-1">Subir
                                                                imagen</span>
                                                            <input type="file" accept="image/*"
                                                                @change="handleArrayImageChange('espectroPseudoaceleracionesImages', index, $event)"
                                                                class="hidden">
                                                        </label>
                                                    </template>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>

                                {{-- Seccion 2.4 --}}
                                <div class="space-y-6">
                                    <div class="space-y-4">
                                        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">2.4 METRADO DE
                                            CARGAS</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Cargar figuras 18 a 21.</p>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <template x-for="index in [0, 1, 2, 3]" :key="'metrado-' + index">
                                                <div class="space-y-2">
                                                    <div class="flex items-center justify-between">
                                                        <label
                                                            class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                                            x-text="['Figura 18 - Cargas muertas por metro cuadrado (tonf/m2)', 'Figura 19 - Carga viva entrepiso por metro cuadrado (tonf/m2)', 'Figura 20 - Carga viva techo por metro cuadrado (tonf/m2)', 'Figura 21 - Carga muerta por metro lineal debido a tabiquería (tonf/m)'][index]"></label>
                                                        <button type="button"
                                                            x-show="previews.metradoCargasImages[index]"
                                                            @click="removeArrayImage('metradoCargasImages', index)"
                                                            class="text-red-500 text-xs font-semibold hover:underline">x</button>
                                                    </div>
                                                    <div class="relative group h-44">
                                                        <template x-if="previews.metradoCargasImages[index]">
                                                            <div
                                                                class="h-full w-full rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                                                                <img :src="previews.metradoCargasImages[index]"
                                                                    class="max-h-full max-w-full object-contain p-2">
                                                            </div>
                                                        </template>
                                                        <template x-if="!previews.metradoCargasImages[index]">
                                                            <label
                                                                class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                                                                <span
                                                                    class="text-sm font-medium text-gray-500 mb-1">Subir
                                                                    imagen</span>
                                                                <input type="file" accept="image/*"
                                                                    @change="handleArrayImageChange('metradoCargasImages', index, $event)"
                                                                    class="hidden">
                                                            </label>
                                                        </template>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </div>

                                    <div class="space-y-4">
                                        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">2.5 CARGA DE
                                            VIENTO</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Las 2 imágenes de viento y
                                            factores de forma (C) se insertan internamente en el reporte. Solo se edita
                                            la velocidad del viento.</p>
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div class="space-y-2 md:col-span-1">
                                                <label
                                                    class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Carga
                                                    Viento</label>
                                                <input x-model="casoscarga.cargaviento" rows="4"
                                                    placeholder="75 km/h"
                                                    class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none resize-none">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="space-y-4">
                                        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">2.6 CARGAS
                                            APROXIMADAS - FIGURAS DE CIERRE</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Cargar figuras 22 a 25 (en
                                            salida se acomodan dos por hoja).</p>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <template x-for="index in [0, 1, 2, 3]" :key="'aprox-' + index">
                                                <div class="space-y-2">
                                                    <div class="flex items-center justify-between">
                                                        <label
                                                            class="text-sm font-bold text-gray-700 dark:text-gray-300"
                                                            x-text="['Figura 22 - Cargas muertas por metro cuadrado (kgf/m2)', 'Figura 23 - Cargas viva techo metro cuadrado (kgf/m2)', 'Figura 24 - Cargas viva viento positivo(kgf/m2)', 'Figura 25 - Cargas viva viento negativo(kgf/m2)'][index]"></label>
                                                        <button type="button"
                                                            x-show="previews.cargasAproximadasImages[index]"
                                                            @click="removeArrayImage('cargasAproximadasImages', index)"
                                                            class="text-red-500 text-xs font-semibold hover:underline">x</button>
                                                    </div>
                                                    <div class="relative group h-44">
                                                        <template x-if="previews.cargasAproximadasImages[index]">
                                                            <div
                                                                class="h-full w-full rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                                                                <img :src="previews.cargasAproximadasImages[index]"
                                                                    class="max-h-full max-w-full object-contain p-2">
                                                            </div>
                                                        </template>
                                                        <template x-if="!previews.cargasAproximadasImages[index]">
                                                            <label
                                                                class="flex flex-col items-center justify-center h-full w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                                                                <span
                                                                    class="text-sm font-medium text-gray-500 mb-1">Subir
                                                                    imagen</span>
                                                                <input type="file" accept="image/*"
                                                                    @change="handleArrayImageChange('cargasAproximadasImages', index, $event)"
                                                                    class="hidden">
                                                            </label>
                                                        </template>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </section>

                    <!-- Error Messages -->
                    <div x-show="errors.length > 0" x-transition
                        class="rounded-3xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900/30 p-6 flex flex-col gap-2">
                        <div class="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span class="font-bold text-lg">Se encontraron errores:</span>
                        </div>
                        <template x-for="error in errors" :key="error.id">
                            <p class="text-sm text-red-600 dark:text-red-400 pl-10 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                                <span x-text="error.message"></span>
                            </p>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @pushOnce('initscripts')
        <script src="https://unpkg.com/docx@7.8.2/build/index.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
        @vite('resources/js/memoria_calculo/index.js')
    @endPushOnce

</x-calc-layout>
