import test from 'node:test';
import assert from 'node:assert/strict';
import {memoriaDelAgente} from '../../resources/js/ingenieria/agente/conocimiento.js';
import {promptDelSistema, usaMemoriaCompleta} from '../../resources/js/ingenieria/agente/agentRunner.js';
import {CRITERIOS} from '../../resources/js/ingenieria/criterios/criteriosEstructurales.js';

test('the agent memory carries the learned criteria, generated from CRITERIOS', () => {
  const m = memoriaDelAgente();
  for (const t of ["f'c=210", 'Hz=0.70', 'NFZ=-2.00', '1-1 muro exterior con puerta', '2 estribos', 'VCUMBRERA', 'TR4', 'pa, pb', 'NPN', 'plano_estructuras', 'Nunca inventes']) assert.ok(m.includes(t), `memory lacks "${t}"`);
  assert.ok(m.includes(`${Math.round(CRITERIOS.techo.pendiente * 100)} %`), 'values come from CRITERIOS, not copied by hand');
});

test('large or cloud engines get the full memory; small local Ollama models the short prompt', () => {
  const local = (model) => ({baseUrl: 'http://127.0.0.1:11434/v1', model, memoria: 'auto'});
  assert.equal(usaMemoriaCompleta(local('qwen3-cad')), false);
  assert.equal(usaMemoriaCompleta(local('qwen3.5:4b-q4_K_M')), false);
  assert.equal(usaMemoriaCompleta(local('gpt-oss:20b-cloud')), true);
  assert.equal(usaMemoriaCompleta({baseUrl: 'https://api.openai.com/v1', model: 'gpt-5', memoria: 'auto'}), true, 'ChatGPT on the server');
  assert.equal(usaMemoriaCompleta({baseUrl: '/api/agente/v1', model: 'claude', memoria: 'auto'}), true, 'Claude behind a Laravel proxy');
  assert.equal(usaMemoriaCompleta({...local('qwen3-cad'), memoria: 'completa'}), true);
  const corto = promptDelSistema(local('qwen3-cad')), largo = promptDelSistema({baseUrl: 'https://api.openai.com/v1', model: 'gpt-5'});
  assert.ok(corto.length < 1200 && corto.endsWith('/no_think'));
  assert.ok(largo.includes('Memoria del Agente Predim') && !largo.includes('/no_think'));
});
