// El agente justifica y aconseja: "¿por qué pusiste platea?" responde con la norma, el dato y la
// fuente de la decisión (criterios/justificacion.js); "quiero mis láminas sin columnas" se aconseja
// con la norma, se ofrece con opciones y se ejecuta la que elija el cliente (preferenciasCliente.js).

import {registroDeDecisiones, buscarDecisiones, textoDecision, resumenRegistro} from "../../criterios/justificacion.js";
import {parametrosSismicos} from "../../criterios/datosProyecto.js";
import {reconocerPedido, pedidoPorId, preferenciaDe, cargarPreferencias, guardarPreferencias, completarPreferencias, PEDIDOS} from "../preferenciasCliente.js";

// Preferencias del cliente en la memoria de la conversación (cargadas del navegador la primera vez).
export function preferenciasDe(ctx) {
  ctx.memoria ??= {};
  ctx.memoria.preferencias ??= completarPreferencias(cargarPreferencias());
  return ctx.memoria.preferencias;
}

// Registro de decisiones de lo que está dibujado.
export function registroDe(ctx) {
  const datos = ctx.datosProyecto?.() ?? {};
  let sismo = null;
  try { sismo = parametrosSismicos(datos); } catch { sismo = null; }
  return registroDeDecisiones({modelo: ctx.memoria?.modeloEstructural, propuesta: ctx.memoria?.propuesta?.propuesta ?? null,
    decisionesSesion: ctx.memoria?.decisionesSesion ?? [], preferencias: preferenciasDe(ctx), datos, sismo, resultados: ctx.memoria?.resultadosSismicos ?? null});
}

async function redibujar(ctx) {
  if (!ctx.memoria?.paqueteLaminas) return null;
  const {ESTRUCTURA_SKILLS} = await import("./estructuraPlano.js");
  return ESTRUCTURA_SKILLS.find((s) => s.name === "plano_estructuras").run({}, ctx);
}

export const JUSTIFICACION_SKILLS = [
  {
    name: "justificar",
    description: "Explica por qué el agente puso algo en las láminas o en el modelo: la norma y el artículo que lo respaldan (y si está confirmado), de dónde salió el dato (plano, cálculo, dato del proyecto, criterio del despacho, pedido del cliente o supuesto) y qué alternativas había. Úsalo para '¿por qué…?', 'justifica…', '¿en qué norma…?', '¿de dónde sale…?', 'fundamenta el diseño'.",
    parameters: {type: "object", properties: {
      tema: {type: "string", description: "Lo que se pregunta (p. ej. 'platea', 'viga 0.30x0.40', 'recubrimiento'). Vacío: todas las decisiones."},
    }},
    async run(args = {}, ctx) {
      if (!ctx.memoria?.modeloEstructural) {
        // Sin láminas todavía: lo que hay es la propuesta (cimentación, losa, concreto) y su porqué.
        if (/platea|zapata|cimentaci|losa|aligerad|concreto|maciza/i.test(args.tema ?? "")) {
          const {ESTRUCTURA_SKILLS} = await import("./estructuraPlano.js");
          return ESTRUCTURA_SKILLS.find((s) => s.name === "proponer_estructura").run({}, ctx);
        }
        return {ok: false, error: "Todavía no hay láminas que justificar: genéralas y te explico cada decisión con su norma.",
          opciones: [{texto: "Generar las láminas", herramienta: "plano_estructuras", args: {}, recomendada: true}]};
      }
      const registro = registroDe(ctx);
      const tema = String(args.tema ?? "").trim();
      const halladas = tema ? buscarDecisiones(registro, tema) : registro;
      if (tema && !halladas.length) {
        return {ok: true, mensaje: `No tengo una decisión registrada sobre "${tema}". Puedo justificar: ${[...new Set(registro.map((d) => d.elemento))].join(", ")}.`,
          opciones: [{texto: "Ver todas las decisiones", herramienta: "justificar", args: {}}]};
      }
      const r = resumenRegistro(registro);
      return {ok: true, decisiones: halladas.length, mensaje: [...halladas.map(textoDecision), tema ? "" : `\n${r.texto}`].filter(Boolean).join("\n"),
        resumen: tema ? `Justifiqué ${halladas.length} decisión(es) sobre ${tema}.` : r.texto,
        ...(r.supuestos.length && !tema ? {opciones: [{texto: "Completar los datos del proyecto", herramienta: "datos_proyecto", args: {}}]} : {})};
    },
  },
  {
    name: "preferencia_laminas",
    description: "Pedidos del cliente sobre lo que llevan las láminas: sin columnas, sin cotas, sin pórticos, sin tablas estándar o sin notas (y deshacerlos). Primero aconseja con la norma y ofrece opciones (la recomendada primero); con 'opcion' ejecuta la elegida, redibuja las láminas y la deja escrita en las notas y en el registro de decisiones. Úsalo para 'quiero mis láminas sin…', 'no dibujes…', 'quita las cotas', 'vuelve a poner…'.",
    parameters: {type: "object", properties: {
      texto: {type: "string", description: "El pedido tal como lo dijo el cliente"},
      pedido: {type: "string", enum: PEDIDOS.map((p) => p.id), description: "Pedido ya reconocido"},
      opcion: {type: "string", description: "Opción elegida por el cliente (id de la opción) o 'dejar' para no cambiar nada"},
      deshacer: {type: "boolean", description: "true para volver a dibujar lo que se había quitado"},
    }},
    async run(args = {}, ctx) {
      const lista = preferenciasDe(ctx);
      const rec = args.pedido ? {pedido: pedidoPorId(args.pedido), deshacer: Boolean(args.deshacer)} : reconocerPedido(args.texto ?? "");
      if (!rec?.pedido) {
        return {ok: false, error: `Ese pedido todavía no lo sé ejecutar. Puedo: ${PEDIDOS.map((p) => p.titulo.toLowerCase()).join(", ")}${lista.length ? `; y deshacer lo ya pedido (${lista.map((p) => p.titulo.toLowerCase()).join(", ")})` : ""}.`};
      }
      const p = rec.pedido;
      if (rec.deshacer || args.deshacer) {
        const quedan = lista.filter((x) => x.pedido !== p.id);
        if (quedan.length === lista.length) return {ok: true, mensaje: `No había un pedido "${p.titulo.toLowerCase()}" activo: las láminas ya las incluyen.`};
        ctx.memoria.preferencias = quedan;
        guardarPreferencias(quedan);
        const r = await redibujar(ctx);
        return {ok: true, mensaje: `Listo: ${p.titulo.toLowerCase()} ya no aplica${r ? "; redibujé las láminas completas" : "; las próximas láminas irán completas"}.`};
      }
      // 1) Aconsejar: la norma, las opciones y la recomendada.
      if (!args.opcion) {
        return {ok: true, consulta: true,
          mensaje: `${p.consejo} ${p.norma}\n¿Cómo lo hago?`,
          resumen: `Te aconsejo antes de ${p.titulo.toLowerCase()}.`,
          opciones: [
            ...p.opciones.map((o) => ({texto: `${o.texto}${o.recomendada ? " — recomendado" : ""}`, herramienta: "preferencia_laminas", args: {pedido: p.id, opcion: o.id}, recomendada: Boolean(o.recomendada)})),
            {texto: "Dejar las láminas como están", herramienta: "preferencia_laminas", args: {pedido: p.id, opcion: "dejar"}},
          ]};
      }
      if (args.opcion === "dejar") return {ok: true, mensaje: "Las dejo como están, completas según la norma."};
      // 2) Ejecutar la opción elegida y dejarla documentada.
      const pref = preferenciaDe(p, args.opcion);
      if (!pref) return {ok: false, error: `No conozco la opción "${args.opcion}" para ${p.titulo.toLowerCase()}.`};
      const nuevas = [...lista.filter((x) => x.pedido !== p.id), pref];
      ctx.memoria.preferencias = nuevas;
      guardarPreferencias(nuevas);
      const r = await redibujar(ctx);
      const aviso = pref.noAprobable ? " Ojo: así la lámina no se puede aprobar; queda anotado en las notas para que nadie construya con ella sin completarla." : "";
      return {ok: true, preferencia: pref.pedido,
        mensaje: `Hecho: ${pref.opcionTexto.toLowerCase()}.${r ? ` Redibujé las láminas${r.laminas?.length ? ` (${r.laminas.join(", ")})` : ""}.` : " Lo aplico cuando genere las láminas."} Quedó escrito en las notas ("a pedido del propietario") y en el registro de decisiones.${aviso} Recordaré este pedido en las próximas láminas; dime "vuelve a poner…" para deshacerlo.`,
        resumen: `Pedido aplicado: ${pref.opcionTexto.toLowerCase()}.`};
    },
  },
];
