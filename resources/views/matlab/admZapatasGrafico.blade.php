<x-app-layout>
  <x-header title="Cimentacion 1.0"></x-header>

  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="zapatasForm">
                @csrf
                <table class="w-full table-auto px-6 text-gray-800 dark:text-white">
                  <tbody class="text-center">
                    <tr>
                      <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                        Cargas</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2" colspan="4">
                        <div id="cargas"></div>
                      </td>
                    </tr>
                    <tr>
                      <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                        Propiedades</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2" colspan="4">
                        <div id="propiedades"></div>
                      </td>
                    </tr>
                    <tr>
                      <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                        Poligono</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2">
                        <div id="poligonoExterior"></div>
                      </td>
                      <td class="px-4 py-2">
                        <div id="poligonoInterior1"></div>
                      </td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2">
                        <div id="poligonoInterior2"></div>
                      </td>
                      <td class="px-4 py-2">
                        <div id="poligonoInterior3"></div>
                      </td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2">
                        <div id="poligonoInterior4"></div>
                      </td>
                      <td class="px-4 py-2">
                        <div id="poligonoInterior5"></div>
                      </td>
                    </tr>
                    <!-- Agregar más filas según sea necesario -->
                    <tr>
                      <th class="px-4 py-2">
                        <div class="input-group mb-2 inline-block text-left">
                          <button
                            class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                            id="calcular" type="submit">DISEÑAR</button>
                        </div>
                        <div class="input-group mb-2 inline-block text-left">
                          <button
                            class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                            id="generarPDF" type="button">PDF</button>
                        </div>
                      </th>
                    </tr>
                  </tbody>
                </table>
              </form>
            </div>
          </div>
        </div>

        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-2/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
            <div class="overflow-x-auto" id="resultados">
              <table class="min-w-full text-gray-800 dark:text-white">
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                  <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Analisis Estructural
                  </th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata1"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata2"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata3"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata4"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata5"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata6"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata7"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata8"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata9"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata10"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata11"></div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  @pushOnce('scripts')
    <script src="https://unpkg.com/virtual-webgl@1.0.6/src/virtual-webgl.js"></script>
    @vite('resources/js/adm_zapatas_grafico.js')
  @endpushOnce
</x-app-layout>
