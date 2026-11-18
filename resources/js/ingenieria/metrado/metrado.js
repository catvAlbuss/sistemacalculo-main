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
import {nombreElemento} from "./terminologia.js";

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
  // Lo que sigue sale de la planilla del ingeniero del módulo de referencia XIV (partidas
  // 02.03.07 a 02.05): secciones y criterios del despacho para lo que la arquitectura no acota.
  vsa: {b: 0.13, h: 0.2, barras: 4, barra: '3/8"', anclaje: 0.4, estribo: '1/4"', ganchoEstribo: 0.12, recubrimiento: 0.025}, // "Eje 8 Vsa-(0.13X0.20M)": 4Ø3/8", estribos Ø1/4"
  vigaBorde: {b: 0.3, h: 0.45},              // "Viga de Borde (0.30X0.45M)" (VIGA BORDE en el pórtico de la plantilla)
  cumbrera: {area: 0.08, perimetro: 0.71},   // "Viga Cumbrera": sección reducida, Área 0.08 m², perímetro 0.71 m
  canaleta: {area: 0.09, perimetro: 1.62, longitudinales: 5, barra: '3/8"', transversal: 1.35, separacion: 0.125}, // 5Ø3/8" long. y 31 Ø3/8" de 1.35 en 3.79 m
  correas: {separacion: 0.9, aleroLateral: 0.47, descripcion: 'TUBO ASTM A500 LAC y GALV CUADRADO DE F° 2"X2"X2.00mm'}, // 8 correas de 4.73 m (3.79 + 2 × 0.47)
  columnetaParapeto: CRITERIOS.vanos.alfeizar + CRITERIOS.cimientoCorrido.sobrecimientoAlto, // "Eje 8 y 10 C-pa … 1.30": junto a las ventanas, hasta el alféizar
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
// calculado: false cuando el parcial no sale de las medidas (eliminación, ladrillos redondeados).
// obs: de dónde sale la fila (medida del plano, dato del proyecto, criterio); termino y vars:
// el tipo de elemento y sus datos, para nombrarlo con la terminología del despacho.
const fila = (descripcion, {simil = 1, largo = null, ancho = null, alto = null, veces = 1, parcial = null, obs = null, termino = null, vars = null}) => {
  const f = [largo, ancho, alto].filter((v) => v !== null);
  return {descripcion, simil, largo, ancho, alto, veces, parcial: r4(parcial ?? simil * veces * f.reduce((a, b) => a * b, 1)), calculado: parcial === null,
    ...(obs ? {obs} : {}), ...(termino ? {termino, vars: vars ?? {}} : {})};
};
// Fila que el agente calcula con un criterio del despacho (no con medidas del plano): se marca
// para que el especialista la confirme en la vista previa.
const propuesta = (f, motivo) => ({...f, propuesto: motivo});
// Fila de acero: (longitud + gancho) × varillas × simil × kg/m.
const filaAcero = (descripcion, {simil = 1, longitud, gancho = 0, varillas, diametro, obs = null}) => {
  const metros = simil * (longitud + gancho) * varillas;
  return {descripcion, simil, longitud: r4(longitud), gancho, varillas, metros: r4(metros), kgm: kgm(diametro), parcial: r4(metros * kgm(diametro)), diametro, ...(obs ? {obs} : {})};
};
// obs de la partida: el criterio común a sus filas.
const partida = (item, descripcion, und, filas, obs = null) => ({item, descripcion, und, filas, total: r4(filas.reduce((s, f) => s + f.parcial, 0)), ...(obs ? {obs} : {})});
const m2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
const titulo = (item, descripcion) => ({item, descripcion, titulo: true});

// modelo: el de laminasConPlantilla. Devuelve {partidas, resumen, notas}.
// terminos: terminología aprendida del despacho (terminologia.js → terminosAprendidos).
export function metradoEstructuras(modelo, {terminos = {}} = {}) {
  const nombre = (termino, vars) => nombreElemento(termino, vars, terminos);
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
  const F = {hz: cim.fuentes?.hz ?? "criterio del despacho", df: cim.fuentes?.df ?? "criterio del despacho"};
  const nombreCim = platea ? nombre("platea", {n: 1}) : "Zapatas";
  const cimF = (extra = {}) => (platea ? {termino: "platea", vars: {n: 1}, ...extra} : extra);
  const planta = platea ? `platea medida en la planta: área ${m2(areaPlatea)} m², largo ${m2(lp)} y ancho equivalente ${m2(ap)} (área / largo)` : "zapata medida en la planta";
  const zapataN = (i) => nombre("zapata", {n: i + 1});
  const excavacion = partida(platea ? "02.01.02.01.03" : "02.01.02.01.01", platea ? "EXCAVACION PARA LOSA DE CIMENTACION C/MAQUINARIA" : "EXCAVACION DE ZANJAS PARA ZAPATA C/MAQUINARIA", "m3",
    platea ? [fila(nombreCim, {largo: lp, ancho: ap, alto: df + M.solado, ...cimF()})]
      : (cim.zapatas ?? []).map((z, i) => fila(zapataN(i), {largo: z.L, ancho: z.B, alto: df + M.solado, termino: "zapata", vars: {n: i + 1}})),
    `Largo y ancho: ${planta}. Alto = Df ${m2(df)} (${F.df}) + solado ${m2(M.solado)}.`);
  const nombreTramo = (t, i, base) => (t.eje ? nombre(`${base}Eje`, {eje: t.eje, n: i + 1}) : nombre(base, {n: i + 1}));
  const terminoTramo = (t, i, base) => ({termino: t.eje ? `${base}Eje` : base, vars: {eje: t.eje ?? "", n: i + 1}});
  const relleno = partida("02.01.03.02", "RELLENO CON MATERIAL PROPIO AFIRMADO Y COMPACTADO", "m3", [
    fila(nombreCim, {largo: platea ? lp : null, ancho: platea ? ap : null, alto: df - hz, parcial: platea ? null : areaPlatea * (df - hz), ...cimF(),
      obs: `Alto = Df − Hz = ${m2(df)} − ${m2(hz)} (Df: ${F.df}; Hz: ${F.hz}).`}),
    ...tramos.map((t, i) => fila(nombreTramo(t, i, "cimiento"), {largo: t.largo, ancho: cc.ancho, alto: cc.alto, veces: -1, ...terminoTramo(t, i, "cimiento"),
      obs: `Se descuenta el cimiento corrido${t.eje ? ` del eje ${t.eje}` : ""}: largo medido en la planta; sección ${m2(cc.ancho)} × ${m2(cc.alto)} de los cortes del expediente.`})),
    ...gruposColumnas(columnas).map((g) => fila(nombre("columna", {tipo: g.tipo}), {simil: g.n, largo: null, ancho: g.area, alto: df - hz, veces: -1, termino: "columna", vars: {tipo: g.tipo},
      obs: `Se descuenta la columna: área de la sección dibujada (${m2(g.area)} m²) en la altura del relleno (Df − Hz).`})),
  ]);
  const interior = `Área interior = ${platea ? "platea" : "paños"} ${m2(platea ? areaPlatea : (modelo.losa?.areaPanos ?? 0))} − muros ${m2(areaMuros)} − columnas ${m2(areaColumnas)} m²`;
  const areaInt = (extra = {}) => fila(nombre("areaInterior"), {ancho: areaInterior, termino: "areaInterior", ...extra});
  partidas.push(titulo("02.01.02", "EXCAVACIONES"), excavacion, titulo("02.01.03", "RELLENOS"), relleno,
    partida("02.01.03.05", "RELLENO CON MATERIAL PRESTAMO AFIRMADO Y COMPACTADO", "m3", [areaInt({alto: M.rellenoPrestamo})], `${interior}; espesor ${m2(M.rellenoPrestamo)} (planilla del despacho).`),
    titulo("02.01.04", "NIVELACION INTERIOR Y APISONADO"),
    partida("02.01.04.01", "NIVELACION INTERIOR Y APISONADO", "m2", [areaInt()], `${interior}.`),
    titulo("02.01.05", "ELIMINACION DE MATERIAL EXCEDENTE"));
  const excedente = Math.max(0, excavacion.total - relleno.total);
  for (const [item, desc] of [["02.01.05.01", "ACARREO DE MATERIAL EXCEDENTE CON EQUIPO D= 30 M"], ["02.01.05.02", "ELIMINACION DE MATERIAL EXCEDENTE CON EQUIPO D=4,6 KM"]]) {
    partidas.push(partida(item, desc, "m3", [fila("(Excavación − relleno) × esponjamiento", {parcial: excedente * M.esponjamiento})],
      `(Excavación ${m2(excavacion.total)} − relleno ${m2(relleno.total)}) × esponjamiento ${M.esponjamiento}.`));
  }

  // ---- 02.02 Concreto simple ----
  partidas.push(titulo("02.02", "OBRAS DE CONCRETO SIMPLE"), titulo("02.02.01", "SOLADOS"),
    partida(platea ? "02.02.01.02" : "02.02.01.01", `CONCRETO EN SOLADOS DE ${platea ? "LOSA DE CIMENTACION" : "ZAPATAS"} E=0.10m, F'C=100KG/CM2`, "m2",
      platea ? [fila(nombreCim, {largo: lp, ancho: ap, ...cimF()})] : (cim.zapatas ?? []).map((z, i) => fila(zapataN(i), {largo: z.L, ancho: z.B, termino: "zapata", vars: {n: i + 1}})),
      `Huella de la cimentación: ${planta}.`),
    titulo("02.02.02", "FALSO PISO"),
    partida("02.02.02.01", "FALSO PISO DE CONCRETO F'C=140KG/CM2; E=4\"", "m2", [areaInt()], `${interior}.`),
    partida("02.02.02.02", "ENCOFRADO Y DESENCOFRADO EN FALSO PISO, E=0.10m", "m2", [areaInt()], `${interior}.`));
  if (tramos.length) {
    const sc = M.sobrecimiento.alto;
    const largoSC = (t) => Math.max(0, t.largo - (t.conPuerta ? M.anchoPuerta : 0));
    const cimObs = `Tramos de muro medidos en la planta (sobre el eje cuando lo hay); sección ${m2(cc.ancho)} × ${m2(cc.alto)} de los cortes del expediente.`;
    const scObs = `Largo del tramo (sin la puerta: −${m2(M.anchoPuerta)} m); ancho = ladrillo (soga 0.13, cabeza 0.23); alto ${m2(sc)} de la planilla del despacho.`;
    const tramoSC = (t, i, extra) => fila(`${nombreTramo(t, i, "sobrecimiento")}${t.conPuerta ? " (sin la puerta)" : ""}`, {...extra, ...terminoTramo(t, i, "sobrecimiento")});
    partidas.push(titulo("02.02.03", "CIMIENTOS CORRIDOS"),
      partida("02.02.03.01", `CONCRETO EN CIMIENTO CORRIDO, ${CRITERIOS.concreto.cimientoCorrido.toUpperCase()}`, "m3", tramos.map((t, i) => fila(nombreTramo(t, i, "cimiento"), {largo: t.largo, ancho: cc.ancho, alto: cc.alto, ...terminoTramo(t, i, "cimiento")})), cimObs),
      partida("02.02.03.02", "ENCOFRADO Y DESENCOFRADO EN CIMIENTO CORRIDO", "m2", tramos.map((t, i) => fila(nombreTramo(t, i, "cimiento"), {largo: t.largo, alto: cc.alto, veces: 2, ...terminoTramo(t, i, "cimiento")})), `${cimObs} Dos caras.`),
      titulo("02.02.04", "SOBRECIMIENTOS"),
      partida("02.02.04.01", `CONCRETO EN SOBRECIMIENTO, ${CRITERIOS.concreto.sobrecimiento.toUpperCase()}`, "m3", tramos.map((t, i) => tramoSC(t, i, {largo: largoSC(t), ancho: M.ladrillo(t.espesor ?? 0.15), alto: sc})), scObs),
      partida("02.02.04.02", "ENCOFRADO Y DESENCOFRADO EN SOBRECIMIENTOS", "m2", tramos.map((t, i) => tramoSC(t, i, {largo: largoSC(t), alto: sc, veces: 2})), `${scObs} Dos caras.`),
      partida("02.02.04.03", "CURADO DEL CONCRETO EN SOBRECIMIENTO", "m2", tramos.map((t, i) => tramoSC(t, i, {largo: largoSC(t), alto: sc, veces: 2})), `${scObs} Dos caras.`));
  }

  // ---- 02.03 Concreto armado ----
  partidas.push(titulo("02.03", "OBRAS DE CONCRETO ARMADO"));
  if (platea) {
    const P = M.platea;
    const barras = (luzLado, otroLado) => Math.floor((otroLado - 2 * P.recubrimiento) / P.separacion) + 1;
    partidas.push(titulo("02.03.01", "LOSA DE CIMENTACION"),
      partida("02.03.01.01", "CONCRETO EN LOSA DE CIMENTACION F'C=210 KG/CM2", "m3", [fila(nombreCim, {largo: lp, ancho: ap, alto: hz, ...cimF()})], `${planta[0].toUpperCase()}${planta.slice(1)}; Hz ${m2(hz)} (${F.hz}).`),
      partida("02.03.01.02", "ACERO EN LOSA DE CIMENTACION CON F'Y=4200 KG/CM2", "kg", [
        filaAcero(`Longitudinal Ø${P.barra} (superior e inferior)`, {simil: P.capas, longitud: lp - 2 * P.recubrimiento, gancho: P.gancho, varillas: barras(lp, ap), diametro: P.barra}),
        filaAcero(`Transversal Ø${P.barra} (superior e inferior)`, {simil: P.capas, longitud: ap - 2 * P.recubrimiento, gancho: P.gancho, varillas: barras(ap, lp), diametro: P.barra}),
      ], `Malla Ø${P.barra} @${m2(P.separacion)} del plano de platea, en ${P.capas} capas (superior e inferior), cada capa contada una vez; recubrimiento ${P.recubrimiento} y gancho ${m2(P.gancho)}.`),
      partida("02.03.01.03", "CURADO DEL CONCRETO EN LOSA DE CIMENTACION", "m2", [fila(nombreCim, {largo: lp, ancho: ap, ...cimF()})], `Cara superior de la platea: ${planta}.`));
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
  const esCumbrera = (v) => /CUMBRERA/i.test(v.tipo ?? "");
  if (vigas.length) {
    const nombreViga = (v) => (esCumbrera(v) ? "Viga cumbrera (sección reducida)" : `${v.eje ? `Eje ${v.eje} ` : ""}${v.tipo} (${v.b.toFixed(2)}x${v.h.toFixed(2)})${v.alero ? " con alero" : ""}`);
    // Viga cumbrera: sección reducida del detalle (área y perímetro), no la de las vigas.
    const concretoViga = (v) => (esCumbrera(v) ? fila(nombreViga(v), {simil: niveles, largo: v.largo, ancho: M.cumbrera.area}) : fila(nombreViga(v), {simil: niveles, largo: v.largo, ancho: v.b, alto: v.h}));
    const caraViga = (v) => fila(nombreViga(v), {simil: niveles, largo: v.largo, ancho: esCumbrera(v) ? M.cumbrera.perimetro : v.b + 2 * v.h});
    // Viga de borde en el alero (con la canaleta), sección de la plantilla.
    const B = M.vigaBorde;
    const borde = modelo.cubierta && platea && lp ? [propuesta(fila(`Viga de borde (${B.b.toFixed(2)}x${B.h.toFixed(2)})`, {largo: r4(lp), ancho: B.b, alto: B.h}), "sección de la viga de borde de la plantilla; va en el alero con la canaleta")] : [];
    const bordeCara = borde.length ? [propuesta(fila(borde[0].descripcion, {largo: r4(lp), ancho: B.b + 2 * B.h}), "sección de la viga de borde de la plantilla")] : [];
    partidas.push(titulo("02.03.07", "VIGAS"),
      partida("02.03.07.01.01", "CONCRETO EN VIGAS F'C=210 KG/CM2", "m3", [...vigas.map(concretoViga), ...borde]),
      partida("02.03.07.01.02", "ENCOFRADO Y DESENCOFRADO EN VIGAS", "m2", [...vigas.map(caraViga), ...bordeCara]),
      partida("02.03.07.01.03", "ACERO EN VIGAS CON F'Y=4200 KG/CM2", "kg", [...vigas.flatMap((v) => [
        filaAcero(`${nombreViga(v)}: ${V.barras}Ø${V.barra}`, {simil: niveles, longitud: v.largo + V.anclaje, gancho: V.gancho, varillas: V.barras, diametro: V.barra}),
        filaAcero(`${nombreViga(v)}: estribos Ø${CRITERIOS.vigas.estribo}`, {simil: niveles, longitud: 2 * (v.b + v.h) - 8 * V.recubrimiento, gancho: V.ganchoEstribo, varillas: posicionesEstribos(CRITERIOS.vigas.distribucion, v.largo).length, diametro: CRITERIOS.vigas.estribo}),
      ]), ...(borde.length ? [
          propuesta(filaAcero(`${borde[0].descripcion}: ${V.barras}Ø${V.barra}`, {longitud: lp + V.anclaje, gancho: V.gancho, varillas: V.barras, diametro: V.barra}), "armado de vigas del despacho"),
          propuesta(filaAcero(`${borde[0].descripcion}: estribos Ø${CRITERIOS.vigas.estribo}`, {longitud: 2 * (B.b + B.h) - 8 * V.recubrimiento, gancho: V.ganchoEstribo, varillas: posicionesEstribos(CRITERIOS.vigas.distribucion, lp).length, diametro: CRITERIOS.vigas.estribo}), "armado de vigas del despacho"),
      ] : [])]),
      partida("02.03.07.01.04", "CURADO DE CONCRETO EN VIGAS", "m2", [...vigas.map(caraViga), ...bordeCara]));
  }

  // Columnetas de amarre: por eje, código y alto real (el del pórtico donde se dibujan, bajo el
  // techo inclinado; junto a una ventana, hasta el alféizar). Las que no caen en un pórtico
  // llevan el alto del muro.
  const CC = M.columnetas;
  const ctas = gruposColumnetas(modelo.columnetas ?? [], {muro: altoMuros, parapeto: M.columnetaParapeto});
  if (ctas.length) {
    const nombre = (g) => `${g.eje ? `Eje ${g.eje} ` : ""}C-${g.codigo ?? ""} (${g.b.toFixed(2)}x${g.h.toFixed(2)})${g.fuente === "muro" ? " · alto del muro" : g.fuente === "parapeto" ? " · junto a ventana" : ""}`;
    const OBS_CTA = {
      portico: (g) => `Alto ${m2(g.alto)} del pórtico del eje ${g.eje}: del piso al fondo de la viga, siguiendo el techo inclinado.`,
      parapeto: () => `Junto a la ventana: hasta el alféizar (${m2(CRITERIOS.vanos.alfeizar)} + sobrecimiento ${m2(CRITERIOS.cimientoCorrido.sobrecimientoAlto)}), como la planilla del despacho.`,
      muro: () => `Alto del muro (${m2(altoMuros)} = techo − viga): la columneta no cae en un pórtico dibujado.`,
    };
    const marcar = (g, f) => {
      const conObs = {...f, obs: OBS_CTA[g.fuente](g)};
      return g.fuente === "muro" ? propuesta(conObs, "alto del muro: la columneta no cae en un pórtico dibujado") : conObs;
    };
    const barras = (g) => 2 * CRITERIOS.columnetas.varillasPorCara(Math.max(g.b, g.h));
    partidas.push(titulo("02.03.08", "COLUMNETAS DE AMARRE"),
      partida("02.03.08.01", `CONCRETO PARA COLUMNETAS DE AMARRE F'C=${CRITERIOS.concreto.columnetas} KG/CM2`, "m3", ctas.map((g) => marcar(g, fila(nombre(g), {simil: g.n, largo: g.b, ancho: g.h, alto: g.alto})))),
      partida("02.03.08.02", "ENCOFRADO Y DESENCOFRADO NORMAL EN COLUMNETAS", "m2", ctas.map((g) => marcar(g, fila(nombre(g), {simil: g.n, largo: r4(2 * (g.b + g.h) - Math.min(g.b, g.h)), alto: g.alto})))),
      partida("02.03.08.03", "ACERO EN COLUMNETA FY=4200 KG/CM2", "kg", ctas.flatMap((g) => [
        marcar(g, filaAcero(`${nombre(g)}: ${barras(g)}Ø${CC.barra}`, {simil: g.n, longitud: g.alto, gancho: CC.anclaje, varillas: barras(g), diametro: CC.barra})),
        marcar(g, filaAcero(`${nombre(g)}: estribos Ø${CC.estribo}`, {simil: g.n, longitud: 2 * (g.b + g.h) - 8 * CRITERIOS.columnetas.recubrimiento, gancho: CC.ganchoEstribo, varillas: posicionesEstribos(CRITERIOS.columnetas.distribucion, g.alto).length, diametro: CC.estribo})),
      ])),
      partida("02.03.08.04", "CURADO EN COLUMNETAS", "m2", ctas.map((g) => marcar(g, fila(nombre(g), {simil: g.n, largo: r4(2 * (g.b + g.h) - Math.min(g.b, g.h)), alto: g.alto})))));
  }

  // Viguetas de amarre (VSa): sobre las ventanas y, como en el módulo de referencia, también
  // sobre las puertas, a todo el paño de muro entre columnas o columnetas.
  const vsa = [...(modelo.vsa ?? []), ...(modelo.dinteles ?? []).map((d) => ({eje: d.eje, nombre: d.nombre, largo: d.pano ?? d.largo}))];
  if (vsa.length) {
    const S = M.vsa;
    const nombre = (v) => `${v.eje ? `Eje ${v.eje} ` : ""}VSa-(${S.b.toFixed(2)}x${S.h.toFixed(2)})${v.nombre ? ` sobre ${v.nombre}` : ""}`;
    const pv = (f) => propuesta(f, "largo del paño de muro sobre el vano: confírmalo con el pórtico");
    partidas.push(titulo("02.03.09", "VIGUETAS DE AMARRE"),
      partida("02.03.09.01", `CONCRETO PARA VIGUETAS DE AMARRE F'C=${CRITERIOS.concreto.columnetas} KG/CM2`, "m3", vsa.map((v) => pv(fila(nombre(v), {largo: v.largo, ancho: S.b, alto: S.h})))),
      partida("02.03.09.02", "ENCOFRADO Y DESENCOFRADO EN VIGUETAS", "m2", vsa.map((v) => pv(fila(nombre(v), {largo: v.largo, alto: S.h, veces: 2})))),
      partida("02.03.09.03", "ACERO EN VIGUETAS FY=4200 KG/CM2", "kg", vsa.flatMap((v) => [
        pv(filaAcero(`${nombre(v)}: ${S.barras}Ø${S.barra}`, {longitud: Math.max(0, v.largo - 2 * S.recubrimiento), gancho: S.anclaje, varillas: S.barras, diametro: S.barra})),
        pv(filaAcero(`${nombre(v)}: estribos Ø${S.estribo}`, {longitud: 2 * (S.b + S.h) - 8 * S.recubrimiento, gancho: S.ganchoEstribo, varillas: posicionesEstribos(CRITERIOS.columnetas.distribucion, v.largo).length, diametro: S.estribo})),
      ])),
      partida("02.03.09.04", "CURADO DEL CONCRETO EN VIGUETAS", "m2", vsa.map((v) => pv(fila(nombre(v), {largo: v.largo, alto: S.h, veces: 2})))));
  }

  // Cubierta a dos aguas: canaleta de techo (con la viga de borde, en el alero) y, en
  // estructuras metálicas, correas y cobertura. Largo a lo largo de la cumbrera = lado largo de
  // la planta; faldón = medio ancho + alero, inclinado con la pendiente.
  const cub = modelo.cubierta;
  const metalicas = []; // 02.04 y 02.05 van después de las losas
  const plantaTecho = platea && lp ? {largo: lp, ancho: ap} : modelo.losa?.areaPanos ? {largo: Math.sqrt(modelo.losa.areaPanos), ancho: Math.sqrt(modelo.losa.areaPanos)} : null;
  if (cub && plantaTecho) {
    const K = M.canaleta;
    const largo = r4(plantaTecho.largo);
    partidas.push(titulo("02.03.10", "CANALETA EN TECHO"),
      partida("02.03.10.01", "CANALETA EN TECHO CONCRETO F'C=210 KG/CM2", "m3", [propuesta(fila("Canaleta en el alero (sección del detalle)", {largo, ancho: K.area}), "sección del detalle de canaleta del despacho; confirma el largo")]),
      partida("02.03.10.02", "CANALETA EN TECHO ENCOFRADO Y DESENCOFRADO", "m2", [propuesta(fila("Canaleta en el alero (perímetro del detalle)", {largo, ancho: K.perimetro}), "perímetro del detalle de canaleta")]),
      partida("02.03.10.03", "ACERO PARA CANALETA EN TECHO F'Y=4200 KG/CM2", "kg", [
        propuesta(filaAcero(`Longitudinal ${K.longitudinales}Ø${K.barra}`, {longitud: largo + 0.44, gancho: 0.4, varillas: K.longitudinales, diametro: K.barra}), "armado del detalle de canaleta"),
        propuesta(filaAcero(`Transversal Ø${K.barra} @${K.separacion}`, {longitud: K.transversal, varillas: Math.floor(largo / K.separacion) + 1, diametro: K.barra}), "armado del detalle de canaleta"),
      ]),
      partida("02.03.10.04", "CURADO DE CANALETA EN TECHO", "m2", [propuesta(fila("Canaleta en el alero", {largo, ancho: K.perimetro}), "perímetro del detalle de canaleta")]));
    const R = M.correas;
    const faldon = r4((plantaTecho.ancho / 2 + cub.alero) * Math.sqrt(1 + cub.pendiente ** 2));
    const porFaldon = Math.ceil(faldon / R.separacion) + 1;
    const largoCorrea = r4(largo + 2 * R.aleroLateral);
    const motivo = `${porFaldon} correas por faldón de ${faldon.toFixed(2)} m (separación ≤ ${R.separacion.toFixed(2)} m), largo con aleros laterales de ${R.aleroLateral.toFixed(2)} m`;
    metalicas.push(titulo("02.04", "ESTRUCTURAS METALICAS"), titulo("02.04.01", "CORREAS METALICAS"),
      partida("02.04.01.01", `ARMADO DE CORREA METÁLICA ${R.descripcion}`, "m", [propuesta(fila("Correas de los dos faldones", {simil: 2 * porFaldon, largo: largoCorrea}), motivo)]),
      partida("02.04.01.02", `MONTAJE DE CORREA METÁLICA ${R.descripcion}`, "m", [propuesta(fila("Correas de los dos faldones", {simil: 2 * porFaldon, largo: largoCorrea}), motivo)]),
      titulo("02.04.02", "COBERTURAS"),
      partida("02.04.02.02", `SUMINISTRO Y COLOCACIÓN ${CRITERIOS.techo.cobertura.toUpperCase()}`, "m2", [propuesta(fila("Dos faldones con aleros", {largo: largoCorrea, ancho: faldon, veces: 2}), `faldón inclinado (pendiente ${Math.round(cub.pendiente * 100)}%) × largo con aleros`)]),
      partida("02.04.02.03", "SUMINISTRO Y COLOCACIÓN CUMBRERA DENTADA DE ALUZINC E=0,5MM", "m", [propuesta(fila("Cumbrera", {largo: largoCorrea}), "largo de la cumbrera con aleros")]),
      titulo("02.05", "OTROS"), titulo("02.05.01", "JUNTAS"),
      partida("02.05.01.03", 'JUNTA DE TECNOPOR E=1" C/SELLADO', "m", [propuesta(fila("Bordes contiguos a otras edificaciones", {largo: 0}), "ingresa el largo de la junta: depende de las edificaciones vecinas")]));
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
  partidas.push(...metalicas);
  // Observación de las partidas que no la traen: el criterio con el que se calcularon.
  const e = Math.round((modelo.losa?.espesor ?? 0.2) * 100) / 100;
  const OBS = {
    "02.03.06.01.01": `Sección de cada columna dibujada × alto ${m2(altoColumna)} = (Df − Hz) ${m2(df - hz)} + techo ${m2(modelo.techo ?? 3)} (NPT de la arquitectura).`,
    "02.03.06.01.02": `Perímetro de la sección dibujada × alto ${m2(altoColumna)}.`,
    "02.03.06.01.03": `Refuerzo del cuadro de columnas; longitudinal con anclaje ${m2(M.columnas.anclaje)} y gancho ${m2(M.columnas.gancho)}; estribos según la distribución del cuadro.`,
    "02.03.06.01.04": `Perímetro de la sección dibujada × alto ${m2(altoColumna)}.`,
    "02.03.07.01.01": "Largo entre caras de columnas medido en la planta (+ alero donde lo hay) × sección del cuadro de vigas; cumbrera con su sección reducida del detalle.",
    "02.03.07.01.02": "Largo × (fondo + 2 costados); cumbrera con el perímetro de su detalle.",
    "02.03.07.01.03": `${M.vigas.barras}Ø${M.vigas.barra} con anclaje ${m2(M.vigas.anclaje)} y gancho ${m2(M.vigas.gancho)}; estribos Ø${CRITERIOS.vigas.estribo} ${CRITERIOS.vigas.distribucion}.`,
    "02.03.07.01.04": "Largo × (fondo + 2 costados).",
    "02.03.08.01": "Sección de la columneta dibujada × su alto (ver cada fila).",
    "02.03.11.01": `Paños de losa medidos en la planta menos lo que ocupan vigas y columnas; factor de concreto para e = ${m2(e)} m.`,
    "02.03.11.02": "Área neta de losa (paños − vigas − columnas).",
    "02.03.11.03": `Por paño: positivo y negativo Ø${M.losa.barra} por vigueta, temperatura Ø${M.losa.temperatura} @${m2(M.losa.separacionTemperatura)}.`,
    "02.03.11.04": `${M.losa.ladrillosPorM2} ladrillos por m² de losa neta, redondeado.`,
    "02.03.11.05": "Área neta de losa.",
  };
  for (const p of partidas) if (!p.titulo && !p.obs && OBS[p.item]) p.obs = OBS[p.item];
  // Notas: solo lo que el especialista debe confirmar (las filas propuestas van marcadas).
  const propuestas = partidas.filter((p) => !p.titulo && p.filas.some((f) => f.propuesto)).length;
  if (propuestas) notas.push(`${propuestas} partidas con filas propuestas por el agente con criterios del despacho (marcadas): revísalas y corrige en la vista previa lo que no corresponda.`);
  const sinPortico = ctas.filter((g) => g.fuente === "muro").reduce((t, g) => t + g.n, 0);
  if (sinPortico) notas.push(`${sinPortico} columneta(s) fuera de los pórticos dibujados: llevan el alto del muro (${altoMuros.toFixed(2)} m).`);
  if (platea) notas.push(`Acero de platea: Ø${M.platea.barra} @${M.platea.separacion.toFixed(2)} en ${M.platea.capas} capas (superior e inferior), en cada dirección; cada capa contada una sola vez.`);

  return {proyecto: modelo.proyecto, partidas, resumen: resumenDe(partidas), notas};
}

// Totales de la cabecera: concreto (m³), acero (kg), encofrado (m²) y excavación (m³).
function resumenDe(partidas) {
  const suma = (filtro) => r4(partidas.filter((p) => !p.titulo && filtro(p)).reduce((s, p) => s + p.total, 0));
  return {
    concreto: suma((p) => p.und === "m3" && /CONCRETO/.test(p.descripcion)),
    acero: suma((p) => p.und === "kg"),
    encofrado: suma((p) => /ENCOFRADO/.test(p.descripcion)),
    excavacion: suma((p) => /^02\.01\.02\./.test(p.item)),
  };
}

// ---------- Vista previa (igual a la planilla Excel) y correcciones del especialista ----------

export const COLUMNAS_PLANILLA = ["ITEM", "DESCRIPCIÓN", "Und", "Elem. Simil.", "Largo", "Ancho", "Alto", "N° de Veces", "Lon.", "Área", "Vol.", "Kg.", "Und.", "Total", "Observación"];
// Por qué una fila vale lo que vale (para comparar con el Excel del cliente).
// Como lo explica un ingeniero: la cuenta con sus números, el criterio técnico y una nota si algo
// no cuadra (la denominación dice una sección y la fila usa otra; valor propuesto por revisar).
const UNIDAD = {m: "m", m2: "m²", m3: "m³", kg: "kg", und: "und"};
const n2 = (v) => (Math.round(Number(v) * 100) / 100).toFixed(2);
function formulaDe(f, und) {
  if (f.kgm !== undefined) {
    return `${f.simil > 1 ? `${f.simil} × ` : ""}(${n2(f.longitud)}${f.gancho ? ` + ${n2(f.gancho)}` : ""}) × ${f.varillas} = ${n2(f.metros)} m × ${f.kgm} kg/m = ${n2(f.parcial)} kg`;
  }
  if (f.calculado === false) return null;
  const factores = [f.simil, f.largo, f.ancho, f.alto].filter((v) => v !== null && v !== undefined).map((v, i) => (i === 0 ? String(v) : n2(v)));
  return `${factores.join(" × ")}${f.veces !== 1 ? ` × ${f.veces}` : ""} = ${n2(f.parcial)} ${UNIDAD[und] ?? und}`;
}
// Sección que dice el nombre ("(0.30x0.45)") distinta de la que usa la fila (concreto).
function notaSeccion(f, und) {
  const m = /\((\d+\.\d+)\s*[xX×]\s*(\d+\.\d+)\s*M?\)/.exec(f.descripcion ?? "");
  if (!m || und !== "m3" || f.ancho === null || f.alto === null) return null;
  const [a, b] = [Number(m[1]), Number(m[2])].sort((x, y) => x - y);
  const [u, v] = [Number(f.ancho), Number(f.alto)].sort((x, y) => x - y);
  const usadas = [Number(f.largo), Number(f.ancho), Number(f.alto)].filter(Number.isFinite).sort((x, y) => x - y);
  const coincide = (Math.abs(a - u) < 0.005 && Math.abs(b - v) < 0.005) || usadas.some((x, i) => usadas.some((y, j) => i < j && Math.abs(Math.min(x, y) - a) < 0.005 && Math.abs(Math.max(x, y) - b) < 0.005));
  return coincide ? null : `Nota: la denominación indica ${m[1]} × ${m[2]} y la fila usa ${n2(f.ancho)} × ${n2(f.alto)}; verifícalo con los planos de estructuras.`;
}
const observacion = (f, und) => [
  formulaDe(f, und),
  f.obs ? `Criterio: ${f.obs}` : null,
  notaSeccion(f, und),
  f.propuesto ? `Propuesto por el agente: ${f.propuesto}.` : null,
].filter(Boolean).join(" · ") || null;
const COLUMNA_PARCIAL = {m: 8, m2: 9, m3: 10, kg: 11, und: 12};
// Columna de la planilla → campo de la fila que se puede corregir.
export const EDITABLES = {
  concreto: {3: "simil", 4: "largo", 5: "ancho", 6: "alto", 7: "veces"},
  acero: {3: "simil", 4: "longitud", 5: "gancho", 7: "varillas"},
};

// Filas de la planilla del despacho (las mismas para el Excel y la vista previa). Acero: largo
// de la varilla en "Largo", gancho en "Ancho", varillas en "N° de veces", metros en "Lon.",
// kg/m en "Vol." y kg en "Kg." (como la planilla del ingeniero).
export function filasPlanilla(met) {
  const vacia = () => Array(COLUMNAS_PLANILLA.length).fill(null);
  const out = [];
  met.partidas.forEach((p, ip) => {
    if (p.titulo) { const c = vacia(); c[0] = p.item; c[1] = p.descripcion; out.push({tipo: "titulo", celdas: c}); return; }
    const c = vacia(); c[0] = p.item; c[1] = p.descripcion; c[2] = p.und; c[13] = p.total; c[14] = p.obs ?? null;
    out.push({tipo: "partida", ip, celdas: c});
    if (p.und === "kg") { const s = vacia(); s[4] = "long."; s[5] = "gancho"; s[6] = "empal."; s[10] = "kg/m"; out.push({tipo: "sub", ip, celdas: s}); }
    p.filas.forEach((f, jf) => {
      const r = vacia();
      r[1] = f.descripcion;
      r[14] = observacion(f, p.und);
      const acero = f.kgm !== undefined;
      if (acero) Object.assign(r, {2: "kg", 3: f.simil, 4: f.longitud, 5: f.gancho, 7: f.varillas, 8: f.metros, 10: f.kgm, 11: f.parcial});
      else { Object.assign(r, {2: p.und, 3: f.simil, 4: f.largo, 5: f.ancho, 6: f.alto, 7: f.veces}); r[COLUMNA_PARCIAL[p.und] ?? 10] = f.parcial; }
      out.push({tipo: "fila", ip, jf, acero, calculado: f.calculado !== false, celdas: r, propuesto: f.propuesto ?? null, corregido: Boolean(f.corregido)});
    });
  });
  return out;
}

// Recalcula parciales, totales y resumen después de corregir medidas en la vista previa.
export function recalcularMetrado(met) {
  for (const p of met.partidas) {
    if (p.titulo) continue;
    for (const f of p.filas) {
      if (f.kgm !== undefined) {
        f.metros = r4((Number(f.simil) || 0) * ((Number(f.longitud) || 0) + (Number(f.gancho) || 0)) * (Number(f.varillas) || 0));
        f.parcial = r4(f.metros * f.kgm);
      } else if (f.calculado !== false) {
        const d = [f.largo, f.ancho, f.alto].filter((v) => v !== null && v !== undefined && v !== "");
        f.parcial = r4((Number(f.simil) || 0) * (Number(f.veces) || 0) * d.reduce((a, b) => a * Number(b), 1));
      }
    }
    p.total = r4(p.filas.reduce((s, f) => s + (Number(f.parcial) || 0), 0));
  }
  met.resumen = resumenDe(met.partidas);
  return met;
}

// Corrige un campo de una fila (por ítem de partida y descripción de la fila). Devuelve el
// valor anterior, o undefined si no encontró la fila o el campo.
export function corregirFila(met, {partida, fila, campo, valor}) {
  const f = met.partidas.find((p) => p.item === partida && !p.titulo)?.filas.find((x) => x.descripcion === fila);
  const permitido = f && (f.kgm !== undefined ? Object.values(EDITABLES.acero) : f.calculado === false ? ["parcial"] : Object.values(EDITABLES.concreto)).includes(campo);
  const v = Number(String(valor).replace(",", "."));
  if (!permitido || !Number.isFinite(v)) return undefined;
  const antes = f[campo];
  f[campo] = v;
  f.corregido = true;
  f.propuesto = null; // el especialista ya decidió esta fila
  recalcularMetrado(met);
  return antes ?? null;
}

// Renombra una fila con la terminología del especialista: también las filas del mismo elemento en
// las demás partidas ("Eje Y´" en concreto, encofrado y curado; "Eje Y´: 4Ø3/8"" en acero).
// Devuelve {termino, plantilla} para aprenderlo (o {} si la fila no es de un tipo de elemento).
export function renombrarFila(met, {partida, fila, nuevo}) {
  const texto = String(nuevo ?? "").trim();
  const f = met.partidas.find((p) => p.item === partida && !p.titulo)?.filas.find((x) => x.descripcion === fila);
  if (!f || !texto || texto.length > 140 || texto === fila) return null;
  const viejo = f.descripcion;
  const mismo = (x) => (f.termino ? x.termino === f.termino && JSON.stringify(x.vars) === JSON.stringify(f.vars) : x.descripcion === viejo);
  for (const p of met.partidas) {
    for (const x of p.filas ?? []) {
      if (mismo(x)) x.descripcion = x.descripcion.replace(viejo.replace(/ \(sin la puerta\)$/, ""), texto);
      else if (x.descripcion.startsWith(`${viejo}:`)) x.descripcion = texto + x.descripcion.slice(viejo.length);
    }
  }
  return f.termino ? {termino: f.termino, vars: f.vars} : {};
}

// Correcciones que el despacho hizo antes en un plano parecido (mismos rasgos: largo, ancho y
// área ±5 %, mismas columnas): el metrado parte de ahí y no desde cero.
export function aplicarCorrecciones(met, eventos = [], rasgos = null) {
  const parecido = (a = {}) => !rasgos || (["largo", "ancho", "area"].every((k) => typeof a[k] !== "number" || typeof rasgos[k] !== "number" || Math.abs(a[k] - rasgos[k]) <= 0.05 * Math.max(a[k], rasgos[k]))
    && (typeof a.columnas !== "number" || typeof rasgos.columnas !== "number" || a.columnas === rasgos.columnas));
  let n = 0;
  for (const e of eventos) {
    if (e?.clave !== "metrado" || !e.partida || !e.fila || !e.campo || !parecido(e.rasgos)) continue;
    if (corregirFila(met, {partida: e.partida, fila: e.fila, campo: e.campo, valor: e.valor}) !== undefined) n++;
  }
  return n;
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

// Grupos por eje, código, sección y alto. Alto: el del pórtico; junto a una ventana, el del
// parapeto; fuera de los pórticos, el del muro.
function gruposColumnetas(columnetas, {muro = 3, parapeto = 1.3} = {}) {
  const m = new Map();
  for (const c of columnetas) {
    const [b, h] = [c.b, c.h].sort((x, y) => y - x);
    const fuente = c.juntoVentana ? "parapeto" : c.alto ? "portico" : "muro";
    const alto = r4(fuente === "parapeto" ? parapeto : fuente === "portico" ? c.alto : muro);
    const k = `${c.eje ?? ""}|${c.codigo ?? ""}|${b.toFixed(2)}x${h.toFixed(2)}|${alto.toFixed(2)}`;
    const g = m.get(k) ?? {codigo: c.codigo, eje: c.eje ?? null, n: 0, b, h, alto, fuente};
    g.n++;
    m.set(k, g);
  }
  return [...m.values()];
}
