<table class="w-full table-fixed text-gray-800 dark:text-white">
  <colgroup>
    <col style="width: 30%;">
    <col style="width: 10%;">
    <col style="width: 30%;">
    <col style="width: 15%;">
    <col style="width: 10%;">
  </colgroup>
  <?php if (isset($component)) { $__componentOriginal26ff29240af449da3d976e9f495e609e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal26ff29240af449da3d976e9f495e609e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.thead-calc','data' => ['title' => $title]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('thead-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($title)]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal26ff29240af449da3d976e9f495e609e)): ?>
<?php $attributes = $__attributesOriginal26ff29240af449da3d976e9f495e609e; ?>
<?php unset($__attributesOriginal26ff29240af449da3d976e9f495e609e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal26ff29240af449da3d976e9f495e609e)): ?>
<?php $component = $__componentOriginal26ff29240af449da3d976e9f495e609e; ?>
<?php unset($__componentOriginal26ff29240af449da3d976e9f495e609e); ?>
<?php endif; ?>
  <?php echo e($slot); ?>

</table>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\components\table-result.blade.php ENDPATH**/ ?>