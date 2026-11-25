// Consultas al ingeniero antes de dibujar: lo que el agente no tiene seguro (lo aprendido no basta,
// los casos no coinciden o lo que encontró en el plano cambia el criterio) se le pregunta con
// opciones, la recomendación del agente y el porqué. Lo que el ingeniero elige se dibuja y se
// guarda como aprendizaje (confirmación si coincide con lo propuesto, corrección si no).
//
// Sin panel (chat o scripts) no se espera respuesta: se dibuja con la recomendación y las
// consultas salen en el mensaje, para que el ingeniero corrija por chat.

import {nombreVisible} from "../aprendizaje/casos.js";

const MAX_CONSULTAS = 4;
const pct = (x) => `${Math.round((x ?? 0) * 100)} %`;
const lista = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} y ${xs.at(-1)}` : xs[0] ?? "");

// Por qué propone el agente lo que propone, en palabras del despacho.
function porque(d) {
  if (!d) return "Sin casos parecidos: es el criterio general del despacho.";
  if (d.regla) return `Criterio: ${d.regla}.`;
  if (d.fuentes?.length) return `Así lo resolvió el ingeniero en ${lista(d.fuentes.slice(0, 3).map(nombreVisible))} (confianza ${pct(d.confianza)}).`;
  return `Confianza ${pct(d.confianza)}.`;
}
const necesitaExperto = (d) => !d || Boolean(d.ingeniero) || (d.confianza ?? 0) < 0.8;

// rasgos/propuesta: de casos.js (proponer). ambientes: de ambientesDeLosa (escaleras, baños).
// niveles: los que se van a dibujar. Devuelve {consultas, informes}.
// Suelo blando (perfil S3 o S4 de la E.030): platea, que reparte la carga y controla los
// asentamientos diferenciales (Módulo 3 INICIAL: S3, un nivel, platea), por encima del área.
export const sueloBlando = (suelo) => /^S[34]$/i.test(String(suelo ?? "").trim());
export function cimentacionRecomendada(decision, suelo) {
  if (sueloBlando(suelo)) return {valor: "platea", porque: `Suelo ${String(suelo).toUpperCase()} (blando): la platea reparte la carga y controla los asentamientos diferenciales.`};
  return {valor: ["platea", "zapatas"].includes(decision?.valor) ? decision.valor : "platea", porque: porque(decision)};
}

// pendienteAnotada: la arquitectura escribe la pendiente del techo (PTE=33 %…): entonces no se pregunta.
export function consultasDelPlano({rasgos = {}, propuesta = {}, ambientes = [], niveles = rasgos.niveles ?? 1, suelo = null, pendienteAnotada = false}) {
  const d = propuesta.decisiones ?? {};
  const consultas = [], informes = [];

  const cim = d.cimentacion;
  if (necesitaExperto(cim)) {
    const rec = cimentacionRecomendada(cim, suelo);
    consultas.push({
      clave: "cimentacion", pregunta: "¿Qué cimentación uso?",
      opciones: [{valor: "platea", texto: "Platea de cimentación"}, {valor: "zapatas", texto: "Zapatas aisladas con cimiento corrido"}],
      recomendado: rec.valor,
      porque: `${rec.porque} La define el estudio de suelos (capacidad portante): confírmala con el EMS.`,
    });
  }

  // Las cisternas van en maciza sin preguntar; los baños, según haya pisos encima.
  const macizas = ambientes.filter((a) => a.tipo === "maciza" && a.motivo === "baños");
  for (const a of ambientes.filter((x) => x.tipo === "maciza" && x.motivo === "cisterna")) informes.push(`Losa maciza en la cisterna o tanque entre ejes ${a.ejes.join(" / ")}.`);
  if (macizas.length) {
    consultas.push({
      clave: "losaMaciza", ejes: macizas.map((a) => a.ejes), pregunta: `Encontré baños o SS.HH. entre ejes ${lista(macizas.map((a) => a.ejes.join(" / ")))}. ¿Losa maciza ahí?`,
      opciones: [{valor: true, texto: "Sí, losa maciza en esos paños"}, {valor: false, texto: "No, aligerado en toda la planta"}],
      recomendado: niveles >= 2,
      porque: niveles >= 2
        ? "Es losa de entrepiso: lleva encima los baños del piso de arriba y sus instalaciones sanitarias; así lo hizo el ingeniero en los edificios de varios niveles estudiados."
        : "Es la losa del techo (no hay baños encima): el ingeniero usó aligerado en los edificios de un nivel con baños.",
    });
  }
  for (const a of ambientes.filter((x) => x.tipo === "abertura")) {
    informes.push(`Escalera entre ejes ${a.ejes.join(" / ")}: dejo su vacío en la losa y dibujo su detalle predimensionado (confírmalo).`);
  }

  // Un nivel: losa bajo la cobertura o solo cobertura liviana varía entre proyectos parecidos.
  const techo = d.losaDeTecho;
  if (niveles <= 1 && necesitaExperto(techo)) {
    consultas.push({
      clave: "losaDeTecho", pregunta: "Es de un nivel. ¿El techo lleva losa aligerada o solo cobertura liviana?",
      opciones: [{valor: true, texto: "Losa aligerada (con cobertura encima si la hay)"}, {valor: false, texto: "Solo cobertura liviana (aluzinc) sobre vigas"}],
      recomendado: typeof techo?.valor === "boolean" ? techo.valor : true,
      porque: `${porque(techo)} Revisa la planta de techos y los cortes de la arquitectura.`,
    });
  }

  // Techo a dos aguas o plano: solo es dudoso si la arquitectura anota cobertura liviana pero no
  // escribe la pendiente (con PTE escrita es inclinado; sin cobertura anotada, plano). En la sierra
  // el despacho lo hace a dos aguas (medido en los pórticos de los proyectos estudiados).
  if (!pendienteAnotada && rasgos.cubierta) {
    consultas.push({
      clave: "techoDosAguas", pregunta: "La arquitectura anota cobertura pero no su pendiente. ¿El techo es a dos aguas o plano?",
      opciones: [{valor: true, texto: "A dos aguas (cumbrera al centro, a lo largo)"}, {valor: false, texto: "Plano"}],
      recomendado: true,
      porque: "Con cobertura liviana el despacho hace el techo a dos aguas, con su pendiente de 33 %.",
    });
  }

  // Estilo del plano de cimentación: el ingeniero alterna entre malla completa y bastones.
  const malla = d.mallaCimentacion;
  if (malla && necesitaExperto(malla)) {
    consultas.push({
      clave: "mallaCimentacion", pregunta: "¿Cimentación con malla completa o solo bastones?",
      opciones: [{valor: false, texto: "Solo bastones y llamada (más limpio)"}, {valor: true, texto: "Malla completa"}],
      recomendado: typeof malla.valor === "boolean" ? malla.valor : false,
      porque: `${porque(malla)} Es una preferencia de presentación del despacho.`,
    });
  }

  const esp = d.espesorLosa;
  // Solo cerca del límite del criterio (luz libre > 5 m): con luces chicas 0.20 no se discute.
  if (esp?.valor && necesitaExperto(esp) && (rasgos.luzLosa ?? 0) - 0.25 > 5) {
    consultas.push({
      clave: "espesorLosa", pregunta: `La luz de losa es ${rasgos.luzLosa} m entre ejes. ¿Qué espesor de aligerado?`,
      opciones: [0.2, 0.25, 0.3].map((v) => ({valor: v, texto: `e = ${v.toFixed(2)} m`})),
      recomendado: esp.valor, porque: porque(esp),
    });
  }
  return {consultas: consultas.slice(0, MAX_CONSULTAS), informes};
}

// Respuestas del ingeniero ({clave: valor}; lo no respondido queda con la recomendación) →
// lo que usa la generación y los eventos de aprendizaje que se guardan.
export function aplicarRespuestas(consultas, respuestas = {}) {
  const elegido = {}, eventos = [];
  for (const c of consultas) {
    const dado = respuestas[c.clave];
    const respondida = dado !== undefined && dado !== null && dado !== "";
    const valor = respondida ? normalizar(c, dado) : c.recomendado;
    elegido[c.clave] = valor;
    if (!respondida) continue;
    // La losa maciza se aprende como la decisión "Tipo de losa" del despacho.
    const clave = c.clave === "losaMaciza" ? "losa" : c.clave;
    const v = c.clave === "losaMaciza" ? (valor ? "aligerada y maciza" : "aligerada") : valor;
    const propuesto = c.clave === "losaMaciza" ? (c.recomendado ? "aligerada y maciza" : "aligerada") : c.recomendado;
    eventos.push({tipo: v === propuesto ? "confirmacion" : "correccion", clave, valor: v, propuesto});
  }
  return {elegido, eventos};
}

function normalizar(c, valor) {
  const op = c.opciones.find((o) => String(o.valor) === String(valor));
  return op ? op.valor : c.recomendado;
}

// Texto para el chat cuando no hay panel que pregunte (corto: vuelve al modelo de IA).
export function textoConsultas({consultas = [], informes = []}) {
  const corto = (t) => { const f = String(t).split(/(?<=\.)\s/)[0]; return f.length > 110 ? `${f.slice(0, 107)}…` : f; };
  const fmt = (c) => `• ${c.pregunta} Usé: ${c.opciones.find((o) => o.valor === c.recomendado)?.texto ?? c.recomendado} (${corto(c.porque)})`;
  return [
    ...(consultas.length ? ["Confírmame (dímelo y rehago las láminas):", ...consultas.map(fmt)] : []),
    ...informes.map((i) => `• ${i}`),
  ].join("\n");
}
