# Ajuste visual de Análisis Estructural

Objetivo: conservar comandos y vistas 2D/3D; corregir contraste y herramientas recortadas.

Diseño: mantener la tipografía existente, superficies claras #f8fafc / #ffffff y oscuras #182536 / #111c2b, texto #24364b / #e5edf8 y acento azul #1d4ed8 / #93c5fd. El tema sigue al sistema operativo. Los iconos monocromos heredan el color del control; PDF conserva sus colores. Las barras desplazan sus herramientas sin reducirlas ni ocultar la barra de desplazamiento.

1. Reproducir en navegador el contraste insuficiente de los botones compartidos y el recorte con distintos anchos.
2. Aplicar estilos exclusivos de `.structural-workspace`, dimensiones consistentes en componentes ribbon y colores heredados en SVG. Ajustar navegación, barra lateral y controles inferiores sin alterar handlers ni cálculos.
3. Validar claro/oscuro, foco/hover/activo/deshabilitado, ancho móvil/escritorio, desplazamiento hasta la última herramienta y compilación de producción. Verificar compilación Blade.

Archivos: `resources/css/structural-workspace.css`, componentes de `resources/views/components/cad/`, raíz `cad-sys.blade.php`, entrada JS de análisis y prueba `tests/frontend/structural-workspace-ui.test.mjs`.

Restricciones: sin dependencias nuevas, sin cambios de API ni motores de cálculo/renderizado; no modificar el trabajo existente de Predim2.

## Ampliación: paneles y formularios

Aplicar los mismos tokens a paneles de Items/Propiedades y formularios existentes de análisis. Adaptar utilidades antiguas solo dentro de este espacio, excluyendo el visor `#cad-workspace` y colores de representación del modelo. Definir texto/superficie, borde de controles, placeholder, solo lectura, deshabilitado, selección, hover, foco y estados de checkbox/radio. Conservar acciones primarias y estados de advertencia con pares de color comprobados. Corregir asociaciones label/control en los componentes compartidos de propiedades.

Pruebas: reproducir hover ilegible con movimiento real de ratón; comprobar contraste de labels, inputs, selects, celdas y filas en ambos temas, foco, checked/unchecked, readonly/disabled, y alineación de campos desde 320 px. Reutilizar pruebas de barras y verificar Blade/build.
