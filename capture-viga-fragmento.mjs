import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";

const VIEWPORT = {
    width: 1600,
    height: 1200,
    deviceScaleFactor: 2,
};

function construirLinksCSS(stylesheets = []) {
    return stylesheets
        .filter(Boolean)
        .map((href) => `<link rel="stylesheet" href="${href}">`)
        .join("\n");
}

function construirHTMLCaptura({ html, stylesheets = [], inlineStyles = "" }) {
    const stylesheetLinks = construirLinksCSS(stylesheets);

    return `<!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              ${stylesheetLinks}
              ${inlineStyles}
              <style>
                body {
                  margin: 0;
                  padding: 24px;
                  background: #0f172a;
                }

                #vigasgn {
                  background: #0f172a;
                }

                table {
                  border-collapse: collapse;
                  width: 100%;
                }

                tr {
                  background: inherit;
                }

                td, th {
                  border-color: #374151;
                }

                img, svg, canvas {
                  max-width: 100%;
                }

                .no-print,
                #btn_pdf_predim,
                #btn_captura_resultado {
                  display: none !important;
                }
              </style>
            </head>
            <body>
              <div style="width:1200px; margin:auto;">
                ${html}
              </div>
            </body>
            </html>
            `;
}

async function leerJSON(jsonPath) {
    const raw = await fs.readFile(jsonPath, "utf8");
    return JSON.parse(raw);
}

async function prepararDirectorioSalida(outputFile) {
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
}

async function capturarElemento(page, selector, outputFile) {
    const element = await page.waitForSelector(selector, {
        visible: true,
        timeout: 30000,
    });

    await element.screenshot({
        path: outputFile,
        type: "png",
    });
}

async function run() {
    const jsonPath = process.argv[2];
    const outputFile = process.argv[3];

    if (!jsonPath) {
        throw new Error("Falta la ruta del JSON.");
    }

    if (!outputFile) {
        throw new Error("Falta la ruta del archivo de salida.");
    }

    const data = await leerJSON(jsonPath);
    await prepararDirectorioSalida(outputFile);

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: VIEWPORT,
    });

    try {
        const page = await browser.newPage();
        const html = construirHTMLCaptura(data);

        await page.setContent(html, {
            waitUntil: "networkidle0",
            timeout: 60000,
        });

        // Espera corta para estabilizar fuentes/estilos
        await page.waitForSelector("#vigasgn", {
            visible: true,
            timeout: 30000,
        });

        await new Promise((resolve) => setTimeout(resolve, 600));

        await capturarElemento(page, "#vigasgn", outputFile);

        console.log("IMAGEN GENERADA:", outputFile);
    } finally {
        await browser.close();
    }
}

run().catch((err) => {
    console.error("ERROR EN CAPTURA:", err);
    process.exit(1);
});
