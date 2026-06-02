<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames(([
    'label' => 'Label',
    'id' => 'input-id',
    'name' => 'input-name',
    'value' => '',
    'type' => 'text',
]));

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

foreach (array_filter(([
    'label' => 'Label',
    'id' => 'input-id',
    'name' => 'input-name',
    'value' => '',
    'type' => 'text',
]), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars); ?>

<div class="md:flex md:items-center mb-1">
    <div class="md:w-1/3">
        <label class="block text-xs text-gray-950 dark:text-gray-50 font-bold md:text-right mb-4 md:mb-0 pr-2" for="<?php echo e($id); ?>">
            <?php echo e($label); ?>

        </label>
    </div>
    <div class="md:w-2/3">
        <input
            class="bg-white text-xs appearance-none border-2 border-gray-950 rounded-lg w-full py-1 px-2 text-gray-950 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            id="<?php echo e($id); ?>" name="<?php echo e($name); ?>" type="<?php echo e($type); ?>" value="<?php echo e($value); ?>">
    </div>
</div>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\components\inputmuros.blade.php ENDPATH**/ ?>