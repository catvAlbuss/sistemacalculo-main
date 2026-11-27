// Uso simple del agente: etapas del proyecto, el siguiente paso y sugerencias según la etapa.
import test from 'node:test';
import assert from 'node:assert/strict';
import {estadoDelProyecto, siguientePaso, sugerencias, ACCIONES_PRINCIPALES, MAS_ACCIONES} from '../../resources/js/ingenieria/agente/flujoProyecto.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';

test('el siguiente paso acompaña al proyecto de punta a punta', () => {
  assert.equal(siguientePaso({}, 'vacio').herramienta, null);
  assert.equal(siguientePaso({}, 'leyendo').herramienta, null);
  // Primero el informe de lectura (qué identificó, norma, datos, recomendación); después, dibujar.
  const lectura = siguientePaso({}, 'lista');
  assert.equal(lectura.herramienta, 'informe_arquitectura');
  assert.deepEqual(lectura.alternativas.map((a) => a.herramienta), ['ciclo_completo', 'plano_estructuras']);
  const inicio = siguientePaso({informeArquitectura: {}}, 'lista');
  assert.equal(inicio.herramienta, 'ciclo_completo');
  assert.deepEqual(inicio.alternativas.map((a) => a.herramienta), ['plano_estructuras', 'construir_estructura']);
  const conLaminas = {modeloEstructural: {}};
  assert.equal(siguientePaso(conLaminas, 'lista').herramienta, 'ciclo_completo');
  assert.equal(siguientePaso({...conLaminas, esperandoAnalisis: 1}, 'lista').herramienta, null, 'esperando a Análisis');
  assert.equal(siguientePaso({...conLaminas, esperandoAnalisis: 1}, 'lista', {disenoPendiente: true}).herramienta, 'aplicar_diseno');
  const analizado = {...conLaminas, resultadosSismicos: {}, disenoColumnas: {}};
  assert.equal(siguientePaso(analizado, 'lista').herramienta, 'metrar_estructura');
  assert.equal(siguientePaso({...analizado, metrado: {}}, 'lista').herramienta, 'revisar_norma');
});

test('etapas: hecho, en curso, actual y pendiente', () => {
  const e = estadoDelProyecto({modeloEstructural: {}, esperandoAnalisis: 1}, 'lista');
  assert.deepEqual(e.etapas.map((x) => x.estado), ['hecho', 'hecho', 'en_curso', 'pendiente', 'pendiente']);
  assert.equal(e.actual, 'analisis');
});

test('sugerencias cortas según la etapa, y todas son herramientas que existen', () => {
  assert.deepEqual(sugerencias({}, 'vacio'), []);
  assert.equal(sugerencias({}, 'lista')[0].herramienta, 'ciclo_completo');
  assert.ok(sugerencias({modeloEstructural: {}}, 'lista').length <= 4);
  const nombres = new Set(SKILLS.map((s) => s.name));
  for (const a of [...ACCIONES_PRINCIPALES, ...MAS_ACCIONES, ...sugerencias({modeloEstructural: {}}, 'lista')]) assert.ok(nombres.has(a.herramienta), a.herramienta);
});

test('si la IA no responde, el botón igual hace su acción (sin IA) y lo dice', async () => {
  const {runAgent} = await import('../../resources/js/ingenieria/agente/agentRunner.js');
  const llamadas = [];
  const skills = [{name: 'plano_estructuras', description: 'x', parameters: {type: 'object', properties: {}}, run: async (args) => { llamadas.push(args); return {ok: true, mensaje: 'Generé las láminas E-01.'}; }}];
  const caida = async () => ({ok: false, status: 404, json: async () => ({}), text: async () => 'no'});
  const out = await runAgent({text: 'Genera las láminas', accionSolicitada: {herramienta: 'plano_estructuras', args: {}}, settings: {proveedor: 'servidor', model: 'servidor', rutaDirecta: false, maxReintentos: 0}, context: {memoria: {}}, skills, fetchImpl: caida});
  assert.equal(llamadas.length, 1);
  assert.match(out.reply, /La IA no respondió/);
  assert.match(out.reply, /hice la acción directamente/);
});
