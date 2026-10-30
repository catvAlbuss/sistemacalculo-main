# Observaciones de Culqi: flujo de compra completo

Culqi observó la web por cuatro requisitos. Estado de cada uno y pasos para levantar la observación.

| Requisito de Culqi | Cómo se cumple |
|---|---|
| Catálogo mínimo de 5 productos o servicios | `/planes` publica 5 planes con precio: Prueba gratuita, Mensual, Trimestral, Semestral y Anual. De por vida se ofrece por contacto. |
| Imagen, descripción y precio visible por producto | Cada plan tiene su propia imagen (`config/plans.php`), su descripción y su precio en soles con IGV y procesamiento. De por vida no muestra importe: solo "Contáctenos". |
| Cierre de compra funcional | Plan → `/planes/registro` → pago con Culqi Checkout (tarjeta o Yape) → activación de la suscripción al confirmarse el cargo. |
| Usuario y contraseña de prueba | Comando `php artisan culqi:revisor <correo>`. |

Además, la web ya publica Términos y condiciones, Política de cambios y devoluciones, Política de privacidad, Libro de reclamaciones y el RUC en el pie de página.

## Planes y precios

Todos los importes de pago parten del Plan Mensual. Al cobrar se suma la comisión de procesamiento de Culqi (`CULQI_INCLUDE_PROCESSING`), y la página muestra el precio final.

| Plan | Base | Duración | Regla |
|---|---|---|---|
| Prueba gratuita | S/ 0 | 5 días | Una vez por cuenta |
| Mensual | S/ 50.00 | 30 días | Precio base |
| Trimestral | S/ 150.00 | 90 días | Mensual × 3, sin descuento |
| Semestral | S/ 300.00 | 180 días | Mensual × 6, sin descuento |
| Anual | S/ 570.00 | 365 días | Mensual × 12 con 5 % de descuento |
| De por vida | Sin precio publicado | Permanente | "Contáctenos": las condiciones se acuerdan con el equipo |

Trimestral y Semestral se calculan desde el Plan Mensual (`config/payments.php`, `period_bases`), igual que el Anual (`annual_bases`). Si cambia el precio del Mensual, cambian los tres. Si el Plan Mensual no está activo, esos planes muestran "Precio por confirmar" en lugar de un importe.

Migraciones: `2026_10_29_000001` crea Trimestral y Semestral (amplía la columna `type`), `2026_10_29_000003` pasa el Mensual a S/ 50 y ajusta los importes de referencia. Solo cambia los precios que conservan el valor anterior.

Anual y De por vida incluyen acceso exclusivo a nuevas herramientas y agentes de IA (migración `2026_10_29_000002_update_premium_plan_features.php`). No se entrega certificado. Las páginas, correos y comprobantes no mencionan cantidad de proyectos.

## Modo revisión

Mientras Culqi revisa la web, el comercio solo tiene llaves de integración (`pk_test_`, `sk_test_`). En producción el sistema las rechaza por seguridad, así que el botón de pago quedaría desactivado. El modo revisión lo permite de forma controlada:

- Solo actúa con `APP_ENV=production`, llaves `test` y `CULQI_REVIEW_MODE=true`.
- Solo las cuentas de `CULQI_REVIEWER_EMAILS` pueden pagar. Los demás usuarios ven "pago no disponible", de modo que un cobro de prueba nunca activa acceso para un cliente real.
- La página de pago muestra "Entorno de pruebas de Culqi: no se realiza ningún cargo real".
- Con llaves `live` el modo revisión deja de tener efecto.

## Pasos en producción

1. Desplegar y ejecutar `php artisan migrate` (crea Trimestral y Semestral).
2. Crear la cuenta de revisión: `php artisan culqi:revisor revisor@tu-dominio.com`. La contraseña se muestra una sola vez; no la guardes en el repositorio.
3. En `.env`:

   ```
   CULQI_ENABLED=true
   CULQI_PUBLIC_KEY=pk_test_...
   CULQI_SECRET_KEY=sk_test_...
   CULQI_REVIEW_MODE=true
   CULQI_REVIEWER_EMAILS=revisor@tu-dominio.com
   ```

4. `php artisan config:clear` y `php artisan culqi:verificar`.
5. Probar el flujo con la cuenta de revisión y una [tarjeta de prueba de Culqi](https://docs.culqi.com/es/documentacion/pagos-online/tarjetas-de-prueba).
6. Responder a Culqi con la URL de `/planes`, el correo y la contraseña de la cuenta de revisión.
7. Al recibir las llaves `live`: reemplazarlas en `.env`, poner `CULQI_REVIEW_MODE=false`, vaciar `CULQI_REVIEWER_EMAILS`, ejecutar `php artisan config:clear` y `php artisan produccion:verificar`.
