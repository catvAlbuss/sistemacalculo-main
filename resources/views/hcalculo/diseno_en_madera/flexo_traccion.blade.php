@php
  $grupos = [['value' => 'A'], ['value' => 'B'], ['value' => 'C', 'selected' => true]];
  $secciones = array_map(fn ($value) => ['value' => $value], range(1, 62));
@endphp

@pushOnce('initscripts')
  @vite('resources/js/diseno_madera_data.js')
@endPushOnce

<x-sheets.workbench sheet="madera-flexotraccion" title="Diseño en madera · Flexotracción" x-data="diseño_madera"
  eyebrow="Herramientas de ingeniería / Estructuras de madera"
  description="Verificación de un elemento de madera sometido a tracción axial y momento flector mediante la interacción de esfuerzos de la sección elegida.">
  <x-input-data description="Grupo estructural, sección de catálogo y solicitaciones.">
    <x-input-select-calc name="Grupo estructural" bind="calcs.grupo" :options="$grupos"></x-input-select-calc>
    <x-input-calc name="Longitud efectiva" symbol="lef" bind="calcs.diseñoLef" unit="m"></x-input-calc>
    <x-input-select-calc name="Sección" symbol="n.º" bind="calcs.flexotraccionSeccion" :options="$secciones"></x-input-select-calc>
    <x-input-calc name="Carga axial" symbol="N" bind="calcs.flexotraccionAxial" unit="kg"></x-input-calc>
    <x-input-calc name="Momento flector" symbol="M" bind="calcs.flexotraccionMomento" unit="kg·m"></x-input-calc>
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
      <x-output-calc name="Longitud efectiva" symbol="lef" bind="calcs.diseñoLef" unit="m"></x-output-calc>
      <x-output-calc name="Carga axial" symbol="N" bind="calcs.flexotraccionAxial" unit="kg"></x-output-calc>
      <x-output-calc name="Momento flector" symbol="M" bind="calcs.flexotraccionMomento" unit="kg·m"></x-output-calc>
      <x-output-calc name="Sección" bind="calcs.flexotraccionSeccion"></x-output-calc>
      <x-output-calc name="Ancho" symbol="b" bind="calcs.flexotraccionB" unit="pulg"></x-output-calc>
      <x-output-calc name="Ancho" symbol="b" bind="calcs.flexotraccionBcm" unit="cm"></x-output-calc>
      <x-output-calc name="Peralte" symbol="d" bind="calcs.flexotraccionD" unit="pulg"></x-output-calc>
      <x-output-calc name="Peralte" symbol="d" bind="calcs.flexotraccionDcm" unit="cm"></x-output-calc>
      <x-output-calc name="Área de la sección" symbol="A" bind="calcs.flexotraccionA" unit="cm²"></x-output-calc>
      <x-output-calc name="Momento de inercia" symbol="Ix" bind="calcs.flexotraccionLx" unit="cm⁴"></x-output-calc>
      <x-output-calc name="Módulo de sección" symbol="Zx" bind="calcs.flexotraccionZx" unit="cm³"></x-output-calc>
    </x-table-result>
    <x-table-result title="2.- Flexotracción">
      <x-output-calc name="Interacción de esfuerzos" symbol="< 1" bind="calcs.flexotraccionCambiarSeccion"></x-output-calc>
      <x-output-calc name="Sección a usar" bind="calcs.flexotraccionUsar" unit="pulg"></x-output-calc>
    </x-table-result>
  </x-output-data>
</x-sheets.workbench>
