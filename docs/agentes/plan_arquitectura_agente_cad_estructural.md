# Plan maestro: plataforma de ingeniería asistida para convertir planos arquitectónicos 2D en propuestas estructurales 2D

**Versión:** 1.0\
**Estado:** Estudio y arquitectura propuesta; no iniciar implementación
completa hasta cerrar las decisiones de descubrimiento.\
**Stack actual:** Laravel + Livewire + MLightCAD Viewer + Ollama local.\
**Evolución prevista:** servicios de IA GPT/Claude en servidor, Ubuntu +
Docker.\
**Objetivo:** asistir al ingeniero en la lectura, interpretación,
coordinación y elaboración de propuestas estructurales 2D a partir de
planos arquitectónicos 2D.

------------------------------------------------------------------------

## 0. Resumen ejecutivo

El producto no debe diseñarse como "un chatbot que mira un plano y
dibuja columnas y vigas". Debe diseñarse como una **plataforma de
ingeniería asistida por CAD**, con separación entre:

1.  **Geometría CAD:** entidades, capas, bloques, coordenadas, unidades
    y layouts.
2.  **Interpretación arquitectónica:** ejes, muros, vanos, escaleras,
    niveles, usos y restricciones espaciales.
3.  **Modelo estructural conceptual:** alternativas de sistema
    resistente, elementos candidatos, continuidad, luces, apoyos y
    criterios preliminares.
4.  **Reglas y validaciones:** consistencia geométrica, normativa
    aplicable, advertencias y conflictos.
5.  **Asistencia IA:** explicación, clasificación, preguntas, propuestas
    y generación de borradores.
6.  **Revisión humana:** decisiones y aprobación explícita del ingeniero
    responsable.
7.  **Producción CAD:** capas y entidades estructurales como propuesta
    editable, siempre versionada y trazable.

**Recomendación central:** comenzar con un flujo semiautomático y
auditable. El sistema extrae y organiza información, propone opciones y
genera una capa estructural preliminar; el ingeniero valida cada
decisión. No debe presentarse como cálculo estructural certificado ni
emitir planos aptos para construcción sin análisis, revisión y firma de
un profesional competente.

La conversión arquitectura → estructura no es una transformación
geométrica determinista. La arquitectura expresa distribución y uso; el
diseño estructural requiere además cargas, materiales, sistema
resistente, suelo, número de niveles, normativa, condiciones sísmicas,
continuidad vertical y criterios de diseño. Un plano arquitectónico 2D
por sí solo no contiene toda esa información.

## 1. Objetivos, límites y supuestos

### 1.1 Objetivos funcionales

-   Abrir y visualizar DWG/DXF 2D en el navegador.
-   Inspeccionar capas, bloques, entidades, textos, cotas, unidades y
    layouts.
-   Identificar elementos arquitectónicos y su grado de confianza.
-   Construir un modelo geométrico normalizado independiente de
    MLightCAD.
-   Registrar dudas, ambigüedades y datos faltantes.
-   Proponer alternativas estructurales preliminares.
-   Permitir al ingeniero colocar, mover, editar, aceptar o rechazar
    elementos.
-   Generar una capa/archivo DXF estructural de propuesta, sin alterar
    el original.
-   Mantener trazabilidad de fuente, reglas, versiones, usuario y
    aprobaciones.
-   Comparar revisiones de planos arquitectónicos y detectar cambios
    relevantes.

### 1.2 Fuera del alcance inicial

-   Diseñar automáticamente una estructura definitiva a partir de una
    imagen o DWG sin intervención profesional.
-   Calcular y certificar por sí solo cimentaciones, columnas, vigas,
    losas o conexiones.
-   Inferir con certeza materiales, cargas, resistencia del suelo o
    condiciones ocultas.
-   Reemplazar ETABS, SAP2000, Robot, SAFE u otro software de análisis
    estructural.
-   Emitir planos "aprobados para construcción" sin cálculo, revisión y
    responsabilidad profesional.
-   Tratar el resultado de un LLM como una medición geométrica exacta.

### 1.3 Supuestos por confirmar

-   La primera versión se limita a planos arquitectónicos y
    estructurales **2D**.
-   MLightCAD es el visor/editor CAD integrado, no el motor de reglas de
    ingeniería.
-   Laravel/Livewire administra proyectos, usuarios, archivos, procesos,
    revisiones y aprobaciones.
-   Ollama se usa en desarrollo/pruebas locales; GPT/Claude podrán
    usarse en servidor mediante un proveedor intercambiable.
-   La normativa aplicable se parametrizará por país, jurisdicción y
    versión. Para Perú deberá confirmarse el RNE vigente y las normas
    específicas del proyecto con el ingeniero responsable.
-   El proyecto debe poder funcionar aunque el proveedor de IA no esté
    disponible: inspección CAD, edición y validaciones deterministas no
    deben depender del LLM.

## 2. Investigación técnica: decisiones que condicionan la arquitectura

### 2.1 MLightCAD: papel y límites

La documentación oficial describe MLightCAD como visor/editor DWG/DXF
que procesa y renderiza en el navegador, con soporte de model space,
layouts, capas, bloques, referencias externas, medición y anotaciones.
También documenta una arquitectura de plugins y APIs de integración.

Puntos relevantes:

-   Integración posible mediante paquete/SDK o iframe, según el nivel de
    control requerido.
-   El objeto `cad` expone información del dibujo y permite consultar
    entidades, capas, extensiones, mediciones y exportaciones.
-   Los scripts del API se ejecutan en un sandbox estricto del
    navegador; la documentación indica que no pueden manipular el DOM ni
    realizar solicitudes de red.
-   Por tanto, no se debe asumir que un script CAD puede llamar
    directamente a Laravel o a Ollama. La comunicación debe realizarse
    desde el host de la aplicación mediante una
    integración/plugin/bridge soportado, o mediante una exportación
    controlada.
-   La API documenta que `cad.entities` incluye entidades de model
    space, paper space y definiciones de bloques; el extractor debe
    distinguir esos contextos para no duplicar geometría.
-   La compatibilidad con entidades personalizadas de verticales CAD
    puede ser parcial. Se debe probar con archivos reales, especialmente
    si proceden de AutoCAD Architecture, Civil 3D, Tianzheng u otros
    verticales.
-   La documentación consultada indica limitaciones de soporte para
    ciertos objetos DWG y foco principal en 2D. Se necesita una matriz
    de compatibilidad propia.

**Decisión propuesta:** MLightCAD se mantiene como motor de
visualización e interacción. Crear un `CadAdapter` que traduzca la
API/objetos de MLightCAD a un modelo neutral de dominio. Ninguna regla
de ingeniería debe depender directamente de clases internas de
MLightCAD.

### 2.2 Laravel + Livewire

Livewire es adecuado para paneles de proyectos, formularios, tablas de
revisión, estados de procesos, validación y colaboración administrativa.
No conviene usar un ciclo Livewire para transmitir continuamente toda la
geometría del CAD ni ejecutar procesamiento pesado dentro de una
petición HTTP.

Separación recomendada:

-   Livewire: interfaz administrativa y coordinación de flujos.
-   JavaScript/TypeScript: integración con MLightCAD y manejo de eventos
    del visor.
-   Laravel Services/Actions: lógica de aplicación y casos de uso.
-   Jobs/Queues: extracción, normalización, análisis y generación de
    entregables.
-   PostgreSQL: datos de dominio, revisiones, resultados, auditoría.
-   Almacenamiento de objetos/archivos: originales, derivados y
    exportaciones.
-   Redis: colas, locks, caché y estado efímero cuando se justifique.

Las tareas largas deben ir a colas con estados, reintentos acotados,
timeout, idempotencia y registro de fallos. No mantener solicitudes web
abiertas durante un análisis CAD o una llamada de IA prolongada.

### 2.3 IA: separar interpretación de cálculo

Un LLM es útil para: - Clasificar textos, etiquetas y nombres de
capas. - Explicar la lectura del plano. - Proponer hipótesis de
distribución y alternativas. - Identificar información faltante. -
Resumir conflictos y justificar advertencias. - Convertir instrucciones
del ingeniero en acciones estructuradas propuestas.

Un LLM no debe ser la autoridad para: - Calcular coordenadas exactas si
existe geometría CAD consultable. - Decidir dimensiones estructurales
finales sin cálculo y datos de entrada. - Aprobar cumplimiento
normativo. - Inventar unidades, cargas, materiales o resistencia del
suelo. - Modificar el DWG original sin aprobación.

**Principio:** geometría mediante CAD/algoritmos deterministas;
razonamiento y explicación mediante IA; decisiones de ingeniería y
aprobación por el profesional.

### 2.4 Formatos y motor CAD

DWG es un formato complejo y puede contener objetos proxy, entidades de
verticales y referencias externas. DXF es más accesible para intercambio
e inspección, pero también requiere manejar unidades, bloques,
coordenadas, layouts y versiones.

Evaluar por separado: - MLightCAD API para interacción y extracción en
navegador. - DXF como formato de intercambio/entregable. - `ezdxf` como
opción de procesamiento DXF en un microservicio Python, no como
sustituto automático de un motor DWG completo. - ODA Drawings SDK como
alternativa comercial si la fidelidad DWG, conversión o acceso a objetos
avanzados supera las capacidades del visor actual. Revisar
licencias/costos antes de adoptar. - No convertir todos los DWG a DXF a
ciegas: comparar fidelidad, entidades soportadas, referencias, bloques,
fuentes y unidades.

## 3. Arquitectura objetivo

### 3.1 Vista lógica

``` text
┌─────────────────────────────────────────────────────────────┐
│                    WEB APP (Laravel + Livewire)              │
│ Proyectos | Planos | Revisiones | Panel IA | Aprobaciones    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                    CAD Host / JS-TS Bridge
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    MLightCAD Viewer/Editor                   │
│ DWG/DXF | Layers | Blocks | Entities | Measurements | Markup│
└──────────────────────────────┬──────────────────────────────┘
                               │ eventos / snapshot normalizado
┌──────────────────────────────▼──────────────────────────────┐
│                    APPLICATION LAYER (Laravel)               │
│ Use cases | Policies | Validation | Workflow | Audit         │
└──────────────┬──────────────────────┬────────────────────────┘
               │                      │
       Queue / Jobs             Storage / DB
               │                      │
┌──────────────▼─────────────┐  ┌─────▼───────────────────────┐
│ CAD Processing Pipeline    │  │ PostgreSQL + Object Storage│
│ Parse/Normalize/Analyze    │  │ Metadata/Versions/Results  │
└──────────────┬─────────────┘  └────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│ DOMAIN & RULE ENGINE                                         │
│ Architectural Model | Structural Concept Model | Validators  │
│ Geometry | Constraints | Units | Rule Packs | Conflicts       │
└──────────────┬──────────────────────────────────────────────┘
               │ contexto acotado y estructurado
┌──────────────▼──────────────────────────────────────────────┐
│ AI ORCHESTRATION / PROVIDER ADAPTER                           │
│ Ollama Local | GPT Provider | Claude Provider                 │
│ Prompt templates | Tool contracts | Output schemas | Guardrails│
└──────────────┬──────────────────────────────────────────────┘
               │ propuestas estructuradas
┌──────────────▼──────────────────────────────────────────────┐
│ HUMAN REVIEW + CAD GENERATION                                 │
│ Accept/Reject/Edit | Conflict Review | DXF layer/export       │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Estilo arquitectónico recomendado

Comenzar con un **monolito modular Laravel**, no con microservicios
desde el primer día.

Razones: - Reduce despliegue y complejidad operativa. - Permite
modularizar dominios sin introducir red/serialización entre cada
módulo. - Facilita desarrollar en Laragon y migrar a Docker. - Deja
límites claros para extraer servicios de procesamiento si aparecen
necesidades reales.

Separar desde el inicio los adaptadores externos: MLightCAD, proveedores
IA, almacenamiento, colas y motor DXF. Si el procesamiento geométrico
requiere Python, extraerlo como servicio separado después de validar el
contrato de datos.

### 3.3 Módulos de dominio

1.  `Projects`: proyectos, miembros, roles, metadatos.
2.  `Drawings`: archivos, versiones, formatos, checksum, unidades,
    layouts.
3.  `CadIntegration`: MLightCAD adapter, bridge, eventos y exportación.
4.  `CadExtraction`: entidades, capas, bloques, textos, cotas,
    coordenadas.
5.  `Geometry`: unidades, tolerancias, transformaciones, geometría 2D.
6.  `ArchitecturalInterpretation`: ejes, muros, puertas, ventanas,
    escaleras, espacios y niveles.
7.  `StructuralConcept`: ejes estructurales, columnas candidatas, vigas
    candidatas, losas/aberturas y continuidad conceptual.
8.  `EngineeringRules`: reglas deterministas, reglas normativas
    versionadas, validadores.
9.  `AiAssistant`: prompts, proveedores, modelos, tool calling, salida
    estructurada.
10. `ReviewWorkflow`: observaciones, aceptación/rechazo, overrides y
    aprobaciones.
11. `CadGeneration`: capas, bloques, entidades propuestas, DXF de
    salida.
12. `Audit`: historial de decisiones, evidencia, usuario, versión y
    cambios.
13. `Notifications`: progreso y avisos.
14. `Reports`: informes de análisis, conflictos y entregables.

## 4. Estructura de carpetas recomendada

La estructura debe reflejar límites de dominio y casos de uso, no crear
carpetas por cada patrón de moda.

``` text
civil-ai-platform/
├── app/
│   ├── Domain/
│   │   ├── Projects/
│   │   │   ├── Models/
│   │   │   ├── ValueObjects/
│   │   │   ├── Events/
│   │   │   └── Policies/
│   │   ├── Drawings/
│   │   ├── Cad/
│   │   ├── Geometry/
│   │   ├── Architecture/
│   │   ├── Structural/
│   │   ├── EngineeringRules/
│   │   ├── Reviews/
│   │   └── Audit/
│   ├── Application/
│   │   ├── Projects/
│   │   │   ├── CreateProject/
│   │   │   └── ...
│   │   ├── Drawings/
│   │   │   ├── UploadDrawing/
│   │   │   ├── ExtractCadEntities/
│   │   │   ├── NormalizeDrawing/
│   │   │   └── CompareDrawingVersions/
│   │   ├── Analysis/
│   │   │   ├── AnalyzeArchitecturalPlan/
│   │   │   ├── GenerateStructuralAlternatives/
│   │   │   └── ValidateStructuralProposal/
│   │   └── Reviews/
│   ├── Infrastructure/
│   │   ├── Cad/
│   │   │   └── MLightCad/
│   │   ├── Ai/
│   │   │   ├── Contracts/
│   │   │   ├── Providers/
│   │   │   │   ├── Ollama/
│   │   │   │   ├── OpenAI/
│   │   │   │   └── Anthropic/
│   │   │   ├── Prompts/
│   │   │   └── OutputSchemas/
│   │   ├── Geometry/
│   │   ├── Persistence/
│   │   ├── Queue/
│   │   └── Storage/
│   ├── Jobs/
│   ├── Livewire/
│   │   ├── Projects/
│   │   ├── Drawings/
│   │   ├── Analysis/
│   │   └── Reviews/
│   ├── Policies/
│   └── Providers/
├── resources/
│   ├── views/
│   ├── js/
│   │   ├── cad/
│   │   │   ├── mlightcad/
│   │   │   ├── bridge/
│   │   │   ├── event-handlers/
│   │   │   └── extraction/
│   │   └── app/
│   ├── css/
│   └── cad/
│       └── layer-standards/
├── config/
│   ├── ai.php
│   ├── cad.php
│   └── engineering.php
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── storage/
│   ├── app/private/drawings/originals/
│   ├── app/private/drawings/derived/
│   ├── app/private/analysis/
│   └── app/private/exports/
├── tests/
│   ├── Unit/
│   │   ├── Geometry/
│   │   ├── Rules/
│   │   └── Normalization/
│   ├── Feature/
│   ├── Integration/
│   │   ├── MLightCAD/
│   │   └── AiProviders/
│   ├── Contract/
│   └── Fixtures/
│       ├── dwg/
│       ├── dxf/
│       └── expected/
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── cad-data-model/
│   ├── engineering-rules/
│   ├── api/
│   └── operations/
├── docker/
├── scripts/
├── .env.example
├── docker-compose.yml
└── README.md
```

**Regla:** no implementar todas estas carpetas de inmediato. Crear cada
módulo cuando la fase correspondiente lo requiera. Si se introduce un
microservicio Python, mantenerlo en un directorio/repo separado con
contrato API versionado.

## 5. Modelo de datos: no guardar solo el DWG

La plataforma necesita conservar el archivo original y además una
representación estructurada que pueda consultar el motor de reglas y la
IA.

### 5.1 Entidades principales

  Entidad                    Propósito
  -------------------------- ----------------------------------------------------------
  `projects`                 Proyecto de ingeniería
  `drawings`                 Identidad del plano
  `drawing_versions`         Cada revisión del archivo
  `drawing_files`            Original y derivados almacenados
  `cad_extractions`          Resultado de extracción
  `cad_entities`             Entidades normalizadas o referencias a ellas
  `cad_layers`               Capas y propiedades
  `cad_blocks`               Bloques y referencias
  `architectural_elements`   Muros, vanos, ejes, escaleras, espacios
  `structural_proposals`     Alternativa estructural
  `structural_elements`      Elementos propuestos
  `engineering_rules`        Reglas y versiones
  `validation_results`       Errores, advertencias y observaciones
  `review_decisions`         Aceptaciones, rechazos y cambios
  `ai_runs`                  Modelo, proveedor, prompt versionado, tokens y resultado
  `audit_events`             Historial de acciones y decisiones

### 5.2 Versionado

No sobrescribir el DWG original. Cada archivo debe tener: -
`project_id` - `drawing_id` - `version_number` - `file_hash` (SHA-256) -
`original_filename` - `mime_type` - `file_size` - `units` -
`source_format` - `uploaded_by` - `uploaded_at` - `parent_version_id`
opcional - estado de extracción

Los resultados de análisis deben estar vinculados a una versión concreta
del plano. Si el arquitectónico cambia, la propuesta estructural
anterior no debe actualizarse silenciosamente.

### 5.3 Representación neutral de entidades

Ejemplo conceptual de entidad normalizada:

``` json
{
  "schema_version": "1.0",
  "drawing_version_id": "uuid",
  "entity_id": "stable-id",
  "source": {
    "cad_handle": "2AF",
    "entity_type": "LINE",
    "layer": "A-WALL"
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [[0, 0], [4500, 0]]
  },
  "units": "millimeter",
  "space": "model",
  "block_path": [],
  "confidence": 1.0
}
```

El ejemplo es ilustrativo: las coordenadas, tipos, unidades y
transformaciones deben extraerse de la API real y validarse. No asumir
que todos los planos están en milímetros ni que toda línea de una capa
`WALL` es un muro.

Para grandes planos, evitar guardar cada vértice como fila relacional si
no aporta valor. Considerar blobs JSON/archivos derivados y almacenar en
PostgreSQL metadatos, índices de búsqueda, resultados y referencias.
Medir antes de elegir PostGIS o una base geométrica adicional.

## 6. Pipeline de procesamiento CAD

El pipeline propuesto:

1.  **Ingesta:** cargar archivo, verificar extensión, tamaño, MIME real,
    hash y permisos.
2.  **Inspección:** obtener versión, unidades, layouts, capas, bloques,
    referencias y extents.
3.  **Extracción:** obtener entidades relevantes, textos, cotas,
    geometrías y atributos.
4.  **Normalización:** convertir coordenadas, unidades y tipos a un
    esquema neutral.
5.  **Control de calidad:** detectar unidades desconocidas, entidades
    fuera de rango, geometría duplicada, capas apagadas, referencias
    faltantes y objetos no soportados.
6.  **Interpretación arquitectónica:** clasificar candidatos y asignar
    confianza/evidencia.
7.  **Revisión de interpretación:** mostrar al ingeniero qué se
    identificó y qué no.
8.  **Modelo estructural conceptual:** proponer alternativas, no una
    solución definitiva automática.
9.  **Validación geométrica y reglas:** detectar conflictos y datos
    faltantes.
10. **Revisión humana:** aprobar, editar, rechazar o solicitar otra
    alternativa.
11. **Generación CAD:** crear salida en nuevas capas/archivo derivado.
12. **Auditoría y exportación:** guardar quién aprobó, reglas aplicadas,
    versión fuente y resultados.

Cada etapa debe ser idempotente: reintentar un job no debe duplicar
entidades ni generar propuestas repetidas.

## 7. Interfaz MLightCAD y comunicación con Laravel

### 7.1 Patrón recomendado

-   Livewire controla la pantalla, proyecto, estados, filtros, paneles y
    revisión.
-   MLightCAD se monta como componente JavaScript/TypeScript.
-   Un `CadBridge` traduce eventos entre el visor y la aplicación.
-   El bridge envía al backend solo datos necesarios y autorizados:
    metadatos, selecciones, geometría normalizada o paquetes de
    extracción.
-   El backend responde con propuestas estructuradas; el host del visor
    las convierte en overlays/capas de revisión mediante APIs
    soportadas.
-   La generación final se exporta como DXF derivado y se conserva el
    original.

No enviar el DWG entero al LLM como primera estrategia. Primero extraer
geometría, metadatos y contexto; luego seleccionar fragmentos
relevantes. Esto reduce tokens, coste, errores y exposición de datos.

### 7.2 Eventos de integración a definir

-   `cad:ready`
-   `cad:document-opened`
-   `cad:selection-changed`
-   `cad:layers-loaded`
-   `cad:extraction-requested`
-   `cad:extraction-completed`
-   `cad:analysis-requested`
-   `cad:proposal-received`
-   `cad:proposal-accepted`
-   `cad:proposal-rejected`
-   `cad:export-requested`
-   `cad:error`

Los nombres son convenciones propuestas, no eventos nativos garantizados
de MLightCAD.

### 7.3 Seguridad

-   El navegador no debe poder acceder a archivos de otros proyectos.
-   Firmar/autenticar las peticiones de extracción y revisión.
-   Validar permisos en Laravel, no confiar en IDs enviados por
    JavaScript.
-   Limitar tamaño, tipo, cantidad de entidades y duración de
    procesamiento.
-   Sanitizar nombres de archivos y rutas.
-   No ejecutar scripts CAD arbitrarios recibidos del usuario.
-   Separar originales de derivados.
-   Registrar descargas, exportaciones, decisiones y cambios.

## 8. Diseño de la capa de IA

### 8.1 Proveedor intercambiable

Definir una interfaz común:

``` text
AiProvider
├── analyzeStructuredContext()
├── classifyArchitecturalElements()
├── proposeStructuralAlternatives()
├── explainValidation()
└── summarizeReview()
```

Implementaciones: - `OllamaProvider` para desarrollo local. -
`OpenAIProvider` para servidor. - `AnthropicProvider` para servidor.

No hacer que el dominio dependa del SDK de un proveedor. El backend
envía contexto estructurado y valida la respuesta contra un esquema
JSON. Guardar modelo, versión, parámetros, prompt versionado, latencia,
errores y resultado.

### 8.2 Separación de responsabilidades

-   Algoritmos geométricos: deterministas y testeables.
-   Reglas de ingeniería: código/reglas versionadas y revisadas.
-   LLM: clasificación, explicación, preguntas y propuestas.
-   Ingeniero: decisiones, revisión y aprobación.
-   Software de análisis estructural: análisis/cálculo especializado
    cuando corresponda.

### 8.3 Contrato de salida de IA

No aceptar texto libre como fuente directa para crear geometría. Exigir
una respuesta estructurada, por ejemplo:

``` json
{
  "proposal_id": "uuid",
  "source_drawing_version": "uuid",
  "proposal_type": "conceptual_structural_layout",
  "status": "requires_engineer_review",
  "assumptions": [],
  "missing_information": [],
  "elements": [
    {
      "temporary_id": "candidate-column-01",
      "type": "column_candidate",
      "geometry": {
        "type": "Point",
        "coordinates": [5000, 4000]
      },
      "source_references": ["entity-handle-2AF"],
      "rationale": "Candidate location based on grid and wall intersections",
      "confidence": 0.72,
      "validation_status": "not_engineered"
    }
  ],
  "warnings": [],
  "requires_human_approval": true
}
```

El backend debe validar tipos, coordenadas, unidades, referencias,
rangos y reglas. El campo `confidence` es una estimación del modelo, no
una probabilidad calibrada ni una garantía de seguridad.

## 9. Dominio de ingeniería: arquitectura → estructura

Este es el núcleo más delicado del producto.

### 9.1 Interpretación arquitectónica

Identificar como candidatos: - Ejes y retículas. - Muros y espesores
aparentes. - Columnas arquitectónicas o elementos existentes. - Puertas,
ventanas y vanos. - Escaleras y ductos. - Patios, vacíos y dobles
alturas. - Niveles y cotas. - Límites de ambientes. - Textos, etiquetas
y notas. - Elementos repetidos entre plantas.

Cada identificación debe guardar evidencia: entidad de origen, capa,
bloque, texto asociado, geometría, regla usada y confianza.

### 9.2 Datos estructurales faltantes

Antes de proponer un sistema estructural, solicitar: - Ubicación del
proyecto y normativa. - Número de pisos y alturas. - Uso/ocupación. -
Materiales y resistencias. - Sistema estructural considerado. - Datos
geotécnicos. - Cargas permanentes y variables. - Condiciones
sísmicas/viento aplicables. - Planos de todas las plantas y
cortes/elevaciones. - Restricciones arquitectónicas y constructivas.

No inferir estos valores silenciosamente.

### 9.3 Propuestas estructurales

La IA puede proponer ubicaciones candidatas de columnas, alineación de
ejes, continuidad entre niveles, vigas de conexión, zonas de
transferencia potenciales y conflictos con vanos o circulación. Pero
cada propuesta debe marcarse como conceptual y pendiente de cálculo.

### 9.4 Validaciones iniciales

-   Elementos que no coinciden entre plantas.
-   Columnas candidatas que no tienen continuidad vertical.
-   Vigas candidatas que atraviesan huecos o escaleras.
-   Luces inusuales que requieren revisión.
-   Ejes inconsistentes.
-   Diferencias de unidades.
-   Elementos estructurales sin referencia arquitectónica.
-   Geometría fuera del perímetro.
-   Conflictos con puertas, ventanas, circulación y ductos.
-   Datos críticos faltantes.

Las reglas de cálculo y cumplimiento normativo deben ser diseñadas y
aprobadas por ingenieros estructurales; no deben inventarse desde
prompts.

## 10. UX: flujo de trabajo del ingeniero

Pantalla principal propuesta:

``` text
┌─────────────────────────────────────────────────────────────┐
│ Proyecto | Plano | Versión | Estado | Exportar              │
├───────────────────────────────┬─────────────────────────────┤
│                               │ Panel de ingeniería         │
│                               │                             │
│       MLightCAD Canvas        │ 1. Capas y entidades        │
│                               │ 2. Interpretación            │
│       Plano arquitectónico    │ 3. Datos faltantes            │
│                               │ 4. Alternativas estructurales │
│                               │ 5. Conflictos                 │
│                               │ 6. Revisión y aprobación      │
├───────────────────────────────┴─────────────────────────────┤
│ Historial | Progreso | Logs | Observaciones | Auditoría      │
└─────────────────────────────────────────────────────────────┘
```

Flujo: 1. Crear proyecto. 2. Cargar plano. 3. Abrir visor. 4. Revisar
unidades, capas y layouts. 5. Ejecutar extracción. 6. Validar
interpretación arquitectónica. 7. Completar información estructural
faltante. 8. Generar alternativas conceptuales. 9. Comparar y revisar.
10. Editar/aprobar elementos. 11. Exportar DXF estructural preliminar.
12. Registrar revisión profesional.

No ocultar incertidumbre: el panel debe distinguir `Identificado`,
`Inferido`, `Ambiguo`, `No soportado`, `Pendiente de revisión` y
`Aprobado`.

## 11. Seguridad, trazabilidad y responsabilidad profesional

-   Mantener el DWG original inmutable.
-   Cada propuesta tiene `source_drawing_version_id`.
-   Cada cambio genera una nueva revisión.
-   Guardar el usuario que acepta/rechaza una propuesta.
-   Guardar prompt, modelo, proveedor, parámetros y versión del esquema.
-   Guardar las reglas y versión normativa aplicadas.
-   No permitir que el LLM apruebe su propia propuesta.
-   No exportar como plano final si hay validaciones críticas
    pendientes.
-   Mostrar descargos y estado técnico del entregable.
-   Separar autorización de uso de IA y autorización de edición CAD.
-   Proteger planos confidenciales; con Ollama local, el contexto puede
    permanecer local, pero con GPT/Claude en servidor debe informarse y
    autorizarse la transferencia.

El sistema es una herramienta de asistencia. La responsabilidad de
diseño, cálculo, revisión, cumplimiento y firma corresponde al
profesional competente según la jurisdicción aplicable.

## 12. Plan de desarrollo por fases

### Fase 0 --- Descubrimiento y pruebas de viabilidad

**Objetivo:** comprobar que el stack y el visor pueden entregar la
información CAD necesaria.

Entregables: - Inventario de versiones de Laravel, Livewire, MLightCAD y
librerías. - Matriz de DWG/DXF reales y entidades soportadas. - Prueba
de apertura, extracción de capas, bloques, textos y entidades. - Prueba
de unidades y coordenadas. - Prueba de comunicación MLightCAD ↔ host JS
↔ Laravel. - Dataset de planos de prueba anonimizados. - ADRs de
integración.

Criterio de salida: poder abrir planos representativos y extraer datos
con fidelidad conocida, registrando limitaciones.

### Fase 1 --- Fundaciones de plataforma

-   Proyectos, usuarios, roles y permisos.
-   Subida segura de archivos.
-   Versionado de planos.
-   Almacenamiento privado.
-   Auditoría.
-   Colas y estados de procesamiento.
-   UI básica Livewire.

Criterio de salida: proyecto y archivo versionado con acceso controlado
y trazabilidad.

### Fase 2 --- Integración CAD robusta

-   Integrar MLightCAD mediante SDK/host/plugin soportado.
-   Implementar `CadBridge`.
-   Capturar metadatos y selecciones.
-   Extraer entidades, capas, bloques, textos, cotas y layouts.
-   Normalizar unidades y coordenadas.
-   Exportar DXF derivado.
-   Fixtures y pruebas de regresión CAD.

Criterio de salida: extractor repetible y validado en un conjunto
representativo de dibujos.

### Fase 3 --- Modelo geométrico y arquitectónico

-   Modelo neutral de entidades.
-   Detección de líneas, polilíneas, arcos, textos y bloques.
-   Clasificación por capas, atributos y geometría.
-   Reconocimiento inicial de ejes, muros, vanos y escaleras.
-   Evidencia y confianza.
-   Revisión manual de interpretación.

Criterio de salida: ingeniero puede corregir la interpretación y el
sistema conserva esas correcciones.

### Fase 4 --- Motor de reglas y coordinación

-   Unidades y tolerancias.
-   Reglas geométricas deterministas.
-   Comparación entre plantas.
-   Detección de inconsistencias.
-   Datos faltantes.
-   Reglas versionadas y configurables.
-   Resultados explicables.

Criterio de salida: cada advertencia tiene evidencia reproducible y no
depende de una opinión libre del LLM.

### Fase 5 --- Asistente IA

-   Contrato `AiProvider`.
-   Ollama local.
-   Proveedores GPT/Claude intercambiables.
-   Contexto CAD reducido y estructurado.
-   Salida JSON validada.
-   Clasificación asistida.
-   Preguntas sobre planos.
-   Propuestas conceptuales y explicación.
-   Registro de prompts, modelos y resultados.

Criterio de salida: respuestas vinculadas a entidades fuente, con
incertidumbre explícita y sin modificar el plano original.

### Fase 6 --- Propuesta estructural 2D asistida

-   Definición de alternativas de sistema estructural.
-   Elementos candidatos y sus referencias.
-   Revisión de continuidad entre plantas.
-   Conflictos arquitectónicos.
-   Edición manual.
-   Aprobación/rechazo.
-   Generación de capas estructurales preliminares.

Criterio de salida: el ingeniero puede revisar y modificar una
propuesta, y el sistema registra todas las decisiones.

### Fase 7 --- Exportación y coordinación

-   DXF de propuesta.
-   Capas normalizadas y leyenda.
-   Informe de supuestos y pendientes.
-   Comparación de revisiones.
-   Trazabilidad entre original, propuesta y exportación.
-   Validación de apertura en software CAD externo.

Criterio de salida: el entregable abre correctamente en aplicaciones CAD
compatibles y está claramente marcado como propuesta/revisión.

### Fase 8 --- Producción y escalabilidad

-   Ubuntu + Docker.
-   Workers independientes.
-   Redis y colas.
-   Almacenamiento de objetos.
-   Observabilidad y métricas.
-   Límites de uso de IA.
-   Retención y borrado.
-   Backups y recuperación.
-   Seguridad de archivos.
-   Pruebas de carga y concurrencia.

Criterio de salida: despliegue reproducible, monitoreado y con
recuperación probada.

## 13. Estrategia de pruebas

### 13.1 Fixtures CAD

Crear un conjunto de prueba con: - DWG/DXF simple con líneas y
polilíneas. - Bloques con atributos. - Capas apagadas/congeladas. -
Textos y cotas. - Unidades distintas. - Model space y layouts. -
Referencias externas. - Dibujos grandes. - Archivos de verticales CAD
con objetos proxy. - Dibujos con geometría duplicada o incompleta.

### 13.2 Pruebas técnicas

-   Contract tests del `CadAdapter`.
-   Unit tests de transformaciones y tolerancias.
-   Tests de normalización.
-   Tests de clasificación.
-   Tests de reglas.
-   Tests de permisos y aislamiento.
-   Tests de idempotencia de Jobs.
-   Tests de proveedor IA y esquemas JSON.
-   Tests de exportación DXF.
-   Regresión visual CAD.
-   Pruebas de rendimiento con planos grandes.

### 13.3 Métricas de producto

-   Porcentaje de entidades extraídas correctamente.
-   Precisión/recall de clasificación por tipo de elemento.
-   Tasa de entidades ambiguas.
-   Tasa de falsos positivos en conflictos.
-   Tiempo de extracción por tamaño de archivo.
-   Tiempo de análisis IA.
-   Porcentaje de propuestas aceptadas/modificadas/rechazadas.
-   Errores de exportación.
-   Trazabilidad completa por propuesta.

No fijar metas numéricas hasta crear un dataset representativo y medir
una línea base.

## 14. Riesgos y mitigaciones

  ----------------------------------------------------------------------------
  Riesgo                  Consecuencia                 Mitigación
  ----------------------- ---------------------------- -----------------------
  DWG con objetos no      Lectura incompleta           Matriz de
  soportados                                           compatibilidad y
                                                       conversión alternativa

  Unidades mal            Geometría incorrecta         Validación explícita de
  interpretadas                                        unidades y escala

  Capas con nombres no    Clasificación errónea        Heurísticas + revisión
  estándar                                             humana

  Bloques y coordenadas   Duplicados/desplazamientos   Resolver
  transformadas                                        transformaciones y
                                                       block path

  LLM inventa elementos   Propuesta peligrosa          Referencias de origen,
                                                       schema y validación

  Falta de datos          Diseño no válido             Missing-information
  estructurales                                        gate

  Cambia plano            Propuesta desactualizada     Versionado y detección
  arquitectónico                                       de cambios

  Procesamiento pesado en Timeouts                     Jobs/queues y progreso
  HTTP                                                 

  Exposición de planos    Riesgo de confidencialidad   Almacenamiento privado,
                                                       permisos y control de
                                                       proveedores

  Confundir propuesta con Riesgo profesional           Estados, advertencias y
  diseño final                                         aprobación humana

  Dependencia del visor   Acoplamiento                 Adapter y modelo
                                                       neutral

  Normativa               Validación incorrecta        Rule packs versionados
  desactualizada                                       y revisión profesional
  ----------------------------------------------------------------------------

## 15. Decisiones arquitectónicas (ADR) que deben cerrarse

Antes de implementar las fases 1--3, documentar:

-   ADR-001: MLightCAD integrado por SDK/npm, iframe o aplicación
    separada.
-   ADR-002: qué datos se extraen en navegador y cuáles en backend.
-   ADR-003: DXF como intercambio y estrategia DWG.
-   ADR-004: esquema neutral de entidades CAD.
-   ADR-005: motor geométrico PHP, TypeScript o Python.
-   ADR-006: PostgreSQL y eventual PostGIS.
-   ADR-007: estrategia de almacenamiento y versionado.
-   ADR-008: interfaz de proveedores IA.
-   ADR-009: seguridad y transferencia a GPT/Claude.
-   ADR-010: modelo de reglas de ingeniería y versionado normativo.
-   ADR-011: flujo de aprobación humana y responsabilidad profesional.

Cada ADR debe incluir contexto, alternativas, decisión, consecuencias,
riesgos y estado.

## 16. Primer sprint recomendado: prueba vertical de viabilidad

No empezar por autenticación compleja ni por el agente IA completo.
Primero construir una prueba vertical que atraviese el camino crítico.

**Sprint de prueba:**

1.  Abrir un DWG/DXF de arquitectura en MLightCAD.
2.  Leer nombre, unidades, extents, capas y layouts.
3.  Seleccionar algunas entidades.
4.  Extraer una muestra de líneas, polilíneas, textos y bloques.
5.  Normalizar la geometría en un JSON versionado.
6.  Enviar el JSON a Laravel por el bridge del host.
7.  Guardar extracción vinculada a una versión de plano.
8.  Mostrar una tabla de entidades y resaltar la selección en el visor.
9.  Ejecutar una regla geométrica sencilla.
10. Exportar un DXF derivado de prueba.

**No incluir todavía:** propuesta automática de columnas/vigas, cálculo
estructural ni generación final de planos.

La prueba valida primero la columna vertebral técnica: leer CAD,
comprender su estructura, conservar coordenadas y comunicar datos de
forma confiable.

## 17. Información que falta para cerrar el diseño

Estas decisiones no deben inventarse:

1.  Versiones exactas de Laravel y Livewire.
2.  Cómo se instaló MLightCAD: iframe, npm/SDK, fork propio o aplicación
    externa.
3.  Si se dispone del código fuente del visor o solo del producto
    compilado.
4.  Tipos y versiones de DWG/DXF que se reciben.
5.  Si los planos tienen capas normalizadas o convenciones variables.
6.  Si el objetivo inicial es identificar elementos y proponer
    distribución, o también calcular dimensiones preliminares.
7.  País y normativa estructural objetivo.
8.  Si habrá múltiples ingenieros/proyectos/empresas desde el inicio.
9.  Si el servidor enviará planos completos o solo geometría/contexto a
    GPT/Claude.
10. Qué formatos de salida se requieren: DXF, DWG, PDF, informes u
    otros.

------------------------------------------------------------------------

## 18. Referencias técnicas consultadas

### MLightCAD

-   [Documentación de desarrollo e
    integración](https://mlightcad.com/cad-viewer/docs/development/)
-   [Script API de
    MLightCAD](https://mlightcad.com/cad-viewer/docs/guide/script/api.html)
-   [Repositorio oficial de
    MLightCAD](https://github.com/mlightcad/cad-viewer)
-   [Ejemplo oficial de integración
    simple](https://github.com/mlightcad/cad-simple-viewer-example)
-   [FAQ y limitaciones de
    formatos/entidades](https://github.com/mlightcad/cad-viewer/wiki/FAQ)

### Laravel y Livewire

-   [Laravel 12 --- Queues](https://laravel.com/docs/12.x/queues)
-   [Livewire 3 --- File
    Uploads](https://livewire.laravel.com/docs/3.x/uploads)
-   [Livewire --- Estructura del
    proyecto](https://github.com/livewire/laravel-docs/blob/12.x/structure.md)

### Motores CAD y formatos

-   [Open Design Alliance --- Drawings
    SDK](https://www.opendesign.com/products/drawings)
-   [ODA Documentation](https://docs.opendesign.com/)

### Seguridad y responsabilidad

-   [OWASP Application Security Verification
    Standard](https://owasp.org/www-project-application-security-verification-standard/)
-   [OWASP File Upload Cheat
    Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

------------------------------------------------------------------------

## 19. Conclusión y recomendación

La arquitectura más razonable para este producto es un monolito modular
Laravel con Livewire para la gestión, MLightCAD integrado mediante un
adaptador de frontend, un modelo neutral de geometría CAD, un motor
determinista de reglas y una capa de IA intercambiable entre Ollama, GPT
y Claude.

La ventaja de esta estructura es que el producto no queda atado a un
solo modelo, a un solo visor ni a una sola infraestructura. Se puede
desarrollar localmente, migrar a Ubuntu/Docker y evolucionar hacia
servicios separados solo cuando la carga o las necesidades lo
justifiquen.

**La decisión más importante es no confundir lectura CAD, interpretación
arquitectónica, diseño estructural y cálculo estructural.** Son etapas
diferentes, con distintos niveles de certeza y responsabilidad.

El primer entregable debe ser una prueba vertical de extracción y
normalización CAD. Si esa base es fiable, podremos construir encima la
interpretación arquitectónica y la propuesta estructural asistida con
mucho menor riesgo.
