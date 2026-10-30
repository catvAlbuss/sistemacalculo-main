@props(['title', 'number' => null])
{{-- Tarjeta para un dibujo o gráfico (canvas, SVG o Plotly) generado por el motor. --}}
<section class="pr-panel arco-result-card sheet-figure">
    <div class="arco-result-heading">
        @if($number)<span class="arco-result-number">{{ $number }}</span>@endif
        <h3>{{ $title }}</h3>
    </div>
    <div class="sheet-figure-body">{{ $slot }}</div>
</section>
