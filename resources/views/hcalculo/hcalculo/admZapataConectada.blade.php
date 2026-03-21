<x-calc-layout title="Diseño de Zapata Conectada">
  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="DataZapataconectada" action="{{ route('zapataconectadaCon') }}" method="POST">
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
                      <th class="px-4 py-2" colspan="4">Dimensiones de la columna 1</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ancho</th>
                      <th class="px-4 py-2">Ancho</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="anchoCol1" name="anchoCol1" type="text" value="0.6" placeholder="0.6" min="0"
                          step="any" required>
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Largo</th>
                      <th class="px-4 py-2">Largo</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="largoCol1" name="largoCol1" type="text" value="0.4" placeholder="0.4" min="0"
                          step="any" required></th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Dimensiones de la columna 2</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ancho</th>
                      <th class="px-4 py-2">Ancho</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="anchoCol2" name="anchoCol2" type="text" value="0.8" placeholder="0.8" min="0"
                          step="any" required>
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Largo</th>
                      <th class="px-4 py-2">Largo</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="largoCol2" name="largoCol2" type="text" value="0.4" placeholder="0.4" min="0"
                          step="any" required></th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Dimensiones de la zapata 1</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ancho</th>
                      <th class="px-4 py-2">Ancho</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="anchoZap1" name="anchoZap1" type="text" value="1.2" placeholder="1.2" min="0"
                          step="any" required>
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Largo</th>
                      <th class="px-4 py-2">Largo</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="largoZap1" name="largoZap1" type="text" value="1.5" placeholder="1.5"
                          min="0" step="any" required></th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Dimensiones de la zapata 2</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ancho</th>
                      <th class="px-4 py-2">Ancho</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="anchoZap2" name="anchoZap2" type="text" value="1.5" placeholder="1.5"
                          min="0" step="any" required>
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Largo</th>
                      <th class="px-4 py-2">Largo</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="largoZap2" name="largoZap2" type="text" value="1.5" placeholder="1.5"
                          min="0" step="any" required></th>
                      <th class="px-4 py-2">m</th>
                    </tr>

                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Viga</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Ancho</th>
                      <th class="px-4 py-2">Ancho</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="anchoViga" name="anchoViga" type="text" value="0.4" placeholder="0.4"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>

                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Luz libre entre columnas</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Luz Libre</th>
                      <th class="px-4 py-2">ln</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="lndiseno" name="lndiseno" type="text" value="5" placeholder="5"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Tipo de diseño</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Tipo de diseño</th>
                      <th class="px-4 py-2" colspan="3">
                        <select
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="tipoDiseño" name="tipoDiseño" aria-label="Default select example">
                          <option value="1">Tipo 1</option>
                          <option value="2">Tipo 2</option>
                          <option value="3">Tipo 3</option>
                          <option value="4">Tipo 4</option>
                          <option value="5">Tipo 5</option>
                          <option value="6">Tipo 6</option>
                          <option value="7">Tipo 7</option>
                          <option value="8">Tipo 8</option>
                          <option value="9">Tipo 9</option>
                        </select>
                      </th>
                    </tr>
                    <tr class="bg-white text-left dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">2.- Datos principales</th>
                    </tr>
                    {{-- Columna 1 --}}
                    <tr class="bg-white text-left dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Columna 1</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">P<sub>D1</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="PD1" name="PD1" type="text" value="120" placeholder="120"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">P<sub>L1</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="PL1" name="PL1" type="text" value="70" placeholder="70"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">P<sub>SX1</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="PSX1" name="PSX1" type="text" value="20" placeholder="20"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">P<sub>SY1</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="PSY1" name="PSY1" type="text" value="12" placeholder="12"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>Dx1</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MDx1" name="MDx1" type="text" value="8" placeholder="8"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>Lx1</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MLx1" name="MLx1" type="text" value="6" placeholder="6"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>Dy1</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MDy1" name="MDy1" type="text" value="6" placeholder="6"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>Ly1</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MLy1" name="MLy1" type="text" value="4" placeholder="4"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>SX1</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MSX1" name="MSX1" type="text" value="9" placeholder="9"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>SY1</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MSY1" name="MSY1" type="text" value="6" placeholder="6"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    {{-- Columna 2 --}}
                    <tr class="bg-white text-left dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Columna 2</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">P<sub>D2</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="PD2" name="PD2" type="text" value="200" placeholder="200"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">P<sub>L2</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="PL2" name="PL2" type="text" value="115" placeholder="115"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">P<sub>SX2</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="PSX2" name="PSX2" type="text" value="15" placeholder="15"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">P<sub>SY2</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="PSY2" name="PSY2" type="text" value="13" placeholder="13"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>Dx2</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MDx2" name="MDx2" type="text" value="3" placeholder="3"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>Lx2</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MLx2" name="MLx2" type="text" value="1.5" placeholder="1.5"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>Dy2</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MDy2" name="MDy2" type="text" value="7" placeholder="7"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>Ly2</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MLy2" name="MLy2" type="text" value="5" placeholder="5"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>SX2</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MSX2" name="MSX2" type="text" value="10" placeholder="10"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">M<sub>SY2</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="MSY2" name="MSY2" type="text" value="7" placeholder="7"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">tonnef</th>
                    </tr>

                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Capacidad portante admisible neta
                      </th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">qₙₑₜₐ</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="qneta" name="qneta" type="text" value="4" placeholder="4"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">kgf/cm<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2" colspan="4">Anchos de cada cimentación</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">B₁</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="b1" name="b1" type="text" value="3.4" placeholder="3.4"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">B₂</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="b2" name="b2" type="text" value="2.8" placeholder="2.8"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2"></th>
                      <th class="px-4 py-2">L <sub>2</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="l2" name="l2" type="text" value="3.2" placeholder="3.2"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2">m</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Factor de amplificación de cargas muertas</th>
                      <th class="px-4 py-2">α<sub>D</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fact_ampli_cm" name="fact_ampli_cm" type="text" value="1.4" placeholder="1.4"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2"></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Factor de amplificación de cargas vivas</th>
                      <th class="px-4 py-2">α<sub>L</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fact_ampli_cv" name="fact_ampli_cv" type="text" value="1.7" placeholder="1.7"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2"></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Factor de amplificación de cargas muertas</th>
                      <th class="px-4 py-2">α<sub>D</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fact_ampli_cm_c2" name="fact_ampli_cm_c2" type="text" value="1.25"
                          placeholder="1.25" min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2"></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Factor de amplificación de cargas vivas</th>
                      <th class="px-4 py-2">α<sub>D</sub></th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fact_ampli_cv_c2" name="fact_ampli_cv_c2" type="text" value="1.25"
                          placeholder="1.25" min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2"></th>
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
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800" id="zapataConectada_pdf">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
            <button
              class="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              id="btn_pdf_predim" type="button">
              Generar PDF
            </button>
            <div class="overflow-x-auto">
              <canvas id="myCanvas" style="border: none;" width="1000" height="300"></canvas>
            </div>
            <div class="overflow-x-auto">
              <div id="ObtenerResultadosZConectada">
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    @pushOnce('scripts')
      <script src="https://cdn.jsdelivr.net/npm/echarts@latest/dist/echarts.min.js"></script>
      <script type="module" src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      @vite('resources/js/adm_zapata_conectada.js')
    @endpushOnce
</x-calc-layout>
