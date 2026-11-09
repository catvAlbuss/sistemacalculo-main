// resources/js/etabs/composables/usePolygonCapture.js
// Captura polígonos dibujados en el visor CAD de ETABS2.
// Convierte polilíneas cerradas en coordenadas X/Y listas para enviarse a Safecito.

import { AcApDocManager } from "@mlightcad/cad-simple-viewer";

import {isCadPolyline, normalizeCapturedPolygon, polygonValidationError} from './polygonGeometry.js';
export {polylineToNodes, normalizeCapturedPolygon} from './polygonGeometry.js';

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

export function getModelSpacePolylines() {
  const doc = getCurrentDocument();
  if (!doc) return [];

  const modelSpace = doc.database.tables.blockTable.modelSpace;
  const entities = modelSpace.newIterator().toArray();

  return entities.filter(isCadPolyline);
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
    const reason = polygonValidationError(polygon);
    if (reason) {
      invalidPolygons.push({...polygon,reason});
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