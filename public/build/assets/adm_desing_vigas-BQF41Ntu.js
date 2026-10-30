import{b as $t,c as Ft,S as ht}from"./export-D92QccW_.js";/* empty css                   */import{c as vt}from"./state-Dtb9TNCH.js";import"./printThis-eR5fzPta.js";$(document).ready(function(){const I=document.querySelector('[data-sheet="diseno-vigas"]'),m=I?vt(I):null;I&&$t(I,{buttonId:"btn_captura_resultado",targetId:"vigasgn",state:m}),$("#desingButton").click(X=>{if(X.preventDefault(),m&&!m.validate())return;const Z=document.getElementById("desingcorte");Z.style.display="block";const a=parseFloat(document.getElementById("fc").value),s=parseFloat(document.getElementById("fy").value),p=parseFloat(document.getElementById("altura").value),c=parseFloat(document.getElementById("base").value),J=parseFloat(document.getElementById("momentoultimo").value),O=parseFloat(document.getElementById("vucortante").value),Y=parseFloat(document.getElementById("capas").value);parseInt(document.getElementById("cuantias").value);let u=0;a<=280?u=.85:a>280&&a<=560?u=1.05-.714*a/1e3:u=.65;const tt=parseFloat(.003),at=.0021,st=parseFloat(.9);let d=0;switch(Y){case 1:d=p-6;break;case 2:d=p-9;break;case 3:d=p-12;break;default:d=p}var et=(d-Math.sqrt(Math.pow(d,2)-2*Math.abs(J*Math.pow(10,5))/(.9*.85*a*c))).toFixed(2);(.85*a*c*et/s).toFixed(2),Math.max(.7*Math.sqrt(a)/s*c*d,14*c*d/s).toFixed(2),(.85*u*a/s*(.003/(.003+.0021))*c*d).toFixed(2),(.75*(.85*u*a/s*(.003/(.003+.0021)))*c*d).toFixed(2);let ct=`
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo de fluencia del acero</td>
                <td class='py-2 px-4'>fy</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${s} kg/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo de comprension del concreto</td>
                <td class='py-2 px-4'>f'c</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${a} kg/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Base de la Viga</td>
                <td class='py-2 px-4'>b</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${c} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Altura de la Viga</td>
                <td class='py-2 px-4'>h</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${p} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Parámetro en función de la resistencia del concreto</td>
                <td class='py-2 px-4'>β1</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${u}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Deformación última del concreto</td>
                <td class='py-2 px-4'>εcu</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${tt}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Deformación de fluencia del acero</td>
                <td class='py-2 px-4'>εy</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${at}</td>
            </tr> 
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Factor de reducción a flexión sin carga axial</td>
                <td class='py-2 px-4'>Ф</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${st}</td>
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
        `;document.getElementById("predimenension").innerHTML=ct,dt();function dt(){var P=parseInt(document.getElementById("cuantias").value);let n=0;switch(parseInt(P)){case 1:n=.7*Math.pow(a,.5)/s;break;case 2:n=.8*Math.pow(a,.5)/s;break;case 3:n=14/s;break;default:n=0;break}document.getElementById("desingFlexion").innerHTML="";const l=parseFloat(p),r=parseFloat(c);let t=0;switch(Y){case 1:t=p-6;break;case 2:t=p-9;break;case 3:t=p-12;break;default:t=p}const x=J*1e5,o=t-Math.pow(Math.pow(t,2)-2*x/(.85*.9*a*r),.5);var H=a<=280?0:(s-280)/70,D=a<=280?.85:.85-.05*H;const e=n*(r*t),g=e*.9*s*(t-o/2)/1e5,b=D*.85*a*(6e3/(6e3+s)/s),M=b*r*l,N=M*.9*s*(t-o/2)/1e5,h=.75*b,v=h*l*r,q=v*.9*s*(t-o/2)/1e5,E=.5*h,_=E*r*l,B=_*.9*s*(t-o/2)/1e5,i=x/(.9*s*(t-o/2)),f=i<v?"OK":"NO",A=i>e?"OK":"NO",y=Math.max(i,e),w=y*.9*s*(t-o/2)/1e5,S=y<=_?"Si es economico":"Es costoso",C="𝐴𝑠 𝑚𝑖𝑛 = \\frac{0.80\\sqrt{f'_c}}{f_y \\cdot b_d};\\frac{14}{f_y \\cdot b_d}",V="𝜌𝑏 = \\frac{0.85 * 𝛽_1 * 𝑓_𝑐}{f_y} * \\frac{𝜀_𝑐𝑢}{𝜀_𝑐𝑢+𝜀_𝑦}",k="𝐴𝑠 𝑚á𝑥 = 0.75 * (𝜌𝑏 * 𝑏 * d)",T="𝐴𝑠_𝑚á𝑥/2 = cuantia	 * (𝑏 * h)",U="𝑀𝑢= 𝐴𝑠 𝑚𝑖𝑛 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",z="𝑀𝑢= 𝜌𝑏 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",K="𝑀𝑢= 𝐴𝑠 𝑚á𝑥 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",L="𝑀𝑢= 𝐴𝑠 𝑚á𝑥/2 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",rt="𝑀𝑢= 𝐴𝑠  * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",R="𝐴𝑠 = \\frac{0.85 * f_c * b *a}{f_y}",pt="𝑉𝑐 = 0.53 \\cdot fy \\cdot b \\cdot \\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",lt="Ø𝑉𝑐 = 0.85 * 𝑉𝑐",ot="𝑉𝑠=\\frac{𝑉𝑢}{0.85-17}",nt="𝑉𝑠 𝑚á𝑥= 2.1*f_y*b*\\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",yt="𝑉𝑠 𝑚𝑒𝑑= 1.1*f_y*b*\\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",xt="a = d - \\sqrt{d^2 - \\frac{2|Mu|}{\\phi \\cdot 0.85 \\cdot f'_c \\cdot b}}",gt=`
                <tbody>
                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <td colspan="4" class='text-xl py-2 px-4'><strong>2.1.- Cuantia minima</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia minima de la sección</td>
                        <td class='py-2 px-4'>Cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${n.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero minimo</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚𝑖𝑛</td>
                        <td class='py-2 px-4'>\\(${C}\\)</td>
                        <td class='py-2 px-4 text-center'>${e.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento ultimo del acero minimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${U}\\)</td>
                        <td class='py-2 px-4 text-center'>${g.toFixed(2)} tn/m </td>
                    </tr>
                    <!--===========================0Cuantia balanceado=========================================-->

                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                        <td colspan="4" class="text-xl py-2 px-4"><strong>2.2.-Cuantia Balanceado</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia minima en la sección</td>
                        <td class='py-2 px-4'>Cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${b.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero balanceado</td>
                        <td class='py-2 px-4'>𝜌𝑏</td>
                        <td class='py-2 px-4'>\\(${V}\\)</td>
                        <td class='py-2 px-4 text-center'>${M.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${z}\\)</td>
                        <td class='py-2 px-4 text-center'>${N.toFixed(2)} tn/m </td>
                    </tr>

                    <!--==================================rmax===============================-->

                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                        <td colspan="4" class="text-xl py-2 px-4"><strong>2.3.-Cuantia máxima</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia máxima en la sección</td>
                        <td class='py-2 px-4'>Cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${h.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero máximo</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥</td>
                        <td class='py-2 px-4'>\\(${k}\\)</td>
                        <td class='py-2 px-4 text-center'>${v.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo del acero máximo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${K}\\)</td>
                        <td class='py-2 px-4 text-center'>${q.toFixed(2)} tn/m</td>
                    </tr>

                    <!--==================================reconomico===============================-->

                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                        <td colspan="4" class="text-xl py-2 px-4"><strong>2.4.-Cuantia económico</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia económico</td>
                        <td class='py-2 px-4'>cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${E.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero económico</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥/2</td> 
                        <td class='py-2 px-4'>\\(${T}\\)</td>
                        <td class='py-2 px-4 text-center'>${_.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${L}\\)</td>
                        <td class='py-2 px-4 text-center'>${B.toFixed(2)} tn/m</td>
                    </tr>
            `;document.getElementById("desingFlexion").innerHTML=gt;let Q=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4'>𝑎</td>
                    <td class='py-2 px-4'>\\(${xt}\\)</td>
                    <td class='py-2 px-4 text-center'>${o.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Acero real</td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${R}\\)</td>
                    <td class='py-2 px-4 text-center'>${i.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Verificacion 𝐴𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>\\(${k}\\)</td>
                    <td class='py-2 px-4 text-center'>${f}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Verificacion 𝐴𝑠_𝑚𝑖𝑛</td>
                    <td class='py-2 px-4'>𝐴𝑠_𝑚𝑖𝑛</td>
                    <td class='py-2 px-4'>\\(${k}\\)</td>
                    <td class='py-2 px-4 text-center'>${A}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Momento</td>
                    <td class='py-2 px-4'>𝑀𝑢'</td>
                    <td class='py-2 px-4'>\\(${rt}\\)</td>
                    <td class='py-2 px-4 text-center'>${w.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${R}\\)</td>
                    <td class='py-2 px-4 text-center'>${y.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4 text-center'><strong>${S}</strong></td>
                </tr>
                <tr id="aceros"></tr>

            `;Q+='<tr class="bg-gray-100 dark:bg-gray-600"><th class="py-2 px-8">Distribución del acero</th><td colspan="3" id="steel-editor"></td></tr>',document.getElementById("calcared").innerHTML=Q;const F=document.createElement("input");F.type="hidden",F.id="tipoAcero0_capa0",F.value="0",document.getElementById("steel-editor").append(F,Ft(kt=>{F.value=kt.toFixed(3),j({target:F})},"Combinación de acero",ht));const G=.53*t*c*Math.pow(a,.5)/1e3,W=.85*G,it=W<O?"Para controlar el cortante":"Por proceso constructivo",mt=O/.85-G,ut=2.1*t*c*Math.pow(a,.5)/1e3,bt=1.1*t*c*Math.pow(a,.5)/1e3;let ft=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Peralte efectivo</td>
                    <td class='py-2 px-4'>𝑑</td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4 text-center'>${t} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Cortante ultimo</td>
                    <td class='py-2 px-4'>𝑉𝑢</td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4 text-center'>${O} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Cortante del concreto</td>
                    <td class='py-2 px-4'>𝑉𝑐</td>
                    <td class='py-2 px-4'>\\(${pt}\\)</td>
                    <td class='py-2 px-4 text-center'>${G.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'>Ø𝑉𝑐</td>
                    <td class='py-2 px-4'>\\(${lt}\\)</td>
                    <td class='py-2 px-4 text-center'>${W.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Usar estribo</td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${R}\\)</td>
                    <td class='py-2 px-4 text-center'>${it}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠</td>
                    <td class='py-2 px-4'>\\(${ot}\\)</td>
                    <td class='py-2 px-4 text-center'>${mt.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>\\(${nt}\\)</td>
                    <td class='py-2 px-4 text-center'>${ut.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠_𝑚𝑒𝑑</td>
                    <td class='py-2 px-4'>\\(${yt}\\)</td>
                    <td class='py-2 px-4 text-center'>${bt.toFixed(2)} tn</td>
                </tr>

                <tr id="aceros"></tr>
            `;document.getElementById("diseñoCortes").innerHTML=ft}function j(P){if(P.target.id==="tipoAcero0_capa0"){const l=parseFloat(document.getElementById("fc").value),r=parseFloat(document.getElementById("fy").value),t=parseFloat(document.getElementById("altura").value),x=parseFloat(document.getElementById("base").value),o=parseFloat(document.getElementById("momentoultimo").value),H=parseFloat(document.getElementById("capas").value),D=parseFloat(document.getElementById("vucortante").value);let e=0;switch(H){case 1:e=t-6;break;case 2:e=t-9;break;case 3:e=t-12;break;default:e=t}var n=parseInt(document.getElementById("cuantias").value);let g=0;switch(parseInt(n)){case 1:g=.7*Math.pow(l,.5)/r;break;case 2:g=.8*Math.pow(l,.5)/r;break;case 3:g=14/r;break;default:g=0;break}const b=o*1e5,M=e-Math.pow(Math.pow(e,2)-2*b/(.85*.9*l*x),.5),N=g*(x*e),h=b/(.9*r*(e-M/2)),v=Math.max(h,N),q=.53*e*x*Math.pow(l,.5)/1e3,E=D/.85-q,_=1.1*e*x*Math.pow(l,.5)/1e3,B=E<_?"Si":"No";let i="";for(let f=0;f<1;f++){const A=document.getElementById(`tipoAcero${f}_capa${f}`);let y="-";A&&(y=A.value);const w=Math.abs(2*y*r*e/(E*1e3)),S=B=="Si"?60:30,C=B=="Si"?e/2:e/4,V=10,k=Math.min(w,S,C,V),T=Math.round(k),U=Math.round(2*(t/10)),z=`1 @ 0.05 ${U} @ ${T},RESTO @  20`,K=y>=v?"Cumple":"No cumple";i+=`
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Acero a usar</td>
                            <td class='py-2 px-4'>𝐴𝑠</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${y} cm<sup>2</sup></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>verificacion</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4'>as_usar > As </td>
                            <td class='py-2 px-4 text-center'><strong>${K}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4" class='py-2 px-4'></td>
                        </tr>
                    `,document.getElementById("acerosfinales").innerHTML=i;let L="";L=`
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆1</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${w.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆2</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${S.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆3</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${C.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆4</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${V.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>S minimo</td>
                            <td class='py-2 px-4'>𝑆</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${k.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Redondeado</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${T.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Longitud a estribar</td>
                            <td class='py-2 px-4'>𝑙</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${U.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Longitud a estribar</td>
                            <td class='py-2 px-4'>𝑙</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center' contenteditable="true">${z} cm</td>
                        </tr>
                    `,document.getElementById("aceroscortes").innerHTML=L}}}j({target:document.getElementById("tipoAcero0_capa0")}),MathJax.typeset([document.getElementById("desingcorte")]),m==null||m.ready()}),document.getElementById("btn_pdf_predim").addEventListener("click",function(){$("#vigasgn").printThis({debug:!1,importCSS:!0,importStyle:!0,loadCSS:"",pageTitle:"Vigas GN",removeInline:!1,printDelay:333,header:null,footer:null,base:!1,formValues:!0,canvas:!1,doctypeString:"<!DOCTYPE html>",removeScripts:!1,copyTagClasses:!1})})});
