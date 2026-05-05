{{-- resources/views/components/cad/menu-subitem.blade.php --}}
@props(['label'])

<div x-data="{ 
    open: false, 
    submenuStyle: '',
    timeout: null,
    openSubmenu() {
        clearTimeout(this.timeout);
        const btn = this.$el.querySelector('.submenu-btn');
        if (btn) {
            const rect = btn.getBoundingClientRect();
            this.submenuStyle = `position: fixed; top: ${rect.top}px; left: ${rect.right + 5}px; min-width: 200px; z-index: 1000;`;
        }
        this.open = true;
    },
    closeSubmenu() {
        this.timeout = setTimeout(() => {
            this.open = false;
        }, 100);
    },
    cancelClose() {
        clearTimeout(this.timeout);
    }
}" 
     @mouseenter="openSubmenu()"
     @mouseleave="closeSubmenu()"
     class="relative">
    
    <div class="submenu-btn dropdown-item w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center justify-between gap-2 cursor-pointer">
        <div class="flex items-center gap-2">
            <span class="inline-block w-5">{{ $slot }}</span>
            <span>{{ $label }}</span>
        </div>
        <svg class="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
    </div>
    
    <div x-show="open" 
         x-cloak
         class="bg-gray-800 border border-gray-700 rounded-md shadow-xl"
         x-bind:style="submenuStyle"
         @mouseenter="cancelClose()"
         @mouseleave="closeSubmenu()"
         style="display: none;">
        <div class="py-1" style="overflow-y: visible; overflow-x: visible;">
            {{ $submenu }}
        </div>
    </div>
</div>