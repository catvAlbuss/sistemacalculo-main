@extends(!empty($internal) ? 'layouts.workspace' : 'layouts.landing')
@section('main')
<main class="engineering-surface">
  <div class="pr-shell">
    <x-engineering-header eyebrow="Atención / Proyectos y soporte" title="Hablemos de tu proyecto" description="Te ayudamos con nuestras herramientas, servicios y opciones de acceso. Elige el canal que prefieras para comunicarte con el equipo." />
    @if(request('plan')==='por-vida')<p class="en-notice">Plan de por vida · Contáctenos para preparar tu propuesta personalizada. Gerencia coordinará contigo el importe y las capacidades incluidas. Recibirás la propuesta en tu cuenta para revisar el precio final antes de pagar.</p>@endif
    <div class="en-contact-layout">
      <section class="en-contact-channels" aria-label="Canales de contacto">
        <a href="mailto:{{ config('legal.provider.email') }}" class="pr-panel en-channel-card">
          <span class="en-channel-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg></span>
          <div><span class="en-card-number">01 / CORREO</span><h2>Escríbenos por correo</h2><p>{{ config('legal.provider.email') }}</p><p>Consultas de servicios, planes y atención de tu cuenta.</p></div><span class="en-channel-arrow" aria-hidden="true">↗︎</span>
        </a>
        <a href="https://wa.me/{{ preg_replace('/\D/', '', config('legal.provider.phone')) }}" target="_blank" rel="noopener" class="pr-panel en-channel-card">
          <span class="en-channel-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 11a8 8 0 0 1-12 7L3 20l2-5A8 8 0 1 1 20 11Z"/><path d="M8 7c0 5 2 7 7 7l1-2-3-1-1 1-2-2 1-1-1-2Z"/></svg></span>
          <div><span class="en-card-number">02 / WHATSAPP</span><h2>Conversemos por WhatsApp</h2><p>+{{ preg_replace('/\D/', '', config('legal.provider.phone')) }}</p><p>Planes, pagos o soporte. Describe tu consulta para orientarte.</p></div><span class="en-channel-arrow" aria-hidden="true">↗︎</span>
        </a>
      </section>
      <section class="pr-panel en-business-details" aria-labelledby="provider-heading">
        <p class="pr-eyebrow">Información de la empresa</p><h2 id="provider-heading">Rizabal & Asociados</h2>
        <dl>
          <div><dt>Razón social</dt><dd>{{ config('legal.provider.name') }}</dd></div>
          <div><dt>RUC</dt><dd>{{ config('legal.provider.ruc') }}</dd></div>
          <div><dt>Dirección comercial</dt><dd>{{ config('legal.provider.address') }}</dd></div>
        </dl>
        <a href="{{ route('complaints.create') }}" class="en-inline-link">Acceder al Libro de Reclamaciones ↗︎</a>
      </section>
    </div>
    <div class="en-callout"><div><p class="pr-eyebrow">Acceso a herramientas</p><h2>¿Quieres contratar un plan?</h2><p>Revisa precios y capacidades, elige tu acceso y continúa al registro.</p></div><a href="{{ route(!empty($internal) ? 'plans.catalog' : 'landing.plans') }}" class="pr-button">Ver planes <span aria-hidden="true">↗︎</span></a></div>
  </div>
</main>
@endsection
