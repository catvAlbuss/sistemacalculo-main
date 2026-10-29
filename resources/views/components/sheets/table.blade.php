@props(['label', 'columns' => ['Parámetro', 'Símbolo', 'Fórmula', 'Resultado']])
<div class="arco-table-scroll" role="region" aria-label="{{ $label }}" tabindex="0">
    <table {{ $attributes->class(['arco-table beam-result-table']) }}>
        <thead><tr>@foreach($columns as $column)<th scope="col">{{ $column }}</th>@endforeach</tr></thead>
        {{ $slot }}
    </table>
</div>
