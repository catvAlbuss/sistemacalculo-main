import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {build} from 'vite';
const browser='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

test('real pressure chart and PNG export render without WebGL with legible light/dark legends', {skip:!existsSync(browser),timeout:90000},async()=>{
  const entry=resolve('pressure-chart-fixture.js').replaceAll('\\','/');
  const source=`
    import './resources/js/sheets/analysis.js';
    import Plotly from 'plotly.js-dist-min';
    import {pressureMapTrace} from './resources/js/matlab/pressureMap.js';
    import {readPlotPalette,themedPlotLayout,plotColorbar} from './resources/js/sheets/plotTheme.js';
    document.addEventListener('DOMContentLoaded',async()=>{
      const check=(ok,message)=>{if(!ok)throw Error(message)};
      try{
        const graph=document.getElementById('pressure');const palette=readPlotPalette(graph);
        const trace=pressureMapTrace([0,1,0],[0,0,1],[-15,83,4]);trace.colorbar=plotColorbar(trace.colorbar,palette);
        await Plotly.react(graph,[trace],themedPlotLayout({height:340,title:{text:'Presiones'},margin:{l:40,r:80,t:45,b:40}},palette),{responsive:true,displaylogo:false});
        await new Promise(resolve=>setTimeout(resolve,150));
        check(graph._fullLayout.paper_bgcolor===palette.panel && graph._fullLayout.plot_bgcolor===palette.panel,'Rendered backgrounds match OS');
        check(graph._fullData[0].colorbar.tickfont.color===palette.text && graph._fullData[0].colorbar.title.font.color===palette.text,'Color scale text matches OS');
        check(graph.data[0].type==='heatmap','Pressure renderer does not require WebGL');
        const image=graph.querySelector('.heatmaplayer image');check(!!image,'Pressure raster exists');
        const raster=new Image();raster.src=image.getAttribute('href')||image.getAttribute('xlink:href');await raster.decode();check(raster.naturalWidth>0,'Pressure raster decodes');
        const png=await Plotly.toImage(graph,{format:'png',width:480,height:340});
        const exported=new Image();exported.src=png;await exported.decode();check(exported.naturalWidth===480 && exported.naturalHeight===340,'PNG export preserves the graph');
        document.body.innerHTML='<pre id="result">PASS '+(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')+'</pre>';
      }catch(error){document.body.innerHTML='<pre id="result">FAIL '+error.stack+'</pre>';}
    });
  `;
  const result=await build({configFile:false,logLevel:'error',plugins:[{name:'pressure-chart',resolveId:id=>id.endsWith('pressure-chart-fixture.js')?entry:undefined,load:id=>id===entry?source:undefined}],build:{write:false,minify:true,lib:{entry,formats:['iife'],name:'PressureChart'}}});
  const output=(Array.isArray(result)?result[0]:result).output;const js=output.find(item=>item.type==='chunk').code;
  const css=output.filter(item=>item.type==='asset'&&item.fileName.endsWith('.css')).map(item=>item.source).join('\n');
  const palette=':root{--pr-panel:#fff;--pr-soft:#f8fafc;--pr-text:#172b43;--pr-line:#dce4ee;--pr-blue:#1959b8}@media(prefers-color-scheme:dark){:root{--pr-panel:#172538;--pr-soft:#132033;--pr-text:#e1eaf6;--pr-line:#2c4058;--pr-blue:#80b5ff}}';
  const dir=mkdtempSync(join(tmpdir(),'pressure-chart-'));
  try{
    const file=join(dir,'fixture.html');writeFileSync(file,'<!doctype html><meta charset="utf-8"><style>'+css+palette+'</style><body><div data-analysis-sheet style="width:480px"><div id="pressure"></div></div><script>'+js.replaceAll('</script','<\\/script')+'</script>');
    for(const dark of [false,true]){
      const run=spawnSync(browser,['--headless','--no-sandbox','--disable-gpu','--disable-gpu-sandbox','--disable-webgl','--no-first-run','--disable-background-networking',...(dark?['--force-dark-mode']:[]),'--user-data-dir='+join(dir,dark?'dark':'light'),'--dump-dom','--virtual-time-budget=5000',pathToFileURL(file).href],{encoding:'utf8',timeout:30000,windowsHide:true,maxBuffer:4*1024*1024});
      assert.ifError(run.error);const text=run.stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1];assert.equal(text,'PASS '+(dark?'dark':'light'),text||run.stderr.slice(-1000));
    }
  }finally{rmSync(dir,{recursive:true,force:true});}
});
