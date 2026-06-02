export function calcularFuerzasSalida(matrizIngreso) {
    if (!Array.isArray(matrizIngreso) || matrizIngreso.length === 0) return [];

    const filasEstacionCero = matrizIngreso.filter(fila => String(fila.station).trim() === "0");

    return filasEstacionCero.map((fila, index) => {
        const parsearSeguro = (val) => {
            if (!val) return 0;
            const num = parseFloat(String(val).replace(',', '.'));
            return isNaN(num) ? 0 : num;
        };

        const p = parsearSeguro(fila.p);
        const m2 = parsearSeguro(fila.m2);
        const m3 = parsearSeguro(fila.m3);

        const puCalculado = p * (-1);

        return {
            combo: fila.combo || `Comb${index + 1}`,
            m33: m3.toFixed(4),
            pu1: puCalculado.toFixed(4),
            m22: m2.toFixed(4),
            pu2: puCalculado.toFixed(4)
        };
    });
}
