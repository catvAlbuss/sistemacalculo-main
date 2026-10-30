@props(['title', 'preheader' => null, 'reference' => null])
@php
    $issuer = config('billing.issuer');
    $provider = config('legal.provider');
    $company = $issuer['legal_name'] ?? $provider['name'];
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>{{ $title }}</title>
</head>
<body style="margin:0;padding:0;background-color:#eceff3;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
@if ($preheader)<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{ $preheader }}</div>@endif
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eceff3;padding:28px 10px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background-color:#ffffff;border:1px solid #d5dbe3;">
    <tr><td style="padding:22px 32px;border-top:4px solid #12263f;border-bottom:1px solid #d5dbe3;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="52" style="vertical-align:middle;"><img src="{{ asset('assets/img/logo_rizabalAsociados.png') }}" width="40" height="41" alt="" style="display:block;border:0;"></td>
            <td style="vertical-align:middle;">
                <p style="margin:0;color:#12263f;font-size:14px;font-weight:bold;letter-spacing:.2px;">{{ $company }}</p>
                @if (!empty($issuer['ruc']))<p style="margin:3px 0 0;color:#6b7280;font-size:12px;">RUC {{ $issuer['ruc'] }}</p>@endif
            </td>
        </tr></table>
    </td></tr>
    <tr><td style="padding:30px 32px 6px;">
        @if ($reference)<p style="margin:0 0 6px;color:#6b7280;font-size:12px;letter-spacing:.4px;">{{ $reference }}</p>@endif
        <h1 style="margin:0 0 18px;color:#12263f;font-size:21px;font-weight:bold;line-height:1.3;">{{ $title }}</h1>
        {{ $slot }}
    </td></tr>
    <tr><td style="padding:20px 32px;background-color:#f6f7f9;border-top:1px solid #d5dbe3;">
        <p style="margin:0 0 5px;color:#374151;font-size:12px;font-weight:bold;">{{ $company }}</p>
        @if (!empty($issuer['address']))<p style="margin:0 0 5px;color:#6b7280;font-size:12px;line-height:1.5;">{{ $issuer['address'] }}</p>@endif
        <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;"><a href="mailto:{{ $provider['email'] }}" style="color:#12263f;">{{ $provider['email'] }}</a> &nbsp;|&nbsp; <a href="https://wa.me/{{ $provider['phone'] }}" style="color:#12263f;">+{{ $provider['phone'] }}</a></p>
    </td></tr>
</table>
<p style="margin:14px 0 0;color:#8a93a0;font-size:11px;line-height:1.5;max-width:620px;">Este mensaje contiene información destinada únicamente a su destinatario. Nunca le pediremos contraseñas ni datos de tarjeta por correo.</p>
</td></tr>
</table>
</body>
</html>
