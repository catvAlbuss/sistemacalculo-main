import{h as T}from"./html2canvas.esm-5Cw11iw4.js";import"./printThis-eR5fzPta.js";document.addEventListener("DOMContentLoaded",function(){var u=0,i=0,b=0,n=0,x=0,o=0,v=0,f=1,p=2.85*f,y=21,g='3/4"',h=document.getElementById("datosForm"),m=0;h.addEventListener("submit",function(e){e.preventDefault(),u=parseFloat(document.getElementById("fy").value),i=parseFloat(document.getElementById("fc").value),b=parseFloat(document.getElementById("t").value),n=parseFloat(document.getElementById("b").value),x=parseFloat(document.getElementById("mu").value);var l="";m=0,l=`
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Esfuerzo de fluencia del acero</td>
                  <td class='py-2 px-4' colspan="2">Fy</td>
                  <td class='py-2 px-4' id="fyVal">${u.toFixed(2)} kg/cm²</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Esfuerzo a compresion del concreto</td>
                  <td class='py-2 px-4' colspan="2">f'c</td>
                  <td class='py-2 px-4' id="fcVal">${i.toFixed(2)} kg/cm²</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Espesor de la losa</td>
                  <td class='py-2 px-4' colspan="2">t</td>
                  <td class='py-2 px-4' id="tVal">${b.toFixed(2)} cm</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Ancho de análisis</td>
                  <td class='py-2 px-4' colspan="2">b</td>
                  <td class='py-2 px-4' id="bVal">${n.toFixed(2)} cm</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Momento Último</td>
                  <td class='py-2 px-4' colspan="2">Mu </td>
                  <td class='py-2 px-4' id="muVal">${x.toFixed(2)} kg-cm</td>
              </tr>`,document.getElementById("resultadosiniciales").innerHTML=l,E()});function E(){var e="",l="";o=b-3;function t(){const r=.7*Math.sqrt(i)/u,a=r*n*o;var s=o-Math.pow(Math.pow(o,2)-2*x/(.85*.9*i*n),.5),c=x/(.9*u*(o-s/2));v=Math.max(c,a),l=`
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td scope="row" class='py-2 px-4'> Peralte efectivo </td>
                <td scope="row" class='py-2 px-4'>
                    d
                </td>
                <td scope="row" class='py-2 px-4'>
                    t - 3
                </td>
                <td scope="row" class='py-2 px-4'>
                    ${o} cm
                </td>
            </tr>  
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th scope="row" class="text-xm py-2 px-4 text-left" colspan="4">
                    2.1. Cuantías
                </th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td scope="row" class='py-2 px-4'>
                    Cuantía mínima
                </td>
                <td scope="row" class='py-2 px-4'>ρMin</td>
                <td scope="row" class='py-2 px-4'>0.7(f'v)^0.5/Fy</td>
                <td scope="row" class='py-2 px-4' colspan="">${r.toFixed(4)*100}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Área de acero mínimo</td>
                <td class='py-2 px-4'>.</td>
                <td class='py-2 px-4'>ρMin * b * d.</td>
                <td class='py-2 px-4'>${a.toFixed(2)} cm².</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th scope="row" class="text-xm py-2 px-4 text-left" colspan="2">
                    2.2. CÁLCULO DEL ÁREA
                </th>
                <td scope="row" colspan="2">
                    (MÉTODO CUADRÁTICO)
                </td>
            </tr>      
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Bloque comprimido</td>
                <td class='py-2 px-4'>a</td>
                <td class='py-2 px-4'>d - (d² - (2 * mu) / (0.85 * 0.9 * fc * b))^0.5</td>
                <td class='py-2 px-4'>${s.toFixed(2)} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Área de acero calculado</td>
                <td class='py-2 px-4'>As</td>
                <td class='py-2 px-4'>mu / (0.9 * fy * (d - a / 2))</td>
                <td class='py-2 px-4'>${c.toFixed(2)} cm²</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th scope="row" class="text-xm py-2 px-4 text-left" colspan="4">
                    2.3. VERIFICACIÓN
                </th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>¿Usar acero mínimo?</td>
                <td class='py-2 px-4'>Asmin</td>
                <td class='py-2 px-4'>(condicional)</td>
                <td class='py-2 px-4'>${c>a?"OK":"NO"}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Área de acero máximo</td>
                <td class='py-2 px-4'>As</td>
                <td class='py-2 px-4'>max(Asmin, As)</td>
                <td class='py-2 px-4'>${v.toFixed(2)} cm²/m</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th scope="row" class="text-xm py-2 px-4 text-left" colspan="4">
                    2.4. DISTRIBUCIÓN DEL ACERO
                </th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Área del acero a usar</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4'>Seleccione</td>
                <td class='py-2 px-4'>
                    <select class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="areaAcero" name="areaAcero">
                        <option value="0.28">6mm</option>
                        <option value="0.5">8mm</option>
                        <option value="0.71">3/8"</option>
                        <option value="1.13">12mm</option>
                        <option value="1.29">1/2"</option>
                        <option value="2">5/8"</option>
                        <option value="2.85" selected>3/4"</option>
                        <option value="5.07">1"</option>
                        <option value="10.06">1 3/8"</option>
                    </select>
                </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Cantidad de barras</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4'>Ingrese valor</td>
                <td class='py-2 px-4'>
                    <input type="number" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="barras" name="barras" placeholder="barras" value="1"/> barra(s)
                </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Área de acero total a usar</td>
                <td class='py-2 px-4'>As</td>
                <td class='py-2 px-4'>áreaAcero * cantidad barras</td>
                <td class='py-2 px-4' id="asC">${p} cm²</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Entonces</td>          
                <td class='py-2 px-4'></td>          
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4' id="then" contenteditable="true">${f} Φ ${g} @ ${y}</td>        
            </tr>`,document.getElementById("resultadoflexion").innerHTML=l,k(),w()}t();function d(){var r=5,a=.53*o*n*Math.sqrt(i)/1e3;m=.85*a;var s=m>r?"OK":"ESTÁ MAL",c=.28,F=5,L=.0018*F*100,M=25;e=`       
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="row">Peralte efectivo</th>
                <th class='py-2 px-4' scope="row">d</th>
                <th class='py-2 px-4' scope="row">t - 3</th>
                <th class='py-2 px-4' scope="row">${o} cm</th>
            </tr>  
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Fuerza cortante última</td>
                <td class='py-2 px-4'>Vu</td>
                <td class='py-2 px-4'>Ingrese valor</td>
                <td class='py-2 px-4'><input type="number" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="vuin" name="vuin" value="5"/> tn </td>          
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th  class="text-xm py-2 px-4 text-left" colspan="4">3.2. APORTE DEL CONCRETO</th>
            </tr>        
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Resistencia del concreto a corte</td>
                <td class='py-2 px-4'>Vc</td>
                <td class='py-2 px-4'>(0.53 * d * b * (f'c)^0.5) / 1000</td>
                <td class='py-2 px-4'>${a.toFixed(2)} tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Resistencia nominal del concreto a corte</td>
                <td class='py-2 px-4'>ΦVc</td>
                <td class='py-2 px-4'>0.85 * vc</td>
                <td class='py-2 px-4'>${m.toFixed(2)} tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4' colspan='4'>Verificamos</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4'>Vc &gt; Vu</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4' class="upperCase" id="rverif2">${s}</td>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-xm py-2 px-4 text-left" colspan="4"> 3.3. ACERO MÍNIMO POR TEMPERATURA</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Estribo a usar</td>
                <td class='py-2 px-4'>Seleccione</td>
                <td class='py-2 px-4'>
                <select class="form-group w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md"" id="areaAcero2" name="areaAcero2">
                    <option value="0.28" selected>6mm</option>
                    <option value="0.5">8mm</option>
                    <option value="0.71">3/8"</option>
                    <option value="1.13">12mm</option>
                    <option value="1.29">1/2"</option>
                    <option value="2">6/8"</option>
                    <option value="2.85">3/4"</option>
                    <option value="5.07">1"</option>
                    <option value="10.06">1 3/8"</option>
                </select>
                </td class='py-2 px-4'>
                <td class='py-2 px-4' id="areaA2Text">
                ${c} cm²
                </td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Espesor</td>
                <td class='py-2 px-4'>e</td>
                <td class='py-2 px-4'>Seleccione</td>
                <td class='py-2 px-4'> <input type="number" class="form-control w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 px-1 rounded-md" id="ein" name="ein" value="5"/> cm² </td>          
            </tr>        
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Área del acero mínimo</td>
                <td class='py-2 px-4'>As</td>
                <td class='py-2 px-4'>0.0018 * e * 100</td>
                <td class='py-2 px-4' id="asT">${L.toFixed(2)} cm²</td>
            </tr>        
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Separación entre barras</td>
                <td class='py-2 px-4'>S</td>
                <td class='py-2 px-4'>(condicional)</td>
                <td class='py-2 px-4' id="seo">${M} cm</td>
            </tr>`,document.getElementById("resuladocorte").innerHTML=e,I(),C(),A()}d()}const k=()=>{var e=document.getElementById("areaAcero");e.addEventListener("change",function(l){var t=parseFloat(this.value);g=this.options[this.selectedIndex].text;var d=parseInt(document.getElementById("barras").value);p=t*d,y=Math.round(p*n/v);var r=document.getElementById("asC");r.innerHTML=`${p} cm²`,document.getElementById("then").innerHTML=`${d} Φ ${g} @ ${y}`})};function w(){var e=document.getElementById("barras");e.addEventListener("input",function(l){var t=parseInt(this.value),d=document.getElementById("areaAcero"),r=parseFloat(d.value);g=d.options[d.selectedIndex].text,p=t*r;var a=document.getElementById("asC");a.innerHTML=`${p} cm²`,y=Math.round(p*n/v),document.getElementById("then").innerHTML=`${t} Φ ${g} @ ${y}`})}function I(){var e=document.getElementById("areaAcero2");e.addEventListener("change",function(d){var t=parseFloat(this.value),d=parseFloat(document.getElementById("ein").value),r=.0018*d*100,a=document.getElementById("asT");a.innerHTML=`${r.toFixed(2)} cm²`;var s=document.getElementById("areaA2Text");s.innerHTML=`${t} cm²`,document.getElementById("seo").innerHTML=`${t*100/r>25?25:(t/r).toFixed(2)} cm`})}function C(){var e=document.getElementById("ein");e.addEventListener("input",function(l){var t=parseInt(this.value),d=.0018*t*100,r=document.getElementById("asT");r.innerHTML=`${d.toFixed(2)} cm²`;var a=document.getElementById("areaAcero2"),s=parseFloat(a.value);document.getElementById("seo").innerHTML=`${s*100/d>25?25:(s/d).toFixed(2)} cm`})}function A(){var e=document.getElementById("vuin");e.addEventListener("input",function(l){var t=parseInt(this.value),d=m>t?"OK":"ESTÁ MAL",r=document.getElementById("rverif2");r.innerHTML=d})}document.getElementById("btn_pdf_predim").addEventListener("click",function(){$("#losas_macizas").printThis({debug:!1,importCSS:!0,importStyle:!0,loadCSS:"",pageTitle:"Vigas GN",removeInline:!1,printDelay:333,header:null,footer:null,base:!1,formValues:!0,canvas:!1,doctypeString:"<!DOCTYPE html>",removeScripts:!1,copyTagClasses:!1})});const B=async()=>{const e=document.getElementById("btn_captura_resultado"),l=document.getElementById("desingcorte");if(!l||!l.innerHTML.trim()){alert("Primero debes generar los resultados.");return}try{e.disabled=!0,e.classList.add("opacity-50","cursor-not-allowed"),e.textContent="Generando...",l.style.width="100%",l.style.overflow="visible";const t=await T(l,{scale:3,useCORS:!0,backgroundColor:"#ffffff",logging:!1,scrollX:0,scrollY:-window.scrollY,windowWidth:document.documentElement.scrollWidth,windowHeight:document.documentElement.scrollHeight,onclone:a=>{const s=a.getElementById("losas_macizas");s&&(s.style.margin="0",s.style.padding="0",s.style.height="auto",s.style.backgroundColor="#ffffff",s.style.color="#000000"),a.body.style.margin="0",a.body.style.padding="0",a.body.style.backgroundColor="#ffffff"}}),d=2,r=Math.ceil(t.height/d);for(let a=0;a<d;a++){const s=document.createElement("canvas");s.width=t.width,s.height=r,s.getContext("2d").drawImage(t,0,a*r,t.width,r,0,0,t.width,r);const c=document.createElement("a");c.href=s.toDataURL("image/png"),c.download=`Losas_Macizas_Parte_${a+1}.png`,c.click()}}catch(t){console.error("Error al generar la captura:",t),alert("Ocurrió un error al generar la imagen.")}finally{e.disabled=!1,e.classList.remove("opacity-50","cursor-not-allowed"),e.textContent="Generar IMG"}};document.getElementById("btn_captura_resultado").addEventListener("click",B)});
