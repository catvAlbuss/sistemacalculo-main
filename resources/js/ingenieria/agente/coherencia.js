// Lo que dice el agente lo dice el plano: cada dato del mensaje de plano_estructuras se busca en
// los textos que quedaron dibujados en las láminas. Lo que no aparece no se afirma en el chat: se
// informa como diferencia (y es un error a corregir en el generador, no en el mensaje).

// Texto plano de un MTEXT: sin saltos (\P), formatos ({\f…;}, \L, \l) ni llaves.
export function textoLimpio(t) {
  return String(t ?? "")
    .replace(/\\P/g, " ")
    .replace(/\\[A-Za-z][^;\\{}]*;/g, "")
    .replace(/\\[LlOoKk]/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// 0.60 → "0.60" o ".60"; 2 decimales como los dibuja el despacho.
const numero = (v) => { const t = Number(v).toFixed(2); return `(?:${esc(t)}|${esc(t.replace(/^0/, ""))})`; };

// Afirmaciones verificables del resumen de laminasConPlantilla: {dato, prueba(textos)}.
export function afirmaciones(s) {
  if (!s) return [];
  const lista = [];
  const hay = (dato, re) => lista.push({dato, prueba: (ts) => ts.some((t) => re.test(t))});
  const platea = s.cimentacion === "platea";
  hay(`cimentación con ${s.cimentacion}`, platea ? /PLATEA/i : /ZAPATA/i);
  if (Number.isFinite(s.hz)) hay(`Hz = ${s.hz.toFixed(2)} m`, new RegExp(`\\bHz\\s*=\\s*${numero(s.hz)}`, "i"));
  if (Number.isFinite(s.df)) hay(`Df = ${s.df.toFixed(2)} m`, new RegExp(`(\\bDf\\s*=\\s*-?\\s*${numero(s.df)}|N\\.?F\\.?Z\\.?\\s*=\\s*-\\s*${numero(s.df)})`, "i"));
  if (s.cimientoCorrido > 0) hay("cimiento corrido", /CIMIENTO\s+CORRIDO/i);
  // Cada losa dibujada con su espesor; las viguetas, la suma de los rótulos de paño de todas.
  const losas = s.losas ?? (s.aligerado ? [s.aligerado] : []);
  for (const l of losas) {
    if (!(l.espesor > 0)) continue;
    const cm = Math.round(l.espesor * 100);
    hay(`${l.titulo ? l.titulo.replace(/^PLANO DE /, "").toLowerCase() : "aligerado"} e=${l.espesor.toFixed(2)} m`, new RegExp(`(\\b[eEhH]\\s*=\\s*${numero(l.espesor)}|\\bE\\s*=\\s*${cm}\\s*CM)`, "i"));
  }
  const total = losas.reduce((acc, l) => acc + (l.viguetas ?? 0), 0);
  if (total > 0) lista.push({dato: `${total} viguetas`, prueba: (ts) => {
    const n = ts.reduce((acc, t) => acc + [...t.matchAll(/\((\d+)\s+VIG(?:UETAS?|\.)\)/gi)].reduce((a, m) => a + Number(m[1]), 0), 0);
    return n === 0 || n === total; // sin rótulos de paño no hay con qué contar
  }});
  // Sin losa: el plano no debe traer planta de aligerado.
  if (!losas.length) lista.push({dato: "techo sin losa (cobertura liviana)", prueba: (ts) => !ts.some((t) => /PLANO DE LOSA ALIGERADA/i.test(t))});
  for (const eje of s.porticos ?? []) hay(`pórtico del eje ${eje}`, new RegExp(`P[OÓ]RTICOS?\\s+(?:DEL\\s+)?EJE\\s+${esc(eje)}(?:\\s|-|$)`, "i"));
  if (s.techo) {
    hay(`techo a dos aguas PTE ${Math.round(s.techo.pendiente * 100)}%`, new RegExp(`PTE\\s*=?\\s*${Math.round(s.techo.pendiente * 100)}\\s*%`, "i"));
    hay(`cumbrera +${s.techo.cumbrera.toFixed(2)}`, new RegExp(`\\+\\s*${numero(s.techo.cumbrera)}`));
  }
  if (Number.isFinite(s.altura)) hay(`${s.techo ? "alero" : "techo"} +${s.altura.toFixed(2)}`, new RegExp(`\\+\\s*${numero(s.altura)}`));
  for (const c of s.columnas ?? []) {
    hay(`columna ${c.tipo}`, new RegExp(`^${esc(c.tipo)}$`));
    if (c.refuerzo) hay(`${c.tipo} ${c.refuerzo}`, new RegExp(esc(String(c.refuerzo).replace(/\s+/g, "")).replace(/Ø/g, "\\s*Ø\\s*")));
  }
  for (const [k, v] of Object.entries(s.sismo ?? {})) {
    if (!["Z", "U", "S", "Tp"].includes(k) || v === undefined || v === null) continue;
    const t = typeof v === "number" ? String(v) : String(v);
    hay(`${k}=${t}`, new RegExp(`\\b${k}\\s*=\\s*${esc(t)}(?:0)?\\b`));
  }
  for (const z of s.niveles > 1 ? s.entrepisos ?? [] : []) hay(`entrepiso NPT +${z.toFixed(2)}`, new RegExp(`\\+\\s*${numero(z)}`));
  return lista;
}

// Decisiones del ingeniero en el chat que se ven en el plano (losa maciza en baños), con los paños
// macizos que el generador dice haber dibujado (por motivo) y los rótulos que quedaron en el plano.
export function afirmacionesDeDecisiones(decisiones = {}, resumen = {}) {
  const lista = [];
  const macizas = {};
  for (const l of resumen?.losas ?? []) for (const [m, n] of Object.entries(l.macizas ?? {})) macizas[m] = (macizas[m] ?? 0) + n;
  const total = Object.values(macizas).reduce((a, n) => a + n, 0);
  const rotulos = (ts) => ts.reduce((a, t) => a + (/(LOSA\s+)?MACIZA\s+E\s*=\s*\d/i.test(t) ? 1 : 0), 0);
  if ((resumen?.losas ?? []).length) lista.push({dato: `${total} paño(s) de losa maciza rotulados`, prueba: (ts) => rotulos(ts) === total});
  if (decisiones.losaMaciza === false) lista.push({dato: "sin losa maciza en baños (lo que decidiste)", prueba: () => !macizas["baños"]});
  if (decisiones.losaMaciza === true) lista.push({dato: "losa maciza en baños (lo que decidiste)", prueba: () => macizas["baños"] > 0});
  return lista;
}

// textos: contenidos de los textos dibujados por el agente. Devuelve {verificados, faltan}.
export function verificarCoherencia(resumen, textos, decisiones = {}) {
  const ts = (textos ?? []).map(textoLimpio).filter(Boolean);
  const verificados = [], faltan = [];
  for (const a of [...afirmaciones(resumen), ...afirmacionesDeDecisiones(decisiones, resumen)]) (a.prueba(ts) ? verificados : faltan).push(a.dato);
  return {verificados, faltan};
}
