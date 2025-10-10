<x-app-layout>
  <x-header title="Combinacion de Cargas"></x-header>
  <x-mathjax-loader></x-mathjax-loader>
  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
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
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">D</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="d" name="d" type="number" value="1.8" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">Tn/m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">L</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="l" name="l" type="number" value="1.25" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">Tn/m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vi</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="vi" name="vi" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">Tn/m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">E</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="e" name="e" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">Tn/m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">CE</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="ce" name="ce" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">CL</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cl" name="cl" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">CT</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="ct" name="ct" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <!-- Agregar más filas según sea necesario -->
                  <tr>
                    <th class="px-4 py-2">
                      <div class="input-group mb-2">
                        <button
                          class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                          id="calcular" type="button">DISEÑAR</button>
                      </div>
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-2/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
            <div class="overflow-x-auto" id="resultados">
              <table class="min-w-full text-gray-800 dark:text-white">
                <tr>
                  <td class="p-0" colspan="4">
                    <table class="min-w-full text-gray-800 dark:text-white">
                      <!-- 1º COMBINACION -->
                      <thead class="bg-gray-200 dark:bg-gray-800">
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                          <th class="px-4 py-2 text-left text-xl" colspan="2">1°
                            COMBINACION
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2" colspan="2"><span id="_1combinacion">4.645</span></td>
                          <th class="px-4 py-2 text-right" scope="col"><span id="_1combinacionResultado">ESTE
                              VALOR RIGE</span></th>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="p-0" colspan="4">
                    <table class="min-w-full text-gray-800 dark:text-white">
                      <!-- 2º COMBINACION -->
                      <thead class="bg-gray-200 dark:bg-gray-800">
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                          <th class="px-4 py-2 text-left text-xl" colspan="2">2°
                            COMBINACION
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><span id="_2combinacion1">3.8125</span></td>
                          <td class="px-4 py-2"><span id="_2combinacion2">3.8125</span></td>
                          <th class="px-4 py-2 text-right"><span id="_2combinacionResultado">NO</span></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><span id="_2combinacion3">1.62</span></td>
                          <td class="px-4 py-2"><span id="_2combinacion4">1.62</span></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="p-0" colspan="4">
                    <table class="min-w-full text-gray-800 dark:text-white">
                      <!-- 3º COMBINACION -->
                      <thead class="bg-gray-200 dark:bg-gray-800">
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                          <th class="px-4 py-2 text-left text-xl" colspan="2">3°
                            COMBINACION
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><span id="_3combinacion1">3.8125</span></td>
                          <td class="px-4 py-2"><span id="_3combinacion2">3.8125</span></td>
                          <th class="px-4 py-2 text-right"><span id="_3combinacionResultado">NO</span></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><span id="_3combinacion3">1.62</span></td>
                          <td class="px-4 py-2"><span id="_3combinacion4">1.62</span></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="p-0">
                    <table>
                      <thead class="bg-gray-200 dark:bg-gray-800">
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                          <th class="px-4 py-2 text-xl">LA MAXIMA COMBINACION SERA!</th>
                          <th class="px-4 py-2 text-xl">U</th>
                          <th class="px-4 py-2 text-xl"></th>
                          <th class="px-4 py-2 text-xl"><span id="maximaCombinacion">4.645</span> Tn/m</th>
                        </tr>
                      </thead>
                    </table>
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
    @vite('resources/js/cav2/adm_comb_cargas.js')
  @endpushOnce
</x-app-layout>
