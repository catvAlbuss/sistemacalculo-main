<x-calc-layout title="Análisis de Sección Viga T">
    <div class="py-2">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <!-- Formulario -->
                <div class="w-full md:w-1/3">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Datos de Entrada</h3>
                        <div class="overflow-auto">
                            <table class="table-auto w-full text-gray-800 dark:text-white px-6">
                                <thead class="bg-white dark:bg-gray-800">
                                    <tr class="text-center">
                                        <th class="py-2 px-4">Parámetro</th>
                                        <th class="py-2 px-4">Valor</th>
                                        <th class="py-2 px-4">Unidad</th>
                                    </tr>
                                </thead>
                                <tbody class="text-center">
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Momento Último Actuante, Mu</th>
                                        <th class="py-2 px-4">
                                            <input type="number" id="mu" value="60" step="any" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" />
                                        </th>
                                        <th class="py-2 px-4">tn-m</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Resistencia del Concreto, f'c</th>
                                        <th class="py-2 px-4">
                                            <input type="number" id="fc" value="280" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" />
                                        </th>
                                        <th class="py-2 px-4">kg/cm²</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Ancho Efectivo del Ala, bf</th>
                                        <th class="py-2 px-4">
                                            <input type="number" id="bf" value="100" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" />
                                        </th>
                                        <th class="py-2 px-4">cm</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Espesor de la Losa o Ala, hf</th>
                                        <th class="py-2 px-4">
                                            <input type="number" id="hf" value="20" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" />
                                        </th>
                                        <th class="py-2 px-4">cm</th>
                                    </tr>
                                    <tr class="bg-white dark:bg-gray-800">
                                        <th class="py-2 px-4">Peralte Efectivo de la Viga, d</th>
                                        <th class="py-2 px-4">
                                            <input type="number" id="d" value="90" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" />
                                        </th>
                                        <th class="py-2 px-4">cm</th>
                                    </tr>
                                    <tr>
                                        <th class="py-2 px-4">
                                            <button onclick="calcularComportamiento()" class="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded">
                                                Determinar Tipo de Trabajo
                                            </button>
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
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Resultado del Análisis</h3>
                        <div id="resultado" class="mt-4 p-4 rounded-lg hidden">
                            <div id="res-titulo" class="text-lg font-bold mb-2"></div>
                            <div id="res-detalle"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @pushOnce('scripts')
        <script>
            function calcularComportamiento() {
                const Mu_tnm = parseFloat(document.getElementById("mu").value);
                const fc = parseFloat(document.getElementById("fc").value);
                const bf = parseFloat(document.getElementById("bf").value);
                const hf = parseFloat(document.getElementById("hf").value);
                const d = parseFloat(document.getElementById("d").value);

                const phi = 0.9;
                const Mu_kgcm = Mu_tnm * 100000;

                const resultBox = document.getElementById("resultado");
                const resTitulo = document.getElementById("res-titulo");
                const resDetalle = document.getElementById("res-detalle");

                if (
                    isNaN(Mu_kgcm) ||
                    isNaN(fc) ||
                    isNaN(bf) ||
                    isNaN(hf) ||
                    isNaN(d) ||
                    bf <= 0 ||
                    hf <= 0 ||
                    d <= 0 ||
                    fc <= 0
                ) {
                    mostrarResultado(
                        "error",
                        "Error en los datos",
                        "Por favor, ingresa valores numéricos válidos mayores a cero."
                    );
                    return;
                }

                const discriminante = Math.pow(d, 2) - (2 * Mu_kgcm) / (phi * fc * bf);

                if (discriminante < 0) {
                    mostrarResultado(
                        "error",
                        "Sección Sobreesforzada",
                        `El momento actuante de ${Mu_tnm} tn-m supera la capacidad geométrica máxima del concreto configurado.`
                    );
                    return;
                }

                const a = d - Math.sqrt(discriminante);

                if (a <= hf) {
                    mostrarResultado(
                        "rectangular",
                        "Trabaja como Viga Rectangular",
                        `El bloque de compresión (a = ${a.toFixed(2)} cm) se encuentra dentro de la losa superior (hf = ${hf} cm). Se diseña usando el ancho total bf.`
                    );
                } else {
                    mostrarResultado(
                        "viga-t",
                        "Trabaja como Viga T Real",
                        `El bloque de compresión (a = ${a.toFixed(2)} cm) supera el espesor de la losa (hf = ${hf} cm) e invade el alma. Requiere ecuaciones de flexión compuestas.`
                    );
                }
            }

            function mostrarResultado(clase, titulo, detalle) {
                const resultBox = document.getElementById("resultado");
                const resTitulo = document.getElementById("res-titulo");
                const resDetalle = document.getElementById("res-detalle");

                const baseClasses = "result-box mt-6 p-5 rounded-lg";
                const rectangularClasses = "bg-green-100 border border-green-300 text-green-800";
                const vigaTClasses = "bg-yellow-100 border border-yellow-300 text-yellow-900";
                const errorClasses = "bg-red-100 border border-red-300 text-red-800";

                resultBox.className = baseClasses + " " + (clase === "rectangular" ? rectangularClasses : clase === "viga-t" ? vigaTClasses : errorClasses);
                resTitulo.innerText = titulo;
                resDetalle.innerText = detalle;
                resultBox.style.display = "block";
            }
        </script>
    @endpushOnce
</x-calc-layout>