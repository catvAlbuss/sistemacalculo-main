<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Solicitud de Pago</title>
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
                            style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔔 Nueva Solicitud de Pago</h1>
                            <p style="color: #fecaca; margin: 10px 0 0; font-size: 16px;">Requiere verificación</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                Se ha recibido una nueva solicitud de suscripción que requiere tu atención.
                            </p>

                            <!-- Información del Cliente -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; margin: 30px 0; padding: 20px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #065f46; margin: 0 0 15px; font-size: 18px;">👤 Información
                                            del Cliente</h3>
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #047857; font-size: 14px; width: 140px;">
                                                    <strong>Nombre:</strong>
                                                </td>
                                                <td style="color: #111827; font-size: 14px;">{{ $paymentRequest->name }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #047857; font-size: 14px;"><strong>Email:</strong>
                                                </td>
                                                <td style="color: #111827; font-size: 14px;">
                                                    <a href="mailto:{{ $paymentRequest->email }}"
                                                        style="color: #2563eb; text-decoration: none;">
                                                        {{ $paymentRequest->email }}
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #047857; font-size: 14px;"><strong>Teléfono:</strong>
                                                </td>
                                                <td style="color: #111827; font-size: 14px;">
                                                    <a href="https://wa.me/{{ str_replace([' ', '-', '+'], '', $paymentRequest->phone) }}"
                                                        style="color: #10b981; text-decoration: none;">
                                                        {{ $paymentRequest->phone }}
                                                    </a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #047857; font-size: 14px;"><strong>User ID:</strong>
                                                </td>
                                                <td style="color: #111827; font-size: 14px; font-family: monospace;">
                                                    #{{ $user->id }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Información del Plan -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #dbeafe; border-left: 4px solid #2563eb; border-radius: 8px; margin: 30px 0; padding: 20px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 18px;">📋 Detalles del
                                            Plan</h3>
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #1e3a8a; font-size: 14px; width: 140px;">
                                                    <strong>Plan:</strong>
                                                </td>
                                                <td style="color: #111827; font-size: 14px; font-weight: bold;">
                                                    {{ $plan->name }}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e3a8a; font-size: 14px;"><strong>Duración:</strong>
                                                </td>
                                                <td style="color: #111827; font-size: 14px;">{{ $plan->duration_text }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e3a8a; font-size: 14px;"><strong>Tipo:</strong></td>
                                                <td style="color: #111827; font-size: 14px;">
                                                    <span
                                                        style="background-color: #ffffff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                                                        {{ strtoupper($plan->type) }}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #1e3a8a; font-size: 14px;"><strong>Monto:</strong>
                                                </td>
                                                <td style="color: #111827; font-size: 18px; font-weight: bold;">S/
                                                    {{ number_format($paymentRequest->amount, 2) }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Comprobante de Pago -->
                            <!-- Estado del Comprobante -->
                            @if ($paymentRequest->payment_proof)
                                <div
                                    style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
                                    <h3 style="color: #065f46; margin-top: 0; font-size: 18px;">
                                        ✅ Comprobante de Pago Adjunto
                                    </h3>
                                    <p style="color: #047857; margin: 5px 0 0; font-size: 14px;">
                                        El comprobante de pago ha sido adjuntado a este correo electrónico.
                                        Revisa los archivos adjuntos para visualizarlo.
                                    </p>
                                </div>
                            @else
                                <div
                                    style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px;">
                                    <h3 style="color: #991b1b; margin-top: 0; font-size: 18px;">
                                        ℹ️ Sin Comprobante
                                    </h3>
                                    <p style="color: #dc2626; margin: 5px 0 0; font-size: 14px;">
                                        El cliente no ha enviado comprobante de pago con esta solicitud.
                                    </p>
                                </div>
                            @endif


                            <!-- Mensaje del Cliente -->
                            @if ($paymentRequest->message)
                                <table width="100%" cellpadding="0" cellspacing="0"
                                    style="background-color: #f3f4f6; border-radius: 8px; margin: 30px 0; padding: 20px;">
                                    <tr>
                                        <td>
                                            <h3 style="color: #374151; margin: 0 0 15px; font-size: 18px;">💬 Mensaje
                                                del Cliente</h3>
                                            <p
                                                style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
                                                "{{ $paymentRequest->message }}"
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            @endif

                            <!-- Estado Actual -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; margin: 30px 0; padding: 20px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #991b1b; margin: 0 0 10px; font-size: 18px;">⏱️ Estado de la
                                            Cuenta</h3>
                                        <p style="color: #7f1d1d; font-size: 14px; margin: 0;">
                                            <strong>Cuenta de Prueba:</strong> Activada (10 días)<br>
                                            <strong>Estado del Pago:</strong> Pendiente de Verificación<br>
                                            <strong>Fecha de Solicitud:</strong>
                                            {{ $paymentRequest->created_at->format('d/m/Y H:i') }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Acciones Requeridas -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #ede9fe; border-left: 4px solid #8b5cf6; border-radius: 8px; margin: 30px 0; padding: 20px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #5b21b6; margin: 0 0 15px; font-size: 18px;">✅ Acciones
                                            Requeridas</h3>
                                        <ol
                                            style="color: #6d28d9; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                                            <li>Verificar el comprobante de pago (si fue proporcionado)</li>
                                            <li>Confirmar la transacción en tu banco/Yape</li>
                                            <li>Acceder al panel de administración para aprobar el pago</li>
                                            <li>Notificar al cliente una vez confirmado</li>
                                        </ol>
                                    </td>
                                </tr>
                            </table>

                            <!-- Botones de Acción -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ url('/admin/payment-requests') }}"
                                            style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px;">
                                            Ir al Panel de Admin
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 15px;">
                                        <a href="https://wa.me/{{ str_replace([' ', '-', '+'], '', $paymentRequest->phone) }}"
                                            style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 14px;">
                                            Contactar por WhatsApp
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Recordatorio -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #fef9c3; border-radius: 8px; margin: 30px 0; padding: 15px;">
                                <tr>
                                    <td>
                                        <p style="color: #854d0e; font-size: 13px; margin: 0; text-align: center;">
                                            ⚠️ <strong>Recordatorio:</strong> Procesa esta solicitud en las próximas
                                            24-48 horas para mantener una buena experiencia del cliente.
                                        </p>
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
                                © 2025 Tu Plataforma - Panel de Administración
                            </p>
                            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                                Solicitud ID: #{{ $paymentRequest->id }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
