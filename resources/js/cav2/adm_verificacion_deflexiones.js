import { doCalcs } from "../calc/calc_layout.js";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const calcFormatters = {
    _2fc: (value) => value.toFixed(3),
    mcr: (value) => value.toFixed(3),
    deflexiones30CV: (value) => value.toFixed(3),
    deflexionesR: (value) => value.toFixed(3),
    deflexionesL: (value) => value.toFixed(3),
    deflexionesTotalesD: (value) => value.toFixed(3),
    deflexionesTotalesDcv: (value) => value.toFixed(3),
    deflexionesTotalesTotal: (value) => value.toFixed(3),
    deflexionesInstantaneaL360: (value) => value.toFixed(3),
    deflexionesInstantaneaL480: (value) => value.toFixed(3),
  };

  const calcs = {};

  function calculate() {
    calcs.h = parseFloat(document.getElementById("h").value);
    calcs.ma = parseFloat(document.getElementById("ma").value);
    calcs.deflexionesPorCargaMuerta = parseFloat(document.getElementById("deflexionesPorCargaMuerta").value);
    calcs.deflexionesPorCargaViva = parseFloat(document.getElementById("deflexionesPorCargaViva").value);
    calcs.deflexionesE = parseFloat(document.getElementById("deflexionesE").value);
    calcs.deflexionesAs = parseFloat(document.getElementById("deflexionesAs").value);
    calcs.deflexionesB = parseFloat(document.getElementById("deflexionesB").value);
    calcs.deflexionesD = parseFloat(document.getElementById("deflexionesD").value);
    calcs.deflexionesInstantaneaL = parseFloat(document.getElementById("deflexionesInstantaneaL").value);

    // DATOS
    calcs.lg = (calcs.deflexionesB * Math.pow(calcs.h, 3)) / 12;
    calcs.h2 = calcs.h / 2;
    calcs._2fc = 2 * Math.sqrt(210);
    calcs.mcr = (calcs._2fc * calcs.lg) / calcs.h2;
    calcs.datosOk = calcs.mcr >= calcs.ma ? "OK" : "NO";

    // DEFLEXIONES
    calcs.deflexiones30CV = calcs.deflexionesPorCargaViva * 0.3;
    calcs.deflexionesR =
      Math.round(((calcs.deflexionesAs * 100) / (calcs.deflexionesB * calcs.deflexionesD)) * 100) / 100;
    calcs.deflexionesL = calcs.deflexionesE / (1 + (50 * calcs.deflexionesR) / 100);

    // DEFLEXIONES TOTALES
    calcs.deflexionesTotalesD = calcs.deflexionesL * calcs.deflexionesPorCargaMuerta;
    calcs.deflexionesTotalesDcv = calcs.deflexiones30CV * calcs.deflexionesL;
    calcs.deflexionesTotalesTotal =
      calcs.deflexionesTotalesD + calcs.deflexionesTotalesDcv + calcs.deflexionesPorCargaViva;

    // DEFLEXIONES INSTANTANEA
    calcs.deflexionesInstantaneaL360 = calcs.deflexionesInstantaneaL / 360;
    calcs.deflexionesInstantaneaL360OK = calcs.deflexionesInstantaneaL360 < calcs.deflexionesPorCargaViva ? "NO" : "SI";
    calcs.deflexionesInstantaneaL480 = calcs.deflexionesInstantaneaL / 480;
    calcs.deflexionesInstantaneaL480OK = calcs.deflexionesInstantaneaL480 < calcs.deflexionesTotalesTotal ? "NO" : "SI";
  }

  doCalcs(calcs, calcFormatters, calculate);
});
