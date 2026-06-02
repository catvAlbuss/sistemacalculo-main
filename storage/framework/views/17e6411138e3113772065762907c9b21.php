<?php $__env->startSection('mid'); ?>
  <h3 class="py-5 text-center text-2xl font-bold">Predim Version 1.0</h3>
  <p class="py-2 text-justify">Predim es un software intuitivo diseñado para facilitar el predimensionamiento
    de elementos estructurales como columnas, vigas, zapatas y losas. Similar a herramientas gráficas como
    Paint, Predim permite a los usuarios dibujar y definir estos elementos estructurales con medidas precisas.
    Su interfaz permite escalar los diseños, ajustando fácilmente las dimensiones de acuerdo a las necesidades
    del proyecto. Además, Predim cuenta con la capacidad de generar reportes detallados, proporcionando
    información técnica relevante y cálculos necesarios para una correcta ejecución del diseño. Es una
    herramienta eficiente para ingenieros civiles y arquitectos, optimizando el proceso de predimensionamiento
    y análisis preliminar.</p>
  <a href="<?php echo e(route('predim_v2')); ?>">
    <p class="text-justify"><span
        class="me-2 rounded border border-yellow-300 bg-yellow-100 px-2.5 py-0.5 text-4xl font-medium text-yellow-800 dark:bg-gray-700 dark:text-yellow-300">PRUEBALO</span>
    </p>
  </a>
  <br>
  <img class="bg-transparent" src="<?php echo e(Vite::asset('resources/img/desingra/predim.png')); ?>" alt="Predim">
<?php $__env->stopSection(); ?>

<?php $__env->startSection('top_left'); ?>
  <img class="bg-transparent" src="<?php echo e(Vite::asset('resources/img/desingra/desingpredim.png')); ?>" alt="Predim">
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.services', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\landing\predim.blade.php ENDPATH**/ ?>