// El agente aprende a dibujar con el cliente: después de generar las láminas, el ingeniero corrige la
// planta de cimentación en el CAD (borra muros que sobran, dibuja los que faltan) y pide «aprende de
// mis correcciones». El agente etiqueta cada muro candidato con esa corrección, la guarda en el
// servidor (por usuario, solo números) y reentrena su modelo; el modelo dibuja solo cuando, probado
// con los módulos que corrigió el cliente, le gana a la regla del despacho.
// Lógica: aprendizaje/aprendizajeCliente.js · Servidor: AgenteAprendizajeDibujoController.php.
import {etiquetasDeCorrecciones, entrenarModeloCliente, decidirMuroCliente, textoModeloCliente, DECISION_MUROS} from "../../aprendizaje/aprendizajeCliente.js";
import {piezaDe} from "../../cad/cadExecutor.js";
import {aplanarModelo} from "../../lectura/lectorPlano.js";

const RUTA = "/software/etabs/agente/aprendizaje/dibujo";
const token = () => (typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]')?.content ?? "" : "");
const navegador = () => typeof window !== "undefined" && typeof fetch === "function";
const cabeceras = () => ({"Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": token(), "X-Requested-With": "XMLHttpRequest"});

// Código corto del módulo (sin el nombre del archivo en el servidor).
export function codigoModulo(nombre) {
  let h = 5381;
  for (const c of String(nombre ?? "")) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return `m${h.toString(36)}`;
}

async function datosDelServidor() {
  const r = await fetch(`${RUTA}?decision=${DECISION_MUROS}`, {headers: {Accept: "application/json"}, credentials: "same-origin"});
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// Antes de dibujar: el modelo de este usuario (si hay correcciones). Sin navegador o sin servidor,
// la regla. Se cachea por sesión; aprender_correcciones lo renueva.
export async function cargarModeloCliente(ctx, {forzar = false} = {}) {
  if (!navegador()) return null;
  if (!forzar && ctx.memoria.modeloCliente !== undefined) return ctx.memoria.modeloCliente;
  try {
    const {base, cliente} = await datosDelServidor();
    ctx.memoria.modeloCliente = cliente.length ? entrenarModeloCliente({base, cliente}) : null;
  } catch {
    ctx.memoria.modeloCliente = null;
  }
  return ctx.memoria.modeloCliente;
}
export const decidirMuroDeContexto = (ctx) => decidirMuroCliente(ctx.memoria.modeloCliente);

// Muros del agente que siguen en la lámina (con su pieza) y trazos del ingeniero, en unidades del dibujo.
function leerLamina(ctx) {
  const agente = [];
  for (const e of ctx.entidadesDelAgente?.() ?? []) {
    const pieza = piezaDe(e);
    if (!pieza?.startsWith("muro-cim:") || !e.startPoint || !e.endPoint) continue;
    agente.push({pieza, a: {x: e.startPoint.x, y: e.startPoint.y}, b: {x: e.endPoint.x, y: e.endPoint.y}});
  }
  const usuario = [];
  const {items} = aplanarModelo(ctx.entidadesDelUsuario?.() ?? []);
  for (const it of items) {
    if (it.tipo !== "linea" && it.tipo !== "poli") continue;
    for (let i = 0; i + 1 < it.puntos.length; i++) usuario.push([it.puntos[i], it.puntos[i + 1]]);
    if (it.cerrada && it.puntos.length > 2) usuario.push([it.puntos.at(-1), it.puntos[0]]);
  }
  return {agente, usuario};
}

export const APRENDIZAJE_SKILLS = [
  {
    name: "aprender_correcciones",
    description: "Aprende de las correcciones que el ingeniero hizo a mano en la planta de cimentación de las láminas del agente (muros que borró o que dibujó) y las guarda para dibujar con su criterio. Úsalo para 'aprende de mis correcciones', 'ya corregí la cimentación', 'aprende cómo dibujo'.",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      const candidatos = ctx.memoria.candidatosMuro ?? [];
      if (!candidatos.length) return {ok: false, error: "No tengo una planta de cimentación del agente en esta sesión: genera las láminas, corrígelas y vuelve a pedirlo.", opciones: [{texto: "Generar las láminas", herramienta: "plano_estructuras", args: {}}]};
      const {agente, usuario} = leerLamina(ctx);
      if (!agente.length) return {ok: false, error: "No encuentro los muros que dibujé en la cimentación (¿borraste toda la planta o regeneraste sin muros?). Corrige sobre la lámina generada y vuelve a pedirlo."};
      const {muestras, resumen, transformacion} = etiquetasDeCorrecciones({candidatos, agente, usuario});
      if (!transformacion || transformacion.error > Math.abs(transformacion.s) * 0.05) {
        return {ok: false, error: "No pude ubicar la planta de cimentación en la lámina (¿moviste o escalaste la planta?). Corrige los muros sin mover la planta y vuelve a pedirlo."};
      }
      const modulo = codigoModulo(`${ctx.nombreDocumento?.() ?? ""}|${ctx.memoria.estructura?.titulo ?? ""}`);
      if (!navegador()) return {ok: true, mensaje: `Correcciones leídas: ${resumen.conservados} muros conservados, ${resumen.borrados} borrados y ${resumen.agregados} agregados (sin servidor no se guardaron).`, muestras};
      const r = await fetch(RUTA, {method: "POST", credentials: "same-origin", headers: cabeceras(), body: JSON.stringify({decision: DECISION_MUROS, modulo, muestras})});
      if (!r.ok) return {ok: false, error: `No pude guardar tus correcciones (HTTP ${r.status}).`};
      const modelo = await cargarModeloCliente(ctx, {forzar: true});
      return {
        ok: true,
        mensaje: [`Leí tu corrección de la cimentación: ${resumen.conservados} muros conservados, ${resumen.borrados} borrados y ${resumen.agregados} agregados por ti.`, textoModeloCliente(modelo)].join("\n"),
        resumen: modelo?.activo ? "Aprendí tu criterio de cimentación." : "Corrección guardada.",
      };
    },
  },
  {
    name: "estado_aprendizaje",
    description: "Dice qué aprendió el agente del criterio de dibujo de este usuario (cuántos módulos corregidos, si ya dibuja con su criterio y cuánto acierta). Úsalo para 'qué aprendiste de mí', 'cómo vas aprendiendo'.",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      const m = await cargarModeloCliente(ctx, {forzar: true});
      return {ok: true, mensaje: textoModeloCliente(m)};
    },
  },
  {
    name: "olvidar_aprendizaje",
    description: "Borra lo que el agente aprendió de las correcciones de este usuario (vuelve a dibujar con la regla del despacho). Solo si el usuario lo pide expresamente.",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      if (!navegador()) return {ok: false, error: "Sin servidor no hay nada que olvidar."};
      const r = await fetch(`${RUTA}?decision=${DECISION_MUROS}`, {method: "DELETE", credentials: "same-origin", headers: cabeceras()});
      if (!r.ok) return {ok: false, error: `No pude borrarlo (HTTP ${r.status}).`};
      ctx.memoria.modeloCliente = null;
      return {ok: true, mensaje: "Listo: olvidé tus correcciones de cimentación; vuelvo a la regla del despacho."};
    },
  },
];
