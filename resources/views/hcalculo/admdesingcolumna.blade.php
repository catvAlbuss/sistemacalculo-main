<x-calc-layout title="Diseño de Columna">
  @pushOnce('styles')
    <link href="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css" rel="stylesheet" />
  @endpushOnce

  <!-- ==============================MODELS MODAL================== -->

  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="ColumnaF" method="POST" action="{{ route('columacon') }}">
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
                  <tbody class="text-center">
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" scope="row">
                        Cantidad de pisos
                      </th>
                      <td class="px-4 py-2">
                        # Piso
                      </td>
                      <td class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="piso" name="piso" type="text" value="1" placeholder="1" required />
                      </td>
                      <td class="px-4 py-2">
                        unidad
                      </td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" scope="row">
                        Esfuerzo de compresion de concreto
                      </th>
                      <td class="px-4 py-2">
                        fc
                      </td>
                      <td class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fc" name="fc" type="text" value="210" placeholder="210" required />
                      </td>
                      <td class="px-4 py-2">
                        kg/cm<sup>2</sup>
                      </td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" scope="row">
                        Esfuerzo de fluencia del acero
                      </th>
                      <td class="px-4 py-2">
                        fy
                      </td>
                      <td class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fy" name="fy" type="text" value="4200" placeholder="4200" />
                      </td>
                      <td class="px-4 py-2">
                        kg/cm<sup>2</sup>
                      </td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" scope="row">
                        Altura
                      </th>
                      <td class="px-4 py-2">
                        H
                      </td>
                      <td class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="altura" name="altura" type="text" value="0" placeholder="0" />
                      </td>
                      <td class="px-4 py-2">
                        cm
                      </td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" scope="row">
                        Longitud en eje X
                      </th>
                      <td class="px-4 py-2">
                        Lx
                      </td>
                      <td class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="L1" name="L1" type="text" value="0" placeholder="0" />
                      </td>
                      <td class="px-4 py-2">
                        cm
                      </td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" scope="row">
                        Longitud en eje Y
                      </th>
                      <td class="px-4 py-2">
                        Ly
                      </td>
                      <td class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="L2" name="L2" type="text" value="0" placeholder="0" />
                      </td>
                      <td class="px-4 py-2">
                        cm
                      </td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" scope="row">
                        Peralte efectivo en "cm"
                      </th>
                      <td class="px-4 py-2">
                        d
                      </td>
                      <td class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="d" name="d" type="text" value="0" placeholder="0" />
                      </td>
                      <td class="px-4 py-2">
                        cm
                      </td>
                    </tr>
                  </tbody>
                  <br>
                  <br>
                  <!-- Longitud Arriostrada -->
                  <div class="card-body sm:rounded-lg">
                    <div
                      class="card-header h-30 bg-gray-500 text-white sm:rounded-lg dark:bg-gray-500 dark:text-white">
                      <h1 class="text-center text-2xl font-bold decoration-indigo-500">
                        Longitud Arriostrada (Análisis en Dirección X-X)
                        <button class="rounded bg-blue-500 px-2 py-2 font-bold text-white hover:bg-blue-700"
                          id="btnLongArriosX" type="button">
                          Ver
                        </button>
                      </h1>
                    </div>
                    <div class="card-body" id="contentLongArriosX">
                      <section class="content">
                        <div class="container-fluid">
                          <div class="row justify-content-center align-items-center">
                            <div id="longitudArriostradaX"></div>
                            <button
                              class="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                              id="guardarTablaX" type="button">Guardar</button>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                  <br>
                  <br>
                  <div class="card-body sm:rounded-lg">
                    <div
                      class="card-header h-30 bg-gray-500 text-white sm:rounded-lg dark:bg-gray-500 dark:text-white">
                      <h1 class="text-center text-2xl font-bold decoration-indigo-500">
                        Longitud Arriostrada (Análisis en Dirección Y-Y)
                        <button class="rounded bg-blue-500 px-2 py-2 font-bold text-white hover:bg-blue-700"
                          id="btnLongArriosY" type="button">
                          Ver
                        </button>
                      </h1>
                    </div>
                    <div class="card-body" id="contentLongArriosY">
                      <section class="content">
                        <div class="container-fluid">
                          <div class="row justify-content-center align-items-center">
                            <div id="longitudArriostradaY"></div>
                            <button
                              class="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                              id="guardarTablaY" type="button">Guardar</button>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                  <br>
                  <br>
                  <!-- condicion ezbeltes -->
                  <div class="card-body sm:rounded-lg">
                    <div
                      class="card-header h-30 bg-gray-500 text-white sm:rounded-lg dark:bg-gray-500 dark:text-white">
                      <h1 class="text-center text-2xl font-bold decoration-indigo-500">
                        Condicion de Ezbeltez
                        <button class="rounded bg-blue-500 px-2 py-2 font-bold text-white hover:bg-blue-700"
                          id="btncez" type="button">
                          Ver
                        </button>
                      </h1>
                    </div>
                    <div class="card-body" id="contentCE">
                      <section class="content">
                        <div class="container-fluid">
                          <div class="row justify-content-center align-items-center">
                            <div id="Scrga"></div>
                            <div id="Scrga"></div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                  <br>
                  <br>
                  <!-- incluido XX -->
                  <div class="card-body sm:rounded-lg">
                    <div
                      class="card-header h-30 bg-gray-500 text-white sm:rounded-lg dark:bg-gray-500 dark:text-white">
                      <h1 class="text-center text-2xl font-bold decoration-indigo-500">
                        Diagrama de Interacción (Incluido "Ø") - Dirección X-X
                        <button class="rounded bg-blue-500 px-2 py-2 font-bold text-white hover:bg-blue-700"
                          id="btnDIIYY" type="button">
                          Ver
                        </button>
                      </h1>
                    </div>
                    <div class="card-body" id="contentDIIYY">
                      <section class="content">
                        <div class="container-fluid">
                          <div class="row justify-content-center align-items-center">
                            <div id="diagramaxx"></div>
                            <div id="myDiagramsxx"></div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                  <br>
                  <br>
                  <!-- Excluido xx -->
                  <div class="card-body sm:rounded-lg">
                    <div
                      class="card-header h-30 bg-gray-500 text-white sm:rounded-lg dark:bg-gray-500 dark:text-white">
                      <h1 class="text-center text-2xl font-bold decoration-indigo-500">
                        Diagrama de Interacción (Excludio "Ø") - Dirección X-X
                        <button class="rounded bg-blue-500 px-2 py-2 font-bold text-white hover:bg-blue-700"
                          id="btnDIIXX" type="button">
                          Ver
                        </button>
                      </h1>
                    </div>
                    <div class="card-body" id="contentDIIXX">
                      <section class="content">
                        <div class="container-fluid">
                          <div class="row justify-content-center align-items-center">
                            <div id="diagramaex"></div>
                            <div id="myDiagramex"></div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                  <br>
                  <br>
                  <!-- Incuido YY -->
                  <div class="card-body sm:rounded-lg">
                    <div
                      class="card-header h-30 bg-gray-500 text-white sm:rounded-lg dark:bg-gray-500 dark:text-white">
                      <h1 class="text-center text-2xl font-bold decoration-indigo-500">
                        Diagrama de Interacción (Incluido "Ø") - Dirección Y-Y
                        <button class="rounded bg-blue-500 px-2 py-2 font-bold text-white hover:bg-blue-700"
                          id="btnDIEYY" type="button">
                          Ver
                        </button>
                      </h1>
                    </div>
                    <div class="card-body" id="contentDIEYY">
                      <section class="content">
                        <div class="container-fluid">
                          <div class="row justify-content-center align-items-center">
                            <div id="diagramayy"></div>
                            <div id="myDiagramsyy"></div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                  <br>
                  <br>
                  <!-- excluido YY -->
                  <div class="card-body sm:rounded-lg">
                    <div
                      class="card-header h-30 bg-gray-500 text-white sm:rounded-lg dark:bg-gray-500 dark:text-white">
                      <h1 class="text-center text-2xl font-bold decoration-indigo-500">
                        Diagrama de Interacción (Excluido "Ø") - Dirección Y-Y
                        <button class="rounded bg-blue-500 px-2 py-2 font-bold text-white hover:bg-blue-700"
                          id="btnDIEXX" type="button">
                          Ver
                        </button>
                      </h1>
                    </div>
                    <div class="card-body" id="contentDIEXX">
                      <section class="content">
                        <div class="container-fluid">
                          <div class="row justify-content-center align-items-center">
                            <div id="diagramaexy"></div>
                            <div id="myDiagramexy"></div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                  <br>
                  <br>
                  <script>
                    document.getElementById('btnLongArriosX').addEventListener('click', function() {
                      var contentCE = document.getElementById('contentLongArriosX');
                      if (contentCE.style.display === "none") {
                        contentCE.style.display = "block";
                      } else {
                        contentCE.style.display = "none";
                      }
                    });
                    document.getElementById('btnLongArriosY').addEventListener('click', function() {
                      var contentCE = document.getElementById('contentLongArriosY');
                      if (contentCE.style.display === "none") {
                        contentCE.style.display = "block";
                      } else {
                        contentCE.style.display = "none";
                      }
                    });
                    document.getElementById('btncez').addEventListener('click', function() {
                      var contentCE = document.getElementById('contentCE');
                      if (contentCE.style.display === "none") {
                        contentCE.style.display = "block";
                      } else {
                        contentCE.style.display = "none";
                      }
                    });
                    document.getElementById('btnDIIYY').addEventListener('click', function() {
                      var contentDIIYY = document.getElementById('contentDIIYY');
                      if (contentDIIYY.style.display === "none") {
                        contentDIIYY.style.display = "block";
                      } else {
                        contentDIIYY.style.display = "none";
                      }
                    });
                    document.getElementById('btnDIEYY').addEventListener('click', function() {
                      var contentDIEYY = document.getElementById('contentDIEYY');
                      if (contentDIEYY.style.display === "none") {
                        contentDIEYY.style.display = "block";
                      } else {
                        contentDIEYY.style.display = "none";
                      }
                    });
                    document.getElementById('btnDIIXX').addEventListener('click', function() {
                      var contentDIIXX = document.getElementById('contentDIIXX');
                      if (contentDIIXX.style.display === "none") {
                        contentDIIXX.style.display = "block";
                      } else {
                        contentDIIXX.style.display = "none";
                      }
                    });
                    document.getElementById('btnDIEXX').addEventListener('click', function() {
                      var contentDIEXX = document.getElementById('contentDIEXX');
                      if (contentDIEXX.style.display === "none") {
                        contentDIEXX.style.display = "block";
                      } else {
                        contentDIEXX.style.display = "none";
                      }
                    });
                  </script>
                  <thead class="bg-white dark:bg-gray-800">
                    <tr class="text-center">
                      <th class="px-4 py-2" colspan="4">Diseño por corte</th>
                    </tr>
                    <tr class="text-center">
                      <th class="px-4 py-2">Nombre</th>
                      <th class="px-4 py-2">Simb.</th>
                      <th class="px-4 py-2">Entrada</th>
                      <th class="px-4 py-2">Unidad <br> Medida</th>
                    </tr>
                  </thead>
                  <tbody class="text-center">
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Condicion de Esbeltez</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="CDEsbelZ" name="CDEsbelZ" aria-label="Default select example">
                          <option disabled selected>Condicion de Esbeltez</option>
                          <option value="1.01">Biarticulada</option>
                          <option value="0.5">Empotrado Impedido</option>
                          <option value="2">Empotrado y Libre</option>
                          <option value="1.02">Empotrado Permitido</option>
                          <option value="1">Según Norma</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Sistema Estructural</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="SEstru" name="SEstru" aria-label="Default select example">
                          <option value="" disabled selected>Sistema Estructural</option>
                          <option value="Porticos">Pórticos</option>
                          <option value="DualTipI">Dual Tipo I</option>
                          <option value="DualTipII">Dual Tipo II</option>
                          <option value="MEstructurales">Muros Estructurales</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Sistema Estructural</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="Tgrapas" name="Tgrapas" aria-label="Default select example">
                          <option value="" disabled selected>Tipo de Grapas
                          </option>
                          <option value="caso I">CASO I</option>
                          <option value="caso II">CASO II</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">Pu inf</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="puinf" name="puinf" type="text" value="0" placeholder="0"
                          min="0" required>
                      </th>
                      <th class="px-4 py-2">Ton</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">Pu Sup</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="pusup" name="pusup" type="text" value="0" placeholder="0"
                          min="0" required>
                      </th>
                      <th class="px-4 py-2">Ton</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">Mn inf</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="Mninf" name="Mninf" type="text" value="0" placeholder="0"
                          min="0" required>
                      </th>
                      <th class="px-4 py-2">Ton.m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">Mn Sup</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="Mnsup" name="Mnsup" type="text" value="0" placeholder="0"
                          min="0" required>
                      </th>
                      <th class="px-4 py-2">Ton.m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">Vud etabs (Ton)</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="VudEtaps" name="VudEtaps" type="text" value="0" placeholder="0"
                          min="0" required>
                      </th>
                      <th class="px-4 py-2">Ton</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Area del Acero Total:</th>
                      <th class="px-4 py-2">Area del Acero Total:</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="AAceroTotal" name="AAceroTotal" type="text" value="0" placeholder="0"
                          min="0" required>
                      </th>
                      <th class="px-4 py-2">cm<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Sistema Estructural</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="AEstribos" name="AEstribos" aria-label="Default select example">
                          <option disabled selected>Acero de Estribos</option>
                          <option value="0.28">ø6mm</option>
                          <option value="1.13">12mm</option>
                          <option value="0.50">8mm</option>
                          <option value="0.71">ø3/8"</option>
                          <option value="1.27">ø1/2"</option>
                          <option value="1.98">ø5/8"</option>
                          <option value="2.85">ø3/4"</option>
                          <option value="5.10">ø1"</option>
                          <option value="7.92">ø1 1/4"</option>
                          <option value="11.40">ø1 1/2"</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Acero Maximo Longitudinal</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="AmaxLong" name="AmaxLong" aria-label="Default select example">
                          <option disabled selected>Acero de Estribos</option>
                          <option value="0.28">ø6mm</option>
                          <option value="1.13">12mm</option>
                          <option value="0.50">8mm</option>
                          <option value="0.71">ø3/8"</option>
                          <option value="1.27">ø1/2"</option>
                          <option value="1.98">ø5/8"</option>
                          <option value="2.85">ø3/4"</option>
                          <option value="5.10">ø1"</option>
                          <option value="7.92">ø1 1/4"</option>
                          <option value="11.40">ø1 1/2"</option>
                        </select>
                      </th>
                    </tr>
                    <tr>
                      <th class="px-4 py-2">
                        <div class="input-group mb-2">
                          <button
                            class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                            type="submit">DISEÑAR</button>
                        </div>
                      </th>
                    </tr>
                  </tbody>
                </table>

                <input id="dataFromHandsontable" name="dataFromHandsontable" type="hidden" value="">
                <input id="dataFromHandsontableLAX" name="dataFromHandsontableLAX" type="hidden" value="">
                <input id="dataFromHandsontableLAY" name="dataFromHandsontableLAY" type="hidden" value="">
              </form>
            </div>
          </div>
        </div>

        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-2/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800" id="columna_pdf">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
            <button
              class="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              id="btn_pdf_predim" type="button">
              Generar PDF
            </button>
            <button
              class="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              id="btn_captura_resultado" type="button">
              Generar IMG
            </button>
            <div class="overflow-x-auto">
              <div id="ObtenerResultadosCol"></div>
            </div>
            <div class="overflow-x-auto py-5">
              <div class="grid grid-cols-2 gap-2">
                <script src="https://npmcdn.com/chart.js@latest/dist/chart.umd.js"></script>
                <div class="myChartDiv">
                  <canvas id="DIXXs"
                    style="min-height: 250px; height: 250px; max-height: 250px; max-width: 100%;">></canvas>
                </div>
                <div class="myChartDiv">
                  <canvas id="DIejey"
                    style="min-height: 250px; height: 250px; max-height: 250px; max-width: 100%;">></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  @pushOnce('scripts')
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@latest/dist/echarts.min.js"></script>
    @vite('resources/js/adm_desing_columnas.js')
  @endpushOnce
</x-calc-layout>
