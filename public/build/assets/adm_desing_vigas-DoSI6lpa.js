import"./printThis-eR5fzPta.js";$(document).ready(function(){$("#desingButton").click(d=>{d.preventDefault();const l=document.getElementById("desingcorte");l.style.display="block";const t=parseFloat(document.getElementById("fc").value),e=parseFloat(document.getElementById("fy").value),a=parseFloat(document.getElementById("altura").value),o=parseFloat(document.getElementById("base").value),c=parseFloat(document.getElementById("momentoultimo").value),p=parseFloat(document.getElementById("vucortante").value),i=parseFloat(document.getElementById("capas").value);parseInt(document.getElementById("cuantias").value);let h=0;t<=280?h=.85:t>280&&t<=560?h=1.05-.714*t/1e3:h=.65;const pt=parseFloat(.003),nt=.0021,xt=parseFloat(.9);let n=0;switch(i){case 1:n=a-6;break;case 2:n=a-9;break;case 3:n=a-12;break;default:n=a}var yt=(n-Math.sqrt(Math.pow(n,2)-2*Math.abs(c*Math.pow(10,5))/(.9*.85*t*o))).toFixed(2);(.85*t*o*yt/e).toFixed(2),Math.max(.7*Math.sqrt(t)/e*o*n,14*o*n/e).toFixed(2),(.85*h*t/e*(.003/(.003+.0021))*o*n).toFixed(2),(.75*(.85*h*t/e*(.003/(.003+.0021)))*o*n).toFixed(2);let gt=`
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
                <td class='py-2 px-4 text-center'>${a} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Parámetro en función de la resistencia del concreto</td>
                <td class='py-2 px-4'>β1</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${h}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Deformación última del concreto</td>
                <td class='py-2 px-4'>εcu</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${pt}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Deformación de fluencia del acero</td>
                <td class='py-2 px-4'>εy</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${nt}</td>
            </tr> 
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-8'>Factor de reducción a flexión sin carga axial</td>
                <td class='py-2 px-4'>Ф</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4 text-center'>${xt}</td>
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
        `;document.getElementById("predimenension").innerHTML=gt,it();function it(){var D=parseInt(document.getElementById("cuantias").value);let u=0;switch(parseInt(D)){case 1:u=.7*Math.pow(t,.5)/e;break;case 2:u=.8*Math.pow(t,.5)/e;break;case 3:u=14/e;break;default:u=0;break}document.getElementById("desingFlexion").innerHTML="";const y=parseFloat(a),x=parseFloat(o);let s=0;switch(i){case 1:s=a-6;break;case 2:s=a-9;break;case 3:s=a-12;break;default:s=a}const b=c*1e5,g=s-Math.pow(Math.pow(s,2)-2*b/(.85*.9*t*x),.5);var j=t<=280?0:(e-280)/70,J=t<=280?.85:.85-.05*j;const r=u*(x*s),v=r*.9*e*(s-g/2)/1e5,F=J*.85*t*(6e3/(6e3+e)/e),T=F*x*y,z=T*.9*e*(s-g/2)/1e5,S=.75*F,_=S*y*x,K=_*.9*e*(s-g/2)/1e5,w=.5*S,B=w*x*y,L=B*.9*e*(s-g/2)/1e5,f=b/(.9*e*(s-g/2)),E=f<_?"OK":"NO",U=f>r?"OK":"NO",m=Math.max(f,r),N=m*.9*e*(s-g/2)/1e5,V=m<=B?"Si es economico":"Es costoso",H="𝐴𝑠 𝑚𝑖𝑛 = \\frac{0.80\\sqrt{f'_c}}{f_y \\cdot b_d};\\frac{14}{f_y \\cdot b_d}",O="𝜌𝑏 = \\frac{0.85 * 𝛽_1 * 𝑓_𝑐}{f_y} * \\frac{𝜀_𝑐𝑢}{𝜀_𝑐𝑢+𝜀_𝑦}",M="𝐴𝑠 𝑚á𝑥 = 0.75 * (𝜌𝑏 * 𝑏 * d)",P="𝐴𝑠_𝑚á𝑥/2 = cuantia	 * (𝑏 * h)",q="𝑀𝑢= 𝐴𝑠 𝑚𝑖𝑛 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",G="𝑀𝑢= 𝜌𝑏 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",X="𝑀𝑢= 𝐴𝑠 𝑚á𝑥 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",R="𝑀𝑢= 𝐴𝑠 𝑚á𝑥/2 * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",mt="𝑀𝑢= 𝐴𝑠  * 0.9 * f_y *  \\frac{(d - \\frac{a}{2})}{100000}",Y="𝐴𝑠 = \\frac{0.85 * f_c * b *a}{f_y}",bt="𝑉𝑐 = 0.53 \\cdot fy \\cdot b \\cdot \\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",vt="Ø𝑉𝑐 = 0.85 * 𝑉𝑐",ft="𝑉𝑠=\\frac{𝑉𝑢}{0.85-17}",kt="𝑉𝑠 𝑚á𝑥= 2.1*f_y*b*\\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",ht="𝑉𝑠 𝑚𝑒𝑑= 1.1*f_y*b*\\frac{\\left(𝑓_𝑐^{0.5}\\right)}{1000}",$t="a = d - \\sqrt{d^2 - \\frac{2|Mu|}{\\phi \\cdot 0.85 \\cdot f'_c \\cdot b}}",Ft=`
                <tbody>
                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <td colspan="4" class='text-xl py-2 px-4'><strong>2.1.- Cuantia minima</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia minima de la sección</td>
                        <td class='py-2 px-4'>Cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${u.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero minimo</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚𝑖𝑛</td>
                        <td class='py-2 px-4'>\\(${H}\\)</td>
                        <td class='py-2 px-4 text-center'>${r.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento ultimo del acero minimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${q}\\)</td>
                        <td class='py-2 px-4 text-center'>${v.toFixed(2)} tn/m </td>
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
                        <td class='py-2 px-4'>\\(${O}\\)</td>
                        <td class='py-2 px-4 text-center'>${T.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${G}\\)</td>
                        <td class='py-2 px-4 text-center'>${z.toFixed(2)} tn/m </td>
                    </tr>

                    <!--==================================rmax===============================-->
                    
                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                        <td colspan="4" class="text-xl py-2 px-4"><strong>2.3.-Cuantia máxima</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia máxima en la sección</td>
                        <td class='py-2 px-4'>Cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${S.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero máximo</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥</td>
                        <td class='py-2 px-4'>\\(${M}\\)</td>
                        <td class='py-2 px-4 text-center'>${_.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo del acero máximo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${X}\\)</td>
                        <td class='py-2 px-4 text-center'>${K.toFixed(2)} tn/m</td>
                    </tr>

                    <!--==================================reconomico===============================-->
                    
                    <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                        <td colspan="4" class="text-xl py-2 px-4"><strong>2.4.-Cuantia económico</strong></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Cuantia económico</td>
                        <td class='py-2 px-4'>cuantia</td>
                        <td class='py-2 px-4'></td>
                        <td class='py-2 px-4 text-center'>${w.toFixed(4)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Area del acero económico</td>
                        <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥/2</td> 
                        <td class='py-2 px-4'>\\(${P}\\)</td>
                        <td class='py-2 px-4 text-center'>${B.toFixed(2)} cm<sup>2</sup></td>
                    </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                        <td class='py-2 px-8'>Momento Ultimo</td>
                        <td class='py-2 px-4'>𝑀𝑢'</td>
                        <td class='py-2 px-4'>\\(${R}\\)</td>
                        <td class='py-2 px-4 text-center'>${L.toFixed(2)} tn/m</td>
                    </tr>
            `;document.getElementById("desingFlexion").innerHTML=Ft,MathJax.typeset();let at=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4'>𝑎</td>
                    <td class='py-2 px-4'>\\(${$t}\\)</td>
                    <td class='py-2 px-4 text-center'>${g.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Acero real</td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${Y}\\)</td>
                    <td class='py-2 px-4 text-center'>${f.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Verificacion 𝐴𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>𝐴𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>\\(${M}\\)</td>
                    <td class='py-2 px-4 text-center'>${E}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Verificacion 𝐴𝑠_𝑚𝑖𝑛</td>
                    <td class='py-2 px-4'>𝐴𝑠_𝑚𝑖𝑛</td>
                    <td class='py-2 px-4'>\\(${M}\\)</td>
                    <td class='py-2 px-4 text-center'>${U}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Momento</td>
                    <td class='py-2 px-4'>𝑀𝑢'</td>
                    <td class='py-2 px-4'>\\(${mt}\\)</td>
                    <td class='py-2 px-4 text-center'>${N.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${Y}\\)</td>
                    <td class='py-2 px-4 text-center'>${m.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4'></td>
                    <td class='py-2 px-4 text-center'><strong>${V}</strong></td>
                </tr>
                <tr id="aceros"></tr>
                   
            `;for(let A=0;A<1;A++){let C=document.createElement("tr");C.className="py-2 px-8 bg-gray-100 dark:bg-gray-600";let W=document.createElement("th");W.textContent="Tipo de Acero mm",W.className="py-2 px-8",C.appendChild(W);let Z=document.createElement("td");Z.textContent="",Z.className="py-2 px-8",C.appendChild(Z);let tt=document.createElement("td");tt.textContent="",tt.className="py-2 px-8",C.appendChild(tt);let I=document.createElement("select");I.className="acer-negativos form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md",I.name=`tipoAcero${A}_capa${A}`,I.id=`tipoAcero${A}_capa${A}`,[{value:"0",text:'Ø 0"'},{value:"0.283",text:"6mm"},{value:"0.503",text:"8mm cm²"},{value:"0.713",text:'Ø 3/8" cm²'},{value:"1.131",text:"12mm cm²"},{value:"1.267",text:'Ø 1/2" cm²'},{value:"1.979",text:'Ø 5/8" cm²'},{value:"2.850",text:'Ø 3/4" cm²'},{value:"5.067",text:'Ø 1" cm²'},{value:"2.58",text:'2Ø1/2"'},{value:"3.87",text:'3Ø1/2"'},{value:"3.98",text:'2Ø5/8"'},{value:"5.16",text:'4Ø1/2"'},{value:"5.27",text:'2Ø5/8"+1Ø1/2"'},{value:"5.68",text:'2Ø3/4"'},{value:"5.97",text:'3Ø5/8"'},{value:"6.45",text:'5Ø1/2"'},{value:"6.56",text:'2Ø5/8"+2Ø1/2"'},{value:"6.97",text:'2Ø3/4"+1Ø1/2"'},{value:"7.67",text:'2Ø3/4"+1Ø5/8"'},{value:"7.74",text:'6Ø1/2"'},{value:"7.85",text:'2Ø5/8"+3Ø1/2"'},{value:"7.96",text:'4Ø5/8"'},{value:"8.26",text:'2Ø3/4"+2Ø1/2"'},{value:"8.52",text:'3Ø3/4"'},{value:"8.55",text:'3Ø5/8"+2Ø1/2"'},{value:"9.55",text:'2Ø3/4"+3Ø1/2"'},{value:"9.95",text:'5Ø5/8"'},{value:"9.66",text:'2Ø3/4"+2Ø5/8"'},{value:"10.2",text:'2Ø1"'},{value:"10.54",text:'4Ø5/8"+2Ø1/2"'},{value:"10.84",text:'2Ø3/4"+4Ø1/2"'},{value:"11.1",text:'3Ø3/4"+2Ø1/2"'},{value:"11.40",text:'4Ø3/4"'},{value:"11.65",text:'2Ø3/4"+3Ø5/8"'},{value:"11.94",text:'6Ø5/8"'},{value:"12.19",text:'2Ø1"+1Ø5/8"'},{value:"12.5",text:'3Ø3/4"+2Ø5/8"'},{value:"13.04",text:'2Ø1"+1Ø3/4"'},{value:"13.64",text:'2Ø3/4"+4Ø5/8"'},{value:"13.94",text:'4Ø3/4"+2Ø1/2"'},{value:"14.18",text:'2Ø1"+2Ø5/8"'},{value:"14.2",text:'5Ø3/4"'},{value:"15.3",text:'3Ø1"'},{value:"15.34",text:'4Ø3/4"+2Ø5/8"'},{value:"15.88",text:'2Ø1"+2Ø3/4"'},{value:"16.17",text:'2Ø1"+3Ø5/8"'},{value:"17.04",text:'6Ø3/4"'},{value:"18.16",text:'2Ø1"+4Ø5/8"'},{value:"18.72",text:'2Ø1"+3Ø3/4"'},{value:"19.28",text:'3Ø1"+2Ø5/8"'},{value:"20.4",text:'4Ø1"'},{value:"20.98",text:'3Ø1"+2Ø3/4"'},{value:"21.56",text:'2Ø1"+4Ø3/4"'},{value:"24.38",text:'4Ø1"+2Ø5/8"'},{value:"25.5",text:'5Ø1"'},{value:"26.08",text:'4Ø1"+2Ø3/4"'},{value:"30.6",text:'6Ø1"'}].forEach(rt=>{let et=document.createElement("option");et.value=rt.value,et.textContent=rt.text,I.appendChild(et)});let ct=document.createElement("td");ct.appendChild(I),C.appendChild(ct),at+=C.outerHTML}document.getElementById("calcared").innerHTML=at,MathJax.typeset();const Q=.53*s*o*Math.pow(t,.5)/1e3,st=.85*Q,Et=st<p?"Para controlar el cortante":"Por proceso constructivo",Mt=p/.85-Q,At=2.1*s*o*Math.pow(t,.5)/1e3,Ct=1.1*s*o*Math.pow(t,.5)/1e3;let St=`
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
                    <td class='py-2 px-4'>\\(${bt}\\)</td>
                    <td class='py-2 px-4 text-center'>${Q.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'></td>
                    <td class='py-2 px-4'>Ø𝑉𝑐</td>
                    <td class='py-2 px-4'>\\(${vt}\\)</td>
                    <td class='py-2 px-4 text-center'>${st.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Usar estribo</td>
                    <td class='py-2 px-4'>𝐴𝑠</td>
                    <td class='py-2 px-4'>\\(${Y}\\)</td>
                    <td class='py-2 px-4 text-center'>${Et}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠</td>
                    <td class='py-2 px-4'>\\(${ft}\\)</td>
                    <td class='py-2 px-4 text-center'>${Mt.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠_𝑚á𝑥</td>
                    <td class='py-2 px-4'>\\(${kt}\\)</td>
                    <td class='py-2 px-4 text-center'>${At.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td class='py-2 px-8'>Aporte del acero</td>
                    <td class='py-2 px-4'>𝑉𝑠_𝑚𝑒𝑑</td>
                    <td class='py-2 px-4'>\\(${ht}\\)</td>
                    <td class='py-2 px-4 text-center'>${Ct.toFixed(2)} tn</td>
                </tr>
                
                <tr id="aceros"></tr>
            `;document.getElementById("diseñoCortes").innerHTML=St,MathJax.typeset()}function ut(D){if(D.target.tagName.toLowerCase()==="select"){const y=parseFloat(document.getElementById("fc").value),x=parseFloat(document.getElementById("fy").value),s=parseFloat(document.getElementById("altura").value),b=parseFloat(document.getElementById("base").value),g=parseFloat(document.getElementById("momentoultimo").value),j=parseFloat(document.getElementById("capas").value),J=parseFloat(document.getElementById("vucortante").value);let r=0;switch(j){case 1:r=s-6;break;case 2:r=s-9;break;case 3:r=s-12;break;default:r=s}var u=parseInt(document.getElementById("cuantias").value);let v=0;switch(parseInt(u)){case 1:v=.7*Math.pow(y,.5)/x;break;case 2:v=.8*Math.pow(y,.5)/x;break;case 3:v=14/x;break;default:v=0;break}const F=g*1e5,T=r-Math.pow(Math.pow(r,2)-2*F/(.85*.9*y*b),.5),z=v*(b*r),S=F/(.9*x*(r-T/2)),_=Math.max(S,z),K=.53*r*b*Math.pow(y,.5)/1e3,w=J/.85-K,B=1.1*r*b*Math.pow(y,.5)/1e3,L=w<B?"Si":"No";let f="";for(let E=0;E<1;E++){const U=document.getElementById(`tipoAcero${E}_capa${E}`);let m="-";U&&(m=U.value);const N=Math.abs(2*m*x*r/(w*1e3)),V=L=="Si"?60:30,H=L=="Si"?r/2:r/4,O=10,M=Math.min(N,V,H,O),P=Math.round(M),q=Math.round(2*(s/10)),G=`1 @ 0.05 ${q} @ ${P},RESTO @  20`,X=m>=_?"Cumple":"No cumple";f+=`
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Acero a usar</td>
                            <td class='py-2 px-4'>𝐴𝑠</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${m} cm<sup>2</sup></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>verificacion</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4'>as_usar > As </td>
                            <td class='py-2 px-4 text-center'><strong>${X}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4" class='py-2 px-4'></td>
                        </tr>
                    `,document.getElementById("acerosfinales").innerHTML=f,MathJax.typeset();let R="";R=`
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆1</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${N.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆2</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${V.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆3</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${H.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Separacion</td>
                            <td class='py-2 px-4'>𝑆4</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${O.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>S minimo</td>
                            <td class='py-2 px-4'>𝑆</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${M.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Redondeado</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${P.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Longitud a estribar</td>
                            <td class='py-2 px-4'>𝑙</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center'>${q.toFixed(2)} cm</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-8'>Longitud a estribar</td>
                            <td class='py-2 px-4'>𝑙</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4 text-center' contenteditable="true">${G} cm</td>
                        </tr>
                    `,document.getElementById("aceroscortes").innerHTML=R,MathJax.typeset()}}}document.getElementById("calcared").addEventListener("change",ut),MathJax.typeset()}),document.getElementById("btn_pdf_predim").addEventListener("click",function(){$("#vigasgn").printThis({debug:!1,importCSS:!0,importStyle:!0,loadCSS:"",pageTitle:"Vigas GN",removeInline:!1,printDelay:333,header:null,footer:null,base:!1,formValues:!0,canvas:!1,doctypeString:"<!DOCTYPE html>",removeScripts:!1,copyTagClasses:!1})});const k=document.getElementById("btn_captura_resultado");function dt(d){const l=d.cloneNode(!0),t=d.querySelectorAll("input, select, textarea"),e=l.querySelectorAll("input, select, textarea");return t.forEach((a,o)=>{const c=e[o];if(c){if(a.tagName==="INPUT"){const p=(a.type||"").toLowerCase();p==="checkbox"||p==="radio"?a.checked?c.setAttribute("checked","checked"):c.removeAttribute("checked"):(c.setAttribute("value",a.value),c.value=a.value)}a.tagName==="TEXTAREA"&&(c.value=a.value,c.textContent=a.value),a.tagName==="SELECT"&&(c.value=a.value,Array.from(c.options).forEach(p=>{p.value===a.value?(p.setAttribute("selected","selected"),p.selected=!0):(p.removeAttribute("selected"),p.selected=!1)}))}}),l}function lt(){const d=new Date,l=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-"),t=[String(d.getHours()).padStart(2,"0"),String(d.getMinutes()).padStart(2,"0"),String(d.getSeconds()).padStart(2,"0")].join("-");return`resultado_viga_${l}_${t}.png`}function ot(d,l){const t=window.URL.createObjectURL(d),e=document.createElement("a");e.href=t,e.download=l,document.body.appendChild(e),e.click(),e.remove(),window.URL.revokeObjectURL(t)}k.addEventListener("click",async()=>{const d=k.textContent;try{const l=document.getElementById("vigasgn");if(!l||l.innerHTML.trim()===""){alert("Primero debes generar los resultados.");return}k.disabled=!0,k.textContent="Generando...";const t=dt(l),e=Array.from(document.querySelectorAll('link[rel="stylesheet"]'),i=>i.href).filter(Boolean),a=Array.from(document.querySelectorAll("style"),i=>i.outerHTML).join(`
`),o={html:t.outerHTML,stylesheets:e,inlineStyles:a},c=await fetch("/capturar-viga-fragmento",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),Accept:"application/json"},body:JSON.stringify(o)});if(!c.ok){const i=await c.text();throw console.error("STATUS:",c.status),console.error("RESPUESTA:",i),new Error(`Error ${c.status} al generar la imagen.`)}const p=await c.blob();ot(p,lt())}catch(l){console.error("Error en captura:",l),alert(l.message||"Error al generar la imagen.")}finally{k.disabled=!1,k.textContent=d}})});
