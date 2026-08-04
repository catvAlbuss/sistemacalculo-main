@php
  $grupos = [['value' => 'A'], ['value' => 'B'], ['value' => 'C', 'selected' => true]];
  $secciones = array_map(function ($value) {
      return ['value' => $value];
  }, range(1, 62, 1));
@endphp

@pushOnce('initscripts')
  @vite('resources/js/diseno_madera_data.js')
@endPushOnce

<x-calc-layout title="Diseño En Madera | Compresion">
  <div class="container mx-auto flex flex-row flex-wrap items-start space-x-4 py-12 md:flex-nowrap"
    x-data="diseño_madera">
    <x-input-data>
      <x-input-select-calc name="Grupo" bind="calcs.grupo" unit="Kg/cm2" :options='$grupos'></x-input-select-calc>
      <x-input-calc name="Axial" bind="calcs.compresionAxial" unit="kg"></x-input-calc>
      <x-input-calc name="Longitud Efectiva" bind="calcs.compresionLongitudEfectiva" unit="cm"></x-input-calc>
      <x-input-select-calc name="Sección" bind="calcs.compresionSeccion" unit="" :options='$secciones'></x-input-select-calc>
      <div class="mt-4 text-center">
        <button x-on:click="calcular()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Calcular
        </button>
      </div>
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
        <x-output-calc name="Axial" bind="calcs.compresionAxial" unit="cm3"></x-output-calc>
        <x-output-calc name="Longitud Efectiva" symbol="$$0.8 \cdot l_d$$" bind="calcs.compresionLongitudEfectiva"
          unit="cm3"></x-output-calc>
        <x-output-calc name="Sección" bind="calcs.compresionSeccion" unit="cm3"></x-output-calc>
        <x-output-calc symbol="A" bind="calcs.compresionA" unit="cm2"></x-output-calc>
        <x-output-calc symbol="lx" bind="calcs.compresionLx" unit="cm4"></x-output-calc>
        <x-output-calc symbol="Zx" bind="calcs.compresionZx" unit="cm3"></x-output-calc>
      </x-table-result>
      <x-table-result title="2.- Compresion">
        <x-output-calc symbol="b" bind="calcs.compresionB" unit="pulg"></x-output-calc>
        <x-output-calc symbol="b" bind="calcs.compresionBcm" unit="cm"></x-output-calc>
        <x-output-calc symbol="d" bind="calcs.compresionD" unit="pulg"></x-output-calc>
        <x-output-calc symbol="d" bind="calcs.compresionDcm" unit="cm"></x-output-calc>
        <x-output-calc name="Esbeltez" formula="$$\lambda_x = \frac{l_{\text{ef}}}{d}$$"
          bind="calcs.compresionEsbeltez"></x-output-calc>
        <x-output-calc symbol="Ck" bind="calcs.compresionCk"></x-output-calc>
        <x-output-calc name="Columnas cortas" formula="$$N_{\text{adm}} = f_c \cdot A$$" symbol="λ < 10"
          bind="calcs.compresionColumnasCortas"></x-output-calc>
        <x-output-calc name="Columnas intermedias"
          formula="$$N_{\text{adm}} = f_c \cdot A \cdot \left[ 1 - \frac{1}{3}\left(\frac{\lambda}{C_k}\right)^4 \right]$$"
          symbol="10< λ <Ck" bind="calcs.compresionColumnasIntermedias"></x-output-calc>
        <x-output-calc name="Columnas largas" formula="$$N_{\text{adm}} = 0.329 \frac{E \cdot A}{\lambda^2}$$"
          symbol="Ck< λ <50" bind="calcs.compresionColumnasLargas"></x-output-calc>
        <x-output-calc name="Nadm" bind="calcs.compresionNadm" unit="kg"></x-output-calc>
        <x-output-calc bind="calcs.compresionNadmOk"></x-output-calc>
        <x-output-calc name="Usar" bind="calcs.compresionUsar" unit="pulg"></x-output-calc>
      </x-table-result>
    </x-output-data>
  </div>
</x-calc-layout>
