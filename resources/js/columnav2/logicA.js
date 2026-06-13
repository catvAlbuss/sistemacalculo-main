export function calcularSeccionA() {
    // 1. Leer los valores de los inputs
    const diametroD = parseFloat(document.getElementById('in-A-0').value) || 0;
    const recubrimiento = parseFloat(document.getElementById('in-A-1').value) || 0;
    const db_pulgadas = document.getElementById('in-A-6').value; 
    const de_pulgadas = document.getElementById('in-A-7').value; 

    const diametrosCm = {
        '3/8"': 0.95,
        '1/2"': 1.27,
        '5/8"': 1.59,
        '3/4"': 1.90,
        '1"': 2.54
    };

    const areasEstriboCm2 = {
        '3/8"': 0.71,
        '1/2"': 1.29,
        '5/8"': 1.99,
        '3/4"': 2.54,
        '1"': 5.01
    };

    const out_db_cm = diametrosCm[db_pulgadas] || 0;
    const out_de_cm = diametrosCm[de_pulgadas] || 0;
    const out_AreaEstribo = areasEstriboCm2[de_pulgadas] || 0;
    const out_PeralteEfectivo = diametroD - recubrimiento;
    const out_AreaBruta = (3.1415 * diametroD * diametroD) / 4;
    const out_AreaConfinada = (3.1414 * out_PeralteEfectivo * out_PeralteEfectivo) / 4;

    document.getElementById('out-A-0').innerText = out_db_cm.toFixed(2);
    document.getElementById('out-A-1').innerText = out_de_cm.toFixed(2);
    document.getElementById('out-A-2').innerText = out_AreaEstribo.toFixed(2);
    document.getElementById('out-A-3').innerText = out_PeralteEfectivo.toFixed(2);
    document.getElementById('out-A-4').innerText = out_AreaBruta.toFixed(2);
    document.getElementById('out-A-5').innerText = out_AreaConfinada.toFixed(2);
}
