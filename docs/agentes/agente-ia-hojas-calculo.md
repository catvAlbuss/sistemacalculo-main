# Agente de IA para las hojas de cálculo

Propuesta para incorporar un asistente de IA (Claude) a las hojas de cálculo, empezando por **Diseño de vigas** y **Diseño de vigas general**. Estado: pendiente. Se implementará después de uniformizar el diseño de las hojas (ver `docs/uniformizacion-hojas-asistente.md`).

## Principio

El agente **no calcula**. Opera las herramientas que ya existen: lee y llena los datos de la hoja, ejecuta los calculadores, lee los resultados, los explica y, si se le pide, itera el diseño. Todo número que muestre proviene de un calculador del sistema.

Motivos:

- Un valor generado por un modelo de lenguaje no es defendible ante un revisor estructural.
- Las fórmulas viven en un solo lugar (los calculadores JS). No se duplica la norma en un prompt.
- Los resultados son reproducibles: el usuario puede recalcular la hoja manualmente y obtener lo mismo.

## Arquitectura

```
Navegador (hoja de vigas)            Laravel (Hostinger)               Claude API
──────────────────────────           ───────────────────               ──────────
Panel del asistente ──mensaje─────▶  POST /api/agente/hojas/{hoja} ──▶ claude-opus-5-5
                                     (SDK PHP, clave en .env)            + definición de herramientas
                    ◀──tool_use─────  devuelve la llamada solicitada ◀── "usar calcular_flexion"
Ejecuta el calculador JS existente
y dibuja con los renderers actuales
                    ──tool_result───▶ reenvía el resultado ───────────▶ continúa o responde
                    ◀──respuesta─────
```

- **Las herramientas se ejecutan en el navegador.** Se reutilizan los calculadores y renderers existentes sin portarlos a PHP. Laravel solo intermedia.
- **Laravel guarda la API key** (`ANTHROPIC_API_KEY` en `.env`). La clave nunca llega al navegador.
- **Compatible con Hostinger Business:** cada turno es una petición HTTP corta. No hay procesos persistentes ni puertos propios, igual que con Octave y OpenSeesPy (ver `CLAUDE.md`).
- **Control de acceso y consumo:** la ruta va detrás de `auth`, `check.subscription` y un `throttle` propio. Se registra el consumo de tokens por usuario para poder limitarlo por plan.
- **Ruta relativa:** el frontend llama a `/api/agente/...`, nunca directamente a la API de Anthropic.

## Herramientas iniciales (vigas)

Cada herramienta envuelve una función que ya existe en `resources/js/vigas/`.

| Herramienta | Función existente | Uso |
|---|---|---|
| `leer_datos_viga` | `collectData()` en `data/dataCollector.js` | Lee materiales, número de tramos y la tabla de geometría y solicitaciones. |
| `cargar_datos_viga` | `createTable()` + edición de la tabla Tabulator | Llena la hoja desde texto o datos pegados de ETABS. Marca los resultados como desactualizados (`markStale`). |
| `calcular_requisitos` | `DesignRequirementsCalculator` | Cuantías mínima y máxima, recubrimientos. |
| `calcular_flexion` | `FlexionCalculator` | Acero positivo y negativo por tramo. |
| `seleccionar_acero` | `steelOptions.js` + `steelEditor.js` | Propone combinaciones de barras; el calculador verifica. |
| `calcular_corte` | `ShearCalculator` | Diseño por corte y estribos. |
| `calcular_capacidad` | `CapacidadCalculator` | Capacidad resistente con el acero colocado. |
| `calcular_deflexion` | `DeflectionCalculator` | Verificación de deflexiones. |
| `dibujar_resultado` | renderers de `renderers/` + `sheets/export.js` | Muestra los resultados y habilita la exportación. |

Las definiciones usan `strict: true` y `additionalProperties: false`. El frontend valida cada entrada antes de ejecutar la herramienta.

## Comportamiento por fases

1. **Asistente (primera versión):** interpreta datos en lenguaje natural o pegados, llena la hoja, calcula y explica los resultados citando los valores del calculador y el artículo de la Norma E.060 que corresponda. El ingeniero decide.
2. **Diseño iterativo:** si una verificación no cumple (cuantía, corte, deflexión), propone otra sección o acero, recalcula y repite hasta cumplir. Muestra cada intento.
3. **Revisión:** "revisa mi diseño" lee lo ingresado y señala inconsistencias.
4. **Otras hojas:** el mismo patrón se aplica a las hojas que comparten la estructura "calculador JS + render", una vez uniformizadas.

## Decisiones pendientes

- Comportamiento inicial: asistente o diseñador autónomo. Recomendación: asistente.
- Roles o planes con acceso y límite de consumo por usuario o por plan.
- Cuenta y API key de Anthropic para el entorno de producción.

## Modelo y configuración

- Modelo: `claude-opus-5-5`, con thinking adaptativo y `effort` explícito (por defecto es `medium` en este modelo).
- Respaldo ante rechazos: parámetro `fallbacks` del lado del servidor.
- Prompt de sistema estable y cacheado (normas, unidades y convenciones de la hoja). Los datos del usuario van después del punto de caché.
- SDK oficial de PHP (`anthropic-ai/sdk`) desde un controlador de Laravel. Las firmas se toman de la documentación del SDK al implementar.
