import { defineConfig } from "vite";
import simpleHtmlPlugin from "vite-plugin-simple-html";

export default defineConfig({
    root: "src/",
    build: {
        outDir: "../dist/",
        emptyOutDir: true,
    },
    plugins: [
        simpleHtmlPlugin({
            minify: true,
        }),
    ],
});