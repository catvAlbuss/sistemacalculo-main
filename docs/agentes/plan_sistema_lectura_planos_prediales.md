# Plan de desarrollo: Sistema inteligente de lectura de planos DWG/DXF para saneamiento físico-legal

**Nombre provisional:** PREDIAL AI\
**Versión del plan:** 1.0\
**Objetivo:** construir un sistema que procese planos prediales en
formato DWG/DXF, extraiga información geométrica y textual, la
estructure en JSON y genere conjuntos de datos confiables para agentes
de inteligencia artificial especializados.

------------------------------------------------------------------------

## 1. Resumen ejecutivo

El proyecto contempla el desarrollo de un motor de interpretación de
planos CAD orientado al saneamiento físico-legal y la gestión predial.
El sistema recibirá archivos DWG y DXF, extraerá sus entidades, capas,
bloques, textos, cotas y geometrías, reconstruirá elementos prediales y
generará información estructurada mediante un esquema JSON común.

La solución separará tres funciones:

1.  **Extracción determinista:** recuperar los datos que realmente
    contiene el archivo CAD.
2.  **Interpretación semántica:** inferir qué representan las entidades
    y relacionar textos con geometrías.
3.  **Validación técnica:** comprobar consistencia geométrica,
    trazabilidad y correspondencia con la información consignada en el
    plano.

La inteligencia artificial no deberá inventar ni corregir
silenciosamente datos geométricos. Toda interpretación deberá conservar
su evidencia de origen y su estado de validación.

## 2. Objetivos

### 2.1. Objetivo general

Diseñar e implementar una plataforma que convierta planos prediales
DWG/DXF en información geométrica y textual estructurada, verificable y
reutilizable para entrenar y operar agentes de IA especializados en
saneamiento físico-legal.

### 2.2. Objetivos específicos

-   Leer archivos DWG y DXF y registrar sus metadatos.
-   Extraer capas, entidades CAD, bloques, atributos, textos y cotas.
-   Reconstruir polígonos de predios, lotes y manzanas.
-   Obtener vértices, coordenadas, longitudes, áreas y perímetros.
-   Identificar etiquetas, colindancias, vías, áreas afectadas y
    anotaciones.
-   Detectar inconsistencias geométricas y diferencias entre áreas
    rotuladas y calculadas.
-   Generar JSON y GeoJSON bajo esquemas versionados.
-   Almacenar los resultados en una base de datos espacial.
-   Crear datasets revisados por especialistas para evaluar y mejorar
    agentes de IA.
-   Proporcionar una interfaz para visualizar, corregir y aprobar
    resultados.

## 3. Alcance funcional

### 3.1. Entradas

-   DWG, mediante conversión o API compatible.
-   DXF, como formato de procesamiento intermedio y de entrada directa.
-   Archivos de referencia externos, cuando estén disponibles y puedan
    resolverse.
-   Metadatos aportados por el usuario: proyecto, ubicación, tipo de
    plano y observaciones.

### 3.2. Información que se extraerá

**Información documental** - Nombre y hash del archivo. - Formato y
versión CAD. - Nombre del proyecto y ubicación, si aparecen. - Tipo y
número de plano. - Fecha, escala y responsable, si están consignados.

**Referencia espacial** - Sistema de coordenadas. - Datum y
proyección. - Zona UTM y hemisferio. - Código EPSG, únicamente cuando
pueda determinarse con sustento. - Unidad de dibujo y factores de
conversión.

**Información CAD** - Capas, colores y tipos de línea. - Entidades LINE,
LWPOLYLINE, POLYLINE, CIRCLE, ARC, SPLINE, HATCH y POINT. - Bloques
INSERT y sus transformaciones. - TEXT, MTEXT, ATTRIB, ATTDEF y
DIMENSION. - Tablas y demás entidades compatibles con la biblioteca de
lectura. - Identificador CAD o handle, capa y propiedades originales.

**Información predial interpretada** - Predios, lotes y manzanas. -
Polígonos y vértices. - Coordenadas Este/Norte. - Área y perímetro
calculados. - Área y perímetro rotulados en el plano. - Linderos y
colindancias. - Vías, servidumbres y afectaciones representadas. - Áreas
remanentes y superpuestas, cuando estén identificadas.

### 3.3. Fuera del alcance inicial

-   Determinar titularidad o derechos reales a partir del plano.
-   Declarar jurídicamente válidos linderos o áreas.
-   Reemplazar la calificación registral o el criterio de un profesional
    competente.
-   Corregir automáticamente geometrías sin dejar evidencia y sin
    aprobación.
-   Interpretar como coordenadas oficiales valores que no tengan sistema
    de referencia confirmado.

## 4. Arquitectura técnica propuesta

La solución se desarrollará inicialmente como una aplicación modular. Se
recomienda evitar microservicios en la primera versión para reducir
complejidad y facilitar las pruebas.

### 4.1. Capas de arquitectura

1.  **Ingesta:** carga, identificación, almacenamiento y control de
    archivos.
2.  **Conversión CAD:** conversión DWG a DXF cuando sea necesario.
3.  **Extracción CAD:** lectura de capas, entidades, bloques, textos y
    cotas.
4.  **Motor geométrico:** reconstrucción de geometrías, cálculos y
    topología.
5.  **Interpretación semántica:** clasificación de capas, textos y
    elementos prediales.
6.  **Generación de datos:** producción de JSON y GeoJSON validados por
    esquema.
7.  **Control de calidad:** reglas, advertencias, trazabilidad y
    revisión humana.
8.  **Persistencia:** almacenamiento de archivos, resultados y
    geometrías.
9.  **Agentes IA:** consulta, análisis y generación de diagnósticos
    preliminares.
10. **Interfaz:** visualizador CAD, panel de resultados y herramientas
    de revisión.

### 4.2. Flujo general

``` text
Archivo DWG/DXF
      |
      v
Registro del archivo y hash SHA-256
      |
      v
Conversión DWG -> DXF (si corresponde)
      |
      v
Extracción de capas, entidades, bloques y textos
      |
      v
Normalización de unidades y propiedades
      |
      v
Reconstrucción geométrica y análisis topológico
      |
      v
Clasificación semántica con reglas e IA
      |
      v
Generación JSON + GeoJSON
      |
      v
Validación automática y revisión humana
      |
      v
Base de datos espacial y datasets aprobados
      |
      v
Agentes especializados de análisis predial
```

## 5. Tecnologías recomendadas

  -----------------------------------------------------------------------
  Componente              Tecnología              Uso
  ----------------------- ----------------------- -----------------------
  Lenguaje principal      Python                  Orquestación y
                                                  procesamiento

  Lectura DXF             ezdxf                   Lectura de entidades y
                                                  propiedades CAD

  Conversión DWG          ODA File Converter o    Conversión a DXF
                          API compatible          

  Geometría               Shapely                 Operaciones geométricas
                                                  y validación

  Datos espaciales        GeoPandas               Gestión de geometrías

  Sistemas de referencia  pyproj                  Transformaciones de
                                                  coordenadas

  Base de datos           PostgreSQL + PostGIS    Persistencia y
                                                  consultas espaciales

  Validación JSON         Pydantic y JSON Schema  Validación de
                                                  estructura y tipos

  OCR                     Tesseract, si se        Textos en imágenes o
                          requiere                documentos rasterizados

  IA                      LLM y modelos           Interpretación
                          multimodales            semántica y consultas

  Backend                 FastAPI                 API de procesamiento

  Interfaz                React o Next.js         Visualizador y panel de
                                                  revisión

  Control de versiones    Git                     Código y cambios de
                                                  esquema
  -----------------------------------------------------------------------

**Criterio técnico:** DXF será el formato intermedio de trabajo, pero se
conservará el archivo original. La conversión DWG/DXF debe registrar
versión, incidencias y entidades no compatibles. No se debe asumir que
toda conversión es sin pérdida.

## 6. Diseño del esquema PREDIAL-CAD-JSON

Se establecerá un esquema común, versionado y documentado. Como mínimo
incluirá:

  Módulo                  Contenido
  ----------------------- ---------------------------------------------------
  `documento`             Identificación, archivo, formato y metadatos
  `referencia_espacial`   Datum, proyección, zona, EPSG y unidades
  `capas`                 Nombre y propiedades de capas CAD
  `entidades`             Elementos CAD originales y sus propiedades
  `predios`               Objetos prediales interpretados
  `vertices`              Coordenadas y orden de vértices
  `colindancias`          Lados, colindantes y evidencias
  `textos`                Texto original, normalizado y clasificación
  `validaciones`          Resultados, advertencias y estado de revisión
  `trazabilidad`          Archivo, entidad CAD, proceso y versión del motor

### 6.1. Ejemplo ilustrativo

``` json
{
  "schema": "PREDIAL-CAD-JSON",
  "version": "1.0.0",
  "documento": {
    "id": "PLANO-0001",
    "archivo_original": "plano_predial.dwg",
    "formato_original": "DWG",
    "formato_procesado": "DXF",
    "tipo": "plano_perimetrico"
  },
  "referencia_espacial": {
    "sistema": "UTM",
    "datum": "WGS84",
    "zona": null,
    "hemisferio": null,
    "unidad": "metros",
    "epsg": null,
    "estado": "pendiente_verificacion"
  },
  "capas": [
    {
      "nombre": "LOTE",
      "entidades": 1
    }
  ],
  "predios": [
    {
      "id": "PREDIO-001",
      "identificador_original": "LOTE 01",
      "tipo_geometria": "Polygon",
      "area_rotulada_m2": null,
      "area_calculada_m2": null,
      "perimetro_calculado_m": null,
      "vertices": [],
      "colindancias": [],
      "fuente_geometria": {
        "entidad_cad": "LWPOLYLINE",
        "handle": "A1B2C3",
        "capa": "LOTE"
      }
    }
  ],
  "textos": [],
  "validaciones": {
    "poligonos_cerrados": null,
    "autointersecciones": null,
    "area_consistente": null,
    "coordenadas_verificadas": false,
    "revision_humana": true
  },
  "trazabilidad": {
    "motor_version": "0.1.0",
    "fecha_procesamiento": null
  }
}
```

Los valores nulos indican datos no disponibles o no verificados; no
deben sustituirse por estimaciones. El esquema definitivo deberá incluir
geometrías en un formato normalizado y referencias a las entidades CAD
de origen.

### 6.2. Representación original e interpretada

Cada elemento deberá conservar: - Valor original extraído del archivo. -
Valor normalizado. - Interpretación semántica. - Método de extracción. -
Identificador de la entidad CAD de origen. - Nivel de confianza, cuando
intervenga un modelo probabilístico. - Estado de revisión humana.

Ejemplo: el texto original `L-01` puede interpretarse como `Lote 01`,
pero ambos valores deben permanecer disponibles.

## 7. Motor de extracción CAD

El primer módulo programable utilizará `ezdxf` para leer DXF.

### 7.1. Responsabilidades

-   Abrir y verificar archivos DXF.
-   Leer capas y sus propiedades.
-   Recorrer las entidades del espacio modelo y, según el caso, los
    espacios papel.
-   Extraer geometrías y textos.
-   Procesar bloques INSERT, atributos y transformaciones.
-   Capturar handles y propiedades originales.
-   Registrar entidades no compatibles o fallidas.
-   Producir un inventario de entidades en JSON.

### 7.2. Entidades prioritarias

  Entidad         Datos principales
  --------------- -----------------------------------------------
  LINE            Inicio, fin y longitud
  LWPOLYLINE      Vértices, cierre, bulges y elevación
  POLYLINE        Vértices y geometría
  CIRCLE          Centro y radio
  ARC             Centro, radio y ángulos
  SPLINE          Puntos de control y parámetros disponibles
  HATCH           Contornos y patrones
  INSERT          Bloque, punto de inserción, escala y rotación
  POINT           Coordenadas
  TEXT            Contenido, posición y estilo
  MTEXT           Contenido, posición y formato
  DIMENSION       Tipo, geometría y texto de cota
  ATTRIB/ATTDEF   Etiquetas y valores de atributos

No se limitará la extracción al espacio modelo si el plano utiliza
presentaciones, bloques o referencias externas para representar
información relevante.

## 8. Motor geométrico y espacial

### 8.1. Funciones

-   Reconstruir polígonos a partir de polilíneas cerradas y otros
    elementos relacionados.
-   Identificar vértices y ordenarlos según la geometría real.
-   Calcular áreas y perímetros en unidades conocidas.
-   Detectar geometrías inválidas y autointersecciones.
-   Identificar segmentos compartidos y relaciones entre predios.
-   Detectar solapamientos y vacíos.
-   Diferenciar geometría original de geometría reparada.
-   Transformar coordenadas únicamente cuando el sistema de referencia
    esté identificado.

### 8.2. Reglas esenciales

-   No asumir que una polilínea abierta representa un predio completo.
-   No cerrar automáticamente polígonos sin registrar la operación.
-   Considerar bulges y segmentos curvos de polilíneas.
-   No calcular áreas métricas confiables si se desconocen las unidades
    o el sistema de coordenadas.
-   Conservar la precisión original y documentar cualquier redondeo.
-   No confundir el área rotulada con el área calculada.
-   Registrar la tolerancia aplicada en cada validación.

## 9. Interpretación semántica con IA

La IA se utilizará para clasificar y relacionar información, no para
sustituir los cálculos geométricos.

### 9.1. Tareas

-   Clasificar capas por su probable función.
-   Reconocer etiquetas de lotes y manzanas.
-   Clasificar textos como área, perímetro, coordenada, colindancia,
    escala o anotación.
-   Relacionar textos con entidades geométricas.
-   Identificar posibles linderos y colindantes.
-   Detectar ambigüedades y solicitar revisión.
-   Explicar los resultados mediante lenguaje natural.

### 9.2. Estrategia

Combinar reglas deterministas, diccionarios configurables y modelos de
IA. La clasificación deberá registrar la evidencia utilizada y no
convertir una inferencia en un hecho confirmado.

## 10. Agentes especializados

Se propone un coordinador que distribuya consultas entre agentes con
responsabilidades acotadas.

  Agente               Responsabilidad
  -------------------- ------------------------------------------------
  Coordinador          Recibir consultas y organizar tareas
  Lector CAD           Consultar entidades, capas y textos originales
  Geoespacial          Analizar coordenadas y relaciones espaciales
  Documental           Interpretar etiquetas y cuadros técnicos
  Geométrico           Ejecutar cálculos de áreas y perímetros
  Comparador predial   Contrastar información gráfica y documental
  Validador            Revisar consistencia, evidencias y pendientes

Los agentes deberán consultar herramientas y datos estructurados. No
deben reconstruir coordenadas o superficies mediante generación libre de
texto.

## 11. Entrenamiento y evaluación

No se recomienda entrenar un modelo de lenguaje desde cero. La primera
etapa debe utilizar modelos existentes, herramientas deterministas y
datasets curados.

### 11.1. Datasets

**Dataset A: extracción CAD** - Archivo DXF. - Inventario de
entidades. - Capas y propiedades. - JSON de extracción esperado.

**Dataset B: interpretación semántica** - JSON de extracción. -
Etiquetas revisadas por especialistas. - Clasificación correcta de
entidades, textos y predios. - Relaciones entre textos y geometrías.

**Dataset C: preguntas y respuestas** - Consulta del usuario. - Datos de
referencia. - Respuesta esperada. - Evidencias que sustentan la
respuesta. - Criterios de evaluación.

### 11.2. Etiquetado y control

Cada ejemplo deberá tener un estado: - Pendiente. - En revisión. -
Aprobado. - Rechazado. - Corregido.

El conjunto de prueba debe contener planos que no hayan sido utilizados
para ajustar las reglas o entrenar el modelo. Se deben separar los datos
por proyecto o fuente cuando sea necesario para evitar que versiones del
mismo plano aparezcan simultáneamente en entrenamiento y prueba.

### 11.3. Métricas

-   Porcentaje de entidades CAD extraídas correctamente.
-   Exactitud de clasificación de capas.
-   Precisión y exhaustividad en detección de predios.
-   Diferencia entre áreas calculadas y valores de referencia.
-   Exactitud en extracción de coordenadas.
-   Exactitud de clasificación de textos.
-   Porcentaje de respuestas respaldadas por evidencia.
-   Tasa de casos que requieren revisión humana.

## 12. Base de datos

Se recomienda PostgreSQL con PostGIS.

  Tabla              Contenido
  ------------------ ----------------------------------------------------
  `documentos`       Archivos originales y metadatos
  `procesamientos`   Ejecuciones, versiones y estados
  `capas_cad`        Capas y propiedades
  `entidades_cad`    Entidades originales
  `predios`          Objetos prediales interpretados
  `vertices`         Coordenadas de vértices
  `colindancias`     Linderos y relaciones
  `textos`           Textos originales y clasificados
  `validaciones`     Errores, advertencias y resultados
  `revisiones`       Correcciones y aprobaciones humanas
  `dataset_ia`       Ejemplos aprobados para entrenamiento y evaluación

Se conservarán los archivos originales, los resultados de cada
procesamiento y las versiones del esquema. Las correcciones humanas no
deberán sobrescribir la extracción original.

## 13. Validación y control de calidad

  Control                  Verificación
  ------------------------ -----------------------------------------------
  Integridad del archivo   Apertura y lectura sin errores
  Conversión               Registro de pérdidas y advertencias
  Geometría                Cierre, validez y autointersecciones
  Superficie               Área calculada frente a área rotulada
  Perímetro                Longitud calculada frente a valor consignado
  Coordenadas              Unidades, datum, proyección y zona
  Topología                Solapamientos, vacíos y segmentos compartidos
  Textos                   Correspondencia entre etiqueta y elemento
  Colindancias             Evidencia gráfica o textual disponible
  Trazabilidad             Entidad CAD de origen y versión del proceso

Toda diferencia debe generar una observación, no una modificación
automática. Las tolerancias se configurarán según el tipo de plano,
escala, precisión y finalidad del análisis.

## 14. Interfaz de usuario

La plataforma web deberá incluir:

1.  Módulo de carga de archivos DWG/DXF.
2.  Visualizador del plano y sus capas.
3.  Panel de entidades extraídas.
4.  Panel de predios detectados.
5.  Tabla de coordenadas y vértices.
6.  Comparación de áreas y perímetros.
7.  Panel de observaciones y validaciones.
8.  Editor de clasificación semántica.
9.  Vista previa y descarga de JSON/GeoJSON.
10. Historial de procesamiento y revisiones.

La interfaz deberá permitir seleccionar una entidad en el listado y
localizarla en el plano, y viceversa.

## 15. Plan de implementación

### Fase 1. Extractor CAD

**Actividades** - Preparar entorno Python. - Implementar lectura DXF. -
Incorporar conversión DWG a DXF. - Extraer capas y entidades. - Leer
textos, bloques y cotas. - Generar inventario JSON. - Registrar errores
y entidades no compatibles.

**Entregable:** extractor CAD funcional.

### Fase 2. Motor geométrico

**Actividades** - Reconstruir polígonos. - Extraer vértices. - Calcular
áreas y perímetros. - Validar geometrías. - Identificar relaciones
espaciales. - Normalizar unidades y referencias espaciales.

**Entregable:** motor geométrico y JSON predial.

### Fase 3. Interpretación con IA

**Actividades** - Diseñar taxonomía de capas y textos. - Implementar
clasificación semántica. - Relacionar etiquetas y geometrías. -
Identificar posibles colindancias. - Incorporar evidencia y niveles de
confianza.

**Entregable:** agente lector de planos.

### Fase 4. Datasets y evaluación

**Actividades** - Seleccionar planos representativos. - Etiquetar
muestras. - Crear datasets de extracción, interpretación y
preguntas/respuestas. - Separar entrenamiento, validación y prueba. -
Medir precisión y corregir errores.

**Entregable:** datasets versionados y agentes evaluados.

### Fase 5. Plataforma integral

**Actividades** - Construir API. - Integrar base de datos espacial. -
Desarrollar visualizador CAD. - Crear panel de resultados. - Incorporar
revisión humana. - Habilitar consultas en lenguaje natural. - Generar
reportes preliminares.

**Entregable:** plataforma operativa.

## 16. Criterios de aceptación del MVP

El MVP se considerará listo para una prueba piloto cuando:

-   Permita cargar archivos DXF y procesar DWG mediante conversión
    compatible.
-   Registre el archivo original y su hash.
-   Extraiga las entidades y capas contempladas en el alcance.
-   Conserve textos y geometrías con referencia a su entidad de origen.
-   Identifique polígonos prediales bajo reglas documentadas.
-   Calcule áreas y perímetros cuando las unidades y geometrías lo
    permitan.
-   Genere JSON válido conforme al esquema versionado.
-   Produzca advertencias ante inconsistencias.
-   Permita revisar y aprobar resultados manualmente.
-   Pueda repetir el procesamiento conservando trazabilidad.
-   Disponga de un conjunto de planos de prueba con resultados
    esperados.

Los objetivos cuantitativos de precisión se establecerán después de
construir un conjunto de referencia representativo. No se debe declarar
una exactitud global sin medirla.

## 17. Seguridad, trazabilidad y gobierno de datos

-   Conservar el archivo original sin modificaciones.
-   Calcular hash SHA-256 y registrar fecha de recepción.
-   Mantener control de acceso por usuario y proyecto.
-   Registrar versiones de herramientas, bibliotecas y esquemas.
-   Mantener historial de cambios y revisiones.
-   Separar datos originales, datos interpretados y datos corregidos.
-   Proteger información personal y predial conforme a las normas
    aplicables.
-   Respaldar archivos y base de datos.
-   Registrar el origen de cada dato utilizado en un informe o respuesta
    de IA.

## 18. Riesgos técnicos y mitigaciones

  -----------------------------------------------------------------------
  Riesgo                              Mitigación
  ----------------------------------- -----------------------------------
  DWG con versión o entidades no      Conversión controlada y registro de
  compatibles                         incidencias

  Capas con nombres no estandarizados Clasificación configurable y
                                      revisión humana

  Polilíneas abiertas o incompletas   Reglas topológicas y advertencias

  Bloques con transformaciones        Aplicar y registrar escala,
                                      rotación e inserción

  Coordenadas sin datum conocido      Marcar referencia espacial como no
                                      verificada

  Textos ambiguos                     Conservar original y solicitar
                                      confirmación

  Diferencia entre área gráfica y     Mostrar ambos valores y generar
  rotulada                            observación

  Falsas interpretaciones de IA       Exigir evidencia y validación

  Pérdida de información en           Conservar DWG original y comparar
  conversión                          inventarios
  -----------------------------------------------------------------------

## 19. Estructura inicial del repositorio

``` text
predial-ai/
├── README.md
├── docs/
│   ├── arquitectura.md
│   ├── esquema-json.md
│   └── reglas-validacion.md
├── schemas/
│   ├── predial-cad-v1.schema.json
│   └── geojson-schema.json
├── app/
│   ├── api/
│   ├── ingestion/
│   ├── conversion/
│   ├── cad_extractor/
│   ├── geometry/
│   ├── semantic/
│   ├── validation/
│   ├── exporters/
│   └── agents/
├── tests/
│   ├── fixtures/
│   ├── test_extraction.py
│   ├── test_geometry.py
│   └── test_json_schema.py
├── datasets/
│   ├── raw/
│   ├── labeled/
│   ├── train/
│   ├── validation/
│   └── test/
├── storage/
│   ├── originals/
│   ├── converted/
│   └── outputs/
└── requirements.txt
```

## 20. Primer sprint recomendado

El primer sprint debe concentrarse en demostrar que un plano DXF puede
convertirse en un inventario JSON completo y reproducible.

**Tareas** 1. Seleccionar entre 5 y 10 planos DXF representativos. 2.
Documentar sus versiones, unidades, capas y particularidades. 3. Crear
el entorno Python y fijar versiones de dependencias. 4. Implementar
lectura de capas y entidades. 5. Extraer LINE, LWPOLYLINE, POLYLINE,
TEXT, MTEXT, INSERT y DIMENSION. 6. Guardar handles, capas y propiedades
originales. 7. Generar el primer JSON. 8. Comparar el resultado con el
archivo abierto en un visor CAD. 9. Documentar entidades no procesadas y
errores. 10. Preparar pruebas automatizadas.

**Resultado esperado:** un prototipo que procese un conjunto pequeño de
planos y genere JSON trazables, sin depender todavía de un modelo de IA.

------------------------------------------------------------------------

## 21. Decisiones técnicas pendientes

Antes de cerrar la arquitectura de implementación deben definirse:

-   Si la plataforma será web, escritorio o API.
-   Si el procesamiento será individual, por lotes o ambos.
-   Qué herramienta de conversión DWG se utilizará y bajo qué licencia.
-   Qué versiones de DWG/DXF se soportarán.
-   Qué sistemas de coordenadas y unidades se esperan.
-   Qué categorías de planos prediales se priorizarán.
-   Qué volumen de archivos se procesará.
-   Qué modelo de IA se utilizará y dónde se ejecutará.
-   Qué usuarios podrán revisar y aprobar los resultados.

## 22. Resultado final esperado

El producto final será una plataforma modular que permita cargar planos
DWG/DXF, extraer su información geométrica y textual, reconstruir
elementos prediales, generar JSON/GeoJSON, validar inconsistencias y
alimentar agentes especializados.

La prioridad de desarrollo será la confiabilidad de la extracción, la
trazabilidad y la validación. La IA se incorporará sobre una base
geométrica verificable, para que los agentes puedan responder consultas
y elaborar diagnósticos técnicos preliminares sin sustituir la revisión
profesional ni las verificaciones registrales correspondientes.
