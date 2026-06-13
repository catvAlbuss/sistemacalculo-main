<?php $__env->startSection('content'); ?>
    <!-- Navbar -->
    <?php if (isset($component)) { $__componentOriginal103e4e452ea194f52c496b1a4f091b5b = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal103e4e452ea194f52c496b1a4f091b5b = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.navigation-landing','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('navigation-landing'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal103e4e452ea194f52c496b1a4f091b5b)): ?>
<?php $attributes = $__attributesOriginal103e4e452ea194f52c496b1a4f091b5b; ?>
<?php unset($__attributesOriginal103e4e452ea194f52c496b1a4f091b5b); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal103e4e452ea194f52c496b1a4f091b5b)): ?>
<?php $component = $__componentOriginal103e4e452ea194f52c496b1a4f091b5b; ?>
<?php unset($__componentOriginal103e4e452ea194f52c496b1a4f091b5b); ?>
<?php endif; ?>

    <!-- Main Content -->
    <?php echo $__env->yieldContent('main'); ?>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.base', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/layouts/landing.blade.php ENDPATH**/ ?>