// Vuelca los elementos aplanados (aplanarModelo) de los DWG de entrenamiento a JSON, para
// que las pruebas de lectura y la evaluación de los 15 módulos no relean cada DWG (tarda
// decenas de segundos por archivo). Queda en storage/app/private/entrenamiento/cache/.
//
//   node scripts/agente/volcar-planos.mjs                 # todos los pares de pares.json
//   node scripts/agente/volcar-planos.mjs "<plano.dwg>"…  # archivos sueltos
import {readFileSync, writeFileSync, mkdirSync, existsSync, statSync} from 'node:fs';
import {join, basename} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {aplanarModelo} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {PLANOS as CARPETA_ENTRENAMIENTO} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';

const BASE = join(CARPETA_ENTRENAMIENTO, 'estructuras');
export const CACHE = join(CARPETA_ENTRENAMIENTO, 'cache');

export const rutaCache = (archivo) => join(CACHE, `${basename(archivo).replace(/\.(dwg|dxf)$/i, '')}.json`);

export function leerCache(archivo) {
  const c = rutaCache(archivo);
  return existsSync(c) ? JSON.parse(readFileSync(c, 'utf8')) : null;
}

async function main() {
  const forzar = process.argv.includes('--forzar');
  let archivos = process.argv.slice(2).filter((a) => a !== '--forzar');
  if (!archivos.length) {
    const pares = JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8'));
    archivos = paresDelManifiesto(BASE, pares, existsSync).flatMap((p) => [p.rutaArquitectura, p.rutaEstructura]);
  }
  mkdirSync(CACHE, {recursive: true});
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
  for (const archivo of archivos) {
    const destino = rutaCache(archivo);
    if (!forzar && existsSync(destino) && statSync(destino).mtimeMs > statSync(archivo).mtimeMs) { console.log(`ya está: ${basename(archivo)}`); continue; }
    const t0 = Date.now();
    const db = new dm.AcDbDatabase();
    const b = readFileSync(archivo);
    await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, /\.dxf$/i.test(archivo) ? dm.AcDbFileType.DXF : dm.AcDbFileType.DWG);
    const {items} = aplanarModelo(db.tables.blockTable.modelSpace.newIterator().toArray());
    // Coordenadas a 4 decimales: el JSON baja a la mitad sin perder nada útil.
    const r = (p) => (p ? {x: Math.round(p.x * 1e4) / 1e4, y: Math.round(p.y * 1e4) / 1e4} : p);
    const compacto = items.map((it) => ({...it, puntos: it.puntos?.map(r), centro: r(it.centro)}));
    writeFileSync(destino, JSON.stringify({archivo: basename(archivo), items: compacto}));
    console.log(`${basename(archivo)}: ${items.length} elementos (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
}

if (process.argv[1] && import.meta.url.endsWith(basename(process.argv[1]))) await main();
