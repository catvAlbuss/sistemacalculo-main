import { doCalcs } from "../calc/calc_layout.js";
import html2canvas from "html2canvas";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const calcFormatters = {
    diseñoPorFlexionCuantiaMinCuantia: (value) => value.toFixed(4),
    diseñoPorFlexionCuantiaBalanceadaCuantia: (value) => value.toFixed(4),
    diseñoPorFlexionCuantiaMaxCuantia: (value) => value.toFixed(4),
    diseñoPorFlexionCuantiaEconomicaCuantia: (value) => value.toFixed(4),
    ensancheViguetaWutn: (value) => value.toFixed(4),
  };

  const calcs = {};

  const cuantias = {
    "0.7(f'c)0.5/Fy=": 0.0024,
    "0.8(f'c)0.5/Fy=": 0.0028,
    "14/Fy=": 0.0033,
  };

  const diametros = {
    "6mm": 0.28,
    "8mm": 0.5,
    '3/8"': 0.71,
    "12mm": 1.13,
    '1/2"': 1.27,
    '5/8"': 2,
    '3/4"': 2.85,
    '1"': 5.07,
    '1 3/8"': 10.06,
  };

  function calculate() {
    calcs.fy = parseFloat(document.getElementById("fy").value);
    calcs.fc = parseFloat(document.getElementById("fc").value);
    calcs.h = parseFloat(document.getElementById("h").value);
    calcs.b = parseFloat(document.getElementById("b").value);
    calcs.mu = parseFloat(document.getElementById("mu").value);
    calcs.diseñoPorCorteVu = parseFloat(document.getElementById("diseñoPorCorteVu").value);
    calcs.ensancheViguetaWu = parseFloat(document.getElementById("ensancheViguetaWu").value);
    calcs.ensancheViguetal = parseFloat(document.getElementById("ensancheViguetal").value);
    calcs.diseñoPorCorteEstriboAUsarmm = document.getElementById("diseñoPorCorteEstriboAUsarmm").value;
    calcs.diseñoPorCorteAceroMinimoE = parseFloat(document.getElementById("diseñoPorCorteAceroMinimoE").value);
    calcs.diseñoPorFlexionCuantia = document.getElementById("diseñoPorFlexionCuantia").value;

    // DATOS
    calcs.d = calcs.h - 2.5;
    calcs.muCalc = calcs.mu * 100000;

    // CUANTIAS
    calcs.diseñoPorFlexionCuantiaMinCuantia = cuantias[calcs.diseñoPorFlexionCuantia];
    calcs.diseñoPorFlexionCuantiaMinArea = calcs.diseñoPorFlexionCuantiaMinCuantia * calcs.b * calcs.d;
    calcs.diseñoPorFlexionCuantiaBalanceadaN = calcs.fc <= 280 ? 0 : (calcs.fy - 280) / 70;
    calcs.diseñoPorFlexionCuantiaBalanceadaB =
      calcs.fc <= 280 ? 0.85 : 0.85 - 0.05 * calcs.diseñoPorFlexionCuantiaBalanceadaN;
    calcs.diseñoPorFlexionCuantiaBalanceadaCuantia =
      calcs.diseñoPorFlexionCuantiaBalanceadaB * 0.85 * calcs.fc * (6000 / (6000 + calcs.fy) / calcs.fy);
    calcs.diseñoPorFlexionCuantiaBalanceadaArea = calcs.diseñoPorFlexionCuantiaBalanceadaCuantia * calcs.b * calcs.d;
    calcs.diseñoPorFlexionCuantiaMaxCuantia = 0.75 * calcs.diseñoPorFlexionCuantiaBalanceadaCuantia;
    calcs.diseñoPorFlexionCuantiaMaxArea = calcs.diseñoPorFlexionCuantiaMaxCuantia * calcs.b * calcs.d;
    calcs.diseñoPorFlexionCuantiaEconomicaCuantia = 0.5 * calcs.diseñoPorFlexionCuantiaMaxCuantia;
    calcs.diseñoPorFlexionCuantiaEconomicaArea = calcs.diseñoPorFlexionCuantiaEconomicaCuantia * calcs.b * calcs.d;

    // MINIMO PROCESO CONSTRUCTIVO
    calcs.minimoPorProcesoConstructivoAsmin = calcs.diseñoPorFlexionCuantiaMinArea;

    // CALCULO DEL REFUERZO (METODO CUADRATICO)
    calcs.calculoDelAreaDelRefuerzoA =
      calcs.d - Math.sqrt(Math.pow(calcs.d, 2) - (2 * calcs.muCalc) / (0.85 * 0.9 * calcs.fc * calcs.b));
    calcs.calculoDelAreaDelRefuerzoAs =
      calcs.muCalc / (0.9 * calcs.fy * (calcs.d - calcs.calculoDelAreaDelRefuerzoA / 2));
    calcs.calculoDelAreaDelRefuerzoVerificacionAs = Math.max(
      calcs.calculoDelAreaDelRefuerzoAs,
      calcs.minimoPorProcesoConstructivoAsmin
    );
    calcs.calculoDelAreaDelRefuerzoVerificacionMu =
      (calcs.calculoDelAreaDelRefuerzoVerificacionAs *
        0.9 *
        calcs.fy *
        (calcs.d - calcs.calculoDelAreaDelRefuerzoA / 2)) /
      100000;
    calcs.calculoDelAreaDelRefuerzoVerificacionAsmax =
      calcs.calculoDelAreaDelRefuerzoAs < calcs.diseñoPorFlexionCuantiaMaxArea ? "OK" : "NO";
    calcs.calculoDelAreaDelRefuerzoVerificacionAsmin =
      calcs.calculoDelAreaDelRefuerzoAs > calcs.minimoPorProcesoConstructivoAsmin ? "OK" : "NO";
    calcs.diseñoProFlexionEsCostoso =
      calcs.calculoDelAreaDelRefuerzoVerificacionAs <= calcs.diseñoPorFlexionCuantiaEconomicaArea
        ? "SI ES ECONOMICO"
        : "ES COSTOSO";

    // MINIMO PROCESO CONSTRUCTIVO
    calcs.minimoPorProcesoConstructivoMumin =
      (calcs.minimoPorProcesoConstructivoAsmin * 0.9 * calcs.fy * (calcs.d - calcs.calculoDelAreaDelRefuerzoA / 2)) /
      100000;

    // DISEÑO POR CORTES
    calcs.diseñoPorCorteD = calcs.d;
    calcs.diseñoPorCorteVc = (0.53 * calcs.diseñoPorCorteD * calcs.b * Math.sqrt(calcs.fc)) / 1000;
    calcs.diseñoPorCortefiVc = 0.85 * calcs.diseñoPorCorteVc;
    calcs.diseñoPorCorte1Vc = 1.1 * calcs.diseñoPorCortefiVc;
    calcs.diseñoPorCorteAporte = calcs.diseñoPorCorte1Vc < calcs.diseñoPorCorteVu ? "ENSANCHAR VIGUETAS" : "OK";

    // ENSANCHE DE VIGUETAS
    calcs.ensancheViguetaWutn = calcs.ensancheViguetaWu / 100000;
    calcs.ensancheViguetaX = (calcs.diseñoPorCorteVu - calcs.diseñoPorCortefiVc) / calcs.ensancheViguetaWutn;
    calcs.ensancheViguetab1 =
      (calcs.diseñoPorCorteVu * 1000) / (0.85 * 0.53 * calcs.diseñoPorCorteD * Math.sqrt(calcs.fc));

    // ACERO MINIMO DE TEMPERATURA
    calcs.diseñoPorCorteEstriboAUsarcm = diametros[calcs.diseñoPorCorteEstriboAUsarmm];
    calcs.diseñoPorCorteAceroMinimoAs = 0.0018 * calcs.diseñoPorCorteAceroMinimoE * 100;
    calcs.diseñoPorCorteAceroMinimoS =
      (calcs.diseñoPorCorteEstriboAUsarcm * 100) / calcs.diseñoPorCorteAceroMinimoAs > 25
        ? 25
        : calcs.diseñoPorCorteEstriboAUsarcm / calcs.diseñoPorCorteAceroMinimoAs;
  }

  doCalcs(calcs, calcFormatters, calculate);

  const capturarTabla = async () => {
    const btn = document.getElementById("btn_captura_resultado");

    try {
      btn.disabled = true;
      btn.textContent = "Generando...";

      // Crear un contenedor temporal
      const contenedorTemp = document.createElement("div");
      contenedorTemp.style.backgroundColor = "#ffffff";
      contenedorTemp.style.width = "1000px";

      // Agregar título
      const titulo = document.createElement("h2");
      titulo.textContent = "DISEÑO DE VIGUETA";
      titulo.style.textAlign = "center";
      titulo.style.fontSize = "24px";
      titulo.style.marginBottom = "20px";
      contenedorTemp.appendChild(titulo);

      // Clonar los resultados
      const resultados = document.getElementById("viguetas_content").cloneNode(true);
      resultados.style.width = "100%";
      contenedorTemp.appendChild(resultados);

      // Agregar al DOM temporal
      contenedorTemp.style.position = "absolute";
      contenedorTemp.style.left = "-9999px";
      contenedorTemp.style.top = "-9999px";
      document.body.appendChild(contenedorTemp);

      // Capturar el contenedor
      const canvas = await html2canvas(contenedorTemp, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Limpiar
      document.body.removeChild(contenedorTemp);

      // Descargar
      const link = document.createElement("a");
      link.download = `diseño-vigueta-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al generar la imagen");
    } finally {
      btn.disabled = false;
      btn.textContent = "Generar IMG";
    }
  };

  document.getElementById("btn_captura_resultado").addEventListener("click", capturarTabla);
});
