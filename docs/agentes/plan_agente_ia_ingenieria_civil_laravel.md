# Plan de implementación: Agente de IA para Ingeniería Civil

## Integración con Laravel, Livewire y Alpine.js

**Nombre provisional:** Ingeniero Civil IA\
**Tipo de solución:** Módulo de inteligencia artificial integrado en la
aplicación web existente.\
**Objetivo:** Incorporar un asistente especializado para apoyar a
ingenieros civiles en el análisis de documentos técnicos, metrados, APU,
presupuestos, planificación, supervisión y elaboración de informes, sin
reemplazar el criterio ni la responsabilidad del profesional.

------------------------------------------------------------------------

## 1. Resumen ejecutivo

Se propone desarrollar un agente de inteligencia artificial para
ingeniería civil dentro del sistema web existente, manteniendo la
arquitectura tecnológica actual:

-   **Backend:** Laravel.
-   **Interfaz reactiva:** Livewire.
-   **Interacciones de interfaz:** Alpine.js.
-   **Base de datos:** MySQL o PostgreSQL, según la infraestructura
    actual.
-   **IA:** integración mediante API con un proveedor de modelos de
    lenguaje.
-   **Documentos:** almacenamiento existente y un sistema de
    recuperación de información (RAG).
-   **Procesos en segundo plano:** Laravel Queues.

La recomendación es **no entrenar un modelo de IA desde cero**. En su
lugar, se utilizará un modelo existente, configurado con instrucciones
especializadas, acceso controlado a documentos técnicos y herramientas
propias del sistema. Esto reduce el tiempo, el costo inicial y la
complejidad de mantenimiento.

La primera versión debe ser un agente principal con herramientas
especializadas. La arquitectura podrá evolucionar posteriormente hacia
varios agentes si el uso real lo justifica.

## 2. Objetivos

### 2.1. Objetivo general

Implementar un asistente de IA especializado en ingeniería civil,
integrado con Laravel, Livewire y Alpine.js, que permita consultar
información de proyectos, analizar documentos y apoyar tareas técnicas
mediante respuestas trazables y cálculos verificables.

### 2.2. Objetivos específicos

1.  Permitir consultas en lenguaje natural sobre proyectos y
    documentación técnica.
2.  Analizar archivos PDF y otros documentos admitidos por el sistema.
3.  Recuperar información pertinente de normas, expedientes,
    especificaciones y documentos del proyecto.
4.  Apoyar la elaboración y revisión de metrados, APU, presupuestos y
    valorizaciones.
5.  Generar borradores de informes, reportes y observaciones técnicas.
6.  Integrar herramientas de cálculo determinístico para evitar depender
    de cálculos improvisados del modelo.
7.  Controlar el acceso a la información según usuario, empresa,
    proyecto y permisos.
8.  Registrar conversaciones, fuentes consultadas, resultados y acciones
    ejecutadas.
9.  Controlar el consumo de IA y medir el costo por usuario o proyecto.

## 3. Alcance funcional propuesto

### 3.1. Módulo de consulta técnica y normativa

-   Consultar documentos técnicos incorporados y autorizados.
-   Buscar artículos, numerales, tablas y especificaciones.
-   Resumir documentos y explicar conceptos técnicos.
-   Responder indicando el documento, versión, sección o página de donde
    procede la información.
-   Advertir cuando la documentación disponible no permita confirmar una
    respuesta.

**Importante:** las normas deben contar con control de versión y fecha
de vigencia. No se debe presentar una disposición como vigente sin
verificar su fecha y fuente.

### 3.2. Módulo de documentos y expedientes

-   Cargar y clasificar expedientes técnicos.
-   Resumir memorias descriptivas, especificaciones y estudios.
-   Identificar partidas, unidades, cantidades y datos relevantes.
-   Comparar documentos y detectar diferencias.
-   Elaborar listas de observaciones para revisión profesional.
-   Preparar borradores de informes técnicos.

### 3.3. Módulo de metrados

-   Interpretar partidas y unidades de medida.
-   Apoyar el cálculo de cantidades a partir de datos proporcionados.
-   Mostrar fórmulas, variables, unidades y resultados.
-   Permitir revisar y corregir los datos de entrada.
-   Exportar resultados al formato que utilice el sistema.

Los cálculos deberán ejecutarse en funciones programadas y probadas, no
confiarse exclusivamente a texto generado por IA.

### 3.4. Módulo de APU y presupuestos

-   Estructurar análisis de precios unitarios.
-   Organizar mano de obra, materiales, equipos y herramientas.
-   Calcular costos parciales y totales mediante funciones
    determinísticas.
-   Aplicar rendimientos, cuadrillas, precios y porcentajes
    configurables.
-   Comparar presupuesto base, actualizado y ejecutado.
-   Mostrar la fecha y procedencia de los precios utilizados.

La IA podrá interpretar y proponer estructuras, pero no debe inventar
precios, rendimientos ni cotizaciones.

### 3.5. Módulo de planificación y seguimiento

-   Apoyar la elaboración de cronogramas.
-   Resumir avances físicos y financieros.
-   Comparar avance programado frente a ejecutado.
-   Identificar partidas atrasadas según los datos registrados.
-   Preparar alertas y reportes de seguimiento.

### 3.6. Módulo de supervisión e informes

-   Elaborar borradores de informes diarios, semanales y mensuales.
-   Organizar incidencias, observaciones y acciones pendientes.
-   Resumir registros y evidencias.
-   Preparar reportes a partir de información registrada en el sistema.
-   Mantener trazabilidad entre cada afirmación y su documento o
    registro de origen.

## 4. Arquitectura técnica recomendada

### 4.1. Principio de diseño

Mantener la aplicación existente y agregar un módulo de IA desacoplado.
No migrar de framework ni reescribir el sistema para incorporar el
agente.

### 4.2. Componentes

  -----------------------------------------------------------------------
  Componente              Tecnología o            Responsabilidad
                          alternativa             
  ----------------------- ----------------------- -----------------------
  Aplicación web          Laravel                 Lógica de negocio,
                                                  autenticación y
                                                  permisos

  Interfaz                Livewire + Alpine.js    Chat, carga de archivos
                                                  y presentación de
                                                  resultados

  Orquestación de IA      Laravel AI SDK o        Gestionar solicitudes,
                          integración propia      conversaciones y
                          mediante servicio       herramientas

  Modelo de IA            API de proveedor        Comprensión,
                          compatible              razonamiento y
                                                  generación de
                                                  borradores

  Base de datos           MySQL o PostgreSQL      Usuarios, proyectos,
                                                  conversaciones y
                                                  registros

  Recuperación documental RAG + búsqueda de       Recuperar fragmentos
                          texto/vectorial         pertinentes

  Almacenamiento          Sistema actual o        Archivos y documentos
                          almacenamiento de       
                          objetos                 

  Procesamiento asíncrono Laravel Queues          Extracción, indexación
                                                  y tareas largas

  Cálculos                Servicios PHP probados  Metrados, APU,
                                                  presupuestos y
                                                  validaciones

  Observabilidad          Logs y métricas de      Errores, consumo,
                          Laravel                 tiempos y auditoría
  -----------------------------------------------------------------------

La selección definitiva del SDK, proveedor, base vectorial y modelo debe
hacerse después de revisar las versiones de Laravel y PHP,
infraestructura, volumen documental y requisitos de privacidad.

### 4.3. Flujo general

1.  El usuario inicia sesión y selecciona un proyecto.
2.  El usuario realiza una consulta desde el módulo de chat.
3.  Laravel valida identidad, permisos y alcance del proyecto.
4.  El servicio de IA clasifica la solicitud y determina si necesita
    consultar documentos, datos o herramientas.
5.  El sistema recupera únicamente la información autorizada y
    pertinente.
6.  Cuando corresponda, ejecuta funciones de cálculo del backend.
7.  El modelo genera una respuesta utilizando los resultados y fuentes
    disponibles.
8.  Laravel registra la conversación, fuentes, consumo y resultado.
9.  Livewire presenta la respuesta y permite descargar o guardar el
    borrador.

### 4.4. Diagrama de referencia

``` text
Usuario
  |
  v
Interfaz Livewire + Alpine.js
  |
  v
Controlador / Servicio Laravel
  |
  +--> Autenticación, permisos y contexto del proyecto
  |
  +--> Orquestador del agente de IA
  |       |
  |       +--> API del modelo de IA
  |       |
  |       +--> Recuperación RAG de documentos
  |       |
  |       +--> Herramientas de negocio y cálculo PHP
  |
  +--> Base de datos
  |
  +--> Almacenamiento de documentos
  |
  +--> Colas de procesamiento
  |
  v
Respuesta con fuentes, cálculos y advertencias
  |
  v
Interfaz web
```

## 5. Estrategia de IA: configurar, recuperar información y usar herramientas

### 5.1. No entrenar desde cero en la primera etapa

Entrenar un modelo propio desde cero no es recomendable para este
proyecto por el costo de datos, infraestructura, entrenamiento,
evaluación y mantenimiento.

La primera versión debe utilizar:

-   Un modelo de IA disponible mediante API.
-   Instrucciones de sistema que definan el rol y los límites del
    agente.
-   Documentación técnica validada.
-   Recuperación aumentada por generación (RAG).
-   Herramientas de consulta y cálculo implementadas en Laravel.
-   Evaluaciones con casos reales revisados por ingenieros.

### 5.2. RAG documental

El sistema deberá procesar los documentos en una etapa independiente:

1.  Recibir y validar el archivo.
2.  Extraer texto y, cuando sea necesario, procesar tablas o páginas
    escaneadas mediante OCR.
3.  Dividir el contenido en fragmentos coherentes.
4.  Guardar metadatos: nombre, tipo, proyecto, versión, fecha, entidad
    emisora y páginas.
5.  Generar representaciones vectoriales cuando la tecnología elegida lo
    requiera.
6.  Recuperar fragmentos relevantes durante cada consulta.
7.  Presentar referencias para que el usuario pueda verificar la
    respuesta.

Los documentos de un proyecto no deben ser visibles para usuarios de
otros proyectos, empresas o clientes.

### 5.3. Herramientas del agente

El agente podrá invocar funciones controladas de Laravel, por ejemplo:

-   `buscar_documentos(proyecto_id, consulta)`
-   `consultar_partidas(proyecto_id, filtros)`
-   `calcular_metrado(datos)`
-   `calcular_apu(partida_id, recursos)`
-   `comparar_presupuestos(presupuesto_a, presupuesto_b)`
-   `consultar_avance(proyecto_id, periodo)`
-   `generar_borrador_informe(datos, tipo)`

Los nombres son referenciales. Deben adaptarse a los modelos, servicios
y convenciones existentes en el repositorio.

Cada herramienta debe validar permisos, tipos de datos, unidades,
límites y pertenencia al proyecto. Las operaciones que modifiquen
información deberán requerir confirmación explícita del usuario.

## 6. Organización de agentes

### Primera etapa: un agente principal

Implementar un único agente denominado **Ingeniero Civil IA**, con
acceso a herramientas agrupadas por dominio:

1.  Normativa y documentación.
2.  Metrados y cálculos.
3.  APU y presupuestos.
4.  Planificación y seguimiento.
5.  Supervisión e informes.

### Etapa posterior: agentes especializados

Solo si el volumen, la complejidad o las pruebas de uso lo justifican,
separar responsabilidades en agentes especializados:

-   Agente de metrados y APU.
-   Agente de presupuestos y valorizaciones.
-   Agente de expedientes y normativa.
-   Agente de planificación.
-   Agente de supervisión e informes.

El agente principal podrá derivar tareas. La separación debe aportar una
mejora medible y no duplicar costos innecesariamente.

## 7. Seguridad, permisos y responsabilidad profesional

Requisitos obligatorios:

-   Respetar el sistema de autenticación y autorización existente.
-   Aplicar aislamiento por empresa y proyecto.
-   No permitir que el modelo acceda directamente a la base de datos sin
    controles.
-   Validar y sanear archivos cargados.
-   Limitar tamaño, formato y frecuencia de solicitudes.
-   Proteger claves API mediante variables de entorno o un gestor de
    secretos.
-   No exponer claves ni instrucciones internas en el navegador.
-   Registrar consultas, herramientas utilizadas, fuentes y acciones.
-   Solicitar confirmación antes de guardar cambios, emitir documentos o
    ejecutar operaciones sensibles.
-   Incorporar controles para evitar instrucciones maliciosas contenidas
    en archivos.
-   Definir políticas de retención y eliminación de documentos y
    conversaciones.
-   No utilizar documentos confidenciales para entrenamiento de modelos
    sin autorización expresa y revisión contractual.

La IA debe presentarse como herramienta de apoyo. Los cálculos, informes
y recomendaciones técnicas requieren revisión y aprobación del
profesional responsable.

## 8. Control de costos y rendimiento

Para optimizar el gasto:

1.  Utilizar modelos de menor costo para clasificación, extracción
    sencilla y consultas rutinarias.
2.  Reservar modelos de mayor capacidad para análisis complejos.
3.  Recuperar solo los fragmentos documentales necesarios.
4.  Evitar enviar el expediente completo en cada consulta.
5.  Resumir el contexto histórico de conversaciones extensas.
6.  Almacenar resultados reutilizables cuando sea seguro y pertinente.
7.  Establecer límites de consumo por usuario, empresa y proyecto.
8.  Registrar tokens, costo estimado, latencia y errores por solicitud.
9.  Ejecutar la indexación documental mediante colas.
10. Permitir configurar proveedor y modelo para evitar dependencia
    innecesaria de uno solo.

No se debe fijar un presupuesto mensual sin conocer el número de
usuarios, frecuencia de uso, tamaño de archivos y proveedor
seleccionado. Primero se debe construir una prueba piloto y medir el
consumo real.

## 9. Plan de implementación por fases

Los tiempos son estimaciones iniciales y deberán ajustarse después de
revisar el repositorio y la infraestructura.

  -----------------------------------------------------------------------
  Fase                    Actividades             Entregable
  ----------------------- ----------------------- -----------------------
  0\. Diagnóstico         Revisar Laravel, PHP,   Informe técnico y
                          Livewire, Alpine,       decisiones de
                          autenticación, base de  arquitectura
                          datos, almacenamiento y 
                          estructura de proyectos 

  1\. Fundamentos         Crear módulo IA,        Chat funcional
                          configuración de        integrado
                          proveedor, servicio de  
                          orquestación, registro  
                          de conversaciones y     
                          control de consumo      

  2\. Documentos          Carga, extracción, OCR  Consulta documental con
                          cuando aplique,         fuentes
                          fragmentación,          
                          indexación, RAG y       
                          referencias             

  3\. Herramientas        Implementar consultas   Agente con herramientas
                          de proyecto y funciones de negocio
                          verificables de         
                          metrados y APU          

  4\. Informes            Generación de           Informes revisables y
                          borradores, comparación descargables
                          de datos y exportación  

  5\. Seguridad y pruebas Permisos, aislamiento,  Versión piloto validada
                          pruebas, límites,       
                          auditoría y evaluación  
                          técnica                 

  6\. Escalamiento        Optimización, nuevos    Versión ampliada
                          dominios y posible      
                          separación en agentes   
  -----------------------------------------------------------------------

### Priorización sugerida para el MVP

El producto mínimo viable debe incluir:

-   Chat integrado al sistema.
-   Selección de proyecto y control de permisos.
-   Consulta de documentos PDF.
-   Respuestas con referencias a fuentes.
-   Consulta de información existente del proyecto.
-   Una primera herramienta de cálculo verificable.
-   Registro de conversaciones y consumo.
-   Confirmación antes de modificar datos.

No intentar implementar todos los módulos en la primera entrega.

## 10. Pruebas y criterios de aceptación

Antes de liberar el módulo, validar:

### Funcionalidad

-   El usuario puede iniciar y continuar conversaciones.
-   El agente conserva el contexto autorizado del proyecto.
-   Puede consultar documentos y presentar referencias.
-   Puede utilizar herramientas permitidas.
-   Puede generar borradores descargables.
-   Los errores de proveedor o procesamiento se muestran de manera
    controlada.

### Exactitud

-   Los cálculos coinciden con casos de prueba elaborados por
    ingenieros.
-   Las unidades y conversiones se validan.
-   Los resultados identifican los datos de entrada y fórmulas.
-   Las respuestas normativas incluyen fuente y versión.
-   El agente reconoce cuándo no cuenta con evidencia suficiente.
-   No inventa precios, partidas, normas ni resultados.

### Seguridad

-   Un usuario no puede consultar documentos de otro proyecto sin
    autorización.
-   Las herramientas validan permisos en backend.
-   Las claves API no son visibles desde el navegador.
-   Las acciones sensibles requieren confirmación.
-   Las conversaciones y documentos respetan las políticas de acceso.

### Costos y rendimiento

-   Se registra el consumo por solicitud.
-   Se pueden configurar límites de uso.
-   Los procesos pesados se ejecutan en colas.
-   Se mide el tiempo de respuesta.
-   Se puede cambiar de modelo o proveedor mediante configuración.

## 11. Decisiones técnicas pendientes

Antes de implementar, Codex debe inspeccionar el proyecto y reportar:

1.  Versión exacta de Laravel y PHP.
2.  Versiones de Livewire y Alpine.js.
3.  Base de datos y motor de búsqueda disponibles.
4.  Estructura de usuarios, roles, empresas y proyectos.
5.  Modelos existentes de partidas, metrados, presupuestos, costos y
    documentos.
6.  Sistema de almacenamiento y tamaño promedio de los archivos.
7.  Infraestructura de colas y disponibilidad de Redis u otra
    alternativa.
8.  Existencia de módulos de reportes y exportación.
9.  Requisitos de privacidad y retención.
10. Volumen esperado de usuarios y consultas.

No asumir que hay que instalar un nuevo paquete o reemplazar una
funcionalidad existente antes de revisar el código.

## 12. Instrucciones para Codex

### Objetivo de trabajo

Inspeccionar el repositorio actual y preparar la integración de un
agente de IA especializado en ingeniería civil, manteniendo Laravel,
Livewire y Alpine.js.

### Reglas de implementación

1.  Primero inspeccionar el repositorio; no modificar archivos en la
    fase de diagnóstico.
2.  Identificar versiones, arquitectura, convenciones, modelos,
    servicios, políticas y componentes reutilizables.
3.  Presentar un diagnóstico breve con los archivos y módulos
    relevantes.
4.  Proponer una arquitectura compatible con el código existente.
5.  Comparar la integración mediante Laravel AI SDK con una integración
    directa a la API del proveedor, considerando compatibilidad real con
    las versiones instaladas.
6.  No entrenar un modelo desde cero.
7.  No reemplazar Laravel, Livewire ni Alpine.js.
8.  No duplicar módulos o modelos que ya existan.
9.  Mantener claves API exclusivamente en backend.
10. Implementar autorización y aislamiento por proyecto en todas las
    consultas y herramientas.
11. Utilizar servicios PHP para los cálculos determinísticos.
12. Crear pruebas automatizadas para cálculos, permisos, recuperación
    documental y manejo de errores.
13. No realizar operaciones destructivas ni migraciones irreversibles
    sin aprobación.
14. Documentar variables de entorno, instalación, configuración y
    despliegue.
15. Implementar por fases y solicitar aprobación antes de pasar de
    diagnóstico a cambios estructurales.

### Primera tarea solicitada a Codex

**Realiza únicamente el diagnóstico del repositorio y entrega:**

-   Inventario de tecnologías y versiones.
-   Arquitectura actual.
-   Modelos y tablas que podrían utilizarse.
-   Módulos existentes que se pueden reutilizar.
-   Riesgos de compatibilidad.
-   Propuesta de integración del agente.
-   Paquetes que realmente serían necesarios, con justificación.
-   Estimación de fases y dependencias.
-   Lista de archivos que se tendrían que crear o modificar.

No programes todavía. Espera la aprobación de la arquitectura antes de
implementar.

------------------------------------------------------------------------

## 13. Resultado esperado

Al finalizar el MVP, el sistema web contará con un asistente de IA
integrado que podrá consultar documentos y datos autorizados, responder
con referencias, ejecutar cálculos mediante herramientas controladas y
generar borradores técnicos.

La solución aprovechará la inversión existente en Laravel, Livewire y
Alpine.js, evitará el costo de entrenar un modelo propio y permitirá
ampliar las capacidades progresivamente según las necesidades reales de
los ingenieros civiles.

**Recomendación final:** comenzar con un agente principal, RAG
documental y herramientas PHP verificables. Medir exactitud, utilidad y
costo durante el piloto antes de invertir en una arquitectura
multiagente.
