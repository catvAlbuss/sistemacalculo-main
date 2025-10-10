@pushOnce('initscripts')
  @vite('resources/js/adm_suelos.js')
@endPushOnce

<x-calc-layout title="Distribución de Esfuerzos con la Profundidad">
  <div class="container mx-auto flex flex-row flex-wrap items-start space-x-4 py-12 md:flex-nowrap"
    x-data="{ q: 3, df: 1, B: 1, L: 1 }">
    <x-input-data>
      <form id="suelosForm">
        @csrf
        <x-input-calc name="Carga de terreno" :attr="['name' => 'q']" symbol="q" bind="q" unit="tn/m2"></x-input-calc>
        <x-input-calc name="Profundidad de desplante" :attr="['name' => 'df']" symbol="df" bind="df"
          unit="m"></x-input-calc>
        <x-input-calc name="Ancho de la cimentación" :attr="['name' => 'B']" symbol="B" bind="B"
          unit="m"></x-input-calc>
        <x-input-calc name="Longitud" :attr="['name' => 'L']" symbol="L" bind="L"></x-input-calc>
        <tr>
          <th class="px-4 py-2 text-left" colspan="4">
            <div class="input-group mb-2 inline-block text-left">
              <button
                class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                id="calcular" type="submit">DISEÑAR</button>
            </div>
          </th>
        </tr>
      </form>
    </x-input-data>
    <x-output-data>
      <div id="grafico1"></div>
      <div id="grafico2"></div>
    </x-output-data>
  </div>
</x-calc-layout>
