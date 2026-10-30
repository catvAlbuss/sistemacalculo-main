@extends(auth()->check() ? 'layouts.workspace' : 'layouts.landing')
@push('scripts')
    @vite('resources/js/culqi-checkout.js')
@endpush
@push('styles')
<meta name="referrer" content="no-referrer">
<style>.account-checkout{max-width:640px;margin:32px auto;padding:30px;color:var(--pr-text)}.account-checkout [class*="text-gray-"]{color:var(--pr-muted)}.account-checkout h1{color:var(--pr-text)}@media(max-width:640px){.account-checkout{margin:20px 16px;padding:22px}}</style>
@endpush
@section('main')
<section class="account-checkout pr-panel">
        <h1 class="text-2xl font-bold text-gray-800">{{ $payment->status === 'approved' ? '¡Pago confirmado!' : 'Paga tu suscripción' }}</h1>
        <p class="mt-3 text-gray-600">Plan: {{ $payment->plan_snapshot['name'] ?? $payment->plan->name }}</p>
        <p class="mt-2 text-sm text-gray-600">{{ $payment->plan_snapshot['duration_text'] ?? $payment->plan->duration_text }} · {{ ($payment->plan_snapshot['billing_cycle'] ?? '') === 'yearly' ? 'Pago anual único' : 'Pago por período' }}</p>
        <p class="mt-2 text-sm text-gray-600">Usuarios: {{ $payment->plan_snapshot['max_users'] ?? $payment->plan->max_users ?? 'Por definir' }}</p>
        @if (!empty($payment->plan_snapshot['discount']))<p class="mt-2 text-sm text-green-700">Descuento anual del 5 %: S/ {{ number_format($payment->plan_snapshot['discount'], 2) }}</p>@endif
        <p class="mt-2 text-3xl font-bold text-blue-600">{{ $payment->currency === 'USD' ? 'US$' : 'S/' }} {{ number_format($payment->charge_amount ?? $payment->amount, 2) }}</p>
        @if(!empty($payment->plan_snapshot['processing']))<p class="mt-2 text-sm text-gray-600">Precio final con procesamiento e IGV incluidos. El total es el mismo para los medios habilitados.</p>@endif
        @if($payment->currency === 'USD')<p class="mt-2 text-sm">Base: S/ {{ number_format($payment->amount, 2) }} · Tipo de cambio {{ $payment->exchange_rate }} PEN/USD, {{ $payment->exchange_rate_date?->format('d/m/Y') }}. USD se paga con tarjeta.</p>@endif
        @if(!empty($payment->plan_snapshot['credit']))<p class="mt-2 text-sm">Saldo aplicado por tiempo no usado: S/ {{ number_format($payment->plan_snapshot['credit'], 2) }}. Cambio inmediato al confirmarse el pago.</p>@endif
        <p class="mt-2 text-xs text-gray-500">{{ ($payment->plan_snapshot['type'] ?? '') === 'lifetime' ? 'Pago único por acceso permanente. No requiere renovación.' : ((($payment->plan_snapshot['billing_cycle'] ?? '') === 'yearly' ? 'Este cobro cubre todo el año.' : 'Este cobro cubre el período indicado.').' La renovación es manual.') }}</p>
        @if($reviewMode ?? false)<p class="wk-notice">Entorno de pruebas de Culqi: usa tarjetas de prueba. No se realiza ningún cargo real.</p>@endif
        @if($until=$payment->plan_snapshot['lifetime_quote']['valid_until'] ?? null)<p class="wk-notice">Propuesta definida por administración. Válida hasta {{ \Illuminate\Support\Carbon::parse($until)->timezone('America/Lima')->format('d/m/Y H:i') }}.</p>@endif
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
            @elseif ($offerExpired ?? false)
                Esta propuesta venció. Contáctenos para solicitar una nueva a root o gerencia.
            @elseif (!$enabled)
                El pago en línea no está disponible ahora. Contáctanos para continuar.
            @else
                Tu solicitud está guardada. Completa el pago seguro {{ $payment->currency === 'USD' ? 'con tarjeta en USD.' : 'con tarjeta o Yape en soles.' }}
            @endif
        </p>
        <div class="mt-6 space-y-3">
            @if(isset($payment->plan_snapshot['lifetime_quote']) && $payment->status==='pending' && !($offerExpired ?? false))<label class="wk-choice"><input id="payment-accept-terms" type="checkbox" required><span>Acepto el plan y el total de esta propuesta, los <a class="en-inline-link" href="{{ route('legal.terminos') }}" target="_blank" rel="noopener">Términos y condiciones</a> y la <a class="en-inline-link" href="{{ route('legal.devoluciones') }}" target="_blank" rel="noopener">Política de cambios y devoluciones</a>. He revisado la <a class="en-inline-link" href="{{ route('legal.privacidad') }}" target="_blank" rel="noopener">Política de privacidad</a>.</span></label>@endif
            <a href="{{ route('plans.mine') }}" class="block text-center text-blue-700">Mi plan y mis pagos</a>
            <a id="receipt-link" @if ($receiptUrl) href="{{ $receiptUrl }}" @else hidden @endif class="block rounded-lg border border-blue-200 px-4 py-3 text-center text-blue-700">Ver e imprimir ticket de 80 mm</a>
            @if ($enabled && $payment->status === 'pending' && !in_array($payment->gateway_state, ['processing', 'uncertain']))
                <button id="pay-button" type="button" class="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-50">{{ $payment->currency === 'USD' ? 'Pagar con tarjeta en USD' : 'Pagar con tarjeta o Yape' }}</button>
            @endif
            <button id="refresh-button" type="button" class="w-full rounded-lg border border-blue-200 px-4 py-3 text-blue-700" @if (!in_array($payment->gateway_state, ['processing', 'uncertain'])) hidden @endif>Revisar estado del pago</button>
            @guest<a href="{{ route('login') }}" class="block text-center text-blue-700">Ingresar a mi cuenta</a>@endguest
            <a href="{{ route(auth()->check() ? 'plans.catalog' : 'landing.plans') }}" class="block text-center text-gray-600">Ver planes</a>
        </div>
        <p class="mt-5 text-xs text-gray-500">Culqi procesa los datos de tu tarjeta. El sistema recibe únicamente un token de pago.</p>
        <script id="culqi-config" type="application/json">{!! json_encode([
            'publicKey' => $enabled ? $publicKey : null,
            'amount' => (int) round((float) ($payment->charge_amount ?? $payment->amount) * 100),
            'currency' => $payment->currency ?: 'PEN',
            'email' => $payment->email,
            'title' => $payment->purchaseDescription(),
            'chargeUrl' => $chargeUrl,
        ], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
    </section>
@endsection
