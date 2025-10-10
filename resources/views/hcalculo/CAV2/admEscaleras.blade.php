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
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">Fy</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="fy" name="fy" type="number" value="4200.0" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">kg/m2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">fc</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="fc" name="fc" type="number" value="210.0" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">kg/m2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">t</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="t" name="t" type="number" value="17.0" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">cm</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">b</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="b" name="b" type="number" value="100.0" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">cm</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">Mu</th>
                    <th class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="mu" name="mu" type="number" value="2.32" step="any" min="0"
                        required></th>
                    <th class="px-4 py-2">tm-m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Cuantias</th>
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2"><select
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cuantias" name="cuantias">
                        <option value="0.7(f'c)0.5/Fy=">0.7(f'c)0.5/Fy</option>
                        <option value="0.8(f'c)0.5/Fy=">0.8(f'c)0.5/Fy</option>
                        <option value="14/Fy=">14/Fy</option>
                      </select></th>
                    <th class="px-4 py-2"></th>
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
                <!-- datos -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Requisitos de
                      diseño
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
                    <td class="px-4 py-2">Fy</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="fy"></span> kg/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">fc</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="fc"></span> kg/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">t</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="t"></span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">b</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="b"></span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="mu"></span> tm-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="muCalc">232000</span> kg-cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">d</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="d">14.0</span> cm</td>
                  </tr>
                </tbody>

                <!-- diseño por flexion -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.- Diseño por flexion
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
                    <td class="px-8 py-2">CUANTIA MIN</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="cuantiaMin">0.00242</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">AREA MIN</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="areaMin">3.38</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">a</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="calculoDelAreaA">1.07</span> cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">As</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="calculoDelAreaAs">4.56</span> cm2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Asmin</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="calculoDelAreaVerificacionAsmin">OK</span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">As</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="calculodelAreaVerificacionAs">4.56</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">AREA DEL ACERO A USAR</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><select
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="distribucionDelAceroAcero" name="distribucionDelAceroAcero">
                        <option value='6mm'>6mm</option>
                        <option value='8mm'>8mm</option>
                        <option value='3/8"'>3/8"</option>
                        <option value='12mm'>12mm</option>
                        <option value='1/2"' selected>1/2"</option>
                        <option value='5/8"'>5/8"</option>
                        <option value='3/4"'>3/4"</option>
                        <option value='1"'>1"</option>
                        <option value='1 3/8"'>1 3/8"</option>
                      </select></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"># DE BARRAS</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="distribucionDelAceroBarras" name="distribucionDelAceroBarras" type="number"
                        value="1" step="1" min="0" required></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">As</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="distribucionDelAceroAs">1.27</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center">@ <span id="distribucionDelAceroCm">28.0</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">ENTONCES</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="entoncesBarras">1.0 </span>Ø <span
                        id="entoncesAcero">1/2</span>&quot; @ <span id="entoncesCm">
                        20.0</span>
                    </td>
                  </tr>
                </tbody>

                <!-- diseño por corte -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">3.- Diseño por corte
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
                    <td class="px-4 py-2">d</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="cortanteDistanciaD">14.0</span> cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Vu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><input
                        class="form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cortanteDistanciaVu" name="cortanteDistanciaVu" type="number" value="3.14"
                        step="any" min="0" required> tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Vc</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aporteDelConcretoVc1">10.75</span>
                      tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">ØVc</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aporteDelConcretoVc2">9.14</span>
                      tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">1.1ØVc</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aporteDelConcretoVc3">10.05</span>
                      tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">VERIFICAMOS</td>
                    <td class="px-4 py-2">¿ØVc&gt;Vu?</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="verificamosVcVu">OK</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">¿DIAMETRO DE ACERO A USAR?</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><select
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="diametroDeAceroAUsar" name="diametroDeAceroAUsar">
                        <option value='6mm'>6mm</option>
                        <option value='8mm'>8mm</option>
                        <option value='3/8"' selected>3/8"</option>
                        <option value='12mm'>12mm</option>
                        <option value='1/2"'>1/2"</option>
                        <option value='5/8"'>5/8"</option>
                        <option value='3/4"'>3/4"</option>
                        <option value='1"'>1"</option>
                        <option value='1 3/8"'>1 3/8"</option>
                      </select></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">DIAMETRO DE ACERO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="diametroDeAceroAUsarCm">0.71</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2"></td>
                    <td class="px-4 py-2">Asmin</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center"><span id="aceroMinimoPorTemperaturaAsmin">3.4</span> cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-8 py-2">SEPARACION</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2 text-center">@ <span id="aceroMinimoPorTemperaturaSeparacion">0.21</span>
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
    @vite('resources/js/cav2/adm_escaleras.js')
  @endpushOnce
</x-app-layout>
