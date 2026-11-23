// Cuadros de columnas y columnetas de prueba (L, L girada, trapecio; columnetas pa…pe) en un
// DXF suelto, para revisar el detallado del acero en el visor sin generar un plano completo:
//
//   node scripts/agente/ver-cuadros.mjs salida.dxf
//   VISOR_ZONA="0,-4.2,12.2,6.2" node scripts/agente/ver-en-visor.mjs salida.dxf <carpeta>
import {writeFileSync} from 'node:fs';
import * as dm from '@mlightcad/data-model';
import {drawPrimitives} from '../../resources/js/ingenieria/cad/cadExecutor.js';
import {cuadroColumnas, cuadroColumnetas} from '../../resources/js/ingenieria/laminas/cuadroColumnas.js';
import {dxfParaVisor} from '../../resources/js/etabs/composables/useDrawingRecovery.js';
const L = (pts) => pts.map(([x, y]) => ({x, y}));
const rot = (pts, a, c) => pts.map((p) => ({x: c.x + (p.x - c.x) * Math.cos(a) - (p.y - c.y) * Math.sin(a), y: c.y + (p.x - c.x) * Math.sin(a) + (p.y - c.y) * Math.cos(a)}));
const c1 = L([[0, 0], [0.25, 0], [0.25, 0.15], [0.40, 0.15], [0.40, 0.40], [0, 0.40]]);
const c2 = rot(L([[0, 0], [0.37, 0], [0.37, 0.25], [0.25, 0.25], [0.25, 0.40], [0, 0.40]]), -0.33, {x: 0.2, y: 0.2});
const c3 = L([[0, 0], [0.26, -0.05], [0.25, 0.33], [0, 0.30]]);
const col = (tipo, contorno, forma, b, h, area, esp) => ({tipo, contorno, forma, clase: 'columna', b, h, area, espesor: esp, x: contorno.reduce((s, p) => s + p.x, 0) / contorno.length, y: contorno.reduce((s, p) => s + p.y, 0) / contorno.length});
const r = cuadroColumnas([col('C1', c1, 'L', 0.40, 0.40, 0.1225, 0.25), col('C2', c2, 'L', 0.51, 0.43, 0.1325, 0.20), col('C3', c3, 'irregular', 0.38, 0.25, 0.08)]);
const ctas = ['pa', 'pb', 'pc', 'pd', 'pe'].map((codigo, i) => ({codigo, b: [0.20, 0.65, 0.22, 0.26, 0.18][i], h: [0.13, 0.13, 0.13, 0.12, 0.13][i]}));
const rc = cuadroColumnetas(ctas);
const db = new dm.AcDbDatabase();
db.insunits = 6;
drawPrimitives(db, r.contenido.primitivas, {dm, unitsPerMeter: 1});
drawPrimitives(db, rc.contenido.primitivas, {dm, unitsPerMeter: 1, origin: {x: 0, y: -4}});
writeFileSync(process.argv[2], dxfParaVisor(db.dxfOut(undefined, 6)));
console.log('ok', r.filas.map((f) => f.varillas), rc.filas.map((f) => f.refuerzo));
