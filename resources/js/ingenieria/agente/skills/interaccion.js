// Herramientas para que el agente converse como un colega y no como un chatbot: pregunta con
// opciones cuando la decisión es del ingeniero (el panel las muestra como botones) y explica lo
// que sabe del proyecto abierto. No dibujan nada; dejan registro en la memoria de la sesión.

import {estadoDeSesion} from "../estadoAgente.js";
import {analizarProyecto} from "../analisisIngenieria.js";
import {svgDeCaja, zonaAMirar} from "../vistaImagen.js";

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
  {
    name: "analizar_proyecto",
    description: "Revisión de ingeniería del proyecto abierto: datos que faltan (zona, suelo, categoría, niveles, Hz, Df), luces y espesor de losa, peralte de vigas, columnas chicas para su área tributaria, placas por dirección, torsión, planta alargada, confinamiento y pendientes de las láminas. Devuelve hallazgos con nivel (alto/medio/info), norma y la herramienta que lo resuelve. Úsalo antes de decidir y después de leer o dibujar, para recomendar como ingeniero.",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      const r = analizarProyecto(ctx ?? {});
      if (ctx?.memoria) ctx.memoria.ultimoAnalisis = {riesgos: r.riesgos, temas: r.hallazgos.filter((x) => x.nivel !== "info").map((x) => x.tema)};
      return r;
    },
  },
  {
    name: "mirar_plano",
    description: "Mira una zona del dibujo como imagen (necesita motor con visión): una lámina que generaste (para verificar encimados, faltantes o cosas fuera de lugar) o una vista de la arquitectura (para entender ambientes, escaleras, vacíos). La imagen te llega en el siguiente mensaje: descríbela con criterio de ingeniero y compárala con lo que debería tener.",
    parameters: {type: "object", properties: {
      que: {type: "string", description: "Título o número de la vista, o 'lámina' para la última lámina generada"},
    }},
    async run(args, ctx) {
      if (ctx?.permitirImagenes === false) return {ok: false, error: "El envío de imágenes del plano al motor de IA está desactivado en este proyecto."};
      if (typeof ctx?.rasterizar !== "function") return {ok: false, error: "Este motor o pantalla no puede convertir el dibujo en imagen."};
      const zona = zonaAMirar(ctx, args?.que);
      if (!zona) return {ok: false, error: "No hay una vista ni lámina que mirar en el plano abierto."};
      const {items} = ctx.readPlan();
      const {svg, objetos} = svgDeCaja(items, zona.caja);
      if (!objetos) return {ok: false, error: `La zona "${zona.titulo}" está vacía.`};
      const imagen = await ctx.rasterizar(svg);
      return {ok: true, mensaje: `Miré "${zona.titulo}" (${zona.origen}, ${objetos} objetos).`, imagen};
    },
  },
];
