@props(['for', 'text' => null, 'symbol' => null])
{{-- Etiqueta de campo: nombre y símbolo. Sin nombre, el símbolo hace de etiqueta. --}}
<label class="pr-label" for="{{ $for }}">{{ $text ?? $symbol }}@if($text && $symbol) <span class="arco-symbol">{{ $symbol }}</span>@endif</label>
