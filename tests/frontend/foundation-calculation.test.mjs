import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {build} from 'vite';
const browser='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

test('prefilled geometry reaches the engine, ignores disabled holes and handles successful/error responses', {skip:!existsSync(browser),timeout:60000},async()=>{
  const entry=resolve('foundation-calculation-fixture.js').replaceAll('\\','/');
  const source=`
    import './resources/js/adm_zapatas_grafico.js';
    const failures=[];window.addEventListener('unhandledrejection',event=>{failures.push(String(event.reason));event.preventDefault()});
    let mode='success';const requests=[];
    window.fetch=async(url,options)=>{requests.push(Object.fromEntries(options.body.entries()));return mode==='success'
      ? new Response(new Uint8Array([0]),{headers:{'Content-Type':'application/octet-stream'}})
      : new Response(JSON.stringify({message:'Respuesta de prueba del motor'}),{status:422,headers:{'Content-Type':'application/json'}})};
    document.addEventListener('DOMContentLoaded',async()=>{
      const check=(ok,message)=>{if(!ok)throw Error(message)};
      const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
      try{
        await pause(100);document.getElementById('calcular').click();await pause(350);
        check(requests.length===1,'Default three-point exterior is accepted');
        check(requests[0].A==='72' && requests[0].Ixx==='576' && requests[0].Iyy==='432','Properties match the exterior');
        check(requests[0].poligonos.includes("'poligonoExterior', [[-6,6,0]; [-4,-4,8]]"),'Coordinates remain ordered');
        for(let index=1;index<=5;index++)check(requests[0].poligonos.includes("'poligonoInterior"+index+"', [1:0; 1:0]"),'Unused hole omitted');
        check(!document.getElementById('generarPDF').disabled,'Successful calculation enables the report');
        check(!document.querySelector('.swal2-popup:not(.swal2-hide)'),'Loading popup closes after success');
        document.getElementById('usarInterior1').checked=true;mode='error';document.getElementById('calcular').click();await pause(100);
        check(requests.length===2 && !requests[1].poligonos.includes("'poligonoInterior1', [1:0; 1:0]"),'Enabled sample hole is included');
        check(document.getElementById('generarPDF').disabled,'Failed calculation disables the report');
        check(document.querySelector('.swal2-html-container')?.textContent.includes('Respuesta de prueba'),'Error is displayed without throwing a popup exception');
        check(failures.length===0,failures.join(';'));
        document.body.innerHTML='<pre id="result">PASS</pre>';
      }catch(error){document.body.innerHTML='<pre id="result">FAIL '+error.stack+'</pre>';}
    });
  `;
  const mocks={
    'mock:mat':`export const read=()=>({data:{ZLT:[[1,2,3]],XL:[0,1,0],YL:[0,0,1],mins:[1],maxs:[3]}})`,
    'mock:plotly':`export default {react:()=>Promise.resolve(),relayout:()=>Promise.resolve(),purge:()=>{},Plots:{resize:()=>Promise.resolve()}}`,
  };
  const result=await build({configFile:false,logLevel:'error',plugins:[{name:'foundation-calculation',enforce:'pre',resolveId:id=>id==='mat-for-js'?'mock:mat':id==='plotly.js-dist-min'?'mock:plotly':id.endsWith('foundation-calculation-fixture.js')?entry:undefined,load:id=>id===entry?source:mocks[id]}],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'FoundationCalculation'}}});
  const output=(Array.isArray(result)?result[0]:result).output;const js=output.find(item=>item.type==='chunk').code;
  const css=output.filter(item=>item.type==='asset'&&item.fileName.endsWith('.css')).map(item=>item.source).join('\n');
  const ids=['cargas','propiedades','poligonoExterior',...[1,2,3,4,5].map(i=>'poligonoInterior'+i),...[1,2,3,4,5,6,7,8,9,10,11].map(i=>'zapata'+i)];
  const dir=mkdtempSync(join(tmpdir(),'foundation-calculation-'));
  try{
    const file=join(dir,'fixture.html');
    writeFileSync(file,'<!doctype html><meta charset="utf-8"><style>'+css+'</style><body><form id="zapatasForm">'+ids.map(id=>'<div id="'+id+'"></div>').join('')+[1,2,3,4,5].map(i=>'<input type="checkbox" id="usarInterior'+i+'">').join('')+'<button id="calcular" type="submit">Calcular</button><button id="generarPDF" type="button">Reporte</button></form><script>'+js.replaceAll('</script','<\\/script')+'</script>');
    const run=spawnSync(browser,['--headless','--no-sandbox','--disable-gpu','--disable-gpu-sandbox','--no-first-run','--user-data-dir='+join(dir,'profile'),'--dump-dom','--virtual-time-budget=2500',pathToFileURL(file).href],{encoding:'utf8',timeout:25000,windowsHide:true,maxBuffer:4*1024*1024});
    assert.ifError(run.error);const text=run.stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1];assert.equal(text,'PASS',text||run.stderr.slice(-1000));
  }finally{rmSync(dir,{recursive:true,force:true});}
});
