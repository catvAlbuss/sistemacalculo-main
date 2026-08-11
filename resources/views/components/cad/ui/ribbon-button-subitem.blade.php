<div class="relative flex-1" x-id="['drop']" x-data="{ isOpen: false }" @keydown.esc.window="isOpen = false">
  <!-- Toggle Button -->
  <button class="cad-ribbon-button-hover-bg flex flex-col items-center justify-center rounded p-1" :id="$id('drop')"
    @click.self="{{ $clickHandler }}"
    :class="{{ $toggle }} ? 'cad-ribbon-button-bg' : ''">
    <div class="flex h-7 w-7 self-center" @click.self="{{ $clickHandler }}">{{ $slot1 }}</div>
    <div class="flex flex-row">
      <label class="text-xs">{{ $label }}</label>
    </div>
    <svg class="size-3 rotate-0" aria-hidden="true" @click.self="isOpen = ! isOpen" fill="none"
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  </button>
  <!-- Dropdown Menu -->
  <!-- <div class="cad-bg cad-border z-50 border mt-15 p-1 text-xs" role="menu" x-anchor="document.getElementById($id('drop'))"
    x-show="isOpen" @click.outside="isOpen = false" @keydown.down.prevent="$focus.wrap().next()"
    @keydown.up.prevent="$focus.wrap().previous()">
    {{ $slot2 }}
  </div> -->

  <!-- Dropdown Menu: se teletransporta a <body> para escapar el
       overflow-y-hidden del toolbar (si no, el navegador lo recorta ahí
       mismo, sin importar top/left ni z-index) y así flotar sobre el
       canvas 2D/3D en vez de quedar atrapado detrás. x-anchor conserva la
       referencia al botón aunque el nodo ya no esté al lado en el DOM. -->
  <template x-teleport="body">
    <div class="cad-bg cad-border z-50 border p-1 text-xs text-white" role="menu"
      x-anchor.bottom-start.offset.4="document.getElementById($id('drop'))"
      x-show="isOpen" x-cloak @click.outside="isOpen = false" @keydown.down.prevent="$focus.wrap().next()"
      @keydown.up.prevent="$focus.wrap().previous()">
      {{ $slot2 }}
    </div>
  </template>
</div>
