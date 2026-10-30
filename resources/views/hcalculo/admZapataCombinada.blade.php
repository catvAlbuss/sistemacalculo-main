@php
  $combinaciones = ['1.4CM+1.7CV', '1.25(CM+CV)+Sx', '1.25(CM+CV)-Sx', '1.25(CM+CV)+Sy', '1.25(CM+CV)-Sy', '0.9CM+Sx', '0.9CM-Sx', '0.9CM+Sy', '0.9CM-Sy'];
  $combos = fn ($col) => collect($combinaciones)->mapWithKeys(fn ($c, $i) => ['fila'.($i + 1).'_col'.$col => $c])->all();
  $barras = ['0.28' => '6 mm', '0.5' => '8 mm', '0.71' => 'Ø 3/8"', '1.13' => '12 mm', '1.29' => 'Ø 1/2"', '1.99' => 'Ø 5/8"', '2.84' => 'Ø 3/4"', '5.1' => 'Ø 1"', '10.06' => 'Ø 1 3/8"'];
  $ubicacion = ['40' => 'Interior', '30' => 'De borde', '20' => 'En esquina'];
@endphp
<x-sheets.workbench sheet="zapata-combinada" title="Diseño de zapata combinada" entry="resources/js/adm_zapata_combinada.js" auto
  description="Diseño de una zapata combinada para dos columnas: combinaciones de carga, predimensionamiento, verificación por corte y punzonamiento, y refuerzo.">
  <x-sheets.panel title="Datos generales" description="Suelo, geometría, cargas por columna y parámetros de verificación." number="01" class="arco-input-panel" data-sheet-inputs>
    <form id="DataZapataCombinada" action="{{ route('zapatacombCon') }}" method="post">
      @csrf
      <div class="arco-fields">
        <x-sheets.fieldset title="Identificación y suelo">
          <x-sheets.field id="des" type="text" label="Descripción" value="Zapata A1" />
          <x-sheets.field id="fk" label="Factor K" value="1" min="0" />
          <x-sheets.field id="qa" label="Capacidad admisible del suelo" symbol="qa" value="3" unit="t/m²" min="0" />
          <x-sheets.field id="p_servicio" label="Carga de servicio" symbol="P" value="8" unit="t" min="0" />
          <x-sheets.field id="ot" label="Esfuerzo admisible del terreno" symbol="σt" value="3" unit="kg/m²" min="0" />
          <x-sheets.field id="df" label="Profundidad de desplante" symbol="Df" value="1.5" unit="m" min="0" />
          <x-sheets.field id="sc" label="Sobrecarga" symbol="s/c" value="500" unit="kg/m²" min="0" />
          <x-sheets.field id="ym" label="Peso específico promedio" symbol="γm" value="2000" unit="kg/m³" min="0" />
        </x-sheets.fieldset>
        <x-sheets.fieldset title="Materiales y geometría">
          <x-sheets.field id="fc" label="Compresión del concreto" symbol="f′c" value="210" unit="kg/cm²" min="0.01" />
          <x-sheets.field id="fy" label="Fluencia del acero" symbol="fy" value="4200" unit="kg/cm²" min="0.01" />
          <x-sheets.field id="hc" label="Espesor del piso" symbol="hc" value="0.2" unit="m" min="0" />
          <x-sheets.field id="hz" label="Peralte de la zapata" symbol="hz" value="1" unit="m" min="0.01" />
          <x-sheets.field id="r" label="Recubrimiento" symbol="r" value="1" unit="cm" min="0" />
          <x-sheets.field id="rec" label="Recubrimiento del refuerzo" symbol="rec" value="7.5" unit="cm" min="0" />
          <x-sheets.field id="Le" label="Distancia entre ejes de columnas" symbol="Le" value="5" unit="m" min="0.01" />
        </x-sheets.fieldset>
        @foreach ([1, 2] as $c)
          <x-sheets.fieldset :title="'Columna '.$c" note="Sección y volado de la zapata.">
            <x-sheets.field :id="'t1_col'.$c" label="Lado t1" symbol="t1" value="0.5" unit="m" min="0.01" />
            <x-sheets.field :id="'t2_col'.$c" label="Lado t2" symbol="t2" value="0.5" unit="m" min="0.01" />
            <x-sheets.field :id="'m'.$c" label="Volado" :symbol="'m'.$c" value="1" unit="m" min="0" />
          </x-sheets.fieldset>
        @endforeach
      </div>
      <x-sheets.matrix id="CargaConServ" title="Cargas de la columna 1" note="Cargas de servicio por tipo. Edita las celdas con doble clic." />
      <x-sheets.matrix id="CargaConServcol2" title="Cargas de la columna 2" note="Cargas de servicio por tipo. Edita las celdas con doble clic." />
      <input id="dataCargacol1" name="dataCargacol1" type="hidden" value="">
      <input id="dataCargacol2" name="dataCargacol2" type="hidden" value="">
      <div class="arco-fields">
        @foreach ([1 => ['0.75', '90.6'], 2 => ['0.75', '89.01']] as $c => [$lv, $d])
          <x-sheets.fieldset :title="'Verificación por cortante y flexión · columna '.$c">
            <x-sheets.field :id="'selectColumna'.$c" label="Combinación para cortante" :value="'fila1_col'.$c" :options="$combos($c)" />
            <x-sheets.field :id="'lv_col'.$c" label="Longitud de volado" symbol="lv" :value="$lv" unit="cm" min="0" />
            <x-sheets.field :id="'d_col'.$c" label="Peralte efectivo" symbol="d" :value="$d" unit="cm" min="0" />
            <x-sheets.field :id="'VarillaX_Col'.$c" label="Barra longitudinal" symbol="Ø" value="0.71" :options="$barras" />
            <x-sheets.field :id="'pmin_col'.$c" label="Cuantía mínima" symbol="ρmin" value="0.0018" min="0" />
            <x-sheets.field :id="'selectVFColumna'.$c" label="Combinación para flexión" :value="'fila1_col'.$c" :options="$combos($c)" />
          </x-sheets.fieldset>
        @endforeach
        <x-sheets.fieldset title="Factor de reducción por flexión">
          <x-sheets.field id="pmin_fi_generalcol2" name="fi_general" label="Factor de reducción" symbol="ϕ" value="0.9" min="0" />
        </x-sheets.fieldset>
        @foreach ([1, 2] as $c)
          <x-sheets.fieldset :title="'Corte y punzonamiento · columna '.$c">
            <x-sheets.field :id="'dvc_col'.$c" label="Peralte efectivo" symbol="d" value="91.55" unit="cm" min="0" />
            <x-sheets.field :id="'r_vc_col'.$c" label="Recubrimiento" symbol="r" value="7.5" unit="cm" min="0" />
            <x-sheets.field :id="'VarillaVC_Col'.$c" label="Barra" symbol="Ø" value="0.71" :options="$barras" />
            <x-sheets.field :id="'fa_Col'.$c" label="Ubicación de la columna" symbol="αs" value="30" :options="$ubicacion" />
          </x-sheets.fieldset>
        @endforeach
        <x-sheets.fieldset title="Factor de reducción por corte">
          <x-sheets.field id="ovcp" label="Factor de reducción" symbol="ϕ" value="0.85" min="0" />
        </x-sheets.fieldset>
      </div>
      <x-sheets.calculate />
    </form>
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados del diseño de zapata combinada">
    <x-sheets.results-header status-id="zapata-combinada-status" description="Predimensionamiento, vista en planta, diagramas y verificaciones."
      :exports="['btn_pdf_predim' => 'Exportar PDF', 'btn_captura_zapata_combinada' => 'Exportar imagen']" />
    <div id="zapatacomb_pdf" class="arco-result-sections">
      <x-sheets.figure title="Predimensionamiento" number="1"><canvas id="predimencionamiento" width="1000" height="400"></canvas></x-sheets.figure>
      <x-sheets.figure title="Vista en planta" number="2"><canvas id="vistaplanta" width="1000" height="400"></canvas></x-sheets.figure>
      <x-sheets.figure title="Diagrama de cortante" number="3"><canvas id="myChart" width="1000" height="400"></canvas></x-sheets.figure>
      <x-sheets.figure title="Verificación por flexión" number="4"><canvas id="VC_flexion" width="1000" height="400"></canvas></x-sheets.figure>
      <x-sheets.figure title="Corte y punzonamiento" number="5"><canvas id="corte_punzonamiento" width="1000" height="400"></canvas></x-sheets.figure>
      <x-sheets.results id="ObtenerResultadosZComb" />
    </div>
  </section>
  @pushOnce('styles')
    <link href="https://cdn.jsdelivr.net/npm/handsontable@14.6.1/dist/handsontable.full.min.css" rel="stylesheet" />
  @endpushOnce
  @pushOnce('scripts')
    <script src="https://cdn.jsdelivr.net/npm/handsontable@14.6.1/dist/handsontable.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.14.5/dist/sweetalert2.all.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
  @endpushOnce
</x-sheets.workbench>
