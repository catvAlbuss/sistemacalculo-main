<table class="w-full table-fixed text-gray-800 dark:text-white">
  <colgroup>
    <col style="width: 40%;">
    <col style="width: 20%;">
    <col style="width: 20%;">
    <col style="width: 20%;">
  </colgroup>
  <?php if (isset($component)) { $__componentOriginal32662b1e0f50154e9014c1aa3520fb17 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal32662b1e0f50154e9014c1aa3520fb17 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.thead-calc-input','data' => ['title' => $title]] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('thead-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => \Illuminate\View\Compilers\BladeCompiler::sanitizeComponentAttribute($title)]); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal32662b1e0f50154e9014c1aa3520fb17)): ?>
<?php $attributes = $__attributesOriginal32662b1e0f50154e9014c1aa3520fb17; ?>
<?php unset($__attributesOriginal32662b1e0f50154e9014c1aa3520fb17); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal32662b1e0f50154e9014c1aa3520fb17)): ?>
<?php $component = $__componentOriginal32662b1e0f50154e9014c1aa3520fb17; ?>
<?php unset($__componentOriginal32662b1e0f50154e9014c1aa3520fb17); ?>
<?php endif; ?>
  <?php echo e($slot); ?>

</table>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\components\table-result-input.blade.php ENDPATH**/ ?>