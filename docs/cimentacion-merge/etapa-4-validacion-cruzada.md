# Etapa 4 — Validación (cruzada interna, sin ETABS todavía)

**Estado: 🟡 parcial a propósito.** El plan original era "validar contra
ETABS y luego retirar `/cimentacion-v1`/`/cimentacion-v2`". Jack no tiene
todavía un caso real de ETABS con una zapata recortada (hueco) para
comparar, así que **no se validó contra ETABS** (no se fabricó ni asumió
ningún número — mismo criterio de rigor que el resto del proyecto) **ni se
tocaron las rutas viejas**. En su lugar, a pedido explícito, se hizo una
**validación cruzada interna**: las 3 implementaciones independientes del
cálculo de huecos (PHP, Octave, Python/FEM) se compararon entre sí para el
mismo caso sintético, buscando errores de integración antes de tener el
caso real.

## Qué se comparó

Caso de prueba: cuadrado 4×4 con un hueco 1×1 centrado (área neta = 15),
columna centrada, P=10 (Tonf) puro (sin momento), Df=1.5, γe=1.8.

Valor esperado a mano (primeros principios, sin depender de ningún motor):

```
σ = P / A_neta + γe·Df = 10/15 + 1.8·1.5 = 0.666667 + 2.7 = 3.366667 Tonf/m²
```

(uniforme en toda la zapata, porque no hay momento — cualquier motor que dé
otra cosa tiene un bug).

### Motor 1 — PHP `/zapatas2` (Windows, calcularZapatas2EnPhp)

```
XC=2 YC=2  puntos=24000  presión min=max=3.3666666666667
```

**Hallazgo en el camino**: la prueba ORIGINAL de la Etapa 1 le había mandado
a `Co` expresiones con comillas de más (imitando por error el formato que
usa `zapatas2.m`, no el que realmente espera el endpoint PHP). Como
`parseOctaveMatrix($v, false)` no le quita las comillas a nada, y
`evaluateExpression` valida con una regex que no admite comillas, el motor
devolvía P=0 **en silencio, sin ningún error** — la "presión" que se
reportó en su momento en el doc de la Etapa 1 (2.7 = 2.7) era en realidad
solo el peso propio del relleno, no una carga real. Se corrigió (formato
`[Pm+Pv,MXm+MXv,MYm+MYv]`, sin comillas — el que realmente manda
`zapatas2Core.js::buildCoMatrix`) y el resultado coincide exacto con lo
esperado a mano.

### Motor 2 — Octave `zapatas2.m` (Linux, producción)

```
XC=2 YC=2  puntos=24000  presión min=max=3.36667
```

**Mismo hallazgo, mismo tipo de error, en la prueba original de esta
etapa**: `Co = eval(CoValue)` con `CoValue = "['a','b','c']"` (3 strings de
distinto largo entre comillas) NO da un cell-array en Octave — da un solo
string (concatenación de caracteres), y `Co(1,1)` termina siendo el código
ASCII del primer carácter. El resultado "funcionaba" (no tiraba error) pero
con números sin sentido físico — por suerte la comparación que se hizo en
su momento (antes/después del fix de Ixy) era una comparación de
IGUALDAD, no de valor absoluto, así que seguía siendo válida para lo que
se usó, pero no era una prueba de carga real. Corregido con el formato real
(`CoValue = "[pm+pv,mxm+mxv,mym+myv]"`, sin comillas, variables en
minúscula) — coincide exacto con PHP y con la mano.

### Motor 3 — Octave `zapatas.m` (viejo, `/cimentacion-v1`)

Arquitectura DISTINTA a los otros dos: no calcula A/Ixx/Iyy del polígono —
los recibe ya calculados como parámetros (`zapatas(A, Ixx, Iyy, Df, ...)`).
Se le pasaron a mano los valores netos (exterior menos hueco, shoelace por
separado):

```
Ix0_exterior = Iy0_exterior = 4·4³/12 = 21.33333
Ix0_hueco    = Iy0_hueco    = 1·1³/12 = 0.08333
Ix_neto = Iy_neto = 21.33333 - 0.08333 = 21.25  (mismo centroide en ambos, no hace falta eje paralelo)
```

```
puntos=24000  combo 1 (Pm+Pv): min=max=3.366667
```

**Hallazgo en el camino**: el primer intento usó un polígono "lejos" como
relleno para los 5 slots `poligonoInterior2..5` que no se usan en este
caso (solo hay 1 hueco real) — `zapatas.m` calcula el bounding box de la
malla tomando el min/max de **todos** los polígonos juntos (exterior +
los 5 interiores), así que un relleno lejano (ej. x=1000) dispara ese
bounding box a un tamaño absurdo y deja solo 1 punto real cayendo dentro
de la zapata verdadera (de 320 totales, casi todos se desperdician en el
vacío entre 4 y 1000). Corregido con arrays vacíos (`zeros(2,0)`) para los
slots sin usar — mismo criterio que usa el frontend real
(`adm_zapatas_grafico.js`) cuando el ingeniero no llena esas filas de la
hoja de cálculo. Con el fix, da exactamente los mismos 24000 puntos que
los otros 2 motores y el mismo valor de presión.

### Motor 4 — Python/OpenSeesPy (FEM `poligono_combinada`, Etapa 2)

Arquitectura completamente distinta a los 3 anteriores (elementos finitos,
no P/A±Mc/I) — no tiene sentido comparar un valor puntual de presión contra
un campo de momento. Se comparó lo que SÍ es comparable entre ambas
familias de método: el **equilibrio estático**. Con la misma presión
uniforme validada arriba (q=3.366667) aplicada como carga sobre el mismo
hueco (esta vez con 2 columnas, requisito de esta función):

```
Suma de reacciones verticales (ops.reactions() + ops.nodeReaction): 50.5000
q × área_neta (15, shoelace independiente): 50.5000
Diferencia: 0.0000%
```

Es decir: la malla de elementos finitos, con el hueco excluido
(`elemento_dentro`, Etapa 2), contiene exactamente la misma cantidad de
material (área) que calculan independientemente los otros 3 motores por
shoelace — confirmado por equilibrio de fuerzas (ninguna carga se "pierde"
ni se "inventa" por un error de malla), no asumido.

## Conclusión de esta etapa

Las 4 implementaciones (2 de producción — PHP/Octave — más la vieja de
`/cimentacion-v1`, más el FEM) coinciden exactamente entre sí para el mismo
caso con hueco, con 3 metodologías de comparación distintas (presión
puntual, conteo de puntos, equilibrio de fuerzas). Esto da confianza en que
la INTEGRACIÓN entre motores (Etapas 1-3) no tiene errores de traducción
de datos entre lenguajes/formatos — pero **no reemplaza una validación
contra ETABS real**: los 4 motores podrían compartir un mismo error
conceptual (ninguno de estos 4 números depende de si el modelo físico del
hueco es correcto, solo de si el ÁREA se descontó bien). Queda
explícitamente pendiente.

## Explícitamente NO hecho en esta etapa

- **Validación contra ETABS** — bloqueada por falta de un caso real
  (confirmado con Jack). Cuando exista, debe seguirse el mismo rigor que
  el resto del proyecto: tabla cruda ("Element Forces - Area Shells" /
  "Joint Reactions"), nunca el hover.
- **Retiro de `/cimentacion-v1` y `/cimentacion-v2`** — explícitamente NO
  se tocó, a pedido de Jack, precisamente porque el plan original condiciona
  esto a la validación contra ETABS (todavía pendiente). Las 2 rutas siguen
  activas y sin cambios de comportamiento para sus usuarios actuales.
