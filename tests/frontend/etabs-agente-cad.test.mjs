// Agente de Análisis Estructural por su cuenta: pedidos claros sin IA y respuestas con los números.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rutaCad, responderDato, textoRevision, textoDisenoColumnas, mensajesParaIA} from '../../resources/js/cad/engine/agenteCad.js';
import {revisarResultados} from '../../resources/js/cad/engine/revisionE030.js';

test('los pedidos claros van a su acción sin tokens', () => {
  const casos = {
    'ayuda': 'ayuda',
    'Analiza el sismo': 'analizarSismo',
    'corre el análisis espectral': 'analizarSismo',
    'revisa con la E.030': 'revisar',
    '¿cumple la norma?': 'revisar',
    'diseña las columnas': 'disenarColumnas',
    'verifica todas las columnas': 'disenarColumnas',
    'ajusta el acero de las que fallan': 'ajustarArmado',
    'envía el diseño a NovaCad': 'enviarDiseno',
    'manda el diseño a las láminas': 'enviarDiseno',
    'abre el modelo del agente': 'abrirModeloAgente',
    '¿cuánto es la deriva en Y?': 'dato',
    '¿cuál es el periodo fundamental?': 'dato',
  };
  for (const [texto, accion] of Object.entries(casos)) assert.equal(rutaCad(texto)?.accion, accion, texto);
  assert.equal(rutaCad('¿qué sección conviene para una luz de 7 m?'), null, 'lo abierto va a la IA');
});

const res = JSON.parse(readFileSync('python-backend/tests/response_seismic.json', 'utf8'));
const revision = (() => {
  const r = revisarResultados({direcciones: {X: {resultado: res}, Y: {resultado: res}}, R: 8, regular: true});
  return {...r, hayResultados: true, resumen: {texto: 'resumen', noCumple: r.verificaciones.filter((v) => v.estado === 'no_cumple').length}};
})();

test('preguntas de dato se responden con la revisión, por dirección', () => {
  const deriva = responderDato('¿cuánto es la deriva en X?', revision);
  assert.match(deriva, /Sismo X · Deriva inelástica máxima: 0.0077 → NO cumple/);
  assert.doesNotMatch(deriva, /Sismo Y/);
  assert.match(responderDato('periodo', revision), /Periodo fundamental/);
  assert.equal(responderDato('deriva', {verificaciones: []}), null);
  assert.match(textoRevision(revision), /✗ Sismo X · Deriva inelástica máxima: 0.0077/);
});

test('resumen del diseño de columnas y propuesta de acero', () => {
  const cols = [
    {label: 'C1 (Piso1)', check: {base: {ratio: 1.2}, top: {ratio: 0.9}}, propuesta: {n: 12, ratio: 0.93}},
    {label: 'C2 (Piso1)', check: {base: {ratio: 0.5}, top: {ratio: 0.4}}},
    {label: 'C3 (Piso1)', unsupported: true, unsupportedReason: 'forma no soportada'},
  ];
  const t = textoDisenoColumnas(cols);
  assert.match(t, /3 columna\(s\): 1 cumplen, 1 no cumplen, 1 sin diseño automático. Ratio máximo 1.20/);
  assert.match(t, /C1 \(Piso1\): D\/C 1.20 → con 12 varillas D\/C 0.93/);
});

test('a la IA le llegan solo los hechos y la pregunta', () => {
  const m = mensajesParaIA({pregunta: '¿por qué no cumple la deriva?', modelo: {nudos: 16}, revision});
  assert.match(m[0].content, /SOLO los números de HECHOS/);
  assert.match(m.at(-1).content, /PREGUNTA: ¿por qué no cumple la deriva\?/);
  assert.equal(JSON.parse(m.at(-1).content.split('\n')[1]).modelo.nudos, 16);
});
