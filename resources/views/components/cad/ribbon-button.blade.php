<button class="flex flex-col self-center justify-center text-center h-full p-1 rounded cad-ribbon-button-hover-bg"
    @click="{{ $clickHandler }}" x-data="{ toggle: false }" x-effect="toggle = {{ $toggle }}"
    :class="toggle ? 'cad-ribbon-button-bg' : ''">
    <div class="w-7 h-7 flex self-center">{{ $slot }}</div>
    <label class="text-xs">{{ $label }}</label>
</button>
