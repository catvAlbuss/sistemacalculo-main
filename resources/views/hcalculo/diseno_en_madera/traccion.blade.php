@php
  $grupos = [['value' => 'A'], ['value' => 'B'], ['value' => 'C', 'selected' => true]];
  $secciones = array_map(fn ($value) => ['value' => $value], range(1, 62));
@endphp

@pushOnce('initscripts')
  @vite('resources/js/diseno_madera_data.js')
@endPushOnce

<x-sheets.workbench mathjax sheet="madera-traccion" title="Diseño en madera · Tracción" x-data="diseño_madera"
  eyebrow="Herramientas de ingeniería / Estructuras de madera"
  description="Verificación de un elemento de madera estructural sometido a tracción axial: esfuerzos admisibles del grupo estructural y resistencia N = ft·A de la sección.">
  <x-input-data description="Grupo estructural, sección de catálogo y carga axial.">
    <x-input-select-calc name="Grupo estructural" bind="calcs.grupo" :options="$grupos"></x-input-select-calc>
    <x-input-select-calc name="Sección" symbol="n.º" bind="calcs.compresionSeccion" :options="$secciones"></x-input-select-calc>
    <x-input-calc name="Carga axial" symbol="N" bind="calcs.traccionAxial" unit="kg"></x-input-calc>
    <x-slot:actions>
      <button type="button" class="pr-button" x-on:click="calcular()">Calcular diseño <span aria-hidden="true">→</span></button>
      <p class="arco-note">Recalcula después de editar los datos.</p>
    </x-slot:actions>
  </x-input-data>
  <x-output-data description="Los resultados se actualizan al calcular.">
    <x-table-result title="1.- Datos del diseño">
      <x-output-calc name="Grupo estructural" bind="calcs.grupo"></x-output-calc>
      <x-output-calc name="Módulo de elasticidad mínimo" symbol="Emin" bind="calcs.diseñoEmin" unit="kg/cm²"></x-output-calc>
      <x-output-calc name="Esfuerzo admisible a flexión" symbol="fm" bind="calcs.diseñoFm" unit="kg/cm²"></x-output-calc>
      <x-output-calc name="Esfuerzo admisible a compresión paralela" symbol="fc" bind="calcs.diseñoFc" unit="kg/cm²"></x-output-calc>
      <x-output-calc name="Esfuerzo admisible a tracción paralela" symbol="ft" bind="calcs.diseñoFt" unit="kg/cm²"></x-output-calc>
      <x-output-calc name="Esfuerzo admisible a corte paralelo" symbol="fv" bind="calcs.diseñoFv" unit="kg/cm²"></x-output-calc>
      <x-output-calc name="Carga axial" symbol="N" bind="calcs.traccionAxial" unit="kg"></x-output-calc>
    </x-table-result>
    <x-table-result title="2.- Tracción">
      <x-output-calc name="Sección" bind="calcs.compresionSeccion"></x-output-calc>
      <x-output-calc name="Área de la sección" symbol="A" bind="calcs.compresionA" unit="cm²"></x-output-calc>
      <x-output-calc name="Resistencia a tracción" formula="$$f_t \cdot A$$" symbol="N" bind="calcs.traccionNFtA" unit="kg"></x-output-calc>
      <x-output-calc name="Comparación con la carga" formula=">" bind="calcs.traccionNFtACompara"></x-output-calc>
      <x-output-calc name="Verificación" bind="calcs.traccionNFtAOk"></x-output-calc>
    </x-table-result>
  </x-output-data>
</x-sheets.workbench>
