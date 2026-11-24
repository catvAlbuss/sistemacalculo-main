// Herramientas de EDICIÓN: el agente no solo genera láminas, también actúa sobre lo que ya está
// dibujado sin rehacerlo (ni volver a pedir los datos). Reubica rótulos que se enciman al hueco
// libre más cercano (planearSeparacion) y, lo que aún quede junto, lo achica (desencimarTextos).
// Solo toca las entidades que dibujó el agente (marcadas); nunca la arquitectura ni lo del usuario.

import {cajaTexto, seEncima, planearSeparacion, desencimarTextos} from "../../laminas/cajasTexto.js";

const esTexto = (e) => /^(M?TEXT)$/i.test(String(e.dxfTypeName));
const CAPAS_COTA = /COTA/i;

function paresEncimados(entidades) {
  const cajas = entidades.map((e) => cajaTexto(e)).filter(Boolean);
  let n = 0;
  for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) if (seEncima(cajas[i], cajas[j])) n++;
  return n;
}

// Núcleo común: reubica los rótulos encimados y achica lo que no se pudo mover. Devuelve lo hecho.
function ordenarTextos(ctx, label) {
  const textos = () => (ctx.entidadesDelAgente?.() ?? []).filter(esTexto);
  const propias = textos();
  if (!propias.length) return {hay: false};
  const antes = paresEncimados(propias);
  const {moves} = planearSeparacion(propias);
  const movidos = moves.length && ctx.moverEntidades
    ? ctx.moverEntidades(label, moves.map((m) => ({id: m.entidad.objectId, dx: m.dx, dy: m.dy})))
    : 0;
  // Lo que siga encimado después de mover (p. ej. dos rótulos fijos): se achica como último recurso.
  let achicados = 0;
  if (ctx.modificar && paresEncimados(textos())) {
    const t = textos();
    achicados = ctx.modificar(label, t.map((e) => e.objectId), (abiertas) => desencimarTextos(abiertas).achicados);
  }
  return {hay: true, antes, movidos, achicados, despues: paresEncimados(textos())};
}

export const EDICION_SKILLS = [
  {
    name: "ordenar_lamina",
    description: "Ordena las láminas que dibujó el agente SIN rehacerlas ni volver a pedir datos: reubica los rótulos encimados (nombres de viga, códigos, paños) al hueco libre más cercano y achica los que no pueda mover. Úsalo para 'ordena la lámina', 'acomoda los textos', 'está desordenado', 'arregla los encimados'.",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      const r = ordenarTextos(ctx, "Agente: ordenar la lámina");
      if (!r.hay) return {ok: true, mensaje: "No hay láminas del agente que ordenar. Pide \"genera el plano de estructuras\" primero."};
      if (!r.antes) return {ok: true, mensaje: "La lámina ya está ordenada: ningún texto se encima.", movidos: 0};
      return {ok: true,
        mensaje: `Ordené la lámina: reubiqué ${r.movidos} rótulo(s)${r.achicados ? ` y achiqué ${r.achicados}` : ""} de ${r.antes} par(es) encimado(s)${r.despues ? `; quedan ${r.despues} par(es) muy juntos` : ", sin encimados"}.`,
        movidos: r.movidos, achicados: r.achicados, encimados: r.despues};
    },
  },
  {
    name: "mejorar_cotas",
    description: "Mejora las cotas de las láminas del agente: despeja los rótulos de elementos que tapan las cadenas de cotas y las medidas (mueve los rótulos, no las cotas, que quedan ancladas a su línea). Úsalo para 'mejora las cotas', 'las cotas se ven encimadas', 'no se leen las medidas'.",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      const propias = (ctx.entidadesDelAgente?.() ?? []).filter(esTexto);
      if (!propias.length) return {ok: true, mensaje: "No hay láminas del agente con cotas. Pide \"genera el plano de estructuras\" primero."};
      const cotas = propias.filter((e) => CAPAS_COTA.test(String(e.layer)));
      if (!cotas.length) return {ok: true, mensaje: "Las láminas del agente no tienen cotas en una capa de cotas; revisa que sean las láminas de estructuras."};
      const cajasCota = cotas.map((e) => cajaTexto(e)).filter(Boolean);
      const tapadas = propias.filter((e) => !CAPAS_COTA.test(String(e.layer))).filter((e) => { const c = cajaTexto(e); return c && cajasCota.some((q) => seEncima(c, q)); }).length;
      const r = ordenarTextos(ctx, "Agente: mejorar las cotas");
      return {ok: true,
        mensaje: tapadas || r.movidos
          ? `Mejoré las cotas: despejé ${r.movidos} rótulo(s) que tapaban las medidas${r.achicados ? ` y achiqué ${r.achicados}` : ""}. Las cotas quedan ancladas a su línea.`
          : `Las ${cotas.length} cotas ya se leen bien: ningún rótulo las tapa. (Para cambiar sus valores hay que corregir la medida con corregir_estructura y rehacer la lámina.)`,
        cotas: cotas.length, despejados: r.movidos};
    },
  },
];
