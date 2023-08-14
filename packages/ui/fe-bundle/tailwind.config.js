/** @type {import('tailwindcss').Config} */

module.exports = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "../app/src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            fontSize: {
                base: ["0.9575rem", { lineHeight: "1.3rem" }],
            },
            listStyleImage: {
                "dash-dark": 'url("/dash-dark.svg")',
                "dash-light": 'url("/dash-light.svg")',
            },
            minWidth: {
                sm: "24rem",
                md: "28rem",
                lg: "32rem",
                xl: "36rem",
            },
        },
        colors: ({ colors }) => {
            return {
                ...colors,
                accentPrimary: withOpacity("--accent-primary"),
                accentHighlight: "rgba(var(--accent-primary), 10%)",

                // New design system

                "intent-default": "rgb(156, 163, 175)",

                "background-primary-dark": "rgb(3, 7, 18)",
                "background-primary-light": "rgb(255, 255, 255)",
                "background-secondary-dark": "rgb(17, 24, 39)",
                "background-secondary-light": "rgb(249, 250, 251)",
                "background-tertiary-dark": "rgb(31, 41, 55)",
                "background-tertiary-light": "rgb(243, 244, 246)",

                "background-dark": "rgb(17, 20, 24)",
                "background-light": "rgb(249, 250, 251)",

                "background-hover-dark": "rgba(151, 90, 90, 0.05)",
                "background-hover-light": "rgba(3, 7, 18, 0.05)",

                "border-default-dark": "rgba(156, 163, 175, 30%)",
                "border-default-light": "rgba(72, 72, 72, 0.15)",
                "border-primary": "rgba(var(--accent-primary), 30%)",

                "text-primary-dark": "rgb(255, 255, 255)",
                "text-primary-light": "rgb(3,7,18)",
                "text-muted-light": "rgb(107, 114, 128)",
                "text-muted-dark": "rgb(156, 163, 175)",
                "text-disabled-light": "rgb(209, 213, 219)",
                "text-disabled-dark": "rgb(107, 114, 128)",

                "tag-default-dark": "rgba(255, 255, 255, 15%)",
                "tag-default-light": "rgba(3, 7, 18, 5%)",
                tagPrimary: "rgba(var(--accent-primary), 15%)",
            };
        },
    },
    plugins: [require("@tailwindcss/typography")],
};

// https://stackoverflow.com/a/72831219/4238485
function withOpacity(variableName) {
    return ({ opacityValue }) => {
        if (opacityValue !== undefined) {
            return `rgba(var(${variableName}), ${opacityValue})`;
        }
        return `rgb(var(${variableName}))`;
    };
}
