import test from 'node:test';
import assert from 'node:assert/strict';
import {installNovaCadAbout} from '../../resources/js/etabs/product/installAbout.js';

class Command {constructor(){this.mode=8;this.recordsUndoStack=true;}}
function fixture(){
 const original={globalName:'ABOUT',localName:'ABOUT',execute(){}};
 const groups={ACAD:new Map([['ABOUT',original]]),USER:new Map()};
 const stack={lookupGlobalCmd:name=>groups.ACAD.get(name.toUpperCase())||groups.USER.get(name.toUpperCase()),removeCmd:(g,n)=>groups[g].delete(n.toUpperCase()),addCommand:(g,n,l,c)=>{c.globalName=n;c.localName=l;groups[g].set(n.toUpperCase(),c)}};
 return {original,manager:{commandManager:stack},groups};
}
test('NovaCad owns the product About action through the public registry and preserves the engine action for cleanup',()=>{
 const f=fixture(),opened=[];
 const dispose=installNovaCadAbout(f.manager,{CommandBase:Command,openAbout:()=>opened.push('NovaCad')});
 const command=f.manager.commandManager.lookupGlobalCmd('about');assert.notEqual(command,f.original);assert.equal(command.mode,0);assert.equal(command.recordsUndoStack,false);
 command.execute();assert.deepEqual(opened,['NovaCad']);
 assert.equal(installNovaCadAbout(f.manager,{CommandBase:Command,openAbout:()=>{}}),dispose,'idempotent installation');
 dispose();assert.equal(f.manager.commandManager.lookupGlobalCmd('about'),f.original);assert.equal(f.groups.USER.size,0);
});
