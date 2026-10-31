<x-sheets.workbench sheet="distribucion-esfuerzos" title="Distribución de esfuerzos con la profundidad" entry="resources/js/adm_suelos.js"
    eyebrow="Herramientas de ingeniería / Mecánica de suelos" class="analysis-sheet" data-analysis-sheet
    description="Define la carga y la geometría de la cimentación. Consulta la variación del esfuerzo con la profundidad en gráficos de valores y porcentajes.">
    <x-sheets.panel title="Datos generales" number="01" description="Carga, profundidad y dimensiones de la cimentación." class="arco-input-panel">
        <form id="suelosForm">
            @csrf
            <div class="arco-fields">
                <x-sheets.fieldset title="Carga y desplante" note="Valores utilizados en la distribución de esfuerzos.">
                    <x-sheets.field id="q" label="Carga de terreno" symbol="q" value="3" unit="tn/m²" />
                    <x-sheets.field id="df" label="Profundidad de desplante" symbol="Df" value="1" unit="m" />
                </x-sheets.fieldset>
                <x-sheets.fieldset title="Geometría de la cimentación" note="Dimensiones de la superficie cargada.">
                    <x-sheets.field id="B" label="Ancho" symbol="B" value="1" unit="m" />
                    <x-sheets.field id="L" label="Longitud" symbol="L" value="1" unit="m" />
                </x-sheets.fieldset>
            </div>
            <div class="arco-calculate analysis-actions"><button class="pr-button" id="calcular" type="submit">Calcular distribución <span aria-hidden="true">→</span></button><p class="arco-note">Actualiza los gráficos después de cambiar los datos.</p></div>
        </form>
    </x-sheets.panel>
    <section class="arco-results analysis-results" aria-label="Resultados de distribución de esfuerzos">
        <x-sheets.panel title="Incremento de esfuerzos" number="02" description="Variación del esfuerzo con la profundidad."><div id="grafico1" class="analysis-plot"></div></x-sheets.panel>
        <x-sheets.panel title="Distribución porcentual" number="03" description="Comparación de la distribución relativa con la profundidad."><div id="grafico2" class="analysis-plot"></div></x-sheets.panel>
    </section>
</x-sheets.workbench>
