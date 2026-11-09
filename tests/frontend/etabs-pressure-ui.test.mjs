import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {runBrowserFixture,removeTempDir} from './browserFixture.mjs';
import {build} from 'vite';
import vue from '@vitejs/plugin-vue';
const browser='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

test('pressure map switches among twelve combinations without WebGL and releases the plot on unmount',{skip:!existsSync(browser),timeout:90000},async()=>{
 const entry=resolve('etabs-pressure-fixture.js').replaceAll('\\','/');
 const source=`import {createApp,h,ref,nextTick} from 'vue';import Results from './resources/js/etabs/components/ResultadosCimentacionInline.vue';import './resources/css/engineering.css';
 document.addEventListener('DOMContentLoaded',async()=>{
 const errors=[];window.addEventListener('error',e=>errors.push(e.message));window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
 let gl=0;const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(/webgl/i.test(type)){gl++;return null}return original.call(this,type,...args)};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));const check=(ok,m)=>{if(!ok)throw Error(m)};
 const until=async(fn,m)=>{for(let i=0;i<60;i++){if(fn())return;await new Promise(resolve=>requestAnimationFrame(resolve))}throw Error(m)};
 try{
 const x=[],y=[],z=[];for(let j=0;j<10;j++)for(let i=0;i<10;i++){x.push(i);y.push(j);z.push(i===4&&j===4?null:i+j)};
 const make=value=>({df:1,gammaE:2,columns:[],normalizedPolygons:[{name:'Z-1',key:'poligono1',XX:x,YY:y,ZZ:Array.from({length:12},(_,c)=>z.map(n=>n===null?null:n+value+c)),min:Array.from({length:12},(_,c)=>value+c),max:Array.from({length:12},(_,c)=>18+value+c),XC:4.5,YC:4.5}],loadCombinations:Array.from({length:12},(_,i)=>({id:i,column1:'Pm',column2:'Mx',column3:'My'})),resultados:{},summary:[],polygonColumnSummary:[]});
 const results=ref(make(0));const app=createApp({setup:()=>()=>h(Results,{results:results.value})});app.mount('#app');await nextTick();
 const plot=document.querySelector('.ci-plot');await until(()=>plot._fullLayout,'first pressure map');await wait(120);
 check(document.querySelectorAll('.ci-plot').length===1,'one pressure map at a time');check(gl===0,'pressure charts requested WebGL');
 check(plot.data[0].type==='heatmap','2D mesh');check(plot.data[0].z[4][4]===null,'hole preserved');const css=getComputedStyle(plot),panel=css.getPropertyValue('--pr-panel').trim(),text=css.getPropertyValue('--pr-text').trim();
 check(plot._fullLayout.paper_bgcolor===panel&&plot._fullLayout.plot_bgcolor===panel,'theme background');check(plot._fullLayout.coloraxis.colorbar.tickfont.color===text,'scale contrast');check(plot._fullLayout.title.font.color===text,'title contrast');
 const raster=plot.querySelector('.heatmaplayer image');check(raster,'pressure image');const img=new Image();img.src=raster.getAttribute('href')||raster.getAttribute('xlink:href');await img.decode();check(img.naturalWidth>0,'decoded pressure image');
 check(document.querySelector('.ci-kpi strong').textContent.includes('29.000'),'governing pressure KPI: '+document.querySelector('.ci-kpi strong').textContent);
 [...document.querySelectorAll('.ci-chip')][11].click();await until(()=>plot._fullLayout?.coloraxis.cmin===11,'selected combination rendered');
 document.querySelector('.ci-link').click();await until(()=>plot._fullLayout?.coloraxis.cmin===11,'critical combination link');
 results.value=make(100);await nextTick();await until(()=>plot._fullLayout?.coloraxis.cmin===111,'latest calculation rendered');check(gl===0,'result replacement requested WebGL');
 app.unmount();await until(()=>!plot._fullLayout,'unmounted graph purged');check(errors.length===0,errors.join(';'));
 document.querySelector('#result').textContent='PASS '+(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
 }catch(e){document.querySelector('#result').textContent='FAIL '+e.stack;}
 });`;
 const result=await build({configFile:false,logLevel:'error',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'etabs-pressure',enforce:'pre',resolveId:id=>id.endsWith('etabs-pressure-fixture.js')?entry:undefined,load:id=>id===entry?source:undefined},vue()],build:{write:false,minify:true,lib:{entry,formats:['iife'],name:'EtabsPressure'}}});
 const out=(Array.isArray(result)?result[0]:result).output,js=out.find(x=>x.type==='chunk').code,css=out.filter(x=>x.type==='asset'&&x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
 const dir=mkdtempSync(join(tmpdir(),'etabs-pressure-'));
 try{
 writeFileSync(join(dir,'fixture.js'),js);writeFileSync(join(dir,'fixture.css'),css);const file=join(dir,'fixture.html');writeFileSync(file,'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="fixture.css"><div id="app"></div><pre id="result">WAIT</pre><script src="fixture.js"></script>');
 for(const dark of [false,true]){
  const status=await runBrowserFixture(browser,file,{profile:join(dir,dark?'dark':'light'),theme:dark?'dark':'light'});
  assert.equal(status,'PASS '+(dark?'dark':'light'));

 }
 }finally{removeTempDir(dir)}
});
