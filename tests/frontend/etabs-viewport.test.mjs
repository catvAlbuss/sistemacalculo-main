import test from 'node:test';
import assert from 'node:assert/strict';
import {overlayFrame,fitViewport,isCanvasPoint} from '../../resources/js/etabs/composables/viewportGeometry.js';

test('drawing frame excludes the real CAD ribbon and footer and stays inside its host',()=>{
 const host={left:440,top:120,right:1440,bottom:900};
 assert.deepEqual(overlayFrame(host,{left:440,top:284,right:1440,bottom:870}),{left:0,top:164,width:1000,height:586});
 assert.deepEqual(overlayFrame(host,{left:400,top:90,right:1500,bottom:1000}),{left:0,top:0,width:1000,height:780});
});
test('fit stays inside the available plane at normal and retina resolution without changing coordinates',()=>{
 const points=[{x:0,y:0},{x:4.8,y:14.13},{x:6.72,y:0}],before=JSON.stringify(points);
 for(const dpr of [1,2]){
  const width=390*dpr,height=280*dpr,view=fitViewport(points,width,height);
  for(const p of points){const screen={x:width/2+(p.x-view.centerX)*view.scale,y:height/2-(p.y-view.centerY)*view.scale};assert.equal(isCanvasPoint(screen,width,height),true);}
 }
 assert.equal(JSON.stringify(points),before);assert.equal(fitViewport([],390,280),null);
 assert.equal(isCanvasPoint({x:30,y:-1},390,280),false);
});
