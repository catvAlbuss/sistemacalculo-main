# Ciclo de ejecución del agente NovaCad

Objetivo autorizado: que las acciones y el chat usen el motor OpenAI para trabajar
sobre el documento, comprobar los resultados y continuar cuando sea necesario.

Diagnóstico previo: generar devuelve terminal y corta la revisión; los botones
ejecutan herramientas directamente. El análisis añadido posteriormente es texto
sin capacidad de ejecutar la siguiente acción. El generador del módulo VIII
obtiene 77 % de coincidencia geométrica aproximada: eso no acredita calidad de
presentación ni cálculo estructural. La extracción de patrones local no es un
reentrenamiento de los pesos de OpenAI.

Diseño: mantener las herramientas y rutas existentes; incorporar una revisión
obligatoria después de generar/metrar y devolver sus resultados al mismo ciclo
del modelo. Las cancelaciones y decisiones humanas pendientes siguen deteniendo
la ejecución. Impedir escrituras idénticas dentro de un pedido sin impedir una
regeneración después de una corrección efectiva. Unificar botones y texto en
el motor de ejecución, conservando los argumentos del botón. El cliente ve una
animación de creación y el resultado; la actividad técnica queda plegada.

No implementar un falso entrenamiento automático ni presentar controles de
texto/datos como validación estructural. Las capacidades inexistentes siguen
siendo explícitas. La actualización de conocimiento debe venir de referencias
y correcciones validadas, con trazabilidad, fuera del ciclo de escritura global
de archivos de aprendizaje durante el pedido del cliente.

Plan (guías writing-plans y test-driven-development):

- [x] Pruebas que fallen: generación terminal seguida de revisión; corrección y
  segunda comprobación; errores/cancelación; argumentos de acciones; repetición.
- [x] Implementar controles del ciclo y revisión obligatoria en agentRunner.
- [x] Enviar acciones del panel al mismo ciclo y mostrar progreso de creación.
- [x] Pruebas relacionadas, módulo VIII y módulos independientes, y build.

Restricciones: sin bibliotecas nuevas, sin cambiar rutas ni esquemas públicos de
las herramientas. No cambiar claves ni proveedor ni publicar aprendizaje global
sin validación. No afirmar que las láminas son correctas solo porque se generan.

Verificación y configuración efectiva:

- 85 pruebas de frontend e integración aprobadas, sin omisiones. Incluyen CAD real
  del módulo VIII, verificación obligatoria, lotes de herramientas compatibles
  con OpenAI, pendientes humanos, repetición, referencias y módulos independientes.
- 12 pruebas del proxy del motor aprobadas (62 aserciones).
- Build de Vite final aprobado y manifest comprobado: incluye revisión automática,
  acciones del panel con el motor, conservación de resultados ante errores parciales
  y actividad plegada. Avisos existentes de tamaño y dependencias CAD.
- Consulta real de modelos de la cuenta y dos intercambios sintéticos comprobados:
  OpenAI llama una herramienta, recibe su resultado y conserva el dato pendiente.
  No se enviaron planos ni información del despacho al proveedor durante la prueba.
- El entorno restringido impidió conexiones al principio; las comprobaciones con
  acceso de red confirmaron que MySQL y el proveedor estaban disponibles. Eso no
  era una avería de MySQL ni motivo para cambiar su configuración persistente.
- La cuenta tiene Sol/Astra disponibles. Se quitó Mini del primer puesto en la
  configuración local: Sol principal, Astra de respaldo, esfuerzo medio y límite
  de 6000 tokens de salida. Caché de configuración reconstruida; claves intactas.
- Las pruebas sintéticas de Sol devolvieron reasoning_tokens=0: se verificó el
  intercambio de herramientas y la configuración, no una medida de razonamiento
  interno ni una garantía de corrección ingenieril basada en consumo de tokens.
- El cliente ve progreso animado, actividad plegada y hechos de herramientas.
  El texto libre del modelo no puede añadir una aprobación ficticia de la entrega.

Límite conocido: revisar_laminas comprueba textos, datos, rótulo y pendientes del
paquete. No compara visualmente todos los elementos ni sustituye el diseño
estructural. Las diferencias geométricas medidas en VIII siguen requiriendo
correcciones específicas del generador y referencias verificadas. La consulta de
referencias no reentrena los pesos de OpenAI ni ejecuta entrenamiento global en
el navegador del cliente.
