<x-calc-layout title="Diseño Muros de albañilería">
    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <!-- Formulario -->
                <div class="w-full md:w-1/3">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Datos Generales</h3>
                        <div class="overflow-auto">
                            <form action="{{ route('malbaCont') }}" method="POST" id="datamurosAlb">
                                @csrf
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
                                            <th class="py-2 px-4" colspan="4">Descripción general del diseño</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4"></th>
                                            <th class="py-2 px-4">Desc</th>
                                            <th class="py-2 px-4">
                                                <input type="text" name="desc"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="desc" placeholder="descripción" min="0"
                                                    value="desc" required>
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Ubicación del diseño</th>
                                            <th class="py-2 px-4">Ubic.</th>
                                            <th class="py-2 px-4">
                                                <input type="text" name="ubi"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="ubi" placeholder="Agrega la ubicación" min="0"
                                                    value="ubi" required>
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Resistencia a la Compresión de la Albañilería</th>
                                            <th class="py-2 px-4">F'm</th>
                                            <th class="py-2 px-4">
                                                <input type="text" name="fm"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="fm" placeholder="700" min="0" value="700"
                                                    required>
                                            </th>
                                            <th class="py-2 px-4">Tn/m<sup>2</sup></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Longitud</th>
                                            <th class="py-2 px-4">L</th>
                                            <th class="py-2 px-4"><input type="text" name="l"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="l" placeholder="5" min="0" value="5"
                                                    required></th>
                                            <th class="py-2 px-4">m</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Espesor</th>
                                            <th class="py-2 px-4">t</th>
                                            <th class="py-2 px-4"><input type="text" name="t"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="t" value="0.13" placeholder="0.13" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4">m</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Altura</th>
                                            <th class="py-2 px-4">h</th>
                                            <th class="py-2 px-4"><input type="text" name="h"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="h" value="2.9" placeholder="2.9" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4">m</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4" colspan="4">2.- Cargas y combinaciones para el
                                                diseño</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Carga de gravedad máxima</th>
                                            <th class="py-2 px-4">Pm</th>
                                            <th class="py-2 px-4"><input type="text" name="pm"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="pm" value="27.82" placeholder="27.82" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Fuerza cortante producida por sismo moderado</th>
                                            <th class="py-2 px-4">Ve</th>
                                            <th class="py-2 px-4"><input type="text" name="ve"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="ve" value="3.92" placeholder="3.92" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Momento flector en el muro generado por sismo
                                                moderado</th>
                                            <th class="py-2 px-4">Me</th>
                                            <th class="py-2 px-4"><input type="text" name="me"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="me" value="18.54" placeholder="18.54" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4" colspan="4">4.- Verificacion del agrietamiento en
                                                los muros</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Resistencia característica corte de la albañilería
                                            </th>
                                            <th class="py-2 px-4">V'm</th>
                                            <th class="py-2 px-4"><input type="text" name="vdm"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="vdm" value="81" placeholder="81" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4">m</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4" colspan="4">6.- Verificacion de la nesecidad de
                                                colocar refuerzo horizontal</th>
                                        </tr>

                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Número de hiladas</th>
                                            <th class="py-2 px-4" colspan="3">
                                                <select
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    name="nh" id="nh"
                                                    aria-label="Default select example">
                                                    <option selected disabled>Seleccione la hilada</option>
                                                    <option value="2">2 Hiladas</option>
                                                    <option value="3">3 Hiladas</option>
                                                </select>
                                            </th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Dimensión de barras</th>
                                            <th class="py-2 px-4" colspan="3">
                                                <select
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    name="db" id="db"
                                                    aria-label="Default select example">
                                                    <option selected disabled>Seleccione las barras</option>
                                                    <option value="0.395">8 mm</option>
                                                    <option value="0.250">1/4''</option>
                                                </select>
                                            </th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Número de columnas de confinamiento</th>
                                            <th class="py-2 px-4">Nc</th>
                                            <th class="py-2 px-4"><input type="text" name="nc"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="nc" value="2" placeholder="2" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4">m</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Resistencia característica corte de la albañilería
                                            </th>
                                            <th class="py-2 px-4">F'c</th>
                                            <th class="py-2 px-4"><input type="text" name="fdc"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="fdc" value="210" placeholder="210" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4">Kg/cm<sup>2</sup></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">1/4 pg muro perdendicular</th>
                                            <th class="py-2 px-4">Pt1</th>
                                            <th class="py-2 px-4"><input type="text" name="pt1"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="pt1" value="6.02" placeholder="6.02" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">1/4 pg muro perdendicular</th>
                                            <th class="py-2 px-4">Pt2</th>
                                            <th class="py-2 px-4"><input type="text" name="pt2"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="pt2" value="1" placeholder="0" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Longitud del paño mayor a 0.5L</th>
                                            <th class="py-2 px-4">Lm</th>
                                            <th class="py-2 px-4"><input type="text" name="lm"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="lm" value="5" placeholder="5" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4">m</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4" colspan="4">7.2 Determinación de la Sección de
                                                Concreto de la Columna de Confinamiento</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Ø Columna Exterior</th>
                                            <th class="py-2 px-4">Ø Col. Ext.</th>
                                            <th class="py-2 px-4"><input type="text" name="pce"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="pce" value="0.7" placeholder="0.7" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Ø Columna Interior</th>
                                            <th class="py-2 px-4">Ø Col. Int.</th>
                                            <th class="py-2 px-4"><input type="text" name="pci"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="pci" value="0.7" placeholder="0.7" min="0"
                                                    step="any" required>
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Ø Columna Exterior</th>
                                            <th class="py-2 px-4">Ø Col. Ext.</th>
                                            <th class="py-2 px-4"><input type="text" name="dce"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="dce" value="1" placeholder="1" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Ø Columna Interior</th>
                                            <th class="py-2 px-4">Ø Col. Int.</th>
                                            <th class="py-2 px-4"><input type="text" name="dci"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="dci" value="1" placeholder="1" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Peralte Col. Ext.</th>
                                            <th class="py-2 px-4">PCE</th>
                                            <th class="py-2 px-4"><input type="text" name="pcex"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="pcex" value="0.15" placeholder="0.15" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Peralte Col. Int.</th>
                                            <th class="py-2 px-4">PCI</th>
                                            <th class="py-2 px-4"><input type="text" name="pci"
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    id="pci" value="0.1" placeholder="0.1" min="0"
                                                    required
                                                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                            </th>
                                            <th class="py-2 px-4"></th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4" colspan="4">8. 7.2 Determinación de la Sección de
                                                Concreto de la Columna de Confinamiento</th>
                                        </tr>
                                        <tr class="bg-white dark:bg-gray-800">
                                            <th class="py-2 px-4">Diámetro</th>
                                            <th class="py-2 px-4" colspan="3">
                                                <select
                                                    class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"
                                                    name="dmtr" id="dmtr"
                                                    aria-label="Default select example">
                                                    <option value="0.71">3/8</option>
                                                </select>
                                            </th>
                                        </tr>

                                        <tr>
                                            <th class="py-2 px-4">
                                                <div class="input-group mb-2">
                                                    <button
                                                        class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                                                        type="submit">DISEÑAR</button>
                                                </div>
                                            </th>
                                        </tr>
                                        <!-- Agregar más filas según sea necesario -->
                                    </tbody>
                                </table>
                            </form>
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
                        <div class="overflow-x-auto" id="murosalba_pdf">
                            <div id="resultadoMalba"></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    @pushOnce('scripts')
        @vite('resources/js/adm_muros_albanieria.js')
    @endpushOnce

</x-calc-layout>
