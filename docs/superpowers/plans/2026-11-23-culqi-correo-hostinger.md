# Culqi, disponibilidad de planes y correo Hostinger

Objetivo: permitir elegir planes con precio consistente y recuperar correos de registro, acceso y tickets sin recrear pagos.

Diagnóstico: ProcessingPrice usa ExchangeRate::current también para estimar el cargo fijo en PEN. Tras siete días el catálogo pierde el precio. PaymentTasks conserva solicitudes y reintentos, pero la administración no permite recuperar ni reenviar mensajes. El proveedor local es Gmail SMTP; no existe transporte Hostinger API. Un transporte log puede finalizar tareas sin enviar correo real.

Diseño: integrar la API oficial Hostinger como transporte Laravel seleccionable, usando HTTP existente, remitente de buzón verificado, adjuntos y errores sin secretos. Conservar SMTP. Verificar configuración y distinguir aceptación del proveedor de entrega en bandeja. Mantener enlaces de contraseña y renovar su token en reenvíos. Recuperar solo correos, con autorización root/gerencia, bloqueo de concurrencia, identificador de reenvío y registro de eventos. Ofrecer comando con vista previa para los fallidos recientes; no ejecutar envíos reales desde desarrollo. No duplicar cargos ni tickets.

Precio: separar la conversión del pago USD (vigente) de la referencia usada para estimar procesamiento en PEN (última publicada no futura), si se confirma esa opción; conservar cargo fijo PEN explícito y congelar cada compra.

1. Añadir pruebas de transporte, errores, configuración y recuperación; comprobar fallo previo.
2. Implementar transporte Hostinger, verificador y diagnóstico de fallos de tareas.
3. Añadir recuperación de tareas fallidas, reenvío de ticket y enlace de contraseña desde cada solicitud; comando de recuperación reciente con vista previa.
4. Añadir regresiones de precios para períodos con cotización anterior y conservar bloqueo USD/no cotización.
5. Ejecutar pruebas relacionadas, sintaxis y compilación de vistas. Documentar configuración, worker/cron y pasos de despliegue. Credenciales y validación real del hosting quedan a cargo del entorno de producción.

Verificación: transporte, recuperación y precios tienen regresiones; las vistas compilan y pasan los casos JavaScript de registro/checkout. Se aislaron también EmailVerificationTest y PasswordResetTest con RefreshPaymentsDatabase para impedir que dependan de MySQL al ejecutarlas individualmente. La comprobación local conservó la cuenta y planes anteriores; no se ejecutaron envíos reales.

Referencia: https://github.com/hostinger/mail-api/blob/main/openapi.json y https://github.com/hostinger/mail-api-php-sdk. Se usa el cliente HTTP existente para evitar agregar dependencias del SDK.
