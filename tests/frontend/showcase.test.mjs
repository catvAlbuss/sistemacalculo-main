import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { build } from 'vite';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
test('video loading respects viewport, mobile, manual pause, reduced motion and data saver', {skip: !existsSync(chrome), timeout: 60000}, async () => {
 const entry = `
 import {initShowcase} from './resources/js/showcase.js';
 (async () => {
  if(document.readyState==='loading') await new Promise(r=>document.addEventListener('DOMContentLoaded',r,{once:true}));
  const check=(condition,label)=>{if(!condition)throw Error(label);};
  let mobile=false, reduced=false, saveData=false;
  const observers=[];
  window.IntersectionObserver=class {constructor(callback){this.callback=callback;observers.push(this);}observe(){}fire(visible){this.callback([{isIntersecting:visible}]);}};
  window.matchMedia=query=>({matches:query.includes('reduced-motion')?reduced:mobile,addEventListener(){}});
  Object.defineProperty(navigator,'connection',{get:()=>({saveData}),configurable:true});
  Object.defineProperty(HTMLMediaElement.prototype,'paused',{get(){return !this._playing;},configurable:true});
  HTMLMediaElement.prototype.load=function(){this.loads=(this.loads||0)+1;};
  HTMLMediaElement.prototype.play=async function(){this._playing=true;this.plays=(this.plays||0)+1;this.dispatchEvent(new Event('play'));};
  HTMLMediaElement.prototype.pause=function(){this._playing=false;this.dispatchEvent(new Event('pause'));};
  const setup=(ambient=true,backup=false)=>{
   document.body.innerHTML='<main class="sc-page"><div data-media><video '+(ambient?'data-ambient':'controls')+' preload="none"><source media="(max-width:767px)" data-src="https://example.test/mobile.mp4"><source data-src="https://example.test/desktop.mp4">'+(backup?'<source data-src="https://example.test/desktop.webm" type="video/webm">':'')+'</video><button data-video-toggle><span data-video-label></span></button><p data-video-error hidden></p></div></main>';
   initShowcase();return {video:document.querySelector('video'),button:document.querySelector('button'),observer:observers.at(-1)};
  };
  let x=setup();check(!x.video.src,'nothing downloads before visibility');x.observer.fire(true);
  check(x.video.src.endsWith('desktop.mp4') && x.video.plays===1,'visible hero loads desktop once');
  check(getComputedStyle(x.video).opacity==='1' && getComputedStyle(x.video).filter==='none','video has no opacity or filters');
  x.observer.fire(false);check(x.video.paused,'offscreen pauses');x.observer.fire(true);check(x.video.loads===1,'source is loaded only once');
  x.button.click();check(x.video.paused,'manual pause');x.observer.fire(false);x.observer.fire(true);check(x.video.paused,'scroll does not override manual pause');
  mobile=true;x=setup();x.observer.fire(true);check(x.video.src.endsWith('mobile.mp4'),'only mobile variant selected');
  reduced=true;x=setup();x.observer.fire(true);check(!x.video.src,'reduced motion prevents automatic loading');x.button.click();check(x.video.plays===1,'manual playback remains available');
  reduced=false;saveData=true;x=setup();x.observer.fire(true);check(!x.video.src,'data saver prevents automatic download');
  saveData=false;x=setup(false);x.observer.fire(true);check(!x.video.src,'trailers never autoplay');x.button.click();check(x.video.plays===1,'trailer loads on demand');
  x.video.dispatchEvent(new Event('error'));check(!document.querySelector('[data-video-error]').hidden,'failure message available');


  mobile=false;x=setup(false,true);x.button.click();x.video.dispatchEvent(new Event('error'));
  check(x.video.src.endsWith('desktop.webm') && document.querySelector('[data-video-error]').hidden,'codec failure switches to WebM before showing an error');
  x.video.dispatchEvent(new Event('error'));check(x.video.hidden && !document.querySelector('[data-video-error]').hidden,'all failures retain the poster instead of black video');

  const players=[];
  window.YT={Player:class {
   constructor(iframe,options){this.options=options;this.iframe=iframe;players.push(this);queueMicrotask(()=>options.events.onReady({target:this}));}
   getIframe(){return this.iframe;}playVideo(){this.played=(this.played||0)+1;}pauseVideo(){this.paused=true;}mute(){this.muted=true;}
  }};
  const youtube=(hero=false)=>{
   document.body.innerHTML='<div data-youtube="M7lc1UVf-VE" '+(hero?'data-youtube-hero':'')+'><iframe data-youtube-frame src="about:blank" title="Demo"></iframe><p data-youtube-error hidden></p></div>';
   const frame=document.querySelector('iframe');initShowcase();return {frame,observer:observers.at(-1)};
  };
  let yt=youtube();check(players.length===0,'native inline embed exists before API attachment');yt.observer.fire(true);await new Promise(r=>setTimeout(r,0));
  check(!players.at(-1).played,'product demonstration waits for the native play button');
  check(document.querySelector('iframe')===yt.frame,'attaching the API preserves the inline player');
  yt.observer.fire(false);check(players.at(-1).paused,'inline player pauses offscreen');
  yt=youtube(true);yt.observer.fire(true);await new Promise(r=>setTimeout(r,0));
  check(players.at(-1).played===1 && players.at(-1).muted,'hero montage starts muted');
  players.at(-1).options.events.onStateChange({data:2});yt.observer.fire(false);yt.observer.fire(true);
  check(players.at(-1).played===1,'scroll respects manual pause of montage');
  reduced=true;yt=youtube(true);yt.observer.fire(true);await new Promise(r=>setTimeout(r,0));
  check(!players.at(-1).played,'reduced motion stops YouTube hero autoplay');
  reduced=false;saveData=true;yt=youtube(true);yt.observer.fire(true);await new Promise(r=>setTimeout(r,0));
  check(!players.at(-1).played,'data saver stops YouTube hero autoplay');
  players.at(-1).options.events.onError({data:100});check(!document.querySelector('[data-youtube-error]').hidden,'YouTube unavailable message');
  document.body.innerHTML='<pre id="result">PASS</pre>';
 })().catch(error=>{document.body.innerHTML='<pre id="result">FAIL: '+error.stack+'</pre>';});
 `;
 const virtual=resolve('showcase-browser-test.js').replaceAll('\\','/');
 const bundle=await build({configFile:false,logLevel:'error',plugins:[{name:'showcase-browser-test',enforce:'pre',resolveId:id=>id.endsWith('showcase-browser-test.js')?virtual:undefined,load:id=>id===virtual?entry:undefined}],build:{write:false,minify:false,lib:{entry:virtual,formats:['iife'],name:'ShowcaseTest'}}});
 const dir=mkdtempSync(join(tmpdir(),'showcase-test-'));
 try{
  const output=Array.isArray(bundle)?bundle[0].output:bundle.output;
  const code=output.find(x=>x.type==='chunk').code;
  const css=readFileSync('resources/css/showcase.css','utf8');
  const path=join(dir,'test.html');writeFileSync(path,'<meta charset="utf-8"><style>'+css+'</style><body><script>'+code.replaceAll('</script','<\\/script')+'</script>');
  const result=spawnSync(chrome,['--headless','--no-sandbox','--disable-gpu','--no-first-run','--disable-background-networking','--user-data-dir='+join(dir,'profile'),'--dump-dom','--virtual-time-budget=3000',pathToFileURL(path).href],{encoding:'utf8',windowsHide:true,timeout:45000,maxBuffer:5*1024*1024});
  assert.ifError(result.error);const status=result.stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1];assert.equal(status,'PASS',status||result.stderr.slice(-1500));
 }finally{assert.ok(resolve(dir).startsWith(resolve(tmpdir())+sep));rmSync(dir,{recursive:true,force:true});}
});
