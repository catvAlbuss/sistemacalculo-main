import { doCalcs } from "../calc/calc_layout";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const calcFormatters = {
    cuantiaMin: (value) => value.toFixed(5),
  };

  const calcs = {};

  const valores = {
    0.17: 280,
    0.2: 300,
    0.25: 350,
    0.3: 420,
  };

  function calculate() {
    calcs.aligeradosEspacioDelLadrillo = parseFloat(document.getElementById("aligeradosEspacioDelLadrillo").value);
    calcs.aligeradosAnchoDeLaVigueta = parseFloat(document.getElementById("aligeradosAnchoDeLaVigueta").value);
    calcs.escalerasAnchoTributario = parseFloat(document.getElementById("escalerasAnchoTributario").value);
    calcs.escalerasTT = parseFloat(document.getElementById("escalerasTT").value);
    calcs.escalerasTAnchoTributario = parseFloat(document.getElementById("escalerasTAnchoTributario").value);
    calcs.aligeradosCargaMuertaT = parseFloat(document.getElementById("aligeradosCargaMuertaT").value);
    calcs.aliegeradosCargaMuertaAcabados = parseFloat(document.getElementById("aliegeradosCargaMuertaAcabados").value);
    calcs.aligeradosCargaVivaSC = parseFloat(document.getElementById("aligeradosCargaVivaSC").value);
    calcs.aligeradosCargaMuertaLongitud = parseFloat(document.getElementById("aligeradosCargaMuertaLongitud").value);
    calcs.escalerasT = parseFloat(document.getElementById("escalerasT").value);
    calcs.escalerasPaso = parseFloat(document.getElementById("escalerasPaso").value);
    calcs.escalerasContraPaso = parseFloat(document.getElementById("escalerasContraPaso").value);
    calcs.escalerasCargaMuertaAcabados = parseFloat(document.getElementById("escalerasCargaMuertaAcabados").value);
    calcs.escalerasCargaVivaSC = parseFloat(document.getElementById("escalerasCargaVivaSC").value);
    calcs.escalerasLongitud = parseFloat(document.getElementById("escalerasLongitud").value);
    calcs.escalerasTT = parseFloat(document.getElementById("escalerasTT").value);
    calcs.escalerasTAnchoTributario = parseFloat(document.getElementById("escalerasTAnchoTributario").value);
    calcs.escalerasTCargaMuertaAcabados = parseFloat(document.getElementById("escalerasTCargaMuertaAcabados").value);
    calcs.escalerasTCargaVivaSC = parseFloat(document.getElementById("escalerasTCargaVivaSC").value);
    calcs.escalerasTCargaVivaLongitud = parseFloat(document.getElementById("escalerasTCargaVivaLongitud").value);

    // ALIGERADOS DATOS
    calcs.aligeradosAnchoTributario = calcs.aligeradosEspacioDelLadrillo + calcs.aligeradosAnchoDeLaVigueta;

    // ALIGERADOS CARGA MUERTA
    calcs.aligeradosCargaMuertaPesoAligerado = valores[calcs.aligeradosCargaMuertaT];
    calcs.aligeradosCargaMuertaWd1 = calcs.aligeradosCargaMuertaPesoAligerado * calcs.aligeradosAnchoTributario;
    calcs.aligeradosCargaMuertaWd2 = calcs.aliegeradosCargaMuertaAcabados * calcs.aligeradosAnchoTributario;
    calcs.aligeradosCargaMuertaWd3 = (calcs.aligeradosCargaMuertaWd1 + calcs.aligeradosCargaMuertaWd2) / 1000;

    // ALIGERADOS CARGA VIVA
    calcs.aligeradosCargaMuertaWl1 = calcs.aligeradosCargaVivaSC * calcs.aligeradosAnchoTributario;
    calcs.aligeradosCargaMuertaWl = calcs.aligeradosCargaMuertaWl1 / 1000;

    // RESULTADOS
    calcs.aligeradosCargaMuertaWu = 1.4 * calcs.aligeradosCargaMuertaWd3 + 1.7 * calcs.aligeradosCargaMuertaWl;
    calcs.aligeradosCargaMuertaApoyoFijo =
      (calcs.aligeradosCargaMuertaWu * Math.pow(calcs.aligeradosCargaMuertaLongitud, 2)) / 8;
    calcs.aligeradosCargaMuertaApoyoEmpotrado =
      (calcs.aligeradosCargaMuertaWu * Math.pow(calcs.aligeradosCargaMuertaApoyoFijo, 2)) / 8;
    calcs.aligeradosCargaMuertaCortante =
      (calcs.aligeradosCargaMuertaWu * Math.pow(calcs.aligeradosCargaMuertaApoyoEmpotrado, 2)) / 8;

    // ESCALERAS DATOS
    calcs.escalerasCosTeta =
      calcs.escalerasPaso /
      Math.sqrt(calcs.escalerasPaso * calcs.escalerasPaso + calcs.escalerasContraPaso * calcs.escalerasContraPaso);
    calcs.escalerasTeta = (Math.acos(calcs.escalerasCosTeta) * 180) / Math.PI;
    calcs.escalerasHnCm = calcs.escalerasT / calcs.escalerasCosTeta + calcs.escalerasContraPaso / 2;
    calcs.escalerasHn = calcs.escalerasHnCm / 100;

    // ESCALERAS CARGA MUERTA
    calcs.escalerasCargaMuertaPesoPropio = calcs.escalerasHn * calcs.escalerasAnchoTributario * 2400;
    calcs.escalerasCargaMuertaWd1 = calcs.escalerasCargaMuertaPesoPropio * calcs.escalerasAnchoTributario;
    calcs.escalerasCargaMuertaWd2 = calcs.escalerasCargaMuertaAcabados * calcs.escalerasAnchoTributario;
    calcs.escalerasCargaMuertaWd = (calcs.escalerasCargaMuertaWd1 + calcs.escalerasCargaMuertaWd2) / 1000;

    // ESCALERAS CARGA VIVA
    calcs.escalerasCargaVivaWl1 = calcs.escalerasCargaVivaSC * calcs.escalerasAnchoTributario;
    calcs.escalerasCargaVivaWl = calcs.escalerasCargaVivaWl1 / 1000;

    // ESCALERAS RESULTADOS
    calcs.escalerasCargaMuertaWu = 1.4 * calcs.escalerasCargaMuertaWd + 1.7 * calcs.escalerasCargaVivaWl;
    calcs.escalerasApoyoFijo = (calcs.escalerasCargaMuertaWu * calcs.escalerasLongitud * calcs.escalerasLongitud) / 8;
    calcs.escalerasApoyoEmpotrado =
      (calcs.escalerasCargaMuertaWu * calcs.escalerasLongitud * calcs.escalerasLongitud) / 12;
    calcs.escalerasCortante = (calcs.escalerasLongitud * calcs.escalerasCargaMuertaWu) / 2;

    // ESCALERAS 2 CARGA MUERTA
    calcs.escalerasTCargaMuertaPesoPropio = calcs.escalerasTT * calcs.escalerasTAnchoTributario * 2400;
    calcs.escalerasTCargaMuertaWd1 = calcs.escalerasTCargaMuertaPesoPropio * calcs.escalerasTAnchoTributario;
    calcs.escalerasTCargaMuertaWd2 = calcs.escalerasTCargaMuertaAcabados * calcs.escalerasTAnchoTributario;
    calcs.escalerasTCargaMuertaWd = (calcs.escalerasTCargaMuertaWd1 + calcs.escalerasTCargaMuertaWd2) / 1000;

    // ESCALERAS 2 CARGA VIVA
    calcs.escalerasTCargaMuertaWl1 = calcs.escalerasTCargaVivaSC * calcs.escalerasTAnchoTributario;
    calcs.escalerasTCargaMuertaWl = calcs.escalerasTCargaMuertaWl1 / 1000;

    // ESCALERAS 2 RESULTADOS
    calcs.escalerasTCargaMuertaWu = 1.4 * calcs.escalerasTCargaMuertaWd + 1.7 * calcs.escalerasTCargaMuertaWl;
    calcs.escalerasTCargaVivaApoyoFijo =
      (calcs.escalerasTCargaMuertaWu * calcs.escalerasTCargaVivaLongitud * calcs.escalerasTCargaVivaLongitud) / 8;
    calcs.escalerasTCargaVivaApoyoEmpotrado =
      (calcs.escalerasTCargaMuertaWu * calcs.escalerasTCargaVivaLongitud * calcs.escalerasTCargaVivaLongitud) / 12;
    calcs.escalerasTCargaVivaApoyoEmpotradoCortante =
      (calcs.escalerasTCargaVivaLongitud * calcs.escalerasTCargaMuertaWu) / 2;
  }

  doCalcs(calcs, calcFormatters, calculate);
});
