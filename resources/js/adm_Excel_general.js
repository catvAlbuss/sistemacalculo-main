$(document).ready(function () {
    $("#desingButton").click((e) => {
        e.preventDefault(); // Prevenir el comportamiento predeterminado del botón
        //variables generales
        const tabla = {
            A: {
                Eprom: 130000,
                fm: 210,
                fc: 145,
                fct: 40,
                fv: 15,
                ft: 145,
            },

            B: {
                Eprom: 100000,
                fm: 150,
                fc: 110,
                fct: 28,
                fv: 12,
                ft: 105,
            },
            C: {
                Eprom: 90000,
                fm: 100,
                fc: 80,
                fct: 15,
                fv: 8,
                ft: 75,
            },
        };
        const selectabc = document.getElementById("selectabc").value;
        const fcprime = parseFloat(document.getElementById("fcprime").value);
        const fy = parseFloat(document.getElementById("fy").value);
        const base = parseFloat(document.getElementById("base").value);
        const altura = parseFloat(document.getElementById("altura").value);
        const momentoultimo = parseFloat(
            document.getElementById("momentoultimo").value
        );
        const vucortante = parseFloat(
            document.getElementById("vucortante").value
        );
        const cieloraso = parseFloat(
            document.getElementById("cieloraso").value
        );
        const sobrecarga = parseFloat(
            document.getElementById("sobrecarga").value
        );
        // ========================PROPIEDADES DE TIPO DE MADERA===============
        const Emin = tabla[selectabc].Eprom;
        const fm = tabla[selectabc].fm;
        const fc = tabla[selectabc].fc;
        const fct = tabla[selectabc].fct;
        const fv = tabla[selectabc].fv;
        const ft = tabla[selectabc].ft;
        document.getElementById("predimenension").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Modulo de elasticidad</td>
            <td class='py-2 px-4'>Emin</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Emin} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible a flexion</td>
            <td class='py-2 px-4'>fm</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${fm} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible a la compresion</td>
            <td class='py-2 px-4'>fc</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${fc} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible compresion perpendicular a las fiestas </td>
            <td class='py-2 px-4'>fc┴</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${fct} kg/cm<sup>2</sup></td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible al corte paralelo</td>
            <td class='py-2 px-4'>fv</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${fv} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>ft</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${ft} kg/cm<sup>2</sup></td>
        </tr>`;
        // ========================DIMENSIONAMIENTO===============
        const b = fcprime * 2.54;
        const h = fy * 2.54;
        document.getElementById("dimensionamiento").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>a</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${b} cm</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>b</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${h} cm</td>
        </tr>
         `;
        // ========================COMBINACION DE CARGAS===============
        const CM = momentoultimo + vucortante + cieloraso;
        const CV = sobrecarga;
        const CMCV = CM + CV;
        const W = CMCV * altura;
        document.getElementById("combinaciondecargas").innerHTML = `
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>CM</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CM} kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>CV</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CV} kg/m<sup>2</sup></td>
        </tr>

        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>CM+CV</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CMCV} kg/m<sup>2</sup></td>
       </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>W</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${W} kg/m</td>
       </tr>
       `;
        // ========================ANALISIS ESTRUCTURAL===============
        const momento = (W * base * base) / 8;
        const cortante = (W * base) / 2;
        // FORMULAS SOLO PARA PARTE VISUAL
        const FORMULAR = `R=\\frac{W \\cdot L}{2}`;
        const FORMULAM = `R=\\frac{W \\cdot L^2}{8}`;

        const analisisdeestrucutra = `
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>W</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${W.toFixed(2)} kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>R</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'> \\(${FORMULAR}\\)</td>
            <td class='py-2 px-4 text-center'>${cortante.toFixed(2)} kg</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>M</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'>\\(${FORMULAM}\\)</td>
            <td class='py-2 px-4 text-center'>${momento.toFixed(2)} kg-m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>R</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${cortante.toFixed(2)} kg</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Momento</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${momento.toFixed(2)} kg-m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Cortante</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${cortante.toFixed(2)} kg</td>
        </tr>
        `;
        document.getElementById("analisisestructural").innerHTML =
            analisisdeestrucutra;
        MathJax.typeset();
        //  ======================DISEÑO DE MADERA 4.1 =====================
        document.getElementById("desingFlexion").innerHTML = ` `;
        const nosale = fm + 0.1 * fm;
        const Zrequerido = (momento * 100) / nosale;
        const Z = (b * h * h) / 6;
        let ZZreqCUMPLE;
        if (Z > Zrequerido) {
            ZZreqCUMPLE = "CUMPLE";
        } else {
            ZZreqCUMPLE = "NO";
        }
        // <tr class="bg-gray-100 dark:bg-gray-600">
        //     <td class='py-2 px-8' colspan="4">
        //         <canvas style=" border: 1px solid black text-center" id="figura01" width="865" height="260"></canvas>
        //     </td>
        // </tr>
        document.getElementById("modulo41").innerHTML = `
        
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>1.1fm</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${nosale.toFixed(
                2
            )} kg/cm<sup>2</sup>></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>Zrequerido</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Zrequerido.toFixed(
                2
            )} kg/cm<sup>3</sup>></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>Z</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Z.toFixed(
                2
            )} kg/cm<sup>3</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-8'>Z>Zreq</td>
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-8'>${ZZreqCUMPLE}</td>     
        </tr>
        `;

        let imagen=`
        <tr>
            <td colspan="4" class='py-2 px-4'></td>
        </tr>
        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
             <td colspan="4" class="text-xl py-2 px-4"><strong>Modulo.</strong></td>
        </tr>     
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8' colspan="4">
                <canvas style=" border: 1px solid black text-center" id="figura01" width="865" height="260"></canvas>
            </td>
        </tr>`;
        document.getElementById("imagen01").innerHTML = imagen;

        const canvas = document.getElementById("figura01");
        const ctx = canvas.getContext("2d");

        // Dibuja la base del puente
        ctx.fillStyle = "black";
        ctx.fillRect(50, 100, 700, 20);

        // Dibuja los rectángulos pequeños en la parte superior
        for (let i = 0; i < 14; i++) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(50 + i * 50, 60, 50, 40);
        }

        // Dibuja los soportes triangulares
        ctx.beginPath();
        ctx.moveTo(50, 120);
        ctx.lineTo(20, 200);
        ctx.lineTo(80, 200);
        ctx.closePath();
        ctx.fillStyle = "black";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(750, 120);
        ctx.lineTo(720, 200);
        ctx.lineTo(780, 200);
        ctx.closePath();
        ctx.fill();

        // Dibuja la base rectangular de los soportes
        ctx.fillStyle = "grey";
        ctx.fillRect(20, 200, 60, 10);
        ctx.fillRect(720, 200, 60, 10);

        // Dibuja el cable curvado en la parte inferior
        ctx.beginPath();
        ctx.strokeStyle = "#005f6b"; // Color similar al del cable en la imagen
        ctx.lineWidth = 4;
        ctx.moveTo(50, 120);
        ctx.quadraticCurveTo(400, 200, 750, 120);
        ctx.stroke();
        // ==================VERIFICACION DE INERCIAS===============
        const W01 = 1.8 * CM * altura + CV * altura;
        const W02 = CV * altura;
        const K1 = 250;
        const L1 = (5 * W01 * base * base * base * K1) / (0.0384 * Emin);
        const K2 = 350;
        const L2 = (5 * W02 * base * base * base * K2) / (0.0384 * Emin);
        const Imax = Math.max(L1, L2);
        const L3 = (b * h * h * h) / 12;
        let Imax02;

        if (L3 > Imax) {
            Imax02 = "CUMPLE";
        } else {
            Imax02 = "NO";
        }
        // SOLO FORMULAS PARA LAS TABLAS
        const mathExpression = `I >\\frac{5 \\cdot wL^3 k}{384 \\cdot E}`;

        const prueba = `
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>(solo calculo de flecciones)</td>
            <td class='py-2 px-4'>W<sub>equivalente</sub></td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${fy.toFixed(
                2
            )} 1.8W<sub>d</sub>+W<sub>1</sub></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'> \\(${mathExpression}\\)  </td>
            <td class='py-2 px-4'>W<sub>e</sub>1</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${W01.toFixed(2)} kg/m</td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>W<sub></sub>2</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${W02.toFixed(2)} kg/m</td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>PARA LA CARGAR TOTAL</td>
            <td class='py-2 px-4'>K</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${K1.toFixed(2)} </td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>I</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${L1.toFixed(2)} </td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>PARA LA SOBRECARGA</td>
            <td class='py-2 px-4'>K</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${K2.toFixed(2)} </td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>I</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${L2.toFixed(2)} </td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>Imax</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Imax.toFixed(
                2
            )} cm<sup>4</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>I</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${L3.toFixed(
                2
            )} cm<sup>4</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>|>|max</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Imax02}</td>
        </tr>     
        `;
        document.getElementById("modulo42").innerHTML = prueba;
        MathJax.typeset();

        // ==================CVERIFICACION DEL ESFUERZO CORTANTE===============
        const VH = cortante - (W * h) / 100;
        const V = cortante;
        const fv11 = fv + 0.1 * fv;
        const th = (3 * VH) / (2 * b * h);
        let fvt;
        if (fv11 > th) {
            fvt = "CUMPLE";
        } else {
            fvt = "NO";
        }
        const t = (3 * cortante) / (2 * b * h);
        let fvt02;
        if (fv11 > t) {
            fvt02 = "CUMPLE";
        } else {
            fvt02 = "NO";
        }
        document.getElementById("modulo43").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>V<sub>(h)</sub></td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${VH.toFixed(2)} Kg</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>V</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${V.toFixed(2)} Kg</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>1.1fv</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${fv11.toFixed(
                2
            )} Kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>t<sub>(h)</sub></td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${th.toFixed(
                2
            )} Kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>1.1fv>t<sub>h</sub></sub></td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${fvt}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>t</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${t.toFixed(
                2
            )} Kg/cm<sup>2</sup></td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>-</sub></td>
            <td class='py-2 px-4'>1.1fv>t</td>
            <td class='py-2 px-4 text-center'>${fvt02}</td>
        </tr>
        `;
        // ==================VERIFICACION  DE LA ESTABILIDAD LATERAL===============
        const hb = h / b;
        document.getElementById("modulo44").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>h/b</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${hb.toFixed(2)}</td>
        </tr>`;
        // ==================CALCULO DE LONGITUD DE APOYO 4.5 ===============
        const a = cortante / (fct * b);
        // FORMULA SOLO PARA PARTE VISUAL
        const CALCULOa = `a >\\frac{R}{\\cdot bf_c}`;
        const CALCULODELONGITUDAPOYO = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>a</td>
            <td class='py-2 px-4'>\\(${CALCULOa}\\)</td>
            <td class='py-2 px-4 text-center'>${a.toFixed(2)} cm</td>
        </tr>
        `;
        document.getElementById("modulo45").innerHTML = CALCULODELONGITUDAPOYO;
        MathJax.typeset();
        // document.getElementById("modulo45").innerHTML = prueba;
        // MathJax.typeset();

        let imagenultimo1=`
        <tr>
            <td colspan="4" class='py-2 px-4'></td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8' colspan="4">
                    <img src="../views/layouts/imagen2.jpg" height="200" alt="Descripción de la imagen" style="border: 1px solid black;">
            </td>
        </tr>`;
        document.getElementById("imagen02").innerHTML = imagenultimo1;
    });
});
