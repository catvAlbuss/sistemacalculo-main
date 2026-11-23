# Arquitectura de aprendizaje del Agente NovaCad

Cómo aprende el agente, qué técnica conviene en cada parte, cuántos datos necesita cada una y en qué orden se construye. Escrito el 2026-11-20, después de entrenar con dos proyectos terminados (26 módulos).

## 1. Principio

Los proyectos de entrenamiento ya están entregados: sirven para **enseñar a razonar**, no para copiarlos. El agente trabajará en proyectos nuevos, de otras zonas y otros arquitectos. Por eso se separa en cuatro capas y cada una aprende de una forma distinta:

| Capa | Qué hace | Quién lo hace | Cómo aprende |
|---|---|---|---|
| **Percepción** | Lee la arquitectura: vistas, ejes, columnas, muros, ambientes, niveles | Lector determinista (JS) | Reglas geométricas que no dependen del nombre de capa + clasificador; se mide con F1 contra el ingeniero |
| **Decisión** | Cimentación, losas, techo, espesores, malla… | Reglas validadas + patrones + casos parecidos | Se recalcula con cada proyecto nuevo (`entrenar.mjs`); decide solo cuando tiene respaldo de ≥ 3 proyectos independientes; si no, **pregunta** |
| **Ejecución** | Dibuja las láminas y saca el metrado | Generadores deterministas | Recetas medidas en los planos del ingeniero (medianas); formato por despacho (pendiente) |
| **Conversación** | Entiende el pedido, pregunta, explica | Modelo de IA (OpenAI, del más barato al más capaz) | No se le cambian los pesos: recibe la memoria (lo aprendido) y el estado de la sesión en cada turno |

La IA no "aprende" reentrenando el modelo de lenguaje: eso es caro y no hace falta. Lo que crece es la **base de conocimiento** (casos, reglas, patrones, recetas, formatos), y el modelo la consulta en cada turno. Este es el mismo camino que siguen los agentes de ingeniería publicados en 2025 (MASSE, por ejemplo): agentes sin entrenar el modelo, con herramientas deterministas y lazos de verificación.

## 2. Preguntar mientras construye (aprendizaje activo)

La literatura de aprendizaje con humano en el lazo coincide en tres reglas: **preguntar solo cuando el modelo duda**, **pocas preguntas** (la fatiga del usuario es el límite real) y **contar con respuestas inconsistentes** (el mismo ingeniero no decide igual en todos los módulos).

Implementado (`construir_estructura`):

1. **Lectura**: informa ejes, columnas y columnetas; confirma niveles.
2. **Suelo y cimentación**: perfil de suelo si no hay EMS; cimentación y malla solo si la confianza es baja.
3. **Losas y techo**: losa maciza en baños, espesor, losa de techo, solo si son dudosas.
4. **Dibujo**: con todas las decisiones.

Cada pregunta trae la recomendación y su respaldo ("así lo resolvió el ingeniero en 3 casos parecidos, confianza 67 %"). Los botones responden sin gastar tokens. Cada respuesta queda como evento de aprendizaje (pendiente de aprobación) y entra al próximo `entrenar.mjs`.

Siguiente paso de esta parte: dibujar cada etapa en cuanto se decide (primero la cimentación, después las losas por nivel, después pórticos y techo), para que el ingeniero corrija sobre el dibujo y no solo sobre la pregunta.

## 3. Qué técnica conviene en cada parte y cuántos datos necesita

| Parte | Hoy | Con 5–10 proyectos | Con 30–50 proyectos | Con cientos o miles |
|---|---|---|---|---|
| Lectura de ejes y columnas | Reglas por forma (burbuja = círculo + rótulo + trazo radial) | Igual; agregar casos difíciles a las pruebas | Igual | Red de grafos sobre las primitivas del CAD (FloorPlanCAD, ArchCAD-400K) |
| Clasificación de entidades | Diccionario de capas + geometría + capas de arquitectura de fondo | Aprender el diccionario de capas por despacho | Clasificador tabular (árbol potenciado) por entidad | Detección de símbolos (FloorPlanCAD / DPSS) |
| Decisiones | Reglas validadas + árbol de profundidad ≤ 3 + vecinos | Igual, medido dejando fuera **un proyecto entero** | Gradient boosting / LightGBM con validación por proyecto | Igual |
| Disposición de vigas, columnas extra | Tramos entre columnas | Reglas de luz máxima y apoyos | Modelo de grafo arquitectura → estructura | Redes de grafos o difusión (StructDiffusion, GNN de vigas y muros) |
| Formato de láminas y metrado | Plantilla única | **Perfil de formato por despacho**, aprendido de sus láminas | Igual | Igual |

La regla práctica: con pocos proyectos ganan las reglas y los árboles simples; con datos tabulares chicos, un árbol simple rinde igual que métodos más complejos en muchos conjuntos. Las redes neuronales de planos de los artículos usan miles de planos etiquetados: no conviene entrenarlas con 26 módulos.

## 4. ¿Hace falta un motor de entrenamiento en Python?

**Todavía no, pero se deja preparado el lugar.** Hoy todo el entrenamiento corre en Node con las mismas funciones que usa el panel (cero tokens, ~13 min para 26 módulos). Conviene pasar a Python cuando:

- haya ≥ 30 proyectos y se quiera gradient boosting o LightGBM (scikit-learn, LightGBM);
- haga falta geometría robusta de ambientes: `ezdxf` para leer DXF, `shapely` (`polygonize`) para cerrar ambientes y `networkx` para la adyacencia de ambientes y apoyos;
- se quiera una red de grafos (PyTorch Geometric).

Cómo encaja en la arquitectura actual (Hostinger compartido, sin servicios persistentes):

- `python-backend/entrenamiento/` con un modo `entrenar` en `cli_entry.py`, ejecutado **fuera de línea** (en la PC del despacho o por cron), nunca por pedido del usuario.
- Su salida son archivos JSON (reglas, árboles, umbrales) que el JS ya sabe leer, igual que hoy `casosAprendidos.js` y `recetasAprendidas.js`. En producción no corre nada nuevo.

## 5. Ciclo de aprendizaje

1. Proyecto terminado → copiar DWG y metrados a `entrenamiento/estructuras/<proyecto>/` → `node scripts/agente/entrenar-proyecto.mjs <proyecto> --aplicar`.
2. Uso diario → la construcción guiada registra cada decisión del ingeniero → el responsable aprueba o descarta los eventos.
3. `node scripts/agente/entrenar.mjs` → recalcula reglas, patrones y recetas y mide:
   - lectura (F1 de columnas por proyecto);
   - dibujo (superposición con el ingeniero, por proyecto y por elemento; `--diag` dice qué capas faltan o sobran);
   - criterios (dejando fuera el módulo o el proyecto evaluado).
4. Un cambio de código entra solo si no baja ninguna de esas medidas en los proyectos ya aprendidos.

## 6. Orden del código

| Carpeta | Contenido |
|---|---|
| `resources/js/ingenieria/lectura/` | Percepción: lector de planos, clasificador, diagnóstico |
| `resources/js/ingenieria/aprendizaje/` | Decisión: casos, reglas, patrones, recetas (lo aprendido se genera aquí) |
| `resources/js/ingenieria/planos/`, `laminas/`, `metrado/` | Ejecución: dibujo, láminas y metrado |
| `resources/js/ingenieria/agente/` | Conversación: bucle del agente, estado, consultas, herramientas |
| `scripts/agente/` | Entrenamiento y medición (cero tokens) |
| `storage/app/private/entrenamiento/` | Planos y salidas privadas (fuera de git, nunca a proveedores de IA) |
| `python-backend/entrenamiento/` | Futuro motor de entrenamiento fuera de línea |

## 7. Hoja de ruta

| Fase | Entregable | Meta medible |
|---|---|---|
| A (hecho) | Ciclo sin tokens, dos proyectos, construcción guiada, estado por turno | Lectura 97 % / 61 %; dibujo 67 % / 56 % |
| B | Losa maciza solo en el ambiente húmedo; viguetas y alero aprendidos; columnas que el ingeniero agrega | Losa ≥ 75 % en ambos proyectos |
| C | Perfil de formato por despacho (rótulo, láminas, títulos, capas, metrado) | Lámina con el formato del despacho, sin plantilla fija |
| D | Dibujo por etapas dentro de la construcción guiada; pórticos y techos | Cimentación y losa ≥ 85 % |
| E | Tercer proyecto de otra zona; motor Python si hay ≥ 30 proyectos | ≥ 90 % en proyectos no vistos |

## Fuentes

- [FloorPlanCAD: A Large-Scale CAD Drawing Dataset for Panoptic Symbol Spotting](https://arxiv.org/abs/2105.07147v2)
- [ArchCAD-400K: A Large-Scale CAD drawings Dataset and New Baseline for Panoptic Symbol Spotting](https://arxiv.org/html/2503.22346v3)
- [End-to-end generation of structural topology for complex architectural layouts with graph neural networks](https://www.researchgate.net/publication/374065920_End-to-end_generation_of_structural_topology_for_complex_architectural_layouts_with_graph_neural_networks)
- [Design-condition-informed shear wall layout design based on graph neural networks](https://www.sciencedirect.com/science/article/abs/pii/S147403462300318X)
- [Beam layout design of shear wall structures based on graph neural networks](https://www.sciencedirect.com/science/article/abs/pii/S0926580523004831)
- [StructDiffusion: shear wall structure layout generation using diffusion model](https://www.sciencedirect.com/science/article/abs/pii/S0141029624006308)
- [MASSE: multi-agent LLM system for structural engineering workflows](https://arxiv.org/abs/2510.11004)
- [Interactive preference learning for design (Nandy, Goucher-Lambert)](https://codesign.berkeley.edu/papers/nandy-preference-jmd)
- [Learning preferences with noisy humans (active learning)](https://arxiv.org/pdf/2002.06288)
- [Floor-plan parsing with Shapely polygonize](https://huggingface.co/rikhoffbauer2/floorplan-parser/blob/main/floorplan/geometry.py)
- [Tabular data: when trees match complex models](https://arxiv.org/pdf/2305.02997)
