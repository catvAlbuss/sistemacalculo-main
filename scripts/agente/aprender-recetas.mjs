// Aprende las "recetas de dibujo" del despacho midiendo los planos del ingeniero ya clasificados
// (inventario CAD-JSON + clasificador): largo y separación de las marcas de vigueta, paso de la
// malla de losa maciza, ancho con que dibuja las vigas… Sin modelo de IA: medianas sobre miles de
// trazos. El generador de láminas usa estos valores (resources/js/ingenieria/aprendizaje/recetas.js).
//
//   node scripts/agente/aprender-recetas.mjs
//
// Salida: resources/js/ingenieria/aprendizaje/recetasAprendidas.js (solo números, sin datos del
// cliente) — se publica con el despliegue habitual.
import {readFileSync, writeFileSync, readdirSync, existsSync} from 'node:fs';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PLANOS} from './planos.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const INV = join(PLANOS, 'inventario');
const med = (a) => { const b = [...a].sort((x, y) => x - y); return b.length ? Math.round(b[Math.floor(b.length / 2)] * 1000) / 1000 : null; };

const m = {viguetaLargo: [], viguetaPar: [], viguetaPaso: [], mallaPaso: [], vigaAncho: []};
// Fase de las viguetas: posición de cada marca respecto del eje anterior, módulo 0.40 (en cm).
const fase = new Array(40).fill(0);
let planos = 0;
// Los proyectos `holdout` del manifiesto (planos de prueba de generalización) no se aprenden.
const manifiesto = join(PLANOS, 'estructuras', 'pares.json');
const holdout = new Set(existsSync(manifiesto) ? Object.entries(JSON.parse(readFileSync(manifiesto, 'utf8'))).filter(([, ps]) => ps.some((p) => p.holdout)).map(([g]) => g) : []);
for (const g of existsSync(INV) ? readdirSync(INV).filter((d) => !d.endsWith('.json') && !holdout.has(d)) : []) {
  for (const f of readdirSync(join(INV, g)).filter((x) => x.endsWith('-estructura.json'))) {
    const inv = JSON.parse(readFileSync(join(INV, g, f), 'utf8'));
    for (const v of inv.vistas.filter((x) => x.tipoPlano === 'losa')) {
      planos++;
      const seg = (clase) => v.entidades.filter((e) => e.clase === clase && e.puntos?.length === 2).map((e) => {
        const [a, b] = e.puntos, h = Math.abs(b.x - a.x) > Math.abs(b.y - a.y);
        return {h, l: Math.hypot(b.x - a.x, b.y - a.y), c: h ? (a.y + b.y) / 2 : (a.x + b.x) / 2, s: h ? Math.min(a.x, b.x) : Math.min(a.y, b.y)};
      });
      // Viguetas: marcas cortas paralelas que arrancan a la misma distancia del apoyo.
      const ticks = seg('vigueta');
      ticks.forEach((t) => m.viguetaLargo.push(t.l));
      const ejesX = (v.ejes ?? []).filter((e) => e.orientacion === 'x').map((e) => e.posicion), ejesY = (v.ejes ?? []).filter((e) => e.orientacion === 'y').map((e) => e.posicion);
      for (const t of ticks) {
        if (t.l < 0.2 || t.l > 0.8) continue;
        // Marca horizontal: la vigueta corre en x y se reparte en y (ejes horizontales, orientacion 'y').
        const previos = (t.h ? ejesY : ejesX).filter((p) => p <= t.c);
        if (!previos.length) continue;
        fase[Math.round(((((t.c - Math.max(...previos)) % 0.4) + 0.4) % 0.4) * 100) % 40]++;
      }
      const grupos = new Map();
      for (const t of ticks) { const k = `${t.h}:${Math.round(t.s * 5)}`; grupos.set(k, [...(grupos.get(k) ?? []), t.c]); }
      for (const cs of grupos.values()) {
        cs.sort((a, b) => a - b);
        for (let i = 1; i < cs.length; i++) {
          const d = cs[i] - cs[i - 1];
          if (d >= 0.04 && d <= 0.16) m.viguetaPar.push(d); else if (d > 0.2 && d < 0.8) m.viguetaPaso.push(d);
        }
      }
      // Malla de losa maciza: rejilla de trazos paralelos (clase losa).
      const losa = seg('losa').filter((t) => t.l >= 0.5);
      for (const h of [true, false]) {
        const cs = [...new Set(losa.filter((t) => t.h === h).map((t) => Math.round(t.c * 1000) / 1000))].sort((a, b) => a - b);
        for (let i = 1; i < cs.length; i++) { const d = cs[i] - cs[i - 1]; if (d >= 0.1 && d <= 0.5) m.mallaPaso.push(d); }
      }
      // Vigas: dos caras paralelas a lo largo de un eje (ancho con que se dibujan).
      const vigas = seg('viga').filter((t) => t.l >= 1);
      for (const a of vigas) for (const b of vigas) {
        if (a === b || a.h !== b.h || b.c <= a.c) continue;
        const d = b.c - a.c;
        if (d >= 0.1 && d <= 0.6 && Math.abs(a.s - b.s) < 0.5) m.vigaAncho.push(d);
      }
    }
  }
}

// Centro del par de marcas: la fase f que más marcas explica en f ± separación/2.
const media = Math.round((med(m.viguetaPar) ?? 0.1) * 50);
let mejorFase = null, votos = 0;
for (let f = 0; f < 40; f++) { const n = fase[(f - media + 40) % 40] + fase[(f + media) % 40]; if (n > votos) { votos = n; mejorFase = f / 100; } }
const RECETAS = {
  fuente: `${planos} plantas de losa del despacho (medianas)`,
  vigueta: {largo: med(m.viguetaLargo), separacionPar: med(m.viguetaPar), paso: med(m.viguetaPaso), fase: mejorFase, muestras: m.viguetaLargo.length},
  maciza: {pasoMalla: med(m.mallaPaso), muestras: m.mallaPaso.length},
  viga: {anchoDibujo: med(m.vigaAncho), muestras: m.vigaAncho.length},
};
writeFileSync(join(raiz, 'resources/js/ingenieria/aprendizaje/recetasAprendidas.js'), [
  '// Generado por scripts/agente/aprender-recetas.mjs: no editar a mano.',
  '// Recetas de dibujo medidas en los planos del ingeniero (medianas; solo números).',
  `export const RECETAS = ${JSON.stringify(RECETAS, null, 1)};`, '',
].join('\n'));
console.log(`Recetas medidas en ${planos} plantas de losa:`);
console.log(`• vigueta: marca de ${RECETAS.vigueta.largo} m, par a ${RECETAS.vigueta.separacionPar} m, paso ${RECETAS.vigueta.paso} m, a ${RECETAS.vigueta.fase} m del eje (${RECETAS.vigueta.muestras} marcas)`);
console.log(`• losa maciza: malla a ${RECETAS.maciza.pasoMalla} m (${RECETAS.maciza.muestras} medidas)`);
console.log(`• vigas: dibujadas con ${RECETAS.viga.anchoDibujo} m entre caras (${RECETAS.viga.muestras} pares)`);
