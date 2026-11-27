// El agente aprende el estilo de dibujo del cliente con SUS planos de estructuras terminados: el
// ingeniero abre uno en NovaCad y pide «aprende mi estilo de este plano». Se mide qué dibuja en cada
// planta y en qué capa (aprendizaje/estiloDespacho.js) y se guarda en el servidor por usuario: solo
// fracciones y nombres de capa, ni coordenadas ni textos del proyecto. Con 2 o más planos que
// coinciden, las láminas siguen ese estilo. Servidor: AgenteEstiloDespachoController.php.
import {medirEstiloDePlano, reglasDeEstilo, textoEstilo} from "../../aprendizaje/estiloDespacho.js";
import {codigoModulo} from "./aprendizajeDibujo.js";

const RUTA = "/software/etabs/agente/aprendizaje/estilo";
const token = () => (typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]')?.content ?? "" : "");
const navegador = () => typeof window !== "undefined" && typeof fetch === "function";
const cabeceras = () => ({"Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": token(), "X-Requested-With": "XMLHttpRequest"});

// Antes de dibujar: las reglas del estilo de este usuario. Sin navegador, lo que ya tenga la memoria
// (la evaluación lo pone ahí); sin servidor, ninguna. Se cachea por sesión.
export async function cargarEstiloDespacho(ctx, {forzar = false} = {}) {
  if (!navegador()) return ctx.memoria.estiloDespacho ?? null;
  if (!forzar && ctx.memoria.estiloDespacho !== undefined) return ctx.memoria.estiloDespacho;
  try {
    const r = await fetch(RUTA, {headers: {Accept: "application/json"}, credentials: "same-origin"});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const {planos} = await r.json();
    ctx.memoria.estiloDespacho = planos?.length ? reglasDeEstilo(planos) : null;
  } catch {
    ctx.memoria.estiloDespacho = null;
  }
  return ctx.memoria.estiloDespacho;
}

const nombresPlanta = {cimentacion: "cimentación", cimiento: "cimiento corrido", losa: "losa", tabiqueria: "tabiquería"};

export const ESTILO_SKILLS = [
  {
    name: "aprender_estilo",
    description: "Aprende el estilo de dibujo del cliente con un plano de ESTRUCTURAS terminado suyo que está abierto (qué dibuja en la cimentación, el cimiento corrido, la losa y la tabiquería, y en qué capas). Úsalo para 'aprende mi estilo de este plano', 'así dibujo yo mis láminas', 'aprende de este plano de estructuras'. No es para corregir láminas del agente (eso es aprender_correcciones).",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      const {items} = ctx.readPlan();
      const medido = medirEstiloDePlano(items ?? []);
      const plantas = Object.keys(medido.tipos);
      if (!plantas.length) return {ok: false, error: "En este plano no encuentro plantas de estructuras con título (CIMENTACIÓN, CIMIENTO CORRIDO, ALIGERADO o TABIQUERÍA) y sus ejes. Abre un plano de estructuras terminado tuyo y vuelve a pedirlo."};
      const leido = `Leí tu plano: ${plantas.map((t) => nombresPlanta[t]).join(", ")}.`;
      if (!navegador()) {
        const planos = [...(ctx.memoria.estilosLeidos ?? []), medido];
        ctx.memoria.estilosLeidos = planos;
        ctx.memoria.estiloDespacho = reglasDeEstilo(planos);
        return {ok: true, mensaje: [leido, textoEstilo(ctx.memoria.estiloDespacho)].join("\n"), medido};
      }
      const modulo = codigoModulo(ctx.nombreDocumento?.() ?? plantas.join("-"));
      const r = await fetch(RUTA, {method: "POST", credentials: "same-origin", headers: cabeceras(), body: JSON.stringify({modulo, tipos: medido.tipos})});
      if (!r.ok) return {ok: false, error: `No pude guardar tu estilo (HTTP ${r.status}).`};
      const reglas = await cargarEstiloDespacho(ctx, {forzar: true});
      return {ok: true, mensaje: [leido, textoEstilo(reglas), "Las próximas láminas salen con tu estilo; puedes pedirme cambios igual que siempre (quita, agrega, reduce)."].join("\n"), resumen: "Estilo del despacho aprendido."};
    },
  },
  {
    name: "estado_estilo",
    description: "Dice qué aprendió el agente del estilo de dibujo de este usuario con sus planos terminados (qué quita, qué agrega y qué capas usa). Úsalo para 'qué estilo aprendiste', 'cómo dibujas mis láminas'.",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      return {ok: true, mensaje: textoEstilo(await cargarEstiloDespacho(ctx, {forzar: true}))};
    },
  },
  {
    name: "olvidar_estilo",
    description: "Borra el estilo de dibujo aprendido de los planos de este usuario (vuelve al estilo del despacho). Solo si el usuario lo pide expresamente.",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      if (!navegador()) { ctx.memoria.estiloDespacho = null; ctx.memoria.estilosLeidos = []; return {ok: true, mensaje: "Listo: olvidé tu estilo."}; }
      const r = await fetch(RUTA, {method: "DELETE", credentials: "same-origin", headers: cabeceras()});
      if (!r.ok) return {ok: false, error: `No pude borrarlo (HTTP ${r.status}).`};
      ctx.memoria.estiloDespacho = null;
      return {ok: true, mensaje: "Listo: olvidé tu estilo de dibujo; vuelvo al estilo del despacho."};
    },
  },
];
