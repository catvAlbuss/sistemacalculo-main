@php
  $grupos = [['value' => 'A'], ['value' => 'B'], ['value' => 'C', 'selected' => true]];
  $secciones = array_map(fn ($value) => ['value' => $value], range(1, 62));
@endphp

@pushOnce('initscripts')
  @vite('resources/js/diseno_madera_data.js')
@endPushOnce

<x-sheets.workbench mathjax sheet="madera-flexocompresion" title="Diseño en madera · Flexocompresión" x-data="diseño_madera"
  eyebrow="Herramientas de ingeniería / Estructuras de madera"
  description="Verificación de un elemento de madera sometido a compresión y momento flector: esbeltez, carga crítica de Euler, factor de amplificación km e interacción N/Nadm + km·M/(Z·fm).">
  <x-input-data description="Grupo estructural, solicitaciones y propiedades de la sección.">
    <x-input-select-calc name="Grupo estructural" bind="calcs.grupo" :options="$grupos"></x-input-select-calc>
    <x-input-calc name="Longitud efectiva" symbol="lef" bind="calcs.diseñoLef" unit="m"></x-input-calc>
    <x-input-calc name="Carga axial" symbol="N" bind="calcs.flexocompresionAxial" unit="kg"></x-input-calc>
    <x-input-calc name="Momento flector" symbol="M" bind="calcs.flexocompresionMomento" unit="kg·m"></x-input-calc>
    <x-input-select-calc name="Sección" symbol="n.º" bind="calcs.flexocompresionSeccion" :options="$secciones"></x-input-select-calc>
    <x-input-calc name="Área de la sección" symbol="A" bind="calcs.flexocompresionA" unit="cm²"></x-input-calc>
    <x-input-calc name="Momento de inercia" symbol="Ix" bind="calcs.flexocompresionLx" unit="cm⁴"></x-input-calc>
    <x-input-calc name="Módulo de sección" symbol="Zx" bind="calcs.flexocompresionZx" unit="cm³"></x-input-calc>
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
      <x-output-calc name="Carga axial" symbol="N" bind="calcs.flexocompresionAxial" unit="kg"></x-output-calc>
      <x-output-calc name="Momento flector" symbol="M" bind="calcs.flexocompresionMomento" unit="kg·m"></x-output-calc>
      <x-output-calc name="Sección" bind="calcs.flexocompresionSeccion"></x-output-calc>
      <x-output-calc name="Área de la sección" symbol="A" bind="calcs.flexocompresionA" unit="cm²"></x-output-calc>
      <x-output-calc name="Momento de inercia" symbol="Ix" bind="calcs.flexocompresionLx" unit="cm⁴"></x-output-calc>
      <x-output-calc name="Módulo de sección" symbol="Zx" bind="calcs.flexocompresionZx" unit="cm³"></x-output-calc>
    </x-table-result>
    <x-table-result title="2.- Flexocompresión">
      <x-output-calc name="Ancho" symbol="b" bind="calcs.flexocompresionB" unit="pulg"></x-output-calc>
      <x-output-calc name="Ancho" symbol="b" bind="calcs.flexocompresionBcm" unit="cm"></x-output-calc>
      <x-output-calc name="Peralte" symbol="d" bind="calcs.flexocompresionD" unit="pulg"></x-output-calc>
      <x-output-calc name="Peralte" symbol="d" bind="calcs.flexocompresionDcm" unit="cm"></x-output-calc>
      <x-output-calc name="Esbeltez" formula="$$\lambda_x = \frac{l_{\text{ef}}}{d}$$" bind="calcs.flexocompresionEsbeltez"></x-output-calc>
      <x-output-calc name="Tipo de columna" bind="calcs.flexocompresionColumnaTipo"></x-output-calc>
      <x-output-calc name="Esbeltez límite de columna intermedia" symbol="Ck" bind="calcs.flexocompresionCk"></x-output-calc>
      <x-output-calc name="Columna corta" formula="$$N_{\text{adm}} = f_c \cdot A$$" symbol="λ < 10" bind="calcs.flexocompresionColumnasCortas"></x-output-calc>
      <x-output-calc name="Columna intermedia" formula="$$N_{\text{adm}} = f_c \cdot A \cdot \left[ 1 - \frac{1}{3}\left(\frac{\lambda}{C_k}\right)^4 \right]$$" symbol="10 < λ < Ck" bind="calcs.flexocompresionColumnasIntermedias"></x-output-calc>
      <x-output-calc name="Columna larga" formula="$$N_{\text{adm}} = 0.329 \frac{E \cdot A}{\lambda^2}$$" symbol="Ck < λ < 50" bind="calcs.flexocompresionColumnasLargas"></x-output-calc>
      <x-output-calc name="Carga admisible" symbol="Nadm" bind="calcs.flexocompresionNadm" unit="kg"></x-output-calc>
      <x-output-calc name="Verificación" bind="calcs.flexocompresionOk"></x-output-calc>
      <x-output-calc name="Carga crítica de Euler en el plano de flexión" formula="$$N_{\text{cr}} = \frac{\pi^2 E I}{l_{\text{ef}}^2}$$" symbol="Ncr" bind="calcs.flexocompresionNer"></x-output-calc>
      <x-output-calc name="Factor de amplificación de momentos" formula="$$k_m = \frac{1}{1 - 1.5 \frac{N}{N_{\text{cr}}}}$$" symbol="km" bind="calcs.flexocompresionKm"></x-output-calc>
      <x-output-calc name="Interacción carga axial y flexión" formula="$$\frac{N}{N_{\text{adm}}} + \frac{k_m M}{Z f_m}$$" bind="calcs.flexocompresionEntonces"></x-output-calc>
      <x-output-calc name="Espaciamiento entre correas para λy ≤ λx" formula="$$l_c = \lambda_x\, b$$" symbol="lc" bind="calcs.flexocompresionLc" unit="cm"></x-output-calc>
      <x-output-calc name="Sección a usar" bind="calcs.flexocompresionUsar" unit="pulg"></x-output-calc>
    </x-table-result>
  </x-output-data>
</x-sheets.workbench>
