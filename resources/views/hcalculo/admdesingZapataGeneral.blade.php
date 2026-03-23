<x-calc-layout title="Diseño de zapata general">
  @pushOnce('styles')
  <link href="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css" rel="stylesheet" />
  @endpushOnce
  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="DataZapatageneral" action="{{ route('zapataGenCon') }}" method="post">
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
                      <th class="px-4 py-2">Esfuerzo de compresión del concreto</th>
                      <th class="px-4 py-2">fc</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fc" name="fc" type="text" value="210" placeholder="210" min="0"
                          required>
                      </th>
                      <th class="px-4 py-2">kg/cm<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Esfuerzo de fluencia del acero</th>
                      <th class="px-4 py-2">fy</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fy" name="fy" type="text" value="4200" placeholder="4200" min="0"
                          required></th>
                      <th class="px-4 py-2">kg/cm<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">γs</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="ys" name="ys" type="text" value="1" placeholder="ys" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonf/m<sup>3</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">Df</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="df" name="df" type="text" value="1" placeholder="df" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">t</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="t" name="t" type="text" value="1" placeholder="1" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">b</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="b" name="b" type="text" value="1" placeholder="1" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">L</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="l" name="l" type="text" value="1" placeholder="1"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">B</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="DZY" name="DZY" type="text" value="1" placeholder="1"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">σs</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="cps" name="cps" type="text" value="1" placeholder="1"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">kgf/m<sup>2</sup></th>
                    </tr>

                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">d</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="dzapata" name="dzapata" type="text" value="1" placeholder="1"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">cm</th>
                    </tr>

                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">α s</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="Columna" name="Columna" aria-label="Default select example">
                          <option disabled>α s</option>
                          <option value="40" selected>Columna Interior</option>
                          <option value="30">Columna de Borde</option>
                          <option value="20">Columna en Esquina</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ф Varilla X</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="VarillaX" name="VarillaX" aria-label="Default select example">
                          <option disabled>Ф Varilla</option>
                          <option value="0">Ø 0"</option>
                          <option value="0.283">6mm</option>
                          <option value="0.503">8mm</option>
                          <option value="0.713">Ø 3/8"</option>
                          <option value="1.131">12mm</option>
                          <option value="1.267">Ø 1/2"</option>
                          <option value="1.979" selected>Ø 5/8"</option>
                          <option value="2.850">Ø 3/4"</option>
                          <option value="5.067">Ø 1"</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ф Varilla Y</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="VarillaY" name="VarillaY" aria-label="Default select example">
                          <option disabled>Ф Varilla</option>
                          <option value="0">Ø 0"</option>
                          <option value="0.283">6mm</option>
                          <option value="0.503">8mm</option>
                          <option value="0.713">Ø 3/8"</option>
                          <option value="1.131">12mm</option>
                          <option value="1.267">Ø 1/2"</option>
                          <option value="1.979" selected>Ø 5/8"</option>
                          <option value="2.850">Ø 3/4"</option>
                          <option value="5.067">Ø 1"</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Espaciamiento X</th>
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="espaciamientox" name="espaciamientox" type="text" value="20" placeholder="1"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Espaciamiento Y</th>
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="espaciamientoy" name="espaciamientoy" type="text" value="20" placeholder="1"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Inercia</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="inercia" name="inercia" aria-label="Default select example">
                          <option disabled>α s</option>
                          </option>
                          <option value="Sregular" selected>Seccion Regular</option>
                          <option value="Sirregular">Seccion Irregular</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800" id="contix" style="display: none">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">Ix</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="B" name="B" type="text" value="1" placeholder="1"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">cm<sup>4</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800" id="contiy" style="display: none">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">Iy</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="By" name="By" type="text" value="1" placeholder="1"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">cm<sup>4</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th colspan="4">
                        <div id="CargaConServ"></div>
                        <!-- <div id="CargaConServ"></div> -->
                      </th>
                    </tr>
                    <input id="dataFromHandsontable" name="dataFromHandsontable" type="hidden" value="">
                    <tr>
                      <th class="px-4 py-2">
                        <div class="input-group mb-2">
                          <button
                            class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                            type="submit">DISEÑAR</button>
                        </div>
                      </th>
                    </tr>
                    <!-- Agregar más filas según sea necesario -->
                  </tbody>
                </table>
              </form>
            </div>
          </div>
        </div>
        <script>
          function toggleContix() {
            var select = document.getElementById('inercia');
            var contix = document.getElementById('contix');
            var contiy = document.getElementById('contiy');
            if (select.value === 'Sregular') {
              contix.style.display = 'none';
              contiy.style.display = 'none';
            } else {
              contix.style.display = '';
              contiy.style.display = '';
            }
          }
          document.getElementById('inercia').addEventListener('change', toggleContix);
        </script>
        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-2/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
            <button
              class="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              id="btn_pdf_predim" type="button">
              Generar PDF
            </button>
            <button
              class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
              id="btn_captura_zapata"
              type="button">
              Generar IMG
            </button>
            <div class="overflow-x-auto" id="zapataGeneral_pdf">
              <div id="resultadosZapataGeneral"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  @pushOnce('scripts')
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js"></script>
  @vite('resources/js/adm_zapata_general.js')
  @endpushOnce
</x-calc-layout>