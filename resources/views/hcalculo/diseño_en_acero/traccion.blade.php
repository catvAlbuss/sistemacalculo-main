@php
  $inputs = [];
@endphp

@pushOnce('initscripts')
  @vite('resources/js/diseño_acero_data.js')
@endPushOnce

<x-calc-layout title="Diseño En Acero | Traccion">
  <div class="container mx-auto flex flex-row flex-wrap space-x-4 py-12 md:flex-nowrap" x-data="diseño_acero">
    <x-input-data>
      <x-input-calc symbol="Fu" bind="calcs.traccionFu" unit="Kg/cm2"></x-input-calc>
      <x-input-calc symbol="Fy" bind="calcs.traccionFy" unit="Kg/cm2"></x-input-calc>
      <x-input-calc symbol="Ωt" bind="calcs.traccionOmegat"></x-input-calc>
      <x-input-calc name="Resistencia" symbol="∅t" bind="calcs.traccionPhitResistencia"></x-input-calc>
      <x-input-calc name="Fluencia" symbol="∅t" bind="calcs.traccionPhitFluencia"></x-input-calc>
      <x-input-calc symbol="L" bind="calcs.traccionL" unit="cm"></x-input-calc>
      <x-input-calc symbol="V" bind="calcs.traccionV"></x-input-calc>
      <x-input-calc symbol="Ag" bind="calcs.traccionAg" unit="cm2"></x-input-calc>
    </x-input-data>
    <x-output-data>
      <x-table-result-input title="1.- Prerequisitos del Diseño">
        <x-output-calc-input symbol="Fu" bind="calcs.traccionFu" unit="Kg/cm2"></x-output-calc-input>
        <x-output-calc-input symbol="Fy" bind="calcs.traccionFy" unit="Kg/cm2"></x-output-calc-input>
        <x-output-calc-input symbol="Ωt" bind="calcs.traccionOmegat"></x-output-calc-input>
        <x-output-calc-input name="Resistencia" symbol="∅t"
          bind="calcs.traccionPhitResistencia"></x-output-calc-input>
        <x-output-calc-input name="Fluencia" symbol="∅t" bind="calcs.traccionPhitFluencia"></x-output-calc-input>
        <x-output-calc-input symbol="L" bind="calcs.traccionL" unit="cm"></x-output-calc-input>
        <x-output-calc-input symbol="V" bind="calcs.traccionV"></x-output-calc-input>
        <x-output-calc-input symbol="Ag" bind="calcs.traccionAg" unit="cm2"></x-output-calc-input>
      </x-table-result-input>
      <x-table-result title="2.- Fluencia En La Seccion Total">
        <x-output-calc symbol="Pn" bind="calcs.traccionFluenciaPn" unit="Kg"></x-output-calc>
      </x-table-result>
      <x-table-result title="2.1.- Metodo LRFD">
        <x-output-calc formula="$$F_t \cdot P_n$$" bind="calcs.traccionFluenciaMetodoLRFDFtPn"
          unit="Kg"></x-output-calc>
        <x-output-calc formula="$$F_t \cdot P_n$$" bind="calcs.traccionFluenciaMetodoLRFDFtPnTn"
          unit="Tn"></x-output-calc>
      </x-table-result>
      <x-table-result title="2.2.- Metodo ASD">
        <x-output-calc formula="$$\frac{P_n}{\Omega t}$$" bind="calcs.traccionFluenciaMetodoASDPnOmt"
          unit="Kg"></x-output-calc>
        <x-output-calc formula="$$\frac{P_n}{\Omega t}$$" bind="calcs.traccionFluenciaMetodoASDPnOmtTn"
          unit="Tn"></x-output-calc>
      </x-table-result>
      <x-table-result title="3.- Resistencia A La Fractura Por Tension">
        <x-output-calc symbol="Pn" bind="calcs.traccionResistenciaPn" unit="Kg"></x-output-calc>
      </x-table-result>
      <x-table-result title="3.1.- Metodo LRFD">
        <x-output-calc formula="$$F_t \cdot P_n$$" bind="calcs.traccionResistenciaMetodoLRFDFtPn"
          unit="Kg"></x-output-calc>
        <x-output-calc formula="$$F_t \cdot P_n$$" bind="calcs.traccionResistenciaMetodoLRFDFtPnTn"
          unit="Tn"></x-output-calc>
      </x-table-result>
      <x-table-result title="3.2.- Metodo ASD">
        <x-output-calc formula="$$\frac{P_n}{\Omega t}$$" bind="calcs.traccionResistenciaMetodoASDPnOmt"
          unit="Kg"></x-output-calc>
        <x-output-calc formula="$$\frac{P_n}{\Omega t}$$" bind="calcs.traccionResistenciaMetodoASDPnOmtTn"
          unit="Tn"></x-output-calc>
      </x-table-result>
      <x-table-result title="4.- Radio de Giro Minimo">
        <x-output-calc symbol="$$r_{\text{min}}$$" bind="calcs.radioDeGiroMinimo" unit="cm2"></x-output-calc>
      </x-table-result>

    </x-output-data>
  </div>
</x-calc-layout>
