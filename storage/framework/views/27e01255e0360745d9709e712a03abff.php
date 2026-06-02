<button class="flex flex-col self-center justify-center text-center h-full p-1 rounded cad-ribbon-button-hover-bg"
    @click="<?php echo e($clickHandler); ?>"
    :class="<?php echo e($toggle); ?> ? 'cad-ribbon-button-bg' : ''">
    <div class="w-7 h-7 flex self-center"><?php echo e($slot); ?></div>
    <label class="text-xs"><?php echo e($label); ?></label>
</button>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views/components/cad/ribbon-button.blade.php ENDPATH**/ ?>