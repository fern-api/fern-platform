const baseConfig = require("../tailwind.config.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
    ...baseConfig,
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "../app/src/**/*.{js,ts,ts,tsx,mdx}",
        "../tailwind.config.js",
    ],
    purge: {
        content: ["./src/**/*.{js,jsx,ts,tsx,mdx}", "../app/src/**/*.{js,ts,ts,tsx,mdx}"],
    },
};
