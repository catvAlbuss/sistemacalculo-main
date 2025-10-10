@php
  $grupos = [['value' => 'A'], ['value' => 'B'], ['value' => 'C', 'selected' => true]];
  $secciones = array_map(function ($value) {
      return ['value' => $value];
  }, range(1, 62, 1));
@endphp

@pushOnce('initscripts')
  @vite('resources/js/diseño_madera_data.js')
@endPushOnce

<x-calc-layout title="Diseño En Madera | Flexocompresion">
  <div class="container mx-auto flex flex-row flex-wrap items-start space-x-4 py-12 md:flex-nowrap"
    x-data="diseño_madera">
    <x-input-data>
      <x-input-select-calc name="Grupo" bind="calcs.grupo" unit="Kg/cm2" :options='$grupos'></x-input-select-calc>
      <x-input-calc name="Longitud efectiva" symbol="lef" bind="calcs.diseñoLef" unit="m"></x-input-calc>
      <x-input-calc name="Axial" bind="calcs.flexocompresionAxial" unit="kg"></x-input-calc>
      <x-input-calc name="Momento" bind="calcs.flexocompresionMomento" unit="kg-m"></x-input-calc>
      <x-input-select-calc name="Sección" bind="calcs.flexocompresionSeccion" unit="Kg/cm2" :options='$secciones'
        unit="cm3"></x-input-select-calc>
      <x-input-calc symbol="A" bind="calcs.flexocompresionA" unit="cm2"></x-input-calc>
      <x-input-calc symbol="Lx" bind="calcs.flexocompresionLx" unit="cm4"></x-input-calc>
      <x-input-calc symbol="Zx" bind="calcs.flexocompresionZx" unit="cm3"></x-input-calc>
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
        <x-output-calc name="Axial" bind="calcs.flexocompresionAxial" unit="kg"></x-output-calc>
        <x-output-calc name="Momento" bind="calcs.flexocompresionMomento" unit="kg-m"></x-output-calc>
        <x-output-calc name="Seccion" bind="calcs.flexocompresionSeccion"></x-output-calc>
        <x-output-calc symbol="A" bind="calcs.flexocompresionA" unit="cm2"></x-output-calc>
        <x-output-calc symbol="Lx" bind="calcs.flexocompresionLx" unit="cm4"></x-output-calc>
        <x-output-calc symbol="Zx" bind="calcs.flexocompresionZx" unit="cm3"></x-output-calc>
      </x-table-result>
      <x-table-result title="2.- Flexocompresion">
        <x-output-calc symbol="b" bind="calcs.flexocompresionB" unit="pulg"></x-output-calc>
        <x-output-calc symbol="b" bind="calcs.flexocompresionBcm" unit="cm"></x-output-calc>
        <x-output-calc symbol="d" bind="calcs.flexocompresionD" unit="pulg"></x-output-calc>
        <x-output-calc symbol="d" bind="calcs.flexocompresionDcm" unit="cm"></x-output-calc>
        <x-output-calc symbol="A" bind="calcs.flexocompresionA" unit="cm2"></x-output-calc>
        <x-output-calc symbol="Ix" bind="calcs.flexocompresionLx" unit="cm4"></x-output-calc>
        <x-output-calc symbol="Zx" bind="calcs.flexocompresionZx" unit="cm3"></x-output-calc>
        <x-output-calc name="Esbeltez" formula="$$\lambda_x = \frac{l_{\text{ef}}}{d}$$"
          bind="calcs.flexocompresionEsbeltez"></x-output-calc>
        <x-output-calc name="Esbeltez" bind="calcs.flexocompresionColumnaTipo"></x-output-calc>
        <x-output-calc symbol="Ck" bind="calcs.flexocompresionCk"></x-output-calc>
        <x-output-calc name="Columnas cortas" formula="$$N_{\text{adm}} = f_c \cdot A$$" symbol="λ < 10"
          bind="calcs.flexocompresionColumnasCortas"></x-output-calc>
        <x-output-calc name="Columnas intermedias"
          formula="$$N_{\text{adm}} = f_c \cdot A \cdot \left[ 1 - \frac{1}{3}\left(\frac{\lambda}{C_k}\right)^4 \right]$$"
          symbol="10< λ <Ck" bind="calcs.flexocompresionColumnasIntermedias"></x-output-calc>
        <x-output-calc name="Columnas largas" formula="$$N_{\text{adm}} = 0.329 \frac{E \cdot A}{\lambda^2}$$"
          symbol="Ck< λ <50" bind="calcs.flexocompresionColumnasLargas"></x-output-calc>
        <x-output-calc name="Nadm" bind="calcs.flexocompresionNadm" unit="kg"></x-output-calc>
        <x-output-calc bind="calcs.flexocompresionOk"></x-output-calc>
        <x-output-calc
          name="Carga crítica de Euler para pandeo en la dirección en que se aplican los momentos de flexión"
          formula="$$N_{\text{cr}} = \frac{\pi^2 E I}{l_{\text{ef}}^2}$$"
          bind="calcs.flexocompresionNer"></x-output-calc>
        <x-output-calc
          name="Cuando existen flexión y compresión combinadas, los momentos flectores se amplifican por acción de cargas axiales"
          formula="$$k_m = \frac{1}{1 - 1.5 \frac{N}{N_{\text{cr}}}}$$"
          bind="calcs.flexocompresionKm"></x-output-calc>
        <x-output-calc name="Entonces se Tiene" formula=""
          formula="$$\frac{N}{N_{\text{adm}}} + \frac{k_m M}{Z f_m}$$" bind="calcs.flexocompresionEntonces"
          unit="ok"></x-output-calc>
        <x-output-calc
          name="El espaciamiento entre correas, para garantizar una esbeltez fuera del plano de la cuerda (λy) igual o menor a la del plano (λx), será igual a:"
          formula="$$l_c = \lambda_x\, b$$" symbol="lc" bind="calcs.flexocompresionLc"
          unit="cm"></x-output-calc>
        <x-output-calc name="Usar" bind="calcs.flexocompresionUsar" unit="pulg"></x-output-calc>
      </x-table-result>
    </x-output-data>
  </div>
</x-calc-layout>
