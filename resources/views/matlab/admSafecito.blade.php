<x-sheets.workbench sheet="cimentacion-v2" title="Cimentación v2" entry="resources/js/adm_safecito.js" eyebrow="Herramientas de ingeniería / Cimentaciones" class="analysis-sheet analysis-wide" data-analysis-sheet
 description="Importa las reacciones y coordenadas, selecciona las combinaciones de carga y revisa la geometría de la cimentación en el editor antes del análisis.">
 @pushOnce('styles')<link href="https://netdna.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.css" rel="stylesheet">@endpushOnce
 <x-sheets.panel title="Datos e importación" number="01" description="Completa los parámetros e importa primero las reacciones; después selecciona tres combinaciones y carga las coordenadas.">
  <div class="analysis-import sheet-legacy"><form id="zapatas2Form" class="space-y-6">
                            @csrf
                            <div
                                class="grid gap-4 lg:grid-cols-[minmax(160px,1fr)_minmax(220px,1fr)_minmax(320px,1.25fr)]">
                                <div
                                    class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                                    <div class="space-y-2">
                                        <label for="dF"
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300">Df</label>
                                        <input
                                            class="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                            id="dF" name="dF" type="number" value="2" step="any"
                                            required>
                                    </div>
                                </div>
                                <div
                                    class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                                    <div class="space-y-2">
                                        <label for="pesoEspecifico"
                                            class="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso
                                            Específico (𝛾<sub>e</sub>)</label>
                                        <input
                                            class="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                            id="pesoEspecifico" name="pesoEspecifico" type="number" value="1.8"
                                            step="any" required>
                                    </div>
                                </div>
                                <div
                                    class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                                    <div class="mb-2 flex items-center justify-between gap-3">
                                        <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">1. Excel de
                                            reacciones</p>
                                        <span
                                            class="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">Joint
                                            Reactions</span>
                                    </div>
                                     <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                                         <input id="excelFile" name="excelFile" type="file" accept=".xlsx"
                                             class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                         <button type="button" id="importarExcel"
                                             class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:border-blue-500 hover:bg-blue-400">Importar</button>
                                     </div>
                                     <div id="reactionExcelConfig"
                                         class="mt-3 hidden rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                                         <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                             Configuracion de columnas</p>
                                         <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
                                             <label class="text-xs font-medium text-gray-600 dark:text-gray-300">Hoja
                                                 <select id="reactionSheet"
                                                     class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"></select>
                                             </label>
                                             <label class="text-xs font-medium text-gray-600 dark:text-gray-300">Fila inicial
                                                 <input id="reactionStartRow" type="number" min="1" value="5"
                                                     class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                             </label>
                                             <label class="text-xs font-medium text-gray-600 dark:text-gray-300">Punto
                                                 <input id="reactionPointColumn" type="text" value="C"
                                                     class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                             </label>
                                             <label class="text-xs font-medium text-gray-600 dark:text-gray-300">Combinacion
                                                 <input id="reactionComboColumn" type="text" value="D"
                                                     class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                             </label>
                                             <label class="text-xs font-medium text-gray-600 dark:text-gray-300">F2
                                                 <input id="reactionF2Column" type="text" value="K"
                                                     class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                             </label>
                                             <label class="text-xs font-medium text-gray-600 dark:text-gray-300">MX
                                                 <input id="reactionMxColumn" type="text" value="L"
                                                     class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                             </label>
                                             <label class="text-xs font-medium text-gray-600 dark:text-gray-300">MY
                                                 <input id="reactionMyColumn" type="text" value="M"
                                                     class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                             </label>
                                         </div>
                                     </div>
                                 </div>
                            </div>

                            <div id="excelCombosContainer"
                                class="hidden rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-gray-900">
                                <div class="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                     <div>
                                         <p class="font-semibold text-gray-800 dark:text-gray-200">2. Selecciona 3
                                             combinaciones</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Se eliminan duplicados segun
                                            la hoja, fila y columna configuradas. El orden de seleccion define PD, PL y
                                            SISMO.</p>
                                     </div>
                                    <p id="excelCombosStatus"
                                        class="text-sm font-medium text-gray-600 dark:text-gray-400">Selecciona 3
                                        combinaciones.</p>
                                </div>
                                <div id="excelCombosList"
                                    class="grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-4">
                                </div>
                            </div>

                            <div id="connectivityExcelContainer"
                                class="hidden rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-gray-900">
                                <div class="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                     <div>
                                         <p class="font-semibold text-gray-800 dark:text-gray-200">3. Excel de
                                             coordenadas</p>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Cruza el identificador del
                                            primer Excel con el identificador configurado del Excel de coordenadas.</p>
                                     </div>
                                     <span
                                        class="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-200">Columnas
                                        configurables</span>
                                 </div>
                                <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                                    <input id="connectivityExcelFile" name="connectivityExcelFile" type="file"
                                        accept=".xlsx" disabled
                                        class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                     <button type="button" id="importarConnectivityExcel" disabled
                                         class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:border-blue-500 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60">Importar
                                         coordenadas</button>
                                 </div>
                                 <div id="coordinateExcelConfig"
                                     class="mt-3 hidden rounded-md border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                                     <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                         Configuracion de coordenadas</p>
                                     <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                                         <label class="text-xs font-medium text-gray-600 dark:text-gray-300">Hoja
                                             <select id="coordinateSheet"
                                                 class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"></select>
                                         </label>
                                         <label class="text-xs font-medium text-gray-600 dark:text-gray-300">Fila inicial
                                             <input id="coordinateStartRow" type="number" min="1" value="5"
                                                 class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                         </label>
                                         <label class="text-xs font-medium text-gray-600 dark:text-gray-300">Punto
                                             <input id="coordinatePointColumn" type="text" value="A"
                                                 class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                         </label>
                                         <label class="text-xs font-medium text-gray-600 dark:text-gray-300">X
                                             <input id="coordinateXColumn" type="text" value="F"
                                                 class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                         </label>
                                         <label class="text-xs font-medium text-gray-600 dark:text-gray-300">Y
                                             <input id="coordinateYColumn" type="text" value="G"
                                                 class="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-sm uppercase text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                         </label>
                                     </div>
                                 </div>
                             </div>

                            <div id="propiedadesSection"
                                class="hidden rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                                <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <p class="font-semibold text-gray-800 dark:text-gray-200">Propiedades</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Revisa aquí las propiedades
                                        dinámicas y combinaciones de carga.</p>
                                </div>
                                <div class="grid gap-4 lg:grid-cols-2">
                                    <div id="datosGenerales"
                                        class="min-h-[120px] rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                    </div>
                                    <div id="combinacionDeCargas"
                                        class="min-h-[120px] rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                    </div>
                                </div>
                            </div>

                            <div id="calculoActions" class="hidden grid gap-4 sm:grid-cols-2">
                                <button
                                    class="w-full rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                                    id="calcular" type="submit">CARGAR</button>
                                <button
                                    class="w-full rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-3 text-sm font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                                    id="generarPDF" type="button">PDF</button>
                            </div>
                        </form></div>
 </x-sheets.panel>
 <section id="resultados" class="arco-results analysis-results" aria-label="Geometría y resultados de cimentación">
  <x-sheets.panel title="Editor de cimentación" number="02" description="Revisa los puntos y contornos. Utiliza las herramientas de dibujo y calcula los resultados cuando la geometría esté lista.">
   <div id="plot" class="analysis-editor sheet-legacy">
                                            <!-- GUI -->
                                            <div>
                                                <form>
                                                    <textarea class="hidden" name="coords" readonly></textarea>
                                                    <input class="hidden" name="zoom" type="range"
                                                        min="5" max="40">
                                                </form>
                                                <ul class="mb-2 flex items-center gap-4">
                                                    <li id="arrows"><i class="fa fa-arrows" title="M: Mover"></i>
                                                    <li id="pencil"><i class="fa fa-pencil" title="L: Linea"></i>
                                                    <li class="hidden" id="plus"><i class="fa fa-plus"
                                                            title="A: Add"></i>
                                                    <li id="scissors"><i class="fa fa-eraser"
                                                            title="C: Eliminar"></i>
                                                    <li id="copy"><i class="fa fa-clone" title="D: Copiar"></i>
                                                    <li class="hidden" id="eye-slash"><i class="fa fa-eye-slash"
                                                            title="V: Toggle Visibility"></i>
                                                    <li id="anchor"><i class="fa fa-anchor"
                                                            title="S: Toggle Grid Snap"></i>
                                                    </li>
                                                    <li><input
                                                            class="form-control w-20 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                            id="snap" name="snap" type="number"
                                                            value="0.5" step="0.1" min="0" required>
                                                    </li>
                                                    <li id="crosshairs"><i class="fa fa-crosshairs"
                                                            title="O: Editar Punto"></i>
                                                    <li><label for="x">X: </label>
                                                        <input
                                                            class="form-control w-20 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                            id="x" name="x" type="number"
                                                            placeholder="0" step="any" required>
                                                    </li>
                                                    <li><label for="y">Y: </label><input
                                                            class="form-control w-20 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                            id="y" name="y" type="number"
                                                            placeholder="0" step="any" required>
                                                    </li>
                                                </ul>
                                                <ul class="hidden gap-4">
                                                    <li id="undo"><i class="fa fa-undo" title="U: Undo"></i>
                                                    <li id="redo"><i class="fa fa-repeat" title="R: Redo"></i>
                                                    <li id="refresh"><i class="fa fa-trash-o"
                                                            title="Delete All"></i>
                                                    </li>
                                                </ul>
                                                {{-- <ol class="flex gap-4">
                                                    <li><i class="fa fa-file fa-rotate-180"></i></li>
                                                    <li><i class="fa fa-trash-o"></i></li>
                                                </ol> --}}
                                                <ul class="hidden">
                                                    <li id="color:1" style="background-color:#2020FF"><i
                                                            class="fa fa-paint-brush" title="Color: BLUE"></i>
                                                    <li id="color:2" style="background-color:#FFFFFF"><i
                                                            class="fa fa-paint-brush" title="Color: WHITE"></i>
                                                    <li id="color:3" style="background-color:#00FF00"><i
                                                            class="fa fa-paint-brush" title="Color: GREEN"></i>
                                                    <li id="color:4" style="background-color:#FFFF00"><i
                                                            class="fa fa-paint-brush" title="Color: YELLOW"></i>
                                                    <li id="color:5" style="background-color:#FF0000"><i
                                                            class="fa fa-paint-brush" title="Color: RED"></i>
                                                    <li id="color:6" style="background-color:#00FFFF"><i
                                                            class="fa fa-paint-brush" title="Color: CYAN"></i>
                                                    <li id="color:7" style="background-color:#FF00FF"><i
                                                            class="fa fa-paint-brush" title="Color: MAGENTA"></i>
                                                    <li id="color:8" style="background-color:#008080"><i
                                                            class="fa fa-paint-brush" title="Color: CYAN_DK"></i>
                                                </ul>
                                                <ul class="hidden">
                                                    <li id="color:9" style="background-color:#E55300"><i
                                                            class="fa fa-paint-brush" title="Color: ORANGE"></i>
                                                    <li id="color:10" style="background-color:#8B4513"><i
                                                            class="fa fa-paint-brush" title="Color: BROWN"></i>
                                                    <li id="color:11" style="background-color:#808000"><i
                                                            class="fa fa-paint-brush" title="Color: YELLOW_DK"></i>
                                                    <li id="color:12" style="background-color:#808080"><i
                                                            class="fa fa-paint-brush" title="Color: GRAY"></i>
                                                    <li id="color:13" style="background-color:#404040"><i
                                                            class="fa fa-paint-brush" title="Color: GRAY_DK"></i>
                                                    <li id="color:14" style="background-color:#87CEFA"><i
                                                            class="fa fa-paint-brush" title="Color: LIGHTSKYBLUE"></i>
                                                    <li id="color:15" style="background-color:#1E90FF"><i
                                                            class="fa fa-paint-brush" title="Color: DODGERBLUE"></i>
                                                    <li id="color:16" style="background-color:#ADD8E6"><i
                                                            class="fa fa-paint-brush" title="Color: LIGHTBLUE"></i>
                                                </ul>
                                                <ul class="hidden gap-4">

                                                    <li id="clipboard"><i class="fa fa-clipboard"
                                                            title="Select array text"></i>
                                                </ul>
                                            </div>
                                            <div class="relative h-[640px] w-full" id="editor"><canvas
                                                    class="h-full w-full"></canvas>
                                            </div>
                                            <form id="calcularZapatas2">
                                                @csrf
                                                <button
                                                    class="mt-2 rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                                                    type="submit">CALCULAR</button>
                                            </form>
                                        </div>
  </x-sheets.panel>
  <x-sheets.panel title="Propiedades de los polígonos" number="03" description="Resumen de la geometría utilizada en el análisis.">
   <div class="analysis-table-scroll"><table class="sheet-data-table"><tbody id="polygons"></tbody></table></div>
  </x-sheets.panel>
  <x-sheets.panel title="Resultados por combinación" number="04" description="Distribución de presiones y verificaciones de las combinaciones analizadas.">
   <div class="analysis-table-scroll"><table class="sheet-data-table"><tbody id="graficos">@foreach(range(1,6) as $index)<tr><td><div id="zapata{{ $index }}" class="analysis-plot"></div></td></tr>@endforeach</tbody></table></div>
  </x-sheets.panel>
 </section>
 @pushOnce('scripts')<script src="https://cdn.jsdelivr.net/npm/exceljs/dist/exceljs.min.js"></script>@endpushOnce
</x-sheets.workbench>
