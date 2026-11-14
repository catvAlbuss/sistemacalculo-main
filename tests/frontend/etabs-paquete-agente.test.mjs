import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';

const base = 'docs/agentes/agente-predim';

test('the portable agent package matches the code: same tools for OpenAI/Ollama/Grok and Claude, one SKILL.md each', () => {
  const nombres = SKILLS.filter((s) => s.name !== 'zapatas_desde_plano').map((s) => s.name).sort();
  const openai = JSON.parse(readFileSync(`${base}/herramientas/openai.json`, 'utf8')).map((t) => t.function.name).sort();
  const claude = JSON.parse(readFileSync(`${base}/herramientas/anthropic.json`, 'utf8'));
  assert.deepEqual(openai, nombres, 'regenerate with: node scripts/agente/exportar-paquete.mjs');
  assert.deepEqual(claude.map((t) => t.name).sort(), nombres);
  assert.ok(claude.every((t) => t.input_schema?.type === 'object'), 'Claude tools need input_schema');
  for (const n of nombres) assert.ok(existsSync(`${base}/skills/${n}/SKILL.md`), `missing SKILL.md for ${n}`);
  const agente = readFileSync(`${base}/AGENTE.md`, 'utf8');
  assert.match(agente, /Memoria del Agente NovaCad/);
  assert.ok(JSON.parse(readFileSync(`${base}/evaluacion/casos.json`, 'utf8')).length >= 8);
});

test('the agent has learned from more than one reference expediente', () => {
  const resumen = readFileSync(`${base}/conocimiento/resumen-expedientes.md`, 'utf8');
  for (const m of ['modulo-03', 'modulo-09', 'modulo-14']) assert.ok(resumen.includes(m), `expediente ${m} not learned`);
  const m14 = JSON.parse(readFileSync(`${base}/conocimiento/expedientes/modulo-14.json`, 'utf8'));
  assert.equal(m14.estilo.ejes.capa, '49. EJES.');
  assert.ok(m14.criterios.estribos.some((e) => e.valor.startsWith('3/8": 1@0.05, 9@0.10')));
  assert.ok(!JSON.stringify(m14).includes('ALDO BARDALES'), 'no personal data in learned knowledge');
});
