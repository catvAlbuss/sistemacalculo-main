<x-calc-layout title="Arco Techo">
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
                                    <th class="py-2 px-4" colspan="4"
                                        style="font-size: 1.1rem; font-weight: normal; text-align: left;">
                                        <strong>A.- Propiedades Geometricas:</strong>
                                    </th>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Altura de columna</th>
                                        <th class="py-2 px-4">h</th>
                                        <th class="py-2 px-4">
                                            <input type="text" name="alturacolumna"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="alturacolumna" placeholder="8" min="0" value="8"
                                                required>
                                        </th>
                                        <th class="py-2 px-4">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Longitud transversal</th>
                                        <th class="py-2 px-4">LB</th>
                                        <th class="py-2 px-4">
                                            <input type="text" name="longitudtransversal"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="longitudtransversal" placeholder="45.8" min="0"
                                                value="45.8" required>
                                        </th>
                                        <th class="py-2 px-4">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Luz</th>
                                        <th class="py-2 px-4">L</th>
                                        <th class="py-2 px-4"><input type="text" name="luz"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="luz" placeholder="35" min="0" value="35" required>
                                        </th>
                                        <th class="py-2 px-4">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Flecha</th>
                                        <th class="py-2 px-4">f</th>
                                        <th class="py-2 px-4"><input type="text" name="flecha"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="flecha" value="7" placeholder="base" min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">m</th>
                                    </tr>
                                    <th class="py-2 px-4" colspan="4"
                                        style="font-size: 1.1rem; font-weight: normal; text-align: left;">
                                        <strong>B.- Cargas:</strong>
                                    </th>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Peso propio</th>
                                        <th class="py-2 px-4">P.P.</th>
                                        <th class="py-2 px-4"><input type="text" name="pesopropio"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="pesopropio" value="19.8" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">Kg/m<sup>2</sup></th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Luminarias</th>
                                        <th class="py-2 px-4">P.M</th>
                                        <th class="py-2 px-4"><input type="text" name="luminarias"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="luminarias" value="0" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">Kg/m<sup>2</sup></th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Carga viva de techo</th>
                                        <th class="py-2 px-4">CVT</th>
                                        <th class="py-2 px-4"><input type="text" name="cargaviva"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="cargaviva" value="30" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">Kg/m<sup>2</sup></th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Carga de viento</th>
                                        <th class="py-2 px-4">C</th>
                                        <th class="py-2 px-4"><input type="text" name="cargaviento"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="cargaviento" value="75" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">Kg/H</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Carga de nieve </th>
                                        <th class="py-2 px-4">Ps</th>
                                        <th class="py-2 px-4"><input type="text" name="Ps"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="Ps" value="40" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">Kg/m<sup>2</sup></th>
                                    </tr>
                                    <!-- COEFICIENTE SISMICO -->
                                    <th class="py-2 px-4" colspan="4"
                                        style="font-size: 1.1rem; font-weight: normal; text-align: left;">
                                        <strong>C.- Carga Sismica:</strong>
                                    </th>

                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Zona</th>
                                        <th class="py-2 px-4">Z</th>
                                        <th class="py-2 px-4"><input type="text" name="Z"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="Z" value="0.35" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">-</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Categoria</th>
                                        <th class="py-2 px-4">U</th>
                                        <th class="py-2 px-4"><input type="text" name="U"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="U" value="1.5" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">-</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Tipo de suelo</th>
                                        <th class="py-2 px-4">S</th>
                                        <th class="py-2 px-4"><input type="text" name="S"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="S" value="1.2" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">-</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">C</th>
                                        <th class="py-2 px-4">C</th>
                                        <th class="py-2 px-4"><input type="text" name="C"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="C" value="2.5" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">-</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Coeficiente de ductilidad</th>
                                        <th class="py-2 px-4">R</th>
                                        <th class="py-2 px-4"><input type="text" name="R"
                                                class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                id="R" value="8" placeholder="Numero de TRAMOS"
                                                min="0" required
                                                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                        </th>
                                        <th class="py-2 px-4">-</th>
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
                        <div class="overflow-x-auto">
                            <table id="desingcorte" class="min-w-full text-gray-800 dark:text-white">
                                <!-- Requisitos de diseño vigas -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">1.- Propiedades
                                            Geometricos</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="datosgeometricos" class="bg-gray-100 dark:bg-gray-800  py-2"></tbody>

                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">2.- Carga Muerta </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="calculocargas" class="bg-gray-100 dark:bg-gray-800  py-2"></tbody>

                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">3.- Carga Viva</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="cargavivas" class="bg-gray-100 dark:bg-gray-800  py-2"></tbody>
                                <!-- 2.- Combinacion de Cargas -->
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">4.- Carga Sismica</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="coeficientesismico" class="bg-gray-100 dark:bg-gray-800  py-2"></tbody>
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">5.- Carga Viento</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="cargadeviento" class="bg-gray-1"></tbody>
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="text-xl py-2 px-4 text-left" colspan="4">6.- Carga Nieve</th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="text-lg py-2 px-4" scope="col">Nombre</th>
                                        <th class="text-lg py-2 px-4" scope="col">Símbolo</th>
                                        <th class="text-lg py-2 px-4" scope="col">Fórmula</th>
                                        <th class="text-lg py-2 px-4" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody id="carganieve" class="bg-gray-1"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @pushOnce('scripts')
        @vite('resources/js/adm_Arcotecho_general.js')
    @endpushOnce
</x-calc-layout>
