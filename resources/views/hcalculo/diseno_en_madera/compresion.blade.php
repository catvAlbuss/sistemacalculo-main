@php
  $grupos = [['value' => 'A'], ['value' => 'B'], ['value' => 'C', 'selected' => true]];
  $secciones = array_map(fn ($value) => ['value' => $value], range(1, 62));
@endphp

@pushOnce('initscripts')
  @vite('resources/js/diseno_madera_data.js')
@endPushOnce

<x-sheets.workbench mathjax sheet="madera-compresion" title="Diseño en madera · Compresión" x-data="diseño_madera"
  eyebrow="Herramientas de ingeniería / Estructuras de madera"
  description="Verificación de un elemento de madera sometido a compresión axial: clasificación por esbeltez (columna corta, intermedia o larga) y carga admisible Nadm de la sección.">
  <x-input-data description="Grupo estructural, carga, longitud y sección de catálogo.">
    <x-input-select-calc name="Grupo estructural" bind="calcs.grupo" :options="$grupos"></x-input-select-calc>
    <x-input-calc name="Carga axial" symbol="N" bind="calcs.compresionAxial" unit="kg"></x-input-calc>
    <x-input-calc name="Longitud efectiva" symbol="lef" bind="calcs.compresionLongitudEfectiva" unit="cm"></x-input-calc>
    <x-input-select-calc name="Sección" symbol="n.º" bind="calcs.compresionSeccion" :options="$secciones"></x-input-select-calc>
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
      <x-output-calc name="Carga axial" symbol="N" bind="calcs.compresionAxial" unit="kg"></x-output-calc>
      <x-output-calc name="Longitud efectiva" symbol="$$0.8 \cdot l_d$$" bind="calcs.compresionLongitudEfectiva" unit="cm"></x-output-calc>
      <x-output-calc name="Sección" bind="calcs.compresionSeccion"></x-output-calc>
      <x-output-calc name="Área de la sección" symbol="A" bind="calcs.compresionA" unit="cm²"></x-output-calc>
      <x-output-calc name="Momento de inercia" symbol="Ix" bind="calcs.compresionLx" unit="cm⁴"></x-output-calc>
      <x-output-calc name="Módulo de sección" symbol="Zx" bind="calcs.compresionZx" unit="cm³"></x-output-calc>
    </x-table-result>
    <x-table-result title="2.- Compresión">
      <x-output-calc name="Ancho" symbol="b" bind="calcs.compresionB" unit="pulg"></x-output-calc>
      <x-output-calc name="Ancho" symbol="b" bind="calcs.compresionBcm" unit="cm"></x-output-calc>
      <x-output-calc name="Peralte" symbol="d" bind="calcs.compresionD" unit="pulg"></x-output-calc>
      <x-output-calc name="Peralte" symbol="d" bind="calcs.compresionDcm" unit="cm"></x-output-calc>
      <x-output-calc name="Esbeltez" formula="$$\lambda_x = \frac{l_{\text{ef}}}{d}$$" bind="calcs.compresionEsbeltez"></x-output-calc>
      <x-output-calc name="Esbeltez límite de columna intermedia" symbol="Ck" bind="calcs.compresionCk"></x-output-calc>
      <x-output-calc name="Columna corta" formula="$$N_{\text{adm}} = f_c \cdot A$$" symbol="λ < 10" bind="calcs.compresionColumnasCortas"></x-output-calc>
      <x-output-calc name="Columna intermedia" formula="$$N_{\text{adm}} = f_c \cdot A \cdot \left[ 1 - \frac{1}{3}\left(\frac{\lambda}{C_k}\right)^4 \right]$$" symbol="10 < λ < Ck" bind="calcs.compresionColumnasIntermedias"></x-output-calc>
      <x-output-calc name="Columna larga" formula="$$N_{\text{adm}} = 0.329 \frac{E \cdot A}{\lambda^2}$$" symbol="Ck < λ < 50" bind="calcs.compresionColumnasLargas"></x-output-calc>
      <x-output-calc name="Carga admisible" symbol="Nadm" bind="calcs.compresionNadm" unit="kg"></x-output-calc>
      <x-output-calc name="Verificación" bind="calcs.compresionNadmOk"></x-output-calc>
      <x-output-calc name="Sección a usar" bind="calcs.compresionUsar" unit="pulg"></x-output-calc>
    </x-table-result>
  </x-output-data>
</x-sheets.workbench>
