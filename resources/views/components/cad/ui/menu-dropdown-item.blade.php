{{-- resources/views/components/cad/ui/menu-dropdown-item.blade.php
     Ítem del menú superior (Archivo, Editar, Vista, ...). Diseño horizontal
     compacto (ícono + etiqueta + chevron en una sola fila) en vez del
     ícono/etiqueta/chevron apilados en 3 líneas de antes — ahorra bastante
     alto en la barra de menú. --}}
@props(['label'])

<div class="relative" x-data="{ isOpen: false }" @keydown.esc.window="isOpen = false">
    <!-- Toggle Button -->
    <button
        type="button"
        class="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700/60 hover:text-white"
        :class="isOpen ? 'bg-gray-700/80 text-white' : ''"
        @click="isOpen = !isOpen">
        <span class="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400 [&>svg]:h-4 [&>svg]:w-4">
            {{ $slot }}
        </span>
        <span class="whitespace-nowrap">{{ $label }}</span>
        <svg class="size-3 shrink-0 text-gray-500 transition-transform duration-150" :class="{'rotate-180': isOpen}"
            fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    </button>

    <!-- Dropdown Menu con scroll SOLO si es necesario -->
    <div
        class="cad-bg cad-border z-50 mt-1 rounded-md border p-1 text-xs shadow-2xl min-w-[280px] max-h-[600px] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/50"
        x-anchor="$el.previousElementSibling"
        x-show="isOpen"
        x-cloak
        @click.outside="isOpen = false"
        @keydown.down.prevent="$focus.wrap().next()"
        @keydown.up.prevent="$focus.wrap().previous()"
        style="display: none;">
        <div class="py-1">
            {{ $dropdown }}
        </div>
    </div>

</div>