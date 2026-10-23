@extends('layouts.landing')
@section('main')
<main class="engineering-surface">
  <div class="pr-shell">
    <x-engineering-header :eyebrow="'Servicios profesionales / '.trim($__env->yieldContent('service-code'))" :title="trim($__env->yieldContent('service-title'))" :description="trim($__env->yieldContent('service-description'))" />
    <nav class="en-service-tabs" aria-label="Servicios de ingeniería">
      @foreach (['structural_design' => 'Diseño estructural', 'structural_software' => 'Software estructural', 'structural_blueprint' => 'Planos estructurales', 'metrados' => 'Metrados'] as $service => $label)
        <a href="{{ route('landing.services.'.$service) }}" @if(request()->routeIs('landing.services.'.$service)) aria-current="page" @endif>{{ $label }}</a>
      @endforeach
    </nav>
    <div class="en-service-layout">
      <article class="pr-panel">
        <img src="@yield('service-image')" alt="@yield('service-image-alt')" class="en-service-image">
        <div class="en-service-body">@yield('service-content')</div>
      </article>
      <aside class="pr-panel en-inquiry" aria-labelledby="inquiry-heading">
        <div class="pr-section-head"><span class="pr-section-number" aria-hidden="true">02</span><div><h2 id="inquiry-heading">Cotiza tu proyecto</h2><p class="pr-hint">Comparte tus datos y un plano de referencia para revisar tu consulta.</p></div></div>
        @include('landing.partials.service-inquiry')
      </aside>
    </div>
    <div class="en-callout"><div><h2>Conversemos sobre el alcance de tu proyecto.</h2><p>Si necesitas orientación antes de adjuntar tu plano, comunícate directamente con nuestro equipo.</p></div><a href="{{ route('contacto.index') }}" class="pr-button pr-button-secondary">Contactar al equipo <span aria-hidden="true">↗︎</span></a></div>
  </div>
</main>
@endsection
