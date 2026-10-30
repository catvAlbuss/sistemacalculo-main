@extends('layouts.landing')
@push('styles') @vite('resources/js/showcase.js') @endpush
@section('main')
@php($featured = ['modelador-estructural', 'aligerados-v2', 'vigas', 'cimentacion-v2', 'predim', 'arco-techo'])
@php($homeVideo = $videos->get('home'))
<main class="sc-page lh-home">
    <header class="lh-hero lh-hero-immersive" aria-label="Presentación de Rizabal">
        <x-home-hero-media :video="$homeVideo" />
        <div class="lh-hero-shade" aria-hidden="true"></div>
        <div class="lh-hero-content lh-shell">
            <p class="lh-eyebrow">SOFTWARE DE INGENIERÍA ESTRUCTURAL</p>
            <h1><span>Ingeniería.</span>Del cálculo al detalle.</h1>
            <p class="lh-lead">Modela, analiza y diseña con herramientas especializadas para tus proyectos estructurales.</p>
            <div class="lh-actions"><a class="lh-button" href="{{ route('showcase.trial') }}">Empezar gratis 5 días ↗</a><a class="lh-button lh-button-ghost" href="#programas">Explorar programas ↓</a></div>
            <p class="lh-trial-note">Sin tarjeta. Sin pago al iniciar. Sin cobros automáticos.</p>
        </div>
    </header>

    <section class="lh-programs lh-shell" id="programas" aria-labelledby="programs-heading">
        <header class="lh-section-heading"><p class="lh-eyebrow">HERRAMIENTAS PARA CADA ETAPA</p><h2 id="programs-heading">Encuentra el programa<br>que necesita tu proyecto.</h2><p>Conoce qué puedes resolver, revisa sus funciones y explora la demostración de cada herramienta antes de empezar.</p></header>
        <div class="lh-program-grid">
            @foreach($featured as $slug)
                @php($product = $products[$slug])
                @php($video = $videos->get($slug))
                <article class="lh-program-card">
                    <a class="lh-program-image" href="{{ route('showcase.show', $slug) }}" aria-label="Conocer {{ $product['name'] }}"><img src="{{ $video && $video->source_type !== 'youtube' ? $video->getFirstMediaUrl('poster') : Vite::asset($product['homepage_image'] ?? $product['image']) }}" alt="Presentación de {{ $product['name'] }}" width="640" height="360" loading="lazy"><span>{{ $video ? '▶ Demostración disponible' : $product['category'] }}</span></a>
                    <div class="lh-program-body"><p class="lh-product-category">{{ $product['category'] }}</p><h3><a href="{{ route('showcase.show', $slug) }}">{{ $product['name'] }}</a></h3><p class="lh-product-description">{{ $product['description'] }}</p><ul>@foreach($product['features'] as $feature)<li><svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7" stroke="currentColor" stroke-width="1.5" /></svg>{{ $feature }}</li>@endforeach</ul><a class="lh-program-link" href="{{ route('showcase.show', $slug) }}">Conocer el programa <span aria-hidden="true">↗</span></a></div>
                </article>
            @endforeach
        </div>
        <div class="lh-catalog-link"><p>Más herramientas para tus especialidades.</p><a class="lh-button lh-button-outline" href="{{ route('showcase.index') }}">Ver los {{ count($products) }} programas <span aria-hidden="true">↗</span></a></div>
    </section>

    <section class="lh-benefits"><div class="lh-shell"><header class="lh-section-heading"><p class="lh-eyebrow">PENSADO PARA TU TRABAJO DIARIO</p><h2>Más claridad en cada decisión.</h2><p>Herramientas organizadas alrededor de tu proceso de ingeniería.</p></header><div class="lh-benefit-grid"><article><span>01 / ACCESO</span><h3>Tu espacio, en el navegador.</h3><p>Ingresa a tu cuenta y encuentra tus programas desde un solo lugar, sin instalar cada hoja por separado.</p></article><article><span>02 / REVISIÓN</span><h3>Datos y resultados a la vista.</h3><p>Organiza las entradas, consulta las gráficas y revisa los resultados con tu criterio profesional.</p></article><article><span>03 / CONTINUIDAD</span><h3>El control de tus proyectos.</h3><p>Consulta tu plan{{ config('features.project_backups') ? ' y administra los respaldos disponibles en tu cuenta' : ' y el estado de tu cuenta' }} para continuar tu trabajo.</p></article></div></div></section>



    <section class="lh-start"><div class="lh-shell"><p class="lh-eyebrow">TU SIGUIENTE PROYECTO EMPIEZA AQUÍ</p><h2>Conoce las herramientas.<br>Pruébalas en tu próximo proyecto.</h2><p>Empieza con una prueba de 5 días. Al terminar, elige un plan para seguir utilizando el software.</p><div class="lh-actions"><a class="lh-button" href="{{ route('showcase.trial') }}">Empezar gratis 5 días ↗</a><a class="lh-button lh-button-ghost" href="{{ route('landing.plans') }}">Conocer los planes</a></div><p class="lh-trial-note">Una prueba por cuenta · Sin tarjeta · Sin renovación automática</p></div></section>
    <section class="lh-professional lh-shell"><div><p class="lh-eyebrow">RESPALDO PROFESIONAL</p><h2>También somos tu equipo de ingeniería.</h2><p>Diseño estructural, planos, metrados y desarrollo de software especializado para tu proyecto.</p></div><a class="lh-button lh-button-outline" href="{{ route('contacto.index') }}">Conversemos sobre tu proyecto ↗</a></section>
</main>
@endsection
