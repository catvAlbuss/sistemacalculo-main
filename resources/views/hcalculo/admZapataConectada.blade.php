@php
  // Solicitaciones por columna: [prefijo de id, descripción, unidad]; el id lleva el número de columna.
  $cargas = [
      ['PD', 'Carga muerta', 't'], ['PL', 'Carga viva', 't'], ['PSX', 'Sismo en X', 't'], ['PSY', 'Sismo en Y', 't'],
      ['MDx', 'Momento muerto en X', 't·m'], ['MLx', 'Momento vivo en X', 't·m'], ['MDy', 'Momento muerto en Y', 't·m'],
      ['MLy', 'Momento vivo en Y', 't·m'], ['MSX', 'Momento sísmico en X', 't·m'], ['MSY', 'Momento sísmico en Y', 't·m'],
  ];
  $valores = [1 => [120, 70, 20, 12, 8, 6, 6, 4, 9, 6], 2 => [200, 115, 15, 13, 3, 1.5, 7, 5, 10, 7]];
@endphp
<x-sheets.workbench sheet="zapata-conectada" title="Diseño de zapata conectada" entry="resources/js/adm_zapata_conectada.js" auto
  description="Diseño de zapatas conectadas por una viga de cimentación: capacidad portante neta, dimensiones de cada zapata y de la viga, y refuerzo.">
  <x-sheets.panel title="Datos generales" description="Geometría, cargas por columna, suelo y factores de amplificación." number="01" class="arco-input-panel" data-sheet-inputs>
    <form id="DataZapataconectada" action="{{ route('zapataconectadaCon') }}" method="post">
      @csrf
      <div class="arco-fields">
        <x-sheets.fieldset title="Columnas" note="Dimensiones en planta de cada columna.">
          <x-sheets.field id="anchoCol1" label="Columna 1, ancho" value="0.6" unit="m" min="0.01" />
          <x-sheets.field id="largoCol1" label="Columna 1, largo" value="0.4" unit="m" min="0.01" />
          <x-sheets.field id="anchoCol2" label="Columna 2, ancho" value="0.8" unit="m" min="0.01" />
          <x-sheets.field id="largoCol2" label="Columna 2, largo" value="0.4" unit="m" min="0.01" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Zapatas y viga de conexión">
          <x-sheets.field id="anchoZap1" label="Zapata 1, ancho" value="1.2" unit="m" min="0.01" />
          <x-sheets.field id="largoZap1" label="Zapata 1, largo" value="1.5" unit="m" min="0.01" />
          <x-sheets.field id="anchoZap2" label="Zapata 2, ancho" value="1.5" unit="m" min="0.01" />
          <x-sheets.field id="largoZap2" label="Zapata 2, largo" value="1.5" unit="m" min="0.01" />
          <x-sheets.field id="anchoViga" label="Ancho de la viga" value="0.4" unit="m" min="0.01" />
          <x-sheets.field id="lndiseno" label="Luz libre entre columnas" symbol="ln" value="5" unit="m" min="0.01" />
          <x-sheets.field id="tipoDiseño" label="Tipo de diseño" value="1" :options="collect(range(1, 9))->mapWithKeys(fn ($t) => [$t => 'Tipo '.$t])->all()" />
        </x-sheets.fieldset>
        @foreach ($valores as $n => $col)
          <x-sheets.fieldset :title="'Cargas de la columna '.$n">
            @foreach ($cargas as $i => [$id, $label, $unit])
              <x-sheets.field :id="$id.$n" :label="$label" :symbol="$id.$n" :value="$col[$i]" :unit="$unit" />
            @endforeach
          </x-sheets.fieldset>
        @endforeach
        <x-sheets.fieldset title="Suelo y cimentaciones">
          <x-sheets.field id="qneta" label="Capacidad portante admisible neta" symbol="qneta" value="4" unit="kg/cm²" min="0.01" />
          <x-sheets.field id="b1" label="Ancho de la cimentación 1" symbol="B₁" value="3.4" unit="m" min="0.01" />
          <x-sheets.field id="b2" label="Ancho de la cimentación 2" symbol="B₂" value="2.8" unit="m" min="0.01" />
          <x-sheets.field id="l2" label="Largo de la cimentación 2" symbol="L₂" value="3.2" unit="m" min="0.01" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Factores de amplificación" note="Combinación 1: carga muerta y viva. Combinación 2: con sismo.">
          <x-sheets.field id="fact_ampli_cm" label="Combinación 1, carga muerta" symbol="αD" value="1.4" min="0" />
          <x-sheets.field id="fact_ampli_cv" label="Combinación 1, carga viva" symbol="αL" value="1.7" min="0" />
          <x-sheets.field id="fact_ampli_cm_c2" label="Combinación 2, carga muerta" symbol="αD" value="1.25" min="0" />
          <x-sheets.field id="fact_ampli_cv_c2" label="Combinación 2, carga viva" symbol="αL" value="1.25" min="0" />
        </x-sheets.fieldset>
      </div>
      <x-sheets.calculate />
    </form>
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados del diseño de zapata conectada">
    <x-sheets.results-header status-id="zapata-conectada-status" description="Esquema en planta, presiones, viga de conexión y refuerzo."
      :exports="['btn_pdf_predim' => 'Exportar PDF']" />
    <div id="zapataConectada_pdf" class="arco-result-sections">
      <x-sheets.figure title="Esquema en planta"><canvas id="myCanvas" width="1000" height="300"></canvas></x-sheets.figure>
      <x-sheets.results id="ObtenerResultadosZConectada" />
    </div>
  </section>
  @pushOnce('scripts')
    <script src="https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
  @endpushOnce
</x-sheets.workbench>
