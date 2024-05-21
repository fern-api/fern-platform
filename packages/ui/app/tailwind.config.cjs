const baseConfig = require("../tailwind.config.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
    ...baseConfig,
    content: [
        "./src/**/*.{ts,tsx}",
        "../tailwind.config.js",
        "./node_modules/@fern-ui/components/**/*.{ts,tsx,js,jsx}",
        path.join(path.dirname(require.resolve("@fern-ui/components")), "**/*.{js,jsx,ts,tsx}")
    ]
};
