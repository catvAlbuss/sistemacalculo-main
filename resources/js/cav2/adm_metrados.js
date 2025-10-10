import { doCalcs } from "../calc/calc_layout.js";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const calcFormatters = {
    losaMacisaWDCalc: (value) => value.toFixed(3),
    escaleraWDCalc: (value) => value.toFixed(3),
    escaleraWUCalc: (value) => value.toFixed(4),
    tabiquePdCalc: (value) => value.toFixed(4),
    tabiquePuCalc: (value) => value.toFixed(3),
    tabiqueWDCalc: (value) => value.toFixed(5),
    tabiqueWuCalc: (value) => value.toFixed(5),
  };

  const calcs = {};

  function calculate() {
    // DATOS
    calcs.vigasAnchoTributario = parseFloat(document.getElementById("vigasAnchoTributario").value);
    calcs.vigasB = parseFloat(document.getElementById("vigasB").value);
    calcs.vigasH = parseFloat(document.getElementById("vigasH").value);
    calcs.vigasPesoAligerado = parseFloat(document.getElementById("vigasPesoAligerado").value);
    calcs.vigasAcabados = parseFloat(document.getElementById("vigasAcabados").value);
    calcs.vigasSC = parseFloat(document.getElementById("vigasSC").value);
    calcs.vigasTecho = parseFloat(document.getElementById("vigasTecho").value);
    calcs.aligeradoEspacioDelLadrillo = parseFloat(document.getElementById("aligeradoEspacioDelLadrillo").value);
    calcs.aligeradoAnchoDeLaVigueta = parseFloat(document.getElementById("aligeradoAnchoDeLaVigueta").value);
    calcs.aligeradoPesoAligerado = parseFloat(document.getElementById("aligeradoPesoAligerado").value);
    calcs.aligeradoAcabados = parseFloat(document.getElementById("aligeradoAcabados").value);
    calcs.aligeradoSC = parseFloat(document.getElementById("aligeradoSC").value);
    calcs.aligeradoTecho = parseFloat(document.getElementById("aligeradoTecho").value);
    calcs.losaMacisaEspesorT = parseFloat(document.getElementById("losaMacisaEspesorT").value);
    calcs.losaMacisaAnchoTributario = parseFloat(document.getElementById("losaMacisaAnchoTributario").value);
    calcs.losaMacisaAcabados = parseFloat(document.getElementById("losaMacisaAcabados").value);
    calcs.losaMacisaSC = parseFloat(document.getElementById("losaMacisaSC").value);
    calcs.losaMacisaTecho = parseFloat(document.getElementById("losaMacisaTecho").value);
    calcs.escaleraHm = parseFloat(document.getElementById("escaleraHm").value);
    calcs.escaleraAnchoTributario = parseFloat(document.getElementById("escaleraAnchoTributario").value);
    calcs.escaleraAcabados = parseFloat(document.getElementById("escaleraAcabados").value);
    calcs.escaleraSC = parseFloat(document.getElementById("escaleraSC").value);
    calcs.taboqieEspesor = parseFloat(document.getElementById("taboqieEspesor").value);
    calcs.taboqieAltura = parseFloat(document.getElementById("taboqieAltura").value);
    calcs.taboqieAnchoTributario = parseFloat(document.getElementById("taboqieAnchoTributario").value);
    calcs.taboquePeso = parseFloat(document.getElementById("taboquePeso").value);
    calcs.cargaDistribuidaEspesor = parseFloat(document.getElementById("cargaDistribuidaEspesor").value);
    calcs.cargaDistribuidaAltura = parseFloat(document.getElementById("cargaDistribuidaAltura").value);
    calcs.cargaDistribuidaPeso = parseFloat(document.getElementById("cargaDistribuidaPeso").value);

    // VIGAS-----------------------------
    // PESO MUERTO
    calcs.vigasPesoPropioCalc = calcs.vigasB * calcs.vigasH * 2400;
    calcs.vigasPesoAligeradoCalc = calcs.vigasPesoAligerado * calcs.vigasAnchoTributario;
    calcs.vigasAcabadosCalc = calcs.vigasAcabados * calcs.vigasAnchoTributario;
    calcs.vigasWDCalc = (calcs.vigasPesoAligeradoCalc + calcs.vigasAcabadosCalc + calcs.vigasPesoPropioCalc) / 1000;

    // PESO VIVO
    calcs.vigasSCCalc = calcs.vigasSC * calcs.vigasAnchoTributario;
    calcs.vigasTechoCalc = calcs.vigasTecho * calcs.vigasAnchoTributario;
    calcs.vigasWLCalc = (calcs.vigasSCCalc + calcs.vigasTechoCalc) / 1000;
    calcs.vigasWuCalc = 1.4 * calcs.vigasWDCalc + 1.7 * calcs.vigasWLCalc;

    // ALIGERADO---------------------------
    // PESO MUERTO
    calcs.aligeradoAnchoTributarioCalc = calcs.aligeradoEspacioDelLadrillo + calcs.aligeradoAnchoDeLaVigueta;
    calcs.aligeradoPesoAligeradoCalc = calcs.aligeradoPesoAligerado * calcs.aligeradoAnchoTributarioCalc;
    calcs.aligeradoAcabadosCalc = calcs.aligeradoAcabados * calcs.aligeradoAnchoTributarioCalc;
    calcs.aligeradoWDCalc = (calcs.aligeradoPesoAligeradoCalc + calcs.aligeradoAcabadosCalc) / 1000;

    // PESO VIVO
    calcs.aligeradoSCCalc = calcs.aligeradoSC * calcs.aligeradoAnchoTributarioCalc;
    calcs.aligeradoTechoCalc = calcs.aligeradoTecho * calcs.aligeradoAnchoTributarioCalc;
    calcs.aligeradoWLCalc = (calcs.aligeradoSCCalc + calcs.aligeradoTechoCalc) / 1000;
    calcs.aligeradoWuCalc = 1.4 * calcs.aligeradoWDCalc + 1.7 * calcs.aligeradoWLCalc;

    // LOSA MACISA----------------------
    // PESO MUERTO
    calcs.losaMacisaPesoPropioDeLaLosa1Calc = calcs.losaMacisaEspesorT * calcs.losaMacisaAnchoTributario * 2400;
    calcs.losaMacisaPesoPropioDeLaLosa2Calc = calcs.losaMacisaPesoPropioDeLaLosa1Calc * calcs.losaMacisaAnchoTributario;
    calcs.losaMacisaAcabadosCalc = calcs.losaMacisaAcabados * calcs.losaMacisaAnchoTributario;
    calcs.losaMacisaWDCalc = (calcs.losaMacisaPesoPropioDeLaLosa2Calc + calcs.losaMacisaAcabadosCalc) / 1000;

    // PESO VIVO
    calcs.losaMacisaSCCalc = calcs.losaMacisaSC * calcs.losaMacisaAnchoTributario;
    calcs.losaMacisaTechoCalc = calcs.losaMacisaTecho * calcs.losaMacisaAnchoTributario;
    calcs.losaMacisaWLCalc = (calcs.losaMacisaSCCalc + calcs.losaMacisaTechoCalc) / 1000;
    calcs.losaMacisaWuCalc = 1.4 * calcs.losaMacisaWDCalc + 1.7 * calcs.losaMacisaWLCalc;

    // ESCALERA------------------------
    // PESO MUERTO
    calcs.escaleraPesoPropioDeLaEscalera1Calc = calcs.escaleraHm * calcs.escaleraAnchoTributario * 2400;
    calcs.escaleraPesoPropioDeLaEscalera2Calc =
      calcs.escaleraPesoPropioDeLaEscalera1Calc * calcs.escaleraAnchoTributario;
    calcs.escaleraPesoPropioAcabadosCalc = calcs.escaleraAcabados * calcs.escaleraAnchoTributario;
    calcs.escaleraWDCalc = (calcs.escaleraPesoPropioDeLaEscalera2Calc + calcs.escaleraPesoPropioAcabadosCalc) / 1000;

    // PESO VIVO
    calcs.escaleraSCCalc = calcs.escaleraSC * calcs.escaleraAnchoTributario;
    calcs.escaleraWLCalc = calcs.escaleraSCCalc / 1000;
    calcs.escaleraWUCalc = 1.4 * calcs.escaleraWDCalc + 1.7 * calcs.escaleraWLCalc;

    // TABIQUE-------------------------------
    calcs.tabiquePdCalc =
      (calcs.taboqieEspesor * calcs.taboqieAltura * calcs.taboqieAnchoTributario * calcs.taboquePeso) / 1000;
    calcs.tabiquePuCalc = 1.4 * calcs.tabiquePdCalc;

    // CARGA DISTRIBUIDA
    calcs.tabiqueWDCalc =
      (calcs.cargaDistribuidaEspesor * calcs.cargaDistribuidaAltura * calcs.cargaDistribuidaPeso) / 1000;
    calcs.tabiqueWuCalc = 1.4 * calcs.tabiqueWDCalc;
  }

  doCalcs(calcs, calcFormatters, calculate);
});
