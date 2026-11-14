import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {runBrowserFixture,removeTempDir} from './browserFixture.mjs';
import {build} from 'vite';
import vue from '@vitejs/plugin-vue';
const browser='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

test('NovaCad quick mode starts with example footings and capture handles empty, open and closed CAD paths',{skip:!existsSync(browser),timeout:90000},async()=>{
 const entry=resolve('predim2-ui-fixture.js').replaceAll('\\','/');
 const source=`import {createApp,nextTick} from 'vue';import App from './resources/js/etabs/App.vue';
 document.addEventListener('DOMContentLoaded',async()=>{const errors=[];window.addEventListener('error',event=>errors.push(event.message));
 try{window.__cadEntities=[];createApp(App).mount('#app');await nextTick();document.querySelector('.etabs-cimentacion-open').click();for(let i=0;i<4;i++)await nextTick();
 const button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text));
 const check=(ok,message)=>{if(!ok)throw Error(message)};const summary=()=>document.querySelector('.etabs-cimentacion-summary').textContent;
 check(summary().includes('Zapatas: 14'),'quick mode starts with a ready example: '+summary());check(!document.querySelector('.etabs-notice'),'no warning on a fresh example');
 button('Zapatas').click();await nextTick();
 button('Capturar polilíneas').click();await nextTick();check(document.querySelector('.etabs-error')?.textContent.includes('Finaliza el trazado'),'empty path shows guidance');check(summary().includes('Zapatas: 14'),'failed capture keeps the example');
 const nodes=[{x:0,y:0},{x:4,y:0},{x:0,y:3}];window.__cadEntities=[{dxfTypeName:'POLYLINE',numberOfVertices:3,closed:true,getPointAt:i=>nodes[i]}];
 button('Capturar polilíneas').click();for(let i=0;i<3;i++)await nextTick();check(summary().includes('Zapatas: 1'),'native 2D polyline replaces the example: '+summary()+' / '+document.querySelector('.etabs-notice')?.textContent);check(!document.querySelector('.etabs-error'),'capture clears prior error');
 window.__cadEntities=[];button('Capturar polilíneas').click();await nextTick();check(summary().includes('Zapatas: 1'),'existing polygon survives a missing native path');
 button('Limpiar zapatas').click();await nextTick();check(summary().includes('Zapatas: 0'),'clear removes footings');
 window.__cadEntities=[{dxfTypeName:'POLYLINE',numberOfVertices:3,closed:false,getPointAt:i=>nodes[i]}];button('Capturar polilíneas').click();await nextTick();check(document.querySelector('.etabs-error')?.textContent.includes('está abierta'),'open path is not silently closed');
 button('Zapatas de ejemplo').click();for(let i=0;i<3;i++)await nextTick();check(summary().includes('Zapatas: 14'),'example can be restored');check(errors.length===0,errors.join(';'));
 document.querySelector('#result').textContent='PASS';}catch(error){document.querySelector('#result').textContent='FAIL '+error.stack;}});`;
 const result=await build({configFile:false,logLevel:'error',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'predim2-test',enforce:'pre',resolveId(id){if(id.endsWith('predim2-ui-fixture.js'))return entry;if(id==='@mlightcad/cad-viewer')return '\0cad-test';if(id==='@mlightcad/cad-simple-viewer')return '\0cad-manager-test';if(id.endsWith('AgentePredimPanel.vue'))return '\0agent-stub';},load(id){if(id==='\0agent-stub')return 'export default {render:()=>null}';if(id===entry)return source;if(id==='\0cad-test')return `import {h} from 'vue';export const MlCadViewer={render:()=>h('div')}`;if(id==='\0cad-manager-test')return `export const AcEdOpenMode={Write:8};export const acapRunDatabaseEdit=(db,label,fn)=>fn();export const AcApDocManager={instance:{curDocument:{database:{tables:{blockTable:{}}}}}};AcApDocManager.instance.curDocument.database.tables.blockTable.modelSpace={newIterator:()=>({toArray:()=>window.__cadEntities})};`; }},vue()],build:{write:false,minify:true,lib:{entry,formats:['iife'],name:'Predim2Test'}}});
 const output=(Array.isArray(result)?result[0]:result).output;const js=output.find(item=>item.type==='chunk').code;
 const dir=mkdtempSync(join(tmpdir(),'predim2-ui-'));
 try{const file=join(dir,'fixture.html');writeFileSync(join(dir,'fixture.js'),js);writeFileSync(file,'<!doctype html><meta charset="utf-8"><div id="app"></div><pre id="result">WAIT</pre><script>window.addEventListener("error",e=>document.querySelector("#result").textContent="FAIL "+e.message);</script><script src="fixture.js"></script>');
 const status=await runBrowserFixture(browser,file,{profile:join(dir,'profile')});
 assert.equal(status,'PASS',status);
 }finally{removeTempDir(dir)}
});
