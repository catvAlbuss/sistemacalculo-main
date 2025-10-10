document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const calcFormatters = {};

  const calcs = {};

  function calculate() {
    calcs.emin = parseFloat(document.querySelector("input#emin").value);
    calcs.diametro = parseFloat(document.querySelector("input#diametro").value);
    calcs.cargaActuante = parseFloat(document.querySelector("input#cargaActuante").value);
    calcs.espesorDeLaCartela = parseFloat(document.querySelector("input#espesorDeLaCartela").value);
    calcs.espesorDeLaMaderaAUnir = parseFloat(document.querySelector("input#espesorDeLaMaderaAUnir").value);
    calcs.cargaAdmisiblePorPernoD = parseFloat(document.querySelector("input#cargaAdmisiblePorPernoD").value);
    calcs.cargaAdmisiblePorPernoP = parseFloat(document.querySelector("input#cargaAdmisiblePorPernoP").value);
    calcs.seTomo4d = parseFloat(document.querySelector("input#seTomo4d").value);
    calcs.seTomo5d = parseFloat(document.querySelector("input#seTomo5d").value);
    calcs.seTomo2d1 = parseFloat(document.querySelector("input#seTomo2d1").value);
    calcs.seTomo2d2 = parseFloat(document.querySelector("input#seTomo2d2").value);

    // carga admisible por pernos
    calcs.espesorDeElementoCentral = calcs.espesorDeLaMaderaAUnir * 2.54;
    calcs.espesorDeElementosLaterales = 2 * calcs.espesorDeLaCartela * 2.54;
    calcs.porLoTantoConsideramosElMenorValorL = Math.min(calcs.espesorDeElementoCentral, calcs.espesorDeElementosLaterales);
    calcs.menorValorDeL = calcs.porLoTantoConsideramosElMenorValorL;
    calcs.cargaAdmisiblePorPernold = calcs.menorValorDeL / (calcs.cargaAdmisiblePorPernoD * 2.54);
    calcs.cargaAdmisiblePorPernoGrupo = calcs.grupo;

    // numero de pernos
    calcs.numeroDePernosFP = calcs.cargaActuante / calcs.cargaAdmisiblePorPernoP;
    calcs.numeroDePernos = calcs.numeroDePernosFP;

    // ubicacion de los pernos
    calcs.aLoLargoDelGrano4d = 4 * calcs.diametro * 25.4;
    calcs.aLoLargoDelGrano5d = 5 * calcs.diametro * 25.4;
    calcs.perpendicularALaDireccionDelGrano2d1 = 2 * calcs.diametro * 25.4;
    calcs.perpendicularALaDireccionDelGrano2d2 = 2 * calcs.diametro * 25.4;

    Object.entries(calcs).forEach(([id, value]) => {
      document
        .getElementById("resultados")
        .querySelectorAll("#" + id + ":not(select,input)")
        .forEach((calc) => {
          if (calcFormatters[id]) {
            calc.textContent = calcFormatters[id](value);
          } else {
            calc.textContent = isNaN(value) ? value : Number.isInteger(value) ? value : value.toFixed(2);
          }
        });
    });
  }

  calculate();
  document.getElementById("calcular").addEventListener("click", () => {
    calculate();
  });
});
