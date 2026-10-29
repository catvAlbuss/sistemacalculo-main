import {readFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {captureHtml} from './scripts/capture-browser.mjs';
import {canLoadCaptureResource} from './scripts/capture-resource-policy.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const escapeAttribute = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
async function run() {
  const [jsonPath,outputFile] = process.argv.slice(2);
  if (!jsonPath || !outputFile) throw Error('Faltan las rutas de entrada y salida.');
  const data = JSON.parse(await readFile(jsonPath,'utf8'));
  const origin = new URL(process.env.CAPTURE_APP_URL || 'http://127.0.0.1:8000').origin;
  const devOrigin = process.env.CAPTURE_DEV_ORIGIN || '';
  const links = (data.stylesheets || []).filter(url => canLoadCaptureResource(url,'stylesheet',origin,devOrigin))
    .map(url=>`<link rel="stylesheet" href="${escapeAttribute(url)}">`).join('');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><base href="${escapeAttribute(origin)}/">${links}${data.inlineStyles || ''}
    <style>body{margin:0;background:#fff}#vigasgn{width:max-content;min-width:1200px;max-width:16000px;background:var(--pr-panel,#fff);color:var(--pr-text,#172b43);padding:24px;box-sizing:border-box}
    #vigasgn .arco-table-scroll{overflow:visible}#vigasgn .beam-report-title{display:block;margin-bottom:20px}#vigasgn .beam-report-title h2{font-size:22px;font-weight:700}
    table{border-collapse:collapse;width:100%}.no-print,#btn_pdf_predim,#btn_captura_resultado{display:none!important}</style>
    </head><body>${data.html}</body></html>`;
  await mkdir(path.dirname(outputFile),{recursive:true});
  await captureHtml(html,outputFile,{origin,devOrigin,theme:data.theme || 'light',publicRoot:path.join(root,'public'),workRoot:path.dirname(outputFile)});
}
run().catch(error=>{console.error('ERROR EN CAPTURA:',error.message);process.exitCode=1;});
