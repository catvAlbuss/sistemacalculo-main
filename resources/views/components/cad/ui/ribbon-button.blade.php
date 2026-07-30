<button class="flex h-full flex-col items-center justify-center self-center rounded px-1.5 py-1 text-center cad-ribbon-button-hover-bg"
    @click="{{ $clickHandler }}"
    :class="{{ $toggle }} ? 'cad-ribbon-button-bg' : ''">
    <div class="flex h-6 w-6 self-center">{{ $slot }}</div>
    <label class="text-[10px] leading-tight">{{ $label }}</label>
</button>
