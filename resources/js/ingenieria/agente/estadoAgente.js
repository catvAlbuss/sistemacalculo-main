// Lo que el modelo de IA necesita saber en cada turno para no perderse, en pocos tokens:
//  - estadoDeSesion(ctx): qué hay abierto, qué se leyó, qué se propuso, qué decidió el ingeniero,
//    qué queda pendiente de su decisión y cuál es el siguiente paso sugerido;
//  - resumenDelAprendizaje(casos): lo aprendido de los proyectos estudiados (reglas validadas y
//    sus excepciones), sin nombres de clientes.
// Lo arman las herramientas (deterministas); el modelo solo lo lee. Nunca lleva el plano entero.

import {reglasValidas, DECISIONES, MIN_CASOS_COSTUMBRE} from "../aprendizaje/casos.js";

const r2 = (v) => Math.round(v * 100) / 100;
const corto = (t, n = 140) => (String(t ?? "").length > n ? `${String(t).slice(0, n - 1)}…` : String(t ?? ""));

// Etiqueta legible de una decisión de la propuesta ("cimentacion: platea (80 %)").
function textoDecision(clave, d) {
  if (!d || d.valor === null || d.valor === undefined) return null;
  const v = typeof d.valor === "boolean" ? (d.valor ? "sí" : "no") : typeof d.valor === "number" ? r2(d.valor) : d.valor;
  const conf = Number.isFinite(d.confianza) ? ` ${Math.round(d.confianza * 100)} %` : "";
  return `${DECISIONES[clave]?.nombre ?? d.nombre ?? clave}: ${v}${conf}${d.ingeniero ? " (lo confirma el ingeniero)" : ""}`;
}

// Siguiente paso lógico del flujo arquitectura → estructura → metrado → revisión.
export function siguientePaso(m = {}) {
  if (m.construccion?.pendiente) return "responder la pregunta de la construcción guiada (construir_estructura accion=responder)";
  if (m.consultas && !m.consultas.respondidas && m.consultas.consultas?.length) return "esperar la decisión del ingeniero sobre lo pendiente (o responder_consulta si ya la dio en el chat)";
  if (!m.estructura && !m.modeloEstructural) return "leer la arquitectura (plano_estructuras para dibujar, proponer_estructura para solo analizar)";
  if (!m.modeloEstructural) return "dibujar las láminas (plano_estructuras)";
  if (!m.metrado) return "sacar el metrado (metrar_estructura) o revisar encimados (revisar_laminas)";
  return "revisar las láminas o corregir lo que el ingeniero indique (corregir_estructura)";
}

// Estado compacto de la sesión (~150–350 tokens). ctx: contexto del panel; puede venir vacío.
export function estadoDeSesion(ctx = {}) {
  const m = ctx.memoria ?? {};
  const l = [];
  const plano = typeof ctx.resumenPlano === "function" ? ctx.resumenPlano() : null;
  l.push(`Plano abierto: ${plano ?? (ctx.hayPlano === false ? "ninguno (pide al ingeniero que abra la arquitectura)" : "sí")}.`);
  const ref = typeof ctx.referenciaActual === 'function' ? ctx.referenciaActual() : null;
  if (ref) {
    l.push(`Identidad actual: ${ref.modulo ? `módulo ${ref.modulo}` : 'sin módulo identificado'}. ${ref.motivo}`);
    if (ref.referencia?.laminas) l.push(`Referencia histórica identificada: serie ${ref.referencia.serie}, ${ref.referencia.id}, ${ref.referencia.laminas.length} láminas inventariadas. Esa cantidad no es el paquete generado ni impone sus formatos o cantidades al plano actual.`);
    if (!ref.referencia && ref.candidatos?.length) l.push(`Referencias posibles (confirma cuál): ${ref.candidatos.map((p) => `serie ${p.serie}, ${p.laminas?.length ?? '?'} láminas históricas`).join('; ')}.`);
    l.push('Formato físico y cargas de la referencia: no registrados. No los presentes como datos del proyecto actual.');
  }
  if (m.paqueteLaminas) {
    const f = m.paqueteLaminas.formato;
    l.push(`Paquete realmente generado: ${m.paqueteLaminas.cantidad} láminas (${m.paqueteLaminas.codigos.join(', ')}), ${m.paqueteLaminas.origen}.${f ? ` Marco ${r2(f.ancho)}x${r2(f.alto)} ${f.unidades}; ${f.origen}.` : ''}`);
    if (m.paqueteLaminas.pendientes?.length) l.push(`Pendientes de este paquete: ${m.paqueteLaminas.pendientes.slice(0, 3).join('; ')}.`);
  }
  if (m.estructura) {
    const e = m.estructura;
    const n = (v) => (Array.isArray(v) ? v.length : v && typeof v === "object" ? Object.values(v).reduce((a, x) => a + (Array.isArray(x) ? x.length : 0), 0) : 0);
    const ejes = n(e.ejesNombrados) || n(e.ejes);
    l.push(`Leído: vista "${corto(e.titulo || e.vista || "principal", 40)}", ${ejes || "?"} ejes, ${e.columnas?.length ?? "?"} columnas${e.columnetas?.length ? `, ${e.columnetas.length} columnetas` : ""}.`);
  }
  const p = m.propuesta?.propuesta;
  if (p) {
    const ds = Object.entries(p.decisiones ?? p).map(([k, d]) => textoDecision(k, d)).filter(Boolean).slice(0, 7);
    if (ds.length) l.push(`Propuesta del agente: ${ds.join("; ")}.`);
  }
  const c = m.consultas;
  if (c?.consultas?.length) {
    if (c.respondidas) l.push(`Decidido por el ingeniero: ${c.consultas.map((q) => `${q.clave}=${c.elegido?.[q.clave]}`).join(", ")}.`);
    else l.push(`Pendiente del ingeniero: ${c.consultas.map((q) => `[${q.clave}] ${corto(q.pregunta, 90)} (opciones: ${q.opciones.map((o) => o.valor).join(" | ")}; recomendado ${q.recomendado ?? "—"})`).join(" · ")}.`);
  }
  const k = m.construccion;
  if (k?.pendiente) l.push(`Construcción guiada en curso, pregunta pendiente [${k.pendiente.clave}]: "${corto(k.pendiente.pregunta, 110)}" (opciones: ${k.pendiente.opciones.map((o) => o.valor).join(" | ")}). Si el ingeniero responde, usa construir_estructura accion=responder.`);
  if (m.preguntaAbierta) l.push(`Le preguntaste: "${corto(m.preguntaAbierta.pregunta, 120)}" (opciones: ${m.preguntaAbierta.opciones.join(" | ")}). Si su mensaje la responde, actúa con esa respuesta.`);
  if (m.modeloEstructural) {
    const pl = m.ubicacionesPlanos?.map((u) => u.titulo).filter(Boolean) ?? [];
    l.push(`Láminas dibujadas${pl.length ? `: ${corto(pl.join(", "), 220)}` : ""}.`);
  }
  if (m.metrado) l.push(`Metrado hecho: ${m.metrado.partidas?.filter((x) => !x.titulo).length ?? "?"} partidas.`);
  if (m.decisionesSesion?.length) l.push(`Decisiones registradas en esta sesión: ${m.decisionesSesion.slice(-4).map((d) => `${d.clave}=${d.valor}${d.porque ? ` (${corto(d.porque, 50)})` : ""}`).join("; ")}.`);
  l.push(`Siguiente paso sugerido: ${siguientePaso(m)}.`);
  return ["## Estado actual (úsalo; no lo repitas al ingeniero)", ...l.map((x) => `- ${x}`)].join("\n");
}

// Resumen de lo aprendido para la memoria del modelo grande (sin nombres de cliente).
export function resumenDelAprendizaje(casos = []) {
  const estudiados = casos.filter((c) => c.fuente !== "uso");
  if (!estudiados.length) return "";
  const proyectos = new Set(estudiados.map((c) => String(c.grupo ?? "").toLowerCase() || "base"));
  const reglas = reglasValidas(estudiados);
  const lineas = reglas.filter((r) => r.casos).map((r) => {
    const estado = r.valida ? "costumbre validada" : r.fallan.length ? `${r.fallan.length} excepción(es): confirmar con el ingeniero` : `pocos casos (<${MIN_CASOS_COSTUMBRE} proyectos): confirmar`;
    return `- ${r.texto} — ${r.casos} casos, ${r.proyectos} proyecto(s), ${estado}.`;
  });
  return [
    "### Lo que aprendí de los proyectos estudiados",
    `${estudiados.length} módulos de ${proyectos.size} proyecto(s). Las decisiones las calcula proponer_estructura (reglas + patrones + casos parecidos); tú explicas y preguntas, no adivinas.`,
    ...lineas,
  ].join("\n");
}
