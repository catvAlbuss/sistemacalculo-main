<x-app-layout>
  <x-header title="Alig. 2.0"></x-header>

  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="fuerzasCortantesForm">
                @csrf
                <table class="w-full table-auto px-6 text-gray-800 dark:text-white">
                  <thead class="bg-white dark:bg-gray-800">
                    <tr class="text-center">
                      <th class="px-4 py-2">Nombre</th>
                      <th class="px-4 py-2">Simb.</th>
                      <th class="px-4 py-2">Entrada</th>
                      <th class="px-4 py-2">Unidad <br> Medida</th>
                    </tr>
                  </thead>
                  <tbody class="text-center">
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2">Resistencia a la compresion del concreto</td>
                      <td class="px-4 py-2">fc</td>
                      <td class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fc" name="fc" type="number" value="210" min="0" step="any"
                          required></td>
                      <td class="px-4 py-2">Kg/cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2">Esfuerzo de fluencia del acero</td>
                      <td class="px-4 py-2">Fy</td>
                      <td class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="Fy" name="Fy" type="number" value="4200" min="0" step="any"
                          required></td>
                      <td class="px-4 py-2">Kg/cm<sup>2</sup></td>
                    </tr>
                    {{-- <tr class="bg-white dark:bg-gray-800">
                                            <td class="py-2 px-4">Modulo de Elasticidad del concreto</td>
                                            <td class="py-2 px-4">E</td>
                                            <td class="py-2 px-4"><input type="number" name="E"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="E" min="0" value="2173000" required></td>
                                            <td class="py-2 px-4">Tn/m</td>
                                        </tr> --}}
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2">Factor rm</td>
                      <td class="px-4 py-2"></td>
                      <td class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="frm" name="frm" type="number" value="1.4" min="0" step="any"
                          required></td>
                      <td class="px-4 py-2">Kg/cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2">Factor rv</td>
                      <td class="px-4 py-2"></td>
                      <td class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="frv" name="frv" type="number" value="1.7" min="0" step="any"
                          required></td>
                      <td class="px-4 py-2">Kg/cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2">Ancho Tributario</td>
                      <td class="px-4 py-2"></td>
                      <td class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="anchoTributario" name="anchoTributario" type="number" value="0.4" step="any"
                          required></td>
                      <td class="px-4 py-2">m</td>
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
                    <!-- Agregar más filas según sea necesario -->
                    <tr>
                      <th class="px-4 py-2 text-left" colspan="4">
                        <div class="input-group mb-2 inline-block text-left">
                          <button
                            class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                            id="calcular" type="submit">DISEÑAR</button>
                        </div>
                        <div class="input-group mb-2 inline-block text-left">
                          <button
                            class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                            id="generarPDF" type="button">REPORTE</button>
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
                  <th class="px-4 py-2 text-left text-xl" colspan="4">
                    1.- Geometria
                  </th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" id="viguetas" colspan="4">
                  </td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                  <th class="px-4 py-2 text-left text-xl" colspan="4">
                    2.- Cargas Muertas
                  </th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" id="cargaMuerta" colspan="4">
                  </td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                  <th class="px-4 py-2 text-left text-xl" colspan="4">
                    3.- Cargas Vivas
                  </th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" id="cargaViva" colspan="4">
                  </td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                  <th class="px-4 py-2 text-left text-xl" colspan="4">
                    4.- Analisis Estructural
                  </th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="fuerzasCortantes"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="momentosFlectores"></div>
                  </td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                  <th class="px-4 py-2 text-left text-xl" colspan="4">
                    5.- Diseño a Flexion
                  </th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2 text-center" colspan="2">
                    <div id="T1"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" id="asd" colspan="4">
                  </td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                  <th class="px-4 py-2 text-left text-xl" colspan="4">
                    6.- Diseño a Cortante
                  </th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2 text-center" colspan="2">
                    <div id="T2"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" id="vu" colspan="4">
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
    @vite('resources/js/adm_aligerados_grafico.js')
  @endpushOnce
</x-app-layout>
