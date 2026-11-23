import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync} from 'node:fs';
import {resolve,join,extname,sep} from 'node:path';
import {tmpdir} from 'node:os';
import {runBrowserFixture,removeTempDir} from './browserFixture.mjs';
const browser='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

// Real SDK + software WebGL. No account, backend writes or external CAD files.
test('NovaCad keeps the real mlightcad ribbon and drawing engine in both themes',{skip:!existsSync(browser),timeout:120000},async()=>{
 const publicRoot=resolve('public'),manifest=JSON.parse(readFileSync(join(publicRoot,'build/manifest.json'),'utf8'));
 const entry=manifest['resources/js/etabs/main.js'];
 const links=[manifest['resources/css/app.css'].file,manifest['resources/css/engineering.css'].file,...(entry.css||[])].map(file=>`<link rel="stylesheet" href="/build/${file}">`).join('');
 const html=`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${links}<style>body{margin:0;display:flex;flex-direction:column}.preview-navigation{box-sizing:border-box;flex:0 0 64px;padding:20px;background:#18283c;color:#fff;font:14px system-ui}body>main{display:flex;flex:1;min-height:0}#result{display:none}</style><body><nav class="preview-navigation">Rizabal &amp; Asociados · NovaCad</nav><main><div id="cad-viewer-app"></div></main><pre id="result">WAIT</pre><script>window.__errors=[];window.addEventListener('error',e=>{if(!e.message.includes('ResizeObserver'))window.__errors.push(e.message)});window.addEventListener('unhandledrejection',e=>window.__errors.push(String(e.reason)));const poll=setInterval(()=>{const canvas=document.querySelector('.ml-cad-main canvas');if(canvas&&canvas.width>0&&document.querySelectorAll('.ml-ribbon-tab').length>1&&!document.querySelector('.ml-ribbon--disabled')){clearInterval(poll);document.querySelector('#result').textContent='READY'}},100);</script><script type="module" src="/build/${entry.file}"></script></body></html>`;
 const types={'.js':'application/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
 const server=createServer((req,res)=>{
  const pathname=new URL(req.url,'http://127.0.0.1').pathname;
  if(pathname==='/'){res.setHeader('Content-Type','text/html;charset=utf-8');res.end(html);return;}
  const file=resolve(publicRoot,'.'+decodeURIComponent(pathname));
  if(!file.startsWith(publicRoot+sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(readFileSync(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const out=resolve('storage/framework/testing/novacad-native-preview');mkdirSync(out,{recursive:true});
 try{
 for(const theme of ['light','dark'])for(const width of [1480,390]){
  const profile=mkdtempSync(join(tmpdir(),'novacad-real-'));
  try{
   const status=await runBrowserFixture(browser,'unused',{url:`http://127.0.0.1:${server.address().port}/`,profile,theme,width,height:960,webgl:true,timeoutMs:45000,interact:async send=>{
    const evaluate=async expression=>{const response=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(response.exceptionDetails)throw Error(response.exceptionDetails.text+' '+response.exceptionDetails.exception?.description);return response.result.value;};
    const info=await evaluate(`({theme:document.querySelector('.novacad-workspace').dataset.theme,tabs:document.querySelectorAll('.ml-ribbon-tab').length,custom:!!document.querySelector('.nc-toolbar'),errors:window.__errors})`);
    assert.equal(info.theme,theme);assert.ok(info.tabs>2,'native tabs retained');assert.equal(info.custom,false);assert.deepEqual(info.errors,[]);assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'native workspace fits');assert.match(await evaluate('[...document.querySelectorAll(".ml-ribbon-tab")].map(e=>e.textContent).join(" / ")'),/Trazado/);
    assert.equal(await evaluate(`(()=>{const tool=[...document.querySelectorAll('.ml-ribbon-item-host')].find(e=>e.textContent.trim().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')==='Linea');if(!tool)return false;(tool.querySelector('button')||tool).click();return true})()`),true,'native Line tool is available');
    await evaluate(`new Promise(r=>setTimeout(r,120))`);
    await evaluate(`document.querySelector('.ml-ui-touch-point-tutorial-ok')?.click()`);
    const point=await evaluate(`(()=>{const r=document.querySelector('.ml-cad-main canvas').getBoundingClientRect();return {x:r.left+r.width*.45,y:r.top+r.height*.5}})()`);
    for(const dx of [0,100]){const params={x:point.x+dx,y:point.y,button:'left',clickCount:1};await send('Input.dispatchMouseEvent',{type:'mousePressed',...params});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...params});}
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await evaluate(`new Promise(r=>setTimeout(r,300))`);
    assert.deepEqual(await evaluate('window.__errors'),[]);
    const shot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(join(out,theme+'-'+width+'.png'),Buffer.from(shot.data,'base64'));
    assert.equal(await evaluate(`(()=>{const badge=document.querySelector('.nc-product-status');if(!badge)return false;const r=badge.getBoundingClientRect();if(r.width<=0||r.left<0||r.right>innerWidth)return false;badge.click();return true})()`),true,'NovaCad identity in status bar');await evaluate(`new Promise(r=>setTimeout(r,120))`);assert.match(await evaluate(`document.querySelector('.em-dialog').textContent`),/Acerca de NovaCad/);assert.match(await evaluate(`document.querySelector('.nc-about-attribution').textContent`),/terceros/);await evaluate(`document.querySelector('.nc-about-tabs button:last-child').click();new Promise((resolve,reject)=>{const end=Date.now()+5000;const poll=()=>{if(document.querySelectorAll('.nc-license-table tbody tr').length>5)return resolve();if(Date.now()>end)return reject(Error('License inventory did not load: '+document.querySelector('.nc-about-licenses').textContent));setTimeout(poll,50)};poll()})`);assert.ok(await evaluate(`document.querySelectorAll('.nc-license-table tbody tr').length`)>5,'published license inventory');assert.match(await evaluate(`document.querySelector('.nc-license-table').textContent`),/GPL-3.0/);assert.equal(await evaluate(`(async()=>{const r=await fetch('/build/licenses/THIRD-PARTY-NOTICES.txt');return r.ok&&(await r.text()).includes('Copyright (c) 2026 mlightcad')})()`),true);const about=await send('Page.captureScreenshot',{format:'png'});writeFileSync(join(out,theme+'-'+width+'-licenses.png'),Buffer.from(about.data,'base64'));await evaluate(`document.querySelector('.em-close').click()`);
    // Desktop exposes the command input; touch mode exposes the native File menu.
    if(width>=600){
    assert.equal(await evaluate(`(()=>{const e=[...document.querySelectorAll('.ml-cad-viewer-container input')].find(e=>(e.placeholder||'').includes('comando'));if(!e)return false;e.focus();e.select();return true})()`),true,'engine command input');
    await send('Input.insertText',{text:'ABOUT'});
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
    }else{
      assert.equal(await evaluate(`(()=>{const button=[...document.querySelectorAll('.ml-ribbon button')].find(e=>e.textContent.trim()==='Archivo');if(!button)return false;button.click();return true})()`),true,'native File menu');
      await evaluate(`new Promise(r=>setTimeout(r,150))`);
      assert.equal(await evaluate(`(()=>{const item=[...document.querySelectorAll('.el-dropdown-menu__item')].find(e=>e.textContent.trim()==='Acerca de NovaCad');if(!item)return false;item.click();return true})()`),true,'native About entry');
    }
    await evaluate(`new Promise(r=>setTimeout(r,300))`);assert.match(await evaluate(`document.querySelector('.em-dialog')?.textContent||''`),/Acerca de NovaCad/,'public ABOUT command uses the product dialog');
    const product=await send('Page.captureScreenshot',{format:'png'});writeFileSync(join(out,theme+'-'+width+'-about.png'),Buffer.from(product.data,'base64'));await evaluate(`document.querySelector('.em-close').click()`);
    assert.equal(await evaluate(`(()=>{const b=[...document.querySelectorAll('.etabs-cimentacion-open')].find(e=>e.getBoundingClientRect().width>0);if(!b)return false;b.click();return true})()`),true);
    await evaluate(`new Promise(r=>setTimeout(r,250))`);
    assert.match(await evaluate(`document.querySelector('.etabs-cimentacion-summary').textContent`),/Zapatas: 14/);
    const panel=await send('Page.captureScreenshot',{format:'png'});writeFileSync(join(out,theme+'-'+width+'-foundation.png'),Buffer.from(panel.data,'base64'));
    await evaluate(`document.querySelector('#result').textContent='PASS'`);
   }});
   assert.equal(status,'PASS',theme+' real SDK');
  }finally{removeTempDir(profile)}
 }
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});
