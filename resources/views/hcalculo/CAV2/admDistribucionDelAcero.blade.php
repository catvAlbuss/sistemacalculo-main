<x-app-layout>
  <x-header title="Diseño de Aligerados"></x-header>
  <x-mathjax-loader></x-mathjax-loader>
  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-full">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Distribución del Acero
            </h3>
            <div class="overflow-x-auto">
              <table class="min-w-full text-center text-gray-800 dark:text-white" id="resultados">
                <!-- Datos -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2" colspan="2">ACEROS AREQUIPA</th>
                    <th class="px-4 py-2" colspan="8">COMBINACIONES</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2">DIAMETROS</th>
                    <th class="px-4 py-2">AREA NOMINAL(cm2)</th>
                    <th class="px-4 py-2">1</th>
                    <th class="px-4 py-2">2</th>
                    <th class="px-4 py-2">3</th>
                    <th class="px-4 py-2">4</th>
                    <th class="px-4 py-2">5</th>
                    <th class="px-4 py-2">6</th>
                    <th class="px-4 py-2">7</th>
                    <th class="px-4 py-2">8</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">6mm</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="areaNominal6mm" name="areaNominal6mm" type="number" value="0.28" step="any"
                        min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_01CombinacionseisMilimetros" name="_01CombinacionseisMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_02CombinacionseisMilimetros" name="_02CombinacionseisMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_03CombinacionseisMilimetros" name="_03CombinacionseisMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_04CombinacionseisMilimetros" name="_04CombinacionseisMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_05CombinacionseisMilimetros" name="_05CombinacionseisMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_06CombinacionseisMilimetros" name="_06CombinacionseisMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_07CombinacionseisMilimetros" name="_07CombinacionseisMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_08CombinacionseisMilimetros" name="_08CombinacionseisMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">8mm</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="areaNominal8mm" name="areaNominal8mm" type="number" value="0.5" step="any"
                        min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_11CombinacionochoMilimetros" name="_11CombinacionochoMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_12CombinacionochoMilimetros" name="_12CombinacionochoMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_13CombinacionochoMilimetros" name="_13CombinacionochoMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_14CombinacionochoMilimetros" name="_14CombinacionochoMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_15CombinacionochoMilimetros" name="_15CombinacionochoMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_16CombinacionochoMilimetros" name="_16CombinacionochoMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_17CombinacionochoMilimetros" name="_17CombinacionochoMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_18CombinacionochoMilimetros" name="_18CombinacionochoMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">3/8&quot;</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="areaNominal3Octavos" name="areaNominal3Octavos" type="number" value="0.71"
                        step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_21CombinaciontresOctavos" name="_21CombinaciontresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_22CombinaciontresOctavos" name="_22CombinaciontresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_23CombinaciontresOctavos" name="_23CombinaciontresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_24CombinaciontresOctavos" name="_24CombinaciontresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_25CombinaciontresOctavos" name="_25CombinaciontresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_26CombinaciontresOctavos" name="_26CombinaciontresOctavos" type="number"
                        value="1.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_27CombinaciontresOctavos" name="_27CombinaciontresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_28CombinaciontresOctavos" name="_28CombinaciontresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">12mm</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="areaNominal12mm" name="areaNominal12mm" type="number" value="1.13" step="any"
                        min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_31CombinaciondoceMilimetros" name="_31CombinaciondoceMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_32CombinaciondoceMilimetros" name="_32CombinaciondoceMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_33CombinaciondoceMilimetros" name="_33CombinaciondoceMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_34CombinaciondoceMilimetros" name="_34CombinaciondoceMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_35CombinaciondoceMilimetros" name="_35CombinaciondoceMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_36CombinaciondoceMilimetros" name="_36CombinaciondoceMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_37CombinaciondoceMilimetros" name="_37CombinaciondoceMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_38CombinaciondoceMilimetros" name="_38CombinaciondoceMilimetros" type="number"
                        value="0.0" step="any" min="0" required></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">1/2&quot;</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="areaNominalUnMedio" name="areaNominalUnMedio" type="number" value="1.27"
                        step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_41CombinacionmediaPulgada" name="_41CombinacionmediaPulgada" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_42CombinacionmediaPulgada" name="_42CombinacionmediaPulgada" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_43CombinacionmediaPulgada" name="_43CombinacionmediaPulgada" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_44CombinacionmediaPulgada" name="_44CombinacionmediaPulgada" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_45CombinacionmediaPulgada" name="_45CombinacionmediaPulgada" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_46CombinacionmediaPulgada" name="_46CombinacionmediaPulgada" type="number"
                        value="1.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_47CombinacionmediaPulgada" name="_47CombinacionmediaPulgada" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_48CombinacionmediaPulgada" name="_48CombinacionmediaPulgada" type="number"
                        value="0.0" step="any" min="0" required></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">5/8&quot;</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="areaNominalCincoOctavos" name="areaNominalCincoOctavos" type="number" value="2.0"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_51CombinacioncincoOctavos" name="_51CombinacioncincoOctavos" type="number"
                        value="4.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_52CombinacioncincoOctavos" name="_52CombinacioncincoOctavos" type="number"
                        value="2.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_53CombinacioncincoOctavos" name="_53CombinacioncincoOctavos" type="number"
                        value="1.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_54CombinacioncincoOctavos" name="_54CombinacioncincoOctavos" type="number"
                        value="3.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_55CombinacioncincoOctavos" name="_55CombinacioncincoOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_56CombinacioncincoOctavos" name="_56CombinacioncincoOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_57CombinacioncincoOctavos" name="_57CombinacioncincoOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_58CombinacioncincoOctavos" name="_58CombinacioncincoOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">3/4&quot;</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="areaNominalTresCuartos" name="areaNominalTresCuartos" type="number" value="2.85"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_61CombinaciontresCuartos" name="_61CombinaciontresCuartos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_62CombinaciontresCuartos" name="_62CombinaciontresCuartos" type="number"
                        value="2.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_63CombinaciontresCuartos" name="_63CombinaciontresCuartos" type="number"
                        value="4.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_64CombinaciontresCuartos" name="_64CombinaciontresCuartos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_65CombinaciontresCuartos" name="_65CombinaciontresCuartos" type="number"
                        value="2.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_66CombinaciontresCuartos" name="_66CombinaciontresCuartos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_67CombinaciontresCuartos" name="_67CombinaciontresCuartos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_68CombinaciontresCuartos" name="_68CombinaciontresCuartos" type="number"
                        value="0.0" step="any" min="0" required></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">1&quot;</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="areaNominalUnaPulgada" name="areaNominalUnaPulgada" type="number" value="5.07"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_71CombinacionunaPulgada" name="_71CombinacionunaPulgada" type="number" value="0.0"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_72CombinacionunaPulgada" name="_72CombinacionunaPulgada" type="number" value="0.0"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_73CombinacionunaPulgada" name="_73CombinacionunaPulgada" type="number" value="0.0"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_74CombinacionunaPulgada" name="_74CombinacionunaPulgada" type="number" value="0.0"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_75CombinacionunaPulgada" name="_75CombinacionunaPulgada" type="number" value="0.0"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_76CombinacionunaPulgada" name="_76CombinacionunaPulgada" type="number" value="0.0"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_77CombinacionunaPulgada" name="_77CombinacionunaPulgada" type="number" value="0.0"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_78CombinacionunaPulgada" name="_78CombinacionunaPulgada" type="number" value="0.0"
                        step="any" min="0" required>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">1 3/8&quot;</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="areaNominalUnoYTresOctavos" name="areaNominalUnoYTresOctavos" type="number"
                        value="10.06" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_81CombinacionunoYTresOctavos" name="_81CombinacionunoYTresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_82CombinacionunoYTresOctavos" name="_82CombinacionunoYTresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_83CombinacionunoYTresOctavos" name="_83CombinacionunoYTresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_84CombinacionunoYTresOctavos" name="_84CombinacionunoYTresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_85CombinacionunoYTresOctavos" name="_85CombinacionunoYTresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_86CombinacionunoYTresOctavos" name="_86CombinacionunoYTresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_87CombinacionunoYTresOctavos" name="_87CombinacionunoYTresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="_88CombinacionunoYTresOctavos" name="_88CombinacionunoYTresOctavos" type="number"
                        value="0.0" step="any" min="0" required></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="px-4 py-2" colspan="2" scope="row">AREA ACUMULADA:</th>
                    <td class="px-4 py-2">
                      <span id="areaAcumulada1Combinacion">8.0</span>
                    </td>
                    <td class="px-4 py-2">
                      <span id="areaAcumulada2Combinacion">9.7</span>
                    </td>
                    <td class="px-4 py-2">
                      <span id="areaAcumulada3Combinacion">13.4</span>
                    </td>
                    <td class="px-4 py-2">
                      <span id="areaAcumulada4Combinacion">6.0</span>
                    </td>
                    <td class="px-4 py-2">
                      <span id="areaAcumulada5Combinacion">5.7</span>
                    </td>
                    <td class="px-4 py-2">
                      <span id="areaAcumulada6Combinacion">1.98</span>
                    </td>
                    <td class="px-4 py-2">
                      <span id="areaAcumulada7Combinacion">0.0</span>
                    </td>
                    <td class="px-4 py-2">
                      <span id="areaAcumulada8Combinacion">0.0</span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2" colspan="10"><input
                        class="xlsx-calc form-control w-auto rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cantidad1" name="cantidad1" type="number" value="2.0" step="any"
                        min="0" required> Ø
                      <select
                        class="form-control w-auto rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cantidad1Diametro" name="cantidad1Diametro">
                        <option value="areaNominal6mm">6mm</option>
                        <option value="areaNominal8mm">8mm</option>
                        <option value="areaNominal3Octavos">3/8"</option>
                        <option value="areaNominal12mm">12mm</option>
                        <option value="areaNominalUnMedio" selected>1/2"</option>
                        <option value="areaNominalCincoOctavos">5/8"</option>
                        <option value="areaNominalTresCuartos">3/4"</option>
                        <option value="areaNominalUnaPulgada">1"</option>
                        <option value="areaNominalUnoYTresOctavos">1 3/8"</option>
                      </select> +
                      <input
                        class="xlsx-calc form-control w-auto rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cantidad2" name="cantidad2" type="number" value="0.0" step="any"
                        min="0" required> Ø <select
                        class="form-control w-auto rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cantidad2Diametro" name="cantidad2Diametro">
                        <option value="areaNominal6mm" selected>6mm</option>
                        <option value="areaNominal8mm">8mm</option>
                        <option value="areaNominal3Octavos">3/8"</option>
                        <option value="areaNominal12mm">12mm</option>
                        <option value="areaNominalUnMedio">1/2"</option>
                        <option value="areaNominalCincoOctavos">5/8"</option>
                        <option value="areaNominalTresCuartos">3/4"</option>
                        <option value="areaNominalUnaPulgada">1"</option>
                        <option value="areaNominalUnoYTresOctavos">1 3/8"</option>
                      </select> + <input
                        class="xlsx-calc form-control w-auto rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cantidad3" name="cantidad3" type="number" value="0.0" step="any"
                        min="0" required> Ø <select
                        class="form-control w-auto rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cantidad3Diametro" name="cantidad3Diametro">
                        <option value="areaNominal6mm">6mm</option>
                        <option value="areaNominal8mm" selected>8mm</option>
                        <option value="areaNominal3Octavos">3/8"</option>
                        <option value="areaNominal12mm">12mm</option>
                        <option value="areaNominalUnMedio">1/2"</option>
                        <option value="areaNominalCincoOctavos">5/8"</option>
                        <option value="areaNominalTresCuartos">3/4"</option>
                        <option value="areaNominalUnaPulgada">1"</option>
                        <option value="areaNominalUnoYTresOctavos">1 3/8"</option>
                      </select> + <input
                        class="xlsx-calc form-control w-auto rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cantidad4" name="cantidad4" type="number" value="0.0" step="any"
                        min="0" required> Ø <select
                        class="form-control w-auto rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cantidad4Diametro" name="cantidad4Diametro">
                        <option value="areaNominal6mm">6mm</option>
                        <option value="areaNominal8mm" selected>8mm</option>
                        <option value="areaNominal3Octavos">3/8"</option>
                        <option value="areaNominal12mm">12mm</option>
                        <option value="areaNominalUnMedio">1/2"</option>
                        <option value="areaNominalCincoOctavos">5/8"</option>
                        <option value="areaNominalTresCuartos">3/4"</option>
                        <option value="areaNominalUnaPulgada">1"</option>
                        <option value="areaNominalUnoYTresOctavos">1 3/8"</option>
                      </select> = <span id="sumaDistribucionDelAcero">2.54</span> Cm2
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
    @vite('resources/js/cav2/adm_distribucion_del_acero.js')
  @endpushOnce
</x-app-layout>
