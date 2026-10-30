{{-- Las tablas por tramo las arma resources/js/losas-aligeradas/spanTables.js con valores de ejemplo. --}}
<x-sheets.workbench class="sheet-fit" sheet="losas-aligeradas" title="Diseño de losas aligeradas" entry="resources/js/adm_losas_aligeradas.js" auto
  description="Diseño de viguetas de losa aligerada por tramos: requisitos de diseño, refuerzo negativo y positivo, corte y deflexiones.">
  <x-sheets.panel title="Datos generales" description="Materiales, cargas y solicitaciones por tramo." number="01" class="arco-input-panel" data-sheet-inputs>
    <form id="FlexionViga" method="POST" action="{{ route('desingLosa') }}">
      @csrf
      <div class="arco-fields">
        <x-sheets.fieldset title="Materiales" note="Resistencias del concreto y del acero de refuerzo.">
          <x-sheets.field id="fc" label="Compresión del concreto" symbol="f′c" value="210" unit="kg/cm²" min="0.01" />
          <x-sheets.field id="fy" label="Fluencia del acero" symbol="fy" value="4200" unit="kg/cm²" min="0.01" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Configuración de tramos" note="Al cambiar la cantidad se actualizan las columnas de las tablas.">
          <x-sheets.field id="num_tramos" label="Número de tramos" symbol="n" value="2" min="1" step="1" />
        </x-sheets.fieldset>
      </div>
      <div class="beam-matrix-panel">
        <h3>Geometría y cargas por tramo</h3>
        <p class="arco-note">Una columna por tramo. Los valores son de ejemplo; reemplázalos por los del proyecto.</p>
        <div class="arco-table-scroll" role="region" aria-label="Geometría y cargas por tramo" tabindex="0">
          <table class="sheet-data-table sheet-span-input" id="LuzLibreTramo"></table>
        </div>
      </div>
      <div class="beam-matrix-panel">
        <h3>Solicitaciones por tramo</h3>
        <p class="arco-note">Momento, cortante y torsión últimos en el inicio, el centro y el final de cada tramo.</p>
        <div class="arco-table-scroll" role="region" aria-label="Solicitaciones por tramo" tabindex="0">
          <table class="sheet-data-table sheet-span-input sheet-point-input" id="tablaTramos"></table>
        </div>
      </div>
      <x-sheets.calculate />
    </form>
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados del diseño de losas aligeradas">
    <x-sheets.results-header status-id="losas-aligeradas-status"
      description="Requisitos de diseño, refuerzo por tramo, corte y deflexiones. Desplaza las tablas para revisar todos los tramos." />
    <section class="pr-panel arco-result-card">
      <div class="arco-table-scroll sheet-span-scroll" role="region" aria-label="Resultados por tramo" tabindex="0">
        <x-sheets.results id="ObtenerResultados" empty="Los resultados aparecerán al calcular, ordenados por tramo: inicio, centro y final de cada uno." />
      </div>
    </section>
  </section>

  @pushOnce('initscripts')
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  @endpushOnce
</x-sheets.workbench>
