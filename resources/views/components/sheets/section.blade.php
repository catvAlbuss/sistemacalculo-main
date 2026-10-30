@props(['title', 'note' => '', 'open' => true])
{{-- Sección desplegable dentro de un panel (detalles nativos, sin JS). --}}
<details {{ $attributes->class(['sheet-section']) }} @if($open) open @endif>
    <summary><span>{{ $title }}</span></summary>
    @if($note)<p class="arco-note">{{ $note }}</p>@endif
    <div class="sheet-section-body">{{ $slot }}</div>
</details>
