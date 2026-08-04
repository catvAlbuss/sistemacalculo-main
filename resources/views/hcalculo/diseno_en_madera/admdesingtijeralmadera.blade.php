<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Diseño De Tijeral De Maderas') }}
        </h2>
    </x-slot>
    <script>
        MathJax = {
            loader: {
                load: ['input/asciimath', 'output/chtml']
            }
        }
    </script>
    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <!-- Formulario -->
                <div class="w-full md:w-1/3">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Datos Generales</h3>
                        <div class="overflow-auto">
                            <table class="table-fixed w-full text-gray-800 dark:text-white px-6">
                                <thead class="bg-white dark:bg-gray-800">
                                    <tr class="text-center">
                                        <th class="py-2 px-4">Nombre</th>
                                        <th class="py-2 px-4">Simb.</th>
                                        <th class="py-2 px-4">Entrada</th>
                                        <th class="py-2 px-4">Unidad <br> Medida</th>
                                    </tr>
                                </thead>
                                <tbody class="text-center">
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">Grupo</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><select name="grupo" id="grupo"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md">
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C" selected>C</option>
                                            </select></td>
                                        <td class="py-2 px-4"></td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">Modulo de elasticidad minimo</td>
                                        <td class="py-2 px-4">Emin</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="diseñoEmin"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="diseñoEmin" min="0" value="95000.0" required></td>
                                        <td class="py-2 px-4">Kg/cm2</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">Esfuerzo admisible a la flexión</td>
                                        <td class="py-2 px-4">fm</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="diseñoFm"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="diseñoFm" min="0" value="210.0" required></td>
                                        <td class="py-2 px-4">Kg/cm2</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">Esfuerzo admisible ala compresion paralela</td>
                                        <td class="py-2 px-4">fc</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="diseñoFc"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="diseñoFc" min="0" value="145.0" required></td>
                                        <td class="py-2 px-4">Kg/cm2</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">Esfuerzo admisible a la Traccion paralela</td>
                                        <td class="py-2 px-4">ft</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="diseñoFt"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="diseñoFt" min="0" value="145.0" required></td>
                                        <td class="py-2 px-4">Kg/cm2</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">Esfuerzo admisible al corte parealela</td>
                                        <td class="py-2 px-4">fv</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="diseñoFv"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="diseñoFv" min="0" value="15.0" required></td>
                                        <td class="py-2 px-4">Kg/cm2</td>
                                    </tr>
                                    <tr>
                                        <th class="py-2 px-4">
                                            <div class="input-group mb-2">
                                                <button id="calcular"
                                                    class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                                                    type="button">DISEÑAR</button>
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
                <div class="w-full md:w-2/3 px-4 mt-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Resultados</h3>
                        <div class="overflow-x-auto">
                            <table id="resultados" class="min-w-full text-gray-800 dark:text-white">
                                <!-- Flexocompresion -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">1.- Flexocompresion
                                        </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Longitud efectiva</td>
                                        <td class="py-2 px-4">lef</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="diseñoLef"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="diseñoLef" min="0" value="2.175" required> m</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">AXIAL</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="flexocompresionAxial"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexocompresionAxial" min="0" value="5951.81" required> kg
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">MOMENTO</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="flexocompresionMomento"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexocompresionMomento" min="0" value="43.4" required>
                                            kg-m
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Suponiendo una sección</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="flexocompresionSeccion"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexocompresionSeccion" min="0" value="57.0" required>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">b</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexocompresionB">8.0</span> pulg</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">b</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexocompresionBcm">20.32</span> cm</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">d</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexocompresionD">8.0</span> pulg</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">d</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexocompresionDcm">20.32</span> cm</td>
                                    </tr>

                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">A</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="flexocompresionA"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexocompresionA" min="0" value="841.0" required> cm2
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">Ix</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="flexocompresionLx"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexocompresionLx" min="0" value="58940.0" required> cm4
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">Zx</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="flexocompresionZx"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexocompresionZx" min="0" value="4064.0" required> cm3
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Esbeltez</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexocompresionEsbeltez">10.703</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="flexocompresionColumnaTipo">Columna
                                                intermedia</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">Ck</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="flexocompresionCk">18.42</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Columnas cortas</td>
                                        <td class="py-2 px-4">λ &lt; 10</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="flexocompresionColumnasCortas">121945.0</span>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Columnas intermedias</td>
                                        <td class="py-2 px-4">10&lt; λ &lt;Ck</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span
                                                id="flexocompresionColumnasIntermedias">117310.248</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Columnas largas</td>
                                        <td class="py-2 px-4">Ck&lt; λ &lt;50</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span
                                                id="flexocompresionColumnasLargas">229426.924</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Nadm</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexocompresionNadm">117310.24831954179
                                                kg</span>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="flexocompresionOk">ok</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Carga crítica de Euler para pandeo en la dirección en que
                                            se aplican los momentos de flexión</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexocompresionNer">1168193.9685140897</span>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Cuando existen flexión y compresión combinadas, los
                                            momentos flectores se amplifican por acción de cargas axiales</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexocompresionKm">1.0077011773377664</span>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Entonces se Tiene</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span
                                                id="flexocompresionEntonces">0.0558601001557404</span> <span
                                                id="flexocompresionEntoncesOk">ok</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">El espaciamiento entre correas, para garantizar una
                                            esbeltez fuera del plano de la cuerda (λy) igual o menor a la del plano
                                            (λx), será igual a:</td>
                                        <td class="py-2 px-4">lc</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexocompresionLc">217.49999999999997</span>
                                            cm
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Usar</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexocompresionUsar">8x8</span> pulg</td>
                                    </tr>
                                </tbody>

                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">2.- Compresion
                                        </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">AXIAL</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="compresionAxial"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="compresionAxial" min="0" value="5951.81" required> kg</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Longitud efectiva </td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">0.8 * ld</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="compresionLongitudEfectiva"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="compresionLongitudEfectiva" min="0" value="2.175"
                                                required> m</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Suponiendo una sección</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="compresionSeccion"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="compresionSeccion" min="0" value="63.0" required></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">b</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="compresionB">12.0</span> pulg</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">b</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="compresionBcm">30.48</span> cm</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">d</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="compresionD">12.0</span> pulg</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">d</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="compresionDcm">30.48</span> cm</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">A</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="compresionA">841.0</span> cm2</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">Ix</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="compresionLx">58940.1</span> cm4</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">Zx</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="compresionZx">4064.8</span> cm3</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Esbeltez:</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="compresionEsbeltez">7.135826771653543</span>
                                            <span id="compresionEsbeltezColumnaTipo">Columna
                                                corta</span>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">Ck</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="compresionCk">18.42</span> <span
                                                id="compresionCkColumnaTipo">Columna corta</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Columnas cortas</td>
                                        <td class="py-2 px-4">λ &lt; 10</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="compresionColumnasCortas">121945.0</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Columnas intermedias</td>
                                        <td class="py-2 px-4">10&lt; λ &lt;Ck</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span
                                                id="compresionColumnasIntermedias">121029.49349521814</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Columnas largas</td>
                                        <td class="py-2 px-4">Ck&lt; λ &lt;50</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span
                                                id="compresionColumnasLargas">516210.5804800001</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Nadm</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="compresionNadm">121945.0</span> kg</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="compresionNadmOk">ok</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Usar</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="compresionUsar">12x12</span> pulg</td>
                                    </tr>
                                </tbody>

                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">3.- Traccion
                                        </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">AXIAL</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="traccionAxial">1449.0</span> kg</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">N</td>
                                        <td class="py-2 px-4">ft*A</td>
                                        <td class="py-2 px-4"><span id="traccionNFtA">121945.0</span>&gt;<span
                                                id="traccionNFtACompara">1449.0</span> <span
                                                id="traccionNFtAOk">ok</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="traccionNFtAOk">ok</span></td>
                                    </tr>
                                </tbody>
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">4.- Flexotraccion
                                        </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">AXIAL</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="flexotraccionAxial"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexotraccionAxial" min="0" value="1076.87" required> kg
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">MOMENTO</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="flexotraccionMomento"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexotraccionMomento" min="0" value="710.5" required>
                                            kg-m
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Suponiendo una sección</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="flexotraccionSeccion"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexotraccionSeccion" min="0" value="35.0" required>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">b</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="flexotraccionB"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexotraccionB" min="0" value="4.0" required> pulg</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">b</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexotraccionBcm">10.16</span> cm</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">d</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="flexotraccionD"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexotraccionD" min="0" value="4.0" required> pulg</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">d</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexotraccionDcm">39.9796</span> cm</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">A</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexotraccionA">45.0</span> cm2</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">Ix</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexotraccionLx">303.7</span> cm4</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">Zx</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexotraccionZx">67.5</span> cm3</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"><span id="flexotraccionDonde">Donde</span>
                                        </td>
                                        <td class="py-2 px-4"><span id="flexotraccionDonde">-</span>
                                        </td>
                                        <td class="py-2 px-4"><span id="flexotraccionDonde">5.177383226905066</span>
                                            &lt; <input type="number" step="any" name="flexotraccionMayorQue"
                                                class="xlsx-calc form-control w-1/3 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flexotraccionMayorQue" min="0" value="1.0" required>
                                        </td>
                                        <td class="py-2 px-4"><span id="flexotraccionCambiarSeccion">Cambiar
                                                sección</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Usar</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="flexotraccionUsar">4x15.74</span> pulg</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3.0.1/es5/tex-mml-chtml.js"></script>
    <script src="{{ asset('assets/js/adm_desing_tijeral_maderas.js') }}"></script>
    <script src="assets/js/adm_correa.js"></script>

</x-app-layout>
