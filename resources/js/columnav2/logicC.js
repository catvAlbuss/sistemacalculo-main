export function calcularFlectorSalida(curvas) {
    const parsearSeguro = (val) => {
        if (!val) return 0;
        const num = parseFloat(String(val).replace(',', '.'));
        return isNaN(num) ? 0 : num;
    };

    const resultado = [];

    for (let i = 0; i < 21; i++) {
        let m33, pu1, m22, pu2;

        if (i < 11) {
            const punto = curvas[0][i];
            m33 = parsearSeguro(punto.m3);
            pu1 = parsearSeguro(punto.p);
        } else {
            const reverseIndex = 9 - (i - 11);
            const punto = curvas[12][reverseIndex];
            m33 = parsearSeguro(punto.m3);
            pu1 = parsearSeguro(punto.p);
        }

        if (i < 11) {
            const punto = curvas[6][i];
            m22 = parsearSeguro(punto.m2);
            pu2 = parsearSeguro(punto.p);
        } else {
            const reverseIndex = 9 - (i - 11);
            const punto = curvas[18][reverseIndex];
            m22 = parsearSeguro(punto.m2);
            pu2 = parsearSeguro(punto.p);
        }

        resultado.push({
            m33: m33.toFixed(4),
            pu1: pu1.toFixed(4),
            m22: m22.toFixed(4),
            pu2: pu2.toFixed(4)
        });
    }

    return resultado;
}
