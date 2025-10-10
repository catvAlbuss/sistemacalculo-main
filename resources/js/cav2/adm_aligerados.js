import { doCalcs } from "../calc/calc_layout.js";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const calcFormatters = {};

  const calcs = {};

  function calculate() {
    calcs.l = parseFloat(document.getElementById("l").value);
    calcs.ve = parseFloat(document.getElementById("ve").value);
    calcs.me = parseFloat(document.getElementById("me").value);
    calcs.t = parseFloat(document.getElementById("t").value);
    calcs.pg = parseFloat(document.getElementById("pg").value);
    calcs.fm = parseFloat(document.getElementById("fm").value);
    calcs.esfuerzosAmplificadosL = parseFloat(document.getElementById("esfuerzosAmplificadosL").value);
    calcs.esfuerzosAmplificadosNc = parseFloat(document.getElementById("esfuerzosAmplificadosNc").value);
    calcs.esfuerzosAmplificadosH = parseFloat(document.getElementById("esfuerzosAmplificadosH").value);
    calcs.esfuerzosAmplificadosPt = parseFloat(document.getElementById("esfuerzosAmplificadosPt").value);
    calcs.columnaSinMuroTransversal = parseFloat(document.getElementById("columnaSinMuroTransversal").value);

    // DATOS
    calcs.a = (calcs.ve * calcs.l) / calcs.me;
    calcs.aCalc = calcs.a > 1 / 3 ? (calcs.a < 1 ? calcs.a : 1) : 1 / 3;
    calcs.vmPrima = Math.sqrt(calcs.fm) * 10;
    calcs.vm = 0.5 * calcs.vmPrima * calcs.l * calcs.t * calcs.aCalc + 0.23 * calcs.pg;

    // VERIFICACION DE AGRETAMIENTO
    calcs.verificacionDeAgretamientoVm = 0.55 * calcs.vm;
    calcs.verificacionDeAgretamientoOK = calcs.ve <= calcs.verificacionDeAgretamientoVm ? "ok" : "se agrieta";

    // FACTOR DE MULTIPLICACION
    calcs.factorDeAmplificacionVmVc = calcs.vm / calcs.ve;
    calcs.calculoSoloEnEl1Nivel =
      calcs.factorDeAmplificacionVmVc > 2
        ? calcs.factorDeAmplificacionVmVc < 3
          ? calcs.factorDeAmplificacionVmVc
          : 3
        : 2;

    // ESFUERZOS AMPLIFICADOS
    calcs.esfuerzosAmplificadosVu = calcs.ve * calcs.calculoSoloEnEl1Nivel;
    calcs.esfuerzosAmplificadosMu = calcs.me * calcs.calculoSoloEnEl1Nivel;
    calcs.esfuerzosAmplificadosM = calcs.esfuerzosAmplificadosMu - 0.5 * calcs.vm * calcs.esfuerzosAmplificadosH;
    calcs.esfuerzosAmplificadosMSigue = calcs.esfuerzosAmplificadosM < 0 ? "Asmin en columnas" : "sigue";
    calcs.esfuerzosAmplificadosF = calcs.esfuerzosAmplificadosM / calcs.esfuerzosAmplificadosL;
    calcs.esfuerzosAmplificadosPc = calcs.pg / calcs.esfuerzosAmplificadosNc;
    calcs.columnaConMuroTransversal = 0.25 * calcs.esfuerzosAmplificadosPt;
  }

  doCalcs(calcs, calcFormatters, calculate);
});
