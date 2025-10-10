<x-app-layout>
    <x-header title="Diseño de Metrados"></x-header>
    <x-mathjax-loader></x-mathjax-loader>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
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
                                        <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4"
                                            scope="col">VIGAS
                                        </th>
                                    </tr>
                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Luz</th>
                                        <th class="px-4 py-2">L</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Luz" name="Luz" type="number" value="5.0"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">m</th>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Peralte</th>
                                        <th class="px-4 py-2">h</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Peralte" name="Peralte" type="number" value="0.50"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">m</th>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Base</th>
                                        <th class="px-4 py-2">b</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Base" name="Base" type="number" value="0.30"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">m</th>
                                    </tr>
                                    <!-- fin -->




                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Ancho tributario</th>
                                        <th class="px-4 py-2">Atrib</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Atrib" name="Atrib" type="number" value="1"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">m</th>
                                    </tr>
                                    <!-- fin -->



                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Espesor de losa</th>
                                        <th class="px-4 py-2">t</th>
                                        <th class="px-4 py-2 text-right">
                                            <select
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="losa" name="losa">
                                                <option value=".200">0.17</option>
                                                <option value=".250">0.20</option>
                                                <option value=".300">0.25</option>
                                                <option value=".350">0.30</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">m</th>
                                    </tr>


                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Carga Viva</th>
                                        <th class="px-4 py-2">Cv</th>
                                        <th class="px-4 py-2 text-right">
                                            <select
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="categoria" name="categoria">
                                                <option value=".400">Categoria A</option>
                                                <option value=".300">Categoria B</option>
                                                <option value=".200">Categoria C</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"></th>
                                    </tr>
                                    <!-- <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Tipo de Material</th>
                                        <th class="px-4 py-2">Material</th>
                                        <th class="px-4 py-2 text-right">
                                            <input type="checkbox" id="val1" name="val1" value="true">
                                            <input type="checkbox" id="val2" name="val2" value="false">
                                            <input type="checkbox" id="val3" name="val3" value="true">
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">m</th>
                                    </tr> -->




                                    <tr>
                                        <th><button id="calcular"
                                                class="bg-blue-600 hover:bg-blue-500 border-2xl border-blue-800 py-2 px-2 text-xm mt-2">Calcular</button>
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
                            <table class="min-w-full text-gray-800 dark:text-white text-xm" id="resultados">
                                <!-- vigas -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="px-4 py-2 text-left text-xl" colspan="4">Refuerzo en vigas</th>

                                    </tr>
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xm font-normal" colspan="6">Para el
                                            calculo de las vigas asemejamos una viga hipersestatica e isostatica y
                                            calculamos
                                            el area de refuerzo de acero con el metodo cuadratico, el ratio debe de
                                            estar entre 100-300kg/m3</th>
                                    </tr>

                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="px-8 py-2 text-xl" scope="col">Condicion</th>

                                        <th class="px-4 py-2 text-xl" scope="col">Momento maximo</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Area de acero</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Cortante ultimo</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Area de acero</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Ratio</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Simplemente apoyado Mu=wL2/8</td>
                                        <!-- formula -->
                                        <td class="px-4 py-2 text-center"><span id="vigaPR1">0</span>Tn-m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR3">0</span>cm2</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR5">0</span>Tn</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR9">0</span>cm2/cm</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR7">0</span>Kg/m3</td>

                                    </tr>
                                    <!-- fin -->
                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Empotrado perfecto Mu=wL2/12</td>
                                        <!-- formula -->
                                        <td class="px-4 py-2 text-center"><span id="vigaPR2">0</span>Tn-m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR4">0</span>cm2</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR6">0</span>Tn</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR10">0</span>cm2/cm</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR8">0</span>Kg/m3</td>
                                    </tr>
                                    <!-- fin -->





                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <script src="http://code.jquery.com/jquery-3.6.0.min.js"></script>i
    <script>
        $(document).ready(function() {

            $(document).on("click", "#calcular", function() {
                //Valores de predimensionamiento
                const val1 = parseFloat(document.getElementById('Luz').value);
                // const val2 = parseFloat(document.getElementById('Pm2').value);
                const val3 = parseFloat(document.getElementById('Atrib').value);
                const val4 = parseFloat(document.getElementById('losa').value);
                const val5 = parseFloat(document.getElementById('categoria').value);
                const val6 = parseFloat(document.getElementById('Peralte').value);
                const val7 = parseFloat(document.getElementById('Base').value);

                // const calc1 = (val2 * val3).toFixed(2);
                const calc2 = (((val4 + .15) * 1.4 + 1.7 * val5) * val3 + 1.4 * val6 * val7).toFixed(2);
                const calc3 = (((val4 + .15) * 1.25 + 1.25 * val5) * val3 + 1.25 * val6 * val7).toFixed(2);



                //Valores momentos
                const calc13 = (calc2 * val1 * val1 / 8).toFixed(2);
                const calc14 = (calc2 * val1 * val1 / 12).toFixed(2);

                //valores de cortantes
                const calc15 = (calc3 * val1 * 0.5 + calc13 * 2 / val1).toFixed(2);
                const calc16 = (calc3 * val1 * 0.5 + calc14 * 2 / val1).toFixed(2);

                //diseño por cortante
                const calc17 = ((calc15 * 1000 / 0.85) - 0.53 * (Math.sqrt(210)) * val7 * (val6 - 0.06) *
                    10000).toFixed(2);
                const calc18 = Math.max((calc17 / (4200 * (val6 - 0.06) * 100)), 0.142);

                const calc19 = ((calc16 * 1000 / 0.85) - 0.53 * (Math.sqrt(210)) * val7 * (val6 - 0.06) *
                    10000).toFixed(2);
                const calc20 = Math.max((calc19 / (4200 * (val6 - 0.06) * 100)), 0.142);

                //valores de acero

                const Asmin = 14 / 4200 * val7 * val6 * 10000
                const a1 = 1 - (2 * calc13 * 100000) / (0.9 * val7 * 100 * (val6 - .06) * (val6 - .06) *
                    10000 * 210);
                const As1 = Math.max(((val7 * 100 * (val6 - 0.06) * 100 * 210 / 4200) * (1 - Math.sqrt(
                    a1))), Asmin).toFixed(2);

                const a2 = 1 - (2 * calc14 * 100000) / (0.9 * val7 * 100 * (val6 - .06) * (val6 - .06) *
                    10000 * 210);
                const As2 = Math.max(((val7 * 100 * (val6 - 0.06) * 100 * 210 / 4200) * (1 - Math.sqrt(
                    a2))), Asmin).toFixed(2);

                //ratio
                const calc21 = ((2 * As1 + calc18) * 7850 / (val6 * val7 * 10000)).toFixed(0);
                const calc22 = ((2 * As2 + calc20) * 7850 / (val6 * val7 * 10000)).toFixed(0);


                document.getElementById("vigaPR1").innerHTML = calc13;
                document.getElementById("vigaPR2").innerHTML = calc14;
                document.getElementById("vigaPR3").innerHTML = As1;
                document.getElementById("vigaPR4").innerHTML = As2;
                document.getElementById("vigaPR5").innerHTML = calc15;
                document.getElementById("vigaPR6").innerHTML = calc16;
                document.getElementById("vigaPR7").innerHTML = calc21;
                document.getElementById("vigaPR8").innerHTML = calc22;
                document.getElementById("vigaPR9").innerHTML = calc18.toFixed(2);
                document.getElementById("vigaPR10").innerHTML = calc20.toFixed(2);
            })

        })


        ///////////////detalles
        //enteros = +-1
        //float = +-0.01,
        //string = letras
    </script>
</x-app-layout>
