<button type="button" title="{{ $label }}" class="cad-ribbon-button flex h-full flex-col items-center justify-center self-center rounded px-1.5 py-1 text-center cad-ribbon-button-hover-bg"
    @click="{{ $clickHandler }}"
    :class="{{ $toggle }} ? 'cad-ribbon-button-bg' : ''">
    <span class="cad-ribbon-icon flex h-6 w-6 self-center" aria-hidden="true">{{ $slot }}</span>
    {{-- w-16: las etiquetas largas ("Reacciones por Caso...", "Ocultar
         etiq. losas") envuelven a 2 líneas en vez de estirar el botón --
         reduce bastante el ancho total de la barra de herramientas. --}}
    <span class="cad-ribbon-label w-16 text-[10px] leading-tight">{{ $label }}</span>
</button>
