// Entrenamiento del metrado con las planillas del despacho: de cada módulo saca relaciones que
// no dependen del tamaño del edificio (kg de acero por m³ de concreto, m² de encofrado por m³,
// factor de losa, ladrillos por m²…) y el catálogo de partidas que usa el despacho. Con eso el
// agente avisa cuando un metrado suyo se sale de lo que el despacho suele obtener, en cualquier
// tipo de plano. Genera resources/js/ingenieria/metrado/referenciaDespacho.js (solo números y
// nombres genéricos de partidas; nada del proyecto ni del cliente).
//
//   node scripts/agente/aprender-metrados.mjs <planilla.xlsx> [más.xlsx…]

import {writeFileSync} from 'node:fs';
import {basename} from 'node:path';
import {leerPlanilla} from './leer-planilla.mjs';

// Relaciones: [clave, nombre, unidad, ítem numerador, ítem denominador].
export const RELACIONES = [
  ['plateaAcero', 'Acero de losa de cimentación', 'kg/m³', '02.03.01.02', '02.03.01.01'],
  ['zapataAcero', 'Acero de zapatas', 'kg/m³', '02.03.02.02', '02.03.02.01'],
  ['vigaCimentacionAcero', 'Acero de vigas de cimentación', 'kg/m³', '02.03.03.03', '02.03.03.01'],
  ['placaAcero', 'Acero de placas', 'kg/m³', '02.03.05.01.03', '02.03.05.01.01'],
  ['placaEncofrado', 'Encofrado de placas', 'm²/m³', '02.03.05.01.02', '02.03.05.01.01'],
  ['columnaAcero', 'Acero de columnas', 'kg/m³', '02.03.06.01.03', '02.03.06.01.01'],
  ['columnaEncofrado', 'Encofrado de columnas', 'm²/m³', '02.03.06.01.02', '02.03.06.01.01'],
  ['vigaAcero', 'Acero de vigas', 'kg/m³', '02.03.07.01.03', '02.03.07.01.01'],
  ['vigaEncofrado', 'Encofrado de vigas', 'm²/m³', '02.03.07.01.02', '02.03.07.01.01'],
  ['columnetaAcero', 'Acero de columnetas', 'kg/m³', '02.03.08.03', '02.03.08.01'],
  ['columnetaEncofrado', 'Encofrado de columnetas', 'm²/m³', '02.03.08.02', '02.03.08.01'],
  ['vsaAcero', 'Acero de viguetas de amarre', 'kg/m³', '02.03.09.03', '02.03.09.01'],
  ['vsaEncofrado', 'Encofrado de viguetas de amarre', 'm²/m³', '02.03.09.02', '02.03.09.01'],
  ['canaletaAcero', 'Acero de canaleta de techo', 'kg/m³', '02.03.10.03', '02.03.10.01'],
  ['losaFactor', 'Concreto de losa aligerada por m²', 'm³/m²', '02.03.11.01', '02.03.11.02'],
  ['losaAcero', 'Acero de losa aligerada por m²', 'kg/m²', '02.03.11.03', '02.03.11.02'],
  ['losaLadrillo', 'Ladrillos de techo por m²', 'und/m²', '02.03.11.04', '02.03.11.02'],
  ['losaMacizaAcero', 'Acero de losa maciza', 'kg/m³', '02.03.12.03', '02.03.12.01'],
  ['escaleraAcero', 'Acero de escaleras', 'kg/m³', '02.03.13.03', '02.03.13.01'],
  ['cimientoEncofrado', 'Encofrado de cimiento corrido', 'm²/m³', '02.02.03.02', '02.02.03.01'],
];

const cuantil = (xs, q) => {
  const s = [...xs].sort((a, b) => a - b);
  const i = (s.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
};
const r3 = (v) => Math.round(v * 1000) / 1000;

export function aprender(hojasPorArchivo) {
  const muestras = Object.fromEntries(RELACIONES.map(([k]) => [k, []]));
  const catalogo = new Map();
  let modulos = 0;
  const vistos = new Set();
  for (const hojas of hojasPorArchivo) {
    for (const [nombre, partidas] of Object.entries(hojas)) {
      if (!/^m[oó]dulo/i.test(nombre)) continue; // obras exteriores no es un edificio
      const total = (item) => partidas.find((p) => p.item === item && p.total)?.total ?? null;
      // La misma hoja en dos archivos (módulo suelto y proyecto completo) cuenta una vez.
      const firma = `${nombre}|${(total('02.01.04.01') ?? 0).toFixed(2)}|${(total('02.03.06.01.01') ?? 0).toFixed(3)}`;
      if (vistos.has(firma)) continue;
      vistos.add(firma);
      modulos++;
      for (const [k, , , num, den] of RELACIONES) {
        const a = total(num), b = total(den);
        if (a > 0 && b > 0) muestras[k].push(a / b);
      }
      for (const p of partidas) {
        if (!p.total) continue;
        const c = catalogo.get(p.item) ?? {descripcion: p.descripcion, und: p.und, modulos: 0};
        c.modulos++;
        catalogo.set(p.item, c);
      }
    }
  }
  const relaciones = {};
  for (const [k, nombre, unidad, num, den] of RELACIONES) {
    const xs = muestras[k];
    if (xs.length < 2) continue;
    relaciones[k] = {nombre, unidad, num, den, n: xs.length, min: r3(Math.min(...xs)), p10: r3(cuantil(xs, 0.1)), mediana: r3(cuantil(xs, 0.5)), p90: r3(cuantil(xs, 0.9)), max: r3(Math.max(...xs))};
  }
  return {modulos, relaciones, catalogo: Object.fromEntries([...catalogo].sort())};
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/').replace(/^\//, '')}`) {
  const rutas = process.argv.slice(2);
  if (!rutas.length) { console.error('Uso: node scripts/agente/aprender-metrados.mjs <planilla.xlsx> [más.xlsx…]'); process.exit(1); }
  const hojas = [];
  for (const r of rutas) hojas.push(await leerPlanilla(r));
  const ref = aprender(hojas);
  const salida = 'resources/js/ingenieria/metrado/referenciaDespacho.js';
  writeFileSync(salida, `// Generado por scripts/agente/aprender-metrados.mjs con ${ref.modulos} módulos de planillas del despacho.
// Relaciones que no dependen del tamaño del edificio (rango real del despacho) y el catálogo
// de partidas. Solo números y nombres genéricos de partidas: nada del proyecto ni del cliente.
// No editar a mano: volver a correr el script con más planillas.

export const REFERENCIA_DESPACHO = ${JSON.stringify({fuente: `${ref.modulos} módulos de planillas del despacho`, ...ref}, null, 1)};
`);
  console.log(`${ref.modulos} módulos (${rutas.map((r) => basename(r)).join(', ')}) → ${salida}`);
  for (const [k, v] of Object.entries(ref.relaciones)) console.log(`${v.nombre.padEnd(36)} n=${String(v.n).padStart(2)}  ${v.min} | ${v.p10} – ${v.mediana} – ${v.p90} | ${v.max} ${v.unidad}`);
  console.log(`Catálogo: ${Object.keys(ref.catalogo).length} partidas.`);
}
