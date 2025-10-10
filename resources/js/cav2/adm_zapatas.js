import { doCalcs } from "../calc/calc_layout.js";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const calcFormatters = {
    diseñoPorFlexionYMinCuantia: (value) => value.toFixed(5),
    diseñoPorFlexionYBalanceadaCuantia: (value) => value.toFixed(5),
    diseñoPorFlexionYMaxCuantia: (value) => value.toFixed(5),
    diseñoPorFlexionYEconimicaCuantia: (value) => value.toFixed(5),
    diseñoPorFlexionXMinCuantia: (value) => value.toFixed(5),
    diseñoPorFlexionXBalanceadaCuantia: (value) => value.toFixed(5),
    diseñoPorFlexionXMaxCuantia: (value) => value.toFixed(5),
    diseñoPorFlexionXEconimicaCuantia: (value) => value.toFixed(5),
  };

  const calcs = {};

  const cuantias = {
    "0.7(f'c)0.5/Fy=": 0.002,
    "0.8(f'c)0.5/Fy=": 0.002760262,
    "14/Fy=": 0.003333333,
  };

  const corregir = {
    SI: 10.5,
    NO: 0.87,
  };

  function calculate() {
    calcs.sADM = parseFloat(document.getElementById("sADM").value);
    calcs.alturaRelleno = parseFloat(document.getElementById("alturaRelleno").value);
    calcs.gS = parseFloat(document.getElementById("gS").value);
    calcs.cx = parseFloat(document.getElementById("cx").value);
    calcs.cy = parseFloat(document.getElementById("cy").value);
    calcs.calculoDeLasDimensionesFaxialPDPL = parseFloat(
      document.getElementById("calculoDeLasDimensionesFaxialPDPL").value
    );
    calcs.calculoDeLasDimensionesFaxialSismo = parseFloat(
      document.getElementById("calculoDeLasDimensionesFaxialSismo").value
    );
    calcs.calculoDeLasDimensionesM22PDPL = parseFloat(document.getElementById("calculoDeLasDimensionesM22PDPL").value);
    calcs.calculoDeLasDimensionesM22Sismo = parseFloat(
      document.getElementById("calculoDeLasDimensionesM22Sismo").value
    );
    calcs.calculoDeLasDimensionesM33PDPL = parseFloat(document.getElementById("calculoDeLasDimensionesM33PDPL").value);
    calcs.calculoDeLasDimensionesM33Sismo = parseFloat(
      document.getElementById("calculoDeLasDimensionesM33Sismo").value
    );
    calcs.pv = parseFloat(document.getElementById("pv").value);
    calcs.mvx = parseFloat(document.getElementById("mvx").value);
    calcs.mvy = parseFloat(document.getElementById("mvy").value);
    calcs.calculoDeLasDimensionesFc = parseFloat(document.getElementById("calculoDeLasDimensionesFc").value);
    calcs.calculoDeLasDimensionesBmenor = parseFloat(document.getElementById("calculoDeLasDimensionesBmenor").value);
    calcs.calculoDeLasDimensionesLmayor = parseFloat(document.getElementById("calculoDeLasDimensionesLmayor").value);
    calcs.calculoDeLasDimensionesFA = parseFloat(document.getElementById("calculoDeLasDimensionesFA").value);
    calcs.calculoDeLasDimensionesFc = parseFloat(document.getElementById("calculoDeLasDimensionesFc").value);
    calcs.calculoDeLasDimensionesBmenor = parseFloat(document.getElementById("calculoDeLasDimensionesBmenor").value);
    calcs.calculoDeLasDimensionesLmayor = parseFloat(document.getElementById("calculoDeLasDimensionesLmayor").value);
    calcs.calculoDeLasDimensionesFA = parseFloat(document.getElementById("calculoDeLasDimensionesFA").value);
    calcs.calculoDelPeralteFC = parseFloat(document.getElementById("calculoDelPeralteFC").value);
    calcs.calculoDelPeralteD = parseFloat(document.getElementById("calculoDelPeralteD").value);
    calcs.calculoDeRefuerzoEnYFY = parseFloat(document.getElementById("calculoDeRefuerzoEnYFY").value);
    calcs.segunLaNormaCantidadEntrada1 = parseFloat(document.getElementById("segunLaNormaCantidadEntrada1").value);
    calcs.segunLaNormaCantidadEntrada2 = parseFloat(document.getElementById("segunLaNormaCantidadEntrada2").value);
    calcs.segunLaNormaCantidadEntrada3 = parseFloat(document.getElementById("segunLaNormaCantidadEntrada3").value);
    calcs.segunLaNormaCantidadEntrada4 = parseFloat(document.getElementById("segunLaNormaCantidadEntrada4").value);
    calcs.cuantiaMinY = document.getElementById("cuantiaMinY").value;
    calcs.cuantiaMinX = document.getElementById("cuantiaMinX").value;
    calcs.corregirPorDf = document.getElementById("corregirPorDf").value;

    // CAPACIDAD PORTANTE
    calcs.sADMCalc = calcs.sADM * 10;
    calcs.gsCalc1 = (calcs.gS * calcs.alturaRelleno) / 10;
    calcs.gsCalc2 = calcs.sADM - calcs.gsCalc1;
    calcs.sNeta = corregir[calcs.corregirPorDf];

    // CARGAS
    calcs.pm = calcs.calculoDeLasDimensionesFaxialPDPL;
    calcs.mmx = calcs.calculoDeLasDimensionesM33PDPL;
    calcs.mmy = calcs.calculoDeLasDimensionesM22PDPL;
    calcs.msx = calcs.calculoDeLasDimensionesM33Sismo;
    calcs.msy = calcs.calculoDeLasDimensionesM22Sismo;
    calcs.psx = calcs.calculoDeLasDimensionesFaxialSismo;
    calcs.psy = calcs.psx;

    // VERIFICACION SIN SISMO
    calcs.calculoDeLasDimensionesS = calcs.sADMCalc * calcs.calculoDeLasDimensionesFc;
    calcs.calculoDeLasDimensionesAreaTentativa = ((calcs.pm + calcs.pv) * 1.05) / calcs.calculoDeLasDimensionesS;
    calcs.calculoDeLasDimensionesDiferenciaDeLados = calcs.cy - calcs.cx;
    calcs.calculoDeLasDimensionesArea = calcs.calculoDeLasDimensionesBmenor * calcs.calculoDeLasDimensionesLmayor;

    // VERIFICACION EN X
    calcs.calculoDeLasDimensionesSx =
      ((calcs.pm + calcs.pv) * 1.05) / calcs.calculoDeLasDimensionesArea +
      (6 * (calcs.mmx + calcs.mvx)) /
        (calcs.calculoDeLasDimensionesBmenor *
          calcs.calculoDeLasDimensionesLmayor *
          calcs.calculoDeLasDimensionesLmayor);
    calcs.calculoDeLasDimensionesVerificacionX =
      calcs.calculoDeLasDimensionesSx > calcs.calculoDeLasDimensionesS ? "NO !!" : "OK!!";

    // VERIFICACION BIAXIAL
    calcs.calculoDeLasDimensionesSBiaxial =
      ((calcs.pm + calcs.pv) * 1.05) / calcs.calculoDeLasDimensionesArea +
      (6 * (calcs.mmy + calcs.mvy)) /
        (calcs.calculoDeLasDimensionesLmayor *
          calcs.calculoDeLasDimensionesBmenor *
          calcs.calculoDeLasDimensionesBmenor) +
      (6 * (calcs.mmx + calcs.mvx)) /
        (calcs.calculoDeLasDimensionesBmenor *
          calcs.calculoDeLasDimensionesLmayor *
          calcs.calculoDeLasDimensionesLmayor);
    calcs.calculoDeLasDimensionesVerificacionBiaxial =
      calcs.calculoDeLasDimensionesSBiaxial > calcs.calculoDeLasDimensionesS ? "NO !!" : "OK!!";

    // VERIFICACION POR SISMO
    calcs.calculoDeLasDimensionesSFA = calcs.calculoDeLasDimensionesFA * calcs.sADMCalc;
    calcs.calculoDeLasDimensionesSX =
      ((calcs.pm + calcs.pv + calcs.psx) * 1.05) / calcs.calculoDeLasDimensionesArea +
      (6 * (calcs.mmy + calcs.mvy)) /
        (calcs.calculoDeLasDimensionesLmayor *
          calcs.calculoDeLasDimensionesBmenor *
          calcs.calculoDeLasDimensionesBmenor) +
      (6 * (calcs.mmx + calcs.mvx + calcs.msx)) /
        (calcs.calculoDeLasDimensionesBmenor *
          calcs.calculoDeLasDimensionesLmayor *
          calcs.calculoDeLasDimensionesLmayor);
    calcs.calculoDeLasDimensionesVerificaionSX =
      calcs.calculoDeLasDimensionesSX > calcs.calculoDeLasDimensionesSFA ? "NO " : "OK!!";
    calcs.calculoDeLasDimensionesSY =
      ((calcs.pm + calcs.pv + calcs.psy) * 1.05) / calcs.calculoDeLasDimensionesArea +
      (6 * (calcs.mmy + calcs.mvy + calcs.msy)) /
        (calcs.calculoDeLasDimensionesLmayor *
          calcs.calculoDeLasDimensionesBmenor *
          calcs.calculoDeLasDimensionesBmenor) +
      (6 * (calcs.mmx + calcs.mvx)) /
        (calcs.calculoDeLasDimensionesBmenor *
          calcs.calculoDeLasDimensionesLmayor *
          calcs.calculoDeLasDimensionesLmayor);
    calcs.calculoDeLasDimensionesVerificaionSY =
      calcs.calculoDeLasDimensionesSY > calcs.calculoDeLasDimensionesSFA ? "NO " : "OK!!";

    // DIMENSIONES ZAPATAS
    calcs.calculoDeLasDimensionesB = calcs.calculoDeLasDimensionesBmenor;
    calcs.calculoDeLasDimensionesL = calcs.calculoDeLasDimensionesLmayor;

    // CALCULO DEL PERALTE
    calcs.calculoDelPeralteSUSinSismo = calcs.calculoDeLasDimensionesSBiaxial * 1.55;
    calcs.calculoDelPeralteSUSinSismoX = calcs.calculoDeLasDimensionesSX * 1.25;
    calcs.calculoDelPeralteSUSinSismoY = calcs.calculoDeLasDimensionesSY * 1.25;
    calcs.calculoDelPeralteSU = Math.max(
      calcs.calculoDelPeralteSUSinSismo,
      calcs.calculoDelPeralteSUSinSismoX,
      calcs.calculoDelPeralteSUSinSismoY
    );

    // CONCRETO ARMADO
    calcs.calculoDelPeralteVb = (calcs.calculoDeLasDimensionesBmenor - calcs.cx) / 2;
    calcs.calculoDelPeralteVl = (calcs.calculoDeLasDimensionesLmayor - calcs.cy) / 2;

    // PUNZONAMIENTO
    calcs.calculoDelPeralteBo = 2 * (calcs.cx + calcs.cy + 2 * calcs.calculoDelPeralteD);
    calcs.calculoDelPeralteAo = (calcs.calculoDelPeralteD + calcs.cx) * (calcs.calculoDelPeralteD + calcs.cy);
    calcs.calculoDelPeralteAResistentes = calcs.calculoDeLasDimensionesArea - calcs.calculoDelPeralteAo;
    calcs.calculoDelPeralteVu = calcs.calculoDelPeralteSU * calcs.calculoDelPeralteAResistentes;
    calcs.calculoDelPeralteVc1 =
      0.53 +
      (1.1 * calcs.calculoDelPeralteBo * calcs.calculoDelPeralteD * Math.sqrt(calcs.calculoDelPeralteFC) * 10) /
        (calcs.cx / calcs.cy);
    calcs.calculoDelPeralteVcmax =
      1.1 * calcs.calculoDelPeralteBo * calcs.calculoDelPeralteD * Math.sqrt(calcs.calculoDelPeralteFC) * 10;
    calcs.calculoDelPeralteVmin = Math.min(calcs.calculoDelPeralteVc1, calcs.calculoDelPeralteVcmax);
    calcs.calculoDelPeralteRefuerzoVc = 0.85 * calcs.calculoDelPeralteVmin;
    calcs.calculoDelPeraltePunzamientoVerificaion =
      calcs.calculoDelPeralteVu > calcs.calculoDelPeralteRefuerzoVc ? "aumenta el peralte" : "OK!!";

    // CORTANTE
    calcs.calculoDelPeralteCortanteVc =
      0.53 * 0.85 * calcs.calculoDelPeralteBo * calcs.calculoDelPeralteD * Math.sqrt(calcs.calculoDelPeralteFC) * 10;
    calcs.calculoDelPeralteCortanteVu =
      calcs.sADMCalc * 1 * (calcs.calculoDeLasDimensionesLmayor - calcs.calculoDelPeralteD);
    calcs.calculoDelPeralteCortanteVerificacion =
      calcs.calculoDelPeralteCortanteVu > calcs.calculoDelPeralteCortanteVc ? "aumenta el peralte" : "OK!!";
    calcs.calculoDelPeralteZapataD = calcs.calculoDelPeralteD;
    calcs.calculoDelPeralteH = calcs.calculoDelPeralteZapataD + 0.1;

    // CALCULO DEL REFUERZO EN Y
    calcs.calculoDeRefuerzoEnYB = calcs.calculoDeLasDimensionesB;
    calcs.calculoDeRefuerzoEnYMu =
      (calcs.calculoDeRefuerzoEnYB *
        calcs.calculoDelPeralteSU *
        calcs.calculoDelPeralteVb *
        calcs.calculoDelPeralteVb) /
      2;
    calcs.calculoDeRefuerzoEnYFC1 = calcs.calculoDelPeralteFC;
    calcs.calculoDeRefuerzoEnYH = calcs.calculoDelPeralteH * 100;
    calcs.calculoDeRefuerzoEnYD = calcs.calculoDeRefuerzoEnYH - 10;
    calcs.calculoDeRefuerzoEnYDatosB = calcs.calculoDeRefuerzoEnYB * 100;
    calcs.calculoDeRefuerzoEnYDatosMu = calcs.calculoDeRefuerzoEnYMu;
    calcs.calculoDeRefuerzoEnYMu1 = calcs.calculoDeRefuerzoEnYDatosMu * 100000;

    // CUANTIAS Y
    calcs.diseñoPorFlexionYMinCuantia = cuantias[calcs.cuantiaMinY];
    calcs.diseñoPorFlexionYMinArea =
      calcs.diseñoPorFlexionYMinCuantia * calcs.calculoDeRefuerzoEnYDatosB * calcs.calculoDeRefuerzoEnYD;
    calcs.diseñoPorFlexionYN = calcs.calculoDeRefuerzoEnYFC1 <= 280 ? 0 : (calcs.calculoDeRefuerzoEnYFC1 - 280) / 70;
    calcs.diseñoPorFlexionYB1 = calcs.calculoDeRefuerzoEnYFC1 <= 280 ? 0.85 : 0.85 - 0.05 * calcs.diseñoPorFlexionYN;
    calcs.diseñoPorFlexionYBalanceadaCuantia =
      calcs.diseñoPorFlexionYB1 *
      0.85 *
      calcs.calculoDeRefuerzoEnYFC1 *
      (6000 / (6000 + calcs.calculoDeRefuerzoEnYFY) / calcs.calculoDeRefuerzoEnYFY);
    calcs.diseñoPorFlexionYBalanceadaArea =
      calcs.diseñoPorFlexionYBalanceadaCuantia * calcs.calculoDeRefuerzoEnYDatosB * calcs.calculoDeRefuerzoEnYD;
    calcs.diseñoPorFlexionYMaxCuantia = 0.75 * calcs.diseñoPorFlexionYBalanceadaCuantia;
    calcs.diseñoPorFlexionYMaxArea =
      calcs.diseñoPorFlexionYMaxCuantia * calcs.calculoDeRefuerzoEnYDatosB * calcs.calculoDeRefuerzoEnYD;
    calcs.diseñoPorFlexionYEconimicaCuantia = 0.5 * calcs.diseñoPorFlexionYMaxCuantia;
    calcs.diseñoPorFlexionYEconimicaArea =
      calcs.diseñoPorFlexionYEconimicaCuantia * calcs.calculoDeRefuerzoEnYDatosB * calcs.calculoDeRefuerzoEnYD;

    // CALCULO DEL AREA Y
    calcs.calculoDelAreaDelRefuerzoYA =
      calcs.calculoDeRefuerzoEnYD -
      Math.sqrt(
        Math.pow(calcs.calculoDeRefuerzoEnYD, 2) -
          (2 * calcs.calculoDeRefuerzoEnYMu1) /
            (0.85 * 0.9 * calcs.calculoDeRefuerzoEnYFC1 * calcs.calculoDeRefuerzoEnYDatosB)
      );
    calcs.calculoDelAreaDelRefuerzoYAs =
      calcs.calculoDeRefuerzoEnYMu1 /
      (0.9 * calcs.calculoDeRefuerzoEnYFY * (calcs.calculoDeRefuerzoEnYD - calcs.calculoDelAreaDelRefuerzoYA / 2));
    calcs.calculoDelAreaDelRefuerzoYAsmax =
      calcs.calculoDelAreaDelRefuerzoYAs < calcs.diseñoPorFlexionYMaxArea ? "OK" : "NO";
    calcs.calculoDelAreaDelRefuerzoYAsmin =
      calcs.calculoDelAreaDelRefuerzoYAs > calcs.diseñoPorFlexionYMinArea ? "OK" : "NO";
    calcs.calculoDelAreaDelRefuerzoYVerificacionAs =
      calcs.calculoDelAreaDelRefuerzoYAs < calcs.diseñoPorFlexionYMinArea
        ? calcs.diseñoPorFlexionYMinArea
        : calcs.calculoDelAreaDelRefuerzoYAs;

    // SEGUN LA NORMA
    calcs.segunLaNormaB = calcs.calculoDeLasDimensionesB;
    calcs.segunLaNormaL = calcs.calculoDeLasDimensionesL;
    calcs.segunLaNormaBeta = calcs.segunLaNormaL / calcs.segunLaNormaB;
    calcs.segunLaNormaAreaTotal = calcs.segunLaNormaBeta * calcs.calculoDelAreaDelRefuerzoYAs;
    calcs.segunLaNorma = 2 / (calcs.segunLaNormaBeta + 1);
    calcs.segunLaNormaConcentrarse = calcs.segunLaNormaAreaTotal * calcs.segunLaNorma;
    calcs.segunLaNormaAncho = calcs.segunLaNormaB;
    calcs.segunLaNormaEsfuerzo = calcs.segunLaNormaAreaTotal - calcs.segunLaNormaConcentrarse;
    calcs.segunLaNormaSeran = (calcs.calculoDeLasDimensionesL - calcs.calculoDeLasDimensionesB) / 2;
    calcs.segunLaNormaRepartirse = ((calcs.segunLaNormaL - calcs.segunLaNormaB) * 100) / 2;
    calcs.segunLaNormaCantidad1 = calcs.segunLaNormaConcentrarse / calcs.segunLaNormaCantidadEntrada1;
    calcs.segunLaNormaEspaciado1 =
      (calcs.segunLaNormaCantidadEntrada1 * 100 * calcs.segunLaNormaAncho) / calcs.segunLaNormaConcentrarse;
    calcs.segunLaNormaCalc1 =
      (calcs.segunLaNormaCantidadEntrada1 * 100 * calcs.segunLaNormaRepartirse) / calcs.segunLaNormaEsfuerzo;
    calcs.segunLaNormaCantidad2 = calcs.segunLaNormaConcentrarse / calcs.segunLaNormaCantidadEntrada2;
    calcs.segunLaNormaEspaciado2 =
      (calcs.segunLaNormaCantidadEntrada2 * 100 * calcs.segunLaNormaAncho) / calcs.segunLaNormaConcentrarse;
    calcs.segunLaNormaCalc2 =
      (calcs.segunLaNormaCantidadEntrada2 * 100 * calcs.segunLaNormaRepartirse) / calcs.segunLaNormaEsfuerzo;
    calcs.segunLaNormaCantidad3 = calcs.segunLaNormaConcentrarse / calcs.segunLaNormaCantidadEntrada3;
    calcs.segunLaNormaEspaciado3 =
      (calcs.segunLaNormaCantidadEntrada3 * 100 * calcs.segunLaNormaAncho) / calcs.segunLaNormaConcentrarse;
    calcs.segunLaNormaCalc3 =
      (calcs.segunLaNormaCantidadEntrada3 * 100 * calcs.segunLaNormaRepartirse) / calcs.segunLaNormaEsfuerzo;
    calcs.segunLaNormaCantidad4 = calcs.segunLaNormaConcentrarse / calcs.segunLaNormaCantidadEntrada4;
    calcs.segunLaNormaEspaciado4 =
      (calcs.segunLaNormaCantidadEntrada4 * 100 * calcs.segunLaNormaAncho) / calcs.segunLaNormaConcentrarse;
    calcs.segunLaNormaCalc4 =
      (calcs.segunLaNormaCantidadEntrada4 * 100 * calcs.segunLaNormaRepartirse) / calcs.segunLaNormaEsfuerzo;

    calcs.segunLaNormaCantidad1 = Math.round(calcs.segunLaNormaCantidad1);
    calcs.segunLaNormaCantidad2 = Math.round(calcs.segunLaNormaCantidad2);
    calcs.segunLaNormaCantidad3 = Math.round(calcs.segunLaNormaCantidad3);
    calcs.segunLaNormaCantidad4 = Math.round(calcs.segunLaNormaCantidad4);

    // ACERO A COLOCAR Y
    calcs.diseñoPorFlexionYCantidadAcero1 =
      calcs.calculoDelAreaDelRefuerzoYVerificacionAs / calcs.segunLaNormaCantidadEntrada1;
    calcs.diseñoPorFlexionYEspacio1 =
      (calcs.segunLaNormaCantidadEntrada1 * calcs.calculoDeRefuerzoEnYDatosB) /
      calcs.calculoDelAreaDelRefuerzoYVerificacionAs;
    calcs.diseñoPorFlexionYCantidadAcero2 =
      calcs.calculoDelAreaDelRefuerzoYVerificacionAs / calcs.segunLaNormaCantidadEntrada2;
    calcs.diseñoPorFlexionYEspacio2 =
      (calcs.segunLaNormaCantidadEntrada2 * calcs.calculoDeRefuerzoEnYDatosB) /
      calcs.calculoDelAreaDelRefuerzoYVerificacionAs;
    calcs.diseñoPorFlexionYCantidadAcero3 =
      calcs.calculoDelAreaDelRefuerzoYVerificacionAs / calcs.segunLaNormaCantidadEntrada3;
    calcs.diseñoPorFlexionYEspacio3 =
      (calcs.segunLaNormaCantidadEntrada3 * calcs.calculoDeRefuerzoEnYDatosB) /
      calcs.calculoDelAreaDelRefuerzoYVerificacionAs;
    calcs.diseñoPorFlexionYCantidadAcero4 =
      calcs.calculoDelAreaDelRefuerzoYVerificacionAs / calcs.segunLaNormaCantidadEntrada4;
    calcs.diseñoPorFlexionYEspacio4 =
      (calcs.segunLaNormaCantidadEntrada4 * calcs.calculoDeRefuerzoEnYDatosB) /
      calcs.calculoDelAreaDelRefuerzoYVerificacionAs;

    calcs.diseñoPorFlexionYCantidadAcero1 = Math.round(calcs.diseñoPorFlexionYCantidadAcero1);
    calcs.diseñoPorFlexionYCantidadAcero2 = Math.round(calcs.diseñoPorFlexionYCantidadAcero2);
    calcs.diseñoPorFlexionYCantidadAcero3 = Math.round(calcs.diseñoPorFlexionYCantidadAcero3);
    calcs.diseñoPorFlexionYCantidadAcero4 = Math.round(calcs.diseñoPorFlexionYCantidadAcero4);

    // CALCULO DEL REFUERZO EN X
    calcs.calculoDeRefuerzoEnXL = calcs.calculoDeLasDimensionesL;
    calcs.calculoDeRefuerzoEnXMu =
      (calcs.calculoDeRefuerzoEnXL *
        calcs.calculoDelPeralteSU *
        calcs.calculoDelPeralteVl *
        calcs.calculoDelPeralteVl) /
      2;
    calcs.calculoDeRefuerzoEnXFY = calcs.calculoDeRefuerzoEnYFY;
    calcs.calculoDeRefuerzoEnXFC1 = calcs.calculoDelPeralteFC;
    calcs.calculoDeRefuerzoEnXH = calcs.calculoDelPeralteH * 100;
    calcs.calculoDeRefuerzoEnXD = calcs.calculoDeRefuerzoEnXH - 10;
    calcs.calculoDeRefuerzoEnXB = calcs.calculoDeRefuerzoEnXL * 100;
    calcs.calculoDeRefuerzoEnXMuDatos = calcs.calculoDeRefuerzoEnXMu;
    calcs.calculoDeRefuerzoEnXMu1 = calcs.calculoDeRefuerzoEnXMuDatos * 100000;

    // CUANTIAS X
    calcs.diseñoPorFlexionXMinCuantia = cuantias[calcs.cuantiaMinX];
    calcs.diseñoPorFlexionXMinArea =
      calcs.diseñoPorFlexionXMinCuantia * calcs.calculoDeRefuerzoEnXB * calcs.calculoDeRefuerzoEnXD;
    calcs.diseñoPorFlexionXN = calcs.calculoDeRefuerzoEnXFC1 <= 280 ? 0 : (calcs.calculoDeRefuerzoEnXFC1 - 280) / 70;
    calcs.diseñoPorFlexionXB1 = calcs.calculoDeRefuerzoEnXFC1 <= 280 ? 0.85 : 0.85 - 0.05 * calcs.diseñoPorFlexionXN;
    calcs.diseñoPorFlexionXBalanceadaCuantia =
      calcs.diseñoPorFlexionXB1 *
      0.85 *
      calcs.calculoDeRefuerzoEnXFC1 *
      (6000 / (6000 + calcs.calculoDeRefuerzoEnXFY) / calcs.calculoDeRefuerzoEnXFY);
    calcs.diseñoPorFlexionXBalanceadaArea =
      calcs.diseñoPorFlexionXBalanceadaCuantia * calcs.calculoDeRefuerzoEnXB * calcs.calculoDeRefuerzoEnXD;
    calcs.diseñoPorFlexionXMaxCuantia = 0.75 * calcs.diseñoPorFlexionXBalanceadaCuantia;
    calcs.diseñoPorFlexionXMaxArea =
      calcs.diseñoPorFlexionXMaxCuantia * calcs.calculoDeRefuerzoEnXB * calcs.calculoDeRefuerzoEnXD;
    calcs.diseñoPorFlexionXEconimicaCuantia = 0.5 * calcs.diseñoPorFlexionXMaxCuantia;
    calcs.diseñoPorFlexionXEconimicaArea =
      calcs.diseñoPorFlexionXEconimicaCuantia * calcs.calculoDeRefuerzoEnXB * calcs.calculoDeRefuerzoEnXD;

    // CALCULO DEL AREA DE REFUERZO X
    calcs.calculoDelAreaDelRefuerzoXA =
      calcs.calculoDeRefuerzoEnXD -
      Math.sqrt(
        Math.pow(calcs.calculoDeRefuerzoEnXD, 2) -
          (2 * calcs.calculoDeRefuerzoEnXMu1) /
            (0.85 * 0.9 * calcs.calculoDeRefuerzoEnXFC1 * calcs.calculoDeRefuerzoEnXB)
      );
    calcs.calculoDelAreaDelRefuerzoXAs =
      calcs.calculoDeRefuerzoEnXMu1 /
      (0.9 * calcs.calculoDeRefuerzoEnXFY * (calcs.calculoDeRefuerzoEnXD - calcs.calculoDelAreaDelRefuerzoXA / 2));
    calcs.calculoDelAreaDelRefuerzoXAsmax =
      calcs.calculoDelAreaDelRefuerzoXAs < calcs.diseñoPorFlexionXMaxArea ? "OK" : "NO";
    calcs.calculoDelAreaDelRefuerzoXAsmin =
      calcs.calculoDelAreaDelRefuerzoXAs > calcs.diseñoPorFlexionXMinArea ? "OK" : "NO";
    calcs.calculoDelAreaDelRefuerzoXAsVerificacioni =
      calcs.calculoDelAreaDelRefuerzoXAs < calcs.diseñoPorFlexionXMinArea
        ? calcs.diseñoPorFlexionXMinArea
        : calcs.calculoDelAreaDelRefuerzoXAs;

    // ACERO A COLOCAR
    calcs.diseñoPorFlexionXCantidadAcero1 =
      calcs.calculoDelAreaDelRefuerzoXAsVerificacioni / calcs.segunLaNormaCantidadEntrada1;
    calcs.diseñoPorFlexionXEspacio1 =
      (calcs.segunLaNormaCantidadEntrada1 * calcs.calculoDeRefuerzoEnXB) /
      calcs.calculoDelAreaDelRefuerzoXAsVerificacioni;
    calcs.diseñoPorFlexionXCantidadAcero2 =
      calcs.calculoDelAreaDelRefuerzoXAsVerificacioni / calcs.segunLaNormaCantidadEntrada2;
    calcs.diseñoPorFlexionXEspacio2 =
      (calcs.segunLaNormaCantidadEntrada2 * calcs.calculoDeRefuerzoEnXB) /
      calcs.calculoDelAreaDelRefuerzoXAsVerificacioni;
    calcs.diseñoPorFlexionXCantidadAcero3 =
      calcs.calculoDelAreaDelRefuerzoXAsVerificacioni / calcs.segunLaNormaCantidadEntrada3;
    calcs.diseñoPorFlexionXEspacio3 =
      (calcs.segunLaNormaCantidadEntrada3 * calcs.calculoDeRefuerzoEnXB) /
      calcs.calculoDelAreaDelRefuerzoXAsVerificacioni;
    calcs.diseñoPorFlexionXCantidadAcero4 =
      calcs.calculoDelAreaDelRefuerzoXAsVerificacioni / calcs.segunLaNormaCantidadEntrada4;
    calcs.diseñoPorFlexionXEspacio4 =
      (calcs.segunLaNormaCantidadEntrada4 * calcs.calculoDeRefuerzoEnXB) /
      calcs.calculoDelAreaDelRefuerzoXAsVerificacioni;

    calcs.diseñoPorFlexionXCantidadAcero1 = Math.round(calcs.diseñoPorFlexionXCantidadAcero1);
    calcs.diseñoPorFlexionXCantidadAcero2 = Math.round(calcs.diseñoPorFlexionXCantidadAcero2);
    calcs.diseñoPorFlexionXCantidadAcero3 = Math.round(calcs.diseñoPorFlexionXCantidadAcero3);
    calcs.diseñoPorFlexionXCantidadAcero4 = Math.round(calcs.diseñoPorFlexionXCantidadAcero4);
  }

  doCalcs(calcs, calcFormatters, calculate);
});
