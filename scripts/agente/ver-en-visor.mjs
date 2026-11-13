// Ver las láminas como las dibuja el VISOR REAL (NovaCad / mlightcad), no una vista previa
// propia: abre el DXF en el visor compilado (public/build) con WebGL por software y guarda
// capturas de las zonas pedidas. Es el "ojo" del ciclo de entrenamiento: lo que aquí se ve
// encimado o fuera de su caja es lo que verá el cliente.
//
//   AGENTE_DXF=salida.dxf node scripts/agente/probar-laminas.mjs <arquitectura.dwg> "<vista>"
//   node scripts/agente/ver-en-visor.mjs salida.dxf [carpeta] [zonas.json]
//
// Con un DWG de arquitectura se sigue el MISMO camino que el ingeniero en predim2: se abre el
// DWG en el visor, se abre el panel del agente y se le piden las láminas (sin modelo de IA:
// la herramienta plano_estructuras, con la plantilla que sirve la web):
//   AGENTE_VISTA="primer nivel" AGENTE_DATOS='{"hz":0.6,"df":2.5}' VISOR_DEV=1 //     node scripts/agente/ver-en-visor.mjs <arquitectura.dwg> [carpeta] [zonas.json]
//
// Zonas: lista [{nombre, x0, y0, x1, y1}] en fracciones (0–1) de la zona de láminas que
// dejó probar-laminas en salida.dxf.json. Sin zonas: toda la zona y una grilla de 3×2 por lámina.
// Requiere el build (npm run build) con el acceso de prueba de App.vue.

import {createServer, request} from 'node:http';
import {readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync} from 'node:fs';
import {resolve, join, extname, sep} from 'node:path';
import {tmpdir} from 'node:os';
import {runBrowserFixture, removeTempDir} from '../../tests/frontend/browserFixture.mjs';

const [dxf, salida = 'storage/framework/testing/ver-en-visor', zonasArg] = process.argv.slice(2);
if (!dxf || !existsSync(dxf)) { console.error('Uso: node scripts/agente/ver-en-visor.mjs <dibujo.dxf | arquitectura.dwg> [carpeta] [zonas.json]'); process.exit(1); }
const browser = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
if (!browser) { console.error('No encontré Microsoft Edge para abrir el visor.'); process.exit(1); }

const esDwg = /\.dwg$/i.test(dxf);
const meta = !esDwg && existsSync(`${dxf}.json`) ? JSON.parse(readFileSync(`${dxf}.json`, 'utf8')) : {};
let zona = meta.zona;
const zonasDe = (n) => (zonasArg ? JSON.parse(readFileSync(zonasArg, 'utf8'))
  : [{nombre: 'todo', x0: 0, y0: 0, x1: 1, y1: 1}, ...Array.from({length: n}, (_, l) => [0, 1, 2].flatMap((c) => [0, 1].map((f) => ({
    nombre: `lamina${l + 1}-${['izq', 'centro', 'der'][c]}-${['abajo', 'arriba'][f]}`,
    x0: (l + c / 3) / n, x1: (l + (c + 1) / 3) / n, y0: f / 2, y1: (f + 1) / 2,
  })))).flat()]);
let zonas = zonasDe(Math.max(1, meta.laminas?.length ?? 1));
const plano = `/plano.${esDwg ? 'dwg' : 'dxf'}`;

const publicRoot = resolve('public');
// VISOR_DEV=1: el código sale del servidor de Vite (npm run dev) por este mismo servidor,
// sin compilar; si no, del build (public/build).
const dev = Boolean(process.env.VISOR_DEV);
const vite = dev ? new URL(readFileSync(join(publicRoot, 'hot'), 'utf8').trim()) : null;
const manifest = dev ? null : JSON.parse(readFileSync(join(publicRoot, 'build/manifest.json'), 'utf8'));
const entrada = dev ? null : manifest['resources/js/etabs/main.js'];
const estilos = dev ? '' : [manifest['resources/css/app.css']?.file, ...(entrada.css || [])].filter(Boolean).map((f) => `<link rel="stylesheet" href="/build/${f}">`).join('');
const scriptApp = dev ? '<script type="module" src="/@vite/client"></script><script type="module" src="/resources/js/etabs/main.js"></script>' : `<script type="module" src="/build/${entrada.file}"></script>`;
const html = `<!doctype html><html lang="es"><meta charset="utf-8">${estilos}<style>body{margin:0;display:flex;height:100vh}.ap-panel{display:none!important}#cad-viewer-app{flex:1;display:flex}#result{display:none}</style><body><div id="cad-viewer-app"></div><pre id="result">WAIT</pre>
<script>window.__NOVACAD_PRUEBA__=true;window.__errores=[];for(const k of ['error','warn']){const o=console[k];console[k]=(...a)=>{window.__errores.push(k+': '+a.map(x=>x instanceof Error?x.message:String(x)).join(' ').slice(0,300));o(...a)}};window.addEventListener('error',e=>{if(!String(e.message).includes('ResizeObserver'))window.__errores.push(e.message)});
const espera=setInterval(()=>{const c=document.querySelector('.ml-cad-main canvas');if(c&&c.width>0&&window.__novacadPrueba){clearInterval(espera);document.querySelector('#result').textContent='READY'}},100);</script>
${scriptApp}</body></html>`;
const tipos = {'.js': 'application/javascript', '.css': 'text/css', '.wasm': 'application/wasm', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.dxf': 'application/dxf'};
const servidor = createServer((req, res) => {
  const ruta = new URL(req.url, 'http://127.0.0.1').pathname;
  if (ruta === '/') { res.setHeader('Content-Type', 'text/html;charset=utf-8'); res.end(html); return; }
  if (ruta === plano) { res.setHeader('Content-Type', 'application/octet-stream'); res.end(readFileSync(dxf)); return; }
  if (dev && !ruta.startsWith('/assets/')) {
    const pedido = request({hostname: vite.hostname === 'localhost' ? 'localhost' : vite.hostname, port: vite.port, path: req.url, method: 'GET', headers: {accept: req.headers.accept ?? '*/*'}}, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
    pedido.on('error', () => res.writeHead(502).end());
    pedido.end();
    return;
  }
  const archivo = resolve(publicRoot, '.' + decodeURIComponent(ruta));
  if (!archivo.startsWith(publicRoot + sep)) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', tipos[extname(archivo)] || 'application/octet-stream'); res.end(readFileSync(archivo)); } catch { res.writeHead(404).end(); }
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
mkdirSync(salida, {recursive: true});
const perfil = mkdtempSync(join(tmpdir(), 'novacad-visor-'));
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  const estado = await runBrowserFixture(browser, 'sin-uso', {
    url: `http://127.0.0.1:${servidor.address().port}/`, profile: perfil, width: 1800, height: 1100, webgl: true, timeoutMs: 600000,
    interact: async (send) => {
      const evaluar = async (expresion) => {
        const r = await send('Runtime.evaluate', {expression: expresion, awaitPromise: true, returnByValue: true});
        if (r.exceptionDetails) throw Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description ?? ''));
        return r.result.value;
      };
      await evaluar(`window.__abierto = null; window.__novacadPrueba.abrir(location.origin + '${plano}').then((r) => { window.__abierto = String(r); }, (e) => { window.__abierto = 'error: ' + e; }), true`);
      // Esperar a que el dibujo termine de cargarse (el número de entidades se estabiliza).
      let previo = -1;
      for (let i = 0; i < 300; i++) { const k = await evaluar('window.__novacadPrueba.entidades()'); const listo = await evaluar('window.__novacadPrueba.listo()'); if (process.env.VISOR_DEBUG && i % 3 === 0) console.log('espera', i, k, listo, await evaluar('JSON.stringify([window.__abierto, window.__errores])')); if (listo && k > 0 && k === previo) break; previo = k; await pausa(1000); }
      if (esDwg) {
        // Como el ingeniero: abrir el panel del agente y pedirle las láminas.
        await evaluar('window.__novacadPrueba.abrirAgente()');
        for (let i = 0; i < 60 && !(await evaluar('typeof window.__novacadPrueba.herramienta === "function"')); i++) await pausa(500);
        const correr = async (nombre, args) => {
          await evaluar(`window.__resultado = null; window.__novacadPrueba.herramienta(${JSON.stringify(nombre)}, ${JSON.stringify(args)}).then((r) => { window.__resultado = r; }, (e) => { window.__resultado = {ok: false, error: String(e)}; }), true`);
          for (let i = 0; i < 600; i++) { const r = await evaluar('window.__resultado'); if (r) return r; await pausa(500); }
          throw new Error(`${nombre} no terminó`);
        };
        if (process.env.AGENTE_DATOS) console.log('datos_proyecto:', (await correr('datos_proyecto', JSON.parse(process.env.AGENTE_DATOS))).mensaje);
        const r = await correr('plano_estructuras', process.env.AGENTE_VISTA ? {vista: process.env.AGENTE_VISTA} : {});
        console.log('plano_estructuras:', r.ok === false ? r.error : r.mensaje);
        if (process.env.AGENTE_REVISAR) {
          for (const corregir of [false, true]) console.log(`revisar_laminas${corregir ? ' (corregir)' : ''}:
${(await correr('revisar_laminas', {corregir})).mensaje}`);
        }
        zona = await evaluar('window.__novacadPrueba.ultimaZona');
        zonas = zonasDe(Math.max(1, r.laminas?.length ?? 1));
        await pausa(3000);
      }
      // Primer dibujo completo antes de las capturas (el visor por software tarda en el primero).
      await evaluar(`window.dispatchEvent(new Event('resize')), true`);
      for (const [x, y] of [[900, 500], [910, 510]]) await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x, y});
      await pausa(Number(process.env.VISOR_ESPERA ?? 4000));
      for (const z of zonas) {
        const caja = zona && z.x0 !== undefined ? [zona.x0 + (zona.x1 - zona.x0) * z.x0, zona.y0 + (zona.y1 - zona.y0) * z.y0, zona.x0 + (zona.x1 - zona.x0) * z.x1, zona.y0 + (zona.y1 - zona.y0) * z.y1] : null;
        if (caja) await evaluar(`window.__novacadPrueba.encuadrar(${caja.join(',')})`);
        // El visor redibuja con la interacción: resize y un movimiento del mouse sobre el lienzo.
        await evaluar(`window.dispatchEvent(new Event('resize')), true`);
        for (const [x, y] of [[900, 500], [905, 505], [900, 500]]) await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x, y});
        if (process.env.VISOR_DEBUG) console.log(z.nombre, caja, await evaluar(`window.__novacadPrueba.dondeMira?.()`));
        await pausa(Number(process.env.VISOR_ESPERA ?? 4000)); // dibujo por software y textos (MTEXT en su worker)
        const foto = await send('Page.captureScreenshot', {format: 'png'});
        writeFileSync(join(salida, `${z.nombre}.png`), Buffer.from(foto.data, 'base64'));
      }
      const errores = await evaluar('window.__errores');
      if (errores.length) console.warn('Errores en el visor:', errores);
      await evaluar(`document.querySelector('#result').textContent='PASS'`);
    },
  });
  console.log(`Visor real: ${estado}. Capturas en ${salida}`);
} finally {
  servidor.close();
  removeTempDir(perfil);
}
