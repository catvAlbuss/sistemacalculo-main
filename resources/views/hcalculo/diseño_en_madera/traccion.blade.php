@php
  $grupos = [['value' => 'A'], ['value' => 'B'], ['value' => 'C', 'selected' => true]];
@endphp

@pushOnce('initscripts')
  @vite('resources/js/diseño_madera_data.js')
@endPushOnce

<x-calc-layout title="Diseño En Madera | Tracción">
  <div class="container mx-auto flex flex-row flex-wrap items-start space-x-4 py-12 md:flex-nowrap"
    x-data="diseño_madera">
    <x-input-data>
      <x-input-select-calc name="Grupo" bind="calcs.grupo" unit="Kg/cm2" :options='$grupos'></x-input-select-calc>
      <x-input-calc name="Axial" bind="calcs.traccionAxial" unit="Kg"></x-input-calc>
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
        <x-output-calc name="Esfuerzo admisible al corte paralela" symbol="Fv" bind="calcs.diseñoFv"
          unit="Kg/cm2"></x-output-calc>
        <x-output-calc name="Axial" bind="calcs.traccionAxial" unit="Kg"></x-output-calc>
      </x-table-result>
      <x-table-result title="2.- Tracción">
        <x-output-calc formula="$$f_t \cdot A$$" symbol="N" bind="calcs.traccionNFtA"></x-output-calc>
        <x-output-calc formula=">" bind="calcs.traccionNFtACompara"></x-output-calc>
        <x-output-calc bind="calcs.traccionNFtAOk"></x-output-calc>
      </x-table-result>
    </x-output-data>
  </div>
</x-calc-layout>
