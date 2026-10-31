export const isBlankCoordinate = value => value == null || (typeof value === 'string' && value.trim() === '');

// Editable examples, not dimensions or loads of the user's project.
const EXAMPLE_POLYGONS = [
  [[-6,-4],[6,-4],[0,8]],
  [[-3.5,-2.5],[-2.5,-2.5],[-3,-1.5]],
  [[-.5,-2.5],[.5,-2.5],[0,-1.5]],
  [[2.5,-2.5],[3.5,-2.5],[3,-1.5]],
  [[-2,.5],[-1,.5],[-1.5,1.5]],
  [[1,.5],[2,.5],[1.5,1.5]],
];
export const createPolygonRows = (exampleIndex=0) => (EXAMPLE_POLYGONS[exampleIndex] ?? EXAMPLE_POLYGONS[0])
  .map(([xv,yv],index)=>({id:index+1,xv,yv}));

// Area and centroidal inertias of the exterior example, without openings.
export const FOUNDATION_SAMPLE_PROPERTIES = { A:72,Ixx:576,Iyy:432,Df:2 };

export const polygonRows = (rows,enabled=true) => enabled ? rows.filter(row => !(isBlankCoordinate(row.xv) && isBlankCoordinate(row.yv))) : [];

export const polygonArea = rows => Math.abs(rows.reduce((sum,row,index) => {
  const next=rows[(index+1)%rows.length];
  return sum + Number(row.xv)*Number(next.yv) - Number(next.xv)*Number(row.yv);
},0)/2);

export function polygonError(rows,title,required,enabled=true) {
  const points=polygonRows(rows,required || enabled);
  if(points.length===0) return required ? `${title}: ingresa al menos 3 vértices.` : null;
  if(points.some(row=>isBlankCoordinate(row.xv)||isBlankCoordinate(row.yv)||!Number.isFinite(Number(row.xv))||!Number.isFinite(Number(row.yv)))) {
    return `${title}: todas las coordenadas X e Y deben ser numéricas.`;
  }
  if(points.length<3) return `${title}: necesita al menos 3 vértices (tiene ${points.length}).`;
  if(polygonArea(points)<=1e-9) {
    return `${title}: sus vértices ${points.map(row=>`(${row.xv}, ${row.yv})`).join(' ')} no forman una figura; deben ser puntos distintos y no alineados.`;
  }
  return null;
}

export function polygonVector(rows,name,enabled=true) {
  const points=polygonRows(rows,enabled);
  return points.length ? '['+points.map(row=>row[name]).join(',')+']' : '1:0';
}
