
import html2canvas from "html2canvas";
// Lazy load pdfmake
let pdfMake = null;
let pdfFonts = null;

// Import logo
import logo from "../../../img/rizabalasociados.png";

/**
 * Initialize pdfMake dynamically
 */
const initPdfMake = async () => {
    if (!pdfMake) {
        try {
            const pdfMakeModule = await import('pdfmake/build/pdfmake');
            const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

            pdfMake = pdfMakeModule.default || pdfMakeModule;
            pdfFonts = pdfFontsModule.default || pdfFontsModule;

            if (pdfMake && pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
                pdfMake.vfs = pdfFonts.pdfMake.vfs;
            }
        } catch (error) {
            console.error('Error loading pdfMake:', error);
            throw new Error('No se pudo cargar el generador de PDF.');
        }
    }
    return pdfMake;
};

function getBase64Image(imgPath) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/png");
            resolve({ dataURL, width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = imgPath;
    });
}

/**
 * Captures a DOM element as an image using html2canvas
 */
const captureElement = async (element) => {
    if (!element) return null;
    try {
        const canvas = await html2canvas(element, {
            scale: 2, // Higher resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff', // Ensure white background
            windowWidth: 2500, // Force large window width to capture wide tables
            windowHeight: 2500, // Force large window height
            onclone: (doc) => {
                // Ensure text is black for PDF
                const el = doc.getElementById(element.id);
                if (el) {
                    el.style.color = "black";
                    el.classList.add('p-2'); // Add padding
                    // Force full width capture for scrollable tables
                    el.style.width = 'fit-content';
                    el.style.overflow = 'visible';
                    el.style.maxWidth = 'none';

                    // Force background white on tables if they are dark
                    const tables = el.querySelectorAll('table');
                    tables.forEach(t => t.style.color = 'black');
                    const headers = el.querySelectorAll('th, .bg-gray-800, .bg-gray-700');
                    headers.forEach(h => {
                        // Keep headers distinguishable but readable in PDF
                        // h.style.backgroundColor = '#e5e7eb'; // Light gray
                        // h.style.color = 'black';
                    });
                }
            }
        });
        return canvas.toDataURL('image/png');
    } catch (e) {
        console.error("Error capturing element", e);
        return null;
    }
};

/**
 * Genera un PDF con los resultados capturados del DOM
 */
export const downloadBeamPDF = async (allResults, projectData) => {
    // 1. Initialize pdfMake
    const pdfMakeInstance = await initPdfMake();

    // 2. Capture Content Images
    const content = [];

    // Capture Input Table
    const inputTableEl = document.getElementById("tablaContainer");
    if (inputTableEl) {
        content.push({ text: '1. Datos de Entrada', style: 'sectionTitle', margin: [0, 10] });
        const img = await captureElement(inputTableEl);
        if (img) content.push({ image: img, width: 500, margin: [0, 5, 0, 20] });
    }

    // Capture Result Tables from #vigas_general
    const resultsContainer = document.getElementById("vigas_general");
    if (resultsContainer) {
        // Find all result table wrappers (created by resultRenderer)
        const childTables = resultsContainer.querySelectorAll('.mb-8');

        // Map titles to order if necessary, but DOM order is usually correct
        // The renderRenderer adds a title div inside the wrapper

        for (const tableWrapper of childTables) {
            const titleEl = tableWrapper.querySelector('div.font-bold');
            const title = titleEl ? titleEl.textContent : 'Resultados';

            // Check for specific section titles to add proper headers
            // Or just use the captured image which includes the title!

            const img = await captureElement(tableWrapper);
            if (img) {
                content.push({ image: img, width: 500, pageBreak: 'auto', margin: [0, 0, 0, 20] });
            }
        }
    }

    // 3. Load Logo
    let logoData = null;
    try {
        logoData = await getBase64Image(logo);
    } catch (e) {
        console.warn("Logo loading failed", e);
    }

    // 4. Create Document Definition
    const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait', // Or landscape if tables are wide
        pageMargins: [40, 80, 40, 60],

        header: (currentPage, pageCount) => {
            const cols = [];
            if (logoData) {
                cols.push({ image: logoData.dataURL, width: 150, margin: [10, 10, 0, 0] });
            }
            cols.push({
                stack: [
                    { text: "DISEÑO DE VIGAS DE CONCRETO ARMADO", bold: true, fontSize: 14, alignment: 'right' },
                    { text: `Fecha: ${new Date().toLocaleDateString('es-PE')}`, alignment: 'right', fontSize: 10 },
                    { text: "Rizabal & Asociados", alignment: 'right', fontSize: 10, color: 'gray' }
                ],
                margin: [10, 20, 40, 0],
                alignment: 'right'
            });

            return {
                columns: cols
            };
        },

        footer: (currentPage, pageCount) => {
            return {
                margin: [40, 10],
                columns: [
                    { text: 'Generado por Sistema de Cálculo', style: 'footer', alignment: 'left' },
                    { text: `Página ${currentPage} de ${pageCount}`, style: 'footer', alignment: 'right' }
                ]
            };
        },

        content: content,

        styles: {
            sectionTitle: {
                fontSize: 16,
                bold: true,
                color: '#1f2937',
                margin: [0, 10, 0, 10]
            },
            footer: {
                fontSize: 8,
                color: '#6b7280'
            }
        }
    };

    // 5. Download
    const fileName = `viga_calculo_${new Date().toISOString().split('T')[0]}.pdf`;
    pdfMakeInstance.createPdf(docDefinition).download(fileName);
};