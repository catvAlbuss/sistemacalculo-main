// import html2canvas from "html2canvas";
import "print-this";

$(document).ready(function () {
  $("#desingButton").click((e) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado del botón
    //variables generales
    const tabla = document.getElementById("desingcorte");
    tabla.style.display = "block";

    const fc = parseFloat(document.getElementById("fc").value);
    const fy = parseFloat(document.getElementById("fy").value);
    const altura = parseFloat(document.getElementById("altura").value);
    const base = parseFloat(document.getElementById("base").value);
    const momentoUltimo = parseFloat(document.getElementById("momentoultimo").value);
    const vu = parseFloat(document.getElementById("vucortante").value);
    const capas = parseFloat(document.getElementById("capas").value);
    var select = parseInt(document.getElementById("cuantias").value);

    //================================================================================//
    //                 Primera Tabla - Requisitos Entradas                            //
    //              Calcular el número total de columnas requeridas                   //
    //================================================================================//

    //****************************DATOS GENERALES*************************************//

    let parfre = 0;
    if (fc <= 280) {
      parfre = 0.85;
    } else if (fc > 280 && fc <= 560) {
      parfre = 1.05 - (0.714 * fc) / 1000;
    } else {
      parfre = 0.65;
    }

    const defultcs = parseFloat(0.003);
    const deffluacers = 0.0021;
    const facredfs = parseFloat(0.9);

    //================================================================================//
    //            Segunda Tabla - Diseño por Flexion Positivo Negativo                //
    //              Calcular el número total de columnas requeridas                   //
    //================================================================================//

    //negativo
    let d = 0;
    switch (capas) {
      case 1:
        d = altura - 6;
        break;
      case 2:
        d = altura - 9;
        break;
      case 3:
        d = altura - 12;
        break;
      default:
        d = altura;
    }

    var FR = 0.9;

    //altura del bloque
    var a = (
      d - Math.sqrt(Math.pow(d, 2) - (2 * Math.abs(momentoUltimo * Math.pow(10, 5))) / (0.9 * 0.85 * fc * base))
    ).toFixed(2);

    //refuerzo calculado
    var As = ((0.85 * fc * base * a) / fy).toFixed(2);

    //refuerzo minimo
    var As_min = Math.max(((0.7 * Math.sqrt(fc)) / fy) * base * d, (14 * base * d) / fy).toFixed(2);

    //as balanceado
    var As_bal = (((0.85 * parfre * fc) / fy) * (0.003 / (0.003 + 0.0021)) * base * d).toFixed(2);

    //refuero maximo As Max
    var As_max = (0.75 * (((0.85 * parfre * fc) / fy) * (0.003 / (0.003 + 0.0021))) * base * d).toFixed(2);

    //As Usar
    let As_usar = 0;
    if (parseFloat(As) < parseFloat(As_min)) {
      As_usar = parseFloat(As_min);
    } else if (parseFloat(As) > parseFloat(As_min) && parseFloat(As) < parseFloat(As_max)) {
      As_usar = parseFloat(As);
    } else {
      As_usar = parseFloat(As_max);
    }

    // console.log(As);
    // console.log(As_min);
    // console.log(As_usar);

    let template = `
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo de fluencia del acero</td>
                <td class='py-2 px-4'>fy</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${fy} kg/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo de comprension del concreto</td>
                <td class='py-2 px-4'>f'c</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${fc} kg/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Base de la Viga</td>
                <td class='py-2 px-4'>b</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${base} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Altura de la Viga</td>
                <td class='py-2 px-4'>h</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${altura} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Parámetro en función de la resistencia del concreto</td>
                <td class='py-2 px-4'>β1</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${parfre}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Deformación última del concreto</td>
                <td class='py-2 px-4'>εcu</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${defultcs}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Deformación de fluencia del acero</td>
                <td class='py-2 px-4'>εy</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${deffluacers}</td>
            </tr> 
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Factor de reducción a flexión sin carga axial</td>
                <td class='py-2 px-4'>Ф</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${facredfs}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Peralte efectivo</td>
                <td class='py-2 px-4'>d</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${d} cm</td>
            </tr>
            <tr>
                <td colspan="4" class='py-2 px-4'></td>
            </tr>
        `;

    document.getElementById("predimenension").innerHTML = template;

    calculateValoresexactos();
    function calculateValoresexactos() {
      var select = parseInt(document.getElementById("cuantias").value);
      let valoresexactos = 0;

      switch (parseInt(select)) {
        case 1:
          valoresexactos = (0.7 * Math.pow(fc, 0.5)) / fy;
          break;
        case 2:
          valoresexactos = (0.8 * Math.pow(fc, 0.5)) / fy;
          break;
        case 3:
          valoresexactos = 14 / fy;
          break;
        default:
          valoresexactos = 0;
          break;
      }

      document.getElementById("desingFlexion").innerHTML = "";
      // Reinicia el array valorFichass

      const alturas = parseFloat(altura);
      const baseado = parseFloat(base);
      let d = 0;
      switch (capas) {
        case 1:
          d = altura - 6;
          break;
        case 2:
          d = altura - 9;
          break;
        case 3:
          d = altura - 12;
          break;
        default:
          d = altura;
      }

      const mukg = momentoUltimo * 100000;
      const a = d - Math.pow(Math.pow(d, 2) - (2 * mukg) / (0.85 * 0.9 * fc * baseado), 0.5);
      var n = fc <= 280 ? 0 : (fy - 280) / 70;
      var b1 = fc <= 280 ? 0.85 : 0.85 - 0.05 * n;

      // Perform the calculation and round the result
      const areamin = valoresexactos * (baseado * d);
      const cuantiaminmmto = (areamin * 0.9 * fy * (d - a / 2)) / 100000;

      //===========rbalanceado===============//
      const cuantiaBalanceado = b1 * 0.85 * fc * (6000 / (6000 + fy) / fy);
      const cuantiaAreabal = cuantiaBalanceado * baseado * alturas;
      const cuantiabalmomentoultimo = (cuantiaAreabal * 0.9 * fy * (d - a / 2)) / 100000;
      //===========rmax===============//
      const cuantiamax = 0.75 * cuantiaBalanceado;
      const cuantiaareamax = cuantiamax * alturas * baseado;
      const cuantiaarmmultimo = (cuantiaareamax * 0.9 * fy * (d - a / 2)) / 100000;
      //===========reconomica===============//
      const cuantiaeccuantia = 0.5 * cuantiamax;
      const cuantiaecarea = cuantiaeccuantia * baseado * alturas;
      const cuantiaecmmultimo = (cuantiaecarea * 0.9 * fy * (d - a / 2)) / 100000;

      //===========As===============//
      const AAs = mukg / (0.9 * fy * (d - a / 2));

      //===========verf max===============//
      const verifmax = AAs < cuantiaareamax ? "OK" : "NO";

      //===========verf min===============//
      const verifmin = AAs > areamin ? "OK" : "NO";

      //===========As final===============//
      const Ascalc = Math.max(AAs, areamin);

      //===========momneto ultimo===============//
      const momentoUlt = (Ascalc * 0.9 * fy * (d - a / 2)) / 100000;

      const esEc = Ascalc <= cuantiaecarea ? "Si es economico" : "Es costoso";
      //==============================FORMULAS MATEMATICAS============================//
      const Acerominimo = "𝐴𝑠 𝑚𝑖𝑛 = \\frac{0.80\\sqrt{f'_c}}{f_y \\cdot b_d};\\frac{14}{f_y \\cdot b_d}";
      const AreaAceraBalanceado = "𝜌𝑏 = \\frac{0.85 * 𝛽_1 * 𝑓_𝑐}{f_y} * \\frac{𝜀_𝑐𝑢}{𝜀_𝑐𝑢+𝜀_𝑦}";
      const Aceromaximo = "𝐴𝑠 𝑚á𝑥 = 0.75 * (𝜌𝑏 * 𝑏 * d)";
      const Aceroeconomico = "𝐴𝑠_𝑚á𝑥/2 = cuantia	 * (𝑏 * h)";
      const momentoUltimoFormula1 = "𝑀𝑢= 𝐴𝑠 𝑚𝑖𝑛 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}";
      const momentoUltimoFormula2 = "𝑀𝑢= 𝜌𝑏 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}";
      const momentoUltimoFormula3 = "𝑀𝑢= 𝐴𝑠 𝑚á𝑥 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}";
      const momentoUltimoFormula4 = "𝑀𝑢= 𝐴𝑠 𝑚á𝑥/2 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}";
      const momentoUltimoFormula5 = "𝑀𝑢= 𝐴𝑠  * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}";

      const asceroUsar = "𝐴𝑠 = \\frac{0.85 * f_c * b *a}{f_y}";
      const cortanteconcreto = "𝑉𝑐 = 0.53 \\cdot fy \\cdot b \\cdot \\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}";
      const paracorteconcreto = "Ø𝑉𝑐 = 0.85 * 𝑉𝑐";
      const aporteAcero = "𝑉𝑠=\\frac{𝑉𝑢}{0.85-17}";
      const aporteAceromax = "𝑉𝑠 𝑚á𝑥= 2.1*f_y*b*\\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}";
      const aportemedio = "𝑉𝑠 𝑚𝑒𝑑= 1.1*f_y*b*\\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}";
      const apo = "a = d - \\sqrt{d^2 - \\frac{2|Mu|}{\\phi \\cdot 0.85 \\cdot f'_c \\cdot b}}";

      const math = "\\frac{1}{\\sqrt{x^2 + 1}}";

      // Genera la plantilla con los valores actualizados
      const nuevoTemplate = `
                <tbody>
                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <td colspan="4" class='text-xl py-2 px-4'><strong>2.1.- Cuantia minima</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia minima de la sección</td>
                        <td class='py-2 px-4'>Cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${valoresexactos.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero minimo</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚𝑖𝑛</td>
                        <td class='py-2 px-4'>\\(${Acerominimo}\\)</td>
                        <td class='py-2 px-4 text-center'>${areamin.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento ultimo del acero minimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${momentoUltimoFormula1}\\)</td>
                        <td class='py-2 px-4 text-center'>${cuantiaminmmto.toFixed(2)} tn/m </td>
                    </tr>
                    <!--===========================0Cuantia balanceado=========================================-->
                    
                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                        <td colspan="4" class="text-xl py-2 px-4"><strong>2.2.-Cuantia Balanceado</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia minima en la sección</td>
                        <td class='py-2 px-4'>Cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${cuantiaBalanceado.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero balanceado</td>
                        <td class='py-2 px-4'>𝜌𝑏</td>
                        <td class='py-2 px-4'>\\(${AreaAceraBalanceado}\\)</td>
                        <td class='py-2 px-4 text-center'>${cuantiaAreabal.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${momentoUltimoFormula2}\\)</td>
                        <td class='py-2 px-4 text-center'>${cuantiabalmomentoultimo.toFixed(2)} tn/m </td>
                    </tr>

                    <!--==================================rmax===============================-->
                    
                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                        <td colspan="4" class="text-xl py-2 px-4"><strong>2.3.-Cuantia máxima</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia máxima en la sección</td>
                        <td class='py-2 px-4'>Cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${cuantiamax.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero máximo</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥</td>
                        <td class='py-2 px-4'>\\(${Aceromaximo}\\)</td>
                        <td class='py-2 px-4 text-center'>${cuantiaareamax.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo del acero máximo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${momentoUltimoFormula3}\\)</td>
                        <td class='py-2 px-4 text-center'>${cuantiaarmmultimo.toFixed(2)} tn/m</td>
                    </tr>

                    <!--==================================reconomico===============================-->
                    
                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                        <td colspan="4" class="text-xl py-2 px-4"><strong>2.4.-Cuantia económico</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia económico</td>
                        <td class='py-2 px-4'>cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${cuantiaeccuantia.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero económico</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥/2</td> 
                        <td class='py-2 px-4'>\\(${Aceroeconomico}\\)</td>
                        <td class='py-2 px-4 text-center'>${cuantiaecarea.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${momentoUltimoFormula4}\\)</td>
                        <td class='py-2 px-4 text-center'>${cuantiaecmmultimo.toFixed(2)} tn/m</td>
                    </tr>
            `;
      document.getElementById("desingFlexion").innerHTML = nuevoTemplate;
      MathJax.typeset();

      let acerrefuerzo = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4'>𝑎</td>
                    <td class='py-2 px-4'>\\(${apo}\\)</td>
                    <td class='py-2 px-4 text-center'>${a.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Acero real</td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${asceroUsar}\\)</td>
                    <td class='py-2 px-4 text-center'>${AAs.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Verificacion 𝐴𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>\\(${Aceromaximo}\\)</td>
                    <td class='py-2 px-4 text-center'>${verifmax}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Verificacion 𝐴𝑠_𝑚𝑖𝑛</td>
                    <td class='py-2 px-4'>𝐴𝑠_𝑚𝑖𝑛</td>
                    <td class='py-2 px-4'>\\(${Aceromaximo}\\)</td>
                    <td class='py-2 px-4 text-center'>${verifmin}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Momento</td>
                    <td class='py-2 px-4'>𝑀𝑢'</td>
                    <td class='py-2 px-4'>\\(${momentoUltimoFormula5}\\)</td>
                    <td class='py-2 px-4 text-center'>${momentoUlt.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${asceroUsar}\\)</td>
                    <td class='py-2 px-4 text-center'>${Ascalc.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4 text-center'><strong>${esEc}</strong></td>
                </tr>
                <tr id="aceros"></tr>
                   
            `;

      for (let i = 0; i < 1; i++) {
        // Crear la fila para los selects
        let trSelect = document.createElement("tr");
        trSelect.className = "py-2 px-8 bg-gray-100 dark:bg-gray-600";

        // Agregar la etiqueta "Tipo de Acero"
        let tdTipoAcero = document.createElement("th");
        tdTipoAcero.textContent = "Tipo de Acero mm";
        tdTipoAcero.className = "py-2 px-8";
        trSelect.appendChild(tdTipoAcero);

        // Agregar la etiqueta "Diámetro mm"
        let tdDiametro = document.createElement("td");
        tdDiametro.textContent = ``;
        tdDiametro.className = "py-2 px-8";
        trSelect.appendChild(tdDiametro);

        let tdespacio = document.createElement("td");
        tdespacio.textContent = ``;
        tdespacio.className = "py-2 px-8";
        trSelect.appendChild(tdespacio);

        // Crear los selects para cada tramo
        // Crear un nuevo select
        let select = document.createElement("select");
        select.className =
          "acer-negativos form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md";
        select.name = `tipoAcero${i}_capa${i}`;
        select.id = `tipoAcero${i}_capa${i}`;

        // Definir las opciones del select
        let opciones = [
          { value: "0", text: 'Ø 0"' },
          { value: "0.283", text: "6mm" },
          { value: "0.503", text: "8mm cm²" },
          { value: "0.713", text: 'Ø 3/8" cm²' },
          { value: "1.131", text: "12mm cm²" },
          { value: "1.267", text: 'Ø 1/2" cm²' },
          { value: "1.979", text: 'Ø 5/8" cm²' },
          { value: "2.850", text: 'Ø 3/4" cm²' },
          { value: "5.067", text: 'Ø 1" cm²' },
          { value: "2.58", text: '2Ø1/2"' },
          { value: "3.87", text: '3Ø1/2"' },
          { value: "3.98", text: '2Ø5/8"' },
          { value: "5.16", text: '4Ø1/2"' },
          { value: "5.27", text: '2Ø5/8"+1Ø1/2"' },
          { value: "5.68", text: '2Ø3/4"' },
          { value: "5.97", text: '3Ø5/8"' },
          { value: "6.45", text: '5Ø1/2"' },
          { value: "6.56", text: '2Ø5/8"+2Ø1/2"' },
          { value: "6.97", text: '2Ø3/4"+1Ø1/2"' },
          { value: "7.67", text: '2Ø3/4"+1Ø5/8"' },
          { value: "7.74", text: '6Ø1/2"' },
          { value: "7.85", text: '2Ø5/8"+3Ø1/2"' },
          { value: "7.96", text: '4Ø5/8"' },
          { value: "8.26", text: '2Ø3/4"+2Ø1/2"' },
          { value: "8.52", text: '3Ø3/4"' },
          { value: "8.55", text: '3Ø5/8"+2Ø1/2"' },
          { value: "9.55", text: '2Ø3/4"+3Ø1/2"' },
          { value: "9.95", text: '5Ø5/8"' },
          { value: "9.66", text: '2Ø3/4"+2Ø5/8"' },
          { value: "10.2", text: '2Ø1"' },
          { value: "10.54", text: '4Ø5/8"+2Ø1/2"' },
          { value: "10.84", text: '2Ø3/4"+4Ø1/2"' },
          { value: "11.1", text: '3Ø3/4"+2Ø1/2"' },
          { value: "11.40", text: '4Ø3/4"' },
          { value: "11.65", text: '2Ø3/4"+3Ø5/8"' },
          { value: "11.94", text: '6Ø5/8"' },
          { value: "12.19", text: '2Ø1"+1Ø5/8"' },
          { value: "12.5", text: '3Ø3/4"+2Ø5/8"' },
          { value: "13.04", text: '2Ø1"+1Ø3/4"' },
          { value: "13.64", text: '2Ø3/4"+4Ø5/8"' },
          { value: "13.94", text: '4Ø3/4"+2Ø1/2"' },
          { value: "14.18", text: '2Ø1"+2Ø5/8"' },
          { value: "14.2", text: '5Ø3/4"' },
          { value: "15.3", text: '3Ø1"' },
          { value: "15.34", text: '4Ø3/4"+2Ø5/8"' },
          { value: "15.88", text: '2Ø1"+2Ø3/4"' },
          { value: "16.17", text: '2Ø1"+3Ø5/8"' },
          { value: "17.04", text: '6Ø3/4"' },
          { value: "18.16", text: '2Ø1"+4Ø5/8"' },
          { value: "18.72", text: '2Ø1"+3Ø3/4"' },
          { value: "19.28", text: '3Ø1"+2Ø5/8"' },
          { value: "20.4", text: '4Ø1"' },
          { value: "20.98", text: '3Ø1"+2Ø3/4"' },
          { value: "21.56", text: '2Ø1"+4Ø3/4"' },
          { value: "24.38", text: '4Ø1"+2Ø5/8"' },
          { value: "25.5", text: '5Ø1"' },
          { value: "26.08", text: '4Ø1"+2Ø3/4"' },
          { value: "30.6", text: '6Ø1"' },
        ];

        // Crear y agregar las opciones al select
        opciones.forEach((opcion) => {
          let option = document.createElement("option");
          option.value = opcion.value;
          option.textContent = opcion.text;
          select.appendChild(option);
        });

        // Agregar el select a la fila
        let tdSelect = document.createElement("td");
        tdSelect.appendChild(select);
        trSelect.appendChild(tdSelect);

        // Agregar la fila de selects al template
        acerrefuerzo += trSelect.outerHTML;
      }
      // Inserta el nuevo template en el elemento con el id 'calc_vigassa'
      document.getElementById("calcared").innerHTML = acerrefuerzo;
      MathJax.typeset();
      //=========================DISEÑO POR CORTE ==================================//

      const Vc = (0.53 * d * base * Math.pow(fc, 0.5)) / 1000;
      const asVc = 0.85 * Vc;
      const verifEstribo = asVc < vu ? "Para controlar el cortante" : "Por proceso constructivo";
      const Vs = vu / 0.85 - Vc;

      const Vsmax = (2.1 * d * base * Math.pow(fc, 0.5)) / 1000;
      const Vsmed = (1.1 * d * base * Math.pow(fc, 0.5)) / 1000;

      const verfCortante = Vs < Vsmed ? "Si" : "No";

      let templatecortes = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Peralte efectivo</td>
                    <td class='py-2 px-4'>𝑑</td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4 text-center'>${d} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Cortante ultimo</td>
                    <td class='py-2 px-4'>𝑉𝑢</td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4 text-center'>${vu} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Cortante del concreto</td>
                    <td class='py-2 px-4'>𝑉𝑐</td>
                    <td class='py-2 px-4'>\\(${cortanteconcreto}\\)</td>
                    <td class='py-2 px-4 text-center'>${Vc.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'>Ø𝑉𝑐</td>
                    <td class='py-2 px-4'>\\(${paracorteconcreto}\\)</td>
                    <td class='py-2 px-4 text-center'>${asVc.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Usar estribo</td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${asceroUsar}\\)</td>
                    <td class='py-2 px-4 text-center'>${verifEstribo}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠</td>
                    <td class='py-2 px-4'>\\(${aporteAcero}\\)</td>
                    <td class='py-2 px-4 text-center'>${Vs.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>\\(${aporteAceromax}\\)</td>
                    <td class='py-2 px-4 text-center'>${Vsmax.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠_𝑚𝑒𝑑</td>
                    <td class='py-2 px-4'>\\(${aportemedio}\\)</td>
                    <td class='py-2 px-4 text-center'>${Vsmed.toFixed(2)} tn</td>
                </tr>
                
                <tr id="aceros"></tr>
            `;

      document.getElementById("diseñoCortes").innerHTML = templatecortes;
      MathJax.typeset();
    }
    //select.addEventListener('change', calculateValoresexactos);
    // Función para manejar el cambio de selección

    function handleSelectChange(e) {
      if (e.target.tagName.toLowerCase() === "select") {
        //console.log(`El valor seleccionado para ${e.target.name} es ${e.target.value}`);

        const fc = parseFloat(document.getElementById("fc").value);
        const fy = parseFloat(document.getElementById("fy").value);
        const altura = parseFloat(document.getElementById("altura").value);
        const base = parseFloat(document.getElementById("base").value);
        const momentoUltimo = parseFloat(document.getElementById("momentoultimo").value);
        const capas = parseFloat(document.getElementById("capas").value);
        const vu = parseFloat(document.getElementById("vucortante").value);
        let d = 0;
        switch (capas) {
          case 1:
            d = altura - 6;
            break;
          case 2:
            d = altura - 9;
            break;
          case 3:
            d = altura - 12;
            break;
          default:
            d = altura;
        }

        var select = parseInt(document.getElementById("cuantias").value);
        let valoresexactos = 0;

        switch (parseInt(select)) {
          case 1:
            valoresexactos = (0.7 * Math.pow(fc, 0.5)) / fy;
            break;
          case 2:
            valoresexactos = (0.8 * Math.pow(fc, 0.5)) / fy;
            break;
          case 3:
            valoresexactos = 14 / fy;
            break;
          default:
            valoresexactos = 0;
            break;
        }

        const mukg = momentoUltimo * 100000;
        const a = d - Math.pow(Math.pow(d, 2) - (2 * mukg) / (0.85 * 0.9 * fc * base), 0.5);
        const areamin = valoresexactos * (base * d);
        //===========As===============//
        const AAs = mukg / (0.9 * fy * (d - a / 2));
        //===========verf min===============//
        const verifmin = AAs > areamin ? "OK" : "NO";

        //===========As final===============//
        const Ascalc = Math.max(AAs, areamin);

        const Vc = (0.53 * d * base * Math.pow(fc, 0.5)) / 1000;
        const asVc = 0.85 * Vc;
        const verifEstribo = asVc < vu ? "Para controlar el cortante" : "Por proceso constructivo";

        const Vs = vu / 0.85 - Vc;

        const Vsmax = (2.1 * d * base * Math.pow(fc, 0.5)) / 1000;
        const Vsmed = (1.1 * d * base * Math.pow(fc, 0.5)) / 1000;

        const verfCortante = Vs < Vsmed ? "Si" : "No";

        // Create the table header row
        let templateacers = "";
        // Iterate through tramos and layers
        for (let i = 0; i < 1; i++) {
          // Create the table row for the current tramo
          const selectElement = document.getElementById(`tipoAcero${i}_capa${i}`);
          let value = "-"; // Placeholder value
          if (selectElement) {
            value = selectElement.value;
          }

          const s1 = Math.abs((2 * value * fy * d) / (Vs * 1000));
          const s2 = verfCortante == "Si" ? 60 : 30;
          const s3 = verfCortante == "Si" ? d / 2 : d / 4;
          const s4 = 10;
          const smin = Math.min(s1, s2, s3, s4);
          const verfround = Math.round(smin);
          const longEstri = Math.round(2 * (altura / 10));
          const acersfinal = `1 @ 0.05 ${longEstri} @ ${verfround},RESTO @  20`;

          const verfCumple = value >= Ascalc ? "Cumple" : "No cumple";

          templateacers += `
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Acero a usar</td>
                            <td class='py-2 px-4'>𝐴𝑠</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${value} cm<sup>2</sup></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>verificacion</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4'>as_usar > As </td>
                            <td class='py-2 px-4 text-center'><strong>${verfCumple}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4" class='py-2 px-4'></td>
                        </tr>
                    `;

          document.getElementById("acerosfinales").innerHTML = templateacers;
          MathJax.typeset();
          let templatecorte = "";
          templatecorte = `
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆1</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${s1.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆2</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${s2.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆3</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${s3.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆4</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${s4.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>S minimo</td>
                            <td class='py-2 px-4'>𝑆</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${smin.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Redondeado</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${verfround.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Longitud a estribar</td>
                            <td class='py-2 px-4'>𝑙</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${longEstri.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Longitud a estribar</td>
                            <td class='py-2 px-4'>𝑙</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center' contenteditable="true">${acersfinal} cm</td>
                        </tr>
                    `;
          document.getElementById("aceroscortes").innerHTML = templatecorte;
          MathJax.typeset();
        }
      }
    }

    // Agregar un evento 'change' al elemento padre
    document.getElementById("calcared").addEventListener("change", handleSelectChange);
    MathJax.typeset();
  });

  document.getElementById("btn_pdf_predim").addEventListener("click", function () {
    // Selecciona el div que quieres imprimir
    $("#vigasgn").printThis({
      debug: false, // Mostrar la ventana de depuración
      importCSS: true, // Importar estilos CSS
      importStyle: true, // Importar estilos directamente desde las etiquetas <style>
      loadCSS: "", // Ruta al CSS adicional si lo necesitas
      pageTitle: "Vigas GN", // Título de la página impresa
      removeInline: false, // No eliminar los estilos en línea
      printDelay: 333, // Añadir un pequeño retraso antes de la impresión
      header: null, // HTML que aparecerá como encabezado en la impresión
      footer: null, // HTML que aparecerá como pie de página en la impresión
      base: false, // Usar la URL base para las rutas
      formValues: true, // Conservar los valores de los formularios
      canvas: false, // Incluir el contenido de los canvas
      doctypeString: "<!DOCTYPE html>", // Doctype de la impresión
      removeScripts: false, // No eliminar las etiquetas <script>
      copyTagClasses: false, // No copiar las clases de las etiquetas HTML
    });
  });
  // // INTENTO CON html2canvas
  // document.getElementById("btn_captura_resultado").addEventListener("click", async () => {

  //   const contenedor = document.getElementById("desingcorte");
  //   const preview = document.getElementById("previewCaptura");
  //   const inputFile = document.getElementById("inputImagenCap4");

  //   try {

  //     // Esperar a que MathJax termine
  //     if (window.MathJax) {
  //       await MathJax.typesetPromise();
  //     }

  //     const canvas = await html2canvas(contenedor, {
  //       scale: 3, // calidad alta
  //       useCORS: true,
  //       backgroundColor: "#ffffff",
  //       logging: false,
  //       scrollX: 0,
  //       // scrollY: -window.scrollY,
  //       onclone: function (clonedDoc) {
  //         clonedDoc.querySelectorAll("mjx-assistive-mml, .MJX_Assistive_MathML, .MathJax_Preview").forEach((el) => {
  //           el.remove();
  //         });
  //       }
  //     });

  //     const dataURL = canvas.toDataURL("image/png");

  //     preview.src = dataURL;
  //     preview.classList.remove("hidden");

  //     // convertir a archivo
  //     const response = await fetch(dataURL);
  //     const blob = await response.blob();

  //     const file = new File([blob], "resultado_viga.png", {
  //       type: "image/png"
  //     });

  //     const dataTransfer = new DataTransfer();
  //     dataTransfer.items.add(file);

  //     inputFile.files = dataTransfer.files;

  //     console.log("Imagen generada correctamente");

  //   } catch (error) {
  //     console.error(error);
  //   }

  // });

//   const btnCaptura = document.getElementById("btn_captura_resultado");

// const clonarConValores = (node) => {
//   const clone = node.cloneNode(true);
//   const originales = node.querySelectorAll("input, select, textarea");
//   const clonados = clone.querySelectorAll("input, select, textarea");

//   originales.forEach((campo, i) => {
//     const c = clonados[i];
//     if (!c) return;

//     if (campo.tagName === "INPUT") {
//       const tipo = (campo.type || "").toLowerCase();
//       if (tipo === "checkbox" || tipo === "radio") {
//         campo.checked ? c.setAttribute("checked", "checked") : c.removeAttribute("checked");
//       } else {
//         c.value = campo.value;
//         c.setAttribute("value", campo.value);
//       }
//     }

//     if (campo.tagName === "TEXTAREA") {
//       c.value = campo.value;
//       c.textContent = campo.value;
//     }

//     if (campo.tagName === "SELECT") {
//       c.value = campo.value;
//       [...c.options].forEach((opt) => {
//         opt.selected = opt.value === campo.value;
//         opt.selected ? opt.setAttribute("selected", "selected") : opt.removeAttribute("selected");
//       });
//     }
//   });

//   return clone;
// };

// const descargarBlob = (blob, nombre) => {
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = nombre;
//   a.click();
//   URL.revokeObjectURL(url);
// };

// const blobAImagen = (blob) =>
//   new Promise((resolve, reject) => {
//     const url = URL.createObjectURL(blob);
//     const img = new Image();
//     img.onload = () => {
//       URL.revokeObjectURL(url);
//       resolve(img);
//     };
//     img.onerror = reject;
//     img.src = url;
//   });

// const descargarEnPartes = async (blob, nombreBase, partes = 2) => {
//   const img = await blobAImagen(blob);

//   const ancho = img.width;
//   const altoTotal = img.height;
//   const altoParte = Math.ceil(altoTotal / partes);
//   const margen = 100; // evita cortes justo en textos

//   for (let i = 0; i < partes; i++) {
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");

//     const origenY = Math.max(0, i * altoParte - (i === 0 ? 0 : margen));
//     const altoReal = Math.min(altoParte + (i === 0 ? 0 : margen), altoTotal - origenY);

//     canvas.width = ancho;
//     canvas.height = altoReal;

//     ctx.drawImage(
//       img,
//       0, origenY,
//       ancho, altoReal,
//       0, 0,
//       ancho, altoReal
//     );

//     const parteBlob = await new Promise((resolve) =>
//       canvas.toBlob(resolve, "image/png")
//     );

//     descargarBlob(parteBlob, `${nombreBase}_Parte_${i + 1}.png`);
//   }
// };

// btnCaptura.addEventListener("click", async () => {
//   const textoOriginal = btnCaptura.textContent;

//   try {
//     const node = document.getElementById("vigasgn");

//     if (!node || !node.innerHTML.trim()) {
//       alert("Primero debes generar los resultados.");
//       return;
//     }

//     btnCaptura.disabled = true;
//     btnCaptura.textContent = "Generando...";

//     const clone = clonarConValores(node);

//     const payload = {
//       html: clone.outerHTML,
//       stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')]
//         .map((l) => l.href)
//         .filter(Boolean),
//       inlineStyles: [...document.querySelectorAll("style")]
//         .map((s) => s.outerHTML)
//         .join("\n"),
//     };

//     const response = await fetch("/capturar-viga-fragmento", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
//         "Accept": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("STATUS:", response.status);
//       console.error("RESPUESTA:", errorText);
//       throw new Error(`Error ${response.status} al generar la imagen.`);
//     }

//     const blob = await response.blob();
//     await descargarEnPartes(blob, "Diseño_vigas", 2);

//   } catch (error) {
//     console.error("Error en captura:", error);
//     alert(error.message || "Error al generar la imagen.");
//   } finally {
//     btnCaptura.disabled = false;
//     btnCaptura.textContent = textoOriginal;
//   }
// });


  // INTENTO CON Puppeteer
  const btnCaptura = document.getElementById("btn_captura_resultado");

  /* ================================
     CLONAR DOM CON VALORES REALES
  ================================ */
  function clonarConValoresFormulario(node) {
    const clone = node.cloneNode(true);

    const originalFields = node.querySelectorAll("input, select, textarea");
    const clonedFields = clone.querySelectorAll("input, select, textarea");

    originalFields.forEach((field, index) => {
      const clonedField = clonedFields[index];
      if (!clonedField) return;

      // INPUT
      if (field.tagName === "INPUT") {
        const type = (field.type || "").toLowerCase();

        if (type === "checkbox" || type === "radio") {
          if (field.checked) {
            clonedField.setAttribute("checked", "checked");
          } else {
            clonedField.removeAttribute("checked");
          }
        } else {
          clonedField.setAttribute("value", field.value);
          clonedField.value = field.value;
        }
      }

      // TEXTAREA
      if (field.tagName === "TEXTAREA") {
        clonedField.value = field.value;
        clonedField.textContent = field.value;
      }

      // SELECT (IMPORTANTE 🔥)
      if (field.tagName === "SELECT") {
        clonedField.value = field.value;

        Array.from(clonedField.options).forEach((option) => {
          if (option.value === field.value) {
            option.setAttribute("selected", "selected");
            option.selected = true;
          } else {
            option.removeAttribute("selected");
            option.selected = false;
          }
        });
      }
    });

    return clone;
  }

  /* ================================
     GENERAR NOMBRE DE ARCHIVO
  ================================ */
  function generarNombreCaptura() {
    const ahora = new Date();

    const fecha = [
      ahora.getFullYear(),
      String(ahora.getMonth() + 1).padStart(2, "0"),
      String(ahora.getDate()).padStart(2, "0"),
    ].join("-");

    const hora = [
      String(ahora.getHours()).padStart(2, "0"),
      String(ahora.getMinutes()).padStart(2, "0"),
      String(ahora.getSeconds()).padStart(2, "0"),
    ].join("-");

    return `resultado_viga_${fecha}_${hora}.png`;
  }

  /* ================================
     DESCARGAR ARCHIVO
  ================================ */
  function descargarBlob(blob, nombreArchivo) {
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  }

  /* ================================
     EVENTO PRINCIPAL
  ================================ */
  btnCaptura.addEventListener("click", async () => {
    const textoOriginal = btnCaptura.textContent;

    try {
      const node = document.getElementById("vigasgn");

      if (!node || node.innerHTML.trim() === "") {
        alert("Primero debes generar los resultados.");
        return;
      }

      btnCaptura.disabled = true;
      btnCaptura.textContent = "Generando...";

      // 🔥 CLON CON VALORES REALES
      const clone = clonarConValoresFormulario(node);

      const stylesheets = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]'),
        (link) => link.href
      ).filter(Boolean);

      const inlineStyles = Array.from(
        document.querySelectorAll("style"),
        (style) => style.outerHTML
      ).join("\n");

      const payload = {
        html: clone.outerHTML,
        stylesheets,
        inlineStyles,
      };

      const response = await fetch("/capturar-viga-fragmento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content"),
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("STATUS:", response.status);
        console.error("RESPUESTA:", errorText);
        throw new Error(`Error ${response.status} al generar la imagen.`);
      }

      const blob = await response.blob();
      descargarBlob(blob, generarNombreCaptura());

    } catch (error) {
      console.error("Error en captura:", error);
      alert(error.message || "Error al generar la imagen.");
    } finally {
      btnCaptura.disabled = false;
      btnCaptura.textContent = textoOriginal;
    }
  });

});


