<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames((['name' => '-', 'symbol' => '-', 'attr' => [], 'bind' => '', 'unit' => '-']));

foreach ($attributes->all() as $__key => $__value) {
    if (in_array($__key, $__propNames)) {
        $$__key = $$__key ?? $__value;
    } else {
        $__newAttributes[$__key] = $__value;
    }
}

$attributes = new \Illuminate\View\ComponentAttributeBag($__newAttributes);

unset($__propNames);
unset($__newAttributes);

foreach (array_filter((['name' => '-', 'symbol' => '-', 'attr' => [], 'bind' => '', 'unit' => '-']), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars); ?>

<tr class="bg-white dark:bg-gray-800">
  <th class="py-2"><?php echo e($name); ?></th>
  <th class="py-2"><?php echo e($symbol); ?></th>
  <th class="py-2"><input
      class="form-control w-full rounded-md bg-gray-50 p-2 px-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
      type="number" <?php echo e($attributes->merge($attr)); ?> step="any" x-model.number="<?php echo e($bind); ?>" required>
  </th>
  <th class="py-2"><?php echo e($unit); ?></th>
</tr>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\components\input-calc.blade.php ENDPATH**/ ?>