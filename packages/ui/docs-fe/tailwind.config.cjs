const baseConfig = require("../../../tailwind.config.cjs");
const path = require("path");

/** @type {import('tailwindcss').Config} */
export default {
    ...baseConfig,
    content: [
        "./src/**/*.{ts,tsx}",
        path.join(path.dirname(require.resolve("@fern-ui/components")), "**/*.{ts,tsx}"),
        path.join(path.dirname(require.resolve("@fern-ui/chatbot")), "**/*.{ts,tsx}"),
    ],
};
