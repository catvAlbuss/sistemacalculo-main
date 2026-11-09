// Prueba de generalización: abre una planta de arquitectura que el agente no conoce y
// muestra lo que entiende de ella (vistas, ejes, columnas, columnetas, muros, vanos),
// sin dibujar nada. Sirve para ver qué falla antes de pedirle las láminas.
//
//   node scripts/agente/leer-arquitectura.mjs "<arquitectura.dwg>" [filtro de vista]

import {readFileSync, writeFileSync} from 'node:fs';
import * as dm from '@mlightcad/data-model';
import {aplanarModelo, detectarVistas, leerVista} from '../../resources/js/etabs/agente/lectorPlano.js';

const [ruta, filtro] = process.argv.slice(2);
if (!ruta) { console.error('Uso: node scripts/agente/leer-arquitectura.mjs <arquitectura.dwg> [vista]'); process.exit(1); }

const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
const db = new dm.AcDbDatabase();
const buf = readFileSync(ruta);
await db.read(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);

const {items, bloques} = aplanarModelo(db.tables.blockTable.modelSpace.newIterator().toArray());
// AGENTE_VOLCAR=<archivo.json> guarda los elementos aplanados para analizarlos sin reabrir el DWG.
if (process.env.AGENTE_VOLCAR) writeFileSync(process.env.AGENTE_VOLCAR, JSON.stringify(items));
const capas = {};
for (const it of items) capas[it.capa] = (capas[it.capa] ?? 0) + 1;
console.log(`${items.length} entidades, ${bloques.size} bloques, ${Object.keys(capas).length} capas`);
console.log('Capas más usadas:', Object.entries(capas).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([c, n]) => `${c}(${n})`).join(', '));

const vistas = detectarVistas(items);
console.log(`\n${vistas.length} vistas:`);
for (const v of vistas) console.log(`  - ${v.titulo}`);

for (const v of vistas.filter((x) => !filtro || new RegExp(filtro, 'i').test(x.titulo))) {
  try {
    const l = leerVista(items, v);
    console.log(`\n=== ${v.titulo}`);
    console.log(`ejes (${l.ejes.length}): ${l.ejes.map((e) => e.nombre + (e.inclinado ? '(incl)' : '')).join(', ')}`);
    console.log(`columnas (${l.columnas.length}): ${l.columnas.map((c) => `${c.eje ?? '?'} ${c.tipo ?? ''} ${c.forma ?? ''} ${c.b}x${c.h}`).join('; ')}`);
    console.log(`tipos: ${(l.tipos ?? []).map((t) => `${t.nombre ?? t.tipo} ${t.forma ?? ''} ${t.b}x${t.h} (${t.cantidad ?? t.n ?? ''})`).join('; ')}`);
    console.log(`columnetas: ${l.columnetas}`);
    const otros = Object.keys(l).filter((k) => !['ejes', 'columnas', 'tipos', 'columnetas'].includes(k));
    console.log(`otros campos: ${otros.map((k) => `${k}=${Array.isArray(l[k]) ? l[k].length : typeof l[k] === 'object' ? 'obj' : l[k]}`).join(', ')}`);
  } catch (e) {
    console.log(`\n=== ${v.titulo}: ERROR ${e.message}`);
  }
}
