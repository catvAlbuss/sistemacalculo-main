@php
  $barras = collect(['6mm', 'Ø 1/4"', '8mm', 'Ø 3/8"', '12mm', 'Ø 1/2"', 'Ø 5/8"', 'Ø 3/4"', 'Ø 1"'])->mapWithKeys(fn ($b) => [$b => $b])->all();
  // [id, etiqueta, símbolo, unidad]. Campos vacíos: el usuario ingresa todos los datos.
  $grupos = [
      'Geometría' => [
          ['ancho_tributario', 'Ancho tributario', 'B', 'm'], ['i', 'Longitud i', 'i', 'm'], ['j', 'Longitud j', 'j', 'm'],
          ['espesor_descanso', 'Espesor del descanso', 'e', 'm'], ['espesor_garganta_rec', 'Espesor de garganta recomendado', 'er', 'm'],
          ['espesor_garganta', 'Espesor de la garganta', 't', 'm'], ['paso', 'Paso', 'P', 'm'], ['contrapaso', 'Contrapaso', 'CP', 'm'],
          ['a', 'Longitud a', 'a', 'm'], ['ancho_descanso', 'Ancho del descanso', 'b', 'm'],
      ],
      'Materiales y cargas' => [
          ['fc', 'Compresión del concreto', 'f′c', 'kg/cm²'], ['fy', 'Fluencia del acero', 'fy', 'kg/cm²'],
          ['gamma_c', 'Peso específico del concreto', 'γc', 't/m³'], ['cm_acabados', 'Carga de acabados', 'CM', 't/m²'],
          ['sc_escalera', 'Sobrecarga', 's/c', 't/m²'], ['r_prime', 'Recubrimiento', 'r′', 'cm'], ['mu', 'Momento último', 'Mu', 't·m'],
      ],
  ];
@endphp
<x-sheets.workbench sheet="escaleras" title="Diseño de escaleras" entry="resources/js/desingescaleras.js" auto
  description="Diseño de una escalera de concreto armado: medidas, metrado de cargas, diagramas de momento y cortante, diseño por flexión, refuerzo por cambios volumétricos y diseño por corte.">
  <x-sheets.panel title="Datos generales" description="Geometría, materiales, cargas y criterios de refuerzo. Enter pasa al campo siguiente." number="01" class="arco-input-panel" data-sheet-inputs>
    <div class="arco-fields">
      @foreach ($grupos as $titulo => $campos)
        <x-sheets.fieldset :title="$titulo">
          @foreach ($campos as [$id, $label, $symbol, $unit])
            <x-sheets.field :id="$id" :label="$label" :symbol="$symbol" :unit="$unit" min="0" class="bg-gespro-input" />
          @endforeach
        </x-sheets.fieldset>
      @endforeach
      <x-sheets.fieldset title="Refuerzo por flexión">
        <x-sheets.field id="phi_flexion" label="Factor de reducción a flexión" symbol="ϕ" min="0" class="bg-gespro-input" />
        <x-sheets.field id="diameter_flexion" label="Barra a usar" symbol="Ø" value='Ø 1/2"' :options="$barras" class="bg-gespro-input" />
        <x-sheets.field id="s_usar" label="Espaciamiento a usar" symbol="S" unit="cm" min="0" class="bg-gespro-input" />
        <x-sheets.field id="b_lineal" label="Ancho por metro lineal" symbol="b" unit="cm" min="0" class="bg-gespro-input" />
      </x-sheets.fieldset>
      <x-sheets.fieldset title="Refuerzo por temperatura y corte">
        <x-sheets.field id="rho_min" label="Cuantía mínima (E.060, 9.7.2)" symbol="ρmín" min="0" class="bg-gespro-input" />
        <x-sheets.field id="diameter" label="Barra a usar" symbol="Ø" value='Ø 3/8"' :options="$barras" class="bg-gespro-input" />
        <x-sheets.field id="s_vol_usar" label="Espaciamiento a usar" symbol="S" unit="cm" min="0" class="bg-gespro-input" />
        <x-sheets.field id="phi_corte" label="Factor de reducción a cortante" symbol="ϕ" min="0" class="bg-gespro-input" />
      </x-sheets.fieldset>
    </div>
    <x-sheets.calculate type="button" id="desingButton" />
  </x-sheets.panel>
  <section class="arco-results" aria-label="Resultados del diseño de escaleras">
    <x-sheets.results-header status-id="escaleras-status" description="Medidas, metrado, diagramas, flexión, refuerzo volumétrico y corte." />
    <x-sheets.results id="escaleras_resultados">
      <section class="pr-panel arco-result-card">
        <div class="arco-table-scroll" role="region" aria-label="Resultados del diseño de escaleras" tabindex="0">
          @include('hcalculo.partials.escaleras-resultados')
        </div>
      </section>
    </x-sheets.results>
  </section>
</x-sheets.workbench>
