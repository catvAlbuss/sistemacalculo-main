import { updateCalcs } from "../calc/calc_layout.js";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const calcFormatters = {};

  const calcs = {};

  function calculate() {
    calcs.areaNominal6mm = parseFloat(document.getElementById("areaNominal6mm").value);
    calcs._01CombinacionseisMilimetros = parseFloat(document.getElementById("_01CombinacionseisMilimetros").value);
    calcs._02CombinacionseisMilimetros = parseFloat(document.getElementById("_02CombinacionseisMilimetros").value);
    calcs._03CombinacionseisMilimetros = parseFloat(document.getElementById("_03CombinacionseisMilimetros").value);
    calcs._04CombinacionseisMilimetros = parseFloat(document.getElementById("_04CombinacionseisMilimetros").value);
    calcs._05CombinacionseisMilimetros = parseFloat(document.getElementById("_05CombinacionseisMilimetros").value);
    calcs._06CombinacionseisMilimetros = parseFloat(document.getElementById("_06CombinacionseisMilimetros").value);
    calcs._07CombinacionseisMilimetros = parseFloat(document.getElementById("_07CombinacionseisMilimetros").value);
    calcs._08CombinacionseisMilimetros = parseFloat(document.getElementById("_08CombinacionseisMilimetros").value);

    calcs.areaNominal8mm = parseFloat(document.getElementById("areaNominal8mm").value);
    calcs._11CombinacionochoMilimetros = parseFloat(document.getElementById("_11CombinacionochoMilimetros").value);
    calcs._12CombinacionochoMilimetros = parseFloat(document.getElementById("_12CombinacionochoMilimetros").value);
    calcs._13CombinacionochoMilimetros = parseFloat(document.getElementById("_13CombinacionochoMilimetros").value);
    calcs._14CombinacionochoMilimetros = parseFloat(document.getElementById("_14CombinacionochoMilimetros").value);
    calcs._15CombinacionochoMilimetros = parseFloat(document.getElementById("_15CombinacionochoMilimetros").value);
    calcs._16CombinacionochoMilimetros = parseFloat(document.getElementById("_16CombinacionochoMilimetros").value);
    calcs._17CombinacionochoMilimetros = parseFloat(document.getElementById("_17CombinacionochoMilimetros").value);
    calcs._18CombinacionochoMilimetros = parseFloat(document.getElementById("_18CombinacionochoMilimetros").value);

    calcs.areaNominal3Octavos = parseFloat(document.getElementById("areaNominal3Octavos").value);
    calcs._21CombinaciontresOctavos = parseFloat(document.getElementById("_21CombinaciontresOctavos").value);
    calcs._22CombinaciontresOctavos = parseFloat(document.getElementById("_22CombinaciontresOctavos").value);
    calcs._23CombinaciontresOctavos = parseFloat(document.getElementById("_23CombinaciontresOctavos").value);
    calcs._24CombinaciontresOctavos = parseFloat(document.getElementById("_24CombinaciontresOctavos").value);
    calcs._25CombinaciontresOctavos = parseFloat(document.getElementById("_25CombinaciontresOctavos").value);
    calcs._26CombinaciontresOctavos = parseFloat(document.getElementById("_26CombinaciontresOctavos").value);
    calcs._27CombinaciontresOctavos = parseFloat(document.getElementById("_27CombinaciontresOctavos").value);
    calcs._28CombinaciontresOctavos = parseFloat(document.getElementById("_28CombinaciontresOctavos").value);

    calcs.areaNominal12mm = parseFloat(document.getElementById("areaNominal12mm").value);
    calcs._31CombinaciondoceMilimetros = parseFloat(document.getElementById("_31CombinaciondoceMilimetros").value);
    calcs._32CombinaciondoceMilimetros = parseFloat(document.getElementById("_32CombinaciondoceMilimetros").value);
    calcs._33CombinaciondoceMilimetros = parseFloat(document.getElementById("_33CombinaciondoceMilimetros").value);
    calcs._34CombinaciondoceMilimetros = parseFloat(document.getElementById("_34CombinaciondoceMilimetros").value);
    calcs._35CombinaciondoceMilimetros = parseFloat(document.getElementById("_35CombinaciondoceMilimetros").value);
    calcs._36CombinaciondoceMilimetros = parseFloat(document.getElementById("_36CombinaciondoceMilimetros").value);
    calcs._37CombinaciondoceMilimetros = parseFloat(document.getElementById("_37CombinaciondoceMilimetros").value);
    calcs._38CombinaciondoceMilimetros = parseFloat(document.getElementById("_38CombinaciondoceMilimetros").value);

    calcs.areaNominalUnMedio = parseFloat(document.getElementById("areaNominalUnMedio").value);
    calcs._41CombinacionmediaPulgada = parseFloat(document.getElementById("_41CombinacionmediaPulgada").value);
    calcs._42CombinacionmediaPulgada = parseFloat(document.getElementById("_42CombinacionmediaPulgada").value);
    calcs._43CombinacionmediaPulgada = parseFloat(document.getElementById("_43CombinacionmediaPulgada").value);
    calcs._44CombinacionmediaPulgada = parseFloat(document.getElementById("_44CombinacionmediaPulgada").value);
    calcs._45CombinacionmediaPulgada = parseFloat(document.getElementById("_45CombinacionmediaPulgada").value);
    calcs._46CombinacionmediaPulgada = parseFloat(document.getElementById("_46CombinacionmediaPulgada").value);
    calcs._47CombinacionmediaPulgada = parseFloat(document.getElementById("_47CombinacionmediaPulgada").value);
    calcs._48CombinacionmediaPulgada = parseFloat(document.getElementById("_48CombinacionmediaPulgada").value);

    calcs.areaNominalCincoOctavos = parseFloat(document.getElementById("areaNominalCincoOctavos").value);
    calcs._51CombinacioncincoOctavos = parseFloat(document.getElementById("_51CombinacioncincoOctavos").value);
    calcs._52CombinacioncincoOctavos = parseFloat(document.getElementById("_52CombinacioncincoOctavos").value);
    calcs._53CombinacioncincoOctavos = parseFloat(document.getElementById("_53CombinacioncincoOctavos").value);
    calcs._54CombinacioncincoOctavos = parseFloat(document.getElementById("_54CombinacioncincoOctavos").value);
    calcs._55CombinacioncincoOctavos = parseFloat(document.getElementById("_55CombinacioncincoOctavos").value);
    calcs._56CombinacioncincoOctavos = parseFloat(document.getElementById("_56CombinacioncincoOctavos").value);
    calcs._57CombinacioncincoOctavos = parseFloat(document.getElementById("_57CombinacioncincoOctavos").value);
    calcs._58CombinacioncincoOctavos = parseFloat(document.getElementById("_58CombinacioncincoOctavos").value);

    calcs.areaNominalTresCuartos = parseFloat(document.getElementById("areaNominalTresCuartos").value);
    calcs._61CombinaciontresCuartos = parseFloat(document.getElementById("_61CombinaciontresCuartos").value);
    calcs._62CombinaciontresCuartos = parseFloat(document.getElementById("_62CombinaciontresCuartos").value);
    calcs._63CombinaciontresCuartos = parseFloat(document.getElementById("_63CombinaciontresCuartos").value);
    calcs._64CombinaciontresCuartos = parseFloat(document.getElementById("_64CombinaciontresCuartos").value);
    calcs._65CombinaciontresCuartos = parseFloat(document.getElementById("_65CombinaciontresCuartos").value);
    calcs._66CombinaciontresCuartos = parseFloat(document.getElementById("_66CombinaciontresCuartos").value);
    calcs._67CombinaciontresCuartos = parseFloat(document.getElementById("_67CombinaciontresCuartos").value);
    calcs._68CombinaciontresCuartos = parseFloat(document.getElementById("_68CombinaciontresCuartos").value);

    calcs.areaNominalUnaPulgada = parseFloat(document.getElementById("areaNominalUnaPulgada").value);
    calcs._71CombinacionunaPulgada = parseFloat(document.getElementById("_71CombinacionunaPulgada").value);
    calcs._72CombinacionunaPulgada = parseFloat(document.getElementById("_72CombinacionunaPulgada").value);
    calcs._73CombinacionunaPulgada = parseFloat(document.getElementById("_73CombinacionunaPulgada").value);
    calcs._74CombinacionunaPulgada = parseFloat(document.getElementById("_74CombinacionunaPulgada").value);
    calcs._75CombinacionunaPulgada = parseFloat(document.getElementById("_75CombinacionunaPulgada").value);
    calcs._76CombinacionunaPulgada = parseFloat(document.getElementById("_76CombinacionunaPulgada").value);
    calcs._77CombinacionunaPulgada = parseFloat(document.getElementById("_77CombinacionunaPulgada").value);
    calcs._78CombinacionunaPulgada = parseFloat(document.getElementById("_78CombinacionunaPulgada").value);

    calcs.areaNominalUnoYTresOctavos = parseFloat(document.getElementById("areaNominalUnoYTresOctavos").value);
    calcs._81CombinacionunoYTresOctavos = parseFloat(document.getElementById("_81CombinacionunoYTresOctavos").value);
    calcs._82CombinacionunoYTresOctavos = parseFloat(document.getElementById("_82CombinacionunoYTresOctavos").value);
    calcs._83CombinacionunoYTresOctavos = parseFloat(document.getElementById("_83CombinacionunoYTresOctavos").value);
    calcs._84CombinacionunoYTresOctavos = parseFloat(document.getElementById("_84CombinacionunoYTresOctavos").value);
    calcs._85CombinacionunoYTresOctavos = parseFloat(document.getElementById("_85CombinacionunoYTresOctavos").value);
    calcs._86CombinacionunoYTresOctavos = parseFloat(document.getElementById("_86CombinacionunoYTresOctavos").value);
    calcs._87CombinacionunoYTresOctavos = parseFloat(document.getElementById("_87CombinacionunoYTresOctavos").value);
    calcs._88CombinacionunoYTresOctavos = parseFloat(document.getElementById("_88CombinacionunoYTresOctavos").value);

    calcs.cantidad1 = parseFloat(document.getElementById("cantidad1").value);
    calcs.cantidad2 = parseFloat(document.getElementById("cantidad2").value);
    calcs.cantidad3 = parseFloat(document.getElementById("cantidad3").value);
    calcs.cantidad4 = parseFloat(document.getElementById("cantidad4").value);

    calcs.cantidad1Diametro = parseFloat(
      document.getElementById(document.getElementById("cantidad1Diametro").value).value
    );
    calcs.cantidad2Diametro = parseFloat(
      document.getElementById(document.getElementById("cantidad2Diametro").value).value
    );
    calcs.cantidad3Diametro = parseFloat(
      document.getElementById(document.getElementById("cantidad3Diametro").value).value
    );
    calcs.cantidad4Diametro = parseFloat(
      document.getElementById(document.getElementById("cantidad4Diametro").value).value
    );

    // AREA ACUMULADA
    calcs.areaAcumulada1Combinacion =
      calcs._21CombinaciontresOctavos * calcs.areaNominal3Octavos +
      calcs._41CombinacionmediaPulgada * calcs.areaNominalUnMedio +
      calcs._51CombinacioncincoOctavos * calcs.areaNominalCincoOctavos +
      calcs._61CombinaciontresCuartos * calcs.areaNominalTresCuartos +
      calcs.areaNominalUnaPulgada * calcs._71CombinacionunaPulgada +
      calcs._81CombinacionunoYTresOctavos * calcs.areaNominalUnoYTresOctavos +
      calcs.areaNominal6mm * calcs._01CombinacionseisMilimetros +
      calcs.areaNominal8mm * calcs._11CombinacionochoMilimetros +
      calcs.areaNominal12mm * calcs._31CombinaciondoceMilimetros;
    calcs.areaAcumulada2Combinacion =
      calcs._22CombinaciontresOctavos * calcs.areaNominal3Octavos +
      calcs._42CombinacionmediaPulgada * calcs.areaNominalUnMedio +
      calcs._52CombinacioncincoOctavos * calcs.areaNominalCincoOctavos +
      calcs._62CombinaciontresCuartos * calcs.areaNominalTresCuartos +
      calcs.areaNominalUnaPulgada * calcs._72CombinacionunaPulgada +
      calcs._82CombinacionunoYTresOctavos * calcs.areaNominalUnoYTresOctavos +
      calcs.areaNominal6mm * calcs._02CombinacionseisMilimetros +
      calcs.areaNominal8mm * calcs._12CombinacionochoMilimetros +
      calcs.areaNominal12mm * calcs._32CombinaciondoceMilimetros;
    calcs.areaAcumulada3Combinacion =
      calcs._23CombinaciontresOctavos * calcs.areaNominal3Octavos +
      calcs._43CombinacionmediaPulgada * calcs.areaNominalUnMedio +
      calcs._53CombinacioncincoOctavos * calcs.areaNominalCincoOctavos +
      calcs._63CombinaciontresCuartos * calcs.areaNominalTresCuartos +
      calcs.areaNominalUnaPulgada * calcs._73CombinacionunaPulgada +
      calcs._83CombinacionunoYTresOctavos * calcs.areaNominalUnoYTresOctavos +
      calcs.areaNominal6mm * calcs._03CombinacionseisMilimetros +
      calcs.areaNominal8mm * calcs._13CombinacionochoMilimetros +
      calcs.areaNominal12mm * calcs._33CombinaciondoceMilimetros;
    calcs.areaAcumulada4Combinacion =
      calcs._24CombinaciontresOctavos * calcs.areaNominal3Octavos +
      calcs._44CombinacionmediaPulgada * calcs.areaNominalUnMedio +
      calcs._54CombinacioncincoOctavos * calcs.areaNominalCincoOctavos +
      calcs._64CombinaciontresCuartos * calcs.areaNominalTresCuartos +
      calcs.areaNominalUnaPulgada * calcs._74CombinacionunaPulgada +
      calcs._84CombinacionunoYTresOctavos * calcs.areaNominalUnoYTresOctavos +
      calcs.areaNominal6mm * calcs._04CombinacionseisMilimetros +
      calcs.areaNominal8mm * calcs._14CombinacionochoMilimetros +
      calcs.areaNominal12mm * calcs._34CombinaciondoceMilimetros;
    calcs.areaAcumulada5Combinacion =
      calcs._25CombinaciontresOctavos * calcs.areaNominal3Octavos +
      calcs._45CombinacionmediaPulgada * calcs.areaNominalUnMedio +
      calcs._55CombinacioncincoOctavos * calcs.areaNominalCincoOctavos +
      calcs._65CombinaciontresCuartos * calcs.areaNominalTresCuartos +
      calcs.areaNominalUnaPulgada * calcs._75CombinacionunaPulgada +
      calcs._85CombinacionunoYTresOctavos * calcs.areaNominalUnoYTresOctavos +
      calcs.areaNominal6mm * calcs._05CombinacionseisMilimetros +
      calcs.areaNominal8mm * calcs._15CombinacionochoMilimetros +
      calcs.areaNominal12mm * calcs._35CombinaciondoceMilimetros;
    calcs.areaAcumulada6Combinacion =
      calcs._26CombinaciontresOctavos * calcs.areaNominal3Octavos +
      calcs._46CombinacionmediaPulgada * calcs.areaNominalUnMedio +
      calcs._56CombinacioncincoOctavos * calcs.areaNominalCincoOctavos +
      calcs._66CombinaciontresCuartos * calcs.areaNominalTresCuartos +
      calcs.areaNominalUnaPulgada * calcs._76CombinacionunaPulgada +
      calcs._86CombinacionunoYTresOctavos * calcs.areaNominalUnoYTresOctavos +
      calcs.areaNominal6mm * calcs._06CombinacionseisMilimetros +
      calcs.areaNominal8mm * calcs._16CombinacionochoMilimetros +
      calcs.areaNominal12mm * calcs._36CombinaciondoceMilimetros;
    calcs.areaAcumulada7Combinacion =
      calcs._27CombinaciontresOctavos * calcs.areaNominal3Octavos +
      calcs._47CombinacionmediaPulgada * calcs.areaNominalUnMedio +
      calcs._57CombinacioncincoOctavos * calcs.areaNominalCincoOctavos +
      calcs._67CombinaciontresCuartos * calcs.areaNominalTresCuartos +
      calcs.areaNominalUnaPulgada * calcs._77CombinacionunaPulgada +
      calcs._87CombinacionunoYTresOctavos * calcs.areaNominalUnoYTresOctavos +
      calcs.areaNominal6mm * calcs._07CombinacionseisMilimetros +
      calcs.areaNominal8mm * calcs._17CombinacionochoMilimetros +
      calcs.areaNominal12mm * calcs._37CombinaciondoceMilimetros;
    calcs.areaAcumulada8Combinacion =
      calcs._28CombinaciontresOctavos * calcs.areaNominal3Octavos +
      calcs._48CombinacionmediaPulgada * calcs.areaNominalUnMedio +
      calcs._58CombinacioncincoOctavos * calcs.areaNominalCincoOctavos +
      calcs._68CombinaciontresCuartos * calcs.areaNominalTresCuartos +
      calcs.areaNominalUnaPulgada * calcs._78CombinacionunaPulgada +
      calcs._88CombinacionunoYTresOctavos * calcs.areaNominalUnoYTresOctavos +
      calcs.areaNominal6mm * calcs._08CombinacionseisMilimetros +
      calcs.areaNominal8mm * calcs._18CombinacionochoMilimetros +
      calcs.areaNominal12mm * calcs._38CombinaciondoceMilimetros;

    // SUMA
    calcs.total1 = calcs.cantidad1Diametro * calcs.cantidad1;
    calcs.total2 = calcs.cantidad2Diametro * calcs.cantidad2;
    calcs.total3 = calcs.cantidad3Diametro * calcs.cantidad3;
    calcs.total4 = calcs.cantidad4Diametro * calcs.cantidad4;

    // TOTAL
    calcs.sumaDistribucionDelAcero = calcs.total1 + calcs.total2 + calcs.total3 + calcs.total4;
  }

  updateCalcs(calcs, calcFormatters, calculate);
  document.querySelectorAll(".xlsx-calc").forEach((input) => {
    input.addEventListener("input", () => {
      updateCalcs(calcs, calcFormatters, calculate);
    });
  });
});
