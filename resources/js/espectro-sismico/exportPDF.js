/**
 * exportPDF.js — Genera un PDF técnico del Espectro de Diseño E.030
 *
 * Pág 1   → Portada        (portrait)
 * Pág 2   → Parámetros     (portrait)
 * Pág 3   → Fórmulas+Notas (portrait)
 * Pág 4…n → Tabla espectro (portrait, pagina si hay muchas filas)
 * Última  → Gráfico SVG    (landscape)
 *
 * Requiere en la vista (CDN):
 *   jsPDF 2.5.1   (window.jspdf)
 *   html2canvas 1.4.1 (window.html2canvas)
 */

import { datosEspectro, normaVersion, resolveParams } from './index.js';

// ── Paleta de color por versión ───────────────────────────────────────────────
const VER_HEX = {
  '1977':'#F72585','1997':'#FFD166','2003':'#FF6B35',
  '2016':'#C77DFF','2018':'#00E5FF','e031':'#2DD4BF','2026':'#00C853','puentes':'#00A3FF',
};
const VER_DARK = {
  '1977':'#8B0057','1997':'#7A5C00','2003':'#7A2E00',
  '2016':'#5A008F','2018':'#006B7A','e031':'#0F766E','2026':'#005B25','puentes':'#003B73',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function usarNombreUso(U) {
  const map = { 1.0:'Común (C)', 1.3:'Importante (B)', 1.5:'Esencial (A2)', 1.8:'Imp. mayor (A1)' };
  return map[U] || `U = ${U}`;
}
function nombreNorma(v) {
  if (v === 'puentes') return 'Manual de Puentes MTC — AASHTO LRFD';
  if (v === 'e031')    return 'NTE E.031 — Aislamiento Sísmico';
  if (v === '1977')    return 'RNC — 1977';
  if (v === '2026')    return 'NTE E.030 — 2026 (RM 183-2026)';
  return `NTE E.030 — ${v}`;
}

function buildFormulas(version, Tp, Tl) {
  if (version === 'puentes') return [
    ['T = 0', 'Cs = 2.5A'],
    ['T &gt; 0', 'Cs = min(2.5A, 1.2AS/T^(2/3))'],
    ['Diseño', 'Csm = Cs/R'],
    ['Sa', 'Sa = Csm · g'],
  ];
  if (version === 'e031') return [
    ['T ≤ Tp',            `C = 2.5  [Tp = ${Tp.toFixed(2)} s]`],
    ['Tp &lt; T ≤ T<sub>L</sub>', 'C = 2.5 · (Tp/T)'],
    ['T &gt; T<sub>L</sub>',      `C = 2.5 · (Tp · T<sub>L</sub>) / T²  [T<sub>L</sub> = ${Tl?.toFixed(2) ?? '—'} s]`],
    ['Ajuste E.031',      'Sa = (Z · U · C · S) / (Riso · B)'],
  ];
  if (version === '1977') return [
    ['T = 0',             'C = 2.5'],
    ['0 &lt; T ≤ ∞',     `C = min(2.5, (Tp/T)<sup>2/3</sup>)  [Tp = ${Tp.toFixed(2)} s]`],
    ['Sa',                'Sa = (Z · U · C · S) / R'],
  ];
  if (version === '1997' || version === '2003') return [
    ['T ≤ Tp',            `C = 2.5  [Tp = ${Tp.toFixed(2)} s]`],
    ['T &gt; Tp',         'C = 2.5 · (Tp/T)'],
    ['Sa',                'Sa = (Z · U · C · S) / R'],
  ];
  if (version === '2016' || version === '2018') return [
    ['T ≤ Tp',            `C = 2.5  [Tp = ${Tp.toFixed(2)} s]`],
    ['Tp &lt; T ≤ T<sub>L</sub>', 'C = 2.5 · (Tp/T)'],
    ['T &gt; T<sub>L</sub>',      `C = 2.5 · (Tp · T<sub>L</sub>) / T²  [T<sub>L</sub> = ${Tl?.toFixed(2) ?? '—'} s]`],
    ['Sa',                'Sa = (Z · U · C · S) / R'],
  ];
  return [
    ['T &lt; 0.2·Tp',     `C = 1 + 7.5·(T/Tp)  [Tp = ${Tp.toFixed(2)} s — Art. 18]`],
    ['0.2·Tp ≤ T ≤ Tp',  'C = 2.5'],
    ['Tp &lt; T ≤ T<sub>L</sub>', 'C = 2.5 · (Tp/T)'],
    ['T &gt; T<sub>L</sub>',      `C = 2.5 · (Tp · T<sub>L</sub>) / T²  [T<sub>L</sub> = ${Tl?.toFixed(2) ?? '—'} s]`],
    ['Sa',                'Sa = (Z · U · C · S) / R'],
  ];
}

function buildNotas(version, suelo, Tp, Tl, Ts, Ia, Ip) {
  if (version === 'puentes') return [
    'Manual de Puentes MTC / AASHTO LRFD: Cs = min(2.5A, 1.2AS/T^(2/3)).',
    'Csm = Cs/R. R según ductilidad y sistema estructural del puente.',
    'Clases de suelo: I roca/suelo duro, II firme, III intermedio, IV blando/profundo.',
    'Este espectro no reemplaza el análisis sísmico específico ni la verificación de desplazamientos.',
  ];
  if (version === 'e031') return [
    'E.031 aplica a edificaciones con aislamiento sísmico y se complementa con E.030.',
    'B representa el ajuste por amortiguamiento efectivo del sistema aislado.',
    'Verificar desplazamiento de diseño, desplazamiento máximo, estabilidad y capacidad del sistema.',
    'Este espectro no reemplaza el diseño ni la memoria de cálculo del sistema aislado.',
  ];
  const n = [
    'Sa = aceleración espectral como fracción de g (9.81 m/s²).',
    'Espectro para 5 % de amortiguamiento crítico (§4.5 de la norma).',
    'Tp y TL definen la plataforma espectral y zona de velocidad constante.',
    'R efectivo = R₀ × Ia × Ip.',
  ];
  if (['2016','2018','2026'].includes(version) && (Ia < 1 || Ip < 1))
    n.push(`⚠ Irregularidad detectada (Ia = ${Ia.toFixed(2)}, Ip = ${Ip.toFixed(2)}). Verificar restricciones.`);
  if (version === '2026') {
    n.push('★ E.030-2026 Art. 18: rama inicial C = 1.0 → 2.5 entre T = 0 y T = Tp.');
    n.push('★ E.030-2026 Art. 28: Cat. A1/A2 aplican 100 % en ambas direcciones (o 75 % + 75 %).');
    if (suelo === 'S5') n.push('⚠ S5 Excepcional: prohibido construir sin mejora de suelo (Anexo III).');
    if (Ts > 0 && Ts > 0.65 * Tp)
      n.push(`⚠ Ts = ${Ts.toFixed(2)} s > 0.65 × Tp → perfil degradado (Art. 10).`);
  }
  return n;
}

// ── Estilos CSS base compartido por todas las secciones ──────────────────────
function estilosBase(accent, dark) {
  return `<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; }
    .pdf-wrap { padding: 32px 36px; background: #fff; }
    .sec-title { background: #1A3A5C; color: #fff; font-size: 13px; font-weight: 700;
      padding: 7px 14px; letter-spacing: .6px; text-transform: uppercase;
      margin-top: 20px; margin-bottom: 0; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1A3A5C; color: #fff; font-size: 12px; font-weight: 700;
      padding: 7px 10px; text-align: center; border: 1px solid #1A3A5C; }
    td { font-size: 12px; padding: 5px 10px; border: 1px solid #dce4ee; vertical-align: middle; }
    tr:nth-child(even) td { background: #f4f8fc; }
    tr:nth-child(odd)  td { background: #ffffff; }
    .param-label { font-weight: 700; color: #1A3A5C; width: 220px; }
    .param-desc  { font-style: italic; color: #336699; }
    .param-val   { font-weight: 700; color: #1A7A45; text-align: center; width: 90px; }
    .param-unit  { color: #555; width: 130px; }
    .samax-box { display: flex; align-items: center; justify-content: space-between;
      background: #FFF3E0; border: 2px solid ${accent}; border-radius: 6px;
      padding: 10px 18px; margin: 12px 0; }
    .samax-label { font-weight: 700; font-size: 13px; color: #333; }
    .samax-val   { font-size: 20px; font-weight: 900; color: #C04000; }
    .formula-row { display: flex; border-bottom: 1px solid #dce4ee; }
    .formula-zone { min-width: 200px; background: #ecf3fb; color: #2E5E8E;
      font-weight: 700; font-size: 12px; padding: 6px 12px; display: flex;
      align-items: center; border-right: 2px solid #2E5E8E; }
    .formula-expr { font-family: 'Courier New', monospace; font-size: 12px;
      padding: 6px 16px; display: flex; align-items: center; }
    .nota-item { font-size: 11px; color: #555; font-style: italic;
      padding: 4px 0 4px 12px; border-left: 3px solid ${accent}; margin: 4px 0; }
    .pdf-footer { margin-top: 16px; font-size: 10px; color: #aaa; text-align: center;
      font-style: italic; border-top: 1px solid #eee; padding-top: 8px; }
    .ver-chip { display: inline-block; background: ${accent}; color: ${dark};
      font-weight: 900; font-size: 12px; padding: 3px 12px;
      border-radius: 999px; letter-spacing: .5px; }
    .col-t   { font-family: 'Courier New', monospace; color: #1A3A5C; font-weight: 700; }
    .col-sa  { font-family: 'Courier New', monospace; color: #1A7A45; font-weight: 700; }
    .col-c   { font-family: 'Courier New', monospace; color: #7B5EA7; }
    .col-ms2 { font-family: 'Courier New', monospace; color: #C04000; }
  </style>`;
}

// ── Contenedor de captura (iframe invisible, renderizado completamente) ───────
function crearContenedor(widthPx = 900) {
  const iframe = document.createElement('iframe');
  Object.assign(iframe.style, {
    position: 'fixed', top: '0', left: '0',
    width: `${widthPx}px`, height: '10px',
    border: 'none', opacity: '0',
    pointerEvents: 'none', zIndex: '99999',
    background: '#ffffff', overflow: 'visible',
  });
  document.body.appendChild(iframe);
  const idoc = iframe.contentDocument || iframe.contentWindow.document;
  idoc.open();
  idoc.write('<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff;"></body></html>');
  idoc.close();
  const wrap = idoc.body;
  wrap.__iframe__ = iframe;
  return wrap;
}

// ── HTML de cada sección ─────────────────────────────────────────────────────

function htmlPortada({ version, zonaVal, sueloVal, U, Z, S, Tp, Tl, R, B = 1.0, SaMax, datos }) {
  const accent = VER_HEX[version] || '#0070C0';
  const dark   = VER_DARK[version] || '#003060';
  const fecha  = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' });

  const cards = version === 'puentes'
    ? [['A', Z.toFixed(2), `A = ${Z.toFixed(2)} g`],['Suelo', sueloVal, `S = ${S.toFixed(2)}`],['R', R.toFixed(1), `Csm = Cs/R`],['Csm máx', `${SaMax.toFixed(4)} g`, `R = ${R.toFixed(2)}`]]
    : version === 'e031'
      ? [['Zona', `Z${zonaVal}`, `Z = ${Z.toFixed(2)} g`],['Suelo', sueloVal, `S = ${S.toFixed(2)}`],['Uso', usarNombreUso(U), `U = ${U.toFixed(1)}`],['B', B.toFixed(2), 'Amortiguamiento'],['Riso', R.toFixed(2), `Sa máx = ${SaMax.toFixed(4)} g`]]
      : [['Zona', `Z${zonaVal}`, `Z = ${Z.toFixed(2)} g`],['Suelo', sueloVal, `S = ${S.toFixed(2)}`],['Uso', usarNombreUso(U), `U = ${U.toFixed(1)}`],['Tp', `${Tp.toFixed(2)} s`, Tl ? `TL = ${Tl.toFixed(2)} s` : '—'],['Sa máx', `${SaMax.toFixed(4)} g`, `R = ${R.toFixed(2)}`]];

  return `${estilosBase(accent, dark)}
    <div class="pdf-wrap" style="min-height:520px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
      <div style="width:100%;height:8px;background:linear-gradient(90deg,#1A3A5C,${accent});border-radius:4px;margin-bottom:40px;"></div>
      <div style="font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">
        ${version === 'puentes' ? 'Ministerio de Transportes y Comunicaciones' : 'Reglamento Nacional de Edificaciones'}
      </div>
      <div style="font-size:32px;font-weight:900;color:#1A3A5C;line-height:1.1;margin-bottom:8px;">
        ESPECTRO DE DISEÑO<br>SÍSMICO
      </div>
      <div style="font-size:15px;color:#555;margin-bottom:24px;">Análisis de la Respuesta Sísmica de Diseño</div>
      <div class="ver-chip" style="font-size:15px;padding:6px 24px;margin-bottom:32px;">${nombreNorma(version)}</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:36px;">
        ${cards.map(([lbl,val,sub])=>`
          <div style="background:#F4F8FC;border:1px solid #dce4ee;border-top:3px solid ${accent};border-radius:6px;padding:14px 20px;min-width:110px;">
            <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;">${lbl}</div>
            <div style="font-size:20px;font-weight:900;color:#1A3A5C;margin:4px 0;">${val}</div>
            <div style="font-size:11px;color:#666;">${sub}</div>
          </div>`).join('')}
      </div>
      <div style="font-size:12px;color:#aaa;">Generado el ${fecha}</div>
      <div style="width:100%;height:6px;background:linear-gradient(90deg,${accent},#1A3A5C);border-radius:4px;margin-top:40px;"></div>
    </div>`;
}

function htmlParametros({ version, zonaVal, sueloVal, U, R_base, R, IaEf, IpEf, Z, S, Tp, Tl, Ts, B = 1.0 }) {
  const accent = VER_HEX[version] || '#0070C0';
  const dark   = VER_DARK[version] || '#003060';
  const SaMax  = version === 'puentes' ? Z * 2.5 / R : Z * U * 2.5 * S / (R * B);
  const applyIrr = ['2016','2018','2026'].includes(version);
  const fecha  = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' });

  const filas = version === 'puentes' ? [
    ['Coef. aceleración (A)', 'Manual de Puentes MTC', Z.toFixed(2), 'g'],
    ['Clase de suelo', sueloVal, S.toFixed(2), 'Factor S'],
    ['R efectivo', `R = ${R_base}`, R.toFixed(2), 'Coef. reducción'],
    ['Csm máximo (T → 0)', 'Cs = 2.5A', SaMax.toFixed(4), 'g'],
    ['Csm máximo', 'En m/s²', (SaMax*9.81).toFixed(4), 'm/s²'],
  ] : version === 'e031' ? [
    ['Factor de zona (Z)', `Zona ${zonaVal}`, Z.toFixed(2), 'g'],
    ['Perfil de suelo', sueloVal, S.toFixed(2), 'Factor S'],
    ['Factor de uso (U)', usarNombreUso(U), U.toFixed(1), '—'],
    ['Amortiguamiento efectivo', `B = ${B.toFixed(2)}`, B.toFixed(2), '—'],
    ['Riso', 'Sistema aislado', R.toFixed(2), '—'],
    ['Período Tp', 'Plataforma espectral', Tp.toFixed(2), 's'],
    ['Período TL', 'Inicio vel. constante', Tl?.toFixed(2) ?? '—', 's'],
    ['Sa máxima ajustada', 'Z·U·2.5·S/(Riso·B)', SaMax.toFixed(4), 'g'],
    ['Sa máxima ajustada', 'En m/s²', (SaMax*9.81).toFixed(4), 'm/s²'],
  ] : [
    ['Factor de zona (Z)', `Zona ${zonaVal}`, Z.toFixed(2), 'g'],
    ['Perfil de suelo', sueloVal, S.toFixed(2), 'Factor S'],
    ['Factor de uso (U)', usarNombreUso(U), U.toFixed(1), '—'],
    ['Sistema estructural (R₀)', `R₀ = ${R_base}`, R_base.toFixed(0), 'Básico'],
    ['Irreg. de planta (Ip)', applyIrr ? 'Ver E.030 §4.6' : 'No aplica', IpEf.toFixed(2), applyIrr ? '§4.6' : 'N/A'],
    ['Irreg. de altura (Ia)', applyIrr ? 'Ver E.030 §4.6' : 'No aplica', IaEf.toFixed(2), applyIrr ? '§4.6' : 'N/A'],
    ['R efectivo', 'R = R₀ × Ia × Ip', R.toFixed(2), 'Coef. reducción'],
    ['Período Tp', 'Inicio de plataforma espectral', Tp.toFixed(2), 's'],
    Tl ? ['Período TL', 'Inicio de vel. constante', Tl.toFixed(2), 's'] : null,
    (version === '2026' && Ts > 0) ? ['Período Ts (microzon.)', 'Estudio de microzonificación', Ts.toFixed(2), 's'] : null,
    ['Sa máximo (T ≤ Tp)', 'C = 2.5 (plataforma)', SaMax.toFixed(4), 'g'],
    ['Sa máximo', 'En m/s²', (SaMax*9.81).toFixed(4), 'm/s²'],
  ].filter(Boolean);

  return `${estilosBase(accent, dark)}
    <div class="pdf-wrap">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div>
          <div style="font-size:18px;font-weight:900;color:#1A3A5C;">PARÁMETROS SÍSMICOS</div>
          <div style="font-size:12px;color:#555;">Espectro de Diseño — ${nombreNorma(version)}</div>
        </div>
        <div class="ver-chip">${version}</div>
      </div>
      <div style="height:3px;background:linear-gradient(90deg,#1A3A5C,${accent});margin-bottom:18px;border-radius:2px;"></div>
      <div class="sec-title">1. Parámetros de Diseño</div>
      <table>
        <thead><tr>
          <th style="text-align:left;width:220px;">Parámetro</th>
          <th style="text-align:left;">Descripción</th>
          <th style="width:90px;">Valor</th>
          <th style="width:130px;">Unidad / Nota</th>
        </tr></thead>
        <tbody>
          ${filas.map(([lbl,desc,val,unit])=>`<tr>
            <td class="param-label">${lbl}</td>
            <td class="param-desc">${desc}</td>
            <td class="param-val">${val}</td>
            <td class="param-unit">${unit}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="samax-box" style="margin-top:16px;">
        <div>
          <div class="samax-label">Aceleración Espectral Máxima</div>
          <div style="font-size:11px;color:#888;margin-top:2px;">Para T ≤ Tp  (C = 2.5)</div>
        </div>
        <div>
          <div class="samax-val">${SaMax.toFixed(4)} <span style="font-size:14px;">g</span></div>
          <div style="font-size:11px;color:#888;text-align:right;">${(SaMax*9.81).toFixed(3)} m/s²</div>
        </div>
      </div>
      <div class="pdf-footer">${nombreNorma(version)} — ${fecha}</div>
    </div>`;
}

function htmlFormulas({ version, sueloVal, Tp, Tl, Ts, IaEf, IpEf }) {
  const accent   = VER_HEX[version] || '#0070C0';
  const dark     = VER_DARK[version] || '#003060';
  const formulas = buildFormulas(version, Tp, Tl);
  const notas    = buildNotas(version, sueloVal, Tp, Tl, Ts, IaEf, IpEf);
  const fecha    = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' });
  const dondeStr = version === 'puentes'
    ? 'A = coef. de aceleración &nbsp;|&nbsp; S = coef. de sitio &nbsp;|&nbsp; T = período fundamental &nbsp;|&nbsp; R = coef. de reducción &nbsp;|&nbsp; Csm = coef. sísmico de diseño'
    : version === 'e031'
      ? 'Z = factor de zona &nbsp;|&nbsp; U = factor de uso &nbsp;|&nbsp; C = factor de amplificación &nbsp;|&nbsp; S = factor de suelo &nbsp;|&nbsp; B = amortiguamiento &nbsp;|&nbsp; Riso = reducción del sistema aislado'
      : 'Z = factor de zona &nbsp;|&nbsp; U = factor de uso &nbsp;|&nbsp; C = factor de amplificación sísmica &nbsp;|&nbsp; S = factor de suelo &nbsp;|&nbsp; R = coef. de reducción efectivo &nbsp;|&nbsp; Tp = período de la plataforma &nbsp;|&nbsp; TL = período de vel. constante';
  const refs = version === 'puentes'
    ? '<div class="nota-item">[1] MTC, Manual de Carreteras: Puentes — RD N° 19-2018-MTC/14.</div><div class="nota-item">[2] AASHTO LRFD Bridge Design Specifications.</div>'
    : version === 'e031'
      ? '<div class="nota-item">[1] RNE, Norma Técnica E.031 Aislamiento Sísmico.</div><div class="nota-item">[2] RNE, Norma Técnica E.030 Diseño Sismorresistente.</div>'
      : `<div class="nota-item">[1] RNE, Norma Técnica E.030 Diseño Sismorresistente.</div>${version==='2026'?'<div class="nota-item">[2] NTE E.030-2026. RM 183-2026-Vivienda, 28 abril 2026. SENCICO.</div><div class="nota-item">[3] RM 183-2026: S0–S5, rampa Art. 18, R muros = 3.5.</div>':`<div class="nota-item">[2] NTE E.030-${version}. SENCICO, Lima, Perú.</div>`}`;

  return `${estilosBase(accent, dark)}
    <div class="pdf-wrap">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div>
          <div style="font-size:18px;font-weight:900;color:#1A3A5C;">FÓRMULAS DEL ESPECTRO</div>
          <div style="font-size:12px;color:#555;">Expresiones del factor C y aceleración Sa</div>
        </div>
        <div class="ver-chip">${version}</div>
      </div>
      <div style="height:3px;background:linear-gradient(90deg,#1A3A5C,${accent});margin-bottom:18px;border-radius:2px;"></div>
      <div class="sec-title">2. Espectro de Respuesta — Factor C</div>
      <div style="border:1px solid #dce4ee;border-radius:4px;overflow:hidden;margin-bottom:16px;">
        ${formulas.map(([zona,expr])=>`<div class="formula-row">
          <div class="formula-zone">${zona}</div>
          <div class="formula-expr">${expr}</div>
        </div>`).join('')}
      </div>
      <div style="background:#f4f8fc;border-left:4px solid ${accent};padding:10px 14px;border-radius:0 4px 4px 0;margin-bottom:16px;font-size:12px;">
        <strong>Donde:</strong> ${dondeStr}
      </div>
      <div class="sec-title">3. Notas y Advertencias</div>
      <div style="padding:8px 0;">
        ${notas.map(n=>`<div class="nota-item">${n}</div>`).join('')}
      </div>
      <div class="sec-title" style="margin-top:16px;">4. Referencia Normativa</div>
      <div style="padding:8px 0;">${refs}</div>
      <div class="pdf-footer">${nombreNorma(version)} — ${fecha}</div>
    </div>`;
}

function htmlTablaEspectro({ version, datos }) {
  const accent = VER_HEX[version] || '#0070C0';
  const dark   = VER_DARK[version] || '#003060';
  const fecha  = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' });
  const cHead  = version === 'puentes' ? 'Csm' : 'C';

  return `${estilosBase(accent, dark)}
    <div class="pdf-wrap">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div>
          <div style="font-size:18px;font-weight:900;color:#1A3A5C;">TABLA DE ESPECTRO DE DISEÑO</div>
          <div style="font-size:12px;color:#555;">${datos.length} puntos — 5 % de amortiguamiento</div>
        </div>
        <div class="ver-chip">${version}</div>
      </div>
      <div style="height:3px;background:linear-gradient(90deg,#1A3A5C,${accent});margin-bottom:18px;border-radius:2px;"></div>
      <div class="sec-title">Valores del Espectro de Respuesta</div>
      <table>
        <thead><tr><th>T (s)</th><th>${cHead}</th><th>Sa (g)</th><th>Sa (m/s²)</th></tr></thead>
        <tbody>
          ${datos.map(d=>`<tr>
            <td class="col-t"  style="text-align:center;">${d.T.toFixed(3)}</td>
            <td class="col-c"  style="text-align:center;">${d.C.toFixed(4)}</td>
            <td class="col-sa" style="text-align:center;">${d.Sa.toFixed(5)}</td>
            <td class="col-ms2" style="text-align:center;">${d.SaMS2.toFixed(4)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="pdf-footer">${nombreNorma(version)} — ${fecha}</div>
    </div>`;
}

function htmlGrafico({ version, datos, Tp, Tl, SaMax, Z, S, U, R }) {
  const accent = VER_HEX[version] || '#0070C0';
  const dark   = VER_DARK[version] || '#003060';
  const fecha  = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' });

  const W=780, H=400, mx=60, my=30, mr=30, mb=50;
  const pw=W-mx-mr, ph=H-my-mb;
  const Tmax  = Math.max(...datos.map(d=>d.T));
  const Samax = Math.max(...datos.map(d=>d.Sa)) * 1.1;
  const px = T  => mx + (T  / Tmax)  * pw;
  const py = Sa => my + (1 - Sa / Samax) * ph;
  const polyline = datos.map(d=>`${px(d.T).toFixed(1)},${py(d.Sa).toFixed(1)}`).join(' ');

  const gridH = Array.from({length:6},(_,i)=>{
    const saG=(i/5)*Samax, y=py(saG);
    return `<line x1="${mx}" y1="${y.toFixed(1)}" x2="${mx+pw}" y2="${y.toFixed(1)}" stroke="#ddd" stroke-width="1"/>
            <text x="${mx-4}" y="${(y+4).toFixed(1)}" text-anchor="end" font-size="10" fill="#888">${saG.toFixed(3)}</text>`;
  }).join('');
  const gridV = Array.from({length:6},(_,i)=>{
    const tG=(i/5)*Tmax, x=px(tG);
    return `<line x1="${x.toFixed(1)}" y1="${my}" x2="${x.toFixed(1)}" y2="${my+ph}" stroke="#ddd" stroke-width="1"/>
            <text x="${x.toFixed(1)}" y="${(my+ph+16).toFixed(1)}" text-anchor="middle" font-size="10" fill="#888">${tG.toFixed(1)}</text>`;
  }).join('');
  const lineTp = Tp ? `<line x1="${px(Tp).toFixed(1)}" y1="${my}" x2="${px(Tp).toFixed(1)}" y2="${my+ph}" stroke="#808080" stroke-width="1.5" stroke-dasharray="6,3"/>
    <text x="${(px(Tp)+4).toFixed(1)}" y="${(my+14).toFixed(1)}" font-size="10" fill="#606060" font-weight="bold">Tp=${Tp.toFixed(2)}s</text>` : '';
  const lineTl = Tl ? `<line x1="${px(Tl).toFixed(1)}" y1="${my}" x2="${px(Tl).toFixed(1)}" y2="${my+ph}" stroke="#A0A0A0" stroke-width="1.5" stroke-dasharray="6,3"/>
    <text x="${(px(Tl)+4).toFixed(1)}" y="${(my+28).toFixed(1)}" font-size="10" fill="#707070" font-weight="bold">TL=${Tl.toFixed(2)}s</text>` : '';
  const ySamax = py(SaMax);
  const anotSa = `<line x1="${mx}" y1="${ySamax.toFixed(1)}" x2="${mx+pw}" y2="${ySamax.toFixed(1)}" stroke="${accent}" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>
    <text x="${(mx+pw-4).toFixed(1)}" y="${(ySamax-4).toFixed(1)}" text-anchor="end" font-size="10" fill="${accent}" font-weight="bold">Sa_max = ${SaMax.toFixed(4)} g</text>`;

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI',Arial,sans-serif">
    <rect width="${W}" height="${H}" fill="#fff"/>
    ${gridH}${gridV}
    <line x1="${mx}" y1="${my}" x2="${mx}" y2="${my+ph}" stroke="#555" stroke-width="1.5"/>
    <line x1="${mx}" y1="${my+ph}" x2="${mx+pw}" y2="${my+ph}" stroke="#555" stroke-width="1.5"/>
    <text x="${(mx+pw/2).toFixed(1)}" y="${H-6}" text-anchor="middle" font-size="12" fill="#333" font-weight="bold">PERÍODO  T  (s)</text>
    <text transform="rotate(-90)" x="${-(my+ph/2).toFixed(1)}" y="14" text-anchor="middle" font-size="12" fill="#333" font-weight="bold">Sa  (g)</text>
    ${lineTp}${lineTl}${anotSa}
    <polyline points="${polyline}" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`;

  return `${estilosBase(accent, dark)}
    <div class="pdf-wrap" style="padding:24px 32px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div>
          <div style="font-size:18px;font-weight:900;color:#1A3A5C;">GRÁFICO — ESPECTRO DE DISEÑO</div>
          <div style="font-size:12px;color:#555;">Sa vs T — Amortiguamiento 5 %</div>
        </div>
        <div class="ver-chip">${version}</div>
      </div>
      <div style="height:3px;background:linear-gradient(90deg,#1A3A5C,${accent});margin-bottom:16px;border-radius:2px;"></div>
      <div style="border:1px solid #dce4ee;border-radius:6px;padding:12px;background:#fafcff;">${svg}</div>
      <div style="display:flex;gap:24px;margin-top:12px;font-size:11px;color:#555;justify-content:center;">
        <span><span style="display:inline-block;width:28px;height:3px;background:${accent};vertical-align:middle;margin-right:6px;border-radius:2px;"></span>Sa (g)</span>
        ${Tp ? `<span>· · ·&nbsp; Tp = ${Tp.toFixed(2)} s</span>` : ''}
        ${Tl ? `<span>· · ·&nbsp; TL = ${Tl.toFixed(2)} s</span>` : ''}
      </div>
      <div style="display:flex;gap:16px;margin-top:14px;padding:10px 14px;background:#f4f8fc;border-radius:6px;font-size:11px;color:#333;flex-wrap:wrap;">
        ${version==='puentes'
          ? `<span><strong>A =</strong> ${Z.toFixed(2)}</span><span><strong>S =</strong> ${S.toFixed(2)}</span><span><strong>R =</strong> ${R.toFixed(2)}</span><span><strong>Csm_max =</strong> ${SaMax.toFixed(4)} g</span>`
          : `<span><strong>Z =</strong> ${Z.toFixed(2)}</span><span><strong>U =</strong> ${U.toFixed(1)}</span><span><strong>S =</strong> ${S.toFixed(2)}</span><span><strong>R =</strong> ${R.toFixed(2)}</span>${Tp?`<span><strong>Tp =</strong> ${Tp.toFixed(2)} s</span>`:''}${Tl?`<span><strong>TL =</strong> ${Tl.toFixed(2)} s</span>`:''}<span><strong>Sa_max =</strong> ${SaMax.toFixed(4)} g</span>`}
      </div>
      <div class="pdf-footer" style="margin-top:12px;">${nombreNorma(version)} — ${fecha}</div>
    </div>`;
}

// ── Motor de captura: HTML → html2canvas → PNG ────────────────────────────────
async function capturarHtml(htmlString, widthPx = 900, scale = 2) {
  const wrap   = crearContenedor(widthPx);
  const iframe = wrap.__iframe__;
  wrap.innerHTML = htmlString;
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  iframe.style.height = `${wrap.scrollHeight}px`;
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise(r => setTimeout(r, 80));

  const canvas = await html2canvas(wrap, {
    scale, useCORS: true, allowTaint: true, backgroundColor: '#ffffff',
    logging: false, width: widthPx, height: wrap.scrollHeight,
    windowWidth: widthPx, windowHeight: wrap.scrollHeight, scrollX: 0, scrollY: 0,
  });
  document.body.removeChild(iframe);
  return { dataUrl: canvas.toDataURL('image/png', 1.0), w: canvas.width, h: canvas.height };
}

// ── Añadir página al PDF (con paginación automática si la imagen es muy alta) ─
async function agregarImagenPDF(pdf, dataUrl, imgW, imgH, orientation = 'portrait') {
  const pageW  = orientation === 'landscape' ? 297 : 210;
  const pageH  = orientation === 'landscape' ? 210 : 297;
  const margin = 8;
  const scale  = 2;
  const usableW  = pageW - 2 * margin;
  const ratio    = usableW / (imgW / scale);
  const usableH  = pageH - 2 * margin;
  const pxPerPage = usableH / ratio;
  const totalPages = Math.ceil((imgH / scale) / pxPerPage);

  const imgEl = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  for (let p = 0; p < totalPages; p++) {
    if (p > 0) pdf.addPage([pageW, pageH], orientation);
    const srcY     = Math.round(p * pxPerPage * scale);
    const srcH     = Math.min(pxPerPage * scale, imgH - srcY);
    const tmpCanvas       = document.createElement('canvas');
    tmpCanvas.width       = imgW;
    tmpCanvas.height      = Math.round(srcH);
    const ctx = tmpCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
    ctx.drawImage(imgEl, 0, srcY, imgW, Math.round(srcH), 0, 0, imgW, Math.round(srcH));
    const sliceUrl  = tmpCanvas.toDataURL('image/png', 1.0);
    const sliceHmm  = (srcH / scale) * ratio;
    pdf.addImage(sliceUrl, 'PNG', margin, margin, usableW, Math.min(sliceHmm, usableH));
  }
}

// ── EXPORT PRINCIPAL ──────────────────────────────────────────────────────────
async function exportPDF() {
  if (!datosEspectro.length) { console.warn('exportPDF: sin datos de espectro.'); return; }

  const bridge   = normaVersion === 'puentes';
  const e031     = normaVersion === 'e031';
  const A        = bridge ? parseFloat(document.getElementById('puente_A').value) : null;
  const zonaVal  = bridge ? A : parseInt(document.getElementById('zona').value);
  const sueloVal = bridge ? document.getElementById('puente_suelo').value : document.getElementById('suelo').value;
  const U        = bridge ? 1.0 : parseFloat(document.getElementById('uso').value);
  const R_base   = bridge
    ? parseFloat(document.getElementById('puente_R').value)
    : e031
      ? parseFloat(document.getElementById('e031_R').value)
      : parseFloat(document.getElementById('sistema').value);
  const B        = e031 ? parseFloat(document.getElementById('e031_beta').value) : 1.0;
  const Ip       = bridge ? 1.0 : parseFloat(document.getElementById('irreg_planta').value);
  const Ia       = bridge ? 1.0 : parseFloat(document.getElementById('irreg_altura').value);
  const Ts       = (!bridge && !e031 && normaVersion === '2026')
    ? (parseFloat(document.getElementById('ts_value')?.value) || 0) : 0;
  const pasoVal  = parseFloat(document.getElementById('paso').value);

  const p = resolveParams(normaVersion, zonaVal, sueloVal);
  if (!p) return;
  const { Z, S, Tp, Tl } = p;
  const applyIrr = ['2016','2018','2026'].includes(normaVersion);
  const IaEf  = applyIrr ? Ia : 1.0;
  const IpEf  = applyIrr ? Ip : 1.0;
  const R     = e031 ? R_base : R_base * IaEf * IpEf;
  const SaMax = bridge ? Z * 2.5 / R : Z * U * 2.5 * S / (R * B);

  const datosFiltrados = datosEspectro.filter(d => {
    const m = Math.round(d.T / pasoVal);
    return Math.abs(d.T - m * pasoVal) < 1e-9;
  });

  const ctx = { version: normaVersion, zonaVal, sueloVal, U, R_base, R, IaEf, IpEf, Z, S, Tp, Tl, Ts, B, SaMax, datos: datosFiltrados };

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Portada
  { const { dataUrl,w,h } = await capturarHtml(htmlPortada(ctx), 900); await agregarImagenPDF(pdf, dataUrl, w, h, 'portrait'); }
  // Parámetros
  { pdf.addPage([210,297],'portrait'); const { dataUrl,w,h } = await capturarHtml(htmlParametros(ctx), 900); await agregarImagenPDF(pdf, dataUrl, w, h, 'portrait'); }
  // Fórmulas + Notas
  { pdf.addPage([210,297],'portrait'); const { dataUrl,w,h } = await capturarHtml(htmlFormulas(ctx), 900); await agregarImagenPDF(pdf, dataUrl, w, h, 'portrait'); }
  // Tabla
  { pdf.addPage([210,297],'portrait'); const { dataUrl,w,h } = await capturarHtml(htmlTablaEspectro(ctx), 700); await agregarImagenPDF(pdf, dataUrl, w, h, 'portrait'); }
  // Gráfico
  { pdf.addPage([297,210],'landscape'); const { dataUrl,w,h } = await capturarHtml(htmlGrafico(ctx), 1100); await agregarImagenPDF(pdf, dataUrl, w, h, 'landscape'); }

  const fecha  = new Date().toISOString().slice(0,10);
  const nombre = bridge
    ? `Espectro_Puentes-MTC_A${Z.toFixed(2)}S${sueloVal}_${fecha}.pdf`
    : e031
      ? `Espectro_E031-Aislamiento_Z${zonaVal}${sueloVal}_${fecha}.pdf`
      : `Espectro_E030-${normaVersion}_Z${zonaVal}${sueloVal}_${fecha}.pdf`;
  pdf.save(nombre);
}

export { exportPDF };
