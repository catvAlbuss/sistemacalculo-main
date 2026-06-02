<?php $__env->startSection('content'); ?>
<?php $__env->startSection('navigation'); ?>
  <?php
$__split = function ($name, $params = []) {
    return [$name, $params];
};
[$__name, $__params] = $__split('layout.navigation', []);

$__html = app('livewire')->mount($__name, $__params, 'lw-1432652134-0', $__slots ?? [], get_defined_vars());

echo $__html;

unset($__html);
unset($__name);
unset($__params);
unset($__split);
if (isset($__slots)) unset($__slots);
?>
<?php echo $__env->yieldSection(); ?>

<!-- Page Heading -->
<?php if(isset($header)): ?>
  <header class="bg-white shadow dark:bg-gray-800">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <?php echo e($header); ?>

    </div>
  </header>
<?php endif; ?>

<!-- Page Content -->
<main>
  <?php echo e($slot); ?>

</main>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.base', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views/layouts/main.blade.php ENDPATH**/ ?>