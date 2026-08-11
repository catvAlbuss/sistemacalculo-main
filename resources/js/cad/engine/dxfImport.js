// resources/js/cad/engine/dxfImport.js
// Lectura de planos DXF para usarlos como fondo + snap en la vista de planta
// (típicamente la Base). Función PURA: recibe texto DXF + factor de escala,
// devuelve segmentos de línea y vértices únicos en METROS. Sin `this`, sin DOM
// — el mixin (mixins/grids/plan-import.js) es quien la invoca y guarda estado.
//
// Parser real: @mlightcad/dxf-json (ya usado en resources/js/etabs/ para
// capturar polígonos DXF — ver composables/usePolygonCapture.js). API
// verificada contra sus .d.ts:
//   new DxfParser().parseSync(text) -> { entities: CommonDxfEntity[], blocks: Record<name,{entities,position}>, ... }
//   LINE       -> { startPoint:{x,y,z}, endPoint:{x,y,z} }
//   LWPOLYLINE -> { vertices:[{x,y,bulge?}], flag }        (bit 1 = cerrado)
//   POLYLINE   -> { vertices:[{x,y,z}], flag }             (bit 1 = cerrado)
//   ARC        -> { center, radius, startAngle, endAngle } (ángulos en GRADOS)
//   CIRCLE     -> { center, radius }
//   ELLIPSE    -> { center, majorAxisEndPoint, axisRatio, startAngle, endAngle } (RADIANES)
//   SPLINE     -> { controlPoints:[], fitPoints:[] }
//   INSERT     -> { name, insertionPoint, xScale, yScale, rotation(°), columnCount, rowCount, ... }
// Los planos arquitectónicos reales guardan casi toda la geometría DENTRO de
// bloques (referenciados por INSERT), así que hay que EXPANDIR los bloques
// aplicando la transformación de cada INSERT — si no, `entities` de nivel
// superior sale casi vacío de líneas y no se ve nada.
import DxfParser from "@mlightcad/dxf-json";

const CLOSED_FLAG_BIT = 1;
const ARC_SEGMENTS_PER_TURN = 48; // teselado de arcos/círculos/elipses
const MAX_BLOCK_DEPTH = 12;       // guarda anti-recursión de bloques anidados

function isClosed(flag) {
  return (Number(flag) & CLOSED_FLAG_BIT) !== 0;
}

// --- Transformaciones afines 2D: x' = a*x + c*y + e ; y' = b*x + d*y + f ---
const IDENTITY_TF = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

function applyTf(tf, x, y) {
  return { x: tf.a * x + tf.c * y + tf.e, y: tf.b * x + tf.d * y + tf.f };
}

// combined(p) = parent(child(p))
function composeTf(P, C) {
  return {
    a: P.a * C.a + P.c * C.b,
    b: P.b * C.a + P.d * C.b,
    c: P.a * C.c + P.c * C.d,
    d: P.b * C.c + P.d * C.d,
    e: P.a * C.e + P.c * C.f + P.e,
    f: P.b * C.e + P.d * C.f + P.f,
  };
}

// tf de un INSERT: lleva un punto en coords del bloque a coords del padre,
// restando la base del bloque, escalando (sx,sy), rotando (rad) y trasladando
// al punto de inserción (ya desplazado por la copia de array col/row).
function insertTf(ipx, ipy, sx, sy, rotRad, bx, by) {
  const cos = Math.cos(rotRad);
  const sin = Math.sin(rotRad);
  const a = cos * sx, b = sin * sx, c = -sin * sy, d = cos * sy;
  return {
    a, b, c, d,
    e: ipx - (a * bx + c * by),
    f: ipy - (b * bx + d * by),
  };
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Colector: `out` acumula { segments, snapPts, counts }.
function emitSeg(out, tf, x1, y1, x2, y2) {
  const p1 = applyTf(tf, x1, y1);
  const p2 = applyTf(tf, x2, y2);
  out.segments.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
}
function emitSnap(out, tf, x, y) {
  const p = applyTf(tf, x, y);
  out.snapPts.push(p);
}

function emitPolyline(out, tf, pts, closed) {
  if (pts.length < 2) return;
  for (let i = 0; i < pts.length - 1; i++) {
    emitSeg(out, tf, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
  }
  if (closed && pts.length > 2) {
    const a = pts[pts.length - 1], b = pts[0];
    emitSeg(out, tf, a.x, a.y, b.x, b.y);
  }
  pts.forEach((p) => emitSnap(out, tf, p.x, p.y)); // vértices reales = snap
}

// Tesela un arco (ángulos en radianes) en segmentos; añade solo los extremos
// (y el centro) como puntos de snap, no cada punto del teselado (sería ruido).
function emitArc(out, tf, cx, cy, r, a0, a1, addSnapEnds = true) {
  if (!(r > 0)) return;
  let span = a1 - a0;
  while (span <= 0) span += Math.PI * 2;
  const steps = Math.max(2, Math.ceil((span / (Math.PI * 2)) * ARC_SEGMENTS_PER_TURN));
  let prev = null;
  for (let i = 0; i <= steps; i++) {
    const ang = a0 + (span * i) / steps;
    const x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
    if (prev) emitSeg(out, tf, prev.x, prev.y, x, y);
    prev = { x, y };
  }
  emitSnap(out, tf, cx, cy);
  if (addSnapEnds) {
    emitSnap(out, tf, cx + r * Math.cos(a0), cy + r * Math.sin(a0));
    emitSnap(out, tf, cx + r * Math.cos(a1), cy + r * Math.sin(a1));
  }
}

function emitEllipse(out, tf, entity) {
  const cx = num(entity.center?.x), cy = num(entity.center?.y);
  const mx = num(entity.majorAxisEndPoint?.x), my = num(entity.majorAxisEndPoint?.y);
  const ratio = num(entity.axisRatio, 1);
  const major = Math.hypot(mx, my);
  if (!(major > 0)) return;
  const rot = Math.atan2(my, mx);
  let a0 = num(entity.startAngle, 0), a1 = num(entity.endAngle, Math.PI * 2);
  let span = a1 - a0;
  while (span <= 0) span += Math.PI * 2;
  const steps = Math.max(2, Math.ceil((span / (Math.PI * 2)) * ARC_SEGMENTS_PER_TURN));
  const cosR = Math.cos(rot), sinR = Math.sin(rot);
  let prev = null;
  for (let i = 0; i <= steps; i++) {
    const t = a0 + (span * i) / steps;
    const ex = major * Math.cos(t), ey = major * ratio * Math.sin(t);
    const x = cx + ex * cosR - ey * sinR, y = cy + ex * sinR + ey * cosR;
    if (prev) emitSeg(out, tf, prev.x, prev.y, x, y);
    prev = { x, y };
  }
  emitSnap(out, tf, cx, cy);
}

// Recorre una lista de entidades aplicando la transformación `tf`. Recursivo
// para los INSERT (expande el bloque referenciado). `blocks` = tabla de bloques.
function collectEntities(out, entities, tf, blocks, depth, stack) {
  if (!Array.isArray(entities)) return;
  entities.forEach((entity) => {
    switch (entity.type) {
      case "LINE":
        if (entity.startPoint && entity.endPoint) {
          emitSeg(out, tf, num(entity.startPoint.x), num(entity.startPoint.y),
            num(entity.endPoint.x), num(entity.endPoint.y));
          emitSnap(out, tf, num(entity.startPoint.x), num(entity.startPoint.y));
          emitSnap(out, tf, num(entity.endPoint.x), num(entity.endPoint.y));
          out.counts.line++;
        }
        break;
      case "LWPOLYLINE":
      case "POLYLINE": {
        const verts = Array.isArray(entity.vertices) ? entity.vertices : [];
        emitPolyline(out, tf, verts.map((v) => ({ x: num(v.x), y: num(v.y) })), isClosed(entity.flag));
        out.counts.polyline++;
        break;
      }
      case "ARC":
        emitArc(out, tf, num(entity.center?.x), num(entity.center?.y), num(entity.radius),
          (num(entity.startAngle) * Math.PI) / 180, (num(entity.endAngle) * Math.PI) / 180);
        out.counts.arc++;
        break;
      case "CIRCLE":
        emitArc(out, tf, num(entity.center?.x), num(entity.center?.y), num(entity.radius), 0, Math.PI * 2, false);
        emitSnap(out, tf, num(entity.center?.x), num(entity.center?.y));
        out.counts.circle++;
        break;
      case "ELLIPSE":
        emitEllipse(out, tf, entity);
        out.counts.ellipse++;
        break;
      case "SPLINE": {
        const pts = (Array.isArray(entity.fitPoints) && entity.fitPoints.length >= 2)
          ? entity.fitPoints : entity.controlPoints;
        if (Array.isArray(pts) && pts.length >= 2) {
          emitPolyline(out, tf, pts.map((p) => ({ x: num(p.x), y: num(p.y) })), isClosed(entity.flag));
          out.counts.spline++;
        }
        break;
      }
      case "INSERT": {
        const block = blocks?.[entity.name];
        if (!block || depth >= MAX_BLOCK_DEPTH || stack.has(entity.name)) break;
        const sx = num(entity.xScale, 1) || 1;
        const sy = num(entity.yScale, 1) || 1;
        const rot = (num(entity.rotation) * Math.PI) / 180;
        const bx = num(block.position?.x), by = num(block.position?.y);
        const cols = Math.max(1, Math.floor(num(entity.columnCount, 1)));
        const rows = Math.max(1, Math.floor(num(entity.rowCount, 1)));
        const colSp = num(entity.columnSpacing), rowSp = num(entity.rowSpacing);
        const cos = Math.cos(rot), sin = Math.sin(rot);
        stack.add(entity.name);
        for (let ci = 0; ci < cols; ci++) {
          for (let ri = 0; ri < rows; ri++) {
            // desplazamiento de la copia de array, en el marco rotado del insert
            const dx = ci * colSp, dy = ri * rowSp;
            const ipx = num(entity.insertionPoint?.x) + (cos * dx - sin * dy);
            const ipy = num(entity.insertionPoint?.y) + (sin * dx + cos * dy);
            const childTf = composeTf(tf, insertTf(ipx, ipy, sx, sy, rot, bx, by));
            collectEntities(out, block.entities, childTf, blocks, depth + 1, stack);
          }
        }
        stack.delete(entity.name);
        out.counts.insert++;
        break;
      }
      default:
        break; // TEXT, HATCH, DIMENSION, etc. → se ignoran (no aportan grilla)
    }
  });
}

/**
 * Parsea un DXF y extrae geometría de línea en metros, expandiendo bloques.
 * @param {string} text          Contenido del archivo .dxf (texto plano)
 * @param {number} unitToMeters  Factor de escala de las unidades del archivo a metros
 *                                (mm=0.001, cm=0.01, m=1). El header $INSUNITS del DXF
 *                                es poco fiable en archivos reales (muchos exportan
 *                                "unitless"), así que SIEMPRE se pide al usuario que lo
 *                                confirme en el modal — nunca se infiere en silencio aquí.
 * @returns {{segments:Array<{x1,y1,x2,y2}>, vertices:Array<{x,y}>, bounds:{minX,minY,maxX,maxY}|null, counts:object}}
 */
export function parseDxfPlan(text, unitToMeters = 1) {
  const scale = Number(unitToMeters) > 0 ? Number(unitToMeters) : 1;
  const parsed = new DxfParser().parseSync(text);
  const entities = Array.isArray(parsed?.entities) ? parsed.entities : [];
  const blocks = parsed?.blocks || {};

  // El factor de unidades se hornea en la transformación raíz, así toda la
  // geometría (incluida la de dentro de bloques) sale directamente en metros.
  const rootTf = { a: scale, b: 0, c: 0, d: scale, e: 0, f: 0 };

  const out = {
    segments: [],
    snapPts: [],
    counts: { line: 0, polyline: 0, arc: 0, circle: 0, ellipse: 0, spline: 0, insert: 0, total: entities.length },
  };

  collectEntities(out, entities, rootTf, blocks, 0, new Set());

  const segments = out.segments;

  // Deduplicar vértices de snap (mismo punto compartido por varios segmentos)
  // para no saturar el snap con puntos repetidos.
  const seen = new Set();
  const vertices = [];
  out.snapPts.forEach((p) => {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
    const key = `${Math.round(p.x * 1000)}:${Math.round(p.y * 1000)}`;
    if (seen.has(key)) return;
    seen.add(key);
    vertices.push(p);
  });

  // Bounds a partir de TODOS los extremos de segmento (no solo de los snap,
  // porque arcos/círculos aportan geometría sin muchos snaps).
  let bounds = null;
  segments.forEach((s) => {
    [[s.x1, s.y1], [s.x2, s.y2]].forEach(([x, y]) => {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      if (!bounds) bounds = { minX: x, minY: y, maxX: x, maxY: y };
      else {
        bounds.minX = Math.min(bounds.minX, x); bounds.minY = Math.min(bounds.minY, y);
        bounds.maxX = Math.max(bounds.maxX, x); bounds.maxY = Math.max(bounds.maxY, y);
      }
    });
  });

  return { segments, vertices, bounds, counts: out.counts };
}

/**
 * Convierte un DWG (binario) a texto DXF usando LibreDWG compilado a WebAssembly
 * (@mlightcad/libredwg-web, ya presente por el módulo etabs/). El import es
 * DINÁMICO a propósito: el WASM pesa ~8 MB y va embebido como data-URI en el JS,
 * así que solo se carga cuando el usuario realmente importa un DWG — el bundle
 * base del CAD no lo arrastra. Devuelto el DXF, se reusa parseDxfPlan() tal cual.
 * @param {ArrayBuffer} arrayBuffer  Contenido binario del .dwg
 * @returns {Promise<string>}        Texto DXF equivalente
 */
export async function dwgToDxfText(arrayBuffer) {
  const { LibreDwg } = await import("@mlightcad/libredwg-web");
  const libredwg = await LibreDwg.create();
  const dxfBytes = libredwg.dwg_write_dxf(arrayBuffer);
  if (!dxfBytes) {
    throw new Error("LibreDWG no pudo convertir el DWG a DXF.");
  }
  return new TextDecoder().decode(dxfBytes);
}
