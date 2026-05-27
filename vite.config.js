import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import { glob } from "glob";

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/css/predim.css",
                ...glob.sync("resources/js/*.js").filter(f => !f.includes('memoria_calculo') && !f.includes('index-deprecated')),
                "resources/js/predim/index.js",
                "resources/js/predim/ribbon-adapter.js",
                ...glob.sync("resources/js/cav2/*.js"),
                ...glob.sync("resources/js/memoria_calculo/*.js").filter(f => !f.includes('index-deprecated')),
                ...glob.sync("resources/js/muros-contencion/*.js"),

                "resources/js/documentos/memoria_descriptiva/index.js",           // 👈 Ya lo tienes
                "resources/js/documentos/memoria_descriptiva/memoria_descriptiva_export.js", // 👈 AGREGA ESTE
            ],

            refresh: true,
            exclude: ['resources/img/**'],
        }),
    ],
    build: {
        rollupOptions: {
            context: "window",
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