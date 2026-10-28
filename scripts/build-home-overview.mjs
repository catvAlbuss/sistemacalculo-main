// Rebuild the first-party homepage overview from local product artwork.
// Run: node scripts/build-home-overview.mjs
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve('.');
const work = join(root, 'storage/app/home-overview-build');
const output = join(root, 'public/assets/marketing');
mkdirSync(work, { recursive: true }); mkdirSync(output, { recursive: true });
const php = spawnSync('php', ['-r', "require 'vendor/autoload.php'; $data = require 'config/showcase.php'; echo json_encode($data['products'], JSON_UNESCAPED_UNICODE);"], { encoding: 'utf8', windowsHide: true });
if (php.status !== 0) throw Error(php.stderr);
const products = JSON.parse(php.stdout);
const slugs = ['modelador-estructural', 'aligerados-v2', 'vigas', 'cimentacion-v2', 'predim', 'arco-techo'];
const background = process.argv.includes('--background');
const baseName = background ? 'system-background' : 'system-overview';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ffmpeg = process.env.FFMPEG_PATH || join(root, 'storage/app/video-tools/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe');
const profile = join(work, 'chrome-'+Date.now());
const browser = spawn(chrome, ['--headless', '--no-sandbox', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir='+profile, 'about:blank'], { stdio: 'ignore', windowsHide: true });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let ws;
try {
    const portFile = join(profile, 'DevToolsActivePort');
    for (let i=0; i<100 && !existsSync(portFile); i++) await delay(100);
    const port = readFileSync(portFile, 'utf8').split('\n')[0];
    const pages = await (await fetch('http://127.0.0.1:'+port+'/json')).json();
    ws = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => ws.addEventListener('open', resolve, {once:true}));
    let seq=0; const pending=new Map();
    ws.addEventListener('message', event => { const message=JSON.parse(event.data); if(message.id){const p=pending.get(message.id);pending.delete(message.id);message.error?p.reject(message.error):p.resolve(message.result);} });
    const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
    await send('Page.enable');
    const escape=text=>String(text).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
    for (const [profile, width] of [['desktop', 1600], ['mobile', 960]]) {
    const height = background ? (profile === 'mobile' ? 1600 : 900) : 720;
    await send('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:false});
    for(const [index,slug] of slugs.entries()){
        const product=products[slug];
        const image=pathToFileURL(resolve(product.homepage_image || product.image)).href;
        let html=`<!doctype html><meta charset="utf-8"><style>
        *{box-sizing:border-box}body{margin:0;width:1600px;height:720px;overflow:hidden;background:#10213a;color:#eef5ff;font-family:Arial,sans-serif;position:relative}body:before{content:'';position:absolute;inset:0;background-image:linear-gradient(#3b5d8520 1px,transparent 1px),linear-gradient(90deg,#3b5d8520 1px,transparent 1px);background-size:40px 40px}.scene{position:relative;display:grid;grid-template-columns:500px 1fr;gap:50px;padding:65px 70px;height:100%;align-items:center}.eyebrow{color:#81bcff;font-size:14px;letter-spacing:3px;font-weight:600}h1{font-size:56px;letter-spacing:-2px;line-height:1.08;margin:24px 0}p{color:#b4c8e1;font-size:22px;line-height:1.7;margin:0 0 25px}ul{list-style:none;padding:0;margin:0}li{font-size:18px;line-height:1.6;color:#d4e4f7;margin:14px 0;padding-left:23px;position:relative}li:before{content:'✓';color:#72b4ff;position:absolute;left:0}.visual{height:530px;border:1px solid #456489;border-radius:14px;background:${slug==='modelador-estructural'?'#0d1b2f':'#edf2f8'};box-shadow:0 25px 65px #0004;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.visual img{display:block;max-width:95%;max-height:92%;object-fit:contain}.bar{position:absolute;top:0;left:0;right:0;background:#1c324e;color:#bcd1eb;padding:13px 20px;font-size:12px;letter-spacing:1px}.footer{position:absolute;left:70px;right:70px;bottom:25px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#8faacd}.steps{display:flex;gap:8px}.steps i{width:36px;height:3px;background:#304a6a}.steps i.active{background:#62a4ff}
        @media(max-width:1000px){body{width:960px;height:720px}.scene{grid-template-columns:1fr;grid-template-rows:100px 1fr;padding:30px 55px 65px;gap:18px;text-align:center}.eyebrow{font-size:11px;letter-spacing:2px}h1{font-size:43px;margin:14px 0 0;line-height:1.1}.scene>div:first-child p,.scene>div:first-child ul{display:none}.visual{height:490px;width:100%;max-width:850px;margin:auto}.visual img{max-width:92%;max-height:85%}.bar{text-align:left}.footer{left:55px;right:55px;bottom:18px;font-size:10px}.steps i{width:25px}}
        </style><div class="scene"><div><div class="eyebrow">RIZABAL & ASOCIADOS / ${String(index+1).padStart(2,'0')}</div><h1>${escape(product.name)}</h1><p>${escape(product.description)}</p><ul>${product.features.map(feature=>'<li>'+escape(feature)+'</li>').join('')}</ul></div><div class="visual"><div class="bar">${escape(product.category.toUpperCase())} / RIZABAL</div><img src="${image}"></div></div><div class="footer"><span>ANÁLISIS · DISEÑO · VERIFICACIÓN</span><div class="steps">${slugs.map((_,i)=>'<i class="'+(i===index?'active':'')+'"></i>').join('')}</div><span>INGENIERÍA ESTRUCTURAL</span></div>`;
        if (background) html = html.replace('</style>', `body{width:${width}px;height:${height}px}.scene{display:flex;padding:0;gap:0;align-items:center;justify-content:center}.scene>div:first-child,.footer,.bar{display:none}.visual{width:100%;height:100%;max-width:none;margin:0;border:0;border-radius:0;background:transparent;box-shadow:none}.visual img{max-width:${profile === 'mobile' ? 88 : 76}%;max-height:78%;transform:translateY(-9%)} </style>`);
        const page=join(work,'scene.html');writeFileSync(page,html);
        await send('Page.navigate',{url:pathToFileURL(page).href});
        await delay(100);
        await send('Runtime.evaluate',{expression:'Promise.all([...document.images].map(image=>image.decode()))',awaitPromise:true});
        const shot=await send('Page.captureScreenshot',{format:'png'});
        writeFileSync(join(work,profile+'-scene-'+index+'.png'),Buffer.from(shot.data,'base64'));
    }
    }
    await send('Browser.close');ws.close();
} finally { if(ws?.readyState===WebSocket.OPEN) ws.close(); browser.kill(); }

for (const profile of ['desktop', 'mobile']) {
const suffix = profile === 'mobile' ? '-mobile' : '';
const temporary = baseName+suffix+'-pending';
const args=['-nostdin','-y','-v','error'];
for(let i=0;i<slugs.length;i++) args.push('-loop','1','-framerate','24','-t','4','-i',join(work,profile+'-scene-'+i+'.png'));
const filters=['[0:v]format=yuv420p,setsar=1[v0]'];
for(let i=1;i<slugs.length;i++) filters.push(`[${i}:v]format=yuv420p,setsar=1[s${i}];[v${i-1}][s${i}]xfade=transition=fade:duration=0.4:offset=${(3.6*i).toFixed(1)}[v${i}]`);
args.push('-filter_complex_threads','1','-filter_complex',filters.join(';'),'-map','[v5]','-an','-c:v','libx264','-preset','fast','-crf','23','-threads','2','-pix_fmt','yuv420p','-movflags','+faststart',join(output,temporary+'.mp4'));
const encoding=spawnSync(ffmpeg,args,{windowsHide:true,timeout:240000,encoding:'utf8'});
if(encoding.status!==0) throw Error(encoding.stderr||String(encoding.error));
const poster=spawnSync(ffmpeg,['-nostdin','-y','-v','error','-i',join(output,temporary+'.mp4'),'-frames:v','1','-q:v','2',join(output,temporary+'-poster.jpg')],{windowsHide:true,timeout:30000,encoding:'utf8'});
if(poster.status!==0) throw Error(poster.stderr);
const webm=spawnSync(ffmpeg,['-nostdin','-y','-v','error','-i',join(output,temporary+'.mp4'),'-an','-c:v','libvpx-vp9','-b:v','0','-crf','36','-deadline','realtime','-cpu-used','6','-row-mt','1','-threads','2',join(output,temporary+'.webm')],{windowsHide:true,timeout:240000,encoding:'utf8'});
if(webm.status!==0) throw Error(webm.stderr);
for (const extension of ['.mp4','.webm','-poster.jpg']) renameSync(join(output,temporary+extension),join(output,baseName+suffix+extension));
}
console.log('Overview generated: 22 seconds, six first-party scenes, desktop/mobile MP4 and posters.');
