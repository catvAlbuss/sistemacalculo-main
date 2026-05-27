{{-- partials/sidebar-nav-md.blade.php - Sidebar rediseñado para Memoria Descriptiva --}}
<nav class="sticky top-6 flex flex-col gap-2" x-data="{ active: '{{ request()->routeIs('memoria-descriptiva.portada') ? 'portada' : (request()->routeIs('memoria-descriptiva.generalidades') ? 'generalidades' : (request()->routeIs('memoria-descriptiva.consideraciones') ? 'consideraciones' : (request()->routeIs('memoria-descriptiva.predimensionamiento') ? 'predimensionamiento' : (request()->routeIs('memoria-descriptiva.demolicion') ? 'demolicion' : 'portada'))) }}' }">
    
    <div class="mb-6 px-2">
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white text-center shadow-lg">
            <div class="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <p class="text-xs font-semibold opacity-90">Memoria</p>
            <p class="text-sm font-bold">Descriptiva</p>
        </div>
    </div>

    {{-- Portada --}}
    <a href="{{ route('memoria-descriptiva.portada') }}" 
       :class="active === 'portada' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md border-green-500' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'" 
       class="px-4 py-3 rounded-xl border transition-all duration-300 font-medium flex items-center gap-3 group">
        <span class="icon-container p-1.5 rounded-lg transition-all duration-300" :class="active === 'portada' ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/40 text-green-600 group-hover:bg-green-200'">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </span>
        <span class="text-sm">📄 Portada</span>
    </a>

    {{-- 1. GENERALIDADES --}}
    <a href="{{ route('memoria-descriptiva.generalidades') }}" 
       :class="active === 'generalidades' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md border-green-500' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'" 
       class="px-4 py-3 rounded-xl border transition-all duration-300 font-medium flex items-center gap-3 group">
        <span class="icon-container p-1.5 rounded-lg transition-all duration-300" :class="active === 'generalidades' ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/40 text-green-600 group-hover:bg-green-200'">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </span>
        <span class="text-sm">📋 1. GENERALIDADES</span>
    </a>

    {{-- 2. CONSIDERACIONES --}}
    <a href="{{ route('memoria-descriptiva.consideraciones') }}" 
       :class="active === 'consideraciones' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md border-green-500' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'" 
       class="px-4 py-3 rounded-xl border transition-all duration-300 font-medium flex items-center gap-3 group">
        <span class="icon-container p-1.5 rounded-lg transition-all duration-300" :class="active === 'consideraciones' ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/40 text-green-600 group-hover:bg-green-200'">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        </span>
        <span class="text-sm">⚙️ 2. CONSIDERACIONES</span>
    </a>

    {{-- 3. PREDIMENSIONAMIENTO --}}
    <a href="{{ route('memoria-descriptiva.predimensionamiento') }}" 
       :class="active === 'predimensionamiento' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md border-green-500' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'" 
       class="px-4 py-3 rounded-xl border transition-all duration-300 font-medium flex items-center gap-3 group">
        <span class="icon-container p-1.5 rounded-lg transition-all duration-300" :class="active === 'predimensionamiento' ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/40 text-green-600 group-hover:bg-green-200'">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        </span>
        <span class="text-sm">📐 3. PREDIMENSIONAMIENTO</span>
    </a>

    {{-- 4. DEMOLICIÓN --}}
    <a href="{{ route('memoria-descriptiva.demolicion') }}" 
       :class="active === 'demolicion' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md border-green-500' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'" 
       class="px-4 py-3 rounded-xl border transition-all duration-300 font-medium flex items-center gap-3 group">
        <span class="icon-container p-1.5 rounded-lg transition-all duration-300" :class="active === 'demolicion' ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/40 text-green-600 group-hover:bg-green-200'">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </span>
        <span class="text-sm">💥 4. DEMOLICIÓN</span>
    </a>

    {{-- Separador --}}
    <div class="my-4 border-t border-gray-200 dark:border-gray-700"></div>

    {{-- Botón Exportar --}}
    <button @click="exportWord()" :disabled="isExporting" 
        class="mt-2 w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        :class="isExporting ? 'bg-gray-400' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span x-text="isExporting ? 'Exportando...' : 'Exportar a Word'"></span>
    </button>

    {{-- Resumen Card --}}
    <div class="mt-6 p-4 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-lg">
        <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="font-bold text-sm">Resumen</h3>
        </div>
        <div class="space-y-2 text-xs">
            <div class="flex justify-between items-center">
                <span class="opacity-80">Módulos:</span>
                <span class="font-bold bg-white/20 px-2 py-0.5 rounded-full" x-text="$store.memoriaDescriptiva?.sections?.descripcionModulos?.modulos?.length || 0"></span>
            </div>
            <div class="flex justify-between items-center">
                <span class="opacity-80">Estado:</span>
                <span class="font-bold bg-white/20 px-2 py-0.5 rounded-full">Edición</span>
            </div>
        </div>
    </div>
</nav>