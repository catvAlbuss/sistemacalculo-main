@pushOnce('scripts')
    @vite('resources/js/adm_correa.js')
@endpushOnce

<x-calc-layout title="Diseño de correas">
    <div class="container mx-auto flex flex-wrap py-6">
        <!-- Formulario -->
        <div class="w-full overflow-auto rounded-lg bg-white p-6 shadow-md md:w-1/3 dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <table class="w-full table-fixed px-6 text-gray-800 dark:text-white">
                <thead class="bg-white dark:bg-gray-800">
                    <tr class="text-center">
                        <th class="px-4 py-2">Nombre</th>
                        <th class="px-4 py-2">Simb.</th>
                        <th class="px-4 py-2">Entrada</th>
                        <th class="px-4 py-2">Unidad <br> Medida</th>
                    </tr>
                </thead>
                <tbody class="text-center">
                    <tr class="bg-white dark:bg-gray-800">
                        <th class="px-4 py-2">Clase de madera</th>
                        <th class="px-4 py-2">Cla</th>
                        <th class="px-4 py-2">
                            <select
                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                id="selectabc" name="selectabc">
                                <option value="A" selected>A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                            <!-- <input class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200" id="fc" name="fc" type="text" value="2" placeholder="2" min="0" required> -->
                        </th>
                        <th class="px-4 py-2">-</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                        <th class="px-4 py-2">Base</th>
                        <th class="px-4 py-2">b</th>
                        <th class="px-4 py-2">
                            <input
                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                id="base" name="base" type="text" value="2" placeholder="2"
                                min="0" required>
                        </th>
                        <th class="px-4 py-2">pulg</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                        <th class="px-4 py-2">Altura</th>
                        <th class="px-4 py-2">h</th>
                        <th class="px-4 py-2"><input
                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                id="altura" name="altura" type="text" value="4" placeholder="4"
                                min="0" required>
                        </th>
                        <th class="px-4 py-2">pulg</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                        <th class="px-4 py-2">Luz</th>
                        <th class="px-4 py-2">L</th>
                        <th class="px-4 py-2"><input
                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                id="luz" name="luz" type="text" value="4.5" placeholder="luz"
                                min="0" required
                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                        </th>
                        <th class="px-4 py-2">m</th>
                    </tr>




                    <tr class="bg-white dark:bg-gray-800">
                        <th class="px-4 py-2">Momento</th>
                        <th class="px-4 py-2">M</th>
                        <th class="px-4 py-2"><input
                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                id="momentoultimo" name="momentoultimo" type="text" value="13.7"
                                placeholder="Numero de TRAMOS" min="0" required
                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                        </th>
                        <th class="px-4 py-2">Kg-m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                        <th class="px-4 py-2">Cortante</th>
                        <th class="px-4 py-2">V</th>
                        <th class="px-4 py-2"><input
                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                id="vucortante" name="vucortante" type="text" value="22.71"
                                placeholder="Numero de TRAMOS" min="0" required
                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                        </th>
                        <th class="px-4 py-2">Kg</th>
                    </tr>

                    <tr class="bg-white dark:bg-gray-800">
                        <th class="px-4 py-2">DES CM</th>
                        <th class="px-4 py-2">DCM</th>
                        <th class="px-4 py-2"><input
                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                id="DCM" name="DCM" type="text" value="0.006" placeholder="DCM"
                                min="0" required
                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                        </th>
                        <th class="px-4 py-2">m</th>
                    </tr>

                    <tr class="bg-white dark:bg-gray-800">
                        <th class="px-4 py-2">DES CV</th>
                        <th class="px-4 py-2">DCV</th>
                        <th class="px-4 py-2"><input
                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                id="DCV" name="DCV" type="text" value="0.0024" placeholder="DCV"
                                min="0" required
                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                        </th>
                        <th class="px-4 py-2">m</th>
                    </tr>

                    <tr>
                        <th class="px-4 py-2">
                            <div class="input-group mb-2">
                                <button
                                    class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                                    id="desingButton" type="button">DISEÑAR</button>
                            </div>
                        </th>
                    </tr>
                    <!-- Agregar más filas según sea necesario -->
                </tbody>
            </table>
        </div>
        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-2/3">
            <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-gray-800 dark:text-white" id="desingcorte">
                        <!-- Requisitos de diseño vigas -->
                        <thead class="bg-gray-200 dark:bg-gray-800">
                            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Propiedades del tipo de
                                    madera</th>
                            </tr>
                            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                                <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                                <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                                <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-100 py-2 dark:bg-gray-800" id="predimenension"></tbody>

                        <thead class="bg-gray-200 dark:bg-gray-800">
                            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                <th class="px-4 py-2 text-left text-xl" colspan="4">2.- Dimensionamiento </th>
                            </tr>
                            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                <th class="px-4 py-2 text-lg" scope="col">Nombre</th>
                                <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                                <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                                <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-100 py-2 dark:bg-gray-800" id="dimensionamiento"></tbody>

                        <!-- 2.- Combinacion de Cargas -->

                        <!-- 3.- Analisi estructural -->

                        <!-- 5.- Diseño en madera -->
                        <thead class="bg-gray-200 dark:bg-gray-700">
                            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                <th class="px-4 py-2 text-left text-xl" colspan="4">4.- Diseño en madera</th>
                            </tr>

                            </tr>
                        </thead>
                        <tbody class="py-2" id="desingFlexion"></tbody>

                        <thead class="bg-gray-200 dark:bg-gray-700">
                            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                <th class="px-4 py-2 text-left text-xl" colspan="4">4.1- Verificacion del modulo de
                                    seccion
                                </th>
                            </tr>
                            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                <th class="text-xl" scope="col">Nombre</th>
                                <th class="text-xl" scope="col">Simbolo</th>
                                <th class="text-xl" scope="col">Formula</th>
                                <th class="text-xl" scope="col">Resultado</th>
                            </tr>
                        </thead>
                        <tbody class="py-2" id="modulo41"></tbody>


                        <thead class="bg-gray-200 dark:bg-gray-700">
                            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                <th class="px-4 py-2 text-left text-xl" colspan="4">4.3- Verificacion de esfuerzo
                                    cortante</th>
                            </tr>
                            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                <th class="text-xl" scope="col">Nombre</th>
                                <th class="text-xl" scope="col">Simbolo</th>
                                <th class="text-xl" scope="col">Formula</th>
                                <th class="text-xl" scope="col">Resultado</th>
                            </tr>
                        </thead>
                        <tbody class="py-2" id="modulo43"></tbody>




                        <thead class="bg-gray-200 dark:bg-gray-700">
                            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                <th class="px-4 py-2 text-left text-xl" colspan="4">4.2- Verificacion de
                                    deformaciones</th>
                            </tr>
                            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                <th class="text-xl" scope="col">Nombre</th>
                                <th class="text-xl" scope="col">Simbolo</th>
                                <th class="text-xl" scope="col">Formula</th>
                                <th class="text-xl" scope="col">Resultado</th>
                            </tr>
                        </thead>
                        <tbody class="py-2" id="modulo42"></tbody>



                        <thead class="bg-gray-200 dark:bg-gray-700">
                            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                <th class="px-4 py-2 text-left text-xl" colspan="4">4.4- Verificacion de la
                                    estabilidad lateral
                                </th>
                            </tr>
                            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                <th class="text-xl" scope="col">Nombre</th>
                                <th class="text-xl" scope="col">Simbolo</th>
                                <th class="text-xl" scope="col">Formula</th>
                                <th class="text-xl" scope="col">Resultado</th>
                            </tr>
                        </thead>
                        <tbody class="py-2" id="modulo44"></tbody>
                        <thead class="bg-gray-200 dark:bg-gray-700">
                            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                <th class="px-4 py-2 text-left text-xl" colspan="4">4.5- Longitud del apoyo
                                </th>
                            </tr>
                            <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                <th class="text-xl" scope="col">Nombre</th>
                                <th class="text-xl" scope="col">Simbolo</th>
                                <th class="text-xl" scope="col">Formula</th>
                                <th class="text-xl" scope="col">Resultado</th>
                            </tr>
                        </thead>
                        <tbody class="py-2" id="modulo45"></tbody>



                    </table>
                </div>
            </div>
        </div>
    </div>
</x-calc-layout>
