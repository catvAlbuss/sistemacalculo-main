// Aprendizaje del Agente Predim: lee un expediente de estructuras de referencia (DWG/DXF)
// y guarda lo que el ingeniero hace, para que el agente lo use en proyectos nuevos:
//
//   node scripts/agente/aprender-expediente.mjs <estructuras.dwg> [nombre]
//
// Salida: docs/agentes/agente-predim/conocimiento/expedientes/<nombre>.json con
//   - estilo:    capa, color y altura con que dibuja cada cosa (ejes, cotas, rótulos de
//                columnas, códigos de columnetas, títulos, niveles, textos de detalle);
//   - criterios: valores de diseño leídos de sus textos (f'c por elemento, estribos,
//                varillas, Hz, Df, losas, vigas, recubrimientos, cobertura, parámetros
//                sísmicos), cada uno con cuántas veces aparece y un ejemplo;
//   - planos:    qué planos tiene cada lámina (títulos "PLANO DE …") y los rótulos.
// No guarda datos personales del proyecto (especialista, CIP, CUI): solo criterios.
//
// Es el paso de "entrenamiento": cada expediente nuevo agrega conocimiento; el resumen
// de todos (resumen-expedientes.md) dice qué criterios se repiten y cuáles cambian.

import {readFileSync, writeFileSync, mkdirSync, readdirSync} from 'node:fs';
import {resolve, dirname, basename, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as dm from '@mlightcad/data-model';
import {AcDbLibreDwgMainThreadConverter} from '@mlightcad/libredwg-converter/node';
import {aplanarModelo, textoPlano} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const salida = resolve(raiz, 'docs/agentes/agente-predim/conocimiento/expedientes');

// ---------- Lectura ----------
async function abrir(ruta) {
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  // Bloques recortados (XCLIP): se lee lo que AutoCAD muestra, como en el visor.
  instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
  const db = new dm.AcDbDatabase();
  const b = readFileSync(ruta);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, extname(ruta).toLowerCase() === '.dxf' ? dm.AcDbFileType.DXF : dm.AcDbFileType.DWG);
  return db;
}

// Recorre el modelo con bloques explotados y devuelve también entidades que
// aplanarModelo no simplifica (cotas, achurados, directrices), con su capa efectiva.
function recorrer(db) {
  const otros = [];
  const visitar = (lista, capaPadre, profundidad) => {
    for (const e of lista) {
      const capa = e.layer === '0' && capaPadre ? capaPadre : e.layer;
      const tipo = String(e.dxfTypeName).toUpperCase();
      if (tipo === 'INSERT' && profundidad < 6 && e.blockTableRecord) visitar(e.blockTableRecord.newIterator().toArray(), capa, profundidad + 1);
      else if (['DIMENSION', 'HATCH', 'MULTILEADER', 'LEADER'].includes(tipo)) otros.push({tipo, capa, e});
    }
  };
  const modelo = db.tables.blockTable.modelSpace.newIterator().toArray();
  visitar(modelo, null, 0);
  return {items: aplanarModelo(modelo).items, otros};
}

// ---------- Estilo ----------
const contar = (lista, clave) => {
  const m = new Map();
  for (const x of lista) { const k = clave(x); if (k !== undefined && k !== null) m.set(k, (m.get(k) ?? 0) + 1); }
  return [...m].sort((a, b) => b[1] - a[1]);
};
const r3 = (v) => Math.round(v * 1000) / 1000;
const mediana = (v) => { const s = [...v].sort((a, b) => a - b); return s.length ? r3(s[Math.floor(s.length / 2)]) : null; };

function estiloDe(items, otros, capas) {
  const textos = items.filter((it) => it.tipo === 'texto' && it.texto);
  const rol = (filtro) => {
    const lista = textos.filter((t) => filtro(t.texto));
    if (!lista.length) return null;
    const [[capa, n]] = contar(lista, (t) => t.capa);
    return {capa, colorCapa: capas.get(capa) ?? null, alto: mediana(lista.filter((t) => t.capa === capa).map((t) => t.alto)), muestras: n};
  };
  // Burbujas de ejes: círculos con un rótulo corto dentro.
  const cortos = textos.filter((t) => /^[A-Za-z0-9]{1,3}\s*[´'`’]?$/.test(t.texto.trim()));
  const burbujas = items.filter((it) => it.tipo === 'circulo' && it.radio > 0.05 && cortos.some((t) => Math.hypot(t.centro.x - it.centro.x, t.centro.y - it.centro.y) < it.radio * 1.3));
  const ejes = burbujas.length ? (() => { const [[capa]] = contar(burbujas, (b) => b.capa); return {capa, colorCapa: capas.get(capa) ?? null, radio: mediana(burbujas.map((b) => b.radio)), burbujas: burbujas.length}; })() : null;
  const cotas = otros.filter((o) => o.tipo === 'DIMENSION');
  const estiloCota = cotas.length ? contar(cotas, (o) => o.e.dimensionStyleName ?? o.e._dimensionStyleName)[0]?.[0] : null;
  const achurados = contar(otros.filter((o) => o.tipo === 'HATCH'), (o) => `${o.e.isSolidFill ? 'SOLID' : o.e.patternName}@${o.capa}`).slice(0, 12).map(([k, n]) => ({patron: k.split('@')[0], capa: k.split('@')[1], veces: n}));
  return {
    ejes,
    cotas: cotas.length ? {cantidad: cotas.length, estilo: estiloCota, capa: contar(cotas, (o) => o.capa)[0][0]} : null,
    rotuloColumna: rol((t) => /^C-?\d{1,2}$/i.test(t.trim())),
    codigoColumneta: rol((t) => /^p[a-z]$/i.test(t.trim())),
    titulo: rol((t) => /PLANO\s+DE\s+/i.test(t)),
    niveles: rol((t) => /\b(N\.?P\.?T|N\.?F\.?[TPZC]|NFP|NPN|NFZ|N\.?T\.?N)\b/i.test(t)),
    rotuloViga: rol((t) => /^V[A-Z0-9-]*\s*\(?\d?\.\d+\s*x\s*\d?\.\d+\)?$/i.test(t.trim())),
    textoLosa: rol((t) => /LOSA\s+ALIGERADA|VIGUETA/i.test(t)),
    achurados,
  };
}

// ---------- Criterios (texto) ----------
function criteriosDe(items) {
  const textos = [...new Set(items.filter((it) => it.tipo === 'texto' && it.texto).map((t) => textoPlano(t.texto)))];
  const todos = textos.join(' | ');
  const hallazgos = (re, normaliza = (m) => m[0]) => {
    const m = new Map(), ejemplo = new Map();
    for (const t of textos) for (const x of t.matchAll(re)) { const k = normaliza(x); m.set(k, (m.get(k) ?? 0) + 1); if (!ejemplo.has(k)) ejemplo.set(k, t.slice(0, 90)); }
    return [...m].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([valor, veces]) => ({valor, veces, ejemplo: ejemplo.get(valor)}));
  };
  const num = (s) => Number(String(s).replace(',', '.'));
  return {
    concreto: hallazgos(/f['´`’]?\s*c\s*=?\s*(\d{2,3})\s*(?:kg\/cm2|kg\/cm²|Kg\/cm²|kg\/m2)?\s*([^|]{0,40})/gi, (x) => `f'c=${x[1]} ${(/columneta/i.test(x[2]) ? 'columnetas' : /column/i.test(x[2]) ? 'columnas' : /viga/i.test(x[2]) ? 'vigas' : /cimiento|ciclop/i.test(x[2]) ? 'cimiento' : /sobrecim/i.test(x[2]) ? 'sobrecimiento' : /zapata/i.test(x[2]) ? 'zapata' : /losa|aligerad/i.test(x[2]) ? 'losa' : '').trim()}`.trim()),
    ciclopeo: hallazgos(/(\d{2,3})\s*kg\/cm2?\s*\+\s*(\d{2})\s*%\s*(PG|PM)/gi, (x) => `${x[1]} + ${x[2]}% ${x[3].toUpperCase()}`),
    estribos: hallazgos(/(\d\/\d)"?\s*[Ø∅ø]?\s*:?\s*1\s*@\s*0?\.05\s*,\s*(\d{1,2})\s*@\s*0?\.?(10|1)\s*,?\s*(?:R[a-z]*\.?\s*@\s*0?\.(\d{2}))?/gi, (x) => `${x[1]}": 1@0.05, ${x[2]}@0.10, Rto@0.${x[4] ?? '20'}`),
    varillas: hallazgos(/(\d{1,2})\s*[Ø∅ø]\s*(\d\/\d|\d)"/g, (x) => `Ø${x[2]}"`),
    secciones: hallazgos(/V[A-Z0-9-]*\s*\(\s*(\d?\.\d+)\s*x\s*(\d?\.\d+)\s*\)/gi, (x) => `viga ${num(x[1]).toFixed(2)}x${num(x[2]).toFixed(2)}`),
    hz: hallazgos(/Hz\s*=\s*(\d?\.\d+)/gi, (x) => `Hz=${num(x[1]).toFixed(2)}`),
    df: hallazgos(/Df\s*=\s*-?\s*(\d?\.\d+)/gi, (x) => `Df=${num(x[1]).toFixed(2)}`),
    losa: hallazgos(/LOSA\s+ALIGERADA\s*(?:E|H)\s*=\s*(\d{2})\s*CM/gi, (x) => `aligerado e=${x[1]} cm`),
    niveles: hallazgos(/\b(N\.?P\.?T\.?|N\.?F\.?C\.?|NFZ|NFP|N\.?T\.?N\.?)\s*[=:]?\s*([+-]?\s*\d+\.\d+)/gi, (x) => `${x[1].replace(/\./g, '').toUpperCase()} ${x[2].replace(/\s/g, '')}`),
    recubrimientos: hallazgos(/(?:recubrimiento[^|]{0,40}?|ser[aá]\s+de)\s*(\d+(?:\.\d+)?)\s*cm/gi, (x) => `${x[1]} cm`),
    cobertura: hallazgos(/(TR-?4|aluzinc|calamina|teja|PTE\s*=\s*\d+\s*%|correas?\s+met[aá]lic[ao]s?[^|]{0,30}|cumbrera[^|]{0,30})/gi, (x) => x[1].replace(/\s+/g, ' ').trim()),
    sismo: hallazgos(/\b([ZUSC])\s*=\s*(\d+(?:\.\d+)?)/g, (x) => `${x[1]}=${x[2]}`),
    muro: hallazgos(/(ladrillo\s+King\s*Kong[^|]{0,40}|soga|cabeza)\b/gi, (x) => x[1].trim()),
    textoCompleto: todos.length,
  };
}

// ---------- Planos de cada lámina ----------
function planosDe(items) {
  const textos = items.filter((it) => it.tipo === 'texto' && it.texto);
  const titulos = [...new Set(textos.filter((t) => /PLANO\s+DE\s+/i.test(t.texto) && t.texto.length < 90).map((t) => textoPlano(t.texto).replace(/^.*?(PLANO\s+DE)/i, 'PLANO DE').toUpperCase()))];
  const laminas = [...new Set(textos.filter((t) => /^E-?\d{1,3}$/i.test(t.texto.trim())).map((t) => t.texto.trim()))];
  const cortes = [...new Set(textos.filter((t) => /^\\?L?\s*CORTE\s+[\dA-Z]-[\dA-Z]/i.test(textoPlano(t.texto))).map((t) => textoPlano(t.texto).replace(/^\\?L/, '').toUpperCase()))];
  const detalles = [...new Set(textos.filter((t) => /^\\?L?\s*DETALLE/i.test(textoPlano(t.texto))).map((t) => textoPlano(t.texto).replace(/^\\?L/, '').toUpperCase().slice(0, 70)))];
  const cuadros = [...new Set(textos.filter((t) => /^CUADRO\s+DE/i.test(textoPlano(t.texto))).map((t) => textoPlano(t.texto).toUpperCase()))];
  return {laminas, titulos, cortes, detalles, cuadros};
}

// ---------- Principal ----------
const ruta = process.argv[2];
if (!ruta) { console.error('Uso: node scripts/agente/aprender-expediente.mjs <estructuras.dwg> [nombre]'); process.exit(1); }
const nombre = (process.argv[3] ?? basename(ruta, extname(ruta))).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
const db = await abrir(ruta);
const capas = new Map([...db.tables.layerTable.newIterator()].map((l) => [l.name, l.color?.colorIndex]));
const {items, otros} = recorrer(db);
const conocimiento = {
  expediente: basename(ruta), nombre, aprendido: new Date().toISOString().slice(0, 10),
  tamano: {entidades: items.length, cotas: otros.filter((o) => o.tipo === 'DIMENSION').length, achurados: otros.filter((o) => o.tipo === 'HATCH').length},
  estilo: estiloDe(items, otros, capas),
  criterios: criteriosDe(items),
  planos: planosDe(items),
};
mkdirSync(salida, {recursive: true});
writeFileSync(resolve(salida, `${nombre}.json`), JSON.stringify(conocimiento, null, 1));
console.log(`Aprendido ${nombre}: ${conocimiento.planos.titulos.length} planos, ${conocimiento.planos.cortes.length} cortes, ${conocimiento.planos.detalles.length} detalles; ${Object.values(conocimiento.criterios).filter(Array.isArray).reduce((a, l) => a + l.length, 0)} criterios`);

// Resumen de todos los expedientes aprendidos: qué se repite y qué cambia.
const todos = readdirSync(salida).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(resolve(salida, f), 'utf8')));
const filas = ['concreto', 'ciclopeo', 'estribos', 'varillas', 'secciones', 'hz', 'df', 'losa', 'recubrimientos', 'cobertura', 'sismo'];
const celda = (lista) => (lista?.length ? lista.slice(0, 4).map((x) => `${x.valor} (${x.veces})`).join('; ') : '—');
const md = [
  '# Resumen de expedientes aprendidos',
  '',
  'Generado por `scripts/agente/aprender-expediente.mjs`. Cada columna es un expediente de referencia; cada fila, un criterio con sus valores más frecuentes (entre paréntesis, cuántas veces aparece en los textos del expediente).',
  '',
  `| Criterio | ${todos.map((t) => t.nombre).join(' | ')} |`,
  `|---|${todos.map(() => '---').join('|')}|`,
  ...filas.map((f) => `| ${f} | ${todos.map((t) => celda(t.criterios[f])).join(' | ')} |`),
  `| planos | ${todos.map((t) => t.planos.titulos.length).join(' | ')} |`,
  `| cortes | ${todos.map((t) => t.planos.cortes.join(', ') || '—').join(' | ')} |`,
  `| cuadros | ${todos.map((t) => t.planos.cuadros.join(', ') || '—').join(' | ')} |`,
  `| capa de ejes | ${todos.map((t) => t.estilo.ejes ? `${t.estilo.ejes.capa} (r=${t.estilo.ejes.radio})` : '—').join(' | ')} |`,
  `| estilo de cota | ${todos.map((t) => t.estilo.cotas?.estilo ?? '—').join(' | ')} |`,
  '',
  '## Planos por expediente',
  '',
  ...todos.flatMap((t) => [`### ${t.nombre}`, '', ...t.planos.titulos.map((x) => `- ${x}`), '']),
].join('\n');
writeFileSync(resolve(salida, '..', 'resumen-expedientes.md'), md);
console.log('Resumen: docs/agentes/agente-predim/conocimiento/resumen-expedientes.md');
process.exit(0);
