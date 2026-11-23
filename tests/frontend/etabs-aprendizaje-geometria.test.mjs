import test from 'node:test';
import assert from 'node:assert/strict';
import {compararGeometria, evaluarLeaveOneModuleOut} from '../../resources/js/ingenieria/aprendizaje/geometria.js';
import {geometriaDeLecturas, integrarGeometriaAprendida, rasgosDeArquitectura} from '../../resources/js/ingenieria/aprendizaje/casos.js';

const vista = ({dx = 0, dy = 0, escala = 1, columnas = [], ejes = true, losas = null} = {}) => ({
  version: 1,
  unidad: 'm',
  vistas: [{
    id: 'vista-01',
    nivel: 1,
    categorias: {
      ejes: ejes ? [
        {nombre: '1', p: {x: dx, y: dy}, q: {x: dx, y: dy + 6 * escala}},
        {nombre: '2', p: {x: dx + 4 * escala, y: dy}, q: {x: dx + 4 * escala, y: dy + 6 * escala}},
        {nombre: 'A', p: {x: dx, y: dy}, q: {x: dx + 4 * escala, y: dy}},
        {nombre: 'B', p: {x: dx, y: dy + 6 * escala}, q: {x: dx + 4 * escala, y: dy + 6 * escala}},
      ] : null,
      columnas,
      murosVanos: null,
      losas,
    },
  }],
});

const columna = (eje, x, y, b = 0.4, h = 0.4) => ({
  eje, centro: {x, y}, b, h, forma: 'rectangular',
});

test('geometry descriptors anonymize view titles and preserve recognized meter geometry per level', () => {
  const descriptor = geometriaDeLecturas([
    {titulo: 'CLIENTE CONFIDENCIAL PLANTA 1ER NIVEL', lectura: {
      ejes: [{nombre: '1', p: {x: 100, y: 200}, q: {x: 100, y: 800}}],
      columnas: [{eje: '1/A', x: 100, y: 200, nodo: {x: 100, y: 200}, b: 0.4, h: 0.5, forma: 'rectangular'}],
      listaColumnetas: [],
    }},
    {titulo: 'CLIENTE CONFIDENCIAL PLANTA 2DO NIVEL', lectura: {
      ejes: [{nombre: '1', p: {x: 100, y: 200}, q: {x: 100, y: 800}}],
      columnas: [], listaColumnetas: [],
    }},
  ]);

  assert.equal(descriptor.unidad, 'm');
  assert.deepEqual(descriptor.vistas.map(({id, nivel}) => ({id, nivel})), [
    {id: 'vista-01', nivel: 1}, {id: 'vista-02', nivel: 2},
  ]);
  assert.deepEqual(descriptor.vistas[0].categorias.columnas, [
    {eje: '1/A', centro: {x: 0, y: 0}, b: 0.4, h: 0.5, forma: 'rectangular'},
  ]);
  assert.equal(descriptor.vistas[0].categorias.murosVanos, null);
  assert.equal(descriptor.vistas[0].categorias.losas, null);
  assert.doesNotMatch(JSON.stringify(descriptor), /CLIENTE CONFIDENCIAL/);
});

test('reports perfect category F1 for exact geometry', () => {
  const geometry = vista({columnas: [columna('1/A', 0, 0)]});
  const result = compararGeometria(geometry, geometry);

  assert.equal(result.categorias.ejes.f1, 1);
  assert.equal(result.categorias.columnas.f1, 1);
  assert.equal(result.f1Macro, 1);
});

test('counts missing and extra geometry as false negatives and false positives', () => {
  const expected = vista({columnas: [columna('1/A', 0, 0), columna('2/B', 4, 6)]});
  const generated = vista({columnas: [columna('1/A', 0, 0), columna('2/B', 4.8, 6)]});
  const result = compararGeometria(expected, generated);

  assert.deepEqual(
    (({tp, fp, fn}) => ({tp, fp, fn}))(result.categorias.columnas),
    {tp: 1, fp: 1, fn: 1},
  );
  assert.equal(result.categorias.columnas.f1, 0.5);
});

test('matches equivalent geometry after origin shift and uniform scale change', () => {
  const expected = vista({columnas: [columna('1/A', 0, 0)]});
  const generated = vista({dx: 31, dy: -12, escala: 3, columnas: [columna('1/A', 31, -12, 1.2, 1.2)]});
  const result = compararGeometria(expected, generated);

  assert.equal(result.categorias.ejes.f1, 1);
  assert.equal(result.categorias.columnas.f1, 1);
});

test('does not hide a changed aspect ratio by independently rescaling each axis', () => {
  const expected = vista({columnas: []});
  const generated = vista({columnas: []});
  for (const eje of generated.vistas[0].categorias.ejes) {
    eje.p.x *= 2;
    eje.q.x *= 2;
  }
  const result = compararGeometria(expected, generated);

  assert.ok(result.categorias.ejes.f1 < 1);
});

test('a small physical offset beyond the fixed meter tolerance is not a match', () => {
  const expected = vista({columnas: [columna('1/A', 0, 0)]});
  const generated = vista({columnas: [columna('1/A', 0.1, 0)]});
  const result = compararGeometria(expected, generated);

  assert.equal(result.categorias.columnas.tp, 0);
  assert.equal(result.categorias.columnas.fp, 1);
  assert.equal(result.categorias.columnas.fn, 1);
  assert.equal(result.tolerancias.columnas, 0.05);
});

test('rejects caller tolerances above the bounded category maxima', () => {
  const geometry = vista({columnas: []});

  assert.throws(() => compararGeometria(geometry, geometry, {columnas: 0.2}), /columnas.*0\.05/i);
});

test('marks categories absent from the reference as not applicable', () => {
  const expected = vista({columnas: [], losas: null});
  const generated = vista({columnas: [], losas: [{contorno: [{x: 0, y: 0}]}]});
  const result = compararGeometria(expected, generated);

  assert.equal(result.categorias.losas.aplicable, false);
  assert.equal(result.categorias.losas.f1, null);
  assert.equal(result.f1Macro, 1);
});

test('does not claim the 0.90 target until all required categories have truth data', () => {
  const geometry = vista({columnas: [columna('1/A', 0, 0)], losas: null});
  const result = compararGeometria(geometry, geometry);

  assert.equal(result.f1Macro, 1);
  assert.deepEqual(result.coberturaCategorias, {
    aplicables: 2,
    requeridas: 4,
    fraccion: 0.5,
    completa: false,
    faltantes: ['murosVanos', 'losas'],
  });
  assert.equal(result.estado, 'incompleta');
  assert.equal(result.objetivoAlcanzado, false);
});

test('requires truth data for each category on every expected level', () => {
  const nivel1 = vista({columnas: []}).vistas[0];
  const nivel2 = {
    ...vista({columnas: []}).vistas[0],
    id: 'vista-02',
    nivel: 2,
    categorias: {...vista({columnas: []}).vistas[0].categorias, columnas: null},
  };
  const geometry = {version: 1, unidad: 'm', vistas: [nivel1, nivel2]};
  const result = compararGeometria(geometry, geometry);

  assert.equal(result.coberturaCategorias.completa, false);
  assert.ok(result.coberturaCategorias.faltantes.includes('columnas'));
  assert.equal(result.objetivoAlcanzado, false);
});

test('does not award a complete perfect score when generated categories are unreported', () => {
  const expected = vista({columnas: [], losas: []});
  expected.vistas[0].categorias.murosVanos = [];
  const generated = vista({columnas: [], losas: []});
  generated.vistas[0].categorias.murosVanos = [];
  generated.vistas[0].categorias.losas = null;
  const result = compararGeometria(expected, generated);

  assert.equal(result.categorias.losas.f1, 1);
  assert.equal(result.completa, false);
  assert.equal(result.coberturaSalida.completa, false);
  assert.equal(result.objetivoAlcanzado, false);
});

test('matches reordered views by level instead of ordinal view IDs', () => {
  const nivel1 = vista({columnas: [columna('1/A', 0, 0)]}).vistas[0];
  const nivel2 = {...vista({columnas: [columna('2/B', 4, 6)]}).vistas[0], nivel: 2};
  const expected = {version: 1, unidad: 'm', vistas: [
    {...nivel1, id: 'vista-01', nivel: 1},
    {...nivel2, id: 'vista-02', nivel: 2},
  ]};
  const generated = {version: 1, unidad: 'm', vistas: [
    {...nivel2, id: 'vista-01', nivel: 2},
    {...nivel1, id: 'vista-02', nivel: 1},
  ]};
  const result = compararGeometria(expected, generated);

  assert.equal(result.categorias.columnas.f1, 1);
  assert.equal(result.vistas.pareadas.length, 2);
});

test('flags views without semantic level identity as unscored and withholds the target', () => {
  const nivel1 = {...vista({columnas: [columna('1/A', 0, 0)]}).vistas[0], id: 'vista-01', nivel: 1};
  const nivel2 = {...vista({columnas: [columna('2/B', 4, 6)]}).vistas[0], id: 'vista-02', nivel: 2};
  const expected = {version: 1, unidad: 'm', vistas: [nivel1, nivel2]};
  const generated = {version: 1, unidad: 'm', vistas: [{...nivel1, id: 'vista-99'}]};
  const result = compararGeometria(expected, generated);

  assert.deepEqual(result.vistas.noEmparejadasEsperadas, [{id: 'vista-02', nivel: 2}]);
  assert.equal(result.coberturaVistas.completa, false);
  assert.equal(result.completa, false);
  assert.equal(result.objetivoAlcanzado, false);
});

test('leave-one-module-out callback receives every other module but never the target', () => {
  const casos = [
    {grupo: 'proyecto-01', id: 'modulo-01', geometria: vista({columnas: [columna('1/A', 0, 0)]})},
    {grupo: 'proyecto-01', id: 'modulo-02', geometria: vista({columnas: [columna('1/A', 0, 0)]})},
    {grupo: 'proyecto-02', id: 'modulo-01', geometria: vista({columnas: [columna('1/A', 0, 0)]})},
    {grupo: 'proyecto-02', id: 'modulo-02', geometria: vista({columnas: [columna('1/A', 0, 0)]})},
  ];
  const exclusiones = [];
  const result = evaluarLeaveOneModuleOut(casos, ({objetivo, ejemplos}) => {
    exclusiones.push({
      objetivo: `${objetivo.grupo}/${objetivo.id}`,
      ejemplos: ejemplos.map((caso) => `${caso.grupo}/${caso.id}`),
    });
    return ejemplos[0].geometria;
  });

  assert.deepEqual(exclusiones, [
    {objetivo: 'proyecto-01/modulo-01', ejemplos: ['proyecto-01/modulo-02']},
    {objetivo: 'proyecto-01/modulo-02', ejemplos: ['proyecto-01/modulo-01']},
    {objetivo: 'proyecto-02/modulo-01', ejemplos: ['proyecto-02/modulo-02']},
    {objetivo: 'proyecto-02/modulo-02', ejemplos: ['proyecto-02/modulo-01']},
  ]);
  assert.equal(result.resultados.length, 4);
  assert.ok(result.resultados.every((fila) => fila.categorias.columnas.f1 === 1));
  assert.deepEqual(result.tolerancias, {
    unidad: 'm', ejes: 0.05, columnas: 0.05, murosVanos: 0.1, losas: 0.1,
  });
});

test('leave-one-module-out excludes every duplicate target module without mixing project groups', () => {
  const casos = [
    {grupo: 'proyecto-01', id: 'modulo-01', copia: 'a', geometria: vista({columnas: []})},
    {grupo: 'proyecto-01', id: 'modulo01', copia: 'b', geometria: vista({columnas: []})},
    {grupo: 'proyecto-01', id: 'modulo-02', copia: 'c', geometria: vista({columnas: []})},
    {grupo: 'proyecto-02', id: 'modulo-01', copia: 'd', geometria: vista({columnas: []})},
    {grupo: 'proyecto-02', id: 'modulo-02', copia: 'e', geometria: vista({columnas: []})},
  ];
  const ejemplosPorObjetivo = [];
  evaluarLeaveOneModuleOut(casos, ({objetivo, ejemplos}) => {
    ejemplosPorObjetivo.push({
      objetivo: `${objetivo.grupo}/${objetivo.id}/${objetivo.copia}`,
      ejemplos: ejemplos.map((caso) => `${caso.grupo}/${caso.id}/${caso.copia}`),
    });

    return objetivo.geometria;
  });

  assert.deepEqual(ejemplosPorObjetivo, [
    {objetivo: 'proyecto-01/modulo-01/a', ejemplos: ['proyecto-01/modulo-02/c']},
    {objetivo: 'proyecto-01/modulo01/b', ejemplos: ['proyecto-01/modulo-02/c']},
    {objetivo: 'proyecto-01/modulo-02/c', ejemplos: ['proyecto-01/modulo-01/a', 'proyecto-01/modulo01/b']},
    {objetivo: 'proyecto-02/modulo-01/d', ejemplos: ['proyecto-02/modulo-02/e']},
    {objetivo: 'proyecto-02/modulo-02/e', ejemplos: ['proyecto-02/modulo-01/d']},
  ]);
});

test('Task 4: a one-level open architecture uses its current geometry and no fixed template levels', () => {
  const lecturaActual = geometriaDeLecturas([
    {titulo: 'PLANTA 1ER NIVEL', lectura: {
      ejes: [{nombre: 'A', p: {x: 10, y: 20}, q: {x: 10, y: 80}}],
      columnas: [{eje: 'A/1', x: 10, y: 20, nodo: {x: 10, y: 20}, b: 0.3, h: 0.3, forma: 'rectangular'}],
      listaColumnetas: [],
    }},
  ]);
  const estructura = integrarGeometriaAprendida({
    rasgos: {niveles: 1, columnas: 1},
    propuesta: {vecinos: [{nombre: 'modulo-14', distancia: 0.4}], decisiones: {}},
    casos: [{nombre: 'modulo-14', geometria: lecturaActual, fuente: 'pareado-validado'}],
    lecturaActual,
  });

  assert.equal(estructura.niveles, 1);
  assert.equal(estructura.losaTecho, true);
  assert.equal(estructura.geometriaActual, lecturaActual);
  assert.ok(estructura.confianzaGeometria >= 0.6);
  assert.ok(estructura.gruposVerificados.includes('ejes'));
  assert.ok(estructura.gruposVerificados.includes('columnas'));
  assert.ok(estructura.gruposNoVerificados.includes('murosVanos'));
  assert.ok(estructura.gruposNoVerificados.includes('losas'));
});

test('Task 4: a multi-level architecture keeps every current level and reports the learned case only as bounded context', () => {
  const lecturaActual = geometriaDeLecturas([
    {titulo: 'PLANTA 1ER NIVEL', lectura: {
      ejes: [{nombre: 'A', p: {x: 0, y: 0}, q: {x: 0, y: 6}}],
      columnas: [{eje: 'A/1', x: 0, y: 0, nodo: {x: 0, y: 0}, b: 0.4, h: 0.4, forma: 'rectangular'}],
      listaColumnetas: [],
    }},
    {titulo: 'PLANTA 2DO NIVEL', lectura: {
      ejes: [{nombre: 'A', p: {x: 0, y: 0}, q: {x: 0, y: 6}}],
      columnas: [{eje: 'A/1', x: 0, y: 0, nodo: {x: 0, y: 0}, b: 0.4, h: 0.4, forma: 'rectangular'}],
      listaColumnetas: [],
    }},
  ]);
  const estructura = integrarGeometriaAprendida({
    rasgos: {niveles: 2, columnas: 2},
    propuesta: {vecinos: [{nombre: 'modulo-09', distancia: 0.8}], decisiones: {}},
    casos: [{nombre: 'modulo-09', geometria: lecturaActual, fuente: 'pareado-validado'}],
    lecturaActual,
  });

  assert.equal(estructura.niveles, 2);
  assert.deepEqual(estructura.geometriaActual.vistas.map((v) => v.nivel), [1, 2]);
  assert.equal(estructura.losaTecho, false);
  assert.equal(estructura.casoAprendido, 'modulo-09');
});

test('Task 4: open or unclassified areas are visibly unsupported and are never copied silently', () => {
  const lecturaActual = geometriaDeLecturas([
    {titulo: 'ÁREA ABIERTA SIN CLASIFICAR', lectura: {
      ejes: [], columnas: [], listaColumnetas: [],
    }},
  ]);
  const estructura = integrarGeometriaAprendida({
    rasgos: {niveles: 1, columnas: 0, areaAbierta: true},
    propuesta: {vecinos: [{nombre: 'modulo-14', distancia: 4}], decisiones: {}},
    casos: [{nombre: 'modulo-14', geometria: vista({columnas: [columna('1/A', 0, 0)]}), fuente: 'pareado-validado'}],
    lecturaActual,
  });

  assert.ok(estructura.gruposNoVerificados.includes('ejes'));
  assert.ok(estructura.gruposNoVerificados.includes('columnas'));
  assert.ok(estructura.gruposNoVerificados.includes('murosVanos'));
  assert.ok(estructura.gruposNoVerificados.includes('losas'));
  assert.ok(estructura.confianzaGeometria < 0.6);
  assert.ok(estructura.avisosRevision.some((aviso) => /área abierta|no clasificada|baja confianza/i.test(aviso)));
  assert.equal(estructura.geometriaActual.vistas[0].categorias.columnas.length, 0);
});

test('Task 4 follow-up: detected levels 1 and 3 report the highest verified level as 3', () => {
  const lecturas = [
    {titulo: 'PLANTA 1ER NIVEL', lectura: {ejes: [{nombre:'A',p:{x:0,y:0},q:{x:0,y:6}},{nombre:'1',p:{x:0,y:0},q:{x:6,y:0}}], columnas: [], listaColumnetas: []}},
    {titulo: 'PLANTA 3ER NIVEL', lectura: {ejes: [{nombre:'A',p:{x:0,y:0},q:{x:0,y:6}},{nombre:'1',p:{x:0,y:0},q:{x:6,y:0}}], columnas: [], listaColumnetas: []}},
  ];
  const rasgos = rasgosDeArquitectura(lecturas);
  const estructura = integrarGeometriaAprendida({
    rasgos,
    propuesta: {vecinos: [], decisiones: {}},
    casos: [],
    lecturaActual: geometriaDeLecturas(lecturas),
  });

  assert.equal(rasgos.niveles, 3);
  assert.equal(estructura.niveles, 3);
  assert.equal(estructura.losaTecho, false);
});

test('Task 4 follow-up: a selected learned case is not declared geometrically adapted by the current generator', () => {
  const lecturaActual = geometriaDeLecturas([
    {titulo: 'PLANTA 1ER NIVEL', lectura: {
      ejes: [{nombre: 'A', p: {x: 100, y: 200}, q: {x: 100, y: 800}}],
      columnas: [{eje: 'A/1', x: 100, y: 200, nodo: {x: 100, y: 200}, b: 0.4, h: 0.4, forma: 'rectangular'}],
      listaColumnetas: [],
    }},
  ]);
  const estructura = integrarGeometriaAprendida({
    rasgos: {niveles: 1, columnas: 1},
    propuesta: {vecinos: [{nombre: 'modulo-14', distancia: 0.2}], decisiones: {}},
    casos: [{nombre: 'modulo-14', geometria: vista({dx: 31, dy: -12, escala: 3, columnas: [columna('1/A', 31, -12, 1.2, 1.2)]}), fuente: 'pareado-validado'}],
    lecturaActual,
  });

  assert.equal(estructura.geometriaAdaptada, false);
  assert.equal(estructura.patronGeometrico, null);
  assert.match(estructura.motivoLimite, /no.*adaptación.*geométrica|generador.*no.*seguro/i);
  assert.ok(estructura.avisosRevision.some((aviso) => /no.*adaptación.*geométrica/i.test(aviso)));
});
