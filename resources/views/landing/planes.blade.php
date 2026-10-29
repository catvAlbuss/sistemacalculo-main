@extends(request()->routeIs('plans.catalog') ? 'layouts.workspace' : 'layouts.landing')
@section('main')
<main class="engineering-surface">
  <div class="pr-shell">
    <x-engineering-header eyebrow="Acceso al software / Planes" title="Elige tu plan" description="Compara períodos, herramientas y capacidades. Empieza con una prueba gratuita o elige el acceso que necesitas para tus proyectos." />
    @if($errors->any())<p class="en-notice" role="alert">{{ $errors->first() }}</p>@endif
    <section class="en-plans-grid" aria-label="Planes disponibles">
      @forelse ($plans as $plan)
        @php($quote = $plan->isLifetime() ? null : app(\App\Services\PlanPricing::class)->publicQuote($plan))
        <article class="pr-panel en-plan-card" data-type="{{ $plan->type }}">
          <header class="en-plan-top">
            <div class="en-plan-meta"><span class="en-card-number">P.{{ str_pad($loop->iteration, 2, '0', STR_PAD_LEFT) }}</span><span class="pr-eyebrow">{{ $plan->isFree() ? 'Sin costo' : ($plan->isLifetime() ? 'Permanente' : 'Acceso completo') }}</span></div>
            <h2>{{ $plan->name }}</h2>
            <p class="en-plan-description">{{ $plan->description }}</p>
            @if ($plan->isLifetime())
              <p class="en-plan-price en-price-custom">Contáctenos</p><p class="pr-hint">Nuestro equipo prepara una propuesta personalizada y acuerda contigo el importe. El acceso es permanente después de confirmar el pago.</p>
            @elseif (!$quote['pricing_available'])
              <p class="en-plan-price en-price-custom">Precio por confirmar</p><p class="pr-hint">{{ $quote['pricing_error'] }}</p>
            @else
              <p class="en-plan-price"><small>S/</small> {{ number_format($quote['total'], 2) }}</p>
              <p class="pr-hint">{{ $quote['duration_text'] }}{{ !$plan->isFree() ? ' · Incluye IGV y procesamiento' : ' · Una vez por cuenta' }}</p>
              @if ($quote['discount_percent'])<p class="en-plan-discount">5 % de descuento · un cobro anual</p>@endif
            @endif
          </header>
          <div class="en-plan-body">
            <img src="{{ asset('assets/img/predim-preview.png') }}" alt="Vista de las herramientas de diseño estructural de Rizabal" class="en-plan-image" loading="lazy" width="480" height="144">
            <dl class="pr-capacity">
              <div><dt>Usuarios incluidos</dt><dd>{{ $plan->max_users ?? 'Por definir' }}</dd></div>
              <div><dt>Proyectos incluidos</dt><dd>{{ $plan->max_projects ?? 'Por definir' }}</dd></div>
            </dl>
            <ul class="pr-features" aria-label="Herramientas y beneficios">@foreach ($plan->features ?? [] as $feature)<li>{{ $feature }}</li>@endforeach</ul>
            <div class="en-plan-actions">
              @if($plan->isLifetime())
              <a href="{{ route(auth()->check() ? 'account.support' : 'contacto.index',['plan'=>'por-vida']) }}" class="pr-button pr-button-secondary">Contáctenos <span aria-hidden="true">↗</span></a>
              @elseif($quote['pricing_available'])
              <a href="{{ route('planes.register', ['plan' => $plan->id]) }}" class="pr-button {{ $plan->type === 'monthly' ? '' : 'pr-button-secondary' }}">{{ $plan->isFree() ? 'Empezar gratis' : ($plan->isLifetime() ? 'Solicitar información' : 'Elegir este plan') }} <span aria-hidden="true">↗︎</span></a>
              @if ($plan->type === 'monthly' && !$plan->isFree())<a href="{{ route('planes.register', ['plan' => $plan->id, 'cycle' => 'yearly']) }}" class="en-inline-link">Pagar anualmente y ahorrar 5 %</a>@endif
              @else<a class="pr-button pr-button-secondary" href="{{ route(request()->routeIs('plans.catalog') ? 'account.support' : 'contacto.index') }}">Consultar precio final</a>@endif
            </div>
          </div>
        </article>
      @empty
        <p class="pr-panel en-info-card" role="status">No hay planes disponibles en este momento. <a href="{{ route(request()->routeIs('plans.catalog') ? 'account.support' : 'contacto.index') }}" class="en-inline-link">Contáctanos</a> para consultar las opciones de acceso.</p>
      @endforelse
    </section>
    <p class="en-price-note">Precio final único para tarjeta y Yape, con IGV y procesamiento incluidos. La renovación es manual. La prueba gratuita dura 5 días y luego requiere un plan pagado para continuar con el software.</p>
    <div class="en-section-heading"><h2>Del registro a tu espacio de trabajo</h2><p class="pr-eyebrow">Proceso de acceso</p></div>
    <section class="en-grid-three" aria-label="Cómo funciona">
      <article class="pr-panel en-info-card"><span class="en-card-number">01 / SELECCIÓN</span><h3>Elige tu acceso</h3><p>Revisa el precio, la duración y los cupos incluidos en cada plan.</p></article>
      <article class="pr-panel en-info-card"><span class="en-card-number">02 / REGISTRO</span><h3>Completa tus datos</h3><p>Registra la información del titular para tu cuenta y, si corresponde, el comprobante.</p></article>
      <article class="pr-panel en-info-card"><span class="en-card-number">03 / CONFIRMACIÓN</span><h3>Continúa con tus proyectos</h3><p>Paga con tarjeta o Yape en soles mediante Culqi. Tu plan se activa cuando la pasarela confirma el cobro. El acceso gratuito no requiere pago.</p></article>
    </section>
    <div class="en-callout"><div><h2>¿Necesitas ayuda para elegir?</h2><p>Cuéntanos qué herramientas necesitas para tus proyectos.</p></div><a href="{{ route(request()->routeIs('plans.catalog') ? 'account.support' : 'contacto.index') }}" class="pr-button pr-button-secondary">Hablar con nosotros <span aria-hidden="true">↗︎</span></a></div>
  </div>
</main>
@endsection
