<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Diseño de Muros de Contención') }}
        </h2>
    </x-slot>
    <script>
        MathJax = {
            loader: {
                load: ['input/asciimath', 'output/chtml']
            }
        }
    </script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@latest/dist/echarts.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.3.0/dist/echarts.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.min.js"
        integrity="sha512-NApOOz1j2Dz1PKsIvg1hrXLzDFd62+J0qOPIhm8wueAnk4fQdSclq6XvfzvejDs6zibSoDC+ipl1dC66m+EoSQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <script src="https://unpkg.com/konva@9.3.6/konva.min.js"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>

    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <!-- Formulario -->
                <div class="w-full md:w-1/3">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Datos Generales</h3>
                        <div class="overflow-auto">
                            <form id="cimientosControler" method="POST">
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
                                            <th scope="col">Desplante</th>
                                            <th scope="col">Df</th>
                                            <th scope="col"><input type="text" name="df" id="df"
                                                    value="2"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    placeholder="1" step="0.1" required></th>
                                            <th scope="col">m</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Altura del muro</th>
                                            <th scope="col">H</th>
                                            <th scope="col"><input type="text" name="H" id="H"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    value="8.5" placeholder="3.5" step="0.1" required></th>
                                            <th scope="col">m</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Espesor de la corona</th>
                                            <th scope="col">e</th>
                                            <th scope="col"><input type="text" name="e" id="e"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    value="0.3" placeholder="3.5" step="0.1" required></th>
                                            <th scope="col">m</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Angulo de inclinacion del terreno</th>
                                            <th scope="col">ϕ</th>
                                            <th scope="col"><input type="text" name="angterr" id="angterr"
                                                    value="12"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    placeholder="30" min="0" step="0.1" required></th>
                                            <th scope="col">°</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Mononobe - okabe</th>
                                            <th scope="col" colspan="3">
                                                <select name="zonaok" id="zonaok"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md">
                                                    <option value="0">ZONA</option>
                                                    <option value="0.4">1</option>
                                                    <option value="0.3" selected>2</option>
                                                    <option value="0.15">3</option>
                                                </select>
                                            </th>

                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Kv esta en el rango de 0.3-0.6 Kh</th>
                                            <th scope="col" colspan="3">
                                                <select name="kvran" id="kvran"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md">
                                                    <option value="0.045">0.3Kh</option>
                                                    <option value="0.0525" selected>0.35Kh</option>
                                                    <option value="0.06">0.4Kh</option>
                                                    <option value="0.0675">0.45Kh</option>
                                                    <option value="0.075">0.5Kh</option>
                                                </select>
                                            </th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Consideramos dentellon</th>
                                            <th scope="col" colspan="3">
                                                <select name="considerar" id="considerar"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md">
                                                    <option value="si">SI</option>
                                                    <option value="no" selected>NO</option>
                                                </select>
                                            </th>

                                        </tr>
                                        <tr id="hdContainer" style="display: none;"
                                            class="bg-white dark:bg-gray-800">
                                            <th scope="col"></th>
                                            <th scope="col">Hd</th>
                                            <th scope="col"><input type="number" name="hd" id="hd"
                                                    value="1"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    placeholder="0.82" step="0.1" required></th>
                                            <th scope="col">m</th>
                                        </tr>
                                        <tr id="b1Container" style="display: none;"
                                            class="bg-white dark:bg-gray-800">
                                            <th scope="col"></th>
                                            <th scope="col">b1</th>
                                            <th scope="col"><input type="number" name="b1" id="b1"
                                                    value="0.2"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    placeholder="0.82" step="0.1" required></th>
                                            <th scope="col">m</th>
                                        </tr>
                                    </tbody>
                                    <tbody>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Peso especifico del concreto</th>
                                            <th scope="col">Yc</th>
                                            <th scope="col"><input type="text" name="gc" id="gc"
                                                    value="2.4"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    placeholder="2.4" min="0" step="any"></th>
                                            <th scope="col">Tn/m<sup>3</sup></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Peso especifico del suelo</th>
                                            <th scope="col">Ys</th>
                                            <th scope="col"><input type="text" name="gs" id="gs"
                                                    value="1.75"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    placeholder="1.75" min="0" step="any"></th>
                                            <th scope="col">Tn/m<sup>3</sup></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Angulo de fricción del suelo</th>
                                            <th scope="col">Ø</th>
                                            <th scope="col"><input type="text" name="tet" id="tet"
                                                    value="20" placeholder="20"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    min="0" step="any"></th>
                                            <th scope="col">°</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Cohesión</th>
                                            <th scope="col">z</th>
                                            <th scope="col"><input type="text" name="z" id="z"
                                                    value="0"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    placeholder="0" min="0" step="any"></th>
                                            <th scope="col"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Angulo del talud</th>
                                            <th scope="col">d</th>
                                            <th scope="col"><input type="text" name="d" id="d"
                                                    value="10"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    placeholder="10" min="0" step="any"></th>
                                            <th scope="col">°</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Sobrecarga</th>
                                            <th scope="col">S/C</th>
                                            <th scope="col"><input type="text" name="SC" id="SC"
                                                    value="0"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    placeholder="0" min="0" step="any"></th>
                                            <th scope="col">Tn/m<sup>2</sup></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th scope="col">Altura de la sobrecarga</th>
                                            <th scope="col">hs</th>
                                            <th scope="col"><input type="text" name="hs" id="hs"
                                                    value="0"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    placeholder="0" min="0" step="any"></th>
                                            <th scope="col">°</th>
                                        </tr>
                                    </tbody>
                                </table>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Resultados -->
                <div class="w-full md:w-2/3 px-4 mt-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6" id="muros_pdf">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Resultados</h3>
                        <button type="button"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            id="btn_pdf_predim">
                            Generar PDF
                        </button>
                        <div class="overflow-x-auto">
                            <style>
                                #predimsMC {
                                    width: 600px;
                                    height: 600px;
                                    margin: 0 auto;
                                }
                            </style>
                            <div id="predimsMC"></div>
                        </div>
                        <div
                            class="overflow-x-auto text-gray-800 dark:text-white px-6 relative flex flex-col items-center justify-center min-h-screen py-2">
                            {{-- <div id="main" style="width: 100%; height: 500px; margin: 0 auto;"></div> --}}
                            {{-- <div class="contenedor" id="predimensionamiento"></div> --}}
                            <table class="table text-center">
                                <thead class="bg-white dark:bg-gray-800">
                                    <tr class="text-center">
                                        <th class="py-2 px-4">Nombre</th>
                                        <th class="py-2 px-4">Simb.</th>
                                        <th class="py-2 px-4">Entrada</th>
                                        <th class="py-2 px-4">Unidad <br> Medida</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th scope="col">Longitud del talón</th>
                                        <th scope="col">b1</th>
                                        <th scope="col"><input type="number" name="b1graf" id="b1graf"
                                                value="2"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                placeholder="1" min="0" step="any"></th>
                                        <th scope="col">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th scope="col">Altura de la zapata</th>
                                        <th scope="col">hz</th>
                                        <th scope="col"><input type="number" name="hzgraf" id="hzgraf"
                                                value="0.4" placeholder="0.4"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                min="0" step="any"></th>
                                        <th scope="col">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th scope="col">Espesor de la corona</th>
                                        <th scope="col">e</th>
                                        <th scope="col"><input type="number" name="egraf" id="egraf"
                                                value="0.2"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                placeholder="0.2" min="0" step="any"></th>
                                        <th scope="col">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th scope="col">Espesor del vastago</th>
                                        <th scope="col">ep</th>
                                        <th scope="col"><input type="number" name="epgraf" id="epgraf"
                                                value="0.15"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                placeholder="0.15" min="0" step="any"></th>
                                        <th scope="col">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th scope="col">Longitud de la punta</th>
                                        <th scope="col">b2</th>
                                        <th scope="col"><input type="number" name="b2graf" id="b2graf"
                                                value="1.25"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                placeholder="1.25" min="0" step="any"></th>
                                        <th scope="col">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">
                                            <div class="input-group mb-2">
                                                <button id="graficar"
                                                    class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                                                    type="button">DISEÑAR</button>
                                            </div>
                                        </th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full text-gray-800 dark:text-white" id="table_General"
                                style="display: none;">
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-lg py-2 px-4 text-left" scope="col" colspan="6">1.-
                                            Requisitos de diseño</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col" colspan="3">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Dato</th>
                                        <th class="text-lg py-2 px-4 text-left" scope="col">Unidad <br>de medida
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="Requisitodesing" class="bg-gray-100 dark:bg-gray-800  py-2"></tbody>


                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-lg py-2 px-4 text-left" scope="col" colspan="6">2.-
                                            Metrado de cargas</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4 text-left" scope="col" colspan="2"></th>
                                        <th class="text-lg py-2 px-4 text-left" scope="col">Simbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Suelo</th>
                                        <th class="text-lg py-2 px-4" scope="col">S/C</th>
                                        <th class="text-lg py-2 px-4 text-left" scope="col">Total</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2 text-left" id="primerTabla">
                                    <!-- Aquí se agregarán las filas generadas por la función calcularPrimerCuadro -->
                                </tbody>
                                <thead class="bg-gray-200 dark:bg-gray-800 text-center">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-lg py-2 px-4 text-left" scope="col" colspan="6">3.
                                            Verificaciones</th>
                                    </tr>
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-lg py-2 px-4 text-left" scope="col" colspan="6">3.1
                                            Verificacion sin efecto sismico</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4 text-left" scope="col">Componente</th>
                                        <th class="text-lg py-2 px-4" scope="col">Area <br>(m<sup>2</sup>)</th>
                                        <th class="text-lg py-2 px-4" scope="col">Peso <br>(Tn)</th>
                                        <th class="text-lg py-2 px-4" scope="col">Brazo <br>(m)</th>
                                        <th class="text-lg py-2 px-4" scope="col">Momento <br>(Tn-m)</th>
                                        <th class="text-lg py-2 px-4" scope="col">Descripcion</th>
                                    </tr>

                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2 text-center" id="segundaTabla">
                                </tbody>

                                <thead class="bg-gray-200 dark:bg-gray-800 tabla-oculta" style="display: none;">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">4. Key</th>
                                    </tr>
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">4.1 Key sin sismo</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" colspan="2">Ubicacion</th>
                                        <th scope="col" colspan="2">Peralte del dentellon</th>
                                        <th scope="col" colspan="2">Considerar ??</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col" colspan="2"> <input
                                                type="text"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="ubicacion" id="ubicacion" value="1.25"></th>
                                        <th class="text-lg py-2 px-4" scope="col" colspan="2"> <input
                                                type="text"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="dentelloncorr" id="dentelloncorr" value="0.8"></th>
                                        <th class="text-lg py-2 px-4" scope="col" colspan="2">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="consDes" id="consDes">
                                                <option disabled>Seleccione</option>
                                                <option value="si" selected>SI</option>
                                                <option value="no">NO</option>
                                            </select>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2 tabla-ocultabody" id="keysin"
                                    style="display: none;"></tbody>

                                <thead class="bg-gray-200 dark:bg-gray-800 tabla-oculta" style="display: none;">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">4.2 Key con sismo</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col" colspan="2">Ubicacion</th>
                                        <th class="text-lg py-2 px-4" scope="col" colspan="2"> Peralte del
                                            dentellon</th>
                                        <th class="text-lg py-2 px-4" scope="col" colspan="2">¿Considerar?</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col" colspan="2"> <input
                                                type="text"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="ubicacioncon" id="ubicacioncon" value="1.25"></th>
                                        <th class="text-lg py-2 px-4" scope="col" colspan="2"> <input
                                                type="text"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="dentelloncons" id="dentelloncons" value="0.8"></th>
                                        <th class="text-lg py-2 px-4" scope="col" colspan="2">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="consDescons" id="consDescons">
                                                <option disabled>Seleccione</option>
                                                <option value="si" selected>SI</option>
                                                <option value="no">NO</option>
                                            </select>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2 tabla-ocultabody" id="keycon"
                                    style="display: none;"></tbody>

                                <!-- ANALISIS ESTRUCTURAL -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">5. Analsis
                                            Estructuctural</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col" colspan="3"></th>
                                        <th class="text-lg py-2 px-4" scope="col" style="vertical-align: middle;">
                                            Diseño</th>
                                        <th class="text-lg py-2 px-4" scope="col" colspan="2">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="desing" id="desing">
                                                <option disabled="disabled">Seleccione</option>
                                                <option value="sinsismo">Sin Sismo</option>
                                                <option value="consismo">Con sismo</option>
                                                <option value="maximo" selected>Maximo</option>
                                            </select>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colspan="6"></th>
                                    </tr>
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">5.1. Pantalla</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablapp"></tbody>

                                <!-- DISEÑO DE CONCRETO ARMADO PANTALLA-->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">6. Analsis
                                            Estructuctural</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;">Fy</th>
                                        <th scope="col" colspan="2"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="fy" id="fy" value="4200"></th>
                                        <th scope="col" style="vertical-align: middle;">f'c</th>
                                        <th scope="col" colspan="2"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="fc" id="fc" value="210"></th>
                                    </tr>
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">6.1. Pantalla</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablatk"></tbody>

                                <!-- =================DISTIBUCION DEL ACERO LONGITUDINAL PRINCIPAL===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.1.3. Distribucion del
                                            acero longitudinal principal</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="py-2 px-4" scope="col" style="vertical-align: middle;"
                                            colspan="3">Area del acero</th>
                                        <th class="py-2 px-4" scope="col" colspan="1">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="acer" id="acer">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5 ">8 mm</option>
                                                <option value="0.71">3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27" selected>1/2</option>
                                                <option value="2   ">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                        <th scope="col" style="vertical-align: middle;"># de barras</th>
                                        <th scope="col" colspan="1"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="numbarras" id="numbarras" value="2"></th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablapantallaAcero"></tbody>

                                <!-- =================Distribucion del acero Tranversal===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.1.4. Distribucion del
                                            acero transversal</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="py-2 px-4" scope="col" style="vertical-align: middle;"
                                            colspan="3">Area del acero </th>
                                        <th class="py-2 px-4" scope="col" colspan="1">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="acertrans" id="acertrans">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71" selected>3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27">1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                        <th scope="col" style="vertical-align: middle;">porpocion</th>
                                        <th scope="col" colspan="1"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="porpocion" id="porpocion" value="0.33333"></th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaDAT"></tbody>

                                <!-- =================CARA Libre===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.1.5 Cara libre</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="5">Area del
                                            acero </th>
                                        <th scope="col" colspan="1">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="acerclibre" id="acerclibre">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71" selected>3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27">1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablacaidaLibre"></tbody>

                                <!-- ===================DCAP DISEÑO POR CORTE================ -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.1.6 Diseño por corte
                                        </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th style="vertical-align: middle;" scope="col" colspan="5">Corte A
                                        </th>
                                        <th scope="col" colspan="1"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="corteA" id="corteA" value="0.3"></th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tabledcorte"></tbody>

                                <!-- =======================Pantalla============================ -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.1.7 Pantalla(recorte
                                            de refuerzo longitudinal principal)</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th style="vertical-align: middle;" scope="col" colspan="4">L</th>
                                        <th style="vertical-align: middle;" scope="col"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="lpr" id="lpr" value="2"></th>
                                        <th style="vertical-align: middle;" scope="col">m</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablePrecorte"></tbody>

                                <!-- =======================DISEÑO POR FLEXION====================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.1.8. Diseño por
                                            flexion</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th style="vertical-align: middle;" scope="col" colspan="5"></th>
                                        <th style="vertical-align: middle;" scope="col"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="DF" id="DF" value="1.5"></th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tableDflexion"></tbody>

                                <!-- ========================Distribucion del acero L Secundario=========== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.1.9 Distribucion del
                                            acero longitudinal secundario</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="3">Area del
                                            acero</th>
                                        <th scope="col" colspan="1">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="aceroLs" id="aceroLs">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71">3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27" selected>1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                        <th scope="col" style="vertical-align: middle;"># de barras</th>
                                        <th scope="col" colspan="1"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="numbarrasls" id="numbarrasls" value="1">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaALS"></tbody>

                                <!-- ===========================DISEÑO DE CONCRETO ARMADO PUNTA=============-->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.2. Punta</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tabladesingcaPunta"></tbody>

                                <!-- =================PUNTA DISTIBUCION DEL ACERO LONGITUDINAL PRINCIPAL===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.2.3. Distribucion del
                                            acero longitudinal principal</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="3">Area del
                                            acero</th>
                                        <th scope="col" colspan="1">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="acerpun" id="acerpun">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71">3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27" selected>1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                        <th scope="col" style="vertical-align: middle;"># de barras</th>
                                        <th scope="col" colspan="1"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="numbarrapun" id="numbarrapun" value="1">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaDALP"></tbody>

                                <!-- =================DISTIBUCION DEL ACERO TRANSVERSAL===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.2.4. Distribucion del
                                            acero transversal</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="3">Area del
                                            acero </th>
                                        <th scope="col" colspan="1">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="acertranspun" id="acertranspun">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71" selected>3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27">1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                        <th scope="col" style="vertical-align: middle;">porpocion</th>
                                        <th scope="col" colspan="1"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="porpocionpun" id="porpocionpun" value="0.5">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tabladatpun"></tbody>

                                <!-- ===================CARA Libre===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.2.5. Cara libre</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="5">Area del
                                            acero </th>
                                        <th scope="col" colspan="2">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="acerclibrepun" id="acerclibrepun">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71" selected>3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27">1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaClibre"></tbody>


                                <!-- ===================DCAP DISEÑO POR CORTE================ -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.2.6. Diseño por corte
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tabledcortepun"></tbody>


                                <!-- ========================DISTIBUCION DEL ACERO LONGITUDINAL SECUNDARIO PUNTA=========== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.2.7. Distribucion del
                                            acero longitudinal secundario</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="3">Area del
                                            acero</th>
                                        <th scope="col" colspan="1">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="aceroLspun" id="aceroLspun">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71">3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27" selected>1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                        <th scope="col" style="vertical-align: middle;"># de barras</th>
                                        <th scope="col" colspan="1"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="numbarraslspun" id="numbarraslspun"
                                                value="1"></th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaALSpun"></tbody>


                                <!-- ===========================DISEÑO DE CONCRETO ARMADO TALON=============-->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.3. Talon</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tabladesingcatalon"></tbody>


                                <!-- =================PUNTA DISTIBUCION DEL ACERO LONGITUDINAL PRINCIPAL===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.3.3. Distribucion del
                                            acero longitudinal</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="3">Area del
                                            acero</th>
                                        <th scope="col" colspan="1">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="acertal" id="acertal">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71">3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27" selected>1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                        <th scope="col" style="vertical-align: middle;"># de barras</th>
                                        <th scope="col" colspan="1"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="numbarratal" id="numbarratal" value="1">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaALPtal"></tbody>

                                <!-- =================DISTIBUCION DEL ACERO TRANSVERSAL===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.3.4. Distribucion del
                                            acero transversal</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="3">Area del
                                            acero </th>
                                        <th scope="col" colspan="1">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="acertranstal" id="acertranstal">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71" selected>3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27">1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                        <th scope="col" style="vertical-align: middle;">porpocion</th>
                                        <th scope="col" colspan="1"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="porpociontal" id="porpociontal" value="0.5">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaDATtal"></tbody>

                                <!-- ===================CARA Libre===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.3.5. Cara libre</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="4">Area del
                                            acero </th>
                                        <th scope="col" colspan="2">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="acerclibretal" id="acerclibretal">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71" selected>3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27">1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaCLtal"></tbody>


                                <!-- ===================DCAP DISEÑO POR CORTE================ -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.3.6. Diseño por corte
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaDCtal"></tbody>

                                <!-- ===================DCAP LONGITUD DEL PEDESTAL================ -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.3.7. Longitud del
                                            pedestal</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" colspan="3" style="vertical-align: middle;">6.3.7.
                                            Longitud del pedestal</th>
                                        <th scope="col" style="vertical-align: middle;">longitud</th>
                                        <th scope="col"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="Longitud" id="Longitud" value="0"></th>
                                        <th scope="col" style="vertical-align: middle;">m</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaDCtalLP"></tbody>

                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.3.8. Talon (Recorte
                                            del refuerzo)</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-xl" scope="col" style="vertical-align: middle;"
                                            colspan="4">L</th>
                                        <th class="text-xl" scope="col"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="LTal" id="LTal" value="0"></th>
                                        <th class="text-xl" scope="col" style="vertical-align: middle;">m</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaDCtaltRR"></tbody>

                                <!-- =======================================DCA KEY Generalidades =============================================================-->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.4. KEY</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaKey"></tbody>

                                <!-- =================KEY DISTIBUCION DEL ACERO LONGITUDINAL PRINCIPAL===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.4.3. Distribucion del
                                            acero longitudinal</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="3">Area del
                                            acero</th>
                                        <th scope="col" colspan="1">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="aceroKey" id="aceroKey">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71">3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27" selected>1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                        <th scope="col" style="vertical-align: middle;"># de barras</th>
                                        <th scope="col" colspan="1"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="numbarraKey" id="numbarraKey" value="1">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaDALKey"></tbody>

                                <!-- =================KEY DISTIBUCION DEL ACERO TRANSVERSAL===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.4.4. Distribucion
                                            del acero transversal</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="3">Area del
                                            acero </th>
                                        <th scope="col" colspan="1">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="acerotransKey" id="acerotransKey">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71" selected>3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27">1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                        <th scope="col" style="vertical-align: middle;">porpocion</th>
                                        <th scope="col" colspan="1"><input
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                type="text" name="porpocionKey" id="porpocionKey"
                                                value="0.5"></th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaDATKey"></tbody>

                                <!-- ===================KEY CARA Libre===================== -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.4.5. Cara libre
                                        </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th scope="col" style="vertical-align: middle;" colspan="5">Area del
                                            acero </th>
                                        <th scope="col" colspan="2">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="aceroCLkey" id="aceroCLkey">
                                                <option disabled>Selecciona</option>
                                                <option value="0.5">8 mm</option>
                                                <option value="0.71" selected>3/8</option>
                                                <option value="1.13">12 mm</option>
                                                <option value="1.27">1/2</option>
                                                <option value="2">5/8</option>
                                                <option value="2.85">3/4</option>
                                                <option value="5.07">1</option>
                                                <option value="10.06">1 3/8</option>
                                            </select>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaCLKey"></tbody>


                                <!-- ===================KEY DCAP DISEÑO POR CORTE================ -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="6">6.4.6. Diseño por
                                            corte</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 dark:bg-gray-800  py-2" id="tablaDCKey"></tbody>

                            </table>
                        </div>
                        <h3 class="text-center text-xl text-gray-950 dark:text-white" id="text_graf"
                            style="display: none;"><strong>Grafico de Muros de Contención</strong></h3>
                        <div class="overflow-x-auto" id="contenedorGrafico1" style="display: none;">
                            <h3 class="text-center text-xl text-gray-950 dark:text-white"><strong>Grafico de Muros de
                                    Contención</strong></h3>
                            <div>
                                <div id="seccionmcontencion" style="width: 600px; height: 600px; margin: 0 auto">
                                </div>
                            </div>
                            <h3 class="text-center text-xl text-gray-950 dark:text-white"><strong>Grafico de Cargas
                                    Actuantes</strong></h3>
                            <div>
                                <div id="seccionCargasActuantes"
                                    style="width: 600px; height: 600px; margin: 0 auto">
                                </div>
                            </div>
                            <h3 class="text-center text-xl text-gray-950 dark:text-white"><strong>Diagrama de Momentos
                                    Flectores</strong></h3>
                            <div>
                                <div id="DiagramaMomentosFlectores"
                                    style="width: 600px; height: 600px; margin: 0 auto"></div>
                            </div>
                            <h3 class="text-center text-xl text-gray-950 dark:text-white"><strong>Diagrama de Fuerzas
                                    Cortantes</strong></h3>
                            <div>
                                <div id="DiagramaFuerzaCortante"
                                    style="width: 600px; height: 600px; margin: 0 auto"></div>
                            </div>
                        </div>
                        <div class="overflow-x-auto" id="contendor_MC" style="display: none;">
                            <style>
                                #graficoFinal {
                                    width: 600px;
                                    height: 600px;
                                    margin: 0 auto;
                                }
                            </style>
                            <h3 class="text-center text-xl text-gray-950 dark:text-white"><strong>Grafico Distribucion
                                    del Refuerzo </strong></h3>
                            <div id="graficoFinal"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3.0.1/es5/tex-mml-chtml.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/jasonday/printThis/printThis.js"></script>
    <script src="https://flyover.github.io/imgui-js/dist/imgui.umd.js"></script>
    <script src="https://flyover.github.io/imgui-js/dist/imgui_impl.umd.js"></script>
    @vite('resources/js/adm_murosContencion.js')

</x-app-layout>