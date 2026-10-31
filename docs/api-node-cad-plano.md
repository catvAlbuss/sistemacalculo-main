# Solicitud: nueva estructura de la API Node CAD para planos de muros de contención

## 1. Qué se pide

Reestructurar esta API Node para que genere, a partir de un JSON, un plano DXF profesional de un muro de contención en voladizo, listo para abrir en AutoCAD e imprimir en lámina A1.

Antes de escribir código, entregar:

1. Diagnóstico breve del proyecto actual.
2. Estructura de carpetas propuesta, adaptada a lo que ya existe.
3. Plan por fases.

Implementar solo después de que se apruebe el plan.

## 2. Contexto

- **Sistema cliente:** aplicación Laravel + Alpine.js de Rizabal & Asociados (`ryaie.com`), con una hoja de cálculo de muros de contención para práctica peruana.
- **Flujo de la hoja:** Predimensionamiento → Dimensionamiento → Cargas → Verificaciones → Análisis estructural → Diseño → Planos → Metrados → Memoria.
- **Situación actual de esta API:** hoy está desplegada en `https://apinodecad.onrender.com/exportar`, con Express y `dxf-writer`.
- **Situación actual del cliente:** la hoja dejó de llamar a esta API. Ahora genera el plano en el navegador con `resources/js/muros-contencion/plan.js`, sin dependencias, y ese archivo es la **referencia funcional** del resultado esperado.

**Por qué seguir con la API:** debe aportar lo que el navegador no resuelve bien. Por ejemplo, entidades DXF modernas, tramas, cotas asociativas, plantillas de membrete y conversión a PDF o DWG. Si solo replicara `plan.js`, no se justificaría. El diagnóstico debe confirmar qué aporta y qué no.

## 3. Problemas conocidos de la versión anterior

Observados en una copia del servidor, `generarPlano.js`. Verificar contra el código real de esta carpeta.

**Dibujo**
- Altura de texto fija en unidades de modelo (`0.1`, `0.08`), sin relación con la escala de impresión.
- Malla dibujada como bloque magenta sólido, sin separación real legible.
- Lámina con mucho espacio vacío y vistas pequeñas.
- Títulos y escalas posicionados con valores fijos, y un texto `ESC.` calculado con una fórmula arbitraria.
- Capas creadas dinámicamente sin un estándar, por ejemplo una por vista.

**Código**
- Un solo archivo de unas 2900 líneas que mezcla servidor, geometría, dibujo y anotación.
- Imports sin uso aparente: `exec`, `publicDecrypt`.
- Datos de negocio embebidos en `predim.inputValues.B18` y otras celdas heredadas de Excel.

**Seguridad y operación**
- El DXF se guarda en disco, en `src/documents`, y esa carpeta se publica con `express.static`: los planos de un proyecto podrían quedar accesibles para terceros.
- `cors()` abierto a cualquier origen y sin autenticación.
- Los errores registran `req.body` completo, con datos del proyecto.
- Sin límite de tamaño ni validación estricta de entrada.
- Arranque en frío del plan gratuito de Render, que puede tardar cerca de un minuto.

## 4. Principios de diseño

1. **El modelo está en metros a tamaño real.** La lámina se escala: `tamaño en modelo = mm de papel × escala / 1000`.
2. **Texto y cotas se definen en mm de papel.** Deben imprimir igual a cualquier escala.
3. **La API no calcula ingeniería.** Dibuja lo que recibe; no recalcula Mu, As ni separaciones.
4. **Entrada semántica.** Nada de nombres de celdas (`B18`, `A89`) en el contrato.
5. **Sin estado.** Generar en memoria y responder el archivo. No escribir en disco ni guardar datos del proyecto.
6. **Dibujo separado del formato.** Primero entidades abstractas, luego un escritor DXF. Así se puede añadir SVG o PDF sin tocar la geometría.

## 5. Contrato de la API

### `POST /api/v1/planos/muro-contencion`

Respuesta `200`: archivo DXF (`application/dxf`, con `Content-Disposition: attachment`).

Cuerpo:

```json
{
  "geo": {
    "punta": 1.8, "batter": 0.7, "crown": 0.2, "heel": 3,
    "hz": 0.75, "stem": 6.65, "rise": 0.64,
    "keyX": 2.18, "keyTop": 0.9, "keyBottom": 0.2, "keyDepth": 1,
    "front": 1, "surcharge": 0.4
  },
  "steel": {
    "pantalla": {
      "principal": { "label": "2 Ø 3/4 @ 20 cm", "spacing": 20 },
      "secundario": { "label": "2 Ø 5/8 @ 20 cm", "spacing": 20 },
      "transversal": { "label": "1 Ø 1/2 @ 20 cm", "spacing": 20 },
      "transversal2": { "label": "1 Ø 1/2 @ 10 cm", "spacing": 10 }
    },
    "punta": {}, "talon": {}, "key": {}
  },
  "cutoffs": {
    "pantalla": { "L": 4 },
    "talon": { "L": 2 },
    "pedestal": { "L": 0 }
  },
  "materials": { "fc": 210, "fy": 4200, "qadm": 20 },
  "project": {
    "proyecto": "MEJORAMIENTO DE LOS SERVICIOS EDUCATIVOS",
    "codigo": "32478",
    "cliente": "MUNICIPALIDAD DISTRITAL DE SINGA",
    "ubicacion": "SANTA ROSA DE PAMPAN, HUAMALIES, HUANUCO",
    "ingeniero": "-",
    "fecha": "2026-10-31"
  }
}
```

`punta`, `talon` y `key` tienen la misma forma que `pantalla`. Cualquier fila de `steel` puede llegar `null` si aún no hay diseño: la API debe dibujar `-`, no fallar.

### Campos de `geo` (metros)

| Campo | Significado |
|---|---|
| `punta` | Longitud de la punta |
| `batter` | Inclinación: diferencia entre base y corona de la pantalla |
| `crown` | Ancho de corona |
| `heel` | Longitud del talón |
| `hz` | Espesor de la zapata |
| `stem` | Altura de la pantalla sobre la zapata |
| `rise` | Subida del terreno sobre el talón |
| `keyX` | Posición del dentellón desde la punta |
| `keyTop`, `keyBottom`, `keyDepth` | Anchos y profundidad del dentellón; `keyDepth = 0` significa que no hay |
| `front` | Altura del terreno delantero desde el fondo de la zapata |
| `surcharge` | Sobrecarga en Tn/m² |

Referencia de coordenadas: origen en la punta, al nivel inferior de la zapata; X hacia el talón, Y hacia arriba. Base total: `punta + batter + crown + heel`.

### Otros endpoints

- `GET /health`: estado y versión, sin datos internos.
- `POST /api/v1/planos/muro-contencion/preview`: opcional, devuelve SVG.

### Errores

Formato único y sin rastros internos:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "geo.stem debe ser mayor que 0", "fields": ["geo.stem"] } }
```

Códigos: `400` validación, `401` autenticación, `413` tamaño, `429` límite de uso, `500` interno.

## 6. Requisitos del plano

**Lámina**
- A1 (841 × 594 mm), margen izquierdo de 25 mm y 10 mm en el resto.
- Membrete en columna derecha de 180 mm.
- Escala elegida automáticamente entre 1:25, 1:30, 1:40, 1:50, 1:75, 1:100, 1:125 y 1:150: la mayor que permita que todo entre.

**Vistas**
1. Sección típica con dimensiones.
2. Sección típica con refuerzo, recortes y etiquetas de barras.
3. Pantalla, malla cara del terreno.
4. Pantalla, malla cara libre.
5. Zapata, malla superior.
6. Zapata, malla inferior.

Además: cuadro de acero, especificaciones técnicas y notas.

Las mallas son un paño representativo de 3 m con las barras a su separación real.

**Texto y cotas**
- Títulos de 5 mm, subtítulos de 4 mm y texto y cotas de 3 mm en papel. Arial.
- Cotas fuera del dibujo y con trazos a 45°. Cotas encadenadas: punta, base, talón y total B; pantalla, zapata y H total; corona, terreno delantero y dentellón.
- Texto sin solapes con líneas ni con otros textos.
- Soportar acentos y símbolos: `Ø` como `%%c`, `°` como `%%d`, y codificación correcta del español.

**Capas**

| Capa | Contenido |
|---|---|
| `MARCO` | Marco de lámina |
| `MEMBRETE` | Membrete |
| `CONCRETO` | Contorno del muro |
| `TERRENO` | Terreno y relleno |
| `ACERO_PRINCIPAL` | Barras longitudinales |
| `ACERO_SECUNDARIO` | Barras transversales |
| `COTAS` | Cotas y líneas de referencia |
| `TEXTO` | Rótulos y cuadros |

## 7. Mejoras que justifican la API

Por orden de prioridad:

1. Tramas normalizadas (`HATCH`) de concreto y suelo.
2. Cotas asociativas (`DIMENSION`) con estilo de cota propio.
3. Capas con grosor de línea definido y estilo de impresión.
4. Espacio papel con ventana gráfica, en lugar de dibujar la lámina en modelo.
5. Membrete como bloque con atributos editables.
6. Tuberías de drenaje, juntas y elevación longitudinal del muro. La versión anterior tenía tuberías (`TUBO_PB`) y una vista 3D; proponer si se recuperan.
7. Exportación a PDF. DWG solo si existe una herramienta con licencia adecuada para servidor.

Evaluar `ezdxf` frente a seguir en Node. Elegir con argumentos: esto puede ser motivo suficiente para cambiar de tecnología.

## 8. Estructura sugerida

Es un punto de partida; adaptarla a lo que exista.

```text
src/
├── server.js                  # Arranque
├── app.js                     # Express: middlewares y rutas
├── config/
│   └── index.js               # Entorno, orígenes CORS, límites
├── api/
│   ├── routes/plans.js
│   ├── controllers/planController.js
│   ├── schemas/wallPlan.schema.js   # Validación de entrada
│   └── middleware/            # Autenticación, errores, límite de uso
├── domain/
│   ├── wall/geometry.js       # Contorno y puntos del muro
│   ├── wall/reinforcement.js  # Trazado de barras
│   └── sheet/scale.js         # Elección de escala y conversión mm↔m
├── drawing/
│   ├── primitives.js          # Línea, polilínea, texto, círculo
│   ├── annotations.js         # Cotas, referencias, títulos, terreno
│   ├── views/                 # Sección, refuerzo, mallas
│   └── sheet/                 # Marco, membrete, cuadros, notas
├── render/
│   ├── dxfWriter.js
│   └── svgWriter.js
└── standards/
    ├── layers.js
    └── typography.js
tests/
├── fixtures/muro-7.4m.json
├── unit/
└── integration/
```

Regla de dependencias: `api → domain/drawing → render`. `domain` y `drawing` no conocen Express ni el formato del archivo.

## 9. Seguridad y operación

- Eliminar la carpeta pública `documents` y toda escritura en disco.
- CORS limitado a `https://ryaie.com` y a los orígenes de desarrollo configurados.
- Autenticación por token en variable de entorno. **El token no debe ir en el navegador:** la llamada debe pasar por Laravel como intermediario.
- Límite de tamaño del cuerpo (por ejemplo 256 kB) y límite de peticiones.
- Registros sin datos del proyecto: identificador de petición, duración y estado.
- Tiempo máximo por generación.
- Eliminar dependencias e imports sin uso.

## 10. Criterios de aceptación

- [ ] El archivo abre en AutoCAD sin errores ni avisos de reparación.
- [ ] `ezdxf` audita el archivo con 0 errores.
- [ ] Con el JSON de ejemplo, la escala es 1:50 y ninguna entidad sale del marco A1.
- [ ] Texto impreso de 3 mm a cualquier escala, comprobado en 1:25 y 1:100.
- [ ] Un muro sin dentellón (`keyDepth: 0`) y un muro con acero `null` generan el plano sin errores.
- [ ] Sin `NaN`, `undefined` ni textos con acentos rotos en el DXF.
- [ ] No queda ningún archivo en disco tras responder.
- [ ] Pruebas automáticas en verde, con el JSON de ejemplo como caso fijo.

## 11. Cambios en el cliente Laravel

No forman parte de este proyecto, pero el plan debe tenerlos presentes:

1. Crear una ruta Laravel que reenvíe la petición a esta API con el token.
2. `dibujo.js` enviará a esa ruta los datos que hoy pasa a `buildPlan()`.
3. Decidir si `plan.js` queda como respaldo cuando la API no responda. Se recomienda conservarlo, porque Render puede tardar en arrancar.

## 12. Fuera de alcance

- Cálculos de ingeniería.
- Autenticación de usuarios finales: la gestiona Laravel.
- Otros tipos de plano. La estructura debe permitirlos después, pero no se implementan ahora.
