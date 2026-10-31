<!-- Dimensionamiento-->
            <div x-show="activeTab === 'dimensionamiento'">
                <div x-data="dimensionamiento()" class="cuaderno p-4 max-w-full mx-auto font-mono">
                    <!-- ENTRADAS Y SALIDAS -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <!-- DATOS: VERIFICACIONES -->
                        <section
                            class="p-4 bg-slate-50 bg-opacity-0 border border-slate-300 rounded shadow-inner col-span-1">
                            <div class="flex items-center justify-between cursor-pointer select-none mb-2"
                                @click="showgraficoverificacion = !showgraficoverificacion">
                                <h3 class="text-lg font-semibold text-gray-950 flex items-center"><i
                                        class='fas fa-flask mr-2 text-gray-950'></i>Criterios de Diseño</h3>
                                <span class="text-xs text-gray-500"
                                    x-text="showgraficoverificacion ? 'Ocultar' : 'Mostrar'"></span>
                            </div>
                            <div class="space-y-4" x-show="showgraficoverificacion">
                                <!-- Grupo de cada campo -->
                                <div class="grid grid-cols-3 gap-2 text-xs px-6 items-center mb-2">
                                    <label class="text-gray-700 col-span-2">Usar la presión activa del terreno
                                        sumando</label>
                                    <select
                                        class="text-xs px-2 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        x-model="datosdim.C94">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="solopantalla">Solo pantalla</option>
                                        <option value="Pantallazapata">Pantalla + zapata</option>
                                        <option value="pantallazapatatalud">Pantalla + zapata + talud</option>
                                        <option value="Pantallazapatataludkey">Pantalla + zapata + talud + key</option>
                                        <option value="Pantallazapatakey">Pantalla + zapata + key</option>
                                    </select>
                                </div>

                                <div class="grid grid-cols-3 gap-2 text-xs px-6 items-center mb-2">
                                    <label class="text-gray-700 col-span-2">¿Considerar la presión vertical activa del
                                        terreno?</label>
                                    <select
                                        class="text-xs px-2 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        x-model="datosdim.C95">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="si">SI</option>
                                        <option value="no">NO</option>
                                    </select>
                                </div>

                                <div class="grid grid-cols-3 gap-2 text-xs px-6 items-center mb-2">
                                    <label class="text-gray-700 col-span-2">¿Considerar la presión pasiva del
                                        terreno?</label>
                                    <select
                                        class="text-xs px-2 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        x-model="datosdim.C93">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="desde">DESDE 0.00</option>
                                        <option value="DESDECIMEN">DESDE LA CIMEN</option>
                                        <option value="DESDEELKEY">DESDE ELKEY</option>
                                        <option value="CORTADOENLACIM">CORTADO EN LA CIM</option>
                                        <option value="CORTADOENELKEY">CORTADO EN EL KEY</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>

                                <div class="grid grid-cols-3 gap-2 text-xs px-6 items-center mb-2">
                                    <label class="text-gray-700 col-span-2">¿Considerar la cohesión del suelo?</label>
                                    <select
                                        class="text-xs px-2 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        x-model="datosdim.C96">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="si">SI</option>
                                        <option value="no">NO</option>
                                    </select>
                                </div>

                                <div class="grid grid-cols-3 gap-2 text-xs px-6 items-center mb-2">
                                    <label class="text-gray-700 col-span-2">De usar dentellón este se ubicará
                                        en</label>
                                    <select
                                        class="text-xs px-2 py-1 border border-gray-300 rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        x-model="datosdim.C92">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="5.25">Extremo interior</option>
                                        <option value="2.18">En el centro</option>
                                        <option value="0.45">Extremo exterior</option>
                                    </select>
                                </div>

                                <!-- Inputs nuevos -->
                                <div class="bg-transparent">
                                    <table class="w-full table-fixed text-sm">
                                        <thead class="bg-transparent text-sm font-semibold">
                                            <tr>
                                                <th rowspan="2" class="px-6 py-3 text-center"></th>
                                                <th rowspan="2" class="px-6 py-3 text-center">Estático</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">Sísmico</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-transparent divide-y divide-gray-100 text-sm text-gray-800">
                                            <tr class="hover:bg-gray-50 transition-all duration-200">
                                                <td class="px-6 py-3 text-center">FSVe</td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSVe">
                                                </td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSVd">
                                                </td>
                                            </tr>

                                            <tr class="hover:bg-gray-50 transition-all duration-200">
                                                <td class="px-6 py-3 text-center">FSDe</td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSDe">
                                                </td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSDd">
                                                </td>
                                            </tr>

                                            <tr class="hover:bg-gray-50 transition-all duration-200">
                                                <td class="px-6 py-3 text-center">FSQadme</td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSQadme">
                                                </td>
                                                <td class="px-6 py-3 text-center">
                                                    <input type="number" step="any"
                                                        class="w-20 bg-transparent border border-gray-300 rounded text-xs px-2 py-1 text-right rounded focus:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        placeholder="0.00" x-model.number="datosdim.FSQadmd">
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </div>

                            <div class="flex gap-4 mt-4">
                                <button
                                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                    id="calcularval" x-on:click="calcularTodo()"
                                    :disabled="isCalculating || !predimData"
                                    :class="{ 'opacity-50 cursor-not-allowed': isCalculating || !predimData }">
                                    <span x-show="!isCalculating">Calcular</span>
                                    <span x-show="isCalculating">Calculando...</span>
                                </button>

                                <div x-show="resultados && Object.keys(resultados).length > 0"
                                    class="flex items-center text-green-600">
                                    <i class="fas fa-check-circle mr-2"></i>
                                    <span>Dimensionamiento completado</span>
                                </div>
                            </div>
                            <!-- Mostrar errores si los hay -->
                            <div x-show="errors && errors.length > 0"
                                class="mt-4 p-3 bg-red-100 border border-red-400 rounded">
                                <h4 class="font-bold text-red-800">Errores encontrados:</h4>
                                <ul class="list-disc ml-5 text-red-700">
                                    <template x-for="error in errors">
                                        <li x-text="error"></li>
                                    </template>
                                </ul>
                            </div>
                        </section>

                        <!-- PREDIMENSIONAMIENTO: GRAFICO AMPLIADO -->
                        <section id="grafico-dimensionamiento"
                            class="row-span-2 md:col-span-2 p-8 bg-slate-50 bg-opacity-0 border border-slate-300 rounded shadow-inner flex flex-col items-center justify-center">
                            <div class="image-container"
                                style="position: relative; width: 100%; max-width: 800px; margin: 0 auto;">
                                <style>
                                    .measurement-container {
                                        display: inline-flex;
                                        align-items: center;
                                        gap: 4px;
                                    }

                                    .measurement-input {
                                        border: 1px solid #ccc;
                                        padding: 4px 8px;
                                        font-size: 12px;
                                        width: 80px;
                                        border-radius: 4px;
                                        transition: all 0.3s ease;
                                        background: rgb(255, 238, 0);
                                        color: rgba(27, 27, 27, 0.8);
                                        text-align: right;
                                    }

                                    .measurement-input:focus {
                                        background: rgba(255, 238, 0, 0.712);
                                        box-shadow: 0 0 5px rgba(255, 251, 251, 0.3);
                                        transform: scale(1.05);
                                    }

                                    .measurement-input-result {
                                        /* border: 1px solid #9ca3af; */
                                        padding: 4px 8px;
                                        font-size: 12px;
                                        width: 80px;
                                        border-radius: 4px;
                                        /* background: #e5e7eb; */
                                        color: rgba(27, 27, 27, 0.8);
                                        text-align: right;
                                        font-weight: 600;
                                    }

                                    .measurement-unit {
                                        text-align: left;
                                        font-size: 12px;
                                        color: rgba(27, 27, 27, 0.8);
                                        font-weight: 500;
                                    }

                                    .image-container {
                                        margin-bottom: 20px;
                                        position: relative;
                                    }

                                    /* Dark mode */
                                    .dark .measurement-input {
                                        color: white;
                                    }

                                    .dark .measurement-input-result {
                                        color: white;
                                    }

                                    .dark .measurement-unit {
                                        color: #e5e7eb;
                                        font-weight: 500;
                                    }

                                    .pos-c74 {
                                        position: absolute;
                                        top: 10%;
                                        left: 48%;
                                    }

                                    .pos-e74 {
                                        position: absolute;
                                        top: 12%;
                                        left: 85%;
                                    }

                                    .pos-e79 {
                                        position: absolute;
                                        top: 40%;
                                        left: 85%;
                                    }

                                    .pos-a82 {
                                        position: absolute;
                                        top: 49%;
                                        left: 25%;
                                    }

                                    .pos-a83 {
                                        position: absolute;
                                        top: 53%;
                                        left: 25%;
                                    }

                                    .pos-a88 {
                                        position: absolute;
                                        top: 81%;
                                        left: 20%;
                                    }

                                    .pos-a89 {
                                        position: absolute;
                                        top: 86%;
                                        left: 20%;
                                    }

                                    .pos-d88 {
                                        position: absolute;
                                        top: 81%;
                                        left: 66%;
                                    }

                                    .pos-b88 {
                                        position: absolute;
                                        top: 81%;
                                        left: 42%;
                                    }

                                    .pos-b90 {
                                        position: absolute;
                                        top: 92%;
                                        left: 42%;
                                    }

                                    .pos-d89 {
                                        position: absolute;
                                        top: 86%;
                                        left: 66%;
                                    }

                                    .pos-f86 {
                                        position: absolute;
                                        top: 74.5%;
                                        left: 85.5%;
                                    }

                                    .pos-e86 {
                                        position: absolute;
                                        text-align: right;
                                        top: 68%;
                                        left: 85.5%;
                                    }

                                    .pos-f91 {
                                        position: absolute;
                                        top: 11%;
                                        left: 8%;
                                    }

                                    .pos-g93 {
                                        position: absolute;
                                        top: 20%;
                                        left: 25%;
                                    }

                                    .pos-g94 {
                                        position: absolute;
                                        top: 25%;
                                        left: 25%;
                                    }

                                    .pos-f95 {
                                        position: absolute;
                                        top: 33%;
                                        left: 10%;
                                    }

                                    /* Responsive adjustments */
                                    @media (max-width: 600px) {

                                        .measurement-input,
                                        .measurement-input-result {
                                            width: 60px;
                                            font-size: 10px;
                                        }

                                        .measurement-unit {
                                            font-size: 10px;
                                        }
                                    }
                                </style>

                                @include('muros-contencion.components.drawings.dimensionamiento')

                                <!-- Inputs and results -->
                                <div class="measurement-container pos-c74">
                                    <input type="number" x-model.number="datosdim.C74" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-e74">
                                    <input type="number" x-model.number="datosdim.E74" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-e79">
                                    <input type="number" x-model.number="datosdim.E79" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-a82">
                                    <input type="number" x-model.number="datosdim.A82" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-a83">
                                    <input type="number" x-model.number="datosdim.A83" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-a88">
                                    <input type="number" x-model.number="datosdim.A88" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-a89">
                                    <input type="number" x-model.number="datosdim.A89" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-d88">
                                    <input type="number" x-model.number="datosdim.D88" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-b88">
                                    <input type="number" x-model.number="datosdim.B88" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-b90">
                                    <input type="number" x-model.number="datosdim.B90" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-d89">
                                    <input type="number" x-model.number="datosdim.D89" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-f86">
                                    <input type="number" x-model.number="datosdim.F86" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-e86">
                                    <input type="text" x-model.number="datosdim.E86" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-f91">
                                    <input type="number" x-model.number="datosdim.F91" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-g93">
                                    <input type="number" x-model.number="datosdim.G93" disabled step="0.001"
                                        class="measurement-input-result" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-g94">
                                    <input type="number" x-model.number="datosdim.G94" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>

                                <div class="measurement-container pos-f95">
                                    <input type="number" x-model.number="datosdim.F95" step="0.001"
                                        class="measurement-input" />
                                    <span class="measurement-unit">m</span>
                                </div>
                            </div>
                        </section>

                        <!-- RESULTADOS -->
                        <section
                            class="p-4 bg-slate-100 bg-opacity-0 border border-slate-300 rounded shadow-inner mt-2">
                            <h3 class="text-lg font-semibold text-gray-950 mb-3 flex items-center"><i
                                    class='fas fa-check-circle mr-2 text-green-600'></i>Resultados</h3>
                            <!-- Tabla de Impulsión -->
                            <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                <table class="w-full table-fixed text-sm" id="tabla-dimensionamiento-resultado">
                                    <thead
                                        class="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold">
                                        <tr>
                                            <th rowspan="2" class="px-6 py-3 text-center"> </th>
                                            <th rowspan="2" class="px-6 py-3 text-center">SIN SISMO</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">CON SISMO</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">MAXIMO</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">FS</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-100 text-sm text-gray-800">
                                        <template x-for="(accesorio, idx) in verfsismo.accesorios"
                                            :key="idx">
                                            <tr class="hover:bg-gray-50 transition-all duration-200">
                                                <td class="px-6 py-3 text-center" x-text="accesorio.tipo"></td>
                                                <td class="px-6 py-3 text-center" x-text="accesorio.cantidad"></td>
                                                <td class="px-6 py-3 text-center" x-text="accesorio.leq"></td>
                                                <td class="px-6 py-3 text-center" x-text="accesorio.max"></td>
                                                <td class="px-6 py-3 text-center">
                                                    <span
                                                        x-bind:class="accesorio.fs ? 'fs-icon fs-icon-true' : 'fs-icon fs-icon-false'"
                                                        x-bind:aria-label="accesorio.fs ? 'Pass' : 'Fail'"
                                                        x-text="accesorio.fs ? '✅' : '❌'"></span>
                                                </td>
                                            </tr>
                                        </template>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
