<div
  class="static w-full overflow-auto rounded-lg bg-white p-6 shadow-md md:sticky md:top-4 md:basis-1/3 dark:bg-gray-800">
  <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
  <table class="w-full table-fixed px-6 text-center text-gray-800 dark:text-white">
    {{-- <colgroup>
      <col style="width: 40%;">
      <col style="width: 20%;">
      <col style="width: 20%;">
      <col style="width: 20%;">
    </colgroup> --}}
    <thead class="bg-white dark:bg-gray-800">
      <tr>
        <th class="py-2">Nombre</th>
        <th class="py-2">Simbolo</th>
        <th class="py-2">Entrada</th>
        <th class="py-2">Unidad de Medida</th>
      </tr>
    </thead>
    <tbody>
      {{ $slot }}
    </tbody>
  </table>
</div>
