import { createRequire } from "node:module";
import path from "node:path";
import baseConfig from "../tailwind.config.js";

const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
    ...baseConfig,
    content: [
        "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
        "../tailwind.config.js",
        path.join(path.dirname(require.resolve("@fern-ui/components")), "**/*.{ts,tsx}"),
    ],
};
