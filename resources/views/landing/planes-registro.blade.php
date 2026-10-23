@extends(auth()->check() ? 'layouts.workspace' : 'layouts.landing')

@push('scripts')
    @vite('resources/js/planes-registro.js')
@endpush

@section('main')
    @php($invoice = old('receipt_type', $customer?->receipt_type) === 'factura')
    <main class="plan-register">
      <div class="pr-shell">
        <a href="{{ route(auth()->check() ? 'plans.catalog' : 'landing.plans') }}" class="pr-back"><span aria-hidden="true">←</span> Volver a planes</a>
        <header class="pr-header">
            <div>
                <p class="pr-eyebrow">Rizabal & Asociados / Software de ingeniería</p>
                <h1>{{ $plan->isFree() ? 'Empieza tu acceso gratuito' : ($plan->isLifetime() ? 'Solicita información de tu plan' : 'Registra tu plan') }}</h1>
                <p class="pr-description">{{ $requiresPayment ? 'Configura tu acceso, registra tus datos y revisa el importe antes de continuar al pago.' : 'Registra tus datos y revisa las características del acceso que estás solicitando.' }}</p>
            </div>
            <div class="pr-blueprint" aria-hidden="true">
                <svg viewBox="0 0 112 72" fill="none" stroke="currentColor" stroke-width="1.1">
                    <path d="M18 56h76M26 56V30l30-17 30 17v26M26 30h60M41 22v34M71 22v34M26 43h60M41 30l15 13 15-13M41 43l15 13 15-13"/>
                    <path d="M18 66h76M18 63v6M94 63v6M8 56V13M5 56h6M5 13h6" stroke-dasharray="2 2"/>
                    <circle cx="26" cy="56" r="2" fill="currentColor"/><circle cx="86" cy="56" r="2" fill="currentColor"/>
                </svg>
            </div>
        </header>
        <ol class="pr-steps" aria-label="Proceso de registro">
            <li><span aria-hidden="true">01</span> Elige tu plan</li>
            <li aria-current="step"><span aria-hidden="true">02</span> Registra tus datos</li>
            <li><span aria-hidden="true">03</span> {{ $requiresPayment ? 'Pago y acceso' : 'Confirma tu solicitud' }}</li>
        </ol>

        @if ($errors->any() || session('error'))
            <div class="pr-error" role="alert">
                <strong>Revisa los datos antes de continuar.</strong>
                @if (session('error')) <p>{{ session('error') }}</p> @endif
                <ul>@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
            </div>
        @endif

        @if($requiresPayment)
        <section class="pr-panel pr-quote" aria-labelledby="quote-heading">
            <div class="pr-section-head">
                <span class="pr-section-number" aria-hidden="true">A</span>
                <div><h2 id="quote-heading">Configuración de la compra</h2><p class="pr-hint">Elige la moneda y cuándo comenzará tu nuevo período.</p></div>
            </div>
            <form method="GET" action="{{ route('planes.register') }}">
                <input type="hidden" name="plan" value="{{ $plan->id }}">
                <div class="pr-quote-body">
                    <div class="pr-field">
                        <label for="quote-currency" class="pr-label">Moneda del cobro</label>
                        <select id="quote-currency" name="currency" class="pr-input" aria-describedby="quote-help">
                            <option value="PEN" @selected($currency === 'PEN')>Soles · tarjeta o Yape</option>
                            <option value="USD" @selected($currency === 'USD') @disabled(!$exchangeRate)>Dólares · tarjeta</option>
                        </select>
                    </div>
                    <div class="pr-field">
                        <label for="quote-start" class="pr-label">Inicio del plan</label>
                        <select id="quote-start" name="purchase_mode" class="pr-input">
                            <option value="renew" @selected($mode === 'renew')>{{ auth()->user()?->hasActiveSubscription() ? 'Al finalizar la cobertura pagada' : 'Al confirmarse el pago' }}</option>
                            @if($canUpgrade)<option value="upgrade" @selected($mode === 'upgrade')>Cambio inmediato con saldo por tiempo no usado</option>@endif
                        </select>
                    </div>
                    <button type="submit" class="pr-button pr-button-secondary">Actualizar cotización</button>
                </div>
                <p id="quote-help" class="pr-hint pr-quote-note">Actualiza estas opciones antes de completar el formulario. @if(!$exchangeRate)El cobro en USD se habilitará cuando exista un tipo de cambio vigente.@endif</p>
            </form>
        </section>
        @endif

        <form id="plan-registration" action="{{ route('planes.store') }}" method="POST" class="pr-layout">
            @csrf
            <input type="hidden" name="subscription_plan_id" value="{{ $plan->id }}">
            <input type="hidden" name="checkout_key" value="{{ $checkoutKey }}">
            <input type="hidden" name="checkout_form_version" value="5">
            <input type="hidden" name="currency" value="{{ $currency }}">
            <input type="hidden" name="purchase_mode" value="{{ $mode }}">
            <input type="hidden" id="pricing-key" name="pricing_key" value="{{ $totals['pricing_key'] }}">

            <section id="customer-data" class="pr-panel" aria-labelledby="customer-heading">
                <div class="pr-section-head">
                    <span class="pr-section-number" aria-hidden="true">B</span>
                    <div><h2 id="customer-heading">Tus datos</h2><p class="pr-hint">{{ $requiresPayment ? 'Un solo registro para tu cuenta y comprobante. Los campos son obligatorios, salvo los indicados como opcionales.' : 'Información del titular de tu acceso. Completa todos los campos.' }}</p></div>
                </div>
                <div class="pr-fields">
                    <fieldset class="pr-fieldset">
                        <legend>{{ $requiresPayment ? 'Identificación del titular' : 'Titular del acceso' }}</legend>
                        <div class="pr-field-grid">
                            @if ($requiresPayment)
                                <div class="pr-field">
                                    <label for="receipt-type" class="pr-label">Tipo de comprobante</label>
                                    <select id="receipt-type" name="receipt_type" required class="pr-input">
                                        <option value="boleta" @selected(!$invoice)>Boleta</option><option value="factura" @selected($invoice)>Factura</option>
                                    </select>
                                </div>
                                <div class="pr-field">
                                    <label for="document-type" class="pr-label">Documento del comprobante</label>
                                    <input id="document-type" name="document_type" value="{{ $invoice ? 'RUC' : 'DNI' }}" readonly class="pr-input" aria-describedby="document-help">
                                </div>
                                <div class="pr-field pr-wide">
                                    <label id="document-number-label" for="document-number" class="pr-label">{{ $invoice ? 'Número de RUC' : 'Número de DNI' }}</label>
                                    <div class="pr-input-row">
                                        <input id="document-number" name="document_number" type="text" inputmode="numeric" value="{{ old('document_number', $customer?->document_number) }}" required minlength="{{ $invoice ? 11 : 8 }}" maxlength="{{ $invoice ? 11 : 8 }}" pattern="{{ $invoice ? '[0-9]{11}' : '[0-9]{8}' }}" placeholder="{{ $invoice ? 'RUC de 11 dígitos' : 'DNI de 8 dígitos' }}" class="pr-input" aria-invalid="{{ $errors->has('document_number') ? 'true' : 'false' }}" aria-describedby="document-help document-lookup-status">
                                        <button id="document-search" type="button" data-url="{{ route('planes.document.lookup') }}" data-enabled="{{ $lookupEnabled ? 'true' : 'false' }}" @disabled(!$lookupEnabled) class="pr-button">Buscar</button>
                                    </div>
                                    <p id="document-help" class="pr-hint">{{ $invoice ? 'Factura: ingresa un RUC de 11 dígitos.' : 'Boleta: ingresa un DNI de 8 dígitos.' }}</p>
                                    <p id="document-lookup-status" class="pr-hint" role="status" aria-live="polite">{{ $lookupEnabled ? 'Busca tu documento para completar el nombre o razón social.' : 'La búsqueda no está disponible. Completa el nombre o razón social manualmente.' }}</p>
                                    @error('document_number')<p class="pr-field-error">{{ $message }}</p>@enderror
                                </div>
                            @endif
                            <div class="pr-field pr-wide">
                                <label id="billing-name-label" for="plan-name" class="pr-label">{{ $invoice ? 'Razón social' : 'Nombres y apellidos' }}</label>
                                <input id="plan-name" name="name" type="text" value="{{ old('name', $customer?->name ?? auth()->user()?->name) }}" required maxlength="255" autocomplete="{{ $invoice ? 'organization' : 'name' }}" placeholder="{{ $invoice ? 'Razón social registrada en el RUC' : 'Nombres y apellidos del titular' }}" class="pr-input" aria-invalid="{{ $errors->has('name') ? 'true' : 'false' }}">
                                @error('name')<p class="pr-field-error">{{ $message }}</p>@enderror
                            </div>
                        </div>
                    </fieldset>

                    <fieldset class="pr-fieldset">
                        <legend>Contacto y acceso</legend>
                        <div class="pr-field-grid">
                            <div class="pr-field">
                                <label for="plan-email" class="pr-label">Correo electrónico</label>
                                <input id="plan-email" name="email" type="email" value="{{ old('email', auth()->user()?->email) }}" @readonly(auth()->check()) required maxlength="255" autocomplete="email" placeholder="tu@correo.com" class="pr-input" aria-invalid="{{ $errors->has('email') ? 'true' : 'false' }}" aria-describedby="email-help">
                                <p id="email-help" class="pr-hint">{{ $requiresPayment ? 'Usaremos este correo para tu acceso y comprobante.' : 'Te enviaremos aquí la información de acceso.' }}</p>
                                @error('email')<p class="pr-field-error">{{ $message }}</p>@enderror
                            </div>
                            <div class="pr-field">
                                <label for="plan-phone" class="pr-label">Teléfono / WhatsApp</label>
                                <input id="plan-phone" name="phone" type="tel" value="{{ old('phone', $customer?->phone) }}" required maxlength="20" autocomplete="tel-national" placeholder="999999999" class="pr-input" aria-invalid="{{ $errors->has('phone') ? 'true' : 'false' }}">
                                @error('phone')<p class="pr-field-error">{{ $message }}</p>@enderror
                            </div>
                        </div>
                    </fieldset>

                    @if ($requiresPayment)
                        <fieldset class="pr-fieldset">
                            <legend>Dirección del comprobante</legend>
                            <div class="pr-field-grid">
                                <div class="pr-field pr-wide">
                                    <label id="billing-address-label" for="billing-address" class="pr-label">{{ $invoice ? 'Domicilio fiscal (obligatorio)' : 'Dirección (opcional)' }}</label>
                                    <input id="billing-address" name="billing_address" type="text" value="{{ old('billing_address', $customer?->billing_address) }}" maxlength="255" @required($invoice) autocomplete="street-address" placeholder="Av., calle o jirón y número" class="pr-input" aria-invalid="{{ $errors->has('billing_address') ? 'true' : 'false' }}">
                                    @error('billing_address')<p class="pr-field-error">{{ $message }}</p>@enderror
                                </div>
                                <div class="pr-field pr-wide">
                                    <label id="billing-ubigeo-label" for="billing-ubigeo" class="pr-label">{{ $invoice ? 'Distrito del domicilio fiscal' : 'Distrito (opcional)' }}</label>
                                    <input id="billing-ubigeo" name="billing_ubigeo" list="billing-districts" value="{{ old('billing_ubigeo', $customer?->billing_ubigeo) }}" maxlength="80" pattern="[0-9]{6}" placeholder="Busca distrito o código de ubigeo" @required($invoice) class="pr-input" aria-invalid="{{ $errors->has('billing_ubigeo') ? 'true' : 'false' }}" aria-describedby="billing-location-help">
                                    <datalist id="billing-districts">@foreach ($ubigeos as $ubigeo)<option value="{{ $ubigeo->codigo }}" label="{{ $ubigeo->distrito }} · {{ $ubigeo->provincia }} · {{ $ubigeo->departamento }}"></option>@endforeach</datalist>
                                    <p id="billing-location-help" class="pr-hint">Selecciona el distrito: provincia y departamento se obtienen del catálogo. El código tiene 6 dígitos.</p>
                                    @error('billing_ubigeo')<p class="pr-field-error">{{ $message }}</p>@enderror
                                </div>
                            </div>
                        </fieldset>
                    @endif
                </div>
                <p class="pr-data-note">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m10 2 6 2v5c0 4-6 8-6 8s-6-4-6-8V4l6-2Z"/><path d="m7 9 2 2 4-4"/></svg>
                    <span>{{ $requiresPayment ? 'Los datos del titular se utilizarán para tu cuenta y el comprobante. Revísalos antes de continuar.' : 'Verifica tu correo y teléfono para recibir la información de tu acceso.' }}</span>
                </p>
            </section>

            <section id="plan-summary" class="pr-panel pr-summary" aria-labelledby="summary-heading">
                <header class="pr-plan-head">
                    <p class="pr-eyebrow">C / Resumen de tu acceso</p>
                    <div class="pr-plan-title"><h2 id="summary-heading">{{ $plan->name }}</h2><p id="plan-duration" class="pr-duration">{{ $totals['duration_text'] }}</p></div>
                    <p class="pr-plan-description">{{ $plan->description }}</p>
                </header>
                <div class="pr-summary-body">
                    <dl class="pr-capacity">
                        <div><dt>Usuarios incluidos</dt><dd>{{ $plan->max_users ?? 'Por definir' }}</dd></div>
                        <div><dt>Proyectos incluidos</dt><dd>{{ $plan->max_projects ?? 'Por definir' }}</dd></div>
                    </dl>
                    @if ($plan->features)
                        <ul class="pr-features" aria-label="Incluido en el plan">@foreach ($plan->features as $feature)<li>{{ $feature }}</li>@endforeach</ul>
                    @endif
                    @if ($requiresPayment)
                        <div class="pr-period">
                            <div class="pr-field">
                                <label for="billing-cycle" class="pr-label">Período de pago</label>
                                <select id="billing-cycle" name="billing_cycle" class="pr-input">
                                    @foreach ($pricingOptions as $option => $quote)<option value="{{ $option }}" @selected($cycle === $option)>{{ $option === 'yearly' ? 'Anual' : 'Mensual' }}{{ $quote['discount_percent'] ? ' — 5 % de descuento' : '' }}</option>@endforeach
                                </select>
                            </div>
                            @if ($plan->type === 'monthly')
                                <div id="months-row" class="pr-field" @if ($cycle === 'yearly') hidden @endif>
                                    <label for="plan-months" class="pr-label">Meses a contratar</label>
                                    <select id="plan-months" name="months" @disabled($cycle === 'yearly') class="pr-input">@foreach (range(1, 12) as $count)<option value="{{ $count }}" @selected($months === $count) @disabled(!isset($pricingOptions['monthly']['periods'][$count]))>{{ $count }} {{ $count === 1 ? 'mes' : 'meses' }}</option>@endforeach</select>
                                </div>
                            @endif
                        </div>
                        <script id="plan-pricing" type="application/json">{!! json_encode($pricingOptions, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
                    @endif

                    @if ($plan->isLifetime() && !$plan->isFree())
                        <p class="pr-charge-total">Precio personalizado</p>
                    @elseif ($plan->isFree())
                        <div class="pr-charge"><p class="pr-eyebrow">Prueba única de 15 días</p><p class="pr-charge-total">Gratis · S/ 0.00</p><p class="pr-hint">Sin comisión, sin tarjeta y sin cobro automático. Al vencer, debes contratar un plan pagado para continuar usando el software.</p></div>
                    @else
                        <dl class="pr-totals" aria-label="Resumen de importes">
                            <div id="annual-list-row" @if (!$totals['discount']) hidden @endif><dt>12 mensualidades</dt><dd id="plan-list-total">S/ {{ number_format($totals['list_total'], 2) }}</dd></div>
                            <div id="annual-discount-row" class="pr-discount" @if (!$totals['discount']) hidden @endif><dt>Descuento anual (5 %)</dt><dd id="plan-discount">− S/ {{ number_format($totals['discount'], 2) }}</dd></div>
                            <div id="processing-row" @if(empty($totals['processing_fee'])) hidden @endif><dt>Procesamiento incluido en el precio</dt><dd id="plan-processing">S/ {{ number_format($totals['processing_fee'] ?? 0, 2) }}</dd></div>
                            <div><dt>Subtotal</dt><dd id="plan-subtotal">S/ {{ number_format($totals['subtotal'], 2) }}</dd></div>
                            <div><dt>IGV ({{ number_format($totals['tax_rate'], 0) }} %)</dt><dd id="plan-tax">S/ {{ number_format($totals['tax_amount'], 2) }}</dd></div>
                            <div class="pr-net"><dt>{{ $currency === 'USD' ? 'Base equivalente en soles' : 'Total del período' }}</dt><dd id="plan-total">S/ {{ number_format($totals['total'], 2) }}</dd></div>
                        </dl>
                        @if($requiresPayment)
                            <p id="plan-credit" class="pr-credit">{{ $totals['credit'] ? 'Saldo aplicado por tiempo no usado: S/ '.number_format($totals['credit'], 2).'. El nuevo plan empieza al confirmarse el pago.' : '' }}</p>
                            <div class="pr-charge">
                                <p class="pr-eyebrow">Importe a pagar</p>
                                <p id="plan-charge-total" class="pr-charge-total">Cobro: {{ $currency === 'USD' ? 'US$' : 'S/' }} {{ number_format($totals['charge_amount'], 2) }}</p>
                                <p id="plan-payment-period" class="pr-hint">{{ $cycle === 'yearly' ? 'Un solo cobro por todo el año.' : 'Un cobro por el período mensual.' }} La renovación es manual.</p>
                            </div>
                            @if($currency === 'USD')<p class="pr-hint">Equivalencia base mostrada en soles. Tipo de cambio: {{ number_format($totals['exchange_rate'], 4) }} PEN/USD, fecha {{ $totals['exchange_rate_date'] }}. La cotización se congela al registrar la compra; USD se paga con tarjeta.</p>@endif
                        @endif
                        <p class="pr-hint">El precio final incluye IGV y procesamiento. El total es el mismo para los medios de pago disponibles; no se añade otro recargo al pagar.</p>
                    @endif

                    @if ($requiresPayment)
                        <input type="hidden" name="payment_method" value="culqi">
                        <div class="pr-payment-note">
                            <strong>{{ $currency === 'USD' ? 'Tarjeta en USD' : 'Tarjeta o Yape en línea' }}</strong>
                            <p>Todos los pagos se procesan de forma segura con Culqi. Tu plan se activa cuando la pasarela confirma el cobro.</p>
                            @if ($culqiEnabled)
                                <p class="pr-hint">{{ $currency === 'USD' ? 'Al continuar guardamos tu solicitud y abrimos el pago con tarjeta en USD.' : 'Al continuar guardamos tu solicitud y abrimos la pantalla para elegir tarjeta o Yape.' }} No necesitas adjuntar un comprobante.</p>
                            @else
                                <p class="pr-hint" role="status">El pago en línea no está disponible en este momento. Vuelve más tarde o <a href="{{ route(auth()->check() ? 'account.support' : 'contacto.index') }}">contáctanos</a>.</p>
                            @endif
                        </div>
                    @elseif ($plan->isFree())
                        <p class="pr-payment-note"><strong>Sin tarjeta ni comprobante</strong>Tu prueba de 15 días comienza al completar el registro. Después deberás elegir un plan pagado para continuar.</p>
                    @else
                        <p class="pr-payment-note">Coordinaremos el precio y el método de pago contigo. También puedes <a href="{{ route(auth()->check() ? 'account.support' : 'contacto.index') }}">contactarnos directamente</a>.</p>
                    @endif
                    <label class="pr-legal">
                        <input name="accept_terms" type="checkbox" value="1" required @checked(old('accept_terms'))>
                        <span>He leído y acepto los <a href="{{ route('legal.terminos') }}" target="_blank" rel="noopener">Términos y condiciones</a> y la <a href="{{ route('legal.devoluciones') }}" target="_blank" rel="noopener">Política de cambios y devoluciones</a>. He revisado la <a href="{{ route('legal.privacidad') }}" target="_blank" rel="noopener">Política de privacidad</a>. @if($requiresPayment)Acepto el plan, sus cupos, el período y el total de este pago único con renovación manual.@endif</span>
                    </label>
                    <button id="registration-submit" type="submit" data-payment-unavailable="{{ $requiresPayment && !$culqiEnabled ? 'true' : 'false' }}" @disabled($requiresPayment && !$culqiEnabled) class="pr-button pr-submit">{{ $requiresPayment ? ($culqiEnabled ? 'Registrar y pagar' : 'Pago en línea no disponible') : ($plan->isFree() ? 'Empezar gratis' : 'Enviar solicitud') }}</button>
                </div>
            </section>
        </form>
        <div class="pr-support"><p>¿Necesitas ayuda con tu registro?</p><a href="{{ route(auth()->check() ? 'account.support' : 'contacto.index') }}">Contactar con soporte <span aria-hidden="true">↗</span></a></div>
      </div>
    </main>
@endsection
