// Rebuild the solver's regular mesh without interpolation or point reduction.
// A heatmap uses the 2D renderer, so eleven combinations do not need WebGL contexts.
export function pressureMapTrace(xCoordinates,yCoordinates,pressures) {
  const xs=Array.from(xCoordinates).flat(Infinity),ys=Array.from(yCoordinates).flat(Infinity),values=Array.from(pressures).flat(Infinity);
  if(xs.length!==ys.length||xs.length!==values.length||!xs.length)throw Error('Los datos del mapa de presiones están incompletos.');
  if(xs.some(value=>!Number.isFinite(value))||ys.some(value=>!Number.isFinite(value)))throw Error('Las coordenadas del mapa deben ser numéricas.');
  const x=[...new Set(xs)].sort((a,b)=>a-b),y=[...new Set(ys)].sort((a,b)=>a-b);
  const xIndex=new Map(x.map((value,index)=>[value,index])),yIndex=new Map(y.map((value,index)=>[value,index]));
  const z=y.map(()=>Array(x.length).fill(null));
  values.forEach((value,index)=>{z[yIndex.get(ys[index])][xIndex.get(xs[index])]=Number.isFinite(value)?value:null;});
  return {type:'heatmap',x,y,z,colorscale:'Viridis',zsmooth:false,connectgaps:false,hoverongaps:false,
    colorbar:{thickness:18,len:.85,title:{text:'Presión (tn/m²)',side:'right'}},
    hovertemplate:'X: %{x:.2f} m<br>Y: %{y:.2f} m<br>Presión: %{z:.2f} tn/m²<extra></extra>',
  };
}
