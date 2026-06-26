<?php if (! $__env->hasRenderedOnce('e7321d40-d833-40c3-a808-ad42b27eb4d7')): $__env->markAsRenderedOnce('e7321d40-d833-40c3-a808-ad42b27eb4d7');
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
<?php endif; ?><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/etabs/cad-sys.blade.php ENDPATH**/ ?>