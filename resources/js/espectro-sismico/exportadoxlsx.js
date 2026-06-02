import { downloadBlob, filterByStep } from "./exporttxt.js";

export function exportXLSX(datosEspectro, paso, normaVersion) {
    if (!datosEspectro.length) return;
    const rows = filterByStep(datosEspectro, paso)
        .map((item) => `
            <tr>
                <td>${item.T.toFixed(3)}</td>
                <td>${item.Sa.toFixed(5)}</td>
                <td>${item.C.toFixed(4)}</td>
                <td>${item.SaMS2.toFixed(4)}</td>
            </tr>
        `)
        .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><table><thead><tr><th>T (s)</th><th>Sa (g)</th><th>C</th><th>Sa (m/s2)</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    downloadBlob(`Espectro_E030-${normaVersion}.xls`, html, "application/vnd.ms-excel;charset=utf-8");
}
