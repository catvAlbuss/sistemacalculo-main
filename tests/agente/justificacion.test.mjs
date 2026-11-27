// El agente justifica cada decisión (norma, fuente, alternativas) y aconseja y ejecuta los pedidos del
// cliente sobre las láminas, dejándolos escritos.
import test from 'node:test';
import assert from 'node:assert/strict';
import {registroDeDecisiones, buscarDecisiones, textoDecision, resumenRegistro} from '../../resources/js/ingenieria/criterios/justificacion.js';
import {reconocerPedido, pedidoPorId, preferenciaDe, aplicarPreferencias} from '../../resources/js/ingenieria/agente/preferenciasCliente.js';
import {notasTecnicas} from '../../resources/js/ingenieria/laminas/formatoDespacho.js';
import {rutaDirecta} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {L} from '../../resources/js/ingenieria/cad/primitives.js';

const modelo = {
  cimentacion: {tipo: 'platea', hz: 0.6, df: 2, fuentes: {hz: 'dato del proyecto', df: 'criterio del despacho'}},
  losa: {espesor: 0.2}, vigas: [{eje: 'A', b: 0.3, h: 0.4}], columnas: [{tipo: 'C1', b: 0.5, h: 0.5}],
  refuerzoColumnas: [{tipo: 'C1', refuerzo: '12Ø5/8"'}], cubierta: {pendiente: 0.4, cumbrera: 5.91, pendientes: {neg: 0.4, pos: 0.5095}, fuente: 'cortes de la arquitectura', ejeCumbrera: 'C'},
};
const propuesta = {decisiones: {cimentacion: {valor: 'platea', fuentes: ['a', 'b', 'c'], confianza: 0.9}}};

test('cada decisión dice por qué, con qué norma y de dónde salió', () => {
  const R = registroDeDecisiones({modelo, propuesta, datos: {normaE030: '2018'}});
  const rec = R.find((d) => d.elemento === 'recubrimientos');
  assert.deepEqual(rec.cita, {norma: 'E.060 7.7.1', estado: 'confirmada'});
  assert.equal(rec.fuente, 'norma');
  const cim = R.find((d) => d.elemento === 'tipo de cimentación');
  assert.equal(cim.fuente, 'despacho');
  assert.match(cim.porque, /3 caso\(s\) parecido\(s\)/);
  assert.ok(cim.alternativas.length);
  assert.equal(R.find((d) => d.elemento === 'espesor de platea Hz').fuente, 'proyecto');
  assert.equal(R.find((d) => d.elemento === 'profundidad de desplante Df').fuente, 'supuesto');
  assert.equal(R.find((d) => d.elemento === 'techo inclinado').fuente, 'plano');
  assert.equal(R.find((d) => d.elemento === 'secciones de vigas').valor, '0.30x0.40');
  // Lo que no tiene artículo confirmado lo dice.
  assert.match(textoDecision(R.find((d) => d.elemento === 'estribos de vigas')), /por cotejar con el texto oficial/);
  const r = resumenRegistro(R);
  assert.ok(r.confirmadas >= 3 && r.supuestos.some((d) => /desplante/.test(d.elemento)));
});

test('las preguntas encuentran su decisión', () => {
  const pref = preferenciaDe(pedidoPorId('sin_columnas'), 'aligerado');
  const R = registroDeDecisiones({modelo, propuesta, preferencias: [pref]});
  assert.deepEqual(buscarDecisiones(R, 'pusiste platea').map((d) => d.elemento), ['tipo de cimentación']);
  assert.deepEqual(buscarDecisiones(R, 'en que norma esta el recubrimiento').map((d) => d.elemento), ['recubrimientos']);
  assert.deepEqual(buscarDecisiones(R, 'no hay columnas en el aligerado').map((d) => d.fuente), ['cliente']);
});

test('los pedidos del cliente se reconocen, se aconsejan con la norma y se aplican a la lámina', () => {
  assert.equal(reconocerPedido('quiero mis láminas sin columnas').pedido.id, 'sin_columnas');
  assert.equal(reconocerPedido('vuelve a poner las columnas').deshacer, true);
  assert.equal(reconocerPedido('quita los pórticos').pedido.id, 'sin_porticos');
  assert.equal(reconocerPedido('dibuja las columnetas'), null);
  const col = (layer) => ({type: 'line', layer, a: [0, 0], b: [1, 1]});
  const bloques = [
    {id: 'cimentacion', tipo: 'cimentacion', contenido: {primitivas: [col(L.COLUMNAS), col(L.EJES)]}},
    {id: 'aligerado', tipo: 'losa', contenido: {primitivas: [col(L.COLUMNAS), col(L.COLUMNAS_ID), col(L.VIGAS)]}},
    {id: 'cuadroColumnas', tipo: 'cuadroColumnas', contenido: {primitivas: [col(L.CUADROS)]}},
  ];
  const solo = aplicarPreferencias(bloques, [preferenciaDe(pedidoPorId('sin_columnas'), 'aligerado')]);
  assert.deepEqual(solo.find((b) => b.id === 'aligerado').contenido.primitivas.map((p) => p.layer), [L.VIGAS]);
  assert.equal(solo.find((b) => b.id === 'cimentacion').contenido.primitivas.length, 2);
  const todo = aplicarPreferencias(bloques, [preferenciaDe(pedidoPorId('sin_columnas'), 'todo')]);
  assert.ok(!todo.some((b) => b.id === 'cuadroColumnas'));
  const notas = notasTecnicas({pedidosCliente: ['Columnas no dibujadas en la planta de aligerado.']}).primitivas.map((p) => p.value);
  assert.ok(notas.includes('- A pedido del propietario: Columnas no dibujadas en la planta de aligerado.'));
  assert.ok(notas.some((t) => /E\.060 \(2009\)/.test(t)) && notas.includes('4) RECUBRIMIENTOS (E.060 7.7.1)'));
});

test('el chat lleva cada frase a justificar o al pedido, sin IA', async () => {
  assert.equal(rutaDirecta('¿por qué pusiste platea?').tool, 'justificar');
  assert.equal(rutaDirecta('justifica la viga de 0.40').args.tema, 'la viga de 0.40');
  assert.equal(rutaDirecta('de dónde sale el Df').tool, 'justificar');
  assert.equal(rutaDirecta('quiero mis láminas sin columnas').tool, 'preferencia_laminas');
  assert.equal(rutaDirecta('borra las láminas').tool, 'quitar_laminas');
  // Sin láminas: aconseja primero, ejecuta lo elegido y lo deja para las próximas láminas.
  const ctx = {memoria: {}};
  const pref = SKILLS.find((s) => s.name === 'preferencia_laminas');
  const consejo = await pref.run({texto: 'quiero mis láminas sin columnas'}, ctx);
  assert.match(consejo.mensaje, /GE\.020/);
  assert.ok(consejo.opciones[0].recomendada && consejo.opciones.at(-1).args.opcion === 'dejar');
  const hecho = await pref.run(consejo.opciones[0].args, ctx);
  assert.match(hecho.mensaje, /Lo aplico cuando genere las láminas/);
  assert.equal(ctx.memoria.preferencias.length, 1);
  await pref.run({texto: 'vuelve a poner las columnas'}, ctx);
  assert.equal(ctx.memoria.preferencias.length, 0);
  const sinLaminas = await SKILLS.find((s) => s.name === 'justificar').run({tema: 'viga'}, {memoria: {}});
  assert.equal(sinLaminas.ok, false);
});
