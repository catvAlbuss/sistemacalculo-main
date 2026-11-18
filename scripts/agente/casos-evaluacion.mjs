// Casos de evaluación del Agente Predim: pedidos típicos del chat con la herramienta y
// los argumentos que el modelo debe elegir. Los usa evaluar-modelo.mjs y se exportan
// al paquete portable (evaluacion/casos.json). Agregar aquí cada pedido nuevo que el
// agente deba entender (así se mide si un modelo o un cambio de prompt lo mejora).

export const CASOS_EVALUACION = [
  {pedido: 'Genera el plano de estructuras de esta arquitectura', herramienta: 'plano_estructuras', argumentos: {}},
  {pedido: '¿Qué vistas tiene el plano abierto?', herramienta: 'vistas_plano', argumentos: {}},
  {pedido: 'Genera el plano de estructuras con platea', herramienta: 'plano_estructuras', argumentos: {cimentacion: 'platea'}},
  {pedido: 'estructura el techo del modulo, con zapatas', herramienta: 'plano_estructuras', argumentos: {cimentacion: 'zapatas'}},
  {pedido: 'Lee los ejes y columnas del primer nivel', herramienta: 'leer_estructura', argumentos: {}},
  {pedido: 'hazme las láminas de estructuras del primer nivel', herramienta: 'plano_estructuras', argumentos: {}},
  {pedido: 'necesito cimentación con zapatas aisladas para este módulo', herramienta: 'plano_estructuras', argumentos: {cimentacion: 'zapatas'}},
  {pedido: 'qué columnas detectas en la planta', herramienta: 'leer_estructura', argumentos: {}},
  // Análisis, metrado y correcciones (lo que el ingeniero pide después de generar las láminas).
  {pedido: 'analiza este plano y dime qué estructura propones', herramienta: 'proponer_estructura', argumentos: {}},
  {pedido: '¿qué cimentación y qué losa le corresponde a este módulo?', herramienta: 'proponer_estructura', argumentos: {}},
  {pedido: 'saca el metrado de estructuras', herramienta: 'metrar_estructura', argumentos: {}},
  {pedido: 'necesito la planilla de metrados en excel', herramienta: 'metrar_estructura', argumentos: {excel: true}},
  {pedido: 'la losa de este módulo es maciza, corrígelo', herramienta: 'corregir_estructura', argumentos: {decision: 'losa'}},
  {pedido: 'el aligerado debe ser de 25 cm', herramienta: 'corregir_estructura', argumentos: {decision: 'espesorLosa'}},
  {pedido: 'revisa las láminas que hiciste', herramienta: 'revisar_laminas', argumentos: {}},
  {pedido: 'corrige los textos encimados', herramienta: 'revisar_laminas', argumentos: {corregir: true}},
  {pedido: 'según el estudio de suelos el Df es 2.50 m', herramienta: 'datos_proyecto', argumentos: {}},
  {pedido: 'borra las láminas de estructuras que dibujaste', herramienta: 'quitar_laminas', argumentos: {}},
];
