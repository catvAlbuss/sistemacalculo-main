<x-app-layout>
    <x-header title="Diseño de Voladitos"></x-header>
    <x-mathjax-loader></x-mathjax-loader>
    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <!-- Formulario -->
                <div class="w-full md:w-1/3">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Datos Generales</h3>
                        <div class="overflow-auto">
                            <table class="table-auto w-full text-gray-800 dark:text-white px-6">
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
                                        <td class="py-2 px-4">PESO ESPESIFICO DEL CONCRETO</td>
                                        <td class="py-2 px-4">gc</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="gc"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="gc" min="0" value="2.4" required></td>
                                        <td class="py-2 px-4">Tn/m3</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">PESO ESPESIFICO DEL SUELO</td>
                                        <td class="py-2 px-4">gs</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="gs"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="gs" min="0" value="1.7" required></td>
                                        <td class="py-2 px-4">Tn/m3</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">ANGULO DE FRICCION</td>
                                        <td class="py-2 px-4">Ø</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="fi"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="fi" min="0" value="21.03" required></td>
                                        <td class="py-2 px-4">°</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">COHESION</td>
                                        <td class="py-2 px-4">z</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="z"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="z" min="0" value="0.031" required></td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">ANGULO DEL TALUD</td>
                                        <td class="py-2 px-4">d</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="d"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="d" min="0" value="0.0" required></td>
                                        <td class="py-2 px-4">°</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">S/C</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="sc"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="sc" min="0" value="0.4" required></td>
                                        <td class="py-2 px-4">Tn/m2</td>
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
                        <div class="overflow-x-auto" id="resultados">
                            <table class="min-w-full text-gray-800 dark:text-white">
                                <!-- datos -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">1.- Presion del Suelo
                                        </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-8" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">PESO ESPECIFICO DEL CONCRETO</td>
                                        <td class="py-2 px-4">gc</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="gc"></span> Tn/m3</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">PESO ESPECIFICO DEL SUELO</td>
                                        <td class="py-2 px-4">gs</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="gs"></span> Tn/m3</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">ANGULO DE FRICCION</td>
                                        <td class="py-2 px-4">Ø</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="fi"></span> °</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">ANGULO DE FRICCION</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="firad">0.36704274169440754</span> Rad</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">COHESION</td>
                                        <td class="py-2 px-4">z</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="z"></span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">ANGULO DEL TALUD</td>
                                        <td class="py-2 px-4">d</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="d"></span> °</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">ANGULO DE TALUD</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="drad">0.36704274169440754</span> Rad</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">S/C</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="sc"></span> Tn/m2</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">ALTURA EQUIVALENTE DEL TERRENO</td>
                                        <td class="py-2 px-4">hs</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="hs">0.23529411764705885</span> m</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">COEFICIENTE ACTIVO</td>
                                        <td class="py-2 px-4">Ka</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="ka">0.47182551895910635</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">COEFICIENTE PASIVO</td>
                                        <td class="py-2 px-4">Kp</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="kp">2.119427542211152</span></td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="my-10 min-w-full text-gray-800 dark:text-white">
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="py-2 px-4"></th>
                                        <th class="py-2 px-4">SUELO</th>
                                        <th class="py-2 px-4">S/C</th>
                                        <th class="py-2 px-4">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody class="py-2">
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">H</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="sueloH"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="sueloH" min="0" value="3.5" required></td>
                                        <td class="py-2 px-4"><span id="scH">0.23529411764705885</span></td>
                                        <td class="py-2 px-4"></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">sMAX=</td>
                                        <td class="py-2 px-4"><span id="sueloSMax">2.8073618378066825</span></td>
                                        <td class="py-2 px-4"><span id="scSMax">0.18873020758364253</span></td>
                                        <td class="py-2 px-4"><span id="sMaxTotal">2.996092045390325</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">P=</td>
                                        <td class="py-2 px-4"><span id="sueloP">4.912883216161695</span></td>
                                        <td class="py-2 px-4"><span id="scP">0.6605557265427489</span></td>
                                        <td class="py-2 px-4"><span id="pTotal">5.573438942704444</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Mu</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="muTotal">10.078635421390537</span> tn-m</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Vu</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="vuTotal">8.638830361191888</span> tn</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="min-w-full text-gray-800 dark:text-white">
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-8" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody class="py-2">
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">Fy</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="fy"
                                                class="xlsx-calc form-control w-3/4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="fy" min="0" value="4200.0" required> kg/m2</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">f&apos;c</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="fc"
                                                class="xlsx-calc form-control w-3/4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="fc" min="0" value="280.0" required> kg/m2</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">t</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="t"
                                                class="xlsx-calc form-control w-3/4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="t" min="0" value="25.0" required> cm</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">b</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="b"
                                                class="xlsx-calc form-control w-3/4 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="b" min="0" value="100.0" required> cm</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">Mu</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="Mu">10.078635421390537</span> tm-m</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">Mu</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="Mukgcm">1007863.5421390537</span> kg-cm
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">Vc</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="vc">19.51091181877464</span> tn</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">ØVc</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="fiVc">16.584275045958446</span> tn</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">d</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="dDatos">22.0</span> cm</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">a</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="a">2.254238578756617</span> cm</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4">As</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><span id="as">12.77401861295416</span> cm2</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table class="my-10 min-w-full text-gray-800 dark:text-white">
                                <tbody class="py-2">
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">FI2</td>
                                        <td class="py-2 px-4"><span id="fi2">0.8712218530991723</span></td>
                                        <td></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">DELTA2</td>
                                        <td class="py-2 px-4"><span id="delta2">1.0</span></td>
                                        <td></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4 text-right">1</td>
                                        <td class="py-2 px-4"><span id="_11">0.6411432780331018</span></td>
                                        <td class="py-2 px-4"><span id="_12">1.358856721966898</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4 text-right">2</td>
                                        <td class="py-2 px-4"><span id="_21">1.358856721966898</span></td>
                                        <td class="py-2 px-4"><span id="_22">0.6411432780331018</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">KA</td>
                                        <td class="py-2 px-4"><span id="ka1">0.47182551895910635</span></td>
                                        <td class="py-2 px-4"><span id="ka2">2.119427542211152</span></td>
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
        @vite('resources/js/cav2/adm_voladitos.js')
    @endpushOnce
</x-app-layout>
