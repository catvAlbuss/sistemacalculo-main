# NovaCad Interface Implementation Plan

**Goal:** Aplicar el diseño aprobado para un agente más sencillo y rápido.
**Architecture:** Dos vistas conservadas con v-show, navegación nativa con botones y un único estado local. Mantener herramientas, API y modales actuales.
**Tech Stack:** Vue 3, CSS del proyecto, Vite, node:test.
**Spec:** docs/superpowers/specs/2026-11-20-novacad-interfaz-agente-design.md

## Restricciones

Sin dependencias nuevas ni cambios de API pública. Respetar cambios locales y tema actual.
Ejecución directa en esta sesión, autorizada por el usuario al aprobar el diseño.

## Revisión

Comprobar: numerosas correcciones; valores cero y false; errores y falta de permisos;
conversación conservada al navegar; lectura parcial y plano no apto visibles.

## Tareas

- [x] Añadir prueba de renderizado de la plantilla real con 19 correcciones y verificar el fallo inicial.
- [x] Separar Asistente y Revisiones; mantener conversación y borrador al navegar, contador reactivo, errores y estados vacíos.
- [x] Compactar resumen de lectura y acciones, desplegar rasgos, aislar estilos de incidencias y añadir foco visible.
- [x] Ejecutar pruebas de interfaz y del agente, compilar con npm run build y revisar diff.

La aprobación y rechazo conservan revisarEvento y sus llamadas actuales. Los accesos
conservan ejecutar y CAPACIDADES; la entrada conserva send, adjuntar, pegar y cancel.

## Evidencia

- 26 pruebas relacionadas pasan, incluidas 6 de renderizado de la plantilla real.
- Inspección visual en Chrome a 420 y 360 px con datos de ejemplo y estilos reales.
- Prueba interactiva de la plantilla: cambiar vistas conserva el borrador, desplegar
  contexto muestra datos sin fondo de alerta y reducir pendientes actualiza el contador.
- Sin desbordamiento horizontal a 360 px, tanto en tema oscuro como claro.
- Compilación final: `npm.cmd run build`, código de salida 0. Confirmados los
  últimos cambios de accesibilidad y estilos en los archivos del manifest.
- `git diff --check` sin errores en el componente y sus pruebas.
- Vite informa avisos de dependencias CAD, importaciones y tamaño de paquetes;
  no impiden la compilación. No se modificó la configuración de empaquetado.

## Ajuste solicitado: iconos y revisiones al abrir un plano

Diagnóstico: onMounted consultaba la cola global incluso para el documento
Untitled vacío que crea el SDK. La respuesta tampoco quedaba invalidada al cerrar.

- [x] Añadir iconos SVG de navegación, aprobar, rechazar y reintentar con etiquetas accesibles.
- [x] Extraer el estado de revisiones a `resources/js/etabs/agente/revisionesPlano.js`.
- [x] Activar revisiones solo con archivo abierto; limpiar e invalidar respuestas al cerrar o cambiar de documento.
- [x] Añadir pruebas de documento vacío, apertura, cierre, cambio con mismo nombre, errores, permisos y aprobación tardía.
- [x] Verificar pruebas relacionadas y compilar la versión final del ajuste.

Resultado del ajuste: 33 pruebas pasan; `npm.cmd run build` termina con código 0.
Verificados los eventos de cierre y la nueva interfaz en el archivo generado.
Capturas de la plantilla real con datos de ejemplo, a 360 px: sin plano no hay
pestaña ni contador de revisiones; con plano se muestran los nuevos iconos sin
desbordamiento horizontal. `git diff --check` sin errores en los archivos afectados.

Se conserva la API actual: los pendientes son la cola del despacho, sin una
asociación a archivos. La vista lo indica expresamente y solo la consulta cuando
hay un archivo CAD abierto. No se atribuyen revisiones globales a un plano concreto.
- Estas pruebas visuales usan datos de ejemplo; no ejercitan aprobaciones reales
  ni llamadas al servidor. Sus funciones existentes se conservaron.
