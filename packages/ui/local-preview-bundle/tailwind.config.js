const baseConfig = require("../tailwind/tailwind.config.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
    ...baseConfig,
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "../app/src/**/*.{ts,tsx}",
        "../tailwind/tailwind.config.js",
    ],
};
