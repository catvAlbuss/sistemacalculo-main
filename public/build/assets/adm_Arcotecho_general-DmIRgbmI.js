document.addEventListener("DOMContentLoaded",()=>{const B=document.getElementById("desingButton");B&&B.addEventListener("click",V=>{V.preventDefault();const f=parseFloat(document.getElementById("longitudtransversal").value),H=parseFloat(document.getElementById("alturacolumna").value),s=parseFloat(document.getElementById("luz").value),t=parseFloat(document.getElementById("flecha").value),A=parseFloat(document.getElementById("pesopropio").value),E=parseFloat(document.getElementById("luminarias").value),I=parseFloat(document.getElementById("cargaviva").value),X=parseFloat(document.getElementById("cargaviento").value),Q=parseFloat(document.getElementById("Z").value),U=parseFloat(document.getElementById("U").value),Z=parseFloat(document.getElementById("S").value),N=parseFloat(document.getElementById("C").value),O=parseFloat(document.getElementById("R").value),S=parseFloat(document.getElementById("Ps").value),e=(t*t+s/2*s/2)/(2*t),d=Math.atan(s/2/(e-t)),j=d*(180/Math.PI),a=2*d*e,L=e-e*Math.sin(d)/d,q=a*f,z=e*Math.sin(d/2)/(d/2),p=z*Math.sin(d/2);document.getElementById("datosgeometricos").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Radio</td>
            <td class='py-2 px-4'>R</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${e.toFixed(2)}m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Angulo de arco</td>
            <td class='py-2 px-4'>theta</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${j.toFixed(2)} deg</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Angulo de arco</td>
            <td class='py-2 px-4'>theta</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${d.toFixed(2)} RAD</td>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Longitud de arco</td>
            <td class='py-2 px-4'>LS</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${a.toFixed(2)}m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Centro de gravedad de area</td>
            <td class='py-2 px-4'>CGz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${L.toFixed(2)}m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Area total</td>
            <td class='py-2 px-4'>AT</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${q.toFixed(2)}m<sup>2</sup></td>
        </tr>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Radio de CG de media cuerda</td>
            <td class='py-2 px-4'>CGz2</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${z.toFixed(2)}m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>CG XX de media cuerda</td>
            <td class='py-2 px-4'>CGz3</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${p.toFixed(2)}m</td>
        </tr>  `;const h=(A+E)*a,c=h*.5,o=((A+E)*a/2*p-c*s/2)/t,J=(c*c+o*o)**.5,M=I*a,r=M*.5,n=(I*a/2*p-r*s/2)/t,K=(r*r+n*n)**.5;document.getElementById("calculocargas").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga muerta por lado</td>
            <td class='py-2 px-4'>CD</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${h.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga muerta vertical</td>
            <td class='py-2 px-4'>CDz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${c.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga muerta horizontal</td>
            <td class='py-2 px-4'>CDx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${o.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Axial de CM</td>
            <td class='py-2 px-4'>AXIAL D</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${J.toFixed(2)}kg/m</td>
        </tr>`,document.getElementById("cargavivas").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva por lado</td>
            <td class='py-2 px-4'>CL</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${M.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva vertical</td>
            <td class='py-2 px-4'>CLz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${r.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva horizontal</td>
            <td class='py-2 px-4'>CLx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${n.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva Axial</td>
            <td class='py-2 px-4'>AXIAL L</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${K.toFixed(2)}kg/m</td>
        </tr>
        `;const W=c+.25*r,D=W*2,R=Q*U*Z*N/O,T=D*R,l=T/2,i=l*(t-L)/(s*.5),Y=(l*l+i*i)**.5;document.getElementById("coeficientesismico").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'> Peso sismico total </td>
            <td class='py-2 px-4'>CD+.25CL</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${D.toFixed(2)}kg/m</td>
        </tr> 
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Peso sismico por lado</td>
            <td class='py-2 px-4'>CD+.25CL </td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${W.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Coeficiente sismico</td>
            <td class='py-2 px-4'>ZUCS/R</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${R.toFixed(3)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga Sismica por lado</td>
            <td class='py-2 px-4'>CE</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${T.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga sismica Vertical</td>
            <td class='py-2 px-4'>CEx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${l.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga sismica horizontal</td>
            <td class='py-2 px-4'>CEz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${i.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga sismica Axial</td>
            <td class='py-2 px-4'>AXIAL E</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Y.toFixed(2)}kg/m</td>
        </tr>
       `;const m=+X*Math.pow((H+t)/10,.22),b=.005*m*m,C=+b*.8,k=.5*b,w=C*a,P=k*a,x=w*.5,u=(C*a/2*p-x*s/2)/t,_=(x*x+u*u)**.5,y=P*.5,v=(k*a/2*p-y*s/2)/t,tt=(y*y+v*v)**.5;document.getElementById("cargadeviento").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Velocidad de viento</td>
            <td class='py-2 px-4'>Vh</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${m.toFixed(2)}km/h</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Presion de viento</td>
            <td class='py-2 px-4'>Ph</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${b.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${C.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${k.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${w.toFixed(2)}kg/m</td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${P.toFixed(2)}kg/m</td>
        </tr>

         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWzBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${x.toFixed(2)}kg/m</td>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWxBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${u.toFixed(2)}kg/m</td>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Axial de viento</td>
            <td class='py-2 px-4'>AxialWBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${_.toFixed(2)}kg/m</td>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWzSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${y.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWxSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${v.toFixed(2)}kg/m</td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Axial de viento</td>
            <td class='py-2 px-4'>AxialWSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${tt.toFixed(2)}kg/m</td>
        </tr>
    `;const at=t/s,F=S,st=S*.8,G=F*a,g=G*.5,$=(F*a/2*p-g*s/2)/t,dt=(g*g+$*$)**.5;document.getElementById("carganieve").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Relacion <sup>h</sup>/<sub>L</sub></td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${at.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve</td>
            <td class='py-2 px-4'>Qt</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${F.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve 0.80</td>
            <td class='py-2 px-4'>Qt</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${st.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>CS</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${G.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>CSz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${g.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>CSx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${$.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>Axial S</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${dt.toFixed(2)}kg/m</td>
        </tr>
    `})});
