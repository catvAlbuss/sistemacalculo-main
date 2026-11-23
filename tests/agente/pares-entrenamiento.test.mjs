import test from 'node:test';
import assert from 'node:assert/strict';
import {descubrirPares, eventosAprobados} from '../../scripts/agente/pares-entrenamiento.mjs';
import {geometriaDeLecturas} from '../../resources/js/ingenieria/aprendizaje/casos.js';

test('pairs module 1 when the structure filename uses singular ESTRUCTURA', () => {
  const arquitectura = '1.VINCHOS MODULO 1 ARQUITECTURA.dwg';
  const estructura = '1.VINCHOS MODULO 1 ESTRUCTURA.dwg';
  const result = descubrirPares([arquitectura, estructura], {
    'proyecto-01': [{id: 'modulo-01', arquitectura, estructura}],
  });

  assert.deepEqual(result.pares, [{
    grupo: 'proyecto-01', id: 'modulo-01', arquitectura, estructura,
  }]);
  assert.deepEqual(result.ambiguos, []);
  assert.deepEqual(result.faltantes, []);
});

test('accepts case, spacing, and hyphen variants when exact basenames are selected locally', () => {
  const arquitectura = '5.VINCHOS MODULO 5 -  ARQUITECTURA.dwg';
  const estructura = '5.VINCHOS MODULO 5 - ESTRUCTURAS.dwg';
  const result = descubrirPares([arquitectura, estructura], {
    'proyecto-vinchos': [{id: 'modulo-05', arquitectura, estructura}],
  });

  assert.equal(result.pares.length, 1);
  assert.equal(result.pares[0].grupo, 'proyecto-vinchos');
  assert.deepEqual(result.faltantes, []);
});

test('reports a missing exact partner instead of silently omitting the manifest entry', () => {
  const result = descubrirPares(['1.VINCHOS MODULO 1 ARQUITECTURA.dwg'], {
    'proyecto-01': [{
      id: 'modulo-01',
      arquitectura: '1.VINCHOS MODULO 1 ARQUITECTURA.dwg',
      estructura: '1.VINCHOS MODULO 1 ESTRUCTURA.dwg',
    }],
  });

  assert.equal(result.pares.length, 0);
  assert.deepEqual(result.faltantes, [{
    grupo: 'proyecto-01',
    id: 'modulo-01',
    arquitectura: '1.VINCHOS MODULO 1 ARQUITECTURA.dwg',
    estructura: '1.VINCHOS MODULO 1 ESTRUCTURA.dwg',
  }]);
});

test('rejects a manifest that selects two architecture drawings as one pair', () => {
  const arquitectura = '14 proyecto ARQUITECTURA.dwg';
  const estructura = '14 proyecto - ARQUITECTURA.dwg';
  const result = descubrirPares([arquitectura, estructura], {
    'proyecto-01': [{id: 'modulo-14', arquitectura, estructura}],
  });

  assert.equal(result.pares.length, 0);
  assert.equal(result.ambiguos.length, 1);
  assert.match(result.ambiguos[0].motivo, /debe seleccionar arquitectura y estructura/i);
});

test('rejects manifest paths instead of accepting them as local DWG or metrado basenames', () => {
  const arquitectura = '1 proyecto ARQUITECTURA.dwg';
  const estructura = '1 proyecto ESTRUCTURAS.dwg';

  assert.throws(() => descubrirPares([arquitectura, estructura], {
    'proyecto-01': [{
      id: 'modulo-01', arquitectura, estructura, metrado: '..\\..\\privado.xlsx',
    }],
  }), /basenames exactos/i);
});

test('keeps the same module number separate across opaque project groups', () => {
  const arquitecturaA = 'A 14 ARQUITECTURA.dwg';
  const estructuraA = 'A 14 ESTRUCTURAS.dwg';
  const arquitecturaB = 'B 14 ARQUITECTURA.dwg';
  const estructuraB = 'B 14 ESTRUCTURAS.dwg';
  const result = descubrirPares([arquitecturaA, estructuraA, arquitecturaB, estructuraB], {
    'proyecto-01': [{id: 'modulo-14', arquitectura: arquitecturaA, estructura: estructuraA}],
    'proyecto-02': [{id: 'modulo-14', arquitectura: arquitecturaB, estructura: estructuraB}],
  });

  assert.equal(result.pares.length, 2);
  assert.deepEqual(result.pares.map(({grupo, id}) => `${grupo}/${id}`), [
    'proyecto-01/modulo-14', 'proyecto-02/modulo-14',
  ]);
  assert.deepEqual(result.ambiguos, []);
});

test('marks duplicate module-14 candidates in one group as ambiguous', () => {
  const a1 = '14.VINCHOS MODULO 14 - ARQUITECTURA.dwg';
  const s1 = '14.VINCHOS MODULO 14 - ESTRUCTURAS.dwg';
  const a2 = '14.VINCHOS MODULO 14 arquitectura.dwg';
  const s2 = '14.VINCHOS MODULO 14 estructuras.dwg';
  const result = descubrirPares([a1, s1, a2, s2], {
    'proyecto-01': [
      {id: 'modulo-14', arquitectura: a1, estructura: s1},
      {id: 'modulo-14', arquitectura: a2, estructura: s2},
    ],
  });

  assert.equal(result.pares.length, 0);
  assert.deepEqual(result.ambiguos, [{
    grupo: 'proyecto-01',
    id: 'modulo-14',
    candidatos: [{arquitectura: a1, estructura: s1}, {arquitectura: a2, estructura: s2}],
  }]);
});

test('detects the same module number when manifest ID punctuation differs', () => {
  const arquitecturaA = '14 proyecto ARQUITECTURA.dwg';
  const estructuraA = '14 proyecto ESTRUCTURA.dwg';
  const arquitecturaB = '14 proyecto - ARQUITECTURA.dwg';
  const estructuraB = '14 proyecto - ESTRUCTURAS.dwg';
  const result = descubrirPares([arquitecturaA, estructuraA, arquitecturaB, estructuraB], {
    'proyecto-01': [
      {id: 'modulo-14', arquitectura: arquitecturaA, estructura: estructuraA},
      {id: 'modulo14', arquitectura: arquitecturaB, estructura: estructuraB},
    ],
  });

  assert.equal(result.pares.length, 0);
  assert.equal(result.ambiguos.length, 1);
  assert.deepEqual(result.ambiguos[0].candidatos, [
    {arquitectura: arquitecturaA, estructura: estructuraA},
    {arquitectura: arquitecturaB, estructura: estructuraB},
  ]);
});

test('serializes only anonymized, meter-based recognized structural geometry', () => {
  const geometry = geometriaDeLecturas([{
    titulo: 'PROYECTO CLIENTE - MODULO 14 PRIMER NIVEL',
    lectura: {
      ejes: [
        {nombre: '1', p: {x: 100, y: 200}, q: {x: 100, y: 800}},
        {nombre: 'A', p: {x: 100, y: 200}, q: {x: 500, y: 200}},
      ],
      columnas: [{
        eje: '1/A', x: 100, y: 200, b: 0.4, h: 0.5, forma: 'rectangular',
        nodo: {x: 100, y: 200}, contorno: [{x: 99.8, y: 199.75}, {x: 100.2, y: 200.25}],
      }],
      listaColumnetas: [{x: 110, y: 210, b: 0.2, h: 0.2}],
    },
  }]);

  assert.deepEqual(geometry, {
    version: 1,
    unidad: 'm',
    vistas: [{
      id: 'vista-01',
      nivel: 1,
      categorias: {
        ejes: [
          {nombre: '1', p: {x: 0, y: 0}, q: {x: 0, y: 600}},
          {nombre: 'A', p: {x: 0, y: 0}, q: {x: 400, y: 0}},
        ],
        columnas: [
          {eje: '1/A', centro: {x: 0, y: 0}, b: 0.4, h: 0.5, forma: 'rectangular'},
          {eje: null, centro: {x: 10, y: 10}, b: 0.2, h: 0.2, forma: 'columneta'},
        ],
        murosVanos: null,
        losas: null,
      },
    }],
  });
  assert.doesNotMatch(JSON.stringify(geometry), /PROYECTO CLIENTE|MODULO 14/);
});

test('exports only latest-approved correction events while preserving approved legacy rows', () => {
  const eventos = [
    {evento_id: 'pending', estado: 'pendiente', clave: 'losa', valor: 'maciza'},
    {evento_id: 'approved', estado: 'pendiente', clave: 'hz', valor: 0.7},
    {evento_id: 'rejected', estado: 'pendiente', clave: 'df', valor: 2},
    {evento_id: 'approved', estado: 'aprobado', fecha: '2026-01-01'},
    {evento_id: 'rejected', estado: 'aprobado', fecha: '2026-01-01'},
    {evento_id: 'rejected', estado: 'rechazado', fecha: '2026-01-02'},
    {evento_id: 'pending', estado: 'pendiente', fecha: '2026-01-02'},
    {clave: 'losa', valor: 'aligerada'},
    {evento_id: 'legacy-id', clave: 'hz', valor: 0.6},
    {evento_id: 'other', estado: 'aprobado', clave: 'no-es-decision', valor: 1},
  ];

  assert.deepEqual(
    eventosAprobados(eventos, {losa: {}, hz: {}, df: {}}).map(({clave, valor}) => ({clave, valor})),
    [{clave: 'hz', valor: 0.7}, {clave: 'losa', valor: 'aligerada'}, {clave: 'hz', valor: 0.6}],
  );
});

test('approved shared events omit identifiers and free-text fields', () => {
  const [evento] = eventosAprobados([{
    evento_id: 'approved-1',
    estado: 'aprobado',
    tipo: 'correccion',
    clave: 'losa',
    valor: 'maciza',
    propuesto: 'plano cliente secreto',
    motivo: 'cliente: dato confidencial',
    rasgos: {niveles: 2, area: 60, cliente: 'dato confidencial'},
    fecha: '2026-01-02T03:04:05.000Z',
  }], {losa: {}}, (rasgos) => ({niveles: rasgos.niveles, area: rasgos.area}));

  assert.deepEqual(evento, {
    tipo: 'correccion',
    clave: 'losa',
    valor: 'maciza',
    rasgos: {niveles: 2, area: 60},
  });
  assert.doesNotMatch(JSON.stringify(evento), /approved-1|cliente|confidencial|2026/);
});
