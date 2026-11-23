# Plan de Entrenamiento del Agente NovaCad — 15 Módulos

## Semejanza REAL del dibujo (plan adaptado de PREDIAL AI, 19-nov)

Los porcentajes de más abajo miden **criterios de decisión**, no el dibujo. La métrica del dibujo es
`node scripts/agente/evaluar-dibujo.mjs [--png carpeta]`: superpone cada planta del agente sobre la
del ingeniero (alineadas por los ejes) y mide qué líneas coinciden a 10 cm (F1 de precisión y
exhaustividad; sin textos, cotas, achurados ni marcos). Línea base (15 módulos, 38 plantas):

| Planta | Semejanza de dibujo |
|---|---|
| Cimiento corrido | 80 % |
| Tabiquería | 78 % |
| Losa | 54 % |
| Cimentación / platea | 43 % |
| **Global** | **61 %** |

Plan para llegar a 90–95 % de dibujo (ver `docs/agentes/plan_sistema_lectura_planos_prediales.md`):
1. ✅ Métrica confiable de dibujo (`evaluar-dibujo.mjs`; el generador informa dónde dibujó cada planta).
2. ✅ Inventario ESTRUCTURAS-CAD-JSON de los 30 DWG (`inventario-cad.mjs`, esquema en
   `docs/agentes/esquema-cad-json.md`): entidades con su id del DWG, en metros y referidas a ejes.
   Falta: pórticos y cuadros (sin grilla cruzada no son "vista") y cotas/achurados.
3. ✅ Clasificador de entidades (`lectura/clasificador.js`, por capa y por geometría, con evidencia;
   `clasificar-inventario.mjs --png` deja la clase en el inventario y una imagen por planta para
   revisión). La métrica mide ahora por elemento (`evaluar-dibujo.mjs`: qué falta y qué sobra).
   Primeras recetas aplicadas con datos: estilo de platea aprendido y consultado (malla completa en
   M4, M6, M7, M8, M11; bastones en M1, M2, M3, M5, M10…), sin cimiento corrido repetido en la
   platea, columnetas en la cimentación, maciza dibujada con trazos. Medida al cierre:
   cimentación 54 %, cimiento 77 %, losa 58 %, tabiquería 76 % (dibujo estructural);
   **global 65 %** (todo lo dibujado 67 %; por elemento 41 %).
4. ⬜ Aprender la receta de cada elemento (de qué nace en la arquitectura y cómo se dibuja) y
   dibujar con ella; diferencias ya vistas: el agente rellena la platea con malla (el ingeniero
   no), zapatas y cimientos con otro tamaño, viguetas distintas.
5. ⬜ Medir por elemento en módulos y proyectos no vistos. 6. ⬜ Corrección por elemento en el panel.

## Estado medido al 19 de noviembre de 2026

Medido con los 15 pares del despacho (arquitectura + estructuras + metrado de VINCHOS). Es
transferencia entre módulos de **un mismo proyecto**: no prueba todavía que generalice a
proyectos de otros despachos.

| Métrica (15 módulos) | 18-nov | 19-nov |
|---|---|---|
| Columnas leídas donde el ingeniero las puso (F1 por cruce de ejes) | ~55 % | **96.2 %** |
| Misma sección que el ingeniero (±5 cm) | ~46 % | **84.5 %** |
| Placa o columna igual que el ingeniero | — | **93.3 %** |
| Módulos que la herramienta genera sin fallar | 15/15 | 15/15 |
| Cimentación igual que el ingeniero | 11/15 | **15/15** |
| Puntaje de semejanza (7 criterios: lectura, sección, pórticos, cimentación, maciza, escalera, sin fallas) | 88.0 % | **91.4 %** |

Qué cambió (todo general, nada específico de un módulo):

- **Lector** (`lectura/lectorPlano.js`): columnas en capas de muros si caen en el cruce
  (módulo 1); descarta "columnas" que son ambientes (rectángulo con lado corto > 1 m);
  burbujas de eje por bloque "EJE" en cualquier capa, rótulo fuera del círculo (módulos 6 y 9),
  doble prima (Z´´), burbuja corrida con bandera diagonal (módulo 9), y ejes sin trazo que no se
  unen a través del hueco entre dos plantas.
- **Aligerado** (`planos/aligeradoPlano.js`): en grillas de varias celdas, un paño por celda
  entre vigas, viguetas en la luz corta, celda con escalera abierta (aspa) y celda con baños en
  losa maciza, como el ingeniero; las casetas de una celda siguen con cumbrera (módulo 14).
- **Vigas** (`planos/cimentacionPlano.js`): siempre paralelas al eje (antes salían inclinadas
  entre una L de esquina y una T).
- **Pórticos** (`laminas/laminasPlantilla.js`): los de dibujo idéntico se dibujan una vez y el
  aviso dice cuáles son iguales (el metrado sigue con todos).
- **Criterios** (`criterios/criteriosEstructurales.js`, `aprendizaje/casos.js`): aligerado por
  luz libre (0.20 hasta 5.5 m libres); placa si el ala larga ≥ 4 espesores; cimentación: varios
  niveles → platea, un nivel ≥ 60 m² → zapatas, un nivel chico → platea. Una regla que explica
  ≥ 8 casos sin excepción se **dibuja** como propuesta y queda marcada para que el ingeniero la
  confirme (con un solo proyecto no se cuenta como decisión autónoma).

Cómo repetir la medición (los DWG quedan en `storage/app/private/entrenamiento/`, fuera de git):

```bash
node scripts/agente/volcar-planos.mjs          # caché de los 30 DWG (una vez, ~2 min)
node scripts/agente/evaluar-lectura.mjs --detalle
node scripts/agente/evaluar-generacion.mjs     # informe en entrenamiento/evaluaciones/
node scripts/agente/aprender-pares.mjs         # regenera casosAprendidos.js
node scripts/agente/ver-dwg.mjs "<plano.dwg>" <carpeta>   # PNG por vista para comparar a ojo
```

### El agente consulta al ingeniero (19-nov)

Antes de dibujar, `plano_estructuras` arma las **consultas de experto** (`agente/consultas.js`):
solo lo que no tiene seguro (cimentación, losa maciza en baños detectados por ejes, losa en el
último nivel con varios niveles, espesor cuando la luz libre pasa de 5 m), cada una con opciones,
la recomendación marcada y el porqué. En el panel salen en el mismo formulario de datos
("Decisiones del ingeniero"); lo elegido se dibuja y se guarda como aprendizaje (confirmación o
corrección, pendiente de aprobación en el servidor). Sin panel, se dibuja con la recomendación y
la respuesta del chat dice qué confirmar. "¿Por qué platea?" va directo a `proponer_estructura`.
Los avisos técnicos internos del aprendizaje geométrico ya no se le muestran al ingeniero
(quedan en `revisionInterna`).

### Planos pesados

El tiempo está en abrir el DWG, no en el análisis del agente (< 0.5 s incluso en el módulo 6):

| Plano | Tamaño | Abrir DWG | Memoria |
|---|---|---|---|
| Módulo 6 arquitectura | 19.5 MB | 15.6 s | ~0.9 GB |
| Módulo 7 arquitectura | 11.8 MB | 10.2 s | ~0.7 GB |
| Módulo 5 arquitectura | 8.0 MB | 7.4 s | ~0.45 GB |

El módulo 6 trae 12 340 definiciones de bloque y usa 136 (177 150 objetos, 6 544 en el dibujo). El
diagnóstico al abrir el plano (`lectura/diagnostico.js`, `pesoDelDibujo`) avisa "Plano pesado" con
el arreglo en AutoCAD (-PURGE todo anidado, AUDIT, o WBLOCK de las plantas). Medir con
`node scripts/agente/perfil-plano.mjs "<plano.dwg>"`.

### Detalle completo por nivel (19-nov, tarde)

| Criterio (15 módulos) | Resultado |
|---|---|
| Columnas en su cruce (F1) | 97.2 % |
| Losa en el último nivel como el ingeniero | 15/15 |
| Losa maciza como el ingeniero | 15/15 (el 3 dibuja el descanso en maciza sin rótulo) |
| Niveles con plano de tabiquería | 100 % en 7 de 9 edificios de varios niveles |
| Puntaje de semejanza (9 criterios) | **95.4 %** |

- **Losas por nivel:** "LOSA ALIGERADA 1° Y 2° PISO" (entrepisos) y "LOSA ALIGERADA TECHO"
  (sin vacío de escalera). Varios niveles → losa en el último (9 de 9 edificios). Un nivel →
  se pregunta (losa o solo cobertura liviana: módulos 7, 12 y 13 sin losa) y se dibuja sin
  aligerado si es cobertura.
- **Tabiquería por nivel** (`planoTabiqueria`): muros del nivel con sus vanos, columnas y
  columnetas con los mismos códigos (pa, pb…) del cimiento corrido; niveles casi iguales en un
  solo plano ("2° Y 3° PISO"). Sin peldaños (detector de escaleras: trazos o huellas
  rectangulares paralelas, regulares a 0.20–0.35 m).
- **Láminas extra E-0X:** marco y rótulo de la plantilla, hasta tres planos por lámina.
- **Volado** (`voladosDesdePlanta`): barandas del 2° nivel más allá de las columnas → la losa se
  extiende, un paño por vano, vigas "V VARIABLE" y viga de borde "VCH(20x20cm)"; los ejes pasan
  el borde.
- **Escalera:** huella por sus peldaños (tramos vecinos = escalera en U, descanso de 1.20); en la
  losa solo esa parte queda vacía y el resto de la celda es maciza (hall o descanso). Texto
  "escalera" o peldaños; "descanso" solo no basta (módulo 4).
- **Detalle de escalera** (`planos/escaleraPlano.js`, 1/25): contrapasos por la altura de
  entrepiso (≤ 0.175), paso de la arquitectura, garganta L/25 ≥ 0.15, acero Ø1/2"@0.20,
  negativos Ø3/8"@0.20, transversal Ø3/8"@0.25 (predimensionado: confirmar).
- **Losa maciza:** baños en maciza solo en losas de entrepiso (hay baños encima); en un nivel la
  losa es techo y va aligerada (módulo 8). Cisternas y tanques siempre en maciza (módulo 15).
- **Metrado:** partidas del despacho 02.03.12 (losa maciza; acero con el ratio de sus planillas)
  y 02.03.13 (escaleras, del corte del detalle); el aligerado ya no cuenta la maciza ni vacíos.
- **Aprendizaje:** las plantas de losa del ingeniero se leen con cualquier estilo de título
  ("1°-2° PISO", "1° Y 2°", "TECHO", "TECHO 2º PISO"); un nivel sin plantas de losa = cobertura.

### Aprende patrones y se mide con lo que no vio (19-nov, noche)

**Medición honesta.** `evaluar-generacion.mjs` deja fuera de los casos el módulo evaluado
(`--fuera-proyecto`: todo su proyecto; `--con-propio`: como antes, optimista). Con los 15 módulos
de VINCHOS, dejando fuera cada módulo: **95.4 %**; decisiones acertadas en casos no vistos: 86 %.

**Cómo decide el agente** (`aprendizaje/casos.js`, `aprendizaje/patrones.js`), de más a menos peso:
1. lo que el especialista corrigió (en este plano o en uno parecido);
2. una regla de experto que explica **todos** los casos donde aplica (≥ 6): validada con 3 proyectos
   la decide solo; con menos, la propone y pide confirmación; si un proyecto nuevo la contradice,
   deja de usarse sola;
3. un **patrón aprendido**: árbol de hasta 3 preguntas sobre rasgos de la arquitectura (niveles,
   área, luz, placas, cobertura anotada, falso cielo, uso deportivo, cisterna, baños), solo si
   acierta ≥ 75 % en casos que no vio y supera a "decir siempre lo más común"; se aprende en el
   mismo contexto que el plano (si una regla cubre los de varios niveles, el patrón se aprende
   con los de un nivel);
4. los casos más parecidos.
Los umbrales (por ejemplo, el área para zapatas) salen de los datos y cambian con cada proyecto.

**Incorporar un proyecto nuevo** (25, 27, 30 módulos…):

```bash
# copiar sus DWG y metrados a storage/app/private/entrenamiento/estructuras/<proyecto>/
node scripts/agente/entrenar-proyecto.mjs <proyecto>            # revisa el emparejamiento
node scripts/agente/entrenar-proyecto.mjs <proyecto> --aplicar  # entrena y mide sin haberlo visto
```

Empareja por número de módulo ("MÓDULO 4", "MODULO IV", "M-04", "4.") arquitectura (ARQ…),
estructura (EST…) y metrado; lo dudoso (dos versiones, falta un archivo) se informa y no entra.
Probado de punta a punta con un proyecto de prueba de nombres distintos: 95.8 % sin haberlo visto.

**Respuesta concisa.** El chat muestra 3 líneas (láminas, cimentación/losa/escalera, columnas y
pórticos), lo que el especialista debe confirmar y como mucho 3 avisos. Los casos aprendidos se
nombran "módulo 01 estudiado", nunca con el proyecto del cliente.

Pendiente (lo que más falta para el detalle "como el ingeniero"):

1. Tabiquería del 1° nivel cuando el ingeniero la dibuja aparte (módulos 4 y 6) y títulos de
   arquitectura mal numerados (módulo 5: dos plantas "Tercer nivel").
2. Pórticos: el ingeniero no es consistente al omitir los repetidos (2x2: 4 en M14/M15, 2 en
   M12/M13).
3. Medir el dibujo superpuesto al del ingeniero (F1 geométrico por elemento), no solo criterios.
4. El formulario "Decisiones del ingeniero" compila y lo prueba el flujo de punta a punta, pero
   falta verlo abierto en el panel real (public/build tiene cambios de otra sesión).

## 1. Diagnóstico: Por qué el plano del módulo 1 no se parece

El agente hoy solo sabe dibujar **lo que aprendió del módulo XIV**. Estos son los problemas concretos cuando enfrenta un plano distinto:

| Problema | Por qué ocurre | Impacto |
|----------|----------------|---------|
| **Solo 1 nivel.** El agente no dibuja pisos intermedios, losas de entrepiso ni pórticos de varios niveles | El módulo XIV tiene un solo nivel; las herramientas asumen 1 piso | El módulo 1 tiene 3 niveles → el agente genera 1 solo nivel |
| **Clasifica mal placas vs columnas** | La regla PL/CT/C se calibró con un solo expediente | Concreto repartido: −59 % placas, +71 % columnas |
| **Losa de techo en vez de losa de entrepiso** | El módulo XIV lleva cobertura liviana (aluzinc); el agente no sabe cuándo un edificio lleva losa en el último nivel | El módulo 1 lleva losa en el techo (175 m²) |
| **Espesor de aligerado errado** | El agente usa 0.30 (luz > 5 m), pero el despacho usa 0.20 en ese caso | Error de volumen de concreto y ladrillo |
| **Sin losa maciza parcial** | No sabe que baños y pasadizos llevan losa maciza (28 m², e = 0.25) | Falta una partida completa |
| **Acero de vigas −47 %** | No conoce el criterio "simil 2" (dos vigas en ejes largos) | Metrado de acero muy bajo |
| **Sin VSa en edificios de varios niveles** | La viga solera aparece solo con cobertura liviana | Falta estructura en los vanos |
| **Canaleta y correas ausentes** cuando hay losa de techo | Solo las dibuja con techo a dos aguas | Faltan elementos |
| **Plantilla de láminas de un solo expediente** | La plantilla tiene espacios para E-01 y E-02 del módulo XIV; un edificio de 3 niveles necesita más láminas y más pórticos | Los dibujos no entran o se superponen |
| **Ejes, capas y colores del despacho del módulo 14** | El módulo 3 usa capas distintas (`eje`, `1_COTAS EXTERIORES`, radio 0.24) | El agente no encuentra los ejes ni los elementos |

**Raíz del problema:** El agente se entrenó con **1 tipo de proyecto** y se prueba con **otro tipo completamente distinto**. La solución no es corregir caso por caso, sino sistematizar el aprendizaje con los 15 módulos para que las reglas sean generales.

---

## 2. Los 15 módulos como corpus de entrenamiento

### 2.1 Clasificación de módulos por tipo

Antes de entrenar, hay que clasificar los 15 módulos por las variables que cambian de uno a otro. Esto se hace con el script existente:

```bash
# Para cada módulo:
node scripts/agente/leer-arquitectura.mjs <modulo-N-arquitectura.dwg>
node scripts/agente/aprender-expediente.mjs <modulo-N-estructuras.dwg> modulo-NN
```

| Variable | Valores posibles | Qué módulos los tienen |
|----------|-----------------|------------------------|
| **Niveles** | 1, 2, 3+ | Catalogar cada módulo |
| **Uso** | Aula, SS.HH., inicial, vivienda, administración, comedor, laboratorio | Catalogar |
| **Cimentación** | Platea, zapatas aisladas, zapatas corridas, mixta | Catalogar |
| **Techo** | Cobertura liviana (aluzinc), losa aligerada, losa maciza | Catalogar |
| **Losa** | Aligerada (e=20, 25, 30), maciza, mixta | Catalogar |
| **Columnas** | Simples, L, T, placas | Catalogar |
| **Escala del plano** | 1/25, 1/50, 1/75 | Catalogar |
| **Estilo de capas** | Despacho A (módulo XIV), Despacho B (módulo 03) | Catalogar |

### 2.2 Pares de entrenamiento: arquitectura → estructuras

Cada módulo tiene dos archivos DWG:
1. **Arquitectura** — lo que el agente recibe (input)
2. **Estructuras** — lo que el agente debe generar (output esperado)

```
storage/app/private/entrenamiento/estructuras/
├── modulo-01/
│   ├── arquitectura.dwg      ← Input del agente
│   ├── estructuras.dwg        ← Referencia del ingeniero
│   └── metrado.xlsx           ← Metrado de referencia
├── modulo-02/
│   ├── arquitectura.dwg
│   ├── estructuras.dwg
│   └── metrado.xlsx
├── ...
└── modulo-15/
    ├── arquitectura.dwg
    ├── estructuras.dwg
    └── metrado.xlsx
```

---

## 3. Arquitectura del Entrenamiento

### 3.1 El entrenamiento NO es del modelo, es de las herramientas

> El modelo (Ollama/Claude/Codex) **no aprende**. Lo que aprende es el **código determinista** de las herramientas (skills). El modelo solo elige qué herramienta usar y qué argumentos pasarle.

```
┌────────────────────────────────────────────────────┐
│          LO QUE APRENDE (código + datos)           │
├────────────────────────────────────────────────────┤
│ criteriosEstructurales.js    ← Reglas de diseño    │
│ conocimiento.js              ← Memoria del agente  │
│ referenciaDespacho.js        ← Rangos de metrados  │
│ estiloLaminas.js             ← Capas y colores     │
│ estructuraPlano.js           ← Skill de dibujo     │
│ expedientes/*.json           ← Casos aprendidos    │
│ plantillas/*.dxf             ← Templates de lámina │
└────────────────────────────────────────────────────┘
          ↑ Entrenamiento                     
          │ (scripts/agente/*)               
          │                                  
┌─────────┴──────────────────────────────────┐
│          LO QUE NO APRENDE (el modelo)     │
├────────────────────────────────────────────┤
│ Ollama / Claude / Codex                    │
│ → Entiende el pedido                       │
│ → Elige la herramienta                     │
│ → Pasa los argumentos                      │
│ → Redacta la respuesta                     │
└────────────────────────────────────────────┘
```

### 3.2 Pipeline de entrenamiento por módulo

```
Módulo N (arquitectura + estructuras + metrado)
        │
        ├─→ [1] aprender-expediente.mjs
        │       → expedientes/modulo-NN.json (estilos, criterios, planos)
        │
        ├─→ [2] aprender-metrados.mjs
        │       → referenciaDespacho.js (rangos por partida)
        │
        ├─→ [3] leer-arquitectura.mjs
        │       → Verifica qué entiende: vistas, ejes, columnas
        │
        ├─→ [4] probar-laminas.mjs
        │       → Genera láminas y compara visualmente
        │
        ├─→ [5] comparar-metrado.mjs
        │       → ±5% y ±15% por partida
        │
        └─→ [6] Actualizar reglas
                → criteriosEstructurales.js (lo que se repite)
                → datosProyecto.js (lo que cambia)
                → Nuevas decisiones en proponer_estructura
```

---

## 4. Plan de Fases

### Fase 0 — Catalogar los 15 módulos (1 semana)

**Qué:** Correr `aprender-expediente.mjs` en los 15 módulos y llenar la tabla de clasificación.

```bash
# Para cada módulo 1-15:
node scripts/agente/aprender-expediente.mjs <modulo-N-estructuras.dwg> modulo-NN
node scripts/agente/aprender-metrados.mjs <planillas.xlsx>
```

**Entregable:** `docs/agentes/agente-predim/conocimiento/catalogo-15-modulos.md` con:

```markdown
| Módulo | Uso | Niveles | Área | Cimentación | Techo | Losa | Columnas | Capas |
|--------|-----|---------|------|-------------|-------|------|----------|-------|
| 01     | Aula | 3 | 450 m² | Zapatas | Losa | Alig.20+maciza | L,T,PL | Desp.B |
| 02     | ... | ... | ... | ... | ... | ... | ... | ... |
| ...    | ... | ... | ... | ... | ... | ... | ... | ... |
| 14     | Caseta | 1 | 9 m² | Platea | Aluzinc | Alig.20 | L | Desp.A |
| 15     | ... | ... | ... | ... | ... | ... | ... | ... |
```

**Criterio de cierre:**
- Los 15 expedientes están en `conocimiento/expedientes/`
- `resumen-expedientes.md` actualizado con 15 columnas
- Tabla de clasificación completa

---

### Fase 1 — Lectura universal de planos (2 semanas)

**Problema:** El agente no puede leer planos con estilos de capas diferentes al módulo XIV.

**Qué:** Hacer que `leer_estructura` y `vistas_plano` funcionen con **cualquier estilo de capas**.

| Tarea | Detalle |
|-------|---------|
| **Multi-capa para ejes** | Hoy busca `49. EJES.`; debe buscar en `eje`, `49. EJES.`, `EJES`, o cualquier capa que contenga "eje" | 
| **Multi-capa para columnas** | Hoy busca capa `0` color 5; debe buscar en `0`, `COLUMNAS Y PLACAS`, `P-Columnas-existentes` |
| **Multi-radio de burbuja** | Módulo XIV = 0.48; módulo 03 = 0.24 |
| **Cotas multi-estilo** | `ROMAN50` vs `1-50 EXTERIORES` |
| **Título de vista flexible** | No depender del formato exacto del texto del título |
| **Columnas de varios tipos** | Aceptar L, T, placas, columnas simples, polígonos irregulares |
| **Detectar número de niveles** | Leer N.F.T., NPT de varios pisos, o contar plantas distintas |

**Test:** `node scripts/agente/leer-arquitectura.mjs <modulo-N.dwg>` debe reportar correctamente ejes, columnas y vistas para los 15 módulos.

**Criterio de cierre:**
- 15/15 módulos: ejes correctos
- 15/15 módulos: columnas detectadas (tipo, posición, forma)
- 15/15 módulos: vistas identificadas

---

### Fase 2 — Decisiones inteligentes por tipo de proyecto (2 semanas)

**Problema:** El agente toma las mismas decisiones para todo tipo de proyecto.

**Qué:** Mejorar `proponer_estructura` para que las decisiones dependan del tipo de proyecto.

| Decisión | Regla actual (módulo XIV) | Regla general (de los 15 módulos) |
|----------|--------------------------|-----------------------------------|
| **Cimentación** | Platea siempre | Platea si área < 30 m² y suelo S3; zapatas si área > 100 m² o hay placas; mixta según criterio del despacho |
| **Losa de techo** | Cobertura siempre | Si hay más de 1 nivel → losa en el último; si es 1 nivel → cobertura liviana (excepto si el despacho dice losa) |
| **Espesor losa** | 0.20 siempre | luz ≤ 4.5 m → 0.17; ≤ 5.0 m → 0.20; ≤ 6.0 m → 0.25; > 6.0 m → 0.30 |
| **Losa maciza** | Nunca | Baños, pasadizos y áreas < 3 m de luz → maciza e=0.20–0.25 |
| **Placa vs columna** | PL si ala ≥ 3t | Ajustar con evidencia de los 15 expedientes |
| **VSa** | Solo con cobertura | En todos los pisos si hay vanos |
| **Vigas** | 1 por eje | "Simil 2" en ejes largos (estudiar criterio del despacho) |
| **Estribos** | 9@0.10 fijo | CT 12@0.10; PL y col ≥ 0.50 10@0.10; col < 0.50 9@0.10 |

**Archivo:** `resources/js/ingenieria/criterios/criteriosEstructurales.js` — las reglas fijas se vuelven funciones que reciben el contexto del plano.

**Criterio de cierre:**
- `proponer_estructura` para los 15 módulos coincide con las decisiones del ingeniero en ≥ 80 % de los casos
- Cada decisión tiene test (`tests/frontend/etabs-decisiones.test.mjs`)

---

### Fase 3 — Dibujo de edificios de varios niveles (3 semanas)

**Problema:** El agente solo dibuja 1 nivel.

**Qué:** Extender las herramientas de dibujo para soportar múltiples pisos.

| Componente | Qué agregar |
|------------|-------------|
| **Lámina de losa de entrepiso** | Aligerado o macizo por piso, con sus viguetas y vigas |
| **Pórticos multi-nivel** | Niveles NPN → NPT 1er piso → NPT 2do piso → TECHO, con acero por tramo |
| **Cimentación para edificios** | Zapatas aisladas dimensionadas por carga acumulada (todos los pisos) |
| **Láminas adicionales** | E-03, E-04... cuando los pórticos no entran en E-02 |
| **Cuadro de columnas multi-piso** | Secciones que cambian por piso |
| **Cotas verticales** | Alturas de entrepiso (NPT por piso) |

**Prioridad:** Módulos de 2 y 3 niveles primero (son los más comunes).

**Criterio de cierre:**
- El módulo 1 (3 niveles) genera láminas que se parecen ≥ 70 % al plano del ingeniero
- Los pórticos muestran los 3 niveles correctamente
- Losa de entrepiso dibujada en cada piso

---

### Fase 4 — Precisión de metrados (2 semanas)

**Problema:** Metrados con 21 % de precisión en módulo 1.

**Qué:** Corregir partida por partida usando `comparar-metrado.mjs` contra los 15 metrados de referencia.

**Priorización (por impacto en el módulo 1):**

| # | Partida | Error actual | Causa | Solución |
|---|---------|-------------|-------|----------|
| 1 | Concreto placas vs columnas | −59 % / +71 % | Clasificación PL/CT | Fase 2 (reglas) |
| 2 | Losa de techo | falta | No detecta cuándo | Fase 2 (decisión losaDeTecho) |
| 3 | Losa maciza parcial | falta | No sabe que existe | Fase 2 (decisión) + Fase 4 (metrado) |
| 4 | Acero vigas | −47 % | "Simil 2" desconocido | Estudiar criterio del despacho |
| 5 | VSa | falta en multi-piso | Solo con cobertura | Fase 2 |
| 6 | Excavación/relleno | error por Df | Df por defecto incorrecto | Panel de datos del proyecto |
| 7 | Encofrado losas | ±15 % | Áreas con alero mal contadas | Corregir cálculo |

**Script:**
```bash
# Para cada módulo con metrado:
node scripts/agente/comparar-metrado.mjs <modulo-N.dwg> <metrado-N.xlsx> "hoja"
```

**Criterio de cierre:**
- ≥ 70 % de partidas a ±5 % en los módulos 1, 3, 9, 14
- ≥ 85 % de partidas a ±15 %
- `referenciaDespacho.js` actualizado con los 15 módulos

---

### Fase 5 — Adaptación de estilo visual (2 semanas)

**Problema:** El agente dibuja con las capas y colores del módulo XIV; otros módulos usan estilos distintos.

**Qué:** Hacer que el estilo de dibujo se adapte al plano de entrada o al perfil del despacho.

| Componente | Implementación |
|------------|----------------|
| **Perfil de estilo** | `estiloLaminas.js` recibe un perfil (A, B, genérico) detectado automáticamente del plano |
| **Auto-detección** | Si el plano tiene `49. EJES.` → perfil A; si tiene `eje` → perfil B; si no hay match → perfil genérico |
| **Plantillas múltiples** | Una plantilla por perfil de lámina, generadas con `generar-plantilla-estructuras.mjs` desde los expedientes |
| **Capa de compatibilidad** | Las capas semánticas (`L.EJES`, `L.COLUMNAS`, etc.) se mapean al perfil detectado |

**Criterio de cierre:**
- El plano generado usa las mismas capas que el plano de entrada
- Funciona con los 2+ perfiles de capas encontrados en los 15 módulos

---

### Fase 6 — Aprendizaje en producción (2 semanas)

**Problema:** Después del entrenamiento con 15 módulos, cada usuario nuevo tendrá planos diferentes.

**Qué:** Sistema para que el agente aprenda de las correcciones de los usuarios en producción.

```
Usuario sube arquitectura.dwg
        │
        ├─→ Agente genera plano de estructuras
        │
        ├─→ Ingeniero revisa en el visor
        │       │
        │       ├── "la losa es maciza" → corregir_estructura(losa, maciza)
        │       ├── "usa zapatas" → corregir_estructura(cimentacion, zapatas)
        │       ├── "el aligerado es de 20" → corregir_estructura(espesorLosa, 0.20)
        │       └── cada corrección → storage/app/private/agente/observaciones.jsonl
        │
        └─→ Reentrenamiento periódico
                │
                ├── node scripts/agente/aprender-pares.mjs (observaciones → reglas)
                └── Actualizar criteriosEstructurales.js
```

**Archivo de observaciones (ya existe):** `storage/app/private/agente/observaciones.jsonl`

**Formato de cada observación:**
```json
{
  "ts": "2026-11-18T18:00:00Z",
  "usuario": "ing-perez",
  "plano": "modulo-01-arq.dwg",
  "rasgos": {"niveles": 3, "area": 450, "uso": "aula"},
  "decision": "losa",
  "valor_agente": "aligerada",
  "valor_ingeniero": "maciza",
  "motivo": "baños y pasadizos"
}
```

**Reglas de aprendizaje:**
1. Si ≥ 3 usuarios corrigen lo mismo en planos parecidos → se vuelve regla automática
2. Si 1 usuario corrige → se guarda como observación y se aplica solo a planos del mismo tipo
3. Cada semana se corre `aprender-pares.mjs` para buscar nuevos patrones

**Criterio de cierre:**
- El pipeline de observaciones funciona end-to-end
- Las correcciones se aplican en el siguiente pedido del mismo tipo
- Script de reentrenamiento documentado

---

### Fase 7 — Validación y benchmark (1 semana)

**Qué:** Correr el benchmark completo con los 15 módulos.

```bash
# Benchmark completo
for N in 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15; do
  echo "=== Módulo $N ==="
  node scripts/agente/leer-arquitectura.mjs storage/.../modulo-$N/arquitectura.dwg
  node scripts/agente/probar-laminas.mjs storage/.../modulo-$N/arquitectura.dwg "primer nivel"
  node scripts/agente/comparar-metrado.mjs storage/.../modulo-$N/arquitectura.dwg \
       storage/.../modulo-$N/metrado.xlsx "METRADO"
done
```

**Tabla de resultados esperada:**

| Módulo | Lectura | Decisiones | Dibujo | Metrado ±5 % | Metrado ±15 % |
|--------|---------|------------|--------|-------------|--------------|
| 01 | ✅ | ≥ 80 % | ≥ 70 % | ≥ 55 % | ≥ 85 % |
| 02 | ✅ | ≥ 80 % | ≥ 70 % | ≥ 55 % | ≥ 85 % |
| ... | ✅ | ≥ 80 % | ≥ 70 % | ≥ 55 % | ≥ 85 % |
| 14 | ✅ | ≥ 90 % | ≥ 85 % | ≥ 70 % | ≥ 90 % |
| 15 | ✅ | ≥ 80 % | ≥ 70 % | ≥ 55 % | ≥ 85 % |

---

## 5. Estructura de Carpetas del Entrenamiento

```
docs/agentes/agente-predim/
├── AGENTE.md                               ← Instrucciones del sistema (se actualiza)
├── README.md                               ← Documentación del paquete
├── conocimiento/
│   ├── criterios.json                      ← Criterios de diseño (se expande)
│   ├── datos-proyecto.json                 ← Datos variables por proyecto
│   ├── estilo-despacho.json                ← Capas y colores (se agregan perfiles)
│   ├── resumen-expedientes.md              ← Tabla de 15 columnas
│   ├── catalogo-15-modulos.md              ← [NUEVO] Clasificación por tipo
│   ├── reglas-generales.json               ← [NUEVO] Reglas de los 15 módulos
│   ├── expedientes/
│   │   ├── modulo-01.json                  ← [NUEVO]
│   │   ├── modulo-02.json                  ← [NUEVO]
│   │   ├── modulo-03.json
│   │   ├── ...
│   │   ├── modulo-14.json
│   │   └── modulo-15.json                  ← [NUEVO]
│   └── casos/
│       ├── modulo-01.json                  ← [NUEVO] Decisiones del módulo 1
│       ├── modulo-03.json
│       ├── modulo-09.json
│       ├── modulo-14.json
│       └── ...
├── evaluacion/
│   ├── casos.json                          ← Pedidos de evaluación
│   └── benchmark-15-modulos.json           ← [NUEVO] Resultados del benchmark
├── herramientas/
│   ├── anthropic.json
│   └── openai.json
└── skills/
    ├── leer_estructura/SKILL.md            ← Se actualiza (multi-capa)
    ├── plano_estructuras/SKILL.md          ← Se actualiza (multi-nivel)
    ├── proponer_estructura/SKILL.md        ← Se actualiza (decisiones inteligentes)
    ├── metrar_estructura/SKILL.md          ← Se actualiza (más partidas)
    └── ...

scripts/agente/
├── aprender-expediente.mjs                 ← Extrae estilo y criterios de un DWG
├── aprender-metrados.mjs                   ← Extrae rangos de las planillas
├── aprender-pares.mjs                      ← Aprende de correcciones en producción
├── comparar-metrado.mjs                    ← Compara contra el metrado del ingeniero
├── evaluar-modelo.mjs                      ← Evalúa un modelo IA con los casos
├── leer-arquitectura.mjs                   ← Muestra qué entiende el agente
├── probar-laminas.mjs                      ← Genera láminas y vista previa SVG
├── generar-plantilla-estructuras.mjs       ← Genera plantilla desde un expediente
├── benchmark-15.mjs                        ← [NUEVO] Corre los 15 módulos
└── clasificar-modulos.mjs                  ← [NUEVO] Clasifica automáticamente

resources/js/ingenieria/
├── criterios/
│   ├── criteriosEstructurales.js           ← Reglas de diseño (se amplían a funciones)
│   └── datosProyecto.js                    ← Datos variables
├── agente/
│   ├── agentRunner.js                      ← Motor del chat
│   ├── conocimiento.js                     ← Memoria para el modelo
│   ├── modelosAgente.js                    ← Modelos evaluados
│   └── skills/
│       ├── index.js                        ← Registro de skills
│       ├── estructuraPlano.js              ← Skill de dibujo (41 KB → expandir)
│       └── casaPrimerNivel.js              ← Skill de casa (referencia)
├── metrado/
│   └── referenciaDespacho.js               ← Rangos del despacho (15 módulos)
└── cad/
    ├── primitives.js                       ← Primitivas de dibujo
    └── estiloLaminas.js                    ← Mapeo de capas semánticas → capas DXF

storage/app/private/
├── entrenamiento/estructuras/              ← Fuera de git
│   ├── modulo-01/ (arq + est + metrado)
│   ├── ...
│   └── modulo-15/
└── agente/
    └── observaciones.jsonl                 ← Correcciones de producción
```

---

## 6. Cómo cada persona alimenta al agente

### 6.1 Flujo del usuario (ingeniero)

1. **Abre** un plano de arquitectura (DWG/DXF) en el visor
2. **Pide** por chat: "Genera el plano de estructuras"
3. **Revisa** las láminas en el visor
4. **Corrige** lo que no está bien:
   - "La losa es maciza" → `corregir_estructura(losa, maciza)`
   - "Usa zapatas" → `corregir_estructura(cimentacion, zapatas)`
   - "El Hz es 0.60" → `datos_proyecto(hz, 0.60)`
5. El agente **rehace** las láminas con las correcciones
6. Las correcciones se **guardan** automáticamente en `observaciones.jsonl`

### 6.2 Flujo del equipo (reentrenamiento)

```bash
# 1. Descargar observaciones del servidor
scp produccion:storage/app/private/agente/observaciones.jsonl ./

# 2. Buscar patrones nuevos
node scripts/agente/aprender-pares.mjs

# 3. Si hay un metrado nuevo del despacho, agregarlo
node scripts/agente/aprender-metrados.mjs nuevas-planillas.xlsx

# 4. Actualizar criterios si las observaciones lo justifican
# (manual: editar criteriosEstructurales.js)

# 5. Correr el benchmark
node scripts/agente/benchmark-15.mjs

# 6. Desplegar
git add . && git commit -m "Reentrenamiento con observaciones de producción"
```

### 6.3 Esquema de aprendizaje continuo

```
                    ┌─────────────────────────┐
                    │   Producción (ryaie.com) │
                    │                         │
                    │  Usuario sube plano     │
                    │  Agente genera láminas  │
                    │  Usuario corrige        │
                    │  → observaciones.jsonl  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Reentrenamiento       │
                    │                         │
                    │  aprender-pares.mjs     │
                    │  aprender-metrados.mjs  │
                    │  benchmark-15.mjs       │
                    │  → nuevas reglas        │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Despliegue            │
                    │                         │
                    │  git push → Hostinger   │
                    │  Criterios actualizados │
                    │  Herramientas mejoradas │
                    └─────────────────────────┘
```

---

## 7. Métricas de Éxito

| Métrica | Hoy (módulo XIV) | Meta F3 | Meta F7 | Meta producción |
|---------|-------------------|---------|---------|-----------------|
| Lectura de ejes | 1/3 módulos | 15/15 | 15/15 | Cualquier DWG |
| Decisiones correctas | ~60 % | ≥ 80 % | ≥ 85 % | ≥ 90 % con correcciones |
| Semejanza visual | ~100 % (m14) / ~0 % (m1) | ≥ 70 % todos | ≥ 75 % | ≥ 80 % |
| Metrado ±5 % | 55 % (m14) / 21 % (m1) | ≥ 50 % | ≥ 60 % | ≥ 70 % |
| Metrado ±15 % | 85 % (m14) / 36 % (m1) | ≥ 70 % | ≥ 85 % | ≥ 90 % |
| Tiempo del agente | ~5 s | ≤ 10 s | ≤ 10 s | ≤ 15 s |

---

## 8. Cronograma

| Fase | Semanas | Acumulado | Prerequisito |
|------|---------|-----------|--------------|
| **F0** Catalogar 15 módulos | 1 | 1 | Tener los 15 DWG + metrados |
| **F1** Lectura universal | 2 | 3 | F0 |
| **F2** Decisiones inteligentes | 2 | 5 | F0 |
| **F3** Dibujo multi-nivel | 3 | 8 | F1 + F2 |
| **F4** Precisión de metrados | 2 | 10 | F3 |
| **F5** Adaptación de estilo | 2 | 12 | F1 |
| **F6** Aprendizaje en producción | 2 | 14 | F4 |
| **F7** Validación y benchmark | 1 | 15 | Todo |

**Total:** ~15 semanas (~4 meses)  
**MVP (F0–F3):** 8 semanas — el agente lee cualquier módulo, toma decisiones razonables y dibuja edificios de varios niveles.

---

## 9. Siguientes Pasos Inmediatos

1. **Reunir los 15 DWG de arquitectura + 15 DWG de estructuras + 15 planillas de metrado** en `storage/app/private/entrenamiento/estructuras/`
2. **Correr `aprender-expediente.mjs`** en cada módulo que falta (hoy solo están 3, 9 y 14)
3. **Correr `leer-arquitectura.mjs`** en el módulo 1 para confirmar qué no lee y empezar la Fase 1
4. **Listar las capas y estilos de cada módulo** para definir los perfiles de estilo

> **Lo más urgente:** El agente necesita leer bien los planos **antes** de poder dibujar bien. La Fase 1 (lectura universal) es el cuello de botella.

## 10. Agente interactivo con OpenAI y segundo proyecto (2026-11-19)

**Cómo trabaja la IA sin perderse.** El dibujo, la lectura y las decisiones las hacen las herramientas (deterministas, sin tokens). OpenAI (cadena `AGENTE_LLM_MODELOS`, del más barato al más capaz) solo entiende el pedido, elige la herramienta, pregunta y explica. En cada pedido recibe:

1. el prompt fijo y la memoria del agente (criterios del despacho + resumen de lo aprendido de los proyectos, sin nombres de cliente) — fijo, aprovecha la caché del proveedor;
2. el **estado de la sesión** (`agente/estadoAgente.js`, ~150–350 tokens): plano abierto (solo conteos), lo leído, la propuesta con su confianza, lo pendiente del ingeniero, lo que ya decidió, las láminas y el metrado hechos, y el **siguiente paso sugerido**.

**Herramientas de interacción** (`agente/skills/interaccion.js`):
- `preguntar_ingeniero`: la IA pregunta una decisión de experto con 2–4 opciones y recomienda una; el panel las muestra como botones (un clic responde).
- `estado_proyecto`: "¿en qué vamos?" (también por ruta directa, sin tokens).
- La respuesta del ingeniero se registra con `corregir_estructura` (evento de aprendizaje pendiente de aprobación) y queda en `decisionesSesion`.

**Proyecto nuevo.** Copiar DWG y metrados a `storage/app/private/entrenamiento/estructuras/<proyecto>/` (no a `inventario/`, que es salida generada) y correr `node scripts/agente/entrenar-proyecto.mjs <proyecto>` y luego `--aplicar`. Las planillas que cubren varios módulos ("MÓDULOS 01-02A-03-04", "05 y 06") se asignan a cada uno.

**Lo que enseñó el segundo proyecto (otro arquitecto).** Burbujas de eje en una capa sin "eje" (`proyeccion`), tramos de eje cortos y rótulos "05": el lector ahora reconoce la burbuja por su forma (círculo + rótulo + trazo radial; excluye marcas de corte y elevación) y normaliza los ceros. Lectura de columnas del segundo proyecto: de 2.8 % a 61 %; el primero se mantiene en 97.2 %. Pendiente: módulos donde el ingeniero agrega columnas que la arquitectura no dibuja (estructuración propia del agente).
