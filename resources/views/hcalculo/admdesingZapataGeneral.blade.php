@php
  $barras = ['0.283' => '6 mm', '0.503' => '8 mm', '0.713' => 'Ø 3/8"', '1.131' => '12 mm', '1.267' => 'Ø 1/2"', '1.979' => 'Ø 5/8"', '2.850' => 'Ø 3/4"', '5.067' => 'Ø 1"'];
@endphp
<x-sheets.workbench sheet="zapata-general" title="Diseño de zapata general" entry="resources/js/adm_zapata_general.js" auto
  description="Diseño de una zapata aislada: presiones del suelo para las cargas de servicio y sismo, punzonamiento, corte, flexión y refuerzo en ambas direcciones.">
  <x-sheets.panel title="Datos generales" description="Materiales, suelo, geometría, refuerzo y cargas de servicio." number="01" class="arco-input-panel" data-sheet-inputs x-data="{ inercia: 'Sregular' }">
    <form id="DataZapatageneral" action="{{ route('zapataGenCon') }}" method="post">
      @csrf
      <div class="arco-fields">
        <x-sheets.fieldset title="Materiales y suelo">
          <x-sheets.field id="fc" label="Compresión del concreto" symbol="f′c" value="210" unit="kg/cm²" min="0.01" />
          <x-sheets.field id="fy" label="Fluencia del acero" symbol="fy" value="4200" unit="kg/cm²" min="0.01" />
          <x-sheets.field id="ys" label="Peso específico del suelo" symbol="γs" value="1" unit="t/m³" min="0.01" />
          <x-sheets.field id="df" label="Profundidad de cimentación" symbol="Df" value="1" unit="m" min="0.01" />
          <x-sheets.field id="cps" label="Capacidad portante del suelo" symbol="σs" value="1" unit="kg/cm²" min="0.01" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Geometría">
          <x-sheets.field id="t" label="Columna, lado en dirección L" symbol="t" value="1" unit="m" min="0.01" />
          <x-sheets.field id="b" label="Columna, lado en dirección B" symbol="b" value="1" unit="m" min="0.01" />
          <x-sheets.field id="l" label="Longitud de la zapata" symbol="L" value="1" unit="m" min="0.01" />
          <x-sheets.field id="DZY" label="Ancho de la zapata" symbol="B" value="1" unit="m" min="0.01" />
          <x-sheets.field id="dzapata" label="Peralte de la zapata" symbol="d" value="1" unit="cm" min="0.01" />
          <x-sheets.field id="Columna" label="Ubicación de la columna" symbol="αs" value="40" :options="['40' => 'Interior', '30' => 'De borde', '20' => 'En esquina']" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Refuerzo">
          <x-sheets.field id="VarillaX" label="Barra en dirección X" symbol="Ø" value="1.979" :options="$barras" />
          <x-sheets.field id="VarillaY" label="Barra en dirección Y" symbol="Ø" value="1.979" :options="$barras" />
          <x-sheets.field id="espaciamientox" label="Espaciamiento en X" symbol="sx" value="20" unit="cm" min="0.01" />
          <x-sheets.field id="espaciamientoy" label="Espaciamiento en Y" symbol="sy" value="20" unit="cm" min="0.01" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Sección">
          <x-sheets.field id="inercia" label="Tipo de sección" value="Sregular" :options="['Sregular' => 'Regular', 'Sirregular' => 'Irregular']"
            x-on:change="inercia = $event.target.value" />
          <x-sheets.field id="B" label="Momento de inercia" symbol="Ix" value="1" unit="cm⁴" min="0" show="inercia === 'Sirregular'" />
          <x-sheets.field id="By" label="Momento de inercia" symbol="Iy" value="1" unit="cm⁴" min="0" show="inercia === 'Sirregular'" />
        </x-sheets.fieldset>
      </div>
      <x-sheets.matrix id="CargaConServ" title="Cargas de servicio" note="Carga axial y momentos por tipo de carga. Edita las celdas con doble clic." />
      <input id="dataFromHandsontable" name="dataFromHandsontable" type="hidden" value="">
      <x-sheets.calculate />
    </form>
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados del diseño de zapata general">
    <x-sheets.results-header status-id="zapata-general-status" description="Presiones, punzonamiento, corte, flexión y refuerzo."
      :exports="['btn_pdf_predim' => 'Exportar PDF', 'btn_captura_zapata' => 'Exportar imagen']" />
    <div id="zapataGeneral_pdf">
      <x-sheets.results id="ObtenerResultados" />
    </div>
  </section>
  @pushOnce('styles')
    <link href="https://cdn.jsdelivr.net/npm/handsontable@14.6.1/dist/handsontable.full.min.css" rel="stylesheet" />
  @endpushOnce
  @pushOnce('scripts')
    <script src="https://cdn.jsdelivr.net/npm/handsontable@14.6.1/dist/handsontable.full.min.js"></script>
  @endpushOnce
</x-sheets.workbench>
