<x-calc-layout title="Diseño de Losas Macizas">
  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="datosForm" method="post">
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
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">b</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="b" name="b" type="text" value="100" placeholder="b" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">t</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="t" name="t" type="text" value="100" placeholder="t" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Momento ultimo</th>
                      <th class="px-4 py-2">Mu</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="mu" name="mu" type="text" value="1400000" placeholder="momento ulitmo"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></th>
                      <th class="px-4 py-2">Kg/cm</th>
                    </tr>
                    <tr>
                      <th class="px-4 py-2">
                        <div class="input-group mb-2">
                          <button
                            class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                            type="submit" type="button">DISEÑAR</button>
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

              id="btn_captura_resultado" type="button">
              Generar IMG
            </button>
            <div class="overflow-x-auto" id="losas_macizas">
              <table class="min-w-full text-gray-800 dark:text-white" id="desingcorte">
                <!-- Requisitos de diseño vigas -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Requisitos de diseño</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800" id="resultadosiniciales"></tbody>

                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.- Diseño por flexion</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Simbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Formula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>

                  </tr>
                </thead>
                <tbody class="py-2" id="resultadoflexion"></tbody>

                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">3.- Diseño por Corte</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Simbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Formula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>

                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xm px-4 py-2 text-left" colspan="4">3.1- Calcular corte a una distancia</th>
                  </tr>
                </thead>
                <tbody class="py-2" id="resuladocorte"></tbody>
                <!-- Diseño del calculo del area del refuerzo  -->
                <thead class="bg-gray-200 dark:bg-gray-700"></thead>
                <tbody class="py-2" id="resultados2"></tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
  @pushOnce('scripts')
    @vite('resources/js/adm_losas_macisas.js')
  @endpushOnce
</x-calc-layout>
