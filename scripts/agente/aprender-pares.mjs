// Entrenamiento por pares: por cada proyecto con su arquitectura y su estructura, aprende qué
// decidió el ingeniero a partir de lo que había en la arquitectura (ver casos.js).
//
//   node scripts/agente/aprender-pares.mjs [carpeta]
//
// Busca en la carpeta (por defecto storage/app/private/entrenamiento/estructuras, fuera de git)
// los pares "<proyecto> arquitectura.dwg" + "<proyecto> estructuras.dwg". Opcional por
// proyecto: "<proyecto>.json" con la etiqueta del ingeniero ({"tipo": "aula", "uso": "...",
// "suelo": "S2", "qadm": 1.2, "zona": 3}).
//
// Salida (sin datos personales: solo geometría y criterios):
//   docs/agentes/agente-predim/conocimiento/casos/<caso>.json  — un caso por proyecto
//   resources/js/ingenieria/aprendizaje/casosAprendidos.js      — los casos para el agente
// y una evaluación dejando cada caso fuera: cuántas decisiones acierta el agente con los demás.

import {readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync} from 'node:fs';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as dm from '@mlightcad/data-model';
import {AcDbLibreDwgConverter} from '@mlightcad/libredwg-converter';
import {AcDbLibreDwgMainThreadConverter} from '@mlightcad/libredwg-converter/node';
import {aplanarModelo, detectarVistas, leerVista} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {rasgosDeArquitectura, decisionesDeEstructura, compararColumnas, evaluar, DECISIONES} from '../../resources/js/ingenieria/aprendizaje/casos.js';
import {rasgosParaGuardar} from '../../resources/js/ingenieria/aprendizaje/registro.js';
import {PLANOS} from './planos.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const carpeta = resolve(process.argv[2] ?? join(PLANOS, 'estructuras'));
const salidaCasos = resolve(raiz, 'docs/agentes/agente-predim/conocimiento/casos');
const salidaModulo = resolve(raiz, 'resources/js/ingenieria/aprendizaje/casosAprendidos.js');

dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});

const escalaPorBurbuja = (radio) => (radio >= 40 ? 1000 : radio >= 4 ? 100 : 1); // como estructuraPlano.js

async function leer(ruta) {
  const db = new dm.AcDbDatabase();
  const b = readFileSync(ruta);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  const capasApagadas = new Set([...db.tables.layerTable.newIterator()].filter((c) => c.isOff || c.isFrozen).map((c) => c.name));
  const {items} = aplanarModelo(db.tables.blockTable.modelSpace.newIterator().toArray(), {capasApagadas});
  const lecturas = detectarVistas(items).map((v) => {
    try { return {titulo: v.titulo, lectura: leerVista(items, v, escalaPorBurbuja(v.radio))}; } catch { return null; }
  }).filter(Boolean);
  return {lecturas, textos: items.filter((it) => it.tipo === 'texto' && it.texto).map((it) => it.texto)};
}

// "Modulo 09 Vilcabamba" → "modulo-09"; "14.VINCHOS MODULO 14" → "modulo-14": sin lugares.
const nombreCaso = (proyecto) => {
  const n = proyecto.match(/m[oó]dulo\s*0*(\d+)/i)?.[1] ?? proyecto.match(/^0*(\d+)\./)?.[1];
  return n ? `modulo-${n.padStart(2, '0')}` : proyecto.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').toLowerCase();
};

const archivos = readdirSync(carpeta);
const pares = archivos.filter((f) => / arquitectura\.dwg$/i.test(f)).map((f) => {
  const proyecto = f.replace(/ arquitectura\.dwg$/i, '');
  const est = archivos.find((g) => g.toLowerCase() === `${proyecto} estructuras.dwg`.toLowerCase());
  return est ? {proyecto, arq: join(carpeta, f), est: join(carpeta, est)} : null;
}).filter(Boolean);
if (!pares.length) { console.error(`No hay pares "<proyecto> arquitectura.dwg" + "<proyecto> estructuras.dwg" en ${carpeta}`); process.exit(1); }

mkdirSync(salidaCasos, {recursive: true});
const casos = [];
for (const par of pares) {
  const nombre = nombreCaso(par.proyecto);
  const [arq, est] = [await leer(par.arq), await leer(par.est)];
  const rasgos = rasgosDeArquitectura(arq.lecturas, arq.textos);
  const decisiones = decisionesDeEstructura(est.textos);
  const plantaArq = arq.lecturas.find((l) => l.titulo === rasgos.vista)?.lectura;
  const plantaEst = [...est.lecturas].sort((a, b) => b.lectura.columnas.length - a.lectura.columnas.length)[0]?.lectura;
  const columnas = compararColumnas(plantaArq, plantaEst);
  decisiones.columnasComoArquitectura = columnas.coincidencia === null ? null : columnas.coincidencia >= 0.8;
  decisiones.losaDeTecho = decisiones.plantasDeLosa ? decisiones.plantasDeLosa >= rasgos.niveles : null;
  const etiquetaRuta = join(carpeta, `${par.proyecto}.json`);
  const etiqueta = existsSync(etiquetaRuta) ? JSON.parse(readFileSync(etiquetaRuta, 'utf8')) : null;
  const caso = {nombre, aprendido: new Date().toISOString().slice(0, 10), etiqueta, rasgos, decisiones, columnas};
  writeFileSync(join(salidaCasos, `${nombre}.json`), JSON.stringify(caso, null, 1));
  casos.push(caso);
  console.log(`${nombre}: ${rasgos.niveles} nivel(es), ${rasgos.ejes.x}x${rasgos.ejes.y} ejes, ${rasgos.largo}x${rasgos.ancho} m, luz losa ${rasgos.luzLosa} m, ${rasgos.columnas} columnas`
    + ` → ${decisiones.cimentacion}${decisiones.cimientoCorrido ? ' + cimiento corrido' : ''}, Hz ${decisiones.hz}, Df ${decisiones.df}, losa ${decisiones.losa} ${decisiones.espesorLosa ?? ''}, losa en el último nivel: ${decisiones.losaDeTecho ? 'sí' : 'no'}`
    + `, columnas como arquitectura: ${columnas.coincidencia === null ? '—' : `${Math.round(columnas.coincidencia * 100)} %`}`);
}

// Correcciones del ingeniero en el uso (AgenteAprendizajeController): sin usuario, solo
// geometría y la decisión corregida. Van al agente para usarlas también sin conexión.
const rutaEventos = resolve(raiz, 'storage/app/private/aprendizaje/eventos.jsonl');
const eventos = existsSync(rutaEventos)
  ? readFileSync(rutaEventos, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter((e) => e && e.clave in DECISIONES).map(({tipo, clave, valor, propuesto, motivo, rasgos, fecha}) => ({tipo, clave, valor, propuesto, motivo, rasgos: rasgosParaGuardar(rasgos), fecha}))
  : [];

// Para el agente: solo lo que usa al proponer (rasgos y decisiones).
const paraAgente = casos.map(({nombre, etiqueta, rasgos, decisiones}) => ({nombre, etiqueta, rasgos, decisiones}));
writeFileSync(salidaModulo, [
  '// Generado por scripts/agente/aprender-pares.mjs: no editar a mano.',
  '// Casos aprendidos de los pares arquitectura + estructuras (ver casos.js). Sin datos personales.',
  `export const CASOS = ${JSON.stringify(paraAgente, null, 1)};`,
  '// Correcciones del ingeniero registradas en el uso (se suman a las del servidor y la sesión).',
  `export const EVENTOS_USO = ${JSON.stringify(eventos, null, 1)};`,
  '',
].join('\n'));

const ev = evaluar(casos);
console.log(`\nEvaluación dejando cada caso fuera: ${Math.round(ev.acierto * 100)} % de decisiones acertadas; `
  + `${Math.round(ev.aciertoAgente * 100)} % en las que el agente decide solo (${Math.round(ev.parteAgente * 100)} % de las decisiones; el resto queda para el ingeniero)`);
for (const f of ev.filas) console.log(`  ${f.caso}: ${f.aciertos}/${f.total}${f.fallos.length ? ` — falla ${f.fallos.join('; ')}` : ''}`);
// Lo que más le corrigen al agente en el uso: por ahí hay que mejorarlo primero.
const correcciones = eventos.filter((e) => e.tipo === 'correccion');
if (correcciones.length) {
  const porClave = new Map();
  for (const e of correcciones) porClave.set(e.clave, (porClave.get(e.clave) ?? 0) + 1);
  console.log(`\nCorrecciones del ingeniero en el uso: ${correcciones.length}`);
  for (const [k, n] of [...porClave].sort((a, b) => b[1] - a[1])) console.log(`  ${DECISIONES[k].nombre}: ${n}`);
} else console.log('\nAún no hay correcciones del ingeniero registradas en el uso.');
process.exit(0);
