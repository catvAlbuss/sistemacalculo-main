<?php if (isset($component)) { $__componentOriginald56ab98830c2b53982542500711782ee = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald56ab98830c2b53982542500711782ee = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.calc-layout','data' => ['title' => 'Diseño de vigas']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('calc-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Diseño de vigas']); ?>
  <div class="py-12">
    <div class="container mx-auto w-full">
      <div class="flex flex-wrap">
        <!-- Formulario -->
        <div class="w-full md:w-1/3">
          <div class="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Datos Generales</h3>
            <div class="overflow-auto">
              <form id="FlexionViga" method="post">
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
                      <th class="px-4 py-2">Esfuerzo de compresión del concreto</th>
                      <th class="px-4 py-2">fc</th>
                      <th class="px-4 py-2">
                        <input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fc" name="fc" type="text" value="210" placeholder="210" min="0"
                          required>
                      </th>
                      <th class="px-4 py-2">kg/cm<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">Esfuerzo de fluencia del acero</th>
                      <th class="px-4 py-2">fy</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="fy" name="fy" type="text" value="4200" placeholder="4200" min="0"
                          required></th>
                      <th class="px-4 py-2">kg/cm<sup>2</sup></th>
                    </tr>
                    <tr class="bg-white dark:bg-gray-800">
                      <th class="px-4 py-2">N° tramos</th>
                      <th class="px-4 py-2">#</th>
                      <th class="px-4 py-2"><input
                          class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          id="num_tramos" name="num_tramos" type="text" value="1" placeholder="tramos"
                          min="0" required
                          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');">
                      </th>
                      <th class="px-4 py-2"></th>
                    </tr>
                  </tbody>
                </table>

                <div class="overflow-auto" id="tablaContainer"></div>
                <div class="mt-4 flex justify-between">
                  <button class="rounded bg-blue-500 px-2 py-1 text-xs font-bold text-white hover:bg-blue-700"
                    id="prevButton">
                    &larr; Tramo Anterior
                  </button>
                  <button class="rounded bg-blue-500 px-2 py-1 text-xs font-bold text-white hover:bg-blue-700"
                    id="nextButton">
                    Siguiente Tramo &rarr;
                  </button>
                </div>
                <div class="mt-4">
                  <button
                    class="rounded border-b-4 border-blue-700 bg-blue-500 px-4 py-2 font-bold text-white hover:border-blue-500 hover:bg-blue-400"
                    id="accionButton">DISEÑAR</button>
                </div>
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
            <div class="overflow-x-auto" id="vigas_general">
              <div id="calc_vigas_negativos" style="overflow-x: auto; overflow-y: hidden; max-width: 100vw;"></div>
              <div id="calc_vigas_verf" style="overflow-x: auto; overflow-y: hidden; max-width: 100vw;">
              </div>
              <div id="calc_vigas_verficado" style="overflow-x: auto; overflow-y: hidden; max-width: 100vw;"></div>

              <div id="calc_vigas_positivos" style="overflow-x: auto; overflow-y: hidden; max-width: 100vw;"></div>
              <div id="calc_vigas_verf_post" style="overflow-x: auto; overflow-y: hidden; max-width: 100vw;"></div>
              <div id="calc_vigas_verficado_pos" style="overflow-x: auto; overflow-y: hidden; max-width: 100vw;"></div>

              <div id="calc_vigas_cortante" style="overflow-x: auto; overflow-y: hidden; max-width: 100vw;"></div>
              <div id="calc_vigas_capacidad" style="overflow-x: auto; overflow-y: hidden; max-width: 100vw;"></div>
              <div id="calc_vigas_deflexion" style="overflow-x: auto; overflow-y: hidden; max-width: 100vw;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <?php if (! $__env->hasRenderedOnce('f81cd10d-e851-49c7-aa23-21901c71327a')): $__env->markAsRenderedOnce('f81cd10d-e851-49c7-aa23-21901c71327a');
$__env->startPush('scripts'); ?>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/js/adm_vigas_general.js']); ?>
  <?php $__env->stopPush(); endif; ?>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald56ab98830c2b53982542500711782ee)): ?>
<?php $attributes = $__attributesOriginald56ab98830c2b53982542500711782ee; ?>
<?php unset($__attributesOriginald56ab98830c2b53982542500711782ee); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald56ab98830c2b53982542500711782ee)): ?>
<?php $component = $__componentOriginald56ab98830c2b53982542500711782ee; ?>
<?php unset($__componentOriginald56ab98830c2b53982542500711782ee); ?>
<?php endif; ?>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\hcalculo\hcalculo\admvigageneral.blade.php ENDPATH**/ ?>