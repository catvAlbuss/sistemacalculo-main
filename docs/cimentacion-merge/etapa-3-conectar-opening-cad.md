# Etapa 3 — Conectar el `opening` del CAD al pipeline de zapatas

**Estado: ✅ completa para presión de contacto y FEM de losa 2D (combinada);
documentada como gap conocido para aisladas y vigas rectas/L simples
(método rígido) — ver "Alcance" más abajo.**

## Objetivo

Que un `opening` (área tipo hueco, mismo tipo que ya usan losas/muros para
aberturas — `cad_sys.js:openingDrawingState`) dibujado ENCIMA de una zapata
en el CAD se detecte automáticamente y se mande como hueco a los cálculos,
sin que el ingeniero tenga que hacer nada más que dibujarlo.

## Qué se cambió

### 1. Detección (`resources/js/cad/engine/foundationContract.js`)

- `findOpeningsInPolygon(openings, polygonPoints)` (nuevo) — un `opening` se
  considera hueco de una zapata si **todos** sus vértices caen dentro (o
  justo sobre el borde — reutiliza el `pointInPolygon` ya existente, que ya
  es inclusivo de borde/vértice) del polígono de la zapata. Un opening que
  solo se solapa a medias (mitad afuera) se ignora, en vez de adivinar qué
  parte cuenta.

### 2. `resources/js/cad/mixins/analysis/foundation.js` (`calculateZapatas`)

- Se recolectan los `openings` del nivel actual (mismo `this.areas` que ya
  se usa para las zapatas) una sola vez.
- Por cada zapata (ya fusionada por grupo — ver `groupConnectedZapatas`,
  la detección corre sobre el polígono FUSIONADO, no pieza por pieza, así
  que un opening dibujado sobre cualquier parte del grupo se detecta igual
  de bien), se calculan sus huecos y se guardan en `footingsMeta[i].holes`
  ( `[{x,y},...]` por hueco, coordenadas GLOBALES).
- El objeto que arma el payload de `/zapatas2` (`polygons.push({closed,
  nodes, holes})`) ahora incluye `holes` en el formato que
  `buildPoligonosStruct` (Etapa 1) ya esperaba — la presión de contacto
  descuenta el hueco para **cualquier** zapata, sin importar su forma o
  cantidad de columnas (Etapa 1 no tenía esa restricción).
- La llamada a `fetchZapataShellPoligonoCombinadaDesignReference` (losa 2D
  con FEM, 2+ columnas, forma compleja) ahora manda `huecos: meta.holes`.
- Aviso único (`this.showMessage(..., "warning")`, mismo mecanismo de toast
  que ya usa el resto de esta función) si hay una o más zapatas con hueco:
  explica que la presión SIEMPRE lo descuenta, pero el momento/cortante
  solo lo refleja en la losa 2D con FEM — evita rastrear rama por rama cuál
  cálculo específico corrió para cada zapata (rígido vs. FEM), que hubiera
  sido mucho más frágil de mantener.
- Para las zapatas que sí pasan por el FEM 1-columna (`shellDesignPromises`,
  rectangular o poligonal convexa), se agrega además una advertencia
  puntual en `shellMomentReference`/`shellShearReference` (mismo campo que
  ya lee el modal de resultados) si esa zapata en particular tiene un
  hueco, aclarando que ESE cálculo específico no lo soporta (ver Etapa 2).

### 3. `resources/js/cad/engine/zapataShellDesign.js`

- `fetchZapataShellPoligonoCombinadaDesignReference` acepta un nuevo
  parámetro `huecos` y lo reenvía en el body JSON — acepta tanto arrays
  planos (`[{x,y},...]`, lo que realmente manda `foundation.js`) como
  objetos `{points|nodes:[...]}`, por si algún llamador futuro prefiere ese
  formato (mismo criterio flexible que ya usa `buildPoligonosStruct` del
  lado de `/zapatas2`).

## Por qué el renderizado (`zapataMomentLayer.js`/`zapataPressureLayer.js`)
## NO necesitó ningún cambio

Se revisó a fondo `renderer.js` (`drawZapataPressureLayer`/
`drawZapataMomentLayer`) antes de asumir que hacía falta tocar algo:

- El **pintado de color** dibuja un cuadradito por cada punto REAL que
  devuelve el backend (`bins.forEach(({points}) => points.forEach(...
  path.rect(...))`)) — no interpola ni triangula entre puntos. Como los
  puntos dentro de un hueco simplemente no existen en la respuesta (Etapas
  1/2 ya los excluyen), el hueco queda automáticamente sin pintar, sin
  necesidad de recortar nada extra.
- El **hover** (`lookupGridIndex`, modo `"grid"`) busca por coincidencia
  EXACTA de celda (`cells.get('col,row')`), sin vecino más cercano ni
  tolerancia de distancia — si el cursor está sobre un hueco, no hay
  ninguna celda ahí y la búsqueda devuelve `null` (sin tooltip), en vez de
  "alcanzar" por error un punto real del otro lado del hueco.

Es decir: la arquitectura ya construida en fases anteriores (nube de puntos
dispersa + índice de coincidencia exacta, sin asumir grilla completa) ya
era compatible con huecos sin saberlo — se confirmó con lectura de código,
no se asumió.

## Validación realizada

- `findOpeningsInPolygon`: 4 casos (opening completamente dentro, opening
  parcialmente afuera, opening lejano, opening tocando el borde) — los 4
  clasificados correctamente (dentro/fuera) contra un rectángulo de
  prueba.
- `buildPoligonosStruct` con el formato EXACTO que arma `foundation.js`
  (`{closed:true, nodes:[...], holes:[{closed:true, nodes:[...]}]}`) →
  genera `struct('poligono1', [...], 'poligono1_hueco1', [...])` correcto.
- Normalización de `huecos` en `fetchZapataShellPoligonoCombinadaDesignReference`
  (array plano, `{nodes}`, `{points}`) → los 3 formatos se aplanan al mismo
  resultado.
- Toda la cadena backend (Etapas 1/2) ya estaba validada con OpenSeesPy/PHP/
  Octave reales — esta etapa solo prueba la plomería del lado del CAD
  (JS puro, sin canvas/DOM), que es lo que realmente cambió aquí.

## Alcance / gaps heredados

- **Zapata aislada (1 columna) con hueco**: la presión SÍ lo descuenta; el
  momento/cortante FEM NO (Etapa 2, límite conocido de la malla en
  abanico) — se avisa explícitamente en el modal para esa zapata en
  particular. Sigue siendo el único gap real (ver el resuelto abajo).
- No se agregó un contorno visual propio para el hueco en la capa de
  presión/momento (hoy se ve como un "vacío" sin resaltar, el opening ya
  tiene su propio dibujo base en otra capa del CAD) — mejora estética
  pendiente, no funcional.
- No se validó ningún caso con hueco contra ETABS (Etapa 4).

### RESUELTO (después de probar en vivo): viga recta/L simple con hueco

Jack probó el flujo completo y confirmó con una captura real: la presión sí
reflejaba el hueco (gap visible en el mapa), pero el Diagrama de
Resultantes/Mu de una zapata combinada con columnas alineadas (caso
"simple", resuelto antes por el método rígido) mostraba la zapata como si
no tuviera ningún recorte. Preguntó, con buen criterio, si esto también le
pasaría a ETABS.

**Respuesta**: no — ETABS siempre resuelve con una malla de elementos
finitos real, sin importar si la zapata es "simple" o "compleja" según
nuestra clasificación, así que un opening ahí distorsiona el campo de
momento/cortante en cualquier caso. La brecha era nuestra:
`computeCombinedFootingMoments` (el método rígido de viga continua, una
fórmula cerrada sin malla) nunca tuvo forma de representar un hueco — no
es que ETABS comparta esta limitación, es que nosotros usamos ese atajo
analítico más barato para el caso "simple" y ese atajo no tiene ningún
elemento que excluir.

**Fix** (`resources/js/cad/mixins/analysis/foundation.js`): justo después
de calcular `combinedMoments`, si la zapata tiene huecos Y el método
rígido la hubiera resuelto como caso simple (`supported:true`), se
sobreescribe a `{supported:false, reason:"branching"}` — el mismo sentinel
que el código de más abajo ya revisaba para decidir entre el FEM en L y el
FEM de polígono combinado. Como una viga recta no tiene ningún vértice
reflejo, `computeLFootingGeometry` devuelve `null` para ella y el flujo cae
directo al FEM de losa 2D (`poligono_combinada`, con `huecos` ya
conectado desde este mismo archivo) — sin necesidad de tocar
`footingMoments.js` ni el propio FEM. Bloques 5/6 (acero/cortante) para
ese caso ya estaban resueltos por ese mismo camino (usado desde antes para
triángulos/pentágonos/cuadrículas 2D) — no fue necesario escribir lógica
nueva ahí, solo enrutar más casos hacia código ya validado.

El aviso general se actualizó para reflejar esto: ahora solo avisa sobre
zapatas AISLADAS con hueco (el único gap que queda), ya no menciona vigas
rectas/L simples (esas ya están cubiertas).
