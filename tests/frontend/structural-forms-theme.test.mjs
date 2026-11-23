import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdtempSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {runBrowserFixture,removeTempDir} from './browserFixture.mjs';
const browser='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

test('structural forms, panels and table hover remain legible in both system themes',{skip:!existsSync(browser),timeout:120000},async()=>{
 const markup=execFileSync('php',['-r',`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); echo Illuminate\\Support\\Facades\\Blade::render('<div class="structural-workspace"><div class="structural-properties"><x-cad.ui.panel title="Items" init=""><ul><li class="material-item rounded-md px-2 py-1 hover:bg-gray-300">Material 1 E: 210 A: 4000</li></ul></x-cad.ui.panel><x-cad.ui.panel-properties title="Propiedades"><x-cad.ui.input-properties label="Área (cm²)" bind="area" handleInput="" /><x-cad.ui.select-properties label="Material" bind="material"><option>Concreto</option><option>Acero</option></x-cad.ui.select-properties><x-cad.ui.input-properties label="Calculado" bind="area" handleInput="" disabled="true" /></x-cad.ui.panel-properties></div><section class="form-modal bg-gray-800 text-white p-3"><h2 class="text-white">Combinaciones de carga</h2><label class="text-gray-400" for="combo">Nombre</label><input id="combo" class="bg-gray-700 text-white border border-gray-600" placeholder="COMB1"><label for="readonly">Resultado</label><input id="readonly" readonly value="12.5"><label for="notes">Descripción</label><textarea id="notes" placeholder="Comentario"></textarea><label for="check"><input id="check" type="checkbox" class="accent-blue-500"> Incluir peso propio</label><label for="radio"><input id="radio" type="radio" name="kind" checked> Servicio</label><button class="bg-blue-600 text-white p-2">Guardar</button><button class="cancel-button bg-gray-600 hover:bg-gray-500 text-white p-2">Cancelar</button><button class="close-button text-gray-400 hover:bg-red-600">Cerrar</button><button class="bg-sky-600 hover:bg-sky-500 text-white">Exportar</button><p class="text-red-400 bg-red-900/40">Revisa el valor ingresado</p><p class="text-amber-300 bg-amber-500/15">Revisa las unidades</p><p class="text-emerald-300 bg-emerald-950/30">Guardado</p><button class="bg-emerald-600 text-white">Aplicar</button><label for="checked-disabled"><input id="checked-disabled" type="checkbox" checked disabled> Asignado</label><table class="w-full text-sm"><thead class="bg-gray-800"><tr><th>Patrón</th><th>Factor</th></tr></thead><tbody><tr class="hover:bg-gray-800 text-gray-300"><td>Muerta</td><td>1.4</td></tr><tr class="bg-blue-900 text-white"><td>Viva</td><td>1.7</td></tr></tbody></table></section></div>');`],{encoding:'utf8',maxBuffer:8*1024*1024});
 const dir=mkdtempSync(join(tmpdir(),'structural-forms-'));
 const manifest=JSON.parse(readFileSync('public/build/manifest.json','utf8'));
 try{
 writeFileSync(join(dir,'style.css'),readFileSync('public/build/'+manifest['resources/css/app.css'].file,'utf8')+'\n'+readFileSync('resources/css/structural-workspace.css','utf8'));
 writeFileSync(join(dir,'index.html'),`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="style.css"><style>body{margin:0}.structural-workspace{padding:12px}.form-modal{display:grid;gap:8px}#result{position:fixed;bottom:0;pointer-events:none}*{transition:none!important}</style><body>${markup}<div class="structural-ribbon-popup"><label for="popup-check"><input id="popup-check" type="checkbox"> Mostrar fuerzas</label><label for="popup-value">Escala</label><input id="popup-value" value="100"></div><pre id="result"></pre><script>
 const check=(v,m)=>{if(!v)throw Error(m)};
 const rgb=c=>c.match(/[\\d.]+/g).map(Number);const lum=c=>rgb(c).slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 const background=e=>{while(e){const c=getComputedStyle(e).backgroundColor;if(!c.startsWith('rgba')||rgb(c)[3]>0)return c;e=e.parentElement}return 'rgb(255,255,255)'};
 window.audit=(selector)=>{for(const el of document.querySelectorAll(selector)){const s=getComputedStyle(el);check(contrast(s.color,background(el))>=4.5,'contrast '+el.tagName+'.'+el.className+' '+s.color+' / '+background(el));}};
 requestAnimationFrame(()=>{try{
 audit('.cad-panel-title,.material-item,label,.form-modal h2,.form-modal p,input:not([type=checkbox]):not([type=radio]),select,textarea,th,td,.form-modal button');
 const panel=document.querySelector('.cad-panel-body'),theme=matchMedia('(prefers-color-scheme:dark)').matches;
 check((lum(background(panel))<.1)===theme,'panel does not follow system theme');
 for(const e of document.querySelectorAll('.cad-property-field input,.cad-property-field select')){const label=e.closest('.cad-property-field').querySelector('label');check(label.htmlFor===e.id&&e.id,'label association');check(e.getBoundingClientRect().right<=innerWidth,'field overflow');}
 const ids=[...document.querySelectorAll('input,select,textarea')].map(e=>e.id);check(new Set(ids).size===ids.length,'duplicate field ids');
 const input=document.querySelector('#combo');input.focus();check(parseFloat(getComputedStyle(input).outlineWidth)>=2,'missing focus');check(contrast(getComputedStyle(input,'::placeholder').color,background(input))>=4.5,'placeholder contrast');check(contrast(getComputedStyle(input).borderTopColor,background(input))>=3,'control border contrast');
 const checkbox=document.querySelector('#check'),before=getComputedStyle(checkbox).backgroundColor;document.querySelector('label[for=check]').click();check(checkbox.checked,'label did not check');check(getComputedStyle(checkbox).backgroundColor!==before,'checked state invisible');
 check(getComputedStyle(document.querySelector('#readonly')).backgroundColor!==getComputedStyle(input).backgroundColor,'readonly looks editable');check(contrast('rgb(255,255,255)',background(document.querySelector('#checked-disabled')))>=4.5,'disabled check mark contrast');const field=document.querySelector('.cad-property-field input:disabled');check(getComputedStyle(field).backgroundColor!==getComputedStyle(input).backgroundColor,'disabled looks editable');
 const popupInput=document.querySelector('#popup-value');check((lum(background(popupInput))<.1)===theme,'teleported control theme');document.querySelector('label[for=popup-check]').click();check(document.querySelector('#popup-check').checked,'teleported checkbox label');document.querySelector('#result').textContent='READY';
 }catch(e){document.querySelector('#result').textContent='FAIL '+e.message}});
 </script>`);
 const interact=async send=>{
  for(const selector of ['.material-item','tbody tr:first-child','.cancel-button','.close-button']){
   const rect=await send('Runtime.evaluate',{expression:'(()=>{const e=document.querySelector('+JSON.stringify(selector)+');e.scrollIntoView({block:"center"});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()',returnByValue:true});
   await send('Input.dispatchMouseEvent',{type:'mouseMoved',...rect.result.value});
   const audit=await send('Runtime.evaluate',{expression:'(()=>{try{window.audit('+JSON.stringify(selector==='tbody tr:first-child'?selector+' td':selector)+');return "PASS"}catch(e){return e.message}})()',returnByValue:true});
   assert.equal(audit.result.value,'PASS',selector+' hover');
  }
  await send('Runtime.evaluate',{expression:'document.querySelector("#result").textContent="PASS"'});
 };
 for(const theme of ['light','dark'])for(const width of [320,1440])assert.equal(await runBrowserFixture(browser,join(dir,'index.html'),{theme,width,height:1000,profile:join(dir,theme+width),interact}),'PASS',theme+' '+width);
 }finally{removeTempDir(dir)}
});
