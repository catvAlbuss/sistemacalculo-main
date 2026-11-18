// Metrado de estructuras desde el modelo que dibujó el agente (laminasConPlantilla → modelo).
//
// Sigue la planilla de metrados del despacho (METRADOS_ESTRUCTURAS, módulo 14): partidas con
// el código del presupuesto (02.01 movimiento de tierras, 02.02 concreto simple, 02.03
// concreto armado), y en cada una una fila por elemento: elementos similares × largo × ancho
// × alto × veces; el acero por varilla: (longitud + gancho) × varillas × kg/m.
// Los criterios de metrado (solado, esponjamiento, ganchos, anclajes, factor de losa) son los
// de esa planilla: si la comparación con el metrado del ingeniero muestra diferencias, se
// ajustan aquí (scripts/agente/comparar-metrado.mjs).

import {CRITERIOS, posicionesEstribos} from "../criterios/criteriosEstructurales.js";

export const CRITERIOS_METRADO = {
  solado: 0.10,                 // m — "Zapata corrida 1 … 2.10" = Df 2.00 + solado 0.10
  esponjamiento: 1.2,           // eliminación = (excavación − relleno) × 1.2
  rellenoPrestamo: 0.20,        // m — "N.R … 0.20"
  sobrecimiento: {alto: 0.45},  // m — planilla: 0.13 x 0.45; ancho = ladrillo sin tarrajeo
  ladrillo: (muro) => (muro <= 0.2 ? 0.13 : 0.23), // soga (muro de 0.15) o cabeza (muro de 0.25)
  anchoPuerta: 0.9,             // m — el sobrecimiento no va bajo la puerta
  kgm: {'1/4"': 0.25, '3/8"': 0.56, '1/2"': 0.99, '5/8"': 1.55, '3/4"': 2.235, '1"': 3.97},
  columnas: {anclaje: 0.55, gancho: 0.6, ganchoEstribo: 0.3, recubrimiento: 0.04},
  vigas: {barras: 4, barra: '5/8"', anclaje: 0.74, gancho: 0.6, ganchoEstribo: 0.3, recubrimiento: 0.045},
  columnetas: {barra: '3/8"', anclaje: 0.4, estribo: '1/4"', ganchoEstribo: 0.12},
  platea: {barra: '3/4"', separacion: 0.15, recubrimiento: 0.075, gancho: 0.5, capas: 2},
  losa: {
    factor: {0.17: 0.08, 0.2: 0.0875, 0.25: 0.1, 0.3: 0.1125}, // m³ de concreto por m² de aligerado
    ladrillosPorM2: 8.4,
    barra: '3/8"', gancho: 0.4, temperatura: '1/4"', separacionTemperatura: 0.25,
  },
};

const r4 = (v) => Math.round(v * 10000) / 10000;
const kgm = (d) => CRITERIOS_METRADO.kgm[d] ?? 0;

// Lados del rectángulo que envuelve el polígono, alineado con su lado más largo.
export function dimensionesRectangulo(poli = []) {
  if (poli.length < 3) return {largo: 0, ancho: 0};
  let mejor = null;
  for (let i = 0; i < poli.length; i++) {
    const a = poli[i], b = poli[(i + 1) % poli.length];
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (l < 1e-6) continue;
    const u = {x: (b.x - a.x) / l, y: (b.y - a.y) / l}, v = {x: -u.y, y: u.x};
    const su = poli.map((p) => p.x * u.x + p.y * u.y), sv = poli.map((p) => p.x * v.x + p.y * v.y);
    const d1 = Math.max(...su) - Math.min(...su), d2 = Math.max(...sv) - Math.min(...sv);
    if (!mejor || d1 * d2 < mejor.area) mejor = {area: d1 * d2, largo: Math.max(d1, d2), ancho: Math.min(d1, d2)};
  }
  return {largo: mejor.largo, ancho: mejor.ancho};
}

// Refuerzo del cuadro de columnas ("12Ø5/8"", "8Ø5/8" + 4Ø1/2"") → [{n, d}].
export function barrasDeRefuerzo(texto) {
  return [...String(texto ?? "").matchAll(/(\d+)\s*[Ø∅]\s*(\d\/\d|\d)"?/g)].map((m) => ({n: Number(m[1]), d: `${m[2]}"`}));
}

// Fila de concreto, encofrado o curado: total = simil × largo × ancho × alto × veces (lo que aplique).
const fila = (descripcion, {simil = 1, largo = null, ancho = null, alto = null, veces = 1, parcial = null}) => {
  const f = [largo, ancho, alto].filter((v) => v !== null);
  return {descripcion, simil, largo, ancho, alto, veces, parcial: r4(parcial ?? simil * veces * f.reduce((a, b) => a * b, 1))};
};
// Fila de acero: (longitud + gancho) × varillas × simil × kg/m.
const filaAcero = (descripcion, {simil = 1, longitud, gancho = 0, varillas, diametro}) => {
  const metros = simil * (longitud + gancho) * varillas;
  return {descripcion, simil, longitud: r4(longitud), gancho, varillas, metros: r4(metros), kgm: kgm(diametro), parcial: r4(metros * kgm(diametro)), diametro};
};
const partida = (item, descripcion, und, filas) => ({item, descripcion, und, filas, total: r4(filas.reduce((s, f) => s + f.parcial, 0))});
const titulo = (item, descripcion) => ({item, descripcion, titulo: true});

// modelo: el de laminasConPlantilla. Devuelve {partidas, resumen, notas}.
export function metradoEstructuras(modelo) {
  const M = CRITERIOS_METRADO;
  const cim = modelo.cimentacion ?? {};
  const df = cim.df ?? CRITERIOS.platea.df, hz = cim.hz ?? CRITERIOS.platea.espesor;
  const platea = cim.tipo === "platea";
  // Platea: su área real (polígono; con ejes inclinados el rectángulo envolvente la infla) y un
  // ancho equivalente área/largo (módulo 14: 8.89 m² = 3.73 x 2.38; el ingeniero 3.73 x 2.39).
  const areaPlatea = platea ? (cim.area ?? areaPoligono(cim.huella)) : (cim.zapatas ?? []).reduce((s, z) => s + z.B * z.L, 0);
  const lp = platea ? dimensionesRectangulo(cim.huella).largo : 0;
  const ap = platea && lp ? areaPlatea / lp : 0;
  const tramos = modelo.cimientoCorrido?.tramos ?? [];
  const cc = {ancho: modelo.cimientoCorrido?.ancho ?? CRITERIOS.cimientoCorrido.ancho, alto: CRITERIOS.cimientoCorrido.alto};
  const columnas = modelo.columnas ?? [];
  const areaColumnas = columnas.reduce((s, c) => s + (c.area ?? 0), 0);
  const areaMuros = tramos.reduce((s, t) => s + t.largo * (t.espesor ?? 0.13), 0);
  const areaInterior = Math.max(0, (platea ? areaPlatea : (modelo.losa?.areaPanos ?? 0)) - areaMuros - areaColumnas);
  const niveles = Math.max(1, modelo.niveles ?? 1);
  const nLosas = (niveles - 1) + (modelo.losaTecho === false ? 0 : 1);
  const altoColumna = (df - hz) + (modelo.techo ?? 3); // de la cara superior de la cimentación al techo
  const vh = modelo.vigaPeralte ?? CRITERIOS.vigas.peraltaMinimo;
  const altoMuros = Math.max(0.5, (modelo.techo ?? 3) - niveles * vh); // columnetas: muro de cada nivel
  const notas = [];
  const partidas = [titulo("02", "ESTRUCTURAS"), titulo("02.01", "MOVIMIENTO DE TIERRAS")];

  // ---- 02.01 Movimiento de tierras ----
  const nombreCim = platea ? "Losa de cimentación (platea)" : "Zapatas";
  const excavacion = partida(platea ? "02.01.02.01.03" : "02.01.02.01.01", platea ? "EXCAVACION PARA LOSA DE CIMENTACION C/MAQUINARIA" : "EXCAVACION DE ZANJAS PARA ZAPATA C/MAQUINARIA", "m3",
    platea ? [fila(nombreCim, {largo: lp, ancho: ap, alto: df + M.solado})]
      : (cim.zapatas ?? []).map((z, i) => fila(`Zapata ${i + 1}`, {largo: z.L, ancho: z.B, alto: df + M.solado})));
  const relleno = partida("02.01.03.02", "RELLENO CON MATERIAL PROPIO AFIRMADO Y COMPACTADO", "m3", [
    fila(nombreCim, {largo: platea ? lp : null, ancho: platea ? ap : null, alto: df - hz, parcial: platea ? null : areaPlatea * (df - hz)}),
    ...tramos.map((t, i) => fila(`Cimiento corrido ${i + 1}`, {largo: t.largo, ancho: cc.ancho, alto: cc.alto, veces: -1})),
    ...gruposColumnas(columnas).map((g) => fila(`Columna ${g.tipo}`, {simil: g.n, largo: null, ancho: g.area, alto: df - hz, veces: -1})),
  ]);
  partidas.push(titulo("02.01.02", "EXCAVACIONES"), excavacion, titulo("02.01.03", "RELLENOS"), relleno,
    partida("02.01.03.05", "RELLENO CON MATERIAL PRESTAMO AFIRMADO Y COMPACTADO", "m3", [fila("Nivel de relleno bajo el piso", {ancho: areaInterior, alto: M.rellenoPrestamo})]),
    titulo("02.01.04", "NIVELACION INTERIOR Y APISONADO"),
    partida("02.01.04.01", "NIVELACION INTERIOR Y APISONADO", "m2", [fila("Área interior", {ancho: areaInterior})]),
    titulo("02.01.05", "ELIMINACION DE MATERIAL EXCEDENTE"));
  const excedente = Math.max(0, excavacion.total - relleno.total);
  for (const [item, desc] of [["02.01.05.01", "ACARREO DE MATERIAL EXCEDENTE CON EQUIPO D= 30 M"], ["02.01.05.02", "ELIMINACION DE MATERIAL EXCEDENTE CON EQUIPO D=4,6 KM"]]) {
    partidas.push(partida(item, desc, "m3", [fila("(Excavación − relleno) × esponjamiento", {parcial: excedente * M.esponjamiento})]));
  }

  // ---- 02.02 Concreto simple ----
  partidas.push(titulo("02.02", "OBRAS DE CONCRETO SIMPLE"), titulo("02.02.01", "SOLADOS"),
    partida(platea ? "02.02.01.02" : "02.02.01.01", `CONCRETO EN SOLADOS DE ${platea ? "LOSA DE CIMENTACION" : "ZAPATAS"} E=0.10m, F'C=100KG/CM2`, "m2",
      platea ? [fila(nombreCim, {largo: lp, ancho: ap})] : (cim.zapatas ?? []).map((z, i) => fila(`Zapata ${i + 1}`, {largo: z.L, ancho: z.B}))),
    titulo("02.02.02", "FALSO PISO"),
    partida("02.02.02.01", "FALSO PISO DE CONCRETO F'C=140KG/CM2; E=4\"", "m2", [fila("Área interior", {ancho: areaInterior})]),
    partida("02.02.02.02", "ENCOFRADO Y DESENCOFRADO EN FALSO PISO, E=0.10m", "m2", [fila("Área interior", {ancho: areaInterior})]));
  if (tramos.length) {
    const sc = M.sobrecimiento.alto;
    const largoSC = (t) => Math.max(0, t.largo - (t.conPuerta ? M.anchoPuerta : 0));
    partidas.push(titulo("02.02.03", "CIMIENTOS CORRIDOS"),
      partida("02.02.03.01", `CONCRETO EN CIMIENTO CORRIDO, ${CRITERIOS.concreto.cimientoCorrido.toUpperCase()}`, "m3", tramos.map((t, i) => fila(`Tramo ${i + 1}`, {largo: t.largo, ancho: cc.ancho, alto: cc.alto}))),
      partida("02.02.03.02", "ENCOFRADO Y DESENCOFRADO EN CIMIENTO CORRIDO", "m2", tramos.map((t, i) => fila(`Tramo ${i + 1}`, {largo: t.largo, alto: cc.alto, veces: 2}))),
      titulo("02.02.04", "SOBRECIMIENTOS"),
      partida("02.02.04.01", `CONCRETO EN SOBRECIMIENTO, ${CRITERIOS.concreto.sobrecimiento.toUpperCase()}`, "m3", tramos.map((t, i) => fila(`Tramo ${i + 1}${t.conPuerta ? " (sin la puerta)" : ""}`, {largo: largoSC(t), ancho: M.ladrillo(t.espesor ?? 0.15), alto: sc}))),
      partida("02.02.04.02", "ENCOFRADO Y DESENCOFRADO EN SOBRECIMIENTOS", "m2", tramos.map((t, i) => fila(`Tramo ${i + 1}`, {largo: largoSC(t), alto: sc, veces: 2}))),
      partida("02.02.04.03", "CURADO DEL CONCRETO EN SOBRECIMIENTO", "m2", tramos.map((t, i) => fila(`Tramo ${i + 1}`, {largo: largoSC(t), alto: sc, veces: 2}))));
  }

  // ---- 02.03 Concreto armado ----
  partidas.push(titulo("02.03", "OBRAS DE CONCRETO ARMADO"));
  if (platea) {
    const P = M.platea;
    const barras = (luzLado, otroLado) => Math.floor((otroLado - 2 * P.recubrimiento) / P.separacion) + 1;
    partidas.push(titulo("02.03.01", "LOSA DE CIMENTACION"),
      partida("02.03.01.01", "CONCRETO EN LOSA DE CIMENTACION F'C=210 KG/CM2", "m3", [fila(nombreCim, {largo: lp, ancho: ap, alto: hz})]),
      partida("02.03.01.02", "ACERO EN LOSA DE CIMENTACION CON F'Y=4200 KG/CM2", "kg", [
        filaAcero(`Longitudinal Ø${P.barra} (superior e inferior)`, {simil: P.capas, longitud: lp - 2 * P.recubrimiento, gancho: P.gancho, varillas: barras(lp, ap), diametro: P.barra}),
        filaAcero(`Transversal Ø${P.barra} (superior e inferior)`, {simil: P.capas, longitud: ap - 2 * P.recubrimiento, gancho: P.gancho, varillas: barras(ap, lp), diametro: P.barra}),
      ]),
      partida("02.03.01.03", "CURADO DEL CONCRETO EN LOSA DE CIMENTACION", "m2", [fila(nombreCim, {largo: lp, ancho: ap})]));
  } else if (cim.zapatas?.length) {
    partidas.push(titulo("02.03.02", "ZAPATAS"),
      partida("02.03.02.01", "CONCRETO EN ZAPATAS F'C=210 KG/CM2", "m3", cim.zapatas.map((z, i) => fila(`Zapata ${i + 1}`, {largo: z.L, ancho: z.B, alto: hz}))),
      partida("02.03.02.03", "CURADO DEL CONCRETO EN ZAPATAS", "m2", cim.zapatas.map((z, i) => fila(`Zapata ${i + 1}`, {largo: z.L, ancho: z.B}))));
    notas.push("Acero de zapatas: aún no se metra (falta el armado de zapatas en las láminas).");
  }

  // Columnas
  const C = M.columnas;
  const grupos = gruposColumnas(columnas);
  partidas.push(titulo("02.03.06", "COLUMNAS"),
    partida("02.03.06.01.01", `CONCRETO EN COLUMNAS F'C=${CRITERIOS.concreto.columnas} KG/CM2`, "m3", grupos.map((g) => fila(`Columna ${g.tipo}`, {simil: g.n, ancho: g.area, alto: altoColumna}))),
    partida("02.03.06.01.02", "ENCOFRADO Y DESENCOFRADO EN COLUMNAS", "m2", grupos.map((g) => fila(`Columna ${g.tipo}`, {simil: g.n, largo: g.perimetro, alto: altoColumna}))),
    partida("02.03.06.01.03", "ACERO EN COLUMNAS CON F'Y=4200 KG/CM2", "kg", grupos.flatMap((g) => {
      const ref = barrasDeRefuerzo(modelo.refuerzoColumnas?.find((r) => r.tipo === g.tipo)?.refuerzo);
      const rectangular = g.forma === "rectangular";
      const nEstribos = posicionesEstribos(CRITERIOS.columnas.distribucionPorSeccion?.({prefijo: String(g.tipo).replace(/\d+$/, ""), clase: g.clase, b: g.b, h: g.h}) ?? CRITERIOS.columnas.distribucion, altoColumna).length;
      return [
        ...ref.map((b) => filaAcero(`${g.tipo}: longitudinal ${b.n}Ø${b.d}`, {simil: g.n, longitud: altoColumna + C.anclaje, gancho: C.gancho, varillas: b.n, diametro: b.d})),
        filaAcero(`${g.tipo}: estribos Ø${CRITERIOS.columnas.estribo}`, {simil: g.n, longitud: g.perimetro - (rectangular ? 8 : 16) * C.recubrimiento, gancho: C.ganchoEstribo, varillas: nEstribos * (rectangular ? 1 : 2), diametro: CRITERIOS.columnas.estribo}),
      ];
    })),
    partida("02.03.06.01.04", "CURADO DEL CONCRETO EN COLUMNAS", "m2", grupos.map((g) => fila(`Columna ${g.tipo}`, {simil: g.n, largo: g.perimetro, alto: altoColumna}))));

  // Vigas (una por tramo de eje; con varios niveles, una por nivel)
  const V = M.vigas;
  // Copias: el largo metrado incluye el alero (el modelo queda igual; la losa descuenta solo
  // lo que las vigas ocupan dentro de los paños).
  const vigas = (modelo.vigas ?? []).map((v) => ({...v, largo: v.largo + (v.alero ?? 0), largoPano: v.largo}));
  if (vigas.length) {
    const nombreViga = (v) => `${v.eje ? `Eje ${v.eje} ` : ""}${v.tipo} (${v.b.toFixed(2)}x${v.h.toFixed(2)})${v.alero ? " con alero" : ""}`;
    partidas.push(titulo("02.03.07", "VIGAS"),
      partida("02.03.07.01.01", "CONCRETO EN VIGAS F'C=210 KG/CM2", "m3", vigas.map((v) => fila(nombreViga(v), {simil: niveles, largo: v.largo, ancho: v.b, alto: v.h}))),
      partida("02.03.07.01.02", "ENCOFRADO Y DESENCOFRADO EN VIGAS", "m2", vigas.map((v) => fila(nombreViga(v), {simil: niveles, largo: v.largo, ancho: v.b + 2 * v.h}))),
      partida("02.03.07.01.03", "ACERO EN VIGAS CON F'Y=4200 KG/CM2", "kg", vigas.flatMap((v) => [
        filaAcero(`${nombreViga(v)}: ${V.barras}Ø${V.barra}`, {simil: niveles, longitud: v.largo + V.anclaje, gancho: V.gancho, varillas: V.barras, diametro: V.barra}),
        filaAcero(`${nombreViga(v)}: estribos Ø${CRITERIOS.vigas.estribo}`, {simil: niveles, longitud: 2 * (v.b + v.h) - 8 * V.recubrimiento, gancho: V.ganchoEstribo, varillas: posicionesEstribos(CRITERIOS.vigas.distribucion, v.largo).length, diametro: CRITERIOS.vigas.estribo}),
      ])),
      partida("02.03.07.01.04", "CURADO DE CONCRETO EN VIGAS", "m2", vigas.map((v) => fila(nombreViga(v), {simil: niveles, largo: v.largo, ancho: v.b + 2 * v.h}))));
  }

  // Columnetas de amarre (por código)
  const CC = M.columnetas;
  const ctas = gruposColumnetas(modelo.columnetas ?? []);
  if (ctas.length) {
    const nombre = (g) => `Columneta ${g.codigo ?? ""} (${g.b.toFixed(2)}x${g.h.toFixed(2)})`.replace("  ", " ");
    partidas.push(titulo("02.03.08", "COLUMNETAS DE AMARRE"),
      partida("02.03.08.01", `CONCRETO PARA COLUMNETAS DE AMARRE F'C=${CRITERIOS.concreto.columnetas} KG/CM2`, "m3", ctas.map((g) => fila(nombre(g), {simil: g.n, largo: g.b, ancho: g.h, alto: altoMuros}))),
      partida("02.03.08.02", "ENCOFRADO Y DESENCOFRADO NORMAL EN COLUMNETAS", "m2", ctas.map((g) => fila(nombre(g), {simil: g.n, largo: 2 * (g.b + g.h) - Math.min(g.b, g.h), alto: altoMuros}))),
      partida("02.03.08.03", "ACERO EN COLUMNETA FY=4200 KG/CM2", "kg", ctas.flatMap((g) => [
        filaAcero(`${nombre(g)}: ${2 * CRITERIOS.columnetas.varillasPorCara(Math.max(g.b, g.h))}Ø${CC.barra}`, {simil: g.n, longitud: altoMuros, gancho: CC.anclaje, varillas: 2 * CRITERIOS.columnetas.varillasPorCara(Math.max(g.b, g.h)), diametro: CC.barra}),
        filaAcero(`${nombre(g)}: estribos Ø${CC.estribo}`, {simil: g.n, longitud: 2 * (g.b + g.h) - 8 * CRITERIOS.columnetas.recubrimiento, gancho: CC.ganchoEstribo, varillas: posicionesEstribos(CRITERIOS.columnetas.distribucion, altoMuros).length, diametro: CC.estribo}),
      ])),
      partida("02.03.08.04", "CURADO EN COLUMNETAS", "m2", ctas.map((g) => fila(nombre(g), {simil: g.n, largo: 2 * (g.b + g.h) - Math.min(g.b, g.h), alto: altoMuros}))));
  }

  // Losa aligerada (una por nivel con losa)
  const losa = modelo.losa;
  if (losa && nLosas > 0) {
    const L = M.losa;
    const e = Math.round((losa.espesor ?? 0.2) * 100) / 100;
    const factor = L.factor[e] ?? L.factor[0.2] * (e / 0.2);
    // Área neta de losa: los paños menos lo que ocupan vigas y columnas (módulo 14: 8.89 −
    // 2.93 − 0.52 = 5.44 m²; el ingeniero 5.55).
    const areaVigas = vigas.reduce((s, v) => s + v.largoPano * v.b, 0);
    const area = Math.max(0, (losa.areaPanos > 0 ? losa.areaPanos : losa.areaBruta) - areaVigas - areaColumnas);
    const nivelTxt = (n) => (niveles > 1 ? `Nivel ${n}` : "Paño total");
    const porNivel = (f) => Array.from({length: nLosas}, (_, i) => f(i + 1));
    const panos = losa.panos?.length ? losa.panos : [{luz: Math.sqrt(area), viguetas: Math.round(Math.sqrt(area) / 0.4), area, ancho: Math.sqrt(area)}];
    partidas.push(titulo("02.03.11", "LOSAS ALIGERADAS"),
      partida("02.03.11.01", "CONCRETO EN LOSAS ALIGERADAS F'C=210 KG/CM2", "m3", porNivel((n) => fila(`${nivelTxt(n)} (factor ${factor} m³/m², e=${e.toFixed(2)})`, {ancho: area, alto: factor}))),
      partida("02.03.11.02", "ENCOFRADO Y DESENCOFRADO EN LOSAS ALIGERADAS", "m2", porNivel((n) => fila(nivelTxt(n), {ancho: area}))),
      partida("02.03.11.03", "ACERO EN LOSAS ALIGERADAS CON F'Y=4200 KG/CM2", "kg", porNivel((n) => panos.flatMap((p, i) => [
        filaAcero(`${nivelTxt(n)} paño ${i + 1}: positivo Ø${L.barra}`, {longitud: p.luz, gancho: L.gancho, varillas: p.viguetas, diametro: L.barra}),
        filaAcero(`${nivelTxt(n)} paño ${i + 1}: negativo Ø${L.barra}`, {simil: 2, longitud: p.luz / 4, gancho: 0.2, varillas: p.viguetas, diametro: L.barra}),
        filaAcero(`${nivelTxt(n)} paño ${i + 1}: temperatura Ø${L.temperatura}`, {longitud: p.ancho, gancho: 0.3, varillas: Math.floor(p.luz / L.separacionTemperatura) + 1, diametro: L.temperatura}),
      ])).flat()),
      partida("02.03.11.04", "LADRILLO HUECO DE ARCILLA RAYADO DE 15X30X30 CM P/TECHO ALIGERADO", "und", porNivel((n) => fila(`${nivelTxt(n)}: ${L.ladrillosPorM2} und/m²`, {ancho: area, alto: L.ladrillosPorM2, parcial: Math.ceil(area * L.ladrillosPorM2)}))),
      partida("02.03.11.05", "CURADO DEL CONCRETO EN LOSA ALIGERADA", "m2", porNivel((n) => fila(nivelTxt(n), {ancho: area}))));
  }
  notas.push("Aún no se metran (pendientes de definición geométrica; no se estiman): viguetas de amarre (VSa), canaleta de techo, correas y cobertura, juntas.");
  if (vigas.length) notas.push("Vigas: no incluye la viga de borde ni la viga de cumbrera de sección reducida (aún no se dibujan en las láminas).");
  if (ctas.length) notas.push(`Columnetas: altura uniforme provisional de ${altoMuros.toFixed(2)} m; verificar la altura real de cada una por vano (parapetos, cerramientos).`);
  if (platea) notas.push(`Acero de platea: Ø${M.platea.barra} @${M.platea.separacion.toFixed(2)} en ${M.platea.capas} capas (superior e inferior), en cada dirección; cada capa contada una sola vez.`);

  const resumen = {
    concreto: r4(partidas.filter((p) => p.und === "m3" && /^CONCRETO/.test(p.descripcion)).reduce((s, p) => s + p.total, 0)),
    acero: r4(partidas.filter((p) => p.und === "kg").reduce((s, p) => s + p.total, 0)),
    encofrado: r4(partidas.filter((p) => /^ENCOFRADO/.test(p.descripcion)).reduce((s, p) => s + p.total, 0)),
    excavacion: excavacion.total,
  };
  return {proyecto: modelo.proyecto, partidas, resumen, notas};
}

const areaPoligono = (P = []) => Math.abs(P.reduce((s, p, i) => s + p.x * P[(i + 1) % P.length].y - P[(i + 1) % P.length].x * p.y, 0)) / 2;

function gruposColumnas(columnas) {
  const m = new Map();
  for (const c of columnas) {
    const g = m.get(c.tipo) ?? {tipo: c.tipo, n: 0, area: 0, perimetro: 0, forma: c.forma, clase: c.clase, b: c.b, h: c.h};
    g.n++; g.area += c.area ?? c.b * c.h; g.perimetro += c.perimetro ?? 2 * (c.b + c.h);
    m.set(c.tipo, g);
  }
  return [...m.values()].map((g) => ({...g, area: r4(g.area / g.n), perimetro: r4(g.perimetro / g.n)}));
}

function gruposColumnetas(columnetas) {
  const m = new Map();
  for (const c of columnetas) {
    const [b, h] = [c.b, c.h].sort((x, y) => y - x);
    const k = c.codigo ?? `${b.toFixed(2)}x${h.toFixed(2)}`;
    const g = m.get(k) ?? {codigo: c.codigo, n: 0, b, h};
    g.n++;
    m.set(k, g);
  }
  return [...m.values()];
}
