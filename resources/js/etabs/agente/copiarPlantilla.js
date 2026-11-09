// Copia dibujos de una plantilla DWG (otra base de datos) al dibujo abierto:
// capas, estilos de texto/cota/línea y bloques anidados se recrean en el destino
// para que el resultado quede dentro del mismo archivo (no como referencia externa).
// Los bloques de la plantilla se renombran con un prefijo para no chocar con los
// del dibujo abierto (y los anónimos *U, *D pasan a ser bloques con nombre).

const nombreDestino = (prefijo, nombre) => `${prefijo}${String(nombre).replace(/^\*/, "")}`;

function asegurarRegistro(tablaOrigen, tablaDestino, nombre) {
  if (!nombre || tablaDestino.has(nombre)) return;
  const registro = tablaOrigen.getAt(nombre);
  if (registro) tablaDestino.add(registro.clone());
}

// Una entidad clonada con sus dependencias (capa, estilos, bloque) ya en el destino.
function prepararEntidad(entidad, ctx) {
  const {origen, destino} = ctx;
  asegurarRegistro(origen.tables.layerTable, destino.tables.layerTable, entidad.layer);
  if (entidad.lineType) asegurarRegistro(origen.tables.linetypeTable, destino.tables.linetypeTable, entidad.lineType);
  if (entidad.styleName) asegurarRegistro(origen.tables.textStyleTable, destino.tables.textStyleTable, entidad.styleName);
  if (entidad.dimensionStyleName) asegurarRegistro(origen.tables.dimStyleTable, destino.tables.dimStyleTable, entidad.dimensionStyleName);
  const copia = entidad.clone();
  if (String(entidad.dxfTypeName).toUpperCase() === "INSERT" && entidad.blockName) {
    copia.blockName = asegurarBloque(entidad.blockName, ctx);
  }
  return copia;
}

function asegurarBloque(nombre, ctx) {
  const destinoNombre = nombreDestino(ctx.prefijo, nombre);
  const {origen, destino, dm} = ctx;
  if (destino.tables.blockTable.has(destinoNombre)) return destinoNombre;
  const fuente = origen.tables.blockTable.getAt(nombre);
  if (!fuente) return nombre;
  const registro = new dm.AcDbBlockTableRecord();
  registro.name = destinoNombre;
  if (fuente.origin) registro.origin = fuente.origin.clone ? fuente.origin.clone() : fuente.origin;
  // Se registra antes de llenarlo para cortar ciclos de bloques anidados.
  destino.tables.blockTable.add(registro);
  const hijos = fuente.newIterator().toArray().map((e) => prepararEntidad(e, ctx)).filter(Boolean);
  if (hijos.length) registro.appendEntity(hijos);
  ctx.bloques++;
  return destinoNombre;
}

// entidades: del espacio modelo de la plantilla. desplazamiento en unidades del dibujo.
export function copiarDesdePlantilla({origen, destino, entidades, desplazamiento = {x: 0, y: 0}, escala = 1, prefijo = "PLT_", dm}) {
  const ctx = {origen, destino, prefijo, dm, bloques: 0};
  const mover = dm.AcGeMatrix3d.makeTranslation(desplazamiento.x, desplazamiento.y, 0);
  const copias = [];
  for (const entidad of entidades) {
    try {
      const copia = prepararEntidad(entidad, ctx);
      if (escala !== 1) copia.transformBy(dm.AcGeMatrix3d.makeScale ? dm.AcGeMatrix3d.makeScale(escala, escala, escala) : new dm.AcGeMatrix3d().makeScale(escala, escala, escala));
      copia.transformBy(mover);
      copias.push(copia);
    } catch (error) {
      ctx.fallidas = (ctx.fallidas ?? 0) + 1;
    }
  }
  if (copias.length) destino.tables.blockTable.modelSpace.appendEntity(copias);
  return {entidades: copias.length, bloques: ctx.bloques, fallidas: ctx.fallidas ?? 0};
}
