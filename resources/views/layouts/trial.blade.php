@extends('layouts.landing')
@section('main')
<main class="engineering-surface">
  <div class="pr-shell">
    <a href="{{ route('landing.home') }}" class="pr-back">← Volver al inicio</a>
    <x-engineering-header eyebrow="Programas / Presentación" :title="trim($__env->yieldContent('trial-title'))" :description="trim($__env->yieldContent('trial-description'))" />
    <div class="en-service-layout">
      <article class="pr-panel">
        <img src="@yield('trial-image')" alt="@yield('trial-image-alt')" class="en-service-image">
        <div class="en-service-body">@yield('trial-content')</div>
      </article>
      <aside class="pr-panel wk-card" style="padding:26px;color:var(--pr-text)">
        <p class="pr-eyebrow">Prueba la herramienta</p>
        <h2 style="font-size:22px;font-weight:700;margin:14px 0">@yield('trial-title')</h2>
        <p class="pr-description">Conoce la herramienta y crea tu cuenta para probarla durante 5 días, sin tarjeta ni pago inicial. Si ya tienes acceso vigente, inicia sesión para utilizarla.</p>
        <div class="en-actions"><a class="pr-button" href="@yield('trial-url')">@yield('trial-action') <span aria-hidden="true">↗︎</span></a></div>
        <p class="pr-hint" style="margin-top:20px">Para conocer los demás accesos y capacidades, <a class="en-inline-link" href="{{ route('landing.plans') }}">revisa nuestros planes</a>.</p>
      </aside>
    </div>
  </div>
</main>
@endsection
