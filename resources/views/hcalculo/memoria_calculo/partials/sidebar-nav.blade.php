{{-- partials/sidebar-nav.blade.php - Sidebar de navegación --}}
<nav class="sticky top-6 flex flex-col gap-2" x-data="{ activeSection: 'section-info-general' }">
    
    <a href="#section-info-general" @click="activeSection = 'section-info-general'"
        :class="activeSection === 'section-info-general' ? 'section-active' : ''"
        class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
        <span class="icon-container p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </span>
        <span>Información General</span>
    </a>

    <a href="#section-ubicacion" @click="activeSection = 'section-ubicacion'"
        :class="activeSection === 'section-ubicacion' ? 'section-active' : ''"
        class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
        <span class="icon-container p-1.5 bg-green-100 dark:bg-green-900/40 text-green-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
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
        <span class="icon-container p-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        </span>
        <span>Parámetros Sísmicos</span>
    </a>

    <a href="#section-tabla-resumen" @click="activeSection = 'section-tabla-resumen'"
        :class="activeSection === 'section-tabla-resumen' ? 'section-active' : ''"
        class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
        <span class="icon-container p-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
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
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        </span>
        <span>Material de Diseño</span>
    </a>

    <a href="#section-analisis-cargas" @click="activeSection = 'section-analisis-cargas'"
        :class="activeSection === 'section-analisis-cargas' ? 'section-active' : ''"
        class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
        <span class="icon-container p-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
        </span>
        <span>Análisis de Cargas</span>
    </a>

    <a href="#section-analisis-sismico" @click="activeSection = 'section-analisis-sismico'"
        :class="activeSection === 'section-analisis-sismico' ? 'section-active' : ''"
        class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
        <span class="icon-container p-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </span>
        <span>Análisis Sísmico</span>
    </a>

    <a href="#section-diseno-elementos" @click="activeSection = 'section-diseno-elementos'"
        :class="activeSection === 'section-diseno-elementos' ? 'section-active' : ''"
        class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
        <span class="icon-container p-1.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        </span>
        <span>Diseño de Elementos</span>
    </a>
    <!-- DISEÑO DE ESTRUCTURA METÁLICA -->
    <a href="#section-diseno-estructura" @click="activeSection = 'section-diseno-estructura'"
        :class="activeSection === 'section-diseno-estructura' ? 'section-active' : ''"
        class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
        <span class="icon-container p-1.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        </span>
        <span>Diseño de Estructura Metálica</span>
    </a>

    <!-- CONCLUSIONES Y RECOMENDACIONES -->
    <a href="#section-conclusiones-recomendaciones" @click="activeSection = 'section-conclusiones-recomendaciones'"
        :class="activeSection === 'section--conclusiones-recomendaciones' ? 'section-active' : ''"
        class="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-transparent hover:border-blue-500 transition-all font-medium text-gray-700 dark:text-gray-300 flex items-center gap-3">
        <span class="icon-container p-1.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
            </svg>
        </span>
        <span>Conclusiones y Recomendaciones</span>
    </a>

    {{-- Resumen Card --}}
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
