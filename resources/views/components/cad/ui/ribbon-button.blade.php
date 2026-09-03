<button class="flex h-full flex-col items-center justify-center self-center rounded px-1.5 py-1 text-center cad-ribbon-button-hover-bg"
    @click="{{ $clickHandler }}"
    :class="{{ $toggle }} ? 'cad-ribbon-button-bg' : ''">
    <div class="flex h-6 w-6 self-center">{{ $slot }}</div>
    {{-- w-16: las etiquetas largas ("Reacciones por Caso...", "Ocultar
         etiq. losas") envuelven a 2 líneas en vez de estirar el botón --
         reduce bastante el ancho total de la barra de herramientas. --}}
    <label class="w-16 text-[10px] leading-tight">{{ $label }}</label>
</button>
