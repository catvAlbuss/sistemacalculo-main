import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createServer} from 'node:http';
import {inflateSync} from 'node:zlib';
import {captureHtml,findCaptureBrowser,readCaptureAsset} from '../../scripts/capture-browser.mjs';

test('capture reads local CSS without calling the PHP server, blocks scripts and internal requests', {timeout:30000}, async context => {
  try {findCaptureBrowser();} catch {context.skip('No Chromium installed');return;}
  const dir=await mkdtemp(path.join(tmpdir(),'sheet-capture-'));
  let requests=0;let cssRequests=0;
  const server=createServer((req,res)=>{
    if(req.url==='/resources/css/dev.css'){
      cssRequests++;res.setHeader('Content-Type',req.headers.accept?.includes('text/css')?'text/css':'text/javascript');
      res.end(req.headers.accept?.includes('text/css')?'#vigasgn{width:240px;height:80px;background:blue}@media(prefers-color-scheme:dark){#vigasgn{background:rgb(10,20,30)}}':'import "/@vite/client";');
    }else{requests++;res.end('private');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const internal=`http://127.0.0.1:${server.address().port}/internal`;
  try {
    const publicRoot=path.join(dir,'public');await mkdir(path.join(publicRoot,'assets'),{recursive:true});
    await writeFile(path.join(publicRoot,'assets','sheet.css'),'#vigasgn { width:220px;height:80px;background:blue; }');
    await writeFile(path.join(dir,'secret.css'),'private');
    assert.equal(await readCaptureAsset('https://example.test/assets/%2e%2e%2f%2e%2e%2fsecret.css','https://example.test',publicRoot),null);
    const output=path.join(dir,'capture.png');
    await captureHtml(`<html><head><link rel="stylesheet" href="https://example.test/assets/sheet.css"></head><body style="margin:0"><div id="vigasgn">Resultado</div><script>document.getElementById('vigasgn').style.width='9999px';fetch('${internal}')</script><img src="${internal}"></body></html>`, output,
      {origin:'https://example.test',publicRoot,workRoot:dir});
    const png=await readFile(output);
    assert.equal(png.subarray(1,4).toString(),'PNG');
    assert.equal(png.readUInt32BE(16),220,'CSS is served from disk during the capture');
    assert.equal(png.readUInt32BE(20),80);
    assert.equal(requests,0,'No HTML scripts or internal-service requests executed');
    const devOrigin=`http://127.0.0.1:${server.address().port}`;
    await captureHtml(`<html><head><link rel="stylesheet" href="${devOrigin}/resources/css/dev.css"></head><body style="margin:0"><div id="vigasgn"></div></body></html>`,output,
      {origin:'https://example.test',devOrigin,theme:'dark',publicRoot,workRoot:dir});
    const devPng=await readFile(output);
    assert.equal(devPng.readUInt32BE(16),240,'Vite-style server returned CSS instead of JavaScript');
    const chunks=[];
    for(let offset=8;offset<devPng.length;){const size=devPng.readUInt32BE(offset);if(devPng.toString('ascii',offset+4,offset+8)==='IDAT')chunks.push(devPng.subarray(offset+8,offset+8+size));offset+=size+12;}
    assert.deepEqual([...inflateSync(Buffer.concat(chunks)).subarray(1,4)],[10,20,30],'PNG follows the requested dark theme');
    assert.equal(cssRequests,1);
  } finally { await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true}); }
});
