# Corrección del motor OpenAI del agente

Objetivo: usar el motor del servidor y la memoria aprendida en el chat, mantener
las imágenes entre turnos y completar el análisis después de las herramientas.
No cambiar API pública ni añadir dependencias.

Diagnóstico: el registro muestra un HTTP 520 sin recuperación; la conexión real,
credencial y modelo responden 200. La memoria completa y visión están activas.
El cliente puede ejecutar atajos sin modelo y termina tras el primer mensaje de
una herramienta. El historial del panel solo conserva texto, aunque el turno
anterior incluyera una captura. La revisión de láminas es limitada a incidencias
de dibujo y no sustituye el análisis visual con el modelo.

- [x] Reproducir con pruebas: 520 recuperable, fallos persistentes y credenciales;
  chat al modelo con memoria, continuación tras herramientas y captura en seguimiento.
- [x] Reintentar una vez fallos transitorios y permitir respaldo en la cadena
  configurada; no reintentar autenticación, validación ni cuota agotada.
- [x] En el chat del servidor usar IA por defecto; conservar acciones directas
  de botones y scripts locales. Continuar tras resultados útiles salvo preguntas
  pendientes, cancelación o límite de rondas. Mostrar hechos y análisis diferenciados.
- [x] Conservar la captura reciente del historial sin reenviar todas las fotos
  antiguas. Reforzar instrucciones para comparar referencias con criterios aprendidos.
- [x] Ejecutar pruebas Node y Laravel en SQLite de memoria, compilar y comprobar
  una llamada real mínima a OpenAI sin exponer secretos ni modificar planos.

OpenAI sigue siendo el modelo base; los casos y criterios del despacho son memoria
y herramientas del agente. Este cambio no crea ni implica un modelo fine-tuned.

## Verificación

- 40 pruebas Node pasan; 12 pruebas Laravel pasan (62 aserciones), usando SQLite
  de memoria y un APP_CONFIG_CACHE inexistente para aislar la caché de pruebas.
- La nueva regresión reproduce el HTTP 520 antes de corregirlo; comprueba reintento,
  respaldo con el siguiente modelo y ausencia de reintento por autenticación.
- La regresión del chat reproduce el atajo sin IA y la pérdida de capturas antes
  de corregirlos. Ahora comprueba memoria y casos en el prompt, continuación de
  herramientas, detención ante decisión humana y resultados parciales tras fallo.
- Comprobación real: modelo configurado disponible (200), respuesta mínima (200)
  y controlador del agente con visión y herramienta ficticia (200, 110 tokens de
  entrada y 21 de salida). Solo se usaron datos sintéticos; no se ejecutaron herramientas.
- La revisión automática rechazó enviar memoria interna para una prueba externa;
  se utilizó la alternativa sintética. El contenido aprendido se verificó localmente.
- `php -l` y `git diff --check` sin errores en los archivos afectados.
- Compilación final `npm.cmd run build`: código 0, 2m45s. Verificados en el bundle
  la desactivación de atajos del chat, el análisis tras herramientas y el manejo
  de resultados parciales. Vite conserva avisos de dependencias y paquetes grandes.
