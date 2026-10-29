@extends('layouts.workspace')
@section('main')
<div class="wk-legacy-detail wk-stack">
<a href="{{ route('payments.admin.index') }}" class="en-inline-link">Volver a pagos</a>
<h1 class="text-3xl font-bold">Solicitud #{{ $payment->id }}</h1>
<p>{{ $payment->name }} · {{ $payment->email }} · {{ $payment->plan_snapshot['name'] ?? $payment->plan->name }} · S/ {{ number_format($payment->amount, 2) }}</p>
<p>Estado: {{ $payment->status }} · Pasarela: {{ $payment->gateway_state }} · Cargo: {{ $payment->gateway_charge_id ?? 'Sin ID conocido' }}</p>
@if($offer=$payment->plan_snapshot['lifetime_quote'] ?? null)
<section class="pr-panel wk-card"><h2>Propuesta de por vida</h2><p>Definida por administrador #{{ $offer['created_by'] }} · Monto del servicio: S/ {{ number_format($offer['net_amount'],2) }} · Precio final: S/ {{ number_format($payment->amount,2) }}.</p><p>Vence el {{ \Illuminate\Support\Carbon::parse($offer['valid_until'])->timezone('America/Lima')->format('d/m/Y H:i') }}. El cliente la encontrará en Mi plan y pagos.</p><label class="pr-label" for="quote-payment-link">Enlace de pago para el titular · requiere su sesión</label><input class="pr-input" id="quote-payment-link" readonly value="{{ \App\Http\Controllers\CulqiController::paymentUrl($payment) }}" onclick="this.select()"><p class="pr-hint">Este enlace firmado dura un día; el titular puede abrir uno nuevo desde Mi plan mientras la propuesta siga vigente.</p></section>
@endif
<p>Cobro: {{ $payment->currency ?: 'PEN' }} {{ number_format($payment->charge_amount ?? $payment->amount, 2) }} @if($payment->exchange_rate) · TC {{ $payment->exchange_rate }} PEN/USD, {{ $payment->exchange_rate_date?->format('d/m/Y') }} @endif</p>
@if($processing = $payment->plan_snapshot['processing'] ?? null)
<section class="pr-panel wk-card"><h2>Procesamiento incluido al cotizar</h2><p>Tarifa de referencia: {{ $processing['rate_percent'] }} % + US$ {{ number_format($processing['fixed_usd'], 2) }}. Precio único para los medios habilitados.</p><p>Monto objetivo: {{ $processing['currency'] }} {{ number_format($processing['target_net'], 2) }} · Neto estimado: {{ $processing['currency'] }} {{ number_format($processing['estimated_net'], 2) }}.</p><p>Estos valores son la estimación congelada al registrar la compra. La comisión y liquidación reales se verifican en CulqiPanel.</p></section>
@endif
@if(!empty($payment->plan_snapshot['credit']))<p>Saldo por tiempo no usado aplicado: S/ {{ number_format($payment->plan_snapshot['credit'], 2) }}. El importe base anterior está expresado en PEN.</p>@endif
<p class="wk-notice">Culqi confirma los pagos. Registrar una revisión no aprueba, rechaza ni devuelve dinero. Un cargo duplicado o sobre una cuenta suspendida requiere verificar la operación y gestionar la devolución desde CulqiPanel.</p>
@if ($payment->receipt)<a href="{{ $payment->receipt->ticketUrl() }}" class="en-inline-link">Ver ticket</a>@endif
@if (session('success'))<p role="status">{{ session('success') }}</p>@endif
@if ($errors->any())<p role="alert">{{ $errors->first() }}</p>@endif
<h2 class="text-xl font-bold">Historial de eventos</h2>
@forelse ($payment->events->sortByDesc('id') as $event)<article class="pr-panel wk-card"><p class="font-semibold">{{ $event->created_at->format('d/m/Y H:i') }} · {{ $event->kind }} · {{ $event->severity }}</p>@foreach ($event->details ?? [] as $key => $value)<p class="text-sm">{{ $key }}: {{ $value }}</p>@endforeach
@if ($event->reviewed_at)<p>Revisado el {{ $event->reviewed_at->format('d/m/Y H:i') }} por usuario #{{ $event->reviewed_by }}: {{ $event->review_note }}</p>
@elseif ($event->severity === 'warning')<form method="POST" action="{{ route('payments.admin.review', $event) }}" class="space-y-2">@csrf<label class="block">Resultado de la revisión<input name="note" required minlength="5" maxlength="500" class="pr-input"></label><button class="pr-button">Registrar revisión</button></form>@endif</article>@empty<p>No hay eventos para esta solicitud anterior.</p>@endforelse
<h2 class="text-xl font-bold">Tareas de cola</h2>
@foreach ($tasks as $task)<p>#{{ $task->id }} · {{ $task->kind }} · {{ $task->status }} · Intentos: {{ $task->attempts }} · {{ $task->result }}</p>@endforeach
</div>
@endsection
