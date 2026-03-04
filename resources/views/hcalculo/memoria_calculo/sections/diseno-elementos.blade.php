{{-- sections/diseno-elementos.blade.php - Sección de Diseño de Elementos --}}
<section id="section-diseno-elementos" x-data="createDisenoElementosComponent()"
    class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div class="flex items-center gap-3 mb-6">
        <div class="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Diseño de Elementos Estructurales</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Losas, vigas, columnas y otros elementos</p>
        </div>
    </div>

    <div class="space-y-4">
        <div class="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <p class="text-sm text-gray-700 dark:text-gray-300">Esta sección incluye el diseño de todos los elementos
                estructurales.</p>
        </div>

        {{-- Placeholder for structural element design --}}
        <div class="space-y-3">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Descripción de Diseño</label>
            <textarea rows="5" placeholder="Detalles del diseño estructural..."
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none resize-none"></textarea>
        </div>
    </div>
</section>
