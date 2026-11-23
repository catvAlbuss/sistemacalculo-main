const TYPES = new Set(['LWPOLYLINE', 'POLYLINE']);

export function isCadPolyline(entity) {
  return !!entity && (typeof entity.getPoint3dAt === 'function' || typeof entity.getPointAt === 'function') &&
    Number.isInteger(entity.numberOfVertices) && entity.numberOfVertices >= 2 &&
    (typeof entity.dxfTypeName !== 'string' || TYPES.has(entity.dxfTypeName.toUpperCase()));
}

export function polylineToNodes(polyline) {
  const readPoint = polyline.getPoint3dAt || polyline.getPointAt;
  return Array.from({length:polyline.numberOfVertices}, (_, i) => {
    const point = readPoint.call(polyline, i);
    return {id:i+1, x:Number(point.x), y:Number(point.y)};
  });
}

const samePoint = (a,b) => Math.abs(a.x-b.x)<=1e-6 && Math.abs(a.y-b.y)<=1e-6;

export function normalizeCapturedPolygon(polyline, index) {
  const nodes = polylineToNodes(polyline);
  const repeatedEnd = nodes.length > 3 && samePoint(nodes[0],nodes.at(-1));
  if (repeatedEnd) nodes.pop();
  return {index,closed:polyline.closed === true || repeatedEnd,nodes,nodeCount:nodes.length,source:'cad-polyline'};
}

export function polygonValidationError(polygon) {
  if (!polygon.closed) return 'Polígono abierto';
  const nodes = polygon.nodes;
  if (!Array.isArray(nodes) || nodes.length < 3) return 'Debe tener al menos 3 nodos';
  if (nodes.some(node => !Number.isFinite(Number(node.x)) || !Number.isFinite(Number(node.y)))) return 'Contiene coordenadas no numéricas';
  const twiceArea = nodes.reduce((sum, point, i) => {
    const next = nodes[(i+1)%nodes.length];
    return sum + Number(point.x)*Number(next.y)-Number(next.x)*Number(point.y);
  }, 0);
  return Math.abs(twiceArea) > 1e-12 ? null : 'El polígono no tiene área; revisa sus vértices';
}
