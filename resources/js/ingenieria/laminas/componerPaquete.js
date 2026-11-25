// Composición por contenido: sin número fijo de láminas ni datos de otro módulo.
//
// Reparte los planos del proyecto actual en láminas del formato del despacho como lo hace el
// ingeniero (formatoDespacho.js → repartoDespacho): cimentación y cimiento corrido, tabiquería,
// losas, pórticos con la escalera… Cada familia empieza lámina nueva salvo que quepa entera en
// el espacio libre de la anterior (módulos chicos: todo en dos láminas, como el módulo XIV).
// Dentro de la lámina cada plano ocupa un rectángulo libre (arriba a la izquierda primero),
// con su título debajo, y nada pisa el rótulo de la esquina inferior derecha.
//
// Escalas estándar (1/25, 1/30, 1/40, 1/50…): todas las plantas del paquete con la misma
// escala y todos los pórticos con la misma, la mayor que entra en la lámina.

import {formatoDespacho, repartoDespacho, nombrePlanoLamina, rotuloDespacho} from "./formatoDespacho.js";
import {anchoTexto} from "./rotulo.js";

const DENOMINADORES = [10, 20, 25, 30, 35, 40, 50, 75, 100, 125, 150, 200, 250, 300];
const AUXILIARES = /^(cuadro|notas$|corte$|detalle)/;
const PLANTAS = new Set(["cimentacion", "cimiento", "tabiqueria", "losa", "losaTecho"]);
// La mayor escala estándar (50/den: x2 = 1/25, x1 = 1/50) ≤ nominal con la que entra el contenido.
export function escalaEstandar(nominal, maxima) {
  const den = DENOMINADORES.find((d) => 50 / d <= Math.min(nominal, maxima) + 1e-9);
  return den ? 50 / den : Math.min(nominal, maxima);
}

// Rectángulos libres de una lámina (maxrects): colocar parte los libres que toca.
function ocupar(libres, r) {
  const fuera = [];
  for (const l of libres) {
    if (r.x >= l.x + l.w || r.x + r.w <= l.x || r.y >= l.y + l.h || r.y + r.h <= l.y) { fuera.push(l); continue; }
    if (r.x > l.x) fuera.push({x: l.x, y: l.y, w: r.x - l.x, h: l.h});
    if (r.x + r.w < l.x + l.w) fuera.push({x: r.x + r.w, y: l.y, w: l.x + l.w - r.x - r.w, h: l.h});
    if (r.y > l.y) fuera.push({x: l.x, y: l.y, w: l.w, h: r.y - l.y});
    if (r.y + r.h < l.y + l.h) fuera.push({x: l.x, y: r.y + r.h, w: l.w, h: l.y + l.h - r.y - r.h});
  }
  const utiles = fuera.filter((l) => l.w > 0.05 && l.h > 0.05);
  return utiles.filter((a, i) => !utiles.some((b, j) => j !== i && a.x >= b.x - 1e-9 && a.y >= b.y - 1e-9 && a.x + a.w <= b.x + b.w + 1e-9 && a.y + a.h <= b.y + b.h + 1e-9 && (j < i || a.w * a.h < b.w * b.h)));
}
// Esquina de la lámina que el ingeniero usa para cada tipo de bloque (medido en 168 láminas):
// plantas y pórticos arriba a la izquierda (95 %); notas en la columna derecha, arriba (88 %);
// cuadros y tablas a la derecha, sobre el rótulo; columnetas y viguetas en una banda baja.
const ESQUINA = {notas: "derArriba", cuadroColumnas: "derAbajo", cuadroVigas: "derAbajo", cuadroEmpalmes: "derAbajo", detalleLosa: "derAbajo", cuadroColumnetas: "izqAbajo"};
// Lugar donde entra un rectángulo w×h (sin la separación), en la esquina preferida de su tipo
// dentro de cada hueco libre; sin preferencia, el más arriba y a la izquierda.
function lugar(libres, w, h, esquina = "izqArriba") {
  let mejor = null;
  for (const l of libres) {
    if (w > l.w + 1e-9 || h > l.h + 1e-9) continue;
    const der = esquina.startsWith("der"), abajo = esquina.endsWith("Abajo");
    const x = der ? l.x + l.w - w : l.x, y = abajo ? l.y : l.y + l.h - h;
    // Puntaje: primero la altura pedida (arriba o abajo), después el lado (izquierda o derecha).
    const pv = abajo ? -y : y + h, ph = der ? x + w : -x;
    if (!mejor || pv > mejor.pv + 0.05 || (Math.abs(pv - mejor.pv) <= 0.05 && ph > mejor.ph)) mejor = {x, y, pv, ph};
  }
  return mejor && {x: mejor.x, y: mejor.y, w, h};
}

export function componerPaqueteLaminas({contenidos, marco, escalaPlanos = 1, reparto = repartoDespacho(), proyecto = ""}) {
  const valido = marco && Number.isFinite(marco.x1 - marco.x0) && Number.isFinite(marco.y1 - marco.y0)
    && marco.x1 - marco.x0 >= 12 && marco.y1 - marco.y0 >= 12;
  const formato = valido ? marco : formatoDespacho();
  const w = formato.x1 - formato.x0, h = formato.y1 - formato.y0;
  const f = Math.min(w / 41, h / 28.7);
  // Banda del título algo más alta y título más separado del bloque: los textos del pie del
  // bloque (N.F.C., niveles) no deben tocarlo.
  const margen = 0.5 * f, sep = 0.6 * f, altoTitulo = 0.25 * f, bandaTitulo = 1.2 * f;
  const rot = rotuloDespacho({x: 0, y: 0, x1: w, y1: h});
  const rotW = rot.caja.x1 - rot.caja.x0, rotH = rot.caja.y1 - rot.caja.y0;
  const utilW = w - 2 * margen, utilH = h - 2 * margen;
  // Lo más grande que entra en una lámina vacía: a lo alto junto al rótulo o a lo ancho sobre él.
  const maxima = (cw, ch, banda) => Math.max(
    Math.min((utilW - rotW - sep) / cw, (utilH - banda) / ch),
    Math.min(utilW / cw, (utilH - rotH - sep - banda) / ch));

  const items = contenidos.filter((c) => c?.contenido && c.caja && c.caja.x1 > c.caja.x0 && c.caja.y1 > c.caja.y0).map((c) => {
    const cw = c.caja.x1 - c.caja.x0, ch = c.caja.y1 - c.caja.y0;
    const conTitulo = Boolean(c.titulado && c.contenido.titulo);
    return {...c, cw, ch, conTitulo, banda: conTitulo ? bandaTitulo : 0, ancho: conTitulo ? anchoTexto(`${proyecto} - ${c.contenido.titulo}`, altoTitulo) * 1.3 : 0};
  });
  // Una escala por grupo: plantas juntas, pórticos juntos; lo demás por separado.
  const grupo = (it) => (PLANTAS.has(it.tipo) ? "plantas" : it.tipo === "portico" ? "porticos" : it.tipo === "corte" ? "cortes" : it.id);
  // Los cortes van juntos (misma escala, como el ingeniero); el detalle típico de aligerado, que es
  // ancho, va aparte: antes compartían escala y él achicaba los cortes a letra de 0.8 mm impresa.
  const escalas = new Map();
  for (const it of items) {
    const g = grupo(it), nominal = it.nominal ?? escalaPlanos;
    const s = it.conTitulo ? escalaEstandar(nominal, maxima(it.cw, it.ch, it.banda)) : Math.min(nominal, maxima(it.cw, it.ch, 0));
    escalas.set(g, Math.min(escalas.get(g) ?? Infinity, s));
  }
  for (const it of items) {
    it.escala = escalas.get(grupo(it));
    it.w = Math.max(it.cw * it.escala, it.ancho);
    it.h = it.ch * it.escala + it.banda;
  }

  // Familias en el orden del ingeniero; cuadros y especificaciones con la cimentación.
  const familias = reparto.familias.map((tipos) => ({tipos, items: []}));
  const familiaDe = (tipo) => familias.find((fm) => fm.tipos.includes(tipo));
  const deCimentacion = familiaDe("cimentacion") ?? familias[0];
  for (const it of items) {
    if (it.repetible || it.relleno) continue;
    const fm = familiaDe(it.tipo) ?? (it.tipo === "corte" ? familiaDe("cimiento") ?? deCimentacion : it.tipo === "detalleLosa" ? familiaDe("losa") ?? deCimentacion : it.tipo === "cuadroVigas" ? familiaDe("portico") ?? deCimentacion : /^cuadro|^notas$/.test(it.tipo) ? deCimentacion : null);
    if (fm) fm.items.push(it); else familias.push({tipos: [it.tipo], items: [it]});
  }
  const rango = (it) => { const i = reparto.orden.indexOf(it.tipo); return i < 0 ? reparto.orden.length : i; };
  for (const fm of familias) fm.items.sort((a, b) => rango(a) - rango(b) || items.indexOf(a) - items.indexOf(b));

  const hojas = [];
  const nuevaHoja = () => {
    const ox = hojas.length * (w + 3 * f);
    const hoja = {ox, libres: ocupar([{x: margen, y: margen, w: utilW, h: utilH}], {x: rot.caja.x0 - sep, y: 0, w: rotW + sep, h: rotH + sep}), colocados: [], tipos: new Set(), familia: null};
    hojas.push(hoja);
    return hoja;
  };
  const colocar = (hoja, it) => {
    const r = lugar(hoja.libres, it.w, it.h, ESQUINA[it.tipo]);
    if (!r) return false;
    hoja.libres = ocupar(hoja.libres, {x: r.x - sep / 2, y: r.y - sep / 2, w: r.w + sep, h: r.h + sep});
    hoja.colocados.push({it, r});
    hoja.tipos.add(it.tipo);
    return true;
  };
  const cabeEntera = (hoja, lista) => {
    let libres = hoja.libres;
    for (const it of lista) {
      const r = lugar(libres, it.w, it.h, ESQUINA[it.tipo]);
      if (!r) return false;
      libres = ocupar(libres, {x: r.x - sep / 2, y: r.y - sep / 2, w: r.w + sep, h: r.h + sep});
    }
    return true;
  };
  const diferidos = [];
  for (const fm of familias) {
    if (!fm.items.length) continue;
    const ultima = hojas.at(-1);
    const principales = fm.items.filter((it) => !AUXILIARES.test(it.tipo));
    // Pórticos: primero en el hueco de la lámina anterior (el ingeniero pone dos o tres junto a la
    // losa) y los que no entren, en láminas nuevas.
    const llenaHueco = ultima && fm.tipos.includes("portico") && principales.length && cabeEntera(ultima, principales.slice(0, 1));
    const propias = ultima && (llenaHueco || cabeEntera(ultima, principales.length ? principales : fm.items)) ? [ultima] : [nuevaHoja()];
    for (const it of fm.items) {
      // Primero en las láminas de esta familia (rellena huecos); si no entra, lámina nueva.
      if (propias.some((hoja) => colocar(hoja, it))) continue;
      // Cuadros, notas y detalles que no caben con su familia no abren una lámina solos:
      // van al final donde haya espacio (como el ingeniero, que los reparte en los huecos).
      if (AUXILIARES.test(it.tipo)) { diferidos.push(it); continue; }
      const hoja = nuevaHoja();
      propias.push(hoja);
      if (!colocar(hoja, it)) {
        // Más grande que una lámina vacía (no debería pasar): se reduce hasta que entre.
        const k = Math.min((utilW - rotW - sep) / it.w, (utilH) / it.h, 1) * 0.98;
        it.escala *= k; it.w *= k; it.h = (it.h - it.banda) * k + it.banda;
        colocar(hoja, it);
      }
    }
  }
  for (const it of diferidos) {
    if (hojas.some((hoja) => colocar(hoja, it))) continue;
    const hoja = nuevaHoja();
    colocar(hoja, it);
  }
  // Cuadros repetidos en las láminas donde el ingeniero también los pone (pórticos), solo si caben.
  for (const it of items.filter((x) => x.repetible)) {
    for (const hoja of hojas) {
      if (!reparto.cuadrosCon.some((t) => hoja.tipos.has(t)) || hoja.tipos.has(it.tipo)) continue;
      if (hoja.tipos.has("cimentacion")) continue;
      const copia = {...it};
      if (lugar(hoja.libres, copia.w, copia.h)) colocar(hoja, copia);
    }
  }

  // Detalles estándar del despacho (relleno): en el hueco que quede, primero en la lámina de su
  // familia (los de columna con la cimentación, los de losa con el aligerado) y si no en otra.
  // Nunca abren una lámina: si no caben, no van (como el ingeniero, que llena lo que sobra).
  // Una lámina ya cargada (≥ 55 %) cede el detalle a la más vacía, para no dejar una casi en blanco.
  const ocupacion = (hoja) => hoja.colocados.reduce((s, {r}) => s + r.w * r.h, 0) / (utilW * utilH);
  for (const it of items.filter((x) => x.relleno)) {
    const orden = [...hojas].sort((a, b) => {
      const pa = it.familia && a.tipos.has(it.familia) && ocupacion(a) < 0.55 ? 0 : 1, pb = it.familia && b.tipos.has(it.familia) && ocupacion(b) < 0.55 ? 0 : 1;
      return pa - pb || ocupacion(a) - ocupacion(b);
    });
    for (const hoja of orden) if (colocar(hoja, it)) break;
  }

  const resultado = hojas.map((hoja, i) => {
    const ox = hoja.ox;
    const espacios = [], planos = {}, tipos = [];
    hoja.colocados.forEach(({it, r}, j) => {
      const id = hoja.colocados.findIndex((c) => c.it.id === it.id) === j ? it.id : `${it.id}#${j}`;
      const dw = it.cw * it.escala, dh = it.ch * it.escala;
      espacios.push({id, tipo: it.tipo, titulado: it.conTitulo, escala: it.escala, extension: it.caja,
        caja: {x: ox + r.x + (r.w - dw) / 2, y: r.y + it.banda, x1: ox + r.x + (r.w + dw) / 2, y1: r.y + r.h},
        titulo: it.conTitulo ? {x: ox + r.x + Math.max(0, (r.w - Math.max(dw, it.ancho)) / 2), y: r.y + it.banda - 0.6 * f, alto: altoTitulo} : null});
      planos[id] = it.contenido;
      tipos.push(it.tipo);
    });
    const mover = (p) => ({...p, ...(p.a ? {a: [p.a[0] + ox, p.a[1]], b: [p.b[0] + ox, p.b[1]]} : {}), ...(p.at ? {at: [p.at[0] + ox, p.at[1]]} : {})});
    return {
      lamina: {marco: {x: ox, y: 0, x1: ox + w, y1: h}, espacios, titulos: [], plano: nombrePlanoLamina(tipos), tipos: [...new Set(tipos)],
        rotulo: rot.campos.map((c) => ({...c, x: c.x + ox})), rotuloDibujo: [...rot.lineas, ...rot.etiquetas].map(mover)},
      extra: {x: 0, y: 0}, planos, porticos: [], indice: i,
    };
  });
  return {hojas: resultado, formato: {ancho: w, alto: h, unidades: "metros de dibujo", origen: formato.origen ?? "marco del despacho", referencia: formato.referencia ?? null},
    reparto: {familias: reparto.familias, aprendido: reparto.aprendido, modulos: reparto.modulos},
    avisos: []};
}
