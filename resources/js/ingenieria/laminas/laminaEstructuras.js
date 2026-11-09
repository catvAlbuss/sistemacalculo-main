// Arquitectura → estructuras: arma la lámina de estructuras como la de un
// expediente (E-xx): los planos de estructuras sobre la misma planta, uno al lado
// del otro y a escala de lámina, el cuadro de columnas y el rótulo, dentro de un
// marco ubicado debajo de la arquitectura.

import {L, line, pline, text} from "../cad/primitives.js";
import {planoCimentacion} from "../planos/cimentacionPlano.js";
import {planoAligerado} from "../planos/aligeradoPlano.js";

const AREA_58 = 1.99; // cm², varilla de 5/8"
const r4 = (v) => Math.round(v * 10000) / 10000;

// Refuerzo longitudinal mínimo (cuantía 1 %, E.060) en varillas de 5/8", número par.
export function refuerzoMinimo(areaM2) {
  // Número par de varillas con cuantía de 1 % (se acepta 0.98 %, como redondea el
  // ingeniero: 12Ø5/8" en una L de 0.24 m², 20Ø5/8" en una T de 0.39 m²).
  const as = 0.0098 * areaM2 * 1e4;
  let n = Math.max(4, Math.ceil(as / AREA_58 - 1e-9));
  if (n % 2) n++;
  return {n, texto: `${n}Ø5/8"`, cuantia: Math.round(((n * AREA_58) / (areaM2 * 1e4)) * 1000) / 10};
}

// Extensión del dibujo (percentiles 1-99 % para ignorar objetos perdidos).
export function extensionDibujo(items, k = 1) {
  const xs = [], ys = [];
  for (const it of items) for (const p of it.puntos ?? [it.centro]) if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) { xs.push(p.x / k); ys.push(p.y / k); }
  if (!xs.length) return {x0: 0, y0: 0, x1: 0, y1: 0};
  xs.sort((a, b) => a - b); ys.sort((a, b) => a - b);
  const q = (arr, f) => arr[Math.min(arr.length - 1, Math.max(0, Math.floor(f * (arr.length - 1))))];
  return {x0: q(xs, 0.01), y0: q(ys, 0.01), x1: q(xs, 0.99), y1: q(ys, 0.99)};
}

// Escala de la arquitectura ("Escala: 1/50") más cercana a la vista.
function escalaArquitectura(items, caja) {
  const cx = (caja.x0 + caja.x1) / 2, cy = (caja.y0 + caja.y1) / 2;
  let mejor = null;
  for (const it of items) {
    if (it.tipo !== "texto") continue;
    const m = /escala\s*:?\s*1\s*\/\s*(\d+)/i.exec(it.texto);
    if (!m) continue;
    const d = Math.hypot(it.centro.x - cx, it.centro.y - cy);
    if (!mejor || d < mejor.d) mejor = {d, n: Number(m[1])};
  }
  return mejor && mejor.d < 4 * Math.max(caja.x1 - caja.x0, caja.y1 - caja.y0) ? mejor.n : null;
}

const ocupado = (items, k, box) => items.some((it) => (it.puntos ?? [it.centro]).some((p) => p && p.x / k > box.x0 && p.x / k < box.x1 && p.y / k > box.y0 && p.y / k < box.y1));

// bloques: [{titulo, primitivas, marco, h, notas}] en coordenadas de la planta.
export function componerLamina({bloques, columnas, titulo, items, k = 1, caja, f = 2, plano}) {
  const hs = bloques[0].h * f;      // alto de texto en la lámina
  const M = 4 * hs;                 // margen
  const anchos = bloques.map((b) => (b.marco.x1 - b.marco.x0) * f);
  const Hp = Math.max(...bloques.map((b) => (b.marco.y1 - b.marco.y0) * f));
  const Hn = (Math.max(...bloques.map((b) => b.notas.length)) + 3) * hs * 1.3;
  const Wp = anchos.reduce((a, b) => a + b, 0) + M * (bloques.length - 1);

  // Cuadro de columnas: una fila por tipo.
  const tipos = [];
  for (const c of columnas) {
    const t = tipos.find((x) => x.tipo === c.tipo);
    if (t) t.cantidad++; else tipos.push({tipo: c.tipo, muestra: c, cantidad: 1});
  }
  tipos.sort((a, b) => a.tipo.localeCompare(b.tipo, "es", {numeric: true}));
  const fs = f * 2.5;               // sección a escala mayor que la planta
  const anchoSec = Math.max(0.3, ...tipos.map((t) => t.muestra.b)) * fs + 2 * hs;
  const altoFila = Math.max(Math.max(0.3, ...tipos.map((t) => t.muestra.h)) * fs + 2 * hs, 3 * hs);
  const cols = [{t: "TIPO", w: 4 * hs}, {t: "SECCIÓN", w: anchoSec}, {t: "DIMENSIONES", w: 10 * hs}, {t: "REFUERZO", w: 9 * hs}, {t: "ESTRIBOS Ø3/8\"", w: 17 * hs}];
  const Wc = cols.reduce((acc, c) => acc + c.w, 0);
  const Hc = 2.2 * hs + 2 * hs + tipos.length * altoFila;
  const filasRotulo = 6, Hr = filasRotulo * 1.8 * hs;

  const W = M + Wp + M + Wc + M;
  const H = M + Math.max(Hp + Hn, Hc + M + Hr) + M;

  // Debajo de la arquitectura (sin las capas E- del agente) y desde la izquierda;
  // si ya hay una lámina ahí, la siguiente va a su derecha.
  const ext = extensionDibujo(items.filter((it) => !/^E-/.test(it.capa)), k);
  const gap = Math.max(4 * M, 0.05 * (ext.y1 - ext.y0));
  let ox = ext.x0;
  const oy = ext.y0 - gap - H;
  for (let i = 0; i < 12 && ocupado(items, k, {x0: ox, y0: oy, x1: ox + W, y1: oy + H}); i++) ox += W + gap;

  const numero = 1 + items.filter((it) => it.tipo === "texto" && /^LÁMINA: E-\d+/.test(it.texto)).length;
  const nombre = `E-${String(numero).padStart(2, "0")}`;
  const S = ([x, y]) => [r4(ox + x), r4(oy + y)];
  const n = escalaArquitectura(items, caja);
  const escala = n && Number.isInteger(n / f) ? `1/${n / f}` : null;
  const out = [];

  // Planos uno al lado del otro, con su título y notas debajo.
  let x0 = M;
  bloques.forEach((b, i) => {
    const T = ([x, y]) => S([x0 + (x - b.marco.x0) * f, M + Hn + (y - b.marco.y0) * f]);
    for (const p of b.primitivas) {
      if (p.type === "line") out.push({...p, a: T(p.a), b: T(p.b)});
      else if (p.type === "pline") out.push({...p, points: p.points.map(T)});
      else if (p.type === "circle") out.push({...p, c: T(p.c), r: p.r * f});
      else if (p.type === "text") out.push({...p, at: T(p.at), h: p.h * f});
    }
    const xc = x0 + anchos[i] / 2;
    out.push(text(L.LAMINA, S([xc, M + Hn - 1.4 * hs]), `${b.titulo}${titulo ? ` - ${titulo.toUpperCase()}` : ""}${escala ? `   ESC: ${escala}` : ""}`, hs * 0.8));
    b.notas.forEach((fila, j) => out.push(text(L.LAMINA, S([xc, M + Hn - 3.2 * hs - j * hs * 1.3]), fila, hs * 0.5)));
    x0 += anchos[i] + M;
  });

  // Cuadro de columnas arriba a la derecha.
  const cx0 = M + Wp + M, cy1 = H - M;
  out.push(text(L.LAMINA, S([cx0 + Wc / 2, cy1 - 1.1 * hs]), "CUADRO DE COLUMNAS · CONCRETO f'c = 210 kg/cm²", hs * 0.7));
  const top = cy1 - 2.2 * hs;
  const bottom = top - 2 * hs - tipos.length * altoFila;
  out.push(pline(L.LAMINA, [S([cx0, bottom]), S([cx0 + Wc, bottom]), S([cx0 + Wc, top]), S([cx0, top])], true));
  out.push(line(L.LAMINA, S([cx0, top - 2 * hs]), S([cx0 + Wc, top - 2 * hs])));
  let xx = cx0;
  const centros = cols.map((c, i) => {
    if (i) out.push(line(L.LAMINA, S([xx, bottom]), S([xx, top])));
    out.push(text(L.LAMINA, S([xx + c.w / 2, top - hs]), c.t, hs * 0.5));
    xx += c.w;
    return xx - c.w / 2;
  });
  const cuadro = [];
  tipos.forEach((t, i) => {
    const yTop = top - 2 * hs - i * altoFila, yMid = yTop - altoFila / 2;
    if (i) out.push(line(L.LAMINA, S([cx0, yTop]), S([cx0 + Wc, yTop])));
    const c = t.muestra, ref = refuerzoMinimo(c.area);
    const dims = c.forma === "rectangular" ? `${c.b.toFixed(2)} x ${c.h.toFixed(2)} m` : `${c.forma} ${c.b.toFixed(2)} x ${c.h.toFixed(2)} m`;
    const estribos = "1@0.05, 9@0.10, Rto@0.25";
    out.push(text(L.LAMINA, S([centros[0], yMid]), `${t.tipo}\\P(${t.cantidad})`, hs * 0.6));
    out.push(pline(L.COLUMNAS, c.contorno.map((p) => S([centros[1] + (p.x - c.x) * fs, yMid + (p.y - c.y) * fs])), true));
    out.push(text(L.LAMINA, S([centros[2], yMid]), `${dims}\\PA = ${(c.area * 1e4).toFixed(0)} cm²`, hs * 0.5));
    out.push(text(L.LAMINA, S([centros[3], yMid]), `${ref.texto}\\Pρ = ${ref.cuantia.toFixed(1)} %`, hs * 0.5));
    out.push(text(L.LAMINA, S([centros[4], yMid]), estribos, hs * 0.5));
    cuadro.push({tipo: t.tipo, cantidad: t.cantidad, dimensiones: dims, refuerzo: ref.texto, estribos});
  });

  // Rótulo en la esquina inferior derecha.
  const rx0 = cx0, rx1 = cx0 + Wc, ry0 = M, ry1 = M + Hr;
  out.push(pline(L.LAMINA, [S([rx0, ry0]), S([rx1, ry0]), S([rx1, ry1]), S([rx0, ry1])], true));
  const filas = [
    `LÁMINA: ${nombre}`,
    "ESPECIALIDAD: ESTRUCTURAS",
    `PLANO: ${plano ?? bloques.map((b) => b.titulo.replace(/^PLANO DE /, "")).join(", ")} Y CUADRO DE COLUMNAS`,
    `VISTA: ${(titulo || "planta").toUpperCase()}`,
    `ESCALA: ${escala ?? `x${f} de la arquitectura`}`,
    "Generado por Agente Predim (predimensionamiento)",
  ];
  const fh = Hr / filasRotulo;
  filas.forEach((fila, i) => {
    if (i) out.push(line(L.LAMINA, S([rx0, ry1 - i * fh]), S([rx1, ry1 - i * fh])));
    out.push(text(L.LAMINA, S([(rx0 + rx1) / 2, ry1 - (i + 0.5) * fh]), fila, hs * (i === 0 ? 0.7 : 0.5)));
  });
  // Marco doble.
  out.push(pline(L.LAMINA, [S([0, 0]), S([W, 0]), S([W, H]), S([0, H])], true));
  out.push(pline(L.LAMINA, [S([M / 2, M / 2]), S([W - M / 2, M / 2]), S([W - M / 2, H - M / 2]), S([M / 2, H - M / 2])], true));

  return {primitivas: out, cuadro, info: {nombre, x0: ox, y0: oy, x1: ox + W, y1: oy + H, escala}};
}

// Lámina completa desde la planta leída: cimentación + aligerado + cuadro de columnas.
export function laminaEstructuras({lectura, items, caja, k = 1, titulo = ""}, {cimentacion = "auto", escala = 2} = {}) {
  const cim = planoCimentacion({lectura, items, caja, k, titulo}, {tipo: cimentacion});
  const ali = planoAligerado({lectura});
  const lamina = componerLamina({bloques: [cim.contenido, ali.contenido], columnas: lectura.columnas, titulo, items, k, caja, f: escala});
  return {cimentacion: cim, aligerado: ali, lamina: lamina.info, cuadroColumnas: lamina.cuadro, primitivas: lamina.primitivas, avisos: cim.avisos};
}
