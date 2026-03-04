import imgurl from "../img/rizabalasociados.png";
import "print-this";

// Import tools
import { RectangleTool } from './tools/columns/RectangleTool.js';
import { CuadradoTool } from './tools/columns/CuadradoTool.js';

/**
 * Main entry point for the predim module
 * Initializes canvas, tools, and event handlers
 */
document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const brightnessRange = document.getElementById("brightnessRange");
    let originalPdfSnapshot;
    const colorPicker = document.getElementById("color-picker");
    const npisosInput = document.getElementById("npisos");

    // Initialize PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.7.570/pdf.worker.min.js";

    // State variables
    let ZpisosInput = 0;
    let ZsuelosInput = 0;
    let fc = 210;
    let brushWidth = 1;
    let fontSize = "12";
    let selectedColor = "#0400ff";
    let escalaMedido = 0;
    let escalaPlano = 0;
    let valorScala = 1;

    // Placa parameters
    let Zplaca = 1, Uplaca = 1, splaca = 1, Rplaca = 1, fcplaca = 210, placaNpiso = 1;

    // Drawing state
    const uploadPDFInput = document.getElementById("upload-pdf");
    let prevMouseX, prevMouseY, isDrawing = false, snapshot;
    let selectedTool = "rectangle";
    let fillColor = { checked: false };
    let shapes = []; // Array para almacenar todas las formas dibujadas
    let pdfSnapshot = null;
    let currentBrightness = 1;

    // Initialize tools with explicit dependency injection
    const tools = {
        rectangle: new RectangleTool(ctx, fillColor),
        cuadrado: new CuadradoTool(ctx, fillColor),
        // NOTE: The following tools need to be created following the same pattern as Rectangle and Cuadrado
        // circulo: new CirculoTool(ctx, fillColor),
        // te: new TeTool(ctx, fillColor),
        //ele: new EleTool(ctx, fillColor),
        // cuadradovigas: new CuadradoVigasTool(ctx, fillColor),
        // cuadradovigasse: new CuadradoVigassegTool(ctx, fillColor),
        // cuadradovigascimentacion: new CuadradoVigascimentacionTool(ctx, fillColor),
        // vigaSobreVigas: new CuadroVigasSobreVigas(ctx, fillColor),
        // vigadeborde: new VigaDeBordeTool(ctx, fillColor),
        // losaligerada1: new LosaAligerada1Tool(ctx, fillColor),
        // losaligerada2: new LosaAligerada2Tool(ctx, fillColor),
        // losamaciza1: new LosaMaciza1Tool(ctx, fillColor),
        // losamaciza2: new LosaMaciza2Tool(ctx, fillColor),
        // cuadradozapata: new ZapataTool(ctx, fillColor),
        // placas: new PlacasTool(ctx, fillColor),
        // lapiz: new LapizTool(ctx, fillColor),
        // texto: new TextoTool(ctx, fillColor),
        // lineaEscala: new LineaEscalaTool(ctx, fillColor),
    };

    // Event listeners for inputs
    document.getElementById("Zpisos").addEventListener("input", () => {
        ZpisosInput = parseFloat(document.getElementById("Zpisos").value);
    });

    document.getElementById("Zsuelos").addEventListener("input", () => {
        ZsuelosInput = parseFloat(document.getElementById("Zsuelos").value);
    });

    document.getElementById("fc").addEventListener("input", () => {
        fc = parseFloat(document.getElementById("fc").value);
    });

    // Brush width controls
    function setBrushWidth(newWidth) {
        brushWidth = newWidth;
        console.log(`Nuevo ancho de pincel: ${brushWidth}`);
    }

    const brushWidthLinks = document.querySelectorAll("#grosorline a");
    brushWidthLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const newWidth = parseInt(link.dataset.brushWidth, 10);
            setBrushWidth(newWidth);
        });
    });

    // Font size controls
    function setFontSize(newSize) {
        fontSize = newSize;
        console.log(`Nuevo tamaño de letra: ${fontSize}`);
    }

    const fontSizeLinks = document.querySelectorAll("#grosorletter a");
    fontSizeLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const newSize = link.dataset.fontSize;
            setFontSize(newSize);
        });
    });

    // Color selection
    const colorLinks = document.querySelectorAll("[data-color]");
    colorLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const target = event.target.closest("[data-color]");
            if (!target) return;
            selectedColor = target.getAttribute("data-color");
            colorLinks.forEach((link) => link.classList.remove("selected-color"));
            target.classList.add("selected-color");
        });
    });

    // Set initial selected color
    colorLinks.forEach((link) => {
        if (link.getAttribute("data-color") === selectedColor) {
            link.classList.add("selected-color");
        }
    });

    // Scale calculation
    document.getElementById("escalaVal").addEventListener("input", () => {
        escalaMedido = parseFloat(document.getElementById("escalaVal").value);
    });

    document.getElementById("escalaplano").addEventListener("input", () => {
        escalaPlano = parseFloat(document.getElementById("escalaplano").value);
    });

    document.getElementById("calc").addEventListener("click", function () {
        valorScala = escalaMedido / escalaPlano;
        console.log("Escala calculada:", valorScala);
    });

    // Placas parameters
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

    // PDF rendering functions
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
                    originalPdfSnapshot.height
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
            originalPdfSnapshot.height
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
        ctx.putImageData(adjustedImageData, 0, 0);
        redrawShapes();
    }

    function redrawShapes() {
        shapes.forEach((shape) => {
            const tool = tools[shape.tool];
            if (tool && tool.drawShape) {
                tool.drawShape(shape, valorScala, npisosInput.value, fc);
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

    // Canvas drawing events
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);

    function startDraw(e) {
        prevMouseX = e.offsetX;
        prevMouseY = e.offsetY;
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        isDrawing = true;
        const tool = tools[selectedTool];
        if (tool) {
            draw(e);
        }
    }

    function draw(e) {
        if (!isDrawing) return;

        const tool = tools[selectedTool];
        if (tool && tool.draw) {
            tool.draw(e, prevMouseX, prevMouseY, snapshot, isDrawing, valorScala, selectedColor, brushWidth);
        }
    }

    function stopDraw(e) {
        if (isDrawing) {
            saveShape(e);
            const tool = tools[selectedTool];
            if (tool && tool.drawingFinished) {
                tool.drawingFinished(shapes);
            }
            if (tool && tool.addToReport) {
                tool.addToReport(shapes, valorScala);
            }
        }
        isDrawing = false;
    }

    function saveShape(e) {
        const shape = {
            x: prevMouseX,
            y: prevMouseY,
            width: e.offsetX - prevMouseX,
            height: e.offsetY - prevMouseY,
            color: selectedColor,
            brushWidth: brushWidth,
            fill: fillColor.checked,
            tool: selectedTool,
        };
        shapes.push(shape);
        updateAllCounts();
    }

    function updateAllCounts() {
        Object.values(tools).forEach(tool => {
            if (tool && tool.updateCount) {
                tool.updateCount(shapes);
            }
        });
    }

    // Tool selection
    const toolButtons = document.querySelectorAll(".tool");
    toolButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectedTool = button.dataset.tool;
            console.log("Herramienta seleccionada:", selectedTool);
        });
    });

    // Delete shape functionality
    document.getElementById("eliminar_grafico").addEventListener("click", () => {
        canvas.addEventListener("click", removeShapeHandler);
    });

    function removeShapeHandler(e) {
        const shapeIndex = shapes.findIndex(
            (shape) =>
                e.offsetX >= shape.x &&
                e.offsetX <= shape.x + shape.width &&
                e.offsetY >= shape.y &&
                e.offsetY <= shape.y + shape.height
        );

        if (shapeIndex !== -1) {
            shapes.splice(shapeIndex, 1);
            applyBrightnessAndRedraw();
            updateAllCounts();
            canvas.removeEventListener("click", removeShapeHandler);
        }
    }
});

// Modal functionality
document.getElementById('openModal').onclick = function () {
    document.getElementById('myModal').style.display = 'block';
}

document.querySelector('.close').onclick = function () { document.getElementById('myModal').style.display = 'none'; }

document.getElementById('closeModal').onclick = function () {
    document.getElementById('myModal').style.display = 'none';
}

window.onclick = function (event) {
    if (event.target == document.getElementById('myModal')) {
        document.getElementById('myModal').style.display = 'none';
    }
}

// Print functionality
$(document).ready(function () {
    document.getElementById("imprimir_doc").addEventListener("click", function () {
        $("#canvas").printThis({
            debug: false,
            importCSS: true,
            importStyle: true,
            loadCSS: "",
            pageTitle: "Predim",
            removeInline: false,
            printDelay: 333,
            header: null,
            footer: null,
            base: false,
            formValues: true,
            canvas: true,
            Image: true,
            doctypeString: "<!DOCTYPE html>",
            removeScripts: false,
            copyTagClasses: false,
        });
    });
});

// NOTE: PDF generation functionality to be extracted to pdf/pdfGenerator.js
// See lines 2886-3411 in original adm_predim_view.js
