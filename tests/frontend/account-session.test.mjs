import test from 'node:test';
import assert from 'node:assert/strict';
import { startAccountSession } from '../../resources/js/account-session.js';

function setup(request) {
  const listeners=new Map(), redirects=[];
  let tick, cancelled=false;
  const page={hidden:false,documentElement:{dataset:{accountPing:'/mi-cuenta/sesion',accountLogin:'/login?sesion=cerrada'}},addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
  const stop=startAccountSession({page,browser:{location:{assign:url=>redirects.push(url)}},request,every:(fn,ms)=>{assert.equal(ms,60000);tick=fn;return 1;},cancel:()=>{cancelled=true;}});
  return {page,redirects,listeners,tick:()=>tick(),stop,isCancelled:()=>cancelled};
}

test('a server-revoked session leaves the page once, without redirecting for ordinary errors',async()=>{
  let status=200;const fixture=setup(async()=>({status}));
  await fixture.tick();assert.equal(fixture.redirects.length,0);
  status=503;await fixture.tick();assert.equal(fixture.redirects.length,0);
  status=401;await fixture.tick();await fixture.tick();
  assert.deepEqual(fixture.redirects,['/login?sesion=cerrada']);
});

test('network outages keep the session view and allow a later successful check',async()=>{
  let offline=true;const fixture=setup(async()=>{if(offline)throw Error('offline');return {status:200};});
  await fixture.tick();offline=false;await fixture.tick();assert.equal(fixture.redirects.length,0);
});

test('hidden tabs pause polling and check revocation when returning to the page',async()=>{
  let calls=0;const fixture=setup(async()=>{calls++;return {status:401};});
  fixture.page.hidden=true;await fixture.tick();assert.equal(calls,0);
  fixture.page.hidden=false;fixture.listeners.get('visibilitychange')();await new Promise(r=>setImmediate(r));
  assert.equal(calls,1);assert.equal(fixture.redirects.length,1);
});

test('slow connections do not produce overlapping checks and cleanup stops polling',async()=>{
  let finish,calls=0;const fixture=setup(()=>{calls++;return new Promise(resolve=>{finish=resolve;});});
  const checking=fixture.tick();await fixture.tick();assert.equal(calls,1);
  fixture.stop();finish({status:401});await checking;await fixture.tick();
  assert.equal(fixture.redirects.length,0);assert.equal(fixture.isCancelled(),true);assert.equal(fixture.listeners.size,0);
});
