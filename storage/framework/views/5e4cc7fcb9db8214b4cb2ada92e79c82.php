
<?php $attributes ??= new \Illuminate\View\ComponentAttributeBag;

$__newAttributes = [];
$__propNames = \Illuminate\View\ComponentAttributeBag::extractPropNames((['label']));

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

foreach (array_filter((['label']), 'is_string', ARRAY_FILTER_USE_KEY) as $__key => $__value) {
    $$__key = $$__key ?? $__value;
}

$__defined_vars = get_defined_vars();

foreach ($attributes->all() as $__key => $__value) {
    if (array_key_exists($__key, $__defined_vars)) unset($$__key);
}

unset($__defined_vars); ?>

<div class="relative" x-data="{ isOpen: false }" @keydown.esc.window="isOpen = false">
    <!-- Toggle Button estilo ribbon-button -->
    <button 
        class="cad-ribbon-button-hover-bg flex flex-col items-center justify-center rounded p-1 min-w-[72px]"
        @click="isOpen = !isOpen"
    >
        <div class="flex h-7 w-7 self-center">
            <?php echo e($slot); ?>

        </div>
        <div class="flex flex-row items-center gap-1">
            <span class="text-xs"><?php echo e($label); ?></span>
            <svg class="size-3 transition-transform" :class="{'rotate-180': isOpen}" 
                 fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </div>
    </button>

    <!-- Dropdown Menu con scroll SOLO si es necesario -->
    <div 
        class="cad-bg cad-border z-50 border p-1 text-xs"
        x-anchor="$el.previousElementSibling"
        x-show="isOpen"
        @click.outside="isOpen = false"
        @keydown.down.prevent="$focus.wrap().next()"
        @keydown.up.prevent="$focus.wrap().previous()"
        style="display: none; min-width: 280px; max-height: 500px; overflow-y: auto;"
    >
        <div class="py-1">
            <?php echo e($dropdown); ?>

        </div>
    </div>
</div><?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/cad/menu-dropdown-item.blade.php ENDPATH**/ ?>