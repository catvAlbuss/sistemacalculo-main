@php
  $barras = ['0.28' => 'Ø 6 mm', '0.50' => 'Ø 8 mm', '0.71' => 'Ø 3/8"', '1.13' => 'Ø 12 mm', '1.27' => 'Ø 1/2"', '1.98' => 'Ø 5/8"', '2.85' => 'Ø 3/4"', '5.10' => 'Ø 1"', '7.92' => 'Ø 1 1/4"', '11.40' => 'Ø 1 1/2"'];
  // [id del contenedor Handsontable, título]. El motor monta cada grilla en su contenedor.
  $grillas = [
      ['diagramaxx', 'Diagrama de interacción con ϕ · dirección X-X'],
      ['diagramaex', 'Diagrama de interacción sin ϕ · dirección X-X'],
      ['diagramayy', 'Diagrama de interacción con ϕ · dirección Y-Y'],
      ['diagramaexy', 'Diagrama de interacción sin ϕ · dirección Y-Y'],
  ];
@endphp
<x-sheets.workbench sheet="columna" title="Diseño de columnas" entry="resources/js/adm_desing_columnas.js" auto
  description="Diseño de columnas de concreto armado: longitud arriostrada, condición de esbeltez, diagramas de interacción en ambas direcciones y diseño por corte.">
  <x-sheets.panel title="Datos generales" description="Materiales, geometría, tablas de análisis y datos para el diseño por corte." number="01" class="arco-input-panel" data-sheet-inputs>
    <form id="ColumnaF" action="{{ route('columacon') }}" method="post">
      @csrf
      <div class="arco-fields">
        <x-sheets.fieldset title="Materiales y geometría">
          <x-sheets.field id="piso" label="Cantidad de pisos" symbol="n" value="1" min="1" step="1" />
          <x-sheets.field id="fc" label="Compresión del concreto" symbol="f′c" value="210" unit="kg/cm²" min="0.01" />
          <x-sheets.field id="fy" label="Fluencia del acero" symbol="fy" value="4200" unit="kg/cm²" min="0.01" />
          <x-sheets.field id="altura" label="Altura" symbol="H" value="0" unit="cm" min="0" />
          <x-sheets.field id="L1" label="Longitud en el eje X" symbol="Lx" value="0" unit="cm" min="0" />
          <x-sheets.field id="L2" label="Longitud en el eje Y" symbol="Ly" value="0" unit="cm" min="0" />
          <x-sheets.field id="d" label="Peralte efectivo" symbol="d" value="0" unit="cm" min="0" />
        </x-sheets.fieldset>
      </div>
      <x-sheets.section title="Longitud arriostrada · dirección X-X">
        <div id="longitudArriostradaX"></div>
        <button class="pr-button pr-button-secondary" id="guardarTablaX" type="button">Guardar tabla</button>
      </x-sheets.section>
      <x-sheets.section title="Longitud arriostrada · dirección Y-Y">
        <div id="longitudArriostradaY"></div>
        <button class="pr-button pr-button-secondary" id="guardarTablaY" type="button">Guardar tabla</button>
      </x-sheets.section>
      <x-sheets.section title="Condición de esbeltez"><div id="Scrga"></div></x-sheets.section>
      @foreach ($grillas as [$id, $titulo])
        <x-sheets.section :title="$titulo"><div id="{{ $id }}"></div></x-sheets.section>
      @endforeach
      <div class="arco-fields">
        <x-sheets.fieldset title="Diseño por corte">
          <x-sheets.field id="CDEsbelZ" label="Condición de esbeltez" value="1" :options="['1' => 'Según norma', '1.01' => 'Biarticulada', '0.5' => 'Empotrada, desplazamiento impedido', '1.02' => 'Empotrada, desplazamiento permitido', '2' => 'Empotrada y libre']" />
          <x-sheets.field id="SEstru" label="Sistema estructural" value="Porticos" :options="['Porticos' => 'Pórticos', 'DualTipI' => 'Dual tipo I', 'DualTipII' => 'Dual tipo II', 'MEstructurales' => 'Muros estructurales']" />
          <x-sheets.field id="Tgrapas" label="Tipo de grapas" value="caso I" :options="['caso I' => 'Caso I', 'caso II' => 'Caso II']" />
          <x-sheets.field id="puinf" label="Carga axial última inferior" symbol="Pu inf" value="0" unit="t" />
          <x-sheets.field id="pusup" label="Carga axial última superior" symbol="Pu sup" value="0" unit="t" />
          <x-sheets.field id="Mninf" label="Momento nominal inferior" symbol="Mn inf" value="0" unit="t·m" />
          <x-sheets.field id="Mnsup" label="Momento nominal superior" symbol="Mn sup" value="0" unit="t·m" />
          <x-sheets.field id="VudEtaps" label="Cortante de diseño (ETABS)" symbol="Vud" value="0" unit="t" />
          <x-sheets.field id="AAceroTotal" label="Área de acero total" symbol="As" value="0" unit="cm²" min="0" />
          <x-sheets.field id="AEstribos" label="Barra de estribo" symbol="Ø" value="0.71" :options="$barras" />
          <x-sheets.field id="AmaxLong" label="Barra longitudinal máxima" symbol="Ø" value="1.98" :options="$barras" />
        </x-sheets.fieldset>
      </div>
      <input id="dataFromHandsontable" name="dataFromHandsontable" type="hidden" value="">
      <input id="dataFromHandsontableLAX" name="dataFromHandsontableLAX" type="hidden" value="">
      <input id="dataFromHandsontableLAY" name="dataFromHandsontableLAY" type="hidden" value="">
      <x-sheets.calculate />
    </form>
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados del diseño de columnas">
    <x-sheets.results-header status-id="columna-status" description="Verificaciones, diagramas de interacción y diseño por corte."
      :exports="['btn_pdf_predim' => 'Exportar PDF', 'btn_captura_columna' => 'Exportar imagen']" />
    <div id="columna_pdf" class="arco-result-sections">
      <x-sheets.results id="ObtenerResultadosCol" />
      <x-sheets.figure title="Diagrama de interacción · dirección X-X"><canvas id="DIXXs" class="sheet-canvas-sm"></canvas></x-sheets.figure>
      <x-sheets.figure title="Diagrama de interacción · dirección Y-Y"><canvas id="DIejey" class="sheet-canvas-sm"></canvas></x-sheets.figure>
    </div>
  </section>
  @pushOnce('styles')
    <link href="https://cdn.jsdelivr.net/npm/handsontable@14.6.1/dist/handsontable.full.min.css" rel="stylesheet" />
  @endpushOnce
  @pushOnce('scripts')
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/handsontable@14.6.1/dist/handsontable.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
  @endpushOnce
</x-sheets.workbench>
