import test from 'node:test';
import assert from 'node:assert/strict';
import {createPolygonRows,FOUNDATION_SAMPLE_PROPERTIES,polygonRows,polygonVector,polygonError,polygonArea} from '../../resources/js/matlab/foundationPolygons.js';

test('all six contours have three valid numeric example vertices; disabled holes stay excluded',()=>{
  const rows=createPolygonRows();const other=createPolygonRows();
  assert.equal(rows.length,3);assert.notEqual(rows,other);
  for(let index=0;index<=5;index++){
    const example=createPolygonRows(index);
    assert.equal(example.length,3);assert.ok(example.every(row=>Number.isFinite(row.xv)&&Number.isFinite(row.yv)));
    assert.equal(polygonError(example,'Ejemplo',true),null);
  }
  assert.deepEqual(polygonRows(rows,false),[]);
  assert.equal(polygonVector(rows,'xv',false),'1:0');assert.equal(polygonVector(rows,'yv',false),'1:0');
  assert.equal(polygonVector(rows,'xv'),'[-6,6,0]');
  assert.equal(polygonError(rows,'Interior',false,false),null);
  assert.equal(polygonError(rows,'Exterior',true),null);
  rows[0].xv=5;rows[0].yv='';
  assert.equal(other[0].xv,-6);assert.match(polygonError(rows,'Interior',false,true),/numéricas/);
});

test('initial area and inertias match the exterior example without enabled openings',()=>{
  const rows=createPolygonRows();let ixx=0,iyy=0;
  for(let index=0;index<rows.length;index++){
    const a=rows[index],b=rows[(index+1)%rows.length],cross=a.xv*b.yv-b.xv*a.yv;
    ixx+=cross*(a.yv*a.yv+a.yv*b.yv+b.yv*b.yv)/12;
    iyy+=cross*(a.xv*a.xv+a.xv*b.xv+b.xv*b.xv)/12;
  }
  assert.equal(polygonArea(rows),FOUNDATION_SAMPLE_PROPERTIES.A);
  assert.equal(ixx,FOUNDATION_SAMPLE_PROPERTIES.Ixx);assert.equal(iyy,FOUNDATION_SAMPLE_PROPERTIES.Iyy);
});

test('real vertices retain their order; empty slots are omitted while partial rows remain invalid',()=>{
  const rows=[{xv:0,yv:0},{xv:9,yv:0},{xv:9,yv:9},{xv:0,yv:9},{xv:'',yv:''}];
  assert.equal(polygonArea(polygonRows(rows)),81);
  assert.equal(polygonError(rows,'Exterior',true),null);
  assert.equal(polygonVector(rows,'xv'),'[0,9,9,0]');assert.equal(polygonVector(rows,'yv'),'[0,0,9,9]');
  assert.match(polygonError([{xv:0,yv:0},{xv:1,yv:1}],'Exterior',true),/3 vértices/);
  assert.match(polygonError([{xv:0,yv:0},{xv:1,yv:1},{xv:2,yv:2}],'Exterior',true),/no forman una figura/);
  assert.match(polygonError([...rows,{xv:5,yv:null}],'Exterior',true),/numéricas/);
  assert.match(polygonError([...rows,{xv:NaN,yv:1}],'Exterior',true),/numéricas/);
});
