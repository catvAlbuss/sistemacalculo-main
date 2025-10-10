<!-- resources/views/components/dropdown-sub.blade.php -->
@props(['label', 'links'])

@php
  // $isActive = array_any($links, fn($link) => request()->routeIs($link['url']));
  $isActive = count(array_filter($links, fn($link) => request()->routeIs($link['url']))) > 0;
@endphp

<div class="relative" x-data="{ openSubmenu: false }" @click.outside="openSubmenu = false">
  <x-dropdown-item class="inline-flex cursor-pointer items-center" @click.stop="openSubmenu = !openSubmenu"
    :active="$isActive">
    {{ $label }}
    <div class="ms-1">
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
    </div>
  </x-dropdown-item>
  <div class="absolute left-full top-0 mt-2 w-40 rounded-md bg-white shadow-lg sm:w-48 dark:bg-gray-700"
    x-show="openSubmenu">
    @foreach ($links as $link)
      <x-dropdown-link :href="url(route($link['url']))" :active="request()->routeIs($link['url'])">
        {{ $link['label'] }}
      </x-dropdown-link>
    @endforeach
  </div>
</div>
