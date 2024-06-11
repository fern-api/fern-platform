import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
    vite: {
        build: {
            minify: false,
        },
    },
    integrations: [
        // react(),
        tailwind(),
    ],
});
