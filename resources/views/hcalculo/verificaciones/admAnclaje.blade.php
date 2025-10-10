<x-app-layout>
    <x-header title="Diseño de Metrados"></x-header>
    <div class="py-2">
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
                                            scope="col">ANCLAJE
                                        </th>
                                    </tr>
                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Fluencia del acero</th>
                                        <th class="px-4 py-2">Fy</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Fy" name="Fy" type="number" value="4200"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">kg/cm2</th>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Resistencia a compresion</th>
                                        <th class="px-4 py-2">fc</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="fc" name="fc" type="number" value="210"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">kg/cm2</th>
                                    </tr>
                                    <!-- fin -->




                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Diametro de acero</th>
                                        <th class="px-4 py-2">db</th>
                                        <th class="px-4 py-2 text-right">
                                            <select
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="db" name="db">
                                                <option value="0.95">3/8"</option>
                                                <option value="1.27">1/2"</option>
                                                <option value="1.59">5/8"</option>
                                                <option value="1.91">3/4"</option>
                                                <option value="2.54">1"</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"></th>
                                    </tr>


                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Ubicacion</th>
                                        <th class="px-4 py-2">Yt</th>
                                        <th class="px-4 py-2 text-right">
                                            <select
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Yt" name="Yt">
                                                <option value="1.3">Barras superiores</option>
                                                <option value="1">Otras barras</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"></th>
                                    </tr>

                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Epoxico</th>
                                        <th class="px-4 py-2">Ye</th>
                                        <th class="px-4 py-2 text-right">
                                            <select
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Ye" name="Ye">
                                                <option value="1.5">Barras o alambres con recubrimiento
                                                    epóxico o zinc y barras con
                                                    recubrimiento dual de zinc con
                                                    recubrimiento menor de 3 db o
                                                    espaciamiento libre menor que 6 db</option>
                                                <option value="1.2">Refuerzo con recubrimiento epóxico o
                                                    zinc y barras con recubrimiento dual de
                                                    zinc y epóxico para todas las otras
                                                    condiciones</option>
                                                <option value="1">Sin tratamiento</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"></th>
                                    </tr>

                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Tamaño</th>
                                        <th class="px-4 py-2">Ys</th>
                                        <th class="px-4 py-2 text-right">
                                            <select
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Ys" name="Ys">
                                                <option value="0.8">Barras de 3/4” y menores</option>
                                                <option value="1">Barras mayores de 3/4”</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"></th>
                                    </tr>

                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Peso del concreto</th>
                                        <th class="px-4 py-2">Pconc</th>
                                        <th class="px-4 py-2 text-right">
                                            <select
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Pconc" name="Pconc">
                                                <option value="1.3">Concreto de peso liviano</option>
                                                <option value="1">Concreto de peso normal</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"></th>
                                    </tr>

                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Grado del refuerzo</th>
                                        <th class="px-4 py-2">Yg</th>
                                        <th class="px-4 py-2 text-right">
                                            <select
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Yg" name="Yg">
                                                <option value="1">Grado 280 ó 420</option>
                                                <option value="1.15">Grado 550</option>
                                                <option value="1.3">Grado 690</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"></th>
                                    </tr>

                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Refuerzo de confinamiento</th>
                                        <th class="px-4 py-2">Yr</th>
                                        <th class="px-4 py-2 text-right">
                                            <select
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Yr" name="Yr">
                                                <option value=".75">Refuerzo encerrado dentro de estribos</option>
                                                <option value="1">otra</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"></th>
                                    </tr>

                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Acero requerido</th>
                                        <th class="px-4 py-2">Asreq</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Asreq" name="Asreq" type="number" value="1"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">cm2</th>
                                    </tr>
                                    <!-- fin -->
                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Acero propuesto</th>
                                        <th class="px-4 py-2">Asprop</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Asprop" name="Asprop" type="number" value="1"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">cm2</th>
                                    </tr>
                                    <!-- fin -->

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
                                        <th class="px-4 py-2 text-left text-xl" colspan="4">Longitud de anclajes
                                        </th>

                                    </tr>
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xm font-normal" colspan="6">La longitid
                                            de
                                            anclaje se calculo con la normativa E.050 cap 15</th>
                                    </tr>

                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="px-8 py-2 text-xl" scope="col">Nombre</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Formula</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Longitud de anclaje</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Longitud reducida</th>

                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Anclaje a traccion</td>
                                        <!-- formula -->
                                        <td class="px-4 py-2 text-center">FyYeYsYtPconcrdb/3.5fc^.5</td>
                                        <td class="px-4 py-2 text-center"><span id="long1">0</span>cm</td>
                                        <td class="px-4 py-2 text-center"><span id="long2">0</span>cm</td>


                                    </tr>
                                    <!-- fin -->
                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Anclaje a compresion</td>
                                        <!-- formula -->
                                        <td class="px-4 py-2 text-center">0.0044Fydb</td>
                                        <td class="px-4 py-2 text-center"><span id="long3">0</span>cm</td>
                                        <td class="px-4 py-2 text-center"><span id="long4">0</span>cm</td>

                                    </tr>
                                    <!-- fin -->

                                    <!-- vigas -->
                                    <thead class="bg-gray-200 dark:bg-gray-800">
                                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                            <th class="px-4 py-2 text-left text-xl" colspan="4">Longitud de
                                                anclajes
                                            </th>

                                        </tr>
                                        <tr>
                                            <th class="px-4 py-2 text-left text-xm font-normal" colspan="6">La
                                                longitid
                                                de anclaje se calculo con la normativa ACI 318-19 CAP 25</th>
                                        </tr>

                                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                            <th class="px-8 py-2 text-xl" scope="col">Nombre</th>
                                            <th class="px-4 py-2 text-xl" scope="col">Formula</th>
                                            <th class="px-4 py-2 text-xl" scope="col">Longitud de anclaje</th>
                                            <th class="px-4 py-2 text-xl" scope="col">Longitud reducida</th>

                                        </tr>
                                    </thead>
                                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Anclaje a traccion</td>
                                        <!-- formula -->
                                        <td class="px-4 py-2 text-center">FyYeYsYtPconcrdb/3.5fc^.5</td>
                                        <td class="px-4 py-2 text-center"><span id="long5">0</span>cm</td>
                                        <td class="px-4 py-2 text-center"><span id="long6">0</span>cm</td>


                                    </tr>
                                    <!-- fin -->
                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Anclaje a compresion</td>
                                        <!-- formula -->
                                        <td class="px-4 py-2 text-center">0.0044Fydb</td>
                                        <td class="px-4 py-2 text-center"><span id="long7">0</span>cm</td>
                                        <td class="px-4 py-2 text-center"><span id="long8">0</span>cm</td>

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
    <script type="module" src="main.js"></script>
    <script>
        $(document).ready(function() {

            $(document).on("click", "#calcular", function() {
                //Valores de predimensionamiento
                const Fy = parseFloat(document.getElementById('Fy').value);
                // const val2 = parseFloat(document.getElementById('Pm2').value);
                const fc = parseFloat(document.getElementById('fc').value);
                const Yt = parseFloat(document.getElementById('Yt').value);
                const Ys = parseFloat(document.getElementById('Ys').value);
                const Ye = parseFloat(document.getElementById('Ye').value);
                const Yg = parseFloat(document.getElementById('Yg').value);
                const Yr = parseFloat(document.getElementById('Yr').value);
                const db = parseFloat(document.getElementById('db').value);
                const Pconc = parseFloat(document.getElementById('Pconc').value);
                const Asreq = parseFloat(document.getElementById('Asreq').value);
                const Asprop = parseFloat(document.getElementById('Asprop').value);

                // traccion e060;
                const calc2 = Math.max((Fy * Yt * Ys * Ye * Pconc * db / (3.5 * 2.5 * Math.sqrt(fc))), 30);
                const calc3 = Math.max(calc2 * Asreq / Asprop, 30);

                // compresione060;
                const calc4 = Math.max((0.075 * Fy * db / (Math.sqrt(fc))), 0.0044 * Fy * db, 20);
                const calc5 = Math.max(calc4 * Asreq / Asprop, 20);

                // traccion aci318-19;
                const calc6 = Math.max((Fy * Yt * Ys * Ye * Pconc * Yg * db / (3.5 * 2.5 * Math.sqrt(fc))),
                    30);
                const calc7 = Math.max(calc6 * Asreq / Asprop, 30);

                // compresion aci318-19;
                const calc8 = Math.max((0.075 * Yr * Fy * db / (Math.sqrt(fc))), 0.0044 * Yr * Fy * db, 20);
                const calc9 = Math.max(calc8 * Asreq / Asprop, 20);



                document.getElementById("long1").innerHTML = calc2.toFixed(2);
                document.getElementById("long2").innerHTML = calc3.toFixed(2);
                document.getElementById("long3").innerHTML = calc4.toFixed(2);
                document.getElementById("long4").innerHTML = calc5.toFixed(2);


                document.getElementById("long5").innerHTML = calc6.toFixed(2);
                document.getElementById("long6").innerHTML = calc7.toFixed(2);
                document.getElementById("long7").innerHTML = calc8.toFixed(2);
                document.getElementById("long8").innerHTML = calc9.toFixed(2);

            })

        })
    </script>
</x-app-layout>
