@pushOnce('scripts')
  @vite('resources/js/diseño_en_madera.flexocompresion.js')
@endPushOnce

<x-calc-layout title="Diseño En Madera">
  <div class="container mx-auto py-12">
    <div class="flex flex-wrap">
      <!-- Resultados -->
      <div class="mt-4 w-full px-4 md:mt-0">
        <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full text-gray-800 dark:text-white" id="resultados">
              <!-- Flexocompresion -->
              <thead class="bg-gray-200 dark:bg-gray-800">
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                  <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Flexocompresion
                  </th>
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                  <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                  <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                  <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                  <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                </tr>
              </thead>
              <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Longitud efectiva</td>
                  <td class="px-4 py-2">lef</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="diseñoLef" name="diseñoLef" type="number" value="2.175" step="any" min="0"
                      required> m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">AXIAL</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexocompresionAxial" name="flexocompresionAxial" type="number" value="5951.81"
                      step="any" min="0" required> kg
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">MOMENTO</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexocompresionMomento" name="flexocompresionMomento" type="number" value="43.4"
                      step="any" min="0" required>
                    kg-m
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Suponiendo una sección</td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexocompresionSeccion" name="flexocompresionSeccion" type="number" value="57.0"
                      step="any" min="0" required>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">b</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexocompresionB">8.0</span> pulg</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">b</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexocompresionBcm">20.32</span> cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">d</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexocompresionD">8.0</span> pulg</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">d</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexocompresionDcm">20.32</span> cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">A</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexocompresionA" name="flexocompresionA" type="number" value="841.0" step="any"
                      min="0" required> cm2
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">Ix</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexocompresionLx" name="flexocompresionLx" type="number" value="58940.0" step="any"
                      min="0" required> cm4
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">Zx</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexocompresionZx" name="flexocompresionZx" type="number" value="4064.0" step="any"
                      min="0" required> cm3
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Esbeltez</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexocompresionEsbeltez">10.703</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><span id="flexocompresionColumnaTipo">Columna
                      intermedia</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2">Ck</td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><span id="flexocompresionCk">18.42</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Columnas cortas</td>
                  <td class="px-4 py-2">λ &lt; 10</td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><span id="flexocompresionColumnasCortas">121945.0</span>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Columnas intermedias</td>
                  <td class="px-4 py-2">10&lt; λ &lt;Ck</td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><span id="flexocompresionColumnasIntermedias">117310.248</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Columnas largas</td>
                  <td class="px-4 py-2">Ck&lt; λ &lt;50</td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><span id="flexocompresionColumnasLargas">229426.924</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Nadm</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexocompresionNadm">117310.24831954179
                      kg</span>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><span id="flexocompresionOk">ok</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Carga crítica de Euler para pandeo en la dirección en que
                    se aplican los momentos de flexión</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexocompresionNer">1168193.9685140897</span>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Cuando existen flexión y compresión combinadas, los
                    momentos flectores se amplifican por acción de cargas axiales</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexocompresionKm">1.0077011773377664</span>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Entonces se Tiene</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexocompresionEntonces">0.0558601001557404</span> <span
                      id="flexocompresionEntoncesOk">ok</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">El espaciamiento entre correas, para garantizar una
                    esbeltez fuera del plano de la cuerda (λy) igual o menor a la del plano
                    (λx), será igual a:</td>
                  <td class="px-4 py-2">lc</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexocompresionLc">217.49999999999997</span>
                    cm
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Usar</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexocompresionUsar">8x8</span> pulg</td>
                </tr>
              </tbody>
              <thead class="bg-gray-200 dark:bg-gray-800">
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                  <th class="px-4 py-2 text-left text-xl" colspan="4">2.- Compresion
                  </th>
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                  <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                  <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                  <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                  <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                </tr>
              </thead>
              <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">AXIAL</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="compresionAxial" name="compresionAxial" type="number" value="5951.81" step="any"
                      min="0" required> kg</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Longitud efectiva </td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">0.8 * ld</td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="compresionLongitudEfectiva" name="compresionLongitudEfectiva" type="number"
                      value="2.175" step="any" min="0" required> m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Suponiendo una sección</td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="compresionSeccion" name="compresionSeccion" type="number" value="63.0" step="any"
                      min="0" required></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">b</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionB">12.0</span> pulg</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">b</td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><span id="compresionBcm">30.48</span> cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">d</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionD">12.0</span> pulg</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">d</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionDcm">30.48</span> cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">A</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionA">841.0</span> cm2</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">Ix</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionLx">58940.1</span> cm4</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">Zx</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionZx">4064.8</span> cm3</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Esbeltez:</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionEsbeltez">7.135826771653543</span>
                    <span id="compresionEsbeltezColumnaTipo">Columna
                      corta</span>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">Ck</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionCk">18.42</span> <span
                      id="compresionCkColumnaTipo">Columna corta</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Columnas cortas</td>
                  <td class="px-4 py-2">λ &lt; 10</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionColumnasCortas">121945.0</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Columnas intermedias</td>
                  <td class="px-4 py-2">10&lt; λ &lt;Ck</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionColumnasIntermedias">121029.49349521814</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Columnas largas</td>
                  <td class="px-4 py-2">Ck&lt; λ &lt;50</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionColumnasLargas">516210.5804800001</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Nadm</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionNadm">121945.0</span> kg</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><span id="compresionNadmOk">ok</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Usar</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="compresionUsar">12x12</span> pulg</td>
                </tr>
              </tbody>
              <thead class="bg-gray-200 dark:bg-gray-800">
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                  <th class="px-4 py-2 text-left text-xl" colspan="4">3.- Traccion
                  </th>
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                  <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                  <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                  <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                  <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                </tr>
              </thead>
              <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">AXIAL</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="traccionAxial">1449.0</span> kg</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">N</td>
                  <td class="px-4 py-2">ft*A</td>
                  <td class="px-4 py-2"><span id="traccionNFtA">121945.0</span>&gt;<span
                      id="traccionNFtACompara">1449.0</span> <span id="traccionNFtAOk">ok</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><span id="traccionNFtAOk">ok</span></td>
                </tr>
              </tbody>
              <thead class="bg-gray-200 dark:bg-gray-800">
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                  <th class="px-4 py-2 text-left text-xl" colspan="4">4.- Flexotraccion
                  </th>
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                  <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                  <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                  <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                  <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                </tr>
              </thead>
              <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">AXIAL</td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexotraccionAxial" name="flexotraccionAxial" type="number" value="1076.87"
                      step="any" min="0" required> kg
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">MOMENTO</td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"></td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexotraccionMomento" name="flexotraccionMomento" type="number" value="710.5"
                      step="any" min="0" required>
                    kg-m
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Suponiendo una sección</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexotraccionSeccion" name="flexotraccionSeccion" type="number" value="35.0"
                      step="any" min="0" required>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">b</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexotraccionB" name="flexotraccionB" type="number" value="4.0" step="any"
                      min="0" required> pulg</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">b</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexotraccionBcm">10.16</span> cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">d</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><input
                      class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexotraccionD" name="flexotraccionD" type="number" value="4.0" step="any"
                      min="0" required> pulg</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">d</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexotraccionDcm">39.9796</span> cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">A</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexotraccionA">45.0</span> cm2</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">Ix</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexotraccionLx">303.7</span> cm4</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">Zx</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexotraccionZx">67.5</span> cm3</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2"><span id="flexotraccionDonde">Donde</span>
                  </td>
                  <td class="px-4 py-2"><span id="flexotraccionDonde">-</span>
                  </td>
                  <td class="px-4 py-2"><span id="flexotraccionDonde">5.177383226905066</span>
                    &lt; <input
                      class="xlsx-calc form-control w-1/3 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      id="flexotraccionMayorQue" name="flexotraccionMayorQue" type="number" value="1.0"
                      step="any" min="0" required>
                  </td>
                  <td class="px-4 py-2"><span id="flexotraccionCambiarSeccion">Cambiar
                      sección</span></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2">Usar</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2">-</td>
                  <td class="px-4 py-2"><span id="flexotraccionUsar">4x15.74</span> pulg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="fixed bottom-6 end-6">
    <button
      class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      data-drawer-target="drawer-disabled-backdrop" data-drawer-body-scrolling="true"
      data-drawer-show="drawer-disabled-backdrop" data-drawer-backdrop="false" type="button"
      aria-controls="drawer-disabled-backdrop">
      <svg class="h-5 w-5 transition-transform hover:rotate-45" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
        fill="none" viewBox="0 0 18 18">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 1v16M1 9h16" />
      </svg>
      <span class="sr-only">Open actions menu</span>
    </button>
  </div>
  <!-- drawer component -->
  <div
    class="w-2xl fixed left-0 top-0 z-40 h-screen -translate-x-full overflow-y-auto bg-white p-4 transition-transform dark:bg-gray-800"
    id="drawer-disabled-backdrop" aria-labelledby="drawer-disabled-backdrop-label" tabindex="-1">
    <h5 class="text-base font-semibold uppercase text-gray-500 dark:text-gray-400"
      id="drawer-disabled-backdrop-label">Datos Generales</h5>
    <button
      class="absolute end-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
      data-drawer-hide="drawer-disabled-backdrop" type="button" aria-controls="drawer-disabled-backdrop">
      <svg class="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 14 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
      </svg>
      <span class="sr-only">Close menu</span>
    </button>
    <div class="overflow-y-auto py-4">
      <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <table class="w-full table-fixed px-6 text-gray-800 dark:text-white">
          <thead class="bg-white dark:bg-gray-800">
            <tr class="text-center">
              <th class="py-2">Nombre</th>
              <th class="py-2">Simb.</th>
              <th class="py-2">Entrada</th>
              <th class="py-2">Unidad <br> Medida</th>
            </tr>
          </thead>
          <tbody class="text-center">
            <tr class="bg-white dark:bg-gray-800">
              <td class="py-2">Grupo</td>
              <td class="py-2"></td>
              <td class="py-2"><select
                  class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  id="grupo" name="grupo">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C" selected>C</option>
                </select></td>
              <td class="py-2"></td>
            </tr>
            <tr class="bg-white dark:bg-gray-800">
              <td class="py-2">Modulo de elasticidad minimo</td>
              <td class="py-2">Emin</td>
              <td class="py-2"><input
                  class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  id="diseñoEmin" name="diseñoEmin" type="number" value="95000.0" step="any" min="0"
                  required></td>
              <td class="py-2">Kg/cm2</td>
            </tr>
            <tr class="bg-white dark:bg-gray-800">
              <td class="py-2">Esfuerzo admisible a la flexión</td>
              <td class="py-2">fm</td>
              <td class="py-2"><input
                  class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  id="diseñoFm" name="diseñoFm" type="number" value="210.0" step="any" min="0"
                  required></td>
              <td class="py-2">Kg/cm2</td>
            </tr>
            <tr class="bg-white dark:bg-gray-800">
              <td class="py-2">Esfuerzo admisible ala compresion paralela</td>
              <td class="py-2">fc</td>
              <td class="py-2"><input
                  class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  id="diseñoFc" name="diseñoFc" type="number" value="145.0" step="any" min="0"
                  required></td>
              <td class="py-2">Kg/cm2</td>
            </tr>
            <tr class="bg-white dark:bg-gray-800">
              <td class="py-2">Esfuerzo admisible a la Traccion paralela</td>
              <td class="py-2">ft</td>
              <td class="py-2"><input
                  class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  id="diseñoFt" name="diseñoFt" type="number" value="145.0" step="any" min="0"
                  required></td>
              <td class="py-2">Kg/cm2</td>
            </tr>
            <tr class="bg-white dark:bg-gray-800">
              <td class="py-2">Esfuerzo admisible al corte parealela</td>
              <td class="py-2">fv</td>
              <td class="py-2"><input
                  class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  id="diseñoFv" name="diseñoFv" type="number" value="15.0" step="any" min="0"
                  required></td>
              <td class="py-2">Kg/cm2</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</x-calc-layout>
