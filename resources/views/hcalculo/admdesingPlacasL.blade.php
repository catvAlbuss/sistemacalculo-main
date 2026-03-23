<x-calc-layout title="Diseño de placas en L">
    @pushOnce("styles")
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css" />
    @endpushOnce
    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <!-- Formulario -->
                <div class="w-full md:w-1/3">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Datos Generales</h3>
                        <div class="overflow-auto">
                            <div class="text-gray-950 dark:text-white d-flex justify-content-between">
                                <h3 class="text-gray-950 dark:text-white">SOLICITACIONES DE CARGA</h3>
                                <button
                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                    data-target="content1" onclick="toggleContent('content1')">ver /
                                    ocultar</button>
                            </div>
                            <div class="card-body p-3 m-0 hidden" class="collapsible-content" id="content1">
                                <div class="d-flex flex-column">
                                    <!-- TABLA 1 -->
                                    <div class="d-flex flex-column">
                                        <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 mb-2"
                                            data-target="solicitudCargaT1"
                                            data-name="tabla1-solicitud-carga">
                                            Generar IMG
                                        </button>
                                        <div id="solicitudCargaT1"></div>
                                        <div class="d-flex justify-content-start">
                                            <button id="saveDataBtn1"
                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                        </div>
                                    </div>
                                    <!-- TABLA 2 -->
                                    <div class="d-flex flex-column mb-5">
                                        <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 mb-2"
                                            data-target="solicitudCargaT2"
                                            data-name="tabla2-solicitud-carga">
                                            Generar IMG
                                        </button>
                                        <div id="solicitudCargaT2" class="table-container"></div>
                                        <div class="d-flex justify-content-start">
                                            <button id="saveDataBtn2"
                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Ver
                                                resultados</button>
                                        </div>
                                    </div>
                                    <!-- TABLA 3 -->
                                    <div class="d-flex flex-column">
                                        <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 mb-2"
                                            data-target="solicitudCargaT3"
                                            data-name="tabla3-solicitud-carga">
                                            Generar IMG
                                        </button>
                                        <div id="solicitudCargaT3" class="table-container"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="overflow-auto">
                            <div class="col-md-2 mt-3" id="formColumn">
                                <div class="d-flex justify-content-between align-items-center">
                                    <button class="btn btn-primary" type="button" id="toggleFormButton">
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                </div>
                                <div id="formContainer" class="mt-1"
                                    style="display: block; overflow-y: auto; max-height: 400px;">
                                    <!-- form en js -->
                                </div>
                            </div>
                        </div>
                        <script>
                            function toggleContent(id) {
                                const content = document.getElementById(id);
                                content.classList.toggle('hidden');
                            }
                        </script>
                    </div>
                </div>

                <!-- Resultados -->
                <div class="w-full md:w-2/3 px-4 mt-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Resultados</h3>
                        <div class="overflow-x-auto">
                            <div class="row">
                                <div class="col-md-10 p-0 mt-3" id="resultadosContainer">
                                    <!-- -------Diseño por Flexión------- -->
                                    <div class="card card-info p-0 m-0">
                                        <div class="text-gray-950 dark:text-white d-flex justify-content-between">
                                            <h3 class="text-gray-950 dark:text-white">DISEÑO POR FLEXIÓN</h3>
                                            <button
                                                class="bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                data-target="content2" onclick="contenedorFlexion('content2')">ver /
                                                ocultar</button>
                                        </div>
                                        <!-- Tablas interiores -->
                                        <div class="card-body p-0 m-0 hidden" class="collapsible-content"
                                            id="content2">
                                            <!-- <div style="width: 100%; height: 500px;" class="mb-5 d-none">
                                                    <canvas id="graphDF" width="500" height="500"></canvas>
                                                </div> -->
                                            <!-- Tabla Análisis en Dirección "x" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "X"
                                                    <!-- <button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-5"
                                                        data-target="contentDFx">ver / ocultar</button> -->
                                                    <!-- <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 mb-2"
                                                        data-target="flexDesingT1X"
                                                        data-name="flexion_tabla1_x">
                                                        Generar IMG
                                                    </button> -->
                                                </div>
                                                <div class="card-body collapsible-content d-none" id="contentDFx">
                                                    <div class="d-flex flex-column">
                                                        <!-- TABLA 1 -->
                                                        <div class="d-flex flex-column mb-5">
                                                            <div class="d-flex justify-content-between items-center mb-2">
                                                                <!-- <span>Tabla 2 X</span> -->
                                                                <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                    data-target="flexDesingT1X"
                                                                    data-name="Diseno_flexion_tabla1_x">
                                                                    Generar IMG
                                                                </button>
                                                            </div>
                                                            <div id="flexDesingT1X"></div>
                                                            <div class="d-flex justify-content-start">
                                                                <button id="saveDataBtnDF1X"
                                                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Ver
                                                                    tablas
                                                                    siguientes</button>
                                                            </div>
                                                        </div>
                                                        <!-- TABLA 2 -->
                                                        <div class="d-flex flex-column mb-5">
                                                            <div class="d-flex justify-content-between items-center mb-2">
                                                                <!-- <span>Tabla 2 X</span> -->
                                                                <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                    data-target="flexDesingT2X"
                                                                    data-name="Diseno_flexion_tabla2_x">
                                                                    Generar IMG
                                                                </button>
                                                            </div>
                                                            <div id="flexDesingT2X" class="table-container"></div>
                                                            <div class="d-flex justify-content-start">
                                                                <button id="saveDataBtnDF2X"
                                                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Guardar
                                                                    datos
                                                                    (necesario)</button>
                                                            </div>
                                                        </div>
                                                        <!-- TABLA 3 -->
                                                        <div class="d-flex flex-column mb-5">
                                                            <div class="d-flex justify-content-between items-center mb-2">
                                                                <!-- <span>Tabla 3 X</span> -->
                                                                <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                    data-target="flexDesingT3X"
                                                                    data-name="Diseno_flexion_tabla3_x">
                                                                    Generar IMG
                                                                </button>
                                                            </div>
                                                            <div id="flexDesingT3X" class="table-container"></div>
                                                            <div class="d-flex justify-content-start">
                                                                <!-- <button id="saveDataBtnDF3X" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Guardar Datos Iniciales</button> -->
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- Tabla Análisis en Dirección "y" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "Y"
                                                    <!-- <button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-5"
                                                        data-target="contentDFy">ver / ocultar</button> -->
                                                    <!-- <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 mb-2"
                                                        data-target="contentDFy"
                                                        data-name="diseno-flexion-direccion-y">
                                                        Generar IMG
                                                    </button> -->
                                                </div>
                                                <div class="card-body collapsible-content d-none" id="contentDFy">
                                                    <div class="d-flex flex-column">
                                                        <div class="d-flex flex-column">
                                                            <!-- TABLA 1 -->
                                                            <div class="d-flex flex-column mb-5">
                                                                <div class="d-flex justify-content-between items-center mb-2">
                                                                    <!-- <span>Tabla 1 Y</span> -->
                                                                    <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                        data-target="flexDesingT1Y"
                                                                        data-name="Diseno_flexion_tabla1_y">
                                                                        Generar IMG
                                                                    </button>
                                                                </div>
                                                                <div id="flexDesingT1Y" class="table-container"></div>
                                                                <div class="d-flex justify-content-start">
                                                                    <button id="saveDataBtnDF1Y"
                                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Ver tablas siguientes</button>
                                                                </div>
                                                            </div>
                                                            <!-- TABLA 2 -->
                                                            <div class="d-flex flex-column mb-5">
                                                                <div class="d-flex justify-content-between items-center mb-2">
                                                                    <!-- <span>Tabla 2 Y</span> -->
                                                                    <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                        data-target="flexDesingT2Y"
                                                                        data-name="Diseno_flexion_tabla2_y">
                                                                        Generar IMG
                                                                    </button>
                                                                </div>
                                                                <div id="flexDesingT2Y" class="table-container"></div>
                                                                <div class="d-flex justify-content-start">
                                                                    <button id="saveDataBtnDF2Y"
                                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Guardar
                                                                        Datos
                                                                        (necesario)</button>
                                                                </div>
                                                            </div>
                                                            <!-- TABLA 3 -->
                                                            <div class="d-flex flex-column mb-5">
                                                                <div class="d-flex justify-content-between items-center mb-2">
                                                                    <!-- <span>Tabla 3 Y</span> -->
                                                                    <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                        data-target="flexDesingT3Y"
                                                                        data-name="Diseno_flexion_tabla3_y">
                                                                        Generar IMG
                                                                    </button>
                                                                </div>
                                                                <div id="flexDesingT3Y" class="table-container"></div>
                                                                <div class="d-flex justify-content-start">
                                                                    <!-- <button id="saveDataBtnDF3X" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Guardar Datos Iniciales</button> -->
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <script>
                                            function contenedorFlexion(id) {
                                                const content = document.getElementById(id);
                                                content.classList.toggle('hidden');
                                            }
                                        </script>
                                    </div>
                                    <!-- -------end Diseño por Flexión------- -->

                                    <!-- -------Diseño por Corte------- -->
                                    <div class="card card-info p-0 m-0">
                                        <div class="text-gray-950 dark:text-white d-flex justify-content-between">
                                            <h3 class="text-gray-950 dark:text-white">DISEÑO POR CORTE</h3>
                                            <button
                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                data-target="content3" onclick="contenedorCorte('content3')">ver /
                                                ocultar</button>
                                        </div>
                                        <!-- Tablas interiores -->
                                        <div class="card-body p-0 m-0 hidden" class="collapsible-content"
                                            id="content3">
                                            <!-- <div style="width: 100%; height: 500px;" class="mb-5 d-none">
                                                    <canvas id="graphDF" width="500" height="500"></canvas>
                                                </div> -->
                                            <!-- Tabla Análisis en Dirección "x" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "X"
                                                    <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                        data-target="contentDCx"
                                                        data-name="Diseno_corte_x">
                                                        Generar IMG
                                                    </button>
                                                </div>
                                                <div class="card-body collapsible-content d-none" id="contentDCx">
                                                    <!-- TABLA 1 -->
                                                    <div class="d-flex flex-column mb-5">
                                                        <!-- <div class="d-flex justify-content-between items-center mb-2">
                                                            <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                data-target="cutDesingT1X"
                                                                data-name="corte_tabla1_x">
                                                                Generar IMG
                                                            </button>
                                                        </div> -->
                                                        <div id="cutDesingT1X" class="table-container"></div>
                                                        <div class="d-flex justify-content-start">
                                                            <button id="saveDataBtnDC1X"
                                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                                        </div>
                                                    </div>
                                                    <!-- TABLA 2 -->
                                                    <div class="d-flex flex-column mb-5">
                                                        <!-- <div class="d-flex justify-content-between items-center mb-2">
                                                            <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                data-target="cutDesingT2X"
                                                                data-name="corte_tabla2_x">
                                                                Generar IMG
                                                            </button>
                                                        </div> -->
                                                        <div id="cutDesingT2X" class="table-container"></div>
                                                        <div class="d-flex justify-content-start">
                                                            <button id="saveDataBtnDC2X"
                                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                                        </div>
                                                    </div>
                                                    <!-- TABLA 3 -->
                                                    <div class="d-flex flex-column mb-5">
                                                        <!-- <div class="d-flex justify-content-between items-center mb-2">
                                                            <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                data-target="cutDesingT3X"
                                                                data-name="corte_tabla3_x">
                                                                Generar IMG
                                                            </button>
                                                        </div> -->
                                                        <div id="cutDesingT3X" class="table-container"></div>
                                                        <div class="d-flex justify-content-start">
                                                            <button id="saveDataBtnDC3X"
                                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Esquema
                                                                Armado
                                                                Final</button>
                                                        </div>
                                                    </div>
                                                    <!-- TABLA 4 -->
                                                    <div class="d-flex flex-column mb-5">
                                                        <!-- <div class="d-flex justify-content-between items-center mb-2">
                                                            <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                data-target="cutDesingT4X"
                                                                data-name="corte_tabla4_x">
                                                                Generar IMG
                                                            </button>
                                                        </div> -->
                                                        <div id="cutDesingT4X" class="table-container"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- Tabla Análisis en Dirección "y" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "Y"
                                                    <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                        data-target="contentDCy"
                                                        data-name="Diseno_corte_y">
                                                        Generar IMG
                                                    </button>
                                                </div>
                                                <div class="card-body collapsible-content d-none" id="contentDCy">
                                                    <div class="d-flex flex-column">
                                                        <!-- TABLA 1 -->
                                                        <div class="d-flex flex-column mb-5">
                                                            <!-- <div class="d-flex justify-content-between items-center mb-2">
                                                                <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                    data-target="cutDesingT1Y"
                                                                    data-name="corte_tabla1_y">
                                                                    Generar IMG
                                                                </button>
                                                            </div> -->
                                                            <div id="cutDesingT1Y" class="table-container"></div>
                                                            <div class="d-flex justify-content-start">
                                                                <button id="saveDataBtnDC1Y"
                                                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                                            </div>
                                                        </div>
                                                        <!-- TABLA 2 -->
                                                        <div class="d-flex flex-column mb-5">
                                                            <!-- <div class="d-flex justify-content-between items-center mb-2">
                                                                <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                    data-target="cutDesingT2Y"
                                                                    data-name="corte_tabla2_y">
                                                                    Generar IMG
                                                                </button>
                                                            </div> -->
                                                            <div id="cutDesingT2Y" class="table-container"></div>
                                                            <div class="d-flex justify-content-start">
                                                                <button id="saveDataBtnDC2Y"
                                                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                                            </div>
                                                        </div>
                                                        <!-- TABLA 3 -->
                                                        <div class="d-flex flex-column mb-5">
                                                            <!-- <div class="d-flex justify-content-between items-center mb-2">
                                                                <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                    data-target="cutDesingT3Y"
                                                                    data-name="corte_tabla3_y">
                                                                    Generar IMG
                                                                </button>
                                                            </div> -->
                                                            <div id="cutDesingT3Y" class="table-container"></div>
                                                            <div class="d-flex justify-content-start">
                                                                <button id="saveDataBtnDC3Y"
                                                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Esquema
                                                                    Armado
                                                                    Final</button>
                                                            </div>
                                                        </div>
                                                        <!-- TABLA 4 -->
                                                        <div class="d-flex flex-column mb-5">
                                                            <!-- <div class="d-flex justify-content-between items-center mb-2">
                                                                <button class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                                    data-target="cutDesingT4Y"
                                                                    data-name="corte_tabla4_y">
                                                                    Generar IMG
                                                                </button>
                                                            </div> -->
                                                            <div id="cutDesingT4Y" class="table-container"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <script>
                                            function contenedorCorte(id) {
                                                const content = document.getElementById(id);
                                                content.classList.toggle('hidden');
                                            }
                                        </script>
                                    </div>
                                    <!-- -------end Diseño por Corte------- -->

                                    <!-- -------Diagramas de Interacción------- -->
                                    <div class="card bg-info p-0 m-0">
                                        <div class="text-gray-950 dark:text-white d-flex justify-content-between">
                                            <h3 class="text-gray-950 dark:text-white">DIAGRAMAS DE INTERACCIÓN</h3>
                                            <button
                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                data-target="content4" onclick="contenedorInteraccion('content4')">ver /
                                                ocultar</button>
                                        </div>
                                        <!-- Tablas interiores -->
                                        <div class="card-body p-0 m-0 hidden" class="collapsible-content"
                                            id="content4">
                                            <!-- <div style="width: 100%; height: 500px;" class="mb-5 d-none">
                                                    <canvas id="graphDF" width="500" height="500"></canvas>
                                                </div> -->
                                            <!-- Tabla Análisis en Dirección "x" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "X" <button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-5"
                                                        data-target="contentDIx">ver / ocultar</button></div>
                                                <div class="card-body collapsible-content d-none" id="contentDIx">
                                                    <div class="d-flex flex-column">
                                                        <div class="d-flex flex-column mb-5">
                                                            <div id="diT1X" class="table-container"></div>
                                                            <div class="d-flex justify-content-start">
                                                                <button id="saveDataBtnDI1X"
                                                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                                            </div>
                                                        </div>
                                                        <div class="d-flex flex-column mb-5">
                                                            <div id="diT2X" class="table-container"></div>
                                                            <!-- <div class="d-flex justify-content-start">
                                                                        <button id="saveDataBtnDI2X" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                                                    </div> -->
                                                        </div>
                                                        <div class="d-flex flex-column mb-5">
                                                            <div id="diT3X" class="table-container"></div>
                                                            <!-- <div class="d-flex justify-content-start">
                                                                        <button id="saveDataBtnDC3X" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Ancho Efectivo del Ala</button>
                                                                    </div> -->
                                                        </div>
                                                        <!-- <div class="d-flex flex-column mb-5">
                                                                    <div id="cutDesingT4X" class="table-container"></div>
                                                                </div> -->
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- Tabla Análisis en Dirección "y" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "Y" <button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-5"
                                                        data-target="contentDIy">ver / ocultar</button></div>
                                                <div class="card-body collapsible-content d-none" id="contentDIy">
                                                    <div class="d-flex flex-column">
                                                        <div class="d-flex flex-column mb-5">
                                                            <div id="diT1Y" class="table-container"></div>
                                                            <div class="d-flex justify-content-start">
                                                                <button id="saveDataBtnDI1Y"
                                                                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                                            </div>
                                                        </div>
                                                        <div class="d-flex flex-column mb-5">
                                                            <div id="diT2Y" class="table-container"></div>
                                                            <!-- <div class="d-flex justify-content-start">
                                                                        <button id="saveDataBtnDI2Y" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                                                    </div> -->
                                                        </div>
                                                        <div class="d-flex flex-column mb-5">
                                                            <div id="diT3Y" class="table-container"></div>
                                                            <!-- <div class="d-flex justify-content-start">
                                                                        <button id="saveDataBtnDI3Y" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Esquema Armado Final</button>
                                                                    </div> -->
                                                        </div>
                                                        <!-- <div class="d-flex flex-column mb-5">
                                                                    <div id="cutDesingT4Y" class="table-container"></div>
                                                                </div> -->
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- Diagramas -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Diagramas de
                                                    Interacción</div>
                                                <div class="card-body">
                                                    <div class="d-flex flex-column" id="diagramsContainer">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <script>
                                            function contenedorInteraccion(id) {
                                                const content = document.getElementById(id);
                                                content.classList.toggle('hidden');
                                            }
                                        </script>
                                    </div>
                                    <!-- -------end Diagramas de Interacción------- -->

                                    <!-- -------Verificación del agrietamiento------- -->
                                    <div class="card card-info p-0 m-0">
                                        <div class="text-gray-950 dark:text-white d-flex justify-content-between">
                                            <h3 class="card-title">VERIFCACIÓN DEL AGRIETAMIENTO</h3>
                                            <button
                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                data-target="content5" onclick="contenedorAgrietamiento('content5')">ver /
                                                ocultar</button>
                                        </div>
                                        <!-- Tablas interiores -->
                                        <div class="card-body p-0 m-0 hidden" class="collapsible-content"
                                            id="content5">

                                            <!-- <div style="width: 100%; height: 500px;" class="mb-5 d-none">
                                                    <canvas id="graphDF" width="500" height="500"></canvas>
                                                </div> -->
                                            <!-- Tabla Análisis en Dirección "x" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "X" <button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-5"
                                                        data-target="contentVAx">ver / ocultar</button></div>
                                                <div class="card-body collapsible-content d-none" id="contentVAx">

                                                    <div class="d-flex flex-column">
                                                        <div id="vaT1X" class="table-container"></div>
                                                    </div>

                                                </div>
                                            </div>
                                            <!-- Tabla Análisis en Dirección "y" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "Y" <button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-5"
                                                        data-target="contentVAy">ver / ocultar</button></div>
                                                <div class="card-body collapsible-content d-none" id="contentVAy">
                                                    <div class="d-flex flex-column">
                                                        <div id="vaT1Y" class="table-container"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <script>
                                            function contenedorAgrietamiento(id) {
                                                const content = document.getElementById(id);
                                                content.classList.toggle('hidden');
                                            }
                                        </script>
                                    </div>
                                    <!-- -------Verificación del agrietamiento------- -->

                                    <!-- -------Diseño por Compresión Pura------- -->
                                    <div class="card card-info p-0 m-0">
                                        <div class="text-gray-950 dark:text-white d-flex justify-content-between">
                                            <h3 class="card-title">DISEÑO POR COMPRESIÓN PURA</h3>
                                            <button
                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                data-target="content6" onclick="contenedorComprensionPura('content6')">ver /
                                                ocultar</button>
                                        </div>
                                        <!-- Tablas interiores -->
                                        <div class="card-body p-0 m-0 hidden" class="collapsible-content" id="content6">
                                            <!-- <div style="width: 100%; height: 500px;" class="mb-5 d-none">
                                                    <canvas id="graphDF" width="500" height="500"></canvas>
                                                </div> -->
                                            <!-- Tabla Análisis en Dirección "x" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "X" <button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-5"
                                                        data-target="contentDCPx">ver / ocultar</button></div>
                                                <div class="card-body collapsible-content d-none" id="contentDCPx">
                                                    <div class="d-flex flex-column">
                                                        <div id="dcpT1X" class="table-container"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- Tabla Análisis en Dirección "y" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "Y" <button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-5"
                                                        data-target="contentDCPy">ver / ocultar</button></div>
                                                <div class="card-body collapsible-content d-none" id="contentDCPy">
                                                    <div class="d-flex flex-column">
                                                        <div id="dcpT1Y" class="table-container"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <script>
                                            function contenedorComprensionPura(id) {
                                                const content = document.getElementById(id);
                                                content.classList.toggle('hidden');
                                            }
                                        </script>
                                    </div>
                                    <!-- -------Diseño por Compresión Pura  ------- -->

                                    <!-- -------Diseño por Deslizamiento------- -->
                                    <div class="card card-info p-0 m-0">
                                        <div class="text-gray-950 dark:text-white d-flex justify-content-between">
                                            <h3 class="card-title">DISEÑO POR DESLIZAMIENTO</h3>
                                            <button
                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                data-target="content7" onclick="contenedorDeslizamiento('content7')">ver /
                                                ocultar</button>
                                        </div>
                                        <!-- Tablas interiores -->
                                        <div class="card-body p-0 m-0 hidden" class="collapsible-content" id="content7">
                                            <!-- <div style="width: 100%; height: 500px;" class="mb-5 d-none">
                                                    <canvas id="graphDF" width="500" height="500"></canvas>
                                                </div> -->
                                            <!-- Tabla Análisis en Dirección "x" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "X" <button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-5"
                                                        data-target="contentDDx">ver / ocultar</button></div>
                                                <div class="card-body collapsible-content d-none" id="contentDDx">
                                                    <div class="d-flex flex-column">
                                                        <div id="ddT1X" class="table-container"></div>
                                                        <div class="d-flex justify-content-start">
                                                            <button id="saveDataBtnDD1X"
                                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                                        </div>
                                                    </div>
                                                    <div class="d-flex flex-column mb-5">
                                                        <div id="ddT2X" class="table-container"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- Tabla Análisis en Dirección "y" -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Análisis en
                                                    dirección "Y" <button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-5"
                                                        data-target="contentDDy">ver / ocultar</button></div>
                                                <div class="card-body collapsible-content d-none" id="contentDDy">
                                                    <div class="d-flex flex-column">
                                                        <div id="ddT1Y" class="table-container"></div>
                                                        <div class="d-flex justify-content-start">
                                                            <button id="saveDataBtnDD1Y"
                                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                                        </div>
                                                    </div>
                                                    <div class="d-flex flex-column mb-5">
                                                        <div id="ddT2Y" class="table-container"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <script>
                                            function contenedorDeslizamiento(id) {
                                                const content = document.getElementById(id);
                                                content.classList.toggle('hidden');
                                            }
                                        </script>
                                    </div>
                                    <!-- -------Diseño por Deslizamiento  ------- -->

                                    <!-- -------Efecto Local - Carga Puntual------- -->
                                    <div class="card card-info p-0 m-0">
                                        <div class="text-gray-950 dark:text-white d-flex justify-content-between">
                                            <h3 class="card-title">EFECTO LOCAL - CARGA PUNTUAL</h3>
                                            <button
                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                                data-target="content8" onclick="contenedorCargaPuntual('content8')">ver /
                                                ocultar</button>
                                        </div>
                                        <!-- Tablas interiores -->
                                        <div class="card-body p-0 m-0 hidden" class="collapsible-content" id="content8">
                                            <!-- <div style="width: 100%; height: 500px;" class="mb-5 d-none">
                                                    <canvas id="graphDF" width="500" height="500"></canvas>
                                                </div> -->
                                            <div class="card m-0">
                                                <div
                                                    class="text-gray-950 dark:text-white d-flex justify-content-between">
                                                    Efecto Local -
                                                    Carga Puntual<button
                                                        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mr-5"
                                                        data-target="contentEL">ver / ocultar</button></div>
                                                <div class="card-body collapsible-content d-none" id="contentEL">
                                                    <div class="d-flex flex-column">
                                                        <div id="elT1" class="table-container"></div>
                                                        <div class="d-flex justify-content-start">
                                                            <button id="saveDataBtnEL1X"
                                                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Siguiente</button>
                                                        </div>
                                                    </div>
                                                    <div class="d-flex flex-column mb-5">
                                                        <div id="elT2" class="table-container"></div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                        <script>
                                            function contenedorCargaPuntual(id) {
                                                const content = document.getElementById(id);
                                                content.classList.toggle('hidden');
                                            }
                                        </script>
                                        <!-- -------Efecto Local - Carga Puntual------- -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    </div>

    @pushOnce("scripts")
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js"></script>
    @vite("resources/js/adm_desing_placasL.js")
    @endpushOnce
</x-calc-layout>