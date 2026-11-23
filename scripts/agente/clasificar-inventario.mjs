// Paso 3: clasifica las entidades del inventario CAD-JSON (columna, muro, viga, vigueta, losa,
// zapata, cimiento, acero, cota, eje, texto, cuadro, fondo, otro) y deja la clase y su evidencia
// en cada entidad. Muestra la composición por tipo de planta y genera una imagen por planta
// coloreada por clase para que el especialista revise una muestra.
//
//   node scripts/agente/clasificar-inventario.mjs [--grupo=<proyecto>] [--png carpeta]
import {readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {clasificarVista, CLASES} from '../../resources/js/ingenieria/lectura/clasificador.js';
import {PLANOS} from './planos.mjs';

const args = process.argv.slice(2);
const grupo = args.find((a) => a.startsWith('--grupo='))?.slice(8);
const png = args.includes('--png') ? args[args.indexOf('--png') + 1] : null;
const INV = join(PLANOS, 'inventario');
const COLORES = {eje: '#bbbbbb', columna: '#d1242f', columneta: '#bf3989', muro: '#1a7f37', viga: '#0969da', vigueta: '#54aeff', losa: '#8250df',
  zapata: '#9a6700', cimiento: '#bc4c00', acero: '#1b1f24', cota: '#d4a72c', texto: '#e0e0e0', cuadro: '#eeeeee', fondo: '#f0d0d0', otro: '#ff00ff'};
const largo = (e) => (e.puntos ? e.puntos.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - e.puntos[i].x, p.y - e.puntos[i].y), 0) : 0);

const resumen = {};
for (const g of readdirSync(INV).filter((d) => existsSync(join(INV, d)) && !d.endsWith('.json') && (!grupo || d === grupo))) {
  for (const f of readdirSync(join(INV, g)).filter((x) => x.endsWith('.json'))) {
    const ruta = join(INV, g, f);
    const inv = JSON.parse(readFileSync(ruta, 'utf8'));
    for (const v of inv.vistas) {
      const clases = clasificarVista(v);
      v.entidades.forEach((e, i) => { e.clase = clases[i].clase; e.clasePor = clases[i].por; e.evidencia = clases[i].evidencia; });
      const clave = `${inv.documento.rol}:${v.tipoPlano}`;
      resumen[clave] ??= Object.fromEntries(CLASES.map((c) => [c, 0]));
      for (const e of v.entidades) resumen[clave][e.clase] += largo(e) || 0.2;
      if (png && inv.documento.rol === 'estructura' && ['cimentacion', 'losa', 'cimiento', 'tabiqueria'].includes(v.tipoPlano)) {
        mkdirSync(png, {recursive: true});
        const pts = v.entidades.flatMap((e) => e.puntos ?? []);
        if (!pts.length) continue;
        const x0 = Math.min(...pts.map((p) => p.x)), x1 = Math.max(...pts.map((p) => p.x)), y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y));
        const W = 1600, k = W / (x1 - x0 || 1), H = Math.ceil((y1 - y0) * k);
        const lin = v.entidades.filter((e) => e.puntos).map((e) => `<polyline fill="none" stroke="${COLORES[e.clase]}" stroke-width="1.4" points="${e.puntos.map((p) => `${((p.x - x0) * k).toFixed(1)},${((y1 - p.y) * k).toFixed(1)}`).join(' ')}${e.cerrada ? ` ${((e.puntos[0].x - x0) * k).toFixed(1)},${((y1 - e.puntos[0].y) * k).toFixed(1)}` : ''}"/>`);
        const ley = Object.entries(COLORES).map(([c, col], i) => `<text x="10" y="${20 + i * 16}" font-size="13" fill="${col === '#eeeeee' || col === '#e0e0e0' ? '#999' : col}" font-family="Arial">${c}</text>`);
        writeFileSync(join(png, `${inv.documento.modulo}-${v.id}-${v.tipoPlano}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff"/>${lin.join('')}${ley.join('')}</svg>`);
      }
    }
    writeFileSync(ruta, JSON.stringify(inv));
  }
}
for (const [clave, r] of Object.entries(resumen).sort()) {
  if (!/^estructura:(cimentacion|losa|tabiqueria|cimiento)$/.test(clave)) continue;
  const tot = Object.values(r).reduce((s, x) => s + x, 0);
  console.log(`${clave} (${tot.toFixed(0)} m de trazo): ${Object.entries(r).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([c, v]) => `${c} ${Math.round((100 * v) / tot)}%`).join(' · ')}`);
}
