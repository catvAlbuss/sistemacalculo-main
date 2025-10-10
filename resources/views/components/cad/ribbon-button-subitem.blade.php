<div class="relative flex-1" x-id="['drop']" x-data="{ isOpen: false }" @keydown.esc.window="isOpen = false">
  <!-- Toggle Button -->
  <button class="cad-ribbon-button-hover-bg flex flex-col items-center justify-center rounded p-1" :id="$id('drop')"
    @click.self="{{ $clickHandler }}" x-data="{ toggle: false }" x-effect="toggle = {{ $toggle }}"
    :class="toggle ? 'cad-ribbon-button-bg' : ''">
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
  <div class="cad-bg cad-border z-50 border p-1 text-xs" role="menu" x-anchor="document.getElementById($id('drop'))"
    x-show="isOpen" @click.outside="isOpen = false" @keydown.down.prevent="$focus.wrap().next()"
    @keydown.up.prevent="$focus.wrap().previous()">
    {{ $slot2 }}
  </div>
</div>
