<x-app-layout>
  <x-header title="Cimentacion 2.0"></x-header>
  @pushOnce('styles')
    <link href="https://netdna.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.css" rel="stylesheet">
  @endpushOnce

  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="zapatas2Form">
                @csrf
                <table class="w-full table-auto px-6 text-gray-800 dark:text-white">
                  <thead class="bg-white dark:bg-gray-800">
                    <tr class="text-center">
                      <th class="px-4 py-2">Nombre</th>
                      <th class="px-4 py-2">Simb.</th>
                      <th class="px-4 py-2">Entrada</th>
                      <th class="px-4 py-2">Unidad <br> Medida</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="px-4 py-2">-</td>
                      <td class="px-4 py-2">Df</td>
                      <td class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="dF" name="dF" type="number" value="2" step="any" required></td>
                      <td class="px-4 py-2">-</td>
                    </tr>
                    <tr>
                      <td class="px-4 py-2">Peso Especifico</td>
                      <td class="px-4 py-2">𝛾<sub>e</sub></td>
                      <td class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="pesoEspecifico" name="pesoEspecifico" type="number" value="1.8" step="any"
                          required></td>
                      <td class="px-4 py-2">-</td>
                    </tr>
                    <tr>
                      <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                        Propiedades</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2" colspan="4">
                        <div class="w-full">
                          <div id="datosGenerales"></div>
                        </div>
                      </td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2" colspan="4">
                        <div class="w-full">
                          <div id="combinacionDeCargas"></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th class="px-4 py-2 text-left" colspan="4">
                        <div class="input-group mb-2 inline-block text-left">
                          <button
                            class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                            id="calcular" type="submit">CARGAR</button>
                        </div>
                        <div class="input-group mb-2 inline-block text-left">
                          <button
                            class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                            id="generarPDF" type="button">PDF</button>
                        </div>
                      </th>
                    </tr>
                  </tbody>
                </table>
              </form>
            </div>
          </div>
        </div>

        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-2/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>

            <div class="overflow-x-auto" id="resultados">
              <table class="min-w-full text-gray-800 dark:text-white">
                <thead>
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Analisis
                      Estructural
                    </th>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2" id="plot" colspan="4">
                      <!-- GUI -->
                      <div>
                        <form>
                          <textarea class="hidden" name="coords" readonly></textarea>
                          <input class="hidden" name="zoom" type="range" min="5" max="40">
                        </form>
                        <ul class="mb-2 flex items-center gap-4">
                          <li id="arrows"><i class="fa fa-arrows" title="M: Mover"></i>
                          <li id="pencil"><i class="fa fa-pencil" title="L: Linea"></i>
                          <li class="hidden" id="plus"><i class="fa fa-plus" title="A: Add"></i>
                          <li id="scissors"><i class="fa fa-eraser" title="C: Eliminar"></i>
                          <li id="copy"><i class="fa fa-clone" title="D: Copiar"></i>
                          <li class="hidden" id="eye-slash"><i class="fa fa-eye-slash"
                              title="V: Toggle Visibility"></i>
                          <li id="anchor"><i class="fa fa-anchor" title="S: Toggle Grid Snap"></i>
                          </li>
                          <li><input
                              class="form-control w-20 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              id="snap" name="snap" type="number" value="0.5" step="0.1"
                              min="0" required>
                          </li>
                          <li id="crosshairs"><i class="fa fa-crosshairs" title="O: Editar Punto"></i>
                          <li><label for="x">X: </label>
                            <input
                              class="form-control w-20 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              id="x" name="x" type="number" placeholder="0" step="any" required>
                          </li>
                          <li><label for="y">Y: </label><input
                              class="form-control w-20 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              id="y" name="y" type="number" placeholder="0" step="any" required>
                          </li>
                        </ul>
                        <ul class="hidden gap-4">
                          <li id="undo"><i class="fa fa-undo" title="U: Undo"></i>
                          <li id="redo"><i class="fa fa-repeat" title="R: Redo"></i>
                          <li id="refresh"><i class="fa fa-trash-o" title="Delete All"></i>
                          </li>
                        </ul>
                        {{-- <ol class="flex gap-4">
                                                    <li><i class="fa fa-file fa-rotate-180"></i></li>
                                                    <li><i class="fa fa-trash-o"></i></li>
                                                </ol> --}}
                        <ul class="hidden">
                          <li id="color:1" style="background-color:#2020FF"><i class="fa fa-paint-brush"
                              title="Color: BLUE"></i>
                          <li id="color:2" style="background-color:#FFFFFF"><i class="fa fa-paint-brush"
                              title="Color: WHITE"></i>
                          <li id="color:3" style="background-color:#00FF00"><i class="fa fa-paint-brush"
                              title="Color: GREEN"></i>
                          <li id="color:4" style="background-color:#FFFF00"><i class="fa fa-paint-brush"
                              title="Color: YELLOW"></i>
                          <li id="color:5" style="background-color:#FF0000"><i class="fa fa-paint-brush"
                              title="Color: RED"></i>
                          <li id="color:6" style="background-color:#00FFFF"><i class="fa fa-paint-brush"
                              title="Color: CYAN"></i>
                          <li id="color:7" style="background-color:#FF00FF"><i class="fa fa-paint-brush"
                              title="Color: MAGENTA"></i>
                          <li id="color:8" style="background-color:#008080"><i class="fa fa-paint-brush"
                              title="Color: CYAN_DK"></i>
                        </ul>
                        <ul class="hidden">
                          <li id="color:9" style="background-color:#E55300"><i class="fa fa-paint-brush"
                              title="Color: ORANGE"></i>
                          <li id="color:10" style="background-color:#8B4513"><i class="fa fa-paint-brush"
                              title="Color: BROWN"></i>
                          <li id="color:11" style="background-color:#808000"><i class="fa fa-paint-brush"
                              title="Color: YELLOW_DK"></i>
                          <li id="color:12" style="background-color:#808080"><i class="fa fa-paint-brush"
                              title="Color: GRAY"></i>
                          <li id="color:13" style="background-color:#404040"><i class="fa fa-paint-brush"
                              title="Color: GRAY_DK"></i>
                          <li id="color:14" style="background-color:#87CEFA"><i class="fa fa-paint-brush"
                              title="Color: LIGHTSKYBLUE"></i>
                          <li id="color:15" style="background-color:#1E90FF"><i class="fa fa-paint-brush"
                              title="Color: DODGERBLUE"></i>
                          <li id="color:16" style="background-color:#ADD8E6"><i class="fa fa-paint-brush"
                              title="Color: LIGHTBLUE"></i>
                        </ul>
                        <ul class="hidden gap-4">

                          <li id="clipboard"><i class="fa fa-clipboard" title="Select array text"></i>
                        </ul>
                      </div>
                      <div class="relative h-[640px] w-full" id="editor"><canvas class="h-full w-full"></canvas>
                      </div>
                      <form id="calcularZapatas2">
                        @csrf
                        <button
                          class="mt-2 rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                          type="submit">CALCULAR</button>
                      </form>
                    </td>
                  </tr>
                </thead>
                <tbody id="polygons">
                </tbody>
                <tbody id="graficos">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2" colspan="4">
                      <div id="zapata1"></div>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2" colspan="4">
                      <div id="zapata2"></div>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2" colspan="4">
                      <div id="zapata3"></div>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2" colspan="4">
                      <div id="zapata4"></div>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2" colspan="4">
                      <div id="zapata5"></div>
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2" colspan="4">
                      <div id="zapata6"></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  @pushOnce('scripts')
    <script src="https://unpkg.com/virtual-webgl@1.0.6/src/virtual-webgl.js"></script>
    @vite('resources/js/adm_safecito.js')
  @endPushOnce
</x-app-layout>
