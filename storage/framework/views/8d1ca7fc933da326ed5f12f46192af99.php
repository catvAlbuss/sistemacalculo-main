<div class="cad-panel-body overflow-auto" :class="isOpen ? 'flex-1' : ''" x-data="{ isOpen: true }" x-init="<?php echo e($init); ?>">
  <div class="cad-panel-title sticky top-0 flex flex-row" @click="isOpen = !isOpen">
    <svg class="collapse-icon h-4 w-4 transition-transform duration-200" :class="isOpen ? '' : '-rotate-90'"
      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
    </svg>
    <h2><?php echo e($title); ?></h2>
  </div>
  <div class="" x-show="isOpen">
    <?php echo e($slot); ?>

  </div>
</div>
<?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/cad/panel.blade.php ENDPATH**/ ?>