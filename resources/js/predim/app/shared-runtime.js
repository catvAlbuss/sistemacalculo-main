import imgurl from "../../../img/rizabalasociados.png";
import "print-this";
import html2canvas from "html2canvas";

const bindElementIfExists = (id, eventName, handler) => {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener(eventName, handler);
  }
  return element;
};

document.addEventListener("DOMContentLoaded", function () {
  const bindIfExists = (id, eventName, handler) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(eventName, handler);
    }
    return element;
  };

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const brightnessRange = document.getElementById("brightnessRange");
  var originalPdfSnapshot;
  const colorPicker = document.getElementById("color-picker");

  const npisosInput = document.getElementById("npisos");

  //const ZpisosInput = parseFloat(document.getElementById("Zpisos").value);
  let ZpisosInput = 0;
  document.getElementById("Zpisos").addEventListener("input", () => {
    ZpisosInput = parseFloat(document.getElementById("Zpisos").value);
    console.log(ZpisosInput);
  });
  //Zsuelo
  let ZsuelosInput = 0;
  document.getElementById("Zsuelos").addEventListener("input", () => {
    ZsuelosInput = parseFloat(document.getElementById("Zsuelos").value);
    console.log(ZsuelosInput);
  });

  //fC
  let fc = 210;
  document.getElementById("fc").addEventListener("input", () => {
    fc = parseFloat(document.getElementById("fc").value);
    console.log(fc);
  });
  //RANGO DE GROSOR
  let brushWidth = 1;
  // Función para establecer el ancho del pincel
  function setBrushWidth(newWidth) {
    brushWidth = newWidth;
    // Aquí realizarías las acciones necesarias para cambiar el ancho del pincel en tu aplicación
    console.log(`Nuevo ancho de pincel: ${brushWidth}`);
  }
  // Obtener todos los enlaces de la lista de grosores
  const brushWidthLinks = document.querySelectorAll("#grosorline a");
  // Agregar un event listener a cada enlace
  brushWidthLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault(); // Prevenir el comportamiento por defecto del enlace
      const newWidth = parseInt(link.dataset.brushWidth, 10);
      setBrushWidth(newWidth);
    });
  });

  //TAMAÑO DE LETRAS // RANGO DE TAMAÑO DE LETRAS
  let fontSize = "12";

  // Función para establecer el tamaño de la letra
  function setFontSize(newSize) {
    fontSize = newSize;
    // Aquí realizarías las acciones necesarias para cambiar el tamaño de la letra en tu aplicación
    console.log(`Nuevo tamaño de letra: ${fontSize}`);
  }

  // Obtener todos los enlaces de la lista de tamaños de letra
  const fontSizeLinks = document.querySelectorAll("#grosorletter a");

  // Agregar un event listener a cada enlace
  fontSizeLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault(); // Prevenir el comportamiento por defecto del enlace
      const newSize = link.dataset.fontSize;
      setFontSize(newSize);
    });
  });

  // Inicializar el color seleccionado
  let selectedColor = "#0400ff";

  // Obtener todos los enlaces de color
  const colorLinks = document.querySelectorAll("[data-color]");

  // Añadir un evento de clic a cada enlace de color
  colorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault(); // Evita que el enlace recargue la página
      const target = event.target.closest("[data-color]");
      if (!target) return;
      selectedColor = target.getAttribute("data-color");
      console.log(`Color seleccionado: ${selectedColor}`);

      // Opcional: Puedes añadir una clase al enlace seleccionado para resaltar el color
      colorLinks.forEach((link) => link.classList.remove("selected-color"));
      target.classList.add("selected-color");
    });
  });

  colorLinks.forEach((link) => {
    if (link.getAttribute("data-color") === selectedColor) {
      link.classList.add("selected-color");
    }
  });

  //===================Escalado de pdf y las lineas ============================================//
  let escalaMedido = 0;
  let escalaPlano = 0;
  let valorScala = 1;
  document.getElementById("escalaVal").addEventListener("input", () => {
    escalaMedido = parseFloat(document.getElementById("escalaVal").value);
    console.log(escalaMedido);
  });

  document.getElementById("escalaplano").addEventListener("input", () => {
    escalaPlano = parseFloat(document.getElementById("escalaplano").value);
    console.log(escalaPlano);
  });

  document.getElementById("calc").addEventListener("click", function () {
    valorScala = escalaMedido / escalaPlano;
    console.log(valorScala);
  });

  //=====================================PLACAS===================================//
  let Zplaca = 1,
    Uplaca = 1,
    splaca = 1,
    Rplaca = 1,
    fcplaca = 210,
    placaNpiso = 1;
  document.getElementById("placaZ").addEventListener("input", () => {
    Zplaca = parseFloat(document.getElementById("placaZ").value);
  });
  document.getElementById("placaU").addEventListener("input", () => {
    Uplaca = parseFloat(document.getElementById("placaU").value);
  });
  document.getElementById("placaS").addEventListener("input", () => {
    splaca = parseFloat(document.getElementById("placaS").value);
  });
  document.getElementById("placaR").addEventListener("input", () => {
    Rplaca = parseFloat(document.getElementById("placaR").value);
  });
  document.getElementById("placafc").addEventListener("input", () => {
    fcplaca = parseFloat(document.getElementById("placafc").value);
  });
  document.getElementById("npisosPlacas").addEventListener("input", () => {
    placaNpiso = parseFloat(document.getElementById("npisosPlacas").value);
  });

  const uploadPDFInput = document.getElementById("upload-pdf");
  let prevMouseX,
    prevMouseY,
    isDrawing = false,
    snapshot;
  let selectedTool = "rectangle";
  //   // brushWidth = 5,
  //   // selectedColor = "#000";
  let fillColor = { checked: false };
  let shapes = []; // Array para almacenar todas las formas dibujadas
  let pdfSnapshot = null;
  let currentBrightness = 1; // Valor inicial del brillo

  //INICIO DE LA PRUEBA DE RENDERIZADO

  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.7.570/pdf.worker.min.js";

  function renderPDF(pdfData) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pdfjsLib
      .getDocument({ data: pdfData })
      .promise.then((pdf) => {
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          pages.push(renderPage(pdf, i));
        }
        return Promise.all(pages);
      })
      .catch((error) => {
        console.error("Error al renderizar el PDF:", error);
      });
  }

  function renderPage(pdf, pageNumber) {
    return pdf.getPage(pageNumber).then((page) => {
      const viewport = page.getViewport({ scale: 2.0 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      return page.render(renderContext).promise.then(() => {
        originalPdfSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        pdfSnapshot = new ImageData(
          new Uint8ClampedArray(originalPdfSnapshot.data),
          originalPdfSnapshot.width,
          originalPdfSnapshot.height,
        );
        applyBrightnessAndRedraw();
      });
    });
  }

  function adjustPDFBrightness(brightness) {
    if (!originalPdfSnapshot) return;

    const imageData = new ImageData(
      new Uint8ClampedArray(originalPdfSnapshot.data),
      originalPdfSnapshot.width,
      originalPdfSnapshot.height,
    );
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * brightness);
      data[i + 1] = Math.min(255, data[i + 1] * brightness);
      data[i + 2] = Math.min(255, data[i + 2] * brightness);
    }

    return imageData;
  }

  function applyBrightnessAndRedraw() {
    if (!originalPdfSnapshot) {
      console.log("No hay snapshot del PDF disponible.");
      return;
    }

    const adjustedImageData = adjustPDFBrightness(currentBrightness);
    console.log("Aplicando brillo con valor:", currentBrightness);
    ctx.putImageData(adjustedImageData, 0, 0);
    redrawShapes();
  }

  function redrawShapes() {
    shapes.forEach((shape) => {
      const tool = tools[shape.tool];
      if (tool && tool.drawShape) {
        tool.drawShape(shape);
      }
    });
  }

  brightnessRange.addEventListener("input", () => {
    currentBrightness = parseFloat(brightnessRange.value);
    applyBrightnessAndRedraw();
  });

  uploadPDFInput.addEventListener("change", () => {
    const file = uploadPDFInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const pdfData = event.target.result;
      renderPDF(pdfData);
    };

    if (file) {
      reader.readAsArrayBuffer(file);
    }
  });

  function loadPDFfromURL(url) {
    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((pdfData) => {
        renderPDF(pdfData);
      })
      .catch((error) => {
        console.error("Error al cargar el PDF desde la URL:", error);
      });
  }

  const url = $('label[type="hidden"]').data("id");
  if (url) {
    loadPDFfromURL(url);
  }

  class Tool {
    constructor(ctx, fillColor) {
      this.ctx = ctx;
      this.fillColor = fillColor;
      this.drawing = false; // Control de estado de dibujo
    }
    startDrawing(e) {
      if (this.drawing) return;
      prevMouseX = e.offsetX;
      prevMouseY = e.offsetY;
      snapshot = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
      isDrawing = true;
      this.drawing = true;
      draw(e);
    }
    stopDrawing(e) {
      if (isDrawing) {
        this.saveShape(e);
        this.drawingFinished();
      }
      isDrawing = false;
      this.drawing = false;
    }
    // Modificar la función de dibujo para mantener el brillo
    draw(e) {
      if (!isDrawing) return;

      // Restaurar el estado del canvas y luego dibujar la forma
      //ctx.putImageData(snapshot, 0, 0);
      const tool = tools[selectedTool];
      if (tool && tool.draw) {
        tool.draw(e);
      }
    }
    saveShape(e) {
      const shape = {
        x: prevMouseX,
        y: prevMouseY,
        width: e.offsetX - prevMouseX,
        height: e.offsetY - prevMouseY,
        color: selectedColor,
        brushWidth: brushWidth,
        fill: this.fillColor.checked,
        tool: selectedTool,
      };
      shapes.push(shape);
      this.redrawCanvas();
      this.updateCount();
    }
    drawingFinished() {
      // Método para ser sobrescrito por las herramientas específicas
    }
    removeShape(e) {
      const shapeIndex = shapes.findIndex(
        (shape) =>
          e.offsetX >= shape.x &&
          e.offsetX <= shape.x + shape.width &&
          e.offsetY >= shape.y &&
          e.offsetY <= shape.y + shape.height,
      );

      if (shapeIndex !== -1) {
        shapes.splice(shapeIndex, 1);
        this.redrawCanvas();
        this.updateCount();
      }
    }
    redrawCanvas() {
      // Aplicar el brillo actual al PDF
      if (originalPdfSnapshot) {
        const adjustedImageData = adjustPDFBrightness(currentBrightness);
        ctx.putImageData(adjustedImageData, 0, 0);
      }

      // Redibujar todas las formas
      shapes.forEach((shape) => {
        const tool = tools[shape.tool];
        if (tool && typeof tool.drawShape === "function") {
          tool.drawShape(shape);
        } else {
          console.warn(`No drawShape method found for tool: ${shape.tool}`);
        }
      });
    }
    moveShape(e) {
      const shape = shapes.find(
        (shape) =>
          e.offsetX >= shape.x &&
          e.offsetX <= shape.x + shape.width &&
          e.offsetY >= shape.y &&
          e.offsetY <= shape.y + shape.height,
      );
      if (shape) {
        const dx = e.offsetX - shape.x - shape.width / 2;
        const dy = e.offsetY - shape.y - shape.height / 2;
        shape.x += dx;
        shape.y += dy;
        redrawAllShapes();
      }
    }
    updateCount() {
      const countrectangulo = document.getElementById("rectangulo-count");
      const countCuadrado = document.getElementById("cuadro-count");
      const countCircular = document.getElementById("circulo-count");
      const countte = document.getElementById("te-count");
      const countle = document.getElementById("le-count");
      //vigas
      const countviga = document.getElementById("vigas-count");
      const countvigaseg = document.getElementById("vigasSeg-count");
      const countvigacimentacion = document.getElementById("vigasCimentacion-count");
      const countvigasobrevigas = document.getElementById("vigasSSvigas-count");
      const countvigaborde = document.getElementById("vigasbordes-count");
      //zapata
      const countzapata = document.getElementById("zapata-count");
      // losas
      const countlosa = document.getElementById("losas-count");
      const countlosaal2 = document.getElementById("losasal2-count");
      const countlosamaci1 = document.getElementById("losamaciza1-count");
      const countlosamac2 = document.getElementById("losamaciza2-count");
      //Placas
      const countPlacas = document.getElementById("placa-count");

      if (countrectangulo) {
        const count = shapes.filter((shape) => shape.tool === "rectangle").length;
        countrectangulo.textContent = count;
        if (count == 0) {
          document.getElementById("Columna_rectangular").innerHTML = "";
        }
      }
      if (countCuadrado) {
        const count = shapes.filter((shape) => shape.tool === "cuadrado").length;
        countCuadrado.textContent = count;
        console.log(shapes.filter((shape) => shape.tool));
        if (count == 0) {
          document.getElementById("Columna_Cuadrado").innerHTML = "";
        }
      }
      if (countCircular) {
        const count = shapes.filter((shape) => shape.tool === "circulo").length;
        countCircular.textContent = count;
        if (count == 0) {
          document.getElementById("Columna_Circular").innerHTML = "";
        }
      }
      if (countte) {
        const count = shapes.filter((shape) => shape.tool === "te").length;
        countte.textContent = count;
        if (count == 0) {
          document.getElementById("Columna_Te").innerHTML = "";
        }
      }
      if (countle) {
        const count = shapes.filter((shape) => shape.tool === "ele").length;
        countle.textContent = count;
        if (count == 0) {
          document.getElementById("Columna_Le").innerHTML = "";
        }
      }
      if (countviga) {
        const count = shapes.filter((shape) => shape.tool === "cuadradovigas").length;
        countviga.textContent = count;
        if (count == 0) {
          document.getElementById("vigas_principal").innerHTML = "";
        }
      }
      if (countvigaseg) {
        const count = shapes.filter((shape) => shape.tool === "cuadradovigasse").length;
        countviga.textContent = count;
        if (count == 0) {
          document.getElementById("vigas_Segundaria").innerHTML = "";
        }
      }
      if (countvigacimentacion) {
        const count = shapes.filter((shape) => shape.tool === "cuadradovigascimentacion").length;

        countvigacimentacion.textContent = count;
        if (count == 0) {
          document.getElementById("vigas_Cimntacion").innerHTML = "";
        }
      }
      if (countvigasobrevigas) {
        const count = shapes.filter((shape) => shape.tool === "vigaSobreVigas").length;
        countviga.textContent = count;
        if (count == 0) {
          document.getElementById("vigas_sobrevigas").innerHTML = "";
        }
      }
      if (countvigaborde) {
        const count = shapes.filter((shape) => shape.tool === "vigadeborde").length;
        countviga.textContent = count;
        if (count == 0) {
          document.getElementById("vigas_borde").innerHTML = "";
        }
      }
      if (countzapata) {
        const count = shapes.filter((shape) => shape.tool === "cuadradozapata").length;
        countzapata.textContent = count;

        if (count == 0) {
          document.getElementById("zapatas_cuadradas").innerHTML = "";
        }
      }
      if (countlosa) {
        const count = shapes.filter((shape) => shape.tool === "losaligerada1").length;
        countlosa.textContent = count;
        if (count == 0) {
          document.getElementById("losas_Cuadrada").innerHTML = "";
        }
      }
      if (countlosaal2) {
        const count = shapes.filter((shape) => shape.tool === "losaligerada2").length;
        countlosa.textContent = count;
        if (count == 0) {
          document.getElementById("losasAl2_Cuadrada").innerHTML = "";
        }
      }
      if (countlosamaci1) {
        const count = shapes.filter((shape) => shape.tool === "losamaciza1").length;
        countlosa.textContent = count;
        if (count == 0) {
          document.getElementById("losasMac1_Cuadrada").innerHTML = "";
        }
      }
      if (countlosamac2) {
        const count = shapes.filter((shape) => shape.tool === "losamaciza2").length;
        countlosa.textContent = count;
        if (count == 0) {
          document.getElementById("losasMac2_Cuadrada").innerHTML = "";
        }
      }
      if (countPlacas) {
        const count = shapes.filter((shape) => shape.tool === "placas").length;
        countlosa.textContent = count;
        if (count == 0) {
          document.getElementById("placas_rp").innerHTML = "";
        }
      }
    }
    calculateArea(shape) {
      // Función para calcular el área de la forma
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);
      const baseCm = shape.width * pixelToCm;
      const alturaCm = shape.height * pixelToCm;
      const areaCm2 = baseCm * alturaCm;
      return areaCm2;
    }
    drawText(shape, areaText, areaTextAC, textY) {
      const textWidth = this.ctx.measureText(areaText).width;
      const textX = shape.x + shape.width / 2 - textWidth / 2;
      this.ctx.fillStyle = "black";
      this.ctx.font = "bold 12px Arial"; // Set font weight and size
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(areaText, textX, textY);
      this.ctx.fillText(areaTextAC, textX, textY + 10);
    }
  }
  // Clase RectangleTool.....................
  class RectangleTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0; // Contador de rectángulos
    }

    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }

    drawShape(rect) {
      if (Math.abs(rect.width) <= 1 || Math.abs(rect.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }

      this.ctx.beginPath();
      this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
      this.ctx.lineWidth = rect.brushWidth;
      this.ctx.strokeStyle = rect.color;
      this.ctx.stroke();

      if (rect.fill) {
        this.ctx.fillStyle = rect.color;
        this.ctx.fill();
      }

      const areaCm2 = this.calculateArea(rect);
      const npisos = npisosInput.value;

      const pe = parseFloat(npisos) * 1000 * areaCm2;
      const Ar = pe / (0.45 * fc);

      const lador = Ar / 30 / 100;
      let lado = lador < 0.3 ? 0.3 : lador;

      const AreaTributaria = `AT: ${areaCm2.toFixed(2)} m²`;
      const areaRectangulo = `A: ${Ar.toFixed(2)} cm²`;
      const base = "b = 0.30 m";
      const LadoRec = `Lado = ${lado.toFixed(2)} m`;
      const textY = rect.y + rect.height / 2;
      const textX = rect.x + rect.width / 2 - this.ctx.measureText(AreaTributaria).width / 2;

      this.drawText(rect, AreaTributaria, areaRectangulo, textY);
      this.ctx.fillText(base, textX, textY + 20);
      this.ctx.fillText(LadoRec, textX, textY + 30);

      // Añadir los valores al reporte
      this.addToReport(areaCm2, Ar, base, LadoRec);
    }

    drawingFinished() {
      const lastShape = shapes[shapes.length - 1];
      if (
        lastShape &&
        lastShape.tool === "rectangle" &&
        Math.abs(lastShape.width) > 1 &&
        Math.abs(lastShape.height) > 1
      ) {
        this.rectCount++;
        const countElement = document.getElementById("rectangulo-count");
        countElement.textContent = this.rectCount;
      }
    }

    addToReport() {
      document.getElementById("Columna_rectangular").innerHTML = "";
      let count = 1;
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.tool === "rectangle") {
          const at = this.calculateArea(shape);
          const npisos = npisosInput.value;
          const pe = parseFloat(npisos) * 1000 * at;
          const Ar = pe / (0.45 * Math.sqrt(fc, 2));
          const base = "0.30 m";
          const LadoRec = `${(Ar / 30 / 100).toFixed(2)} cm`;

          const Columna = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>(npiso * 1000 * Ac) / (0.45 * fc)</td>
                            <td class='py-2 px-4 text-center'>${at.toFixed(2)} m²</td>
                            <td class='py-2 px-4 text-center'>${Ar.toFixed(2)} cm²</td>
                            <td class='py-2 px-4 text-center'>${base}</td>
                            <td class='py-2 px-4 text-center'>${LadoRec}</td>
                        </tr>
                    `;

          document.getElementById("Columna_rectangular").insertAdjacentHTML("beforeend", Columna);
        }
      }
    }
  }
  //Clase Cuadrado y operacionn.................
  class CuadradoTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0; // Contador de rectángulos
    }
    // draw(e) {
    //     if (!isDrawing) return;
    //     ctx.putImageData(snapshot, 0, 0);
    //     const shape = {
    //         x: prevMouseX,
    //         y: prevMouseY,
    //         width: e.offsetX - prevMouseX,
    //         height: e.offsetY - prevMouseY,
    //         color: this.selectedColor,
    //         brushWidth: this.brushWidth,
    //         fill: this.fillColor.checked,
    //     };
    //     this.drawShape(shape);
    //     // this.drawCuadrado(shape);
    // }
    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const npisos = npisosInput.value;

      const Ac = ((parseFloat(areaCm2) * parseFloat(npisos) * 1000) / (0.45 * fc)).toFixed(2);

      const Acuadrado = areaCm2;

      const ladoc = Math.sqrt(Ac, 2) / 100;

      let ladocua = ladoc < 0.3 ? 0.3 : ladoc;

      const areaText = `AT = ${areaCm2.toFixed(2)} m²`;

      const areaTextAC = `A = ${Ac} cm²`;

      const areaTextACuadrado = `Lado = ${ladocua.toFixed(2)} m`;

      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, areaTextAC, textY);
      ctx.fillText(areaTextACuadrado, textX, textY + 20);

      // Añadir los valores al reporte
      this.addToReport(areaCm2, Ac, areaTextACuadrado);
    }
    drawingFinished() {
      this.rectCount++; // Incrementar el contador al finalizar el dibujo

      const countElement = document.getElementById("cuadro-count");
      countElement.textContent = this.rectCount;

      // console.log(`Cuadros dibujados: ${this.rectCount}`);
    }
    addToReport() {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("Columna_Cuadrado").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];

        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "cuadrado") {
          const areaCm2 = this.calculateArea(shape); // Área tributaria
          const npisos = npisosInput.value;
          const Ac = (parseFloat(areaCm2) * parseFloat(npisos) * 1000) / (0.45 * fc);
          const ladocal = Math.sqrt(Ac, 2);

          const nombreAt = `${areaCm2.toFixed(2)}`;

          const nombreA = `${Ac.toFixed(2)}`;

          const nombreLado = `${ladocal.toFixed(2)}`;

          // (Math.sqrt(Ac, 2)) / 100
          // Crear la fila HTML para este rectángulo
          const ColumnaCuadrado = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>(npiso * 1000 * Ac) / (0.45 * fc)</td>
                            <td class='py-2 px-4 text-center'>${nombreAt} m²</td>
                            <td class='py-2 px-4 text-center'>${nombreA} cm²</td>
                            <td class='py-2 px-4 text-center'>${nombreLado} cm</td>
                        </tr>
                    `;

          // Agregar la fila a la tabla, sin sobrescribir las filas anteriores
          document.getElementById("Columna_Cuadrado").insertAdjacentHTML("beforeend", ColumnaCuadrado);
        }
      }
    }
  }
  //clase circulo y operacion CIRCULACION..........................
  class CirculoTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }
    // draw(e) {
    //     if (!isDrawing) return;
    //     ctx.putImageData(snapshot, 0, 0);
    //     const shape = {
    //         x: prevMouseX,
    //         y: prevMouseY,
    //         width: e.offsetX - prevMouseX,
    //         height: e.offsetY - prevMouseY,
    //         color: this.selectedColor,
    //         brushWidth: this.brushWidth,
    //         fill: this.fillColor.checked,
    //     };
    //     // this.drawCirculo(shape);
    // }
    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const npisos = npisosInput.value;

      const Ac = ((parseFloat(areaCm2) * parseFloat(npisos) * 1000) / ((0.45 * fc) ^ 0.5)).toFixed(2);

      const Acuadrado = areaCm2;

      //condicional para que L sea mayor que 30
      const ladora = Math.sqrt(Ac / 3.14, 2) / 100;

      let radio = ladora < 0.15 ? 0.15 : ladora;

      const areaText = `AT: ${areaCm2.toFixed(2)} m²`;

      const areaTextAC = `A: ${Ac} cm²`;

      const areaTextACuadrado = `Radio: ${radio.toFixed(2)} m`;

      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, areaTextAC, textY);
      ctx.fillText(areaTextACuadrado, textX, textY + 20);

      // Añadir los valores al reporte
      this.addToReport(areaCm2, Ac, areaTextACuadrado);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("circulo-count");
      countElement.textContent = this.rectCount;

      // console.log(`Circulo : ${this.rectCount}`);
    }

    addToReport() {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("Columna_Circular").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];

        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "circulo") {
          const areaCm2 = this.calculateArea(shape); // Área tributaria
          const npisos = npisosInput.value;
          const Ac = (parseFloat(areaCm2) * parseFloat(npisos) * 1000) / ((0.45 * fc) ^ 0.5);
          const areaCirculo = Math.sqrt(Ac / 3.14, 2) / 100; //Math.sqrt(Ac / (2 * 3.14), 2);

          const nombreAt = `${areaCm2.toFixed(2)}`;

          const nombreA = `${Ac.toFixed(2)}`;

          const nombreRadio = `${areaCirculo.toFixed(2)} cm`;

          // Crear la fila HTML para este rectángulo
          const ColumnaCuadrado = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>(npiso * 1000 * Ac) / (0.45 * fc)</td>
                            <td class='py-2 px-4 text-center'>${nombreAt} m²</td>
                            <td class='py-2 px-4 text-center'>${nombreA} cm²</td>
                            <td class='py-2 px-4 text-center'>${nombreRadio}</td>
                        </tr>
                    `;

          // Agregar la fila a la tabla, sin sobrescribir las filas anteriores
          document.getElementById("Columna_Circular").insertAdjacentHTML("beforeend", ColumnaCuadrado);
        }
      }
    }
  }
  //clase te y operacion
  class TeTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }
    // draw(e) {
    //     if (!isDrawing) return;
    //     ctx.putImageData(snapshot, 0, 0);
    //     const shape = {
    //         x: prevMouseX,
    //         y: prevMouseY,
    //         width: e.offsetX - prevMouseX,
    //         height: e.offsetY - prevMouseY,
    //         color: this.selectedColor,
    //         brushWidth: this.brushWidth,
    //         fill: this.fillColor.checked,
    //     };
    //     // this.drawTe(shape);
    // }
    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const npisos = npisosInput.value;
      const Ac = ((parseFloat(areaCm2) * parseFloat(npisos) * 1000) / (0.45 * fc)).toFixed(2);

      const ladote = (Ac + 900) / 60 / 100;

      let ladot = ladote < 0.3 ? 0.3 : ladote;

      const areaText = `AT = ${areaCm2.toFixed(2)} m²`;
      const areaTextAC = `A = ${Ac} cm²`;
      const base = "e = 0.30 m";
      const areaT = `Lado =  ${ladot.toFixed(2)} cm`;
      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, areaTextAC, textY);
      ctx.fillText(base, textX, textY + 20);
      ctx.fillText(areaT, textX, textY + 30);
      // Añadir los valores al reporte
      this.addToReport(areaCm2, Ac, base, areaT);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("te-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }

    addToReport() {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("Columna_Te").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];

        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "te") {
          const areaCm2 = this.calculateArea(shape); // Área tributaria
          const npisos = npisosInput.value;
          const Ac = (parseFloat(areaCm2) * parseFloat(npisos) * 1000) / (0.45 * fc);
          const areaT = Ac - 900 / 60;

          const nombreAt = `${areaCm2.toFixed(2)}`;

          const nombreA = `${Ac.toFixed(2)}`;

          const base = "0.30";

          const nombreT = `${areaT.toFixed(2)} cm`;

          // Crear la fila HTML para este rectángulo
          const ColumnaTE = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>(npiso * 1000 * Ac) / (0.45 * fc)</td>
                            <td class='py-2 px-4 text-center'>${nombreAt} m²</td>
                            <td class='py-2 px-4 text-center'>${nombreA} cm²</td>
                            <td class='py-2 px-4 text-center'>${base} m</td>
                            <td class='py-2 px-4 text-center'>${nombreT}</td>
                        </tr>
                    `;

          // Agregar la fila a la tabla, sin sobrescribir las filas anteriores
          document.getElementById("Columna_Te").insertAdjacentHTML("beforeend", ColumnaTE);
        }
      }
    }
  }
  //clase ele y operacion
  class EleTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }
    // draw(e) {
    //     if (!isDrawing) return;
    //     ctx.putImageData(snapshot, 0, 0);
    //     const shape = {
    //         x: prevMouseX,
    //         y: prevMouseY,
    //         width: e.offsetX - prevMouseX,
    //         height: e.offsetY - prevMouseY,
    //         color: this.selectedColor,
    //         brushWidth: this.brushWidth,
    //         fill: this.fillColor.checked,
    //     };
    //     // this.drawEle(shape);
    // }
    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const npisos = npisosInput.value;
      const Ac = ((parseFloat(areaCm2) * parseFloat(npisos) * 1000) / (0.45 * fc)).toFixed(2);

      const ladoele = (Ac - 900) / 60 / 100;

      let ladol = ladoele < 0.3 ? 0.3 : ladoele;

      const areaText = `AT: ${areaCm2.toFixed(2)} m²`;
      const areaTextAC = `A: ${Ac} cm²`;
      const base = "e = 0.30 cm";
      const AreaEle = `lado =  ${ladol.toFixed(2)} cm`;
      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;
      this.drawText(square, areaText, areaTextAC, textY);
      ctx.fillText(base, textX, textY + 20);
      ctx.fillText(AreaEle, textX, textY + 30);

      // Añadir los valores al reporte
      this.addToReport(areaCm2, Ac, base, AreaEle);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("le-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }

    addToReport() {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("Columna_Le").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];

        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "ele") {
          const areaCm2 = this.calculateArea(shape); // Área tributaria
          const npisos = npisosInput.value;
          const Ac = (parseFloat(areaCm2) * parseFloat(npisos) * 1000) / (0.45 * fc);
          const areaL = Ac - 900 / 60;

          const nombreAt = `${areaCm2.toFixed(2)} m²`;

          const nombreA = `${Ac.toFixed(2)} cm²`;

          const base = "0.30 m";

          const nombreL = `${areaL.toFixed(2)} cm`;

          // Crear la fila HTML para este rectángulo
          const ColumnaLE = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>(npiso * 1000 * Ac) / (0.45 * fc)</td>
                            <td class='py-2 px-4 text-center'>${nombreAt} </td>
                            <td class='py-2 px-4 text-center'>${nombreA} </td>
                            <td class='py-2 px-4 text-center'>${base}</td>
                            <td class='py-2 px-4 text-center'>${nombreL}</td>
                        </tr>
                    `;

          // Agregar la fila a la tabla, sin sobrescribir las filas anteriores
          document.getElementById("Columna_Le").insertAdjacentHTML("beforeend", ColumnaLE);
        }
      }
    }
  }
  //Secciona de vigas (class cuadrado) Clase CuadradoVigasTool y operación:::::::::::::::::::::
  class CuadradoVigasTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }
    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const areaText = ``;
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);
      //formula

      const luz = Math.max(square.width * pixelToCm, square.height * pixelToCm).toFixed(2);

      const ladovg = luz / 14;

      let ladoviga = ladovg < 0.3 ? 0.3 : ladovg;

      const Luz = `L = ${luz} m`;
      const Base = `b = 0.30 m`;
      const Altura = `h = ${ladoviga.toFixed(2)} m`;
      const AlturaVal = `${ladoviga.toFixed(2)}`;
      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;
      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX - 10, textY + 5);
      ctx.fillText(Luz, textX, textY + 15);
      ctx.fillText(Base, textX, textY + 25);
      ctx.fillText(Altura, textX, textY + 35);

      // Añadir los valores al reporte
      this.addToReport(luz, Base, Altura);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("vigas-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }
    addToReport(luz, Base, AlturaVal) {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("vigas_principal").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];

        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "cuadradovigas") {
          const scale = valorScala; // Escala 1:50
          const dpi = 96; // Asumiendo 96 DPI
          const pixelToCm = 2.54 / dpi / (115 * scale);
          const luz = Math.max(shape.width * pixelToCm, shape.height * pixelToCm).toFixed(2);

          const ladovg = luz / 14;

          let ladoviga = ladovg < 0.3 ? 0.3 : ladovg;
          const AlturaVal = ladoviga.toFixed(2);
          const Base = `0.30`;

          // Crear la fila HTML
          const ColumnaLE = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>L/14</td>
                            <td class='py-2 px-4 text-center'>${luz} m</td>
                            <td class='py-2 px-4 text-center'>${Base} m</td>
                            <td class='py-2 px-4 text-center'>${AlturaVal} m</td>
                        </tr>
                    `;

          // Agregar la fila a la tabla
          document.getElementById("vigas_principal").insertAdjacentHTML("beforeend", ColumnaLE);
        }
      }
    }
  }

  //seccion de vigas e cimentacion
  class CuadradoVigascimentacionTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }
    // draw(e) {
    //     if (!isDrawing) return;
    //     ctx.putImageData(snapshot, 0, 0);
    //     const shape = {
    //         x: prevMouseX,
    //         y: prevMouseY,
    //         width: e.offsetX - prevMouseX,
    //         height: e.offsetY - prevMouseY,
    //         color: this.selectedColor,
    //         brushWidth: this.brushWidth,
    //         fill: this.fillColor.checked,
    //     };
    //     // this.drawCuadradoVigas(shape);
    // }
    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const areaText = ``;
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);
      //formula

      const luz = Math.max(square.width * pixelToCm, square.height * pixelToCm).toFixed(2);

      const ladocvga = luz / 20;

      let ladocvg = ladocvga < 0.3 ? 0.3 : ladocvga;

      const Luz = `L = ${luz} m`;
      const Base = `b = 0.30 m`;
      const Altura = `h = ${ladocvg.toFixed(2)} m`;
      const AlturaVal = `${ladocvg.toFixed(2)}`;
      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;
      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX - 10, textY + 5);
      ctx.fillText(Luz, textX, textY + 15);
      ctx.fillText(Base, textX, textY + 25);
      ctx.fillText(Altura, textX, textY + 35);

      // Añadir los valores al reporte
      this.addToReport(luz, Base, AlturaVal);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("vigasCimentacion-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }

    addToReport() {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("vigas_Cimntacion").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "cuadradovigascimentacion") {
          const s = 2.54 / 96 / (115 * valorScala);
          const luz = Math.max(shape.width * s, shape.height * s).toFixed(2);
          const AlturaVal = (luz / 20).toFixed(2);
          const Base = `0.30`;

          // Crear la fila HTML
          const ColumnaLE = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>Ⅼ</td>
                            <td class='py-2 px-4 text-center'>${luz} m</td>
                            <td class='py-2 px-4 text-center'>${Base} m</td>
                            <td class='py-2 px-4 text-center'>${AlturaVal} m</td>
                        </tr>
                    `;

          // Agregar la fila a la tabla
          document.getElementById("vigas_Cimntacion").insertAdjacentHTML("beforeend", ColumnaLE);
        }
      }
    }
  }

  class CuadradoVigassegTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }
    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const areaText = ``;
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);

      //formula
      const luz = Math.max(square.width * pixelToCm, square.height * pixelToCm).toFixed(2);

      const ladovg = luz / 18.5;

      let ladoviga = ladovg < 0.2 ? 0.2 : ladovg;

      const Luz = `L = ${luz} m`;
      const Base = `b = 0.30 m`;
      const Altura = `h = ${ladoviga.toFixed(2)} m`;
      const AlturaVal = `${ladoviga.toFixed(2)}`;
      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;
      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX - 10, textY + 5);
      ctx.fillText(Luz, textX, textY + 15);
      ctx.fillText(Base, textX, textY + 25);
      ctx.fillText(Altura, textX, textY + 35);

      // Añadir los valores al reporte
      this.addToReport(luz, Base, AlturaVal);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("vigasSeg-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }
    addToReport(luz, Base, AlturaVal) {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("vigas_Segundaria").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];

        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "cuadradovigasse") {
          const s = 2.54 / 96 / (115 * valorScala);
          const luz = Math.max(shape.width * s, shape.height * s).toFixed(2);
          const AlturaVal = (luz / 18.5).toFixed(2);
          const Base = `0.30`;

          // Crear la fila HTML
          const ColumnaLE = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>L/18.5</td>
                            <td class='py-2 px-4 text-center'>${luz} m</td>
                            <td class='py-2 px-4 text-center'>${Base} m</td>
                            <td class='py-2 px-4 text-center'>${AlturaVal} m</td>
                        </tr>
                    `;

          // Agregar la fila a la tabla
          document.getElementById("vigas_Segundaria").insertAdjacentHTML("beforeend", ColumnaLE);
        }
      }
    }
  }

  class CuadroVigasSobreVigas extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }
    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const areaText = ``;
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);
      //formula

      const luz = Math.max(square.width * pixelToCm, square.height * pixelToCm).toFixed(2);

      const ladovg = luz / 16;

      let ladoviga = ladovg < 0.25 ? 0.25 : ladovg;

      const Luz = `L = ${luz} m`;
      const Base = `b = 0.20 m`;
      const Altura = `h = ${ladoviga.toFixed(2)} m`;
      const AlturaVal = `${ladoviga.toFixed(2)}`;
      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;
      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX - 10, textY + 5);
      ctx.fillText(Luz, textX, textY + 15);
      ctx.fillText(Base, textX, textY + 25);
      ctx.fillText(Altura, textX, textY + 35);

      // Añadir los valores al reporte
      this.addToReport(luz, Base, AlturaVal);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("vigasSSvigas-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }
    addToReport(luz, Base, AlturaVal) {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("vigas_sobrevigas").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];

        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "vigaSobreVigas") {
          const s = 2.54 / 96 / (115 * valorScala);
          const luz = Math.max(shape.width * s, shape.height * s).toFixed(2);
          const AlturaVal = (luz / 16).toFixed(2);
          const Base = `0.20`;

          // Crear la fila HTML
          const ColumnaLE = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>L/16</td>
                            <td class='py-2 px-4 text-center'>${luz} m</td>
                            <td class='py-2 px-4 text-center'>${Base} m</td>
                            <td class='py-2 px-4 text-center'>${AlturaVal} m</td>
                        </tr>
                    `;

          // Agregar la fila a la tabla
          document.getElementById("vigas_sobrevigas").insertAdjacentHTML("beforeend", ColumnaLE);
        }
      }
    }
  }

  class CuadroVigasBorde extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }
    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const areaText = ``;
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);
      //formula

      const luz = Math.max(square.width * pixelToCm, square.height * pixelToCm).toFixed(2);

      const ladovg = luz / 16;

      let ladoviga = ladovg < 0.15 ? 0.15 : ladovg;

      const Luz = `L = ${luz} m`;
      const Base = `b = 0.15 m`;
      const Altura = `h = ${ladoviga.toFixed(2)} m`;
      const AlturaVal = `${ladoviga.toFixed(2)}`;
      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;
      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX - 10, textY + 5);
      ctx.fillText(Luz, textX, textY + 15);
      ctx.fillText(Base, textX, textY + 25);
      ctx.fillText(Altura, textX, textY + 35);

      // Añadir los valores al reporte
      this.addToReport(luz, Base, AlturaVal);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("vigasbordes-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }
    addToReport(luz, Base, AlturaVal) {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("vigas_borde").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];

        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "vigadeborde") {
          const s = 2.54 / 96 / (115 * valorScala);
          const luz = Math.max(shape.width * s, shape.height * s).toFixed(2);
          const AlturaVal = (luz / 16).toFixed(2);
          const Base = `0.15`;

          // Crear la fila HTML
          const ColumnaLE = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>L/16</td>
                            <td class='py-2 px-4 text-center'>${luz} m</td>
                            <td class='py-2 px-4 text-center'>${Base} m</td>
                            <td class='py-2 px-4 text-center'>${AlturaVal} m</td>
                        </tr>
                    `;

          // Agregar la fila a la tabla
          document.getElementById("vigas_borde").insertAdjacentHTML("beforeend", ColumnaLE);
        }
      }
    }
  }

  //Seccion de pestaña zapata y operacion.......................................
  class CuadradoZapataTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }
    // draw(e) {
    //     if (!isDrawing) return;
    //     ctx.putImageData(snapshot, 0, 0);
    //     const shape = {
    //         x: prevMouseX,
    //         y: prevMouseY,
    //         width: e.offsetX - prevMouseX,
    //         height: e.offsetY - prevMouseY,
    //         color: this.selectedColor,
    //         brushWidth: this.brushWidth,
    //         fill: this.fillColor.checked,
    //     };
    //     // this.drawCuadradoZapata(shape);
    // }
    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }
      const areaCm2 = this.calculateArea(square);
      // pe..
      const pe = ZpisosInput * 1 * areaCm2;
      const Az = pe / (ZsuelosInput / 1);
      //const Ac = pe / (0.45 * (Math.sqrt(fc)));

      const An = Math.sqrt(Az, 2); //(1.0 * ZpisosInput * areaCm2) / ZsuelosInput;

      let ladoAz = An < 0.8 ? 0.8 : An;

      const areaText = `AT = ${areaCm2.toFixed(5)} m²`;

      const areaTextAC = `AZ = ${Az.toFixed(5)} m²`;

      // const AreaZapata = Ac / 25; // Corrección: usar Ac directamente en el cálculoddad
      const lado = `Lado = ${ladoAz.toFixed(2)} m`; // Asegúrate de formatear correctamente el resultado

      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, areaTextAC, textY);
      ctx.fillText(lado, textX, textY + 25);

      // Añadir los valores al reporte
      this.addToReport(areaText, areaTextAC, Az);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("zapata-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }
    addToReport() {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("zapatas_cuadradas").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];

        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "cuadradozapata") {
          const areaCm2 = this.calculateArea(shape); // Área tributaria
          const pe = ZpisosInput * 1000 * areaCm2;
          const Ac = pe / (0.45 * Math.sqrt(fc, 2));

          const An = (1.0 * ZpisosInput * areaCm2) / (ZsuelosInput / 1);

          const nombreAt = `${areaCm2.toFixed(2)} m²`;

          const nombreA = `${Ac.toFixed(2)} cm²`;

          const nombreAz = `${An.toFixed(2)} m²`;

          // Crear la fila HTML para este rectángulo
          const ColumnaZapata = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'></td>
                            <td class='py-2 px-4 text-center'>${nombreAt} </td>
                            <td class='py-2 px-4 text-center'>${nombreA} </td>
                            <td class='py-2 px-4 text-center'>${nombreAz}</td>
                        </tr>
                    `;
          // Agregar la fila a la tabla, sin sobrescribir las filas anteriores
          document.getElementById("zapatas_cuadradas").insertAdjacentHTML("beforeend", ColumnaZapata);
        }
      }
    }
  }
  //Seccion de pestaña Lozas y operacion
  class CuadradoLosasTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }
    // draw(e) {
    //     if (!isDrawing) return;
    //     ctx.putImageData(snapshot, 0, 0);
    //     const shape = {
    //         x: prevMouseX,
    //         y: prevMouseY,
    //         width: e.offsetX - prevMouseX,
    //         height: e.offsetY - prevMouseY,
    //         color: this.selectedColor,
    //         brushWidth: this.brushWidth,
    //         fill: this.fillColor.checked,
    //     };
    //     // this.drawCuadradoLosas(shape);
    // }
    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);

      const LusLosas = Math.min(square.height * pixelToCm, square.width * pixelToCm);

      const ladolosas = LusLosas / 25;

      let ladoL = ladolosas < 15 ? 15 : ladolosas;

      const areaText = `Luz= ${LusLosas.toFixed(2)} m`;
      //formula
      // const AreaLosas = (Math.max(square.width, square.height) / 25).toFixed(2);
      // console.log(square.height);
      // console.log(square.width);
      // console.log(LusLosas);
      // const AreaCuadradoLosas = `B = 30 cm`;
      const altura = `e= ${ladoL.toFixed(2)} cm`;

      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX, textY + 5);
      // ctx.fillText(AreaCuadradoLosas, textX, textY + 15);
      ctx.fillText(altura, textX, textY + 20);

      // Añadir los valores al reporte
      //this.addToReport(areaText, altura);
    }
    // drawingFinished() {
    //     this.rectCount++;
    //     const countElement = document.getElementById("losas-count");
    //     countElement.textContent = this.rectCount;
    //     // console.log(`Te ${this.rectCount}`);
    // }

    // addToReport() {
    //     // Limpiar la tabla antes de agregar nuevas filas
    //     document.getElementById('losas_Cuadrada').innerHTML = '';
    //     let count = 1;
    //     // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
    //     for (let j = 0; j < shapes.length; j++) {
    //         const shape = shapes[j];
    //         // Solo procesar si la figura es un rectángulo
    //         if (shape.tool === "cuadradolosas") {
    //             const scale = valorScala; // Escala 1:50
    //             const dpi = 96; // Asumiendo 96 DPI
    //             const pixelToCm = 2.54 / dpi / (115 * scale);
    //             const luz = Math.min((shape.height * pixelToCm), (shape.width * pixelToCm)).toFixed(2);
    //             const AlturaVal = (luz / 20).toFixed(2);
    //             const Base = `0.30`;

    //             // Crear la fila HTML
    //             const ColumnaLosas = `
    //                 <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
    //                     <td class='py-2 px-8'>${count++}</td>
    //                     <td class='py-2 px-8'></td>
    //                     <td class='py-2 px-4 text-center'>${luz} m</td>
    //                     <td class='py-2 px-4 text-center'>${AlturaVal} m</td>
    //                 </tr>
    //             `;
    //             // Agregar la fila a la tabla
    //             document.getElementById('losas_Cuadrada').insertAdjacentHTML('beforeend', ColumnaLosas);
    //         }
    //     }
    // }
  }
  class LosaAligeradaonedirTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }

    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);

      const LusLosas = Math.min(square.height * pixelToCm, square.width * pixelToCm);

      const ladolosas = LusLosas / 25;

      let ladoL = ladolosas < 0.15 ? 0.15 : ladolosas;

      const areaText = `Luz= ${LusLosas.toFixed(2)} m`;
      //formula
      const altura = `e= ${ladoL.toFixed(2)} m`;

      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX, textY + 5);
      // ctx.fillText(AreaCuadradoLosas, textX, textY + 15);
      ctx.fillText(altura, textX, textY + 20);

      // Añadir los valores al reporte
      this.addToReport(areaText, altura);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("losas-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }

    addToReport() {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("losas_Cuadrada").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "losaligerada1") {
          const scale = valorScala; // Escala 1:50
          const dpi = 96; // Asumiendo 96 DPI
          const pixelToCm = 2.54 / dpi / (115 * scale);
          const luz = Math.min(shape.height * pixelToCm, shape.width * pixelToCm).toFixed(2);
          const AlturaVal = (luz / 25).toFixed(2);
          const Base = `0.30`;

          // Crear la fila HTML
          const ColumnaLosas = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>L/25</td>
                            <td class='py-2 px-4 text-center'>${luz} m</td>
                            <td class='py-2 px-4 text-center'>${AlturaVal} m</td>
                        </tr>
                    `;
          // Agregar la fila a la tabla
          document.getElementById("losas_Cuadrada").insertAdjacentHTML("beforeend", ColumnaLosas);
        }
      }
    }
  }
  class LosaAligeradatwodirTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }

    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);

      const LusLosas = Math.min(square.height * pixelToCm, square.width * pixelToCm);

      const ladolosas = LusLosas / 35;

      let ladoL = ladolosas < 0.15 ? 0.15 : ladolosas;

      const areaText = `Luz= ${LusLosas.toFixed(2)} m`;
      //formula
      const altura = `e= ${ladoL.toFixed(2)} m`;

      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX, textY + 5);
      // ctx.fillText(AreaCuadradoLosas, textX, textY + 15);
      ctx.fillText(altura, textX, textY + 20);

      // Añadir los valores al reporte
      this.addToReport(areaText, altura);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("losasal2-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }

    addToReport() {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("losasAl2_Cuadrada").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "losaligerada2") {
          const scale = valorScala; // Escala 1:50
          const dpi = 96; // Asumiendo 96 DPI
          const pixelToCm = 2.54 / dpi / (115 * scale);
          const luz = Math.min(shape.height * pixelToCm, shape.width * pixelToCm).toFixed(2);
          const AlturaVal = (luz / 20).toFixed(2);
          const Base = `0.30`;

          // Crear la fila HTML
          const ColumnaLosas = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>L/35</td>
                            <td class='py-2 px-4 text-center'>${luz} m</td>
                            <td class='py-2 px-4 text-center'>${AlturaVal} m</td>
                        </tr>
                    `;
          // Agregar la fila a la tabla
          document.getElementById("losasAl2_Cuadrada").insertAdjacentHTML("beforeend", ColumnaLosas);
        }
      }
    }
  }
  class LosamacizaonedirTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }

    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);

      const LusLosas = Math.min(square.height * pixelToCm, square.width * pixelToCm);

      const ladolosas = LusLosas / 30;

      let ladoL = ladolosas < 0.15 ? 0.15 : ladolosas;

      const areaText = `Luz= ${LusLosas.toFixed(2)} m`;
      //formula
      const altura = `e= ${ladoL.toFixed(2)} m`;

      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX, textY + 5);
      // ctx.fillText(AreaCuadradoLosas, textX, textY + 15);
      ctx.fillText(altura, textX, textY + 20);

      // Añadir los valores al reporte
      this.addToReport(areaText, altura);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("losamaciza1-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }

    addToReport() {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("losasMac1_Cuadrada").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "losamaciza1") {
          const scale = valorScala; // Escala 1:50
          const dpi = 96; // Asumiendo 96 DPI
          const pixelToCm = 2.54 / dpi / (115 * scale);
          const luz = Math.min(shape.height * pixelToCm, shape.width * pixelToCm).toFixed(2);
          const AlturaVal = (luz / 20).toFixed(2);
          const Base = `0.30`;

          // Crear la fila HTML
          const ColumnaLosas = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>L/30</td>
                            <td class='py-2 px-4 text-center'>${luz} m</td>
                            <td class='py-2 px-4 text-center'>${AlturaVal} m</td>
                        </tr>
                    `;
          // Agregar la fila a la tabla
          document.getElementById("losasMac1_Cuadrada").insertAdjacentHTML("beforeend", ColumnaLosas);
        }
      }
    }
  }
  class LosamacizatwodirTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }

    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }
    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }
      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);

      const LusLosas = Math.min(square.height * pixelToCm, square.width * pixelToCm);

      const ladolosas = LusLosas / 40;

      let ladoL = ladolosas < 0.15 ? 0.15 : ladolosas;

      const areaText = `Luz= ${LusLosas.toFixed(2)} m`;
      //formula
      const altura = `e= ${ladoL.toFixed(2)} cm`;

      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(square, areaText, textY);
      ctx.fillText(areaText, textX, textY + 5);
      // ctx.fillText(AreaCuadradoLosas, textX, textY + 15);
      ctx.fillText(altura, textX, textY + 20);

      // Añadir los valores al reporte
      this.addToReport(areaText, altura);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("losamaciza2-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }

    addToReport() {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("losasMac2_Cuadrada").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "losamaciza2") {
          const scale = valorScala; // Escala 1:50
          const dpi = 96; // Asumiendo 96 DPI
          const pixelToCm = 2.54 / dpi / (115 * scale);
          const luz = Math.min(shape.height * pixelToCm, shape.width * pixelToCm).toFixed(2);
          const AlturaVal = (luz / 20).toFixed(2);
          const Base = `0.30`;

          // Crear la fila HTML
          const ColumnaLosas = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>L/40</td>
                            <td class='py-2 px-4 text-center'>${luz} m</td>
                            <td class='py-2 px-4 text-center'>${AlturaVal} m</td>
                        </tr>
                    `;
          // Agregar la fila a la tabla
          document.getElementById("losasMac2_Cuadrada").insertAdjacentHTML("beforeend", ColumnaLosas);
        }
      }
    }
  }
  //clase lapiz
  class LapizTool extends Tool {
    constructor(ctx, fillColor, selectedColor, brushWidth) {
      super(ctx, fillColor);
      this.selectedColor = selectedColor;
      this.brushWidth = brushWidth;
    }

    startDrawing(e) {
      super.startDrawing(e);
      this.ctx.beginPath();
      this.ctx.moveTo(prevMouseX, prevMouseY);
    }

    draw(e) {
      if (!isDrawing) return;
      this.ctx.strokeStyle = this.selectedColor;
      this.ctx.lineWidth = this.brushWidth;
      this.ctx.lineTo(e.offsetX, e.offsetY);
      this.ctx.stroke();
    }

    stopDrawing(e) {
      super.stopDrawing(e);
      this.ctx.closePath();
    }

    saveShape(e) {
      const shape = {
        type: "pencil",
        points: [
          { x: prevMouseX, y: prevMouseY },
          { x: e.offsetX, y: e.offsetY },
        ],
        color: this.selectedColor,
        brushWidth: this.brushWidth,
        tool: "lapiz",
      };
      shapes.push(shape);
      this.updateCount();
    }

    drawShape(shape) {
      this.ctx.beginPath();
      this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
      for (let i = 1; i < shape.points.length; i++) {
        this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
      }
      this.ctx.strokeStyle = shape.color;
      this.ctx.lineWidth = shape.brushWidth;
      this.ctx.stroke();
    }
  }
  //class Texto
  class TextoTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.text = "";
      //this.fontSize = fontSize;
      this.fontFamily = "Arial";
    }

    startDrawing(e) {
      super.startDrawing(e);
      this.text = prompt("Ingrese el texto:", "");
      if (this.text) {
        this.saveShape(e);
      }
    }

    draw(e) {
      // Este método no se usa para texto
    }

    drawShape(shape) {
      this.ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
      this.ctx.fillStyle = shape.color;
      this.ctx.textBaseline = "top";
      this.ctx.fillText(shape.text, shape.x, shape.y);
    }

    saveShape(e) {
      const shape = {
        x: e.offsetX,
        y: e.offsetY,
        text: this.text,
        color: selectedColor,
        fontSize: fontSize,
        fontFamily: this.fontFamily,
        tool: "texto",
      };
      shapes.push(shape);
      this.redrawCanvas();
      this.updateCount();
    }

    moveShape(e) {
      const clickedShape = shapes.find(
        (shape) =>
          shape.tool === "texto" &&
          e.offsetX >= shape.x &&
          e.offsetX <= shape.x + this.ctx.measureText(shape.text).width &&
          e.offsetY >= shape.y &&
          e.offsetY <= shape.y + shape.fontSize,
      );

      if (clickedShape) {
        const dx = e.offsetX - clickedShape.x;
        const dy = e.offsetY - clickedShape.y;

        const moveText = (moveEvent) => {
          clickedShape.x = moveEvent.offsetX - dx;
          clickedShape.y = moveEvent.offsetY - dy;
          this.redrawCanvas();
        };

        const stopMoving = () => {
          canvas.removeEventListener("mousemove", moveText);
          canvas.removeEventListener("mouseup", stopMoving);
        };

        canvas.addEventListener("mousemove", moveText);
        canvas.addEventListener("mouseup", stopMoving);
      }
    }

    removeShape(e) {
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;

      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (shape.tool === "texto") {
          const textWidth = this.ctx.measureText(shape.text).width;
          const textHeight = shape.fontSize;
          if (
            mouseX >= shape.x &&
            mouseX <= shape.x + textWidth &&
            mouseY >= shape.y &&
            mouseY <= shape.y + textHeight
          ) {
            shapes.splice(i, 1);
            this.redrawCanvas();
            this.updateCount();
            return;
          }
        }
      }
    }
  }

  //class medida escalado del plano mediante linea
  class LineaEscalaTool extends Tool {
    constructor(ctx, fillColor, selectedColor, brushWidth) {
      super(ctx, fillColor);
      this.selectedColor = selectedColor;
      this.brushWidth = brushWidth;
    }

    draw(e) {
      if (!this.drawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const endX = e.offsetX;
      const endY = e.offsetY;

      this.drawLine(prevMouseX, prevMouseY, endX, endY);
    }

    drawLine(startX, startY, endX, endY) {
      // Dibujar la línea
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = this.selectedColor;
      this.ctx.lineWidth = this.brushWidth;
      this.ctx.stroke();

      // Calcular la longitud de la línea en píxeles
      const dx = endX - startX;
      const dy = endY - startY;
      const lengthPx = Math.sqrt(dx * dx + dy * dy);

      // Convertir la longitud a metros
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);
      const lengthM = lengthPx * pixelToCm;

      // Mostrar la longitud
      this.ctx.font = "12px Arial";
      this.ctx.fillStyle = "#000";
      this.ctx.fillText(`${lengthM.toFixed(2)} m`, (startX + endX) / 2, (startY + endY) / 2 - 10);
    }

    drawShape(shape) {
      this.drawLine(shape.startX, shape.startY, shape.endX, shape.endY);
    }

    saveShape(e) {
      const shape = {
        tool: "lineaEscala",
        startX: prevMouseX,
        startY: prevMouseY,
        endX: e.offsetX,
        endY: e.offsetY,
        color: this.selectedColor,
        brushWidth: this.brushWidth,
      };
      shapes.push(shape);
      this.redrawCanvas();
      this.updateCount();
    }

    drawingFinished() {
      console.log("Línea dibujada");
      // Aquí puedes agregar cualquier lógica adicional que quieras ejecutar
      // cuando se termina de dibujar la línea
    }

    updateCount() {
      const countElement = document.getElementById("linea-count");
      if (countElement) {
        const count = shapes.filter((shape) => shape.tool === "lineaEscala").length;
        countElement.textContent = count;
      }
    }
  }

  class placasTool extends Tool {
    constructor(ctx, fillColor) {
      super(ctx, fillColor);
      this.rectCount = 0;
    }

    draw(e) {
      if (!isDrawing) return;
      this.ctx.putImageData(snapshot, 0, 0);
      const width = e.offsetX - prevMouseX;
      const height = e.offsetY - prevMouseY;

      // Verificar si las dimensiones son significativas
      if (Math.abs(width) > 1 && Math.abs(height) > 1) {
        const shape = {
          x: prevMouseX,
          y: prevMouseY,
          width: width,
          height: height,
          color: selectedColor,
          brushWidth: brushWidth,
          fill: this.fillColor.checked,
        };
        this.drawShape(shape);
        const scale = valorScala; // Escala 1:50
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        // Agregar cotas mientras se dibuja el rectángulo
        this.ctx.font = "12px Arial";
        this.ctx.fillStyle = "#000";

        this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5); // Texto para la base
        this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2); // Texto para la altura
      }
    }

    drawShape(square) {
      if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
        return; // No dibujar si las dimensiones son muy pequeñas
      }

      ctx.beginPath();
      ctx.rect(square.x, square.y, square.width, square.height);
      ctx.lineWidth = square.brushWidth;
      ctx.strokeStyle = square.color;
      ctx.stroke();
      if (square.fill) {
        ctx.fillStyle = square.color;
        ctx.fill();
      }

      const areaCm2 = this.calculateArea(square);
      const scale = valorScala; // Escala 1:50
      const dpi = 96; // Asumiendo 96 DPI
      const pixelToCm = 2.54 / dpi / (115 * scale);
      const cplaca = 2.5;

      const p = areaCm2 * placaNpiso;

      const V = (Zplaca * Uplaca * splaca * cplaca * p) / Rplaca;

      const L = (V * 1000) / (0.85 * 0.53 * Math.sqrt(fcplaca, 2) * 20);

      const areaTotal = `Atotal= ${areaCm2.toFixed(2)} m`;

      const areaText = `P= ${p.toFixed(2)} Ton`;
      //formula
      const altura = `L= ${L.toFixed(2)} cm`;

      const TextV = `V= ${V.toFixed(2)} Ton`;

      const espesor = `Espesor= 0.20 m`;

      const textY = square.y + square.height / 2;
      const textX = square.x + square.width / 2 - ctx.measureText(areaText).width / 2;

      this.drawText(areaTotal, areaText, textY);
      ctx.fillText(areaTotal, textX, textY + 5);
      ctx.fillText(areaText, textX, textY + 15);
      ctx.fillText(TextV, textX, textY + 25);
      ctx.fillText(espesor, textX, textY + 35);
      ctx.fillText(altura, textX, textY + 45);

      // Añadir los valores al reporte
      this.addToReport(areaText, altura);
    }
    drawingFinished() {
      this.rectCount++;
      const countElement = document.getElementById("placa-count");
      countElement.textContent = this.rectCount;
      // console.log(`Te ${this.rectCount}`);
    }

    addToReport() {
      // Limpiar la tabla antes de agregar nuevas filas
      document.getElementById("placas_rp").innerHTML = "";
      let count = 1;
      // Recorremos todas las figuras almacenadas (shapes) para listar sus propiedades
      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        // Solo procesar si la figura es un rectángulo
        if (shape.tool === "placas") {
          const scale = valorScala; // Escala 1:50
          const dpi = 96; // Asumiendo 96 DPI
          const pixelToCm = 2.54 / dpi / (115 * scale);

          const cplaca = 2.5;
          const espesor = `0.20 m`;

          const areaCm2 = this.calculateArea(shape);

          const p = areaCm2 * placaNpiso;

          const V = (Zplaca * Uplaca * splaca * cplaca * p) / Rplaca;

          const L = (V * 1000) / (0.85 * 0.53 * Math.sqrt(fcplaca, 2) * 20);

          // Crear la fila HTML
          const ColumnaLosas = `
                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td class='py-2 px-8'>${count++}</td>
                            <td class='py-2 px-8'>At X Np X 1000</td>
                            <td class='py-2 px-4 text-center'>${areaCm2.toFixed(2)} m</td>
                            <td class='py-2 px-4 text-center'>${p.toFixed(2)} Ton</td>
                            <td class='py-2 px-4 text-center'>${V.toFixed(2)} Ton</td>
                            <td class='py-2 px-4 text-center'>${espesor} m</td>
                            <td class='py-2 px-4 text-center'>${L.toFixed(2)} cm</td>
                        </tr>
                    `;
          // Agregar la fila a la tabla
          document.getElementById("placas_rp").insertAdjacentHTML("beforeend", ColumnaLosas);
        }
      }
    }
  }
  // Objeto para acceder a las herramientas por nombre
  const tools = {
    rectangle: new RectangleTool(ctx, fillColor, selectedColor, brushWidth),
    cuadrado: new CuadradoTool(ctx, fillColor, selectedColor, brushWidth),
    circulo: new CirculoTool(ctx, fillColor, selectedColor, brushWidth),
    te: new TeTool(ctx, fillColor, selectedColor, brushWidth),
    ele: new EleTool(ctx, fillColor, selectedColor, brushWidth),
    cuadradovigas: new CuadradoVigasTool(ctx, fillColor, selectedColor, brushWidth),
    cuadradovigasse: new CuadradoVigassegTool(ctx, fillColor, selectedColor, brushWidth),
    cuadradovigascimentacion: new CuadradoVigascimentacionTool(ctx, fillColor, selectedColor, brushWidth),
    vigaSobreVigas: new CuadroVigasSobreVigas(ctx, fillColor, selectedColor, brushWidth),
    vigadeborde: new CuadroVigasBorde(ctx, fillColor, selectedColor, brushWidth),

    cuadradozapata: new CuadradoZapataTool(ctx, fillColor, selectedColor, brushWidth),
    cuadradolosas: new CuadradoLosasTool(ctx, fillColor, selectedColor, brushWidth),

    losaligerada1: new LosaAligeradaonedirTool(ctx, fillColor, selectedColor, brushWidth),
    losaligerada2: new LosaAligeradatwodirTool(ctx, fillColor, selectedColor, brushWidth),
    losamaciza1: new LosamacizaonedirTool(ctx, fillColor, selectedColor, brushWidth),
    losamaciza2: new LosamacizatwodirTool(ctx, fillColor, selectedColor, brushWidth),

    //PLACAS
    placas: new placasTool(ctx, fillColor, selectedColor, brushWidth),
    lapiz: new LapizTool(ctx, fillColor, selectedColor, brushWidth),
    texto: new TextoTool(ctx, fillColor, selectedColor),
    lineaEscala: new LineaEscalaTool(ctx, fillColor, selectedColor, brushWidth),
  };

  function redrawAllShapes() {
    // Aplicar el brillo actual al PDF
    if (originalPdfSnapshot) {
      const adjustedImageData = adjustPDFBrightness(currentBrightness);
      ctx.putImageData(adjustedImageData, 0, 0);
    }

    // Luego, dibujamos las formas visibles
    shapes.forEach((shape) => {
      if (shape.visible) {
        const tool = tools[shape.tool];
        if (tool && tool.drawShape) {
          tool.drawShape(shape);
        }
      }
    });
  }

  // Función para manejar el dibujo en el canvas
  function draw(e) {
    if (!isDrawing) return;
    tools[selectedTool].draw(e);
  }
  // Nuevo evento para el botón de eliminar
  let isErasing = false;
  let isMovingText = false;

  document.getElementById("eliminar_grafico").addEventListener("click", () => {
    isErasing = !isErasing;
    canvas.style.cursor = isErasing ? "crosshair" : "default";
  });
  canvas.addEventListener("mousedown", (e) => {
    if (isMovingText) {
      tools.texto.moveShape(e);
    } else if (isErasing) {
      // Buscar la forma más cercana al clic
      const eraserIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      eraserIcon.setAttribute("viewBox", "0 0 24 24");

      const eraserPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      eraserPath.setAttribute(
        "d",
        "M6.5 16c.69 0 1.24-.55 1.24-1.24v-4l-6-6-1.24 1.24v4c0 .69 .55 1.24 1.24 1.24zM18.76 17.24l-3.76-3.76c-.44-.44-1.14-.44-1.58 0-.44.44-.44 1.14 0 1.58l1.24 1.24c.22.22.51.33.79.33s.57-.11.79-.33l3.76-3.76c.44-.44.44-1.14 0-1.58a1.24 1.24 0 0 0-1.76 0zM14.76 2H9.24C8.55 2 8 2.55 8 3.24v16c0 .69.55 1.24 1.24 1.24h5.52c.69 0 1.24-.55 1.24-1.24V3.24C16 2.55 15.45 2 14.76 2z",
      );
      eraserIcon.appendChild(eraserPath);

      canvas.style.cursor = `url(data:image/svg+xml;base64,${btoa(eraserIcon.outerHTML)}), auto`;

      let closestShapeIndex = -1;
      let minDistance = Infinity;

      shapes.forEach((shape, index) => {
        let distance = Infinity;

        if (shape.tool === "lapiz" || shape.tool === selectedTool) {
          if (shape.points) {
            shape.points.forEach((point) => {
              const dx = e.offsetX - point.x;
              const dy = e.offsetY - point.y;
              const pointDistance = Math.sqrt(dx * dx + dy * dy);
              if (pointDistance < distance) {
                distance = pointDistance;
              }
            });
          } else {
            const dx = e.offsetX - shape.x;
            const dy = e.offsetY - shape.y;
            distance = Math.sqrt(dx * dx + dy * dy);
          }
        }

        if (selectedTool === "lineaEscala" && shape.tool === "lineaEscala") {
          const dx = shape.endX - shape.startX;
          const dy = shape.endY - shape.startY;
          const length = Math.sqrt(dx * dx + dy * dy);
          const t = ((e.offsetX - shape.startX) * dx + (e.offsetY - shape.startY) * dy) / (length * length);
          const tClamped = Math.max(0, Math.min(1, t));
          const closestX = shape.startX + tClamped * dx;
          const closestY = shape.startY + tClamped * dy;
          distance = Math.sqrt((e.offsetX - closestX) ** 2 + (e.offsetY - closestY) ** 2);
        }

        if (distance < minDistance) {
          minDistance = distance;
          closestShapeIndex = index;
        }
      });

      if (closestShapeIndex !== -1) {
        shapes.splice(closestShapeIndex, 1);
        tools[selectedTool].redrawCanvas();
        tools[selectedTool].updateCount();
      }
    } else if (selectedTool === "texto") {
      tools.texto.startDrawing(e);
    } else if (e.button === 0) {
      // Click izquierdo
      tools[selectedTool].startDrawing(e);
      console.log(selectedTool);
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      // Click izquierdo
      tools[selectedTool].stopDrawing(e);
    }
  });

  canvas.addEventListener("mousemove", draw);

  canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
  });
  canvas.addEventListener("dblclick", (e) => {
    tools[selectedTool].moveShape(e); // Doble clic para mover
  });

  canvas.addEventListener("mousemove", (e) => {
    draw(e);
  });

  canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
  });

  document.querySelectorAll(".tool").forEach((button) => {
    button.addEventListener("click", (e) => {
      selectedTool = e.currentTarget.getAttribute("data-tool");
      isMovingText = false;
      isErasing = false;
      canvas.style.cursor = "default";
    });
  });

  //Mostrar y Ocltar las figuras
  function toggleShapes(shapeType, isChecked) {
    console.log(shapeType);
    if (isChecked) {
      hideShapes(shapeType);
    } else {
      showShapes(shapeType);
    }
  }

  bindIfExists("colRect", "change", function () {
    toggleShapes("rectangle", this.checked);
  });

  bindIfExists("colCuad", "change", function () {
    toggleShapes("cuadrado", this.checked);
  });

  bindIfExists("colCircle", "change", function () {
    toggleShapes("circulo", this.checked);
  });

  bindIfExists("colT", "change", function () {
    toggleShapes("te", this.checked);
  });

  bindIfExists("colL", "change", function () {
    toggleShapes("ele", this.checked);
  });

  bindIfExists("vigaPrin", "change", function () {
    toggleShapes("cuadradovigas", this.checked);
  });

  bindIfExists("vigaCimen", "change", function () {
    toggleShapes("cuadradovigascimentacion", this.checked);
  });

  bindIfExists("losaCuad", "change", function () {
    toggleShapes("cuadradolosas", this.checked);
  });

  bindIfExists("zapataCuad", "change", function () {
    toggleShapes("cuadradozapata", this.checked);
  });
  // Agrega una propiedad 'visible' a las figuras al crearlas
  function addShape(shape) {
    shape.visible = true; // Por defecto, las formas son visibles
    shapes.push(shape);
  }

  // Ocultar las figuras de un tipo específico
  function hideShapes(toolName) {
    console.log(toolName);
    shapes.forEach((shape) => {
      console.log(shape.tool === toolName);
      if (shape.tool === toolName) {
        shape.visible = false; // Marcar como no visible
      }
    });
    redrawAllShapes();
  }

  // Mostrar las figuras de un tipo específico
  function showShapes(toolName) {
    shapes.forEach((shape) => {
      if (shape.tool === toolName) {
        shape.visible = true; // Marcar como visible
      }
    });
    redrawAllShapes();
  }
});

bindElementIfExists("btn_pdf_predim", "click", () => {
  const modernTableContainers = [...document.querySelectorAll(".predim-table-container")];
  if (modernTableContainers.length) {
    getBase64Image(imgurl, function (imgEncabezado) {
      const content = [
        {
          image: imgEncabezado,
          width: 560,
          margin: [0, 0, 0, 10],
        },
        {
          text: "Reporte de Predimensionamiento",
          alignment: "center",
          fontSize: 15,
          bold: true,
          margin: [0, 0, 0, 16],
        },
      ];

      modernTableContainers.forEach((container) => {
        const tbody = container.querySelector("tbody");
        if (!tbody || !tbody.children.length) {
          return;
        }

        const heading = container.querySelector("h3")?.childNodes?.[0]?.textContent?.trim() || "Tabla";
        const table = container.querySelector("table");
        const rows = [...table.querySelectorAll("tr")].map((row) =>
          [...row.querySelectorAll("th,td")].map((cell) => ({
            text: cell.textContent.trim(),
            style: row.parentElement.tagName === "THEAD" ? "tableHeader" : "tableCell",
          })),
        );

        content.push({
          text: heading,
          alignment: "center",
          fontSize: 11,
          bold: true,
          margin: [0, 12, 0, 8],
        });
        content.push({
          table: {
            headerRows: 1,
            widths: Array(rows[0]?.length || 1).fill("*"),
            body: rows,
          },
          layout: "lightHorizontalLines",
        });
      });

      pdfMake
        .createPdf({
          pageMargins: [18, 18, 18, 24],
          pageOrientation: "landscape",
          content,
          styles: {
            tableHeader: { bold: true, fillColor: "#e5e7eb", fontSize: 9 },
            tableCell: { fontSize: 8 },
          },
        })
        .download("Predimensionamiento.pdf");
    });
    return;
  }

  // Extraer datos de la tabla "Columna Rectangular"
  const tableRectangularData = [];
  const rowsRectangular = document.querySelectorAll("#tablaColRect tbody tr");

  rowsRectangular.forEach((row) => {
    const rowData = [];
    const cells = row.querySelectorAll("td, th");
    cells.forEach((cell) => {
      rowData.push(cell.textContent.trim());
    });
    if (rowData.length > 0) {
      tableRectangularData.push(rowData);
    }
  });

  // Extraer datos de la tabla "Columna Cuadrada"
  const tableCuadradoData = [];
  const rowsCuadrado = document.querySelectorAll("#tablaColCuad tbody tr");

  rowsCuadrado.forEach((row) => {
    const rowData = [];
    const cells = row.querySelectorAll("td, th");
    cells.forEach((cell) => {
      rowData.push(cell.textContent.trim());
    });
    if (rowData.length > 0) {
      tableCuadradoData.push(rowData);
    }
  });

  //Extraer datos de la tabla "Columna circular"
  const tableCircularData = [];
  const rowsCircular = document.querySelectorAll("#tablaColCircle tbody tr");

  rowsCircular.forEach((row) => {
    const rowData = [];
    const cells = row.querySelectorAll("td, th");
    cells.forEach((cell) => {
      rowData.push(cell.textContent.trim());
    });
    if (rowData.length > 0) {
      tableCircularData.push(rowData);
    }
  });

  //Extraer datos de la tabla "Columna TE"
  const tablecolTeData = [];
  const rowscolsTe = document.querySelectorAll("#tablaColTe tbody tr");

  rowscolsTe.forEach((row) => {
    const rowData = [];
    const cells = row.querySelectorAll("td, th");
    cells.forEach((cell) => {
      rowData.push(cell.textContent.trim());
    });
    if (rowData.length > 0) {
      tablecolTeData.push(rowData);
    }
  });

  //Extraer datos de la tabla "Columna ELE"
  const tableLeData = [];
  const rowsLe = document.querySelectorAll("#tablaColLe tbody tr");

  rowsLe.forEach((row) => {
    const rowData = [];
    const cells = row.querySelectorAll("td, th");
    cells.forEach((cell) => {
      rowData.push(cell.textContent.trim());
    });
    if (rowData.length > 0) {
      tableLeData.push(rowData);
    }
  });

  console.log({ tableRectangularData, tablecolTeData, tableLeData });

  const tableAsPDFMake = (table) => {
    const header = Array.from(table.querySelectorAll("thead th")).map((ths) => {
      return ths.textContent.trim();
    });
    const widths = header.map((_) => {
      return "*";
    });
    const body = Array.from(table.querySelectorAll("tbody tr")).map((tr) => {
      return Array.from(tr.querySelectorAll("td")).map((td) => {
        return td.textContent.trim();
      });
    });

    body.unshift(header);

    return {
      table: {
        headerRows: 1,
        widths: widths,
        body: body,
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 20],
      fontSize: 10,
    };
  };

  const tablaVigasP = tableAsPDFMake(document.querySelector("#tablaVigasP"));
  const tablaVigaSeg = tableAsPDFMake(document.querySelector("#tablaVigaSeg"));
  const tablaCimen = tableAsPDFMake(document.querySelector("#tablaCimen"));
  const tablaVigaSVigas = tableAsPDFMake(document.querySelector("#tablaVigaSVigas"));
  const tablaVigaSBorde = tableAsPDFMake(document.querySelector("#tablaVigaSBorde"));
  const tablaLosasCuad = tableAsPDFMake(document.querySelector("#tablaLosasCuad"));
  const tablaLosasAlig = tableAsPDFMake(document.querySelector("#tablaLosasAlig"));
  const tablaLosasMaci = tableAsPDFMake(document.querySelector("#tablaLosasMaci"));
  const tablaLosasMaci2 = tableAsPDFMake(document.querySelector("#tablaLosasMaci2"));
  const tablaZapataCuad = tableAsPDFMake(document.querySelector("#tablaZapataCuad"));
  const tablaCimentacionZap = tableAsPDFMake(document.querySelector("#tablaCimentacionZap"));

  // Obtener la imagen base64
  getBase64Image(imgurl, function (imgEncabezado) {
    const texto1 = "Correo: rizabalasociados.estructurales@gmail.com";
    const texto2 = "Telefono: 953992277";
    const texto3 = "Direccion: jr. bolivar";
    const texto4 = "Fecha: 16/08/2024";

    // Definir el documento PDF
    const docDefinition = {
      // watermark: {
      //     text: 'Rizabal & Asociados  Ingenieros Estructurales', // Texto de la marca de agua
      //     color: 'blue', // Color de la marca de agua
      //     opacity: 0.3, // Transparencia (0 a 1)
      //     bold: true, // Negrita
      //     italics: false, // Cursiva
      //     fontSize: 30, // Tamaño de la fuente
      //     angle: 45 // Ángulo de rotación en grados
      // },
      background: function (currentPage, pageSize) {
        return {
          image: imgEncabezado, // Aquí va tu imagen en base64
          width: pageSize.width, // Ajustar el ancho al tamaño de la página
          height: pageSize.height, // Ajustar el alto al tamaño de la página
          opacity: 0.1, // Ajustar la transparencia para simular marca de agua
          absolutePosition: { x: 0, y: 0 }, // Colocar en la posición inicial
        };
      },
      header: {
        columns: [
          { image: imgEncabezado, width: 210, height: 50, margin: [10, -10, 0, 0] },
          {
            stack: [
              { text: texto1, margin: [0, 0, 0, 5] },
              { text: texto2, margin: [0, 0, 0, 5] },
              { text: texto3, margin: [0, 0, 0, 5] },
              { text: texto4, margin: [0, 0, 0, 5] },
            ],
            alignment: "right",
            fontSize: 10,
            margin: [10, 10, 30, 0],
          },
        ],
      },
      footer: function (currentPage, pageCount) {
        return {
          text: "Página " + currentPage.toString() + " de " + pageCount,
          alignment: "center",
          fontSize: 10,
          margin: [0, 0, 0, 10],
        };
      },
      content: [
        { text: "Resumen de Predimensiones", alignment: "center", fontSize: 16, margin: [0, 30, 0, 20] },

        // Primera tabla: Columna Rectangular
        { text: "Columna Rectangular", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*", "*"],
            body: [
              ["N°", "Elementos", "Área Tributaria (AT)", "Área del Rectángulo (A)", "Base (b)", "Lado del Rectángulo"],
              ...tableRectangularData,
            ],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 20],
          fontSize: 10,
        },

        // Segunda tabla: Columna Cuadrada
        { text: "Columna Cuadrada", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*"],
            body: [
              ["N°", "Elementos", "Área Tributaria (AT)", "Área del Cuadrado (A)", "Lado del Cuadrado"],
              ...tableCuadradoData,
            ],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 20],
          fontSize: 10,
        },

        // Tercera tabla: Columna Circular
        { text: "Columna Circular", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*"],
            body: [["N°", "Elementos", "Área Tributaria (AT)", "Área del Circulo (A)", "Radio"], ...tableCircularData],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 20],
          fontSize: 10,
        },

        // Cuarta tabla: Columna T
        { text: "Columna T", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*", "*"],
            body: [["N°", "Elementos", "Área Tributaria (AT)", "Área (A)", "base (e)", "Lado"], ...tablecolTeData],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 20],
          fontSize: 10,
        },

        // Quinta tabla: Columna L
        { text: "Columna L", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*", "*"],
            body: [["N°", "Elementos", "Área Tributaria (AT)", "Área (A)", "base (e)", "Lado"], ...tableLeData],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 20],
          fontSize: 10,
        },
        { text: "Vigas Principal", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        tablaVigasP,
        { text: "Vigas SEGUNDARIA", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        tablaVigaSeg,
        { text: "Vigas Cimentacion", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        tablaCimen,
        { text: "Vigas Sobre Vigas", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        tablaVigaSVigas,
        { text: "Vigas de Borde", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        tablaVigaSBorde,
        { text: "Losas Aligerada 1 dir", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        tablaLosasCuad,
        { text: "Losas Aligerada 2 dir", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        tablaLosasAlig,
        { text: "Losas Maciza 1 dir", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        tablaLosasMaci,
        { text: "Losas Maciza 2 dir", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        tablaLosasMaci2,
        { text: "Cimentacion Zapata Cuadrada", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        tablaZapataCuad,
        { text: "Cimentacion Zapata Cuadrada", alignment: "center", fontSize: 10, margin: [0, 20, 0, 10] },
        tablaCimentacionZap,
      ],
      pageBreakBefore: function (currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
        return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
      },
    };

    // Generar y descargar e PDF
    pdfMake.createPdf(docDefinition).download("reporte_predim.pdf");
  });

  // Función para convertir imagen a Base64
  function getBase64Image(imgPath, callback) {
    var img = new Image();
    img.crossOrigin = "Anonymous"; // Para evitar problemas con CORS
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      var dataURL = canvas.toDataURL("image/png");
      callback(dataURL);
    };
    img.src = imgPath;
  }
});

$(document).ready(function () {
  document.getElementById("imprimir_doc").addEventListener("click", function () {
    // Selecciona el div que quieres imprimir
    $("#canvas").printThis({
      debug: false, // Mostrar la ventana de depuración
      importCSS: true, // Importar estilos CSS
      importStyle: true, // Importar estilos directamente desde las etiquetas <style>
      loadCSS: "", // Ruta al CSS adicional si lo necesitas
      pageTitle: "Predim", // Título de la página impresa
      removeInline: false, // No eliminar los estilos en línea
      printDelay: 333, // Añadir un pequeño retraso antes de la impresión
      header: null, // HTML que aparecerá como encabezado en la impresión
      footer: null, // HTML que aparecerá como pie de página en la impresión
      base: false, // Usar la URL base para las rutas
      formValues: true, // Conservar los valores de los formularios
      canvas: true, // Incluir el contenido de los canvas (gráficos)
      Image: true,
      doctypeString: "<!DOCTYPE html>", // Doctype de la impresión
      removeScripts: false, // No eliminar las etiquetas <script>
      copyTagClasses: false, // No copiar las clases de las etiquetas HTML
    });
  });

  // ===== Helpers =====
  const descargarPNG = (dataUrl, nombre) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = nombre;
    link.click();
  };

  const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const capturarElemento = async (elemento, oncloneExtra = null) => {
    return html2canvas(elemento, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
      onclone: (doc) => {
        doc.body.style.margin = "0";
        doc.body.style.padding = "0";
        doc.body.style.backgroundColor = "#ffffff";

        if (oncloneExtra) oncloneExtra(doc);
      },
    });
  };

  const exportarCanvasHD = (canvas, nombre = "Canvas.png", scale = 3) => {
    const highResCanvas = document.createElement("canvas");
    const ctx = highResCanvas.getContext("2d");

    highResCanvas.width = canvas.width * scale;
    highResCanvas.height = canvas.height * scale;

    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);

    descargarPNG(highResCanvas.toDataURL("image/png"), nombre);
  };

  // ===== Exportar tablas =====
  bindElementIfExists("btn_png_predimPNG", "click", async function () {
    const bloques = [...document.querySelectorAll(".table-responsive")];
    if (!bloques.length) {
      alert("No se encontraron tablas para exportar.");
      return;
    }

    const boton = this;
    const textoOriginal = boton.textContent;

    try {
      boton.disabled = true;
      boton.textContent = "Exportando...";

      for (const bloque of bloques) {
        const tbody = bloque.querySelector("tbody");
        if (!tbody || !tbody.innerHTML.trim()) continue;

        const fileName = bloque.dataset.file || "tabla-predim";

        const canvas = await capturarElemento(bloque, (doc) => {
          const clone = doc.querySelector(`[data-file="${fileName}"]`);
          if (clone) {
            clone.style.margin = "0";
            clone.style.padding = "0";
            clone.style.backgroundColor = "#ffffff";
            clone.style.color = "#000000";
          }
        });

        descargarPNG(canvas.toDataURL("image/png"), `${fileName}.png`);
        await esperar(300);
      }
    } catch (error) {
      console.error("Error al exportar tablas:", error);
      alert("Ocurrió un error al exportar las tablas.");
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  });

  // ===== Exportar canvas =====
  document.getElementById("btnCanvasPNG").addEventListener("click", () => {
    const canvas = document.getElementById("canvas");

    if (!canvas) {
      alert("No se encuentra el canvas");
      return;
    }

    exportarCanvasHD(canvas, "Predisionamiento.png", 3);
  });

});

const btnPngPredim = document.getElementById("btn_png_predim");
if (btnPngPredim) {
btnPngPredim.addEventListener("click", async function () {
  const bloques = document.querySelectorAll(".predim-table-container");

  if (!bloques.length) {
    alert("No se encontraron tablas para exportar.");
    return;
  }

  const boton = this;
  const textoOriginal = boton.textContent;

  try {
    boton.disabled = true;
    boton.textContent = "Exportando...";

    for (const bloque of bloques) {
      const tbody = bloque.querySelector("tbody");
      const fileName = bloque.dataset.file || "tabla-predim";

      // Solo exportar si tiene contenido real
      if (!tbody || tbody.innerHTML.trim() === "") {
        continue;
      }

      const canvas = await html2canvas(bloque, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (doc) => {
          const clone = doc.querySelector(`[data-file="${fileName}"]`);
          if (clone) {
            clone.style.margin = "0";
            clone.style.padding = "0";
            clone.style.backgroundColor = "#ffffff";
            clone.style.color = "#000000";
          }

          doc.body.style.margin = "0";
          doc.body.style.padding = "0";
          doc.body.style.backgroundColor = "#ffffff";
        },
      });

      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // pequeña pausa para que no choque la descarga múltiple
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  } catch (error) {
    console.error("Error al exportar tablas:", error);
    alert("Ocurrió un error al exportar las tablas.");
  } finally {
    boton.disabled = false;
    boton.textContent = textoOriginal;
  }
});
}
