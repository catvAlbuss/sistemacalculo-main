@php
  $grupos = [['value' => 'A'], ['value' => 'B'], ['value' => 'C', 'selected' => true]];
  $secciones = array_map(function ($value) {
      return ['value' => $value];
  }, range(1, 62, 1));
@endphp

@pushOnce('initscripts')
  @vite('resources/js/diseño_madera_data.js')
@endPushOnce

<x-calc-layout title="Diseño En Madera | Flexotracción">
  <div class="container mx-auto flex flex-row flex-wrap items-start space-x-4 py-12 md:flex-nowrap"
    x-data="diseño_madera">
    <x-input-data>
      <x-input-select-calc name="Grupo" bind="calcs.grupo" unit="Kg/cm2" :options='$grupos'></x-input-select-calc>
      <x-input-calc name="Longitud efectiva" symbol="lef" bind="calcs.diseñoLef" unit="m"></x-input-calc>
      <x-input-calc name="Axial" bind="calcs.flexotraccionAxial" unit="kg"></x-input-calc>
      <x-input-calc name="Momento" bind="calcs.flexotraccionMomento" unit="kg-m"></x-input-calc>
      <x-input-select-calc name="Sección" bind="calcs.flexotraccionSeccion" unit="Kg/cm2" :options='$secciones'
        unit="cm3"></x-input-select-calc>
      <x-input-calc symbol="b" bind="calcs.flexotraccionB" unit="pulg"></x-input-calc>
      <x-input-calc symbol="d" bind="calcs.flexotraccionD" unit="pulg"></x-input-calc>
    </x-input-data>
    <x-output-data>
      <x-table-result title="1.- Prerequisitos del Diseño">
        <x-output-calc name="Grupo" bind="calcs.grupo"></x-output-calc>
        <x-output-calc name="Modulo de elasticidad minimo" symbol="Emin" bind="calcs.diseñoEmin"
          unit="Kg/cm2"></x-output-calc>
        <x-output-calc name="Esfuerzo admisible a la flexión" symbol="Fm" bind="calcs.diseñoFm"
          unit="Kg/cm2"></x-output-calc>
        <x-output-calc name="Esfuerzo admisible ala compresion paralela" symbol="Fc" bind="calcs.diseñoFc"
          unit="Kg/cm2"></x-output-calc>
        <x-output-calc name="Esfuerzo admisible a la Traccion paralela" symbol="Ft" bind="calcs.diseñoFt"
          unit="Kg/cm2"></x-output-calc>
        <x-output-calc name="Esfuerzo admisible al corte parealela" symbol="Fv" bind="calcs.diseñoFv"
          unit="Kg/cm2"></x-output-calc>
        <x-output-calc name="Longitud efectiva" symbol="lef" bind="calcs.diseñoLef" unit="m"></x-output-calc>
        <x-output-calc name="Axial" bind="calcs.flexotraccionAxial" unit="kg"></x-output-calc>
        <x-output-calc name="Momento" bind="calcs.flexotraccionMomento" unit="kg-m"></x-output-calc>
        <x-output-calc name="Seccion" bind="calcs.flexotraccionSeccion"></x-output-calc>
        <x-output-calc symbol="b" bind="calcs.flexotraccionB" unit="pulg"></x-output-calc>
        <x-output-calc symbol="b" bind="calcs.flexotraccionBcm" unit="cm"></x-output-calc>
        <x-output-calc symbol="d" bind="calcs.flexotraccionD" unit="pulg"></x-output-calc>
        <x-output-calc symbol="d" bind="calcs.flexotraccionDcm" unit="cm"></x-output-calc>
        <x-output-calc name="A" bind="calcs.flexotraccionA" unit="cm2"></x-output-calc>
        <x-output-calc name="Lx" bind="calcs.flexotraccionLx" unit="cm4"></x-output-calc>
        <x-output-calc name="Zx" bind="calcs.flexotraccionZx" unit="cm3"></x-output-calc>
      </x-table-result>
      <x-table-result title="2.- Flexotracción">
        <x-output-calc name="Donde" bind="calcs.flexotraccionDonde"></x-output-calc>
        <x-output-calc formula="< 1" bind="calcs.flexotraccionCambiarSeccion"></x-output-calc>
        <x-output-calc name="Usar" bind="calcs.flexotraccionUsar" unit="pulg"></x-output-calc>
      </x-table-result>
    </x-output-data>
  </div>
</x-calc-layout>
