# Plan maestro de implementación --- CADViewer AI

## Arquitectura, agentes, procesamiento CAD/BIM, diseño estructural preliminar y metrados

**Destino:** Codex / Claude Code\
**Stack existente:** Laravel + Vite + JavaScript/TypeScript + Livewire\
**Objetivo:** evolucionar CADViewer hacia una plataforma asistida por IA
que reciba planos arquitectónicos, extraiga geometría verificable,
prepare propuestas estructurales sujetas a revisión profesional, genere
planos CAD editables y calcule metrados trazables.

**Principio rector:** no intentar resolver geometría, ingeniería
estructural y metrados únicamente con un LLM. El modelo de IA
interpreta, planifica y coordina herramientas. Los motores CAD/BIM
procesan geometría. Los motores matemáticos calculan cantidades. El
análisis estructural se ejecuta con herramientas especializadas y bajo
validación de un ingeniero responsable.

------------------------------------------------------------------------

# 0. Instrucciones obligatorias para Codex / Claude Code

Antes de modificar archivos:

1.  Inspecciona el repositorio completo y documenta la arquitectura
    real.
2.  Identifica versiones de Laravel, PHP, Node, Vite, Livewire, base de
    datos, Redis y librerías CAD existentes.
3.  Identifica cómo se visualizan, cargan, almacenan y exportan
    actualmente los planos.
4.  Localiza el agente OpenAI existente, sus prompts, herramientas,
    llamadas, manejo de archivos, logs y costos.
5.  Identifica los procesos que más demoran y mide su duración antes de
    proponer cambios.
6.  No reemplaces ni reescribas módulos que ya funcionan sin demostrar
    por qué es necesario.
7.  No agregues frameworks de agentes, motores CAD ni dependencias antes
    de comprobar compatibilidad, licencia, costo y necesidad.
8.  No cambies el motor actual de visualización CAD sin una evaluación
    comparativa y un plan de migración aprobado.
9.  No expongas claves API en el frontend.
10. No permitas que el agente ejecute SQL arbitrario, comandos del
    sistema, código generado libremente ni operaciones no autorizadas.
11. No inventes dimensiones, materiales, cargas, condiciones de suelo,
    alturas, escalas ni datos faltantes.
12. No presentes propuestas estructurales generadas por IA como diseños
    aprobados o aptos para construcción.
13. Trabaja por fases pequeñas. Cada fase debe incluir pruebas,
    criterios de aceptación y documentación.
14. Mantén compatibilidad con la aplicación actual. Usa migraciones
    reversibles y evita cambios destructivos.
15. Antes de cada fase, presenta un resumen de archivos que se
    modificarán y riesgos. Después, informa qué se implementó, pruebas
    ejecutadas y pendientes.

**Primera tarea:** crear `docs/cadviewer-ai/AS-IS-AUDIT.md` con el
diagnóstico del proyecto actual. No implementar todavía cambios
estructurales grandes.

------------------------------------------------------------------------

# 1. Visión del producto

CADViewer AI debe permitir que un usuario:

1.  Suba un plano arquitectónico.
2.  El sistema identifique el formato y evalúe la calidad del archivo.
3.  El sistema extraiga entidades, capas, unidades, coordenadas, textos,
    bloques, cotas y geometría.
4.  Construya una representación geométrica normalizada y verificable.
5.  Identifique ambientes, muros, vanos, escaleras, ejes y niveles,
    indicando confianza y ambigüedades.
6.  Solicite al usuario los datos que no pueden inferirse de forma
    confiable.
7.  Genere una o más propuestas estructurales preliminares.
8.  Permita revisión y aprobación de un ingeniero civil habilitado.
9.  Envíe el modelo aprobado a un proceso de análisis estructural
    especializado.
10. Genere planos estructurales CAD editables a partir de geometría y
    parámetros aprobados.
11. Calcule metrados mediante fórmulas deterministas y criterios
    configurables.
12. Muestre la trazabilidad de cada cantidad hasta los elementos
    geométricos que la originaron.
13. Exporte los entregables disponibles: DXF/DWG según motor y licencia,
    IFC cuando corresponda, XLSX/PDF y reportes.

## Fuera del alcance automático

-   Aprobar diseños estructurales de manera autónoma.
-   Sustituir la responsabilidad del ingeniero proyectista.
-   Garantizar que cualquier plano escaneado pueda reconstruirse sin
    intervención.
-   Inferir características geotécnicas o cargas no proporcionadas.
-   Generar documentos de construcción definitivos sin validaciones
    técnicas.
-   Afirmar compatibilidad DWG nativa si el motor integrado solo procesa
    DXF.

------------------------------------------------------------------------

# 2. Decisión arquitectónica recomendada

## 2.1 Arquitectura principal

Mantener Laravel como backend de negocio y seguridad. Incorporar un
servicio de agente independiente en Node.js + TypeScript. Mantener
Python para procesamiento CAD/BIM y cálculo científico cuando sus
librerías aporten una ventaja concreta.

  -----------------------------------------------------------------------
  Capa                    Tecnología recomendada  Responsabilidad
  ----------------------- ----------------------- -----------------------
  Aplicación web          Laravel + Livewire +    Usuarios, proyectos,
                          Blade + Vite            permisos, interfaz y
                                                  negocio

  Frontend del agente     TypeScript              Chat, progreso, eventos
                                                  y visualización de
                                                  resultados

  API de negocio          Laravel                 Autenticación,
                                                  autorización,
                                                  validación y
                                                  persistencia

  Orquestación IA         Node.js + TypeScript    Planificación, tools,
                                                  agentes especialistas y
                                                  coordinación

  LLM                     OpenAI API              Interpretación,
                                                  razonamiento y
                                                  selección de
                                                  herramientas

  Agentes                 OpenAI Agents SDK para  Ejecución de tools y
                          TypeScript, sujeto a    delegación
                          prueba de concepto      

  Workflows               Implementación propia   Flujo largo,
                          inicialmente; evaluar   reanudación, estados y
                          LangGraph JS si se      aprobación humana
                          necesita checkpointing  
                          complejo                

  CAD DXF                 Python + ezdxf          Lectura, análisis,
                                                  modificación y
                                                  generación DXF

  DWG                     Evaluar ODA Drawings    Lectura/escritura DWG y
                          SDK o Autodesk Platform automatización, sujeto
                          Services                a licencias

  BIM                     Python + IfcOpenShell   Lectura, creación y
                                                  extracción IFC

  Cálculo estructural     Integración             Análisis estructural,
                          especializada; evaluar  no generación libre por
                          OpenSeesPy y            LLM
                          herramientas            
                          comerciales             

  Metrados                Motor determinista      Cálculos repetibles y
                          versionado en Python o  auditables
                          TypeScript              

  Persistencia            Base de datos           Proyectos, geometría,
                          existente; evaluar      estados, búsqueda y
                          PostgreSQL + PostGIS +  conocimiento
                          pgvector                

  Colas                   Laravel Queue + Redis   Procesamiento asíncrono
                          si ya existe; workers   
                          independientes          

  Archivos                Almacenamiento privado  Planos originales,
                          actual o S3 compatible  intermedios y
                                                  entregables

  Observabilidad          Logs estructurados,     Rendimiento, costos,
                          métricas y trazas       errores y auditoría
  -----------------------------------------------------------------------

## 2.2 No introducir todo de golpe

Orden recomendado:

1.  Auditar el stack actual.
2.  Mantener el motor de visualización actual.
3.  Implementar extracción DXF con ezdxf como primer caso controlado, si
    DXF es compatible.
4.  Crear un modelo geométrico normalizado.
5.  Implementar el servicio TypeScript del agente.
6.  Integrar OpenAI mediante herramientas tipadas.
7.  Implementar metrados deterministas.
8.  Evaluar DWG con ODA/APS según necesidades reales.
9.  Incorporar IFC.
10. Integrar análisis estructural especializado.

No instalar simultáneamente OpenAI Agents SDK, LangGraph, CrewAI,
AutoGen y n8n en el núcleo. Elegir un solo orquestador principal. n8n
puede ser una herramienta externa de automatización, no el motor de
ingeniería.

------------------------------------------------------------------------

# 3. Arquitectura lógica

``` text
Usuario
  |
  v
CADViewer (Laravel + Livewire + Vite)
  |
  +--> Autenticación / autorización / proyectos / archivos
  |
  +--> Laravel API + Queue + Redis
          |
          +--> Agent Service (Node.js + TypeScript)
          |       |
          |       +--> OpenAI API / Agents SDK
          |       |
          |       +--> Planificador de workflow
          |       |
          |       +--> Tools tipadas
          |               |
          |               +--> CAD extraction tool
          |               +--> Geometry validation tool
          |               +--> Architectural interpretation tool
          |               +--> Structural proposal tool
          |               +--> Structural analysis tool
          |               +--> CAD generation tool
          |               +--> Quantity takeoff tool
          |               +--> Export tool
          |
          +--> Workers especializados
                  |
                  +--> CAD Worker (Python / ezdxf / ODA si aplica)
                  +--> BIM Worker (Python / IfcOpenShell)
                  +--> Quantity Worker (cálculos deterministas)
                  +--> Structural Worker (motor de análisis integrado)
  |
  v
Base de datos + almacenamiento de archivos
  |
  +--> Geometría normalizada
  +--> Versiones y estados del proyecto
  +--> Resultados y metrados
  +--> Evidencias, aprobaciones y auditoría
  +--> Archivos originales y derivados
```

## 3.1 Límites de responsabilidad

**Laravel** - Es la autoridad de identidad, permisos y propiedad de
datos. - Autoriza cada acción. - Mantiene proyectos, archivos,
versiones, aprobaciones y auditoría. - Nunca confía en que el agente
valide sus propios permisos.

**Agent Service** - Recibe objetivos del usuario. - Selecciona
herramientas permitidas. - Coordina etapas y solicita información
faltante. - No calcula geometría o cantidades por intuición. - No tiene
acceso irrestricto a la base de datos.

**CAD/BIM workers** - Procesan archivos mediante bibliotecas
especializadas. - Devuelven resultados estructurados. - No deciden
criterios de diseño estructural.

**Motor de metrados** - Ejecuta fórmulas deterministas. - Registra
fórmula, unidades, parámetros, versión y elementos de origen. - No
utiliza el LLM para hacer operaciones aritméticas finales.

**Motor de análisis estructural** - Recibe un modelo definido y datos de
entrada identificados. - Devuelve resultados de análisis y
advertencias. - Debe tener validaciones y revisión profesional.

------------------------------------------------------------------------

# 4. Modelo de datos común

La pieza central debe ser un modelo geométrico normalizado,
independiente del formato de entrada y del motor CAD.

No enviar todo el plano como texto al LLM. Extraerlo una vez,
almacenarlo y consultar solo los fragmentos necesarios.

## 4.1 Entidades mínimas

-   `Project`
-   `PlanFile`
-   `PlanVersion`
-   `DrawingLayer`
-   `DrawingEntity`
-   `BuildingLevel`
-   `GridAxis`
-   `Space`
-   `Wall`
-   `Opening`
-   `Stair`
-   `StructuralElement`
-   `StructuralProposal`
-   `StructuralModel`
-   `AnalysisRun`
-   `QuantityTakeoff`
-   `QuantityItem`
-   `Review`
-   `Approval`
-   `AgentRun`
-   `AgentToolCall`
-   `KnowledgeDocument`

Reutilizar convenciones, modelos y tablas existentes si ya hay
equivalentes. No duplicar el dominio sin necesidad.

## 4.2 Ejemplo de modelo geométrico normalizado

``` json
{
  "schema_version": "1.0",
  "project_id": "project-uuid",
  "source_file_id": "file-uuid",
  "source_format": "dxf",
  "units": {
    "linear": "m",
    "area": "m2",
    "volume": "m3"
  },
  "coordinate_system": {
    "origin": [0, 0, 0],
    "axis_convention": "x-y-z",
    "unit_scale": 1.0
  },
  "levels": [
    {
      "id": "level-01",
      "name": "Piso 1",
      "elevation": null,
      "status": "requires_confirmation"
    }
  ],
  "entities": [],
  "spaces": [],
  "walls": [],
  "openings": [],
  "axes": [],
  "uncertainties": [],
  "validation": {
    "status": "pending",
    "issues": []
  }
}
```

El ejemplo es un contrato inicial ilustrativo. Ajustar campos tras
auditar las entidades reales que utiliza CADViewer.

## 4.3 Reglas geométricas

-   Conservar coordenadas originales y unidades originales.
-   Mantener una transformación explícita entre unidades de origen y
    unidades normalizadas.
-   No asumir que una unidad de dibujo equivale a un metro.
-   Registrar el origen de cada dato: entidad CAD, texto, dimensión,
    usuario o inferencia IA.
-   Diferenciar valores medidos, inferidos y confirmados.
-   Conservar referencias al archivo, capa, handle/ID y entidad de
    origen.
-   Mantener tolerancias geométricas configurables.
-   Versionar cualquier transformación o modificación.
-   No eliminar entidades originales durante la normalización.
-   Validar geometrías abiertas, autointersecciones, duplicados y
    entidades fuera de escala.

------------------------------------------------------------------------

# 5. Flujo de trabajo de extremo a extremo

Implementar un workflow con estados persistentes. No depender de una
única conversación larga con el modelo.

``` text
UPLOADED
  |
  v
FILE_VALIDATION
  |
  v
CAD_EXTRACTION
  |
  v
GEOMETRY_NORMALIZATION
  |
  v
GEOMETRY_VALIDATION
  |
  v
ARCHITECTURAL_INTERPRETATION
  |
  v
USER_CLARIFICATION (si faltan datos críticos)
  |
  v
STRUCTURAL_PRELIMINARY_PROPOSAL
  |
  v
ENGINEER_REVIEW
  |
  v
STRUCTURAL_ANALYSIS
  |
  v
ANALYSIS_REVIEW
  |
  v
CAD_GENERATION
  |
  v
QUANTITY_TAKEOFF
  |
  v
FINAL_QA
  |
  v
DELIVERABLES_READY
```

Cada transición debe comprobar sus precondiciones. Un estado no puede
avanzar por una decisión textual del LLM; debe existir una validación
ejecutable.

## 5.1 Estados de error y recuperación

Definir estados adicionales:

-   `NEEDS_USER_INPUT`
-   `NEEDS_ENGINEER_REVIEW`
-   `FAILED_RETRYABLE`
-   `FAILED_FINAL`
-   `CANCELLED`
-   `SUPERSEDED`

Cada job debe ser idempotente o disponer de mecanismos de deduplicación.
Los reintentos no deben duplicar elementos CAD ni metrados.

## 5.2 Preguntas al usuario

Solicitar únicamente datos que no puedan obtenerse de forma confiable.
Ejemplos:

-   Unidad real del dibujo.
-   Altura entre pisos.
-   Número de niveles.
-   Uso y ocupación.
-   Sistema estructural previsto, si existe.
-   Datos de suelo o estudio geotécnico.
-   Materiales y resistencias especificadas.
-   Cargas especiales.
-   Ubicación del proyecto y parámetros normativos aplicables.

Guardar la respuesta como dato confirmado, con usuario y fecha.

------------------------------------------------------------------------

# 6. Diseño de agentes y herramientas

No crear seis agentes autónomos que conversen sin control. Comenzar con
un coordinador y herramientas especializadas. Separar agentes
especialistas solo cuando haya una ventaja medible.

## 6.1 Coordinador

Responsabilidades: - Entender la solicitud. - Leer el estado actual del
proyecto. - Identificar la siguiente operación permitida. - Invocar la
herramienta correspondiente. - Gestionar errores y aclaraciones. -
Comunicar progreso. - Solicitar aprobación humana en puntos definidos.

## 6.2 Herramientas iniciales

Implementar contratos tipados equivalentes a:

``` text
inspect_plan_file(file_id)
extract_cad_entities(file_id)
normalize_geometry(extraction_id)
validate_geometry(model_id)
interpret_architecture(model_id)
request_missing_information(project_id)
create_structural_proposal(model_id, confirmed_inputs)
validate_structural_model(structural_model_id)
run_structural_analysis(structural_model_id)
generate_structural_drawing(structural_model_id)
calculate_quantities(structural_model_id, measurement_ruleset_id)
export_deliverables(project_id, version_id, formats)
```

Cada herramienta debe: - Validar usuario, proyecto y permisos. - Validar
esquema de entrada. - Verificar estado y precondiciones. - Ejecutar una
operación concreta. - Devolver un resultado estructurado. - Registrar
duración, errores y versión de herramienta. - Evitar efectos secundarios
inesperados. - Ser idempotente cuando corresponda.

## 6.3 Contrato de respuesta de herramientas

``` json
{
  "status": "success",
  "operation_id": "uuid",
  "project_id": "uuid",
  "artifact_id": "uuid",
  "data": {},
  "warnings": [],
  "errors": [],
  "metrics": {
    "duration_ms": 0
  }
}
```

Usar estados controlados: `success`, `partial`, `needs_input`, `failed`.

## 6.4 No confiar en la salida del modelo

-   Validar todos los argumentos con Zod o esquema equivalente.
-   Validar IDs contra el proyecto del usuario.
-   Rechazar dimensiones negativas, unidades desconocidas y coordenadas
    fuera de límites.
-   No permitir rutas de archivos arbitrarias.
-   No permitir comandos de shell enviados por el LLM.
-   No permitir SQL libre.
-   Aplicar límites de tiempo, tokens, tamaño de archivo y número de
    herramientas.
-   Exigir aprobación para cambios destructivos o acciones de ingeniería
    de alto impacto.

------------------------------------------------------------------------

# 7. Procesamiento CAD y BIM

## 7.1 Primera versión: DXF

Si el CADViewer admite DXF, iniciar con `ezdxf`.

Extraer, como mínimo: - LINE - LWPOLYLINE - POLYLINE - ARC - CIRCLE -
SPLINE, si aplica - INSERT / BLOCK - TEXT - MTEXT - DIMENSION - HATCH,
cuando sea relevante - capas, colores, linetypes y propiedades -
unidades y variables del dibujo

No asumir que cada línea representa un muro ni que cada bloque
representa una columna. La clasificación requiere reglas, contexto y
revisión.

## 7.2 DWG

Antes de seleccionar ODA o Autodesk Platform Services:

1.  Confirmar necesidad de lectura y/o escritura DWG.
2.  Confirmar versiones DWG requeridas.
3.  Confirmar si el usuario necesita fidelidad de entidades, bloques,
    estilos, referencias externas y layouts.
4.  Comparar licencias, costos, despliegue, restricciones de uso y
    volumen.
5.  Crear prueba de compatibilidad con planos reales anonimizados.
6.  Evaluar conversión a DXF solo si no se pierde información esencial.

No anunciar soporte DWG nativo hasta verificarlo con pruebas.

## 7.3 PDF e imágenes

Pipeline diferenciado: - Detectar PDF vectorial frente a escaneado. -
Extraer vectores cuando existan. - Aplicar OCR a textos. - Detectar
líneas, símbolos y cotas con visión artificial. - Calibrar escala
mediante dimensiones conocidas o confirmación del usuario. - Registrar
incertidumbre y precisión. - Permitir corrección manual.

Nunca tratar píxeles como coordenadas métricas sin calibración.

## 7.4 IFC

Incorporar IfcOpenShell cuando exista una necesidad BIM clara: - Lectura
de IFC. - Geometría de elementos. - Propiedades y relaciones. -
Extracción de cantidades. - Exportación o intercambio de modelos.

No forzar IFC como formato interno único si el producto está centrado en
CAD 2D. El modelo geométrico normalizado debe ser independiente del
formato.

------------------------------------------------------------------------

# 8. Propuesta estructural y seguridad de ingeniería

Esta parte requiere especial cuidado.

## 8.1 Separar propuesta de diseño aprobado

El agente puede: - Identificar luces y alineamientos. - Detectar zonas
que requieren revisión. - Proponer alternativas preliminares. - Preparar
modelos de análisis. - Señalar conflictos arquitectónicos. - Explicar
supuestos y datos faltantes.

El agente no debe: - Declarar una estructura segura sin análisis. -
Elegir cimentaciones sin información geotécnica suficiente. - Inventar
cargas o propiedades de materiales. - Aprobar secciones estructurales
por similitud con proyectos previos. - Generar planos constructivos
definitivos sin revisión profesional.

## 8.2 Datos mínimos y trazabilidad

Cada parámetro debe indicar: - Valor. - Unidad. - Fuente. - Fecha. -
Estado: `measured`, `inferred`, `user_confirmed`, `engineer_approved`. -
Responsable de confirmación. - Norma y versión aplicable, si
corresponde.

## 8.3 Normativa

Crear una biblioteca documental versionada. Para Perú, evaluar las
normas aplicables del Reglamento Nacional de Edificaciones, incluyendo
según el caso: - E.020 Cargas. - E.030 Diseño Sismorresistente. - E.050
Suelos y Cimentaciones. - E.060 Concreto Armado. - E.070 Albañilería. -
E.090 Estructuras Metálicas.

Verificar siempre texto vigente, modificaciones, ámbito de aplicación y
fecha. No codificar valores normativos sin guardar referencia, versión y
cláusula. No tratar una recuperación RAG como sustituto de la revisión
del documento oficial.

------------------------------------------------------------------------

# 9. Motor determinista de metrados

El LLM identifica elementos y parámetros. El motor de metrados ejecuta
fórmulas.

## 9.1 Requisitos

-   Fórmulas versionadas.
-   Unidades explícitas.
-   Reglas de medición por partida.
-   Descuentos y encuentros configurables.
-   Manejo de vacíos y aberturas.
-   Desperdicios separados del metrado neto.
-   Trazabilidad hasta entidad y versión de plano.
-   Redondeo definido por partida.
-   Pruebas unitarias con casos conocidos.
-   Exportación a Excel y PDF.
-   Diferenciar cantidad geométrica, cantidad contractual y cantidad con
    desperdicio.

## 9.2 Ejemplo de item

``` json
{
  "code": "CONC-COL",
  "description": "Concreto en columnas",
  "unit": "m3",
  "formula_id": "column_volume_v1",
  "source_elements": ["column-001", "column-002"],
  "parameters": {
    "width_m": 0.30,
    "depth_m": 0.40,
    "height_m": 3.00,
    "quantity": 2
  },
  "net_quantity": 0.72,
  "waste_factor": 0,
  "measured_quantity": 0.72,
  "ruleset_version": "1.0",
  "review_status": "pending"
}
```

El motor debe recalcular cantidades cuando cambie la geometría o los
parámetros, sin volver a consultar al LLM para hacer aritmética.

## 9.3 Reglas especiales

No asumir que el volumen de vigas, columnas, losas y cimentaciones se
suma sin descontar intersecciones. Las reglas deben definir cómo se
computan encuentros y solapes para evitar doble conteo.

El acero requiere reglas más complejas: diámetros, longitudes, ganchos,
anclajes, traslapes, separación, cantidad de barras y peso unitario. No
derivarlo de un porcentaje genérico salvo que el método de estimación
esté expresamente identificado como preliminar.

------------------------------------------------------------------------

# 10. Memoria y conocimiento

Separar cuatro tipos de memoria:

1.  **Memoria de ejecución:** estado del workflow, tarea actual,
    intentos y resultados.
2.  **Memoria del proyecto:** datos confirmados, decisiones, revisiones
    y versiones.
3.  **Conocimiento normativo:** documentos oficiales, normas, manuales y
    criterios con referencias.
4.  **Casos de experiencia:** proyectos anteriores revisados y aprobados
    por profesionales.

## 10.1 RAG

Comenzar con RAG antes de fine-tuning.

-   Indexar documentos con metadatos.
-   Registrar institución, título, versión, fecha, páginas y vigencia.
-   Recuperar fragmentos relevantes con citas.
-   Filtrar por país, especialidad, material y versión.
-   No permitir que documentos no oficiales sobrescriban normas
    oficiales.
-   Mostrar fuente y fragmento que respalda cada respuesta técnica.

## 10.2 Casos de proyectos

Cada caso debe incluir: - Archivo original. - Geometría extraída. -
Propuesta IA. - Correcciones del ingeniero. - Modelo aprobado. -
Análisis. - Metrados revisados. - Comentarios y versión normativa.

No convertir automáticamente cada resultado en dato de entrenamiento.
Solo los casos revisados y autorizados pueden entrar al conjunto de
referencia.

## 10.3 Fine-tuning

No implementar al inicio. Evaluarlo cuando: - Exista dataset suficiente
y legalmente utilizable. - Haya una tarea repetitiva y medible. - Se
disponga de conjunto de evaluación independiente. - Se demuestre que
RAG, herramientas y prompts no resuelven el problema. - Se pueda
comparar el modelo ajustado con la línea base.

------------------------------------------------------------------------

# 11. Rendimiento y costos

Instrumentar cada operación antes de optimizar.

Métricas: - Tiempo total por archivo. - Tiempo de extracción CAD. -
Cantidad de entidades procesadas por segundo. - Tiempo de
interpretación. - Tokens de entrada y salida. - Costo por proyecto. -
Número de llamadas al modelo. - Número de llamadas a herramientas. -
Tasa de reintentos. - Errores por formato. - Tiempo de generación CAD. -
Tiempo de metrados.

## 11.1 Optimizaciones prioritarias

1.  Extraer geometría una sola vez por versión del archivo.
2.  Persistir resultados de extracción y normalización.
3.  Cachear operaciones puras con claves basadas en hash del archivo,
    versión del extractor y parámetros.
4.  Reprocesar solo entidades afectadas por cambios cuando sea posible.
5.  Enviar al LLM resúmenes y fragmentos relevantes, no todo el CAD.
6.  Ejecutar tareas independientes en paralelo.
7.  Mantener secuenciales las etapas que dependen de aprobaciones o
    validaciones.
8.  Usar modelos más económicos para clasificación simple y reservar
    modelos más capaces para razonamiento complejo.
9.  Limitar llamadas, tokens y tiempo por workflow.
10. Medir antes y después de cada optimización.

------------------------------------------------------------------------

# 12. Seguridad, permisos y auditoría

-   Mantener archivos privados.
-   Verificar propiedad del proyecto en cada endpoint y tool.
-   Escanear archivos y validar formatos reales, no solo extensiones.
-   Limitar tamaño, cantidad de entidades y tiempo de procesamiento.
-   Aislar workers y limitar recursos.
-   No ejecutar macros, scripts o comandos incluidos en archivos.
-   Evitar path traversal y nombres de archivo no confiables.
-   Proteger contra prompt injection presente en textos del plano o
    documentos.
-   Tratar todo contenido del archivo como dato no confiable, nunca como
    instrucciones para el agente.
-   No dar al agente credenciales de base de datos con permisos
    administrativos.
-   No exponer secretos al navegador.
-   Registrar llamadas, usuario, proyecto, argumentos validados,
    resultado y duración.
-   Definir retención y eliminación de archivos.
-   Solicitar confirmación para operaciones destructivas.
-   Mantener historial de aprobaciones y revisiones.

------------------------------------------------------------------------

# 13. Interfaz de usuario

Crear una sección propia dentro del sistema existente: **CADViewer AI**.

Pantallas sugeridas:

1.  Proyectos y archivos.
2.  Conversación con el agente.
3.  Progreso del análisis.
4.  Visor del plano original.
5.  Capas y entidades detectadas.
6.  Panel de incidencias y datos faltantes.
7.  Propuesta estructural superpuesta.
8.  Comparación de versiones.
9.  Revisión y aprobación profesional.
10. Panel de metrados.
11. Trazabilidad de cada partida.
12. Descarga de entregables.

La interfaz debe mostrar: - Estado actual. - Porcentaje de progreso solo
si se calcula de manera real. - Etapa ejecutada. - Advertencias. - Datos
inferidos frente a confirmados. - Herramientas utilizadas cuando sea
relevante. - Tiempo transcurrido. - Acción requerida del usuario.

No mostrar un porcentaje ficticio ni afirmar que un proceso terminó si
el worker no confirmó el resultado.

------------------------------------------------------------------------

# 14. Plan de implementación por fases

## Fase 0 --- Auditoría del sistema actual

**Objetivo:** entender qué existe antes de cambiarlo.

Tareas: - Inspeccionar repositorio y dependencias. - Identificar visor
CAD y formatos soportados. - Mapear flujo de carga y almacenamiento. -
Revisar agente OpenAI existente. - Identificar prompts, tools y llamadas
repetidas. - Medir rendimiento actual. - Identificar problemas de
precisión. - Revisar seguridad y permisos.

Entregables: - `AS-IS-AUDIT.md` - Diagrama de arquitectura actual. -
Lista de cuellos de botella. - Inventario de dependencias y licencias. -
Recomendación de cambios mínimos.

Criterio de aceptación: - Se conoce el flujo real de un archivo desde la
carga hasta el resultado. - Se identifica con evidencia dónde se consume
el tiempo. - No se han realizado cambios destructivos.

## Fase 1 --- Prueba de extracción CAD

**Objetivo:** convertir un plano DXF de prueba en geometría normalizada.

Tareas: - Seleccionar 3 a 5 planos representativos y autorizados. -
Crear extractor con ezdxf si el formato encaja. - Extraer entidades,
capas, unidades, bloques, textos y dimensiones. - Normalizar unidades y
coordenadas. - Generar JSON validado. - Crear visualización de
diagnóstico. - Comparar resultados con el plano original.

Entregables: - CAD worker inicial. - Contrato de geometría. - Pruebas
unitarias. - Reporte de precisión y limitaciones.

Criterio de aceptación: - Repetibilidad en los mismos archivos. -
Unidades identificadas o marcadas como desconocidas. - Referencia de
cada entidad a su origen. - Ninguna dimensión crítica inventada. -
Errores y ambigüedades visibles.

## Fase 2 --- Servicio de agente TypeScript

**Objetivo:** separar la orquestación de la interfaz Laravel.

Tareas: - Crear servicio Node.js + TypeScript. - Configurar variables de
entorno y secretos. - Implementar comunicación autenticada con
Laravel. - Integrar OpenAI Agents SDK en una prueba acotada. - Definir
tools con Zod. - Registrar ejecuciones y tool calls. - Implementar
límites, timeout y manejo de errores. - Integrar eventos de progreso con
la aplicación.

Entregables: - Servicio de agente. - API interna documentada. - Tools
tipadas. - Pruebas de autorización. - Logs estructurados.

Criterio de aceptación: - El agente puede invocar una herramienta de
extracción. - Laravel verifica permisos. - El agente no tiene acceso
arbitrario a datos. - Las llamadas quedan auditadas. - Las claves no
aparecen en el frontend.

## Fase 3 --- Modelo geométrico y validación arquitectónica

**Objetivo:** convertir extracción CAD en una interpretación
arquitectónica revisable.

Tareas: - Identificar muros, vanos, ambientes, escaleras y ejes. -
Clasificar con reglas y contexto. - Usar visión IA solo donde la
geometría no baste. - Registrar confianza y fuente. - Detectar
inconsistencias. - Permitir correcciones manuales. - Versionar
correcciones.

Criterio de aceptación: - Los elementos detectados se pueden
inspeccionar. - El usuario puede corregirlos. - Las correcciones
persisten. - Las incertidumbres se muestran. - Se distingue dato
extraído de inferencia IA.

## Fase 4 --- Propuesta estructural preliminar

**Objetivo:** producir alternativas que un ingeniero pueda revisar.

Tareas: - Definir datos mínimos de entrada. - Implementar reglas
preliminares configurables. - Identificar luces y alineamientos. -
Proponer alternativas de distribución. - Detectar conflictos con
arquitectura. - Solicitar información faltante. - Generar un modelo
estructural preliminar. - Incorporar aprobación profesional.

Criterio de aceptación: - La propuesta nunca se etiqueta como diseño
aprobado. - Cada parámetro tiene fuente y estado. - Los supuestos se
muestran. - No se generan dimensiones definitivas sin datos
suficientes. - Existe revisión y aprobación humana.

## Fase 5 --- Generación CAD

**Objetivo:** crear un plano estructural editable.

Tareas: - Definir capas, estilos y convenciones. - Generar entidades a
partir del modelo aprobado. - Mantener coordenadas y unidades. - Crear
etiquetas, ejes, cotas y cuadros según especificación. - Comparar
geometría de salida con modelo fuente. - Exportar y volver a abrir el
archivo generado para validarlo.

Criterio de aceptación: - El archivo se abre en el visor actual y en una
herramienta CAD de referencia. - No hay geometría fuera de escala. - Las
capas son consistentes. - Los elementos generados corresponden al modelo
aprobado. - El original permanece intacto.

## Fase 6 --- Motor de metrados

**Objetivo:** calcular cantidades repetibles y trazables.

Tareas: - Definir catálogo de partidas. - Definir unidades y fórmulas
versionadas. - Implementar reglas de intersección y descuentos. -
Implementar volúmenes, áreas y longitudes. - Implementar acero con
reglas específicas cuando se disponga de despiece. - Crear pruebas con
cálculos manuales de referencia. - Crear exportación Excel/PDF. -
Vincular cada cantidad con elementos de origen.

Criterio de aceptación: - Mismo input y versión de reglas producen mismo
resultado. - Cada cantidad tiene fórmula, parámetros y elementos de
origen. - No hay doble conteo no documentado. - Las cantidades se
recalculan al cambiar la geometría. - Las pruebas numéricas pasan.

## Fase 7 --- BIM y análisis estructural

**Objetivo:** incorporar intercambio BIM y análisis especializado.

Tareas: - Evaluar IFC e IfcOpenShell. - Definir mapeo de entidades CAD
al modelo BIM. - Evaluar OpenSeesPy y/o integración comercial. - Crear
adaptador de entrada y salida. - Validar unidades, apoyos, materiales,
cargas y combinaciones. - Documentar límites de automatización. -
Incorporar revisión profesional de resultados.

Criterio de aceptación: - El modelo de análisis puede reconstruirse
desde datos versionados. - Las entradas están documentadas. - Los
resultados se pueden auditar. - No se aprueba automáticamente un diseño.

## Fase 8 --- Evaluación, optimización y despliegue

Tareas: - Crear dataset de pruebas representativo. - Medir precisión por
tipo de entidad. - Medir tiempo y costo por proyecto. - Evaluar modelos
y prompts. - Probar archivos complejos y casos límite. - Probar fallos,
reintentos y recuperación. - Revisar seguridad. - Desplegar por etapas
con feature flags.

Criterio de aceptación: - Métricas comparables antes/después. - No hay
regresiones críticas. - Se conocen límites de formatos y casos no
soportados. - Existe mecanismo de rollback.

------------------------------------------------------------------------

# 15. Evaluación de calidad: cómo saber si el agente realmente mejora

Crear un conjunto de referencia con planos reales autorizados y
resultados revisados.

Métricas: - Precisión y recall por tipo de entidad. - Error geométrico
de coordenadas y dimensiones. - Porcentaje de unidades correctamente
identificadas. - Porcentaje de ambientes correctamente detectados. -
Tasa de elementos duplicados. - Error de cantidades frente a metrado de
referencia. - Porcentaje de casos que requieren corrección humana. -
Tiempo por etapa. - Costo por proyecto. - Tasa de fallos y reintentos.

No evaluar solo por si el dibujo "se ve bien". Evaluar geometría,
parámetros, cálculo, trazabilidad y revisión.

## 15.1 Pruebas de regresión

Cada modificación del extractor, prompt, modelo o motor debe ejecutarse
contra el mismo conjunto de planos. Guardar resultados versionados para
detectar degradaciones.

------------------------------------------------------------------------

# 16. Estructura sugerida del repositorio

Adaptar a la estructura existente; no imponer una reestructuración si el
proyecto ya tiene convenciones sólidas.

``` text
repository/
├── app/                         # Laravel existente
├── resources/
│   ├── views/
│   └── js/
│       └── cadviewer-ai/         # UI TypeScript si encaja con Vite
├── routes/
├── database/
├── services/
│   └── agent-service/            # Node.js + TypeScript
│       ├── src/
│       │   ├── agent/
│       │   ├── tools/
│       │   ├── workflows/
│       │   ├── contracts/
│       │   ├── security/
│       │   ├── telemetry/
│       │   └── index.ts
│       ├── tests/
│       ├── package.json
│       └── tsconfig.json
├── workers/
│   ├── cad-worker/                # Python
│   ├── bim-worker/                # Python, cuando aplique
│   └── quantity-worker/           # Python o TypeScript
├── docs/
│   └── cadviewer-ai/
│       ├── AS-IS-AUDIT.md
│       ├── ARCHITECTURE.md
│       ├── GEOMETRY-SCHEMA.md
│       ├── WORKFLOW.md
│       ├── SECURITY.md
│       ├── METRADOS-RULES.md
│       ├── ADR/
│       └── IMPLEMENTATION-LOG.md
└── tests/
```

------------------------------------------------------------------------

# 17. Decisiones técnicas que deben documentarse (ADR)

Crear un ADR para cada decisión importante:

1.  Agente TypeScript independiente frente a agente dentro de Laravel.
2.  OpenAI Agents SDK frente a LangGraph.
3.  DXF con ezdxf frente a motor comercial DWG.
4.  Modelo geométrico normalizado.
5.  PostgreSQL/PostGIS frente a base actual.
6.  Redis y estrategia de colas.
7.  IFC y momento de incorporación.
8.  Motor de análisis estructural.
9.  Formato de trazabilidad de metrados.
10. Estrategia de RAG y evaluación de fine-tuning.

Cada ADR debe incluir contexto, alternativas, decisión, consecuencias,
costos, licencias y fecha.

------------------------------------------------------------------------

# 18. Prompt de ejecución inicial para Codex / Claude Code

Copiar y pegar este prompt como primera instrucción:

> Actúa como arquitecto de software senior especializado en Laravel,
> TypeScript, agentes de IA, CAD/BIM y sistemas de ingeniería.
>
> Estoy desarrollando CADViewer, una aplicación existente basada en
> Laravel, Vite y Livewire. El objetivo futuro es permitir que el
> usuario cargue planos arquitectónicos, el sistema extraiga geometría,
> interprete arquitectura, prepare propuestas estructurales
> preliminares, genere planos CAD editables y calcule metrados
> trazables.
>
> No quiero que reconstruyas el proyecto desde cero ni que implementes
> todo de una sola vez.
>
> Tu primera tarea es auditar el repositorio completo. Identifica: -
> Stack y versiones. - Arquitectura Laravel y módulos. - Motor actual de
> visualización y edición CAD. - Formatos de entrada y salida. - Flujo
> de archivos. - Implementación actual de OpenAI. - Prompts y
> herramientas existentes. - Cuellos de botella y tiempos. - Base de
> datos, colas, almacenamiento y seguridad. - Dependencias, licencias y
> riesgos.
>
> Después crea `docs/cadviewer-ai/AS-IS-AUDIT.md`,
> `docs/cadviewer-ai/ARCHITECTURE.md` y un plan incremental de
> implementación.
>
> La arquitectura objetivo debe conservar Laravel como autoridad de
> autenticación, permisos, negocio y persistencia; evaluar un servicio
> de agente Node.js + TypeScript; usar OpenAI mediante herramientas
> tipadas; emplear Python y bibliotecas especializadas para CAD/BIM
> cuando aporten valor; mantener el motor de visualización actual; y
> separar geometría, análisis estructural y metrados deterministas.
>
> No agregues dependencias antes de comprobar compatibilidad. No
> reemplaces módulos que funcionan sin justificación. No inventes
> capacidades del motor CAD. No permitas que el LLM invente dimensiones
> ni calcule metrados definitivos por texto. No permitas que el agente
> apruebe diseños estructurales.
>
> Cuando termines la auditoría, detente y presenta los hallazgos,
> riesgos, arquitectura recomendada y la primera fase de implementación.
> Espera mi aprobación antes de realizar cambios importantes.

------------------------------------------------------------------------

# 19. Prompt para continuar después de aprobar la auditoría

> Implementa únicamente la Fase 1 del plan CADViewer AI: extracción CAD
> DXF y normalización geométrica.
>
> Antes de codificar, confirma qué formatos y entidades admite el motor
> actual y cómo se integrará sin romper la aplicación.
>
> Implementa un worker aislado con ezdxf solo si el formato y el entorno
> lo justifican. Extrae entidades, capas, bloques, textos, dimensiones y
> unidades. Conserva las referencias de origen. Normaliza coordenadas y
> unidades únicamente cuando la unidad esté identificada o confirmada.
>
> Devuelve un JSON validado contra un esquema versionado. Registra
> errores, advertencias, entidades no soportadas y tiempo de
> procesamiento.
>
> Añade pruebas unitarias y de integración con archivos de muestra
> autorizados. Incluye casos con unidades desconocidas, geometrías
> abiertas, bloques, duplicados y archivos inválidos.
>
> No implementes todavía diseño estructural ni metrados. Al finalizar,
> presenta resultados, pruebas, limitaciones y métricas.

------------------------------------------------------------------------

# 20. Orden de prioridades recomendado

  -----------------------------------------------------------------------
  Prioridad               Trabajo                 Motivo
  ----------------------- ----------------------- -----------------------
  P0                      Auditoría del CADViewer Evita reconstrucciones
                          actual                  innecesarias

  P1                      Extracción DXF y        Base de todo el sistema
                          geometría normalizada   

  P2                      Servicio de agente      Separa IA del frontend
                          TypeScript              

  P3                      Interpretación          Convierte geometría en
                          arquitectónica          información útil
                          validable               

  P4                      Metrados deterministas  Genera valor medible y
                                                  verificable

  P5                      Propuesta estructural   Automatiza una parte
                          preliminar              del flujo de ingeniería

  P6                      Generación CAD          Produce entregables
                                                  editables

  P7                      DWG comercial e IFC     Amplía compatibilidad

  P8                      Análisis estructural    Añade verificación de
                          especializado           ingeniería

  P9                      RAG, casos y            Mejora el rendimiento y
                          optimización avanzada   consistencia
  -----------------------------------------------------------------------

**Recomendación de ejecución:** no esperes a tener un sistema
multiagente completo para obtener valor. Primero consigue que un plano
DXF se convierta de manera confiable en geometría normalizada. Luego
construye sobre esa base.

------------------------------------------------------------------------

# 21. Resultado esperado del proyecto

Al completar las fases, CADViewer AI debe ser capaz de:

-   Recibir archivos dentro de los formatos explícitamente soportados.
-   Extraer geometría con referencias al origen.
-   Identificar datos faltantes y pedir confirmación.
-   Interpretar arquitectura con incertidumbre explícita.
-   Proponer alternativas estructurales preliminares.
-   Someterlas a revisión profesional y análisis especializado.
-   Generar planos CAD editables.
-   Calcular metrados reproducibles.
-   Vincular cada partida a los elementos que la originaron.
-   Exportar resultados y conservar versiones.
-   Medir precisión, tiempo y costo por proyecto.

**La meta no es tener un chatbot que dibuje estructuras. La meta es
construir un motor de ingeniería verificable, donde la IA coordine
herramientas especializadas y cada resultado pueda inspeccionarse,
corregirse, reproducirse y aprobarse.**
