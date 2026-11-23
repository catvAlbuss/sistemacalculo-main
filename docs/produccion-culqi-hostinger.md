# Planes, Culqi y correo Hostinger en producción

## Cambios incluidos

Los planes en PEN usan la última cotización guardada, no futura y dentro del rango validado, para estimar únicamente la comisión fija en soles. Una caída de SBS o ApiPeru no retira los precios ya disponibles. El pago en USD continúa requiriendo cotización de los últimos siete días. Cada solicitud congela el importe y su referencia; las solicitudes anteriores no se recalculan.

El administrador puede abrir **Administración > Pagos > Solicitud** para reintentar correos fallidos, reenviar la información del registro, enviar un enlace nuevo para crear/restablecer contraseña o reenviar el ticket de un pago confirmado al cliente o a administración. Cada envío nuevo tiene un identificador para que repetir el mismo POST no duplique la tarea. Se conservan el cargo, la suscripción y el número del ticket. No se envían contraseñas en texto plano.

Se conserva SMTP y se añade `MAIL_MAILER=hostinger` con la API oficial y el cliente HTTP ya incluido en Laravel. No hace falta instalar el SDK ni cambiar Composer. Los mensajes usan las plantillas existentes, adjuntos y copias ocultas. La API documentada no expone una cabecera Reply-To: cuando un mensaje la requiere, se agrega un enlace explícito «Responder a» en el cuerpo. SMTP conserva su cabecera original.

## Configuración de Hostinger

Crear una clave de API en **Hostinger Mail > Desarrolladores > Claves de API** y autorizar el buzón que enviará los mensajes. La captura inicial no muestra claves activas. Guardar los valores reales en el `.env` del servidor, nunca en el repositorio:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.example
MAIL_MAILER=hostinger
HOSTINGER_MAIL_API_TOKEN=clave-del-servidor
HOSTINGER_MAILBOX_ID=ACidentificador-del-buzon
HOSTINGER_MAILBOX_ADDRESS=ventas@tu-dominio.example
MAIL_FROM_ADDRESS=ventas@tu-dominio.example
MAIL_FROM_NAME="Rizabal & Asociados"
MAIL_ADMIN_ADDRESS=administracion@tu-dominio.example
PAYMENTS_QUEUE_CONNECTION=payments
```

El ID no es la dirección de correo. Se obtiene del `resourceId` del buzón en `GET https://api.mail.hostinger.com/api/v1/me`, autenticado con la clave de Hostinger. El token, el ID y la dirección deben pertenecer al mismo buzón autorizado. `correo:verificar --online` comprueba esa correspondencia sin enviar mensajes ni mostrar la clave.

Si se prefiere SMTP, conservar `MAIL_MAILER=smtp`, usar el buzón real, `MAIL_HOST=smtp.hostinger.com`, `MAIL_PORT=465`, `MAIL_SCHEME=smtps`, `MAIL_USERNAME` igual a `MAIL_FROM_ADDRESS` y la contraseña del buzón en `MAIL_PASSWORD`. No es la clave API. Para STARTTLS usar puerto 587 y esquema smtp. La API no necesita MAIL_PASSWORD.

## Después de subir los archivos

No copiar `bootstrap/cache/config.php` de desarrollo. Conservar APP_KEY del servidor y la base de datos existente. No se añadieron migraciones para estos cambios.

```bash
php artisan config:clear
php artisan config:cache
php artisan view:cache
php artisan queue:restart
php artisan correo:verificar
php artisan correo:verificar --online
php artisan culqi:verificar
php artisan payments:status
```

`--online` es para el proveedor Hostinger API. Con SMTP, usar `correo:probar` para comprobar la conexión mediante un envío autorizado. Una cuenta creada en Culqi no sustituye las llaves live del comercio. Conservar el modo de revisión y sus cuentas autorizadas únicamente si se está completando la revisión con llaves test; no permite cobros reales a todos los clientes.

## Cola y cron: necesarios para que salgan los correos

El registro y la confirmación de pago guardan tareas durables en `payment_tasks`. Guardar una tarea no significa que haya salido un correo. El scheduler las coloca en `jobs`, y un worker de la conexión **payments**, cola **payments**, debe procesarlas. Un worker que solo escucha default no procesa estos mensajes.

Proceso permanente, si el hosting lo permite:

```bash
php artisan queue:work payments --queue=payments --tries=5 --timeout=45 --max-time=3600
```

En hosting compartido sin un supervisor permanente, configurar dos cron cada minuto, usando las rutas reales del servidor. Esta modalidad procesa la cola y termina; no instalar simultáneamente dos modalidades sin necesidad:

```cron
* * * * * cd /ruta/de/la/aplicacion && /opt/alt/php83/usr/bin/php artisan schedule:run >> storage/logs/scheduler.log 2>&1
* * * * * cd /ruta/de/la/aplicacion && /usr/bin/flock -n storage/framework/payments-worker.lock /opt/alt/php83/usr/bin/php artisan queue:work payments --queue=payments --stop-when-empty --max-time=50 --tries=5 --timeout=45 >> storage/logs/payments-worker.log 2>&1
```

Confirmar disponibilidad de `flock` y ajustar PHP/rutas según Hostinger. El cron debe usar el mismo proyecto, `.env` y base MySQL que la web. Los errores MySQL del registro anterior impedirían tanto guardar sesiones como ejecutar estas tareas; requieren resolver la conexión del hosting.

## Verificación y recuperación de correos recientes

Primero ejecutar `correo:verificar --online`. Para una prueba real y controlada:

```bash
php artisan correo:probar correo-autorizado@tu-dominio.example
```

La respuesta de aceptación no certifica entrega en la bandeja del destinatario. Comprobar Enviados, registros de correo de Hostinger, bandeja de entrada, spam y autenticación SPF/DKIM del dominio. No se realizaron envíos reales desde desarrollo.

Ver y recuperar fallidos recientes después de corregir el proveedor:

```bash
php artisan payments:status
php artisan payments:retry-mails --days=7 --limit=100
php artisan payments:retry-mails --days=7 --limit=100 --apply
php artisan payments:dispatch-pending
```

La primera ejecución muestra una vista previa sin enviar ni modificar tareas. `--apply` reencola solo correos fallidos, nunca cargos, webhooks o conciliaciones. Los pendientes normales se recuperan mediante `payments:dispatch-pending` y el worker. Los completados se reenvían expresamente desde la solicitud en administración: no se presume que necesiten otra copia.

Si Hostinger devuelve timeout, respuesta perdida o error 5xx, el envío queda `failed / delivery_uncertain` y se detienen los reintentos automáticos. Verificar primero Enviados/registros para evitar otra copia. El comando omite esos casos por defecto; solo tras revisarlos puede usarse `--include-uncertain`. También existe el botón de recuperación individual en la solicitud. Un rechazo 4xx se registra como `provider_rejected`; 429 admite el reintento diferido. Los errores no guardan claves ni respuestas completas del proveedor.

Las tareas registradas como completadas con MAIL_MAILER=log antes de esta corrección no demuestran entrega: revisar cada solicitud y usar los botones de reenvío. Ahora producción detecta log/array y una configuración incompleta antes de marcar el correo como enviado.

Si nunca se guardó ninguna cotización verificable, ejecutar `tipo-cambio:actualizar` y comprobar su resultado. No se inventa una tasa. El comando también permite registrar una cotización real contrastada con `--fecha=AAAA-MM-DD --venta=VALOR --fuente=FUENTE`.

Referencia técnica: [API oficial Hostinger Mail](https://github.com/hostinger/mail-api/blob/main/openapi.json), [SDK PHP oficial](https://github.com/hostinger/mail-api-php-sdk).

## Comandos SSH para ryaie.com

La ruta corresponde al servidor identificado en el registro de producción. Ejecutar desde la sesión SSH de la cuenta u112634954 después de subir los archivos del proyecto.

Antes de pegar el `.env` preparado, respaldar el del servidor fuera del directorio web y conservar su APP_KEY:

```bash
cd /home/u112634954/domains/ryaie.com/public_html
PHP_BIN=/opt/alt/php83/usr/bin/php
"$PHP_BIN" -v
umask 077
mkdir -p /home/u112634954/.ryaie-backups
chmod 700 /home/u112634954/.ryaie-backups
cp -p .env "/home/u112634954/.ryaie-backups/env-$(date +%Y%m%d-%H%M%S)"
nano .env
```

En nano: mantener la APP_KEY existente y completar DB_HOST, DB_DATABASE, DB_USERNAME y DB_PASSWORD con los datos de hPanel. El `.env` de este equipo conserva DB_USERNAME=root y DB_DATABASE=sistemacalculo; esos valores no son las credenciales del hosting. El registro anterior menciona la base u112634954_sistemara: confirmar en hPanel que sigue siendo la utilizada. Hostinger Mail ya tiene el token, buzón y remitente validados. Para cobros reales se necesitan las llaves pk_live/sk_live; las test conservadas no habilitan cobros en producción. Guardar con Ctrl+O, Enter y salir con Ctrl+X.

Con el entorno completo:

```bash
"$PHP_BIN" artisan config:clear
"$PHP_BIN" artisan migrate:status
"$PHP_BIN" artisan correo:verificar --online
"$PHP_BIN" artisan culqi:verificar --online
"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan view:cache
"$PHP_BIN" artisan queue:restart
"$PHP_BIN" artisan payments:status
```

Revisar la salida de cada comando antes de seguir: cualquier error de MySQL, llaves o buzón debe corregirse. Estos cambios de correo no añaden migraciones; si migrate:status muestra pendientes de otra entrega, revisarlas antes de ejecutar migrate --force. Los verificadores online solo consultan los proveedores; no crean cargos ni envían correo. No ejecutar key:generate, migrate:fresh ni db:wipe sobre la base existente. No hace falta instalar el SDK Hostinger para esta integración ni reconstruir JavaScript por los cambios de correo.

Mantener una única entrada del scheduler cada minuto. Añadir el worker payments si no hay un proceso permanente que ya escuche esa cola. Comprobar primero `command -v flock`; estas son las entradas para el modo cron del hosting compartido:

```cron
* * * * * cd /home/u112634954/domains/ryaie.com/public_html && /opt/alt/php83/usr/bin/php artisan schedule:run >> storage/logs/scheduler.log 2>&1
* * * * * cd /home/u112634954/domains/ryaie.com/public_html && /usr/bin/flock -n storage/framework/payments-worker.lock /opt/alt/php83/usr/bin/php artisan queue:work payments --queue=payments --stop-when-empty --max-time=50 --tries=5 --timeout=45 >> storage/logs/payments-worker.log 2>&1
```

Después de verificar el proveedor y la cola, se puede ejecutar `"$PHP_BIN" artisan correo:probar TU_CORREO` para una prueba real autorizada. Para recuperar fallidos, usar primero la vista previa `"$PHP_BIN" artisan payments:retry-mails --days=7`; revisar el listado y luego ejecutar el mismo comando con `--apply`. La recuperación omite los envíos inciertos por defecto.
