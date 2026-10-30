@props(['id', 'empty' => 'Los resultados aparecerán al calcular.', 'ready' => false])
{{-- Destino de los resultados que escribe el motor (JS o HTML del servidor). sheets/auto.js observa este nodo.
     ready: el contenido inicial ya corresponde a los datos por defecto (motores reactivos). --}}
<div id="{{ $id }}" {{ $attributes->class(['arco-result-sections sheet-results']) }} data-sheet-results @if($ready) data-sheet-ready @endif>
    @if($slot->isEmpty())
        <div class="pr-panel beam-results-empty" data-sheet-empty><p class="arco-note">{{ $empty }}</p></div>
    @else
        {{ $slot }}
    @endif
</div>
