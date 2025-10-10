document.addEventListener("DOMContentLoaded", async () => {
  let mode = "light";
  let svg, xAxis, yAxis, path, points;
  let x, y; // Declare scales globally

  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  function updateMode(event) {
    mode = event.matches ? "dark" : "light";
    if (svg) updateChart();
  }

  prefersDarkScheme.addListener(updateMode);
  updateMode(prefersDarkScheme);

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 600 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  function calculopuntosmuros(H, e) {
    // Datos de los puntos en X
    var punto1x = 0;
    var punto2x = 0.7 * H;
    var punto3x = 0.7 * H;
    var punto4x = (0.7 * H) / 3 + H / 10;
    var punto5x = (0.7 * H) / 3 + H / 10;
    var punto6x = (0.7 * H) / 3 + H / 10 - e;
    var punto7x = (0.7 * H) / 3;
    var punto8x = 0;
    var punto9x = 0;

    //Datos de los4puntos en 4
    var punto1y = 0;
    var punto2y = 0;
    var punto3y = H / 10;
    var punto4y = H / 10;
    var punto5y = H / 10 + H;
    var punto6y = H / 10 + H;
    var punto7y = H / 10;
    var punto8y = H / 10;
    var punto9y = 0;
    return [
      [
        { x: punto1x, y: punto1y },
        { x: punto2x, y: punto2y },
        { x: punto3x, y: punto3y },
        { x: punto4x, y: punto4y },
        { x: punto5x, y: punto5y },
        { x: punto6x, y: punto6y },
        { x: punto7x, y: punto7y },
        { x: punto8x, y: punto8y },
        { x: punto9x, y: punto9y },
      ],
    ];
  }

  function createChart() {
    svg = d3
      .select("#predimsMC")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    xAxis = svg.append("g").attr("transform", `translate(0,${height})`).attr("class", "x-axis");

    yAxis = svg.append("g").attr("class", "y-axis");

    path = svg.append("path").attr("fill", "none").attr("stroke-width", 1.5);

    updateChart();
  }

  function updateChart() {
    const H = parseFloat(document.getElementById("H").value);
    const e = parseFloat(document.getElementById("e").value);

    const dataPredims = calculopuntosmuros(H, e);
    const data = dataPredims[0];

    x.domain([0, d3.max(data, (d) => d.x) * 1.8]);
    y.domain([0, d3.max(data, (d) => d.y) * 1.1]);

    xAxis.call(d3.axisBottom(x));
    yAxis.call(d3.axisLeft(y));

    const line = d3
      .line()
      .x((d) => x(d.x))
      .y((d) => y(d.y));

    path.datum(data).attr("d", line);

    points = svg.selectAll(".point").data(data);

    points
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("r", 3)
      .merge(points)
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y));

    points.exit().remove();

    const backgroundColor = mode === "dark" ? "#1b1e23" : "white";
    const textColor = mode === "dark" ? "white" : "#1b1e23";
    const lineColor = mode === "dark" ? "lightsteelblue" : "steelblue";

    d3.select("body").style("background-color", backgroundColor);
    svg.style("color", textColor);
    xAxis.style("color", textColor);
    yAxis.style("color", textColor);
    path.attr("stroke", lineColor);
    points.attr("fill", lineColor);
  }

  createChart();

  // Add event listeners to inputs
  document.getElementById("H").addEventListener("input", updateChart);
  document.getElementById("e").addEventListener("input", updateChart);
  const inputdf = parseFloat(document.getElementById("df").value);
  const inputh = parseFloat(document.getElementById("H").value);
  const inputanguloIn = parseFloat(document.getElementById("angterr").value);
  const inpute = parseFloat(document.getElementById("e").value);
  const inputB1 = parseFloat(document.getElementById("b1").value);
  const inputHd = parseFloat(document.getElementById("hd").value);
  const considerar = document.getElementById("considerar").value;

  $("#cimientosControler").submit((e) => {
    e.preventDefault();
    //Valores de precion de suelo
    let considerar = document.getElementById("considerar").value;
    let inpute = parseFloat(document.getElementById("e").value);
    let inputgc = parseFloat(document.getElementById("gc").value);
    let inputgs = parseFloat(document.getElementById("gs").value);
    let inputtet = parseFloat(document.getElementById("tet").value);
    let inputz = parseFloat(document.getElementById("z").value);
    let inputd = parseFloat(document.getElementById("d").value);
    let inputSC = parseFloat(document.getElementById("SC").value);
    let inpuths = parseFloat(document.getElementById("hs").value);

    // Calcular y mostrar la primera tabla
    let tablaCalculadaHTML = calcularPrimerCuadro(considerar, inputgs, inputtet, inputd, inpuths, inputka);
    let tbody1 = document.getElementById("primerTabla");
    tbody1.innerHTML = tablaCalculadaHTML;
  });
  document.getElementById("H").addEventListener("input", capturarCambios);

  $("#graficar").click((e) => {
    const contenedor = document.getElementById("table_General");
    const contenedortext = document.getElementById("text_graf");
    const contenedorgrafico = document.getElementById("contenedorGrafico1");
    const contenedorgrafico1 = document.getElementById("contendor_MC");

    contenedor.style.display = "block";
    contenedorgrafico.style.display = "block";
    contenedorgrafico1.style.display = "block";
    contenedortext.style.display = "block";

    document.getElementById("df").addEventListener("input", capturarCambios);
    document.getElementById("H").addEventListener("input", capturarCambios);
    document.getElementById("angterr").addEventListener("input", capturarCambios);
    document.getElementById("e").addEventListener("input", capturarCambios);
    document.getElementById("b1").addEventListener("input", capturarCambios);

    document.getElementById("hd").addEventListener("input", capturarCambios);
    document.getElementById("considerar").addEventListener("input", capturarCambios);

    document.getElementById("gc").addEventListener("input", capturarCambios);
    document.getElementById("gs").addEventListener("input", capturarCambios);
    document.getElementById("tet").addEventListener("input", capturarCambios);
    document.getElementById("z").addEventListener("input", capturarCambios);
    document.getElementById("d").addEventListener("input", capturarCambios);
    document.getElementById("SC").addEventListener("input", capturarCambios);
    document.getElementById("hs").addEventListener("input", capturarCambios);

    // document.getElementById('considerar').addEventListener('input', graficoMurosContencion);
    document.getElementById("b1graf").addEventListener("input", capturarCambios);
    document.getElementById("hzgraf").addEventListener("input", capturarCambios);
    // document.getElementById('hprgraf').addEventListener('input', capturarCambios);
    document.getElementById("egraf").addEventListener("input", capturarCambios);
    document.getElementById("epgraf").addEventListener("input", capturarCambios);
    document.getElementById("b2graf").addEventListener("input", capturarCambios);
    document.getElementById("zonaok").addEventListener("input", capturarCambios);
    document.getElementById("kvran").addEventListener("input", capturarCambios);

    document.getElementById("ubicacion").addEventListener("input", capturarCambios);
    document.getElementById("dentelloncorr").addEventListener("input", capturarCambios);
    document.getElementById("consDes").addEventListener("input", capturarCambios);

    document.getElementById("ubicacioncon").addEventListener("input", capturarCambios);
    document.getElementById("dentelloncons").addEventListener("input", capturarCambios);
    document.getElementById("consDescons").addEventListener("input", capturarCambios);
    document.getElementById("desing").addEventListener("input", capturarCambios);

    //=======================================Diseño de Concreto Armado
    document.getElementById("fy").addEventListener("input", capturarCambios);
    document.getElementById("fc").addEventListener("input", capturarCambios);
    document.getElementById("acer").addEventListener("input", capturarCambios);
    document.getElementById("numbarras").addEventListener("input", capturarCambios);
    document.getElementById("acertrans").addEventListener("input", capturarCambios);
    document.getElementById("porpocion").addEventListener("input", capturarCambios);
    document.getElementById("acerclibre").addEventListener("input", capturarCambios);
    document.getElementById("lpr").addEventListener("input", capturarCambios);
    document.getElementById("corteA").addEventListener("input", capturarCambios);
    //==========================================DISEÑO POR FLEXION=================================
    document.getElementById("acerpun").addEventListener("input", capturarCambios);
    document.getElementById("numbarrapun").addEventListener("input", capturarCambios);
    //================================================Talon=========================================//
    document.getElementById("DF").addEventListener("input", capturarCambios);
    document.getElementById("aceroLs").addEventListener("input", capturarCambios);
    document.getElementById("numbarrasls").addEventListener("input", capturarCambios);

    //============================================DISEÑO PUNTA ACERO LONGITUDINAL================
    document.getElementById("acertranspun").addEventListener("input", capturarCambios);
    document.getElementById("porpocionpun").addEventListener("input", capturarCambios);
    //==========================================CARA LIBRE====================================
    document.getElementById("acerclibrepun").addEventListener("input", capturarCambios);
    //==========================================DIS A LS====================================
    document.getElementById("aceroLspun").addEventListener("input", capturarCambios);
    document.getElementById("numbarraslspun").addEventListener("input", capturarCambios);
    //=========================================DISEÑO CA TALON==================================
    document.getElementById("acertal").addEventListener("input", capturarCambios);
    document.getElementById("numbarratal").addEventListener("input", capturarCambios);
    document.getElementById("acertranstal").addEventListener("input", capturarCambios);
    document.getElementById("porpociontal").addEventListener("input", capturarCambios);
    document.getElementById("acerclibretal").addEventListener("input", capturarCambios);

    document.getElementById("Longitud").addEventListener("input", capturarCambios);
    document.getElementById("LTal").addEventListener("input", capturarCambios);

    //========================================DISEÑO DEL KEY======================================
    document.getElementById("aceroKey").addEventListener("input", capturarCambios);
    document.getElementById("numbarraKey").addEventListener("input", capturarCambios);
    document.getElementById("acerotransKey").addEventListener("input", capturarCambios);
    document.getElementById("porpocionKey").addEventListener("input", capturarCambios);
    document.getElementById("aceroCLkey").addEventListener("input", capturarCambios);
    capturarCambios();
  });

  function capturarCambios() {
    // Capturar los valores actualizados de los campos de entrada
    let inputdf = parseFloat(document.getElementById("df").value);
    let inputh = parseFloat(document.getElementById("H").value);
    let inputanguloIn = parseFloat(document.getElementById("angterr").value);

    var inputHd = parseFloat(document.getElementById("hd").value);
    let considerar = document.getElementById("considerar").value;
    let inpute = parseFloat(document.getElementById("e").value);
    let inputgc = parseFloat(document.getElementById("gc").value);
    let inputgs = parseFloat(document.getElementById("gs").value);
    let inputtet = parseFloat(document.getElementById("tet").value);
    let inputz = parseFloat(document.getElementById("z").value);
    let inputd = parseFloat(document.getElementById("d").value);
    let inputSC = parseFloat(document.getElementById("SC").value);
    let inpuths = parseFloat(document.getElementById("hs").value);

    //=========================================================================
    const b1graf = parseFloat(document.getElementById("b1graf").value);
    const hzgraf = parseFloat(document.getElementById("hzgraf").value);
    // const hprgraf = parseFloat(document.getElementById('hprgraf').value);
    const egraf = parseFloat(document.getElementById("egraf").value);
    const epgraf = parseFloat(document.getElementById("epgraf").value);
    const b2graf = parseFloat(document.getElementById("b2graf").value);
    const inpzonaok = parseFloat(document.getElementById("zonaok").value);
    const kvran = parseFloat(document.getElementById("kvran").value);

    //=============================================================KEY CON Y SIN
    let ubicacion = parseFloat(document.getElementById("ubicacion").value);
    let dentelloncorr = parseFloat(document.getElementById("dentelloncorr").value);
    let consDes = document.getElementById("consDes").value;

    let ubicacioncon = parseFloat(document.getElementById("ubicacioncon").value);
    let dentelloncons = parseFloat(document.getElementById("dentelloncons").value);
    let consDescons = document.getElementById("consDescons").value;

    let desing = document.getElementById("desing").value;

    //==================================Diseño de concreto armado ========================
    let fy = parseFloat(document.getElementById("fy").value);
    let fc = parseFloat(document.getElementById("fc").value);

    //=================================ACEROS Y NOMBRES=========================
    var acerValue = document.getElementById("acer").value;
    var selectedIndexAcer = document.getElementById("acer").selectedIndex;
    var acerName = document.getElementById("acer").options[selectedIndexAcer].text;
    var acer = parseFloat(acerValue);
    let numbarras = parseFloat(document.getElementById("numbarras").value);

    var acertransValue = document.getElementById("acertrans").value;
    var selectedIndexAcertrans = document.getElementById("acertrans").selectedIndex;
    var acertransName = document.getElementById("acertrans").options[selectedIndexAcertrans].text;
    var acertrans = parseFloat(acertransValue);
    let porpocion = parseFloat(document.getElementById("porpocion").value);

    //==================================CAIDA LIBRE=============================
    var acerclibrevalue = document.getElementById("acerclibre").value;
    var selectedIndexAcercLibre = document.getElementById("acerclibre").selectedIndex;
    var acercLibreName = document.getElementById("acerclibre").options[selectedIndexAcercLibre].text;
    var acerclibre = parseFloat(acerclibrevalue);

    //================================DISEÑO POR CORTE===========================
    let lpr = parseFloat(document.getElementById("lpr").value);
    let corteA = parseFloat(document.getElementById("corteA").value);
    //=================================DISEÑO POR FLEXION==============================0
    let DF = parseFloat(document.getElementById("DF").value);
    var aceroLSvalue = document.getElementById("aceroLs").value;
    var selectedIndexAceroLS = document.getElementById("aceroLs").selectedIndex;
    var aceroLsName = document.getElementById("aceroLs").options[selectedIndexAceroLS].text;
    var aceroLs = parseFloat(aceroLSvalue);
    let numbarrasls = parseFloat(document.getElementById("numbarrasls").value);
    //=============================DISEÑO DE PUNTA=======================================
    var aceropunvalue = document.getElementById("acerpun").value;
    var selectedIndexAceropun = document.getElementById("acerpun").selectedIndex;
    var aceropunName = document.getElementById("acerpun").options[selectedIndexAceropun].text;
    var aceropun = parseFloat(aceropunvalue);
    let numbarraspun = parseFloat(document.getElementById("numbarrapun").value);
    //==========================DISTIBUCION DEL ACERO TRANSVERSAL=============================
    var aceropuntransvalue = document.getElementById("acertranspun").value;
    var selectedIndexAceropuntrans = document.getElementById("acertranspun").selectedIndex;
    var aceropuntransName = document.getElementById("acertranspun").options[selectedIndexAceropuntrans].text;
    var aceropuntrans = parseFloat(aceropuntransvalue);
    let porpocionpun = parseFloat(document.getElementById("porpocionpun").value);
    //====================================CARA LIBRE=======================================
    var aceropunclibrevalue = document.getElementById("acerclibrepun").value;
    var selectedIndexAceropunclibre = document.getElementById("acerclibrepun").selectedIndex;
    var aceropunclibreName = document.getElementById("acerclibrepun").options[selectedIndexAceropunclibre].text;
    var aceropunclibre = parseFloat(aceropunclibrevalue);

    //==================================DISTIBUCION DEL ACERO LONGITUDINAL SECUNDARIO PUNTA=======================
    var acerolspunvalue = document.getElementById("aceroLspun").value;
    var selectedIndexAcerolspun = document.getElementById("aceroLspun").selectedIndex;
    var acerolspunName = document.getElementById("aceroLspun").options[selectedIndexAcerolspun].text;
    var acerolspun = parseFloat(acerolspunvalue);
    let numbarraslspun = parseFloat(document.getElementById("numbarraslspun").value);
    //====================================DISEÑO CA TALON=========================================================
    var aceroalpvalue = document.getElementById("acertal").value;
    var selectedIndexAceroalp = document.getElementById("acertal").selectedIndex;
    var aceroalpName = document.getElementById("acertal").options[selectedIndexAceroalp].text;
    var aceroalp = parseFloat(aceroalpvalue);
    let numbarratal = parseFloat(document.getElementById("numbarratal").value);

    var acerodatvalue = document.getElementById("acertranstal").value;
    var selectedIndexAcerodat = document.getElementById("acertranstal").selectedIndex;
    var acerodatpName = document.getElementById("acertranstal").options[selectedIndexAcerodat].text;
    var aceroadat = parseFloat(acerodatvalue);
    let porpociondat = parseFloat(document.getElementById("porpociontal").value);

    var aceroCLvalue = document.getElementById("acerclibretal").value;
    var selectedIndexAceroCL = document.getElementById("acerclibretal").selectedIndex;
    var aceroCLpName = document.getElementById("acerclibretal").options[selectedIndexAceroCL].text;
    var aceroaCL = parseFloat(aceroCLvalue);
    //===============================================LONGITUD-TALON====================================
    let Longitud = parseFloat(document.getElementById("Longitud").value);
    let LTal = parseFloat(document.getElementById("LTal").value);

    //================================================DC KEY Aceros y inputs=============================
    // Capturar el valor y el nombre de aceroKey
    var aceroKey = document.getElementById("aceroKey").value;
    var selectedIndexAceroKey = document.getElementById("aceroKey").selectedIndex;
    var aceroKeyName = document.getElementById("aceroKey").options[selectedIndexAceroKey].text;

    // Capturar el valor de numbarraKey
    let numbarraKey = parseFloat(document.getElementById("numbarraKey").value);

    // Capturar el valor y el nombre de acerotransKey
    var acerotransKey = document.getElementById("acerotransKey").value;
    var selectedIndexAcerotransKey = document.getElementById("acerotransKey").selectedIndex;
    var acerotransKeyName = document.getElementById("acerotransKey").options[selectedIndexAcerotransKey].text;

    // Capturar el valor de porpocionKey
    let porpocionKey = parseFloat(document.getElementById("porpocionKey").value);

    // Capturar el valor y el nombre de aceroCLkey
    var aceroCLKey = document.getElementById("aceroCLkey").value;
    var selectedIndexAceroCLkey = document.getElementById("aceroCLkey").selectedIndex;
    var aceroCLKeyName = document.getElementById("aceroCLkey").options[selectedIndexAceroCLkey].text;

    // Llamar a la función verificacionsinefectoS con los valores capturados actualizados
    consinsismo(
      inputh,
      inputdf,
      inputanguloIn,
      inputHd,
      inputSC,
      inputz,
      considerar,
      inpzonaok,
      kvran,
      inpute,
      inpuths,
      inputd,
      inputtet,
      inputgs,
      inputgc,
      b1graf,
      b2graf,
      hzgraf,
      egraf,
      epgraf,
      ubicacion,
      dentelloncorr,
      consDes,
      ubicacioncon,
      dentelloncons,
      consDescons,
      desing,
      fc,
      fy,
      acer,
      acerName,
      numbarras,
      acertrans,
      acertransName,
      porpocion,
      acerclibre,
      acercLibreName,
      lpr,
      DF,
      aceroLsName,
      aceroLs,
      numbarrasls,
      aceropunName,
      aceropun,
      numbarraspun,
      aceropuntransName,
      aceropuntrans,
      porpocionpun,
      aceropunclibreName,
      aceropunclibre,
      acerolspunName,
      acerolspun,
      numbarraslspun,
      corteA,
      aceroalpName,
      aceroalp,
      numbarratal,
      acerodatpName,
      aceroadat,
      porpociondat,
      aceroCLpName,
      aceroaCL,
      Longitud,
      LTal,
      aceroKey,
      aceroKeyName,
      numbarraKey,
      acerotransKey,
      acerotransKeyName,
      porpocionKey,
      aceroCLKey,
      aceroCLKeyName
    );
  }
  function consinsismo(
    inputh,
    inputdf,
    inputanguloIn,
    inputHd,
    inputSC,
    inputz,
    considerar,
    inpzonaok,
    kvran,
    inpute,
    inpuths,
    inputd,
    inputtet,
    inputgs,
    inputgc,
    b1graf,
    b2graf,
    hzgraf,
    egraf,
    epgraf,
    ubicacion,
    dentelloncorr,
    consDes,
    ubicacioncon,
    dentelloncons,
    consDescons,
    desing,
    fc,
    fy,
    acer,
    acerName,
    numbarras,
    acertrans,
    acertransName,
    porpocion,
    acerclibre,
    acercLibreName,
    lpr,
    DF,
    aceroLsName,
    aceroLs,
    numbarrasls,
    aceropunName,
    aceropun,
    numbarraspun,
    aceropuntransName,
    aceropuntrans,
    porpocionpun,
    aceropunclibreName,
    aceropunclibre,
    acerolspunName,
    acerolspun,
    numbarraslspun,
    corteA,
    aceroalpName,
    aceroalp,
    numbarratal,
    acerodatpName,
    aceroadat,
    porpociondat,
    aceroCLpName,
    aceroaCL,
    Longitud,
    LTal,
    aceroKey,
    aceroKeyName,
    numbarraKey,
    acerotransKey,
    acerotransKeyName,
    porpocionKey,
    aceroCLKey,
    aceroCLKeyName
  ) {
    // Aquí realiza los cálculos necesarios con los parámetros recibidos y genera la tabla HTML
    let datos = [
      ["si", inputh + dentelloncorr],
      ["no", inputh],
    ];
    // Índice de la columna que quieres obtener (2 en este caso)
    let indiceColumna = 2;
    // Función para buscar el valor correspondiente a "SI" o "NO" en los datos
    function buscarV(considerar, datos, indiceColumna) {
      // Recorre los datos para encontrar el valor buscado
      for (let i = 0; i < datos.length; i++) {
        // Compara el primer elemento de cada fila con el valor buscado
        if (datos[i][0] === considerar) {
          // Si se encuentra el valor, devuelve el valor correspondiente en la columna indicada
          return datos[i][indiceColumna - 1];
        }
      }
      // Si el valor no se encuentra, devuelve null o algún otro valor predeterminado
      return null;
    }
    // Llamada a la función buscarV con el valor de considerar
    let Hsuel = buscarV(considerar, datos, indiceColumna);

    var radteta = (inputtet * Math.PI) / 180;
    // console.log('radio de teta ' + radteta);

    var radd = (inputd * Math.PI) / 180;
    //console.log('radio de d ' + radd);
    // Cálculos
    let cosPhi = Math.cos(radteta);
    let cosd = Math.cos(radd);
    let cosPhi2 = Math.pow(Math.cos(radteta), 2);
    let cosd2 = Math.pow(Math.cos(radd), 2);

    let result1_firstPart = cosd - Math.pow(cosd2 - cosPhi2, 0.5);
    let result1_secondPart = cosd + Math.pow(cosd2 - cosPhi2, 0.5);

    let result2_firstPart = cosd + Math.pow(cosd2 - cosPhi2, 0.5);
    let result2_secondPart = cosd - Math.pow(cosd2 - cosPhi2, 0.5);

    let ka = (cosd * result1_firstPart) / result1_secondPart;
    let kp = (cosd * result2_firstPart) / result2_secondPart;

    // var kak = (1 - Math.sin(radteta)) / (1 + Math.sin(radteta));

    // var kpk = (Math.pow(Math.tan((45 * Math.PI / 180) + (radteta / 2)), 2));//(Math.pow((Math.tan(45 + (parseFloat(inputtet) / 2))), 2));

    let RequestDesing = `
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Desplante</th>
                <th class='py-2 px-4' scope="col">Df</th>
                <td class='py-2 px-4 text-center' scope="col">${inputdf}</td>
                <td class='py-2 px-4' scope="col">m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Altura</th>
                <th class='py-2 px-4' scope="col">H</th>
                <td class='py-2 px-4 text-center' scope="col">${inputh}</td>
                <td class='py-2 px-4' scope="col">m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Espesor</th>
                <th class='py-2 px-4' scope="col">e</th>
                <td class='py-2 px-4 text-center' scope="col">${inpute}</td>
                <td class='py-2 px-4' scope="col">m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Angulo de Inclinacion</th>
                <th class='py-2 px-4' scope="col">ϕ</th>
                <td class='py-2 px-4 text-center' scope="col">${inputanguloIn}</td>
                <td class='py-2 px-4' scope="col">°</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">MONONOBE-OKABE?</th>
                <th class='py-2 px-4' scope="col">-</th>
                <td class='py-2 px-4 text-center' scope="col">${inpzonaok}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Kv esta en el rango de 0.3-0.6 Kh</th>
                <th class='py-2 px-4' scope="col">-</th>
                <td class='py-2 px-4 text-center' scope="col">${kvran}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Peso especifico del concreto</th>
                <th class='py-2 px-4' scope="col">Yc</th>
                <td class='py-2 px-4 text-center' scope="col">${inputgc}</td>
                <td class='py-2 px-4' scope="col">Tn/m<sup>3</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Peso especifico del suelo</th>
                <th class='py-2 px-4' scope="col">Ys</th>
                <td class='py-2 px-4 text-center' scope="col">${inputgs}</td>
                <td class='py-2 px-4' scope="col">Tn/m<sup>3</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Angulo friccion del suelo</th>
                <th class='py-2 px-4' scope="col">Ø</th>
                <td class='py-2 px-4 text-center' scope="col">${inputtet}</td>
                <td class='py-2 px-4' scope="col">°</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Cohesion</th>
                <th class='py-2 px-4' scope="col">z</th>
                <td class='py-2 px-4 text-center' scope="col">${inputz}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Angulo de Talud</th>
                <th class='py-2 px-4' scope="col">d</th>
                <td class='py-2 px-4 text-center' scope="col">${inputd}</td>
                <td class='py-2 px-4' scope="col">°</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Sobrecarga</th>
                <th class='py-2 px-4' scope="col">S/C</th>
                <td class='py-2 px-4 text-center' scope="col">${inputSC}</td>
                <td class='py-2 px-4' scope="col">Tn/m<sup>2</sup></td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Altura de la sobrecarga</th>
                <th class='py-2 px-4' scope="col">hs</th>
                <td class='py-2 px-4 text-center' scope="col">${inpuths}</td>
                <td class='py-2 px-4' scope="col">m</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Factor de empuje activo</th>
                <th class='py-2 px-4' scope="col">ka</th>
                <td class='py-2 px-4 text-center' scope="col">${ka.toFixed(4)}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">factor de empuje pasivo</th>
                <th class='py-2 px-4' scope="col">kp</th>
                <td class='py-2 px-4 text-center' scope="col">${kp.toFixed(4)}</td>
                <td class='py-2 px-4' scope="col">-</td>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600"><th scope="col" colspan="6"></th></tr>
            `;

    let requesitoPrincipal = document.getElementById("Requisitodesing");
    requesitoPrincipal.innerHTML = RequestDesing;

    var smaxsuel = inputgs * parseFloat(ka) * Hsuel;

    var psuel = (Hsuel * smaxsuel) / 2;

    var pbsuel = psuel * Math.sin(radd);

    var pisuel = psuel * Math.cos(radd);

    //S/C
    var smaxSC = inputgs * ka * inpuths;

    var pSC = parseFloat(Hsuel) * parseFloat(smaxSC);

    var pbSC = parseFloat(pSC * Math.sin(radd));

    var piSC = pSC * Math.cos(radd);

    //total
    var totalH = Hsuel + inpuths;

    var totalsmax = parseFloat(parseFloat(smaxsuel) + parseFloat(smaxSC));

    var totalp = psuel + pSC;

    var totalpv = pbsuel + pbSC;

    var totalph = parseFloat(pisuel + piSC);

    // =================================DISEÑO DE REQUISITOS DE DISEÑOS=============================//
    let tablaCalculadaHTML = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Altura del muro</th>
                    <th class='py-2 px-4' scope="col">H</th>
                    <td class='py-2 px-4 text-center'>${Hsuel.toFixed(2)} m</td>
                    <td class='py-2 px-4 text-center'>${inpuths.toFixed(2)} m</td>
                    <td class='py-2 px-4'>${totalH.toFixed(2)} m</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Peso del suelo</th>
                    <th class='py-2 px-4' scope="col" colspan="0">sMAX</th>
                    <td class='py-2 px-4 text-center'>${smaxsuel.toFixed(2)} Tn/m<sup>3</sup></td>
                    <td class='py-2 px-4 text-center'>${smaxSC.toFixed(2)} Tn/m<sup>3</sup></td>
                    <td class='py-2 px-4'>${totalsmax.toFixed(2)} Tn/m<sup>3</sup></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Peso propio del muro</th>
                    <th class='py-2 px-4' scope="col" colspan="0">P</th>
                    <td class='py-2 px-4 text-center'>${psuel.toFixed(2)} Tn</td>
                    <td class='py-2 px-4 text-center'>${pSC.toFixed(2)} Tn</td>
                    <td class='py-2 px-4'>${totalp.toFixed(2)} Tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Presion vertical</th>
                    <th class='py-2 px-4' scope="col" colspan="0">Pv</th>
                    <td class='py-2 px-4 text-center'>${pbsuel.toFixed(2)} Tn</td>
                    <td class='py-2 px-4 text-center'>${pbSC.toFixed(2)} Tn</td>
                    <td class='py-2 px-4'>${totalpv.toFixed(2)} Tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Presion horizontal</th>
                    <th class='py-2 px-4' scope="col" colspan="0">Ph</th>
                    <td class='py-2 px-4 text-center'>${pisuel.toFixed(2)} Tn</td>
                    <td class='py-2 px-4 text-center'>${piSC.toFixed(2)} Tn</td>
                    <td class='py-2 px-4'>${totalph.toFixed(2)} tn</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600"><th scope="col" colspan="6"></th></tr>`;
    let tbody1 = document.getElementById("primerTabla");
    tbody1.innerHTML = tablaCalculadaHTML;

    //=======================================PRIMERA TABLA=======================================//
    var altTras = egraf + epgraf;

    var basem = b1graf + altTras + b2graf;

    var radteta = (inputtet * Math.PI) / 180;

    var radd = (inputd * Math.PI) / 180;

    var comAr = b1graf * b1graf * 0.5 * Math.tan(radd);

    var comAr2 = b1graf * inputh;

    var comAr3 = (inpuths * b1graf) / Math.cos(radd);

    var comAr4 = basem * hzgraf;

    var comAr5 = epgraf * inputh * 0.5;

    var comAr6 = egraf * inputh;
    //AREA
    var compes1 = comAr * inputgs;
    var compes2 = comAr2 * inputgs;
    var compes3 = comAr3 * inputgs;
    var compes4 = comAr4 * inputgc;
    var compes5 = comAr5 * inputgc;
    var compes6 = comAr6 * inputgc;

    //BRAZO
    var combraz1 = (2 * b1graf) / 3 + b2graf + altTras;
    var combraz2 = b1graf / 2 + altTras + b2graf;
    var combraz3 = combraz2;
    var combraz4 = basem / 2;
    var combraz5 = (2 * epgraf) / 3 + b2graf;
    var combraz6 = egraf / 2 + epgraf + b2graf;

    //MOMENTO
    var commonet1 = compes1 * combraz1;
    var commonet2 = compes2 * combraz2;
    var commonet3 = compes3 * combraz3;
    var commonet4 = compes4 * combraz4;
    var commonet5 = compes5 * combraz5;
    var commonet6 = compes6 * combraz6;

    var totalpeso =
      parseFloat(compes1) +
      parseFloat(compes2) +
      parseFloat(compes3) +
      parseFloat(compes4) +
      parseFloat(compes5) +
      parseFloat(compes6);
    var totalMomneto =
      parseFloat(commonet1) +
      parseFloat(commonet2) +
      parseFloat(commonet3) +
      parseFloat(commonet4) +
      parseFloat(commonet5) +
      parseFloat(commonet6);

    var AreaConcreto = parseFloat(comAr4) + parseFloat(comAr5) + parseFloat(comAr6);
    var pesoConcreto = parseFloat(compes4) + parseFloat(compes5) + parseFloat(compes6);

    //-----primer columna
    var mvsuelo = parseFloat(totalpv) * (basem - b1graf);
    // var mvsuelo = totalpv * (basem - b1graf);
    var totalsuelo = parseFloat(totalMomneto) + parseFloat(mvsuelo);
    //----segunda columna
    var mhsuelo = parseFloat(pisuel) * (parseFloat(inputh) / 3);

    var mhsc = piSC * (inputh / 2);

    var mhtotal = parseFloat(mhsuelo) + parseFloat(mhsc);

    //----- fs
    var fs = (totalsuelo / mhtotal).toFixed(2);

    var verificacionVolteo = "";
    if (fs < 2) {
      var verificacionVolteo = "NO";
    } else {
      var verificacionVolteo = "OK";
    }

    let verfsinefec = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">1</th>
                    <td class='py-2 px-4'>${comAr.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes1.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz1.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet1.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO TALUD</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">2</th>
                    <td class='py-2 px-4'>${comAr2.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes2.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz2.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet2.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">3</th>
                    <td class='py-2 px-4'>${comAr3.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes3.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz3.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet3.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO S/C</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">4</th>
                    <td class='py-2 px-4'>${comAr4.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes4.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz4.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet4.toFixed(2)}</td>
                    <td class='py-2 px-4'>BASE</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">5</th>
                    <td class='py-2 px-4'>${comAr5.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes5.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz5.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet5.toFixed(2)}</td>
                    <td class='py-2 px-4'>CUÑA</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">6</th>
                    <td class='py-2 px-4'>${comAr6.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes6.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz6.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet6.toFixed(2)}</td>
                    <td class='py-2 px-4'>PANTALLA</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col"></th>
                    <td class='py-2 px-4 text-right'>N=</td>
                    <td class='py-2 px-4'>${totalpeso.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right'>Mr=</td>
                    <td class='py-2 px-4'>${totalMomneto.toFixed(2)}</td>
                    <td class='py-2 px-4'></td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">Area del concreto</th>
                    <td class='py-2 px-4'>${AreaConcreto.toFixed(2)} m<sup>2</sup></td>
                    <td class='py-2 px-4 text-right'></td>
                    <td class='py-2 px-4'>${pesoConcreto.toFixed(2)} tn/m</td>
                    <td class='py-2 px-4'></td>
                </tr>
            `;

    let verfsinvolteo = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6"></th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-lg py-2 px-4 text-left" scope="col" colspan="6">3.1.1 Verificacion por volteo sin sismo</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente (muro + terreno)</th>
                    <th class='py-2 px-4' scope="col">Mr</th>
                    <td class='py-2 px-4'>${totalMomneto.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento vertical debido a la presion</th>
                    <th class='py-2 px-4' scope="col">Mv</th>
                    <td class='py-2 px-4'>${mvsuelo.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                    <th class='py-2 px-4' scope="col">mv Total</th>
                    <td class='py-2 px-4'>${totalsuelo.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento horizontal debido a la presion de suelo</th>
                    <th class='py-2 px-4' scope="col">MhSUELO</th>
                    <td class='py-2 px-4'>${mhsuelo.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento horizontal debido a la sobrecarga</th>
                    <th class='py-2 px-4' scope="col">MhS/C</th>
                    <td class='py-2 px-4'>${mhsc.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente verical total</th>
                    <th class='py-2 px-4' scope="col">MhTOTAL</th>
                    <td class='py-2 px-4'>${mhtotal.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                    <th class='py-2 px-4' scope="col">F.S.=</th>
                    <th class='py-2 px-4' scope="col">${fs}</th>
                    <th class='py-2 px-4' scope="col">${verificacionVolteo}</th>
                </tr>
            `;
    var u = Math.tan(radteta);

    var rv = parseFloat(totalpeso) + parseFloat(totalpv);

    var fr = parseFloat(rv) * parseFloat(u);

    var fsdeslizamiento = fr / totalph;

    var verificacionDeslizamiento = "";
    if (fsdeslizamiento < 1.5) {
      var verificacionDeslizamiento = "NO";
    } else {
      var verificacionDeslizamiento = "OK";
    }
    //Formulas Matematicas verificacion por volteo con sismo
    const AZTdeflex = "ΔZT = λΔ * Δzm * λΔ * Δz30 + ΔzL";

    let verfdesliza = `
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th scope="col" colspan="6"></th>
            </tr>
            <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                <th class="text-lg py-2 px-4 text-left" scope="col" colspan="6">3.1.2 Verificacion por deslizamiento sin sismo</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Peso total del muro + terreno apoyado</th>
                <th class='py-2 px-4' scope="col">N</th>
                <td class='py-2 px-4'>${totalpeso.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col">Tn</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Presion vertical del terreno</th>
                <th class='py-2 px-4' scope="col">PVtotal</th>
                <td class='py-2 px-4'>${totalpv.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col">Tn</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                <th class='py-2 px-4' scope="col">Rv</th>
                <td class='py-2 px-4'>${rv.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col">Tn</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Coeficiente de friccion</th>
                <th class='py-2 px-4' scope="col">µ</th>
                <td class='py-2 px-4'>${u.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col"></th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                <th class='py-2 px-4' scope="col">Fr=</th>
                <td class='py-2 px-4'>${fr.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col">Tn</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Presion horizontal</th>
                <th class='py-2 px-4' scope="col">ph Total=</th>
                <td class='py-2 px-4'>${totalph.toFixed(2)}</td>
                <th class='py-2 px-4' scope="col">Tn</th>
            </tr>
            <tr class="bg-gray-100 dark:bg-gray-600">
                <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                <th class='py-2 px-4' scope="col">F.S.=</th>
                <th class='py-2 px-4' scope="col">${fsdeslizamiento.toFixed(2)}</th>
                <th class='py-2 px-4' scope="col">${verificacionDeslizamiento}</th>
            </tr>
            `;

    //==============================================================================//
    //===========================VERIFICACION CON SISMO=============================//

    let verfconefec = `
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
                    <td class='py-2 px-4'>${comAr.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes1.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz1.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet1.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO TALUD</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">2</th>
                    <td class='py-2 px-4'>${comAr2.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes2.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz2.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet2.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">3</th>
                    <td class='py-2 px-4'>${comAr3.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes3.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz3.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet3.toFixed(2)}</td>
                    <td class='py-2 px-4'>SUELO S/C</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">4</th>
                    <td class='py-2 px-4'>${comAr4.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes4.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz4.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet4.toFixed(2)}</td>
                    <td class='py-2 px-4'>BASE</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">5</th>
                    <td class='py-2 px-4'>${comAr5.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes5.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz5.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet5.toFixed(2)}</td>
                    <td class='py-2 px-4'>CUÑA</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col">6</th>
                    <td class='py-2 px-4'>${comAr6.toFixed(2)}</td>
                    <td class='py-2 px-4'>${compes6.toFixed(2)}</td>
                    <td class='py-2 px-4'>${combraz6.toFixed(2)}</td>
                    <td class='py-2 px-4'>${commonet6.toFixed(2)}</td>
                    <td class='py-2 px-4'>PANTALLA</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col"></th>
                    <td class='py-2 px-4' class="text-right">N=</td>
                    <td class='py-2 px-4'>${totalpeso.toFixed(2)}</td>
                    <td class='py-2 px-4' class="text-right">Mr=</td>
                    <td class='py-2 px-4'>${totalMomneto.toFixed(2)}</td>
                     <th class='py-2 px-4' scope="col"></th>
                </tr>
            `;
    //==================MONONOBE-OKABE=======================================
    let khmonok = 0;
    switch (inpzonaok) {
      case 0.4:
        khmonok = inpzonaok / 2;
        break;
      case 0.3:
        khmonok = inpzonaok / 2;
        break;
      case 0.15:
        khmonok = inpzonaok / 2;
        break;
      default:
        khmonok = 0;
        break;
    }

    var teta = Math.atan(khmonok / (1 - kvran));

    var grados = Math.round(teta * (180 / Math.PI));

    //=======================================================================
    var A = Math.sin(radteta + radd);
    var B = Math.sin(radteta - teta - 0);
    var C = Math.cos(0 + radd + teta);
    var D = Math.cos(0 + 0);
    var E = Math.cos(radteta - teta - 0);
    var F = Math.cos(teta) * Math.cos(0) * Math.cos(0) * Math.cos(0 + radd + teta);

    var totalLet = Math.pow((A * B) / (C * D), 0.5);
    var Y = Math.pow(1 + totalLet, 2);
    var kae = (E * E) / (Y * F);
    var eae = 0.5 * inputgs * (1 - kvran) * kae * inputh * inputh;
    var ea = 0.5 * inputgs * ka * inputh * inputh;
    var deae = eae - ea;
    var hposicion = inputh * 0.6;
    var Mae = deae * hposicion;
    var mhtotalcon = parseFloat(mhtotal) + parseFloat(Mae);
    var fscon = totalsuelo / mhtotalcon;

    var verfconVolteo = "";
    if (fscon < 1.2) {
      var verfconVolteo = "NO";
    } else {
      var verfconVolteo = "OK";
    }

    let verfsinvolteoconsismo = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6"></th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">3.2.1 Verificacion por volteo con sismo</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente (muro + terreno)</th>
                    <th class='py-2 px-4' scope="col">Mr</th>
                    <td class='py-2 px-4'>${totalMomneto.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento vertical debido a la presion</th>
                    <th class='py-2 px-4' scope="col">Mv</th>
                    <td class='py-2 px-4'>${mvsuelo.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                    <th class='py-2 px-4' scope="col">mv Total</th>
                    <td class='py-2 px-4'>${totalsuelo.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento horizontal debido a la presion de suelo</th>
                    <th class='py-2 px-4' scope="col">MhSUELO</th>
                    <td class='py-2 px-4'>${mhsuelo.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento horizontal debido a la sobrecarga</th>
                    <th class='py-2 px-4' scope="col">MhS/C</th>
                    <td class='py-2 px-4'>${mhsc.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3"></th>
                    <th class='py-2 px-4' scope="col">MqTOTAL</th>
                    <td class='py-2 px-4'>${Mae.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento resistente verical total</th>
                    <th class='py-2 px-4' scope="col">MhTOTAL</th>
                    <td class='py-2 px-4'>${mhtotalcon.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                    <th class='py-2 px-4' scope="col">F.S.</th>
                    <th class='py-2 px-4' scope="col">${fscon.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${verfconVolteo}</th>
                </tr>
            `;

    //=============DESLIZAMIENTO CON SISMO===================
    var phtotalcon = (parseFloat(deae) + parseFloat(totalph)).toFixed(2);

    var fsdeslizamientocon = (parseFloat(fr) / parseFloat(phtotalcon)).toFixed(2);

    var verfcondeslizamiento = fsdeslizamientocon < 1.2 ? "NO" : "OK";
    // if (fsdeslizamientocon < 1.2) {
    //     var verfcondeslizamiento = "NO";
    // } else {
    //     var verfcondeslizamiento = "OK";
    // }

    let verfcondesliza = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6"></th>
                </tr>
                 <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="4">3.2.2. Verificacion por deslizamiento con sismo</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Peso total del muro + terreno apoyado</th>
                    <th class='py-2 px-4' scope="col">N</th>
                    <td class='py-2 px-4'>${totalpeso.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Presion vertical del terreno</th>
                    <th class='py-2 px-4' scope="col">PVtotal</th>
                    <td class='py-2 px-4'>${totalpv.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                    <th class='py-2 px-4' scope="col">Rv</th>
                    <td class='py-2 px-4'>${rv.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Coeficiente de friccion</th>
                    <th class='py-2 px-4' scope="col">µ</th>
                    <td class='py-2 px-4'>${u.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                    <th class='py-2 px-4' scope="col">Fr</th>
                    <td class='py-2 px-4'>${fr.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3"></th>
                    <th class='py-2 px-4' scope="col">Pq</th>
                    <td class='py-2 px-4'>${deae.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Presion horizontal total</th>
                    <th class='py-2 px-4' scope="col">Ph total</th>
                    <td class='py-2 px-4'>${phtotalcon}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                    <th class='py-2 px-4' scope="col">F.S.</th>
                    <th class='py-2 px-4' scope="col">${fsdeslizamientocon}</th>
                    <th class='py-2 px-4' scope="col">${verfcondeslizamiento}</th>
                </tr>
                <tr class="text-center" colspan="6"></tr>
            `;

    //================================KEY=========================================//
    //============================CONDICIONALES==================================//
    // Función para mostrar u ocultar los elementos según la condición
    function mostrarOcultarTabla(condicion) {
      // Obtiene los elementos de la cabecera y el cuerpo de la tabla
      const thead = $(".tabla-oculta");
      const tbody = $(".tabla-ocultabody");

      // Muestra u oculta los elementos según la condición
      if (condicion === "si") {
        // Si la condición es 'si', muestra los elementos
        thead.show(); // Muestra la cabecera
        tbody.show(); // Muestra el cuerpo de la tabla
      } else {
        // Si la condición no es 'si', oculta los elementos
        thead.hide(); // Oculta la cabecera
        tbody.hide(); // Oculta el cuerpo de la tabla
      }
    }

    var FSISMO = 0;
    switch (considerar) {
      case "si":
        // Llama a la función para mostrar los elementos
        mostrarOcultarTabla(considerar);

        var Area = (altTras * dentelloncorr).toFixed(2);
        var Peso = (parseFloat(Area) * parseFloat(inputgc)).toFixed(2);

        let brazo = ubicacion;

        let momento = brazo * Peso;

        var mvprtotal = momento + totalsuelo;

        var fskey = (mvprtotal / mhtotal).toFixed(2);
        let verfkey = fskey < 2 ? "NOT" : "OK";

        var rvkey = parseFloat(Peso) + parseFloat(rv);

        var frkey = parseFloat(rvkey * u);
        var considerarse = 0;
        switch (consDes) {
          case "si":
            considerarse = Math.pow(dentelloncorr + hzgraf, 2) * inputgs * kp * 0.5;
            break;
          default:
            considerarse = 0;
            break;
        }
        var ppdes = considerarse;
        var phdes = parseFloat(totalph);
        var fskeydes = (parseFloat(frkey) + parseFloat(ppdes)) / phdes;
        let verfkeydes = fskeydes < 1.5 ? "NOT" : "OK";
        //===========================VERIFICACION DEL TERRENO==============================
        var mvveri = parseFloat(mvprtotal);
        var mhver = mhtotal;
        var emover = mvveri - mhver;
        var rvpriver = parseFloat(rvkey);

        //NUCLEO CENTRAL
        var enc = emover / rvpriver;

        var lter = (basem / 3).toFixed(2);
        var llter = (lter * 2).toFixed(2);
        let pregunta = "";
        if (enc >= lter && enc <= llter) {
          pregunta = "SI";
        } else {
          pregunta = "NO";
        }

        //============================ESFUERZOS EN LOS EXTREMOS DE LA CIMENTACION==========
        var s1 = (((4 * basem - 6 * enc) * rv) / (basem * basem)).toFixed(2);
        var s2 = (((-2 * basem + 6 * enc) * rv) / (basem * basem)).toFixed(2);

        var sADM = 12.5;
        let verfs1 = "";
        if (s1 < sADM) {
          verfs1 = "OK";
        } else {
          verfs1 = "NOT";
        }
        let verfs2 = "";
        if (s2 < sADM) {
          verfs2 = "OK";
        } else {
          verfs2 = "NOT";
        }
        //====================DIAGRAMA DE PRECIONES===ECUACHONES============================
        const dataXpre = [0, 0, basem, basem];
        const dataYpre = [0, -s1, -s2, 0];

        const dataX = [0, basem];
        const dataY = [-s1, -s2];
        var a = ((s2 - s1) / basem).toFixed(2);
        //====================ESFUERZOS DEL TERRENO PARA CALCULO DEL REFUERZO===ESFUERZOS============================
        var pantq2 = parseFloat(inputgs * ka * inputh * Math.cos(radd) + smaxSC).toFixed(2);
        var pantq1 = smaxSC;

        var puntq2 = s1;
        var puntq1 = a * b2graf + parseFloat(s1);

        var talq2 = a * b1graf + parseFloat(s1);
        var talq1 = s2;

        var talpt = (
          ((parseFloat(comAr) + parseFloat(comAr2) + parseFloat(comAr3)) * parseFloat(inputgs)) /
          parseFloat(b1graf)
        ).toFixed(2);
        var keyq2 = parseFloat(inputgs * ka * (inputh + hzgraf + dentelloncorr) * Math.cos(radd) + pantq1).toFixed(2);
        var keyq1 = parseFloat(inputgs * ka * (inputh + hzgraf) * Math.cos(radd) + pantq1).toFixed(2);

        //====================================DIMENSIONES FINALES============================
        var panes = altTras;
        var panlog = inputh;
        var panpp = parseFloat(compes5) + parseFloat(compes6);

        var punes = hzgraf;
        var punlong = b2graf;
        var puntpp = b2graf * hzgraf * inputgc;

        var tanles = hzgraf;
        var tanlong = b1graf;
        var tanpp = hzgraf * b1graf * inputgc;

        var keyes = altTras;
        var keylong = dentelloncorr;
        var keypp = Peso;
        //====================================================Key con Datos Adicionales
        var fsTotalkc = (mvprtotal / mhtotalcon).toFixed(2);
        var vkcon = "";
        if (fsTotalkc) {
          vkcon = "OK";
        } else {
          vkcon = "NOT";
        }

        var considerarconk = 0;
        switch (consDescons) {
          case "si":
            considerarconk = Math.pow(dentelloncorr + hzgraf, 2) * inputgs * kp * 0.5;
            break;

          default:
            considerarconk = 0;
            break;
        }

        var fskeydescon = ((parseFloat(frkey) + parseFloat(ppdes)) / phtotalcon).toFixed(2);
        let verfkeycon = fskeydes < 1.2 ? "NOT" : "OK";
        var Emocon = (mvveri - mhtotalcon).toFixed(2);
        //=================NUCLEO CENTRAL CON SISMO
        var econs = Emocon / rvpriver;

        let preguntakc = "";
        if (econs >= lter && econs <= llter) {
          preguntakc = "SI";
        } else {
          preguntakc = "NO";
        }

        //============================ESFUERZOS EN LOS EXTREMOS DE LA CIMENTACION==========

        var s1cons = ((4 * basem - 6 * econs) * rv) / (basem * basem);

        var s2cons = ((-2 * basem + 6 * econs) * rv) / (basem * basem);

        var tersADM = 1.3 * sADM;

        let verfcs1 = "";
        if (s1cons < sADM) {
          verfs1 = "OK";
        } else {
          verfs1 = "NOT";
        }
        let verfcs2 = "";

        if (s2cons < sADM) {
          verfs2 = "OK";
        } else {
          verfs2 = "NOT";
        }
        //====================DIAGRAMA DE PRECIONES===ECUACHONES============================
        const dataXkc = [0, basem];
        const dataYkc = [-s1cons, -s2cons];
        var akc = ((s2cons - s1cons) / basem).toFixed(2);
        //====================ESFUERZOS DEL TERRENO PARA CALCULO DEL REFUERZO===ESFUERZOS============================
        var puntq1con = akc * b2graf + parseFloat(s1cons);
        var talq2con = akc * b1graf + parseFloat(s1cons);
        FSISMO = deae;
        //=============================DIMENCIONES FINALES===========================
        var paneskcon = 0;
        var panlogkcon = 0;
        var panppkcon = parseFloat(compes5) + parseFloat(compes6);

        var puneskcon = 0;
        var punlongkcon = 0;
        var puntppkcon = 0 * 0 * inputd;

        var tanleskcon = 0;
        var tanlongkcon = 0;
        var tanppkcon = 0 * 0 * inputd;

        var keyeskcon = inputh;
        var keylongkcon = dentelloncorr;
        var keyppkcon = Peso;
        // var pantq2 = parseFloat(inputgs * ka * radd * Math.cos(radd) + smaxSC).toFixed(2);

        const tbodyKeysin = document.getElementById("keysin");
        tbodyKeysin.innerHTML = `
                         <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Area del dentellon</th>
                            <th class='py-2 px-4' scope="col">a</th>
                            <td class='py-2 px-4' id="areaValue">${Area}</td>
                            <th class='py-2 px-4' scope="col">m<sup>2</sup></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Peso del dentellon</th>
                            <th class='py-2 px-4' scope="col">p</th>
                            <td class='py-2 px-4' id="PesoValue">${Peso}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.1.-Volteo</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">Brazo</th>
                            <td class='py-2 px-4' id="braValue">${brazo}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th  class='py-2 px-4' scope="col" colspan="3"></th>
                            <th  class='py-2 px-4' scope="col">Momento</th>
                            <td  class='py-2 px-4' id="momentoValue">${momento.toFixed(2)}</td>
                            <th  class='py-2 px-4' scope="col">Tn-m</th>

                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                            <th class='py-2 px-4' scope="col">Mv'TOTAL</th>
                            <td class='py-2 px-4' id="mvprValue">${mvprtotal.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                            <th class='py-2 px-4' scope="col">F.S.</th>
                            <td class='py-2 px-4' id="fskeyValue">${fskey}</td>
                            <th class='py-2 px-4' scope="col" id="verkeyValue">${verfkey}</th>
                        </tr>

                         <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.2.- Deslizamiento</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                            <th class='py-2 px-4' scope="col">Rv</th>
                            <td class='py-2 px-4' id="rvkey">${rvkey.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                            <th class='py-2 px-4' scope="col">Fr</th>
                            <td class='py-2 px-4' id="frkey">${frkey.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Presion pasiva del suelo (solo el peralte de la zapata + key)</th>
                            <th class='py-2 px-4' scope="col">Pp</th>
                            <td class='py-2 px-4' id="ppdes">${ppdes.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>

                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Presion horizontal</th>
                            <th class='py-2 px-4' scope="col">Ph</th>
                            <td class='py-2 px-4' id="phdes">${phdes.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                            <th class='py-2 px-4' scope="col">F.S.</th>
                            <td class='py-2 px-4' id="fskeydes">${fskeydes.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col" id="verfkeydes">${verfkeydes}</th>
                        </tr>


                        <!--DATOS DE VERIFICACION POR ESFUERZO DEL TERRENO-->
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.3.- Verificacion por esfuerzo del terreno</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                            <th class='py-2 px-4' scope="col">Mv'TOTAL</th>
                            <td class='py-2 px-4' id="mvveri ">${mvveri.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento generado devido a la presion horizontal del terreno</th>
                            <th class='py-2 px-4' scope="col">Mh</th>
                            <td class='py-2 px-4' id="mhver">${parseFloat(mhver).toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">ΣMo</th>
                            <td class='py-2 px-4' id="emover">${emover.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                            <th class='py-2 px-4' scope="col">Rv'=</th>
                            <td class='py-2 px-4' id="rvpriver">${rvpriver.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>

                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.4.- Nucleo Central</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Excentricidad</th>
                            <th class='py-2 px-4' scope="col">e</th>
                            <td class='py-2 px-4' id="enc">${enc.toFixed(1)}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Tercio de la longitud</th>
                            <th class='py-2 px-4' scope="col">L/3</th>
                            <td class='py-2 px-4' id="lter">${lter}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Dos tercios de la longitud</th>
                            <th class='py-2 px-4' scope="col">2L/3</th>
                            <td class='py-2 px-4' id="llter">${llter}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">¿Esta en el tercio centrarl?</th>
                            <td class='py-2 px-4' id="pregunta">${pregunta}</td>
                            <th class='py-2 px-4' scope="col"></th>
                        </tr>

                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.1.5.- Esfuerzo en los extremos de la cimentacion</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="2">Esfuerzo del suelo</th>
                            <th class='py-2 px-4' scope="col">S1</th>
                            <td class='py-2 px-4' id="s1">${s1}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                            <td class='py-2 px-4' id="verfs1">${verfs1}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="2">Esfuerzo del suelo</th>
                            <th class='py-2 px-4' scope="col">S2</th>
                            <td class='py-2 px-4' id="s2">${s2}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                            <td class='py-2 px-4' id="verfs2">${verfs2}</td>
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
                            <td class='py-2 px-4' id="a">${a}</td>
                            <th class='py-2 px-4' scope="col">+</th>
                            <td class='py-2 px-4' id="s2">X</td>
                            <td class='py-2 px-4' id="s1graf">${s1}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4' colspan="6">
                                <div id="grafico" style="width: auto; height:300px;"></div>
                            </td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col">b</th>
                            <td class='py-2 px-4'>${s1}</td>
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col">a</th>
                            <td class='py-2 px-4'>${a}</td>
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
                            <td class='py-2 px-4' id="pantq2">${pantq2}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="pantq1">${pantq1.toFixed(2)}</td>
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
                            <td class='py-2 px-4' id="puntq2">${puntq2}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="puntq1">${puntq1.toFixed(2)}</td>
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
                            <td class='py-2 px-4' id="talq2">${talq2.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="0" class="text-center">S del suelo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="talq1">${talq1}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" class="text-center">W del suelo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">P.T.</th>
                            <td class='py-2 px-4' id="talpt">${talpt}</td>
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
                            <td class='py-2 px-4' id="keyq2">${keyq2}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="0" class="text-center">Empuje activo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="keyq1">${keyq1}</td>
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
                            <td class='py-2 px-4 text-center' id="panes">${panes}</td>
                            <td class='py-2 px-4 text-center' id="panlog">${panlog}</td>
                            <td class='py-2 px-4 text-left' id="panpp">${panpp.toFixed(2)}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Punta</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="punes">${punes}</td>
                            <td class='py-2 px-4 text-center' id="punlong">${punlong}</td>
                            <td class='py-2 px-4 text-left' id="puntpp">${puntpp}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Talon</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="tanles">${tanles}</td>
                            <td class='py-2 px-4 text-center' id="tanlong">${tanlong}</td>
                            <td class='py-2 px-4 text-left' id="tanpp">${tanpp.toFixed(2)}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Key</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="keyes">${keyes}</td>
                            <td class='py-2 px-4 text-center' id="keylong">${keylong}</td>
                            <td class='py-2 px-4 text-left' id="keypp">${keypp}</td>
                        </tr>
                        <tr class="text-center" colspan="6"></tr>
                    `;

        //==========================KEY CON
        const tbodyKeycon = document.getElementById("keycon");
        tbodyKeycon.innerHTML = `
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Area</th>
                            <th class='py-2 px-4' scope="col">a</th>
                            <td class='py-2 px-4' id="areaValue">${Area}</td>
                            <th class='py-2 px-4' scope="col">m<sup>2</sup></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Peso</th>
                            <th class='py-2 px-4' scope="col">p</th>
                            <td class='py-2 px-4' id="PesoValue">${Peso}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>

                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.1.- Volteo</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">Brazo</th>
                            <td class='py-2 px-4' id="braValue">${brazo}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">Momento</th>
                            <td class='py-2 px-4' id="momentoValue">${momento.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                            <th class='py-2 px-4' scope="col">Mv'TOTAL</th>
                            <td class='py-2 px-4' id="mvprValue">${mvprtotal.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                            <th class='py-2 px-4' scope="col">F.S.</th>
                            <td class='py-2 px-4' id="fskeyValue">${fsTotalkc}</td>
                            <th class='py-2 px-4' scope="col" id="verkeyValue">${vkcon}</th>
                        </tr>

                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.2.- Deslizamiento</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                            <th class='py-2 px-4' scope="col">Rv</th>
                            <td class='py-2 px-4' id="rvkey">${rvkey.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Fuerza resistente horizontal</th>
                            <th class='py-2 px-4' scope="col">Fr</th>
                            <td class='py-2 px-4' id="frkey">${frkey.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Presion pasiva del suelo (solo el peralte de la zapata + key)</th>
                            <th class='py-2 px-4' scope="col">Pp</th>
                            <td class='py-2 px-4' id="ppdes">${considerarconk.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Presion horizontal</th>
                            <th class='py-2 px-4' scope="col">Ph</th>
                            <td class='py-2 px-4' id="phdes">${phtotalcon}</td>
                            <th class='py-2 px-4' scope="col">Tn</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Factor de seguridad</th>
                            <th class='py-2 px-4' scope="col">F.S.</th>
                            <td class='py-2 px-4' id="fskeydes">${fskeydescon}</td>
                            <th class='py-2 px-4' scope="col" id="verfkeydes">${verfkeycon}</th>
                        </tr>


                        <!--DATOS DE VERIFICACION POR ESFUERZO DEL TERRENO-->
                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.3.- Verificacion por esfuerzo del terreno</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento resistente vertical total</th>
                            <th class='py-2 px-4' scope="col">Mv'TOTAL</th>
                            <td class='py-2 px-4' id="mvveri ">${mvveri.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Momento generado devido a la presion horizontal del terreno</th>
                            <th class='py-2 px-4' scope="col">Mh</th>
                            <td class='py-2 px-4' id="mhver">${mhtotalcon.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">ΣMo</th>
                            <td class='py-2 px-4' id="emover">${Emocon}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Resultante total vertical</th>
                            <th class='py-2 px-4' scope="col">Rv'=</th>
                            <td class='py-2 px-4' id="rvpriver">${rvpriver.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">Tn-m</th>
                        </tr>

                        <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.4.- Nucleo Central</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Excentricidad</th>
                            <th class='py-2 px-4' scope="col">e</th>
                            <td class='py-2 px-4' id="enc">${econs.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Torcion de la longitud</th>
                            <th class='py-2 px-4' scope="col">L/3</th>
                            <td class='py-2 px-4' id="lter">${lter}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3">Torcion de la longitud</th>
                            <th class='py-2 px-4' scope="col">2L/3</th>
                            <td class='py-2 px-4' id="llter">${llter}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">1.3 SADM</th>
                            <td class='py-2 px-4' id="llter">${tersADM}</td>
                            <th class='py-2 px-4' scope="col">Tn/m<sup>2</<sup></th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="3"></th>
                            <th class='py-2 px-4' scope="col">¿esta en el tercio central?</th>
                            <td class='py-2 px-4' id="pregunta">${preguntakc}</td>
                            <th class='py-2 px-4' scope="col"></th>
                        </tr>

                         <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                            <th class="text-xl py-2 px-4 text-left" colspan="6">4.2.5.- Esfuerzo en los extremos de la cimentacion</th>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="2">Esfuerzo del suelo</th>
                            <th class='py-2 px-4' scope="col">S1</th>
                            <td class='py-2 px-4' id="s1">${s1cons.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                            <td class='py-2 px-4' id="verfs1">${verfcs1}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="2">Esfuerzo del suelo</th>
                            <th class='py-2 px-4' scope="col">S2</th>
                            <td class='py-2 px-4' id="s2">${s2cons.toFixed(2)}</td>
                            <th class='py-2 px-4' scope="col">m</th>
                            <td class='py-2 px-4' id="verfs2">${verfcs2}</td>
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
                            <td class='py-2 px-4' id="a">${akc}</td>
                            <th class='py-2 px-4' scope="col">+</th>
                            <td class='py-2 px-4' id="s2">X</td>
                            <td class='py-2 px-4' id="s1graf">${s1cons.toFixed(2)}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td colspan="6" class="text-center">
                                <div id="graficokeycon" style="width: auto; height:300px;"></div>
                            </td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col">b</th>
                            <td class='py-2 px-4'>${s1cons}</td>
                            <th class='py-2 px-4' scope="col">a</th>
                            <td class='py-2 px-4'>${akc}</td>
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
                            <td class='py-2 px-4' id="pantq2">${pantq2}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="pantq1">${pantq1.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">F-sismo</th>
                            <td class='py-2 px-4'>${FSISMO.toFixed(2)}</td>
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
                            <td class='py-2 px-4' id="puntq2">${s1cons.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <td class='py-2 px-4'></td>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="puntq1">${puntq1con.toFixed(2)}</td>
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
                            <td class='py-2 px-4' id="talq2">${talq2con.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" colspan="0" class="text-center">s del suelo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="talq1">${s2cons.toFixed(2)}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4' scope="col" class="text-center">W del suelo</th>
                            <th class='py-2 px-4' scope="col" class="text-center">P.T.</th>
                            <td class='py-2 px-4' id="talpt">${talpt}</td>
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
                            <td class='py-2 px-4' id="keyq2">${keyq2}</td>
                            <td class='py-2 px-4'></td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">

                            <th class='py-2 px-4' scope="col" class="text-center">q1</th>
                            <td class='py-2 px-4' id="keyq1">${keyq1}</td>
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
                            <td class='py-2 px-4 text-center' id="panes">${paneskcon}</td>
                            <td class='py-2 px-4 text-center' id="panlog">${panlogkcon}</td>
                            <td class='py-2 px-4 text-left' id="panpp">${panppkcon.toFixed(2)}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Punta</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="punes">${puneskcon}</td>
                            <td class='py-2 px-4 text-center' id="punlong">${punlongkcon}</td>
                            <td class='py-2 px-4 text-left' id="puntpp">${puntppkcon}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Talon</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="tanles">${tanleskcon}</td>
                            <td class='py-2 px-4 text-center' id="tanlong">${tanlongkcon}</td>
                            <td class='py-2 px-4 text-left' id="tanpp">${tanppkcon.toFixed(2)}</td>
                        </tr>
                        <tr class="bg-gray-100 dark:bg-gray-600">
                            <th class='py-2 px-4 text-center' scope="col" colspan="2">Key</th>
                            <th class='py-2 px-4 text-center' scope="col"></th>
                            <td class='py-2 px-4 text-center' id="keyes">${keyeskcon}</td>
                            <td class='py-2 px-4 text-center' id="keylong">${keylongkcon}</td>
                            <td class='py-2 px-4 text-left' id="keypp">${keyppkcon}</td>
                        </tr>
                    `;

        //===================GRAFICOS KEY SIN
        const newData = [];
        for (let i = 0; i < dataXpre.length; i++) {
          if (i > 0 && dataXpre[i] === dataXpre[i - 1]) {
            const intermediatePoint = [(dataXpre[i] + dataXpre[i - 1]) / 2, (dataYpre[i] + dataYpre[i - 1]) / 2];
            newData.push(intermediatePoint);
          }
          newData.push([dataXpre[i], dataYpre[i]]);
        }
        const chartOptions1 = {
          title: {
            text: "Diagrama de presiones", // Nombre del primer gráfico
          },
          xAxis: {
            type: "category",
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              data: newData, // Usar los nuevos datos
              type: "line",
            },
          ],
        };
        // Inicializa el primer gráfico en el elemento con id 'grafpresion'
        const grafPresion = echarts.init(document.getElementById("grafpresion"));
        grafPresion.setOption(chartOptions1);

        // Configuración del segundo gráfico
        /*const chartOptions2 = {
                    title: {
                        text: 'ECUACION', // Nombre del primer gráfico
                    },
                    xAxis: {
                        type: 'category',
                        data: dataX, // Datos específicos para el segundo gráfico
                    },
                    yAxis: {
                        type: 'value',
                    },
                    series: [{
                        data: dataY, // Datos específicos para el segundo gráfico
                        type: 'line',
                    }],
                };
                // Inicializa el segundo gráfico en el elemento con id 'grafico'
                const grafico = echarts.init(document.getElementById('grafico'));
                grafico.setOption(chartOptions2);*/

        //===================GRAFICOS KEY CON SISMO
        const dataXprekc = [0, 0, basem, basem];
        const dataYprekc = [0, -s1cons, -s2cons, 0];

        let newData2 = [];
        for (let i = 0; i < dataXprekc.length; i++) {
          if (i > 0 && dataXprekc[i] === dataXprekc[i - 1]) {
            // Añadir un punto intermedio si los valores de X son iguales
            let intermediatePoint = [(dataXprekc[i] + dataXprekc[i - 1]) / 2, (dataYprekc[i] + dataYprekc[i - 1]) / 2];
            newData2.push(intermediatePoint);
          }
          newData2.push([dataXprekc[i], dataYprekc[i]]);
        }
        const chartOptions11 = {
          title: {
            text: "Diagrama de presiones", // Nombre del primer gráfico
          },
          xAxis: {
            type: "category",
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              data: newData2, // Usar los nuevos datos
              type: "line",
            },
          ],
        };

        // Inicializa el primer gráfico en el elemento con id 'grafpresion'
        const grafPresion1 = echarts.init(document.getElementById("grafpresionkeycon"));
        grafPresion1.setOption(chartOptions11);
        // Configuración del segundo gráfico
        const chartOptions12 = {
          title: {
            text: "ECUACION", // Nombre del primer gráfico
          },
          xAxis: {
            type: "category",
            data: dataXkc, // Datos específicos para el segundo gráfico
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              data: dataYkc, // Datos específicos para el segundo gráfico
              type: "line",
            },
          ],
        };
        // Inicializa el segundo gráfico en el elemento con id 'grafico'
        /*const grafico2 = echarts.init(document.getElementById('graficokeycon'));
                grafico2.setOption(chartOptions12);*/

        break;
      default:
        // Llama a la función para ocultar los elementos
        mostrarOcultarTabla(considerar);
        // Genera el contenido para keyDentello cuando la condición es "no
        break;
    }

    // Concatena el contenido de las tablas y otros elementos
    let tablaVerificacionSinSismoHTML =
      verfsinefec + verfsinvolteo + verfdesliza + verfconefec + verfsinvolteoconsismo + verfcondesliza;
    let tbody2 = document.getElementById("segundaTabla");
    tbody2.innerHTML = tablaVerificacionSinSismoHTML;

    //========================================ANALISI ESTRUCTURAL============================
    //==============calculos de pantalla, punta, talon y Key================================

    var maxpanq1 = Math.max(pantq1, pSC);
    var maxpanq2 = Math.max(pantq2, pantq2);

    var maxpesopropiopq1 = Math.max(puntpp, puntpp);
    var maxpunq1 = Math.max(puntq1, puntq1con);
    var maxpunq2 = Math.max(puntq2, s1cons);

    var maxpesotalon = Math.max(tanpp, tanpp);
    var pmaxterrenotalon = Math.max(talq1, talpt);
    var maxtalonq1 = Math.min(talq1, s2cons);
    var maxtalonq2 = Math.max(talq2, talq2con);
    var maxkeyq1 = Math.max(keyq1, keyq1);
    var maxkeyq2 = Math.max(keyq2, keyq2);

    //================pantalla===================
    var x1pant = 0;
    var x2pant = corteA;
    var x3pant = lpr;
    var wpant = maxpanq2 - maxpanq1;
    var apant = (x1pant * wpant) / inputh;
    var bpant = wpant - apant;

    var vx1 = parseFloat(maxpanq1) * parseFloat(x2pant - inputh);
    var vx2 =
      parseFloat(bpant) * parseFloat(x2pant) +
      (parseFloat(apant) * parseFloat(x2pant)) / 2 -
      (parseFloat(wpant) * parseFloat(inputh)) / 2;
    var vxtotal = Math.abs(vx1 + vx2);
    var vxsismo = desing == "sinsismo" ? 0 : FSISMO;

    var mx1 = (maxpanq1 * (x1pant * x1pant + inputh * inputh - 2 * inputh * x1pant)) / 2;
    //var mx2s = (bpant * x1pant * x1pant / 2) + (apant * x1pant * x1pant / 3) - (wpant * inputh * x1pant / 2) + wpant * inputh * inputh / 6;
    var mx2 =
      (bpant * x1pant * x1pant) / 2 +
      (apant * x1pant * x1pant) / 3 -
      (wpant * x1pant * x1pant) / 2 +
      (wpant * inputh * inputh) / 6;
    var mxtotal = mx1 + mx2;
    var mxsismo = desing == "sinsismo" ? 0 : Mae - vxsismo * x1pant;

    var xtree1 = (maxpanq1 * (x3pant * x3pant + inputh * inputh - 2 * inputh * x3pant)) / 2;
    var xtree2 =
      (bpant * x3pant * x3pant) / 2 +
      (apant * x3pant * x3pant) / 3 -
      (wpant * inputh * x3pant) / 2 +
      (wpant * inputh * inputh) / 6;
    var xtreetotal = xtree1 + xtree2;
    var xtreesismo = desing == "sinsismo" ? 0 : Mae - vxsismo * x3pant;

    var mupant = 1.7 * mxtotal + mxsismo;

    var vupant = 1.7 * vxtotal + vxsismo;

    //================Punta======================
    var x1punt = 0;
    var x2punt = (punes * 100 - 10) / 100;

    var wpunt = maxpunq2 - maxpunq1;
    var apunt = (wpunt * x1punt) / inputh;

    var vx1pun = maxpunq1 * (x2punt - b2graf);
    var vx2pun = (apunt * x2punt - wpunt * b2graf) / 2;
    var vxtotalpun = vx1pun + vx2pun;
    var vxpppun = Math.abs(maxpesopropiopq1 * (x2punt - b2graf));

    var mx1pun = (maxpunq1 * (x1punt * x1punt + b2graf * b2graf - 2 * b2graf * x1punt)) / 2;
    var mx2pun = (wpunt * b2graf * b2graf) / 3 + (apunt * x1punt * x1punt) / 6 - (wpunt * b2graf * x1punt) / 2;
    var mxtotalpun = mx1pun + mx2pun;
    var mxpppun = (maxpesopropiopq1 * (x1punt * x1punt + b2graf * b2graf - 2 * b2graf * x1punt)) / 2;

    var mupun = Math.abs(1.7 * -mxtotalpun - 1.4 * mxpppun);
    var vupun = Math.abs(1.7 * vxtotalpun + -1.4 * vxpppun);

    let analisisEstructural = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo inicial</th>
                    <th class='py-2 px-4' scope="col">q1</th>
                    <td class='py-2 px-4 text-right'>${maxpanq1.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo final</th>
                    <th class='py-2 px-4' scope="col">q2</th>
                    <td class='py-2 px-4 text-right'>${maxpanq2.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Longitud</th>
                    <th class='py-2 px-4' scope="col">L</th>
                    <td class='py-2 px-4 text-right'>${inputh}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia inicial</th>
                    <th class='py-2 px-4' scope="col">X1</th>
                    <td class='py-2 px-4 text-right'>${x1pant}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia final</th>
                    <th class='py-2 px-4' scope="col">X2</th>
                    <td class='py-2 px-4 text-right'>${x2pant}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">X3</th>
                    <td class='py-2 px-4 text-right'>${x3pant}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Carga</th>
                    <th class='py-2 px-4' scope="col">w</th>
                    <td class='py-2 px-4 text-right'>${wpant.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia de corte</th>
                    <th class='py-2 px-4' scope="col">a</th>
                    <td class='py-2 px-4 text-right'>${apant}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">b</th>
                    <td class='py-2 px-4 text-right'>${bpant.toFixed(2)}</td>
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
                    <th class="text-lg py-2 px-4" scope="col">${vx1.toFixed(2)}</th>
                    <th class="text-lg py-2 px-4" scope="col">${vx2.toFixed(2)}</th>
                    <th class="text-lg py-2 px-4 text-right" scope="col">${vxtotal.toFixed(2)}</th>
                    <th class="text-lg py-2 px-4" scope="col">${vxsismo.toFixed(2)}</th>
                </tr>
                    <tr class='py-2 px-4' class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">M(X1)</th>
                    <th class='py-2 px-4' scope="col">${mx1.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${mx2.toFixed(2)}</th>
                    <th class='py-2 px-4 text-right' scope="col">${mxtotal.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${mxsismo.toFixed(2)}</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">M(X3)</th>
                    <th class='py-2 px-4' scope="col">${xtree1.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${xtree2.toFixed(2)}</th>
                    <th class='py-2 px-4 text-right' scope="col">${xtreetotal.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${xtreesismo.toFixed(2)}</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="col">Mu</th>
                    <td class='py-2 px-4 text-right'>${mupant.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="col">Vu</th>
                    <td class='py-2 px-4 text-right'>${vupant.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
            `;

    let analisisEstructuralPunta = `
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="6">5.2. Punta</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">Peso Propio</th>
                    <td class='py-2 px-4 text-right'>${maxpesopropiopq1.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo inicial</th>
                    <th class='py-2 px-4' scope="col">q1</th>
                    <td class='py-2 px-4 text-right'>${maxpunq1.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo final</th>
                    <th class='py-2 px-4' scope="col">q2</th>
                    <td class='py-2 px-4 text-right'>${maxpunq2.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Longitud</th>
                    <th class='py-2 px-4' scope="col">L</th>
                    <td class='py-2 px-4 text-right'>${b2graf}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia inicial</th>
                    <th class='py-2 px-4' scope="col">X1</th>
                    <td class='py-2 px-4 text-right'>${x1punt}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia final</th>
                    <th class='py-2 px-4' scope="col">X2</th>
                    <td class='py-2 px-4 text-right'>${x2punt}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Carga</th>
                    <th class='py-2 px-4' scope="col">W</th>
                    <td class='py-2 px-4 text-right'>${wpunt.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia de corte</th>
                    <th class='py-2 px-4' scope="col">a</th>
                    <td class='py-2 px-4 text-right'>${apunt}</td>
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
                    <th class='py-2 px-4' scope="col">${vx1pun.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${vx2pun.toFixed(2)}</th>
                    <th class='py-2 px-4 text-right' scope="col">${vxtotalpun.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${vxpppun.toFixed(2)}</th>
                </tr>
                    <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="2">M(X1)</th>
                    <th class='py-2 px-4' scope="col">${mx1pun.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${mx2pun.toFixed(2)}</th>
                    <th class='py-2 px-4 text-right' scope="col">${mxtotalpun.toFixed(2)}</th>
                    <th class='py-2 px-4' scope="col">${mxpppun.toFixed(2)}</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="col">Mu</th>
                    <td class='py-2 px-4 text-right'> ${mupun.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="col">Vu</th>
                    <td class='py-2 px-4 text-right'>${vupun.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
            `;
    //==============================TALON==========================================
    var x1tal = 0;
    var x2tal = (tanles * 100 - 10) / 100;
    var x3tal = LTal;
    var x4tal = Longitud;

    var wtal = maxtalonq2 - maxtalonq1;
    var atal = (x2punt * wtal) / b1graf;
    var btal = wtal - atal;

    var VX4_1 = maxtalonq1 * (x4tal - b1graf);
    var VX4_2 = btal * x4tal + (b1graf * x4tal) / 2 - (wtal * b1graf) / 2;
    var VX4_TOTAL = VX4_1 + VX4_2;
    var VX4_PP = Math.abs(maxpesotalon * (x4tal - b1graf));
    var VX4_PT = Math.abs(pmaxterrenotalon * (x4tal - b1graf));

    var VX2_1 = maxtalonq1 * (x2tal - b1graf);
    var VX2_2 = btal * x2tal + (atal * x2tal) / 2 - (wtal * b1graf) / 2;
    var VX2_TOTAL = VX2_1 + VX2_2;
    var VX2_PP = Math.abs(maxpesotalon * (x2tal - b1graf));
    var VX2_PT = Math.abs(pmaxterrenotalon * (x2tal - b1graf));

    var MX1_1 = (maxtalonq1 * (x1tal * x1tal + b1graf * b1graf - 2 * b1graf * x1tal)) / 2;
    var MX1_2 =
      (btal * x1tal * x1tal) / 2 +
      (b1graf * x1tal * x1tal) / 3 -
      (wtal * b1graf * x1tal) / 2 +
      (wtal * b1graf * b1graf) / 6;
    var MX1_TOTAL = -(MX1_1 + MX1_2);
    var MX1_PP = (maxpesotalon * (x1tal * x1tal + b1graf * b1graf - 2 * b1graf * x1tal)) / 2;
    var MX1_PT = (pmaxterrenotalon * (x1tal * x1tal + b1graf * b1graf - 2 * b1graf * x1tal)) / 2;

    var MX3_1 = (maxtalonq1 * (x3tal * x3tal + b1graf * b1graf - 2 * b1graf * x3tal)) / 2;
    var MX3_2 =
      (btal * x3tal * x3tal) / 2 +
      (atal * x3tal * x3tal) / 3 -
      (wtal * b1graf * x3tal) / 2 +
      (wtal * b1graf * b1graf) / 6;
    var MX3_TOTAL = -(MX3_1 + MX3_2);
    var MX3_PP = (maxpesotalon * (x3tal * x3tal + b1graf * b1graf - 2 * b1graf * x3tal)) / 2;
    var MX3_PT = (pmaxterrenotalon * (x3tal * x3tal + b1graf * b1graf - 2 * b1graf * x3tal)) / 2;

    var mutal = 1.7 * parseFloat(MX1_TOTAL) + 1.4 * parseFloat(MX1_PP) + 1.7 * parseFloat(MX1_PT);
    var vutal = 1.7 * VX2_TOTAL + 1.4 * VX2_PP + 1.7 * VX2_PT;

    let analisisEstructuralpuntal = `
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="6">5.3. Talon</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Peso Propio</th>
                    <th class='py-2 px-4' scope="col">--</th>
                    <td class='py-2 px-4 text-right'>${maxpesotalon.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">P. Terreno</th>
                    <th class='py-2 px-4' scope="col">--</th>
                    <td class='py-2 px-4 text-right'>${pmaxterrenotalon.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo inicial</th>
                    <th class='py-2 px-4' scope="col">q1</th>
                    <td class='py-2 px-4 text-right'>${maxtalonq1.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo final</th>
                    <th class='py-2 px-4' scope="col">q2</th>
                    <td class='py-2 px-4 text-right'>${maxtalonq2.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Longitud</th>
                    <th class='py-2 px-4' scope="col">L</th>
                    <td class='py-2 px-4 text-right'>${b1graf.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia inicial</th>
                    <th class='py-2 px-4' scope="col">X1</th>
                    <td class='py-2 px-4 text-right'>${x1tal.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia final</th>
                    <th class='py-2 px-4' scope="col">X2</th>
                    <td class='py-2 px-4 text-right'>${x2tal}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">X3</th>
                    <td class='py-2 px-4 text-right'>${x3tal.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">X4</th>
                    <td class='py-2 px-4 text-right'>${x4tal.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Carga</th>
                    <th class='py-2 px-4' scope="col">w</th>
                    <td class='py-2 px-4 text-right'>${wtal.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Distancia de corte</th>
                    <th class='py-2 px-4' scope="col">a</th>
                    <td class='py-2 px-4 text-right'>${atal.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3"></th>
                    <th class='py-2 px-4' scope="col">b</th>
                    <td class='py-2 px-4 text-right'>${btal.toFixed(2)}</td>
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
                    <td class='py-2 px-4 text-center'>${VX4_1.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${VX4_2.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${VX4_TOTAL.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${VX4_PP.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${VX4_PT.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="row" >V(X2)</th>
                    <td class='py-2 px-4 text-center'>${VX2_1.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${VX2_2.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${VX2_TOTAL.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${VX2_PP.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${VX2_PT.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="row" >M(X1)</th>
                    <td class='py-2 px-4 text-center'>${MX1_1.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${MX1_2.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${MX1_TOTAL.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${MX1_PP.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${MX1_PT.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="row" >M(X3)</th>
                    <td class='py-2 px-4 text-center'>${MX3_1.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${MX3_2.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${MX3_TOTAL.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${MX3_PP.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${MX3_PT.toFixed(2)}</td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="row">Mu</th>
                    <td class='py-2 px-4 text-right '>${mutal.toFixed(2)}</td>
                    <th class='py-2 px-4 text-center' scope="row">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="row">Vu</th>
                    <td class='py-2 px-4 text-right '>${vutal.toFixed(2)}</td>
                    <th class='py-2 px-4 text-center' scope="row">Tn</th>
                </tr>
            `;

    var v1key = maxkeyq1 * dentelloncorr;
    var v2key = ((maxkeyq2 - maxkeyq1) * dentelloncorr) / 2;
    var vtotalkey = v1key + v2key;

    var m1key = (v1key * dentelloncorr) / 2;
    var m2key = (v2key * 2 * dentelloncorr) / 3;
    var mtotalkey = m1key + m2key;

    var mukey = 1.7 * mtotalkey;
    var vukey = 1.7 * vtotalkey;

    let analisisEstructuralkey = `
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="6">5.4. Key</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo inicial</th>
                    <th class='py-2 px-4' scope="col">q1</th>
                    <td class='py-2 px-4 text-right'>${maxkeyq1.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Esfuerzo final</th>
                    <th class='py-2 px-4' scope="col">q2</th>
                    <td class='py-2 px-4 text-right'>${maxkeyq2.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn/m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Longitud</th>
                    <th class='py-2 px-4' scope="col">L</th>
                    <td class='py-2 px-4 text-right'>${dentelloncorr.toFixed(2)}</td>
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
                    <td class='py-2 px-4 text-center'>${v1key.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${v2key.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${vtotalkey.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">M</th>
                    <td class='py-2 px-4 text-center'>${m1key.toFixed(2)}</td>
                    <td class='py-2 px-4 text-right '>${m2key.toFixed(2)}</td>
                    <td class='py-2 px-4 text-center'>${mtotalkey.toFixed(2)}</td>
                </tr>
                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"><th colspan="6"></th></tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="col">Mu</th>
                    <td class='py-2 px-4 text-right'>${mukey.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="col">Vu</th>
                    <td class='py-2 px-4 text-right'>${vukey.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
            `;

    let tablaanalisEstructural =
      analisisEstructural + analisisEstructuralPunta + analisisEstructuralpuntal + analisisEstructuralkey;
    let tbody3 = document.getElementById("tablapp");
    tbody3.innerHTML = tablaanalisEstructural;

    var bpantca = 100;
    var tpandca = altTras * 100;
    var dpantca = tpandca - 4;
    var mupantca = mupant * 100000;

    //=====================================DCA PANTALLA-cuantias===============================
    var rminpan1 = 0.002;
    var rminpan2 = 0.0018;
    var rminAreapan1 = rminpan1 * bpantca * dpantca;
    var rminAreapan2 = rminpan2 * bpantca * dpantca;

    var aMC = dpantca - Math.pow(Math.pow(dpantca, 2) - (2 * mupantca) / (0.85 * 0.9 * fc * bpantca), 0.5);
    var asMC = mupantca / (0.9 * fy * (dpantca - aMC / 2));
    var verfMC = asMC > rminAreapan2 ? "OK" : "NOT";
    var asmc = Math.max(asMC, rminAreapan2);

    let desingcarmado = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="col">Mu</th>
                    <td class='py-2 px-4 text-right'>${mupant.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Cortante ultimo</th>
                    <th class='py-2 px-4' scope="col">Vu</th>
                    <td class='py-2 px-4 text-right'>${vupant.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th class='py-2 px-4' scope="col">Fy</th>
                    <td class='py-2 px-4 text-right'>${fy}</td>
                    <th class='py-2 px-4' scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th class='py-2 px-4' scope="col">f'c</th>
                    <td class='py-2 px-4 text-right'>${fc}</td>
                    <th class='py-2 px-4' scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Ancho a analizar</th>
                    <th class='py-2 px-4' scope="col">b</th>
                    <td class='py-2 px-4 text-right'>${bpantca.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Espesor de la corona</th>
                    <th class='py-2 px-4' scope="col">t</th>
                    <td class='py-2 px-4 text-right'>${tpandca.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Peralte efectivo</th>
                    <th class='py-2 px-4' scope="col">d</th>
                    <td class='py-2 px-4 text-right'>${dpantca.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Momento ultimo</th>
                    <th class='py-2 px-4' scope="col">Mu</th>
                    <td class='py-2 px-4 text-right'>${mupantca.toFixed(2)}</td>
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
                    <td class='py-2 px-4 text-right'>${rminpan1.toFixed(4)}</td>
                    <th class='py-2 px-4' scope="col">cm<sup>2</sup></th>

                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cuantia minima</th>
                    <th class='py-2 px-4' scope="col">rMIN</th>
                    <td class='py-2 px-4 text-right'>${rminpan2.toFixed(4)}</td>
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
                    <td class='py-2 px-4 text-right'>${rminAreapan1.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Cuantia minima</th>
                    <th class='py-2 px-4' scope="col">rMIN</th>
                    <td class='py-2 px-4 text-right'>${rminAreapan2.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm<sup>2</sup></th>
                </tr>

                <tr class="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                    <th class="text-xl py-2 px-4 text-left" colspan="6">6.1.2. Calculo del area del refuerzo(metodo cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Altura bloque compresion</th>
                    <th class='py-2 px-4' scope="col">a</th>
                    <td class='py-2 px-4 text-right'>${aMC.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="3">Acero calculado</th>
                    <th class='py-2 px-4' scope="col">As</th>
                    <td class='py-2 px-4 text-right'>${asMC.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' colspan="4"></th>
                    <th class='py-2 px-4' scope="col" colspan="3" class="">verificacion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Acero minimo</th>
                    <th class='py-2 px-4' scope="col">Asmin</th>
                    <td class='py-2 px-4 text-right'>${verfMC}</td>
                    <th class='py-2 px-4' scope="col"></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class='py-2 px-4' scope="col" colspan="3">Acero a usar</th>
                    <th class='py-2 px-4' scope="col">As</th>
                    <td class='py-2 px-4 text-right'>${asmc.toFixed(2)}</td>
                    <th class='py-2 px-4' scope="col">cm<sup>2</sup></th>
                </tr>

            `;
    let tabladesingcarmado = desingcarmado;
    let tbody4 = document.getElementById("tablatk");
    tbody4.innerHTML = tabladesingcarmado;

    //============================Verificaciones de Acero=================
    var astotalpan = Math.round((acer * numbarras * 100) / asmc);
    var asverf = astotalpan < 20 ? astotalpan : 20;
    var asLongPrin = acer * numbarras;
    let acerpan = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3">Diametro del acero</th>
                    <th scope="col" colspan="0">Ø</th>
                    <td>${acerName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3"># barras</th>
                    <th scope="col" colspan="0">#</th>
                    <td>${numbarras}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3">Acero a usar</th>
                    <th scope="col" colspan="0">As</th>
                    <td>${asLongPrin.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3">Separacion de acero longitudinal</th>
                    <th scope="col" colspan="0">@</th>
                    <td contenteditable="true">${astotalpan.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan=""></th>
                    <td>${numbarras}</td>
                    <td>Ø</td>
                    <td>${acerName}</td>
                    <td>@</td>
                    <td contenteditable="true">${asverf.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="6"></th>
                </tr>
            `;
    let tablaacerpan = acerpan;
    let tbody5 = document.getElementById("tablapantallaAcero");
    tbody5.innerHTML = tablaacerpan;
    //================================distribucion del acero longitudinal principal=====
    var as1trans = rminAreapan1 * porpocion;
    var astotaltrans = Math.round((acertrans * 100) / as1trans);
    var valor1 = 1;
    var asverftrans = astotaltrans < 25 ? astotaltrans : 25;

    let distribucionATranversal = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6" class="text-center">Cara del terreno</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${rminAreapan1.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${porpocion.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${as1trans.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">Ø</th>
                    <td>${acertransName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Medida del acero</th>
                    <th scope="col">As</th>
                    <td>${acertrans.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${astotaltrans.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th></th>
                    <td>${valor1}</td>
                    <td>Ø</td>
                    <td>${acertransName}</td>
                    <td>@</td>
                    <td contenteditable="true">${asverftrans.toFixed(2)}</td>
                </tr>
            `;
    let tabladistribucionATranversal = distribucionATranversal;
    let tbody6 = document.getElementById("tablaDAT");
    tbody6.innerHTML = tabladistribucionATranversal;
    //--x--//------
    //===============================Caida Libre==========================================
    var porporcionClibre = 1 - porpocion;
    var as1clibre = rminAreapan1 * porporcionClibre;
    var astotalcLibre = Math.round((acerclibre * 100) / as1clibre);
    var valor1clibre = 1;
    var asvercLibre = astotalcLibre < 25 ? astotalcLibre : 25;

    let tablacaidaLibre = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${rminAreapan1.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${porporcionClibre.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${as1clibre.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">Ø</th>
                    <td>${acercLibreName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero</th>
                    <th scope="col">As</th>
                    <td>${acerclibre.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${astotalcLibre.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="0"></th>
                    <td>${valor1clibre}</td>
                    <td>Ø</td>
                    <td>${acercLibreName}</td>
                    <td>@</td>
                    <td contenteditable="true">${asvercLibre.toFixed(2)}</td>
                </tr>
            `;
    let tablacaidalibrepan = tablacaidaLibre;
    let tbody7 = document.getElementById("tablacaidaLibre");
    tbody7.innerHTML = tablacaidalibrepan;
    //===================================Diseño por Corte Pantalla========================
    var dcorte = dpantca;
    var vucorte = vupant;
    var cortea = x2pant;
    var vccorte = (0.53 * dcorte * bpantca * Math.pow(fc, 0.5)) / 1000;
    var avccorte = vccorte * 0.85;
    var verfcorte = avccorte > vucorte ? "OK" : "ESTA MAL";

    let tabladcorte = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6" class="text-center" >Calcular el cortante a una distancia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${dcorte.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${vucorte.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">Corte A</th>
                    <td>${cortea.toFixed(2)}</td>
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
                    <td>${vccorte.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">@Vc</th>
                    <td contenteditable="true">${avccorte.toFixed(2)}</td>
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
                    <td>${verfcorte}</td>
                    <th></th>
                </tr>
            `;
    let tabladCorte = tabladcorte;
    let tbody8 = document.getElementById("tabledcorte");
    tbody8.innerHTML = tabladCorte;
    //=====================================PANTALLA(RECORTE DE REFUERZO LONGITUDINAL PRINCIPAL)===
    var Murecorte = xtreetotal * 1.7 + xtreesismo;
    var brecorte = 100;
    var trecorte = ((epgraf * DF) / inputh + egraf) * 100;
    var drecorte = trecorte - 4;
    var murecorte = Murecorte * 100000;
    var Asmin = 0.002 * trecorte * 100;
    var mudivrecorte = mupant / 2;
    var verfrecorte = Murecorte <= mupant / 2 ? "OK" : "AUMENTA L";

    let tablapresf = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">Datos</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">l</th>
                    <td>${lpr}</td>
                    <th>m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${Murecorte.toFixed(2)}</td>
                    <th>tm-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${fy}</td>
                    <th>Kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${fc}</td>
                    <th>Kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${brecorte.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${trecorte.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${drecorte.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${murecorte.toFixed(2)}</td>
                    <th>kg-cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero minimo</th>
                    <th scope="col">AsMin</th>
                    <td>${Asmin.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">¿ES MENOR AL MOMENTO?</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">Mu/2</th>
                    <td>${mudivrecorte.toFixed(2)}</td>
                    <td>${verfrecorte}</td>
                </tr>
            `;
    let tablapanrf = tablapresf;
    let tbody9 = document.getElementById("tablePrecorte");
    tbody9.innerHTML = tablapanrf;
    //=======================================DISEÑO POR FLEXION===========================
    var adflexion = drecorte - Math.pow(Math.pow(drecorte, 2) - (2 * murecorte) / (0.85 * 0.9 * fc * brecorte), 0.5);
    var asflexion = murecorte / (0.9 * fy * (drecorte - adflexion / 2));
    var asmiverflex = asflexion > Asmin ? "OK" : "NO";
    var asfinflexion = Math.max(asflexion, Asmin);

    var verbarras = numbarras > 1 ? 1 : 0;
    var AsDflexion = acer * verbarras;
    var arrobaLD = Math.round((AsDflexion * 100) / asfinflexion);
    var verifDAL = arrobaLD < 20 ? arrobaLD : 20;

    let tablDflexion = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col" colspan="6">Calculo del area del refuerzo (Metodo Cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura de bloque comprimido</th>
                    <th scope="col">a</th>
                    <td>${adflexion.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${asflexion.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Verificacion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero minimo</th>
                    <th scope="col">Asmin</th>
                    <td>${asmiverflex}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As</th>
                    <td>${asfinflexion.toFixed(2)}</td>
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
                    <td>${acerName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${verbarras}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As</th>
                    <td>${AsDflexion.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${arrobaLD.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${verbarras}</td>
                    <td>Ø</td>
                    <td>${acerName}</td>
                    <td>@</td>
                    <td contenteditable="true">${verifDAL.toFixed(2)}</td>
                </tr>
            `;

    let tabladesingFlexion = tablDflexion;
    let tbody10 = document.getElementById("tableDflexion");
    tbody10.innerHTML = tabladesingFlexion;

    //=====================================ALS==================================
    var astotalls = aceroLs * numbarrasls;
    var arLS = Math.round((astotalls * 100) / Asmin);
    var verftotal = arLS < 20 ? arLS : 20;

    let tablDflexionLS = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero a usar</th>
                    <th scope="col" >Ø</th>
                    <td>${aceroLsName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${numbarrasls}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As</th>
                    <td>${astotalls.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${arLS.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${numbarrasls}</td>
                    <td>Ø</td>
                    <td>${aceroLsName}</td>
                    <td>@</td>
                    <td contenteditable="true">${verftotal.toFixed(2)}</td>
                </tr>
            `;

    let tabladesingFlexionLS = tablDflexionLS;
    let tbody11 = document.getElementById("tablaALS");
    tbody11.innerHTML = tabladesingFlexionLS;

    //========================================DISEÑO DE CONCRETO ARMADO PUNTA   x2punt =======================================
    var tpun = punes * 100;
    var dpunt = tpun - 10;
    var mupunt = mupun * 100000;

    var rminAreapun1 = rminpan1 * bpantca * dpunt;
    var rminAreapun2 = rminpan2 * bpantca * dpunt;

    var aMCpun = dpunt - Math.pow(Math.pow(dpunt, 2) - (2 * mupunt) / (0.85 * 0.9 * fc * bpantca), 0.5);
    var asMCpun = mupunt / (0.9 * fy * (dpunt - aMCpun / 2));
    var verfMCpun = asMCpun > rminAreapun1 ? "OK" : "NOT";
    var asmcpun = Math.max(asMCpun, rminAreapun1);

    let desingcaPunta = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${mupun.toFixed(2)}</td>
                    <th scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${vupun.toFixed(2)}</td>
                    <th scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${fy}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${fc}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${bpantca.toFixed(2)}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${tpun.toFixed(2)}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${dpunt.toFixed(2)}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${mupunt.toFixed(2)}</td>
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
                    <td>${rminpan1.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminpan2.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Areas</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminAreapun1.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminAreapun2.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th  scope="col"  colspan="6">6.2.2. Calculo del area del refuerzo(metodo cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura bloque compresion</th>
                    <th scope="col">a</th>
                    <td>${aMCpun.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero calculado</th>
                    <th scope="col">As</th>
                    <td>${asMCpun.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Verificacion</th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero minimo</th>
                    <th scope="col">Asmin</th>
                    <td>${verfMCpun}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${asmcpun.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
            `;
    let tabladesingcaPunta = desingcaPunta;
    let tbody12 = document.getElementById("tabladesingcaPunta");
    tbody12.innerHTML = tabladesingcaPunta;

    //===========================================PUNTA DISTRIBUCION ACERO LONGITUDINAL==============
    var astotalpun = aceropun * numbarraspun;
    var medidapun = Math.round((astotalpun * 100) / asmcpun);
    var asverfpun = medidapun < 20 ? medidapun : 20;
    let dalprincipal = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col">Ø</th>
                    <td>${aceropunName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># barras</th>
                    <th scope="col">#</th>
                    <td>${numbarraspun}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${astotalpun.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero longitudinal</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${medidapun}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${numbarraspun}</td>
                    <td>Ø</td>
                    <td>${aceropunName}</td>
                    <td>@</td>
                    <td contenteditable="true">${asverfpun}</td>
                </tr>
            `;
    let tabladalp = dalprincipal;
    let tbody13 = document.getElementById("tablaDALP");
    tbody13.innerHTML = tabladalp;
    //============================================DISTRIBUCION DEL ACERO TRANVERSAL===================
    var as1transpun = rminAreapun2 * porpocionpun;
    var astotaltranspun = Math.round((aceropuntrans * 100) / as1transpun);
    var asverftranspun = astotaltranspun < 25 ? astotaltranspun : 25;

    let datranversal = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cara del terreno</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${rminAreapun2.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${porpocionpun.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${as1transpun.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col">Ø</th>
                    <td>${acertransName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Medida del acero</th>
                    <th scope="col">As</th>
                    <td>${aceropuntrans.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${astotaltranspun}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${valor1}</td>
                    <td>Ø</td>
                    <td>${aceropuntransName}</td>
                    <td>@</td>
                    <td contenteditable="true">${asverftranspun.toFixed(2)}</td>
                </tr>
             `;
    let tablaDatrans = datranversal;
    let tbody14 = document.getElementById("tabladatpun");
    tbody14.innerHTML = tablaDatrans;

    //============================================CARA LIBRE==========================================
    var porpocionpuncl = 1 - porpocionpun;
    var as1clpun = rminAreapun2 * porpocionpuncl;
    var astotalclpun = Math.round((aceropunclibre * 100) / as1clpun);
    var asverfclpun = astotalclpun < 25 ? astotalclpun : 25;

    let tablaClibre = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cara libre</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${rminAreapun2.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${porpocionpuncl.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${as1clpun.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">ø</th>
                    <td>${aceropunclibreName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero</th>
                    <th scope="col">As</th>
                    <td>${aceropunclibre.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${astotalclpun}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${valor1}</td>
                    <td>Ø</td>
                    <td>${aceropunclibreName}</td>
                    <td>@</td>
                    <td contenteditable="true">${asverfclpun}</td>
                </tr>
            `;
    let tablacaralibre = tablaClibre;
    let tbody15 = document.getElementById("tablaClibre");
    tbody15.innerHTML = tablacaralibre;
    //==================================DISEÑO POR CORTE PUNTA==========================
    var vccortepun = (0.53 * dpunt * bpantca * Math.pow(fc, 0.5)) / 1000;
    var avccortepun = vccortepun * 0.85;
    var verfcortepun = avccortepun > vupun ? "OK" : "NOT";

    let tabladcortepun = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">Calcular el cortante a una distancia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${dpunt.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${vupun.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Aporte del concreto</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante del concreto</th>
                    <th scope="col">Vc</th>
                    <td>${vccortepun.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">@Vc</th>
                    <td contenteditable="true">${avccortepun.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Verificamos</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">¿Vc>Vu?</th>
                    <td>${verfcortepun}</td>
                    <th></th>
                </tr>
            `;
    let tabladCortepun = tabladcortepun;
    let tbody16 = document.getElementById("tabledcortepun");
    tbody16.innerHTML = tabladCortepun;

    //=============================DISTRIBUCION DEL ACERO LONGITUDIONAL SECUNDARIO========================
    acerolspunName, acerolspun, numbarraslspun;
    var acertotallspun = acerolspun * numbarraslspun;
    var arLSpun = Math.round((acertotallspun * 100) / rminAreapun1);
    var verftotallspun = arLSpun < 20 ? arLSpun : 20;

    let tablDflexionLSPun = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col">Ø</th>
                    <td>${acerolspunName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${numbarraslspun}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${acertotallspun.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">separacion</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${arLSpun}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${numbarraslspun}</td>
                    <td>Ø</td>
                    <td>${acerolspunName}</td>
                    <td>@</td>
                    <td contenteditable="true">${verftotallspun}</td>
                </tr>
            `;
    let tabladesingFlexionLSpun = tablDflexionLSPun;
    let tbody17 = document.getElementById("tablaALSpun");
    tbody17.innerHTML = tabladesingFlexionLSpun;

    //=====================================DC TALON============================================
    var ttal = tanles * 100;
    var dtal = ttal - 10;
    var mutalDC = mutal * 100000;
    var rminAreatal1 = rminpan1 * bpantca * dtal;
    var rminAreatal2 = rminpan2 * bpantca * dtal;
    var atal = dtal - Math.pow(Math.pow(dtal, 2) - (2 * mutalDC) / (0.85 * 0.9 * fc * bpantca), 0.5);
    var asMCtal = mutalDC / (0.9 * fy * (dtal - atal / 2));
    var verfMCtal = asMCtal > rminAreatal2 ? "OK" : "NOT";
    var asmctotalal = Math.max(rminAreatal1, asMCtal);

    let desingcatalon = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${mutal.toFixed(2)}</td>
                    <th scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${vutal.toFixed(2)}</td>
                    <th scope="col">Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${fy}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${fc}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${bpantca}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${ttal}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${dtal}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${mutalDC.toFixed(2)}</td>
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
                    <td>${rminpan1.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminpan2.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Areas</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminAreatal1.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminAreatal2.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th  scope="col"  colspan="6">6.3.2. Calculo del area del refuerzo(metodo cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura bloque compresion</th>
                    <th scope="col">a</th>
                    <td>${atal.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero calculado</th>
                    <th scope="col">As</th>
                    <td>${asMCtal.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3" class="text-center">verificacion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero minimo</th>
                    <th scope="col">Asmin</th>
                    <td>${verfMCtal}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${asmctotalal.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>

                </tr>
            `;
    let tabladesintalon = desingcatalon;
    let tbody19 = document.getElementById("tabladesingcatalon");
    tbody19.innerHTML = tabladesintalon;

    //==================================DISTIBUCION DEL ACERO LONGITUDINAL==========================
    var astotalTal = aceroalp * numbarratal;
    var arLSTal = Math.round((astotalTal * 100) / asmctotalal);
    var verftotalDAL = arLSTal < 20 ? arLSTal : 20;

    let desingAL = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col" >Ø</th>
                    <td>${aceroalpName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${numbarratal}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${astotalTal.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero longitudinal</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${arLSTal.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${numbarratal}</td>
                    <td>Ø</td>
                    <td>${aceroalpName}</td>
                    <td>@</td>
                    <td contenteditable="true">${verftotalDAL.toFixed(2)}</td>
                </tr>
            `;
    let tablaaceroLongitudinal = desingAL;
    let tbody20 = document.getElementById("tablaALPtal");
    tbody20.innerHTML = tablaaceroLongitudinal;

    //==================================DISTIBUCION DEL ACERO TRANSVERSAL================================
    var as1transTal = rminAreapun1 * porpociondat;
    var acerototalTal = Math.round((aceroadat * 100) / as1transTal);
    var asverftransTal = acerototalTal < 25 ? acerototalTal : 25;

    let desingATrans = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">Cara del terreno</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${rminAreapun1.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${porpociondat.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${as1transTal.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro de acero a usar</th>
                    <th scope="col">ø</th>
                    <td>${acerodatpName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Medida del acero</th>
                    <th scope="col">As</th>
                    <td>${aceroadat.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${acerototalTal}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${valor1}</td>
                    <td>Ø</td>
                    <td>${acerodatpName}</td>
                    <td>@</td>
                    <td contenteditable="true">${asverftransTal.toFixed(2)}</td>
                </tr>
            `;
    let tablaATranversal = desingATrans;
    let tbody21 = document.getElementById("tablaDATtal");
    tbody21.innerHTML = tablaATranversal;
    //==================================CARA LIBRE===================================================
    // aceroCLpName, aceroaCL
    var acerototalTalCL = Math.round((aceroaCL * 100) / as1transTal);
    var asverftransTalCL = acerototalTalCL < 25 ? acerototalTalCL : 25;

    let desingCaraL = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${rminAreapun1.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${porpociondat.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${as1transTal.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">ø</th>
                    <td>${aceroCLpName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">As</th>
                    <td>${aceroaCL.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${acerototalTalCL}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${valor1}</td>
                    <td>Ø</td>
                    <td>${aceroCLpName}</td>
                    <td>@</td>
                    <td contenteditable="true">${asverftransTalCL.toFixed(2)}</td>
                </tr>
            `;
    let tablaCaraLibre = desingCaraL;
    let tbody22 = document.getElementById("tablaCLtal");
    tbody22.innerHTML = tablaCaraLibre;
    //==================================DISEÑO POR CORTE==============================================
    var vccorteTal = (0.53 * dtal * bpantca * Math.pow(fc, 0.5)) / 1000;
    var avccorteTal = vccorteTal * 0.85;
    var verfcorteTal = avccorteTal > vutal ? "OK" : "NO";

    let desincorteTal = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="6">Calcular el cortante a una distancia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${dtal.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${vutal.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Aporte del concreto</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante del concreto</th>
                    <th scope="col">Vc</th>
                    <td>${vccorteTal.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">@Vc</th>
                    <td contenteditable="true">${avccorteTal.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Verificamos</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">¿Vc>Vu?</th>
                    <td>${verfcorteTal}</td>
                    <th></th>
                </tr>
            `;
    let tablacorteTal = desincorteTal;
    let tbody23 = document.getElementById("tablaDCtal");
    tbody23.innerHTML = tablacorteTal;

    //==================================DISEÑO POR CORTE==============================================
    // Longitud, LTal
    var vuLP = 1.7 * VX4_TOTAL + 1.4 * VX4_PP + 1.7 * VX4_PT;
    var verfVuTal = vuLP > avccorteTal ? "AUMENTAR LONGITUD" : "OK";
    var hprimaTal =
      (vutal * 1000) / (0.85 * 0.53 * 100 * Math.pow(fc, 0.5)) - dtal < 0
        ? 0
        : (vutal * 1000) / (0.85 * 0.53 * 100 * Math.pow(fc, 0.5)) - dtal;

    let desingLped = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Longitud</th>
                    <th scope="col">L</th>
                    <td>${Longitud}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${vuLP.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td colspan="4"></td>
                    <td colspan="2">${verfVuTal}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura del pedestal</th>
                    <th scope="col">h'</th>
                    <td>${hprimaTal.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
            `;
    let tablaLpedestal = desingLped;
    let tbody24 = document.getElementById("tablaDCtalLP");
    tbody24.innerHTML = tablaLpedestal;

    //==================================Talon corte de refuerz0=====================================
    var dTRR = ttal - 4;
    var mutalEF = 1.7 * MX3_TOTAL + 1.4 * MX3_PP + 1.7 * MX3_PT;
    var rminAreaTRR1 = rminpan1 * bpantca * dTRR;
    var rminAreaTRR2 = rminpan2 * bpantca * dTRR;

    var aTRR = dTRR - Math.pow(Math.pow(dTRR, 2) - (2 * mutalDC) / (0.85 * 0.9 * fc * bpantca), 0.5);
    var AsTRR = mutalDC / (0.9 * fy * (dTRR - aTRR / 2));
    var verTRR = AsTRR > rminAreaTRR2 ? "OK" : "NOT";
    var asTRR = Math.max(AsTRR, rminAreaTRR2);
    var umbarratalTRR = numbarratal > 1 ? 1 : 0;
    var astotalTalTRR = astotalTal * umbarratalTRR;
    var acertotalTRR = (astotalTalTRR * 100) / asTRR;
    var verftotalDALTRR = acertotalTRR < 20 ? acertotalTRR : 20;

    let desingTalonRR = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Longitud</th>
                    <th scope="col">L</th>
                    <td>${LTal}</td>
                    <th scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${mutalEF.toFixed(2)}</td>
                    <th scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${fy}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${fc}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${bpantca}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${ttal}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${dTRR}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${mutalDC.toFixed(2)}</td>
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
                    <td>${rminpan1.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminpan2.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Areas</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminAreaTRR1.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminAreaTRR2.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col"    colspan="6">6.3.10. Calculo del area del refuerzo(metodo cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura bloque compresion</th>
                    <th scope="col">a</th>
                    <td>${aTRR.toFixed(2)}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero calculado</th>
                    <th scope="col">As</th>
                    <td>${AsTRR.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3" class="text-center">verificacion</th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero minimo</th>
                    <th scope="col">Asmin</th>
                    <td>${verTRR}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${asTRR.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>


                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col"  colspan="6"  >6.3.11 Distribucion del acero longitudinal</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col" >Ø</th>
                    <td>${aceroalpName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${umbarratalTRR}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero a usar</th>
                    <th scope="col">As</th>
                    <td>${astotalTalTRR.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero longitudinal</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${acertotalTRR.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${umbarratalTRR}</td>
                    <td>Ø</td>
                    <td>${aceroalpName}</td>
                    <td>@</td>
                    <td contenteditable="true">${verftotalDALTRR.toFixed(2)}</td>
                </tr>
            `;
    let tablaTalonRR = desingTalonRR;
    let tbody25 = document.getElementById("tablaDCtaltRR");
    tbody25.innerHTML = tablaTalonRR;

    //========================================DC KEY GENERALIDADES=============?============================
    var tkey = keyes * 100;
    var dkey = tkey - 10;
    var muKeys = mukey * 100000;
    var rminAreaKey1 = rminpan1 * bpantca * dkey;
    var rminAreaKey2 = rminpan2 * bpantca * dkey;

    var akey = dkey - Math.pow(Math.pow(dkey, 2) - (2 * muKeys) / (0.85 * 0.9 * fc * bpantca), 0.5);
    var Askey = muKeys / (0.9 * fy * (dkey - akey / 2));
    var verfificarkey = Askey > rminAreaKey2 ? "OK" : "NOT";
    var asKey = Math.max(Askey, rminAreaKey1);

    let tablaGeneralKey = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">DATOS</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Longitud</th>
                    <th scope="col">L</th>
                    <td>${mukey.toFixed(2)}</td>
                    <th scope="col">m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${vukey.toFixed(2)}</td>
                    <th scope="col">Tn-m</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia de fuerza del acero</th>
                    <th scope="col">Fy</th>
                    <td>${fy}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Resistencia a compresión del concreto</th>
                    <th scope="col">f'c</th>
                    <td>${fc}</td>
                    <th scope="col">kg/m<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Ancho a analizar</th>
                    <th scope="col">b</th>
                    <td>${bpantca}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Espesor de la corona</th>
                    <th scope="col">t</th>
                    <td>${tkey}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${dkey}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Momento ultimo</th>
                    <th scope="col">Mu</th>
                    <td>${muKeys.toFixed(2)}</td>
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
                    <td>${rminpan1.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminpan2.toFixed(4)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>

                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="" scope="col"  colspan="6">Areas</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminAreaKey1.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cuantia minima</th>
                    <th scope="col">rMIN</th>
                    <td>${rminAreaKey2.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>



                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col"  colspan="6" > 6.4.2. Calculo del area del refuerzo(metodo cuadratico)</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Altura bloque compresion</th>
                    <th scope="col">a</th>
                    <td>${akey.toFixed(2)}</td>
                    <th scope="col">cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero calculado</th>
                    <th scope="col">As</th>
                    <td>${Askey.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3" class="text-center">verificacion</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero minimo</th>
                    <th scope="col">Asmin</th>
                    <td>${verfificarkey}</td>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${asKey.toFixed(2)}</td>
                    <th scope="col">cm<sup>2</sup></th>
                </tr>

            `;
    let tablaKey = tablaGeneralKey;
    let tbody26 = document.getElementById("tablaKey");
    tbody26.innerHTML = tablaKey;

    //========================================DC KEY DISTIBUCION DEL ACERO LONGITUDINAL =============?============================
    //aceroKey,aceroKeyName,numbarraKey
    var astotalKey = aceroKey * numbarraKey;
    var aceroTotal = Math.round((astotalKey * 100) / asKey);
    var verficacionDAL = aceroTotal < 20 ? aceroTotal : 20;

    let tablaDistribucionAlongitudinal = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">Ø</th>
                    <td>${aceroKeyName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"># de barras</th>
                    <th scope="col">#</th>
                    <td>${numbarraKey}</td>
                    <th>barras</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As</th>
                    <td>${astotalKey.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${aceroTotal.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${numbarraKey}</td>
                    <td>Ø</td>
                    <td>${aceroKeyName}</td>
                    <td>@</td>
                    <td contenteditable="true">${verficacionDAL.toFixed(2)}</td>
                </tr>
            `;
    let tablaDisAcerLong = tablaDistribucionAlongitudinal;
    let tbody27 = document.getElementById("tablaDALKey");
    tbody27.innerHTML = tablaDisAcerLong;

    //========================================DC KEY DISTIBUCION DEL ACERO TRANSVERSAL =============?============================
    //acerotransKey,acerotransKeyName,porpocionKey,
    var as1transKey = rminAreaKey1 * porpocionKey;
    var acerototalKey = Math.round((acerotransKey * 100) / as1transKey);
    var valor1Verf = (numbarraKey = 0) ? 0 : 1;
    var asverftransKey = (numbarraKey = 0) ? 0 : acerototalKey < 25 ? acerototalKey : 25;

    let tablaDistribucionAtranversalKey = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cara del terreno</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${rminAreaKey1.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${porpocionKey.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${as1transKey.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">Ø</th>
                    <td>${acerotransKeyName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area del acero</th>
                    <th scope="col">As</th>
                    <td>${acerotransKey}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${acerototalKey}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${valor1Verf}</td>
                    <td>Ø</td>
                    <td>${acerotransKeyName}</td>
                    <td>@</td>
                    <td contenteditable="true">${asverftransKey.toFixed(2)}</td>
                </tr>
            `;
    let tablaDistAcerTrans = tablaDistribucionAtranversalKey;
    let tbody28 = document.getElementById("tablaDATKey");
    tbody28.innerHTML = tablaDistAcerTrans;

    //========================================DC KEY CARA LIBRE =============?====================================================
    //aceroCLKey,aceroCLKeyName
    var proporcionCLKey = 1 - porpocionKey;
    var as1CLKey = rminAreaKey1 * proporcionCLKey;
    var acerototalCLkey = Math.round((aceroCLKey * 100) / as1CLKey);
    var valor1VerfCL = (numbarraKey = 0) ? 0 : 1;
    var verificacionCant = (numbarraKey = 0) ? 0 : acerototalCLkey < 25 ? acerototalCLkey : 25;

    let tablaCaraLibreKey = `
              <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero calculado</th>
                    <th scope="col">As</th>
                    <td>${rminAreaKey1.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Proporcion</th>
                    <th scope="col">OC</th>
                    <td>${proporcionCLKey.toFixed(2)}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Area de acero a usar</th>
                    <th scope="col">As1</th>
                    <td>${as1CLKey.toFixed(2)}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Diametro del acero</th>
                    <th scope="col">Ø</th>
                    <td>${aceroCLKeyName}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Acero a usar</th>
                    <th scope="col">As</th>
                    <td>${aceroCLKey}</td>
                    <th>cm<sup>2</sup></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Separacion de acero</th>
                    <th scope="col">@</th>
                    <td contenteditable="true">${acerototalCLkey}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col" colspan="3">Entonces</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <td></td>
                    <td>${valor1VerfCL}</td>
                    <td>Ø</td>
                    <td>${aceroCLKeyName}</td>
                    <td>@</td>
                    <td contenteditable="true">${verificacionCant.toFixed(2)}</td>
                </tr>
            `;
    let tablaCaraLibreKeyCA = tablaCaraLibreKey;
    let tbody29 = document.getElementById("tablaCLKey");
    tbody29.innerHTML = tablaCaraLibreKeyCA;

    //========================================DC KEY DISEÑO POR CORTE =============?====================================================
    var vccortekey = (0.53 * dkey * bpantca * Math.pow(fc, 0.5)) / 1000;
    var avccortekey = vccortekey * 0.85;
    var verfcortekey = avccortekey > vukey ? "OK" : "ESTA MAL";

    let tablaDesingCorte = `
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="2">Calcular el cortante a una distancia</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Peralte efectivo</th>
                    <th scope="col">d</th>
                    <td>${dkey.toFixed(2)}</td>
                    <th>cm</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">Vu</th>
                    <td>${vukey.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Aporte del concreto</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante del concreto</th>
                    <th scope="col">Vc</th>
                    <td>${vccortekey.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3"></th>
                    <th scope="col">@Vc</th>
                    <td contenteditable="true">${avccortekey.toFixed(2)}</td>
                    <th>Tn</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Verificamos</th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th scope="col" colspan="3">Cortante ultimo</th>
                    <th scope="col">¿Vc>Vu?</th>
                    <td>${verfcortekey}</td>
                    <th></th>
                </tr>
                <tr class="bg-gray-100 dark:bg-gray-600">
                    <th class="text-center" scope="col" colspan="6"></th>
                </tr>
            `;
    let tabladesingCorteKey = tablaDesingCorte;
    let tbody30 = document.getElementById("tablaDCKey");
    tbody30.innerHTML = tabladesingCorteKey;

    //=================================GRAFICOS================================================//
    //graficoMurosContencion(inputHd, basem, b1graf, hzgraf, inputh, epgraf, egraf, b2graf, considerar, acertrans, valor1, acertransName, asverftrans);
    graficosMCgeneral(
      inputHd,
      basem,
      b1graf,
      hzgraf,
      inputh,
      epgraf,
      egraf,
      b2graf,
      considerar,
      acertrans,
      valor1,
      acertransName,
      asverftrans
    );
    graficoCargasActuantes(
      inputh,
      b1graf,
      hzgraf,
      egraf,
      epgraf,
      b2graf,
      dentelloncorr,
      deae,
      maxpanq2,
      maxpanq1,
      maxpunq2,
      maxpunq1,
      maxtalonq2,
      maxtalonq1,
      maxkeyq2,
      maxkeyq1,
      pmaxterrenotalon
    );
    graficoMomentosFlectores(inputh, b1graf, hzgraf, egraf, epgraf, b2graf, dentelloncorr, mupant, mupun, mutal, mukey);
    graficoFuerzasCortante(inputh, b1graf, hzgraf, egraf, epgraf, b2graf, dentelloncorr, vupant, vupun, vutal, vukey);
    graficoseccionmcontencion();
  }
  // Función para obtener los colores según el modo de tema
  function getColors() {
    var isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return {
      title: isDarkMode ? "white" : "black",
      baseStroke: isDarkMode ? "lightblue" : "blue",
      wallStroke: isDarkMode ? "lightgreen" : "green",
      supportStroke: isDarkMode ? "orange" : "red",
      patternRectStroke: isDarkMode ? "gray" : "black",
      dimensionStroke: isDarkMode ? "pink" : "red",
      text: isDarkMode ? "white" : "black",
    };
  }
  function graficosMCgeneral(
    inputHd,
    basem,
    b1graf,
    hzgraf,
    inputh,
    epgraf,
    egraf,
    b2graf,
    considerar,
    acertrans,
    valor1,
    acertransName,
    asverftrans
  ) {
    let colorMode = "light";
    let svgElement, xAxisElement, yAxisElement, pathElement, pointElements;
    let xScale, yScale; // Declare scales globally

    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleColorModeChange(event) {
      colorMode = event.matches ? "dark" : "light";
      if (svgElement) refreshGraph(); // Actualizar el gráfico si ya existe
    }

    darkModeQuery.addListener(handleColorModeChange);
    handleColorModeChange(darkModeQuery);

    const chartMargin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = 600 - chartMargin.left - chartMargin.right;
    const chartHeight = 600 - chartMargin.top - chartMargin.bottom;

    function initializeGraph() {
      // Eliminar cualquier gráfico existente antes de crear uno nuevo
      d3.select("#graficoFinal svg").remove();

      // Crear nuevo gráfico
      svgElement = d3
        .select("#graficoFinal")
        .append("svg")
        .attr("width", chartWidth + chartMargin.left + chartMargin.right)
        .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
        .append("g")
        .attr("transform", `translate(${chartMargin.left},${chartMargin.top})`);

      xScale = d3.scaleLinear().range([0, chartWidth]);
      yScale = d3.scaleLinear().range([chartHeight, 0]);

      xAxisElement = svgElement.append("g").attr("transform", `translate(0,${chartHeight})`).attr("class", "x-axis");

      yAxisElement = svgElement.append("g").attr("class", "y-axis");

      pathElement = svgElement.append("path").attr("fill", "none").attr("stroke-width", 1.5);

      refreshGraph();
    }

    function refreshGraph() {
      const graphData = puntosMurosCon(
        inputHd,
        basem,
        b1graf,
        hzgraf,
        inputh,
        epgraf,
        egraf,
        b2graf,
        considerar,
        acertrans,
        valor1,
        acertransName,
        asverftrans
      );

      // Calcular el dominio global para todos los datasets
      const allPoints = graphData.flat(); // Combina todos los arrays en uno solo
      xScale.domain([0, d3.max(allPoints, (d) => d.x) * 1.8]);
      yScale.domain([0, d3.max(allPoints, (d) => d.y) * 1.1]);

      // Actualiza los ejes
      xAxisElement.call(d3.axisBottom(xScale));
      yAxisElement.call(d3.axisLeft(yScale));

      // Elimina cualquier gráfico previo
      svgElement.selectAll(".graph-line").remove(); // Remover caminos anteriores
      svgElement.selectAll(".acero-circle").remove(); // Remueve círculos anteriores si los hubiera

      graphData.forEach((dataPoints, index) => {
        const lineGenerator = d3
          .line()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y));

        // Crear un nuevo path para cada conjunto de datos
        svgElement
          .append("path")
          .datum(dataPoints)
          .attr("class", "graph-line") // Añadir clase para identificar
          .attr("fill", "none")
          .attr("stroke", "steelblue") // Podrías cambiar este color dinámicamente si quieres
          .attr("stroke-width", 1.5)
          .attr("d", lineGenerator);

        // Agregar puntos para cada gráfico
        svgElement
          .selectAll(`.data-point-${index}`)
          .data(dataPoints)
          .enter()
          .append("circle")
          .attr("class", `data-point-${index}`) // Usamos clases únicas por gráfico
          .attr("r", 3)
          .attr("cx", (d) => xScale(d.x))
          .attr("cy", (d) => yScale(d.y))
          .attr("fill", "steelblue"); // Podrías cambiar esto dinámicamente también
      });

      // =========================== CÍRCULOS DE ACERO ===========================
      const radio = acertrans; // Radio en pulgadas
      const dataEnd = graphData[5];
      // 1. Círculos de acero - primer conjunto
      const cantidadAcero1 = (basem * 100 - 15) / asverftrans;
      const distanciaEntreCirculos1 = asverftrans / 10.5;

      for (let i = 0; i < cantidadAcero1; i++) {
        svgElement
          .append("circle")
          .attr("class", "acero-circle")
          .attr("cx", xScale(12.5 + i * distanciaEntreCirculos1)) // Usar escala para X
          .attr("cy", yScale(10 + 1.5)) // Usar escala para Y
          .attr("r", radio)
          .attr("fill", "purple")
          .attr("stroke", "purple")
          .attr("stroke-width", 1);
      }

      // 2. Círculos de acero - segundo conjunto
      const cantidadAcero2 = (basem * 100 - 15) / asverftrans;
      const distanciaEntreCirculos2 = asverftrans / 10.5;
      for (let i = 0; i < cantidadAcero2; i++) {
        svgElement
          .append("circle")
          .attr("class", "acero-circle")
          .attr("cx", xScale(12.5 + i * distanciaEntreCirculos2))
          .attr("cy", yScale(dataEnd[4].puntov5y + 0.5))
          .attr("r", radio)
          .attr("fill", "green")
          .attr("stroke", "green")
          .attr("stroke-width", 1);
      }

      // 3. Círculos de acero - tercer conjunto
      const distanciaizq = dataEnd[1].puntoh3y - dataEnd[2].puntoh1y;
      const cantidadAcero3 = distanciaizq / (asverftrans / 10.5);
      const distanciaEntreCirculos3 = asverftrans / 10.5;
      for (let i = 0; i < cantidadAcero3; i++) {
        svgElement
          .append("circle")
          .attr("class", "acero-circle")
          .attr("cx", xScale(dataEnd[0].puntoh3x + 0.5))
          .attr("cy", yScale(2 + i * distanciaEntreCirculos3))
          .attr("r", radio)
          .attr("fill", "blue")
          .attr("stroke", "blue")
          .attr("stroke-width", 1);
      }

      // 4. Círculos de acero - cuarto conjunto (coordenadas dinámicas)
      const distanciaizqarriba = parseFloat(dataEnd[7].puntoh9y) - parseFloat(dataEnd[4].puntov5y);
      const cantidadAcero4 = distanciaizqarriba / (asverftrans / 10.5);
      const distanciaEntreCirculos4 = asverftrans / 10.5;
      const puntoInicioX = dataEnd[0].puntoh3x + 0.5;
      const puntoLlegadaX = dataEnd[5].puntoh6x;
      for (let i = 0; i < cantidadAcero4; i++) {
        svgElement
          .append("circle")
          .attr("class", "acero-circle")
          .attr("cx", xScale(puntoInicioX + (puntoLlegadaX - puntoInicioX) * (i / cantidadAcero4)))
          .attr("cy", yScale(+0.5 + dataEnd[1].puntoh3y + i * distanciaEntreCirculos4))
          .attr("r", radio)
          .attr("fill", "yellow")
          .attr("stroke", "yellow")
          .attr("stroke-width", 1);
      }

      // 5. Círculos de acero - quinto conjunto
      const distancia = dataEnd[7].puntoh9y - dataEnd[6].puntoh6y;
      const cantidadAcero5 = distancia / (asverftrans / 10.5);
      const distanciaEntreCirculos5 = asverftrans / 10.5;
      for (let i = 0; i < cantidadAcero5; i++) {
        svgElement
          .append("circle")
          .attr("class", "acero-circle")
          .attr("cx", xScale(dataEnd[5].puntoh6x))
          .attr("cy", yScale(dataEnd[6].puntoh6y + 0.5 + i * distanciaEntreCirculos5))
          .attr("r", radio)
          .attr("fill", "red")
          .attr("stroke", "red")
          .attr("stroke-width", 1);
      }
      // Cambiar colores de fondo y líneas según el modo
      const bgColor = colorMode === "dark" ? "#1b1e23" : "white";
      const textColor = colorMode === "dark" ? "white" : "#1b1e23";
      const graphColor = colorMode === "dark" ? "lightsteelblue" : "steelblue";

      d3.select("body").style("background-color", bgColor);
      svgElement.style("color", textColor);
      xAxisElement.style("color", textColor);
      yAxisElement.style("color", textColor);
    }

    initializeGraph(); // Inicializar el gráfico solo una vez
  }
  function puntosMurosCon(
    inputHd,
    basem,
    b1graf,
    hzgraf,
    inputh,
    epgraf,
    egraf,
    b2graf,
    considerar,
    acertrans,
    valor1,
    acertransName,
    asverftrans
  ) {
    // Datos de los puntos en X
    var basevastago = (epgraf + egraf) * 10;
    var punto1x = 10;
    var punto2x = 10 + b2graf * 10;
    var punto3x = considerar == "si" ? 10 + b2graf * 10 : 10;
    var punto4x = considerar == "si" ? 10 + b2graf * 10 + basevastago : 10 + basevastago;
    var punto5x = considerar == "si" ? 10 + b2graf * 10 + basevastago : 10;
    var punto6x = 10 + basem * 10;
    var punto7x = 10 + basem * 10;
    var punto8x = 10 + b2graf * 10 + basevastago;
    var punto9x = 10 + b2graf * 10 + basevastago;
    var punto10x = 10 + b2graf * 10 + basevastago - egraf * 10;
    var punto11x = 10 + b2graf * 10;
    var punto12x = 10;
    var punto13x = 10;

    //Datos de los4puntos en 4
    var punto1y = 10;
    var punto2y = 10;
    var punto3y = considerar == "si" ? 10 - inputHd * 10 : 10;
    var punto4y = considerar == "si" ? 10 - inputHd * 10 : 10;
    var punto5y = (considerar = "si") ? 10 : 10;
    var punto6y = 10;
    var punto7y = 10 + hzgraf * 10;
    var punto8y = 10 + hzgraf * 10;
    var punto9y = 10 + hzgraf * 10 + inputh * 10;
    var punto10y = 10 + hzgraf * 10 + inputh * 10;
    var punto11y = 10 + hzgraf * 10;
    var punto12y = 10 + hzgraf * 10;
    var punto13y = 10;

    // var DataGrafMurosFinal = [8.5, 10, 360, 10, 360, 140, 125, 140, 125, 350, 105, 350, 85, 140, 8.5, 140, 8.5, 10];
    var points = [
      { x: punto1x, y: punto1y },
      { x: punto2x, y: punto2y },
      { x: punto3x, y: punto3y },
      { x: punto4x, y: punto4y },
      { x: punto5x, y: punto5y },
      { x: punto6x, y: punto6y },
      { x: punto7x, y: punto7y },
      { x: punto8x, y: punto8y },
      { x: punto9x, y: punto9y },
      { x: punto10x, y: punto10y },
      { x: punto11x, y: punto11y },
      { x: punto12x, y: punto12y },
      { x: punto13x, y: punto13y },
    ];

    //data para vigas de forma horizontal
    var puntov1x = 10 + 2;
    var puntov2x = 10 + 2;
    var puntov3x = 10 + basem * 10 - 2;
    var puntov4x = 10 + basem * 10 - 2;

    var puntov5x = 10 + 3;
    var puntov6x = 10 + 3;
    var puntov7x = 10 + basem * 10 - 3;
    var puntov8x = 10 + basem * 10 - 3;

    var puntov1y = 10 + 3;
    var puntov2y = 10 + 1;
    var puntov3y = 10 + 1;
    var puntov4y = 10 + 3;

    var puntov5y = 10 + hzgraf * 10 - 2;
    var puntov6y = 10 + hzgraf * 10 - 1;
    var puntov7y = 10 + hzgraf * 10 - 1;
    var puntov8y = 10 + hzgraf * 10 - 2;

    var vigasbasedebajo = [
      { x: puntov1x, y: puntov1y },
      { x: puntov2x, y: puntov2y },
      { x: puntov3x, y: puntov3y },
      { x: puntov4x, y: puntov4y },
    ];

    var vigasbasearriba = [
      { x: puntov5x, y: puntov5y },
      { x: puntov6x, y: puntov6y },
      { x: puntov7x, y: puntov7y },
      { x: puntov8x, y: puntov8y },
    ];

    //data para vigas de forma vertical
    var puntoh1x = considerar == "si" ? 10 + b2graf * 10 + 1.5 : 10 + b2graf * 10 + 1.5;
    var puntoh2x = considerar == "si" ? 10 + b2graf * 10 + 1 : 10 + b2graf * 10 + 1;
    var puntoh3x = considerar == "si" ? 10 + b2graf * 10 + 1 : 10 + b2graf * 10 + 1;
    var puntoh4x = 10 + b2graf * 10 + 0.5 + epgraf * 10;
    var puntoh5x = 10 + b2graf * 10 + 0.5 + 0.5 + epgraf * 10;

    var puntoh6x = considerar == "si" ? 10 + b2graf * 10 + basevastago - 1 : 10 + b2graf * 10 + basevastago - 1.5;
    var puntoh7x = considerar == "si" ? 10 + b2graf * 10 + basevastago - 0.5 : 10 + b2graf * 10 + basevastago - 0.5;
    var puntoh8x = considerar == "si" ? 10 + b2graf * 10 + basevastago - 0.5 : 10 + b2graf * 10 + basevastago - 0.5;
    var puntoh9x = considerar == "si" ? 10 + b2graf * 10 + basevastago - 1 : 10 + b2graf * 10 + basevastago - 10 - 1.5;

    var puntoh1y = considerar == "si" ? 10 - inputHd * 10 + 2.5 : 1 + 2.5;
    var puntoh2y = considerar == "si" ? 10 - inputHd * 10 + 2.5 : 1 + 2.5;
    var puntoh3y = considerar == "si" ? 10 + hzgraf * 10 - 0.5 : 10 + hzgraf * 10 - 0.5;
    var puntoh4y = 10 + hzgraf * 10 + inputh * 10 - 2.5;
    var puntoh5y = 10 + hzgraf * 10 + inputh * 10 - 2.5;

    var puntoh6y = considerar == "si" ? 10 - inputHd * 10 + 1.5 : 10 + 1.5;
    var puntoh7y = considerar == "si" ? 10 - inputHd * 10 + 1.5 : 10 + 1.5;
    var puntoh8y = considerar == "si" ? 10 + hzgraf * 10 + inputh * 10 - 2 : 10 + hzgraf * 10 + inputh * 10 - 2;
    var puntoh9y = considerar == "si" ? 10 + hzgraf * 10 + inputh * 10 - 2 : 10 + hzgraf * 10 + inputh * 10 - 2;

    var vigasVerticalesDATAiz = [
      { x: puntoh1x, y: puntoh1y },
      { x: puntoh2x, y: puntoh2y },
      { x: puntoh3x, y: puntoh3y },
      { x: puntoh4x, y: puntoh4y },
      { x: puntoh5x, y: puntoh5y },
    ];
    var vigasVerticalesDATAder = [
      { x: puntoh6x, y: puntoh6y },
      { x: puntoh7x, y: puntoh7y },
      { x: puntoh8x, y: puntoh8y },
      { x: puntoh9x, y: puntoh9y },
    ];
    var datosAcer = [
      { puntoh3x: puntoh3x },
      { puntoh3y: puntoh3y },
      { puntoh1y: puntoh1y },
      { puntov5x: puntov5x },
      { puntov5y: puntov5y },
      { puntoh6x: puntoh6x },
      { puntoh6y: puntoh6y },
      { puntoh9y: parseFloat(puntoh9y) },
    ];
    //return [points, vigasbasedebajo, vigasbasearriba, vigasVerticalesDATAiz, vigasVerticalesDATAder];
    return [points, vigasbasedebajo, vigasbasearriba, vigasVerticalesDATAiz, vigasVerticalesDATAder, datosAcer];
  }
  //grafico del muro de contencion
  function puntosMC(baseHeight, wallWidth, wallHeight, b1graf, epgraf, b2graf, dentelloncorr, inputh, egraf, hzgraf) {
    var middle = wallWidth + epgraf;
    var baseTotal = b2graf + middle + b1graf;

    const puntopre1x = 0;
    const puntopre2x = b2graf;
    const puntopre3x = b2graf + (epgraf + egraf);
    const puntopre4x = baseTotal;
    const puntopre5x = baseTotal;
    const puntopre6x = baseTotal - b1graf;
    const puntopre7x = baseTotal - b1graf;
    const puntopre8x = baseTotal - b1graf - egraf;
    const puntopre9x = baseTotal - b1graf - egraf - hzgraf;
    const puntopre10x = 0;
    const puntopre11x = 0;

    const puntopre1y = 0;
    const puntopre2y = 0;
    const puntopre3y = 0;
    const puntopre4y = 0;
    const puntopre5y = parseFloat(hzgraf);
    const puntopre6y = parseFloat(hzgraf);
    const puntopre7y = parseFloat(inputh);
    const puntopre8y = parseFloat(inputh);
    const puntopre9y = parseFloat(hzgraf);
    const puntopre10y = parseFloat(hzgraf);
    const puntopre11y = 0;

    const puntos = [
      { x: puntopre1x, y: puntopre1y },
      { x: puntopre2x, y: puntopre2y },
      { x: puntopre3x, y: puntopre3y },
      { x: puntopre4x, y: puntopre4y },
      { x: puntopre5x, y: puntopre5y },
      { x: puntopre6x, y: puntopre6y },
      { x: puntopre7x, y: puntopre7y },
      { x: puntopre8x, y: puntopre8y },
      { x: puntopre9x, y: puntopre9y },
      { x: puntopre10x, y: puntopre10y },
      { x: puntopre11x, y: puntopre11y },
    ];

    //diente dentellon
    const aling = baseTotal + 2;
    const diente1x = b2graf + aling;
    const diente2x = b2graf + aling;
    const diente3x = b2graf + (epgraf + egraf) + aling;
    const diente4x = b2graf + (epgraf + egraf) + aling;
    const diente5x = aling + b2graf;

    const diente1y = aling;
    const diente2y = dentelloncorr + aling;
    const diente3y = dentelloncorr + aling;
    const diente4y = aling;
    const diente5y = aling;

    const diente = [
      { x: diente1x, y: diente1y },
      { x: diente2x, y: diente2y },
      { x: diente3x, y: diente3y },
      { x: diente4x, y: diente4y },
      { x: diente5x, y: diente5y },
    ];
    return [puntos, diente];
  }
  function graficoseccionmcontencion() {
    let colorModepre = "light";
    let svgElement, xAxisElement, yAxisElement, pathElement, pointElements;
    let xScale, yScale; // Declare scales globally

    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleColorModeChangepre(event) {
      colorModepre = event.matches ? "dark" : "light";
      if (svgElement) refreshGraph(); // Actualizar el gráfico si ya existe
    }

    darkModeQuery.addListener(handleColorModeChangepre);
    handleColorModeChangepre(darkModeQuery);

    const chartMargin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = 600 - chartMargin.left - chartMargin.right;
    const chartHeight = 600 - chartMargin.top - chartMargin.bottom;

    function initializeGraphpre() {
      // Eliminar cualquier gráfico existente antes de crear uno nuevo
      d3.select("#seccionmcontencion svg").remove();

      // Crear nuevo gráfico
      svgElement = d3
        .select("#seccionmcontencion")
        .append("svg")
        .attr("width", chartWidth + chartMargin.left + chartMargin.right)
        .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
        .append("g")
        .attr("transform", `translate(${chartMargin.left},${chartMargin.top})`);

      xScale = d3.scaleLinear().range([0, chartWidth]);
      yScale = d3.scaleLinear().range([chartHeight, 0]);

      xAxisElement = svgElement.append("g").attr("transform", `translate(0,${chartHeight})`).attr("class", "x-axis");

      yAxisElement = svgElement.append("g").attr("class", "y-axis");

      pathElement = svgElement.append("path").attr("fill", "none").attr("stroke-width", 1.5);

      refreshGraphpre();
    }

    function refreshGraphpre() {
      const wallHeight = parseFloat(document.getElementById("H").value);
      const b1graf = parseFloat(document.getElementById("b1graf").value);
      const baseHeight = parseFloat(document.getElementById("hzgraf").value);
      const wallWidth = parseFloat(document.getElementById("egraf").value);
      const epgraf = parseFloat(document.getElementById("epgraf").value);
      const b2graf = parseFloat(document.getElementById("b2graf").value);
      const dentelloncorr = parseFloat(document.getElementById("dentelloncorr").value);
      const inputh = parseFloat(document.getElementById("H").value);
      const egraf = parseFloat(document.getElementById("egraf").value);
      const hzgraf = parseFloat(document.getElementById("hzgraf").value);
      const graphData = puntosMC(
        baseHeight,
        wallWidth,
        wallHeight,
        b1graf,
        epgraf,
        b2graf,
        dentelloncorr,
        inputh,
        egraf,
        hzgraf
      );

      // Calcular el dominio global para todos los datasets
      const allPoints = graphData.flat(); // Combina todos los arrays en uno solo
      xScale.domain([0, d3.max(allPoints, (d) => d.x) * 1.5]);
      yScale.domain([0, d3.max(allPoints, (d) => d.y) * 1.1]);

      // Actualiza los ejes
      xAxisElement.call(d3.axisBottom(xScale));
      yAxisElement.call(d3.axisLeft(yScale));

      // Elimina cualquier gráfico previo
      svgElement.selectAll(".graph-line").remove(); // Remover caminos anteriores
      svgElement.selectAll(".acero-circle").remove(); // Remueve círculos anteriores si los hubiera

      graphData.forEach((dataPoints, index) => {
        const lineGenerator = d3
          .line()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y));

        // Crear un nuevo path para cada conjunto de datos
        svgElement
          .append("path")
          .datum(dataPoints)
          .attr("class", "graph-line") // Añadir clase para identificar
          .attr("fill", "none")
          .attr("stroke", "steelblue") // Podrías cambiar este color dinámicamente si quieres
          .attr("stroke-width", 1.5)
          .attr("d", lineGenerator);

        // Agregar puntos para cada gráfico
        svgElement
          .selectAll(`.data-point-${index}`)
          .data(dataPoints)
          .enter()
          .append("circle")
          .attr("class", `data-point-${index}`) // Usamos clases únicas por gráfico
          .attr("r", 3)
          .attr("cx", (d) => xScale(d.x))
          .attr("cy", (d) => yScale(d.y))
          .attr("fill", "steelblue"); // Podrías cambiar esto dinámicamente también
      });

      // Cambiar colores de fondo y líneas según el modo
      const bgColor = colorModepre === "dark" ? "#1b1e23" : "white";
      const textColor = colorModepre === "dark" ? "white" : "#1b1e23";
      const graphColor = colorModepre === "dark" ? "lightsteelblue" : "steelblue";

      d3.select("body").style("background-color", bgColor);
      svgElement.style("color", textColor);
      xAxisElement.style("color", textColor);
      yAxisElement.style("color", textColor);
    }

    initializeGraphpre(); // Inicializar el gráfico solo una vez
  }

  //Diagrama de Cargas Actuantes
  function puntosCargasActuantes(
    inputh,
    b1graf,
    hzgraf,
    egraf,
    epgraf,
    b2graf,
    dentelloncorr,
    deae,
    maxpanq2,
    maxpanq1,
    maxpunq2,
    maxpunq1,
    maxtalonq2,
    maxtalonq1,
    maxkeyq2,
    maxkeyq1
  ) {
    const wallHeight = inputh;
    const baseHeight = hzgraf;
    const wallWidth = egraf;
    var middle = wallWidth + epgraf;
    var baseTotal = b2graf + middle + b1graf;

    //diente dentellon
    const aling = baseTotal + 2;
    const diente1x = b2graf + aling;
    const diente2x = b2graf + aling;
    const diente3x = b2graf + (epgraf + egraf) + aling;
    const diente4x = b2graf + (epgraf + egraf) + aling;
    const diente5x = aling + b2graf;

    const diente1y = aling;
    const diente2y = dentelloncorr + aling;
    const diente3y = dentelloncorr + aling;
    const diente4y = aling;
    const diente5y = aling;

    const diente = [
      { x: diente1x, y: diente1y },
      { x: diente2x, y: diente2y },
      { x: diente3x, y: diente3y },
      { x: diente4x, y: diente4y },
      { x: diente5x, y: diente5y },
    ];

    const puntopre1x = 0;
    const puntopre2x = b2graf;
    const puntopre1y = 0;
    const puntopre2y = 0;

    const puntopre3y = parseFloat(hzgraf);
    const puntopre3x = b2graf + (epgraf + egraf);
    const puntopre4x = baseTotal;
    const puntopre5y = parseFloat(hzgraf);

    const base1 = [
      { x: puntopre1x, y: puntopre1y },
      { x: puntopre2x, y: puntopre2y },
      { x: puntopre2x, y: puntopre3y },
      { x: puntopre1x, y: puntopre3y },
      { x: puntopre1x, y: puntopre1y },
    ];

    const base2 = [
      { x: puntopre3x, y: puntopre1y },
      { x: puntopre4x, y: puntopre1y },
      { x: puntopre4x, y: puntopre5y },
      { x: puntopre3x, y: puntopre5y },
      { x: puntopre3x, y: puntopre1y },
    ];

    const puntopre6x = baseTotal - b1graf;
    const puntopre7x = baseTotal - b1graf;
    const puntopre8x = baseTotal - b1graf - egraf;
    const puntopre9x = baseTotal - b1graf - egraf - hzgraf;

    const puntopre6y = parseFloat(hzgraf) + 0.5;
    const puntopre7y = parseFloat(inputh) + 0.5;
    const puntopre8y = parseFloat(inputh) + 0.5;
    const puntopre9y = parseFloat(hzgraf) + 0.5;

    const triangulo = [
      { x: puntopre6x, y: puntopre6y },
      { x: puntopre7x, y: puntopre7y },
      { x: puntopre8x, y: puntopre8y },
      { x: puntopre9x, y: puntopre9y },
      { x: puntopre6x, y: puntopre6y },
    ];

    return [diente, base1, base2, triangulo];
  }
  function graficoCargasActuantes(
    inputh,
    b1graf,
    hzgraf,
    egraf,
    epgraf,
    b2graf,
    dentelloncorr,
    deae,
    maxpanq2,
    maxpanq1,
    maxpunq2,
    maxpunq1,
    maxtalonq2,
    maxtalonq1,
    maxkeyq2,
    maxkeyq1,
    pmaxterrenotalon
  ) {
    let colorModepre = "light";
    let svgElement, xAxisElement, yAxisElement;
    let xScale, yScale; // Declare scales globally

    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleColorModeChangepre(event) {
      colorModepre = event.matches ? "dark" : "light";
      if (svgElement) refreshGraphpre(); // Actualizar el gráfico si ya existe
    }

    darkModeQuery.addListener(handleColorModeChangepre);
    handleColorModeChangepre(darkModeQuery);

    const chartMargin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = 600 - chartMargin.left - chartMargin.right;
    const chartHeight = 600 - chartMargin.top - chartMargin.bottom;

    function initializeGraphpre() {
      // Eliminar cualquier gráfico existente antes de crear uno nuevo
      d3.select("#seccionCargasActuantes svg").remove();

      // Crear nuevo gráfico
      svgElement = d3
        .select("#seccionCargasActuantes")
        .append("svg")
        .attr("width", chartWidth + chartMargin.left + chartMargin.right)
        .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
        .append("g")
        .attr("transform", `translate(${chartMargin.left},${chartMargin.top})`);

      xScale = d3.scaleLinear().range([0, chartWidth]);
      yScale = d3.scaleLinear().range([chartHeight, 0]);

      xAxisElement = svgElement.append("g").attr("transform", `translate(0,${chartHeight})`).attr("class", "x-axis");

      yAxisElement = svgElement.append("g").attr("class", "y-axis");

      refreshGraphpre();
    }

    function addDimensions(data, q2pan, q1pan, mediopan, q1pun, q2pun, q2tal, q1tal, keypanq2, keypanq1) {
      //return [diente, base1, base2, triangulo];
      console.log(data);
      const pantalla = data[3];
      const punta = data[1];
      const talon = data[2];
      const dentellon = data[0];

      //Añadir etiquetas para base y altura en cada gráfico Triangulo
      svgElement
        .append("text")
        .attr("x", xScale(pantalla[0].x) + 0.5) // Ajuste de posición
        .attr("y", yScale(pantalla[0].y)) // Ajuste de posición
        .attr("fill", "red")
        .attr("font-size", "12px")
        .text(`${q2pan}`); // Etiqueta para la base

      svgElement
        .append("text")
        .attr("x", xScale(pantalla[0].x) + 0.5) // Ajuste de posición
        .attr("y", yScale(pantalla[1].y / 2)) // Ajuste de posición
        .attr("fill", "green")
        .attr("font-size", "12px")
        .text(`${mediopan}`); // Etiqueta para la base

      svgElement
        .append("text")
        .attr("x", xScale(pantalla[0].x) + 0.5) // Ajuste de posición
        .attr("y", yScale(pantalla[1].y)) // Ajuste de posición
        .attr("fill", "yellow")
        .attr("font-size", "12px")
        .text(`${q1pan}`); // Etiqueta para la altura
      //BASE 1
      // Cotas para "base 1"
      svgElement
        .append("text")
        .attr("x", xScale(punta[3].x))
        .attr("y", yScale(punta[3].y))
        .attr("fill", "orange")
        .attr("font-size", "11px")
        .text(`${q2pun}`);

      svgElement
        .append("text")
        .attr("x", xScale(punta[2].x - 0.5))
        .attr("y", yScale(punta[2].y))
        .attr("fill", "purple")
        .attr("font-size", "11px")
        .text(`${q1pun}`);
      //BASE 2
      svgElement
        .append("text")
        .attr("x", xScale(talon[3].x))
        .attr("y", yScale(talon[3].y))
        .attr("fill", "orange")
        .attr("font-size", "11px")
        .text(`${q2tal}`);

      svgElement
        .append("text")
        .attr("x", xScale(talon[2].x - 0.5))
        .attr("y", yScale(talon[2].y))
        .attr("fill", "red")
        .attr("font-size", "11px")
        .text(`${q1tal}`);

      svgElement
        .append("text")
        .attr("x", xScale(talon[2].x - 0.5))
        .attr("y", yScale(talon[2].y - 0.5))
        .attr("fill", "yellow")
        .attr("font-size", "11px")
        .text(`${pmaxterrenotalon}`);
      //DENTELLON
      svgElement
        .append("text")
        .attr("x", xScale(dentellon[2].x))
        .attr("y", yScale(dentellon[2].y))
        .attr("fill", "orange")
        .attr("font-size", "11px")
        .text(`${keypanq1}`);

      svgElement
        .append("text")
        .attr("x", xScale(dentellon[3].x))
        .attr("y", yScale(dentellon[3].y))
        .attr("fill", "purple")
        .attr("font-size", "11px")
        .text(`${keypanq2}`);
    }

    function refreshGraphpre() {
      const graphData = puntosCargasActuantes(
        inputh,
        b1graf,
        hzgraf,
        egraf,
        epgraf,
        b2graf,
        dentelloncorr,
        deae,
        maxpanq2,
        maxpanq1,
        maxpunq2,
        maxpunq1,
        maxtalonq2,
        maxtalonq1,
        maxkeyq2,
        maxkeyq1
      );
      //trinangulo
      var q2pan = parseFloat(maxpanq2).toFixed(2);
      var q1pan = parseFloat(maxpanq1).toFixed(2);
      var mediopan = parseFloat(deae).toFixed(2);
      //base 1
      var q1pun = parseFloat(maxpunq1).toFixed(2);
      var q2pun = parseFloat(maxpunq2).toFixed(2);
      //base 2
      var q2tal = parseFloat(maxtalonq2).toFixed(2);
      var q1tal = parseFloat(maxtalonq1).toFixed(2);
      var q3terreno = parseFloat(pmaxterrenotalon).toFixed(2);
      //dentellon
      var keypanq2 = parseFloat(maxkeyq2).toFixed(2);
      var keypanq1 = parseFloat(maxkeyq1).toFixed(2);

      // Calcular el dominio global para todos los datasets
      const allPoints = graphData.flat(); // Combina todos los arrays en uno solo
      xScale.domain([0, d3.max(allPoints, (d) => d.x) * 1.1]);
      yScale.domain([0, d3.max(allPoints, (d) => d.y) * 1.1]);

      // Actualiza los ejes
      xAxisElement.call(d3.axisBottom(xScale));
      yAxisElement.call(d3.axisLeft(yScale));

      // Elimina cualquier gráfico previo
      svgElement.selectAll(".graph-line").remove(); // Remover caminos anteriores
      svgElement.selectAll(".acero-circle").remove(); // Remueve círculos anteriores si los hubiera

      graphData.forEach((dataPoints, index) => {
        const lineGenerator = d3
          .line()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y));

        // Crear un nuevo path para cada conjunto de datos
        svgElement
          .append("path")
          .datum(dataPoints)
          .attr("class", "graph-line") // Añadir clase para identificar
          .attr("fill", "none")
          .attr("stroke", "steelblue") // Color dinámico
          .attr("stroke-width", 1.5)
          .attr("d", lineGenerator);

        // Agregar puntos para cada gráfico
        svgElement
          .selectAll(`.data-point-${index}`)
          .data(dataPoints)
          .enter()
          .append("circle")
          .attr("class", `data-point-${index}`) // Usamos clases únicas por gráfico
          .attr("r", 3)
          .attr("cx", (d) => xScale(d.x))
          .attr("cy", (d) => yScale(d.y))
          .attr("fill", "steelblue"); // Color dinámico
      });

      // Cambiar colores de fondo y líneas según el modo
      const bgColor = colorModepre === "dark" ? "#1b1e23" : "white";
      const textColor = colorModepre === "dark" ? "white" : "#1b1e23";

      d3.select("body").style("background-color", bgColor);
      svgElement.style("color", textColor);
      xAxisElement.style("color", textColor);
      yAxisElement.style("color", textColor);

      addDimensions(graphData, q2pan, q1pan, mediopan, q1pun, q2pun, q2tal, q1tal, keypanq2, keypanq1, q3terreno);
    }

    initializeGraphpre(); // Inicializar el gráfico solo una vez
  }

  //Diagrama de momentos flectores
  function graficoMomentosFlectores(
    inputh,
    b1graf,
    hzgraf,
    egraf,
    epgraf,
    b2graf,
    dentelloncorr,
    mupant,
    mupun,
    mutal,
    mukey
  ) {
    let colorModepre = "light";
    let svgElement, xAxisElement, yAxisElement;
    let xScale, yScale; // Declare scales globally

    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleColorModeChangepre(event) {
      colorModepre = event.matches ? "dark" : "light";
      if (svgElement) refreshGraphpre(); // Actualizar el gráfico si ya existe
    }

    darkModeQuery.addListener(handleColorModeChangepre);
    handleColorModeChangepre(darkModeQuery);

    const chartMargin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = 600 - chartMargin.left - chartMargin.right;
    const chartHeight = 600 - chartMargin.top - chartMargin.bottom;

    function initializeGraphpre() {
      // Eliminar cualquier gráfico existente antes de crear uno nuevo
      d3.select("#DiagramaMomentosFlectores svg").remove();

      // Crear nuevo gráfico
      svgElement = d3
        .select("#DiagramaMomentosFlectores")
        .append("svg")
        .attr("width", chartWidth + chartMargin.left + chartMargin.right)
        .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
        .append("g")
        .attr("transform", `translate(${chartMargin.left},${chartMargin.top})`);

      xScale = d3.scaleLinear().range([0, chartWidth]);
      yScale = d3.scaleLinear().range([chartHeight, 0]);

      xAxisElement = svgElement.append("g").attr("transform", `translate(0,${chartHeight})`).attr("class", "x-axis");

      yAxisElement = svgElement.append("g").attr("class", "y-axis");

      refreshGraphpre();
    }

    function addDimensions(data, Mupan, Mupun, Mutal, MuKey) {
      //return [diente, base1, base2, triangulo];
      console.log(data);
      const pantalla = data[3];
      const punta = data[1];
      const talon = data[2];
      const dentellon = data[0];

      //Añadir etiquetas para base y altura en cada gráfico Triangulo
      svgElement
        .append("text")
        .attr("x", xScale(pantalla[0].x) + 0.5) // Ajuste de posición
        .attr("y", yScale(pantalla[0].y)) // Ajuste de posición
        .attr("fill", "red")
        .attr("font-size", "12px")
        .text(`${Mupan}`); // Etiqueta para la base
      //BASE 1
      // Cotas para "base 1"
      svgElement
        .append("text")
        .attr("x", xScale(punta[2].x - 0.5))
        .attr("y", yScale(punta[2].y))
        .attr("fill", "yellow")
        .attr("font-size", "11px")
        .text(`${Mupun}`);
      //BASE 2
      svgElement
        .append("text")
        .attr("x", xScale(talon[3].x))
        .attr("y", yScale(talon[3].y))
        .attr("fill", "orange")
        .attr("font-size", "11px")
        .text(`${Mutal}`);
      //DENTELLON
      svgElement
        .append("text")
        .attr("x", xScale(dentellon[2].x))
        .attr("y", yScale(dentellon[2].y))
        .attr("fill", "orange")
        .attr("font-size", "11px")
        .text(`${MuKey}`);
    }

    function refreshGraphpre() {
      const graphData = puntosCargasActuantes(
        inputh,
        b1graf,
        hzgraf,
        egraf,
        epgraf,
        b2graf,
        dentelloncorr,
        mupant,
        mupun,
        mutal,
        mukey
      );
      //trinangulo
      var Mupan = parseFloat(mupant).toFixed(2);
      // //base 1
      var Mupun = parseFloat(mupun).toFixed(2);
      // //base 2
      var Mutal = parseFloat(mutal).toFixed(2);
      // //dentellon
      var MuKey = parseFloat(mukey).toFixed(2);

      // Calcular el dominio global para todos los datasets
      const allPoints = graphData.flat(); // Combina todos los arrays en uno solo
      xScale.domain([0, d3.max(allPoints, (d) => d.x) * 1.1]);
      yScale.domain([0, d3.max(allPoints, (d) => d.y) * 1.1]);

      // Actualiza los ejes
      xAxisElement.call(d3.axisBottom(xScale));
      yAxisElement.call(d3.axisLeft(yScale));

      // Elimina cualquier gráfico previo
      svgElement.selectAll(".graph-line").remove(); // Remover caminos anteriores
      svgElement.selectAll(".acero-circle").remove(); // Remueve círculos anteriores si los hubiera

      graphData.forEach((dataPoints, index) => {
        const lineGenerator = d3
          .line()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y));

        // Crear un nuevo path para cada conjunto de datos
        svgElement
          .append("path")
          .datum(dataPoints)
          .attr("class", "graph-line") // Añadir clase para identificar
          .attr("fill", "none")
          .attr("stroke", "steelblue") // Color dinámico
          .attr("stroke-width", 1.5)
          .attr("d", lineGenerator);

        // Agregar puntos para cada gráfico
        svgElement
          .selectAll(`.data-point-${index}`)
          .data(dataPoints)
          .enter()
          .append("circle")
          .attr("class", `data-point-${index}`) // Usamos clases únicas por gráfico
          .attr("r", 3)
          .attr("cx", (d) => xScale(d.x))
          .attr("cy", (d) => yScale(d.y))
          .attr("fill", "steelblue"); // Color dinámico
      });

      // Cambiar colores de fondo y líneas según el modo
      const bgColor = colorModepre === "dark" ? "#1b1e23" : "white";
      const textColor = colorModepre === "dark" ? "white" : "#1b1e23";

      d3.select("body").style("background-color", bgColor);
      svgElement.style("color", textColor);
      xAxisElement.style("color", textColor);
      yAxisElement.style("color", textColor);

      addDimensions(graphData, Mupan, Mupun, Mutal, MuKey);
    }

    initializeGraphpre(); // Inicializar el gráfico solo una vez
  }

  //Diagrama de fuerzas cortantes
  function graficoFuerzasCortante(
    inputh,
    b1graf,
    hzgraf,
    egraf,
    epgraf,
    b2graf,
    dentelloncorr,
    vupant,
    vupun,
    vutal,
    vukey
  ) {
    let colorModepre = "light";
    let svgElement, xAxisElement, yAxisElement;
    let xScale, yScale; // Declare scales globally

    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleColorModeChangepre(event) {
      colorModepre = event.matches ? "dark" : "light";
      if (svgElement) refreshGraphpre(); // Actualizar el gráfico si ya existe
    }

    darkModeQuery.addListener(handleColorModeChangepre);
    handleColorModeChangepre(darkModeQuery);

    const chartMargin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = 600 - chartMargin.left - chartMargin.right;
    const chartHeight = 600 - chartMargin.top - chartMargin.bottom;

    function initializeGraphpre() {
      // Eliminar cualquier gráfico existente antes de crear uno nuevo
      d3.select("#DiagramaFuerzaCortante svg").remove();

      // Crear nuevo gráfico
      svgElement = d3
        .select("#DiagramaFuerzaCortante")
        .append("svg")
        .attr("width", chartWidth + chartMargin.left + chartMargin.right)
        .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
        .append("g")
        .attr("transform", `translate(${chartMargin.left},${chartMargin.top})`);

      xScale = d3.scaleLinear().range([0, chartWidth]);
      yScale = d3.scaleLinear().range([chartHeight, 0]);

      xAxisElement = svgElement.append("g").attr("transform", `translate(0,${chartHeight})`).attr("class", "x-axis");

      yAxisElement = svgElement.append("g").attr("class", "y-axis");

      refreshGraphpre();
    }

    function addDimensions(data, VUpan, VUpun, Vutal, VUKey) {
      //return [diente, base1, base2, triangulo];
      console.log(data);
      const pantalla = data[3];
      const punta = data[1];
      const talon = data[2];
      const dentellon = data[0];

      //Añadir etiquetas para base y altura en cada gráfico Triangulo
      svgElement
        .append("text")
        .attr("x", xScale(pantalla[0].x) + 0.5) // Ajuste de posición
        .attr("y", yScale(pantalla[0].y)) // Ajuste de posición
        .attr("fill", "red")
        .attr("font-size", "12px")
        .text(`${VUpan}`); // Etiqueta para la base
      //BASE 1
      // Cotas para "base 1"
      svgElement
        .append("text")
        .attr("x", xScale(punta[2].x - 0.5))
        .attr("y", yScale(punta[2].y))
        .attr("fill", "yellow")
        .attr("font-size", "11px")
        .text(`${VUpun}`);
      //BASE 2
      svgElement
        .append("text")
        .attr("x", xScale(talon[3].x))
        .attr("y", yScale(talon[3].y))
        .attr("fill", "orange")
        .attr("font-size", "11px")
        .text(`${Vutal}`);
      //DENTELLON
      svgElement
        .append("text")
        .attr("x", xScale(dentellon[2].x))
        .attr("y", yScale(dentellon[2].y))
        .attr("fill", "orange")
        .attr("font-size", "11px")
        .text(`${VUKey}`);
    }

    function refreshGraphpre() {
      const graphData = puntosCargasActuantes(
        inputh,
        b1graf,
        hzgraf,
        egraf,
        epgraf,
        b2graf,
        dentelloncorr,
        vupant,
        vupun,
        vutal,
        vukey
      );
      //trinangulo
      var VUpan = parseFloat(vupant).toFixed(2);
      // //base 1
      var VUpun = parseFloat(vupun).toFixed(2);
      // //base 2
      var Vutal = parseFloat(vutal).toFixed(2);
      // //dentellon
      var VUKey = parseFloat(vukey).toFixed(2);

      // Calcular el dominio global para todos los datasets
      const allPoints = graphData.flat(); // Combina todos los arrays en uno solo
      xScale.domain([0, d3.max(allPoints, (d) => d.x) * 1.1]);
      yScale.domain([0, d3.max(allPoints, (d) => d.y) * 1.1]);

      // Actualiza los ejes
      xAxisElement.call(d3.axisBottom(xScale));
      yAxisElement.call(d3.axisLeft(yScale));

      // Elimina cualquier gráfico previo
      svgElement.selectAll(".graph-line").remove(); // Remover caminos anteriores
      svgElement.selectAll(".acero-circle").remove(); // Remueve círculos anteriores si los hubiera

      graphData.forEach((dataPoints, index) => {
        const lineGenerator = d3
          .line()
          .x((d) => xScale(d.x))
          .y((d) => yScale(d.y));

        // Crear un nuevo path para cada conjunto de datos
        svgElement
          .append("path")
          .datum(dataPoints)
          .attr("class", "graph-line") // Añadir clase para identificar
          .attr("fill", "none")
          .attr("stroke", "steelblue") // Color dinámico
          .attr("stroke-width", 1.5)
          .attr("d", lineGenerator);

        // Agregar puntos para cada gráfico
        svgElement
          .selectAll(`.data-point-${index}`)
          .data(dataPoints)
          .enter()
          .append("circle")
          .attr("class", `data-point-${index}`) // Usamos clases únicas por gráfico
          .attr("r", 3)
          .attr("cx", (d) => xScale(d.x))
          .attr("cy", (d) => yScale(d.y))
          .attr("fill", "steelblue"); // Color dinámico
      });

      // Cambiar colores de fondo y líneas según el modo
      const bgColor = colorModepre === "dark" ? "#1b1e23" : "white";
      const textColor = colorModepre === "dark" ? "white" : "#1b1e23";

      d3.select("body").style("background-color", bgColor);
      svgElement.style("color", textColor);
      xAxisElement.style("color", textColor);
      yAxisElement.style("color", textColor);

      addDimensions(graphData, VUpan, VUpun, Vutal, VUKey);
    }

    initializeGraphpre(); // Inicializar el gráfico solo una vez
  }

  function graficoMurosContencion(
    inputHd,
    basem,
    b1graf,
    hzgraf,
    inputh,
    epgraf,
    egraf,
    b2graf,
    considerar,
    acertrans,
    valor1,
    acertransName,
    asverftran
  ) {
    var colors = getColors();
    var seccionMC = document.getElementById("container");
    var initialWidth = 800; // Tamaño inicial deseado
    var initialHeight = 1600;
    var stage = new Konva.Stage({
      container: seccionMC,
      width: initialWidth,
      height: initialHeight,
    });

    var layer = new Konva.Layer();
    var scala = 1.5;
    // Datos de los puntos en X
    var basevastago = (epgraf + egraf) * 100;
    var punto1x = 100;
    var punto2x = 100 + b2graf * 100;
    var punto3x = considerar == "si" ? 100 + b2graf * 100 : 100;
    var punto4x = considerar == "si" ? 100 + b2graf * 100 + basevastago : 100 + basevastago;
    var punto5x = considerar == "si" ? 100 + b2graf * 100 + basevastago : 100;
    var punto6x = 100 + basem * 100;
    var punto7x = 100 + basem * 100;
    var punto8x = 100 + b2graf * 100 + basevastago;
    var punto9x = 100 + b2graf * 100 + basevastago;
    var punto10x = 100 + b2graf * 100 + basevastago - egraf * 100;
    var punto11x = 100 + b2graf * 100;
    var punto12x = 100;
    var punto13x = 100;

    //Datos de los4puntos en 4
    var punto1y = 100;
    var punto2y = 100;
    var punto3y = considerar == "si" ? 100 - inputHd * 100 : 100;
    var punto4y = considerar == "si" ? 100 - inputHd * 100 : 100;
    var punto5y = (considerar = "si") ? 100 : 100;
    var punto6y = 100;
    var punto7y = 100 + hzgraf * 100;
    var punto8y = 100 + hzgraf * 100;
    var punto9y = 100 + hzgraf * 100 + inputh * 100;
    var punto10y = 100 + hzgraf * 100 + inputh * 100;
    var punto11y = 100 + hzgraf * 100;
    var punto12y = 100 + hzgraf * 100;
    var punto13y = 100;

    // var DataGrafMurosFinal = [8.5, 100, 360, 100, 360, 140, 125, 140, 125, 350, 105, 350, 85, 140, 8.5, 140, 8.5, 100];
    var DataGrafMurosFinal = [
      punto1x * scala,
      punto1y * scala,
      punto2x * scala,
      punto2y * scala,
      punto3x * scala,
      punto3y * scala,
      punto4x * scala,
      punto4y * scala,
      punto5x * scala,
      punto5y * scala,
      punto6x * scala,
      punto6y * scala,
      punto7x * scala,
      punto7y * scala,
      punto8x * scala,
      punto8y * scala,
      punto9x * scala,
      punto9y * scala,
      punto10x * scala,
      punto10y * scala,
      punto11x * scala,
      punto11y * scala,
      punto12x * scala,
      punto12y * scala,
      punto13x * scala,
      punto13y * scala,
    ];

    //data para vigas de forma horizontal
    var puntov1x = 105;
    var puntov2x = 105;
    var puntov3x = 100 + basem * 100 - 5;
    var puntov4x = 100 + basem * 100 - 5;

    var puntov5x = 110;
    var puntov6x = 110;
    var puntov7x = 100 + basem * 100 - 10;
    var puntov8x = 100 + basem * 100 - 10;

    var puntov1y = 100 + 15 + 5;
    var puntov2y = 105;
    var puntov3y = 105;
    var puntov4y = 105 + 15;

    var puntov5y = 100 + hzgraf * 100 - 15 - 5;
    var puntov6y = 100 + hzgraf * 100 - 5;
    var puntov7y = 100 + hzgraf * 100 - 5;
    var puntov8y = 100 + hzgraf * 100 - 15 - 5;

    var vigasbasedebajo = [
      puntov1x * scala,
      puntov1y * scala,
      puntov2x * scala,
      puntov2y * scala,
      puntov3x * scala,
      puntov3y * scala,
      puntov4x * scala,
      puntov4y * scala,
    ];

    var vigasbasearriba = [
      puntov5x * scala,
      puntov5y * scala,
      puntov6x * scala,
      puntov6y * scala,
      puntov7x * scala,
      puntov7y * scala,
      puntov8x * scala,
      puntov8y * scala,
    ];

    //data para vigas de forma vertical
    var puntoh1x = considerar == "si" ? 100 + b2graf * 100 + 15 + 5 : 100 + b2graf * 100 + 5;
    var puntoh2x = considerar == "si" ? 100 + b2graf * 100 + 5 : 100 + b2graf * 100 + 5;
    var puntoh3x = considerar == "si" ? 100 + b2graf * 100 + 5 : 100 + b2graf * 100 + 5;
    var puntoh4x = 100 + b2graf * 100 + 5 + epgraf * 100;
    var puntoh5x = 100 + b2graf * 100 + 5 + 10 + epgraf * 100;
    var puntoh6x =
      considerar == "si" ? 100 + b2graf * 100 + basevastago - 15 - 5 : 100 + b2graf * 100 + basevastago - 5;
    var puntoh7x = considerar == "si" ? 100 + b2graf * 100 + basevastago - 5 : 100 + b2graf * 100 + basevastago - 5;
    var puntoh8x = considerar == "si" ? 100 + b2graf * 100 + basevastago - 5 : 100 + b2graf * 100 + basevastago - 5;
    var puntoh9x =
      considerar == "si" ? 100 + b2graf * 100 + basevastago - 10 - 5 : 100 + b2graf * 100 + basevastago - 10 - 5;

    var puntoh1y = considerar == "si" ? 100 - inputHd * 100 + 5 : 100 + 5;
    var puntoh2y = considerar == "si" ? 100 - inputHd * 100 + 5 : 100 + 5;
    var puntoh3y = considerar == "si" ? 100 + hzgraf * 100 - 5 : 100 + hzgraf * 100 - 5;
    var puntoh4y = 100 + hzgraf * 100 + inputh * 100 - 5;
    var puntoh5y = 100 + hzgraf * 100 + inputh * 100 - 5;

    var puntoh6y = considerar == "si" ? 100 - inputHd * 100 + 10 : 100 + 10;
    var puntoh7y = considerar == "si" ? 100 - inputHd * 100 + 10 : 100 + 10;
    var puntoh8y = considerar == "si" ? 100 + hzgraf * 100 + inputh * 100 - 10 : 100 + hzgraf * 100 + inputh * 100 - 10;
    var puntoh9y = considerar == "si" ? 100 + hzgraf * 100 + inputh * 100 - 10 : 100 + hzgraf * 100 + inputh * 100 - 10;

    var vigasVerticalesDATAiz = [
      puntoh1x * scala,
      puntoh1y * scala,
      puntoh2x * scala,
      puntoh2y * scala,
      puntoh3x * scala,
      puntoh3y * scala,
      puntoh4x * scala,
      puntoh4y * scala,
      puntoh5x * scala,
      puntoh5y * scala,
    ];
    var vigasVerticalesDATAder = [
      puntoh6x * scala,
      puntoh6y * scala,
      puntoh7x * scala,
      puntoh7y * scala,
      puntoh8x * scala,
      puntoh8y * scala,
      puntoh9x * scala,
      puntoh9y * scala,
    ];

    // Crear las líneas
    var SeccionMuroContencion = new Konva.Line({
      points: DataGrafMurosFinal,
      stroke: "white",
      strokeWidth: 0.5,
      closed: false,
    });
    layer.add(SeccionMuroContencion);

    var vigasHorizontalesdebajo = new Konva.Line({
      points: vigasbasedebajo,
      stroke: "white",
      strokeWidth: 0.5,
      closed: false,
    });
    layer.add(vigasHorizontalesdebajo);

    var vigasHorizontalesarriba = new Konva.Line({
      points: vigasbasearriba,
      stroke: "white",
      strokeWidth: 0.5,
      closed: false,
    });
    layer.add(vigasHorizontalesarriba);

    var vigasverticalesizquierda = new Konva.Line({
      points: vigasVerticalesDATAiz,
      stroke: "white",
      strokeWidth: 0.5,
      closed: false,
    });
    layer.add(vigasverticalesizquierda);

    var vigasverticalesderecha = new Konva.Line({
      points: vigasVerticalesDATAder,
      stroke: "white",
      strokeWidth: 0.5,
      closed: false,
    });
    layer.add(vigasverticalesderecha);

    //===========================ACEROS=========================
    var cantidadAcero = (basem * 100 - 15) / asverftran; //distancia/(distanciaEntreCirculos); // Puedes ajustar esto según la cantidad real de acero
    var distanciaEntreCirculos = asverftran; // Distancia vertical entre los círculos
    var radio = acertrans + 2; // Radio en pulgadas

    for (var i = 0; i < cantidadAcero; i++) {
      var circle = new Konva.Circle({
        x: (115 + i * distanciaEntreCirculos) * scala, // Coordenada X constante (puedes ajustarla según tus necesidades)
        y: (100 + 10) * scala, // Coordenada Y calculada dinámicamente
        radius: radio,
        fill: "purple",
        stroke: "purple",
        strokeWidth: 1,
      });
      layer.add(circle); // Agrega el círculo a la capa
    }

    var cantidadAcero = (basem * 100 - 15) / asverftran; // Puedes ajustar esto según la cantidad real de acero
    var distanciaEntreCirculos = asverftran; // Distancia vertical entre los círculos
    var radio = acertrans + 2; // Radio en pulgadas

    for (var i = 0; i < cantidadAcero; i++) {
      var circle = new Konva.Circle({
        x: (puntov5x + 5 + i * distanciaEntreCirculos) * scala, // Coordenada X constante (puedes ajustarla según tus necesidades)
        y: (puntov5y + 10) * scala, // Coordenada Y calculada dinámicamente
        radius: radio,
        fill: "green",
        stroke: "green",
        strokeWidth: 1,
      });

      layer.add(circle); // Agrega el círculo a la capa
    }

    var distanciaizq = puntoh3y - puntoh1y;
    var cantidadAcero = distanciaizq / asverftran; // Puedes ajustar esto según la cantidad real de acero
    var distanciaEntreCirculos = asverftran; // Distancia vertical entre los círculos
    var radio = acertrans + 2; // Radio en pulgadas

    for (var i = 0; i < cantidadAcero; i++) {
      var circle = new Konva.Circle({
        x: (puntoh3x + 5) * scala, // Coordenada X constante (puedes ajustarla según tus necesidades)
        y: (15 + i * distanciaEntreCirculos) * scala, // Coordenada Y calculada dinámicamente
        radius: radio,
        fill: "blue",
        stroke: "blue",
        strokeWidth: 1,
      });

      layer.add(circle); // Agrega el círculo a la capa
    }

    var distanciaizqarriba = puntoh5y - puntoh3y;
    var cantidadAcero = distanciaizqarriba / asverftran; // Puedes ajustar esto según la cantidad real de acero
    var distanciaEntreCirculos = asverftran; // Distancia vertical entre los círculos
    var radio = acertrans + 2; // Radio en pulgadas

    // Coordenadas del punto de inicio y del punto de llegada
    var puntoInicioX = puntoh3x + 5; // Coordenada X para el punto de inicio
    var puntoLlegadaX = puntoh6x + 10; // Coordenada X para el punto de llegada (ajústala según tus necesidades)

    for (var i = 0; i < cantidadAcero; i++) {
      var circle = new Konva.Circle({
        x: (puntoInicioX + (puntoLlegadaX - puntoInicioX) * (i / cantidadAcero)) * scala, // Coordenada X calculada dinámicamente
        y: (+5 + puntoh3y + i * distanciaEntreCirculos) * scala,
        radius: radio,
        fill: "blue",
        stroke: "blue",
        strokeWidth: 1,
      });

      layer.add(circle); // Agrega el círculo a la capa
    }

    var distancia = puntoh9y - puntoh6y; //((inputh) + (hzgraf) + (puntoh6y));
    var cantidadAcero = distancia / asverftran; // Puedes ajustar esto según la cantidad real de acero
    var distanciaEntreCirculos = asverftran; // Distancia vertical entre los círculos
    var radio = acertrans + 2; // Radio en pulgadas

    for (var i = 0; i < cantidadAcero; i++) {
      var circle = new Konva.Circle({
        x: (puntoh6x + 10) * scala, // Coordenada X constante (puedes ajustarla según tus necesidades)
        y: (puntoh6y + 5 + i * distanciaEntreCirculos) * scala, // Coordenada Y calculada dinámicamente
        radius: radio,
        fill: "red",
        stroke: "red",
        strokeWidth: 1,
      });

      layer.add(circle); // Agrega el círculo a la capa
    }

    // Añadir dimensiones
    var dimensionBaseZapata = new Konva.Arrow({
      points: [100 * scala, 50 * scala, (100 + basem * 100) * scala, 50 * scala],
      pointerLength: 10,
      pointerWidth: 10,
      fill: "red",
      stroke: "red",
      strokeWidth: 0.5,
    });
    layer.add(dimensionBaseZapata);

    // Añadir dimensiones
    var dimensionBaseb2 = new Konva.Arrow({
      points: [105 * scala, 80 * scala, (100 + b2graf * 100) * scala, 80 * scala],
      pointerLength: 10,
      pointerWidth: 10,
      fill: "red",
      stroke: "red",
      strokeWidth: 0.5,
    });
    layer.add(dimensionBaseb2);

    var dimensionBasedentellon = new Konva.Arrow({
      points: [(100 + b2graf * 100) * scala, 80 * scala, punto4x * scala, 80 * scala],
      pointerLength: 10,
      pointerWidth: 10,
      fill: "red",
      stroke: "red",
      strokeWidth: 0.5,
    });
    layer.add(dimensionBasedentellon);

    var dimensionBaseb1 = new Konva.Arrow({
      points: [punto4x * scala, 80 * scala, punto6x * scala, 80 * scala],
      pointerLength: 10,
      pointerWidth: 10,
      fill: "red",
      stroke: "red",
      strokeWidth: 0.5,
    });
    layer.add(dimensionBaseb1);

    var dimensionBasee = new Konva.Arrow({
      points: [punto9x * scala, (punto9y + 10) * scala, punto10x * scala, (punto10y + 10) * scala],
      pointerLength: 10,
      pointerWidth: 10,
      fill: "red",
      stroke: "red",
      strokeWidth: 0.5,
    });
    layer.add(dimensionBasee);

    var dimensionAltura = new Konva.Arrow({
      points: [(punto6x + 10) * scala, 100 * scala, (punto7x + 10) * scala, punto7y * scala],
      pointerLength: 10,
      pointerWidth: 10,
      fill: "red",
      stroke: "red",
      strokeWidth: 0.5,
    });
    layer.add(dimensionAltura);

    var dimensionAlturacimentacion = new Konva.Arrow({
      points: [(punto8x + 10) * scala, punto8y * scala, (punto9x + 10) * scala, punto9y * scala],
      pointerLength: 10,
      pointerWidth: 10,
      fill: "red",
      stroke: "red",
      strokeWidth: 0.5,
    });
    layer.add(dimensionAlturacimentacion);

    // Añadir texto de dimensiones
    var textBase = new Konva.Text({
      x: 180 * scala,
      y: 50 * scala,
      text: basem,
      fontSize: 14,
      fill: colors.text,
      //fill: 'black',
      rotation: 180,
      scaleX: -1,
    });
    layer.add(textBase);

    var textAltura = new Konva.Text({
      x: punto8x * scala,
      y: (punto8x + 15) * scala,
      text: inputh,
      fontSize: 14,
      fill: colors.text,
      //fill: 'black',
      rotation: 180,
      scaleX: -1,
    });
    layer.add(textAltura);

    var textAlturacimentacion = new Konva.Text({
      x: punto6x * scala,
      y: (punto6y + 20) * scala,
      text: hzgraf,
      fontSize: 14,
      fill: colors.text,
      //fill: 'black',
      rotation: 180,
      scaleX: -1,
    });
    layer.add(textAlturacimentacion);

    // Añadir la capa al escenario
    stage.add(layer);

    function fitStageIntoParentContainer() {
      var container = document.querySelector("#container");
      var containerWidth = container.offsetWidth;
      var scale = containerWidth / initialWidth; // Ajusta según tu tamaño inicial
      stage.width(initialWidth * scale);
      stage.height(initialHeight * scale);
      stage.scale({ x: scale, y: scale });
    }

    fitStageIntoParentContainer();
    window.addEventListener("resize", fitStageIntoParentContainer);
  }
  capturarCambios();
});
