// Herramientas para que el agente converse como un colega y no como un chatbot: pregunta con
// opciones cuando la decisión es del ingeniero (el panel las muestra como botones) y explica lo
// que sabe del proyecto abierto. No dibujan nada; dejan registro en la memoria de la sesión.

import {estadoDeSesion} from "../estadoAgente.js";

const limpio = (t, n) => String(t ?? "").replace(/\s+/g, " ").trim().slice(0, n);

export const INTERACCION_SKILLS = [
  {
    name: "preguntar_ingeniero",
    description: "Pregunta al ingeniero una decisión de experto con 2 a 4 opciones (se muestran como botones). Úsalo cuando falta un dato o criterio que no puedes deducir ni está en el estado (ej. tipo de cimentación sin estudio de suelos, si el techo lleva losa, qué vista usar). Recomienda una opción y di por qué en una frase.",
    parameters: {type: "object", properties: {
      pregunta: {type: "string", description: "La pregunta, corta y concreta"},
      opciones: {type: "array", items: {type: "string"}, description: "2 a 4 respuestas posibles, cortas"},
      recomendada: {type: "string", description: "La opción que recomiendas (una de las opciones)"},
      porque: {type: "string", description: "Por qué la recomiendas, en una frase"},
    }, required: ["pregunta", "opciones"]},
    async run(args, ctx) {
      const pregunta = limpio(args.pregunta, 200);
      const opciones = [...new Set((Array.isArray(args.opciones) ? args.opciones : []).map((o) => limpio(o, 60)).filter(Boolean))].slice(0, 4);
      if (!pregunta || opciones.length < 2) return {ok: false, error: "La pregunta necesita texto y al menos 2 opciones."};
      const recomendada = opciones.find((o) => o.toLowerCase() === limpio(args.recomendada, 60).toLowerCase()) ?? null;
      const porque = limpio(args.porque, 220);
      if (ctx?.memoria) ctx.memoria.preguntaAbierta = {pregunta, opciones, recomendada};
      return {
        ok: true,
        mensaje: [pregunta, recomendada ? `Recomiendo: ${recomendada}${porque ? ` — ${porque}` : ""}.` : porque].filter(Boolean).join("\n"),
        opciones: opciones.map((texto) => ({texto, recomendada: texto === recomendada})),
      };
    },
  },
  {
    name: "ver_metrado",
    description: "Lista las partidas del metrado que sacó el agente (ítem, descripción, unidad y total), en corto. Úsalo para comparar con una captura de la planilla Excel del ingeniero: compara partida por partida, señala solo las que difieren más de ±5 % y pregunta antes de cambiar nada. Si aún no hay metrado, primero metrar_estructura.",
    parameters: {type: "object", properties: {buscar: {type: "string", description: "Opcional: ítem o palabra para filtrar (ej. '02.03.06' o 'columnas')"}}},
    async run(args, ctx) {
      const met = ctx?.memoria?.metrado;
      if (!met?.partidas?.length) return {ok: false, error: "Aún no hay metrado en esta sesión: pide \"saca el metrado\" primero."};
      const q = String(args?.buscar ?? "").toLowerCase().trim();
      const filas = met.partidas.filter((p) => !p.titulo && (!q || p.item.includes(q) || String(p.descripcion).toLowerCase().includes(q)))
        .slice(0, 80).map((p) => `${p.item} | ${String(p.descripcion).slice(0, 60)} | ${p.und} | ${Number(p.total).toFixed(2)}`);
      return {ok: true, partidas: filas.join("\n"), total: filas.length, mensaje: filas.length ? `Partidas calculadas (${filas.length}):\n${filas.join('\n')}` : 'No encontré partidas calculadas con ese filtro.'};
    },
  },
  {
    name: "estado_proyecto",
    description: "Resume lo que el agente sabe del proyecto abierto: lo leído, lo propuesto, lo decidido por el ingeniero, lo pendiente y el siguiente paso. Úsalo si preguntan '¿en qué vamos?', '¿qué falta?', '¿qué decidiste?'.",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      const texto = estadoDeSesion(ctx ?? {}).split("\n").slice(1).map((l) => l.replace(/^- /, "• ")).join("\n");
      return {ok: true, mensaje: texto};
    },
  },
];
