// Metrado del agente contra la planilla Excel del ingeniero, en todos los módulos que la tienen.
// Criterio del cliente: una partida está bien si queda dentro de ±5 % del Excel original.
//
//   node scripts/agente/evaluar-metrado.mjs [--grupo=<g>] [modulo-NN ...] [--json=<ruta>] [--sin-modulo]
//
// Usa comparar-metrado.mjs módulo por módulo. La planilla se lee con planilla-metrado.mjs (hoja
// "Modulo N", hoja de un solo módulo o una hoja con varios módulos); la que no se puede leer con
// certeza se informa como "formato no reconocido" con el motivo.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import ExcelJS from 'exceljs';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {claveModulo} from './aprender-reglas-metrado.mjs';
import {leerPlanillaMetrado} from './planilla-metrado.mjs';

const args = process.argv.slice(2);
const filtro = args.filter((a) => /^modulo-/.test(a));
const grupo = args.find((a) => a.startsWith('--grupo='))?.slice(8);
const salidaJson = args.find((a) => a.startsWith('--json='))?.slice(7);
const sinModulo = args.includes('--sin-modulo');
const sinReglas = args.includes('--sin-reglas');
const BASE = join(PLANOS, 'estructuras');
const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync)
  .filter((p) => p.rutaMetrado && (!filtro.length || filtro.includes(p.id)) && (!grupo || p.grupo === grupo));

const filas = [];
const libros = new Map(); // una planilla puede servir a varios módulos
for (const par of pares) {
  const n = Number(/(\d+)/.exec(par.id)?.[1]);
  // Lector genérico: hoja "Modulo N", hoja de un solo módulo o una hoja con varios módulos
  // separados por título. Lo que no se lee con certeza queda como "formato no reconocido".
  let libro = libros.get(par.rutaMetrado);
  if (!libro) { libro = new ExcelJS.Workbook(); await libro.xlsx.readFile(par.rutaMetrado); libros.set(par.rutaMetrado, libro); }
  const lectura = leerPlanillaMetrado(libro, {modulo: n});
  if (lectura.error) { filas.push({grupo: par.grupo, id: par.id, estado: `formato no reconocido (${lectura.error})`}); console.log(`${par.grupo}/${par.id}: formato de planilla no reconocido (${lectura.error})`); continue; }
  const hoja = lectura.hoja;
  // --sin-modulo: las reglas del despacho (reglasDespacho.js) se agregan sin este módulo
  // (evaluación honesta: el módulo medido no enseña la regla con la que se lo mide).
  // --sin-reglas: sin ninguna regla aprendida (los criterios de siempre), para medir el antes.
  const env = {...process.env, NODE_OPTIONS: '--max-old-space-size=12000', ...(sinModulo ? {AGENTE_REGLAS_SIN: claveModulo(par.grupo, n)} : sinReglas ? {AGENTE_REGLAS_SIN: '*'} : {})};
  const r = spawnSync(process.execPath, ['scripts/agente/comparar-metrado.mjs', par.rutaArquitectura, par.rutaMetrado, hoja, `--modulo=${n}`], {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env});
  const salida = r.stdout ?? '';
  const m5 = /Nivel ingeniero \(±5 %\): (\d+)\/(\d+)/.exec(salida), m15 = /(\d+)\/(\d+) partidas dentro de ±15 %/.exec(salida);
  const porEntrenar = /Por entrenar: (.*)\.$/m.exec(salida)?.[1] ?? '';
  if (!m5) { filas.push({grupo: par.grupo, id: par.id, estado: `falló: ${(r.stderr || salida).split('\n').filter(Boolean).slice(-1)[0] ?? ''}`}); console.log(`${par.grupo}/${par.id}: falló`); continue; }
  // Tabla por partida (ingeniero, agente) y el modelo del agente, para el detalle por partida.
  const partidas = [...salida.matchAll(/^(.{34}) +(—|-?\d+\.\d+) +(—|-?\d+\.\d+) {3}(.*)$/gm)]
    .map((m) => ({partida: m[1].trim(), ingeniero: m[2] === '—' ? null : Number(m[2]), agente: m[3] === '—' ? null : Number(m[3])}));
  let modelo = null;
  try { modelo = JSON.parse(/^Modelo: (.*)$/m.exec(salida)?.[1] ?? 'null'); } catch { /* sin modelo */ }
  const fila = {grupo: par.grupo, id: par.id, dentro5: Number(m5[1]), comparables: Number(m5[2]), dentro15: Number(m15?.[1] ?? 0), porEntrenar, partidas, modelo};
  filas.push(fila);
  console.log(`${par.grupo}/${par.id}: ±5 % ${fila.dentro5}/${fila.comparables} partidas · ±15 % ${fila.dentro15}/${fila.comparables}`);
}
const medidas = filas.filter((f) => f.comparables);
const total5 = medidas.reduce((s, f) => s + f.dentro5, 0), total15 = medidas.reduce((s, f) => s + f.dentro15, 0), total = medidas.reduce((s, f) => s + f.comparables, 0);
// Partidas que más se escapan (para priorizar el entrenamiento).
const fuera = new Map();
for (const f of medidas) for (const m of f.porEntrenar.matchAll(/([^;(]+) \(([+-]?\d+) %\)/g)) {
  const k = m[1].trim(); fuera.set(k, [...(fuera.get(k) ?? []), Number(m[2])]);
}
const prioridades = [...fuera].sort((a, b) => b[1].length - a[1].length).slice(0, 10)
  .map(([k, v]) => ({partida: k, modulos: v.length, mediana: [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)]}));
console.log(`\nMETRADO dentro de ±5 % del Excel del ingeniero: ${total5}/${total} partidas (${total ? Math.round((100 * total5) / total) : 0} %) · dentro de ±15 %: ${total ? Math.round((100 * total15) / total) : 0} % · ${medidas.length} módulos medidos, ${filas.length - medidas.length} sin medir`);
console.log('Partidas que más se escapan (módulos, desviación mediana):');
for (const p of prioridades) console.log(`  ${p.partida}: ${p.modulos} módulos, ${p.mediana >= 0 ? '+' : ''}${p.mediana} %`);
if (salidaJson) writeFileSync(salidaJson, JSON.stringify({fecha: new Date().toISOString(), dentro5: total ? Math.round((100 * total5) / total) : null, dentro15: total ? Math.round((100 * total15) / total) : null, partidas: total, prioridades, filas}, null, 1));
process.exit(0);
