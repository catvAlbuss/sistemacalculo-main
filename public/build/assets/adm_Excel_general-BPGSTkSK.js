$(document).ready(function(){$("#desingButton").click(V=>{V.preventDefault();const e={A:{Eprom:13e4,fm:210,fc:145,fct:40,fv:15,ft:145},B:{Eprom:1e5,fm:150,fc:110,fct:28,fv:12,ft:105},C:{Eprom:9e4,fm:100,fc:80,fct:15,fv:8,ft:75}},p=document.getElementById("selectabc").value,Z=parseFloat(document.getElementById("fcprime").value),F=parseFloat(document.getElementById("fy").value),d=parseFloat(document.getElementById("base").value),l=parseFloat(document.getElementById("altura").value),q=parseFloat(document.getElementById("momentoultimo").value),S=parseFloat(document.getElementById("vucortante").value),w=parseFloat(document.getElementById("cieloraso").value),N=parseFloat(document.getElementById("sobrecarga").value),x=e[p].Eprom,g=e[p].fm,z=e[p].fc,L=e[p].fct,n=e[p].fv,D=e[p].ft;document.getElementById("predimenension").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Modulo de elasticidad</td>
            <td class='py-2 px-4'>Emin</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${x} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible a flexion</td>
            <td class='py-2 px-4'>fm</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${g} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible a la compresion</td>
            <td class='py-2 px-4'>fc</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${z} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible compresion perpendicular a las fiestas </td>
            <td class='py-2 px-4'>fc┴</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${L} kg/cm<sup>2</sup></td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Esfuerzo admisible al corte paralelo</td>
            <td class='py-2 px-4'>fv</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${n} kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>ft</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${D} kg/cm<sup>2</sup></td>
        </tr>`;const a=Z*2.54,s=F*2.54;document.getElementById("dimensionamiento").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>a</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${a} cm</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>b</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${s} cm</td>
        </tr>
         `;const o=q+S+w,y=N,M=o+y,r=M*l;document.getElementById("combinaciondecargas").innerHTML=`
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>CM</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${o} kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>CV</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${y} kg/m<sup>2</sup></td>
        </tr>

        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>- </td>
            <td class='py-2 px-4'>CM+CV</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${M} kg/m<sup>2</sup></td>
       </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>W</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${r} kg/m</td>
       </tr>
       `;const b=r*d*d/8,c=r*d/2,G=`
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>W</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${r.toFixed(2)} kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>R</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'> \\(R=\\frac{W \\cdot L}{2}\\)</td>
            <td class='py-2 px-4 text-center'>${c.toFixed(2)} kg</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>M</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'>\\(R=\\frac{W \\cdot L^2}{8}\\)</td>
            <td class='py-2 px-4 text-center'>${b.toFixed(2)} kg-m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>R</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${c.toFixed(2)} kg</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Momento</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${b.toFixed(2)} kg-m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Cortante</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${c.toFixed(2)} kg</td>
        </tr>
        `;document.getElementById("analisisestructural").innerHTML=G,MathJax.typeset(),document.getElementById("desingFlexion").innerHTML=" ";const v=g+.1*g,I=b*100/v,h=a*s*s/6;let m;h>I?m="CUMPLE":m="NO",document.getElementById("modulo41").innerHTML=`
        
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>1.1fm</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${v.toFixed(2)} kg/cm<sup>2</sup>></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>Zrequerido</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${I.toFixed(2)} kg/cm<sup>3</sup>></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>Z</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${h.toFixed(2)} kg/cm<sup>3</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-8'>Z>Zreq</td>
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-8'>${m}</td>     
        </tr>
        `;let J=`
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
        </tr>`;document.getElementById("imagen01").innerHTML=J;const t=document.getElementById("figura01").getContext("2d");t.fillStyle="black",t.fillRect(50,100,700,20);for(let E=0;E<14;E++)t.strokeStyle="black",t.strokeRect(50+E*50,60,50,40);t.beginPath(),t.moveTo(50,120),t.lineTo(20,200),t.lineTo(80,200),t.closePath(),t.fillStyle="black",t.fill(),t.beginPath(),t.moveTo(750,120),t.lineTo(720,200),t.lineTo(780,200),t.closePath(),t.fill(),t.fillStyle="grey",t.fillRect(20,200,60,10),t.fillRect(720,200,60,10),t.beginPath(),t.strokeStyle="#005f6b",t.lineWidth=4,t.moveTo(50,120),t.quadraticCurveTo(400,200,750,120),t.stroke();const B=1.8*o*l+y*l,C=y*l,T=250,R=5*B*d*d*d*T/(.0384*x),A=350,O=5*C*d*d*d*A/(.0384*x),H=Math.max(R,O),P=a*s*s*s/12;let i;P>H?i="CUMPLE":i="NO";const j=`
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>(solo calculo de flecciones)</td>
            <td class='py-2 px-4'>W<sub>equivalente</sub></td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${F.toFixed(2)} 1.8W<sub>d</sub>+W<sub>1</sub></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'> \\(I >\\frac{5 \\cdot wL^3 k}{384 \\cdot E}\\)  </td>
            <td class='py-2 px-4'>W<sub>e</sub>1</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${B.toFixed(2)} kg/m</td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>W<sub></sub>2</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${C.toFixed(2)} kg/m</td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>PARA LA CARGAR TOTAL</td>
            <td class='py-2 px-4'>K</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${T.toFixed(2)} </td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>I</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${R.toFixed(2)} </td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>PARA LA SOBRECARGA</td>
            <td class='py-2 px-4'>K</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${A.toFixed(2)} </td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>I</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${O.toFixed(2)} </td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>Imax</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${H.toFixed(2)} cm<sup>4</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>I</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${P.toFixed(2)} cm<sup>4</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>|>|max</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${i}</td>
        </tr>     
        `;document.getElementById("modulo42").innerHTML=j,MathJax.typeset();const U=c-r*s/100,Y=c,u=n+.1*n,W=3*U/(2*a*s);let k;u>W?k="CUMPLE":k="NO";const K=3*c/(2*a*s);let f;u>K?f="CUMPLE":f="NO",document.getElementById("modulo43").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>V<sub>(h)</sub></td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${U.toFixed(2)} Kg</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>V</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Y.toFixed(2)} Kg</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>1.1fv</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${u.toFixed(2)} Kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>t<sub>(h)</sub></td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${W.toFixed(2)} Kg/cm<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>1.1fv>t<sub>h</sub></sub></td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${k}</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>t</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${K.toFixed(2)} Kg/cm<sup>2</sup></td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>-</sub></td>
            <td class='py-2 px-4'>1.1fv>t</td>
            <td class='py-2 px-4 text-center'>${f}</td>
        </tr>
        `;const _=s/a;document.getElementById("modulo44").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>h/b</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${_.toFixed(2)}</td>
        </tr>`;const Q=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>-</td>
            <td class='py-2 px-4'>a</td>
            <td class='py-2 px-4'>\\(a >\\frac{R}{\\cdot bf_c}\\)</td>
            <td class='py-2 px-4 text-center'>${(c/(L*a)).toFixed(2)} cm</td>
        </tr>
        `;document.getElementById("modulo45").innerHTML=Q,MathJax.typeset();let X=`
        <tr>
            <td colspan="4" class='py-2 px-4'></td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8' colspan="4">
                    <img src="../views/layouts/imagen2.jpg" height="200" alt="Descripción de la imagen" style="border: 1px solid black;">
            </td>
        </tr>`;document.getElementById("imagen02").innerHTML=X})});
