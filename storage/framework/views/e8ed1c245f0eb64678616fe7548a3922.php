<?php
  $inputs = [];
?>

<?php if (! $__env->hasRenderedOnce('a065ae5a-91d7-4926-8279-6461b0ca919e')): $__env->markAsRenderedOnce('a065ae5a-91d7-4926-8279-6461b0ca919e');
$__env->startPush('initscripts'); ?>
  <?php echo app('Illuminate\Foundation\Vite')('resources/js/diseno_acero_data.js'); ?>
<?php $__env->stopPush(); endif; ?>

<?php if (isset($component)) { $__componentOriginald56ab98830c2b53982542500711782ee = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald56ab98830c2b53982542500711782ee = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.calc-layout','data' => ['title' => 'Diseño En Acero | Compresion']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('calc-layout'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => 'Diseño En Acero | Compresion']); ?>
  <div class="container mx-auto flex flex-row flex-wrap space-x-4 py-12 md:flex-nowrap" x-data="diseño_acero">
    <?php if (isset($component)) { $__componentOriginal972b1b5c97475366ed0a22d1c711afd2 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal972b1b5c97475366ed0a22d1c711afd2 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-data','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-data'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
      <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['symbol' => 'ΩC','bind' => 'calcs.compresionOmegac']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'ΩC','bind' => 'calcs.compresionOmegac']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['bind' => 'calcs.compresionPhic','symbol' => '∅C']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionPhic','symbol' => '∅C']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['unit' => 'Kg/cm2','symbol' => 'Fy','bind' => 'calcs.compresionFy']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['unit' => 'Kg/cm2','symbol' => 'Fy','bind' => 'calcs.compresionFy']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['bind' => 'calcs.compresionE','unit' => 'Kg/cm2','symbol' => 'E']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionE','unit' => 'Kg/cm2','symbol' => 'E']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['bind' => 'calcs.compresionA','symbol' => 'A','unit' => 'cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionA','symbol' => 'A','unit' => 'cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['bind' => 'calcs.compresionKy','symbol' => 'Ky']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionKy','symbol' => 'Ky']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['bind' => 'calcs.compresionLy','symbol' => 'Ly','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionLy','symbol' => 'Ly','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['bind' => 'calcs.compresionRy','symbol' => 'ry','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionRy','symbol' => 'ry','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['symbol' => 'Kx','bind' => 'calcs.compresionKx']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'Kx','bind' => 'calcs.compresionKx']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['symbol' => 'Lx','bind' => 'calcs.compresionLx','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'Lx','bind' => 'calcs.compresionLx','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginal5d31ba86fdb35b84381448d23848981e = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5d31ba86fdb35b84381448d23848981e = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.input-calc','data' => ['symbol' => 'rx','bind' => 'calcs.compresionRx','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('input-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'rx','bind' => 'calcs.compresionRx','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $attributes = $__attributesOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__attributesOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5d31ba86fdb35b84381448d23848981e)): ?>
<?php $component = $__componentOriginal5d31ba86fdb35b84381448d23848981e; ?>
<?php unset($__componentOriginal5d31ba86fdb35b84381448d23848981e); ?>
<?php endif; ?>
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal972b1b5c97475366ed0a22d1c711afd2)): ?>
<?php $attributes = $__attributesOriginal972b1b5c97475366ed0a22d1c711afd2; ?>
<?php unset($__attributesOriginal972b1b5c97475366ed0a22d1c711afd2); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal972b1b5c97475366ed0a22d1c711afd2)): ?>
<?php $component = $__componentOriginal972b1b5c97475366ed0a22d1c711afd2; ?>
<?php unset($__componentOriginal972b1b5c97475366ed0a22d1c711afd2); ?>
<?php endif; ?>
    <?php if (isset($component)) { $__componentOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-data','data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-data'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
      <?php if (isset($component)) { $__componentOriginal5a5a08b62ada10fefbf99758a4ed2814 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal5a5a08b62ada10fefbf99758a4ed2814 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.table-result-input','data' => ['title' => '1.- Prerequisitos del Diseño']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('table-result-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => '1.- Prerequisitos del Diseño']); ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['symbol' => 'ΩC','bind' => 'calcs.compresionOmegac']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'ΩC','bind' => 'calcs.compresionOmegac']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['bind' => 'calcs.compresionPhic','symbol' => '∅C']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionPhic','symbol' => '∅C']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['unit' => 'Kg/cm2','symbol' => 'Fy','bind' => 'calcs.compresionFy']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['unit' => 'Kg/cm2','symbol' => 'Fy','bind' => 'calcs.compresionFy']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['bind' => 'calcs.compresionE','unit' => 'Kg/cm2','symbol' => 'E']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionE','unit' => 'Kg/cm2','symbol' => 'E']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['bind' => 'calcs.compresionA','symbol' => 'A','unit' => 'cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionA','symbol' => 'A','unit' => 'cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['bind' => 'calcs.compresionKy','symbol' => 'Ky']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionKy','symbol' => 'Ky']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['bind' => 'calcs.compresionLy','symbol' => 'Ly','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionLy','symbol' => 'Ly','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['bind' => 'calcs.compresionRy','symbol' => 'ry','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionRy','symbol' => 'ry','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['bind' => 'calcs.compresionKlRy','symbol' => 'KL/ry']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['bind' => 'calcs.compresionKlRy','symbol' => 'KL/ry']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['symbol' => 'Kx','bind' => 'calcs.compresionKx']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'Kx','bind' => 'calcs.compresionKx']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['symbol' => 'Lx','bind' => 'calcs.compresionLx','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'Lx','bind' => 'calcs.compresionLx','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['symbol' => 'rx','bind' => 'calcs.compresionRx','unit' => 'cm']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'rx','bind' => 'calcs.compresionRx','unit' => 'cm']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc-input','data' => ['symbol' => 'KL/rx','bind' => 'calcs.compresionKlRx']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc-input'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'KL/rx','bind' => 'calcs.compresionKlRx']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $attributes = $__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__attributesOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675)): ?>
<?php $component = $__componentOriginal849ed52f0f10ed42596ba2b8f0e57675; ?>
<?php unset($__componentOriginal849ed52f0f10ed42596ba2b8f0e57675); ?>
<?php endif; ?>
       <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal5a5a08b62ada10fefbf99758a4ed2814)): ?>
<?php $attributes = $__attributesOriginal5a5a08b62ada10fefbf99758a4ed2814; ?>
<?php unset($__attributesOriginal5a5a08b62ada10fefbf99758a4ed2814); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal5a5a08b62ada10fefbf99758a4ed2814)): ?>
<?php $component = $__componentOriginal5a5a08b62ada10fefbf99758a4ed2814; ?>
<?php unset($__componentOriginal5a5a08b62ada10fefbf99758a4ed2814); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.table-result','data' => ['title' => '2.- Compresión']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('table-result'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => '2.- Compresión']); ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['formula' => '$$4.71\sqrt{\frac{E}{F_y}}$$','bind' => 'calcs.compresionEfy']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['formula' => '$$4.71\sqrt{\frac{E}{F_y}}$$','bind' => 'calcs.compresionEfy']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => 'KL/ry','bind' => 'calcs.compresionKlRyMenorMayor']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => 'KL/ry','bind' => 'calcs.compresionKlRyMenorMayor']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => '$$Fe_y$$','bind' => 'calcs.compresionFey','unit' => 'Kg/cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => '$$Fe_y$$','bind' => 'calcs.compresionFey','unit' => 'Kg/cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => '$$Fcr_y$$','bind' => 'calcs.compresionFcry','unit' => 'Kg/cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => '$$Fcr_y$$','bind' => 'calcs.compresionFcry','unit' => 'Kg/cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => '$$Fe_x$$','bind' => 'calcs.compresionFex','unit' => 'Kg/cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => '$$Fe_x$$','bind' => 'calcs.compresionFex','unit' => 'Kg/cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['symbol' => '$$Fcr_x$$','bind' => 'calcs.compresionFcrx','unit' => 'Kg/cm2']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['symbol' => '$$Fcr_x$$','bind' => 'calcs.compresionFcrx','unit' => 'Kg/cm2']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
       <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893)): ?>
<?php $attributes = $__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893; ?>
<?php unset($__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893)): ?>
<?php $component = $__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893; ?>
<?php unset($__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.table-result','data' => ['title' => '3.- Metodo LFRD']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('table-result'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => '3.- Metodo LFRD']); ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['formula' => '$$\phi F_{\text{cr}_y} A_g$$','symbol' => '$$\phi P_{n_y}$$','bind' => 'calcs.compresionLFRDFcrAgy','unit' => 'Kg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['formula' => '$$\phi F_{\text{cr}_y} A_g$$','symbol' => '$$\phi P_{n_y}$$','bind' => 'calcs.compresionLFRDFcrAgy','unit' => 'Kg']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['formula' => '$$\phi F_{\text{cr}_y} A_g$$','symbol' => '$$\phi P_{n_y}$$','bind' => 'calcs.compresionLFRDFcrAg1000y','unit' => 'Tn']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['formula' => '$$\phi F_{\text{cr}_y} A_g$$','symbol' => '$$\phi P_{n_y}$$','bind' => 'calcs.compresionLFRDFcrAg1000y','unit' => 'Tn']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['formula' => '$$\phi F_{\text{cr}_x} A_g$$','symbol' => '$$\phi P_{n_x}$$','bind' => 'calcs.compresionLFRDFcrAgx','unit' => 'Kg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['formula' => '$$\phi F_{\text{cr}_x} A_g$$','symbol' => '$$\phi P_{n_x}$$','bind' => 'calcs.compresionLFRDFcrAgx','unit' => 'Kg']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['formula' => '$$\phi F_{\text{cr}_x} A_g$$','symbol' => '$$\phi P_{n_x}$$','bind' => 'calcs.compresionLFRDFcrAg1000x','unit' => 'Tn']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['formula' => '$$\phi F_{\text{cr}_x} A_g$$','symbol' => '$$\phi P_{n_x}$$','bind' => 'calcs.compresionLFRDFcrAg1000x','unit' => 'Tn']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
       <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893)): ?>
<?php $attributes = $__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893; ?>
<?php unset($__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893)): ?>
<?php $component = $__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893; ?>
<?php unset($__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893); ?>
<?php endif; ?>
      <?php if (isset($component)) { $__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.table-result','data' => ['title' => '4.- Metodo ASD']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('table-result'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['title' => '4.- Metodo ASD']); ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['formula' => '$$\frac{P_{n_y}}{\Omega t}$$','bind' => 'calcs.compresionASDPnOmegaTy','unit' => 'Kg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['formula' => '$$\frac{P_{n_y}}{\Omega t}$$','bind' => 'calcs.compresionASDPnOmegaTy','unit' => 'Kg']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['formula' => '$$\frac{P_{n_y}}{\Omega t}$$','bind' => 'calcs.compresionASDPnOmegaT1000y','unit' => 'Tn']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['formula' => '$$\frac{P_{n_y}}{\Omega t}$$','bind' => 'calcs.compresionASDPnOmegaT1000y','unit' => 'Tn']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['formula' => '$$\frac{P_{n_x}}{\Omega t}$$','bind' => 'calcs.compresionASDPnOmegaTx','unit' => 'Kg']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['formula' => '$$\frac{P_{n_x}}{\Omega t}$$','bind' => 'calcs.compresionASDPnOmegaTx','unit' => 'Kg']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
        <?php if (isset($component)) { $__componentOriginal3dbd4816ae12e9673655693df102def9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal3dbd4816ae12e9673655693df102def9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => 'components.output-calc','data' => ['formula' => '$$\frac{P_{n_x}}{\Omega t}$$','bind' => 'calcs.compresionASDPnOmegaT1000x','unit' => 'Tn']] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('output-calc'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes(['formula' => '$$\frac{P_{n_x}}{\Omega t}$$','bind' => 'calcs.compresionASDPnOmegaT1000x','unit' => 'Tn']); ?> <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $attributes = $__attributesOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__attributesOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal3dbd4816ae12e9673655693df102def9)): ?>
<?php $component = $__componentOriginal3dbd4816ae12e9673655693df102def9; ?>
<?php unset($__componentOriginal3dbd4816ae12e9673655693df102def9); ?>
<?php endif; ?>
       <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893)): ?>
<?php $attributes = $__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893; ?>
<?php unset($__attributesOriginald2725d78b1f4b86e010ec6e0fe8f2893); ?>
<?php endif; ?>
<?php if (isset($__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893)): ?>
<?php $component = $__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893; ?>
<?php unset($__componentOriginald2725d78b1f4b86e010ec6e0fe8f2893); ?>
<?php endif; ?>
     <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5)): ?>
<?php $attributes = $__attributesOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5; ?>
<?php unset($__attributesOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5)): ?>
<?php $component = $__componentOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5; ?>
<?php unset($__componentOriginal9aa7ba632cdf8cde6e99bb2a2796b0a5); ?>
<?php endif; ?>
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
<?php endif; ?>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\hcalculo\diseno_en_acero\compresion.blade.php ENDPATH**/ ?>