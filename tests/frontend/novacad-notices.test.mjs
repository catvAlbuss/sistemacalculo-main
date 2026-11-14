import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {buildThirdPartyNotices,packageRootForModule} from '../../scripts/novacad-third-party-notices.mjs';
import {installNovaCadLabels,NOVACAD_LABELS} from '../../resources/js/etabs/product/labels.js';

test('notices retain the exact MIT copyright/permission text and identify the installed GPL DWG reader',()=>{
 const roots=['node_modules/@mlightcad/cad-viewer','node_modules/@mlightcad/cad-simple-viewer','node_modules/@mlightcad/libredwg-converter','node_modules/@mlightcad/libredwg-web'];
 const {assets,inventory}=buildThirdPartyNotices([...roots,roots[0]+'/']);
 assert.equal(inventory.packages.length,4);assert.match(assets.get('licenses/THIRD-PARTY-NOTICES.txt'),/Copyright \(c\) 2026 mlightcad/);
 const viewer=inventory.packages.find(p=>p.name==='@mlightcad/cad-viewer');assert.equal(viewer.license,'MIT');assert.equal(assets.get(viewer.files[0].url.replace('/build/','')),readFileSync(roots[0]+'/LICENSE','utf8'));
 for(const p of inventory.packages.filter(p=>p.name.includes('libredwg'))){assert.match(p.license,/GPL-3.0/);assert.equal(p.reviewRequired,true);assert.ok(p.files.length);}
 assert.match(inventory.legalStatus,/no constituye una certificación/);
});
test('the notice generator handles nested/scoped dependencies and flags packages without notices',()=>{
 assert.equal(packageRootForModule('C:\\app\\node_modules\\parent\\node_modules\\@scope\\child\\dist\\index.js?x'),'C:/app/node_modules/parent/node_modules/@scope/child');
 assert.equal(packageRootForModule('C:/app/resources/js/app.js'),null);
 const dir=mkdtempSync(join(tmpdir(),'novacad-notices-'));
 try{const pkg=join(dir,'package');mkdirSync(pkg);writeFileSync(join(pkg,'package.json'),JSON.stringify({name:'example',version:'1.0',license:'MIT'}));const result=buildThirdPartyNotices([pkg]);assert.equal(result.inventory.packages[0].missingPackageNotices,true);assert.equal(result.inventory.packages[0].reviewRequired,true);}finally{rmSync(dir,{recursive:true,force:true})}
});
test('product labels change only the menu vocabulary, retaining engine commands and provider attribution',()=>{
 const calls=[];installNovaCadLabels({i18n:{global:{mergeLocaleMessage:(...args)=>calls.push(args)}},AcApI18n:{mergeLocaleMessage:(...args)=>calls.push(args)}});
 assert.equal(calls.length,2);assert.equal(NOVACAD_LABELS.main.ribbon.tab.home,'Trazado');assert.equal(NOVACAD_LABELS.main.mainMenu.about,'Acerca de NovaCad');assert.equal('about' in NOVACAD_LABELS.main,false);assert.equal('keywords' in NOVACAD_LABELS.main,false);
});

test('source headers are preserved verbatim without treating partial notices as a complete license',()=>{
 const {assets,inventory}=buildThirdPartyNotices(['node_modules/seedrandom','node_modules/javascript-natural-sort']);
 const text=assets.get('licenses/THIRD-PARTY-NOTICES.txt');
 assert.match(text,/Copyright 2019 David Bau/);assert.match(text,/Permission is hereby granted, free of charge/);assert.match(text,/Author: Jim Palmer/);
 assert.ok(inventory.packages.every(p=>p.reviewRequired&&p.missingPackageNotices&&p.files.length>0));
});
