import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts",
            name: "fern-docs-badges",
        },
    },
    plugins: [react()],
});
