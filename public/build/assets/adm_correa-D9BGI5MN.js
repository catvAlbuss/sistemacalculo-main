$(document).ready(function(){$("#desingButton").click(f=>{f.preventDefault();const t={A:{Eprom:13e4,fm:210,fc:145,fct:40,fv:15,ft:145},B:{Eprom:1e5,fm:150,fc:110,fct:28,fv:12,ft:105},C:{Eprom:9e4,fm:100,fc:80,fct:15,fv:8,ft:75}},s=document.getElementById("selectabc").value,E=parseFloat(document.getElementById("base").value),k=parseFloat(document.getElementById("altura").value),v=parseFloat(document.getElementById("luz").value),B=parseFloat(document.getElementById("momentoultimo").value),I=parseFloat(document.getElementById("vucortante").value),F=parseFloat(document.getElementById("DCM").value),M=parseFloat(document.getElementById("DCV").value),L=t[s].Eprom,e=t[s].fm,C=t[s].fc,y=t[s].fct,c=t[s].fv,D=t[s].ft;document.getElementById("predimenension").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Modulo de elasticidad</td>
            <td class='py-2 px-4'>Emin</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${L} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible a flexion</td>
            <td class='py-2 px-4'>fm</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${e} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible a la compresion</td>
            <td class='py-2 px-4'>fc</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${C} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible compresion perpendicular a las fiestas </td>
            <td class='py-2 px-4'>fc┴</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${y} kg/cm<sup>2</sup></td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible al corte paralelo</td>
            <td class='py-2 px-4'>fv</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${c} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>ft</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${D} kg/cm<sup>2</sup></td>
        </tr>`;const d=E*2.54,a=k*2.54;document.getElementById("dimensionamiento").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Base del elemento</td>
            <td class='py-2 px-4'>b</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${d} cm</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Altura del elemento</td>
            <td class='py-2 px-4'>h</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${a} cm</td>
        </tr>
         `;const z=B,o=I;document.getElementById("desingFlexion").innerHTML=" ";const n=e+.1*e,x=z*100/n,g=d*a*a/6;let p;g>x?p="CUMPLE":p="NO",document.getElementById("modulo41").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfeurzo a flexion admisible</td>
            <td class='py-2 px-4'>1.1fm</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${n.toFixed(2)} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Modulo de seccion requerido</td>
            <td class='py-2 px-4'>Zrequerido</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${x.toFixed(2)} kg/cm<sup>3</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Modulo de seccion dispuesto</td>
            <td class='py-2 px-4'>Z</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${g.toFixed(2)} kg/cm<sup>3</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'></td>
            <td class='py-2 px-8'></td>
            <td class='py-2 px-8'>Z>Zreq</td>
            <td class='py-2 px-8'>${p}</td>     
        </tr>
        `;const m=c+.1*c,u=3*o/(2*d*a);let l;m>u?l="CUMPLE":l="NO",document.getElementById("modulo43").innerHTML=`

        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo a cortante admisible</td>
            <td class='py-2 px-4'>1.1fv</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${m.toFixed(2)} Kg/cm<sup>2</sup></td>
        </tr>


        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo a cortante requerido</td>
            <td class='py-2 px-4'>t</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${u.toFixed(2)} Kg/cm<sup>2</sup></td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'></td>
            <td class='py-2 px-4'></sub></td>
            <td class='py-2 px-4'>1.1fv>t</td>
            <td class='py-2 px-4 text-center'>${l}</td>
        </tr>
        `;const i=v/250,b=F+M;let r;b<i?r="CUMPLE":r="NO",document.getElementById("modulo42").innerHTML=`

         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Deformacion total</td>
            <td class='py-2 px-4'>des </td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${b.toFixed(2)} m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Deformacion maxima</td>
            <td class='py-2 px-4'>des max</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${i.toFixed(2)} m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'></td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'> Dcm<Dmax </td>
            <td class='py-2 px-4 text-center'>${r}</td>
        </tr>     
        `;const H=a/d;document.getElementById("modulo44").innerHTML=`

        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Relacion de altura y base</td>
            <td class='py-2 px-4'>h/b</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${H.toFixed(2)}</td>
        </tr>
        
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>No nesesita apoyo lateral</td>
        </tr>                       
        `;const T=o/(y*d);document.getElementById("modulo45").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Longitud del apoyo</td>
            <td class='py-2 px-4'>a</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${T.toFixed(2)} cm</td>
        </tr>`})});
