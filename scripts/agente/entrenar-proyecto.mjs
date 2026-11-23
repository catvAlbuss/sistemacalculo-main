// Incorporar un proyecto nuevo al entrenamiento del agente, con un solo comando.
//
//   1. Copiar los DWG (arquitectura y estructuras) y las planillas de metrado del proyecto a
//      storage/app/private/entrenamiento/estructuras/<proyecto>/   (fuera de git, privado)
//   2. node scripts/agente/entrenar-proyecto.mjs <proyecto>            # revisa qué emparejó
//   3. node scripts/agente/entrenar-proyecto.mjs <proyecto> --aplicar  # entrena y mide
//
// Empareja por número de módulo ("MÓDULO 4", "MODULO IV", "M-04", "4.") la arquitectura (ARQ,
// ARQUITECTURA), la estructura (EST, ESTRUCTURA(S)) y el metrado (METRADO…xlsx). Lo dudoso (dos
// versiones de un módulo, falta un archivo) se informa y no entra: se corrige el nombre o se
// quita el archivo sobrante y se vuelve a correr. Con --aplicar:
//   - agrega el proyecto a pares.json (sin tocar los demás proyectos);
//   - vuelca la caché de sus DWG; vuelve a aprender los casos de todos los proyectos
//     (casosAprendidos.js: reglas, patrones y vecinos se recalculan con el proyecto nuevo);
//   - mide la lectura y la generación del proyecto nuevo SIN que el agente lo haya visto
//     (dejando fuera todo el proyecto si ya hay otros; si es el único, módulo por módulo).
// No se envía nada a ningún servidor ni proveedor de IA.
import {readdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {PLANOS} from './planos.mjs';
import {proponerManifiesto} from './pares-entrenamiento.mjs';

const [grupo, ...resto] = process.argv.slice(2);
const aplicar = resto.includes('--aplicar');
const BASE = join(PLANOS, 'estructuras');
if (!grupo || !/^[a-z0-9][a-z0-9_-]*$/i.test(grupo)) {
  console.error('Uso: node scripts/agente/entrenar-proyecto.mjs <proyecto> [--aplicar]   (nombre: letras, números, - o _)');
  process.exit(1);
}
const carpeta = join(BASE, grupo);
if (!existsSync(carpeta)) { console.error(`No existe ${carpeta}: crea la carpeta y copia ahí los DWG y metrados del proyecto.`); process.exit(1); }

const {entradas, dudas, sinNumero} = proponerManifiesto(readdirSync(carpeta));
console.log(`Proyecto "${grupo}": ${entradas.length} módulo(s) emparejado(s)`);
for (const e of entradas) console.log(`  ${e.id}: ${e.arquitectura}  ↔  ${e.estructura}${e.metrado ? `  (+ ${e.metrado})` : ''}`);
for (const d of dudas) console.log(`  ? ${d.id}: ${d.motivo} — arq: ${d.arquitectura.join(' | ') || '—'} · est: ${d.estructura.join(' | ') || '—'}`);
if (sinNumero.length) console.log(`  ? sin número de módulo (no entran): ${sinNumero.join(' | ')}`);
if (!aplicar) {
  console.log(`\nRevisa la lista. Si está bien: node scripts/agente/entrenar-proyecto.mjs ${grupo} --aplicar`);
  process.exit(0);
}
if (!entradas.length) { console.error('No hay módulos emparejados: nada que entrenar.'); process.exit(1); }

const rutaManifiesto = join(BASE, 'pares.json');
const manifiesto = existsSync(rutaManifiesto) ? JSON.parse(readFileSync(rutaManifiesto, 'utf8')) : {};
const otros = Object.keys(manifiesto).filter((g) => g !== grupo);
manifiesto[grupo] = entradas;
writeFileSync(rutaManifiesto, JSON.stringify(manifiesto, null, 2));
console.log(`\npares.json: proyecto "${grupo}" con ${entradas.length} módulo(s) (otros proyectos: ${otros.join(', ') || 'ninguno'}).`);

const correr = (script, args = [], titulo) => {
  console.log(`\n== ${titulo}`);
  const r = spawnSync(process.execPath, [join('scripts', 'agente', script), ...args], {stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8',
    env: {...process.env, NODE_OPTIONS: '--max-old-space-size=12000'}, maxBuffer: 64 * 1024 * 1024});
  const salida = `${r.stdout ?? ''}`.split('\n').filter((l) => l.trim() && !/Unknown color|error code/.test(l));
  return {ok: r.status === 0, salida};
};
const archivos = entradas.flatMap((e) => [join(carpeta, e.arquitectura), join(carpeta, e.estructura)]);
let r = correr('volcar-planos.mjs', archivos, 'Caché de los DWG');
console.log(r.salida.slice(-3).join('\n'));
r = correr('aprender-pares.mjs', [], 'Aprender (todos los proyectos)');
console.log(r.salida.filter((l) => l.startsWith(`${grupo}/`) || /Evaluación exploratoria/.test(l)).map((l) => l.slice(0, 220)).join('\n'));
if (!r.ok) { console.error('El aprendizaje falló: revisa el manifiesto.'); process.exit(1); }
r = correr('evaluar-lectura.mjs', [`--grupo=${grupo}`], 'Lectura del proyecto nuevo');
console.log(r.salida.slice(-2).join('\n'));
r = correr('evaluar-generacion.mjs', [`--grupo=${grupo}`, ...(otros.length ? ['--fuera-proyecto'] : [])], `Generación (${otros.length ? 'sin haber visto este proyecto' : 'módulo por módulo, sin el propio'})`);
console.log(r.salida.filter((l) => /Alcance|Puntaje|FALLA/.test(l) || /^ {2}modulo/.test(l)).join('\n'));
console.log(`\nListo. Lo aprendido queda en resources/js/ingenieria/aprendizaje/casosAprendidos.js (sin datos personales); se publica con el despliegue habitual.`);
