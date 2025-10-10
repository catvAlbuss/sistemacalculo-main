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

                                </thead>
                                <tbody class="text-center">
                                    <tr>
                                        <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4"
                                            scope="col">Estribo en elementos de borde
                                        </th>
                                    </tr>




                                    <tr class="text-center">
                                        <th class="px-4 py-2">Nombre</th>
                                        <th class="px-4 py-2">Simb.</th>
                                        <th class="px-4 py-2">Entrada</th>
                                        <th class="px-4 py-2">Unidad <br> Medida</th>
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
                                                id="Peralte" name="Peralte" type="number" value="80"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">cm</th>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Base</th>
                                        <th class="px-4 py-2">b</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Base" name="Base" type="number" value="40"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">cm</th>
                                    </tr>
                                    <!-- fin -->




                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Resistencia a compresion </th>
                                        <th class="px-4 py-2">fc</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="fc" name="fc" type="number" value="210"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">Kg/cm2</th>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Fluencia del acero</th>
                                        <th class="px-4 py-2">fy</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="fy" name="fy" type="number" value="4200"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">Kg/cm2</th>
                                    </tr>
                                    <!-- fin -->

                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Diametro de estribo</th>
                                        <th class="px-4 py-2">db</th>
                                        <th class="px-4 py-2 text-right">
                                            <select
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="db" name="db">
                                                <option value=".71">3/8"</option>
                                                <option value="1.27">1/2"</option>
                                                <option value="1.99">5/8"</option>
                                                <option value="2.54">3/4"</option>
                                                <option value="5.01">1"</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"></th>
                                    </tr>



                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Diametro minimo de la columna</th>
                                        <th class="px-4 py-2">db1</th>
                                        <th class="px-4 py-2 text-right">
                                            <select
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="db1" name="db1">
                                                <option value=".95">3/8"</option>
                                                <option value="1.27">1/2"</option>
                                                <option value="1.59">5/8"</option>
                                                <option value="1.91">3/4"</option>
                                                <option value="2.54">1"</option>
                                            </select>
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"></th>
                                    </tr>
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
                                        <th class="px-4 py-2 text-left text-xl" colspan="4">Refuerzo transversal en
                                            elementos de borde</th>

                                    </tr>
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xm font-normal" colspan="6">Para el
                                            calculo del area transversal de estribos se usa la normativa vigente</th>
                                    </tr>

                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="px-8 py-2 text-xl" scope="col">Condicion</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Separacion</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Ash</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Numero de capas</th>

                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Paralelo a la BASE</td>
                                        <!-- formula -->
                                        <td class="px-4 py-2 text-center"><span id="v1">0</span> cm</td>
                                        <td class="px-4 py-2 text-center"><span id="v2">0</span> cm2</td>
                                        <td class="px-4 py-2 text-center"><span id="v4">0</span> ramas</td>


                                    </tr>
                                    <!-- fin -->
                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Paralelo a la ALTURA</td>
                                        <!-- formula -->
                                        <td class="px-4 py-2 text-center"><span id="v11">0</span> cm</td>
                                        <td class="px-4 py-2 text-center"><span id="v3">0</span> cm2</td>
                                        <td class="px-4 py-2 text-center"><span id="v5">0</span> ramas</td>

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
                const val3 = parseFloat(document.getElementById('fc').value);
                const val4 = parseFloat(document.getElementById('fy').value);
                const val6 = parseFloat(document.getElementById('Peralte').value);
                const val7 = parseFloat(document.getElementById('Base').value);
                const val8 = parseFloat(document.getElementById('db').value);
                const val9 = parseFloat(document.getElementById('db1').value);
                // calculos;
                const s = Math.min(Math.min(val6, val7) / 4, 8 * val9, 20);
                const Ag = val6 * val7;
                const Ach = (val6 - 8) * (val7 - 8);

                const Ash1 = Math.max(0.3 * s * (val6 - 8) * ((Ag / Ach) - 1) * val3 / val4, 0.09 * s * (
                    val6 - 8) * val3 / val4).toFixed(2);
                const Ash2 = Math.max(0.3 * s * (val7 - 8) * ((Ag / Ach) - 1) * val3 / val4, 0.09 * s * (
                    val7 - 8) * val3 / val4).toFixed(2);


                const r1 = Ash1 / val8;
                const r2 = Ash2 / val8;

                document.getElementById("v1").innerHTML = s.toFixed(2);
                document.getElementById("v11").innerHTML = s.toFixed(2);
                document.getElementById("v2").innerHTML = Ash1;
                document.getElementById("v3").innerHTML = Ash2;
                document.getElementById("v4").innerHTML = Math.ceil(r1);
                document.getElementById("v5").innerHTML = Math.ceil(r2);

            })

        })


        ///////////////detalles
        //enteros = +-1
        //float = +-0.01,
        //string = letras
    </script>
</x-app-layout>
