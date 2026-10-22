@extends('layouts.landing')
@section('main')
<main class="mx-auto max-w-4xl space-y-5 px-4 py-10 text-gray-800 dark:text-gray-100">
<a href="{{ route('payments.admin.index') }}" class="text-blue-600 underline">Volver a pagos</a>
<h1 class="text-3xl font-bold">Solicitud #{{ $payment->id }}</h1>
<p>{{ $payment->name }} · {{ $payment->email }} · {{ $payment->plan_snapshot['name'] ?? $payment->plan->name }} · S/ {{ number_format($payment->amount, 2) }}</p>
<p>Estado: {{ $payment->status }} · Pasarela: {{ $payment->gateway_state }} · Cargo: {{ $payment->gateway_charge_id ?? 'Sin ID conocido' }}</p>
<p class="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">Culqi confirma los pagos. Registrar una revisión no aprueba, rechaza ni devuelve dinero. Un cargo duplicado o sobre una cuenta suspendida requiere verificar la operación y gestionar la devolución desde CulqiPanel.</p>
@if ($payment->receipt)<a href="{{ $payment->receipt->ticketUrl() }}" class="text-blue-600 underline">Ver ticket</a>@endif
@if (session('success'))<p role="status">{{ session('success') }}</p>@endif
@if ($errors->any())<p role="alert">{{ $errors->first() }}</p>@endif
<h2 class="text-xl font-bold">Historial de eventos</h2>
@forelse ($payment->events->sortByDesc('id') as $event)<article class="space-y-2 rounded-lg border border-gray-200 p-4"><p class="font-semibold">{{ $event->created_at->format('d/m/Y H:i') }} · {{ $event->kind }} · {{ $event->severity }}</p>@foreach ($event->details ?? [] as $key => $value)<p class="text-sm">{{ $key }}: {{ $value }}</p>@endforeach
@if ($event->reviewed_at)<p>Revisado el {{ $event->reviewed_at->format('d/m/Y H:i') }} por usuario #{{ $event->reviewed_by }}: {{ $event->review_note }}</p>
@elseif ($event->severity === 'warning')<form method="POST" action="{{ route('payments.admin.review', $event) }}" class="space-y-2">@csrf<label class="block">Resultado de la revisión<input name="note" required minlength="5" maxlength="500" class="block w-full rounded-lg border border-gray-300 p-3 text-gray-800"></label><button class="rounded-lg bg-blue-600 px-4 py-3 text-white">Registrar revisión</button></form>@endif</article>@empty<p>No hay eventos para esta solicitud anterior.</p>@endforelse
<h2 class="text-xl font-bold">Tareas de cola</h2>
@foreach ($tasks as $task)<p>#{{ $task->id }} · {{ $task->kind }} · {{ $task->status }} · Intentos: {{ $task->attempts }} · {{ $task->result }}</p>@endforeach
</main>
@endsection
