# ESTRUCTURAS-CAD-JSON 1.0.0

Inventario determinista y trazable de un plano DWG/DXF (arquitectura o estructura), adaptado del
plan PREDIAL AI (`plan_sistema_lectura_planos_prediales.md`, secciones 6–7) al dominio de
estructuras. Lo genera `scripts/agente/inventario-cad.mjs` y queda **privado** en
`storage/app/private/entrenamiento/inventario/<proyecto>/` (no va a git ni a proveedores de IA).

Principios: se guarda lo que el archivo contiene (no lo que el agente cree); cada entidad lleva su
identificador del DWG para volver a ella; la interpretación (`clase`) es un campo aparte que se
llena en el paso 3 y lo revisa el especialista.

## Estructura

| Campo | Contenido |
|---|---|
| `esquema`, `version` | `ESTRUCTURAS-CAD-JSON`, `1.0.0` |
| `documento` | `archivo`, `sha256`, `bytes`, `rol` (arquitectura/estructura), `proyecto`, `modulo`, `formato` |
| `capas[]` | `nombre`, `entidades`, `tipos` (linea, poli, circulo, texto) |
| `vistas[]` | cada planta, pórtico o detalle con grilla de ejes (ver abajo) |
| `sinVista` | entidades fuera de toda vista (rótulos, cuadros, detalles sin ejes) |
| `validaciones` | `vistasConEjes`, `vistasSinTitulo`, `entidadesSinId`, `revisionHumana` |
| `trazabilidad` | `motor` (versión del extractor), `fecha` |

### Vista

| Campo | Contenido |
|---|---|
| `id` | `vista-01`… |
| `titulo` | texto del título tal como está en el plano |
| `tipoPlano` | por el título: cimentacion, cimiento, losa, tabiqueria, portico, planta, techo, corte, detalle, otro |
| `nivel` | 1, 2, 3… si el título lo dice |
| `unidadesPorMetro` | escala del dibujo (1, 100, 1000) |
| `origen` | punto (m) de los primeros ejes: todas las coordenadas de la vista son relativas a él |
| `ejes[]` | `nombre`, `orientacion` (x = eje vertical, y = horizontal), `posicion` (m) |
| `caja` | recuadro de la grilla (m, relativo) |
| `columnasLeidas` | columnas que el lector encuentra en los cruces |
| `entidades[]` | ver abajo (todo lo que cae en la grilla ampliada 1.5 m) |

### Entidad

| Campo | Contenido |
|---|---|
| `id` | camino de identificadores del DWG (`INSERT/…/entidad`) |
| `tipo` | linea, poli, circulo, texto |
| `capa`, `bloque`, `color` | tal como en el DWG (color solo si no es "por capa") |
| `puntos` / `cerrada` | geometría en metros, relativa al origen de la vista |
| `centro`, `radio` | círculos |
| `centro`, `texto`, `alto` | textos (texto legible, sin códigos de formato) |
| `clase` | `null` hasta el paso 3 (muro, columna, viga, vigueta, losa, zapata, cimiento, cota, eje, texto…) |

Pendiente (no se extrae aún): cotas (DIMENSION), achurados (HATCH), arcos y splines; se agregarán
cuando el paso 3 los necesite para clasificar.
