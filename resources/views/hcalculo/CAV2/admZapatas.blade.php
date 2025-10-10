<x-app-layout>
  <x-header title="Diseño de Zapatas"></x-header>
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
                    <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                      CAPACIDAD PORTANTE</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">σ<sub>ADM</sub></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="sADM" name="sADM" type="number" value="1.05" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">kg/cm2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">ALTURA RELLENO</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="alturaRelleno" name="alturaRelleno" type="number" value="1.0" step="any"
                        min="0" required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">γ<sub>s</sub></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="gS" name="gS" type="number" value="1.8" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">Tn/m3</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">CORREGIR POR Df?</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><select
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="corregirPorDf" name="corregirPorDf">
                        <option value='SI'>SI</option>
                        <option value='NO'>NO</option>
                      </select></th>
                    <th class="px-4 py-2"></th>
                  </tr>
                  <tr>
                    <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                      DIMENSIONES DE LA COLUMNA</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">Cx</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cx" name="cx" type="number" value="0.35" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">Cy</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cy" name="cy" type="number" value="0.6" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr>
                    <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                      CARGAS</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">PD+PL</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesFaxialPDPL" name="calculoDeLasDimensionesFaxialPDPL"
                        type="number" value="9.71" step="any" min="0" required></th>
                    <th class="px-4 py-2">F. AXIAL(Tn)</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">0.8xSISMO</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesFaxialSismo" name="calculoDeLasDimensionesFaxialSismo"
                        type="number" value="0.29" step="any" min="0" required></th>
                    <th class="px-4 py-2">F. AXIAL(Tn)</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">PD+PL</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesM22PDPL" name="calculoDeLasDimensionesM22PDPL" type="number"
                        value="0.03" step="any" min="0" required></th>
                    <th class="px-4 py-2">M22(Tn-m)</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">0.8xSISMO</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesM22Sismo" name="calculoDeLasDimensionesM22Sismo" type="number"
                        value="1.54" step="any" min="0" required></th>
                    <th class="px-4 py-2">M22(Tn-m)</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">PD+PL</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesM33PDPL" name="calculoDeLasDimensionesM33PDPL" type="number"
                        value="0.63" step="any" min="0" required></th>
                    <th class="px-4 py-2">M33(Tn-m)</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">0.8xSISMO</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesM33Sismo" name="calculoDeLasDimensionesM33Sismo" type="number"
                        value="0" step="any" min="0" required></th>
                    <th class="px-4 py-2">M33(Tn-m)</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">PV</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="pv" name="pv" type="number" value="0.0" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">tn</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">Mvx</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="mvx" name="mvx" type="number" value="0.0" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">tn-m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">Mvy</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="mvy" name="mvy" type="number" value="0.0" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">tn-m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Factor de Correccion Conmutente</th>
                    <th class="px-4 py-2">F.C.</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesFc" name="calculoDeLasDimensionesFc" type="number"
                        value="1.0" step="any" min="0" required></th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">B menor</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesBmenor" name="calculoDeLasDimensionesBmenor" type="number"
                        value="1.5" step="any" min="0" required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">L mayor</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesLmayor" name="calculoDeLasDimensionesLmayor" type="number"
                        value="1.5" step="any" min="0" required></th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">F.A.</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesFA" name="calculoDeLasDimensionesFA" type="number"
                        value="1.33" step="any" min="0" required></th>
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
                <!-- Capacidad Portante -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Capacidad Portante
                    </th>
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
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">σ<sub>ADM</sub></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="sADM"></span> kg/cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="sADMCalc">10.5</span> tn/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">ALTURA RELLENO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="alturaRelleno">1.0</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">γ<sub>s</sub></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="gS">1.8</span> Tn/m3</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="gsCalc1">0.18</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="gsCalc2">0.87</span> tn/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">CORREGIR POR Df?</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="corregirPorDf"></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">σ<sub>ADM</sub></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="sNeta">10.5</span> tn/m2</td>
                  </tr>
                </tbody>

                <!-- Cargas -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.- Cargas
                    </th>
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
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">PD+PL</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="calculoDeLasDimensionesFaxialPDPL"> F.
                      </span> AXIAL(Tn)
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">0.8xSISMO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="calculoDeLasDimensionesFaxialSismo"> F.
                      </span> AXIAL(Tn)
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">PD+PL</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="calculoDeLasDimensionesM22PDPL">
                      </span> M22(Tn-m)</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">0.8xSISMO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="calculoDeLasDimensionesM22Sismo">
                      </span> M22(Tn-m)</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">PD+PL</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="calculoDeLasDimensionesM33PDPL">
                      </span> M33(Tn-m)</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">0.8xSISMO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="calculoDeLasDimensionesM33Sismo">
                      </span> M33(Tn-m)</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">PM</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="pm">9.71</span> tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">PV</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="pv" name="pv" value="0.0"
                        min="0"></span> tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Mmx</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="mmx">0.63</span> tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Mmy</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="mmy">0.03</span> tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Mvx</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="mvx" name="mvx" value="0.0"
                        min="0"></span> tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Mvy</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="mvy" name="mvy" value="0.0"
                        min="0"></span> tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Msx</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="msx">0.0</span> tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Msy</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="msy">1.54</span> tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Psx</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="psx">0.29</span> tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Psy</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="psy">0.29</span> tn-m</td>
                  </tr>
                </tbody>

                <!-- Calculo de las dimensiones -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">3.- Calculo de las
                      dimensiones
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>3.1.- Verificacion sin
                        sismo</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">F.C.</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesFc" name="calculoDeLasDimensionesFc" type="number"
                        value="1.0" step="any" min="0" required></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">s</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesS">10.5</span> tn/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">AREA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesAreaTentativa">0.97</span> m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">DIFERENCIA DE LADOS</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesDiferenciaDeLados">0.25</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Y</td>
                    <td class="px-4 py-2">B menor=</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesBmenor" name="calculoDeLasDimensionesBmenor" type="number"
                        value="1.5" step="any" min="0" required> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">X</td>
                    <td class="px-4 py-2">L mayor=</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesLmayor" name="calculoDeLasDimensionesLmayor" type="number"
                        value="1.5" step="any" min="0" required> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">AREA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesArea">2.25</span> m2
                    </td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>3.2.- Verificacion en
                        X</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">s</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesSx">5.65</span>tn/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesVerificacionX">OK!!</span></td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>3.2.- Verificacion
                        Biaxial</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">s</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesSBiaxial">5.70</span>
                      tn/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesVerificacionBiaxial">OK!!</span></td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>3.3.- Verificacion por
                        Sismo</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">F.A.</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeLasDimensionesFA" name="calculoDeLasDimensionesFA" type="number"
                        value="1.33" step="any" min="0" required></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">s</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesSFA">13.965</span>
                      tn/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">EN X</td>
                    <td class="px-4 py-2">s</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesSX">5.84</span> tn/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesVerificaionSX">OK!!</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">EN Y</td>
                    <td class="px-4 py-2">s</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesSY">8.58</span> tn/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesVerificaionSY">OK!!</span></td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>3.4.- Dimensiones de la
                        Zapata</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">B</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesB">1.5</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">L</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeLasDimensionesL">1.5</span> m</td>
                  </tr>
                </tbody>

                <!-- Calculo del Peralte -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">4.- Calculo del Peralte
                    </th>
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
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">su<sub>SIN SISMO</sub></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteSUSinSismo">8.84</span> tn/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">su<sub>SISMO X</sub></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteSUSinSismoX">7.30</span>
                      tn/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">su<sub>SISMO Y</sub></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteSUSinSismoY">10.72</span>
                      tn/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">EL MAYOR</td>
                    <td class="px-4 py-2">su</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteSU">10.72</span> tn/m2
                    </td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>4.1.- Concerto
                        Armado</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">f&apos;c</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-2/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDelPeralteFC" name="calculoDelPeralteFC" type="number" value="210.0"
                        step="any" min="0" required>
                      Kg/cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Volados</td>
                    <td class="px-4 py-2">Vb</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteVb">0.575</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Volados</td>
                    <td class="px-4 py-2">Vl</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteVl">0.45</span> m</td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>4.2.-
                        Punzonamiento</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">PERALTE RECOMENDADO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span>0.6</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">SUPONIENDO</td>
                    <td class="px-4 py-2">&quot;d&quot;</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-2/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDelPeralteD" name="calculoDelPeralteD" type="number" value="0.5"
                        step="any" min="0" required> m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">bo</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteBo">3.9</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Ao</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteAo">0.935</span> m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">ARESISTENTE</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteAResistentes">1.315</span> m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">CORTANTE DE DISEÑO POR PUNZONAMIENTO</td>
                    <td class="px-4 py-2">Vu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteVu">14.099722222222224</span>
                      tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">APORTE DEL CONCRETO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vc1</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteVc1">533.40</span> tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vcmax</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteVcmax">310.84</span> tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vmin</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteVmin">310.84</span> tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">ØVc</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteRefuerzoVc">264.21</span> tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">VERIFICACION</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeraltePunzamientoVerificaion">OK!!</span></td>
                  </tr>
                </tbody>

                <!-- Cortante -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">5.- Cortante
                    </th>
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
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vc</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteCortanteVc">127.30</span> tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteCortanteVu">10.5</span> tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">VERIFICACION</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteCortanteVerificacion">OK!!</span></td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>5.1.- Dimensiones de la
                        Zapata</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">d</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteZapataD">0.5</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">H</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelPeralteH">0.6</span> m</td>
                  </tr>
                </tbody>

                <!-- Acero y Distribucion -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">6.- Acero y
                      Distribucion
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Calculo del Refuerzo en
                        Y</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">B</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnYB">1.5</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnYMu">2.66</span> Tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Fy</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-2/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="calculoDeRefuerzoEnYFY" name="calculoDeRefuerzoEnYFY" type="number" value="4200.0"
                        step="any" min="0" required>
                      kg/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">F&apos;c</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnYFC1">210.0</span> kg/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">h</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnYH">60.0</span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">d</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnYD">50.0</span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">b</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnYDatosB">150.0</span> cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnYDatosMu">2.66</span> tm-m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnYMu1">265877.60</span>
                      kg-cm</td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Calculo del Refuerzo en
                        X</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">L</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnXL">1.5</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnXMu">1.63</span> Tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Fy</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnXFY">4200.0</span> kg/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">F&apos;c</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnXFC1">210.0</span> kg/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">h</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnXH">60.0</span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">d</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnXD">50.0</span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">b</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnXB">150.0</span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnXMuDatos">1.63</span> tm-m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDeRefuerzoEnXMu1">162843.75</span>
                      kg-cm</td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>6.1.- Diseño por
                        Flexion</strong></td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Cuantias Y</strong></td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Cuantia Minima</strong>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">rMIN</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><select
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cuantiaMinY" name="cuantiaMinY">
                        <option value="0.7(f'c)0.5/Fy=">0.7(f'c)0.5/Fy</option>
                        <option value="0.8(f'c)0.5/Fy=">0.8(f'c)0.5/Fy</option>
                        <option value="14/Fy=">14/Fy</option>
                      </select></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">CUANTIA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionYMinCuantia">0.002</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">AREA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionYMinArea">15.0</span> cm2</td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Cuantia
                        Balanceada</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">CUANTIA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionYBalanceadaCuantia">0.0213</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">AREA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionYBalanceadaArea">159.375</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">β1</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionYB1">0.85</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">n</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionYN">0.0</span></td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Cuantia Maxima</strong>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">CUANTIA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionYMaxCuantia">0.016</span>
                      cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">AREA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionYMaxArea">119.53</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Cuantia
                        Economica</strong>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">CUANTIA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionYEconimicaCuantia">0.008</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">AREA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionYEconimicaArea">59.77</span>
                      cm2</td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Cuantias X</strong>
                    </td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Cuantia Minima</strong>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">rMIN</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><select
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cuantiaMinX" name="cuantiaMinX">
                        <option value="0.7(f'c)0.5/Fy=">0.7(f'c)0.5/Fy</option>
                        <option value="0.8(f'c)0.5/Fy=">0.8(f'c)0.5/Fy</option>
                        <option value="14/Fy=">14/Fy</option>
                      </select></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">CUANTIA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionXMinCuantia">0.002</span>
                      cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">AREA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionXMinArea">15.0</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Cuantia
                        Balanceada</strong></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">CUANTIA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionXBalanceadaCuantia">0.0213</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">AREA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionXBalanceadaArea">159.375</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">β1</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionXB1">0.85</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">n</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionXN">0.0</span></td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Cuantia Maxima</strong>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">CUANTIA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionXMaxCuantia">0.016</span>
                      cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">AREA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionXMaxArea">119.53</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>Cuantia
                        Economica</strong>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">CUANTIA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionXEconimicaCuantia">0.008</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">AREA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionXEconimicaArea">59.77</span>
                      cm2</td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>6.2 Calculo del Area
                        del Refuerzo (Metodo Cuadratico)</strong>
                    </td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>En Y</strong>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">a</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoYA">0.22</span> cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">As</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoYAs">1.40</span>
                      cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Verificacion</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Asmax</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoYAsmax">OK</span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Asmin</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoYAsmin">NO</span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">As</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoYVerificacionAs">15.0</span>
                      cm2
                    </td>
                  </tr>
                  <tr>
                    <td class="p-0" colspan="4">
                      <table class="w-full">
                        <thead class="bg-gray-200 dark:bg-gray-800">
                          <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="px-4 py-2 text-left text-xl" colspan="4">Acero
                              a Colocar en Y
                            </th>
                          </tr>
                          <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <th class="px-8 py-2 text-lg" scope="col">Nº de barra
                            </th>
                            <th class="px-4 py-2 text-lg" scope="col">Acero</th>
                            <th class="px-4 py-2 text-lg" scope="col">Cantidad</th>
                            <th class="px-4 py-2 text-lg" scope="col">@</th>
                            <th class="px-4 py-2 text-lg" scope="col">Ancho</th>
                            <th class="px-4 py-2 text-lg" scope="col">Unidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class="px-4 py-2">#4</td>
                            <td class="px-4 py-2 text-center">Ø1/2&quot;</td>
                            <td class="px-4 py-2 text-center"><span
                                id="diseñoPorFlexionYCantidadAcero1">11.811023622047244</span>
                            </td>
                            <td class="px-4 py-2 text-center">@</td>
                            <td class="px-4 py-2 text-center"><span id="diseñoPorFlexionYEspacio1">12.7</span></td>
                            <td class="px-4 py-2 text-center">cm</td>
                          </tr>
                          <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class="px-4 py-2">#5</td>
                            <td class="px-4 py-2 text-center">Ø5/8&quot;</td>
                            <td class="px-4 py-2 text-center"><span id="diseñoPorFlexionYCantidadAcero2">7.5</span>
                            </td>
                            <td class="px-4 py-2 text-center">@</td>
                            <td class="px-4 py-2 text-center"><span id="diseñoPorFlexionYEspacio2">20.0</span></td>
                            <td class="px-4 py-2 text-center">cm</td>
                          </tr>
                          <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class="px-4 py-2">#6</td>
                            <td class="px-4 py-2 text-center">Ø3/4&quot;</td>
                            <td class="px-4 py-2 text-center"><span
                                id="diseñoPorFlexionYCantidadAcero3">5.263157894736842</span>
                            </td>
                            <td class="px-4 py-2 text-center">@</td>
                            <td class="px-4 py-2 text-center"><span id="diseñoPorFlexionYEspacio3">28.5</span></td>
                            <td class="px-4 py-2 text-center">cm</td>
                          </tr>
                          <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class="px-4 py-2">#8</td>
                            <td class="px-4 py-2 text-center">Ø1&quot;</td>
                            <td class="px-4 py-2 text-center"><span
                                id="diseñoPorFlexionYCantidadAcero4">2.9585798816568047</span>
                            </td>
                            <td class="px-4 py-2 text-center">@</td>
                            <td class="px-4 py-2 text-center"><span id="diseñoPorFlexionYEspacio4">50.7</span></td>
                            <td class="px-4 py-2 text-center">cm</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <td class="px-4 py-2 text-xl" colspan="4"><strong>En X</strong>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">a</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoXA">0.14</span> cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">As</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoXAs">0.86</span>
                      cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Verificacion</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Asmax</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoXAsmax">OK</span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Asmin</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoXAsmin">NO</span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">As</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoXAsVerificacioni">15.0</span>
                      cm2
                    </td>
                  </tr>
                  <tr>
                    <td class="p-0" colspan="4">
                      <table class="min-w-full text-gray-800 dark:text-white">
                        <thead class="bg-gray-200 dark:bg-gray-800">
                          <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="px-4 py-2 text-left text-xl" colspan="4">Acero
                              a Colocar en X
                            </th>
                          </tr>
                          <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <th class="px-8 py-2 text-lg" scope="col">Nº de barra
                            </th>
                            <th class="px-4 py-2 text-lg" scope="col">Acero</th>
                            <th class="px-4 py-2 text-lg" scope="col">Cantidad</th>
                            <th class="px-4 py-2 text-lg" scope="col">@</th>
                            <th class="px-4 py-2 text-lg" scope="col">Ancho</th>
                            <th class="px-4 py-2 text-lg" scope="col">Unidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class="px-4 py-2">#4</td>
                            <td class="px-4 py-2 text-center">Ø1/2&quot;</td>
                            <td class="px-4 py-2 text-center"><span
                                id="diseñoPorFlexionXCantidadAcero1">11.811023622047244</span>
                            </td>
                            <td class="px-4 py-2 text-center">@</td>
                            <td class="px-4 py-2 text-center"><span id="diseñoPorFlexionXEspacio1">12.7</span></td>
                            <td class="px-4 py-2 text-center">cm</td>
                          </tr>
                          <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class="px-4 py-2">#5</td>
                            <td class="px-4 py-2 text-center">Ø5/8&quot;</td>
                            <td class="px-4 py-2 text-center"><span id="diseñoPorFlexionXCantidadAcero2">7.5</span>
                            </td>
                            <td class="px-4 py-2 text-center">@</td>
                            <td class="px-4 py-2 text-center"><span id="diseñoPorFlexionXEspacio2">20.0</span></td>
                            <td class="px-4 py-2 text-center">cm</td>
                          </tr>
                          <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class="px-4 py-2">#6</td>
                            <td class="px-4 py-2 text-center">Ø3/4&quot;</td>
                            <td class="px-4 py-2 text-center"><span
                                id="diseñoPorFlexionXCantidadAcero3">5.263157894736842</span>
                            </td>
                            <td class="px-4 py-2 text-center">@</td>
                            <td class="px-4 py-2 text-center"><span id="diseñoPorFlexionXEspacio3">28.5</span></td>
                            <td class="px-4 py-2 text-center">cm</td>
                          </tr>
                          <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class="px-4 py-2">#8</td>
                            <td class="px-4 py-2 text-center">Ø1&quot;</td>
                            <td class="px-4 py-2 text-center"><span
                                id="diseñoPorFlexionXCantidadAcero4">2.9585798816568047</span>
                            </td>
                            <td class="px-4 py-2 text-center">@</td>
                            <td class="px-4 py-2 text-center"><span id="diseñoPorFlexionXEspacio4">50.7</span></td>
                            <td class="px-4 py-2 text-center">cm</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>

                <!-- Segun La Norma -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">7.- Segun la Norma
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">B</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="segunLaNormaB">1.5</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">L</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="segunLaNormaL">1.5</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">β</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="segunLaNormaBeta">1.0</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">AREA TOTAL</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="segunLaNormaAreaTotal">1.41</span> Cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">SEGÚN LA NORMA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="segunLaNorma">1.0</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">POR LO TANTO DEBE CONCENTRARSE</td>
                    <td class="px-4 py-2"><span id="segunLaNormaConcentrarse">1.41</span></td>
                    <td class="px-4 py-2">EN UN ANCHO DE</td>
                    <td class="px-4 py-2"><span id="segunLaNormaAncho">1.5</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">EL RESTO DEL ESFUERZO SERA</td>
                    <td class="px-4 py-2"><span id="segunLaNormaEsfuerzo">0.0</span></td>
                    <td class="px-4 py-2">LAS CUALES SERAN</td>
                    <td class="px-4 py-2"><span id="segunLaNormaSeran">0.0</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">DEBE REPARTIRSE UNIFORMEMENTE EN LOS LADOS LATERALES
                    </td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="segunLaNormaRepartirse">0.0</span> cm</td>
                  </tr>
                  <tr>
                    <td class="p-0" colspan="4">
                      <table class="w-full">
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><input
                              class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              id="segunLaNormaCantidadEntrada1" name="segunLaNormaCantidadEntrada1" type="number"
                              value="1.27" step="any" min="0" required></td>
                          <td class="px-4 py-2">Ø1/2&quot;</td>
                          <td class="px-4 py-2"><span id="segunLaNormaCantidad1">1.1101400459584525</span></td>
                          <td class="px-4 py-2">@</td>
                          <td class="px-4 py-2"><span id="segunLaNormaEspaciado1">135.11808761974328</span></td>
                          <td class="px-4 py-2">cm</td>
                          <td class="px-4 py-2"><span id="segunLaNormaCalc1">-2146826281</span></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><input
                              class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              id="segunLaNormaCantidadEntrada2" name="segunLaNormaCantidadEntrada2" type="number"
                              value="2.0" step="any" min="0" required></td>
                          <td class="px-4 py-2">Ø5/8&quot;</td>
                          <td class="px-4 py-2"><span id="segunLaNormaCantidad2">0.7049389291836173</span></td>
                          <td class="px-4 py-2">@</td>
                          <td class="px-4 py-2"><span id="segunLaNormaEspaciado2">212.7843899523516</span></td>
                          <td class="px-4 py-2">cm</td>
                          <td class="px-4 py-2"><span id="segunLaNormaCalc2">-2146826281</span></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><input
                              class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              id="segunLaNormaCantidadEntrada3" name="segunLaNormaCantidadEntrada3" type="number"
                              value="2.85" step="any" min="0" required></td>
                          <td class="px-4 py-2">Ø3/4&quot;</td>
                          <td class="px-4 py-2"><span id="segunLaNormaCantidad3">0.49469398539201215</span></td>
                          <td class="px-4 py-2">@</td>
                          <td class="px-4 py-2"><span id="segunLaNormaEspaciado3">303.21775568210103</span></td>
                          <td class="px-4 py-2">cm</td>
                          <td class="px-4 py-2"><span id="segunLaNormaCalc3">-2146826281</span></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><input
                              class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              id="segunLaNormaCantidadEntrada4" name="segunLaNormaCantidadEntrada4" type="number"
                              value="5.07" step="any" min="0" required></td>
                          <td class="px-4 py-2">Ø1&quot;</td>
                          <td class="px-4 py-2"><span id="segunLaNormaCantidad4">0.27808241782391213</span></td>
                          <td class="px-4 py-2">@</td>
                          <td class="px-4 py-2"><span id="segunLaNormaEspaciado4">539.4084285292113</span></td>
                          <td class="px-4 py-2">cm</td>
                          <td class="px-4 py-2"><span id="segunLaNormaCalc4">-2146826281</span></td>
                        </tr>
                      </table>
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
    @vite('resources/js/cav2/adm_zapatas.js')
  @endpushOnce
</x-app-layout>
