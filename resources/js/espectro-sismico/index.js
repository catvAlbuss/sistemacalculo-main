import UBIGEO_DATA from "../../data/ubigeo.js";

const versions = ["1977", "1997", "2003", "2016", "2018", "2026"];
let normaVersion = "2026";
let datosEspectro = [];
let ubigeoSeleccionado = null;

const zoneZ = {
    1977: { 1: 0.4, 2: 0.7, 3: 1 },
    1997: { 1: 0.15, 2: 0.3, 3: 0.4 },
    2003: { 1: 0.15, 2: 0.3, 3: 0.4 },
    2016: { 1: 0.1, 2: 0.25, 3: 0.35, 4: 0.45 },
    2018: { 1: 0.1, 2: 0.25, 3: 0.35, 4: 0.45 },
    2026: { 1: 0.1, 2: 0.25, 3: 0.35, 4: 0.45 },
};

const sueloOld = {
    1977: {
        S1: { S: 1, Tp: 0.4 },
        S2: { S: 1.2, Tp: 0.6 },
        S3: { S: 1.5, Tp: 0.9 },
    },
    1997: {
        S1: { S: 1, Tp: 0.4 },
        S2: { S: 1.2, Tp: 0.6 },
        S3: { S: 1.4, Tp: 0.9 },
        S4: { S: 1.4, Tp: 0.9 },
    },
    2003: {
        S1: { S: 1, Tp: 0.4 },
        S2: { S: 1.2, Tp: 0.6 },
        S3: { S: 1.4, Tp: 0.9 },
        S4: { S: 1.4, Tp: 0.9 },
    },
};

const factorS2016 = {
    Z4_S0: 0.8, Z4_S1: 1, Z4_S2: 1.05, Z4_S3: 1.1,
    Z3_S0: 0.8, Z3_S1: 1, Z3_S2: 1.15, Z3_S3: 1.2,
    Z2_S0: 0.8, Z2_S1: 1, Z2_S2: 1.2, Z2_S3: 1.4,
    Z1_S0: 0.8, Z1_S1: 1, Z1_S2: 1.6, Z1_S3: 2,
};

const factorS2026 = {
    ...factorS2016,
    Z4_S4: 1.1, Z4_S5: 1.1,
    Z3_S4: 1.2, Z3_S5: 1.2,
    Z2_S4: 1.4, Z2_S5: 1.4,
    Z1_S4: 2, Z1_S5: 2,
};

const sueloModern = {
    S0: { Tp: 0.3, Tl: 3 },
    S1: { Tp: 0.4, Tl: 2.5 },
    S2: { Tp: 0.6, Tl: 2 },
    S3: { Tp: 1, Tl: 1.6 },
    S4: { Tp: 1, Tl: 1.6 },
    S5: { Tp: 1, Tl: 1.6 },
};

const versionColor = {
    1977: "#f72585",
    1997: "#ffd166",
    2003: "#ff6b35",
    2016: "#c77dff",
    2018: "#00e5ff",
    2026: "#00ff88",
};

const $ = (id) => document.getElementById(id);

function option(value, label, selected = false) {
    const el = document.createElement("option");
    el.value = value;
    el.textContent = label;
    el.selected = selected;
    return el;
}

function cap(text = "") {
    return text.charAt(0) + text.slice(1).toLowerCase();
}

function initUbigeo() {
    const depSelect = $("zonaDepartamento");
    const provSelect = $("zonaProvincia");
    const distSelect = $("zonaDistrito");

    depSelect.innerHTML = "";
    depSelect.appendChild(option("", "- Departamento -", true));
    UBIGEO_DATA.forEach((dep, index) => depSelect.appendChild(option(index, dep.name)));

    provSelect.innerHTML = "";
    provSelect.appendChild(option("", "- Provincia -", true));
    distSelect.innerHTML = "";
    distSelect.appendChild(option("", "- Distrito -", true));

    depSelect.addEventListener("change", () => {
        const depIndex = Number(depSelect.value);
        provSelect.innerHTML = "";
        distSelect.innerHTML = "";
        distSelect.appendChild(option("", "- Distrito -", true));
        distSelect.disabled = true;

        if (Number.isNaN(depIndex)) {
            provSelect.appendChild(option("", "- Provincia -", true));
            provSelect.disabled = true;
            clearUbigeoTag();
            return;
        }

        provSelect.disabled = false;
        provSelect.appendChild(option("", "- Provincia -", true));
        UBIGEO_DATA[depIndex].provinces.forEach((prov, index) => {
            provSelect.appendChild(option(index, prov.name));
        });
        clearUbigeoTag();
    });

    provSelect.addEventListener("change", () => {
        const depIndex = Number(depSelect.value);
        const provIndex = Number(provSelect.value);
        distSelect.innerHTML = "";

        if (Number.isNaN(depIndex) || Number.isNaN(provIndex)) {
            distSelect.appendChild(option("", "- Distrito -", true));
            distSelect.disabled = true;
            clearUbigeoTag();
            return;
        }

        distSelect.disabled = false;
        distSelect.appendChild(option("", "- Distrito -", true));
        UBIGEO_DATA[depIndex].provinces[provIndex].districts.forEach((dist, index) => {
            distSelect.appendChild(option(index, dist.name));
        });
        clearUbigeoTag();
    });

    distSelect.addEventListener("change", () => {
        const depIndex = Number(depSelect.value);
        const provIndex = Number(provSelect.value);
        const distIndex = Number(distSelect.value);
        if (Number.isNaN(depIndex) || Number.isNaN(provIndex) || Number.isNaN(distIndex)) return;

        const dep = UBIGEO_DATA[depIndex];
        const prov = dep.provinces[provIndex];
        const dist = prov.districts[distIndex];
        const zone = Number(dist.zone);

        ubigeoSeleccionado = { dep: dep.name, prov: prov.name, dist: dist.name, zone };
        renderUbigeoTag(zone, dist.name, prov.name);
        applyZonaFromUbigeo(zone);
    });
}

function clearUbigeoTag() {
    ubigeoSeleccionado = null;
    $("ubigeo-tag").style.display = "none";
}

function renderUbigeoTag(zone, district, province) {
    const colors = { 1: "var(--accent5)", 2: "var(--accent3)", 3: "var(--accent4)", 4: "var(--accent6)" };
    const color = colors[zone] || "var(--accent)";
    const tag = $("ubigeo-tag");
    tag.style.display = "flex";
    tag.style.borderColor = color;
    tag.innerHTML = `<span style="color:${color};font-weight:700;">Zona ${zone} asignada</span><span style="color:var(--muted);font-size:0.68rem;">- ${cap(district)}, ${cap(province)}</span>`;
}

function applyZonaFromUbigeo(zone) {
    const zonaSelect = $("zona");
    const effectiveZone = ["1977", "1997", "2003"].includes(normaVersion) && zone === 4 ? 3 : zone;
    zonaSelect.value = String(effectiveZone);
}

function setVersion(version) {
    normaVersion = version;
    versions.forEach((item) => $("btn" + item).classList.toggle("active", item === version));
    $("ts-group").style.display = version === "2026" ? "block" : "none";

    const zona = $("zona");
    const suelo = $("suelo");
    zona.innerHTML = "";
    suelo.innerHTML = "";

    if (version === "1977") {
        [[1, "Z = 0.40"], [2, "Z = 0.70"], [3, "Z = 1.00"]].forEach(([value, label]) => {
            zona.appendChild(option(value, `Zona ${value} - ${label}`, value === 3));
        });
        [["S1", "Roca o suelo rigido"], ["S2", "Suelos intermedios"], ["S3", "Suelos blandos"]].forEach(([value, label]) => {
            suelo.appendChild(option(value, `${value} - ${label}`, value === "S2"));
        });
    } else if (version === "1997" || version === "2003") {
        [[1, "Z = 0.15"], [2, "Z = 0.30"], [3, "Z = 0.40"]].forEach(([value, label]) => {
            zona.appendChild(option(value, `Zona ${value} - ${label}`, value === 3));
        });
        [["S1", "Roca o suelo muy rigido"], ["S2", "Suelos intermedios"], ["S3", "Suelos blandos"], ["S4", "Condiciones excepcionales"]].forEach(([value, label]) => {
            suelo.appendChild(option(value, `${value} - ${label}`, value === "S2"));
        });
    } else {
        [[1, "Z = 0.10"], [2, "Z = 0.25"], [3, "Z = 0.35"], [4, "Z = 0.45"]].forEach(([value, label]) => {
            zona.appendChild(option(value, `Zona ${value} - ${label}`, value === 4));
        });
        const suelos = version === "2026" ? ["S0", "S1", "S2", "S3", "S4", "S5"] : ["S0", "S1", "S2", "S3"];
        const labels = { S0: "Roca dura", S1: "Roca o suelo muy rigido", S2: "Suelos rigidos", S3: "Suelos intermedios", S4: "Suelos blandos", S5: "Excepcional" };
        suelos.forEach((value) => suelo.appendChild(option(value, `${value} - ${labels[value]}`, value === "S2")));
    }

    if (ubigeoSeleccionado) applyZonaFromUbigeo(ubigeoSeleccionado.zone);
}

function factorC(T, Tp, Tl, version) {
    if (version === "1977") return T === 0 ? 2.5 : Math.min(2.5, (Tp / T) ** (2 / 3));
    if (version === "1997" || version === "2003") return T < Tp ? 2.5 : 2.5 * (Tp / T);
    if (version === "2016" || version === "2018") {
        if (T <= Tp) return 2.5;
        if (T <= Tl) return 2.5 * (Tp / T);
        return (2.5 * Tp * Tl) / (T * T);
    }
    if (T < 0.2 * Tp) return 1 + 7.5 * (T / Tp);
    if (T <= Tp) return 2.5;
    if (T <= Tl) return 2.5 * (Tp / T);
    return (2.5 * Tp * Tl) / (T * T);
}

function resolveParams(version, zonaVal, sueloVal) {
    if (version === "1977" || version === "1997" || version === "2003") {
        const soil = sueloOld[version][sueloVal];
        return soil ? { Z: zoneZ[version][zonaVal], S: soil.S, Tp: soil.Tp, Tl: null } : null;
    }

    const factors = version === "2026" ? factorS2026 : factorS2016;
    const S = factors[`Z${zonaVal}_${sueloVal}`];
    const soil = sueloModern[sueloVal];
    return S && soil ? { Z: zoneZ[version][zonaVal], S, Tp: soil.Tp, Tl: soil.Tl } : null;
}

function calcular() {
    const zonaVal = Number($("zona").value);
    const sueloVal = $("suelo").value;
    const U = Number($("uso").value);
    const Rbase = Number($("sistema").value);
    const Ip = Number($("irreg_planta").value);
    const Ia = Number($("irreg_altura").value);
    const Tmax = Number($("tmax").value);
    const paso = Number($("paso").value);
    const Ts = normaVersion === "2026" ? Number($("ts_value").value || 0) : 0;

    if (!zonaVal || !sueloVal || !Number.isFinite(Tmax) || !Number.isFinite(paso) || Tmax <= 0 || paso <= 0) {
        showError("Verifique los parametros ingresados.");
        return;
    }

    let sueloEfectivo = sueloVal;
    const sueloOriginal = sueloVal;
    let sueloModificado = false;
    let params = resolveParams(normaVersion, zonaVal, sueloVal);
    if (!params) {
        showError("No se encontraron parametros para la combinacion seleccionada.");
        return;
    }

    if (normaVersion === "2026" && Ts > 0 && Ts > 0.65 * params.Tp && sueloVal !== "S5") {
        const degradacion = { S0: "S1", S1: "S2", S2: "S3", S3: "S4", S4: "S5" };
        sueloEfectivo = degradacion[sueloVal] || sueloVal;
        sueloModificado = sueloEfectivo !== sueloVal;
        params = resolveParams(normaVersion, zonaVal, sueloEfectivo);
    }

    const IaEf = ["2016", "2018", "2026"].includes(normaVersion) ? Ia : 1;
    const IpEf = ["2016", "2018", "2026"].includes(normaVersion) ? Ip : 1;
    const R = Rbase * IaEf * IpEf;
    const puntos = new Set();

    for (let t = 0; t <= Tmax + 1e-9; t = Math.round((t + paso) * 1000) / 1000) {
        puntos.add(t);
    }

    [0, params.Tp, params.Tl, normaVersion === "2026" ? 0.2 * params.Tp : null].forEach((t) => {
        if (t !== null && t !== undefined && t <= Tmax) puntos.add(Number(t.toFixed(3)));
    });

    datosEspectro = Array.from(puntos).sort((a, b) => a - b).map((T) => {
        const C = factorC(T, params.Tp, params.Tl, normaVersion);
        const Sa = (params.Z * U * C * params.S) / R;
        return { T, C: round(C, 4), Sa: round(Sa, 5), SaMS2: round(Sa * 9.81, 4) };
    });

    hideError();
    renderChart(datosEspectro);
    renderTable(datosEspectro, paso);
    renderParams({ ...params, U, R, Rbase, IaEf, IpEf, zonaVal, sueloOriginal, sueloEfectivo, Ts, sueloModificado });
}

function round(value, digits) {
    return Number(value.toFixed(digits));
}

function showError(message) {
    const el = $("error-msg");
    el.textContent = message;
    el.style.display = "block";
}

function hideError() {
    $("error-msg").style.display = "none";
}

function renderChart(data) {
    $("empty-state").style.display = "none";
    const canvas = $("myChart");
    canvas.style.display = "block";
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.max(320, Math.floor(rect.width * ratio));
    canvas.height = Math.max(260, Math.floor(rect.height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const width = canvas.width / ratio;
    const height = canvas.height / ratio;
    const pad = { left: 56, right: 18, top: 24, bottom: 44 };
    const plotW = width - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const maxT = Math.max(...data.map((item) => item.T), 1);
    const maxSa = Math.max(...data.map((item) => item.Sa), 0.1) * 1.12;
    const color = versionColor[normaVersion] || "#00ff88";

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0f1528";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(30,45,74,0.75)";
    ctx.lineWidth = 1;
    ctx.font = "11px monospace";
    ctx.fillStyle = "#5a7090";

    for (let i = 0; i <= 5; i += 1) {
        const x = pad.left + (plotW * i) / 5;
        const y = pad.top + (plotH * i) / 5;
        ctx.beginPath();
        ctx.moveTo(x, pad.top);
        ctx.lineTo(x, pad.top + plotH);
        ctx.moveTo(pad.left, y);
        ctx.lineTo(pad.left + plotW, y);
        ctx.stroke();
        ctx.fillText(((maxT * i) / 5).toFixed(1), x - 8, height - 18);
        ctx.fillText((maxSa * (1 - i / 5)).toFixed(3), 8, y + 4);
    }

    const toX = (T) => pad.left + (T / maxT) * plotW;
    const toY = (Sa) => pad.top + plotH - (Sa / maxSa) * plotH;

    ctx.beginPath();
    data.forEach((item, index) => {
        const x = toX(item.T);
        const y = toY(item.Sa);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.lineTo(toX(data[data.length - 1].T), pad.top + plotH);
    ctx.lineTo(toX(data[0].T), pad.top + plotH);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
    gradient.addColorStop(0, hexToRgba(color, 0.22));
    gradient.addColorStop(1, hexToRgba(color, 0.02));
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.fillStyle = "#5a7090";
    ctx.fillText("T (s)", pad.left + plotW / 2 - 12, height - 4);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Sa (g)", -height / 2 - 14, 14);
    ctx.restore();
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function renderTable(data, paso) {
    $("tabla-panel").style.display = "block";
    const rows = filterByStep(data, paso).map((item) => `
        <tr>
            <td>${item.T.toFixed(3)}</td>
            <td class="td-num">${item.Sa.toFixed(5)}</td>
            <td class="td-num">${item.C.toFixed(4)}</td>
            <td class="td-num">${item.SaMS2.toFixed(4)}</td>
        </tr>
    `);
    $("tabla-body").innerHTML = rows.join("");
}

function renderParams(data) {
    const el = $("params-out");
    const color = versionColor[normaVersion] || "#00ff88";
    const saMax = (data.Z * data.U * 2.5 * data.S) / data.R;
    el.style.display = "grid";
    el.innerHTML = `
        <div class="param-card" style="grid-column:1/-1;border-color:${color};background:${hexToRgba(color, 0.06)}">
            <div class="pk">Norma activa</div><div class="pv" style="color:${color}">E.030 - ${normaVersion}</div>
        </div>
        ${ubigeoSeleccionado ? `<div class="param-card" style="grid-column:1/-1"><div class="pk">Ubicacion</div><div class="pv" style="font-size:0.78rem">${cap(ubigeoSeleccionado.dist)}, ${cap(ubigeoSeleccionado.prov)}, ${cap(ubigeoSeleccionado.dep)}</div></div>` : ""}
        <div class="param-card highlight"><div class="pk">Z - Zona ${data.zonaVal}</div><div class="pv">${data.Z.toFixed(2)} <span>g</span></div></div>
        <div class="param-card highlight"><div class="pk">S - ${data.sueloEfectivo}</div><div class="pv">${data.S.toFixed(2)}</div></div>
        <div class="param-card"><div class="pk">U</div><div class="pv">${data.U.toFixed(1)}</div></div>
        <div class="param-card"><div class="pk">R efectivo</div><div class="pv">${data.R.toFixed(2)}</div></div>
        <div class="param-card"><div class="pk">Tp</div><div class="pv">${data.Tp.toFixed(2)} <span>s</span></div></div>
        <div class="param-card"><div class="pk">TL</div><div class="pv">${data.Tl ? data.Tl.toFixed(2) : "N/A"} <span>${data.Tl ? "s" : ""}</span></div></div>
        <div class="param-card"><div class="pk">Ia x Ip</div><div class="pv">${(data.IaEf * data.IpEf).toFixed(2)}</div></div>
        <div class="param-card highlight" style="grid-column:1/-1"><div class="pk">Sa max.</div><div class="pv">${saMax.toFixed(4)} <span>g = ${(saMax * 9.81).toFixed(3)} m/s2</span></div></div>
        ${data.sueloModificado ? `<div class="param-card" style="grid-column:1/-1;border-color:var(--accent3)"><div class="pk">Condicion Ts > 0.65 x Tp</div><div class="pv" style="font-size:0.75rem">Perfil original: ${data.sueloOriginal}. Perfil aplicado: ${data.sueloEfectivo}</div></div>` : ""}
    `;
}

function filterByStep(data, paso) {
    return data.filter((item) => {
        const multiple = Math.round(item.T / paso);
        return Math.abs(item.T - multiple * paso) < 1e-9;
    });
}

function exportTXT() {
    if (!datosEspectro.length) return;
    const paso = Number($("paso").value);
    const rows = filterByStep(datosEspectro, paso).map((item) => `${item.T.toFixed(3)} ${item.Sa.toFixed(4)}`);
    downloadBlob("Espectro 1.txt", rows.join("\r\n"), "text/plain;charset=utf-8");
}

function exportExcel() {
    if (!datosEspectro.length) return;
    const paso = Number($("paso").value);
    const rows = filterByStep(datosEspectro, paso).map((item) => `
        <tr>
            <td>${item.T.toFixed(3)}</td>
            <td>${item.Sa.toFixed(5)}</td>
            <td>${item.C.toFixed(4)}</td>
            <td>${item.SaMS2.toFixed(4)}</td>
        </tr>
    `).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><table><thead><tr><th>T (s)</th><th>Sa (g)</th><th>C</th><th>Sa (m/s2)</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    downloadBlob(`Espectro_E030-${normaVersion}.xls`, html, "application/vnd.ms-excel;charset=utf-8");
}

function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

function init() {
    if (!$("bot_accion")) return;
    if ($("bot_accion").dataset.espectroReady === "1") return;
    $("bot_accion").dataset.espectroReady = "1";
    initUbigeo();
    setVersion("2026");
    versions.forEach((version) => $("btn" + version).addEventListener("click", () => setVersion(version)));
    $("bot_accion").addEventListener("click", calcular);
    $("btn-exportTXT").addEventListener("click", exportTXT);
    $("btn-exportXLSX").addEventListener("click", exportExcel);
    window.addEventListener("resize", () => {
        if (datosEspectro.length) renderChart(datosEspectro);
    });
}

document.addEventListener("DOMContentLoaded", init);
document.addEventListener("livewire:navigated", init);
