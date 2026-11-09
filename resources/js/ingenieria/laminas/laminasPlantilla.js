// Arquitectura → estructuras con la plantilla de láminas del despacho
// (public/assets/plantillas/estructuras-laminas.dxf/.json, generada desde un
// expediente de referencia con scripts/agente/generar-plantilla-estructuras.mjs).
//
// La plantilla aporta lo estándar: marco, rótulo, especificaciones técnicas,
// parámetros, detalles típicos y cuadros. Aquí se genera lo propio del proyecto
// desde la arquitectura leída y se encaja en los espacios de la plantilla:
// plano de cimentación, cimiento corrido, aligerado, pórticos y cuadro de columnas,
// con sus títulos ("<PROYECTO> - PLANO DE …") y los datos del rótulo.
// Unidades: las de un dibujo en metros (la plantilla dibuja los planos x2 = 1/25).

import {L, line, text} from "../cad/primitives.js";
import {planoCimentacion, planoCimientoCorrido} from "../planos/cimentacionPlano.js";
import {planoAligerado, seccionViga} from "../planos/aligeradoPlano.js";
import {cuadroColumnas, cuadroColumnetas} from "./cuadroColumnas.js";
import {datosDesdeArquitectura, textoEnCasilla, anchoTexto} from "./rotulo.js";
import {aplicarEstilo} from "../criterios/estiloLaminas.js";
import {separarTextos} from "./separarTextos.js";
import {planoPortico, alturaDesdeArquitectura, pendienteDesdeArquitectura, vanosDesdeArquitectura} from "../planos/porticoPlano.js";

const r4 = (v) => Math.round(v * 10000) / 10000;
const MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SETIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

// Transforma primitivas con una función de punto y un factor para radios y textos.
function transformar(primitivas, f, escala) {
  const P = ([x, y]) => { const q = f(x, y); return [r4(q[0]), r4(q[1])]; };
  return primitivas.map((p) => {
    if (p.type === "line") return {...p, a: P(p.a), b: P(p.b)};
    if (p.type === "pline") return {...p, points: p.points.map(P)};
    if (p.type === "circle" || p.type === "arc") return {...p, c: P(p.c), r: p.r * escala};
    if (p.type === "text") return {...p, at: P(p.at), h: p.h * escala};
    if (p.type === "hatch") return {...p, points: p.points.map(P), escala: (p.escala ?? 1) * escala};
    return p;
  });
}

// Encaja un contenido en su espacio a la escala nominal de la lámina. Si la plantilla
// guardó dónde puso el ingeniero las burbujas de ejes de ese plano, el plano se ubica
// igual (mismo centro de la grilla), así ocupa el lugar del original y no pisa nada;
// solo se reduce si la grilla de este proyecto es más grande que la del original.
function encajar(contenido, caja, nominal, ejesPlantilla = null) {
  const m = contenido.marco;
  const e = contenido.ejes;
  if (ejesPlantilla && e) {
    const ew = e.x1 - e.x0, eh = e.y1 - e.y0, rw = ejesPlantilla.x1 - ejesPlantilla.x, rh = ejesPlantilla.y1 - ejesPlantilla.y;
    let escala = Math.min(nominal, (rw * 1.1) / ew, (rh * 1.1) / eh);
    if (escala > nominal * 0.97) escala = nominal;
    const ex = (e.x0 + e.x1) / 2, ey = (e.y0 + e.y1) / 2, rx = (ejesPlantilla.x + ejesPlantilla.x1) / 2, ry = (ejesPlantilla.y + ejesPlantilla.y1) / 2;
    return {escala, primitivas: transformar(contenido.primitivas, (x, y) => [rx + (x - ex) * escala, ry + (y - ey) * escala], escala)};
  }
  const cw = m.x1 - m.x0, ch = m.y1 - m.y0;
  let escala = Math.min(nominal, (caja.x1 - caja.x0) / cw, (caja.y1 - caja.y0) / ch);
  // Si sobra menos de un 5 %, se respeta la escala nominal (los espacios tienen holgura).
  if (escala > nominal * 0.95) escala = nominal;
  const mx = (m.x0 + m.x1) / 2, my = (m.y0 + m.y1) / 2, cx = (caja.x0 + caja.x1) / 2, cy = (caja.y0 + caja.y1) / 2;
  return {escala, primitivas: transformar(contenido.primitivas, (x, y) => [cx + (x - mx) * escala, cy + (y - my) * escala], escala)};
}

export {cuadroColumnas};

// Nombre del proyecto: el texto más alto del dibujo (p. ej. el título "MÓDULO XIV").
export function proyectoDesdeArquitectura(items, respaldo = "") {
  let mejor = null;
  for (const it of items) {
    if (it.tipo !== "texto" || /^E-/.test(it.capa)) continue;
    const t = it.texto.trim();
    if (t.length < 4 || t.length > 40 || /^[\d.,+\-\s:]+$/.test(t)) continue;
    if (!mejor || it.alto > mejor.alto) mejor = {alto: it.alto, texto: t};
  }
  return (mejor?.texto ?? respaldo).toUpperCase().replace(/\s+/g, " ");
}

// Marco de lámina de la arquitectura: el rectángulo cerrado más grande que contiene
// la vista (en metros). Sin marco, la caja de la vista.
export function marcoDeVista(items, caja, k = 1) {
  const c = {x0: caja.x0 / k, y0: caja.y0 / k, x1: caja.x1 / k, y1: caja.y1 / k};
  let mejor = null;
  for (const it of items) {
    if (it.tipo !== "poli" || it.puntos.length < 4 || it.puntos.length > 5) continue;
    const xs = it.puntos.map((p) => p.x / k), ys = it.puntos.map((p) => p.y / k);
    const m = {x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys)};
    const recto = it.puntos.every((p) => [m.x0, m.x1].some((v) => Math.abs(p.x / k - v) < 1e-3) && [m.y0, m.y1].some((v) => Math.abs(p.y / k - v) < 1e-3));
    if (!recto || m.x0 > c.x0 || m.x1 < c.x1 || m.y0 > c.y0 || m.y1 < c.y1) continue;
    if (!mejor || (m.x1 - m.x0) * (m.y1 - m.y0) > (mejor.x1 - mejor.x0) * (mejor.y1 - mejor.y0)) mejor = m;
  }
  return mejor ?? c;
}

const ocupado = (items, k, box) => items.some((it) => (it.puntos ?? [it.centro]).some((p) => p && p.x / k > box.x0 && p.x / k < box.x1 && p.y / k > box.y0 && p.y / k < box.y1));

// Orden de los pórticos como en el expediente: ejes con letra (descendente), luego números (descendente).
const ordenEjes = (a, b) => b.nombre.localeCompare(a.nombre, "es", {numeric: true});

export function laminasConPlantilla({lectura, items, caja, k = 1, config, cimentacion, datos = {}, fecha = new Date()}) {
  const proyecto = proyectoDesdeArquitectura(items, lectura.titulo || "PROYECTO");
  // Datos del rótulo: el formulario del panel manda; si no, el rótulo de la arquitectura.
  const datosRotulo = {...datosDesdeArquitectura(items), ...Object.fromEntries(Object.entries(datos ?? {}).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== ""))};
  const nominal = config.escalaPlanos ?? 2;
  const marcos = config.laminas.map((l) => l.marco);
  const T = {x0: Math.min(...marcos.map((m) => m.x)), y0: Math.min(...marcos.map((m) => m.y)), x1: Math.max(...marcos.map((m) => m.x1)), y1: Math.max(...marcos.map((m) => m.y1))};

  // Debajo del marco de la arquitectura que contiene la vista (o de la vista misma),
  // alineado a su izquierda; si ahí ya hay algo (láminas anteriores), más abajo.
  const marco = marcoDeVista(items, caja, k);
  const alto = T.y1 - T.y0, gap = Math.max(3, 0.1 * alto);
  const O = {x: marco.x0 - T.x0, y: marco.y0 - gap - alto - T.y0};
  for (let i = 0; i < 20 && ocupado(items, k, {x0: T.x0 + O.x, y0: T.y0 + O.y, x1: T.x1 + O.x, y1: T.y1 + O.y}); i++) O.y -= alto + gap;
  const mover = (prims) => transformar(prims, (x, y) => [x + O.x, y + O.y], 1);
  const previas = items.filter((it) => it.tipo === "texto" && it.capa === L.LAMINA && /^E-\d{2}$/.test(it.texto)).length;

  // Contenido de cada espacio.
  const cim = planoCimentacion({lectura, items, caja, k, titulo: lectura.titulo}, {tipo: cimentacion});
  const cc = planoCimientoCorrido({lectura, items, caja, k}, {columnetas: lectura.columnetas ?? []});
  const ali = planoAligerado({lectura, items, k});
  const cuadro = cuadroColumnas(lectura.columnas);
  const cuadroCtas = cuadroColumnetas(lectura.columnetas ?? []); // ya traen su código (pa, pb…) del cimiento corrido
  const altura = alturaDesdeArquitectura(items);
  const pendiente = pendienteDesdeArquitectura(items);
  const vanos = vanosDesdeArquitectura(items, k);
  const vigaTipo = ali.tiposViga[0] ? {b: 0.25, h: Number(ali.tiposViga[0].medida.split("x")[1])} : seccionViga(4);
  const ejesPortico = lectura.ejes
    .map((eje) => ({eje, columnas: lectura.columnas.filter((c) => c.eje.split("/").includes(eje.nombre))}))
    .filter((x) => x.columnas.length >= 2)
    .sort((a, b) => ordenEjes(a.eje, b.eje));
  const porticos = ejesPortico.map(({eje, columnas}) => planoPortico({eje, columnas, altura, espesorLosa: ali.espesor, viga: vigaTipo, cimentacion: {tipo: cim.tipo, peralte: cim.peralte, df: cim.df}, columnetas: lectura.columnetas ?? [], cumbrera: ali.cumbrera, pendiente, vanos}));
  const contenidos = {
    cimentacion: cim.contenido, cimiento: cc.contenido, aligerado: ali.contenido, cuadroColumnas: cuadro.contenido, cuadroColumnetas: cuadroCtas?.contenido,
  };

  // Hojas: las de la plantilla y, si hay más pórticos que espacios (módulo 3: 8 ejes),
  // copias de la lámina de pórticos a la derecha (E-03, E-04…) con los que faltan.
  const porHoja = (lamina) => lamina.espacios.filter((e) => /^portico\d+$/.test(e.id) && e.caja).length;
  const iPorticos = config.laminas.findIndex((l) => porHoja(l) > 0);
  const hojas = config.laminas.map((lamina) => ({lamina, extra: {x: 0, y: 0}, porticos: []}));
  if (iPorticos >= 0) {
    const lp = config.laminas[iPorticos], cap = porHoja(lp);
    hojas[iPorticos].porticos = porticos.slice(0, cap);
    const ancho = lp.marco.x1 - lp.marco.x, separacion = Math.max(1, (lp.marco.x - (config.laminas[iPorticos - 1]?.marco.x1 ?? lp.marco.x - 3)));
    for (let n = 1; cap * n < porticos.length; n++) {
      hojas.push({lamina: lp, extra: {x: T.x1 - lp.marco.x + separacion + (n - 1) * (ancho + separacion), y: 0}, porticos: porticos.slice(cap * n, cap * (n + 1)), copia: true});
    }
  }
  const zona = {x0: T.x0, y0: T.y0, x1: Math.max(T.x1, ...hojas.map((h) => h.lamina.marco.x1 + h.extra.x)), y1: T.y1};

  const prim = [];
  const laminas = [];
  const copias = [];
  const escalas = new Set();
  hojas.forEach(({lamina, extra, porticos: deHoja, copia}, i) => {
    const codigo = `E-${String(previas + i + 1).padStart(2, "0")}`;
    const mover = (prims) => transformar(prims, (x, y) => [x + O.x + extra.x, y + O.y + extra.y], 1);
    if (copia) copias.push({desplazamiento: {x: O.x + extra.x, y: O.y + extra.y}, marco: lamina.marco});
    const titulosLibres = [...lamina.titulos];
    for (const espacio of lamina.espacios) {
      const m = /^portico(\d+)$/.exec(espacio.id);
      const contenido = m ? deHoja[Number(m[1]) - 1]?.contenido : contenidos[espacio.id];
      if (!contenido || !espacio.caja) continue;
      const esPlano = !/^cuadro/.test(espacio.id);
      // Plantas a 1/25 (x2); pórticos a 1/50 (x1) y cuadros en unidades de lámina, como el expediente.
      const nominalEspacio = !esPlano ? 1 : /^portico/.test(espacio.id) ? 1 : nominal;
      // En los planos, ningún rótulo encima de otro (los cuadros ya van celda por celda).
      if (esPlano) separarTextos(contenido.primitivas);
      const {primitivas, escala} = encajar(contenido, {x0: espacio.caja.x, y0: espacio.caja.y, x1: espacio.caja.x1, y1: espacio.caja.y1}, nominalEspacio, espacio.ejes);
      // Capas y colores del despacho (estiloLaminas.js) según el tipo de plano.
      prim.push(...mover(aplicarEstilo(primitivas, !esPlano ? "cuadro" : /^portico/.test(espacio.id) ? "portico" : "planta")));
      if (!esPlano) continue;
      const esc = `1/${Math.round(50 / escala)}`;
      escalas.add(esc);
      // Título: el de la plantilla más cercano bajo el espacio (subrayado como en el expediente).
      const cerca = titulosLibres.map((t, j) => ({t, j, d: Math.hypot(t.x - espacio.caja.x, (t.y - espacio.caja.y) * 2)})).sort((a, b) => a.d - b.d)[0];
      const pos = cerca ? cerca.t : {x: espacio.caja.x, y: espacio.caja.y - 0.6, alto: 0.25};
      if (cerca) titulosLibres.splice(cerca.j, 1);
      const titulo = `${proyecto} - ${contenido.titulo}`;
      const largo = anchoTexto(titulo, pos.alto);
      prim.push(...mover(aplicarEstilo([
        text(L.TITULO, [pos.x, pos.y], titulo, pos.alto, 0, "izq"),
        line(L.TITULO, [pos.x, pos.y - pos.alto * 0.35], [pos.x + largo, pos.y - pos.alto * 0.35]),
        text(L.TITULO, [pos.x, pos.y - pos.alto * 1.6], `ESC: ${esc}`, pos.alto * 0.7, 0, "izq"),
      ])));
    }
    // Rótulo: cada dato en su casilla, ajustado a su ancho (sin salirse ni encimarse).
    const valores = {
      ...datosRotulo,
      lamina: codigo, especialidad: "ESTRUCTURAS", escala: "INDICADA", fecha: `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`,
      plano: `PLANO DE ${lamina.plano} - ${proyecto}`,
      // El CUI va como último renglón del proyecto (su casilla original cae sobre el código de lámina).
      proyecto: `${datosRotulo.proyecto || proyecto}${datosRotulo.cui ? ` · CUI N° ${String(datosRotulo.cui).replace(/^CUI\s*N?°?\s*/i, "")}` : ""}`,
      cip: datosRotulo.cip ? `CIP N° ${String(datosRotulo.cip).replace(/^CIP\s*N?°?\s*/i, "")}` : "",
      cui: "",
    };
    for (const campo of lamina.rotulo) {
      const max = campo.campo === "plano" || campo.campo === "proyecto" ? Math.max(campo.lineas, 3) : campo.lineas;
      // En la capa (y color) del dato en el expediente: NCAMINO1, CAPA8, ".".
      prim.push(...mover(textoEnCasilla(campo, valores[campo.campo], {max, capa: campo.capa ?? L.LAMINA})));
    }
    laminas.push({codigo, plano: lamina.plano});
  });

  const avisos = [...cim.avisos];
  if (iPorticos < 0 && porticos.length) avisos.push("La plantilla no tiene espacio para pórticos.");
  if (!cc.tramos) avisos.push("No encontré muros sobre los ejes: el plano de cimiento corrido quedó sin cimientos.");
  return {
    desplazamiento: O, copias, primitivas: prim, laminas, proyecto, avisos,
    zona: {x0: zona.x0 + O.x, y0: zona.y0 + O.y, x1: zona.x1 + O.x, y1: zona.y1 + O.y},
    resumen: {
      cimentacion: cim.tipo === "platea" ? "platea" : `${cim.zapatas.length} zapatas`,
      cimientoCorrido: cc.tramos, anchoCimiento: cc.ancho,
      aligerado: {espesor: ali.espesor, viguetas: ali.viguetas, vigas: ali.vigas, panos: ali.panos?.length},
      columnetas: cuadroCtas?.filas?.map((f) => `${f.codigo} ${f.refuerzo}`),
      rotulo: Object.keys(datosRotulo).filter((k2) => datosRotulo[k2]),
      porticos: ejesPortico.map((x) => x.eje.nombre), altura,
      techo: ali.cumbrera ? {pendiente, cumbrera: Math.max(...porticos.map((p) => p.cumbrera ?? 0))} : null,
      columnas: cuadro.filas, escalas: [...escalas],
    },
  };
}
