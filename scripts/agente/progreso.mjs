// Tablero de progreso del agente (NovaCad y Análisis Estructural): junta lo que ya se mide, con qué
// mide cada número y de dónde sale, y lo deja para la página /software/etabs/agente/progreso.
// Son métricas INTERNAS (superposición con el dibujo del ingeniero, pruebas que pasan): la calidad
// la califica el ingeniero; su nota se guarda aparte (progreso-notas.json) y se muestra al lado.
//
//   node scripts/agente/progreso.mjs [--completo]
// --completo: también corre el puente arquitectura → modelo con todos los planos (varios minutos).
// Salida: storage/app/private/agente/progreso.json (privado).
import {readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {PLANOS} from './planos.mjs';
import {rutaDirecta} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {rutaCad} from '../../resources/js/cad/engine/agenteCad.js';

const completo = process.argv.includes('--completo');
const RAIZ = resolve('.');
const SALIDA = join(RAIZ, 'storage/app/private/agente');
const ARCHIVO = join(SALIDA, 'progreso.json');
const HIST = join(PLANOS, 'historial');
const previo = existsSync(ARCHIVO) ? JSON.parse(readFileSync(ARCHIVO, 'utf8')) : null;
const leer = (f) => JSON.parse(readFileSync(f, 'utf8'));
const ultimo = (prefijo) => readdirSync(HIST).filter((f) => f.startsWith(prefijo) && f.endsWith('.json')).sort().at(-1);
const ind = (nombre, valor, mide, fuente, extra = {}) => ({nombre, valor: valor === null || valor === undefined ? null : Math.round(Number(valor)), mide, fuente, ...extra});

// ---------- NovaCad ----------
const resumen = leer(join(HIST, ultimo('resumen-')));
const porticos = leer(join(HIST, ultimo('porticos-')));
const detalles = leer(join(HIST, ultimo('detalles-')));
const evolucion = readdirSync(HIST).filter((f) => f.startsWith('resumen-')).sort().map((f) => { const r = leer(join(HIST, f)); return {fecha: (r.fecha ?? f.slice(8, 18)).slice(0, 10), dibujo: r.dibujo?.global ?? null, porElemento: r.dibujo?.porElemento ?? null}; });
const proyectos = leer(join(HIST, ultimo('dibujo-'))).porProyecto ?? {};
const holdout = Object.entries(proyectos).filter(([p]) => !['vinchos', 'ilo'].includes(p));
const frases = leer(join(RAIZ, 'scripts/agente/frases-agente.json'));
const acierto = (lista, fn, get) => { const ok = lista.filter(([t, e]) => get(fn(t)) === e).length; return {ok, total: lista.length, pct: (100 * ok) / lista.length, fallan: lista.filter(([t, e]) => get(fn(t)) !== e).map(([t]) => t)}; };
const rutasNova = acierto(frases.novacad, rutaDirecta, (r) => r?.tool ?? null);
const det = detalles.resumen ?? {};
const promDetalles = Object.values(det).map((d) => d.f1).filter((v) => Number.isFinite(v));
const curva = existsSync(join(PLANOS, 'modelos/curva-cliente-logistica-hibrido.json')) ? leer(join(PLANOS, 'modelos/curva-cliente-logistica-hibrido.json')) : [];
const cinco = curva.filter((f) => f.n === 5);

const norma = existsSync(join(SALIDA, 'norma.json')) ? leer(join(SALIDA, 'norma.json')) : null;
const novacad = {
  indicadores: [
    ind('Láminas completas según la norma (15 puntos del revisor)', norma?.promedio, norma ? `GE.020, E.060, E.030-2026 art. 9.2 y E.050, en ${norma.planos} planos con los datos del formulario (sin qadm ni análisis). Lo que más falta: ${[...norma.porPunto].sort((a, b) => a.cumple - b.cumple).slice(0, 3).map((p) => `${p.titulo} ${p.cumple} %`).join(', ')}. Mide si la lámina TIENE lo exigido, no si el dibujo está bien hecho.` : 'Corre evaluar-norma.mjs.', 'evaluar-norma.mjs → revisorNorma.js'),
    ind('Dibujo estructural parecido al del ingeniero', resumen.dibujo?.global, 'Plantas del agente superpuestas a las del ingeniero (alineadas por ejes): F1 de líneas a ≤ 10 cm, solo elementos estructurales.', 'entrenar.mjs → evaluar-dibujo.mjs'),
    ind('Cada tipo de elemento (columna, muro, viga, losa…)', resumen.dibujo?.porElemento, 'Lo mismo pero cada tipo de elemento pesa igual (una malla grande no tapa una columna que falta).', 'evaluar-dibujo.mjs'),
    ind('Pórticos', porticos.f1, 'Pórticos del agente contra los del ingeniero, mismo criterio de superposición.', 'evaluar-porticos.mjs'),
    ind('Detalles (cortes, escalera, cuadros)', promDetalles.length ? promDetalles.reduce((a, b) => a + b, 0) / promDetalles.length : null, `Promedio de ${Object.entries(det).map(([k, v]) => `${k.replace(/_/g, ' ')} ${v.f1} %`).join(', ')}.`, 'evaluar-detalles.mjs'),
    ind('Decisiones estructurales (platea, losa, Hz…)', Number(resumen.criterios), 'Aciertos en las decisiones de cada módulo cuando el módulo NO se usó para aprender.', 'aprender-pares.mjs → casos.js'),
    ind('Planos que nunca vio (generalización)', holdout.length ? holdout.reduce((s, [, v]) => s + v.global, 0) / holdout.length : null, `Dibujo en proyectos fuera del entrenamiento: ${holdout.map(([p, v]) => `proyecto externo ${p === 'edificio9' ? 'A' : 'B'} ${v.global} % (${v.plantas} plantas)`).join(', ') || '—'}.`, 'evaluar-dibujo.mjs (hold-out)'),
    ind('Entiende los pedidos directos (sin IA)', rutasNova.pct, `${rutasNova.ok} de ${rutasNova.total} frases de ingeniero van a la herramienta correcta${rutasNova.fallan.length ? `; fallan: ${rutasNova.fallan.join(' · ')}` : ''}.`, 'frases-agente.json'),
    ind('Aprende el criterio de un cliente (5 módulos corregidos)', cinco.length ? cinco.reduce((s, f) => s + f.baseCliente * 100, 0) / cinco.length : null, `Muros de cimentación acertados tras 5 módulos corregidos: ${cinco.map((f) => `${f.proyecto} ${Math.round(f.baseCliente * 100)} % (regla ${Math.round(f.regla * 100)} %)`).join(', ')}.`, 'curva-cliente.mjs --modelo=logistica --hibrido'),
  ],
  evolucion,
  porPlanta: Object.fromEntries(Object.entries(resumen.dibujo?.porPlanta ?? {}).map(([k, v]) => [k, v.estructural])),
};

// ---------- Análisis Estructural ----------
const python = join(RAIZ, 'python-backend', process.platform === 'win32' ? 'venv/Scripts/python.exe' : 'venv/bin/python3');
let motor = previo?.analisis?.motor ?? null;
if (existsSync(python)) {
  const r = spawnSync(python, ['-m', 'pytest', 'tests', '-q', '-p', 'no:cacheprovider', '--tb=no', '-rA'], {cwd: join(RAIZ, 'python-backend'), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  const lineas = `${r.stdout}`.split('\n').filter((l) => /^(PASSED|FAILED|ERROR) /.test(l));
  const verif = lineas.filter((l) => /test_verificacion_/.test(l));
  if (lineas.length) motor = {verificacion: {ok: verif.filter((l) => l.startsWith('PASSED')).length, total: verif.length}, resto: {ok: lineas.filter((l) => !/test_verificacion_/.test(l) && l.startsWith('PASSED')).length, total: lineas.filter((l) => !/test_verificacion_/.test(l)).length}};
}
let puente = previo?.analisis?.puente ?? null;
if (completo) {
  const r = spawnSync(process.execPath, ['scripts/agente/probar-modelo-analisis.mjs'], {cwd: RAIZ, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: {...process.env, NODE_OPTIONS: '--max-old-space-size=12000'}});
  const m = /(\d+)\/(\d+) planos: arquitectura → modelo/.exec(r.stdout ?? '');
  if (m) puente = {ok: Number(m[1]), total: Number(m[2])};
}
const rutasCad = acierto(frases.analisis, rutaCad, (r) => r?.accion ?? null);
// Verificaciones de la E.030 que pide la norma y cuáles revisa el agente solo (revisionE030.js).
const E030 = [
  ['Masa participativa ≥ 90 %', true], ['Deriva inelástica (0.75·R / 0.85·R) ≤ límite', true], ['Cortante dinámico ≥ 80/90 % del estático', true],
  ['C/R ≥ 0.11', true], ['Irregularidad torsional', true], ['Irregularidad de rigidez (piso blando)', true], ['Irregularidad de masa', true],
  ['Irregularidad de resistencia (piso débil)', false], ['Irregularidad geométrica vertical', true], ['Discontinuidad de sistemas resistentes', true],
  ['Esquinas entrantes', true], ['Discontinuidad del diafragma', true], ['Sistemas no paralelos', true], ['Junta sísmica / separación', true],
];
const DISENO = [
  ['Columnas: flexocompresión E.060 (con el acero de las láminas)', true], ['Columnas: el menor armado que cumple', true], ['Columnas: corte y confinamiento', true],
  ['Vigas: flexión con combinaciones del usuario', true], ['Zapatas con reacciones y qadm', true], ['Vigas: armado al dibujo (despiece)', false], ['Placas: diseño y dibujo', false],
];
const pct = (lista) => (100 * lista.filter(([, h]) => h).length) / lista.length;
const analisis = {
  motor, puente,
  indicadores: [
    ind('Motor igual a ETABS/CSI en casos publicados', motor ? (100 * motor.verificacion.ok) / motor.verificacion.total : null, motor ? `${motor.verificacion.ok} de ${motor.verificacion.total} comparaciones dentro de su tolerancia: ejemplos del manual de verificación de CSI (ETABS 22) y un módulo real contra las tablas de ETABS 22.7.` : 'Sin python-backend/venv no se pudo correr.', 'python-backend/tests/test_verificacion_*.py'),
    ind('Robustez del motor (regresión, combos, masas, mallas)', motor ? (100 * motor.resto.ok) / motor.resto.total : null, motor ? `${motor.resto.ok} de ${motor.resto.total} pruebas.` : '—', 'python-backend/tests'),
    ind('Arquitectura → modelo de análisis', puente ? (100 * puente.ok) / puente.total : null, puente ? `${puente.ok} de ${puente.total} planos dan un .e2k que Análisis Estructural lee completo.` : 'Corre progreso.mjs --completo.', 'probar-modelo-analisis.mjs'),
    ind('Revisión E.030 automática', pct(E030), `${E030.filter(([, h]) => h).length} de ${E030.length} verificaciones de la norma. Faltan: ${E030.filter(([, h]) => !h).map(([n]) => n).join(', ')}.`, 'revisionE030.js'),
    ind('Diseño E.060 conectado al agente', pct(DISENO), `${DISENO.filter(([, h]) => h).length} de ${DISENO.length}. Falta: ${DISENO.filter(([, h]) => !h).map(([n]) => n).join(', ')}.`, 'rcColumnDesign · revisionAgente · zapatas'),
    ind('Entiende los pedidos directos (sin IA)', rutasCad.pct, `${rutasCad.ok} de ${rutasCad.total} frases de ingeniero van a la acción correcta${rutasCad.fallan.length ? `; fallan: ${rutasCad.fallan.join(' · ')}` : ''}.`, 'frases-agente.json'),
  ],
  pendientes: {e030: E030.filter(([, h]) => !h).map(([n]) => n), diseno: DISENO.filter(([, h]) => !h).map(([n]) => n)},
};

const notas = existsSync(join(SALIDA, 'progreso-notas.json')) ? leer(join(SALIDA, 'progreso-notas.json')).notas ?? [] : [];
const promedio = (xs) => { const v = xs.map((x) => x.valor).filter((x) => x !== null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; };
const salida = {
  fecha: new Date().toISOString(),
  aviso: 'Métricas internas: miden parecido con los planos del ingeniero y pruebas que pasan. La calidad la califica el ingeniero (nota al lado).',
  notaIngeniero: notas.at(-1) ?? null,
  novacad: {...novacad, promedio: promedio(novacad.indicadores)},
  analisis: {...analisis, promedio: promedio(analisis.indicadores)},
  historial: [...(previo?.historial ?? []).filter((h) => h.fecha.slice(0, 10) !== new Date().toISOString().slice(0, 10)), {fecha: new Date().toISOString().slice(0, 10), novacad: promedio(novacad.indicadores), analisis: promedio(analisis.indicadores)}],
};
mkdirSync(SALIDA, {recursive: true});
writeFileSync(ARCHIVO, JSON.stringify(salida, null, 1));
for (const [modulo, d] of [['NovaCad', salida.novacad], ['Análisis Estructural', salida.analisis]]) {
  console.log(`\n${modulo} — promedio interno ${d.promedio ?? '—'} %`);
  for (const i of d.indicadores) console.log(`  ${String(i.valor ?? '—').padStart(3)} %  ${i.nombre}`);
}
console.log(`\nNota del ingeniero: ${salida.notaIngeniero ? `${salida.notaIngeniero.nota} % (${salida.notaIngeniero.fecha})` : 'sin registrar'} · ${ARCHIVO}`);
