// Entrenamiento por pares: por cada proyecto con su arquitectura y su estructura, aprende qué
// decidió el ingeniero a partir de lo que había en la arquitectura (ver casos.js).
//
//   node scripts/agente/aprender-pares.mjs [carpeta]
//
// Lee los basenames exactos agrupados por proyecto en pares.json dentro de esa carpeta.
// AGENTE_PARES_MANIFEST permite apuntar a otro manifiesto local; no elige ni mezcla candidatos.
//
// Salida (sin datos personales: solo geometría y criterios):
//   docs/agentes/agente-predim/conocimiento/casos/<caso>.json  — un caso por grupo/módulo
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
import {rasgosDeArquitectura, geometriaDeLecturas, decisionesDeEstructura, compararColumnas, evaluar, DECISIONES} from '../../resources/js/ingenieria/aprendizaje/casos.js';
import {rasgosParaGuardar} from '../../resources/js/ingenieria/aprendizaje/registro.js';
import {PLANOS} from './planos.mjs';
import {descubrirPares, eventosAprobados, rutaArchivo} from './pares-entrenamiento.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const carpeta = resolve(process.argv[2] ?? join(PLANOS, 'estructuras'));
const rutaManifiesto = resolve(process.env.AGENTE_PARES_MANIFEST ?? join(carpeta, 'pares.json'));
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
  return {lecturas, items, vistas: detectarVistas(items), textos: items.filter((it) => it.tipo === 'texto' && it.texto).map((it) => it.texto)};
}

// Estilo del plano de cimentación del ingeniero: malla completa (≥ 2 m de trazo por m² dentro de
// la grilla: módulos 4, 6, 7, 8 y 11) o solo contorno y bastones (< 1 m/m²). null si no hay plano.
const NO_DIBUJO = /texto|text|cota|acot|dim|eje|axis|cuadro|membr|arqui|mobil|equip|titul/i;
function mallaDeCimentacion(est) {
  const v = est.vistas.find((x) => /PLATEA|CIMENTACI/i.test(x.titulo) && !/CIMIENTO\s+CORRIDO/i.test(x.titulo));
  if (!v) return null;
  const k = escalaPorBurbuja(v.radio), c = v.caja, area = ((c.x1 - c.x0) / k) * ((c.y1 - c.y0) / k);
  let largo = 0;
  for (const it of est.items) {
    if ((it.tipo !== 'linea' && it.tipo !== 'poli') || NO_DIBUJO.test(it.capa ?? '')) continue;
    if (!it.puntos.every((p) => p.x >= c.x0 && p.x <= c.x1 && p.y >= c.y0 && p.y <= c.y1)) continue;
    largo += it.puntos.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - it.puntos[i].x, p.y - it.puntos[i].y), 0) / k;
  }
  return area > 0 ? largo / area >= 2 : null;
}

if (!existsSync(rutaManifiesto)) {
  console.error(`Falta el manifiesto local ${rutaManifiesto}. Créelo como { "proyecto-01": [{ "id": "modulo-01", "arquitectura": "<basename exacto>", "estructura": "<basename exacto>" }] }; no se auto-seleccionan DWG.`);
  process.exit(1);
}
let manifiesto;
try {
  manifiesto = JSON.parse(readFileSync(rutaManifiesto, 'utf8'));
} catch (error) {
  console.error(`No se pudo leer el manifiesto local ${rutaManifiesto}: ${error.message}`);
  process.exit(1);
}
let descubrimiento;
try {
  // Archivos de la base y de la subcarpeta de cada proyecto (un proyecto por carpeta).
  const archivos = [...readdirSync(carpeta), ...Object.keys(manifiesto).filter((g) => existsSync(join(carpeta, g))).flatMap((g) => readdirSync(join(carpeta, g)))];
  descubrimiento = descubrirPares([...new Set(archivos)], manifiesto);
} catch (error) {
  console.error(`Manifiesto inválido ${rutaManifiesto}: ${error.message}`);
  process.exit(1);
}
const {pares, ambiguos, faltantes} = descubrimiento;
if (ambiguos.length || faltantes.length) {
  for (const a of ambiguos) console.error(`Ambiguo ${a.grupo}/${a.id}: ${(a.candidatos ?? []).map((p) => `${p.arquitectura} + ${p.estructura}`).join(' | ')}`);
  for (const f of faltantes) console.error(`Falta ${f.grupo}/${f.id}: arquitectura=${f.arquitectura ?? 'no seleccionada'}; estructura=${f.estructura ?? 'no seleccionada'}`);
  console.error('Edite el manifiesto privado para seleccionar exactamente un par por grupo/id; no se mezclaron ni sobrescribieron candidatos.');
  process.exit(1);
}
if (!pares.length) { console.error(`El manifiesto local no contiene pares en ${carpeta}`); process.exit(1); }

mkdirSync(salidaCasos, {recursive: true});
const casos = [];
for (const par of pares) {
  const [arq, est] = [await leer(rutaArchivo(carpeta, par.grupo, par.arquitectura, existsSync)), await leer(rutaArchivo(carpeta, par.grupo, par.estructura, existsSync))];
  const rasgosLeidos = rasgosDeArquitectura(arq.lecturas, arq.textos);
  const rasgos = {...rasgosLeidos, vista: 'vista-01'};
  const decisiones = decisionesDeEstructura(est.textos);
  decisiones.mallaCimentacion = mallaDeCimentacion(est);
  const plantaArq = arq.lecturas.find((l) => l.titulo === rasgosLeidos.vista)?.lectura;
  const plantaEst = [...est.lecturas].sort((a, b) => b.lectura.columnas.length - a.lectura.columnas.length)[0]?.lectura;
  const columnas = compararColumnas(plantaArq, plantaEst);
  decisiones.columnasComoArquitectura = columnas.coincidencia === null ? null : columnas.coincidencia >= 0.8;
  // Sin ninguna planta de losa ni losa en los textos, un edificio de un nivel lleva solo cobertura
  // liviana sobre vigas (módulos 7, 12 y 13 de VINCHOS).
  decisiones.losaDeTecho = decisiones.plantasDeLosa ? decisiones.plantasDeLosa >= rasgos.niveles
    : rasgos.niveles <= 1 && decisiones.losa === null ? false : null;
  const nombre = `${par.grupo}:${par.id}`;
  const etiqueta = null;
  const geometria = geometriaDeLecturas(est.lecturas);
  const caso = {nombre, grupo: par.grupo, id: par.id, aprendido: new Date().toISOString().slice(0, 10), etiqueta, rasgos, decisiones, columnas, geometria};
  const archivoCaso = `caso-${par.grupo.length}-${par.grupo}-${par.id.length}-${par.id}.json`;
  writeFileSync(join(salidaCasos, archivoCaso), JSON.stringify(caso, null, 1));
  casos.push(caso);
  console.log(`${par.grupo}/${par.id}: ${rasgos.niveles} nivel(es), ${rasgos.ejes.x}x${rasgos.ejes.y} ejes, ${rasgos.largo}x${rasgos.ancho} m, luz losa ${rasgos.luzLosa} m, ${rasgos.columnas} columnas`
    + ` → ${decisiones.cimentacion}${decisiones.cimientoCorrido ? ' + cimiento corrido' : ''}, Hz ${decisiones.hz}, Df ${decisiones.df}, losa ${decisiones.losa} ${decisiones.espesorLosa ?? ''}, losa en el último nivel: ${decisiones.losaDeTecho ? 'sí' : 'no'}`
    + `, columnas como arquitectura: ${columnas.coincidencia === null ? '—' : `${Math.round(columnas.coincidencia * 100)} %`}`);
}

// Correcciones aprobadas del uso: exporta solo la decisión y los rasgos permitidos,
// sin identificadores, propuesta original ni texto libre.
const rutaEventos = resolve(raiz, 'storage/app/private/aprendizaje/eventos.jsonl');
const registrosEventos = existsSync(rutaEventos)
  ? readFileSync(rutaEventos, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
  : [];
const eventos = eventosAprobados(registrosEventos, DECISIONES, rasgosParaGuardar);

// Para el agente: solo lo que usa al proponer (rasgos y decisiones).
const paraAgente = casos.map(({nombre, grupo, id, etiqueta, rasgos, decisiones, geometria}) => ({nombre, grupo, id, etiqueta, rasgos, decisiones, geometria}));
writeFileSync(salidaModulo, [
  '// Generado por scripts/agente/aprender-pares.mjs: no editar a mano.',
  '// Casos aprendidos de los pares arquitectura + estructuras (ver casos.js). Sin datos personales.',
  `export const CASOS = ${JSON.stringify(paraAgente, null, 1)};`,
  '// Correcciones del ingeniero registradas en el uso (se suman a las del servidor y la sesión).',
  `export const EVENTOS_USO = ${JSON.stringify(eventos, null, 1)};`,
  '',
].join('\n'));

const ev = evaluar(casos);
const aciertoAgente = ev.aciertoAgente === null ? 'N/D' : `${Math.round(ev.aciertoAgente * 100)} %`;
console.log(`\nEvaluación exploratoria de decisiones por caso (no mide F1 geométrico ni transferencia entre proyectos): ${Math.round(ev.acierto * 100)} % de decisiones acertadas; `
  + `${aciertoAgente} en las que el agente decide solo (${Math.round(ev.parteAgente * 100)} % de las decisiones; el resto queda para el ingeniero)`);
console.log('Evaluación geométrica: no disponible hasta conectar la generación CAD con el comparador F1.');
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
