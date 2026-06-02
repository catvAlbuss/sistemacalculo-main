<?php if (! $__env->hasRenderedOnce('231cf0aa-61df-45a4-95ff-da4008c2ff23')): $__env->markAsRenderedOnce('231cf0aa-61df-45a4-95ff-da4008c2ff23');
$__env->startPush('initscripts'); ?>
<?php echo app('Illuminate\Foundation\Vite')('resources/js/etabs/main.js'); ?>
<?php echo app('Illuminate\Foundation\Vite')('resources/js/etabs/etabs_entry.js'); ?>
<?php $__env->stopPush(); endif; ?>

<?php if (isset($component)) { $__componentOriginald56ab98830c2b53982542500711782ee = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald56ab98830c2b53982542500711782ee = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.calc-layout','data' => ['title' => 'Etabs']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('calc-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Etabs']); ?>

    <div>
        
        <div id="cad-viewer-app" class="h-screen w-full"></div>

        
        <div
            x-data="cadSys"
            style="display: none;"
            id="alpine-cadsys-container">
            <canvas x-ref="drawingCanvas" style="display: none;"></canvas>
        </div>
    </div>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald56ab98830c2b53982542500711782ee)): ?>
<?php $attributes = $__attributesOriginald56ab98830c2b53982542500711782ee; ?>
<?php unset($__attributesOriginald56ab98830c2b53982542500711782ee); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald56ab98830c2b53982542500711782ee)): ?>
<?php $component = $__componentOriginald56ab98830c2b53982542500711782ee; ?>
<?php unset($__componentOriginald56ab98830c2b53982542500711782ee); ?>
<?php endif; ?><?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\components\etabs\cad-sys.blade.php ENDPATH**/ ?>