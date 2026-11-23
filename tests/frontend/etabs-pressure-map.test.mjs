import test from 'node:test';
import assert from 'node:assert/strict';
import {buildZapatas2PlotData} from '../../resources/js/etabs/charts/zapatas2PlotData.js';
const polygon=(offset=0)=>({name:'Zapata',XX:[0,1,0,1],YY:[0,0,1,1],ZZ:[[1+offset,null,3+offset,4+offset],[5,5,5,5]],min:[1+offset,5],max:[4+offset,5],XC:.5,YC:.5});
const results={normalizedPolygons:[polygon(),polygon(10)],columns:[{column:'C1',x:0,y:0}],loadCombinations:[{column1:'Pm',column2:'Mx',column3:'My'},{column1:'Pm',column2:'Mx',column3:'My'}]};

test('all footings use 2D heatmaps, preserve pressure values and holes, and share an exact color range',()=>{
 const before=JSON.stringify(results);const {data,layout}=buildZapatas2PlotData(results,0);const maps=data.filter(t=>t.type==='heatmap');
 assert.equal(maps.length,2);assert.deepEqual(maps[0].z,[[1,null],[3,4]]);assert.deepEqual(maps[1].z,[[11,null],[13,14]]);assert.equal(layout.coloraxis.cmin,1);assert.equal(layout.coloraxis.cmax,14);
 assert.equal(data.some(t=>/gl|surface|3d/.test(t.type)),false);assert.equal(JSON.stringify(results),before);
});
test('constant pressures retain a common finite scale and both themes cover titles, annotations, columns and legend',()=>{
 for(const palette of [{panel:'#fff',soft:'#f8fafc',text:'#172b43',line:'#dce4ee',accent:'#1959b8'},{panel:'#172538',soft:'#132033',text:'#e1eaf6',line:'#2c4058',accent:'#80b5ff'}]){
  const {data,layout}=buildZapatas2PlotData(results,1,{palette});assert.ok(layout.coloraxis.cmin<5&&layout.coloraxis.cmax>5);
  assert.equal(layout.paper_bgcolor,palette.panel);assert.equal(layout.plot_bgcolor,palette.panel);assert.equal(layout.title.font.color,palette.text);assert.equal(layout.coloraxis.colorbar.title.font.color,palette.text);assert.equal(layout.annotations[0].font.color,palette.text);
  assert.equal(data.find(t=>t.name==='Col. C1').textfont.color,palette.text);
 }
});
test('large pressure meshes are not downsampled and extreme values are retained',()=>{
 const count=6000;const large={...polygon(),XX:Array.from({length:count},(_,i)=>i),YY:Array(count).fill(0),ZZ:[Array.from({length:count},(_,i)=>i===count-1?-123:i)],min:[-123],max:[count-2]};
 const plot=buildZapatas2PlotData({...results,normalizedPolygons:[large]},0,{pointLimit:10});assert.equal(plot.data[0].z[0].length,count);assert.equal(plot.layout.coloraxis.cmin,-123);assert.equal(plot.layout.coloraxis.cmax,count-2);
});
