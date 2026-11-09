// Rótulo (membrete) de las láminas de estructuras: datos del proyecto y su escritura
// dentro de cada casilla de la plantilla, sin salirse ni encimarse.
//
// Los campos de la plantilla (estructuras-laminas.json → laminas[].rotulo) vienen del
// generador: {campo, x, y, alto, ancho, lineas, interlineado}. Los datos salen, en este
// orden, del formulario "Datos del proyecto" del panel, del rótulo de la arquitectura
// (si lo trae) y de lo que el agente ya sabe (nombre del módulo, plano, fecha).

import {L, text} from "./primitives.js";
import {CAPAS_DESPACHO} from "./estiloLaminas.js";

export const CAMPOS_PROYECTO = [
  {campo: "entidad", etiqueta: "Entidad / cliente", ejemplo: "MUNICIPALIDAD DISTRITAL DE …"},
  {campo: "proyecto", etiqueta: "Proyecto", ejemplo: "MEJORAMIENTO DE LOS SERVICIOS EDUCATIVOS …"},
  {campo: "cui", etiqueta: "CUI", ejemplo: "2166247"},
  {campo: "especialista", etiqueta: "Especialista", ejemplo: "ING. …"},
  {campo: "cip", etiqueta: "CIP", ejemplo: "101402"},
  {campo: "region", etiqueta: "Región", ejemplo: "Huánuco"},
  {campo: "provincia", etiqueta: "Provincia", ejemplo: "Huánuco"},
  {campo: "distrito", etiqueta: "Distrito", ejemplo: "Churubamba"},
  {campo: "localidad", etiqueta: "Localidad", ejemplo: "Vinchos"},
  {campo: "codigoLocal", etiqueta: "Código local", ejemplo: "192768"},
  {campo: "codigoModular", etiqueta: "Código modular", ejemplo: "0288852"},
];

// Etiquetas de un rótulo de arquitectura → campo.
const ETIQUETAS = [
  [/^PROYECTO\b/i, "proyecto"], [/^(ENTIDAD|PROPIETARIO|CLIENTE)\b/i, "entidad"], [/^REGI[OÓ]N\b/i, "region"], [/^(DEPARTAMENTO|DPTO)\b/i, "region"],
  [/^PROVINCIA\b/i, "provincia"], [/^DISTRITO\b/i, "distrito"], [/^LOCALIDAD\b/i, "localidad"], [/^C[OÓ]D(?:IGO)?\.?\s*LOCAL\b/i, "codigoLocal"],
  [/^C[OÓ]D(?:IGO)?\.?\s*MODULAR\b/i, "codigoModular"], [/^CUI\b/i, "cui"],
];

// Datos del rótulo de la arquitectura: el valor va después de los dos puntos
// ("REGIÓN: HUÁNUCO") o es el texto más cercano a la derecha en la misma fila.
export function datosDesdeArquitectura(items) {
  const textos = items.filter((it) => it.tipo === "texto" && it.texto);
  const datos = {};
  for (const t of textos) {
    const regla = ETIQUETAS.find(([re]) => re.test(t.texto.trim()));
    if (!regla || datos[regla[1]]) continue;
    const despues = t.texto.split(/:\s*/).slice(1).join(": ").trim();
    if (despues) { datos[regla[1]] = despues; continue; }
    const alto = t.alto || 0.1;
    const fila = textos.filter((o) => o !== t && o.centro.x > t.centro.x && o.centro.x - t.centro.x < alto * 60 && Math.abs(o.centro.y - t.centro.y) < alto * 0.7 && !ETIQUETAS.some(([re]) => re.test(o.texto.trim())));
    const valor = fila.sort((a, b) => a.centro.x - b.centro.x)[0];
    if (valor && !/^[:.\s]*$/.test(valor.texto)) datos[regla[1]] = valor.texto.replace(/^[:\s]+/, "").trim();
  }
  return datos;
}

// Ancho de un texto en unidades de dibujo con la fuente del visor (medido en pantalla:
// una línea de 92 caracteres en mayúsculas a h=0.081 ocupa 5.79 → ~0.85 h por mayúscula).
export const anchoTexto = (s, h) => [...String(s)].reduce((a, c) => a + (/[A-ZÁÉÍÓÚÑ@%MW]/.test(c) ? 0.85 : /[0-9]/.test(c) ? 0.68 : /[il.,:;'|!]/.test(c) ? 0.32 : c === " " ? 0.34 : 0.66), 0) * h;

// Parte el texto en renglones de ancho máximo a la altura h.
function renglones(valor, ancho, h) {
  const palabras = String(valor).split(/\s+/).filter(Boolean);
  const lineas = [];
  let actual = "";
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (anchoTexto(prueba, h) <= ancho || !actual) actual = prueba;
    else { lineas.push(actual); actual = p; }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

// Escribe un valor en su casilla: hasta `max` renglones, achicando la letra (hasta el
// 55 % del alto de la plantilla) para que nada se salga de la casilla.
export function textoEnCasilla(campo, valor, {capa = L.LAMINA, max = Math.max(campo.lineas ?? 1, 1)} = {}) {
  if (valor === undefined || valor === null || String(valor).trim() === "") return [];
  let h = campo.alto, lineas = renglones(valor, campo.ancho, h);
  while ((lineas.length > max || lineas.some((l) => anchoTexto(l, h) > campo.ancho)) && h > campo.alto * 0.55) {
    h *= 0.93;
    lineas = renglones(valor, campo.ancho, h);
  }
  if (lineas.length > max) lineas = [...lineas.slice(0, max - 1), lineas.slice(max - 1).join(" ")];
  const paso = (campo.interlineado ?? campo.alto * 1.5) * (h / campo.alto);
  const color = CAPAS_DESPACHO[capa];
  return lineas.map((l, i) => ({...text(capa, [campo.x, campo.y - i * paso], l, h, 0, "izq"), ...(color !== undefined ? {color} : {})}));
}
