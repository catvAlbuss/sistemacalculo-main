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
        const base = parseFloat(document.getElementById("base").value);
        const altura = parseFloat(document.getElementById("altura").value);
        const L = parseFloat(document.getElementById("luz").value);
        const momentoultimo = parseFloat(document.getElementById("momentoultimo").value);
        const vucortante = parseFloat(document.getElementById("vucortante").value);
        const DCM = parseFloat(document.getElementById("DCM").value);
        const DCV = parseFloat(document.getElementById("DCV").value);


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
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${fct} kg/cm<sup>2</sup></td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible al corte paralelo</td>
            <td class='py-2 px-4'>fv</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${fv} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>ft</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${ft} kg/cm<sup>2</sup></td>
        </tr>`;

        const b = base * 2.54;
        const h = altura * 2.54;

        document.getElementById("dimensionamiento").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Base del elemento</td>
            <td class='py-2 px-4'>b</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${b} cm</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Altura del elemento</td>
            <td class='py-2 px-4'>h</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${h} cm</td>
        </tr>
         `;


        const momento = momentoultimo;
        const cortante = vucortante;



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

        document.getElementById("modulo41").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfeurzo a flexion admisible</td>
            <td class='py-2 px-4'>1.1fm</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${nosale.toFixed(2)} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Modulo de seccion requerido</td>
            <td class='py-2 px-4'>Zrequerido</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Zrequerido.toFixed(2)} kg/cm<sup>3</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Modulo de seccion dispuesto</td>
            <td class='py-2 px-4'>Z</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Z.toFixed(2)} kg/cm<sup>3</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'></td>
            <td class='py-2 px-8'></td>
            <td class='py-2 px-8'>Z>Zreq</td>
            <td class='py-2 px-8'>${ZZreqCUMPLE}</td>     
        </tr>
        `;





        const fv11 = fv+0.1*fv;
        const t = 3*cortante/(2*b*h);
        let fvt02;
        if ( fv11 > t ){
            fvt02= "CUMPLE";
        }else{
            fvt02="NO";
        }

        document.getElementById("modulo43").innerHTML = `

        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo a cortante admisible</td>
            <td class='py-2 px-4'>1.1fv</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${fv11.toFixed(2)} Kg/cm<sup>2</sup></td>
        </tr>


        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo a cortante requerido</td>
            <td class='py-2 px-4'>t</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${t.toFixed(2)} Kg/cm<sup>2</sup></td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'></td>
            <td class='py-2 px-4'></sub></td>
            <td class='py-2 px-4'>1.1fv>t</td>
            <td class='py-2 px-4 text-center'>${fvt02}</td>
        </tr>
        `;















        const Imax = L/250;
        const L3 = DCM+DCV
        let Imax02;

        if (L3 < Imax) {
            Imax02 = "CUMPLE";
        } else {
            Imax02 = "NO";
        }

        document.getElementById("modulo42").innerHTML = `

         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Deformacion total</td>
            <td class='py-2 px-4'>des </td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${L3.toFixed(2)} m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Deformacion maxima</td>
            <td class='py-2 px-4'>des max</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Imax.toFixed(2)} m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'></td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'> Dcm<Dmax </td>
            <td class='py-2 px-4 text-center'>${Imax02}</td>
        </tr>     
        `;

       


        const hb =h/b;
        document.getElementById("modulo44").innerHTML = `

        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Relacion de altura y base</td>
            <td class='py-2 px-4'>h/b</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${hb.toFixed(2)}</td>
        </tr>
        
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>No nesesita apoyo lateral</td>
        </tr>                       
        `;
        const a = cortante/(fct*b);
        document.getElementById("modulo45").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Longitud del apoyo</td>
            <td class='py-2 px-4'>a</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${a.toFixed(2) } cm</td>
        </tr>`;
    });
});