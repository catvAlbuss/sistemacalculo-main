// Ciclo de entrenamiento completo del agente, con un solo comando y SIN modelo de IA (cero tokens):
// lo hacen las herramientas deterministas (lector DWG, clasificador, aprendiz de patrones y de
// recetas, métricas). Es incremental: solo reprocesa los DWG que cambiaron.
//
//   node scripts/agente/entrenar.mjs [--rapido]
//
//   1. caché de los DWG (solo los nuevos o modificados)
//   2. inventario CAD-JSON y clasificación de entidades
//   3. aprender decisiones, reglas y patrones (casosAprendidos.js)
//   4. aprender recetas de dibujo midiendo los planos del ingeniero (recetasAprendidas.js)
//   5. medir: dibujo (superposición por elemento) y criterios (sin el módulo evaluado)
//   6. informe corto con la diferencia contra la corrida anterior
//
// --rapido: salta la medición de criterios (la de dibujo siempre corre).
// Informe: storage/app/private/entrenamiento/historial/<fecha>.json y ultimo.md (privados).
import {spawnSync} from 'node:child_process';
import {readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {PLANOS} from './planos.mjs';

const rapido = process.argv.includes('--rapido');
const HIST = join(PLANOS, 'historial');
mkdirSync(HIST, {recursive: true});
const sello = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const t0 = Date.now();

function paso(titulo, script, args = []) {
  const t = Date.now();
  const r = spawnSync(process.execPath, [join('scripts', 'agente', script), ...args], {encoding: 'utf8', maxBuffer: 256 * 1024 * 1024,
    env: {...process.env, NODE_OPTIONS: '--max-old-space-size=12000'}});
  const lineas = `${r.stdout ?? ''}`.split('\n').filter((l) => l.trim() && !/Unknown color|error code/.test(l));
  console.log(`${r.status === 0 ? '✓' : '✗'} ${titulo} (${Math.round((Date.now() - t) / 1000)} s)`);
  if (r.status !== 0) console.log(`${r.stderr ?? ''}`.split('\n').filter((l) => l.trim()).slice(-5).join('\n'));
  return {ok: r.status === 0, lineas};
}

paso('Caché de los DWG (incremental)', 'volcar-planos.mjs');
paso('Inventario CAD-JSON', 'inventario-cad.mjs');
paso('Clasificación de entidades', 'clasificar-inventario.mjs');
const ap = paso('Decisiones, reglas y patrones', 'aprender-pares.mjs');
const rec = paso('Recetas de dibujo (medidas en los planos del ingeniero)', 'aprender-recetas.mjs');
paso('Biblioteca de detalles del despacho (pórticos, cortes, cuadros…)', 'extraer-biblioteca.mjs');
const rutaDibujo = join(HIST, `dibujo-${sello}.json`);
paso('Medición del dibujo (superposición por elemento)', 'evaluar-dibujo.mjs', [`--json=${rutaDibujo}`]);
const rutaPorticos = join(HIST, `porticos-${sello}.json`);
paso('Medición de pórticos (contra los del ingeniero)', 'evaluar-porticos.mjs', [`--json=${rutaPorticos}`]);
const rutaDetalles = join(HIST, `detalles-${sello}.json`);
paso('Medición de detalles: cortes, escalera, cuadros', 'evaluar-detalles.mjs', [`--json=${rutaDetalles}`]);
const gen = rapido ? null : paso('Medición de criterios (sin el módulo evaluado)', 'evaluar-generacion.mjs');

const dibujo = existsSync(rutaDibujo) ? JSON.parse(readFileSync(rutaDibujo, 'utf8')) : null;
const porticos = existsSync(rutaPorticos) ? JSON.parse(readFileSync(rutaPorticos, 'utf8')) : null;
const detalles = existsSync(rutaDetalles) ? JSON.parse(readFileSync(rutaDetalles, 'utf8')) : null;
const previosPorticos = readdirSync(HIST).filter((f) => /^porticos-.*.json$/.test(f) && !f.includes(sello)).sort();
const porticosPrevio = previosPorticos.length ? JSON.parse(readFileSync(join(HIST, previosPorticos.at(-1)), 'utf8')) : null;
const anteriores = readdirSync(HIST).filter((f) => /^dibujo-.*\.json$/.test(f) && !f.includes(sello)).sort();
const previo = anteriores.length ? JSON.parse(readFileSync(join(HIST, anteriores.at(-1)), 'utf8')) : null;
const delta = (a, b) => (b === null || b === undefined || a === null ? '' : ` (${a - b >= 0 ? '+' : ''}${a - b})`);
const criterios = gen?.lineas.find((l) => /Puntaje de semejanza/.test(l))?.match(/([\d.]+) %/)?.[1];
const decisiones = ap.lineas.find((l) => /Evaluación exploratoria/.test(l))?.match(/(\d+) % de decisiones/)?.[1];

const md = [
  `# Entrenamiento ${new Date().toLocaleString('es-PE')}`,
  '',
  `Duración: ${Math.round((Date.now() - t0) / 60000)} min · tokens de IA usados: 0`,
  '',
  '| Planta | Dibujo estructural | Todo lo dibujado |',
  '|---|---|---|',
  ...Object.entries(dibujo?.porPlanta ?? {}).filter(([, v]) => v.modulos).map(([t, v]) => `| ${t} | ${v.estructural} %${delta(v.estructural, previo?.porPlanta?.[t]?.estructural)} | ${v.todo} % |`),
  `| **Global** | **${dibujo?.global ?? '—'} %**${delta(dibujo?.global ?? null, previo?.global)} | ${dibujo?.todo ?? '—'} % |`,
  '',
  ...(Object.keys(dibujo?.porProyecto ?? {}).length > 1 ? ['Por proyecto: ' + Object.entries(dibujo.porProyecto).map(([g, v]) => `${g} ${v.global} %${delta(v.global, previo?.porProyecto?.[g]?.global)} (${v.plantas} plantas)`).join(' · '), ''] : []),
  `Pórticos (contra los del ingeniero): ${porticos?.f1 ?? '—'} %${delta(porticos?.f1 ?? null, porticosPrevio?.f1)}${porticos ? ` (${Object.entries(porticos.porProyecto ?? {}).map(([g, v]) => `${g} ${v.f1} %`).join(' · ')})` : ''}`,
  `Detalles: ${detalles ? Object.entries(detalles.resumen ?? {}).map(([t, v]) => `${t.replace(/_/g, ' ')} ${v.f1} %`).join(' · ') : '—'}`,
  `Por elemento (cada tipo pesa igual): ${dibujo?.porElemento ?? '—'} %${delta(dibujo?.porElemento ?? null, previo?.porElemento)}`,
  `Criterios de decisión (sin el módulo evaluado): ${criterios ?? '— (--rapido)'} % · decisiones acertadas en casos no vistos: ${decisiones ?? '—'} %`,
  '',
  '## Prioridades (lo que más dibujo le falta o le sobra al agente, en muestras de 5 cm)',
  ...Object.entries(dibujo?.porPlanta ?? {}).flatMap(([t, v]) => Object.entries(v.porElemento ?? {}).map(([c, x]) => ({t, c, ...x, peso: (x.faltan ?? 0) + (x.sobran ?? 0)})))
    .sort((a, b) => b.peso - a.peso).slice(0, 8)
    .map((x) => `- ${x.t} · ${x.c}: faltan ${x.faltan ?? '—'}, sobran ${x.sobran ?? '—'} (cubierto ${x.cubierto ?? '—'} %, correcto ${x.correcto ?? '—'} %)`),
  '',
  '## Recetas aprendidas',
  ...rec.lineas.filter((l) => l.startsWith('•')),
].join('\n');
writeFileSync(join(HIST, 'ultimo.md'), md);
writeFileSync(join(HIST, `resumen-${sello}.json`), JSON.stringify({fecha: new Date().toISOString(), dibujo: dibujo && {global: dibujo.global, todo: dibujo.todo, porElemento: dibujo.porElemento, porPlanta: dibujo.porPlanta}, criterios, decisiones}, null, 1));
console.log(`\n${md}`);
