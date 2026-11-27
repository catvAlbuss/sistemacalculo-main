// Revisor de láminas como lo haría el ingeniero: 15 puntos que salen de la norma (GE.020 art. 12,
// E.060 cap. 1, 7, 12 y 21, E.030-2026 art. 9.2, E.050) y de la práctica de revisión. Cada punto vale
// 1 (cumple), 0.5 (a medias) o 0, con su evidencia y lo que falta. Es determinista: lee los textos de
// las láminas que dibujó el agente (no adivina) — el patrón "verificador en el bucle" de los agentes
// de ingeniería (el modelo propone, el verificador juzga).

const n = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const hay = (T, re) => T.some((t) => re.test(t));
const cuenta = (T, re) => T.filter((t) => re.test(t)).length;

export const PUNTOS_REVISOR = [
  {id: 1, titulo: "Láminas que pide la GE.020 (art. 12)", norma: "E.060 1.2.4 (y GE.020 art. 12)"},
  {id: 2, titulo: "Normas, cargas, f'c y fy", norma: "E.060 1.2.4 a–d"},
  {id: 3, titulo: "Parámetros sísmicos con T, cortante basal y deriva", norma: "E.030-2026 art. 9.2"},
  {id: 4, titulo: "Condiciones de cimentación del EMS (q adm, Df, cemento)", norma: "E.050 art. 12, 17 y 19"},
  {id: 5, titulo: "Recubrimientos por elemento", norma: "E.060 7.7.1"},
  {id: 6, titulo: "Ganchos estándar y sísmico de 135°", norma: "E.060 7.1 y 21.1"},
  {id: 7, titulo: "Anclajes y empalmes por diámetro", norma: "E.060 12"},
  {id: 8, titulo: "Zonas donde no se empalma", norma: "E.060 21.5.2.3 (vigas) y 21.6.3.2 (columnas)"},
  {id: 9, titulo: "Estribos de vigas con zona de confinamiento", norma: "E.060 21.5.3"},
  {id: 10, titulo: "Cuadro de columnas con estribaje de confinamiento", norma: "E.060 21.6.4"},
  {id: 11, titulo: "Cotas, ejes y niveles (NPT, NFC, NFZ)", norma: "práctica de revisión"},
  {id: 12, titulo: "Aligerado: viguetas, acero de temperatura y bastones", norma: "E.060 9.7"},
  {id: 13, titulo: "Cimentación: planta, cortes y Df", norma: "E.060 1.2.4 e y E.050 art. 19"},
  {id: 14, titulo: "Escalas declaradas y sin textos encimados", norma: "práctica de revisión"},
  {id: 15, titulo: "Rótulo completo (proyecto, lámina, escala, fecha, ingeniero, CIP)", norma: "práctica de revisión"},
];

// textos: los de las láminas del agente. extra: {encimados, datos: {proyecto, especialista, cip}}.
export function revisarContraNorma(textos, {encimados = null, datos = {}} = {}) {
  const T = textos.map(n);
  const p = (id, valor, evidencia, falta = "") => ({...PUNTOS_REVISOR[id - 1], valor, evidencia, falta});
  const r = [];
  // 1. Láminas
  const laminas = [["cimentación", /PLANO DE CIMENTACION|PLATEA/], ["techo (aligerado o losa)", /ALIGERADO|LOSA ALIGERADA|LOSA MACIZA/], ["columnas", /CUADRO DE (COLUMNAS?|PLACAS)/], ["vigas", /PORTICO|CUADRO DE VIGAS/]];
  const tiene = laminas.filter(([, re]) => hay(T, re));
  r.push(p(1, tiene.length === 4 ? 1 : tiene.length >= 2 ? 0.5 : 0, `Hay: ${tiene.map(([k]) => k).join(", ") || "ninguna"}.`, laminas.filter((l) => !tiene.includes(l)).map(([k]) => `plano de ${k}`).join(", ")));
  // 2. Normas, cargas, f'c, fy
  const c2 = [["normas", /E\.0(20|30|50|60|70)/], ["sobrecargas", /SOBRECARGA|CARGA VIVA|S\/C/], ["f'c", /F.C\s*=?\s*\d{3}/], ["fy", /FY\s*=?\s*4200/]];
  const ok2 = c2.filter(([, re]) => hay(T, re));
  r.push(p(2, ok2.length === 4 ? 1 : ok2.length >= 2 ? 0.5 : 0, `Hay: ${ok2.map(([k]) => k).join(", ")}.`, c2.filter((x) => !ok2.includes(x)).map(([k]) => k).join(", ")));
  // 3. E.030 art. 9.2: parámetros + T + V basal + deriva (con números, no "pendiente")
  const param = ["Z", "U", "S", "TP", "TL", "R"].filter((k) => hay(T, new RegExp(`(^|[^A-Z])${k}\\s*=\\s*\\d`)));
  const resultados = [["período T", /\bT\s*[XY]?\s*=\s*\d|PERIODO[^0-9]*\d/], ["cortante basal", /(CORTANTE BASAL|V\s*BASAL|V\s*[XY]\s*=)[^0-9]*\d/], ["deriva", /DERIVA[^0-9]*0[.,]\d/]];
  const okR = resultados.filter(([, re]) => hay(T, re));
  const pendiente = hay(T, /DEL ANALISIS SISMICO \(PENDIENTE\)/);
  r.push(p(3, param.length >= 5 && okR.length === 3 ? 1 : param.length >= 5 ? 0.5 : 0, `Parámetros: ${param.join(", ") || "—"}; resultados: ${okR.map(([k]) => k).join(", ") || (pendiente ? "pendientes del análisis" : "—")}.`,
    okR.length < 3 ? `${resultados.filter((x) => !okR.includes(x)).map(([k]) => k).join(", ")} del análisis (Análisis Estructural ▸ Enviar diseño al agente)` : ""));
  // 4. EMS
  const qadm = hay(T, /(PRESION ADMISIBLE|CAPACIDAD PORTANTE|Q\s*ADM|σ\s*ADM)[^0-9]*\d/);
  const df = hay(T, /DF\s*=?\s*-?\s*\d/), cemento = hay(T, /CEMENTO\s+(PORTLAND\s+)?TIPO/);
  r.push(p(4, qadm && df && cemento ? 1 : (df && cemento) || qadm ? 0.5 : 0, `q adm ${qadm ? "sí" : "no"}, Df ${df ? "sí" : "no"}, cemento ${cemento ? "sí" : "no"}.`, qadm ? "" : "presión admisible del EMS (Datos del proyecto ▸ qadm)"));
  // 5. Recubrimientos
  const rec = cuenta(T, /RECUBRIMIENTO/);
  r.push(p(5, hay(T, /RECUBRIMIENTOS/) ? 1 : rec ? 0.5 : 0, hay(T, /RECUBRIMIENTOS/) ? "Tabla de recubrimientos por elemento." : `${rec} mención(es) sueltas de recubrimiento.`, hay(T, /RECUBRIMIENTOS/) ? "" : "tabla de recubrimientos por elemento"));
  // 6. Ganchos
  const g = [90, 135, 180].filter((a) => hay(T, new RegExp(`GANCHO\\s*${a}`)));
  r.push(p(6, g.length === 3 ? 1 : g.length ? 0.5 : 0, `Ganchos: ${g.map((a) => `${a}°`).join(", ") || "—"}.`, g.includes(135) ? "" : "gancho sísmico de 135°"));
  // 7. Anclajes y empalmes
  const traslape = hay(T, /TRASLAPE|EMPALME/), anclaje = hay(T, /ANCLAJE|LONGITUD DE DESARROLLO|\bLD\b/);
  r.push(p(7, traslape && anclaje ? 1 : traslape || anclaje ? 0.5 : 0, `Traslapes ${traslape ? "sí" : "no"}, anclajes ${anclaje ? "sí" : "no"}.`, traslape && anclaje ? "" : "tabla de anclajes y traslapes por diámetro"));
  // 8. Zonas sin empalmes
  const zonas = hay(T, /FUERA DE LOS NUDOS|NO (SE )?EMPALM|ZONA DE EMPALME|MITAD CENTRAL|EMPALMES? (SOLO )?EN/);
  r.push(p(8, zonas ? 1 : 0, zonas ? "Indica dónde no se empalma." : "Sin indicación.", zonas ? "" : "zona sin empalmes (2h en vigas, mitad central en columnas)"));
  // 9. Estribos de vigas
  const cuadroVigas = hay(T, /CUADRO DE VIGAS/), estr = hay(T, /1\s*@\s*0?[.,]0?5\s*,\s*\d+\s*@\s*0?[.,]1/);
  r.push(p(9, cuadroVigas && estr ? 1 : estr ? 0.5 : 0, `Cuadro de vigas ${cuadroVigas ? "sí" : "no"}; estribaje confinado ${estr ? "sí" : "no"}.`, cuadroVigas && estr ? "" : "estribos de vigas con 1@0.05, n@s0, resto"));
  // 10. Columnas
  const cuadroCol = hay(T, /CUADRO DE (COLUMNAS?|PLACAS)/), estrCol = cuenta(T, /□|ESTRIBO/) > 0 && estr;
  r.push(p(10, cuadroCol && estrCol ? 1 : cuadroCol ? 0.5 : 0, `Cuadro ${cuadroCol ? "sí" : "no"}; estribaje ${estrCol ? "sí" : "no"}.`, cuadroCol && estrCol ? "" : "cuadro de columnas con estribaje de confinamiento"));
  // 11. Niveles
  const niveles = ["NPT", "NFC", "NFZ"].filter((k) => hay(T, new RegExp(k.split("").join("\\.?\\s*"))));
  r.push(p(11, niveles.length >= 2 ? 1 : niveles.length ? 0.5 : 0, `Niveles: ${niveles.join(", ") || "—"}.`, niveles.length >= 2 ? "" : "niveles NPT / NFC / NFZ en cortes"));
  // 12. Aligerado
  const vig = hay(T, /VIGUETA/), temp = hay(T, /TEMPERATURA/), bast = hay(T, /BASTON|L\s*\/\s*[345]|ACERO NEGATIVO/);
  const ali = [vig, temp, bast].filter(Boolean).length;
  r.push(p(12, ali === 3 ? 1 : ali ? 0.5 : 0, `Viguetas ${vig ? "sí" : "no"}, temperatura ${temp ? "sí" : "no"}, bastones ${bast ? "sí" : "no"}.`, ali === 3 ? "" : [!vig && "viguetas", !temp && "acero de temperatura", !bast && "bastones con su longitud"].filter(Boolean).join(", ")));
  // 13. Cimentación
  const planta = hay(T, /PLANO DE CIMENTACION/), cortes = cuenta(T, /CORTE\s+\d/);
  r.push(p(13, planta && cortes >= 2 && df ? 1 : planta ? 0.5 : 0, `Planta ${planta ? "sí" : "no"}, ${cortes} corte(s), Df ${df ? "sí" : "no"}.`, planta && cortes >= 2 && df ? "" : "cortes de cimentación con Df"));
  // 14. Escalas y encimados
  const escalas = cuenta(T, /ESC(ALA)?\s*:?\s*1\s*\/\s*\d+|SIN ESCALA/);
  const v14 = escalas >= 3 && encimados === 0 ? 1 : escalas >= 3 || encimados === 0 ? 0.5 : 0;
  r.push(p(14, v14, `${escalas} escala(s) declarada(s); encimados: ${encimados ?? "sin medir"}.`, v14 === 1 ? "" : [escalas < 3 && "escala en cada vista", encimados ? `${encimados} texto(s) encimado(s)` : ""].filter(Boolean).join(", ")));
  // 15. Rótulo
  const campos = [["proyecto", Boolean(String(datos.proyecto ?? "").trim())], ["lámina", hay(T, /^E-\d{2}$/)], ["escala", hay(T, /ESCALA/)], ["fecha", hay(T, /20\d\d/)],
    ["ingeniero", Boolean(String(datos.especialista ?? "").trim())], ["CIP", Boolean(String(datos.cip ?? "").trim())]];
  const okR15 = campos.filter(([, v]) => v);
  r.push(p(15, okR15.length === campos.length ? 1 : okR15.length >= 4 ? 0.5 : 0, `Rótulo: ${okR15.map(([k]) => k).join(", ")}.`, campos.filter(([, v]) => !v).map(([k]) => k).join(", ")));

  const total = r.reduce((s, x) => s + x.valor, 0);
  return {puntos: r, puntaje: Math.round((100 * total) / r.length), cumplen: r.filter((x) => x.valor === 1).length, faltan: r.filter((x) => x.valor < 1)};
}

export function textoRevisorNorma(res) {
  return [`Revisión como ingeniero (15 puntos de la norma): ${res.puntaje} % · ${res.cumplen}/15 completos.`,
    ...res.faltan.map((x) => `${x.valor ? "◐" : "✗"} ${x.id}. ${x.titulo} (${x.norma}): falta ${x.falta || "completar"}.`)].join("\n");
}
