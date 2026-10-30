<x-sheets.workbench mathjax sheet="vigas-general" title="Diseño de vigas general" entry="resources/js/adm_vigas_general.js" class="beam-general"
    description="Define los materiales y los datos de cada tramo. Revisa la flexión positiva y negativa, selecciona el refuerzo y consulta el corte, la capacidad y la deflexión.">
    <x-sheets.panel title="Datos generales" description="Materiales y solicitaciones por tramo." number="01" class="arco-input-panel" data-sheet-inputs>
        <div class="arco-fields">
            <x-sheets.fieldset title="Materiales" note="Resistencias del concreto y del acero de refuerzo.">
                <x-sheets.field id="fc" label="Compresión del concreto" symbol="f′c" value="210" unit="kg/cm²" min="0.01" />
                <x-sheets.field id="fy" label="Fluencia del acero" symbol="fy" value="4200" unit="kg/cm²" min="0.01" />
            </x-sheets.fieldset>
            <x-sheets.fieldset title="Configuración de tramos" note="Al cambiar la cantidad, confirma la reconstrucción de la tabla.">
                <x-sheets.field id="num_tramos" label="Número de tramos" symbol="n" value="1" min="1" step="1" />
            </x-sheets.fieldset>
        </div>
        <div class="beam-matrix-panel">
            <h3>Geometría y solicitaciones</h3>
            <p class="arco-note">Edita las celdas con doble clic o pega los datos. Cada tramo contiene inicio, medio y final; la luz, base y altura se ingresan por tramo. Las unidades se indican en cada fila.</p>
            <div id="tablaContainer" class="beam-input-matrix" role="region" aria-label="Datos editables por tramo" tabindex="0"></div>
        </div>
        <div class="arco-calculate">
            <button class="pr-button" id="accionButton" type="button">Calcular diseño <span aria-hidden="true">→</span></button>
            <p class="arco-note">Recalcula después de editar los materiales o la tabla.</p>
        </div>
    </x-sheets.panel>
    <section class="arco-results" aria-label="Resultados del diseño de vigas general">
        <x-sheets.results-header status-id="beam-general-status"
            description="Requisitos, flexión, corte, capacidad y deflexión. Desplaza las tablas para revisar todos los tramos."
            :exports="['exportPdfButton'=>'Exportar PDF','exportImageButton'=>'Exportar imagen']" />
        <div id="vigasgn" class="arco-sheet beam-sheet beam-export">
            <div class="beam-report-title"><h2>Diseño de vigas general</h2><p>Concreto armado · Diseño por tramos</p></div>
            <div id="vigas_general" class="arco-result-sections">
                <div class="pr-panel beam-results-empty"><p class="arco-note">Los resultados aparecerán al calcular. Incluyen el refuerzo positivo y negativo y las verificaciones por tramo.</p></div>
            </div>
        </div>
    </section>
</x-sheets.workbench>
