import "print-this";
import html2canvas from "html2canvas";

document.addEventListener("DOMContentLoaded", function () {
  /* Variables globales */
  var fy = 0;
  var fc = 0;
  var t = 0;
  var b = 0;
  var mu = 0;
  var d = 0;

  var asFinal = 0;

  /* Valores iniciales del select */
  var barras = 1;
  var asSelect = 2.85 * barras;
  var resDA = 21.0;
  var textSelect = '3/4"';

  // Formulario
  var form = document.getElementById("datosForm");
  var phivc = 0;

  // Event listener para el evento 'submit'
  form.addEventListener("submit", function (event) {
    // Evita que el formulario se envíe de forma predeterminada
    event.preventDefault();

    // Valores form
    fy = parseFloat(document.getElementById("fy").value); // kg/m²
    fc = parseFloat(document.getElementById("fc").value); // kg/m²
    t = parseFloat(document.getElementById("t").value); // cm
    b = parseFloat(document.getElementById("b").value); // cm
    mu = parseFloat(document.getElementById("mu").value); // kg-cm

    /*document.getElementById('fyVal').innerHTML = `${fy.toFixed(2)} kg/cm²`;
        document.getElementById('fcVal').innerHTML = `${fc.toFixed(2)} kg/cm²`;
        document.getElementById('tVal').innerHTML = `${t.toFixed(2)} cm`;
        document.getElementById('bVal').innerHTML = `${b.toFixed(2)} cm`;
        document.getElementById('muVal').innerHTML = `${mu.toFixed(2)} kg-cm`;*/
    // corte val
    //var reqData = document.getElementById('reqData');
    //reqData.style.display = 'block';

    var resultsF = "";
    phivc = 0;

    resultsF = `
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Esfuerzo de fluencia del acero</td>
                  <td class='py-2 px-4' colspan="2">Fy</td>
                  <td class='py-2 px-4' id="fyVal">${fy.toFixed(2)} kg/cm²</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Esfuerzo a compresion del concreto</td>
                  <td class='py-2 px-4' colspan="2">f'c</td>
                  <td class='py-2 px-4' id="fcVal">${fc.toFixed(2)} kg/cm²</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Espesor de la losa</td>
                  <td class='py-2 px-4' colspan="2">t</td>
                  <td class='py-2 px-4' id="tVal">${t.toFixed(2)} cm</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Ancho de análisis</td>
                  <td class='py-2 px-4' colspan="2">b</td>
                  <td class='py-2 px-4' id="bVal">${b.toFixed(2)} cm</td>
              </tr>
              <tr class="bg-gray-100 dark:bg-gray-600">
                  <td class='py-2 px-4' colspan="1">Momento Último</td>
                  <td class='py-2 px-4' colspan="2">Mu </td>
                  <td class='py-2 px-4' id="muVal">${mu.toFixed(2)} kg-cm</td>
              </tr>`;
    document.getElementById("resultadosiniciales").innerHTML = resultsF;

    /* var resultado = inputValue * 2; */
    realizarCalculos();
  });

  function realizarCalculos() {
    var resultDC = "";
    var resultDF = "";
    /* const diametroBarraRefuerzo = 1.27; // cm (№5) */
    /*  const recMinimo = 2.5; // cm (según ACI 318) */
    /* const rec = diametroBarraRefuerzo / 2 + recMinimo; */
    // rec = 1.27 / 2 + 2.5 = 3.135 cm
    /* distancia efectiva "d" */
    d = t - 3;

    /* Diseño por flexión */
    function flexDesing() {
      // Convertir unidades
      const Fy_kg_cm2 = fy / 10000; // Convertir de kg/m² a kg/cm²
      const fc_kg_cm2 = fc / 10000; // Convertir de kg/m² a kg/cm²
      const Mu_kg_m = mu / 100; // Convertir de kg-cm a kg-m

      // Calcular cuantía de refuerzo (ρ_min)
      /* const rho_min = (0.7 * Math.sqrt(fc_kg_cm2)) / Fy_kg_cm2; // Porcentaje */
      const rho_min = (0.7 * Math.sqrt(fc)) / fy; // Porcentaje

      // Calcular cuantía de refuerzo (ρ)
      const rho = Mu_kg_m / (0.85 * Fy_kg_cm2 * b * t); // Porcentaje

      // Calcular área total de refuerzo (As)
      /* const As = rho * b * t; // cm² */
      const Asmin = rho_min * b * d;

      /* const a = (As * fy) / (0.85 * fc * b); */
      var a = d - Math.pow(Math.pow(d, 2) - (2 * mu) / (0.85 * 0.9 * fc * b), 0.5);
      var As = mu / (0.9 * fy * (d - a / 2));

      asFinal = Math.max(As, Asmin);

      /* Método ecuación cuadrática φ = 0.90  */
      /* Para el caso del diseño por flexión de losas macizas en una dirección, sin carga axial, el valor típico utilizado es: φ = 0.90 */
      /* As = (Mu / (φ * Fy * (d - a/2))) * b */
      /* a = As * Fy / (0.85 * f'c * b) */
      //(en tu caso, a = 1.55 cm)

      resultDF = `
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td scope="row" class='py-2 px-4'> Peralte efectivo </td>
                <td scope="row" class='py-2 px-4'>
                    d
                </td>
                <td scope="row" class='py-2 px-4'>
                    t - 3
                </td>
                <td scope="row" class='py-2 px-4'>
                    ${d} cm
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
                <td scope="row" class='py-2 px-4' colspan="">${rho_min.toFixed(4) * 100}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Área de acero mínimo</td>
                <td class='py-2 px-4'>.</td>
                <td class='py-2 px-4'>ρMin * b * d.</td>
                <td class='py-2 px-4'>${Asmin.toFixed(2)} cm².</td>
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
                <td class='py-2 px-4'>${a.toFixed(2)} cm</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Área de acero calculado</td>
                <td class='py-2 px-4'>As</td>
                <td class='py-2 px-4'>mu / (0.9 * fy * (d - a / 2))</td>
                <td class='py-2 px-4'>${As.toFixed(2)} cm²</td>
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
                <td class='py-2 px-4'>${As > Asmin ? "OK" : "NO"}</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Área de acero máximo</td>
                <td class='py-2 px-4'>As</td>
                <td class='py-2 px-4'>max(Asmin, As)</td>
                <td class='py-2 px-4'>${asFinal.toFixed(2)} cm²/m</td>
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
                <td class='py-2 px-4' id="asC">${asSelect} cm²</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Entonces</td>          
                <td class='py-2 px-4'></td>          
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4' id="then" contenteditable="true">${barras} Φ ${textSelect} @ ${resDA}</td>        
            </tr>`;
      document.getElementById("resultadoflexion").innerHTML = resultDF;
      /* document.getElementById("sepA").addEventListener("change", (evt) => {
        resDA = evt.target.value;
        document.getElementById("then").innerHTML = `${barras} Φ ${textSelect} @ ${resDA}`;
      }); */
      selectChange();
      inputChange();
    }
    flexDesing();

    /* Diseño por corte */
    function cutDesign() {
      var vu = 5;
      var vc = (0.53 * d * b * Math.sqrt(fc)) / 1000;
      phivc = 0.85 * vc;

      var verif2 = phivc > vu ? "OK" : "ESTÁ MAL";

      var areaAcero2Value = 0.28;
      var e = 5;
      var as2 = 0.0018 * e * 100;
      var seo = (areaAcero2Value * 100) / as2 > 25 ? 25 : areaAcero2Value / as2;

      resultDC = `       
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="row">Peralte efectivo</th>
                <th class='py-2 px-4' scope="row">d</th>
                <th class='py-2 px-4' scope="row">t - 3</th>
                <th class='py-2 px-4' scope="row">${d} cm</th>
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
                <td class='py-2 px-4'>${vc.toFixed(2)} tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Resistencia nominal del concreto a corte</td>
                <td class='py-2 px-4'>ΦVc</td>
                <td class='py-2 px-4'>0.85 * vc</td>
                <td class='py-2 px-4'>${phivc.toFixed(2)} tn</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4' colspan='4'>Verificamos</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4'>Vc &gt; Vu</td>
                <td class='py-2 px-4'></td>
                <td class='py-2 px-4' class="upperCase" id="rverif2">${verif2}</td>
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
                ${areaAcero2Value} cm²
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
                <td class='py-2 px-4' id="asT">${as2.toFixed(2)} cm²</td>
            </tr>        
            <tr class="bg-gray-100 dark:bg-gray-600">
                <td class='py-2 px-4'>Separación entre barras</td>
                <td class='py-2 px-4'>S</td>
                <td class='py-2 px-4'>(condicional)</td>
                <td class='py-2 px-4' id="seo">${seo} cm</td>
            </tr>`;
      document.getElementById("resuladocorte").innerHTML = resultDC;

      selectChange2();
      inputChange2();
      inputChangeVu();
    }
    cutDesign();

    // Mostrar los resultados
  }

  // Ocultar/Mostrar el formulario y ajustar el tamaño de las columnas
  const selectChange = () => {
    var areaAcero = document.getElementById("areaAcero");
    areaAcero.addEventListener("change", function (e) {
      // select value
      var value = parseFloat(this.value);
      textSelect = this.options[this.selectedIndex].text;
      // input cantidad value
      var barras = parseInt(document.getElementById("barras").value);
      asSelect = value * barras;
      resDA = Math.round((asSelect * b) / asFinal);

      var asC = document.getElementById("asC");
      asC.innerHTML = `${asSelect} cm²`;
      /* var sepA = document.getElementById("sepA");
      sepA.value = `${resDA}`; */

      document.getElementById("then").innerHTML = `${barras} Φ ${textSelect} @ ${resDA}`;
    });
  };

  function inputChange() {
    var barras = document.getElementById("barras");
    barras.addEventListener("input", function (e) {
      // input value
      var value = parseInt(this.value);
      var select = document.getElementById("areaAcero");
      // select value
      var selectValue = parseFloat(select.value);
      textSelect = select.options[select.selectedIndex].text;

      asSelect = value * selectValue;
      var asC = document.getElementById("asC");
      asC.innerHTML = `${asSelect} cm²`;

      resDA = Math.round((asSelect * b) / asFinal);
      /* var sepA = document.getElementById("sepA");
      sepA.value = `${resDA}`; */

      document.getElementById("then").innerHTML = `${value} Φ ${textSelect} @ ${resDA}`;
    });
  }

  function selectChange2() {
    var areaAcero = document.getElementById("areaAcero2");
    areaAcero.addEventListener("change", function (e) {
      // select value
      var value = parseFloat(this.value);
      // input cantidad value
      var e = parseFloat(document.getElementById("ein").value);
      var as2 = 0.0018 * e * 100;

      var asC = document.getElementById("asT");
      asC.innerHTML = `${as2.toFixed(2)} cm²`;

      var areaA2Text = document.getElementById("areaA2Text");
      areaA2Text.innerHTML = `${value} cm²`;

      document.getElementById("seo").innerHTML = `${(value * 100) / as2 > 25 ? 25 : (value / as2).toFixed(2)} cm`;
    });
  }

  function inputChange2() {
    var e = document.getElementById("ein");
    e.addEventListener("input", function (e) {
      // input value
      var value = parseInt(this.value);
      var as2 = 0.0018 * value * 100;

      var asC = document.getElementById("asT");
      asC.innerHTML = `${as2.toFixed(2)} cm²`;

      var select = document.getElementById("areaAcero2");
      // select value
      var selectValue = parseFloat(select.value);

      document.getElementById("seo").innerHTML = `${
        (selectValue * 100) / as2 > 25 ? 25 : (selectValue / as2).toFixed(2)
      } cm`;
    });
  }

  function inputChangeVu() {
    var vu = document.getElementById("vuin");
    vu.addEventListener("input", function (e) {
      // input value
      var value = parseInt(this.value);

      var verif2 = phivc > value ? "OK" : "ESTÁ MAL";

      var rverif2 = document.getElementById("rverif2");
      rverif2.innerHTML = verif2;
    });
  }

  document.getElementById("btn_pdf_predim").addEventListener("click", function () {
    // Selecciona el div que quieres imprimir
    $("#losas_macizas").printThis({
      debug: false, // Mostrar la ventana de depuración
      importCSS: true, // Importar estilos CSS
      importStyle: true, // Importar estilos directamente desde las etiquetas <style>
      loadCSS: "", // Ruta al CSS adicional si lo necesitas
      pageTitle: "Vigas GN", // Título de la página impresa
      removeInline: false, // No eliminar los estilos en línea
      printDelay: 333, // Añadir un pequeño retraso antes de la impresión
      header: null, // HTML que aparecerá como encabezado en la impresión
      footer: null, // HTML que aparecerá como pie de página en la impresión
      base: false, // Usar la URL base para las rutas
      formValues: true, // Conservar los valores de los formularios
      canvas: false, // Incluir el contenido de los canvas
      doctypeString: "<!DOCTYPE html>", // Doctype de la impresión
      removeScripts: false, // No eliminar las etiquetas <script>
      copyTagClasses: false, // No copiar las clases de las etiquetas HTML
    });
  });

  const capturarTabla = async () => {
    const btn = document.getElementById("btn_captura_resultado");
    const elemento = document.getElementById("resultadosiniciales");

    if (!elemento || elemento.innerHTML.trim() === "") {
      alert("Primero debes generar los resultados.");
      return;
    }
    try {
      // Deshabilitar botón durante el proceso
      btn.disabled = true;
      btn.classList.add("opacity-50", "cursor-not-allowed");
      btn.textContent = "Generando...";

      // Guardar estilos originales
      const estiloOriginal = elemento.style.cssText;

      // Asegurar que todo el contenido sea visible
      elemento.style.width = "100%";
      elemento.style.overflow = "visible";

      const opciones = {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        onclone: (doc) => {
          const el = doc.getElementById("losas_macizas");
          if (el) {
            el.style.margin = "0";
            el.style.padding = "0";
            el.style.height = "auto";
            el.style.backgroundColor = "#ffffff";
            el.style.color = "#000000";
          }

          doc.body.style.margin = "0";
          doc.body.style.padding = "0";
          doc.body.style.backgroundColor = "#ffffff";
        },
      };

      // Capturar
      const canvas = await html2canvas(elemento, opciones);

      // 🔥 AQUÍ HACEMOS LA DIVISIÓN
      const partes = 2;
      const ancho = canvas.width;
      const altoTotal = canvas.height;
      const altoParte = Math.ceil(altoTotal / partes);

      const ahora = new Date();
      const fecha = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(
        ahora.getDate(),
      ).padStart(2, "0")}_${String(ahora.getHours()).padStart(2, "0")}-${String(ahora.getMinutes()).padStart(
        2,
        "0",
      )}-${String(ahora.getSeconds()).padStart(2, "0")}`;

      for (let i = 0; i < partes; i++) {
        const canvasParte = document.createElement("canvas");
        const ctx = canvasParte.getContext("2d");

        canvasParte.width = ancho;
        canvasParte.height = altoParte;

        ctx.drawImage(
          canvas,
          0,
          i * altoParte, // origen en canvas original
          ancho,
          altoParte, // tamaño a cortar
          0,
          0, // destino
          ancho,
          altoParte,
        );

        const dataUrl = canvasParte.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `Losas_Macisas_Parte_${i + 1}_de_2-${fecha}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error al generar la captura:", error);
      alert("Ocurrió un error al generar la imagen.");
    } finally {
      // ✅ RESTAURAR EL BOTÓN SOLO AQUÍ
      btn.disabled = false;
      btn.classList.remove("opacity-50", "cursor-not-allowed");
      btn.textContent = "Generar IMG";
    }
  }

  document.getElementById("btn_captura_resultado").addEventListener("click", capturarTabla);
});