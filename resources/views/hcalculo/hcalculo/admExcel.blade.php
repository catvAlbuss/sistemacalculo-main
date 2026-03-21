<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Diseño de vigas') }}
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
                                        <th class="py-2 px-4">-</th>
                                        <th class="py-2 px-4">-</th>
                                        <th class="py-2 px-4">
                                            <select name="selectabc" id="selectabc" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md">
                                                <option value="A" selected>A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                            </select>
                                            <!-- <input type="text" name="fc" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="fc" placeholder="2" min="0" value="2" required> -->
                                        </th>
                                        <th class="py-2 px-4">pulg</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">-</th>
                                        <th class="py-2 px-4">b= </th>
                                        <th class="py-2 px-4">
                                            <input type="text" name="fcprime" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="fcprime" placeholder="2" min="0" value="2" required>
                                        </th>
                                        <th class="py-2 px-4">pulg</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">-</th>
                                        <th class="py-2 px-4">h=</th>
                                        <th class="py-2 px-4"><input type="text" name="fy" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="fy" placeholder="4" min="0" value="4" required></th>
                                        <th class="py-2 px-4">pulg</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">-</th>
                                        <th class="py-2 px-4">L=</th>
                                        <th class="py-2 px-4"><input type="text" name="base" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="base" value="2.5" placeholder="base" min="0" required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></th>
                                        <th class="py-2 px-4">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">-</th>
                                        <th class="py-2 px-4">S=</th>
                                        <th class="py-2 px-4"><input type="text" name="altura" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="altura" value="0.75" placeholder="Numero de TRAMOS" min="0" required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></th>
                                        <th class="py-2 px-4">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">PESO PROPIO</th>
                                        <th class="py-2 px-4">-</th>
                                        <th class="py-2 px-4"><input type="text" name="momentoultimo" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="momentoultimo" value="10" placeholder="Numero de TRAMOS" min="0" required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></th>
                                        <th class="py-2 px-4">Kg/m<sup>2</sup></th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">COVERTURA</th>
                                        <th class="py-2 px-4">-</th>
                                        <th class="py-2 px-4"><input type="text" name="vucortante" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="vucortante" value="20" placeholder="Numero de TRAMOS" min="0" required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></th>
                                        <th class="py-2 px-4">Kg/m<sup>2</sup></th>
                                    </tr>

                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">CIELO RASO</th>
                                        <th class="py-2 px-4">-</th>
                                        <th class="py-2 px-4"><input type="text" name="cieloraso" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="cieloraso" value="0" placeholder="Numero de TRAMOS" min="0" required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></th>
                                        <th class="py-2 px-4">Kg/m<sup>2</sup></th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">SOBRE CARGA</th>
                                        <th class="py-2 px-4">-</th>
                                        <th class="py-2 px-4"><input type="text" name="sobrecarga" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="sobrecarga" value="60" placeholder="Numero de TRAMOS" min="60" required oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"></th>
                                        <th class="py-2 px-4">Kg/m<sup>2</sup></th>
                                    </tr>
                                    <tr>
                                        <th class="py-2 px-4">
                                            <div class="input-group mb-2">
                                                <button id="desingButton" class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded" type="button">DISEÑAR</button>
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
                            <table id="desingcorte" class="min-w-full text-gray-800 dark:text-white">
                                <!-- Requisitos de diseño vigas -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">1.- Propiedades del tipo de madera</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="predimenension" class="bg-gray-100 dark:bg-gray-800  py-2"></tbody>

                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">2.- Dimensionamiento </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="dimensionamiento" class="bg-gray-100 dark:bg-gray-800  py-2"></tbody>

                                <!-- 2.- Combinacion de Cargas -->

                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">3.- Combinacion de Cargas </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>

                                <tbody id="combinaciondecargas" class="bg-gray-100 dark:bg-gray-800  py-2"></tbody>
                                <!-- 3.- Analisi estructural -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">4.- Analisi estructural</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="analisisestructural" class="bg-gray-100 dark:bg-gray-800  py-2"></tbody>
                                <!-- 5.- Diseño en madera -->
                                <thead class="bg-gray-200 dark:bg-gray-700">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">5.- Diseño en madera</th>
                                    </tr>
                                    <!-- <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-xl" scope="col">Nombre</th>
                                        <th class="text-xl" scope="col">Simbolo</th>
                                        <th class="text-xl" scope="col">Formula</th>
                                        <th class="text-xl" scope="col">Resultado</th>
                                    </tr> -->
                                </thead>
                                <tbody id="desingFlexion" class="py-2"></tbody>
                                <!-- imagen -->

                                <thead class="bg-gray-200 dark:bg-gray-700">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">5.1- Vereficacion del modulo de seccion</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">    
                                    </tr>
                                </thead>
                                <tbody id="imagen01" class="py-2"></tbody>
                                <!-- 4.1 -->
                                <thead class="bg-gray-200 dark:bg-gray-700">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4"></th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-xl" scope="col">Nombre</th>
                                        <th class="text-xl" scope="col">Simbolo</th>
                                        <th class="text-xl" scope="col">Formula</th>
                                        <th class="text-xl" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="modulo41" class="py-2"></tbody>

                                <thead class="bg-gray-200 dark:bg-gray-700">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">5.2- Vereficacion de inercias</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-xl" scope="col">Nombre</th>
                                        <th class="text-xl" scope="col">Simbolo</th>
                                        <th class="text-xl" scope="col">Formula</th>
                                        <th class="text-xl" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="modulo42" class="py-2"></tbody>

                                <thead class="bg-gray-200 dark:bg-gray-700">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">5.3- Vereficacion del esfuerzo cortante</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-xl" scope="col">Nombre</th>
                                        <th class="text-xl" scope="col">Simbolo</th>
                                        <th class="text-xl" scope="col">Formula</th>
                                        <th class="text-xl" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="modulo43" class="py-2"></tbody>

                                <thead class="bg-gray-200 dark:bg-gray-700">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">5.4- Vereficacion de la estabilidad lateral</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-xl" scope="col">Nombre</th>
                                        <th class="text-xl" scope="col">Simbolo</th>
                                        <th class="text-xl" scope="col">Formula</th>
                                        <th class="text-xl" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="modulo44" class="py-2"></tbody>
                                <thead class="bg-gray-200 dark:bg-gray-700">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">5.5- Calculo de la longitud de apoyo</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-xl" scope="col">Nombre</th>
                                        <th class="text-xl" scope="col">Simbolo</th>
                                        <th class="text-xl" scope="col">Formula</th>
                                        <th class="text-xl" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="modulo45" class="py-2"></tbody>

                                <thead class="bg-gray-200 dark:bg-gray-700">              
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">    
                                    </tr>
                                </thead>
                                <tbody id="imagen02" class="py-2"></tbody>



                                <!-- Diseño del calculo del area del refuerzo  -->
                                <thead class="bg-gray-200 dark:bg-gray-700"></thead>
                                <tbody id="calcared" class="py-2"></tbody>
                                <!-- Diseño por aceros para calcular el area por capas flexion-->
                                <thead class="bg-gray-200 dark:bg-gray-700"></thead>
                                <tbody id="acerosfinales" class="py-2"></tbody>
                                <!-- Diseño por corte -->
                                <!-- <thead class="bg-gray-200 dark:bg-gray-700">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">3.- Diseño por corte</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-xl" scope="col">Nombre</th>
                                        <th class="text-xl" scope="col">Simbolo</th>
                                        <th class="text-xl" scope="col">Formula</th>
                                        <th class="text-xl" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="diseñoCortes" class="py-2"></tbody> -->
                                <!-- Diseño por aceros para calcular el area por capas corte -->
                                <thead class="bg-gray-200 dark:bg-gray-700"></thead>
                                <tbody id="aceroscortes" class="py-2"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <!-- <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script> -->
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3.0.1/es5/tex-mml-chtml.js"></script>
    <!-- <script src="{{ asset('assets/js/adm_desing_vigas.js') }}"></script> -->
    <script src="assets/js/adm_Excel_general.js"></script>

</x-app-layout>