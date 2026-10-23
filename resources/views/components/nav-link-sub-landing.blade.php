@php($menuId = 'landing-menu-'.\Illuminate\Support\Str::slug($name))
<div x-data="{ open: false }" @click.outside="open = false" @keydown.escape.stop.prevent="open = false; $refs.trigger.focus()" class="relative">
  <button type="button" id="{{ $menuId }}-button" x-ref="trigger" @click="open = !open"
    :aria-expanded="open.toString()" aria-expanded="false" aria-controls="{{ $menuId }}"
    @keydown.arrow-down.prevent="open = true; $nextTick(() => $refs.panel.querySelector('a, button')?.focus())"
    {{ $attributes->merge(['class' => $get_class().' flex w-full items-center justify-between text-left']) }}>
    {{ $name }}
    <svg class="ms-2.5 h-2.5 w-2.5" aria-hidden="true" fill="none" viewBox="0 0 10 6"><path d="m1 1 4 4 4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="currentColor" /></svg>
  </button>
  <div x-show="open" x-ref="panel" style="display: none" id="{{ $menuId }}" aria-labelledby="{{ $menuId }}-button"
    class="en-dropdown-panel w-full xl:absolute xl:right-0 xl:w-64">
    {{ $slot }}
  </div>
</div>
