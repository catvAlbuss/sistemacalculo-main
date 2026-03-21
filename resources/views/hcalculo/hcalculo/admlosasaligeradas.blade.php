<x-calc-layout title="Diseño de Losas Aligeradas">
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="FlexionViga" method="POST" action="{{ route('desingLosa') }}">
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
                      <th class="px-4 py-2">N° tramos</th>
                      <th class="px-4 py-2">#</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="num_tramos" name="num_tramos" type="text" value="1" placeholder="tramos"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></th>
                      <th class="px-4 py-2"></th>
                    </tr>
                  </tbody>
                </table>
                <table class="w-full table-auto px-6 text-gray-800 dark:text-white" id="LuzLibreTramo">
                  <tbody>
                    <tr>
                      <th scope="row">Luz libre (m)</th>
                    </tr>
                    <tr>
                      <th scope="row">Carga Muerta (Ton. m)</th>
                    </tr>
                    <tr>
                      <th scope="row">Carga Viva (Ton. m)</th>
                    </tr>
                    <tr>
                      <th scope="row">Base (cm)</th>
                    </tr>
                    <tr>
                      <th scope="row">Altura (losa)(cm)</th>
                    </tr>
                    <tr>
                      <th scope="row">b (cm)</th>
                    </tr>
                    <tr>
                      <th scope="row">Mi (Tonf-m)</th>
                    </tr>
                    <tr>
                      <th scope="row">Md (Tonf-m)</th>
                    </tr>
                    <tr>
                      <th scope="row">δ1 (cm)</th>
                    </tr>
                    <tr>
                      <th scope="row">δ2 (cm)</th>
                    </tr>
                    <tr>
                      <th scope="row">δ3 (cm)</th>
                    </tr>
                  </tbody>
                </table>
                <table class="w-full table-auto px-6 text-gray-800 dark:text-white" id="tablaTramos">
                  <tbody>
                    <tr>
                      <th scope="row">Eje</th>
                    </tr>
                    <tr>
                      <th scope="row"></th>
                    </tr>
                    <tr class="bg-primary">
                      <th scope="row">Negativo(-)</th>
                    </tr>
                    <tr>
                      <th scope="row"></th>
                    </tr>
                    <tr>
                      <th scope="row">MU (TN-M)-</th>
                    </tr>
                    <tr>
                      <th scope="row">Vu (TNF)-</th>
                    </tr>
                    <tr>
                      <th scope="row">Tu (TNF)-</th>
                    </tr>
                    <tr>
                      <th scope="row"></th>
                    </tr>
                    <tr class="bg-primary">
                      <th scope="row">Positivo(+)</th>
                    </tr>
                    <tr>
                      <th scope="row"></th>
                    </tr>
                    <tr>
                      <th scope="row">MU (TN-M)+</th>
                    </tr>
                    <tr>
                      <th scope="row">Vu (TNF)+</th>
                    </tr>
                    <tr>
                      <th scope="row">Tu (TNF)+</th>
                    </tr>
                  </tbody>
                </table>
                <br>
                <br>
                <div class="col-md-3">
                  <div class="input-group mb-2">
                    <button
                      class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                      type="submit">DISEÑAR</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-2/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
            <div class="overflow-x-auto">
              <div class="table-responsive" id="ObtenerResultados"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  @pushOnce('scripts')
    @vite('resources/js/adm_losas_aligeradas.js')
  @endpushOnce
</x-calc-layout>
