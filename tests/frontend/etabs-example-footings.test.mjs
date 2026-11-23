import test from 'node:test';
import assert from 'node:assert/strict';
import {cloneDefaultSafecitoColumns} from '../../resources/js/safecito/defaultSafecitoData.js';
import {buildExampleFootings,describeFootings,polygonArea,EXAMPLE_FOOTING_SOURCE} from '../../resources/js/etabs/composables/exampleFootings.js';

const bounds=polygon=>{const xs=polygon.nodes.map(n=>n.x),ys=polygon.nodes.map(n=>n.y);return {x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)};};

test('Safecito quick mode gets one closed footing per column, each containing exactly its own column',()=>{
 const columns=cloneDefaultSafecitoColumns();const before=JSON.stringify(columns);
 const footings=buildExampleFootings(columns);
 assert.equal(footings.length,columns.length);assert.equal(JSON.stringify(columns),before);
 for(const footing of footings){assert.equal(footing.closed,true);assert.equal(footing.source,EXAMPLE_FOOTING_SOURCE);assert.equal(footing.nodes.length,4);assert.ok(polygonArea(footing.nodes)>=0.36);}
 const described=describeFootings(footings,columns);
 described.forEach((footing,index)=>assert.deepEqual(footing.columns,[String(columns[index].column)],footing.name));
});

test('neighbouring footings never overlap and spacing limits the side',()=>{
 const footings=buildExampleFootings(cloneDefaultSafecitoColumns());
 for(let i=0;i<footings.length;i++)for(let j=i+1;j<footings.length;j++){
  const a=bounds(footings[i]),b=bounds(footings[j]);
  const overlap=a.x0<b.x1-1e-9&&b.x0<a.x1-1e-9&&a.y0<b.y1-1e-9&&b.y0<a.y1-1e-9;
  assert.equal(overlap,false,`${footings[i].label} / ${footings[j].label}`);
 }
 const close=buildExampleFootings([{column:'A',x:0,y:0},{column:'B',x:1,y:0}]);
 assert.ok(bounds(close[0]).x1<=bounds(close[1]).x0);
 assert.deepEqual(buildExampleFootings([{column:'C',x:'',y:null}]),[]);
});
