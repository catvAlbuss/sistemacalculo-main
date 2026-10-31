import test from 'node:test';
import assert from 'node:assert/strict';
import {pressureMapTrace} from '../../resources/js/matlab/pressureMap.js';
import {themedPlotLayout,plotColorbar,LIGHT_PLOT_PALETTE} from '../../resources/js/sheets/plotTheme.js';

test('pressure mesh preserves every value and leaves uncomputed cells empty without WebGL',()=>{
  const x=[1,0,1],y=[1,0,0],p=[-15,83,4];
  const trace=pressureMapTrace(x,y,p);
  assert.equal(trace.type,'heatmap');assert.deepEqual(trace.x,[0,1]);assert.deepEqual(trace.y,[0,1]);
  assert.deepEqual(trace.z,[[83,4],[null,-15]]);assert.equal(trace.zsmooth,false);assert.equal(trace.connectgaps,false);
  assert.deepEqual(p,[-15,83,4]);assert.deepEqual(x,[1,0,1]);
  assert.deepEqual(pressureMapTrace([[1],[0],[1]],[[1],[0],[0]],[[0,1,2]]).z,[[1,2],[null,0]]);
  assert.throws(()=>pressureMapTrace([1],[1],[]),/incompletos/);
});

test('light and dark themes cover backgrounds, axes, titles, hover and color scale without changing ranges',()=>{
  const original={title:'Presiones',xaxis:{range:[-6,6],scaleanchor:'y'},yaxis:{range:[-4,8]},font:{size:13}};
  const dark={panel:'#172538',soft:'#132033',text:'#e1eaf6',line:'#2c4058',accent:'#80b5ff'};
  for(const palette of [LIGHT_PLOT_PALETTE,dark]){
    const layout=themedPlotLayout(original,palette);
    assert.equal(layout.paper_bgcolor,palette.panel);assert.equal(layout.plot_bgcolor,palette.panel);
    assert.equal(layout.title.font.color,palette.text);assert.equal(layout.xaxis.tickfont.color,palette.text);
    assert.equal(layout.yaxis.title.font.color,palette.text);assert.equal(layout.hoverlabel.font.color,palette.text);
    assert.deepEqual(layout.xaxis.range,[-6,6]);assert.equal(layout.xaxis.scaleanchor,'y');
    const bar=plotColorbar({title:{text:'Presión'},thickness:18},palette);
    assert.equal(bar.title.font.color,palette.text);assert.equal(bar.tickfont.color,palette.text);assert.equal(bar.thickness,18);
  }
  assert.equal(original.title,'Presiones');assert.deepEqual(original.font,{size:13});
});
