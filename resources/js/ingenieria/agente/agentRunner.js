// Bucle del Agente NovaCad sobre cualquier API compatible con OpenAI
// (Ollama local por defecto). Ahorro de tokens:
//  - pocas herramientas de alto nivel (skills) con descripciones cortas;
//  - los resultados de herramientas son resúmenes, nunca el plano completo;
//  - solo se reenvían los últimos turnos de la conversación;
//  - "/no_think" desactiva el razonamiento largo de Qwen3;
//  - como máximo 3 rondas de herramientas por pedido.

import {SKILLS, toolDefinitions} from "./skills/index.js";
import {memoriaDelAgente} from "./conocimiento.js";
import {estadoDeSesion} from "./estadoAgente.js";
import {datosDelTexto} from "../criterios/ubicacion.js";
import {reconocerPedido} from "./preferenciasCliente.js";
import {limitacionDelPedido} from './contratoDibujo.js';
import {REVISION_TRAS_ACCION, controlDeEscrituras} from './cicloEjecucion.js';

// memoria: "auto" | "completa" | "corta". En "auto", los modelos grandes o en la nube
// (ChatGPT, Claude, gpt-oss, >= 14B) reciben la memoria completa del agente
// (conocimiento.js); los locales chicos (Qwen 4B, 8k de contexto), solo el prompt corto.
// Motor del agente: siempre el del servidor. Proveedor (OpenAI, Gemini, Grok u Ollama local),
// clave y modelo se configuran en el .env y el navegador pasa por el proxy de Laravel
// (AgenteLlmController); el panel solo recibe si está listo, la memoria y si ve fotos.
export const AGENTE_SERVIDOR = {baseUrl: "/software/etabs/agente/llm", model: "servidor", apiKey: "", memoria: "completa", vision: false, sinRazonar: false, rutaDirecta: false};
export const OLLAMA_LOCAL = {baseUrl: "http://127.0.0.1:11434/v1", model: "qwen3-cad", apiKey: "", memoria: "auto"};
// OLLAMA_LOCAL queda para los scripts de evaluación (scripts/agente), no para el panel.
export const DEFAULT_AGENT_SETTINGS = AGENTE_SERVIDOR;
export const usaServidor = (settings) => String(settings?.baseUrl ?? "").startsWith("/");
const MAX_ROUNDS = 3;
// Con el motor del servidor el agente planifica, ejecuta y verifica: más pasos por pedido.
const MAX_ROUNDS_SERVIDOR = 8;
// Acciones tras las cuales el ejecutor corre la revisión de ingeniería (analizar_proyecto).
const ANALISIS_TRAS = new Set(['leer_estructura', 'proponer_estructura', 'plano_estructuras', 'construir_estructura', 'datos_proyecto', 'corregir_estructura']);
const HISTORY_TURNS = 4;

export const SYSTEM_PROMPT = [
  "Eres el Agente NovaCad, colega de ingenieros civiles en Perú. Español, breve, metros.",
  "Usa herramientas; no inventes datos ni resultados. Lee el 'Estado actual'; si el pedido es vago, sigue su siguiente paso.",
  "Casa o vivienda: casa_primer_nivel (por defecto frente 8, fondo 20, 3 dormitorios, 2 baños, cochera).",
  "Láminas de estructuras: plano_estructuras (sin conservar). Paso a paso: construir_estructura; respuesta a su pregunta pendiente: accion=responder. Ejes y columnas: leer_estructura. Vistas: vistas_plano.",
  "Proponer: proponer_estructura. Metrado: metrar_estructura. Corrección del ingeniero: corregir_estructura. Hz, Df, zona, suelo, categoría: datos_proyecto. Encimados: revisar_laminas. Borrar: quitar_laminas. ¿En qué vamos?: estado_proyecto.",
  "Decisión de experto no dicha ni decidida: preguntar_ingeniero (2-4 opciones, recomienda una y di por qué).",
  "Revisión de ingeniería (riesgos, luces, secciones): analizar_proyecto. Ver una vista o lámina como imagen: mirar_plano.",
  "Nunca digas que algo se hizo si no devolvió ok. Los hechos de las herramientas ya los ve el ingeniero: no los copies, interprétalos.",
  "/no_think",
].join("\n");

const MODELO_GRANDE = /gpt|claude|\bo\d|oss|cloud|sonnet|opus|haiku|fable|gemini|[:\-](?:1[4-9]|[2-9]\d|\d{3})b\b/i;
export function usaMemoriaCompleta(settings = DEFAULT_AGENT_SETTINGS) {
  if (settings.memoria === "completa") return true;
  if (settings.memoria === "corta") return false;
  const local = /\/\/(127\.0\.0\.1|localhost)[:/]/.test(settings.baseUrl ?? "");
  return !local || MODELO_GRANDE.test(settings.model ?? "");
}

// Prompt del sistema según el motor: corto para Ollama local chico; con la memoria
// del agente para modelos grandes. "/no_think" solo sirve a Qwen3.
export function promptDelSistema(settings = DEFAULT_AGENT_SETTINGS) {
  const base = SYSTEM_PROMPT.replace("\n/no_think", "");
  const qwen = /qwen/i.test(settings.model ?? "") || settings.sinRazonar === true;
  const instrucciones = usaServidor(settings) ? [
    "Analiza el pedido y las capturas con la memoria del despacho. Después de generar o metrar, el ejecutor comprueba el resultado y te devuelve la evidencia: examina los pendientes, corrige los problemas que las herramientas permiten resolver y vuelve a comprobar. Un éxito terminal de generación no omite la revisión. Una cancelación, datos faltantes o una decisión humana sí detienen el pedido.",
    "No tienes acceso a ventanas externas de AutoCAD: solo al documento abierto en NovaCad y a las capturas adjuntas. resumen_plano cuenta entidades; no compara visualmente planos. El generador no implementa despiece de barras superiores con longitudes de corte, anclajes o traslapes. No prometas añadirlo regenerando láminas. No borres antes de regenerar: plano_estructuras reemplaza sus láminas tras validar los datos.",
    "revisar_laminas comprueba encimados, rótulo y datos faltantes; NO es una revisión completa de detalles ni un cálculo estructural. Compara las capturas legibles con los criterios y casos aprendidos. Si faltan medidas o detalles, usa preguntar_ingeniero; no inventes medidas, armados ni verificaciones que las herramientas no hicieron.",
    "PROTOCOLO DE AGENTE (no eres un chatbot ni un menú): 1) ENTIENDE el objetivo y el estado; 2) INVESTIGA antes de responder: analizar_proyecto (revisión de ingeniería con normas), proponer_estructura (lo aprendido del despacho), leer_estructura o mirar_plano (ver la arquitectura o la lámina como imagen); 3) DECIDE como ingeniero senior: lo que la norma o la costumbre validada resuelve, lo resuelves tú y lo dices; lo dudoso lo preguntas con preguntar_ingeniero (2-4 opciones, recomienda una y di por qué); 4) EJECUTA; 5) VERIFICA lo que hiciste (revisar_laminas y mirar_plano sobre la lámina generada: ¿encimados, faltantes, algo fuera de lugar?); 6) CIERRA con criterio: qué hiciste, qué verificaste, riesgos y la siguiente acción que recomiendas. Nunca respondas solo 'listo': aporta lo que un ingeniero vería (luces, secciones, datos supuestos, riesgos sísmicos). Sé proactivo: si ves un problema que nadie pidió revisar, dilo.",
    "Trabaja como agente, no como chat: para un objetivo (estructurar el módulo, terminar o revisar el proyecto) planifica los pasos, ejecuta las herramientas en orden, VERIFICA lo hecho (revisar_laminas después de plano_estructuras; ver_metrado después de metrar_estructura; estado_proyecto para ver lo pendiente), corrige con corregir_estructura o pregunta con preguntar_ingeniero si hace falta una decisión, y cierra con un análisis breve: qué hiciste, qué verificaste, qué riesgos ves y qué recomiendas.",
    "Detente ante una pregunta pendiente o cancelación. Solo afirma cambios que consten en resultados ok de herramientas. Distingue observaciones visuales de verificaciones y cambios ejecutados.",
    "La identidad del documento y vista actuales manda sobre casos aprendidos e historial. No encierres otro proyecto en los módulos XIV/XV. Distingue inventario histórico de láminas realmente generadas, formato observado de papel físico confirmado, y cargas de referencia de datos del proyecto.",
    "Si no conoces un detalle, consulta las referencias con proponer_estructura y lee la vista actual antes de decidir. No inventes un reentrenamiento de OpenAI: consultar patrones aprendidos no cambia sus pesos. No repitas generación con los mismos argumentos sin una corrección real. Los pendientes y el alcance de revisar_laminas son obligatorios: no presentes esos controles como validación estructural ni omitas lo que no se pudo resolver.",
  ] : [];
  return [base, ...instrucciones, ...(usaMemoriaCompleta(settings) ? ["", memoriaDelAgente()] : []), ...(qwen ? ["/no_think"] : [])].join("\n");
}

// Qwen3 y otros modelos pueden devolver su razonamiento entre <think>...</think>.
export const stripThinking = (value) => String(value ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").replace(/^[\s\S]*<\/think>/, "").trim();

function parseArguments(raw) {
  if (raw && typeof raw === "object") return raw;
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

// El modelo escribió mal la llamada a la herramienta (Ollama: "XML syntax error…" con 500).
const LLAMADA_MAL_ESCRITA = /XML syntax error|tool call|function call|unexpected (end|token)|failed to parse/i;

async function chat({settings, messages, tools, fetchImpl, signal, temperature = 0.2}) {
  const response = await fetchImpl(`${settings.baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    signal,
    // Por el servidor: sesión y token CSRF de Laravel, nunca una clave desde el navegador.
    headers: usaServidor(settings)
      ? {"Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest", "X-CSRF-TOKEN": (typeof document !== "undefined" ? document.querySelector('meta[name="csrf-token"]')?.content : "") ?? ""}
      : {"Content-Type": "application/json", ...(settings.apiKey ? {Authorization: `Bearer ${settings.apiKey}`} : {})},
    ...(usaServidor(settings) ? {credentials: "same-origin"} : {}),
    body: JSON.stringify({model: settings.model, messages, tools, tool_choice: "auto", temperature, stream: false}),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    if (usaServidor(settings)) {
      // El proxy ya devuelve un mensaje claro (sin clave, límite de pedidos, proveedor caído).
      let mensaje = "";
      try { mensaje = JSON.parse(detail).error?.message ?? ""; } catch { /* no es JSON */ }
      throw new Error(mensaje || `El servidor del agente respondió ${response.status}.`);
    }
    if (response.status === 402) throw new Error("El modelo elegido es de pago (nube). Usa un modelo local, por ejemplo qwen3-cad.");
    if (response.status === 404) throw new Error(`El modelo "${settings.model}" no existe en el servidor. Revisa la configuración.`);
    const error = new Error(`El servidor del modelo respondió ${response.status}. ${detail.slice(0, 160)}`);
    if (response.status >= 500 && LLAMADA_MAL_ESCRITA.test(detail)) error.llamadaMalEscrita = true;
    throw error;
  }
  const data = await response.json();
  return {message: data.choices?.[0]?.message ?? {role: "assistant", content: ""}, usage: data.usage};
}

// Un reintento (más determinista) si el modelo escribió mal la llamada; si vuelve a pasar,
// un mensaje que se entienda en lugar del error crudo de Ollama.
async function chatConReintento(opciones) {
  try { return await chat(opciones); } catch (error) {
    if (!error.llamadaMalEscrita) throw error;
  }
  try { return await chat({...opciones, temperature: 0}); } catch (error) {
    if (!error.llamadaMalEscrita) throw error;
    throw new Error(`El modelo "${opciones.settings.model}" no escribió bien la llamada a la herramienta (dos veces). No se hizo ningún cambio en el plano. Prueba de nuevo o usa qwen3-cad, que es el evaluado para el agente.`);
  }
}

const NOMBRES = {plano_estructuras: "las láminas de estructuras", datos_proyecto: "los datos del proyecto", quitar_laminas: "quitar las láminas", vistas_plano: "las vistas del plano", leer_estructura: "las columnas y ejes"};

// La respuesta final sale de lo que realmente pasó, no de lo que el modelo diga: un modelo
// chico puede decir "Se generaron las láminas" aunque la herramienta haya fallado.
// - Herramienta que falló (sin un intento posterior que funcionara): se dice que no se hizo.
// - Herramientas que funcionaron con 'mensaje': ese mensaje y sus avisos, tal cual.
// - Ninguna herramienta: el texto del modelo, pero sin afirmar cambios que no ocurrieron.
export function respuestaHonesta(textoModelo, steps) {
  const ultimo = new Map();
  for (const s of steps) ultimo.set(s.tool, s);
  const fallidos = [...ultimo.values()].filter((s) => s.result?.ok === false);
  const hechos = [...ultimo.values()].filter((s) => s.result?.ok !== false && s.result?.mensaje);
  const partes = [];
  const hayResultadosPrevios = steps.some((s) => s.result?.ok === true && !s.result.sinCambios && !s.result.omitida);
  for (const s of fallidos) partes.push(`No pude hacer ${NOMBRES[s.tool] ?? s.tool}: ${s.result.error ?? "error desconocido"}. ${hayResultadosPrevios ? 'Los resultados de las acciones completadas se muestran a continuación.' : 'No se cambió el plano.'}`);
  for (const s of hechos) {
    const avisos = (s.result.avisos ?? []).filter(Boolean);
    // Con resumen corto (plano_estructuras): lo esencial, lo que debe confirmar y a lo más 3 avisos.
    const corto = Boolean(s.result.resumen);
    const vistos = corto ? avisos.slice(0, 3) : avisos;
    partes.push([s.result.resumen ?? s.result.mensaje,
      ...(s.result.decidido?.length ? ["Decidiste:", ...s.result.decidido.map((d) => `• ${d}`)] : []),
      ...(s.result.paraElIngeniero ? [s.result.paraElIngeniero] : []),
      ...vistos.map((a) => `Aviso: ${a}`),
      ...(corto && avisos.length > vistos.length ? [`(${avisos.length - vistos.length} aviso(s) más en el detalle)`] : [])].join("\n"));
  }
  if (partes.length) return partes.join("\n\n");
  const texto = stripThinking(textoModelo);
  if (!steps.length && /\b(gener[ée]|he generado|se (han )?generado|correg[íi]|mejor[ée]|modifiqu[ée]|actualic[ée]|listo)\b/i.test(texto || "listo")) {
    return 'No hice cambios en el plano: no se ejecutó ninguna herramienta.';
  }
  return texto || "No hice cambios en el plano.";
}

// ---- Ruta directa: pedidos inequívocos sin pasar por el modelo (costo 0, siempre la misma) ----
// Solo cuando no hay duda: si el pedido trae números, correcciones o datos del proyecto, decide
// el modelo (tiene que extraer valores). Medido con casos-evaluacion: nunca elige mal; lo que
// no reconoce lo deja al modelo.
const sinTildes = (t) => String(t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
// Números, correcciones o datos: hay que extraer valores → decide el modelo.
const DATOS_O_CORRECCION = /\d|\b(corrig|correg|debe ser|deberia|es maciza|maciz|segun|estudio de suelos|zona|suelo|categoria|hz|df|cambia|en vez|no es|usa |conserva|casa|vivienda|dormitorio)/;
export function rutaDirecta(texto) {
  const t = sinTildes(texto).trim();
  // Datos del proyecto dichos en el chat (Hz, Df, zona, suelo, categoría, ubicación): se leen del
  // texto sin IA y van a Datos del proyecto; la IA ya no puede confundirlos con una corrección.
  const datos = datosDelTexto(texto);
  if (Object.keys(datos).length && !/\b(genera|dibuja|haz|rehaz|estructura)\b/.test(t)) return {tool: "datos_proyecto", args: datos};
  if (!t || t.length > 160) return null;
  // Editar lo ya dibujado (sin rehacer ni volver a pedir datos): cotas y orden de la lámina van
  // antes que "encimados" genérico, para que "las cotas se ven encimadas" sea un arreglo de cotas.
  if (/\b(mejora|mejorar|acomoda|acomodar|ordena|ordenar|arregla|arreglar)\b.*\bcotas?\b|\bcotas?\b.*\b(encimad|desordenad|tapad|no se leen|ilegibles?)/.test(t)) return {tool: "mejorar_cotas", args: {}};
  if (/\b(ordena|ordenar|acomoda|acomodar|alinea|alinear)\b.*\b(lamina|laminas|textos|rotulos|dibujo|plano)\b|\bdesordenad/.test(t)) return {tool: "ordenar_lamina", args: {}};
  if (/\bencimad/.test(t)) return {tool: "revisar_laminas", args: /\b(corrige|corregir|separa|arregla|quita)/.test(t) ? {corregir: true} : {}};
  // "¿Por qué platea?", "¿por qué losa maciza?": la explicación de la propuesta, sin costo.
  // Informe de lectura de la arquitectura antes de dibujar (qué identificó, norma, datos, recomendación).
  if (/\b(informe|diagnostico|que identificaste|que encontraste|que (requisitos|requerimientos))\b|\b(analiza|revisa|lee)\w*\b.*\barquitectura\b/.test(t) && !/\blaminas?\b.*\b(norma|ingeniero)\b/.test(t)) {
    return {tool: "informe_arquitectura", args: /\b(descarga|html|pdf|cliente|imprim)/.test(t) ? {descargar: true} : {}};
  }
  // Pedidos del cliente sobre las láminas ("sin columnas", "quita las cotas"): se aconseja y se ejecuta.
  if (reconocerPedido(texto)) return {tool: "preferencia_laminas", args: {texto}};
  // "¿Por qué platea?", "justifica la viga", "¿en qué norma…?": la decisión con su norma y su fuente.
  if (/^[¿]?\s*(por que|porque)\b|\b(justific\w*|fundament\w*|en que norma|que norma|segun que norma|de donde (sale|salio|sacaste))\b/.test(t)) {
    return {tool: "justificar", args: {tema: t.replace(/^[¿]?\s*(por que|porque)\s+|\b(justifica\w*|fundamenta\w*)\s+/g, "").replace(/[?¿]/g, "").trim()}};
  }
  if (/\b(paso a paso|guiame|guia(me)? la|construye|construir|construyamos)\b/.test(t) && !/\bcasa|vivienda\b/.test(t)) return {tool: "construir_estructura", args: {accion: "iniciar"}};
  if (/^[¿]?\s*(en que vamos|que falta|que (llevas|tenemos|decidiste|hiciste)|estado del proyecto|resumen del proyecto)\b/.test(t)) return {tool: "estado_proyecto", args: {}};
  // Revisión de las láminas contra la norma (revisorNorma.js).
  if (/\brevisa\w*\b.*\b(como ingeniero|contra la norma|con la norma)\b|\bque (le )?falta\w*\b.*\blaminas?\b|\bchecklist\b/.test(t)) return {tool: "revisar_norma", args: {}};
  // Estilo del despacho aprendido de sus planos terminados (skills/estiloDespacho.js).
  if (/\b(olvida|borra)\w*\b.*\bestilo\b/.test(t)) return {tool: "olvidar_estilo", args: {}};
  if (/\bque estilo\b|\b(aprendiste|has aprendido)\b.*\bestilo\b/.test(t)) return {tool: "estado_estilo", args: {}};
  if (/\baprend\w*\b.*\b(estilo|de (este|mis|estos) planos?)\b|\basi dibujo yo\b/.test(t)) return {tool: "aprender_estilo", args: {}};
  // Aprender a dibujar con el cliente (aprendizajeDibujo.js).
  if (/\b(olvida|borra)\w*\b.*\b(aprendi\w*|correcciones|criterio)\b/.test(t)) return {tool: "olvidar_aprendizaje", args: {}};
  if (/\baprend\w*\b.*\b(correcci\w*|como dibujo|mi criterio|de mi)\b|\bya corregi\b/.test(t) && !/\bque aprendiste\b/.test(t)) return {tool: "aprender_correcciones", args: {}};
  if (/\bque (aprendiste|has aprendido)\b|\bcomo vas aprendiendo\b/.test(t)) return {tool: "estado_aprendizaje", args: {}};
  // Ciclo fusionado NovaCad + Análisis Estructural.
  if (/\b(estructura y analiza|haz todo el ciclo|ciclo completo|proceso completo|disena y dibuja|analiza y disena)\b/.test(t)) return {tool: "ciclo_completo", args: {}};
  // Diseño verificado en Análisis Estructural de vuelta a las láminas.
  if (/\b(aplica\w*|trae\w*|usa|actualiza\w*)\b.*\bdiseno\b|\bdiseno (del|de) analisis\b/.test(t)) return {tool: "aplicar_diseno", args: {}};
  // Modelo de análisis (.e2k) desde la arquitectura: antes del filtro de datos (".e2k" lleva un número).
  if (/\b(envia\w*|manda\w*|pasa\w*|lleva\w*|abre|abrir)\b.*\banalisis\b|\bmodelo (de|para) (analisis|etabs)\b|\be2k\b|\bexporta\w*\b.*\betabs\b/.test(t)) {
    return {tool: /\babr(e|ir)\b/.test(t) && !/\bmodelo\b/.test(t) ? "abrir_analisis" : "modelo_analisis", args: {}};
  }
  if (DATOS_O_CORRECCION.test(t)) return null;
  if (/\b(borra|quita|elimina|limpia)\b.*\blaminas?\b/.test(t)) return {tool: "quitar_laminas", args: {}};
  if (/\b(metrado|metrados|metrar|metra|metramos|metremos|metrame|metralo|cantidades)\b/.test(t)) return {tool: "metrar_estructura", args: /\b(excel|xlsx|descarga)/.test(t) ? {excel: true} : {}};
  if (/\brevis(a|ar|ame)\b.*\blaminas?\b/.test(t)) return {tool: "revisar_laminas", args: {}};
  if (/\bvistas\b/.test(t)) return {tool: "vistas_plano", args: {}};
  if (/\b(analiza|analizar|propon|propone|proponer)\b|\bque (estructura|cimentacion|losa)\b|\ble corresponde\b/.test(t)) return {tool: "proponer_estructura", args: {}};
  if (/\b(lee|leer|detecta|detectas)\b.*\b(ejes|columnas)\b|\bque columnas\b/.test(t)) return {tool: "leer_estructura", args: {}};
  // Generar láminas: solo si se pide hacerlas, no en una pregunta ("explícame la estructura…").
  const pregunta = /^[¿]?\s*(por que|porque|como|explica|explicame|cuanto|cual|que es)\b/.test(t);
  if (!pregunta && /\b(plano|planos|laminas?) de estructuras?\b|^(estructura|estructurar|estructurale)\b|\b(genera|hazme|haz|dibuja|arma|necesito|quiero)\b.*\b(estructura|cimentacion)\b/.test(t)) {
    const cimentacion = /\bzapatas?\b/.test(t) ? "zapatas" : /\bplatea\b/.test(t) ? "platea" : null;
    return {tool: "plano_estructuras", args: cimentacion ? {cimentacion} : {}};
  }
  return null;
}

function contenidoDelUsuario(text, imagenes, settings) {
  if (!imagenes.length) return text;
  return settings.vision
    ? [{type: "text", text}, ...imagenes.map((url) => ({type: "image_url", image_url: {url, detail: "high"}}))]
    : `${text}\n(El ingeniero adjuntó ${imagenes.length} foto(s), pero este motor no dispone de visión.)`;
}

function respuestaConAnalisis(textoModelo, steps, analizar = false) {
  // Una narración del modelo no es evidencia de cambios ni de confirmación humana: los hechos
  // salen de las herramientas. Con el motor del servidor, lo que el modelo razonó se muestra
  // aparte, como análisis (antes se descartaba y el agente parecía un menú de comandos).
  // Las imágenes de mirar_plano y la revisión de ingeniería automática son insumo del modelo,
  // no hechos que se repitan al ingeniero (su contenido lo explica el análisis).
  const visibles = analizar ? steps.filter((s) => !(s.automatica && s.tool === 'analizar_proyecto') && s.tool !== 'mirar_plano') : steps;
  const hechos = respuestaHonesta(visibles.length ? '' : textoModelo, visibles);
  // El agente razona a la vista: con el motor del servidor su análisis (riesgos, criterio y
  // recomendación) va siempre, también después de crear láminas; solo se quitan las frases que
  // afirman acciones que no constan en las herramientas.
  const analisis = analizar && steps.length ? soloAnalisis(textoModelo) : "";
  if (!analisis) return hechos;
  return visibles.length ? `${hechos}\n\nAnálisis: ${analisis}` : analisis;
}

// Del texto del modelo se quitan las frases que afirman acciones o confirmaciones que no constan
// en las herramientas ("He agregado…", "corregí…", "confirmado por el ingeniero"): el análisis
// observa, advierte y recomienda; los hechos solo salen de las herramientas.
const AFIRMA_ACCION = /\b(he|hemos|ya)\s+(agregado|añadido|incluido|generado|corregido|modificado|dibujado|actualizado|eliminado|borrado|cambiado|aplicado|verificado|completado)\b|\b(agregu[ée]|añad[íi]|inclu[íi]|gener[ée]|correg[íi]|modifiqu[ée]|dibuj[ée]|actualic[ée]|elimin[ée]|borr[ée]|cambi[ée]|apliqu[ée]|verifiqu[ée]|complet[ée])\b|confirmad[oa]s?\s+por\s+el\s+ingeniero|aprobad[oa]s?\s+por\s+el\s+ingeniero|aprobad[oa]s?\s+para\s+obra|despiece\s+complet|list[oa]s?\s+para\s+(obra|construir|construcci|entrega)|cumpl(e|en)\s+(con\s+)?(toda\s+)?la\s+norma|verificad[oa]s?\s+estructuralmente/i;
export function soloAnalisis(texto) {
  const frases = stripThinking(texto).split(/(?<=[.!?])\s+|\n+/).map((f) => f.trim()).filter(Boolean);
  return frases.filter((f) => !AFIRMA_ACCION.test(f)).join(" ").trim();
}

// ---- Análisis del resultado con IA (motor del servidor) ----
// Después de una acción, el modelo lee los hechos y responde como ingeniero: qué observa, qué
// riesgo o supuesto ve y qué conviene hacer ahora. Una llamada corta, sin herramientas.
const ANALIZABLES = new Set(["plano_estructuras", "metrar_estructura", "proponer_estructura", "revisar_laminas", "leer_estructura", "vistas_plano", "estado_proyecto", "ver_metrado", "construir_estructura"]);
const PROMPT_ANALISIS = [
  "Analiza estos resultados como ingeniero estructural del despacho, en 3 a 6 líneas cortas:",
  "1) qué observas o verificas en los hechos (no repitas el mensaje de la herramienta);",
  "2) riesgos o supuestos: datos por defecto, avisos, valores fuera de rango, lo que el ingeniero debe confirmar;",
  "3) la siguiente acción concreta que recomiendas (una herramienta o una pregunta al ingeniero).",
  "No afirmes cambios que no estén en los resultados. No inventes medidas, armados ni verificaciones. Español, directo.",
].join("\n");
function resumirResultado(r = {}) {
  const corto = (v, n) => (typeof v === "string" ? v.slice(0, n) : v);
  const {mensaje, resumen, avisos, paraElIngeniero, decidido, error, ok, partidas, contraste, encimados} = r;
  return {ok, error, mensaje: corto(mensaje, 1500), resumen: corto(resumen, 800), avisos: (avisos ?? []).slice(0, 8),
    paraElIngeniero: corto(paraElIngeniero, 800), decidido, encimados, partidas: corto(partidas, 1500),
    contraste: Array.isArray(contraste) ? contraste.filter((c) => c && c.dentro === false).slice(0, 8) : undefined};
}
export async function analizarResultado({text, steps, settings, context, fetchImpl = globalThis.fetch?.bind(globalThis), signal}) {
  if (!usaServidor(settings) || !settings.analizarResultados) return null;
  const hechos = steps.filter((s) => ANALIZABLES.has(s.tool) && s.result?.ok !== false && !s.result?.opciones?.length);
  if (!hechos.length) return null;
  const estado = context ? estadoDeSesion(context) : "";
  const messages = [
    {role: "system", content: promptDelSistema(settings)},
    ...(estado ? [{role: "system", content: estado}] : []),
    {role: "system", content: PROMPT_ANALISIS},
    {role: "user", content: `Pedido del ingeniero: ${String(text ?? "").slice(0, 400)}\nResultados de las herramientas (hechos):\n${JSON.stringify(hechos.map((s) => ({herramienta: s.tool, resultado: resumirResultado(s.result)}))).slice(0, 6000)}`},
  ];
  try {
    const {message} = await chat({settings, messages, tools: undefined, fetchImpl, signal, temperature: 0.2});
    return soloAnalisis(message?.content) || null;
  } catch { return null; }
}

function esperaRespuesta(resultado, context, revisionDisponible = false) {
  return Boolean((resultado?.terminal && !(resultado.ok && revisionDisponible)) || resultado?.cancelado || resultado?.opciones?.length
    || context?.memoria?.construccion?.pendiente
    || (context?.memoria?.consultas?.consultas?.length && !context.memoria.consultas.respondidas));
}

// history: [{role: "user"|"assistant", content, imagenes?}] de turnos anteriores.
// imagenes: fotos del ingeniero como data URL (observaciones). Si el motor ve imágenes van al
// modelo; si no, solo se avisa que las adjuntó (quedan guardadas como observación).
export async function runAgent({text, imagenes = [], history = [], accionSolicitada, settings = DEFAULT_AGENT_SETTINGS, context, skills = SKILLS, fetchImpl = globalThis.fetch?.bind(globalThis), onStep = () => {}, onProgress = () => {}, signal}) {
  const limitacion = limitacionDelPedido(text, history, context?.memoria ?? {});
  if (limitacion && !usaServidor(settings)) return {reply: limitacion, steps: [], usage: {prompt: 0, completion: 0}};
  if (limitacion) {
    const consultas = new Set(['resumen_plano', 'buscar_textos', 'leer_estructura', 'vistas_plano', 'proponer_estructura', 'estado_proyecto', 'analizar_proyecto', 'mirar_plano']);
    skills = skills.filter((s) => consultas.has(s.name));
  }
  const tools = toolDefinitions(skills);
  // Lo que el usuario escribió: las herramientas solo aceptan datos del proyecto que estén ahí
  // (un modelo chico inventaba "suelo S2, zona 3, Df 2.50" en "genera el plano con platea").
  if (context?.memoria) context.memoria.ultimoPedido = String(text ?? "");
  // Pedido inequívoco y sin fotos: la herramienta corre directo, sin gastar tokens.
  const recientes = history.slice(-HISTORY_TURNS);
  const ultimaCaptura = imagenes.length ? null : history.findLast((m) => m.role === "user" && m.imagenes?.length);
  const directa = !imagenes.length && !ultimaCaptura && settings.rutaDirecta !== false ? rutaDirecta(text) : null;
  const skillDirecta = directa && skills.find((s) => s.name === directa.tool);
  if (skillDirecta) {
    let result;
    try { result = await skillDirecta.run(directa.args, context); } catch (error) { result = {ok: false, error: error?.message ?? String(error)}; }
    const step = {tool: directa.tool, args: directa.args, result};
    onStep(step);
    const hechos = respuestaHonesta("", [step]);
    const analisis = esperaRespuesta(result, context) ? null : await analizarResultado({text, steps: [step], settings, context, fetchImpl, signal});
    return {reply: analisis ? `${hechos}

Análisis: ${analisis}` : hechos, steps: [step], usage: {prompt: 0, completion: 0}, directa: true};
  }
  const contenido = contenidoDelUsuario(text, imagenes, settings);
  // Solo la captura más reciente: permite seguir revisándola sin inflar cada pedido
  // con todas las fotos antiguas ni perderla tras un error temporal del proveedor.
  const historial = recientes.map((m) => ({role: m.role, content: m === ultimaCaptura ? contenidoDelUsuario(m.content, m.imagenes, settings) : m.content}));
  if (ultimaCaptura && !recientes.includes(ultimaCaptura)) historial.unshift({role: "user", content: contenidoDelUsuario(ultimaCaptura.content, ultimaCaptura.imagenes, settings)});
  const analizar = usaServidor(settings);
  // El estado de la sesión va en cada pedido (pocos tokens): el modelo no se pierde entre turnos.
  const estado = context ? estadoDeSesion(context) : "";
  const messages = [{role: "system", content: promptDelSistema(settings)}, ...(estado ? [{role: "system", content: estado}] : []), ...historial, {role: "user", content: contenido}];
  if (limitacion) messages.splice(1, 0, {role: 'system', content: `Capacidad pendiente de implementación: ${limitacion} Investiga las referencias disponibles para precisar qué falta. Este pedido solo permite consultas; no está permitido modificar el CAD ni afirmar que el detalle se generó.`});
  if (accionSolicitada && !limitacion) {
    if (!skills.some((s) => s.name === accionSolicitada.herramienta)) throw new Error('La acción solicitada no está disponible.');
    messages.splice(1, 0, {role: 'system', content: `El usuario seleccionó una acción del panel: ${JSON.stringify(accionSolicitada)}. Ejecuta esa acción con esos argumentos y continúa comprobando el resultado. No sustituyas sus valores por otros.`});
  }
  const steps = [];
  const usage = {prompt: 0, completion: 0};
  const escrituras = controlDeEscrituras();
  let accionAplicada = false;
  let analisisPendiente = false, analisisHecho = false;
  const imagenesDelLote = [];
  const maxRondas = analizar ? MAX_ROUNDS_SERVIDOR : MAX_ROUNDS;
  for (let round = 0; round <= maxRondas; round++) {
    let respuesta;
    try {
      onProgress({fase: 'pensando', mensaje: 'Preparando tu proyecto…'});
      respuesta = await chatConReintento({settings, messages, tools: round < maxRondas ? tools : undefined, fetchImpl, signal});
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      // La IA no respondió antes de hacer nada: la acción del botón (o el pedido inequívoco) igual se
      // ejecuta en el navegador, sin IA — un botón nunca debe depender del servidor del modelo.
      const plan = !steps.length ? (accionSolicitada ? {tool: accionSolicitada.herramienta, args: accionSolicitada.args ?? {}} : rutaDirecta(text)) : null;
      const skillPlan = plan && skills.find((s) => s.name === plan.tool);
      if (skillPlan) {
        let result;
        try { result = await skillPlan.run({...(plan.args ?? {})}, context); } catch (e) { result = {ok: false, error: e?.message ?? String(e)}; }
        const step = {tool: plan.tool, args: plan.args ?? {}, result};
        steps.push(step);
        onStep(step);
        return {reply: `${respuestaHonesta("", steps)}\n\n(La IA no respondió —${error.message}—: hice la acción directamente, sin ella.)`, steps, usage, directa: true};
      }
      if (!steps.length) throw error;
      return {reply: `${respuestaHonesta("", steps)}\n\nNo pude completar el análisis con IA: ${error.message}`, steps, usage};
    }
    const {message, usage: used} = respuesta;
    usage.prompt += used?.prompt_tokens ?? 0;
    usage.completion += used?.completion_tokens ?? 0;
    const calls = message.tool_calls ?? [];
    if (!calls.length) return {reply: limitacion ? `${steps.length ? `${respuestaHonesta('', steps)}\n\n` : ''}${limitacion}` : respuestaConAnalisis(message.content, steps, analizar), steps, usage};

    messages.push({role: "assistant", content: message.content ?? "", tool_calls: calls});
    const revisiones = new Map();
    let repeticion = false;
    for (const call of calls) {
      const skill = skills.find((item) => item.name === call.function?.name);
      const args = parseArguments(call.function?.arguments);
      if (!accionAplicada && skill?.name === accionSolicitada?.herramienta) {
        Object.assign(args, accionSolicitada.args ?? {});
        call.function.arguments = JSON.stringify(args);
        accionAplicada = true;
      }
      if (!escrituras.permitir(skill?.name, args)) {
        const result = {ok: true, sinCambios: true, mensaje: 'No repetí la misma escritura: no hubo una corrección de datos o decisiones que justificara otro dibujo. Queda pendiente resolver la diferencia detectada.'};
        const step = {tool: skill?.name, args, result};
        steps.push(step);
        onStep(step);
        repeticion = true;
        break;
      }
      let result;
      try {
        onProgress({fase: skill?.name === 'corregir_estructura' ? 'corrigiendo' : 'creando', mensaje: 'Creando tu proyecto…'});
        // Rehacer usa el reemplazo del generador, después de validar las entradas.
        // Una llamada de borrado inventada por el modelo no debe adelantarse a esa validación.
        result = skill?.name === 'quitar_laminas' && !/\b(borra|borrar|elimina|eliminar|quita|quitar|limpia)\b/i.test(text)
          ? {ok: true, omitida: true, sinCambios: true, mensaje: 'No ejecuté un borrado separado: el generador valida los datos antes de reemplazar sus láminas.'}
          : skill ? await skill.run(args, context) : {ok: false, terminal: Boolean(limitacion), error: limitacion || `Herramienta desconocida: ${call.function?.name}`};
      } catch (error) {
        result = {ok: false, error: error?.message ?? String(error)};
      }
      // Una imagen (mirar_plano) no va en el mensaje de herramienta ni en el historial: se envía
      // al modelo con visión como mensaje aparte, después de responder todo el lote.
      if (result?.imagen) {
        if (settings.vision) imagenesDelLote.push({titulo: result.mensaje, url: result.imagen});
        result = {...result, imagen: undefined, conImagen: Boolean(settings.vision), ...(settings.vision ? {} : {aviso: "Este motor no tiene visión: no puedo mirar la imagen."})};
      }
      const step = {tool: call.function?.name, args, result};
      steps.push(step);
      onStep(step);
      messages.push({role: "tool", tool_call_id: call.id, content: JSON.stringify(result)});
      if (analizar && result?.ok && ANALISIS_TRAS.has(skill?.name)) analisisPendiente = true;
      if (skill?.name === 'analizar_proyecto') analisisHecho = true;
      escrituras.registrar(skill?.name, result);
      const revisor = analizar && result?.ok && !result.omitida ? skills.find((s) => s.name === REVISION_TRAS_ACCION[skill?.name]) : null;
      // No ejecutar otras llamadas del mismo lote si una necesita respuesta humana.
      if (esperaRespuesta(result, context, Boolean(revisor))) return {reply: respuestaHonesta("", steps), steps, usage};
      // Una revisión pedida por el modelo satisface la comprobación pendiente del lote.
      if (result?.ok && !result.omitida) revisiones.delete(skill?.name);
      if (revisor) revisiones.set(revisor.name, revisor);
    }
    // Responder primero todas las llamadas del lote antes de añadir otro mensaje assistant.
    for (const revisor of revisiones.values()) {
        // Esta comprobación es una obligación del ejecutor, incluso si el modelo olvida pedirla.
        onProgress({fase: 'verificando', mensaje: 'Comprobando tu proyecto…'});
        const revisionArgs = revisor.name === 'revisar_laminas' ? {corregir: true} : {};
        let revision;
        try { revision = await revisor.run(revisionArgs, context); }
        catch (error) { revision = {ok: false, error: error?.message ?? String(error)}; }
        const comprobacion = {tool: revisor.name, args: revisionArgs, result: revision, automatica: true};
        steps.push(comprobacion);
        onStep(comprobacion);
        const id = `revision-${steps.length}`;
        // Mensajes completos de herramientas: el proveedor recibe evidencia, no una promesa.
        messages.push({role: 'assistant', content: '', tool_calls: [{id, type: 'function', function: {name: revisor.name, arguments: JSON.stringify(revisionArgs)}}]},
          {role: 'tool', tool_call_id: id, content: JSON.stringify(revision)});
        if (revision?.ok === false || esperaRespuesta(revision, context)) return {reply: `${respuestaHonesta('', steps)}\nLa comprobación quedó pendiente; no doy el proyecto por terminado.`, steps, usage};
    }
    // Revisión de ingeniería obligatoria (una por pedido) después de leer, proponer o dibujar:
    // el modelo siempre tiene con qué razonar como ingeniero, aunque olvide pedirla.
    const analista = analisisPendiente && !analisisHecho ? skills.find((s) => s.name === 'analizar_proyecto') : null;
    if (analista) {
      analisisHecho = true;
      let analisis;
      try { analisis = await analista.run({}, context); } catch (error) { analisis = {ok: false, error: error?.message ?? String(error)}; }
      const paso = {tool: analista.name, args: {}, result: analisis, automatica: true};
      steps.push(paso);
      onStep(paso);
      const id = `analisis-${steps.length}`;
      messages.push({role: 'assistant', content: '', tool_calls: [{id, type: 'function', function: {name: analista.name, arguments: '{}'}}]},
        {role: 'tool', tool_call_id: id, content: JSON.stringify(analisis)});
    }
    for (const img of imagenesDelLote.splice(0)) {
      messages.push({role: 'user', content: [{type: 'text', text: `Imagen pedida con mirar_plano — ${img.titulo} Analízala con criterio de ingeniero.`}, {type: 'image_url', image_url: {url: img.url, detail: 'high'}}]});
    }
    if (repeticion) return {reply: respuestaHonesta('', steps), steps, usage};
    const ronda = steps.slice(-calls.length);
    // El motor del servidor continúa analizando. Las decisiones pendientes pertenecen
    // al ingeniero: no se envía otra ronda que pueda contestarlas por él.
    if (!analizar && ronda.every((s) => s.result?.ok !== false && s.result?.mensaje)) return {reply: respuestaHonesta("", steps), steps, usage};
  }
  return {reply: steps.length ? respuestaHonesta("", steps) : "Se alcanzó el límite de pasos para este pedido.", steps, usage};
}
