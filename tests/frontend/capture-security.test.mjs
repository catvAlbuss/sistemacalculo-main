import test from 'node:test';
import assert from 'node:assert/strict';
import { canLoadCaptureResource as allowed } from '../../scripts/capture-resource-policy.mjs';
test('capture keeps public result styles while denying internal services and executable resources',()=>{
  const origin='https://example.test';
  assert.equal(allowed(origin+'/build/assets/app.css','stylesheet',origin),true);
  assert.equal(allowed(origin+'/assets/result.png','image',origin),true);
  assert.equal(allowed('https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2/MathJax_Main-Regular.woff','font',origin),true);
  assert.equal(allowed('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js','script',origin),false);
  for(const [url,type] of [['http://127.0.0.1:5001/health','image'],['file:///etc/passwd','image'],[origin+'/admin','stylesheet'],[origin+'/build/app.js','script'],['https://evil.test/track','image'],['https://example.test@evil.test/build/app.css','stylesheet']]){
    assert.equal(allowed(url,type,origin),false,url);
  }
});
test('local Vite styles are allowed only when an explicit local development origin is supplied',()=>{
  const url='http://localhost:5173/resources/css/app.css';
  assert.equal(allowed(url,'stylesheet','http://127.0.0.1:8000'),false);
  assert.equal(allowed(url,'stylesheet','http://127.0.0.1:8000','http://localhost:5173'),true);
  assert.equal(allowed('https://evil.test/resources/css/app.css','stylesheet','https://example.test','https://evil.test'),false);
});
