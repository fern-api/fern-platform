import path from "path";
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        path.join(path.dirname(require.resolve("@fern-ui/components")), "**/*.{ts,tsx}"),
        path.join(path.dirname(require.resolve("@fern-ui/fern-docs-syntax-highlighter")), "**/*.{ts,tsx}"),
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--grayscale-1)",
                foreground: "var(--grayscale-12)",
                card: {
                    DEFAULT: "var(--grayscale-1)",
                    foreground: "var(--accent-12)",
                },
                popover: {
                    DEFAULT: "var(--grayscale-1)",
                    foreground: "var(--accent-12)",
                },
                primary: {
                    DEFAULT: "var(--accent-6)",
                    foreground: "var(--accent-12)",
                },
                secondary: {
                    DEFAULT: "var(--grayscale-a3)",
                    foreground: "var(--accent-12)",
                },
                muted: {
                    DEFAULT: "var(--grayscale-a3)",
                    foreground: "var(--accent-12)",
                },
                accent: {
                    DEFAULT: "var(--grayscale-a3)",
                    foreground: "var(--accent-12)",
                },
                destructive: {
                    DEFAULT: "var(--red-10)",
                    foreground: "var(--red-12)",
                },
                border: "var(--grayscale-a6)",
                input: "var(--grayscale-a6)",
                ring: "var(--accent-6)",
                chart: {
                    "1": "var(--accent-6)",
                    "2": "var(--accent-6)",
                    "3": "var(--accent-6)",
                    "4": "var(--accent-6)",
                    "5": "var(--accent-6)",
                },
                sidebar: {
                    DEFAULT: "var(--grayscale-1)",
                    foreground: "var(--grayscale-12)",
                    primary: "var(--grayscale-1)",
                    "primary-foreground": "var(--accent-12)",
                    accent: "var(--grayscale-1)",
                    "accent-foreground": "var(--accent-12)",
                    border: "var(--grayscale-a6)",
                    ring: "var(--accent-6)",
                },
            },
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
                '[type="search"]::-webkit-search-decoration': { display: "none" },
                '[type="search"]::-webkit-search-cancel-button': { display: "none" },
                '[type="search"]::-webkit-search-results-button': { display: "none" },
                '[type="search"]::-webkit-search-results-decoration': { display: "none" },
            });
        }),
    ],
};
export default config;
