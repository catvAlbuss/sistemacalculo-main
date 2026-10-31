@props(['version', 'entry'])
<x-sheets.workbench sheet="aligerados-v{{ $version }}" title="Aligerados v{{ $version }}" :entry="$entry" class="analysis-sheet" data-analysis-sheet
    description="Define los materiales y las propiedades de cada tramo. Revisa la geometría, las cargas, los diagramas de esfuerzos y el diseño del refuerzo en una misma hoja.">
    <x-sheets.panel title="Datos generales" number="01" description="Materiales, factores de carga y propiedades por tramo." class="arco-input-panel">
        <form id="fuerzasCortantesForm">
            @csrf
            <div class="arco-fields">
                <x-sheets.fieldset title="Materiales" note="Resistencias del concreto y del acero de refuerzo.">
                    <x-sheets.field id="fc" label="Compresión del concreto" symbol="f′c" value="210" min="0" unit="kg/cm²" />
                    <x-sheets.field id="Fy" label="Fluencia del acero" symbol="fy" value="4200" min="0" unit="kg/cm²" />
                </x-sheets.fieldset>
                <x-sheets.fieldset title="Cargas y ancho tributario" note="Factores de amplificación utilizados en el cálculo.">
                    <x-sheets.field id="frm" label="Factor de carga muerta" symbol="rm" value="1.4" min="0" />
                    <x-sheets.field id="frv" label="Factor de carga viva" symbol="rv" value="1.7" min="0" />
                    <x-sheets.field id="anchoTributario" label="Ancho tributario" value="0.4" unit="m" />
                </x-sheets.fieldset>
            </div>
            <div class="analysis-input-section">
                <h3>Propiedades por tramo</h3><p class="arco-note">Edita las celdas y utiliza los controles de la tabla para organizar los tramos. Desplaza la tabla para ver todas las columnas.</p>
                <div id="propiedades" class="analysis-matrix"></div>
            </div>
            <div class="arco-calculate analysis-actions">
                <button class="pr-button" id="calcular" type="submit">Calcular diseño <span aria-hidden="true">→</span></button>
                <button class="pr-button pr-button-secondary" id="generarPDF" type="button">Exportar reporte</button>
                <p class="arco-note">Recalcula cuando cambies los datos de entrada.</p>
            </div>
        </form>
    </x-sheets.panel>
    <section id="resultados" class="arco-results analysis-results" aria-label="Resultados del diseño de aligerados">
        <x-sheets.panel title="Geometría y cargas" number="02" description="Distribución de viguetas y cargas aplicadas.">
            @foreach(['viguetas'=>'Geometría de viguetas','cargaMuerta'=>'Carga muerta','cargaViva'=>'Carga viva'] as $id=>$label)
                <div class="analysis-result-block"><h3>{{ $label }}</h3><div id="{{ $id }}" class="analysis-diagram"></div></div>
            @endforeach
        </x-sheets.panel>
        <x-sheets.panel title="Diagramas de esfuerzos" number="03" description="Fuerza cortante y momento flector a lo largo de los tramos.">
            <div id="fuerzasCortantes" class="analysis-plot" aria-label="Diagrama de fuerzas cortantes"></div>
            <div id="momentosFlectores" class="analysis-plot" aria-label="Diagrama de momentos flectores"></div>
        </x-sheets.panel>
        <x-sheets.panel title="Diseño a flexión" number="04" description="Área de acero requerida, selección del refuerzo y disposición en los tramos.">
            <div class="analysis-result-block"><div id="T1" class="analysis-matrix"></div><div id="asd" class="analysis-diagram"></div></div>
        </x-sheets.panel>
        <x-sheets.panel title="Diseño por corte" number="05" description="Verificaciones y distribución del refuerzo por corte.">
            <div class="analysis-result-block"><div id="T2" class="analysis-matrix"></div><div id="vu" class="analysis-diagram"></div></div>
        </x-sheets.panel>
    </section>
</x-sheets.workbench>
