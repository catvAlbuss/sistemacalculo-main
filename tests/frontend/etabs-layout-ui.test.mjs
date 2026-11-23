import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {build} from 'vite';
import vue from '@vitejs/plugin-vue';
import {runBrowserFixture,removeTempDir} from './browserFixture.mjs';
const browser='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

test('NovaCad preserves the native CAD interface and panels while adapting colors to both themes and viewport sizes',{skip:!existsSync(browser),timeout:90000},async()=>{
 const entry=resolve('etabs-layout-fixture.js').replaceAll('\\','/');
 const source=`import {createApp,nextTick} from 'vue';import App from './resources/js/etabs/App.vue';import './resources/css/engineering.css';import './node_modules/@mlightcad/cad-viewer/dist/cad-viewer.css';
 document.addEventListener('DOMContentLoaded',async()=>{
 const errors=[];window.addEventListener('error',e=>errors.push(e.message));window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
 const frame=()=>new Promise(r=>requestAnimationFrame(r));const settle=async()=>{await nextTick();for(let i=0;i<5;i++)await frame()};const check=(ok,m)=>{if(!ok)throw Error(m)};
 const box=s=>document.querySelector(s).getBoundingClientRect();const within=(a,b)=>a.left>=b.left-1&&a.top>=b.top-1&&a.right<=b.right+1&&a.bottom<=b.bottom+1;
 try{
 const app=createApp(App);app.mount('#cad-viewer-app');await settle();
 const nav=box('.engineering-app-nav');check(box('.etabs-cad-app').top>=nav.bottom-1,'navigation is outside the workspace');
 const verify=()=>{const surface=box('.etabs-drawing-surface'),plane=box('.ml-cad-main'),overlay=box('.foundation-overlay');check(within(box('.ml-cad-viewer-container'),surface),'fixed SDK viewer escaped its frame');check(within(overlay,plane),'drawing overlay escaped the plane');check(overlay.width>10&&overlay.height>10,'drawing plane has a usable size');check(document.documentElement.scrollWidth<=innerWidth,'horizontal overflow');check(document.documentElement.scrollHeight<=innerHeight+1,'page scroll overflow');};
 verify();check(getComputedStyle(document.querySelector('.foundation-overlay')).visibility==='hidden','closed module leaves the CAD clean');
 const plane=()=>box('.ml-cad-main');check(within(box('.etabs-cimentacion-open'),plane()),'original fallback stays in the drawing plane');
 check(!document.querySelector('.nc-toolbar'),'no replacement toolbar');check(getComputedStyle(document.querySelector('.ml-cad-header')).display!=='none','native ribbon remains visible');
 document.querySelector('.native-draw-line').click();await settle();check(window.__nativeClicks===1,'native buttons keep their handler');
 const rgb=c=>c.match(/[0-9.]+/g).slice(0,3).map(Number),lum=c=>rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
 const header=document.querySelector('.ml-ribbon__header'),color=getComputedStyle(header).color,bg=getComputedStyle(header).backgroundColor;
 check((Math.max(lum(color),lum(bg))+.05)/(Math.min(lum(color),lum(bg))+.05)>=4.5,'native header contrast');
 document.querySelector('.etabs-cimentacion-open').click();await settle();verify();
 check(within(box('.etabs-cimentacion-dock'),plane()),'floating panel stays inside the drawing plane');check(box('.etabs-cimentacion-dock').top>=box('.ml-cad-header').bottom-1,'panel never covers the CAD ribbon');
 check(getComputedStyle(document.querySelector('.foundation-overlay')).pointerEvents==='none','opening the menu hijacks native CAD clicks');
 const summary=()=>document.querySelector('.etabs-cimentacion-summary').textContent;check(summary().includes('Zapatas: 14'),'quick example ready: '+summary());
 [...document.querySelectorAll('[role=tab]')].find(b=>b.textContent.includes('Zapatas')).click();await settle();
 [...document.querySelectorAll('.dg-tool')].find(b=>b.textContent.includes('Dibujar')).click();await settle();
 const canvas=document.querySelector('.foundation-overlay');check(getComputedStyle(canvas).pointerEvents==='auto','auxiliary draw mode');check(Math.abs(canvas.width-canvas.getBoundingClientRect().width*devicePixelRatio)<=1,'retina canvas sizing');
 const r=canvas.getBoundingClientRect();const click=(x,y)=>{canvas.dispatchEvent(new MouseEvent('mousedown',{clientX:r.left+r.width*x,clientY:r.top+r.height*y,buttons:1}));canvas.dispatchEvent(new MouseEvent('mouseup',{clientX:r.left+r.width*x,clientY:r.top+r.height*y}));};
 click(.62,.3);click(.9,.3);click(.75,.6);click(.62,.3);await settle();check(summary().includes('Zapatas: 15'),'auxiliary polygon can still be drawn: '+summary());
 document.querySelector('.etabs-native-mode').click();await settle();check(getComputedStyle(canvas).pointerEvents==='none','native CAD mode restored');
 [...document.querySelectorAll('.etabs-icon-btn')].find(b=>b.getAttribute('aria-label')==='Minimizar panel').click();await settle();check(box('.etabs-cimentacion-dock').height<90,'minimized panel collapses to its header');
 check(!document.querySelector('.etabs-cimentacion-open'),'fallback hides while panel is open');[...document.querySelectorAll('.etabs-icon-btn')].find(b=>b.getAttribute('aria-label')==='Expandir panel').click();await settle();check(box('.etabs-cimentacion-dock').height>200,'minimized panel expands again');
 document.querySelector('.etabs-cimentacion-close').click();await settle();verify();check(document.querySelector('.etabs-cimentacion-open'),'closing restores the module button');check(window.__viewerMounts===1,'panel changes remounted the CAD renderer');
 window.__results.value={normalizedPolygons:[],loadCombinations:[]};await settle();document.querySelector('.etabs-results-open').click();await settle();
 const dialog=box('.em-dialog');check(dialog.left>=0&&dialog.right<=innerWidth+1&&dialog.top>=0&&dialog.bottom<=innerHeight+1,'results modal fits the viewport');verify();
 window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));await settle();check(!document.querySelector('.em-dialog'),'Esc closes the results modal');
 window.dispatchEvent(new CustomEvent('novacad:about'));await settle();check(document.querySelector('.em-dialog')?.textContent.includes('Acerca de NovaCad'),'product About action');check(document.querySelector('.nc-about-attribution')?.textContent.includes('terceros'),'third party authorship retained');document.querySelector('.em-close').click();await settle();check(!document.querySelector('.em-dialog'),'product About closes');check(errors.length===0,errors.join(';'));window.__initialPanel=getComputedStyle(document.querySelector('.ml-ribbon__header')).backgroundColor;window.__finish=async()=>{app.unmount();await settle();check(errors.length===0,errors.join(';'));document.querySelector('#result').textContent='PASS'};document.querySelector('#result').textContent='READY';
 }catch(error){document.querySelector('#result').textContent='FAIL '+error.stack;}
 });`;
 const plugin={name:'etabs-layout',enforce:'pre',resolveId(id){if(id.endsWith('etabs-layout-fixture.js'))return entry;if(id==='@mlightcad/cad-viewer')return '\0layout-cad';if(id==='@mlightcad/cad-simple-viewer')return '\0layout-manager';if(id.endsWith('ResultadosCimentacionInline.vue'))return '\0layout-results';if(id.endsWith('composables/useZapatas2.js'))return '\0layout-calculation';},load(id){
 if(id===entry)return source;
 if(id==='\0layout-cad')return `import {h,onMounted} from 'vue';export const MlCadViewer={props:['theme'],setup(props){onMounted(()=>window.__viewerMounts=(window.__viewerMounts||0)+1);return()=>h('div',{class:['ml-cad-viewer-container',props.theme==='dark'?'ml-theme-dark':'ml-theme-light'],'data-engine-theme':props.theme},[h('div',{class:'ml-cad-layout',style:{'--ml-header-height':'132px','--ml-status-bar-height':'30px'}},[h('header',{class:'ml-cad-header'},[h('div',{class:'ml-ribbon__header'},'Archivo / Inicio / Insertar'),h('main',{class:'ml-ribbon__panel'},[h('button',{class:'ml-ribbon-item-host native-draw-line',onClick:()=>{window.__nativeClicks=(window.__nativeClicks||0)+1}},'Linea')])]),h('div',{class:'ml-cad-main'}),h('footer',{class:'ml-cad-footer'},'Status')])])}};`;
 if(id==='\0layout-manager')return `export const AcEdOpenMode={Write:8};export const acapRunDatabaseEdit=(db,label,fn)=>fn();export const AcApDocManager={instance:{curDocument:null}};`;
 if(id==='\0layout-results')return `import {h} from 'vue';export default {render:()=>h('div',{style:{height:'300px'}},'Results')};`;
 if(id==='\0layout-calculation')return `import {ref} from 'vue';export function useZapatas2(){const results=ref(null);window.__results=results;return {loading:ref(false),error:ref(null),results,calculateZapatas2:async()=>{},clearResults:()=>{results.value=null}}}`;
 }};
 const built=await build({configFile:false,logLevel:'error',define:{'process.env.NODE_ENV':'"production"'},plugins:[plugin,vue()],build:{write:false,minify:true,lib:{entry,formats:['iife'],name:'EtabsLayout'}}});
 const output=(Array.isArray(built)?built[0]:built).output,js=output.find(x=>x.type==='chunk').code,css=output.filter(x=>x.type==='asset'&&x.fileName.endsWith('.css')).map(x=>x.source).join('\n');
 const dir=mkdtempSync(join(tmpdir(),'etabs-layout-'));
 try{
 writeFileSync(join(dir,'fixture.js'),js);writeFileSync(join(dir,'fixture.css'),css);const file=join(dir,'fixture.html');writeFileSync(file,'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="fixture.css"><style>body{margin:0;display:flex;flex-direction:column}.engineering-app-nav{height:72px;flex-shrink:0;z-index:50}body>main{flex:1;min-height:0}</style><body><nav class="engineering-app-nav">Navigation</nav><main><div id="cad-viewer-app"></div></main><pre id="result" style="display:none">WAIT</pre><script src="fixture.js"></script>');
 for(const theme of ['light','dark'])for(const [width,dpr] of [[1480,1],[390,1],[1480,2],[390,2]]){const status=await runBrowserFixture(browser,file,{profile:join(dir,theme+width+'-'+dpr),width,height:900,dpr,theme,interact:async send=>{const next=theme==='dark'?'light':'dark';await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:next}]});const changed=await send('Runtime.evaluate',{expression:'new Promise(r=>setTimeout(()=>r({theme:document.querySelector(".novacad-workspace").dataset.theme,engine:document.querySelector("[data-engine-theme]").dataset.engineTheme,mounts:window.__viewerMounts,changed:window.__initialPanel!==getComputedStyle(document.querySelector(".ml-ribbon__header")).backgroundColor}),150))',awaitPromise:true,returnByValue:true});assert.deepEqual(changed.result.value,{theme:next,engine:next,mounts:1,changed:true});await send('Runtime.evaluate',{expression:'window.__finish()',awaitPromise:true});}});assert.equal(status,'PASS',theme+' '+width+'px DPR '+dpr+': '+status);}
 }finally{removeTempDir(dir)}
});
