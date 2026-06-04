<div class="mb-2 flex items-center" x-data="{ value: <?php echo e($bind ?? ($minimun ?? 0)); ?> }"
  <?php if(isset($bind)): ?>
    x-effect="value=<?php echo e($bind); ?>"
<?php endif; ?>>
  <label class="w-1/3 text-xs font-bold text-gray-700" for="input">
    <?php echo e($label); ?>

  </label>
  <input
    class="w-4/5 rounded-md border bg-gray-50 px-1 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
    id="input" type="number" max='<?php echo e($max ?? 'any'); ?>' step='<?php echo e($step ?? 'any'); ?>' x-model.number="value"
    <?php if(isset($minimun) && isset($bind)): ?> @input="if(value <<?php echo e($minimun); ?>) { value=<?php echo e($minimun); ?>; } else { <?php echo e($bind); ?> = value;<?php echo e($handleInput); ?> }"
        <?php else: ?>
            @input="<?php echo e($bind); ?> = value;<?php echo e($handleInput); ?>" <?php endif; ?>
    <?php if(isset($disabled) ? $disabled : false): ?> disabled <?php endif; ?>>
</div>
<?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/cad/input-properties.blade.php ENDPATH**/ ?>