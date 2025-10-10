<x-app-layout>
  <x-header title="Diseño de Viguetas"></x-header>
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
                    <td class="px-4 py-2">Fy</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="fy" name="fy" type="number" value="4200.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">kg/m2</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">f&apos;c</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="fc" name="fc" type="number" value="210.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">kg/m2</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">h</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="h" name="h" type="number" value="10.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">cm</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">b</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="b" name="b" type="number" value="10.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">cm</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="mu" name="mu" type="number" value="0.1" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">tm-m</td>
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
                <!-- Requisitos de diseño -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Requisitos de diseño
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
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Fy</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="fy"></span> kg/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">f&apos;c</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="fc"></span> kg/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">h</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="h"></span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">b</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="b"></span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="mu"></span> tm-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="muCalc">114999.0</span> kg-cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">d</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="d">7.5</span> cm</td>
                  </tr>
                </tbody>
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.- Diseño por Flexion
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.1.- Cuantia Minima
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">rMIN</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><select
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="diseñoPorFlexionCuantia" name="diseñoPorFlexionCuantia">
                        <option value="0.7(f'c)0.5/Fy=">0.7(f'c)0.5/Fy</option>
                        <option value="0.8(f'c)0.5/Fy=">0.8(f'c)0.5/Fy</option>
                        <option value="14/Fy=">14/Fy</option>
                      </select></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Cuantia</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionCuantiaMinCuantia">0.002415</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Area</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionCuantiaMinArea">0.1811</span>
                      cm2</td>
                  </tr>
                </tbody>
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.2.- Cuantia
                      Balanceada
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Cuantia</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionCuantiaBalanceadaCuantia">0.002415</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Area</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionCuantiaBalanceadaArea">0.1811</span>
                      cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">β1</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionCuantiaBalanceadaB">0.85</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">n</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionCuantiaBalanceadaN">0.0</span>
                    </td>
                  </tr>
                </tbody>
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.2.- Cuantia Max
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Cuantia</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionCuantiaMaxCuantia">0.002415</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Area</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionCuantiaMaxArea">0.1811</span>
                      cm2</td>
                  </tr>
                </tbody>
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.2.- Cuantia Economica
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Cuantia</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionCuantiaEconomicaCuantia">0.002415</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Area</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorFlexionCuantiaEconomicaArea">0.1811</span>
                      cm2</td>
                  </tr>
                </tbody>
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">SI NO REQUIERE ACERO EN
                      COMPRESION EL
                      ACERO MINIMO POR PROCESO CONSTRUCTIVO SERÁ:
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">AsMIN</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="minimoPorProcesoConstructivoAsmin">0.181</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">M&apos;uMIN</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="minimoPorProcesoConstructivoMumin">-2146826252</span> tm-m</td>
                  </tr>
                </tbody>
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">3.- Calculo del Area
                      del Refuerzo (Metodo Cuadratico)
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
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">a</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoA">-2146826252</span>
                      cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">As</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoAs">-2146826252</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">VERIFICACION</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Asmax</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoVerificacionAsmax">-2146826252</span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Asmin</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoVerificacionAsmin">-2146826252</span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">M&apos;u</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoVerificacionMu">-2146826252</span> tn-m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">As</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoDelAreaDelRefuerzoVerificacionAs">-2146826252</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoProFlexionEsCostoso">-2146826252</span>
                    </td>
                  </tr>
                </tbody>
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">4.- Diseño por Corte
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
                    <td class="px-4 py-2">CALCULAR EL CORTANTE A UNA DISTANCIA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">d</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorCorteD">7.5</span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="diseñoPorCorteVu" name="diseñoPorCorteVu" type="number" value="1.25" step="any"
                        min="0" required> tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">APORTE DEL CONCRETO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vc</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorCorteVc">0.5760322256610301</span> tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">ØVc</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorCortefiVc">0.48962739181187553</span>
                      tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">1.1ØVc</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorCorte1Vc">0.5385901309930631</span>
                      tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorCorteAporte">ENSANCHAR
                        VIGUETAS</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">ENSANCHE DE VIGUETA</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Wu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="ensancheViguetaWu" name="ensancheViguetaWu" type="number" value="520.0"
                        step="any" min="0" required> kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Wu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="ensancheViguetaWutn">0.0052</span> tn/cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">X</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="ensancheViguetaX">146.22550157463934</span> cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">l</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="ensancheViguetal" name="ensancheViguetal" type="number" value="60.0" step="any"
                        min="0" required> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">b1</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="ensancheViguetab1">25.529617437748954</span>
                      cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2" colspan="4">ACERO MINIMO POR TEMPERATURA</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">ESTRIBO A USAR</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><select
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="diseñoPorCorteEstriboAUsarmm" name="diseñoPorCorteEstriboAUsarmm">
                        <option value="6mm">6mm</option>
                        <option value="8mm">8mm</option>
                        <option value='3/8"'>3/8"</option>
                        <option value="12mm">12mm</option>
                        <option value='1/2"'>1/2"</option>
                        <option value='5/8"'>5/8"</option>
                        <option value='3/4"'>3/4"</option>
                        <option value='1"'>1"</option>
                        <option value='1 3/8"'>1 3/8"</option>
                      </select></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">ESTRIBO A USAR</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorCorteEstriboAUsarcm">0.28</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">ESPESOR DEL ACABADO</td>
                    <td class="px-4 py-2">e</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="diseñoPorCorteAceroMinimoE" name="diseñoPorCorteAceroMinimoE" type="number"
                        value="5.0" step="any" min="0" required> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">As</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorCorteAceroMinimoAs">0.90</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">SEPARACION ENTRE BARRAS</td>
                    <td class="px-4 py-2">S</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="diseñoPorCorteAceroMinimoS">25.0</span> cm
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
    @vite('resources/js/cav2/adm_viguetas.js')
  @endpushOnce
</x-app-layout>
