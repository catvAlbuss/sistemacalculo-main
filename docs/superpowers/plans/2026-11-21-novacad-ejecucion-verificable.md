# Revisión de las conversaciones: ejecución verificable

La conversación demuestra borrado y regeneración, pero sin entradas nuevas que
produzcan los detalles pedidos. El texto libre del modelo afirma inclusiones y
confirmaciones que no constan en los resultados de herramientas. El generador
actual ya tiene notas y parámetros sísmicos, pero no un despiece parametrizable
de barras superiores con sus longitudes verificadas.

Plan, sin nuevas librerías ni cambios de rutas públicas:

- [x] Reproducir las afirmaciones falsas, pedidos no soportados, repetición idéntica
  y omisión de entradas técnicas con pruebas.
- [x] Mostrar resultados comprobados de herramientas, sin añadir una confirmación
  libre del modelo que contradiga o amplíe lo ejecutado.
- [x] Bloquear pedidos de despiece no implementados antes de modificar el CAD y
  evitar el borrado previo al rehacer; el generador reemplaza sus propias láminas.
- [x] Detectar entradas idénticas y devolver sin cambios antes de borrar o dibujar.
- [x] Volver a solicitar datos técnicos faltantes y validar el formulario antes
  de generar, sin convertir propuestas en confirmaciones.
- [x] Registrar secciones realmente colocadas con lámina y cantidad de entidades,
  para localizar notas, resumen sísmico y cuadros.
- [x] Ejecutar pruebas pertinentes y compilar. No llamar al proveedor con memoria
  o planos del usuario para esta revisión.

Alcance: no se añadió el cálculo del despiece de barras. Se impide prometerlo y
volver a borrar/dibujar como si estuviera implementado. Las especificaciones y
los parámetros sísmicos ya existían en el compositor; se registra su colocación
real, junto con los cuadros, para poder indicar en qué lámina están.

Las cantidades calculadas se invalidan al regenerar con otras dimensiones.
La validación técnica bloqueante corresponde al flujo del panel con formulario;
los scripts sin panel conservan la salida preliminar con sus advertencias.

Verificación:

- `etabs-ejecucion-verificable.test.mjs`: confirmaciones falsas, capacidad ausente,
  seguimiento sin llamadas al modelo, borrado explícito, ausencia de borrado previo,
  campos incompletos, repetición, secciones reales y cantidades desactualizadas.
- `etabs-modulos-independientes.test.mjs`: inventarios de los 26 módulos locales;
  25 se generan y el área abierta de Ilo XI sigue solicitando columnas verificables.
- `AgenteLlmTest.php`: 12 pruebas aprobadas, 62 aserciones.
- Los fixtures del compositor ahora incluyen las cajas medidas que recibe el
  compositor actual. La integración CAD de datos admite la composición adaptativa
  al faltar la antigua plantilla fija; conserva la verificación del modo antiguo
  cuando esa plantilla existe.

Cierre: 34 pruebas rápidas aprobadas; integración de datos sobre CAD real aprobada
(8 pruebas, una omitida por requerir la plantilla retirada). También pasó el lote
de 26 pruebas de interacción, consultas y ejecución. Vite generó el build final
en 3 minutos. Se comprobó que el manifest apunta al bundle con las barreras de
repetición y borrado, lectura actual e invalidación de cantidades; el build emite
los avisos existentes de tamaño y compatibilidad de dependencias CAD.
