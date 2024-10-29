import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
        },
    },
    plugins: [
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
