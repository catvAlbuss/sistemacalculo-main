@php
    $provider = config('legal.provider');
    $issuer = $receipt?->issuer ?? config('billing.issuer');
    $paidInUsd = $payment->currency === 'USD';
    $money = fn ($value) => 'S/ '.number_format((float) $value, 2);
    $label = 'color:#6b7280;font-size:13px;padding:5px 0;vertical-align:top;';
    $value = 'color:#111827;font-size:13px;padding:5px 0;text-align:right;vertical-align:top;';
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante de pago</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f3f4f6;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:20px 8px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
    <tr><td style="padding:24px 28px;border-bottom:3px solid #1e3a8a;">
        <p style="margin:0;color:#1e3a8a;font-size:18px;font-weight:bold;">{{ $issuer['legal_name'] ?? $provider['name'] }}</p>
        @if (!empty($issuer['ruc']))<p style="margin:4px 0 0;color:#6b7280;font-size:12px;">RUC {{ $issuer['ruc'] }}</p>@endif
        @if (!empty($issuer['address']))<p style="margin:2px 0 0;color:#6b7280;font-size:12px;">{{ $issuer['address'] }}</p>@endif
    </td></tr>

    <tr><td style="padding:24px 28px 8px;">
        <h1 style="margin:0 0 10px;color:#111827;font-size:20px;">{{ $forAdmin ? 'Pago recibido' : 'Pago confirmado' }}</h1>
        @if ($forAdmin)
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">{{ $payment->name }} ({{ $payment->email }}, {{ $payment->phone }}) pagó el plan {{ $plan->name }}. Culqi confirmó el cargo y la cobertura ya quedó registrada.</p>
        @else
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">Hola {{ $payment->name }}, recibimos tu pago. {{ $subscription->starts_at->isFuture() ? 'Tu plan '.$plan->name.' empieza el '.$subscription->starts_at->timezone('America/Lima')->format('d/m/Y').'; conservas tu cobertura actual hasta esa fecha.' : 'Tu plan '.$plan->name.' ya está activo.' }}</p>
        @endif
    </td></tr>

    <tr><td style="padding:16px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;">
            @if ($receipt)
                <tr><td style="{{ $label }}padding-top:12px;">Comprobante</td><td style="{{ $value }}padding-top:12px;font-weight:bold;">{{ ucfirst($receipt->receipt_type) }} interna {{ $receipt->number }}</td></tr>
                <tr><td style="{{ $label }}">Fecha</td><td style="{{ $value }}">{{ $receipt->issued_at->timezone('America/Lima')->format('d/m/Y H:i') }}</td></tr>
                <tr><td style="{{ $label }}">Receptor</td><td style="{{ $value }}">{{ $receipt->customer_name }}</td></tr>
                <tr><td style="{{ $label }}">{{ $receipt->document_type }}</td><td style="{{ $value }}">{{ $receipt->document_number }}</td></tr>
                @if ($receipt->customer_address)<tr><td style="{{ $label }}">Dirección</td><td style="{{ $value }}">{{ $receipt->customer_address }}</td></tr>@endif
                <tr><td style="{{ $label }}">Concepto</td><td style="{{ $value }}">{{ $receipt->description }}</td></tr>
                @if ($receipt->subtotal !== null && $receipt->tax_amount !== null)
                    <tr><td style="{{ $label }}">Subtotal</td><td style="{{ $value }}">{{ $money($receipt->subtotal) }}</td></tr>
                    <tr><td style="{{ $label }}">IGV ({{ number_format((float) $receipt->tax_rate, 0) }} %)</td><td style="{{ $value }}">{{ $money($receipt->tax_amount) }}</td></tr>
                @endif
            @else
                <tr><td style="{{ $label }}padding-top:12px;">Concepto</td><td style="{{ $value }}padding-top:12px;">{{ $plan->name }}</td></tr>
            @endif
            <tr>
                <td style="color:#111827;font-size:15px;font-weight:bold;padding:12px 0 5px;border-top:1px solid #e5e7eb;">Total pagado</td>
                <td style="color:#111827;font-size:15px;font-weight:bold;padding:12px 0 5px;border-top:1px solid #e5e7eb;text-align:right;">{{ $money($payment->amount) }}</td>
            </tr>
            @if ($paidInUsd)<tr><td style="{{ $label }}">Cobrado en tarjeta</td><td style="{{ $value }}">US$ {{ number_format((float) $payment->charge_amount, 2) }} · TC {{ $payment->exchange_rate }}</td></tr>@endif
            <tr><td style="{{ $label }}">Cobertura</td><td style="{{ $value }}">{{ $subscription->starts_at->timezone('America/Lima')->format('d/m/Y') }} al {{ $subscription->ends_at?->timezone('America/Lima')->format('d/m/Y') ?? 'sin vencimiento' }}</td></tr>
            <tr><td style="{{ $label }}">Operación Culqi</td><td style="{{ $value }}word-break:break-all;">{{ $payment->gateway_charge_id }}</td></tr>
        </table>
    </td></tr>

    <tr><td align="center" style="padding:4px 28px 20px;">
        @if ($printUrl)<a href="{{ $printUrl }}" style="display:inline-block;margin:4px;background-color:#1e3a8a;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:6px;font-size:14px;font-weight:bold;">Ver e imprimir comprobante</a>@endif
        @if ($forAdmin)
            <a href="{{ $adminUrl }}" style="display:inline-block;margin:4px;border:1px solid #1e3a8a;color:#1e3a8a;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:bold;">Abrir en administración</a>
        @else
            <a href="{{ url('/dashboard') }}" style="display:inline-block;margin:4px;border:1px solid #1e3a8a;color:#1e3a8a;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:bold;">Ir a mi panel</a>
        @endif
    </td></tr>

    @if ($receipt)
        <tr><td style="padding:0 28px 16px;">
            <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">Documento interno sin validez tributaria. Pendiente de emisión electrónica mediante SUNAT.</p>
        </td></tr>
    @endif

    <tr><td style="padding:16px 28px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
        <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.6;">¿Dudas sobre este pago? Escríbenos a <a href="mailto:{{ $provider['email'] }}" style="color:#1e3a8a;">{{ $provider['email'] }}</a> o por <a href="https://wa.me/{{ $provider['phone'] }}" style="color:#1e3a8a;">WhatsApp</a>.</p>
    </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
