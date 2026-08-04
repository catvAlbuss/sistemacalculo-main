<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Analisis Por Viento') }}
        </h2>
    </x-slot>
    <script>
        MathJax = {
            loader: {
                load: ['input/asciimath', 'output/chtml']
            }
        }
    </script>
    <style>

    </style>
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
                                        <td class="py-2 px-4">Grupo</td>
                                        <td class="py-2 px-4">C</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">Modulo de elasticidad minimo</td>
                                        <td class="py-2 px-4">Emin</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="emin"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="emin" min="0" value="55000.0" required></td>
                                        <td class="py-2 px-4">Kg/cm2</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">Diámetro del perno</td>
                                        <td class="py-2 px-4">d</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="diametro"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="diametro" min="0" value="0.625" required></td>
                                        <td class="py-2 px-4">pulg.</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">Carga actuante</td>
                                        <td class="py-2 px-4">F</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="cargaActuante"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="cargaActuante" min="0" value="1883.16" required></td>
                                        <td class="py-2 px-4">kg</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">Espesor de la cartela</td>
                                        <td class="py-2 px-4">ec</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="espesorDeLaCartela"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="espesorDeLaCartela" min="0" value="1.0" required></td>
                                        <td class="py-2 px-4">pulg</td>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <td class="py-2 px-4">Espesor de la madera a unir</td>
                                        <td class="py-2 px-4">em</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="espesorDeLaMaderaAUnir"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="espesorDeLaMaderaAUnir" min="0" value="2.0" required></td>
                                        <td class="py-2 px-4">pulg</td>
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
                                <!-- Datos -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">1.- Carga Admisible Por
                                            Perno
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
                                        <td class="py-2 px-4">Elemento central</td>
                                        <td class="py-2 px-4">l</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="espesorDeElementoCentral">5.08</span> cm</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Elementos laterales (doble del menor espesor)</td>
                                        <td class="py-2 px-4">l</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="espesorDeElementosLaterales">5.08</span> cm
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Por tanto consideramos el menor valor de :</td>
                                        <td class="py-2 px-4">l</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px- 4ConsideramosElMenorValorL"><span <td class="py-2 px-4">
                                                cm
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">l</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="menorValorDeL">5.08</span> cm</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">d</td>
                                        <td class="py-2 px-4"></td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="cargaAdmisiblePorPernoD"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="cargaAdmisiblePorPernoD" min="0" value="0.625" required>
                                            pulg
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">l/d</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="cargaAdmisiblePorPernold">3.2</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Grupo</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><span id="cargaAdmisiblePorPernoGrupo">C</span></td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">P</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4"><input type="number" step="any"
                                                name="cargaAdmisiblePorPernoP"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="cargaAdmisiblePorPernoP" min="0" value="470.0" required>
                                            kg
                                        </td>
                                    </tr>
                                </tbody>
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">2.- Numero De Pernos
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
                                        <td class="py-2 px-4">N° de pernos</td>
                                        <td class="py-2 px-4">-</td>
                                        <td class="py-2 px-4">F/P</td>
                                        <td class="py-2 px-4"><span id="numeroDePernosFP">4.006723404255319</span>
                                        </td>
                                    </tr>

                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Por tanto de usarán</td>
                                        <td class="py-2 px-4"><span id="numeroDePernos">4.006723404255319</span></td>
                                        <td class="py-2 px-4" colspan="2">en 2 líneas, la cual no será necesario
                                            reducir la carga
                                            admisible por efecto de grupo</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4" colspan="4">indicado en la tabla 12.8.</td>
                                    </tr>
                                </tbody>
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">2.1.- Ubicación De Los
                                            Pernos
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2">
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4" colspan="4">Los pernos se ubicaron según el siguiente
                                            gráfico, que
                                            fue construido de acuerdo a la tabla 12.9 de la referencia.</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">A lo largo del grano:</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">4d =</td>
                                        <td class="py-2 px-4"><span id="aLoLargoDelGrano4d">63.5</span></td>
                                        <td class="py-2 px-4">mm. Espaciamiento entre pernos</td>
                                        <td class="py-2 px-4">, Se tomó:</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="seTomo4d"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="seTomo4d" min="0" value="65.0" required></td>
                                        <td class="py-2 px-4">mm.</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">5d =</td>
                                        <td class="py-2 px-4"><span id="aLoLargoDelGrano5d">79.375</span></td>
                                        <td class="py-2 px-4">mm. Distancia al extremo en tracción</td>
                                        <td class="py-2 px-4">, Se tomó:</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="seTomo5d"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="seTomo5d" min="0" value="80.0" required></td>
                                        <td class="py-2 px-4">mm.</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">Perpendicular a la dirección del grano:</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">2d =</td>
                                        <td class="py-2 px-4"><span
                                                id="perpendicularALaDireccionDelGrano2d1">31.75</span></td>
                                        <td class="py-2 px-4">mm. Espaciamiento entre líneas de pernos</td>
                                        <td class="py-2 px-4">, Se tomó:</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="seTomo2d1"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="seTomo2d1" min="0" value="70.0" required></td>
                                        <td class="py-2 px-4">mm.</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="py-2 px-4">2d =</td>
                                        <td class="py-2 px-4"><span
                                                id="perpendicularALaDireccionDelGrano2d2">31.75</span></td>
                                        <td class="py-2 px-4">mm. Distancia a los bordes</td>
                                        <td class="py-2 px-4">, Se tomó:</td>
                                        <td class="py-2 px-4"><input type="number" step="any" name="seTomo2d2"
                                                class="xlsx-calc form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="seTomo2d2" min="0" value="35.0" required></td>
                                        <td class="py-2 px-4">mm.</td>
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
    <script src="{{ asset('assets/js/adm_desing_cartelas_maderas.js') }}"></script>

</x-app-layout>
