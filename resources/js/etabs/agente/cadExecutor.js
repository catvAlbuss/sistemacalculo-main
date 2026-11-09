// Convierte primitivas en metros en entidades del dibujo abierto, en sus capas,
// escaladas a las unidades del dibujo y dentro de una sola operación de deshacer.
// Las dependencias del CAD se inyectan para poder probarlo en Node.

import {LAYER_COLORS} from "./primitives.js";
import {CAPAS_DESPACHO} from "./estiloLaminas.js";

// INSUNITS -> unidades del dibujo por metro.
const UNITS_PER_METER = {1: 39.3701, 2: 3.28084, 4: 1000, 5: 100, 6: 1, 14: 10};

export function unitsPerMeter(database) {
  return UNITS_PER_METER[database?.insunits] ?? 1;
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
      // Achurado (patrón del AutoCAD o sólido) de un contorno cerrado.
      if (!p.points || p.points.length < 3) return null;
      entity = new dm.AcDbHatch();
      if (p.solido) entity.isSolidFill = true;
      else {
        entity.patternType = dm.AcDbHatchPatternType?.Predefined ?? 1;
        entity.patternName = p.patron;
        entity.patternScale = (p.escala ?? 1) * k;
        entity.patternAngle = ((p.angulo ?? 0) * Math.PI) / 180;
      }
      entity.add(new dm.AcGePolyline2d(p.points.map((point) => { const q = pt(point); return new dm.AcGePoint2d(q.x, q.y); }), true));
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
export function drawPrimitives(database, primitivas, {dm, edit = (db, label, fn) => fn(), label = "Agente Predim", origin = {x: 0, y: 0}, unitsPerMeter: k = unitsPerMeter(database)} = {}) {
  let count = 0;
  let layers = [];
  edit(database, label, () => {
    // Los achurados se crean contra la base de datos de trabajo.
    if (primitivas.some((p) => p.type === "hatch")) {
      try { const host = dm.acdbHostApplicationServices?.(); if (host && host.workingDatabase !== database) host.workingDatabase = database; } catch { /* el visor ya la tiene */ }
    }
    layers = ensureLayers(database, [...new Set(primitivas.map((p) => p.layer))], dm);
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
