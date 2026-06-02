<?php if (isset($component)) { $__componentOriginald56ab98830c2b53982542500711782ee = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald56ab98830c2b53982542500711782ee = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.calc-layout','data' => ['title' => '']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('calc-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => '']); ?>
    
    <?php echo $__env->make('hcalculo.memoria_calculo.partials.styles', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>

    <div class="py-2" x-data="memoriaCalculo">
        <div class="container mx-auto px-2 max-w-full">

            
            <?php echo $__env->make('hcalculo.memoria_calculo.partials.page-header', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                <div class="lg:col-span-3 space-y-4">
                    <?php echo $__env->make('hcalculo.memoria_calculo.partials.sidebar-nav', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                </div>

                
                <div class="lg:col-span-9 space-y-4">
                    <?php echo $__env->make('hcalculo.memoria_calculo.sections.informacion-general', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                    <?php echo $__env->make('hcalculo.memoria_calculo.sections.ubicacion', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                    <?php echo $__env->make('hcalculo.memoria_calculo.sections.parametros-sismicos', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                    <?php echo $__env->make('hcalculo.memoria_calculo.sections.tabla-resumen', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                    <?php echo $__env->make('hcalculo.memoria_calculo.sections.material-diseno', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                    <?php echo $__env->make('hcalculo.memoria_calculo.sections.analisis-cargas', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                    <?php echo $__env->make('hcalculo.memoria_calculo.sections.analisis-sismico', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                    <?php echo $__env->make('hcalculo.memoria_calculo.sections.diseno-elementos', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                    <!-- JHACK -->
                    <!-- SECCION 5 -->

                    <?php echo $__env->make('hcalculo.memoria_calculo.sections.diseno-estructura', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                    <!-- SECCION 6 -->
                    <?php echo $__env->make('hcalculo.memoria_calculo.sections.conclusiones-recomendaciones', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                </div>
            </div>

            
            <?php echo $__env->make('hcalculo.memoria_calculo.partials.export-button', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
        </div>
    </div>

    
    <?php if (! $__env->hasRenderedOnce('07817823-3efc-467e-b17a-95f2abe9f731')): $__env->markAsRenderedOnce('07817823-3efc-467e-b17a-95f2abe9f731');
$__env->startPush('initscripts'); ?>
        <script src="https://unpkg.com/docx@7.8.2/build/index.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
        <?php echo app('Illuminate\Foundation\Vite')('resources/js/documentos/memoria_calculo/index-refactored.js'); ?>
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
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views/hcalculo/admMemoriaCalculo.blade.php ENDPATH**/ ?>