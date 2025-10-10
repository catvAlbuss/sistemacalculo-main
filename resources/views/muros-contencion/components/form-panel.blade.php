<div class="form-panel bg-white dark:bg-gray-800 shadow-lg text-gray-980 dark:text-gray-50 rounded-lg">
    <!-- Acordeón con Alpine.js -->
    <div x-data="{ activeAccordion: 'materiales' }">
        <!-- Sección Materiales -->
        <div class="accordion-section">
            <button @click="activeAccordion = activeAccordion === 'materiales' ? '' : 'materiales'"
                class="accordion-header">
                <span>MATERIALES</span>
                <svg class="accordion-icon" :class="{ 'rotate-180': activeAccordion === 'materiales' }">
                    <!-- Icono -->
                </svg>
            </button>
            <div x-show="activeAccordion === 'materiales'" x-collapse class="accordion-content">
                {{-- Concreto --}}
                <h2 class="text-gray-950 dark:text-gray-50 font-bold text-sm py-1">Concreto</h2>
                <x-inputmuros label="gc" id="gc" name="gc" type="text" value="2.4" />
                <x-inputmuros label="Fy" id="fy" name="fy" type="number" value="4200" />
                <x-inputmuros label="f'c" id="fc" name="fc" type="number" value="210" />

                {{-- Suelos --}}
                <h2 class="text-gray-950 dark:text-gray-50 font-bold text-sm py-1">Suelos</h2>
                <x-inputmuros label="SADM" id="sadm" name="sadm" type="number" value="20" />
                <x-inputmuros label="gs" id="gs" name="gs" type="text" value="1.83" />
                <x-inputmuros label="Ø" id="teta" name="teta" type="text" value="26.9" />
                <x-inputmuros label="z" id="z" name="z" type="text" value="0.00" />
                <x-inputmuros label="u" id="u" name="u" type="text" value="0.51" />
                <x-inputmuros label="1.3sADM" id="treesadm" name="treesadm" type="text" value="26" />
            </div>
        </div>

        <!-- Más secciones del acordeón -->
    </div>

    <!-- Botones de Acción -->
    <div class="form-actions">
        <button @click="calculateAll()" :disabled="ui.loading" class="btn btn-primary">
            <span x-show="!ui.loading">Generar</span>
            <span x-show="ui.loading">Calculando...</span>
        </button>

        {{-- <button @click="generatePDF()" class="btn btn-secondary">
            Generar PDF
        </button> --}}
    </div>
</div>
