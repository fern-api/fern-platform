const baseConfig = require("../tailwind.config.js");
const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../tailwind.config.js",
    path.join(
      path.dirname(require.resolve("@fern-docs/components")),
      "**/*.{ts,tsx}"
    ),
    path.join(
      path.dirname(require.resolve("@fern-docs/syntax-highlighter")),
      "**/*.{ts,tsx}"
    ),
    path.join(
      path.dirname(require.resolve("@fern-docs/search-ui")),
      "**/*.{ts,tsx}"
    ),
  ],
};
