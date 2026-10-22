@extends('layouts.landing')

@push('scripts')
    @vite('resources/js/planes-registro.js')
@endpush

@section('main')
    @php($invoice = old('receipt_type', $customer?->receipt_type) === 'factura')
    <main class="mx-auto w-full max-w-8xl px-4 py-10 text-gray-800 dark:text-gray-100">
        <a href="{{ route('landing.plans') }}" class="font-semibold text-blue-600">← Volver a planes</a>
        <h1 class="mt-5 text-3xl font-bold">{{ $plan->isFree() ? 'Empieza tu acceso gratuito' : ($plan->isLifetime() ? 'Solicita información de tu plan' : 'Registra tu plan') }}</h1>
        <p class="mt-3 text-gray-600 dark:text-gray-300">{{ $requiresPayment ? 'Completa tus datos y continúa al pago seguro con Culqi. Podrás elegir tarjeta o Yape en línea.' : 'Completa tus datos para continuar con tu solicitud.' }}</p>

        @if ($errors->any() || session('error'))
            <div class="mt-5 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800" role="alert">
                <p class="font-bold">Revisa los datos antes de continuar.</p>
                @if (session('error')) <p>{{ session('error') }}</p> @endif
                <ul>@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
            </div>
        @endif

        <form id="plan-registration" action="{{ route('planes.store') }}" method="POST" class="mt-6 grid items-start gap-6 md:grid-cols-2">
            @csrf
            <input type="hidden" name="subscription_plan_id" value="{{ $plan->id }}">
            <input type="hidden" name="checkout_key" value="{{ $checkoutKey }}">
            <input type="hidden" name="checkout_form_version" value="3">
            <section id="customer-data" class="grid grid-cols-2 gap-4 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 text-gray-800">
                <h2 class="text-xl font-bold">Tus datos</h2>
                <p class="text-sm text-gray-600">{{ $requiresPayment ? 'Un solo registro para tu cuenta y comprobante. Busca tu documento y completa tu correo y teléfono.' : 'Completa tus datos para crear tu acceso.' }}</p>
                @if ($requiresPayment)
                <div><label for="receipt-type" class="mb-2 block text-sm font-semibold">Tipo de comprobante</label><select id="receipt-type" name="receipt_type" required class="w-full rounded-lg border border-gray-300 px-4 py-3"><option value="boleta" @selected(!$invoice)>Boleta</option><option value="factura" @selected($invoice)>Factura</option></select></div>
                <div><label for="document-type" class="mb-2 block text-sm font-semibold">Documento del comprobante</label><input id="document-type" name="document_type" value="{{ $invoice ? 'RUC' : 'DNI' }}" readonly class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3" aria-describedby="document-help"></div>
                <div>
                    <label id="document-number-label" for="document-number" class="mb-2 block text-sm font-semibold">{{ $invoice ? 'Número de RUC' : 'Número de DNI' }}</label>
                    <div class="flex gap-2">
                        <input id="document-number" name="document_number" type="text" inputmode="numeric" value="{{ old('document_number', $customer?->document_number) }}" required minlength="{{ $invoice ? 11 : 8 }}" maxlength="{{ $invoice ? 11 : 8 }}" pattern="{{ $invoice ? '[0-9]{11}' : '[0-9]{8}' }}" placeholder="{{ $invoice ? 'RUC de 11 dígitos' : 'DNI de 8 dígitos' }}" class="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3" aria-describedby="document-help document-lookup-status">
                        <button id="document-search" type="button" data-url="{{ route('planes.document.lookup') }}" data-enabled="{{ $lookupEnabled ? 'true' : 'false' }}" @disabled(!$lookupEnabled) class="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50">Buscar</button>
                    </div>
                    <p id="document-help" class="mt-2 text-xs text-gray-500">{{ $invoice ? 'Factura: ingresa un RUC de 11 dígitos.' : 'Boleta: ingresa un DNI de 8 dígitos.' }}</p>
                    <p id="document-lookup-status" class="mt-2 text-sm text-gray-600" role="status" aria-live="polite">{{ $lookupEnabled ? 'Puedes buscar el nombre o razón social por tu documento.' : 'La búsqueda no está disponible. Completa el nombre o razón social manualmente.' }}</p>
                </div>
                @endif
                <div><label id="billing-name-label" for="plan-name" class="mb-2 block text-sm font-semibold">{{ $invoice ? 'Razón social' : 'Nombres y apellidos' }}</label><input id="plan-name" name="name" type="text" value="{{ old('name', $customer?->name ?? auth()->user()?->name) }}" required maxlength="255" autocomplete="{{ $invoice ? 'organization' : 'name' }}" placeholder="{{ $invoice ? 'Razón social registrada en el RUC' : 'Nombres y apellidos del titular del DNI' }}" class="w-full rounded-lg border border-gray-300 px-4 py-3"></div>
                <div><label for="plan-email" class="mb-2 block text-sm font-semibold">Correo electrónico</label><input id="plan-email" name="email" type="email" value="{{ old('email', auth()->user()?->email) }}" @readonly(auth()->check()) required maxlength="255" autocomplete="email" class="w-full rounded-lg border border-gray-300 px-4 py-3"><p class="mt-2 text-xs text-gray-500">{{ $requiresPayment ? 'Usaremos este correo para tu acceso y comprobante.' : 'Te enviaremos aquí la información de acceso.' }}</p></div>
                <div><label for="plan-phone" class="mb-2 block text-sm font-semibold">Teléfono / WhatsApp</label><input id="plan-phone" name="phone" type="tel" value="{{ old('phone', $customer?->phone) }}" required maxlength="20" autocomplete="tel-national" placeholder="999999999" class="w-full rounded-lg border border-gray-300 px-4 py-3"></div>
                @if ($requiresPayment)
                    <div><label id="billing-address-label" for="billing-address" class="mb-2 block text-sm font-semibold">{{ $invoice ? 'Domicilio fiscal (obligatorio)' : 'Dirección (opcional)' }}</label><input id="billing-address" name="billing_address" type="text" value="{{ old('billing_address', $customer?->billing_address) }}" maxlength="255" @required($invoice) autocomplete="street-address" class="w-full rounded-lg border border-gray-300 px-4 py-3"></div>
                    <div><label id="billing-ubigeo-label" for="billing-ubigeo" class="mb-2 block text-sm font-semibold">{{ $invoice ? 'Distrito del domicilio fiscal' : 'Distrito (opcional)' }}</label>
                        <input id="billing-ubigeo" name="billing_ubigeo" list="billing-districts" value="{{ old('billing_ubigeo', $customer?->billing_ubigeo) }}" maxlength="80" pattern="[0-9]{6}" placeholder="Busca distrito o código de ubigeo" @required($invoice) class="w-full rounded-lg border border-gray-300 px-4 py-3" aria-describedby="billing-location-help">
                        <datalist id="billing-districts">@foreach ($ubigeos as $ubigeo)<option value="{{ $ubigeo->codigo }}" label="{{ $ubigeo->distrito }} · {{ $ubigeo->provincia }} · {{ $ubigeo->departamento }}"></option>@endforeach</datalist>
                        <p id="billing-location-help" class="mt-2 text-xs text-gray-500">Selecciona el distrito: provincia y departamento se obtienen del catálogo. El código tiene 6 dígitos.</p>
                    </div>
                @endif
            </section>

            <section id="plan-summary" class="grid grid-cols-2 gap-4 space-y-5 md:sticky md:top-6 rounded-2xl border border-gray-200 bg-white p-6 text-gray-800">
                <h2 class="text-xl font-bold">{{ $plan->name }}</h2>
                <p id="plan-duration" class="text-sm text-gray-600">{{ $totals['duration_text'] }}</p>
                <p class="text-sm text-gray-600">{{ $plan->description }}</p>
                <dl class="grid grid-cols-2 gap-3 rounded-lg bg-blue-50 p-4 text-sm">
                    <div><dt class="text-gray-600">Usuarios incluidos</dt><dd class="font-semibold">{{ $plan->max_users ?? 'Por definir' }}</dd></div>
                    <div><dt class="text-gray-600">Proyectos incluidos</dt><dd class="font-semibold">{{ $plan->max_projects ?? 'Por definir' }}</dd></div>
                </dl>
                @if ($plan->features)
                    <ul class="space-y-2 text-sm text-gray-600" aria-label="Incluido en el plan">@foreach ($plan->features as $feature)<li>✓ {{ $feature }}</li>@endforeach</ul>
                @endif
                @if ($requiresPayment)
                    <div><label for="billing-cycle" class="mb-2 block text-sm font-semibold">Período de pago</label><select id="billing-cycle" name="billing_cycle" class="w-full rounded-lg border border-gray-300 px-4 py-3">
                        @foreach ($pricingOptions as $option => $quote)<option value="{{ $option }}" @selected($cycle === $option)>{{ $option === 'yearly' ? 'Anual' : 'Mensual' }}{{ $quote['discount_percent'] ? ' — 5 % de descuento' : '' }}</option>@endforeach
                    </select></div>
                    @if ($plan->type === 'monthly')
                        <div id="months-row" @if ($cycle === 'yearly') hidden @endif><label for="plan-months" class="mb-2 block text-sm font-semibold">Meses que deseas pagar</label><select id="plan-months" name="months" @disabled($cycle === 'yearly') class="w-full rounded-lg border border-gray-300 px-4 py-3">@foreach (range(1, 12) as $count)<option value="{{ $count }}" @selected($months === $count)>{{ $count }} {{ $count === 1 ? 'mes' : 'meses' }}</option>@endforeach</select><p class="mt-2 text-xs text-gray-500">Un solo pago por los meses elegidos. Para el descuento del 5 %, selecciona Anual.</p></div>
                    @endif
                    <script id="plan-pricing" type="application/json">{!! json_encode($pricingOptions, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
                @endif
                @if ($plan->isLifetime() && !$plan->isFree())
                    <p class="text-3xl font-bold text-blue-600">Precio personalizado</p>
                @else
                    <dl class="space-y-3 rounded-lg bg-gray-50 p-4" aria-label="Resumen de importes">
                        <div id="annual-list-row" @if (!$totals['discount']) hidden @endif class="flex justify-between gap-4"><dt class="text-gray-600">12 mensualidades</dt><dd id="plan-list-total" class="font-semibold">S/ {{ number_format($totals['list_total'], 2) }}</dd></div>
                        <div id="annual-discount-row" @if (!$totals['discount']) hidden @endif class="flex justify-between gap-4 text-green-700"><dt>Descuento anual (5 %)</dt><dd id="plan-discount" class="font-semibold">− S/ {{ number_format($totals['discount'], 2) }}</dd></div>
                        <div class="flex justify-between gap-4"><dt class="text-gray-600">Subtotal</dt><dd id="plan-subtotal" class="font-semibold">S/ {{ number_format($totals['subtotal'], 2) }}</dd></div>
                        <div class="flex justify-between gap-4"><dt class="text-gray-600">IGV ({{ number_format($totals['tax_rate'], 0) }} %)</dt><dd id="plan-tax" class="font-semibold">S/ {{ number_format($totals['tax_amount'], 2) }}</dd></div>
                        <div class="flex items-center justify-between gap-4 border-t border-gray-200 pt-4"><dt class="font-bold">Total a pagar</dt><dd id="plan-total" class="text-2xl font-bold text-blue-600">S/ {{ number_format($totals['total'], 2) }}</dd></div>
                    </dl>
                    @if ($requiresPayment)<p id="plan-payment-period" class="text-sm font-semibold text-blue-700">{{ $cycle === 'yearly' ? 'Un solo cobro por todo el año.' : 'Un cobro por el período mensual.' }} La renovación es manual.</p>@endif
                    <p class="text-xs text-gray-500">{{ $requiresPayment ? 'El precio incluye IGV. Este es el importe que se cobrará con Culqi.' : 'Acceso sin costo. No se realizará ningún cobro.' }}</p>
                @endif
                @if ($requiresPayment)
                    <input type="hidden" name="payment_method" value="culqi">
                    <div class="rounded-lg border border-blue-200 bg-blue-50 p-5 text-blue-900">
                        <p class="font-bold">Tarjeta o Yape en línea</p>
                        <p class="mt-2 text-sm">Todos los pagos se procesan de forma segura con Culqi. Tu plan se activa cuando la pasarela confirma el cobro.</p>
                        @if ($culqiEnabled)
                            <p class="mt-3 text-sm">Al continuar guardamos tu solicitud y abrimos la pantalla de pago. Allí eliges tarjeta o Yape. No necesitas adjuntar un comprobante.</p>
                        @else
                            <p class="mt-3 text-sm" role="status">El pago en línea no está disponible en este momento. Vuelve más tarde o <a href="{{ route('contacto.index') }}" class="underline">contáctanos</a>.</p>
                        @endif
                    </div>
                @elseif ($plan->isFree())
                    <div class="rounded-lg bg-green-50 p-4 text-green-800">No necesitas tarjeta ni comprobante. Tu acceso gratuito comienza al completar el registro.</div>
                @else
                    <p class="text-sm text-gray-600">Coordinaremos el precio y el método de pago contigo. También puedes <a href="{{ route('contacto.index') }}" class="text-blue-700 underline">contactarnos directamente</a>.</p>
                @endif
                @if ($requiresPayment)
                    <label class="flex items-start gap-3 text-sm text-gray-600"><input name="accept_terms" type="checkbox" value="1" required @checked(old('accept_terms')) class="mt-1"><span>He revisado el plan, sus cupos, el período y el total. Acepto realizar este pago único con renovación manual.</span></label>
                @endif
                <button id="registration-submit" type="submit" data-payment-unavailable="{{ $requiresPayment && !$culqiEnabled ? 'true' : 'false' }}" @disabled($requiresPayment && !$culqiEnabled) class="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50">{{ $requiresPayment ? ($culqiEnabled ? 'Registrar y pagar' : 'Pago en línea no disponible') : ($plan->isFree() ? 'Empezar gratis' : 'Enviar solicitud') }}</button>

            </section>
        </form>
    </main>
@endsection
