// usePolygonCapture.js
// Lee los polígonos (polilíneas) dibujados con la herramienta nativa "Polyline"
// del visor CAD y devuelve sus vértices en coordenadas del mundo CAD (X, Y).
import { AcApDocManager } from "@mlightcad/cad-simple-viewer";

// Tipos DXF de entidades tipo polilínea que cuentan como "polígono".
const POLYLINE_DXF_TYPES = new Set(["LWPOLYLINE", "POLYLINE"]);

/**
 * Devuelve el documento CAD actualmente abierto, o null si no hay ninguno.
 */
function getCurrentDocument() {
  const doc = AcApDocManager.instance?.curDocument;
  return doc && doc.database ? doc : null;
}

/**
 * Detección robusta de polilíneas por API pública (no por instanceof ni por
 * nombre de clase, que se minifican en el build de producción).
 */
function isPolyline(entity) {
  if (!entity || typeof entity.getPoint3dAt !== "function") return false;
  if (typeof entity.numberOfVertices !== "number" || entity.numberOfVertices < 2) return false;
  // Si la entidad expone su tipo DXF, lo usamos para filtrar con precisión.
  if (typeof entity.dxfTypeName === "string") {
    return POLYLINE_DXF_TYPES.has(entity.dxfTypeName.toUpperCase());
  }
  return true;
}

/**
 * Devuelve todas las polilíneas presentes en el model space, en el orden en
 * que fueron creadas.
 */
export function getModelSpacePolylines() {
  const doc = getCurrentDocument();
  if (!doc) return [];

  const modelSpace = doc.database.tables.blockTable.modelSpace;
  const entities = modelSpace.newIterator().toArray();
  return entities.filter(isPolyline);
}

/**
 * Convierte una polilínea en una lista de nodos con coordenadas del mundo CAD.
 * @param {AcDbPolyline} polyline
 * @returns {{ id: number, x: number, y: number }[]}
 */
export function polylineToNodes(polyline) {
  const nodes = [];
  const count = polyline.numberOfVertices;
  for (let i = 0; i < count; i++) {
    const point = polyline.getPoint3dAt(i); // coordenadas del mundo (WCS)
    nodes.push({ id: i + 1, x: point.x, y: point.y });
  }
  return nodes;
}

/**
 * Captura el último polígono dibujado (la última polilínea del model space).
 * @returns {{ nodes: {id:number,x:number,y:number}[], closed: boolean, total: number }}
 */
export function captureLastPolygon() {
  const polylines = getModelSpacePolylines();
  if (polylines.length === 0) {
    return { nodes: [], closed: false, total: 0 };
  }

  const polyline = polylines[polylines.length - 1];
  return {
    nodes: polylineToNodes(polyline),
    closed: !!polyline.closed,
    total: polylines.length,
  };
}

/**
 * Captura TODOS los polígonos (polilíneas) existentes en el model space.
 * @returns {{ index: number, closed: boolean, nodes: {id:number,x:number,y:number}[] }[]}
 */
export function captureAllPolygons() {
  return getModelSpacePolylines().map((polyline, i) => ({
    index: i + 1,
    closed: !!polyline.closed,
    nodes: polylineToNodes(polyline),
  }));
}
