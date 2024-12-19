import path from "path";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        path.join(
            path.dirname(require.resolve("@fern-docs/components")),
            "**/*.{ts,tsx}"
        ),
        path.join(
            path.dirname(require.resolve("@fern-docs/syntax-highlighter")),
            "**/*.{ts,tsx}"
        ),
    ],
    theme: {
        extend: {
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: "unset",
                    },
                },
            },
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        require("tailwindcss-animate"),
        plugin(({ addBase }) => {
            addBase({
                '[type="search"]::-webkit-search-decoration': {
                    display: "none",
                },
                '[type="search"]::-webkit-search-cancel-button': {
                    display: "none",
                },
                '[type="search"]::-webkit-search-results-button': {
                    display: "none",
                },
                '[type="search"]::-webkit-search-results-decoration': {
                    display: "none",
                },
            });
        }),
    ],
};
export default config;
