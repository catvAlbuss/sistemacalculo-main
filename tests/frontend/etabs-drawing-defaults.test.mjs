import test from 'node:test';
import assert from 'node:assert/strict';
import {AcDbDatabase,AcDbLine,AcDbLayerTableRecord,AcDbLinetypeTableRecord} from '@mlightcad/data-model';
import {AcCmEventManager,AcCmColor} from '@mlightcad/common';
import {ensureCadDrawingDefaults,installCadDrawingDefaults} from '../../resources/js/etabs/cadDrawingDefaults.js';
const names=table=>table.newIterator().toArray().map(record=>record.name);

test('new CAD database receives layer 0 and resolves the color of a newly drawn line',()=>{
 const db=new AcDbDatabase();assert.equal(db.tables.layerTable.has('0'),false);
 ensureCadDrawingDefaults(db);
 assert.equal(db.tables.layerTable.has('0'),true);assert.deepEqual(names(db.tables.linetypeTable),['ByBlock','ByLayer','Continuous']);assert.ok(db.objects.layout.getAt('Model'));
 const line=new AcDbLine({x:0,y:0,z:0},{x:4,y:2,z:0});db.tables.blockTable.modelSpace.appendEntity(line);
 const previous=console.error,errors=[];console.error=(...args)=>errors.push(args);
 try{assert.equal(line.getLayerColor().colorIndex,7);}finally{console.error=previous;}
 assert.equal(errors.length,0);
});
test('existing layers, color, current layer, layouts and model entities survive repeated setup',()=>{
 const db=new AcDbDatabase();db.createDefaultData();const zero=db.tables.layerTable.getAt('0');const color=new AcCmColor();color.colorIndex=2;zero.color=color;
 const custom=new AcDbLayerTableRecord({name:'ESTRUCTURA',color});db.tables.layerTable.add(custom);db.clayer='ESTRUCTURA';
 const line=new AcDbLine({x:0,y:0,z:0},{x:4,y:2,z:0});line.layer='ESTRUCTURA';db.tables.blockTable.modelSpace.appendEntity(line);
 const layout=db.objects.layout.getAt('Model');const records=names(db.tables.layerTable);
 ensureCadDrawingDefaults(db);ensureCadDrawingDefaults(db);
 assert.equal(db.tables.layerTable.getAt('0'),zero);assert.equal(zero.color.colorIndex,2);assert.equal(db.tables.layerTable.getAt('ESTRUCTURA'),custom);assert.equal(db.clayer,'ESTRUCTURA');assert.equal(db.objects.layout.getAt('Model'),layout);
 assert.deepEqual(names(db.tables.layerTable),records);assert.equal(db.tables.blockTable.modelSpace.newIterator().toArray()[0],line);
});
test('repairs partial drawings without replacing an imported linetype',()=>{
 const db=new AcDbDatabase();const existing=new AcDbLinetypeTableRecord({name:'ByLayer',description:'Imported'});db.tables.linetypeTable.add(existing);db.clayer='MISSING';
 ensureCadDrawingDefaults(db);assert.equal(db.tables.linetypeTable.getAt('ByLayer'),existing);assert.equal(db.tables.linetypeTable.numEntries,3);assert.equal(db.clayer,'0');
});
test('each document is initialized and lifecycle subscriptions are installed once and removable',()=>{
 const events=Object.fromEntries(['documentCreated','documentToBeActivated','documentActivated'].map(name=>[name,new AcCmEventManager()]));
 const manager={curDocument:{database:new AcDbDatabase()},events};const dispose=installCadDrawingDefaults(manager);
 assert.equal(manager.curDocument.database.tables.layerTable.has('0'),true);assert.equal(installCadDrawingDefaults(manager),dispose);
 for(const event of Object.values(events))assert.equal(event.listenerCount,1);
 for(const event of Object.values(events)){const doc={database:new AcDbDatabase()};event.dispatch({doc});assert.equal(doc.database.tables.layerTable.has('0'),true);}
 dispose();for(const event of Object.values(events))assert.equal(event.listenerCount,0);
});
