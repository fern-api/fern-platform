const baseConfig = require("../tailwind.config.cjs");
const path = require("path");

/** @type {import('tailwindcss').Config} */
export default {
    ...baseConfig,
    content: [
        "./src/pages/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
        path.join(path.dirname(require.resolve("@fern-ui/docs-fe")), "**/*.{ts,tsx}"),
        path.join(path.dirname(require.resolve("@fern-ui/components")), "**/*.{ts,tsx}"),
        path.join(path.dirname(require.resolve("@fern-ui/chatbot")), "**/*.{ts,tsx}")
    ]
};
