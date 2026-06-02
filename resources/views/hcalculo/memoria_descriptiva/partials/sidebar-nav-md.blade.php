{{-- partials/sidebar-nav-md.blade.php --}}
<nav class="sticky top-6 flex flex-col gap-1">
    
    <div class="mb-4 px-4 py-3">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div>
                <p class="text-xs text-gray-500">Memoria</p>
                <p class="text-base font-bold text-gray-800 dark:text-gray-200">Descriptiva</p>
            </div>
        </div>
    </div>

    {{-- Portada --}}
    <a href="{{ route('calculadora.asistente.memoria-descriptiva.portada') }}" 
       class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3 {{ request()->routeIs('calculadora.asistente.memoria-descriptiva.portada') ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' }}">
        <span class="w-7 text-xl">📄</span>
        <span>Portada</span>
    </a>

    {{-- 1. GENERALIDADES --}}
    <a href="{{ route('calculadora.asistente.memoria-descriptiva.generalidades') }}" 
       class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3 {{ request()->routeIs('calculadora.asistente.memoria-descriptiva.generalidades') ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' }}">
        <span class="w-7 text-xl">📋</span>
        <span>1. Generalidades</span>
    </a>

    {{-- 2. CONSIDERACIONES --}}
    <a href="{{ route('calculadora.asistente.memoria-descriptiva.consideraciones') }}" 
       class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3 {{ request()->routeIs('calculadora.asistente.memoria-descriptiva.consideraciones') ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' }}">
        <span class="w-7 text-xl">⚙️</span>
        <span>2. Consideraciones</span>
    </a>

    {{-- 3. PREDIMENSIONAMIENTO --}}
    <a href="{{ route('calculadora.asistente.memoria-descriptiva.predimensionamiento') }}" 
       class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3 {{ request()->routeIs('calculadora.asistente.memoria-descriptiva.predimensionamiento') ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' }}">
        <span class="w-7 text-xl">📐</span>
        <span>3. Predimensionamiento</span>
    </a>

    {{-- 4. DEMOLICIÓN --}}
    <a href="{{ route('calculadora.asistente.memoria-descriptiva.demolicion') }}" 
       class="px-4 py-2.5 rounded-r-lg transition-all duration-200 text-base font-medium flex items-center gap-3 {{ request()->routeIs('calculadora.asistente.memoria-descriptiva.demolicion') ? 'bg-green-50 text-green-700 border-l-4 border-green-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' }}">
        <span class="w-7 text-xl">💥</span>
        <span>4. Demolición</span>
    </a>

    <div class="my-3 mx-4 border-t border-gray-200 dark:border-gray-700"></div>

    <button @click="exportWord()" :disabled="isExporting" 
        class="mx-4 mt-2 py-2.5 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        :class="isExporting ? 'bg-gray-400' : 'bg-green-700 hover:bg-green-800'">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-base" x-text="isExporting ? 'Exportando...' : 'Exportar a Word'"></span>
    </button>

    <div class="mt-4 mx-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
        <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="font-semibold text-sm text-gray-600 dark:text-gray-400">Resumen</h3>
        </div>
        <div class="flex justify-between text-sm">
            <span class="text-gray-500">Módulos:</span>
            <span class="font-bold" x-text="$store.memoriaDescriptiva?.sections?.descripcionModulos?.modulos?.length || 0"></span>
        </div>
    </div>
</nav>