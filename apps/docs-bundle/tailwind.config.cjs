const baseConfig = require("../tailwind.config.cjs");

/** @type {import('tailwindcss').Config} */
export default {
    ...baseConfig,
    content: [
        "./src/pages/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
        "./node_modules/@fern-ui/ui/src/**/*.{ts,tsx}",
        "./node_modules/@fern-ui/components/src/**/*.{ts,tsx}",
        "./node_modules/@fern-ui/chatbot/src/**/*.{ts,tsx}"
    ]
};
