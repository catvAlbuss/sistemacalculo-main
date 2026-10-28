@props(['slug', 'product', 'video' => null])
<article class="sc-product-card" data-product data-category="{{ $product['category'] }}" data-search="{{ mb_strtolower($product['name'].' '.$product['description'].' '.$product['category']) }}">
    <a class="sc-card-image" href="{{ route('showcase.show', $slug) }}" aria-label="Conocer {{ $product['name'] }}">
        <img src="{{ $video && $video->source_type !== 'youtube' ? $video->getFirstMediaUrl('poster') : Vite::asset($product['image']) }}" alt="Presentación de {{ $product['name'] }}" width="640" height="400" loading="lazy">
        <span class="sc-card-tag">{{ $video ? '▶ Ver tráiler' : 'Explorar programa ↗' }}</span>
    </a>
    <div class="sc-card-copy"><span class="sc-kicker">{{ $product['category'] }}</span><h3><a href="{{ route('showcase.show', $slug) }}">{{ $product['name'] }}</a></h3><p>{{ $product['description'] }}</p><ul class="pc-card-features">@foreach(array_slice($product['features'], 0, 2) as $feature)<li>{{ $feature }}</li>@endforeach</ul><a class="sc-text-link" href="{{ route('showcase.show', $slug) }}">Conocer el programa <span aria-hidden="true">↗</span></a></div>
</article>
