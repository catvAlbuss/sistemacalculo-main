import UBIGEO_DATA from "../../data/ubigeo.js";
import { exportTXT }  from "./exporttxt.js";
import { exportXLSX } from "./exportadoxlsx.js";
import { exportPDF }  from "./exportPDF.js";

export let normaVersion = "2026";
export let datosEspectro = [];
let ubigeoSeleccionado = null;

const versions = ["1977","1997","2003","2016","2018","2026","e031","puentes"];

const zoneZ = {
    "1977": { 1:0.4,  2:0.7,  3:1    },
    "1997": { 1:0.15, 2:0.3,  3:0.4  },
    "2003": { 1:0.15, 2:0.3,  3:0.4  },
    "2016": { 1:0.1,  2:0.25, 3:0.35, 4:0.45 },
    "2018": { 1:0.1,  2:0.25, 3:0.35, 4:0.45 },
    "2026": { 1:0.1,  2:0.25, 3:0.35, 4:0.45 },
    "e031": { 1:0.1,  2:0.25, 3:0.35, 4:0.45 },
};

const sueloOld = {
    "1977": { S1:{S:1,Tp:0.4}, S2:{S:1.2,Tp:0.6}, S3:{S:1.5,Tp:0.9} },
    "1997": { S1:{S:1,Tp:0.4}, S2:{S:1.2,Tp:0.6}, S3:{S:1.4,Tp:0.9}, S4:{S:1.4,Tp:0.9} },
    "2003": { S1:{S:1,Tp:0.4}, S2:{S:1.2,Tp:0.6}, S3:{S:1.4,Tp:0.9}, S4:{S:1.4,Tp:0.9} },
};

const factorS2016 = {
    Z4_S0:0.8, Z4_S1:1, Z4_S2:1.05, Z4_S3:1.1,
    Z3_S0:0.8, Z3_S1:1, Z3_S2:1.15, Z3_S3:1.2,
    Z2_S0:0.8, Z2_S1:1, Z2_S2:1.2,  Z2_S3:1.4,
    Z1_S0:0.8, Z1_S1:1, Z1_S2:1.6,  Z1_S3:2,
};

const factorS2026 = {
    ...factorS2016,
    Z4_S4:1.1, Z4_S5:1.1,
    Z3_S4:1.2, Z3_S5:1.2,
    Z2_S4:1.4, Z2_S5:1.4,
    Z1_S4:2,   Z1_S5:2,
};

const sueloModern = {
    S0:{Tp:0.3,Tl:3}, S1:{Tp:0.4,Tl:2.5}, S2:{Tp:0.6,Tl:2},
    S3:{Tp:1,Tl:1.6}, S4:{Tp:1,Tl:1.6},   S5:{Tp:1,Tl:1.6},
};

// Puentes MTC/AASHTO: factor de sitio por clase
const sueloPuentes = { I:{S:1.0}, II:{S:1.2}, III:{S:1.5}, IV:{S:2.0} };

const versionColor = {
    "1977":"#f72585","1997":"#ffd166","2003":"#ff6b35",
    "2016":"#c77dff","2018":"#00e5ff","2026":"#00ff88",
    "e031":"#2dd4bf","puentes":"#00a3ff",
};

const $ = (id) => document.getElementById(id);

function option(value, label, selected = false) {
    const el = document.createElement("option");
    el.value = value; el.textContent = label; el.selected = selected;
    return el;
}
function cap(t = "") { return t.charAt(0) + t.slice(1).toLowerCase(); }

// ── UBIGEO ────────────────────────────────────────────────────────────────────
function initUbigeo() {
    const depSel  = $("zonaDepartamento");
    const provSel = $("zonaProvincia");
    const distSel = $("zonaDistrito");

    depSel.innerHTML = "";
    depSel.appendChild(option("","- Departamento -",true));
    UBIGEO_DATA.forEach((dep,i) => depSel.appendChild(option(i,dep.name)));
    provSel.innerHTML = ""; provSel.appendChild(option("","- Provincia -",true));
    distSel.innerHTML = ""; distSel.appendChild(option("","- Distrito -",true));

    depSel.addEventListener("change", () => {
        const di = Number(depSel.value);
        provSel.innerHTML = ""; distSel.innerHTML = "";
        distSel.appendChild(option("","- Distrito -",true)); distSel.disabled = true;
        if (Number.isNaN(di)) {
            provSel.appendChild(option("","- Provincia -",true)); provSel.disabled = true;
            clearUbigeoTag(); return;
        }
        provSel.disabled = false;
        provSel.appendChild(option("","- Provincia -",true));
        UBIGEO_DATA[di].provinces.forEach((p,i) => provSel.appendChild(option(i,p.name)));
        clearUbigeoTag();
    });

    provSel.addEventListener("change", () => {
        const di = Number(depSel.value), pi = Number(provSel.value);
        distSel.innerHTML = "";
        if (Number.isNaN(di) || Number.isNaN(pi)) {
            distSel.appendChild(option("","- Distrito -",true)); distSel.disabled = true;
            clearUbigeoTag(); return;
        }
        distSel.disabled = false;
        distSel.appendChild(option("","- Distrito -",true));
        UBIGEO_DATA[di].provinces[pi].districts.forEach((d,i) => distSel.appendChild(option(i,d.name)));
        clearUbigeoTag();
    });

    distSel.addEventListener("change", () => {
        const di = Number(depSel.value), pi = Number(provSel.value), disti = Number(distSel.value);
        if (Number.isNaN(di)||Number.isNaN(pi)||Number.isNaN(disti)) return;
        const dep  = UBIGEO_DATA[di];
        const prov = dep.provinces[pi];
        const dist = prov.districts[disti];
        const zone = Number(dist.zone);
        ubigeoSeleccionado = { dep:dep.name, prov:prov.name, dist:dist.name, zone };
        renderUbigeoTag(zone, dist.name, prov.name);
        applyZonaFromUbigeo(zone);
    });
}

function clearUbigeoTag() {
    ubigeoSeleccionado = null;
    const tag = $("ubigeo-tag"); if (tag) tag.style.display = "none";
}

function renderUbigeoTag(zone, district, province) {
    const tag = $("ubigeo-tag"); if (!tag) return;
    tag.style.display = "flex";
    tag.innerHTML = `<span class="font-bold text-red-600 dark:text-red-400">Zona ${zone} asignada</span><span class="text-[0.68rem] text-gray-500 dark:text-gray-400">— ${cap(district)}, ${cap(province)}</span>`;
}

function applyZonaFromUbigeo(zone) {
    if (normaVersion === "puentes") return;
    const zonaSelect = $("zona"); if (!zonaSelect) return;
    const eff = ["1977","1997","2003"].includes(normaVersion) && zone === 4 ? 3 : zone;
    zonaSelect.value = String(eff);
}

// ── VERSIÓN ───────────────────────────────────────────────────────────────────
function setVersion(version) {
    normaVersion = version;
    const bridge = version === "puentes";
    const e031   = version === "e031";

    versions.forEach((v) => {
        const btn = $("btn" + v); if (!btn) return;
        const on = v === version;
        btn.classList.toggle("border-red-600",      on);
        btn.classList.toggle("bg-red-600",          on);
        btn.classList.toggle("text-white",          on);
        btn.classList.toggle("dark:border-red-500", on);
        btn.classList.toggle("dark:bg-red-600",     on);
        btn.classList.toggle("border-gray-300",     !on);
        btn.classList.toggle("bg-white",            !on);
        btn.classList.toggle("text-gray-700",       !on);
        btn.classList.toggle("dark:border-gray-700",!on);
        btn.classList.toggle("dark:bg-gray-800",    !on);
        btn.classList.toggle("dark:text-gray-300",  !on);
    });

    // Visibilidad de grupos
    show("grupo-zona-suelo",    !bridge);
    show("grupo-uso",           !bridge);
    show("grupo-e030-estruct",  !bridge && !e031);
    show("grupo-e031",          e031);
    show("grupo-puentes",       bridge);
    show("ts-group",            version === "2026");

    // Fórmula y título
    const fl = $("formula-label");
    if (fl) fl.textContent = bridge
        ? "Csm = min(2.5A, 1.2A·S/T²⁄³) / R"
        : e031
            ? "Sa = Z·U·C·S / (Riso·B)  ·g"
            : "Sa = Z·U·C·S / R  ·g";

    if (bridge) return;

    // Rellenar zona y suelo
    const zona  = $("zona");  if (!zona)  return;
    const suelo = $("suelo"); if (!suelo) return;
    zona.innerHTML = ""; suelo.innerHTML = "";

    if (version === "1977") {
        [[1,"Z = 0.40"],[2,"Z = 0.70"],[3,"Z = 1.00"]].forEach(([v,l]) =>
            zona.appendChild(option(v,`Zona ${v} — ${l}`, v===3)));
        [["S1","Roca o suelo rígido"],["S2","Suelos intermedios"],["S3","Suelos blandos"]].forEach(([v,l]) =>
            suelo.appendChild(option(v,`${v} — ${l}`, v==="S2")));
    } else if (version === "1997" || version === "2003") {
        [[1,"Z = 0.15"],[2,"Z = 0.30"],[3,"Z = 0.40"]].forEach(([v,l]) =>
            zona.appendChild(option(v,`Zona ${v} — ${l}`, v===3)));
        [["S1","Roca o suelo muy rígido"],["S2","Suelos intermedios"],["S3","Suelos blandos"],["S4","Condiciones excepcionales"]].forEach(([v,l]) =>
            suelo.appendChild(option(v,`${v} — ${l}`, v==="S2")));
    } else {
        [[1,"Z = 0.10"],[2,"Z = 0.25"],[3,"Z = 0.35"],[4,"Z = 0.45"]].forEach(([v,l]) =>
            zona.appendChild(option(v,`Zona ${v} — ${l}`, v===4)));
        const list = (version === "2026") ? ["S0","S1","S2","S3","S4","S5"] : ["S0","S1","S2","S3"];
        const lbl  = { S0:"Roca dura", S1:"Roca o suelo muy rígido", S2:"Suelos rígidos",
                        S3:"Suelos intermedios a blandos", S4:"Suelos blandos", S5:"Excepcional" };
        list.forEach((v) => suelo.appendChild(option(v,`${v} — ${lbl[v]}`, v==="S2")));
    }

    if (ubigeoSeleccionado) applyZonaFromUbigeo(ubigeoSeleccionado.zone);
}

function show(id, visible) {
    const el = $(id); if (!el) return;
    el.style.display = visible ? "block" : "none";
}

// ── RESOLVE PARAMS ────────────────────────────────────────────────────────────
export function resolveParams(version, zonaVal, sueloVal) {
    if (version === "puentes") {
        const soil = sueloPuentes[sueloVal];
        return soil ? { Z:Number(zonaVal), S:soil.S, Tp:null, Tl:null } : null;
    }
    if (version === "1977" || version === "1997" || version === "2003") {
        const soil = sueloOld[version][sueloVal];
        return soil ? { Z:zoneZ[version][zonaVal], S:soil.S, Tp:soil.Tp, Tl:null } : null;
    }
    if (version === "e031") {
        const S    = factorS2016[`Z${zonaVal}_${sueloVal}`];
        const soil = sueloModern[sueloVal];
        return S && soil ? { Z:zoneZ.e031[zonaVal], S, Tp:soil.Tp, Tl:soil.Tl } : null;
    }
    const factors = version === "2026" ? factorS2026 : factorS2016;
    const S    = factors[`Z${zonaVal}_${sueloVal}`];
    const soil = sueloModern[sueloVal];
    return S && soil ? { Z:zoneZ[version][zonaVal], S, Tp:soil.Tp, Tl:soil.Tl } : null;
}

// ── FACTOR C ──────────────────────────────────────────────────────────────────
function factorC(T, Tp, Tl, version) {
    if (version === "1977") return T === 0 ? 2.5 : Math.min(2.5, (Tp/T)**(2/3));
    if (version === "1997" || version === "2003") return T < Tp ? 2.5 : 2.5*(Tp/T);
    if (version === "2016" || version === "2018" || version === "e031") {
        if (T <= Tp) return 2.5;
        if (T <= Tl) return 2.5*(Tp/T);
        return (2.5*Tp*Tl)/(T*T);
    }
    // 2026
    if (T < 0.2*Tp) return 1 + 7.5*(T/Tp);
    if (T <= Tp)    return 2.5;
    if (T <= Tl)    return 2.5*(Tp/T);
    return (2.5*Tp*Tl)/(T*T);
}

function csPuentes(T, A, S) {
    if (T === 0) return 2.5*A;
    return Math.min(2.5*A, (1.2*A*S)/(T**(2/3)));
}

// ── CALCULAR ──────────────────────────────────────────────────────────────────
function calcular() {
    const bridge = normaVersion === "puentes";
    const isE031 = normaVersion === "e031";
    const Tmax   = Number($("tmax").value);
    const paso   = Number($("paso").value);

    if (!Number.isFinite(Tmax)||!Number.isFinite(paso)||Tmax<=0||paso<=0) {
        showError("Verifique los parámetros ingresados."); return;
    }

    let zonaVal, sueloVal, U, Rbase, Ip, Ia, B;

    if (bridge) {
        zonaVal  = parseFloat($("puente_A").value);   // A coefficient
        sueloVal = $("puente_suelo").value;
        Rbase    = parseFloat($("puente_R").value);
        U=1; Ip=1; Ia=1; B=1;
    } else if (isE031) {
        zonaVal  = Number($("zona").value);
        sueloVal = $("suelo").value;
        U        = parseFloat($("uso").value);
        Rbase    = parseFloat($("e031_R").value);
        B        = parseFloat($("e031_beta").value);
        Ip=1; Ia=1;
    } else {
        zonaVal  = Number($("zona").value);
        sueloVal = $("suelo").value;
        U        = parseFloat($("uso").value);
        Rbase    = parseFloat($("sistema").value);
        Ip       = parseFloat($("irreg_planta").value);
        Ia       = parseFloat($("irreg_altura").value);
        B=1;
    }

    if (!zonaVal||!sueloVal) { showError("Verifique los parámetros ingresados."); return; }

    let params = resolveParams(normaVersion, zonaVal, sueloVal);
    if (!params) { showError("No se encontraron parámetros para la combinación seleccionada."); return; }

    let sueloEfectivo = sueloVal, sueloOriginal = sueloVal, sueloModificado = false;
    const Ts = (!bridge && !isE031 && normaVersion === "2026")
        ? Number($("ts_value")?.value || 0) : 0;

    if (normaVersion === "2026" && Ts > 0 && params.Tp && Ts > 0.65*params.Tp && sueloVal !== "S5") {
        const deg = { S0:"S1", S1:"S2", S2:"S3", S3:"S4", S4:"S5" };
        sueloEfectivo = deg[sueloVal] || sueloVal;
        sueloModificado = sueloEfectivo !== sueloVal;
        params = resolveParams(normaVersion, zonaVal, sueloEfectivo) || params;
    }

    const applyIrr = ["2016","2018","2026"].includes(normaVersion);
    const IaEf = applyIrr ? Ia : 1;
    const IpEf = applyIrr ? Ip : 1;
    const R    = isE031 ? Rbase : Rbase * IaEf * IpEf;
    const { Z, S, Tp, Tl } = params;

    const puntos = new Set();
    for (let t=0; t<=Tmax+1e-9; t=Math.round((t+paso)*1000)/1000) puntos.add(t);
    if (Tp && Tp<=Tmax) puntos.add(Number(Tp.toFixed(3)));
    if (Tl && Tl<=Tmax) puntos.add(Number(Tl.toFixed(3)));
    if (normaVersion==="2026"&&Tp) puntos.add(Number((0.2*Tp).toFixed(3)));

    datosEspectro = Array.from(puntos).sort((a,b)=>a-b).map((T) => {
        let C, Sa;
        if (bridge) {
            C  = csPuentes(T, Z, S);
            Sa = C / R;
        } else {
            C  = factorC(T, Tp, Tl, normaVersion);
            Sa = (Z * U * C * S) / (R * B);
        }
        return { T, C:round(C,4), Sa:round(Sa,5), SaMS2:round(Sa*9.81,4) };
    });

    hideError();
    renderChart(datosEspectro);
    renderTable(datosEspectro, paso);
    renderParams({ Z, S, Tp, Tl, U, R, Rbase, IaEf, IpEf, zonaVal, sueloOriginal, sueloEfectivo, Ts, sueloModificado, B, bridge, isE031 });
}

function round(v,d) { return Number(v.toFixed(d)); }
function showError(msg) { const e=$("error-msg"); e.textContent=msg; e.style.display="block"; }
function hideError()    { $("error-msg").style.display="none"; }

// ── GRÁFICO (canvas custom) ──────────────────────────────────────────────────
function hexToRgba(hex, a) {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
}

function renderChart(data) {
    $("empty-state").style.display = "none";
    const canvas = $("myChart");
    canvas.style.display = "block";
    const ctx   = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const rect  = canvas.parentElement.getBoundingClientRect();
    canvas.width  = Math.max(320, Math.floor(rect.width  * ratio));
    canvas.height = Math.max(260, Math.floor(rect.height * ratio));
    ctx.setTransform(ratio,0,0,ratio,0,0);

    const W = canvas.width/ratio, H = canvas.height/ratio;
    const pad = { left:56, right:18, top:24, bottom:44 };
    const pw  = W - pad.left - pad.right;
    const ph  = H - pad.top  - pad.bottom;
    const maxT  = Math.max(...data.map(d=>d.T), 1);
    const maxSa = Math.max(...data.map(d=>d.Sa), 0.1) * 1.12;
    const color = versionColor[normaVersion] || "#00ff88";

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#0f1528"; ctx.fillRect(0,0,W,H);
    ctx.font="11px monospace"; ctx.fillStyle="#5a7090";

    for (let i=0;i<=5;i++) {
        const x=pad.left+(pw*i)/5, y=pad.top+(ph*i)/5;
        ctx.strokeStyle="rgba(30,45,74,0.75)"; ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(x,pad.top); ctx.lineTo(x,pad.top+ph);
        ctx.moveTo(pad.left,y); ctx.lineTo(pad.left+pw,y);
        ctx.stroke();
        ctx.fillText(((maxT*i)/5).toFixed(1), x-8, H-18);
        ctx.fillText((maxSa*(1-i/5)).toFixed(3), 8, y+4);
    }

    const toX=T  => pad.left+(T /maxT )*pw;
    const toY=Sa => pad.top +ph-(Sa/maxSa)*ph;

    ctx.beginPath();
    data.forEach((d,i) => { const x=toX(d.T),y=toY(d.Sa); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.stroke();

    ctx.lineTo(toX(data[data.length-1].T), pad.top+ph);
    ctx.lineTo(toX(data[0].T), pad.top+ph);
    ctx.closePath();
    const grad=ctx.createLinearGradient(0,pad.top,0,pad.top+ph);
    grad.addColorStop(0,hexToRgba(color,0.22)); grad.addColorStop(1,hexToRgba(color,0.02));
    ctx.fillStyle=grad; ctx.fill();

    ctx.fillStyle="#5a7090";
    ctx.fillText("T (s)", pad.left+pw/2-12, H-4);
    ctx.save(); ctx.rotate(-Math.PI/2);
    ctx.fillText("Sa (g)", -H/2-14, 14); ctx.restore();
}

// ── TABLA ─────────────────────────────────────────────────────────────────────
function filterByStep(data, paso) {
    return data.filter(d => { const m=Math.round(d.T/paso); return Math.abs(d.T-m*paso)<1e-9; });
}

function renderTable(data, paso) {
    $("tabla-panel").style.display = "block";
    const cHead = normaVersion==="puentes" ? "Cs" : normaVersion==="e031" ? "C" : "C";
    const thC = $("tabla-c-head"); if (thC) thC.textContent = cHead;
    const rows = filterByStep(data, paso).map(d => `
        <tr class="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-700/30">
            <td class="px-4 py-2">${d.T.toFixed(3)}</td>
            <td class="px-4 py-2 text-right font-mono">${d.Sa.toFixed(5)}</td>
            <td class="px-4 py-2 text-right font-mono">${d.C.toFixed(4)}</td>
            <td class="px-4 py-2 text-right font-mono">${d.SaMS2.toFixed(4)}</td>
        </tr>`);
    $("tabla-body").innerHTML = rows.join("");
}

// ── PARAMS ────────────────────────────────────────────────────────────────────
function renderParams(d) {
    const el = $("params-out");
    const SaMax = d.bridge
        ? d.Z * 2.5 * d.S / d.R
        : (d.Z * d.U * 2.5 * d.S) / (d.R * d.B);
    const c  = "rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/70";
    const hc = "rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-700 dark:bg-red-900/20";
    const kc = "text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400";
    const vc = "mt-1 text-sm font-bold text-gray-900 dark:text-white";
    el.style.display = "grid";
    const normaLabel = d.bridge ? "Manual Puentes MTC" : d.isE031 ? "E.031 Aislamiento" : `E.030 — ${normaVersion}`;

    el.innerHTML = `
        <div class="${hc} col-span-2"><div class="${kc}">Norma activa</div><div class="${vc} text-red-700 dark:text-red-400">${normaLabel}</div></div>
        ${ubigeoSeleccionado&&!d.bridge?`<div class="${c} col-span-2"><div class="${kc}">Ubicación</div><div class="${vc} text-xs">${cap(ubigeoSeleccionado.dist)}, ${cap(ubigeoSeleccionado.prov)}, ${cap(ubigeoSeleccionado.dep)}</div></div>`:""}
        <div class="${hc}"><div class="${kc}">${d.bridge?"A — Aceleración":`Z — Zona ${d.zonaVal}`}</div><div class="${vc}">${d.Z.toFixed(2)} <span class="text-xs text-gray-500 dark:text-gray-400">g</span></div></div>
        <div class="${hc}"><div class="${kc}">S — ${d.sueloEfectivo}</div><div class="${vc}">${d.S.toFixed(2)}</div></div>
        ${!d.bridge?`<div class="${c}"><div class="${kc}">U</div><div class="${vc}">${d.U.toFixed(1)}</div></div>`:""}
        <div class="${c}"><div class="${kc}">R${d.isE031?" (Riso)":""}</div><div class="${vc}">${d.R.toFixed(2)}</div></div>
        ${d.isE031?`<div class="${c}"><div class="${kc}">B</div><div class="${vc}">${d.B.toFixed(2)}</div></div>`:""}
        ${d.Tp?`<div class="${c}"><div class="${kc}">Tp</div><div class="${vc}">${d.Tp.toFixed(2)} <span class="text-xs text-gray-500 dark:text-gray-400">s</span></div></div>`:""}
        ${d.Tl?`<div class="${c}"><div class="${kc}">TL</div><div class="${vc}">${d.Tl.toFixed(2)} <span class="text-xs text-gray-500 dark:text-gray-400">s</span></div></div>`:""}
        ${!d.bridge&&!d.isE031?`<div class="${c}"><div class="${kc}">Ia × Ip</div><div class="${vc}">${(d.IaEf*d.IpEf).toFixed(2)}</div></div>`:""}
        <div class="${hc} col-span-2"><div class="${kc}">Sa máx.</div><div class="${vc}">${SaMax.toFixed(4)} <span class="text-xs text-gray-500 dark:text-gray-400">g = ${(SaMax*9.81).toFixed(3)} m/s²</span></div></div>
        ${d.sueloModificado?`<div class="${c} col-span-2 border-yellow-300 dark:border-yellow-700"><div class="${kc}">Condición Ts &gt; 0.65 × Tp</div><div class="${vc} text-xs">Perfil original: ${d.sueloOriginal}. Perfil aplicado: ${d.sueloEfectivo}</div></div>`:""}
    `;
}

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
    const btn = $("bot_accion"); if (!btn) return;
    if (btn.dataset.espectroReady === "1") return;
    btn.dataset.espectroReady = "1";

    datosEspectro = [];

    initUbigeo();
    setVersion("2026");

    versions.forEach((v) => { const b=$("btn"+v); if(b) b.addEventListener("click",()=>setVersion(v)); });
    btn.addEventListener("click", calcular);
    $("btn-exportTXT") ?.addEventListener("click", exportTXT);
    $("btn-exportXLSX")?.addEventListener("click", exportXLSX);
    $("btn-exportPDF") ?.addEventListener("click", exportPDF);

    window.addEventListener("resize", () => { if (datosEspectro.length) renderChart(datosEspectro); });
}

document.addEventListener("DOMContentLoaded", init);
document.addEventListener("livewire:navigated", init);
