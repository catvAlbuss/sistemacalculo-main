// Fase 2a de la biblioteca de detalles: la extracción reconoce las piezas por su título, mide
// sus parámetros y no se lleva datos del cliente. Las pruebas con planos reales se saltan si la
// caché privada no está en esta máquina; los nombres del cliente no se escriben aquí (el repo no
// debe tenerlos): salen del manifiesto privado y del rótulo de cada plano.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {
  tipoDePieza, tituloLimpio, escalaDeTexto, nivelDeTexto, esTextoDeCliente, palabrasDelCliente,
  vocabularioDelPlano, sumarVocabulario, extraerPiezas, medirCimiento, medirPeldanos, codigoDeProyecto, BIBLIOTECA, TIPOS,
} from '../../scripts/agente/extraer-biblioteca.mjs';
import {PLANOS} from '../../scripts/agente/planos.mjs';
import {leerCache} from '../../scripts/agente/volcar-planos.mjs';
import {paresDelManifiesto} from '../../scripts/agente/pares-entrenamiento.mjs';

test('piece type comes from the title words', () => {
  assert.equal(tipoDePieza('MODULO I - PLANO DE PORTICO EJE E-E'), 'portico');
  assert.equal(tipoDePieza('PLANO- PORTICO EJE 7-7 Y 12-12'), 'portico');
  assert.equal(tipoDePieza('\\LCORTE 3-3'), 'corte');
  assert.equal(tipoDePieza('\\LDETALLE ESCALERA TRAMO II ESC.: 1/25'), 'escalera');
  assert.equal(tipoDePieza('CUADRO DE PLACA Y COLUMNA'), 'cuadro_columnas');
  assert.equal(tipoDePieza('CUADRO DE COLUMNETAS'), 'cuadro_columnetas');
  assert.equal(tipoDePieza('ESPECIFICACIONES TÉCNICAS'), 'notas');
  assert.equal(tipoDePieza('TIJERAL T-2'), 'techo');
  assert.equal(tipoDePieza('DETALLE DE CUMBRERA'), 'techo');
  // Notas, cargas y plantas no son piezas de detalle.
  assert.equal(tipoDePieza('Escaleras y corredores: 400 kg/m2'), null);
  assert.equal(tipoDePieza('PLANO DE TECHO DE ESCALERA'), null);
  assert.equal(tipoDePieza('PLANO DE CIMIENTO CORRIDO'), null);
});

test('title, scale and level marks are read from the engineer texts', () => {
  assert.equal(tituloLimpio('MODULO 2B - PLANO DE PÓRTICO EJE A-A'), 'PLANO DE PÓRTICO EJE A-A');
  assert.equal(tituloLimpio('\\LDETALLE ESCALERA TRAMO I ESC.: 1/25'), 'DETALLE ESCALERA TRAMO I');
  assert.equal(escalaDeTexto('ESC: 1/75'), 75);
  assert.equal(escalaDeTexto('ESCALA: 1/25'), 25);
  assert.equal(escalaDeTexto('SIN ESCALA'), 0);
  assert.equal(escalaDeTexto('CORTE 1-1'), null);
  assert.deepEqual(nivelDeTexto('Techo NFP=+15.03m'), {sigla: 'NFP', cota: 15.03, etiqueta: 'TECHO'});
  assert.deepEqual(nivelDeTexto('N.F.C. = -0.80m'), {sigla: 'NFC', cota: -0.8, etiqueta: null});
  assert.equal(nivelDeTexto('N.T.N. = ±0.00m').cota, 0);
  assert.equal(nivelDeTexto('BASE NPN=+/- 0.00m').cota, 0);
  assert.equal(nivelDeTexto('PL1'), null);
});

test('client words are the title-block words no other project uses outside its title block', () => {
  const propias = new Set(['MUNICIPALIDAD', 'PUEBLOX', 'CONCRETO', 'PORTICO']);
  const otros = [new Map([['CONCRETO', 9], ['ESTRIBOS', 4]])];
  // PORTICO no la usa otro proyecto, pero el propio la repite en sus dibujos: es técnica.
  const prohibidas = palabrasDelCliente(propias, otros, new Map([['PORTICO', 12], ['PUEBLOX', 1]]));
  assert.deepEqual([...prohibidas].sort(), ['MUNICIPALIDAD', 'PUEBLOX']);
  assert.equal(esTextoDeCliente('3/8"Ø: 1@0.05, 10@0.10, Rto.@0.20', prohibidas), false, 'the rebar spacing @ is not an e-mail');
  assert.equal(esTextoDeCliente('Colegio de PUEBLOX', prohibidas), true);
  assert.equal(esTextoDeCliente('ING. JUAN PEREZ', new Set()), true, 'personal data is dropped even without the vocabulary');
  assert.equal(esTextoDeCliente("f'c=210 kg/cm2 CONCRETO", prohibidas), false);
});

test('the strip footing is the body under the wall: width and depth from the drawing', () => {
  // Corte a escala 1:1 en metros: fondo en -0.80, muro de 0.13 sobre un cimiento de 0.40 × 0.80.
  const L = (x0, y0, x1, y1) => ({tipo: 'linea', capa: 'C', puntos: [{x: x0, y: y0}, {x: x1, y: y1}]});
  const items = [
    L(0, -0.8, 0.4, -0.8), L(0, -0.8, 0, 0), L(0.4, -0.8, 0.4, 0), L(-0.5, 0, 1, 0), // cimiento y piso
    L(0.13, 0, 0.13, 1.2), L(0.26, 0, 0.26, 1.2), // muro
    L(-0.5, -0.8, -0.5, -0.2), // borde de excavación (más ancho, no es el cimiento)
  ];
  assert.deepEqual(medirCimiento(items, -0.8, 1, 0.15), {ancho: 0.4, peralte: 0.8, conMuro: true});
  const peldanos = [];
  for (let i = 0; i < 5; i++) peldanos.push(L(i * 0.3, i * 0.175, i * 0.3, (i + 1) * 0.175), L(i * 0.3, (i + 1) * 0.175, (i + 1) * 0.3, (i + 1) * 0.175));
  assert.deepEqual(medirPeldanos(peldanos, 1), {contrapasoDibujado: 0.175, pasoDibujado: 0.3, contrapasosContados: 5});
});

// ------------------------------------------------------------------ planos reales (privados)

const BASE = join(PLANOS, 'estructuras');
const manifiesto = existsSync(join(BASE, 'pares.json')) ? JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')) : null;
const pares = manifiesto ? paresDelManifiesto(BASE, manifiesto, existsSync) : [];
// Los proyectos holdout (generalización) no entran a la biblioteca ni al aprendizaje: las pruebas
// de extracción y de "sin nombres de cliente" solo aplican a los grupos de entrenamiento.
const grupos = [...new Set(pares.filter((p) => !p.holdout).map((p) => p.grupo))];
const conCache = (p) => existsSync(join(PLANOS, 'cache', `${p.estructura.replace(/\.(dwg|dxf)$/i, '')}.json`));
const primeros = grupos.map((g) => pares.find((p) => p.grupo === g && conCache(p))).filter(Boolean);
const sinPlanos = primeros.length < 2 ? 'sin la caché privada de al menos dos proyectos' : false;

// Palabras del cliente de cada proyecto, sacadas de sus rótulos (y su nombre de grupo).
let vocab = null;
function palabrasProhibidas() {
  if (vocab) return vocab;
  const porGrupo = new Map();
  for (const p of pares.filter(conCache)) porGrupo.set(p.grupo, sumarVocabulario(porGrupo.get(p.grupo), vocabularioDelPlano(leerCache(p.rutaEstructura).items)));
  vocab = new Map([...porGrupo].map(([g, v]) => [g, palabrasDelCliente(v.rotulo, [...porGrupo].filter(([o]) => o !== g).map(([, o]) => o.resto), v.resto)]));
  return vocab;
}
// Nombres de todos los proyectos (como palabra suelta) y palabras de cliente de cualquiera, en
// los valores de texto del JSON (las claves son del esquema, no del plano).
function valores(x, out = []) {
  if (typeof x === 'string') out.push(x);
  else if (Array.isArray(x)) x.forEach((y) => valores(y, out));
  else if (x && typeof x === 'object') Object.entries(x).forEach(([k, y]) => valores(y, out, k));
  return out;
}
// Los avisos que escribe el propio extractor (dudas, cómo midió) no vienen del plano.
const PROPIOS = new Set(['dudas', 'medicionCimiento', 'motivo']);
function textoLimpio(json, todas) {
  const todo = valores(JSON.parse(json)).join(' | ');
  const delPlano = valores(JSON.parse(json, (k, v) => (PROPIOS.has(k) ? undefined : v))).join(' | ');
  const norm = (s) => s.normalize('NFD').replace(/\p{Mn}/gu, '').toUpperCase();
  const fugas = grupos.filter((g) => new RegExp(`\\b${g.toUpperCase()}\\b`).test(norm(todo)));
  for (const w of norm(delPlano).match(/[A-Z0-9]{4,}/g) ?? []) if (todas.has(w)) fugas.push(w);
  return [...new Set(fugas)];
}

test('extracts frames from every project with spans and heights in a sensible range', {skip: sinPlanos}, () => {
  const prohibidas = palabrasProhibidas();
  const todas = new Set([...prohibidas.values()].flatMap((s) => [...s]));
  for (const p of primeros) {
    const {piezas} = extraerPiezas(leerCache(p.rutaEstructura).items, {prohibidas: prohibidas.get(p.grupo)});
    const porticos = piezas.filter((x) => x.tipo === 'portico');
    assert.ok(porticos.length >= 2, `${codigoDeProyecto(p.grupo)} ${p.id}: ${porticos.length} pórticos`);
    for (const x of porticos) {
      assert.ok(x.parametros.ejes.length >= 1, `${x.titulo}: sin ejes`);
      if (x.parametros.luces.length) assert.ok(x.parametros.luzMaxima >= 1.5 && x.parametros.luzMaxima <= 30, `${x.titulo}: luz ${x.parametros.luzMaxima}`);
      assert.ok(x.parametros.alturaTotal >= 2 && x.parametros.alturaTotal <= 40, `${x.titulo}: altura ${x.parametros.alturaTotal}`); // 40 m ≈ edificio de media altura (9 niveles), no solo módulos de 1-2 pisos
      assert.ok(x.entidades.length > 100, `${x.titulo}: pocas entidades`);
      // Coordenadas locales: el eje izquierdo en x = 0.
      assert.equal(x.parametros.ejes[0].x, 0);
    }
    // Al menos un pórtico con dos o más vanos medidos y alturas de entrepiso típicas (2–6 m).
    // El límite inferior 1.5 admite los gaps reales de sótano/semisótano de un edificio de media altura.
  assert.ok(porticos.some((x) => x.parametros.luces.length >= 1 && (x.parametros.alturasDeEntrepiso ?? []).every((h) => h >= 1.5 && h <= 6)));
    assert.deepEqual(textoLimpio(JSON.stringify(piezas), todas), [], 'the pieces carry no client words');
  }
});

test('the written library carries no client names', {skip: sinPlanos || !existsSync(join(BIBLIOTECA, 'indice.json')) ? 'sin la biblioteca generada (extraer-biblioteca.mjs)' : false}, () => {
  const todas = new Set([...palabrasProhibidas().values()].flatMap((s) => [...s]));
  let piezas = 0;
  for (const t of TIPOS) {
    const dir = join(BIBLIOTECA, t);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      const json = readFileSync(join(dir, f), 'utf8');
      assert.deepEqual(textoLimpio(json, todas), [], `${t}/${f}`);
      piezas++;
    }
  }
  assert.ok(piezas > 0);
  // El índice nombra los archivos (privados) por su grupo; el resto de su contenido es anónimo.
  const indice = JSON.parse(readFileSync(join(BIBLIOTECA, 'indice.json'), 'utf8'));
  const sinArchivos = JSON.stringify({...indice, piezas: indice.piezas.map(({archivo, ...x}) => x)});
  assert.deepEqual(textoLimpio(sinArchivos, todas), []);
  for (const g of grupos) assert.ok(indice.resumen.porTipo.portico.porProyecto[codigoDeProyecto(g)] > 0, 'frames from every project');
});
