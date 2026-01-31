
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
 * Parses an HTML table and converts it to pdfmake body structure
 */
const parseHtmlTableToPdfBody = (tableEl) => {
    const body = [];
    if (!tableEl) return body;

    // Better approach: Virtual Grid
    // 1. Calculate max columns
    let maxCols = 0;
    const allRows = tableEl.querySelectorAll('tr');

    // Naive max col check on first row (usually header)
    if (allRows.length > 0) {
        const firstRowCells = allRows[0].querySelectorAll('th, td');
        firstRowCells.forEach(c => maxCols += (c.colSpan || 1));
    }

    const grid = [];

    // Initialize Grid
    for (let r = 0; r < allRows.length; r++) {
        grid[r] = [];
        for (let c = 0; c < maxCols; c++) {
            grid[r][c] = null; // Placeholder
        }
    }

    // Fill Grid
    Array.from(allRows).forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('th, td');
        let colIndex = 0;

        cells.forEach(cell => {
            // Find next available slot
            while (grid[rowIndex][colIndex] !== null) {
                colIndex++;
            }

            let cellText = "";
            // 1. Check for Selects (Get selected text)
            const select = cell.querySelector('select');
            if (select) {
                const selectedOption = select.options[select.selectedIndex];
                cellText = selectedOption ? selectedOption.text : "-";
            }
            // 2. Check for Inputs (Get value)
            else if (cell.querySelector('input')) {
                cellText = cell.querySelector('input').value || "-";
            }
            // 3. Standard Text
            else {
                cellText = cell.innerText.trim();
            }
            cellText = cellText.replace(/\n+/g, ' ');

            const isHeader = cell.tagName === 'TH';
            const isBold = isHeader || cell.classList.contains('font-bold') || cell.querySelector('.font-bold');

            // Determine Alignment
            let alignment = 'center';
            if (cell.classList.contains('text-left')) alignment = 'left';
            if (cell.classList.contains('text-right')) alignment = 'right';

            // Fill color
            let fillColor = null;
            if (isHeader) fillColor = '#4b5563';
            if (cell.classList.contains('bg-gray-800') || cell.classList.contains('bg-gray-600')) fillColor = '#4b5563';
            if (cell.classList.contains('bg-gray-100')) fillColor = '#f3f4f6';
            if (cell.classList.contains('bg-red-50')) fillColor = '#fef2f2';
            if (cell.classList.contains('bg-green-50')) fillColor = '#f0fdf4';

            // Text Color
            let color = '#000000';
            if (fillColor === '#4b5563') color = '#ffffff';
            if (cell.classList.contains('text-red-600')) color = '#dc2626';
            if (cell.classList.contains('text-green-700')) color = '#15803d';

            // Adjust header validation colors
            if (cellText === 'NO CUMPLE') {
                fillColor = '#fee2e2'; // red
                color = '#dc2626';
            } else if (cellText === 'CUMPLE') {
                fillColor = '#dcfce7'; // green
                color = '#166534';
            }

            const pdfCell = {
                text: cellText,
                style: isHeader ? 'tableHeader' : 'tableCell',
                rowSpan: cell.rowSpan || 1,
                colSpan: cell.colSpan || 1,
                alignment: alignment,
                fillColor: fillColor,
                color: color,
                fontSize: 6, // Reduced font size for better fit
                noWrap: false // Allow wrapping
            };

            grid[rowIndex][colIndex] = pdfCell;

            // Mark spanned cells in grid
            const rs = cell.rowSpan || 1;
            const cs = cell.colSpan || 1;

            for (let r = 0; r < rs; r++) {
                for (let c = 0; c < cs; c++) {
                    if (r === 0 && c === 0) continue; // Skip the main cell
                    // Verify bounds
                    if (grid[rowIndex + r] && (colIndex + c) < maxCols) {
                        grid[rowIndex + r][colIndex + c] = { text: '', border: undefined, fillColor: fillColor }; // Empty placeholder
                    }
                }
            }

            colIndex += cs;
        });
    });

    return grid.map(row => row.map(cell => cell || { text: '' }));
};

/**
 * Genera un PDF con los resultados capturados del DOM
 */
export const downloadBeamPDF = async (allResults, projectData) => {
    // 1. Initialize pdfMake
    const pdfMakeInstance = await initPdfMake();

    // 2. Build Content
    const content = [];

    // Helper to add a table to content
    const addTableFromDOM = (containerId, title) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Find all table wrappers inside
        const wrappers = container.querySelectorAll('.mb-8');
        wrappers.forEach(wrapper => {
            // Try to find the title inside the wrapper
            const titleEl = wrapper.querySelector('div.font-bold');
            const tableTitle = titleEl ? titleEl.textContent : title;

            // Find the table
            const table = wrapper.querySelector('table');
            if (table) {
                const body = parseHtmlTableToPdfBody(table);

                // Determine widths
                // First 2 Cols are Description and Symbol (fixed small width)
                // Rest are dynamic segments
                const totalCols = body[0].length;
                const widths = [];
                widths.push(70); // Description
                widths.push(25); // Symbol
                for (let i = 2; i < totalCols; i++) {
                    widths.push('*'); // Distribute evenly
                }

                content.push({ text: tableTitle, style: 'sectionTitle' });
                content.push({
                    table: {
                        headerRows: 2, // Assume usually 2 header rows
                        widths: widths,
                        body: body,
                        // To handle cell borders correctly with colspans/rowspans in pdfmake, sometimes we need layout tweaks
                        // but standard grid usually works if placeholders are correct.
                        dontBreakRows: true // Try to keep rows together
                    },
                    layout: {
                        hLineWidth: function (i, node) { return 0.5; },
                        vLineWidth: function (i, node) { return 0.5; },
                        hLineColor: function (i, node) { return '#e5e7eb'; },
                        vLineColor: function (i, node) { return '#e5e7eb'; },
                        paddingLeft: function (i) { return 2; },
                        paddingRight: function (i, node) { return 2; },
                        paddingTop: function (i, node) { return 2; },
                        paddingBottom: function (i, node) { return 2; }
                    },
                    margin: [0, 0, 0, 15] // Margin bottom
                });
            }
        });
    };

    // --- SECTIONS ---

    // We scrape all tables from #vigas_general
    // This allows us to maintain the dynamic order and content of the UI
    addTableFromDOM('vigas_general', 'Resultados');


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
        pageOrientation: 'landscape',
        pageMargins: [20, 60, 20, 40], // Slim margins

        header: (currentPage, pageCount) => {
            const cols = [];
            if (logoData) {
                cols.push({ image: logoData.dataURL, width: 100, margin: [20, 10, 0, 0] });
            }
            cols.push({
                stack: [
                    { text: "DISEÑO DE VIGAS DE CONCRETO ARMADO", bold: true, fontSize: 12, alignment: 'right' },
                    { text: `Fecha: ${new Date().toLocaleDateString('es-PE')}`, alignment: 'right', fontSize: 9 },
                    { text: "Rizabal & Asociados", alignment: 'right', fontSize: 9, color: 'gray' }
                ],
                margin: [10, 15, 20, 0],
                alignment: 'right'
            });

            return {
                columns: cols
            };
        },

        footer: (currentPage, pageCount) => {
            return {
                margin: [20, 10],
                columns: [
                    { text: 'Generado por Sistema de Cálculo', style: 'footer', alignment: 'left' },
                    { text: `Página ${currentPage} de ${pageCount}`, style: 'footer', alignment: 'right' }
                ]
            };
        },

        content: content,

        styles: {
            sectionTitle: {
                fontSize: 10,
                bold: true,
                color: '#1f2937',
                margin: [0, 5, 0, 5]
            },
            tableHeader: {
                bold: true,
                fontSize: 7,
                color: 'white',
                alignment: 'center'
            },
            tableCell: {
                fontSize: 7,
                color: 'black'
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