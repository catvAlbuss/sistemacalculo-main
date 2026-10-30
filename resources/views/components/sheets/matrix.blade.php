@props(['id', 'title', 'note' => ''])
{{-- Contenedor de una grilla editable (Tabulator o Handsontable). El motor monta la grilla en #id. --}}
<div class="beam-matrix-panel">
    <h3>{{ $title }}</h3>
    @if($note)<p class="arco-note">{{ $note }}</p>@endif
    <div id="{{ $id }}" {{ $attributes->class(['beam-input-matrix']) }} role="region" aria-label="{{ $title }}" tabindex="0"></div>
</div>
