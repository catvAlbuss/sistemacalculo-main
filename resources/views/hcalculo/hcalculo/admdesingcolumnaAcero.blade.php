<x-calc-layout title='Diseño de columnas W,S,M,HP'>
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
                    <th class="px-4 py-2">Perfil de Selección de columna</th>
                    <th class="px-4 py-2" colspan="3">
                      <select
                        class="xlsx-cell formas form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I8" name="psc" data-selected="W12X106" aria-label="Default select example">
                        <option selected disabled>Seleccione</option>
                      </select>
                    </th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Carga axial a compresión de diseño</th>
                    <th class="px-4 py-2">Pu</th>
                    <th class="px-4 py-2">
                      <input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I9" name="pu" type="text" value="185.4" placeholder="185.4" min="0"
                        required>
                    </th>
                    <th class="px-4 py-2">Ton</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Momento Último de diseño en el eje X</th>
                    <th class="px-4 py-2">Mux</th>
                    <th class="px-4 py-2"><input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I10" name="Mux" type="text" value="6.2" placeholder="6.2" min="0"
                        required>
                    </th>
                    <th class="px-4 py-2">Ton-m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Momento Último de diseño en el eje Y</th>
                    <th class="px-4 py-2">Muy</th>
                    <th class="px-4 py-2"><input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I11" name="Muy" type="text" value="4.1" placeholder="4.1" min="0"
                        required>
                    </th>
                    <th class="px-4 py-2">Ton-m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Condición de apoyo en la base</th>
                    <th class="px-4 py-2" colspan="3">
                      <select
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I12" name="ca" aria-label="Default select example">
                        <option selected disabled>Seleccione</option>
                        <option value="Empotrado" selected>Empotrado</option>
                        <option value="Articulado">Articulado</option>
                      </select>
                    </th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Desplazamiento lateral impedido en el eje X-X?</th>
                    <th class="px-4 py-2" colspan="3">
                      <select
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I13" name="dlixx" aria-label="Default select example">
                        <option selected disabled>Seleccione</option>
                        <option value="Si">Si</option>
                        <option value="No" selected>No</option>
                      </select>
                    </th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Desplazamiento lateral impedido en el eje Y-Y?</th>
                    <th class="px-4 py-2" colspan="3">
                      <select
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I14" name="dliyy" aria-label="Default select example">
                        <option selected disabled>Seleccione</option>
                        <option value="Si">Si</option>
                        <option value="No" selected>No</option>
                      </select>
                    </th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Longitud libre de la columna X</th>
                    <th class="px-4 py-2">Lx</th>
                    <th class="px-4 py-2"><input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I15" name="Lx" type="text" value="3" placeholder="3" min="0"
                        required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Longitud libre de la columna Y</th>
                    <th class="px-4 py-2">Ly</th>
                    <th class="px-4 py-2"><input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I16" name="Ly" type="text" value="3" placeholder="3" min="0"
                        required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Tipo de Acero</th>
                    <th class="px-4 py-2" colspan="3">
                      <select
                        class="xlsx-cell aceros form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I18" name="Ta" data-selected="A-572 Gr. 50"
                        aria-label="Default select example">
                        <option selected disabled>Seleccione</option>
                      </select>
                    </th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Módulo de elasticidad del Acero</th>
                    <th class="px-4 py-2">Mu</th>
                    <th class="px-4 py-2"><input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I20" name="Es" type="text" value="2039432" placeholder="2039432"
                        min="0" required
                        oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                    </th>
                    <th class="px-4 py-2">kg/cm2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Módulo de cortante elástico de fluencia</th>
                    <th class="px-4 py-2">G</th>
                    <th class="px-4 py-2"><input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I21" name="G" type="text" value="787221" placeholder="787221"
                        min="0" required
                        oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                    </th>
                    <th class="px-4 py-2">kg/cm2</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">viga 1</th>
                    <th class="px-4 py-2" colspan="3">
                      <select
                        class="xlsx-cell formas form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="M24" name="v1" data-selected="W16X36" aria-label="Default select example">
                        <option selected disabled>Seleccione</option>
                      </select>
                    </th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">Lg</th>
                    <th class="px-4 py-2"><input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="M25" name="L1" type="text" value="7" placeholder="7" min="0"
                        required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">viga 2</th>
                    <th class="px-4 py-2" colspan="3">
                      <select
                        class="xlsx-cell formas form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="E30" name="v2" data-selected="W16X36" aria-label="Default select example">
                        <option selected disabled>Seleccione</option>
                      </select>
                    </th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">L2</th>
                    <th class="px-4 py-2"><input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="E31" name="L2" type="text" value="7" placeholder="7" min="0"
                        required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">viga 3</th>
                    <th class="px-4 py-2" colspan="3">
                      <select
                        class="xlsx-cell formas form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="E24" name="v3" data-selected="W14X26" aria-label="Default select example">
                        <option selected disabled>Seleccione</option>
                      </select>
                    </th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">L3</th>
                    <th class="px-4 py-2"><input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="E25" name="L3" type="text" value="5" placeholder="5" min="0"
                        required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">viga 4</th>
                    <th class="px-4 py-2" colspan="3">
                      <select
                        class="xlsx-cell formas form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="M30" name="v4" data-selected="W14X26" aria-label="Default select example">
                        <option selected disabled>Seleccione</option>
                      </select>
                    </th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">L4</th>
                    <th class="px-4 py-2"><input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="M31" name="L4" type="text" value="5" placeholder="5" min="0"
                        required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2">Col 2</th>
                    <th class="px-4 py-2" colspan="3">
                      <select
                        class="formas xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I23" name="c2" data-selected="W12X106" aria-label="Default select example">
                        <option selected disabled>Seleccione</option>
                      </select>
                    </th>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <th class="px-4 py-2"></th>
                    <th class="px-4 py-2">L5</th>
                    <th class="px-4 py-2"><input
                        class="xlsx-cell form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="I24" name="L5" type="text" value="3" placeholder="3" min="0"
                        required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                    </th>
                    <th class="px-4 py-2">m</th>
                  </tr>

                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="px-4 py-2">
                      <div class="input-group mb-2">
                        <button
                          class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                          id="desingButton" type="button">DISEÑAR</button>
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
            <button
              class="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              id="btn_pdf_predim" type="button">
              Generar PDF
            </button>
            <div class="overflow-x-auto" id="columnaAcero_pdf">
              <table class="min-w-full text-gray-800 dark:text-white" id="desingcorte">
                <!-- Requisitos de diseño vigas -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Requisitos de
                      diseño</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800" id="resultados"></tbody>

                <thead class="bg-gray-200 dark:bg-gray-700"></thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>Esfuerzo de fluencia del acero</td>
                    <td class='px-4 py-2'>fy</td>
                    <td class='px-4 py-2'></td>
                    <td class='px-4 py-2 text-center'><span class="xlsx-cell" id="I19">3515.34927829585</span>
                      kg/cm<sup>2</sup></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='px-4 py-2' colspan="4" scope="col">Col 2</th>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-8 py-2'>-</td>
                    <td class='px-4 py-2'>Ix =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="I25">38834.39200848</span>cm4</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'>Iy =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="I26">12528.565910559999</span>
                      cm<sup>4</sup></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="4" scope="col">Viga 1</th>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'>Ix =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell"
                        id="M26">18647.167866879998</span>cm<sup>4</sup></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="4" scope="col">Viga 2</th>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'>Ix =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell"
                        id="E32">18647.167866879998</span>cm<sup>4</sup></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="4" scope="col">Viga 3</th>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'>Ix =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="E26">10197.669927199999</span>
                      cm<sup>4</sup></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="4" scope="col">Viga 4</th>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'>Ix =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M32">10197.669927199999</span>
                      cm<sup>4</sup></td>
                  </tr>
                </tbody>

                <!-- Diseño del calculo del area del refuerzo  -->
                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.- Propiedades
                      geometricas de la columna</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-xl" scope="col">Nombre</th>
                    <th class="text-xl" scope="col">Simbolo</th>
                    <th class="text-xl" scope="col">Formula</th>
                    <th class="text-xl" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Peralte de la Columna</td>
                    <td class='px-4 py-2'>d =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="G38">53.594</span> cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Longitud Libre del Alma h =</td>
                    <td class='px-4 py-2'>T =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="G39">46.6725</span>
                      cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Ancho del Patín</td>
                    <td class='px-4 py-2'>bf =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="G40">21.0058</span>
                      cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Espersor del Patín</td>
                    <td class='px-4 py-2'>tf =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="G41">1.7399000000000002</span> cm</td>

                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Espesor del Alma</td>
                    <td class='px-4 py-2'>tw =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="G42">1.0922</span> cm
                    </td>

                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Dist. Entre centros de patin</td>
                    <td class='px-4 py-2'>ho =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="G43">51.8541</span>
                      cm
                    </td>

                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Inercia en X</td>
                    <td class='px-4 py-2'>Ixx =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="G44">61602.2509888</span> cm<sup>4</sup>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Inercia en Y</td>
                    <td class='px-4 py-2'>Iyy =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="G45">2693.017323632</span> cm<sup>4</sup>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Área global</td>
                    <td class='px-4 py-2'>Ag =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="G46">129.032</span>
                      cm<sup>2</sup>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Peso propio</td>
                    <td class='px-4 py-2'>Pp =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="G47">101.19506561679789</span> kg/m</td>
                  </tr>
                  <!--Segundo plano-->
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Módulo de alabeo</td>
                    <td class='px-4 py-2'>Cw =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N38">1815302.4578110487</span>
                      cm<sup>6</sup></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Módulo de torsión</td>
                    <td class='px-4 py-2'>J =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N39">101.976699272</span> cm<sup>4</sup>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Módulo de Plástico en X</td>
                    <td class='px-4 py-2'>Zx =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N40">2621.9302399999997</span>
                      cm<sup>3</sup></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Módulo de Plástico en Y</td>
                    <td class='px-4 py-2'>Zy =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N41">399.84436159999996</span>
                      cm<sup>3</sup></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Módulo elástico en X</td>
                    <td class='px-4 py-2'>Sx =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N42">2294.18896</span> cm<sup>3</sup>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Módulo elástico en Y</td>
                    <td class='px-4 py-2'>Sy =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N43">257.27690479999995</span>
                      cm<sup>3</sup></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Radio de giro efectivo rst =</td>
                    <td class='px-4 py-2'>rT =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N44">5.5118</span> cm
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Radio de giro en X</td>
                    <td class='px-4 py-2'>rx =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N45">21.843999999999998</span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Radio de giro en Y</td>
                    <td class='px-4 py-2'>ry =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N46">4.572</span> cm
                    </td>
                  </tr>
                </tbody>

                <!-- Diseño por aceros para calcular el area por capas flexion-->
                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">3.- Datos de salida
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-xl" scope="col">Nombre</th>
                    <th class="text-xl" scope="col">Simbolo</th>
                    <th class="text-xl" scope="col">Formula</th>
                    <th class="text-xl" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2" id="acerosfinales">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Coeficiente de rigidez relativa en Ax,</td>
                    <td class='px-4 py-2'>Gax =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M50">1.0</span> Gax</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Coeficiente de rigidez relativa en Ay,</td>
                    <td class='px-4 py-2'>Gay =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M51">1.0</span> Gax</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Coeficiente de rigidez relativa en Bx,</td>
                    <td class='px-4 py-2'>Gbx =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M52">0.04623193732057162</span> Gax</td>
                  </tr>
                  <!--Datos de salida parte 1-->
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Coeficiente de rigidez relativa en By,</td>
                    <td class='px-4 py-2'>Gby =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M53">0.012866646426878438</span> Gax</td>
                  </tr>
                </tbody>

                <!-- Diseño por corte -->
                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">3.1.- Para pórticos no
                      arriostrados
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-xl" scope="col">Nombre</th>
                    <th class="text-xl" scope="col">Simbolo</th>
                    <th class="text-xl" scope="col">Formula</th>
                    <th class="text-xl" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Coeficiente de longitud efectiva en X</td>
                    <td class='px-4 py-2'>Kx =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M58">1.172994537780835</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Coeficiente de longitud efectiva en Y</td>
                    <td class='px-4 py-2'>Ky =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M59">1.1659160907780135</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Coeficiente de esbeltez en X</td>
                    <td class='px-4 py-2'>𝜆x =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M60">27.006366850412928</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Coeficiente de esbeltez en Y</td>
                    <td class='px-4 py-2'>𝜆y =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M61">70.98279633764999</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Coeficiente de esbeltez máximo</td>
                    <td class='px-4 py-2'>𝜆máx =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M62">70.98279633764999</span></td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">IV Analisis de Esbeltez
                      Local</th>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">4.1. Pandeo Local en el
                      Patín Qs</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-xl" scope="col">Nombre</th>
                    <th class="text-xl" scope="col">Simbolo</th>
                    <th class="text-xl" scope="col">Formula</th>
                    <th class="text-xl" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esbeltez de límite inferior en el patín</td>
                    <td class='px-4 py-2'>𝜆p =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M71">13.488338177192553</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esbeltez de límite superior en el patín</td>
                    <td class='px-4 py-2'>𝜆r =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M72">24.80890771876487</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esbeltez en el patín</td>
                    <td class='px-4 py-2'>𝜆 =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M73">7.776699029126214</span> <span
                        class="xlsx-cell" id="N73">Zona 1</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Factor de reducción por pandeo del patín</td>
                    <td class='px-4 py-2'>Qs =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M75">1.0</span></td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">4.2. Pandeo Local en el
                      Alma Qa</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-xl" scope="col">Nombre</th>
                    <th class="text-xl" scope="col">Simbolo</th>
                    <th class="text-xl" scope="col">Formula</th>
                    <th class="text-xl" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esbeltez de límite en el alma</td>
                    <td class='px-4 py-2'>𝜆p =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M83">35.888614078601606</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esbeltez en el alma</td>
                    <td class='px-4 py-2'>𝜆 =T /(tw)</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M84">31.355932203389834</span> <span
                        class="xlsx-cell" id="N84">Zona 1</span></td>
                  </tr>
                  <!--Datos de salida 07-->
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esfuerzo de pandeo crítico elásico-Esf. Euler</td>
                    <td class='px-4 py-2'>Fe =</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="L88">-</span></td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M88">-</span></td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N88">-</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esfuerzo de pandeo crítico elásico-Esf. Euler</td>
                    <td class='px-4 py-2'>Fe =</td>
                    <td class='px-4 py-2' colspan="2"><span class="xlsx-cell" id="N88">-</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esfuerzo de pandeo crítico por flexión (kg/cm2)</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="L89">-</span></td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M89">-</span></td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N89">-</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Ancho efectivo</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="L90">-</span></td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M90">-</span></td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N90">-</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Área efectiva</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="L91">-</span></td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M91">-</span></td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N91">-</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Factor de reducción por pandeo del alma</td>
                    <td class='px-4 py-2'>Qa =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M92">1.0</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Factor de reducción total por pandeo en alma</td>
                    <td class='px-4 py-2'>Q = Qs</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M94">1.0</span></td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">V. Resistencia por
                      pandeo flexional</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-xl" scope="col">Nombre</th>
                    <th class="text-xl" scope="col">Simbolo</th>
                    <th class="text-xl" scope="col">Formula</th>
                    <th class="text-xl" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esbeltez límite</td>
                    <td class='px-4 py-2'>𝜆lim =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M97">113.447</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esfuerzo crítico de Euler</td>
                    <td class='px-4 py-2'>Fe =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M98">3994.87</span> kg/cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esfuerzo crítico de la columna</td>
                    <td class='px-4 py-2'>Fcr =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M99">2432.28</span> kg/cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Resistencia por pandeo flexional</td>
                    <td class='px-4 py-2'>øRn =ø Fcr</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M100">165238</span> kg</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td colspan="4">øRn =
                      <span class="xlsx-cell px-4 py-2" id="F102">207.55615069040283</span>
                      Ton
                      <span class="xlsx-cell px-4 py-2" id="H102">&gt;</span>
                      Pu =
                      <span class="xlsx-cell px-4 py-2" id="J102">185.4</span>
                      Ton
                      <span class="xlsx-cell px-4 py-2" id="M102">¡Cumple!</span>
                      <span class="xlsx-cell px-4 py-2" id="N102">0.8932522567184644</span>
                    </td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">VI. Resistencia por
                      pandeo flexotorsional</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-xl" scope="col">Nombre</th>
                    <th class="text-xl" scope="col">Simbolo</th>
                    <th class="text-xl" scope="col">Formula</th>
                    <th class="text-xl" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Rango limite entre elástico-Inelástico</td>
                    <td class='px-4 py-2'>0.44*Q*Fy</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M105">1547</span> kg/cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esfuerzo crítico de Euler</td>
                    <td class='px-4 py-2'>Fe =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M107">7949.26</span> kg/cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Esfuerzo crítico de la columna</td>
                    <td class='px-4 py-2'>Fcr =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M108">2921.35</span> kg/cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Resistencia por pandeo flexotorsional</td>
                    <td class='px-4 py-2'>øRn =ø Fcr</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M109">198463.01</span> kg</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td colspan="4">øRn =
                      <span class="xlsx-cell" id="F111">587.7370068962344</span>
                      Ton
                      <span class="xlsx-cell" id="H111">&gt;</span>
                      Pu =
                      <span class="xlsx-cell" id="J111">185.4</span>
                      Ton
                      <span class="xlsx-cell" id="M111">¡Cumple!</span>
                      <span class="xlsx-cell" id="N111">0.3154472116347994</span>
                    </td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">VII. Resistencia a
                      momento por flexocompresión</th>
                  </tr>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">7.1. Resistencia a
                      momento en X</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-xl" scope="col">Nombre</th>
                    <th class="text-xl" scope="col">Simbolo</th>
                    <th class="text-xl" scope="col">Formula</th>
                    <th class="text-xl" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Donde:</td>
                    <td class='px-4 py-2'>Cb =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'>
                      <input class="form-control xlsx-cell" id="I115" type="number" value="1" />
                    </td>
                    <td class='px-4 py-2'>-</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Donde:</td>
                    <td class='px-4 py-2'>øb =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'>
                      <input class="form-control xlsx-cell" id="N115" type="number" value="0.9" />
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Zona 1</td>
                    <td class='px-4 py-2'>Mp1 =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="H126">9447425.591349216</span> kg-cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Zona 2</td>
                    <td class='px-4 py-2'>Mn2 =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="H127">9447425.591349216</span> kg-cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Zona 3</td>
                    <td class='px-4 py-2'>Mn3 =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="H128">9447425.591349216</span> kg-cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Longitud plástica</td>
                    <td class='px-4 py-2'>Lp =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M126">334.8707327331609</span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Longiud elástica</td>
                    <td class='px-4 py-2'>Lr =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M127">1545.1041807257882</span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Resistencia a flexión en X (Ton-m)</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="L129">Mp1 =</span></td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M129">94.47425591349217</span> <span
                        class="xlsx-cell" id="N129">Zona 1</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td colspan="4">øMn =
                      <span class="xlsx-cell" id="F131">85.02683032214296</span>
                      Ton-m
                      <span class="xlsx-cell" id="H131">&gt;</span>
                      Mu =
                      <span class="xlsx-cell" id="J131">6.2</span>
                      Ton-m
                      <span class="xlsx-cell" id="M131">¡Cumple!</span>
                      <span class="xlsx-cell" id="N131">0.07291815979156142</span>
                    </td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">7.2. Resistencia a
                      momento en Y</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-xl" scope="col">Nombre</th>
                    <th class="text-xl" scope="col">Simbolo</th>
                    <th class="text-xl" scope="col">Formula</th>
                    <th class="text-xl" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Longitud plástica</td>
                    <td class='px-4 py-2'>Lp =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M134">552.3751957945709</span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Resistencia a flexión en Y (Ton-m)</td>
                    <td class='px-4 py-2'>Mp =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M135">9.677850605772369</span> Ton-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td colspan="4">øMn =
                      <span class="xlsx-cell" id="F137">38.93606681215204</span>
                      Ton-m
                      <span class="xlsx-cell" id="H137">&gt;</span>
                      Mu =
                      <span class="xlsx-cell" id="J137">3.0</span>
                      Ton-m
                      <span class="xlsx-cell" id="M137">¡Cumple!</span>
                      <span class="xlsx-cell" id="N137">0.07704938494361975</span>
                    </td>
                  </tr>
                </tbody>

                <thead class="bg-gray-200 dark:bg-gray-700">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">7.3. Ecuación de
                      interacción</th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-xl" scope="col">Nombre</th>
                    <th class="text-xl" scope="col">Simbolo</th>
                    <th class="text-xl" scope="col">Formula</th>
                    <th class="text-xl" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="py-2">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Relación de resistencia axial</td>
                    <td class='px-4 py-2'>Pu /∅𝑃n =</td>
                    <td class='px-4 py-2'>-</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M144">1.1220194311855445</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='px-4 py-2'>Chequeo de combinación de esfuerzos</td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="L145">1.0 &gt;</span></td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M145">0.508697784362306</span></td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="M146">¡Cumple!</span></td>
                    <td class='px-4 py-2'><span class="xlsx-cell" id="N146">0.508697784362306</span>%</td>
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
    <script src="https://cdn.jsdelivr.net/npm/hyperformula/dist/hyperformula.full.min.js"></script>
    @vite('resources/js/adm_columnasAceros.js')
  @endpushOnce
</x-calc-layout>
