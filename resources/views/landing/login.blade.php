@extends('layouts.landing')
@section('main')
<main class="engineering-surface">
  <div class="pr-shell">
    @if(request('sesion') === 'cerrada')<p class="en-notice" role="alert">Tu sesión fue cerrada o venció. Vuelve a iniciar sesión. Si se detectaron accesos simultáneos, encontrarás el aviso en Perfil y seguridad.</p>@endif
    <div class="en-login-layout">
      <section class="en-login-intro" aria-labelledby="welcome-heading">
        <div class="en-intro-copy">
        <p class="pr-eyebrow">Rizabal & Asociados / Ingeniería estructural</p>
        <h1 id="welcome-heading">Herramientas para llevar tus proyectos al siguiente nivel.</h1>
        <p class="pr-description">Análisis, diseño y verificación estructural en un solo espacio de trabajo. Accede a tus herramientas y continúa con tus proyectos.</p>
        </div>
        <div class="en-intro-support">
        <div class="en-login-visual" aria-hidden="true">
          <svg viewBox="0 0 440 170" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M45 142h350M75 142V47h290v95M75 47l145-28 145 28M75 80h290M75 111h290M133 36v106M191 25v117M249 25v117M307 36v106M75 47l58 33 58-33 58 33 58-33 58 33M75 80l58 31 58-31 58 31 58-31 58 31M75 111l58 31 58-31 58 31 58-31 58 31"/>
            <path d="M45 157h350M45 152v10M395 152v10M30 19v123M25 19h10M25 142h10" stroke-dasharray="3 3"/>
            <path d="m68 148 7-6 7 6m44 0 7-6 7 6m44 0 7-6 7 6m44 0 7-6 7 6m44 0 7-6 7 6m44 0 7-6 7 6"/>
          </svg>
          <span class="en-visual-label">ANÁLISIS / DISEÑO / VERIFICACIÓN</span>
        </div>
        <ul class="en-intro-points">
          <li><span>01</span><div><strong>Calcula y diseña.</strong> Herramientas para el desarrollo de tus proyectos estructurales.</div></li>
          <li><span>02</span><div><strong>Organiza tu trabajo.</strong> Consulta las herramientas y los proyectos disponibles en tu cuenta.</div></li>
          <li><span>03</span><div><strong>Elige tu acceso.</strong> Revisa los planes, sus períodos y capacidades antes de contratar.</div></li>
        </ul>
        </div>
      </section>
      <div>
        @guest
          <livewire:login />
        @else
          <section class="pr-panel en-session" aria-labelledby="session-heading">
            <p class="pr-eyebrow">Tu espacio de trabajo</p>
            <h2 id="session-heading">Sesión iniciada</h2>
            <p>Estás conectado como <strong>{{ auth()->user()->name }}</strong>.</p>
            <p>{{ auth()->user()->email }}</p>
            <div class="en-actions"><a href="{{ route('dashboard') }}" class="pr-button">Ir a mis herramientas <span aria-hidden="true">↗︎</span></a></div>
            <form method="POST" action="{{ route('logout') }}">@csrf<button type="submit" class="en-inline-link">Cerrar sesión y usar otra cuenta</button></form>
          </section>
        @endguest
        <p class="pr-hint" style="margin-top:18px">¿Necesitas ayuda para acceder? <a href="{{ route('contacto.index') }}" class="en-inline-link">Contactar con soporte</a>.</p>
        <x-public-trials />
      </div>
    </div>
    <div class="en-callout">
      <div><p class="pr-eyebrow">Servicios profesionales</p><h2>Tu proyecto también cuenta con nuestro equipo.</h2><p>Consulta nuestros servicios de diseño, software, planos y metrados estructurales.</p></div>
      <a href="{{ route('landing.services.structural_design') }}" class="pr-button pr-button-secondary">Explorar servicios <span aria-hidden="true">↗︎</span></a>
    </div>
  </div>
</main>
@endsection
