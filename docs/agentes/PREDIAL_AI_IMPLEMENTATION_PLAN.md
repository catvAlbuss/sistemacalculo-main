# PREDIAL AI --- Plan de implementación para Codex / Claude Code

**Versión:** 1.0\
**Fecha:** 19-11-2026\
**Propósito:** construir un sistema que lea planos prediales DWG/DXF,
extraiga geometría y texto, genere JSON/GeoJSON trazables y conecte
agentes especializados con OpenAI.

## 1. Instrucciones para Codex / Claude Code

Actúa como arquitecto de software y desarrollador senior en Python, CAD,
GIS, PostGIS y agentes de IA.

**Antes de programar:** 1. Inspecciona el repositorio, estructura,
dependencias, pruebas y entorno. 2. Identifica el sistema operativo,
versión de Python y herramientas CAD instaladas. 3. Revisa licencias,
compatibilidad y riesgos de conversión DWG. 4. Propón un plan pequeño
para la Fase 0 y el Sprint 1. 5. Espera aprobación antes de realizar
cambios estructurales.

**Reglas obligatorias:** - No inventes coordenadas, áreas, unidades,
datum, EPSG ni metadatos. - Conserva intacto el archivo CAD original. -
Registra `handle`, tipo de entidad, capa y propiedades de origen cuando
existan. - Distingue datos originales, normalizados, inferencias de IA y
correcciones humanas. - Usa código determinista para cálculos
geométricos; no delegues cálculos exactos a un LLM. - No marques un
resultado como validado sin ejecutar las reglas correspondientes. -
Añade pruebas a cada módulo. - No incorpores dependencias sin justificar
mantenimiento, licencia y compatibilidad. - No expongas claves API ni
subas planos privados a Git. - No ejecutes acciones destructivas,
despliegues ni cambios irreversibles sin aprobación. - Al finalizar cada
fase, informa archivos modificados, pruebas, resultados, limitaciones y
siguiente paso.

## 2. Objetivo del producto

PREDIAL AI será una plataforma para procesar planos de saneamiento
físico-legal y predios.

Funciones: - Recibir DWG y DXF. - Convertir DWG a DXF mediante una
herramienta compatible. - Extraer capas, entidades, bloques, atributos,
textos, cotas y geometrías. - Reconstruir predios, lotes y manzanas. -
Calcular vértices, áreas, perímetros y relaciones espaciales cuando los
datos lo permitan. - Clasificar textos y capas. - Relacionar etiquetas
con geometrías. - Generar JSON y GeoJSON versionados. - Detectar
inconsistencias y solicitar revisión humana. - Guardar información en
PostgreSQL/PostGIS. - Conectar agentes mediante OpenAI API.

**Límite jurídico:** el plano no acredita por sí solo titularidad ni
validez jurídica de linderos. Los diagnósticos deben contrastarse con
partidas, títulos, antecedentes y normativa, y requieren revisión
profesional.

## 3. Arquitectura

``` text
DWG/DXF
  -> ingesta y almacenamiento del original
  -> conversión DWG a DXF (si aplica)
  -> extractor CAD (ezdxf)
  -> normalización y trazabilidad
  -> motor geométrico (Shapely / GeoPandas)
  -> interpretación semántica (reglas + OpenAI)
  -> JSON / GeoJSON
  -> validación (Pydantic + JSON Schema)
  -> revisión humana
  -> PostgreSQL + PostGIS
  -> agentes OpenAI y aplicación web
```

Empieza con un **monolito modular**. No introduzcas microservicios hasta
que exista una necesidad real.

Principios: - Python/CAD/GIS extrae y calcula. - OpenAI interpreta,
explica y coordina herramientas. - PostGIS almacena y consulta
geometrías. - Pydantic y JSON Schema validan contratos. - La revisión
humana aprueba resultados sensibles.

## 4. Repositorios oficiales

Clona o instala solo lo necesario. Antes de integrarlo, revisa README,
licencia, releases, compatibilidad y actividad.

  ------------------------------------------------------------------------------------------------
  Proyecto                Repositorio                                      Función
  ----------------------- ------------------------------------------------ -----------------------
  ezdxf                   https://github.com/mozman/ezdxf                  Leer y escribir DXF

  Shapely                 https://github.com/shapely/shapely               Operaciones geométricas

  GeoPandas               https://github.com/geopandas/geopandas           Datos geoespaciales

  pyproj                  https://github.com/pyproj4/pyproj                Sistemas de coordenadas

  GDAL                    https://github.com/OSGeo/gdal                    Herramientas
                                                                           geoespaciales

  PostgreSQL              https://github.com/postgres/postgres             Base de datos

  PostGIS                 https://github.com/postgis/postgis               Extensión espacial

  Pydantic                https://github.com/pydantic/pydantic             Validación de datos

  FastAPI                 https://github.com/fastapi/fastapi               API backend

  OpenAI Agents SDK       https://github.com/openai/openai-agents-python   Agentes y handoffs

  OpenAI Python SDK       https://github.com/openai/openai-python          Conexión a OpenAI API

  LangGraph (opcional)    https://github.com/langchain-ai/langgraph        Flujos con estado y
                                                                           revisión humana

  Tesseract (opcional)    https://github.com/tesseract-ocr/tesseract       OCR para imágenes

  React                   https://github.com/facebook/react                Interfaz

  Next.js                 https://github.com/vercel/next.js                Aplicación web

  pytest                  https://github.com/pytest-dev/pytest             Pruebas
  ------------------------------------------------------------------------------------------------

### DWG: decisión de conversión

DWG es un formato propietario. Evaluar: - ODA File Converter:
https://www.opendesign.com/guestfiles/oda_file_converter - ODA SDK:
https://www.opendesign.com/ - Autodesk Platform Services:
https://aps.autodesk.com/

ODA indica que File Converter permite convertir versiones DWG/DXF,
ofrece interfaz gráfica y línea de comandos; revisar sus términos de
uso. El uso no comercial y el uso comercial del SDK tienen condiciones
distintas. Consultar licencia antes de desplegar o redistribuir.\
Referencias:
https://www.opendesign.com/faq/question/what-are-oda-viewer-and-oda-file-converter
y https://www.opendesign.com/pricing

No asumir conversión sin pérdida. Guardar el original, logs, versión de
conversor, advertencias y entidades no procesadas.

## 5. Stack inicial

  -----------------------------------------------------------------------
  Área                                Tecnología
  ----------------------------------- -----------------------------------
  Lenguaje                            Python

  CAD                                 ezdxf

  DWG                                 Adaptador desacoplado ODA o
                                      Autodesk APS

  Geometría                           Shapely

  GIS                                 GeoPandas + pyproj

  Base de datos                       PostgreSQL + PostGIS

  Validación                          Pydantic + JSON Schema

  Backend                             FastAPI

  Agentes                             OpenAI Agents SDK

  API IA                              OpenAI Python SDK / Responses API
                                      según documentación vigente

  Interfaz                            Next.js + React

  Pruebas                             pytest

  Contenedores                        Docker Compose

  Calidad                             Ruff; mypy opcional

  Versionado                          Git
  -----------------------------------------------------------------------

Fijar versiones en `pyproject.toml` y lockfile. No usar dependencias
flotantes en producción.

## 6. Esquema PREDIAL-CAD-JSON

Crear `schemas/predial-cad-v1.schema.json` y modelos Pydantic
equivalentes.

Módulos: 1. `documento`: ID, archivo, hash, formato, versión CAD y
metadatos. 2. `referencia_espacial`: unidades, datum, proyección, zona,
hemisferio, EPSG y estado. 3. `capas`: nombre, color, tipo de línea y
propiedades. 4. `entidades`: tipo CAD, handle, capa, coordenadas y
propiedades originales. 5. `predios`: ID, geometría, área/perímetro
rotulados y calculados. 6. `vertices`: orden, coordenadas, elevación y
origen. 7. `colindancias`: lado, descripción, entidad relacionada y
evidencia. 8. `textos`: original, normalizado, tipo, capa, posición y
clasificación. 9. `validaciones`: reglas, resultados, errores y
advertencias. 10. `trazabilidad`: hash, versiones, parámetros, fecha y
revisiones.

Reglas: - Nunca reemplazar texto original por texto normalizado. - Nunca
confundir área rotulada y calculada. - Nunca inventar datum, zona UTM o
EPSG. - Usar `null` para datos desconocidos. - Registrar unidades y
precisión. - Conservar el handle y la capa de origen. - Guardar
evidencia de inferencias IA, modelo y nivel de confianza cuando
exista. - Registrar correcciones humanas con usuario, fecha, valor
anterior, valor nuevo y motivo. - Versionar el esquema.

Ejemplo abreviado:

``` json
{
  "schema": "PREDIAL-CAD-JSON",
  "version": "1.0.0",
  "documento": {
    "id": "PLANO-001",
    "archivo_original": "plano.dwg",
    "sha256": "hash_calculado",
    "formato_original": "DWG",
    "formato_procesado": "DXF"
  },
  "referencia_espacial": {
    "unidad": null,
    "datum": null,
    "zona_utm": null,
    "epsg": null,
    "estado": "no_verificado"
  },
  "capas": [],
  "entidades": [],
  "predios": [],
  "textos": [],
  "validaciones": [],
  "trazabilidad": {
    "version_extractor": "0.1.0",
    "revision_humana": "pendiente"
  }
}
```

## 7. Estructura del repositorio

``` text
predial-ai/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── pyproject.toml
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   ├── dwg-conversion.md
│   ├── validation-rules.md
│   ├── agent-design.md
│   └── decisions/
├── schemas/
│   └── predial-cad-v1.schema.json
├── src/predial_ai/
│   ├── api/
│   ├── ingestion/
│   ├── conversion/
│   ├── cad_extractor/
│   ├── normalization/
│   ├── geometry/
│   ├── semantics/
│   ├── validation/
│   ├── exporters/
│   ├── database/
│   ├── agents/
│   └── settings/
├── tests/
│   ├── fixtures/
│   ├── unit/
│   ├── integration/
│   └── evaluation/
├── datasets/
│   ├── raw/
│   ├── labeled/
│   ├── train/
│   ├── validation/
│   └── test/
└── scripts/
```

No subir planos privados, datos personales ni secretos a Git.

## 8. Fases de desarrollo

### Fase 0 --- Auditoría y diseño

-   Inspeccionar repositorio, entorno y dependencias.
-   Seleccionar 5--10 DXF de prueba no confidenciales.
-   Verificar licencias y versiones.
-   Definir tipos de planos y entidades prioritarias.
-   Aprobar esquema JSON y arquitectura.
-   Documentar decisiones (ADR).

**Entregables:** diagnóstico, arquitectura, backlog y riesgos.\
**Salida:** aprobación del responsable.

### Fase 1 --- Extractor DXF

-   Carga y validación de archivos.
-   Hash SHA-256.
-   Lectura de Model Space y Paper Space cuando aplique.
-   Extracción de capas.
-   LINE, LWPOLYLINE, POLYLINE, CIRCLE, ARC, SPLINE, HATCH y POINT.
-   TEXT, MTEXT, DIMENSION, INSERT, ATTRIB y ATTDEF.
-   Handles, capas y propiedades.
-   Registro de entidades no soportadas.
-   Generación y validación JSON.

**Entregable:** extractor DXF reproducible.

### Fase 2 --- Conversión DWG

-   Interfaz `CadConverter`.
-   Adaptador del proveedor aprobado.
-   Conversión DWG a DXF.
-   Registro de versiones, logs y advertencias.
-   Gestión de fallos.
-   Comparación de inventarios cuando sea posible.

**Entregable:** adaptador DWG probado y con licencia verificada.

### Fase 3 --- Motor geométrico

-   Normalización de unidades cuando se conozcan.
-   Interpretación de bulges y segmentos curvos.
-   Reconstrucción de polígonos.
-   Extracción de vértices.
-   Cálculo de áreas y perímetros.
-   Detección de autointersecciones, solapamientos y vacíos.
-   Identificación de segmentos compartidos.
-   Registro de tolerancias.
-   Exportación GeoJSON.

**Entregable:** motor geométrico probado.

### Fase 4 --- Interpretación semántica

-   Taxonomía de capas y textos.
-   Clasificación de cotas y anotaciones.
-   Reconocimiento de lotes y manzanas.
-   Asociación texto-geometría.
-   Identificación de candidatos a colindancias.
-   OpenAI solo para casos ambiguos.
-   Evidencia, confianza y revisión humana.

**Entregable:** interpretador semántico asistido.

### Fase 5 --- Base espacial

-   PostgreSQL/PostGIS.
-   Migraciones.
-   Tablas de documentos, procesamientos, capas, entidades, predios y
    revisiones.
-   Índices espaciales.
-   Consultas de intersección, contención y proximidad.
-   Acceso por roles, copias de seguridad y recuperación.

**Entregable:** persistencia espacial.

### Fase 6 --- Agentes OpenAI

Agentes: - Coordinador. - Lector CAD. - Analista geométrico. - Analista
documental. - Comparador predial. - Validador.

Herramientas: - `get_document_metadata` - `list_layers` - `get_entity` -
`get_parcel` - `get_parcel_vertices` - `calculate_area` -
`calculate_perimeter` - `find_intersections` -
`compare_labeled_and_calculated_area` - `search_project_documents` -
`create_review_request`

Reglas: - Consultar datos por herramientas; no inventar resultados. -
Los cálculos son deterministas. - Las respuestas citan IDs de documentos
y entidades de origen. - Normativa con fuente, fecha y jurisdicción. -
No modificar geometrías ni documentos sin aprobación.

**Entregable:** asistente predial trazable.

### Fase 7 --- RAG y conocimiento

-   Incorporar normativa oficial, manuales, directivas y casos
    revisados.
-   Registrar fuente, fecha, versión y jurisdicción.
-   Detectar documentos derogados.
-   Priorizar fuentes oficiales vigentes.
-   Citar documentos en respuestas.
-   No generalizar automáticamente un caso particular.

**Entregable:** biblioteca documental consultable.

### Fase 8 --- Aprendizaje y evaluación

-   Registrar correcciones humanas.
-   Crear datasets de extracción, clasificación, asociación y
    preguntas/respuestas.
-   Separar entrenamiento, validación y prueba por proyecto o fuente.
-   Medir precisión y regresiones.
-   Ajustar reglas o modelos solo cuando las métricas mejoren.
-   Evaluar fine-tuning solo si hay suficientes ejemplos revisados y una
    tarea que lo justifique.

**Entregable:** ciclo de mejora controlado.

### Fase 9 --- Interfaz

-   Carga DWG/DXF.
-   Visualizador y capas.
-   Selección de entidades.
-   Predios detectados.
-   Coordenadas y vértices.
-   Áreas y perímetros.
-   Comparación rotulado/calculado.
-   Observaciones y revisión.
-   Descarga JSON/GeoJSON.
-   Chat con agente.
-   Historial y trazabilidad.

**Entregable:** plataforma piloto.

## 9. Integración de OpenAI

Usar OpenAI Agents SDK para agentes con herramientas, handoffs,
guardrails, sesiones y trazas. Consultar documentación vigente antes de
fijar versiones o patrones.

Repositorios: - https://github.com/openai/openai-agents-python -
https://github.com/openai/openai-python

Documentación: - https://developers.openai.com/api/docs/guides/agents -
https://openai.github.io/openai-agents-python/

Variables `.env`:

``` env
OPENAI_API_KEY=
OPENAI_MODEL=
DATABASE_URL=
CAD_CONVERTER_PATH=
STORAGE_PATH=
APP_ENV=development
```

La clave API solo debe existir en backend. Añadir límites de gasto,
registro de consumo, manejo de errores y política de datos. No enviar
planos de clientes a servicios externos sin autorización y revisión de
privacidad.

## 10. Agente constructor: Codex / Claude Code

Mantener instrucciones del proyecto: - `AGENTS.md`: reglas generales
para agentes de programación. - `CLAUDE.md`: instrucciones para Claude
Code; puede remitir a `AGENTS.md`. - `docs/architecture.md`:
arquitectura vigente. - `docs/decisions/`: decisiones técnicas (ADR). -
`docs/development-workflow.md`: flujo de trabajo y pruebas.

Flujo: 1. Leer instrucciones. 2. Inspeccionar código antes de editar. 3.
Proponer un plan pequeño. 4. Implementar una tarea. 5. Ejecutar pruebas
y análisis estático. 6. Revisar el diff. 7. Actualizar documentación. 8.
Informar resultados y pedir aprobación para acciones sensibles.

No cambiar simultáneamente esquema, base de datos, extractor y prompts
sin migraciones y pruebas coordinadas.

## 11. Pruebas y métricas

Pruebas: - Lectura DXF. - Conversión DWG. - Cobertura de entidades. -
Bloques y transformaciones. - Textos y cotas. - Polígonos y curvas. -
Geometrías inválidas. - Sistemas de coordenadas. - Validación JSON. -
Persistencia PostGIS. - Herramientas de agentes. - Permisos y secretos.

Métricas: - Cobertura de entidades. - Exactitud de extracción. -
Precisión y exhaustividad de predios. - Error de área. - Exactitud de
coordenadas. - Asociación texto-geometría. - Casos que requieren
revisión humana. - Respuestas del agente respaldadas por evidencia. -
Regresiones entre versiones.

No prometer 100 % de lectura. Definir metas después de medir una muestra
representativa de planos reales.

## 12. Primer sprint: prototipo DXF

**Objetivo:** procesar 5--10 DXF y generar inventarios JSON trazables.

Tareas: 1. Inspeccionar entorno y crear estructura. 2. Fijar
dependencias. 3. Preparar muestras no confidenciales. 4. Leer capas. 5.
Extraer LINE y LWPOLYLINE. 6. Extraer TEXT y MTEXT. 7. Extraer INSERT y
atributos. 8. Guardar handle, tipo y capa. 9. Generar JSON. 10. Validar
con Pydantic. 11. Añadir pruebas unitarias. 12. Documentar entidades no
procesadas.

**Aceptación:** JSON válido, datos trazables, errores registrados,
resultados reproducibles y pruebas automáticas. No implementar aún
multiagentes ni fine-tuning.

## 13. Prompt inicial para Codex / Claude Code

Pega este texto con el repositorio abierto:

> Lee íntegramente `PREDIAL_AI_IMPLEMENTATION_PLAN.md`, `AGENTS.md` y
> `CLAUDE.md` si existen. Actúa como arquitecto y desarrollador senior
> del proyecto PREDIAL AI.
>
> No implementes todas las fases. Primero inspecciona repositorio,
> entorno, dependencias, pruebas y archivos existentes. Identifica
> riesgos técnicos, licencias y decisiones pendientes.
>
> Presenta un diagnóstico y un plan detallado para ejecutar únicamente
> la Fase 0 y preparar el Sprint 1 del extractor DXF. No modifiques
> archivos hasta que apruebe el plan.
>
> Prioriza trazabilidad, extracción determinista, pruebas, seguridad y
> compatibilidad. No inventes datos CAD. Conserva los archivos
> originales. Toda inferencia de IA debe distinguirse de los datos
> extraídos.

## 14. Decisiones pendientes del responsable

-   Sistema operativo y entorno.
-   Versiones DWG/DXF.
-   Proveedor y licencia de conversión DWG.
-   Tipos de planos prioritarios.
-   Sistemas de coordenadas y unidades frecuentes.
-   Volumen de archivos.
-   Despliegue local, nube o híbrido.
-   Política de envío de planos a OpenAI.
-   Roles de revisión y aprobación.
-   Metas de precisión del piloto.

## 15. Resultado esperado

Una plataforma que procese CAD, extraiga geometría y texto, identifique
elementos prediales, genere JSON/GeoJSON, almacene información espacial
y permita a agentes conectados a OpenAI responder consultas y apoyar
diagnósticos técnicos preliminares.

**Orden de prioridad:** extracción fiable → geometría validada → JSON
versionado → revisión humana → base espacial → agentes OpenAI → datasets
y mejora continua → plataforma completa.
