import"./printThis-eR5fzPta.js";$(document).ready(function(){const ht=document.getElementById("num_tramos"),Nt=document.getElementById("tablaContainer"),We=document.getElementById("prevButton"),ta=document.getElementById("nextButton");document.getElementById("FlexionViga"),document.getElementById("resultados");let K=1;ht.addEventListener("input",()=>{K=1,Rt()});let y=[],rt=[],J=[],lt=[];function ea(e){const a=document.getElementById("fc").value,p=document.getElementById("fy").value,x=document.getElementById("num_tramos").value,n=[],s=[],o=[];rt=[];const h=[];for(let m=1;m<=x*3;m++){const C=document.getElementById(`base-${m}`).value;console.log(C),n.push(parseFloat(C));const T=document.getElementById(`altura-${m}`).value;s.push(parseFloat(T));const V=document.getElementById(`MU-${m}`).value;o.push(parseFloat(V)),document.getElementById(`Vu-${m}`).value,document.getElementById(`Tu-${m}`).value,document.getElementById(`MuCM-${m}`).value,document.getElementById(`MuCV-${m}`).value;const i=document.getElementById(`capas-${m}`).value;h.push(parseFloat(i))}if(e.target.tagName.toLowerCase()==="select"){console.log(`El valor seleccionado para ${e.target.name} es ${e.target.value}`);const m="Mn= (0.85 * 𝑓^′ c * b * a) * (d-\\frac{a}{2})";let C=`
              <table class="table table-hover" id="vigaspdf">
                <thead>
                 
                </thead>
                <tbody>
            `;y=Array(x*3).fill(0);const T=Math.max(...h);for(let l=0;l<T;l++)for(let u=0;u<x*3;u++){const v=parseFloat(document.getElementById(`tipoAcero${u}_capa${l}`).value);y[u]+=v}y=y.map(l=>Math.round(l*100)/100);let V=[],i=[],M=[],U=[],q=[];for(let l=0;l<x*3;l++){let u=0;switch(a<=280?u=.85:a>280&&a<=560?u=1.05-.714*a/1e3:u=.65,M.push(u),h[l]){case 1:d=s[l]-6;break;case 2:d=s[l]-8;break;case 3:d=s[l]-10;break;case 4:d=s[l]-12;break;case 5:d=s[l]-14;break;case 6:d=s[l]-16;break;default:d=s[l]}i.push(d);var j=y[l]*p/(.85*a*n[l]);let v=.9*(.85*a*n[l]*j)*(i[l]-j/2)/1e5;rt.push(v);var g=d-Math.sqrt(Math.pow(d,2)-2*Math.abs(o[l]*Math.pow(10,5))/(.9*.85*a*n[l])),B=.85*a*n[l]*g/p,P=Math.max(.7*Math.sqrt(a)/p*n[l]*d,14*n[l]*d/p).toFixed(2);(.85*M[l]*a/p*(.003/(.003+.0021))*n[l]*d).toFixed(2);var _=(.75*(.85*M[l]*a/p*(.003/(.003+.0021)))*n[l]*d).toFixed(2);U.push(_);let b=0;parseFloat(B)<parseFloat(P)?b=parseFloat(P):parseFloat(B)>parseFloat(P)&&parseFloat(B)<parseFloat(_)?b=parseFloat(B):b=parseFloat(_),q.push(b);let S="";y[l]<U[l]&&y[l]>=q[l]?S="CUMPLE":S="NO CUMPLE",V.push(S)}C+=`
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <td class="py-2 px-4">Acero Real</td>
                    <td class="py-2 px-4">As</td>
                    <td class="py-2 px-4"></td>
                    <td class="py-2 px-4">𝐴𝑠=(0.85∗𝑓^′ 𝑐∗𝑏∗𝑎)/𝑓𝑦</td>
                    <td class="py-2 px-4"></td>
                    ${y.map(l=>`<td class='py-2 px-4 text-center'>${l.toFixed(2)} cm</td>`).join("")}
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <td class="py-2 px-4">momento resistente en "tonf-m"</td>
                    <td class="py-2 px-4">ФMn</td>
                    <td class="py-2 px-4"></td>
                    <td class="py-2 px-4">\\(${m}\\)</td>
                    <td class="py-2 px-4"></td>
                    ${rt.map(l=>`<td class='py-2 px-4 text-center'>${l.toFixed(2)}</td>`).join("")}
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <td class="py-2 px-4">Verifificacion</td>
                    <td class="py-2 px-4">Verif.</td>
                    <td class="py-2 px-4"></td>
                    <td class="py-2 px-4"></td>
                    <td class="py-2 px-4"></td>
                    ${V.map(l=>`<td class='py-2 px-4 text-center'>${l}</td>`).join("")}
                </tr>
                </tbody>
              </table>
            `,document.getElementById("calc_vigas_verficado").innerHTML=C,MathJax.typeset()}}document.getElementById("calc_vigas_negativos").addEventListener("change",ea);function aa(e){const a=parseFloat(document.getElementById("fc").value),p=parseFloat(document.getElementById("fy").value),x=document.getElementById("num_tramos").value,n=[],s=[],o=[],h=[];lt=[];const j=[];for(let i=1;i<=x*3;i++){const M=document.getElementById(`base-${i}`).value;console.log(M),n.push(parseFloat(M));const U=document.getElementById(`altura-${i}`).value;s.push(parseFloat(U));const q=document.getElementById(`MU-${i}`).value;h.push(parseFloat(q)),document.getElementById(`MuCM--${i}`).value,document.getElementById(`MuCV--${i}`).value;const l=document.getElementById(`MU--${i}`).value;o.push(parseFloat(l)),document.getElementById(`Vu--${i}`).value,document.getElementById(`Tu--${i}`).value;const u=document.getElementById(`capas--${i}`).value;j.push(parseFloat(u))}if(e.target.tagName.toLowerCase()==="select"){console.log(`El valor seleccionado para ${e.target.name} es ${e.target.value}`);const i="Mn= (0.85 * 𝑓^′ c * b * a) * (d-\\frac{a}{2})";J=Array(x*3).fill(0);const M=Math.max(...j);let U=`
               <table id="desingcorte" class="min-w-full text-gray-800 dark:text-white" id="vigaspdf">
                <thead class="bg-gray-200 dark:bg-gray-800">>

                </thead>
                <tbody>
            `;for(let r=0;r<M;r++)for(let L=0;L<x*3;L++){const G=parseFloat(document.getElementById(`tipoAceroB${L}_capa${r}`).value);J[L]+=G}J=J.map(r=>Math.round(r*100)/100);let q=[],l=[],u=[],v=[],b=[],S=[],Q=[],f=[];for(let r=0;r<x*3;r++){let L=0;a<=280?L=.85:a>280&&a<=560?L=1.05-.714*a/1e3:L=.65,q.push(L);var g=0;switch(j[r]){case 1:g=s[r]-6;break;case 2:g=s[r]-8;break;case 3:g=s[r]-10;break;case 4:g=s[r]-12;break;case 5:g=s[r]-14;break;case 6:g=s[r]-16;break}b.push(g);var B=J[r]*p/(.85*a*n[r]);let G=.9*(.85*a*n[r]*B)*(b[r]-B/2)/1e5;lt.push(G);var P=-h[r]/3;u.push(P);var _=0;o[r]>u[r]?_=o[r]:_=u[r],v.push(_);var m=b[r]-Math.sqrt(Math.pow(b[r],2)-2*Math.abs(v[r]*Math.pow(10,5))/(.9*.85*a*n[r]));S.push(m);var C=.85*a*n[r]*S[r]/p,T=Math.max(.7*Math.sqrt(a)/p*n[r]*b[r],14*n[r]*b[r]/p),V=.75*(.85*q[r]*a/p*(.003/(.003+.0021)))*n[r]*b[r];Q.push(V);let O=0;parseFloat(C)<parseFloat(T)?O=parseFloat(T):parseFloat(C)>parseFloat(T)&&parseFloat(C)<parseFloat(V)?O=parseFloat(C):O=parseFloat(V),f.push(O);let Y="";J[r]<Q[r]&&J[r]>=f[r]?Y="CUMPLE":Y="NO CUMPLE",l.push(Y)}U+=`
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <td class="py-2 px-4">Acero Real</td>
                    <td class="py-2 px-4">As</td>
                    <td class="py-2 px-4"></td>
                    <td class="py-2 px-4"></td>
                    ${J.map(r=>`<td class='py-2 px-4 text-center'>${r.toFixed(2)} cm</td>`).join("")}
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <td class="py-2 px-4">momento resistente en "tonf-m"</td>
                    <td class="py-2 px-4">ФMn</td>
                    <td class="py-2 px-4"></td>
                    <td class="py-2 px-4">\\(${i}\\)</td>
                    ${lt.map(r=>`<td class='py-2 px-4 text-center'>${r.toFixed(2)}</td>`).join("")}
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <td class="py-2 px-4">Verifificacion</td>
                    <td class="py-2 px-4">Verif.</td>
                    <td class="py-2 px-4"></td>
                    <td class="py-2 px-4"></td>
                    ${l.map(r=>`<td class='py-2 px-4 text-center'>${r}</td>`).join("")}
                </tr>
                </tbody>
              </table>
            `,document.getElementById("calc_vigas_verficado_pos").innerHTML=U,MathJax.typeset()}}document.getElementById("calc_vigas_positivos").addEventListener("change",aa);function sa(e){let a=[];const p=parseInt(document.getElementById("num_tramos").value),x=3;for(let s=0;s<p;s++){let o=s*x,h=o+x-1;h>=e.length&&(h=e.length-1);let j=parseFloat(e[o]),g=parseFloat(e[h]);var n=(Math.max(j,g)/.9).toFixed(2);a.push(n)}return a}function ra(e){let a=[];const p=parseInt(document.getElementById("num_tramos").value),x=3;for(let s=0;s<p;s++){let o=s*x+1;o>=e.length&&(o=e.length-1);var n=(parseFloat(e[o])/.9).toFixed(2);a.push(n)}return a}document.getElementById("accionButton").addEventListener("click",e=>{e.preventDefault();const a=document.getElementById("fc").value,p=document.getElementById("fy").value,x=document.getElementById("num_tramos").value,n=[];for(let t=1;t<=x;t++){const c=document.getElementById(`luz-libre-${t}`).value;n.push(parseFloat(c))}const s=[],o=[],h=[],j=[],g=[],B=[],P=[];for(let t=1;t<=x*3;t++){const c=document.getElementById(`base-${t}`).value;console.log(c),s.push(parseFloat(c));const E=document.getElementById(`altura-${t}`).value;o.push(parseFloat(E));const R=document.getElementById(`MU-${t}`).value;h.push(parseFloat(R));const H=document.getElementById(`Vu-${t}`).value;j.push(parseFloat(H)),document.getElementById(`Tu-${t}`).value;const A=document.getElementById(`MuCM-${t}`).value;g.push(parseFloat(A));const I=document.getElementById(`MuCV-${t}`).value;B.push(parseFloat(I));const St=document.getElementById(`capas-${t}`).value;P.push(parseFloat(St))}const _=[],m=[],C=[],T=[];for(let t=1;t<=x*3;t++){const c=document.getElementById(`MuCM--${t}`).value;m.push(parseFloat(c));const E=document.getElementById(`MuCV--${t}`).value;C.push(parseFloat(E));const R=document.getElementById(`MU--${t}`).value;_.push(parseFloat(R)),document.getElementById(`Vu--${t}`).value,document.getElementById(`Tu--${t}`).value;const H=document.getElementById(`capas--${t}`).value;T.push(parseFloat(H))}const V=x*3;let i=[];for(let t=0;t<V;t++){let c="";switch(t%3){case 0:c="START";break;case 1:c="MIDDLE";break;case 2:c="END";break}i.push(`<th class='text-center' scope='col'>${c}</th>`)}let M=i.join(""),U=[],q=[],l=[],u=[],v=[],b=[],S=[],Q=[];for(let t=0;t<V;t++){U.push(p),q.push(a),l.push(s[t]),u.push(o[t]);let c=0;a<=280?c=.85:a>280&&a<=560?c=1.05-.714*a/1e3:c=.65,v.push(c),b.push(.003),S.push(.0021),Q.push(.9)}let f=[],r=[],L=[],G=[],O=[],Y=[],Ot=[],F=0;for(let t=0;t<x*3;t++){switch(P[t]){case 1:F=o[t]-6;break;case 2:F=o[t]-8;break;case 3:F=o[t]-10;break;case 4:F=o[t]-12;break;case 5:F=o[t]-14;break;case 6:F=o[t]-16;break;default:F=o[t]}f.push(F);var Zt=(F-Math.sqrt(Math.pow(F,2)-2*Math.abs(h[t]*Math.pow(10,5))/(.9*.85*a*s[t]))).toFixed(2);Ot.push(Zt);var W=(.85*a*s[t]*Zt/p).toFixed(2);r.push(W);var dt=Math.max(.7*Math.sqrt(a)/p*s[t]*F,14*s[t]*F/p).toFixed(2);L.push(dt);var pa=(.85*v[t]*a/p*(.003/(.003+.0021))*s[t]*F).toFixed(2);G.push(pa);var vt=(.75*(.85*v[t]*a/p*(.003/(.003+.0021)))*s[t]*F).toFixed(2);O.push(vt);let c=0;parseFloat(W)<parseFloat(dt)?c=parseFloat(dt):parseFloat(W)>parseFloat(dt)&&parseFloat(W)<parseFloat(vt)?c=parseFloat(W):c=parseFloat(vt),Y.push(c)}const Xt="a = d - \\sqrt{d^2 - \\frac{2|Mu|}{\\phi \\cdot 0.85 \\cdot f'_c \\cdot b}}",Kt="𝐴𝑠 = \\frac{0.85 * f_c * b *a}{f_y}",Gt="𝐴𝑠 𝑚𝑖𝑛 = \\frac{0.80\\sqrt{f'_c}}{f_y \\cdot b_d};\\frac{14}{f_y \\cdot b_d}",Yt="𝜌𝑏 = \\frac{0.85 * 𝛽_1 * 𝑓_𝑐}{f_y} * \\frac{𝜀_𝑐𝑢}{𝜀_𝑐𝑢+𝜀_𝑦}",oa="𝐴𝑠 𝑚á𝑥 = 0.75 * (𝜌𝑏 * 𝑏 * d)",Qt="𝑀𝑢(-)=1/3𝑀𝑢(+)=𝑀𝑢/3";let z=`
                <table class="table table-hover"  id="vigaspdf">
                    <thead>
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th scope="col" class="text-left">1.- Requisitos de diseño</th>
                            <th scope="col"></th>
                            <th scope="col"></th>
                            ${M} 
                        </tr>
                    </thead>
                    <tbody class="datos_relleno">
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Esfuerzo de fluencia del acero</td>
                            <td class="py-2 px-4">fy</td>
                            <td class="py-2 px-4"></td>
                            ${U.map(t=>`<td class='text-center'>${t} kg/cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Esfuerzo de comprension del concreto</td>
                            <td class="py-2 px-4">f'c</td>
                            <td class="py-2 px-4"></td>
                            ${q.map(t=>`<td class='text-center'>${t} kg/cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Base de la Viga</td>
                            <td class="py-2 px-4">b</td>
                            <td class="py-2 px-4"></td>
                            ${l.map(t=>`<td class='text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Altura de la Viga</td>
                            <td class="py-2 px-4">h</td>
                            <td class="py-2 px-4"></td>
                            ${u.map(t=>`<td class='text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Parámetro en función de la resistencia del concreto</td>
                            <td class="py-2 px-4">β1</td>
                            <td class="py-2 px-4"></td>
                            ${v.map(t=>`<td class='text-center'>${t}</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Deformación última del concreto</td>
                            <td class="py-2 px-4">εcu</td>
                            <td class="py-2 px-4"></td>
                            ${b.map(t=>`<td class='text-center'>${t}</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Deformación de fluencia del acero</td>
                            <td class="py-2 px-4">εy</td>
                            <td class="py-2 px-4"></td>
                            ${S.map(t=>`<td class='text-center'>${t}</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Factor de reducción a flexión sin carga axial</td>
                            <td class="py-2 px-4">Ф</td>
                            <td class="py-2 px-4"></td>
                            ${Q.map(t=>`<td class='text-center'>${t}</td>`).join("")}
                        </tr>
                    </tbody> 
    
                    <thead>
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th scope="col" class="text-left">2.- Diseño de flexion</th>
                            <th scope="col"></th>
                            <th scope="col"></th>
                            ${M}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <th scope="col" class="sub_sub_encabezados">Parte negativo</th>
                        </tr>
                    </thead>
                    <tbody class="datos_relleno">
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Peralte efectivo en "cm"</td>
                            <td class="py-2 px-4">d</td>
                            <td class="py-2 px-4"></td>
                            ${f.map(t=>`<td class='text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Altura del bloque comprimido en "cm"</td>
                            <td class="py-2 px-4">𝑎</td>
                            <td class="py-2 px-4">\\(${Xt}\\)</td>
                            ${Ot.map(t=>`<td class='text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Refuerzo calculado en "cm2"</td>
                            <td class="py-2 px-4">𝐴𝑠</td>
                            <td class="py-2 px-4">\\(${Kt}\\)</td>
                            ${r.map(t=>`<td class='text-center'>${t} cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Refuerzo mínimo en "cm2"</td>
                            <td class="py-2 px-4">𝐴𝑠_𝑚𝑖𝑛	</td>
                            <td class="py-2 px-4">\\(${Gt}\\)</td>
                            ${L.map(t=>`<td class='text-center'>${t} cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Area de acero balanceado</td>
                            <td class="py-2 px-4">𝜌𝑏</td>
                            <td class="py-2 px-4">\\(${Yt}\\)</td>
                            ${G.map(t=>`<td class='text-center'>${t} cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Refuerzo máximo en "cm2"</td>
                            <td class="py-2 px-4">𝐴𝑠_𝑚á𝑥 75%Asb</td>
                            <td class="py-2 px-4">𝐴𝑠_𝑚á𝑥=0.75∗(𝜌_𝑏 "∗b∗d" )</td>
                            ${O.map(t=>`<td class='text-center'>${t}cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Acero a Usar</td>
                            <td class="py-2 px-4">𝐴𝑠_usar</td>
                            <td class="py-2 px-4"></td>
                            ${Y.map(t=>`<td class='text-center'>${t}cm<sup>2<sup></td>`).join("")}
                        </tr>
                    </tbody>`;const xa=Math.max(...P);for(let t=0;t<xa;t++){let c=document.createElement("tr");c.className="bg-gray-500 text-white dark:bg-gray-500 dark:text-white";let E=document.createElement("td");E.textContent="Tipo de Acero mm",c.appendChild(E);let R=document.createElement("td");R.textContent=`Capa ${t+1}`,c.appendChild(R);let H=document.createElement("td");H.textContent="",c.appendChild(H);for(let A=0;A<x*3;A++){let I=document.createElement("select");I.className="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md",I.name=`tipoAcero${A}_capa${t}`,I.id=`tipoAcero${A}_capa${t}`,[{value:"0",text:'Ø 0"'},{value:"0.283",text:"6mm"},{value:"0.503",text:"8mm cm²"},{value:"0.713",text:'Ø 3/8" cm²'},{value:"1.131",text:"12mm cm²"},{value:"1.267",text:'Ø 1/2" cm²'},{value:"1.979",text:'Ø 5/8" cm²'},{value:"2.850",text:'Ø 3/4" cm²'},{value:"5.067",text:'Ø 1" cm²'},{value:"2.58",text:'2Ø1/2"'},{value:"3.87",text:'3Ø1/2"'},{value:"3.98",text:'2Ø5/8"'},{value:"5.16",text:'4Ø1/2"'},{value:"5.27",text:'2Ø5/8"+1Ø1/2"'},{value:"5.68",text:'2Ø3/4"'},{value:"5.97",text:'3Ø5/8"'},{value:"6.45",text:'5Ø1/2"'},{value:"6.56",text:'2Ø5/8"+2Ø1/2"'},{value:"6.97",text:'2Ø3/4"+1Ø1/2"'},{value:"7.67",text:'2Ø3/4"+1Ø5/8"'},{value:"7.74",text:'6Ø1/2"'},{value:"7.85",text:'2Ø5/8"+3Ø1/2"'},{value:"7.916",text:'4Ø5/8"'},{value:"8.26",text:'2Ø3/4"+2Ø1/2"'},{value:"8.52",text:'3Ø3/4"'},{value:"8.55",text:'3Ø5/8"+2Ø1/2"'},{value:"9.55",text:'2Ø3/4"+3Ø1/2"'},{value:"9.95",text:'5Ø5/8"'},{value:"9.66",text:'2Ø3/4"+2Ø5/8"'},{value:"10.2",text:'2Ø1"'},{value:"10.54",text:'4Ø5/8"+2Ø1/2"'},{value:"10.84",text:'2Ø3/4"+4Ø1/2"'},{value:"11.1",text:'3Ø3/4"+2Ø1/2"'},{value:"11.40",text:'4Ø3/4"'},{value:"11.65",text:'2Ø3/4"+3Ø5/8"'},{value:"11.94",text:'6Ø5/8"'},{value:"12.19",text:'2Ø1"+1Ø5/8"'},{value:"12.5",text:'3Ø3/4"+2Ø5/8"'},{value:"13.04",text:'2Ø1"+1Ø3/4"'},{value:"13.64",text:'2Ø3/4"+4Ø5/8"'},{value:"13.94",text:'4Ø3/4"+2Ø1/2"'},{value:"14.18",text:'2Ø1"+2Ø5/8"'},{value:"14.2",text:'5Ø3/4"'},{value:"15.3",text:'3Ø1"'},{value:"15.34",text:'4Ø3/4"+2Ø5/8"'},{value:"15.88",text:'2Ø1"+2Ø3/4"'},{value:"16.17",text:'2Ø1"+3Ø5/8"'},{value:"17.04",text:'6Ø3/4"'},{value:"18.16",text:'2Ø1"+4Ø5/8"'},{value:"18.72",text:'2Ø1"+3Ø3/4"'},{value:"19.28",text:'3Ø1"+2Ø5/8"'},{value:"20.4",text:'4Ø1"'},{value:"20.98",text:'3Ø1"+2Ø3/4"'},{value:"21.56",text:'2Ø1"+4Ø3/4"'},{value:"24.38",text:'4Ø1"+2Ø5/8"'},{value:"25.5",text:'5Ø1"'},{value:"26.08",text:'4Ø1"+2Ø3/4"'},{value:"30.6",text:'6Ø1"'}].forEach(st=>{let X=document.createElement("option");X.value=st.value,X.textContent=st.text,I.appendChild(X)});let at=document.createElement("td");at.appendChild(I),c.appendChild(at)}z+=c.outerHTML}document.getElementById("calc_vigas_negativos").innerHTML=z,MathJax.typeset();let ct=[],bt=[],N=[],$t=[],Wt=[],te=[],ee=[],ae=[],se=[];for(let t=0;t<x*3;t++){var na=(-h[t]/3).toFixed(2);ct.push(na);var ft=0;_[t]>ct[t]?ft=_[t]:ft=ct[t],bt.push(ft);var Z=0;switch(T[t]){case 1:Z=o[t]-6;break;case 2:Z=o[t]-8;break;case 3:Z=o[t]-10;break;case 4:Z=o[t]-12;break;case 5:Z=o[t]-14;break;case 6:Z=o[t]-16;break}N.push(Z);var ia=(N[t]-Math.sqrt(Math.pow(N[t],2)-2*Math.abs(bt[t]*Math.pow(10,5))/(.9*.85*a*s[t]))).toFixed(2);$t.push(ia);var tt=(.85*a*s[t]*$t[t]/p).toFixed(2);Wt.push(tt);var pt=Math.max(.7*Math.sqrt(a)/p*s[t]*N[t],14*s[t]*f[t]/p).toFixed(2);te.push(pt);var ua=(.85*v[t]*a/p*(.003/(.003+.0021))*s[t]*N[t]).toFixed(2);ae.push(ua);var kt=(.75*(.85*v[t]*a/p*(.003/(.003+.0021)))*s[t]*N[t]).toFixed(2);ee.push(kt);let c=0;parseFloat(tt)<parseFloat(pt)?c=parseFloat(pt):parseFloat(tt)>parseFloat(pt)&&parseFloat(tt)<parseFloat(kt)?c=parseFloat(tt):c=parseFloat(kt),se.push(c)}z=`
                <table class="table table-hover"  id="vigaspdf">
                    <thead>
                         <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th scope="col" class="text-left">Parte positivo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4"></td>
                            <td class="py-2 px-4">𝑀𝑢(-)=1/3𝑀𝑢(+)</td>
                            <td class="py-2 px-4">\\(${Qt}\\)</td>
                            ${ct.map(t=>`<td class='text-center'>${t} Tonf.m</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">-</td>
                            <td class="py-2 px-4">𝑀𝑢 (-) usar</td>
                            <td class="py-2 px-4">\\(${Qt}\\)</td>
                            ${bt.map(t=>`<td class='text-center'>${t} Tonf.m</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Peralte efectivo en "cm"</td>
                            <td class="py-2 px-4">𝑑</td>
                            <td class="py-2 px-4"></td>
                            ${N.map(t=>`<td class='text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Altura del bloque comprimido en "cm"</td>
                            <td class="py-2 px-4">𝑎</td>
                            <td class="py-2 px-4">\\(${Xt}\\)</td>
                            ${$t.map(t=>`<td class='text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Refuerzo calculado en "cm2"</td>
                            <td class="py-2 px-4">𝐴𝑠</td>
                            <td class="py-2 px-4">\\(${Kt}\\)</td>
                            ${Wt.map(t=>`<td class='text-center'>${t} cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Refuerzo mínimo en "cm2"</td>
                            <td class="py-2 px-4">𝐴𝑠_𝑚𝑖𝑛</td>
                            <td class="py-2 px-4">\\(${Gt}\\)</td>
                            ${te.map(t=>`<td class='text-center'>${t} cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Area de acero balanceado</td>
                            <td class="py-2 px-4">𝜌𝑏</td>
                            <td class="py-2 px-4">\\(${Yt}\\)</td>
                            ${ae.map(t=>`<td class='text-center'>${t} cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Refuerzo máximo en "cm2"</td>
                            <td class="py-2 px-4">𝐴𝑠_𝑚á𝑥 75%Asb</td>
                            <td class="py-2 px-4">\\(${oa}\\)</td>
                            ${ee.map(t=>`<td class='text-center'>${t}cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Acero a Usar</td>
                            <td class="py-2 px-4">𝐴𝑠_usar</td>
                            <td class="py-2 px-4"></td>
                            ${se.map(t=>`<td class='text-center'>${t}cm<sup>2<sup></td>`).join("")}
                        </tr>
                    </tbody>
            `;const ya=Math.max(...T);for(let t=0;t<ya;t++){let c=document.createElement("tr");c.className="bg-gray-500 text-white dark:bg-gray-500 dark:text-white";let E=document.createElement("td");E.textContent="Tipo de Acero mm",c.appendChild(E);let R=document.createElement("td");R.textContent=`Capa ${t+1}`,c.appendChild(R);let H=document.createElement("td");H.textContent="",c.appendChild(H);for(let A=0;A<x*3;A++){let I=document.createElement("select");I.className="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md",I.name=`tipoAceroB${A}_capa${t}`,I.id=`tipoAceroB${A}_capa${t}`,[{value:"0",text:'Ø 0"'},{value:"0.283",text:"6mm"},{value:"0.503",text:"8mm cm²"},{value:"0.713",text:'Ø 3/8" cm²'},{value:"1.131",text:"12mm cm²"},{value:"1.267",text:'Ø 1/2" cm²'},{value:"1.979",text:'Ø 5/8" cm²'},{value:"2.850",text:'Ø 3/4" cm²'},{value:"5.067",text:'Ø 1" cm²'},{value:"2.58",text:'2Ø1/2"'},{value:"3.87",text:'3Ø1/2"'},{value:"3.98",text:'2Ø5/8"'},{value:"5.16",text:'4Ø1/2"'},{value:"5.27",text:'2Ø5/8"+1Ø1/2"'},{value:"5.68",text:'2Ø3/4"'},{value:"5.97",text:'3Ø5/8"'},{value:"6.45",text:'5Ø1/2"'},{value:"6.56",text:'2Ø5/8"+2Ø1/2"'},{value:"6.97",text:'2Ø3/4"+1Ø1/2"'},{value:"7.67",text:'2Ø3/4"+1Ø5/8"'},{value:"7.74",text:'6Ø1/2"'},{value:"7.85",text:'2Ø5/8"+3Ø1/2"'},{value:"7.916",text:'4Ø5/8"'},{value:"8.26",text:'2Ø3/4"+2Ø1/2"'},{value:"8.52",text:'3Ø3/4"'},{value:"8.55",text:'3Ø5/8"+2Ø1/2"'},{value:"9.55",text:'2Ø3/4"+3Ø1/2"'},{value:"9.95",text:'5Ø5/8"'},{value:"9.66",text:'2Ø3/4"+2Ø5/8"'},{value:"10.2",text:'2Ø1"'},{value:"10.54",text:'4Ø5/8"+2Ø1/2"'},{value:"10.84",text:'2Ø3/4"+4Ø1/2"'},{value:"11.1",text:'3Ø3/4"+2Ø1/2"'},{value:"11.40",text:'4Ø3/4"'},{value:"11.65",text:'2Ø3/4"+3Ø5/8"'},{value:"11.94",text:'6Ø5/8"'},{value:"12.19",text:'2Ø1"+1Ø5/8"'},{value:"12.5",text:'3Ø3/4"+2Ø5/8"'},{value:"13.04",text:'2Ø1"+1Ø3/4"'},{value:"13.64",text:'2Ø3/4"+4Ø5/8"'},{value:"13.94",text:'4Ø3/4"+2Ø1/2"'},{value:"14.18",text:'2Ø1"+2Ø5/8"'},{value:"14.2",text:'5Ø3/4"'},{value:"15.3",text:'3Ø1"'},{value:"15.34",text:'4Ø3/4"+2Ø5/8"'},{value:"15.88",text:'2Ø1"+2Ø3/4"'},{value:"16.17",text:'2Ø1"+3Ø5/8"'},{value:"17.04",text:'6Ø3/4"'},{value:"18.16",text:'2Ø1"+4Ø5/8"'},{value:"18.72",text:'2Ø1"+3Ø3/4"'},{value:"19.28",text:'3Ø1"+2Ø5/8"'},{value:"20.4",text:'4Ø1"'},{value:"20.98",text:'3Ø1"+2Ø3/4"'},{value:"21.56",text:'2Ø1"+4Ø3/4"'},{value:"24.38",text:'4Ø1"+2Ø5/8"'},{value:"25.5",text:'5Ø1"'},{value:"26.08",text:'4Ø1"+2Ø3/4"'},{value:"30.6",text:'6Ø1"'}].forEach(st=>{let X=document.createElement("option");X.value=st.value,X.textContent=st.text,I.appendChild(X)});let at=document.createElement("td");at.appendChild(I),c.appendChild(at)}z+=c.outerHTML}document.getElementById("calc_vigas_positivos").innerHTML=z,MathJax.typeset();let re=[],le=[],de=[],ce=[],pe=[],oe=[],xe=[],ne=[],ie=[],ue=[];for(let t=0;t<x*3;t++){var ye=s[t]*f[t],wt=.53*Math.sqrt(a)*(ye/1e3),ma=.85*wt,me=j[t]/.85-wt,Mt=Math.ceil(.713*p*f[t]/(me*1e3)*2),ge=N[t]/4,ga=2*o[t],ha=Math.min(Mt,ge,10),he=16,va=`Estribado: 1@5cm; ${he}@ ${Mt} cm;resto@20cm`;re.push(ye),le.push(wt),de.push(ma),ce.push(me),pe.push(Mt),oe.push(ge),xe.push(ga),ne.push(ha),ie.push(he),ue.push(va)}const ve="𝐴𝑐𝑤=b * d",be="𝑉𝑐=0.53 * sqrt{𝑓′𝑐} * s𝐴𝑐𝑤",$e="Ø𝑉𝑐 = 𝑉𝑐*Ø",fe="Vs = \\frac{𝐴𝑣 * 𝑓𝑦 * 𝑑}{𝑆}",ba="\\frac{(2* 3/8)*𝑓𝑦*𝑑}{(Vs*1000)}",ke="𝑆=\\frac{d}{4}= MAX(d)/4",we="𝐿𝑐𝑜𝑛𝑓𝑖𝑔= 2 * h",Me="usar= MIN(𝑆,𝑆=𝑑/4,Smax)",$a="𝑀𝑛 𝑖𝑧𝑞=\\frac{MAX(ФMn;ФMn)}{0.9}",fa="𝑀𝑛 𝑑𝑒𝑟= \\frac{ФMn}{0.9}",ka="𝑉𝑢=(\\frac{(Mn izqu + Mn der)}{Luz Libre (m)}) + 1.25(CM+CV)",wa="𝑆=\\frac{(2* 3/8)*𝑓𝑦*𝑑}{(Vs*1000)}";z=`
                <table class="table table-hover"  id="vigaspdf">
                    <thead>
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th  class="text-lg py-2 px-4" scope="col" class="text-left">3.- Diseño de cortante</th>
                            <th  class="text-lg py-2 px-4" scope="col"></th>
                            <th  class="text-lg py-2 px-4" scope="col"></th>
                            ${M}
                        </tr>
                    </thead>
                    <tbody class="datos_relleno">
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Area de corte</td>
                            <td class="py-2 px-4">𝐴𝑐𝑤</td>
                            <td class="py-2 px-4">\\(${ve}\\)</td>
                            ${re.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Cortante nominal proporcionada por el concreto</td>
                            <td class="py-2 px-4">𝑉𝑐</td>
                            <td class="py-2 px-4">\\(${be}\\)</td>
                            ${le.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} Tonf</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4"></td>
                            <td class="py-2 px-4">Ø 𝑉𝑐</td>
                            <td class="py-2 px-4">\\(${$e}\\)</td>
                            ${de.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)}Tonf</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Cortante nominal proporcionada por el refuerzo</td>
                            <td class="py-2 px-4">𝑉𝑠</td>
                            <td class="py-2 px-4">\\(${fe}\\)</td>
                            ${ce.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} Tonf</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Espaciamiento requerido</td>
                            <td class="py-2 px-4">𝑆</td>
                            <td class="py-2 px-4">\\(${ba}\\)</td>
                            ${pe.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Peralte efectivo dividido entre 4</td>
                            <td class="py-2 px-4">𝑆=𝑑/4</td>
                            <td class="py-2 px-4">\\(${ke}\\)</td>
                            ${oe.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4"></td>
                            <td class="py-2 px-4">𝐿𝑐𝑜𝑛𝑓𝑖𝑔</td>
                            <td class="py-2 px-4">\\(${we}\\)</td>
                            ${xe.map(t=>`<td class='py-2 px-4 text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4"></td>
                            <td class="py-2 px-4">𝑈𝑠𝑎𝑟</td>
                            <td class="py-2 px-4">\\(${Me}\\)</td>
                            ${ne.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4"></td>
                            <td class="py-2 px-4"># estribos zona conf.</td>
                            <td class="py-2 px-4"></td>
                            ${ie.map(t=>`<td class='py-2 px-4 text-center'>${t}</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4"></td>
                            <td class="py-2 px-4">Estribado</td>
                            <th class="py-2 px-4" scope="col"></th>
                            ${ue.map(t=>`<td class='py-2 px-4 text-center' contenteditable="true">${t} </td>`).join("")}
                        </tr>
                    </tbody>
                </table>`,document.getElementById("calc_vigas_cortante").innerHTML=z,MathJax.typeset();let Fe=[],Ee=[],Ce=[],Ie=[],je=[],Be=[],Le=[],_e=[],Te=[],Ve=[],ze=[];const Ma=sa(rt);let Ft=[];Ma.forEach(t=>{for(let c=0;c<3;c++)Ft.push(t)});const Fa=ra(lt);let Et=[];Fa.forEach(t=>{for(let c=0;c<3;c++)Et.push(t)});for(let t=0;t<x*3;t++){var Ea=1.25*(g[t]+B[t]),Ca=(parseFloat(Ft[t])+parseFloat(Et[t]))/n+Ea,Ae=s[t]*f[t],Ct=.53*Math.sqrt(a)*Ae/1e3,Ia=Ct*v[t],Ue=j[t]/v[t]-Ct,It=Math.ceil(.713*p*f[t]/(Ue*1e3)*2),qe=N[t]/4,ja=2*o[t],Ba=Math.min(It,qe,10),De=18,La=`Estribado: 1@5cm; ${De}@ ${It} cm;resto@20cm`;Be.push(Ae),Le.push(Ct),Fe.push(Ca),Ee.push(Ia),Ce.push(Ue),Ie.push(It),je.push(qe),_e.push(ja),Te.push(Ba),Ve.push(De),ze.push(La)}z=`
                <table class="table table-hover"  id="vigaspdf">
                    <thead>
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th scope="col" class="text-left">4.- Diseño por capacidad</th>
                            <th scope="col"></th>
                            <th scope="col"></th>
                            ${M}
                        </tr>
                    </thead>
                    <tbody class="datos_relleno">
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td  class="py-2 px-4"></td>
                            <td class="py-2 px-4">𝑀𝑛_𝑖𝑧𝑞</td>
                            <td class="py-2 px-4">\\(${$a}\\)</td>
                            ${Ft.map(t=>`<td class='py-2 px-4 text-center'>${t} Tonf</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4"></td>
                            <td class="py-2 px-4">𝑀𝑛_𝑑𝑒𝑟</td>
                            <td class="py-2 px-4">\\(${fa}\\)</td>
                            ${Et.map(t=>`<td class='py-2 px-4 text-center'>${t} Tonf</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Capacidad cortante</td>
                            <td class="py-2 px-4">𝑉𝑢</td>
                            <td class="py-2 px-4">\\(${ka}\\)</td>
                            ${Fe.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} Tonf</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Area de corte</td>
                            <td class="py-2 px-4">Acw</td>
                            <td class="py-2 px-4">\\(${ve}\\)</td>
                            ${Be.map(t=>`<td class='py-2 px-4 text-center'>${t} Tonf</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Cortante nominal proporcionada por el concreto</td>
                            <td class="py-2 px-4">Vc</td>
                            <td class="py-2 px-4">\\(${be}\\)</td>
                            ${Le.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} Tonf</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Cortante resistente proporcionada por el concreto</td>
                            <td class="py-2 px-4">Ø Vc</td>
                            <td class="py-2 px-4">\\(${$e}\\)</td>
                            ${Ee.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} Tonf</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Cortante nominal proporcionada por el refuerzo</td>
                            <td class="py-2 px-4">Vs</td>
                            <td class="py-2 px-4">\\(${fe}\\)</td>
                            ${Ce.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} Tonf</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Espaciamiento requerido</td>
                            <td class="py-2 px-4">𝑆(cm)</td>
                            <td class="py-2 px-4">\\(${wa}\\)</td>
                            ${Ie.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4">Peralte efectivo dividido entre 4</td>
                            <td class="py-2 px-4">𝑆=𝑑/4 (cm)</td>
                            <td class="py-2 px-4">\\(${ke}\\)</td>
                            ${je.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4"></td>
                            <td class="py-2 px-4">𝐿𝑐𝑜𝑛𝑓𝑖𝑔</td>
                            <td class="py-2 px-4">\\(${we}\\)</td>
                            ${_e.map(t=>`<td class='py-2 px-4 text-center'>${t.toFixed(2)} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4"></td>
                            <td class="py-2 px-4">𝑈𝑠𝑎𝑟</td>
                            <td class="py-2 px-4">\\(${Me}\\)</td>
                            ${Te.map(t=>`<td class='py-2 px-4 text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4"></td>
                            <td class="py-2 px-4"># estribos zona conf.</td>
                            <td class="py-2 px-4"></td>
                            ${Ve.map(t=>`<td class='py-2 px-4 text-center'>${t} </td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class="py-2 px-4"></td>
                            <td class="py-2 px-4">Estribado</td>
                            <td class="py-2 px-4"></td>
                            ${ze.map(t=>`<td class='py-2 px-4 text-center' contenteditable="true">${t}</td>`).join("")}
                        </tr>
                    </tbody>
                </table>
            `,document.getElementById("calc_vigas_capacidad").innerHTML=z,MathJax.typeset();let Pe=[],ot=[],D=[],Se=[],Ne=[],xt=[],jt=[],Bt=[],Lt=[],nt=[],Re=[],He=[],Je=[],Oe=[],Ze=[],Xe=[];for(let t=0;t<x*3;t++){var Ke=2*Math.pow(10,6).toFixed(2);Pe.push(Ke);var Ge=(15e3*Math.sqrt(a)).toFixed(2);ot.push(Ge);var _a=(Ke/Ge).toFixed(2);D.push(_a);var it=s[t],ut=2*D[t]*y[t],e=-2*D[t]*y[t]*f[t],_t=(-ut+Math.sqrt(Math.pow(ut,2)-4*it*e))/(2*it),Tt=(-ut-Math.sqrt(Math.pow(ut,2)-4*it*e))/(2*it),Ye=(s[t]*Math.pow(Math.max(_t,Tt),3)/3+D[t]*y[t]*Math.pow(f[t]-Math.max(_t,Tt),2)+(D[t]-1)*y[t]*Math.pow(Math.max(_t,Tt)-6,2)).toFixed(2);Se.push(Ye);var yt=s[t],mt=2*D[t]*y[t],Qe=-2*D[t]*y[t]*f[t],Vt=(-mt+Math.sqrt(Math.pow(mt,2)-4*yt*Qe))/(2*yt),zt=(-mt-Math.sqrt(Math.pow(mt,2)-4*yt*Qe))/(2*yt),At=(s[t]*Math.pow(Math.max(Vt,zt),3)/3+D[t]*y[t]*Math.pow(f[t]-Math.max(Vt,zt),2)+(D[t]-1)*y[t]*Math.pow(Math.max(Vt,zt)-6,2)).toFixed(2);Ne.push(At);var Ta=((parseFloat(At)+parseFloat(At)+2*parseFloat(Ye))/4).toFixed(2);xt.push(Ta);var Va=5*Math.pow(n*100,2)/(48*ot[t]*xt[t])*((m[1]-.1*(g[0]+g[2]))*100);let E=Va.toFixed(3);jt.push(E);var et=(5*Math.pow(n*100,2)/(48*ot[t]*xt[t])*(C[t]-.1*(B[0]+B[2])*100)).toFixed(3);Bt.push(et);var Ut=.3*Bt[t];Lt.push(Ut);var za=y[t]/(s[t]*f[t]),Aa=2,gt=(Aa/(1+50*za)).toFixed(3);nt.push(gt);var Ua=(parseFloat(jt[t])*(1+parseFloat(nt[t]))+parseFloat(Lt[t])*(1+parseFloat(nt[t]))).toFixed(3);Re.push(Ua);var qa=(parseFloat(E)+parseFloat(et)+parseFloat(gt)*parseFloat(E)+parseFloat(et)*parseFloat(Ut)).toFixed(2);He.push(qa);var qt=(n*100/360).toFixed(2);Je.push(qt);var Dt="";et<qt?Dt="CUMPLE":Dt="NO CUMPLE",Oe.push(Dt);var Da=(n*100/480).toFixed(2);Ze.push(Da);var Pa=gt*E+gt*Ut+et,Pt="";Pa<qt?Pt="CUMPLE":Pt="NO CUMPLE",Xe.push(Pt)}z=`
                <table class="table table-hover"  id="vigaspdf">
                    <thead>
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th  class="text-lg py-2 px-4" scope="col" class="text-left">5.- Diseño por deflexion</th>
                            <th  class="text-lg py-2 px-4" scope="col"></th>
                            <th  class="text-lg py-2 px-4" scope="col"></th>
                            ${M}
                        </tr>
                    </thead>
                    <tbody class="datos_relleno">
                          <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">Modulo de elasticidad del acero</td>
                            <td class=" py-2 px-4">Ec</td>
                            <td class=" py-2 px-4">\\(Ec=2 * {\\left(10^{6}\\right)} \\)</td>
                            ${Pe.map(t=>`<td class='py-2 px-4 text-center'>${t} Kg/cm<sup>2</sup></td>`).join("")}
                        </tr>
                         <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">Modulo de elasticidad del concreto</td>
                            <td class=" py-2 px-4">Ns</td>
                            <td class=" py-2 px-4">\\(Ns=(15000 * \\sqrt{f'_c})\\)</td>
                            ${ot.map(t=>`<td class='py-2 px-4 text-center'>${t} Kg/cm<sup>2</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">Relacion acero/concreto</td>
                            <td class=" py-2 px-4">Ns</td>
                            <td class=" py-2 px-4">\\(Ns= \\frac{es}{ec}\\)</td>
                            ${D.map(t=>`<td class='py-2 px-4 text-center'>${t} </td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">Inercia critica en la seccion rectangular</td>
                            <td class=" py-2 px-4">Icr</td>
                            <td class=" py-2 px-4">\\(Icr= 2 * {\\left(10^{6}\\right)}\\)</td>
                            ${Se.map(t=>`<td class='py-2 px-4 text-center'>${t} cm<sup>4</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">Inercia critica en la seccion rectangular</td>
                            <td class=" py-2 px-4">Icr</td>
                            <td class=" py-2 px-4">\\(\\)</td>
                            ${Ne.map(t=>`<td class='py-2 px-4 text-center'>${t} cm<sup>4</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4"></td>
                            <td class=" py-2 px-4">Lef</td>
                            <td class=" py-2 px-4">\\(Lef = \\frac{lcr + lcr + 2 * lcr}{4}\\)</td>
                            ${xt.map(t=>`<td class='py-2 px-4 text-center'>${t} cm<sup>4</sup></td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">Deflexión debido ala carga muerta</td>
                            <td class=" py-2 px-4">Δzm</td>
                            <td class=" py-2 px-4">\\(Δzm = \\frac{\\left(luzLibres * 100^{2}\\right)}{ns*acero * \\left(ds - MAX(ccomp, ccomp1)^{2}\\right) }\\)</td>
                            ${jt.map(t=>`<td class='py-2 px-4 text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">Deflexión debido ala carga viva</td>
                            <td class=" py-2 px-4">ΔzL</td>
                            <td class=" py-2 px-4">\\(ΔzL = \\frac{(5 * \\left(luzLibres * 100^{2}\\right))}{48 * ecs * Lef) * (muCv - 0.1 * (muCv + muCv) * 100)}\\)</td>
                            ${Bt.map(t=>`<td class='py-2 px-4 text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">Deflexión considerando el 30% de la carga viva</td>
                            <td class=" py-2 px-4">Δz30%</td>
                            <td class=" py-2 px-4">\\(Δz30 = 0.3 * ΔzL\\)</td>
                            ${Lt.map(t=>`<td class='py-2 px-4 text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">Deflexión diferida</td>
                            <td class=" py-2 px-4">λΔ </td>
                            <td class=" py-2 px-4">\\(λΔ =  \\frac{ed}{1 + (50 * pdifer)}\\)</td>
                            ${nt.map(t=>`<td class='py-2 px-4 text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">-</td>
                            <td class=" py-2 px-4">Δmedia</td>
                            <td class=" py-2 px-4">\\(Δmedia = Δzm * 1 + λΔ + ΔzL * 1 + λΔ\\)</td>
                            ${Re.map(t=>`<td class='py-2 px-4 text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">-</td>
                            <td class=" py-2 px-4">ΔMáx</td>
                            <td class=" py-2 px-4">\\(ΔMáx = Δzm + ΔzL + λΔ * Δzm + ΔzL * Δz30\\)</td>
                            ${He.map(t=>`<td class='py-2 px-4 text-center'>${t} cm</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">-</td>
                            <td class=" py-2 px-4">ΔZL</td>
                            <td class=" py-2 px-4">\\(ΔZL = \\frac{luzLibres * 100}{360}\\)</td>
                            ${Je.map(t=>`<td class='py-2 px-4 text-center'>${t}</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">-</td>
                            <td class=" py-2 px-4">VERIFICACION</td>
                            <td class=" py-2 px-4">\\(\\)</td>
                            ${Oe.map(t=>`<td class='py-2 px-4 text-center'>${t}</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">-</td>
                            <td class=" py-2 px-4">ΔZT</td>
                            <td class=" py-2 px-4">\\(ΔZT = λΔ * Δzm * λΔ * Δz30 + ΔzL\\)</td>
                            ${Ze.map(t=>`<td class='py-2 px-4 text-center'>${t}</td>`).join("")}
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <td class=" py-2 px-4">-</td>
                            <td class=" py-2 px-4">VERIFICACION</td>
                            <td class=" py-2 px-4">\\(\\)</td>
                            ${Xe.map(t=>`<td class='py-2 px-4 text-center'>${t}</td>`).join("")}
                        </tr>
                    </tbody>
                </table>`,document.getElementById("calc_vigas_deflexion").innerHTML=z,MathJax.typeset()}),document.getElementById("btn_pdf_predim").addEventListener("click",function(){$("#vigas_general").printThis({debug:!1,importCSS:!0,importStyle:!0,loadCSS:"",pageTitle:"Vigas GN",removeInline:!1,printDelay:333,header:null,footer:null,base:!1,formValues:!0,canvas:!1,doctypeString:"<!DOCTYPE html>",removeScripts:!1,copyTagClasses:!1})}),We.addEventListener("click",e=>{e.preventDefault(),Ht(-1)}),ta.addEventListener("click",e=>{e.preventDefault(),Ht(1)});function Rt(){const e=parseInt(ht.value);Nt.innerHTML=la(e),Jt()}function la(e){return`
            <table class="min-w-full bg-gray-800 rounded-lg">
                <thead class="bg-gray-700">
                    ${da(e)}
                </thead>
                <tbody>
                    ${ca(e)}
                    <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                        ${k("Base (m)",e*3)}
                    </tr>
                    <tr>
                        ${w("base",e*3,"Base",40)}
                    </tr>
                    <tr>
                        ${k("Altura (m)",e*3)}
                    </tr>
                    <tr>
                        ${w("altura",e*3,"Altura",90)}
                    </tr>
                    <tr>
                        <th class="text-gray-950 dark:text-gray-50">Negativos</th>
                    </tr>
                    <tr>
                        ${k("Momento Ultimo (Ton.m)",e*3)}
                    </tr>
                    <tr>
                        ${w("MU",e*3,"MU",10)}
                    </tr>
                    <tr>
                        ${k("MuCM (Ton.m)",e*3)}
                    </tr>
                    <tr>
                        ${w("MuCM",e*3,"MuCM",10)}
                    </tr>
                    <tr>
                        ${k("MuCV (Ton.m)",e*3)}
                    </tr>
                    <tr>
                        ${w("MuCV",e*3,"MuCV",10)}
                    </tr>
                    <tr>
                        ${k("Vu (Tonf)",e*3)}
                    </tr>
                    <tr>
                        ${w("Vu",e*3,"Vu",10)}
                    </tr>
                    <tr>
                        ${k("Tu (Tonf)",e*3)}
                    </tr>
                    <tr>
                        ${w("Tu",e*3,"Tu",10)}
                    </tr>
                    <tr>
                        ${k("Capas",e*3)}
                    </tr>
                    <tr>
                        ${w("capas",e*3,"capas",1)}
                    </tr>
                     <tr>
                        <th class="text-gray-950 dark:text-gray-50">Positivo</th>
                    </tr>
                    <tr>
                        ${k("Momento Ultimo (Ton.m)",e*3)}
                    </tr>
                    <tr>
                        ${w("MU-",e*3,"MU-",10)}
                    </tr>
                    <tr>
                        ${k("MuCM (Ton.m)",e*3)}
                    </tr>
                    <tr>
                        ${w("MuCM-",e*3,"MuCM-",10)}
                    </tr>
                    <tr>
                        ${k("MuCV-",e*3)}
                    </tr>
                    <tr>
                        ${w("MuCV-",e*3,"MuCV-",10)}
                    </tr>
                    <tr>
                        ${k("Vu (Tonf)",e*3)}
                    </tr>
                    <tr>
                        ${w("Vu-",e*3,"Vu-",10)}
                    </tr>
                    <tr>
                        ${k("Tu (Tonf)",e*3)}
                    </tr>
                    <tr>
                        ${w("Tu-",e*3,"Tu-",10)}
                    </tr>
                    <tr>
                        ${k("Capas",e*3)}
                    </tr>
                    <tr>
                        ${w("capas-",e*3,"capas-",1)}
                    </tr>
                </tbody>
            </table>
        `}function da(e){let a="<tr>";for(let p=1;p<=e;p++)a+=`<th colspan="3" class="px-4 py-2 text-gray-800 dark:text-white text-center ">Luz Libre ${p}</th>`;return a+="</tr>",a}function k(e,a,p,x){let n="";for(let s=1;s<=a;s++){const o=`${e}`;n+=`
                <td class="text-gray-800 dark:text-white text-center px-4 py-2 border-b border-gray-600 ">
                    ${o}
                </td>`}return n}function w(e,a,p,x){let n="";for(let s=1;s<=a;s++){const o=`${e}-${s}`;n+=`
                <td class="px-4 py-2 border-b border-gray-600">
                    <input type="text" name="${o}" id="${o}"
                        class="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded-md text-center "
                        placeholder="${p} ${Math.ceil(s/3)}"
                        value="${x}">
                </td>`}return n}function ca(e){let a="";for(let p=1;p<=e;p++){const x=`luz-libre-${p}`;a+=`
                <tr>
                    <td colspan="3" class="px-4 py-2 border-b border-gray-600">
                        <input type="text" name="${x}" id="${x}"
                            class="w-full px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded-md text-center "
                            placeholder="Luz Libre ${p}"
                            value="2.7">
                    </td>
                </tr>`}return a}function Ht(e){const a=parseInt(ht.value);K=Math.min(Math.max(1,K+e),a),Jt()}function Jt(e){const a=(K-1)*3,p=a+3;Nt.querySelectorAll("tr").forEach((x,n)=>{x.parentElement.tagName==="THEAD"?x.querySelectorAll("th").forEach((s,o)=>{o===K-1?s.classList.remove("hidden"):s.classList.add("hidden")}):x.firstElementChild.getAttribute("colspan")==="3"?n===K?x.classList.remove("hidden"):x.classList.add("hidden"):x.querySelectorAll("td").forEach((s,o)=>{o>=a&&o<p?s.classList.remove("hidden"):s.classList.add("hidden")})})}Rt()});
