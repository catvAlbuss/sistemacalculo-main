// Puente agente → Análisis Estructural: de la arquitectura leída (y las láminas ya generadas) al
// modelo de análisis (.e2k de ETABS) que abre el módulo de análisis — y ETABS, para contrastar.
import {modeloE2k} from "../../analisis/modeloE2k.js";

export const MODELO_DEL_AGENTE = "novacad:modelo-analisis";
// Lo escribe Análisis Estructural («Enviar diseño al agente», cad/engine/disenoAgente.js).
export const DISENO_DEL_AGENTE = "novacad:diseno-analisis";

// Una línea por tipo: lo que el cuadro va a dibujar y con qué respaldo.
export function textoDiseno(columnas) {
  return Object.values(columnas || {}).sort((a, b) => a.tipo.localeCompare(b.tipo, "es", {numeric: true})).map((t) => {
    if (!t.n) return `${t.tipo}: sin diseño (${t.sinDiseno} columna(s) sin armado o con forma no soportada).`;
    if (t.sinSolucion?.length) return `${t.tipo}: NO cumple ni con 4 % de cuantía (D/C ${t.ratio}) en ${t.sinSolucion.join(", ")}: hay que agrandar la sección.`;
    if (t.aumentado) return `${t.tipo}: subo a ${t.n}Ø${t.barra} (D/C ${t.ratioOriginal} con el mínimo → ${t.ratio}).`;
    return `${t.tipo}: el refuerzo del cuadro cumple (D/C máx. ${t.ratio}).`;
  });
}
const RUTA_ANALISIS = "/software/etabs?desde=agente";

const nombreArchivo = (ctx) => {
  const base = String(ctx.nombreDocumento?.() || ctx.memoria?.modeloEstructural?.proyecto || "modelo")
    .replace(/\.(dwg|dxf)$/i, "").replace(/\s*\(recuperado\)$/i, "").replace(/\s*-?\s*ARQUITECTURA\s*$/i, "");
  return `${base.replace(/[^\w\-]+/g, "_").replace(/^_+|_+$/g, "") || "modelo"}_analisis.e2k`;
};

export const ANALISIS_SKILLS = [
  {
    name: "modelo_analisis",
    description: "Arma el modelo de análisis estructural (.e2k de ETABS) desde la arquitectura leída: columnas, vigas y losas en sus ejes, pisos con sus alturas, cargas E.020, masa y espectro E.030, y combinaciones E.060. Lo descarga para ETABS y lo deja listo para abrir en Análisis Estructural. Úsalo para 'enviar a análisis', 'modelo para ETABS', 'exporta el .e2k', 'quiero analizar la estructura'.",
    parameters: {type: "object", properties: {
      R0: {type: "number", description: "Coeficiente básico de reducción sísmica (E.030 Tabla 7): 8 pórticos, 7 dual, 6 muros, 3 albañilería. Solo si el ingeniero lo indica."},
    }},
    async run(args = {}, ctx) {
      const modelo = ctx.memoria?.modeloEstructural, estructura = ctx.memoria?.estructura;
      if (!modelo || !estructura) {
        return {ok: false, error: "Primero necesito leer la arquitectura y armar la estructura (las láminas).",
          opciones: [{texto: "Generar las láminas", herramienta: "plano_estructuras", args: {}, recomendada: true}]};
      }
      const R0 = [3, 6, 7, 8].includes(Number(args.R0)) ? Number(args.R0) : 8;
      const nombre = nombreArchivo(ctx);
      const g = modeloE2k({estructura, modelo, datos: ctx.datosProyecto?.() ?? {}, nombre: nombre.replace(/\.e2k$/, ""), R0});
      ctx.memoria.modeloAnalisis = {nombre, resumen: g.resumen, supuestos: g.supuestos, avisos: g.avisos};
      // Queda para que Análisis Estructural lo abra (mismo sitio) y se descarga para ETABS.
      let listo = false;
      try { globalThis.localStorage?.setItem(MODELO_DEL_AGENTE, JSON.stringify({nombre, texto: g.texto, fecha: new Date().toISOString()})); listo = true; } catch { /* sin almacenamiento: queda la descarga */ }
      try { ctx.descargarTexto?.(nombre, g.texto); } catch { /* sin panel */ }
      const r = g.resumen;
      const sismo = r.sismo ? `espectro E.030 (Z=${r.sismo.Z}, U=${r.sismo.U}, S=${r.sismo.S}, Tp=${r.sismo.Tp}, TL=${r.sismo.TL}, R=${r.sismo.R}) en X e Y` : "sin espectro (faltan zona o suelo)";
      return {
        ok: true,
        mensaje: [
          `Armé el modelo de análisis ${nombre}: ${r.pisos} piso(s), ${r.columnas} columnas, ${r.vigas} vigas y ${r.losas} paños de losa; secciones ${r.secciones.join(", ")}; cargas CM/CV de la E.020, masa E.030 y ${sismo}; ${r.combinaciones.length} combinaciones E.060.`,
          "Lo descargué para ETABS y está listo para abrir en Análisis Estructural.",
          g.supuestos.length ? `Supuestos que debes confirmar: ${g.supuestos.join(" ")}` : "",
          g.avisos.length ? `Atención: ${g.avisos.join(" ")}` : "",
        ].filter(Boolean).join("\n"),
        resumen: `Modelo de análisis listo (${r.pisos} piso(s), ${r.columnas} columnas, ${r.vigas} vigas, ${r.losas} losas).`,
        supuestos: g.supuestos, avisos: g.avisos,
        opciones: listo ? [{texto: "Abrir en Análisis Estructural", herramienta: "abrir_analisis", args: {}, recomendada: true}] : [],
      };
    },
  },
  {
    name: "aplicar_diseno",
    description: "Trae el diseño verificado en Análisis Estructural (columnas diseñadas con las fuerzas del análisis sísmico) y rehace las láminas con ese armado: el cuadro de columnas, el metrado y el modelo usan el acero que cumple. Úsalo para 'aplica el diseño', 'trae el diseño del análisis', 'actualiza las láminas con el diseño'.",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      let paquete = null;
      try { paquete = JSON.parse(globalThis.localStorage?.getItem(DISENO_DEL_AGENTE) || "null"); } catch { /* sin almacenamiento */ }
      if (!paquete?.columnas || !Object.keys(paquete.columnas).length) {
        return {ok: false, error: "No hay un diseño enviado desde Análisis Estructural. Allí corre el análisis sísmico, abre Analizar ▸ Revisión del agente, pulsa «Diseñar todas las columnas» y luego «Enviar diseño al agente».",
          opciones: [{texto: "Abrir Análisis Estructural", herramienta: "abrir_analisis", args: {}}]};
      }
      ctx.memoria.disenoColumnas = paquete.columnas;
      ctx.memoria.reaccionesColumnas = Array.isArray(paquete.reacciones) && paquete.reacciones.length ? paquete.reacciones : null;
      ctx.memoria.revisionAnalisis = paquete.revision ?? null;
      const lineas = textoDiseno(paquete.columnas);
      if (ctx.memoria.reaccionesColumnas) {
        const t = ctx.memoria.reaccionesColumnas.reduce((s, r) => ({pd: s.pd + r.pd, pl: s.pl + r.pl}), {pd: 0, pl: 0});
        lineas.push(`Reacciones de ${ctx.memoria.reaccionesColumnas.length} apoyos (CM ${t.pd.toFixed(1)} t, CV ${t.pl.toFixed(1)} t en total): con ellas se dimensionan las zapatas.`);
      }
      const revision = paquete.revision?.texto ? `Revisión E.030: ${paquete.revision.texto}` : "";
      const plano = ctx.memoria.ultimaGeneracion ? (await import("./estructuraPlano.js")).ESTRUCTURA_SKILLS.find((x) => x.name === "plano_estructuras") : null;
      if (!plano) {
        return {ok: true, mensaje: ["Guardé el diseño del análisis; se aplicará al generar las láminas.", ...lineas, revision].filter(Boolean).join("\n"),
          opciones: [{texto: "Generar las láminas", herramienta: "plano_estructuras", args: {}, recomendada: true}]};
      }
      // Mismos pedidos de la última generación (vista, «con zapatas»…): solo cambia el diseño.
      const r = await plano.run(ctx.memoria.ultimaGeneracion?.args ?? {}, ctx);
      if (!r.ok) return {...r, error: `Guardé el diseño, pero no pude rehacer las láminas: ${r.error ?? "error"}`};
      // Lo que dice el mensaje es lo que dibuja el cuadro (verificado contra el modelo recién armado).
      const dibujado = Object.fromEntries((ctx.memoria.modeloEstructural?.refuerzoColumnas ?? []).map((f) => [f.tipo, f.refuerzo]));
      const distintos = Object.values(paquete.columnas).filter((t) => t.aumentado && dibujado[t.tipo] && dibujado[t.tipo] !== `${t.n}Ø${t.barra}`);
      return {
        ...r, ok: true,
        mensaje: [`Apliqué el diseño de Análisis Estructural al cuadro de columnas, al metrado y al modelo:`, ...lineas, revision,
          distintos.length ? `Atención: ${distintos.map((t) => `${t.tipo} quedó dibujada con ${dibujado[t.tipo]}`).join(", ")}.` : "",
          r.mensaje ?? ""].filter(Boolean).join("\n"),
      };
    },
  },
  {
    name: "abrir_analisis",
    description: "Abre Análisis Estructural con el modelo que armó modelo_analisis (en otra pestaña).",
    parameters: {type: "object", properties: {}},
    async run(_args, ctx) {
      let hay = false;
      try { hay = Boolean(globalThis.localStorage?.getItem(MODELO_DEL_AGENTE)); } catch { /* sin almacenamiento */ }
      if (!hay) return {ok: false, error: "No hay un modelo de análisis pendiente. Pide primero \"envía a análisis\".", opciones: [{texto: "Armar el modelo de análisis", herramienta: "modelo_analisis", args: {}}]};
      const abierta = ctx.abrirPagina ? ctx.abrirPagina(RUTA_ANALISIS) : globalThis.open?.(RUTA_ANALISIS, "_blank");
      return abierta === null
        ? {ok: false, error: "El navegador bloqueó la ventana nueva. Permite las ventanas emergentes de este sitio o abre Análisis Estructural desde el menú y usa Archivo ▸ Importar .e2k con el archivo descargado."}
        : {ok: true, mensaje: "Abrí Análisis Estructural con el modelo. Revisa los supuestos, luego corre el análisis."};
    },
  },
];
