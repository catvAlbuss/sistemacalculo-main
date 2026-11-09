// Skills del Agente Predim. Cada skill hace mucho trabajo determinista con una
// sola llamada del modelo y devuelve un resumen corto: así un modelo local
// pequeño (contexto de ~8k tokens) puede dibujar o leer un plano completo.

import {planCasaPrimerNivel} from "./casaPrimerNivel.js";
import {L, line, circle, text, rect} from "../../cad/primitives.js";
import {ESTRUCTURA_SKILLS} from "./estructuraPlano.js";

const r2 = (value) => Math.round(value * 100) / 100;
const num = (value, fallback) => (Number.isFinite(Number(value)) ? Number(value) : fallback);
const lista = (value) => (Array.isArray(value) ? value.map(Number).filter((v) => Number.isFinite(v) && v > 0).slice(0, 15) : []);

function planEjes({x = [], y = []}) {
  const dx = lista(x), dy = lista(y);
  if (!dx.length || !dy.length) throw new Error("Indica al menos una separación en x y una en y (en metros).");
  const xs = [0], ys = [0];
  dx.forEach((d) => xs.push(xs.at(-1) + d));
  dy.forEach((d) => ys.push(ys.at(-1) + d));
  const ext = 1.2, rb = 0.3, W = xs.at(-1), H = ys.at(-1);
  const primitivas = [];
  xs.forEach((xv, i) => primitivas.push(line(L.EJES, [xv, -ext], [xv, H + ext]), circle(L.EJES, [xv, -ext - rb], rb), text(L.EJES, [xv, -ext - rb], String.fromCharCode(65 + i), 0.25)));
  ys.forEach((yv, i) => primitivas.push(line(L.EJES, [-ext, yv], [W + ext, yv]), circle(L.EJES, [-ext - rb, yv], rb), text(L.EJES, [-ext - rb, yv], String(i + 1), 0.25)));
  return {primitivas, resumen: `${xs.length} ejes verticales (A-${String.fromCharCode(64 + xs.length)}) y ${ys.length} horizontales (1-${ys.length}); ${r2(W)} x ${r2(H)} m.`};
}

function planAmbiente({nombre = "AMBIENTE", x = 0, y = 0, ancho, largo, muro = 0.15}) {
  const a = num(ancho, 0), b = num(largo, 0), e = Math.min(0.3, Math.max(0.1, num(muro, 0.15)));
  if (a < 1 || b < 1) throw new Error("ancho y largo deben ser de al menos 1 m.");
  const x0 = num(x, 0), y0 = num(y, 0);
  const nombreLimpio = String(nombre).slice(0, 30).toUpperCase();
  return {
    primitivas: [
      rect(L.MUROS, x0, y0, x0 + a, y0 + b),
      rect(L.MUROS, x0 + e, y0 + e, x0 + a - e, y0 + b - e),
      text(L.TEXTOS, [x0 + a / 2, y0 + b / 2], `${nombreLimpio}\\P${((a - 2 * e) * (b - 2 * e)).toFixed(2)} m²`, 0.2),
    ],
    resumen: `${nombreLimpio}: ${r2(a)} x ${r2(b)} m en (${r2(x0)}, ${r2(y0)}), muro ${e} m.`,
  };
}

export const SKILLS = [
  {
    name: "casa_primer_nivel",
    description: "Dibuja la planta completa del primer nivel de una casa: muros, puertas, ventanas, ambientes con áreas, ejes, columnas y cotas. Úsalo para cualquier pedido de casa o vivienda.",
    parameters: {type: "object", properties: {
      frente: {type: "number", description: "Ancho del terreno en metros (5-20)"},
      fondo: {type: "number", description: "Largo del terreno en metros (10-40)"},
      dormitorios: {type: "integer", description: "1 a 4"},
      banos: {type: "integer", description: "1 a 3"},
      cochera: {type: "boolean"},
    }},
    async run(args, ctx) {
      const plan = planCasaPrimerNivel(args);
      const dibujo = ctx.draw(plan.primitivas, "Agente: casa primer nivel");
      const p = plan.parametros;
      const banos = plan.ambientes.filter((a) => a.nombre.startsWith("BAÑO")).length;
      return {
        ok: true,
        mensaje: `Dibujé el primer nivel de una casa de ${p.frente} x ${p.fondo} m con ${p.dormitorios} dormitorio(s), ${banos} baño(s)${p.cochera ? " y cochera" : ""}: ${plan.ambientes.length} ambientes, ${plan.columnas} columnas, ejes y cotas.`,
        casa: `${p.frente} x ${p.fondo} m, ${p.dormitorios} dorm., ${plan.ambientes.filter((a) => a.nombre.startsWith("BAÑO")).length} baños, cochera: ${p.cochera ? "sí" : "no"}`,
        ambientes: plan.ambientes.map((a) => `${a.nombre} ${a.area}`).join("; "),
        columnas: plan.columnas,
        entidades: dibujo.entidades,
        avisos: plan.warnings,
      };
    },
  },
  {
    name: "dibujar_ejes",
    description: "Dibuja una grilla de ejes estructurales. x e y son listas de separaciones sucesivas en metros.",
    parameters: {type: "object", properties: {
      x: {type: "array", items: {type: "number"}, description: "Separaciones entre ejes verticales, ej. [4, 3.5]"},
      y: {type: "array", items: {type: "number"}, description: "Separaciones entre ejes horizontales"},
    }, required: ["x", "y"]},
    async run(args, ctx) {
      const plan = planEjes(args);
      const dibujo = ctx.draw(plan.primitivas, "Agente: ejes");
      return {ok: true, ejes: plan.resumen, entidades: dibujo.entidades};
    },
  },
  {
    name: "dibujar_ambiente",
    description: "Dibuja un ambiente rectangular con muros y su nombre y área. Coordenadas en metros.",
    parameters: {type: "object", properties: {
      nombre: {type: "string"}, x: {type: "number"}, y: {type: "number"},
      ancho: {type: "number"}, largo: {type: "number"}, muro: {type: "number", description: "Espesor, por defecto 0.15"},
    }, required: ["nombre", "ancho", "largo"]},
    async run(args, ctx) {
      const plan = planAmbiente(args);
      const dibujo = ctx.draw(plan.primitivas, "Agente: ambiente");
      return {ok: true, ambiente: plan.resumen, entidades: dibujo.entidades};
    },
  },
  {
    name: "resumen_plano",
    description: "Lee el plano abierto y devuelve un resumen: unidades, capas con cantidad de objetos, tipos de objetos y bloques más usados.",
    parameters: {type: "object", properties: {}},
    async run(args, ctx) {
      return {ok: true, ...ctx.summarize()};
    },
  },
  {
    name: "buscar_textos",
    description: "Busca textos del plano que contengan una palabra (ej. DORMITORIO, COCINA, eje A) y devuelve su posición y capa.",
    parameters: {type: "object", properties: {texto: {type: "string"}}, required: ["texto"]},
    async run(args, ctx) {
      const encontrados = ctx.findTexts(String(args.texto ?? ""), 15);
      return {ok: true, total: encontrados.total, textos: encontrados.items};
    },
  },
  // Por ahora el chat se enfoca en arquitectura → estructuras: zapatas_desde_plano
  // (que alimenta Cimentación 2.0) queda fuera de las herramientas del modelo.
  ...ESTRUCTURA_SKILLS.filter((skill) => skill.name !== "zapatas_desde_plano"),
];

export const toolDefinitions = (skills = SKILLS) => skills.map(({name, description, parameters}) => ({
  type: "function", function: {name, description, parameters},
}));
