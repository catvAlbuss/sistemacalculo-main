<x-app-layout>
  <x-header title="Diseño de Metrados"></x-header>
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
                  <tr>
                    <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">VIGAS
                    </th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ANCHO TRIBUTARIO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">
                      <input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="vigasAnchoTributario" name="vigasAnchoTributario" type="number" value="5.0"
                        step="any" min="0" required />
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">b</th>
                    <th class="px-4 py-2">
                      <input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="vigasB" name="vigasB" type="number" value="0.3" step="any" min="0"
                        required />
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">h</th>
                    <th class="px-4 py-2">
                      <input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="vigasH" name="vigasH" type="number" value="0.5" step="any" min="0"
                        required />
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">PESO ALIGERADO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">
                      <input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="vigasPesoAligerado" name="vigasPesoAligerado" type="number" value="350.0" step="any"
                        min="0" required />
                    </th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>

                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ACABADOS</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">
                      <input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="vigasAcabados" name="vigasAcabados" type="number" value="100.0" step="any"
                        min="0" required />
                    </th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">S/C</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="vigasSC" name="vigasSC" type="number" value="400.0" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">TECHO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="vigasTecho" name="vigasTecho" type="number" value="0.0" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr>
                    <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                      ALIGERADO</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ESPACIO DEL LADRILLO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aligeradoEspacioDelLadrillo" name="aligeradoEspacioDelLadrillo" type="number"
                        value="0.3" step="any" min="0" required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ANCHO DE LA VIGUETA</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aligeradoAnchoDeLaVigueta" name="aligeradoAnchoDeLaVigueta" type="number"
                        value="0.1" step="any" min="0" required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">PESO ALIGERADO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aligeradoPesoAligerado" name="aligeradoPesoAligerado" type="number" value="300.0"
                        step="any" min="0" required>
                    </th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ACABADOS</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aligeradoAcabados" name="aligeradoAcabados" type="number" value="100.0"
                        step="any" min="0" required></th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">S/C</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aligeradoSC" name="aligeradoSC" type="number" value="200.0" step="any"
                        min="0" required></th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">TECHO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aligeradoTecho" name="aligeradoTecho" type="number" value="0.0" step="any"
                        min="0" required></th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr>
                    <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                      LOSA MACISA</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">espesor(t)</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="losaMacisaEspesorT" name="losaMacisaEspesorT" type="number" value="0.16"
                        step="any" min="0" required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ANCHO TRIBUTARIO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="losaMacisaAnchoTributario" name="losaMacisaAnchoTributario" type="number"
                        value="1.0" step="any" min="0" required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ACABADOS</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="losaMacisaAcabados" name="losaMacisaAcabados" type="number" value="100.0"
                        step="any" min="0" required></th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">S/C</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="losaMacisaSC" name="losaMacisaSC" type="number" value="500.0" step="any"
                        min="0" required></th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">TECHO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="losaMacisaTecho" name="losaMacisaTecho" type="number" value="0.0" step="any"
                        min="0" required></th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr>
                    <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                      ESCALERAS</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">hm</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escaleraHm" name="escaleraHm" type="number" value="0.13" step="any"
                        min="0" required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">ANCHO TRIBUTARIO</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escaleraAnchoTributario" name="escaleraAnchoTributario" type="number" value="1"
                        step="any" min="0" required>
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ACABADOS</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escaleraAcabados" name="escaleraAcabados" type="number" value="100.0" step="any"
                        min="0" required></th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">S/C</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escaleraSC" name="escaleraSC" type="number" value="200.0" step="any"
                        min="0" required></th>
                    <th class="px-4 py-2">Kg/m2</th>
                  </tr>
                  <tr>
                    <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                      TABIQUE</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ESPESOR</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="taboqieEspesor" name="taboqieEspesor" type="number" value="0.15" step="any"
                        min="0" required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ALTURA</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="taboqieAltura" name="taboqieAltura" type="number" value="1.6" step="any"
                        min="0" required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ANCHO TRIBUTARIO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="taboqieAnchoTributario" name="taboqieAnchoTributario" type="number" value="0.4"
                        step="any" min="0" required>
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">PESO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="taboquePeso" name="taboquePeso" type="number" value="1400.0" step="any"
                        min="0" required></th>
                    <th class="px-4 py-2">Kg/m3</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ESPESOR</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cargaDistribuidaEspesor" name="cargaDistribuidaEspesor" type="number" value="0.0075"
                        step="any" min="0" required>
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ALTURA</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cargaDistribuidaAltura" name="cargaDistribuidaAltura" type="number" value="2.5"
                        step="any" min="0" required>
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">PESO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cargaDistribuidaPeso" name="cargaDistribuidaPeso" type="number" value="1400.0"
                        step="any" min="0" required>
                    </th>
                    <th class="px-4 py-2">Kg/m3</th>
                  </tr>
                  <tr>
                    <th class="px-4 py-2">
                      <div class="input-group mb-2">
                        <button
                          class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                          id="calcular" type="button">DISEÑAR</button>
                      </div>
                    </th>
                  </tr>
                  <!-- Agregar más filas según sea necesario -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-2/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full text-gray-800 dark:text-white" id="resultados">
                <!-- vigas -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Vigas</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">PESO ALIGERADO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="vigasPesoAligeradoCalc">1750.0</span> Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">ACABADOS</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="vigasAcabadosCalc">500.0</span>
                      Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">PESO PROPIO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="vigasPesoPropioCalc">360.0</span>
                      Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">WD</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="vigasWDCalc">2.61</span> Tn/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">S/C</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="vigasSCCalc">2000.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">TECHO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="vigasTechoCalc">0.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">WL</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="vigasWLCalc">2.0</span> Tn/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">Wu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="vigasWuCalc">7.054</span> Tn/m
                    </td>
                  </tr>
                </tbody>

                <!-- aligerado -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.- Aligerado</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">ANCHO TRIBUTARIO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aligeradoAnchoTributarioCalc">0.4</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">PESO ALIGREADO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aligeradoPesoAligeradoCalc">120.0</span> Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">ACABADOS</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aligeradoAcabadosCalc">40.0</span>
                      Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">WD</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aligeradoWDCalc">0.16</span> Tn/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">S/C</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aligeradoSCCalc">80.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">TECHO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aligeradoTechoCalc">0.0</span>
                      Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">WL</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aligeradoWLCalc">0.08</span> Tn/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">Wu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aligeradoWuCalc">0.36</span> Tn/m
                    </td>
                  </tr>
                </tbody>

                <!-- losa macisa -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">3.- Losa Macisa</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">PESO PROPIO DE LA LOSA 1</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="losaMacisaPesoPropioDeLaLosa1Calc">384.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">PESO PROPIO DE LA LOSA 2</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="losaMacisaPesoPropioDeLaLosa2Calc">384.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">ACABADOS</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="losaMacisaAcabadosCalc">100.0</span> Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">WD</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="losaMacisaWDCalc">0.484</span>
                      Tn/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">S/C</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="losaMacisaSCCalc">500.0</span>
                      Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">TECHO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="losaMacisaTechoCalc">0.0</span>
                      Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">WL</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="losaMacisaWLCalc">0.5</span> Tn/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">Wu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="losaMacisaWuCalc">1.5276</span>
                      Tn/m</td>
                  </tr>
                </tbody>

                <!-- escalera-->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">4.- Escalera</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">PESO PROPIO DE LA ESCAL. 1</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="escaleraPesoPropioDeLaEscalera1Calc">312.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">PESO PROPIO DE LA ESCAL. 2</td>
                    <td class="px-8 py-2"></td>
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="escaleraPesoPropioDeLaEscalera2Calc">312.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">ACABADOS</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="escaleraPesoPropioAcabadosCalc">100.0</span> Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">WD</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="escaleraWDCalc">0.412</span> Tn/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">S/C</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="escaleraSCCalc">200.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">WL</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="escaleraWLCalc">0.2</span> Tn/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">Wu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="escaleraWUCalc">0.9168</span> Tn/m
                    </td>
                  </tr>
                </tbody>

                <!-- tabique -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">5.- Tabique</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">Pd</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="tabiquePdCalc">0.1344</span> Tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">Pu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="tabiquePuCalc">0.188</span> Tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">Wd</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="tabiqueWDCalc">0.02625</span> Tn/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">Wu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="tabiqueWuCalc">0.03675</span> Tn/m
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  @pushOnce('scripts')
    @vite('resources/js/cav2/adm_metrados.js')
  @endpushOnce
</x-app-layout>
