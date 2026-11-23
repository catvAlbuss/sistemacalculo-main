const installations = new WeakMap();

// Integración con el registro público. No altera vendor ni avisos de licencia.
export function installNovaCadAbout(manager, {CommandBase, openAbout}) {
  if (installations.has(manager)) return installations.get(manager);
  const stack = manager.commandManager;
  const original = stack.lookupGlobalCmd('about');
  class NovaCadAbout extends CommandBase {
    constructor() {super();this.mode = 0;this.recordsUndoStack = false;}
    execute() {openAbout();}
  }
  if (original) stack.removeCmd('ACAD','ABOUT');
  try {stack.addCommand('USER','ABOUT','ABOUT',new NovaCadAbout());}
  catch (error) {if (original) stack.addCommand('ACAD','ABOUT',original.localName || 'ABOUT',original);throw error;}
  let active = true;
  const dispose = () => {
    if (!active) return;
    active = false;stack.removeCmd('USER','ABOUT');
    if (original) stack.addCommand('ACAD','ABOUT',original.localName || 'ABOUT',original);
    installations.delete(manager);
  };
  installations.set(manager, dispose);
  return dispose;
}
