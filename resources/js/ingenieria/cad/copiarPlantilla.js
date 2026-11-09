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
  // Textos que dependen del proyecto (p. ej. parámetros sísmicos): se reemplazan en la copia.
  if (ctx.textos) {
    if (typeof copia.contents === "string") { const t = ctx.textos(copia.contents); if (t !== copia.contents) { copia.contents = t; ctx.reemplazados++; } }
    else if (typeof copia.textString === "string") { const t = ctx.textos(copia.textString); if (t !== copia.textString) { copia.textString = t; ctx.reemplazados++; } }
  }
  if (String(entidad.dxfTypeName).toUpperCase() === "INSERT" && entidad.blockName) {
    copia.blockName = asegurarBloque(entidad.blockName, ctx);
  }
  return copia;
}

// Textos que cambian con los datos del proyecto dentro de un bloque (y sus anidados).
function textosQueCambian(nombre, ctx, vistos = new Set()) {
  if (!ctx.textos || vistos.has(nombre)) return [];
  vistos.add(nombre);
  const fuente = ctx.origen.tables.blockTable.getAt(nombre);
  if (!fuente) return [];
  return fuente.newIterator().toArray().flatMap((e) => {
    if (String(e.dxfTypeName).toUpperCase() === "INSERT" && e.blockName) return textosQueCambian(e.blockName, ctx, vistos);
    const t = typeof e.contents === "string" ? e.contents : typeof e.textString === "string" ? e.textString : null;
    return t !== null && ctx.textos(t) !== t ? [ctx.textos(t)] : [];
  });
}

// Firma corta de un texto (djb2) para nombrar las variantes de un bloque.
const firma = (s) => { let h = 5381; for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return h.toString(36); };

function asegurarBloque(nombre, ctx) {
  // Un bloque con textos del proyecto (p. ej. parámetros sísmicos) lleva la firma de esos
  // textos en el nombre: otro proyecto en el mismo dibujo no reutiliza los valores viejos.
  const cambios = textosQueCambian(nombre, ctx);
  const destinoNombre = nombreDestino(ctx.prefijo, nombre) + (cambios.length ? `_${firma(cambios.join("|"))}` : "");
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
// textos: función opcional texto → texto aplicada a cada TEXT/MTEXT copiado.
export function copiarDesdePlantilla({origen, destino, entidades, desplazamiento = {x: 0, y: 0}, escala = 1, prefijo = "PLT_", dm, textos = null}) {
  const ctx = {origen, destino, prefijo, dm, bloques: 0, textos, reemplazados: 0};
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
  return {entidades: copias.length, bloques: ctx.bloques, fallidas: ctx.fallidas ?? 0, textosReemplazados: ctx.reemplazados};
}
