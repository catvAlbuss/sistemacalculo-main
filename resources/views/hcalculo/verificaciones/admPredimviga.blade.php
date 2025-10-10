<x-app-layout>
    <x-header title="Diseño de Metrados"></x-header>
    <x-mathjax-loader></x-mathjax-loader>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
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
                                        <th class="px-4 py-2">Base minima</th>
                                        <th class="px-4 py-2">bmin</th>
                                        <th class="px-4 py-2 text-rigth">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="b" name="b" type="number" value="0.30"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left text-xm font-normal">m</th>
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
                                        <th class="px-4 py-2 text-left text-xl" colspan="4">PREDIMENSIONAMIENTO DE
                                            VIGAS</th>

                                    </tr>
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xm font-normal" colspan="6">El
                                            predimensionamiento de vigas esta acorde a la normativa E.060 Art.9.6.2.1.
                                            para alturas, EN 1992-1-1. para bases</th>
                                    </tr>

                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="px-8 py-2 text-xl" scope="col">Condicion</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Fórmula</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Altura de viga</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Base de viga</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Area de acero minima</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                                    <!-- copiar -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Viga principal</td>
                                        <td class="px-4 py-2">h=L/10</td> <!-- formula -->
                                        <td class="px-4 py-2 text-center"><span id="vigaPR1">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR01">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR11">0</span>cm2</td>
                                    </tr>
                                    <!-- fin -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Viga Principal</td>
                                        <td class="px-4 py-2">h=L/11</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR2">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR02">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR12">0</span>cm2</td>

                                    </tr>
                                    <tr class="bg-gray-200 dark:bg-gray-800">
                                        <td class="px-8 py-2 font-semibold">Viga Principal</td>
                                        <td class="px-4 py-2 font-semibold text-xL">h=L/12</td>
                                        <td class="px-4 py-2 text-center font-semibold"><span id="vigaPR3">0</span>m
                                        </td>
                                        <td class="px-4 py-2 text-center font-semibold"><span id="vigaPR03">0</span>m
                                        </td>
                                        <td class="px-4 py-2 text-center font-semibold"><span id="vigaPR13">0</span>cm2
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Viga Secundaria</td>
                                        <td class="px-4 py-2">h=L/14</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR4">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR04">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR14">0</span>cm2</td>
                                    </tr>
                                    <tr class="bg-gray-200 dark:bg-gray-800">
                                        <td class="px-8 py-2 font-semibold">Viga Secundaria</td>
                                        <td class="px-4 py-2 font-semibold text-xL">h=L/15</td>
                                        <td class="px-4 py-2 text-center font-semibold"><span id="vigaPR5">0</span>m
                                        </td>
                                        <td class="px-4 py-2 text-center font-semibold"><span id="vigaPR05">0</span>m
                                        </td>
                                        <td class="px-4 py-2 text-center font-semibold"><span
                                                id="vigaPR15">0</span>cm2</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Simplemente apoyado</td>
                                        <td class="px-4 py-2">h=L/16</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR6">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR06">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR16">0</span>cm2</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Un extremo continuo</td>
                                        <td class="px-4 py-2">h=L/18.5</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR7">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR07">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR17">0</span>cm2</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Ambos extremos continuos</td>
                                        <td class="px-4 py-2">h=L/21</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR8">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR08">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR18">0</span>cm2</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">En voladadizo</td>
                                        <td class="px-4 py-2">h=L/8</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR9">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR09">0</span>m</td>
                                        <td class="px-4 py-2 text-center"><span id="vigaPR19">0</span>cm2</td>
                                    </tr>



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
                const calc1 = (val1 / 10).toFixed(2);
                const calc2 = (val1 / 11).toFixed(2);
                const calc3 = (val1 / 12).toFixed(2);
                const calc4 = (val1 / 14).toFixed(2);
                const calc5 = (val1 / 15).toFixed(2);
                const calc6 = (val1 / 16).toFixed(2);
                const calc7 = (val1 / 18.5).toFixed(2);
                const calc8 = (val1 / 21).toFixed(2);
                const calc9 = (val1 / 8).toFixed(2);
                //valores de la base
                const b = parseFloat(document.getElementById('b').value);
                const calc01 = Math.max((calc1 * 0.3).toFixed(2), b);
                const calc02 = Math.max((calc2 * 0.3).toFixed(2), b);
                const calc03 = Math.max((calc3 * 0.3).toFixed(2), b);
                const calc04 = Math.max((calc4 * 0.3).toFixed(2), b);
                const calc05 = Math.max((calc5 * 0.3).toFixed(2), b);
                const calc06 = Math.max((calc6 * 0.3).toFixed(2), b);
                const calc07 = Math.max((calc7 * 0.3).toFixed(2), b);
                const calc08 = Math.max((calc8 * 0.3).toFixed(2), b);
                const calc09 = Math.max((calc9 * 0.3).toFixed(2), b);

                //Valores de cuantia minima
                const calc11 = (calc1 * 14 / 4200 * calc01 * 10000).toFixed(2);
                const calc12 = (calc2 * 14 / 4200 * calc02 * 10000).toFixed(2);
                const calc13 = (calc3 * 14 / 4200 * calc03 * 10000).toFixed(2);
                const calc14 = (calc4 * 14 / 4200 * calc04 * 10000).toFixed(2);
                const calc15 = (calc5 * 14 / 4200 * calc05 * 10000).toFixed(2);
                const calc16 = (calc6 * 14 / 4200 * calc06 * 10000).toFixed(2);
                const calc17 = (calc7 * 14 / 4200 * calc07 * 10000).toFixed(2);
                const calc18 = (calc8 * 14 / 4200 * calc08 * 10000).toFixed(2);
                const calc19 = (calc9 * 14 / 4200 * calc09 * 10000).toFixed(2);

                //funcion de calcular entero
                //const valentero = parseInt(document.getElementById('vigasAncho').value)
                //const calculadoval2 = valentero * calc;

                document.getElementById("vigaPR1").innerHTML = calc1;
                document.getElementById("vigaPR2").innerHTML = calc2;
                document.getElementById("vigaPR3").innerHTML = calc3;
                document.getElementById("vigaPR4").innerHTML = calc4;
                document.getElementById("vigaPR5").innerHTML = calc5;
                document.getElementById("vigaPR6").innerHTML = calc6;
                document.getElementById("vigaPR7").innerHTML = calc7;
                document.getElementById("vigaPR8").innerHTML = calc8;
                document.getElementById("vigaPR9").innerHTML = calc9;

                document.getElementById("vigaPR01").innerHTML = calc01;
                document.getElementById("vigaPR02").innerHTML = calc02;
                document.getElementById("vigaPR03").innerHTML = calc03;
                document.getElementById("vigaPR04").innerHTML = calc04;
                document.getElementById("vigaPR05").innerHTML = calc05;
                document.getElementById("vigaPR06").innerHTML = calc06;
                document.getElementById("vigaPR07").innerHTML = calc07;
                document.getElementById("vigaPR08").innerHTML = calc08;
                document.getElementById("vigaPR09").innerHTML = calc09;

                document.getElementById("vigaPR11").innerHTML = calc11;
                document.getElementById("vigaPR12").innerHTML = calc12;
                document.getElementById("vigaPR13").innerHTML = calc13;
                document.getElementById("vigaPR14").innerHTML = calc14;
                document.getElementById("vigaPR15").innerHTML = calc15;
                document.getElementById("vigaPR16").innerHTML = calc16;
                document.getElementById("vigaPR17").innerHTML = calc17;
                document.getElementById("vigaPR18").innerHTML = calc18;
                document.getElementById("vigaPR19").innerHTML = calc19;




            })

        })


        ///////////////detalles
        //enteros = +-1
        //float = +-0.01,
        //string = letras
    </script>
</x-app-layout>
