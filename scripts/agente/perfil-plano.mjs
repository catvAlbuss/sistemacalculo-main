// Tiempo y memoria de cada etapa con un plano (para planos pesados):
//   node scripts/agente/perfil-plano.mjs "<plano.dwg>"
import {readFileSync, statSync} from 'node:fs';
import * as dm from '@mlightcad/data-model';
import {aplanarModelo, detectarVistas, leerVista} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
const ruta = process.argv[2];
const t = () => performance.now();
const mb = () => Math.round(process.memoryUsage().heapUsed / 1e6);
const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
let t0 = t();
const db = new dm.AcDbDatabase();
const b = readFileSync(ruta);
await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
const fase = (n) => { const t1 = t(); console.log(`${n}: ${Math.round(t1 - t0)} ms, ${mb()} MB`); t0 = t1; };
fase(`leer DWG (${(statSync(ruta).size / 1e6).toFixed(1)} MB)`);
const {items} = aplanarModelo(db.tables.blockTable.modelSpace.newIterator().toArray());
fase(`aplanar (${items.length} elementos)`);
const vistas = detectarVistas(items);
fase(`vistas (${vistas.length})`);
for (const v of vistas) leerVista(items, v, v.radio >= 40 ? 1000 : v.radio >= 4 ? 100 : 1);
fase('leer columnas de todas las vistas');
