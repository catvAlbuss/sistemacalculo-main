# Revisión previa a producción · 28/10/2026

**Resultado: no publicar todavía.** Se corrigieron accesos y el flujo comercial del vitalicio, pero permanecen bloqueos en dependencias y falta verificar la infraestructura real del servidor. Esta revisión es del código y del entorno local; no equivale a una prueba de penetración del servidor.

## Plan de por vida

La portada y el catálogo muestran **Contáctenos**, sin precio público fijo ni activación gratuita. Un vitalicio con precio de catálogo cero no es una prueba de cinco días. El GET de registro dirige a contacto; los POST públicos y el servicio Checkout rechazan contratarlo directamente.

Root o gerencia acceden a **Usuarios y suscripciones → Plan e historial → Definir monto y crear una propuesta de pago**. La propuesta contiene el usuario, plan, importe acordado del servicio, precio final con procesamiento, datos de comprobante y administrador emisor. No modifica el importe de otras personas ni el catálogo. Su creación no activa acceso ni envía correos automáticamente.

El cliente encuentra la propuesta pendiente en **Mi plan y pagos**. Debe iniciar sesión con la cuenta titular y aceptar las condiciones. Tiene siete días de validez; el enlace firmado dura un día y puede volver a generarse desde la cuenta mientras la propuesta esté vigente. El importe se congela y Culqi confirma el cargo antes de crear cobertura permanente. Los reintentos del mismo formulario no crean propuestas duplicadas. Se mantiene la asignación administrativa manual, identificada como tal y sin simular un cobro de pasarela.

## Accesos corregidos

| Hallazgo | Corrección |
| --- | --- |
| Precio cero confundía vitalicio con prueba | Clasificación por tipo, registro público cerrado y prueba limitada al plan trial |
| API de cálculo excluida de CSRF | Se retiró la exclusión y los clientes envían X-CSRF-TOKEN, incluido el envío de espectros |
| Entradas de Octave concatenadas en instrucciones | Se validan los literales numéricos, matrices, estructuras de polígonos y expresiones de cargas antes de invocar el motor; los errores ya no devuelven instrucciones ni stderr al cliente |
| Consulta pública del motor y peticiones costosas sin límite | Estado del motor sujeto a autenticación/cobertura y límites en cálculo, capturas y contacto |
| Capturas de proyectos en public | Nuevas capturas privadas, descarga autenticada y eliminación tras enviarla; capturas antiguas trasladadas a storage/app/private/legacy-public-captures |
| HTML de capturas podía ejecutar scripts y pedir URLs arbitrarias | JavaScript deshabilitado, solicitudes limitadas a recursos estáticos propios y proveedores de estilos existentes; proceso sin concatenación de comandos y con timeout |
| Perfil de navegador con archivos de sesión versionados en public | Retirado del índice Git, ignorado y bloqueado por Apache. Los archivos locales se conservan: Windows impidió mover el directorio. No incluirlo en una copia manual |
| Roles cambiados durante una sesión Livewire | Middleware de roles y permisos persistente en actualizaciones de componentes |
| Restablecer contraseña dejaba sesiones previas | Revocación de sesiones y tokens recordarme tras el restablecimiento |
| Falta de restricciones del host y cabeceras | En producción se limita el host a APP_URL; nosniff, SAMEORIGIN y HSTS sobre HTTPS; se conserva no-referrer del pago |
| Llaves de pruebas en producción | Culqi rechaza configuración test cuando APP_ENV=production |

## Dependencias

Se actualizaron **Livewire 3.5.19 → 3.8.11** y **Volt 1.6.6 → 1.11.2**, sin cambiar Laravel ni incorporar librerías nuevas. La auditoría posterior no registra avisos para ambos paquetes. Referencias de los mantenedores: [Livewire](https://github.com/livewire/livewire/security/advisories/GHSA-29cq-5w36-x7w3) y [Volt](https://github.com/livewire/volt/security/advisories/GHSA-v69f-5jxm-hwvv).

`composer audit --locked --no-dev` todavía informa **44 avisos en 11 paquetes**, incluidos **14 altos/críticos**. `npm audit --omit=dev` informa **20 avisos**, incluidos **13 altos**. Las cantidades son resultados de las herramientas, no una afirmación de que todos los avisos sean explotables por estas rutas. Se debe resolver o documentar la aplicabilidad antes de publicar. Entre los pendientes aparecen Laravel, Guzzle, CommonMark, Symfony, Vue/i18n, el visor CAD y mathjs; parte de la solución propuesta por npm implica un cambio mayor de mathjs.

**Laravel 11 terminó su soporte de seguridad el 12/03/2026**, según su [política oficial](https://laravel.com/docs/11.x/releases#support-policy). El proyecto sigue en Laravel 11.41.3. La resolución amplia de Composer dentro de la restricción `^11.31` se bloqueó por avisos de seguridad; no se desactivó `block-insecure` ni se ignoraron avisos. Hace falta preparar una migración compatible y validar especialmente cálculos, cargas de archivos, firmas de URLs, Livewire y pagos. La actualización de los dos paquetes críticos anteriores sí pudo resolverse separadamente.

Los resultados completos y los planes fallidos están en storage/logs/production-*.json y production-security-*-plan.log. No publicar esos registros ni el directorio storage.

## Validación antes de enviar al servidor

Ejecutar `php artisan produccion:verificar` en la entrega final. El comando no hace cargos, no envía correos y no muestra credenciales; devuelve fallo si detecta bloqueos. En desarrollo es correcto que detecte APP_ENV local, debug, cookies locales y public/hot. No cambiar la configuración del entorno local para ocultar esos resultados.

En el servidor, usar un checkout limpio con DocumentRoot apuntando exclusivamente a public. No copiar .env local, public/hot, perfiles de navegador, capturas antiguas, pruebas ni logs. Si el servidor usa Nginx, configurar también el bloqueo de directorios privados y dotfiles: .htaccess solo aplica a Apache. La exclusión del perfil de Git protege futuras entregas; el historial previo del repositorio conserva sus versiones antiguas y debe permanecer privado.

Mantener la APP_KEY existente para no perder los respaldos cifrados. Aplicar migraciones, instalar el lock actualizado y compilar Vite. Verificar APP_ENV=production, APP_DEBUG=false, URL y redirección HTTPS, cookies seguras, llaves Culqi live del mismo comercio y secreto del webhook. Solo configurar proxies confiables si la infraestructura real los utiliza.

Configurar workers persistentes de payments y media, reiniciarlos tras desplegar código, y programar schedule:run. Verificar correo de entrega, webhook, conciliación, respaldos y tipo de cambio del cargo fijo. Los motores Python/Octave deben permanecer detrás de Laravel; no abrir sus puertos al público. La disponibilidad de workers, TLS, permisos del sistema, servidor de correo y webhook externo aún no se ha probado en el servidor de destino.

No ejecutar cargos reales durante esta revisión. Las pruebas de pago usan respuestas simuladas y las pruebas de base de datos usan SQLite en memoria, sin truncar la base local de negocio.

## Resultado de las comprobaciones realizadas

- 186 pruebas de servidor, con 2583 aserciones: correctas.
- 34 pruebas frontend: correctas.
- Compilación Vite: correcta, con los avisos existentes de tamaño de bundles y cargas compartidas.
- 18 combinaciones de página/ancho/tema en Chrome: sin desbordamientos ni errores JavaScript. Se creó una propuesta mediante el formulario real sobre una base SQLite aislada y se comprobó que el pago espera la aceptación de condiciones.
- `culqi:verificar`, `legal:verificar` y `videos:verificar`: comprobaciones locales correctas; no equivalen a validar llaves live ni infraestructura remota.
- `produccion:verificar`: devuelve fallo con los bloqueos de configuración y dependencias descritos. No se publicó ni se accedió al servidor de destino.
