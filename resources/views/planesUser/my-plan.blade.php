@extends('layouts.landing')
@section('main')
<main class="mx-auto max-w-4xl space-y-6 px-4 py-10 text-gray-800 dark:text-gray-100">
    <h1 class="text-3xl font-bold">Mi plan y mis pagos</h1>
    <p class="text-sm">Cuenta: {{ $user->email }}</p>
    @if (!$user->is_active)
        <p class="rounded-lg bg-red-50 p-4 text-red-800">Tu cuenta está suspendida. Contacta con soporte; un pago no elimina una suspensión administrativa.</p>
    @else
        <p>{{ $current ? 'Plan actual: '.$current->plan->name : 'Tu plan ha vencido o no tienes un plan vigente.' }} @if ($current?->ends_at) · Vence el {{ $current->ends_at->format('d/m/Y') }} @endif</p>
        <p class="text-sm">Puedes renovar antes del vencimiento: conservas los días ya pagados. El siguiente período comienza al terminar tu cobertura pagada. Si cambias de plan, se programa para esa fecha, sin prorrateo.</p>
        <div class="grid gap-4 md:grid-cols-2">@foreach ($plans as $plan)<a class="rounded-lg border border-blue-200 bg-white p-4 text-blue-700" href="{{ route('planes.register', ['plan' => $plan->id]) }}">Renovar con {{ $plan->name }}</a>@endforeach</div>
    @endif
    <section class="space-y-3"><h2 class="text-xl font-bold">Cobertura contratada</h2>
        @forelse ($subscriptions as $subscription)
            <p class="rounded-lg border border-gray-200 p-4">{{ $subscription->plan->name }} · {{ $subscription->starts_at->format('d/m/Y') }} → {{ $subscription->ends_at?->format('d/m/Y') ?? 'Permanente' }} · {{ $subscription->starts_at->isFuture() ? 'Programado' : ($subscription->isActive() ? 'Vigente' : 'Finalizado / suspendido') }}</p>
        @empty <p>No hay períodos contratados.</p>@endforelse
    </section>
    <section class="space-y-3"><h2 class="text-xl font-bold">Historial de pagos</h2>
        @forelse ($payments as $payment)
            <article class="rounded-lg border border-gray-200 bg-white p-4 text-gray-800"><p class="font-semibold">{{ $payment->plan_snapshot['name'] ?? $payment->plan->name }} · {{ $payment->plan_snapshot['duration_text'] ?? $payment->plan->duration_text }} · S/ {{ number_format($payment->amount, 2) }}</p><p>{{ $payment->created_at->format('d/m/Y') }} · {{ ['pending' => 'Pendiente', 'approved' => 'Confirmado', 'rejected' => 'Cerrado'][$payment->status] ?? $payment->status }}</p>
                @if ($payment->receipt)<a class="text-blue-700 underline" href="{{ $payment->receipt->ticketUrl() }}">Ver ticket</a>
                @elseif ($user->is_active && $payment->payment_method === 'culqi' && $payment->status === 'pending')<a class="text-blue-700 underline" href="{{ \App\Http\Controllers\CulqiController::paymentUrl($payment) }}">Continuar / revisar pago</a>@endif
            </article>
        @empty <p>Aún no tienes pagos registrados.</p>@endforelse
        {{ $payments->links() }}
    </section>
    <a href="{{ route('contacto.index') }}" class="text-blue-700 underline">Contactar con soporte</a>
</main>
@endsection
