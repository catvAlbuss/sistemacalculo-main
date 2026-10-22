<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="referrer" content="no-referrer">
    <title>Pagar suscripción - {{ config('app.name') }}</title>
    @vite(['resources/css/app.css', 'resources/js/culqi-checkout.js'])
</head>
<body class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <main class="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h1 class="text-2xl font-bold text-gray-800">{{ $payment->status === 'approved' ? '¡Pago confirmado!' : 'Paga tu suscripción' }}</h1>
        <p class="mt-3 text-gray-600">Plan: {{ $payment->plan_snapshot['name'] ?? $payment->plan->name }}</p>
        <p class="mt-2 text-sm text-gray-600">{{ $payment->plan_snapshot['duration_text'] ?? $payment->plan->duration_text }} · {{ ($payment->plan_snapshot['billing_cycle'] ?? '') === 'yearly' ? 'Pago anual único' : 'Pago por período' }}</p>
        <p class="mt-2 text-sm text-gray-600">Usuarios: {{ $payment->plan_snapshot['max_users'] ?? $payment->plan->max_users ?? 'Por definir' }} · Proyectos: {{ $payment->plan_snapshot['max_projects'] ?? $payment->plan->max_projects ?? 'Por definir' }}</p>
        @if (!empty($payment->plan_snapshot['discount']))<p class="mt-2 text-sm text-green-700">Descuento anual del 5 %: S/ {{ number_format($payment->plan_snapshot['discount'], 2) }}</p>@endif
        <p class="mt-2 text-3xl font-bold text-blue-600">S/ {{ number_format($payment->amount, 2) }}</p>
        <p class="mt-2 text-xs text-gray-500">{{ ($payment->plan_snapshot['billing_cycle'] ?? '') === 'yearly' ? 'Este cobro cubre todo el año.' : 'Este cobro cubre el período indicado.' }} La renovación es manual.</p>
        @if ($payment->receipt_type)
            <p class="mt-3 text-sm text-gray-600">{{ ucfirst($payment->receipt_type) }} para {{ $payment->billing_name }}<br>{{ $payment->document_type }}: {{ $payment->document_number }}</p>
        @endif
        <p id="payment-message" class="mt-4 text-gray-700" role="status" aria-live="polite">
            @if ($payment->status === 'approved')
                Tu pago está confirmado. Revisa tus períodos contratados en Mi plan.
            @elseif ($payment->status !== 'pending')
                Esta solicitud fue cerrada. Contáctanos para continuar.
            @elseif (in_array($payment->gateway_state, ['processing', 'uncertain']))
                Estamos confirmando tu pago. No pagues otra vez; revisa el estado o contáctanos.
            @elseif (!$enabled)
                El pago en línea no está disponible ahora. Contáctanos para continuar.
            @else
                Tu solicitud está guardada. Completa el pago seguro con tarjeta o Yape.
            @endif
        </p>
        <div class="mt-6 space-y-3">
            <a href="{{ route('plans.mine') }}" class="block text-center text-blue-700">Mi plan y mis pagos</a>
            <a id="receipt-link" @if ($receiptUrl) href="{{ $receiptUrl }}" @else hidden @endif class="block rounded-lg border border-blue-200 px-4 py-3 text-center text-blue-700">Ver e imprimir ticket de 80 mm</a>
            @if ($enabled && $payment->status === 'pending' && !in_array($payment->gateway_state, ['processing', 'uncertain']))
                <button id="pay-button" type="button" class="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-50">Pagar con tarjeta o Yape</button>
            @endif
            <button id="refresh-button" type="button" class="w-full rounded-lg border border-blue-200 px-4 py-3 text-blue-700" @if (!in_array($payment->gateway_state, ['processing', 'uncertain'])) hidden @endif>Revisar estado del pago</button>
            <a href="{{ route('login') }}" class="block text-center text-blue-700">Ingresar a mi cuenta</a>
            <a href="{{ route('landing.plans') }}" class="block text-center text-gray-600">Ver planes</a>
        </div>
        <p class="mt-5 text-xs text-gray-500">Culqi procesa los datos de tu tarjeta. El sistema recibe únicamente un token de pago.</p>
        <script id="culqi-config" type="application/json">{!! json_encode([
            'publicKey' => $enabled ? $publicKey : null,
            'amount' => (int) round((float) $payment->amount * 100),
            'email' => $payment->email,
            'title' => $payment->purchaseDescription(),
            'chargeUrl' => $chargeUrl,
        ], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
    </main>
</body>
</html>
