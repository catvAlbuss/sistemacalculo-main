# Documentacion Memoria de Calculo (Onboarding para practicantes)

## 1) Para que sirve este modulo

Este modulo permite:

- Capturar datos del formulario (portada, ubicacion, parametros, cargas, imagenes).
- Guardar esos datos en un store global de Alpine.
- Transformar una estructura base del documento segun los datos ingresados.
- Generar un archivo `.docx` en el navegador con la libreria `docx`.
- Mostrar previews de imagenes antes de exportar.

No usa backend para generar Word; todo ocurre en frontend.

## 2) Con que archivos iniciar (orden recomendado)

1. Vista principal (entrada UI):
- `resources/views/hcalculo/admMemoriaCalculo.blade.php`

2. Entry point JS (orquestador):
- `resources/js/memoria_calculo/index-refactored.js`

3. Store central (estado):
- `resources/js/memoria_calculo/stores/memoriaCalculoStore.js`

4. Estructura base del documento:
- `resources/js/memoria_calculo/content-structure-mc.js`

5. Transformaciones dinamicas:
- `resources/js/memoria_calculo/processors/documentTransformer.js`

6. Generador final Word:
- `resources/js/memoria_calculo/content-processor-mc.js`

7. Componentes de formulario:
- `resources/js/memoria_calculo/components/GeneralidadesComponent.js`
- `resources/js/memoria_calculo/components/AnalisisCargasComponent.js`
- `resources/js/memoria_calculo/components/AnalisisSismicoComponent.js`

8. Utilidades:
- `resources/js/memoria_calculo/utils/imageHandler.js`
- `resources/js/memoria_calculo/utils/dataValidator.js`

## 3) Con que terminar (recorrido de salida)

Termina en `exportWord()`:

- `index-refactored.js` llama `this.$store.memoriaCalculo.getExportData()`.
- Construye estructura con `buildContentStructure(...)`.
- Aplica cambios dinamicos con `new DocumentTransformer(...).applyAll(structure)`.
- Crea documento con `new ContentProcessorMC(window.docx, exportData).buildDocument(...)`.
- Convierte a blob con `window.docx.Packer.toBlob(doc)`.
- Descarga con `window.saveAs(blob, fileName)`.

## 4) Flujo completo: formulario -> store -> Word -> visualizacion

## 4.1 Captura de datos de formulario

En Blade, los campos usan `x-model` directo al store, por ejemplo:

- `cover.title`, `cover.subtitle`, `cover.project`, `cover.date`.
- `cover.ubigeo.department/province/district`.
- `sections.analisisCargas.casoscarga.K5`, `K10`, `K11`, `cargaviento`, etc.

Las imagenes usan `@change` y handlers:

- `handleImageChange(...)` para imagen simple.
- `handleArrayImageChange(...)` para colecciones (figuras por indice).

## 4.2 Procesamiento de imagenes

`imageHandler.js`:

- Valida tipo MIME (`jpg/png/gif/webp`) y tamano maximo.
- Convierte archivo a DataURL con `FileReader`.
- Guarda `File` en `images` y preview base64 en `previews`.

## 4.3 Como se muestra en pantalla antes de exportar

Las vistas usan `previews.*` con `x-if` + `<img :src="...">`.

Ejemplo en analisis de cargas:

- `previews.modeloMatematico3DImages[0]`
- `previews.espectroPseudoaceleracionesImages[i-1]`

## 4.4 Armado del documento

1. `content-structure-mc.js` define la plantilla base.
2. `documentTransformer.js` reemplaza partes estaticas por contenido dinamico:
- Ubicacion por tabla.
- Zonificacion y suelo por tablas calculadas.
- Materiales, imagenes por piso y cargas aproximadas segun inputs.
3. `content-processor-mc.js` convierte cada item de contenido en objetos `docx` (`Paragraph`, `ImageRun`, `Table`, etc.).

## 5) Tipos de datos de contenido soportados

En `ContentProcessorMC.processContentItem` se soportan:

- `heading`
- `paragraph`
- `list`
- `image`
- `table`
- `subsection`
- `captured-image`

## 5.1 Estructuras de datos (referencia rapida)

### heading
```js
{ type: "heading", level: 2, text: "1.2. UBICACION", underline: false }
```

### paragraph (texto simple)
```js
{ type: "paragraph", text: "Texto...", alignment: "JUSTIFIED" }
```

### paragraph (partes con formato)
```js
{
  type: "paragraph",
  text: { parts: [{ text: "Proyecto: " }, { text: "{{cover.project}}", bold: true }] },
  alignment: "JUSTIFIED"
}
```

### list
```js
{ type: "list", listType: "bullet", items: ["Item 1", "Item 2"] }
```

### image
```js
{
  type: "image",
  src: "/assets/img/memoriacalculos/mapazonificacion.png",
  width: 500,
  height: 350,
  alignment: "CENTER",
  caption: "Figura X"
}
```

### table
```js
{
  type: "table",
  title: "TABLA",
  columns: [{ header: "A", width: 50 }, { header: "B", width: 50 }],
  rows: [["v1", "v2"], [{ text: "merge", rowSpan: 2 }, "x"]]
}
```

### subsection
```js
{
  type: "subsection",
  title: "4.1 ...",
  content: [{ type: "paragraph", text: "..." }]
}
```

## 6) Tipos de datos en el store (modelo de estado)

`memoriaCalculoStore` maneja:

- `cover`: datos de portada y parametros globales.
- `sections`: datos por seccion (generalidades, analisisCargas, etc.).
- `images`: archivos originales `File`.
- `previews`: DataURL para vista previa y para exportar imagenes cargadas.
- `ui`: estado visual (`activeSection`, `isExporting`, `errors`).

## 7) Ejemplo real: captura y salida en Word

## 7.1 Entrada formulario (usuario)

- `cover.project = "Vivienda Multifamiliar ..."`
- `cover.soilFactor = "S2"`
- `cover.soilPeriod = "Tp"`
- `cover.seismicZone = "2"`
- `sections.analisisCargas.casoscarga.cargaviento = "75"`
- `previews.metradoCargasImages[0] = "data:image/png;base64,..."` (subida por usuario)

## 7.2 Transformacion

- `DocumentTransformer` calcula factor de suelo y periodo.
- Reemplaza imagenes de tablas normativas por tablas dinamicas.
- Inyecta imagenes cargadas por el usuario en secciones de analisis.

## 7.3 Resultado DOCX

- Portada + indice automatico.
- Titulos/subtitulos con niveles `Heading 1..4`.
- Parrafos justificados.
- Listas con vineta o numeradas.
- Imagenes con caption.
- Tablas con encabezados, colores, `rowSpan`, y celdas complejas.

## 8) Variables dinamicas en plantillas

La plantilla usa placeholders como:

- `{{cover.project}}`
- `{{cover.seismicZone}}`
- `{{cover.soilValue}}`
- `{{analisis_sismico.figura26}}` (ver nota abajo)

`replaceVariables()` en `ContentProcessorMC` los resuelve contra el objeto `exportData`.

## 9) Nota tecnica importante (seccion Analisis Sismico)

Actualmente `AnalisisSismicoComponent.js` usa `$store.memoriaCalculoState` y eventos
`update-analisis-sismico`, mientras el flujo refactorizado exporta desde `$store.memoriaCalculo`.

Eso puede dejar figuras `figura26..figura40` fuera del `exportData` si no se sincronizan al store principal.
Si se va a mantener esta seccion, recomendable unificarla al mismo store (`memoriaCalculo`).

## 10) Resumen practico para practicantes

1. Empieza por la vista `admMemoriaCalculo.blade.php` para entender la UI.
2. Sigue con `index-refactored.js` para ver el flujo de exportacion.
3. Revisa `memoriaCalculoStore.js` para entender donde vive cada dato.
4. Lee `documentTransformer.js` para reglas de negocio (tablas/figuras dinamicas).
5. Termina en `content-processor-mc.js` para entender como se fabrica el `.docx`.

