// Contenido de las láminas: de los planos, cuadros y detalles que pone el ingeniero en cada módulo,
// cuáles pone también el agente (por los títulos dibujados). Complementa a evaluar-dibujo.mjs,
// que mide la geometría de las plantas; esta mide si la lámina "trae lo mismo".
//
//   node scripts/agente/evaluar-contenido.mjs [filtro]
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {textoLimpio} from '../../resources/js/ingenieria/agente/coherencia.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa, cargarDetallesEstandar, cargarCortesDespacho} from './plantilla.mjs';
import {leerCache} from './volcar-planos.mjs';

// Qué es cada cosa de la lámina, por las palabras de su título (las del despacho).
export const CONTENIDOS = [
  ['planta de cimentación', /PLANO\s+(DE\s+)?(PLATEA|CIMENTACI|ZAPATAS)/],
  ['planta de cimiento corrido', /CIMIENTO\s+CORRIDO/],
  ['cortes de cimiento', /^(.*-\s*)?CORTE\s+[A-Z0-9]{1,3}\s*-\s*[A-Z0-9]{1,3}/],
  ['planta de losa', /PLANO\s+DE\s+(LOSA|ALIGERAD)/],
  ['pórticos', /P[OÓ]RTICO/],
  ['cuadro de columnas', /CUADRO\s+DE\s+(COLUMNAS?|PLACAS?)\b/],
  ['cuadro de columnetas', /CUADRO\s+DE\s+COLUMNETAS?/],
  ['cuadro de vigas', /CUADRO\s+DE\s+VIGAS?\b/],
  ['cuadro de viguetas', /CUADRO\s+DE\s+VIGUETAS?/],
  ['especificaciones técnicas', /ESPECIFICACIONES\s+T[EÉ]CNICAS/],
  ['empalmes', /EMPALME|UBICACI[OÓ]N\s+Y\s+LONGITUD/],
  ['estribos', /DETALLE\s+DE\s+ESTRIBOS/],
  ['nudo viga-columna', /DETALLE\s+DEL\s+REFUERZO/],
  ['encuentros en planta', /ENCUENTROS\s+EN\s+PLANTA/],
  ['recubrimientos viga-losa', /RECUBRIMIENTOS/],
  ['detalle de aligerado', /DETALLE\s+(T[IÍ]PICO\s+)?(DE\s+)?ALIGERADO|ISOM[EÉ]TRICO/],
  ['ladrillo-mortero', /LADRILLO\s*-\s*MORTERO/],
  ['leyenda', /^LEYENDA$/],
  ['junta sísmica', /JUNTA\s+S[IÍ]SMICA/],
  ['escalera', /ESCALERA/],
  ['canaleta', /CANALETA/],
  ['tabiquería', /TABIQUER/],
];
const norm = (t) => textoLimpio(t).normalize('NFC').toUpperCase().trim();
// Solo títulos: textos de al menos la mitad del alto de los títulos de plano del mismo dibujo
// (una palabra dentro de una nota o de las especificaciones no cuenta como el detalle).
const mediana = (xs) => { const a = xs.filter((x) => x > 0).sort((p, q) => p - q); return a.length ? a[a.length >> 1] : 0; };
export function contenidosDe(textos) {
  const ts = textos.map(({t, h}) => ({t: norm(t), h: Number(h) || 0})).filter((x) => x.t && x.t.length < 90);
  const hTitulo = mediana(ts.filter((x) => /PLANO\s+DE|P[OÓ]RTICO|CUADRO\s+DE/.test(x.t)).map((x) => x.h));
  const titulos = ts.filter((x) => x.h >= 0.5 * hTitulo);
  return new Set(CONTENIDOS.filter(([, re]) => titulos.some((x) => re.test(x.t))).map(([n]) => n));
}

const filtro = process.argv[2];
const BASE = join(PLANOS, 'estructuras');
const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync)
  .filter((p) => !p.holdout && (!filtro || `${p.grupo}/${p.id}`.includes(filtro)));
const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const DATOS = {hz: '0.60', df: '2.00', zona: '3', suelo: 'S2', categoria: 'A2', normaE030: '2018'};
const estandar = cargarDetallesEstandar();
const cortesDespacho = cargarCortesDespacho();
const faltas = new Map();
let suma = 0, n = 0;
for (const p of pares) {
  const ing = leerCache(p.rutaEstructura);
  if (!ing) continue;
  const delIngeniero = contenidosDe(ing.items.filter((i) => i.tipo === 'texto').map((i) => ({t: i.texto, h: i.alto})));
  if (!delIngeniero.size) continue;
  try {
    const db = new dm.AcDbDatabase(); const b = readFileSync(p.rutaArquitectura);
    await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
    const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: cargarPlantillaAdaptativa, getProjectData: () => ({...DATOS}), setProjectData: () => {}, afterDraw: () => {}});
    ctx.memoria ??= {}; ctx.detallesEstandar = estandar; ctx.bibliotecaDetalles = cortesDespacho;
    const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx);
    if (!r.ok) { console.log(`${p.grupo}/${p.id}: sin láminas`); continue; }
    const delAgente = contenidosDe(ctx.entidadesDelAgente().filter((e) => /TEXT/i.test(e.dxfTypeName)).map((e) => ({t: e.contents ?? '', h: e.height})));
    const tiene = [...delIngeniero].filter((c) => delAgente.has(c));
    const falta = [...delIngeniero].filter((c) => !delAgente.has(c));
    for (const f of falta) faltas.set(f, (faltas.get(f) ?? 0) + 1);
    const pct = tiene.length / delIngeniero.size;
    suma += pct; n++;
    console.log(`${`${p.grupo}/${p.id}`.padEnd(20)} ${String(Math.round(pct * 100)).padStart(3)} %  (${tiene.length}/${delIngeniero.size})${falta.length ? `  falta: ${falta.join(', ')}` : ''}`);
  } catch (e) { console.log(`${p.grupo}/${p.id}: error ${e.message}`); }
}
console.log(`\nCONTENIDO DE LÁMINAS (lo que pone el ingeniero y pone también el agente): ${Math.round((suma / Math.max(1, n)) * 100)} %  (${n} módulos)`);
console.log('Lo que más falta:', [...faltas].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} (${v})`).join(', '));
