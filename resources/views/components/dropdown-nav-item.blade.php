<x-dynamic-component :component="$component ?? 'nav-item'" :active="$active">
  <x-dropdown align="left" width="48">
    <x-slot name="trigger">
      <div
        class="inline-flex items-center rounded-md border border-transparent px-0 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none md:px-3 dark:text-gray-400 dark:hover:text-gray-300">
        {{ $name }}
        <div class="ms-1">
          <svg class="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </x-slot>
    <x-slot name="content">
      {{ $slot }}
    </x-slot>
  </x-dropdown>
</x-dynamic-component>
