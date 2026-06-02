<tr class="bg-gray-100 text-center dark:bg-gray-600">
  <td class="py-2 pl-4 text-left"><?php echo e($name ?? '-'); ?></td>
  <td class="py-2"><?php echo e($symbol ?? '-'); ?></td>
  <td class="py-2"><?php echo e($formula ?? '-'); ?></td>
  <td class="py-2"><span class='<?php echo e($bind); ?>' 
      x-text='format("<?php echo e($bind); ?>",<?php echo e($bind); ?>)' x-effect="highlight($el, <?php echo e($bind); ?>)"></span>
  </td>
  <td class="py-2"><?php echo e($unit ?? ''); ?></td>
</tr>
<?php /**PATH C:\laragon\www\rizabalAsociadosActualizadoServer\resources\views\components\output-calc.blade.php ENDPATH**/ ?>