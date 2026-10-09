import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import { build } from "vite";

const require = createRequire(import.meta.url);
const pdfMake = require("pdfmake/build/pdfmake");
pdfMake.addVirtualFileSystem(require("pdfmake/build/vfs_fonts"));

const runtimeUrl = new URL("../../resources/js/predim/app/shared-runtime.js", import.meta.url);
const source = readFileSync(runtimeUrl, "utf8");
// Ejecutar el mismo manejador de exportación sin inicializar las herramientas del canvas.
const handlerSource = source.slice(
  source.indexOf('bindElementIfExists("btn_pdf_predim"'),
  source.indexOf('$(document).ready', source.indexOf('bindElementIfExists("btn_pdf_predim"')),
);
const logoUrl = new URL(source.match(/^import imgurl from "([^"]+)";/m)[1], runtimeUrl);
const logoImport = fileURLToPath(logoUrl).replaceAll("\\", "/") + logoUrl.search;

async function bundledLogo() {
  const result = await build({
    configFile: false,
    logLevel: "silent",
    plugins: [{
      name: "pdf-logo-test",
      resolveId: (id) => id.endsWith("pdf-logo-test") ? "\0pdf-logo-test" : undefined,
      load: (id) => id === "\0pdf-logo-test"
        ? `export { default } from ${JSON.stringify(logoImport)};`
        : undefined,
    }],
    build: {
      write: false,
      lib: { entry: "pdf-logo-test", formats: ["es"] },
    },
  });
  const output = Array.isArray(result) ? result[0].output : result.output;
  const chunk = output.find((item) => item.type === "chunk");
  const module = await import(`data:text/javascript;base64,${Buffer.from(chunk.code).toString("base64")}`);
  assert.match(module.default, /^data:image\/png;base64,/);
  return module.default;
}

function setupExport({ logo, imageFails = false, pdf = pdfMake }) {
  let exportHandler;
  let filename;
  let generated;
  const alerts = [];
  const errors = [];
  const cells = (values) => values.map((textContent) => ({ textContent }));
  const rows = [
    { parentElement: { tagName: "THEAD" }, querySelectorAll: () => cells(["N°", "Área", "Base"]) },
    { parentElement: { tagName: "TBODY" }, querySelectorAll: () => cells(["1", "12.50", "0.30"]) },
  ];
  const container = {
    querySelector(selector) {
      if (selector === "tbody") return { children: [{}] };
      if (selector === "h3") return { childNodes: [{ textContent: "Columna Rectangular" }] };
      if (selector === "table") return { querySelectorAll: () => rows };
      throw new Error(`Selector inesperado: ${selector}`);
    },
  };
  vm.runInNewContext(handlerSource, {
    imgurl: logo,
    bindElementIfExists: (id, event, handler) => { exportHandler = handler; },
    Image: class {
      width = 560;
      height = 100;
      set src(value) {
        if (imageFails) this.onerror?.();
        else this.onload();
      }
    },
    document: {
      querySelectorAll: () => [container],
      createElement: () => ({ getContext: () => ({ drawImage() {} }), toDataURL: () => logo }),
    },
    pdfMake: {
      createPdf(definition) {
        const document = pdf.createPdf(definition);
        return {
          download(name) {
            filename = name;
            generated = new Promise((resolve) => document.getBuffer(resolve));
          },
        };
      },
    },
    console: { error: (...args) => errors.push(args) },
    alert: (message) => alerts.push(message),
  });
  return {
    run: () => exportHandler(),
    alerts,
    errors,
    get filename() { return filename; },
    get generated() { return generated; },
  };
}

test("predim genera un PDF con tablas, fuentes y logo incrustado sin pedir un PNG al servidor", { timeout: 15000 }, async () => {
  const flow = setupExport({ logo: await bundledLogo() });
  flow.run();
  assert.equal(flow.filename, "Predimensionamiento.pdf");
  const buffer = await flow.generated;
  assert.equal(buffer.subarray(0, 5).toString(), "%PDF-");
  assert.ok(buffer.length > 1000);
  assert.equal(flow.alerts.length, 0);
});

test("predim informa un fallo de imagen en lugar de detener la exportación en silencio", () => {
  const flow = setupExport({ logo: "/build/assets/logo-ausente.png", imageFails: true });
  flow.run();
  assert.equal(flow.filename, undefined);
  assert.equal(flow.alerts.length, 1);
  assert.equal(flow.errors.length, 1);
});

test("predim informa un error al construir el PDF", () => {
  const flow = setupExport({ logo: "data:image/png;base64,test", pdf: { createPdf() { throw new Error("PDF inválido"); } } });
  flow.run();
  assert.equal(flow.filename, undefined);
  assert.equal(flow.alerts.length, 1);
  assert.equal(flow.errors.length, 1);
});
