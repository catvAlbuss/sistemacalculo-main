<x-calc-layout title="Diseño de Zapata Combinada">
  @pushOnce('styles')
    <link href="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css" rel="stylesheet" />
  @endpushOnce

  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="DataZapataCombinada" action="{{ route('zapatacombCon') }}" method="POST">
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
                      <th class="px-4 py-2">Descripción</th>
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="des" name="des" type="text" value="Zapata A1" placeholder="Zapata A1"
                          min="0" step="any" required>
                      </th>
                      <th class="px-4 py-2">-</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Factor K</th>
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fk" name="fk" type="text" value="1" placeholder="1" min="0"
                          step="any" required></th>
                      <th class="px-4 py-2">-</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">qa</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="qa" name="qa" type="text" value="3" step="any" placeholder="3"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">Ton/m<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Presión de Servicio</th>
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="p_servicio" name="p_servicio" type="text" value="8" placeholder="8" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">Ton/m<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white text-center dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Predimencionamiento</th>
                    </tr>
                    {{-- Columna 1 --}}
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">columna 1</th>
                      <th class="px-4 py-2">t1</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="t1_col1" name="t1_col1" type="text" value="0.5" placeholder="0.5" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">columna 1</th>
                      <th class="px-4 py-2">t2</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="t2_col1" name="t2_col1" type="text" value="0.5" placeholder="0.5" min="0"
                          required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">columna 1</th>
                      <th class="px-4 py-2">m1</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="m1" name="m1" type="text" value="1" placeholder="1"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    {{-- Columna 2 --}}
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">columna 2</th>
                      <th class="px-4 py-2">t1</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="t1_col2" name="t1_col2" type="text" value="0.5" placeholder="0.5"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">columna 2</th>
                      <th class="px-4 py-2">t2</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="t2_col2" name="t2_col2" type="text" value="0.5" placeholder="0.5"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">columna 2</th>
                      <th class="px-4 py-2">m2</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="m2" name="m2" type="text" value="1" placeholder="1"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Esfuerzo de compresión del concreto</th>
                      <th class="px-4 py-2">fc</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fc" name="fc" type="text" value="210" placeholder="210"
                          min="0" required>
                      </th>
                      <th class="px-4 py-2">kg/cm<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Esfuerzo de fluencia del acero</th>
                      <th class="px-4 py-2">fy</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fy" name="fy" type="text" value="4200" placeholder="4200"
                          min="0" required></th>
                      <th class="px-4 py-2">kg/cm<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Profundidad de desplante</th>
                      <th class="px-4 py-2">Df</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="df" name="df" type="text" value="1.5" placeholder="1.5"
                          min="0" required></th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">S/C</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="sc" name="sc" type="text" value="500" placeholder="500"
                          min="0" required></th>
                      <th class="px-4 py-2">Kg/m<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">ym</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="ym" name="ym" type="text" value="2000" placeholder="2000"
                          min="0" required></th>
                      <th class="px-4 py-2">Kg/m<sup>3</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">hc</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="hc" name="hc" type="text" value="0.2" placeholder="0.2"
                          min="0" required></th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">σt</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="ot" name="ot" type="text" value="3" placeholder="3"
                          min="0" required></th>
                      <th class="px-4 py-2">Kg/m<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">hz</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="hz" name="hz" type="text" value="1" placeholder="1"
                          min="0" required></th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">r</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="r" name="r" type="text" value="1" placeholder="1"
                          min="0" required></th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">rec</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="rec" name="rec" type="text" value="7.5" placeholder="7.5"
                          min="0" required></th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">Le</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="Le" name="Le" type="text" value="5" placeholder="5"
                          min="0" required></th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <input id="dataCargacol1" name="dataCargacol1" type="hidden" value="">
                    <input id="dataCargacol2" name="dataCargacol2" type="hidden" value="">

                    {{-- COMBINACION Y CARGAS --}}
                    <tr class="bg-white text-center dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Combinacion de cargas</th>
                    </tr>

                    {{-- Columna 1 --}}
                    <tr class="bg-white text-left dark:bg-gray-500">
                      <th class="px-4 py-2" colspan="4">Columna 1</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">
                        <div class="tamaño-tabla" id="CargaConServ" style="height: 160px">
                        </div>
                      </th>
                    </tr>

                    {{-- Columna 2 --}}
                    <tr class="bg-white text-left dark:bg-gray-500">
                      <th class="px-4 py-2" colspan="4">Columna 2</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">
                        <div class="tamaño-tabla" id="CargaConServcol2" style="height: 160px">
                        </div>
                      </th>
                    </tr>

                    {{-- Diseño de verificacion por cortante --}}
                    <tr class="bg-white text-left dark:bg-gray-500">
                      <th class="px-4 py-2" colspan="4">Diseño de verificacion por cortante
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Columna 1</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="selectColumna1" name="selectColumna1" aria-label="Default select example">
                          <option value="fila1_col1">1.4CM+1.7CV</option>
                          <option value="fila2_col1">1.25(CM+CV)+Sx</option>
                          <option value="fila3_col1">1.25(CM+CV)-Sx</option>
                          <option value="fila4_col1">1.25(CM+CV)+Sy</option>
                          <option value="fila5_col1">1.25(CM+CV)-Sy</option>
                          <option value="fila6_col1">0.9CM+Sx</option>
                          <option value="fila7_col1">0.9CM-Sx</option>
                          <option value="fila8_col1">0.9CM+Sy</option>
                          <option value="fila9_col1">0.9CM-Sx</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Columna 2</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="selectColumna2" name="selectColumna2" aria-label="Default select example">
                          <option value="fila1_col2">1.4CM+1.7CV</option>
                          <option value="fila2_col2">1.25(CM+CV)+Sx</option>
                          <option value="fila3_col2">1.25(CM+CV)-Sx</option>
                          <option value="fila4_col2">1.25(CM+CV)+Sy</option>
                          <option value="fila5_col2">1.25(CM+CV)-Sy</option>
                          <option value="fila6_col2">0.9CM+Sx</option>
                          <option value="fila7_col2">0.9CM-Sx</option>
                          <option value="fila8_col2">0.9CM+Sy</option>
                          <option value="fila9_col2">0.9CM-Sx</option>
                        </select>
                      </th>
                    </tr>

                    {{-- Columna 1 --}}
                    <tr class="bg-white text-left dark:bg-gray-500">
                      <th class="px-4 py-2" colspan="4">Columna 1</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">lv</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="lv_col1" name="lv_col1" type="text" value="0.75" placeholder="0.75"
                          min="0" required></th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">d</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="d_col1" name="d_col1" type="text" value="90.6" placeholder="90.6"
                          min="0" required></th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ф Varilla</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="VarillaX_Col1" name="VarillaX_Col1" aria-label="Default select example">
                          <option value="0">Ø 0"</option>
                          <option value="0.28">6mm</option>
                          <option value="0.5">8mm</option>
                          <option value="0.71" selected>Ø 3/8"</option>
                          <option value="1.13">12mm</option>
                          <option value="1.29">Ø 1/2"</option>
                          <option value="1.99">Ø 5/8"</option>
                          <option value="2.84">Ø 3/4"</option>
                          <option value="5.1">Ø 1"</option>
                          <option value="10.06">Ø 1 3/8"</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">ρmin</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="pmin_col1" name="pmin_col1" type="text" value="0.0018" placeholder="0.0018"
                          min="0" required></th>
                      <th class="px-4 py-2">-</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ф Varilla</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="selectVFColumna1" name="selectVFColumna1" aria-label="Default select example">
                          <option value="fila1_col1">1.4CM+1.7CV</option>
                          <option value="fila2_col1">1.25(CM+CV)+Sx</option>
                          <option value="fila3_col1">1.25(CM+CV)-Sx</option>
                          <option value="fila4_col1">1.25(CM+CV)+Sy</option>
                          <option value="fila5_col1">1.25(CM+CV)-Sy</option>
                          <option value="fila6_col1">0.9CM+Sx</option>
                          <option value="fila7_col1">0.9CM-Sx</option>
                          <option value="fila8_col1">0.9CM+Sy</option>
                          <option value="fila9_col1">0.9CM-Sx</option>
                        </select>
                      </th>
                    </tr>

                    {{-- Columna 2 --}}
                    <tr class="bg-white text-left dark:bg-gray-500">
                      <th class="px-4 py-2" colspan="4">Columna 2</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">lv</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="lv_col2" name="lv_col2" type="text" value="0.75" placeholder="0.75"
                          min="0" required></th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">d</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="d_col2" name="d_col2" type="text" value="89.01" placeholder="90.6"
                          min="0" required></th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ф Varilla</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="VarillaX_Col2" name="VarillaX_Col2" aria-label="Default select example">
                          <option value="0">Ø 0"</option>
                          <option value="0.28">6mm</option>
                          <option value="0.5">8mm</option>
                          <option value="0.71" selected>Ø 3/8"</option>
                          <option value="1.13">12mm</option>
                          <option value="1.29">Ø 1/2"</option>
                          <option value="1.99">Ø 5/8"</option>
                          <option value="2.84">Ø 3/4"</option>
                          <option value="5.1">Ø 1"</option>
                          <option value="10.06">Ø 1 3/8"</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">ρmin</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="pmin_col2" name="pmin_col2" type="text" value="0.0018" placeholder="0.0018"
                          min="0" required></th>
                      <th class="px-4 py-2">-</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ф Varilla</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="selectVFColumna2" name="selectVFColumna2" aria-label="Default select example">
                          <option value="fila1_col2">1.4CM+1.7CV</option>
                          <option value="fila2_col2">1.25(CM+CV)+Sx</option>
                          <option value="fila3_col2">1.25(CM+CV)-Sx</option>
                          <option value="fila4_col2">1.25(CM+CV)+Sy</option>
                          <option value="fila5_col2">1.25(CM+CV)-Sy</option>
                          <option value="fila6_col2">0.9CM+Sx</option>
                          <option value="fila7_col2">0.9CM-Sx</option>
                          <option value="fila8_col2">0.9CM+Sy</option>
                          <option value="fila9_col2">0.9CM-Sx</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">φ</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="pmin_fi_generalcol2" name="fi_general" type="text" value="0.9"
                          placeholder="0.9" min="0" required></th>
                      <th class="px-4 py-2">-</th>
                    </tr>
                    {{-- Verificacion por corte y punzunamiento --}}
                    <tr class="bg-white text-left dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Verificación por Corte y
                        Punzonamiento
                      </th>
                    </tr>
                    <tr class="bg-white text-left dark:bg-gray-500">
                      <th class="px-4 py-2" colspan="4">Columna 1</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">d</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="dvc_col1" name="dvc_col1" type="text" value="91.55" placeholder="91.55"
                          min="0" required></th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">r</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="r_vc_col1" name="r_vc_col1" type="text" value="7.5" placeholder="7.5"
                          min="0" required></th>
                      <th class="px-4 py-2">-</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ф Varilla</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="VarillaVC_Col1" name="VarillaVC_Col1" aria-label="Default select example">
                          <option value="0">Ø 0"</option>
                          <option value="0.28">6mm</option>
                          <option value="0.5">8mm</option>
                          <option value="0.71" selected>Ø 3/8"</option>
                          <option value="1.13">12mm</option>
                          <option value="1.29">Ø 1/2"</option>
                          <option value="1.99">Ø 5/8"</option>
                          <option value="2.84">Ø 3/4"</option>
                          <option value="5.1">Ø 1"</option>
                          <option value="10.06">Ø 1 3/8"</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Tipo de Columna y Factor α</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fa_Col1" name="fa_Col1" aria-label="Default select example">
                          <option value="40">Columnas Interiores</option>
                          <option value="30" selected>Columnas de Borde</option>
                          <option value="20">Columnas de Esquina</option>
                        </select>
                      </th>
                    </tr>

                    {{-- Columna 2 --}}
                    <tr class="bg-white text-left dark:bg-gray-500">
                      <th class="px-4 py-2" colspan="4">Columna 2</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">d</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="dvc_col2" name="dvc_col2" type="text" value="91.55" placeholder="91.55"
                          min="0" required></th>
                      <th class="px-4 py-2">cm</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">r</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="r_vc_col2" name="r_vc_col2" type="text" value="7.5" placeholder="7.5"
                          min="0" required></th>
                      <th class="px-4 py-2">-</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ф Varilla</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="VarillaVC_Col2" name="VarillaVC_Col2" aria-label="Default select example">
                          <option value="0">Ø 0"</option>
                          <option value="0.28">6mm</option>
                          <option value="0.5">8mm</option>
                          <option value="0.71" selected>Ø 3/8"</option>
                          <option value="1.13">12mm</option>
                          <option value="1.29">Ø 1/2"</option>
                          <option value="1.99">Ø 5/8"</option>
                          <option value="2.84">Ø 3/4"</option>
                          <option value="5.1">Ø 1"</option>
                          <option value="10.06">Ø 1 3/8"</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Tipo de Columna y Factor α</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fa_Col2" name="fa_Col2" aria-label="Default select example">
                          <option value="40">Columnas Interiores</option>
                          <option value="30" selected>Columnas de Borde</option>
                          <option value="20">Columnas de Esquina</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">-</th>
                      <th class="px-4 py-2">∅</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="ovcp" name="ovcp" type="text" value="0.85" placeholder="0.85"
                          min="0" required></th>
                      <th class="px-4 py-2">-</th>
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
                    <!-- Agregar más filas según sea necesario -->
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
            <button
              class="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              id="btn_pdf_predim" type="button">
              Generar PDF
            </button>
            <button
              class="rounded-lg bg-green-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
              id="btn_captura_zapata_combinada" type="button">
              Generar IMG
            </button>
            <div class="overflow-x-auto" id="zapatacomb_pdf">
              <div class="overflow-x-auto">
                <canvas id="predimencionamiento" width="1000" height="400"></canvas>
              </div>
              <div class="overflow-x-auto">
                <canvas id="vistaplanta" width="1000" height="400"></canvas>
              </div>
              <div class="overflow-x-auto">
                <canvas id="myChart" width="1000" height="400"></canvas>
              </div>
              <div class="overflow-x-auto">
                <canvas id="VC_flexion" width="1000" height="400"></canvas>
              </div>
              <div class="overflow-x-auto">
                <canvas id="corte_punzonamiento" width="1000" height="400"></canvas>
              </div>
              <div class="overflow-x-auto">
                <div id="ObtenerResultadosZComb"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  @pushOnce('scripts')
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js"></script>
    <script type="module" src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    @vite('resources/js/adm_zapata_combinada.js')
  @endpushOnce
</x-calc-layout>
