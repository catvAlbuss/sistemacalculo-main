// engine/agenteCad.js — el agente de Análisis Estructural por su cuenta (sin NovaCad): entiende el
// pedido del ingeniero y lo convierte en una acción del CAD (sin tokens), y para lo que no es una
// acción arma los hechos del modelo y de la revisión que la IA del servidor debe usar al responder.
// Puro: sin DOM ni `this`; lo usa mixins/analysis/agenteCad.js.

const sinTildes = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Acciones que el agente ejecuta directo. El orden importa: lo más específico primero.
const RUTAS = [
  {accion: "ayuda", re: /^(ayuda|\?|que (puedes|sabes) hacer|comandos)\b/},
  {accion: "abrirModeloAgente", re: /\b(abre|abrir|carga|cargar|trae|traer)\b.*\bmodelo\b.*\b(agente|novacad|predim)\b/},
  {accion: "enviarDiseno", re: /\b(envia|manda|pasa|lleva)\w*\b.*\b(diseno|novacad|laminas?|agente)\b/},
  {accion: "ajustarArmado", re: /\b(ajusta|aumenta|sube|corrige|arregla)\w*\b.*\b(acero|armado|refuerzo|varillas?)\b|\bque (acero|armado) (necesita|requiere)\b/},
  {accion: "disenarColumnas", re: /\b(disena|disenar|verifica|verificar|chequea|revisa)\w*\b.*\bcolumnas?\b/},
  {accion: "analizarSismo", re: /\b(analiza|analizar|corre|correr|ejecuta|ejecutar|calcula|calcular)\w*\b.*\b(sism\w*|espectr\w*|modal|modelo|estructura|analisis)\b|^analiza(r)?$/},
  {accion: "revisar", re: /\b(revisa|revisar|revision|verifica|verificar|cumple|chequea)\w*\b|\be\.?030\b|\bnorma\b/},
  {accion: "dato", re: /\b(deriva|derivas|periodo|periodos|cortante|masa participativa|modos?|c\/r|irregular\w*|torsion)\b/},
];

export function rutaCad(texto) {
  const t = sinTildes(texto);
  if (!t) return null;
  for (const r of RUTAS) if (r.re.test(t)) return {accion: r.accion};
  return null;
}

export const AYUDA = [
  "Puedo trabajar sobre el modelo abierto (dibujado aquí, importado de ETABS o enviado por NovaCad):",
  "• «analiza el sismo»: análisis espectral con los casos definidos.",
  "• «revisa con la E.030»: masa, derivas, cortante mínimo, C/R e irregularidades.",
  "• «diseña las columnas»: flexocompresión E.060 de todas las columnas con su armado.",
  "• «ajusta el acero»: para las que no cumplen, el menor armado que cumple.",
  "• «envía el diseño a NovaCad»: el cuadro de columnas y las zapatas de las láminas usan este diseño.",
  "• Preguntas sobre los resultados («¿cuánto es la deriva en Y?», «¿por qué no cumple?»).",
].join("\n");

const fmt = (v) => (typeof v === "number" ? String(Math.round(v * 10000) / 10000) : String(v ?? "—"));

// Respuesta sin IA a una pregunta de dato: las verificaciones de la revisión que tratan de lo que
// se pregunta (deriva, periodo, cortante…). null si la revisión no lo tiene.
export function responderDato(texto, revision) {
  const t = sinTildes(texto);
  const temas = [
    [/deriva/, /deriva/i], [/periodo|modo/, /periodo|masa participativa/i], [/cortante/, /cortante/i],
    [/masa/, /masa/i], [/c\/r/, /C\/R/i], [/irregular|torsion/, /torsional|rigidez|masa o peso|irregular/i],
  ];
  const filtro = temas.find(([re]) => re.test(t))?.[1];
  const filas = (revision?.verificaciones ?? []).filter((v) => filtro && (filtro.test(v.titulo) || filtro.test(v.grupo)));
  const direccion = /\by\b/.test(t) ? "Y" : /\bx\b/.test(t) ? "X" : null;
  const elegidas = direccion ? filas.filter((v) => !/Sismo [XY]/.test(v.grupo) || v.grupo.endsWith(direccion)) : filas;
  if (!elegidas.length) return null;
  return elegidas.map((v) => `${v.grupo} · ${v.titulo}: ${fmt(v.valor)} → ${textoEstado(v.estado)}. ${v.detalle ?? ""}${v.accion ? ` ${v.accion}` : ""}`.trim()).join("\n");
}

export const textoEstado = (e) => ({cumple: "cumple", no_cumple: "NO cumple", observacion: "observación", sin_datos: "sin datos", info: "dato"}[e] ?? e);

// Resumen corto de la revisión para el chat: lo que no cumple primero, con su acción.
export function textoRevision(revision) {
  if (!revision) return "No hay revisión todavía.";
  const malas = revision.verificaciones.filter((v) => v.estado === "no_cumple");
  const obs = revision.verificaciones.filter((v) => v.estado === "observacion");
  const lineas = [revision.resumen?.texto ?? ""];
  for (const v of malas) lineas.push(`✗ ${v.grupo} · ${v.titulo}: ${fmt(v.valor)}${v.limite ? ` (límite ${v.limite})` : ""}.${v.accion ? ` → ${v.accion}` : ""}`);
  for (const v of obs.slice(0, 3)) lineas.push(`• ${v.grupo} · ${v.titulo}: ${v.detalle ?? fmt(v.valor)}`);
  if (!revision.hayResultados) lineas.push("Aún no hay resultados sísmicos: pide «analiza el sismo».");
  return lineas.filter(Boolean).join("\n");
}

// Resumen del diseño de columnas para el chat.
export function textoDisenoColumnas(columnas) {
  const lista = columnas ?? [];
  if (!lista.length) return "No hay columnas diseñadas.";
  const ratio = (c) => Math.max(Number(c?.check?.base?.ratio) || 0, Number(c?.check?.top?.ratio) || 0);
  const ok = lista.filter((c) => !c.unsupported && ratio(c) <= 1);
  const mal = lista.filter((c) => !c.unsupported && ratio(c) > 1).sort((a, b) => ratio(b) - ratio(a));
  const sin = lista.filter((c) => c.unsupported);
  const lineas = [`${lista.length} columna(s): ${ok.length} cumplen, ${mal.length} no cumplen${sin.length ? `, ${sin.length} sin diseño automático` : ""}. Ratio máximo ${Math.max(0, ...lista.filter((c) => !c.unsupported).map(ratio)).toFixed(2)}.`];
  for (const c of mal.slice(0, 6)) lineas.push(`✗ ${c.label}: D/C ${ratio(c).toFixed(2)}${c.propuesta ? (c.propuesta.sinSolucion ? " — ni con 4 % cumple: agrandar sección" : ` → con ${c.propuesta.n} varillas D/C ${c.propuesta.ratio.toFixed(2)}`) : ""}`);
  if (sin.length) lineas.push(`Sin diseño: ${sin.slice(0, 4).map((c) => `${c.label} (${c.unsupportedReason})`).join("; ")}`);
  if (mal.length && !mal.some((c) => c.propuesta)) lineas.push("Pide «ajusta el acero» y busco el menor armado que cumple.");
  return lineas.join("\n");
}

// Mensajes para la IA del servidor: solo los hechos del modelo y de la revisión; sin inventar.
export function mensajesParaIA({pregunta, modelo, revision, historial = []}) {
  const hechos = {
    modelo,
    revision: revision ? {
      resumen: revision.resumen?.texto, parametros: revision.parametros,
      verificaciones: revision.verificaciones.map((v) => ({grupo: v.grupo, verificacion: v.titulo, valor: v.valor, limite: v.limite, estado: v.estado, norma: v.norma, detalle: v.detalle, accion: v.accion})),
    } : null,
  };
  return [
    {role: "system", content: "Eres el agente de Análisis Estructural de un despacho peruano (E.020, E.030, E.050, E.060). Responde en español, corto y en lenguaje de ingeniero, usando SOLO los números de HECHOS. Si un dato no está en HECHOS, dilo y sugiere la acción del programa que lo calcula («analiza el sismo», «revisa con la E.030», «diseña las columnas»). No inventes valores ni artículos."},
    ...historial.slice(-6),
    {role: "user", content: `HECHOS:\n${JSON.stringify(hechos)}\n\nPREGUNTA: ${pregunta}`},
  ];
}
