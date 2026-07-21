import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import { glob } from "glob";
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import fs from 'fs';

// Stub para el builtin "module" de Node que el glue emscripten de
// @mlightcad/libredwg-web referencia en una rama solo-Node (código muerto en el
// navegador). Ver resources/js/shims/empty-node-module.js.
const emptyNodeModuleShim = resolve(__dirname, 'resources/js/shims/empty-node-module.js');

// Copy worker files from @mlightcad packages to public output
const copyWorkers = () => {
    const workerFiles = [
        {
            from: resolve(__dirname, 'node_modules/@mlightcad/data-model/dist/dxf-parser-worker.js'),
            toPublic: resolve(__dirname, 'public/assets/dxf-parser-worker.js'),
            toBuild: resolve(__dirname, 'public/build/assets/assets/dxf-parser-worker.js')
        },
        {
            from: resolve(__dirname, 'node_modules/@mlightcad/cad-simple-viewer/dist/libredwg-parser-worker.js'),
            toPublic: resolve(__dirname, 'public/assets/libredwg-parser-worker.js'),
            toBuild: resolve(__dirname, 'public/build/assets/assets/libredwg-parser-worker.js')
        },
        {
            from: resolve(__dirname, 'node_modules/@mlightcad/cad-simple-viewer/dist/mtext-renderer-worker.js'),
            toPublic: resolve(__dirname, 'public/assets/mtext-renderer-worker.js'),
            toBuild: resolve(__dirname, 'public/build/assets/assets/mtext-renderer-worker.js')
        }
    ];

    const copyWorkerFiles = () => {
        workerFiles.forEach(({ from, toPublic, toBuild }) => {
            if (!fs.existsSync(from)) {
                return;
            }

            [toPublic, toBuild].forEach((destination) => {
                const dir = dirname(destination);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.copyFileSync(from, destination);
            });
        });
    };

    return {
        name: 'copy-mlightcad-workers',
        configureServer() {
            copyWorkerFiles();
        },
        closeBundle() {
            copyWorkerFiles();
        }
    };
};

export default defineConfig({
    plugins: [
        vue(),
        laravel({
            input: [
                "resources/css/app.css",
                "resources/css/predim.css",
                "resources/css/espectroStyle.css",
                ...glob.sync("resources/js/*.js").filter(f => !f.includes('memoria_calculo') && !f.includes('index-deprecated')),
                "resources/js/espectro-sismico/index.js",
                "resources/js/predim/index.js",
                "resources/js/predim/ribbon-adapter.js",
                ...glob.sync("resources/js/cav2/*.js"),
                "resources/css/columnaII.css",
                "resources/js/columnav2/adm_columnav2.js",
                "resources/js/documentos/memoria_calculo/index-refactored.js",
                ...glob.sync("resources/js/muros-contencion/*.js"),
                "resources/js/etabs/main.js",
                "resources/js/documentos/memoria_descriptiva/index-refactored-md.js",
            ],

            refresh: true,
            exclude: ['resources/img/**'],
        }),
        copyWorkers(),
    ],
    // libredwg-web (conversor DWG→DXF que carga el módulo CAD bajo demanda al
    // importar un plano .dwg) trae dentro un `await import("module")` de
    // emscripten guardado por ENVIRONMENT_IS_NODE. Es código muerto en el
    // navegador, pero el pre-bundler (esbuild) de Vite lo analiza estáticamente
    // y falla. Excluyéndolo, Vite lo sirve como ESM nativo y esa rama nunca se
    // evalúa en el browser. El WASM va embebido (data-URI), no necesita servirse.
    optimizeDeps: {
        exclude: ['@mlightcad/libredwg-web'],
    },
    resolve: {
        alias: {
            // Redirige el builtin "module" (Node) a un stub vacío para que el
            // bundle browser de libredwg-web no rompa al analizarlo. Ver el
            // comentario en optimizeDeps arriba.
            module: emptyNodeModuleShim,
        },
    },
    build: {
        rollupOptions: {
            context: "window",
            external: ['paper'],
            moduleContext: {
                "./node_modules/pdfmake/build/vfs_fonts.js": "window",
            },
        },
    },
    server: {
        host: 'localhost',
        port: 5173,
    },
});
