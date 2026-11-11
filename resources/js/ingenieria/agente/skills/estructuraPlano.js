// Skills que leen la estructura de un plano abierto (columnas y ejes) y
// predimensionan sus zapatas aisladas para Cimentación 2.0.

import {L, line, circle, text, rect} from "../../cad/primitives.js";
import {detectarColumnas, areasTributarias, deducirEjes, predimensionarZapatas, CARGAS_POR_DEFECTO} from "../../diseno/estructura.js";
import {leerVista} from "../../lectura/lectorPlano.js";
import {laminaEstructuras} from "../../laminas/laminaEstructuras.js";
import {laminasConPlantilla} from "../../laminas/laminasPlantilla.js";
import {CAMPOS_TECNICOS, datosTecnicos, parametrosSismicos} from "../../criterios/datosProyecto.js";

const r2 = (value) => Math.round(value * 100) / 100;
const listaCapas = (value) => String(value ?? "").split(/[,;]/).map((capa) => capa.trim()).filter(Boolean);

// Unidades del dibujo por metro según el radio de las burbujas de eje
// (0.2-0.6 m en la práctica): más confiable que INSUNITS, que a veces miente.
const escalaPorBurbuja = (radio) => (radio >= 40 ? 1000 : radio >= 4 ? 100 : 1);

// Vista pedida: número (#2) o parte del título ("primer nivel"). Por defecto, la
// planta con más columnas en sus cruces de ejes.
function elegirVista(ctx, pedido) {
  if (!ctx.readPlan) return null;
  const {items, vistas} = ctx.readPlan();
  if (!vistas.length) return null;
  const leidas = vistas.map((vista) => ({vista, k: escalaPorBurbuja(vista.radio)})).map((v) => ({...v, lectura: leerVista(items, v.vista, v.k)}));
  const texto = String(pedido ?? "").trim().toLowerCase();
  if (texto) {
    const numero = Number(texto.replace(/^#/, ""));
    const elegida = Number.isInteger(numero) && numero > 0 ? leidas[numero - 1] : leidas.find((v) => v.vista.titulo.toLowerCase().includes(texto));
    if (!elegida) throw new Error(`No hay una vista "${pedido}". Usa vistas_plano para ver las disponibles.`);
    return elegida;
  }
  // En empate gana una planta de piso sobre techo, cimentación o aligerado.
  const secundaria = (v) => (/techo|cubierta|azotea|cimenta|cimiento|aligerad|losa|platea/i.test(v.vista.titulo) ? 1 : 0);
  return [...leidas].sort((a, b) => secundaria(a) - secundaria(b) || b.lectura.columnas.length - a.lectura.columnas.length)[0];
}

function leerEstructura(ctx, capasTexto, vistaPedida) {
  const capas = listaCapas(capasTexto);
  // 1) Ejes con nombre y columnas en sus cruces (funciona con bloques y capa "0").
  const elegida = capas.length ? null : elegirVista(ctx, vistaPedida);
  if (elegida && elegida.lectura.columnas.length >= 2) {
    const {lectura, vista, k} = elegida;
    const columnas = areasTributarias(lectura.columnas.map((c) => ({...c, id: `${c.tipo} ${c.eje}`})));
    const estructura = {
      columnas, escala: k, vista: `#${vista.indice} ${vista.titulo || "sin título"}`,
      ejesNombrados: lectura.ejes, tipos: lectura.tipos, columnetas: lectura.columnetas, listaColumnetas: lectura.listaColumnetas,
      caja: vista.caja, titulo: vista.titulo,
      ejes: {x: [], y: []}, ignorados: {bloques: 0, sombreados: 0}, capas: [...new Set(columnas.flatMap((c) => c.capas))],
    };
    ctx.memoria.estructura = estructura;
    return estructura;
  }
  // 2) Plano sin burbujas de eje: contornos en capas estructurales.
  const {segmentos, ignorados} = ctx.structuralSegments(capas);
  if (!segmentos.length) {
    throw new Error(capas.length
      ? `No hay líneas ni polilíneas en las capas: ${capas.join(", ")}.`
      : "No encontré ejes con nombre ni capas estructurales (COL, PLACA o ESTRUC). Revisa con vistas_plano o resumen_plano e indica las capas en 'capas'.");
  }
  const deteccion = detectarColumnas(segmentos);
  if (!deteccion.columnas.length) throw new Error("Las capas estructurales no tienen contornos con tamaño de columna (0.10 a 4 m).");
  const columnas = areasTributarias(deteccion.columnas);
  const ejes = deducirEjes(columnas);
  const estructura = {columnas, ejes, escala: deteccion.escala, descartados: deteccion.descartados, ignorados, capas: [...new Set(columnas.flatMap((c) => c.capas))]};
  ctx.memoria.estructura = estructura;
  return estructura;
}

// Ejes deducidos y etiquetas C1, C2... sobre el plano, en coordenadas reales.
function primitivasEstructura({columnas, ejes, ejesNombrados}) {
  // Los ejes ya existen en el plano: solo se rotula cada columna con su tipo.
  if (ejesNombrados) return columnas.map((c) => text(L.COLUMNAS_ID, [c.x + c.b / 2 + 0.12, c.y + c.h / 2 + 0.08], c.tipo, 0.1));
  const xs = columnas.map((c) => c.x), ys = columnas.map((c) => c.y);
  const x0 = Math.min(...xs) - 1.5, x1 = Math.max(...xs) + 1.5, y0 = Math.min(...ys) - 1.5, y1 = Math.max(...ys) + 1.5;
  const rb = 0.3;
  return [
    ...ejes.x.flatMap((e) => [line(L.EJES, [e.x, y0], [e.x, y1]), circle(L.EJES, [e.x, y0 - rb], rb), text(L.EJES, [e.x, y0 - rb], e.nombre, 0.25)]),
    ...ejes.y.flatMap((e) => [line(L.EJES, [x0, e.y], [x1, e.y]), circle(L.EJES, [x0 - rb, e.y], rb), text(L.EJES, [x0 - rb, e.y], e.nombre, 0.25)]),
    ...columnas.map((c) => text(L.COLUMNAS_ID, [c.x + c.b / 2 + 0.2, c.y + c.h / 2 + 0.12], c.id, 0.15)),
  ];
}

const resumenTipos = (tipos) => tipos.map((t) => `${t.tipo} ${t.forma === "rectangular" ? "" : t.forma + " "}${t.b.toFixed(2)}x${t.h.toFixed(2)} (${t.cantidad})`).join(", ");
const textoEjes = (e) => (e.ejesNombrados
  ? e.ejesNombrados.map((x) => x.nombre + (x.inclinado ? " (inclinado)" : "")).join(", ")
  : [...e.ejes.x.map((x) => `${x.nombre}=${r2(x.x)}`), ...e.ejes.y.map((y) => `${y.nombre}=${r2(y.y)}`)].join(" ") || "no se pudieron deducir");

function resumenColumnas(columnas) {
  const tipos = new Map();
  for (const c of columnas) {
    const key = `${c.b}x${c.h}${c.forma === "irregular" ? " (irregular)" : ""}`;
    tipos.set(key, (tipos.get(key) ?? 0) + 1);
  }
  return [...tipos].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => `${n} de ${k}`).join(", ");
}

// Parámetros de datos del proyecto que el modelo puede pasar desde el chat.
const PARAMETROS_DATOS = {
  hz: {type: "number", description: "Hz: peralte de platea o zapata en m (estudio de suelos), ej. 0.60"},
  df: {type: "number", description: "Df: profundidad de desplante en m, ej. 2.50"},
  zona: {type: "integer", description: "Zona sísmica E.030: 1 a 4"},
  suelo: {type: "string", enum: ["S0", "S1", "S2", "S3"], description: "Perfil de suelo"},
  categoria: {type: "string", enum: ["A2", "B", "C"], description: "Categoría: A2 esencial (colegio, hospital), B importante, C común (vivienda)"},
};
// Los niveles (pisos) no se piden ni se toman en el chat: van solo en el panel ▤.
const CAMPOS_CHAT = CAMPOS_TECNICOS.filter((c) => c.campo in PARAMETROS_DATOS);

// Guarda en el panel los datos que vinieron en el pedido; devuelve qué se guardó y qué no sirvió.
function guardarDatos(args, ctx) {
  const dados = Object.fromEntries(CAMPOS_CHAT.map((c) => [c.campo, args?.[c.campo]]).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== ""));
  if (!Object.keys(dados).length) return {guardados: [], invalidos: []};
  const t = datosTecnicos(dados);
  const validos = Object.fromEntries(Object.keys(dados).filter((k) => t[k] !== null).map((k) => [k, String(t[k])]));
  if (Object.keys(validos).length) ctx.guardarDatosProyecto?.(validos);
  return {guardados: Object.keys(validos), invalidos: t.invalidos};
}

const ETIQUETA = {hz: "Hz", df: "Df", zona: "zona", suelo: "suelo", categoria: "categoría", niveles: "niveles"};
function textoDatos(datos) {
  const t = datosTecnicos(datos), p = parametrosSismicos(t);
  const tiene = CAMPOS_TECNICOS.filter((c) => t[c.campo] !== null).map((c) => `${ETIQUETA[c.campo]} ${c.campo === "hz" || c.campo === "df" ? `${t[c.campo].toFixed(2)} m` : t[c.campo]}`);
  const faltan = CAMPOS_CHAT.filter((c) => t[c.campo] === null).map((c) => ETIQUETA[c.campo]);
  const sismo = [p.Z !== undefined && `Z=${p.Z}`, p.U !== undefined && `U=${p.U}`, p.S !== undefined && `S=${p.S}`, p.Tp !== undefined && `Tp=${p.Tp}`, p.TL !== undefined && `TL=${p.TL}`].filter(Boolean);
  return {tiene, faltan, sismo};
}

export const ESTRUCTURA_SKILLS = [
  {
    name: "quitar_laminas",
    description: "Quita del dibujo las láminas de estructuras que dibujó el agente (solo las suyas; la arquitectura y lo que dibujó el usuario no se tocan). Úsalo si el usuario pide borrar o limpiar las láminas.",
    parameters: {type: "object", properties: {}},
    async run(args, ctx) {
      const antes = ctx.generaciones?.() ?? {};
      const n = ctx.borrarGeneracion?.(null) ?? 0;
      const vistas = Object.keys(antes).map((k) => k.replace(/^laminas:/, ""));
      return {
        ok: true,
        mensaje: n ? `Quité las láminas del agente${vistas.length ? ` (${vistas.join(", ")})` : ""}: ${n} objetos. La arquitectura quedó igual.`
          : "No encontré láminas dibujadas por el agente en este plano. Si hay láminas de antes de esta versión, no tienen la marca del agente: bórralas a mano.",
      };
    },
  },
  {
    name: "datos_proyecto",
    description: "Guarda o consulta los datos del proyecto que usan las láminas de estructuras: Hz y Df del estudio de suelos, zona sísmica, perfil de suelo y categoría. Úsalo cuando el usuario dé o pregunte esos datos.",
    parameters: {type: "object", properties: PARAMETROS_DATOS},
    async run(args, ctx) {
      const {guardados, invalidos} = guardarDatos(args, ctx);
      const {tiene, faltan, sismo} = textoDatos(ctx.datosProyecto?.() ?? {});
      return {
        ok: true,
        mensaje: `${guardados.length ? `Guardé ${guardados.map((k) => ETIQUETA[k]).join(", ")} en Datos del proyecto. ` : ""}` +
          `${tiene.length ? `Datos del proyecto: ${tiene.join(", ")}${sismo.length ? ` (${sismo.join(", ")})` : ""}.` : "Aún no hay datos del proyecto."}` +
          `${faltan.length ? ` Faltan: ${faltan.join(", ")}; sin ellos uso el criterio del despacho y lo aviso.` : ""}` +
          `${guardados.length ? " Pide \"genera el plano de estructuras\" para rehacer las láminas con estos datos." : ""}`,
        avisos: invalidos.length ? [`No guardé (fuera de rango o mal escrito): ${invalidos.join("; ")}.`] : [],
      };
    },
  },
  {
    name: "vistas_plano",
    description: "Lista las vistas del plano abierto (plantas con su grilla de ejes: primer nivel, techo, cimentación…) con sus ejes y columnas. Úsalo cuando el archivo tiene varias láminas o vistas.",
    parameters: {type: "object", properties: {}},
    async run(args, ctx) {
      const {items, vistas} = ctx.readPlan();
      if (!vistas.length) return {ok: true, mensaje: "No encontré grillas de ejes con nombre (burbujas con rótulo). Usa leer_estructura indicando las capas de columnas."};
      const filas = vistas.slice(0, 8).map((vista) => {
        const k = escalaPorBurbuja(vista.radio);
        const lectura = leerVista(items, vista, k);
        return `#${vista.indice} ${vista.titulo || "sin título"}: ejes ${lectura.ejes.map((e) => e.nombre).join(",")}; ${lectura.columnas.length} columnas${lectura.tipos.length ? ` (${resumenTipos(lectura.tipos)})` : ""}`;
      });
      return {ok: true, mensaje: `El plano tiene ${vistas.length} vista(s) con ejes:\n${filas.join("\n")}`};
    },
  },
  {
    name: "leer_estructura",
    description: "Lee la planta de arquitectura abierta: ejes con su nombre (también inclinados), columnas en los cruces de ejes (aunque estén dentro de bloques) y sus tipos C1, C2…; las rotula en el plano.",
    parameters: {type: "object", properties: {
      vista: {type: "string", description: "Opcional: número o parte del título de la vista, ej. 'primer nivel'"},
      capas: {type: "string", description: "Opcional: capas de columnas separadas por coma (solo si el plano no tiene ejes con nombre)"},
    }},
    async run(args, ctx) {
      const e = leerEstructura(ctx, args.capas, args.vista);
      ctx.draw(primitivasEstructura(e), "Agente: ejes y columnas del plano", {unitsPerMeter: e.escala});
      if (e.ejesNombrados) {
        return {
          ok: true,
          mensaje: `En la vista ${e.vista} leí los ejes ${textoEjes(e)} y ${e.columnas.length} columnas en sus cruces: ${resumenTipos(e.tipos)}${e.columnetas ? `; además ${e.columnetas} columnetas o elementos de confinamiento` : ""}. Las rotulé por tipo en la capa E-COLUMNAS-ID.`,
          columnas: e.columnas.map((c) => `${c.tipo} en ${c.eje}`).join("; "),
        };
      }
      const ejes = `${e.ejes.x.length} ejes en X y ${e.ejes.y.length} en Y`;
      return {
        ok: true,
        mensaje: `Encontré ${e.columnas.length} columnas en el plano (${resumenColumnas(e.columnas)}) y deduje ${ejes}; quedaron marcados como C1…C${e.columnas.length} y ejes en la capa E-EJES.`,
        columnas: `${e.columnas.length}: ${resumenColumnas(e.columnas)} (m)`,
        ejes: textoEjes(e),
        capas: e.capas.join(", "),
        noAnalizados: `${e.ignorados.bloques} bloques y ${e.ignorados.sombreados} sombreados en capas estructurales`,
      };
    },
  },
  {
    name: "zapatas_desde_plano",
    description: "Predimensiona zapatas aisladas para las columnas del plano abierto (área tributaria x pisos x cargas), las dibuja y las envía a Cimentación 2.0.",
    parameters: {type: "object", properties: {
      pisos: {type: "integer", description: "Número de pisos sobre la zapata"},
      qadm: {type: "number", description: "Capacidad admisible del suelo en t/m² (1.5 kg/cm² = 15)"},
      carga_muerta: {type: "number", description: "t/m² por piso, por defecto 0.75"},
      carga_viva: {type: "number", description: "t/m² por piso, por defecto 0.25"},
      vista: {type: "string", description: "Opcional: número o parte del título de la vista"},
      capas: {type: "string", description: "Opcional: capas estructurales separadas por coma"},
    }},
    async run(args, ctx) {
      // Si la estructura no se leyó antes, se lee y se marcan ejes y columnas aquí mismo.
      const nueva = !ctx.memoria.estructura || Boolean(args.capas) || Boolean(args.vista);
      const e = nueva ? leerEstructura(ctx, args.capas, args.vista) : ctx.memoria.estructura;
      if (nueva) ctx.draw(primitivasEstructura(e), "Agente: ejes y columnas del plano", {unitsPerMeter: e.escala});
      const avisos = [];
      if (!Number(args.pisos)) avisos.push(`Asumí ${CARGAS_POR_DEFECTO.pisos} piso; indica los pisos reales.`);
      const {zapatas, traslapes, opciones} = predimensionarZapatas(e.columnas, {
        pisos: args.pisos, qadm: args.qadm, cargaMuerta: args.carga_muerta, cargaViva: args.carga_viva,
      });
      ctx.draw(zapatas.flatMap((z) => [
        rect(L.ZAPATAS, z.x0, z.y0, z.x1, z.y1),
        text(L.ZAPATAS, [z.x, z.y0 - 0.15], `Z-${z.id} ${z.B.toFixed(2)}x${z.L.toFixed(2)}`, 0.12),
      ]), "Agente: zapatas predimensionadas", {unitsPerMeter: e.escala});

      // Cimentación 2.0 trabaja con coordenadas locales positivas.
      const ox = Math.min(...zapatas.map((z) => z.x0)), oy = Math.min(...zapatas.map((z) => z.y0));
      const local = (v, o) => Math.round((v - o) * 1000) / 1000;
      const enviado = ctx.sendToFoundation({
        origen: {x: ox, y: oy},
        columnas: zapatas.map((z, i) => ({
          id: `plano-${i + 1}`, column: z.id, x: local(z.x, ox), y: local(z.y, oy),
          pd1: z.pd, pd2: 0, pd3: 0, pl1: z.pl, pl2: 0, pl3: 0, sismo1: 0, sismo2: 0, sismo3: 0,
        })),
        zapatas: zapatas.map((z) => ({
          closed: true, source: "plano", label: `Z-${z.id}`,
          nodes: [[z.x0, z.y0], [z.x1, z.y0], [z.x1, z.y1], [z.x0, z.y1]].map(([x, y], i) => ({id: i + 1, x: local(x, ox), y: local(y, oy)})),
        })),
      });
      if (traslapes.length) avisos.push(`Zapatas que se traslapan (evaluar combinada o conectada): ${traslapes.slice(0, 8).join(", ")}${traslapes.length > 8 ? "…" : ""}.`);
      const lados = zapatas.map((z) => Math.max(z.B, z.L));
      const rango = `${Math.min(...lados).toFixed(2)} a ${Math.max(...lados).toFixed(2)} m`;
      return {
        ok: true,
        mensaje: `Predimensioné ${zapatas.length} zapatas aisladas de ${rango} para ${opciones.pisos} piso(s) y ${r2(zapatas.reduce((s, z) => s + z.pd + z.pl, 0))} t en servicio; están en la capa E-ZAPATAS${enviado ? " y en Cimentación 2.0 para calcular presiones" : ""}.`,
        zapatas: `${zapatas.length}, de ${rango}`,
        cargaTotal: `${r2(zapatas.reduce((s, z) => s + z.pd + z.pl, 0))} t en servicio`,
        criterios: `${opciones.pisos} piso(s), CM ${opciones.cargaMuerta} t/m², CV ${opciones.cargaViva} t/m², qadm ${opciones.qadm} t/m²; sin sismo`,
        cimentacion: enviado ? "Enviadas a Cimentación 2.0 para calcular presiones" : "Cimentación 2.0 no está disponible",
        avisos,
      };
    },
  },
  {
    name: "plano_estructuras",
    description: "Pasa de arquitectura a estructuras: con la planta de arquitectura abierta, dibuja debajo la lámina de estructuras (plano de cimentación, plano de aligerado, cuadro de columnas, notas y rótulo) sobre los mismos ejes y columnas. Úsalo para cualquier pedido de plano de estructuras o de estructurar el plano.",
    parameters: {type: "object", properties: {
      vista: {type: "string", description: "Opcional: número o parte del título de la vista de arquitectura, ej. 'primer nivel'"},
      cimentacion: {type: "string", enum: ["auto", "zapatas", "platea"], description: "Opcional: tipo de cimentación; por defecto auto"},
      conservar: {type: "boolean", description: "Solo si el usuario pide expresamente conservar las láminas anteriores y agregar otra copia. Para arreglar, corregir o rehacer, NO lo uses: las láminas se rehacen en su lugar."},
      ...PARAMETROS_DATOS,
    }},
    async run(args, ctx) {
      // Datos dictados en el mismo pedido ("con Hz 0.60 y zona 3"): se guardan y se usan.
      const {guardados, invalidos} = guardarDatos(args, ctx);
      // Primero la vista de arquitectura (las láminas del agente no cuentan como vistas).
      const e = leerEstructura(ctx, "", args.vista);
      // Rehacer en su lugar: se quitan las láminas que el agente dibujó antes para esta
      // vista (marcadas en el dibujo), en vez de apilar otras debajo.
      const clave = `laminas:${e.titulo || e.vista}`;
      const quitadas = args.conservar ? 0 : (ctx.borrarGeneracion?.(clave) ?? 0);
      ctx.iniciarGeneracion?.(clave);
      try { return await generarLaminas(args, ctx, {e, guardados, invalidos, quitadas}); }
      finally { ctx.cerrarGeneracion?.(clave); }
    },
  },
];

async function generarLaminas(args, ctx, {e, guardados, invalidos, quitadas}) {
  const previo = [
    guardados.length ? `Guardé ${guardados.map((k) => ETIQUETA[k]).join(", ")} en Datos del proyecto.` : "",
    quitadas ? "Reemplacé las láminas anteriores." : "",
  ].filter(Boolean).join(" ");
  const extra = invalidos.length ? [`No guardé (fuera de rango o mal escrito): ${invalidos.join("; ")}.`] : [];
  {
    {
      if (!e.ejesNombrados) throw new Error("Para estructurar el plano necesito la planta de arquitectura con ejes con nombre (burbujas con rótulo, ej. 8, 10, Y´).");
      const {items} = ctx.readPlan();
      const lectura = {columnas: e.columnas, ejes: e.ejesNombrados, titulo: e.titulo, columnetas: e.listaColumnetas ?? []};
      // Con la plantilla del despacho: láminas iguales al expediente de referencia.
      const plantilla = await ctx.loadTemplate?.().catch(() => null);
      if (plantilla) {
        const k = e.escala;
        const r = laminasConPlantilla({lectura, items, caja: e.caja, k, config: plantilla.config, cimentacion: args.cimentacion, datos: ctx.datosProyecto?.() ?? {}});
        ctx.insertTemplate(plantilla.db, {x: r.desplazamiento.x * k, y: r.desplazamiento.y * k}, k, null, r.textosPlantilla);
        // Hojas extra de pórticos: copia de la lámina de pórticos de la plantilla.
        for (const c of r.copias ?? []) ctx.insertTemplate(plantilla.db, {x: c.desplazamiento.x * k, y: c.desplazamiento.y * k}, k, c.marco, r.textosPlantilla);
        const z = r.zona;
        const lista = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}` : xs[0] ?? "");
        ctx.draw(r.primitivas, `Agente: láminas ${lista(r.laminas.map((l) => l.codigo))} de estructuras`, {unitsPerMeter: k, zoom: {x0: z.x0 * k, y0: z.y0 * k, x1: z.x1 * k, y1: z.y1 * k}});
        const s = r.resumen;
        return {
          ok: true,
          mensaje: `${previo ? `${previo} ` : ""}Generé las láminas ${lista(r.laminas.map((l) => `${l.codigo} (${l.plano.toLowerCase()})`))} de ${r.proyecto} debajo de la arquitectura, con la plantilla del despacho: ` +
            `cimentación con ${s.cimentacion} (Hz = ${s.hz.toFixed(2)} m, Df = ${s.df.toFixed(2)} m), cimiento corrido ${s.anchoCimiento.toFixed(2)} m en ${s.cimientoCorrido} tramos, aligerado e=${s.aligerado.espesor.toFixed(2)} m (${s.aligerado.viguetas} viguetas), ` +
            `pórticos de los ejes ${s.porticos.join(", ")} (${s.techo ? `techo a dos aguas PTE ${Math.round(s.techo.pendiente * 100)}%, alero +${s.altura.toFixed(2)}, cumbrera +${s.techo.cumbrera.toFixed(2)}` : `techo +${s.altura.toFixed(2)}`}) y cuadro de columnas ${s.columnas.map((c) => `${c.tipo} ${c.refuerzo}`).join(", ")}` +
            `${s.sismo?.Z !== undefined || s.sismo?.U !== undefined ? `; parámetros sísmicos ${[s.sismo.Z !== undefined && `Z=${s.sismo.Z}`, s.sismo.U !== undefined && `U=${s.sismo.U}`, s.sismo.S !== undefined && `S=${s.sismo.S}`, s.sismo.Tp !== undefined && `Tp=${s.sismo.Tp}`].filter(Boolean).join(", ")}` : ""}.`,
          laminas: r.laminas.map((l) => l.codigo),
          avisos: [...extra, ...r.avisos],
        };
      }
      const r = laminaEstructuras({lectura: {columnas: e.columnas, ejes: e.ejesNombrados}, items, caja: e.caja, k: e.escala, titulo: e.titulo}, {cimentacion: args.cimentacion});
      const {x0, y0, x1, y1} = r.lamina, k = e.escala;
      ctx.draw(r.primitivas, `Agente: lámina ${r.lamina.nombre} de estructuras`, {unitsPerMeter: k, zoom: {x0: x0 * k, y0: y0 * k, x1: x1 * k, y1: y1 * k}});
      const c = r.cimentacion, a = r.aligerado;
      const cim = [
        c.tipo === "platea" ? "platea" : `${c.zapatas.length} zapatas`,
        c.cimientos ? `${c.cimientos} ${c.cimientos === 1 ? "tramo" : "tramos"} de cimiento corrido bajo muros` : "",
        c.vigas ? `${c.vigas} ${c.vigas === 1 ? "viga" : "vigas"} de cimentación` : "",
      ].filter(Boolean).join(", ");
      return {
        ok: true,
        mensaje: `${previo ? `${previo} ` : ""}Generé la lámina ${r.lamina.nombre} de estructuras debajo de la arquitectura (${e.vista}${r.lamina.escala ? `, esc. ${r.lamina.escala}` : ""}): ` +
          `cimentación con ${cim}; aligerado e=${a.espesor.toFixed(2)} m con ${a.viguetas} viguetas y ${a.vigas} vigas (${a.tiposViga.map((t) => `${t.tipo} ${t.medida}`).join(", ")}); ` +
          `cuadro de columnas ${r.cuadroColumnas.map((col) => `${col.tipo} ${col.refuerzo}`).join(", ")}.`,
        lamina: r.lamina.nombre,
        avisos: [...extra, ...r.avisos],
      };
    }
  }
}
