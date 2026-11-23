# Evitar acumulación de trabajos de pagos

Diagnóstico: el servidor informa siete tareas pendientes y 3454 jobs. El scheduler reencola tareas pendientes cuyo dispatched_at tiene más de diez minutos. Sin worker activo, cada ejecución vuelve a crear un job para la misma tarea. ProcessPaymentTask termina sin hacer nada cuando la tarea ya no está pendiente; por eso los duplicados pueden mostrar DONE en unos dos milisegundos.

Plan: reproducir con la cola database en SQLite y avances de reloj de veinte minutos y dos días. Hacer ProcessPaymentTask único por taskId hasta que empieza su procesamiento, mediante ShouldBeUniqueUntilProcessing de Laravel. Mantener los reintentos, las tareas independientes y la recuperación de fallidos. Ejecutar pruebas de cola y pagos. Drenar los jobs ya existentes en el servidor, sin borrarlos; esta corrección evita nuevos duplicados y no elimina los anteriores.
