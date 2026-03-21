<x-app-layout>
  <x-header title="VRD ALIGERADOS & ESCALERA"></x-header>
  <x-mathjax-loader></x-mathjax-loader>
  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos </h3>
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
                      LOSA ALIGERADA</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2">Ancho del ladrillo</td>
                    <td class="px-4 py-2">Bl</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aligeradosEspacioDelLadrillo" name="aligeradosEspacioDelLadrillo" type="number"
                        value="0.3" step="any" min="0" required></td>
                    <td class="px-4 py-2">m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2">Ancho de vigueta</td>
                    <td class="px-4 py-2">b</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aligeradosAnchoDeLaVigueta" name="aligeradosAnchoDeLaVigueta" type="number" value="0.1"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2">m</td>
                  </tr>
                  <tr>
                    <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                      ESCALERA (Considera todo el peso de las gradas)</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2">Ancho de diseño</td>
                    <td class="px-4 py-2">B</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasAnchoTributario" name="escalerasAnchoTributario" type="number" value="1.0"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2">m</td>
                  </tr>
                  <tr>
                    <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                      ESCALERA (Considera solo la garganta)</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2">Espesor garganta</td>
                    <td class="px-4 py-2">t</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasTT" name="escalerasTT" type="number" value="0.2" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2">Ancho de diseño</td>
                    <td class="px-4 py-2">B</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasTAnchoTributario" name="escalerasTAnchoTributario" type="number" value="1.0"
                        step="any" min="0" required>
                    </td>
                    <td class="px-4 py-2">m</td>
                  </tr>
                  <tr>
                    <th class="px-4 py-2">
                      <div class="input-group mb-2">
                        <button
                          class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                          id="calcular" type="button">CALCULAR</button>
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
                    <th class="px-4 py-2 text-left text-xl" colspan="4">1.-LOSA ALIGERADA
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
                    <td class="px-4 py-2">Ancho del ladrillo</td>
                    <td class="px-4 py-2">Bl</td>
                    <td class="px-4 py-2">--</td>
                    <td class="px-4 py-2"><span id="aligeradosEspacioDelLadrillo"></span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Base de la vigueta</td>
                    <td class="px-4 py-2">b</td>
                    <td class="px-4 py-2">--</td>
                    <td class="px-4 py-2"><span id="aligeradosAnchoDeLaVigueta"></span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Ancho tributario</td>
                    <td class="px-4 py-2">B</td>
                    <td class="px-4 py-2">Bl+b</td>
                    <td class="px-4 py-2"><span id="aligeradosAnchoTributario">0.4</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Espesor de la losa aligerada</td>
                    <td class="px-4 py-2">t</td>
                    <td class="px-4 py-2">L/25</td>
                    <td class="px-4 py-2"><select
                        class="form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aligeradosCargaMuertaT" name="aligeradosCargaMuertaT">
                        <option value="0.17">0.17</option>
                        <option value="0.20"selected>0.20</option>
                        <option value="0.25" >0.25</option>
                        <option value="0.30">0.30</option>
                      </select> m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Peso aproximado de la losa</td>
                    <td class="px-4 py-2">Wdl</td>
                    <td class="px-4 py-2">E.020-Tabla 2</td>
                    <td class="px-4 py-2"><span id="aligeradosCargaMuertaPesoAligerado">350.0</span> Kg/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Peso de los acabados</td>
                    <td class="px-4 py-2">Wda</td>
                    <td class="px-4 py-2">100-200kg/m2</td>
                    <td class="px-4 py-2"><select
                        class="form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aliegeradosCargaMuertaAcabados" name="aliegeradosCargaMuertaAcabados">
                        <option value="100">100</option>
                        <option value="120">125</option>
                        <option value="150">150</option>
                        <option value="175">175</option>
                        <option value="200">200</option>
                      </select> Kg/m2</td>
                  </tr>


                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Carga muerta total</td>
                    <td class="px-4 py-2">Wd</td>
                    <td class="px-4 py-2">(wdl+wda)*B</td>
                    <td class="px-4 py-2"><span id="aligeradosCargaMuertaWd3">0</span> Tn/m
                    </td>
                  </tr>
                  
                  
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Sobrecarga viva</td>
                    <td class="px-4 py-2">S/C</td>
                    <td class="px-4 py-2">E.020-Tabla 3</td>
                    <td class="px-4 py-2"><select
                        class="form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aligeradosCargaVivaSC" name="aligeradosCargaVivaSC">
                        <option value="100" >100</option>
                        <option value="200">200</option>
                        <option value="250">250</option>
                        <option value="300">300</option>
                        <option value="350">350</option>
                        <option value="400">400</option>
                      </select> Kg/m2</td>
                  
                  </tr>

                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Carga viva total</td>
                    <td class="px-4 py-2">Wl</td>
                    <td class="px-4 py-2">S/C*B</td>
                    <td class="px-4 py-2"><span id="aligeradosCargaMuertaWl">0.1</span> Tn/m</td>
                  </tr>
                  
                    <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Carga amplificada de diseño</td>
                    <td class="px-4 py-2">Wu</td>
                    <td class="px-4 py-2">1.4Wd+1.7Wl</td>
                    <td class="px-4 py-2"><span id="aligeradosCargaMuertaWu">0</span> Tn/m
                    </td>
                    </tr>
                  
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Luz </td>
                    <td class="px-4 py-2">L</td>
                    <td class="px-4 py-2">--</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="aligeradosCargaMuertaLongitud" name="aligeradosCargaMuertaLongitud" type="number"
                        value="5" step="any" min="0" required> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Momento apoyado</td>
                    <td class="px-4 py-2">Mu1</td>
                    <td class="px-4 py-2">Wu*L^2/8</td>
                    <td class="px-4 py-2"><span id="aligeradosCargaMuertaApoyoFijo">1.02</span>
                      Tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Momento Empotrado</td>
                    <td class="px-4 py-2">Mu2</td>
                    <td class="px-4 py-2">Wu*L^2/12</td>
                    <td class="px-4 py-2"><span id="aligeradosCargaMuertaApoyoEmpotrado">0.055</span> Tn-m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">Fuerza cortante</td>
                    <td class="px-4 py-2">Vu</td>
                    <td class="px-4 py-2">Wu*L/2</td>
                    <td class="px-4 py-2"><span id="aligeradosCargaMuertaCortante">0.15</span>
                      Tn</td>
                  </tr>
 
                  
                  
                  
                  <thead class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.- Escaleras
                    </th>
                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                      <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                      <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                      <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                      <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                    </tr>
                  </thead>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">t</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasT" name="escalerasT" type="number" value="17.0" step="any"
                        min="0" required> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">PASO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasPaso" name="escalerasPaso" type="number" value="30.0" step="any"
                        min="0" required> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">CONTRAPASO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasContraPaso" name="escalerasContraPaso" type="number" value="17.0"
                        step="any" min="0" required> cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">COSθ</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasCosTeta">0.87</span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">θ</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasTeta">29.54</span> °</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Hn</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasHnCm">28.040</span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">hn</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasHn">0.28</span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">ANCHO TRIBUTARIO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasAnchoTributario"></span>
                      m
                    </td>
                  </tr>
   
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">PESO PROPIO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasCargaMuertaPesoPropio">672.95</span>
                      Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">ACABADOS</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasCargaMuertaAcabados" name="escalerasCargaMuertaAcabados" type="number"
                        value="150.0" step="any" min="0" required> Kg/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasCargaMuertaWd1">672.95</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasCargaMuertaWd2">150.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Wd</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasCargaMuertaWd">0.8229535584682134</span> Tn/m</td>
                  </tr>

                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">S/C</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasCargaVivaSC" name="escalerasCargaVivaSC" type="number" value="400.0"
                        step="any" min="0" required>
                      Kg/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasCargaVivaWl1">400.0</span> Kg/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Wl</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasCargaVivaWl">0.4</span> Tn/m</td>
                  </tr>

                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">LONGITUD</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasLongitud" name="escalerasLongitud" type="number" value="4.44"
                        step="any" min="0" required> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">APOYO FIJO (moemnto)</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasApoyoFijo">4.51474702228832</span>
                      Tn-m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">APOYO EMPOTRADO (momento)</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasApoyoEmpotrado">3.00</span> Tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">(cortante)</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasCortante">4.067339659719207</span> Tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Wu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasCargaMuertaWu">1.83</span> Tn/m</td>
                  </tr>
                  <thead class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">3.- Escaleras
                    </th>
                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                      <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                      <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                      <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                      <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                    </tr>
                  </thead>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">t</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasTT" name="escalerasTT" type="number" value="0.2" step="any"
                        min="0" required> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">ANCHO TRIBUTARIO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasTAnchoTributario" name="escalerasTAnchoTributario" type="number"
                        value="1.0" step="any" min="0" required> m</td>
                  </tr>

                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">PESO PROPIO</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasTCargaMuertaPesoPropio">480.0</span>
                      Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">ACABADOS</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasTCargaMuertaAcabados" name="escalerasTCargaMuertaAcabados" type="number"
                        value="100.0" step="any" min="0" required> Kg/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasTCargaMuertaWd1">480.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasTCargaMuertaWd2">100.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Wd</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasTCargaMuertaWd">0.58</span> Tn/m</td>
                  </tr>

                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">S/C</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasTCargaVivaSC" name="escalerasTCargaVivaSC" type="number" value="400.0"
                        step="any" min="0" required>
                      Kg/m2
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasTCargaMuertaWl1">400.0</span> Kg/m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Wl</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasTCargaMuertaWl">0.4</span> Tn/m</td>
                  </tr>

                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">LONGITUD</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="escalerasTCargaVivaLongitud" name="escalerasTCargaVivaLongitud" type="number"
                        value="4.8" step="any" min="0" required> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">APOYO FIJO (moemnto)</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasTCargaVivaApoyoFijo">4.2969599999999994</span> Tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">APOYO EMPOTRADO (momento)</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasTCargaVivaApoyoEmpotrado">2.8646399999999996</span> Tn-m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">(cortante)</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasTCargaVivaApoyoEmpotradoCortante">3.58</span>Tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Wu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="escalerasTCargaMuertaWu">1.492</span> Tn/m
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
    @vite('resources/js/cav2/adm_hoja2.js')
  @endpushOnce
</x-app-layout>
