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
    if (Vdin > 0 && masa > 0 && sa > 0) {
      const Vest = sa * masa * G;
      const relacion = Vdin / Vest;
      const cumple = relacion >= minimoCortante - 1e-6;
      v.push(item({grupo: `Sismo ${dir}`, titulo: "Cortante dinámico / estático", valor: `${r(relacion * 100, 1)} %`, limite: `≥ ${minimoCortante * 100} %`, norma: "E.030 art. 29.4",
        estado: cumple ? "cumple" : "no_cumple",
        detalle: `V dinámico ${r(Vdin / 9806.65, 2)} tonf; V estático ${r(Vest / 9806.65, 2)} tonf = Sa(T1) ${r(sa, 4)} g × P ${r((masa * G) / 9806.65, 2)} tonf.`,
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
