// Informe de lectura de la arquitectura, ANTES de las láminas: qué identificó el agente en el plano,
// qué valida contra la norma, qué datos faltan y qué recomienda, cada cosa con su fundamento. Es lo
// que el cliente lee para entender (y aprobar) los criterios antes de que se dibuje la estructura.
//
// Fuentes de cada fila: "plano" (leído del DWG), "cota" (verificado con la cota del arquitecto),
// "norma" (artículo verificado en el texto, normasVerificadas.js), "despacho" (criterio aprendido de
// los expedientes del despacho), "predimensionamiento" (regla práctica, no es norma), "dato" (datos
// del proyecto) y "falta" (dato pendiente).

import {VERIFICADAS} from "../criterios/normasVerificadas.js";
import {versionE030} from "../criterios/normativa.js";
import {lucesEntreEjes, cotaEntre} from "../analisis/conformidadPlano.js";

const m2 = (v) => Number(v).toFixed(2);
const ETIQUETA = {plano: "Plano", cota: "Cota del arquitecto", norma: "Norma", despacho: "Criterio del despacho", predimensionamiento: "Predimensionamiento", dato: "Dato del proyecto", falta: "Falta", calculo: "Cálculo"};
const fila = (dato, valor, fuente, extra = {}) => ({dato, valor, fuente, ...extra});

// Luz libre aproximada: entre ejes menos el ancho de viga típico (0.25 m).
const libre = (luz, b = 0.25) => Math.max(0, Number(luz) - b);

// rasgos y propuesta: casos.js (rasgosDeArquitectura / proponer); estructura: la lectura con
// columnas y ejes (memoria.estructura); cotas: las del arquitecto (readPlan); datos: del proyecto;
// techo: techoDesdeArquitectura (cortes) o null; titulo: módulo o proyecto.
export function informeArquitectura({rasgos = {}, propuesta = null, estructura = null, cotas = [], datos = {}, techo = null, titulo = ""} = {}) {
  const dec = propuesta?.decisiones ?? {};
  const secciones = [];

  // ---- 1. Lo identificado en el plano ----
  const ident = [];
  ident.push(fila("Planta leída", rasgos.vista || estructura?.titulo || "—", "plano"));
  ident.push(fila("Niveles", String(rasgos.niveles ?? 1), "plano", {nota: "Por los N.P.T. y plantas de la arquitectura."}));
  if (rasgos.largo) ident.push(fila("Dimensiones en planta", `${m2(rasgos.largo)} × ${m2(rasgos.ancho)} m (${m2(rasgos.area)} m²)`, "plano"));
  if (rasgos.ejes) ident.push(fila("Ejes", `${rasgos.ejes.x} en una dirección y ${rasgos.ejes.y} en la otra`, "plano"));
  // Luces entre ejes contrastadas con las cotas del arquitecto.
  const k = Number(estructura?.escala) || 1;
  const caja = estructura?.caja ? {x0: estructura.caja.x0 / k, y0: estructura.caja.y0 / k, x1: estructura.caja.x1 / k, y1: estructura.caja.y1 / k} : null;
  const luces = estructura ? lucesEntreEjes(estructura).filter((l) => !l.total) : [];
  const acotadas = luces.map((l) => ({l, c: cotaEntre(cotas, l, k, caja)}));
  for (const {l, c} of acotadas) {
    const ok = c ? Math.abs(c.valor - l.luz) <= 0.02 : null;
    ident.push(fila(`Luz ${l.de.nombre}–${l.a.nombre}`, `${m2(l.luz)} m`, c ? "cota" : "plano",
      {estado: ok === null ? null : ok ? "cumple" : "revisar", nota: c ? (ok ? `Coincide con la cota del arquitecto (${m2(c.valor)} m).` : `La cota del arquitecto dice ${m2(c.valor)} m: confirmar cuál vale.`) : "Sin cota entre estos ejes: medida en el dibujo."}));
  }
  if (rasgos.columnas !== undefined) ident.push(fila("Columnas", `${rasgos.columnas}${(rasgos.tipos ?? []).length ? `: ${(rasgos.tipos ?? []).map((t) => `${t.nombre || "C"} ${t.forma ? `${t.forma} ` : ""}${m2(t.b)}×${m2(t.h)}`).join(", ")}` : ""}`, "plano"));
  if (rasgos.placas) ident.push(fila("Placas o columnas alargadas", "sí (algún lado ≥ 0.90 m)", "plano"));
  if (rasgos.columnetas) ident.push(fila("Columnetas de confinamiento", String(rasgos.columnetas), "plano"));
  const ambientes = [rasgos.banos && "baños o duchas (losa maciza)", rasgos.agua && "cisterna o tanque", rasgos.deportivo && "ambiente deportivo"].filter(Boolean);
  if (ambientes.length) ident.push(fila("Ambientes que cambian la estructura", ambientes.join(", "), "plano"));
  if (techo?.linea) {
    ident.push(fila("Techo", `a dos aguas, cumbrera${techo.eje ? ` sobre el eje ${techo.eje}` : ""}${techo.H ? ` a +${m2(techo.H)} m` : ""}, faldones ${[...new Set([techo.pendientes.neg, techo.pendientes.pos])].map((p) => `${Math.round(p * 10000) / 100} %`).join(" y ")}`, "plano", {nota: "Del perfil de los cortes de la arquitectura."}));
  } else if (rasgos.cubierta || rasgos.techoLiviano) {
    ident.push(fila("Techo", "cobertura liviana o inclinada anotada", "plano"));
  }
  secciones.push({titulo: "Lo que identifiqué en el plano de arquitectura", filas: ident});

  // ---- 2. Validación con la norma (antes del análisis) ----
  const val = [];
  const tipos = rasgos.tipos ?? [];
  const chicas = tipos.filter((t) => Math.min(t.b, t.h) < 0.25 - 1e-9 || Math.min(t.b, t.h) / Math.max(t.b, t.h) < 0.25);
  if (tipos.length) val.push(fila("Sección de columnas", chicas.length ? `revisar: ${chicas.map((t) => `${t.nombre} ${m2(t.b)}×${m2(t.h)}`).join(", ")}` : "todas ≥ 0.25 m y proporción ≥ 0.25", "norma",
    {estado: chicas.length ? "revisar" : "cumple", cita: VERIFICADAS.columnasPorticos.norma, nota: VERIFICADAS.columnasPorticos.dice}));
  const luzLosa = Number(rasgos.luzLosa) || 0, luzMax = Number(rasgos.luzMax) || 0;
  const espesor = Number(dec.espesorLosa?.valor) || 0.2;
  if (luzLosa) {
    const extremo = libre(luzLosa) / 18.5, interior = libre(luzLosa) / 21;
    val.push(fila("Espesor de aligerado", `luz ${m2(luzLosa)} m → mínimo ${m2(interior)} m (ambos extremos continuos) / ${m2(extremo)} m (un extremo); propuesto ${m2(espesor)} m`, "norma",
      {estado: espesor + 1e-9 >= extremo ? "cumple" : espesor + 1e-9 >= interior ? "revisar" : "no cumple", cita: VERIFICADAS.espesorAligerado.norma, nota: "Con un espesor menor hay que calcular las deflexiones."}));
  }
  if (luzMax) {
    const hNorma = libre(luzMax) / 18.5;
    val.push(fila("Peralte de vigas", `luz mayor ${m2(luzMax)} m → mínimo ${m2(hNorma)} m para no verificar deflexiones; ancho ≥ 0.25 m`, "norma",
      {cita: `${VERIFICADAS.espesorAligerado.norma} y ${VERIFICADAS.anchoVigas.norma}`, nota: "El análisis sísmico (deriva) suele pedir más."}));
  }
  const categoria = String(datos.categoria ?? "").toUpperCase();
  val.push(fila("Estudio de Mecánica de Suelos", /^A|^B/.test(categoria) || rasgos.deportivo ? "obligatorio para este uso" : "obligatorio en edificaciones del art. 3; necesario para la presión admisible y el Df", "norma",
    {cita: VERIFICADAS.ems.norma, nota: VERIFICADAS.ems.dice}));
  const v = versionE030(datos);
  val.push(fila("Norma sismorresistente", `E.030-${v.version}`, v.confirmada ? "dato" : "falta", {estado: v.confirmada ? "cumple" : "revisar", nota: v.aviso}));
  val.push(fila("Regularidad y deriva", "se verifican con el análisis sísmico", "norma", {cita: "E.030 (tablas 8, 9 y 11)", nota: "Irregularidades en planta y altura, deriva ≤ 0.007 en concreto armado."}));
  secciones.push({titulo: "Validación con la norma (preliminar, antes del análisis)", filas: val});

  // ---- 3. Datos que faltan ----
  const faltan = [];
  if (!datos.zona && !datos.ubicacion) faltan.push(fila("Ubicación o zona sísmica", "para Z (E.030)", "falta"));
  if (!datos.suelo) faltan.push(fila("Perfil de suelo", "del EMS, para S, Tp y TL (E.030)", "falta"));
  if (!datos.categoria) faltan.push(fila("Uso o categoría", "para el factor U (E.030 tabla 5)", "falta"));
  if (!(Number(datos.qadm) > 0)) faltan.push(fila("Presión admisible (q adm)", "del EMS (E.050 art. 17)", "falta"));
  if (!(Number(datos.df) > 0)) faltan.push(fila("Profundidad de desplante (Df)", "del EMS (E.050 art. 19)", "falta"));
  if (!v.confirmada) faltan.push(fila("Versión de la E.030", "2018 si tenía licencia antes de la RM 183-2026; si no, 2026", "falta"));
  secciones.push({titulo: "Datos que faltan para diseñar", filas: faltan.length ? faltan : [fila("—", "Están todos los datos del proyecto.", "dato")]});

  // ---- 4. Recomendación del agente ----
  const rec = [];
  const sistema = rasgos.placas ? "pórticos de concreto armado con placas o columnas alargadas" : rasgos.columnas >= 4 ? "pórticos de concreto armado" : "albañilería confinada";
  rec.push(fila("Sistema estructural", sistema, "plano", {nota: [rasgos.placas ? "Si es de pórticos o dual lo decide el análisis, por el cortante que toman las placas (E.030)." : "", rasgos.columnetas ? `Los muros de albañilería se confinan con ${rasgos.columnetas} columnetas.` : ""].filter(Boolean).join(" ")}));
  const cim = dec.cimentacion?.valor;
  if (cim) rec.push(fila("Cimentación", cim === "platea" ? "platea de cimentación con viga perimetral" : "zapatas con vigas de cimentación", "despacho",
    {nota: `${razon(dec.cimentacion)} Se confirma con el EMS (${VERIFICADAS.profundidad.norma}).`}));
  rec.push(fila("Losa", `aligerada e=${m2(espesor)} m${rasgos.banos ? "; maciza en baños" : ""}`, dec.espesorLosa?.valor ? "despacho" : "predimensionamiento", {nota: `${razon(dec.espesorLosa)} ${VERIFICADAS.espesorAligerado.norma}.`}));
  if (luzMax) rec.push(fila("Vigas", `peralte ≈ ${m2(Math.max(0.4, Math.ceil((luzMax / 11) * 20) / 20))} m (luz/10 a luz/12), ancho 0.25–0.30 m`, "predimensionamiento",
    {nota: `Regla práctica de predimensionamiento, no es norma; cumple el mínimo de ${VERIFICADAS.espesorAligerado.norma} y ${VERIFICADAS.anchoVigas.norma}.`}));
  rec.push(fila("Columnas", "las de la arquitectura, verificadas con el análisis", "plano", {nota: "Se agrandan o se agregan placas si la deriva o el diseño no cumplen."}));
  rec.push(fila("Concreto y acero", "f'c = 210 kg/cm²; acero ASTM A615 grado 60", "norma", {cita: `${VERIFICADAS.concretoSismico.norma} y ${VERIFICADAS.aceroSismico.norma}`}));
  secciones.push({titulo: "Recomendación del agente", filas: rec});

  const pendientes = [...val, ...ident].filter((f) => f.estado === "revisar" || f.estado === "no cumple");
  const texto = [`INFORME DE LECTURA DE LA ARQUITECTURA${titulo ? ` — ${titulo}` : ""}`,
    ...secciones.flatMap((s, i) => [`\n${i + 1}. ${s.titulo}`, ...s.filas.map((f) => `• ${f.dato}: ${f.valor}${f.estado ? ` [${f.estado.toUpperCase()}]` : ""}${f.cita ? ` (${f.cita})` : ""} — ${ETIQUETA[f.fuente] ?? f.fuente}${f.nota ? `. ${f.nota}` : ""}`)]),
    `\nPropuesta preliminar del agente: la revisa y firma el ingeniero (${VERIFICADAS.firma.norma}).`].join("\n");
  return {secciones, faltan: faltan.length, pendientes, texto, html: informeHtml({secciones, titulo})};
}

function razon(d) {
  if (!d?.valor) return "Criterio por defecto del despacho.";
  return d.regla ? `Regla del despacho: ${d.regla}.` : d.fuentes?.length ? `Así lo resolvieron ${d.fuentes.length} proyecto(s) parecido(s) del despacho.` : "Costumbre del despacho.";
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const COLOR = {cumple: "#1a7f37", revisar: "#9a6700", "no cumple": "#cf222e"};

// Documento para el cliente: ordenado, con la fuente de cada dato y la norma que lo respalda.
export function informeHtml({secciones, titulo}) {
  const fecha = new Date().toISOString().slice(0, 10);
  const tablas = secciones.map((s, i) => `<section><h2>${i + 1}. ${esc(s.titulo)}</h2><table><colgroup><col class="t"><col class="r"><col class="f"><col></colgroup><thead><tr><th>Tema</th><th>Resultado</th><th>Fuente</th><th>Fundamento</th></tr></thead><tbody>${
    s.filas.map((f) => `<tr><td>${esc(f.dato)}</td><td>${esc(f.valor)}${f.estado ? ` <b style="color:${COLOR[f.estado] ?? "#57606a"}">${esc(f.estado.toUpperCase())}</b>` : ""}</td><td>${esc(ETIQUETA[f.fuente] ?? f.fuente)}</td><td>${f.cita ? `<b>${esc(f.cita)}</b> ` : ""}${esc(f.nota ?? "")}</td></tr>`).join("")}</tbody></table></section>`).join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe de lectura de la arquitectura</title><style>
body{font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#1f2328;max-width:1000px;margin:24px auto;padding:0 16px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:28px 0 8px;border-bottom:2px solid #0969da;padding-bottom:4px}
.sub{color:#57606a;margin:0 0 16px}table{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed}col.t{width:22%}col.r{width:30%}col.f{width:14%}th,td{border:1px solid #d0d7de;padding:6px 8px;vertical-align:top;text-align:left}
th{background:#f6f8fa}td:first-child{white-space:nowrap;font-weight:600}.pie{margin-top:28px;color:#57606a;font-size:12px}
@media print{body{margin:0}h2{break-after:avoid}tr{break-inside:avoid}}</style></head><body>
<h1>Informe de lectura de la arquitectura</h1><p class="sub">${esc(titulo || "Proyecto")} · ${fecha} · NovaCad</p>${tablas}
<p class="pie">Propuesta preliminar del agente, antes de dibujar las láminas de estructuras. Normas citadas: E.060 DS 010-2009-VIVIENDA y E.050 (artículos verificados en el texto), E.030. Los cálculos, planos y especificaciones los aprueba y firma un Ingeniero Civil Colegiado (${esc(VERIFICADAS.firma.norma)}).</p>
</body></html>`;
}
