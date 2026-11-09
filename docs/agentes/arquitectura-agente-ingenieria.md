# Arquitectura del agente de ingeniería: plan adaptado al repositorio

**Para:** el equipo de agentes de IA (Claude, GPT u otros) y los ingenieros que trabajan en el sistema.
**Base:** [plan_arquitectura_agente_cad_estructural.md](plan_arquitectura_agente_cad_estructural.md) (plan maestro). Este documento lo contrasta con el código real, cierra sus decisiones abiertas (ADR) y fija la estructura de carpetas, el equipo de agentes y las fases.
**Estado:** propuesta. Antes de mover archivos hay que hacer los pasos de la sección 8.

---

## 1. Veredicto sobre el plan maestro

**Lo que se adopta tal cual.**
- Separar en capas:
  - geometría CAD;
  - interpretación arquitectónica;
  - modelo estructural;
  - reglas;
  - IA;
  - revisión humana;
  - producción CAD.
- La geometría la calculan algoritmos deterministas. El modelo de lenguaje (LLM) clasifica, explica y elige herramientas, pero nunca calcula coordenadas ni dimensiones.
- El proveedor de IA es intercambiable (Ollama, GPT, Claude) y su salida se valida contra un esquema.
- Todo resultado es una **propuesta** con estado, trazable a la versión del plano de origen, y la aprueba el ingeniero.
- El plano original nunca se modifica.

**Lo que no se ajusta al proyecto real.**

| El plan dice | El repositorio y la operación reales | Decisión |
|---|---|---|
| Laravel 12, Livewire 3 | Laravel 13, Livewire 3.6 + Volt | Usar las versiones reales |
| PostgreSQL, Redis, Docker, workers | Producción en Hostinger Business (hosting compartido): MySQL, cola `database` con cron, sin procesos permanentes ni Docker | MySQL con columnas JSON; cola `database`. Docker, Redis y PostgreSQL quedan para la fase de servidor propio (Ubuntu) |
| MLightCAD por su Script API, en un sandbox sin red | Se usan los paquetes npm `@mlightcad/data-model` y `cad-viewer` directamente en el host Vue (`/software/predim2`) | El "puente" es código JS propio, sin sandbox. ADR-001 cerrada |
| Empezar por extracción y normalización; no proponer columnas todavía | Las fases 0–3 ya existen en JS y se probaron con 3 módulos reales (3, 09 y 14). El cliente necesita láminas ya | No reconstruir; reordenar lo existente y añadir lo que falta: estados de revisión, persistencia, datos faltantes |
| Motor geométrico en PHP o Python | La geometría corre en JS, en el navegador, donde está el dibujo; se prueba en Node | JS para lectura y dibujo. Python (OpenSeesPy, `PythonEngineController`) para análisis estructural |
| Carpetas `app/Domain/*` de estilo DDD | Laravel convencional (`Http`, `Models`, `Services`, `Jobs`, `Livewire`) | Seguir la convención Laravel; los módulos de dominio viven en JS (sección 3) |

**Lo que falta en el plan y aquí se agrega.**
1. **Ciclo de entrenamiento:**
   1. tomar un expediente del ingeniero;
   2. extraer criterios y estilo;
   3. lo que se repite en todos se vuelve criterio, y lo que cambia se vuelve regla o dato del proyecto;
   4. cada regla lleva su prueba.
2. **Plantilla y estilo del despacho:** capas, colores, rótulo y detalles típicos.
3. **Paquete portable del agente:** el mismo agente debe funcionar en Ollama, GPT, Claude o Grok.
4. **Evaluación de modelos** antes de cambiar de motor.

---

## 2. Decisiones de arquitectura (ADR) cerradas

| ADR | Decisión | Motivo |
|---|---|---|
| 001 Integración MLightCAD | Paquetes npm en un host Vue propio (`resources/js/etabs/`) | Acceso completo al modelo de datos; ya funciona |
| 002 Dónde se extrae | En el navegador (lectura del DWG abierto). Al backend solo va la **lectura normalizada** (JSON), nunca el DWG al LLM | Menos tokens, menos exposición de datos |
| 003 Formatos | Entrada DWG o DXF. La salida se dibuja en el mismo dibujo, debajo de la arquitectura, y se exporta en DXF (R14, latin1) | El ingeniero sigue en su archivo; DXF abre en cualquier CAD |
| 004 Modelo neutral | `LecturaPlano` y `PropuestaEstructural` (sección 5), con versión de esquema | Desacopla de MLightCAD |
| 005 Motor geométrico | JS para lectura, reglas y dibujo; Python solo para análisis | Ya probado; sin servicio extra en hosting compartido |
| 006 Base de datos | MySQL con columnas JSON; sin PostGIS | Disponible en Hostinger; no hay consultas espaciales que lo justifiquen |
| 007 Almacenamiento | DWG originales en `storage/app/private/planos/<proyecto>/<version>/`, con hash SHA-256; derivados aparte | Original inmutable y privado |
| 008 Proveedor IA | Contrato `ProveedorIa` en Laravel (Ollama, OpenAI, Anthropic). En producción el navegador habla solo con Laravel | La clave nunca llega al navegador |
| 009 Datos a GPT/Claude | Solo pedido, resumen de la lectura y resultados de herramientas; nunca el DWG ni datos personales del rótulo sin autorización del proyecto | Confidencialidad |
| 010 Reglas | Las reglas viven en `criterios/`. Cada una dice de dónde sale (norma E.0xx o expediente) y tiene prueba. Las versiones de norma van por paquete de reglas | Trazable y revisable por el ingeniero |
| 011 Aprobación | Estados: identificado, inferido, ambiguo, propuesto, aprobado. El LLM no aprueba; las láminas llevan "PROPUESTA – REQUIERE REVISIÓN" hasta que el ingeniero las aprueba | Responsabilidad profesional |

---

## 3. Estructura de carpetas objetivo

Los módulos de ingeniería salen de `resources/js/etabs/agente/` a una carpeta neutral, `resources/js/ingenieria/`. Así pueden usarlos predim2 hoy, y el modelador CAD y el análisis estructural mañana. `resources/js/etabs/` queda solo como el visor predim2.

```text
resources/js/ingenieria/
├── cad/            Adaptador MLightCAD: leer el dibujo, dibujar primitivas, copiar plantilla
│   ├── drawingContext.js · cadExecutor.js · copiarPlantilla.js · primitives.js
├── lectura/        Interpretación arquitectónica (lo que "ve" el agente)
│   └── lectorPlano.js  → luego se divide en vistas · ejes · columnas · muros · vanos · rotulo
├── criterios/      Reglas y criterios del despacho y de la norma (sin dibujo)
│   ├── criteriosEstructurales.js · estiloLaminas.js
│   └── normas/     (fase 2) paquetes E.020, E.030, E.050, E.060, E.070 con versión
├── diseno/         Predimensionamiento puro (números, sin dibujo)
│   └── estructura.js · refuerzo · losas · vigas · cimentación
├── planos/         Contenido de cada plano (geometría estructural a dibujar)
│   └── cimentacionPlano.js · aligeradoPlano.js · porticoPlano.js
├── laminas/        Producción: plantilla, cuadros, rótulo, separación de textos
│   └── laminasPlantilla.js · laminaEstructuras.js · cuadroColumnas.js · rotulo.js · separarTextos.js
├── agente/         IA: ciclo de herramientas, memoria, modelos, skills
│   ├── agentRunner.js · conocimiento.js · modelosAgente.js
│   └── skills/     estructuraPlano.js · casaPrimerNivel.js · index.js
└── contratos/      Esquemas JSON versionados: LecturaPlano, PropuestaEstructural

resources/js/etabs/            Visor predim2 (Vue): App.vue, components/AgentePredimPanel.vue

app/                            Laravel (fase F1, cuando haya persistencia)
├── Http/Controllers/Agente/    AgenteChatController (proxy al proveedor IA), LecturaController
├── Services/Ia/                ProveedorIa (contrato) · OllamaProveedor · OpenAiProveedor · AnthropicProveedor
├── Models/                     PlanoVersion · LecturaPlano · PropuestaEstructural · DecisionRevision · EjecucionIa
└── Jobs/                       Exportaciones y análisis largos (cola database + cron)

scripts/agente/                 CLI de entrenamiento: aprender-expediente · leer-arquitectura · probar-laminas
                                · generar-plantilla-estructuras · exportar-paquete · evaluar-modelo
docs/agentes/
├── arquitectura-agente-ingenieria.md   este documento
├── criterios-estructuras.md            reglas aprendidas y su origen
├── agente-predim/                      paquete portable (generado; no se edita a mano)
storage/app/private/entrenamiento/      expedientes de referencia (DWG de clientes; fuera de git)
tests/frontend/ingenieria-*.test.mjs    pruebas por módulo y de generalización
.claude/agents/                         definiciones del equipo de agentes (sección 4)
```

**Mapa de migración** (primera etapa: mover sin cambiar código, solo las rutas de import):

| Hoy, en `resources/js/etabs/agente/` | Destino en `resources/js/ingenieria/` |
|---|---|
| drawingContext, cadExecutor, copiarPlantilla, primitives | `cad/` |
| lectorPlano | `lectura/` |
| criteriosEstructurales, estiloLaminas | `criterios/` |
| estructura | `diseno/` |
| cimentacionPlano, aligeradoPlano, porticoPlano | `planos/` |
| laminasPlantilla, laminaEstructuras, cuadroColumnas, rotulo, separarTextos | `laminas/` |
| agentRunner, conocimiento, modelosAgente, skills/ | `agente/` |

**Segunda etapa:** separar responsabilidades mezcladas; cada paso lleva sus pruebas en verde.
- `murosDelEdificio` sale de `cimentacionPlano` y `vanosDesdeArquitectura` sale de `porticoPlano`; los dos pasan a `lectura/`.
- `refuerzoMinimo`, `espesorAligerado` y `seccionViga` pasan a `diseno/`.

---

## 4. Equipo de agentes (modo ingeniero senior)

Cada agente es dueño de un módulo, trabaja con un contrato de entrada y salida, y no toca el módulo de otro sin pasar por el coordinador. Se definen como `.claude/agents/<nombre>.md`; la misma descripción sirve como instrucción de sistema en GPT o Grok.

| Agente | Dueño de | Entrega | Hecho cuando |
|---|---|---|---|
| **coordinador** (skill `ai-integrator`) | Este documento, ADR, orden de trabajo | Plan de cada tarea, asignación, revisión final | Las pruebas pasan y el resultado coincide con el expediente o está justificado |
| **ingeniero-lectura-cad** | `cad/`, `lectura/` | `LecturaPlano` correcta en planos nuevos | Corre `leer-arquitectura.mjs` sobre cada expediente sin errores y con prueba de generalización |
| **ingeniero-estructural** | `criterios/`, `diseno/` | Reglas con fuente (norma o expediente) | Cada regla tiene prueba con casos de al menos 2 expedientes; las dudas quedan como "dato del proyecto" |
| **ingeniero-planos-laminas** | `planos/`, `laminas/`, plantilla, estilo | Láminas sin encimados, con capas y colores del despacho | Vista previa comparada con el PDF del ingeniero, sin regresiones en los otros módulos |
| **ingeniero-ia** | `agente/`, paquete portable, proveedores | Herramientas, memoria, evaluación de modelos | `evaluar-modelo.mjs` sin bajar de aciertos; paquete regenerado |
| **ingeniero-backend** (skill `ai-developer`) | `app/`, migraciones, rutas, despliegue | Proxy IA, persistencia, colas | Funciona en Hostinger: sin daemons y con clave en `.env` |
| **qa-revisor** (skill `ai-tester`) | `tests/`, generalización, seguridad | Informe de fallas y pruebas nuevas | Las 53 pruebas actuales y las nuevas en verde |

**Reglas comunes:**
- No inventar cargas, suelo ni materiales: si faltan, se marcan como dato faltante.
- No copiar datos personales de los expedientes (nombres, CIP, CUI).
- Toda regla nueva va con su prueba.
- Nada se commitea ni se despliega sin pedido del usuario.

---

## 5. Contratos de datos (modelo neutral)

`LecturaPlano` (salida de `lectura/`, versión 1):

```json
{
  "esquema": "lectura-plano/1",
  "plano": {"archivo": "…", "hash": "sha256", "unidadesPorMetro": 1},
  "vista": {"titulo": "MÓDULO IX: PLANTA DE DISTRIBUCIÓN 1ER NIVEL", "nivel": 1},
  "ejes": [{"nombre": "X", "p": [0, 0], "q": [0, 16.5], "inclinado": false}],
  "elementos": [
    {"id": "e1", "tipo": "placa", "codigo": "PL1", "eje": "1/W´", "forma": "L", "medidas": [0.9, 0.9], "espesor": 0.3,
     "estado": "identificado", "evidencia": {"capa": "1_PLACAS", "regla": "claseDeSeccion"}}
  ],
  "columnetas": [], "muros": [], "vanos": [], "techo": {"pendiente": 0.33},
  "faltantes": ["Hz y Df (estudio de suelos)", "categoría de la edificación (U)"]
}
```

`PropuestaEstructural` (salida de `diseno/` y `planos/`): la lectura de origen (hash), las reglas aplicadas con su versión, los elementos con sus medidas y acero, los avisos y el estado `propuesta`. Solo un usuario puede pasarla a `aprobada`.

---

## 6. Fases (ruta del usuario: predim2 → análisis estructural → resto)

**F1. Predim2 para el cliente** (actual)
1. Reestructurar carpetas (sección 3) sin cambiar comportamiento.
2. Panel "Datos del proyecto" con Hz, Df, U y número de niveles: son datos, no reglas.
3. Edificios de 2 niveles (módulo 09): losa de entrepiso y pórticos con dos niveles.
4. Estados de revisión en las láminas ("PROPUESTA – REQUIERE REVISIÓN") y avisos de datos faltantes.
5. Proxy Laravel para el proveedor IA, para pasar de Ollama a GPT o Claude sin clave en el navegador.
6. Detalle de pórticos: secciones VB, canaleta, correas, cadena de cotas.
7. Entrenamiento continuo: cada expediente nuevo pasa por `aprender-expediente`, `leer-arquitectura` y `probar-laminas`, y deja reglas y pruebas nuevas.

**F2. Análisis estructural**
- La `PropuestaEstructural` se exporta al modelador CAD (`resources/js/cad/`) y al motor OpenSeesPy (`PythonEngineController`, modo subproceso en Linux).
- Los resultados vuelven a corregir el predimensionamiento: cuantías y secciones.

**F3. Resto**
- Metrados.
- Memoria de cálculo (ya existe `MemoriaCalculo`).
- Comparación de revisiones de arquitectura.
- Servidor propio (Ubuntu + Docker) cuando el volumen lo justifique.

---

## 7. Riesgos inmediatos

| Riesgo | Consecuencia | Acción |
|---|---|---|
| El código del agente, los scripts, la documentación y 25 pruebas **no están en git** | Una pérdida o un mal comando borra semanas de trabajo | Commit en una rama propia antes de reestructurar |
| Los DWG de clientes en `docs/planos/` no están en `.gitignore` | Un `git add .` los sube al repositorio y el autodeploy, a producción | Moverlos a `storage/app/private/entrenamiento/` e ignorarlos |
| El navegador llama a Ollama directamente | Con GPT o Claude la clave quedaría expuesta | Proxy Laravel (F1.5) |
| `tests/frontend/_tmp_det.mjs` es un archivo temporal | Ruido en las pruebas | Borrarlo tras revisarlo |
| Nada se persiste (lecturas, decisiones, ejecuciones de IA) | Sin trazabilidad ni revisión | Modelos de la sección 3 en F1.4 |

---

## 8. Cómo ejecutar la reestructura (orden)

1. Commit del trabajo actual en una rama (con permiso del usuario).
2. Mover los DWG de referencia a `storage/app/private/entrenamiento/` y añadir la ruta a `.gitignore`. Las pruebas y los scripts leen la ruta desde una constante única.
3. Mover los archivos según el mapa de la sección 3 con `git mv` y corregir los imports: visor, scripts, pruebas, `vite.config.js` si aplica.
4. Correr `node --test --test-concurrency=1 tests/frontend/etabs-*.test.mjs` y `npm run build` (con `NODE_OPTIONS=--max-old-space-size=8192`). No se avanza con rojos.
5. Crear `.claude/agents/*.md` del equipo (sección 4) y regenerar el paquete portable.
6. Recién entonces, segunda etapa de separación y las tareas de F1.
