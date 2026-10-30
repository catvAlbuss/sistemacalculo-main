@props([
    'sheet', 'title', 'description',
    'entry' => null,
    'eyebrow' => 'Herramientas de ingeniería / Concreto armado',
    'auto' => false,
    'legacy' => false,
    'mathjax' => false,
])
{{-- entry:   módulo JS de la hoja. Las hojas Alpine registran su componente en 'initscripts' y no lo pasan.
     auto:    el estado de resultados lo gestiona sheets/auto.js (motores que no usan createSheetState).
     legacy:  la hoja conserva su marcado propio; se muestra a todo el ancho y calc-sheet.css
              (.sheet-legacy) lo adapta a la presentación de las hojas. Paso previo a migrarla a componentes.
     mathjax: carga MathJax (≈1 MB). Solo en hojas con fórmulas en la vista o cuyo motor llama a MathJax.typeset. --}}
<x-app-layout>
    @if($mathjax)<x-mathjax-loader />@endif
    <script>window.RZ_AUTH_USER_ID = @json(auth()->id() ?? 'guest');</script>
    <div {{ $attributes->class(['engineering-surface arco-sheet beam-sheet']) }} data-sheet="{{ $sheet }}" @if($auto) data-sheet-auto @endif>
        <div class="pr-shell">
            <x-engineering-header :eyebrow="$eyebrow" :title="$title" :description="$description" />
            @if($legacy)
                <div class="sheet-legacy">{{ $slot }}</div>
            @else
                <div class="arco-workbench beam-workbench">{{ $slot }}</div>
            @endif
        </div>
    </div>
    @pushOnce('styles')
        @vite('resources/css/calc-sheet.css')
    @endpushOnce
    @if($entry)
        @pushOnce('scripts')
            @vite($entry)
        @endpushOnce
    @endif
    @if($auto)
        @pushOnce('scripts')
            @vite('resources/js/sheets/auto.js')
        @endpushOnce
    @endif
</x-app-layout>
