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
    calcs.fy = parseFloat(document.getElementById("fy").value);
    calcs.fc = parseFloat(document.getElementById("fc").value);
    calcs.capas = parseFloat(document.getElementById("capas").value);
    calcs.hA = parseFloat(document.getElementById("hA").value);
    calcs.bA = parseFloat(document.getElementById("bA").value);
    calcs.MuA = parseFloat(document.getElementById("MuA").value);
    calcs.hAB = parseFloat(document.getElementById("hAB").value);
    calcs.bAB = parseFloat(document.getElementById("bAB").value);
    calcs.MuAB = parseFloat(document.getElementById("MuAB").value);
    calcs.hB = parseFloat(document.getElementById("hB").value);
    calcs.bB = parseFloat(document.getElementById("bB").value);
    calcs.MuB = parseFloat(document.getElementById("MuB").value);
    calcs.hBC = parseFloat(document.getElementById("hBC").value);
    calcs.bBC = parseFloat(document.getElementById("bBC").value);
    calcs.MuBC = parseFloat(document.getElementById("MuBC").value);
    calcs.hC = parseFloat(document.getElementById("hC").value);
    calcs.bC = parseFloat(document.getElementById("bC").value);
    calcs.MuC = parseFloat(document.getElementById("MuC").value);
    calcs.hCD = parseFloat(document.getElementById("hCD").value);
    calcs.bCD = parseFloat(document.getElementById("bCD").value);
    calcs.MuCD = parseFloat(document.getElementById("MuCD").value);
    calcs.hD = parseFloat(document.getElementById("hD").value);
    calcs.bD = parseFloat(document.getElementById("bD").value);
    calcs.MuD = parseFloat(document.getElementById("MuD").value);
    calcs.hDE = parseFloat(document.getElementById("hDE").value);
    calcs.bDE = parseFloat(document.getElementById("bDE").value);
    calcs.MuDE = parseFloat(document.getElementById("MuDE").value);
    calcs.hE = parseFloat(document.getElementById("hE").value);
    calcs.bE = parseFloat(document.getElementById("bE").value);
    calcs.MuE = parseFloat(document.getElementById("MuE").value);
    calcs.hEF = parseFloat(document.getElementById("hEF").value);
    calcs.bEF = parseFloat(document.getElementById("bEF").value);
    calcs.MuEF = parseFloat(document.getElementById("MuEF").value);
    calcs.hF = parseFloat(document.getElementById("hF").value);
    calcs.bF = parseFloat(document.getElementById("bF").value);
    calcs.MuF = parseFloat(document.getElementById("MuF").value);

    // DISEÑO POR FLEXION
    calcs.pMin = (0.7 * Math.sqrt(calcs.fc)) / calcs.fy;
    calcs.areasPMin = calcs.pMin * calcs.bA * calcs.dA;
    calcs.b1PBalanceado = calcs.fc <= 280 ? 0.85 : 0.85 - 0.05 * calcs.nPBalanceado;
    calcs.pBalanceado = calcs.b1PBalanceado * 0.85 * calcs.fc * (6000 / (6000 + calcs.fy) / calcs.fy);
    calcs.areasPBalanceado = calcs.pBalanceado * calcs.bA * calcs.dA;
    calcs.nPBalanceado = calcs.fc <= 280 ? 0 : (calcs.fc - 280) / 70;
    calcs.pMax = 0.75 * calcs.pBalanceado;
    calcs.areaPMax = calcs.pMax * calcs.bA * calcs.dA;
    calcs.pEconomico = 0.5 * calcs.pMax;
    calcs.areasPEconomico = calcs.pEconomico * calcs.bA * calcs.dA;

    // CALCULOS TABLA
    // Row 10
    calcs.dA =
      calcs.capas === 1
        ? calcs.hA - 6
        : calcs.capas === 2
        ? calcs.hA - 9
        : calcs.capas === 3
        ? calcs.hA - 12
        : calcs.hA;
    calcs.kgA = calcs.MuA * 100000;
    calcs.aA = calcs.dA - Math.sqrt(Math.pow(calcs.dA, 2) - (2 * calcs.kgA) / (0.85 * 0.9 * calcs.fc * calcs.bA));
    calcs.AsA = calcs.kgA / (0.9 * calcs.fy * (calcs.dA - calcs.aA / 2));
    calcs.PA = calcs.AsA / (calcs.dA * calcs.bA);
    calcs.PsmaxA = calcs.PA < calcs.pMax ? "OK" : "NO";
    calcs.PsminA = calcs.PA > calcs.pMin ? "OK" : "NO";
    calcs.AsmaxA = calcs.AsA < calcs.areaPMax ? "OK" : "NO";
    calcs.AsminA = calcs.AsA > calcs.areasPMin ? "OK" : "NO";

    // Row 11
    calcs.dAB =
      calcs.capas === 1
        ? calcs.hAB - 6
        : calcs.capas === 2
        ? calcs.hAB - 9
        : calcs.capas === 3
        ? calcs.hAB - 12
        : calcs.hAB;
    calcs.kgAB = calcs.MuAB * 100000;
    calcs.aAB = calcs.dAB - Math.sqrt(Math.pow(calcs.dAB, 2) - (2 * calcs.kgAB) / (0.85 * 0.9 * calcs.fc * calcs.bAB));
    calcs.AsAB = calcs.kgAB / (0.9 * calcs.fy * (calcs.dAB - calcs.aAB / 2));
    calcs.PAB = calcs.AsAB / (calcs.dAB * calcs.bAB);
    calcs.PsmaxAB = calcs.PAB < calcs.pMax ? "OK" : "NO";
    calcs.PsminAB = calcs.PAB > calcs.pMin ? "OK" : "NO";
    calcs.AsmaxAB = calcs.AsAB < calcs.areaPMax ? "OK" : "NO";
    calcs.AsminAB = calcs.AsAB > calcs.areasPMin ? "OK" : "NO";

    // Row 12
    calcs.dB =
      calcs.capas === 1
        ? calcs.hB - 6
        : calcs.capas === 2
        ? calcs.hB - 9
        : calcs.capas === 3
        ? calcs.hB - 12
        : calcs.hB;
    calcs.kgB = calcs.MuB * 100000;
    calcs.aB = calcs.dB - Math.sqrt(Math.pow(calcs.dB, 2) - (2 * calcs.kgB) / (0.85 * 0.9 * calcs.fc * calcs.bB));
    calcs.AsB = calcs.kgB / (0.9 * calcs.fy * (calcs.dB - calcs.aB / 2));
    calcs.PB = calcs.AsB / (calcs.dB * calcs.bB);
    calcs.PsmaxB = calcs.PB < calcs.pMax ? "OK" : "NO";
    calcs.PsminB = calcs.PB > calcs.pMin ? "OK" : "NO";
    calcs.AsmaxB = calcs.AsB < calcs.areaPMax ? "OK" : "NO";
    calcs.AsminB = calcs.AsB > calcs.areasPMin ? "OK" : "NO";

    // Row 13
    calcs.dBC =
      calcs.capas === 1
        ? calcs.hBC - 6
        : calcs.capas === 2
        ? calcs.hBC - 9
        : calcs.capas === 3
        ? calcs.hBC - 12
        : calcs.hBC;
    calcs.kgBC = calcs.MuBC * 100000;
    calcs.aBC = calcs.dBC - Math.sqrt(Math.pow(calcs.dBC, 2) - (2 * calcs.kgBC) / (0.85 * 0.9 * calcs.fc * calcs.bBC));
    calcs.AsBC = calcs.kgBC / (0.9 * calcs.fy * (calcs.dBC - calcs.aBC / 2));
    calcs.PBC = calcs.AsBC / (calcs.dBC * calcs.bBC);
    calcs.PsmaxBC = calcs.PBC < calcs.pMax ? "OK" : "NO";
    calcs.PsminBC = calcs.PBC > calcs.pMin ? "OK" : "NO";
    calcs.AsmaxBC = calcs.AsBC < calcs.areaPMax ? "OK" : "NO";
    calcs.AsminBC = calcs.AsBC > calcs.areasPMin ? "OK" : "NO";

    // Row 14
    calcs.dC =
      calcs.capas === 1
        ? calcs.hC - 6
        : calcs.capas === 2
        ? calcs.hC - 9
        : calcs.capas === 3
        ? calcs.hC - 12
        : calcs.hC;
    calcs.kgC = calcs.MuC * 100000;
    calcs.aC = calcs.dC - Math.sqrt(Math.pow(calcs.dC, 2) - (2 * calcs.kgC) / (0.85 * 0.9 * calcs.fc * calcs.bC));
    calcs.AsC = calcs.kgC / (0.9 * calcs.fy * (calcs.dC - calcs.aC / 2));
    calcs.PC = calcs.AsC / (calcs.dC * calcs.bC);
    calcs.PsmaxC = calcs.PC < calcs.pMax ? "OK" : "NO";
    calcs.PsminC = calcs.PC > calcs.pMin ? "OK" : "NO";
    calcs.AsmaxC = calcs.AsC < calcs.areaPMax ? "OK" : "NO";
    calcs.AsminC = calcs.AsC > calcs.areasPMin ? "OK" : "NO";

    // Row 15
    calcs.dCD =
      calcs.capas === 1
        ? calcs.hCD - 6
        : calcs.capas === 2
        ? calcs.hCD - 9
        : calcs.capas === 3
        ? calcs.hCD - 12
        : calcs.hCD;
    calcs.kgCD = calcs.MuCD * 100000;
    calcs.aCD = calcs.dCD - Math.sqrt(Math.pow(calcs.dCD, 2) - (2 * calcs.kgCD) / (0.85 * 0.9 * calcs.fc * calcs.bCD));
    calcs.AsCD = calcs.kgCD / (0.9 * calcs.fy * (calcs.dCD - calcs.aCD / 2));
    calcs.PCD = calcs.AsCD / (calcs.dCD * calcs.bCD);
    calcs.PsmaxCD = calcs.PCD < calcs.pMax ? "OK" : "NO";
    calcs.PsminCD = calcs.PCD > calcs.pMin ? "OK" : "NO";
    calcs.AsmaxCD = calcs.AsCD < calcs.areaPMax ? "OK" : "NO";
    calcs.AsminCD = calcs.AsCD > calcs.areasPMin ? "OK" : "NO";

    // Row 16
    calcs.dD =
      calcs.capas === 1
        ? calcs.hD - 6
        : calcs.capas === 2
        ? calcs.hD - 9
        : calcs.capas === 3
        ? calcs.hD - 12
        : calcs.hD;
    calcs.kgD = calcs.MuD * 100000;
    calcs.aD = calcs.dD - Math.sqrt(Math.pow(calcs.dD, 2) - (2 * calcs.kgD) / (0.85 * 0.9 * calcs.fc * calcs.bD));
    calcs.AsD = calcs.kgD / (0.9 * calcs.fy * (calcs.dD - calcs.aD / 2));
    calcs.PD = calcs.AsD / (calcs.dD * calcs.bD);
    calcs.PsmaxD = calcs.PD < calcs.pMax ? "OK" : "NO";
    calcs.PsminD = calcs.PD > calcs.pMin ? "OK" : "NO";
    calcs.AsmaxD = calcs.AsD < calcs.areaPMax ? "OK" : "NO";
    calcs.AsminD = calcs.AsD > calcs.areasPMin ? "OK" : "NO";

    // Row 17
    calcs.dDE =
      calcs.capas === 1
        ? calcs.hDE - 6
        : calcs.capas === 2
        ? calcs.hDE - 9
        : calcs.capas === 3
        ? calcs.hDE - 12
        : calcs.hDE;
    calcs.kgDE = calcs.MuDE * 100000;
    calcs.aDE = calcs.dDE - Math.sqrt(Math.pow(calcs.dDE, 2) - (2 * calcs.kgDE) / (0.85 * 0.9 * calcs.fc * calcs.bDE));
    calcs.AsDE = calcs.kgDE / (0.9 * calcs.fy * (calcs.dDE - calcs.aDE / 2));
    calcs.PDE = calcs.AsDE / (calcs.dDE * calcs.bDE);
    calcs.PsmaxDE = calcs.PDE < calcs.pMax ? "OK" : "NO";
    calcs.PsminDE = calcs.PDE > calcs.pMin ? "OK" : "NO";
    calcs.AsmaxDE = calcs.AsDE < calcs.areaPMax ? "OK" : "NO";
    calcs.AsminDE = calcs.AsDE > calcs.areasPMin ? "OK" : "NO";

    // Row 18
    calcs.dE =
      calcs.capas === 1
        ? calcs.hE - 6
        : calcs.capas === 2
        ? calcs.hE - 9
        : calcs.capas === 3
        ? calcs.hE - 12
        : calcs.hE;
    calcs.kgE = calcs.MuE * 100000;
    calcs.aE = calcs.dE - Math.sqrt(Math.pow(calcs.dE, 2) - (2 * calcs.kgE) / (0.85 * 0.9 * calcs.fc * calcs.bE));
    calcs.AsE = calcs.kgE / (0.9 * calcs.fy * (calcs.dE - calcs.aE / 2));
    calcs.PE = calcs.AsE / (calcs.dE * calcs.bE);
    calcs.PsmaxE = calcs.PE < calcs.pMax ? "OK" : "NO";
    calcs.PsminE = calcs.PE > calcs.pMin ? "OK" : "NO";
    calcs.AsmaxE = calcs.AsE < calcs.areaPMax ? "OK" : "NO";
    calcs.AsminE = calcs.AsE > calcs.areasPMin ? "OK" : "NO";

    // Row 19
    calcs.dEF =
      calcs.capas === 1
        ? calcs.hEF - 6
        : calcs.capas === 2
        ? calcs.hEF - 9
        : calcs.capas === 3
        ? calcs.hEF - 12
        : calcs.hEF;
    calcs.kgEF = calcs.MuEF * 100000;
    calcs.aEF = calcs.dEF - Math.sqrt(Math.pow(calcs.dEF, 2) - (2 * calcs.kgEF) / (0.85 * 0.9 * calcs.fc * calcs.bEF));
    calcs.AsEF = calcs.kgEF / (0.9 * calcs.fy * (calcs.dEF - calcs.aEF / 2));
    calcs.PEF = calcs.AsEF / (calcs.dEF * calcs.bEF);
    calcs.PsmaxEF = calcs.PEF < calcs.pMax ? "OK" : "NO";
    calcs.PsminEF = calcs.PEF > calcs.pMin ? "OK" : "NO";
    calcs.AsmaxEF = calcs.AsEF < calcs.areaPMax ? "OK" : "NO";
    calcs.AsminEF = calcs.AsEF > calcs.areasPMin ? "OK" : "NO";

    // Row 20
    calcs.dF =
      calcs.capas === 1
        ? calcs.hF - 6
        : calcs.capas === 2
        ? calcs.hF - 9
        : calcs.capas === 3
        ? calcs.hF - 12
        : calcs.hF;
    calcs.kgF = calcs.MuF * 100000;
    calcs.aF = calcs.dF - Math.sqrt(Math.pow(calcs.dF, 2) - (2 * calcs.kgF) / (0.85 * 0.9 * calcs.fc * calcs.bF));
    calcs.AsF = calcs.kgF / (0.9 * calcs.fy * (calcs.dF - calcs.aF / 2));
    calcs.PF = calcs.AsF / (calcs.dF * calcs.bF);
    calcs.PsmaxF = calcs.PF < calcs.pMax ? "OK" : "NO";
    calcs.PsminF = calcs.PF > calcs.pMin ? "OK" : "NO";
    calcs.AsmaxF = calcs.AsF < calcs.areaPMax ? "OK" : "NO";
    calcs.AsminF = calcs.AsF > calcs.areasPMin ? "OK" : "NO";
  }

  doCalcs(calcs, calcFormatters, calculate);
});
