@extends('layouts.landing')
@push('styles') @vite('resources/js/showcase.js') @endpush
@section('main')
<main class="sc-page pc-page pc-catalog">
    <header class="sc-shell sc-page-heading"><p class="sc-kicker">PROGRAMAS / RIZABAL & ASOCIADOS</p><h1>Una herramienta para<br>cada parte de tu proyecto.</h1><p class="sc-lead">Conoce qué hace cada programa, explora sus funciones y elige cómo empezar.</p><a class="sc-button" href="{{ route('showcase.trial') }}">Probar gratis 5 días <span aria-hidden="true">↗</span></a><p class="sc-note">Sin tarjeta ni pago al iniciar. Una prueba por cuenta.</p></header>
    <section class="sc-shell sc-catalog" data-catalog aria-labelledby="catalog-title">
        <div class="sc-section-head"><h2 id="catalog-title">Explora los programas</h2><label class="sc-search"><span class="sr-only">Buscar programa</span><input type="search" data-product-search placeholder="Buscar un programa…"></label></div>
        <div class="sc-filters" aria-label="Filtrar por especialidad"><button type="button" data-filter="all" aria-pressed="true">Todos</button>@foreach(collect($products)->pluck('category')->unique() as $category)<button type="button" data-filter="{{ $category }}" aria-pressed="false">{{ $category }}</button>@endforeach</div>
        <p class="sc-note" data-result-count aria-live="polite">{{ count($products) }} programas</p>
        <div class="sc-product-grid">@foreach($products as $slug => $product)<x-showcase-card :slug="$slug" :product="$product" :video="$videos->get($slug)" />@endforeach</div>
        <p data-empty hidden class="sc-empty">No encontramos programas con esa búsqueda. Prueba otra especialidad o nombre.</p>
    </section>
    @include('showcase.partials.program-access')
</main>
@endsection
