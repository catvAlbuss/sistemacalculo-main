// Registro de decisiones: por qué el agente puso cada cosa en las láminas y en el modelo.
//
// Cada decisión dice QUÉ se decidió, POR QUÉ, con qué NORMA, de DÓNDE salió el dato y qué
// ALTERNATIVAS había. Donde la norma da un límite numérico, además se VERIFICA el valor dibujado
// (estribos d/4 y d/2, ancho de vigas, f'c, Df…): citar no basta para firmar.
//
// Citas: "confirmada" = artículo leído en el texto de la norma (normasVerificadas.js, con la copia de
// donde sale); "investigada" = del resumen investigado (normativa.js), falta cotejarla con el texto.

import {CITAS, NORMAS_RNE, versionE030} from "./normativa.js";
import {VERIFICADAS, fuenteDeCita} from "./normasVerificadas.js";
import {CRITERIOS} from "./criteriosEstructurales.js";

export const FUENTES = {
  norma: "norma",
  calculo: "cálculo del motor",
  plano: "plano de arquitectura",
  proyecto: "dato del proyecto",
  despacho: "criterio del despacho (casos estudiados)",
  ingeniero: "decisión del ingeniero",
  cliente: "pedido del cliente",
  supuesto: "supuesto por confirmar",
};

// Cita de un criterio: la verificada en el texto si la hay; si no, la del resumen investigado.
export const cita = (clave) => {
  const v = VERIFICADAS[clave];
  if (v) return {norma: v.norma, estado: "confirmada", dice: v.dice, texto: fuenteDeCita(v.norma)};
  return CITAS[clave] ? {norma: CITAS[clave], estado: "investigada"} : null;
};

const r2 = (v) => Math.round(Number(v) * 100) / 100;
const r3 = (v) => Math.round(Number(v) * 1000) / 1000;
const m2 = (v) => Number(v).toFixed(2);
const pct = (v) => `${Math.round(Number(v) * 100)} %`;
const DIAMETRO = {'1/4"': 0.00635, '3/8"': 0.009525, '1/2"': 0.0127, '5/8"': 0.015875, '3/4"': 0.01905, '1"': 0.0254};
const abajo = (v, paso) => Math.floor(v / paso + 1e-9) * paso;

// "1@0.05, 8@0.10, Rto.@0.20 C/E" → {primero, n, s, resto}
export function leerDistribucion(texto) {
  const m = /1\s*@\s*([\d.]+)\s*,\s*(\d+)\s*@\s*([\d.]+)\s*,\s*R[a-z.]*\s*@\s*([\d.]+)/i.exec(String(texto ?? ""));
  return m ? {primero: Number(m[1]), n: Number(m[2]), s: Number(m[3]), resto: Number(m[4])} : null;
}

// Estribos de una viga de pórtico contra E.060 21.5.3 (peralte h, varilla longitudinal y estribo).
export function verificarEstribosViga(h, distribucion, {barra = '5/8"', estribo = '3/8"', recubrimiento = 0.04} = {}) {
  const e = leerDistribucion(distribucion);
  if (!e || !(h > 0)) return null;
  const db = DIAMETRO[barra] ?? 0.015875, de = DIAMETRO[estribo] ?? 0.009525;
  const d = h - recubrimiento - de - db / 2;
  const sMax = Math.min(d / 4, 8 * db, 24 * de, 0.3), restoMax = d / 2;
  const fallas = [];
  if (e.primero > 0.05 + 1e-9) fallas.push(`primer estribo a ${e.primero} m > 0.05 m`);
  if (e.s > sMax + 1e-9) fallas.push(`separación en la zona de confinamiento ${e.s} m > ${r3(sMax)} m (d/4 con d = ${r3(d)} m)`);
  if (e.primero + e.n * e.s < 2 * h - 1e-9) fallas.push(`zona de confinamiento ${r2(e.primero + e.n * e.s)} m < 2h = ${r2(2 * h)} m`);
  if (e.resto > restoMax + 1e-9) fallas.push(`resto a ${e.resto} m > d/2 = ${r3(restoMax)} m`);
  const s = abajo(sMax, 0.025), resto = Math.min(0.25, abajo(restoMax, 0.025));
  const propuesta = `1@0.05, ${Math.ceil((2 * h - 0.05) / s - 1e-9)}@${s.toFixed(3).replace(/0$/, "")}, Rto.@${resto.toFixed(3).replace(/0$/, "")} C/E`;
  return {cumple: !fallas.length, fallas, propuesta, d};
}

// Estribos de columna contra E.060 21.6.4.2 (b: dimensión mínima de la sección).
export function verificarEstribosColumna(b, distribucion, {barra = '5/8"'} = {}) {
  const e = leerDistribucion(distribucion);
  if (!e || !(b > 0)) return null;
  const db = DIAMETRO[barra] ?? 0.015875;
  const sMax = Math.min(b / 3, 6 * db, 0.1), restoMax = Math.min(10 * db, 0.25);
  const fallas = [];
  if (e.s > sMax + 1e-9) fallas.push(`separación de confinamiento ${e.s} m > ${r3(sMax)} m (mín. de b/3, 6 db y 100 mm)`);
  if (e.resto > restoMax + 1e-9) fallas.push(`resto a ${e.resto} m > ${r3(restoMax)} m (10 db y 250 mm)`);
  const s = abajo(sMax, 0.01), resto = abajo(restoMax, 0.025);
  return {cumple: !fallas.length, fallas, propuesta: `1@0.05, ${e.n}@${s.toFixed(2)}, Rto.@${resto.toFixed(3).replace(/0$/, "")} C/E`};
}

// Decisión del despacho aprendida (casos.js proponer): regla o casos parecidos con su confianza.
function deDespacho(d) {
  if (!d || d.valor === null || d.valor === undefined) return null;
  const base = d.regla ? `regla del despacho: ${d.regla}` : d.fuentes?.length ? `así lo resolvieron ${d.fuentes.length} caso(s) parecido(s) del despacho` : "costumbre del despacho";
  return `${base} (confianza ${pct(d.confianza ?? 0)})${d.ingeniero ? `. ${d.ingeniero}` : ""}`;
}

// modelo: ctx.memoria.modeloEstructural; propuesta: ctx.memoria.propuesta?.propuesta (casos.js);
// decisionesSesion: lo que eligió el ingeniero; preferencias: pedidos del cliente aceptados;
// datos: datos del proyecto (zona, suelo, categoría, normaE030); sismo: parámetros calculados.
export function registroDeDecisiones({modelo, propuesta = null, decisionesSesion = [], preferencias = [], datos = {}, sismo = null, resultados = null} = {}) {
  const R = [];
  if (!modelo) return R;
  const dec = propuesta?.decisiones ?? {};
  const delIngeniero = (clave) => decisionesSesion.findLast?.((d) => d.clave === clave) ?? null;
  const agregar = (d) => R.push({alternativas: [], claves: [], verificacion: null, ...d});

  // ---- Cimentación ----
  const cim = modelo.cimentacion ?? {};
  const platea = cim.tipo === "platea";
  const tipo = platea ? "platea de cimentación" : "zapatas con vigas de cimentación";
  const ingCim = delIngeniero("cimentacion");
  agregar({tema: "Cimentación", elemento: "tipo de cimentación", valor: tipo, claves: ["cimentacion", "platea", "zapata", "zapatas"],
    fuente: ingCim ? "ingeniero" : dec.cimentacion?.valor ? "despacho" : "supuesto",
    porque: ingCim ? `La eligió el ingeniero${ingCim.porque ? `: ${ingCim.porque}` : ""}.` : deDespacho(dec.cimentacion) ?? "Sin casos parecidos: criterio por defecto del despacho.",
    cita: cita("ems"), norma: "El Estudio de Mecánica de Suelos da las condiciones de cimentación (capacidad portante y asentamientos): con q adm baja o suelo blando, la platea reparte la carga.",
    ...(platea ? {verificacion: {cumple: true, texto: "La platea va como losa armada en dos direcciones con zapata corrida perimetral (E.050 art. 19)."}} : {}),
    alternativas: [platea ? "zapatas aisladas con vigas de cimentación (si el EMS da q adm suficiente)" : "platea (si el EMS da q adm baja o asentamientos diferenciales)"]});
  for (const [k, nombre] of [["hz", platea ? "espesor de platea Hz" : "peralte de zapata Hz"], ["df", "profundidad de desplante Df"]]) {
    const v = cim[k];
    if (v === null || v === undefined) continue;
    const f = cim.fuentes?.[k] ?? "";
    const ver = k === "df" && !platea ? {cumple: Number(v) >= 0.8, texto: `Df ${r2(v)} m ${Number(v) >= 0.8 ? "≥" : "<"} 0.80 m mínimo para zapatas y cimientos corridos (E.050 art. 19).`} : null;
    agregar({tema: "Cimentación", elemento: nombre, valor: `${r2(v)} m`, claves: [k, k === "hz" ? "peralte" : "desplante", "cimentacion"],
      fuente: /dato del proyecto/.test(f) ? "proyecto" : /propuesto/.test(f) ? "despacho" : "supuesto",
      porque: /dato del proyecto/.test(f) ? "Lo indicaste en Datos del proyecto (EMS)." : /propuesto/.test(f) ? `Propuesto con proyectos parecidos del despacho (${deDespacho(dec[k]) ?? "casos estudiados"}).` : "Criterio por defecto del despacho: confírmalo con el EMS.",
      cita: cita(k === "df" ? "profundidad" : "presionAdmisible"), norma: k === "df" ? "La profundidad la fija el profesional del EMS." : "Hz se verifica por punzonamiento y corte con las reacciones del análisis y la presión admisible del EMS.",
      verificacion: ver, alternativas: ["el valor del Estudio de Mecánica de Suelos del proyecto"]});
  }

  // ---- Losa ----
  const losa = modelo.losa ?? null;
  if (losa?.espesor) {
    const ing = delIngeniero("espesorLosa");
    agregar({tema: "Losa", elemento: "espesor de losa aligerada", valor: `${m2(losa.espesor)} m`, claves: ["losa", "aligerado", "aligerada", "espesor"],
      fuente: ing ? "ingeniero" : dec.espesorLosa?.valor ? "despacho" : "supuesto",
      porque: ing ? "Lo eligió el ingeniero." : deDespacho(dec.espesorLosa) ?? `Espesor típico del despacho (${CRITERIOS.aligerado.espesor} m) para las luces de la planta.`,
      cita: cita("espesorAligerado"), norma: "El espesor se elige por la luz libre del paño para no tener que verificar deflexiones.",
      alternativas: ["losa maciza en paños de baños o con cargas concentradas", "mayor espesor si la luz libre es mayor"]});
  }

  // ---- Vigas ----
  const secciones = [...new Map((modelo.vigas ?? []).filter((v) => v.b && v.h).map((v) => [`${m2(v.b)}x${m2(v.h)}`, v])).values()];
  if (secciones.length) {
    const angostas = secciones.filter((v) => v.b < Math.max(0.25, 0.25 * v.h) - 1e-9);
    agregar({tema: "Vigas", elemento: "secciones de vigas", valor: secciones.map((v) => `${m2(v.b)}x${m2(v.h)}`).join(", "), claves: ["viga", "vigas", "peralte", "seccion", "ancho"],
      fuente: "despacho", porque: "Peralte por la luz del tramo (regla del despacho); las vigas que no cargan losa con el peralte secundario del proyecto (0.40 m; 0.50 m en zona 4), ancho de 0.25 m o el de las columnas.",
      cita: cita("anchoVigas"), norma: "Ancho mínimo de vigas de pórticos.",
      verificacion: {cumple: !angostas.length, texto: angostas.length ? `No cumplen el ancho mínimo: ${angostas.map((v) => `${m2(v.b)}x${m2(v.h)}`).join(", ")}.` : "Todas tienen bw ≥ 250 mm y ≥ 0.25 h."},
      alternativas: ["peralte mayor si el análisis da deriva alta o flexión mayor"]});
    const estribos = secciones.map((v) => ({v, r: verificarEstribosViga(v.h, CRITERIOS.vigas.distribucion, {estribo: CRITERIOS.vigas.estribo})})).filter((x) => x.r);
    const mal = estribos.filter((x) => !x.r.cumple);
    agregar({tema: "Vigas", elemento: "estribos de vigas", valor: CRITERIOS.vigas.distribucion, claves: ["estribo", "estribos", "confinamiento", "viga"],
      fuente: "despacho", porque: "Distribución típica del despacho: zona de confinamiento de 2h en cada apoyo con estribos cerrados y gancho sísmico.",
      cita: cita("estribosVigas"), norma: "Estribos de confinamiento de vigas de pórticos.",
      verificacion: {cumple: !mal.length, texto: mal.length ? mal.map((x) => `viga ${m2(x.v.b)}x${m2(x.v.h)}: ${x.r.fallas.join("; ")} → según la norma: ${x.r.propuesta}`).join(" | ") : "Cumple d/4, 2h y d/2 en todas las secciones."},
      alternativas: mal.length ? [...new Set(mal.map((x) => `${x.r.propuesta} (vigas de ${m2(x.v.h)} m)`))] : []});
    agregar({tema: "Vigas", elemento: "acero corrido y empalmes de vigas", valor: "2 barras corridas arriba y abajo; sin empalmes a menos de 2h de los apoyos", claves: ["acero", "empalme", "empalmes", "corrido", "viga", "despiece"],
      fuente: "norma", porque: "Continuidad del refuerzo y empalmes fuera de la zona donde fluye la viga en un sismo.", cita: cita("empalmesVigas"),
      norma: `${VERIFICADAS.aceroVigas.norma}: ${VERIFICADAS.aceroVigas.dice}`, alternativas: []});
  }

  // ---- Columnas ----
  const cols = modelo.columnas ?? [];
  if (cols.length) {
    const ing = delIngeniero("columnasComoArquitectura");
    agregar({tema: "Columnas", elemento: "secciones de columnas", valor: [...new Set(cols.map((c) => `${c.tipo} ${m2(c.b)}x${m2(c.h)}`))].join(", "), claves: ["columna", "columnas", "placa", "placas"],
      fuente: ing ? "ingeniero" : "plano", porque: ing ? "Lo decidió el ingeniero." : "Las secciones son las que dibujó el arquitecto en la planta (se respetan su ubicación y tamaño).",
      cita: cita("planos"), norma: "Tamaño, localización y refuerzo de todos los elementos van en los planos; el análisis verifica la deriva (E.030) y el diseño la flexocompresión (E.060).",
      alternativas: ["agrandar las columnas o agregar placas si la deriva no cumple"]});
    const verificadas = (modelo.refuerzoColumnas ?? []).filter((r) => r.verificado);
    agregar({tema: "Columnas", elemento: "refuerzo de columnas", valor: (modelo.refuerzoColumnas ?? []).map((r) => `${r.tipo}: ${r.refuerzo}`).join("; ") || "cuantía mínima",
      claves: ["refuerzo", "acero", "cuantia", "columna", "columnas", "varillas"],
      fuente: verificadas.length ? "calculo" : "norma",
      porque: verificadas.length ? `Armado verificado en Análisis Estructural (${verificadas.length} tipo(s)) con las fuerzas del análisis.` : `Cuantía mínima del ${pct(CRITERIOS.columnas.cuantiaMinima)} de Ag con varillas de ${CRITERIOS.columnas.barra}: falta verificarlo con el análisis.`,
      cita: cita("cuantiaColumnas"), norma: "Cuantía entre 1 % y 6 % de Ag.",
      alternativas: verificadas.length ? [] : ["correr el ciclo con Análisis Estructural para verificar el armado"]});
    const estribos = cols.map((c) => ({c, dist: CRITERIOS.columnas.distribucionPorSeccion({prefijo: String(c.tipo ?? "").replace(/\d+$/, ""), clase: c.clase, b: c.b, h: c.h})}))
      .map((x) => ({...x, r: verificarEstribosColumna(Math.min(x.c.b, x.c.h), x.dist, {barra: CRITERIOS.columnas.barra})})).filter((x) => x.r);
    const mal = estribos.filter((x) => !x.r.cumple);
    agregar({tema: "Columnas", elemento: "estribos de columnas", valor: [...new Set(estribos.map((x) => x.dist))].join(" · ") || CRITERIOS.columnas.distribucion, claves: ["estribo", "estribos", "confinamiento", "columna"],
      fuente: "despacho", porque: "Estribos de confinamiento en los extremos según la sección (más estribos en placas y columnas de 0.50 m o más), como en los cuadros del despacho.",
      cita: cita("estribosColumnas"), norma: "Confinamiento de columnas de pórticos.",
      verificacion: {cumple: !mal.length, texto: mal.length ? [...new Map(mal.map((x) => [x.c.tipo, `${x.c.tipo} ${m2(x.c.b)}x${m2(x.c.h)}: ${x.r.fallas.join("; ")} → según la norma: ${x.r.propuesta}`])).values()].join(" | ") : "Cumple la separación máxima de confinamiento."},
      alternativas: mal.length ? [...new Set(mal.map((x) => x.r.propuesta))] : []});
  }

  // ---- Materiales y recubrimientos ----
  const fc = Number(CRITERIOS.concreto.columnas);
  agregar({tema: "Materiales", elemento: "concreto", valor: `f'c=${fc} kg/cm² en elementos estructurales; ${CRITERIOS.concreto.columnetas} kg/cm² en columnetas`, claves: ["concreto", "fc", "f'c", "resistencia"],
    fuente: dec.fcColumnas?.valor ? "despacho" : "supuesto", porque: deDespacho(dec.fcColumnas) ?? "f'c habitual del despacho.",
    cita: cita("concretoSismico"), norma: "Concreto mínimo en elementos sismorresistentes.",
    verificacion: {cumple: fc >= 210, texto: `f'c = ${fc} kg/cm² ${fc >= 210 ? "≥" : "<"} 210 kg/cm² (21 MPa).`}, alternativas: ["f'c mayor si el diseño lo requiere"]});
  agregar({tema: "Materiales", elemento: "acero de refuerzo", valor: "ASTM A615 Grado 60, fy=4200 kg/cm²", claves: ["acero", "fy", "a615"],
    fuente: "despacho", porque: "Acero corrugado de uso en el Perú; la norma lo permite en elementos sismorresistentes con las condiciones del artículo (o A706).",
    cita: cita("aceroSismico"), norma: "Refuerzo de elementos con responsabilidad sísmica.", alternativas: ["ASTM A706"]});
  agregar({tema: "Materiales", elemento: "recubrimientos", valor: "7.5 cm contra el suelo · 4 cm vigas y columnas · 2 cm losas", claves: ["recubrimiento", "recubrimientos"],
    fuente: "norma", porque: "Protección del acero contra la corrosión y el fuego.", cita: cita("recubrimientos"), norma: "Recubrimientos mínimos.",
    verificacion: {cumple: true, texto: "75 mm ≥ 70 mm contra el suelo; 40 mm en vigas y columnas; 20 mm en losas."}, alternativas: []});

  // ---- Techo ----
  const cub = modelo.cubierta;
  if (cub) agregar({tema: "Techo", elemento: "techo inclinado", valor: `cumbrera +${r2(cub.cumbrera)} m${cub.pendientes ? `, faldones ${[...new Set([cub.pendientes.neg, cub.pendientes.pos])].map((p) => `${r2(p * 100)} %`).join(" y ")}` : `, pendiente ${r2(cub.pendiente * 100)} %`}`, claves: ["techo", "cumbrera", "pendiente", "cobertura"],
    fuente: cub.fuente === "cortes de la arquitectura" || cub.fuente === "pórticos dibujados" ? "plano" : "supuesto",
    porque: cub.fuente === "cortes de la arquitectura" ? `Del corte de la arquitectura: cumbrera${cub.ejeCumbrera ? ` sobre el eje ${cub.ejeCumbrera}` : ""}, nivel y pendientes escritas.` : cub.fuente === "pórticos dibujados" ? "Del nivel de cumbrera y la pendiente escritos en la arquitectura." : "Pendiente por defecto: no hay pendiente escrita en la arquitectura.",
    cita: null, norma: "La geometría del techo es de la arquitectura; la estructura la sigue.", alternativas: []});

  // ---- Sismo y cargas ----
  const v = versionE030(datos);
  agregar({tema: "Sismo", elemento: "norma sismorresistente", valor: `E.030-${v.version}`, claves: ["e030", "e.030", "sismo", "norma", "version"],
    fuente: v.confirmada ? "proyecto" : "supuesto", porque: v.aviso, cita: {norma: `E.030-${v.version} (${NORMAS_RNE["E.030"].versiones[v.version].dispositivo})`, estado: "confirmada"},
    norma: `${NORMAS_RNE["E.030"].nombre}: rige por la fecha de licencia del proyecto.`, alternativas: v.confirmada ? [] : ["E.030-2026 si el proyecto no tenía licencia ni expediente aprobado antes de la RM 183-2026"]});
  if (sismo && sismo.Z !== undefined) agregar({tema: "Sismo", elemento: "parámetros sísmicos", valor: `Z=${sismo.Z}, U=${sismo.U}, S=${sismo.S}, Tp=${sismo.Tp}, TL=${sismo.TL}`, claves: ["sismo", "zona", "z", "suelo", "categoria", "parametros"],
    fuente: datos?.zona && datos?.suelo ? "proyecto" : "supuesto", porque: "Zona por la ubicación, suelo por el EMS y U por la categoría de la edificación.",
    cita: cita("categoriaU"), norma: "Factores de zona, uso y suelo de la E.030.", alternativas: []});
  else agregar({tema: "Sismo", elemento: "parámetros sísmicos", valor: "por definir", claves: ["sismo", "zona", "suelo", "categoria", "parametros"], fuente: "supuesto",
    porque: "Faltan zona, perfil de suelo o categoría en Datos del proyecto.", cita: cita("categoriaU"), norma: "Sin ellos no hay espectro ni verificación de deriva.", alternativas: []});
  if (resultados && (resultados.derivaX || resultados.derivaY)) {
    const d = Math.max(Number(resultados.derivaX) || 0, Number(resultados.derivaY) || 0), lim = resultados.limite ?? 0.007;
    agregar({tema: "Sismo", elemento: "deriva inelástica máxima", valor: `${d.toFixed(4)} (límite ${lim})`, claves: ["deriva", "drift", "desplazamiento"],
      fuente: "calculo", porque: d <= lim ? "Cumple con el límite de concreto armado." : "No cumple: hay que rigidizar.", cita: cita("deriva"), norma: "Distorsión máxima de entrepiso.",
      verificacion: {cumple: d <= lim, texto: `${d.toFixed(4)} ${d <= lim ? "≤" : ">"} ${lim}.`}, alternativas: d <= lim ? [] : ["columnas más peraltadas o placas en la dirección que falla"]});
  }
  agregar({tema: "Cargas", elemento: "combinaciones de carga", valor: "1.4CM+1.7CV · 1.25(CM+CV)±CS · 0.9CM±CS", claves: ["combinacion", "combinaciones", "carga", "cargas"],
    fuente: "norma", porque: "Resistencia requerida para el diseño de los elementos.", cita: cita("combinaciones"), norma: "Cargas vivas de la E.020.", alternativas: []});
  agregar({tema: "Lámina", elemento: "contenido de los planos", valor: "normas, cargas vivas, f'c, fy, elementos con su tamaño, ubicación y refuerzo, anclajes y empalmes", claves: ["planos", "lamina", "laminas", "contenido", "firma"],
    fuente: "norma", porque: "Es lo mínimo que deben contener los planos del proyecto estructural; los firma un ingeniero civil colegiado (E.060 1.2.1.2).", cita: cita("planos"), norma: "Contenido mínimo de los planos.", alternativas: []});

  // ---- Pedidos del cliente ----
  for (const p of preferencias) agregar({tema: "Pedido del cliente", elemento: p.titulo, valor: p.opcionTexto, claves: ["cliente", "pedido", "preferencia", ...(p.claves ?? []), ...sinTildes(p.opcionTexto).split(/[^a-z]+/).filter((w) => w.length >= 5)],
    fuente: "cliente", porque: `Lo pidió el cliente; el agente aconsejó: ${p.consejo}`, cita: p.cita ?? null, norma: p.norma ?? "",
    verificacion: p.noAprobable ? {cumple: false, texto: "Con esta opción la lámina no cumple el contenido mínimo de los planos (E.060 1.2.4)."} : null, alternativas: p.alternativas ?? []});
  return R;
}

const ETIQUETA_CITA = {confirmada: "verificado en el texto de la norma", investigada: "artículo por cotejar con el texto oficial"};

// Una decisión en texto: qué, valor, por qué, norma (con lo que dice), verificación y fuente.
export function textoDecision(d) {
  const c = d.cita;
  const citaTxt = c ? ` Norma: ${c.norma} (${ETIQUETA_CITA[c.estado] ?? c.estado})${c.dice ? ` — "${c.dice}"` : ""}. ${d.norma ?? ""}` : d.norma ? ` ${d.norma}` : "";
  const ver = d.verificacion ? ` Verificación: ${d.verificacion.cumple ? "CUMPLE" : "NO CUMPLE"} — ${d.verificacion.texto}` : "";
  return `• ${d.tema} — ${d.elemento}: ${d.valor}. Por qué: ${d.porque}${citaTxt}${ver} Fuente: ${FUENTES[d.fuente] ?? d.fuente}.${d.alternativas?.length ? ` Alternativa: ${d.alternativas.join("; ")}.` : ""}`;
}

function sinTildes(s) { return String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }

// Decisiones que responden una pregunta ("¿por qué platea?", "justifica la viga de 0.40").
export function buscarDecisiones(registro, texto) {
  const palabras = sinTildes(texto).split(/[^a-z0-9.']+/).filter((w) => w.length >= 2);
  const puntaje = (d) => d.claves.reduce((s, c) => s + (palabras.some((w) => w === sinTildes(c) || (w.length >= 4 && sinTildes(c).startsWith(w))) ? 1 : 0), 0)
    + (palabras.some((w) => /^\d/.test(w) && sinTildes(d.valor).includes(w)) ? 1 : 0);
  const conPuntos = registro.map((d) => ({d, p: puntaje(d)})).filter((x) => x.p > 0);
  const max = Math.max(0, ...conPuntos.map((x) => x.p));
  return conPuntos.filter((x) => x.p === max).map((x) => x.d);
}

// Resumen del registro: decisiones por fuente, citas verificadas en el texto y lo que no cumple.
export function resumenRegistro(registro) {
  const cuenta = {};
  for (const d of registro) cuenta[d.fuente] = (cuenta[d.fuente] ?? 0) + 1;
  const conNorma = registro.filter((d) => d.cita).length, confirmadas = registro.filter((d) => d.cita?.estado === "confirmada").length;
  const supuestos = registro.filter((d) => d.fuente === "supuesto");
  const noCumple = registro.filter((d) => d.verificacion && !d.verificacion.cumple);
  const verificadas = registro.filter((d) => d.verificacion).length;
  return {cuenta, conNorma, confirmadas, supuestos, noCumple, verificadas,
    porcentajeCitas: conNorma ? Math.round((100 * confirmadas) / conNorma) : 0,
    texto: `${registro.length} decisiones justificadas: ${Object.entries(cuenta).map(([f, n]) => `${n} ${FUENTES[f] ?? f}`).join(", ")}. ${confirmadas} de ${conNorma} citas verificadas en el texto de la norma; ${verificadas} valores verificados contra sus límites${noCumple.length ? `, NO cumplen: ${noCumple.map((d) => d.elemento).join(", ")}` : ", todos cumplen"}.${supuestos.length ? ` Por confirmar: ${supuestos.map((d) => d.elemento).join(", ")}.` : ""}`};
}
