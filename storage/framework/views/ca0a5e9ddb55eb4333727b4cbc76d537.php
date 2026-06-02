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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.header','data' => ['title' => 'Cimentacion 1.0']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('header'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Cimentacion 1.0']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalfd1f218809a441e923395fcbf03e4272)): ?>
<?php $attributes = $__attributesOriginalfd1f218809a441e923395fcbf03e4272; ?>
<?php unset($__attributesOriginalfd1f218809a441e923395fcbf03e4272); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalfd1f218809a441e923395fcbf03e4272)): ?>
<?php $component = $__componentOriginalfd1f218809a441e923395fcbf03e4272; ?>
<?php unset($__componentOriginalfd1f218809a441e923395fcbf03e4272); ?>
<?php endif; ?>

  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="zapatasForm">
                <?php echo csrf_field(); ?>
                <table class="w-full table-auto px-6 text-gray-800 dark:text-white">
                  <tbody class="text-center">
                    <tr>
                      <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                        Cargas</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2" colspan="4">
                        <div id="cargas"></div>
                      </td>
                    </tr>
                    <tr>
                      <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                        Propiedades</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2" colspan="4">
                        <div id="propiedades"></div>
                      </td>
                    </tr>
                    <tr>
                      <th class="border-b border-gray-600 px-4 py-2 text-left text-xl" colspan="4" scope="col">
                        Poligono</th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2">
                        <div id="poligonoExterior"></div>
                      </td>
                      <td class="px-4 py-2">
                        <div id="poligonoInterior1"></div>
                      </td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2">
                        <div id="poligonoInterior2"></div>
                      </td>
                      <td class="px-4 py-2">
                        <div id="poligonoInterior3"></div>
                      </td>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <td class="px-4 py-2">
                        <div id="poligonoInterior4"></div>
                      </td>
                      <td class="px-4 py-2">
                        <div id="poligonoInterior5"></div>
                      </td>
                    </tr>
                    <!-- Agregar más filas según sea necesario -->
                    <tr>
                      <th class="px-4 py-2">
                        <div class="input-group mb-2 inline-block text-left">
                          <button
                            class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                            id="calcular" type="submit">DISEÑAR</button>
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
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                  <th class="px-4 py-2 text-left text-xl" colspan="4">1.- Analisis Estructural
                  </th>
                </tr>
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
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata7"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata8"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata9"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata10"></div>
                  </td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class="px-4 py-2" colspan="4">
                    <div id="zapata11"></div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <?php if (! $__env->hasRenderedOnce('6279533f-9ca0-44a0-9f44-5a5d49c34a74')): $__env->markAsRenderedOnce('6279533f-9ca0-44a0-9f44-5a5d49c34a74');
$__env->startPush('scripts'); ?>
    <script src="https://unpkg.com/virtual-webgl@1.0.6/src/virtual-webgl.js"></script>
    <?php echo app('Illuminate\Foundation\Vite')('resources/js/adm_zapatas_grafico.js'); ?>
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
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\matlab\admZapatasGrafico.blade.php ENDPATH**/ ?>