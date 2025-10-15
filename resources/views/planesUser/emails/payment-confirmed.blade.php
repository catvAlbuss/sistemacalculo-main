<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago Confirmado</title>
</head>

<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                    <!-- Header con Confetti -->
                    <tr>
                        <td
                            style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 30px; text-align: center; position: relative;">
                            <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
                            <h1 style="color: #ffffff; margin: 0; font-size: 32px;">¡Pago Confirmado!</h1>
                            <p style="color: #d1fae5; margin: 15px 0 0; font-size: 18px;">Tu suscripción está activa</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #374151; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                                ¡Hola <strong>{{ $user->name }}</strong>! 🎊
                            </p>

                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
                                ¡Excelentes noticias! Hemos confirmado tu pago y tu suscripción al plan <strong
                                    style="color: #10b981;">{{ $plan->name }}</strong> ya está activa.
                            </p>

                            <!-- Confirmación Visual -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; margin: 30px 0; padding: 30px; text-align: center;">
                                <tr>
                                    <td>
                                        <div
                                            style="width: 80px; height: 80px; background-color: #ffffff; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                            <span style="font-size: 40px;">✓</span>
                                        </div>
                                        <h2 style="color: #065f46; margin: 0 0 10px; font-size: 24px;">Pago Verificado
                                        </h2>
                                        <p style="color: #047857; margin: 0; font-size: 16px;">Tu cuenta ha sido
                                            actualizada exitosamente</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Detalles de la Suscripción -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; margin: 30px 0; padding: 25px;">
                                <tr>
                                    <td>
                                        <h3
                                            style="color: #065f46; margin: 0 0 20px; font-size: 20px; text-align: center;">
                                            📋 Detalles de tu Suscripción</h3>
                                        <table width="100%" cellpadding="12" cellspacing="0">
                                            <tr style="border-bottom: 1px solid #d1fae5;">
                                                <td style="color: #047857; font-size: 14px; font-weight: bold;">Plan:
                                                </td>
                                                <td style="color: #111827; font-size: 14px; text-align: right;">
                                                    {{ $plan->name }}</td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #d1fae5;">
                                                <td style="color: #047857; font-size: 14px; font-weight: bold;">Inicio:
                                                </td>
                                                <td style="color: #111827; font-size: 14px; text-align: right;">
                                                    {{ $subscription->starts_at->format('d/m/Y') }}</td>
                                            </tr>
                                            <tr style="border-bottom: 1px solid #d1fae5;">
                                                <td style="color: #047857; font-size: 14px; font-weight: bold;">
                                                    @if ($subscription->ends_at)
                                                        Válido hasta:
                                                    @else
                                                        Duración:
                                                    @endif
                                                </td>
                                                <td style="color: #111827; font-size: 14px; text-align: right;">
                                                    @if ($subscription->ends_at)
                                                        {{ $subscription->ends_at->format('d/m/Y') }}
                                                    @else
                                                        <span style="color: #10b981; font-weight: bold;">∞ De por
                                                            vida</span>
                                                    @endif
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #047857; font-size: 14px; font-weight: bold;">Monto
                                                    Pagado:</td>
                                                <td
                                                    style="color: #10b981; font-size: 18px; text-align: right; font-weight: bold;">
                                                    S/ {{ number_format($subscription->amount_paid, 2) }}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Beneficios Desbloqueados -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #dbeafe; border-radius: 8px; margin: 30px 0; padding: 25px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #1e40af; margin: 0 0 20px; font-size: 18px;">🎁 Beneficios
                                            Desbloqueados</h3>
                                        @if ($plan->features)
                                            <table width="100%" cellpadding="6" cellspacing="0">
                                                @foreach ($plan->features as $feature)
                                                    <tr>
                                                        <td style="vertical-align: top; width: 20px;">
                                                            <span style="color: #10b981; font-size: 16px;">✓</span>
                                                        </td>
                                                        <td style="color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                                                            {{ $feature }}</td>
                                                    </tr>
                                                @endforeach
                                            </table>
                                        @endif
                                    </td>
                                </tr>
                            </table>

                            <!-- Llamada a la Acción -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                                <tr>
                                    <td align="center">
                                        <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">
                                            ¡Tu acceso completo está listo! Comienza a explorar ahora:
                                        </p>
                                        <a href="{{ url('/dashboard') }}"
                                            style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 10px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                            Ir a Mi Panel
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Tips para Comenzar -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin: 30px 0; padding: 20px;">
                                <tr>
                                    <td>
                                        <h3 style="color: #92400e; margin: 0 0 15px; font-size: 18px;">💡 Tips para
                                            Comenzar</h3>
                                        <ol
                                            style="color: #78350f; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                                            <li>Completa tu perfil en la sección de configuración</li>
                                            <li>Explora las categorías de contenido disponibles</li>
                                            <li>Guarda tus recursos favoritos para acceso rápido</li>
                                            <li>Únete a nuestra comunidad en redes sociales</li>
                                        </ol>
                                    </td>
                                </tr>
                            </table>

                            <!-- Soporte -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color: #f3f4f6; border-radius: 8px; margin: 30px 0; padding: 25px;">
                                <tr>
                                    <td align="center">
                                        <h3 style="color: #374151; margin: 0 0 15px; font-size: 18px;">¿Necesitas Ayuda?
                                        </h3>
                                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">
                                            Nuestro equipo está aquí para ayudarte
                                        </p>
                                        <table width="100%" cellpadding="10" cellspacing="0">
                                            <tr>
                                                <td align="center" style="font-size: 14px;">
                                                    📧 <a href="mailto:soporte@tudominio.com"
                                                        style="color: #2563eb; text-decoration: none; font-weight: bold;">soporte@tudominio.com</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center" style="font-size: 14px;">
                                                    📱 <a href="https://wa.me/51999999999"
                                                        style="color: #10b981; text-decoration: none; font-weight: bold;">+51
                                                        999 999 999</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Mensaje de Agradecimiento -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0;">
                                            Gracias por confiar en nosotros. Estamos emocionados de<br>
                                            acompañarte en tu camino de aprendizaje. 🚀
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
                            <div style="margin-bottom: 15px;">
                                <a href="#"
                                    style="display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none;">
                                    <img src="https://via.placeholder.com/30" alt="Facebook"
                                        style="width: 30px; height: 30px;">
                                </a>
                                <a href="#"
                                    style="display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none;">
                                    <img src="https://via.placeholder.com/30" alt="Instagram"
                                        style="width: 30px; height: 30px;">
                                </a>
                                <a href="#"
                                    style="display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none;">
                                    <img src="https://via.placeholder.com/30" alt="Twitter"
                                        style="width: 30px; height: 30px;">
                                </a>
                            </div>
                            <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px;">
                                © 2025 Tu Plataforma. Todos los derechos reservados.
                            </p>
                            <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                                ID de Suscripción: #{{ $subscription->id }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
