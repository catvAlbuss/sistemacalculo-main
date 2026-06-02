<tr class="bg-white dark:bg-gray-800">
  <th class="py-2"><?php echo e($name ?? '-'); ?></th>
  <th class="py-2"><?php echo e($symbol ?? '-'); ?></th>
  <th class="py-2">
    <select class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
      x-model="<?php echo e($bind ?? ''); ?>" required>
      <?php $__currentLoopData = $options; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $option): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
        <option value='<?php echo e($option['value']); ?>' <?php if($option['selected'] ?? false): echo 'selected'; endif; ?>><?php echo e($option['name'] ?? $option['value']); ?>

        </option>
      <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </select>
  </th>
  <th class="py-2"><?php echo e($unit ?? '-'); ?></th>
</tr>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\components\input-select-calc.blade.php ENDPATH**/ ?>