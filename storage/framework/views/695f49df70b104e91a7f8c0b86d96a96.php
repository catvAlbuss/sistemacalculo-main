<div class="mb-2 flex items-center">
  <label class="w-1/3 text-xs font-bold text-gray-700" for="input">
    <?php echo e($label); ?>

  </label>
  <select
    class="w-4/5 rounded-md border bg-gray-50 px-1 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
    id="input" name="input" @change="<?php echo $handleInput ?? ''; ?>" x-model="<?php echo e($bind); ?>"
    <?php if($disabled ?? false): echo 'disabled'; endif; ?>><?php echo e($slot); ?></select>
</div>
<?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/cad/select-properties.blade.php ENDPATH**/ ?>