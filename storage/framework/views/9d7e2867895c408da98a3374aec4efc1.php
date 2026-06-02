<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames(([
    'label' => 'Label',
    'id' => 'input-id',
    'name' => 'input-name',
    'disabled' => false,
    'multiple' => false
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
    'disabled' => false,
    'multiple' => false
]), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars); ?>



<div class="md:flex md:items-center mb-2">
    <div class="md:w-1/3">
        <label class="block text-xs text-gray-950 font-bold md:text-right mb-1 md:mb-0 pr-4" for="<?php echo e($id); ?>">
            <?php echo e($label); ?>

        </label>
    </div>
    <div class="md:w-2/3">
        <select id="<?php echo e($id); ?>" name="<?php echo e($name); ?>" <?php echo e($disabled ? 'disabled' : ''); ?> <?php echo $attributes->merge(['class' => 'bg-white appearance-none border-2 border-gray-950 rounded-lg w-full py-2 px-4 text-gray-950 leading-tight focus:outline-none focus:bg-white focus:border-blue-500']); ?> <?php echo e($multiple ? 'multiple' : ''); ?>>
            <?php echo e($slot); ?>

        </select>

        
    </div>
</div>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\components\inputmurosSelect.blade.php ENDPATH**/ ?>