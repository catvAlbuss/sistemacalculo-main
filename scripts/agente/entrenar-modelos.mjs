// Entrena y compara los modelos de dibujo con el conjunto de dataset-muros.mjs: la regla escrita a
// mano (línea base), regresión logística, árbol de decisión, bosque aleatorio y red neuronal.
// Validación honesta: dejando un PROYECTO entero fuera (lo más parecido a un cliente nuevo) y
// dejando cada módulo fuera. Métricas ponderadas por largo (un muro largo mal dibujado se nota más).
// Solo se publica un modelo si le gana a la regla al dejar fuera cada proyecto; si no, el agente
// sigue con la regla y el informe dice por qué.
//
//   node scripts/agente/entrenar-modelos.mjs
// Salida: resources/js/ingenieria/aprendizaje/modelosAprendidos.js (sin datos de clientes: solo pesos
// y umbrales) e informe en storage/app/private/entrenamiento/modelos/informe-muros.md
import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {PLANOS} from './planos.mjs';
import {ENTRENADORES, predecirModelo, matrizDe, textoArbolModelo} from '../../resources/js/ingenieria/aprendizaje/modelos.js';
import {RASGOS_MURO as TODOS} from '../../resources/js/ingenieria/planos/cimentacionPlano.js';

// --sin=area,niveles: deja fuera rasgos que delatan al proyecto (para ver si aprende el criterio y no el estilo).
const SIN = (process.argv.find((a) => a.startsWith('--sin='))?.slice(6) ?? '').split(',').filter(Boolean);
const RASGOS_MURO = TODOS.filter((k) => !SIN.includes(k));

const DIR = join(PLANOS, 'modelos');
const {muestras, resumen} = JSON.parse(readFileSync(join(DIR, 'muros-cimentacion.json'), 'utf8'));
const proyectos = [...new Set(muestras.map((m) => m.proyecto))];
const modulos = [...new Set(muestras.map((m) => `${m.proyecto}/${m.modulo}`))];
const MARGEN = 0.03; // lo mínimo que debe ganarle a la regla, en cada proyecto dejado fuera

// Exactitud y F1 ponderados por largo.
function medir(lista, pred) {
  let vp = 0, fp = 0, fn = 0, vn = 0;
  lista.forEach((m, i) => { const w = m.largo || 0.01; if (pred[i] && m.etiqueta) vp += w; else if (pred[i]) fp += w; else if (m.etiqueta) fn += w; else vn += w; });
  const p = vp + fp ? vp / (vp + fp) : 0, r = vp + fn ? vp / (vp + fn) : 0;
  return {exactitud: (vp + vn) / (vp + fp + fn + vn || 1), f1: p + r ? (2 * p * r) / (p + r) : 0, n: lista.length};
}
const prom = (xs) => xs.reduce((s, x) => s + x, 0) / (xs.length || 1);
const pct = (v) => `${Math.round(v * 100)} %`;

function validar(tipo, grupos) {
  return grupos.map((g) => {
    const prueba = muestras.filter(g.prueba), entreno = muestras.filter((m) => !g.prueba(m));
    if (!prueba.length || !entreno.length) return null;
    if (tipo === 'regla') return {grupo: g.nombre, ...medir(prueba, prueba.map((m) => m.regla))};
    const {X, y} = matrizDe(entreno, RASGOS_MURO);
    if (new Set(y).size < 2) return {grupo: g.nombre, ...medir(prueba, prueba.map(() => Boolean(y[0])))};
    const modelo = ENTRENADORES[tipo](X, y, RASGOS_MURO);
    return {grupo: g.nombre, ...medir(prueba, prueba.map((m) => predecirModelo(modelo, m.rasgos) >= 0.5))};
  }).filter(Boolean);
}

const porProyecto = proyectos.map((p) => ({nombre: p, prueba: (m) => m.proyecto === p}));
const porModulo = modulos.map((k) => ({nombre: k, prueba: (m) => `${m.proyecto}/${m.modulo}` === k}));
const tipos = ['regla', 'logistica', 'arbol', 'bosque', 'red'];
const filas = [];
for (const tipo of tipos) {
  const t0 = Date.now();
  const pp = validar(tipo, porProyecto), pm = validar(tipo, porModulo);
  filas.push({tipo, porProyecto: pp, exactProyecto: prom(pp.map((x) => x.exactitud)), f1Proyecto: prom(pp.map((x) => x.f1)), exactModulo: prom(pm.map((x) => x.exactitud)), f1Modulo: prom(pm.map((x) => x.f1)), s: Math.round((Date.now() - t0) / 1000)});
  const f = filas.at(-1);
  console.log(`${tipo.padEnd(10)} proyecto fuera: exactitud ${pct(f.exactProyecto)} · F1 ${pct(f.f1Proyecto)}  [${pp.map((x) => `${x.grupo} ${pct(x.exactitud)}`).join(', ')}]  ·  módulo fuera: exactitud ${pct(f.exactModulo)} · F1 ${pct(f.f1Modulo)}  (${f.s} s)`);
}

// Gana si supera a la regla en exactitud, por el margen, en CADA proyecto dejado fuera.
const regla = filas.find((f) => f.tipo === 'regla');
const candidatos = filas.filter((f) => f.tipo !== 'regla' && f.porProyecto.every((x) => x.exactitud >= (regla.porProyecto.find((r) => r.grupo === x.grupo)?.exactitud ?? 1) + MARGEN));
const ganador = candidatos.sort((a, b) => b.exactProyecto - a.exactProyecto)[0] ?? null;

let publicado = null;
if (ganador) {
  const {X, y} = matrizDe(muestras, RASGOS_MURO);
  const modelo = ENTRENADORES[ganador.tipo](X, y, RASGOS_MURO);
  publicado = {decision: 'muro en la planta de cimentación', tipo: ganador.tipo, umbral: 0.5, modelo,
    validacion: {proyectoFuera: Math.round(ganador.exactProyecto * 1000) / 1000, moduloFuera: Math.round(ganador.exactModulo * 1000) / 1000, regla: Math.round(regla.exactProyecto * 1000) / 1000},
    muestras: muestras.length, modulos: modulos.length, proyectos: proyectos.length, fecha: new Date().toISOString().slice(0, 10)};
}
// Árbol completo (siempre): sus ramas explican qué mira el ingeniero, gane o no.
const {X, y} = matrizDe(muestras, RASGOS_MURO);
const ramas = textoArbolModelo(ENTRENADORES.arbol(X, y, RASGOS_MURO, {profundidad: 3}));

writeFileSync('resources/js/ingenieria/aprendizaje/modelosAprendidos.js',
  `// Generado por scripts/agente/entrenar-modelos.mjs: no editar a mano. Solo pesos y umbrales (sin\n// datos de clientes). null = ningún modelo le ganó a la regla escrita al dejar fuera cada proyecto.\n` +
  `export const MODELO_MUROS_CIMENTACION = ${JSON.stringify(publicado)};\n`);

const informe = [
  `# Modelos de dibujo: muros en la planta de cimentación (${new Date().toLocaleString('es-PE')})`,
  '', `${muestras.length} tramos de muro · ${modulos.length} módulos · ${proyectos.length} proyectos (${proyectos.join(', ')})`, '',
  '| Modelo | Exactitud (proyecto fuera) | F1 (proyecto fuera) | Exactitud (módulo fuera) | F1 (módulo fuera) |', '|---|---|---|---|---|',
  ...filas.map((f) => `| ${f.tipo} | ${pct(f.exactProyecto)} (${f.porProyecto.map((x) => `${x.grupo} ${pct(x.exactitud)}`).join(', ')}) | ${pct(f.f1Proyecto)} | ${pct(f.exactModulo)} | ${pct(f.f1Modulo)} |`),
  '', publicado ? `**Publicado: ${publicado.tipo}** (le gana a la regla por ≥ ${pct(MARGEN)} en cada proyecto dejado fuera).` : `**Ningún modelo le ganó a la regla en cada proyecto dejado fuera**: el agente sigue con la regla escrita.`,
  '', '## Ramas del árbol (qué mira el ingeniero)', ...ramas.map((r) => `- ${r}`),
  '', '## Por módulo (regla actual)', ...resumen.map((r) => `- ${r.proyecto}/${r.modulo}: ${r.muros} tramos, ${r.si} dibujados por el ingeniero, ${r.tipo}, regla ${r.regla === null ? '—' : pct(r.regla)}`),
].join('\n');
writeFileSync(join(DIR, 'informe-muros.md'), informe);
console.log(`\n${publicado ? `Publicado: ${publicado.tipo}` : 'Sin modelo publicado (la regla sigue)'} · informe en ${join(DIR, 'informe-muros.md')}`);
console.log(ramas.map((r) => `  ${r}`).join('\n'));
