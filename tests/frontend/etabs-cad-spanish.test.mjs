import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import jig from '../../node_modules/@mlightcad/cad-simple-viewer/lib/i18n/en/jig.js';
import command from '../../node_modules/@mlightcad/cad-simple-viewer/lib/i18n/en/command.js';
import main from '../../node_modules/@mlightcad/cad-simple-viewer/lib/i18n/en/main.js';
import {translateCadMessages} from '../../resources/js/etabs/locale/spanishCad.js';

const dictionary=JSON.parse(readFileSync(new URL('../../resources/js/etabs/locale/cadViewerEs.json',import.meta.url),'utf8'));
const leaves=(node,key='',out=[])=>{if(typeof node==='string')out.push([key,node]);else if(node&&typeof node==='object')for(const [k,v] of Object.entries(node))leaves(v,k,out);return out;};

test('command-line keywords keep their global names so typed shortcuts still work',()=>{
 const es=translateCadMessages({jig});
 assert.equal(es.jig.arc.keywords.end.global,'End');assert.equal(es.jig.arc.keywords.end.display,'Fin(E)');assert.equal(es.jig.arc.keywords.end.local,'Fin');
 assert.equal(es.jig.arc.startPointOrCenter,'Precisa el punto inicial del arco o');
 for(const [key,value] of leaves(es))if(key==='global')assert.match(value,/^[\x20-\x7e]+$/,'global keyword stays ASCII: '+value);
});

test('every core prompt, command description and status text has a Spanish translation',()=>{
 const missing=leaves({jig,command,main}).filter(([key,value])=>key!=='global'&&/[a-z]{3}/i.test(value)&&!(value in dictionary));
 assert.deepEqual(missing.map(([,value])=>value),[]);
});

test('translations keep interpolation placeholders and plural branches intact',()=>{
 for(const [en,es] of Object.entries(dictionary)){
  const tokens=text=>(text.match(/\{\w+\}/g)||[]).sort().join();
  assert.equal(tokens(es),tokens(en),en);assert.equal(es.split('|').length,en.split('|').length,en);
 }
 assert.deepEqual(translateCadMessages({a:['Cancel',{global:'Cancel'}]}),{a:['Cancelar',{global:'Cancel'}]});
 assert.deepEqual(translateCadMessages({a:'constructor',b:'toString'}),{a:'constructor',b:'toString'},'prototype names are not translations');
});
