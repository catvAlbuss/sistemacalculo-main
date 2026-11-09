import test from 'node:test';
import assert from 'node:assert/strict';
import {modelosInstalados, notaModelo} from '../../resources/js/etabs/agente/modelosAgente.js';

test('the model picker lists installed chat models with tools, recommended local first, embeddings excluded', async () => {
  const tags = {models: [
    {name: 'bge-m3:latest', capabilities: ['embedding'], details: {parameter_size: '566M'}},
    {name: 'coder-agent-8k:latest', capabilities: ['completion', 'tools'], details: {parameter_size: '7.6B'}},
    {name: 'gpt-oss:20b-cloud', remote_host: 'https://ollama.com', capabilities: ['completion', 'tools'], details: {parameter_size: '20.9B'}},
    {name: 'qwen3-cad:latest', capabilities: ['completion', 'tools', 'thinking'], details: {parameter_size: '4.0B'}},
  ]};
  let url = null;
  const lista = await modelosInstalados('http://127.0.0.1:11434/v1/', async (u) => { url = u; return {ok: true, json: async () => tags}; });
  assert.equal(url, 'http://127.0.0.1:11434/api/tags');
  assert.deepEqual(lista.map((m) => m.nombre), ['qwen3-cad', 'gpt-oss:20b-cloud', 'coder-agent-8k']);
  assert.equal(lista[0].apto, true);
  assert.equal(lista[1].nube, true);
  assert.equal(lista[2].apto, false, 'coder models do not call tools');
  assert.match(notaModelo('qwen3.5:4b-q4_K_M').nota, /imágenes/);
});
