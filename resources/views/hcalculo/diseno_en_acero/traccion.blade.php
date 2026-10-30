@pushOnce('initscripts')
  @vite('resources/js/diseno_acero_data.js')
@endPushOnce

<x-sheets.workbench mathjax sheet="acero-traccion" title="Diseño en acero · Tracción" x-data="diseño_acero"
  eyebrow="Herramientas de ingeniería / Estructuras de acero"
  description="Resistencia a tracción de un elemento de acero por fluencia en la sección total y por fractura, por los métodos LRFD y ASD, y radio de giro mínimo según la esbeltez límite.">
  <x-input-data description="Material, factores de diseño y geometría del elemento.">
    <x-input-calc name="Resistencia última a tracción" symbol="Fu" bind="calcs.traccionFu" unit="kg/cm²"></x-input-calc>
    <x-input-calc name="Esfuerzo de fluencia" symbol="Fy" bind="calcs.traccionFy" unit="kg/cm²"></x-input-calc>
    <x-input-calc name="Factor de seguridad ASD" symbol="Ωt" bind="calcs.traccionOmegat"></x-input-calc>
    <x-input-calc name="Factor de resistencia por fractura" symbol="ϕt" bind="calcs.traccionPhitResistencia"></x-input-calc>
    <x-input-calc name="Factor de resistencia por fluencia" symbol="ϕt" bind="calcs.traccionPhitFluencia"></x-input-calc>
    <x-input-calc name="Longitud del elemento" symbol="L" bind="calcs.traccionL" unit="cm"></x-input-calc>
    <x-input-calc name="Esbeltez límite" symbol="L/r" bind="calcs.traccionV"></x-input-calc>
    <x-input-calc name="Área bruta" symbol="Ag" bind="calcs.traccionAg" unit="cm²"></x-input-calc>
  </x-input-data>
  <x-output-data description="Los resultados se recalculan al editar los datos generales.">
    <x-table-result-input title="1.- Datos del diseño">
      <x-output-calc-input name="Resistencia última a tracción" symbol="Fu" bind="calcs.traccionFu" unit="kg/cm²"></x-output-calc-input>
      <x-output-calc-input name="Esfuerzo de fluencia" symbol="Fy" bind="calcs.traccionFy" unit="kg/cm²"></x-output-calc-input>
      <x-output-calc-input name="Factor de seguridad ASD" symbol="Ωt" bind="calcs.traccionOmegat"></x-output-calc-input>
      <x-output-calc-input name="Factor de resistencia por fractura" symbol="ϕt" bind="calcs.traccionPhitResistencia"></x-output-calc-input>
      <x-output-calc-input name="Factor de resistencia por fluencia" symbol="ϕt" bind="calcs.traccionPhitFluencia"></x-output-calc-input>
      <x-output-calc-input name="Longitud del elemento" symbol="L" bind="calcs.traccionL" unit="cm"></x-output-calc-input>
      <x-output-calc-input name="Esbeltez límite" symbol="L/r" bind="calcs.traccionV"></x-output-calc-input>
      <x-output-calc-input name="Área bruta" symbol="Ag" bind="calcs.traccionAg" unit="cm²"></x-output-calc-input>
    </x-table-result-input>
    <x-table-result title="2.- Fluencia en la sección total">
      <x-output-calc name="Resistencia nominal" symbol="Pn" bind="calcs.traccionFluenciaPn" unit="kg"></x-output-calc>
    </x-table-result>
    <x-table-result title="2.1.- Método LRFD">
      <x-output-calc name="Resistencia de diseño" formula="$$\phi_t \cdot P_n$$" bind="calcs.traccionFluenciaMetodoLRFDFtPn" unit="kg"></x-output-calc>
      <x-output-calc name="Resistencia de diseño" formula="$$\phi_t \cdot P_n$$" bind="calcs.traccionFluenciaMetodoLRFDFtPnTn" unit="t"></x-output-calc>
    </x-table-result>
    <x-table-result title="2.2.- Método ASD">
      <x-output-calc name="Resistencia admisible" formula="$$\frac{P_n}{\Omega_t}$$" bind="calcs.traccionFluenciaMetodoASDPnOmt" unit="kg"></x-output-calc>
      <x-output-calc name="Resistencia admisible" formula="$$\frac{P_n}{\Omega_t}$$" bind="calcs.traccionFluenciaMetodoASDPnOmtTn" unit="t"></x-output-calc>
    </x-table-result>
    <x-table-result title="3.- Fractura por tracción">
      <x-output-calc name="Resistencia nominal" symbol="Pn" bind="calcs.traccionResistenciaPn" unit="kg"></x-output-calc>
    </x-table-result>
    <x-table-result title="3.1.- Método LRFD">
      <x-output-calc name="Resistencia de diseño" formula="$$\phi_t \cdot P_n$$" bind="calcs.traccionResistenciaMetodoLRFDFtPn" unit="kg"></x-output-calc>
      <x-output-calc name="Resistencia de diseño" formula="$$\phi_t \cdot P_n$$" bind="calcs.traccionResistenciaMetodoLRFDFtPnTn" unit="t"></x-output-calc>
    </x-table-result>
    <x-table-result title="3.2.- Método ASD">
      <x-output-calc name="Resistencia admisible" formula="$$\frac{P_n}{\Omega_t}$$" bind="calcs.traccionResistenciaMetodoASDPnOmt" unit="kg"></x-output-calc>
      <x-output-calc name="Resistencia admisible" formula="$$\frac{P_n}{\Omega_t}$$" bind="calcs.traccionResistenciaMetodoASDPnOmtTn" unit="t"></x-output-calc>
    </x-table-result>
    <x-table-result title="4.- Radio de giro mínimo">
      <x-output-calc name="Radio de giro mínimo" formula="$$r_{\text{min}} = \frac{L}{(L/r)_{\text{lím}}}$$" symbol="$$r_{\text{min}}$$" bind="calcs.radioDeGiroMinimo" unit="cm"></x-output-calc>
    </x-table-result>
  </x-output-data>
</x-sheets.workbench>
