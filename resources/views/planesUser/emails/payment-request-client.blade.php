<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a {{ config('legal.provider.name') }}</title>
</head>

<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">¡Bienvenido a {{ config('legal.provider.name') }}! 🎉</h1>
                            <p style="color: #e0e7ff; margin: 10px 0 0; font-size: 16px;">Tu cuenta ha sido creada
                                exitosamente</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                Hola <strong>{{ $user->name }}</strong>,
                            </p>

                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                ¡Gracias por unirte a nosotros! Hemos recibido tu solicitud para el plan <strong
                                    style="color: #2563eb;">{{ $plan->name }}</strong>.
                            </p>

                            <!-- Cuenta de Prueba -->
                            <table width="100%" cellpadding="16" style="background-color:#dbeafe;margin:20px 0;"><tr><td>
                                @if ($paymentRequest->payment_method === 'free')
                                    <h3>Tu prueba gratuita está activa</h3><p>Tienes 5 días de prueba desde el registro, una sola vez por cuenta. No hay comisión ni cobro automático. Al vencer, debes contratar un plan pagado para continuar.</p>
                                @elseif ($paymentRequest->payment_method === 'culqi')
                                    <h3>Completa el pago de tu plan</h3><p>El acceso pagado se activa cuando Culqi confirma el cobro. El precio final incluye el procesamiento y el IGV del servicio.</p>
                                @else<h3>Solicitud recibida</h3><p>Coordinaremos el precio y las condiciones de tu acceso.</p>@endif
                            </td></tr></table>

                            <!-- Credenciales -->
                            @if ($activationUrl)
                                <table width="100%" cellpadding="16" style="background-color: #dbeafe; margin: 20px 0;">
                                    <tr><td>
                                        <h3>Crea tu contraseña de acceso</h3>
                                        <p>Tu cuenta utiliza {{ $user->email }}. Define tu contraseña mediante el enlace seguro.</p>
                                        <p><a href="{{ $activationUrl }}">Crear mi contraseña</a></p>
                                        <p>Si el enlace vence, solicita otro desde la opción de recuperar contraseña.</p>
                                    </td></tr>
                                </table>
                            @endif
                            @if ($password)
                                <table width="100%" cellpadding="0" cellspacing="0"
                                    style="background-color: #f9fafb; border-radius: 8px; margin: 30px 0; padding: 20px;">
                                    <tr>
                                        <td>
                                            <h3 style="color: #374151; margin: 0 0 15px; font-size: 18px;">🔐 Tus
                                                Credenciales de Acceso</h3>
                                            <table width="100%" cellpadding="8" cellspacing="0">
                                                <tr>
                                                    <td style="color: #6b7280; font-size: 14px; width: 120px;">
                                                        <strong>Email:</strong></td>
                                                    <td style="color: #111827; font-size: 14px;">{{ $user->email }}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #6b7280; font-size: 14px;">
                                                        <strong>Contraseña:</strong></td>
                                                    <td
                                                        style="color: #111827; font-size: 14px; font-family: monospace; background-color: #ffffff; padding: 8px; border-radius: 4px;">
                                                        {{ $password }}</td>
                                                </tr>
                                            </table>
                                            <p style="color: #dc2626; margin: 15px 0 0; font-size: 12px;">
                                                ⚠️ <strong>Importante:</strong> Te recomendamos cambiar tu contraseña
                                                después de iniciar sesión por primera vez.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            @endif

                            <!-- Plan Seleccionado -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin: 30px 0; padding: 20px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #92400e; margin: 0 0 15px; font-size: 18px;">📋 Plan
                                            Seleccionado</h3>
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #78350f; font-size: 14px; width: 120px;">
                                                    <strong>Plan:</strong></td>
                                                <td style="color: #111827; font-size: 14px;">{{ $plan->name }}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #78350f; font-size: 14px;"><strong>Duración:</strong>
                                                </td>
                                                <td style="color: #111827; font-size: 14px;">{{ $plan->duration_text }} · {{ $plan->max_users }} usuario(s)
                                                </td>
                                            </tr>
                                            @if ($plan->type !== 'lifetime')
                                                <tr>
                                                    <td style="color: #78350f; font-size: 14px;">
                                                        <strong>Precio:</strong></td>
                                                    <td style="color: #111827; font-size: 14px; font-weight: bold;">{{ $paymentRequest->currency === 'USD' ? 'US$' : 'S/' }}
                                                        {{ number_format($paymentRequest->charge_amount ?? $plan->price, 2) }}</td>
                                                </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Siguiente Paso -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #d1fae5; border-left: 4px solid #10b981; border-radius: 8px; margin: 30px 0; padding: 20px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #065f46; margin: 0 0 15px; font-size: 18px;">✅ Próximos Pasos
                                        </h3>
                                        <ol
                                            style="color: #047857; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                                            <li>Inicia sesión en tu cuenta con las credenciales proporcionadas</li>
                                            @if ($paymentRequest->payment_method === 'free')<li>Explora las herramientas durante los 5 días de prueba. Después necesitarás un plan pagado.</li>@endif
                                            @if ($paymentRequest->payment_method === 'culqi')
                                                <li><a href="{{ \App\Http\Controllers\CulqiController::paymentUrl($paymentRequest) }}">Completa tu pago seguro con Culqi</a>. El enlace dura 24 horas.</li>
                                            @elseif ($paymentRequest->payment_method === 'yape')
                                                <li>Verificaremos tu pago en las próximas 24-48 horas</li>
                                            @endif
                                            @if ($paymentRequest->payment_method === 'culqi')
                                                <li>Tu plan se activa cuando Culqi confirma el cobro.</li>
                                            @endif
                                        </ol>
                                    </td>
                                </tr>
                            </table>

                            <!-- Botón de Acción -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ url('/login') }}"
                                            style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                            Iniciar Sesión Ahora
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Contacto -->
                            <p
                                style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0; text-align: center;">
                                Si tienes alguna pregunta, contáctanos:
                            </p>
                            <table width="100%" cellpadding="10" cellspacing="0" style="margin: 20px 0;">
                                <tr>
                                    <td align="center" style="font-size: 14px;">
                                        📧 <a href="mailto:{{ config('legal.provider.email') }}"
                                            style="color: #2563eb; text-decoration: none;">{{ config('legal.provider.email') }}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="font-size: 14px;">
                                        📱 <a href="https://wa.me/{{ config('legal.provider.phone') }}"
                                            style="color: #10b981; text-decoration: none;">+{{ config('legal.provider.phone') }}</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px;">
                                © {{ date('Y') }} {{ config('legal.provider.name') }}. Todos los derechos reservados.
                            </p>
                            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                                Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
