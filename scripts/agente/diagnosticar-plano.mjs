// Diagnóstico de importación de un DWG de arquitectura (lo mismo que muestra el panel del
// agente al abrir un plano): qué lee, qué no y si está listo para estructurar.
//
//   node scripts/agente/diagnosticar-plano.mjs "<arquitectura.dwg>" [más.dwg…]

import {readFileSync} from 'node:fs';
import {basename} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {aplanarModelo, detectarVistas} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {diagnosticarLectura} from '../../resources/js/ingenieria/lectura/diagnostico.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';

const rutas = process.argv.slice(2);
if (!rutas.length) { console.error('Uso: node scripts/agente/diagnosticar-plano.mjs <arquitectura.dwg> [más.dwg…]'); process.exit(1); }
const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});

// El lector DWG solo avisa su código de error por consola: se captura para el diagnóstico.
let codigoDwg = 0;
const avisar = console.warn;
console.warn = (...a) => { if (/Open dwg file with error code/.test(String(a[0]))) codigoDwg = Number(a[1]) || 0; else avisar(...a); };
for (const ruta of rutas) {
  codigoDwg = 0;
  const db = new dm.AcDbDatabase();
  const buf = readFileSync(ruta);
  await db.read(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  const apagadas = new Set(db.tables.layerTable.newIterator().toArray().filter((c) => c.isOff || c.isFrozen).map((c) => c.name));
  const {items} = aplanarModelo(db.tables.blockTable.modelSpace.newIterator().toArray(), {capasApagadas: apagadas});
  const d = diagnosticarLectura({database: db, items, vistas: detectarVistas(items), codigoDwg});
  console.log(`\n=== ${basename(ruta)} → ${d.estado.toUpperCase()}: ${d.resumen}`);
  console.log(`unidades ${d.unidades}; ${d.entidades.total} entidades (${d.entidades.leidas} leídas, ${d.entidades.informativas} anotación/relleno, ${d.entidades.proxies} proxy); ${d.textos} textos; niveles NPT ${d.niveles.join(', ') || '—'}`);
  console.log(`tipos: ${d.entidades.porTipo.map(([t, n]) => `${t}:${n}`).join(', ')}`);
  for (const v of d.vistas) console.log(`  · ${v.titulo}: ejes ${v.ejes.join(',')} | ${v.columnas} columnas (${v.tipos} tipos) | ${v.columnetas} columnetas${v.error ? ` | ERROR ${v.error}` : ''}`);
  for (const p of d.problemas) console.log(`  ✕ ${p.texto}\n    → ${p.arreglo}`);
  for (const a of d.avisos) console.log(`  ! ${a}`);
}
