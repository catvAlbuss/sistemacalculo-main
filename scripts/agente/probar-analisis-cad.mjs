// Recorrido completo en el navegador real, sin sesión: Análisis Estructural (la vista Blade real
// <x-cad-sys/> con su código servido por Vite) abre un .e2k, corre el análisis sísmico con el motor
// del proyecto (python-backend/venv + cli_entry.py, el mismo subproceso que usa Laravel) y la
// Revisión del agente (E.030). Imprime periodos, derivas, cortantes y las verificaciones.
//
//   npm run dev   (Vite)  ·  python-backend/venv con requirements.txt
//   node scripts/agente/probar-analisis-cad.mjs <modelo.e2k>
import {createServer, request} from 'node:http';
import {readFileSync, existsSync, mkdtempSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn, execFileSync} from 'node:child_process';
import {runBrowserFixture, removeTempDir} from '../../tests/frontend/browserFixture.mjs';

// --limite=0.3: exige un ratio D/C menor que 1 para forzar que el agente suba acero (prueba del ajuste).
const archivoE2k = process.argv.slice(2).find((a) => !a.startsWith('--'));
const LIMITE = Number(process.argv.find((a) => a.startsWith('--limite='))?.slice(9)) || 1;
// --captura=<archivo.png>: solo abre el modelo y el menú 🤖 Agente y guarda una captura (sin análisis).
const CAPTURA = process.argv.find((a) => a.startsWith('--captura='))?.slice(10) ?? null;
// --chat: con --captura, conversa con el agente del CAD por su panel (como el ingeniero) y fotografía el chat.
const CHAT = process.argv.includes('--chat');
// --paquete=<archivo.json>: guarda el paquete de «Enviar diseño al agente» (para probar-aplicar-diseno.mjs).
const SALIDA_PAQUETE = process.argv.find((a) => a.startsWith('--paquete='))?.slice(10) ?? null;
if (!archivoE2k || !existsSync(archivoE2k)) { console.error('Uso: node scripts/agente/probar-analisis-cad.mjs <modelo.e2k>'); process.exit(1); }
const browser = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const RAIZ = resolve('.');
const python = join(RAIZ, 'python-backend', process.platform === 'win32' ? 'venv/Scripts/python.exe' : 'venv/bin/python3');
if (!existsSync(python)) { console.error(`Falta el motor: ${python} (python -m venv venv + pip install -r requirements.txt)`); process.exit(1); }
const vite = new URL(readFileSync('public/hot', 'utf8').trim());

// 1) La vista real renderizada por Blade y las etiquetas de Vite (dev) de su layout.
// Los @push del componente se leen dentro de la misma plantilla (al terminar el render se vacían).
const php = `[$c, $st, $sc] = explode('<!--CORTE-->', \\Illuminate\\Support\\Facades\\Blade::render("<x-cad-sys/><!--CORTE-->@stack('styles')<!--CORTE-->@stack('initscripts')"));
$v = app(\\Illuminate\\Foundation\\Vite::class);
echo json_encode(['cuerpo' => $c, 'estilos' => $st,
  'cabeza' => (string) $v(['resources/css/app.css', 'resources/css/engineering.css', 'resources/js/app_begin.js']),
  'scripts' => $sc, 'fin' => (string) $v(['resources/js/app_end.js'])]);`;
const vista = JSON.parse(execFileSync('php', ['artisan', 'tinker', '--execute', php], {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024}).trim().split('\n').filter((l) => l.startsWith('{')).at(-1));
const sinOrigen = (html) => html.replaceAll(`${vite.origin}/`, '/');
const texto = readFileSync(archivoE2k, 'utf8');

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="csrf-token" content="prueba">
<script>window.livewireScriptConfig = {csrf: 'prueba', uri: '/livewire/update', progressBar: '', nonce: ''};</script>
${sinOrigen(vista.cabeza)}${vista.estilos}${sinOrigen(vista.scripts)}</head>
<body class="h-full"><main class="h-full">${vista.cuerpo}</main><pre id="result" style="display:none">WAIT</pre>
<script>
  const LIMITE = ${LIMITE}, CAPTURA = ${CAPTURA ? 'true' : 'false'}, CHAT = ${CHAT ? 'true' : 'false'};
  window.__errores = [];
  window.addEventListener('error', (e) => window.__errores.push(String(e.message)));
  // Los avisos de SweetAlert se confirman solos (no hay quien haga clic).
  setInterval(() => document.querySelector('.swal2-confirm')?.click(), 300);
  const fin = (t) => { document.querySelector('#result').textContent = t; };
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  (async () => {
    try {
      for (let i = 0; i < 200 && !window.cadSystem?.importarE2kTexto; i++) await espera(100);
      const cad = window.cadSystem;
      if (!cad?.importarE2kTexto) return fin('FAIL el módulo no cargó: ' + window.__errores.join(' | ').slice(0, 300));
      const e2k = await (await fetch('/modelo.e2k')).text();
      if (!cad.importarE2kTexto(e2k, 'modelo.e2k')) return fin('FAIL no importó el .e2k');
      await espera(500);
      if (CAPTURA && CHAT) {
        cad.openAgenteCadChat();
        await espera(300);
        const panel = document.querySelector('[x-data^="agenteCadChat"]')._x_dataStack[0];
        for (const t of ['analiza el sismo', '¿cuánto es la deriva en X?', 'diseña las columnas', 'envía el diseño a NovaCad']) {
          await panel.enviar(t);
          await espera(300);
        }
        console.log('CHAT ' + JSON.stringify(panel.mensajes.map((m) => [m.role, m.content])));
        window.__chat = panel.mensajes.map((m) => [m.role, m.content]);
        document.querySelectorAll('.swal2-container, [x-data^="columnaDesignModal"]').forEach((e) => { e.style.display = 'none'; });
        await espera(500);
        return fin('READY');
      }
      if (CAPTURA) {
        [...document.querySelectorAll('button')].find((b) => b.textContent.trim().endsWith('Agente'))?.click();
        await espera(800);
        return fin('READY');
      }
      cad._initSeismic();
      Object.assign(cad.seismicConfig, {numModes: 12, combination: 'CQC', direction: 'both', saInG: true, g: 9.81, useRigidDiaphragms: true, driftSystem: 'concreto', driftLimit: 0.007});
      await cad.runSeismicAnalysis();
      for (let i = 0; i < 300 && !Object.keys(cad.seismicResultsByCase || {}).length; i++) await espera(200);
      const casos = cad.seismicResultsByCase || {};
      if (!Object.keys(casos).length) return fin('FAIL sin resultados sísmicos: ' + window.__errores.join(' | ').slice(0, 300));
      // Diseño de todas las columnas con el armado que trae el .e2k (el del cuadro de columnas).
      await cad.disenarTodasLasColumnas();
      for (let i = 0; i < 300 && !(cad.rcColumnDesignResults || []).length; i++) await espera(200);
      const columnas = (cad.rcColumnDesignResults || []).map((c) => [c.label, c.unsupported ? 'sin diseño: ' + c.unsupportedReason : [c.check?.base?.ratio, c.check?.top?.ratio].map((r) => (Number(r) || 0).toFixed(2)).join(' / '), c.geometry ? 'R-' + c.geometry.n2 + '-' + c.geometry.n3 : '']);
      if (LIMITE < 1) await cad.ajustarArmadoColumnas({limite: LIMITE});
      const rev = cad.calcularRevisionAgente({});
      cad.revisionAgente = rev;
      const paquete = cad.enviarDisenoAlAgente();
      const resumenCaso = (r) => ({
        modos: (r.modal?.modes || []).slice(0, 3).map((m) => [m.mode, +Number(m.period).toFixed(3), +Number(m.mass_participation_x).toFixed(1), +Number(m.mass_participation_y).toFixed(1)]),
        derivaMax: Math.max(...['x', 'y'].flatMap((k) => (r.drifts?.[k] || []).map((d) => Number(d.drift_ratio) || 0))),
        cortante: r.story_shear_summary,
      });
      fin('PASS ' + JSON.stringify({paquete, columnas, nudos: cad.nodes?.length, barras: cad.shapes?.length, areas: cad.areas?.length,
        casos: Object.fromEntries(Object.entries(casos).map(([k, r]) => [k, resumenCaso(r)])),
        revision: rev.verificaciones.map((v) => [v.grupo, v.titulo, v.estado, v.valor ?? '', v.detalle, v.accion ?? '']), resumen: rev.resumen.texto, parametros: rev.parametros}));
    } catch (e) { fin('FAIL ' + (e?.stack || e?.message || e)); }
  })();
</script>${sinOrigen(vista.fin)}</body></html>`;

// 2) Servidor: la página, el .e2k, el motor (mismo subproceso que Laravel) y lo demás a Vite.
const motor = (modo, cuerpo) => new Promise((ok) => {
  const p = spawn(python, ['cli_entry.py', modo], {cwd: join(RAIZ, 'python-backend')});
  let out = '', err = '';
  p.stdout.on('data', (d) => { out += d; });
  p.stderr.on('data', (d) => { err += d; });
  p.on('close', (code) => ok(code === 0 && out.trim() ? [200, out.trim()] : [500, JSON.stringify({success: false, error: 'Error en el motor', detail: err.slice(-2000)})]));
  p.stdin.end(cuerpo || '{}');
});
const servidor = createServer(async (req, res) => {
  const ruta = new URL(req.url, 'http://x').pathname;
  if (ruta === '/') { res.setHeader('Content-Type', 'text/html;charset=utf-8'); res.end(html); return; }
  if (ruta === '/modelo.e2k') { res.end(texto); return; }
  if (ruta.startsWith('/api/backend/')) {
    let cuerpo = ''; for await (const c of req) cuerpo += c;
    const [estado, json] = await motor(ruta.slice('/api/backend/'.length).replaceAll('/', '-'), cuerpo);
    res.writeHead(estado, {'Content-Type': 'application/json'}); res.end(json); return;
  }
  if (ruta.startsWith('/software/') || ruta.startsWith('/livewire')) { res.writeHead(200, {'Content-Type': 'application/json'}); res.end('{}'); return; }
  const pr = request({host: vite.hostname, port: vite.port, path: req.url, method: req.method, headers: {...req.headers, host: vite.host}}, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  pr.on('error', () => { res.writeHead(502); res.end(); });
  req.pipe(pr);
});
await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${servidor.address().port}/`;
const dir = mkdtempSync(join(tmpdir(), 'analisis-cad-'));
try {
  const interact = CAPTURA ? async (send) => {
    if (CHAT) {
      const chat = await send('Runtime.evaluate', {expression: 'JSON.stringify(window.__chat || [])', returnByValue: true});
      for (const [rol, texto] of JSON.parse(chat.result.value)) console.log(`${rol === 'user' ? '👤' : '🤖'} ${texto}`);
    }
    try {
      const {data} = await send('Page.captureScreenshot', {format: 'png'});
      writeFileSync(CAPTURA, Buffer.from(data, 'base64'));
    } catch (e) { console.log('Sin captura:', e.message); }
    await send('Runtime.evaluate', {expression: 'document.querySelector("#result").textContent = "PASS {}"'});
  } : undefined;
  const r = await runBrowserFixture(browser, join(dir, 'x.html'), {profile: join(dir, 'perfil'), url, width: 1500, height: 950, webgl: true, timeoutMs: 600000, interact});
  if (CAPTURA) { console.log(r.startsWith('PASS') ? `Captura: ${CAPTURA}` : r.slice(0, 500)); process.exit(r.startsWith('PASS') ? 0 : 1); }
  if (!r.startsWith('PASS')) { console.log(r.slice(0, 2000)); process.exitCode = 1; }
  else {
    const d = JSON.parse(r.slice(5));
    console.log(`Modelo: ${d.nudos} nudos, ${d.barras} barras, ${d.areas} áreas`);
    for (const c of d.columnas) console.log(`  Columna ${c[0].padEnd(16)} ratio base/cabeza ${c[1]}  ${c[2]}`);
    for (const [caso, c] of Object.entries(d.casos)) console.log(`Caso ${caso}: modos ${JSON.stringify(c.modos)} · deriva elástica máx ${c.derivaMax.toFixed(5)} · V ${JSON.stringify(c.cortante)}`);
    for (const t of Object.values(d.paquete?.columnas || {})) console.log(`  Al agente ${t.tipo}: ${t.n} varillas · D/C ${t.ratioOriginal} → ${t.ratio}${t.aumentado ? ' (aumentado)' : ''}${t.sinSolucion?.length ? ' SIN SOLUCIÓN' : ''}`);
    if (SALIDA_PAQUETE) { writeFileSync(SALIDA_PAQUETE, JSON.stringify(d.paquete, null, 1)); console.log(`  Paquete guardado: ${SALIDA_PAQUETE}`); }
    const rs = d.paquete?.reacciones || [];
    console.log(`  Reacciones al agente: ${rs.length} apoyos · CM ${rs.reduce((t, r) => t + r.pd, 0).toFixed(1)} t · CV ${rs.reduce((t, r) => t + r.pl, 0).toFixed(1)} t · ejemplo ${JSON.stringify(rs[0] ?? null)}`);
    console.log('\nRevisión del agente:', d.resumen, JSON.stringify(d.parametros));
    for (const v of d.revision) console.log(`  ${v[2].padEnd(11)} ${v[0].padEnd(13)} ${v[1].padEnd(34)} ${String(v[3]).padEnd(22)} ${v[4]}${v[5] ? `  → ${v[5]}` : ''}`);
  }
} finally {
  servidor.close();
  removeTempDir(dir);
}
