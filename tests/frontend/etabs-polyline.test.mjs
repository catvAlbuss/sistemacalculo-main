import test from 'node:test';
import assert from 'node:assert/strict';
import {AcDbPolyline,AcDb2dPolyline,AcDb3dPolyline} from '@mlightcad/data-model';
import {isCadPolyline,normalizeCapturedPolygon,polygonValidationError} from '../../resources/js/etabs/composables/polygonGeometry.js';

const vertices=[{x:-2,y:-1,z:0},{x:2,y:-1,z:0},{x:0,y:3,z:0}];
test('captures actual installed lightweight, 2D and 3D CAD polylines',()=>{
 const light=new AcDbPolyline();vertices.forEach((v,i)=>light.addVertexAt(i,v));light.closed=true;
 const entities=[light,new AcDb2dPolyline(0,vertices,0,true),new AcDb3dPolyline(0,vertices,true)];
 for(const entity of entities){
  assert.equal(isCadPolyline(entity),true,entity.constructor.name);
  const polygon=normalizeCapturedPolygon(entity,1);assert.equal(polygon.closed,true);assert.equal(polygonValidationError(polygon),null);
  assert.deepEqual(polygon.nodes,vertices.map((v,i)=>({id:i+1,x:v.x,y:v.y})));assert.equal(polygon.nodeCount,3);
 }
});
test('recognizes a repeated closing point without inventing an edge for open paths',()=>{
 const verticesClosed=[...vertices,vertices[0]];
 const entity=new AcDb3dPolyline(0,verticesClosed,false);
 const closed=normalizeCapturedPolygon(entity,1);assert.equal(closed.closed,true);assert.equal(closed.nodeCount,3);
 assert.equal(entity.numberOfVertices,4,'CAD document is unchanged');
 const open=normalizeCapturedPolygon(new AcDb3dPolyline(0,vertices,false),1);assert.equal(open.closed,false);assert.equal(polygonValidationError(open),'Polígono abierto');
});
test('rejects non-polylines, invalid coordinates and a degenerate foundation',()=>{
 assert.equal(isCadPolyline({dxfTypeName:'LINE',numberOfVertices:3,getPointAt(){}}),false);
 assert.equal(isCadPolyline(null),false);
 assert.match(polygonValidationError({closed:true,nodes:[{x:0,y:0},{x:1,y:1},{x:2,y:2}]}),/área/);
 assert.match(polygonValidationError({closed:true,nodes:[{x:0,y:0},{x:Infinity,y:1},{x:2,y:2}]}),/numéricas/);
});
