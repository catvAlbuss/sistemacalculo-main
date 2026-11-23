<div class="cad-ribbon-split relative flex items-stretch" x-id="['drop']" x-data="{ isOpen: false }" @keydown.esc.window="isOpen = false">
  <button type="button" title="{{ $label }}" class="cad-ribbon-button cad-ribbon-button-hover-bg flex flex-col items-center justify-center rounded p-1"
    @click="{{ $clickHandler }}" :class="{{ $toggle }} ? 'cad-ribbon-button-bg' : ''">
    <span class="cad-ribbon-icon flex h-6 w-6 self-center" aria-hidden="true">{{ $slot1 }}</span>
    <span class="cad-ribbon-label">{{ $label }}</span>
  </button>
  <button type="button" class="cad-ribbon-expand cad-ribbon-button-hover-bg flex items-center rounded" :id="$id('drop')"
    aria-label="Opciones de {{ $label }}" aria-haspopup="true" :aria-expanded="isOpen"
    @click="isOpen = !isOpen">
    <svg class="size-3" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  </button>
  {{-- Fuera del scroll de herramientas para que las opciones no se recorten. --}}
  <template x-teleport="body">
    <div class="structural-ribbon-popup cad-bg cad-border z-50 border text-xs" role="group" aria-label="Opciones de {{ $label }}"
      x-anchor.bottom-start.offset.4="document.getElementById($id('drop'))"
      x-show="isOpen" x-cloak @click.outside="isOpen = false">
      {{ $slot2 }}
    </div>
  </template>
</div>
