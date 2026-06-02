<style>
    /* Estilo por defecto para el tema claro */
    .logo {
        filter: invert(0);
    }

    /* Estilo para el tema oscuro */
    @media (prefers-color-scheme: dark) {
        .logo {
            filter: invert(1);
        }
    }
</style>
<img class="mx-auto rounded-full h-36 w-36 logo" src="<?php echo e(url('/assets/img/logo_rizabalAsociados.png')); ?>" alt="logo rizabal & asociados" style="width: 50px; height: 50px;"><?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\components\logo-empresa.blade.php ENDPATH**/ ?>