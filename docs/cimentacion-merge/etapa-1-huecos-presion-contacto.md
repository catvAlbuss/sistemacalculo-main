# Etapa 1 — Huecos en la presión de contacto (`/zapatas2`)

**Estado: ✅ completa y verificada.**

## Objetivo

Que el endpoint `/zapatas2` (presión de contacto rígida, usado hoy por
`/cimentacion-v2`) acepte una zapata con uno o más huecos (aberturas
interiores) restados de su geometría, en las dos rutas de ejecución que
exige el patrón dual-OS del proyecto (ver CLAUDE.md):

- **Windows (dev local)**: PHP nativo, `OctavePlotController::calcularZapatas2EnPhp()`.
- **Linux (producción)**: subproceso Octave, `public/assets/matlab/zapatas2.m`.

## Formato de entrada elegido

Un hueco es un polígono más dentro del mismo `struct` de Octave que ya se
manda hoy, con el nombre `poligonoN_huecoM` (N = número de la zapata, M =
número de hueco dentro de esa zapata):

```
struct('poligono1', [x,y; x,y; ...], 'poligono1_hueco1', [x,y; ...], 'poligono2', [...])
```

Se eligió este formato (en vez de un campo aparte) porque **no rompe nada
que ya exista**: ninguna zapata sin huecos tiene campos `_hueco`, así que el
comportamiento para todo lo ya validado (aisladas/combinadas sin recortes)
queda bit a bit igual que antes.

## Qué se cambió

### 1. PHP nativo (`app/Http/Controllers/OctavePlotController.php`)

- `polygonRawTotals(array $points): array` (nuevo) — acumuladores crudos de
  la fórmula shoelace (área×2, momentos de 1er orden), normalizados a
  sentido antihorario (`a0>0`). La normalización es la pieza clave: permite
  restar un hueco sin importar en qué sentido lo dibujó el usuario.
- `polygonProperties($points, $holes=[])` — ahora resta, para cada hueco, sus
  acumuladores (también normalizados) de los del contorno exterior antes de
  dividir/derivar área, centroide e inercias.
- `polygonGrid($points, $holes=[])` + `pointInAnyPolygon()` (nuevo) — la nube
  de puntos de presión descarta cualquier punto que caiga dentro de algún
  hueco.
- `parseOctaveStruct()` — antes devolvía una lista plana (perdía el nombre
  `poligonoN` de cada entrada); ahora devuelve `{nombre => matriz}` para
  poder distinguir `poligonoN` de `poligonoN_huecoM`.
- `calcularZapatas2EnPhp()` — agrupa las entradas por número de zapata
  (regex `poligono(\d+)` / `poligono(\d+)_hueco`) y pasa los huecos de cada
  grupo a `polygonProperties`/`polygonGrid`.

### 2. Octave (`public/assets/matlab/zapatas2.m`)

Mismo criterio, traducido línea por línea:

- `raw_totals(vertices)` — equivalente a `polygonRawTotals` (área/centroide
  crudos, normalizados a `a0>0`).
- `contour_accum(vertices)` — igual pero para perímetro, momentos estáticos
  e inercias (`IX0,IY0,IXY0,MX0,MY0,P0`), normalizado con el mismo criterio.
- El loop principal ahora agrupa `fieldnames(poligonos)` por prefijo
  (`poligonoN` vs. `poligonoN_hueco*`) usando `strfind`/`strncmp` (Octave no
  tiene el mismo motor de regex-con-grupos que PHP, así que se resolvió con
  comparación de substrings).
- La nube de puntos (`inpolygon`) descarta los puntos dentro de cualquier
  hueco (recentrado al mismo CG que la zapata neta).
- **Detalle de Octave que costó un intento fallido**: la función que debe
  coincidir con el nombre del archivo (`zapatas2`) tiene que ser la
  **primera** del archivo — los helpers (`raw_totals`, `contour_accum`)
  quedaron *después*, como funciones locales/privadas. Ponerlos primero (más
  natural al leer el archivo) rompía la función principal con un error
  confuso (*"function called with too many inputs"*) porque Octave la
  registra como no-exportable si no es la primera del archivo.

### 3. Frontend (`resources/js/safecito/zapatas2Core.js`)

- `buildPoligonosStruct(polygons)` ahora acepta `polygon.holes` (array
  opcional de arrays de nodos) y emite las entradas `poligonoN_huecoM`
  correspondientes. **Ningún llamador actual pasa `.holes` todavía** — esto
  es solo la plomería lista para cuando la Etapa 3 conecte el `opening` del
  CAD.

## Validación realizada

Caso de prueba: cuadrado 4×4 con un hueco cuadrado 1×1 centrado, columna
centrada con carga axial pura.

| Chequeo | PHP (Windows) | Octave (Linux) |
|---|---|---|
| Área neta (esperado 15.0 = 16−1) | ✅ 15.0 exacto | ✅ 15.0 exacto (via `raw_totals`, verificado por separado) |
| Centroide con hueco simétrico (no debe moverse) | ✅ sin cambio | ✅ sin cambio (XC=YC=2 en ambos casos) |
| Puntos de la nube, sin hueco vs. con hueco | 25600 → 24000 (PHP usa su propio generador de grilla) | 25600 → 24000 (Octave, `meshgrid`+`inpolygon`, 320 puntos totales con relación de aspecto) — la reducción es **exactamente** 25600×(15/16)=24000 |
| Puntos indebidos dentro del hueco | 0 | 0 |

Ambos se probaron con el intérprete real (no solo lint): PHP vía
`Illuminate\Http\Request::create()` + `ReflectionMethod` sobre los métodos
privados del controlador; Octave vía `octave-cli.exe` real, generando el
`.mat` binario (que `save("-mat7-binary","-","resultados")` escribe por
**stdout** — así lo captura el proceso PHP en producción, no escribe un
archivo `resultados.mat` en disco) y leyéndolo en una segunda invocación.

**Corrección (encontrada en la Etapa 4, dejada aquí por transparencia):**
la prueba original de esta etapa mandó `Co` con un formato equivocado (para
PHP, expresiones con comillas de más; para Octave, un cell-array de strings
de distinto largo que Octave concatena en un solo string en vez de dejarlo
como matriz) — en ambos casos el motor de presión terminó recibiendo P=0 en
silencio (sin error), así que el "presión min=max" reportado arriba en su
momento era en realidad solo el peso propio del relleno (`pesoEspecifico×Df`),
no una carga real. La geometría (área neta, centroide, conteo de puntos,
0 puntos indebidos) NO se vio afectada por este error — esos chequeos no
dependen de `Co`. La Etapa 4 repite esta misma prueba con el formato
correcto y una carga real (P=10 centrado) y confirma la presión esperada a
mano: ver [Etapa 4](etapa-4-validacion-cruzada.md).

## Hallazgo aparte (no era parte de esta etapa, se corrigió igual)

Al leer `zapatas2.m` de cerca para meter los huecos, se encontró que la
fórmula de presión (`ecuacion_de_flexion.m`, compartida con el viejo
`zapatas.m`) **nunca aplicaba el producto de inercia Ixy** — lo calculaba
pero no lo usaba en `k = P/A + Mx·y/Ix + My·x/Iy`. Es el mismo bug que ya se
había corregido del lado PHP (ver comentarios "producto de inercia Ixy...
puede salir hasta ~80% desviada" en `OctavePlotController.php`), pero
**nunca se había corregido en Octave** — es decir, producción (Linux) tenía
este bug activo para triángulos/trapecios no simétricos en `/zapatas2`.

Se corrigió con autorización explícita del usuario:

- `ecuacion_de_flexion.m` — nuevo parámetro `ixy` **opcional** (por defecto
  0), con la misma fórmula con acoplamiento que ya usaba PHP:
  `denom = Ixx·Iyy − ixy²`, `coefX = (M2·Ixx − M3·ixy)/denom`,
  `coefY = (M3·Iyy − M2·ixy)/denom`.
- `zapatas2.m` — ya no le aplica `abs()` a `IXY` (sí puede ser negativo de
  verdad, según en qué cuadrante está repartido el material) y ahora lo pasa
  a `ecuacion_de_flexion`.
- `zapatas.m` (el viejo `/cimentacion-v1`) se dejó **sin tocar** a propósito:
  nunca tuvo Ixy calculado en su flujo de entrada (recibe `A/Ixx/Iyy` ya
  calculados desde fuera, sin Ixy), no tiene rama Windows/PHP (siempre corre
  Octave, en ambos SO, o sea no había gap de paridad ahí), y está en la lista
  para retirarse en la Etapa 4 — no valía la pena meterle un fix a medias.

**Validación del fix de Ixy** (independiente de PHP, por derivación manual):
triángulo (0,0)-(6,0)-(2,4) → a mano: A=12, IX=32/3=10.6667,
IXY=−8/3=−2.6667. Octave real dio exactamente esos números. El caso
rectángulo (Ixy=0 esperado) dio los mismos min/max de presión antes y
después del fix — cero regresión en lo ya validado.

## Explícitamente fuera de esta etapa

- El **FEM shell** (momentos/cortantes, lo que usa el CAD principal) no sabe
  nada de huecos todavía — eso es la Etapa 2.
- El CAD **no manda huecos todavía** — `buildPoligonosStruct` los acepta pero
  nadie construye un `polygon.holes` real aún (Etapa 3).
- No se validó ningún caso con hueco contra ETABS (Etapa 4).
