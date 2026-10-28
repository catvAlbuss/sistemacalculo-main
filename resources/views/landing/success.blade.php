@extends(auth()->check() ? 'layouts.workspace' : 'layouts.landing')
@section('main')
<main class="engineering-surface"><div class="pr-shell"><x-engineering-header eyebrow="Registro / Confirmación" :title="session('registration.free') ? 'Tu prueba gratuita está activa' : 'Tu solicitud está registrada'" description="Revisa los siguientes pasos para acceder a tu espacio de trabajo." />
    <section class="pr-panel en-info-card">
        @if(session('warning'))<p class="en-notice" role="alert">{{ session('warning') }}</p>@endif
        @if(session('registration'))<h2>{{ session('registration.plan') }}</h2>
            @if(session('registration.free'))
                <p>Tu prueba dura 5 días desde el registro. No requiere tarjeta ni genera comisión. Al vencer, necesitarás contratar un plan pagado para seguir usando el software.</p><p>No se realizarán cobros automáticos. Tus opciones de cuenta, soporte y respaldos seguirán disponibles.</p>
            @elseif(session('registration.custom'))<p>Te contactaremos para coordinar el precio y las condiciones de tu acceso.</p>
            @else<p>Completa el pago seguro mediante Culqi. Tu plan se activará cuando se confirme el cobro.</p>@endif
        @else<p>Si ya enviaste una solicitud, revisa tu correo para conocer su estado y la información de acceso.</p>@endif
        <p>Si tu cuenta es nueva, recibirás un enlace para crear tu contraseña. Revisa también spam; los correos pueden tardar unos minutos.</p>
        <div class="en-actions"><a class="pr-button" href="{{ route(auth()->check() ? 'dashboard' : 'login') }}">{{ auth()->check() ? 'Ir a mi espacio' : 'Ingresar a mi cuenta' }}</a><a class="pr-button pr-button-secondary" href="{{ route(auth()->check() ? 'plans.catalog' : 'landing.plans') }}">Ver planes</a><a class="en-inline-link" href="{{ route(auth()->check() ? 'account.support' : 'contacto.index') }}">Contactar con soporte</a></div>
    </section>
</div></main>
@endsection
