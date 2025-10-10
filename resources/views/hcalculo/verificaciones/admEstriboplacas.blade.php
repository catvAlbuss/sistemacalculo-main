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
                                            scope="col">Estribo en Placas
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
                                        <th class="px-4 py-2">Cortante ultimo</th>
                                        <th class="px-4 py-2">Vu</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Vu" name="Vu" type="number" value="145"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"> Tn</th>
                                    </tr>
                                    <!-- fin -->


                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Altura del muro</th>
                                        <th class="px-4 py-2">Hm</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Hm" name="Hm" type="number" value="23.1"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal"> m</th>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Longitud de muro</th>
                                        <th class="px-4 py-2">Lm</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="Lm" name="Lm" type="number" value="350"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">cm</th>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Espesor</th>
                                        <th class="px-4 py-2">t</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="t" name="t" type="number" value="25"
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
                                            alma</th>

                                    </tr>
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xm font-normal" colspan="6">Para el
                                            calculo del area transversal de estribos se usa la normativa vigente</th>
                                    </tr>

                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="px-8 py-2 text-xl" scope="col">Nombre</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Simbolo</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Formula</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Resultado</th>

                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Cortante maximo</td>
                                        <td class="px-4 py-2 text-center">Vnmax</td>
                                        <td class="px-4 py-2 text-center">2.6*fc^2*Lm*t</td>
                                        <td class="px-4 py-2 text-center"><span id="v1">0</span> Tn</td>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Aporte de concreto</td>
                                        <td class="px-4 py-2 text-center">Vc</td>
                                        <td class="px-4 py-2 text-center">0.53*fc^2*Lm*t</td>
                                        <td class="px-4 py-2 text-center"><span id="v2">0</span> Tn</td>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Aporte de acero</td>
                                        <td class="px-4 py-2 text-center">Vs</td>
                                        <td class="px-4 py-2 text-center">Vu/fi-Vc</td>
                                        <td class="px-4 py-2 text-center"><span id="v3">0</span> Tn</td>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Cuantia horizontal</td>
                                        <td class="px-4 py-2 text-center">ph</td>
                                        <td class="px-4 py-2 text-center">Vs/Acw*fy</td>
                                        <td class="px-4 py-2 text-center"><span id="v4">0</span> </td>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Area de estribo</td>
                                        <td class="px-4 py-2 text-center">Ash</td>
                                        <td class="px-4 py-2 text-center">ph*t*1m</td>
                                        <td class="px-4 py-2 text-center"><span id="v5">0</span> cm2</td>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Separacion del estribo</td>
                                        <td class="px-4 py-2 text-center">s</td>
                                        <td class="px-4 py-2 text-center">Av/Ash</td>
                                        <td class="px-4 py-2 text-center"><span id="v6">0</span> cm </td>
                                    </tr>
                                    <!-- fin -->

                                </tbody>

                            </table>






                            <table class="min-w-full text-gray-800 dark:text-white text-xm" id="resultados">
                                <!-- vigas -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="px-4 py-2 text-left text-xl" colspan="4">Refuerzo vertical en
                                            alma</th>

                                    </tr>
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xm font-normal" colspan="6">Para el
                                            calculo del area transversal de estribos se usa la normativa vigente</th>
                                    </tr>

                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="px-8 py-2 text-xl" scope="col">Nombre</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Simbolo</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Formula</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Resultado</th>

                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Cuantia vertical</td>
                                        <td class="px-4 py-2 text-center">pv</td>
                                        <td class="px-4 py-2 text-center">0.0025+0.5(2.5-Hm/Lm)(ph-0.0025)</td>
                                        <td class="px-4 py-2 text-center"><span id="v7">0</span> </td>
                                    </tr>
                                    <!-- fin -->

                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Area de estribo</td>
                                        <td class="px-4 py-2 text-center">Asv</td>
                                        <td class="px-4 py-2 text-center">pv*t*1m</td>
                                        <td class="px-4 py-2 text-center"><span id="v8">0</span> cm2</td>
                                    </tr>
                                    <!-- fin -->


                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Separacion del estribo</td>
                                        <td class="px-4 py-2 text-center">s</td>
                                        <td class="px-4 py-2 text-center">Av/Asv</td>
                                        <td class="px-4 py-2 text-center"><span id="v9">0</span> cm </td>
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
                const val1 = parseFloat(document.getElementById('Hm').value);
                const val2 = parseFloat(document.getElementById('Vu').value);
                const val3 = parseFloat(document.getElementById('fc').value);
                const val4 = parseFloat(document.getElementById('fy').value);
                const val6 = parseFloat(document.getElementById('Lm').value);
                const val7 = parseFloat(document.getElementById('t').value);
                const val8 = parseFloat(document.getElementById('db').value);
                const val9 = parseFloat(document.getElementById('db1').value);
                // calculos;
                const Vnmax = 26 * Math.sqrt(val3) * val6 * val7 / 10000;
                const Vc = 5.3 * Math.sqrt(val3) * val6 * val7 / 10000;
                const Vs = val2 / 0.85 - Vc;

                const ph = Math.max(Vs / (val6 * val7 * val4 / 1000), 0.0025)
                const Ash = ph * 100 * val7;
                const sh = 2 * val8 / Ash;

                // calculos;
                const pv = Math.max(0.0025 + (0.5 * (2.5 - val1 / (val6) / 100) * (ph - 0.0025)), 0.0025)
                const Asv = pv * 100 * val7;
                const sv = 2 * val9 / Asv;

                document.getElementById("v1").innerHTML = Vnmax.toFixed(2);
                document.getElementById("v2").innerHTML = Vc.toFixed(2);
                document.getElementById("v3").innerHTML = Vs.toFixed(2);
                document.getElementById("v4").innerHTML = ph.toFixed(4);
                document.getElementById("v5").innerHTML = Ash.toFixed(2);
                document.getElementById("v6").innerHTML = sh.toFixed(2);

                document.getElementById("v7").innerHTML = pv.toFixed(4);
                document.getElementById("v8").innerHTML = Asv.toFixed(2);
                document.getElementById("v9").innerHTML = sv.toFixed(2);

            })

        })


        ///////////////detalles
        //enteros = +-1
        //float = +-0.01,
        //string = letras
    </script>
</x-app-layout>
