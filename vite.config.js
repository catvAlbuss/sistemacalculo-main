import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import { glob } from "glob";

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/css/predim.css",
                ...glob.sync("resources/js/*.js"),
                "resources/js/predim/ribbon-adapter.js",
                ...glob.sync("resources/js/cav2/*.js"),
                ...glob.sync("resources/js/memoria_calculo/*.js"),
                ...glob.sync("resources/js/muros-contencion/*.js"),
            ],
            refresh: true,
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
    // server: {
    //     host: "0.0.0.0",
    //     cors: true,
    //     hmr: {
    //         host: "0.0.0.0",
    //     },
    // },
});
