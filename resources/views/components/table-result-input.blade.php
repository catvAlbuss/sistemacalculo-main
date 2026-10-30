@props(['title'])
<x-table-result :title="$title" :columns="['Parámetro', 'Símbolo', 'Valor']">{{ $slot }}</x-table-result>
