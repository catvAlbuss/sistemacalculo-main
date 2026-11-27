// ¿El modelo de análisis tiene las medidas del plano? Antes de calcular se compara con lo que el
// arquitecto escribió: las cotas entre ejes, los niveles (NFT/NTT), la forma y las pendientes del
// techo y las columnas. Si algo no coincide, no se calcula: un análisis con otras medidas no sirve.

import {pendientesDeTecho, picosDeTecho, nivelCumbreraEscrito} from "../lectura/techoArquitectura.js";

const TOL_LUZ = 0.02; // m: una cota redondeada al cm
const r2 = (v) => Math.round(v * 100) / 100;

// Luces entre ejes paralelos consecutivos con columnas, en metros (coordenadas de la lectura).
export function lucesEntreEjes(estructura) {
  const ejes = (estructura.ejesNombrados ?? []).filter((e) => e?.p && e?.q && !e.inclinado);
  const columnas = estructura.columnas ?? [];
  const usados = ejes.filter((e) => columnas.some((c) => String(c.eje ?? "").split("/").includes(e.nombre)));
  const grupos = [];
  for (const e of usados) {
    const l = Math.hypot(e.q.x - e.p.x, e.q.y - e.p.y) || 1;
    const d = {x: (e.q.x - e.p.x) / l, y: (e.q.y - e.p.y) / l};
    // Normal hacia +x o +y: las luces se nombran de izquierda a derecha y de abajo arriba (A–C, 4–6).
    const n0 = {x: -d.y, y: d.x}, n = n0.x + n0.y < 0 ? {x: -n0.x, y: -n0.y} : n0;
    let g = grupos.find((x) => Math.abs(x.d.x * d.x + x.d.y * d.y) > 0.99);
    if (!g) grupos.push(g = {d, n, ejes: []});
    g.ejes.push({nombre: e.nombre, t: e.p.x * g.n.x + e.p.y * g.n.y});
  }
  const luces = [];
  for (const g of grupos) {
    const orden = g.ejes.sort((a, b) => a.t - b.t);
    for (let i = 1; i < orden.length; i++) luces.push({de: orden[i - 1], a: orden[i], n: g.n, luz: orden[i].t - orden[i - 1].t});
    if (orden.length > 2) luces.push({de: orden[0], a: orden.at(-1), n: g.n, luz: orden.at(-1).t - orden[0].t, total: true});
  }
  return luces;
}

// Cota del arquitecto entre dos ejes: misma dirección y sus extremos sobre los dos ejes.
export function cotaEntre(cotas, luz, k, caja) {
  let mejor = null;
  for (const c of cotas) {
    const a = {x: c.a.x / k, y: c.a.y / k}, b = {x: c.b.x / k, y: c.b.y / k};
    if (Math.abs(c.direccion.x * luz.n.x + c.direccion.y * luz.n.y) < 0.98) continue;
    if (caja && ![a, b].every((p) => p.x > caja.x0 - 8 && p.x < caja.x1 + 8 && p.y > caja.y0 - 8 && p.y < caja.y1 + 8)) continue;
    const ta = a.x * luz.n.x + a.y * luz.n.y, tb = b.x * luz.n.x + b.y * luz.n.y;
    const [t0, t1] = [Math.min(ta, tb), Math.max(ta, tb)];
    const e0 = Math.abs(t0 - luz.de.t), e1 = Math.abs(t1 - luz.a.t);
    // Los dos extremos sobre los ejes (≤ 1 cm cada uno): una cota a las caras (VINCHOS 8: 1.5 cm
    // afuera de cada eje, 4.515 contra 4.485 entre ejes) no es la luz entre ejes.
    if (e0 <= 0.01 && e1 <= 0.01 && (!mejor || e0 + e1 < mejor.err)) mejor = {err: e0 + e1, valor: c.valor / k, escrita: c.texto != null};
  }
  return mejor;
}

// estructura: ctx.memoria.estructura; modelo: ctx.memoria.modeloEstructural; resumen: el del .e2k
// (modeloE2k); items y cotas: la lectura del plano (readPlan). Devuelve {verificaciones, noCumple}.
export function verificarContraPlano({estructura, modelo, resumen, items = [], cotas = []}) {
  const k = Number(estructura?.escala) || 1;
  const caja = estructura?.caja ? {x0: estructura.caja.x0 / k, y0: estructura.caja.y0 / k, x1: estructura.caja.x1 / k, y1: estructura.caja.y1 / k} : null;
  const v = [];
  const agregar = (titulo, estado, plano, enModelo, detalle = "") => v.push({titulo, estado, plano, modelo: enModelo, detalle});

  // 1) Luces entre ejes contra las cotas del arquitecto.
  for (const luz of lucesEntreEjes(estructura ?? {})) {
    const c = cotaEntre(cotas, luz, k, caja);
    const nombre = `${luz.de.nombre}–${luz.a.nombre}${luz.total ? " (total)" : ""}`;
    if (!c) { if (!luz.total) agregar(`Luz ${nombre}`, "sin_dato", "sin cota", `${r2(luz.luz)} m`, "El plano no acota esta luz entre ejes."); continue; }
    const ok = Math.abs(c.valor - luz.luz) <= TOL_LUZ;
    agregar(`Luz ${nombre}`, ok ? "cumple" : "no_cumple", `${r2(c.valor)} m`, `${r2(luz.luz)} m`,
      ok ? "" : c.escrita ? "El arquitecto escribió esta cota a mano y no coincide con lo dibujado: confirma cuál vale." : "El modelo no tiene la luz que acota el arquitecto.");
  }

  // 2) Columnas.
  const nCols = (estructura?.columnas ?? []).length;
  if (resumen?.apoyos != null) agregar("Columnas", resumen.apoyos === nCols ? "cumple" : "no_cumple", `${nCols}`, `${resumen.apoyos}`, resumen.apoyos === nCols ? "" : "El modelo no tiene las mismas columnas que la planta.");

  // 3) Techo: forma, cumbrera y pendientes.
  const pendientes = pendientesDeTecho(items);
  const picos = picosDeTecho(items, {k, pendientes});
  const techoModelo = resumen?.techo ?? null;
  const niveles = Number(modelo?.niveles) || 1;
  // La arquitectura dice "techo inclinado" con el perfil en los cortes o con la pendiente escrita.
  const inclinado = picos.length > 0 || pendientes.length > 0;
  if (inclinado && niveles === 1) {
    agregar("Forma del techo", techoModelo ? "cumple" : "no_cumple", picos.length ? "a dos aguas (cortes)" : `inclinado (PTE ${pendientes.map((p) => `${r2(p * 100)} %`).join(", ")})`, techoModelo ? "a dos aguas" : "plano",
      techoModelo ? "" : "La arquitectura tiene el techo inclinado y el modelo lo tiene plano.");
    const H = nivelCumbreraEscrito(items);
    if (H && techoModelo) agregar("Nivel de cumbrera", Math.abs(H - techoModelo.cumbrera) <= 0.05 ? "cumple" : "no_cumple", `+${r2(H)} m`, `+${r2(techoModelo.cumbrera)} m`);
    if (techoModelo && pendientes.length) {
      const enModelo = [...new Set([techoModelo.pendientes.neg, techoModelo.pendientes.pos])];
      const ok = enModelo.every((s) => pendientes.some((p) => Math.abs(p - s) <= 0.005));
      // Con el perfil de los cortes la pendiente es la escrita; sin él manda el nivel de cumbrera
      // escrito (VINCHOS 8: PTE 35 % y N.T.T. +4.44 no son compatibles; el ingeniero sigue el nivel).
      agregar("Pendientes del techo", ok ? "cumple" : picos.length ? "no_cumple" : "info", pendientes.map((p) => `${r2(p * 100)} %`).join(" y "), enModelo.map((p) => `${r2(p * 100)} %`).join(" y "),
        ok ? "" : picos.length ? "El modelo no tiene las pendientes del corte." : "La pendiente escrita no da el nivel de cumbrera escrito: el modelo sigue el nivel, como el pórtico dibujado.");
    }
  } else if (resumen?.elevaciones?.length) {
    agregar("Altura del techo", "info", "—", `+${r2(resumen.elevaciones.at(-1))} m`, techoModelo ? "" : "Techo plano en la arquitectura.");
  }
  return {verificaciones: v, noCumple: v.filter((x) => x.estado === "no_cumple")};
}

export function textoConformidad({verificaciones, noCumple}) {
  const marca = {cumple: "✓", no_cumple: "✗", sin_dato: "·", info: "·"};
  const filas = verificaciones.map((x) => `${marca[x.estado] ?? "·"} ${x.titulo}: plano ${x.plano} · modelo ${x.modelo}${x.detalle && x.estado !== "cumple" ? ` — ${x.detalle}` : ""}`);
  const cabeza = noCumple.length
    ? `El modelo NO tiene las medidas del plano en ${noCumple.length} punto(s); no lo envío a calcular hasta corregirlo:`
    : `Medidas del modelo verificadas contra el plano (${verificaciones.filter((x) => x.estado === "cumple").length} coinciden):`;
  return [cabeza, ...filas].join("\n");
}
