@props(['title', 'spans', 'points' => ['Inicio', 'Centro', 'Final']])
{{-- Encabezado de una sección de resultados por tramo: Parámetro, Símbolo y Fórmula fijos a la izquierda
     y, por cada tramo, sus puntos (inicio, centro y final). --}}
<thead class="sheet-span-head">
    <tr class="sheet-span-title">
        <th colspan="{{ 3 + $spans * count($points) }}" scope="colgroup"><span>{{ $title }}</span></th>
    </tr>
    <tr>
        <th rowspan="2" scope="col" class="sheet-col-name">Parámetro</th>
        <th rowspan="2" scope="col" class="sheet-col-symbol">Símbolo</th>
        <th rowspan="2" scope="col" class="sheet-col-formula">Fórmula</th>
        @for ($t = 1; $t <= $spans; $t++)
            <th colspan="{{ count($points) }}" scope="colgroup" class="sheet-span-group">Tramo {{ $t }}</th>
        @endfor
    </tr>
    <tr>
        @for ($t = 1; $t <= $spans; $t++)
            @foreach ($points as $point)<th scope="col" @class(['sheet-span-end' => $loop->last])>{{ $point }}</th>@endforeach
        @endfor
    </tr>
</thead>
