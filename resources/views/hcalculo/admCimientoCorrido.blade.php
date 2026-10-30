@php
  $barras = ['0.60' => '6 mm', '0.80' => '8 mm', '0.95' => '3/8"', '1.20' => '12 mm', '1.27' => '1/2"', '1.59' => '5/8"', '1.91' => '3/4"', '2.54' => '1"', '3.49' => '1 3/8"'];
@endphp
<x-sheets.workbench sheet="cimiento-corrido" title="Diseño de cimiento corrido" entry="resources/js/adm_cimiento_corrido.js" auto
  description="Diseño de un cimiento corrido: esfuerzo neto del terreno, ancho requerido a partir de las cargas por metro lineal y verificación de esfuerzos.">
  <x-sheets.panel title="Datos generales" description="Materiales, geometría, suelo y cargas por metro lineal." number="01" class="arco-input-panel" data-sheet-inputs>
    <form id="cimientosControler" method="POST" action="{{ route('cimientocorrido') }}">
      @csrf
      <div class="arco-fields">
        <x-sheets.fieldset title="Materiales">
          <x-sheets.field id="fc" label="Compresión del concreto" symbol="f′c" value="210" unit="kg/cm²" min="0.01" />
          <x-sheets.field id="fy" label="Fluencia del acero" symbol="fy" value="4200" unit="kg/cm²" min="0.01" />
          <x-sheets.field id="yalba" label="Peso específico de la albañilería" symbol="γa" value="1800" unit="kg/m³" min="0" />
          <x-sheets.field id="ycsimple" label="Peso específico del concreto simple" symbol="γcs" value="2300" unit="kg/m³" min="0" />
          <x-sheets.field id="ycarmado" label="Peso específico del concreto armado" symbol="γca" value="2400" unit="kg/m³" min="0" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Geometría">
          <x-sheets.field id="l1" label="Altura del falso piso" symbol="L1" value="30" unit="cm" min="0" />
          <x-sheets.field id="l2" label="Altura del sobrecimiento" symbol="L2" value="50" unit="cm" min="0" />
          <x-sheets.field id="columna" label="Diámetro de la barra de la columna" symbol="Ø" value="1.91" :options="$barras" />
          <x-sheets.field id="re" label="Recubrimiento" symbol="r" value="7.50" unit="cm" min="0" />
          <x-sheets.field id="esmuro" label="Espesor del muro" symbol="e" value="0.25" unit="m" min="0" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Suelo">
          <x-sheets.field id="esadterr" label="Esfuerzo admisible del terreno" symbol="σt" value="0.90" unit="kg/cm²" min="0" />
          <x-sheets.field id="pdcimt" label="Profundidad de cimentación" symbol="Df" value="1.40" unit="m" min="0" />
          <x-sheets.field id="yprom" label="Peso específico promedio" symbol="γm" value="1" unit="t/m³" min="0" />
          <x-sheets.field id="sc" label="Sobrecarga" symbol="s/c" value="0.20" unit="t/m²" min="0" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Cargas por metro lineal">
          <x-sheets.field id="CM" label="Carga muerta" symbol="CM" value="6805" unit="kg/m" min="0" />
          <x-sheets.field id="CV" label="Carga viva" symbol="CV" value="600" unit="kg/m" min="0" />
        </x-sheets.fieldset>
      </div>
      <x-sheets.calculate />
    </form>
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados del diseño de cimiento corrido">
    <x-sheets.results-header status-id="cimiento-status" description="Esfuerzo neto, dimensiones del cimiento y verificaciones."
      :exports="['btn_pdf_predim' => 'Exportar PDF', 'btn_captura_resultado' => 'Exportar imagen']" />
    <div id="cm_pdf" class="arco-result-sections">
      <x-sheets.figure title="Sección del cimiento"><div id="main" class="sheet-chart"></div></x-sheets.figure>
      <x-sheets.results id="ObtenerResultadosCimiento" empty="Los resultados aparecerán al calcular." />
    </div>
  </section>
  @pushOnce('scripts')
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
  @endpushOnce
</x-sheets.workbench>
