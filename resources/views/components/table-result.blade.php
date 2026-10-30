@props(['title', 'columns' => ['Parámetro', 'Símbolo', 'Fórmula', 'Resultado']])
@php
  // "2.1.- Método LRFD" -> número "2.1" y título "Método LRFD".
  preg_match('/^\s*(\d+(?:\.\d+)*)\.?-\s*(.+)$/u', $title, $parts);
  $number = $parts[1] ?? null;
  $heading = $parts[2] ?? $title;
@endphp
<section class="pr-panel arco-result-card">
  <div class="arco-result-heading">
    @if($number)<span class="arco-result-number">{{ $number }}</span>@endif
    <h3>{{ $heading }}</h3>
  </div>
  <x-sheets.table :label="$heading" :columns="$columns">
    <tbody>{{ $slot }}</tbody>
  </x-sheets.table>
</section>
