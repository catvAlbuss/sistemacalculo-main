@php
  // [id del span del motor, expresión]. El motor (resources/js/cav2/adm_comb_cargas.js) escribe cada valor por id.
  $grupos = [
      ['1', 'Carga muerta y viva', [['_1combinacion', '1.4 D + 1.7 L']], '_1combinacionResultado'],
      ['2', 'Con viento', [['_2combinacion1', '1.25 (D + L + Vi)'], ['_2combinacion2', '1.25 (D + L − Vi)'], ['_2combinacion3', '0.9 D + Vi'], ['_2combinacion4', '0.9 D − Vi']], '_2combinacionResultado'],
      ['3', 'Con sismo', [['_3combinacion1', '1.25 (D + L) + E'], ['_3combinacion2', '1.25 (D + L) − E'], ['_3combinacion3', '0.9 D + E'], ['_3combinacion4', '0.9 D − E']], '_3combinacionResultado'],
  ];
@endphp
<x-sheets.workbench sheet="est-combinacion-cargas" title="Combinación de cargas" entry="resources/js/cav2/adm_comb_cargas.js" auto
  eyebrow="Herramientas de ingeniería / Estudiante · Concreto armado"
  description="Combinaciones de carga de diseño según la Norma E.060 a partir de las cargas muerta, viva, de viento y de sismo; identifica la combinación que rige.">
  <x-sheets.panel title="Datos generales" description="Cargas de servicio por metro lineal." number="01" class="arco-input-panel" data-sheet-inputs>
    <div class="arco-fields">
      <x-sheets.fieldset title="Cargas de servicio">
        <x-sheets.field id="d" label="Carga muerta" symbol="D" value="1.8" unit="t/m" min="0" />
        <x-sheets.field id="l" label="Carga viva" symbol="L" value="1.25" unit="t/m" min="0" />
        <x-sheets.field id="vi" label="Carga de viento" symbol="Vi" value="0" unit="t/m" min="0" />
        <x-sheets.field id="e" label="Carga de sismo" symbol="E" value="0" unit="t/m" min="0" />
      </x-sheets.fieldset>
      <x-sheets.fieldset title="Otras cargas" note="No intervienen en las combinaciones de esta hoja.">
        <x-sheets.field id="ce" label="Empuje lateral del suelo" symbol="CE" value="0" min="0" />
        <x-sheets.field id="cl" label="Presión de líquidos" symbol="CL" value="0" min="0" />
        <x-sheets.field id="ct" label="Efectos de temperatura" symbol="CT" value="0" min="0" />
      </x-sheets.fieldset>
    </div>
    <x-sheets.calculate type="button" id="calcular" />
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados de la combinación de cargas">
    <x-sheets.results-header status-id="comb-cargas-status" description="Valor de cada combinación y la que rige el diseño." />
    <x-sheets.results id="resultados" ready>
      @foreach ($grupos as [$n, $titulo, $filas, $estado])
        <section class="pr-panel arco-result-card">
          <div class="arco-result-heading"><span class="arco-result-number">{{ $n }}</span><h3>{{ $titulo }}</h3></div>
          <x-sheets.table :label="$titulo" :columns="['Combinación', 'Valor']">
            <tbody>
              @foreach ($filas as [$id, $expresion])
                <tr><td>{{ $expresion }}</td><td><span id="{{ $id }}"></span> <span class="sheet-unit">t/m</span></td></tr>
              @endforeach
              <tr><td>Estado</td><td><span id="{{ $estado }}"></span></td></tr>
            </tbody>
          </x-sheets.table>
        </section>
      @endforeach
      <section class="pr-panel arco-result-card">
        <div class="arco-result-heading"><span class="arco-result-number">4</span><h3>Combinación que rige</h3></div>
        <x-sheets.table label="Combinación que rige" :columns="['Parámetro', 'Símbolo', 'Valor']">
          <tbody><tr><td>Máxima combinación</td><td>U</td><td><span id="maximaCombinacion"></span> <span class="sheet-unit">t/m</span></td></tr></tbody>
        </x-sheets.table>
      </section>
    </x-sheets.results>
  </section>
</x-sheets.workbench>
