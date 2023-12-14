const plugin = require("tailwindcss/plugin");

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
            maxWidth: {
                "8xl": "88rem",
            },
            boxShadow: {
                header: "0px 4px 24px 0px rgba(var(--accent-primary), 10%)",
                "header-dark": "0px 4px 24px 0px rgba(var(--accent-primary-dark), 10%)",
            },
        },
        colors: ({ colors }) => {
            return {
                ...colors,
                "accent-primary": withOpacity("--accent-primary"),
                "accent-primary-dark": withOpacity("--accent-primary-dark"),
                "accent-primary-contrast": withOpacity("--accent-primary-contrast"),
                "accent-primary-dark-contrast": withOpacity("--accent-primary-dark-contrast"),
                "accent-highlight": "rgba(var(--accent-primary), 10%)",
                "accent-highlight-dark": "rgba(var(--accent-primary-dark), 10%)",
                background: withOpacity("--background"),
                "background-dark": withOpacity("--background-dark"),

                "method-get": "#49A68C",
                "method-post": "#487FAB",
                "method-delete": "#E75B4D",
                "method-put": "#E99368",
                "method-patch": "#E99368",
                "method-get-dark": "#A7F3D0",
                "method-post-dark": "#70ABEC",
                "method-delete-dark": "#F87F71",
                "method-put-dark": "#FDBA74",
                "method-patch-dark": "#FDBA74",

                "intent-default": "rgb(156, 163, 175)",
                "intent-warning-dark": "rgb(248, 210, 111)",
                "intent-warning-light": "rgb(217, 119, 6)",
                "intent-success-dark": "rgb(74, 222, 128)",
                "intent-success-light": "rgb(22, 163, 74)",
                "intent-danger-dark": "rgb(248, 113, 113)",
                "intent-danger-light": "rgb(220, 38, 38)",

                "background-primary-dark": "rgb(3, 7, 18)",
                "background-primary-light": "rgb(255, 255, 255)",
                "background-secondary-dark": "rgb(17, 24, 39)",
                "background-secondary-light": "rgb(249, 250, 251)",
                "background-tertiary-dark": "rgb(31, 41, 55)",
                "background-tertiary-light": "rgb(243, 244, 246)",

                "background-hover-dark": "rgba(151, 90, 90, 0.05)",
                "background-hover-light": "rgba(3, 7, 18, 0.05)",

                "border-default-dark": "rgba(156, 163, 175, 0.30)",
                "border-default-light": "rgba(72, 72, 72, 0.15)",
                "border-concealed-dark": "rgba(156, 163, 175, 0.15)",
                "border-concealed-light": "rgba(72, 72, 72, 0.10)",
                "border-primary": "rgba(var(--accent-primary), 0.30)",
                "border-primary-dark": "rgba(var(--accent-primary-dark), 0.30)",
                "border-warning-dark": "rgba(251, 191, 36, 0.30)",
                "border-warning-light": "rgba(217, 119, 6, 0.30)",
                "border-success-dark": "rgba(74, 222, 128, 0.30)",
                "border-success-light": "rgba(22, 163, 74, 0.30)",
                "border-danger-dark": "rgba(248, 113, 113, 0.30)",
                "border-danger-light": "rgba(220, 38, 38, 0.30)",

                "text-primary-dark": "rgb(255, 255, 255)",
                "text-primary-light": "rgb(3,7,18)",
                "text-muted-light": "rgb(107, 114, 128)",
                "text-muted-dark": "rgb(169, 175, 181)",
                "text-disabled-light": "rgb(209, 213, 219)",
                "text-disabled-dark": "rgb(107, 114, 128)",

                "tag-default-dark": "rgba(255, 255, 255, 15%)",
                "tag-default-light": "rgba(3, 7, 18, 5%)",
                "tag-primary": "rgba(var(--accent-primary), 15%)",
                "tag-primary-dark": "rgba(var(--accent-primary-dark), 15%)",
                "tag-warning-dark": "rgba(251, 190, 36, 0.15)",
                "tag-warning-light": "rgba(217, 119, 6, 0.10)",
                "tag-success-dark": "rgba(74, 222, 128, 0.15)",
                "tag-success-light": "rgba(22, 163, 74, 0.15)",
                "tag-danger-light": "rgba(220, 38, 38, 0.10)",
                "tag-danger-dark": "rgba(248, 113, 113, 0.15)",
            };
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        // Defining the classes here to get proper intellisense
        // https://github.com/tailwindlabs/tailwindcss-intellisense/issues/227#issuecomment-1269592872
        plugin(({ addComponents }) => {
            addComponents({
                // Text
                ".t-primary": {
                    "@apply text-text-primary-light dark:text-text-primary-dark": {},
                },
                ".t-muted": {
                    "@apply text-text-muted-light dark:text-text-muted-dark": {},
                },
                ".t-success": {
                    "@apply text-intent-success-light dark:text-intent-success-dark": {},
                },
                ".t-warning": {
                    "@apply text-intent-warning-light dark:text-intent-warning-dark": {},
                },
                ".t-danger": {
                    "@apply text-intent-danger-light dark:text-intent-danger-dark": {},
                },
                // Background
                ".bg-tag-default": {
                    "@apply bg-tag-default-light dark:bg-tag-default-dark": {},
                },
                ".bg-tag-success": {
                    "@apply bg-tag-success-light dark:bg-tag-success-dark": {},
                },
                ".bg-tag-warning": {
                    "@apply bg-tag-warning-light dark:bg-tag-warning-dark": {},
                },
                ".bg-tag-danger": {
                    "@apply bg-tag-danger-light dark:bg-tag-danger-dark": {},
                },
                // Border
                ".border-concealed": {
                    "@apply border-border-concealed-light dark:border-border-concealed-dark": {},
                },
                ".border-default": {
                    "@apply border-border-default-light dark:border-border-default-dark": {},
                },
                ".border-success": {
                    "@apply border-border-success-light dark:border-border-success-dark": {},
                },
                ".border-warning": {
                    "@apply border-border-warning-light dark:border-border-warning-dark": {},
                },
                ".border-danger": {
                    "@apply border-border-danger-light dark:border-border-danger-dark": {},
                },
            });
        }),
    ],
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
