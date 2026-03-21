<x-calc-layout title="Diseño de Cerco Perimetrico">
  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="datacercoperimetrico1" action="">
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
                          id="fdc" name="fdc" type="text" value="210" placeholder="210" min="0"
                          required>
                      </th>
                      <th class="px-4 py-2">kg/cm<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Esfuerzo de fluencia del acero</th>
                      <th class="px-4 py-2">fy</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fdy" name="fdy" type="text" value="4200" placeholder="4200" min="0"
                          required></th>
                      <th class="px-4 py-2">kg/cm<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Peso Específico del Concreto</th>
                      <th class="px-4 py-2">yc</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="yc" name="yc" type="text" value="2400" placeholder="2400" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">Kg/m³</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Esfuerzo Admisible en Tracción de la Albañilería</th>
                      <th class="px-4 py-2">f't </th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fdt" name="fdt" type="text" value="1.5" placeholder="1.5" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">Kg/cm²</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Peso Específico de la Albañilería</th>
                      <th class="px-4 py-2">ya</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="ya" name="ya" type="text" value="1800s" placeholder="1800" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">Kg/m³</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Peso Específico del concreto simple</th>
                      <th class="px-4 py-2">ycs</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="ycs" name="ycs" type="text" value="2300" placeholder="2300" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">Kg/m³</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="5">II. Dimensiones del Cerco</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Altura del Paño</th>
                      <th class="px-4 py-2">H</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="h" name="h" type="text" value="2.8" placeholder="2.8"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Longitud del Paños</th>
                      <th class="px-4 py-2">c</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="l" name="l" type="text" value="3.25" placeholder="3.25"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Espesor Efectivo del Muro</th>
                      <th class="px-4 py-2">t</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="t" name="t" type="text" value="0.13" placeholder="0.13"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Espesor del Tarrajeo(muro)</th>
                      <th class="px-4 py-2">rev</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="rev" name="rev" type="text" value="0.02" placeholder="0.02"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Peralte Viga Solera</th>
                      <th class="px-4 py-2">hv</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="hv" name="hv" type="text" value="0.2" placeholder="0.2"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ancho de viga Soleras</th>
                      <th class="px-4 py-2">bv</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="bv" name="bv" type="text" value="0.15" placeholder="0.15"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Peralte de Columnas</th>
                      <th class="px-4 py-2">hc</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="hc" name="hc" type="text" value="0.25" placeholder="0.25"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ancho de Columnas</th>
                      <th class="px-4 py-2">bc</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="bc" name="bc" type="text" value="0.25" placeholder="0.25"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Rec. De Elementos de Arriostres</th>
                      <th class="px-4 py-2">rec</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="rec" name="rec" type="text" value="0.02" placeholder="0.02"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
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
              <form id="datacercoperimetrico2" action="">
                <table class="w-full table-auto px-6 text-gray-800 dark:text-white">
                  <thead class="bg-white dark:bg-gray-800">
                    <tr class="text-center">
                      <th class="px-4 py-2" colspan="5">3.1. Zonificación, E.030 (Art. 10)
                      </th>
                    </tr>
                    <tr class="text-center">
                      <th class="px-4 py-2">Nombre</th>
                      <th class="px-4 py-2">Simb.</th>
                      <th class="px-4 py-2">Entrada</th>
                      <th class="px-4 py-2">Unidad <br> Medida</th>
                    </tr>
                  </thead>
                  <tbody class="text-center">
                    <tr class="bg-white dark:bg-gray-800" style="border: none;">
                      <th class="px-4 py-2">Departamento</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="depaSelect" name="depaSelect" aria-label="Default select example"></select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800" style="border: none;">
                      <th class="px-4 py-2">Provincia</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="provSelect" name="provSelect" aria-label="Default select example"></select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800" style="border: none;">
                      <th class="px-4 py-2">Distrito</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="distSelect" name="distSelect" aria-label="Default select example"></select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800" style="border: none;">
                      <th class="px-4 py-2">Zona Sísmica</th>
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="zonsis" name="zonsis" type="text" placeholder="" min="0" required>
                      </th>
                      <th class="px-4 py-2"></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800" style="border: none;">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">Z</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="z" name="z" type="text" value="210" placeholder="210"
                          min="0" required>
                      </th>
                      <th class="px-4 py-2"></th>
                    </tr>
                    <tr class="text-center">
                      <th class="px-4 py-2" colspan="5">3.2. Condiciones Geotécnicas, E.030
                        (Art. 12)
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Perfil de suelo tipo</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="pstSelect" name="pstSelect" aria-label="Default select example">
                          <option selected disabled>Seleccione</option>
                          <option value="s0">S0</option>
                          <option value="s1">S1</option>
                          <option value="s2">S2</option>
                          <option value="s3">S3</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="text-center">
                      <th class="px-4 py-2" colspan="5">3.3. Categoría del Edificio, E.030
                        (Art. 15)
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Categoría del Edificio</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="catediSelect" name="catediSelect" aria-label="Default select example">
                          <option selected disabled>Seleccione</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Tipo de Edificación</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="tipediSelect" name="tipediSelect" aria-label="Default select example">
                          <option selected disabled>Seleccione</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">3.4. Coeficiente Sísmico de elemento no Estructural
                      </th>
                      <th class="px-4 py-2">C1</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="c1" name="c1" type="text" value="0.6" placeholder="0.6"
                          min="0" required>
                      </th>
                      <th class="px-4 py-2"></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">5.3.4. Cálculo del acero a usar</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="var_usa" name="var_usa" aria-label="Default select example">
                          <option selected disabled>Seleccione la capa</option>
                          <option value="1" selected>1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">varillas de</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="var_med" name="var_med" aria-label="Default select example">
                          <option selected disabled>Seleccione la capa</option>
                          <option value="0.32">Ø1/4</option>
                          <option value="0.71" selected>Ø3/8</option>
                          <option value="1.27">Ø1/2</option>
                          <option value="1.98">Ø5/8</option>
                          <option value=">2.85">Ø3/4</option>
                          <option value="5.07">Ø1</option>
                          <option value="9.58">Ø1 3/8</option>
                          <option value="0.28">Ø6mm</option>
                          <option value="0.5">Ø8mm</option>
                          <option value="1.13">Ø12mm</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="text-center">
                      <th class="px-4 py-2" colspan="5"> Análisis estructural para la viga de
                        confinamiento
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Hardy Cross
                      </th>
                      <th class="px-4 py-2"></th>
                      <th class='px-4 py-2'><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="hc5_2" name="hc5_2" placeholder="Ingrese valor"></td>
                      <th class='px-4 py-2'>
                        </td>
                    </tr>
                    <tr class="text-center">
                      <th class="px-4 py-2" colspan="5"> 6.- diseño de los elementos de
                        arriostre en columnas
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">6.3.4. Cálculo del acero a usar</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="var_usa6_3_4" name="var_usa6_3_4" aria-label="Default select example">
                          <option selected disabled>Selecciona</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">6.3.4. Cálculo del acero a usar</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="var_med6_3_4" name="var_med6_3_4" aria-label="Default select example">
                          <option selected disabled>Selecciona</option>
                          <option value="0.32">Ø1/4</option>
                          <option value="0.71">Ø3/8</option>
                          <option value="1.27">Ø1/2</option>
                          <option value="1.98">Ø5/8</option>
                          <option value=">2.85">Ø3/4</option>
                          <option value="5.07">Ø1</option>
                          <option value="9.58">Ø1 3/8</option>
                          <option value="0.28">Ø6mm</option>
                          <option value="0.5">Ø8mm</option>
                          <option value="1.13">Ø12mm</option>
                        </select>
                      </th>
                    </tr>
                    <tr>
                      <th class="px-4 py-2">
                        <div class="input-group mb-2">
                          <button
                            class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                            type="submit">DISEÑAR</button>
                        </div>
                      </th>
                    </tr>
                  </tbody>
                </table>
              </form>
            </div>
          </div>
        </div>

        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-2/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800" id="cercoPer_pdf">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
            <button
              class="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              id="btn_pdf_predim" type="button">
              Generar PDF
            </button>
            <div class="overflow-x-auto">
              <canvas class="d-none" id="canva1" width="1000" height="900"></canvas>
            </div>
            <div class="overflow-x-auto">
              <canvas class="d-none" id="wallDesign" width="1000" height="800"></canvas>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-gray-800 dark:text-white" id="desingcorte">
                {{-- Condiciones geotecnicas --}}
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">IV. Diseño del muro
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2 text-left' colspan="8"><span id="text_3_1"></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>tipo</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id='tipo3_1'></span>
                    </td>
                    <td class='px-4 py-2'colspan="4" rowspan="8"><img
                        src="{{ Vite::asset('resources/img/calc/map.png') }}" alt="Viga"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Vs</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id='vs3_1'></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>S</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id='s3_1'></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>N₆₀</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id='n603_1'></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Tp</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id='tp3_1'></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Su</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id='su3_1'></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Tl</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id='tl3_1'></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Qu</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id='qu3_1'></span>
                    </td>
                  </tr>
                  {{-- <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class='py-2 px-8 text-center' colspan="8"><img src="{{ Vite::asset('resources/img/calc/map.png') }}"
                                            alt="Viga"></td>
                                    </tr>    --}}
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Factor de uso o Importancia</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2' colspan="5"><span id='factor_u'>esperando</span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id='text1'></span>
                    </td>
                  </tr>
                </tbody>

                <!-- Diseño del muro -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">IV. Diseño del muro
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">4.1 Valores de los
                      coeficientes de momentos (Art. 29.7 - E070)
                    </th>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">b/a</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">1</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">0.0479</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">1.20</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">0.0627</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">1.40</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">0.0755</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">1.60</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">0.0862</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">1.80</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">0.0948</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">2.00</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">0.1017</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">3.00</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">0.1180</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Calculando los valores</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2">b/a</td>
                    <td class='px-4 py-2 text-center'>a</td>
                    <td class='px-4 py-2 text-center' colspan="2">m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2"><span id="ba"></span>
                    </td>
                    <td class='px-4 py-2 text-center'><span id="a"></span></td>
                    <td class='px-4 py-2 text-center' colspan="2"><span id="m"></span>
                    </td>
                  </tr>
                </tbody>

                {{-- Diseño del muro --}}
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">4.2 Carga Sismica
                      uniformemente distribuida (Art. 29.6 -
                      E070)
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'>W=0.8*Z*U*C1*ya*e</td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="res4_2"></span>
                      kg/m²</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">4.3 Momento flector en
                      la albañileria (Art. 31.2 - E.070)</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'>Ms = m*w*a²</td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="res4_3"></span>
                      kg.m</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">4.4 Esfuerzo normal
                      producido por Ms (Art. 31.3 - E.070)</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'>fn = 6*Ms/t²</td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="res4_4"></span>
                      kg/m²</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">4.5. Verificacion de la
                      albañileria fn < f't</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2' colspan="2"></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'>fn = 6*Ms/t²</td>
                    <td class='px-4 py-2 text-center'>fn &lt; f't Condición</td>
                    <td class='px-4 py-2 text-center' colspan="2"><span id="fnValue"></span>kg/m² &lt; <span
                        id="fdtValue"></span>kg/m²
                    </td>
                    <td class='px-4 py-2 text-center'><span id="res4_5"></span> kg/m²</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">4.6. Carga Sismica
                      (Art. 29.6 - E.070)</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  {{-- <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class='py-2 px-8'></td>

                                    </tr> --}}
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>l</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id="l4_6"></span>
                    <td class='px-4 py-2' rowspan="5" colspan="4">
                      <img src="{{ Vite::asset('resources/img/calc/viga.png') }}" alt="Viga">
                    </td>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>X1</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id="x14_6"></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>R1</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id="r14_6"></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>h/2 </td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id="he24_6"></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>bv</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id="bv4_6"></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Carga sísmica para peso propio del muro</td>
                    <td class='px-4 py-2'>wppalb</td>
                    <td class='px-4 py-2'>0.8*<span id="shw1"></span>*<span id="shw2"></span>*<span
                        id="shw3"></span>*<span id="shw4"></span> </td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="wppalb"></span>Tn/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Carga sísmica para peso propio de la viga</td>
                    <td class='px-4 py-2'>wppv</td>
                    <td class='px-4 py-2'>0.8*<span id="shww1"></span>*<span id="shww2"></span>*<span
                        id="shww3"></span>*<span id="shww4"></span></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="wppv"></span>Tn/m</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">4.6. Carga Sismica
                      (Art. 29.6 - E.070)</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2' colspan="7"><img
                        src="{{ Vite::asset('resources/img/calc/columna.png') }}" alt="Viga"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Carga sísmica para peso propio del muro</td>
                    <td class='px-4 py-2'>wppalb</td>
                    <td class='px-4 py-2'>0.8*<span id="shw1b"></span>*<span id="shw2b"></span>*<span
                        id="shw3b"></span>*<span id="shw4b"></span></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="wppalbb"></span>Tn/m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Carga sísmica para peso propio de la viga</td>
                    <td class='px-4 py-2'>wppc</td>
                    <td class='px-4 py-2'>0.8*<span id="shwww1"></span>*<span id="shwww2"></span>*<span
                        id="shwww3"></span>*<span id="shwww4"></span></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="wppc"></span>Tn/m</td>
                  </tr>
                </tbody>

                {{-- DISEÑO DE LOS ELEMENTOS DE ARRIOSTRE EN VIGAS --}}
                {{-- 5.1 --}}
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">5.1. Análisis
                      estructural para la viga de confinamiento
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="8">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Muro</td>
                    <td class='px-4 py-2' colspan="7"> <img
                        src="{{ Vite::asset('resources/img/calc/momentos.png') }}" alt="momentum"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Viga</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="momtum"></span>
                      m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="momtum"></span>
                      m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="momtum"></span>
                      m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center'><span id="momtum1"></span></td>
                    <td class='px-4 py-2 text-center'><span id="momtum4a"></span> <span id="momtum4b"></span></td>
                    <td class='px-4 py-2 text-center'><span id="momtum7a"></span> <span id="momtum7b"></span></td>
                    <td class='px-4 py-2 text-center'><span id="momtum10"></span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center'><span id="momtum2"></span></td>
                    <td class='px-4 py-2 text-center'><span id="momtum5a"></span> <span id="momtum5b"></span></td>
                    <td class='px-4 py-2 text-center'><span id="momtum8a"></span> <span id="momtum8b"></span></td>
                    <td class='px-4 py-2 text-center'><span id="momtum11"></span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center'><span id="momtum3"></span></td>
                    <td class='px-4 py-2 text-center'><span id="momtum6a"></span> <span id="momtum6b"></span></td>
                    <td class='px-4 py-2 text-center'><span id="momtum9a"></span> <span id="momtum9b"></span></td>
                    <td class='px-4 py-2 text-center'><span id="momtum12"></span></td>
                  </tr>
                </tbody>

                {{-- 5.2 --}}
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">5.2. Resolviendo por el
                      método de hardy cross
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="val5_2"></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2' colspan="8"><img src="{{ Vite::asset('resources/img/calc/hc.png') }}"
                        alt="Viga" style="display: block; margin-left: auto; margin-right: auto"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2 text-left' colspan="2">RA = <span id="ra5_2"></span></td>
                    <td class='px-4 py-2'>RB =<span id="rb5_2"></span></td>
                    <td class='px-4 py-2' colspan="2">RC =<span id="rc5_2"></span></td>
                    <td class='px-4 py-2 text-center' colspan="4">RD=<span id="rd5_2"></span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Diagrama de fuerzas cortantes (Ton)</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="val25_2"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2' colspan="3">Diagrama de fuerzas cortantes (Ton)</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="3"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'><span class="ml-3 px-5" id="v5_2"></span></td>
                    <td class='px-4 py-2'><span class="ml-5 px-5" id="vv5_2"></span></td>
                    <td class='px-4 py-2'><span class="ml-5 px-5" id="vvv5_2"></span></td>
                    <td class='px-4 py-2 text-center' colspan="4"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2 text-center' colspan="8"> <img
                        src="{{ Vite::asset('resources/img/calc/d2.png') }}" alt="d2"
                        style="display: block; margin-left: auto; margin-right: auto;"></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'><span class="px-5"id="t5_2"></span></td>
                    <td class='px-4 py-2'><span class="ml-3 px-5"id="tt5_2"></span></td>
                    <td class='px-4 py-2'><span class="ml-3 px-5" id="ttt5_2"></span></td>
                    <td class='px-4 py-2 text-center' colspan="5"></td>
                  </tr>
                </tbody>

                {{-- 5.3 --}}
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">5.3. Diseño por
                      Flexión
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Mmax.v</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="mmaxv5_3"></span>
                      Tn.m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Muv</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5">1.25 * Mmax.v = <span id="muv5_3"></span>
                      Tn.m</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">5.3.1. Cálculo de acero mínimo
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Asmin</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="asmin"></span>
                      cm2</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">5.3.2. Cálculo de acero máximo
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Asmax</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="asmax"></span>
                      cm2</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">5.3.3. Cálculo de acero por flexión
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Mu</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="mu5_3_3"></span>Kg*cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>d</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="d5_3_3"></span>cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>b</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="b5_3_3"></span>cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>fy</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="fy5_3_3"></span>kg/cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>f'c</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="fdc5_3_3"></span>kg/cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Primera Iteración</td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ite1a"></span>Cm2 -------- a
                      =<span id="ite1b"></span>cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Segunda Iteración</td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ite2a"></span>Cm2 -------- a
                      =<span id="ite2b"></span>cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Tercera Iteración</td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ite3a"></span>Cm2 -------- a
                      =<span id="ite3b"></span>cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Cuarta Iteración</td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ite4a"></span>Cm2 -------- a
                      =<span id="ite4b"></span>cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Quinta Iteración</td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ite5a"></span>Cm2 -------- a
                      =<span id="ite5b"></span>cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="con5_3_3"></span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="as5_3_4"></span>
                      cm2</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">5.3.5. Verificación del momento
                      resistente a flexión
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Mrv</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="2"><span id="mrv5_3_5"></span>
                      Tn.m</td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id="repvb5_3_5"></span> Tn.m &lt; <span
                        id="repva5_3_5"></span> Tn.m
                    </td>
                    <td class='px-4 py-2 text-center' colspan="1"><span id="repvb5_3_5"></span> Tn.m &lt; <span
                        id="con5_3_5"></span></td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">5.4. Diseño por Corte</th>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">5.4.1 Fuerzas cortantes máximas obtenidas
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Vmax.v</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="vmaxv5_4_1"></span> Tn</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">5.4.1 Fuerzas cortantes máximas obtenidas
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Vuv</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5">1.25 * Vmax.v = <span id="vuv5_4_1"></span>
                      Tn</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">5.4.2 Verificación de la resistencia al
                      corte del concreto</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Vu</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5">1.25 * Vrv = <span id="vrv5_4_1"></span> Tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="a5_4_1"></span> Tn &lt; <span
                        id="b5_4_1"></span> Tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="con5_4_2"></span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5">Acero de Ø6mm,
                      1@5cm,4@10cm,resto @25cm</td>
                  </tr>
                </tbody>

                {{-- Diseño de los elementos de arriostre en columnas --}}
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">VI. Diseño de los
                      elementos de arriostre en columnas</th>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">6.1. Diagrama de momentos flectores
                      (Ton.m)</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Mmax.v</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="v6_1"></span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2' colspan="8"><img
                        src="{{ Vite::asset('resources/img/calc/ra1.png') }}" alt="Viga" /></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="vv6_1"></span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="vvv6_1"></span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>RA</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ra6_1"></span></td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">6.2 Diagrama de Fuerzas Cortantes (Ton)
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="vb6_1"></span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2' colspan="8"><img
                        src="{{ Vite::asset('resources/img/calc/ra2.png') }}" alt="Viga" /></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="vvb6_1"></span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="vvvb6_1"></span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>RA</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ra6_2"></span></td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">6.3 Diseño por flexion de la columna de
                      confinamiento</th>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">6.3.1 Cálculo del área de acero mínimo
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Mmaxe</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="mmaxe6_31"></span> Tn.m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Mve</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="mve6_31"></span> * Mmaxe = Tn.m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Asmin</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="asmin6_31"></span> cm2</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">6.3.2 Cálculo del área de acero máximo
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Asmax</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="asmax6_32"></span> cm2</td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">6.3.3. Cálculo de acero por flexión</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Mu</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="mu6_3_3"></span> Kg*cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>d</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="d6_3_3"></span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>b</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="b6_3_3"></span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>fy</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="fy6_33"></span> kg/cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>f'c</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="fdc6_33"></span> kg/cm2</td>
                  </tr>

                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Primera Iteración</td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ite1a6_33"></span>Cm2 -------- a
                      =<span id="ite1b6_33"></span>cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Segunda Iteración</td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ite2a6_33"></span>Cm2 -------- a
                      =<span id="ite2b6_33"></span>cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Tercera Iteración</td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ite3a6_33"></span>Cm2 -------- a
                      =<span id="ite3b6_33"></span>cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Cuarta Iteración</td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ite4a6_33"></span>Cm2 -------- a
                      =<span id="ite4b6_33"></span>cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Quinta Iteración</td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="ite5a6_33"></span>Cm2 -------- a
                      =<span id="ite5b6_33"></span>cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="con6_3_3"></span>
                    </td>
                  </tr>

                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>As</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="as6_3_4"></span>cm2
                    </td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">6.3.5. Verificación del momento
                      resistente a flexión</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Mrc</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="mrc6_3_5"></span>Tn.m
                    </td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">6.4 Diseño por corte de la columna de
                      confinamiento</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Vmax.v</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="vmaxv6_4"></span>Tn
                    </td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="8">6.4.1. Verificación de la resistencia
                      al cortante del concreto</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col" colspan="5">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'>Vrc</td>
                    <td class='px-4 py-2'>1.25 * Vrv</td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="vrc6_4_1"></span>Tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="a6_4_1"></span>Tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="b6_4_1"></span>Tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5"><span id="con6_4_1"></span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center' colspan="5">Acero de Ø6mm,
                      1@5cm,4@10cm,resto @25cm. Adicionalmente se agregará 2 estribos en la unión
                      solera-columna</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    @pushOnce('scripts')
      <script src="https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.15/paper-full.min.js"></script>
      @vite('resources/js/cercoPerimetrico/cercoPerimetricoCalc.js')
      @vite('resources/js/cercoPerimetrico/drawCP.js')
    @endpushOnce
</x-calc-layout>
