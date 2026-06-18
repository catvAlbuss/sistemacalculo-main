<?php if (! $__env->hasRenderedOnce('442acffc-14c3-4de3-ae53-8e25e1984177')): $__env->markAsRenderedOnce('442acffc-14c3-4de3-ae53-8e25e1984177');
$__env->startPush('initscripts'); ?>
    <?php echo app('Illuminate\Foundation\Vite')('resources/js/analisis_estructural_de_armaduras.js'); ?>
<?php $__env->stopPush(); endif; ?>

<div class="cad-text-color cad-bg cad-border flex h-screen flex-col" x-id="['materiales']" x-data="cadSys"
    x-init="initSys($refs.cad, $refs.distanceInput, $id('materiales'));
    $el.scrollIntoView({ behavior: 'smooth' })">
    <?php if (isset($component)) { $__componentOriginal6daf3514aefd5c5674d0056447e18f58 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal6daf3514aefd5c5674d0056447e18f58 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.new-model','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.new-model'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal6daf3514aefd5c5674d0056447e18f58)): ?>
<?php $attributes = $__attributesOriginal6daf3514aefd5c5674d0056447e18f58; ?>
<?php unset($__attributesOriginal6daf3514aefd5c5674d0056447e18f58); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal6daf3514aefd5c5674d0056447e18f58)): ?>
<?php $component = $__componentOriginal6daf3514aefd5c5674d0056447e18f58; ?>
<?php unset($__componentOriginal6daf3514aefd5c5674d0056447e18f58); ?>
<?php endif; ?>
    <!-- Se Agrego el modal de grid -->
    <?php if (isset($component)) { $__componentOriginal10074ea6e2498d0a9fd9f1711561b84c = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal10074ea6e2498d0a9fd9f1711561b84c = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.modals.diagonal-grid-modal','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.modals.diagonal-grid-modal'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal10074ea6e2498d0a9fd9f1711561b84c)): ?>
<?php $attributes = $__attributesOriginal10074ea6e2498d0a9fd9f1711561b84c; ?>
<?php unset($__attributesOriginal10074ea6e2498d0a9fd9f1711561b84c); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal10074ea6e2498d0a9fd9f1711561b84c)): ?>
<?php $component = $__componentOriginal10074ea6e2498d0a9fd9f1711561b84c; ?>
<?php unset($__componentOriginal10074ea6e2498d0a9fd9f1711561b84c); ?>
<?php endif; ?>
    <input id="_token" name="_token" type="hidden" value="<?php echo e(csrf_token()); ?>" />
    <?php if (isset($component)) { $__componentOriginal10c612dbc9002e5c5da245d736999e0e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal10c612dbc9002e5c5da245d736999e0e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.layout.toolbar','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.layout.toolbar'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal10c612dbc9002e5c5da245d736999e0e)): ?>
<?php $attributes = $__attributesOriginal10c612dbc9002e5c5da245d736999e0e; ?>
<?php unset($__attributesOriginal10c612dbc9002e5c5da245d736999e0e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal10c612dbc9002e5c5da245d736999e0e)): ?>
<?php $component = $__componentOriginal10c612dbc9002e5c5da245d736999e0e; ?>
<?php unset($__componentOriginal10c612dbc9002e5c5da245d736999e0e); ?>
<?php endif; ?>
    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
        <?php if (isset($component)) { $__componentOriginal8b721c7d5b9e3bf301c7efc954957aeb = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8b721c7d5b9e3bf301c7efc954957aeb = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.layout.side-panel','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.layout.side-panel'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8b721c7d5b9e3bf301c7efc954957aeb)): ?>
<?php $attributes = $__attributesOriginal8b721c7d5b9e3bf301c7efc954957aeb; ?>
<?php unset($__attributesOriginal8b721c7d5b9e3bf301c7efc954957aeb); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8b721c7d5b9e3bf301c7efc954957aeb)): ?>
<?php $component = $__componentOriginal8b721c7d5b9e3bf301c7efc954957aeb; ?>
<?php unset($__componentOriginal8b721c7d5b9e3bf301c7efc954957aeb); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal5060f46e4b59f3bd1852544f0856ca84 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5060f46e4b59f3bd1852544f0856ca84 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.layout.cad-area','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.layout.cad-area'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5060f46e4b59f3bd1852544f0856ca84)): ?>
<?php $attributes = $__attributesOriginal5060f46e4b59f3bd1852544f0856ca84; ?>
<?php unset($__attributesOriginal5060f46e4b59f3bd1852544f0856ca84); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5060f46e4b59f3bd1852544f0856ca84)): ?>
<?php $component = $__componentOriginal5060f46e4b59f3bd1852544f0856ca84; ?>
<?php unset($__componentOriginal5060f46e4b59f3bd1852544f0856ca84); ?>
<?php endif; ?>
    </div>
    <?php if (isset($component)) { $__componentOriginal8da35c20e1083c8a7b2ffec1b3e3166a = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal8da35c20e1083c8a7b2ffec1b3e3166a = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.layout.footer','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.layout.footer'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal8da35c20e1083c8a7b2ffec1b3e3166a)): ?>
<?php $attributes = $__attributesOriginal8da35c20e1083c8a7b2ffec1b3e3166a; ?>
<?php unset($__attributesOriginal8da35c20e1083c8a7b2ffec1b3e3166a); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal8da35c20e1083c8a7b2ffec1b3e3166a)): ?>
<?php $component = $__componentOriginal8da35c20e1083c8a7b2ffec1b3e3166a; ?>
<?php unset($__componentOriginal8da35c20e1083c8a7b2ffec1b3e3166a); ?>
<?php endif; ?>
</div><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/cad-sys.blade.php ENDPATH**/ ?>