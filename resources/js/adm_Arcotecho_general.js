// const { document } = require("postcss");

$(document).ready(function () {
  $("#desingButton").click((e) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado del botón
    const longitudtransversal = parseFloat(document.getElementById("longitudtransversal").value);
    const alturacolumna = parseFloat(document.getElementById("alturacolumna").value); // nuevo el alturacolumna
    const luz = parseFloat(document.getElementById("luz").value);
    const flecha = parseFloat(document.getElementById("flecha").value);
    const pesopropio = parseFloat(document.getElementById("pesopropio").value);
    const luminarias = parseFloat(document.getElementById("luminarias").value);
    const cargaviva = parseFloat(document.getElementById("cargaviva").value);
    const cargaviento = parseFloat(document.getElementById("cargaviento").value);
    const Z = parseFloat(document.getElementById("Z").value);
    const U = parseFloat(document.getElementById("U").value);
    const S = parseFloat(document.getElementById("S").value);
    const C = parseFloat(document.getElementById("C").value);
    const R = parseFloat(document.getElementById("R").value);
    const Ps = parseFloat(document.getElementById("Ps").value);



    const radio = (flecha * flecha + ((luz / 2) * luz) / 2) / (2 * flecha);
    const rad = Math.atan(luz / 2 / (radio - flecha));
    const angulo = rad * (180 / Math.PI);
    const longArco = 2 * rad * radio;
    const CGz = radio - (radio * Math.sin(rad)) / rad;
    const areaTotal = longArco * longitudtransversal;
    const radicoCG = (radio * Math.sin(rad / 2)) / (rad / 2);
    const cgmediaCuerda = radicoCG * Math.sin(rad / 2);

    document.getElementById("datosgeometricos").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Radio</td>
            <td class='py-2 px-4'>R</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${radio.toFixed(2)}m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Angulo de arco</td>
            <td class='py-2 px-4'>θ</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${angulo.toFixed(2)}°</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Angulo de arco</td>
            <td class='py-2 px-4'>θ</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${rad.toFixed(2)} RAD</td>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Longitud de arco</td>
            <td class='py-2 px-4'>LS</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${longArco.toFixed(2)}m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Centro de gravedad de area</td>
            <td class='py-2 px-4'>CGz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CGz.toFixed(2)}m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Area total</td>
            <td class='py-2 px-4'>AT</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${areaTotal.toFixed(2)}m<sup>2</sup></td>
        </tr>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Radio de CG de media cuerda</td>
            <td class='py-2 px-4'>CGz2</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${radicoCG.toFixed(2)}m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>CG XX de media cuerda</td>
            <td class='py-2 px-4'>CGz3</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${cgmediaCuerda.toFixed(2)}m</td>
        </tr>  `;
    // ========================CALUCULO DE CARGAS=========================================
    const CM = (pesopropio + luminarias) * longArco;
    const CMz = CM * 0.5;
    const CMx = ((((pesopropio + luminarias) * longArco) / 2) * cgmediaCuerda - (CMz * luz) / 2) / flecha;
    const Axial = (CMz * CMz + CMx * CMx) ** 0.5;
    const CV = cargaviva * longArco;
    const CVz = CV * 0.5;
    const CVx = (((cargaviva * longArco) / 2) * cgmediaCuerda - (CVz * luz) / 2) / flecha;
    const Axial2 = (CVz * CVz + CVx * CVx) ** 0.5;

    document.getElementById("calculocargas").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga muerta por lado</td>
            <td class='py-2 px-4'>CD</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CM.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga muerta vertical</td>
            <td class='py-2 px-4'>CDz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CMz.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga muerta horizontal</td>
            <td class='py-2 px-4'>CDx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CMx.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Axial de CM</td>
            <td class='py-2 px-4'>AXIAL D</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Axial.toFixed(2)}kg/m</td>
        </tr>`;

    document.getElementById("cargavivas").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva por lado</td>
            <td class='py-2 px-4'>CL</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CV.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva vertical</td>
            <td class='py-2 px-4'>CLz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CVz.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva horizontal</td>
            <td class='py-2 px-4'>CLx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CVx.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva Axial</td>
            <td class='py-2 px-4'>AXIAL L</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Axial2.toFixed(2)}kg/m</td>
        </tr>
        `;

    // ========================COEFICIENTE SISMICO=========================================
    const pesosismico222 = CMz + 0.25 * CVz;
    const pesoSismico1 = pesosismico222 * 2;
    const NADA = (Z * U * S * C) / R;
    const CS = pesoSismico1 * NADA;
    const CSx = CS / 2;
    const CSz = (CSx * (flecha - CGz)) / (luz * 0.5);
    const Axial3 = (CSx * CSx + CSz * CSz) ** 0.5;

    document.getElementById("coeficientesismico").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'> Peso sismico total </td>
            <td class='py-2 px-4'>CD+.25CL</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${pesoSismico1.toFixed(2)}kg/m</td>
        </tr> 
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Peso sismico por lado</td>
            <td class='py-2 px-4'>CD+.25CL </td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${pesosismico222.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Coeficiente sismico</td>
            <td class='py-2 px-4'>ZUCS/R</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${NADA.toFixed(3)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga Sismica por lado</td>
            <td class='py-2 px-4'>CE</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CS.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga sismica Vertical</td>
            <td class='py-2 px-4'>CEx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CSx.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga sismica horizontal</td>
            <td class='py-2 px-4'>CEz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CSz.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga sismica Axial</td>
            <td class='py-2 px-4'>AXIAL E</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Axial3.toFixed(2)}kg/m</td>
        </tr>
       `;

    //    =============Carga viento============
    const Vh = +cargaviento * Math.pow((alturacolumna + flecha) / 10, 0.22);
    const Ph = 0.005 * Vh * Vh;
    const CWBar = +Ph * 0.8;
    const CWSota = 0.5 * Ph;

    const CwBar2 = CWBar * longArco;
    const CwSota2 = CWSota * longArco;

    const CwzBar = CwBar2 * 0.5;

    const CwxBar = (((CWBar * longArco) / 2) * cgmediaCuerda - (CwzBar * luz) / 2) / flecha;

    const Axial4 = (CwzBar * CwzBar + CwxBar * CwxBar) ** 0.5;

    const CwzSota = CwSota2 * 0.5;
    const CwxSota = (((CWSota * longArco) / 2) * cgmediaCuerda - (CwzSota * luz) / 2) / flecha;
    const Axial5 = (CwzSota * CwzSota + CwxSota * CwxSota) ** 0.5;

    document.getElementById("cargadeviento").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Velocidad de viento</td>
            <td class='py-2 px-4'>Vh</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Vh.toFixed(2)}km/h</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Presion de viento</td>
            <td class='py-2 px-4'>Ph</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Ph.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CWBar.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CWSota.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CwBar2.toFixed(2)}kg/m</td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CwSota2.toFixed(2)}kg/m</td>
        </tr>

         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWzBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CwzBar.toFixed(2)}kg/m</td>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWxBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CwxBar.toFixed(2)}kg/m</td>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Axial de viento</td>
            <td class='py-2 px-4'>AxialWBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Axial4.toFixed(2)}kg/m</td>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWzSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CwzSota.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWxSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CwxSota.toFixed(2)}kg/m</td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Axial de viento</td>
            <td class='py-2 px-4'>AxialWSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Axial5.toFixed(2)}kg/m</td>
        </tr>
    `;
    // ================carga nieves =================

    const Relacion = flecha / luz;
    const Qt = Ps; 
    const QT = Ps*0.8 ; 

    const Cnieve =  Qt* longArco;

    const Cnieve2 = Cnieve*0.5; 
    const CwxBar22 = (((Qt*longArco /2*cgmediaCuerda)) -Cnieve2*luz/2)/flecha;
    const Axial6 = (Cnieve2*Cnieve2+ CwxBar22 *CwxBar22)**0.5 ; 

    document.getElementById("carganieve").innerHTML = `
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Relacion <sup>h</sup>/<sub>L</sub></td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Relacion.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve</td>
            <td class='py-2 px-4'>Qt</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Qt.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve 0.80</td>
            <td class='py-2 px-4'>Qt</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${QT.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>CS</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Cnieve.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>CSz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Cnieve2.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>CSx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${CwxBar22.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>Axial S</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Axial6.toFixed(2)}kg/m</td>
        </tr>
    `;
  });
});