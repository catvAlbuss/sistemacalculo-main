# Configuración local y activación de Culqi

Estado vigente al 22/10/2026: esta integración incluye PEN/USD con tipo de cambio congelado, cambios inmediatos con saldo proporcional y respaldos/restauración por propietario. La sección «Ampliación confirmada» al final sustituye las limitaciones históricas que aparecen en las revisiones anteriores. La renovación continúa siendo manual y la emisión electrónica SUNAT sigue pendiente.

La navegación pública agrupa los accesos personales en «Mi cuenta» y la gestión de pagos/reclamaciones en «Administración», visible para root y gerencia. El Libro de Reclamaciones público permanece en el pie. El enlace Blog se retiró mientras carezca de destino. La prueba gratis se ofrece a visitantes; las cuentas acceden a sus herramientas desde Mi cuenta. El cierre de sesión usa POST con CSRF e invalida la sesión mediante la acción existente. En tabletas y móviles se usa el menú plegable; los submenús admiten Escape, clic exterior y flecha abajo.

La portada muestra el formulario de acceso exclusivamente a visitantes. Si la sesión ya existe muestra «Sesión iniciada», identidad y cierre de sesión, para evitar que el formulario sugiera que la cuenta está desconectada. El HTML con navegación dependiente de sesión lleva `Cache-Control: private, no-store, max-age=0, must-revalidate` y `Vary: Cookie`; una restauración del historial del navegador vuelve a consultar el servidor. Las pruebas HTTP cubren la portada como visitante, con sesión y después de salir, además de la prevención de caché en páginas públicas.

La cobertura permanente activa, aunque haya sido otorgada sin pago, oculta las renovaciones y bloquea nuevas compras pagadas en el formulario, registro y procesamiento Culqi. Las coberturas canceladas no bloquean. Las páginas con layout landing omiten pdfMake y sus fuentes; las herramientas conservan el runtime PDF y su inicialización antes de Livewire. La revisión incluye 105 pruebas relacionadas de servidor y 21 de frontend aprobadas, además de una comprobación real en navegador del menú y de la generación PDF.

Rizabal cobra los planes de pago exclusivamente con tarjeta o Yape en línea mediante Culqi y activa la suscripción al confirmar el cargo. No recibe comprobantes ni permite Yape manual para solicitudes nuevas. Los planes gratuitos y las consultas de precio personalizado conservan su registro sin cobro. Culqi queda deshabilitado hasta configurar las llaves propias del comercio.

## Estructura y pagos de Gespro

| Área | Gespro | Rizabal |
| --- | --- | --- |
| Aplicación | Laravel, Vue e Inertia | Laravel 11, Blade, Alpine y módulos Vue |
| Catálogo | `resources/js/pages/planes/index.vue` | `resources/views/landing/planes.blade.php` |
| Registro | `resources/js/pages/planes/registro.vue` | `resources/views/landing/planes-registro.blade.php` |
| Solicitud y plan | `PagoSuscripcion`, `Suscripcion`, empresa | `PaymentRequest`, `Subscription`, `UserSubscription`, usuario |
| Pasarela | `app/Services/Culqi.php` | `app/Services/Culqi.php` adaptado al modelo local |
| Pantalla de pago | `resources/js/pages/planes/pagar.vue` | `resources/views/landing/culqi.blade.php` y `resources/js/culqi-checkout.js` |
| Diagnóstico | `culqi:verificar` | `culqi:verificar`, con consulta remota opcional |

Gespro ofrece Culqi con tarjeta/Yape y Yape manual con captura. Sus registros administrativos también contemplan transferencia y efectivo. Sus cobros Culqi permiten PEN y USD; Yape se muestra solo en soles. Rizabal actualmente tiene precios en soles, por lo que esta integración cobra PEN. El pago cubre el período del plan; no se han configurado cargos recurrentes ni renovaciones automáticas.

La referencia de Gespro usa Checkout v4. [Culqi anuncia su próximo retiro](https://docs.culqi.com/es/documentacion/checkout/v4), por lo que Rizabal utiliza [Checkout Custom](https://docs.culqi.com/es/documentacion/checkout/checkout-custom) y [Culqi 3DS](https://docs.culqi.com/es/documentacion/culqi-3ds/v1/configuracion).

En el código revisado de Gespro, un intento sin respuesta se bloquea por 30 minutos y luego permite otro cobro; también existe una alternativa que confirma con la respuesta inicial cuando falla la consulta del cargo. En Rizabal, el bloqueo persiste hasta resolver el cargo y la activación requiere consultar su ID. El webhook se guarda antes de responder HTTP 200; la consulta posterior se procesa en una cola con reintentos. Si no puede persistirse, la petición falla para que el proveedor pueda reenviarla. Gespro permanece sin modificaciones.

## Configuración de pruebas

La migración `2026_10_14_000001_add_culqi_to_payment_requests.php` agrega el método, ID de cargo, estado y contexto de pasarela sin alterar las rutas existentes. Ya está aplicada en esta instalación local. Para otra instalación:

```powershell
php artisan migrate --path=database/migrations/2026_10_14_000001_add_culqi_to_payment_requests.php
```

En `.env`, conserva el token webhook generado y completa las dos llaves desde el CulqiPanel del negocio de Rizabal:

```dotenv
CULQI_ENABLED=false
CULQI_PUBLIC_KEY=pk_test_LLAVE_PROPIA
CULQI_SECRET_KEY=sk_test_LLAVE_PROPIA
CULQI_WEBHOOK_TOKEN=TOKEN_LOCAL_GENERADO
```

Estos valores son marcadores de formato; no son credenciales utilizables. La llave privada se usa exclusivamente en Laravel. No copies las llaves de Gespro y no uses el prefijo `VITE_` para la llave privada o el token webhook. En `APP_ENV=local` y `testing`, el sistema rechaza llaves `live`.

Comprueba la configuración sin realizar llamadas externas ni mostrar secretos:

```powershell
php artisan config:clear
php artisan culqi:verificar
```

Con las llaves de prueba disponibles, valida que Culqi acepte la llave privada mediante una consulta de lectura:

```powershell
php artisan culqi:verificar --online
```

Después establece `CULQI_ENABLED=true` y vuelve a ejecutar `php artisan config:clear`. Al entrar a `/planes`, elige un plan para abrir `/planes/registro?plan=ID`. Los planes pagados de al menos S/ 3 continúan directamente a Culqi; la tarjeta o Yape se elige dentro de Checkout. Mientras Culqi esté deshabilitado, o el importe no permita un cargo, se muestra el pago no disponible y se bloquea la solicitud de pago. No existe alternativa manual.

`/contacto` muestra los canales de consulta. El menú y los enlaces de contratación llevan a `/planes`. El endpoint anterior `POST /contacto` sigue procesando solicitudes para conservar compatibilidad; el formulario nuevo utiliza `POST /planes/registro`.

## Flujo de pago

1. El usuario selecciona un plan en `/planes` y registra sus datos en `/planes/registro`. Culqi es el único método de cobro; no necesita adjuntar comprobante.
2. Laravel guarda la solicitud con el precio del plan y abre `/planes/pagar/ID` mediante un enlace firmado válido por 24 horas. El correo de registro también incluye un enlace firmado. Los enlaces anteriores `/pagos/culqi/ID` siguen admitiéndose mientras su firma sea válida.
3. Checkout Custom crea un token de tarjeta o Yape. Los tokens Yape usan el prefijo `ype_`, según la [documentación de cargos](https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/cargos/).
4. Laravel cobra el monto guardado en céntimos, en PEN. Ignora montos y monedas enviados por el navegador.
5. Si Culqi pide 3DS, el navegador autentica la tarjeta y envía los parámetros con el mismo token y dispositivo. Laravel valida que pertenezcan al intento pendiente.
6. Laravel consulta el cargo con la llave privada y comprueba ID, monto, moneda, metadata, captura, resultado y ausencia de devolución. Solo entonces crea la suscripción activa.

La confirmación repetida del mismo cargo no crea otra suscripción. Un fallo de correo no revierte un pago aprobado. Si se pierde la respuesta del cobro, la pantalla permite revisar el estado y bloquea otro cargo; recargar no elimina el bloqueo.

## Webhook local y de producción

Configura en CulqiPanel el evento `charge.creation.succeeded` para esta URL:

```text
https://DOMINIO_PUBLICO/webhooks/culqi/VALOR_DE_CULQI_WEBHOOK_TOKEN
```

El token forma parte de la URL: trátala como credencial y limita el acceso a los registros del servidor que la contengan. Laravel valida el token con comparación constante y vuelve a consultar el cargo; los datos del evento por sí solos no aprueban pagos. Únicamente `webhooks/culqi/*` está exceptuado del CSRF; el cobro del navegador conserva CSRF, firma y límite de intentos.

El servidor de Culqi no puede alcanzar `localhost` ni un dominio `.test` de Laragon. Para probar el webhook necesitas una dirección HTTPS pública que llegue a esta instalación o un entorno de pruebas publicado. Configura `APP_URL` con esa dirección antes de generar enlaces, recarga la configuración y realiza un nuevo registro. Usa la misma dirección en el navegador para preservar sesión y firma.

## Verificación antes de activar el negocio

```powershell
php artisan test --filter="AuthenticationTest|ContactPaymentTest|CulqiTest|BillingTest|DocumentLookupTest|PaymentSafetyTest|PaymentPlansTest|PaymentV2Test"
node --test tests/frontend/culqi-checkout.test.mjs tests/frontend/planes-registro.test.mjs tests/frontend/document-lookup.test.mjs
npm.cmd run build
```

Las pruebas de pagos usan SQLite en memoria con sus migraciones; no borran la base local ni dependen de migraciones de otros módulos. Verifican registro sin comprobante, rechazo de pagos manuales y archivos adjuntos, precios gratuitos, tokens Yape, 3DS, datos del cargo, fallos de red/correo y confirmaciones duplicadas.

Con llaves de integración propias, completa estas pruebas en navegador:

- Guardar un registro y cobrar con los datos de la [guía oficial de pruebas de Culqi](https://docs.culqi.com/es/documentacion/pagos-online/tarjetas-de-prueba). Para los casos 3DS, registra la solicitud con el correo de prueba indicado en esa guía.
- Confirmar un pago con tarjeta, un rechazo y una autenticación 3DS.
- Probar Yape según los casos habilitados para tu comercio por Culqi.
- Confirmar que el webhook público activa un pago cuya respuesta al navegador se perdió.
- Reenviar el mismo evento y comprobar que existe una sola suscripción pagada.
- Verificar que el registro no muestra ni acepta comprobantes y que los planes gratuitos continúan funcionando sin pago.

Las pruebas automatizadas simulan Culqi. La aceptación del comercio, Checkout, 3DS y webhook con credenciales reales de integración debe validarse antes de cambiar a producción.

## Datos de facturación y ticket de 80 mm

El registro tiene un único bloque `Tus datos`: tipo de comprobante, documento, nombre o razón social, correo, teléfono y dirección. El mismo nombre y correo se usan para la cuenta y el comprobante; no hay campos duplicados ni mensaje adicional. La regla comercial de este formulario es boleta con DNI de 8 dígitos y factura con RUC de 11 dígitos. El documento es de solo lectura y depende del comprobante. Al cambiar de tipo se limpian documento, nombre y dirección, conservando correo y teléfono; cambian etiquetas, ayudas, longitud y autocompletado. Para factura, el domicilio fiscal es obligatorio. Laravel valida estas mismas combinaciones aunque se modifique la petición. La relación entre factura, razón social y RUC se basa en los [datos del comprobante descritos por SUNAT](https://orientacion.sunat.gob.pe/02-factura); la regla boleta/DNI corresponde a este negocio.

El botón `Buscar` usa ApiPeru, el mismo proveedor de consulta empleado en Gespro. Completa el nombre de un DNI o la razón social y dirección disponible de un RUC. Correo y teléfono siempre los ingresa el usuario. Configura una llave propia `API_PERU_TOKEN` en `.env` y ejecuta `php artisan config:clear` para habilitarlo. El token solo se utiliza en Laravel, mediante los endpoints POST de la [documentación oficial de ApiPeru](https://docs.apiperu.dev/); no se envía al navegador. La ruta local `POST /planes/consultar-documento` conserva CSRF y admite hasta 10 consultas por 10 minutos. Las consultas exitosas se reutilizan durante 6 horas para reducir llamadas al proveedor. No se muestran ni se obtienen correos, teléfonos o credenciales de otras cuentas. La consulta de identidad no equivale a emisión electrónica de un comprobante.

Si no hay token, el proveedor no responde o no encuentra el documento, el formulario permite completar el nombre y la dirección manualmente. Las pruebas automatizadas simulan el proveedor; para comprobar la consulta real debes completar la llave y probar el botón con tu cuenta de ApiPeru.

Completa en `.env` los datos reales del emisor antes de comenzar a generar tickets de venta:

```dotenv
BILLING_ISSUER_NAME="RAZON SOCIAL REAL"
BILLING_ISSUER_RUC=RUC_REAL_DE_11_DIGITOS
BILLING_ISSUER_ADDRESS="DOMICILIO FISCAL REAL"
BILLING_ISSUER_UBIGEO=UBIGEO_REAL
BILLING_ISSUER_EMAIL=correo_del_emisor
BILLING_IGV_RATE=18
```

Estos valores son marcadores. La configuración está en `config/billing.php`. Ejecuta `php artisan config:clear` en local después de cambiarlos. Cuando Culqi confirma un pago, se crea un único registro en `billing_receipts` dentro de la misma transacción. Guarda una copia del receptor, emisor, servicio, moneda, importe, cargo y fecha: los cambios posteriores del plan o configuración no alteran el ticket ya creado.

El enlace aparece después del pago y se incluye en el correo de confirmación enviado al correo único del registro. Los enlaces firmados duran 7 días; el propietario autenticado puede seguir accediendo a la misma dirección del documento. Un usuario ajeno sin firma válida recibe HTTP 403.

La impresión usa 80 mm de ancho y calcula la altura según el contenido. Selecciona papel térmico de 80 mm en el controlador de la impresora, escala 100 % y desactiva los encabezados y pies del navegador. La opción de guardar como PDF usa el mismo diseño. El archivo `storage/app/billing-ticket-preview.html` contiene una vista de ejemplo con datos ficticios, sin crear pagos en la base de datos.

El registro separa dos apartados: `Tus datos` contiene el contacto y los datos de facturación; el apartado del plan contiene duración, subtotal, IGV, total y el pago con Culqi. Los precios actuales incluyen el 18 % configurado por el negocio. Un total de S/ 49.90 se desglosa en subtotal S/ 42.29 e IGV S/ 7.61; no se agrega un recargo. El servidor calcula el desglose en céntimos, lo guarda con la solicitud y lo copia al ticket al confirmar el pago. La tasa configurable es `BILLING_IGV_RATE`; cambiarla no modifica el desglose de solicitudes y tickets ya registrados.

El documento tiene una referencia `INT-...` y se identifica como ticket interno sin validez tributaria, pendiente de emisión electrónica. No genera XML, firma digital, código fiscal, QR tributario, CDR ni transmisión SUNAT. Para conectar la futura API deberán definirse la afectación fiscal, las series fiscales, la numeración, los datos adicionales que exija el proveedor y los estados de emisión. `electronic_status=not_sent` y `external_id` dejan identificado el documento pendiente de esa integración.

Aplica la migración de facturación en otra instalación:

```powershell
php artisan migrate --path=database/migrations/2026_10_14_000002_add_billing_receipts.php
php artisan migrate --path=database/migrations/2026_10_14_000003_add_tax_breakdown_to_payments.php
```

## Activación en producción

Cuando Culqi habilite el negocio y las pruebas anteriores estén completas:

1. Publica el código y los recursos compilados, y aplica las migraciones de pagos, facturación, colas y cupos indicadas en esta guía.
2. Configura `APP_ENV=production`, `APP_DEBUG=false` y `APP_URL` con el dominio HTTPS definitivo.
3. Coloca las llaves propias `pk_live_...` y `sk_live_...`, genera un token webhook diferente del local y configura la URL pública en CulqiPanel.
4. Mantén `CULQI_ENABLED=false` mientras ejecutas `php artisan config:cache` y `php artisan culqi:verificar --online`.
5. Habilita `CULQI_ENABLED=true`, vuelve a ejecutar `php artisan config:cache` y valida un pago controlado y su webhook.

Si un pago queda en `processing` o `uncertain`, busca el cargo en CulqiPanel por la metadata `payment_request_id`. Si existe, solicita reenviar el evento de creación exitosa para que Laravel vuelva a verificarlo. Si no existe, confirma su ausencia con Culqi antes de cualquier intervención sobre el estado. No desbloquees por tiempo transcurrido ni apruebes un pago Culqi manualmente. Los cargos adicionales o sobre solicitudes cerradas requieren revisión y eventual devolución desde CulqiPanel.

## Compra mensual o anual y cupos

El formulario muestra descripción, características, usuarios, proyectos, duración, descuento, subtotal, IGV y total del producto seleccionado. Los planes mensuales permiten elegir mensual o anual. El anual cobra de una vez `12 × precio mensual − 5 %`, con redondeo en céntimos e IGV incluido. Para S/ 49.90: precio de lista S/ 598.80, descuento S/ 29.94, subtotal S/ 482.08, IGV S/ 86.78 y total anual S/ 568.86. No es una cuota mensual de S/ 568.86. La cobertura anual termina en la misma fecha del año siguiente, ajustando el último día cuando corresponde.

`PlanPricing` calcula todo en el servidor; importes y descuentos enviados por el navegador no determinan el cobro. `config/payments.php` vincula explícitamente `plan-anual` con `plan-mensual` para que ambos apliquen esta regla. Otros productos anuales independientes conservan su precio hasta configurar su referencia mensual. El nombre, características, cupos, período, precio y descuento quedan guardados en `payment_requests.plan_snapshot`; pantalla de pago, correos y ticket usan los datos contratados aunque después se edite el catálogo.

Los valores iniciales son editables desde Gestión de Planes:

| Plan | Usuarios | Proyectos |
| --- | ---: | ---: |
| Prueba gratuita | 1 | 2 |
| Mensual / anual | 1 | 10 |
| De por vida | 1 | 30 |

Estos campos describen el cupo comercial contratado. Todavía no existe una entidad única de proyecto ni un equipo con miembros: actualmente se guardan modelos CAD y memorias por separado. Esta modificación no implementa un contador común ni bloquea su creación al alcanzar esos cupos. Ese control necesita definir qué conjunto de documentos constituye un proyecto; no debe contarse cada memoria como otro proyecto sin establecer esa regla.

```powershell
php artisan migrate --path=database/migrations/2026_10_16_000005_add_plan_capacity.php
```

## Protección de compras y colas

Cada formulario envía un UUID de compra. Laravel guarda una clave única y una huella de los datos: reenviar el mismo formulario devuelve la misma solicitud; cambiar identidad o período con esa clave se rechaza. Usar el correo de una cuenta existente exige iniciar sesión con su propietario. Un usuario autenticado distinto no puede pagar otra solicitud incluso si dispone de un enlace firmado.

El cobro se reclama con una actualización condicional en la base de datos además del bloqueo de caché. Las confirmaciones verifican monto, moneda, modo test/live, referencia aleatoria de la solicitud y origen del token cuando está registrado. Los nuevos cobros con tarjeta requieren dispositivo. Los bloqueos de pago y usuario, el cargo único y el ticket único impiden duplicar activaciones; los límites de intentos distinguen solicitud e IP. Las solicitudes antiguas sin `checkout_key` conservan compatibilidad: no todas disponen de la nueva referencia, por lo que deben revisarse antes de operar en producción.

Los eventos repetidos de webhook se deduplican por ID de cargo y se verifican consultando Culqi con la llave privada, según el [flujo de webhooks de Culqi](https://docs.culqi.com/es/documentacion/pagos-online/webhooks/). Los trabajos solo llevan el ID local de tarea; el contenido adicional se cifra y se elimina al finalizar. Las notificaciones y consultas GET se reintentan; los POST que crean cargos nunca se reintentan automáticamente. Las cuentas nuevas reciben un enlace para establecer contraseña, sin enviar ni guardar una contraseña en texto plano en la cola.

La bandeja durable `payment_tasks` se crea en la misma transacción de la solicitud o confirmación. Una caída al encolar conserva el pendiente. Los correos tienen entrega al menos una vez: si SMTP acepta un envío y el proceso muere antes de registrarlo, podría repetirse el correo. Esto no repite el cobro ni la activación.

```powershell
php artisan migrate --path=database/migrations/2026_10_14_000004_harden_payment_processing.php
php artisan config:clear
php artisan queue:work payments --queue=payments --sleep=1 --tries=5 --timeout=45
```

Configura `PAYMENTS_QUEUE_CONNECTION=payments`. El worker anterior debe mantenerse activo. En otra terminal local, ejecuta `php artisan schedule:work` para recuperar pendientes cada minuto. En producción utiliza un supervisor de procesos para el worker y un cron por minuto con `php /ruta/artisan schedule:run`. El `retry_after` de esta conexión es 120 segundos y supera el timeout de 45 segundos; consulta las [recomendaciones de Laravel para workers](https://laravel.com/framework/docs/11.x/queues). En Windows el timeout del worker no dispone de las señales PCNTL de Linux; mantén también tiempos de espera de red acotados.

Las tareas admiten cinco intentos con esperas de 30, 120, 300 y 600 segundos. El recuperador vuelve a encolar pendientes cuyo despacho lleva más de diez minutos y recupera tareas bloqueadas por más de quince minutos. Usa:

```powershell
php artisan payments:status
php artisan payments:dispatch-pending
php artisan payments:retry-task ID
```

`payments:retry-task` solo recupera tareas fallidas y no crea cargos. Antes de reintentar un correo, comprueba si el servidor SMTP ya lo aceptó. Un evento con resultado `review_required` exige revisar su correspondencia con el pago; no apruebes manualmente un cargo incompatible. Un pago incierto conserva su bloqueo aunque expire un trabajo.

Todos los procesos deben compartir base de datos y `APP_KEY`; si hay varias máquinas, usa también un almacén de caché compartido. En producción configura HTTPS, `SESSION_SECURE_COOKIE=true`, `APP_DEBUG=false`, conserva `jobs` y `failed_jobs` y reinicia los workers al desplegar cambios de código/configuración. Estas protecciones se prueban con respuestas simuladas e intercaladas; no sustituyen la validación real de 3DS, antifraude, disputas y conciliación del comercio con Culqi.

## Renovación mensual automática: siguiente integración

Actualmente mensual y anual son pagos únicos con renovación manual. No se guarda una tarjeta ni se programa un cargo automático por haber seleccionado mensual.

El pago mensual también permite comprar entre 1 y 12 meses en una sola operación. Doce meses elegidos en modalidad mensual se cobran al precio mensual sin descuento; la modalidad Anual aplica el 5 %. El navegador usa cotizaciones de cada período calculadas por Laravel. El servidor vuelve a calcular el importe y rechaza cantidades fuera del rango o combinaciones ambiguas de anual con varios meses.

La [API de suscripciones de Culqi](https://docs.culqi.com/es/documentacion/pagos-online/recurrencia/suscripciones/suscripciones/) asocia un cliente, una tarjeta y un plan, exige aceptación de términos y comunica cambios de forma asíncrona. Para incorporarla se necesita una elección expresa del cliente, registrar fecha y versión de la autorización, enlazar de forma privada los IDs de cliente/tarjeta/suscripción, y ofrecer cancelación y actualización de tarjeta. El primer cargo debe pertenecer a ese flujo para evitar cobrarlo de nuevo como cargo único.

Cada cargo de renovación necesitará su propia solicitud/recibo con período e importe, una identidad única por suscripción y período, confirmación remota, cola de eventos, manejo de rechazos/cancelaciones y conciliación. Yape sigue como pago único; no debe reutilizarse un token Yape para programar débitos mensuales. Este flujo todavía no está habilitado ni se anuncia como disponible al comprador.

## Adaptación de Gespro v2 revisada el 21/10/2026

La referencia local revisada es `C:/laragon/www/gespro_company`. Se compararon `RenovacionController`, `ActivacionSuscripcion`, `RenovacionesSuscripciones`, `ServiciosAdicionales`, `Culqi`, la auditoría de pagos y los formularios actuales. La adaptación mantiene el modelo de cuenta individual de Rizabal, Checkout Custom, importes en PEN y el descuento anual del 5 %.

| Mejora de la referencia | Adaptación en Rizabal |
| --- | --- |
| Renovaciones anticipadas | El siguiente período comienza al final de la cobertura pagada vigente o programada; si ya venció, comienza al confirmarse el cobro. Los períodos gratuitos se reemplazan al iniciar el acceso pagado. |
| Varios meses en una compra | Selector de 1 a 12 meses, cotización del servidor e IGV incluido; el total y duración se congelan. |
| Historial y renovación | `/mi-plan`, autenticado, muestra únicamente los pagos y períodos del propietario. Un usuario vencido mantiene sesión para renovar. Los datos de su último registro se reutilizan en el formulario. |
| Auditoría de pasarela | `payment_events` registra solicitud, aceptación de la compra, intento, 3DS, rechazo, incertidumbre y confirmación. Deduplica incidencias por pago, tipo e identidad del cargo. |
| Incidencias y exportación | `/administracion/pagos`, solo root/gerencia, filtra por estado, cliente/correo/cargo y alertas pendientes. Exporta CSV con neutralización de fórmulas y permite registrar revisiones. |
| Avisos de vencimiento | Se encolan a 10, 5, 2 y 1 días; una identidad por suscripción, fecha final y día de aviso evita duplicarlos. Se descartan avisos obsoletos y períodos con renovación ya pagada. |
| Cuenta suspendida | Comprar o confirmar un cargo no habilita una cuenta desactivada administrativamente. Un cargo confirmado por Culqi durante una suspensión queda para revisión y eventual devolución. |
| Recuperación de cargos | Se encolan consultas GET de cargos conocidos que sigan pendientes. Nunca se crean cargos como parte de la conciliación. |

Antes de iniciar los nuevos workers en otra instalación:

```powershell
php artisan migrate --path=database/migrations/2026_10_21_000006_add_payment_events.php
php artisan view:clear
php artisan config:clear
php artisan payments:reconcile --dry-run
php artisan subscriptions:remind --dry-run
```

El scheduler ejecuta `payments:reconcile` cada cinco minutos y `subscriptions:remind` a las 08:30 de Lima. El worker dedicado `payments` procesa estos trabajos junto con las notificaciones y webhooks. Los comandos `--dry-run` no encolan, no envían mensajes, no modifican pagos ni suspenden cuentas. Los workers de larga duración deben reiniciarse después de desplegar estos cambios.

La conciliación automática requiere `gateway_charge_id`, antigüedad mínima de un minuto y estado `processing` o `uncertain`. El ID obtenido de Culqi debe seguir correspondiendo a la solicitud de la tarea: una respuesta cruzada no activa ninguna cuenta. Si un timeout ocurrió antes de conocer el ID, se conserva el bloqueo y se requiere webhook o revisión en CulqiPanel. Las tareas de conciliación agotadas se recuperan con `payments:retry-task ID` después de revisar la causa.

El detalle administrativo muestra eventos y tareas sin revelar tokens, claves ni respuestas completas de la pasarela. Una revisión exige una nota, guarda usuario y fecha y conserva la primera anotación. Revisar un evento no aprueba pagos, no efectúa devoluciones ni desbloquea un cobro incierto. El importe confirmado del mes refleja pagos aprobados en la aplicación; no representa conciliación de liquidaciones, comisiones o devoluciones bancarias.

Al renovar, las filas de suscripción con inicio futuro se muestran como Programado. Las relaciones de plan vigente y la comprobación de acceso toman únicamente períodos que ya comenzaron y que no terminaron. La renovación puede cambiar el plan para el período siguiente; los cambios inmediatos con crédito por días no usados de Gespro no se han trasladado todavía. Las cuentas con cobertura permanente se remiten a soporte antes de otro cobro.

El formulario actual pide revisar cupos, período y total y aceptar el pago único; registra `terms_accepted_v1` cuando se envía esa aceptación. Los clientes anteriores que no mandan la versión del formulario conservan su contrato de registro. Esta aceptación no autoriza débitos automáticos ni sustituye la futura publicación de políticas legales del negocio.

La ruta real `/suscripciones` ahora abre el editor Livewire de planes que ya existía, con precio, duración, características y cupos. Esto permite modificar esos campos desde la pantalla administrativa, además de las pruebas del componente.

Las siguientes funciones de Gespro requieren una adaptación adicional: cobros en USD/tipo de cambio, prorrateo de cambios inmediatos, libro de reclamaciones, respaldos descargables por cliente, adicionales de conservación de datos y eliminación automática por impago. En particular, no se cobran servicios de respaldo o retención que aún no estén implementados. Los cupos de proyectos conservan la limitación descrita antes: falta un contador común entre CAD y memorias. Tampoco se ha habilitado renovación automática con tarjeta ni emisión SUNAT.

## Corrección de acceso y ubigeo del receptor

Se comprobó el formulario real de `http://127.0.0.1:8000/`: el componente de ingreso devuelve errores bajo `form.email` y `form.password`, pero la vista leía otras claves y no mostraba el rechazo. La vista ahora muestra ambos formatos. El arranque de Livewire importa explícitamente su módulo; el formulario incorpora un POST tradicional para funcionar sin JavaScript. Ambos caminos usan el mismo servicio de autenticación, límite de cinco intentos fallidos, regeneración de sesión y redirección al dashboard. Se conserva el puerto y, cuando se usa una subcarpeta, se ajusta también la URL de actualizaciones de Livewire. No se cambian contraseñas ni roles de cuentas existentes.

Root y gerencia con cuenta activa pueden abrir el dashboard y administrar sin comprar una suscripción comercial. Una cuenta administrativamente desactivada sigue restringida; un cliente cuyo plan terminó mantiene el acceso a Mi plan para renovar. Las pruebas de autenticación ahora usan el componente que aparece realmente en la página y una base SQLite aislada.

El receptor incorpora un buscador de distrito y código de ubigeo. Para factura, la versión 3 del formulario exige un código existente; para boleta es opcional. El servidor obtiene distrito, provincia y departamento del catálogo y descarta nombres de ubicación enviados por el navegador. La consulta RUC completa el código si ApiPeru devuelve un ubigeo reconocido. Si no lo devuelve, se elige manualmente. Las solicitudes anteriores conservan compatibilidad y los tickets existentes no se modifican.

```powershell
php artisan migrate --path=database/migrations/2026_10_21_000007_add_billing_ubigeo.php
php artisan view:clear
```

El archivo `database/data/ubigeos_inei.csv` contiene los 1 893 distritos del catálogo local de Gespro. Es una copia de esa referencia, no una nueva verificación de vigencia ante INEI/SUNAT; debe contrastarse al conectar la emisión electrónica. La ubicación seleccionada queda congelada en la solicitud y en `billing_receipts.customer_location`, y aparece en el ticket de 80 mm. Los cambios posteriores del catálogo no alteran el comprobante interno ya generado.

Verificación de esta revisión: 77 pruebas de servidor y 14 pruebas frontend aprobadas, compilación Vite correcta, migración aplicada localmente y prueba de navegador con envío Livewire y rechazo visible de credenciales ficticias. El ingreso válido se verifica con cuentas aisladas de prueba; no se utilizan contraseñas de usuarios reales.

## Páginas legales y Libro de Reclamaciones (22/10/2026)

La referencia se adaptó desde las páginas legales y `ReclamacionController` de Gespro, sin modificar ese proyecto. Rizabal incorpora `/terminos-y-condiciones`, `/politica-de-cambios-y-devoluciones`, `/politica-de-privacidad` y `/libro-de-reclamaciones`. El pie de las páginas públicas enlaza los cuatro destinos y muestra los datos configurados del proveedor. Los términos describen cuentas individuales, cobros en PEN y renovación manual; no ofrecen prorrateos, cobros recurrentes ni servicios adicionales de respaldo que no están implementados.

La política comercial confirmada por el titular toma como referencia los casos de Gespro: duplicados o importes incorrectos, cobro sin activación e incidencias atribuibles al servicio comunicadas dentro de siete días de la activación. La solicitud comercial se atiende en hasta cinco días hábiles. La devolución efectiva se gestiona en CulqiPanel por el medio original; publicar la política o responder una hoja no mueve dinero ni modifica un pago. No se promete un plazo bancario que no haya sido confirmado para esa operación.

El nuevo formulario de registro usa la versión 4 y exige aceptación también en el acceso gratuito. Conserva enlaces a los documentos, versión del servidor, fecha, identidad del proveedor y huellas SHA-256 de las tres plantillas dentro del `plan_snapshot`. No se confía en una versión legal enviada por el navegador. Los contratos anteriores y sus eventos de aceptación se conservan; las solicitudes de clientes antiguos mantienen la compatibilidad descrita en las secciones previas. Las facturas de las versiones 3 y 4 siguen exigiendo un distrito del catálogo.

### Funcionamiento del libro

- El consumidor registra un reclamo o queja sin cuenta ni pago. Se admiten documentos extranjeros y datos del representante de menores.
- La hoja tiene correlativo, fecha de Lima, datos congelados del proveedor y fecha límite. El cómputo de los quince días hábiles excluye fines de semana, feriados nacionales y Jueves/Viernes Santo. Las fechas adicionales aplicables al establecimiento se incorporan en `legal.additional_holidays`; el calendario requiere mantenimiento si cambia la normativa.
- La clave aleatoria del formulario evita duplicar la hoja y sus notificaciones al reenviar la misma solicitud. Un mismo intento con otros datos se rechaza. El servidor determina estado, fecha límite, correlativo y respuesta.
- La copia se muestra mediante URL firmada, permite imprimir o guardar PDF y se entrega sin caché ni referencias a terceros. No existe listado público ni ruta de borrado. El enlace de la copia debe tratarse como privado. Las hojas se conservan, como mínimo, dos años; esta implementación no las elimina automáticamente.
- Las tareas `complaint_copy`, `complaint_admin` y `complaint_answer` se guardan en la misma transacción que la hoja o respuesta. Usan la cola `payments`, los reintentos y la recuperación existentes. El mensaje web confirma registro y programación del correo, no una entrega SMTP que aún no ocurrió.
- Root y gerencia tienen acceso a `/administracion/reclamaciones`, con filtros, fecha límite y detalle de notificaciones. La primera respuesta se guarda con bloqueo de fila, usuario y fecha; los envíos repetidos no la reemplazan ni crean otra tarea. Registrar una respuesta y entregar su correo son estados distintos, visibles en el detalle.
- Si falla el correo, la hoja y la copia permanecen disponibles. `payments:dispatch-pending` recupera tareas pendientes; una tarea agotada se revisa y recupera con `payments:retry-task ID`. No se registran respuestas completas del proveedor de correo ni datos de documentos en los errores.

### Preparación del servidor

Completa en el entorno del servidor los datos vigentes, verificados con el titular. No uses datos del comercio de Gespro ni direcciones de correo de ejemplo:

```dotenv
BILLING_ISSUER_NAME="RAZON SOCIAL DEL TITULAR"
BILLING_ISSUER_RUC=RUC_DE_11_DIGITOS
BILLING_ISSUER_ADDRESS="DOMICILIO VIGENTE"
BILLING_ISSUER_UBIGEO=CODIGO_DE_6_DIGITOS
BILLING_ISSUER_EMAIL=CORREO_DEL_EMISOR
LEGAL_CONTACT_EMAIL=CORREO_DE_ATENCION
LEGAL_CONTACT_PHONE=TELEFONO_CON_CODIGO_DE_PAIS
```

Los valores anteriores son marcadores, no datos para publicar. El correo legal usa, en su ausencia, el correo del emisor o `MAIL_ADMIN_ADDRESS`. El teléfono inicial conserva el número de WhatsApp que ya utilizaba el sitio. La razón social, el RUC y la dirección de fuentes secundarias deben confirmarse: el enlace general de consulta SUNAT no contiene una ficha empresarial seleccionada.

Con código y assets desplegados, aplica únicamente la nueva migración y actualiza los procesos:

```powershell
php artisan migrate --path=database/migrations/2026_10_22_000008_create_complaints_table.php --force
php artisan config:clear
php artisan view:clear
php artisan queue:restart
php artisan legal:verificar
php artisan culqi:verificar
```

`legal:verificar` es de lectura: comprueba los datos comerciales, la tabla y los ajustes básicos de producción. No cobra, no envía correos y no certifica el estado de SUNAT ni el cumplimiento legal integral. En producción requiere `APP_URL` con HTTPS, cookie de sesión segura y depuración desactivada. El servidor web debe redirigir HTTP a HTTPS en todas las rutas y tener un certificado válido; una URL de configuración no demuestra ese requisito. Deben seguir activos el scheduler y el worker `payments`.

Antes de presentar el comercio: verificar los datos reales y el canal de atención; conservar un libro físico de respaldo; comprobar una hoja y una respuesta con entrega real de correo usando datos autorizados; probar tarjeta, Yape, 3DS y webhook en el entorno de integración; confirmar con Culqi que el catálogo de cuatro planes satisface la excepción para servicios. Las tarjetas de los planes ahora tienen una imagen de las herramientas. La emisión electrónica SUNAT continúa siendo una integración aparte: el ticket interno mantiene su indicación de falta de validez tributaria.

Referencias verificadas: [Libro de Reclamaciones de Indecopi](https://consumidor.gob.pe/libro-de-reclamaciones/), [preguntas del libro actualizadas en noviembre de 2025](https://consumidor.gob.pe/wp-content/uploads/2020/07/Preguntas_Respuestas_LR_12.11.2025.pdf), [feriados nacionales](https://www.gob.pe/feriados), [operaciones de devolución de Culqi](https://docs.culqi.com/es/documentacion/pagos-online/operaciones/devoluciones) y [derechos ARCO](https://www.gob.pe/9270).

La primera entrega legal pasó 89 pruebas de servidor y 14 de frontend. La validación conjunta de la ampliación se detalla al final. Los datos de RUC, razón social, dirección y correo de atención ya fueron confirmados por el titular.

## Ampliación confirmada: USD, cambios de plan y respaldos

El titular solicitó las tres funciones. Esta sección describe el comportamiento actual y reemplaza las limitaciones históricas de USD, prorrateo y copias. La versión legal vigente es `2026-10-22-v2`; las aceptaciones de compras anteriores permanecen intactas.

### USD y tipo de cambio

`exchange_rates` guarda venta, fecha y fuente. Las visitas al registro solo leen una cotización almacenada de hasta siete días, no futura. Sin una cotización utilizable, USD queda deshabilitado y PEN continúa funcionando. `tipo-cambio:actualizar` consulta ApiPeru una vez cuando falta la fecha; valida la fecha de respuesta y una venta entre 2 y 6 PEN/USD. El scheduler lo ejecuta a las 09:15 de Lima y necesita la llave propia `API_PERU_TOKEN`. También admite un valor manual verificado:

```text
php artisan tipo-cambio:actualizar --fecha=AAAA-MM-DD --venta=TIPO_VERIFICADO --fuente="FUENTE_VERIFICADA"
```

Los marcadores no son valores para ejecutar. No se cargó una cotización ficticia en la base local. Las pruebas usan datos aislados.

El registro permite elegir moneda e inicio del plan antes de completar los datos. La conversión USD redondea hacia arriba al centavo, se muestra con fecha y tipo de cambio y se congela al registrar la solicitud. La versión 5 envía una huella HMAC de la cotización del servidor: si cambian precios, cambio o saldo antes del registro, exige revisar el resumen nuevo. Cambiar meses o período actualiza también esa huella.

`payment_requests.amount`, el IGV y el resumen administrativo conservan la base PEN. `currency`, `charge_amount`, `exchange_rate` y `exchange_rate_date` identifican el cobro efectivo. Culqi y 3DS reciben esos valores congelados; una respuesta con otro importe o moneda no activa el plan. El ticket interno identifica el cobro USD y su base PEN; mantiene su indicación de falta de validez tributaria. Correos y Mi plan muestran el importe cobrado. Yape se oculta en USD y se rechaza en el servidor si se intenta forzar.

### Cambios de plan

La renovación normal agrega el período después de la cobertura pagada. El cambio inmediato es explícito y requiere una cuenta autenticada con plan pagado vigente que elija otro de mayor precio mensual de referencia.

El saldo se calcula en céntimos sobre el valor del plan, proporcionalmente a los días restantes, más las renovaciones futuras todavía no iniciadas. No se recorta un saldo mayor al precio: se pide elegir más meses o un año para conservar su valor. La cotización guarda los períodos utilizados, sus fechas y la base de crédito. El resumen muestra saldo y neto antes de cobrar; se conserva el mínimo operativo del comercio de tres unidades monetarias. `credit_basis` conserva el valor completo del plan nuevo, incluido el crédito aplicado, para calcular otro cambio posterior.

Antes del cargo se reserva el pago en la fila del propietario. Otro pago incierto de esa cuenta bloquea cargos nuevos, sin afectar a otros usuarios. Rechazo explícito o confirmación liberan la reserva; un timeout no la libera. Se comprueba que la cobertura corresponde a la cotización. Al confirmar una subida, se cancelan los períodos utilizados para el saldo y el nuevo plan comienza inmediatamente, en una única transacción. Repetir la confirmación no consume saldo dos veces. Una alteración concurrente deja el cargo para revisión, sin aplicar un crédito duplicado.

Las bajadas empiezan al finalizar la cobertura. Se comprueba que los modelos CAD y memorias sin modelo vinculado quepan en el cupo del plan menor; las memorias vinculadas al mismo CAD no se cuentan otra vez. Este control no sustituye un sistema general de límites en todos los endpoints de creación de futuros módulos.

Mi plan permite cerrar solicitudes todavía no cobradas, incluidas autenticaciones 3DS abandonadas, cuando no hay ID de cargo ni estado incierto/procesando. Exige titular autenticado y CSRF y comparte el bloqueo del cobro. No efectúa devoluciones. Un cargo incierto continúa requiriendo conciliación o revisión en CulqiPanel.

### Respaldos y restauración

`/mis-respaldos` permite al propietario autenticado, también con plan vencido, proteger sus modelos CAD, memorias de cálculo, imágenes guardadas en ellas y memorias descriptivas. No incluye credenciales, sesiones, pagos, reclamaciones, archivos externos/generados ni borradores que solo estén en el navegador. Los vínculos CAD ajenos se retiran de la copia. Ni siquiera los administradores de pagos pueden descargar o restaurar copias ajenas por esos endpoints.

Las copias se guardan cifradas mediante Laravel en el disco privado `local`, con checksum y formato versionado. El máximo sin comprimir es 64 MB; tamaños mayores requieren respaldo asistido. La descarga entrega un JSON comprimido en gzip, legible al descomprimirlo y que debe conservarse en un lugar seguro. Restaurar solo utiliza copias privadas generadas por el sistema, sin admitir cargas de archivos arbitrarios.

La vista previa identifica por nombre los modelos y memorias que quedarán y los posteriores que se quitarán. Exige confirmación y contraseña actual. Si los datos cambiaron desde esa vista previa se rechaza la operación y se pide revisarla. Antes de tocar proyectos se guarda una copia independiente del estado actual; la escritura es transaccional. Un fallo revierte los proyectos y conserva esa copia previa. Restaurar la copia previa permite deshacer el cambio.

Los guardados CAD y sus puentes de memorias comparten el bloqueo con respaldos/restauraciones. Una generación monotónica por propietario incrementa las versiones CAD para impedir que una pestaña antigua sobrescriba el resultado. Tras restaurar deben cerrarse las otras pestañas y reabrir los proyectos desde el servidor. Ninguna restauración cambia correo, contraseña, suscripciones, pagos o reclamaciones.

El scheduler ejecuta `project-backups:daily` a las 02:00 de Lima. Conserva una copia por fecha de los siete días más recientes con copias, cuatro domingos y cuatro copias previas a restaurar. Las descargas y restauraciones se auditan por cuenta y se muestran en el panel. La limpieza afecta solo a respaldos propios, nunca a proyectos.

```powershell
php artisan project-backups:daily --dry-run
php artisan project-backups:daily
```

El primer comando no escribe ni elimina copias. El segundo genera/depura copias y no restaura proyectos. Localmente se ejecutó únicamente `--dry-run`, sin proyectos guardados en el servidor. Las restauraciones completas y su reversión se probaron con datos aislados.

### Configuración y despliegue

Se configuraron los datos confirmados: RIZABAL & ASOCIADOS INGENIEROS ESTRUCTURALES S.A.C., RUC 20609317061, Av. Javier Heraud N.° 110, sector San Luis, Amarilis, Huánuco, ubigeo 100102. Se mantuvo el WhatsApp +51 962 999 500. El correo confirmado `admon.construyehco@gmail.com` quedó configurado en `LEGAL_CONTACT_EMAIL`, `BILLING_ISSUER_EMAIL` y `MAIL_ADMIN_ADDRESS`, tanto en `.env` como en `.env.example`. No se modificaron las credenciales SMTP ni el remitente. `legal:verificar` pasa; la entrega SMTP real requiere una comprobación autorizada en el servidor.

Además de la migración del libro, aplica las dos migraciones siguientes. Ya están aplicadas localmente:

```powershell
php artisan migrate --path=database/migrations/2026_10_22_000009_add_currency_changes_and_backups.php --force
php artisan migrate --path=database/migrations/2026_10_22_000010_add_project_restore_generation.php --force
php artisan config:clear
php artisan view:clear
php artisan queue:restart
php artisan legal:verificar
php artisan culqi:verificar
php artisan schedule:list
```

No repitas las migraciones antiguas de memorias sobre datos existentes. Se corrigió su eliminación de índice para instalaciones nuevas y pruebas SQLite. Conserva el `APP_KEY` de cada entorno y respalda su almacenamiento privado: cambiarlo impide descifrar copias anteriores. No publiques `.env`, llaves ni respaldos en el directorio web. Mantén scheduler y worker activos y comprueba espacio libre.

Validación conjunta: 109 pruebas de servidor y 15 de frontend aprobadas. Incluyen USD, cotización obsoleta, Yape forzado, crédito de períodos futuros, confirmación repetida, capacidad al bajar, cierre de solicitudes, aislamiento de copias, restauración y reversión, retención, copia alterada, contraseña y rollback de escritura. La disponibilidad de USD y del procesamiento en soles depende de conservar una cotización vigente; consulta la verificación del 23/10/2026 al final de este documento. Las pruebas de integración con la pasarela, entrega SMTP y certificado HTTPS corresponden al entorno publicado; todavía no se ha desplegado al servidor.

Referencias de Culqi: [monedas del cargo](https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/cargos/) y [Checkout Custom con Yape en PEN](https://docs.culqi.com/es/documentacion/checkout/checkout-custom).


## Precio final y prueba gratuita (23/10/2026)

Los precios configurados en los planes son el monto objetivo tras procesamiento, todavía con IGV del servicio incluido. El cliente ve un precio final único para tarjeta y Yape, calculado en centavos: `ceil((objetivo + cargo fijo) / (1 - 0.0399))`. La tarifa de referencia aprobada es 3.99 % + US$0.20 por transacción. No se suma 18 % a toda la comisión: el tarifario vigente de Culqi indica que las comisiones generales están inafectas; el IGV del servicio se desglosa sobre el precio final de venta. El neto es una estimación; la liquidación efectiva se concilia en CulqiPanel.

Configuración: `CULQI_INCLUDE_PROCESSING=true`, `CULQI_PROCESSING_PERCENT=3.99` y `CULQI_PROCESSING_FIXED_USD=0.20`. `CULQI_PROCESSING_FIXED_PEN` es opcional, para un equivalente real confirmado por el comercio; vacío usa el tipo de cambio vigente. La compra conserva el porcentaje, cargo fijo, origen/fecha de conversión, neto objetivo, total, IGV y cotización en su snapshot. No cambia solicitudes anteriores. El descuento anual y el saldo por tiempo no usado se aplican al servicio antes de calcular procesamiento; la base de crédito excluye ese costo.

Se verificó y guardó localmente el tipo de cambio SBS de venta 3.450 del 22/10/2026 (referencia, no tarifa de liquidación de Culqi). Sin API_PERU_TOKEN, `tipo-cambio:actualizar` consulta la publicación oficial de SBS, conserva su fecha real y rechaza datos futuros, fuera del rango validado o de más de siete días. Sin una conversión verificable, el catálogo indica precio por confirmar y el servidor bloquea nuevas compras pagadas; la prueba sigue disponible. El scheduler diario ya incluye esa actualización. En producción debe poder acceder a SBS o disponer de un API_PERU_TOKEN operativo.

La prueba es una sola vez por cuenta, dura exactamente 15 días desde el registro y no tiene comisión ni tarjeta. Queda como acceso gratuito confirmado, sin cargo ni comprobante tributario. Registrarse para pagar no concede una prueba implícita. Las rutas de software, cálculo, memorias y API del backend comprueban la cobertura en cada solicitud; los endpoints de cuenta, contratación, soporte y respaldos siguen accesibles tras el vencimiento. Root y gerencia conservan su acceso administrativo. Predim y Arco Techo públicos siguen abiertos. No hay cobro automático al vencer: el usuario debe elegir y pagar un plan. Las pruebas antiguas con fecha mayor o sin fecha final tampoco exceden 15 días; los períodos pagados permanecen intactos.

Términos actualizados a la versión 2026-10-23-v3; las aceptaciones antiguas mantienen sus hashes y versión originales. El correo ya distingue prueba de 15 días, pago pendiente y cotización personalizada.

Fuentes: [tarifario Culqi](https://culqi.com/precios/), [comisiones CulqiOnline](https://ayuda.culqi.com/portal/es/kb/articles/cual-es-la-comision-de-culqionline) y [tipo de cambio oficial SBS](https://www.sbs.gob.pe/app/pp/SISTIP_PORTAL/Paginas/Publicacion/TipoCambioPromedio.aspx). No se realizaron cobros, envíos reales de correo ni despliegue.

Validación de precio y prueba: 149 pruebas distintas de servidor y 21 de frontend aprobadas, compilación Vite correcta y 24 combinaciones de vista/ancho/tema comprobadas en Chrome, sin errores JavaScript ni desbordamiento horizontal. Se probaron cotizaciones mensuales, varios meses y anuales, monto congelado frente a cambios de configuración, prorrateo previo a comisión, monedas, rechazo de datos manipulados, vencimiento exacto, bloqueo de rutas y API, acceso de cuenta tras vencer, pruebas antiguas sin vencimiento, y respuestas SBS inválidas o caducadas. En la configuración local verificada: mensual S/52.70 y anual S/593.22; el plan gratuito conserva S/0.00.
