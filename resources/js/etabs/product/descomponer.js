// DESCOMPONER (EXPLODE de AutoCAD), que el visor base no trae: un bloque insertado (columna, puerta,
// mueble del arquitecto) se reemplaza por sus entidades en su posición real, para poder seleccionar y
// editar cada parte. Un nivel por vez, como AutoCAD. Los atributos pasan a textos. Un bloque recortado
// (XCLIP: el terreno de la viñeta de ubicación) no se descompone: soltaría el terreno entero.

// database: la del dibujo; ids: los objectId seleccionados. Devuelve lo que hizo.
export function descomponerBloques(database, ids, {dm, recortado = () => false}) {
  const modelo = database.tables.blockTable.modelSpace;
  const nuevos = [], quitar = [];
  let omitidos = 0, recortados = 0;
  for (const id of ids) {
    const e = modelo.getIdAt(id);
    if (!(e instanceof dm.AcDbBlockReference)) { omitidos++; continue; }
    if (recortado(e)) { recortados++; continue; }
    const registro = database.tables.blockTable.getAt(e.blockName);
    if (!registro) { omitidos++; continue; }
    const M = e.blockTransform;
    for (const hijo of registro.newIterator()) {
      // Los atributos definidos en el bloque (ATTDEF) no se dibujan: los valores van abajo.
      if (String(hijo.dxfTypeName).toUpperCase() === "ATTDEF") continue;
      const copia = hijo.clone();
      copia.transformBy(M);
      nuevos.push(copia);
    }
    for (const a of e.attributeIterator?.() ?? []) {
      const t = new dm.AcDbText();
      t.textString = a.textString;
      t.position = a.position;
      t.height = a.height;
      t.rotation = a.rotation ?? 0;
      t.layer = a.layer;
      nuevos.push(t);
    }
    quitar.push(id);
  }
  if (quitar.length) modelo.removeEntity(quitar);
  if (nuevos.length) modelo.appendEntity(nuevos);
  return {bloques: quitar.length, entidades: nuevos.length, omitidos, recortados};
}

// Registra DESCOMPONER (y EXPLODE) en el visor. Selecciona primero los bloques y ejecútalo, o usa el
// botón «Descomponer» del grupo NovaCad.
export function installDescomponer(manager, {CommandBase, dm, recortado, modoEscritura}) {
  const stack = manager.commandManager;
  class NovaCadDescomponer extends CommandBase {
    constructor() { super(); this.mode = modoEscritura; }
    async execute(ctx) {
      const seleccion = ctx.view.selectionSet;
      const ids = seleccion.count > 0 ? [...seleccion.ids] : [];
      if (!ids.length) { this.showMessage?.("Selecciona primero los bloques (columna, puerta…) y vuelve a pulsar Descomponer.", "warning"); return; }
      const r = descomponerBloques(ctx.doc.database, ids, {dm, recortado});
      seleccion.clear();
      const partes = [`${r.bloques} bloque(s) descompuesto(s) en ${r.entidades} entidades`];
      if (r.recortados) partes.push(`${r.recortados} recortado(s) sin tocar (plano de ubicación)`);
      if (r.omitidos) partes.push(`${r.omitidos} no eran bloques`);
      this.showMessage?.(`${partes.join(" · ")}.`, r.bloques ? "success" : "warning");
    }
  }
  for (const nombre of ["DESCOMPONER", "EXPLODE"]) {
    try { stack.addCommand("USER", nombre, nombre, new NovaCadDescomponer()); } catch { /* ya registrado */ }
  }
}
