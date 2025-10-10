<x-app-layout>
  <x-header title="Diseño de Escaleras"></x-header>
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
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Fy</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="fy" name="fy" type="number" value="4200.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">kg/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">F&apos;c</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="fc" name="fc" type="number" value="350.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">kg/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">capas?</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="capas" name="capas" type="number" value="1.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"></td>
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
              <table class="min-w-full table-fixed text-gray-800 dark:text-white" id="resultados">
                <!-- datos -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">h cm</th>
                    <th class="px-4 py-2">b cm</th>
                    <th class="px-4 py-2">d cm</th>
                    <th class="px-4 py-2">Mu tm-m</th>
                    <th class="px-4 py-2">kg-cm</th>
                    <th class="px-4 py-2">a cm</th>
                    <th class="px-4 py-2">As cm2</th>
                    <th class="px-4 py-2">P</th>
                    <th class="px-4 py-2">Psmax</th>
                    <th class="px-4 py-2">Psmin</th>
                    <th class="px-4 py-2">Asmax</th>
                    <th class="px-4 py-2">Asmin</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">A</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="hA" name="hA" type="number" value="50.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="bA" name="bA" type="number" value="35.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="dA">44.0</span></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="MuA" name="MuA" type="number" value="12.42" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="kgA">1242000.0</span></td>
                    <td class="px-4 py-2"><span id="aA">3.1229407419095807</span></td>
                    <td class="px-4 py-2"><span id="AsA">7.7422905893175</span></td>
                    <td class="px-4 py-2"><span id="PA">0.005027461421634741</span></td>
                    <td class="px-4 py-2"><span id="PsmaxA">OK</span></td>
                    <td class="px-4 py-2"><span id="PsminA">OK</span></td>
                    <td class="px-4 py-2"><span id="AsmaxA">OK</span></td>
                    <td class="px-4 py-2"><span id="AsminA">OK</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">AB</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="hAB" name="hAB" type="number" value="50.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="bAB" name="bAB" type="number" value="35.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="dAB">44.0</span></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="MuAB" name="MuAB" type="number" value="14.91" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="kgAB">1491000.0</span></td>
                    <td class="px-4 py-2"><span id="aAB">3.7782059439557756</span></td>
                    <td class="px-4 py-2"><span id="AsAB">9.366802236057021</span></td>
                    <td class="px-4 py-2"><span id="PAB">0.0060823391143227405</span></td>
                    <td class="px-4 py-2"><span id="PsmaxAB">OK</span></td>
                    <td class="px-4 py-2"><span id="PsminAB">OK</span></td>
                    <td class="px-4 py-2"><span id="AsmaxAB">OK</span></td>
                    <td class="px-4 py-2"><span id="AsminAB">OK</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">B</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="hB" name="hB" type="number" value="50.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="bB" name="bB" type="number" value="35.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="dB">44.0</span></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="MuB" name="MuB" type="number" value="16.69" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="kgB">1669000.00</span></td>
                    <td class="px-4 py-2"><span id="aB">4.253249336052598</span></td>
                    <td class="px-4 py-2"><span id="AsB">10.544513978963726</span></td>
                    <td class="px-4 py-2"><span id="PB">0.006847086999327095</span></td>
                    <td class="px-4 py-2"><span id="PsmaxB">OK</span></td>
                    <td class="px-4 py-2"><span id="PsminB">OK</span></td>
                    <td class="px-4 py-2"><span id="AsmaxB">OK</span></td>
                    <td class="px-4 py-2"><span id="AsminB">OK</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">BC</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="hBC" name="hBC" type="number" value="50.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="bBC" name="bBC" type="number" value="35.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="dBC">44.0</span></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="MuBC" name="MuBC" type="number" value="8.62" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="kgBC">861999.9999999999</span></td>
                    <td class="px-4 py-2"><span id="aBC">2.1427057742784115</span></td>
                    <td class="px-4 py-2"><span id="AsBC">5.31212473206522</span></td>
                    <td class="px-4 py-2"><span id="PBC">0.0034494316441981946</span></td>
                    <td class="px-4 py-2"><span id="PsmaxBC">OK</span></td>
                    <td class="px-4 py-2"><span id="PsminBC">OK</span></td>
                    <td class="px-4 py-2"><span id="AsmaxBC">OK</span></td>
                    <td class="px-4 py-2"><span id="AsminBC">OK</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">C</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="hC" name="hC" type="number" value="50.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="bC" name="bC" type="number" value="35.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="dC">44.0</span></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="MuC" name="MuC" type="number" value="14.35" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="kgC">1435000.0</span></td>
                    <td class="px-4 py-2"><span id="aC">3.6299100281854777</span></td>
                    <td class="px-4 py-2"><span id="AsC">8.999151944876491</span></td>
                    <td class="px-4 py-2"><span id="PC">0.005843605159010708</span></td>
                    <td class="px-4 py-2"><span id="PsmaxC">OK</span></td>
                    <td class="px-4 py-2"><span id="PsminC">OK</span></td>
                    <td class="px-4 py-2"><span id="AsmaxC">OK</span></td>
                    <td class="px-4 py-2"><span id="AsminC">OK</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">CD</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="hCD" name="hCD" type="number" value="50.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="bCD" name="bCD" type="number" value="35.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="dCD">44.0</span></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="MuCD" name="MuCD" type="number" value="10.66" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="kgCD">1066000.0</span></td>
                    <td class="px-4 py-2"><span id="aCD">2.66604706863086</span></td>
                    <td class="px-4 py-2"><span id="AsCD">6.609575024314001</span></td>
                    <td class="px-4 py-2"><span id="PCD">0.0042919318339701305</span></td>
                    <td class="px-4 py-2"><span id="PsmaxCD">OK</span></td>
                    <td class="px-4 py-2"><span id="PsminCD">OK</span></td>
                    <td class="px-4 py-2"><span id="AsmaxCD">OK</span></td>
                    <td class="px-4 py-2"><span id="AsminCD">OK</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">D</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="hD" name="hD" type="number" value="50.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="bD" name="bD" type="number" value="35.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="dD">44.0</span></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="MuD" name="MuD" type="number" value="9.32" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="kgD">932000.0</span></td>
                    <td class="px-4 py-2"><span id="aD">2.3215430846861835</span></td>
                    <td class="px-4 py-2"><span id="AsD">5.755492230784499</span></td>
                    <td class="px-4 py-2"><span id="PD">0.003737332617392532</span></td>
                    <td class="px-4 py-2"><span id="PsmaxD">OK</span></td>
                    <td class="px-4 py-2"><span id="PsminD">OK</span></td>
                    <td class="px-4 py-2"><span id="AsmaxD">OK</span></td>
                    <td class="px-4 py-2"><span id="AsminD">OK</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">DE</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="hDE" name="hDE" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="bDE" name="bDE" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="dDE">-6.0</span></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="MuDE" name="MuDE" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="kgDE">0.0</span></td>
                    <td class="px-4 py-2"><span id="aDE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsDE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PDE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PsmaxDE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PsminDE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsmaxDE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsminDE">-2146826281</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">E</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="hE" name="hE" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="bE" name="bE" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="dE">-6.0</span></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="MuE" name="MuE" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="kgE">0.0</span></td>
                    <td class="px-4 py-2"><span id="aE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PsmaxE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PsminE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsmaxE">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsminE">-2146826281</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">EF</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="hEF" name="hEF" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="bEF" name="bEF" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="dEF">-6.0</span></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="MuEF" name="MuEF" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="kgEF">0.0</span></td>
                    <td class="px-4 py-2"><span id="aEF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsEF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PEF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PsmaxEF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PsminEF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsmaxEF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsminEF">-2146826281</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">F</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="hF" name="hF" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="bF" name="bF" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="dF">-6.0</span></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="MuF" name="MuF" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"><span id="kgF">0.0</span></td>
                    <td class="px-4 py-2"><span id="aF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PsmaxF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="PsminF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsmaxF">-2146826281</span></td>
                    <td class="px-4 py-2"><span id="AsminF">-2146826281</span></td>
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
    @vite('resources/js/cav2/adm_vigas_continuas.js')
  @endpushOnce
</x-app-layout>
