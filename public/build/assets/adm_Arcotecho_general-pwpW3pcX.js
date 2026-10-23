document.addEventListener("DOMContentLoaded",()=>{const i=document.getElementById("desingButton");if(!i)return;i.addEventListener("click",x=>{x.preventDefault();const m=parseFloat(document.getElementById("longitudtransversal").value),X=parseFloat(document.getElementById("alturacolumna").value),s=parseFloat(document.getElementById("luz").value),t=parseFloat(document.getElementById("flecha").value),L=parseFloat(document.getElementById("pesopropio").value),S=parseFloat(document.getElementById("luminarias").value),z=parseFloat(document.getElementById("cargaviva").value),Q=parseFloat(document.getElementById("cargaviento").value),U=parseFloat(document.getElementById("Z").value),Z=parseFloat(document.getElementById("U").value),q=parseFloat(document.getElementById("S").value),N=parseFloat(document.getElementById("C").value),O=parseFloat(document.getElementById("R").value),h=parseFloat(document.getElementById("Ps").value),e=(t*t+s/2*s/2)/(2*t),d=Math.atan(s/2/(e-t)),j=d*(180/Math.PI),a=2*d*e,M=e-e*Math.sin(d)/d,J=a*m,W=e*Math.sin(d/2)/(d/2),c=W*Math.sin(d/2);document.getElementById("datosgeometricos").innerHTML=`
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
            <td class='py-2 px-4 text-center'>${M.toFixed(2)}m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Area total</td>
            <td class='py-2 px-4'>AT</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${J.toFixed(2)}m<sup>2</sup></td>
        </tr>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Radio de CG de media cuerda</td>
            <td class='py-2 px-4'>CGz2</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${W.toFixed(2)}m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>CG XX de media cuerda</td>
            <td class='py-2 px-4'>CGz3</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${c.toFixed(2)}m</td>
        </tr>  `;const f=(L+S)*a,r=f*.5,u=((L+S)*a/2*c-r*s/2)/t,K=(r*r+u*u)**.5,D=z*a,l=D*.5,b=(z*a/2*c-l*s/2)/t,Y=(l*l+b*b)**.5;document.getElementById("calculocargas").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga muerta por lado</td>
            <td class='py-2 px-4'>CD</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${f.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga muerta vertical</td>
            <td class='py-2 px-4'>CDz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${r.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga muerta horizontal</td>
            <td class='py-2 px-4'>CDx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${u.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Axial de CM</td>
            <td class='py-2 px-4'>AXIAL D</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${K.toFixed(2)}kg/m</td>
        </tr>`,document.getElementById("cargavivas").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva por lado</td>
            <td class='py-2 px-4'>CL</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${D.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva vertical</td>
            <td class='py-2 px-4'>CLz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${l.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva horizontal</td>
            <td class='py-2 px-4'>CLx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${b.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga viva Axial</td>
            <td class='py-2 px-4'>AXIAL L</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${Y.toFixed(2)}kg/m</td>
        </tr>
        `;const R=r+.25*l,T=R*2,w=U*Z*q*N/O,P=T*w,y=P/2,C=y*(t-M)/(s*.5),_=(y*y+C*C)**.5;document.getElementById("coeficientesismico").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'> Peso sismico total </td>
            <td class='py-2 px-4'>CD+.25CL</td>
            <td class='py-2 px-4'></td>
            <td class='py-2 px-4 text-center'>${T.toFixed(2)}kg/m</td>
        </tr> 
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Peso sismico por lado</td>
            <td class='py-2 px-4'>CD+.25CL </td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${R.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Coeficiente sismico</td>
            <td class='py-2 px-4'>ZUCS/R</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${w.toFixed(3)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga Sismica por lado</td>
            <td class='py-2 px-4'>CE</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${P.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga sismica Vertical</td>
            <td class='py-2 px-4'>CEx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${y.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga sismica horizontal</td>
            <td class='py-2 px-4'>CEz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${C.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga sismica Axial</td>
            <td class='py-2 px-4'>AXIAL E</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${_.toFixed(2)}kg/m</td>
        </tr>
       `;const k=+Q*Math.pow((X+t)/10,.22),v=.005*k*k,F=+v*.8,$=.5*v,G=F*a,V=$*a,g=G*.5,B=(F*a/2*c-g*s/2)/t,tt=(g*g+B*B)**.5,o=V*.5,E=($*a/2*c-o*s/2)/t,at=(o*o+E*E)**.5;document.getElementById("cargadeviento").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Velocidad de viento</td>
            <td class='py-2 px-4'>Vh</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${k.toFixed(2)}km/h</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Presion de viento</td>
            <td class='py-2 px-4'>Ph</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${v.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${F.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${$.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${G.toFixed(2)}kg/m</td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${V.toFixed(2)}kg/m</td>
        </tr>

         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWzBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${g.toFixed(2)}kg/m</td>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento barlovento</td>
            <td class='py-2 px-4'>CWxBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${B.toFixed(2)}kg/m</td>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Axial de viento</td>
            <td class='py-2 px-4'>AxialWBar</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${tt.toFixed(2)}kg/m</td>
        </tr>
          <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWzSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${o.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de viento sotavento</td>
            <td class='py-2 px-4'>CWxSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${E.toFixed(2)}kg/m</td>
        </tr>
         <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Axial de viento</td>
            <td class='py-2 px-4'>AxialWSota</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${at.toFixed(2)}kg/m</td>
        </tr>
    `;const st=t/s,A=h,dt=h*.8,H=A*a,n=H*.5,I=(A*a/2*c-n*s/2)/t,et=(n*n+I*I)**.5;document.getElementById("carganieve").innerHTML=`
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Relacion <sup>h</sup>/<sub>L</sub></td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${st.toFixed(2)}kg/m</td>
        </tr> 
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve</td>
            <td class='py-2 px-4'>Qt</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${A.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve 0.80</td>
            <td class='py-2 px-4'>Qt</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${dt.toFixed(2)}kg/m<sup>2</sup></td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>CS</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${H.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>CSz</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${n.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>CSx</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${I.toFixed(2)}kg/m</td>
        </tr>
        <tr class="bg-gray-100 dark:bg-gray-600">
            <td class='py-2 px-8'>Carga de nieve </td>
            <td class='py-2 px-4'>Axial S</td>
            <td class='py-2 px-4'>-</td>
            <td class='py-2 px-4 text-center'>${et.toFixed(2)}kg/m</td>
        </tr>
    `});const p=document.getElementById("arco-status");if(p){let x=!1;i.addEventListener("click",()=>{x=!0,p.textContent="Resultados actualizados con los datos ingresados.",p.dataset.state="ready"}),document.querySelectorAll(".arco-sheet input").forEach(m=>{m.addEventListener("input",()=>{x&&(p.textContent="Datos modificados · vuelve a calcular para actualizar los resultados.",p.dataset.state="pending")})})}});
