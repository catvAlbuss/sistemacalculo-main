# Apariencia NovaCad conservando la vista de mlightcad

Mantener cinta, menús, grupos, comandos, barras, documento y distribución nativos. La instrucción del usuario es mejorar la vista existente, sin crear otra interfaz.

Aplicar los tokens de Rizabal/NovaCad a la interfaz nativa mediante sus variables CSS y propiedades públicas. No sustituir botones, interceptar comandos ni editar vendor. Conservar los accesos integrados Cimentación/Agente/Resultados y el respaldo flotante cuando no caben en la cinta.

Paleta automática del equipo: superficies #f8fafc / #ffffff y #101b2d / #18283c; texto #24364b / #e5edf8; acento #1d4ed8 / #93c5fd. Iconos propios coherentes para los accesos NovaCad. Mejorar contraste de entradas, tablas, títulos, selección, hover, foco y avisos en paneles y diálogos. El dibujo mantiene su fondo técnico oscuro y los colores de los elementos.

Comprobar que la cinta y los grupos se conservan, la navegación no se solapa, los paneles/captura/resultados siguen funcionando, los temas cambian sin remontar el motor y los botones/etiquetas son legibles en escritorio, móvil y retina. Compilar Blade y build final. Sin dependencias nuevas, cambios de rutas, cálculos o geometría.
