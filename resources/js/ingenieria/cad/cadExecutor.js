// Convierte primitivas en metros en entidades del dibujo abierto, en sus capas,
// escaladas a las unidades del dibujo y dentro de una sola operación de deshacer.
// Las dependencias del CAD se inyectan para poder probarlo en Node.

import {LAYER_COLORS} from "./primitives.js";
import {CAPAS_DESPACHO} from "../criterios/estiloLaminas.js";
import {repararAchurado} from "./achurados.js";

// INSUNITS -> unidades del dibujo por metro.
const UNITS_PER_METER = {1: 39.3701, 2: 3.28084, 4: 1000, 5: 100, 6: 1, 14: 10};

export function unitsPerMeter(database) {
  return UNITS_PER_METER[database?.insunits] ?? 1;
}

// Estilo de texto del agente: Arial. El "Standard" de muchos planos usa una fuente sin
// "Ø" (p. ej. SimKai) y el visor dibuja "8ⓈⓉ/8\"" en lugar de "8Ø5/8\"".
export const ESTILO_TEXTO = "NOVACAD";
export function ensureTextStyle(database, dm) {
  const tabla = database.tables.textStyleTable;
  if (tabla.has(ESTILO_TEXTO)) return false;
  const estilo = new dm.AcDbTextStyleTableRecord({name: ESTILO_TEXTO, font: "arial", bigFont: "", standardFlag: 0, fixedTextHeight: 0, widthFactor: 1, obliqueAngle: 0, textGenerationFlag: 0, lastHeight: 0.2});
  estilo.fileName = "arial";
  tabla.add(estilo);
  return true;
}

export function ensureLayers(database, names, dm) {
  const created = [];
  for (const name of names) {
    if (database.tables.layerTable.has(name)) continue;
    const color = new dm.AcCmColor();
    color.colorIndex = LAYER_COLORS[name] ?? CAPAS_DESPACHO[name] ?? 7;
    database.tables.layerTable.add(new dm.AcDbLayerTableRecord({name, color}));
    created.push(name);
  }
  return created;
}

// Contorno de achurado sin vértices repetidos (también el de cierre) ni puntos
// alineados que no aportan. Tolerancia relativa al tamaño del contorno. null si no queda
// un contorno con área.
export function contornoLimpio(puntos) {
  if (!puntos || puntos.length < 3) return null;
  const xs = puntos.map((q) => q.x), ys = puntos.map((q) => q.y);
  const tam = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  if (!(tam > 0)) return null;
  const eps = tam * 1e-6;
  let out = puntos.filter((q, i) => i === 0 || Math.hypot(q.x - puntos[i - 1].x, q.y - puntos[i - 1].y) > eps);
  while (out.length > 1 && Math.hypot(out[0].x - out.at(-1).x, out[0].y - out.at(-1).y) <= eps) out.pop();
  // Vértices sobre la recta de sus vecinos (incluidas "espigas" de ida y vuelta).
  for (let cambio = true; cambio && out.length >= 3;) {
    cambio = false;
    for (let i = 0; i < out.length; i++) {
      const a = out[(i - 1 + out.length) % out.length], b = out[i], c = out[(i + 1) % out.length];
      if (Math.abs((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)) <= eps * tam) { out.splice(i, 1); cambio = true; break; }
    }
  }
  if (out.length < 3) return null;
  const area = out.reduce((s, q, i) => s + q.x * out[(i + 1) % out.length].y - out[(i + 1) % out.length].x * q.y, 0) / 2;
  return Math.abs(area) > eps * tam ? out : null;
}

function toEntity(p, k, origin, dm) {
  const pt = ([x, y]) => ({x: origin.x + x * k, y: origin.y + y * k, z: 0});
  let entity;
  switch (p.type) {
    case "line":
      entity = new dm.AcDbLine(pt(p.a), pt(p.b));
      break;
    case "pline": {
      entity = new dm.AcDbPolyline();
      p.points.forEach((point, i) => { const q = pt(point); entity.addVertexAt(i, new dm.AcGePoint2d(q.x, q.y)); });
      entity.closed = Boolean(p.closed);
      break;
    }
    case "circle":
      entity = new dm.AcDbCircle(pt(p.c), p.r * k);
      break;
    case "arc":
      entity = new dm.AcDbArc(pt(p.c), p.r * k, p.a0, p.a1);
      break;
    case "text":
      entity = new dm.AcDbMText();
      entity.contents = p.value;
      entity.styleName = ESTILO_TEXTO;
      entity.height = p.h * k;
      entity.location = pt(p.at);
      entity.attachmentPoint = p.align === "izq" ? dm.AcGiMTextAttachmentPoint.BottomLeft : dm.AcGiMTextAttachmentPoint.MiddleCenter;
      if (p.rot) {
        const a = (p.rot * Math.PI) / 180;
        entity.rotation = a;
        // El visor orienta el MTEXT por su dirección (no por rotation): se fijan ambas.
        entity.direction = {x: Math.cos(a), y: Math.sin(a), z: 0};
      }
      break;
    case "hatch": {
      // Achurado (patrón del AutoCAD o sólido) de un contorno cerrado. Sin vértices
      // repetidos: un segmento de largo cero hace fallar al visor ("PolyBool: Zero-length
      // segment") y el achurado queda sin relleno.
      const puntos = contornoLimpio((p.points ?? []).map(pt));
      if (!puntos) return null;
      entity = new dm.AcDbHatch();
      if (p.solido) entity.isSolidFill = true;
      else {
        entity.patternType = dm.AcDbHatchPatternType?.Predefined ?? 1;
        entity.patternName = p.patron;
        entity.patternScale = (p.escala ?? 1) * k;
        entity.patternAngle = ((p.angulo ?? 0) * Math.PI) / 180;
      }
      entity.add(new dm.AcGePolyline2d(puntos.map((q) => new dm.AcGePoint2d(q.x, q.y)), true));
      repararAchurado(entity, dm); // por si el contorno se cruza a sí mismo
      break;
    }
    default:
      return null;
  }
  entity.layer = p.layer;
  // Color propio de la entidad (estilo del despacho: p. ej. contorno de columna en azul
  // sobre la capa 0); sin él, el de la capa.
  if (Number.isInteger(p.color) && p.color !== 256) {
    const color = new dm.AcCmColor();
    color.colorIndex = p.color;
    entity.color = color;
  }
  return entity;
}

// edit(db, label, fn) agrupa todo en un paso de deshacer (acapRunDatabaseEdit).
// unitsPerMeter permite forzar la escala cuando el archivo declara mal sus unidades.
export function drawPrimitives(database, primitivas, {dm, edit = (db, label, fn) => fn(), label = "Agente NovaCad", origin = {x: 0, y: 0}, unitsPerMeter: k = unitsPerMeter(database)} = {}) {
  let count = 0;
  let layers = [];
  edit(database, label, () => {
    // Los achurados se crean contra la base de datos de trabajo.
    if (primitivas.some((p) => p.type === "hatch")) {
      try { const host = dm.acdbHostApplicationServices?.(); if (host && host.workingDatabase !== database) host.workingDatabase = database; } catch { /* el visor ya la tiene */ }
    }
    layers = ensureLayers(database, [...new Set(primitivas.map((p) => p.layer))], dm);
    if (primitivas.some((p) => p.type === "text")) ensureTextStyle(database, dm);
    const modelSpace = database.tables.blockTable.modelSpace;
    for (const p of primitivas) {
      const entity = toEntity(p, k, origin, dm);
      if (!entity) continue;
      modelSpace.appendEntity(entity);
      count++;
    }
  });
  return {entidades: count, capasCreadas: layers, escala: k};
}
