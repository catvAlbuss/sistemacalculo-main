// ¿Cuántos módulos corregidos por el cliente necesita el modelo para aprender su estilo de dibujo?
// Con el conjunto de dataset-muros.mjs: para cada proyecto, se toman n módulos como "corregidos por el
// cliente" (al azar, varias repeticiones) y se prueba con los demás módulos de ESE proyecto. Variantes:
//   - regla: la regla escrita (lo que hace hoy el agente);
//   - cliente: modelo entrenado solo con los n módulos del cliente;
//   - base+cliente: con los datos de los otros proyectos y los del cliente pesando más (×4).
// Métrica: exactitud ponderada por largo (como entrenar-modelos.mjs).
//
//   node scripts/agente/curva-cliente.mjs [--modelo=logistica|arbol|red]
import {readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {PLANOS} from './planos.mjs';
import {ENTRENADORES, predecirModelo, matrizDe, aleatorio} from '../../resources/js/ingenieria/aprendizaje/modelos.js';
import {RASGOS_MURO} from '../../resources/js/ingenieria/planos/cimentacionPlano.js';

const tipoModelo = process.argv.find((a) => a.startsWith('--modelo='))?.slice(9) ?? 'arbol';
const DIR = join(PLANOS, 'modelos');
const {muestras} = JSON.parse(readFileSync(join(DIR, 'muros-cimentacion.json'), 'utf8'));
// --hibrido: la decisión de la regla entra como un rasgo más: el modelo aprende dónde la regla falla.
const HIBRIDO = process.argv.includes('--hibrido');
if (HIBRIDO) for (const m of muestras) m.rasgos = {...m.rasgos, reglaSi: m.regla ? 1 : 0};
const RASGOS = HIBRIDO ? [...RASGOS_MURO, 'reglaSi'] : RASGOS_MURO;
const PESO_CLIENTE = 4, REPETICIONES = 6, NS = [1, 2, 3, 5];

function exactitud(lista, pred) {
  let bien = 0, total = 0;
  lista.forEach((m, i) => { const w = m.largo || 0.01; total += w; if (Boolean(pred[i]) === m.etiqueta) bien += w; });
  return total ? bien / total : 0;
}
const entrenar = (lista) => {
  const {X, y} = matrizDe(lista, RASGOS);
  if (new Set(y).size < 2) return {constante: y[0] ?? 0};
  return ENTRENADORES[tipoModelo](X, y, RASGOS);
};
const predecir = (m, r) => (m.constante !== undefined ? m.constante : predecirModelo(m, r) >= 0.5);
const pct = (v) => `${Math.round(v * 100)} %`;
const prom = (xs) => xs.reduce((s, x) => s + x, 0) / (xs.length || 1);

const rnd = aleatorio(5);
const filas = [];
for (const proyecto of [...new Set(muestras.map((m) => m.proyecto))]) {
  const modulos = [...new Set(muestras.filter((m) => m.proyecto === proyecto).map((m) => m.modulo))];
  const otros = muestras.filter((m) => m.proyecto !== proyecto);
  for (const n of NS.filter((k) => k < modulos.length - 1)) {
    const r = {regla: [], cliente: [], base: [], baseCliente: []};
    for (let rep = 0; rep < REPETICIONES; rep++) {
      const orden = [...modulos].sort(() => rnd() - 0.5);
      const corregidos = new Set(orden.slice(0, n));
      const cliente = muestras.filter((m) => m.proyecto === proyecto && corregidos.has(m.modulo));
      const prueba = muestras.filter((m) => m.proyecto === proyecto && !corregidos.has(m.modulo));
      const mc = entrenar(cliente), mb = entrenar(otros);
      const mbc = entrenar([...otros, ...Array.from({length: PESO_CLIENTE}, () => cliente).flat()]);
      r.regla.push(exactitud(prueba, prueba.map((m) => m.regla)));
      r.cliente.push(exactitud(prueba, prueba.map((m) => predecir(mc, m.rasgos))));
      r.base.push(exactitud(prueba, prueba.map((m) => predecir(mb, m.rasgos))));
      r.baseCliente.push(exactitud(prueba, prueba.map((m) => predecir(mbc, m.rasgos))));
    }
    const fila = {proyecto, n, regla: prom(r.regla), cliente: prom(r.cliente), base: prom(r.base), baseCliente: prom(r.baseCliente)};
    filas.push(fila);
    console.log(`${proyecto.padEnd(8)} ${n} módulo(s) del cliente: regla ${pct(fila.regla)} · solo cliente ${pct(fila.cliente)} · base ${pct(fila.base)} · base+cliente ${pct(fila.baseCliente)}`);
  }
}
writeFileSync(join(DIR, `curva-cliente-${tipoModelo}${HIBRIDO ? '-hibrido' : ''}.json`), JSON.stringify(filas, null, 1));
