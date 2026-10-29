import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, realpath, rm, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import { canLoadCaptureResource } from './capture-resource-policy.mjs';

export function findCaptureBrowser() {
  const candidates = [process.env.CAPTURE_BROWSER_BINARY, process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  const browser = candidates.find(candidate => candidate && existsSync(candidate));
  if (!browser) throw Error('CAPTURE_BROWSER_BINARY: configura un navegador Chrome o Chromium instalado.');
  return browser;
}

export async function readCaptureAsset(address, origin, publicRoot) {
  const url = new URL(address);
  if (url.origin !== origin || !/^\/(build|assets|media)\//.test(url.pathname)) return null;
  const root = await realpath(publicRoot);
  let file;
  try { file = await realpath(path.resolve(root, '.' + decodeURIComponent(url.pathname))); }
  catch { return null; }
  if (!file.startsWith(root + path.sep)) return null;
  return readFile(file);
}

export async function captureHtml(html, outputFile, { origin, devOrigin = '', theme = 'light', publicRoot, workRoot }) {
  if (typeof WebSocket === 'undefined') throw Error('La captura necesita Node.js 22 o posterior.');
  const profile = await mkdtemp(path.resolve(workRoot, 'browser-'));
  const flags = ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', '--disable-extensions', '--disable-sync', '--hide-scrollbars',
    '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0', '--user-data-dir=' + profile];
  // Keep Chromium's sandbox enabled unless the server explicitly opts out.
  if (process.env.CAPTURE_DISABLE_SANDBOX === '1') flags.push('--no-sandbox');
  const child = spawn(findCaptureBrowser(), [...flags, 'about:blank'], { windowsHide:true, stdio:['ignore','ignore','pipe'] });
  let diagnostics = ''; let launchError;
  child.stderr.on('data', chunk => { diagnostics = (diagnostics + chunk).slice(-3000); });
  child.on('error', error => { launchError = error; });
  let socket; const pending = new Map(); let sequence = 0; let sessionId; let resolveLoad;
  const send = (method, params = {}, session = sessionId) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(Error('Tiempo agotado: ' + method)); }, 12000);
    pending.set(id, { resolve: result => { clearTimeout(timer); resolve(result); }, reject: error => { clearTimeout(timer); reject(error); } });
    socket.send(JSON.stringify({ id, method, params, ...(session ? {sessionId:session} : {}) }));
  });
  try {
    let port;
    for (let i=0; i<100; i++) {
      if (launchError) throw launchError;
      if (child.exitCode !== null) throw Error('El navegador no pudo iniciar: ' + diagnostics);
      try { port = (await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch {}
      await new Promise(resolve => setTimeout(resolve,100));
    }
    if (!port) throw Error('El navegador no inició en 10 segundos. ' + diagnostics);
    const version = await (await fetch(`http://127.0.0.1:${port}/json/version`, {signal:AbortSignal.timeout(3000)})).json();
    socket = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve,reject) => { socket.addEventListener('open',resolve,{once:true}); socket.addEventListener('error',reject,{once:true}); });
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const item = pending.get(message.id); pending.delete(message.id);
        if (item) message.error ? item.reject(Error(message.error.message)) : item.resolve(message.result);
      }
      if (message.method === 'Fetch.requestPaused') {
        respondToResource(message.params).catch(() => {});
      }
      if (message.method === 'Page.loadEventFired' && message.sessionId === sessionId) resolveLoad?.();
    });
    async function respondToResource({requestId, request, resourceType}) {
      const type = resourceType.toLowerCase();
      if (!canLoadCaptureResource(request.url,type,origin,devOrigin)) {
        await send('Fetch.failRequest',{requestId,errorReason:'BlockedByClient'}); return;
      }
      try {
        // Read our assets from disk: PHP's single-worker server is already serving
        // the POST and cannot serve a second HTTP request until capture finishes.
        let bytes = await readCaptureAsset(request.url,origin,publicRoot);
        if (!bytes) {
          if (new URL(request.url).origin === origin) throw Error('Local asset unavailable');
          const response = await fetch(request.url,{
            signal:AbortSignal.timeout(2000),redirect:'error',
            // Vite returns a JavaScript style module for Accept: */*. Request
            // actual CSS just as Chromium does for a stylesheet link.
            headers:{Accept:type === 'stylesheet' ? 'text/css,*/*;q=0.1' : '*/*'},
          });
          if (!response.ok) throw Error('Resource unavailable');
          bytes = Buffer.from(await response.arrayBuffer());
        }
        if (bytes.length > 8 * 1024 * 1024) throw Error('Asset too large');
        await send('Fetch.fulfillRequest',{requestId,responseCode:200,
          responseHeaders:[{name:'Content-Type',value:type === 'stylesheet' ? 'text/css' : 'application/octet-stream'}],body:bytes.toString('base64')});
      } catch { await send('Fetch.failRequest',{requestId,errorReason:'Failed'}); }
    }
    const target = await send('Target.createTarget',{url:'about:blank'},null);
    ({sessionId} = await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null));
    await send('Page.enable'); await send('DOM.enable');
    await send('Emulation.setScriptExecutionDisabled',{value:true});
    await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1200,deviceScaleFactor:1,mobile:false});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme}]});
    await send('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
    const {frameTree} = await send('Page.getFrameTree');
    const loaded = new Promise(resolve => {resolveLoad = resolve;});
    await send('Page.setDocumentContent',{frameId:frameTree.frame.id,html});
    let loadTimer;
    try { await Promise.race([loaded,new Promise((_,reject)=>{loadTimer=setTimeout(()=>reject(Error('No terminaron de cargar los estilos de captura.')),8000);})]); }
    finally {clearTimeout(loadTimer);resolveLoad=null;}
    // Trusted DevTools evaluation only; scripts in the supplied HTML stay disabled.
    await send('Runtime.evaluate',{expression:'document.fonts.ready',awaitPromise:true});
    await new Promise(resolve => setTimeout(resolve,250));
    const {root} = await send('DOM.getDocument');
    const {nodeId} = await send('DOM.querySelector',{nodeId:root.nodeId,selector:'#vigasgn'});
    if (!nodeId) throw Error('No se encontró el contenido para exportar.');
    const {model} = await send('DOM.getBoxModel',{nodeId});
    const [x,y] = model.border;
    if (model.width > 16000 || model.height > 30000 || model.width * model.height > 40000000) throw Error('Los resultados exceden el tamaño máximo de imagen. Exporta el PDF.');
    const shot = await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x,y,width:model.width,height:model.height,scale:1}});
    const {writeFile} = await import('node:fs/promises');
    await writeFile(outputFile,Buffer.from(shot.data,'base64'));
  } finally {
    if (socket?.readyState === WebSocket.OPEN) { await send('Browser.close',{},null).catch(()=>{}); socket.close(); }
    if (child.exitCode === null) child.kill();
    for (const item of pending.values()) item.reject(Error('Captura finalizada'));
    await rm(profile,{recursive:true,force:true,maxRetries:8,retryDelay:200}).catch(()=>{});
  }
}
