<x-calc-layout title="Diseño de vigas">
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
                                        <th class="py-2 px-4">Esfuerzo de compresión del concreto</th>
                                        <th class="py-2 px-4">fc</th>
                                        <th class="py-2 px-4">
                                            <input type="text" name="fc"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="fc" placeholder="210" min="0" value="210" required>
                                        </th>
                                        <th class="py-2 px-4">kg/cm<sup>2</sup></th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Esfuerzo de fluencia del acero</th>
                                        <th class="py-2 px-4">fy</th>
                                        <th class="py-2 px-4"><input type="text" name="fy"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="fy" placeholder="4200" min="0" value="4200"
                                                required></th>
                                        <th class="py-2 px-4">kg/cm<sup>2</sup></th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Base</th>
                                        <th class="py-2 px-4">b</th>
                                        <th class="py-2 px-4"><input type="text" name="base"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="base" value="40" placeholder="base" min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">cm</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Altura</th>
                                        <th class="py-2 px-4">h</th>
                                        <th class="py-2 px-4"><input type="text" name="altura"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="altura" value="90" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">cm</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Momento último</th>
                                        <th class="py-2 px-4">Mu</th>
                                        <th class="py-2 px-4"><input type="text" name="momentoultimo"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="momentoultimo" value="18" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">Tn/m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Cortante último</th>
                                        <th class="py-2 px-4">Vu</th>
                                        <th class="py-2 px-4"><input type="text" name="vucortante"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="vucortante" value="10" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">Tn/m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Capas</th>
                                        <th class="py-2 px-4" colspan="3">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="capas" id="capas" aria-label="Default select example">
                                                <option selected disabled>Seleccione la capa</option>
                                                <option value="1" selected>1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                            </select>
                                        </th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Cuantias</th>
                                        <th class="py-2 px-4" colspan="3">
                                            <select
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                name="cuantias" id="cuantias" aria-label="Default select example">
                                                <option selected disabled>Seleccione la cuantia</option>
                                                <option value="1">0.7(f'c)0.5/Fy</option>
                                                <option value="2">0.8(f'c)0.5/Fy</option>
                                                <option value="3" selected>14/Fy</option>
                                            </select>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th class="py-2 px-4">
                                            <div class="input-group mb-2">
                                                <button id="desingButton"
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
                        <button type="button"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            id="btn_pdf_predim">
                            Generar PDF
                        </button>
                        <button type="button"
                            class="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            id="btn_captura_resultado">
<<<<<<< HEAD
                            Generar IMG
=======
                            Generar imagen
>>>>>>> 214c24bba7f9f12cdbf217e63261464dbacb13ec
                        </button>
                        <div class="overflow-x-auto" id="vigasgn">
                            <table id="desingcorte" class="min-w-full text-gray-800 dark:text-white">
                                <!-- Requisitos de diseño vigas -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">1.- Requisitos de
                                            diseño</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
<<<<<<< HEAD
                                        <th class="text-lg py-2 px-4 w-[30%]" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4 w-[15%]" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4 w-[35%]" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4 w-[20%]" scope="col">Resultado</th>
=======
                                        <<th class="text-xl py-2 px-4 w-[30%]" scope="col">Nombre</th>
                                        <th class="text-xl py-2 px-4 w-[15%]" scope="col">Simbolo</th>
                                        <th class="text-xl py-2 px-4 w-[35%]" scope="col">Formula</th>
                                        <th class="text-xl py-2 px-4 w-[20%]" scope="col">Resultado</th>
>>>>>>> 214c24bba7f9f12cdbf217e63261464dbacb13ec
                                    </tr>
                                </thead>
                                <tbody id="predimenension" class="bg-gray-100 dark:bg-gray-800  py-2"></tbody>
                                <thead class="bg-gray-200 dark:bg-gray-700">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">2.- Diseño por flexion
                                        </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
<<<<<<< HEAD
                                        <th class="text-lg py-2 px-4 w-[30%]" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4 w-[15%]" scope="col">Simbolo</th>
                                        <th class="text-lg py-2 px-4 w-[35%]" scope="col">Formula</th>
                                        <th class="text-lg py-2 px-4 w-[20%]" scope="col">Resultado</th>
=======
                                        <th class="text-xl py-2 px-4 w-[30%]" scope="col">Nombre</th>
                                        <th class="text-xl py-2 px-4 w-[15%]" scope="col">Simbolo</th>
                                        <th class="text-xl py-2 px-4 w-[35%]" scope="col">Formula</th>
                                        <th class="text-xl py-2 px-4 w-[20%]" scope="col">Resultado</th>
>>>>>>> 214c24bba7f9f12cdbf217e63261464dbacb13ec
                                    </tr>
                                </thead>
                                <tbody id="desingFlexion" class="py-2"></tbody>

                                <!-- Diseño del calculo del area del refuerzo  -->
                                <thead class="bg-gray-200 dark:bg-gray-700"></thead>
                                <tbody id="calcared" class="py-2"></tbody>

                                <!-- Diseño por aceros para calcular el area por capas flexion-->
                                <thead class="bg-gray-200 dark:bg-gray-700"></thead>
                                <tbody id="acerosfinales" class="py-2"></tbody>

                                <!-- Diseño por corte -->
                                <thead class="bg-gray-200 dark:bg-gray-700">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">3.- Diseño por corte
                                        </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
<<<<<<< HEAD
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Simbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Formula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
=======
                                        <th class="text-xl py-2 px-4 w-[30%]" scope="col">Nombre</th>
                                        <th class="text-xl py-2 px-4 w-[15%]" scope="col">Simbolo</th>
                                        <th class="text-xl py-2 px-4 w-[35%]" scope="col">Formula</th>
                                        <th class="text-xl py-2 px-4 w-[20%]" scope="col">Resultado</th>
>>>>>>> 214c24bba7f9f12cdbf217e63261464dbacb13ec
                                    </tr>
                                </thead>
                                <tbody id="diseñoCortes" class="py-2"></tbody>

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

    @pushOnce('scripts')
    @vite(['resources/js/adm_desing_vigas.js'])
    @endpushOnce
</x-calc-layout>
<style>
    tr, td, th {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>