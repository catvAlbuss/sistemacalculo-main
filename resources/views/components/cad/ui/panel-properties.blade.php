<div class="border-1 cad-border max-w-sm rounded-md bg-gray-100 text-xs shadow-md" x-data="{ open: true }">
  <div class="cad-input-properties-header">
    <button class="flex w-full items-center justify-between px-3 py-2 text-left font-semibold" @click="open = !open">
      <svg class="h-4 w-4" :class="open ? '' : '-rotate-90'" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7">
        </path>
      </svg>
      <span>{{ $title }}</span>
    </button>
  </div>
  <div class="p-2 text-xs" x-show="open">
    {{ $slot }}
  </div>
</div>
