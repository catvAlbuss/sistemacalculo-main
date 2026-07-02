// resources/js/etabs/composables/usePolygonCapture.js
// Captura polígonos dibujados en el visor CAD de ETABS2.
// Convierte polilíneas cerradas en coordenadas X/Y listas para enviarse a Safecito.

import { AcApDocManager } from "@mlightcad/cad-simple-viewer";

const POLYLINE_DXF_TYPES = new Set(["LWPOLYLINE", "POLYLINE"]);

function getCurrentDocument() {
  try {
    const manager = AcApDocManager.instance;
    const doc = manager?.curDocument;

    return doc && doc.database ? doc : null;
  } catch (error) {
    console.warn(
      "⚠️ AcApDocManager aún no está listo para capturar polígonos CAD.",
      error?.message || error
    );

    return null;
  }
}

function isPolyline(entity) {
  if (!entity || typeof entity.getPoint3dAt !== "function") return false;
  if (typeof entity.numberOfVertices !== "number" || entity.numberOfVertices < 2) return false;

  if (typeof entity.dxfTypeName === "string") {
    return POLYLINE_DXF_TYPES.has(entity.dxfTypeName.toUpperCase());
  }

  return true;
}

function areSamePoint(a, b, tolerance = 1e-6) {
  return Math.abs(Number(a.x) - Number(b.x)) <= tolerance &&
    Math.abs(Number(a.y) - Number(b.y)) <= tolerance;
}

function isClosedByGeometry(nodes) {
  if (!Array.isArray(nodes) || nodes.length < 4) return false;
  return areSamePoint(nodes[0], nodes[nodes.length - 1]);
}

export function getModelSpacePolylines() {
  const doc = getCurrentDocument();
  if (!doc) return [];

  const modelSpace = doc.database.tables.blockTable.modelSpace;
  const entities = modelSpace.newIterator().toArray();

  return entities.filter(isPolyline);
}

export function polylineToNodes(polyline) {
  const nodes = [];
  const count = polyline.numberOfVertices;

  for (let i = 0; i < count; i++) {
    const point = polyline.getPoint3dAt(i);

    nodes.push({
      id: i + 1,
      x: Number(point.x),
      y: Number(point.y),
    });
  }

  return nodes;
}

export function normalizeCapturedPolygon(polyline, index) {
  const nodes = polylineToNodes(polyline);
  const closed = !!polyline.closed || isClosedByGeometry(nodes);

  return {
    index,
    closed,
    nodes,
    nodeCount: nodes.length,
    source: "cad-polyline",
  };
}

export function captureAllPolygons() {
  return getModelSpacePolylines().map((polyline, index) => {
    return normalizeCapturedPolygon(polyline, index + 1);
  });
}

export function captureClosedPolygons() {
  return captureAllPolygons()
    .filter((polygon) => polygon.closed)
    .filter((polygon) => polygon.nodes.length >= 3)
    .map((polygon, index) => ({
      ...polygon,
      index: index + 1,
    }));
}

export function captureLastPolygon() {
  const polylines = getModelSpacePolylines();

  if (!polylines.length) {
    return {
      index: 0,
      nodes: [],
      closed: false,
      total: 0,
      source: "cad-polyline",
    };
  }

  const polygon = normalizeCapturedPolygon(polylines[polylines.length - 1], polylines.length);

  return {
    ...polygon,
    total: polylines.length,
  };
}

export function validateCapturedPolygons(polygons) {
  if (!Array.isArray(polygons) || !polygons.length) {
    return {
      ok: false,
      message: "No se encontró ningún polígono cerrado en el CAD.",
      validPolygons: [],
      invalidPolygons: [],
    };
  }

  const validPolygons = [];
  const invalidPolygons = [];

  polygons.forEach((polygon) => {
    if (!polygon.closed) {
      invalidPolygons.push({
        ...polygon,
        reason: "Polígono abierto",
      });
      return;
    }

    if (!Array.isArray(polygon.nodes) || polygon.nodes.length < 3) {
      invalidPolygons.push({
        ...polygon,
        reason: "Debe tener al menos 3 nodos",
      });
      return;
    }

    const hasInvalidNode = polygon.nodes.some((node) => {
      return !Number.isFinite(Number(node.x)) || !Number.isFinite(Number(node.y));
    });

    if (hasInvalidNode) {
      invalidPolygons.push({
        ...polygon,
        reason: "Contiene coordenadas no numéricas",
      });
      return;
    }

    validPolygons.push(polygon);
  });

  return {
    ok: validPolygons.length > 0,
    message: validPolygons.length
      ? `${validPolygons.length} polígono(s) cerrado(s) listo(s).`
      : "No hay polígonos válidos para calcular.",
    validPolygons,
    invalidPolygons,
  };
}

export function captureLastClosedPolygon() {
  const polygons = captureAllPolygons()
    .filter((polygon) => polygon.closed)
    .filter((polygon) => Array.isArray(polygon.nodes) && polygon.nodes.length >= 3);

  if (!polygons.length) {
    return null;
  }

  return {
    ...polygons[polygons.length - 1],
    index: 1,
    source: "cad-polyline-last-closed",
  };
}