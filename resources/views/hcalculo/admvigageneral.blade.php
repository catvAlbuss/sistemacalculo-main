<x-calc-layout title="Diseño de vigas">
    <div class="py-2 px-2 w-full">
        <div class="flex gap-4">
            <!-- Formulario -->
            <div class="md:w-1/3">
                <div class="rounded-lg bg-white p-2 shadow-md dark:bg-gray-800">
                    <h3 class="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
                    <div class="overflow-auto">
                        <table class="w-full table-auto text-xs px-6 text-gray-800 dark:text-white">
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
                                    <th class="px-4 py-2">Esfuerzo de compresión del concreto</th>
                                    <th class="px-4 py-2">fc</th>
                                    <th class="px-4 py-2">
                                        <input
                                            class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                            id="fc" name="fc" type="text" value="210"
                                            placeholder="210" min="0" required>
                                    </th>
                                    <th class="px-4 py-2">kg/cm<sup>2</sup></th>
                                </tr>
                                <tr class="bg-white dark:bg-gray-800">
                                    <th class="px-4 py-2">Esfuerzo de fluencia del acero</th>
                                    <th class="px-4 py-2">fy</th>
                                    <th class="px-4 py-2"><input
                                            class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                            id="fy" name="fy" type="text" value="4200"
                                            placeholder="4200" min="0" required></th>
                                    <th class="px-4 py-2">kg/cm<sup>2</sup></th>
                                </tr>
                                <tr class="bg-white dark:bg-gray-800">
                                    <th class="px-4 py-2">N° tramos</th>
                                    <th class="px-4 py-2">#</th>
                                    <th class="px-4 py-2"><input
                                            class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                            type="number" id="num_tramos" name="num_tramos" value="1"
                                            placeholder="tramos" min="0" required
                                            oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                                    </th>
                                    <th class="px-4 py-2"></th>
                                </tr>
                            </tbody>
                        </table>
                        <div class="overflow-auto" id="tablaContainer"></div>

                        <div class="mt-4 flex gap-2">
                            <button
                                class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                                id="accionButton">DISEÑAR</button>

                            <button
                                class="rounded border-b-4 border-green-700 bg-green-500 px-4 py-2 font-bold text-white hover:border-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                id="exportPdfButton" disabled>
                                📄 EXPORTAR PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resultados -->
            <div class="md:w-2/3">
                <div class="rounded-lg bg-white p-2 shadow-md dark:bg-gray-800">
                    <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
                    <div class="overflow-x-auto py-2" id="vigas_general"></div>
                </div>
            </div>
        </div>
    </div>

    @pushOnce('scripts')
        @vite(['resources/js/adm_vigas_general.js'])
    @endpushOnce
</x-calc-layout>
