# Revisión de seguridad antes de producción (2026-10-29)

Alcance: inyección SQL, XSS, autorización entre usuarios, saturación por consultas o cálculos, cabeceras HTTP, archivos expuestos, pagos y dependencias. Verificación: `php artisan test` (258 pruebas) y `php artisan produccion:verificar`.

## Sin hallazgos

| Área | Resultado |
|---|---|
| Inyección SQL | Las dos consultas con SQL en crudo (`GestionUserRolSuscripcion`) usan texto fijo. Las búsquedas `LIKE` usan parámetros enlazados y solo existen en administración. No hay columnas ni órdenes tomados de la petición. |
| XSS | Las salidas sin escapar (`{!! !!}`) usan contenido del código; el JSON incrustado usa `JSON_HEX_TAG/AMP/APOS/QUOT`. |
| Acceso entre usuarios | Modelos CAD, Memorias y respaldos filtran por `user_id` (404 si el recurso es de otro usuario). Los respaldos además verifican SHA-256. El pago Culqi exige URL firmada y titular. |
| Livewire | `SubscriptionPlansManagement` autoriza en `boot()` (cada petición) y hay middleware persistente de roles y suscripción. |
| CSRF | Única excepción: `webhooks/culqi/*`, protegida con token en tiempo constante; el cargo se confirma consultando a Culqi desde la cola. |
| Login | 5 intentos por clave (`App\Services\SignIn`). |
| Inyección de comandos | Entradas de Octave validadas por `ValidateLegacyCalculation` (solo números y matrices). |
| `.htaccess` | Sin listado de directorios; bloquea archivos ocultos, `puppeteer-session` y `captures`. |

## Corregido en esta revisión

| Riesgo | Cambio |
|---|---|
| Saturación de CPU: los POST de cálculo (Octave, OpenSeesPy, controladores de hojas) no tenían límite y cada uno puede lanzar un proceso. | Limitador `calculation`: 60 POST por minuto por usuario en el grupo de calculadoras y en `api/opensees/analyze`. Las páginas (GET) no cuentan. |
| Cabeceras incompletas. | `Permissions-Policy` (cámara, micrófono, geolocalización, USB, serial y Bluetooth desactivados), CSP base (`object-src 'none'; base-uri 'self'; frame-ancestors 'self'`) y se retira `X-Powered-By`. |
| Imágenes de Memoria sin tipo ni tamaño: se guardaba cualquier texto. | Solo `data:image/png|jpeg|webp;base64,…` hasta ~8 MB. |
| Rutas públicas `storage/profile/{archivo}` y `storage/firmas/{archivo}` servían archivos por nombre sin sesión (en Windows admitían `..\`). No se usaban. | Eliminadas. |
| `download-proof/{id}` apuntaba a un método inexistente (error 500). | Eliminada. |
| `public/storage/payment_proofs` (comprobantes antiguos) podría servirse directo. | Bloqueado en `.htaccess`. Ver pasos en el servidor. |
| `polyfill.io` (dominio comprometido en 2024) en cuatro vistas. | Retirado. |
| Dependencias PHP con avisos: Guzzle, Symfony http-foundation/mime/mailer/routing/yaml, CommonMark, Flysystem, PsySH, PHPUnit. | Actualizadas; con Laravel 13 todo Symfony queda en 7.4 (ver la sección siguiente). |

## Actualización a Laravel 13

Laravel 11 dejó de recibir parches de seguridad y Composer bloqueaba toda la rama 11. Se actualizó a **Laravel 13.39** (PHP 8.3 o superior):

| Paquete | Antes | Ahora |
|---|---|---|
| laravel/framework | 11.41.3 | 13.39.0 |
| laravel/tinker | 2.10 | 3.0 |
| phpunit/phpunit | 11.5 | 12.5 |
| nunomaduro/collision | 8.6 | 8.9 |
| spatie/laravel-permission | 6.21 | 6.25 |
| Symfony | 7.2 | 7.4 |

`composer audit`: sin avisos. Pruebas: 258 de PHP y 36 de frontend aprobadas; cachés de configuración, rutas, vistas y eventos generadas sin errores.

Dependencias npm:

| Cambio | Motivo |
|---|---|
| `vue` 3.5.44, `mathjs` 15.2, override `lodash-es` 4.18 | Avisos altos corregidos. |
| `@mlightcad/cad-viewer` 1.5 → 1.7.6 y `vue-i18n` 10 → 11 | `vue-i18n` 10 tenía un aviso alto sin corrección en esa rama. |
| `three` 0.172 y `@mlightcad/libredwg-web` como dependencias directas | El código las importa; antes llegaban como dependencias indirectas. |
| Override `@mlightcad/mtext-renderer` 0.13.4 | Las piezas del visor 1.7.6 declaran versiones de `three` incompatibles entre sí; 0.13.4 acepta `three` 0.172 igual que el resto. |
| Plugins opcionales del visor 1.7.6 (`cad-*-plugin`, `pdf-renderer`) | El visor los importa de forma estática; sin ellos el build falla. |
| Overrides `zod` 4.6, `undici` 6.23, `@fastify/busboy` 3.2 | Avisos altos del plugin de agente del visor (no se usa). El visor se probó en navegador tras el cambio. |
| `@mlightcad/dxf-json` 1.2.8, importación con nombre `DxfParser` | La versión nueva ya no tiene exportación por defecto. |

`npm audit`: 0 altos ni críticos (quedan 4 bajos y 2 moderados en `flowbite` y `exceljs`, que exigen versiones mayores).

El visor DXF (`/software/predim2`) se verificó en Chrome con el build de producción: monta la interfaz completa y no registra errores nuevos. El script `build` usa 8 GB de memoria para Node porque el paquete del visor 1.7 es mayor.

## Pendiente

1. **CSP de scripts**: la política actual no restringe scripts porque las hojas cargan librerías de varios CDN. Siguiente paso: `Content-Security-Policy-Report-Only` con la lista de CDN, revisar reportes y luego aplicarla.
2. `/software/predim2` carga también `adm_safecito.js`, que busca `#datosGenerales` y registra un error en consola en esa página. Es anterior a esta revisión.

## Pasos en el servidor

- En hPanel de Hostinger seleccionar **PHP 8.3 o superior** (Laravel 13 lo exige) antes de desplegar; después `composer install --no-dev --optimize-autoloader`.
- `.env`: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://ryaie.com`, `SESSION_SECURE_COOKIE=true`, `LOG_LEVEL=warning`.
- No subir `public/hot` ni `public/puppeteer-session` (ignorados por Git). Borrarlos si existen en el servidor.
- Revisar `public/storage/payment_proofs` en el servidor: si contiene comprobantes antiguos, moverlos fuera de `public/`.
- Cron cada minuto: `php artisan schedule:run` (tipo de cambio diario y tareas programadas).
- Worker de colas para `payments` y `media`.
- HTTPS con redirección; `produccion:verificar` sin errores antes de abrir el tráfico.
