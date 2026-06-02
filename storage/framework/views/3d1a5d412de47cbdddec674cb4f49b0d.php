<?php if (isset($component)) { $__componentOriginalf3b81297687dad7882e3608f7eb7a6d5 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalf3b81297687dad7882e3608f7eb7a6d5 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.cad.select-properties','data' => ['label' => 'Carga','bind' => ''.e($bind).'']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('cad.select-properties'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['label' => 'Carga','bind' => ''.e($bind).'']); ?>
  <option value="CM">CM</option>
  <option value="CV">CV</option>
  <option value="CVVM">CVV-</option>
  <option value="CVVP">CVV+</option>
  <option value="CN">CN</option>
  <option value="CLL">CLL</option>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalf3b81297687dad7882e3608f7eb7a6d5)): ?>
<?php $attributes = $__attributesOriginalf3b81297687dad7882e3608f7eb7a6d5; ?>
<?php unset($__attributesOriginalf3b81297687dad7882e3608f7eb7a6d5); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalf3b81297687dad7882e3608f7eb7a6d5)): ?>
<?php $component = $__componentOriginalf3b81297687dad7882e3608f7eb7a6d5; ?>
<?php unset($__componentOriginalf3b81297687dad7882e3608f7eb7a6d5); ?>
<?php endif; ?>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views/components/cad/load-select.blade.php ENDPATH**/ ?>