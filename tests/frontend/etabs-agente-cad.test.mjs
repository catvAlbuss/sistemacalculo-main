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

test('modelo rápido: la frase se lee, lo que falta se predimensiona y el CAD lo abre', async () => {
  const {leerPedidoDeModelo, modeloRapido} = await import('../../resources/js/cad/engine/modeloRapido.js');
  const {leerE2k} = await import('../../scripts/agente/lectorE2k.mjs');
  assert.equal(rutaCad('crea un edificio de 3 pisos de 4x3 vanos de 5 m')?.accion, 'crearModelo');
  assert.equal(rutaCad('analiza el sismo')?.accion, 'analizarSismo');
  const p = leerPedidoDeModelo('arma un colegio de 2 niveles con vanos de 6 y 4.5 m, columnas 40x50, vigas 30x60, zona 3 suelo S3');
  assert.deepEqual([p.pisos, p.nx, p.luzX, p.luzY, p.categoria, p.zona, p.suelo], [2, null, 6, 4.5, 'A2', 3, 'S3']);
  assert.deepEqual([p.columna, p.viga], [{b: 0.4, h: 0.5}, {b: 0.3, h: 0.6}]);
  const g = modeloRapido('crea un edificio de 3 pisos, 4x3 vanos de 5 m, zona 4 suelo S2, vivienda');
  assert.equal(g.resumen.pisos, 3);
  assert.equal(g.resumen.columnas, 60);                 // 5 × 4 ejes × 3 pisos
  assert.deepEqual(g.resumen.secciones, ['C1-30X30', 'V-25X45']); // A = P/(0.45 f'c); h ≈ L/12
  assert.ok(g.supuestos.some((s) => /Losa aligerada de 0.20 m/.test(s)));
  const m = await leerE2k(g.texto);
  assert.equal(m.definitions.responseSpectrumCases.length, 2);
  assert.equal(m.model.areas.length, 36);
});

test('rigidizar por deriva: lado ≈ lado · (deriva/límite)^¼, redondeado a 5 cm', async () => {
  const {ladoParaDeriva} = await import('../../resources/js/cad/engine/modeloRapido.js');
  assert.equal(rutaCad('rigidiza para cumplir la deriva')?.accion, 'rigidizar');
  assert.equal(rutaCad('agranda las columnas')?.accion, 'rigidizar');
  assert.equal(ladoParaDeriva(0.30, 0.0212, 0.007), 0.45);   // (3.03 × 1.05)^¼ = 1.34 → 0.40 → 0.45
  assert.equal(ladoParaDeriva(0.40, 0.005, 0.007), 0.40, 'si cumple no cambia');
  assert.equal(ladoParaDeriva(1.0, 0.2, 0.007), 1.2, 'tope de 1.20 m');
});

test('rigidizar: horquilla + secante llega al menor lado que cumple sin pasarse', async () => {
  const {siguienteLado, exponenteDeriva} = await import('../../resources/js/cad/engine/modeloRapido.js');
  // Derivas medidas en el navegador (3 pisos, 3x2 vanos de 5 m, vigas 0.25x0.45, zona 4 S2).
  const pts = [[0.30, 0.0212], [0.45, 0.0142], [0.55, 0.0105], [0.65, 0.0081], [0.70, 0.0072]];
  const d = (l) => {
    for (let i = 1; i < pts.length; i++) if (l <= pts[i][0]) { const [l0, d0] = pts[i - 1], [l1, d1] = pts[i]; return Math.exp(Math.log(d0) + (Math.log(l / l0) / Math.log(l1 / l0)) * (Math.log(d1) - Math.log(d0))); }
    const [l0, d0] = pts.at(-2), [l1, d1] = pts.at(-1); return d1 * (l1 / l) ** (Math.log(d0 / d1) / Math.log(l1 / l0));
  };
  const h = [{lado: 0.30, deriva: d(0.30)}];
  let r;
  for (let k = 0; k < 8 && !(r = siguienteLado(h, 0.007)).listo; k++) h.push({lado: r.lado, deriva: d(r.lado)});
  assert.equal(r.listo, 0.75);
  assert.ok(h.length <= 6, `${h.length} análisis`);
  assert.ok(Math.abs(exponenteDeriva([{lado: 0.30, deriva: 0.0212}, {lado: 0.45, deriva: 0.0142}]) - 0.99) < 0.02, 'vigas flexibles: n ≈ 1');
});
