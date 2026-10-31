import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {build} from 'vite';

const browser='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
test('preloaded polygon rows keep unique identities when adding and deleting vertices', {skip:!existsSync(browser),timeout:60000},async()=>{
  const entry=resolve('foundation-rows-fixture.js').replaceAll('\\','/');
  const source=`
    import {createSpreeadSheetTable} from './resources/js/tabulator_base/table_factory.js';
    import {makeCreateDeleteColumn} from './resources/js/tabulator_base/table.js';
    import {createPolygonRows} from './resources/js/matlab/foundationPolygons.js';
    (async()=>{
      const check=(ok,message)=>{if(!ok)throw Error(message)};
      const table=createSpreeadSheetTable({id:'#polygon',data:createPolygonRows(),config:{layout:'fitColumns',columns:[makeCreateDeleteColumn('#polygon'),{field:'xv',title:'X',editor:'number'},{field:'yv',title:'Y',editor:'number'}]}});
      await new Promise(resolve=>table.on('tableBuilt',()=>setTimeout(resolve,50)));
      check(table.getData().length===3,'Initial three rows');
      document.querySelector('#polygon .tabulator-col-title button').click();
      await new Promise(resolve=>setTimeout(resolve,30));
      const ids=table.getData().map(row=>row.id);
      check(ids.length===4 && new Set(ids).size===4 && ids.includes(4),'New row gets a distinct ID');
      table.getRow(2).getCells()[0].getElement().querySelector('button:last-child').click();
      await new Promise(resolve=>setTimeout(resolve,30));
      check(table.getData().length===3 && !table.getRow(2) && table.getRow(1) && table.getRow(3) && table.getRow(4),'Delete targets the chosen vertex only');
      document.body.innerHTML='<pre id="result">PASS</pre>';
    })().catch(error=>document.body.innerHTML='<pre id="result">FAIL '+error.stack+'</pre>');
  `;
  const result=await build({configFile:false,logLevel:'error',plugins:[{name:'foundation-rows',resolveId:id=>id.endsWith('foundation-rows-fixture.js')?entry:undefined,load:id=>id===entry?source:undefined}],build:{write:false,minify:false,lib:{entry,formats:['iife'],name:'FoundationRows'}}});
  const output=(Array.isArray(result)?result[0]:result).output;
  const js=output.find(item=>item.type==='chunk').code;
  const css=output.filter(item=>item.type==='asset'&&item.fileName.endsWith('.css')).map(item=>item.source).join('\n');
  const dir=mkdtempSync(join(tmpdir(),'foundation-rows-'));
  try{
    const file=join(dir,'fixture.html');writeFileSync(file,'<!doctype html><meta charset="utf-8"><style>'+css+'</style><body><div id="polygon"></div><script>'+js.replaceAll('</script','<\\/script')+'</script>');
    const run=spawnSync(browser,['--headless','--no-sandbox','--disable-gpu','--disable-gpu-sandbox','--no-first-run','--user-data-dir='+join(dir,'profile'),'--dump-dom','--virtual-time-budget=2000',pathToFileURL(file).href],{encoding:'utf8',timeout:25000,windowsHide:true,maxBuffer:4*1024*1024});
    assert.ifError(run.error);const text=run.stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1];assert.equal(text,'PASS',text||run.stderr.slice(-1000));
  }finally{rmSync(dir,{recursive:true,force:true});}
});
