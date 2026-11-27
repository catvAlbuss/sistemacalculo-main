// El visor abre el espacio que el archivo trae guardado como activo (como AutoCAD): un plano guardado
// en una presentación (MIV-05…) abre en esa presentación. Las láminas del agente se dibujan en el
// espacio modelo: antes de encuadrarlas hay que pasar a Model o el ingeniero ve la pantalla en blanco.
export function irAlModelo(dm, db) {
  try {
    const id = db?.tables?.blockTable?.modelSpace?.objectId;
    if (!id || db.currentSpaceId === id) return false;
    return Boolean(dm.acdbHostApplicationServices?.()?.layoutManager?.setCurrentLayoutBtrId(id, db));
  } catch {
    return false;
  }
}
