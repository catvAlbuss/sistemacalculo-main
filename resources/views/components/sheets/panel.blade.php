@props(['title', 'description' => '', 'number' => null, 'headingId' => null])
<section {{ $attributes->class(['pr-panel']) }} @if($headingId) aria-labelledby="{{ $headingId }}" @endif>
    <div class="pr-section-head beam-results-heading">
        @if($number)<span class="pr-section-number">{{ $number }}</span>@endif
        <div><h2 @if($headingId) id="{{ $headingId }}" @endif>{{ $title }}</h2>@if($description)<p class="arco-note">{{ $description }}</p>@endif</div>
        @isset($actions)<div class="beam-export-actions">{{ $actions }}</div>@endisset
    </div>
    {{ $slot }}
</section>
