@pushOnce('initscripts')
  @vite('resources/js/diseno_acero_data.js')
@endPushOnce

<x-sheets.workbench mathjax sheet="acero-compresion" title="Diseño en acero · Compresión" x-data="diseño_acero"
  eyebrow="Herramientas de ingeniería / Estructuras de acero"
  description="Resistencia a compresión de un perfil de acero en los ejes x e y: esfuerzo de pandeo elástico Fe, esfuerzo crítico Fcr y resistencia de diseño por los métodos LRFD y ASD.">
  <x-input-data description="Material, factores de diseño y longitudes efectivas por eje.">
    <x-input-calc name="Factor de seguridad ASD" symbol="Ωc" bind="calcs.compresionOmegac"></x-input-calc>
    <x-input-calc name="Factor de resistencia LRFD" symbol="ϕc" bind="calcs.compresionPhic"></x-input-calc>
    <x-input-calc name="Esfuerzo de fluencia" symbol="Fy" bind="calcs.compresionFy" unit="kg/cm²"></x-input-calc>
    <x-input-calc name="Módulo de elasticidad" symbol="E" bind="calcs.compresionE" unit="kg/cm²"></x-input-calc>
    <x-input-calc name="Área bruta" symbol="Ag" bind="calcs.compresionA" unit="cm²"></x-input-calc>
    <x-input-calc name="Factor de longitud efectiva y" symbol="Ky" bind="calcs.compresionKy"></x-input-calc>
    <x-input-calc name="Longitud no arriostrada y" symbol="Ly" bind="calcs.compresionLy" unit="cm"></x-input-calc>
    <x-input-calc name="Radio de giro y" symbol="ry" bind="calcs.compresionRy" unit="cm"></x-input-calc>
    <x-input-calc name="Factor de longitud efectiva x" symbol="Kx" bind="calcs.compresionKx"></x-input-calc>
    <x-input-calc name="Longitud no arriostrada x" symbol="Lx" bind="calcs.compresionLx" unit="cm"></x-input-calc>
    <x-input-calc name="Radio de giro x" symbol="rx" bind="calcs.compresionRx" unit="cm"></x-input-calc>
  </x-input-data>
  <x-output-data description="Los resultados se recalculan al editar los datos generales.">
    <x-table-result-input title="1.- Datos del diseño">
      <x-output-calc-input name="Factor de seguridad ASD" symbol="Ωc" bind="calcs.compresionOmegac"></x-output-calc-input>
      <x-output-calc-input name="Factor de resistencia LRFD" symbol="ϕc" bind="calcs.compresionPhic"></x-output-calc-input>
      <x-output-calc-input name="Esfuerzo de fluencia" symbol="Fy" bind="calcs.compresionFy" unit="kg/cm²"></x-output-calc-input>
      <x-output-calc-input name="Módulo de elasticidad" symbol="E" bind="calcs.compresionE" unit="kg/cm²"></x-output-calc-input>
      <x-output-calc-input name="Área bruta" symbol="Ag" bind="calcs.compresionA" unit="cm²"></x-output-calc-input>
      <x-output-calc-input name="Factor de longitud efectiva y" symbol="Ky" bind="calcs.compresionKy"></x-output-calc-input>
      <x-output-calc-input name="Longitud no arriostrada y" symbol="Ly" bind="calcs.compresionLy" unit="cm"></x-output-calc-input>
      <x-output-calc-input name="Radio de giro y" symbol="ry" bind="calcs.compresionRy" unit="cm"></x-output-calc-input>
      <x-output-calc-input name="Esbeltez y" symbol="KL/ry" bind="calcs.compresionKlRy"></x-output-calc-input>
      <x-output-calc-input name="Factor de longitud efectiva x" symbol="Kx" bind="calcs.compresionKx"></x-output-calc-input>
      <x-output-calc-input name="Longitud no arriostrada x" symbol="Lx" bind="calcs.compresionLx" unit="cm"></x-output-calc-input>
      <x-output-calc-input name="Radio de giro x" symbol="rx" bind="calcs.compresionRx" unit="cm"></x-output-calc-input>
      <x-output-calc-input name="Esbeltez x" symbol="KL/rx" bind="calcs.compresionKlRx"></x-output-calc-input>
    </x-table-result-input>
    <x-table-result title="2.- Compresión">
      <x-output-calc name="Límite de esbeltez" formula="$$4.71\sqrt{\frac{E}{F_y}}$$" bind="calcs.compresionEfy"></x-output-calc>
      <x-output-calc name="Comparación de esbeltez" symbol="KL/ry" bind="calcs.compresionKlRyMenorMayor"></x-output-calc>
      <x-output-calc name="Esfuerzo de pandeo elástico y" symbol="$$Fe_y$$" bind="calcs.compresionFey" unit="kg/cm²"></x-output-calc>
      <x-output-calc name="Esfuerzo crítico y" symbol="$$Fcr_y$$" bind="calcs.compresionFcry" unit="kg/cm²"></x-output-calc>
      <x-output-calc name="Esfuerzo de pandeo elástico x" symbol="$$Fe_x$$" bind="calcs.compresionFex" unit="kg/cm²"></x-output-calc>
      <x-output-calc name="Esfuerzo crítico x" symbol="$$Fcr_x$$" bind="calcs.compresionFcrx" unit="kg/cm²"></x-output-calc>
    </x-table-result>
    <x-table-result title="3.- Método LRFD">
      <x-output-calc name="Resistencia de diseño y" formula="$$\phi F_{\text{cr}_y} A_g$$" symbol="$$\phi P_{n_y}$$" bind="calcs.compresionLFRDFcrAgy" unit="kg"></x-output-calc>
      <x-output-calc name="Resistencia de diseño y" formula="$$\phi F_{\text{cr}_y} A_g$$" symbol="$$\phi P_{n_y}$$" bind="calcs.compresionLFRDFcrAg1000y" unit="t"></x-output-calc>
      <x-output-calc name="Resistencia de diseño x" formula="$$\phi F_{\text{cr}_x} A_g$$" symbol="$$\phi P_{n_x}$$" bind="calcs.compresionLFRDFcrAgx" unit="kg"></x-output-calc>
      <x-output-calc name="Resistencia de diseño x" formula="$$\phi F_{\text{cr}_x} A_g$$" symbol="$$\phi P_{n_x}$$" bind="calcs.compresionLFRDFcrAg1000x" unit="t"></x-output-calc>
    </x-table-result>
    <x-table-result title="4.- Método ASD">
      <x-output-calc name="Resistencia admisible y" formula="$$\frac{P_{n_y}}{\Omega_c}$$" bind="calcs.compresionASDPnOmegaTy" unit="kg"></x-output-calc>
      <x-output-calc name="Resistencia admisible y" formula="$$\frac{P_{n_y}}{\Omega_c}$$" bind="calcs.compresionASDPnOmegaT1000y" unit="t"></x-output-calc>
      <x-output-calc name="Resistencia admisible x" formula="$$\frac{P_{n_x}}{\Omega_c}$$" bind="calcs.compresionASDPnOmegaTx" unit="kg"></x-output-calc>
      <x-output-calc name="Resistencia admisible x" formula="$$\frac{P_{n_x}}{\Omega_c}$$" bind="calcs.compresionASDPnOmegaT1000x" unit="t"></x-output-calc>
    </x-table-result>
  </x-output-data>
</x-sheets.workbench>
