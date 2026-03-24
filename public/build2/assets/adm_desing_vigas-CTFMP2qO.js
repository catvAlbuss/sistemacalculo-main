import"./printThis-eR5fzPta.js";$(document).ready(function(){$("#desingButton").click(st=>{st.preventDefault();const ct=document.getElementById("desingcorte");ct.style.display="block";const a=parseFloat(document.getElementById("fc").value),e=parseFloat(document.getElementById("fy").value),l=parseFloat(document.getElementById("altura").value),c=parseFloat(document.getElementById("base").value),W=parseFloat(document.getElementById("momentoultimo").value),N=parseFloat(document.getElementById("vucortante").value),X=parseFloat(document.getElementById("capas").value);parseInt(document.getElementById("cuantias").value);let i=0;a<=280?i=.85:a>280&&a<=560?i=1.05-.714*a/1e3:i=.65;const dt=parseFloat(.003),rt=.0021,lt=parseFloat(.9);let d=0;switch(X){case 1:d=l-6;break;case 2:d=l-9;break;case 3:d=l-12;break;default:d=l}var pt=(d-Math.sqrt(Math.pow(d,2)-2*Math.abs(W*Math.pow(10,5))/(.9*.85*a*c))).toFixed(2);(.85*a*c*pt/e).toFixed(2),Math.max(.7*Math.sqrt(a)/e*c*d,14*c*d/e).toFixed(2),(.85*i*a/e*(.003/(.003+.0021))*c*d).toFixed(2),(.75*(.85*i*a/e*(.003/(.003+.0021)))*c*d).toFixed(2);let ot=`
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Esfuerzo de fluencia del acero</td>
                <td class='py-2 px-4'>fy</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${e} kg/cm<sup>2</sup></td>
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
                <td class='py-2 px-4 text-center'>${l} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Parámetro en función de la resistencia del concreto</td>
                <td class='py-2 px-4'>β1</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${i}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Deformación última del concreto</td>
                <td class='py-2 px-4'>εcu</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${dt}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Deformación de fluencia del acero</td>
                <td class='py-2 px-4'>εy</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${rt}</td>
            </tr> 
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Factor de reducción a flexión sin carga axial</td>
                <td class='py-2 px-4'>Ф</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${lt}</td>
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
        `;document.getElementById("predimenension").innerHTML=ot,nt();function nt(){var H=parseInt(document.getElementById("cuantias").value);let n=0;switch(parseInt(H)){case 1:n=.7*Math.pow(a,.5)/e;break;case 2:n=.8*Math.pow(a,.5)/e;break;case 3:n=14/e;break;default:n=0;break}document.getElementById("desingFlexion").innerHTML="";const p=parseFloat(l),r=parseFloat(c);let t=0;switch(X){case 1:t=l-6;break;case 2:t=l-9;break;case 3:t=l-12;break;default:t=l}const y=W*1e5,o=t-Math.pow(Math.pow(t,2)-2*y/(.85*.9*a*r),.5);var D=a<=280?0:(e-280)/70,J=a<=280?.85:.85-.05*D;const s=n*(r*t),g=s*.9*e*(t-o/2)/1e5,u=J*.85*a*(6e3/(6e3+e)/e),C=u*r*p,O=C*.9*e*(t-o/2)/1e5,h=.75*u,F=h*p*r,P=F*.9*e*(t-o/2)/1e5,E=.5*h,M=E*r*p,I=M*.9*e*(t-o/2)/1e5,m=y/(.9*e*(t-o/2)),b=m<F?"OK":"NO",B=m>s?"OK":"NO",x=Math.max(m,s),w=x*.9*e*(t-o/2)/1e5,A=x<=M?"Si es economico":"Es costoso",S="𝐴𝑠 𝑚𝑖𝑛 = \\frac{0.80\\sqrt{f'_c}}{f_y \\cdot b_d};\\frac{14}{f_y \\cdot b_d}",T="𝜌𝑏 = \\frac{0.85 * 𝛽_1 * 𝑓_𝑐}{f_y} * \\frac{𝜀_𝑐𝑢}{𝜀_𝑐𝑢+𝜀_𝑦}",v="𝐴𝑠 𝑚á𝑥 = 0.75 * (𝜌𝑏 * 𝑏 * d)",V="𝐴𝑠_𝑚á𝑥/2 = cuantia	 * (𝑏 * h)",L="𝑀𝑢= 𝐴𝑠 𝑚𝑖𝑛 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",q="𝑀𝑢= 𝜌𝑏 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",z="𝑀𝑢= 𝐴𝑠 𝑚á𝑥 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",U="𝑀𝑢= 𝐴𝑠 𝑚á𝑥/2 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",yt="𝑀𝑢= 𝐴𝑠  * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",K="𝐴𝑠 = \\frac{0.85 * f_c * b *a}{f_y}",gt="𝑉𝑐 = 0.53 \\cdot fy \\cdot b \\cdot \\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",mt="Ø𝑉𝑐 = 0.85 * 𝑉𝑐",it="𝑉𝑠=\\frac{𝑉𝑢}{0.85-17}",ut="𝑉𝑠 𝑚á𝑥= 2.1*f_y*b*\\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",bt="𝑉𝑠 𝑚𝑒𝑑= 1.1*f_y*b*\\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",vt="a = d - \\sqrt{d^2 - \\frac{2|Mu|}{\\phi \\cdot 0.85 \\cdot f'_c \\cdot b}}",ft=`
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
                        <td class='py-2 px-4'>\\(${S}\\)</td>
                        <td class='py-2 px-4 text-center'>${s.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento ultimo del acero minimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${L}\\)</td>
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
                        <td class='py-2 px-4 text-center'>${u.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero balanceado</td>
                        <td class='py-2 px-4'>𝜌𝑏</td>
                        <td class='py-2 px-4'>\\(${T}\\)</td>
                        <td class='py-2 px-4 text-center'>${C.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${q}\\)</td>
                        <td class='py-2 px-4 text-center'>${O.toFixed(2)} tn/m </td>
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
                        <td class='py-2 px-4'>\\(${v}\\)</td>
                        <td class='py-2 px-4 text-center'>${F.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo del acero máximo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${z}\\)</td>
                        <td class='py-2 px-4 text-center'>${P.toFixed(2)} tn/m</td>
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
                        <td class='py-2 px-4'>\\(${V}\\)</td>
                        <td class='py-2 px-4 text-center'>${M.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${U}\\)</td>
                        <td class='py-2 px-4 text-center'>${I.toFixed(2)} tn/m</td>
                    </tr>
            `;document.getElementById("desingFlexion").innerHTML=ft,MathJax.typeset();let Z=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4'>𝑎</td>
                    <td class='py-2 px-4'>\\(${vt}\\)</td>
                    <td class='py-2 px-4 text-center'>${o.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Acero real</td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${K}\\)</td>
                    <td class='py-2 px-4 text-center'>${m.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Verificacion 𝐴𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>\\(${v}\\)</td>
                    <td class='py-2 px-4 text-center'>${b}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Verificacion 𝐴𝑠_𝑚𝑖𝑛</td>
                    <td class='py-2 px-4'>𝐴𝑠_𝑚𝑖𝑛</td>
                    <td class='py-2 px-4'>\\(${v}\\)</td>
                    <td class='py-2 px-4 text-center'>${B}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Momento</td>
                    <td class='py-2 px-4'>𝑀𝑢'</td>
                    <td class='py-2 px-4'>\\(${yt}\\)</td>
                    <td class='py-2 px-4 text-center'>${w.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${K}\\)</td>
                    <td class='py-2 px-4 text-center'>${x.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4 text-center'><strong>${A}</strong></td>
                </tr>
                <tr id="aceros"></tr>
                   
            `;for(let f=0;f<1;f++){let k=document.createElement("tr");k.className="py-2 px-8 bg-gray-100 dark:bg-gray-600";let G=document.createElement("th");G.textContent="Tipo de Acero mm",G.className="py-2 px-8",k.appendChild(G);let Y=document.createElement("td");Y.textContent="",Y.className="py-2 px-8",k.appendChild(Y);let j=document.createElement("td");j.textContent="",j.className="py-2 px-8",k.appendChild(j);let _=document.createElement("select");_.className="acer-negativos form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md",_.name=`tipoAcero${f}_capa${f}`,_.id=`tipoAcero${f}_capa${f}`,[{value:"0",text:'Ø 0"'},{value:"0.283",text:"6mm"},{value:"0.503",text:"8mm cm²"},{value:"0.713",text:'Ø 3/8" cm²'},{value:"1.131",text:"12mm cm²"},{value:"1.267",text:'Ø 1/2" cm²'},{value:"1.979",text:'Ø 5/8" cm²'},{value:"2.850",text:'Ø 3/4" cm²'},{value:"5.067",text:'Ø 1" cm²'},{value:"2.58",text:'2Ø1/2"'},{value:"3.87",text:'3Ø1/2"'},{value:"3.98",text:'2Ø5/8"'},{value:"5.16",text:'4Ø1/2"'},{value:"5.27",text:'2Ø5/8"+1Ø1/2"'},{value:"5.68",text:'2Ø3/4"'},{value:"5.97",text:'3Ø5/8"'},{value:"6.45",text:'5Ø1/2"'},{value:"6.56",text:'2Ø5/8"+2Ø1/2"'},{value:"6.97",text:'2Ø3/4"+1Ø1/2"'},{value:"7.67",text:'2Ø3/4"+1Ø5/8"'},{value:"7.74",text:'6Ø1/2"'},{value:"7.85",text:'2Ø5/8"+3Ø1/2"'},{value:"7.96",text:'4Ø5/8"'},{value:"8.26",text:'2Ø3/4"+2Ø1/2"'},{value:"8.52",text:'3Ø3/4"'},{value:"8.55",text:'3Ø5/8"+2Ø1/2"'},{value:"9.55",text:'2Ø3/4"+3Ø1/2"'},{value:"9.95",text:'5Ø5/8"'},{value:"9.66",text:'2Ø3/4"+2Ø5/8"'},{value:"10.2",text:'2Ø1"'},{value:"10.54",text:'4Ø5/8"+2Ø1/2"'},{value:"10.84",text:'2Ø3/4"+4Ø1/2"'},{value:"11.1",text:'3Ø3/4"+2Ø1/2"'},{value:"11.40",text:'4Ø3/4"'},{value:"11.65",text:'2Ø3/4"+3Ø5/8"'},{value:"11.94",text:'6Ø5/8"'},{value:"12.19",text:'2Ø1"+1Ø5/8"'},{value:"12.5",text:'3Ø3/4"+2Ø5/8"'},{value:"13.04",text:'2Ø1"+1Ø3/4"'},{value:"13.64",text:'2Ø3/4"+4Ø5/8"'},{value:"13.94",text:'4Ø3/4"+2Ø1/2"'},{value:"14.18",text:'2Ø1"+2Ø5/8"'},{value:"14.2",text:'5Ø3/4"'},{value:"15.3",text:'3Ø1"'},{value:"15.34",text:'4Ø3/4"+2Ø5/8"'},{value:"15.88",text:'2Ø1"+2Ø3/4"'},{value:"16.17",text:'2Ø1"+3Ø5/8"'},{value:"17.04",text:'6Ø3/4"'},{value:"18.16",text:'2Ø1"+4Ø5/8"'},{value:"18.72",text:'2Ø1"+3Ø3/4"'},{value:"19.28",text:'3Ø1"+2Ø5/8"'},{value:"20.4",text:'4Ø1"'},{value:"20.98",text:'3Ø1"+2Ø3/4"'},{value:"21.56",text:'2Ø1"+4Ø3/4"'},{value:"24.38",text:'4Ø1"+2Ø5/8"'},{value:"25.5",text:'5Ø1"'},{value:"26.08",text:'4Ø1"+2Ø3/4"'},{value:"30.6",text:'6Ø1"'}].forEach(et=>{let Q=document.createElement("option");Q.value=et.value,Q.textContent=et.text,_.appendChild(Q)});let at=document.createElement("td");at.appendChild(_),k.appendChild(at),Z+=k.outerHTML}document.getElementById("calcared").innerHTML=Z,MathJax.typeset();const R=.53*t*c*Math.pow(a,.5)/1e3,tt=.85*R,kt=tt<N?"Para controlar el cortante":"Por proceso constructivo",$t=N/.85-R,ht=2.1*t*c*Math.pow(a,.5)/1e3,Ft=1.1*t*c*Math.pow(a,.5)/1e3;let Et=`
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
                    <td class='py-2 px-4 text-center'>${N} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Cortante del concreto</td>
                    <td class='py-2 px-4'>𝑉𝑐</td>
                    <td class='py-2 px-4'>\\(${gt}\\)</td>
                    <td class='py-2 px-4 text-center'>${R.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'>Ø𝑉𝑐</td>
                    <td class='py-2 px-4'>\\(${mt}\\)</td>
                    <td class='py-2 px-4 text-center'>${tt.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Usar estribo</td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${K}\\)</td>
                    <td class='py-2 px-4 text-center'>${kt}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠</td>
                    <td class='py-2 px-4'>\\(${it}\\)</td>
                    <td class='py-2 px-4 text-center'>${$t.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>\\(${ut}\\)</td>
                    <td class='py-2 px-4 text-center'>${ht.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠_𝑚𝑒𝑑</td>
                    <td class='py-2 px-4'>\\(${bt}\\)</td>
                    <td class='py-2 px-4 text-center'>${Ft.toFixed(2)} tn</td>
                </tr>
                
                <tr id="aceros"></tr>
            `;document.getElementById("diseñoCortes").innerHTML=Et,MathJax.typeset()}function xt(H){if(H.target.tagName.toLowerCase()==="select"){const p=parseFloat(document.getElementById("fc").value),r=parseFloat(document.getElementById("fy").value),t=parseFloat(document.getElementById("altura").value),y=parseFloat(document.getElementById("base").value),o=parseFloat(document.getElementById("momentoultimo").value),D=parseFloat(document.getElementById("capas").value),J=parseFloat(document.getElementById("vucortante").value);let s=0;switch(D){case 1:s=t-6;break;case 2:s=t-9;break;case 3:s=t-12;break;default:s=t}var n=parseInt(document.getElementById("cuantias").value);let g=0;switch(parseInt(n)){case 1:g=.7*Math.pow(p,.5)/r;break;case 2:g=.8*Math.pow(p,.5)/r;break;case 3:g=14/r;break;default:g=0;break}const u=o*1e5,C=s-Math.pow(Math.pow(s,2)-2*u/(.85*.9*p*y),.5),O=g*(y*s),h=u/(.9*r*(s-C/2)),F=Math.max(h,O),P=.53*s*y*Math.pow(p,.5)/1e3,E=J/.85-P,M=1.1*s*y*Math.pow(p,.5)/1e3,I=E<M?"Si":"No";let m="";for(let b=0;b<1;b++){const B=document.getElementById(`tipoAcero${b}_capa${b}`);let x="-";B&&(x=B.value);const w=Math.abs(2*x*r*s/(E*1e3)),A=I=="Si"?60:30,S=I=="Si"?s/2:s/4,T=10,v=Math.min(w,A,S,T),V=Math.round(v),L=Math.round(2*(t/10)),q=`1 @ 0.05 ${L} @ ${V},RESTO @  20`,z=x>=F?"Cumple":"No cumple";m+=`
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Acero a usar</td>
                            <td class='py-2 px-4'>𝐴𝑠</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${x} cm<sup>2</sup></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>verificacion</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4'>as_usar > As </td>
                            <td class='py-2 px-4 text-center'><strong>${z}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4" class='py-2 px-4'></td>
                        </tr>
                    `,document.getElementById("acerosfinales").innerHTML=m,MathJax.typeset();let U="";U=`
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
                            <td class='py-2 px-4 text-center'>${A.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆3</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${S.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆4</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${T.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>S minimo</td>
                            <td class='py-2 px-4'>𝑆</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${v.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Redondeado</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${V.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Longitud a estribar</td>
                            <td class='py-2 px-4'>𝑙</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${L.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Longitud a estribar</td>
                            <td class='py-2 px-4'>𝑙</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center' contenteditable="true">${q} cm</td>
                        </tr>
                    `,document.getElementById("aceroscortes").innerHTML=U,MathJax.typeset()}}}document.getElementById("calcared").addEventListener("change",xt),MathJax.typeset()}),document.getElementById("btn_pdf_predim").addEventListener("click",function(){$("#vigasgn").printThis({debug:!1,importCSS:!0,importStyle:!0,loadCSS:"",pageTitle:"Vigas GN",removeInline:!1,printDelay:333,header:null,footer:null,base:!1,formValues:!0,canvas:!1,doctypeString:"<!DOCTYPE html>",removeScripts:!1,copyTagClasses:!1})})});
