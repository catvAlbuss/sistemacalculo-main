document.addEventListener("DOMContentLoaded",async()=>{let ds="light",Lt,Ws,Zs,Ys,ka,Fa,$a;const wc=window.matchMedia("(prefers-color-scheme: dark)");function Cc(a){ds=a.matches?"dark":"light",Lt&&ns()}wc.addListener(Cc),Cc(wc);const pt={top:20,right:20,bottom:30,left:40},Dc=600-pt.left-pt.right,js=600-pt.top-pt.bottom;function Cr(a,x){var C=0,p=.7*a,m=.7*a,b=.7*a/3+a/10,I=.7*a/3+a/10,d=.7*a/3+a/10-x,s=.7*a/3,O=0,P=0,B=0,n=0,h=a/10,v=a/10,t=a/10+a,e=a/10+a,i=a/10,o=a/10,l=0;return[[{x:C,y:B},{x:p,y:n},{x:m,y:h},{x:b,y:v},{x:I,y:t},{x:d,y:e},{x:s,y:i},{x:O,y:o},{x:P,y:l}]]}function Dr(){Lt=d3.select("#predimsMC").append("svg").attr("width",Dc+pt.left+pt.right).attr("height",js+pt.top+pt.bottom).append("g").attr("transform",`translate(${pt.left},${pt.top})`),Fa=d3.scaleLinear().range([0,Dc]),$a=d3.scaleLinear().range([js,0]),Ws=Lt.append("g").attr("transform",`translate(0,${js})`).attr("class","x-axis"),Zs=Lt.append("g").attr("class","y-axis"),Ys=Lt.append("path").attr("fill","none").attr("stroke-width",1.5),ns()}function ns(){const a=parseFloat(document.getElementById("H").value),x=parseFloat(document.getElementById("e").value),p=Cr(a,x)[0];Fa.domain([0,d3.max(p,s=>s.x)*1.8]),$a.domain([0,d3.max(p,s=>s.y)*1.1]),Ws.call(d3.axisBottom(Fa)),Zs.call(d3.axisLeft($a));const m=d3.line().x(s=>Fa(s.x)).y(s=>$a(s.y));Ys.datum(p).attr("d",m),ka=Lt.selectAll(".point").data(p),ka.enter().append("circle").attr("class","point").attr("r",3).merge(ka).attr("cx",s=>Fa(s.x)).attr("cy",s=>$a(s.y)),ka.exit().remove();const b=ds==="dark"?"#1b1e23":"white",I=ds==="dark"?"white":"#1b1e23",d=ds==="dark"?"lightsteelblue":"steelblue";d3.select("body").style("background-color",b),Lt.style("color",I),Ws.style("color",I),Zs.style("color",I),Ys.attr("stroke",d),ka.attr("fill",d)}Dr(),document.getElementById("H").addEventListener("input",ns),document.getElementById("e").addEventListener("input",ns),parseFloat(document.getElementById("df").value),parseFloat(document.getElementById("H").value),parseFloat(document.getElementById("angterr").value),parseFloat(document.getElementById("e").value),parseFloat(document.getElementById("b1").value),parseFloat(document.getElementById("hd").value),document.getElementById("considerar").value,$("#cimientosControler").submit(a=>{a.preventDefault();let x=document.getElementById("considerar").value;parseFloat(document.getElementById("e").value),parseFloat(document.getElementById("gc").value);let C=parseFloat(document.getElementById("gs").value),p=parseFloat(document.getElementById("tet").value);parseFloat(document.getElementById("z").value);let m=parseFloat(document.getElementById("d").value);parseFloat(document.getElementById("SC").value);let b=parseFloat(document.getElementById("hs").value),I=calcularPrimerCuadro(x,C,p,m,b,inputka),d=document.getElementById("primerTabla");d.innerHTML=I}),document.getElementById("H").addEventListener("input",c),$("#graficar").click(a=>{const x=document.getElementById("table_General"),C=document.getElementById("text_graf"),p=document.getElementById("contenedorGrafico1"),m=document.getElementById("contendor_MC");x.style.display="block",p.style.display="block",m.style.display="block",C.style.display="block",document.getElementById("df").addEventListener("input",c),document.getElementById("H").addEventListener("input",c),document.getElementById("angterr").addEventListener("input",c),document.getElementById("e").addEventListener("input",c),document.getElementById("b1").addEventListener("input",c),document.getElementById("hd").addEventListener("input",c),document.getElementById("considerar").addEventListener("input",c),document.getElementById("gc").addEventListener("input",c),document.getElementById("gs").addEventListener("input",c),document.getElementById("tet").addEventListener("input",c),document.getElementById("z").addEventListener("input",c),document.getElementById("d").addEventListener("input",c),document.getElementById("SC").addEventListener("input",c),document.getElementById("hs").addEventListener("input",c),document.getElementById("b1graf").addEventListener("input",c),document.getElementById("hzgraf").addEventListener("input",c),document.getElementById("egraf").addEventListener("input",c),document.getElementById("epgraf").addEventListener("input",c),document.getElementById("b2graf").addEventListener("input",c),document.getElementById("zonaok").addEventListener("input",c),document.getElementById("kvran").addEventListener("input",c),document.getElementById("ubicacion").addEventListener("input",c),document.getElementById("dentelloncorr").addEventListener("input",c),document.getElementById("consDes").addEventListener("input",c),document.getElementById("ubicacioncon").addEventListener("input",c),document.getElementById("dentelloncons").addEventListener("input",c),document.getElementById("consDescons").addEventListener("input",c),document.getElementById("desing").addEventListener("input",c),document.getElementById("fy").addEventListener("input",c),document.getElementById("fc").addEventListener("input",c),document.getElementById("acer").addEventListener("input",c),document.getElementById("numbarras").addEventListener("input",c),document.getElementById("acertrans").addEventListener("input",c),document.getElementById("porpocion").addEventListener("input",c),document.getElementById("acerclibre").addEventListener("input",c),document.getElementById("lpr").addEventListener("input",c),document.getElementById("corteA").addEventListener("input",c),document.getElementById("acerpun").addEventListener("input",c),document.getElementById("numbarrapun").addEventListener("input",c),document.getElementById("DF").addEventListener("input",c),document.getElementById("aceroLs").addEventListener("input",c),document.getElementById("numbarrasls").addEventListener("input",c),document.getElementById("acertranspun").addEventListener("input",c),document.getElementById("porpocionpun").addEventListener("input",c),document.getElementById("acerclibrepun").addEventListener("input",c),document.getElementById("aceroLspun").addEventListener("input",c),document.getElementById("numbarraslspun").addEventListener("input",c),document.getElementById("acertal").addEventListener("input",c),document.getElementById("numbarratal").addEventListener("input",c),document.getElementById("acertranstal").addEventListener("input",c),document.getElementById("porpociontal").addEventListener("input",c),document.getElementById("acerclibretal").addEventListener("input",c),document.getElementById("Longitud").addEventListener("input",c),document.getElementById("LTal").addEventListener("input",c),document.getElementById("aceroKey").addEventListener("input",c),document.getElementById("numbarraKey").addEventListener("input",c),document.getElementById("acerotransKey").addEventListener("input",c),document.getElementById("porpocionKey").addEventListener("input",c),document.getElementById("aceroCLkey").addEventListener("input",c),c()});function c(){let a=parseFloat(document.getElementById("df").value),x=parseFloat(document.getElementById("H").value),C=parseFloat(document.getElementById("angterr").value);var p=parseFloat(document.getElementById("hd").value);let m=document.getElementById("considerar").value,b=parseFloat(document.getElementById("e").value),I=parseFloat(document.getElementById("gc").value),d=parseFloat(document.getElementById("gs").value),s=parseFloat(document.getElementById("tet").value),O=parseFloat(document.getElementById("z").value),P=parseFloat(document.getElementById("d").value),B=parseFloat(document.getElementById("SC").value),n=parseFloat(document.getElementById("hs").value);const h=parseFloat(document.getElementById("b1graf").value),v=parseFloat(document.getElementById("hzgraf").value),t=parseFloat(document.getElementById("egraf").value),e=parseFloat(document.getElementById("epgraf").value),i=parseFloat(document.getElementById("b2graf").value),o=parseFloat(document.getElementById("zonaok").value),l=parseFloat(document.getElementById("kvran").value);let S=parseFloat(document.getElementById("ubicacion").value),r=parseFloat(document.getElementById("dentelloncorr").value),T=document.getElementById("consDes").value,q=parseFloat(document.getElementById("ubicacioncon").value),X=parseFloat(document.getElementById("dentelloncons").value),y=document.getElementById("consDescons").value,f=document.getElementById("desing").value,g=parseFloat(document.getElementById("fy").value),E=parseFloat(document.getElementById("fc").value);var A=document.getElementById("acer").value,M=document.getElementById("acer").selectedIndex,F=document.getElementById("acer").options[M].text,w=parseFloat(A);let k=parseFloat(document.getElementById("numbarras").value);var H=document.getElementById("acertrans").value,D=document.getElementById("acertrans").selectedIndex,L=document.getElementById("acertrans").options[D].text,W=parseFloat(H);let G=parseFloat(document.getElementById("porpocion").value);var Z=document.getElementById("acerclibre").value,Y=document.getElementById("acerclibre").selectedIndex,V=document.getElementById("acerclibre").options[Y].text,_=parseFloat(Z);let U=parseFloat(document.getElementById("lpr").value),R=parseFloat(document.getElementById("corteA").value),j=parseFloat(document.getElementById("DF").value);var Q=document.getElementById("aceroLs").value,u=document.getElementById("aceroLs").selectedIndex,ct=document.getElementById("aceroLs").options[u].text,it=parseFloat(Q);let st=parseFloat(document.getElementById("numbarrasls").value);var Ea=document.getElementById("acerpun").value,Bt=document.getElementById("acerpun").selectedIndex,_t=document.getElementById("acerpun").options[Bt].text,kt=parseFloat(Ea);let Ma=parseFloat(document.getElementById("numbarrapun").value);var Ft=document.getElementById("acertranspun").value,Gt=document.getElementById("acertranspun").selectedIndex,Wt=document.getElementById("acertranspun").options[Gt].text,ft=parseFloat(Ft);let Zt=parseFloat(document.getElementById("porpocionpun").value);var wt=document.getElementById("acerclibrepun").value,Yt=document.getElementById("acerclibrepun").selectedIndex,jt=document.getElementById("acerclibrepun").options[Yt].text,Qt=parseFloat(wt),Jt=document.getElementById("aceroLspun").value,ot=document.getElementById("aceroLspun").selectedIndex,ta=document.getElementById("aceroLspun").options[ot].text,Ct=parseFloat(Jt);let Dt=parseFloat(document.getElementById("numbarraslspun").value);var Ot=document.getElementById("acertal").value,aa=document.getElementById("acertal").selectedIndex,Aa=document.getElementById("acertal").options[aa].text,sa=parseFloat(Ot);let Ia=parseFloat(document.getElementById("numbarratal").value);var bt=document.getElementById("acertranstal").value,rt=document.getElementById("acertranstal").selectedIndex,$t=document.getElementById("acertranstal").options[rt].text,Et=parseFloat(bt);let Ta=parseFloat(document.getElementById("porpociontal").value);var Js=document.getElementById("acerclibretal").value,te=document.getElementById("acerclibretal").selectedIndex,ae=document.getElementById("acerclibretal").options[te].text,ut=parseFloat(Js);let La=parseFloat(document.getElementById("Longitud").value),se=parseFloat(document.getElementById("LTal").value);var ee=document.getElementById("aceroKey").value,Ba=document.getElementById("aceroKey").selectedIndex,ea=document.getElementById("aceroKey").options[Ba].text;let hs=parseFloat(document.getElementById("numbarraKey").value);var fa=document.getElementById("acerotransKey").value,Pt=document.getElementById("acerotransKey").selectedIndex,St=document.getElementById("acerotransKey").options[Pt].text;let ys=parseFloat(document.getElementById("porpocionKey").value);var wa=document.getElementById("aceroCLkey").value,ce=document.getElementById("aceroCLkey").selectedIndex,oe=document.getElementById("aceroCLkey").options[ce].text;Or(x,a,C,p,B,O,m,o,l,b,n,P,s,d,I,h,i,v,t,e,S,r,T,q,X,y,f,E,g,w,F,k,W,L,G,_,V,U,j,ct,it,st,_t,kt,Ma,Wt,ft,Zt,jt,Qt,ta,Ct,Dt,R,Aa,sa,Ia,$t,Et,Ta,ae,ut,La,se,ee,ea,hs,fa,St,ys,wa,oe)}function Or(a,x,C,p,m,b,I,d,s,O,P,B,n,h,v,t,e,i,o,l,S,r,T,q,X,y,f,g,E,A,M,F,w,k,H,D,L,W,G,Z,Y,V,_,U,R,j,Q,u,ct,it,st,Ea,Bt,_t,kt,Ma,Ft,Gt,Wt,ft,Zt,wt,Yt,jt,Qt,Jt,ot,ta,Ct,Dt,Ot,aa){let Aa=[["si",a+r],["no",a]],sa=2;function Ia(Ut,xt,ba){for(let ua=0;ua<xt.length;ua++)if(xt[ua][0]===Ut)return xt[ua][ba-1];return null}let bt=Ia(I,Aa,sa);var ca=n*Math.PI/180,J=B*Math.PI/180;let rt=Math.cos(J),$t=Math.pow(Math.cos(ca),2),Et=Math.pow(Math.cos(J),2),Ta=rt-Math.pow(Et-$t,.5),Js=rt+Math.pow(Et-$t,.5),te=rt+Math.pow(Et-$t,.5),ae=rt-Math.pow(Et-$t,.5),ut=rt*Ta/Js,La=rt*te/ae,se=`
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Desplante</th>
                <th class='py-2 px-4' scope="col">Df</th>
                <td class='py-2 px-4 text-center' scope="col">${x}</td>
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
                <td class='py-2 px-4 text-center' scope="col">${C}</td>
                <td class='py-2 px-4' scope="col">°</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">MONONOBE-OKABE?</th>
                <th class='py-2 px-4' scope="col">-</th>
                <td class='py-2 px-4 text-center' scope="col">${d}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Kv esta en el rango de 0.3-0.6 Kh</th>
                <th class='py-2 px-4' scope="col">-</th>
                <td class='py-2 px-4 text-center' scope="col">${s}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Peso especifico del concreto</th>
                <th class='py-2 px-4' scope="col">Yc</th>
                <td class='py-2 px-4 text-center' scope="col">${v}</td>
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
                <td class='py-2 px-4 text-center' scope="col">${b}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Angulo de Talud</th>
                <th class='py-2 px-4' scope="col">d</th>
                <td class='py-2 px-4 text-center' scope="col">${B}</td>
                <td class='py-2 px-4' scope="col">°</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Sobrecarga</th>
                <th class='py-2 px-4' scope="col">S/C</th>
                <td class='py-2 px-4 text-center' scope="col">${m}</td>
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
                <td class='py-2 px-4 text-center' scope="col">${ut.toFixed(4)}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">factor de empuje pasivo</th>
                <th class='py-2 px-4' scope="col">kp</th>
                <td class='py-2 px-4 text-center' scope="col">${La.toFixed(4)}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600"><th scope="col" colspan="6"></th></tr>
            `,ee=document.getElementById("Requisitodesing");ee.innerHTML=se;var Ba=h*parseFloat(ut)*bt,ea=bt*Ba/2,hs=ea*Math.sin(J),fa=ea*Math.cos(J),Pt=h*ut*P,St=parseFloat(bt)*parseFloat(Pt),ys=parseFloat(St*Math.sin(J)),wa=St*Math.cos(J),ce=bt+P,oe=parseFloat(parseFloat(Ba)+parseFloat(Pt)),qr=ea+St,Ca=hs+ys,Da=parseFloat(fa+wa);let Xr=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Altura del muro</th>
                    <th class='py-2 px-4' scope="col">H</th>
                    <td class='py-2 px-4 text-center'>${bt.toFixed(2)} m</td>
                    <td class='py-2 px-4 text-center'>${P.toFixed(2)} m</td>
                    <td class='py-2 px-4'>${ce.toFixed(2)} m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Peso del suelo</th>
                    <th class='py-2 px-4' scope="col" colspan="0">sMAX</th>
                    <td class='py-2 px-4 text-center'>${Ba.toFixed(2)} Tn/m<sup>3</sup></td>
                    <td class='py-2 px-4 text-center'>${Pt.toFixed(2)} Tn/m<sup>3</sup></td>
                    <td class='py-2 px-4'>${oe.toFixed(2)} Tn/m<sup>3</sup></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Peso propio del muro</th>
                    <th class='py-2 px-4' scope="col" colspan="0">P</th>
                    <td class='py-2 px-4 text-center'>${ea.toFixed(2)} Tn</td>
                    <td class='py-2 px-4 text-center'>${St.toFixed(2)} Tn</td>
                    <td class='py-2 px-4'>${qr.toFixed(2)} Tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Presion vertical</th>
                    <th class='py-2 px-4' scope="col" colspan="0">Pv</th>
                    <td class='py-2 px-4 text-center'>${hs.toFixed(2)} Tn</td>
                    <td class='py-2 px-4 text-center'>${ys.toFixed(2)} Tn</td>
                    <td class='py-2 px-4'>${Ca.toFixed(2)} Tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Presion horizontal</th>
                    <th class='py-2 px-4' scope="col" colspan="0">Ph</th>
                    <td class='py-2 px-4 text-center'>${fa.toFixed(2)} Tn</td>
                    <td class='py-2 px-4 text-center'>${wa.toFixed(2)} Tn</td>
                    <td class='py-2 px-4'>${Da.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600"><th scope="col" colspan="6"></th></tr>`,Hr=document.getElementById("primerTabla");Hr.innerHTML=Xr;var Vt=o+l,K=t+Vt+e,ca=n*Math.PI/180,J=B*Math.PI/180,gs=t*t*.5*Math.tan(J),xs=t*a,is=P*t/Math.cos(J),bs=K*i,us=l*a*.5,ms=o*a,vs=gs*h,ks=xs*h,Fs=is*h,Oa=bs*v,Rt=us*v,zt=ms*v,re=2*t/3+e+Vt,$s=t/2+Vt+e,le=$s,pe=K/2,de=2*l/3+e,ne=o/2+l+e,he=vs*re,ye=ks*$s,ge=Fs*le,xe=Oa*pe,ie=Rt*de,be=zt*ne,Pa=parseFloat(vs)+parseFloat(ks)+parseFloat(Fs)+parseFloat(Oa)+parseFloat(Rt)+parseFloat(zt),Sa=parseFloat(he)+parseFloat(ye)+parseFloat(ge)+parseFloat(xe)+parseFloat(ie)+parseFloat(be),Ur=parseFloat(bs)+parseFloat(us)+parseFloat(ms),_r=parseFloat(Oa)+parseFloat(Rt)+parseFloat(zt),ue=parseFloat(Ca)*(K-t),Va=parseFloat(Sa)+parseFloat(ue),me=parseFloat(fa)*(parseFloat(a)/3),ve=wa*(a/2),Ra=parseFloat(me)+parseFloat(ve),Oc=(Va/Ra).toFixed(2),ke="";if(Oc<2)var ke="NO";else var ke="OK";let Gr=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">1</th>
                    <td class='py-2 px-4'>${gs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${vs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${re.toFixed(2)}</td>
                    <td class='py-2 px-4'>${he.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO TALUD</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">2</th>
                    <td class='py-2 px-4'>${xs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ks.toFixed(2)}</td>
                    <td class='py-2 px-4'>${$s.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ye.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">3</th>
                    <td class='py-2 px-4'>${is.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Fs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${le.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ge.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO S/C</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">4</th>
                    <td class='py-2 px-4'>${bs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Oa.toFixed(2)}</td>
                    <td class='py-2 px-4'>${pe.toFixed(2)}</td>
                    <td class='py-2 px-4'>${xe.toFixed(2)}</td>
                    <td class='py-2 px-4'>BASE</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">5</th>
                    <td class='py-2 px-4'>${us.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Rt.toFixed(2)}</td>
                    <td class='py-2 px-4'>${de.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ie.toFixed(2)}</td>
                    <td class='py-2 px-4'>CUÑA</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">6</th>
                    <td class='py-2 px-4'>${ms.toFixed(2)}</td>
                    <td class='py-2 px-4'>${zt.toFixed(2)}</td>
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
            `;var Es=Math.tan(ca),Mt=parseFloat(Pa)+parseFloat(Ca),Ms=parseFloat(Mt)*parseFloat(Es),Pc=Ms/Da,Fe="";if(Pc<1.5)var Fe="NO";else var Fe="OK";let Zr=`
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
                <td class='py-2 px-4'>${Mt.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col">Tn</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Coeficiente de friccion</th>
                <th class='py-2 px-4' scope="col">µ</th>
                <td class='py-2 px-4'>${Es.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col"></th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                <th class='py-2 px-4' scope="col">Fr=</th>
                <td class='py-2 px-4'>${Ms.toFixed(2)}</td>
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
                    <td class='py-2 px-4'>${gs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${vs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${re.toFixed(2)}</td>
                    <td class='py-2 px-4'>${he.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO TALUD</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">2</th>
                    <td class='py-2 px-4'>${xs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ks.toFixed(2)}</td>
                    <td class='py-2 px-4'>${$s.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ye.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">3</th>
                    <td class='py-2 px-4'>${is.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Fs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${le.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ge.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO S/C</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">4</th>
                    <td class='py-2 px-4'>${bs.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Oa.toFixed(2)}</td>
                    <td class='py-2 px-4'>${pe.toFixed(2)}</td>
                    <td class='py-2 px-4'>${xe.toFixed(2)}</td>
                    <td class='py-2 px-4'>BASE</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">5</th>
                    <td class='py-2 px-4'>${us.toFixed(2)}</td>
                    <td class='py-2 px-4'>${Rt.toFixed(2)}</td>
                    <td class='py-2 px-4'>${de.toFixed(2)}</td>
                    <td class='py-2 px-4'>${ie.toFixed(2)}</td>
                    <td class='py-2 px-4'>CUÑA</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">6</th>
                    <td class='py-2 px-4'>${ms.toFixed(2)}</td>
                    <td class='py-2 px-4'>${zt.toFixed(2)}</td>
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
            `,za=0;switch(d){case .4:za=d/2;break;case .3:za=d/2;break;case .15:za=d/2;break;default:za=0;break}var Ka=Math.atan(za/(1-s)),jr=Math.sin(ca+J),Qr=Math.sin(ca-Ka-0),Jr=Math.cos(0+J+Ka),tl=Math.cos(0),Sc=Math.cos(ca-Ka-0),al=Math.cos(Ka)*Math.cos(0)*Math.cos(0)*Math.cos(0+J+Ka),sl=Math.pow(jr*Qr/(Jr*tl),.5),el=Math.pow(1+sl,2),cl=Sc*Sc/(el*al),ol=.5*h*(1-s)*cl*a*a,rl=.5*h*ut*a*a,Na=ol-rl,ll=a*.6,As=Na*ll,qa=parseFloat(Ra)+parseFloat(As),Vc=Va/qa,$e="";if(Vc<1.2)var $e="NO";else var $e="OK";let pl=`
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
                    <td class='py-2 px-4'>${As.toFixed(2)}</td>
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
            `;var Is=(parseFloat(Na)+parseFloat(Da)).toFixed(2),Rc=(parseFloat(Ms)/parseFloat(Is)).toFixed(2),dl=Rc<1.2?"NO":"OK";let nl=`
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
                    <td class='py-2 px-4'>${Mt.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Coeficiente de friccion</th>
                    <th class='py-2 px-4' scope="col">µ</th>
                    <td class='py-2 px-4'>${Es.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                    <th class='py-2 px-4' scope="col">Fr</th>
                    <td class='py-2 px-4'>${Ms.toFixed(2)}</td>
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
                    <td class='py-2 px-4'>${Is}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                    <th class='py-2 px-4' scope="col">F.S.</th>
                    <th class='py-2 px-4' scope="col">${Rc}</th>
                    <th class='py-2 px-4' scope="col">${dl}</th>
                </tr>
                <tr class="text-center" colspan="6"></tr>
            `;function zc(Ut){const xt=$(".tabla-oculta"),ba=$(".tabla-ocultabody");Ut==="si"?(xt.show(),ba.show()):(xt.hide(),ba.hide())}var Ee=0;switch(I){case"si":zc(I);var Me=(Vt*r).toFixed(2),oa=(parseFloat(Me)*parseFloat(v)).toFixed(2);let Ut=S,xt=Ut*oa;var Xa=xt+Va,Kc=(Xa/Ra).toFixed(2);let ba=Kc<2?"NOT":"OK";var Ts=parseFloat(oa)+parseFloat(Mt),Ls=parseFloat(Ts*Es),Ae=0;switch(T){case"si":Ae=Math.pow(r+i,2)*h*La*.5;break;default:Ae=0;break}var Ie=Ae,Nc=parseFloat(Da),Te=(parseFloat(Ls)+parseFloat(Ie))/Nc;let ua=Te<1.5?"NOT":"OK";var Bs=parseFloat(Xa),qc=Ra,Xc=Bs-qc,fs=parseFloat(Ts),Ha=Xc/fs,Ua=(K/3).toFixed(2),ws=(Ua*2).toFixed(2);let Mc="";Ha>=Ua&&Ha<=ws?Mc="SI":Mc="NO";var mt=((4*K-6*Ha)*Mt/(K*K)).toFixed(2),_a=((-2*K+6*Ha)*Mt/(K*K)).toFixed(2),Ga=12.5;let ls="";mt<Ga?ls="OK":ls="NOT";let ps="";_a<Ga?ps="OK":ps="NOT";const ma=[0,0,K,K],Ac=[0,-mt,-_a,0];var Cs=((_a-mt)/K).toFixed(2),Ds=parseFloat(h*ut*a*Math.cos(J)+Pt).toFixed(2),Wa=Pt,Hc=mt,Uc=Cs*e+parseFloat(mt),_c=Cs*t+parseFloat(mt),Le=_a,Be=((parseFloat(gs)+parseFloat(xs)+parseFloat(is))*parseFloat(h)/parseFloat(t)).toFixed(2),Os=parseFloat(h*ut*(a+i+r)*Math.cos(J)+Wa).toFixed(2),Ps=parseFloat(h*ut*(a+i)*Math.cos(J)+Wa).toFixed(2),hl=Vt,yl=a,gl=parseFloat(Rt)+parseFloat(zt),fe=i,xl=e,we=e*i*v,Ce=i,il=t,De=i*t*v,Gc=Vt,bl=r,ul=oa,Wc=(Xa/qa).toFixed(2),Oe="";Wc?Oe="OK":Oe="NOT";var Pe=0;switch(y){case"si":Pe=Math.pow(r+i,2)*h*La*.5;break;default:Pe=0;break}var ml=((parseFloat(Ls)+parseFloat(Ie))/Is).toFixed(2);let kd=Te<1.2?"NOT":"OK";var Zc=(Bs-qa).toFixed(2),Za=Zc/fs;let Ic="";Za>=Ua&&Za<=ws?Ic="SI":Ic="NO";var dt=(4*K-6*Za)*Mt/(K*K),ra=(-2*K+6*Za)*Mt/(K*K),vl=1.3*Ga;let Fd="";dt<Ga?ls="OK":ls="NOT";let $d="";ra<Ga?ps="OK":ps="NOT";var Ss=((ra-dt)/K).toFixed(2),Yc=Ss*e+parseFloat(dt),jc=Ss*t+parseFloat(dt);Ee=Na;var kl=0,Fl=0,$l=parseFloat(Rt)+parseFloat(zt),El=0,Ml=0,Al=0*0*B,Il=0,Tl=0,Ll=0*0*B,Bl=a,fl=r,wl=oa;const Ed=document.getElementById("keysin");Ed.innerHTML=`
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
                            <td class='py-2 px-4' id="braValue">${Ut}</td>
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
                            <td class='py-2 px-4' id="rvkey">${Ts.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                            <th class='py-2 px-4' scope="col">Fr</th>
                            <td class='py-2 px-4' id="frkey">${Ls.toFixed(2)}</td>
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
                            <td class='py-2 px-4' id="mvveri ">${Bs.toFixed(2)}</td>
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
                            <td class='py-2 px-4' id="rvpriver">${fs.toFixed(2)}</td>
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
                            <td class='py-2 px-4' id="llter">${ws}</td>
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
                            <td class='py-2 px-4' id="s1">${mt}</td>
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
                            <td class='py-2 px-4' id="a">${Cs}</td>
                            <th class='py-2 px-4' scope="col">+</th>
                            <td class='py-2 px-4' id="s2">X</td>
                            <td class='py-2 px-4' id="s1graf">${mt}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4' colspan="6">
                                <div id="grafico" style="width: auto; height:300px;"></div>
                            </td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col">b</th>
                            <td class='py-2 px-4'>${mt}</td>
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col">a</th>
                            <td class='py-2 px-4'>${Cs}</td>
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
                            <td class='py-2 px-4' id="pantq2">${Ds}</td>
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
                            <td class='py-2 px-4' id="keyq2">${Os}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="0" class="text-center">Empuje activo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="keyq1">${Ps}</td>
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
                            <td class='py-2 px-4' id="braValue">${Ut}</td>
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
                            <td class='py-2 px-4' id="rvkey">${Ts.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                            <th class='py-2 px-4' scope="col">Fr</th>
                            <td class='py-2 px-4' id="frkey">${Ls.toFixed(2)}</td>
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
                            <td class='py-2 px-4' id="phdes">${Is}</td>
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
                            <td class='py-2 px-4' id="mvveri ">${Bs.toFixed(2)}</td>
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
                            <td class='py-2 px-4' id="rvpriver">${fs.toFixed(2)}</td>
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
                            <td class='py-2 px-4' id="llter">${ws}</td>
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
                            <td class='py-2 px-4' id="a">${Ss}</td>
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
                            <td class='py-2 px-4'>${Ss}</td>
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
                            <td class='py-2 px-4' id="pantq2">${Ds}</td>
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
                            <td class='py-2 px-4' id="keyq2">${Os}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">

                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="keyq1">${Ps}</td>
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
                    `;const Tc=[];for(let N=0;N<ma.length;N++){if(N>0&&ma[N]===ma[N-1]){const fc=[(ma[N]+ma[N-1])/2,(Ac[N]+Ac[N-1])/2];Tc.push(fc)}Tc.push([ma[N],Ac[N]])}const Ad={title:{text:"Diagrama de presiones"},xAxis:{type:"category"},yAxis:{type:"value"},series:[{data:Tc,type:"line"}]};echarts.init(document.getElementById("grafpresion")).setOption(Ad);const va=[0,0,K,K],Lc=[0,-dt,-ra,0];let Bc=[];for(let N=0;N<va.length;N++){if(N>0&&va[N]===va[N-1]){let fc=[(va[N]+va[N-1])/2,(Lc[N]+Lc[N-1])/2];Bc.push(fc)}Bc.push([va[N],Lc[N]])}const Id={title:{text:"Diagrama de presiones"},xAxis:{type:"category"},yAxis:{type:"value"},series:[{data:Bc,type:"line"}]};echarts.init(document.getElementById("grafpresionkeycon")).setOption(Id);break;default:zc(I);break}let Cl=Gr+Wr+Zr+Yr+pl+nl,Dl=document.getElementById("segundaTabla");Dl.innerHTML=Cl;var la=Math.max(Wa,St),Se=Math.max(Ds,Ds),Ve=Math.max(we,we),Ya=Math.max(Uc,Yc),Re=Math.max(Hc,dt),ja=Math.max(De,De),pa=Math.max(Le,Be),Kt=Math.min(Le,ra),ze=Math.max(_c,jc),Vs=Math.max(Ps,Ps),Ke=Math.max(Os,Os),et=0,Qa=_t,nt=W,At=Se-la,Ja=et*At/a,Rs=At-Ja,Qc=parseFloat(la)*parseFloat(Qa-a),Jc=parseFloat(Rs)*parseFloat(Qa)+parseFloat(Ja)*parseFloat(Qa)/2-parseFloat(At)*parseFloat(a)/2,to=Math.abs(Qc+Jc),zs=f=="sinsismo"?0:Ee,ao=la*(et*et+a*a-2*a*et)/2,so=Rs*et*et/2+Ja*et*et/3-At*et*et/2+At*a*a/6,eo=ao+so,co=f=="sinsismo"?0:As-zs*et,oo=la*(nt*nt+a*a-2*a*nt)/2,ro=Rs*nt*nt/2+Ja*nt*nt/3-At*a*nt/2+At*a*a/6,lo=oo+ro,po=f=="sinsismo"?0:As-zs*nt,da=1.7*eo+co,Ks=1.7*to+zs,lt=0,ts=(fe*100-10)/100,as=Re-Ya,Ne=as*lt/a,no=Ya*(ts-e),ho=(Ne*ts-as*e)/2,yo=no+ho,go=Math.abs(Ve*(ts-e)),xo=Ya*(lt*lt+e*e-2*e*lt)/2,io=as*e*e/3+Ne*lt*lt/6-as*e*lt/2,bo=xo+io,uo=Ve*(lt*lt+e*e-2*e*lt)/2,Ns=Math.abs(1.7*-bo-1.4*uo),ss=Math.abs(1.7*yo+-1.4*go);let Ol=`
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
                    <td class='py-2 px-4 text-right'>${At.toFixed(2)}</td>
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
                    <td class='py-2 px-4 text-right'>${Rs.toFixed(2)}</td>
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
                    <th class="text-lg py-2 px-4" scope="col">${zs.toFixed(2)}</th>
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
                    <td class='py-2 px-4 text-right'>${Ks.toFixed(2)}</td>
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
                    <td class='py-2 px-4 text-right'>${e}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia inicial</th>
                    <th class='py-2 px-4' scope="col">X1</th>
                    <td class='py-2 px-4 text-right'>${lt}</td>
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
                    <td class='py-2 px-4 text-right'> ${Ns.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="col">Vu</th>
                    <td class='py-2 px-4 text-right'>${ss.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
            `;var tt=0,na=(Ce*100-10)/100,at=jt,ha=Yt,vt=ze-Kt,Ht=ts*vt/t,es=vt-Ht,mo=Kt*(ha-t),vo=es*ha+t*ha/2-vt*t/2,ko=mo+vo,Fo=Math.abs(ja*(ha-t)),$o=Math.abs(pa*(ha-t)),Eo=Kt*(na-t),Mo=es*na+Ht*na/2-vt*t/2,Ao=Eo+Mo,Io=Math.abs(ja*(na-t)),To=Math.abs(pa*(na-t)),Lo=Kt*(tt*tt+t*t-2*t*tt)/2,Bo=es*tt*tt/2+t*tt*tt/3-vt*t*tt/2+vt*t*t/6,fo=-(Lo+Bo),wo=ja*(tt*tt+t*t-2*t*tt)/2,Co=pa*(tt*tt+t*t-2*t*tt)/2,Do=Kt*(at*at+t*t-2*t*at)/2,Oo=es*at*at/2+Ht*at*at/3-vt*t*at/2+vt*t*t/6,Po=-(Do+Oo),So=ja*(at*at+t*t-2*t*at)/2,Vo=pa*(at*at+t*t-2*t*at)/2,qs=1.7*parseFloat(fo)+1.4*parseFloat(wo)+1.7*parseFloat(Co),Nt=1.7*Ao+1.4*Io+1.7*To;let Sl=`
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
                    <td class='py-2 px-4 text-right'>${Kt.toFixed(2)}</td>
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
                    <td class='py-2 px-4 text-right'>${vt.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia de corte</th>
                    <th class='py-2 px-4' scope="col">a</th>
                    <td class='py-2 px-4 text-right'>${Ht.toFixed(2)}</td>
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
                    <td class='py-2 px-4 text-right '>${qs.toFixed(2)}</td>
                    <th class='py-2 px-4 text-center' scope="row">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="row">Vu</th>
                    <td class='py-2 px-4 text-right '>${Nt.toFixed(2)}</td>
                    <th class='py-2 px-4 text-center' scope="row">Tn</th>
                </tr>
            `;var qe=Vs*r,Xe=(Ke-Vs)*r/2,Ro=qe+Xe,zo=qe*r/2,Ko=Xe*2*r/3,No=zo+Ko,Xs=1.7*No,cs=1.7*Ro;let Vl=`
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="6">5.4. Key</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo inicial</th>
                    <th class='py-2 px-4' scope="col">q1</th>
                    <td class='py-2 px-4 text-right'>${Vs.toFixed(2)}</td>
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
                    <td class='py-2 px-4 text-right'>${Xs.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="col">Vu</th>
                    <td class='py-2 px-4 text-right'>${cs.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
            `,Rl=Ol+Pl+Sl+Vl,zl=document.getElementById("tablapp");zl.innerHTML=Rl;var z=100,qo=Vt*100,qt=qo-4,He=da*1e5,ht=.002,yt=.0018,os=ht*z*qt,Ue=yt*z*qt,Xo=qt-Math.pow(Math.pow(qt,2)-2*He/(.85*.9*g*z),.5),_e=He/(.9*E*(qt-Xo/2)),Kl=_e>Ue?"OK":"NOT",Ho=Math.max(_e,Ue);let Nl=`
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
                    <td class='py-2 px-4 text-right'>${Ks.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th class='py-2 px-4' scope="col">Fy</th>
                    <td class='py-2 px-4 text-right'>${E}</td>
                    <th class='py-2 px-4' scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th class='py-2 px-4' scope="col">f'c</th>
                    <td class='py-2 px-4 text-right'>${g}</td>
                    <th class='py-2 px-4' scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Ancho a analizar</th>
                    <th class='py-2 px-4' scope="col">b</th>
                    <td class='py-2 px-4 text-right'>${z.toFixed(2)}</td>
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
                    <td class='py-2 px-4 text-right'>${qt.toFixed(2)}</td>
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

            `,ql=document.getElementById("tablatk");ql.innerHTML=Nl;var Ge=Math.round(A*F*100/Ho),Xl=Ge<20?Ge:20,Hl=A*F;let Ul=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3">Diametro del acero</th>
                    <th scope="col" colspan="0">Ø</th>
                    <td>${M}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3"># barras</th>
                    <th scope="col" colspan="0">#</th>
                    <td>${F}</td>
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
                    <td>${F}</td>
                    <td>Ø</td>
                    <td>${M}</td>
                    <td>@</td>
                    <td contenteditable="true">${Xl.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="6"></th>
                </tr>
            `,_l=document.getElementById("tablapantallaAcero");_l.innerHTML=Ul;var Uo=os*H,We=Math.round(w*100/Uo),ya=1,_o=We<25?We:25;let Gl=`
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
                    <td>${H.toFixed(2)}</td>
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
                    <td>${k}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Medida del acero</th>
                    <th scope="col">As</th>
                    <td>${w.toFixed(2)}</td>
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
                    <td>${k}</td>
                    <td>@</td>
                    <td contenteditable="true">${_o.toFixed(2)}</td>
                </tr>
            `,Wl=document.getElementById("tablaDAT");Wl.innerHTML=Gl;var Go=1-H,Wo=os*Go,Ze=Math.round(D*100/Wo),Zl=1,Yl=Ze<25?Ze:25;let jl=`
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
                    <td>${L}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero</th>
                    <th scope="col">As</th>
                    <td>${D.toFixed(2)}</td>
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
                    <td>${L}</td>
                    <td>@</td>
                    <td contenteditable="true">${Yl.toFixed(2)}</td>
                </tr>
            `,Ql=document.getElementById("tablacaidaLibre");Ql.innerHTML=jl;var Zo=qt,Yo=Ks,Jl=Qa,jo=.53*Zo*z*Math.pow(g,.5)/1e3,Qo=jo*.85,tp=Qo>Yo?"OK":"ESTA MAL";let ap=`
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
            `,sp=document.getElementById("tabledcorte");sp.innerHTML=ap;var Ye=lo*1.7+po,Jo=100,je=(l*G/a+o)*100,Hs=je-4,Qe=Ye*1e5,Us=.002*je*100,ep=da/2,cp=Ye<=da/2?"OK":"AUMENTA L";let op=`
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
                    <td>${E}</td>
                    <th>Kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${g}</td>
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
                    <td>${Hs.toFixed(2)}</td>
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
                    <td>${Us.toFixed(2)}</td>
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
            `,rp=document.getElementById("tablePrecorte");rp.innerHTML=op;var tr=Hs-Math.pow(Math.pow(Hs,2)-2*Qe/(.85*.9*g*Jo),.5),Je=Qe/(.9*E*(Hs-tr/2)),lp=Je>Us?"OK":"NO",ar=Math.max(Je,Us),tc=F>1?1:0,sr=A*tc,ac=Math.round(sr*100/ar),pp=ac<20?ac:20;let dp=`
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
                    <td>${M}</td>
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
                    <td>${M}</td>
                    <td>@</td>
                    <td contenteditable="true">${pp.toFixed(2)}</td>
                </tr>
            `,np=document.getElementById("tableDflexion");np.innerHTML=dp;var er=Y*V,sc=Math.round(er*100/Us),hp=sc<20?sc:20;let yp=`
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
            `,gp=document.getElementById("tablaALS");gp.innerHTML=yp;var cr=fe*100,It=cr-10,ec=Ns*1e5,Xt=ht*z*It,rs=yt*z*It,or=It-Math.pow(Math.pow(It,2)-2*ec/(.85*.9*g*z),.5),cc=ec/(.9*E*(It-or/2)),xp=cc>Xt?"OK":"NOT",rr=Math.max(cc,Xt);let ip=`
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
                    <td>${ss.toFixed(2)}</td>
                    <th scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${E}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${g}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${z.toFixed(2)}</td>
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
                    <td>${It.toFixed(2)}</td>
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
                    <td>${Xt.toFixed(2)}</td>
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
            `,bp=document.getElementById("tabladesingcaPunta");bp.innerHTML=ip;var lr=U*R,oc=Math.round(lr*100/rr),up=oc<20?oc:20;let mp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col">Ø</th>
                    <td>${_}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># barras</th>
                    <th scope="col">#</th>
                    <td>${R}</td>
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
                    <td>${R}</td>
                    <td>Ø</td>
                    <td>${_}</td>
                    <td>@</td>
                    <td contenteditable="true">${up}</td>
                </tr>
            `,vp=document.getElementById("tablaDALP");vp.innerHTML=mp;var pr=rs*u,rc=Math.round(Q*100/pr),kp=rc<25?rc:25;let Fp=`
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
                    <td>${u.toFixed(2)}</td>
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
                    <td>${k}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Medida del acero</th>
                    <th scope="col">As</th>
                    <td>${Q.toFixed(2)}</td>
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
             `,$p=document.getElementById("tabladatpun");$p.innerHTML=Fp;var dr=1-u,nr=rs*dr,lc=Math.round(it*100/nr),Ep=lc<25?lc:25;let Mp=`
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
                    <td>${ct}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero</th>
                    <th scope="col">As</th>
                    <td>${it.toFixed(2)}</td>
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
                    <td>${ct}</td>
                    <td>@</td>
                    <td contenteditable="true">${Ep}</td>
                </tr>
            `,Ap=document.getElementById("tablaClibre");Ap.innerHTML=Mp;var hr=.53*It*z*Math.pow(g,.5)/1e3,yr=hr*.85,Ip=yr>ss?"OK":"NOT";let Tp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">Calcular el cortante a una distancia</th>
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
            `,Lp=document.getElementById("tabledcortepun");Lp.innerHTML=Tp;var gr=Ea*Bt,pc=Math.round(gr*100/Xt),Bp=pc<20?pc:20;let fp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col">Ø</th>
                    <td>${st}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${Bt}</td>
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
                    <td>${Bt}</td>
                    <td>Ø</td>
                    <td>${st}</td>
                    <td>@</td>
                    <td contenteditable="true">${Bp}</td>
                </tr>
            `,wp=document.getElementById("tablaALSpun");wp.innerHTML=fp;var _s=Ce*100,gt=_s-10,ga=qs*1e5,xr=ht*z*gt,ir=yt*z*gt,Ht=gt-Math.pow(Math.pow(gt,2)-2*ga/(.85*.9*g*z),.5),dc=ga/(.9*E*(gt-Ht/2)),Cp=dc>ir?"OK":"NOT",br=Math.max(xr,dc);let Dp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${qs.toFixed(2)}</td>
                    <th scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${Nt.toFixed(2)}</td>
                    <th scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${E}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${g}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${z}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${_s}</td>
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
                    <td>${Ht.toFixed(2)}</td>
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
            `,Op=document.getElementById("tabladesingcatalon");Op.innerHTML=Dp;var nc=Ma*Ft,hc=Math.round(nc*100/br),Pp=hc<20?hc:20;let Sp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col" >Ø</th>
                    <td>${kt}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${Ft}</td>
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
                    <td>${Ft}</td>
                    <td>Ø</td>
                    <td>${kt}</td>
                    <td>@</td>
                    <td contenteditable="true">${Pp.toFixed(2)}</td>
                </tr>
            `,Vp=document.getElementById("tablaALPtal");Vp.innerHTML=Sp;var Gs=Xt*ft,yc=Math.round(Wt*100/Gs),Rp=yc<25?yc:25;let zp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">Cara del terreno</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${Xt.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${ft.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${Gs.toFixed(2)}</td>
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
            `,Kp=document.getElementById("tablaDATtal");Kp.innerHTML=zp;var gc=Math.round(wt*100/Gs),Np=gc<25?gc:25;let qp=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${Xt.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${ft.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${Gs.toFixed(2)}</td>
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
                    <td>${wt.toFixed(2)}</td>
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
            `,Xp=document.getElementById("tablaCLtal");Xp.innerHTML=qp;var ur=.53*gt*z*Math.pow(g,.5)/1e3,xc=ur*.85,Hp=xc>Nt?"OK":"NO";let Up=`
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
                    <td>${Nt.toFixed(2)}</td>
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
            `,_p=document.getElementById("tablaDCtal");_p.innerHTML=Up;var mr=1.7*ko+1.4*Fo+1.7*$o,Gp=mr>xc?"AUMENTAR LONGITUD":"OK",Wp=Nt*1e3/(.85*.53*100*Math.pow(g,.5))-gt<0?0:Nt*1e3/(.85*.53*100*Math.pow(g,.5))-gt;let Zp=`
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
            `,Yp=document.getElementById("tablaDCtalLP");Yp.innerHTML=Zp;var xa=_s-4,jp=1.7*Po+1.4*So+1.7*Vo,Qp=ht*z*xa,ic=yt*z*xa,vr=xa-Math.pow(Math.pow(xa,2)-2*ga/(.85*.9*g*z),.5),bc=ga/(.9*E*(xa-vr/2)),Jp=bc>ic?"OK":"NOT",kr=Math.max(bc,ic),uc=Ft>1?1:0,Fr=nc*uc,mc=Fr*100/kr,td=mc<20?mc:20;let ad=`
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
                    <td>${E}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${g}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${z}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${_s}</td>
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
                    <td>${kt}</td>
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
                    <td>${kt}</td>
                    <td>@</td>
                    <td contenteditable="true">${td.toFixed(2)}</td>
                </tr>
            `,sd=document.getElementById("tablaDCtaltRR");sd.innerHTML=ad;var $r=Gc*100,Tt=$r-10,vc=Xs*1e5,ia=ht*z*Tt,Er=yt*z*Tt,Mr=Tt-Math.pow(Math.pow(Tt,2)-2*vc/(.85*.9*g*z),.5),kc=vc/(.9*E*(Tt-Mr/2)),ed=kc>Er?"OK":"NOT",Ar=Math.max(kc,ia);let cd=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Longitud</th>
                    <th scope="col">L</th>
                    <td>${Xs.toFixed(2)}</td>
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
                    <td>${E}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${g}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${z}</td>
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
                    <td>${Tt}</td>
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

            `,od=document.getElementById("tablaKey");od.innerHTML=cd;var Ir=Qt*ot,Fc=Math.round(Ir*100/Ar),rd=Fc<20?Fc:20;let ld=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">Ø</th>
                    <td>${Jt}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${ot}</td>
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
                    <td>${ot}</td>
                    <td>Ø</td>
                    <td>${Jt}</td>
                    <td>@</td>
                    <td contenteditable="true">${rd.toFixed(2)}</td>
                </tr>
            `,pd=document.getElementById("tablaDALKey");pd.innerHTML=ld;var Tr=ia*Dt,$c=Math.round(ta*100/Tr),dd=(ot=0)?0:1,nd=(ot=0)?0:$c<25?$c:25;let hd=`
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
                    <td>${Dt.toFixed(2)}</td>
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
                    <td>${Ct}</td>
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
                    <td>${Ct}</td>
                    <td>@</td>
                    <td contenteditable="true">${nd.toFixed(2)}</td>
                </tr>
            `,yd=document.getElementById("tablaDATKey");yd.innerHTML=hd;var Lr=1-Dt,Br=ia*Lr,Ec=Math.round(Ot*100/Br),gd=(ot=0)?0:1,xd=(ot=0)?0:Ec<25?Ec:25;let id=`
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
                    <td>${Ot}</td>
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
            `,bd=document.getElementById("tablaCLKey");bd.innerHTML=id;var fr=.53*Tt*z*Math.pow(g,.5)/1e3,wr=fr*.85,ud=wr>cs?"OK":"ESTA MAL";let md=`
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="2">Calcular el cortante a una distancia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${Tt.toFixed(2)}</td>
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
            `,vd=document.getElementById("tablaDCKey");vd.innerHTML=md,Pr(p,K,t,i,a,l,o,e,I,w,ya,k,_o),zr(a,t,i,o,l,e,r,Na,Se,la,Re,Ya,ze,Kt,Ke,Vs,pa),Kr(a,t,i,o,l,e,r,da,Ns,qs,Xs),Nr(a,t,i,o,l,e,r,Ks,ss,Nt,cs),Rr()}function Pr(a,x,C,p,m,b,I,d,s,O,P,B,n){let h="light",v,t,e,i,o;const l=window.matchMedia("(prefers-color-scheme: dark)");function S(f){h=f.matches?"dark":"light",v&&y()}l.addListener(S),S(l);const r={top:20,right:20,bottom:30,left:40},T=600-r.left-r.right,q=600-r.top-r.bottom;function X(){d3.select("#graficoFinal svg").remove(),v=d3.select("#graficoFinal").append("svg").attr("width",T+r.left+r.right).attr("height",q+r.top+r.bottom).append("g").attr("transform",`translate(${r.left},${r.top})`),i=d3.scaleLinear().range([0,T]),o=d3.scaleLinear().range([q,0]),t=v.append("g").attr("transform",`translate(0,${q})`).attr("class","x-axis"),e=v.append("g").attr("class","y-axis"),v.append("path").attr("fill","none").attr("stroke-width",1.5),y()}function y(){const f=Sr(a,x,C,p,m,b,I,d,s),g=f.flat();i.domain([0,d3.max(g,u=>u.x)*1.8]),o.domain([0,d3.max(g,u=>u.y)*1.1]),t.call(d3.axisBottom(i)),e.call(d3.axisLeft(o)),v.selectAll(".graph-line").remove(),v.selectAll(".acero-circle").remove(),f.forEach((u,ct)=>{const it=d3.line().x(st=>i(st.x)).y(st=>o(st.y));v.append("path").datum(u).attr("class","graph-line").attr("fill","none").attr("stroke","steelblue").attr("stroke-width",1.5).attr("d",it),v.selectAll(`.data-point-${ct}`).data(u).enter().append("circle").attr("class",`data-point-${ct}`).attr("r",3).attr("cx",st=>i(st.x)).attr("cy",st=>o(st.y)).attr("fill","steelblue")});const E=O,A=f[5],M=(x*100-15)/n,F=n/10.5;for(let u=0;u<M;u++)v.append("circle").attr("class","acero-circle").attr("cx",i(12.5+u*F)).attr("cy",o(10+1.5)).attr("r",E).attr("fill","purple").attr("stroke","purple").attr("stroke-width",1);const w=(x*100-15)/n,k=n/10.5;for(let u=0;u<w;u++)v.append("circle").attr("class","acero-circle").attr("cx",i(12.5+u*k)).attr("cy",o(A[4].puntov5y+.5)).attr("r",E).attr("fill","green").attr("stroke","green").attr("stroke-width",1);const D=(A[1].puntoh3y-A[2].puntoh1y)/(n/10.5),L=n/10.5;for(let u=0;u<D;u++)v.append("circle").attr("class","acero-circle").attr("cx",i(A[0].puntoh3x+.5)).attr("cy",o(2+u*L)).attr("r",E).attr("fill","blue").attr("stroke","blue").attr("stroke-width",1);const G=(parseFloat(A[7].puntoh9y)-parseFloat(A[4].puntov5y))/(n/10.5),Z=n/10.5,Y=A[0].puntoh3x+.5,V=A[5].puntoh6x;for(let u=0;u<G;u++)v.append("circle").attr("class","acero-circle").attr("cx",i(Y+(V-Y)*(u/G))).attr("cy",o(.5+A[1].puntoh3y+u*Z)).attr("r",E).attr("fill","yellow").attr("stroke","yellow").attr("stroke-width",1);const U=(A[7].puntoh9y-A[6].puntoh6y)/(n/10.5),R=n/10.5;for(let u=0;u<U;u++)v.append("circle").attr("class","acero-circle").attr("cx",i(A[5].puntoh6x)).attr("cy",o(A[6].puntoh6y+.5+u*R)).attr("r",E).attr("fill","red").attr("stroke","red").attr("stroke-width",1);const j=h==="dark"?"#1b1e23":"white",Q=h==="dark"?"white":"#1b1e23";d3.select("body").style("background-color",j),v.style("color",Q),t.style("color",Q),e.style("color",Q)}X()}function Sr(a,x,C,p,m,b,I,d,s,O,P,B,n){var h=(b+I)*10,v=10,t=10+d*10,e=s=="si"?10+d*10:10,i=s=="si"?10+d*10+h:10+h,o=s=="si"?10+d*10+h:10,l=10+x*10,S=10+x*10,r=10+d*10+h,T=10+d*10+h,q=10+d*10+h-I*10,X=10+d*10,y=10,f=10,g=10,E=10,A=s=="si"?10-a*10:10,M=s=="si"?10-a*10:10,F=(s="si",10),w=10,k=10+p*10,H=10+p*10,D=10+p*10+m*10,L=10+p*10+m*10,W=10+p*10,G=10+p*10,Z=10,Y=[{x:v,y:g},{x:t,y:E},{x:e,y:A},{x:i,y:M},{x:o,y:F},{x:l,y:w},{x:S,y:k},{x:r,y:H},{x:T,y:D},{x:q,y:L},{x:X,y:W},{x:y,y:G},{x:f,y:Z}],V=12,_=12,U=10+x*10-2,R=10+x*10-2,j=13,Q=13,u=10+x*10-3,ct=10+x*10-3,it=13,st=11,Ea=11,Bt=13,_t=10+p*10-2,kt=10+p*10-1,Ma=10+p*10-1,Ft=10+p*10-2,Gt=[{x:V,y:it},{x:_,y:st},{x:U,y:Ea},{x:R,y:Bt}],Wt=[{x:j,y:_t},{x:Q,y:kt},{x:u,y:Ma},{x:ct,y:Ft}],ft=(s=="si",10+d*10+1.5),Zt=(s=="si",10+d*10+1),wt=(s=="si",10+d*10+1),Yt=10+d*10+.5+b*10,jt=10+d*10+.5+.5+b*10,Qt=s=="si"?10+d*10+h-1:10+d*10+h-1.5,Jt=(s=="si",10+d*10+h-.5),ot=(s=="si",10+d*10+h-.5),ta=s=="si"?10+d*10+h-1:10+d*10+h-10-1.5,Ct=s=="si"?10-a*10+2.5:1+2.5,Dt=s=="si"?10-a*10+2.5:1+2.5,Ot=(s=="si",10+p*10-.5),aa=10+p*10+m*10-2.5,Aa=10+p*10+m*10-2.5,sa=s=="si"?10-a*10+1.5:10+1.5,Ia=s=="si"?10-a*10+1.5:10+1.5,bt=(s=="si",10+p*10+m*10-2),rt=(s=="si",10+p*10+m*10-2),$t=[{x:ft,y:Ct},{x:Zt,y:Dt},{x:wt,y:Ot},{x:Yt,y:aa},{x:jt,y:Aa}],Et=[{x:Qt,y:sa},{x:Jt,y:Ia},{x:ot,y:bt},{x:ta,y:rt}],Ta=[{puntoh3x:wt},{puntoh3y:Ot},{puntoh1y:Ct},{puntov5x:j},{puntov5y:_t},{puntoh6x:Qt},{puntoh6y:sa},{puntoh9y:parseFloat(rt)}];return[Y,Gt,Wt,$t,Et,Ta]}function Vr(a,x,C,p,m,b,I,d,s,O){var P=x+m,B=b+P+p;const n=0,h=b,v=b+(m+s),t=B,e=B,i=B-p,o=B-p,l=B-p-s,S=B-p-s-O,r=0,T=0,q=0,X=0,y=0,f=0,g=parseFloat(O),E=parseFloat(O),A=parseFloat(d),M=parseFloat(d),F=parseFloat(O),w=parseFloat(O),H=[{x:n,y:q},{x:h,y:X},{x:v,y},{x:t,y:f},{x:e,y:g},{x:i,y:E},{x:o,y:A},{x:l,y:M},{x:S,y:F},{x:r,y:w},{x:T,y:0}],D=B+2,L=b+D,W=b+D,G=b+(m+s)+D,Z=b+(m+s)+D,Y=D+b,V=D,_=I+D,U=I+D;return[H,[{x:L,y:V},{x:W,y:_},{x:G,y:U},{x:Z,y:D},{x:Y,y:D}]]}function Rr(){let a="light",x,C,p,m,b;const I=window.matchMedia("(prefers-color-scheme: dark)");function d(h){a=h.matches?"dark":"light",x&&refreshGraph()}I.addListener(d),d(I);const s={top:20,right:20,bottom:30,left:40},O=600-s.left-s.right,P=600-s.top-s.bottom;function B(){d3.select("#seccionmcontencion svg").remove(),x=d3.select("#seccionmcontencion").append("svg").attr("width",O+s.left+s.right).attr("height",P+s.top+s.bottom).append("g").attr("transform",`translate(${s.left},${s.top})`),m=d3.scaleLinear().range([0,O]),b=d3.scaleLinear().range([P,0]),C=x.append("g").attr("transform",`translate(0,${P})`).attr("class","x-axis"),p=x.append("g").attr("class","y-axis"),x.append("path").attr("fill","none").attr("stroke-width",1.5),n()}function n(){const h=parseFloat(document.getElementById("H").value),v=parseFloat(document.getElementById("b1graf").value),t=parseFloat(document.getElementById("hzgraf").value),e=parseFloat(document.getElementById("egraf").value),i=parseFloat(document.getElementById("epgraf").value),o=parseFloat(document.getElementById("b2graf").value),l=parseFloat(document.getElementById("dentelloncorr").value),S=parseFloat(document.getElementById("H").value),r=parseFloat(document.getElementById("egraf").value),T=parseFloat(document.getElementById("hzgraf").value),q=Vr(t,e,h,v,i,o,l,S,r,T),X=q.flat();m.domain([0,d3.max(X,g=>g.x)*1.5]),b.domain([0,d3.max(X,g=>g.y)*1.1]),C.call(d3.axisBottom(m)),p.call(d3.axisLeft(b)),x.selectAll(".graph-line").remove(),x.selectAll(".acero-circle").remove(),q.forEach((g,E)=>{const A=d3.line().x(M=>m(M.x)).y(M=>b(M.y));x.append("path").datum(g).attr("class","graph-line").attr("fill","none").attr("stroke","steelblue").attr("stroke-width",1.5).attr("d",A),x.selectAll(`.data-point-${E}`).data(g).enter().append("circle").attr("class",`data-point-${E}`).attr("r",3).attr("cx",M=>m(M.x)).attr("cy",M=>b(M.y)).attr("fill","steelblue")});const y=a==="dark"?"#1b1e23":"white",f=a==="dark"?"white":"#1b1e23";d3.select("body").style("background-color",y),x.style("color",f),C.style("color",f),p.style("color",f)}B()}function Qs(a,x,C,p,m,b,I,d,s,O,P,B,n,h,v,t){var i=p+m,o=b+i+x;const l=o+2,S=b+l,r=b+l,T=b+(m+p)+l,q=b+(m+p)+l,X=l+b,y=l,f=I+l,g=I+l,M=[{x:S,y},{x:r,y:f},{x:T,y:g},{x:q,y:l},{x:X,y:l}],F=0,w=b,k=0,H=0,D=parseFloat(C),L=b+(m+p),W=o,G=parseFloat(C),Z=[{x:F,y:k},{x:w,y:H},{x:w,y:D},{x:F,y:D},{x:F,y:k}],Y=[{x:L,y:k},{x:W,y:k},{x:W,y:G},{x:L,y:G},{x:L,y:k}],V=o-x,_=o-x,U=o-x-p,R=o-x-p-C,j=parseFloat(C)+.5,Q=parseFloat(a)+.5,u=parseFloat(a)+.5,ct=parseFloat(C)+.5;return[M,Z,Y,[{x:V,y:j},{x:_,y:Q},{x:U,y:u},{x:R,y:ct},{x:V,y:j}]]}function zr(a,x,C,p,m,b,I,d,s,O,P,B,n,h,v,t,e){let i="light",o,l,S,r,T;const q=window.matchMedia("(prefers-color-scheme: dark)");function X(F){i=F.matches?"dark":"light",o&&M()}q.addListener(X),X(q);const y={top:20,right:20,bottom:30,left:40},f=600-y.left-y.right,g=600-y.top-y.bottom;function E(){d3.select("#seccionCargasActuantes svg").remove(),o=d3.select("#seccionCargasActuantes").append("svg").attr("width",f+y.left+y.right).attr("height",g+y.top+y.bottom).append("g").attr("transform",`translate(${y.left},${y.top})`),r=d3.scaleLinear().range([0,f]),T=d3.scaleLinear().range([g,0]),l=o.append("g").attr("transform",`translate(0,${g})`).attr("class","x-axis"),S=o.append("g").attr("class","y-axis"),M()}function A(F,w,k,H,D,L,W,G,Z,Y){console.log(F);const V=F[3],_=F[1],U=F[2],R=F[0];o.append("text").attr("x",r(V[0].x)+.5).attr("y",T(V[0].y)).attr("fill","red").attr("font-size","12px").text(`${w}`),o.append("text").attr("x",r(V[0].x)+.5).attr("y",T(V[1].y/2)).attr("fill","green").attr("font-size","12px").text(`${H}`),o.append("text").attr("x",r(V[0].x)+.5).attr("y",T(V[1].y)).attr("fill","yellow").attr("font-size","12px").text(`${k}`),o.append("text").attr("x",r(_[3].x)).attr("y",T(_[3].y)).attr("fill","orange").attr("font-size","11px").text(`${L}`),o.append("text").attr("x",r(_[2].x-.5)).attr("y",T(_[2].y)).attr("fill","purple").attr("font-size","11px").text(`${D}`),o.append("text").attr("x",r(U[3].x)).attr("y",T(U[3].y)).attr("fill","orange").attr("font-size","11px").text(`${W}`),o.append("text").attr("x",r(U[2].x-.5)).attr("y",T(U[2].y)).attr("fill","red").attr("font-size","11px").text(`${G}`),o.append("text").attr("x",r(U[2].x-.5)).attr("y",T(U[2].y-.5)).attr("fill","yellow").attr("font-size","11px").text(`${e}`),o.append("text").attr("x",r(R[2].x)).attr("y",T(R[2].y)).attr("fill","orange").attr("font-size","11px").text(`${Y}`),o.append("text").attr("x",r(R[3].x)).attr("y",T(R[3].y)).attr("fill","purple").attr("font-size","11px").text(`${Z}`)}function M(){const F=Qs(a,x,C,p,m,b,I);var w=parseFloat(s).toFixed(2),k=parseFloat(O).toFixed(2),H=parseFloat(d).toFixed(2),D=parseFloat(B).toFixed(2),L=parseFloat(P).toFixed(2),W=parseFloat(n).toFixed(2),G=parseFloat(h).toFixed(2);parseFloat(e).toFixed(2);var Z=parseFloat(v).toFixed(2),Y=parseFloat(t).toFixed(2);const V=F.flat();r.domain([0,d3.max(V,R=>R.x)*1.1]),T.domain([0,d3.max(V,R=>R.y)*1.1]),l.call(d3.axisBottom(r)),S.call(d3.axisLeft(T)),o.selectAll(".graph-line").remove(),o.selectAll(".acero-circle").remove(),F.forEach((R,j)=>{const Q=d3.line().x(u=>r(u.x)).y(u=>T(u.y));o.append("path").datum(R).attr("class","graph-line").attr("fill","none").attr("stroke","steelblue").attr("stroke-width",1.5).attr("d",Q),o.selectAll(`.data-point-${j}`).data(R).enter().append("circle").attr("class",`data-point-${j}`).attr("r",3).attr("cx",u=>r(u.x)).attr("cy",u=>T(u.y)).attr("fill","steelblue")});const _=i==="dark"?"#1b1e23":"white",U=i==="dark"?"white":"#1b1e23";d3.select("body").style("background-color",_),o.style("color",U),l.style("color",U),S.style("color",U),A(F,w,k,H,D,L,W,G,Z,Y)}E()}function Kr(a,x,C,p,m,b,I,d,s,O,P){let B="light",n,h,v,t,e;const i=window.matchMedia("(prefers-color-scheme: dark)");function o(y){B=y.matches?"dark":"light",n&&X()}i.addListener(o),o(i);const l={top:20,right:20,bottom:30,left:40},S=600-l.left-l.right,r=600-l.top-l.bottom;function T(){d3.select("#DiagramaMomentosFlectores svg").remove(),n=d3.select("#DiagramaMomentosFlectores").append("svg").attr("width",S+l.left+l.right).attr("height",r+l.top+l.bottom).append("g").attr("transform",`translate(${l.left},${l.top})`),t=d3.scaleLinear().range([0,S]),e=d3.scaleLinear().range([r,0]),h=n.append("g").attr("transform",`translate(0,${r})`).attr("class","x-axis"),v=n.append("g").attr("class","y-axis"),X()}function q(y,f,g,E,A){console.log(y);const M=y[3],F=y[1],w=y[2],k=y[0];n.append("text").attr("x",t(M[0].x)+.5).attr("y",e(M[0].y)).attr("fill","red").attr("font-size","12px").text(`${f}`),n.append("text").attr("x",t(F[2].x-.5)).attr("y",e(F[2].y)).attr("fill","yellow").attr("font-size","11px").text(`${g}`),n.append("text").attr("x",t(w[3].x)).attr("y",e(w[3].y)).attr("fill","orange").attr("font-size","11px").text(`${E}`),n.append("text").attr("x",t(k[2].x)).attr("y",e(k[2].y)).attr("fill","orange").attr("font-size","11px").text(`${A}`)}function X(){const y=Qs(a,x,C,p,m,b,I);var f=parseFloat(d).toFixed(2),g=parseFloat(s).toFixed(2),E=parseFloat(O).toFixed(2),A=parseFloat(P).toFixed(2);const M=y.flat();t.domain([0,d3.max(M,k=>k.x)*1.1]),e.domain([0,d3.max(M,k=>k.y)*1.1]),h.call(d3.axisBottom(t)),v.call(d3.axisLeft(e)),n.selectAll(".graph-line").remove(),n.selectAll(".acero-circle").remove(),y.forEach((k,H)=>{const D=d3.line().x(L=>t(L.x)).y(L=>e(L.y));n.append("path").datum(k).attr("class","graph-line").attr("fill","none").attr("stroke","steelblue").attr("stroke-width",1.5).attr("d",D),n.selectAll(`.data-point-${H}`).data(k).enter().append("circle").attr("class",`data-point-${H}`).attr("r",3).attr("cx",L=>t(L.x)).attr("cy",L=>e(L.y)).attr("fill","steelblue")});const F=B==="dark"?"#1b1e23":"white",w=B==="dark"?"white":"#1b1e23";d3.select("body").style("background-color",F),n.style("color",w),h.style("color",w),v.style("color",w),q(y,f,g,E,A)}T()}function Nr(a,x,C,p,m,b,I,d,s,O,P){let B="light",n,h,v,t,e;const i=window.matchMedia("(prefers-color-scheme: dark)");function o(y){B=y.matches?"dark":"light",n&&X()}i.addListener(o),o(i);const l={top:20,right:20,bottom:30,left:40},S=600-l.left-l.right,r=600-l.top-l.bottom;function T(){d3.select("#DiagramaFuerzaCortante svg").remove(),n=d3.select("#DiagramaFuerzaCortante").append("svg").attr("width",S+l.left+l.right).attr("height",r+l.top+l.bottom).append("g").attr("transform",`translate(${l.left},${l.top})`),t=d3.scaleLinear().range([0,S]),e=d3.scaleLinear().range([r,0]),h=n.append("g").attr("transform",`translate(0,${r})`).attr("class","x-axis"),v=n.append("g").attr("class","y-axis"),X()}function q(y,f,g,E,A){console.log(y);const M=y[3],F=y[1],w=y[2],k=y[0];n.append("text").attr("x",t(M[0].x)+.5).attr("y",e(M[0].y)).attr("fill","red").attr("font-size","12px").text(`${f}`),n.append("text").attr("x",t(F[2].x-.5)).attr("y",e(F[2].y)).attr("fill","yellow").attr("font-size","11px").text(`${g}`),n.append("text").attr("x",t(w[3].x)).attr("y",e(w[3].y)).attr("fill","orange").attr("font-size","11px").text(`${E}`),n.append("text").attr("x",t(k[2].x)).attr("y",e(k[2].y)).attr("fill","orange").attr("font-size","11px").text(`${A}`)}function X(){const y=Qs(a,x,C,p,m,b,I);var f=parseFloat(d).toFixed(2),g=parseFloat(s).toFixed(2),E=parseFloat(O).toFixed(2),A=parseFloat(P).toFixed(2);const M=y.flat();t.domain([0,d3.max(M,k=>k.x)*1.1]),e.domain([0,d3.max(M,k=>k.y)*1.1]),h.call(d3.axisBottom(t)),v.call(d3.axisLeft(e)),n.selectAll(".graph-line").remove(),n.selectAll(".acero-circle").remove(),y.forEach((k,H)=>{const D=d3.line().x(L=>t(L.x)).y(L=>e(L.y));n.append("path").datum(k).attr("class","graph-line").attr("fill","none").attr("stroke","steelblue").attr("stroke-width",1.5).attr("d",D),n.selectAll(`.data-point-${H}`).data(k).enter().append("circle").attr("class",`data-point-${H}`).attr("r",3).attr("cx",L=>t(L.x)).attr("cy",L=>e(L.y)).attr("fill","steelblue")});const F=B==="dark"?"#1b1e23":"white",w=B==="dark"?"white":"#1b1e23";d3.select("body").style("background-color",F),n.style("color",w),h.style("color",w),v.style("color",w),q(y,f,g,E,A)}T()}c()});
