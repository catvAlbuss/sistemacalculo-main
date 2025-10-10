import { doCalcs } from "../calc/calc_layout.js";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const calcFormatters = {};

  const calcs = {};

  const radians = (degree) => degree * (Math.PI / 180);

  function calculate() {
    calcs.gc = parseFloat(document.getElementById("gc").value);
    calcs.gs = parseFloat(document.getElementById("gs").value);
    calcs.fi = parseFloat(document.getElementById("fi").value);
    calcs.z = parseFloat(document.getElementById("z").value);
    calcs.d = parseFloat(document.getElementById("d").value);
    calcs.sc = parseFloat(document.getElementById("sc").value);
    calcs.gc = parseFloat(document.getElementById("gc").value);
    calcs.gs = parseFloat(document.getElementById("gs").value);
    calcs.fi = parseFloat(document.getElementById("fi").value);
    calcs.z = parseFloat(document.getElementById("z").value);
    calcs.d = parseFloat(document.getElementById("d").value);
    calcs.sc = parseFloat(document.getElementById("sc").value);
    calcs.sueloH = parseFloat(document.getElementById("sueloH").value);
    calcs.fy = parseFloat(document.getElementById("fy").value);
    calcs.fc = parseFloat(document.getElementById("fc").value);
    calcs.t = parseFloat(document.getElementById("t").value);
    calcs.b = parseFloat(document.getElementById("b").value);

    // DATOS
    calcs.firad = radians(calcs.fi);
    calcs.drad = radians(calcs.d);
    // ULTIMA TABLA
    // TABLA 3
    calcs.fi2 = Math.pow(Math.cos(calcs.firad), 2);
    calcs.delta2 = Math.pow(Math.cos(calcs.drad), 2);
    calcs._11 = calcs.delta2 - Math.sqrt(calcs.delta2 - calcs.fi2);
    calcs._12 = calcs.delta2 + Math.sqrt(calcs.delta2 - calcs.fi2);
    calcs._21 = calcs.delta2 + Math.sqrt(calcs.delta2 - calcs.fi2);
    calcs._22 = calcs.delta2 - Math.sqrt(calcs.delta2 - calcs.fi2);
    calcs.ka1 = (calcs.delta2 * calcs._11) / calcs._21;
    calcs.ka2 = (calcs.delta2 * calcs._12) / calcs._22;

    // DATOS
    calcs.firad = radians(calcs.fi);
    calcs.drad = radians(calcs.d);
    calcs.hs = calcs.sc / calcs.gs;
    calcs.ka = calcs.ka1;
    calcs.kp = calcs.ka2;

    // TABLA 1
    calcs.scH = calcs.hs;
    calcs.sueloSMax = calcs.gs * calcs.ka * calcs.sueloH;
    calcs.scSMax = calcs.gs * calcs.ka * calcs.scH;
    calcs.sMaxTotal = calcs.sueloSMax + calcs.scSMax;
    calcs.sueloP = (calcs.sueloSMax * calcs.sueloH) / 2;
    calcs.scP = calcs.scSMax * calcs.sueloH;
    calcs.pTotal = calcs.sueloP + calcs.scP;
    calcs.muTotal = ((calcs.pTotal * calcs.sueloH) / 3) * 1.55;
    calcs.vuTotal = 1.55 * calcs.pTotal;

    // TABLA 2
    calcs.dDatos = calcs.t - 3;
    calcs.vc = (0.53 * calcs.dDatos * calcs.b * Math.sqrt(calcs.fc)) / 1000;
    calcs.fiVc = 0.85 * calcs.vc;
    calcs.Mu = calcs.muTotal;
    calcs.Mukgcm = calcs.Mu * 100000;
    calcs.a =
      calcs.dDatos - Math.sqrt(Math.pow(calcs.dDatos, 2) - (2 * calcs.Mukgcm) / (0.85 * 0.9 * calcs.fc * calcs.b));
    calcs.as = calcs.Mukgcm / (0.9 * calcs.fy * (calcs.dDatos - calcs.a / 2));
  }

  doCalcs(calcs, calcFormatters, calculate);
});
