<x-app-layout>
    <x-header title="Diseño de Base de Concreto para Vibración"></x-header>
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
                                        <th class="px-4 py-2">Unidad</th>
                                    </tr>
                                </thead>
                                <tbody class="text-center">
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Peso del equipo</th>
                                        <th class="px-4 py-2">Peq</th>
                                        <th class="px-4 py-2 text-right">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="pesoEquipo" name="pesoEquipo" type="number" value="1.4"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left">toneladas</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Factor de seguridad</th>
                                        <th class="px-4 py-2">Fs</th>
                                        <th class="px-4 py-2 text-right">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="factorSeguridad" name="factorSeguridad" type="number"
                                                value="3.0" step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left">-</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Frecuencia del equipo</th>
                                        <th class="px-4 py-2">Feq</th>
                                        <th class="px-4 py-2 text-right">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="frecuenciaEquipo" name="frecuenciaEquipo" type="number"
                                                value="60" step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left">Hz</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Capacidad del suelo</th>
                                        <th class="px-4 py-2">Cs</th>
                                        <th class="px-4 py-2 text-right">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="sueloCapacidad" name="sueloCapacidad" type="number" value="10"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left">toneladas/m²</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Coeficiente de fricción</th>
                                        <th class="px-4 py-2">μ</th>
                                        <th class="px-4 py-2 text-right">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="coefFriccion" name="coefFriccion" type="number" value="0.6"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left">-</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Largo de la base</th>
                                        <th class="px-4 py-2">L</th>
                                        <th class="px-4 py-2 text-right">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="baseLado" name="baseLado" type="number" value="1"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Ancho de la base</th>
                                        <th class="px-4 py-2">B</th>
                                        <th class="px-4 py-2 text-right">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="baseAncho" name="baseAncho" type="number" value="2"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left">m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="px-4 py-2">Altura de la base</th>
                                        <th class="px-4 py-2">H</th>
                                        <th class="px-4 py-2 text-right">
                                            <input
                                                class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                id="altura" name="altura" type="number" value=".4"
                                                step="any" min="0" required />
                                        </th>
                                        <th class="px-4 py-2 text-left">m</th>
                                    </tr>
                                    <tr>
                                        <th><button id="calcular"
                                                class="bg-blue-600 hover:bg-blue-500 border-2xl border-blue-800 py-2 px-2 text-xm mt-2">Calcular</button>
                                        </th>
                                    </tr>
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
                                <thead class="bg-gray-200 dark:bg-gray-800">
                                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                        <th class="px-4 py-2 text-left text-xl" colspan="4">Resultados de la Base
                                        </th>
                                    </tr>
                                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                                        <th class="px-8 py-2 text-xl" scope="col">Condición</th>
                                        <th class="px-4 py-2 text-xl" scope="col">Resultado</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                                    <!-- Resultados de la base -->
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Largo de la base</td>
                                        <td class="px-4 py-2 text-center"><span id="resultadoLargo">0</span> m</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Ancho de la base</td>
                                        <td class="px-4 py-2 text-center"><span id="resultadoAncho">0</span> m</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Altura de la base</td>
                                        <td class="px-4 py-2 text-center"><span id="resultadoAltura">0</span> m</td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Frecuencia natural</td>
                                        <td class="px-4 py-2 text-center"><span id="resultadoFrecuencia">0</span> Hz
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">Esfuerzo actuante sobre el terreno</td>
                                        <td class="px-4 py-2 text-center"><span id="esfuerzo">0</span> Tn/m2
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">FSV</td>
                                        <td class="px-4 py-2 text-center"><span id="resultadoFSVolcamiento">0</span>
                                        </td>
                                    </tr>
                                    <tr class="bg-gray-100 dark:bg-gray-600">
                                        <td class="px-8 py-2">FSD</td>
                                        <td class="px-4 py-2 text-center"><span id="resultadoFSDeslizacion">0</span>
                                        </td>
                                        </td> -->
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
                // Entradas en toneladas y metros
                const pesoEquipo = parseFloat(document.getElementById('pesoEquipo').value); // toneladas
                const factorSeguridad = parseFloat(document.getElementById('factorSeguridad').value);
                const frecuenciaEquipo = parseFloat(document.getElementById('frecuenciaEquipo')
                .value); // Hz
                const sueloCapacidad = parseFloat(document.getElementById('sueloCapacidad')
                .value); // toneladas/m²
                const coefFriccion = parseFloat(document.getElementById('coefFriccion').value);
                const baseLado = parseFloat(document.getElementById('baseLado').value); // metros (Largo)
                const baseAncho = parseFloat(document.getElementById('baseAncho').value); // metros (Ancho)
                const altura = parseFloat(document.getElementById('altura')
                .value); // metros (Altura inicial)

                // Cálculo del peso de la base (aproximadamente 3 a 5 veces el peso del equipo)
                const pesoBase = pesoEquipo * factorSeguridad; // toneladas

                // Volumen de la base (considerando un concreto de 2.4 toneladas/m³)
                let volumenBase = baseLado * baseAncho * altura;

                // Ajuste de dimensiones según capacidad del suelo
                while ((pesoBase / (baseLado * baseAncho)) > sueloCapacidad) {
                    baseLado *= 1.05;
                    baseAncho *= 1.05;
                }

                const esfuerzo = pesoBase / (baseLado * baseAncho);

                // Cálculo de la frecuencia natural de la base
                let masaBase = (volumenBase * 2.4 * 1000) / 9.81; // Convertir toneladas a kg
                let rigidezBase = (pesoBase * 1000 / (baseLado + baseAncho)) *
                1000; // Estimación de rigidez (N/m)
                let frecuenciaNatural = (1 / (2 * Math.PI)) * Math.sqrt(rigidezBase / masaBase); // Hz

                // Ajuste de altura si la frecuencia natural está cerca de la del equipo
                while (Math.abs(frecuenciaEquipo / frecuenciaNatural) < 2) { // Evitar resonancia
                    altura += 0.1;
                    volumenBase = baseLado * baseAncho * altura;
                    masaBase = (volumenBase * 2.4 * 1000) / 9.81;
                    frecuenciaNatural = (1 / (2 * Math.PI)) * Math.sqrt(rigidezBase / masaBase);
                }

                // Verificación de estabilidad contra volcamiento
                const momentoEstabilizador = pesoBase * (baseAncho / 2);
                const momentoVolcador = pesoEquipo * (baseAncho / 4); // Estimación de momento volcador
                const fsVolc = momentoEstabilizador / momentoVolcador;

                // Verificación de estabilidad contra deslizamiento
                const fuerzaFriccion = coefFriccion * pesoBase * 1000 * 9.81; // Convertir a Newtons
                const fuerzaDinamica = pesoEquipo * 1000 * 9.81 *
                0.1; // Estimación de fuerza dinámica horizontal
                const fsDesl = fuerzaFriccion / fuerzaDinamica;

                // Mostrar los resultados
                document.getElementById("resultadoLargo").innerHTML = baseLado.toFixed(2);
                document.getElementById("resultadoAncho").innerHTML = baseAncho.toFixed(2);
                document.getElementById("resultadoAltura").innerHTML = altura.toFixed(2);
                document.getElementById("esfuerzo").innerHTML = esfuerzo.toFixed(2);
                document.getElementById("resultadoFrecuencia").innerHTML = frecuenciaNatural.toFixed(2);
                document.getElementById("resultadoFSVolcamiento").innerHTML = fsVolc.toFixed(2);
                document.getElementById("resultadoFSDeslizacion").innerHTML = fsDesl.toFixed(2);
            });

        });
    </script>
</x-app-layout>
