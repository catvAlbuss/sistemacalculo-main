export function filterByStep(data, paso) {
    return data.filter((item) => {
        const multiple = Math.round(item.T / paso);
        return Math.abs(item.T - multiple * paso) < 1e-9;
    });
}

export function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
}

export function exportTXT(datosEspectro, paso) {
    if (!datosEspectro.length) return;
    const rows = filterByStep(datosEspectro, paso).map((item) => `${item.T.toFixed(3)} ${item.Sa.toFixed(4)}`);
    downloadBlob("Espectro 1.txt", rows.join("\r\n"), "text/plain;charset=utf-8");
}
