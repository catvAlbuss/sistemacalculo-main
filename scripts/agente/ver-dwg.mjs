// Vista previa PNG/SVG de un DWG/DXF (o de sus vistas con grilla de ejes), para comparar a
// ojo el plano del ingeniero con el que genera el agente.
//
//   node scripts/agente/ver-dwg.mjs "<plano.dwg>" <carpeta-salida> [filtro-de-titulo]
//
// Escribe una imagen por vista detectada (y "todo.svg" con el dibujo entero). Con Edge
// instalado también convierte cada SVG a PNG (headless).
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import * as dm from '@mlightcad/data-model';
import {aplanarModelo, detectarVistas} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';

const [ruta, carpeta, filtro] = process.argv.slice(2);
if (!ruta || !carpeta) { console.error('Uso: node scripts/agente/ver-dwg.mjs <plano.dwg> <carpeta> [filtro]'); process.exit(1); }
mkdirSync(carpeta, {recursive: true});

const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const db = new dm.AcDbDatabase();
const b = readFileSync(ruta);
await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, /\.dxf$/i.test(ruta) ? dm.AcDbFileType.DXF : dm.AcDbFileType.DWG);
const {items} = aplanarModelo(db.tables.blockTable.modelSpace.newIterator().toArray());

const edge = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);

export function svgDeCaja(items, caja, W = 2400) {
  const {x0, y0, x1, y1} = caja;
  const f = W / (x1 - x0), H = Math.ceil((y1 - y0) * f);
  const X = (x) => ((x - x0) * f).toFixed(1), Y = (y) => ((y1 - y) * f).toFixed(1);
  const dentro = (p) => p && p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const lin = [], txt = [];
  for (const it of items) {
    const pts = it.puntos ?? (it.centro ? [it.centro] : []);
    if (!pts.some(dentro)) continue;
    if ((it.tipo === 'linea' || it.tipo === 'poli') && it.puntos?.length) lin.push(`<polyline points="${it.puntos.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')}${it.cerrada ? ` ${X(it.puntos[0].x)},${Y(it.puntos[0].y)}` : ''}"/>`);
    else if (it.tipo === 'circulo') lin.push(`<circle cx="${X(it.centro.x)}" cy="${Y(it.centro.y)}" r="${(it.radio * f).toFixed(1)}"/>`);
    else if (it.tipo === 'texto' && it.texto) txt.push(`<text x="${X(it.centro.x)}" y="${Y(it.centro.y)}" font-size="${Math.max(1, (it.alto ?? 0.1) * f).toFixed(1)}" text-anchor="middle">${esc(it.texto)}</text>`);
  }
  return {svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="#fff"/><g fill="none" stroke="#000" stroke-width="0.7">${lin.join('')}</g><g font-family="Arial" fill="#c00">${txt.join('')}</g></svg>`, W, H};
}

const guardar = (nombre, caja) => {
  const {svg, W, H} = svgDeCaja(items, caja);
  const s = join(carpeta, `${nombre}.svg`);
  writeFileSync(s, svg);
  if (edge) {
    const png = join(carpeta, `${nombre}.png`);
    try { execFileSync(edge, ['--headless', '--disable-gpu', `--screenshot=${png}`, `--window-size=${W},${Math.min(H, 6000)}`, `file:///${s.replace(/\\/g, '/')}`], {stdio: 'ignore', timeout: 60000}); } catch { /* sin PNG */ }
  }
  console.log(`${nombre}: ${s}`);
};

const vistas = detectarVistas(items);
const limpio = (t) => String(t || 'sin-titulo').replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 50);
vistas.forEach((v, i) => {
  if (filtro && !new RegExp(filtro, 'i').test(v.titulo)) return;
  const m = (v.radio || 0.3) * 4;
  guardar(`${String(i).padStart(2, '0')}-${limpio(v.titulo)}`, {x0: v.caja.x0 - m, y0: v.caja.y0 - m * 2, x1: v.caja.x1 + m, y1: v.caja.y1 + m});
});
if (!filtro) {
  const pts = items.flatMap((it) => it.puntos ?? [it.centro]).filter((p) => p && Number.isFinite(p.x));
  const xs = pts.map((p) => p.x).sort((a, c) => a - c), ys = pts.map((p) => p.y).sort((a, c) => a - c);
  const q = (a, t) => a[Math.floor(t * (a.length - 1))];
  guardar('todo', {x0: q(xs, 0.002), y0: q(ys, 0.002), x1: q(xs, 0.998), y1: q(ys, 0.998)});
}
console.log(`${vistas.length} vistas: ${vistas.map((v) => v.titulo).join(' | ')}`);
