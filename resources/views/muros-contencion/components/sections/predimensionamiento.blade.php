<div class="section-container" x-data="{ expanded: true }">
    <button @click="expanded = !expanded" class="section-header">
        <h3 class="section-title text-gray-950 dark:text-gray-50">1. PREDIMENSIONAMIENTO</h3>
        <svg class="section-icon" :class="{ 'rotate-180': expanded }">
            <!-- Icono de expansión -->
        </svg>
    </button>

    <div x-show="expanded" x-collapse class="section-content">
        <!-- Contenido del predimensionamiento -->
        <div class="flex flex-col lg:flex-row gap-6">
            <!-- Gráfico -->
            <div class="chart-container">
                <div id="predimsMC" class="w-full h-96"></div>
            </div>

            <!-- Datos y Resultados -->
            <div class="results-container">
                <template x-for="result in results.predimensionamiento">
                    <!-- Mostrar resultados -->
                </template>
            </div>
        </div>
    </div>
</div>
