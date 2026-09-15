/**
 * Shapes crudas de una SDSECTION (Section Designer de ETABS).
 *
 * POR QUÉ EXISTE
 *   `e2k-import.js` ya leía las SDSECTION, pero solo para sacar A/Iz/Iy/J de las
 *   piezas de CONCRETO — el armado lo descartaba a propósito, con un
 *   `if (!/^conc/i.test(shapeType)) return;`, porque hasta ahora nadie lo
 *   necesitaba. El diseño de placas sí lo necesita: la superficie de
 *   interacción se arma con las varillas reales que dibujó el ingeniero
 *   (ver python-backend/design/wall_section.py).
 *
 *   Va aparte y no adentro de `e2k-import.js` porque ese archivo ya es enorme y
 *   esto es un parser autónomo: entra una línea, sale una shape.
 *
 * FORMATO
 *   Una shape puede ocupar VARIAS líneas. La primera trae `SHAPETYPE` y la
 *   define; las siguientes la completan y se reconocen por su propia clave:
 *
 *     SDSECTION "PLACA L"  SHAPE 1  SHAPETYPE "POLYGON"  NUMCORNERPTS 8
 *     SDSECTION "PLACA L"  SHAPE 1  POLYCORNER 1  X 1.438  Y -0.004
 *     ...
 *     SDSECTION "PLACA L"  SHAPE 2  SHAPETYPE "RECT REBAR"  D 0.196 B 0.385 XC .. YC ..
 *     SDSECTION "PLACA L"  SHAPE 2  EDGE 1  EDGEBARSIZE "#6"  EDGEBARSPACING 0.12
 *     SDSECTION "PLACA L"  SHAPE 2  CORNER 1  CORNERBARSIZE "#6"
 *     SDSECTION "PLACA L"  SHAPE 2  TIEBARAREA 0.000113
 *
 *   Las shapes salen con las MISMAS claves que espera el motor, así que viajan
 *   al endpoint `wall-interaction` tal cual, sin traducción intermedia.
 *
 * OJO CON EL ESPEJO
 *   El `.e2k` NO exporta MIRROR2/MIRROR3 de una SDSECTION aunque el diálogo de
 *   ETABS los muestre. El motor lo deduce con la nube de varillas; acá no hay
 *   nada que hacer, pero conviene saberlo antes de buscar el campo.
 */

const NUM = (linea, clave) => {
  const m = new RegExp(`(?:^|\\s)${clave}\\s+(-?[\\d.]+(?:[eE][+-]?\\d+)?)`).exec(linea);
  return m ? parseFloat(m[1]) : null;
};

const TXT = (linea, clave) => {
  const m = new RegExp(`(?:^|\\s)${clave}\\s+"([^"]*)"`).exec(linea);
  return m ? m[1] : null;
};

/** Tipos de shape que sabemos armar; el resto se guarda igual, por si acaso. */
export const TIPOS_CONCRETO = ["POLYGON", "CONC RECTANGULAR", "CONC RECTANGLE", "CONC L", "CONC T", "CONC TEE"];
export const TIPOS_ARMADO = ["REBAR", "LINE REBAR", "RECT REBAR"];

/**
 * Lee UNA línea `SDSECTION ... SHAPE n ...` y actualiza `shapes` (array indexado
 * por el número de shape, base 1 → índice n-1). Devuelve la shape tocada, o
 * null si la línea no aporta nada.
 */
export function parseSdShapeLine(shapes, linea) {
  const idx = NUM(linea, "SHAPE");
  if (idx === null) return null;
  const i = Math.round(idx) - 1;
  if (i < 0) return null;

  const tipo = TXT(linea, "SHAPETYPE");
  if (tipo) {
    const shape = { shapeType: tipo.toUpperCase(), material: TXT(linea, "MATERIAL") };
    for (const clave of ["D", "B", "TF", "TW", "XC", "YC", "X1", "Y1", "X2", "Y2", "SPACING", "NUMCORNERPTS"]) {
      const v = NUM(linea, clave);
      if (v !== null) shape[clave] = v;
    }
    const barra = TXT(linea, "BARSIZE");
    if (barra) shape.barSize = barra;
    const extremos = TXT(linea, "ENDBAR");
    if (extremos) shape.endBar = extremos;
    if (shape.shapeType === "POLYGON") shape.corners = [];
    if (shape.shapeType === "RECT REBAR") { shape.edges = []; shape.corners = []; }
    shapes[i] = shape;
    return shape;
  }

  // Líneas de continuación: la shape ya tiene que existir.
  const shape = shapes[i];
  if (!shape) return null;

  if (/(?:^|\s)POLYCORNER\s/i.test(linea)) {
    (shape.corners = shape.corners || []).push({ X: NUM(linea, "X"), Y: NUM(linea, "Y") });
    return shape;
  }
  if (/(?:^|\s)EDGE\s+\d/i.test(linea)) {
    (shape.edges = shape.edges || []).push({
      size: TXT(linea, "EDGEBARSIZE"),
      spacing: NUM(linea, "EDGEBARSPACING"),
    });
    return shape;
  }
  if (/(?:^|\s)CORNER\s+\d/i.test(linea)) {
    (shape.corners = shape.corners || []).push({ size: TXT(linea, "CORNERBARSIZE") });
    return shape;
  }
  const estribo = NUM(linea, "TIEBARAREA");
  if (estribo !== null) {
    shape.tieBarArea = estribo;
    return shape;
  }
  return null;
}

/** ¿La sección tiene lo mínimo para calcular una superficie de interacción? */
export function seccionEsDiseñable(shapes = []) {
  const hayConcreto = shapes.some((s) => s && TIPOS_CONCRETO.includes(s.shapeType));
  const hayArmado = shapes.some((s) => s && TIPOS_ARMADO.includes(s.shapeType));
  return hayConcreto && hayArmado;
}
