import { doCalcs } from "../calc/calc_layout.js";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const calcFormatters = {};

  const calcs = {};

  function calculate() {
    calcs.d = parseFloat(document.getElementById("d").value);
    calcs.l = parseFloat(document.getElementById("l").value);
    calcs.vi = parseFloat(document.getElementById("vi").value);
    calcs.e = parseFloat(document.getElementById("e").value);
    calcs.ce = parseFloat(document.getElementById("ce").value);
    calcs.cl = parseFloat(document.getElementById("cl").value);
    calcs.ct = parseFloat(document.getElementById("ct").value);

    // !era combinacion
    calcs._1combinacion = 1.4 * calcs.d + 1.7 * calcs.l;

    // 2da combinacion
    calcs._2combinacion1 = 1.25 * (calcs.d + calcs.l + calcs.vi);
    calcs._2combinacion2 = 1.25 * (calcs.d + calcs.l - calcs.vi);
    calcs._2combinacion3 = 0.9 * calcs.d + calcs.vi;
    calcs._2combinacion4 = 0.9 * calcs.d - calcs.vi;

    // 3era combinacion
    calcs._3combinacion1 = 1.25 * (calcs.d + calcs.l) + calcs.e;
    calcs._3combinacion2 = 1.25 * (calcs.d + calcs.l) - calcs.e;
    calcs._3combinacion3 = 0.9 * calcs.d + calcs.e;
    calcs._3combinacion4 = 0.9 * calcs.d - calcs.e;

    calcs.maximaCombinacion = Math.max(
      calcs._1combinacion,
      calcs._2combinacion1,
      calcs._2combinacion2,
      calcs._2combinacion3,
      calcs._2combinacion4,
      calcs._3combinacion1,
      calcs._3combinacion2,
      calcs._3combinacion3,
      calcs._3combinacion4
    );
    calcs._1combinacionResultado = calcs.maximaCombinacion === calcs._1combinacion ? "ESTE VALOR RIGE" : "NO";
    calcs._2combinacionResultado = [
      calcs._2combinacion3,
      calcs._2combinacion4,
      calcs._2combinacion2,
      calcs._2combinacion1,
    ].includes(calcs.maximaCombinacion)
      ? "POR AQUÍ ESTA"
      : "NO";
    calcs._3combinacionResultado = [
      calcs._3combinacion3,
      calcs._3combinacion2,
      calcs._3combinacion4,
      calcs._3combinacion1,
    ].includes(calcs.maximaCombinacion)
      ? "POR AQUÍ ESTA"
      : "NO";
  }

  doCalcs(calcs, calcFormatters, calculate);
});
