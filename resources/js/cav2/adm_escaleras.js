import { doCalcs } from "../calc/calc_layout.js";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const calcFormatters = {
    cuantiaMin: (value) => value.toFixed(5),
  };

  const calcs = {};

  const cuantias = {
    "0.7(f'c)0.5/Fy=": 0.002415229,
    "0.8(f'c)0.5/Fy=": 0.002760262,
    "14/Fy=": 0.003333333,
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
    calcs.t = parseFloat(document.getElementById("t").value);
    calcs.b = parseFloat(document.getElementById("b").value);
    calcs.mu = parseFloat(document.getElementById("mu").value);
    calcs.distribucionDelAceroBarras = parseFloat(document.getElementById("distribucionDelAceroBarras").value);
    calcs.cortanteDistanciaVu = parseFloat(document.getElementById("cortanteDistanciaVu").value);
    calcs.cuantias = document.getElementById("cuantias").value;
    calcs.distribucionDelAceroAcero = document.getElementById("distribucionDelAceroAcero").value;
    calcs.diametroDeAceroAUsar = document.getElementById("diametroDeAceroAUsar").value;

    // DATOS
    calcs.muCalc = calcs.mu * 100000;
    calcs.d = calcs.t - 3;

    // DISEÑO POR FLEXION
    calcs.cuantiaMin = cuantias[calcs.cuantias];
    calcs.areaMin = calcs.cuantiaMin * calcs.b * calcs.d;
    calcs.calculoDelAreaA =
      calcs.d - Math.sqrt(Math.pow(calcs.d, 2) - (2 * calcs.muCalc) / (0.85 * 0.9 * calcs.fc * calcs.b));
    calcs.calculoDelAreaAs = calcs.muCalc / (0.9 * calcs.fy * (calcs.d - calcs.calculoDelAreaA / 2));
    calcs.calculoDelAreaVerificacionAsmin = calcs.calculoDelAreaAs > calcs.areaMin ? "OK" : "NO";
    calcs.calculodelAreaVerificacionAs = Math.max(calcs.calculoDelAreaAs, calcs.areaMin);
    calcs.distribucionDelAceroAs = diametros[calcs.distribucionDelAceroAcero] * calcs.distribucionDelAceroBarras;
    calcs.distribucionDelAceroCm = Math.round(
      (calcs.distribucionDelAceroAs * 100) / calcs.calculodelAreaVerificacionAs
    );
    calcs.entoncesBarras = calcs.distribucionDelAceroBarras;
    calcs.entoncesAcero = calcs.distribucionDelAceroAcero;
    calcs.entoncesCm = calcs.distribucionDelAceroCm < 20 ? calcs.distribucionDelAceroCm : 20;

    // DISEÑO POR CORTE
    calcs.cortanteDistanciaD = calcs.d;
    calcs.aporteDelConcretoVc1 = (0.53 * calcs.cortanteDistanciaD * calcs.b * Math.sqrt(calcs.fc)) / 1000;
    calcs.aporteDelConcretoVc2 = 0.85 * calcs.aporteDelConcretoVc1;
    calcs.aporteDelConcretoVc3 = 1.1 * calcs.aporteDelConcretoVc2;
    calcs.verificamosVcVu = calcs.aporteDelConcretoVc3 > calcs.cortanteDistanciaVu ? "OK" : "ESTA MAL";
    calcs.aceroMinimoPorTemperaturaAsmin = 0.002 * 100 * calcs.t;
    calcs.diametroDeAceroAUsarCm = diametros[calcs.diametroDeAceroAUsar];
    calcs.aceroMinimoPorTemperaturaSeparacion = calcs.diametroDeAceroAUsarCm / calcs.aceroMinimoPorTemperaturaAsmin;
  }

  doCalcs(calcs, calcFormatters, calculate);
});
