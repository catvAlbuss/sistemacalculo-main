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
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.header','data' => ['title' => 'Combinacion de Cargas']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('header'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Combinacion de Cargas']); ?> <?php echo $__env->renderComponent(); ?>
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
                    <td class="px-4 py-2">D</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="d" name="d" type="number" value="1.8" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">Tn/m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">L</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="l" name="l" type="number" value="1.25" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">Tn/m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">Vi</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="vi" name="vi" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">Tn/m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">E</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="e" name="e" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2">Tn/m</td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">CE</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="ce" name="ce" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">CL</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="cl" name="cl" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <tr class="bg-white dark:bg-gray-800">
                    <td class="px-4 py-2"></td>
                    <td class="px-4 py-2">CT</td>
                    <td class="px-4 py-2"><input
                        class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        id="ct" name="ct" type="number" value="0.0" step="any" min="0"
                        required></td>
                    <td class="px-4 py-2"></td>
                  </tr>
                  <!-- Agregar más filas según sea necesario -->
                  <tr>
                    <th class="px-4 py-2">
                      <div class="input-group mb-2">
                        <button
                          class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                          id="calcular" type="button">DISEÑAR</button>
                      </div>
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Resultados -->
        <div class="mt-4 w-full px-4 md:mt-0 md:w-2/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Resultados</h3>
            <div class="overflow-x-auto" id="resultados">
              <table class="min-w-full text-gray-800 dark:text-white">
                <tr>
                  <td class="p-0" colspan="4">
                    <table class="min-w-full text-gray-800 dark:text-white">
                      <!-- 1º COMBINACION -->
                      <thead class="bg-gray-200 dark:bg-gray-800">
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                          <th class="px-4 py-2 text-left text-xl" colspan="2">1°
                            COMBINACION
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2" colspan="2"><span id="_1combinacion">4.645</span></td>
                          <th class="px-4 py-2 text-right" scope="col"><span id="_1combinacionResultado">ESTE
                              VALOR RIGE</span></th>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="p-0" colspan="4">
                    <table class="min-w-full text-gray-800 dark:text-white">
                      <!-- 2º COMBINACION -->
                      <thead class="bg-gray-200 dark:bg-gray-800">
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                          <th class="px-4 py-2 text-left text-xl" colspan="2">2°
                            COMBINACION
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><span id="_2combinacion1">3.8125</span></td>
                          <td class="px-4 py-2"><span id="_2combinacion2">3.8125</span></td>
                          <th class="px-4 py-2 text-right"><span id="_2combinacionResultado">NO</span></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><span id="_2combinacion3">1.62</span></td>
                          <td class="px-4 py-2"><span id="_2combinacion4">1.62</span></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="p-0" colspan="4">
                    <table class="min-w-full text-gray-800 dark:text-white">
                      <!-- 3º COMBINACION -->
                      <thead class="bg-gray-200 dark:bg-gray-800">
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                          <th class="px-4 py-2 text-left text-xl" colspan="2">3°
                            COMBINACION
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-gray-100 py-2 dark:bg-gray-800">
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><span id="_3combinacion1">3.8125</span></td>
                          <td class="px-4 py-2"><span id="_3combinacion2">3.8125</span></td>
                          <th class="px-4 py-2 text-right"><span id="_3combinacionResultado">NO</span></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                          <td class="px-4 py-2"><span id="_3combinacion3">1.62</span></td>
                          <td class="px-4 py-2"><span id="_3combinacion4">1.62</span></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="p-0">
                    <table>
                      <thead class="bg-gray-200 dark:bg-gray-800">
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                          <th class="px-4 py-2 text-xl">LA MAXIMA COMBINACION SERA!</th>
                          <th class="px-4 py-2 text-xl">U</th>
                          <th class="px-4 py-2 text-xl"></th>
                          <th class="px-4 py-2 text-xl"><span id="maximaCombinacion">4.645</span> Tn/m</th>
                        </tr>
                      </thead>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <?php if (! $__env->hasRenderedOnce('d8e91ba0-dc2c-4515-8ec3-f4c97116c59a')): $__env->markAsRenderedOnce('d8e91ba0-dc2c-4515-8ec3-f4c97116c59a');
$__env->startPush('scripts'); ?>
    <?php echo app('Illuminate\Foundation\Vite')('resources/js/cav2/adm_comb_cargas.js'); ?>
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
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\hcalculo\CAV2\admCombCargas.blade.php ENDPATH**/ ?>