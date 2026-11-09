// Skill "casa_primer_nivel": planificador determinista de la planta del primer
// nivel de una vivienda unifamiliar en lote entre medianeras (calle en y = 0).
// El modelo de lenguaje solo elige los parámetros; la geometría sale de aquí,
// así que el dibujo completo cuesta una sola llamada a herramienta.
//
// Distribución:
//   zona social (todo el frente) -> [cochera] + sala | cocina + comedor
//   zona íntima (pasadizo lateral) -> baño común y dormitorios, abren al pasadizo
//   fondo -> patio / lavandería
// Los muros son el espacio entre ambientes: cada ambiente se dibuja por su cara
// interior y los vanos cortan las caras de ambos lados del muro.

import {L, line, pline, arc, circle, text, rect} from "../../cad/primitives.js";

export const CASA_LIMITES = {
  frente: [5, 20], fondo: [10, 40], dormitorios: [1, 4], banos: [1, 3], muro: [0.12, 0.25],
};
const PASADIZO = 1.0;
const COLUMNA = 0.25;
const EPS = 1e-6;

const clamp = (value, [min, max], fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
};
const r2 = (value) => Math.round(value * 100) / 100;

export function normalizarCasa(input = {}) {
  return {
    frente: clamp(input.frente, CASA_LIMITES.frente, 8),
    fondo: clamp(input.fondo, CASA_LIMITES.fondo, 20),
    dormitorios: Math.round(clamp(input.dormitorios, CASA_LIMITES.dormitorios, 3)),
    // Los modelos a veces escriben "baños" aunque el esquema diga "banos".
    banos: Math.round(clamp(input.banos ?? input["baños"], CASA_LIMITES.banos, 2)),
    cochera: input.cochera === undefined ? true : Boolean(input.cochera) && Number(input.frente ?? 8) >= 7,
    muro: clamp(input.muro, CASA_LIMITES.muro, 0.15),
  };
}

// Ambientes como rectángulos a ejes de muro, con sus vanos.
function distribuir(p, warnings) {
  const W = p.frente, Lf = p.fondo;
  const anchoUtil = W - PASADIZO;
  const filas = [];

  filas.push({prof: p.cochera ? 5.5 : 4.5, items: p.cochera
    ? [{nombre: "COCHERA", ancho: Math.min(3.2, W * 0.4)}, {nombre: "SALA"}]
    : [{nombre: "SALA"}]});
  filas.push({prof: 4.0, items: [{nombre: "COCINA", ancho: Math.max(2.4, W * 0.42)}, {nombre: "COMEDOR"}]});

  // Zona íntima: baño común y dormitorios, todos contra el pasadizo.
  // Fila de servicio: despensa (abre a la cocina) y baño común (abre al pasadizo).
  const intima = [{prof: 2.4, items: anchoUtil - 2.4 >= 1.5
    ? [{nombre: "DESPENSA"}, {nombre: "BAÑO", ancho: 2.4}]
    : [{nombre: "BAÑO"}]}];
  let banosExtra = p.banos - 1;
  for (let i = 0; i < p.dormitorios; i++) {
    const nombre = i === 0 ? "DORM. PRINCIPAL" : `DORMITORIO ${i + 1}`;
    if (banosExtra > 0 && anchoUtil - 1.8 >= 2.7) {
      banosExtra--;
      intima.push({prof: 3.5, items: [{nombre: i === 0 ? "BAÑO PRINC." : `BAÑO ${i + 1}`, ancho: 1.8, suite: true}, {nombre}]});
    } else {
      intima.push({prof: 3.3, items: [{nombre}]});
    }
  }
  if (banosExtra > 0) warnings.push(`No entraron ${banosExtra} baño(s) adicional(es): el frente es angosto.`);

  const patioMin = 2.0;
  const total = [...filas, ...intima].reduce((sum, fila) => sum + fila.prof, 0);
  if (total + patioMin > Lf) {
    const factor = (Lf - patioMin) / total;
    if (factor < 0.8) warnings.push(`El fondo de ${r2(Lf)} m es corto: los ambientes se redujeron al ${Math.round(factor * 100)} %.`);
    [...filas, ...intima].forEach((fila) => { fila.prof *= factor; });
  }

  const ambientes = [];
  let y = 0;
  const colocar = (fila, x0, x1) => {
    const fijos = fila.items.filter((item) => item.ancho).reduce((sum, item) => sum + item.ancho, 0);
    const libres = fila.items.filter((item) => !item.ancho).length || 1;
    let x = x0;
    const creados = fila.items.map((item) => {
      const ancho = item.ancho ?? (x1 - x0 - fijos) / libres;
      const ambiente = {nombre: item.nombre, x0: x, y0: y, x1: x + ancho, y1: y + fila.prof, suite: item.suite};
      x += ancho;
      return ambiente;
    });
    creados[creados.length - 1].x1 = x1;
    ambientes.push(...creados);
    y += fila.prof;
    return creados;
  };

  const [sala, cochera] = (() => { const fila = colocar(filas[0], 0, W); return [fila.at(-1), p.cochera ? fila[0] : null]; })();
  const [cocina, comedor] = colocar(filas[1], 0, W);
  const yIntima = y;
  const filasIntimas = intima.map((fila) => colocar(fila, 0, anchoUtil));
  const yPatio = y;
  const pasadizo = {nombre: "PASADIZO", x0: anchoUtil, y0: yIntima, x1: W, y1: yPatio};
  const patio = {nombre: "PATIO / LAV.", x0: 0, y0: yPatio, x1: W, y1: Lf};
  ambientes.push(pasadizo, patio);

  // Vanos: tipo puerta (con hoja), vano (sin hoja) o ventana. "lado" indica
  // hacia qué ambiente abre la hoja: +1 hacia x/y crecientes, -1 al revés.
  const vanos = [];
  const vanoH = (y, a, b, tipo, lado = 1) => vanos.push({orient: "h", c: y, a, b, tipo, lado});
  const vanoV = (x, a, b, tipo, lado = 1) => vanos.push({orient: "v", c: x, a, b, tipo, lado});
  const centrado = (a, b, ancho) => { const m = (a + b) / 2; return [m - ancho / 2, m + ancho / 2]; };

  vanoH(0, sala.x0 + 0.4, sala.x0 + 1.4, "puerta", 1);                                // ingreso principal
  if (cochera) vanoH(0, cochera.x0 + 0.3, cochera.x1 - 0.3, "vano");                    // portón
  if (cochera) vanoV(cochera.x1, cochera.y1 - 1.2, cochera.y1 - 0.3, "puerta", 1);      // cochera -> sala
  if (sala.x1 - sala.x0 > 3.2) vanoH(0, sala.x1 - 1.8, sala.x1 - 0.3, "ventana");
  vanoH(comedor.y0, ...centrado(comedor.x0, comedor.x1, 1.6), "vano");                  // sala -> comedor
  vanoV(cocina.x1, cocina.y0 + 0.4, cocina.y0 + 1.3, "vano");                           // comedor -> cocina
  vanoH(yIntima, pasadizo.x0 + 0.05, pasadizo.x1 - 0.05, "vano");                       // comedor -> pasadizo
  vanoH(yPatio, pasadizo.x0 + 0.05, pasadizo.x1 - 0.05, "vano");                        // pasadizo -> patio

  for (const fila of filasIntimas) {
    const pegado = fila.at(-1);                       // el ambiente que toca el pasadizo
    const ancho = pegado.nombre.startsWith("BAÑO") ? 0.7 : 0.9;
    vanoV(pegado.x1, pegado.y0 + 0.15, pegado.y0 + 0.15 + ancho, "puerta", -1);
    for (const ambiente of fila.slice(0, -1)) {
      if (ambiente.suite) vanoV(ambiente.x1, ambiente.y0 + 0.15, ambiente.y0 + 0.85, "puerta", -1); // baño -> dormitorio
      else vanoH(ambiente.y0, ...centrado(ambiente.x0, Math.min(ambiente.x1, cocina.x1), 0.8), "puerta", 1); // despensa -> cocina
    }
  }
  // Ventanas: sala y cocina dan a la calle/patio interior; la última fila íntima da al patio.
  const ultima = filasIntimas.at(-1);
  for (const ambiente of ultima) vanoH(yPatio, ...centrado(ambiente.x0, ambiente.x1, Math.min(1.5, (ambiente.x1 - ambiente.x0) * 0.5)), "ventana");

  return {ambientes, vanos, filas: [0, ...new Set(ambientes.map((a) => r2(a.y1)))].sort((a, b) => a - b), pasadizo, yIntima, yPatio};
}

// Caras de muro: un ambiente se dibuja retirado e (borde de lote) o e/2 (muro interior).
function caraInterior(ambiente, p) {
  const e = p.muro;
  const off = (valor, borde) => (Math.abs(valor - borde) < EPS ? e : e / 2);
  return {
    x0: ambiente.x0 + off(ambiente.x0, 0), x1: ambiente.x1 - off(ambiente.x1, p.frente),
    y0: ambiente.y0 + off(ambiente.y0, 0), y1: ambiente.y1 - off(ambiente.y1, p.fondo),
  };
}

// Caras del muro que contiene un vano.
function carasDelVano(vano, p) {
  const e = p.muro;
  const limite = vano.orient === "h" ? p.fondo : p.frente;
  if (Math.abs(vano.c) < EPS) return [0, e];
  if (Math.abs(vano.c - limite) < EPS) return [limite - e, limite];
  return [vano.c - e / 2, vano.c + e / 2];
}

// Segmento de cara de muro, cortado por los vanos que lo atraviesan.
function segmentosCortados(orient, coord, a, b, vanos, p) {
  let tramos = [[a, b]];
  for (const vano of vanos) {
    if (vano.orient !== orient) continue;
    const [f1, f2] = carasDelVano(vano, p);
    if (coord < f1 - EPS || coord > f2 + EPS) continue;
    tramos = tramos.flatMap(([s, t]) => {
      if (vano.b <= s || vano.a >= t) return [[s, t]];
      return [[s, vano.a], [vano.b, t]].filter(([u, v]) => v - u > EPS);
    });
  }
  return tramos;
}

function muroPrimitivas(p, ambientes, vanos) {
  const out = [];
  const lado = (orient, coord, a, b) => {
    for (const [s, t] of segmentosCortados(orient, coord, a, b, vanos, p)) {
      out.push(orient === "h" ? line(L.MUROS, [s, coord], [t, coord]) : line(L.MUROS, [coord, s], [coord, t]));
    }
  };
  // Contorno exterior del lote.
  lado("h", 0, 0, p.frente); lado("h", p.fondo, 0, p.frente);
  lado("v", 0, 0, p.fondo); lado("v", p.frente, 0, p.fondo);
  for (const ambiente of ambientes) {
    const c = caraInterior(ambiente, p);
    lado("h", c.y0, c.x0, c.x1); lado("h", c.y1, c.x0, c.x1);
    lado("v", c.x0, c.y0, c.y1); lado("v", c.x1, c.y0, c.y1);
  }
  return out;
}

function vanoPrimitivas(p, vanos) {
  const out = [];
  for (const vano of vanos) {
    const [f1, f2] = carasDelVano(vano, p);
    const pt = (u, w) => (vano.orient === "h" ? [u, w] : [w, u]);
    // Jambas: cierran el muro a ambos lados del vano.
    out.push(line(L.MUROS, pt(vano.a, f1), pt(vano.a, f2)), line(L.MUROS, pt(vano.b, f1), pt(vano.b, f2)));
    const ancho = vano.b - vano.a;
    if (vano.tipo === "ventana") {
      const t = (f2 - f1) / 3;
      out.push(line(L.VENTANAS, pt(vano.a, f1 + t), pt(vano.b, f1 + t)), line(L.VENTANAS, pt(vano.a, f2 - t), pt(vano.b, f2 - t)));
    } else if (vano.tipo === "puerta") {
      const cara = vano.lado > 0 ? f2 : f1;
      const bisagra = pt(vano.a, cara);
      const hoja = pt(vano.a, cara + vano.lado * ancho);
      out.push(line(L.PUERTAS, bisagra, hoja));
      // Arco de giro desde la hoja abierta hasta el otro extremo del vano.
      const h = vano.orient === "h";
      const [a0, a1] = h ? (vano.lado > 0 ? [0, Math.PI / 2] : [1.5 * Math.PI, 2 * Math.PI])
        : (vano.lado > 0 ? [0, Math.PI / 2] : [Math.PI / 2, Math.PI]);
      out.push(arc(L.PUERTAS, bisagra, ancho, a0, a1));
    }
  }
  return out;
}

function estructuraPrimitivas(p, plan) {
  const out = [];
  const ejesX = [COLUMNA / 2, p.frente - COLUMNA / 2];
  if (p.frente >= 7) ejesX.splice(1, 0, r2(plan.pasadizo.x0));
  const ejesY = [...new Set([COLUMNA / 2, ...plan.filas.slice(1, -1), p.fondo - COLUMNA / 2].map(r2))].sort((a, b) => a - b);
  const ext = 1.2, rb = 0.3;
  ejesX.forEach((x, i) => {
    out.push(line(L.EJES, [x, -ext], [x, p.fondo + 0.4]), circle(L.EJES, [x, -ext - rb], rb), text(L.EJES, [x, -ext - rb], String.fromCharCode(65 + i), 0.25));
  });
  ejesY.forEach((y, i) => {
    out.push(line(L.EJES, [-ext, y], [p.frente + 0.4, y]), circle(L.EJES, [-ext - rb, y], rb), text(L.EJES, [-ext - rb, y], String(i + 1), 0.25));
  });
  // Columnas en los cruces de ejes sobre los muros laterales y el muro del pasadizo.
  for (const x of ejesX) for (const y of ejesY) {
    const lateral = x === ejesX[0] || x === ejesX.at(-1);
    const delPasadizo = !lateral && y >= plan.yIntima - EPS;
    if (lateral || delPasadizo) out.push(rect(L.COLUMNAS, x - COLUMNA / 2, y - COLUMNA / 2, x + COLUMNA / 2, y + COLUMNA / 2));
  }
  return {primitivas: out, ejesX, ejesY};
}

function cotaPrimitivas(p, plan) {
  const out = [];
  const t = 0.12, h = 0.18;
  const cotaH = (y, a, b) => {
    out.push(line(L.COTAS, [a, y], [b, y]), line(L.COTAS, [a - t, y - t], [a + t, y + t]), line(L.COTAS, [b - t, y - t], [b + t, y + t]));
    out.push(text(L.COTAS, [(a + b) / 2, y + 0.2], (b - a).toFixed(2), h));
  };
  const cotaV = (x, a, b) => {
    out.push(line(L.COTAS, [x, a], [x, b]), line(L.COTAS, [x - t, a - t], [x + t, a + t]), line(L.COTAS, [x - t, b - t], [x + t, b + t]));
    out.push(text(L.COTAS, [x + 0.35, (a + b) / 2], (b - a).toFixed(2), h, 90));
  };
  cotaH(-2.4, 0, p.frente);
  cotaV(p.frente + 1.4, 0, p.fondo);
  const filas = plan.filas;
  for (let i = 0; i < filas.length - 1; i++) cotaV(p.frente + 0.8, filas[i], filas[i + 1]);
  return out;
}

export function planCasaPrimerNivel(input = {}) {
  const p = normalizarCasa(input);
  const warnings = [];
  const plan = distribuir(p, warnings);
  const etiquetas = plan.ambientes.map((ambiente) => {
    const c = caraInterior(ambiente, p);
    const area = (c.x1 - c.x0) * (c.y1 - c.y0);
    return {nombre: ambiente.nombre, area: r2(area), centro: [(c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2], ancho: c.x1 - c.x0};
  });
  const estructura = estructuraPrimitivas(p, plan);
  const primitivas = [
    ...muroPrimitivas(p, plan.ambientes, plan.vanos),
    ...vanoPrimitivas(p, plan.vanos),
    ...etiquetas.map((e) => text(L.TEXTOS, e.centro, `${e.nombre}\\P${e.area.toFixed(2)} m²`, Math.min(0.2, e.ancho / 9))),
    ...estructura.primitivas,
    ...cotaPrimitivas(p, plan),
  ];
  const techada = etiquetas.filter((e) => !e.nombre.startsWith("PATIO")).reduce((sum, e) => sum + e.area, 0);
  return {
    parametros: p,
    ambientes: etiquetas.map(({nombre, area}) => ({nombre, area})),
    vanos: plan.vanos.length,
    columnas: estructura.primitivas.filter((x) => x.layer === L.COLUMNAS).length,
    ejes: {x: estructura.ejesX.map(r2), y: estructura.ejesY.map(r2)},
    areaTerreno: r2(p.frente * p.fondo),
    areaTechadaLibre: r2(techada),
    warnings,
    primitivas,
    rectangulos: plan.ambientes,
  };
}
