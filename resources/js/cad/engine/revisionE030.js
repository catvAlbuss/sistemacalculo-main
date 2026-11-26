// Revisión del agente (E.030-2018) sobre el modelo y los resultados del análisis sísmico.
// Funciones puras: reciben los datos y devuelven verificaciones con valor, límite, artículo y la
// acción concreta cuando algo no cumple. Sin IA: lo que se afirma sale de los números.
//
// Criterios:
// - Masa participativa acumulada ≥ 90 % en X e Y (art. 29.1.2).
// - Deriva inelástica = 0.75·R·Δelástica (regular) o 0.85·R·Δelástica (irregular) ≤ límite de la
//   Tabla 11 (art. 31.1 y 32): concreto armado 0.007, acero 0.010, albañilería 0.005, madera 0.010.
// - Cortante dinámico ≥ 80 % del estático (regular) o 90 % (irregular) (art. 29.4); el estático se
//   calcula con el mismo espectro del caso: V = Sa(T1)·P.

export const LIMITE_DERIVA = {concreto: 0.007, acero: 0.01, albanileria: 0.005, madera: 0.01, ductilidad_limitada: 0.005};
const G = 9.80665;
const r = (v, n = 3) => Math.round(v * 10 ** n) / 10 ** n;

// R escrito en el nombre del espectro ("E030-2018 Z3S2 R8", "E030 R=7"), o en su meta.
export function rDelEspectro(funcion) {
  const meta = Number(funcion?.meta?.R);
  if (meta > 0) return meta;
  const m = /\bR\s*=?\s*(\d+(?:[.,]\d+)?)/i.exec(String(funcion?.name ?? funcion?.id ?? ""));
  return m ? Number(m[1].replace(",", ".")) : null;
}

// Sa(T) en g a partir de los puntos del espectro y el factor del caso. Misma convención que el módulo
// (seismicConfig.saInG, por defecto true): los puntos están en g y un factor ≈ g solo los pasa a m/s²;
// con enG = false los puntos están en m/s².
export function saEnG(puntos, T, factor = 1, enG = true) {
  const pts = (puntos ?? []).map((p) => ({T: Number(p.T ?? p.t ?? p.period), Sa: Number(p.Sa ?? p.sa ?? p.value)}))
    .filter((p) => Number.isFinite(p.T) && Number.isFinite(p.Sa)).sort((a, b) => a.T - b.T);
  if (!pts.length) return null;
  let sa = pts.at(-1).Sa;
  if (T <= pts[0].T) sa = pts[0].Sa;
  else for (let i = 1; i < pts.length; i++) {
    if (T <= pts[i].T) { const a = pts[i - 1], b = pts[i]; sa = a.Sa + ((b.Sa - a.Sa) * (T - a.T)) / (b.T - a.T || 1); break; }
  }
  const f = Math.abs(Number(factor) || 1);
  if (!enG) return (sa * f) / G;
  return f >= 3 ? (sa * f) / G : sa * f;
}

const item = (o) => ({estado: "cumple", ...o});

// Modelo antes de analizar: lo mínimo para que el análisis tenga sentido.
export function revisarModelo({apoyos = 0, barras = 0, sinSeccion = 0, cargas = {}, masa = false, espectroX = false, espectroY = false} = {}) {
  const v = [];
  v.push(item({grupo: "Modelo", titulo: "Apoyos en la base", valor: apoyos, estado: apoyos > 0 ? "cumple" : "no_cumple",
    detalle: apoyos > 0 ? `${apoyos} nudo(s) con restricción.` : "Ningún nudo tiene restricción: el modelo es un mecanismo.", accion: apoyos > 0 ? null : "Asigna apoyos en la base (Assign ▸ Joint ▸ Restraints)."}));
  v.push(item({grupo: "Modelo", titulo: "Secciones asignadas", valor: `${barras - sinSeccion}/${barras}`, estado: sinSeccion ? "no_cumple" : "cumple",
    detalle: sinSeccion ? `${sinSeccion} barra(s) sin sección.` : "Todas las barras tienen sección.", accion: sinSeccion ? "Asigna sección a las barras resaltadas (Assign ▸ Frame ▸ Section)." : null}));
  for (const [clave, nombre] of [["muerta", "Carga muerta (CM)"], ["viva", "Carga viva (CV)"]]) {
    v.push(item({grupo: "Modelo", titulo: nombre, valor: cargas[clave] ? "definida" : "falta", estado: cargas[clave] ? "cumple" : "observacion",
      detalle: cargas[clave] ? "Patrón de carga definido." : `No hay un patrón de ${clave === "muerta" ? "carga muerta" : "carga viva"}.`, accion: cargas[clave] ? null : "Define el patrón y asígnale cargas (E.020)."}));
  }
  v.push(item({grupo: "Modelo", titulo: "Fuente de masa (peso sísmico)", valor: masa ? "definida" : "falta", estado: masa ? "cumple" : "no_cumple", norma: "E.030 art. 26",
    detalle: masa ? "Peso sísmico definido." : "Sin fuente de masa no hay modos ni sismo.", accion: masa ? null : "Define la fuente de masa: CM + 50 % CV (A, B) o 25 % CV (C)."}));
  v.push(item({grupo: "Modelo", titulo: "Espectro en X e Y", valor: `${espectroX ? "X" : "—"} / ${espectroY ? "Y" : "—"}`, estado: espectroX && espectroY ? "cumple" : "no_cumple", norma: "E.030 art. 29.2",
    detalle: espectroX && espectroY ? "Hay casos espectrales en las dos direcciones." : "Falta un caso espectral en alguna dirección.", accion: espectroX && espectroY ? null : "Define los casos de espectro E.030 en X (U1) y en Y (U2)."}));
  return v;
}

// Resultados del análisis por dirección: {X: {resultado, espectro: {puntos, factor}}, Y: …}.
export function revisarResultados({direcciones = {}, R = null, regular = true, material = "concreto"} = {}) {
  const v = [];
  const supuestos = [];
  const Rusar = Number(R) > 0 ? Number(R) : 8;
  if (!(Number(R) > 0)) supuestos.push("R = 8 (no pude leerlo del espectro): confírmalo.");
  if (regular) supuestos.push("Estructura regular (Ia = Ip = 1): factor de deriva 0.75·R y cortante mínimo del 80 %; verifica las irregularidades.");
  const factorDeriva = (regular ? 0.75 : 0.85) * Rusar;
  const limite = LIMITE_DERIVA[material] ?? LIMITE_DERIVA.concreto;
  const minimoCortante = regular ? 0.8 : 0.9;

  for (const dir of ["X", "Y"]) {
    const d = direcciones[dir];
    if (!d?.resultado) {
      v.push(item({grupo: `Sismo ${dir}`, titulo: "Análisis espectral", estado: "sin_datos", detalle: `No hay resultados del caso en ${dir}.`, accion: "Corre el análisis sísmico con un caso espectral en esta dirección."}));
      continue;
    }
    const res = d.resultado, k = dir.toLowerCase();
    const modos = res.modal?.modes ?? [];
    // Masa participativa acumulada.
    const acumulada = Number(modos.at(-1)?.[`cumulative_participation_${k}`]);
    if (Number.isFinite(acumulada)) {
      v.push(item({grupo: `Sismo ${dir}`, titulo: "Masa participativa acumulada", valor: `${r(acumulada, 1)} %`, limite: "≥ 90 %", norma: "E.030 art. 29.1.2",
        estado: acumulada >= 90 ? "cumple" : "no_cumple", detalle: `Con ${modos.length} modos.`, accion: acumulada >= 90 ? null : "Aumenta el número de modos del caso modal hasta llegar al 90 %."}));
    }
    // Periodo fundamental: el modo con más masa en la dirección.
    const fundamental = modos.reduce((mejor, m) => (Number(m[`mass_participation_${k}`]) > Number(mejor?.[`mass_participation_${k}`] ?? -1) ? m : mejor), null);
    const T1 = Number(fundamental?.period);
    if (fundamental) {
      v.push(item({grupo: `Sismo ${dir}`, titulo: "Periodo fundamental", valor: `T = ${r(T1)} s (modo ${fundamental.mode})`, estado: "info",
        detalle: `${r(Number(fundamental[`mass_participation_${k}`]), 1)} % de la masa en ${dir}.`}));
    }
    // Deriva inelástica máxima.
    const derivas = (res.drifts?.[k] ?? []).map((f) => ({piso: f.story ?? f.level, elastica: Number(f.drift_ratio)})).filter((f) => Number.isFinite(f.elastica));
    if (derivas.length) {
      const peor = derivas.reduce((a, b) => (b.elastica > a.elastica ? b : a));
      const inelastica = peor.elastica * factorDeriva;
      const cumple = inelastica <= limite;
      v.push(item({grupo: `Sismo ${dir}`, titulo: "Deriva inelástica máxima", valor: r(inelastica, 4), limite: `≤ ${limite}`, norma: "E.030 art. 31–32, Tabla 11",
        estado: cumple ? "cumple" : "no_cumple",
        detalle: `${peor.piso}: elástica ${r(peor.elastica, 5)} × ${r(factorDeriva, 2)} (${regular ? "0.75" : "0.85"}·R, R = ${Rusar}).`,
        accion: cumple ? null : `Rigidiza en ${dir}: hace falta bajar la deriva ${r((1 - limite / inelastica) * 100, 0)} % (columnas más peraltadas en ${dir}, placas o muros).`}));
    }
    // Cortante dinámico frente al estático (con el mismo espectro).
    const Vdin = Number(res.story_shear_summary?.[`base_shear_${k}`] ?? res.etabs_results?.summary?.[`base_shear_${k}_N`]);
    const masa = Number(res.effective_mass?.summary?.[`total_effective_m${k}`]);
    const sa = Number.isFinite(T1) ? saEnG(d.espectro?.puntos, T1, d.espectro?.factor ?? 1, d.espectro?.enG !== false) : null;
    // C/R ≥ 0.11 (art. 28.2.1): Sa(T) = Z·U·C·S/R y la meseta es 2.5·Z·U·S/R, así que Z·U·S = meseta·R/2.5
    // y C/R = Sa(T1)/(Z·U·S). Si no llega, el estático se calcula con C/R = 0.11.
    const meseta = Math.max(0, ...(d.espectro?.puntos ?? []).map((p) => saEnG(d.espectro.puntos, Number(p.T ?? p.t ?? 0), d.espectro?.factor ?? 1, d.espectro?.enG !== false) || 0));
    const ZUS = meseta > 0 ? (meseta * Rusar) / 2.5 : null;
    let saEstatico = sa;
    if (sa > 0 && ZUS > 0) {
      const CR = sa / ZUS;
      if (CR < 0.11) saEstatico = 0.11 * ZUS;
      v.push(item({grupo: `Sismo ${dir}`, titulo: "C/R mínimo", valor: r(CR, 3), limite: "≥ 0.11", norma: "E.030 art. 28.2.1", estado: CR >= 0.11 ? "cumple" : "observacion",
        detalle: CR >= 0.11 ? `C(T1)/R con Z·U·S = ${r(ZUS, 3)} (de la meseta del espectro).` : "El cortante estático se toma con C/R = 0.11.", accion: null}));
    }
    if (Vdin > 0 && masa > 0 && saEstatico > 0) {
      const Vest = saEstatico * masa * G;
      const relacion = Vdin / Vest;
      const cumple = relacion >= minimoCortante - 1e-6;
      v.push(item({grupo: `Sismo ${dir}`, titulo: "Cortante dinámico / estático", valor: `${r(relacion * 100, 1)} %`, limite: `≥ ${minimoCortante * 100} %`, norma: "E.030 art. 29.4",
        estado: cumple ? "cumple" : "no_cumple",
        detalle: `V dinámico ${r(Vdin / 9806.65, 2)} tonf; V estático ${r(Vest / 9806.65, 2)} tonf = Sa ${r(saEstatico, 4)} g × P ${r((masa * G) / 9806.65, 2)} tonf (Sa(T1) ${r(sa, 4)} g).`,
        accion: cumple ? null : `Escala el caso espectral en ${dir} por ${r((minimoCortante * Vest) / Vdin, 3)} (multiplica su factor de escala).`}));
    } else {
      v.push(item({grupo: `Sismo ${dir}`, titulo: "Cortante dinámico / estático", estado: "sin_datos", norma: "E.030 art. 29.4", detalle: "Faltan el cortante basal, el peso sísmico o el espectro del caso para compararlo."}));
    }
  }
  return {verificaciones: v, supuestos, parametros: {R: Rusar, regular, material, factorDeriva: r(factorDeriva, 2), limiteDeriva: limite}};
}

// Resumen para mostrar y para el agente: cuántas cumplen, cuáles no y qué hacer primero.
export function resumirRevision(verificaciones) {
  const cuenta = (e) => verificaciones.filter((x) => x.estado === e).length;
  const fallas = verificaciones.filter((x) => x.estado === "no_cumple");
  return {
    cumple: cuenta("cumple"), noCumple: fallas.length, sinDatos: cuenta("sin_datos"),
    texto: fallas.length
      ? `${fallas.length} verificación(es) no cumplen: ${fallas.map((x) => `${x.grupo} · ${x.titulo}`).join("; ")}.`
      : cuenta("sin_datos") ? "Lo revisado cumple, pero faltan datos para algunas verificaciones." : "Todas las verificaciones cumplen.",
    acciones: fallas.map((x) => x.accion).filter(Boolean),
  };
}

// ---------------- Irregularidades (E.030 Tablas 8 y 9) ----------------
// Por dirección, con los resultados del caso espectral:
// - Torsional (Tabla 9): en cada piso, deriva máxima de un extremo / deriva promedio > 1.3 (extrema
//   > 1.5), solo si la deriva máxima pasa del 50 % de la permisible. Ip = 0.75 (0.60 extrema). Con las
//   coordenadas de los nudos (las del envío al motor) la deriva es por nudo (piso − piso inferior en
//   la misma planta); sin ellas, con desplazamientos totales (aproximado, se dice).
// - Rigidez, piso blando (Tabla 8): k = V/Δ del piso < 70 % del de arriba o < 80 % del promedio de los
//   tres de arriba (extrema: 60 % / 70 %). Ia = 0.75 (0.50 extrema).
// - Masa (Tabla 8): masa de un piso > 1.5 × la de un piso vecino (sin azotea). Ia = 0.90.
export function revisarIrregularidades({direcciones = {}, nodos = [], factorDeriva = 6, limiteDeriva = 0.007} = {}) {
  const v = [];
  let Ia = 1, Ip = 1;
  const xy = new Map((nodos ?? []).map((n) => [String(n.id), {x: Number(n.x), y: Number(n.y)}]));
  const tor = [], rig = [], mas = [];
  for (const dir of ["X", "Y"]) {
    const res = direcciones[dir]?.resultado;
    if (!res) continue;
    const k = dir.toLowerCase(), comp = `d${k}`;
    const pisos = [...(res.seismic?.[k]?.story_drifts ?? [])].sort((a, b) => Number(a.elevation_m) - Number(b.elevation_m));
    const desp = res.seismic?.[k]?.displacements ?? {};
    const u = (id) => Math.abs(Number(desp[String(id)]?.[comp] ?? NaN));
    // Torsional.
    let peorRel = 0, pisoTor = null, aproximado = false;
    pisos.forEach((piso, i) => {
      const h = Number(piso.height_m) || 1;
      const abajo = pisos[i - 1];
      const derivas = (piso.node_ids ?? []).map((id) => {
        const p = xy.get(String(id));
        let uAbajo = 0;
        if (abajo) {
          const par = p ? (abajo.node_ids ?? []).find((j) => { const q = xy.get(String(j)); return q && Math.hypot(q.x - p.x, q.y - p.y) < 0.02; }) : null;
          if (par != null) uAbajo = u(par);
          else aproximado = true;
        }
        return (u(id) - uAbajo) / h;
      }).filter(Number.isFinite);
      if (derivas.length < 2) return;
      const max = Math.max(...derivas), prom = derivas.reduce((s, x) => s + x, 0) / derivas.length;
      if (!(prom > 0) || max * factorDeriva <= 0.5 * limiteDeriva) return;
      const rel = max / prom;
      if (rel > peorRel) { peorRel = rel; pisoTor = piso.story; }
    });
    if (peorRel > 0) tor.push({dir, rel: peorRel, piso: pisoTor, aproximado});
    // Rigidez y masa por piso.
    const cortes = [...(res.story_shears?.[k] ?? [])].sort((a, b) => Number(a.z) - Number(b.z));
    const rigideces = cortes.map((c) => {
      const d = pisos.find((p) => p.story === c.story || p.story === c.level);
      const delta = Number(d?.[`drift_${k}_m`]);
      return {piso: c.story ?? c.level, k: delta > 0 ? Number(c.story_shear ?? c.shear) / delta : null, m: Number(c.mass)};
    });
    rigideces.forEach((p, i) => {
      if (i === rigideces.length - 1 || !(p.k > 0)) return;
      const arriba = rigideces.slice(i + 1, i + 4).map((q) => q.k).filter((x) => x > 0);
      if (!arriba.length) return;
      const r1 = p.k / arriba[0], r3 = arriba.length === 3 ? p.k / (arriba.reduce((s, x) => s + x, 0) / 3) : null;
      const extrema = r1 < 0.6 || (r3 !== null && r3 < 0.7), irregular = r1 < 0.7 || (r3 !== null && r3 < 0.8);
      if (irregular) rig.push({dir, piso: p.piso, r1, r3, extrema});
    });
    rigideces.forEach((p, i) => {
      if (i === rigideces.length - 1 || !(p.m > 0)) return; // la azotea no cuenta
      const vecinos = [rigideces[i - 1], rigideces[i + 1]].filter((q) => q?.m > 0);
      const mayor = vecinos.find((q) => p.m > 1.5 * q.m);
      if (mayor) mas.push({dir, piso: p.piso, rel: p.m / mayor.m});
    });
  }
  // Torsional.
  const peorTor = tor.sort((a, b) => b.rel - a.rel)[0];
  if (peorTor) {
    const extrema = peorTor.rel > 1.5, irregular = peorTor.rel > 1.3;
    if (irregular) Ip = Math.min(Ip, extrema ? 0.6 : 0.75);
    v.push(item({grupo: "Irregularidad", titulo: "Torsional (en planta)", valor: r(peorTor.rel, 2), limite: "≤ 1.3", norma: "E.030 Tabla 9",
      estado: irregular ? "no_cumple" : "cumple",
      detalle: `Deriva máx./promedio en ${peorTor.dir}, ${peorTor.piso}${peorTor.aproximado ? " (aprox.: sin la planta de todos los nudos)" : ""}.${irregular ? ` Irregularidad ${extrema ? "torsional EXTREMA (Ip = 0.60)" : "torsional (Ip = 0.75)"}.` : ""}`,
      accion: irregular ? `Reduce la excentricidad: rigidiza el perímetro más flexible (placas o columnas) o usa Ip = ${extrema ? "0.60" : "0.75"} en R.${extrema ? " En categoría A no se permite irregularidad extrema (Tabla 10)." : ""}` : null}));
  } else {
    v.push(item({grupo: "Irregularidad", titulo: "Torsional (en planta)", estado: "cumple", norma: "E.030 Tabla 9", detalle: "No aplica: ninguna deriva pasa del 50 % de la permisible (o no hay datos por nudo)."}));
  }
  // Rigidez.
  const peorRig = rig.sort((a, b) => Math.min(a.r1, a.r3 ?? 9) - Math.min(b.r1, b.r3 ?? 9))[0];
  if (peorRig) Ia = Math.min(Ia, peorRig.extrema ? 0.5 : 0.75);
  v.push(item({grupo: "Irregularidad", titulo: "Rigidez (piso blando)", valor: peorRig ? `${r(peorRig.r1 * 100, 0)} %` : "—", limite: "≥ 70 % del piso de arriba", norma: "E.030 Tabla 8",
    estado: peorRig ? "no_cumple" : "cumple",
    detalle: peorRig ? `${peorRig.piso} en ${peorRig.dir}: ${r(peorRig.r1 * 100, 0)} % de la rigidez del piso de arriba${peorRig.r3 !== null ? `, ${r(peorRig.r3 * 100, 0)} % del promedio de los tres de arriba` : ""}. ${peorRig.extrema ? "Extrema (Ia = 0.50)." : "Ia = 0.75."}` : "Ningún piso es mucho más flexible que el de arriba.",
    accion: peorRig ? `Rigidiza ${peorRig.piso} (columnas o placas que bajen hasta la base) o usa Ia = ${peorRig.extrema ? "0.50" : "0.75"} en R.` : null}));
  // Masa.
  const peorMasa = mas.sort((a, b) => b.rel - a.rel)[0];
  if (peorMasa) Ia = Math.min(Ia, 0.9);
  v.push(item({grupo: "Irregularidad", titulo: "Masa o peso", valor: peorMasa ? r(peorMasa.rel, 2) : "—", limite: "≤ 1.5 × piso vecino", norma: "E.030 Tabla 8",
    estado: peorMasa ? "no_cumple" : "cumple",
    detalle: peorMasa ? `${peorMasa.piso}: ${r(peorMasa.rel, 2)} veces la masa de un piso vecino (Ia = 0.90).` : "Sin pisos con masa mayor a 1.5 veces la de sus vecinos (azotea excluida).",
    accion: peorMasa ? "Revisa las cargas de ese piso o usa Ia = 0.90 en R." : null}));
  return {verificaciones: v, Ia, Ip, irregular: Ia < 1 || Ip < 1};
}

// ---------------- Irregularidades por la forma (E.030 Tablas 8 y 9) ----------------
// Con la geometría del modelo (nudos x, y, z y elementos nudo i → nudo j del payload del motor):
// geométrica vertical, discontinuidad de los sistemas resistentes, esquinas entrantes, discontinuidad
// del diafragma y sistemas no paralelos; y el retiro por junta sísmica con el desplazamiento del
// análisis. La irregularidad de resistencia (piso débil) necesita la resistencia de cada piso: queda
// para el ingeniero. Tolerancia de 5 cm al agrupar coordenadas.
const TOL = 0.05;
const agrupar = (valores) => {
  const out = [];
  for (const v of [...valores].sort((a, b) => a - b)) if (!out.length || v - out.at(-1) > TOL) out.push(v);
  return out;
};
const indice = (lista, v) => lista.findIndex((x) => Math.abs(x - v) <= TOL);

// Planta de un piso como grilla de paños: un paño cuenta si sus cuatro esquinas tienen nudo.
function plantaDelPiso(nudos) {
  const xs = agrupar(nudos.map((n) => n.x)), ys = agrupar(nudos.map((n) => n.y));
  const hay = new Set(nudos.map((n) => `${indice(xs, n.x)},${indice(ys, n.y)}`));
  const celdas = [];
  for (let i = 0; i + 1 < xs.length; i++) for (let j = 0; j + 1 < ys.length; j++) {
    celdas.push({i, j, llena: [[i, j], [i + 1, j], [i, j + 1], [i + 1, j + 1]].every(([a, b]) => hay.has(`${a},${b}`)), area: (xs[i + 1] - xs[i]) * (ys[j + 1] - ys[j])});
  }
  return {xs, ys, celdas, lx: xs.at(-1) - xs[0], ly: ys.at(-1) - ys[0]};
}

// Vacíos de la planta conectados con el borde (entrantes) o encerrados (huecos del diafragma).
function vaciosDePlanta(p) {
  const nx = p.xs.length - 1, ny = p.ys.length - 1;
  const celda = (i, j) => p.celdas[i * ny + j];
  const visto = new Set(), grupos = [];
  for (const c of p.celdas) {
    if (c.llena || visto.has(`${c.i},${c.j}`)) continue;
    const pila = [c], g = [];
    visto.add(`${c.i},${c.j}`);
    while (pila.length) {
      const q = pila.pop(); g.push(q);
      for (const [a, b] of [[q.i + 1, q.j], [q.i - 1, q.j], [q.i, q.j + 1], [q.i, q.j - 1]]) {
        if (a < 0 || b < 0 || a >= nx || b >= ny || visto.has(`${a},${b}`) || celda(a, b).llena) continue;
        visto.add(`${a},${b}`); pila.push(celda(a, b));
      }
    }
    const borde = g.some((q) => q.i === 0 || q.j === 0 || q.i === nx - 1 || q.j === ny - 1);
    const i0 = Math.min(...g.map((q) => q.i)), i1 = Math.max(...g.map((q) => q.i)), j0 = Math.min(...g.map((q) => q.j)), j1 = Math.max(...g.map((q) => q.j));
    grupos.push({borde, area: g.reduce((s, q) => s + q.area, 0), dx: p.xs[i1 + 1] - p.xs[i0], dy: p.ys[j1 + 1] - p.ys[j0]});
  }
  return grupos;
}

export function revisarGeometria({nodos = [], elementos = [], desplazamientoMaximo = null, altura = null} = {}) {
  const v = [];
  let Ia = 1, Ip = 1;
  const N = new Map(nodos.map((n) => [String(n.id), {x: Number(n.x), y: Number(n.y), z: Number(n.z)}]));
  const niveles = agrupar(nodos.map((n) => Number(n.z))).filter((z) => z > TOL);
  if (!niveles.length || !elementos.length) {
    v.push(item({grupo: "Irregularidad", titulo: "Forma en planta y elevación", estado: "sin_datos", norma: "E.030 Tablas 8 y 9", detalle: "Sin la geometría del análisis: corre el análisis sísmico."}));
    return {verificaciones: v, Ia, Ip};
  }
  const delNivel = (z) => nodos.filter((n) => Math.abs(Number(n.z) - z) <= TOL).map((n) => ({x: Number(n.x), y: Number(n.y)}));
  const plantas = niveles.map((z) => ({z, ...plantaDelPiso(delNivel(z))}));
  const verticales = elementos.map((e) => [N.get(String(e.node_i)), N.get(String(e.node_j))]).filter(([a, b]) => a && b && Math.abs(a.z - b.z) > TOL && Math.hypot(a.x - b.x, a.y - b.y) <= TOL).map(([a, b]) => (a.z < b.z ? [a, b] : [b, a]));
  const horizontales = elementos.map((e) => [N.get(String(e.node_i)), N.get(String(e.node_j))]).filter(([a, b]) => a && b && Math.abs(a.z - b.z) <= TOL && Math.hypot(a.x - b.x, a.y - b.y) > TOL);

  // Geométrica vertical (Tabla 8): la planta de un piso es > 1.3 veces la de un piso vecino (sin azotea).
  const geo = [];
  plantas.forEach((p, i) => {
    if (i === plantas.length - 1) return; // azotea
    for (const q of [plantas[i - 1], plantas[i + 1]].filter(Boolean)) {
      if (q === plantas.at(-1) && q !== plantas[i - 1]) continue;
      for (const [d, a, b] of [["X", p.lx, q.lx], ["Y", p.ly, q.ly]]) if (b > 0 && a > 1.3 * b) geo.push({piso: i + 1, d, rel: a / b});
    }
  });
  if (geo.length) Ia = Math.min(Ia, 0.9);
  const g0 = geo.sort((a, b) => b.rel - a.rel)[0];
  v.push(item({grupo: "Irregularidad", titulo: "Geométrica vertical", valor: g0 ? r(g0.rel, 2) : "—", limite: "≤ 1.3 × piso vecino", norma: "E.030 Tabla 8", estado: g0 ? "no_cumple" : "cumple",
    detalle: g0 ? `Piso ${g0.piso}: su planta en ${g0.d} mide ${r(g0.rel, 2)} veces la de un piso vecino (Ia = 0.90).` : "Ninguna planta pasa de 1.3 veces la de un piso vecino (azotea excluida).",
    accion: g0 ? "Usa Ia = 0.90 en R o uniformiza las plantas." : null}));

  // Discontinuidad de los sistemas resistentes (Tabla 8): elementos verticales que no siguen hacia abajo.
  const base = Math.min(...nodos.map((n) => Number(n.z)));
  const sinApoyo = verticales.filter(([a]) => a.z > base + TOL && !verticales.some(([c, d]) => Math.abs(d.z - a.z) <= TOL && Math.hypot(d.x - a.x, d.y - a.y) <= 0.25));
  if (sinApoyo.length) Ia = Math.min(Ia, 0.8);
  v.push(item({grupo: "Irregularidad", titulo: "Discontinuidad de los sistemas resistentes", valor: sinApoyo.length, limite: "0 columnas sin continuidad", norma: "E.030 Tabla 8", estado: sinApoyo.length ? "no_cumple" : "cumple",
    detalle: sinApoyo.length ? `${sinApoyo.length} elemento(s) vertical(es) nacen sobre una viga o losa (sin columna debajo a ≤ 25 cm), p. ej. en (${r(sinApoyo[0][0].x, 2)}, ${r(sinApoyo[0][0].y, 2)}) a z = ${r(sinApoyo[0][0].z, 2)} m (Ia = 0.80).` : "Todas las columnas y placas continúan hasta la base.",
    accion: sinApoyo.length ? "Haz que esas columnas bajen hasta la cimentación, o usa Ia = 0.80 (verifica el desalineamiento > 25 % de la dimensión del elemento)." : null}));

  // Esquinas entrantes y discontinuidad del diafragma (Tabla 9).
  const ent = [], dia = [];
  plantas.forEach((p, i) => {
    const area = p.celdas.reduce((s, c) => s + c.area, 0);
    for (const g of vaciosDePlanta(p)) {
      if (g.borde && g.dx > 0.2 * p.lx && g.dy > 0.2 * p.ly) ent.push({piso: i + 1, fx: g.dx / p.lx, fy: g.dy / p.ly});
      if (!g.borde) dia.push({piso: i + 1, rel: g.area / area});
    }
  });
  const e0 = ent.sort((a, b) => b.fx * b.fy - a.fx * a.fy)[0];
  if (e0) Ip = Math.min(Ip, 0.9);
  v.push(item({grupo: "Irregularidad", titulo: "Esquinas entrantes", valor: e0 ? `${r(e0.fx * 100, 0)} % × ${r(e0.fy * 100, 0)} %` : "—", limite: "≤ 20 % de la planta en X e Y", norma: "E.030 Tabla 9", estado: e0 ? "no_cumple" : "cumple",
    detalle: e0 ? `Piso ${e0.piso}: un entrante mide ${r(e0.fx * 100, 0)} % del largo en X y ${r(e0.fy * 100, 0)} % en Y (Ip = 0.90).` : "Sin entrantes mayores al 20 % de la planta en las dos direcciones.",
    accion: e0 ? "Usa Ip = 0.90 en R o separa el edificio con una junta en bloques regulares." : null}));
  const d0 = dia.filter((x) => x.rel > 0.5).sort((a, b) => b.rel - a.rel)[0];
  if (d0) Ip = Math.min(Ip, 0.85);
  const dMax = dia.sort((a, b) => b.rel - a.rel)[0];
  v.push(item({grupo: "Irregularidad", titulo: "Discontinuidad del diafragma", valor: dMax ? `${r(dMax.rel * 100, 0)} %` : "0 %", limite: "huecos ≤ 50 % del área", norma: "E.030 Tabla 9", estado: d0 ? "no_cumple" : "cumple",
    detalle: d0 ? `Piso ${d0.piso}: los huecos del diafragma suman ${r(d0.rel * 100, 0)} % del área (Ip = 0.85).` : dMax ? `Huecos interiores de hasta ${r(dMax.rel * 100, 0)} % del área: no llegan al 50 %.` : "Sin huecos interiores en el diafragma.",
    accion: d0 ? "Usa Ip = 0.85 en R o reduce las aberturas del diafragma." : null}));

  // Sistemas no paralelos (Tabla 9): vigas a ≥ 30° de las dos direcciones principales.
  const largo = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const ang = ([a, b]) => ((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 180) % 90;
  const total = horizontales.reduce((s, h) => s + largo(...h), 0);
  const oblicuas = horizontales.filter((h) => { const t = ang(h); return Math.min(t, 90 - t) >= 30; }).reduce((s, h) => s + largo(...h), 0);
  const fr = total ? oblicuas / total : 0;
  if (fr > 0.1) Ip = Math.min(Ip, 0.9);
  v.push(item({grupo: "Irregularidad", titulo: "Sistemas no paralelos", valor: `${r(fr * 100, 0)} %`, limite: "≤ 10 % de vigas a ≥ 30°", norma: "E.030 Tabla 9", estado: fr > 0.1 ? "no_cumple" : "cumple",
    detalle: fr > 0.1 ? `${r(fr * 100, 0)} % de la longitud de vigas va a 30° o más de los ejes principales (Ip = 0.90).` : "Los pórticos son paralelos a las direcciones principales.",
    accion: fr > 0.1 ? "Usa Ip = 0.90 en R; el diseño debe considerar las fuerzas en esas direcciones." : null}));

  // Junta sísmica: retiro del límite ≥ 2/3 del desplazamiento máximo y ≥ s/2, s = 0.006 h ≥ 3 cm.
  const h = Number(altura) || Math.max(...niveles) - base;
  const s = Math.max(0.03, 0.006 * h);
  const retiro = Math.max((2 / 3) * (Number(desplazamientoMaximo) || 0), s / 2);
  v.push(item({grupo: "Irregularidad", titulo: "Junta sísmica (retiro del límite)", valor: `${r(retiro * 100, 1)} cm`, limite: `≥ 2/3·Δmáx y ≥ s/2 (s = ${r(s * 100, 1)} cm)`, norma: "E.030 art. 33", estado: "observacion",
    detalle: `${desplazamientoMaximo ? `Desplazamiento inelástico máximo ${r(desplazamientoMaximo * 100, 1)} cm; ` : ""}s = 0.006·h = ${r(s * 100, 1)} cm con h = ${r(h, 2)} m. Verifica ese retiro en la arquitectura.`,
    accion: `Deja al menos ${r(retiro * 100, 1)} cm al límite de propiedad y anótalo en las láminas.`}));

  // Resistencia (piso débil): necesita la resistencia de cada piso.
  v.push(item({grupo: "Irregularidad", titulo: "Resistencia (piso débil)", estado: "sin_datos", norma: "E.030 Tabla 8", detalle: "Necesita la resistencia a corte de cada piso (columnas y placas diseñadas): verifícala a mano."}));
  return {verificaciones: v, Ia, Ip};
}


// ---------------- Diseño ----------------
// columnas: cadSystem.rcColumnDesignResults ({label, check: {base: {ratio, comboId}, top}, unsupported});
// viga: cadSystem.rcBeamDesign ({results.flexion[tipo].data.meta[i] {As_usar, As_max}, rebarState[tipo].asReal[i]}).
export function revisarDiseno({columnas = null, viga = null} = {}) {
  const v = [];
  const disenadas = (columnas ?? []).filter((c) => !c.unsupported);
  const sinSoporte = (columnas ?? []).filter((c) => c.unsupported);
  if (!columnas?.length) {
    v.push(item({grupo: "Diseño", titulo: "Columnas (flexocompresión)", estado: "sin_datos", detalle: "Aún no se diseñaron columnas.", accion: "Usa «Diseñar todas las columnas» para revisarlas todas."}));
  } else {
    const ratio = (c) => Math.max(Number(c.check?.base?.ratio) || 0, Number(c.check?.top?.ratio) || 0);
    const fallan = disenadas.filter((c) => ratio(c) > 1).sort((a, b) => ratio(b) - ratio(a));
    const peor = [...disenadas].sort((a, b) => ratio(b) - ratio(a))[0];
    v.push(item({grupo: "Diseño", titulo: "Columnas (flexocompresión)", valor: peor ? `ratio máx. ${r(ratio(peor), 2)}` : "—", limite: "≤ 1.00", norma: "E.060 cap. 10",
      estado: fallan.length ? "no_cumple" : disenadas.length ? "cumple" : "sin_datos",
      detalle: `${disenadas.length} columna(s) diseñada(s)${fallan.length ? `; no cumplen: ${fallan.slice(0, 6).map((c) => `${c.label} (${r(ratio(c), 2)})`).join(", ")}${fallan.length > 6 ? "…" : ""}` : ""}.`,
      accion: fallan.length ? "Aumenta la sección o la cuantía de esas columnas y vuelve a diseñarlas." : null}));
    if (sinSoporte.length) {
      v.push(item({grupo: "Diseño", titulo: "Columnas sin diseño automático", valor: sinSoporte.length, estado: "observacion",
        detalle: `${sinSoporte.slice(0, 6).map((c) => `${c.label}: ${c.unsupportedReason || "sección no soportada"}`).join("; ")}.`, accion: "Diséñalas a mano (sección en L/T o compuesta) o define su armado."}));
    }
  }
  const flex = viga?.results?.flexion;
  if (flex) {
    let total = 0, malas = 0;
    for (const tipo of ["positivo", "negativo"]) {
      const meta = flex[tipo]?.data?.meta ?? [], as = viga.rebarState?.[tipo]?.asReal ?? [];
      meta.forEach((m, i) => { if (!m) return; total++; const a = Number(as[i] || 0); if (!(a >= m.As_usar && a < m.As_max)) malas++; });
    }
    v.push(item({grupo: "Diseño", titulo: "Viga diseñada (flexión, acero real)", valor: `${total - malas}/${total} cumplen`, norma: "E.060 cap. 10",
      estado: malas ? "no_cumple" : "cumple", detalle: malas ? `${malas} ubicación(es) con acero real fuera de [As requerido, As máx.).` : "El acero elegido cubre lo requerido en todas las ubicaciones.",
      accion: malas ? "Elige el acero real de esas ubicaciones en el diseño de la viga (o una combinación personalizada)." : null}));
  }
  return {verificaciones: v};
}

// Pedido para "Explicar con IA": solo los hechos de la revisión; la IA no calcula ni inventa.
export function mensajesExplicacion(revision) {
  const hechos = (revision?.verificaciones ?? []).filter((x) => x.estado !== "cumple")
    .map((x) => ({grupo: x.grupo, verificacion: x.titulo, valor: x.valor, limite: x.limite, estado: x.estado, detalle: x.detalle, accion: x.accion}));
  return [
    {role: "system", content: "Eres un ingeniero estructural peruano revisor (E.030-2018, E.060). Explica en español, en 6 a 10 líneas, qué significan las observaciones de esta revisión automática, cuál atender primero y por qué, y qué cambio concreto recomiendas. Usa SOLO los números dados; no inventes valores, cálculos ni verificaciones que no estén en los datos. Si todo cumple, dilo y menciona lo que falta verificar a mano."},
    {role: "user", content: JSON.stringify({parametros: revision?.parametros, irregularidad: revision?.irregularidad, observaciones: hechos, resumen: revision?.resumen?.texto, supuestos: revision?.supuestos})},
  ];
}
