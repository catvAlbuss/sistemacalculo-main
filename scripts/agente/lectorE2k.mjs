// El MISMO lector .e2k de Análisis Estructural (mixins/io/file-io/e2k-import.js → parseETABS_E2K),
// empaquetado para Node: las librerías de pantalla (SweetAlert, Babylon, visor 3D) se reemplazan por
// módulos vacíos; el análisis del texto no las usa. Sirve para validar un .e2k sin abrir el navegador.
//
//   import {leerE2k} from './lectorE2k.mjs';  const modelo = await leerE2k(texto);
import {build} from 'esbuild';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {join, dirname} from 'node:path';
import {mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VACIOS = /^(sweetalert2|mat-for-js)$|\/3d\/(modeling3d|viewer3d)\.js$/;
let mixin = null;

async function cargar() {
  if (mixin) return mixin;
  const r = await build({
    entryPoints: [join(RAIZ, 'resources/js/cad/mixins/io/file-io/e2k-import.js')],
    bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'silent',
    loader: {'.png': 'dataurl'},
    plugins: [{name: 'vacios', setup(b) {
      b.onResolve({filter: /.*/}, (a) => (VACIOS.test(a.path) ? {path: a.path, namespace: 'vacio'} : null));
      b.onLoad({filter: /.*/, namespace: 'vacio'}, () => ({contents: 'const x = new Proxy(function(){}, {get: () => x, apply: () => x}); export default x; export const read = x, extrudeToNewFloor = x, selectAllNodes = x, activate3DDrawingMode = x, toggleView3D = x;', loader: 'js'}));
    }}],
  });
  const dir = mkdtempSync(join(tmpdir(), 'lector-e2k-'));
  const archivo = join(dir, 'lector.mjs');
  writeFileSync(archivo, r.outputFiles[0].text);
  globalThis.window ??= globalThis;
  mixin = (await import(pathToFileURL(archivo).href)).e2kImportMixin;
  return mixin;
}

// Modelo que arma Análisis Estructural a partir del texto (antes de cargarlo en pantalla).
export async function leerE2k(texto) {
  const m = await cargar();
  const yo = Object.create(m);
  if (!m.isRealETABS_E2K.call(yo, texto)) throw new Error('El lector no reconoce el texto como .e2k de ETABS.');
  return m.parseETABS_E2K.call(yo, texto);
}
