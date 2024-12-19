const baseConfig = require("../tailwind.config.js");
const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
    ...baseConfig,
    content: [
        "./src/**/*.{ts,tsx}",
        "../tailwind.config.cjs",
        path.join(
            path.dirname(require.resolve("@fern-docs/components")),
            "**/*.{ts,tsx}"
        ),
        path.join(
            path.dirname(require.resolve("@fern-docs/search-ui")),
            "src/components/**/*.{ts,tsx}"
        ),
    ],
};
