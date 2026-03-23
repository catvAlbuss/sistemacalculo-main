{{-- sections/conclusiones-recomendaciones.blade.php - Sección de Diseño de Elementos --}}
<section id="section-conclusiones-recomendaciones" x-data="createConclusionesComponent()"
    class="scroll-mt-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">

    {{-- ENCABEZADO --}}
    <div class="flex items-center gap-3 mb-6">
        <div class="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-cyan-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
        </div>
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Conclusiones y recomendaciones</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Síntesis final del análisis estructural</p>
        </div>
    </div>

    <div class="space-y-4">
        <div class="space-y-3">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Conclusiones</label>
            <textarea x-model="$store.memoriaCalculo.sections.conclusiones.descripcion" rows="5" placeholder=". Conclusión 1&#10;. Conclusión 2&#10;.&#10;.&#10;."
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none resize-none"></textarea>
        </div>

        <div class="space-y-3">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Recomendaciones</label>
            <textarea x-model="$store.memoriaCalculo.sections.recomendaciones.descripcion" rows="5" placeholder=". Recomendación 1&#10;. Recomendación 2&#10;.&#10;.&#10;."
                class="w-full bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none resize-none"></textarea>        </div>
    </div>

</section>