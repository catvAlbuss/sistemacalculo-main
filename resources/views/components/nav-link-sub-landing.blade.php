<div x-id="['dropdownNavbarLink', 'dropdownNavbar']">
  <button id="$id(dropdownNavbarLink)" data-dropdown-toggle="$id(dropdownNavbar)" aria-current="{{ $aria_current() }}"
    {{ $attributes->merge(['class' => $get_class() . ' flex w-full items-center justify-between px-3 py-2 md:w-auto md:border-0 md:p-0']) }}>{{ $name }}<svg
      class="ms-2.5 h-2.5 w-2.5" aria-hidden="true" fill="none" viewBox="0 0 10 6" xmlns="http://www.w3.org/2000/svg">
      <path d="m1 1 4 4 4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="currentColor" />
    </svg></button>
  <!-- Dropdown menu -->
  <div
    class="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white font-normal shadow-sm dark:divide-gray-600 dark:bg-gray-700"
    id="$id(dropdownNavbar)">
    {{ $slot }}
  </div>
</div>
