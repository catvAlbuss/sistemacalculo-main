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
    <!-- <div id="cad-viewer-app" class="h-screen w-full"></div> -->

    <?php if (isset($component)) { $__componentOriginal89c89bad7dd19d06c9fbee7fac1e5967 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal89c89bad7dd19d06c9fbee7fac1e5967 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.etabs.cad-sys','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('etabs.cad-sys'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal89c89bad7dd19d06c9fbee7fac1e5967)): ?>
<?php $attributes = $__attributesOriginal89c89bad7dd19d06c9fbee7fac1e5967; ?>
<?php unset($__attributesOriginal89c89bad7dd19d06c9fbee7fac1e5967); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal89c89bad7dd19d06c9fbee7fac1e5967)): ?>
<?php $component = $__componentOriginal89c89bad7dd19d06c9fbee7fac1e5967; ?>
<?php unset($__componentOriginal89c89bad7dd19d06c9fbee7fac1e5967); ?>
<?php endif; ?>
    <!-- 
    <div x-data="cadSys" x-init="initSys($refs.drawingCanvas, null)" style="display: none;">
        
        <canvas x-ref="drawingCanvas" style="display: none;"></canvas>
    </div> -->
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

<!-- <?php echo app('Illuminate\Foundation\Vite')(['resources/js/etabs/main.js', 'resources/js/etabs/etabs_entry.js']); ?> --><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/etabs/index.blade.php ENDPATH**/ ?>