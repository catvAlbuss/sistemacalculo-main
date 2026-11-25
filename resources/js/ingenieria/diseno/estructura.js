// Lectura estructural de un plano: columnas, ejes, áreas tributarias y
// predimensionamiento de zapatas aisladas. Trabaja sobre segmentos planos
// ({layer, a:{x,y}, b:{x,y}}) para no depender del CAD y poder probarse con
// los planos reales. Todo lo que devuelve está en metros.

export const CAPAS_ESTRUCTURALES = /col|placa|estruc/i;
// Capas con "columna" que no son planta: elevaciones, cuadros, existentes.
export const CAPAS_EXCLUIDAS = /elevaci|cuadro|corte|detalle|existente/i;

export const CARGAS_POR_DEFECTO = {
  pisos: 1,
  cargaMuerta: 0.75,  // t/m²: losa aligerada 20 cm + acabados + tabiquería + vigas
  cargaViva: 0.25,    // t/m²: oficinas (E.020); vivienda 0.20
  qadm: 15,           // t/m²: 1.5 kg/cm²
  alturaPiso: 3,
};

const r2 = (value) => Math.round(value * 100) / 100;
const r3 = (value) => Math.round(value * 1000) / 1000;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
};

export function capaEstructural(nombre, capas) {
  const name = String(nombre ?? "");
  if (capas?.length) return capas.some((capa) => name.toLowerCase() === capa.toLowerCase());
  return CAPAS_ESTRUCTURALES.test(name) && !CAPAS_EXCLUIDAS.test(name);
}

// Unidades del dibujo por metro, deducidas del largo típico de los lados de
// columna (los archivos a veces declaran mm y dibujan en metros).
export function deducirEscala(segmentos) {
  const tipico = median(segmentos.map((s) => Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y)).filter((l) => l > 0));
  if (tipico >= 40) return 1000;   // milímetros
  if (tipico >= 4) return 100;     // centímetros
  return 1;                        // metros
}

// Agrupa segmentos cercanos (union-find con rejilla espacial).
function agrupar(segmentos, gap) {
  const parent = segmentos.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const union = (i, j) => { parent[find(i)] = find(j); };
  const cell = gap * 4;
  const grid = new Map();
  const boxes = segmentos.map((s) => ({
    x0: Math.min(s.a.x, s.b.x) - gap, y0: Math.min(s.a.y, s.b.y) - gap,
    x1: Math.max(s.a.x, s.b.x) + gap, y1: Math.max(s.a.y, s.b.y) + gap,
  }));
  boxes.forEach((box, i) => {
    // Segmentos muy largos (ejes, muros) no se indexan: no son contorno de columna.
    if ((box.x1 - box.x0) > cell * 50 || (box.y1 - box.y0) > cell * 50) return;
    for (let gx = Math.floor(box.x0 / cell); gx <= Math.floor(box.x1 / cell); gx++) {
      for (let gy = Math.floor(box.y0 / cell); gy <= Math.floor(box.y1 / cell); gy++) {
        const key = `${gx}:${gy}`;
        const bucket = grid.get(key) ?? [];
        for (const j of bucket) {
          const other = boxes[j];
          if (box.x0 <= other.x1 && other.x0 <= box.x1 && box.y0 <= other.y1 && other.y0 <= box.y1) union(i, j);
        }
        bucket.push(i);
        grid.set(key, bucket);
      }
    }
  });
  const grupos = new Map();
  segmentos.forEach((s, i) => {
    if ((boxes[i].x1 - boxes[i].x0) > cell * 50 || (boxes[i].y1 - boxes[i].y0) > cell * 50) return;
    const root = find(i);
    grupos.set(root, [...(grupos.get(root) ?? []), s]);
  });
  return [...grupos.values()];
}

export function detectarColumnas(segmentos, {escala} = {}) {
  const k = escala ?? deducirEscala(segmentos);
  const grupos = agrupar(segmentos, 0.03 * k);
  const columnas = [];
  const descartados = {pequenos: 0, grandes: 0, sueltos: 0};
  for (const grupo of grupos) {
    const xs = grupo.flatMap((s) => [s.a.x, s.b.x]), ys = grupo.flatMap((s) => [s.a.y, s.b.y]);
    const x0 = Math.min(...xs) / k, x1 = Math.max(...xs) / k, y0 = Math.min(...ys) / k, y1 = Math.max(...ys) / k;
    const b = x1 - x0, h = y1 - y0;
    if (Math.min(b, h) < 0.1) { descartados.pequenos++; continue; }
    if (Math.max(b, h) > 4) { descartados.grandes++; continue; }
    if (grupo.length < 3 && !grupo.some((s) => s.cerrada)) { descartados.sueltos++; continue; }
    // Un rectángulo tiene 2 abscisas y 2 ordenadas distintas; una T o L, más.
    const distintos = (valores) => valores.sort((p, q) => p - q).filter((v, i, all) => i === 0 || v - all[i - 1] > 0.03 * k).length;
    const irregular = distintos(xs) > 2 || distintos(ys) > 2;
    columnas.push({
      x: r3((x0 + x1) / 2), y: r3((y0 + y1) / 2), b: r2(b), h: r2(h),
      forma: irregular ? "irregular" : "rectangular",
      capas: [...new Set(grupo.map((s) => s.layer))],
    });
  }
  // Orden de lectura: de abajo hacia arriba y de izquierda a derecha.
  columnas.sort((p, q) => (Math.abs(p.y - q.y) > 0.3 ? p.y - q.y : p.x - q.x));
  columnas.forEach((columna, i) => { columna.id = `C${i + 1}`; });
  return {columnas, escala: k, descartados};
}

function agruparCoordenada(valores, tolerancia) {
  const ordenados = [...valores].sort((a, b) => a - b);
  const grupos = [];
  for (const valor of ordenados) {
    const ultimo = grupos.at(-1);
    if (ultimo && valor - ultimo.at(-1) <= tolerancia) ultimo.push(valor);
    else grupos.push([valor]);
  }
  return grupos.filter((g) => g.length >= 2).map((g) => r3(g.reduce((a, b) => a + b, 0) / g.length));
}

export function deducirEjes(columnas, tolerancia = 0.3) {
  const letra = (i) => (i < 26 ? String.fromCharCode(65 + i) : `A${String.fromCharCode(65 + i - 26)}`);
  return {
    x: agruparCoordenada(columnas.map((c) => c.x), tolerancia).map((x, i) => ({nombre: letra(i), x})),
    y: agruparCoordenada(columnas.map((c) => c.y), tolerancia).map((y, i) => ({nombre: String(i + 1), y})),
  };
}

// Área tributaria: mitad de la luz hacia la columna vecina en cada dirección,
// buscando vecinos en la misma fila/columna (franja de ±0.6 m).
export function areasTributarias(columnas, franja = 0.6) {
  return columnas.map((c) => {
    const mitad = (vecinos) => (vecinos.length ? Math.min(...vecinos) / 2 : 0);
    const misma = (o, eje) => o !== c && Math.abs((eje === "x" ? o.y - c.y : o.x - c.x)) <= franja;
    const izq = mitad(columnas.filter((o) => misma(o, "x") && o.x < c.x - 0.05).map((o) => c.x - o.x));
    const der = mitad(columnas.filter((o) => misma(o, "x") && o.x > c.x + 0.05).map((o) => o.x - c.x));
    const abj = mitad(columnas.filter((o) => misma(o, "y") && o.y < c.y - 0.05).map((o) => c.y - o.y));
    const arr = mitad(columnas.filter((o) => misma(o, "y") && o.y > c.y + 0.05).map((o) => o.y - c.y));
    const ancho = izq + der || 1, largo = abj + arr || 1;
    return {...c, at: r2(ancho * largo), aislada: !(izq + der) || !(abj + arr)};
  });
}

export function predimensionarZapatas(columnas, opciones = {}) {
  const o = {...CARGAS_POR_DEFECTO, ...Object.fromEntries(Object.entries(opciones).filter(([, v]) => Number.isFinite(Number(v)) && Number(v) > 0).map(([k, v]) => [k, Number(v)]))};
  const zapatas = columnas.map((c) => {
    const pesoColumna = c.b * c.h * o.alturaPiso * 2.4 * o.pisos;
    const pd = c.at * o.pisos * o.cargaMuerta + pesoColumna;
    const pl = c.at * o.pisos * o.cargaViva;
    // 10 % adicional por peso propio de zapata y relleno; volados iguales.
    const area = (1.1 * (pd + pl)) / o.qadm;
    const lado = Math.sqrt(area);
    const redondear = (v) => Math.max(0.8, Math.ceil(v / 0.05) * 0.05);
    const B = redondear(lado + (c.b - c.h) / 2), L = redondear(lado + (c.h - c.b) / 2);
    return {...c, pd: r2(pd), pl: r2(pl), B: r2(B), L: r2(L), x0: r3(c.x - B / 2), y0: r3(c.y - L / 2), x1: r3(c.x + B / 2), y1: r3(c.y + L / 2)};
  });
  const traslapes = [];
  for (let i = 0; i < zapatas.length; i++) for (let j = i + 1; j < zapatas.length; j++) {
    const a = zapatas[i], b = zapatas[j];
    if (a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) traslapes.push(`${a.id}-${b.id}`);
  }
  return {zapatas, traslapes, opciones: o};
}

// Segmentos de las capas estructurales del dibujo abierto (líneas y polilíneas;
// los bloques y sombreados se cuentan pero no se analizan todavía).
export function segmentosDesdeEntidades(entidades, capas, leerPolilinea) {
  const segmentos = [];
  const ignorados = {bloques: 0, sombreados: 0};
  for (const entidad of entidades) {
    if (!capaEstructural(entidad.layer, capas)) continue;
    const tipo = String(entidad.dxfTypeName ?? "").toUpperCase();
    if (tipo === "LINE" && entidad.startPoint && entidad.endPoint) {
      segmentos.push({layer: entidad.layer, a: entidad.startPoint, b: entidad.endPoint});
    } else if (leerPolilinea && (tipo.endsWith("POLYLINE") || Number.isInteger(entidad.numberOfVertices))) {
      const nodos = leerPolilinea(entidad);
      const cerrada = entidad.closed === true;
      for (let i = 0; i < nodos.length - 1 + (cerrada ? 1 : 0); i++) {
        segmentos.push({layer: entidad.layer, a: nodos[i], b: nodos[(i + 1) % nodos.length], cerrada});
      }
    } else if (tipo === "INSERT") ignorados.bloques++;
    else if (tipo === "HATCH") ignorados.sombreados++;
  }
  return {segmentos, ignorados};
}

// ---------- Sección de vigas (reglas del despacho aprendidas de sus planillas) ----------
// Fuente: scripts/agente/aprender-reglas-metrado.mjs → metrado/reglasDespacho.js (secciones de
// las vigas metradas por el ingeniero en sus planillas); si no hay reglas, los criterios
// (criteriosEstructurales.js: V(0.25x0.40), h = L/12). E.060 21.5.1.3: ancho mínimo 0.25 m en
// vigas de sistemas sismorresistentes.

// Espesor de una columna o placa (m): rectangular → su lado menor; en L o T, el espesor t de
// las alas, de (b + h)·t − t² = área (módulo 1: placa L 1.50x1.00 de 0.66 m² → 0.30).
export function espesorDeApoyo(c) {
  const b = Number(c?.b), h = Number(c?.h), area = Number(c?.area);
  if (!(b > 0 && h > 0)) return null;
  const lado = Math.min(b, h);
  if (!(area > 0) || /rect|trapecio/i.test(c.forma ?? "rect") || area >= 0.95 * b * h) return lado;
  const s = b + h, disc = s * s - 4 * area;
  return disc > 0 ? Math.min(lado, (s - Math.sqrt(disc)) / 2) : lado;
}

const redondear = (v, paso) => Math.round(v / paso + 1e-9) * paso;
const r2v = (v) => Math.round(v * 100) / 100;

// luz: luz libre (entre caras) que manda el peralte. cargaLosa: la viga recibe las viguetas
// (perpendicular a ellas); si no, va con el peralte de las vigas que no cargan losa.
// apoyos: columnas o placas donde llega (el ancho no pasa de su espesor).
// reglas: las del despacho (REGLAS_DESPACHO.vigas); criterios: CRITERIOS.vigas.
// F2: el diseño de OpenSeesPy (PythonEngineController) puede pedir más peralte: se pasa como
// peralteMinimo y la regla nunca devuelve menos.
export function seccionVigaPorLuz({luz, cargaLosa = true, apoyos = [], peralteMinimo = 0}, reglas = null, criterios = {ancho: 0.25, peraltaMinimo: 0.4}) {
  const bMin = criterios.ancho ?? 0.25;
  if (!reglas?.luzSobrePeralte) {
    // Sin reglas aprendidas: V(0.25x0.40), h = L/12 a 5 cm.
    return {b: bMin, h: r2v(Math.max(criterios.peraltaMinimo ?? 0.4, peralteMinimo, Math.ceil(luz / 12 / 0.05 - 1e-9) * 0.05))};
  }
  const bMax = Math.max(bMin, reglas.ancho ?? bMin);
  const espesores = apoyos.map(espesorDeApoyo).filter((e) => e > 0);
  const b = espesores.length ? Math.min(bMax, Math.max(bMin, redondear(Math.max(...espesores), 0.05))) : bMax;
  const hSecundaria = reglas.secundaria ?? criterios.peraltaMinimo ?? 0.4;
  // Peraltes del despacho en múltiplos de 0.10 (0.40, 0.50, 0.60, 0.70).
  const h = cargaLosa ? Math.max(hSecundaria, redondear(luz / reglas.luzSobrePeralte, 0.1)) : hSecundaria;
  return {b: r2v(b), h: r2v(Math.max(h, peralteMinimo))};
}

// Peralte de vigas como el despacho (medido en 511 tramos de sus plantas de losa: 29.9 % → 56.8 %
// de peraltes exactos con la dirección de viguetas del agente). Una sección principal por planta:
//   principal (carga losa y su línea salva ≥ 0.8 de la mayor luz que carga):
//     h = max(h_s + Δ(pisos), redondeo a 0.05 de L_max entre ejes / 12), Δ = 0 · 0.10 · 0.20 (1 · 2 · 3+ pisos)
//   las demás: h_s (secundaria, dato del proyecto; 0.40 por defecto).
// Ancho como seccionVigaPorLuz (espesor de los apoyos hasta el ancho del despacho). Es
// predimensionamiento: el peralte final lo fijan el análisis y la deriva (E.030).
export function seccionVigaDespacho({luzMayor, principal = true, pisos = 1, secundaria = 0.4, apoyos = [], peralteMinimo = 0}, reglas = null, criterios = {ancho: 0.25, peraltaMinimo: 0.4}) {
  const bMin = criterios.ancho ?? 0.25;
  const bMax = Math.max(bMin, reglas?.ancho ?? 0.3);
  const espesores = apoyos.map(espesorDeApoyo).filter((e) => e > 0);
  const b = espesores.length ? Math.min(bMax, Math.max(bMin, redondear(Math.max(...espesores), 0.05))) : bMax;
  const hs = secundaria > 0 ? secundaria : (criterios.peraltaMinimo ?? 0.4);
  const delta = pisos >= 3 ? 0.2 : pisos === 2 ? 0.1 : 0;
  const h = principal ? Math.max(hs + delta, redondear(luzMayor / 12, 0.05)) : hs;
  return {b: r2v(b), h: r2v(Math.max(h, peralteMinimo))};
}
