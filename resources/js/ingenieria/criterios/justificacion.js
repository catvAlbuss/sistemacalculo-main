// Registro de decisiones: por qué el agente puso cada cosa en las láminas y en el modelo.
//
// Cada decisión dice QUÉ se decidió, POR QUÉ, con qué NORMA (y si el artículo está confirmado), de
// DÓNDE salió el dato y qué ALTERNATIVAS había. Es lo que el ingeniero necesita para firmar: lo que
// sale de la norma, lo que sale del plano o del cálculo, lo que es costumbre del despacho, lo que pidió
// el cliente y lo que es un supuesto que falta confirmar.
//
// Citas: "confirmada" = el artículo está verificado en docs/agentes/normativas-estructurales.md
// (tabla 1.2); "investigada" = viene del resumen investigado (criterios/normativa.js) y falta cotejarla
// con el texto oficial; sin cita = criterio del despacho o del plano, sin artículo que lo exija.

import {CITAS, NORMAS_RNE, versionE030} from "./normativa.js";
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

// Citas confirmadas en el documento de normativas (tabla 1.2).
const CONFIRMADAS = new Set(["combinaciones", "recubrimientos", "cuantiaColumnas", "deriva", "categoriaU"]);
const CITA_DERIVA = "E.030-2018 tabla 11";
const CITA_U = "E.030-2018 tabla 5";

export const cita = (clave) => {
  const norma = clave === "deriva" ? CITA_DERIVA : clave === "categoriaU" ? CITA_U : CITAS[clave];
  return norma ? {norma, estado: CONFIRMADAS.has(clave) ? "confirmada" : "investigada"} : null;
};

const r2 = (v) => Math.round(Number(v) * 100) / 100;
const m2 = (v) => Number(v).toFixed(2);
const pct = (v) => `${Math.round(Number(v) * 100)} %`;

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
  const agregar = (d) => R.push({alternativas: [], claves: [], ...d});

  // ---- Cimentación ----
  const cim = modelo.cimentacion ?? {};
  const tipo = cim.tipo === "platea" ? "platea de cimentación" : "zapatas con vigas de cimentación";
  const ingCim = delIngeniero("cimentacion");
  agregar({tema: "Cimentación", elemento: "tipo de cimentación", valor: tipo, claves: ["cimentacion", "platea", "zapata", "zapatas"],
    fuente: ingCim ? "ingeniero" : dec.cimentacion?.valor ? "despacho" : "supuesto",
    porque: ingCim ? `La eligió el ingeniero${ingCim.porque ? `: ${ingCim.porque}` : ""}.` : deDespacho(dec.cimentacion) ?? "Sin casos parecidos: criterio por defecto del despacho.",
    cita: {norma: "E.050", estado: "investigada"},
    norma: "La capacidad portante y los asentamientos del Estudio de Mecánica de Suelos (E.050) deciden entre platea y zapatas: con q adm baja o suelo blando, la platea reparte la carga.",
    alternativas: [cim.tipo === "platea" ? "zapatas aisladas con vigas de cimentación (si el EMS da q adm suficiente)" : "platea (si el EMS da q adm baja o asentamientos diferenciales)"]});
  for (const [k, nombre] of [["hz", cim.tipo === "platea" ? "espesor de platea Hz" : "peralte de zapata Hz"], ["df", "profundidad de desplante Df"]]) {
    const v = cim[k];
    if (v === null || v === undefined) continue;
    const f = cim.fuentes?.[k] ?? "";
    agregar({tema: "Cimentación", elemento: nombre, valor: `${r2(v)} m`, claves: [k, k === "hz" ? "peralte" : "desplante", "cimentacion"],
      fuente: /dato del proyecto/.test(f) ? "proyecto" : /propuesto/.test(f) ? "despacho" : "supuesto",
      porque: /dato del proyecto/.test(f) ? "Lo indicaste en Datos del proyecto (EMS)." : /propuesto/.test(f) ? `Propuesto con proyectos parecidos del despacho (${deDespacho(dec[k]) ?? "casos estudiados"}).` : "Criterio por defecto del despacho: confírmalo con el EMS.",
      cita: {norma: "E.050", estado: "investigada"}, norma: "El EMS fija Df y la presión admisible (E.050); Hz se verifica por punzonamiento y corte con las reacciones del análisis.",
      alternativas: ["el valor del Estudio de Mecánica de Suelos del proyecto"]});
  }

  // ---- Losa ----
  const losa = modelo.losa ?? null;
  if (losa?.espesor) {
    const ing = delIngeniero("espesorLosa");
    agregar({tema: "Losa", elemento: "espesor de losa aligerada", valor: `${r2(losa.espesor)} m`, claves: ["losa", "aligerado", "aligerada", "espesor"],
      fuente: ing ? "ingeniero" : dec.espesorLosa?.valor ? "despacho" : "supuesto",
      porque: ing ? "Lo eligió el ingeniero." : deDespacho(dec.espesorLosa) ?? `Espesor típico del despacho (${CRITERIOS.aligerado.espesor} m) para las luces de la planta.`,
      cita: cita("espesorAligerado"), norma: "El espesor se elige por la luz libre del paño para no tener que verificar deflexiones (E.060, peraltes mínimos).",
      alternativas: ["losa maciza en paños de baños o con cargas concentradas", "mayor espesor si la luz libre es mayor"]});
  }

  // ---- Vigas ----
  const tiposViga = [...new Set((modelo.vigas ?? []).filter((v) => v.b && v.h).map((v) => `${m2(v.b)}x${m2(v.h)}`))];
  if (tiposViga.length) agregar({tema: "Vigas", elemento: "secciones de vigas", valor: tiposViga.join(", "), claves: ["viga", "vigas", "peralte", "seccion"],
    fuente: "despacho", porque: "Peralte por la luz del tramo (regla del despacho); las vigas que no cargan losa con el peralte secundario del proyecto (0.40 m; 0.50 m en zona 4), ancho de 0.25 m o el de las columnas.",
    cita: {norma: "E.060 cap. 21", estado: "investigada"}, norma: "Vigas de pórticos sismorresistentes: ancho y peralte mínimos y refuerzo continuo arriba y abajo (E.060 cap. 21).",
    alternativas: ["peralte mayor si el análisis da deriva alta o flexión mayor"]});
  agregar({tema: "Vigas", elemento: "estribos de vigas", valor: CRITERIOS.vigas.distribucion, claves: ["estribo", "estribos", "confinamiento", "viga"],
    fuente: "despacho", porque: "Zona de confinamiento de 2h en cada apoyo con estribos cerrados y gancho sísmico; el resto a 0.20 m (distribución del despacho).",
    cita: cita("estribosConfinamiento"), norma: "Confinamiento en los extremos de vigas y columnas sismorresistentes (E.060 21.4 y 21.6).", alternativas: []});

  // ---- Columnas ----
  const cols = modelo.columnas ?? [];
  if (cols.length) {
    const ing = delIngeniero("columnasComoArquitectura");
    agregar({tema: "Columnas", elemento: "secciones de columnas", valor: [...new Set(cols.map((c) => `${c.tipo} ${m2(c.b)}x${m2(c.h)}`))].join(", "), claves: ["columna", "columnas", "placa", "placas"],
      fuente: ing ? "ingeniero" : "plano", porque: ing ? "Lo decidió el ingeniero." : "Las secciones son las que dibujó el arquitecto en la planta (se respetan su ubicación y tamaño).",
      cita: null, norma: "El análisis verifica la deriva (E.030) y el diseño la flexocompresión (E.060); si no cumplen, se agrandan.",
      alternativas: ["agrandar las columnas o agregar placas si la deriva no cumple"]});
    const verificadas = (modelo.refuerzoColumnas ?? []).filter((r) => r.verificado);
    agregar({tema: "Columnas", elemento: "refuerzo de columnas", valor: (modelo.refuerzoColumnas ?? []).map((r) => `${r.tipo}: ${r.refuerzo}`).join("; ") || "cuantía mínima",
      claves: ["refuerzo", "acero", "cuantia", "columna", "columnas", "varillas"],
      fuente: verificadas.length ? "calculo" : "norma",
      porque: verificadas.length ? `Armado verificado en Análisis Estructural (${verificadas.length} tipo(s)) con las fuerzas del análisis.` : `Cuantía mínima del ${pct(CRITERIOS.columnas.cuantiaMinima)} de Ag con varillas de ${CRITERIOS.columnas.barra}: falta verificarlo con el análisis.`,
      cita: cita("cuantiaColumnas"), norma: "Cuantía de columnas entre 1 % y 6 % de Ag (E.060 10.9.1 y 21.6.3.1).",
      alternativas: verificadas.length ? [] : ["correr el ciclo con Análisis Estructural para verificar el armado"]});
    agregar({tema: "Columnas", elemento: "estribos de columnas", valor: CRITERIOS.columnas.distribucion, claves: ["estribo", "estribos", "confinamiento", "columna"],
      fuente: "despacho", porque: "Estribos de confinamiento en los extremos según la sección (más estribos en placas y columnas de 0.50 m o más), como en los cuadros del despacho.",
      cita: cita("estribosConfinamiento"), norma: "Zona de confinamiento y separación máxima de estribos en columnas sismorresistentes (E.060 21.4 y 21.6).", alternativas: []});
  }

  // ---- Materiales y recubrimientos ----
  agregar({tema: "Materiales", elemento: "concreto", valor: `f'c=${CRITERIOS.concreto.columnas} kg/cm² en elementos estructurales; ${CRITERIOS.concreto.columnetas} kg/cm² en columnetas`, claves: ["concreto", "fc", "f'c", "resistencia"],
    fuente: dec.fcColumnas?.valor ? "despacho" : "supuesto", porque: deDespacho(dec.fcColumnas) ?? "f'c habitual del despacho.",
    cita: {norma: "E.060 cap. 21", estado: "investigada"}, norma: "Los elementos sismorresistentes piden un concreto mínimo (E.060 cap. 21): 210 kg/cm² lo cumple.", alternativas: ["f'c mayor si el diseño lo requiere"]});
  agregar({tema: "Materiales", elemento: "acero de refuerzo", valor: "ASTM A615 Grado 60, fy=4200 kg/cm²", claves: ["acero", "fy", "a615"],
    fuente: "despacho", porque: "Acero corrugado de uso en el Perú para concreto armado.", cita: {norma: "E.060 cap. 3", estado: "investigada"}, norma: "Materiales: acero de refuerzo corrugado (E.060 cap. 3).", alternativas: []});
  agregar({tema: "Materiales", elemento: "recubrimientos", valor: "7.5 cm contra el suelo · 4 cm vigas y columnas · 2 cm losas", claves: ["recubrimiento", "recubrimientos"],
    fuente: "norma", porque: "Protección del acero contra la corrosión y el fuego.", cita: cita("recubrimientos"), norma: "Recubrimientos mínimos (E.060 7.7.1).", alternativas: []});

  // ---- Techo ----
  const cub = modelo.cubierta;
  if (cub) agregar({tema: "Techo", elemento: "techo inclinado", valor: `cumbrera +${r2(cub.cumbrera)} m${cub.pendientes ? `, faldones ${[...new Set([cub.pendientes.neg, cub.pendientes.pos])].map((p) => `${r2(p * 100)} %`).join(" y ")}` : `, pendiente ${r2(cub.pendiente * 100)} %`}`, claves: ["techo", "cumbrera", "pendiente", "cobertura"],
    fuente: cub.fuente === "cortes de la arquitectura" ? "plano" : cub.fuente === "pórticos dibujados" ? "plano" : "supuesto",
    porque: cub.fuente === "cortes de la arquitectura" ? `Del corte de la arquitectura: cumbrera${cub.ejeCumbrera ? ` sobre el eje ${cub.ejeCumbrera}` : ""}, nivel y pendientes escritas.` : cub.fuente === "pórticos dibujados" ? "Del nivel de cumbrera y la pendiente escritos en la arquitectura." : "Pendiente por defecto: no hay pendiente escrita en la arquitectura.",
    cita: null, norma: "La geometría del techo es de la arquitectura; la estructura la sigue.", alternativas: []});

  // ---- Sismo ----
  const v = versionE030(datos);
  agregar({tema: "Sismo", elemento: "norma sismorresistente", valor: `E.030-${v.version}`, claves: ["e030", "e.030", "sismo", "norma", "version"],
    fuente: v.confirmada ? "proyecto" : "supuesto", porque: v.aviso, cita: {norma: `E.030-${v.version}`, estado: "confirmada"},
    norma: `${NORMAS_RNE["E.030"].nombre}: rige por la fecha de licencia del proyecto (RM 183-2026-VIVIENDA y su transitoria).`, alternativas: v.confirmada ? [] : ["E.030-2026 si el proyecto no tenía licencia ni expediente aprobado antes de la RM 183-2026"]});
  if (sismo && sismo.Z !== undefined) agregar({tema: "Sismo", elemento: "parámetros sísmicos", valor: `Z=${sismo.Z}, U=${sismo.U}, S=${sismo.S}, Tp=${sismo.Tp}, TL=${sismo.TL}`, claves: ["sismo", "zona", "z", "suelo", "categoria", "parametros"],
    fuente: datos?.zona && datos?.suelo ? "proyecto" : "supuesto", porque: "Zona por la ubicación, suelo por el EMS y U por la categoría de la edificación.",
    cita: cita("categoriaU"), norma: "Factores de zona, uso y suelo de la E.030 (U: tabla 5).", alternativas: []});
  else agregar({tema: "Sismo", elemento: "parámetros sísmicos", valor: "por definir", claves: ["sismo", "zona", "suelo", "categoria", "parametros"], fuente: "supuesto",
    porque: "Faltan zona, perfil de suelo o categoría en Datos del proyecto.", cita: {norma: "E.030", estado: "investigada"}, norma: "Sin ellos no hay espectro ni verificación de deriva.", alternativas: []});
  if (resultados && (resultados.derivaX || resultados.derivaY)) {
    const d = Math.max(Number(resultados.derivaX) || 0, Number(resultados.derivaY) || 0), lim = resultados.limite ?? 0.007;
    agregar({tema: "Sismo", elemento: "deriva inelástica máxima", valor: `${d.toFixed(4)} (límite ${lim})`, claves: ["deriva", "drift", "desplazamiento"],
      fuente: "calculo", porque: d <= lim ? "Cumple con el límite de concreto armado." : "No cumple: hay que rigidizar.", cita: cita("deriva"), norma: "Distorsión máxima de entrepiso 0.007 en concreto armado (E.030-2018 tabla 11).", alternativas: d <= lim ? [] : ["columnas más peraltadas o placas en la dirección que falla"]});
  }
  agregar({tema: "Cargas", elemento: "combinaciones de carga", valor: "1.4CM+1.7CV · 1.25(CM+CV)±CS · 0.9CM±CS", claves: ["combinacion", "combinaciones", "carga", "cargas"],
    fuente: "norma", porque: "Resistencia requerida para el diseño de los elementos.", cita: cita("combinaciones"), norma: "Combinaciones de diseño (E.060 9.2); cargas vivas de la E.020.", alternativas: []});

  // ---- Pedidos del cliente ----
  for (const p of preferencias) agregar({tema: "Pedido del cliente", elemento: p.titulo, valor: p.opcionTexto, claves: ["cliente", "pedido", "preferencia", ...(p.claves ?? []), ...sinTildes(p.opcionTexto).split(/[^a-z]+/).filter((w) => w.length >= 5)],
    fuente: "cliente", porque: `Lo pidió el cliente; el agente aconsejó: ${p.consejo}`, cita: p.cita ?? null, norma: p.norma ?? "", alternativas: p.alternativas ?? []});
  return R;
}

const ETIQUETA_CITA = {confirmada: "artículo confirmado", investigada: "artículo por cotejar con el texto oficial"};

// Una decisión en texto: qué, valor, por qué, norma y fuente.
export function textoDecision(d) {
  const citaTxt = d.cita ? ` Norma: ${d.cita.norma} (${ETIQUETA_CITA[d.cita.estado] ?? d.cita.estado}). ${d.norma}` : d.norma ? ` ${d.norma}` : "";
  return `• ${d.tema} — ${d.elemento}: ${d.valor}. Por qué: ${d.porque}${citaTxt} Fuente: ${FUENTES[d.fuente] ?? d.fuente}.${d.alternativas?.length ? ` Alternativa: ${d.alternativas.join("; ")}.` : ""}`;
}

const sinTildes = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Decisiones que responden una pregunta ("¿por qué platea?", "justifica la viga de 0.40").
export function buscarDecisiones(registro, texto) {
  const palabras = sinTildes(texto).split(/[^a-z0-9.']+/).filter((w) => w.length >= 2);
  const puntaje = (d) => d.claves.reduce((s, c) => s + (palabras.some((w) => w === sinTildes(c) || (w.length >= 4 && sinTildes(c).startsWith(w))) ? 1 : 0), 0)
    + (palabras.some((w) => /^\d/.test(w) && sinTildes(d.valor).includes(w)) ? 1 : 0);
  const conPuntos = registro.map((d) => ({d, p: puntaje(d)})).filter((x) => x.p > 0);
  const max = Math.max(0, ...conPuntos.map((x) => x.p));
  return conPuntos.filter((x) => x.p === max).map((x) => x.d);
}

// Resumen del registro: cuántas decisiones por fuente y qué supuestos faltan confirmar.
export function resumenRegistro(registro) {
  const cuenta = {};
  for (const d of registro) cuenta[d.fuente] = (cuenta[d.fuente] ?? 0) + 1;
  const conNorma = registro.filter((d) => d.cita).length, confirmadas = registro.filter((d) => d.cita?.estado === "confirmada").length;
  const supuestos = registro.filter((d) => d.fuente === "supuesto");
  return {cuenta, conNorma, confirmadas, supuestos,
    texto: `${registro.length} decisiones justificadas: ${Object.entries(cuenta).map(([f, n]) => `${n} ${FUENTES[f] ?? f}`).join(", ")}. ${conNorma} con norma (${confirmadas} con el artículo confirmado).${supuestos.length ? ` Por confirmar: ${supuestos.map((d) => d.elemento).join(", ")}.` : ""}`};
}
