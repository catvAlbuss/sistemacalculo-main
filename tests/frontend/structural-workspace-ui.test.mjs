import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync,mkdtempSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {build} from 'vite';
import {runBrowserFixture,removeTempDir} from './browserFixture.mjs';

const browser='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
test('structural controls retain contrast and remain reachable in both themes and narrow viewports', {skip:!existsSync(browser),timeout:90000},async()=>{
 const markup=execFileSync('php',['-r',`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); echo Illuminate\\Support\\Facades\\Blade::render('<div class="structural-workspace cad-bg cad-text-color"><div class="cad-toolbar-scroll structural-ribbon">'.str_repeat('<x-cad.ui.ribbon-group title="Estructura"><x-cad.ui.ribbon-button clickHandler="noop()" toggle="false" label="Materiales"><x-cad.svg.material /></x-cad.ui.ribbon-button><x-cad.ui.ribbon-button clickHandler="noop()" toggle="true" label="Arco"><x-cad.svg.arco /></x-cad.ui.ribbon-button><x-cad.ui.ribbon-button-subitem clickHandler="noop()" toggle="false" label="Deflexión"><x-slot name="slot1"><x-cad.svg.deflection /></x-slot><x-slot name="slot2">Escala</x-slot></x-cad.ui.ribbon-button-subitem></x-cad.ui.ribbon-group>',8).'</div><aside class="structural-tools"><button class="text-gray-200">Columna</button><button disabled>Deshabilitado</button></aside><div class="structural-view-controls"><x-cad.ui.ribbon-button clickHandler="noop()" toggle="false" label="Animar"><x-cad.svg.force /></x-cad.ui.ribbon-button></div></div>');`],{cwd:resolve('.'),encoding:'utf8',maxBuffer:8*1024*1024});
 const manifest=JSON.parse(readFileSync('public/build/manifest.json','utf8'));
 const base=readFileSync('public/build/'+manifest['resources/css/app.css'].file,'utf8');
 const cssPath='resources/css/structural-workspace.css';
 const css=existsSync(cssPath)?readFileSync(cssPath,'utf8'):'';
 const alpineBuild=await build({configFile:false,logLevel:'silent',plugins:[{name:'alpine-fixture',resolveId:id=>id==='structural-alpine-fixture'?id:null,load:id=>id==='structural-alpine-fixture'?"import Alpine from 'alpinejs';window.Alpine=Alpine;":null}],build:{write:false,minify:true,rollupOptions:{input:'structural-alpine-fixture',output:{format:'iife',name:'AlpineFixture'}}}});
 const alpine=alpineBuild.output.find(f=>f.type==='chunk'&&f.isEntry).code;
 const dir=mkdtempSync(join(tmpdir(),'structural-controls-'));
 try{
 writeFileSync(join(dir,'alpine.js'),alpine);
 writeFileSync(join(dir,'style.css'),base+'\n'+css);
 writeFileSync(join(dir,'index.html'),`<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="style.css"><body x-data="{calls:0,noop(){this.calls++}}">${markup}<pre id="result"></pre><script src="alpine.js"></script><script>
 window.addEventListener('error',e=>{document.querySelector('#result').textContent='FAIL '+e.message});
 const Alpine=window.Alpine;Alpine.directive('anchor',()=>{});Alpine.start();
 const check=(ok,m)=>{if(!ok)throw Error(m)};
 const rgb=c=>c.match(/[\\d.]+/g).slice(0,3).map(Number);
 const lum=c=>rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 requestAnimationFrame(async()=>{try{
 const root=document.querySelector('.structural-workspace'),button=root.querySelector('button'),s=getComputedStyle(button),bg=getComputedStyle(root).backgroundColor;
 check(ratio(s.color,bg)>=4.5,'toolbar text contrast '+s.color+' / '+bg);
 button.focus();check(parseFloat(getComputedStyle(button).outlineWidth)>=2,'keyboard focus invisible');button.classList.add('cad-ribbon-button-bg');await new Promise(r=>setTimeout(r,250));check(ratio(getComputedStyle(button).color,getComputedStyle(button).backgroundColor)>=4.5,'active state contrast');button.classList.remove('cad-ribbon-button-bg');await new Promise(r=>setTimeout(r,250));check(getComputedStyle(root.querySelector('button[disabled]')).color!==getComputedStyle(button).color,'disabled tool not distinguishable');
 const side=root.querySelector('aside button');check(ratio(getComputedStyle(side).color,bg)>=4.5,'sidebar contrast');
 for(const svg of root.querySelectorAll('button svg')){const r=svg.getBoundingClientRect(),b=svg.closest('button').getBoundingClientRect();check(r.width>0&&r.width<=28&&r.height<=28,'icon size');check(r.top>=b.top-1&&r.bottom<=b.bottom+1,'icon escapes button');}
 const material=root.querySelector('button svg');check(getComputedStyle(material).fill===s.color,'solid icon does not inherit control color');
 const arc=root.querySelectorAll('button')[1].querySelector('path');check(getComputedStyle(arc).stroke===getComputedStyle(arc.closest('button')).color,'arc uses fixed white stroke');
 const bar=root.querySelector('.cad-toolbar-scroll');check(bar.clientWidth<=innerWidth,'toolbar escapes viewport');check(getComputedStyle(bar).overflowX==='auto','tools cannot scroll');check(getComputedStyle(bar).scrollbarWidth!=='none','scroll affordance hidden');bar.scrollLeft=bar.scrollWidth;check(bar.scrollLeft>0,'last tool unreachable');
 const last=bar.lastElementChild.getBoundingClientRect();check(last.right<=bar.getBoundingClientRect().right+1,'last group cut off');check(document.documentElement.scrollWidth<=innerWidth,'page horizontal overflow');
 const split=root.querySelector('.cad-ribbon-split');split.querySelector('.cad-ribbon-icon path').dispatchEvent(new MouseEvent('click',{bubbles:true}));check(Alpine.$data(document.body).calls===1,'icon click must execute once');split.querySelector('.cad-ribbon-expand').click();
 queueMicrotask(()=>{try{check(split.querySelector('.cad-ribbon-expand').getAttribute('aria-expanded')==='true','options button did not open');check(Alpine.$data(document.body).calls===1,'arrow executed main action');document.querySelector('#result').textContent='PASS'}catch(e){document.querySelector('#result').textContent='FAIL '+e.message}});
 }catch(e){document.querySelector('#result').textContent='FAIL '+e.message}});
 </script></body></html>`);
 for(const theme of ['light','dark'])for(const width of [320,390,768,1440])assert.equal(await runBrowserFixture(browser,join(dir,'index.html'),{profile:join(dir,theme+width),theme,width,height:900}),'PASS',theme+' '+width);
 }finally{removeTempDir(dir)}
});

test('the complete structural workspace keeps tools and view controls inside the available screen', {skip:!existsSync(browser),timeout:90000},async()=>{
 const markup=execFileSync('php',['-r',`require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); echo Illuminate\\Support\\Facades\\Blade::render('<x-cad-sys />');`],{cwd:resolve('.'),encoding:'utf8',maxBuffer:8*1024*1024});
 const manifest=JSON.parse(readFileSync('public/build/manifest.json','utf8'));
 const dir=mkdtempSync(join(tmpdir(),'structural-full-layout-'));
 try{
 writeFileSync(join(dir,'style.css'),readFileSync('public/build/'+manifest['resources/css/app.css'].file,'utf8')+'\n'+readFileSync('resources/css/structural-workspace.css','utf8'));
 writeFileSync(join(dir,'index.html'),`<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="style.css"><style>
 html,body{margin:0;height:100%;overflow:hidden}body{display:flex;flex-direction:column}header{height:64px;flex:none}body>.structural-workspace{height:calc(100dvh - 64px)}[x-show],[x-cloak]{display:none!important}#result{position:fixed;bottom:0;pointer-events:none}
 </style><body><header>Rizabal &amp; Asociados</header>${markup}<pre id="result"></pre><script>
 requestAnimationFrame(async()=>{try{
 const check=(ok,m)=>{if(!ok)throw Error(m)};const box=e=>e.getBoundingClientRect();const root=document.querySelector('.structural-workspace');
 check(document.documentElement.scrollWidth<=innerWidth,'page overflow');
 for(const selector of ['.structural-toolbar','.structural-tools','.structural-view-controls','.structural-statusbar','#cad-workspace']){const r=box(root.querySelector(selector));check(r.width>0&&r.height>0,selector+' collapsed');check(r.left>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,selector+' escapes the viewport');}
 check(box(root.querySelector('#cad-workspace')).height>180,'drawing area too short');
 for(const button of root.querySelectorAll('.cad-ribbon-button')){if(!button.getClientRects().length)continue;const r=box(button),icon=button.querySelector('.cad-ribbon-icon');if(icon){const i=box(icon);check(i.top>=r.top-1&&i.bottom<=r.bottom+1,'icon clipped: '+button.title);}const bar=button.closest('.structural-ribbon,.structural-view-controls');if(bar){const b=box(bar);check(r.top>=b.top-1&&r.bottom<=b.top+bar.clientTop+bar.clientHeight+1,'button clipped vertically: '+button.title);}}
 const bar=root.querySelector('.structural-ribbon');bar.scrollLeft=bar.scrollWidth;check(box(bar.lastElementChild).right<=box(bar).right+1,'last tool inaccessible');
 document.querySelector('#result').textContent='PASS';
 }catch(e){document.querySelector('#result').textContent='FAIL '+e.message}});
 </script></body></html>`);
 for(const theme of ['light','dark'])for(const width of [320,390,768,1440])assert.equal(await runBrowserFixture(browser,join(dir,'index.html'),{profile:join(dir,theme+width),theme,width,height:900}),'PASS',theme+' '+width);
 }finally{removeTempDir(dir)}
});
