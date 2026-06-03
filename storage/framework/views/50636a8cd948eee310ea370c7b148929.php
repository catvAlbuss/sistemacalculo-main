<div class="relative flex-1" x-id="['drop']" x-data="{ isOpen: false }" @keydown.esc.window="isOpen = false">
  <!-- Toggle Button -->
  <button class="cad-ribbon-button-hover-bg flex flex-col items-center justify-center rounded p-1" :id="$id('drop')"
    @click.self="<?php echo e($clickHandler); ?>" x-data="{ toggle: false }" x-effect="toggle = <?php echo e($toggle); ?>"
    :class="toggle ? 'cad-ribbon-button-bg' : ''">
    <div class="flex h-7 w-7 self-center" @click.self="<?php echo e($clickHandler); ?>"><?php echo e($slot1); ?></div>
    <div class="flex flex-row">
      <label class="text-xs"><?php echo e($label); ?></label>
    </div>
    <svg class="size-3 rotate-0" aria-hidden="true" @click.self="isOpen = ! isOpen" fill="none"
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  </button>
  <!-- Dropdown Menu -->
  <div class="cad-bg cad-border z-50 border p-1 text-xs" role="menu" x-anchor="document.getElementById($id('drop'))"
    x-show="isOpen" @click.outside="isOpen = false" @keydown.down.prevent="$focus.wrap().next()"
    @keydown.up.prevent="$focus.wrap().previous()">
    <?php echo e($slot2); ?>

  </div>
</div>
<?php /**PATH C:\laragon\www\sistemacalculo-main\resources\views/components/cad/ribbon-button-subitem.blade.php ENDPATH**/ ?>