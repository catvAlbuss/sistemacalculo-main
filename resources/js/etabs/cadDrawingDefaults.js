import {AcDbLinetypeTableRecord} from '@mlightcad/data-model';

// A new SDK database starts with empty symbol tables. Populate missing defaults
// through the public API without replacing records from an imported drawing.
export function ensureCadDrawingDefaults(database) {
  if (!database) return;
  const tables = database.tables;
  const missing = {
    layer: !tables.layerTable.has('0'),
    lineType: tables.linetypeTable.numEntries === 0,
    textStyle: tables.textStyleTable.numEntries === 0,
    dimStyle: tables.dimStyleTable.numEntries === 0,
    layout: database.objects.layout.numEntries === 0,
  };
  if (Object.values(missing).some(Boolean)) database.createDefaultData(missing);
  // An imported file may contain some, but not all, standard linetypes.
  for (const name of ['ByBlock', 'ByLayer', 'Continuous']) {
    if (!tables.linetypeTable.has(name)) {
      tables.linetypeTable.add(new AcDbLinetypeTableRecord({name,standardFlag:0,description:'',totalPatternLength:0}));
    }
  }
  if (!tables.layerTable.has(database.clayer)) database.clayer = '0';
}

const subscriptions = new WeakMap();

export function installCadDrawingDefaults(manager) {
  if (!manager) return;
  if (subscriptions.has(manager)) return subscriptions.get(manager);
  const prepare = ({doc} = {}) => ensureCadDrawingDefaults((doc || manager.curDocument)?.database);
  const events = ['documentCreated', 'documentToBeActivated', 'documentActivated'];
  for (const name of events) manager.events[name].addEventListener(prepare);
  prepare(); // The initial documentCreated event fires inside the SDK constructor.
  const dispose = () => {
    for (const name of events) manager.events[name].removeEventListener(prepare);
    subscriptions.delete(manager);
  };
  subscriptions.set(manager, dispose);
  return dispose;
}
