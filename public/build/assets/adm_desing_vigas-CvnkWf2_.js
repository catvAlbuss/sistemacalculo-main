import{c as vt,S as Ft}from"./steelEditor-Wb4gK2oY.js";import"./printThis-eR5fzPta.js";$(document).ready(function(){$("#desingButton").click(d=>{d.preventDefault();const l=document.getElementById("desingcorte");l.style.display="block";const t=parseFloat(document.getElementById("fc").value),a=parseFloat(document.getElementById("fy").value),e=parseFloat(document.getElementById("altura").value),o=parseFloat(document.getElementById("base").value),c=parseFloat(document.getElementById("momentoultimo").value),p=parseFloat(document.getElementById("vucortante").value),i=parseFloat(document.getElementById("capas").value);parseInt(document.getElementById("cuantias").value);let v=0;t<=280?v=.85:t>280&&t<=560?v=1.05-.714*t/1e3:v=.65;const et=parseFloat(.003),st=.0021,ct=parseFloat(.9);let n=0;switch(i){case 1:n=e-6;break;case 2:n=e-9;break;case 3:n=e-12;break;default:n=e}var rt=(n-Math.sqrt(Math.pow(n,2)-2*Math.abs(c*Math.pow(10,5))/(.9*.85*t*o))).toFixed(2);(.85*t*o*rt/a).toFixed(2),Math.max(.7*Math.sqrt(t)/a*o*n,14*o*n/a).toFixed(2),(.85*v*t/a*(.003/(.003+.0021))*o*n).toFixed(2),(.75*(.85*v*t/a*(.003/(.003+.0021)))*o*n).toFixed(2);let dt=`
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo de fluencia del acero</td>
                <td class='py-2 px-4'>fy</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${a} kg/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo de comprension del concreto</td>
                <td class='py-2 px-4'>f'c</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${t} kg/cm<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Base de la Viga</td>
                <td class='py-2 px-4'>b</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${o} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Altura de la Viga</td>
                <td class='py-2 px-4'>h</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${e} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Parámetro en función de la resistencia del concreto</td>
                <td class='py-2 px-4'>β1</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${v}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Deformación última del concreto</td>
                <td class='py-2 px-4'>εcu</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${et}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Deformación de fluencia del acero</td>
                <td class='py-2 px-4'>εy</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${st}</td>
            </tr> 
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Factor de reducción a flexión sin carga axial</td>
                <td class='py-2 px-4'>Ф</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${ct}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Peralte efectivo</td>
                <td class='py-2 px-4'>d</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${n} cm</td>
            </tr>
            <tr>
                <td colspan="4" class='py-2 px-4'></td>
            </tr>
        `;document.getElementById("predimenension").innerHTML=dt,lt();function lt(){var q=parseInt(document.getElementById("cuantias").value);let m=0;switch(parseInt(q)){case 1:m=.7*Math.pow(t,.5)/a;break;case 2:m=.8*Math.pow(t,.5)/a;break;case 3:m=14/a;break;default:m=0;break}document.getElementById("desingFlexion").innerHTML="";const x=parseFloat(e),y=parseFloat(o);let s=0;switch(i){case 1:s=e-6;break;case 2:s=e-9;break;case 3:s=e-12;break;default:s=e}const b=c*1e5,g=s-Math.pow(Math.pow(s,2)-2*b/(.85*.9*t*y),.5);var R=t<=280?0:(a-280)/70,D=t<=280?.85:.85-.05*R;const r=m*(y*s),f=r*.9*a*(s-g/2)/1e5,F=D*.85*t*(6e3/(6e3+a)/a),B=F*y*x,j=B*.9*a*(s-g/2)/1e5,A=.75*F,M=A*x*y,z=M*.9*a*(s-g/2)/1e5,I=.5*A,w=I*y*x,C=w*.9*a*(s-g/2)/1e5,k=b/(.9*a*(s-g/2)),E=k<M?"OK":"NO",T=k>r?"OK":"NO",u=Math.max(k,r),L=u*.9*a*(s-g/2)/1e5,U=u<=w?"Si es economico":"Es costoso",V="𝐴𝑠 𝑚𝑖𝑛 = \\frac{0.80\\sqrt{f'_c}}{f_y \\cdot b_d};\\frac{14}{f_y \\cdot b_d}",N="𝜌𝑏 = \\frac{0.85 * 𝛽_1 * 𝑓_𝑐}{f_y} * \\frac{𝜀_𝑐𝑢}{𝜀_𝑐𝑢+𝜀_𝑦}",S="𝐴𝑠 𝑚á𝑥 = 0.75 * (𝜌𝑏 * 𝑏 * d)",O="𝐴𝑠_𝑚á𝑥/2 = cuantia	 * (𝑏 * h)",P="𝑀𝑢= 𝐴𝑠 𝑚𝑖𝑛 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",K="𝑀𝑢= 𝜌𝑏 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",G="𝑀𝑢= 𝐴𝑠 𝑚á𝑥 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",H="𝑀𝑢= 𝐴𝑠 𝑚á𝑥/2 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",ot="𝑀𝑢= 𝐴𝑠  * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",J="𝐴𝑠 = \\frac{0.85 * f_c * b *a}{f_y}",pt="𝑉𝑐 = 0.53 \\cdot fy \\cdot b \\cdot \\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",nt="Ø𝑉𝑐 = 0.85 * 𝑉𝑐",yt="𝑉𝑠=\\frac{𝑉𝑢}{0.85-17}",xt="𝑉𝑠 𝑚á𝑥= 2.1*f_y*b*\\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",gt="𝑉𝑠 𝑚𝑒𝑑= 1.1*f_y*b*\\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",it="a = d - \\sqrt{d^2 - \\frac{2|Mu|}{\\phi \\cdot 0.85 \\cdot f'_c \\cdot b}}",mt=`
                <tbody>
                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <td colspan="4" class='text-xl py-2 px-4'><strong>2.1.- Cuantia minima</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia minima de la sección</td>
                        <td class='py-2 px-4'>Cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${m.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero minimo</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚𝑖𝑛</td>
                        <td class='py-2 px-4'>\\(${V}\\)</td>
                        <td class='py-2 px-4 text-center'>${r.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento ultimo del acero minimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${P}\\)</td>
                        <td class='py-2 px-4 text-center'>${f.toFixed(2)} tn/m </td>
                    </tr>
                    <!--===========================0Cuantia balanceado=========================================-->

                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                        <td colspan="4" class="text-xl py-2 px-4"><strong>2.2.-Cuantia Balanceado</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia minima en la sección</td>
                        <td class='py-2 px-4'>Cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${F.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero balanceado</td>
                        <td class='py-2 px-4'>𝜌𝑏</td>
                        <td class='py-2 px-4'>\\(${N}\\)</td>
                        <td class='py-2 px-4 text-center'>${B.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${K}\\)</td>
                        <td class='py-2 px-4 text-center'>${j.toFixed(2)} tn/m </td>
                    </tr>

                    <!--==================================rmax===============================-->

                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                        <td colspan="4" class="text-xl py-2 px-4"><strong>2.3.-Cuantia máxima</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia máxima en la sección</td>
                        <td class='py-2 px-4'>Cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${A.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero máximo</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥</td>
                        <td class='py-2 px-4'>\\(${S}\\)</td>
                        <td class='py-2 px-4 text-center'>${M.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo del acero máximo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${G}\\)</td>
                        <td class='py-2 px-4 text-center'>${z.toFixed(2)} tn/m</td>
                    </tr>

                    <!--==================================reconomico===============================-->

                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                        <td colspan="4" class="text-xl py-2 px-4"><strong>2.4.-Cuantia económico</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia económico</td>
                        <td class='py-2 px-4'>cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${I.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero económico</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥/2</td> 
                        <td class='py-2 px-4'>\\(${O}\\)</td>
                        <td class='py-2 px-4 text-center'>${w.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${H}\\)</td>
                        <td class='py-2 px-4 text-center'>${C.toFixed(2)} tn/m</td>
                    </tr>
            `;document.getElementById("desingFlexion").innerHTML=mt;let Q=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4'>𝑎</td>
                    <td class='py-2 px-4'>\\(${it}\\)</td>
                    <td class='py-2 px-4 text-center'>${g.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Acero real</td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${J}\\)</td>
                    <td class='py-2 px-4 text-center'>${k.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Verificacion 𝐴𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>\\(${S}\\)</td>
                    <td class='py-2 px-4 text-center'>${E}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Verificacion 𝐴𝑠_𝑚𝑖𝑛</td>
                    <td class='py-2 px-4'>𝐴𝑠_𝑚𝑖𝑛</td>
                    <td class='py-2 px-4'>\\(${S}\\)</td>
                    <td class='py-2 px-4 text-center'>${T}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Momento</td>
                    <td class='py-2 px-4'>𝑀𝑢'</td>
                    <td class='py-2 px-4'>\\(${ot}\\)</td>
                    <td class='py-2 px-4 text-center'>${L.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${J}\\)</td>
                    <td class='py-2 px-4 text-center'>${u.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4 text-center'><strong>${U}</strong></td>
                </tr>
                <tr id="aceros"></tr>

            `;Q+='<tr class="bg-gray-100 dark:bg-gray-600"><th class="py-2 px-8">Distribución del acero</th><td colspan="3" id="steel-editor"></td></tr>',document.getElementById("calcared").innerHTML=Q;const _=document.createElement("input");_.type="hidden",_.id="tipoAcero0_capa0",_.value="0",document.getElementById("steel-editor").append(_,vt(ht=>{_.value=ht.toFixed(3),Y({target:_})},"Combinación de acero",Ft));const X=.53*s*o*Math.pow(t,.5)/1e3,W=.85*X,ut=W<p?"Para controlar el cortante":"Por proceso constructivo",bt=p/.85-X,ft=2.1*s*o*Math.pow(t,.5)/1e3,kt=1.1*s*o*Math.pow(t,.5)/1e3;let $t=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Peralte efectivo</td>
                    <td class='py-2 px-4'>𝑑</td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4 text-center'>${s} cm</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Cortante ultimo</td>
                    <td class='py-2 px-4'>𝑉𝑢</td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4 text-center'>${p} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Cortante del concreto</td>
                    <td class='py-2 px-4'>𝑉𝑐</td>
                    <td class='py-2 px-4'>\\(${pt}\\)</td>
                    <td class='py-2 px-4 text-center'>${X.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'>Ø𝑉𝑐</td>
                    <td class='py-2 px-4'>\\(${nt}\\)</td>
                    <td class='py-2 px-4 text-center'>${W.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Usar estribo</td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${J}\\)</td>
                    <td class='py-2 px-4 text-center'>${ut}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠</td>
                    <td class='py-2 px-4'>\\(${yt}\\)</td>
                    <td class='py-2 px-4 text-center'>${bt.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>\\(${xt}\\)</td>
                    <td class='py-2 px-4 text-center'>${ft.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠_𝑚𝑒𝑑</td>
                    <td class='py-2 px-4'>\\(${gt}\\)</td>
                    <td class='py-2 px-4 text-center'>${kt.toFixed(2)} tn</td>
                </tr>

                <tr id="aceros"></tr>
            `;document.getElementById("diseñoCortes").innerHTML=$t}function Y(q){if(q.target.id==="tipoAcero0_capa0"){const x=parseFloat(document.getElementById("fc").value),y=parseFloat(document.getElementById("fy").value),s=parseFloat(document.getElementById("altura").value),b=parseFloat(document.getElementById("base").value),g=parseFloat(document.getElementById("momentoultimo").value),R=parseFloat(document.getElementById("capas").value),D=parseFloat(document.getElementById("vucortante").value);let r=0;switch(R){case 1:r=s-6;break;case 2:r=s-9;break;case 3:r=s-12;break;default:r=s}var m=parseInt(document.getElementById("cuantias").value);let f=0;switch(parseInt(m)){case 1:f=.7*Math.pow(x,.5)/y;break;case 2:f=.8*Math.pow(x,.5)/y;break;case 3:f=14/y;break;default:f=0;break}const F=g*1e5,B=r-Math.pow(Math.pow(r,2)-2*F/(.85*.9*x*b),.5),j=f*(b*r),A=F/(.9*y*(r-B/2)),M=Math.max(A,j),z=.53*r*b*Math.pow(x,.5)/1e3,I=D/.85-z,w=1.1*r*b*Math.pow(x,.5)/1e3,C=I<w?"Si":"No";let k="";for(let E=0;E<1;E++){const T=document.getElementById(`tipoAcero${E}_capa${E}`);let u="-";T&&(u=T.value);const L=Math.abs(2*u*y*r/(I*1e3)),U=C=="Si"?60:30,V=C=="Si"?r/2:r/4,N=10,S=Math.min(L,U,V,N),O=Math.round(S),P=Math.round(2*(s/10)),K=`1 @ 0.05 ${P} @ ${O},RESTO @  20`,G=u>=M?"Cumple":"No cumple";k+=`
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Acero a usar</td>
                            <td class='py-2 px-4'>𝐴𝑠</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${u} cm<sup>2</sup></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>verificacion</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4'>as_usar > As </td>
                            <td class='py-2 px-4 text-center'><strong>${G}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4" class='py-2 px-4'></td>
                        </tr>
                    `,document.getElementById("acerosfinales").innerHTML=k;let H="";H=`
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆1</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${L.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆2</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${U.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆3</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${V.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆4</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${N.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>S minimo</td>
                            <td class='py-2 px-4'>𝑆</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${S.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Redondeado</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${O.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Longitud a estribar</td>
                            <td class='py-2 px-4'>𝑙</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${P.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Longitud a estribar</td>
                            <td class='py-2 px-4'>𝑙</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center' contenteditable="true">${K} cm</td>
                        </tr>
                    `,document.getElementById("aceroscortes").innerHTML=H}}}Y({target:document.getElementById("tipoAcero0_capa0")}),MathJax.typeset([document.getElementById("desingcorte")])}),document.getElementById("btn_pdf_predim").addEventListener("click",function(){$("#vigasgn").printThis({debug:!1,importCSS:!0,importStyle:!0,loadCSS:"",pageTitle:"Vigas GN",removeInline:!1,printDelay:333,header:null,footer:null,base:!1,formValues:!0,canvas:!1,doctypeString:"<!DOCTYPE html>",removeScripts:!1,copyTagClasses:!1})});const h=document.getElementById("btn_captura_resultado");function Z(d){const l=d.cloneNode(!0),t=d.querySelectorAll("input, select, textarea"),a=l.querySelectorAll("input, select, textarea");return t.forEach((e,o)=>{const c=a[o];if(c){if(e.tagName==="INPUT"){const p=(e.type||"").toLowerCase();p==="checkbox"||p==="radio"?e.checked?c.setAttribute("checked","checked"):c.removeAttribute("checked"):(c.setAttribute("value",e.value),c.value=e.value)}e.tagName==="TEXTAREA"&&(c.value=e.value,c.textContent=e.value),e.tagName==="SELECT"&&(c.value=e.value,Array.from(c.options).forEach(p=>{p.value===e.value?(p.setAttribute("selected","selected"),p.selected=!0):(p.removeAttribute("selected"),p.selected=!1)}))}}),l}function tt(){const d=new Date,l=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-"),t=[String(d.getHours()).padStart(2,"0"),String(d.getMinutes()).padStart(2,"0"),String(d.getSeconds()).padStart(2,"0")].join("-");return`resultado_viga_${l}_${t}.png`}function at(d,l){const t=window.URL.createObjectURL(d),a=document.createElement("a");a.href=t,a.download=l,document.body.appendChild(a),a.click(),a.remove(),window.URL.revokeObjectURL(t)}h.addEventListener("click",async()=>{const d=h.textContent;try{const l=document.getElementById("vigasgn");if(!l||l.innerHTML.trim()===""){alert("Primero debes generar los resultados.");return}h.disabled=!0,h.textContent="Generando...";const t=Z(l),a=Array.from(document.querySelectorAll('link[rel="stylesheet"]'),i=>i.href).filter(Boolean),e=Array.from(document.querySelectorAll("style"),i=>i.outerHTML).join(`
`),o={html:t.outerHTML,stylesheets:a,inlineStyles:e},c=await fetch("/capturar-viga-fragmento",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),Accept:"application/json"},body:JSON.stringify(o)});if(!c.ok){const i=await c.text();throw console.error("STATUS:",c.status),console.error("RESPUESTA:",i),new Error(`Error ${c.status} al generar la imagen.`)}const p=await c.blob();at(p,tt())}catch(l){console.error("Error en captura:",l),alert(l.message||"Error al generar la imagen.")}finally{h.disabled=!1,h.textContent=d}})});
