# Etapa 2 — Huecos en el FEM shell (momentos/cortantes)

**Estado: ✅ parcial — zapata combinada (2+ columnas) completa; zapata
aislada (1 columna) explícitamente NO soportada, documentada como límite
conocido (ver sección final).**

## Objetivo

Que el cálculo por elementos finitos (el que usa el CAD principal para
momentos M11/M22/M12/MMax/MMin y cortantes V13/V23/VMax — distinto del
cálculo de presión de contacto de la Etapa 1) también excluya el material
dentro de un hueco.

## Por qué era mucho más simple de lo que parecía

`calcular_zapata_shell_poligono_combinada` (en `zapata_shell_solver_combinadas.py`)
ya generaba su malla element-por-elemento probando si el CENTRO de cada
elemento cae dentro del contorno real (`elemento_dentro(i,j)` →
`_punto_en_poligono`, ray-casting) — el mismo patrón que ya usan
`polygonGrid`/`elemento_dentro` en la Etapa 1. Solo hizo falta:

1. Recibir `huecos` (lista de contornos, mismo formato que `poligono`) como
   parámetro nuevo, opcional (`huecos=None` → comportamiento idéntico a
   antes).
2. `elemento_dentro(i,j)` ahora también devuelve `False` si el centro del
   elemento cae dentro de **cualquiera** de los huecos.

Con eso, el resto de la función no necesitó ningún cambio: los nodos que
solo tocarían elementos-hueco simplemente nunca entran a `node_map`, y la
extracción de curvatura (`w_en`/`w_en_real`) **ya sabía manejar nodos
faltantes** desde antes — el comentario original decía explícitamente *"None
si... esta fuera del dominio global O dentro de un hueco/notch interior"*
(ver [[project_zapata_shell_bug_borde_curvatura]] en la memoria del
proyecto: el bug de curvatura en bordes/huecos ya se había encontrado y
corregido antes, para el caso de un "notch" interior genérico — un hueco
real es exactamente ese mismo caso). Es decir: **la maquinaria numérica ya
estaba lista para huecos, solo faltaba la exclusión geométrica del
elemento.**

## Qué se cambió

### `python-backend/zapata_shell_solver_combinadas.py`

- `calcular_zapata_shell_poligono_combinada(..., huecos=None)` — nuevo
  parámetro. Se localizan los huecos al mismo sistema (`huecos_local`,
  restando `minX/minY`, igual que `poligono_local`).
- `elemento_dentro(i,j)` — descarta el elemento si su centro cae dentro de
  cualquier hueco (además del chequeo de contorno exterior que ya existía).
- La detección de columna dentro de una zona sin material (`"Columna en
  (...) cae fuera del contorno real..."`) **ya cubría el caso de una columna
  cayendo dentro de un hueco sin ningún cambio adicional** — si el nodo de
  esa columna no quedó en `node_map` (porque solo tocaba elementos-hueco),
  el chequeo existente ya lo rechaza con un mensaje claro. Verificado con un
  caso de prueba explícito.

### `python-backend/app.py` (`run_zapata_shell_poligono_combinada_design`)

- Nuevo campo de request `huecos`: `[[{x,y}, ...], ...]` (o `[[x,y],...]`),
  en las mismas coordenadas GLOBALES que `puntos`/`columnas`. Se parsea y se
  pasa tal cual a `calcular_zapata_shell_poligono_combinada`.

### `python-backend/app.py` (`run_zapata_shell_poligono_design`, la AISLADA)

- **No se implementó soporte de huecos aquí** (ver sección "Límite
  conocido" abajo). Se agregó un chequeo explícito: si el request trae
  `huecos`, el endpoint responde `success:false` con un mensaje claro en vez
  de ignorar el campo en silencio y devolver un resultado sin el hueco.

## Validación realizada (con OpenSeesPy real, vía venv)

Caso: losa 8×4 con 2 columnas alineadas en X (1.5,2.0) y (6.5,2.0), un hueco
interior lejos de ambas columnas.

- **Regresión (sin huecos)**: 1029 nodos con resultado, momentos por columna
  simétricos (43.86 en ambas, como corresponde a un caso simétrico) —
  comportamiento idéntico al de antes de este cambio.
- **Con hueco simétrico (centrado en x=4, mismo eje de simetría del
  problema)**: 1009 nodos (menos, como corresponde), **los momentos de
  ambas columnas siguen siendo idénticos entre sí** (42.21 y 42.21) — esto
  es una verificación de consistencia interna fuerte: si la exclusión
  hubiera sido asimétrica por error, esta simetría se habría roto.
- **Columna colocada deliberadamente dentro de un hueco**: lanza
  `ValueError` con el mensaje ya existente ("cae fuera del contorno real del
  polígono — no hay material ahí"), sin necesidad de código nuevo.
- **Endpoint completo (`app.py`, formato JSON real del request)**: probado
  de punta a punta con `huecos` en formato `{x,y}`, converge y da
  resultados razonables (momentos 42.40/42.43, ligeramente asimétricos
  porque en esta prueba el hueco no era perfectamente simétrico).
- **Endpoint aislado con `huecos`**: rechaza con el mensaje claro esperado.

### Nota sobre un artefacto de borde encontrado (no es un bug nuevo)

Al validar con un hueco cuyas coordenadas coincidían casi exactamente con
líneas de la malla (ej. borde del hueco en `y=2.5` cuando el centro de una
fila de elementos también cae en `y=2.5`), aparecieron 5 nodos que
técnicamente deberían haber quedado excluidos pero no lo fueron. Se
investigó a fondo: es un empate de punto-en-polígono (`_punto_en_poligono`,
ray-casting con desigualdad estricta `>`) — el mismo algoritmo que **ya se
usa desde antes** para el contorno exterior, no algo nuevo introducido por
esta etapa. Con un hueco en coordenadas "normales" (no alineadas
exactamente a una fila/columna de la malla), el resultado fue limpio (0
nodos indebidos). Es una característica preexistente del motor de geometría
compartido (afecta por igual al contorno exterior), de probabilidad muy
baja en un caso real, y no específica de huecos — no se tocó en esta etapa
por ser un problema más general y de alcance distinto.

## Límite conocido: zapata AISLADA (1 columna) con hueco — NO soportada

`calcular_zapata_shell_poligono_aislado` triangula "en abanico" desde el
primer vértice del polígono (`_poligono_generar_malla`), lo cual **requiere
que la forma sea convexa** (documentado en su propio docstring: *"valido
para poligonos convexos"*). Un hueco interior vuelve CUALQUIER polígono
no-convexo desde cualquier vértice-ápice — no hay forma de generalizar el
abanico actual para aceptarlo. Es la misma familia de limitación ya conocida
para zapatas aisladas en forma de T (polígono exterior no-convexo, sin
hueco siquiera) — ver la sección "Explícitamente fuera de esta etapa" en el
[README](README.md).

**Alternativa evaluada y descartada por ahora**: forzar una zapata aislada
(1 columna) con hueco a pasar por `calcular_zapata_shell_poligono_combinada`
(que sí soporta huecos), ya que esa función solo necesita un contorno +
lista de columnas, técnicamente aceptaría 1 sola columna. Se descartó
implementarlo en esta pasada porque:

- El endpoint combinado tiene un candado explícito (`len(columnas) < 2` →
  error) que habría que relajar solo para este caso, cambiando el contrato
  del endpoint sin un caso real que lo exija todavía.
- Esa función devuelve una estructura de salida distinta
  (`momentos_por_columna`, pensada para "envolvente entre columnas
  vecinas") que no tiene un caso de prueba real con 1 sola columna.
- No hay ningún caso real del cliente hoy que combine "aislada" + "hueco" —
  siguiendo el mismo criterio que el resto del proyecto (arreglar con
  evidencia real, no adelantarse a un caso hipotético), se deja
  documentado como pendiente en vez de implementarlo a ciegas.

Si aparece un caso real, la ruta más prometedora es esa (reusar el motor
combinado con 1 columna), no reescribir el triangulador en abanico para
soportar huecos directamente.

## Explícitamente fuera de esta etapa

- El **volado/Región D** (`_poligono_distancia_a_borde`, usado para
  cortante unidireccional y para decidir si el momento de diseño de una
  columna es confiable) sigue midiendo distancia solo contra el contorno
  EXTERIOR — no contra el borde de un hueco. Si una columna real queda muy
  cerca de un hueco, hoy no se detecta esa cercanía como "cerca de un borde
  libre" (el campo de momento crudo sí refleja el hueco correctamente vía
  la malla excluida; lo que no se ajusta es el criterio de diseño/envolvente
  por columna). Sin caso real que lo exija, se deja para cuando aparezca.
- El CAD **no manda huecos todavía** al endpoint combinado (Etapa 3).
- No se validó ningún caso con hueco contra ETABS (Etapa 4).
