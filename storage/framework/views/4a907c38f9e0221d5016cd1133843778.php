<?php if (isset($component)) { $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54 = $attributes; } ?>
<?php $component = App\View\Components\AppLayout::resolve([] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('app-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\App\View\Components\AppLayout::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
  <?php if (isset($component)) { $__componentOriginalfd1f218809a441e923395fcbf03e4272 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalfd1f218809a441e923395fcbf03e4272 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.header','data' => ['title' => 'Diseño de Aligerados']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('header'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Diseño de Aligerados']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfd1f218809a441e923395fcbf03e4272)): ?>
<?php $attributes = $__attributesOriginalfd1f218809a441e923395fcbf03e4272; ?>
<?php unset($__attributesOriginalfd1f218809a441e923395fcbf03e4272); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfd1f218809a441e923395fcbf03e4272)): ?>
<?php $component = $__componentOriginalfd1f218809a441e923395fcbf03e4272; ?>
<?php unset($__componentOriginalfd1f218809a441e923395fcbf03e4272); ?>
<?php endif; ?>
  <?php if (isset($component)) { $__componentOriginal7869340101d9a2f9f63d6f956e8b3992 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal7869340101d9a2f9f63d6f956e8b3992 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.mathjax-loader','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('mathjax-loader'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal7869340101d9a2f9f63d6f956e8b3992)): ?>
<?php $attributes = $__attributesOriginal7869340101d9a2f9f63d6f956e8b3992; ?>
<?php unset($__attributesOriginal7869340101d9a2f9f63d6f956e8b3992); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal7869340101d9a2f9f63d6f956e8b3992)): ?>
<?php $component = $__componentOriginal7869340101d9a2f9f63d6f956e8b3992; ?>
<?php unset($__componentOriginal7869340101d9a2f9f63d6f956e8b3992); ?>
<?php endif; ?>
  <div class="py-12">
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
                    <th class="px-4 py-2">Unidad <br> Medida</th>
                  </tr>
                </thead>
                <tbody class="text-center">
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">L</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="l" name="l" type="number" value="3.1" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2">ANALISIS ESTRUCTURAL</td>
                    <td class="px-4 py-2">R</td>
                    <td class="px-4 py-2">6</td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Ve</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="ve" name="ve" type="number" value="5.75" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">tn</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2">ANALISIS ESTRUCTURAL</td>
                    <td class="px-4 py-2">R</td>
                    <td class="px-4 py-2">6</td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Me</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="me" name="me" type="number" value="25.68" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">tn-m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">t</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="t" name="t" type="number" value="0.13" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">cm</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Pg</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="pg" name="pg" type="number" value="19.93" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">tn</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">f´m</td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="fm" name="fm" type="number" value="55.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">kg/cm2</td>
                  </tr>
                  <tr>
                    <th class="px-4 py-2">
                      <div class="input-group mb-2">
                        <button
                          class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                          id="calcular" type="button">DISEÑAR</button>
                      </div>
                    </th>
                  </tr>
                  <!-- Agregar más filas según sea necesario -->
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
              <table class="min-w-full text-gray-800 dark:text-white" id="resultados">
                <!-- Datos -->
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Prerequisitos del
                      Sistema
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">L</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="l"></span> m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Ve</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="ve"></span> tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Me</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="me"></span> tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">t</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="t"></span> cm</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Pg</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="pg"></span> tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">a</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="a">0.70</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="aCalc">0.70</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">f´m</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="fm"></span> kg/cm2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">v&apos;m=</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="vmPrima">74.16</span> tn/m2</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vm</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="vm">14.95</span> tn</td>
                  </tr>
                </tbody>
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">2.- Verificacion de
                      Agretamiento
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">0.55Vm</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="verificacionDeAgretamientoVm">8.226118137636146</span> tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">si se agrieta cambiar la albañileria, espesor, o poner
                      placa.</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="verificacionDeAgretamientoOK">ok</span></td>
                  </tr>
                </tbody>
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">3.- Factor de
                      Ampliación
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vm/Ve</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="factorDeAmplificacionVmVc">2.601144075141864</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">(calculo solo en el 1° nivel)</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="calculoSoloEnEl1Nivel">2.601144075141864</span></td>
                  </tr>
                </tbody>
                <thead class="bg-gray-200 dark:bg-gray-800">
                  <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="px-4 py-2 text-left text-xl" colspan="4">4.- Esfuerzos
                      Amplificados
                    </th>
                  </tr>
                  <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="px-8 py-2 text-lg" scope="col">Nombre</th>
                    <th class="px-4 py-2 text-lg" scope="col">Símbolo</th>
                    <th class="px-4 py-2 text-lg" scope="col">Fórmula</th>
                    <th class="px-4 py-2 text-lg" scope="col">Resultado</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="esfuerzosAmplificadosVu">14.956578432065719</span> tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Mu</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="esfuerzosAmplificadosMu">66.79737984964306</span> tn-m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">L</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="esfuerzosAmplificadosL" name="esfuerzosAmplificadosL" type="number" value="3.1"
                        step="any" min="0" required> m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Nc</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-1/2 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="esfuerzosAmplificadosNc" name="esfuerzosAmplificadosNc" type="number" value="2.0"
                        step="any" min="0" required>
                      columnas
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">h</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="esfuerzosAmplificadosH" name="esfuerzosAmplificadosH" type="number" value="2.5"
                        step="any" min="0" required> m
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">carga del muro tranversal</td>
                    <td class="px-4 py-2">Pt</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-3/4 rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="esfuerzosAmplificadosPt" name="esfuerzosAmplificadosPt" type="number" value="17.36"
                        step="any" min="0" required>
                      tn
                    </td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"><span id="esfuerzosAmplificadosMSigue">sigue</span></td>
                    <td class="px-4 py-2">M</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="esfuerzosAmplificadosM">48.10</span> tn.m</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">F</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="esfuerzosAmplificadosF">15.51</span> tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Pc</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="esfuerzosAmplificadosPc">9.965</span> tn</td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">columna con muro transversal </td>
                    <td class="px-4 py-2">pt</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><span id="columnaConMuroTransversal">4.34</span></td>
                  </tr>
                  <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class="px-4 py-2">columna sin muro transversal</td>
                    <td class="px-4 py-2">pt</td>
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2"><input
                        class="xlsx-calc form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="columnaSinMuroTransversal" name="columnaSinMuroTransversal" type="number"
                        value="0.0" step="any" min="0" required></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <?php if (! $__env->hasRenderedOnce('e5c2296e-fa78-4567-916b-7caa1294635b')): $__env->markAsRenderedOnce('e5c2296e-fa78-4567-916b-7caa1294635b');
$__env->startPush('scripts'); ?>
    <?php echo app('Illuminate\Foundation\Vite')('resources/js/cav2/adm_aligerados.js'); ?>
  <?php $__env->stopPush(); endif; ?>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $attributes = $__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__attributesOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54)): ?>
<?php $component = $__componentOriginal9ac128a9029c0e4701924bd2d73d7f54; ?>
<?php unset($__componentOriginal9ac128a9029c0e4701924bd2d73d7f54); ?>
<?php endif; ?>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\hcalculo\CAV2\admAligerados.blade.php ENDPATH**/ ?>