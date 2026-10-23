<!-- resources/views/components/dropdown-sub.blade.php -->
@props(['label', 'links'])

@php
  $isActive = count(array_filter($links, fn($link) => request()->url() === strtok($link['url'], '?'))) > 0;
@endphp

<div class="relative" x-data="{ openSubmenu: false }" @click.outside="openSubmenu = false" @keydown.escape.stop.prevent="openSubmenu = false; $refs.subTrigger.focus()">
  <button type="button" x-ref="subTrigger" class="app-sub-trigger flex w-full items-center justify-between" @click.stop="openSubmenu = !openSubmenu"
    :aria-expanded="openSubmenu.toString()" aria-expanded="false" data-active="{{ $isActive ? 'true' : 'false' }}">
    {{ $label }}
    <span class="ms-1">
      <svg class="h-4 w-4 fill-current" x-show="!openSubmenu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd" />
      </svg>
      <svg class="h-4 w-4 fill-current" x-show="openSubmenu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
          clip-rule="evenodd" />
      </svg>
    </span>
  </button>
  <div class="app-sub-panel absolute left-full top-0 mt-2 w-40 rounded-md bg-white shadow-lg sm:w-48 dark:bg-gray-700"
    x-show="openSubmenu" style="display:none">
    @foreach ($links as $link)
      <x-dropdown-link :href="$link['url']" :active="request()->url() === strtok($link['url'], '?')">
        {{ $link['label'] }}
      </x-dropdown-link>
    @endforeach
  </div>
</div>
