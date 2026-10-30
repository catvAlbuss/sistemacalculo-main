@extends('layouts.workspace')
@section('main')
<header class="wk-heading"><div><p class="pr-eyebrow">Mi cuenta / Cobertura y operaciones</p><h1>Mi plan y mis pagos</h1><p>Consulta el acceso de tu cuenta y el estado de cada solicitud.</p></div>@if (config('features.project_backups'))<a class="pr-button pr-button-secondary" href="{{ route('backups.index') }}">Mis respaldos <span aria-hidden="true">↗︎</span></a>@endif</header>
<div class="wk-stack">
    @if(session('success'))<p role="status" class="wk-notice">{{ session('success') }}</p>@endif
    @if(session('subscription_notice'))<p role="alert" class="wk-notice" data-tone="warning">{{ session('subscription_notice') }}</p>@endif
    @if($errors->any())<p role="alert" class="wk-notice" data-tone="danger">{{ $errors->first() }}</p>@endif
    <section class="pr-panel wk-card">
        <p class="pr-eyebrow">Acceso de {{ $user->email }}</p>
        <h2>{{ $current ? 'Plan actual: '.$current->plan->name : ($user->canManageUsers() ? 'Acceso administrativo por rol' : 'Tu plan ha vencido o no tienes un plan vigente.') }}</h2>
        @if($user->canManageUsers())
            <p>Tu cuenta administrativa está habilitada. El acceso de {{ $user->getRoleNames()->implode(', ') }} depende de sus permisos y no requiere contratar un plan. Aquí puedes consultar las coberturas y los pagos registrados a tu nombre.</p>
        @elseif(!$user->is_active)
            <p class="wk-notice" data-tone="danger">Tu cuenta está suspendida. Contacta con soporte; un pago no elimina una suspensión administrativa.</p>
        @elseif($permanent)
            <p>Tu acceso es permanente y no necesita renovación. Para modificar sus condiciones, contacta con soporte.</p>
        @else
            @if(!$current)<p class="wk-notice" data-tone="warning">La prueba gratuita dura 5 días y no se renueva. Para seguir usando el software, contrata un plan pagado. No se harán cobros automáticos.</p>@endif
            @if($current?->accessEndsAt())<p>Vence el {{ $current->accessEndsAt()->format('d/m/Y') }}.</p>@endif
            @if($current?->payment_method === 'trial')<p class="wk-notice">Tu prueba es gratuita durante 5 días. Después deberás contratar un plan pagado; no se harán cobros automáticos.</p>@endif
            <p>Puedes renovar antes del vencimiento: conservas los días ya pagados. El siguiente período comienza al terminar tu cobertura pagada. Las bajadas se aplican al siguiente período. Si eliges un plan de mayor precio mensual, podrás revisar el cambio inmediato con saldo por tiempo no usado.</p>
            <div class="wk-renewal-grid">@foreach($plans as $plan)
                @php($quote = $renewalQuotes[$plan->id])
                <article class="wk-renewal-card"><p class="pr-eyebrow">{{ $plan->duration_text }}</p><h3>{{ $plan->name }}</h3><p>{{ $plan->description }}</p>@if(isset($quote['unavailable']))<p class="wk-muted">{{ $quote['unavailable'] }}</p>@else<strong class="wk-renewal-price">S/ {{ number_format($quote['total'],2) }}</strong><small>Precio final del período, con procesamiento incluido.</small>@endif<a class="pr-button" href="{{ route('planes.register',['plan'=>$plan->id]) }}">Renovar con {{ $plan->name }}</a></article>
            @endforeach</div>
            <p class="pr-hint">Revisa el resumen antes de pagar. La cobertura se confirma cuando Culqi aprueba el cobro; registrar una solicitud no activa un plan.</p>
        @endif
    </section>
    <section aria-labelledby="coverage-heading"><div class="wk-section-head"><h2 id="coverage-heading">Cobertura contratada</h2></div>
        <div class="wk-stack">@forelse($subscriptions as $subscription)
            <article class="wk-detail"><div class="wk-actions"><strong>{{ $subscription->plan->name }}</strong><span class="wk-badge">{{ $subscription->starts_at->isFuture() ? 'Programado' : ($subscription->isActive() ? 'Vigente' : 'Finalizado / suspendido') }}</span></div><p class="wk-muted">{{ $subscription->starts_at->format('d/m/Y') }} → {{ $subscription->accessEndsAt()?->format('d/m/Y') ?? 'Permanente' }}</p></article>
        @empty<p class="pr-panel wk-empty">No hay períodos contratados.</p>@endforelse</div>
    </section>
    <section aria-labelledby="payments-heading"><div class="wk-section-head"><h2 id="payments-heading">Historial de pagos</h2><p class="pr-eyebrow">Solicitudes de tu cuenta</p></div>
        <div class="wk-stack">@forelse($payments as $payment)
            <article class="wk-detail">
                <div class="wk-actions"><strong>{{ $payment->plan_snapshot['name'] ?? $payment->plan->name }}</strong><span class="wk-badge">{{ ['pending'=>'Pendiente','approved'=>'Confirmado','rejected'=>'Cerrado'][$payment->status] ?? $payment->status }}</span></div>
                <p>{{ $payment->plan_snapshot['duration_text'] ?? $payment->plan->duration_text }} · S/ {{ number_format($payment->amount,2) }} · {{ $payment->created_at->format('d/m/Y') }}</p>
                @if($payment->currency === 'USD')<p>Cobro: US$ {{ number_format($payment->charge_amount,2) }} · TC {{ $payment->exchange_rate }} PEN/USD</p>@endif
                <div class="en-actions">
                    @if($payment->receipt)<a class="en-inline-link" href="{{ $payment->receipt->ticketUrl() }}">Ver ticket</a>
                    @elseif($user->is_active && $payment->payment_method === 'culqi' && $payment->status === 'pending')<a class="en-inline-link" href="{{ \App\Http\Controllers\CulqiController::paymentUrl($payment) }}">Continuar / revisar pago</a>@endif
                    @if($payment->status === 'pending' && $payment->payment_method === 'culqi' && !$payment->gateway_charge_id && in_array($payment->gateway_state,[null,'declined','authentication'],true))
                        <form method="POST" action="{{ route('payments.cancel-unpaid',$payment) }}">@csrf<button class="en-inline-link">Cerrar solicitud sin cobrar</button></form>
                    @endif
                </div>
            </article>
        @empty<p class="pr-panel wk-empty">Aún no tienes pagos registrados.</p>@endforelse</div>
        <div style="margin-top:20px">{{ $payments->links() }}</div>
    </section>
    <p><a href="{{ route('account.support') }}" class="en-inline-link">Contactar con soporte</a></p>
</div>
@endsection
