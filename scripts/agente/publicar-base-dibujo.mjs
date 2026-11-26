// Publica la base del despacho para el aprendizaje con el cliente: una submuestra del conjunto de
// dataset-muros.mjs, solo números (rasgos, regla, etiqueta, largo), sin proyecto ni módulo.
// La sirve AgenteAprendizajeDibujoController (GET /software/etabs/agente/aprendizaje/dibujo).
//
//   node scripts/agente/publicar-base-dibujo.mjs [--max=3000]
// Salida: storage/app/private/agente/dibujo/base-muro-cimentacion.json (privado: en el servidor se
// sube a la misma ruta, como la biblioteca del agente).
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {PLANOS} from './planos.mjs';
import {aleatorio} from '../../resources/js/ingenieria/aprendizaje/modelos.js';
import {RASGOS_MURO} from '../../resources/js/ingenieria/planos/cimentacionPlano.js';

const max = Number(process.argv.find((a) => a.startsWith('--max='))?.slice(6)) || 3000;
const {muestras} = JSON.parse(readFileSync(join(PLANOS, 'modelos', 'muros-cimentacion.json'), 'utf8'));
const rnd = aleatorio(17);
// Misma proporción de cada proyecto (que uno grande no tape al otro).
const porProyecto = new Map();
for (const m of muestras) (porProyecto.get(m.proyecto) ?? porProyecto.set(m.proyecto, []).get(m.proyecto)).push(m);
const cuota = Math.floor(max / porProyecto.size);
const elegidas = [...porProyecto.values()].flatMap((lista) => [...lista].sort(() => rnd() - 0.5).slice(0, cuota));
const r4 = (v) => Math.round(Number(v) * 1e4) / 1e4;
const base = elegidas.map((m) => ({rasgos: Object.fromEntries(RASGOS_MURO.map((k) => [k, r4(m.rasgos[k] ?? 0)])), regla: Boolean(m.regla), etiqueta: Boolean(m.etiqueta), largo: r4(m.largo)}));
const salida = resolve('storage/app/private/agente/dibujo');
mkdirSync(salida, {recursive: true});
writeFileSync(join(salida, 'base-muro-cimentacion.json'), JSON.stringify({decision: 'muro-cimentacion', generado: new Date().toISOString(), muestras: base}));
console.log(`Base publicada: ${base.length} tramos (${[...porProyecto.keys()].length} proyectos) → ${join(salida, 'base-muro-cimentacion.json')}`);
