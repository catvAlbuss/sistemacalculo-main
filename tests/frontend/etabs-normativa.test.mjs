// El agente sabe qué norma rige y no inventa valores: la E.030 cambió en 2026 (RM 183-2026-VIVIENDA)
// y sus tablas aún no están cargadas, así que avisa en vez de presentar la 2018 como vigente.
import test from 'node:test';
import assert from 'node:assert/strict';
import {versionE030, resumenNormativo, NORMAS_RNE, CITAS} from '../../resources/js/ingenieria/criterios/normativa.js';
import {datosParaLaminas, datosTecnicos} from '../../resources/js/ingenieria/criterios/datosProyecto.js';
import {analizarProyecto} from '../../resources/js/ingenieria/agente/analisisIngenieria.js';
import {memoriaDelAgente} from '../../resources/js/ingenieria/agente/conocimiento.js';

test('E.030 version: 2018 only for projects in the transition; unknown or 2026 is flagged', () => {
  assert.equal(versionE030({normaE030: '2018'}).nivel, 'info');
  assert.match(versionE030({normaE030: '2018'}).aviso, /transitoria de la RM 183-2026/);
  const nueva = versionE030({normaE030: '2026'});
  assert.equal(nueva.version, '2026');
  assert.equal(nueva.nivel, 'alto', 'its tables are not loaded yet: the agent must not pretend');
  assert.match(nueva.aviso, /no están cargadas/);
  const sin = versionE030({});
  assert.equal(sin.confirmada, false);
  assert.match(sin.aviso, /Confirma qué E\.030 rige/);
});

test('the project data form accepts the E.030 version and the sheets carry the warning', () => {
  assert.equal(datosTecnicos({normaE030: '2026'}).normaE030, '2026');
  const d = datosParaLaminas({hz: 0.6, df: 2.5, zona: 3, suelo: 'S2', categoria: 'A2'});
  assert.equal(d.sismo.norma, 'E.030-2018');
  assert.ok(d.avisos.some((a) => /Confirma qué E\.030 rige/.test(a)));
  const ok = datosParaLaminas({hz: 0.6, df: 2.5, zona: 3, suelo: 'S2', categoria: 'A2', normaE030: '2018'});
  assert.ok(!ok.avisos.some((a) => /E\.030/.test(a) && /rige|cargadas/.test(a)), 'confirmed 2018 project: no warning');
});

test('the engineering review cites the article and raises the code version when not confirmed', () => {
  const r = analizarProyecto({memoria: {}, datosProyecto: () => ({})});
  const n = r.hallazgos.find((h) => h.tema === 'normativa');
  assert.ok(n && n.nivel === 'alto');
  assert.equal(n.accion.herramienta, 'preguntar_ingeniero');
  assert.ok(Object.values(CITAS).every((c) => /^E\.0[2-7]0\b/.test(c)), 'every criterion cites an RNE standard');
});

test('the AI engine memory states which standards are in force and forbids inventing 2026 values', () => {
  const m = memoriaDelAgente();
  assert.match(m, /Normativa vigente/);
  assert.match(m, /RM 183-2026-VIVIENDA/);
  assert.match(m, /no inventes sus valores/);
  assert.equal(NORMAS_RNE['E.060'].version, '2009');
  assert.match(resumenNormativo(), /Una sola normativa por proyecto/);
});
