import {spawn} from 'node:child_process';
import {rmSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));

// Real frame timing is required for IntersectionObserver and requestAnimationFrame.
export async function runBrowserFixture(browser,file,{profile,theme='light',width=1100,height=900,dpr=1,interact,webgl=false,url,timeoutMs=15000}) {
 const graphics=webgl?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--disable-gpu','--disable-gpu-sandbox','--disable-webgl'];
 const child=spawn(browser,['--headless=new','--no-sandbox',...graphics,'--no-first-run','--disable-background-networking','--disable-extensions','--disable-renderer-backgrounding','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let launchError;child.on('error',error=>{launchError=error});
 let ws,session,id=0;const pending=new Map();
 const send=(method,params={},targetSession=session)=>new Promise((resolve,reject)=>{
  const key=++id;const timer=setTimeout(()=>{pending.delete(key);reject(Error('CDP timeout: '+method))},10000);
  pending.set(key,{resolve:value=>{clearTimeout(timer);resolve(value)},reject:error=>{clearTimeout(timer);reject(error)}});
  ws.send(JSON.stringify({id:key,method,params,...(targetSession?{sessionId:targetSession}:{})}));
 });
 try{
  let port;for(let i=0;i<100;i++){if(launchError)throw launchError;try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break}catch{}await pause(50)}
  if(!port)throw Error('Browser did not start');
  const version=await(await fetch('http://127.0.0.1:'+port+'/json/version')).json();ws=new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true})});
  ws.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const item=pending.get(message.id);pending.delete(message.id);if(item)message.error?item.reject(Error(message.error.message)):item.resolve(message.result)}});
  const target=await send('Target.createTarget',{url:'about:blank'},null);session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
  await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:width<600});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme}]});
  await send('Page.bringToFront');await send('Page.navigate',{url:url||pathToFileURL(file).href});
  let interacted=false;
  const deadline=Date.now()+timeoutMs;
  while(Date.now()<deadline){const result=await send('Runtime.evaluate',{expression:'document.querySelector("#result")?.textContent',returnByValue:true});const status=result.result?.value;if(status?.startsWith('PASS')||status?.startsWith('FAIL'))return status;if(status==='READY'&&interact&&!interacted){interacted=true;await interact(send)}await pause(100)}
  throw Error('Fixture did not finish');
 }finally{
  if(ws?.readyState===WebSocket.OPEN){await send('Browser.close',{},null).catch(()=>{});ws.close()}
  for(let i=0;i<20&&child.exitCode===null;i++)await pause(50);
  if(child.exitCode===null)child.kill();
 }
}

// Edge's helper processes can keep the profile folder locked for a few seconds
// after closing; a leftover folder in the OS temp dir must not fail a test.
export function removeTempDir(dir) {
 try{rmSync(dir,{recursive:true,force:true,maxRetries:10,retryDelay:300})}catch{}
}
