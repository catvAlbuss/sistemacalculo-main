document.addEventListener("DOMContentLoaded",async()=>{let Gs="light",Tt,Ws,Zs,Ys,ka,Fa,$a;const wc=window.matchMedia("(prefers-color-scheme: dark)");function Cc(a){Gs=a.matches?"dark":"light",Tt&&ds()}wc.addListener(Cc),Cc(wc);const lt={top:20,right:20,bottom:30,left:40},Dc=600-lt.left-lt.right,js=600-lt.top-lt.bottom;function Cr(a,g){var f=0,p=.7*a,u=.7*a,x=.7*a/3+a/10,T=.7*a/3+a/10,e=.7*a/3+a/10-g,d=.7*a/3,O=0,P=0,w=0,n=0,h=a/10,m=a/10,t=a/10+a,s=a/10+a,i=a/10,o=a/10,l=0;return[[{x:f,y:w},{x:p,y:n},{x:u,y:h},{x,y:m},{x:T,y:t},{x:e,y:s},{x:d,y:i},{x:O,y:o},{x:P,y:l}]]}function Dr(){Tt=d3.select("#predimsMC").append("svg").attr("width",Dc+lt.left+lt.right).attr("height",js+lt.top+lt.bottom).append("g").attr("transform",`translate(${lt.left},${lt.top})`),Fa=d3.scaleLinear().range([0,Dc]),$a=d3.scaleLinear().range([js,0]),Ws=Tt.append("g").attr("transform",`translate(0,${js})`).attr("class","x-axis"),Zs=Tt.append("g").attr("class","y-axis"),Ys=Tt.append("path").attr("fill","none").attr("stroke-width",1.5),ds()}function ds(){const a=parseFloat(document.getElementById("H").value),g=parseFloat(document.getElementById("e").value),p=Cr(a,g)[0];Fa.domain([0,d3.max(p,e=>e.x)*1.8]),$a.domain([0,d3.max(p,e=>e.y)*1.1]),Ws.call(d3.axisBottom(Fa)),Zs.call(d3.axisLeft($a));const u=d3.line().x(e=>Fa(e.x)).y(e=>$a(e.y));Ys.datum(p).attr("d",u),ka=Tt.selectAll(".point").data(p),ka.enter().append("circle").attr("class","point").attr("r",3).merge(ka).attr("cx",e=>Fa(e.x)).attr("cy",e=>$a(e.y)),ka.exit().remove();const x=Gs==="dark"?"white":"#1b1e23",T=Gs==="dark"?"lightsteelblue":"steelblue";Tt.style("color",x),Ws.style("color",x),Zs.style("color",x),Ys.attr("stroke",T),ka.attr("fill",T)}Dr(),document.getElementById("H").addEventListener("input",ds),document.getElementById("e").addEventListener("input",ds),parseFloat(document.getElementById("df").value),parseFloat(document.getElementById("H").value),parseFloat(document.getElementById("angterr").value),parseFloat(document.getElementById("e").value),parseFloat(document.getElementById("b1").value),parseFloat(document.getElementById("hd").value),document.getElementById("considerar").value,$("#cimientosControler").submit(a=>{a.preventDefault();let g=document.getElementById("considerar").value;parseFloat(document.getElementById("e").value),parseFloat(document.getElementById("gc").value);let f=parseFloat(document.getElementById("gs").value),p=parseFloat(document.getElementById("tet").value);parseFloat(document.getElementById("z").value);let u=parseFloat(document.getElementById("d").value);parseFloat(document.getElementById("SC").value);let x=parseFloat(document.getElementById("hs").value),T=calcularPrimerCuadro(g,f,p,u,x,inputka),e=document.getElementById("primerTabla");e.innerHTML=T}),document.getElementById("H").addEventListener("input",c),$("#graficar").click(a=>{const g=document.getElementById("table_General"),f=document.getElementById("text_graf"),p=document.getElementById("contenedorGrafico1"),u=document.getElementById("contendor_MC");g.style.display="block",p.style.display="block",u.style.display="block",f.style.display="block",document.getElementById("df").addEventListener("input",c),document.getElementById("H").addEventListener("input",c),document.getElementById("angterr").addEventListener("input",c),document.getElementById("e").addEventListener("input",c),document.getElementById("b1").addEventListener("input",c),document.getElementById("hd").addEventListener("input",c),document.getElementById("considerar").addEventListener("input",c),document.getElementById("gc").addEventListener("input",c),document.getElementById("gs").addEventListener("input",c),document.getElementById("tet").addEventListener("input",c),document.getElementById("z").addEventListener("input",c),document.getElementById("d").addEventListener("input",c),document.getElementById("SC").addEventListener("input",c),document.getElementById("hs").addEventListener("input",c),document.getElementById("b1graf").addEventListener("input",c),document.getElementById("hzgraf").addEventListener("input",c),document.getElementById("egraf").addEventListener("input",c),document.getElementById("epgraf").addEventListener("input",c),document.getElementById("b2graf").addEventListener("input",c),document.getElementById("zonaok").addEventListener("input",c),document.getElementById("kvran").addEventListener("input",c),document.getElementById("ubicacion").addEventListener("input",c),document.getElementById("dentelloncorr").addEventListener("input",c),document.getElementById("consDes").addEventListener("input",c),document.getElementById("ubicacioncon").addEventListener("input",c),document.getElementById("dentelloncons").addEventListener("input",c),document.getElementById("consDescons").addEventListener("input",c),document.getElementById("desing").addEventListener("input",c),document.getElementById("fy").addEventListener("input",c),document.getElementById("fc").addEventListener("input",c),document.getElementById("acer").addEventListener("input",c),document.getElementById("numbarras").addEventListener("input",c),document.getElementById("acertrans").addEventListener("input",c),document.getElementById("porpocion").addEventListener("input",c),document.getElementById("acerclibre").addEventListener("input",c),document.getElementById("lpr").addEventListener("input",c),document.getElementById("corteA").addEventListener("input",c),document.getElementById("acerpun").addEventListener("input",c),document.getElementById("numbarrapun").addEventListener("input",c),document.getElementById("DF").addEventListener("input",c),document.getElementById("aceroLs").addEventListener("input",c),document.getElementById("numbarrasls").addEventListener("input",c),document.getElementById("acertranspun").addEventListener("input",c),document.getElementById("porpocionpun").addEventListener("input",c),document.getElementById("acerclibrepun").addEventListener("input",c),document.getElementById("aceroLspun").addEventListener("input",c),document.getElementById("numbarraslspun").addEventListener("input",c),document.getElementById("acertal").addEventListener("input",c),document.getElementById("numbarratal").addEventListener("input",c),document.getElementById("acertranstal").addEventListener("input",c),document.getElementById("porpociontal").addEventListener("input",c),document.getElementById("acerclibretal").addEventListener("input",c),document.getElementById("Longitud").addEventListener("input",c),document.getElementById("LTal").addEventListener("input",c),document.getElementById("aceroKey").addEventListener("input",c),document.getElementById("numbarraKey").addEventListener("input",c),document.getElementById("acerotransKey").addEventListener("input",c),document.getElementById("porpocionKey").addEventListener("input",c),document.getElementById("aceroCLkey").addEventListener("input",c),c()});function c(){let a=parseFloat(document.getElementById("df").value),g=parseFloat(document.getElementById("H").value),f=parseFloat(document.getElementById("angterr").value);var p=parseFloat(document.getElementById("hd").value);let u=document.getElementById("considerar").value,x=parseFloat(document.getElementById("e").value),T=parseFloat(document.getElementById("gc").value),e=parseFloat(document.getElementById("gs").value),d=parseFloat(document.getElementById("tet").value),O=parseFloat(document.getElementById("z").value),P=parseFloat(document.getElementById("d").value),w=parseFloat(document.getElementById("SC").value),n=parseFloat(document.getElementById("hs").value);const h=parseFloat(document.getElementById("b1graf").value),m=parseFloat(document.getElementById("hzgraf").value),t=parseFloat(document.getElementById("egraf").value),s=parseFloat(document.getElementById("epgraf").value),i=parseFloat(document.getElementById("b2graf").value),o=parseFloat(document.getElementById("zonaok").value),l=parseFloat(document.getElementById("kvran").value);let S=parseFloat(document.getElementById("ubicacion").value),r=parseFloat(document.getElementById("dentelloncorr").value),L=document.getElementById("consDes").value,N=parseFloat(document.getElementById("ubicacioncon").value),q=parseFloat(document.getElementById("dentelloncons").value),y=document.getElementById("consDescons").value,I=document.getElementById("desing").value,v=parseFloat(document.getElementById("fy").value),A=parseFloat(document.getElementById("fc").value);var F=document.getElementById("acer").value,C=document.getElementById("acer").selectedIndex,k=document.getElementById("acer").options[C].text,M=parseFloat(F);let B=parseFloat(document.getElementById("numbarras").value);var X=document.getElementById("acertrans").value,E=document.getElementById("acertrans").selectedIndex,_=document.getElementById("acertrans").options[E].text,W=parseFloat(X);let G=parseFloat(document.getElementById("porpocion").value);var Z=document.getElementById("acerclibre").value,Y=document.getElementById("acerclibre").selectedIndex,V=document.getElementById("acerclibre").options[Y].text,H=parseFloat(Z);let D=parseFloat(document.getElementById("lpr").value),U=parseFloat(document.getElementById("corteA").value),j=parseFloat(document.getElementById("DF").value);var b=document.getElementById("aceroLs").value,st=document.getElementById("aceroLs").selectedIndex,pt=document.getElementById("aceroLs").options[st].text,Q=parseFloat(b);let Ut=parseFloat(document.getElementById("numbarrasls").value);var Ea=document.getElementById("acerpun").value,Lt=document.getElementById("acerpun").selectedIndex,_t=document.getElementById("acerpun").options[Lt].text,vt=parseFloat(Ea);let Ma=parseFloat(document.getElementById("numbarrapun").value);var kt=document.getElementById("acertranspun").value,Gt=document.getElementById("acertranspun").selectedIndex,Wt=document.getElementById("acertranspun").options[Gt].text,Bt=parseFloat(kt);let Zt=parseFloat(document.getElementById("porpocionpun").value);var ft=document.getElementById("acerclibrepun").value,Yt=document.getElementById("acerclibrepun").selectedIndex,jt=document.getElementById("acerclibrepun").options[Yt].text,Qt=parseFloat(ft),Jt=document.getElementById("aceroLspun").value,ct=document.getElementById("aceroLspun").selectedIndex,ta=document.getElementById("aceroLspun").options[ct].text,wt=parseFloat(Jt);let Ct=parseFloat(document.getElementById("numbarraslspun").value);var Dt=document.getElementById("acertal").value,aa=document.getElementById("acertal").selectedIndex,Aa=document.getElementById("acertal").options[aa].text,sa=parseFloat(Dt);let Ia=parseFloat(document.getElementById("numbarratal").value);var it=document.getElementById("acertranstal").value,ot=document.getElementById("acertranstal").selectedIndex,Ft=document.getElementById("acertranstal").options[ot].text,$t=parseFloat(it);let Ta=parseFloat(document.getElementById("porpociontal").value);var Js=document.getElementById("acerclibretal").value,te=document.getElementById("acerclibretal").selectedIndex,ae=document.getElementById("acerclibretal").options[te].text,bt=parseFloat(Js);let La=parseFloat(document.getElementById("Longitud").value),se=parseFloat(document.getElementById("LTal").value);var ee=document.getElementById("aceroKey").value,Ba=document.getElementById("aceroKey").selectedIndex,ea=document.getElementById("aceroKey").options[Ba].text;let ns=parseFloat(document.getElementById("numbarraKey").value);var fa=document.getElementById("acerotransKey").value,Ot=document.getElementById("acerotransKey").selectedIndex,Pt=document.getElementById("acerotransKey").options[Ot].text;let hs=parseFloat(document.getElementById("porpocionKey").value);var wa=document.getElementById("aceroCLkey").value,ce=document.getElementById("aceroCLkey").selectedIndex,oe=document.getElementById("aceroCLkey").options[ce].text;Or(g,a,f,p,w,O,u,o,l,x,n,P,d,e,T,h,i,m,t,s,S,r,L,N,q,y,I,A,v,M,k,B,W,_,G,H,V,D,j,pt,Q,Ut,_t,vt,Ma,Wt,Bt,Zt,jt,Qt,ta,wt,Ct,U,Aa,sa,Ia,Ft,$t,Ta,ae,bt,La,se,ee,ea,ns,fa,Pt,hs,wa,oe)}function Or(a,g,f,p,u,x,T,e,d,O,P,w,n,h,m,t,s,i,o,l,S,r,L,N,q,y,I,v,A,F,C,k,M,B,X,E,_,W,G,Z,Y,V,H,D,U,j,b,st,pt,Q,Ut,Ea,Lt,_t,vt,Ma,kt,Gt,Wt,Bt,Zt,ft,Yt,jt,Qt,Jt,ct,ta,wt,Ct,Dt,aa){let Aa=[["si",a+r],["no",a]],sa=2;function Ia(Ht,xt,ba){for(let ua=0;ua<xt.length;ua++)if(xt[ua][0]===Ht)return xt[ua][ba-1];return null}let it=Ia(T,Aa,sa);var ca=n*Math.PI/180,J=w*Math.PI/180;let ot=Math.cos(J),Ft=Math.pow(Math.cos(ca),2),$t=Math.pow(Math.cos(J),2),Ta=ot-Math.pow($t-Ft,.5),Js=ot+Math.pow($t-Ft,.5),te=ot+Math.pow($t-Ft,.5),ae=ot-Math.pow($t-Ft,.5),bt=ot*Ta/Js,La=ot*te/ae,se=`
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Desplante</th>
                <th class='py-2 px-4' scope="col">Df</th>
                <td class='py-2 px-4 text-center' scope="col">${g}</td>
                <td class='py-2 px-4' scope="col">m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Altura</th>
                <th class='py-2 px-4' scope="col">H</th>
                <td class='py-2 px-4 text-center' scope="col">${a}</td>
                <td class='py-2 px-4' scope="col">m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Espesor</th>
                <th class='py-2 px-4' scope="col">e</th>
                <td class='py-2 px-4 text-center' scope="col">${O}</td>
                <td class='py-2 px-4' scope="col">m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Angulo de Inclinacion</th>
                <th class='py-2 px-4' scope="col">ϕ</th>
                <td class='py-2 px-4 text-center' scope="col">${f}</td>
                <td class='py-2 px-4' scope="col">°</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">MONONOBE-OKABE?</th>
                <th class='py-2 px-4' scope="col">-</th>
                <td class='py-2 px-4 text-center' scope="col">${e}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Kv esta en el rango de 0.3-0.6 Kh</th>
                <th class='py-2 px-4' scope="col">-</th>
                <td class='py-2 px-4 text-center' scope="col">${d}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Peso especifico del concreto</th>
                <th class='py-2 px-4' scope="col">Yc</th>
                <td class='py-2 px-4 text-center' scope="col">${m}</td>
                <td class='py-2 px-4' scope="col">Tn/m<sup>3</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Peso especifico del suelo</th>
                <th class='py-2 px-4' scope="col">Ys</th>
                <td class='py-2 px-4 text-center' scope="col">${h}</td>
                <td class='py-2 px-4' scope="col">Tn/m<sup>3</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Angulo friccion del suelo</th>
                <th class='py-2 px-4' scope="col">Ø</th>
                <td class='py-2 px-4 text-center' scope="col">${n}</td>
                <td class='py-2 px-4' scope="col">°</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Cohesion</th>
                <th class='py-2 px-4' scope="col">z</th>
                <td class='py-2 px-4 text-center' scope="col">${x}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Angulo de Talud</th>
                <th class='py-2 px-4' scope="col">d</th>
                <td class='py-2 px-4 text-center' scope="col">${w}</td>
                <td class='py-2 px-4' scope="col">°</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Sobrecarga</th>
                <th class='py-2 px-4' scope="col">S/C</th>
                <td class='py-2 px-4 text-center' scope="col">${u}</td>
                <td class='py-2 px-4' scope="col">Tn/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Altura de la sobrecarga</th>
                <th class='py-2 px-4' scope="col">hs</th>
                <td class='py-2 px-4 text-center' scope="col">${P}</td>
                <td class='py-2 px-4' scope="col">m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Factor de empuje activo</th>
                <th class='py-2 px-4' scope="col">ka</th>
                <td class='py-2 px-4 text-center' scope="col">${bt.toFixed(4)}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">factor de empuje pasivo</th>
                <th class='py-2 px-4' scope="col">kp</th>
                <td class='py-2 px-4 text-center' scope="col">${La.toFixed(4)}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600"><th scope="col" colspan="6"></th></tr>
            `,ee=document.getElementById("Requisitodesing");ee.innerHTML=se;var Ba=h*parseFloat(bt)*it,ea=it*Ba/2,ns=ea*Math.sin(J),fa=ea*Math.cos(J),Ot=h*bt*P,Pt=parseFloat(it)*parseFloat(Ot),hs=parseFloat(Pt*Math.sin(J)),wa=Pt*Math.cos(J),ce=it+P,oe=parseFloat(parseFloat(Ba)+parseFloat(Ot)),qr=ea+Pt,Ca=ns+hs,Da=parseFloat(fa+wa);let Xr=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Altura del muro</th>
                    <th class='py-2 px-4' scope="col">H</th>
                    <td class='py-2 px-4 text-center'>${it.toFixed(2)} m</td>
                    <td class='py-2 px-4 text-center'>${P.toFixed(2)} m</td>
                    <td class='py-2 px-4'>${ce.toFixed(2)} m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Peso del suelo</th>
                    <th class='py-2 px-4' scope="col" colspan="0">sMAX</th>
                    <td class='py-2 px-4 text-center'>${Ba.toFixed(2)} Tn/m<sup>3</sup></td>
                    <td class='py-2 px-4 text-center'>${Ot.toFixed(2)} Tn/m<sup>3</sup></td>
                    <td class='py-2 px-4'>${oe.toFixed(2)} Tn/m<sup>3</sup></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Peso propio del muro</th>
                    <th class='py-2 px-4' scope="col" colspan="0">P</th>
                    <td class='py-2 px-4 text-center'>${ea.toFixed(2)} Tn</td>
                    <td class='py-2 px-4 text-center'>${Pt.toFixed(2)} Tn</td>
                    <td class='py-2 px-4'>${qr.toFixed(2)} Tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Presion vertical</th>
                    <th class='py-2 px-4' scope="col" colspan="0">Pv</th>
                    <td class='py-2 px-4 text-center'>${ns.toFixed(2)} Tn</td>
                    <td class='py-2 px-4 text-center'>${hs.toFixed(2)} Tn</td>
                    <td class='py-2 px-4'>${Ca.toFixed(2)} Tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Presion horizontal</th>
                    <th class='py-2 px-4' scope="col" colspan="0">Ph</th>
                    <td class='py-2 px-4 text-center'>${fa.toFixed(2)} Tn</td>
                    <td class='py-2 px-4 text-center'>${wa.toFixed(2)} Tn</td>
                    <td class='py-2 px-4'>${Da.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600"><th scope="col" colspan="6"></th></tr>`,Hr=document.getElementById("primerTabla");Hr.innerHTML=Xr;var St=o+l,z=t+St+s,ca=n*Math.PI/180,J=w*Math.PI/180,ys=t*t*.5*Math.tan(J),gs=t*a,xs=P*t/Math.cos(J),is=z*i,bs=l*a*.5,us=o*a,ms=ys*h,vs=gs*h,ks=xs*h,Oa=is*m,Vt=bs*m,Rt=us*m,re=2*t/3+s+St,Fs=t/2+St+s,le=Fs,pe=z/2,de=2*l/3+s,ne=o/2+l+s,he=ms*re,ye=vs*Fs,ge=ks*le,xe=Oa*pe,ie=Vt*de,be=Rt*ne,Pa=parseFloat(ms)+parseFloat(vs)+parseFloat(ks)+parseFloat(Oa)+parseFloat(Vt)+parseFloat(Rt),Sa=parseFloat(he)+parseFloat(ye)+parseFloat(ge)+parseFloat(xe)+parseFloat(ie)+parseFloat(be),Ur=parseFloat(is)+parseFloat(bs)+parseFloat(us),_r=parseFloat(Oa)+parseFloat(Vt)+parseFloat(Rt),ue=parseFloat(Ca)*(z-t),Va=parseFloat(Sa)+parseFloat(ue),me=parseFloat(fa)*(parseFloat(a)/3),ve=wa*(a/2),Ra=parseFloat(me)+parseFloat(ve),Oc=(Va/Ra).toFixed(2),ke="";if(Oc<2)var ke="NO";else var ke="OK";let Gr=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">1</th>
                    <td class='py-2 px-4'>${ys.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ms.toFixed(2)}</td>
                    <td class='py-2 px-4'>${re.toFixed(2)}</td>
                    <td class='py-2 px-4'>${he.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO TALUD</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">2</th>
                    <td class='py-2 px-4'>${gs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${vs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Fs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ye.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">3</th>
                    <td class='py-2 px-4'>${xs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ks.toFixed(2)}</td>
                    <td class='py-2 px-4'>${le.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ge.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO S/C</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">4</th>
                    <td class='py-2 px-4'>${is.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Oa.toFixed(2)}</td>
                    <td class='py-2 px-4'>${pe.toFixed(2)}</td>
                    <td class='py-2 px-4'>${xe.toFixed(2)}</td>
                    <td class='py-2 px-4'>BASE</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">5</th>
                    <td class='py-2 px-4'>${bs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Vt.toFixed(2)}</td>
                    <td class='py-2 px-4'>${de.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ie.toFixed(2)}</td>
                    <td class='py-2 px-4'>CUÑA</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">6</th>
                    <td class='py-2 px-4'>${us.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Rt.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ne.toFixed(2)}</td>
                    <td class='py-2 px-4'>${be.toFixed(2)}</td>
                    <td class='py-2 px-4'>PANTALLA</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col"></th>
                    <td class='py-2 px-4 text-right'>N=</td>
                    <td class='py-2 px-4'>${Pa.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right'>Mr=</td>
                    <td class='py-2 px-4'>${Sa.toFixed(2)}</td>
                    <td class='py-2 px-4'></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Area del concreto</th>
                    <td class='py-2 px-4'>${Ur.toFixed(2)} m<sup>2</sup></td>
                    <td class='py-2 px-4 text-right'></td>
                    <td class='py-2 px-4'>${_r.toFixed(2)} tn/m</td>
                    <td class='py-2 px-4'></td>
                </tr>
            `,Wr=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6"></th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-lg py-2 px-4 text-left" scope="col" colspan="6">3.1.1 Verificacion por volteo sin sismo</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente (muro + terreno)</th>
                    <th class='py-2 px-4' scope="col">Mr</th>
                    <td class='py-2 px-4'>${Sa.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento vertical debido a la presion</th>
                    <th class='py-2 px-4' scope="col">Mv</th>
                    <td class='py-2 px-4'>${ue.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                    <th class='py-2 px-4' scope="col">mv Total</th>
                    <td class='py-2 px-4'>${Va.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento horizontal debido a la presion de suelo</th>
                    <th class='py-2 px-4' scope="col">MhSUELO</th>
                    <td class='py-2 px-4'>${me.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento horizontal debido a la sobrecarga</th>
                    <th class='py-2 px-4' scope="col">MhS/C</th>
                    <td class='py-2 px-4'>${ve.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente verical total</th>
                    <th class='py-2 px-4' scope="col">MhTOTAL</th>
                    <td class='py-2 px-4'>${Ra.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                    <th class='py-2 px-4' scope="col">F.S.=</th>
                    <th class='py-2 px-4' scope="col">${Oc}</th>
                    <th class='py-2 px-4' scope="col">${ke}</th>
                </tr>
            `;var $s=Math.tan(ca),Et=parseFloat(Pa)+parseFloat(Ca),Es=parseFloat(Et)*parseFloat($s),Pc=Es/Da,Fe="";if(Pc<1.5)var Fe="NO";else var Fe="OK";let Zr=`
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th scope="col" colspan="6"></th>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-lg py-2 px-4 text-left" scope="col" colspan="6">3.1.2 Verificacion por deslizamiento sin sismo</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Peso total del muro + terreno apoyado</th>
                <th class='py-2 px-4' scope="col">N</th>
                <td class='py-2 px-4'>${Pa.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col">Tn</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Presion vertical del terreno</th>
                <th class='py-2 px-4' scope="col">PVtotal</th>
                <td class='py-2 px-4'>${Ca.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col">Tn</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                <th class='py-2 px-4' scope="col">Rv</th>
                <td class='py-2 px-4'>${Et.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col">Tn</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Coeficiente de friccion</th>
                <th class='py-2 px-4' scope="col">µ</th>
                <td class='py-2 px-4'>${$s.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col"></th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                <th class='py-2 px-4' scope="col">Fr=</th>
                <td class='py-2 px-4'>${Es.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col">Tn</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Presion horizontal</th>
                <th class='py-2 px-4' scope="col">ph Total=</th>
                <td class='py-2 px-4'>${Da.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col">Tn</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                <th class='py-2 px-4' scope="col">F.S.=</th>
                <th class='py-2 px-4' scope="col">${Pc.toFixed(2)}</th>
                <th class='py-2 px-4' scope="col">${Fe}</th>
            </tr>
            `,Yr=`
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="6">3.2 Verificacion con efecto sismico</th>
                </tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class='py-2 px-4' scope="col">Componente</th>
                    <th class='py-2 px-4' scope="col">Area <br>(m<sup>2</sup>)</th>
                    <th class='py-2 px-4' scope="col">Peso <br>(Tn)</th>
                    <th class='py-2 px-4' scope="col">Brazo <br>(m)</th>
                    <th class='py-2 px-4' scope="col">Momento <br>(Tn-m)</th>
                    <th class='py-2 px-4' scope="col">Descripcion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">1</th>
                    <td class='py-2 px-4'>${ys.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ms.toFixed(2)}</td>
                    <td class='py-2 px-4'>${re.toFixed(2)}</td>
                    <td class='py-2 px-4'>${he.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO TALUD</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">2</th>
                    <td class='py-2 px-4'>${gs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${vs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Fs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ye.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">3</th>
                    <td class='py-2 px-4'>${xs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ks.toFixed(2)}</td>
                    <td class='py-2 px-4'>${le.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ge.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO S/C</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">4</th>
                    <td class='py-2 px-4'>${is.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Oa.toFixed(2)}</td>
                    <td class='py-2 px-4'>${pe.toFixed(2)}</td>
                    <td class='py-2 px-4'>${xe.toFixed(2)}</td>
                    <td class='py-2 px-4'>BASE</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">5</th>
                    <td class='py-2 px-4'>${bs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Vt.toFixed(2)}</td>
                    <td class='py-2 px-4'>${de.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ie.toFixed(2)}</td>
                    <td class='py-2 px-4'>CUÑA</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">6</th>
                    <td class='py-2 px-4'>${us.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Rt.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ne.toFixed(2)}</td>
                    <td class='py-2 px-4'>${be.toFixed(2)}</td>
                    <td class='py-2 px-4'>PANTALLA</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col"></th>
                    <td class='py-2 px-4' class="text-right">N=</td>
                    <td class='py-2 px-4'>${Pa.toFixed(2)}</td>
                    <td class='py-2 px-4' class="text-right">Mr=</td>
                    <td class='py-2 px-4'>${Sa.toFixed(2)}</td>
                     <th class='py-2 px-4' scope="col"></th>
                </tr>
            `,za=0;switch(e){case .4:za=e/2;break;case .3:za=e/2;break;case .15:za=e/2;break;default:za=0;break}var Ka=Math.atan(za/(1-d)),jr=Math.sin(ca+J),Qr=Math.sin(ca-Ka-0),Jr=Math.cos(0+J+Ka),tl=Math.cos(0),Sc=Math.cos(ca-Ka-0),al=Math.cos(Ka)*Math.cos(0)*Math.cos(0)*Math.cos(0+J+Ka),sl=Math.pow(jr*Qr/(Jr*tl),.5),el=Math.pow(1+sl,2),cl=Sc*Sc/(el*al),ol=.5*h*(1-d)*cl*a*a,rl=.5*h*bt*a*a,Na=ol-rl,ll=a*.6,Ms=Na*ll,qa=parseFloat(Ra)+parseFloat(Ms),Vc=Va/qa,$e="";if(Vc<1.2)var $e="NO";else var $e="OK";let pl=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6"></th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">3.2.1 Verificacion por volteo con sismo</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente (muro + terreno)</th>
                    <th class='py-2 px-4' scope="col">Mr</th>
                    <td class='py-2 px-4'>${Sa.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento vertical debido a la presion</th>
                    <th class='py-2 px-4' scope="col">Mv</th>
                    <td class='py-2 px-4'>${ue.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                    <th class='py-2 px-4' scope="col">mv Total</th>
                    <td class='py-2 px-4'>${Va.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento horizontal debido a la presion de suelo</th>
                    <th class='py-2 px-4' scope="col">MhSUELO</th>
                    <td class='py-2 px-4'>${me.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento horizontal debido a la sobrecarga</th>
                    <th class='py-2 px-4' scope="col">MhS/C</th>
                    <td class='py-2 px-4'>${ve.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3"></th>
                    <th class='py-2 px-4' scope="col">MqTOTAL</th>
                    <td class='py-2 px-4'>${Ms.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente verical total</th>
                    <th class='py-2 px-4' scope="col">MhTOTAL</th>
                    <td class='py-2 px-4'>${qa.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                    <th class='py-2 px-4' scope="col">F.S.</th>
                    <th class='py-2 px-4' scope="col">${Vc.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${$e}</th>
                </tr>
            `;var As=(parseFloat(Na)+parseFloat(Da)).toFixed(2),Rc=(parseFloat(Es)/parseFloat(As)).toFixed(2),dl=Rc<1.2?"NO":"OK";let nl=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6"></th>
                </tr>
                 <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">3.2.2. Verificacion por deslizamiento con sismo</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Peso total del muro + terreno apoyado</th>
                    <th class='py-2 px-4' scope="col">N</th>
                    <td class='py-2 px-4'>${Pa.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Presion vertical del terreno</th>
                    <th class='py-2 px-4' scope="col">PVtotal</th>
                    <td class='py-2 px-4'>${Ca.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                    <th class='py-2 px-4' scope="col">Rv</th>
                    <td class='py-2 px-4'>${Et.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Coeficiente de friccion</th>
                    <th class='py-2 px-4' scope="col">µ</th>
                    <td class='py-2 px-4'>${$s.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                    <th class='py-2 px-4' scope="col">Fr</th>
                    <td class='py-2 px-4'>${Es.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3"></th>
                    <th class='py-2 px-4' scope="col">Pq</th>
                    <td class='py-2 px-4'>${Na.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Presion horizontal total</th>
                    <th class='py-2 px-4' scope="col">Ph total</th>
                    <td class='py-2 px-4'>${As}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                    <th class='py-2 px-4' scope="col">F.S.</th>
                    <th class='py-2 px-4' scope="col">${Rc}</th>
                    <th class='py-2 px-4' scope="col">${dl}</th>
                </tr>
                <tr class="text-center" colspan="6"></tr>
            `;function zc(Ht){const xt=$(".tabla-oculta"),ba=$(".tabla-ocultabody");Ht==="si"?(xt.show(),ba.show()):(xt.hide(),ba.hide())}var Ee=0;switch(T){case"si":zc(T);var Me=(St*r).toFixed(2),oa=(parseFloat(Me)*parseFloat(m)).toFixed(2);let Ht=S,xt=Ht*oa;var Xa=xt+Va,Kc=(Xa/Ra).toFixed(2);let ba=Kc<2?"NOT":"OK";var Is=parseFloat(oa)+parseFloat(Et),Ts=parseFloat(Is*$s),Ae=0;switch(L){case"si":Ae=Math.pow(r+i,2)*h*La*.5;break;default:Ae=0;break}var Ie=Ae,Nc=parseFloat(Da),Te=(parseFloat(Ts)+parseFloat(Ie))/Nc;let ua=Te<1.5?"NOT":"OK";var Ls=parseFloat(Xa),qc=Ra,Xc=Ls-qc,Bs=parseFloat(Is),Ha=Xc/Bs,Ua=(z/3).toFixed(2),fs=(Ua*2).toFixed(2);let Mc="";Ha>=Ua&&Ha<=fs?Mc="SI":Mc="NO";var ut=((4*z-6*Ha)*Et/(z*z)).toFixed(2),_a=((-2*z+6*Ha)*Et/(z*z)).toFixed(2),Ga=12.5;let ls="";ut<Ga?ls="OK":ls="NOT";let ps="";_a<Ga?ps="OK":ps="NOT";const ma=[0,0,z,z],Ac=[0,-ut,-_a,0];var ws=((_a-ut)/z).toFixed(2),Cs=parseFloat(h*bt*a*Math.cos(J)+Ot).toFixed(2),Wa=Ot,Hc=ut,Uc=ws*s+parseFloat(ut),_c=ws*t+parseFloat(ut),Le=_a,Be=((parseFloat(ys)+parseFloat(gs)+parseFloat(xs))*parseFloat(h)/parseFloat(t)).toFixed(2),Ds=parseFloat(h*bt*(a+i+r)*Math.cos(J)+Wa).toFixed(2),Os=parseFloat(h*bt*(a+i)*Math.cos(J)+Wa).toFixed(2),hl=St,yl=a,gl=parseFloat(Vt)+parseFloat(Rt),fe=i,xl=s,we=s*i*m,Ce=i,il=t,De=i*t*m,Gc=St,bl=r,ul=oa,Wc=(Xa/qa).toFixed(2),Oe="";Wc?Oe="OK":Oe="NOT";var Pe=0;switch(y){case"si":Pe=Math.pow(r+i,2)*h*La*.5;break;default:Pe=0;break}var ml=((parseFloat(Ts)+parseFloat(Ie))/As).toFixed(2);let kd=Te<1.2?"NOT":"OK";var Zc=(Ls-qa).toFixed(2),Za=Zc/Bs;let Ic="";Za>=Ua&&Za<=fs?Ic="SI":Ic="NO";var dt=(4*z-6*Za)*Et/(z*z),ra=(-2*z+6*Za)*Et/(z*z),vl=1.3*Ga;let Fd="";dt<Ga?ls="OK":ls="NOT";let $d="";ra<Ga?ps="OK":ps="NOT";var Ps=((ra-dt)/z).toFixed(2),Yc=Ps*s+parseFloat(dt),jc=Ps*t+parseFloat(dt);Ee=Na;var kl=0,Fl=0,$l=parseFloat(Vt)+parseFloat(Rt),El=0,Ml=0,Al=0*w,Il=0,Tl=0,Ll=0*w,Bl=a,fl=r,wl=oa;const Ed=document.getElementById("keysin");Ed.innerHTML=`
                         <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Area del dentellon</th>
                            <th class='py-2 px-4' scope="col">a</th>
                            <td class='py-2 px-4' id="areaValue">${Me}</td>
                            <th class='py-2 px-4' scope="col">m<sup>2</sup></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Peso del dentellon</th>
                            <th class='py-2 px-4' scope="col">p</th>
                            <td class='py-2 px-4' id="PesoValue">${oa}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.1.-Volteo</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">Brazo</th>
                            <td class='py-2 px-4' id="braValue">${Ht}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th  class='py-2 px-4' scope="col" colspan="3"></th>
                            <th  class='py-2 px-4' scope="col">Momento</th>
                            <td  class='py-2 px-4' id="momentoValue">${xt.toFixed(2)}</td>
                            <th  class='py-2 px-4' scope="col">Tn-m</th>

                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                            <th class='py-2 px-4' scope="col">Mv'TOTAL</th>
                            <td class='py-2 px-4' id="mvprValue">${Xa.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                            <th class='py-2 px-4' scope="col">F.S.</th>
                            <td class='py-2 px-4' id="fskeyValue">${Kc}</td>
                            <th class='py-2 px-4' scope="col" id="verkeyValue">${ba}</th>
                        </tr>

                         <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.2.- Deslizamiento</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                            <th class='py-2 px-4' scope="col">Rv</th>
                            <td class='py-2 px-4' id="rvkey">${Is.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                            <th class='py-2 px-4' scope="col">Fr</th>
                            <td class='py-2 px-4' id="frkey">${Ts.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Presion pasiva del suelo (solo el peralte de la zapata + key)</th>
                            <th class='py-2 px-4' scope="col">Pp</th>
                            <td class='py-2 px-4' id="ppdes">${Ie.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>

                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Presion horizontal</th>
                            <th class='py-2 px-4' scope="col">Ph</th>
                            <td class='py-2 px-4' id="phdes">${Nc.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                            <th class='py-2 px-4' scope="col">F.S.</th>
                            <td class='py-2 px-4' id="fskeydes">${Te.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col" id="verfkeydes">${ua}</th>
                        </tr>


                        <!--DATOS DE VERIFICACION POR ESFUERZO DEL TERRENO-->
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.3.- Verificacion por esfuerzo del terreno</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                            <th class='py-2 px-4' scope="col">Mv'TOTAL</th>
                            <td class='py-2 px-4' id="mvveri ">${Ls.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento generado devido a la presion horizontal del terreno</th>
                            <th class='py-2 px-4' scope="col">Mh</th>
                            <td class='py-2 px-4' id="mhver">${parseFloat(qc).toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">ΣMo</th>
                            <td class='py-2 px-4' id="emover">${Xc.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                            <th class='py-2 px-4' scope="col">Rv'=</th>
                            <td class='py-2 px-4' id="rvpriver">${Bs.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>

                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.4.- Nucleo Central</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Excentricidad</th>
                            <th class='py-2 px-4' scope="col">e</th>
                            <td class='py-2 px-4' id="enc">${Ha.toFixed(1)}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Tercio de la longitud</th>
                            <th class='py-2 px-4' scope="col">L/3</th>
                            <td class='py-2 px-4' id="lter">${Ua}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Dos tercios de la longitud</th>
                            <th class='py-2 px-4' scope="col">2L/3</th>
                            <td class='py-2 px-4' id="llter">${fs}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">¿Esta en el tercio centrarl?</th>
                            <td class='py-2 px-4' id="pregunta">${Mc}</td>
                            <th class='py-2 px-4' scope="col"></th>
                        </tr>

                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.5.- Esfuerzo en los extremos de la cimentacion</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="2">Esfuerzo del suelo</th>
                            <th class='py-2 px-4' scope="col">S1</th>
                            <td class='py-2 px-4' id="s1">${ut}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                            <td class='py-2 px-4' id="verfs1">${ls}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="2">Esfuerzo del suelo</th>
                            <th class='py-2 px-4' scope="col">S2</th>
                            <td class='py-2 px-4' id="s2">${_a}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                            <td class='py-2 px-4' id="verfs2">${ps}</td>
                        </tr>
                        <!--GRAFICAS DE VERIFICACION POR ESFUERZO DEL TERRENO-->
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td colspan="6" class="text-center">
                                <div id="grafpresion" style="width: auto; height:300px;"></div>
                            </td>
                        </tr>
                        <!--<tr>
                            <th scope="col" colspan="6" class="text-center">Ecuacion del diagrama de pensiones</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col">Y</th>
                            <td class='py-2 px-4' >=</td>
                            <td class='py-2 px-4' id="a">${ws}</td>
                            <th class='py-2 px-4' scope="col">+</th>
                            <td class='py-2 px-4' id="s2">X</td>
                            <td class='py-2 px-4' id="s1graf">${ut}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4' colspan="6">
                                <div id="grafico" style="width: auto; height:300px;"></div>
                            </td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col">b</th>
                            <td class='py-2 px-4'>${ut}</td>
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col">a</th>
                            <td class='py-2 px-4'>${ws}</td>
                        </tr>-->
                        <!--ESFUERZOS DEL TERRENO PARA CALCULO DEL REFUERZO-->
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.6.- Esfuerzo del terreno para calculo del esfuerzo</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th scope="col" colspan="2" rowspan="3" class='py-2 px-4' style="vertical-align: middle;">Pantalla</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q2</th>
                            <td class='py-2 px-4' id="pantq2">${Cs}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="pantq1">${Wa.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th colspan="6"><!--Espaciados--></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th scope="col" colspan="2"  rowspan="3" class="text-center" style="vertical-align: middle;">Punta</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q2</th>
                            <td class='py-2 px-4' id="puntq2">${Hc}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="puntq1">${Uc.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>

                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th colspan="6"><!--Espaciados--></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th scope="col" colspan="2" rowspan="4" class="text-center" style="vertical-align: middle;">Talon</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="0" class="text-center">S del suelo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">q2</th>
                            <td class='py-2 px-4' id="talq2">${_c.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="0" class="text-center">S del suelo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="talq1">${Le}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" class="text-center">W del suelo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">P.T.</th>
                            <td class='py-2 px-4' id="talpt">${Be}</td>
                            <td class='py-2 px-4'></td>
                        </tr>

                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th colspan="6"><!--Espaciados--></th>
                        </tr>

                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th scope="col" colspan="2" rowspan="3" class="text-center" style="vertical-align: middle;">Key</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="0" class="text-center">Empuje activo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">q2</th>
                            <td class='py-2 px-4' id="keyq2">${Ds}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="0" class="text-center">Empuje activo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="keyq1">${Os}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th colspan="6"><!--Espaciados--></th>
                        </tr>



                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.7.- Dimenciones finales</th>
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <th class="text-lg py-2 px-4" scope="col" colspan="2"></th>
                            <th class="text-lg py-2 px-4 text-left" scope="col"></th>
                            <th class="text-lg py-2 px-4 text-left" scope="col">Espesor</th>
                            <th class="text-lg py-2 px-4 text-center" scope="col" >Longitud</th>
                            <th class="text-lg py-2 px-4 text-left" scope="col">P.P.</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Pantalla</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="panes">${hl}</td>
                            <td class='py-2 px-4 text-center' id="panlog">${yl}</td>
                            <td class='py-2 px-4 text-left' id="panpp">${gl.toFixed(2)}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Punta</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="punes">${fe}</td>
                            <td class='py-2 px-4 text-center' id="punlong">${xl}</td>
                            <td class='py-2 px-4 text-left' id="puntpp">${we}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Talon</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="tanles">${Ce}</td>
                            <td class='py-2 px-4 text-center' id="tanlong">${il}</td>
                            <td class='py-2 px-4 text-left' id="tanpp">${De.toFixed(2)}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Key</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="keyes">${Gc}</td>
                            <td class='py-2 px-4 text-center' id="keylong">${bl}</td>
                            <td class='py-2 px-4 text-left' id="keypp">${ul}</td>
                        </tr>
                        <tr class="text-center" colspan="6"></tr>
                    `;const Md=document.getElementById("keycon");Md.innerHTML=`
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Area</th>
                            <th class='py-2 px-4' scope="col">a</th>
                            <td class='py-2 px-4' id="areaValue">${Me}</td>
                            <th class='py-2 px-4' scope="col">m<sup>2</sup></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Peso</th>
                            <th class='py-2 px-4' scope="col">p</th>
                            <td class='py-2 px-4' id="PesoValue">${oa}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>

                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.1.- Volteo</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">Brazo</th>
                            <td class='py-2 px-4' id="braValue">${Ht}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">Momento</th>
                            <td class='py-2 px-4' id="momentoValue">${xt.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                            <th class='py-2 px-4' scope="col">Mv'TOTAL</th>
                            <td class='py-2 px-4' id="mvprValue">${Xa.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                            <th class='py-2 px-4' scope="col">F.S.</th>
                            <td class='py-2 px-4' id="fskeyValue">${Wc}</td>
                            <th class='py-2 px-4' scope="col" id="verkeyValue">${Oe}</th>
                        </tr>

                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.2.- Deslizamiento</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                            <th class='py-2 px-4' scope="col">Rv</th>
                            <td class='py-2 px-4' id="rvkey">${Is.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                            <th class='py-2 px-4' scope="col">Fr</th>
                            <td class='py-2 px-4' id="frkey">${Ts.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Presion pasiva del suelo (solo el peralte de la zapata + key)</th>
                            <th class='py-2 px-4' scope="col">Pp</th>
                            <td class='py-2 px-4' id="ppdes">${Pe.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Presion horizontal</th>
                            <th class='py-2 px-4' scope="col">Ph</th>
                            <td class='py-2 px-4' id="phdes">${As}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                            <th class='py-2 px-4' scope="col">F.S.</th>
                            <td class='py-2 px-4' id="fskeydes">${ml}</td>
                            <th class='py-2 px-4' scope="col" id="verfkeydes">${kd}</th>
                        </tr>


                        <!--DATOS DE VERIFICACION POR ESFUERZO DEL TERRENO-->
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.3.- Verificacion por esfuerzo del terreno</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                            <th class='py-2 px-4' scope="col">Mv'TOTAL</th>
                            <td class='py-2 px-4' id="mvveri ">${Ls.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento generado devido a la presion horizontal del terreno</th>
                            <th class='py-2 px-4' scope="col">Mh</th>
                            <td class='py-2 px-4' id="mhver">${qa.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">ΣMo</th>
                            <td class='py-2 px-4' id="emover">${Zc}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                            <th class='py-2 px-4' scope="col">Rv'=</th>
                            <td class='py-2 px-4' id="rvpriver">${Bs.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>

                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.4.- Nucleo Central</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Excentricidad</th>
                            <th class='py-2 px-4' scope="col">e</th>
                            <td class='py-2 px-4' id="enc">${Za.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Torcion de la longitud</th>
                            <th class='py-2 px-4' scope="col">L/3</th>
                            <td class='py-2 px-4' id="lter">${Ua}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Torcion de la longitud</th>
                            <th class='py-2 px-4' scope="col">2L/3</th>
                            <td class='py-2 px-4' id="llter">${fs}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">1.3 SADM</th>
                            <td class='py-2 px-4' id="llter">${vl}</td>
                            <th class='py-2 px-4' scope="col">Tn/m<sup>2</<sup></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">¿esta en el tercio central?</th>
                            <td class='py-2 px-4' id="pregunta">${Ic}</td>
                            <th class='py-2 px-4' scope="col"></th>
                        </tr>

                         <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.5.- Esfuerzo en los extremos de la cimentacion</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="2">Esfuerzo del suelo</th>
                            <th class='py-2 px-4' scope="col">S1</th>
                            <td class='py-2 px-4' id="s1">${dt.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                            <td class='py-2 px-4' id="verfs1">${Fd}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="2">Esfuerzo del suelo</th>
                            <th class='py-2 px-4' scope="col">S2</th>
                            <td class='py-2 px-4' id="s2">${ra.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                            <td class='py-2 px-4' id="verfs2">${$d}</td>
                        </tr>
                        <!--GRAFICAS DE VERIFICACION POR ESFUERZO DEL TERRENO-->
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td colspan="6" class="text-center">
                                <div id="grafpresionkeycon" style="width: auto; height:300px;"></div>
                            </td>
                        </tr>
                        <!--<tr>
                            <th scope="scope" class="text-center" colspan="6">Ecuaciones del diagrama de presiones</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col">Y</th>
                            <td class='py-2 px-4' >=</td>
                            <td class='py-2 px-4' id="a">${Ps}</td>
                            <th class='py-2 px-4' scope="col">+</th>
                            <td class='py-2 px-4' id="s2">X</td>
                            <td class='py-2 px-4' id="s1graf">${dt.toFixed(2)}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td colspan="6" class="text-center">
                                <div id="graficokeycon" style="width: auto; height:300px;"></div>
                            </td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col">b</th>
                            <td class='py-2 px-4'>${dt}</td>
                            <th class='py-2 px-4' scope="col">a</th>
                            <td class='py-2 px-4'>${Ps}</td>
                        </tr>-->
                        <!--ESFUERZOS DEL TERRENO PARA CALCULO DEL REFUERZO-->
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.6.- Esfuerzo del terreno para calculo del esfuerzo</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th scope="col" colspan="2" rowspan="4" class="text-center" style="vertical-align: middle;">Pantalla</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q2</th>
                            <td class='py-2 px-4' id="pantq2">${Cs}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="pantq1">${Wa.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">F-sismo</th>
                            <td class='py-2 px-4'>${Ee.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th colspan="6"><!--Espaciados--></th>
                        </tr>

                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th scope="col" colspan="2" rowspan="3" class="text-center" style="vertical-align: middle;">Punta</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q2</th>
                            <td class='py-2 px-4' id="puntq2">${dt.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="puntq1">${Yc.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th colspan="6"><!--Espaciados--></th>
                        </tr>

                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th scope="col" colspan="2" rowspan="4" class="text-center" style="vertical-align: middle;">Talon</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="0" class="text-center">s del suelo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">q2</th>
                            <td class='py-2 px-4' id="talq2">${jc.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="0" class="text-center">s del suelo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="talq1">${ra.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" class="text-center">W del suelo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">P.T.</th>
                            <td class='py-2 px-4' id="talpt">${Be}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th colspan="6"><!--Espaciados--></th>
                        </tr>

                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th scope="col" colspan="2" rowspan="3" class="text-center" style="vertical-align: middle;">Key</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q2</th>
                            <td class='py-2 px-4' id="keyq2">${Ds}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">

                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="keyq1">${Os}</td>
                            <td class='py-2 px-4'></td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th colspan="6"><!--Espaciados--></th>
                        </tr>

                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.7.-Dimenciones finales</th>
                        </tr>
                        <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                            <th class="text-lg py-2 px-4" scope="col" colspan="2"></th>
                            <th class="text-lg py-2 px-4 text-left" scope="col"></th>
                            <th class="text-lg py-2 px-4 text-left" scope="col">Espesor</th>
                            <th class="text-lg py-2 px-4 text-center" scope="col" >Longitud</th>
                            <th class="text-lg py-2 px-4 text-left" scope="col">P.P.</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Pantalla</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="panes">${kl}</td>
                            <td class='py-2 px-4 text-center' id="panlog">${Fl}</td>
                            <td class='py-2 px-4 text-left' id="panpp">${$l.toFixed(2)}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Punta</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="punes">${El}</td>
                            <td class='py-2 px-4 text-center' id="punlong">${Ml}</td>
                            <td class='py-2 px-4 text-left' id="puntpp">${Al}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Talon</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="tanles">${Il}</td>
                            <td class='py-2 px-4 text-center' id="tanlong">${Tl}</td>
                            <td class='py-2 px-4 text-left' id="tanpp">${Ll.toFixed(2)}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Key</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="keyes">${Bl}</td>
                            <td class='py-2 px-4 text-center' id="keylong">${fl}</td>
                            <td class='py-2 px-4 text-left' id="keypp">${wl}</td>
                        </tr>
                    `;const Tc=[];for(let K=0;K<ma.length;K++){if(K>0&&ma[K]===ma[K-1]){const fc=[(ma[K]+ma[K-1])/2,(Ac[K]+Ac[K-1])/2];Tc.push(fc)}Tc.push([ma[K],Ac[K]])}const Ad={title:{text:"Diagrama de presiones"},xAxis:{type:"category"},yAxis:{type:"value"},series:[{data:Tc,type:"line"}]};echarts.init(document.getElementById("grafpresion")).setOption(Ad);const va=[0,0,z,z],Lc=[0,-dt,-ra,0];let Bc=[];for(let K=0;K<va.length;K++){if(K>0&&va[K]===va[K-1]){let fc=[(va[K]+va[K-1])/2,(Lc[K]+Lc[K-1])/2];Bc.push(fc)}Bc.push([va[K],Lc[K]])}const Id={title:{text:"Diagrama de presiones"},xAxis:{type:"category"},yAxis:{type:"value"},series:[{data:Bc,type:"line"}]};echarts.init(document.getElementById("grafpresionkeycon")).setOption(Id);break;default:zc(T);break}let Cl=Gr+Wr+Zr+Yr+pl+nl,Dl=document.getElementById("segundaTabla");Dl.innerHTML=Cl;var la=Math.max(Wa,Pt),Se=Math.max(Cs,Cs),Ve=Math.max(we,we),Ya=Math.max(Uc,Yc),Re=Math.max(Hc,dt),ja=Math.max(De,De),pa=Math.max(Le,Be),zt=Math.min(Le,ra),ze=Math.max(_c,jc),Ss=Math.max(Os,Os),Ke=Math.max(Ds,Ds),et=0,Qa=_t,nt=W,Mt=Se-la,Ja=et*Mt/a,Vs=Mt-Ja,Qc=parseFloat(la)*parseFloat(Qa-a),Jc=parseFloat(Vs)*parseFloat(Qa)+parseFloat(Ja)*parseFloat(Qa)/2-parseFloat(Mt)*parseFloat(a)/2,to=Math.abs(Qc+Jc),Rs=I=="sinsismo"?0:Ee,ao=la*(et*et+a*a-2*a*et)/2,so=Vs*et*et/2+Ja*et*et/3-Mt*et*et/2+Mt*a*a/6,eo=ao+so,co=I=="sinsismo"?0:Ms-Rs*et,oo=la*(nt*nt+a*a-2*a*nt)/2,ro=Vs*nt*nt/2+Ja*nt*nt/3-Mt*a*nt/2+Mt*a*a/6,lo=oo+ro,po=I=="sinsismo"?0:Ms-Rs*nt,da=1.7*eo+co,zs=1.7*to+Rs,rt=0,ts=(fe*100-10)/100,as=Re-Ya,Ne=as*rt/a,no=Ya*(ts-s),ho=(Ne*ts-as*s)/2,yo=no+ho,go=Math.abs(Ve*(ts-s)),xo=Ya*(rt*rt+s*s-2*s*rt)/2,io=as*s*s/3+Ne*rt*rt/6-as*s*rt/2,bo=xo+io,uo=Ve*(rt*rt+s*s-2*s*rt)/2,Ks=Math.abs(1.7*-bo-1.4*uo),ss=Math.abs(1.7*yo+-1.4*go);let Ol=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo inicial</th>
                    <th class='py-2 px-4' scope="col">q1</th>
                    <td class='py-2 px-4 text-right'>${la.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo final</th>
                    <th class='py-2 px-4' scope="col">q2</th>
                    <td class='py-2 px-4 text-right'>${Se.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Longitud</th>
                    <th class='py-2 px-4' scope="col">L</th>
                    <td class='py-2 px-4 text-right'>${a}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia inicial</th>
                    <th class='py-2 px-4' scope="col">X1</th>
                    <td class='py-2 px-4 text-right'>${et}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia final</th>
                    <th class='py-2 px-4' scope="col">X2</th>
                    <td class='py-2 px-4 text-right'>${Qa}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">X3</th>
                    <td class='py-2 px-4 text-right'>${nt}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Carga</th>
                    <th class='py-2 px-4' scope="col">w</th>
                    <td class='py-2 px-4 text-right'>${Mt.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia de corte</th>
                    <th class='py-2 px-4' scope="col">a</th>
                    <td class='py-2 px-4 text-right'>${Ja}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">b</th>
                    <td class='py-2 px-4 text-right'>${Vs.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class="text-lg py-2 px-4" scope="col"></th>
                    <th class="text-lg py-2 px-4" scope="col"></th>
                    <th class="text-lg py-2 px-4" scope="col">1</th>
                    <th class="text-lg py-2 px-4" scope="col">2</th>
                    <th class="text-lg py-2 px-4 text-right" scope="col">TOTAL</th>
                    <th class="text-lg py-2 px-4" scope="col">SISMO</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="text-lg py-2 px-4" scope="col" colspan="2">V(X2)</th>
                    <th class="text-lg py-2 px-4" scope="col">${Qc.toFixed(2)}</th>
                    <th class="text-lg py-2 px-4" scope="col">${Jc.toFixed(2)}</th>
                    <th class="text-lg py-2 px-4 text-right" scope="col">${to.toFixed(2)}</th>
                    <th class="text-lg py-2 px-4" scope="col">${Rs.toFixed(2)}</th>
                </tr>
                    <tr class='py-2 px-4' class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">M(X1)</th>
                    <th class='py-2 px-4' scope="col">${ao.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${so.toFixed(2)}</th>
                    <th class='py-2 px-4 text-right' scope="col">${eo.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${co.toFixed(2)}</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">M(X3)</th>
                    <th class='py-2 px-4' scope="col">${oo.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${ro.toFixed(2)}</th>
                    <th class='py-2 px-4 text-right' scope="col">${lo.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${po.toFixed(2)}</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="col">Mu</th>
                    <td class='py-2 px-4 text-right'>${da.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="col">Vu</th>
                    <td class='py-2 px-4 text-right'>${zs.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
            `,Pl=`
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="6">5.2. Punta</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">Peso Propio</th>
                    <td class='py-2 px-4 text-right'>${Ve.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo inicial</th>
                    <th class='py-2 px-4' scope="col">q1</th>
                    <td class='py-2 px-4 text-right'>${Ya.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo final</th>
                    <th class='py-2 px-4' scope="col">q2</th>
                    <td class='py-2 px-4 text-right'>${Re.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Longitud</th>
                    <th class='py-2 px-4' scope="col">L</th>
                    <td class='py-2 px-4 text-right'>${s}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia inicial</th>
                    <th class='py-2 px-4' scope="col">X1</th>
                    <td class='py-2 px-4 text-right'>${rt}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia final</th>
                    <th class='py-2 px-4' scope="col">X2</th>
                    <td class='py-2 px-4 text-right'>${ts}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Carga</th>
                    <th class='py-2 px-4' scope="col">W</th>
                    <td class='py-2 px-4 text-right'>${as.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia de corte</th>
                    <th class='py-2 px-4' scope="col">a</th>
                    <td class='py-2 px-4 text-right'>${Ne}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
               <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class='py-2 px-4' scope="col" colspan="2"></th>
                    <th class='py-2 px-4' scope="col">1</th>
                    <th class='py-2 px-4' scope="col">2</th>
                    <th class='py-2 px-4 text-right' scope="col">TOTAL</th>
                    <th class='py-2 px-4' scope="col">PP</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">V(X2)</th>
                    <th class='py-2 px-4' scope="col">${no.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${ho.toFixed(2)}</th>
                    <th class='py-2 px-4 text-right' scope="col">${yo.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${go.toFixed(2)}</th>
                </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">M(X1)</th>
                    <th class='py-2 px-4' scope="col">${xo.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${io.toFixed(2)}</th>
                    <th class='py-2 px-4 text-right' scope="col">${bo.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${uo.toFixed(2)}</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="col">Mu</th>
                    <td class='py-2 px-4 text-right'> ${Ks.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="col">Vu</th>
                    <td class='py-2 px-4 text-right'>${ss.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
            `;var tt=0,na=(Ce*100-10)/100,at=jt,ha=Yt,mt=ze-zt,Xt=ts*mt/t,es=mt-Xt,mo=zt*(ha-t),vo=es*ha+t*ha/2-mt*t/2,ko=mo+vo,Fo=Math.abs(ja*(ha-t)),$o=Math.abs(pa*(ha-t)),Eo=zt*(na-t),Mo=es*na+Xt*na/2-mt*t/2,Ao=Eo+Mo,Io=Math.abs(ja*(na-t)),To=Math.abs(pa*(na-t)),Lo=zt*(tt*tt+t*t-2*t*tt)/2,Bo=es*tt*tt/2+t*tt*tt/3-mt*t*tt/2+mt*t*t/6,fo=-(Lo+Bo),wo=ja*(tt*tt+t*t-2*t*tt)/2,Co=pa*(tt*tt+t*t-2*t*tt)/2,Do=zt*(at*at+t*t-2*t*at)/2,Oo=es*at*at/2+Xt*at*at/3-mt*t*at/2+mt*t*t/6,Po=-(Do+Oo),So=ja*(at*at+t*t-2*t*at)/2,Vo=pa*(at*at+t*t-2*t*at)/2,Ns=1.7*parseFloat(fo)+1.4*parseFloat(wo)+1.7*parseFloat(Co),Kt=1.7*Ao+1.4*Io+1.7*To;let Sl=`
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="6">5.3. Talon</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Peso Propio</th>
                    <th class='py-2 px-4' scope="col">--</th>
                    <td class='py-2 px-4 text-right'>${ja.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">P. Terreno</th>
                    <th class='py-2 px-4' scope="col">--</th>
                    <td class='py-2 px-4 text-right'>${pa.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo inicial</th>
                    <th class='py-2 px-4' scope="col">q1</th>
                    <td class='py-2 px-4 text-right'>${zt.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo final</th>
                    <th class='py-2 px-4' scope="col">q2</th>
                    <td class='py-2 px-4 text-right'>${ze.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Longitud</th>
                    <th class='py-2 px-4' scope="col">L</th>
                    <td class='py-2 px-4 text-right'>${t.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia inicial</th>
                    <th class='py-2 px-4' scope="col">X1</th>
                    <td class='py-2 px-4 text-right'>${tt.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia final</th>
                    <th class='py-2 px-4' scope="col">X2</th>
                    <td class='py-2 px-4 text-right'>${na}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">X3</th>
                    <td class='py-2 px-4 text-right'>${at.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">X4</th>
                    <td class='py-2 px-4 text-right'>${ha.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Carga</th>
                    <th class='py-2 px-4' scope="col">w</th>
                    <td class='py-2 px-4 text-right'>${mt.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia de corte</th>
                    <th class='py-2 px-4' scope="col">a</th>
                    <td class='py-2 px-4 text-right'>${Xt.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">b</th>
                    <td class='py-2 px-4 text-right'>${es.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class='py-2 px-4' scope="col"></th>
                    <th class='py-2 px-4' scope="col">1</th>
                    <th class='py-2 px-4' scope="col">2</th>
                    <th class='py-2 px-4' scope="col">TOTAL</th>
                    <th class='py-2 px-4 text-right' scope="col">P.P</th>
                    <th class='py-2 px-4' scope="col">P.T</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="row" >V(X4)</th>
                    <td class='py-2 px-4 text-center'>${mo.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${vo.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${ko.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${Fo.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${$o.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="row" >V(X2)</th>
                    <td class='py-2 px-4 text-center'>${Eo.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${Mo.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${Ao.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${Io.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${To.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="row" >M(X1)</th>
                    <td class='py-2 px-4 text-center'>${Lo.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${Bo.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${fo.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${wo.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${Co.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="row" >M(X3)</th>
                    <td class='py-2 px-4 text-center'>${Do.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${Oo.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${Po.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${So.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${Vo.toFixed(2)}</td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="row">Mu</th>
                    <td class='py-2 px-4 text-right '>${Ns.toFixed(2)}</td>
                    <th class='py-2 px-4 text-center' scope="row">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="row">Vu</th>
                    <td class='py-2 px-4 text-right '>${Kt.toFixed(2)}</td>
                    <th class='py-2 px-4 text-center' scope="row">Tn</th>
                </tr>
            `;var qe=Ss*r,Xe=(Ke-Ss)*r/2,Ro=qe+Xe,zo=qe*r/2,Ko=Xe*2*r/3,No=zo+Ko,qs=1.7*No,cs=1.7*Ro;let Vl=`
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="6">5.4. Key</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo inicial</th>
                    <th class='py-2 px-4' scope="col">q1</th>
                    <td class='py-2 px-4 text-right'>${Ss.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo final</th>
                    <th class='py-2 px-4' scope="col">q2</th>
                    <td class='py-2 px-4 text-right'>${Ke.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Longitud</th>
                    <th class='py-2 px-4' scope="col">L</th>
                    <td class='py-2 px-4 text-right'>${r.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-500 text-white dark:bg-gray-500 dark:text-white">
                    <th class='py-2 px-4' scope="col" colspan="3"></th>
                    <th class='py-2 px-4' scope="col">1</th>
                    <th class='py-2 px-4 text-right' scope="col">2</th>
                    <th class='py-2 px-4' scope="col">TOTAL</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">V</th>
                    <td class='py-2 px-4 text-center'>${qe.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${Xe.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${Ro.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">M</th>
                    <td class='py-2 px-4 text-center'>${zo.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${Ko.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${No.toFixed(2)}</td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="col">Mu</th>
                    <td class='py-2 px-4 text-right'>${qs.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="col">Vu</th>
                    <td class='py-2 px-4 text-right'>${cs.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
            `,Rl=Ol+Pl+Sl+Vl,zl=document.getElementById("tablapp");zl.innerHTML=Rl;var R=100,qo=St*100,Nt=qo-4,He=da*1e5,ht=.002,yt=.0018,os=ht*R*Nt,Ue=yt*R*Nt,Xo=Nt-Math.pow(Math.pow(Nt,2)-2*He/(.85*.9*v*R),.5),_e=He/(.9*A*(Nt-Xo/2)),Kl=_e>Ue?"OK":"NOT",Ho=Math.max(_e,Ue);let Nl=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="col">Mu</th>
                    <td class='py-2 px-4 text-right'>${da.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="col">Vu</th>
                    <td class='py-2 px-4 text-right'>${zs.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th class='py-2 px-4' scope="col">Fy</th>
                    <td class='py-2 px-4 text-right'>${A}</td>
                    <th class='py-2 px-4' scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th class='py-2 px-4' scope="col">f'c</th>
                    <td class='py-2 px-4 text-right'>${v}</td>
                    <th class='py-2 px-4' scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Ancho a analizar</th>
                    <th class='py-2 px-4' scope="col">b</th>
                    <td class='py-2 px-4 text-right'>${R.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Espesor de la corona</th>
                    <th class='py-2 px-4' scope="col">t</th>
                    <td class='py-2 px-4 text-right'>${qo.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Peralte efectivo</th>
                    <th class='py-2 px-4' scope="col">d</th>
                    <td class='py-2 px-4 text-right'>${Nt.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="col">Mu</th>
                    <td class='py-2 px-4 text-right'>${He.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">kg-cm</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="6">6.1.1. Diseño por Flexion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="text-center text-lg" scope="col"  colspan="6">Cuantias</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Cuantia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cuantia minima</th>
                    <th class='py-2 px-4' scope="col">rMIN</th>
                    <td class='py-2 px-4 text-right'>${ht.toFixed(4)}</td>
                    <th class='py-2 px-4' scope="col">cm<sup>2</sup></th>

                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cuantia minima</th>
                    <th class='py-2 px-4' scope="col">rMIN</th>
                    <td class='py-2 px-4 text-right'>${yt.toFixed(4)}</td>
                    <th class='py-2 px-4' scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="6"></th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Areas</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cuantia minima</th>
                    <th class='py-2 px-4' scope="col">rMIN</th>
                    <td class='py-2 px-4 text-right'>${os.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cuantia minima</th>
                    <th class='py-2 px-4' scope="col">rMIN</th>
                    <td class='py-2 px-4 text-right'>${Ue.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm<sup>2</sup></th>
                </tr>

                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="6">6.1.2. Calculo del area del refuerzo(metodo cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Altura bloque compresion</th>
                    <th class='py-2 px-4' scope="col">a</th>
                    <td class='py-2 px-4 text-right'>${Xo.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Acero calculado</th>
                    <th class='py-2 px-4' scope="col">As</th>
                    <td class='py-2 px-4 text-right'>${_e.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="4"></th>
                    <th class='py-2 px-4' scope="col" colspan="3" class="">verificacion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Acero minimo</th>
                    <th class='py-2 px-4' scope="col">Asmin</th>
                    <td class='py-2 px-4 text-right'>${Kl}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Acero a usar</th>
                    <th class='py-2 px-4' scope="col">As</th>
                    <td class='py-2 px-4 text-right'>${Ho.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm<sup>2</sup></th>
                </tr>

            `,ql=document.getElementById("tablatk");ql.innerHTML=Nl;var Ge=Math.round(F*k*100/Ho),Xl=Ge<20?Ge:20,Hl=F*k;let Ul=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3">Diametro del acero</th>
                    <th scope="col" colspan="0">Ø</th>
                    <td>${C}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3"># barras</th>
                    <th scope="col" colspan="0">#</th>
                    <td>${k}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3">Acero a usar</th>
                    <th scope="col" colspan="0">As</th>
                    <td>${Hl.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3">Separacion de acero longitudinal</th>
                    <th scope="col" colspan="0">@</th>
                    <td contenteditable="true">${Ge.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan=""></th>
                    <td>${k}</td>
                    <td>Ø</td>
                    <td>${C}</td>
                    <td>@</td>
                    <td contenteditable="true">${Xl.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="6"></th>
                </tr>
            `,_l=document.getElementById("tablapantallaAcero");_l.innerHTML=Ul;var Uo=os*X,We=Math.round(M*100/Uo),ya=1,_o=We<25?We:25;let Gl=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6" class="text-center">Cara del terreno</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${os.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${X.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${Uo.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">Ø</th>
                    <td>${B}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Medida del acero</th>
                    <th scope="col">As</th>
                    <td>${M.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${We.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th></th>
                    <td>${ya}</td>
                    <td>Ø</td>
                    <td>${B}</td>
                    <td>@</td>
                    <td contenteditable="true">${_o.toFixed(2)}</td>
                </tr>
            `,Wl=document.getElementById("tablaDAT");Wl.innerHTML=Gl;var Go=1-X,Wo=os*Go,Ze=Math.round(E*100/Wo),Zl=1,Yl=Ze<25?Ze:25;let jl=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${os.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${Go.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${Wo.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">Ø</th>
                    <td>${_}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero</th>
                    <th scope="col">As</th>
                    <td>${E.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${Ze.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="0"></th>
                    <td>${Zl}</td>
                    <td>Ø</td>
                    <td>${_}</td>
                    <td>@</td>
                    <td contenteditable="true">${Yl.toFixed(2)}</td>
                </tr>
            `,Ql=document.getElementById("tablacaidaLibre");Ql.innerHTML=jl;var Zo=Nt,Yo=zs,Jl=Qa,jo=.53*Zo*R*Math.pow(v,.5)/1e3,Qo=jo*.85,tp=Qo>Yo?"OK":"ESTA MAL";let ap=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6" class="text-center" >Calcular el cortante a una distancia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${Zo.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${Yo.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">Corte A</th>
                    <td>${Jl.toFixed(2)}</td>
                    <th>m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="6"></th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6" class="text-center">Aporte del concreto</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante del concreto</th>
                    <th scope="col">Vc</th>
                    <td>${jo.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">@Vc</th>
                    <td contenteditable="true">${Qo.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="6"></th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6" class="text-center">Verificamos</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">¿Vc>Vu?</th>
                    <td>${tp}</td>
                    <th></th>
                </tr>
            `,sp=document.getElementById("tabledcorte");sp.innerHTML=ap;var Ye=lo*1.7+po,Jo=100,je=(l*G/a+o)*100,Xs=je-4,Qe=Ye*1e5,Hs=.002*je*100,ep=da/2,cp=Ye<=da/2?"OK":"AUMENTA L";let op=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">Datos</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">l</th>
                    <td>${W}</td>
                    <th>m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${Ye.toFixed(2)}</td>
                    <th>tm-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${A}</td>
                    <th>Kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${v}</td>
                    <th>Kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${Jo.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${je.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${Xs.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${Qe.toFixed(2)}</td>
                    <th>kg-cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero minimo</th>
                    <th scope="col">AsMin</th>
                    <td>${Hs.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">¿ES MENOR AL MOMENTO?</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">Mu/2</th>
                    <td>${ep.toFixed(2)}</td>
                    <td>${cp}</td>
                </tr>
            `,rp=document.getElementById("tablePrecorte");rp.innerHTML=op;var tr=Xs-Math.pow(Math.pow(Xs,2)-2*Qe/(.85*.9*v*Jo),.5),Je=Qe/(.9*A*(Xs-tr/2)),lp=Je>Hs?"OK":"NO",ar=Math.max(Je,Hs),tc=k>1?1:0,sr=F*tc,ac=Math.round(sr*100/ar),pp=ac<20?ac:20;let dp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col" colspan="6">Calculo del area del refuerzo (Metodo Cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura de bloque comprimido</th>
                    <th scope="col">a</th>
                    <td>${tr.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${Je.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Verificacion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero minimo</th>
                    <th scope="col">Asmin</th>
                    <td>${lp}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As</th>
                    <td>${ar.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col" colspan="6">Distribucion del acero longitudinal principal-recorte</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col" >ø</th>
                    <td>${C}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${tc}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As</th>
                    <td>${sr.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${ac.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${tc}</td>
                    <td>Ø</td>
                    <td>${C}</td>
                    <td>@</td>
                    <td contenteditable="true">${pp.toFixed(2)}</td>
                </tr>
            `,np=document.getElementById("tableDflexion");np.innerHTML=dp;var er=Y*V,sc=Math.round(er*100/Hs),hp=sc<20?sc:20;let yp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero a usar</th>
                    <th scope="col" >Ø</th>
                    <td>${Z}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${V}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As</th>
                    <td>${er.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${sc.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${V}</td>
                    <td>Ø</td>
                    <td>${Z}</td>
                    <td>@</td>
                    <td contenteditable="true">${hp.toFixed(2)}</td>
                </tr>
            `,gp=document.getElementById("tablaALS");gp.innerHTML=yp;var cr=fe*100,At=cr-10,ec=Ks*1e5,qt=ht*R*At,rs=yt*R*At,or=At-Math.pow(Math.pow(At,2)-2*ec/(.85*.9*v*R),.5),cc=ec/(.9*A*(At-or/2)),xp=cc>qt?"OK":"NOT",rr=Math.max(cc,qt);let ip=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${Ks.toFixed(2)}</td>
                    <th scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${ss.toFixed(2)}</td>
                    <th scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${A}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${v}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${R.toFixed(2)}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${cr.toFixed(2)}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${At.toFixed(2)}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${ec.toFixed(2)}</td>
                    <th scope="col">kg-cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th  scope="col"  colspan="6">6.2.1. Diseño por Flexion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="text-center" scope="col"  colspan="6">Cuantias</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Cuantia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${ht.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${yt.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Areas</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${qt.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rs.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th  scope="col"  colspan="6">6.2.2. Calculo del area del refuerzo(metodo cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura bloque compresion</th>
                    <th scope="col">a</th>
                    <td>${or.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero calculado</th>
                    <th scope="col">As</th>
                    <td>${cc.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Verificacion</th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero minimo</th>
                    <th scope="col">Asmin</th>
                    <td>${xp}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${rr.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
            `,bp=document.getElementById("tabladesingcaPunta");bp.innerHTML=ip;var lr=D*U,oc=Math.round(lr*100/rr),up=oc<20?oc:20;let mp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col">Ø</th>
                    <td>${H}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># barras</th>
                    <th scope="col">#</th>
                    <td>${U}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${lr.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero longitudinal</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${oc}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${U}</td>
                    <td>Ø</td>
                    <td>${H}</td>
                    <td>@</td>
                    <td contenteditable="true">${up}</td>
                </tr>
            `,vp=document.getElementById("tablaDALP");vp.innerHTML=mp;var pr=rs*st,rc=Math.round(b*100/pr),kp=rc<25?rc:25;let Fp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cara del terreno</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${rs.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${st.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${pr.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col">Ø</th>
                    <td>${B}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Medida del acero</th>
                    <th scope="col">As</th>
                    <td>${b.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${rc}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${ya}</td>
                    <td>Ø</td>
                    <td>${j}</td>
                    <td>@</td>
                    <td contenteditable="true">${kp.toFixed(2)}</td>
                </tr>
             `,$p=document.getElementById("tabladatpun");$p.innerHTML=Fp;var dr=1-st,nr=rs*dr,lc=Math.round(Q*100/nr),Ep=lc<25?lc:25;let Mp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cara libre</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${rs.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${dr.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${nr.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">ø</th>
                    <td>${pt}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero</th>
                    <th scope="col">As</th>
                    <td>${Q.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${lc}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${ya}</td>
                    <td>Ø</td>
                    <td>${pt}</td>
                    <td>@</td>
                    <td contenteditable="true">${Ep}</td>
                </tr>
            `,Ap=document.getElementById("tablaClibre");Ap.innerHTML=Mp;var hr=.53*At*R*Math.pow(v,.5)/1e3,yr=hr*.85,Ip=yr>ss?"OK":"NOT";let Tp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">Calcular el cortante a una distancia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${At.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${ss.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Aporte del concreto</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante del concreto</th>
                    <th scope="col">Vc</th>
                    <td>${hr.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">@Vc</th>
                    <td contenteditable="true">${yr.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Verificamos</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">¿Vc>Vu?</th>
                    <td>${Ip}</td>
                    <th></th>
                </tr>
            `,Lp=document.getElementById("tabledcortepun");Lp.innerHTML=Tp;var gr=Ea*Lt,pc=Math.round(gr*100/qt),Bp=pc<20?pc:20;let fp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col">Ø</th>
                    <td>${Ut}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${Lt}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${gr.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">separacion</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${pc}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${Lt}</td>
                    <td>Ø</td>
                    <td>${Ut}</td>
                    <td>@</td>
                    <td contenteditable="true">${Bp}</td>
                </tr>
            `,wp=document.getElementById("tablaALSpun");wp.innerHTML=fp;var Us=Ce*100,gt=Us-10,ga=Ns*1e5,xr=ht*R*gt,ir=yt*R*gt,Xt=gt-Math.pow(Math.pow(gt,2)-2*ga/(.85*.9*v*R),.5),dc=ga/(.9*A*(gt-Xt/2)),Cp=dc>ir?"OK":"NOT",br=Math.max(xr,dc);let Dp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${Ns.toFixed(2)}</td>
                    <th scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${Kt.toFixed(2)}</td>
                    <th scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${A}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${v}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${R}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${Us}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${gt}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${ga.toFixed(2)}</td>
                    <th scope="col">kg-cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th  scope="col"  colspan="6">6.3.1. Diseño por Flexion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="text-center" scope="col"  colspan="6">Cuantias</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Cuantia</th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${ht.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${yt.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Areas</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${xr.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${ir.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th  scope="col"  colspan="6">6.3.2. Calculo del area del refuerzo(metodo cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura bloque compresion</th>
                    <th scope="col">a</th>
                    <td>${Xt.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero calculado</th>
                    <th scope="col">As</th>
                    <td>${dc.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3" class="text-center">verificacion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero minimo</th>
                    <th scope="col">Asmin</th>
                    <td>${Cp}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${br.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>

                </tr>
            `,Op=document.getElementById("tabladesingcatalon");Op.innerHTML=Dp;var nc=Ma*kt,hc=Math.round(nc*100/br),Pp=hc<20?hc:20;let Sp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col" >Ø</th>
                    <td>${vt}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${kt}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${nc.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero longitudinal</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${hc.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${kt}</td>
                    <td>Ø</td>
                    <td>${vt}</td>
                    <td>@</td>
                    <td contenteditable="true">${Pp.toFixed(2)}</td>
                </tr>
            `,Vp=document.getElementById("tablaALPtal");Vp.innerHTML=Sp;var _s=qt*Bt,yc=Math.round(Wt*100/_s),Rp=yc<25?yc:25;let zp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">Cara del terreno</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${qt.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${Bt.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${_s.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col">ø</th>
                    <td>${Gt}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Medida del acero</th>
                    <th scope="col">As</th>
                    <td>${Wt.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${yc}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${ya}</td>
                    <td>Ø</td>
                    <td>${Gt}</td>
                    <td>@</td>
                    <td contenteditable="true">${Rp.toFixed(2)}</td>
                </tr>
            `,Kp=document.getElementById("tablaDATtal");Kp.innerHTML=zp;var gc=Math.round(ft*100/_s),Np=gc<25?gc:25;let qp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${qt.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${Bt.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${_s.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">ø</th>
                    <td>${Zt}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">As</th>
                    <td>${ft.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${gc}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${ya}</td>
                    <td>Ø</td>
                    <td>${Zt}</td>
                    <td>@</td>
                    <td contenteditable="true">${Np.toFixed(2)}</td>
                </tr>
            `,Xp=document.getElementById("tablaCLtal");Xp.innerHTML=qp;var ur=.53*gt*R*Math.pow(v,.5)/1e3,xc=ur*.85,Hp=xc>Kt?"OK":"NO";let Up=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">Calcular el cortante a una distancia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${gt.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${Kt.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Aporte del concreto</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante del concreto</th>
                    <th scope="col">Vc</th>
                    <td>${ur.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">@Vc</th>
                    <td contenteditable="true">${xc.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Verificamos</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">¿Vc>Vu?</th>
                    <td>${Hp}</td>
                    <th></th>
                </tr>
            `,_p=document.getElementById("tablaDCtal");_p.innerHTML=Up;var mr=1.7*ko+1.4*Fo+1.7*$o,Gp=mr>xc?"AUMENTAR LONGITUD":"OK",Wp=Kt*1e3/(.85*.53*100*Math.pow(v,.5))-gt<0?0:Kt*1e3/(.85*.53*100*Math.pow(v,.5))-gt;let Zp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Longitud</th>
                    <th scope="col">L</th>
                    <td>${Yt}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${mr.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td colspan="4"></td>
                    <td colspan="2">${Gp}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura del pedestal</th>
                    <th scope="col">h'</th>
                    <td>${Wp.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
            `,Yp=document.getElementById("tablaDCtalLP");Yp.innerHTML=Zp;var xa=Us-4,jp=1.7*Po+1.4*So+1.7*Vo,Qp=ht*R*xa,ic=yt*R*xa,vr=xa-Math.pow(Math.pow(xa,2)-2*ga/(.85*.9*v*R),.5),bc=ga/(.9*A*(xa-vr/2)),Jp=bc>ic?"OK":"NOT",kr=Math.max(bc,ic),uc=kt>1?1:0,Fr=nc*uc,mc=Fr*100/kr,td=mc<20?mc:20;let ad=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Longitud</th>
                    <th scope="col">L</th>
                    <td>${jt}</td>
                    <th scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${jp.toFixed(2)}</td>
                    <th scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${A}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${v}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${R}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${Us}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${xa}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${ga.toFixed(2)}</td>
                    <th scope="col">kg-cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col"  colspan="6">6.3.9. Diseño por Flexion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="text-center" scope="col"  colspan="6">Cuantias</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Cuantia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${ht.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${yt.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Areas</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${Qp.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${ic.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col"    colspan="6">6.3.10. Calculo del area del refuerzo(metodo cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura bloque compresion</th>
                    <th scope="col">a</th>
                    <td>${vr.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero calculado</th>
                    <th scope="col">As</th>
                    <td>${bc.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3" class="text-center">verificacion</th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero minimo</th>
                    <th scope="col">Asmin</th>
                    <td>${Jp}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${kr.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col"  colspan="6"  >6.3.11 Distribucion del acero longitudinal</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col" >Ø</th>
                    <td>${vt}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${uc}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero a usar</th>
                    <th scope="col">As</th>
                    <td>${Fr.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero longitudinal</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${mc.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${uc}</td>
                    <td>Ø</td>
                    <td>${vt}</td>
                    <td>@</td>
                    <td contenteditable="true">${td.toFixed(2)}</td>
                </tr>
            `,sd=document.getElementById("tablaDCtaltRR");sd.innerHTML=ad;var $r=Gc*100,It=$r-10,vc=qs*1e5,ia=ht*R*It,Er=yt*R*It,Mr=It-Math.pow(Math.pow(It,2)-2*vc/(.85*.9*v*R),.5),kc=vc/(.9*A*(It-Mr/2)),ed=kc>Er?"OK":"NOT",Ar=Math.max(kc,ia);let cd=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Longitud</th>
                    <th scope="col">L</th>
                    <td>${qs.toFixed(2)}</td>
                    <th scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${cs.toFixed(2)}</td>
                    <th scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${A}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${v}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${R}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${$r}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${It}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${vc.toFixed(2)}</td>
                    <th scope="col">kg-cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col"  colspan="6"  >6.4.1. Diseño por Flexion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="text-center" scope="col"  colspan="6">Cuantias</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Cuantia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${ht.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${yt.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Areas</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${ia.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${Er.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>



                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col"  colspan="6" > 6.4.2. Calculo del area del refuerzo(metodo cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura bloque compresion</th>
                    <th scope="col">a</th>
                    <td>${Mr.toFixed(2)}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero calculado</th>
                    <th scope="col">As</th>
                    <td>${kc.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3" class="text-center">verificacion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero minimo</th>
                    <th scope="col">Asmin</th>
                    <td>${ed}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${Ar.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>

            `,od=document.getElementById("tablaKey");od.innerHTML=cd;var Ir=Qt*ct,Fc=Math.round(Ir*100/Ar),rd=Fc<20?Fc:20;let ld=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">Ø</th>
                    <td>${Jt}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${ct}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As</th>
                    <td>${Ir.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${Fc.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${ct}</td>
                    <td>Ø</td>
                    <td>${Jt}</td>
                    <td>@</td>
                    <td contenteditable="true">${rd.toFixed(2)}</td>
                </tr>
            `,pd=document.getElementById("tablaDALKey");pd.innerHTML=ld;var Tr=ia*Ct,$c=Math.round(ta*100/Tr),dd=(ct=0)?0:1,nd=(ct=0)?0:$c<25?$c:25;let hd=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cara del terreno</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${ia.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${Ct.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${Tr.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">Ø</th>
                    <td>${wt}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero</th>
                    <th scope="col">As</th>
                    <td>${ta}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${$c}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${dd}</td>
                    <td>Ø</td>
                    <td>${wt}</td>
                    <td>@</td>
                    <td contenteditable="true">${nd.toFixed(2)}</td>
                </tr>
            `,yd=document.getElementById("tablaDATKey");yd.innerHTML=hd;var Lr=1-Ct,Br=ia*Lr,Ec=Math.round(Dt*100/Br),gd=(ct=0)?0:1,xd=(ct=0)?0:Ec<25?Ec:25;let id=`
              <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${ia.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${Lr.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${Br.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">Ø</th>
                    <td>${aa}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${Dt}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${Ec}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${gd}</td>
                    <td>Ø</td>
                    <td>${aa}</td>
                    <td>@</td>
                    <td contenteditable="true">${xd.toFixed(2)}</td>
                </tr>
            `,bd=document.getElementById("tablaCLKey");bd.innerHTML=id;var fr=.53*It*R*Math.pow(v,.5)/1e3,wr=fr*.85,ud=wr>cs?"OK":"ESTA MAL";let md=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="2">Calcular el cortante a una distancia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${It.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${cs.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Aporte del concreto</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante del concreto</th>
                    <th scope="col">Vc</th>
                    <td>${fr.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">@Vc</th>
                    <td contenteditable="true">${wr.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Verificamos</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">¿Vc>Vu?</th>
                    <td>${ud}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="text-center" scope="col" colspan="6"></th>
                </tr>
            `,vd=document.getElementById("tablaDCKey");vd.innerHTML=md,Pr(p,z,t,i,a,l,o,s,T,M,ya,B,_o),zr(a,t,i,o,l,s,r,Na,Se,la,Re,Ya,ze,zt,Ke,Ss,pa),Kr(a,t,i,o,l,s,r,da,Ks,Ns,qs),Nr(a,t,i,o,l,s,r,zs,ss,Kt,cs),Rr()}function Pr(a,g,f,p,u,x,T,e,d,O,P,w,n){let h="light",m,t,s,i,o;const l=window.matchMedia("(prefers-color-scheme: dark)");function S(I){h=I.matches?"dark":"light",m&&y()}l.addListener(S),S(l);const r={top:20,right:20,bottom:30,left:40},L=600-r.left-r.right,N=600-r.top-r.bottom;function q(){d3.select("#graficoFinal svg").remove(),m=d3.select("#graficoFinal").append("svg").attr("width",L+r.left+r.right).attr("height",N+r.top+r.bottom).append("g").attr("transform",`translate(${r.left},${r.top})`),i=d3.scaleLinear().range([0,L]),o=d3.scaleLinear().range([N,0]),t=m.append("g").attr("transform",`translate(0,${N})`).attr("class","x-axis"),s=m.append("g").attr("class","y-axis"),m.append("path").attr("fill","none").attr("stroke-width",1.5),y()}function y(){const I=Sr(a,g,f,p,u,x,T,e,d),v=I.flat();i.domain([0,d3.max(v,b=>b.x)*1.8]),o.domain([0,d3.max(v,b=>b.y)*1.1]),t.call(d3.axisBottom(i)),s.call(d3.axisLeft(o)),m.selectAll(".graph-line").remove(),m.selectAll(".acero-circle").remove(),I.forEach((b,st)=>{const pt=d3.line().x(Q=>i(Q.x)).y(Q=>o(Q.y));m.append("path").datum(b).attr("class","graph-line").attr("fill","none").attr("stroke","steelblue").attr("stroke-width",1.5).attr("d",pt),m.selectAll(`.data-point-${st}`).data(b).enter().append("circle").attr("class",`data-point-${st}`).attr("r",3).attr("cx",Q=>i(Q.x)).attr("cy",Q=>o(Q.y)).attr("fill","steelblue")});const A=O,F=I[5],C=(g*100-15)/n,k=n/10.5;for(let b=0;b<C;b++)m.append("circle").attr("class","acero-circle").attr("cx",i(12.5+b*k)).attr("cy",o(10+1.5)).attr("r",A).attr("fill","purple").attr("stroke","purple").attr("stroke-width",1);const M=(g*100-15)/n,B=n/10.5;for(let b=0;b<M;b++)m.append("circle").attr("class","acero-circle").attr("cx",i(12.5+b*B)).attr("cy",o(F[4].puntov5y+.5)).attr("r",A).attr("fill","green").attr("stroke","green").attr("stroke-width",1);const E=(F[1].puntoh3y-F[2].puntoh1y)/(n/10.5),_=n/10.5;for(let b=0;b<E;b++)m.append("circle").attr("class","acero-circle").attr("cx",i(F[0].puntoh3x+.5)).attr("cy",o(2+b*_)).attr("r",A).attr("fill","blue").attr("stroke","blue").attr("stroke-width",1);const G=(parseFloat(F[7].puntoh9y)-parseFloat(F[4].puntov5y))/(n/10.5),Z=n/10.5,Y=F[0].puntoh3x+.5,V=F[5].puntoh6x;for(let b=0;b<G;b++)m.append("circle").attr("class","acero-circle").attr("cx",i(Y+(V-Y)*(b/G))).attr("cy",o(.5+F[1].puntoh3y+b*Z)).attr("r",A).attr("fill","yellow").attr("stroke","yellow").attr("stroke-width",1);const D=(F[7].puntoh9y-F[6].puntoh6y)/(n/10.5),U=n/10.5;for(let b=0;b<D;b++)m.append("circle").attr("class","acero-circle").attr("cx",i(F[5].puntoh6x)).attr("cy",o(F[6].puntoh6y+.5+b*U)).attr("r",A).attr("fill","red").attr("stroke","red").attr("stroke-width",1);const j=h==="dark"?"white":"#1b1e23";m.style("color",j),t.style("color",j),s.style("color",j)}q()}function Sr(a,g,f,p,u,x,T,e,d,O,P,w,n){var h=(x+T)*10,m=10,t=10+e*10,s=d=="si"?10+e*10:10,i=d=="si"?10+e*10+h:10+h,o=d=="si"?10+e*10+h:10,l=10+g*10,S=10+g*10,r=10+e*10+h,L=10+e*10+h,N=10+e*10+h-T*10,q=10+e*10,y=10,I=10,v=10,A=10,F=d=="si"?10-a*10:10,C=d=="si"?10-a*10:10,k=(d="si",10),M=10,B=10+p*10,X=10+p*10,E=10+p*10+u*10,_=10+p*10+u*10,W=10+p*10,G=10+p*10,Z=10,Y=[{x:m,y:v},{x:t,y:A},{x:s,y:F},{x:i,y:C},{x:o,y:k},{x:l,y:M},{x:S,y:B},{x:r,y:X},{x:L,y:E},{x:N,y:_},{x:q,y:W},{x:y,y:G},{x:I,y:Z}],V=12,H=12,D=10+g*10-2,U=10+g*10-2,j=13,b=13,st=10+g*10-3,pt=10+g*10-3,Q=13,Ut=11,Ea=11,Lt=13,_t=10+p*10-2,vt=10+p*10-1,Ma=10+p*10-1,kt=10+p*10-2,Gt=[{x:V,y:Q},{x:H,y:Ut},{x:D,y:Ea},{x:U,y:Lt}],Wt=[{x:j,y:_t},{x:b,y:vt},{x:st,y:Ma},{x:pt,y:kt}],Bt=(d=="si",10+e*10+1.5),Zt=(d=="si",10+e*10+1),ft=(d=="si",10+e*10+1),Yt=10+e*10+.5+x*10,jt=10+e*10+.5+.5+x*10,Qt=d=="si"?10+e*10+h-1:10+e*10+h-1.5,Jt=(d=="si",10+e*10+h-.5),ct=(d=="si",10+e*10+h-.5),ta=d=="si"?10+e*10+h-1:10+e*10+h-10-1.5,wt=d=="si"?10-a*10+2.5:1+2.5,Ct=d=="si"?10-a*10+2.5:1+2.5,Dt=(d=="si",10+p*10-.5),aa=10+p*10+u*10-2.5,Aa=10+p*10+u*10-2.5,sa=d=="si"?10-a*10+1.5:10+1.5,Ia=d=="si"?10-a*10+1.5:10+1.5,it=(d=="si",10+p*10+u*10-2),ot=(d=="si",10+p*10+u*10-2),Ft=[{x:Bt,y:wt},{x:Zt,y:Ct},{x:ft,y:Dt},{x:Yt,y:aa},{x:jt,y:Aa}],$t=[{x:Qt,y:sa},{x:Jt,y:Ia},{x:ct,y:it},{x:ta,y:ot}],Ta=[{puntoh3x:ft},{puntoh3y:Dt},{puntoh1y:wt},{puntov5x:j},{puntov5y:_t},{puntoh6x:Qt},{puntoh6y:sa},{puntoh9y:parseFloat(ot)}];return[Y,Gt,Wt,Ft,$t,Ta]}function Vr(a,g,f,p,u,x,T,e,d,O){var P=g+u,w=x+P+p;const n=0,h=x,m=x+(u+d),t=w,s=w,i=w-p,o=w-p,l=w-p-d,S=w-p-d-O,r=0,L=0,N=0,q=0,y=0,I=0,v=parseFloat(O),A=parseFloat(O),F=parseFloat(e),C=parseFloat(e),k=parseFloat(O),M=parseFloat(O),X=[{x:n,y:N},{x:h,y:q},{x:m,y},{x:t,y:I},{x:s,y:v},{x:i,y:A},{x:o,y:F},{x:l,y:C},{x:S,y:k},{x:r,y:M},{x:L,y:0}],E=w+2,_=x+E,W=x+E,G=x+(u+d)+E,Z=x+(u+d)+E,Y=E+x,V=E,H=T+E,D=T+E;return[X,[{x:_,y:V},{x:W,y:H},{x:G,y:D},{x:Z,y:E},{x:Y,y:E}]]}function Rr(){let a="light",g,f,p,u,x;const T=window.matchMedia("(prefers-color-scheme: dark)");function e(h){a=h.matches?"dark":"light",g&&refreshGraph()}T.addListener(e),e(T);const d={top:20,right:20,bottom:30,left:40},O=600-d.left-d.right,P=600-d.top-d.bottom;function w(){d3.select("#seccionmcontencion svg").remove(),g=d3.select("#seccionmcontencion").append("svg").attr("width",O+d.left+d.right).attr("height",P+d.top+d.bottom).append("g").attr("transform",`translate(${d.left},${d.top})`),u=d3.scaleLinear().range([0,O]),x=d3.scaleLinear().range([P,0]),f=g.append("g").attr("transform",`translate(0,${P})`).attr("class","x-axis"),p=g.append("g").attr("class","y-axis"),g.append("path").attr("fill","none").attr("stroke-width",1.5),n()}function n(){const h=parseFloat(document.getElementById("H").value),m=parseFloat(document.getElementById("b1graf").value),t=parseFloat(document.getElementById("hzgraf").value),s=parseFloat(document.getElementById("egraf").value),i=parseFloat(document.getElementById("epgraf").value),o=parseFloat(document.getElementById("b2graf").value),l=parseFloat(document.getElementById("dentelloncorr").value),S=parseFloat(document.getElementById("H").value),r=parseFloat(document.getElementById("egraf").value),L=parseFloat(document.getElementById("hzgraf").value),N=Vr(t,s,h,m,i,o,l,S,r,L),q=N.flat();u.domain([0,d3.max(q,I=>I.x)*1.5]),x.domain([0,d3.max(q,I=>I.y)*1.1]),f.call(d3.axisBottom(u)),p.call(d3.axisLeft(x)),g.selectAll(".graph-line").remove(),g.selectAll(".acero-circle").remove(),N.forEach((I,v)=>{const A=d3.line().x(F=>u(F.x)).y(F=>x(F.y));g.append("path").datum(I).attr("class","graph-line").attr("fill","none").attr("stroke","steelblue").attr("stroke-width",1.5).attr("d",A),g.selectAll(`.data-point-${v}`).data(I).enter().append("circle").attr("class",`data-point-${v}`).attr("r",3).attr("cx",F=>u(F.x)).attr("cy",F=>x(F.y)).attr("fill","steelblue")});const y=a==="dark"?"white":"#1b1e23";g.style("color",y),f.style("color",y),p.style("color",y)}w()}function Qs(a,g,f,p,u,x,T,e,d,O,P,w,n,h,m,t){var i=p+u,o=x+i+g;const l=o+2,S=x+l,r=x+l,L=x+(u+p)+l,N=x+(u+p)+l,q=l+x,y=l,I=T+l,v=T+l,C=[{x:S,y},{x:r,y:I},{x:L,y:v},{x:N,y:l},{x:q,y:l}],k=0,M=x,B=0,X=0,E=parseFloat(f),_=x+(u+p),W=o,G=parseFloat(f),Z=[{x:k,y:B},{x:M,y:X},{x:M,y:E},{x:k,y:E},{x:k,y:B}],Y=[{x:_,y:B},{x:W,y:B},{x:W,y:G},{x:_,y:G},{x:_,y:B}],V=o-g,H=o-g,D=o-g-p,U=o-g-p-f,j=parseFloat(f)+.5,b=parseFloat(a)+.5,st=parseFloat(a)+.5,pt=parseFloat(f)+.5;return[C,Z,Y,[{x:V,y:j},{x:H,y:b},{x:D,y:st},{x:U,y:pt},{x:V,y:j}]]}function zr(a,g,f,p,u,x,T,e,d,O,P,w,n,h,m,t,s){let i="light",o,l,S,r,L;const N=window.matchMedia("(prefers-color-scheme: dark)");function q(k){i=k.matches?"dark":"light",o&&C()}N.addListener(q),q(N);const y={top:20,right:20,bottom:30,left:40},I=600-y.left-y.right,v=600-y.top-y.bottom;function A(){d3.select("#seccionCargasActuantes svg").remove(),o=d3.select("#seccionCargasActuantes").append("svg").attr("width",I+y.left+y.right).attr("height",v+y.top+y.bottom).append("g").attr("transform",`translate(${y.left},${y.top})`),r=d3.scaleLinear().range([0,I]),L=d3.scaleLinear().range([v,0]),l=o.append("g").attr("transform",`translate(0,${v})`).attr("class","x-axis"),S=o.append("g").attr("class","y-axis"),C()}function F(k,M,B,X,E,_,W,G,Z,Y){console.log(k);const V=k[3],H=k[1],D=k[2],U=k[0];o.append("text").attr("x",r(V[0].x)+.5).attr("y",L(V[0].y)).attr("fill","red").attr("font-size","12px").text(`${M}`),o.append("text").attr("x",r(V[0].x)+.5).attr("y",L(V[1].y/2)).attr("fill","green").attr("font-size","12px").text(`${X}`),o.append("text").attr("x",r(V[0].x)+.5).attr("y",L(V[1].y)).attr("fill","yellow").attr("font-size","12px").text(`${B}`),o.append("text").attr("x",r(H[3].x)).attr("y",L(H[3].y)).attr("fill","orange").attr("font-size","11px").text(`${_}`),o.append("text").attr("x",r(H[2].x-.5)).attr("y",L(H[2].y)).attr("fill","purple").attr("font-size","11px").text(`${E}`),o.append("text").attr("x",r(D[3].x)).attr("y",L(D[3].y)).attr("fill","orange").attr("font-size","11px").text(`${W}`),o.append("text").attr("x",r(D[2].x-.5)).attr("y",L(D[2].y)).attr("fill","red").attr("font-size","11px").text(`${G}`),o.append("text").attr("x",r(D[2].x-.5)).attr("y",L(D[2].y-.5)).attr("fill","yellow").attr("font-size","11px").text(`${s}`),o.append("text").attr("x",r(U[2].x)).attr("y",L(U[2].y)).attr("fill","orange").attr("font-size","11px").text(`${Y}`),o.append("text").attr("x",r(U[3].x)).attr("y",L(U[3].y)).attr("fill","purple").attr("font-size","11px").text(`${Z}`)}function C(){const k=Qs(a,g,f,p,u,x,T);var M=parseFloat(d).toFixed(2),B=parseFloat(O).toFixed(2),X=parseFloat(e).toFixed(2),E=parseFloat(w).toFixed(2),_=parseFloat(P).toFixed(2),W=parseFloat(n).toFixed(2),G=parseFloat(h).toFixed(2);parseFloat(s).toFixed(2);var Z=parseFloat(m).toFixed(2),Y=parseFloat(t).toFixed(2);const V=k.flat();r.domain([0,d3.max(V,D=>D.x)*1.1]),L.domain([0,d3.max(V,D=>D.y)*1.1]),l.call(d3.axisBottom(r)),S.call(d3.axisLeft(L)),o.selectAll(".graph-line").remove(),o.selectAll(".acero-circle").remove(),k.forEach((D,U)=>{const j=d3.line().x(b=>r(b.x)).y(b=>L(b.y));o.append("path").datum(D).attr("class","graph-line").attr("fill","none").attr("stroke","steelblue").attr("stroke-width",1.5).attr("d",j),o.selectAll(`.data-point-${U}`).data(D).enter().append("circle").attr("class",`data-point-${U}`).attr("r",3).attr("cx",b=>r(b.x)).attr("cy",b=>L(b.y)).attr("fill","steelblue")});const H=i==="dark"?"white":"#1b1e23";o.style("color",H),l.style("color",H),S.style("color",H),F(k,M,B,X,E,_,W,G,Z,Y)}A()}function Kr(a,g,f,p,u,x,T,e,d,O,P){let w="light",n,h,m,t,s;const i=window.matchMedia("(prefers-color-scheme: dark)");function o(y){w=y.matches?"dark":"light",n&&q()}i.addListener(o),o(i);const l={top:20,right:20,bottom:30,left:40},S=600-l.left-l.right,r=600-l.top-l.bottom;function L(){d3.select("#DiagramaMomentosFlectores svg").remove(),n=d3.select("#DiagramaMomentosFlectores").append("svg").attr("width",S+l.left+l.right).attr("height",r+l.top+l.bottom).append("g").attr("transform",`translate(${l.left},${l.top})`),t=d3.scaleLinear().range([0,S]),s=d3.scaleLinear().range([r,0]),h=n.append("g").attr("transform",`translate(0,${r})`).attr("class","x-axis"),m=n.append("g").attr("class","y-axis"),q()}function N(y,I,v,A,F){console.log(y);const C=y[3],k=y[1],M=y[2],B=y[0];n.append("text").attr("x",t(C[0].x)+.5).attr("y",s(C[0].y)).attr("fill","red").attr("font-size","12px").text(`${I}`),n.append("text").attr("x",t(k[2].x-.5)).attr("y",s(k[2].y)).attr("fill","yellow").attr("font-size","11px").text(`${v}`),n.append("text").attr("x",t(M[3].x)).attr("y",s(M[3].y)).attr("fill","orange").attr("font-size","11px").text(`${A}`),n.append("text").attr("x",t(B[2].x)).attr("y",s(B[2].y)).attr("fill","orange").attr("font-size","11px").text(`${F}`)}function q(){const y=Qs(a,g,f,p,u,x,T);var I=parseFloat(e).toFixed(2),v=parseFloat(d).toFixed(2),A=parseFloat(O).toFixed(2),F=parseFloat(P).toFixed(2);const C=y.flat();t.domain([0,d3.max(C,M=>M.x)*1.1]),s.domain([0,d3.max(C,M=>M.y)*1.1]),h.call(d3.axisBottom(t)),m.call(d3.axisLeft(s)),n.selectAll(".graph-line").remove(),n.selectAll(".acero-circle").remove(),y.forEach((M,B)=>{const X=d3.line().x(E=>t(E.x)).y(E=>s(E.y));n.append("path").datum(M).attr("class","graph-line").attr("fill","none").attr("stroke","steelblue").attr("stroke-width",1.5).attr("d",X),n.selectAll(`.data-point-${B}`).data(M).enter().append("circle").attr("class",`data-point-${B}`).attr("r",3).attr("cx",E=>t(E.x)).attr("cy",E=>s(E.y)).attr("fill","steelblue")});const k=w==="dark"?"white":"#1b1e23";n.style("color",k),h.style("color",k),m.style("color",k),N(y,I,v,A,F)}L()}function Nr(a,g,f,p,u,x,T,e,d,O,P){let w="light",n,h,m,t,s;const i=window.matchMedia("(prefers-color-scheme: dark)");function o(y){w=y.matches?"dark":"light",n&&q()}i.addListener(o),o(i);const l={top:20,right:20,bottom:30,left:40},S=600-l.left-l.right,r=600-l.top-l.bottom;function L(){d3.select("#DiagramaFuerzaCortante svg").remove(),n=d3.select("#DiagramaFuerzaCortante").append("svg").attr("width",S+l.left+l.right).attr("height",r+l.top+l.bottom).append("g").attr("transform",`translate(${l.left},${l.top})`),t=d3.scaleLinear().range([0,S]),s=d3.scaleLinear().range([r,0]),h=n.append("g").attr("transform",`translate(0,${r})`).attr("class","x-axis"),m=n.append("g").attr("class","y-axis"),q()}function N(y,I,v,A,F){console.log(y);const C=y[3],k=y[1],M=y[2],B=y[0];n.append("text").attr("x",t(C[0].x)+.5).attr("y",s(C[0].y)).attr("fill","red").attr("font-size","12px").text(`${I}`),n.append("text").attr("x",t(k[2].x-.5)).attr("y",s(k[2].y)).attr("fill","yellow").attr("font-size","11px").text(`${v}`),n.append("text").attr("x",t(M[3].x)).attr("y",s(M[3].y)).attr("fill","orange").attr("font-size","11px").text(`${A}`),n.append("text").attr("x",t(B[2].x)).attr("y",s(B[2].y)).attr("fill","orange").attr("font-size","11px").text(`${F}`)}function q(){const y=Qs(a,g,f,p,u,x,T);var I=parseFloat(e).toFixed(2),v=parseFloat(d).toFixed(2),A=parseFloat(O).toFixed(2),F=parseFloat(P).toFixed(2);const C=y.flat();t.domain([0,d3.max(C,M=>M.x)*1.1]),s.domain([0,d3.max(C,M=>M.y)*1.1]),h.call(d3.axisBottom(t)),m.call(d3.axisLeft(s)),n.selectAll(".graph-line").remove(),n.selectAll(".acero-circle").remove(),y.forEach((M,B)=>{const X=d3.line().x(E=>t(E.x)).y(E=>s(E.y));n.append("path").datum(M).attr("class","graph-line").attr("fill","none").attr("stroke","steelblue").attr("stroke-width",1.5).attr("d",X),n.selectAll(`.data-point-${B}`).data(M).enter().append("circle").attr("class",`data-point-${B}`).attr("r",3).attr("cx",E=>t(E.x)).attr("cy",E=>s(E.y)).attr("fill","steelblue")});const k=w==="dark"?"white":"#1b1e23";n.style("color",k),h.style("color",k),m.style("color",k),N(y,I,v,A,F)}L()}c()});
