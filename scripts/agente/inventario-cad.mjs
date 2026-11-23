// Paso 2 del plan: inventario CAD-JSON de cada plano (arquitectura y estructura) de los
// proyectos de entrenamiento. Es la extracción determinista y trazable: qué contiene realmente
// cada DWG, vista por vista, en metros y referido a los ejes. Sobre este inventario se etiquetan
// los elementos del ingeniero (paso 3) y se aprenden las recetas de dibujo (paso 4).
//
//   node scripts/agente/volcar-planos.mjs        # caché (una vez; --forzar para regenerarla)
//   node scripts/agente/inventario-cad.mjs [--grupo=<proyecto>] [modulo-01 …]
//
// Salida privada (fuera de git): storage/app/private/entrenamiento/inventario/<proyecto>/
//   <modulo>-arquitectura.json, <modulo>-estructura.json y resumen.json
// Esquema: docs/agentes/esquema-cad-json.md (ESTRUCTURAS-CAD-JSON 1.0.0).
import {readFileSync, writeFileSync, mkdirSync, existsSync, statSync} from 'node:fs';
import {join, basename} from 'node:path';
import {createHash} from 'node:crypto';
import {detectarVistas, leerVista} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {nivelDeTitulo} from '../../resources/js/ingenieria/aprendizaje/casos.js';
import {PLANOS} from './planos.mjs';
import {leerCache} from './volcar-planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';

export const ESQUEMA = {nombre: 'ESTRUCTURAS-CAD-JSON', version: '1.0.0'};
const MOTOR = 'inventario-cad 1.0.0';
const escalaPorBurbuja = (radio) => (radio >= 40 ? 1000 : radio >= 4 ? 100 : 1);
const r4 = (v) => Math.round(v * 10000) / 10000;

// Tipo de plano por su título (lo que el ingeniero dice que es).
export function tipoDePlano(titulo) {
  const t = String(titulo ?? '').toUpperCase();
  if (/TABIQUER/.test(t)) return 'tabiqueria';
  if (/CIMIENTO\s+CORRIDO|SOBRECIMIENTO/.test(t)) return 'cimiento';
  if (/PLATEA|CIMENTACI|ZAPATA/.test(t)) return 'cimentacion';
  if (/P[OÓ]RTICO|ELEVACI/.test(t)) return 'portico';
  if (/LOSA|ALIGERAD|TECHO\s+\d|TECHO\s+[1-9]/.test(t)) return 'losa';
  if (/CORTE|SECCI[OÓ]N/.test(t)) return 'corte';
  if (/DETALLE/.test(t)) return 'detalle';
  if (/TECHO|AZOTEA|CUBIERTA/.test(t)) return 'techo';
  if (/NIVEL|PISO|PLANTA/.test(t)) return 'planta';
  return 'otro';
}

// Ejes de una vista con su posición relativa (el primer eje de cada dirección en 0).
function ejesRelativos(vista, k) {
  const ejes = vista.ejes.map((e) => {
    const vertical = Math.abs(e.q.y - e.p.y) >= Math.abs(e.q.x - e.p.x);
    return {nombre: e.nombre, orientacion: vertical ? 'x' : 'y', posicion: vertical ? (e.p.x + e.q.x) / 2 / k : (e.p.y + e.q.y) / 2 / k};
  });
  const x0 = Math.min(...ejes.filter((e) => e.orientacion === 'x').map((e) => e.posicion), Infinity);
  const y0 = Math.min(...ejes.filter((e) => e.orientacion === 'y').map((e) => e.posicion), Infinity);
  const origen = {x: Number.isFinite(x0) ? x0 : vista.caja.x0 / k, y: Number.isFinite(y0) ? y0 : vista.caja.y0 / k};
  return {origen, ejes: ejes.map((e) => ({...e, posicion: r4(e.posicion - (e.orientacion === 'x' ? origen.x : origen.y))}))};
}

export function inventariar(items, meta) {
  const capas = new Map();
  for (const it of items) {
    const c = capas.get(it.capa) ?? {nombre: it.capa, entidades: 0, tipos: {}};
    c.entidades++; c.tipos[it.tipo] = (c.tipos[it.tipo] ?? 0) + 1;
    capas.set(it.capa, c);
  }
  const usadas = new Set();
  const vistas = detectarVistas(items).map((v, i) => {
    const k = escalaPorBurbuja(v.radio);
    const {origen, ejes} = ejesRelativos(v, k);
    const m = 1.5 * k;
    const caja = {x0: v.caja.x0 - m, y0: v.caja.y0 - m, x1: v.caja.x1 + m, y1: v.caja.y1 + m};
    const dentro = (p) => p && p.x >= caja.x0 && p.x <= caja.x1 && p.y >= caja.y0 && p.y <= caja.y1;
    const P = (p) => ({x: r4(p.x / k - origen.x), y: r4(p.y / k - origen.y)});
    const entidades = [];
    items.forEach((it, j) => {
      if (!(it.puntos ?? [it.centro]).some(dentro)) return;
      usadas.add(j);
      entidades.push({
        id: it.id ?? null, tipo: it.tipo, capa: it.capa, ...(it.bloque ? {bloque: it.bloque} : {}), ...(it.color ? {color: it.color} : {}),
        ...(it.puntos ? {puntos: it.puntos.map(P), ...(it.cerrada ? {cerrada: true} : {})} : {}),
        ...(it.tipo === 'circulo' ? {centro: P(it.centro), radio: r4(it.radio / k)} : {}),
        ...(it.tipo === 'texto' ? {centro: P(it.centro), texto: it.texto, alto: r4((it.alto ?? 0) / k)} : {}),
        clase: null, // paso 3: muro, columna, viga, vigueta, losa, zapata, cimiento, cota, eje, texto…
      });
    });
    let columnas = 0;
    try { columnas = leerVista(items, v, k).columnas.length; } catch { /* vista ilegible */ }
    return {
      id: `vista-${String(i + 1).padStart(2, '0')}`, titulo: v.titulo, tipoPlano: tipoDePlano(v.titulo), nivel: nivelDeTitulo(v.titulo),
      unidadesPorMetro: k, origen: {x: r4(origen.x), y: r4(origen.y)}, ejes,
      caja: {x0: r4(v.caja.x0 / k - origen.x), y0: r4(v.caja.y0 / k - origen.y), x1: r4(v.caja.x1 / k - origen.x), y1: r4(v.caja.y1 / k - origen.y)},
      columnasLeidas: columnas, entidades,
    };
  });
  return {
    esquema: ESQUEMA.nombre, version: ESQUEMA.version,
    documento: meta,
    capas: [...capas.values()].sort((a, b) => b.entidades - a.entidades),
    vistas,
    sinVista: items.length - usadas.size,
    validaciones: {
      vistasConEjes: vistas.length, vistasSinTitulo: vistas.filter((v) => !v.titulo).length,
      entidadesSinId: items.filter((it) => !it.id).length, revisionHumana: 'pendiente',
    },
    trazabilidad: {motor: MOTOR, fecha: new Date().toISOString()},
  };
}

async function main() {
  const args = process.argv.slice(2);
  const grupo = args.find((a) => a.startsWith('--grupo='))?.slice(8);
  const filtro = args.filter((a) => /^modulo-/.test(a));
  const BASE = join(PLANOS, 'estructuras');
  const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync)
    .filter((p) => (!grupo || p.grupo === grupo) && (!filtro.length || filtro.includes(p.id)));
  const resumen = [];
  for (const par of pares) {
    const carpeta = join(PLANOS, 'inventario', par.grupo);
    mkdirSync(carpeta, {recursive: true});
    for (const [rol, ruta] of [['arquitectura', par.rutaArquitectura], ['estructura', par.rutaEstructura]]) {
      const cache = leerCache(ruta);
      if (!cache) { console.log(`${par.id} ${rol}: sin caché (corre volcar-planos.mjs)`); continue; }
      const sha256 = createHash('sha256').update(readFileSync(ruta)).digest('hex');
      const inv = inventariar(cache.items, {archivo: basename(ruta), sha256, bytes: statSync(ruta).size, rol, proyecto: par.grupo, modulo: par.id, formato: 'DWG'});
      writeFileSync(join(carpeta, `${par.id}-${rol}.json`), JSON.stringify(inv));
      const tipos = inv.vistas.reduce((m, v) => ({...m, [v.tipoPlano]: (m[v.tipoPlano] ?? 0) + 1}), {});
      resumen.push({proyecto: par.grupo, modulo: par.id, rol, entidades: cache.items.length, capas: inv.capas.length, vistas: inv.vistas.length, tipos, sinVista: inv.sinVista, sinId: inv.validaciones.entidadesSinId});
      console.log(`${par.id} ${rol.padEnd(12)}: ${cache.items.length} entidades, ${inv.capas.length} capas, ${inv.vistas.length} vistas (${Object.entries(tipos).map(([t, n]) => `${t} ${n}`).join(', ')}), ${inv.sinVista} fuera de vistas${inv.validaciones.entidadesSinId ? `, ${inv.validaciones.entidadesSinId} SIN ID` : ''}`);
    }
  }
  writeFileSync(join(PLANOS, 'inventario', 'resumen.json'), JSON.stringify({esquema: ESQUEMA, fecha: new Date().toISOString(), planos: resumen}, null, 1));
  console.log(`\nInventario de ${resumen.length} planos en ${join(PLANOS, 'inventario')}`);
}

if (process.argv[1]?.endsWith('inventario-cad.mjs')) await main();
