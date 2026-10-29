import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {build} from 'vite';

const browser='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
test('Tabulator frozen cells, units, sections and editor follow the OS theme even with legacy CSS loaded last', {skip:!existsSync(browser),timeout:60000}, async()=>{
  const entry=resolve('beam-theme-fixture.js').replaceAll('\\','/');
  const source=`
    import {createTable} from './resources/js/vigas/renderers/tableRenderer.js';
    const check=(ok,message)=>{if(!ok)throw Error(message)};
    const contrast=(fg,bg)=>{
      const l=rgb=>{const c=rgb.match(/[\\d.]+/g).slice(0,3).map(v=>{v=Number(v)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
      const a=l(fg),b=l(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    };
    (async()=>{
      const table=createTable('#tablaContainer',1);
      await new Promise(resolve=>table.on('tableBuilt',()=>setTimeout(resolve,100)));
      const dark=matchMedia('(prefers-color-scheme: dark)').matches;
      const panel=dark?'rgb(23, 37, 56)':'rgb(255, 255, 255)';
      const frozen=document.querySelector('.tabulator-cell.tabulator-frozen');
      const style=getComputedStyle(frozen);
      check(style.backgroundColor===panel,'Readonly frozen column uses the panel color: '+style.backgroundColor);
      check(contrast(style.color,style.backgroundColor)>=4.5,'Frozen label contrast');
      const unit=document.querySelector('.tabulator-cell span');
      check(contrast(getComputedStyle(unit).color,getComputedStyle(unit.parentElement).backgroundColor)>=4.5,'Unit contrast');
      const section=document.querySelector('[data-sheet-row=section] .tabulator-cell');
      const sectionStyle=getComputedStyle(section);
      check(contrast(sectionStyle.color,sectionStyle.backgroundColor)>=4.5,'Section contrast');
      const editable=table.getRows()[0].getCell('b1_a');editable.edit();
      const input=document.querySelector('.tabulator-editing input');
      check(!!input,'Editing remains available');
      check(getComputedStyle(input).backgroundColor===panel,'Editor follows the same theme');
      document.body.innerHTML='<pre id="result">PASS '+(dark?'dark':'light')+'</pre>';
    })().catch(error=>document.body.innerHTML='<pre id="result">FAIL '+error.stack+'</pre>');
  `;
  const result=await build({configFile:false,logLevel:'error',plugins:[{name:'beam-theme',resolveId:id=>id.endsWith('beam-theme-fixture.js')?entry:undefined,load:id=>id===entry?source:undefined}],
    build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'BeamTheme'}}});
  const output=(Array.isArray(result)?result[0]:result).output;
  const js=output.find(item=>item.type==='chunk').code;
  const vendorCss=output.filter(item=>item.type==='asset' && item.fileName.endsWith('.css')).map(item=>item.source).join('\n');
  const styles=['resources/css/engineering.css','resources/css/beam-sheet.css','resources/css/app.css'].map(file=>readFileSync(file,'utf8')).join('\n');
  const dir=mkdtempSync(join(tmpdir(),'beam-theme-'));
  try{
    const file=join(dir,'fixture.html');
    writeFileSync(file,'<!doctype html><meta charset="utf-8"><style>'+vendorCss+'\n'+styles+'</style><body><div class="beam-sheet arco-sheet"><div id="tablaContainer"></div></div><script>'+js.replaceAll('</script','<\\/script')+'</script>');
    for(const dark of [false,true]){
      const run=spawnSync(browser,['--headless','--no-sandbox','--disable-gpu','--disable-gpu-sandbox','--no-first-run','--disable-background-networking',...(dark?['--force-dark-mode']:[]),'--user-data-dir='+join(dir,dark?'dark':'light'),'--dump-dom','--virtual-time-budget=2000',pathToFileURL(file).href],{encoding:'utf8',timeout:25000,windowsHide:true,maxBuffer:4*1024*1024});
      assert.ifError(run.error);
      const text=run.stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1];
      assert.equal(text,'PASS '+(dark?'dark':'light'),text||run.stderr.slice(-1000));
    }
  }finally{rmSync(dir,{recursive:true,force:true});}
});
