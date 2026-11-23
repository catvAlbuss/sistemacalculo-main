# Propuesta: interfaz del agente NovaCad

Estado: aprobado por el usuario e implementado. Validación registrada en el plan de ejecución.

## Objetivo y diagnóstico

Facilitar el trabajo con planos desde un agente compacto, profesional y rápido.
La interfaz actual muestra antes del inicio todas las correcciones pendientes y
la lectura completa del plano. `revision.abierto` y `verLectura` empiezan en true;
además, el diagnóstico vuelve a expandirse al terminar si no hay conversación.
La regla `.ag-problems li` alcanza los elementos de la lista anidada de rasgos:
cada dato adquiere el fondo, borde rojo y espaciado propios de una incidencia.
El problema combina jerarquía de información, expansión automática y alcance CSS.

El componente real es Vue, dentro de Laravel/Vite:
`resources/js/etabs/components/AgentePredimPanel.vue`.

## Alternativas

- Un solo chat con bloques plegables: cambio pequeño, pero mantiene las revisiones
  administrativas mezcladas con el trabajo sobre el plano.
- Asistente y Revisiones: propuesta recomendada. Dos vistas en el mismo panel;
  la conversación ocupa la principal y las correcciones tienen un contador visible.
- Panel de control con más tarjetas: descartado porque aumenta la densidad que
  el usuario quiere reducir.

## Diseño propuesto

```text
NovaCad                    Datos   Nueva   Cerrar
Disponible
Asistente          Revisiones (19)
------------------------------------------------
Plano: MODULO 2.dwg         Listo   Ver detalles

¿Qué necesitas hacer?
[ Construir paso a paso                      ]
  Analizar        Estructurar
  Metrar          Revisar láminas

Conversación y resultados

------------------------------------------------
[ Adjuntar   Escribe una instrucción…   Enviar ]
```

- Abrir siempre en Asistente. Mantener encabezado, navegación y entrada estables;
  desplazar únicamente el contenido central de cada vista.
- Mostrar el plano y su estado en un resumen compacto. Desplegar vistas, ejes,
  niveles y objetos por petición del usuario; señalar problemas sin ocultarlos.
- Conservar las cinco acciones existentes. Una principal y cuatro accesos
  compactos, sin grandes tarjetas repetidas ni texto redundante.
- Mostrar las correcciones solo en Revisiones, conservando permisos, errores,
  reintento y aprobación o rechazo individual. No agregar aprobación masiva.
- Cada corrección presenta campo, valor anterior y propuesto, motivo y acciones.
  Los rasgos técnicos van en un detalle desplegable con pares etiqueta/valor,
  sin convertir cada dato en una alerta roja. Conservar valores cero y false.
- Mantener el nombre Revisar láminas para distinguirlo de Revisiones técnicas.
- Mantener adjuntos, pegado de capturas, detener, datos de proyecto, planilla,
  exportación, herramientas y flujo de construcción existentes.

## Dirección visual

Conservar la tipografía y variables de tema del proyecto. Base azul pizarra,
superficies discretas, alineación izquierda, títulos de 14–16 px y cuerpo de
12–13 px. Referencia oscura: fondo #182A3B, superficie #122130, texto #E2E8F0,
secundario #AAB9CB, acento #5B8CFF y error #EF4444, adaptados mediante las variables
existentes para respetar también el tema claro. Reservar el color para acciones,
estados y errores; reducir bordes, degradados y bloques de aviso permanentes.
Usar espaciado coherente de 8/12/16 px, foco visible, controles con nombre accesible,
estado expandido anunciado y navegación por teclado. Mantener vista móvil.

## Alcance y validación prevista

Cambio localizado al componente y a pruebas pertinentes, sin nuevas dependencias,
sin cambios de API pública y respetando las modificaciones locales existentes.
Verificar compilación con `npm run build`, pruebas relacionadas del agente y,
si hay navegador disponible, inspección visual a 420 px y en móvil. Comprobar que
19 correcciones con numerosos rasgos no desplazan el inicio, que cada aprobación
actualiza el contador y conserva errores, y que se puede volver al chat sin perderlo.

## Referencias consultadas

- VS Code: conversación, entrada y contexto adjunto:
  https://code.visualstudio.com/docs/chat/chat-overview
- Cursor: panel conversacional y revisión explícita de cambios:
  https://cursor.com/help/ai-features/agent

Estas referencias orientan la propuesta; la estructura descrita es una decisión
de diseño para NovaCad, no una reproducción literal de esos productos.
