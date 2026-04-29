{{-- resources/views/components/cad/etabs-menu-dropdown.blade.php --}}
@props(['label'])

<div class="relative" x-data="{ isOpen: false }" @keydown.esc.window="isOpen = false">
    <!-- Toggle Button estilo ribbon-button -->
    <button 
        class="cad-ribbon-button-hover-bg flex flex-col items-center justify-center rounded p-1 min-w-[72px]"
        @click="isOpen = !isOpen"
    >
        <div class="flex h-7 w-7 self-center">
            {{ $slot }}
        </div>
        <div class="flex flex-row items-center gap-1">
            <span class="text-xs">{{ $label }}</span>
            <svg class="size-3 transition-transform" :class="{'rotate-180': isOpen}" 
                 fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </div>
    </button>

    <!-- Dropdown Menu con scroll SOLO si es necesario -->
    <div 
        class="cad-bg cad-border z-50 border p-1 text-xs"
        x-anchor="$el.previousElementSibling"
        x-show="isOpen"
        @click.outside="isOpen = false"
        @keydown.down.prevent="$focus.wrap().next()"
        @keydown.up.prevent="$focus.wrap().previous()"
        style="display: none; min-width: 280px; max-height: 500px; overflow-y: auto;"
    >
        <div class="py-1">
            {{ $dropdown }}
        </div>
    </div>
</div>