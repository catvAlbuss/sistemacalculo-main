import"./printThis-eR5fzPta.js";document.addEventListener("DOMContentLoaded",function(){var m=0,n=0,b=0,p=0,u=0,l=0,v=0,f=1,o=2.85*f,y=21,i='3/4"',h=document.getElementById("datosForm"),g=0;h.addEventListener("submit",function(e){e.preventDefault(),m=parseFloat(document.getElementById("fy").value),n=parseFloat(document.getElementById("fc").value),b=parseFloat(document.getElementById("t").value),p=parseFloat(document.getElementById("b").value),u=parseFloat(document.getElementById("mu").value);var d="";g=0,d=`
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Esfuerzo de fluencia del acero</td>
                  <td class='py-2 px-4' colspan="2">Fy</td>
                  <td class='py-2 px-4' id="fyVal">${m.toFixed(2)} kg/cm²</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Esfuerzo a compresion del concreto</td>
                  <td class='py-2 px-4' colspan="2">f'c</td>
                  <td class='py-2 px-4' id="fcVal">${n.toFixed(2)} kg/cm²</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Espesor de la losa</td>
                  <td class='py-2 px-4' colspan="2">t</td>
                  <td class='py-2 px-4' id="tVal">${b.toFixed(2)} cm</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Ancho de análisis</td>
                  <td class='py-2 px-4' colspan="2">b</td>
                  <td class='py-2 px-4' id="bVal">${p.toFixed(2)} cm</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Momento Último</td>
                  <td class='py-2 px-4' colspan="2">Mu </td>
                  <td class='py-2 px-4' id="muVal">${u.toFixed(2)} kg-cm</td>
              </tr>`,document.getElementById("resultadosiniciales").innerHTML=d,E()});function E(){var e="",d="";l=b-3;function s(){const a=.7*Math.sqrt(n)/m,r=a*p*l;var c=l-Math.pow(Math.pow(l,2)-2*u/(.85*.9*n*p),.5),x=u/(.9*m*(l-c/2));v=Math.max(x,r),d=`
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td scope="row" class='py-2 px-4'> Peralte efectivo </td>
                <td scope="row" class='py-2 px-4'>
                    d
                </td>
                <td scope="row" class='py-2 px-4'>
                    t - 3
                </td>
                <td scope="row" class='py-2 px-4'>
                    ${l} cm
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
                <td scope="row" class='py-2 px-4' colspan="">${a.toFixed(4)*100}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Área de acero mínimo</td>
                <td class='py-2 px-4'>.</td>
                <td class='py-2 px-4'>ρMin * b * d.</td>
                <td class='py-2 px-4'>${r.toFixed(2)} cm².</td>
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
                <td class='py-2 px-4'>${c.toFixed(2)} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Área de acero calculado</td>
                <td class='py-2 px-4'>As</td>
                <td class='py-2 px-4'>mu / (0.9 * fy * (d - a / 2))</td>
                <td class='py-2 px-4'>${x.toFixed(2)} cm²</td>
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
                <td class='py-2 px-4'>${x>r?"OK":"NO"}</td>
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
                <td class='py-2 px-4' id="asC">${o} cm²</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Entonces</td>          
                <td class='py-2 px-4'></td>          
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4' id="then" contenteditable="true">${f} Φ ${i} @ ${y}</td>        
            </tr>`,document.getElementById("resultadoflexion").innerHTML=d,k(),I()}s();function t(){var a=5,r=.53*l*p*Math.sqrt(n)/1e3;g=.85*r;var c=g>a?"OK":"ESTÁ MAL",x=.28,C=5,T=.0018*C*100,B=25;e=`       
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="row">Peralte efectivo</th>
                <th class='py-2 px-4' scope="row">d</th>
                <th class='py-2 px-4' scope="row">t - 3</th>
                <th class='py-2 px-4' scope="row">${l} cm</th>
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
                <td class='py-2 px-4'>${r.toFixed(2)} tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Resistencia nominal del concreto a corte</td>
                <td class='py-2 px-4'>ΦVc</td>
                <td class='py-2 px-4'>0.85 * vc</td>
                <td class='py-2 px-4'>${g.toFixed(2)} tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4' colspan='4'>Verificamos</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4'>Vc &gt; Vu</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4' class="upperCase" id="rverif2">${c}</td>
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
                ${x} cm²
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
                <td class='py-2 px-4' id="asT">${T.toFixed(2)} cm²</td>
            </tr>        
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Separación entre barras</td>
                <td class='py-2 px-4'>S</td>
                <td class='py-2 px-4'>(condicional)</td>
                <td class='py-2 px-4' id="seo">${B} cm</td>
            </tr>`,document.getElementById("resuladocorte").innerHTML=e,w(),A(),F()}t()}const k=()=>{var e=document.getElementById("areaAcero");e.addEventListener("change",function(d){var s=parseFloat(this.value);i=this.options[this.selectedIndex].text;var t=parseInt(document.getElementById("barras").value);o=s*t,y=Math.round(o*p/v);var a=document.getElementById("asC");a.innerHTML=`${o} cm²`,document.getElementById("then").innerHTML=`${t} Φ ${i} @ ${y}`})};function I(){var e=document.getElementById("barras");e.addEventListener("input",function(d){var s=parseInt(this.value),t=document.getElementById("areaAcero"),a=parseFloat(t.value);i=t.options[t.selectedIndex].text,o=s*a;var r=document.getElementById("asC");r.innerHTML=`${o} cm²`,y=Math.round(o*p/v),document.getElementById("then").innerHTML=`${s} Φ ${i} @ ${y}`})}function w(){var e=document.getElementById("areaAcero2");e.addEventListener("change",function(t){var s=parseFloat(this.value),t=parseFloat(document.getElementById("ein").value),a=.0018*t*100,r=document.getElementById("asT");r.innerHTML=`${a.toFixed(2)} cm²`;var c=document.getElementById("areaA2Text");c.innerHTML=`${s} cm²`,document.getElementById("seo").innerHTML=`${s*100/a>25?25:(s/a).toFixed(2)} cm`})}function A(){var e=document.getElementById("ein");e.addEventListener("input",function(d){var s=parseInt(this.value),t=.0018*s*100,a=document.getElementById("asT");a.innerHTML=`${t.toFixed(2)} cm²`;var r=document.getElementById("areaAcero2"),c=parseFloat(r.value);document.getElementById("seo").innerHTML=`${c*100/t>25?25:(c/t).toFixed(2)} cm`})}function F(){var e=document.getElementById("vuin");e.addEventListener("input",function(d){var s=parseInt(this.value),t=g>s?"OK":"ESTÁ MAL",a=document.getElementById("rverif2");a.innerHTML=t})}document.getElementById("btn_pdf_predim").addEventListener("click",function(){$("#losas_macizas").printThis({debug:!1,importCSS:!0,importStyle:!0,loadCSS:"",pageTitle:"Vigas GN",removeInline:!1,printDelay:333,header:null,footer:null,base:!1,formValues:!0,canvas:!1,doctypeString:"<!DOCTYPE html>",removeScripts:!1,copyTagClasses:!1})})});
