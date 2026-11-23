// Skills que leen la estructura de un plano abierto (columnas y ejes) y
// predimensionan sus zapatas aisladas para Cimentación 2.0.

import {L, line, circle, text, rect} from "../../cad/primitives.js";
import {detectarColumnas, areasTributarias, deducirEjes, predimensionarZapatas, CARGAS_POR_DEFECTO} from "../../diseno/estructura.js";
import {leerVista} from "../../lectura/lectorPlano.js";
import {laminaEstructuras} from "../../laminas/laminaEstructuras.js";
import {laminasConPlantilla} from "../../laminas/laminasPlantilla.js";
import {CAMPOS_TECNICOS, datosTecnicos, parametrosSismicos} from "../../criterios/datosProyecto.js";
import {cajaTexto, seEncima, desencimarTextos} from "../../laminas/cajasTexto.js";
import {rasgosDeArquitectura, geometriaDeLecturas, integrarGeometriaAprendida, proponer, textoPropuesta, casosDeUso, DECISIONES, nivelDeTitulo, nombreVisible} from "../../aprendizaje/casos.js";
import {CASOS, EVENTOS_USO} from "../../aprendizaje/casosAprendidos.js";
import {registrarEvento, eventosDeUso, rasgosParaGuardar} from "../../aprendizaje/registro.js";
import {metradoEstructuras, aplicarCorrecciones} from "../../metrado/metrado.js";
import {terminosAprendidos} from "../../metrado/terminologia.js";
import {descargarPlanilla} from "../../metrado/planillaExcel.js";
import {ambientesDeLosa, voladosDesdePlanta} from "../../planos/aligeradoPlano.js";
import {consultasDelPlano, aplicarRespuestas, textoConsultas, cimentacionRecomendada} from "../consultas.js";
import {buscarUbicacion, textoUbicacion, categoriaPorUso} from "../../criterios/ubicacion.js";
import {numeroModulo, vistasDelModulo, formatoDeReferencia, memoriaParaModulo} from "../referenciasProyecto.js";
import {datosTecnicosFaltantes, firmaDeGeneracion} from '../contratoDibujo.js';

const r2 = (value) => Math.round(value * 100) / 100;
const listaCapas = (value) => String(value ?? "").split(/[,;]/).map((capa) => capa.trim()).filter(Boolean);

// Unidades del dibujo por metro según el radio de las burbujas de eje
// (0.2-0.6 m en la práctica): más confiable que INSUNITS, que a veces miente.
const escalaPorBurbuja = (radio) => (radio >= 40 ? 1000 : radio >= 4 ? 100 : 1);

// Rasgos de la arquitectura abierta (todas sus vistas) y la propuesta de estructura según los
// casos aprendidos (proyectos estudiados + correcciones del ingeniero). Queda en la memoria de
// la conversación para aprender de las correcciones.
async function propuestaDelPlano(ctx) {
  const plano = ctx.readPlan();
  const vistas = vistasDelModulo(plano.vistas, ctx.memoria?.estructura?.titulo || ctx.nombreDocumento?.());
  const items = vistas.length < plano.vistas.length ? plano.items.filter((it) => vistas.some((v) => {
    const m = v.caja, g = Math.max(m.x1 - m.x0, m.y1 - m.y0) * 0.15;
    return (it.puntos ?? [it.centro]).some((p) => p && p.x >= m.x0 - g && p.x <= m.x1 + g && p.y >= m.y0 - g && p.y <= m.y1 + g);
  })) : plano.items;
  const lecturas = vistas.map((vista) => ({titulo: vista.titulo, lectura: leerVista(items, vista, escalaPorBurbuja(vista.radio))}));
  const textos = items.filter((it) => it.tipo === "texto" && it.texto).map((it) => it.texto);
  const rasgos = rasgosDeArquitectura(lecturas, textos);
  const uso = casosDeUso([...EVENTOS_USO, ...await (ctx.eventosDeUso ?? eventosDeUso)()]);
  const propuesta = proponer(rasgos, [...CASOS, ...uso]);
  const lecturaActual = geometriaDeLecturas(lecturas);
  const casosConGeometria = CASOS.filter((caso) => caso.geometria).map((caso) => ({...caso, fuente: "pareado-validado"}));
  const geometriaAprendida = integrarGeometriaAprendida({rasgos, propuesta, casos: casosConGeometria, lecturaActual});
  propuesta.geometriaAprendida = geometriaAprendida;
  if (ctx.memoria) ctx.memoria.propuesta = {rasgos, propuesta};
  return {rasgos, propuesta};
}

// Varios niveles: el último lleva losa (así en los 9 edificios de varios niveles estudiados).
// Un nivel: lo aprendido si está confirmado; si no, losa y aviso (se le pregunta al ingeniero).
export function losaTechoParaGeneracion(niveles, decision, usarDecision) {
  if (niveles >= 2) return {losaTecho: true, aviso: null};
  const confirmada = usarDecision && !decision?.ingeniero && typeof decision?.valor === "boolean";
  return {
    losaTecho: confirmada ? decision.valor : true,
    aviso: confirmada ? null : "No se confirmó si el techo lleva losa o solo cobertura liviana; revisar el criterio con el ingeniero antes de usar estas láminas.",
  };
}

// Una corrección del ingeniero a una decisión del agente: se aprende (servidor + sesión).
async function aprender(ctx, {clave, valor, motivo, tipo = "correccion"}) {
  const p = ctx.memoria?.propuesta ?? await propuestaDelPlano(ctx);
  const propuesto = p.propuesta.decisiones[clave]?.valor ?? null;
  // Solo la geometría del plano (nunca el título de la vista: lleva el nombre del proyecto).
  const evento = {tipo, clave, valor, propuesto, motivo: motivo || null, rasgos: rasgosParaGuardar(p.rasgos)};
  await (ctx.registrarAprendizaje ?? registrarEvento)(evento);
  return {propuesto};
}

// Valor dicho en el chat → el tipo de la decisión ("sí" → true, "0.20" → 0.2).
function valorDeDecision(clave, valor) {
  const t = String(valor ?? "").trim().toLowerCase();
  if (["cimientoCorrido", "losaDeTecho", "columnasComoArquitectura"].includes(clave)) return /^(s[ií]|true|1|lleva|con)/.test(t);
  if (["hz", "df", "espesorLosa", "fcColumnas", "fcColumnetas"].includes(clave)) {
    const n = Number(t.replace(",", ".").replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(n) || n <= 0) return null;
    return clave === "espesorLosa" && n > 1 ? n / 100 : n; // "25 cm" → 0.25
  }
  if (clave === "cimentacion") return /zapat/.test(t) ? "zapatas" : /platea/.test(t) ? "platea" : /corrid/.test(t) ? "cimiento corrido" : null;
  if (clave === "losa") return /maciz/.test(t) && /aligerad/.test(t) ? "aligerada y maciza" : /maciz/.test(t) ? "maciza" : /aligerad/.test(t) ? "aligerada" : null;
  return t || null;
}

// Vista pedida: número (#2) o parte del título ("primer nivel"). Por defecto, la
// planta con más columnas en sus cruces de ejes.
function elegirVista(ctx, pedido) {
  if (!ctx.readPlan) return null;
  const {items, vistas: todas} = ctx.readPlan();
  const vistas = vistasDelModulo(todas, numeroModulo(pedido) ? pedido : ctx.nombreDocumento?.());
  if (todas.length && !vistas.length) throw new Error('No encontré vistas del módulo solicitado en el documento actual. Consulta vistas_plano y elige una vista existente.');
  if (!vistas.length) return null;
  const leidas = vistas.map((vista) => ({vista, k: escalaPorBurbuja(vista.radio)})).map((v) => ({...v, lectura: leerVista(items, v.vista, v.k)}));
  const texto = String(pedido ?? "").trim().toLowerCase();
  if (texto) {
    const numero = Number(texto.replace(/^#/, ""));
    const elegida = Number.isInteger(numero) && numero > 0 ? leidas[numero - 1] : leidas.find((v) => v.vista.titulo.toLowerCase().includes(texto))
      ?? (numeroModulo(texto) ? leidas.find((v) => numeroModulo(v.vista.titulo) === numeroModulo(texto)) : null);
    if (elegida) return elegida;
    // El modelo a veces inventa la vista ("eje Z-Z" es un pórtico, no una planta): se usa la
    // planta principal y se avisa, en vez de fallar sin hacer nada.
    const principal = elegirVista(ctx, "");
    ctx.memoria.avisoVista = `No hay una vista "${pedido}" en el plano; usé "${principal.vista.titulo || `#${principal.vista.indice}`}".`;
    return principal;
  }
  // En empate gana una planta de piso sobre techo, cimentación o aligerado.
  const secundaria = (v) => (/techo|cubierta|azotea|cimenta|cimiento|aligerad|losa|platea/i.test(v.vista.titulo) ? 1 : 0);
  return [...leidas].sort((a, b) => secundaria(a) - secundaria(b) || b.lectura.columnas.length - a.lectura.columnas.length)[0];
}

function leerEstructura(ctx, capasTexto, vistaPedida) {
  const capas = listaCapas(capasTexto);
  // 1) Ejes con nombre y columnas en sus cruces (funciona con bloques y capa "0").
  const elegida = capas.length ? null : elegirVista(ctx, vistaPedida);
  if (elegida && elegida.lectura.columnas.length < 2) throw new Error(`La vista "${elegida.vista.titulo}" no tiene suficientes columnas verificables. Confirma la estructura del área abierta; no usaré columnas de otro módulo.`);
  if (elegida && elegida.lectura.columnas.length >= 2) {
    const {lectura, vista, k} = elegida;
    ctx.memoria = memoriaParaModulo(ctx.memoria, numeroModulo(vista.titulo) ? vista.titulo : ctx.nombreDocumento?.());
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

// ¿El valor está en lo que escribió el usuario? Números como número ("2.5" = "2.50"); el resto
// como palabra ("S2", "A2", zona "3"). Sin pedido conocido (pruebas, panel) se acepta.
function dichoPorElUsuario(valor, ctx) {
  const pedido = ctx?.memoria?.ultimoPedido;
  if (pedido === undefined) return true;
  const n = Number(String(valor).replace(",", "."));
  if (Number.isFinite(n)) return [...pedido.matchAll(/\d+(?:[.,]\d+)?/g)].some((m) => Math.abs(Number(m[0].replace(",", ".")) - n) < 1e-9);
  const palabras = new Set(pedido.toLowerCase().split(/[^a-z0-9áéíóúñ]+/i).filter(Boolean));
  return palabras.has(String(valor).toLowerCase());
}

// Guarda en el panel los datos que vinieron en el pedido; devuelve qué se guardó y qué no sirvió.
function guardarDatos(args, ctx) {
  const todos = Object.fromEntries(CAMPOS_CHAT.map((c) => [c.campo, args?.[c.campo]]).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== ""));
  // Datos que el modelo agregó sin que el usuario los dijera: no se guardan (se avisa).
  const inventados = Object.keys(todos).filter((k) => !dichoPorElUsuario(todos[k], ctx));
  const dados = Object.fromEntries(Object.entries(todos).filter(([k]) => !inventados.includes(k)));
  if (ctx?.memoria) ctx.memoria.avisoInventados = inventados.length ? `No usé ${inventados.map((k) => ETIQUETA[k] ?? k).join(", ")}: no los indicaste en tu pedido.` : null;
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

// Lo que el agente todavía no dibuja (para que el ingeniero sepa qué pedir o completar).
const AUN_NO_DIBUJA = [
  "secciones VB, canaleta y correas en los pórticos",
  "cuadro de vigas y metrados",
];
const RÓTULO_CLAVE = [["proyecto", "proyecto"], ["entidad", "entidad"], ["especialista", "especialista"], ["cip", "CIP"]];

// Pares de textos encimados entre los textos dados (medidos como los dibuja el visor).
function textosEncimados(textos) {
  const cajas = textos.map((e) => cajaTexto(e)).filter(Boolean);
  let pares = 0;
  for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) if (seEncima(cajas[i], cajas[j])) pares++;
  return pares;
}

export const ESTRUCTURA_SKILLS = [
  {
    name: "revisar_laminas",
    description: "Revisa las láminas de estructuras que dibujó el agente y da un informe corto para el ingeniero: textos encimados (con corregir=true los separa), datos del proyecto que faltan y lo que el agente aún no dibuja. Úsalo si piden revisar las láminas, corregir textos encimados o saber qué falta.",
    parameters: {type: "object", properties: {
      corregir: {type: "boolean", description: "true para separar los textos encimados (achica la letra lo necesario)"},
    }},
    async run(args, ctx) {
      const propias = ctx.entidadesDelAgente?.() ?? [];
      if (!propias.length) return {ok: true, mensaje: "No hay láminas del agente en este plano. Pide \"genera el plano de estructuras\" y luego las reviso."};
      const vistas = Object.keys(ctx.generaciones?.() ?? {}).map((k) => k.replace(/^laminas:/, ""));
      const textos = propias.filter((e) => /^(M?TEXT)$/i.test(String(e.dxfTypeName)));
      const antes = textosEncimados(textos);
      let corregidos = 0, despues = antes;
      if (args.corregir && antes) {
        corregidos = ctx.modificar("Agente: separar textos encimados", textos.map((e) => e.objectId), (abiertas) => desencimarTextos(abiertas).achicados);
        despues = textosEncimados(ctx.entidadesDelAgente().filter((e) => /^(M?TEXT)$/i.test(String(e.dxfTypeName))));
      }
      const datos = ctx.datosProyecto?.() ?? {};
      const t = datosTecnicos(datos);
      const faltanDatos = [["hz", "Hz"], ["df", "Df"], ["zona", "zona sísmica"], ["suelo", "perfil de suelo"], ["categoria", "categoría"]].filter(([k]) => t[k] === null).map(([, n]) => n);
      const faltanRotulo = RÓTULO_CLAVE.filter(([k]) => !String(datos[k] ?? "").trim()).map(([, n]) => n);
      const lineas = [
        `Revisé las láminas del agente${vistas.length ? ` (${vistas.join(", ")})` : ""}:`,
        `- Textos encimados: ${antes ? (args.corregir ? `${antes} pares; separé ${corregidos} textos${despues ? `, quedan ${despues} pares` : ""}` : `${antes} pares (pídeme "corrige los encimados")`) : "ninguno"}.`,
        `- Datos del proyecto que faltan: ${faltanDatos.length ? `${faltanDatos.join(", ")} (uso el criterio del despacho y lo aviso en las láminas)` : "ninguno"}.`,
        `- Rótulo sin: ${faltanRotulo.length ? `${faltanRotulo.join(", ")} (complétalo en ▤ o dímelo)` : "nada pendiente"}.`,
        ctx.memoria.paqueteLaminas?.origen === 'composición desde el plano actual'
          ? `- Pendientes del paquete actual: ${ctx.memoria.paqueteLaminas.pendientes?.join('; ') || 'sin pendientes registrados; esta revisión no valida el cálculo estructural'}.`
          : `- Aún no dibujo: ${AUN_NO_DIBUJA.join("; ")}.`,
      ];
      return {ok: true, mensaje: lineas.join("\n"), encimados: despues, corregidos};
    },
  },
  {
    name: "quitar_laminas",
    description: "Quita del dibujo las láminas de estructuras que dibujó el agente (solo las suyas; la arquitectura y lo que dibujó el usuario no se tocan). Úsalo si el usuario pide borrar o limpiar las láminas.",
    parameters: {type: "object", properties: {}},
    async run(args, ctx) {
      const antes = ctx.generaciones?.() ?? {};
      const n = ctx.borrarGeneracion?.(null) ?? 0;
      for (const k of ['ultimaGeneracion', 'modeloEstructural', 'paqueteLaminas', 'metrado', 'ubicacionesPlanos']) delete ctx.memoria[k];
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
    description: "Guarda o consulta los datos del proyecto que usan las láminas de estructuras: Hz y Df del estudio de suelos, zona sísmica, perfil de suelo, categoría y ubicación (distrito → zona sísmica E.030). Úsalo cuando el usuario dé o pregunte esos datos (también Hz y Df: NO uses corregir_estructura para ellos).",
    parameters: {type: "object", properties: {...PARAMETROS_DATOS,
      ubicacion: {type: "string", description: "Ubicación tal como la dijo el usuario (distrito, provincia, departamento, localidad)"},
      distrito: {type: "string", description: "Solo al elegir una opción de ubicación: 'DEPARTAMENTO/PROVINCIA/DISTRITO'"},
    }},
    async run(args, ctx) {
      const {guardados, invalidos} = guardarDatos(args, ctx);
      // Ubicación → zona sísmica por la tabla de la E.030 (sin IA). Si el texto es ambiguo o se
      // contradice (distrito que no está en el departamento nombrado), se pregunta con botones.
      const ubic = [];
      let opcionesUbicacion = null;
      if (args.distrito || args.ubicacion) {
        const r = args.distrito ? await buscarUbicacion(String(args.distrito).split("/").reverse().join(" "), null) : await buscarUbicacion(args.ubicacion);
        const elegido = args.distrito ? r.candidatos.find((c) => `${c.departamento}/${c.provincia}/${c.distrito}` === args.distrito) ?? r.unico : r.unico;
        if (elegido) {
          const zonaDicha = guardados.includes("zona") ? Number(ctx.datosProyecto?.().zona) : null;
          ctx.guardarDatosProyecto?.({region: elegido.departamento, provincia: elegido.provincia, distrito: elegido.distrito, ...(zonaDicha && zonaDicha !== elegido.zona ? {} : {zona: String(elegido.zona)})});
          ubic.push(zonaDicha && zonaDicha !== elegido.zona
            ? `Ojo: dijiste zona ${zonaDicha}, pero ${textoUbicacion(elegido)} según la E.030. Dejé la zona ${zonaDicha}; confírmala.`
            : `Ubicación: ${textoUbicacion(elegido)} (E.030); la guardé con su zona.`);
        } else if (r.candidatos.length) {
          ubic.push(r.contradice
            ? `La ubicación no cuadra: ${r.candidatos.map(textoUbicacion).join(" o ")}. ¿Cuál es?`
            : `Hay más de un lugar con ese nombre: ¿cuál es?`);
          opcionesUbicacion = r.candidatos.map((c) => ({texto: textoUbicacion(c), herramienta: "datos_proyecto", args: {distrito: `${c.departamento}/${c.provincia}/${c.distrito}`}}));
        } else {
          ubic.push("No encontré ese distrito en la tabla de la E.030: elígelo en ▤ Datos del proyecto.");
        }
      }
      // Categoría sugerida por el uso de la arquitectura (si no la dio): se propone, no se impone.
      let sugerencia = null;
      if (!String(ctx.datosProyecto?.().categoria ?? "").trim()) {
        try {
          const textos = ctx.readPlan().items.filter((it) => it.tipo === "texto" && it.texto).map((it) => it.texto);
          sugerencia = categoriaPorUso(textos);
        } catch { /* sin plano abierto */ }
      }
      // Hz y Df del estudio de suelos distintos a lo que propuso el agente: también se aprenden.
      const propuesta = ctx.memoria?.propuesta?.propuesta;
      for (const clave of guardados.filter((k) => k === "hz" || k === "df")) {
        const v = Number(String(args[clave]).replace(",", "."));
        if (propuesta && Number.isFinite(v) && Math.abs((propuesta.decisiones[clave]?.valor ?? -1) - v) > 0.005) await aprender(ctx, {clave, valor: v, motivo: "estudio de suelos"});
      }
      const {tiene, faltan, sismo} = textoDatos(ctx.datosProyecto?.() ?? {});
      return {
        ok: true,
        mensaje: `${guardados.length ? `Guardé ${guardados.map((k) => ETIQUETA[k]).join(", ")} en Datos del proyecto. ` : ""}` +
          `${ubic.length ? `${ubic.join(" ")} ` : ""}` +
          `${sugerencia ? `Categoría sugerida: ${sugerencia.categoria} (${sugerencia.porque}); confírmala. ` : ""}` +
          `${tiene.length ? `Datos del proyecto: ${tiene.join(", ")}${sismo.length ? ` (${sismo.join(", ")})` : ""}.` : "Aún no hay datos del proyecto."}` +
          `${faltan.length ? ` Faltan: ${faltan.join(", ")}; sin ellos uso el criterio del despacho y lo aviso.` : ""}` +
          `${guardados.length ? " Pide \"genera el plano de estructuras\" para rehacer las láminas con estos datos." : ""}`,
        avisos: [...(invalidos.length ? [`No guardé (fuera de rango o mal escrito): ${invalidos.join("; ")}.`] : []), ...(ctx.memoria?.avisoInventados ? [ctx.memoria.avisoInventados] : [])],
        ...(opcionesUbicacion ? {opciones: opcionesUbicacion}
          : sugerencia ? {opciones: [{texto: `Sí, categoría ${sugerencia.categoria}`, recomendada: true, herramienta: "datos_proyecto", args: {categoria: sugerencia.categoria}}, ...["A2", "B", "C"].filter((c) => c !== sugerencia.categoria).map((c) => ({texto: `Categoría ${c}`, herramienta: "datos_proyecto", args: {categoria: c}}))]}
          : {}),
      };
    },
  },
  {
    name: "proponer_estructura",
    description: "Analiza la arquitectura abierta (niveles, ejes, luces, columnas, techo) y propone la estructura como lo haría el despacho: cimentación, losa y su espesor, losas de entrepiso, concreto, columnas. Dice qué decide el agente y qué queda para el ingeniero. Úsalo cuando pidan analizar, proponer o decidir la estructura de un plano.",
    parameters: {type: "object", properties: {}},
    async run(args, ctx) {
      if (!ctx.readPlan().vistas.length) return {ok: false, error: "No encontré plantas con ejes con nombre en el plano abierto."};
      const {rasgos, propuesta} = await propuestaDelPlano(ctx);
      return {ok: true, mensaje: textoPropuesta(rasgos, propuesta)};
    },
  },
  {
    name: "metrar_estructura",
    description: "Saca el metrado de estructuras (movimiento de tierras, concreto simple, concreto armado: concreto, encofrado, acero, curado, ladrillo de techo) de la estructura que dibujó el agente, con el formato de la planilla del despacho. Con excel=true descarga la planilla .xlsx. Úsalo cuando pidan metrado, metrar, cantidades o planilla de metrados.",
    parameters: {type: "object", properties: {
      excel: {type: "boolean", description: "true para descargar la planilla de metrados en Excel"},
    }},
    async run(args, ctx) {
      // Flujo: arquitectura → estructura → metrado. Sin estructura dibujada, se genera primero.
      let generado = "";
      if (!ctx.memoria.modeloEstructural) {
        const r = await ESTRUCTURA_SKILLS.find((s) => s.name === "plano_estructuras").run({}, ctx);
        if (!ctx.memoria.modeloEstructural) return {ok: false, error: r.error ?? "Primero necesito generar el plano de estructuras desde la arquitectura."};
        generado = `Generé primero las láminas ${(r.laminas ?? []).join(", ")}. `;
      }
      // No parte de cero: la terminología del despacho y las correcciones que hizo al metrado de
      // un plano parecido.
      const eventos = [...EVENTOS_USO, ...await (ctx.eventosDeUso ?? eventosDeUso)()];
      const met = metradoEstructuras(ctx.memoria.modeloEstructural, {terminos: terminosAprendidos(eventos)});
      const rasgos = ctx.memoria.propuesta?.rasgos ?? (await propuestaDelPlano(ctx).catch(() => ({}))).rasgos ?? null;
      const corregidas = aplicarCorrecciones(met, eventos, rasgos);
      met.rasgos = rasgosParaGuardar(rasgos ?? {});
      ctx.memoria.metrado = met;
      const tot = (re) => met.partidas.filter((p) => !p.titulo && re.test(p.item)).reduce((s, p) => s + p.total, 0);
      const r2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
      let excel = "";
      if (args.excel) {
        const nombre = `METRADOS_ESTRUCTURAS_${String(met.proyecto ?? "PROYECTO").replace(/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]+/g, "_").slice(0, 40)}.xlsx`;
        await (ctx.descargarPlanilla ?? descargarPlanilla)(met, nombre, {datos: ctx.datosProyecto?.() ?? {}});
        excel = ` Descargué la planilla ${nombre}.`;
      }
      return {
        ok: true,
        mensaje: `${generado}Metrado de estructuras de ${met.proyecto ?? "el proyecto"} (${met.partidas.filter((p) => !p.titulo).length} partidas): ` +
          `excavación ${r2(met.resumen.excavacion)} m³; concreto ${r2(met.resumen.concreto)} m³ (cimentación ${r2(tot(/^02\.03\.0[12]\.01$/))}, columnas ${r2(tot(/^02\.03\.06\.01\.01$/))}, vigas ${r2(tot(/^02\.03\.07\.01\.01$/))}, losa ${r2(tot(/^02\.03\.11\.01$/))}); ` +
          `acero ${r2(met.resumen.acero)} kg; encofrado ${r2(met.resumen.encofrado)} m².${corregidas ? ` Apliqué ${corregidas} corrección(es) que el despacho hizo en un plano parecido.` : ""}${excel}`,
        avisos: met.notas,
      };
    },
  },
  {
    name: "corregir_estructura",
    description: "Anota una corrección del ingeniero a una decisión de la estructura propuesta (cimentación, tipo o espesor de losa, losa en el último nivel, f'c, estribos, Hz, Df…). El agente la aprende para este plano y los parecidos. Úsalo cuando el ingeniero diga que algo de la propuesta o de las láminas es distinto (ej. 'la losa es maciza', 'usa zapatas', 'el aligerado es de 20').",
    parameters: {type: "object", properties: {
      decision: {type: "string", enum: Object.keys(DECISIONES), description: "Qué decisión corrige"},
      valor: {type: "string", description: "El valor correcto, como lo dijo el ingeniero (ej. 'maciza', '0.20', 'zapatas', 'no')"},
      motivo: {type: "string", description: "Opcional: el motivo, solo si el ingeniero lo dijo"},
    }, required: ["decision", "valor"]},
    async run(args, ctx) {
      const clave = args.decision;
      if (!(clave in DECISIONES)) return {ok: false, error: `No conozco la decisión "${clave}".`};
      const valor = valorDeDecision(clave, args.valor);
      if (valor === null) return {ok: false, error: `No entendí el valor "${args.valor}" para ${DECISIONES[clave].nombre}.`};
      // Hz y Df son datos del estudio de suelos: van a Datos del proyecto (no se "corrigen").
      if (clave === "hz" || clave === "df") {
        guardarDatos({[clave]: String(valor)}, ctx);
        return {ok: true, mensaje: `Guardé ${ETIQUETA[clave]} = ${valor} en Datos del proyecto (estudio de suelos). Las láminas lo usan al rehacerlas.`};
      }
      // El motivo solo se aprende si salió del ingeniero (un modelo chico copiaba el ejemplo).
      const pedido = String(ctx.memoria?.ultimoPedido ?? "").toLowerCase();
      const palabras = String(args.motivo ?? "").toLowerCase().split(/[^a-z0-9áéíóúñ]+/i).filter((w) => w.length > 3);
      const motivo = palabras.length && (ctx.memoria?.ultimoPedido === undefined || palabras.filter((w) => pedido.includes(w)).length >= palabras.length / 2) ? args.motivo : null;
      const {propuesto} = await aprender(ctx, {clave, valor, motivo});
      delete ctx.memoria.propuesta; // la próxima propuesta ya la incluye
      delete ctx.memoria.preguntaAbierta; // si respondía a una pregunta del agente, ya está
      (ctx.memoria.decisionesSesion ??= []).push({clave, valor, porque: motivo});
      const v = typeof valor === "boolean" ? (valor ? "sí" : "no") : valor;
      return {ok: true, mensaje: `Anoté ${DECISIONES[clave].nombre}: ${v}${propuesto !== null && propuesto !== valor ? ` (yo había propuesto ${typeof propuesto === "boolean" ? (propuesto ? "sí" : "no") : propuesto})` : ""}. Lo aplico en este plano y lo tendré en cuenta en los parecidos. Pide "genera el plano de estructuras" para rehacer las láminas.`};
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
      delete ctx.memoria.avisoVista;
      // Las ediciones manuales del CAD también pueden haber cambiado las entradas.
      delete ctx.memoria.lectura;
      const e = leerEstructura(ctx, "", args.vista);
      // Antes de dibujar, el panel muestra los datos del proyecto en un formulario, ya llenos con
      // lo guardado y con lo que propone el agente (Hz, Df y niveles de proyectos parecidos); el
      // personal los revisa o corrige y recién ahí se arma el plano. Cancelar no dibuja nada.
      // Lo que el agente no tiene seguro se le pregunta al ingeniero en el mismo formulario
      // (consultas.js); sin panel se dibuja con la recomendación y se le explica en el mensaje.
      ctx.memoria.consultas = null;
      if (e.ejesNombrados) {
        const {rasgos, propuesta} = await propuestaDelPlano(ctx).catch(() => ({}));
        const {items} = ctx.readPlan();
        const ambientes = (() => { try { return ambientesDeLosa({lectura: {columnas: e.columnas, ejes: e.ejesNombrados}, items, k: e.escala}); } catch { return []; } })();
        const datosAntes = ctx.datosProyecto?.() ?? {};
        const niveles = Number(datosAntes.niveles) > 0 ? Number(datosAntes.niveles) : rasgos?.niveles ?? 1;
        // Lo que ya decidió el ingeniero en el pedido (cimentacion) no se vuelve a preguntar.
        const c = consultasDelPlano({rasgos, propuesta, ambientes, niveles, suelo: datosAntes.suelo, pendienteAnotada: pendienteAnotadaEn(items)});
        c.consultas = c.consultas.filter((x) => !(x.clave === "cimentacion" && ["platea", "zapatas"].includes(args.cimentacion)));
        let respuestas = {};
        const guiada = ctx.memoria.construccion?.respuestas;
        const t = datosTecnicos(datosAntes);
        const faltanTecnicos = ["hz", "df", "zona", "suelo", "categoria"].filter((k) => t[k] === null);
        // Decisiones ya respondidas en este plano: no se vuelven a preguntar.
        const previas = ctx.memoria.respuestasFormulario ?? {};
        const nuevas = c.consultas.filter((q) => !(q.clave in previas));
        // Haber abierto el formulario antes no confirma los campos que siguen vacíos.
        const abrir = Boolean(ctx.pedirDatos) && (faltanTecnicos.length > 0 || nuevas.length > 0);
        if (guiada && !abrir) respuestas = Object.fromEntries(Object.entries(guiada).filter(([k]) => c.consultas.some((q) => q.clave === k)));
        else if (!abrir) respuestas = Object.fromEntries(Object.entries(previas).filter(([k]) => c.consultas.some((q) => q.clave === k)));
        else {
          const faltan = [...faltanTecnicos, ...["proyecto", "entidad", "especialista", "cip"].filter((k) => !String(datosAntes[k] ?? "").trim())];
          const d = propuesta?.decisiones ?? {};
          const sugeridos = {hz: d.hz?.valor, df: d.df?.valor, niveles: rasgos?.niveles};
          const nuevos = await ctx.pedirDatos({faltan, sugeridos, vista: e.titulo || e.vista, consultas: c.consultas, informes: c.informes});
          if (!nuevos) return {ok: false, cancelado: true, error: "cancelaste los datos del proyecto, así que no dibujé nada"};
          const {decisiones, ...datos} = nuevos;
          respuestas = {...guiada, ...decisiones};
          ctx.memoria.respuestasFormulario = {...previas, ...respuestas};
          const llenos = Object.fromEntries(Object.entries(datos).filter(([, v]) => String(v ?? "").trim() !== ""));
          if (Object.keys(llenos).length) ctx.guardarDatosProyecto?.(llenos);
        }
        const faltantes = datosTecnicosFaltantes(ctx.datosProyecto?.() ?? {});
        ctx.memoria.formularioConfirmado = faltantes.length === 0;
        if (ctx.pedirDatos && faltantes.length) return {
          ok: false, terminal: true,
          error: `faltan datos técnicos válidos: ${faltantes.join(', ')}. Completa los datos del proyecto antes de generar; conservé las láminas existentes`,
        };
        const {elegido, eventos: respondidos} = aplicarRespuestas(c.consultas, respuestas);
        const eventos = respondidos.filter((ev) => ctx.memoria.decisionesSesion?.findLast((d) => d.clave === ev.clave)?.valor !== ev.valor);
        // Lo que eligió el ingeniero se aprende (queda pendiente de aprobación en el servidor).
        for (const ev of eventos) {
          try { await (ctx.registrarAprendizaje ?? registrarEvento)({...ev, motivo: null, rasgos: rasgosParaGuardar(rasgos ?? {})}); } catch { /* sin servidor: igual se dibuja */ }
        }
        if (eventos.length) delete ctx.memoria.propuesta;
        for (const ev of eventos) (ctx.memoria.decisionesSesion ??= []).push({clave: ev.clave, valor: ev.valor, porque: null});
        ctx.memoria.consultas = {...c, elegido, respondidas: Object.keys(respuestas).length > 0};
      }
      // Rehacer en su lugar: se quitan las láminas que el agente dibujó antes para esta
      // vista (marcadas en el dibujo), en vez de apilar otras debajo.
      const clave = `laminas:${e.titulo || e.vista}`;
      const lectura = ctx.readPlan();
      // La geometría generada queda fuera de las entradas: dibujar no cambia la arquitectura.
      const firma = firmaDeGeneracion({arquitectura: lectura.itemsArquitectura ?? lectura.items, titulo: e.titulo || e.vista,
        datos: ctx.datosProyecto?.() ?? {}, cimentacion: args.cimentacion ?? 'auto',
        decisiones: ctx.memoria.consultas?.elegido ?? {}, decisionesSesion: ctx.memoria.decisionesSesion ?? []});
      if (!args.conservar && ctx.memoria.ultimaGeneracion?.clave === clave && ctx.memoria.ultimaGeneracion.firma === firma
          && (ctx.generaciones?.()[clave] ?? 0) > 0) return {
        ok: true, sinCambios: true, terminal: true,
        mensaje: 'No regeneré las láminas: la arquitectura, los datos y las decisiones siguen iguales. Repetir este pedido produce el mismo dibujo. Indica qué medida o decisión debe cambiar; los detalles que el generador no implementa requieren ampliar el generador.',
      };
      const quitadas = args.conservar ? 0 : (ctx.borrarGeneracion?.(clave) ?? 0);
      ctx.iniciarGeneracion?.(clave);
      try {
        const resultado = await generarLaminas(args, ctx, {e, guardados, invalidos, quitadas});
        if (resultado.ok) {
          ctx.memoria.ultimaGeneracion = {clave, firma};
          delete ctx.memoria.metrado;
        }
        return {...resultado, terminal: true};
      }
      finally { ctx.cerrarGeneracion?.(clave); }
    },
  },
  {
    name: "construir_estructura",
    description: "Construcción guiada paso a paso (lectura → suelo → cimentación → losas → dibujo): en cada etapa informa lo que leyó y decidió con su respaldo y pregunta SOLO lo dudoso, una pregunta a la vez, antes de dibujar. Úsalo para 'construye la estructura', 'paso a paso', 'guíame', o para responder la pregunta pendiente de la construcción (accion 'responder' con clave y valor).",
    parameters: {type: "object", properties: {
      accion: {type: "string", enum: ["iniciar", "responder", "dibujar"], description: "iniciar (por defecto), responder la pregunta pendiente, o dibujar ya con lo recomendado"},
      clave: {type: "string", description: "Al responder: la clave de la pregunta pendiente (está en el estado)"},
      valor: {type: "string", description: "Al responder: el valor elegido por el ingeniero"},
      vista: {type: "string", description: "Opcional al iniciar: vista de arquitectura"},
    }},
    async run(args, ctx) {
      const accion = args.accion ?? "iniciar";
      if (accion === "iniciar" || !ctx.memoria.construccion) return iniciarConstruccion(args, ctx);
      const k = ctx.memoria.construccion;
      if (accion === "responder") {
        const p = k.pendiente;
        if (!p) return {ok: false, error: "No hay ninguna pregunta pendiente en la construcción."};
        if (args.clave && args.clave !== p.clave) return {ok: false, error: `La pregunta pendiente es "${p.pregunta}" (${p.clave}).`};
        const op = p.opciones.find((o) => String(o.valor).toLowerCase() === String(args.valor ?? "").trim().toLowerCase())
          ?? p.opciones.find((o) => o.texto.toLowerCase().startsWith(String(args.valor ?? "").trim().toLowerCase()));
        if (!op) return {ok: false, error: `"${args.valor}" no es una opción: ${p.opciones.map((o) => o.valor).join(", ")}.`};
        registrarRespuesta(ctx, p, op.valor);
        k.hechas.push(`${p.corta ?? p.pregunta} → ${op.texto}`);
      } else if (accion === "dibujar") {
        k.saltar = true;
      }
      return avanzarConstruccion(ctx);
    },
  },
];

// ¿La arquitectura escribe la pendiente del techo (PTE=33 %, PENDIENTE 25 %)? Una pendiente de piso
// (S=0.5 %) no cuenta: menos de 5 % no es un techo inclinado.
function pendienteAnotadaEn(items = []) {
  return items.some((it) => {
    if (it.tipo !== "texto") return false;
    const m = /(?:PTE|PEND(?:IENTE)?)\.?\s*[=:]?\s*(\d+(?:[.,]\d+)?)\s*%/i.exec(it.texto ?? "");
    return Boolean(m) && Number(m[1].replace(",", ".")) >= 5;
  });
}

// ---- Construcción guiada ----
// Etapas en orden; cada una informa lo decidido y pregunta lo dudoso (una pregunta por vez: menos
// fatiga, y cada respuesta puede cambiar la siguiente pregunta). Al final dibuja con todo lo decidido.
const ETAPAS_CONSTRUCCION = [
  {id: "lectura", titulo: "Lectura de la arquitectura"},
  {id: "suelo", titulo: "Suelo y cimentación"},
  {id: "losas", titulo: "Losas y techo"},
  {id: "dibujo", titulo: "Dibujo de las láminas"},
];
const CLAVES_ETAPA = {suelo: ["cimentacion", "mallaCimentacion"], losas: ["losaMaciza", "espesorLosa", "losaDeTecho", "techoDosAguas"]};
const CORTAS = {techoDosAguas: "Techo a dos aguas", niveles: "Niveles", categoria: "Categoría", suelo: "Perfil de suelo", cimentacion: "Cimentación", mallaCimentacion: "Acero de cimentación", losaMaciza: "Losa maciza en baños", espesorLosa: "Espesor de aligerado", losaDeTecho: "Losa en el techo"};

function registrarRespuesta(ctx, p, valor) {
  const k = ctx.memoria.construccion;
  if (p.dato) {
    // Niveles y suelo son datos del proyecto (los eligió el ingeniero con un botón).
    ctx.guardarDatosProyecto?.({[p.clave]: String(valor)});
    k.datos[p.clave] = valor;
  } else {
    k.respuestas[p.clave] = valor;
  }
  (ctx.memoria.decisionesSesion ??= []).push({clave: p.clave, valor, porque: null});
  k.pendiente = null;
}

async function iniciarConstruccion(args, ctx) {
  const e = leerEstructura(ctx, "", args.vista);
  if (!e.ejesNombrados) return {ok: false, error: "Para construir paso a paso necesito una planta con ejes con nombre (burbujas con rótulo)."};
  const {rasgos, propuesta} = await propuestaDelPlano(ctx);
  ctx.memoria.construccion = {etapa: 0, vista: args.vista ?? null, respuestas: {}, datos: {}, hechas: [], pendiente: null, consultas: null, rasgos, propuesta};
  return avanzarConstruccion(ctx);
}

// Decisiones que el agente toma solo (con respaldo) en una etapa: se informan, no se preguntan.
function decididoEnEtapa(propuesta, claves) {
  const d = propuesta?.decisiones ?? {};
  return claves.filter((c) => d[c] && !d[c].ingeniero && d[c].valor !== null && d[c].valor !== undefined).map((c) => {
    const v = typeof d[c].valor === "boolean" ? (d[c].valor ? "sí" : "no") : d[c].valor;
    return `${CORTAS[c] ?? c}: ${v} (${Math.round((d[c].confianza ?? 0) * 100)} % de confianza)`;
  });
}

async function avanzarConstruccion(ctx) {
  const k = ctx.memoria.construccion;
  const datos = ctx.datosProyecto?.() ?? {};
  const e = ctx.memoria.estructura;
  const informe = [];
  while (k.etapa < ETAPAS_CONSTRUCCION.length) {
    const etapa = ETAPAS_CONSTRUCCION[k.etapa];
    let pregunta = null;
    if (k.saltar && etapa.id !== "dibujo") { k.etapa++; continue; }
    if (etapa.id === "lectura") {
      if (!k.leida) {
        const tipos = new Set((e.columnas ?? []).map((c) => c.tipo)).size;
        const ejes = e.ejesNombrados ? Object.values(e.ejesNombrados).flat?.().length ?? 0 : 0;
        informe.push(`Leí "${e.titulo || e.vista}": ${e.columnas?.length ?? 0} columnas (${tipos} tipo(s))${e.columnetas?.length ? `, ${e.columnetas.length} columnetas` : ""}${ejes ? `, ${ejes} ejes` : ""}.`);
        k.leida = true;
      }
      const n = Number(datos.niveles) > 0 ? Number(datos.niveles) : null;
      if (!n && !("niveles" in k.datos)) {
        const leidos = Math.max(1, k.rasgos?.niveles ?? 1);
        pregunta = {clave: "niveles", dato: true, pregunta: `Leí ${leidos} nivel(es) en la arquitectura. ¿Cuántos niveles tiene el edificio?`,
          porque: "Define losas de entrepiso, techo y cargas.", recomendado: leidos,
          opciones: [...new Set([leidos, leidos + 1, Math.max(1, leidos - 1)])].map((v) => ({valor: v, texto: `${v} nivel(es)`}))};
      }
    } else if (etapa.id === "suelo") {
      // Categoría: la propone el uso de la arquitectura (aulas → colegio → A2); la confirma él.
      if (!String(datos.categoria ?? "").trim() && !("categoria" in k.datos)) {
        const textos = (() => { try { return ctx.readPlan().items.filter((it) => it.tipo === "texto" && it.texto).map((it) => it.texto); } catch { return []; } })();
        const sug = categoriaPorUso(textos);
        pregunta = {clave: "categoria", dato: true, pregunta: "¿Qué categoría tiene la edificación (E.030)?",
          porque: sug ? `Propongo ${sug.categoria}: ${sug.porque}.` : "Define el factor de uso U.", recomendado: sug?.categoria ?? null,
          opciones: [{valor: "A2", texto: "A2 esencial (colegio, salud)"}, {valor: "B", texto: "B importante"}, {valor: "C", texto: "C común (vivienda, oficina)"}]};
      }
      if (!pregunta && !String(datos.zona ?? "").trim() && !k.avisoZona) {
        informe.push("Falta la zona sísmica: escríbeme el distrito (por ejemplo \"distrito de Vinchos, Ayacucho\") y la saco de la E.030.");
        k.avisoZona = true;
      }
      if (!pregunta && !String(datos.suelo ?? "").trim() && !("suelo" in k.datos)) {
        pregunta = {clave: "suelo", dato: true, pregunta: "¿Qué perfil de suelo da el estudio de suelos (E.030)?",
          porque: "Con suelo blando (S3) el despacho prefiere platea; con suelo firme, zapatas en módulos grandes.", recomendado: null,
          opciones: [{valor: "S1", texto: "S1 roca o suelo rígido"}, {valor: "S2", texto: "S2 suelo intermedio"}, {valor: "S3", texto: "S3 suelo blando"}, {valor: "", texto: "Aún no hay EMS (uso el criterio del despacho)"}]};
      }
    }
    // Consultas de la etapa (las calcula consultas.js con lo ya respondido: niveles y suelo).
    if (!pregunta && CLAVES_ETAPA[etapa.id]) {
      if (!k.consultas) {
        const {items} = ctx.readPlan();
        const ambientes = (() => { try { return ambientesDeLosa({lectura: {columnas: e.columnas, ejes: e.ejesNombrados}, items, k: e.escala}); } catch { return []; } })();
        const niveles = Number(k.datos.niveles ?? datos.niveles) || k.rasgos?.niveles || 1;
        k.consultas = consultasDelPlano({rasgos: {...k.rasgos, niveles}, propuesta: k.propuesta, ambientes, niveles, suelo: k.datos.suelo ?? datos.suelo, pendienteAnotada: pendienteAnotadaEn(items)});
        k.informesLosa = k.consultas.informes;
      }
      if (!k[`informado_${etapa.id}`]) {
        const dec = decididoEnEtapa(k.propuesta, CLAVES_ETAPA[etapa.id].filter((c) => !k.consultas.consultas.some((q) => q.clave === c)));
        if (dec.length) informe.push(`${etapa.titulo} — decidí con proyectos parecidos: ${dec.join("; ")}.`);
        if (etapa.id === "losas") informe.push(...(k.informesLosa ?? []));
        k[`informado_${etapa.id}`] = true;
      }
      const q = k.consultas.consultas.find((x) => CLAVES_ETAPA[etapa.id].includes(x.clave) && !(x.clave in k.respuestas));
      if (q) pregunta = {...q, opciones: q.opciones.map((o) => ({...o}))};
    }
    if (pregunta) {
      k.pendiente = {...pregunta, corta: CORTAS[pregunta.clave]};
      const rec = pregunta.opciones.find((o) => String(o.valor) === String(pregunta.recomendado));
      return {
        ok: true,
        mensaje: [`Paso ${k.etapa + 1}/${ETAPAS_CONSTRUCCION.length} · ${etapa.titulo}`, ...informe, pregunta.pregunta,
          rec ? `Recomiendo: ${rec.texto} — ${String(pregunta.porque ?? "").split(/(?<=\.)\s/)[0]}` : pregunta.porque].filter(Boolean).join("\n"),
        opciones: pregunta.opciones.map((o) => ({texto: o.texto, recomendada: rec === o, herramienta: "construir_estructura", args: {accion: "responder", clave: pregunta.clave, valor: String(o.valor)}})),
        etapa: etapa.id,
      };
    }
    if (etapa.id === "dibujo") {
      // Todo decidido: se dibuja con las respuestas (plano_estructuras no vuelve a preguntar).
      const plano = ESTRUCTURA_SKILLS.find((x) => x.name === "plano_estructuras");
      const r = await plano.run(k.vista ? {vista: k.vista} : {}, ctx);
      k.etapa = ETAPAS_CONSTRUCCION.length;
      const decidido = k.hechas.length ? [`Con tus decisiones: ${k.hechas.join("; ")}.`] : [];
      return r.ok === false ? r : {...r, mensaje: [`Paso ${ETAPAS_CONSTRUCCION.length}/${ETAPAS_CONSTRUCCION.length} · Dibujo`, ...informe, ...decidido, r.resumen ?? r.mensaje].filter(Boolean).join("\n"), resumen: undefined,
        opciones: [{texto: "Sacar el metrado", herramienta: "metrar_estructura", args: {}}, {texto: "Revisar las láminas", herramienta: "revisar_laminas", args: {}}]};
    }
    k.etapa++;
  }
  return {ok: true, mensaje: "La construcción ya terminó. Pide \"construye la estructura\" para empezar otra vez."};
}

async function generarLaminas(args, ctx, {e, guardados, invalidos, quitadas}) {
  const previo = [
    guardados.length ? `Guardé ${guardados.map((k) => ETIQUETA[k]).join(", ")} en Datos del proyecto.` : "",
    quitadas ? "Reemplacé las láminas anteriores." : "",
  ].filter(Boolean).join(" ");
  const extra = [...(ctx.memoria.avisoVista ? [ctx.memoria.avisoVista] : []), ...(ctx.memoria.avisoInventados ? [ctx.memoria.avisoInventados] : []), ...(invalidos.length ? [`No guardé (fuera de rango o mal escrito): ${invalidos.join("; ")}.`] : [])];
  {
    {
      if (!e.ejesNombrados) throw new Error("Para estructurar el plano necesito la planta de arquitectura con ejes con nombre (burbujas con rótulo, ej. 8, 10, Y´).");
      const {items} = ctx.readPlan();
      const moduloActual = numeroModulo(e.titulo) ?? numeroModulo(ctx.nombreDocumento?.());
      const tituloActual = numeroModulo(e.titulo) || !moduloActual ? e.titulo : `MÓDULO ${moduloActual} - ${e.titulo || 'PLANTA'}`;
      const lectura = {columnas: e.columnas, ejes: e.ejesNombrados, titulo: tituloActual, columnetas: e.listaColumnetas ?? []};
      // Con la plantilla del despacho: láminas iguales al expediente de referencia.
      const plantilla = await ctx.loadTemplate?.().catch(() => null);
      if (plantilla) {
        const k = e.escala;
        // La propuesta del agente (niveles, losa de techo) aprendida de los proyectos estudiados;
        // los niveles que el ingeniero dio en Datos del proyecto mandan.
        const datos = ctx.datosProyecto?.() ?? {};
        const {rasgos, propuesta} = await propuestaDelPlano(ctx);
        const niveles = Number(datos.niveles) > 0 ? Number(datos.niveles) : rasgos.niveles;
        const cimDecision = propuesta.decisiones.cimentacion;
        const consultas = ctx.memoria.consultas;
        const elegido = consultas?.elegido ?? {};
        // Lo consultado se dibuja con lo elegido o, sin respuesta, con la recomendación que se le
        // informa al ingeniero ("Usé: …"): el dibujo y el mensaje dicen lo mismo.
        const respondido = (clave) => clave in elegido;
        const decisionTecho = respondido("losaDeTecho") ? {losaTecho: elegido.losaDeTecho, aviso: consultas.respondidas ? null : undefined}
          : losaTechoParaGeneracion(niveles, propuesta.decisiones.losaDeTecho, niveles === rasgos.niveles);

        // Espesor de losa: el que eligió el ingeniero; si no, el cálculo por la luz, salvo corrección previa.
        const espLosa = respondido("espesorLosa") ? elegido.espesorLosa
          : /^lo corregiste/.test(propuesta.decisiones.espesorLosa?.regla ?? "") ? propuesta.decisiones.espesorLosa.valor : null;
        const losaTecho = decisionTecho.losaTecho;
        const geometriaAprendida = propuesta.geometriaAprendida ?? {};
        // Lo aprendido se dibuja si los casos coinciden (confianza ≥ 60 %), aunque quede para que el
        // ingeniero lo confirme; lo que él corrigió en otro plano parecido ya viene en la propuesta.
        const cimentacionAprendida = (cimDecision?.confianza ?? 0) >= 0.6 || datos.suelo
          ? cimentacionRecomendada(cimDecision, datos.suelo).valor : undefined;
        const cimentacionElegida = respondido("cimentacion") ? elegido.cimentacion : undefined;
        // Plantas de los niveles de arriba (tabiquería por nivel): la vista de cada nivel con más columnas.
        const plantasNiveles = [];
        if (niveles > 1) {
          for (const vista of ctx.readPlan().vistas) {
            const nivel = nivelDeTitulo(vista.titulo);
            if (!(nivel >= 2 && nivel <= niveles)) continue;
            try {
              const lv = leerVista(items, vista, escalaPorBurbuja(vista.radio));
              const l = {columnas: lv.columnas, ejes: lv.ejes, titulo: vista.titulo, columnetas: lv.listaColumnetas};
              const previa = plantasNiveles.find((x) => x.nivel === nivel);
              if (!previa) plantasNiveles.push({nivel, titulo: vista.titulo, lectura: l, caja: vista.caja, k: escalaPorBurbuja(vista.radio)});
              else if (l.columnas.length > previa.lectura.columnas.length) Object.assign(previa, {titulo: vista.titulo, lectura: l, caja: vista.caja, k: escalaPorBurbuja(vista.radio)});
            } catch { /* una vista ilegible no impide las láminas */ }
          }
        }
        // Pasillo en volado: las barandas del 2° nivel pasan más allá de las columnas.
        const planta2 = plantasNiveles.find((x) => x.nivel === 2);
        const volados = planta2 ? voladosDesdePlanta({lectura: planta2.lectura, items, k: planta2.k, caja: planta2.caja}) : [];
        const r = laminasConPlantilla({lectura, items, caja: e.caja, k, config: plantilla.config, cimentacion: args.cimentacion ?? cimentacionElegida ?? cimentacionAprendida, datos, estructura: {
          formatoReferencia: formatoDeReferencia(ctx.referenciaActual?.()?.referencia),
          niveles, losaTecho, espesorLosa: espLosa, textosOcultos: ctx.readPlan().textosOcultos, plantasNiveles, volados,
          ...(respondido("techoDosAguas") ? {techoDosAguas: elegido.techoDosAguas} : {}),
          // Biblioteca de pórticos del despacho (opcional): si el contexto la trae, los pórticos se
          // adaptan del más parecido que dibujó el ingeniero (planos/porticoBiblioteca.js).
          ...(ctx.bibliotecaPorticos ? {bibliotecaPorticos: ctx.bibliotecaPorticos} : {}),
          // Biblioteca de detalles (cortes de cimiento, escalera, cuadros), también opcional.
          ...(ctx.bibliotecaDetalles ? {bibliotecaDetalles: ctx.bibliotecaDetalles} : {}),
          losaMaciza: "losaMaciza" in elegido ? elegido.losaMaciza : undefined,
          mallaCimentacion: "mallaCimentacion" in elegido ? elegido.mallaCimentacion
            : typeof propuesta.decisiones.mallaCimentacion?.valor === "boolean" ? propuesta.decisiones.mallaCimentacion.valor : false,
          casoSeleccionado: geometriaAprendida.casoSeleccionado ?? null,
          casoAprendido: geometriaAprendida.casoAprendido ?? null,
          geometriaAdaptada: false,
          patronGeometrico: null,
          motivoLimite: geometriaAprendida.motivoLimite ?? null,
          confianzaGeometria: geometriaAprendida.confianzaGeometria ?? 0,
          geometriaActual: geometriaAprendida.geometriaActual ?? null,
          gruposVerificados: geometriaAprendida.gruposVerificados ?? [],
          gruposNoVerificados: geometriaAprendida.gruposNoVerificados ?? ["ejes", "columnas", "murosVanos", "losas"],
          avisosRevision: [...(geometriaAprendida.avisosRevision ?? []), ...(decisionTecho.aviso ? [decisionTecho.aviso] : [])],
          sugeridos: {hz: propuesta.decisiones.hz?.valor, df: propuesta.decisiones.df?.valor, fuentes: [...new Set([...(propuesta.decisiones.hz?.fuentes ?? []), ...(propuesta.decisiones.df?.fuentes ?? [])].map(nombreVisible))]}
        }});
        // El modelo de lo dibujado queda para el metrado (metrar_estructura).
        ctx.memoria.modeloEstructural = r.modelo;
        ctx.memoria.paqueteLaminas = {cantidad: r.laminas.length, codigos: r.laminas.map((l) => l.codigo), formato: r.formato, pendientes: r.avisos.filter((a) => /pendiente|provisional/.test(a)), origen: r.usarPlantilla === false ? 'composición desde el plano actual' : 'plantilla de referencia explícita'};
        ctx.memoria.paqueteLaminas.secciones = r.secciones ?? [];
        ctx.memoria.porticosLocales = r.porticosLocales ?? [];
        ctx.memoria.detallesLocales = r.detallesLocales ?? [];
        // Ubicación de cada planta dibujada, en unidades del dibujo (metros × k).
        ctx.memoria.ubicacionesPlanos = (r.ubicaciones ?? []).map((u) => ({...u, caja: u.caja && {x0: u.caja.x0 * k, y0: u.caja.y0 * k, x1: u.caja.x1 * k, y1: u.caja.y1 * k}}));
        if (r.usarPlantilla !== false) ctx.insertTemplate(plantilla.db, {x: r.desplazamiento.x * k, y: r.desplazamiento.y * k}, k, null, r.textosPlantilla, r.excluirPlantilla);
        // Hojas extra de pórticos: copia de la lámina de pórticos de la plantilla.
        if (r.usarPlantilla !== false) for (const c of r.copias ?? []) ctx.insertTemplate(plantilla.db, {x: c.desplazamiento.x * k, y: c.desplazamiento.y * k}, k, c.marco, r.textosPlantilla, c.excluir);
        const z = r.zona;
        const lista = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}` : xs[0] ?? "");
        ctx.draw(r.primitivas, `Agente: láminas ${lista(r.laminas.map((l) => l.codigo))} de estructuras`, {unitsPerMeter: k, zoom: {x0: z.x0 * k, y0: z.y0 * k, x1: z.x1 * k, y1: z.y1 * k}});
        // Control de calidad antes de entregar: ningún texto encima de otro.
        const textosAgente = () => (ctx.entidadesDelAgente?.() ?? []).filter((x) => /^(M?TEXT)$/i.test(String(x.dxfTypeName)));
        const encimados = textosEncimados(textosAgente());
        if (encimados && ctx.modificar) {
          ctx.modificar("Agente: separar textos encimados", textosAgente().map((x) => x.objectId), (abiertas) => desencimarTextos(abiertas).achicados);
          const quedan = textosEncimados(textosAgente());
          if (quedan) extra.push(`Quedan ${quedan} pares de textos muy juntos; revísalos o pídeme "corrige los encimados".`);
        }
        const s = r.resumen;
        // Resumen para el ingeniero (lo que lee en el chat): lo esencial en pocas líneas. El
        // mensaje largo sigue para el modelo de IA y el detalle técnico.
        const m = r.modelo;
        const losaTxt = !m.losa || (m.niveles <= 1 && m.losaTecho === false) ? "techo de cobertura liviana (sin losa)"
          : `losa aligerada e=${s.aligerado.espesor.toFixed(2)} m${m.losa.maciza > 0 ? ", maciza en baños" : ""}${m.vigas.some((v) => v.tipo === "V VARIABLE") ? ", pasillo en volado" : ""}`;
        const notasColocadas = (r.secciones ?? []).filter((s) => s.tipo === 'notas');
        const cuadrosColocados = (r.secciones ?? []).filter((s) => s.tipo === 'cuadroColumnas');
        const resumenCorto = [
          `Listo: láminas ${lista(r.laminas.map((l) => l.codigo))} de ${r.proyecto}${s.niveles > 1 ? ` (${s.niveles} niveles)` : ""}.`,
          `• Cimentación: ${s.cimentacion} (Hz ${s.hz.toFixed(2)} m, Df ${s.df.toFixed(2)} m) · ${losaTxt}${m.escalera ? ` · escalera de ${m.escalera.contrapasos} contrapasos` : ""}.`,
          `• ${s.columnas.length} tipos de columna, ${s.porticos.length} pórticos${Object.values(s.porticosSimilares ?? {}).some((x) => x.length) ? " (los iguales, una vez)" : ""}${(m.planos ?? []).some((t) => /TABIQUER/.test(t)) ? ", tabiquería por nivel" : ""}.`,
          ...(notasColocadas.length ? [`• Especificaciones y resumen de parámetros sísmicos: ${[...new Set(notasColocadas.map((s) => s.lamina))].join(', ')}. Estos parámetros no constituyen un análisis sísmico.`] : []),
          ...(cuadrosColocados.length ? [`• Cuadro de columnas: ${[...new Set(cuadrosColocados.map((s) => s.lamina))].join(', ')}.`] : []),
        ].join("\n");
        return {
          ok: true,
          mensaje: `${previo ? `${previo} ` : ""}Generé las láminas ${lista(r.laminas.map((l) => `${l.codigo} (${l.plano.toLowerCase()})`))} de ${r.proyecto} debajo de la arquitectura, ${r.usarPlantilla === false ? 'con composición adaptada al contenido del plano actual' : 'con la plantilla de referencia indicada'}: ` +
            `cimentación con ${s.cimentacion} (Hz = ${s.hz.toFixed(2)} m, Df = ${s.df.toFixed(2)} m), cimiento corrido ${s.anchoCimiento.toFixed(2)} m en ${s.cimientoCorrido} tramos, aligerado e=${s.aligerado.espesor.toFixed(2)} m (${s.aligerado.viguetas} viguetas), ` +
            `${s.niveles > 1 ? `${s.niveles} niveles (entrepiso${s.entrepisos.length > 1 ? "s" : ""} NPT +${s.entrepisos.map((z) => z.toFixed(2)).join(", +")}${s.losaTecho ? "" : "; el último nivel solo con cobertura"}), ` : ""}` +
            `pórticos de los ejes ${s.porticos.join(", ")} (${s.techo ? `techo a dos aguas PTE ${Math.round(s.techo.pendiente * 100)}%, alero +${s.altura.toFixed(2)}, cumbrera +${s.techo.cumbrera.toFixed(2)}` : `techo +${s.altura.toFixed(2)}`}) y cuadro de columnas ${s.columnas.map((c) => `${c.tipo} ${c.refuerzo}`).join(", ")}` +
            `${s.sismo?.Z !== undefined || s.sismo?.U !== undefined ? `; parámetros sísmicos ${[s.sismo.Z !== undefined && `Z=${s.sismo.Z}`, s.sismo.U !== undefined && `U=${s.sismo.U}`, s.sismo.S !== undefined && `S=${s.sismo.S}`, s.sismo.Tp !== undefined && `Tp=${s.sismo.Tp}`].filter(Boolean).join(", ")}` : ""}.`,
          resumen: resumenCorto,
          laminas: r.laminas.map((l) => l.codigo),
          avisos: [...extra, ...r.avisos],
          // Sin panel que preguntara: lo que el ingeniero debe confirmar, con la recomendación usada.
          ...(consultas && !consultas.respondidas && (consultas.consultas.length || consultas.informes.length)
            ? {paraElIngeniero: textoConsultas(consultas)} : {}),
          ...(consultas?.respondidas ? {decidido: consultas.consultas.map((c) => `${c.pregunta} → ${c.opciones.find((o) => o.valor === elegido[c.clave])?.texto ?? elegido[c.clave]}`)} : {}),
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
