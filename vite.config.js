import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import { glob } from "glob";
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import fs from 'fs';

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
                ...glob.sync("resources/js/memoria_calculo/*.js").filter(f => !f.includes('index-deprecated')),
...glob.sync("resources/js/muros-contencion/*.js"),
                "resources/js/etabs/main.js",
                "resources/js/documentos/memoria_descriptiva/index.js",
                "resources/js/documentos/memoria_descriptiva/memoria_descriptiva_export.js",
            ],

            refresh: true,
            exclude: ['resources/img/**'],
        }),
        copyWorkers(),
    ],
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