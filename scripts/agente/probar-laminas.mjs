// Prueba de generalización completa: corre la herramienta plano_estructuras (la misma
// que usa el chat) sobre una arquitectura cualquiera, con la plantilla del despacho, y
// guarda una vista previa SVG de las láminas generadas para compararlas con el
// expediente del ingeniero.
//
//   node scripts/agente/probar-laminas.mjs "<arquitectura.dwg>" "<vista>" [salida.svg] [platea|zapatas|auto]

import {readFileSync, writeFileSync} from 'node:fs';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {aplanarModelo} from '../../resources/js/ingenieria/lectura/lectorPlano.js';

const [ruta, vista, salida, cimentacion] = process.argv.slice(2);
if (!ruta || !vista) { console.error('Uso: node scripts/agente/probar-laminas.mjs <arquitectura.dwg> <vista> [salida.svg] [cimentacion]'); process.exit(1); }

const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
const leer = async (archivo, tipo) => {
  const db = new dm.AcDbDatabase();
  const b = readFileSync(archivo);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, tipo);
  return db;
};
const db = await leer(ruta, dm.AcDbFileType.DWG);
const cargarPlantilla = async () => ({db: await leer('public/assets/plantillas/estructuras-laminas.dxf', dm.AcDbFileType.DXF), config: JSON.parse(readFileSync('public/assets/plantillas/estructuras-laminas.json', 'utf8'))});

const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: cargarPlantilla});
const antes = db.tables.blockTable.modelSpace.newIterator().toArray().length;
const t0 = Date.now();
const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({vista, ...(cimentacion ? {cimentacion} : {})}, ctx);
console.log(`(${Date.now() - t0} ms)`, JSON.stringify(r, null, 1));

if (salida && r.ok) {
  const nuevas = db.tables.blockTable.modelSpace.newIterator().toArray().slice(antes);
  const {items} = aplanarModelo(nuevas);
  const pts = items.flatMap((it) => it.puntos ?? [it.centro]).filter((p) => p && Number.isFinite(p.x));
  const xs = pts.map((p) => p.x).sort((a, b) => a - b), ys = pts.map((p) => p.y).sort((a, b) => a - b);
  const x0 = xs[0], x1 = xs.at(-1), y0 = ys[0], y1 = ys.at(-1);
  const W = 4000, f = W / (x1 - x0), H = Math.ceil((y1 - y0) * f);
  const X = (x) => ((x - x0) * f).toFixed(1), Y = (y) => ((y1 - y) * f).toFixed(1);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const partes = items.map((it) => {
    if (it.tipo === 'linea' || it.tipo === 'poli') return `<polyline points="${it.puntos.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')}${it.cerrada ? ` ${X(it.puntos[0].x)},${Y(it.puntos[0].y)}` : ''}"/>`;
    if (it.tipo === 'circulo') return `<circle cx="${X(it.centro.x)}" cy="${Y(it.centro.y)}" r="${(it.radio * f).toFixed(1)}"/>`;
    if (it.tipo === 'texto' && it.texto) return `<text x="${X(it.centro.x)}" y="${Y(it.centro.y)}" font-size="${Math.max(1, it.alto * f).toFixed(1)}">${esc(it.texto)}</text>`;
    return '';
  });
  writeFileSync(salida, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="#fff"/><g fill="none" stroke="#000" stroke-width="0.6">${partes.filter((p) => !p.startsWith('<text')).join('')}</g><g font-family="Arial" fill="#000">${partes.filter((p) => p.startsWith('<text')).join('')}</g></svg>`);
  console.log(`Vista previa: ${salida} (${items.length} elementos)`);
}
