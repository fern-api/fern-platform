const baseConfig = require("../tailwind.config.js");
const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
    ...baseConfig,
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "../app/src/**/*.{ts,tsx}",
        "../tailwind.config.js",
        path.join(path.dirname(require.resolve("@fern-ui/ui")), "**/*.{ts,tsx}"),
        path.join(path.dirname(require.resolve("@fern-ui/components")), "**/*.{ts,tsx}"),
        path.join(path.dirname(require.resolve("@fern-ui/fern-docs-syntax-highlighter")), "**/*.{ts,tsx}"),
    ],
};
