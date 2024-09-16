const baseConfig = require("../tailwind.config.cjs");

/** @type {import('tailwindcss').Config} */
export default {
    ...baseConfig,
    content: ["./src/**/*.{ts,tsx}"],
    corePlugins: {
        preflight: false,
    },
};
